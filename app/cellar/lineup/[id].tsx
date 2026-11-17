import NetInfo from '@react-native-community/netinfo';
import { OfflinePhotoPlaceholder } from '../../../src/components/LineupThumb';
import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator, Modal } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../../../src/utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { ensureConnectionForUpload } from '../../../src/utils/connectionGuard';
import { getLineupArchive, lineupSignedUrl, setLineupNote, updateLineupStamp, setLineupWines, setLineupRestaurant, setLineupName, replaceLineupImage, type LineupArchive, type LineupWine } from '../../../src/api/lineups';
import * as ImagePicker from 'expo-image-picker';
import { CellarWinePicker } from '../../../src/components/CellarWinePicker';
import type { CellarWine } from '../../../src/types/wine';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { useScanHistory } from '../../../src/hooks/useScanHistory';
import { detectLineup, prepareImageBase64, fetchAutoLabelUri } from '../../../src/api/label';
import { buildLineupWines, archiveBottles } from '../../../src/services/archiveNight';
import { findSameCellarWine, sameWineIdentity } from '../../../src/utils/wineMatch';
import { getCellarWineById } from '../../../src/api/cellar';
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
import { useLabelStore } from '../../../src/stores/labelStore';
import { SearchProgress } from '../../../src/components/SearchProgress';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Local YYYY-MM-DD of a lineup's date — matches the date shown on screen (a UTC
// split can be a day out for rows saved near midnight).
function lineupDay(archivedAt: string): string {
  const d = new Date(archivedAt);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const UNDO_NOTE = 'The bottle Vinster already moved to your archive for this lineup stays there — this doesn’t put it back in your cellar.';

export default function LineupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const { session } = useAuth();

  const { data: lineup, isLoading } = useQuery({
    queryKey: ['lineup', id],
    queryFn: () => getLineupArchive(id!),
    enabled: !!id,
  });

  // Synchronous in-flight guards, keyed by action: React state lands too late to
  // stop a fast double tap from firing an upload, read or archive twice.
  const inFlight = useRef(new Set<string>());
  function begin(key: string): boolean {
    if (inFlight.current.has(key)) return false;
    inFlight.current.add(key);
    return true;
  }
  function end(key: string) { inFlight.current.delete(key); }

  const [genIntel, setGenIntel] = useState(false);
  // Where this lineup review/intel flow should return to on Back.
  const backToLineup = `&backTo=${encodeURIComponent(`/cellar/lineup/${id}`)}`;

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  // The photo couldn't load (usually no connection) → offline placeholder.
  const [photoFailed, setPhotoFailed] = useState(false);
  function loadPhoto(path: string | null | undefined) {
    lineupSignedUrl(path).catch(() => null).then((u) => { setPhotoUrl(u); setPhotoFailed(!u); });
  }
  const [zoomOpen, setZoomOpen] = useState(false);
  const [replacingPhoto, setReplacingPhoto] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  // The note reads as plain text once saved; editing opens a popup with the
  // input, and saving converts it back to text.
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  // The lineup's name, edited inline as the title and saved on blur.
  const [name, setName] = useState('');
  // Which wine row (index) is being linked to a cellar wine via the picker.
  const [cellarPickerFor, setCellarPickerFor] = useState<number | null>(null);
  const hydrated = useRef(false);
  useEffect(() => {
    if (lineup && !hydrated.current) {
      hydrated.current = true;
      setNote(lineup.note ?? '');
      setName(lineup.name ?? '');
      loadPhoto(lineup.image_path);
    }
  }, [lineup]);
  // Back online after a failed load → fetch the photo again.
  useEffect(() => {
    if (!photoFailed || !lineup) return;
    return NetInfo.addEventListener((st) => {
      if (st.isConnected && st.isInternetReachable !== false) loadPhoto(lineup.image_path);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoFailed, lineup?.image_path]);

  function invalidateLineup() {
    qc.invalidateQueries({ queryKey: ['lineup', id] });
    qc.invalidateQueries({ queryKey: ['lineup-archives'] });
  }

  async function saveNameInline() {
    if (!lineup) return;
    if ((name.trim() || null) === (lineup.name?.trim() || null)) return; // unchanged
    try {
      await setLineupName(lineup.id, name);
      invalidateLineup();
    } catch (err) {
      showAlert({ title: 'Could not save title', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // The lineup's wines as they stand NOW in the cache. Every write builds from
  // this rather than from the render's snapshot, so a slow archive can't
  // overwrite an edit made while it ran.
  function currentWines(): LineupWine[] {
    return qc.getQueryData<LineupArchive | null>(['lineup', id])?.wines ?? [];
  }

  // Apply a change to the latest wines and persist it. The cache is updated
  // straight away so a quick follow-up edit builds on this one rather than on
  // the pre-write array while the refetch is in flight.
  async function updateWines(change: (wines: LineupWine[]) => LineupWine[]): Promise<boolean> {
    if (!lineup) return false;
    const next = change(currentWines());
    try {
      await setLineupWines(lineup.id, next);
      qc.setQueryData<LineupArchive | null>(['lineup', id], (old) => (old ? { ...old, wines: next } : old));
      invalidateLineup();
      return true;
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
      return false;
    }
  }

  // Move the cellar bottles behind these lineup rows into the cellar archive,
  // dated to the night, and mark each row archived. archiveBottles re-reads the
  // cellar row, so two rows linked to one wine each take their own bottles.
  async function archiveRows(indexes: number[]): Promise<void> {
    if (!lineup || !begin('archive')) return;
    const day = lineupDay(lineup.archived_at);
    const done: Array<{ index: number; cellarId: string }> = [];
    try {
      for (const index of indexes) {
        const w = currentWines()[index];
        if (!w?.cellar_wine_id || w.archived) continue;
        if ((await archiveBottles(w.cellar_wine_id, w.count ?? 1, day)) > 0) done.push({ index, cellarId: w.cellar_wine_id });
      }
    } catch (err) {
      showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      // Record whatever did get archived, even after a failure part-way. Rows are
      // matched by position AND link, in case the list changed meanwhile.
      if (done.length) {
        await updateWines((ws) => ws.map((w, i) => (done.some((d) => d.index === i && d.cellarId === w.cellar_wine_id) ? { ...w, archived: true } : w)));
      }
      qc.invalidateQueries({ queryKey: ['cellar', session?.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar-archive', session?.user.id] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      end('archive');
    }
  }

  // "Off Cellar" tapped → confirm the bottle came from the cellar, then pick
  // the cellar wine it was.
  function confirmFromCellar(index: number) {
    showAlert({
      title: 'This was from my cellar',
      body: 'Choose the wine in your cellar. Vinster links this bottle to it and moves the bottle from your cellar to your archive, dated to this night.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose from my cellar', onPress: () => setCellarPickerFor(index) },
      ],
    });
  }
  // Link a lineup row to the chosen cellar wine — adopting its identity, since
  // the user has said which wine it is — then archive that bottle.
  async function pickCellarForWine(cw: CellarWine) {
    const index = cellarPickerFor;
    setCellarPickerFor(null);
    if (index == null) return;
    const linked = await updateWines((ws) => ws.map((w, i) => (
      i === index ? { ...w, cellar_wine_id: cw.id, producer: cw.producer, wine_name: cw.wine_name, vintage: cw.vintage, archived: false } : w
    )));
    if (linked) await archiveRows([index]);
  }

  // Tap the "Your Cellar" badge → archive the bottle from its wine card, or
  // mark it as not from the cellar after all.
  function openCellarBadgeOptions(index: number, w: LineupWine) {
    showAlert({
      title: wineHeaderLine(w.producer, w.wine_name, w.vintage) || 'This wine',
      buttons: [
        // The wine card resolves the id itself, so this works even when the wine
        // isn't in the locally loaded cellar list. Back returns to this lineup.
        ...(w.cellar_wine_id ? [{ text: 'Archive this bottle', onPress: () => router.push(`/cellar/${w.cellar_wine_id}` as any) }] : []),
        { text: 'This wine was Off Cellar', onPress: () => { void markOffCellar(index); } },
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  // Unlink the bottle from the cellar. A removal already made stays made — say
  // so, rather than implying the bottle has gone back.
  async function markOffCellar(index: number) {
    const wasArchived = !!currentWines()[index]?.archived;
    const saved = await updateWines((ws) => ws.map((w, i) => (i === index ? { ...w, cellar_wine_id: null, archived: false } : w)));
    if (saved && wasArchived) showAlert({ title: 'Marked Off Cellar', body: UNDO_NOTE });
  }

  // Edit the date + location stamp (tap the stamp below the title).
  const [stampOpen, setStampOpen] = useState(false);
  const [dateDraft, setDateDraft] = useState('');
  const [cityDraft, setCityDraft] = useState('');
  const [venueDraft, setVenueDraft] = useState('');
  const [savingStamp, setSavingStamp] = useState(false);

  function openStampEdit() {
    if (!lineup) return;
    setDateDraft(lineupDay(lineup.archived_at));
    setCityDraft(lineup.city ?? '');
    setVenueDraft(lineup.venue ?? '');
    setStampOpen(true);
  }
  async function saveStamp() {
    if (!lineup || !begin('stamp')) return;
    const ymd = dateDraft.trim();
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(ymd) && !Number.isNaN(new Date(ymd).getTime());
    // A malformed date must not silently save nothing. (Empty = leave as-is.)
    if (ymd && !valid) {
      end('stamp');
      showAlert({ title: 'Check the date', body: 'Please enter a valid date.' });
      return;
    }
    setSavingStamp(true);
    try {
      await updateLineupStamp(lineup.id, {
        archivedAt: valid ? new Date(`${ymd}T12:00:00`).toISOString() : undefined,
        city: cityDraft,
        venue: venueDraft,
      });
      invalidateLineup();
      setStampOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingStamp(false);
      end('stamp');
    }
  }

  // For linking each wine to its reviews / cellar entry (like the Label Library).
  const { wines: cellarWines } = useCellar();
  const { chosenWines } = useChosenWines();
  const { labels } = useLabels();
  const { archive: restaurantArchive } = useScanHistory();

  // Match this lineup to a restaurant review in Your Restaurants (scan_sessions).
  const [restaurantPickerOpen, setRestaurantPickerOpen] = useState(false);
  const [savingMatch, setSavingMatch] = useState(false);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const matchedRestaurant = lineup?.restaurant_session_id
    ? restaurantArchive.find((a) => a.id === lineup.restaurant_session_id) ?? null
    : null;

  // Pass null to unmatch.
  async function matchRestaurant(sessionId: string | null) {
    if (!lineup || savingMatch) return;
    setSavingMatch(true);
    try {
      await setLineupRestaurant(lineup.id, sessionId);
      invalidateLineup();
      setRestaurantPickerOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingMatch(false);
    }
  }

  const filteredRestaurants = restaurantArchive.filter((a) => {
    const q = restaurantSearch.trim().toLowerCase();
    if (!q) return true;
    return (a.restaurantName ?? '').toLowerCase().includes(q) || (a.city ?? '').toLowerCase().includes(q);
  });

  // "Identify wines" — Vinster reads the saved photo, then the user confirms.
  const [identifying, setIdentifying] = useState(false);
  const [confirmWines, setConfirmWines] = useState<LineupWine[] | null>(null);
  const [included, setIncluded] = useState<Set<number>>(new Set());
  const [savingWines, setSavingWines] = useState(false);

  // Per-wine manual edit: correct one bottle's producer / name / vintage.
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

  // Your Review → the wine's review in Your Wine Reviews, with Back returning to
  // THIS lineup. Cellar bottles open their cellar review; off-cellar wines open
  // the existing review or a new one seeded with the lineup's date.
  async function goToWineReview(w: LineupWine, conn: ReturnType<typeof findWineConnections>) {
    if (!lineup) return;
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
    // Brand-new review — fetch a web label so the review card has a thumbnail
    // (the user can swap it later). slu=1 carries it via the label store.
    setGenIntel(true);
    let img: string | null = null;
    try { img = await fetchAutoLabelUri(w.producer, w.wine_name); } catch { /* non-fatal */ }
    setGenIntel(false);
    useLabelStore.getState().setImageUri(img);
    const sl = img ? '&slu=1' : '';
    const seed = `sp=${encodeURIComponent(w.producer ?? '')}&sw=${encodeURIComponent(w.wine_name ?? '')}&sv=${encodeURIComponent(w.vintage != null ? String(w.vintage) : '')}&sd=${lineupDay(lineup.archived_at)}`;
    router.push(`/wines/chosen?seedAdd=1${sl}&${seed}${backToLineup}` as any);
  }

  // View Wine Intel → generate on demand and open the intel card.
  async function viewLineupWineIntel(w: LineupWine) {
    // Fill classification + appellation for a classified Bordeaux château so the
    // intel card is complete even though the lineup carried neither.
    const details = withBordeauxInfo({
      producer: w.producer ?? '',
      region: '',
      wineName: w.wine_name || null,
      vintage: w.vintage != null ? String(w.vintage) : 'NV',
    });
    const ls = useLabelStore.getState();
    ls.reset();
    ls.setWineDetailsConfirmed(details as any);
    ls.setIntelligence(null);
    ls.setImageUri(null);
    // Header image in the background: the linked cellar wine's own label if it
    // has one, else a web label. Best-effort — the card shows title-only until
    // it lands.
    void (async () => {
      let img: string | null = null;
      if (w.cellar_wine_id) {
        const cw = cellarWines.find((c) => c.id === w.cellar_wine_id);
        if (cw?.label_image_path) { try { img = await labelSignedUrl(cw.label_image_path); } catch { /* fall through */ } }
      }
      if (!img) { try { img = await fetchAutoLabelUri(w.producer, w.wine_name); } catch { /* photoless */ } }
      if (img) useLabelStore.getState().setImageUri(img);
    })();
    // gen=1: build intel on the results screen (instant shell). confirmed=1: known
    // wine, no "which wine?" prompt. noRecent=1: a lineup view isn't a scan.
    router.push(`/label/results?context=intel&confirmed=1&gen=1&noRecent=1${backToLineup}` as any);
  }

  // After an identity edit, does the row still point at the right cellar wine?
  // Kept when the edit still describes the linked wine; otherwise re-matched
  // strictly (same wine + vintage) or unlinked.
  async function relinkAfterEdit(prev: LineupWine, edited: { producer: string | null; wineName: string; vintage: string | null }) {
    if (prev.cellar_wine_id) {
      // A fully archived wine isn't in the live list, so fall back to fetching it.
      const linked = cellarWines.find((c) => c.id === prev.cellar_wine_id)
        ?? (await getCellarWineById(prev.cellar_wine_id).catch(() => null));
      if (linked && sameWineIdentity(edited, linked)) return { cellar_wine_id: prev.cellar_wine_id, archived: prev.archived };
    }
    const match = findSameCellarWine(cellarWines, edited);
    return { cellar_wine_id: match?.id ?? null, archived: false };
  }

  async function saveWineEdit() {
    const index = editWineIndex;
    if (index == null || !begin('editWine')) return;
    setSavingWineEdit(true);
    try {
      const prev = currentWines()[index];
      if (!prev) return;
      const edited = {
        producer: editProducer.trim() || null,
        wineName: editName.trim() || editProducer.trim(),
        vintage: editVintage.trim() || null,
      };
      const link = await relinkAfterEdit(prev, edited);
      const saved = await updateWines((ws) => ws.map((w, i) => (
        i === index ? { ...w, producer: edited.producer, wine_name: edited.wineName, vintage: edited.vintage, ...link } : w
      )));
      if (!saved) return;
      setEditWineIndex(null);
      if (prev.archived && link.cellar_wine_id !== prev.cellar_wine_id) {
        showAlert({ title: 'Wine updated', body: `This bottle is no longer linked to the cellar wine it was archived from. ${UNDO_NOTE}` });
      }
    } finally {
      setSavingWineEdit(false);
      end('editWine');
    }
  }

  async function identifyWines() {
    if (!lineup || !begin('identify')) return;
    try {
      if (!(await ensureConnectionForUpload())) return;
      setIdentifying(true);
      // Always a fresh signed URL: the one behind the on-screen photo may have
      // expired if the screen has been open a while.
      const url = await lineupSignedUrl(lineup.image_path);
      if (!url) { showAlert({ title: 'Photo unavailable', body: 'Could not load this lineup’s photo. Please try again.' }); return; }
      const dest = new File(Paths.cache, `lineup-detect-${lineup.id}.jpg`);
      try { if (dest.exists) dest.delete(); } catch { /* ignore */ }
      const file = await File.downloadFileAsync(url, dest);
      const { bottles } = await detectLineup(await prepareImageBase64(file.uri));
      const candidates = buildLineupWines(bottles ?? [], cellarWines);
      if (!candidates.length) {
        showAlert({ title: 'No wines detected', body: 'Vinster couldn’t read any bottles from this photo. A clearer, well-lit shot with the labels in frame works best.' });
        return;
      }
      setIncluded(new Set(candidates.map((_, i) => i)));
      setConfirmWines(candidates);
    } catch (err) {
      showAlert({ title: 'Could not identify wines', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setIdentifying(false);
      end('identify');
    }
  }

  async function saveIdentifiedWines() {
    if (!confirmWines || !begin('saveWines')) return;
    const kept = confirmWines.filter((_, i) => included.has(i));
    setSavingWines(true);
    try {
      if (!(await updateWines(() => kept))) return;
      setConfirmWines(null);
      // These were drunk that night — offer to archive the cellar ones so they
      // don't linger as "in cellar".
      const fromCellar = kept.map((w, i) => (w.cellar_wine_id ? i : -1)).filter((i) => i >= 0);
      if (fromCellar.length) promptArchiveDrunk(fromCellar, kept);
    } finally {
      setSavingWines(false);
      end('saveWines');
    }
  }

  function promptArchiveDrunk(indexes: number[], wines: LineupWine[]) {
    const n = indexes.reduce((s, i) => s + (wines[i].count ?? 1), 0);
    showAlert({
      title: 'You drank these — archive them?',
      body: `${n} ${n === 1 ? 'bottle is' : 'bottles are'} from your cellar. Move ${n === 1 ? 'it' : 'them'} into your archive now?`,
      buttons: [
        { text: 'Not now', style: 'cancel' },
        { text: 'Archive', onPress: () => { void archiveRows(indexes); } },
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
    if (!lineup || !begin('note')) return;
    setSavingNote(true);
    try {
      await setLineupNote(lineup.id, noteDraft);
      setNote(noteDraft);
      invalidateLineup();
      setNoteEditorOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save note', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingNote(false);
      end('note');
    }
  }

  // Replace the lineup photo — pick from the library, upload, repoint image_path.
  async function changeLineupPhoto() {
    if (!lineup || !session?.user.id || !begin('photo')) return;
    try {
      if (!(await ensureMediaPermission('library'))) return;
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (res.canceled || !res.assets?.[0]) return;
      setReplacingPhoto(true);
      const path = await replaceLineupImage(session.user.id, lineup.id, res.assets[0].uri);
      setPhotoUrl(await lineupSignedUrl(path)); setPhotoFailed(false);
      invalidateLineup();
    } catch (err) {
      showAlert({ title: 'Could not update photo', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setReplacingPhoto(false);
      end('photo');
    }
  }

  async function handleShare() {
    if (!lineup || !begin('share')) return;
    setSharing(true);
    try {
      // Fresh signed URL — the on-screen one may have expired.
      const url = await lineupSignedUrl(lineup.image_path);
      if (!url) throw new Error('Could not load the lineup photo.');
      capturedRef.current = false;
      setShareData({
        url,
        date: new Date(lineup.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        note: note.trim() || (lineup.note ?? ''),
      });
    } catch (err) {
      setSharing(false);
      end('share');
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }
  // Fired by the share card once its photo has loaded.
  async function captureAndShare() {
    if (capturedRef.current || !shareCardRef.current) return;
    capturedRef.current = true;
    try {
      await new Promise((r) => setTimeout(r, 150));
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a wine lineup') });
      }
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
      setShareData(null);
      capturedRef.current = false;
      end('share');
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
  const stamp = [dateStr, lineup.city, lineup.venue].filter(Boolean).join(' · ');
  const wines: LineupWine[] = lineup.wines ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Back on its own row; Export sits at the foot of the page. */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 16 }}>
            <Text accessibilityLabel="Back" style={styles.back}>←</Text>
          </TouchableOpacity>
        </View>
        {/* The lineup's own name IS the title (no fixed "Your Lineup" heading) —
            saved on blur. */}
        <TextInput
          style={styles.titleInput}
          value={name}
          onChangeText={setName}
          onEndEditing={saveNameInline}
          onSubmitEditing={saveNameInline}
          placeholder="Title"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          textAlign="center"
          spellCheck={false}
          autoCorrect={false}
        />
        {/* Date · Location · Venue on one line (tap to edit all three). */}
        <TouchableOpacity style={styles.headerStampWrap} onPress={openStampEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={styles.headerStamp} numberOfLines={1}>{stamp || 'Add date · location · venue'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 90 }} keyboardShouldPersistTaps="handled">
          <View style={styles.photoWrap}>
            {photoFailed ? (
              <OfflinePhotoPlaceholder width="100%" height={420} borderRadius={14} />
            ) : photoUrl ? (
              <TouchableOpacity style={styles.photoTouch} activeOpacity={0.9} onPress={() => setZoomOpen(true)}>
                <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="contain" onError={() => setPhotoFailed(true)} />
              </TouchableOpacity>
            ) : <ActivityIndicator color={colors.gold} style={{ marginVertical: 40 }} />}
            <View style={styles.photoBadges}>
              {/* Change photo — upload a new image to replace this lineup's. */}
              <TouchableOpacity style={styles.photoBadge} onPress={changeLineupPhoto} disabled={replacingPhoto} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7} accessibilityLabel="Change photo">
                {replacingPhoto ? <ActivityIndicator size="small" color={colors.gold} /> : <Ionicons name="camera" size={18} color={colors.gold} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Your Lineup Notes & Musings — the heading, then the note as copy (tap
              to edit). The mic + trash live in the editor popup only, so they don't
              sit over the saved copy. */}
          <View style={styles.noteBlock}>
            <Text style={styles.noteHeadLabel}>Your Lineup Notes & Musings</Text>
            {note.trim() ? (
              <TouchableOpacity onPress={openNoteEditor} activeOpacity={0.7}>
                <Text style={styles.noteBodyText}>{note}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={openNoteEditor} activeOpacity={0.7}>
                <Text style={styles.notePlaceholder}>Tap to write, or use the mic to dictate your thoughts on this lineup…</Text>
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
                // Region · grape from the linked cellar wine, so the row mirrors the
                // Full Cellar List format (name line + region/grape line).
                const linkedCellar = w.cellar_wine_id ? cellarWines.find((c) => c.id === w.cellar_wine_id) : null;
                const subParts = [linkedCellar?.region, linkedCellar?.grape_variety].filter(Boolean) as string[];
                return (
                <View key={`${w.cellar_wine_id ?? 'x'}-${i}`} style={styles.wineRow}>
                  <View style={{ flex: 1 }}>
                    {/* Tap the name to edit the wine (correct a mis-read). Matches the
                        Full Cellar List's name + region/grape formatting. */}
                    <TouchableOpacity onPress={() => openWineEdit(i, w)} activeOpacity={0.7} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                      <Text style={styles.wineName}>
                        {w.count > 1 ? `${w.count}× ` : ''}{wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                      </Text>
                    </TouchableOpacity>
                    {subParts.length > 0 ? <Text style={styles.wineDetail} numberOfLines={1}>{subParts.join(' · ')}</Text> : null}
                    {/* Status stamp. "Your Cellar" (linked) → tap to archive the
                        bottle or mark it Off Cellar. "Off Cellar" → tap to link it
                        via "This was from my cellar". */}
                    {w.cellar_wine_id ? (
                      <TouchableOpacity onPress={() => openCellarBadgeOptions(i, w)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <Text style={styles.stampTag}>Your Cellar</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => confirmFromCellar(i)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <Text style={styles.stampTag}>Off Cellar</Text>
                      </TouchableOpacity>
                    )}
                    {/* Your Review · Wine Intel beneath the stamp. (Editing is via
                        the name; archiving via the stamp.) */}
                    <View style={styles.tagRow}>
                      <TouchableOpacity onPress={() => goToWineReview(w, conn)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <Text style={styles.viewLink}>Your Review</Text>
                      </TouchableOpacity>
                      <Text style={styles.tagDot}>·</Text>
                      <TouchableOpacity onPress={() => viewLineupWineIntel(w)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <Text style={styles.viewLink}>Wine Intel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                );
              })}
            </View>
          )}

          {/* Match to a restaurant review — a white button at the foot of the page.
              Once matched it becomes "Your Restaurant Review" (with an unmatch). */}
          {matchedRestaurant ? (
            <View style={styles.matchBottomWrap}>
              <TouchableOpacity
                style={styles.matchButton}
                onPress={() => router.push(`/restaurants/reviews?openSession=${matchedRestaurant.id}` as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.matchButtonText}>Your Restaurant Review</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => matchRestaurant(null)} disabled={savingMatch} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Text style={styles.unmatchLink}>(unmatch)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.matchButton} onPress={() => setRestaurantPickerOpen(true)} activeOpacity={0.85}>
              <Text style={styles.matchButtonText}>Match to a Restaurant Review</Text>
            </TouchableOpacity>
          )}

          {/* Export — a button beneath the Match button. */}
          <TouchableOpacity style={styles.exportButton} onPress={handleShare} disabled={sharing} activeOpacity={0.85}>
            <Text style={styles.exportButtonText}>{sharing ? 'Exporting…' : 'Export'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* "This was from my cellar" — pick the cellar wine this bottle was. */}
      <CellarWinePicker
        visible={cellarPickerFor != null}
        onClose={() => setCellarPickerFor(null)}
        onSelect={(cw) => { void pickCellarForWine(cw); }}
        allowPlaced
        subtitle="Pick the wine this bottle came from — Vinster moves it from your cellar to your archive."
      />

      {/* Edit the date + location stamp. */}
      <Modal visible={stampOpen} transparent animationType="fade" onRequestClose={() => setStampOpen(false)}>
        <TouchableOpacity style={styles.stampOverlay} activeOpacity={1} onPress={() => setStampOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.stampSheet} onPress={() => {}}>
            <Text style={styles.stampTitle}>Date, location & venue</Text>
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
            <Text style={styles.stampFieldLabel}>Venue</Text>
            <TextInput
              style={styles.stampInput}
              value={venueDraft}
              onChangeText={setVenueDraft}
              placeholder="Restaurant, bar or home"
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
              <Text style={[styles.stampTitle, styles.noteEditorTitle]} numberOfLines={2}>Your Lineup Notes & Musings</Text>
              <View style={styles.noteHeaderRight}>
                <MicButton value={noteDraft} onChangeText={setNoteDraft} onClear={() => setNoteDraft('')} domain="note" serverCorrect />
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
            {/* White X (top-right) to exit the edit screen. */}
            <TouchableOpacity style={styles.pickerCloseX} onPress={() => setEditWineIndex(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
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

            {/* No match — just closes the picker. */}
            <TouchableOpacity onPress={() => setRestaurantPickerOpen(false)} disabled={savingMatch} activeOpacity={0.7} style={styles.noMatchRow}>
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

      {/* Full-screen zoomable viewer for the lineup photo. */}
      <LabelPhotoViewer visible={zoomOpen} uri={photoUrl} onClose={() => setZoomOpen(false)} contain />

      {/* Off-screen share card. */}
      {shareData ? (
        <View style={styles.offscreen} pointerEvents="none">
          <LineupShareCard ref={shareCardRef} imageUrl={shareData.url} title={name.trim() || lineup.name} date={shareData.date} location={lineup.city} note={shareData.note} onImageReady={captureAndShare} />
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

  // "Title" — the lineup's own name, the large heading (was the page title's font); stays gold.
  titleInput: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold, textAlign: 'center', letterSpacing: 0.5, paddingVertical: 4, marginTop: spacing.xs, alignSelf: 'stretch', paddingHorizontal: spacing.xl },
  headerStampWrap: { alignItems: 'center', paddingHorizontal: spacing.sm, marginTop: spacing.xs },

  unmatchLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },

  pickerOption: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerOptionText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  pickerOptionMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pickerRemove: { alignItems: 'center', paddingTop: spacing.md },
  pickerRemoveText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  headerStamp: { fontSize: 17, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.5, textAlign: 'center' },

  photoWrap: { alignItems: 'center', paddingTop: spacing.md },
  // The touchable owns the 92% width; the image fills it (a percentage width on
  // the image alone collapses to 0 inside an auto-width touchable).
  photoTouch: { width: '92%' },
  photo: { width: '100%', height: 420, borderRadius: 14, backgroundColor: colors.surface },
  // Change-photo badge, top-right on the photo.
  photoBadges: { position: 'absolute', top: spacing.lg, right: '8%', flexDirection: 'row', gap: spacing.sm },
  photoBadge: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 18, minWidth: 34, height: 32, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },

  stampOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  stampSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  stampTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.4, marginBottom: spacing.md },
  stampFieldLabel: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, marginBottom: 4, marginTop: spacing.sm, letterSpacing: 0.3 },
  stampInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  stampSaveBtn: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: 'rgba(224,184,74,0.12)' },
  stampSaveText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  winesHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

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

  dictateRowFlush: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  // Section headers — yellow, all-caps, matching the stats-bar type.
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.sm },
  noteBlock: { marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.xl },

  noteHeadLabel: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },

  // Saved note reads back as copy (like a review); tap to edit in the popup.
  // Match the Date · Location · Venue line's font (headingSemibold) so the note
  // reads consistently with the rest of the header, not in an odd body face.
  noteBodyText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, lineHeight: 22 },
  notePlaceholder: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  // White "match to a restaurant review" button at the foot of the page.
  matchBottomWrap: { alignItems: 'center', gap: spacing.sm },
  // Match + Export are the two foot buttons — same width so Export isn't a small
  // pill next to the long "Match to a Restaurant Review" label.
  matchButton: { alignSelf: 'center', alignItems: 'center', minWidth: '82%', borderWidth: 1, borderColor: colors.text, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  matchButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, letterSpacing: 0.3, textAlign: 'center' },
  exportButton: { alignSelf: 'center', alignItems: 'center', minWidth: '82%', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.md, backgroundColor: 'rgba(224,184,74,0.12)' },
  exportButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3, textAlign: 'center' },

  // Mic + ✕ cluster in the note/name editor headers; white ✕ to cancel.
  noteHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 0 },
  // In the editor popup's header row the title must shrink so the mic + close
  // icons stay on the sheet instead of overflowing to the right.
  noteEditorTitle: { flexShrink: 1, textAlign: 'left', marginBottom: 0, marginRight: spacing.sm },
  closeX: { fontFamily: fonts.bodyRegular, fontSize: 20, color: '#FFFFFF' },
  // Restaurant-match picker: white X, a "no match" dismiss link, then a divider.
  pickerCloseX: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 2, padding: 4 },
  noMatchRow: { paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center' },
  noMatchText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, textAlign: 'center', textDecorationLine: 'underline' },
  pickerDivider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },

  noteEditorInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, minHeight: 100, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },

  wineList: { paddingHorizontal: spacing.xl },
  wineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  // Region · grape line beneath the name — mirrors the Full Cellar List row detail.
  wineDetail: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  tagRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: 4 },

  // Non-link status stamps — all yellow (Off-cellar, Not reviewed, Archived).
  stampTag: { alignSelf: 'flex-start', fontSize: 11, fontFamily: fonts.bodySemibold, textTransform: 'uppercase', letterSpacing: 0.4, color: colors.gold, borderWidth: 1, borderColor: 'rgba(224,184,74,0.4)', paddingHorizontal: 8, paddingVertical: 1, borderRadius: 999, overflow: 'hidden' },
  viewLink: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold },
  tagDot: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  muted: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, lineHeight: 20 },
  offscreen: { position: 'absolute', left: -9999, top: -9999 },
});
