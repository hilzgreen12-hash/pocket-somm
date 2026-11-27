import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar, invalidateCellarViews } from '../../src/hooks/useCellar';
import { ensureConnectionForUpload } from '../../src/utils/connectionGuard';
import { useRacks } from '../../src/hooks/useRacks';
import { useAuth } from '../../src/hooks/useAuth';
import { useLineupStore } from '../../src/stores/lineupStore';
import { detectLineup, prepareImageBase64, scanLabel, type DetectedBottle } from '../../src/api/label';
import { findCellarWineByIdentity, getCellarWineById } from '../../src/api/cellar';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { rackRoomFor } from '../../src/services/rackMoves';
import { wineNameKey, looseWineMatch } from '../../src/utils/wineIdentity';
import { findSameCellarWine } from '../../src/utils/wineMatch';
import { BottleSizePicker, bottleSizeCl, bottleSizeLabel } from '../../src/components/BottleSizePicker';
import type { CellarWine } from '../../src/types/wine';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import { launchCamera, launchImageLibrary } from '../../src/utils/imagePicker';

type Stage = 'capture' | 'analyzing' | 'review';

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

// Crop one bottle's label out of the lineup photo for its cellar thumbnail. The
// detected box is tight on the label, so pad it a little for context. Returns
// null when the box is too small to be useful.
async function cropLabel(
  imageUri: string, dims: { width: number; height: number }, box: NonNullable<DetectedBottle['box']>,
): Promise<string | null> {
  const pad = 0.05;
  const fx = Math.max(0, box.x - pad);
  const fy = Math.max(0, box.y - pad);
  const fw = Math.min(1 - fx, box.w + pad * 2);
  const fh = Math.min(1 - fy, box.h + pad * 2);
  const originX = Math.max(0, Math.round(fx * dims.width));
  const originY = Math.max(0, Math.round(fy * dims.height));
  const width = Math.min(dims.width - originX, Math.round(fw * dims.width));
  const height = Math.min(dims.height - originY, Math.round(fh * dims.height));
  if (width <= 10 || height <= 10) return null;
  const cropped = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ crop: { originX, originY, width, height } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );
  return cropped.uri;
}

// A minimal new cellar row for a lineup bottle; intel fills in when its card
// is first opened.
function newCellarRow(b: DetectedBottle, userId: string, quantity: number, extra: Record<string, unknown> = {}) {
  return {
    priceEstimate: 'market',
    // Its label is cropped from the lineup photo, so no web label is needed.
    hasOwnPhoto: !!(b.overrideImageUri || b.box),
    user_id: userId,
    wine_name: b.wineName || b.producer,
    producer: b.producer,
    region: b.region ?? null,
    vintage: b.vintage ?? null,
    quantity,
    storage_location: null,
    date_received: new Date().toISOString().split('T')[0],
    critic_score: null,
    critic_score_note: null,
    drinking_window_from: null,
    drinking_window_to: null,
    drinking_window_status: 'unknown',
    tasting_notes: null,
    grape_variety: b.grape ?? null,
    label_image_path: null,
    user_notes: null,
    estimated_value: null,
    estimated_value_currency: null,
    estimated_value_at: null,
    estimated_value_source: null,
    purchase_price: null,
    purchase_price_currency: null,
    bottle_size_ml: b.bottleSizeMl ?? 750,
    ...extra,
  } as any;
}

export default function ScanLineupScreen() {
  const { wines: cellarWines, addWine, updateWine } = useCellar();
  const { racks } = useRacks();
  const { session } = useAuth();
  const qc = useQueryClient();
  const { wines: lineupWines, imageUri, originRackId, setLineup, updateBottle } = useLineupStore();

  // After the list is confirmed, the bottles go back to the rack "awaiting
  // placement" and the user taps an empty slot for each one, in scan order.
  const [placing, setPlacing] = useState(false);
  // Rows already saved by an earlier attempt that then hit a snag — trying
  // again only adds the rest.
  const [savedRows, setSavedRows] = useState<ReadonlySet<number>>(new Set());
  // Synchronous double-tap guard — `placing` state lands a render too late.
  const placingRef = useRef(false);
  // Quick batch confirm: each row is ticked once reviewed/edited; "Add Bottles"
  // unlocks when all are ticked.
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState({ producer: '', wineName: '', region: '', vintage: '', bottleSizeMl: 750, quantity: 1, overrideImageUri: null as string | null });
  const [scanningEdit, setScanningEdit] = useState(false);
  // "+ Add more bottles vertically" — the per-wine bottle count, moved out of the
  // Edit sheet into its own small stepper popup.
  const [bottlesIndex, setBottlesIndex] = useState<number | null>(null);
  const [bottlesQty, setBottlesQty] = useState(1);

  // If the store already holds a lineup (we've come back mid-flow), open
  // straight onto the review list.
  const [stage, setStage] = useState<Stage>(lineupWines.length > 0 ? 'review' : 'capture');
  // Live in-app camera (matches Archive a Lineup) — go straight to the scanner
  // with an instruction overlay, no take/upload chooser.
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [showInstruction, setShowInstruction] = useState(true);

  async function handleCapture() {
    if (!cameraRef.current) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 1 });
      if (!photo?.uri) return;
      await analyze(photo.uri, false);
    } catch (err) {
      showAlert({ title: 'Camera error', body: err instanceof Error ? err.message : 'Could not capture the photo. Please try again.' });
    }
  }

  // ?upload=1 (the "upload instead" entry) uses the photo library, never the
  // camera: the picker opens straight away on arrival.
  const params = useLocalSearchParams<{ upload?: string }>();
  const isUpload = params.upload === '1';
  const uploadTriggeredRef = useRef(false);
  useEffect(() => {
    if (isUpload && stage === 'capture' && !uploadTriggeredRef.current) {
      uploadTriggeredRef.current = true;
      void pickFromLibrary(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpload, stage]);

  // Cancelling the first picker leaves the flow (there's nothing behind it);
  // cancelling a Retake keeps the current read.
  async function pickFromLibrary(leaveOnCancel: boolean) {
    try {
      const result = await launchImageLibrary({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets.length) { if (leaveOnCancel) router.back(); return; }
      // Read the photo exactly as taken — never auto-rotate. A 180° flip also
      // mirrors left↔right, so flipping an already-upright rack shot would
      // reverse the bottle order and place the lineup back-to-front.
      await analyze(result.assets[0].uri);
    } catch (err) {
      showAlert({ title: 'Could not open the photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function retake() {
    if (isUpload) { void pickFromLibrary(false); return; }
    setStage('capture');
  }

  async function analyze(uri: string, flip = false) {
    if (!(await ensureConnectionForUpload())) return;
    setStage('analyzing');
    try {
      // Normalise to ONE upright, EXIF-baked image used for BOTH detection and
      // the cropped label thumbnails. Keeping them the same image is what stops
      // the crops coming out sideways: the resize bakes the photo's EXIF
      // orientation into the pixels, so Claude's bounding boxes and the crop
      // share a coordinate space. `flip` adds the 180° turn for neck-forward
      // rack shots (applied before the resize).
      const actions = flip
        ? [{ rotate: 180 as const }, { resize: { width: 1600 } }]
        : [{ resize: { width: 1600 } }];
      const prepped = await ImageManipulator.manipulateAsync(
        uri, actions,
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );
      const workUri = prepped.uri;
      const base64 = prepped.base64;
      if (!base64) throw new Error('Could not process the photo.');
      const { bottles } = await detectLineup(base64);
      const raw = bottles ?? [];
      // Adding to the cellar is capped at 6 physical bottles (Archive a Night
      // takes 8) — larger lineups get misread and misplaced.
      if (raw.length > 6) {
        showAlert({
          title: 'Too many bottles',
          body: 'Add a Lineup takes up to 6 bottles at a time. Please retake the photo with 6 bottles or fewer.',
        });
        setStage('capture');
        return;
      }
      // Batch identical bottles (same producer + name + vintage + size) into one
      // ×N row, so a scanned pair becomes one cellar listing of 2, not two
      // listings. Different vintages or formats of the same wine stay separate.
      const batched: DetectedBottle[] = [];
      const indexByKey = new Map<string, number>();
      for (const b of raw) {
        const key = `${norm(b.producer)}|${norm(b.wineName)}|${(b.vintage ?? '').trim()}|${b.bottleSizeMl ?? 750}`;
        const at = indexByKey.get(key);
        if (at != null) {
          batched[at].quantity = (batched[at].quantity ?? 1) + 1;
          batched[at].confident = batched[at].confident || b.confident;
        } else {
          indexByKey.set(key, batched.length);
          batched.push({ ...b, quantity: 1, bottleSizeMl: b.bottleSizeMl ?? 750 });
        }
      }
      setConfirmed(new Set());
      setSavedRows(new Set());
      // Store the normalised image: the boxes were detected on it, so the label
      // crops line up.
      setLineup(batched, workUri);
      setStage('review');
    } catch (err) {
      showAlert({ title: 'Could not read the photo', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  const lineupRack = racks.find((r) => r.id === originRackId);
  const lineupRackName = lineupRack?.name ?? 'the rack';
  // Only true racks stack extra bottles vertically down a column — fridges and
  // bins don't, so the "+ Add more bottles vertically" link is rack-only.
  const isRackType = (lineupRack?.storage_type ?? 'rack') === 'rack';
  const allConfirmed = lineupWines.length > 0 && confirmed.size === lineupWines.length;
  // Total physical bottles vs distinct wines — duplicates (same producer + name
  // + vintage) are batched, so these differ when the lineup has repeats.
  const totalBottles = lineupWines.reduce((sum, b) => sum + (b.quantity ?? 1), 0);

  function openEdit(i: number) {
    const b = lineupWines[i];
    setEditDraft({
      producer: b.producer ?? '',
      wineName: b.wineName ?? '',
      region: b.region ?? '',
      vintage: b.vintage ?? '',
      bottleSizeMl: b.bottleSizeMl ?? 750,
      quantity: b.quantity ?? 1,
      overrideImageUri: b.overrideImageUri ?? null,
    });
    setEditIndex(i);
  }
  function openBottles(i: number) {
    setBottlesIndex(i);
    setBottlesQty(lineupWines[i].quantity ?? 1);
  }
  function saveBottles() {
    if (bottlesIndex == null) return;
    updateBottle(bottlesIndex, { quantity: Math.max(1, bottlesQty) });
    setBottlesIndex(null);
  }
  function confirmEdit() {
    if (editIndex == null) return;
    updateBottle(editIndex, {
      producer: editDraft.producer.trim(),
      wineName: editDraft.wineName.trim(),
      region: editDraft.region.trim() || null,
      vintage: editDraft.vintage.trim() || null,
      bottleSizeMl: editDraft.bottleSizeMl,
      quantity: Math.max(1, editDraft.quantity),
      overrideImageUri: editDraft.overrideImageUri,
    });
    setConfirmed((prev) => new Set(prev).add(editIndex));
    setEditIndex(null);
  }
  // Re-scan a single wine's label from the edit sheet — re-reads the details and
  // captures a fresh photo that overrides the (often small) lineup crop.
  async function handleScanInEdit() {
    try {
      const res = await launchCamera({ mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 });
      if (res.canceled || !res.assets[0]) return;
      const uri = res.assets[0].uri;
      if (!(await ensureConnectionForUpload())) return;
      setScanningEdit(true);
      try {
        const base64 = await prepareImageBase64(uri);
        const details = await scanLabel(base64);
        setEditDraft((d) => ({
          ...d,
          producer: details.producer ?? d.producer,
          wineName: details.wineName ?? d.wineName,
          region: details.region ?? d.region,
          vintage: details.vintage ?? d.vintage,
          overrideImageUri: uri,
        }));
      } catch {
        // OCR failed — still keep the fresh photo as the override.
        setEditDraft((d) => ({ ...d, overrideImageUri: uri }));
      } finally {
        setScanningEdit(false);
      }
    } catch (err) {
      showAlert({ title: 'Could not open camera', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function toggleConfirm(i: number) {
    setConfirmed((prev) => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
  }

  // The existing cellar row that is the same wine, vintage AND bottle size as a
  // detected bottle (a magnum is its own line). Producer alone is never enough —
  // that once merged "Mullineux Iron" into "Mullineux Schist". Producer + name
  // compare as an order-independent set, so an OCR producer/name swap still
  // matches. The live cache first, then the database, so a momentarily stale
  // cache can't slip a duplicate through.
  async function findCellarMatch(b: DetectedBottle, userId: string): Promise<CellarWine | null> {
    if (!wineNameKey(b.producer, b.wineName)) return null;
    const identity = { producer: b.producer, wineName: b.wineName, region: b.region ?? null, vintage: b.vintage };
    const size = b.bottleSizeMl ?? 750;
    return findSameCellarWine(cellarWines, identity, size) ?? await findCellarWineByIdentity(userId, identity, size);
  }

  // Fallback for OCR / word-order / grape-placement variance that the exact
  // wineNameKey misses — e.g. "Iron Kasteelsig" (grape Syrah) vs "Iron Syrah
  // Kasteelsig". Same producer+name+grape token SUBSET, same vintage and size.
  function findFuzzyCellarMatch(b: DetectedBottle): CellarWine | null {
    const size = b.bottleSizeMl ?? 750;
    return cellarWines.find((w) => (w.bottle_size_ml ?? 750) === size && looseWineMatch(
      { producer: w.producer, wineName: w.wine_name, grape: w.grape_variety, vintage: w.vintage },
      { producer: b.producer, wineName: b.wineName, grape: b.grape ?? null, vintage: b.vintage },
    )) ?? null;
  }

  // A lineup bottle matched a wine already in this cellar — ask (per bottle)
  // whether to add to that listing or keep it as a separate entry, rather than
  // merging silently (which would wrongly collapse a fuzzy false match).
  function askMergeChoice(b: DetectedBottle, match: CellarWine): Promise<'merge' | 'separate'> {
    const size = bottleSizeLabel(match.bottle_size_ml ?? 750);
    const existingLabel = `${[match.producer, match.wine_name, match.vintage].filter(Boolean).join(' ')} (${size})`;
    const incomingLabel = [b.producer, b.wineName, b.vintage].filter(Boolean).join(' ') || 'this bottle';
    return new Promise((resolve) => {
      showAlert({
        title: 'Already in this cellar',
        body: `You already have ${existingLabel}. Add ${incomingLabel} to that listing, or keep it as a separate entry?`,
        buttons: [
          { text: 'Add to that listing', onPress: () => resolve('merge') },
          { text: 'Keep separate', onPress: () => resolve('separate') },
        ],
      });
    });
  }

  // The lineup photo's pixel size, for cropping per-bottle thumbnails (null =
  // skip thumbnails).
  async function lineupImageDims(): Promise<{ width: number; height: number } | null> {
    if (!imageUri) return null;
    try {
      const d = await ImageManipulator.manipulateAsync(imageUri, [], {});
      return { width: d.width, height: d.height };
    } catch { return null; }
  }

  // Give a placed wine its thumbnail: a label re-scanned in the edit sheet wins,
  // else the bottle's crop from the lineup photo. Non-fatal — a wine placed
  // without a thumbnail is fine.
  async function attachThumbnail(userId: string, wineId: string, b: DetectedBottle, imgDims: { width: number; height: number } | null) {
    try {
      const uri = b.overrideImageUri
        ?? (b.box && imageUri && imgDims ? await cropLabel(imageUri, imgDims, b.box) : null);
      if (!uri) return;
      const path = await uploadLabelImage(userId, uri, wineId);
      await updateWine.mutateAsync({ id: wineId, updates: { label_image_path: path } });
    } catch { /* placed without a thumbnail */ }
  }

  // Before anything is saved: how many bottles of each size the rack still
  // has room for. When they don't all fit, say so — the rows beyond the room
  // are still added, but wait in Your Full Cellar List instead of the rack.
  // Resolves the room per size, or null if the user cancelled.
  async function checkRoom(rackId: string, rows: DetectedBottle[]): Promise<Map<number, number> | null> {
    const wanted = new Map<number, number>();
    for (const b of rows) wanted.set(b.bottleSizeMl ?? 750, (wanted.get(b.bottleSizeMl ?? 750) ?? 0) + (b.quantity ?? 1));
    const room = new Map<number, number>();
    let fit = 0;
    let total = 0;
    for (const [size, n] of wanted) {
      const { free } = await rackRoomFor(rackId, size);
      room.set(size, free);
      fit += Math.min(free, n);
      total += n;
    }
    if (fit >= total) return room;
    return new Promise((resolve) => {
      showAlert({
        title: 'Not enough room',
        body: fit > 0
          ? `Only ${fit} of ${total} will fit in ${lineupRackName} — the rest stay in Your Full Cellar List.`
          : `There's no free slot in ${lineupRackName} for these bottles — they'll stay in Your Full Cellar List.`,
        dismissable: false,
        buttons: [
          { text: 'Add Wines', onPress: () => resolve(room) },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
        ],
      });
    });
  }

  // Each confirmed bottle becomes a cellar row "awaiting placement" in this
  // rack, then the rack takes over and the user taps an empty slot for each, in
  // scan order. A wine already in the cellar can join that listing instead
  // (asked per bottle, never silently). Rows are saved one by one; if one
  // fails, the saved ones are marked and a retry only adds the rest.
  async function addLineup() {
    if (!originRackId || placingRef.current) return;
    const userId = session?.user.id;
    if (!userId) { showAlert({ title: 'Could not add lineup', body: 'Please try again.' }); return; }
    const pending = lineupWines.map((b, i) => ({ b, i })).filter(({ i }) => !savedRows.has(i));
    if (pending.length === 0) return;
    placingRef.current = true;
    setPlacing(true);
    const saved = new Set(savedRows);
    try {
      const room = await checkRoom(originRackId, pending.map(({ b }) => b));
      if (!room) return;
      const imgDims = await lineupImageDims();
      for (const { b, i } of pending) {
        const size = b.bottleSizeMl ?? 750;
        const count = b.quantity ?? 1;
        // Rows wait for a slot in scan order while the rack has room for them.
        const left = room.get(size) ?? 0;
        room.set(size, Math.max(0, left - count));
        const awaiting = left > 0 ? { awaiting_placement: true, awaiting_placement_unit_id: originRackId } : {};
        const match = (await findCellarMatch(b, userId)) ?? findFuzzyCellarMatch(b);
        if (match && (await askMergeChoice(b, match)) === 'merge') {
          // A fresh read, so two rows merging into one wine both count.
          const live = await getCellarWineById(match.id);
          if (!live || live.archived_at) throw new Error(`${match.wine_name} is no longer in your cellar.`);
          await updateWine.mutateAsync({ id: live.id, updates: { quantity: (live.quantity ?? 0) + count, ...awaiting } });
        } else {
          const added = await addWine.mutateAsync(newCellarRow(b, userId, count, awaiting));
          await attachThumbnail(userId, added.id, b, imgDims);
        }
        saved.add(i);
        setSavedRows(new Set(saved));
      }
      invalidateCellarViews(qc);
      useLineupStore.getState().clear();
      router.replace(`/cellar/rack/${originRackId}`);
    } catch (err) {
      showAlert(saved.size > savedRows.size
        ? { title: 'Some wines added, then hit a snag', body: `${saved.size} of ${lineupWines.length} are in your cellar. Tap Add Wines to add the rest. ${err instanceof Error ? err.message : ''}`.trim() }
        : { title: 'Could not add lineup', body: err instanceof Error ? err.message : 'Please try again.' });
      invalidateCellarViews(qc);
    } finally {
      placingRef.current = false;
      setPlacing(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add a Lineup</Text>
        <View style={styles.headerSpacer} />
      </View>

      {stage === 'capture' ? (
        isUpload ? (
          // Behind the library picker; also the way back in if it was dismissed.
          <View style={styles.centerBlock}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => pickFromLibrary(false)} activeOpacity={0.85}>
              <Text style={[styles.primaryBtnText, styles.chooseBtnText]}>Choose a Photo</Text>
            </TouchableOpacity>
          </View>
        ) : !permission ? (
          <View style={styles.cameraWrap} />
        ) : !permission.granted ? (
          <PermissionScreen onRequest={requestPermission} hideBack />
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" autofocus="on" />
            {showInstruction ? (
              <View style={styles.instructionCard}>
                <TouchableOpacity style={styles.instructionClose} onPress={() => setShowInstruction(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.instructionCloseText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.instructionText}>Photograph up to 6 bottles with their front labels facing the camera.</Text>
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
      ) : stage === 'analyzing' ? (
        <View style={styles.centerBlock}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" /> : null}
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Vinster is reading your bottles…</Text>
        </View>
      ) : (
        // Review: tick each bottle to confirm (or Edit it), then add them; the
        // rack then asks for a slot for each one.
        <ScrollView contentContainerStyle={styles.content}>
          {lineupWines.length === 0 ? (
            <>
              {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" /> : null}
              <Text style={styles.hint}>Vinster couldn't read any bottles. Try a clearer photo with the front labels showing.</Text>
            </>
          ) : (
            <>
              {/* Placement target, centred, above the stats — then the photo. */}
              <Text style={styles.placeInHeader}>Place in {lineupRackName}</Text>
              <View style={styles.statsBar}>
                <Text style={styles.statsBarText}>
                  {totalBottles} {totalBottles === 1 ? 'Bottle' : 'Bottles'} · {lineupWines.length} {lineupWines.length === 1 ? 'Wine' : 'Wines'}
                </Text>
              </View>
              {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" /> : null}
              {!allConfirmed ? (
                <TouchableOpacity style={styles.confirmAllRow} onPress={() => setConfirmed(new Set(lineupWines.map((_, i) => i)))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.confirmAllLink}>Confirm all</Text>
                </TouchableOpacity>
              ) : null}
              {lineupWines.map((b, i) => {
                const isOn = confirmed.has(i);
                const isSaved = savedRows.has(i);
                const name = [b.producer, b.wineName].filter(Boolean).join(' ') || 'Unreadable bottle';
                const qty = b.quantity ?? 1;
                return (
                  <View key={i} style={styles.lineupRow}>
                    <TouchableOpacity style={styles.checkbox} onPress={() => toggleConfirm(i)} disabled={isSaved} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[styles.checkboxText, isOn && styles.checkboxTextOn]}>{isOn ? '☑' : '☐'}</Text>
                    </TouchableOpacity>
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={2}>
                        {b.vintage ? `${b.vintage} ` : ''}{name}, {qty}x{bottleSizeCl(b.bottleSizeMl ?? 750)}cl
                      </Text>
                      {isRackType && !isSaved ? (
                        <TouchableOpacity onPress={() => openBottles(i)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                          <Text style={styles.addBottlesLink}>+ Add more bottles vertically</Text>
                        </TouchableOpacity>
                      ) : null}
                      {!b.confident && !isOn ? <Text style={styles.unconfident}>Low-confidence read — check it</Text> : null}
                    </View>
                    {isSaved ? (
                      <Text style={styles.addedTag}>Added ✓</Text>
                    ) : (
                      <TouchableOpacity onPress={() => openEdit(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.editLink}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              <TouchableOpacity
                style={[styles.primaryBtn, (placing || !allConfirmed) && { opacity: 0.4 }]}
                onPress={addLineup}
                disabled={placing || !allConfirmed}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>{placing ? 'Adding…' : 'Add Wines'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={retake} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>Retake</Text>
              </TouchableOpacity>
              <Text style={styles.placementHintItalic}>Select the bottle placement on the next screen</Text>
            </>
          )}
        </ScrollView>
      )}

      {/* Lineup wine edit — manual fields + format (cl), no quantity. */}
      <Modal visible={editIndex !== null} transparent animationType="slide" onRequestClose={() => setEditIndex(null)}>
        <View style={styles.editOverlay}>
          <ScrollView style={styles.editSheet} contentContainerStyle={{ paddingBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
            <Text style={styles.editTitle}>Edit wine</Text>
            <Text style={styles.editFieldLabel}>Producer</Text>
            <TextInput style={styles.editInput} value={editDraft.producer} onChangeText={(t) => setEditDraft((d) => ({ ...d, producer: t }))} placeholder="Producer" placeholderTextColor={colors.textMuted} />
            <Text style={styles.editFieldLabel}>Wine name</Text>
            <TextInput style={styles.editInput} value={editDraft.wineName} onChangeText={(t) => setEditDraft((d) => ({ ...d, wineName: t }))} placeholder="Cuvée / wine name" placeholderTextColor={colors.textMuted} />
            <Text style={styles.editFieldLabel}>Region</Text>
            <TextInput style={styles.editInput} value={editDraft.region} onChangeText={(t) => setEditDraft((d) => ({ ...d, region: t }))} placeholder="Region / appellation" placeholderTextColor={colors.textMuted} />
            <Text style={styles.editFieldLabel}>Vintage</Text>
            <TextInput style={styles.editInput} value={editDraft.vintage} onChangeText={(t) => setEditDraft((d) => ({ ...d, vintage: t }))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted} />
            <Text style={styles.editFieldLabel}>Format</Text>
            <BottleSizePicker value={editDraft.bottleSizeMl} onChange={(ml) => setEditDraft((d) => ({ ...d, bottleSizeMl: ml }))} />
            <TouchableOpacity style={[styles.secondaryBtn, { marginTop: spacing.lg }]} onPress={handleScanInEdit} disabled={scanningEdit} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>{scanningEdit ? 'Reading…' : 'Scan Wine Label'}</Text>
            </TouchableOpacity>
            {editDraft.overrideImageUri ? <Text style={styles.editHintCaptured}>New label photo captured — it will replace the lineup crop.</Text> : null}
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: spacing.sm }]} onPress={confirmEdit} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editDiscard} onPress={() => setEditIndex(null)}>
              <Text style={styles.editDiscardText}>Discard</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* "+ Add more bottles vertically" — set how many of this wine run
          vertically from its slot. Moved out of the Edit sheet. */}
      <Modal visible={bottlesIndex !== null} transparent animationType="fade" onRequestClose={() => setBottlesIndex(null)}>
        <View style={styles.editOverlay}>
          <View style={styles.bottlesSheet}>
            <Text style={styles.editTitle}>Add more bottles</Text>
            <Text style={styles.editFieldLabel}>Bottles of this wine</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setBottlesQty((q) => Math.max(1, q - 1))} activeOpacity={0.7}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{bottlesQty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setBottlesQty((q) => Math.min(20, q + 1))} activeOpacity={0.7}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: spacing.lg }]} onPress={saveBottles} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editDiscard} onPress={() => setBottlesIndex(null)}>
              <Text style={styles.editDiscardText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Live in-app camera scan (matches Archive a Lineup).
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
  captureBtn: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF' },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 44 },
  headerSpacer: { width: 44 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.8 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: 60 },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },

  hint: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  preview: { width: '80%', height: 240, borderRadius: 12, backgroundColor: '#000' },
  previewSmall: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#000', marginBottom: spacing.md },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  chooseBtnText: { paddingHorizontal: spacing.xl },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },

  // Consistent gold stats bar shared with Archive a Night.
  statsBar: { alignItems: 'center', paddingTop: spacing.xs, paddingBottom: spacing.md, marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  statsBarText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  addBottlesLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, marginTop: 4 },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  unconfident: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.gold, marginTop: 2 },

  // Quantity stepper in the lineup edit sheet.
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xs },
  qtyBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.gold, lineHeight: 26 },
  qtyValue: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, minWidth: 32, textAlign: 'center' },
  editHintCaptured: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.gold, textAlign: 'center', marginTop: spacing.sm },

  confirmAllLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  // "Place in <location>" — centred gold header above the stats.
  placeInHeader: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', marginBottom: spacing.xs },
  confirmAllRow: { alignSelf: 'flex-end', marginBottom: spacing.sm },
  placementHintItalic: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  lineupRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { width: 28, alignItems: 'center' },
  checkboxText: { fontSize: 24, color: colors.textMuted },
  checkboxTextOn: { color: colors.gold },

  editLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  editOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  editSheet: { backgroundColor: colors.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: spacing.xl, maxHeight: '88%' },
  bottlesSheet: { backgroundColor: colors.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: spacing.xl },
  editTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  editFieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.xs },
  editInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text },
  editDiscard: { alignItems: 'center', paddingTop: spacing.md },
  editDiscardText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  addedTag: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold },
});
