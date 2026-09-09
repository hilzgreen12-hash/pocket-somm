import { useState, useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Modal, View, ScrollView, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useLabelStore } from '../../src/stores/labelStore';
import { generatePairings, searchLabelImages, fetchWineCandidates, searchWines, prepareImageBase64, scanLabel, candidateKey, type WineCandidate, type WineSearchResult } from '../../src/api/label';
import * as ImagePicker from 'expo-image-picker';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { wineNameKey } from '../../src/utils/wineIdentity';
import { formatWineTitle } from '../../src/utils/wineTitle';
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
import { resolveIntelCurrency } from '../../src/utils/localCurrency';
import { StartAlignedInput } from '../../src/components/StartAlignedInput';
import { usePreferences } from '../../src/hooks/usePreferences';
import { currencySymbol } from '../../src/constants/currency';
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
  const { context, manual, mode, backTo, via, seed } = useLocalSearchParams<{ context?: string; manual?: string; mode?: string; backTo?: string; via?: string; seed?: string }>();
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
  // Pure manual input (Scan → Manual Input): the user explicitly chose to type,
  // not search — so no predictive search bar, and the screen reads "Input Wine
  // Details" rather than "Confirm …".
  const isPureInput = mode === 'input';
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
  const { wines: cellarWines, addWine, updateWine } = useCellar();
  const { session } = useAuth();
  const qc = useQueryClient();

  // Manual input always starts blank — not every entry point resets the label
  // store first, so seeding from a leftover scan would carry the PREVIOUS wine's
  // details (and, via the store, its photo) into this fresh manual entry.
  const [producer, setProducer] = useState(isManual ? '' : (wineDetails?.producer ?? ''));
  const [region, setRegion] = useState(isManual ? '' : (wineDetails?.region ?? ''));
  const [wineName, setWineName] = useState(isManual ? '' : (wineDetails?.wineName ?? ''));
  const [grape, setGrape] = useState(isManual ? '' : (wineDetails?.grape ?? ''));
  const [vintage, setVintage] = useState(isManual ? '' : (wineDetails?.vintage ?? ''));
  const [style, setStyle] = useState(isManual ? '' : (wineDetails?.style ?? ''));
  // After picking a wine from the predictive search, the vintage still isn't set
  // (the search has no vintage), so flag the field gold until the user fills it.
  const [highlightVintage, setHighlightVintage] = useState(false);
  // True once the user picks a wine from the predictive search bar — that IS the
  // confirmation, so Confirm skips the "Confirm the wine" match popup (only a
  // hand-typed entry needs it). Reset if they then edit the producer / wine name.
  const [pickedFromSearch, setPickedFromSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Manual entry starts with a blank "+ Add" thumbnail: clear any leftover scan
  // image / intel on mount so a previous scan's photo can't be auto-applied to
  // this new wine (the entry points that don't reset the store first). The user
  // adds a photo deliberately from the wine card afterwards.
  useEffect(() => {
    if (isManual) {
      useLabelStore.getState().setImageUri(null);
      setIntelligence(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  // Bin placement details are collected in a popup AFTER the wine is confirmed:
  // bottles + format + purchase price.
  const [binPrice, setBinPrice] = useState('');
  const [binPriceEstimating, setBinPriceEstimating] = useState(false);
  const [binPopupOpen, setBinPopupOpen] = useState(false);
  const [binConfirmed, setBinConfirmed] = useState<WineDetailsComplete | null>(null);

  // Bottling picker — "Not this wine? Choose from other bottlings". Lists the
  // real, distinct wines this producer makes so the user can correct a misread
  // cuvée (e.g. the wrong wine in a multi-cuvée series) before confirming. Only
  // offered on label-derived flows (manual entry has its own predictive search).
  const [candidates, setCandidates] = useState<WineCandidate[]>([]);
  const [candidatesOpen, setCandidatesOpen] = useState(false);
  // Single-select tick in the "Which wine is this?" list (lineup-style rows).
  const [selectedCand, setSelectedCand] = useState<number | null>(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  // Manual entry → confirm the approved wine-name match before building the card.
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchOptions, setMatchOptions] = useState<WineSearchResult[]>([]);
  const pendingConfirmRef = useRef<WineDetailsComplete | null>(null);
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
    setSelectedCand(null);
    if (!auto) setCandidatesOpen(true);
    try {
      const list = await fetchWineCandidates({ producer, region, wineName, vintage });
      if (list.length > 0) {
        setCandidates(list);
        // Only auto-surface the picker when there's a GENUINELY different
        // bottling to offer — never when the sole match is the exact wine
        // already filled in. A manual tap always opens (the user asked to see).
        const hasAlt = list.some((c) => candidateKey(c.wineName ?? '') !== candidateKey(wineName));
        if (!auto || hasAlt) setCandidatesOpen(true);
        else setCandidatesOpen(false);
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

  // Silently probe for alternative bottlings on label-derived flows so the
  // "similar bottlings" link only appears when Vinster actually has OTHER wines
  // to suggest — not when the sole match is the exact wine already filled in.
  // (Low-confidence reads use the auto path above, which opens the picker.)
  const probedRef = useRef(false);
  useEffect(() => {
    if (isManual || probedRef.current) return;
    if (wineDetails?.confidence === 'low') return;
    if (!producer.trim()) return;
    probedRef.current = true;
    let active = true;
    (async () => {
      try {
        const list = await fetchWineCandidates({ producer, region, wineName, vintage });
        if (active) setCandidates(list);
      } catch { /* silent — the link simply stays hidden */ }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManual, producer, wineDetails?.confidence]);

  // Candidates that are a DIFFERENT wine to the one already entered. The
  // "similar bottlings" link only shows when at least one exists.
  const hasAlternativeBottlings = candidates.some((c) => candidateKey(c.wineName ?? '') !== candidateKey(wineName));

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
    // Manual entries into the CELLAR keep a blank "+ Add" thumbnail (the user
    // picks the photo deliberately from the wine card). But a manual entry headed
    // to the Wine Intel card should still show a label — fetch one so the intel
    // screen isn't photo-less.
    if (isManual && context !== 'intel') return;
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
      grape: grape.trim() || wineDetails?.grape || null,
      // Pass any bottle size the scanner read off the label straight
      // through to /label/results so the Add modal can pre-populate the
      // picker. The user can still adjust it on that screen.
      bottleSizeMl: wineDetails?.bottleSizeMl ?? null,
      // Carry a batched lineup quantity through so /label/results seeds the
      // bottle count (e.g. a "×2" lineup entry adds 2 to the cellar).
      quantity: wineDetails?.quantity ?? 1,
    };

    setWineDetailsConfirmed(confirmed);

    // Bin diamond placement: the wine is confirmed here, then a small popup
    // collects bottles + format + purchase price before it's filed in the cell.
    if (isPlaceBin) {
      setBinConfirmed(confirmed);
      setBinPopupOpen(true);
      // Pre-fill the purchase price with Vinster's estimate (labelled as an
      // estimate in the popup). Non-blocking — the popup opens straight away and
      // the field fills in a moment later; the user can overwrite it.
      if (!binPrice.trim()) {
        setBinPriceEstimating(true);
        void (async () => {
          try {
            const intel = await generateWineIntel(confirmed, preferences?.defaultCurrency ?? 'GBP');
            if (intel.estimatedValue != null) setBinPrice((prev) => prev.trim() || String(Math.round(intel.estimatedValue!)));
          } catch { /* leave the field blank on failure */ }
          finally { setBinPriceEstimating(false); }
        })();
      }
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

    // Manual entry → confirm the approved wine-name match first, then build the
    // card for the match the user picks (or their typed entry if nothing matches).
    // A hand-typed manual entry gets the approved-match confirmation; a wine
    // picked from the search bar is already confirmed, so skip straight to intel.
    if (isManual && !pickedFromSearch) {
      await confirmManualMatch(confirmed);
      return;
    }
    await proceedIntel(confirmed);
  }

  // Generate the Wine Intel card for a confirmed identity and route to results.
  async function proceedIntel(confirmed: WineDetailsComplete) {
    setLoading(true);
    try {
      // generateWineIntel queries Wine-Searcher first (real market price +
      // WS-anchored critic score, converted to the user's currency), falling
      // back to the Claude estimate on a no-match. In parallel, auto-fetch a
      // label so a manual entry still shows a thumbnail on the intel card.
      // Only the value-intel flow (Search A Wine / Scan Label) offers to switch
      // to the local currency abroad; cellar/wishlist adds keep the home default.
      const intelCurrency = context === 'intel'
        ? await resolveIntelCurrency(preferences?.defaultCurrency)
        : (preferences?.defaultCurrency ?? 'GBP');
      const [intel] = await Promise.all([
        generateWineIntel(confirmed, intelCurrency),
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

  // Look up the approved wine-name match(es) for a manual entry and show a quick
  // confirmation. No match found (or the lookup fails) → proceed with the typed
  // entry rather than blocking.
  async function confirmManualMatch(confirmed: WineDetailsComplete) {
    pendingConfirmRef.current = confirmed;
    setMatchLoading(true);
    setMatchOptions([]);
    setMatchOpen(true);
    try {
      const q = [confirmed.producer, confirmed.wineName].filter(Boolean).join(' ').trim();
      const list = q ? await searchWines(q) : [];
      setMatchOptions(list);
      if (list.length === 0) {
        setMatchOpen(false);
        await proceedIntel(confirmed);
      }
    } catch {
      setMatchOpen(false);
      await proceedIntel(confirmed);
    } finally {
      setMatchLoading(false);
    }
  }

  // Pick an approved match: keep the typed vintage/size/quantity, take the
  // canonical producer / name / region / style from the match.
  function pickMatch(r: WineSearchResult) {
    const base = pendingConfirmRef.current;
    if (!base) return;
    setMatchOpen(false);
    void proceedIntel({
      ...base,
      producer: r.producer || base.producer,
      wineName: r.wineName ?? base.wineName,
      region: r.region ?? base.region,
      style: r.style ?? base.style,
    });
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
      // Duplicate check across the WHOLE cellar (any rack / fridge / location) —
      // same wine + vintage. If the user already owns it, offer to add these
      // bottles to that entry so the total stays correct, instead of spawning a
      // second listing (the "split across two locations" bug).
      const key = wineNameKey(producer, wineName.trim() || producer.trim());
      const wantVintage = vintage.trim();
      const dupe = key
        ? cellarWines.find((w) =>
            !w.is_wishlist && !w.archived_at &&
            wineNameKey(w.producer, w.wine_name) === key &&
            (w.vintage ?? '').trim() === wantVintage)
        : undefined;

      let merge = false;
      if (dupe) {
        merge = await new Promise<boolean>((resolve) => {
          showAlert({
            title: 'You already have this wine',
            body: `You already have ${dupe.quantity} bottle${dupe.quantity === 1 ? '' : 's'} of this wine in your cellar. Add these ${free.length} to that entry so your total stays correct, or keep this as a separate listing?`,
            dismissable: false,
            buttons: [
              { text: 'Add to existing', onPress: () => resolve(true) },
              { text: 'Keep separate', style: 'cancel', onPress: () => resolve(false) },
            ],
          });
        });
      }

      const labelUri = useLabelStore.getState().imageUri;
      if (merge && dupe) {
        // Merge: the new slots point at the EXISTING wine and its quantity grows
        // by what we placed — so the wine now spans both locations, one total.
        if (labelUri && !dupe.label_image_path) {
          try {
            const path = await uploadLabelImage(userId, labelUri, dupe.id);
            await updateWine.mutateAsync({ id: dupe.id, updates: { label_image_path: path } });
          } catch { /* non-fatal */ }
        }
        await assignSlots(pendingSlot.rackId, free, dupe.id);
        await updateWine.mutateAsync({ id: dupe.id, updates: { quantity: (dupe.quantity ?? 0) + free.length } });
      } else {
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
          grape_variety: grape.trim() || null,
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
        // Upload the scanned label photo so the slot shows the bottle thumbnail.
        // Manual entries have no image; a failed upload is non-fatal.
        if (labelUri) {
          try {
            const path = await uploadLabelImage(userId, labelUri, saved.id);
            await updateWine.mutateAsync({ id: saved.id, updates: { label_image_path: path } });
          } catch { /* non-fatal — placed without a thumbnail */ }
        }
        await assignSlots(pendingSlot.rackId, free, saved.id);
      }
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
    const priceNum = binPrice.trim() ? parseFloat(binPrice.replace(/[^0-9.]/g, '')) : NaN;
    const purchasePrice = Number.isFinite(priceNum) ? priceNum : null;
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
          grape_variety: grape.trim() || null,
          label_image_path: null,
          user_notes: null,
          is_wishlist: false,
          estimated_value: null,
          estimated_value_currency: null,
          estimated_value_at: null,
          estimated_value_source: null,
          purchase_price: purchasePrice,
          purchase_price_currency: purchasePrice != null ? (preferences?.defaultCurrency ?? 'GBP') : null,
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
      setBinPopupOpen(false);
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
      setGrape(details.grape ?? '');
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
      <Text style={styles.heading}>{isPureInput ? 'Input Wine Details' : 'Confirm Wine Details'}</Text>
      <Text style={styles.subheading}>
        {isPureInput
          ? 'Enter your wine details below.'
          : isManual
          ? 'Search for your wine, or enter the details below.'
          : 'Correct anything that looks wrong.'}
      </Text>

      {/* Bottling picker — sits directly under the blurb so a misread cuvée can
          be fixed before touching the fields. Label-derived flows only (manual
          entry has the predictive search below instead). */}
      {!isManual && (loadingCandidates || hasAlternativeBottlings) ? (
        <TouchableOpacity
          style={styles.candLink}
          onPress={() => { if (candidates.length > 0) { setSelectedCand(null); setCandidatesOpen(true); } else { void loadCandidates(false); } }}
          disabled={loadingCandidates}
          activeOpacity={0.7}
        >
          <Text style={styles.candLinkText}>
            {loadingCandidates && !candidatesOpen ? 'Finding bottlings…' : 'Vinster detects similar wines — tap to view and select'}
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Manual entry: predictive search fills producer/name/region/style from a
          real wine, and — once the producer is typed — a link to match the
          entry to one of Vinster's known bottlings, so a hand-typed name gets
          canonicalised (e.g. "Marroneto" → "Il Marroneto Brunello di
          Montalcino") and doesn't become a near-duplicate. */}
      {isManual && !isPureInput ? (
        <>
          <WineSearchInput initialQuery={seed} onSelect={(r) => {
            setProducer(r.producer);
            setWineName(r.wineName ?? '');
            setRegion(r.region ?? '');
            setStyle(r.style ?? '');
            setGrape(r.grape ?? '');
            if (!vintage.trim()) setHighlightVintage(true);
            // A search-bar pick IS the confirmation — skip the match popup.
            setPickedFromSearch(true);
          }} />
          {/* Gold header for the input fields, matching "Search your wine" above. */}
          <Text style={styles.inputYourWineLabel}>Input Your Wine</Text>
        </>
      ) : null}

      <Text style={styles.label}>Producer</Text>
      <StartAlignedInput
        style={styles.input}
        value={producer}
        onChangeText={(t) => { setProducer(t); setPickedFromSearch(false); }}
        placeholder="e.g. Château Margaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Region</Text>
      <StartAlignedInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
        placeholder="e.g. Margaux, Bordeaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Wine Name (optional)</Text>
      <StartAlignedInput
        style={styles.input}
        value={wineName}
        onChangeText={(t) => { setWineName(t); setPickedFromSearch(false); }}
        placeholder="e.g. Reserve, Cuvée Prestige"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Grape Variety</Text>
      <TextInput
        style={styles.input}
        value={grape}
        onChangeText={setGrape}
        placeholder="e.g. Albariño, Cabernet Sauvignon"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Vintage</Text>
      <TextInput
        style={[styles.input, highlightVintage && styles.inputHighlight]}
        value={vintage}
        onChangeText={(t) => { setVintage(t); if (highlightVintage) setHighlightVintage(false); }}
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

      {/* Bin diamond add: bottles + format + purchase price are collected in a
          popup AFTER this Confirm (see the placement modal below). */}

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
          {placing ? 'Adding…' : loading ? 'Loading wine details…' : 'Confirm'}
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.dismissTo(((backTo as string) || '/(tabs)/scan') as any)}>
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
      {/* Manual-entry match confirmation: pick the approved wine before Vinster
          builds the intel card. */}
      <Modal visible={matchOpen} transparent animationType="fade" onRequestClose={() => { if (!matchLoading) setMatchOpen(false); }}>
        <View style={styles.candOverlay}>
          <View style={styles.candSheet}>
            <Text style={styles.candTitle}>Is this your wine?</Text>
            <Text style={styles.candBody}>Vinster found these possible matches — tap one only if it's genuinely your wine. Rare or unusual bottles it may not know, so if none look right, keep your own entry.</Text>
            {matchLoading ? (
              <View style={styles.candLoading}><ActivityIndicator color={colors.gold} /><Text style={styles.candLoadingText}>Finding the match…</Text></View>
            ) : (
              <>
                <ScrollView style={{ maxHeight: 320 }}>
                  {matchOptions.map((r, i) => (
                    <TouchableOpacity key={`${r.producer}-${r.wineName ?? ''}-${i}`} style={styles.candRow} onPress={() => pickMatch(r)} activeOpacity={0.7}>
                      <View style={styles.candRowText}>
                        <Text style={styles.candItemName} numberOfLines={2}>{formatWineTitle({ producer: r.producer, wineName: r.wineName, region: r.region, vintage })}</Text>
                        {r.style ? <Text style={styles.candItemMeta} numberOfLines={1}>{r.style}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.candKeepBtn} onPress={() => { const b = pendingConfirmRef.current; setMatchOpen(false); if (b) void proceedIntel(b); }} activeOpacity={0.85}>
                  <Text style={styles.candKeepText}>{matchOptions.length ? 'None of these — use what I typed' : 'Use what I typed'}</Text>
                </TouchableOpacity>
                {/* Discard — abandon this wine entirely rather than proceeding
                    with any entry. Drops back out of the confirm flow. */}
                <TouchableOpacity style={styles.candDiscard} onPress={() => { setMatchOpen(false); if (router.canGoBack()) router.back(); else router.replace('/(tabs)'); }} activeOpacity={0.7}>
                  <Text style={styles.candDiscardText}>Discard</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bin placement details — shown after the wine is confirmed: bottles,
          format and (optional) purchase price, then filed into the diamond. */}
      <Modal visible={binPopupOpen} transparent animationType="fade" onRequestClose={() => !placing && setBinPopupOpen(false)}>
        <View style={styles.candOverlay}>
          <View style={styles.candSheet}>
            <Text style={styles.candTitle}>Add to your diamond</Text>
            <Text style={styles.candBody}>How many bottles, what format, and — if you like — the price you paid.</Text>

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
            <View style={{ height: spacing.md }} />
            <Text style={[styles.label, styles.binFieldLabel]}>Estimated Purchase Price / Bottle — {currencySymbol(preferences?.defaultCurrency ?? 'GBP')} (Vinster's estimate; edit if you know it)</Text>
            <TextInput
              style={styles.binQtyInput}
              value={binPrice}
              onChangeText={(t) => setBinPrice(t.replace(/[^0-9.]/g, '').slice(0, 10))}
              keyboardType="decimal-pad"
              placeholder={binPriceEstimating ? 'Estimating…' : `e.g. ${currencySymbol(preferences?.defaultCurrency ?? 'GBP')}45`}
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity style={[styles.button, placing && styles.buttonDisabled]} onPress={() => binConfirmed && void handlePlaceBinConfirm(binConfirmed)} disabled={placing}>
              <Text style={styles.buttonText}>{placing ? 'Adding…' : 'Add to Diamond'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => { if (!placing) setBinPopupOpen(false); }}>
              <Text style={styles.backText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              <>
                <ScrollView style={{ maxHeight: 320 }}>
                  {candidates.map((c, i) => {
                    const on = selectedCand === i;
                    return (
                      <TouchableOpacity key={`${c.wineName}-${i}`} style={styles.candRow} onPress={() => setSelectedCand(on ? null : i)} activeOpacity={0.7}>
                        <Text style={[styles.candCheck, on && styles.candCheckOn]}>{on ? '☑' : '☐'}</Text>
                        <View style={styles.candRowText}>
                          <Text style={styles.candItemName} numberOfLines={2}>{formatWineTitle({ producer, wineName: c.wineName, region: c.region, vintage })}</Text>
                          {c.style ? <Text style={styles.candItemMeta} numberOfLines={1}>{c.style}</Text> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.candConfirmBtn, selectedCand == null && styles.candConfirmBtnDisabled]}
                  onPress={() => { if (selectedCand != null) pickCandidate(candidates[selectedCand]); }}
                  disabled={selectedCand == null}
                  activeOpacity={0.85}
                >
                  <Text style={styles.candConfirmText}>Select This Wine</Text>
                </TouchableOpacity>
              </>
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
    marginBottom: spacing.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Form field label — body. Compact so five fields don't fill the screen.
  label: {
    fontSize: 12,
    fontFamily: fonts.bodySemibold,
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Gold section header above the manual input fields — mirrors the
  // "Search your wine" label on WineSearchInput.
  inputYourWineLabel: {
    fontSize: 13,
    fontFamily: fonts.bodySemibold,
    color: colors.gold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Form input — body. Reduced height/gap so all five fields fit comfortably.
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  // Gold highlight — draws attention to the vintage after a predictive pick,
  // since the search can't supply it.
  inputHighlight: { borderColor: colors.gold, borderWidth: 1.5, backgroundColor: 'rgba(224,184,74,0.10)' },
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
  candLinkText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center' },
  // Bottling picker modal (matches the results-screen "Which wine is this?").
  candOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  candSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%', maxWidth: 440 },
  candTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  candBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  candLoading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  candLoadingText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // Tickable list rows (lineup-detection style) — replaces the old bordered
  // "bubbles". Single-select: tapping a row ticks it; "Select This Wine" confirms.
  candRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  candCheck: { fontSize: 24, color: colors.textMuted, width: 28, textAlign: 'center' },
  candCheckOn: { color: colors.gold },
  candRowText: { flex: 1 },
  candItemName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  candItemMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  candConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  candConfirmBtnDisabled: { opacity: 0.4 },
  candConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  candCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  candCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  candDiscard: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  candDiscardText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  // "Use what I typed" — a real, prominent action (not a muted link), since for
  // obscure wines it's the RIGHT choice, not a fallback.
  candKeepBtn: { marginTop: spacing.md, alignSelf: 'stretch', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center' },
  candKeepText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textAlign: 'center' },
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
