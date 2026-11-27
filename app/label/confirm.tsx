import { useState, useEffect, useRef } from 'react';
import { ManualInputToggle } from '../../src/components/ManualInputToggle';
import { Text, TextInput, TouchableOpacity, StyleSheet, Modal, View, ScrollView, ActivityIndicator, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useLabelStore } from '../../src/stores/labelStore';
import { normaliseVintage } from '../../src/utils/wineIdentity';
import { wineDotColour, wineDotColourKey } from '../../src/utils/wineStyle';
import { fetchAutoLabelUri, fetchWineCandidates, searchWines, candidateKey, type WineCandidate, type WineSearchResult } from '../../src/api/label';
import { formatWineTitle } from '../../src/utils/wineTitle';
import { generateWineIntel, isWineNotFound } from '../../src/services/pricing';
import { marketValuePer75 } from '../../src/services/purchaseEstimate';
import { newCellarWinePayload, findSameWineLive, purchaseOnMerge, attachLabelIfMissing, type PurchaseInput } from '../../src/services/cellarAdd';
import { isStandardBottle } from '../../src/utils/bottleValue';
import { freeSlotsFrom } from '../../src/utils/rackSlots';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { useRackStore } from '../../src/stores/rackStore';
import { useCellar, invalidateCellarViews } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { assignSlots, getRackSlots } from '../../src/api/racks';
import { getBinCell } from '../../src/api/bins';
import { addBinPlacement } from '../../src/api/placements';
import { BottleSizePicker, detectPlacementMismatch, placementWarningBody } from '../../src/components/BottleSizePicker';
import { WineSearchInput } from '../../src/components/WineSearchInput';
import { StartAlignedInput } from '../../src/components/StartAlignedInput';
import { usePreferences } from '../../src/hooks/usePreferences';
import { currencySymbol } from '../../src/constants/currency';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { CellarWine, WineDetailsComplete } from '../../src/types/wine';

export default function LabelConfirmScreen() {
  useKeepAwake();
  const { context, manual, mode, backTo, via, seed } = useLocalSearchParams<{ context?: string; manual?: string; mode?: string; backTo?: string; via?: string; seed?: string }>();
  // Reached by uploading a photo (not the camera): the bottom link is "Upload
  // Again" and Back leaves the flow — "Scan Again" (reopen the camera) only
  // belongs to the camera flow.
  const isUpload = via === 'upload';
  // Forward any context (reviews / lineup / …) so /label/results knows
  // which flow we're in for back routing and which action set to show.
  const contextQuery = context ? `?context=${context}${via ? `&via=${via}` : ''}${backTo ? `&backTo=${encodeURIComponent(backTo)}` : ''}` : '';
  // Search/Manual Input: no scan happened, so the form opens blank and there's
  // nothing to "scan again".
  const isManual = manual === '1';
  // Pure manual input (Scan → Manual Input): the user explicitly chose to type,
  // not search — so no predictive search bar, and the screen reads "Input Wine
  // Details" rather than "Confirm …".
  const isPureInput = mode === 'input';
  // Search first: the manual fields stay folded under "Input Your Wine
  // Instead ▾" until tapped, or until a search pick fills them in. A typed
  // seed (a wine the search didn't know) opens them straight away.
  const [manualOpen, setManualOpen] = useState(!!seed);
  const showFields = !isManual || isPureInput || manualOpen;
  // Reached from Scan a Lineup — Back returns to the lineup list to continue
  // onboarding the remaining bottles.
  const isLineup = context === 'lineup';
  const { wineDetails, imageUri, setWineDetails, setWineDetailsConfirmed, setIntelligence, setError } = useLabelStore();
  const { preferences } = usePreferences();
  // Rack-placement context: when the user reached here by tapping an empty rack
  // slot, we skip Wine Intel and drop the bottle straight into the slot.
  const { pendingSlot, setPendingSlot, pendingSlots, setPendingSlots, pendingBinCell, setPendingBinCell } = useRackStore();
  const isMultiSlot = (pendingSlots?.length ?? 0) > 1;
  // Bin-diamond placement (context=place-bin): bottles, format and price are
  // collected in a popup once the wine is confirmed.
  const isPlaceBin = context === 'place-bin' && !!pendingBinCell;
  // The target cell — drives the "This diamond/half diamond fits X bottles" blurb.
  const { data: binCellData } = useQuery({
    queryKey: ['bin-cell', pendingBinCell?.cellId],
    queryFn: () => getBinCell(pendingBinCell!.cellId),
    enabled: isPlaceBin,
  });
  const binCellKind = binCellData?.cell.kind === 'triangle' ? 'half diamond' : 'diamond';
  const binCellCapacity = binCellData?.cell.capacity ?? null;
  const { wines: cellarWines, addWine, updateWine } = useCellar();
  const { session } = useAuth();
  const qc = useQueryClient();

  // Manual input always starts blank — not every entry point resets the label
  // store first, so seeding from a leftover scan would carry the PREVIOUS wine's
  // details (and, via the store, its photo) into this fresh manual entry.
  // A typed seed (Home's "use what I typed") lands in Producer as well as the
  // search bar, so Confirm works without picking a suggestion.
  const [producer, setProducer] = useState(isManual ? (seed ?? '').trim() : (wineDetails?.producer ?? ''));
  // What's in the search bar now — the fallback Producer when the user typed a
  // wine but didn't pick a suggestion and the fields are still folded away.
  const [searchText, setSearchText] = useState(seed ?? '');
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
  const [placing, setPlacing] = useState(false);
  // Set from the first tap until the add finishes, so a double tap can't add twice.
  const placingRef = useRef(false);
  // Bin popup (place-bin context): bottles, format and purchase price.
  const [binQty, setBinQty] = useState('1');
  const [binFormat, setBinFormat] = useState(wineDetails?.bottleSizeMl ?? 750);
  const [binPrice, setBinPrice] = useState('');
  const [binPriceEstimating, setBinPriceEstimating] = useState(false);
  // Vinster's 75cl market price for the confirmed wine. The price field shows it
  // for a 75cl bottle until the user types their own — an untouched price is
  // saved as an estimate, not "Entered by you". Another size is worth its own
  // price, which the wine card estimates once the wine is saved.
  const [binPer75, setBinPer75] = useState<{ value: number; currency: string; source: string } | null>(null);
  const [binPriceEdited, setBinPriceEdited] = useState(false);
  const [binPopupOpen, setBinPopupOpen] = useState(false);
  const [binConfirmed, setBinConfirmed] = useState<WineDetailsComplete | null>(null);
  useEffect(() => {
    if (binPer75 && !binPriceEdited) setBinPrice(isStandardBottle(binFormat) ? String(Math.round(binPer75.value)) : '');
  }, [binPer75, binFormat, binPriceEdited]);

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

  // A wine with no photo still gets a thumbnail on its Wine Intel card: the best
  // web match, no picker (the wine-card "Find Label Online" keeps its picker for
  // deliberate choice). Best-effort: never blocks the flow.
  async function ensureAutoLabel(pProducer: string, pWineName: string | null) {
    // A manual entry headed for the cellar (not the Wine Intel card) carries no
    // picture forward; the add gives it a web label instead.
    if (isManual && context !== 'intel') return;
    if (useLabelStore.getState().imageUri) return;
    if (!pProducer.trim()) return;
    try {
      const uri = await fetchAutoLabelUri(pProducer, pWineName);
      if (uri && !useLabelStore.getState().imageUri) useLabelStore.getState().setImageUri(uri);
    } catch { /* best-effort — no thumbnail is fine */ }
  }

  async function handleConfirm() {
    // Wine Intel works the region out itself, so only the cellar / review flows
    // (which store it) insist on one.
    const regionNeeded = context !== 'intel';
    // Typed in the search bar, no suggestion picked, fields still hidden: open
    // them with the typed text as the Producer rather than complaining about a
    // field the user can't see.
    if (isManual && !showFields && !producer.trim()) {
      const typed = searchText.trim();
      if (typed) setProducer(typed);
      setManualOpen(true);
      return;
    }
    if (!producer.trim() || (regionNeeded && !region.trim())) {
      showAlert({
        title: 'Missing details',
        body: regionNeeded ? 'Producer and region are required.' : 'Please enter the producer.',
      });
      return;
    }
    // A 4-digit year or NV — "19" or "2O19" isn't sent on as a vintage.
    const confirmedVintage = normaliseVintage(vintage);
    if (!confirmedVintage) {
      showAlert({ title: 'Enter a 4-digit year or NV', body: 'e.g. 2018, or NV for a non-vintage wine.' });
      return;
    }

    const confirmed: WineDetailsComplete = {
      producer: producer.trim(),
      region: region.trim(),
      wineName: wineName.trim() || null,
      vintage: confirmedVintage,
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
      // Pre-fill the price with Vinster's estimate for THIS wine (it may have
      // been edited since the last Confirm). Non-blocking — the popup opens
      // straight away and the field fills in a moment later.
      if (!binPriceEdited) {
        setBinPer75(null);
        setBinPrice('');
        setBinPriceEstimating(true);
        const currency = preferences?.defaultCurrency ?? 'GBP';
        marketValuePer75({ producer: confirmed.producer, wine_name: confirmed.wineName || confirmed.producer, region: confirmed.region, vintage: confirmed.vintage, grape_variety: confirmed.grape ?? null }, currency, 'full')
          .then(setBinPer75)
          .catch(() => { /* leave the field blank */ })
          .finally(() => setBinPriceEstimating(false));
      }
      return;
    }

    // Rack placement from an empty slot (context=place, so a stale pendingSlot
    // can't hijack an unrelated add). The format was picked inline above; a
    // short tap places one bottle, multi-select fills the chosen slots.
    if (pendingSlot && context === 'place') {
      await handlePlaceConfirm(confirmed);
      return;
    }

    // Cellar List "Add Wine" (no explicit context) and adds into a home storage
    // location: no Wine Intel card — go straight to the Add form on results.
    // A wine saved without a photo gets a web label from the add itself.
    if (!context || context === 'add-location') {
      setIntelligence(null);
      router.replace(`/label/results?context=${context === 'add-location' ? 'add-location' : 'add'}${backTo ? `&backTo=${encodeURIComponent(backTo)}` : ''}`);
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
      // Intel flow: navigate to the results screen NOW (instant shell + swirls)
      // and let it build the intel. Auto-fetch a label in the background so a
      // manual entry still gets a header thumbnail. Manual/typed entries aren't
      // tile scans → noRecent keeps them out of Recent Scans.
      if (context === 'intel') {
        setIntelligence(null);
        void ensureAutoLabel(confirmed.producer, confirmed.wineName);
        router.replace(`/label/results${contextQuery}&fresh=1&gen=1${isManual ? '&noRecent=1' : ''}`);
        return;
      }
      // Non-intel adds (cellar) keep the home default and generate now.
      const intelCurrency = preferences?.defaultCurrency ?? 'GBP';
      const [intel] = await Promise.all([
        generateWineIntel(confirmed, intelCurrency),
        ensureAutoLabel(confirmed.producer, confirmed.wineName),
      ]);
      setIntelligence(intel);
      useLastIntelStore.getState().setLast(confirmed, intel, { recordRecent: !isManual });
      router.replace(`/label/results${contextQuery}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wine details');
      if (isWineNotFound(err)) showAlert({ title: "Vinster couldn't find this wine", body: 'Check the producer, wine name and vintage, then try again.' });
      else showAlert({ title: 'Error', body: 'Could not load wine details. Please try again.' });
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

  // "Already in your cellar": add these bottles to that line, keep them as a
  // separate line, or cancel. Same question for the rack and bin adds.
  function askAddToExisting(existing: CellarWine): Promise<'merge' | 'separate' | 'cancel'> {
    const name = [existing.producer, existing.wine_name !== existing.producer ? existing.wine_name : '', existing.vintage].filter(Boolean).join(' ');
    const have = existing.quantity ?? 0;
    return new Promise((resolve) => {
      showAlert({
        title: 'YOU ALREADY HAVE THIS WINE IN YOUR CELLAR',
        body: `${name}\n\nYou already have ${have} bottle${have === 1 ? '' : 's'} of this wine in your cellar. Should Vinster add these to your overall bottle count or keep these bottles as a separate listing?`,
        dismissable: false,
        buttons: [
          { text: 'Add to Existing', onPress: () => resolve('merge') },
          { text: 'Keep Separate', onPress: () => resolve('separate') },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve('cancel') },
        ],
      });
    });
  }

  // The bottles are saved but filing them failed. Say so and leave, so a retry
  // can't add them a second time.
  function savedButNotPlaced(leave: () => void) {
    showAlert({
      title: "Saved to your cellar, but couldn't place it",
      body: "You'll find it in your Full Cellar List — place it from there.",
      buttons: [{ text: 'OK', onPress: leave }],
    });
  }

  // Save the wine and drop it into the tapped slot, or into each slot picked in
  // multi-select. Quantity follows the slots actually filled, so the rack and
  // cellar counts can't drift apart.
  async function handlePlaceConfirm(confirmed: WineDetailsComplete) {
    const slot = pendingSlot;
    if (!slot || placingRef.current) return;
    const userId = session?.user.id;
    if (!userId) return;
    placingRef.current = true;
    setPlacing(true);
    let savedId: string | null = null;
    try {
      // A bottle that doesn't suit the slot (a magnum in a 75cl slot, a half
      // bottle in the large-format band): warn once, the user decides.
      const mismatch = detectPlacementMismatch(placeFormat, slot.row, slot.largeFormatBottleSizeMl);
      if (mismatch) {
        const proceed = await new Promise<boolean>((resolve) => {
          showAlert({
            title: 'Bottle size mismatch',
            body: placementWarningBody(mismatch),
            buttons: [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Place anyway', onPress: () => resolve(true) },
            ],
          });
        });
        if (!proceed) return;
      }
      const requested = isMultiSlot ? pendingSlots!.length : 1;
      const taken = await getRackSlots(slot.rackId);
      const occupied = new Set(taken.filter((s) => s.cellar_wine_id).map((s) => `${s.row_index},${s.col_index}`));
      const free = isMultiSlot
        // Multi-slot: fill exactly the hand-picked slots, skipping any now taken.
        ? pendingSlots!.filter((s) => !occupied.has(`${s.row},${s.col}`))
        : freeSlotsFrom(slot.row, slot.col, slot.rows, slot.cols, 1, 'Vertical', occupied, slot.largeFormatCols);
      if (free.length === 0) {
        showAlert({ title: 'No room here', body: 'There are no free slots left from this position. Try a different slot.' });
        return;
      }

      // Already own this wine, vintage and size (anywhere in the cellar)? Offer
      // to add these bottles to that line so the total stays right.
      const payload = newCellarWinePayload({ userId, wine: confirmed, quantity: free.length, bottleSizeMl: placeFormat });
      const existing = await findSameWineLive(userId, cellarWines, payload);
      const choice = existing ? await askAddToExisting(existing) : 'separate';
      if (choice === 'cancel') return;

      const labelUri = useLabelStore.getState().imageUri;
      if (existing && choice === 'merge') {
        await updateWine.mutateAsync({ id: existing.id, updates: { quantity: (existing.quantity ?? 0) + free.length } });
        savedId = existing.id;
        await attachLabelIfMissing(userId, existing, labelUri);
      } else {
        const saved = await addWine.mutateAsync({ ...payload, hasOwnPhoto: !!labelUri });
        savedId = saved.id;
        await attachLabelIfMissing(userId, saved, labelUri);
      }
      await assignSlots(slot.rackId, free, savedId);
      invalidateCellarViews(qc);
      setPendingSlot(null);
      setPendingSlots(null);
      if (free.length < requested) {
        showAlert({
          title: 'Placed what fit',
          body: `Only ${free.length} of ${requested} bottles fit from here — the rest weren't placed. What did fit is in your Full Cellar List.`,
          buttons: [{ text: 'OK', onPress: () => router.replace(`/cellar/rack/${slot.rackId}`) }],
        });
      } else {
        // Land on the rack (bottles visibly placed) with a brief auto-fading
        // "Added to your cellar" banner — no popup with commands to dismiss.
        router.replace(`/cellar/rack/${slot.rackId}?placed=1`);
      }
    } catch (err) {
      if (savedId) {
        invalidateCellarViews(qc);
        setPendingSlot(null);
        setPendingSlots(null);
        savedButNotPlaced(() => router.replace(`/cellar/rack/${slot.rackId}`));
      } else {
        showAlert({ title: 'Could not place wine', body: err instanceof Error ? err.message : 'Please try again.' });
      }
    } finally {
      placingRef.current = false;
      setPlacing(false);
    }
  }

  // Save the wine into the bin diamond with the popup's bottles, format and
  // price. A bin is just another home storage location (mig 116): a wine the
  // user already owns (same wine, vintage and size, anywhere in the cellar) can
  // join that line, and the bin membership is recorded as a placement.
  async function handlePlaceBinConfirm(confirmed: WineDetailsComplete) {
    if (!pendingBinCell || placingRef.current) return;
    const userId = session?.user.id;
    if (!userId) return;
    const { cellId } = pendingBinCell;
    const qty = Math.max(1, parseInt(binQty, 10) || 1);
    const priceNum = binPrice.trim() ? parseFloat(binPrice.replace(/[^0-9.]/g, '')) : NaN;
    const currency = preferences?.defaultCurrency ?? 'GBP';
    const purchase: PurchaseInput = { price: Number.isFinite(priceNum) ? priceNum : null, currency, estimated: !binPriceEdited };
    const payload = newCellarWinePayload({
      userId, wine: confirmed, quantity: qty, bottleSizeMl: binFormat, purchase,
      marketValue: binPer75 ? { per75: binPer75.value, currency: binPer75.currency, source: binPer75.source } : null,
    });

    const commit = async (mergeInto: CellarWine | null) => {
      placingRef.current = true;
      setPlacing(true);
      let savedId: string | null = null;
      try {
        const labelUri = useLabelStore.getState().imageUri;
        if (mergeInto) {
          await updateWine.mutateAsync({ id: mergeInto.id, updates: { quantity: (mergeInto.quantity ?? 0) + qty, ...purchaseOnMerge(mergeInto, purchase) } });
          savedId = mergeInto.id;
          await attachLabelIfMissing(userId, mergeInto, labelUri);
        } else {
          const saved = await addWine.mutateAsync({ ...payload, hasOwnPhoto: !!labelUri });
          savedId = saved.id;
          await attachLabelIfMissing(userId, saved, labelUri);
        }
        // Bin membership is a placement (kind='bin'), NOT bin_cell_id.
        await addBinPlacement(savedId, cellId, qty);
        invalidateCellarViews(qc);
        setPendingBinCell(null);
        setBinPopupOpen(false);
        leaveBinAdd();
      } catch (err) {
        if (savedId) {
          invalidateCellarViews(qc);
          setPendingBinCell(null);
          setBinPopupOpen(false);
          savedButNotPlaced(leaveBinAdd);
        } else {
          showAlert({ title: 'Could not add wine', body: err instanceof Error ? err.message : 'Please try again.' });
        }
      } finally {
        placingRef.current = false;
        setPlacing(false);
      }
    };
    function leaveBinAdd() {
      if (router.canGoBack()) router.back();
      else router.replace(`/cellar/bin/cell/${cellId}` as any);
    }

    placingRef.current = true;
    setPlacing(true);
    let existing: CellarWine | null = null;
    try {
      existing = await findSameWineLive(userId, cellarWines, payload);
    } catch (err) {
      showAlert({ title: 'Could not add wine', body: err instanceof Error ? err.message : 'Please try again.' });
      return;
    } finally {
      placingRef.current = false;
      setPlacing(false);
    }
    if (!existing) { await commit(null); return; }
    setBinPopupOpen(false);
    const choice = await askAddToExisting(existing);
    if (choice !== 'cancel') await commit(choice === 'merge' ? existing : null);
  }

  // Leave an upload or manual entry: to the screen the caller named (backTo),
  // else the one it came from — a rack slot, a bin, the Cellar List.
  function leaveFlow() {
    if (backTo) router.dismissTo(backTo as any);
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/scan');
  }

  // The header's back arrow leaves by the same route as this mode's bottom link
  // ("Back to Lineup" for a lineup, otherwise "Input Again" → leaveFlow).
  function goBack() {
    if (isLineup) router.replace('/cellar/scan-lineup');
    else leaveFlow();
  }

  return (
    <>
    <View style={styles.container}>
      {/* Same header bar as Edit Wine Details — only the title differs, because
          here the wine isn't in the cellar yet and IS being confirmed. */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isPureInput ? 'Input Wine Details' : 'Confirm Wine Details'}</Text>
        <View style={{ width: 40 }} />
      </View>
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      bottomOffset={24}
    >
      {/* The label just scanned, shown at the same size as the edit screen's
          thumbnail — the wine's identity is easier to check against the bottle
          in front of you. Manual entry has no photo yet, so no block. */}
      {imageUri ? (
        <View style={styles.thumbBlock}>
          <View style={styles.thumbFrame}>
            <Image source={{ uri: imageUri }} style={styles.thumbImg} resizeMode="cover" />
          </View>
        </View>
      ) : null}

      {/* Bottling picker — sits directly under the label shot so a misread cuvée
          can be fixed before touching the fields. Label-derived flows only
          (manual entry has the predictive search below instead). */}
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
          <WineSearchInput initialQuery={seed} onQueryChange={setSearchText} onSelect={(r) => {
            setProducer(r.producer);
            setWineName(r.wineName ?? '');
            setRegion(r.region ?? '');
            setStyle(r.style ?? '');
            setGrape(r.grape ?? '');
            // A vintage typed into the search ("… 2009") fills the vintage field.
            if (r.vintage) setVintage(r.vintage);
            else if (!vintage.trim()) setHighlightVintage(true);
            // A search-bar pick IS the confirmation — skip the match popup.
            setPickedFromSearch(true);
            // Show the filled-in fields so the vintage can be checked.
            setManualOpen(true);
          }} />
          <ManualInputToggle open={manualOpen} onToggle={() => setManualOpen((v) => !v)} />
        </>
      ) : null}

      {showFields ? (
      <>
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
      </>
      ) : null}

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
      ) : (
        // However the wine came in (scanned, uploaded, searched or typed), the
        // way to correct it is the same: back to where it was entered.
        <TouchableOpacity style={styles.backButton} onPress={leaveFlow}>
          <Text style={styles.backText}>Input Again</Text>
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
                      <View style={[styles.colourDot, { backgroundColor: wineDotColour(wineDotColourKey(r)) }]} />
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
            <Text style={styles.candTitle}>Add to Diamond</Text>
            <Text style={styles.candBody}>
              {binCellCapacity != null
                ? `This ${binCellKind} fits ${binCellCapacity} ${binCellCapacity === 1 ? 'bottle' : 'bottles'}.`
                : 'How many bottles, and the format.'}
            </Text>

            <Text style={[styles.label, styles.binFieldLabel]}>Bottle Size</Text>
            <BottleSizePicker value={binFormat} onChange={setBinFormat} />
            <View style={{ height: spacing.md }} />
            <Text style={[styles.label, styles.binFieldLabel]}>Number of Bottles</Text>
            <TextInput
              style={styles.binQtyInput}
              value={binQty}
              onChangeText={(t) => setBinQty(t.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              placeholder="e.g. 6"
              placeholderTextColor={colors.textMuted}
            />
            <View style={{ height: spacing.md }} />
            <Text style={[styles.label, styles.binFieldLabel]}>Estimated Purchase Price</Text>
            <Text style={styles.binPriceHint}>Vinster's Estimate, edit if you know it.</Text>
            <View style={styles.binPriceRow}>
              <Text style={styles.binPriceSymbol}>{currencySymbol(preferences?.defaultCurrency ?? 'GBP')}</Text>
              <TextInput
                style={[styles.binQtyInput, styles.binPriceInput]}
                value={binPrice}
                onChangeText={(t) => { setBinPriceEdited(true); setBinPrice(t.replace(/[^0-9.]/g, '').slice(0, 10)); }}
                keyboardType="decimal-pad"
                placeholder={binPriceEstimating ? 'Estimating…' : 'e.g. 45'}
                placeholderTextColor={colors.textMuted}
              />
            </View>

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
    </View>

    </>
  );
}

const styles = StyleSheet.create({
  // The wine's colour dot, as in every wine search list.
  colourDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.3)' },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 60 },
  // Header bar — identical to the Edit Wine Details screen so the confirm and
  // edit surfaces read as one screen with two titles.
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  // Scanned label, framed in the cream mat the cellar thumbnails use.
  thumbBlock: { alignItems: 'center', marginBottom: spacing.lg },
  thumbFrame: { backgroundColor: colors.cream, padding: 4, borderRadius: 12, overflow: 'hidden' },
  thumbImg: { width: 160, height: 210, borderRadius: 8 },
  scanOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  scanSheet: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.xl, alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.gold },
  scanText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  // Form field label — identical metrics to the Edit Wine Details screen.
  label: {
    fontSize: 12,
    fontFamily: fonts.bodySemibold,
    color: colors.textMuted,
    marginBottom: 6,
    marginTop: spacing.sm,
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
  // Form input — identical metrics to the Edit Wine Details screen (the gap
  // below each field comes from the next label's marginTop).
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
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
  binPriceHint: { fontFamily: fonts.bodyRegular, fontStyle: 'italic', fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: spacing.xs },
  binPriceRow: { flexDirection: 'row', alignItems: 'center' },
  binPriceSymbol: { fontFamily: fonts.bodySemibold, fontSize: 18, color: colors.text, marginRight: spacing.sm },
  binPriceInput: { flex: 1 },
  binQtyInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.text, backgroundColor: colors.surface },
  // Primary action — the gold outline the Edit Wine Details screen uses, so
  // Save and Confirm are the same button in both places.
  button: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: colors.gold,
    fontFamily: fonts.headingSemibold,
    fontSize: 17,
  },
  // Secondary link under it (Input Again / Back to Lineup) — the edit
  // screen's underlined "Cancel" treatment.
  backButton: { alignItems: 'center', paddingVertical: spacing.md },
  backText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    textDecorationLine: 'underline',
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
});
