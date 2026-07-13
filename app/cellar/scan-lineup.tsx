import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar } from '../../src/hooks/useCellar';
import { useRacks } from '../../src/hooks/useRacks';
import { useAuth } from '../../src/hooks/useAuth';
import { useLineupStore } from '../../src/stores/lineupStore';
import { useLabelStore } from '../../src/stores/labelStore';
import { detectLineup, type DetectedBottle } from '../../src/api/label';
import { assignSlots, getRackSlots } from '../../src/api/racks';
import { findCellarWineByIdentity } from '../../src/api/cellar';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { BottleSizePicker, bottleSizeCl } from '../../src/components/BottleSizePicker';
import type { CellarWine } from '../../src/types/wine';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

type Stage = 'capture' | 'analyzing' | 'review';

// Persisted "don't show me this again" flag for the fridge-lineup photo tip.
const FRIDGE_TIP_KEY = 'vinster_hide_fridge_lineup_tip';

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

// Walk the rack grid from (startRow,startCol) in the given orientation, skipping
// occupied slots, collecting up to `count` FREE positions. Vertical runs down a
// column then to the next; Horizontal runs across a row then to the next. The
// large-format band (row -1) stays on its own row.
function computeFreeSlots(
  startRow: number, startCol: number, rows: number, cols: number,
  count: number, orient: 'Vertical' | 'Horizontal',
  occupied: Set<string>, largeFormatCols?: number | null,
): Array<{ row: number; col: number }> {
  const result: Array<{ row: number; col: number }> = [];
  if (startRow === -1) {
    const lfCols = largeFormatCols ?? 0;
    let col = startCol;
    while (result.length < count && col < lfCols) {
      if (!occupied.has(`-1,${col}`)) result.push({ row: -1, col });
      col++;
    }
    return result;
  }
  let row = startRow;
  let col = startCol;
  while (result.length < count && row >= 0 && row < rows && col >= 0 && col < cols) {
    if (!occupied.has(`${row},${col}`)) result.push({ row, col });
    if (orient === 'Horizontal') { col++; if (col >= cols) { col = 0; row++; } }
    else { row++; if (row >= rows) { row = 0; col++; } }
  }
  return result;
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
  // whole lineup is placed into the rack at once (no per-wine intel detour).
  const isRackPlacement = startSlot != null && !!originRackId;
  // Whether this lineup is destined for a wine fridge (vs a rack) — drives the
  // fridge-only photo tip (popup + blurb paragraph).
  const isFridge = racks.find((r) => r.id === originRackId)?.storage_type === 'fridge';
  const [placing, setPlacing] = useState(false);
  // Fridge-lineup photo tip: shown once on the capture screen unless the user
  // has ticked "don't show me this again".
  const [showFridgeTip, setShowFridgeTip] = useState(false);
  const [dontShowFridgeTip, setDontShowFridgeTip] = useState(false);
  useEffect(() => {
    if (!isFridge) return;
    let active = true;
    AsyncStorage.getItem(FRIDGE_TIP_KEY)
      .then((v) => { if (active && v !== '1') setShowFridgeTip(true); })
      .catch(() => {});
    return () => { active = false; };
  }, [isFridge]);

  function dismissFridgeTip() {
    if (dontShowFridgeTip) AsyncStorage.setItem(FRIDGE_TIP_KEY, '1').catch(() => {});
    setShowFridgeTip(false);
  }
  // Quick batch confirm: each row is ticked once reviewed/edited; "Add Bottles"
  // unlocks when all are ticked.
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());
  // Original (unrotated) capture, kept so the Flip toggle can re-read the other
  // way up. `flipped` = we rotated the photo 180° before analysis (auto for rack
  // placement, where bottles sit neck-forward = upside down).
  const [rawUri, setRawUri] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState({ producer: '', wineName: '', region: '', vintage: '', bottleSizeMl: 750, quantity: 1 });

  // If the store already holds a lineup (we've returned mid-flow after
  // onboarding a wine), open straight onto the review list.
  const [stage, setStage] = useState<Stage>(lineupWines.length > 0 ? 'review' : 'capture');

  async function pickFrom(source: 'camera' | 'library') {
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (result.canceled || !result.assets.length) return;
      const uri = result.assets[0].uri;
      setRawUri(uri);
      // Rack bottles are stored neck-forward, so the photo is upside down —
      // auto-rotate before reading. Fridges often stand upright, so not those.
      const doFlip = isRackPlacement && !isFridge;
      setFlipped(doFlip);
      await analyze(uri, doFlip);
    } catch (err) {
      showAlert({ title: 'Could not open camera', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Re-read the photo the other way up (undo/redo the 180° rotation).
  function handleFlip() {
    if (!rawUri) return;
    const nf = !flipped;
    setFlipped(nf);
    void analyze(rawUri, nf);
  }

  async function analyze(uri: string, flip = false) {
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
      // Cap raw detections at 8, then batch identical bottles (same producer +
      // name + vintage) into one row carrying a quantity, so a lineup with two
      // of the same wine reads as a single "×2" entry instead of two rows.
      const capped = (bottles ?? []).slice(0, 8);
      // Batch identical bottles (same producer + name + vintage) into one ×N row
      // — different vintages of the same wine stay separate. This recognises
      // duplicates in EVERY lineup flow (rack/fridge and onboarding), so a
      // scanned pair becomes one cellar listing of quantity 2, not two listings.
      const batched: DetectedBottle[] = [];
      const indexByKey = new Map<string, number>();
      for (const b of capped) {
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
      const result = batched;
      setConfirmed(new Set());
      // Store the rotated image so the rack's cropped label thumbnails (and the
      // preview) are upright too — the boxes were detected on this same image.
      setLineup(result, workUri);
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
  const lineupRackName = racks.find((r) => r.id === originRackId)?.name ?? 'the rack';
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
    });
    setEditIndex(i);
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
    });
    setConfirmed((prev) => new Set(prev).add(editIndex));
    setEditIndex(null);
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

  // Match a detected bottle to an existing cellar line by identity (producer +
  // name, vintage preferred) — mirrors matchLineupToCellar's matching.
  function findCellarMatch(b: DetectedBottle): CellarWine | null {
    const p = norm(b.producer);
    const n = norm(b.wineName);
    const v = (b.vintage ?? '').trim();
    const candidates = cellarWines.filter((w) => {
      const wp = norm(w.producer);
      const wn = norm(w.wine_name);
      const producerHit = !!p && (wp === p || wn === p);
      const nameHit = !!n && (wn === n || wp === n);
      return producerHit || nameHit;
    });
    if (v) {
      const exact = candidates.find((w) => (w.vintage ?? '').trim() === v);
      if (exact) return exact;
    }
    return candidates[0] ?? null;
  }

  // Rack-placement: place each kept bottle into consecutive free slots from the
  // chosen start, in the chosen orientation. A wine already in the cellar has
  // these bottles added to its count (reusing its line); a new wine is created
  // minimally (intel auto-generates when its card is first opened).
  async function placeAll() {
    if (!isRackPlacement || !originRackId || !startSlot || placing) return;
    const rack = racks.find((r) => r.id === originRackId);
    const userId = session?.user.id;
    if (!rack || !userId) {
      showAlert({ title: 'Could not place lineup', body: 'Please try again.' });
      return;
    }
    const kept = lineupWines;
    if (kept.length === 0) return;
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
        ? computeFreeSlots(startSlot.row, startSlot.col, rack.rows, rack.cols, total, orientation, occupied, rack.large_format_cols)
        : [];
      // Original lineup image dimensions, for cropping per-bottle thumbnails.
      let imgDims: { width: number; height: number } | null = null;
      if (imageUri) {
        try { const d = await ImageManipulator.manipulateAsync(imageUri, [], {}); imgDims = { width: d.width, height: d.height }; } catch { /* skip thumbnails */ }
      }
      let cursor = 0;
      let placedCount = 0;
      // Identical wines are separate rows now, each reading the same stale
      // match.quantity — accumulate the bumps per cellar id so the count rises
      // by the true number of bottles placed, not just one.
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
        const match = findCellarMatch(b) ?? await findCellarWineByIdentity(userId, { producer: b.producer, wineName: b.wineName, vintage: b.vintage });
        let targetId: string;
        if (match) {
          targetId = match.id;
          const addedSoFar = bumps.get(match.id) ?? 0;
          bumps.set(match.id, addedSoFar + slots.length);
          await updateWine.mutateAsync({ id: match.id, updates: { quantity: (match.quantity ?? 0) + addedSoFar + slots.length } });
        } else {
          const saved = await addWine.mutateAsync({
            user_id: userId,
            wine_name: b.wineName || b.producer,
            producer: b.producer,
            region: b.region ?? null,
            vintage: b.vintage ?? null,
            quantity: slots.length,
            storage_location: null,
            date_received: new Date().toISOString().split('T')[0],
            critic_score: null,
            critic_score_note: null,
            drinking_window_from: null,
            drinking_window_to: null,
            drinking_window_status: 'unknown',
            tasting_notes: null,
            grape_variety: null,
            label_image_path: null,
            user_notes: null,
            is_wishlist: false,
            estimated_value: null,
            estimated_value_currency: null,
            estimated_value_at: null,
            estimated_value_source: null,
            purchase_price: null,
            purchase_price_currency: null,
            bottle_size_ml: b.bottleSizeMl ?? 750,
          } as any);
          targetId = saved.id;
        }
        await assignSlots(originRackId, slots, targetId);
        // Thumbnail: reuse the matched wine's existing label if it has one;
        // otherwise crop this bottle out of the lineup photo. Non-fatal.
        if (!match?.label_image_path && b.box && imageUri && imgDims) {
          try {
            const { x, y, w, h } = b.box;
            // Pad the (tight, label-focused) box a little so the thumbnail keeps
            // some context and isn't cropped to the label's bare edge.
            const pad = 0.05;
            const fx = Math.max(0, x - pad);
            const fy = Math.max(0, y - pad);
            const fw = Math.min(1 - fx, w + pad * 2);
            const fh = Math.min(1 - fy, h + pad * 2);
            const originX = Math.max(0, Math.round(fx * imgDims.width));
            const originY = Math.max(0, Math.round(fy * imgDims.height));
            const cw = Math.min(imgDims.width - originX, Math.round(fw * imgDims.width));
            const ch = Math.min(imgDims.height - originY, Math.round(fh * imgDims.height));
            if (cw > 10 && ch > 10) {
              const cropped = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ crop: { originX, originY, width: cw, height: ch } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
              );
              const path = await uploadLabelImage(userId, cropped.uri, targetId);
              await updateWine.mutateAsync({ id: targetId, updates: { label_image_path: path } });
            }
          } catch { /* non-fatal — placed without a thumbnail */ }
        }
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
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.lead}>
            Adding several bottles? Photograph the lineup and Vinster will identify each one and add them for you.
          </Text>
          {isFridge && (
            <Text style={styles.hint}>Line up all bottles from the row, including those facing the back, with all labels right side up — you will likely need to remove the bottles from your fridge and line them up for an accurate photo.</Text>
          )}
          <Text style={styles.hint}>Stand up to 8 bottles up with their front labels facing the camera. Get your photo as close up to the labels as possible.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => pickFrom('camera')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Take a photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => pickFrom('library')} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Upload a Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : stage === 'analyzing' ? (
        <View style={styles.centerBlock}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" /> : null}
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Vinster is reading your bottles…</Text>
        </View>
      ) : isRackPlacement ? (
        // Rack-placement review: tick each bottle to confirm (or Edit it), then
        // "Add Bottles" places the whole lineup into the rack.
        <ScrollView contentContainerStyle={styles.content}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" /> : null}
          {lineupWines.length === 0 ? (
            <Text style={styles.hint}>Vinster couldn't read any bottles. Try a clearer photo with the front labels showing.</Text>
          ) : (
            <>
              <View style={styles.listHeadRow}>
                <Text style={styles.sectionLabel}>Place in {lineupRackName}</Text>
                {!allConfirmed ? (
                  <TouchableOpacity onPress={() => setConfirmed(new Set(lineupWines.map((_, i) => i)))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.confirmAllLink}>Confirm all</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <Text style={styles.summaryLine}>{totalBottles} {totalBottles === 1 ? 'bottle' : 'bottles'} / {lineupWines.length} {lineupWines.length === 1 ? 'wine' : 'wines'}</Text>
              <Text style={styles.hint}>Tick each wine to confirm, or Edit to fix a read or set how many bottles. Wines run {orientation.toLowerCase()} from your start slot; each wine's extra bottles run {orientation === 'Horizontal' ? 'down its column' : 'across its row'}.</Text>
              {lineupWines.map((b, i) => {
                const isOn = confirmed.has(i);
                const name = [b.producer, b.wineName].filter(Boolean).join(' ') || 'Unreadable bottle';
                return (
                  <View key={i} style={styles.lineupRow}>
                    <TouchableOpacity style={styles.checkbox} onPress={() => toggleConfirm(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[styles.checkboxText, isOn && styles.checkboxTextOn]}>{isOn ? '☑' : '☐'}</Text>
                    </TouchableOpacity>
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={2}>
                        {b.vintage ? `${b.vintage} ` : ''}{name}
                        <Text style={styles.formatTag}>  {bottleSizeCl(b.bottleSizeMl ?? 750)}cl</Text>
                      </Text>
                      <Text style={styles.bottleLine}>{b.quantity ?? 1} {(b.quantity ?? 1) === 1 ? 'bottle' : 'bottles'} · {orientation === 'Horizontal' ? 'Vertically' : 'Horizontally'}</Text>
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
                onPress={placeAll}
                disabled={placing || !allConfirmed}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>
                  {placing ? 'Placing…' : `Add ${totalBottles} ${totalBottles === 1 ? 'Bottle' : 'Bottles'}`}
                </Text>
              </TouchableOpacity>
              {flipped ? (
                <Text style={styles.hint}>Vinster turned your rack photo upright (bottles sit neck‑forward), so labels read the right way up. Wrong? Flip it back.</Text>
              ) : null}
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleFlip} disabled={!rawUri || placing} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>{flipped ? 'Flip back & re‑read' : 'Labels upside down? Flip & re‑read'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStage('capture')} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>Retake</Text>
              </TouchableOpacity>
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
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStage('capture')} activeOpacity={0.85}>
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
            <Text style={styles.editFieldLabel}>Bottles ({orientation === 'Horizontal' ? 'stacked down' : 'across'} from this wine)</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setEditDraft((d) => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))} activeOpacity={0.7}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{editDraft.quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setEditDraft((d) => ({ ...d, quantity: Math.min(20, d.quantity + 1) }))} activeOpacity={0.7}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: spacing.lg }]} onPress={confirmEdit} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editDiscard} onPress={() => setEditIndex(null)}>
              <Text style={styles.editDiscardText}>Discard</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Fridge-lineup photo tip — fridges are often packed in deep rows, so a
          good lineup photo usually means pulling the bottles out first. Shown
          once unless dismissed for good. */}
      <Modal visible={showFridgeTip} transparent animationType="fade" onRequestClose={dismissFridgeTip}>
        <View style={styles.tipOverlay}>
          <View style={styles.tipSheet}>
            <Text style={styles.tipTitle}>Before you photograph</Text>
            <Text style={styles.tipBody}>Line up all bottles from the row, including those facing the back, with all labels right side up — you will likely need to remove the bottles from your fridge and line them up for an accurate photo.</Text>
            <TouchableOpacity style={styles.tipCheckRow} onPress={() => setDontShowFridgeTip((v) => !v)} activeOpacity={0.7}>
              <Text style={[styles.tipCheckbox, dontShowFridgeTip && styles.tipCheckboxOn]}>{dontShowFridgeTip ? '☑' : '☐'}</Text>
              <Text style={styles.tipCheckLabel}>Don't show me this message again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={dismissFridgeTip} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 44 },
  headerSpacer: { width: 44 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  content: { padding: spacing.xl, paddingBottom: 60 },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  lead: { fontSize: 17, fontFamily: fonts.headingRegular, color: colors.text, lineHeight: 24, textAlign: 'center', marginBottom: spacing.sm },
  hint: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  preview: { width: '80%', height: 240, borderRadius: 12, backgroundColor: '#000' },
  previewSmall: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#000', marginBottom: spacing.md },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  doneBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  doneBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm },
  summaryLine: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  rowMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: 2 },
  rowMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted },
  // Batched-bottle count shown after the region, e.g. "×2 bottles".
  qtyTag: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold },
  unconfident: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.gold, marginTop: 2 },
  // "X bottles · Vertically/Horizontally" under each lineup wine.
  bottleLine: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  // Quantity stepper in the lineup edit sheet.
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xs },
  qtyBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.gold, lineHeight: 26 },
  qtyValue: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, minWidth: 32, textAlign: 'center' },
  editAddLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  // Rack-placement review: per-row remove toggle (legacy, unused now).
  rowRemoved: { opacity: 0.4 },
  removeLink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted },
  removeLinkUndo: { color: colors.gold, textDecorationLine: 'underline' },
  // Rack-placement quick-confirm rows + edit modal.
  listHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  confirmAllLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  lineupRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { width: 28, alignItems: 'center' },
  checkboxText: { fontSize: 24, color: colors.textMuted },
  checkboxTextOn: { color: colors.gold },
  formatTag: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  editLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  editOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  editSheet: { backgroundColor: colors.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: spacing.xl, maxHeight: '88%' },
  editTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  editFieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.xs },
  editInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text },
  editDiscard: { alignItems: 'center', paddingTop: spacing.md },
  editDiscardText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  addedTag: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold },
  progressHint: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  successBlock: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  successTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', lineHeight: 28, marginBottom: spacing.sm },
  tipOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: spacing.xl },
  tipSheet: { backgroundColor: colors.background, borderRadius: 18, padding: spacing.xl },
  tipTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  tipBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 22, textAlign: 'center', marginBottom: spacing.lg },
  tipCheckRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center', marginBottom: spacing.sm },
  tipCheckbox: { fontSize: 20, color: colors.textMuted },
  tipCheckboxOn: { color: colors.gold },
  tipCheckLabel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
