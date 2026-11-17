import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar } from '../../src/hooks/useCellar';
import { ensureConnectionForUpload } from '../../src/utils/connectionGuard';
import { useRacks } from '../../src/hooks/useRacks';
import { useAuth } from '../../src/hooks/useAuth';
import { useLineupStore } from '../../src/stores/lineupStore';
import { useLabelStore } from '../../src/stores/labelStore';
import { detectLineup, prepareImageBase64, scanLabel, type DetectedBottle } from '../../src/api/label';
import { assignSlots, getRackSlots } from '../../src/api/racks';
import { findCellarWineByIdentity } from '../../src/api/cellar';
import { freeSlotsFrom } from '../../src/utils/rackSlots';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { wineNameKey, looseWineMatch } from '../../src/utils/wineIdentity';
import { findSameCellarWine } from '../../src/utils/wineMatch';
import { BottleSizePicker, bottleSizeCl } from '../../src/components/BottleSizePicker';
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

// Place ONE wine's bottles as a line running PERPENDICULAR to the lineup axis,
// from the wine's own position. A horizontal lineup (wines across columns)
// stacks each wine's bottles DOWN its column; a vertical lineup (wines down
// rows) runs each wine's bottles ACROSS its row. Skips occupied slots, stops at
// the grid edge.
function computeWineLine(
  wineIndex: number, startRow: number, startCol: number,
  rows: number, cols: number, quantity: number,
  lineupOrient: 'Vertical' | 'Horizontal', occupied: Set<string>,
): Array<{ row: number; col: number }> {
  const result: Array<{ row: number; col: number }> = [];
  if (lineupOrient === 'Horizontal') {
    const col = startCol + wineIndex;
    if (col < 0 || col >= cols) return result;
    let row = startRow;
    while (result.length < quantity && row >= 0 && row < rows) {
      if (!occupied.has(`${row},${col}`)) result.push({ row, col });
      row++;
    }
  } else {
    const row = startRow + wineIndex;
    if (row < 0 || row >= rows) return result;
    let col = startCol;
    while (result.length < quantity && col >= 0 && col < cols) {
      if (!occupied.has(`${row},${col}`)) result.push({ row, col });
      col++;
    }
  }
  return result;
}

export default function ScanLineupScreen() {
  const { wines: cellarWines, addWine, updateWine } = useCellar();
  const { racks } = useRacks();
  const { session } = useAuth();
  const qc = useQueryClient();
  const { wines: lineupWines, imageUri, originRackId, startSlot, orientation, setLineup, updateBottle } = useLineupStore();
  const { setWineDetails } = useLabelStore();

  // Rack-placement lineup: launched from a rack with a chosen start slot — the
  // whole lineup is auto-placed into the rack at once (legacy path).
  const isRackPlacement = startSlot != null && !!originRackId;
  // New default: launched from a rack with NO start slot — after confirming the
  // list the bottles return to the rack "awaiting placement", and the user taps
  // an empty slot for each one in order. Both use the same tickable review list.
  const isManualPlace = startSlot == null && !!originRackId;
  const isRackLineup = !!originRackId;
  const [placing, setPlacing] = useState(false);
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

  // If the store already holds a lineup (we've returned mid-flow after
  // onboarding a wine), open straight onto the review list.
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
      // Batch identical bottles (same producer + name + vintage) into one ×N row,
      // so a scanned pair becomes one cellar listing of 2, not two listings.
      // Different vintages of the same wine stay separate.
      const batched: DetectedBottle[] = [];
      const indexByKey = new Map<string, number>();
      for (const b of raw) {
        const key = `${norm(b.producer)}|${norm(b.wineName)}|${(b.vintage ?? '').trim()}`;
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
      // Store the normalised image: the boxes were detected on it, so the label
      // crops line up.
      setLineup(batched, workUri);
      setStage('review');
    } catch (err) {
      showAlert({ title: 'Could not read the photo', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  // Is this detected bottle now in the live cellar? (Matched on producer + name
  // so an edited vintage during onboarding still reads as added.)
  function isAdded(b: DetectedBottle): boolean {
    const p = norm(b.producer);
    const n = norm(b.wineName) || p;
    return cellarWines.some((w) => norm(w.producer) === p && (norm(w.wine_name) === n || norm(w.wine_name) === norm(b.wineName)));
  }

  const addedCount = lineupWines.filter(isAdded).length;
  const allDone = lineupWines.length > 0 && addedCount === lineupWines.length;
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

  // Send one bottle through the same flow as Scan a Label (Confirm Wine
  // Details → Wine Intel → Add to Cellar). context=lineup routes the flow back
  // here afterwards. router.replace keeps the back-stack to a single screen.
  function onboard(b: DetectedBottle) {
    setWineDetails({
      producer: b.producer,
      region: b.region ?? '',
      wineName: b.wineName || null,
      vintage: b.vintage || '',
      style: null,
      bottleSizeMl: null,
      // Pre-seed the cellar quantity from the batched count so a "×2" lineup
      // entry adds 2 bottles (the user can still adjust on the results screen).
      quantity: b.quantity ?? 1,
    } as any);
    router.replace('/label/confirm?context=lineup');
  }

  // The existing cellar row that is the same wine AND vintage as a detected
  // bottle. Producer alone is never enough — that once merged "Mullineux Iron"
  // into "Mullineux Schist". Producer + name compare as an order-independent
  // set, so an OCR producer/name swap still matches.
  function findCellarMatch(b: DetectedBottle): CellarWine | null {
    if (!wineNameKey(b.producer, b.wineName)) return null;
    return findSameCellarWine(cellarWines, { producer: b.producer, wineName: b.wineName, region: (b as any).region ?? null, vintage: b.vintage }) ?? null;
  }

  // Fallback for OCR / word-order / grape-placement variance that the exact
  // wineNameKey misses — e.g. "Iron Kasteelsig" (grape Syrah) vs "Iron Syrah
  // Kasteelsig". Same producer+name+grape token SUBSET, same vintage.
  function findFuzzyCellarMatch(b: DetectedBottle): CellarWine | null {
    return cellarWines.find((w) => looseWineMatch(
      { producer: w.producer, wineName: w.wine_name, grape: w.grape_variety, vintage: w.vintage },
      { producer: b.producer, wineName: b.wineName, grape: (b as any).grape ?? null, vintage: b.vintage },
    )) ?? null;
  }

  // A lineup bottle matched a wine already in this cellar — ask (per bottle)
  // whether to add to that listing or keep it as a separate entry, rather than
  // merging silently (which would wrongly collapse a fuzzy false match).
  function askMergeChoice(b: DetectedBottle, match: CellarWine): Promise<'merge' | 'separate'> {
    const existingLabel = [match.producer, match.wine_name, match.vintage].filter(Boolean).join(' ');
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

  // Rack-placement: place each kept bottle into consecutive free slots from the
  // chosen start, in the chosen orientation. A wine already in the cellar has
  // these bottles added to its count (reusing its line); a new wine is created
  // minimally (intel auto-generates when its card is first opened).
  async function placeAll() {
    if (!isRackPlacement || !originRackId || !startSlot || placingRef.current) return;
    const rack = racks.find((r) => r.id === originRackId);
    const userId = session?.user.id;
    if (!rack || !userId) {
      showAlert({ title: 'Could not place lineup', body: 'Please try again.' });
      return;
    }
    const kept = lineupWines;
    if (kept.length === 0) return;
    placingRef.current = true;
    setPlacing(true);
    try {
      const existing = await getRackSlots(originRackId);
      const occupied = new Set(existing.filter((s) => s.cellar_wine_id).map((s) => `${s.row_index},${s.col_index}`));
      const total = kept.reduce((sum, b) => sum + (b.quantity ?? 1), 0);
      // Large-format band (row -1) is a single row → keep the simple linear
      // fill. Standard rows use per-wine perpendicular placement so a wine's
      // multiple bottles stack perpendicular to the lineup axis.
      const useLinear = startSlot.row === -1;
      const linearFree = useLinear
        ? freeSlotsFrom(startSlot.row, startSlot.col, rack.rows, rack.cols, total, orientation, occupied, rack.large_format_cols)
        : [];
      const imgDims = await lineupImageDims();
      let cursor = 0;
      let placedCount = 0;
      // Several lineup rows can merge into one cellar wine, each holding the same
      // stale match.quantity — keep a running total per cellar id so the count
      // rises by every bottle placed.
      const bumps = new Map<string, number>();
      for (let wi = 0; wi < kept.length; wi++) {
        const b = kept[wi];
        const count = b.quantity ?? 1;
        let slots: Array<{ row: number; col: number }>;
        if (useLinear) {
          slots = linearFree.slice(cursor, cursor + count);
          cursor += slots.length;
          if (slots.length === 0) break; // band full
        } else {
          slots = computeWineLine(wi, startSlot.row, startSlot.col, rack.rows, rack.cols, count, orientation, occupied);
          slots.forEach((s) => occupied.add(`${s.row},${s.col}`));
          if (slots.length === 0) continue; // this wine's line is off-grid/full
        }
        // Already in the cellar? Add these bottles to that line's count and
        // reuse it (no duplicate line). Check the live cache first, then the DB
        // directly — so a momentarily-stale cache can't slip a duplicate through.
        let match = findCellarMatch(b) ?? await findCellarWineByIdentity(userId, { producer: b.producer, wineName: b.wineName, vintage: b.vintage });
        // Exact key missed it? Try the looser subset match before creating a
        // duplicate row (the reported Mullineux Iron Syrah case).
        if (!match) match = findFuzzyCellarMatch(b);
        // When a match is found, ASK per bottle — never merge silently.
        const reusedExisting = match ? (await askMergeChoice(b, match)) === 'merge' : false;
        let targetId: string;
        if (match && reusedExisting) {
          targetId = match.id;
          const addedSoFar = bumps.get(match.id) ?? 0;
          bumps.set(match.id, addedSoFar + slots.length);
          await updateWine.mutateAsync({ id: match.id, updates: { quantity: (match.quantity ?? 0) + addedSoFar + slots.length } });
        } else {
          const saved = await addWine.mutateAsync(newCellarRow(b, userId, slots.length));
          targetId = saved.id;
        }
        await assignSlots(originRackId, slots, targetId);
        // A merged wine keeps the label it already has, unless the user
        // re-scanned this bottle's label.
        if (b.overrideImageUri || !reusedExisting || !match?.label_image_path) await attachThumbnail(userId, targetId, b, imgDims);
        placedCount += slots.length;
      }
      qc.invalidateQueries({ queryKey: ['rack-slots', originRackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      useLineupStore.getState().clear();
      const leftover = total - placedCount;
      router.replace(`/cellar/rack/${originRackId}` as any);
      if (leftover > 0) {
        showAlert({ title: 'Rack filled up', body: `Placed ${placedCount} of ${total} bottles — the rack ran out of free slots, so ${leftover} ${leftover === 1 ? "wasn't" : "weren't"} placed.` });
      }
    } catch (err) {
      showAlert({ title: 'Could not place lineup', body: err instanceof Error ? err.message : 'Please try again.' });
      setPlacing(false);
    } finally {
      placingRef.current = false;
    }
  }

  // Manual-placement lineup (no start slot): each confirmed bottle becomes a
  // cellar row "awaiting placement" in this rack, then the rack takes over and
  // the user taps an empty slot for each, in scan order. A wine already in the
  // cellar can join that listing instead (asked per bottle, never silently).
  async function placeAsAwaiting() {
    if (!isManualPlace || !originRackId || placingRef.current) return;
    const userId = session?.user.id;
    if (!userId) { showAlert({ title: 'Could not add lineup', body: 'Please try again.' }); return; }
    const kept = lineupWines;
    if (kept.length === 0) return;
    placingRef.current = true;
    setPlacing(true);
    try {
      const imgDims = await lineupImageDims();
      // Running total per merged cellar id (see placeAll) — two rows merging
      // into one wine must both count, not overwrite each other.
      const bumps = new Map<string, number>();
      for (const b of kept) {
        const count = b.quantity ?? 1;
        const match = findCellarMatch(b) ?? findFuzzyCellarMatch(b);
        if (match && (await askMergeChoice(b, match)) === 'merge') {
          const addedSoFar = bumps.get(match.id) ?? 0;
          bumps.set(match.id, addedSoFar + count);
          await updateWine.mutateAsync({
            id: match.id,
            updates: { quantity: (match.quantity ?? 0) + addedSoFar + count, awaiting_placement: true, awaiting_placement_unit_id: originRackId },
          });
          continue; // the existing listing keeps its label + intel
        }
        const saved = await addWine.mutateAsync(newCellarRow(b, userId, count, { awaiting_placement: true, awaiting_placement_unit_id: originRackId }));
        await attachThumbnail(userId, saved.id, b, imgDims);
      }
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      qc.invalidateQueries({ queryKey: ['rack-slots', originRackId] });
      useLineupStore.getState().clear();
      router.replace(`/cellar/rack/${originRackId}` as any);
    } catch (err) {
      showAlert({ title: 'Could not add lineup', body: err instanceof Error ? err.message : 'Please try again.' });
      setPlacing(false);
    } finally {
      placingRef.current = false;
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
      ) : isRackLineup ? (
        // Rack-lineup review: tick each bottle to confirm (or Edit it), then place
        // it into the rack — auto (legacy start-slot) or by tapping slots in order.
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
                const name = [b.producer, b.wineName].filter(Boolean).join(' ') || 'Unreadable bottle';
                const qty = b.quantity ?? 1;
                return (
                  <View key={i} style={styles.lineupRow}>
                    <TouchableOpacity style={styles.checkbox} onPress={() => toggleConfirm(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[styles.checkboxText, isOn && styles.checkboxTextOn]}>{isOn ? '☑' : '☐'}</Text>
                    </TouchableOpacity>
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={2}>
                        {b.vintage ? `${b.vintage} ` : ''}{name}, {qty}x{bottleSizeCl(b.bottleSizeMl ?? 750)}cl
                      </Text>
                      {isRackType ? (
                        <TouchableOpacity onPress={() => openBottles(i)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                          <Text style={styles.addBottlesLink}>+ Add more bottles vertically</Text>
                        </TouchableOpacity>
                      ) : null}
                      {!b.confident && !isOn ? <Text style={styles.unconfident}>Low-confidence read — check it</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => openEdit(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              <TouchableOpacity
                style={[styles.primaryBtn, (placing || !allConfirmed) && { opacity: 0.4 }]}
                onPress={isManualPlace ? placeAsAwaiting : placeAll}
                disabled={placing || !allConfirmed}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>
                  {placing ? (isManualPlace ? 'Adding…' : 'Placing…') : 'Add Wines'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={retake} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>Retake</Text>
              </TouchableOpacity>
              <Text style={styles.placementHintItalic}>Select the bottle placement on the next screen</Text>
            </>
          )}
        </ScrollView>
      ) : (
        // review
        <ScrollView contentContainerStyle={styles.content}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" /> : null}

          {allDone ? (
            <View style={styles.successBlock}>
              <Text style={styles.successTitle}>All Lineup Wines Have Been Saved Successfully</Text>
              <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/cellar/list')} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>View Cellar List</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace(originRackId ? `/cellar/rack/${originRackId}` as any : '/(tabs)/cellar')} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>{originRackId ? 'Back to Rack' : 'Done'}</Text>
              </TouchableOpacity>
            </View>
          ) : lineupWines.length === 0 ? (
            <Text style={styles.hint}>Vinster couldn't read any bottles. Try a clearer photo with the front labels showing.</Text>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Add to Your Cellar</Text>
              {lineupWines.map((b, i) => {
                const added = isAdded(b);
                const qty = b.quantity ?? 1;
                const label = [b.vintage, b.producer, b.wineName].filter(Boolean).join(' ');
                return (
                  <View key={i} style={styles.row}>
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={2}>{label || 'Unreadable bottle'}</Text>
                      <View style={styles.rowMetaRow}>
                        {b.region ? <Text style={styles.rowMeta} numberOfLines={1}>{b.region}</Text> : null}
                        {qty >= 2 ? <Text style={styles.qtyTag}>×{qty} bottles</Text> : null}
                      </View>
                      {!b.confident && !added ? <Text style={styles.unconfident}>Low-confidence read — check the details</Text> : null}
                    </View>
                    {added ? (
                      <Text style={styles.addedTag}>Added ✓</Text>
                    ) : (
                      <TouchableOpacity onPress={() => onboard(b)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                        <Text style={styles.editAddLink}>add / edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              <Text style={styles.progressHint}>{addedCount} of {lineupWines.length} added</Text>
            </>
          )}

          {!allDone && lineupWines.length > 0 ? (
            <TouchableOpacity style={styles.secondaryBtn} onPress={retake} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>Retake</Text>
            </TouchableOpacity>
          ) : null}
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
            <Text style={styles.editFieldLabel}>Bottles ({orientation === 'Horizontal' ? 'stacked down' : 'across'} from this wine)</Text>
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
  doneBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  doneBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm },

  // Consistent gold stats bar shared with Archive a Night.
  statsBar: { alignItems: 'center', paddingTop: spacing.xs, paddingBottom: spacing.md, marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  statsBarText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  addBottlesLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  rowMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: 2 },
  rowMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted },
  // Batched-bottle count shown after the region, e.g. "×2 bottles".
  qtyTag: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold },
  unconfident: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.gold, marginTop: 2 },

  // Quantity stepper in the lineup edit sheet.
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xs },
  qtyBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.gold, lineHeight: 26 },
  qtyValue: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, minWidth: 32, textAlign: 'center' },
  editHintCaptured: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.gold, textAlign: 'center', marginTop: spacing.sm },
  editAddLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },

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
  progressHint: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  successBlock: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  successTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', lineHeight: 28, marginBottom: spacing.sm },
});
