import { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { VinstersNoteHeading } from '../../src/components/VinstersNoteHeading';
import { NoIntelPrompt } from '../../src/components/NoIntelPrompt';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLabelStore } from '../../src/stores/labelStore';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { useCellar, useWishList } from '../../src/hooks/useCellar';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { findExistingReview, appendDatedEntry, todayLabel } from '../../src/utils/reviewDedup';
import { fetchCellarLocations, addWinesToFilter } from '../../src/api/customFilters';
import type { ChosenWine, WineIntelligence } from '../../src/types/wine';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useRackStore } from '../../src/stores/rackStore';
import { useRacks } from '../../src/hooks/useRacks';
import { assignSlots, getRackSlots, getSlotAssignments } from '../../src/api/racks';
import { formatCurrency, currencySymbol } from '../../src/constants/currency';
import { BottleSizePicker, detectPlacementMismatch, placementWarningBody, COMMON_BOTTLE_SIZES, bottleSizeLabel } from '../../src/components/BottleSizePicker';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

function DrinkingWindowBadge({ status, from, to }: { status: string; from: number | null; to: number | null }) {
  const labels: Record<string, { text: string; color: string }> = {
    too_young: { text: 'Too Young', color: colors.warning },
    approaching: { text: 'Approaching Peak', color: colors.gold },
    peak: { text: 'Peak Now', color: colors.gold },
    declining: { text: 'Declining', color: colors.gold },
    unknown: { text: 'Drinking Window Unknown', color: colors.textMuted },
  };
  const badge = labels[status] ?? labels.unknown;
  const window = from && to ? `${from}–${to}` : null;

  return (
    <View style={styles.badge}>
      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
      {window && <Text style={styles.badgeWindow}>{window}</Text>}
    </View>
  );
}

// Compact label + colour for the drinking-window stat cell — mirrors the badge
// above and the cellar wine card, with shorter labels for the tight cell.
function windowMeta(status: string): { text: string; color: string } {
  const map: Record<string, { text: string; color: string }> = {
    too_young: { text: 'Too Young', color: colors.warning },
    approaching: { text: 'Approaching', color: colors.gold },
    peak: { text: 'Peak Now', color: colors.gold },
    declining: { text: 'Declining', color: colors.gold },
    unknown: { text: 'Unknown', color: colors.textMuted },
  };
  return map[status] ?? map.unknown;
}


// Stand-in intel for the no-intel "Add Wine" flow so the shared render + save
// code can read intel.* uniformly (all blank — real intel is generated later
// from the wine card / Generate Wine Intel).
const EMPTY_INTEL: WineIntelligence = {
  criticScore: null,
  drinkingWindowFrom: null,
  drinkingWindowTo: null,
  drinkingWindowStatus: 'unknown',
  grapeVariety: null,
  tastingNotes: '',
  estimatedValue: null,
  valueSource: null,
};

export default function LabelResultsScreen() {
  const { context } = useLocalSearchParams<{ context?: string }>();
  const isWishlistFlow = context === 'wishlist';
  // Entered from Your Wine Reviews "+ Add" — the only intent is to capture
  // a review, so the action area collapses to a single "Review this Wine"
  // and the back + post-save routing land on /wines/chosen.
  const isReviewsFlow = context === 'reviews';
  // Entered from Scan a Lineup — after saving (placed or not) we return to the
  // lineup list to onboard the next bottle, rather than the rack / wine card.
  const isLineupFlow = context === 'lineup';
  // Entered from the Cellar tab's "Generate Wine Intel" — view-only. The card
  // surfaces the intel and nothing more; there's no Add-to-Cellar action here
  // (saving a bottle lives in the rack / +Add Bottles flows). Other add flows
  // — review-add, Archive a Night, manual add — keep their Add to Cellar.
  const isIntelOnlyFlow = context === 'intel';
  // Entered from Cellar List "Add Wine" — no Wine Intel card. Go straight to the
  // Add-to-Cellar confirmation (size / quantity / orientation / location); intel
  // is generated later, only from the Cellar tab's Generate Wine Intel.
  const isAddFlow = context === 'add';
  const { wineDetailsConfirmed, intelligence } = useLabelStore();
  const { session } = useAuth();
  const { wines, addWine, updateWine } = useCellar();
  const { addWine: addToWishList } = useWishList();
  const { saveManual, update: updateChosen, chosenWines } = useChosenWines();
  const { pendingSlot, setPendingSlot, setPendingWineId, setPendingStorageType } = useRackStore();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  const userCurrency = preferences?.defaultCurrency ?? 'GBP';

  // When Generate Wine Intel comes back empty (no score, no value) it's almost
  // always a misspelt / wrongly-ordered name — prompt the user to check it.
  const [noIntelDismissed, setNoIntelDismissed] = useState(false);
  const [addingToCellar, setAddingToCellar] = useState(false);
  const [addingToWishList, setAddingToWishList] = useState(false);
  const [addingReview, setAddingReview] = useState(false);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  // Bespoke cellar Location (rack_id NULL custom filter) chosen as the
  // destination — mutually exclusive with a rack/fridge selection.
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  // Pre-populate the bottle size picker from the label scanner. Lazy init
  // reads the labelStore once at mount; the user can still adjust the
  // chip selection afterwards on the Add modals.
  const [bottleSizeMl, setBottleSizeMl] = useState<number>(() =>
    useLabelStore.getState().wineDetailsConfirmed?.bottleSizeMl ?? 750
  );
  const [saving, setSaving] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  // Review-without-adding form state — captured in a Modal and saved to
  // chosen_wines without touching cellar or wishlist inventory.
  const [reviewNote, setReviewNote] = useState('');
  const [reviewRestaurant, setReviewRestaurant] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewScore, setReviewScore] = useState('');
  const [reviewListPrice, setReviewListPrice] = useState('');
  // Only used when the user came in from a tapped empty rack slot.
  const [placeCount, setPlaceCount] = useState('1');
  const [placeOrientation, setPlaceOrientation] = useState<'Vertical' | 'Horizontal'>('Vertical');
  // Add-to-Cellar form: how many bottles, which compact field dropdown is
  // open, and the "Other" custom bottle size.
  // Seed from a batched lineup quantity when present (e.g. a "×2" lineup entry
  // pre-fills 2); plain single-bottle scans carry nothing and default to 1.
  const [bottleCount, setBottleCount] = useState(() =>
    Math.max(1, useLabelStore.getState().wineDetailsConfirmed?.quantity ?? 1)
  );
  const [openField, setOpenField] = useState<null | 'storage' | 'bottle' | 'count'>(null);
  const [customSizeMode, setCustomSizeMode] = useState(false);
  const [customSizeCl, setCustomSizeCl] = useState('');

  // When the user came in from a specific empty rack slot, load that
  // rack's slots so a multi-bottle placement can skip any occupied ones.
  const { data: pendingRackSlots = [] } = useQuery({
    queryKey: ['rack-slots', pendingSlot?.rackId],
    queryFn: () => getRackSlots(pendingSlot!.rackId),
    enabled: !!pendingSlot,
  });

  // Bespoke cellar-wide Locations (rack_id NULL) — offered as destinations in
  // the Add flow alongside Cellar List and the racks/fridges. Per-rack filters
  // are deliberately excluded.
  const { data: cellarLocations = [] } = useQuery({
    queryKey: ['cellar-locations', session?.user.id],
    queryFn: () => fetchCellarLocations(session!.user.id),
    enabled: !!session?.user.id,
  });

  // Across-all-racks placement map, so the duplicate prompt can tell the user
  // *where* their existing bottles already sit (e.g. "in your Kitchen rack").
  const allRackIds = racks.map((r) => r.id);
  const { data: allSlotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', allRackIds],
    queryFn: () => getSlotAssignments(allRackIds),
    enabled: allRackIds.length > 0,
  });

  // Human-readable description of where a cellar wine's bottles are placed.
  // Returns "in your X rack", "across your X and Y racks", or "unplaced".
  function existingLocationText(cellarWineId: string): string {
    const rackNames = Array.from(
      new Set(
        allSlotAssignments
          .filter((s) => s.cellar_wine_id === cellarWineId)
          .map((s) => racks.find((r) => r.id === s.rack_id)?.name)
          .filter((n): n is string => !!n),
      ),
    );
    if (rackNames.length === 0) return 'not yet in a rack';
    if (rackNames.length === 1) return `in your ${rackNames[0]} rack`;
    return `across your ${rackNames.slice(0, -1).join(', ')} and ${rackNames[rackNames.length - 1]} racks`;
  }

  // Pre-fill the purchase price with Vinster's estimate (now real Wine-Searcher
  // market data when matched) so the field starts populated in every add flow —
  // not just when the Add-to-Cellar button's onPress happens to fire first.
  useEffect(() => {
    const est = intelligence?.estimatedValue;
    if (est != null) setPurchasePrice((prev) => prev || String(est));
  }, [intelligence?.estimatedValue]);

  // Add flow has no intel card — drop the user straight onto the Add-to-Cellar
  // confirmation (size / quantity / orientation / location).
  useEffect(() => {
    if (isAddFlow) setAddingToCellar(true);
  }, [isAddFlow]);

  // The Add flow legitimately has no intel; every other flow needs it.
  if (!wineDetailsConfirmed || (!intelligence && !isAddFlow)) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No results available.</Text>
        <TouchableOpacity onPress={() => router.replace('/label/camera')}>
          <Text style={styles.linkText}>Scan a label</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const wine = wineDetailsConfirmed;
  const intel = intelligence ?? EMPTY_INTEL;

  function computeSlots(
    startRow: number, startCol: number,
    totalRows: number, totalCols: number,
    count: number, orient: 'Horizontal' | 'Vertical',
    largeFormatCols?: number | null,
  ): Array<{ row: number; col: number }> {
    const result: Array<{ row: number; col: number }> = [];
    // Large-format row (row_index = -1) is a one-row band above the
    // standard grid. Cap placement to that row's width and force
    // horizontal orientation so magnums can never bleed into 750ml slots.
    const inLargeFormat = startRow === -1;
    if (inLargeFormat) {
      const lfCols = largeFormatCols ?? 0;
      let col = startCol;
      for (let i = 0; i < count; i++) {
        if (col >= lfCols) break;
        result.push({ row: -1, col });
        col++;
      }
      return result;
    }
    let row = startRow;
    let col = startCol;
    for (let i = 0; i < count; i++) {
      if (row >= totalRows || col >= totalCols) break;
      result.push({ row, col });
      if (orient === 'Horizontal') {
        col++;
        if (col >= totalCols) { col = 0; row++; }
      } else {
        row++;
        if (row >= totalRows) { row = 0; col++; }
      }
    }
    return result;
  }

  function buildWinePayload(userId: string) {
    const parsedPrice = parseFloat(purchasePrice);
    const validPrice = !Number.isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : null;
    return {
      user_id: userId,
      wine_name: wine.wineName ?? wine.producer,
      producer: wine.producer,
      region: wine.region,
      vintage: wine.vintage,
      // Number of bottles chosen in the Add to Cellar form. When the bottles
      // are later placed into specific rack slots, the placement count
      // refines this; for "save without placing" it stands as the quantity.
      quantity: bottleCount,
      storage_location: null,
      date_received: new Date().toISOString().split('T')[0],
      critic_score: intel.criticScore,
      critic_score_note: intel.criticScoreNote ?? null,
      drinking_window_from: intel.drinkingWindowFrom,
      drinking_window_to: intel.drinkingWindowTo,
      drinking_window_status: intel.drinkingWindowStatus,
      tasting_notes: intel.tastingNotes,
      grape_variety: intel.grapeVariety,
      label_image_path: null,
      user_notes: null,
      is_wishlist: false,
      estimated_value: intel.estimatedValue,
      estimated_value_currency: userCurrency,
      estimated_value_at: intel.estimatedValue != null ? new Date().toISOString() : null,
      // Real Wine-Searcher market price vs Claude estimate — drives the card's
      // value source label. Set by generateWineIntel in the confirm step.
      estimated_value_source: intel.valueSource ?? 'vinster',
      purchase_price: validPrice,
      purchase_price_currency: userCurrency,
      bottle_size_ml: bottleSizeMl,
    };
  }

  async function handleAddToWishList() {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      await addToWishList.mutateAsync({ ...buildWinePayload(session.user.id), is_wishlist: true });
      setAddingToWishList(false);
      // Include the vintage in the confirmation so the user sees the
      // full identity of what just landed ("Château Margaux 2013",
      // not "Château Margaux"). Falls back to whichever pieces are
      // populated when scan-label couldn't pull a vintage.
      const confirmLabel = [wine.producer, wine.wineName, wine.vintage]
        .filter((s) => s && String(s).trim().length > 0)
        .join(' ');
      showAlert({
        title: 'Added to Wish List',
        body: `${confirmLabel || (wine.wineName ?? wine.producer ?? 'This wine')} has been saved to your wish list.`,
        // When the user came in via the wish-list flow they're expecting to
        // land back on the wish list, not the wine card. Route there from OK.
        buttons: isWishlistFlow
          ? [{ text: 'OK', onPress: () => router.replace('/cellar/wishlist') }]
          : undefined,
      });
    } catch (err) {
      // Surface the underlying error rather than the generic message so
      // RLS / FK / schema failures are visible.
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save to wish list', body: detail });
    } finally {
      setSaving(false);
    }
  }

  // Find an existing active cellar row for the same wine identity. Match
  // on producer + wine_name + vintage (case-insensitive). Falls back to a
  // SWAPPED match (producer↔wine_name) so OCR flips on boutique wines like
  // Mullineux Schist still merge into the same entry.
  // Avoids duplicate entries and avoids regenerating wine-intelligence
  // (non-deterministic, can produce slightly different drinking windows).
  const matchingExisting = useMemo(() => {
    if (!wineDetailsConfirmed || !wines) return null;
    const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
    const wantedProducer = norm(wineDetailsConfirmed.producer);
    const wantedName = norm(wineDetailsConfirmed.wineName || wineDetailsConfirmed.producer);
    const wantedVintage = (wineDetailsConfirmed.vintage ?? '').trim();
    const exact = wines.find((w) =>
      norm(w.producer) === wantedProducer &&
      norm(w.wine_name) === wantedName &&
      (w.vintage ?? '').trim() === wantedVintage
    );
    if (exact) return exact;
    // Swapped match — OCR flipped producer and wine name on a previous scan.
    if (wantedProducer && wantedName && wantedProducer !== wantedName) {
      const swapped = wines.find((w) =>
        norm(w.producer) === wantedName &&
        norm(w.wine_name) === wantedProducer &&
        (w.vintage ?? '').trim() === wantedVintage
      );
      if (swapped) return swapped;
    }
    return null;
  }, [wineDetailsConfirmed, wines]);

  // Fuzzy-duplicate check. Catches the case where the user adds a wine
  // by hand using a partial label and the cellar already holds the
  // same bottle under its full, more precise name (e.g. "Pavillon
  // Rouge 2009" entered manually vs an existing "Chateau Margaux
  // Pavillon Rouge 2009" from a scan). Same vintage is required so
  // we don't confuse different years of the same wine.
  //
  // The match runs across the COMBINED producer + wine_name string on
  // both sides, tokenised to ≥3-character alphanumerics. One side's
  // token set must be a subset of the other (i.e. every token in the
  // shorter set appears in the longer set), AND that shorter set must
  // be at least 2 tokens so we don't false-positive on single-word
  // grape names like "Riesling".
  const fuzzyExisting = useMemo(() => {
    if (!wineDetailsConfirmed || !wines) return null;
    if (matchingExisting) return null; // exact / swapped wins
    const wantedVintage = (wineDetailsConfirmed.vintage ?? '').trim();
    if (!wantedVintage) return null;

    function tokenise(s: string): Set<string> {
      return new Set(
        s.toLowerCase()
          .replace(/[^a-z0-9 ]/g, ' ')
          .split(/\s+/)
          .filter((t) => t.length >= 3),
      );
    }
    const wantedCombined = `${wineDetailsConfirmed.producer ?? ''} ${wineDetailsConfirmed.wineName ?? ''}`;
    const wantedTokens = tokenise(wantedCombined);
    if (wantedTokens.size < 2) return null;

    for (const w of wines) {
      if ((w.vintage ?? '').trim() !== wantedVintage) continue;
      const cellarCombined = `${w.producer ?? ''} ${w.wine_name ?? ''}`;
      const cellarTokens = tokenise(cellarCombined);
      if (cellarTokens.size < 2) continue;
      // Subset check in the direction of the smaller set so the
      // shorter (manual) entry counts as a match against the longer
      // (scanned) entry, and vice-versa.
      const [small, big] =
        wantedTokens.size <= cellarTokens.size
          ? [wantedTokens, cellarTokens]
          : [cellarTokens, wantedTokens];
      let allIn = true;
      for (const t of small) {
        if (!big.has(t)) { allIn = false; break; }
      }
      if (allIn) return w;
    }
    return null;
  }, [wineDetailsConfirmed, wines, matchingExisting]);

  // Single place that handles all post-save routing — used by both the new-
  // entry path and the merge-with-existing path. NOTE: don't call
  // labelStore.reset() here. Clearing wineDetailsConfirmed while the
  // addingToCellar Modal is still animating closed causes the modal's body
  // (which references `wine.wineName`) to re-render with a null wine,
  // crashing into the ErrorBoundary as "Something Went Wrong". The store
  // will be naturally replaced on the next label scan.
  // Close every add with a confirmation that names the Cellar List (and the
  // rack/location, where relevant). When the user lands somewhere other than
  // the list (a rack), offer a link across to it.
  function confirmSaved(body: string, includeListLink: boolean) {
    showAlert({
      title: 'Added to your cellar',
      body,
      buttons: includeListLink
        ? [
            { text: 'View in Full Cellar List', onPress: () => router.replace('/cellar/list') },
            { text: 'Done', style: 'cancel' },
          ]
        : [{ text: 'Done', style: 'cancel' }],
    });
  }

  async function performSaveFlow(savedWineId: string, mode: 'new' | 'merge', baseQuantity: number) {
    if (pendingSlot) {
      // Soft warning when the bottle's size doesn't match the slot's
      // expected size. Fires once before placement runs; user can
      // continue or cancel back into the Add modal.
      const mismatch = detectPlacementMismatch(
        bottleSizeMl,
        pendingSlot.row,
        pendingSlot.largeFormatBottleSizeMl,
      );
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
        if (!proceed) {
          setSaving(false);
          return;
        }
      }
      // User came in from a specific empty rack slot. Place the requested
      // number of bottles from that slot — skipping any occupied slots in
      // the path — and set the wine's quantity to match what was placed.
      const requested = Math.max(1, parseInt(placeCount, 10) || 1);
      const allSlots = computeSlots(pendingSlot.row, pendingSlot.col, pendingSlot.rows, pendingSlot.cols, requested, placeOrientation, pendingSlot.largeFormatCols);
      const occupied = new Set(
        pendingRackSlots.filter((s) => s.cellar_wine_id).map((s) => `${s.row_index},${s.col_index}`),
      );
      const freeSlots = allSlots.filter((s) => !occupied.has(`${s.row},${s.col}`));
      // The tapped slot is empty by definition; fall back to it if a race
      // somehow leaves nothing free.
      const placed = freeSlots.length > 0 ? freeSlots : allSlots.slice(0, 1);
      await assignSlots(pendingSlot.rackId, placed, savedWineId);
      const targetQuantity = mode === 'new' ? placed.length : baseQuantity + placed.length;
      if (targetQuantity !== baseQuantity) {
        await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: targetQuantity } });
      }
      qc.invalidateQueries({ queryKey: ['rack-slots', pendingSlot.rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      setPendingSlot(null);
      setAddingToCellar(false);
      // Camera/confirm now use router.replace so the stack is short by the
      // time we land here. A clean router.replace keeps the back-stack tidy.
      router.replace(isLineupFlow ? '/cellar/scan-lineup' : `/cellar/rack/${pendingSlot.rackId}`);
      return;
    }

    // Lineup onboarding: each wine is saved (unplaced) and we return to the
    // lineup list to do the next bottle — destination choice doesn't apply.
    if (isLineupFlow) {
      if (mode === 'merge') {
        await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: baseQuantity + 1 } });
      }
      setAddingToCellar(false);
      router.replace('/cellar/scan-lineup');
      return;
    }

    // ---- Cellar List "Add Wine" flow ----
    const qty = Math.max(1, bottleCount);

    // Bespoke cellar Location: tag the wine to that location and leave it
    // unplaced (locations aren't grid racks — no slots / orientation).
    if (selectedLocationId) {
      await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: mode === 'merge' ? baseQuantity + qty : qty } });
      try { await addWinesToFilter(selectedLocationId, [savedWineId]); } catch { /* tag is best-effort */ }
      qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      setAddingToCellar(false);
      const locName = cellarLocations.find((l) => l.id === selectedLocationId)?.name ?? 'your location';
      router.replace('/cellar/list');
      confirmSaved(`${qty} bottle${qty === 1 ? '' : 's'} added to your Full Cellar List and filed under ${locName}.`, false);
      return;
    }

    // A live rack/fridge: auto-place the bottles from the first free slot in
    // the chosen orientation, then land on the rack.
    if (selectedRackId && selectedRackId !== '__new__') {
      const rack = racks.find((r) => r.id === selectedRackId);
      if (rack) {
        const slots = await getRackSlots(selectedRackId);
        const occupied = new Set(slots.filter((s) => s.cellar_wine_id).map((s) => `${s.row_index},${s.col_index}`));
        let start: { row: number; col: number } | null = null;
        for (let r = 0; r < rack.rows && !start; r++) {
          for (let c = 0; c < rack.cols; c++) {
            if (!occupied.has(`${r},${c}`)) { start = { row: r, col: c }; break; }
          }
        }
        if (start) {
          const candidate = computeSlots(start.row, start.col, rack.rows, rack.cols, qty, placeOrientation, rack.large_format_cols);
          const free = candidate.filter((s) => !occupied.has(`${s.row},${s.col}`));
          const placed = free.length > 0 ? free : [start];
          await assignSlots(selectedRackId, placed, savedWineId);
          const targetQuantity = mode === 'merge' ? baseQuantity + placed.length : placed.length;
          await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: targetQuantity } });
          qc.invalidateQueries({ queryKey: ['rack-slots', selectedRackId] });
          qc.invalidateQueries({ queryKey: ['slot-assignments'] });
          qc.invalidateQueries({ queryKey: ['cellar'] });
          setAddingToCellar(false);
          if (placed.length < qty) {
            showAlert({
              title: 'Placed what fit',
              body: `Only ${placed.length} of ${qty} bottle${qty === 1 ? '' : 's'} fit from the first free slot — the rest weren't placed.`,
              buttons: [{ text: 'OK', onPress: () => router.replace(`/cellar/rack/${selectedRackId}` as any) }],
            });
          } else {
            router.replace(`/cellar/rack/${selectedRackId}` as any);
            confirmSaved(`${placed.length} bottle${placed.length === 1 ? '' : 's'} placed in ${rack.name} — and added to your Full Cellar List.`, true);
          }
          return;
        }
        showAlert({ title: 'Rack full', body: 'There were no free slots, so this wine was saved to your Full Cellar List instead.' });
      }
    }

    // Build a brand-new rack, then place there.
    if (selectedRackId === '__new__') {
      if (mode === 'merge') {
        await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: baseQuantity + qty } });
      }
      setPendingWineId(savedWineId);
      setPendingStorageType('rack');
      setAddingToCellar(false);
      router.replace('/cellar/rack/camera?intro=1');
      return;
    }

    // Cellar List (unplaced) — land on the Full Cellar List, NOT the wine card.
    // Opening the card auto-generates intel; adding should stay quick, with intel
    // generated only when the user deliberately taps into a wine to view it.
    if (mode === 'merge') {
      await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: baseQuantity + qty } });
    }
    setAddingToCellar(false);
    router.replace('/cellar/list');
    confirmSaved(`${qty} bottle${qty === 1 ? '' : 's'} added to your Full Cellar List.`, false);
  }

  async function performNewEntry() {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      const saved = await addWine.mutateAsync(buildWinePayload(session.user.id));
      // Persist the scanned label photo as this wine's framed thumbnail.
      // Best-effort: a photo failure must never block the cellar save.
      const labelUri = useLabelStore.getState().imageUri;
      if (labelUri) {
        try {
          const path = await uploadLabelImage(session.user.id, labelUri, saved.id);
          await updateWine.mutateAsync({ id: saved.id, updates: { label_image_path: path } });
        } catch (photoErr) {
          console.warn('[label-photo] upload failed (non-fatal):', photoErr);
        }
      }
      await performSaveFlow(saved.id, 'new', 1);
    } catch (err) {
      // Surface the underlying error so RLS / FK / schema failures are
      // visible instead of swallowed under a generic message.
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save to cellar', body: detail });
    } finally {
      setSaving(false);
    }
  }

  async function performMerge(target?: { id: string; quantity: number } | null) {
    // Accept an explicit target so the fuzzy-duplicate path can merge
    // into a row that isn't an exact identity hit. Falls back to the
    // exact match for the original entry-point.
    const merge = target ?? matchingExisting;
    if (!merge) return;
    setSaving(true);
    try {
      // Quantity is reconciled inside performSaveFlow — it differs for the
      // place-in-slot path (adds the placed count) vs the non-slot paths.
      await performSaveFlow(merge.id, 'merge', merge.quantity);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save to cellar', body: detail });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveReview() {
    if (!session?.user.id) return;
    // If this wine already has a review, prompt to update / add a dated
    // tasting / create new — same guard the List + manual-add flows use,
    // so scanning or uploading a label for a wine you've reviewed before
    // never silently creates a duplicate review.
    const parsedVintage = parseInt(wine.vintage, 10);
    const validVintage = !Number.isNaN(parsedVintage) ? parsedVintage : null;
    const wineNameValue = wine.wineName ?? wine.producer;
    const existing = findExistingReview(chosenWines, { producer: wine.producer, wineName: wineNameValue, vintage: validVintage });
    if (existing) {
      showAlert({
        title: "You've reviewed this wine before",
        body: `You already have a review for ${wineNameValue}. Update it, add a new dated tasting to it, or start a fresh review?`,
        buttons: [
          { text: 'Update review', onPress: () => { void doSaveReview('update', existing); } },
          { text: 'Add to review', onPress: () => { void doSaveReview('append', existing); } },
          { text: 'Create new', onPress: () => { void doSaveReview('create', null); } },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    await doSaveReview('create', null);
  }

  async function doSaveReview(mode: 'create' | 'update' | 'append', existing: ChosenWine | null) {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      const parsedScore = parseInt(reviewScore, 10);
      const validScore = !Number.isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 100 ? parsedScore : null;
      const parsedPrice = parseFloat(reviewListPrice);
      const validPrice = !Number.isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : null;
      const parsedVintage = parseInt(wine.vintage, 10);
      const validVintage = !Number.isNaN(parsedVintage) ? parsedVintage : null;
      if (mode === 'create' || !existing) {
        await saveManual.mutateAsync({
          wineName: wine.wineName ?? wine.producer,
          producer: wine.producer,
          region: wine.region,
          vintage: validVintage,
          restaurantName: reviewRestaurant,
          city: reviewCity,
          listPrice: validPrice,
          currency: userCurrency,
          tastingNote: reviewNote,
          otherObservations: '',
          userScore: validScore,
          isFavourite: false,
          // The "Review without adding" path on the Cellar add-wine
          // flow isn't a restaurant scan and isn't a cellar wine — it's
          // a standalone review. Mark it 'other' so the Your Wine
          // Reviews Type filter can split it out from the Restaurant
          // bucket. Manual-entry-via-Reviews-tab continues to fall back
          // to the DB default 'restaurant'.
          source: 'other',
        });
      } else {
        const identity = { producer: existing.producer, wineName: existing.wine_name, vintage: existing.vintage };
        if (mode === 'update') {
          await updateChosen.mutateAsync({
            id: existing.id,
            input: { restaurantName: reviewRestaurant, city: reviewCity, tastingNote: reviewNote, otherObservations: existing.other_observations ?? '', userScore: validScore, listPrice: validPrice, isFavourite: existing.is_favourite, ...identity },
          });
        } else {
          // Append a dated tasting onto the existing review, keeping its
          // original where/when/price/score intact.
          const label = todayLabel();
          await updateChosen.mutateAsync({
            id: existing.id,
            input: {
              restaurantName: existing.restaurant_name ?? '',
              city: existing.city ?? '',
              tastingNote: appendDatedEntry(existing.tasting_note, reviewNote, label),
              otherObservations: existing.other_observations ?? '',
              userScore: validScore != null ? validScore : existing.user_score,
              listPrice: existing.menu_price,
              isFavourite: existing.is_favourite,
              ...identity,
            },
          });
        }
      }
      setAddingReview(false);
      if (isReviewsFlow) {
        // Entered from Your Wine Reviews — go straight back there so the
        // user sees the new review land in the list.
        router.replace('/wines/chosen');
      } else {
        showAlert({
          title: 'Review saved',
          body: 'Your tasting note is in Your Wine Reviews.',
          buttons: [
            { text: 'View reviews', onPress: () => router.replace('/wines/chosen') },
            { text: 'Done', style: 'cancel', onPress: () => router.replace('/(tabs)/cellar') },
          ],
        });
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save review', body: detail });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddToCellar() {
    if (!session?.user.id) return;
    if (matchingExisting) {
      // Exact match (producer + wine name + vintage). We never create a
      // second Full Cellar List line for the same bottle — that would
      // fragment the count. Instead we tell the user where their existing
      // bottles are and fold this one into that listing's total.
      const existingQty = matchingExisting.quantity;
      const wineLabel = `${matchingExisting.wine_name}${matchingExisting.vintage ? ` ${matchingExisting.vintage}` : ''}`;
      const where = existingLocationText(matchingExisting.id);
      showAlert({
        title: 'Already in your cellar',
        body: `You have ${existingQty} bottle${existingQty === 1 ? '' : 's'} of ${wineLabel} ${where}. Vinster won't create a duplicate listing — this bottle is added to that total.`,
        buttons: [
          { text: 'Add to my bottles', onPress: () => performMerge() },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    // Near-duplicate caught by fuzzy-token match — same vintage, one
    // wine's name is a token-subset of the other (e.g. "Pavillon
    // Rouge 2009" vs "Chateau Margaux Pavillon Rouge 2009"). Surface
    // the full label of the cellar match so the user can confirm.
    if (fuzzyExisting) {
      const existingQty = fuzzyExisting.quantity;
      const producerPart = fuzzyExisting.producer ? `${fuzzyExisting.producer} ` : '';
      const vintagePart = fuzzyExisting.vintage ? ` ${fuzzyExisting.vintage}` : '';
      const wineLabel = `${producerPart}${fuzzyExisting.wine_name}${vintagePart}`.trim();
      // Capture by value so the alert callbacks can't see a stale
      // fuzzyExisting if the user pauses on the prompt while the
      // cellar query refetches in the background.
      const mergeTarget = { id: fuzzyExisting.id, quantity: existingQty };
      showAlert({
        title: 'Similar wine in your cellar',
        body: `There is a similar wine in your cellar — is this the same as ${wineLabel}? You currently have ${existingQty} bottle${existingQty === 1 ? '' : 's'} of it.`,
        buttons: [
          { text: 'Yes, same wine', onPress: () => performMerge(mergeTarget) },
          { text: 'No, create a new line', onPress: performNewEntry },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    await performNewEntry();
  }

  // Compact Add-to-Cellar field dropdowns.
  const storageLabel = selectedRackId === '__new__'
    ? '+ Create new rack'
    : selectedRackId
      ? (racks.find((r) => r.id === selectedRackId)?.name ?? 'Rack')
      : selectedLocationId
        ? (cellarLocations.find((l) => l.id === selectedLocationId)?.name ?? 'Location')
        : 'Cellar List';
  // Destinations: Cellar List (unplaced), each rack/fridge, each bespoke cellar
  // Location, then "+ Create new rack". Per-rack filters are deliberately not
  // offered here. Picking one kind clears the other so they stay exclusive.
  const fieldOptions: { label: string; value: string | number; onSelect: () => void }[] =
    openField === 'storage'
      ? [
          { label: 'Cellar List', value: 'none', onSelect: () => { setSelectedRackId(null); setSelectedLocationId(null); } },
          ...racks.map((r) => ({ label: `Save to ${r.name}`, value: r.id, onSelect: () => { setSelectedRackId(r.id); setSelectedLocationId(null); } })),
          ...cellarLocations.map((l) => ({ label: `Save to ${l.name}`, value: `loc:${l.id}`, onSelect: () => { setSelectedLocationId(l.id); setSelectedRackId(null); } })),
          { label: '+ Create new rack', value: '__new__', onSelect: () => { setSelectedRackId('__new__'); setSelectedLocationId(null); } },
        ]
      : openField === 'bottle'
        ? [
            ...COMMON_BOTTLE_SIZES.map((s) => ({ label: s.label, value: s.ml, onSelect: () => { setBottleSizeMl(s.ml); setCustomSizeMode(false); } })),
            { label: 'Other…', value: 'other', onSelect: () => setCustomSizeMode(true) },
          ]
        : openField === 'count'
          ? Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: i + 1, onSelect: () => setBottleCount(i + 1) }))
          : [];

  const windowM = windowMeta(intel.drinkingWindowStatus);

  // Dive Deeper works pre-save: the wine-knowledge screen falls back to query
  // params when the path id matches no cellar row (so we pass a placeholder id
  // + the wine fields). It just won't cache, which is fine for a preview.
  function handleDiveDeeper() {
    const q = [
      `producer=${encodeURIComponent(wine.producer ?? '')}`,
      `region=${encodeURIComponent(wine.region ?? '')}`,
      `wineName=${encodeURIComponent(wine.wineName ?? '')}`,
      `vintage=${encodeURIComponent(wine.vintage ?? '')}`,
      `grape=${encodeURIComponent(intel.grapeVariety ?? '')}`,
    ].join('&');
    router.push(`/cellar/wine-knowledge/preview?${q}`);
  }

  // Chef pairing also works pre-save: wineDetailsConfirmed is already in the
  // label store (it's what this card renders), so from=cellar ("bottle known")
  // generates pairings straight away without needing a cellar wine id.
  function handleChefPairing() {
    router.push('/chef/review-requirements?from=cellar');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => router.replace(
          isWishlistFlow ? '/cellar/wishlist'
          : isReviewsFlow ? '/wines/chosen'
          : isLineupFlow ? '/cellar/scan-lineup'
          : '/(tabs)/cellar'
        )}
      >
        <Text accessibilityLabel="Back" style={[styles.backLink, { color: colors.gold, fontSize: 22 }]}>←</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>{isAddFlow ? 'Add to Cellar' : 'Wine Intel'}</Text>

      <View style={styles.header}>
        <Text style={styles.producer}>{wine.producer}</Text>
        {wine.wineName && <Text style={styles.wineName}>{wine.wineName}</Text>}
        <Text style={styles.detail}>{wine.region} · {wine.vintage}</Text>
        {intel.grapeVariety && <Text style={styles.grape}>{intel.grapeVariety}</Text>}
      </View>

      {/* Generate Wine Intel came back empty → prompt to check the name/format. */}
      <NoIntelPrompt
        visible={isIntelOnlyFlow && intelligence != null && intel.criticScore == null && intel.estimatedValue == null && !noIntelDismissed}
        onDismiss={() => setNoIntelDismissed(true)}
        onEdit={() => router.replace('/(tabs)/cellar')}
        editLabel="Check details"
      />

      {/* Intel content — hidden in the Add flow, which carries no intel (it's
          generated later, only from Generate Wine Intel). */}
      {!isAddFlow && (
        <>
          {/* The three key numbers in the compact cellar-card format — tight
              under the grape rather than three tall stacked sections. */}
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Avg Critic Score</Text>
              <Text style={[styles.statValue, intel.criticScore == null && styles.statValueMuted]}>
                {intel.criticScore != null ? intel.criticScore : '—'}
              </Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Estimated Value</Text>
              {intel.estimatedValue != null ? (
                <>
                  <Text style={[styles.statValue, styles.estimatedValueGold]}>{formatCurrency(intel.estimatedValue, userCurrency, { decimals: 0 })}</Text>
                  {intel.valueSource === 'wine-searcher' ? <Text style={styles.statSub}>Wine-Searcher</Text> : null}
                </>
              ) : (
                <Text style={[styles.statValue, styles.statValueMuted]}>No market data</Text>
              )}
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Drinking Window</Text>
              <Text style={[styles.statValue, { color: windowM.color }]}>{windowM.text}</Text>
              {intel.drinkingWindowFrom && intel.drinkingWindowTo ? (
                <Text style={styles.statSub}>{intel.drinkingWindowFrom}–{intel.drinkingWindowTo}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <VinstersNoteHeading />
            <Text style={styles.tastingNotes}>{intel.tastingNotes}</Text>
          </View>
        </>
      )}

      {/* Generate Wine Intel (view-only) gets the two deep-dive actions beneath
          Vinster's note. Estimated value now lives in the compact grid above,
          so it isn't repeated here. */}
      {isIntelOnlyFlow ? (
        <View style={styles.section}>
          <TouchableOpacity style={styles.deepBtn} onPress={handleDiveDeeper} activeOpacity={0.8}>
            <Text style={styles.deepBtnText}>Dive Deeper into this wine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.deepBtn, { marginTop: spacing.sm }]} onPress={handleChefPairing} activeOpacity={0.8}>
            <Text style={styles.deepBtnText}>Chef, find me a recipe for this wine</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!isAddFlow && (
        <View style={styles.section}>
          <View style={styles.communityRow}>
            <Text style={styles.communityLabel}>Community notes on this wine</Text>
            <Text style={styles.communityComingSoon}>coming soon</Text>
          </View>
          <Text style={styles.communityCaption}>See what other Vinster users have noted about this wine.</Text>
        </View>
      )}

      {isWishlistFlow ? (
        // User entered the flow via "Add to Wish List" — they've already
        // decided this wine is going to the wish list. Skip the dual-button
        // decision and offer a single confirm.
        <>
          <View style={styles.singleActionRow}>
            <TouchableOpacity
              style={[styles.singleActionButton, saving && { opacity: 0.6 }]}
              onPress={handleAddToWishList}
              disabled={saving}
            >
              <Text style={styles.singleActionButtonText}>
                {saving ? 'Adding…' : 'Confirm Add to Wish List'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.discardButton} onPress={() => router.replace('/cellar/wishlist')}>
            <Text style={styles.discardText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : isReviewsFlow ? (
        // User entered via Your Wine Reviews "+ Add" → Scan / Upload. The
        // intent is to capture a review, not park inventory — show only
        // the Review action.
        <>
          <View style={styles.singleActionRow}>
            <TouchableOpacity
              style={[styles.singleActionButton, saving && { opacity: 0.6 }]}
              onPress={() => setAddingReview(true)}
              disabled={saving}
            >
              <Text style={styles.singleActionButtonText}>Review this Wine</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.discardButton} onPress={() => router.replace('/wines/chosen')}>
            <Text style={styles.discardText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : isIntelOnlyFlow ? (
        // Cellar tab "Generate Wine Intel" — view-only. No Add to Cellar action
        // (deliberately removed when the add-a-wine routes were simplified);
        // this flow exists purely to surface the intel card.
        <TouchableOpacity style={styles.discardButton} onPress={() => router.replace('/(tabs)/cellar')}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
      ) : (
        <>
          {/* This is the dedicated Add-to-Cellar flow (Cellar → Add Wine),
              a committed action — so only the primary Add to Cellar button
              shows. Wish List and review-only capture have their own entry
              points and aren't offered here. */}
          <View style={styles.actionStack}>
            <TouchableOpacity
              style={styles.primaryAddBtn}
              onPress={() => {
                // Seed the price field with Vinster's estimate so the user
                // adjusts for accuracy rather than entering from scratch.
                if (!purchasePrice && intel.estimatedValue != null) setPurchasePrice(String(intel.estimatedValue));
                setAddingToCellar(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryAddBtnText}>Add to Cellar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.discardButton} onPress={() => router.replace('/(tabs)/cellar')}>
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={addingToWishList} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Wish List</Text>
            <Text style={styles.modalWine}>{wine.wineName ?? wine.producer} {wine.vintage}</Text>

            <Text style={styles.modalLabel}>Bottle size</Text>
            <View style={styles.bottleSizeWrap}>
              <BottleSizePicker value={bottleSizeMl} onChange={setBottleSizeMl} />
            </View>

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleAddToWishList}
              disabled={saving}
            >
              <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save to Wish List'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingToWishList(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={addingReview} transparent animationType="slide" onRequestClose={() => !saving && setAddingReview(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            bottomOffset={24}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Review this Wine</Text>
              <Text style={styles.modalWine}>{wine.wineName ?? wine.producer} {wine.vintage}</Text>
              <Text style={styles.modalHint}>Save your tasting note for this wine without adding it to your cellar or wish list.</Text>

              <Text style={styles.modalLabel}>Tasting note</Text>
              <TextInput
                style={styles.reviewNoteInput}
                value={reviewNote}
                onChangeText={setReviewNote}
                placeholder="What did you think?"
                placeholderTextColor={colors.textSubtle}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.modalLabel}>Restaurant (optional)</Text>
              <TextInput
                style={styles.countInput}
                value={reviewRestaurant}
                onChangeText={setReviewRestaurant}
                placeholder="Where did you drink it?"
                placeholderTextColor={colors.textSubtle}
              />

              <Text style={styles.modalLabel}>City (optional)</Text>
              <TextInput
                style={styles.countInput}
                value={reviewCity}
                onChangeText={setReviewCity}
                placeholder="City"
                placeholderTextColor={colors.textSubtle}
              />

              <Text style={styles.modalLabel}>Your score (0–100, optional)</Text>
              <TextInput
                style={styles.countInput}
                value={reviewScore}
                onChangeText={(t) => setReviewScore(t.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="—"
                placeholderTextColor={colors.textSubtle}
                keyboardType="number-pad"
              />

              <Text style={styles.modalLabel}>List price (optional)</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceCurrency}>{currencySymbol(userCurrency)}</Text>
                <TextInput
                  style={styles.priceInput}
                  value={reviewListPrice}
                  onChangeText={setReviewListPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, saving && styles.buttonDisabled]}
                onPress={handleSaveReview}
                disabled={saving}
              >
                <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save Review'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingReview(false)} disabled={saving}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      <Modal visible={addingToCellar} transparent animationType="slide">
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Cellar</Text>
            <Text style={styles.modalWine}>{wine.wineName ?? wine.producer} {wine.vintage}</Text>

            {/* Came in from a tapped empty slot — ask how many bottles and
                which way they run so the placement maps to real slots. The
                save-without-a-slot paths still create 1 bottle, editable
                later from the wine card. */}
            {pendingSlot && (
              <>
                <Text style={styles.modalLabel}>Number of bottles</Text>
                <TextInput
                  style={styles.countInput}
                  value={placeCount}
                  onChangeText={(t) => setPlaceCount(t.replace(/[^0-9]/g, ''))}
                  placeholder="1"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="number-pad"
                />
                <Text style={styles.modalLabel}>Orientation</Text>
                <Text style={styles.modalHint}>Which way the bottles run from the slot you tapped.</Text>
                <View style={styles.orientationRow}>
                  <TouchableOpacity
                    style={[styles.orientationBtn, placeOrientation === 'Vertical' && styles.orientationBtnActive]}
                    onPress={() => setPlaceOrientation('Vertical')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.orientationBtnText, placeOrientation === 'Vertical' && styles.orientationBtnTextActive]}>Vertical</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.orientationBtn, placeOrientation === 'Horizontal' && styles.orientationBtnActive]}
                    onPress={() => setPlaceOrientation('Horizontal')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.orientationBtnText, placeOrientation === 'Horizontal' && styles.orientationBtnTextActive]}>Horizontal</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalLabel}>Bottle size</Text>
                <View style={styles.bottleSizeWrap}>
                  <BottleSizePicker value={bottleSizeMl} onChange={setBottleSizeMl} />
                </View>
              </>
            )}

            {!pendingSlot && (
              <>
                <Text style={styles.modalLabel}>Where should this live?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storageChipsScroll} contentContainerStyle={styles.storageChips} keyboardShouldPersistTaps="handled">
                  <TouchableOpacity
                    style={[styles.storageChip, !selectedRackId && !selectedLocationId && styles.storageChipActive]}
                    onPress={() => { setSelectedRackId(null); setSelectedLocationId(null); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.storageChipText, !selectedRackId && !selectedLocationId && styles.storageChipTextActive]}>Cellar List</Text>
                  </TouchableOpacity>
                  {racks.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.storageChip, selectedRackId === r.id && styles.storageChipActive]}
                      onPress={() => { setSelectedRackId(r.id); setSelectedLocationId(null); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.storageChipText, selectedRackId === r.id && styles.storageChipTextActive]} numberOfLines={1}>{r.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {cellarLocations.map((l) => (
                    <TouchableOpacity
                      key={l.id}
                      style={[styles.storageChip, selectedLocationId === l.id && styles.storageChipActive]}
                      onPress={() => { setSelectedLocationId(l.id); setSelectedRackId(null); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.storageChipText, selectedLocationId === l.id && styles.storageChipTextActive]} numberOfLines={1}>{l.name}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.storageChip, styles.storageChipNew, selectedRackId === '__new__' && styles.storageChipActive]}
                    onPress={() => { setSelectedRackId('__new__'); setSelectedLocationId(null); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.storageChipText, styles.storageChipNewText, selectedRackId === '__new__' && styles.storageChipTextActive]}>+ New rack</Text>
                  </TouchableOpacity>
                </ScrollView>

                <Text style={styles.modalLabel}>Bottle size</Text>
                <TouchableOpacity style={styles.fieldSelect} onPress={() => setOpenField('bottle')} activeOpacity={0.7}>
                  <Text style={styles.fieldSelectValue} numberOfLines={1}>{customSizeMode ? (customSizeCl ? `${customSizeCl}cl` : 'Other') : bottleSizeLabel(bottleSizeMl)}</Text>
                  <Text style={styles.fieldSelectArrow}>▾</Text>
                </TouchableOpacity>

                {customSizeMode && (
                  <View style={styles.customSizeRow}>
                    <TextInput
                      style={styles.customSizeInput}
                      value={customSizeCl}
                      onChangeText={(t) => {
                        const cleaned = t.replace(/[^0-9]/g, '').slice(0, 4);
                        setCustomSizeCl(cleaned);
                        const cl = parseInt(cleaned, 10);
                        if (!Number.isNaN(cl) && cl > 0) setBottleSizeMl(cl * 10);
                      }}
                      placeholder="e.g. 62"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                    <Text style={styles.customSizeSuffix}>cl</Text>
                  </View>
                )}

                <Text style={styles.modalLabel}>Number of bottles</Text>
                <TouchableOpacity style={styles.fieldSelect} onPress={() => setOpenField('count')} activeOpacity={0.7}>
                  <Text style={styles.fieldSelectValue}>{bottleCount}</Text>
                  <Text style={styles.fieldSelectArrow}>▾</Text>
                </TouchableOpacity>

                {/* Fill direction only matters when placing into a rack/fridge
                    grid — auto-placed from the first free slot. */}
                {selectedRackId && selectedRackId !== '__new__' && (
                  <>
                    <Text style={styles.modalLabel}>Orientation</Text>
                    <Text style={styles.modalHint}>Which way the bottles run from the first free slot.</Text>
                    <View style={styles.orientationRow}>
                      <TouchableOpacity
                        style={[styles.orientationBtn, placeOrientation === 'Vertical' && styles.orientationBtnActive]}
                        onPress={() => setPlaceOrientation('Vertical')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.orientationBtnText, placeOrientation === 'Vertical' && styles.orientationBtnTextActive]}>Vertical</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.orientationBtn, placeOrientation === 'Horizontal' && styles.orientationBtnActive]}
                        onPress={() => setPlaceOrientation('Horizontal')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.orientationBtnText, placeOrientation === 'Horizontal' && styles.orientationBtnTextActive]}>Horizontal</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            )}

            <Text style={styles.modalLabel}>Estimated Purchase Price <Text style={styles.modalLabelHint}>(adjust for accuracy)</Text></Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>{currencySymbol(userCurrency)}</Text>
              <TextInput
                style={styles.priceInput}
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                placeholder="0.00"
                placeholderTextColor={colors.textSubtle}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleAddToCellar}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? 'Saving…'
                  : selectedRackId === '__new__'
                    ? 'Save & Build a New Rack'
                    : selectedRackId
                      ? `Save & Place in ${racks.find((r) => r.id === selectedRackId)?.name ?? 'Rack'}`
                      : selectedLocationId
                        ? `Save to ${cellarLocations.find((l) => l.id === selectedLocationId)?.name ?? 'Location'}`
                        : 'Save to Cellar List'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingToCellar(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={openField !== null} transparent animationType="fade" onRequestClose={() => setOpenField(null)}>
        <TouchableOpacity style={styles.fieldModalOverlay} activeOpacity={1} onPress={() => setOpenField(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.fieldModalSheet} onPress={() => {}}>
            <Text style={styles.fieldModalTitle}>
              {openField === 'storage' ? 'Storage location' : openField === 'bottle' ? 'Bottle size' : 'Number of bottles'}
            </Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {fieldOptions.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={styles.fieldOption}
                  onPress={() => { opt.onSelect(); setOpenField(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fieldOptionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setOpenField(null)} style={styles.fieldModalCancel}>
              <Text style={styles.fieldModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: fonts.bodyRegular, fontSize: 16 },
  linkText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, marginTop: spacing.md },
  backRow: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm, alignSelf: 'flex-start' },
  backLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  pageTitle: { fontSize: 26, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm, marginTop: spacing.xs },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  producer: { fontSize: 22, fontFamily: fonts.bodyBold, color: colors.text },
  wineName: { fontSize: 19, fontFamily: fonts.bodyItalic, color: colors.text, marginTop: 2 },
  detail: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: spacing.xs },
  grape: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, marginTop: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  scoreLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  score: { fontSize: 28, fontFamily: fonts.bodyBold, color: colors.gold },
  // Avg Critic Score header row + per-critic breakdown beneath it.
  criticBlock: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  criticScoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  criticBreakdown: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, columnGap: spacing.md, rowGap: spacing.xs },
  criticChipText: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text },
  criticChipName: { fontFamily: fonts.bodyBold, color: colors.gold },
  criticBreakdownCaption: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 18 },
  badge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  badgeText: { fontSize: 14, fontFamily: fonts.bodySemibold },
  badgeWindow: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  section: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.sm },
  // Compact 2-column stat grid mirroring the cellar wine card.
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  statCell: { width: '50%', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  statLabel: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, lineHeight: 20 },
  statValueMuted: { color: colors.textMuted, fontFamily: fonts.bodyItalic },
  statSub: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  estimatedValueGold: { color: colors.gold },
  // "Dive Deeper" / "Chef, find me a recipe" — gold-outline actions.
  deepBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  deepBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  tastingNotes: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 22 },
  estimateHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  estimateGenerateLink: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.3 },
  estimateValue: { fontSize: 32, fontFamily: fonts.bodyBold, color: colors.gold, letterSpacing: 0.5 },
  estimateRange: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.text, marginTop: 2, textTransform: 'capitalize' },
  estimateUnavailable: { fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  estimateCaption: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 19 },
  communityRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  communityLabel: { fontSize: 16, fontFamily: fonts.bodySemibold, color: 'rgba(212,176,96,0.45)', letterSpacing: 0.3 },
  communityComingSoon: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textTransform: 'lowercase', letterSpacing: 0.5 },
  communityCaption: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 19 },
  actionStack: { marginHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.sm },
  primaryAddBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  primaryAddBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, letterSpacing: 0.3 },
  secondaryAddBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  secondaryAddBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  reviewNoteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 100, lineHeight: 22, marginBottom: spacing.md },
  bottleSizeWrap: { marginBottom: spacing.md },
  // Compact Add-to-Cellar field dropdowns (Storage location | Bottle size,
  // then Number of bottles).
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  fieldCol: { flex: 1 },
  fieldSelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, marginBottom: spacing.md },
  // "Where should this live?" destination chips — a visible one-tap choice.
  storageChipsScroll: { flexGrow: 0, marginBottom: spacing.md },
  storageChips: { flexDirection: 'row', gap: spacing.xs, paddingVertical: 2, paddingRight: spacing.sm },
  storageChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 7, backgroundColor: colors.surface, maxWidth: 190 },
  storageChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.15)' },
  storageChipText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  storageChipTextActive: { color: colors.gold },
  storageChipNew: { borderStyle: 'dashed', borderColor: colors.gold },
  storageChipNewText: { color: colors.gold },
  fieldSelectValue: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  fieldSelectArrow: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold, marginLeft: spacing.sm },
  customSizeRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, backgroundColor: colors.surface, marginTop: -spacing.xs, marginBottom: spacing.md },
  customSizeInput: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.sm },
  customSizeSuffix: { fontSize: 16, fontFamily: fonts.bodyMedium, color: colors.textMuted, marginLeft: spacing.xs },
  fieldModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  fieldModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, width: '100%', maxWidth: 420, padding: spacing.lg },
  fieldModalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  fieldOption: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  fieldOptionText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, textAlign: 'center' },
  fieldModalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.xs },
  fieldModalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  singleActionRow: { marginHorizontal: spacing.xl, marginTop: spacing.xl },
  singleActionButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  singleActionButtonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, textAlign: 'center' },
  discardButton: { margin: spacing.xl, alignItems: 'center', paddingVertical: spacing.sm },
  discardText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.xs },
  modalWine: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.lg },
  modalLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Lower-case bracketed hint inside an uppercase label, e.g. "(adjust for accuracy)".
  modalLabelHint: { fontFamily: fonts.bodyItalic, fontSize: 11, color: colors.textMuted, textTransform: 'none', letterSpacing: 0 },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  cancelButton: { alignItems: 'center', marginTop: spacing.md },
  cancelText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14 },
  modalHint: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: -spacing.xs, marginBottom: spacing.sm, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  priceCurrency: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.textMuted, marginRight: spacing.xs },
  priceInput: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.sm },
  countInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, marginBottom: spacing.md },
  orientationRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  orientationBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  orientationBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  orientationBtnText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  orientationBtnTextActive: { color: colors.gold },
  rackList: { gap: spacing.xs, marginBottom: spacing.md },
  rackOption: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rackOptionActive: { borderColor: colors.gold, backgroundColor: colors.gold + '22' },
  rackOptionText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  rackOptionTextActive: { color: colors.gold },
  rackOptionPrimary: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rackOptionPrimaryActive: { backgroundColor: 'rgba(255,255,255,0.10)' },
  rackOptionPrimaryText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: '#FFFFFF' },
});
