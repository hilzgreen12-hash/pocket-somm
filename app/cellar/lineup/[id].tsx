import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator, Keyboard } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../../../src/utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLineupArchive, lineupSignedUrl, setLineupNote, updateLineupStamp, setLineupWines, setLineupRestaurant, setLineupName, replaceLineupImage, type LineupWine } from '../../../src/api/lineups';
import * as ImagePicker from 'expo-image-picker';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { useScanHistory } from '../../../src/hooks/useScanHistory';
import { detectLineup, prepareImageBase64, fetchAutoLabelUri } from '../../../src/api/label';
import { matchLineupToCellar, archiveBottles } from '../../../src/services/archiveNight';
import { wineNameKey } from '../../../src/utils/wineIdentity';
import { DateInput } from '../../../src/components/DateInput';
import { labelSignedUrl } from '../../../src/api/labelPhotos';
import { File, Paths } from 'expo-file-system';
import { LineupShareCard } from '../../../src/components/LineupShareCard';
import { LabelPhotoViewer } from '../../../src/components/LabelPhotoViewer';
import { withBordeauxInfo } from '../../../src/constants/bordeauxClassification';
import { Ionicons } from '@expo/vector-icons';
import { MicButton } from '../../../src/components/MicButton';
import { showAlert } from '../../../src/components/AppAlert';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { useCellar } from '../../../src/hooks/useCellar';
import { useChosenWines } from '../../../src/hooks/useChosenWines';
import { useLabels } from '../../../src/hooks/useLabels';
import { findWineConnections } from '../../../src/utils/wineConnections';
import { generateWineIntel } from '../../../src/services/pricing';
import { useLabelStore } from '../../../src/stores/labelStore';
import { useLastIntelStore } from '../../../src/stores/lastIntelStore';
import { usePreferences } from '../../../src/hooks/usePreferences';
import { SearchProgress } from '../../../src/components/SearchProgress';
import { Modal } from 'react-native';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

export default function LineupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const { session } = useAuth();

  const { data: lineup, isLoading } = useQuery({
    queryKey: ['lineup', id],
    queryFn: () => getLineupArchive(id!),
    enabled: !!id,
  });

  const { preferences } = usePreferences();
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const [genIntel, setGenIntel] = useState(false);
  // Where this lineup review/intel flow should return to on Back.
  const backToLineup = `&backTo=${encodeURIComponent(`/cellar/lineup/${id}`)}`;

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [replacingPhoto, setReplacingPhoto] = useState(false);
  // Editable lineup name (tap the title). Falls back to "Your Lineup".
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  // The note reads as plain text once saved; editing opens a popup with the
  // input, and saving converts it back to text.
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  // Free-text venue (restaurant / bar / home), edited inline via the pin field.
  const [venue, setVenue] = useState('');
  // Shows a subtle "Done" beneath the inline venue while it's being edited, so
  // there's a clear way to confirm and dismiss the keyboard.
  const [venueFocused, setVenueFocused] = useState(false);
  const hydrated = useRef(false);
  useEffect(() => {
    if (lineup && !hydrated.current) {
      hydrated.current = true;
      setNote(lineup.note ?? '');
      setVenue(lineup.venue ?? '');
      lineupSignedUrl(lineup.image_path).then(setPhotoUrl);
    }
  }, [lineup]);

  function openNameEdit() {
    if (!lineup) return;
    setNameDraft(lineup.name ?? '');
    setNameOpen(true);
  }
  async function saveName() {
    if (!lineup || savingName) return;
    setSavingName(true);
    try {
      await setLineupName(lineup.id, nameDraft);
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      setNameOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingName(false);
    }
  }

  async function saveVenue() {
    if (!lineup) return;
    if ((venue.trim() || null) === (lineup.venue?.trim() || null)) return; // unchanged
    try {
      await updateLineupStamp(lineup.id, { venue });
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
    } catch (err) {
      showAlert({ title: 'Could not save venue', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Edit the date + location stamp (tap the stamp below the photo).
  const [stampOpen, setStampOpen] = useState(false);
  const [dateDraft, setDateDraft] = useState('');
  const [cityDraft, setCityDraft] = useState('');
  const [savingStamp, setSavingStamp] = useState(false);

  function openStampEdit() {
    if (!lineup) return;
    // Seed from LOCAL date parts (not UTC) so the pre-filled draft matches the
    // displayed stamp — avoids an off-by-one for rows saved near midnight.
    const d = new Date(lineup.archived_at);
    const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setDateDraft(local);
    setCityDraft(lineup.city ?? '');
    setStampOpen(true);
  }
  async function saveStamp() {
    if (!lineup || savingStamp) return;
    const ymd = dateDraft.trim();
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(ymd) && !Number.isNaN(new Date(ymd).getTime());
    // A non-empty but malformed date must not silently save nothing — tell the
    // user rather than closing as if it worked. (Empty = leave the date as-is.)
    if (ymd && !valid) {
      showAlert({ title: 'Check the date', body: 'Please enter a valid date.' });
      return;
    }
    setSavingStamp(true);
    try {
      await updateLineupStamp(lineup.id, {
        archivedAt: valid ? new Date(`${ymd}T12:00:00`).toISOString() : undefined,
        city: cityDraft,
      });
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      setStampOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingStamp(false);
    }
  }

  // For linking each identified wine to its reviews / cellar entry (like the
  // Label Library), vintage-agnostic via findWineConnections.
  const { wines: cellarWines } = useCellar();
  const { chosenWines } = useChosenWines();
  const { labels } = useLabels();
  const { archive: restaurantArchive } = useScanHistory();

  // Match this lineup to a restaurant review in Your Restaurants (scan_sessions).
  const [restaurantPickerOpen, setRestaurantPickerOpen] = useState(false);
  const [savingMatch, setSavingMatch] = useState(false);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  // The user can say this lineup has no matching review — dismissed locally so
  // the prompt stays hidden for THIS lineup. Loaded once the id is known.
  const [noMatchDismissed, setNoMatchDismissed] = useState(false);
  const matchedRestaurant = lineup?.restaurant_session_id
    ? restaurantArchive.find((a) => a.id === lineup.restaurant_session_id) ?? null
    : null;

  async function matchRestaurant(sessionId: string | null) {
    if (!lineup || savingMatch) return;
    setSavingMatch(true);
    try {
      await setLineupRestaurant(lineup.id, sessionId);
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      setRestaurantPickerOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingMatch(false);
    }
  }

  const noMatchKey = `lineup-nomatch-${id}`;
  useEffect(() => {
    AsyncStorage.getItem(noMatchKey).then((v) => setNoMatchDismissed(!!v)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  async function dismissNoMatch() {
    try { await AsyncStorage.setItem(noMatchKey, '1'); } catch { /* non-fatal */ }
    setNoMatchDismissed(true);
    setRestaurantPickerOpen(false);
  }
  // Remove the match and bring the "Match to a review?" question back.
  async function unmatchLineup() {
    try { await AsyncStorage.removeItem(noMatchKey); } catch { /* non-fatal */ }
    setNoMatchDismissed(false);
    await matchRestaurant(null);
  }

  // Restaurant reviews filtered by the picker's search box.
  const filteredRestaurants = restaurantArchive.filter((a) => {
    const q = restaurantSearch.trim().toLowerCase();
    if (!q) return true;
    return (a.restaurantName ?? '').toLowerCase().includes(q) || (a.city ?? '').toLowerCase().includes(q);
  });

  // "Identify wines" — Vinster reads the archived photo, then the user confirms.
  const [identifying, setIdentifying] = useState(false);
  const [confirmWines, setConfirmWines] = useState<LineupWine[] | null>(null);
  const [included, setIncluded] = useState<Set<number>>(new Set());
  const [savingWines, setSavingWines] = useState(false);

  // Per-wine manual edit (replaces whole-photo re-identify): correct one bottle's
  // producer / name / vintage in place and persist the lineup's wines list.
  const [editWineIndex, setEditWineIndex] = useState<number | null>(null);
  const [editProducer, setEditProducer] = useState('');
  const [editName, setEditName] = useState('');
  const [editVintage, setEditVintage] = useState('');
  const [savingWineEdit, setSavingWineEdit] = useState(false);

  function openWineEdit(index: number, w: LineupWine) {
    setEditWineIndex(index);
    setEditProducer(w.producer ?? '');
    setEditName(w.wine_name ?? '');
    setEditVintage(w.vintage != null ? String(w.vintage) : '');
  }

  // Add/View Review → the wine's review in Your Wine Reviews (one canonical
  // place), with Back returning to THIS lineup. Cellar bottles open their cellar
  // review; off-cellar wines open the existing chosen review or a seeded new one.
  function goToWineReview(w: LineupWine, conn: ReturnType<typeof findWineConnections>) {
    const hasReview = conn.reviewCount > 0;
    if (w.cellar_wine_id) {
      const param = hasReview ? 'openCellarReview' : 'openCellarReviewInput';
      router.push(`/wines/chosen?${param}=${w.cellar_wine_id}${backToLineup}` as any);
      return;
    }
    const chosen = [...conn.reviewedChosen].sort(
      (a, b) => new Date(b.chosen_at ?? 0).getTime() - new Date(a.chosen_at ?? 0).getTime(),
    )[0];
    if (chosen) { router.push(`/wines/chosen?openReview=${chosen.id}${backToLineup}` as any); return; }
    router.push(`/wines/chosen?seedAdd=1&sp=${encodeURIComponent(w.producer ?? '')}&sw=${encodeURIComponent(w.wine_name ?? '')}&sv=${encodeURIComponent(w.vintage != null ? String(w.vintage) : '')}${backToLineup}` as any);
  }

  // View Wine Intel → generate on demand and open the intel card. Lineup wines
  // have no label photo, so clear the shared image (avoids showing a stale one).
  async function viewLineupWineIntel(w: LineupWine) {
    // Fill classification + appellation for a classified Bordeaux château so the
    // intel card is complete even though the lineup carried neither.
    const details = withBordeauxInfo({
      producer: w.producer ?? '',
      region: '',
      wineName: w.wine_name || null,
      vintage: w.vintage != null ? String(w.vintage) : 'NV',
    });
    setGenIntel(true);
    try {
      const intel = await generateWineIntel(details as any, currency);
      const ls = useLabelStore.getState();
      // Give the intel card a thumbnail like every other generate-intel flow:
      // reuse the matched cellar wine's own label photo if it has one, else
      // auto-fetch a web label. (Best-effort — a miss just leaves it photoless.)
      let img: string | null = null;
      if (w.cellar_wine_id) {
        const cw = cellarWines.find((c) => c.id === w.cellar_wine_id);
        if (cw?.label_image_path) { try { img = await labelSignedUrl(cw.label_image_path); } catch { /* fall through */ } }
      }
      if (!img) img = await fetchAutoLabelUri(w.producer, w.wine_name);
      ls.setImageUri(img);
      ls.setWineDetailsConfirmed(details as any);
      ls.setIntelligence(intel);
      useLastIntelStore.getState().setLast(details as any, intel);
      // confirmed=1: this wine is already established in the lineup — the intel
      // screen must NOT ask "which wine is this?".
      router.push(`/label/results?context=intel&confirmed=1${backToLineup}` as any);
    } catch (err) {
      showAlert({ title: 'Could not load intel', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setGenIntel(false);
    }
  }

  async function saveWineEdit() {
    if (!lineup || editWineIndex == null || savingWineEdit) return;
    const current: LineupWine[] = lineup.wines ?? [];
    const next = current.map((w, i) =>
      i === editWineIndex
        ? { ...w, producer: editProducer.trim() || null, wine_name: editName.trim() || editProducer.trim(), vintage: editVintage.trim() || null }
        : w,
    );
    setSavingWineEdit(true);
    try {
      await setLineupWines(lineup.id, next);
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      setEditWineIndex(null);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingWineEdit(false);
    }
  }

  async function identifyWines() {
    if (!lineup || identifying) return;
    setIdentifying(true);
    try {
      const url = photoUrl ?? (await lineupSignedUrl(lineup.image_path));
      if (!url) { showAlert({ title: 'Photo unavailable', body: 'Could not load this lineup’s photo. Please try again.' }); return; }
      // The archived photo lives in Storage — download it locally, then OCR.
      const dest = new File(Paths.cache, `lineup-detect-${lineup.id}.jpg`);
      try { if (dest.exists) dest.delete(); } catch { /* ignore */ }
      const file = await File.downloadFileAsync(url, dest);
      const base64 = await prepareImageBase64(file.uri);
      const { bottles } = await detectLineup(base64);
      if (!bottles.length) {
        showAlert({ title: 'No wines detected', body: 'Vinster couldn’t read any bottles from this photo. A clearer, well-lit shot with the labels in frame works best.' });
        return;
      }
      // Match to the live cellar so confirmed wines carry a cellar link where possible.
      const { matched, unmatched } = matchLineupToCellar(bottles, cellarWines);
      // Keep the photo's left-to-right order: matchLineupToCellar groups all
      // matched wines ahead of unmatched ones, which scrambles the list. Sort
      // every candidate back to where its bottle first appears in the detection.
      const firstIdxForWine = (producer: string | null | undefined, wineName: string | null | undefined) => {
        const kFull = wineNameKey(producer, wineName);
        const kProd = wineNameKey(producer, null);
        const kName = wineNameKey(null, wineName);
        return bottles.findIndex((b) => {
          const bFull = wineNameKey(b.producer, b.wineName);
          if (kFull && bFull === kFull) return true;
          const bProd = wineNameKey(b.producer, null);
          const bName = wineNameKey(null, b.wineName);
          return (!!kProd && (bProd === kProd || bName === kProd)) || (!!kName && (bName === kName || bProd === kName));
        });
      };
      const withIdx = [
        ...matched.map((m) => ({ idx: firstIdxForWine(m.wine.producer, m.wine.wine_name), cand: { producer: m.wine.producer, wine_name: m.wine.wine_name, vintage: m.wine.vintage, cellar_wine_id: m.wine.id, archived: false, count: m.count } as LineupWine })),
        ...unmatched.map((b) => ({ idx: bottles.indexOf(b), cand: { producer: b.producer ?? null, wine_name: b.wineName, vintage: b.vintage, cellar_wine_id: null, archived: false, count: b.quantity ?? 1 } as LineupWine })),
      ];
      withIdx.sort((a, b) => (a.idx < 0 ? 9999 : a.idx) - (b.idx < 0 ? 9999 : b.idx));
      const candidates: LineupWine[] = withIdx.map((x) => x.cand);
      setIncluded(new Set(candidates.map((_, i) => i)));
      setConfirmWines(candidates);
    } catch (err) {
      showAlert({ title: 'Could not identify wines', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setIdentifying(false);
    }
  }

  async function saveIdentifiedWines() {
    if (!lineup || !confirmWines || savingWines) return;
    const kept = confirmWines.filter((_, i) => included.has(i));
    setSavingWines(true);
    try {
      await setLineupWines(lineup.id, kept);
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      setConfirmWines(null);
      // These were drunk that night — offer to archive the ones still live in
      // the cellar so they don't linger as "in cellar".
      const drunk = kept.filter((w) => w.cellar_wine_id && cellarWines.some((c) => c.id === w.cellar_wine_id));
      if (drunk.length) promptArchiveDrunk(drunk);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingWines(false);
    }
  }

  // Archive the cellar bottle(s) behind a lineup wine — moves them from the live
  // cellar into the archive, dated to the night (mirrors Archive a Night).
  async function archiveCellarBottles(list: LineupWine[]): Promise<void> {
    if (!lineup) return;
    const day = (lineup.archived_at ?? '').split('T')[0] || new Date().toISOString().split('T')[0];
    for (const w of list) {
      const cw = cellarWines.find((c) => c.id === w.cellar_wine_id);
      if (cw) await archiveBottles(cw, Math.min(w.count ?? 1, cw.quantity ?? 1), day);
    }
    qc.invalidateQueries({ queryKey: ['cellar', session?.user.id] });
    qc.invalidateQueries({ queryKey: ['cellar-archive', session?.user.id] });
    qc.invalidateQueries({ queryKey: ['slot-assignments'] });
    qc.invalidateQueries({ queryKey: ['rack-slots'] });
  }

  // Prompt (after Identify) to archive the cellar bottles that were drunk.
  function promptArchiveDrunk(list: LineupWine[]) {
    const n = list.reduce((s, w) => s + (w.count ?? 1), 0);
    showAlert({
      title: 'You drank these — archive them?',
      body: `${n} ${n === 1 ? 'bottle is' : 'bottles are'} from your cellar. Move ${n === 1 ? 'it' : 'them'} into your archive now?`,
      buttons: [
        { text: 'Not now', style: 'cancel' },
        { text: 'Archive', onPress: () => { archiveCellarBottles(list).catch((err) => showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' })); } },
      ],
    });
  }

  // "Archive from cellar" on a single lineup wine row.
  function archiveOneLineupWine(w: LineupWine) {
    const cw = cellarWines.find((c) => c.id === w.cellar_wine_id);
    if (!cw) return;
    const label = wineHeaderLine(cw.producer, cw.wine_name, cw.vintage) || cw.wine_name;
    const n = Math.min(w.count ?? 1, cw.quantity ?? 1);
    showAlert({
      title: 'Archive from your cellar?',
      body: `Move ${n} ${n === 1 ? 'bottle' : 'bottles'} of ${label} from your cellar into your archive?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', onPress: () => { archiveCellarBottles([w]).catch((err) => showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' })); } },
      ],
    });
  }


  // Branded share (photo + date + note), mirroring Your Lineup Library.
  const [shareData, setShareData] = useState<{ url: string; date: string; note: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<View>(null);
  const capturedRef = useRef(false);

  function openNoteEditor() {
    setNoteDraft(note);
    setNoteEditorOpen(true);
  }

  async function saveNoteFromEditor() {
    if (!lineup || savingNote) return;
    setSavingNote(true);
    try {
      await setLineupNote(lineup.id, noteDraft);
      setNote(noteDraft);
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      setNoteEditorOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save note', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingNote(false);
    }
  }

  // Replace the lineup photo — pick from the library, upload, repoint image_path.
  async function changeLineupPhoto() {
    if (!lineup || !session?.user.id || replacingPhoto) return;
    if (!(await ensureMediaPermission('library'))) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets?.[0]) return;
    setReplacingPhoto(true);
    try {
      const path = await replaceLineupImage(session.user.id, lineup.id, res.assets[0].uri);
      setPhotoUrl(await lineupSignedUrl(path));
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
    } catch (err) {
      showAlert({ title: 'Could not update photo', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setReplacingPhoto(false);
    }
  }

  async function handleShare() {
    if (!lineup || sharing) return;
    setSharing(true);
    try {
      const url = photoUrl ?? (await lineupSignedUrl(lineup.image_path));
      if (!url) throw new Error('Could not load the lineup photo.');
      capturedRef.current = false;
      setShareData({
        url,
        date: new Date(lineup.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        note: note.trim() || (lineup.note ?? ''),
      });
    } catch (err) {
      setSharing(false);
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }
  async function captureAndShare() {
    if (capturedRef.current || !shareCardRef.current) return;
    capturedRef.current = true;
    try {
      await new Promise((r) => setTimeout(r, 150));
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
      }
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
      setShareData(null);
      capturedRef.current = false;
    }
  }

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>;
  // Reading the lineup photo is a multi-second vision call — show the branded
  // percentage counter (not a dark spinner) so the wait reads as progress.
  if (identifying) return (
    <SearchProgress
      title="Reading your lineup…"
      subtitle="Vinster needs a few seconds"
      body="Vinster is reading each label in your photo. A clear, well-lit shot with the fronts facing forward gives the best results."
      durationMs={30000}
    />
  );
  if (!lineup) return (
    <View style={styles.center}>
      <Text style={styles.muted}>This lineup no longer exists.</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>← Back</Text></TouchableOpacity>
    </View>
  );

  const dateStr = new Date(lineup.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const stamp = [dateStr, lineup.city].filter(Boolean).join(' · ');
  const wines: LineupWine[] = lineup.wines ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Back + Share on their own row, so the stamp's tap area no longer sits
            against the back arrow (which is what hijacked Back into the editor). */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 16 }}>
            <Text accessibilityLabel="Back" style={styles.back}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} disabled={sharing} hitSlop={{ top: 10, bottom: 10, left: 16, right: 10 }}>
            <Text style={[styles.shareText, sharing && { opacity: 0.5 }]}>{sharing ? '…' : 'Export'}</Text>
          </TouchableOpacity>
        </View>
        {/* Screen title — tap to rename this lineup. */}
        <TouchableOpacity onPress={openNameEdit} hitSlop={{ top: 6, bottom: 6, left: 12, right: 12 }} activeOpacity={0.7}>
          <Text style={styles.headerTitle} numberOfLines={1}>{lineup.name?.trim() || 'Your Lineup'}</Text>
        </TouchableOpacity>
        {/* Date · City below the title (tap to edit date/city). */}
        <TouchableOpacity style={styles.headerStampWrap} onPress={openStampEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={styles.headerStamp} numberOfLines={1}>{stamp || 'Add date · location'}</Text>
        </TouchableOpacity>
        {/* Venue — a single centred input beneath the date/location (no pin icon);
            saved on blur/submit. Shows "Input Venue" when empty. */}
        <View style={styles.venueRow}>
          <TextInput
            style={styles.venueInput}
            value={venue}
            onChangeText={setVenue}
            onFocus={() => setVenueFocused(true)}
            onEndEditing={() => { setVenueFocused(false); saveVenue(); }}
            onSubmitEditing={saveVenue}
            placeholder="Input Venue"
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            textAlign="center"
            spellCheck={false}
            autoCorrect={false}
          />
          {venueFocused ? (
            <TouchableOpacity onPress={() => Keyboard.dismiss()} hitSlop={{ top: 6, bottom: 6, left: 10, right: 10 }} activeOpacity={0.7}>
              <Text style={styles.venueDone}>Done</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {/* Once linked, the row becomes a link straight to the matched
            restaurant review card (long-press to re-match); otherwise it opens
            the picker to match this lineup to a review. */}
        {matchedRestaurant ? (
          <View style={styles.matchRowInline}>
            <TouchableOpacity
              onPress={() => router.push(`/restaurants/reviews?openSession=${matchedRestaurant.id}` as any)}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.matchLink} numberOfLines={1}>View Your Matched Restaurant Review</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={unmatchLineup} disabled={savingMatch} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={styles.unmatchLink}>(unmatch)</Text>
            </TouchableOpacity>
          </View>
        ) : noMatchDismissed ? null : (
          <TouchableOpacity style={styles.matchRow} onPress={() => setRestaurantPickerOpen(true)} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={styles.matchLink} numberOfLines={2}>Match this lineup to a restaurant review?</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 90 }} keyboardShouldPersistTaps="handled">
          <View style={styles.photoWrap}>
            {photoUrl ? (
              <TouchableOpacity style={styles.photoTouch} activeOpacity={0.9} onPress={() => setZoomOpen(true)}>
                <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="contain" />
              </TouchableOpacity>
            ) : <ActivityIndicator color={colors.gold} style={{ marginVertical: 40 }} />}
            <View style={styles.photoBadges}>
              {/* Change photo — upload a new image to replace this lineup's. */}
              <TouchableOpacity style={styles.photoBadge} onPress={changeLineupPhoto} disabled={replacingPhoto} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7} accessibilityLabel="Change photo">
                {replacingPhoto ? <ActivityIndicator size="small" color={colors.gold} /> : <Ionicons name="camera" size={18} color={colors.gold} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Note — reads as plain text once saved; "Edit" reopens the input in a
              popup, and saving there converts it back to text. */}
          <View style={styles.noteBlock}>
            <View style={styles.noteHeadRow}>
              <Text style={styles.noteHeadLabel}>Your note</Text>
              {note.trim() ? (
                <TouchableOpacity onPress={openNoteEditor} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={styles.viewLink}>Edit</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {note.trim() ? (
              <Text style={styles.noteText}>{note}</Text>
            ) : (
              <TouchableOpacity onPress={openNoteEditor} activeOpacity={0.7}>
                <Text style={styles.addNoteLink}>+ Add a note</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Wines */}
          <View style={styles.winesHeaderRow}>
            <Text style={styles.sectionLabel}>Wines in this lineup</Text>
          </View>
          {wines.length === 0 ? (
            <View>
              <Text style={styles.muted}>No bottles identified yet{lineup.bottle_count ? ` (${lineup.bottle_count} bottle${lineup.bottle_count === 1 ? '' : 's'} in the photo)` : ''}. Let Vinster read the labels and confirm what's in this lineup.</Text>
              <TouchableOpacity style={[styles.identifyBtn, identifying && { opacity: 0.5 }]} onPress={identifyWines} disabled={identifying} activeOpacity={0.85}>
                <Text style={styles.identifyBtnText}>{identifying ? 'Reading the labels…' : 'Identify wines'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.wineList}>
              {wines.map((w, i) => {
                // Whether this wine has been reviewed anywhere (any vintage).
                const conn = findWineConnections(
                  { producer: w.producer, wineName: w.wine_name, vintage: w.vintage },
                  { labels, chosenWines, cellarWines },
                );
                return (
                <View key={`${w.cellar_wine_id ?? 'x'}-${i}`} style={styles.wineRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wineName} numberOfLines={2}>
                      {w.count > 1 ? `${w.count}× ` : ''}{wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                    </Text>
                    <View style={styles.tagRow}>
                      {/* One status stamp: Your Cellar (matched) or Off Cellar. */}
                      <Text style={styles.stampTag}>{w.cellar_wine_id ? 'Your Cellar' : 'Off Cellar'}</Text>
                      {/* Add/View Review · View Wine Intel — no underlines, a
                          middle-dot separator like the stats bars. Editing a
                          wine now happens in the Confirm Wines popup, not here. */}
                      <TouchableOpacity
                        onPress={() => goToWineReview(w, conn)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={styles.viewLink}>Add/View Review</Text>
                      </TouchableOpacity>
                      <Text style={styles.tagDot}>·</Text>
                      <TouchableOpacity onPress={() => viewLineupWineIntel(w)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <Text style={styles.viewLink}>View Wine Intel</Text>
                      </TouchableOpacity>
                      {/* A cellar bottle you drank but haven't archived — archive it here. */}
                      {w.cellar_wine_id && cellarWines.some((c) => c.id === w.cellar_wine_id) ? (
                        <>
                          <Text style={styles.tagDot}>·</Text>
                          <TouchableOpacity onPress={() => archiveOneLineupWine(w)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                            <Text style={styles.viewLink}>Archive from Cellar</Text>
                          </TouchableOpacity>
                        </>
                      ) : null}
                    </View>
                  </View>
                </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Edit the date + location stamp. */}
      <Modal visible={stampOpen} transparent animationType="fade" onRequestClose={() => setStampOpen(false)}>
        <TouchableOpacity style={styles.stampOverlay} activeOpacity={1} onPress={() => setStampOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.stampSheet} onPress={() => {}}>
            <Text style={styles.stampTitle}>Date & location</Text>
            <Text style={styles.stampFieldLabel}>Date</Text>
            <DateInput
              style={styles.stampInput}
              valueIso={dateDraft}
              onChangeIso={setDateDraft}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.stampFieldLabel}>Location</Text>
            <TextInput
              style={styles.stampInput}
              value={cityDraft}
              onChangeText={setCityDraft}
              placeholder="City or place"
              placeholderTextColor={colors.textMuted}
              spellCheck={false}
              autoCorrect={false}
            />
            <TouchableOpacity style={[styles.stampSaveBtn, savingStamp && { opacity: 0.5 }]} onPress={saveStamp} disabled={savingStamp} activeOpacity={0.85}>
              <Text style={styles.stampSaveText}>{savingStamp ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Your note — editor popup. Saving converts the note back to text. */}
      <Modal visible={noteEditorOpen} transparent animationType="fade" onRequestClose={() => setNoteEditorOpen(false)}>
        <TouchableOpacity style={styles.stampOverlay} activeOpacity={1} onPress={() => setNoteEditorOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.stampSheet} onPress={() => {}}>
            <View style={styles.dictateRowFlush}>
              <Text style={styles.stampTitle}>Your note</Text>
              <View style={styles.noteHeaderRight}>
                <MicButton value={noteDraft} onChangeText={setNoteDraft} onClear={() => setNoteDraft('')} />
                <TouchableOpacity onPress={() => setNoteEditorOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Cancel">
                  <Text style={styles.closeX}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              style={styles.noteEditorInput}
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder="A memory from this night — who you were with, what you thought…"
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity style={[styles.stampSaveBtn, savingNote && { opacity: 0.5 }]} onPress={saveNoteFromEditor} disabled={savingNote} activeOpacity={0.85}>
              <Text style={styles.stampSaveText}>{savingNote ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Edit one bottle's identity. */}
      <Modal visible={editWineIndex !== null} transparent animationType="fade" onRequestClose={() => setEditWineIndex(null)}>
        <TouchableOpacity style={styles.stampOverlay} activeOpacity={1} onPress={() => setEditWineIndex(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.stampSheet} onPress={() => {}}>
            <Text style={styles.stampTitle}>Edit wine</Text>
            <Text style={styles.stampFieldLabel}>Producer</Text>
            <TextInput style={styles.stampInput} value={editProducer} onChangeText={setEditProducer} placeholder="e.g. Château Batailley" placeholderTextColor={colors.textMuted} />
            <Text style={styles.stampFieldLabel}>Wine name</Text>
            <TextInput style={styles.stampInput} value={editName} onChangeText={setEditName} placeholder="e.g. Grand Cru Classé" placeholderTextColor={colors.textMuted} />
            <Text style={styles.stampFieldLabel}>Vintage</Text>
            <TextInput style={styles.stampInput} value={editVintage} onChangeText={(t) => setEditVintage(t.slice(0, 7))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={7} />
            <TouchableOpacity style={[styles.stampSaveBtn, savingWineEdit && { opacity: 0.5 }]} onPress={saveWineEdit} disabled={savingWineEdit} activeOpacity={0.85}>
              <Text style={styles.stampSaveText}>{savingWineEdit ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Match to a restaurant review in Your Restaurants. */}
      <Modal visible={restaurantPickerOpen} transparent animationType="fade" onRequestClose={() => setRestaurantPickerOpen(false)}>
        <TouchableOpacity style={styles.stampOverlay} activeOpacity={1} onPress={() => setRestaurantPickerOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.stampSheet} onPress={() => {}}>
            {/* White X (top-right) to cancel. */}
            <TouchableOpacity style={styles.pickerCloseX} onPress={() => setRestaurantPickerOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Cancel">
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>

            {/* No match — dismisses the prompt for this lineup and closes. */}
            <TouchableOpacity onPress={dismissNoMatch} disabled={savingMatch} activeOpacity={0.7} style={styles.noMatchRow}>
              <Text style={styles.noMatchText} numberOfLines={1}>Don't Match This Wine to a Review</Text>
            </TouchableOpacity>

            <View style={styles.pickerDivider} />

            <Text style={styles.stampTitle}>Match this lineup to a restaurant review</Text>
            <TextInput
              style={styles.stampInput}
              value={restaurantSearch}
              onChangeText={setRestaurantSearch}
              placeholder="Search your restaurant reviews…"
              placeholderTextColor={colors.textMuted}
              spellCheck={false}
              autoCorrect={false}
            />
            {restaurantArchive.length === 0 ? (
              <Text style={styles.muted}>No restaurant reviews yet. Add one in Your Restaurants first.</Text>
            ) : filteredRestaurants.length === 0 ? (
              <Text style={styles.muted}>No restaurants match your search.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300, marginTop: spacing.sm }} keyboardShouldPersistTaps="handled">
                {filteredRestaurants.map((a) => {
                  const active = a.id === lineup.restaurant_session_id;
                  return (
                    <TouchableOpacity key={a.id} style={styles.pickerOption} onPress={() => matchRestaurant(a.id)} disabled={savingMatch} activeOpacity={0.7}>
                      <Text style={[styles.pickerOptionText, active && { color: colors.gold }]} numberOfLines={1}>{a.restaurantName?.trim() || 'Unnamed restaurant'}</Text>
                      <Text style={styles.pickerOptionMeta} numberOfLines={1}>{[a.city?.trim(), a.capturedAt ? new Date(a.capturedAt).toLocaleDateString('en-GB') : ''].filter(Boolean).join(' · ')}{active ? '  ✓' : ''}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            {matchedRestaurant ? (
              <TouchableOpacity style={styles.pickerRemove} onPress={() => matchRestaurant(null)} disabled={savingMatch} activeOpacity={0.7}>
                <Text style={styles.pickerRemoveText}>Remove match</Text>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Confirm the wines Vinster identified — tap a wine to include/exclude. */}
      <Modal visible={confirmWines !== null} transparent animationType="fade" onRequestClose={() => setConfirmWines(null)}>
        <View style={styles.stampOverlay}>
          <View style={[styles.stampSheet, { maxHeight: '82%' }]}>
            <Text style={styles.stampTitle}>Confirm the wines</Text>
            <Text style={styles.confirmBlurb}>Vinster read these from the photo. Tap to include or exclude, then save.</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {(confirmWines ?? []).map((w, i) => {
                const on = included.has(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.confirmRow}
                    onPress={() => setIncluded((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.confirmCheck, on && styles.confirmCheckOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.confirmWineName, !on && styles.confirmWineOff]}>
                        {w.count > 1 ? `${w.count}× ` : ''}{wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                      </Text>
                      {w.cellar_wine_id ? <Text style={styles.confirmCellarTag}>In your cellar</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.stampSaveBtn, (savingWines || included.size === 0) && { opacity: 0.5 }]} onPress={saveIdentifiedWines} disabled={savingWines || included.size === 0} activeOpacity={0.85}>
              <Text style={styles.stampSaveText}>{savingWines ? 'Saving…' : `Save ${included.size} wine${included.size === 1 ? '' : 's'}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmWines(null)} disabled={savingWines}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rename this lineup. */}
      <Modal visible={nameOpen} transparent animationType="fade" onRequestClose={() => setNameOpen(false)}>
        <TouchableOpacity style={styles.stampOverlay} activeOpacity={1} onPress={() => setNameOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.stampSheet} onPress={() => {}}>
            <View style={styles.dictateRowFlush}>
              <Text style={styles.stampTitle}>Name this lineup</Text>
              <TouchableOpacity onPress={() => setNameOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Cancel">
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.stampInput}
              value={nameDraft}
              onChangeText={(t) => setNameDraft(t.slice(0, 60))}
              placeholder="e.g. Birthday at The Ledbury"
              placeholderTextColor={colors.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveName}
              spellCheck={false}
              autoCorrect={false}
            />
            <TouchableOpacity style={[styles.stampSaveBtn, savingName && { opacity: 0.5 }]} onPress={saveName} disabled={savingName} activeOpacity={0.85}>
              <Text style={styles.stampSaveText}>{savingName ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Full-screen zoomable viewer for the lineup photo. */}
      <LabelPhotoViewer visible={zoomOpen} uri={photoUrl} onClose={() => setZoomOpen(false)} contain />

      {/* Off-screen share card. */}
      {shareData ? (
        <View style={styles.offscreen} pointerEvents="none">
          <LineupShareCard ref={shareCardRef} imageUrl={shareData.url} date={shareData.date} location={lineup.city} note={shareData.note} onImageReady={captureAndShare} />
        </View>
      ) : null}

      {genIntel ? (
        <View style={StyleSheet.absoluteFill}>
          <SearchProgress
            title="Loading wine intel…"
            subtitle="Vinster needs a few seconds"
            body="Vinster is pulling together this wine's scores, value and drinking window."
            durationMs={20000}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  backLink: { fontSize: 15, color: colors.gold },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  headerTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginTop: spacing.lg },
  headerStampWrap: { alignItems: 'center', paddingHorizontal: spacing.sm, marginTop: spacing.xs },
  venueRow: { alignItems: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.xl },
  venueInput: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, textAlign: 'center', paddingVertical: 2, alignSelf: 'stretch' },
  // Subtle "Done" beneath the venue while editing — confirm + dismiss keyboard.
  venueDone: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center', marginTop: 4 },
  matchRow: { alignItems: 'center', paddingHorizontal: spacing.sm, marginTop: spacing.sm },
  // Matched state: "View …" link with a yellow underlined "(unmatch)" beside it.
  matchRowInline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, marginTop: spacing.sm },
  matchLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center' },
  unmatchLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  matchedText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center' },
  pickerOption: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerOptionText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  pickerOptionMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pickerRemove: { alignItems: 'center', paddingTop: spacing.md },
  pickerRemoveText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  headerStamp: { fontSize: 17, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.5, textAlign: 'center' },
  shareText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold },
  photoWrap: { alignItems: 'center', paddingTop: spacing.md },
  // The touchable owns the 92% width; the image fills it (a percentage width on
  // the image alone collapses to 0 inside an auto-width touchable).
  photoTouch: { width: '92%' },
  photo: { width: '100%', height: 420, borderRadius: 14, backgroundColor: colors.surface },
  // Camera (change photo) + favourite star, clustered top-right on the photo.
  photoBadges: { position: 'absolute', top: spacing.lg, right: '8%', flexDirection: 'row', gap: spacing.sm },
  photoBadge: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 18, minWidth: 34, height: 32, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  favStarText: { fontSize: 22, color: '#FFFFFF' },
  favStarActive: { color: colors.gold },
  stampEditHint: { fontSize: 13, color: colors.textMuted },
  stampOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  stampSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  stampTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.4, marginBottom: spacing.md },
  stampFieldLabel: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, marginBottom: 4, marginTop: spacing.sm, letterSpacing: 0.3 },
  stampInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  stampSaveBtn: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: 'rgba(224,184,74,0.12)' },
  stampSaveText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  winesHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reIdentifyLink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  identifyBtn: { marginHorizontal: spacing.xl, marginTop: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: 'rgba(224,184,74,0.12)' },
  identifyBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  confirmBlurb: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md, lineHeight: 20 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  confirmCheck: { fontSize: 22, color: colors.textMuted },
  confirmCheckOn: { color: colors.gold },
  confirmWineName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, lineHeight: 20 },
  confirmWineOff: { color: colors.textMuted, textDecorationLine: 'line-through' },
  confirmCellarTag: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, marginTop: 2 },
  confirmCancel: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.xs },
  confirmCancelText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted },
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl },
  dictateRowFlush: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  // Section headers — yellow, all-caps, matching the stats-bar type.
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.sm },
  noteBlock: { marginTop: spacing.md, marginBottom: spacing.sm },
  noteHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  noteHeadLabel: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.8 },
  // Mic + ✕ cluster in the note/name editor headers; white ✕ to cancel.
  noteHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  closeX: { fontFamily: fonts.bodyRegular, fontSize: 20, color: '#FFFFFF' },
  // Restaurant-match picker: white X, a "no match" dismiss link, then a divider.
  pickerCloseX: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 2, padding: 4 },
  noMatchRow: { paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center' },
  noMatchText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, textAlign: 'center', textDecorationLine: 'underline' },
  pickerDivider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  noteText: { paddingHorizontal: spacing.xl, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 22 },
  addNoteLink: { paddingHorizontal: spacing.xl, fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  noteEditorInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, minHeight: 100, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  noteInput: { marginHorizontal: spacing.xl, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, minHeight: 90, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  saveNoteBtn: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  saveNoteText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  wineList: { paddingHorizontal: spacing.xl },
  wineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineName: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text },
  tagRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: 4 },
  intelOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,11,10,0.85)', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  intelOverlayText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
  // Non-link status stamps — all yellow (Off-cellar, Not reviewed, Archived).
  stampTag: { fontSize: 11, fontFamily: fonts.bodySemibold, textTransform: 'uppercase', letterSpacing: 0.4, color: colors.gold, borderWidth: 1, borderColor: 'rgba(224,184,74,0.4)', paddingHorizontal: 8, paddingVertical: 1, borderRadius: 999, overflow: 'hidden' },
  viewLink: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold },
  tagDot: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  muted: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, lineHeight: 20 },
  offscreen: { position: 'absolute', left: -9999, top: -9999 },
});
