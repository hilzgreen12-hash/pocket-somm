import { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput, Modal, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { detectLineup, prepareImageBase64, type DetectedBottle } from '../../src/api/label';
import { matchLineupToCellar, archiveBottles, type NightMatch } from '../../src/services/archiveNight';
import { BottleSizePicker, bottleSizeCl } from '../../src/components/BottleSizePicker';
import { saveLineupArchive, setLineupNote, updateLineupStamp, type LineupArchive, type LineupWine } from '../../src/api/lineups';
import { captureCity } from '../../src/utils/captureCity';
import { foldAccents } from '../../src/utils/wineIdentity';
import type { CellarWine } from '../../src/types/wine';
import { LabelThumb } from '../../src/components/LabelThumb';
import { MicButton } from '../../src/components/MicButton';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { createManualRestaurantSession, deleteScanSession } from '../../src/api/restaurantSessions';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

type Stage = 'capture' | 'preview' | 'analyzing' | 'review' | 'archiving' | 'done';

export default function ArchiveNightScreen() {
  const { session } = useAuth();
  const { wines } = useCellar();
  const qc = useQueryClient();

  const [stage, setStage] = useState<Stage>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [matches, setMatches] = useState<NightMatch[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [unmatched, setUnmatched] = useState<DetectedBottle[]>([]);
  // Matched wine ids the user has UN-ticked (excluded from the archive). Default
  // empty = every matched wine is included.
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  // Cosmetic ticks on off-cellar rows (they have no cellar bottles to archive).
  const [offCellarTicked, setOffCellarTicked] = useState<Set<number>>(new Set());
  // Per-wine identity edit → re-match against the cellar to move it between the
  // Matched / Not-in-your-cellar sections.
  const [editTarget, setEditTarget] = useState<{ kind: 'matched'; wineId: string } | { kind: 'unmatched'; index: number } | null>(null);
  const [editWineDraft, setEditWineDraft] = useState({ producer: '', wineName: '', vintage: '', bottleSizeMl: 750 });
  const [archivedCount, setArchivedCount] = useState(0);
  // Whether the lineup photo made it into Your Lineup Library. Bottle archiving
  // is the critical action and must not be blocked by a photo failure, but we
  // shouldn't claim the photo saved when it didn't.
  const [photoSaved, setPhotoSaved] = useState(true);
  // The saved lineup row (when the photo made it to the Library) — lets the
  // done screen attach a "memory" note to it. Plus the note draft + save state.
  const [savedLineup, setSavedLineup] = useState<LineupArchive | null>(null);
  const [note, setNote] = useState('');
  const [showInstruction, setShowInstruction] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  // Editable date + location "stamp" on the Night Archived overlay (editable
  // text, not boxed inputs). Seeded from the saved lineup row.
  const [stampDate, setStampDate] = useState('');
  const [stampLocation, setStampLocation] = useState('');
  const [stampVenue, setStampVenue] = useState('');
  const [savingStamp, setSavingStamp] = useState(false);
  // "Please input the date, city and venue" prompt when Save is pressed with any
  // missing. missingFields freezes which were blank at open time so their inputs
  // don't vanish mid-type.
  const [missingPromptOpen, setMissingPromptOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<{ date: boolean; location: boolean; venue: boolean }>({ date: false, location: false, venue: false });

  // Seed the stamp fields once the lineup row lands (date defaults to its
  // archived date, location to any GPS-captured city).
  useEffect(() => {
    if (!savedLineup) return;
    setStampDate((savedLineup.archived_at ?? '').split('T')[0] || new Date().toISOString().split('T')[0]);
    setStampLocation(savedLineup.city ?? '');
    setStampVenue(savedLineup.venue ?? '');
  }, [savedLineup?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // "Where did you enjoy these bottles?" — Private Location is just selectable
  // for now (no input flow yet); A Restaurant opens the full review modal on a
  // blank manual restaurant session, saved to Your Restaurants.
  const [locationChoice, setLocationChoice] = useState<'private' | 'restaurant' | null>(null);
  const [restaurantSessionId, setRestaurantSessionId] = useState<string | null>(null);
  const [openingRestaurant, setOpeningRestaurant] = useState(false);
  const restaurantSavedRef = useRef(false);

  async function handleChooseRestaurant() {
    if (!session?.user.id || openingRestaurant) return;
    setOpeningRestaurant(true);
    try {
      const id = await createManualRestaurantSession(session.user.id);
      restaurantSavedRef.current = false;
      setRestaurantSessionId(id);
    } catch (err) {
      showAlert({ title: 'Could not start a review', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setOpeningRestaurant(false);
    }
  }

  // In-app camera capture → show the shot in the 'preview' stage, where the
  // user chooses Retake / Save to Lineup Library / Review Now.
  async function handleCapture() {
    if (!cameraRef.current) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 1 });
      if (!photo?.uri) return;
      setImageUri(photo.uri);
      setStage('preview');
    } catch (err) {
      showAlert({ title: 'Camera error', body: err instanceof Error ? err.message : 'Could not capture the photo. Please try again.' });
    }
  }

  // Upload an existing photo instead of shooting one — lands in the same preview.
  async function pickFromLibrary() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets.length) return;
      setImageUri(result.assets[0].uri);
      setStage('preview');
    } catch (err) {
      showAlert({ title: 'Could not open the photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Capture-first: the photo is saved to Your Lineup Library immediately, with
  // wines=null (the "awaiting attention" state). Confirming which bottles came
  // from the cellar and archiving them is deferred — the user tends to it later
  // from the library, when they have time, rather than itemising 8 bottles mid-
  // dinner. (The detect/match/confirm machinery below — analyze / confirmArchive
  // — is preserved for that deferred tend flow.)
  async function saveForLater(uri: string) {
    if (!session?.user.id) {
      showAlert({ title: 'Sign in needed', body: 'Sign in to save a lineup.' });
      setStage('capture');
      return;
    }
    setStage('archiving');
    try {
      const city = await captureCity();
      const row = await saveLineupArchive(session.user.id, uri, null, { city });
      setSavedLineup(row);
      setArchivedCount(0);
      qc.invalidateQueries({ queryKey: ['lineup-archives', session.user.id] });
      setStage('done');
      showAlert({ title: 'Saved', body: 'Photo saved to your Lineup Library.' });
    } catch (err) {
      showAlert({ title: 'Could not save the lineup', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  async function analyze(uri: string) {
    setStage('analyzing');
    try {
      const base64 = await prepareImageBase64(uri);
      const { bottles } = await detectLineup(base64);
      // Cap the lineup at 8 bottles.
      const capped = (bottles ?? []).slice(0, 8);
      const result = matchLineupToCellar(capped, wines);
      setMatches(result.matched);
      setUnmatched(result.unmatched);
      // Default each removal count to what was detected (capped at owned qty).
      const initial: Record<string, number> = {};
      result.matched.forEach((m) => { initial[m.wine.id] = Math.min(m.count, m.wine.quantity); });
      setCounts(initial);
      setStage('review');
    } catch (err) {
      showAlert({ title: 'Could not read the photo', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  function adjust(wineId: string, delta: number, maxQty: number) {
    setCounts((prev) => {
      const next = Math.max(0, Math.min(maxQty, (prev[wineId] ?? 0) + delta));
      return { ...prev, [wineId]: next };
    });
  }

  // Manual cellar match — Vinster's auto-match can miss a bottle it struggles to
  // read. Tapping any lined-up wine (matched or not) opens a "Which wine from
  // your cellar is this?" search so the user can pick the right cellar wine and
  // add it to (or correct it within) the matched list.
  const [pickerFor, setPickerFor] = useState<
    { kind: 'unmatched'; index: number } | { kind: 'matched'; wineId: string } | null
  >(null);
  const [pickerSearch, setPickerSearch] = useState('');

  function openPicker(target: { kind: 'unmatched'; index: number } | { kind: 'matched'; wineId: string }) {
    setPickerSearch('');
    setPickerFor(target);
  }

  function assignCellarWine(w: CellarWine) {
    const target = pickerFor;
    setPickerFor(null);
    if (!target) return;

    const mergeMatch = (list: NightMatch[], addCount: number): NightMatch[] => {
      const existing = list.find((m) => m.wine.id === w.id);
      if (existing) return list.map((m) => (m.wine.id === w.id ? { ...m, count: m.count + addCount } : m));
      return [...list, { wine: w, count: addCount, anyUnconfident: false }];
    };
    const seedCount = (prev: Record<string, number>, addCount: number) => ({
      ...prev,
      [w.id]: Math.min(w.quantity, (prev[w.id] ?? 0) + addCount),
    });

    if (target.kind === 'unmatched') {
      const detectedQty = unmatched[target.index]?.quantity ?? 1;
      setUnmatched((prev) => prev.filter((_, idx) => idx !== target.index));
      setMatches((prev) => mergeMatch(prev, detectedQty));
      setCounts((prev) => seedCount(prev, detectedQty));
      return;
    }

    // Re-assigning a matched row to a different cellar wine — carry its count.
    const oldId = target.wineId;
    if (oldId === w.id) return;
    setMatches((prev) => {
      const carried = prev.find((m) => m.wine.id === oldId)?.count ?? 1;
      return mergeMatch(prev.filter((m) => m.wine.id !== oldId), carried);
    });
    setCounts((prev) => {
      const carried = prev[oldId] ?? 0;
      const { [oldId]: _removed, ...rest } = prev;
      return { ...rest, [w.id]: Math.min(w.quantity, (rest[w.id] ?? 0) + carried) };
    });
  }

  const totalToArchive = matches.reduce((sum, m) => (excluded.has(m.wine.id) ? sum : sum + (counts[m.wine.id] ?? 0)), 0);

  // Lineup composition for the stats bar — every bottle/wine photographed.
  const lineupWineCount = matches.length + unmatched.length;
  const lineupBottleCount =
    matches.reduce((s, m) => s + m.count, 0) + unmatched.reduce((s, b) => s + (b.quantity ?? 1), 0);

  function toggleExcluded(wineId: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(wineId)) next.delete(wineId); else next.add(wineId);
      return next;
    });
  }
  function toggleOffCellar(i: number) {
    setOffCellarTicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  function openEditWine(target: { kind: 'matched'; wineId: string } | { kind: 'unmatched'; index: number }) {
    if (target.kind === 'matched') {
      const m = matches.find((x) => x.wine.id === target.wineId);
      if (!m) return;
      setEditWineDraft({ producer: m.wine.producer ?? '', wineName: m.wine.wine_name ?? '', vintage: m.wine.vintage != null ? String(m.wine.vintage) : '', bottleSizeMl: m.wine.bottle_size_ml ?? 750 });
    } else {
      const b = unmatched[target.index];
      if (!b) return;
      setEditWineDraft({ producer: b.producer ?? '', wineName: b.wineName ?? '', vintage: b.vintage != null ? String(b.vintage) : '', bottleSizeMl: b.bottleSizeMl ?? 750 });
    }
    setEditTarget(target);
  }

  // Save an identity edit, then re-match against the live cellar so the wine
  // lands in the right section (Matched vs Not in your cellar).
  function saveEditWine() {
    const target = editTarget;
    if (!target) return;
    const priorCount =
      target.kind === 'matched' ? (counts[target.wineId] ?? 0) : (unmatched[target.index]?.quantity ?? 1);
    const bottle: DetectedBottle = {
      producer: editWineDraft.producer.trim() || null,
      wineName: editWineDraft.wineName.trim() || editWineDraft.producer.trim(),
      vintage: editWineDraft.vintage.trim() || null,
      confident: true,
      quantity: Math.max(1, priorCount),
      bottleSizeMl: editWineDraft.bottleSizeMl,
    } as DetectedBottle;

    const { matched: mm, unmatched: uu } = matchLineupToCellar([bottle], wines);
    setEditTarget(null);

    // Remove the edited wine from wherever it currently lives.
    if (target.kind === 'matched') {
      setMatches((prev) => prev.filter((m) => m.wine.id !== target.wineId));
      setCounts((prev) => { const { [target.wineId]: _drop, ...rest } = prev; return rest; });
      setExcluded((prev) => { const next = new Set(prev); next.delete(target.wineId); return next; });
    } else {
      setUnmatched((prev) => prev.filter((_, idx) => idx !== target.index));
      setOffCellarTicked(new Set()); // indices shift; clear cosmetic ticks
    }

    if (mm.length) {
      const nm = mm[0];
      setMatches((prev) => {
        const existing = prev.find((m) => m.wine.id === nm.wine.id);
        if (existing) return prev.map((m) => (m.wine.id === nm.wine.id ? { ...m, count: m.count + nm.count } : m));
        return [...prev, nm];
      });
      setCounts((prev) => ({ ...prev, [nm.wine.id]: Math.min(nm.wine.quantity, (prev[nm.wine.id] ?? 0) + Math.max(1, priorCount)) }));
    } else {
      setUnmatched((prev) => [...prev, bottle]);
    }
  }

  async function handleSaveNote() {
    if (!savedLineup || savingNote || !note.trim()) return;
    setSavingNote(true);
    try {
      await setLineupNote(savedLineup.id, note);
      setNoteSaved(true);
      if (session?.user.id) qc.invalidateQueries({ queryKey: ['lineup-archives', session.user.id] });
    } catch (err) {
      showAlert({ title: 'Could not save note', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingNote(false);
    }
  }

  // Persist the editable date + location stamp and the note to the saved lineup
  // row. Shared by Save and the "missing fields" prompt.
  async function persistStampAndNote() {
    if (!savedLineup) return;
    setSavingStamp(true);
    try {
      await updateLineupStamp(savedLineup.id, {
        archivedAt: stampDate.trim() ? `${stampDate.trim()}T12:00:00.000Z` : undefined,
        city: stampLocation.trim() || null,
        venue: stampVenue.trim() || null,
      });
      if (note.trim()) await setLineupNote(savedLineup.id, note);
      if (session?.user.id) qc.invalidateQueries({ queryKey: ['lineup-archives', session.user.id] });
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
      throw err;
    } finally {
      setSavingStamp(false);
    }
  }

  // Save lands the user on Your Lineup Library.
  function handleStampSave() {
    // Date, city and venue are all required — prompt for whatever's blank.
    const needDate = !stampDate.trim();
    const needLoc = !stampLocation.trim();
    const needVenue = !stampVenue.trim();
    if (needDate || needLoc || needVenue) { setMissingFields({ date: needDate, location: needLoc, venue: needVenue }); setMissingPromptOpen(true); return; }
    void persistStampAndNote().then(() => router.replace('/cellar/lineups')).catch(() => {});
  }

  const missingStillBlank =
    (missingFields.date && !stampDate.trim()) ||
    (missingFields.location && !stampLocation.trim()) ||
    (missingFields.venue && !stampVenue.trim());
  function handleMissingSave() {
    if (missingStillBlank) return; // stay open until the prompted fields are filled
    setMissingPromptOpen(false);
    void persistStampAndNote().then(() => router.replace('/cellar/lineups')).catch(() => {});
  }

  async function confirmArchive() {
    if (!session?.user.id || totalToArchive === 0) return;
    setStage('archiving');
    const today = new Date().toISOString().split('T')[0];
    try {
      for (const m of matches) {
        if (excluded.has(m.wine.id)) continue;
        const n = counts[m.wine.id] ?? 0;
        if (n > 0) await archiveBottles(m.wine, n, today);
      }
      // Save the lineup photo to Your Lineup Library. Non-fatal: a photo
      // failure must not lose the (already-committed) archiving, but we record
      // the outcome so the done screen tells the truth.
      let savedPhoto = false;
      if (imageUri) {
        try {
          // Persist the lineup's bottles (migration 065): matched cellar wines
          // (flagged as archived when the user kept a count) + off-cellar
          // bottles. Plus a best-effort city stamp.
          const lineupWines: LineupWine[] = [
            ...matches.map((m) => ({
              producer: m.wine.producer,
              wine_name: m.wine.wine_name,
              vintage: m.wine.vintage,
              cellar_wine_id: m.wine.id,
              archived: !excluded.has(m.wine.id) && (counts[m.wine.id] ?? 0) > 0,
              count: m.count,
            })),
            ...unmatched.map((b) => ({
              producer: b.producer ?? null,
              wine_name: b.wineName,
              vintage: b.vintage,
              cellar_wine_id: null,
              archived: false,
              count: b.quantity ?? 1,
            })),
          ];
          const city = await captureCity();
          const row = await saveLineupArchive(session.user.id, imageUri, totalToArchive, { wines: lineupWines, city });
          setSavedLineup(row);
          savedPhoto = true;
        } catch (e) {
          console.warn('saveLineupArchive failed:', e);
        }
      }
      setPhotoSaved(savedPhoto);
      qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives', session.user.id] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      setArchivedCount(totalToArchive);
      setStage('done');
    } catch (err) {
      showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('review');
    }
  }

  return (
    <View style={styles.container}>
      {/* The "Night Archived" step is a bottom-rising overlay, so it drops the
          shared "Archive a Night" header. */}
      {stage !== 'done' ? (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Archive a Night</Text>
          <View style={styles.headerSpacer} />
        </View>
      ) : null}

      {stage === 'capture' ? (
        !permission ? (
          <View style={styles.cameraWrap} />
        ) : !permission.granted ? (
          <PermissionScreen onRequest={requestPermission} hideBack />
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" autofocus="on" />
            {/* Simple instruction over the scanner. The fuller "what is Archive
                a Night" blurb now lives on the button's long-press in Cellar.
                Dismissible so it never blocks framing a shot. */}
            {showInstruction ? (
              <View style={styles.instructionCard}>
                <TouchableOpacity style={styles.instructionClose} onPress={() => setShowInstruction(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.instructionCloseText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.instructionText}>Photograph up to 8 bottles with their front labels facing the camera.</Text>
              </View>
            ) : null}
            <View style={styles.cameraControls}>
              <View style={styles.sideAction} />
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.85}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
              <View style={styles.sideAction} />
            </View>
          </View>
        )
      ) : stage === 'preview' ? (
        <View style={styles.cameraWrap}>
          {/* 'contain' so a landscape lineup shows in full on the portrait
              confirm screen — 'cover' cropped most of the bottles out. */}
          {imageUri ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="contain" /> : null}
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewNeutral} onPress={() => { if (imageUri) void analyze(imageUri); }} activeOpacity={0.85}>
              <Text style={styles.previewNeutralText}>Review Now & Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewNeutral} onPress={() => { if (imageUri) void saveForLater(imageUri); }} activeOpacity={0.85}>
              <Text style={styles.previewNeutralText}>Save & Review Later</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewSecondary} onPress={() => { setImageUri(null); setStage('capture'); }} activeOpacity={0.85}>
              <Text style={styles.previewSecondaryText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : stage === 'analyzing' ? (
        <View style={styles.centerBlock}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" /> : null}
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Vinster is reading your bottles…</Text>
        </View>
      ) : stage === 'archiving' ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Saving your lineup…</Text>
        </View>
      ) : stage === 'done' ? (
        // The Night Archived overlay rises from the bottom (rendered below);
        // this is just its dark backdrop.
        <View style={styles.doneBackdrop} />
      ) : (
        // review
        <ScrollView contentContainerStyle={styles.content}>
          {matches.length === 0 && unmatched.length === 0 ? (
            <>
              {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" /> : null}
              <Text style={styles.hint}>Vinster couldn't match any of these bottles to your cellar. Try a clearer photo with the front labels showing.</Text>
            </>
          ) : (
            <>
              {/* Yellow stats bar below the header, then the lineup photo. */}
              <View style={styles.statsBar}>
                <Text style={styles.statsBarText}>
                  {lineupBottleCount} {lineupBottleCount === 1 ? 'Bottle' : 'Bottles'} · {lineupWineCount} {lineupWineCount === 1 ? 'Wine' : 'Wines'}
                </Text>
              </View>
              {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" /> : null}

              {matches.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>Matched in your cellar</Text>
                  {matches.map((m) => {
                    const n = counts[m.wine.id] ?? 0;
                    const ticked = !excluded.has(m.wine.id);
                    const label = m.wine.vintage ? `${m.wine.vintage} ${m.wine.wine_name}` : m.wine.wine_name;
                    return (
                      <View key={m.wine.id} style={[styles.row, !ticked && styles.rowMuted]}>
                        <TouchableOpacity style={styles.checkbox} onPress={() => toggleExcluded(m.wine.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Text style={[styles.checkboxText, ticked && styles.checkboxTextOn]}>{ticked ? '☑' : '☐'}</Text>
                        </TouchableOpacity>
                        <View style={styles.rowText}>
                          <Text style={styles.rowName} numberOfLines={2}>{label}, {n}x{bottleSizeCl(m.wine.bottle_size_ml ?? 750)}cl</Text>
                          <View style={styles.stepperInline}>
                            <TouchableOpacity style={styles.stepBtn} onPress={() => adjust(m.wine.id, -1, m.wine.quantity)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                              <Text style={styles.stepBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepCount}>{n}</Text>
                            <TouchableOpacity style={styles.stepBtn} onPress={() => adjust(m.wine.id, 1, m.wine.quantity)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                              <Text style={styles.stepBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                          {m.anyUnconfident ? <Text style={styles.unconfident}>Low-confidence read — check this one</Text> : null}
                        </View>
                        <TouchableOpacity onPress={() => openEditWine({ kind: 'matched', wineId: m.wine.id })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </>
              ) : null}

              {unmatched.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Not in your cellar</Text>
                  {unmatched.map((b, i) => {
                    const ticked = offCellarTicked.has(i);
                    const label = [b.vintage, b.producer, b.wineName].filter(Boolean).join(' ') || 'Unreadable bottle';
                    return (
                      <View key={i} style={styles.row}>
                        <TouchableOpacity style={styles.checkbox} onPress={() => toggleOffCellar(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Text style={[styles.checkboxText, ticked && styles.checkboxTextOn]}>{ticked ? '☑' : '☐'}</Text>
                        </TouchableOpacity>
                        <View style={styles.rowText}>
                          <Text style={styles.rowName} numberOfLines={2}>{label}, {b.quantity ?? 1}x{bottleSizeCl(b.bottleSizeMl ?? 750)}cl</Text>
                        </View>
                        <TouchableOpacity onPress={() => openEditWine({ kind: 'unmatched', index: i })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </>
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, totalToArchive === 0 && styles.primaryBtnDisabled]}
            onPress={confirmArchive}
            disabled={totalToArchive === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {totalToArchive === 0 ? 'Nothing selected' : `Archive ${totalToArchive} bottle${totalToArchive === 1 ? '' : 's'}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setStage('capture'); setImageUri(null); }} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Retake</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Night Archived — a bottom-rising overlay: photo, editable Date · City ·
          Venue stamp (all required), a note with mic + trash, then Save / Cancel.
          Save lands on Your Lineup Library. */}
      <Modal visible={stage === 'done'} transparent animationType="slide" onRequestClose={() => router.back()}>
        <View style={styles.overlayRoot}>
          <View style={styles.overlaySheet}>
            <KeyboardAwareScrollView contentContainerStyle={styles.overlayContent} keyboardShouldPersistTaps="handled" bottomOffset={24}>
              <Text style={styles.overlayTitle}>{archivedCount > 0 ? 'Night Archived' : 'Lineup Saved'}</Text>

              {/* Date · City · Venue — a stats bar directly beneath the title,
                  above the photo. Editable; all three required to save. */}
              <View style={styles.stampRow}>
                <TextInput
                  style={styles.stampText}
                  value={stampDate}
                  onChangeText={(t) => setStampDate(t.replace(/[^0-9-]/g, '').slice(0, 10))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
                <Text style={styles.stampSep}>·</Text>
                <TextInput
                  style={styles.stampText}
                  value={stampLocation}
                  onChangeText={setStampLocation}
                  placeholder="City"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.stampSep}>·</Text>
                <TextInput
                  style={styles.stampText}
                  value={stampVenue}
                  onChangeText={setStampVenue}
                  placeholder="Venue"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {imageUri ? (
                <Image source={{ uri: imageUri }} style={[styles.overlayPhoto, { height: Math.round(Dimensions.get('window').height / 3) }]} resizeMode="contain" />
              ) : null}

              {/* Note — mic + gold bin (MicButton's own clear) sit above-right. */}
              <View style={styles.noteHeadRow}>
                <Text style={styles.notePrompt}>Keep a note for reference in your Lineup Library</Text>
                <View style={styles.noteIconsRow}>
                  <MicButton
                    value={note}
                    onChangeText={(t) => { setNote(t); if (noteSaved) setNoteSaved(false); }}
                    onClear={() => { setNote(''); if (noteSaved) setNoteSaved(false); }}
                  />
                </View>
              </View>
              <TextInput
                style={styles.noteInputFull}
                value={note}
                onChangeText={(t) => { setNote(t); if (noteSaved) setNoteSaved(false); }}
                placeholder="Tap the mic to speak, or type a few words…"
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity style={[styles.overlaySaveBtnWhite, savingStamp && styles.primaryBtnDisabled]} onPress={handleStampSave} disabled={savingStamp} activeOpacity={0.85}>
                <Text style={styles.overlaySaveTextWhite}>{savingStamp ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.overlayCancel} onPress={() => router.back()} activeOpacity={0.7}>
                <Text style={styles.overlayCancelText}>Cancel</Text>
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>

      {/* "Please input the date and location" — shown when Save is pressed with
          either missing; edits the same stamp fields, with its own Save. */}
      <Modal visible={missingPromptOpen} transparent animationType="fade" onRequestClose={() => setMissingPromptOpen(false)}>
        <View style={styles.promptOverlay}>
          <View style={styles.promptSheet}>
            <Text style={styles.promptTitle}>
              Please input the {[missingFields.date && 'date', missingFields.location && 'city', missingFields.venue && 'venue'].filter(Boolean).join(', ').replace(/, ([^,]*)$/, ' and $1')}
            </Text>
            {missingFields.date ? (
              <TextInput
                style={styles.promptInput}
                value={stampDate}
                onChangeText={(t) => setStampDate(t.replace(/[^0-9-]/g, '').slice(0, 10))}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                autoFocus
              />
            ) : null}
            {missingFields.location ? (
              <TextInput
                style={styles.promptInput}
                value={stampLocation}
                onChangeText={setStampLocation}
                placeholder="City"
                placeholderTextColor={colors.textMuted}
                autoFocus={!missingFields.date}
              />
            ) : null}
            {missingFields.venue ? (
              <TextInput
                style={styles.promptInput}
                value={stampVenue}
                onChangeText={setStampVenue}
                placeholder="Venue"
                placeholderTextColor={colors.textMuted}
                autoFocus={!missingFields.date && !missingFields.location}
              />
            ) : null}
            <TouchableOpacity style={[styles.overlaySaveBtn, missingStillBlank && styles.primaryBtnDisabled]} onPress={handleMissingSave} disabled={missingStillBlank} activeOpacity={0.85}>
              <Text style={styles.overlaySaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit a lined-up wine's identity — on save it re-matches against the
          cellar and moves between the Matched / Not-in-your-cellar sections. */}
      <Modal visible={editTarget !== null} transparent animationType="fade" onRequestClose={() => setEditTarget(null)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <Text style={styles.editWineHeader} numberOfLines={2}>
              {[editWineDraft.producer, editWineDraft.wineName].filter(Boolean).join(' ') || 'Edit wine'}
              {editWineDraft.vintage.trim() ? ` ${editWineDraft.vintage.trim()}` : ''}
            </Text>
            {editTarget?.kind === 'matched' ? (
              <Text style={styles.editFromCellar}>This is from My Full Cellar List, find it.</Text>
            ) : null}
            <Text style={styles.editFieldLabel}>Producer</Text>
            <TextInput style={styles.editInput} value={editWineDraft.producer} onChangeText={(t) => setEditWineDraft((d) => ({ ...d, producer: t }))} placeholder="e.g. Château Batailley" placeholderTextColor={colors.textMuted} />
            <Text style={styles.editFieldLabel}>Wine name</Text>
            <TextInput style={styles.editInput} value={editWineDraft.wineName} onChangeText={(t) => setEditWineDraft((d) => ({ ...d, wineName: t }))} placeholder="Cuvée / wine name" placeholderTextColor={colors.textMuted} />
            <Text style={styles.editFieldLabel}>Vintage</Text>
            <TextInput style={styles.editInput} value={editWineDraft.vintage} onChangeText={(t) => setEditWineDraft((d) => ({ ...d, vintage: t.slice(0, 7) }))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={7} />
            <Text style={styles.editFieldLabel}>Format</Text>
            <BottleSizePicker value={editWineDraft.bottleSizeMl} onChange={(ml) => setEditWineDraft((d) => ({ ...d, bottleSizeMl: ml }))} />
            <TouchableOpacity style={[styles.editSaveBtn, { marginTop: spacing.lg }]} onPress={saveEditWine} activeOpacity={0.85}>
              <Text style={styles.editSaveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setEditTarget(null)}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* "Which wine from your cellar is this?" — manual match picker. Type or
          dictate to search the cellar; picking a wine adds/corrects the match. */}
      <Modal visible={pickerFor !== null} transparent animationType="fade" onRequestClose={() => setPickerFor(null)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Which wine from your cellar is this?</Text>
            <View style={styles.pickerSearchRow}>
              <TextInput
                style={styles.pickerSearchInput}
                value={pickerSearch}
                onChangeText={setPickerSearch}
                placeholder="Type or dictate the wine…"
                placeholderTextColor={colors.textMuted}
                autoFocus
                autoCorrect={false}
              />
              <MicButton value={pickerSearch} onChangeText={setPickerSearch} onClear={() => setPickerSearch('')} />
            </View>
            {(() => {
              const q = foldAccents(pickerSearch.trim());
              const rows = wines
                .filter((w) => {
                  if (!q) return true;
                  const hay = foldAccents([w.producer, w.wine_name, w.region, w.grape_variety, w.vintage != null ? String(w.vintage) : null].filter(Boolean).join(' '));
                  return hay.includes(q);
                })
                .sort((a, b) => (a.wine_name ?? '').localeCompare(b.wine_name ?? ''));
              return (
                <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
                  {rows.length === 0 ? (
                    <Text style={styles.pickerEmpty}>No cellar wines match.</Text>
                  ) : rows.map((w) => {
                    const wl = w.vintage ? `${w.vintage} ${w.wine_name}` : w.wine_name;
                    return (
                      <TouchableOpacity key={w.id} style={styles.pickerOption} onPress={() => assignCellarWine(w)} activeOpacity={0.7}>
                        <LabelThumb path={w.label_image_path} fallbackText={w.wine_name} style={styles.pickerThumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pickerOptionName} numberOfLines={2}>{wl}</Text>
                          <Text style={styles.pickerOptionMeta} numberOfLines={1}>
                            {[w.producer, w.quantity ? `${w.quantity} in cellar` : null].filter(Boolean).join(' · ')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              );
            })()}
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setPickerFor(null)}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Restaurant review on a blank manual session, saved to Your Restaurants.
          Cancelling without saving removes the empty draft. */}
      {restaurantSessionId ? (
        <RestaurantReviewModal
          visible
          sessionId={restaurantSessionId}
          initialName={null}
          initialNote={null}
          initialRatings={null}
          initialFavourite={false}
          city={null}
          date={null}
          wines={[]}
          onClose={() => {
            if (restaurantSessionId && !restaurantSavedRef.current) void deleteScanSession(restaurantSessionId);
            setRestaurantSessionId(null);
          }}
          onSaved={() => { restaurantSavedRef.current = true; setLocationChoice('restaurant'); setRestaurantSessionId(null); }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // In-app camera scan screen + preview
  cameraWrap: { flex: 1, backgroundColor: '#000' },
  instructionCard: {
    position: 'absolute', top: spacing.lg, left: spacing.xl, right: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, borderWidth: 1, borderColor: colors.gold,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  instructionText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: '#FFFFFF', textAlign: 'center', lineHeight: 21, paddingHorizontal: spacing.md },
  instructionClose: { position: 'absolute', top: 2, right: 4, padding: 6, zIndex: 2 },
  instructionCloseText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.gold },
  cameraControls: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl,
  },
  sideAction: { width: 80, alignItems: 'center' },
  sideActionText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  captureBtn: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF' },
  previewActions: {
    position: 'absolute', bottom: 40, left: spacing.xl, right: spacing.xl, gap: spacing.sm,
  },
  previewSecondary: { borderWidth: 1, borderColor: colors.gold, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center' },
  previewSecondaryText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Neutral (white) preview actions — only Retake is gold.
  previewNeutral: { borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center' },
  previewNeutralText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: '#FFFFFF' },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 44 },
  headerSpacer: { width: 44 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  content: { padding: spacing.xl, paddingBottom: 60 },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  lead: { fontSize: 17, fontFamily: fonts.headingRegular, color: colors.text, lineHeight: 24, textAlign: 'center', marginBottom: spacing.sm },
  leadBody: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted, lineHeight: 22, textAlign: 'center', marginBottom: spacing.md },
  hint: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  hintSmall: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  preview: { width: '80%', height: 240, borderRadius: 12, backgroundColor: '#000' },
  previewSmall: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#000', marginBottom: spacing.md },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  // Done-screen buttons — match the Cellar tab's Archive a Night / Cellar
  // Archive buttons (full-width, white border, rounded 14).
  doneBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  doneBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  doneTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center' },
  doneContent: { padding: spacing.xl, paddingTop: spacing.xl * 2, paddingBottom: 60, gap: spacing.md },
  // Non-italic — the count summary + the "fun session" blurb read as plain copy.
  // Count summary in gold; "Fun session!" + note prompt in white.
  doneCount: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', lineHeight: 20 },
  doneBlurb: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 22, marginTop: spacing.sm, textAlign: 'center' },
  notePrompt: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text, lineHeight: 20 },
  noteHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  noteIconsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  noteInputFull: { minHeight: 88, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  locationRow: { flexDirection: 'row', gap: spacing.sm },
  locationBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  locationBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.12)' },
  locationBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  locationBtnTextActive: { color: colors.gold },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  noteInput: { flex: 1, minHeight: 88, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  // Save note — gold, but the SAME footprint as the View Cellar Archive / Done buttons.
  saveNoteBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  saveNoteText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // Night Archived overlay (bottom sheet).
  doneBackdrop: { flex: 1, backgroundColor: colors.background },
  noteIcons: { alignItems: 'center', gap: spacing.sm, paddingTop: 4 },
  overlayRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  overlaySheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '94%', paddingTop: spacing.sm },
  overlayContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 40, gap: spacing.sm },
  overlayTitle: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center' },
  overlayPhoto: { width: '100%', borderRadius: 12, backgroundColor: '#000' },
  stampRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm, marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  stampText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3, paddingVertical: 2, textAlign: 'center', minWidth: 80, flexShrink: 1 },
  stampSep: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
  overlaySaveBtn: { alignSelf: 'stretch', backgroundColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  overlaySaveText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 16 },
  // Night Archived overlay Save — unfilled white bubble, white font.
  overlaySaveBtnWhite: { alignSelf: 'stretch', backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  overlaySaveTextWhite: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 16 },
  // Edit-wine Save — unfilled bubble, gold outline + gold font.
  editSaveBtn: { alignSelf: 'stretch', backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center' },
  editSaveText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  // Edit-wine header + "from your cellar list" prompt.
  editWineHeader: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text, marginBottom: 4 },
  editFromCellar: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, marginBottom: spacing.sm },
  overlaySecondaryBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center' },
  overlaySecondaryText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 16 },
  overlayCancel: { alignSelf: 'center', paddingVertical: spacing.sm, marginTop: 2 },
  overlayCancelText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15, textDecorationLine: 'underline' },
  // "Please input the date and location" prompt.
  promptOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  promptSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: spacing.sm },
  promptTitle: { fontFamily: fonts.bodySemibold, fontSize: 17, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  promptInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMuted: { opacity: 0.45 },
  thumb: { width: 40, height: 52, borderRadius: 4 },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  rowMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  unconfident: { fontFamily: fonts.bodyItalic, fontSize: 11, color: colors.gold, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepperInline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 6 },
  stepBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.gold, lineHeight: 20 },
  stepCount: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, minWidth: 18, textAlign: 'center' },
  // Consistent gold stats bar shared with Add a Lineup.
  statsBar: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  statsBarText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  checkbox: { paddingRight: 2 },
  checkboxText: { fontSize: 22, color: colors.textMuted, lineHeight: 24 },
  checkboxTextOn: { color: colors.gold },
  editLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  editFieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: spacing.md, marginBottom: 4 },
  editInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  unmatchedLine: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  unmatchedRow: { paddingVertical: spacing.xs },
  // Gold affordance link on lineup rows — opens the manual cellar picker.
  matchLink: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3 },
  // Manual cellar picker modal.
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  pickerSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  pickerTitle: { fontFamily: fonts.bodySemibold, fontSize: 18, color: colors.text, marginBottom: spacing.md },
  pickerSearchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  pickerSearchInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  pickerEmpty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  pickerOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerThumb: { width: 34, height: 44, borderRadius: 4 },
  pickerOptionName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  pickerOptionMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pickerCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  pickerCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
