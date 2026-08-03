import { useState, useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Modal, View, ScrollView, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useLabelStore } from '../../src/stores/labelStore';
import { generatePairings, searchLabelImages, fetchWineCandidates, prepareImageBase64, scanLabel, type WineCandidate } from '../../src/api/label';
import * as ImagePicker from 'expo-image-picker';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { File, Paths } from 'expo-file-system';
import { generateWineIntel } from '../../src/services/pricing';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { useRackStore } from '../../src/stores/rackStore';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { assignSlots, getRackSlots } from '../../src/api/racks';
import { getBinCell } from '../../src/api/bins';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { BottleSizePicker } from '../../src/components/BottleSizePicker';
import { WineSearchInput } from '../../src/components/WineSearchInput';
import { usePreferences } from '../../src/hooks/usePreferences';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { WineDetailsComplete } from '../../src/types/wine';

// Walk the rack grid from (startRow,startCol) in the given orientation, skipping
// occupied slots, collecting up to `count` FREE positions. Vertical runs down a
// column then to the next; Horizontal runs across a row then to the next. The
// large-format band (row -1) stays on its own row. Mirrors the helper used by
// the lineup placement flow.
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

export default function LabelConfirmScreen() {
  useKeepAwake();
  const { context, manual, backTo, via } = useLocalSearchParams<{ context?: string; manual?: string; backTo?: string; via?: string }>();
  // Reached by uploading a photo (not the camera): the bottom link is "Cancel"
  // and returns to the Scan screen — "Scan Again" (reopen camera) only belongs
  // to the camera flow.
  const isUpload = via === 'upload';
  // Forward any context (wishlist / reviews / …) so /label/results knows
  // which flow we're in for back routing and which action set to show.
  const contextQuery = context ? `?context=${context}${via ? `&via=${via}` : ''}${backTo ? `&backTo=${encodeURIComponent(backTo)}` : ''}` : '';
  // Reached straight from Cellar → Add Wine → Manual Input: no scan
  // happened, so the form opens blank and there's nothing to "scan again".
  const isManual = manual === '1';
  // Reached from Scan a Lineup — Back returns to the lineup list to continue
  // onboarding the remaining bottles.
  const isLineup = context === 'lineup';
  const { wineDetails, setImage, setWineDetails, setWineDetailsConfirmed, setIntelligence, setPairings, setError } = useLabelStore();
  const { preferences } = usePreferences();
  // Rack-placement context: when the user reached here by tapping an empty rack
  // slot, we skip Wine Intel and drop the bottle straight into the slot.
  const { pendingSlot, setPendingSlot, pendingSlots, setPendingSlots, pendingBinCell, setPendingBinCell } = useRackStore();
  const isMultiSlot = (pendingSlots?.length ?? 0) > 1;
  // Bin-diamond placement (context=place-bin): quantity + bottle format are
  // collected inline on this screen so the whole add is one step.
  const isPlaceBin = context === 'place-bin' && !!pendingBinCell;
  const { addWine, updateWine } = useCellar();
  const { session } = useAuth();
  const qc = useQueryClient();

  const [producer, setProducer] = useState(wineDetails?.producer ?? '');
  const [region, setRegion] = useState(wineDetails?.region ?? '');
  const [wineName, setWineName] = useState(wineDetails?.wineName ?? '');
  const [vintage, setVintage] = useState(wineDetails?.vintage ?? '');
  const [style, setStyle] = useState(wineDetails?.style ?? '');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  // Rack/fridge slot placement (context=place). The ONLY extra input is the
  // bottle format, collected inline on this Confirm screen — no popup, no
  // "how many bottles", no fill direction. A short tap drops ONE bottle in the
  // tapped slot; multiples come from long-hold multi-select (which fills exactly
  // the chosen slots). Orientation is a lineup-only concern now.
  const isPlaceRack = !!pendingSlot && context === 'place';
  const [placeFormat, setPlaceFormat] = useState<number>(() =>
    isPlaceRack && pendingSlot!.row === -1
      ? (pendingSlot!.largeFormatBottleSizeMl ?? wineDetails?.bottleSizeMl ?? 1500)
      : (wineDetails?.bottleSizeMl ?? 750),
  );
  const placeOrientation: 'Vertical' | 'Horizontal' = 'Vertical';
  const [placing, setPlacing] = useState(false);
  // Inline bin-diamond quantity + format (place-bin context only).
  const [binQty, setBinQty] = useState('1');
  const [binFormat, setBinFormat] = useState(wineDetails?.bottleSizeMl ?? 750);

  // Bottling picker — "Not this wine? Choose from other bottlings". Lists the
  // real, distinct wines this producer makes so the user can correct a misread
  // cuvée (e.g. the wrong wine in a multi-cuvée series) before confirming. Only
  // offered on label-derived flows (manual entry has its own predictive search).
  const [candidates, setCandidates] = useState<WineCandidate[]>([]);
  const [candidatesOpen, setCandidatesOpen] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  // Auto-open once when the scan came back low-confidence (undefined confidence
  // — older scan-label responses / non-scan flows — never auto-opens).
  const autoTriedRef = useRef(false);

  async function loadCandidates(auto = false) {
    if (loadingCandidates) return;
    if (!producer.trim()) {
      if (!auto) showAlert({ title: 'Add the producer first', body: 'Enter the producer so Vinster can list its wines.' });
      return;
    }
    setLoadingCandidates(true);
    if (!auto) setCandidatesOpen(true);
    try {
      const list = await fetchWineCandidates({ producer, region, wineName, vintage });
      if (list.length > 0) {
        setCandidates(list);
        setCandidatesOpen(true);
      } else if (!auto) {
        setCandidatesOpen(false);
        showAlert({ title: 'No bottlings found', body: `Vinster couldn't list other wines for ${producer.trim()}. Edit the fields directly instead.` });
      }
    } catch {
      if (!auto) {
        setCandidatesOpen(false);
        showAlert({ title: 'Could not load bottlings', body: 'Please try again, or edit the fields directly.' });
      }
    } finally {
      setLoadingCandidates(false);
    }
  }

  useEffect(() => {
    if (autoTriedRef.current || isManual) return;
    if (wineDetails?.confidence !== 'low') return;
    autoTriedRef.current = true;
    void loadCandidates(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wineDetails?.confidence, isManual]);

  // Apply a picked bottling: the producer stays, the cuvée (and region / style
  // when the candidate carries them) fill in. The user still Confirms after.
  function pickCandidate(c: WineCandidate) {
    setWineName(c.wineName);
    if (c.region) setRegion(c.region);
    if (c.style) setStyle(c.style);
    setCandidatesOpen(false);
  }

  // Manually-entered wines have no photo. Auto-fetch a label from the web so the
  // Wine Intel card (and the saved cellar wine) still gets a thumbnail — the
  // best web match, no picker (the wine-card "Find Label Online" keeps its
  // picker for deliberate choice). Best-effort: never blocks the flow.
  async function ensureAutoLabel(pProducer: string, pWineName: string | null) {
    if (useLabelStore.getState().imageUri) return;
    if (!pProducer.trim()) return;
    try {
      const cands = await searchLabelImages({ producer: pProducer, wineName: pWineName });
      if (!cands.length) return;
      const dest = new File(Paths.cache, `autolabel-${Date.now()}.img`);
      try { if (dest.exists) dest.delete(); } catch { /* ignore */ }
      const file = await File.downloadFileAsync(cands[0].url, dest);
      useLabelStore.getState().setImageUri(file.uri);
    } catch { /* best-effort — no thumbnail is fine */ }
  }

  async function handleConfirm() {
    if (!producer.trim() || !region.trim()) {
      showAlert({ title: 'Missing details', body: 'Producer and region are required.' });
      return;
    }
    if (!vintage.trim()) {
      showAlert({ title: 'Missing vintage', body: 'Please enter a vintage year or NV.' });
      return;
    }

    const confirmed: WineDetailsComplete = {
      producer: producer.trim(),
      region: region.trim(),
      wineName: wineName.trim() || null,
      vintage: vintage.trim(),
      style: style.trim() || null,
      // Pass any bottle size the scanner read off the label straight
      // through to /label/results so the Add modal can pre-populate the
      // picker. The user can still adjust it on that screen.
      bottleSizeMl: wineDetails?.bottleSizeMl ?? null,
      // Carry a batched lineup quantity through so /label/results seeds the
      // bottle count (e.g. a "×2" lineup entry adds 2 to the cellar).
      quantity: wineDetails?.quantity ?? 1,
    };

    setWineDetailsConfirmed(confirmed);

    // Bin diamond placement: quantity + format were set inline above, so save
    // straight into the cell — one step, no separate placement popup.
    if (isPlaceBin) {
      await handlePlaceBinConfirm(confirmed);
      return;
    }

    // Rack placement: arrived from an empty rack slot (context=place guards
    // against a stale pendingSlot hijacking an unrelated add). Instead of saving
    // immediately, confirm the format, bottle count and fill direction in a
    // popup — the save + slot assignment happens in handlePlaceConfirm. No
    // Location step: the tapped slot already fixes where the wine lives.
    if (pendingSlot && context === 'place') {
      // Bottle format was set inline above — place straight in. Short tap = one
      // bottle in the tapped slot; multi-select fills the chosen slots. No popup.
      await handlePlaceConfirm();
      return;
    }

    // Cellar List "Add Wine" (no explicit context): no Wine Intel card — intel
    // is only generated from the Cellar tab's Generate Wine Intel. Go straight
    // to the add confirmation (size / quantity / orientation / location) on
    // results, with no intel generated.
    if (!context) {
      setIntelligence(null);
      // Fetch a label in the background so the Add-to-Cellar save carries a
      // thumbnail even for a manual entry (imageUri is read at save time).
      void ensureAutoLabel(confirmed.producer, confirmed.wineName);
      router.replace('/label/results?context=add');
      return;
    }

    // Home storage location add: the wine is being filed into a location (and
    // maybe a case) — generating Wine Intel here is both unwanted and often
    // wrong for a case label, so skip straight to the add card.
    if (context === 'add-location') {
      setIntelligence(null);
      void ensureAutoLabel(confirmed.producer, confirmed.wineName);
      router.replace('/label/results?context=add-location');
      return;
    }

    setLoading(true);
    try {
      // generateWineIntel queries Wine-Searcher first (real market price +
      // WS-anchored critic score, converted to the user's currency), falling
      // back to the Claude estimate on a no-match. In parallel, auto-fetch a
      // label so a manual entry still shows a thumbnail on the intel card.
      const [intel] = await Promise.all([
        generateWineIntel(confirmed, preferences?.defaultCurrency ?? 'GBP'),
        ensureAutoLabel(confirmed.producer, confirmed.wineName),
      ]);
      setIntelligence(intel);
      // Persist as the "last result" so the Cellar tab's View last result link
      // survives an app restart (separate from the transient label store).
      useLastIntelStore.getState().setLast(confirmed, intel);
      // Mark a FRESH Scan Wine Label result (only the intel flow) so the intel
      // card can offer "Add label to Label Library?" exactly once — and never
      // on a later "View last result" revisit (which pushes without fresh=1).
      const freshFlag = context === 'intel' ? '&fresh=1' : '';
      router.replace(`/label/results${contextQuery}${freshFlag}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wine details');
      showAlert({ title: 'Error', body: 'Could not load wine details. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  // Save the wine and drop it into the tapped slot (and the slots that follow,
  // per the chosen count + direction). Quantity is set to the number of slots
  // actually filled, so the rack and cellar counts can't drift apart.
  async function handlePlaceConfirm() {
    if (!pendingSlot) return;
    const userId = session?.user.id;
    if (!userId) { showAlert({ title: 'Sign in required', body: 'Please sign in and try again.' }); return; }
    // Short tap = exactly one bottle; multi-select fills the hand-picked slots.
    const requested = isMultiSlot ? (pendingSlots?.length ?? 1) : 1;
    setPlacing(true);
    try {
      const existing = await getRackSlots(pendingSlot.rackId);
      const occupied = new Set(existing.filter((s) => s.cellar_wine_id).map((s) => `${s.row_index},${s.col_index}`));
      const free = isMultiSlot
        // Multi-slot: fill exactly the hand-picked slots, skipping any now taken.
        ? pendingSlots!.filter((s) => !occupied.has(`${s.row},${s.col}`))
        : computeFreeSlots(
            pendingSlot.row, pendingSlot.col, pendingSlot.rows, pendingSlot.cols,
            requested, placeOrientation, occupied, pendingSlot.largeFormatCols,
          );
      if (free.length === 0) {
        showAlert({ title: 'No room here', body: 'There are no free slots from this position in that direction. Try the other orientation or a different slot.' });
        setPlacing(false);
        return;
      }
      const saved = await addWine.mutateAsync({
        user_id: userId,
        wine_name: wineName.trim() || producer.trim(),
        producer: producer.trim(),
        region: region.trim(),
        vintage: vintage.trim(),
        quantity: free.length,
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
        bottle_size_ml: placeFormat,
      } as any);
      // Upload the scanned label photo so the slot shows the bottle thumbnail
      // (matches the normal add flow). Manual entries have no image, and a
      // failed upload is non-fatal — the wine is still placed.
      const labelUri = useLabelStore.getState().imageUri;
      if (labelUri) {
        try {
          const path = await uploadLabelImage(userId, labelUri, saved.id);
          await updateWine.mutateAsync({ id: saved.id, updates: { label_image_path: path } });
        } catch { /* non-fatal — placed without a thumbnail */ }
      }
      await assignSlots(pendingSlot.rackId, free, saved.id);
      const rackId = pendingSlot.rackId;
      qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      setPendingSlot(null);
      setPendingSlots(null);
      if (free.length < requested) {
        showAlert({
          title: 'Placed what fit',
          body: `Only ${free.length} of ${requested} bottles fit from here — the rest weren't placed. What did fit is in your Full Cellar List.`,
          buttons: [{ text: 'OK', onPress: () => router.replace(`/cellar/rack/${rackId}`) }],
        });
      } else {
        // Land on the rack (bottles visibly placed) with a brief auto-fading
        // "Added to your cellar" banner — no popup with commands to dismiss.
        router.replace(`/cellar/rack/${rackId}?placed=1`);
      }
    } catch (err) {
      showAlert({ title: 'Could not place wine', body: err instanceof Error ? err.message : 'Please try again.' });
      setPlacing(false);
    }
  }

  // Save the wine straight into the bin diamond with the inline quantity +
  // format. Merges into an existing same-wine+format entry in the cell rather
  // than spawning a duplicate row (mirrors the old inline form).
  async function handlePlaceBinConfirm(confirmed: WineDetailsComplete) {
    if (!pendingBinCell) return;
    const userId = session?.user.id;
    if (!userId) { showAlert({ title: 'Sign in required', body: 'Please sign in and try again.' }); return; }
    const cellId = pendingBinCell.cellId;
    const binId = pendingBinCell.binId;
    const qty = Math.max(1, parseInt(binQty) || 1);
    setPlacing(true);
    try {
      const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
      const { wines: cellWines } = await getBinCell(cellId);
      const existing = cellWines.find((w) =>
        norm(w.producer) === norm(confirmed.producer) &&
        norm(w.wine_name) === norm(confirmed.wineName ?? confirmed.producer) &&
        (w.vintage ?? '').trim() === confirmed.vintage.trim() &&
        (w.bottle_size_ml ?? 750) === binFormat,
      );
      let savedId: string;
      if (existing) {
        await updateWine.mutateAsync({ id: existing.id, updates: { quantity: (existing.quantity ?? 0) + qty } });
        savedId = existing.id;
      } else {
        const saved = await addWine.mutateAsync({
          user_id: userId,
          wine_name: confirmed.wineName?.trim() || confirmed.producer,
          producer: confirmed.producer,
          region: confirmed.region,
          vintage: confirmed.vintage,
          style: confirmed.style ?? null,
          quantity: qty,
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
          bin_cell_id: cellId,
          storage_location_id: null,
          case_id: null,
          bottle_size_ml: binFormat,
        } as any);
        savedId = saved.id;
        // Attach the scanned label thumbnail when there was one (non-fatal).
        const labelUri = useLabelStore.getState().imageUri;
        if (labelUri) {
          try {
            const path = await uploadLabelImage(userId, labelUri, savedId);
            await updateWine.mutateAsync({ id: savedId, updates: { label_image_path: path } });
          } catch { /* placed without a thumbnail */ }
        }
      }
      qc.invalidateQueries({ queryKey: ['bin-cell', cellId] });
      qc.invalidateQueries({ queryKey: ['bin-cells', binId] });
      qc.invalidateQueries({ queryKey: ['bins'] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      setPendingBinCell(null);
      // Pop back to the diamond cell we came from (it's always directly below the
      // confirm frame — pendingBinCell is only ever set there) rather than
      // router.replace, which stacked a SECOND cell screen on top of the
      // original so the back sequence (diamond → bin → Other Home Storage) hit
      // the diamond twice. The cell refreshes from the invalidated query above.
      if (router.canGoBack()) router.back();
      else router.replace(`/cellar/bin/cell/${cellId}` as any);
    } catch (err) {
      showAlert({ title: 'Could not add wine', body: err instanceof Error ? err.message : 'Please try again.' });
      setPlacing(false);
    }
  }

  // "Upload Again" — reopen the photo library, rescan a new label, and refresh
  // the fields in place. Mirrors the upload-label flow on the Scan hub.
  async function handleUploadAgain() {
    if (scanning) return;
    if (!(await ensureMediaPermission('library'))) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    setScanning(true);
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      setProducer(details.producer ?? '');
      setRegion(details.region ?? '');
      setWineName(details.wineName ?? '');
      setVintage(details.vintage ?? '');
      setStyle(details.style ?? '');
    } catch (err) {
      showAlert({ title: 'Scan failed', body: err instanceof Error ? err.message : 'Could not read that label. Please try another photo.' });
    } finally {
      setScanning(false);
    }
  }

  return (
    <>
    {isUpload ? (
      <TouchableOpacity style={styles.topBack} onPress={() => router.replace('/(tabs)/scan')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.topBackText}>← Back</Text>
      </TouchableOpacity>
    ) : null}
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      bottomOffset={24}
    >
      <Text style={styles.heading}>Confirm Wine Details</Text>
      <Text style={styles.subheading}>
        {isManual
          ? 'Search for your wine, or enter the details below.'
          : 'Check the details we extracted and correct anything that looks wrong.'}
      </Text>

      {/* Manual entry: predictive search fills producer/name/region/style from a
          real wine — the fields below stay editable. */}
      {isManual ? (
        <WineSearchInput onSelect={(r) => {
          setProducer(r.producer);
          setWineName(r.wineName ?? '');
          setRegion(r.region ?? '');
          setStyle(r.style ?? '');
        }} />
      ) : null}

      <Text style={styles.label}>Producer</Text>
      <TextInput
        style={styles.input}
        value={producer}
        onChangeText={setProducer}
        placeholder="e.g. Château Margaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Region</Text>
      <TextInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
        placeholder="e.g. Margaux, Bordeaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Wine Name (optional)</Text>
      <TextInput
        style={styles.input}
        value={wineName}
        onChangeText={setWineName}
        placeholder="e.g. Reserve, Cuvée Prestige"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Vintage</Text>
      <TextInput
        style={styles.input}
        value={vintage}
        onChangeText={setVintage}
        placeholder="e.g. 2019 or NV"
        placeholderTextColor={colors.textMuted}
        keyboardType="default"
        maxLength={4}
      />

      <Text style={styles.label}>Style</Text>
      <TextInput
        style={styles.input}
        value={style}
        onChangeText={setStyle}
        placeholder="e.g. Red, White, Rosé, Sparkling, Fortified"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
      />

      {/* Bottling picker affordance — for label-derived flows, let the user
          correct a misread cuvée by choosing from this producer's real wines
          (manual entry already has predictive search). */}
      {!isManual ? (
        <TouchableOpacity style={styles.candLink} onPress={() => loadCandidates(false)} disabled={loadingCandidates} activeOpacity={0.7}>
          <Text style={styles.candLinkText}>
            {loadingCandidates && !candidatesOpen ? 'Finding bottlings…' : 'Vinster detects similar bottlings, select the correct one from our list'}
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Bin diamond add: quantity + bottle format inline (one-step), so the
          diamond add mirrors the rack Confirm screen plus these two fields. */}
      {isPlaceBin ? (
        <>
          <Text style={[styles.label, styles.binFieldLabel]}>Bottles</Text>
          <TextInput
            style={styles.binQtyInput}
            value={binQty}
            onChangeText={(t) => setBinQty(t.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            placeholder="e.g. 6"
            placeholderTextColor={colors.textMuted}
          />
          <View style={{ height: spacing.md }} />
          <Text style={[styles.label, styles.binFieldLabel]}>Format</Text>
          <BottleSizePicker value={binFormat} onChange={setBinFormat} />
        </>
      ) : null}

      {/* Rack/fridge placement: bottle format is the only extra input — no
          popup, no bottle count, no fill direction. */}
      {isPlaceRack ? (
        <>
          <Text style={[styles.label, styles.binFieldLabel]}>Bottle format</Text>
          <BottleSizePicker value={placeFormat} onChange={setPlaceFormat} />
        </>
      ) : null}

      <TouchableOpacity
        style={[styles.button, (loading || placing) && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={loading || placing}
      >
        <Text style={styles.buttonText}>
          {placing ? 'Adding…' : loading ? 'Loading wine details…' : isPlaceBin ? 'Add to Diamond' : 'Confirm'}
        </Text>
      </TouchableOpacity>

      {isLineup ? (
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/cellar/scan-lineup')}>
          <Text style={styles.backText}>Back to Lineup</Text>
        </TouchableOpacity>
      ) : isUpload ? (
        <TouchableOpacity style={styles.uploadAgainButton} onPress={handleUploadAgain} disabled={scanning}>
          <Text style={styles.uploadAgainText}>{scanning ? 'Reading…' : 'Upload Again'}</Text>
        </TouchableOpacity>
      ) : isManual ? (
        <TouchableOpacity style={styles.backButton} onPress={() => (router.canGoBack() ? router.back() : router.replace((backTo as string) || '/(tabs)/scan'))}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace(`/label/camera${contextQuery}`)}>
          <Text style={styles.backText}>Scan Again</Text>
        </TouchableOpacity>
      )}

      {/* "Which wine is this?" — this producer's plausible bottlings, so the
          user can fix a misread cuvée before confirming. Opens automatically on
          a low-confidence scan; also reachable via the link above. */}
      <Modal visible={candidatesOpen} transparent animationType="fade" onRequestClose={() => setCandidatesOpen(false)}>
        <View style={styles.candOverlay}>
          <View style={styles.candSheet}>
            <Text style={styles.candTitle}>Which wine is this?</Text>
            <Text style={styles.candBody}>
              {producer.trim()
                ? `Pick the exact ${producer.trim()} bottling — the label reading may have missed part of the name.`
                : 'Pick the exact bottling — the label reading may have missed part of the name.'}
            </Text>
            {loadingCandidates ? (
              <View style={styles.candLoading}><ActivityIndicator color={colors.gold} /><Text style={styles.candLoadingText}>Finding bottlings…</Text></View>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {candidates.map((c, i) => (
                  <TouchableOpacity key={`${c.wineName}-${i}`} style={styles.candItem} onPress={() => pickCandidate(c)} activeOpacity={0.75}>
                    <Text style={styles.candItemName} numberOfLines={2}>{c.wineName}</Text>
                    {(c.region || c.style) ? <Text style={styles.candItemMeta} numberOfLines={1}>{[c.region, c.style].filter(Boolean).join(' · ')}</Text> : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.candCancel} onPress={() => setCandidatesOpen(false)} disabled={loadingCandidates}>
              <Text style={styles.candCancelText}>None of these — keep as is</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>

    {/* Full-screen overlay while a re-uploaded label is being read. */}
    <Modal visible={scanning} transparent animationType="fade">
      <View style={styles.scanOverlay}>
        <View style={styles.scanSheet}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.scanText}>Reading the label…</Text>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 130, paddingBottom: 60 },
  // Top-left Back link (upload flow) — returns to the Scan tab.
  topBack: { position: 'absolute', top: 56, left: spacing.xl, zIndex: 20, paddingVertical: 4, paddingRight: 12 },
  topBackText: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.gold },
  // "Upload Again" secondary button (upload flow) — gold outline to sit apart
  // from the white Confirm button above it.
  uploadAgainButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  uploadAgainText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  scanOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  scanSheet: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.xl, alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.gold },
  scanText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  heading: {
    fontSize: 26,
    fontFamily: fonts.headingBold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    fontFamily: fonts.headingRegular,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Form field label — body.
  label: {
    fontSize: 13,
    fontFamily: fonts.bodySemibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Form input — body.
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  // Bin diamond inline quantity + format — labels in gold to signal the
  // bin-specific fields added to this shared screen.
  binFieldLabel: { color: colors.gold },
  binQtyInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.text, backgroundColor: colors.surface },
  button: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
  },
  backButton: { alignItems: 'center', marginTop: spacing.lg },
  // Back/nav link — body.
  backText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
  },
  // "Not this wine? Choose from other bottlings" — a gold link under the fields.
  candLink: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  candLinkText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  // Bottling picker modal (matches the results-screen "Which wine is this?").
  candOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  candSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%', maxWidth: 440 },
  candTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  candBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  candLoading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  candLoadingText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  candItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.surface },
  candItemName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  candItemMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  candCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  candCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  placeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: spacing.xl },
  placeSheet: { backgroundColor: colors.background, borderRadius: 18, padding: spacing.xl },
  placeTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  placeNote: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.gold, textAlign: 'center', lineHeight: 21, marginBottom: spacing.sm },
  orientRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  orientBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  orientBtnOn: { borderColor: colors.gold },
  orientText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.textMuted },
  orientTextOn: { color: colors.gold },
});
