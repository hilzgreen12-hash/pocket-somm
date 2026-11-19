import { parsePriceText } from '../../src/utils/priceInput';
import { useMemo, useState, useEffect, useRef, useCallback, type ComponentProps } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator, Share, BackHandler } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { VinstersNoteHeading, VINSTERS_NOTE_EXPLAINER } from '../../src/components/VinstersNoteHeading';
import { LabelPhotoViewer } from '../../src/components/LabelPhotoViewer';
import { WineIdentityHeader } from '../../src/components/WineIdentityHeader';
import { NaturalWineBadge } from '../../src/components/NaturalWineBadge';
import { SpiritBadge } from '../../src/components/SpiritBadge';
import { SearchProgress } from '../../src/components/SearchProgress';
import { RangeWineNoteSheet } from '../../src/components/RangeWineNoteSheet';
import { NoIntelPrompt } from '../../src/components/NoIntelPrompt';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLabelStore } from '../../src/stores/labelStore';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { useAutoLabel } from '../../src/hooks/useAutoLabel';
import { useLabels } from '../../src/hooks/useLabels';
import { useCellar, useArchive, invalidateCellarViews } from '../../src/hooks/useCellar';
import { useHomeCellarWines } from '../../src/hooks/useHomeCellarWines';
import { DrinkingWindowSheet } from '../../src/components/winecard/DrinkingWindowSheet';
import { findSameCellarWine, sameWineIdentity } from '../../src/utils/wineMatch';
import { newCellarWinePayload, findSameWineLive, purchaseOnMerge, attachLabelIfMissing, type PurchaseInput } from '../../src/services/cellarAdd';
import { marketValuePer75 } from '../../src/services/purchaseEstimate';
import { canEditCellar, VIEW_ONLY_MESSAGE } from '../../src/api/cellarContext';
import { WineCardHero } from '../../src/components/winecard/WineCardHero';
import { wc } from '../../src/components/winecard/wcStyles';
import { PER_75CL, priceForSize } from '../../src/utils/bottleValue';
import { vintageVerdict, tooFewVintagesNote, pickFromCellar, ordinal, type CellarPick } from '../../src/utils/wineCardInsights';
import { visibleEntries } from '../../src/utils/cellarReview';
import { wineQueryName, wineQueryAltName, wineNameKey, normaliseVintage } from '../../src/utils/wineIdentity';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { patchChosenWine } from '../../src/api/chosenWines';
import { findExistingReview } from '../../src/utils/reviewDedup';
import { fetchCellarLocations, addWinesToFilter } from '../../src/api/customFilters';
import { createStorageCase, fetchStorageLocationCases, fetchStorageLocation, fetchStorageLocations } from '../../src/api/storageLocations';
import { addLocationPlacement, fetchPlacementsForWine, type CellarPlacement } from '../../src/api/placements';
import { MicButton } from '../../src/components/MicButton';
import type { CellarWine, WineIntelligence } from '../../src/types/wine';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useRackStore } from '../../src/stores/rackStore';
import { useRacks } from '../../src/hooks/useRacks';
import { getBinCell } from '../../src/api/bins';
import { getRackSlots, getSlotAssignments } from '../../src/api/racks';
import { generateWineIntel, fetchVintageComparison, isWineNotFound, isWineSearcherUnavailable, withCanonicalName, type VintageComparisonRow } from '../../src/services/pricing';
import { generateServingSuggestion, generateRarity, generateVintageVerdict, generateMarketVintage, generatePairingIngredients, type VintageVerdictAI, type PairingIngredient } from '../../src/api/wineExtras';
import { PairingIngredientsCard } from '../../src/components/winecard/PairingIngredientsCard';
import { GenerateRecipesCard, ServingGlance, ComplementaryPairings, CellarPickRow } from '../../src/components/winecard/ServeSections';
import type { WineServingSuggestion } from '../../src/types/wine';
import { peekIntelCurrency, homeCurrency as fetchHomeCurrency } from '../../src/utils/localCurrency';
import { fetchWineCandidates, fetchProducerRange, type WineCandidate, type ProducerRange, type ProducerRangeWine } from '../../src/api/label';
import { updateLabelIntel } from '../../src/api/labels';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { WineIntelShareCard } from '../../src/components/WineIntelShareCard';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../../src/utils/shareCard';
import { formatWineTitle } from '../../src/utils/wineTitle';
import { regionWithCountry } from '../../src/utils/wineOrigin';
import { launchCamera, launchImageLibrary } from '../../src/utils/imagePicker';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import type { WineDetailsComplete } from '../../src/types/wine';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { AddingToCellarLine } from '../../src/components/AddingToCellarLine';
import { formatCurrency, currencySymbol } from '../../src/constants/currency';
import { BottleSizePicker, COMMON_BOTTLE_SIZES, bottleSizeLabel, bottleSizeCl } from '../../src/components/BottleSizePicker';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import { hasRealInsiderNote } from '../../src/constants/insiderNote';

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
  const { context, fresh, backTo, confirm, labelId, confirmed, gen, noRecent } = useLocalSearchParams<{ context?: string; fresh?: string; backTo?: string; via?: string; confirm?: string; labelId?: string; confirmed?: string; gen?: string; noRecent?: string }>();
  // A caller (e.g. a lineup wine) that KNOWS the identity — never disambiguate.
  const identityConfirmed = confirmed === '1';
  // Entered from Scan a Lineup — after saving (placed or not) we return to the
  // lineup list to onboard the next bottle, rather than the rack / wine card.
  const isLineupFlow = context === 'lineup';
  // Wine Intel (scan, upload, search, Recent Scans…): the card itself, with
  // "Save to Your Cellar" among its actions rather than the add flows' big
  // Add to Cellar button.
  const isIntelOnlyFlow = context === 'intel';
  // Entered from Cellar List "Add Wine" — no Wine Intel card. Go straight to the
  // Add form (location / size / quantity / price); intel is generated later,
  // only from the Cellar tab's Generate Wine Intel. Both the
  // plain add and the "add into an Other Home Storage location" flow are
  // no-intel adds — 'add-location' must be included or the guard below dead-ends
  // on "No results available" and the wine never saves (regression from 7e9deec).
  const isAddFlow = context === 'add' || context === 'add-location';
  const { wineDetailsConfirmed, intelligence, imageUri, setImageUri, setWineDetailsConfirmed, setIntelligence } = useLabelStore();
  // When the intel card has no stored/selected photo — e.g. a wine named by Voice
  // Command or typed in manually — fall back to a web-fetched label for the wine's
  // identity so the card always shows a thumbnail (same source the Discover
  // carousels use). Only runs when there's no real photo.
  const autoLabelUri = useAutoLabel(wineDetailsConfirmed?.producer, wineDetailsConfirmed?.wineName, !imageUri);
  const heroUri = imageUri ?? autoLabelUri;
  const { session } = useAuth();
  const { wines, addWine, updateWine } = useCellar();
  // Serve before/after picks come only from bottles kept at home.
  const { wines: homeWines } = useHomeCellarWines();
  const { saveManual, chosenWines } = useChosenWines();
  const { create: createLabel } = useLabels();
  const { setPendingWineId, setPendingStorageType, pendingStorageLocationId, setPendingStorageLocationId, pendingCaseId, setPendingCaseId } = useRackStore();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  // In the intel/search flow the currency may have been switched to a local one
  // abroad (asked once per session upstream) — display in that same currency so
  // the value labels match how the intel was priced. Other flows use the home
  // default.
  const userCurrency = (isIntelOnlyFlow ? peekIntelCurrency(preferences?.defaultCurrency) : null) ?? (preferences?.defaultCurrency ?? 'GBP');
  // A cellar wine is a long-lived home asset, so its stored value must always be
  // in the user's HOME (default) currency — never the transient abroad/session
  // currency that intel may have been priced in (peekIntelCurrency). If the
  // on-card value was priced in a different currency (you were abroad), we don't
  // carry that figure into the cellar; the cellar values it in the home currency
  // on its next valuation pass. This stops a one-off "use local currency?" choice
  // silently turning a GBP cellar into a mixed-currency one.
  const homeCurrency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const cellarValueInHomeCurrency = userCurrency.toUpperCase() === homeCurrency;

  // When Generate Wine Intel comes back empty (no score, no value) it's almost
  // always a misspelt / wrongly-ordered name — prompt the user to check it.
  const [noIntelDismissed, setNoIntelDismissed] = useState(false);
  // Weak-intel disambiguation: when intel comes back empty, auto-fetch the
  // producer's plausible bottlings so the user can confirm the exact wine.
  const [candidates, setCandidates] = useState<WineCandidate[]>([]);
  const [candidatesOpen, setCandidatesOpen] = useState(false);
  // Single-select tick in the "Which wine is this?" list (lineup-style rows).
  const [selectedCand, setSelectedCand] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const candidatesTriedRef = useRef(false);
  // Producer range ("where this wine sits in the lineup") — fetched once on the
  // Wine Intel card. Best-effort: an empty result simply hides the section.
  const [producerRange, setProducerRange] = useState<ProducerRange | null>(null);
  const [producerRangeLoading, setProducerRangeLoading] = useState(false);
  const producerRangeTriedRef = useRef(false);
  // Deduped range: the model sometimes lists the same wine twice — once bare and
  // once with the château in parentheses (e.g. "Saint-Émilion Grand Cru" AND
  // "Saint-Émilion Grand Cru (Château Laforge)"). Collapse by a normalised key,
  // keeping the current wine (isThis) or the shorter, cleaner name.
  const rangeWines = useMemo<ProducerRangeWine[]>(() => {
    const wines = producerRange?.wines ?? [];
    const norm = (s: string) => (s ?? '')
      .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ').trim();
    const byKey = new Map<string, ProducerRangeWine>();
    for (const w of wines) {
      const k = norm(w.wineName);
      if (!k) continue;
      const prev = byKey.get(k);
      if (!prev) { byKey.set(k, w); continue; }
      const keep = w.isThis ? w : prev.isThis ? prev : (w.wineName.length < prev.wineName.length ? w : prev);
      byKey.set(k, { ...keep, isThis: keep.isThis || w.isThis || prev.isThis });
    }
    return Array.from(byKey.values());
  }, [producerRange]);
  // The range wine the user tapped for its "inside line" note.
  const [rangeNoteWine, setRangeNoteWine] = useState<string | null>(null);
  const [rangeNoteTier, setRangeNoteTier] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const intelShareRef = useRef<View>(null);
  const [intelSharePayload, setIntelSharePayload] = useState<ComponentProps<typeof WineIntelShareCard> | null>(null);
  // Confirm-first: when the scan couldn't be verified against Wine-Searcher,
  // camera.tsx routes here with confirm=1 and no intel yet. We show typo/OCR-
  // tolerant matches and only generate the card once the user picks or confirms
  // their read — so Vinster never builds a card for a misread/fictional wine.
  const [awaitingConfirm, setAwaitingConfirm] = useState(confirm === '1' && !identityConfirmed);
  // Skeleton mode: the caller navigated here BEFORE generating intel (gen=1) so the
  // user sees the card shell instantly; we generate on this screen and swirl the
  // score/price/window + Inside Line until it lands. genError surfaces a retry.
  const [genError, setGenError] = useState(false);
  // Re-running a card whose Wine-Searcher lookup couldn't get through.
  const [wsRetrying, setWsRetrying] = useState(false);
  // Vinster couldn't confirm the wine exists (identity gate) — no card is built.
  const [notFound, setNotFound] = useState(false);
  const genStartedRef = useRef(false);
  // True while we're building intel for a skeleton arrival — drives the swirls.
  const intelLoading = isIntelOnlyFlow && gen === '1' && !intelligence && !awaitingConfirm && !genError && !notFound;
  // Generate the intel on THIS screen (skeleton arrival). Records to Recent Scans
  // unless the caller passed noRecent=1 (Manually Search / voice / lineup / reviews).
  const runGenerate = useCallback(async (detailsOverride?: WineDetailsComplete) => {
    const details = detailsOverride ?? wineDetailsConfirmed;
    if (!details) return;
    // Hard gate: never generate intel for a FRESH scan whose vintage couldn't be
    // read — the score, value and drinking window all depend on the year. Open the
    // vintage prompt instead (the user enters the year or NV); its submit calls
    // runGenerate again with a vintage set. Catches any path that reaches
    // generation bypassing the mount-time prompt (e.g. after the confirm step).
    if (fresh === '1' && !(details.vintage ?? '').trim()) {
      vintagePromptedRef.current = true;
      setVintagePromptOpen(true);
      return;
    }
    setGenError(false);
    setNotFound(false);
    try {
      // Generation can start before preferences load (it runs on arrival):
      // use this session's currency choice, else the profile's — never a guess.
      const currency = peekIntelCurrency(preferences?.defaultCurrency)
        ?? (await fetchHomeCurrency(preferences?.defaultCurrency));
      const generated = await generateWineIntel(details, currency);
      // Show the wine's correct spelling when Vinster recognised a garbled name.
      const named = withCanonicalName(details, generated);
      if (named !== details) setWineDetailsConfirmed(named);
      setIntelligence(generated);
      useLastIntelStore.getState().setLast(named, generated, { recordRecent: noRecent !== '1' });
      // Opened from Recent Scans with an empty/missing snapshot → heal the stored
      // label so it's instant (and never shows the prompt) next time.
      if (labelId) { try { await updateLabelIntel(labelId, generated); } catch { /* best-effort */ } }
    } catch (e) {
      if (isWineNotFound(e)) setNotFound(true);
      else setGenError(true);
    }
  }, [wineDetailsConfirmed, preferences?.defaultCurrency, noRecent, setIntelligence, labelId]);
  useEffect(() => {
    if (!isIntelOnlyFlow || gen !== '1' || intelligence || awaitingConfirm || !wineDetailsConfirmed || genStartedRef.current) return;
    // Hold generation on a fresh scan that couldn't read a vintage — the prompt
    // (below) fires first and drives a SINGLE generation for the right year, so
    // the card builds once (fast, streaming) instead of generate-as-NV → regen.
    if (fresh === '1' && !(wineDetailsConfirmed.vintage ?? '').trim()) return;
    genStartedRef.current = true;
    void runGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [confirmOptions, setConfirmOptions] = useState<WineCandidate[]>([]);
  // Single-select index into the confirm list (0 = the wine as read, always the
  // first row). The user taps to select, then presses Confirm.
  const [selectedConfirm, setSelectedConfirm] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmGenerating, setConfirmGenerating] = useState(false);
  // Guests can view the card but saving needs an account: the save buttons open
  // the sign-in prompt instead of silently doing nothing.
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  // The last build from the confirm step failed: show the confirm list (its
  // Confirm button retries) rather than the "Generating" screen forever.
  const [confirmFailed, setConfirmFailed] = useState(false);
  const confirmTriedRef = useRef(false);
  // Once we've auto-skipped a one-option confirm we don't do it again (until the
  // confirm is re-entered fresh). Reset wherever confirmTriedRef is reset.
  const autoConfirmedRef = useRef(false);
  // Once we've written this scan to the cloud `labels` table we don't write again.
  const cloudSavedRef = useRef(false);
  // Tap-to-enlarge the label photo on the confirm screen (pinch/zoom/pan).
  const [zoomOpen, setZoomOpen] = useState(false);
  // Wine Intel tabs (scan / search flow).
  const [intelTab, setIntelTab] = useState<'overview' | 'market' | 'serve'>('overview');
  // Rarity for the Market tab (same server call as the wine card), fetched on open.
  const [intelRarity, setIntelRarity] = useState<{ level: number | null; label: string; text: string } | null>(null);
  const intelRarityTriedRef = useRef(false);
  const { wines: archivedWines } = useArchive();
  // Vinster's Note is collapsible, reduced by default. (Vinster's Map removed for now.)
  const [noteExpanded, setNoteExpanded] = useState(false);
  // Vinster's Vintage & Market Comparison — a third collapsible; its Wine-Searcher
  // per-vintage table is generated on first expand (N live lookups) and cached.
  const [vintagesExpanded, setVintagesExpanded] = useState(false);
  const [vintageRows, setVintageRows] = useState<VintageComparisonRow[] | null>(null);
  const [vintagesLoading, setVintagesLoading] = useState(false);
  const [windowSheetOpen, setWindowSheetOpen] = useState(false);
  // Same fallbacks as the wine card's Market tab: Vinster's written assessment
  // when Wine-Searcher has no per-vintage data, and a clear note when it's down.
  const [intelMarketNote, setIntelMarketNote] = useState<{ vintage?: string; market?: string } | null>(null);
  const [intelMarketUnknown, setIntelMarketUnknown] = useState(false);
  const [vintagesDown, setVintagesDown] = useState(false);
  const vintagesTriedRef = useRef(false);
  // Vinster's Verdict prose for the Market tab's vintage table.
  const [intelVerdict, setIntelVerdict] = useState<VintageVerdictAI | null>(null);
  const [intelVerdictLoading, setIntelVerdictLoading] = useState(false);
  const intelVerdictKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const w = wineDetailsConfirmed;
    if (!w || intelTab !== 'market' || !vintageRows || vintageRows.length < 2) return;
    const key = vintageRows.map((r) => `${r.vintage}-${r.price}`).join('|');
    if (intelVerdictKeyRef.current === key) return;
    intelVerdictKeyRef.current = key;
    const v = vintageVerdict(vintageRows, w.vintage, (n) => formatCurrency(n, userCurrency, { decimals: 0 }));
    const intelNow = intelligence;
    setIntelVerdictLoading(true);
    generateVintageVerdict({ producer: w.producer, wine_name: w.wineName, region: w.region, vintage: w.vintage, grape_variety: w.grape ?? null, style: w.style ?? null } as unknown as Parameters<typeof generateVintageVerdict>[0], {
      rows: vintageRows, currency: userCurrency, qualityRank: v.qualityRank, valueRank: v.valueRank, total: v.total, bestValueVintage: v.bestValueVintage,
      window: intelNow ? { from: intelNow.drinkingWindowFrom, to: intelNow.drinkingWindowTo, status: intelNow.drinkingWindowStatus } : null,
      rarity: intelRarity?.label || null,
    })
      .then((t) => setIntelVerdict(t))
      .catch(() => { intelVerdictKeyRef.current = null; })
      .finally(() => setIntelVerdictLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intelTab, vintageRows]);
  // Serving Suggestions — a fourth collapsible (same gold-bubble layout as the
  // wine card), generated on first expand from the confirmed wine details.
  const [servingExpanded, setServingExpanded] = useState(false);
  const [serving, setServing] = useState<WineServingSuggestion | null>(null);
  const [servingLoading, setServingLoading] = useState(false);
  const servingTriedRef = useRef(false);
  const [intelIngredients, setIntelIngredients] = useState<PairingIngredient[] | null>(null);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  // Everything on the card that's built for ONE wine, cleared whenever the card
  // switches to another (Upload Again, "Not this wine?", Edit Wine, a new
  // vintage) — so the Market and Serve tabs never describe the previous wine.
  function resetPerWineState() {
    producerRangeTriedRef.current = false; setProducerRange(null);
    vintagesTriedRef.current = false; setVintageRows(null); setVintagesExpanded(false);
    intelRarityTriedRef.current = false; setIntelRarity(null);
    servingTriedRef.current = false; setServing(null); setServingExpanded(false);
    setIntelIngredients(null);
    setIntelMarketNote(null); setIntelMarketUnknown(false);
    intelVerdictKeyRef.current = null; setIntelVerdict(null);
  }

  async function toggleServing() {
    const next = !servingExpanded;
    setServingExpanded(next);
    if (next && !serving && !servingTriedRef.current && wineDetailsConfirmed) {
      servingTriedRef.current = true;
      setServingLoading(true);
      try {
        const w = {
          producer: wineDetailsConfirmed.producer,
          wine_name: wineDetailsConfirmed.wineName,
          region: wineDetailsConfirmed.region,
          vintage: wineDetailsConfirmed.vintage,
          grape_variety: wineDetailsConfirmed.grape ?? null,
          style: wineDetailsConfirmed.style ?? null,
        } as unknown as Parameters<typeof generateServingSuggestion>[0];
        // Classic Pairing Ingredients load alongside the serving advice.
        setIngredientsLoading(true);
        void generatePairingIngredients(w).then(setIntelIngredients).catch(() => {}).finally(() => setIngredientsLoading(false));
        setServing(await generateServingSuggestion(w));
      } catch { servingTriedRef.current = false; }
      finally { setServingLoading(false); }
    }
  }
  // Vintage prompt — shown when the scan couldn't read a vintage, so the user
  // enters it (or confirms NV) rather than the intel silently assuming non-vintage.
  const [vintagePromptOpen, setVintagePromptOpen] = useState(false);
  const [vintageInput, setVintageInput] = useState('');
  const vintagePromptedRef = useRef(false);

  useEffect(() => {
    if (candidatesTriedRef.current) return;
    if (!isIntelOnlyFlow || !intelligence || !wineDetailsConfirmed) return;
    // Only offer disambiguation on a FRESH scan (fresh=1) — the label reading may
    // be off, so we let the user pick the right bottling. When VIEWING a saved
    // label's intel (Label Library, restaurants, lineup — no fresh=1), the wine
    // is already confirmed; the "Which wine is this?" prompt must not appear.
    if (identityConfirmed || fresh !== '1' || awaitingConfirm) return;
    // Offer disambiguation whenever Wine-Searcher couldn't verify the wine — the
    // score/value are then Vinster estimates, and the label reading may be off
    // (a missed cuvée). A verified real record means no need to ask — and nor
    // does a lookup that never reached Wine-Searcher: the read may well be right,
    // so the card says Wine-Searcher couldn't be checked instead.
    if (intelligence.verified || intelligence.wsUnavailable) return;
    candidatesTriedRef.current = true;
    (async () => {
      try {
        const list = await fetchWineCandidates({
          producer: wineDetailsConfirmed.producer,
          region: wineDetailsConfirmed.region,
          wineName: wineDetailsConfirmed.wineName,
          vintage: wineDetailsConfirmed.vintage,
        });
        // LAST RESORT only. Build a single list that INCLUDES the wine as read
        // (first) plus any genuinely-different bottlings. If there are no real
        // alternatives (the producer range is just this wine, or empty), don't
        // prompt at all — asking "which wine is this?" with one option that IS
        // the current wine is the loop the user hit. Only open with ≥2 choices.
        const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
        const readAsCand: WineCandidate = {
          wineName: wineDetailsConfirmed.wineName ?? '',
          region: wineDetailsConfirmed.region ?? null,
          style: wineDetailsConfirmed.style ?? null,
        };
        const alternatives = list.filter((c) => norm(c.wineName) !== norm(readAsCand.wineName));
        const combined = [readAsCand, ...alternatives];
        if (combined.length >= 2) { setCandidates(combined); setSelectedCand(0); setCandidatesOpen(true); }
      } catch { /* silent — NoIntelPrompt stays as the fallback */ }
    })();
  }, [intelligence, isIntelOnlyFlow, wineDetailsConfirmed]);

  // Confirm-first: load typo/OCR-tolerant matches for the unverified read so the
  // user can pick the correct wine before Vinster builds the card.
  useEffect(() => {
    if (!awaitingConfirm || confirmTriedRef.current || !wineDetailsConfirmed) return;
    confirmTriedRef.current = true;
    if (!wineDetailsConfirmed.producer?.trim()) return; // no producer to list a range for
    setConfirmLoading(true);
    (async () => {
      try {
        // The producer's full range of wines, so the user picks the right cuvée
        // (wine-candidates lists a producer's distinct bottlings; the narrower
        // wine-search returned only the exact-cuvée match).
        const list = await fetchWineCandidates({
          producer: wineDetailsConfirmed.producer,
          region: wineDetailsConfirmed.region,
          wineName: wineDetailsConfirmed.wineName,
          vintage: wineDetailsConfirmed.vintage,
        });
        setConfirmOptions(list);
        setSelectedConfirm(0);
      } catch { /* silent — the panel falls back to Search Again */ }
      finally { setConfirmLoading(false); }
    })();
  }, [awaitingConfirm, wineDetailsConfirmed]);

  // The confirm list is only worth showing when the producer range surfaces
  // genuine ALTERNATIVES to the wine as read — options Vinster truly can't decide
  // between. When the read is the only option, the "Select Your Wine" step is
  // busywork: skip it and build intel for the read directly. Only on the INITIAL
  // confirm (no card yet) — "Not this wine?" re-searches always keep the list.
  useEffect(() => {
    if (!awaitingConfirm || intelligence) return;            // initial confirm only
    if (!confirmTriedRef.current || confirmLoading) return;  // wait for candidates to settle
    if (confirmGenerating || autoConfirmedRef.current || !wineDetailsConfirmed) return;
    const normName = (s?: string | null) => (s ?? '').trim().toLowerCase();
    const extra = confirmOptions.filter((c) => normName(c.wineName) !== normName(wineDetailsConfirmed.wineName));
    if (extra.length > 0) return;                             // real options → show the list
    autoConfirmedRef.current = true;
    resolveConfirm(wineDetailsConfirmed);
  }, [awaitingConfirm, intelligence, confirmLoading, confirmGenerating, confirmOptions, wineDetailsConfirmed]);

  // Resolve the confirm step: generate the card for the chosen identity (a picked
  // match, or the read as-is) and drop out of the confirm state.
  async function resolveConfirm(identity: WineDetailsComplete) {
    if (confirmGenerating) return;
    // A fresh scan confirmed with no vintage: ask for the year FIRST, then build
    // the card once for it (submitVintage → runGenerate). Building it now meant
    // building it twice — once without a year, then again with one.
    if (fresh === '1' && !(identity.vintage ?? '').trim()) {
      setWineDetailsConfirmed(identity);
      candidatesTriedRef.current = true;
      resetPerWineState();
      setAwaitingConfirm(false);
      vintagePromptedRef.current = true;
      setVintagePromptOpen(true);
      return;
    }
    setConfirmGenerating(true);
    setConfirmFailed(false);
    try {
      const generated = await generateWineIntel(identity, userCurrency);
      const named = withCanonicalName(identity, generated);
      setWineDetailsConfirmed(named);
      setIntelligence(generated);
      useLastIntelStore.getState().setLast(named, generated);
      // The user has already confirmed the wine — don't re-prompt the post-card
      // "which wine is this?" disambiguation for the same result.
      candidatesTriedRef.current = true;
      // A corrected wine (or vintage) — clear everything built for the old one.
      resetPerWineState();
      setAwaitingConfirm(false);
    } catch (e) {
      if (isWineNotFound(e)) { setAwaitingConfirm(false); setNotFound(true); }
      else {
        setConfirmFailed(true);
        showAlert({ title: 'Could not get intel', body: 'Please try again.' });
      }
    } finally {
      setConfirmGenerating(false);
    }
  }
  // "Edit Wine" — seed the manual-edit modal from the current card and open it.
  function openEditWine() {
    if (!wine) return;
    setEditProducer(wine.producer ?? '');
    setEditWineName(wine.wineName ?? '');
    setEditVintage(wine.vintage ?? '');
    setEditRegion(wine.region ?? '');
    setEditStyle(wine.style ?? '');
    setEditGrape((intel.grapeVariety ?? wine.grape) ?? '');
    setEditBottleSizeMl(bottleSizeMl);
    setEditImageUri(null);
    setEditWineOpen(true);
  }
  async function pickEditPhoto(source: 'camera' | 'library') {
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    const res = source === 'camera'
      ? await launchCamera({ mediaTypes: ['images'], quality: 1 })
      : await launchImageLibrary({ mediaTypes: ['images'], quality: 1 });
    if (!res.canceled && res.assets[0]) setEditImageUri(res.assets[0].uri);
  }
  // Save the manual edit → regenerate the intel card for the corrected wine.
  async function saveEditWine() {
    if (savingEdit) return;
    if (!editProducer.trim() && !editWineName.trim()) { showAlert({ title: 'Wine details needed', body: 'Add at least a producer or a wine name.' }); return; }
    // A vintage is a 4-digit year or NV — a blank isn't quietly taken as NV.
    const editedVintage = normaliseVintage(editVintage);
    if (!editedVintage) { showAlert({ title: 'Enter a 4-digit year or NV', body: 'e.g. 2018, or NV for a non-vintage wine.' }); return; }
    setSavingEdit(true);
    try {
      const confirmed: WineDetailsComplete = {
        producer: editProducer.trim(),
        region: editRegion.trim(),
        wineName: editWineName.trim() || null,
        vintage: editedVintage,
        style: editStyle.trim() || null,
        grape: editGrape.trim() || null,
        bottleSizeMl: editBottleSizeMl,
        quantity: wine?.quantity ?? 1,
      };
      const generated = await generateWineIntel(confirmed, userCurrency);
      setWineDetailsConfirmed(confirmed);
      setIntelligence(generated);
      useLastIntelStore.getState().setLast(confirmed, generated);
      setBottleSizeMl(editBottleSizeMl);
      if (editImageUri) setImageUri(editImageUri);
      // The corrected wine gets its own range, vintage table, market and serving.
      resetPerWineState();
      setEditWineOpen(false);
    } catch {
      showAlert({ title: 'Could not get intel', body: 'Please try again.' });
    } finally {
      setSavingEdit(false);
    }
  }

  // Manual correction: open the confirm/search step over an existing card, for
  // when the read looks confident but is simply the wrong wine (e.g. OCR swapped
  // in a different real producer, which verifies and never auto-prompts).
  // Android hardware/gesture back: when the "Not this wine?" search is open over
  // an existing intel card, close the search (return to the card) rather than
  // popping the whole screen back to wherever we came from.
  useEffect(() => {
    if (!(awaitingConfirm && intelligence)) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setAwaitingConfirm(false);
      return true; // handled — don't pop the route
    });
    return () => sub.remove();
  }, [awaitingConfirm, intelligence]);

  // Confirm-step "keep" action: on a manual re-confirm keep the existing card;
  // on the initial (no-card) confirm, generate intel for the read as-is.
  function keepCurrentOrRead() {
    if (intelligence) { setAwaitingConfirm(false); return; }
    if (wineDetailsConfirmed) resolveConfirm(wineDetailsConfirmed);
  }
  // "Search Again" — back to the Scan hub, where the user can re-scan, upload,
  // search the catalogue, or type the wine in by hand. Reset the just-read wine
  // so its fields don't leak into a fresh entry.
  function openSearchAgain() {
    useLabelStore.getState().reset();
    router.dismissTo('/(tabs)/scan' as any);
  }
  // "Cancel" — leave the confirm screen without building a card, back to wherever
  // the user came from (mirrors the back arrow).
  function cancelConfirm() {
    if (intelligence) { setAwaitingConfirm(false); return; }
    router.dismissTo(backTo ? (decodeURIComponent(backTo) as any) : '/(tabs)/scan');
  }
  // Picking a bottling from the producer's range: keep the (confident) producer,
  // vintage, size and grape from the read; take the cuvée / region / style from
  // the chosen candidate.
  function pickConfirmOption(c: WineCandidate) {
    if (!wineDetailsConfirmed) return;
    resolveConfirm({
      ...wineDetailsConfirmed,
      wineName: c.wineName,
      region: c.region ?? wineDetailsConfirmed.region,
      style: c.style ?? wineDetailsConfirmed.style,
    });
  }

  // The scan couldn't read a vintage → prompt for it once, so the intel isn't
  // silently computed as non-vintage. Only fires on a fresh scan whose vintage is
  // blank (a detected 'NV' or a real year is left alone).
  useEffect(() => {
    if (vintagePromptedRef.current) return;
    // Fire immediately after the scan (not after intel lands) so the user confirms
    // the vintage up front and the card then builds ONCE for that year.
    if (!isIntelOnlyFlow || fresh !== '1' || awaitingConfirm) return;
    if ((wineDetailsConfirmed?.vintage ?? '').trim()) return;
    vintagePromptedRef.current = true;
    setVintagePromptOpen(true);
  }, [isIntelOnlyFlow, fresh, awaitingConfirm, wineDetailsConfirmed]);

  // Save the entered vintage → rebuild the card for it (score / value / drinking
  // window all depend on the year). Reuses resolveConfirm's regenerate path.
  async function submitVintage() {
    const raw = vintageInput.trim();
    // Accept "NV" / "Non vintage" typed straight into the box (no separate link).
    if (/^(nv|non[\s-]?vintage)$/i.test(raw)) { confirmNoVintage(); return; }
    if (!/^\d{4}$/.test(raw)) {
      showAlert({ title: 'Enter a 4-digit year or NV', body: 'e.g. 2018, or NV for a non-vintage wine.' });
      return;
    }
    if (!wineDetailsConfirmed) { setVintagePromptOpen(false); return; }
    const updated = { ...wineDetailsConfirmed, vintage: raw };
    setWineDetailsConfirmed(updated);
    setVintagePromptOpen(false);
    // Generation was held for the missing vintage → build the card now, once, for
    // this year (streams like the has-vintage flow). If intel already existed
    // (a re-open), regenerate for the new year instead.
    if (!intelligence && !genStartedRef.current) {
      genStartedRef.current = true;
      void runGenerate(updated);
    } else {
      await resolveConfirm(updated);
    }
  }
  function confirmNoVintage() {
    setVintagePromptOpen(false);
    if (!wineDetailsConfirmed) return;
    const updated = { ...wineDetailsConfirmed, vintage: 'NV' };
    setWineDetailsConfirmed(updated);
    // Same as submitVintage: build once now if generation was held.
    if (!intelligence && !genStartedRef.current) {
      genStartedRef.current = true;
      void runGenerate(updated);
    }
  }

  // "Where this wine sits in the producer's range" — fetched once on the Wine
  // Intel card (the producer is the reliable anchor). Silent on failure. Held
  // off during the confirm step so it runs for the CONFIRMED producer, not a
  // misread one.
  // Restore a producer range that was folded into the saved intel snapshot on a
  // previous view — no re-generation. Marks the fetch as done so it won't fire.
  useEffect(() => {
    const saved = intelligence?.producerRange;
    if (saved && saved.wines?.length && !producerRangeTriedRef.current) {
      producerRangeTriedRef.current = true;
      setProducerRange(saved);
    }
  }, [intelligence]);

  useEffect(() => {
    if (producerRangeTriedRef.current) return;
    // Already saved on the snapshot → the restore effect handles it; don't fetch.
    if (intelligence?.producerRange?.wines?.length) return;
    // WAIT for the base intel to land before folding the range in. Otherwise this
    // can resolve first, merge the range into a NULL intel (→ a snapshot with no
    // score/value), setIntelligence that (a "couldn't generate intel" flash) AND
    // persist that empty snapshot to the label. Deps include intelligence so this
    // re-runs the moment the real result arrives, then folds into it.
    if (!intelligence) return;
    if (!isIntelOnlyFlow || awaitingConfirm || !wineDetailsConfirmed?.producer?.trim()) return;
    producerRangeTriedRef.current = true;
    setProducerRangeLoading(true);
    // The wine this range is for — if the card has moved on to another wine by
    // the time it arrives, it's dropped rather than attached to the new one.
    const forWine = wineNameKey(wineDetailsConfirmed.producer, wineDetailsConfirmed.wineName);
    const stillThisWine = () => {
      const now = useLabelStore.getState().wineDetailsConfirmed;
      return !!now && wineNameKey(now.producer, now.wineName) === forWine;
    };
    (async () => {
      try {
        const r = await fetchProducerRange({
          producer: wineDetailsConfirmed.producer,
          region: wineDetailsConfirmed.region,
          wineName: wineDetailsConfirmed.wineName,
          vintage: wineDetailsConfirmed.vintage,
        });
        if (r.wines.length > 0 && stillThisWine()) {
          setProducerRange(r);
          // Fold the range into the intel snapshot so it's saved with the label
          // and reused next time instead of regenerating. Persist to the label
          // row if we know which one this is (library view passes labelId; a
          // fresh scan sets savedLabelIdRef after createLabel).
          const cur = useLabelStore.getState().intelligence;
          const merged = { ...(cur ?? {} as any), producerRange: r };
          setIntelligence(merged);
          const id = labelId ?? savedLabelIdRef.current;
          if (id) { try { await updateLabelIntel(id, merged); } catch { /* best-effort */ } }
        }
      } catch { /* silent — the section simply doesn't render */ }
      finally { setProducerRangeLoading(false); }
    })();
  }, [isIntelOnlyFlow, awaitingConfirm, wineDetailsConfirmed, intelligence]);

  // Cloud-back each genuine label scan: on a completed fresh Scan-a-Label / Upload
  // intel result, write it to the `labels` table (photo + identity + intel
  // snapshot) so Recent Scans survives reinstalls and shows across devices. Fires
  // once per scan. Same gate as the local Recent list — review/lineup/manual-search
  // flows pass noRecent=1, and history/library opens carry a labelId.
  useEffect(() => {
    if (!isIntelOnlyFlow || noRecent === '1' || fresh !== '1' || labelId) return;
    if (awaitingConfirm || !wineDetailsConfirmed) return;
    // Only store a USABLE snapshot (has a score or a value). Intel briefly passes
    // through an empty state before the full result lands — storing that empty one
    // is what made a re-opened Recent Scan show "unable to generate intel". Wait
    // for real content; the effect re-runs when intelligence updates.
    const usable = !!(intelligence && (intelligence.criticScore != null || intelligence.estimatedValue != null));
    if (!usable) return;
    if (cloudSavedRef.current || !session?.user.id) return;
    cloudSavedRef.current = true;
    (async () => {
      try {
        const created = await createLabel.mutateAsync({
          imageUri: imageUri ?? null,
          producer: wineDetailsConfirmed.producer,
          wineName: wineDetailsConfirmed.wineName,
          vintage: wineDetailsConfirmed.vintage,
          region: wineDetailsConfirmed.region,
          intel: intelligence,
        });
        savedLabelIdRef.current = created.id;
      } catch { cloudSavedRef.current = false; /* allow a later retry */ }
    })();
  }, [isIntelOnlyFlow, noRecent, fresh, labelId, awaitingConfirm, intelligence, wineDetailsConfirmed, session]);

  // Share the wine intel as the branded cream card (identity + label photo + the
  // three headline numbers + Vinster's note + App Store footer), captured from an
  // off-screen WineIntelShareCard. Mirrors the cellar wine-card share so every
  // Vinster share reads as one family. Falls back to plain text on devices
  // without share-sheet support.
  async function handleShare() {
    if (sharing) return;
    const w = wineDetailsConfirmed;
    const header = [w?.producer, w?.wineName, w?.vintage].filter((s) => s && String(s).trim()).join(' ');
    const drinkingWindow = intel.drinkingWindowFrom && intel.drinkingWindowTo
      ? `${intel.drinkingWindowFrom}–${intel.drinkingWindowTo}`
      : null;
    const estimatedValue = intel.estimatedValue != null
      ? formatCurrency(intel.estimatedValue, userCurrency, { decimals: 0 })
      : null;
    setIntelSharePayload({
      producer: w?.producer,
      wineName: w?.wineName,
      vintage: w?.vintage,
      region: w?.region,
      grape: intel.grapeVariety ?? null,
      criticScore: intel.criticScore,
      drinkingWindow,
      estimatedValue,
      tastingNote: intel.tastingNotes,
      imageUri: imageUri ?? null,
    });
    setSharing(true);
    try {
      // One paint to let the off-screen card mount with the new props.
      await new Promise((r) => setTimeout(r, 250));
      if (intelShareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(intelShareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a wine note') });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const scoreLine = intel.criticScore != null ? `\nScore: ${intel.criticScore}/100` : '';
      const valueLine = estimatedValue
        ? `\nValue: ${estimatedValue}${intel.valueSource === 'vinster' ? ' (Vinster estimate)' : ''}`
        : '';
      const windowLine = drinkingWindow ? `\nDrinking window: ${drinkingWindow}` : '';
      const noteLine = intel.tastingNotes?.trim() ? `\n\n"${intel.tastingNotes.trim()}"` : '';
      const message = `${header}${scoreLine}${valueLine}${windowLine}${noteLine}${VINSTER_TEXT_SHARE_FOOTER}`;
      await Share.share({ message, title: header || 'Wine Intel' });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
      setIntelSharePayload(null);
    }
  }

  // Confirm a candidate → update the identity and regenerate intel for it.
  async function pickCandidate(c: WineCandidate) {
    if (!wineDetailsConfirmed || regenerating) return;
    // Never re-prompt for this scan once the user has chosen (prevents the loop).
    candidatesTriedRef.current = true;
    const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
    // Picking the wine as-read (option 1) needs no regeneration — just close.
    if (norm(c.wineName) === norm(wineDetailsConfirmed.wineName)) { setCandidatesOpen(false); return; }
    const updated = {
      ...wineDetailsConfirmed,
      wineName: c.wineName,
      region: c.region ?? wineDetailsConfirmed.region,
      style: c.style ?? wineDetailsConfirmed.style,
    };
    setWineDetailsConfirmed(updated);
    setRegenerating(true);
    try {
      const fresh = await generateWineIntel(updated, userCurrency);
      setIntelligence(fresh);
      setCandidatesOpen(false);
    } catch {
      showAlert({ title: 'Could not update', body: 'Please try again.' });
    } finally {
      setRegenerating(false);
    }
  }

  const [addingToCellar, setAddingToCellar] = useState(false);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  // Bespoke cellar Location (rack_id NULL custom filter) chosen as the
  // destination — mutually exclusive with a rack/fridge selection.
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  // True once the user types in the price field — so an untouched auto-filled
  // estimate is saved as an estimate, and a hand-entered price is not.
  const [purchasePriceUserEdited, setPurchasePriceUserEdited] = useState(false);
  // Pre-populate the bottle size picker from the label scanner. Lazy init
  // reads the labelStore once at mount; the user can still adjust the
  // chip selection afterwards on the Add modals.
  const [bottleSizeMl, setBottleSizeMl] = useState<number>(() =>
    useLabelStore.getState().wineDetailsConfirmed?.bottleSizeMl ?? 750
  );
  const [saving, setSaving] = useState(false);
  // Set from the first tap until the save finishes, so a double tap can't add twice.
  const savingRef = useRef(false);
  // The cellar line the current save has put the bottles into, once it has.
  const savedWineIdRef = useRef<string | null>(null);
  // "Edit Wine" manual-edit modal (top-right on the intel card): free-text edit of
  // the identity + grape + bottle size + photo, then regenerate the intel card.
  const [editWineOpen, setEditWineOpen] = useState(false);
  const [editProducer, setEditProducer] = useState('');
  const [editWineName, setEditWineName] = useState('');
  const [editVintage, setEditVintage] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editStyle, setEditStyle] = useState('');
  const [editGrape, setEditGrape] = useState('');
  const [editBottleSizeMl, setEditBottleSizeMl] = useState(750);
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  // Add-to-Cellar form: how many bottles, which compact field dropdown is
  // open, and the "Other" custom bottle size.
  // Seed from a batched lineup quantity when present (e.g. a "×2" lineup entry
  // pre-fills 2); plain single-bottle scans carry nothing and default to 1.
  const [bottleCount, setBottleCount] = useState(() =>
    Math.max(1, useLabelStore.getState().wineDetailsConfirmed?.quantity ?? 1)
  );
  const [openField, setOpenField] = useState<null | 'bottle' | 'count'>(null);
  // How a wine is packaged in an Other Home Storage location. 'loose' files the
  // wine straight in; 'existing' drops it into an already-created case (picked
  // below); 'new' creates a fresh named case (name + note) for it. Cases no
  // longer carry a "mixed / complete" type — a case is just a named box.
  const [storageKind, setStorageKind] = useState<'loose' | 'existing' | 'new'>('loose');
  const [existingCaseId, setExistingCaseId] = useState<string | null>(null);
  const [caseName, setCaseName] = useState('');
  const [caseNote, setCaseNote] = useState('');
  const [customSizeMode, setCustomSizeMode] = useState(false);
  const [customSizeCl, setCustomSizeCl] = useState('');

  // Bespoke cellar-wide Locations (rack_id NULL) — offered as destinations in
  // the Add flow alongside Cellar List and the racks/fridges. Per-rack filters
  // are deliberately excluded.
  const { data: cellarLocations = [] } = useQuery({
    queryKey: ['cellar-locations', session?.user.id],
    queryFn: () => fetchCellarLocations(session!.user.id),
    enabled: !!session?.user.id,
  });

  // Existing cases in the target location, offered by the "Add to Existing Case"
  // picker — so a user can drop a wine into a case they've already made (e.g. add
  // another bottle to "Meyney Case"). Cases persist until explicitly deleted.
  const { data: locationCases = [] } = useQuery({
    queryKey: ['storage-location-cases', pendingStorageLocationId],
    queryFn: () => fetchStorageLocationCases(pendingStorageLocationId!),
    enabled: !!pendingStorageLocationId && context === 'add-location',
  });
  // Name of the alt cellar we're adding into, for the "Add to {location}" title.
  const { data: pendingLocation } = useQuery({
    queryKey: ['storage-location', pendingStorageLocationId],
    queryFn: () => fetchStorageLocation(pendingStorageLocationId!),
    enabled: !!pendingStorageLocationId && context === 'add-location',
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

  // The no-intel add flows have no card value, so look up the 75cl market price
  // here (Wine-Searcher, else Vinster's estimate). It pre-fills the purchase
  // price and is kept as the saved wine's value, so it counts towards Total
  // Estimated Current Value. Runs once; a typed price is left untouched.
  const [prefetchedValue, setPrefetchedValue] = useState<{ value: number; source: string } | null>(null);
  const pricePrefetchedRef = useRef(false);
  useEffect(() => {
    const w = wineDetailsConfirmed;
    if (!isAddFlow || pricePrefetchedRef.current || !w) return;
    pricePrefetchedRef.current = true;
    marketValuePer75({ producer: w.producer, wine_name: w.wineName || w.producer, region: w.region, vintage: w.vintage, grape_variety: w.grape ?? null }, userCurrency, 'full')
      .then((m) => { if (m) setPrefetchedValue({ value: m.value, source: m.source }); })
      .catch(() => { /* leave the price blank */ });
  }, [isAddFlow, wineDetailsConfirmed, userCurrency]);

  // The Add form's price starts at Vinster's estimate so the user adjusts it
  // rather than starting from scratch. The estimate is a 75cl price, so it's
  // scaled to the bottle size chosen on the form (a magnum starts at two
  // bottles' worth), and follows the size until the user types their own.
  const per75Estimate = intelligence?.estimatedValue ?? prefetchedValue?.value ?? null;
  useEffect(() => {
    if (per75Estimate != null && !purchasePriceUserEdited) setPurchasePrice(String(priceForSize(per75Estimate, bottleSizeMl)));
  }, [per75Estimate, bottleSizeMl, purchasePriceUserEdited]);

  // Add flow has no intel card — drop the user straight onto the Add form.
  useEffect(() => {
    if (isAddFlow) setAddingToCellar(true);
  }, [isAddFlow]);

  // The Recent Scans (`labels`) row written for this scan, once it exists — so
  // a producer range fetched afterwards is saved onto it too.
  const savedLabelIdRef = useRef<string | null>(null);

  // The cellar line this wine already has, for the card's "already in your
  // cellar" lines (any bottle size; the Add form's duplicate check matches the
  // chosen size itself). MUST run before the early returns below, or the hook
  // count changes between renders.
  const ownedMatch = useMemo(() => {
    if (!wineDetailsConfirmed) return null;
    const w = wineDetailsConfirmed;
    return findSameCellarWine(wines, { producer: w.producer, wineName: w.wineName || w.producer, region: w.region, vintage: w.vintage }) ?? null;
  }, [wineDetailsConfirmed, wines]);

  // The matching wine's real bottle distribution, so the "already in your cellar"
  // notice can name the exact location(s) its existing bottles sit in.
  const { data: matchPlacements = [] } = useQuery({
    queryKey: ['placements', ownedMatch?.id],
    queryFn: () => fetchPlacementsForWine(ownedMatch!.id),
    enabled: !!ownedMatch?.id,
  });
  // All alt cellars (Other Home Storage) — to resolve a 'location' placement's
  // storage_location_id to its name (cellarLocations are bespoke filters, not these).
  const { data: allStorageLocations = [] } = useQuery({
    queryKey: ['storage-locations', session?.user.id],
    queryFn: () => fetchStorageLocations(session!.user.id),
    enabled: !!session?.user.id,
  });

  // "in {Location}", "across {A} and {B}", or "in your Full Cellar List" — where
  // a cellar line's bottles already live (racks, alt cellars, bins).
  function existingWhereText(wineId: string, placements: CellarPlacement[]): string {
    const names: string[] = [];
    for (const p of placements) {
      if (p.kind === 'rack') { const n = racks.find((r) => r.id === p.rack_id)?.name; if (n) names.push(n); }
      else if (p.kind === 'location') { const n = allStorageLocations.find((l) => l.id === p.storage_location_id)?.name; if (n) names.push(n); }
      else if (p.kind === 'bin') names.push('a wine bin');
    }
    const uniq = Array.from(new Set(names));
    if (uniq.length === 0) {
      // No placements resolved — fall back to rack slots, else the Cellar List.
      const rackText = existingLocationText(wineId);
      return rackText.startsWith('in ') || rackText.startsWith('across ') ? rackText : 'in your Full Cellar List';
    }
    if (uniq.length === 1) return `in ${uniq[0]}`;
    return `across ${uniq.slice(0, -1).join(', ')} and ${uniq[uniq.length - 1]}`;
  }

  // The Add flow legitimately has no intel; the confirm-first step deliberately
  // has none yet; a skeleton arrival (intelLoading) is generating and falls
  // through to the card shell; every other flow needs intel.
  if (notFound && !intelligence) {
    const asked = [wineDetailsConfirmed?.producer, wineDetailsConfirmed?.wineName, wineDetailsConfirmed?.vintage].filter(Boolean).join(' ');
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{asked ? `Vinster couldn't find ${asked}.` : "Vinster couldn't find this wine."}</Text>
        <Text style={styles.errorText}>Check the name and try again.</Text>
        <TouchableOpacity onPress={openSearchAgain}>
          <Text style={styles.linkText}>Search again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!wineDetailsConfirmed || (!intelligence && !isAddFlow && !awaitingConfirm && !intelLoading)) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{genError ? "Vinster couldn't generate this wine's intel just now." : 'No results available.'}</Text>
        {genError ? (
          <TouchableOpacity onPress={() => { void runGenerate(); }}>
            <Text style={styles.linkText}>Try again</Text>
          </TouchableOpacity>
        ) : (
          // Back to the camera in the SAME flow this screen was opened for (Wine
          // Intel, cellar add…) — a bare /label/camera dropped into the cellar flow.
          <TouchableOpacity onPress={() => router.replace(`/label/camera${context ? `?context=${context}` : ''}` as any)}>
            <Text style={styles.linkText}>Scan a label</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const wine = wineDetailsConfirmed;
  const intel = intelligence ?? EMPTY_INTEL;

  // Confirm screen: shown either when a scan couldn't be verified (no card yet),
  // or when the user taps "Not this wine?" to correct a confident misread over an
  // existing card. The user picks the correct wine (typo/OCR-corrected) or keeps
  // what's there; picking rebuilds the card, keeping leaves it untouched.
  if (awaitingConfirm) {
    // The confirm list always leads with the wine exactly as read (index 0), then
    // the producer's other plausible bottlings (deduped against the read). The
    // user selects one and presses Confirm — no wine name is shown as a title.
    const normName = (s?: string | null) => (s ?? '').trim().toLowerCase();
    const confirmExtraOptions = confirmOptions.filter((c) => normName(c.wineName) !== normName(wine.wineName));
    const confirmDisplayOptions: WineCandidate[] = [
      { wineName: wine.wineName ?? '', region: wine.region ?? null, style: null },
      ...confirmExtraOptions,
    ];
    // The read is unambiguous (no alternative bottlings) — the auto-skip effect is
    // about to build intel directly, so show the building loader instead of a
    // pointless one-row list.
    const willAutoSkip = !intelligence && !confirmLoading && !confirmFailed && confirmExtraOptions.length === 0;
    // Generating Wine Intel — a dedicated full-screen loader: header, a larger
    // label thumbnail, then the Vinster % counter (no rotating line / blurb).
    if (confirmGenerating || willAutoSkip) {
      const genUri = imageUri ?? heroUri;
      return (
        <View style={styles.genContainer}>
          <TouchableOpacity
            style={styles.backRow}
            onPress={() => {
              if (intelligence) setAwaitingConfirm(false);
              else router.dismissTo(backTo ? (decodeURIComponent(backTo) as any) : '/(tabs)/scan');
            }}
          >
            <Text accessibilityLabel="Back" style={[styles.backLink, { color: colors.gold, fontSize: 22 }]}>←</Text>
          </TouchableOpacity>
          <SearchProgress
            header="Generating Wine Intel"
            thumbnail={genUri ? <Image source={{ uri: genUri }} style={styles.genThumb} resizeMode="cover" /> : null}
            hideRotatingTitle
            title=""
            subtitle="Vinster needs a few more seconds for your result"
          />
        </View>
      );
    }
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => {
            // Reached here via "Not this wine?" FROM an existing intel card →
            // return to that card (close the search), don't exit the whole flow.
            // Only leave to backTo on the initial confirm (no card yet).
            if (intelligence) setAwaitingConfirm(false);
            else router.dismissTo(backTo ? (decodeURIComponent(backTo) as any) : '/(tabs)/scan');
          }}
        >
          <Text accessibilityLabel="Back" style={[styles.backLink, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>

        {/* Thumbnail only — no wine-name title. The user checks the label photo
            against the options below and picks the right one. */}
        {imageUri ? (
          <View style={styles.confirmThumbRow}>
            <TouchableOpacity onPress={() => setZoomOpen(true)} activeOpacity={0.85} style={styles.heroFrame}>
              <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.section}>
          {confirmGenerating || willAutoSkip ? (
            <View style={styles.confirmLoading}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.confirmLoadingText}>Building your wine intel…</Text>
            </View>
          ) : (
            <>
              <Text style={styles.confirmTitle}>Select Your Wine From the List</Text>
              {confirmLoading ? (
                <View style={styles.confirmLoading}>
                  <ActivityIndicator color={colors.gold} />
                  <Text style={styles.confirmLoadingText}>Finding close matches…</Text>
                </View>
              ) : (
                confirmDisplayOptions.map((r, i) => {
                  const selected = selectedConfirm === i;
                  return (
                    <TouchableOpacity
                      key={`${r.wineName}-${i}`}
                      style={[styles.confirmRow, selected && styles.confirmRowSelected]}
                      onPress={() => setSelectedConfirm(i)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.confirmRowName, selected && styles.confirmRowNameSelected]} numberOfLines={2}>
                        {formatWineTitle({ producer: wine.producer, wineName: r.wineName, region: r.region, vintage: wine.vintage })}
                      </Text>
                      {r.style ? <Text style={styles.confirmRowMeta}>{r.style}</Text> : null}
                    </TouchableOpacity>
                  );
                })
              )}

              {/* Confirm the selected wine · Search Again (scan/upload/search/
                  manual) · Cancel — regular-size buttons. */}
              {!confirmLoading ? (
                <View style={styles.confirmActions}>
                  <TouchableOpacity
                    style={styles.confirmActionBtn}
                    onPress={() => {
                      if (selectedConfirm === 0) { keepCurrentOrRead(); return; }
                      const c = confirmExtraOptions[selectedConfirm - 1];
                      if (c) pickConfirmOption(c);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.confirmActionText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmActionBtn} onPress={openSearchAgain} activeOpacity={0.85}>
                    <Text style={styles.confirmActionText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Search Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmActionGhost} onPress={cancelConfirm} activeOpacity={0.7}>
                    <Text style={styles.confirmActionGhostText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </>
          )}
        </View>

        <LabelPhotoViewer visible={zoomOpen} uri={imageUri} onClose={() => setZoomOpen(false)} />

      </ScrollView>
    );
  }

  // The price on the Add form. One the user never touched is the auto-estimate,
  // flagged so they can review it later on the Cellar Value screen.
  function formPurchase(): PurchaseInput {
    const parsed = parsePriceText(purchasePrice);
    return { price: parsed > 0 ? parsed : null, currency: userCurrency, estimated: !purchasePriceUserEdited };
  }

  // The cellar row for this add: the wine as confirmed, the form's size, count
  // and price, plus whatever the intel card already knows.
  function buildWinePayload(userId: string) {
    const marketValue = !cellarValueInHomeCurrency ? null
      : intel.estimatedValue != null ? { per75: intel.estimatedValue, currency: homeCurrency, source: intel.valueSource ?? 'vinster' }
      : prefetchedValue ? { per75: prefetchedValue.value, currency: homeCurrency, source: prefetchedValue.source }
      : null;
    return {
      ...newCellarWinePayload({
        userId,
        // The grape the user confirmed wins; the intel grape only fills a gap.
        wine: { ...wine, grape: (wine.grape ?? '').trim() || intel.grapeVariety || null },
        quantity: bottleCount,
        bottleSizeMl,
        purchase: formPurchase(),
        marketValue,
      }),
      critic_score: intel.criticScore,
      critic_score_note: intel.criticScoreNote ?? null,
      drinking_window_from: intel.drinkingWindowFrom,
      drinking_window_to: intel.drinkingWindowTo,
      drinking_window_status: intel.drinkingWindowStatus,
      // Saved so the cellar card shows the Spirit badge / "NA" window and the
      // wine is kept out of maturity surfacing.
      is_spirit: intel.isSpirit ?? false,
      tasting_notes: intel.tastingNotes,
      // The Wine-Searcher offer spread and exact-vintage vs all-vintage scope
      // behind the card's value (full intel only, home currency only).
      estimated_value_low: marketValue ? (intel.estimatedValueLow ?? null) : null,
      estimated_value_high: marketValue ? (intel.estimatedValueHigh ?? null) : null,
      estimated_value_scope: marketValue && intel.estimatedValue != null ? (intel.priceScope ?? null) : null,
      // Canonical identity anchor when Wine-Searcher matched this wine.
      ws_wine_id: intel.wsWineId ?? null,
      ws_wine_name: intel.wsWineName ?? null,
    };
  }

  // Back to the Full Cellar List (the one this add started from, if it's in the
  // stack) with its brief "added" toast.
  function goToCellarList() {
    router.dismissTo(`/cellar/list?added=${Date.now()}` as any);
  }

  // Files the bottles where the Add form says, once the wine is in the cellar:
  // a new line already holds them, a merge adds them to the existing count.
  // NOTE: don't call labelStore.reset() here — clearing wineDetailsConfirmed
  // while the Add modal is still animating closed re-renders its body with a
  // null wine and crashes into the ErrorBoundary.
  async function performSaveFlow(savedWineId: string, mode: 'new' | 'merge', baseQuantity: number, mergeUpdates: Partial<CellarWine> = {}) {
    const qty = Math.max(1, bottleCount);
    if (mode === 'merge') {
      await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: baseQuantity + qty, ...mergeUpdates } });
    }
    savedWineIdRef.current = savedWineId;

    // Home storage location: the label flow was entered from a location's "add
    // a wine" button (context 'add-location' — the gate makes a stale pending id
    // harmless on any other flow). File the bottles in and return to it.
    if (pendingStorageLocationId && context === 'add-location') {
      // Resolve/create the case — the grouping lives on the placement, not the
      // wine. 'existing' files into the picked case; 'new' creates a fresh named
      // case. Non-fatal: a failure just files the bottles loose.
      let placementCaseId: string | null = pendingCaseId ?? null;
      try {
        if (!placementCaseId && session?.user.id) {
          if (storageKind === 'existing' && existingCaseId) {
            placementCaseId = existingCaseId;
          } else if (storageKind === 'new' && caseName.trim()) {
            placementCaseId = (await createStorageCase(session.user.id, {
              storageLocationId: pendingStorageLocationId, name: caseName, note: caseNote,
            })).id;
          }
        }
      } catch { placementCaseId = pendingCaseId ?? null; }
      // A wine can live in a rack AND an alt cellar, so the bottles are recorded
      // as a location placement (merging into a matching one) — nothing it
      // already has elsewhere is moved or dropped.
      await addLocationPlacement(savedWineId, pendingStorageLocationId, placementCaseId, qty);
      qc.invalidateQueries({ queryKey: ['storage-location-cases', pendingStorageLocationId] });
      const dest = pendingStorageLocationId;
      setPendingStorageLocationId(null);
      setPendingCaseId(null);
      setAddingToCellar(false);
      router.replace(`/cellar/storage-location/${dest}` as any);
      return;
    }

    // Lineup onboarding: each wine is saved (unplaced) and we return to the
    // lineup list to do the next bottle — destination choice doesn't apply.
    if (isLineupFlow) {
      setAddingToCellar(false);
      router.replace('/cellar/scan-lineup');
      return;
    }

    // Bespoke cellar Location: tag the wine to that location and leave it
    // unplaced (locations aren't grid racks — no slots).
    if (selectedLocationId) {
      try { await addWinesToFilter(selectedLocationId, [savedWineId]); } catch { /* tag is best-effort */ }
      qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
      setAddingToCellar(false);
      goToCellarList();
      return;
    }

    // A live rack/fridge was chosen. Don't auto-place from the first free slot —
    // open the rack in select-slots mode so the user taps the exact slots they
    // want and presses Confirm (the same flow used for placing unplaced bottles).
    if (selectedRackId && selectedRackId !== '__new__') {
      const rack = racks.find((r) => r.id === selectedRackId);
      // Rough free-slot check just to catch a genuinely full rack (large-format
      // rows may vary the exact count, but 0 free is unambiguous).
      const slots = rack ? await getRackSlots(selectedRackId) : [];
      const occupiedCount = slots.filter((s) => s.cellar_wine_id).length;
      const freeApprox = rack ? rack.rows * rack.cols - occupiedCount : 0;
      setAddingToCellar(false);
      if (!rack || freeApprox <= 0) {
        showAlert({
          title: 'Rack full',
          body: 'There were no free slots, so this wine was saved to your Full Cellar List. You can place it later.',
          buttons: [{ text: 'OK', onPress: goToCellarList }],
        });
        return;
      }
      router.replace(`/cellar/rack/${selectedRackId}?placeWine=${savedWineId}&placeLimit=${qty}` as any);
      return;
    }

    // "+ New Location" — the wine is saved to the cellar; ask what kind of
    // storage location to set up, then route to its builder. Rack/Fridge carry
    // the wine as pending so the new grid prompts "tap a slot to place it";
    // Bin / Other Location leave it in the cellar to file afterwards.
    if (selectedRackId === '__new__') {
      setAddingToCellar(false);
      showAlert({
        title: 'What Kind of Storage Location?',
        body: 'Your wine is saved to the cellar — set up where it lives.',
        buttons: [
          { text: 'Rack', onPress: () => { setPendingWineId(savedWineId); setPendingStorageType('rack'); router.replace('/cellar/rack/new'); } },
          { text: 'Fridge', onPress: () => { setPendingWineId(savedWineId); setPendingStorageType('fridge'); router.replace('/cellar/rack/new'); } },
          { text: 'Bin (diamonds)', onPress: () => router.replace('/cellar/bin/new' as any) },
          { text: 'Alt Cellar', onPress: () => router.replace('/cellar/storage-location/new' as any) },
          { text: 'Cancel', style: 'cancel', onPress: goToCellarList },
        ],
      });
      return;
    }

    // Cellar List (unplaced) — land on the Full Cellar List, NOT the wine card.
    // Opening the card auto-generates intel; adding should stay quick, with intel
    // generated only when the user deliberately taps into a wine to view it.
    setAddingToCellar(false);
    goToCellarList();
  }

  // Runs one save at a time: a second tap while one is in flight is ignored.
  // Once the bottles are in the cellar (savedWineIdRef) a later failure says so
  // and leaves the form, so a retry can't add them twice.
  async function runSave(save: () => Promise<void>) {
    if (savingRef.current) return;
    savingRef.current = true;
    savedWineIdRef.current = null;
    setSaving(true);
    try {
      await save();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      if (savedWineIdRef.current) {
        setAddingToCellar(false);
        showAlert({
          title: "Saved to your cellar, but couldn't place it",
          body: `You'll find it in your Full Cellar List — place it from there.\n\n${detail}`,
          buttons: [{ text: 'OK', onPress: goToCellarList }],
        });
      } else {
        // Surface the underlying error so RLS / FK / schema failures are
        // visible instead of swallowed under a generic message.
        showAlert({ title: 'Could not save to cellar', body: detail });
      }
    } finally {
      if (savedWineIdRef.current) invalidateCellarViews(qc);
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function performNewEntry(userId: string, payload: ReturnType<typeof buildWinePayload>) {
    const labelUri = useLabelStore.getState().imageUri;
    const saved = await addWine.mutateAsync({ ...payload, hasOwnPhoto: !!labelUri });
    savedWineIdRef.current = saved.id;
    // The scanned label becomes the wine's framed thumbnail.
    await attachLabelIfMissing(userId, saved, labelUri);
    await performSaveFlow(saved.id, 'new', saved.quantity);
  }

  // Add these bottles to a line the user already has: its count grows, and it
  // takes the price the user typed (when it has none of their own) and the
  // scanned label (when it has no photo).
  async function performMerge(userId: string, existing: CellarWine) {
    await attachLabelIfMissing(userId, existing, useLabelStore.getState().imageUri);
    await performSaveFlow(existing.id, 'merge', existing.quantity ?? 0, purchaseOnMerge(existing, formPurchase()));
  }

  // "Add to Existing Case" — a follow-up popup listing the cases already in this
  // location; picking one files the wine into it. No cases yet → nudge to create.
  function openExistingCasePicker() {
    if (!locationCases.length) {
      showAlert({ title: 'No cases yet', body: 'Create a new case first, then you can add wines to it.' });
      return;
    }
    showAlert({
      title: 'Add to which case?',
      buttons: [
        ...locationCases.map((c) => ({ text: c.name, onPress: () => { setStorageKind('existing'); setExistingCaseId(c.id); setCaseName(''); setCaseNote(''); } })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  function handleAddToCellar() {
    const userId = session?.user.id;
    if (!userId) { setSignInPromptVisible(true); return; }
    if (!canEditCellar()) {
      showAlert({ title: 'View-only cellar', body: VIEW_ONLY_MESSAGE });
      return;
    }
    // A new case must be named — Vinster no longer silently saves it as "Case".
    // Skipped when filing into an already-chosen case (pendingCaseId) or an
    // existing case, both of which carry their own name.
    if (context === 'add-location' && storageKind === 'new' && !pendingCaseId && !caseName.trim()) {
      showAlert({ title: 'Case name needed', body: 'Give this case a name before adding — e.g. "Mixed Burgundy".' });
      return;
    }
    void runSave(async () => {
      const payload = buildWinePayload(userId);
      // Already own this wine, vintage and bottle size? The new bottles join
      // that line (one wine, one Full Cellar List line). A different size is
      // always a line of its own.
      const existing = await findSameWineLive(userId, wines, payload);
      if (!existing) { await performNewEntry(userId, payload); return; }
      const have = existing.quantity ?? 0;
      const sameName = wineNameKey(existing.producer, existing.wine_name) === wineNameKey(payload.producer, payload.wine_name);
      if (sameName) {
        const placements = await fetchPlacementsForWine(existing.id).catch(() => []);
        const where = existingWhereText(existing.id, placements);
        showAlert({
          title: 'Already in your cellar',
          body: `You have ${have}x${bottleSizeCl(existing.bottle_size_ml ?? 750)}cl ${where}. Vinster will add these bottles to your existing bottle count in your Full Cellar List — the location will show only the bottles kept there.`,
          buttons: [
            { text: 'Add to my bottles', onPress: () => void runSave(() => performMerge(userId, existing)) },
            { text: 'Cancel', style: 'cancel' },
          ],
        });
        return;
      }
      // Named differently (e.g. "Pavillon Rouge 2009" vs "Château Margaux
      // Pavillon Rouge 2009"): show the cellar's name for it and let the user say.
      const label = [existing.producer, existing.wine_name, existing.vintage].filter(Boolean).join(' ');
      showAlert({
        title: 'Similar wine in your cellar',
        body: `There is a similar wine in your cellar — is this the same as ${label}? You currently have ${have} bottle${have === 1 ? '' : 's'} of it.`,
        buttons: [
          { text: 'Yes, same wine', onPress: () => void runSave(() => performMerge(userId, existing)) },
          { text: 'No, create a new line', onPress: () => void runSave(() => performNewEntry(userId, payload)) },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
    });
  }

  // Options for the Add form's Bottle size / Number of bottles dropdowns.
  const fieldOptions: { label: string; value: string | number; onSelect: () => void }[] =
    openField === 'bottle'
      ? [
          ...COMMON_BOTTLE_SIZES.map((s) => ({ label: s.label, value: s.ml, onSelect: () => { setBottleSizeMl(s.ml); setCustomSizeMode(false); } })),
          { label: 'Other…', value: 'other', onSelect: () => setCustomSizeMode(true) },
        ]
      : openField === 'count'
        ? Array.from({ length: 48 }, (_, i) => ({ label: String(i + 1), value: i + 1, onSelect: () => setBottleCount(i + 1) }))
        : [];

  // The three headline stats are tappable — each opens a short "why" popup.
  // Critic Score → where this number comes from. Crucially, says when it is NOT
  // a score for this vintage: an average across a wine's vintages can differ a
  // good deal from one year's score.
  function openScoreInfo() {
    const v = wine?.vintage && wine.vintage !== 'NV' ? wine.vintage : null;
    const thisVintage = v ? `the ${v} vintage` : 'this wine';
    let body: string;
    if (intel.criticScoreBasis === 'vintage') {
      body = `This is the critics' consensus for ${thisVintage}, from Wine-Searcher's aggregate of published critic scores.`;
    } else if (intel.criticScoreBasis === 'all-vintage') {
      body = `Critics' scores for ${thisVintage} aren't available, so this score is guided by the AVERAGE of critics' scores across this wine's vintages, adjusted for how ${v ?? 'this vintage'} compares. A score for one specific vintage can differ a good deal from that average.`;
    } else if (intel.criticScoreBasis === 'vinster' && intel.wsUnavailable) {
      showWsUnavailable('How Vinster scored this', "Wine-Searcher couldn't be checked just now, so this score is Vinster's own estimate rather than the critics' consensus.");
      return;
    } else if (intel.criticScoreBasis === 'vinster') {
      body = intel.criticScoreNote?.trim()
        || `No published critic score was found for ${thisVintage}, so this is Vinster's own estimate of where critics would place it — a guide, not a published score.`;
    } else {
      body = intel.criticScoreNote?.trim()
        || "Vinster's score distils critic consensus and Wine-Searcher's aggregate rating for this wine into a single 100-point mark.";
    }
    showAlert({ title: 'How Vinster scored this', body });
  }
  // A lookup that never reached Wine-Searcher: say so, and offer to try again.
  async function retryWineSearcher() {
    if (wsRetrying) return;
    setWsRetrying(true);
    try { await runGenerate(); } finally { setWsRetrying(false); }
  }
  function showWsUnavailable(title: string, body: string) {
    showAlert({
      title,
      body: `${body} Try again in a little while for the live Wine-Searcher figures.`,
      buttons: [
        { text: 'Close', style: 'cancel' },
        { text: 'Try again', onPress: () => { void retryWineSearcher(); } },
      ],
    });
  }
  function openValueInfo() {
    let body: string;
    if (intel.valueSource !== 'wine-searcher' && intel.wsUnavailable) {
      showWsUnavailable('Where this value comes from', "Wine-Searcher couldn't be checked just now, so this value is Vinster's own estimate.");
      return;
    }
    if (intel.valueSource === 'wine-searcher') {
      body = intel.estimatedValueLow != null && intel.estimatedValueHigh != null && intel.estimatedValueLow !== intel.estimatedValueHigh
        ? `Wine-Searcher values range from ${formatCurrency(intel.estimatedValueLow, userCurrency, { decimals: 0 })}–${formatCurrency(intel.estimatedValueHigh, userCurrency, { decimals: 0 })}${intel.priceScope === 'all-vintage' ? ', across all vintages (no price for this exact vintage).' : '.'}`
        : `Wine-Searcher's live market value${intel.priceScope === 'all-vintage' ? ', averaged across all vintages (no price for this exact vintage).' : ' for this wine.'}`;
    } else if (intel.valueSource === 'vinster' && intel.estimatedValue != null) {
      body = intel.valueConfidence === 'low'
        ? "This is Vinster's own estimate and there's no reliable market data for this bottle — treat it as a broad guide only. Rare, allocated or cult wines can sell for many times a typical regional price, so the real figure may be much higher."
        : "This value is Vinster's own estimate — there's no Wine-Searcher price for this exact wine.";
    } else {
      body = "There's no Wine-Searcher price for this wine.";
    }
    showAlert({ title: 'Where this value comes from', body });
  }
  // Window → the drinking-window slider (DrinkingWindowSheet).
  function openWindowInfo() {
    setWindowSheetOpen(true);
  }

  // Vinster's Vintage & Market Comparison — generate the Wine-Searcher per-vintage
  // table on first expand (N live lookups; cached after so re-opening is instant).
  function toggleVintages() {
    const opening = !vintagesExpanded;
    setNoteExpanded(false);
    setVintagesExpanded(opening);
    if (opening && !vintagesTriedRef.current && wine) {
      vintagesTriedRef.current = true;
      void loadVintages();
    }
  }

  // Wine-Searcher per-vintage table; with no data, Vinster's written market &
  // vintage assessment instead (as on the wine card). Refresh re-runs it.
  async function loadVintages() {
    if (!wine) return;
    setVintagesLoading(true);
    setVintagesDown(false);
    setIntelMarketNote(null);
    setIntelMarketUnknown(false);
    intelVerdictKeyRef.current = null;
    setIntelVerdict(null);
    try {
      const queryName = wineQueryName(wine.producer, wine.wineName) || (wine.wineName ?? '');
      const scanned = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : NaN;
      const rows = await fetchVintageComparison(queryName, userCurrency, Number.isFinite(scanned) ? scanned : null, wineQueryAltName(wine.producer, wine.wineName, wine.region));
      setVintageRows(rows);
      // Too few vintages to compare (fewer than two with a price and a score):
      // add Vinster's own written vintage & market assessment.
      if (vintageVerdict(rows, wine.vintage, String).total < 2) {
        try {
          const note = await generateMarketVintage({ producer: wine.producer, wine_name: wine.wineName, region: wine.region, vintage: wine.vintage, grape_variety: wine.grape ?? null, style: wine.style ?? null } as unknown as Parameters<typeof generateMarketVintage>[0], userCurrency);
          setIntelMarketNote(note);
          setIntelMarketUnknown(note === null);
        } catch { /* leave the plain no-data line */ }
      }
    } catch (e) {
      setVintageRows([]);
      if (isWineSearcherUnavailable(e)) setVintagesDown(true);
    } finally {
      setVintagesLoading(false);
    }
  }

  // Dive Deeper works pre-save: the wine-knowledge screen falls back to query
  // params when the path id matches no cellar row (so we pass a placeholder id
  // + the wine fields). It just won't cache, which is fine for a preview.
  // "Save to Your Wine Reviews" — replaces the retired Label Library. Review now
  // (opens the +Add review pre-filled) or later (files it as an awaiting pick).
  function handleSaveToReviews() {
    if (!wine) return;
    if (!session?.user.id) { setSignInPromptVisible(true); return; }
    // A review already exists for this wine → go straight to its review card
    // (Add/View), skipping the "review now / later" prompt.
    const existingReview = findExistingReview(chosenWines, {
      producer: wine.producer, wineName: wine.wineName, vintage: wine.vintage, wsWineId: intel.wsWineId ?? null,
    });
    if (existingReview) {
      router.push(`/wines/chosen?openReview=${existingReview.id}&backTo=${encodeURIComponent('/label/results?context=intel')}&fromIntel=1` as any);
      return;
    }
    const label = [wine.producer, wine.wineName, wine.vintage].filter(Boolean).join(' ');
    showAlert({
      title: 'Add Your Wine Review',
      body: `${label}\n\nReview it now, or save it to review later?`,
      buttons: [
        {
          text: 'Review now',
          onPress: () => {
            const qs = new URLSearchParams({ seedAdd: '1' });
            if (wine.producer) qs.set('sp', wine.producer);
            if (wine.wineName) qs.set('sw', wine.wineName);
            if (wine.vintage) qs.set('sv', wine.vintage);
            if (wine.region) qs.set('sr', wine.region);
            // Carry the grape so it shows on the review header (sg = seed grape).
            { const g = intel.grapeVariety ?? wine.grape; if (g) qs.set('sg', g); }
            // Carry the scanned label into the +Add review as a local uri to
            // upload on save (slu = seed label uri, read from the label store).
            if (imageUri) qs.set('slu', '1');
            // Return straight to THIS intel card (not the Your Wine Reviews
            // list) when the review is saved, discarded, or backed out of.
            // MUST carry context=intel — the full intel view (Vintage & Market
            // Comparison, Dive Deeper, producer range, the three action buttons)
            // and the "back → Scan tab" behaviour are all gated on it; without it
            // the returned card re-mounts degraded and back goes to Cellar.
            qs.set('backTo', '/label/results?context=intel');
            qs.set('fromIntel', '1');
            router.push(`/wines/chosen?${qs.toString()}` as any);
          },
        },
        { text: 'Review later', onPress: () => void saveReviewLater() },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  async function saveReviewLater() {
    if (!wine) return;
    const vn = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : null;
    try {
      const row = await saveManual.mutateAsync({
        wineName: wine.wineName ?? '', producer: wine.producer ?? '', region: wine.region ?? '',
        vintage: Number.isFinite(vn as number) ? (vn as number) : null,
        restaurantName: '', city: '', listPrice: null, currency: userCurrency,
        tastingNote: '', otherObservations: '', userScore: null, isFavourite: false,
        source: 'other',
      });
      // Carry the scanned label photo onto the review. The intel flow keeps the
      // shot as a local uri only (the Label Library auto-upload was retired), so
      // upload it against the new review's id and stamp the path. Best-effort:
      // a failed upload must not lose the review the user just saved.
      const labelUri = useLabelStore.getState().imageUri;
      if (row?.id && labelUri && session?.user?.id) {
        try {
          const path = await uploadLabelImage(session.user.id, labelUri, row.id);
          await patchChosenWine(row.id, { label_image_path: path });
        } catch { /* label image is best-effort — keep the saved review */ }
      }
      showAlert({
        title: 'Saved to Your Wine Reviews',
        body: 'It\'s waiting in Your Wine Reviews for you to review when you\'re ready.',
        buttons: [{ text: 'View', onPress: () => router.push('/wines/chosen') }, { text: 'OK', style: 'cancel' }],
      });
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

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
    // backTo=intel threads through to the recipe results screen so its Back pops
    // straight back to THIS Wine Intel card, not out to the Pair tab.
    router.push('/chef/review-requirements?from=cellar&backTo=intel');
  }

  // ---- Wine Intel (scan / search) — the wine card layout: label hero, pill
  // tabs (Overview / Market / Serve), the same cards and history. -----------
  const intelId = { producer: wine.producer, wineName: wine.wineName, region: wine.region, vintage: wine.vintage };
  const cellarMatches = wines.filter((w) => !w.archived_at && sameWineIdentity(intelId, w));
  const archiveMatches = archivedWines.filter((w) => sameWineIdentity(intelId, w));
  const fmtIntelDay = (d: string | null | undefined) => {
    if (!d) return '';
    const dt = new Date(d.length === 10 ? `${d}T00:00:00` : d);
    return Number.isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const intelReturn = encodeURIComponent('/label/results?context=intel');
  // Every review of this wine — restaurant / other (chosen wines) and the
  // user's own cellar bottles' review entries — newest first.
  const intelReviews = [
    ...chosenWines
      .filter((c) => (c.user_score != null || !!c.tasting_note?.trim()) && sameWineIdentity(intelId, { producer: c.producer, wineName: c.wine_name, vintage: c.vintage }))
      .map((c) => ({ key: `c-${c.id}`, date: c.reviewed_at ?? c.chosen_at, place: c.restaurant_name ?? null, score: c.user_score, note: c.tasting_note, open: () => router.push(`/wines/chosen?openReview=${c.id}&backTo=${intelReturn}&fromIntel=1` as any) })),
    ...[...cellarMatches, ...archiveMatches].flatMap((w) => visibleEntries(w).map((e) => ({ key: `e-${w.id}-${e.id}`, date: e.date ?? e.savedAt, place: e.location ?? null, score: e.score ?? null, note: e.note ?? null, open: () => router.push(`/wines/chosen?openCellarReview=${w.id}&backTo=${intelReturn}` as any) }))),
  ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  const latestIntelReview = intelReviews[0] ?? null;

  // "Your History With This Wine": plain statements (no link) and lines that
  // open where the wine is, or the occasion it was drunk.
  type HistoryLine = { key: string; text: string; link?: string; onPress?: () => void };
  function intelHistoryLines(): HistoryLine[] {
    const lines: HistoryLine[] = [];
    const b = (n: number) => `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
    const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
    const total = cellarMatches.reduce((s, w) => s + (w.quantity ?? 0), 0);
    const openWine = (id: string | undefined) => { if (id) router.push(`/cellar/${id}` as any); };

    // 1. When bottles came and went: each day bottles were added to the cellar,
    //    then each day bottles went to the archive, newest first in each.
    //    Statements, except that an archive line opens that archived bottle.
    //    An archive copy keeps the received date of the line it came from, so
    //    archived bottles also count towards the day they were added.
    const dayKey = (d: string) => d.slice(0, 10);
    const addedByDay = new Map<string, number>();
    for (const w of [...cellarMatches, ...archiveMatches]) {
      const day = w.date_received ?? w.created_at;
      if (!day || !(w.quantity > 0)) continue;
      addedByDay.set(dayKey(day), (addedByDay.get(dayKey(day)) ?? 0) + w.quantity);
    }
    const newestFirst = (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime();
    for (const day of Array.from(addedByDay.keys()).sort(newestFirst)) {
      const n = addedByDay.get(day)!;
      lines.push({ key: `added-${day}`, text: `${n} ${n === 1 ? 'Bottle' : 'Bottles'} added to your cellar on ${fmtIntelDay(day)}` });
    }
    const archivedRows = archiveMatches
      .filter((w) => !!w.archived_at && w.quantity > 0)
      .sort((a, b) => newestFirst(a.archived_at!, b.archived_at!));
    for (const w of archivedRows) {
      lines.push({ key: `archived-${w.id}`, text: `${w.quantity} ${w.quantity === 1 ? 'Bottle' : 'Bottles'} added to your archive on ${fmtIntelDay(w.archived_at!)}`, link: 'View', onPress: () => openWine(w.id) });
    }

    // 2. Where the bottles are now: one line per rack, fridge, bin or alt
    //    cellar, each opening that storage with this wine highlighted; bottles
    //    held externally or not filed anywhere open the Full Cellar List
    //    filtered to this wine.
    const wineId = ownedMatch?.id;
    let placed = 0;
    const units = new Map<string, HistoryLine & { n: number }>();
    const addTo = (key: string, label: string, n: number, open: () => void) => {
      const u = units.get(key);
      if (u) u.n += n; else units.set(key, { key, text: label, n, link: 'View', onPress: open });
      placed += n;
    };
    for (const p of wineId ? matchPlacements : []) {
      const n = p.quantity ?? 0;
      if (n <= 0) continue;
      if (p.kind === 'rack' && p.rack_id) {
        const rack = racks.find((r) => r.id === p.rack_id);
        addTo(`rack-${p.rack_id}`, `in your ${rack?.name ?? 'rack'}`, n, () => router.push(`/cellar/rack/${p.rack_id}?highlight=${wineId}` as any));
      } else if (p.kind === 'bin' && p.bin_cell_id) {
        const cellId = p.bin_cell_id;
        addTo(`bin-${cellId}`, 'in your wine bin', n, () => {
          void getBinCell(cellId)
            .then(({ cell }) => router.push(`/cellar/bin/${cell.bin_id}?highlight=${wineId}` as any))
            .catch(() => openWine(wineId));
        });
      } else if (p.kind === 'location' && p.storage_location_id) {
        const loc = allStorageLocations.find((l) => l.id === p.storage_location_id);
        if (loc?.is_external) {
          // External storage: the Full Cellar List, filtered to this wine.
          addTo(`loc-${p.storage_location_id}`, `in your external cellar, ${loc.name}`, n, () => router.push(`/cellar/list?wine=${wineId}` as any));
        } else {
          addTo(`loc-${p.storage_location_id}`, `in your ${loc?.name ?? 'alt cellar'}`, n, () => router.push(`/cellar/storage-location/${p.storage_location_id}?highlight=${wineId}` as any));
        }
      }
    }
    for (const u of units.values()) lines.push({ key: u.key, text: `${cap(b(u.n))} ${u.text}`, link: u.link, onPress: u.onPress });
    const loose = total - placed;
    // Not filed anywhere: the Full Cellar List, filtered to this wine.
    const listWineId = wineId ?? cellarMatches[0]?.id;
    if (loose > 0 && listWineId) lines.push({ key: 'loose', text: `${cap(b(loose))} in Your Cellar List`, link: 'View', onPress: () => router.push(`/cellar/list?wine=${listWineId}` as any) });


    // 3. Each time the wine was drunk at a restaurant — picked from a list,
    // reviewed or not, cellar bottle or not — newest first, opening that visit's
    // restaurant review. (Reviews have their own section below.)
    const visits = chosenWines
      .filter((c) => !!c.restaurant_name?.trim() && sameWineIdentity(intelId, { producer: c.producer, wineName: c.wine_name, vintage: c.vintage }))
      .sort((a, b) => new Date(b.chosen_at).getTime() - new Date(a.chosen_at).getTime());
    for (const c of visits) {
      const where = `${c.restaurant_name!.trim()}${c.city?.trim() ? ` in ${c.city.trim()}` : ''}`;
      lines.push({
        key: `drank-${c.id}`,
        text: `You drank this wine at ${where}`,
        link: 'View',
        onPress: () => router.push((c.scan_session_id
          ? `/restaurants/reviews?openSession=${c.scan_session_id}`
          : `/wines/chosen?openReview=${c.id}&backTo=${intelReturn}&fromIntel=1`) as any),
      });
    }
    return lines;
  }

  function intelGoBack() {
    router.dismissTo(
      backTo ? (decodeURIComponent(backTo) as any)
      : isLineupFlow ? '/cellar/scan-lineup'
      : isIntelOnlyFlow ? '/(tabs)/scan'
      : '/(tabs)/cellar',
    );
  }

  function openIntelTab(t: 'overview' | 'market' | 'serve') {
    setIntelTab(t);
    if (t === 'market' && !vintagesExpanded) toggleVintages();
    if (t === 'market' && !intelRarityTriedRef.current && wine) {
      intelRarityTriedRef.current = true;
      void generateRarity({ producer: wine.producer, wine_name: wine.wineName, region: wine.region, vintage: wine.vintage, grape_variety: wine.grape ?? null, style: wine.style ?? null } as unknown as Parameters<typeof generateRarity>[0])
        .then((r) => setIntelRarity(r ?? null))
        .catch(() => { intelRarityTriedRef.current = false; });
    }
    if (t === 'serve' && !servingExpanded) void toggleServing();
  }

  function intelPickRow(found: CellarPick | null, slot: 'before' | 'after', suggested: string) {
    const qs = new URLSearchParams({ slot, suggested });
    if (wine.producer) qs.set('sp', wine.producer);
    if (wine.wineName) qs.set('sw', wine.wineName);
    if (wine.region) qs.set('sr', wine.region);
    if (wine.vintage) qs.set('sv', wine.vintage);
    if (wine.grape) qs.set('sg', wine.grape);
    return (
      <CellarPickRow
        found={found}
        onOpen={(id) => router.push(`/cellar/${id}` as any)}
        onMarket={() => router.push(`/cellar/serve-market?${qs.toString()}` as any)}
      />
    );
  }

  function renderIntelTabs() {
    const fmt = (n: number) => formatCurrency(n, userCurrency, { decimals: 0 });
    const lines = intelHistoryLines();
    const verdict = vintageRows && vintageRows.length > 0 ? vintageVerdict(vintageRows, wine.vintage, fmt) : null;
    const windowYears = intel.drinkingWindowFrom && intel.drinkingWindowTo ? `${intel.drinkingWindowFrom}–${intel.drinkingWindowTo}` : null;
    return (
      <>
        <View style={wc.TabBar} accessibilityRole="tablist">
          {([['overview', 'Overview'], ['market', 'Market'], ['serve', 'Serve']] as const).map(([id, label]) => {
            const on = intelTab === id;
            return (
              <TouchableOpacity key={id} style={[wc.Tab, on && wc.TabOn]} onPress={() => openIntelTab(id)} accessibilityRole="tab" accessibilityState={{ selected: on }} activeOpacity={0.7}>
                <Text style={[wc.TabText, on && wc.TabTextOn]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {intelTab === 'overview' ? (
          <>
            <View style={wc.Facts}>
              <TouchableOpacity style={wc.Fact} onPress={openScoreInfo} disabled={intelLoading || intel.criticScore == null} activeOpacity={0.7}>
                <Text style={wc.FactLabel}>Critic</Text>
                {intelLoading ? <ActivityIndicator size="small" color={colors.gold} /> : <Text style={wc.FactValue}>{intel.criticScore != null ? intel.criticScore : '—'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={wc.Fact} onPress={openValueInfo} disabled={intelLoading || intel.estimatedValue == null} activeOpacity={0.7}>
                <Text style={wc.FactLabel}>Value</Text>
                {intelLoading ? <ActivityIndicator size="small" color={colors.gold} /> : <Text style={wc.FactValue}>{intel.estimatedValue != null ? <>{fmt(intel.estimatedValue)}<Text style={styles.per75}>{PER_75CL}</Text></> : '—'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[wc.Fact, wc.FactLast]} onPress={openWindowInfo} disabled={intelLoading || intel.isSpirit || (!windowYears && intel.drinkingWindowStatus === 'unknown')} activeOpacity={0.7}>
                <Text style={wc.FactLabel}>Window</Text>
                {intelLoading ? <ActivityIndicator size="small" color={colors.gold} /> : intel.isSpirit ? (
                  <Text style={wc.FactValue}>NA</Text>
                ) : (
                  <>
                    <Text style={[wc.FactValue, { color: windowMeta(intel.drinkingWindowStatus).color }]} numberOfLines={1}>{intel.drinkingWindowStatus === 'unknown' ? '—' : windowMeta(intel.drinkingWindowStatus).text}</Text>
                    {windowYears ? <Text style={wc.FactSub}>{windowYears}</Text> : null}
                  </>
                )}
              </TouchableOpacity>
            </View>
            {intel.wsUnavailable && !intelLoading ? (
              <TouchableOpacity onPress={retryWineSearcher} disabled={wsRetrying} activeOpacity={0.7}>
                <Text style={[styles.statBarHint, { color: colors.gold }]}>
                  {wsRetrying ? 'Checking Wine-Searcher…' : "Wine-Searcher couldn't be checked just now, so these are Vinster's estimates. Tap to try again."}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.statBarHint}>Tap any stat to see how Vinster worked it out</Text>
            )}

            <View style={wc.Body}>
              {lines.length ? (
                <View style={wc.History}>
                  <Text style={wc.HistoryTitle}>Your History With This Wine</Text>
                  {lines.map((l, i) => (
                    <TouchableOpacity key={l.key} style={[wc.HistoryRow, i === lines.length - 1 && wc.RowLast]} onPress={l.onPress} disabled={!l.onPress} activeOpacity={0.7}>
                      <Text style={wc.HistoryText}>{l.text}</Text>
                      {l.link ? <Text style={wc.Link}>{l.link} ›</Text> : null}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {latestIntelReview ? (
                <View style={wc.Card}>
                  <Text style={wc.H2}>Your Wine Review</Text>
                  <View style={wc.ScoreRow}>
                    {latestIntelReview.score != null ? <Text style={wc.BigScore}>{latestIntelReview.score}<Text style={wc.BigScoreOf}>/100</Text></Text> : null}
                    <Text style={wc.Small}>{[fmtIntelDay(latestIntelReview.date), latestIntelReview.place].filter(Boolean).join(' · ')}</Text>
                  </View>
                  {latestIntelReview.note ? <Text style={wc.BodyText} numberOfLines={6}>{latestIntelReview.note}</Text> : null}
                  <TouchableOpacity onPress={latestIntelReview.open} activeOpacity={0.7}><Text style={wc.Link}>View full review ›</Text></TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={wc.addReview} onPress={handleSaveToReviews} activeOpacity={0.8}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[wc.H2, { color: colors.gold }]}>+ Add Wine Review</Text>
                    <Text style={wc.PairingsSub}>Score it, note where you drank it and what you thought</Text>
                  </View>
                  <Text style={wc.Chevron}>›</Text>
                </TouchableOpacity>
              )}

              {intel.tastingNotes ? (
                <View style={wc.Card}>
                  <Text style={wc.H2}>Vinster's Review</Text>
                  <Text style={wc.BodyText}>{intel.tastingNotes}</Text>
                </View>
              ) : null}

              <View style={[wc.Card, wc.Inside]}>
                <Text style={wc.insideTitle}>The Inside Line</Text>
                <Text style={wc.insideBody}>{hasRealInsiderNote(intel.insiderNote) ? intel.insiderNote?.trim() : 'Generating…'}</Text>
                <TouchableOpacity onPress={handleDiveDeeper} activeOpacity={0.7}>
                  <Text style={styles.diveDeeperLink}>Dive deeper into this wine →</Text>
                </TouchableOpacity>
              </View>

              {producerRangeLoading || rangeWines.length > 0 ? (
                <View style={wc.Card}>
                  <Text style={wc.insideTitle}>The {wine.producer} Range</Text>
                  {rangeWines.some((rw) => !rw.isThis) ? <Text style={styles.rangeHint}>Tap a wine for its inside line</Text> : null}
                  {producerRange ? (
                    <>
                      {rangeWines.map((rw, i) => (
                        <TouchableOpacity key={`${rw.wineName}-${i}`} style={[styles.rangeRow, rw.isThis && styles.rangeRowThis]} onPress={() => { setRangeNoteWine(rw.wineName); setRangeNoteTier(rw.tier ?? null); }} activeOpacity={(rw.isThis || rw.grouped) ? 1 : 0.7} disabled={rw.isThis || rw.grouped}>
                          <View style={styles.rangeRowMain}>
                            <Text style={[styles.rangeMarker, !rw.isThis && styles.rangeMarkerHidden]}>▸</Text>
                            <Text style={[styles.rangeName, rw.isThis && styles.rangeNameThis]} numberOfLines={rw.grouped ? 4 : 2}>{rw.wineName}</Text>
                          </View>
                          <View style={styles.rangeRight}>
                            <Text style={[styles.rangeBand, rw.isThis && styles.rangeBandThis]}>{currencySymbol(userCurrency).repeat(rw.band)}</Text>
                            {rw.tier ? <Text style={styles.rangeTier}>{rw.tier}</Text> : null}
                          </View>
                        </TouchableOpacity>
                      ))}
                      {producerRange.summary ? <Text style={styles.rangeSummary}>{producerRange.summary}</Text> : null}
                    </>
                  ) : (
                    <View style={wc.loadingRow}><ActivityIndicator color={colors.gold} /><Text style={wc.Small}>Mapping the range…</Text></View>
                  )}
                </View>
              ) : null}

              <RangeWineNoteSheet
                producer={wine.producer}
                wineName={rangeNoteWine}
                region={wine.region}
                tier={rangeNoteTier}
                visible={!!rangeNoteWine}
                onClose={() => setRangeNoteWine(null)}
              />

              <TouchableOpacity
                style={wc.outlineBtn}
                onPress={() => setAddingToCellar(true)}
                activeOpacity={0.85}
              >
                <Text style={wc.outlineBtnText}>Save to Your Cellar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={wc.outlineBtn} onPress={handleShare} disabled={sharing} activeOpacity={0.85}>
                <Text style={wc.outlineBtnText}>{sharing ? 'Exporting…' : 'Export Wine Intel'}</Text>
              </TouchableOpacity>
              <Text style={[wc.Small, { textAlign: 'center' }]}>Community notes on this wine · coming soon</Text>
            </View>
          </>
        ) : null}

        {intelTab === 'market' ? (
          <View style={wc.Body}>
            {/* No purchase price on Wine Intel, so the market value is one compact
                bar: label + value, then range · source · date on a single line. */}
            <View style={[wc.Card, { gap: 2, paddingVertical: 10 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <Text style={wc.Label}>Estimated Market Value</Text>
                <Text style={[wc.VsValue, styles.marketValue]}>{intel.estimatedValue != null ? <>{fmt(intel.estimatedValue)}<Text style={styles.per75}>{PER_75CL}</Text></> : '—'}</Text>
              </View>
              {intel.estimatedValue != null ? (
                <Text style={wc.Small} numberOfLines={1}>
                  {[
                    intel.estimatedValueLow != null && intel.estimatedValueHigh != null ? `Range ${fmt(intel.estimatedValueLow)}–${fmt(intel.estimatedValueHigh)}` : null,
                    intel.valueSource === 'wine-searcher' ? 'Wine-Searcher' : 'Vinster estimate',
                    fmtIntelDay(new Date().toISOString()),
                  ].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>

            <View style={wc.Card}>
              <Text style={wc.H2}>Vinster's Market & Vintage Comparison</Text>
              {vintagesLoading ? (
                <View style={wc.loadingRow}><ActivityIndicator color={colors.gold} /><Text style={wc.Small}>Checking Wine-Searcher across vintages…</Text></View>
              ) : verdict ? (
                <>
                  <View style={[wc.TRow, wc.THead]}>
                    <Text style={[wc.TCell, wc.TYear, wc.Label]}>Vintage</Text>
                    <Text style={[wc.TCell, wc.Label]}>Score</Text>
                    <Text style={[wc.TCell, wc.Label]}>Price</Text>
                    <Text style={[wc.TCell, wc.Label]}>{currencySymbol(userCurrency)} / pt</Text>
                  </View>
                  {verdict.rows.map((r) => {
                    const mine = String(r.vintage) === String(wine.vintage ?? '').trim();
                    const best = r.vintage === verdict.bestValueVintage;
                    return (
                      <View key={r.vintage} style={wc.TRow}>
                        <Text style={[wc.TCell, wc.TYear, mine && wc.TMine]}>{r.vintage}{mine ? ' · this' : ''}</Text>
                        <Text style={[wc.TCell, mine && wc.TMine]}>{r.score ?? '—'}</Text>
                        <Text style={[wc.TCell, mine && wc.TMine]}>{r.price != null ? fmt(r.price) : '—'}</Text>
                        <Text style={[wc.TCell, mine && wc.TMine]}>{r.ppt != null ? `${currencySymbol(userCurrency)}${r.ppt.toFixed(2)}` : '—'}{best ? <Text style={wc.BestStar}> ★</Text> : null}</Text>
                      </View>
                    );
                  })}
                  <Text style={wc.footnote}>Wine-Searcher market value and aggregate critic score, by vintage.</Text>
                  {verdict.total >= 2 ? (
                    <View style={wc.Verdict}>
                      <Text style={wc.insideTitle}>Vinster's verdict</Text>
                      <View style={{ gap: 2 }}>
                        {verdict.qualityRank != null ? <Text style={wc.BodyText}>This Wine's Quality: <Text style={{ color: colors.gold, fontFamily: fonts.bodySemibold }}>{ordinal(verdict.qualityRank)} of {verdict.total} vintages</Text></Text> : null}
                        {verdict.valueRank != null ? <Text style={wc.BodyText}>This Wine's Value: <Text style={{ color: colors.gold, fontFamily: fonts.bodySemibold }}>{ordinal(verdict.valueRank)} of {verdict.total} vintages</Text></Text> : null}
                        {verdict.bestValueVintage != null ? <Text style={wc.BodyText}>Best Value Vintage: <Text style={{ color: colors.gold, fontFamily: fonts.bodySemibold }}>{verdict.bestValueVintage}</Text></Text> : null}
                      </View>
                      {intelVerdictLoading ? (
                        <View style={wc.loadingRow}><ActivityIndicator color={colors.gold} /><Text style={wc.Small}>Vinster is weighing up this vintage…</Text></View>
                      ) : intelVerdict ? (
                        <>
                          {intelVerdict.verdict ? <Text style={wc.BodyText}>{intelVerdict.verdict}</Text> : null}
                          {intelVerdict.drinkNow ? (
                            <View style={{ gap: 2 }}>
                              <Text style={wc.BodyText}>Best for Drinking Now: <Text style={{ color: colors.gold, fontFamily: fonts.bodySemibold }}>{intelVerdict.drinkNow.vintages.join(', ')}</Text></Text>
                              {intelVerdict.drinkNow.reason ? <Text style={wc.SmallItalic}>{intelVerdict.drinkNow.reason}</Text> : null}
                            </View>
                          ) : null}
                          {intelVerdict.layDown ? (
                            <View style={{ gap: 2 }}>
                              <Text style={wc.BodyText}>Best to Lay Down: <Text style={{ color: colors.gold, fontFamily: fonts.bodySemibold }}>{intelVerdict.layDown.vintages.join(', ')}</Text></Text>
                              {intelVerdict.layDown.reason ? <Text style={wc.SmallItalic}>{intelVerdict.layDown.reason}</Text> : null}
                            </View>
                          ) : null}
                        </>
                      ) : null}
                    </View>
                  ) : null}
                  <TouchableOpacity onPress={() => void loadVintages()} activeOpacity={0.7}><Text style={styles.diveDeeperLink}>Refresh →</Text></TouchableOpacity>
                  {verdict.total < 2 ? (
                    <>
                      <Text style={wc.Small}>{tooFewVintagesNote(verdict.total, wine.vintage)}</Text>
                      {intelMarketNote?.vintage ? <Text style={styles.servingLine}><Text style={styles.servingTitle}>Vintage · </Text>{intelMarketNote.vintage}</Text> : null}
                      {intelMarketNote?.market ? <Text style={styles.servingLine}><Text style={styles.servingTitle}>Market · </Text>{intelMarketNote.market}</Text> : null}
                    </>
                  ) : null}
                </>
              ) : vintagesDown ? (
                <>
                  <Text style={wc.Small}>Vinster couldn't reach Wine-Searcher just now (it may have hit its daily limit). Please try again later.</Text>
                  <TouchableOpacity onPress={() => void loadVintages()} activeOpacity={0.7}><Text style={styles.diveDeeperLink}>Refresh →</Text></TouchableOpacity>
                </>
              ) : vintageRows && intelMarketNote ? (
                <View style={styles.servingBubble}>
                  <Text style={styles.marketMissingNote}>Wine-Searcher has no per-vintage market data for this wine, so here's Vinster's assessment:</Text>
                  {intelMarketNote.vintage ? <Text style={styles.servingLine}><Text style={styles.servingTitle}>Vintage · </Text>{intelMarketNote.vintage}</Text> : null}
                  {intelMarketNote.market ? <Text style={styles.servingLine}><Text style={styles.servingTitle}>Market · </Text>{intelMarketNote.market}</Text> : null}
                  <TouchableOpacity onPress={() => void loadVintages()} activeOpacity={0.7}><Text style={styles.diveDeeperLink}>Refresh →</Text></TouchableOpacity>
                </View>
              ) : vintageRows ? (
                <>
                  <Text style={wc.Small}>Wine-Searcher has no per-vintage market data for this wine.{intelMarketUnknown ? " Vinster doesn't know this wine well enough to comment." : ''}</Text>
                  <TouchableOpacity onPress={() => void loadVintages()} activeOpacity={0.7}><Text style={styles.diveDeeperLink}>Refresh →</Text></TouchableOpacity>
                </>
              ) : null}
            </View>

            {intelRarity?.level ? (
              <View style={wc.Card}>
                <View style={wc.CardHead}>
                  <Text style={wc.H2}>Rarity</Text>
                  <Text style={wc.SmallItalic}>Vinster's assessment</Text>
                </View>
                <View style={wc.RarityRow}>
                  <View style={wc.RarityMeter}>
                    {[1, 2, 3, 4, 5].map((i) => <View key={i} style={[wc.RarityStep, i <= (intelRarity.level ?? 0) && wc.RarityStepOn]} />)}
                  </View>
                  <Text style={wc.GoldValue}>{intelRarity.label}</Text>
                </View>
                {intelRarity.text ? <Text style={wc.BodyText}>{intelRarity.text}</Text> : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {intelTab === 'serve' ? (
          <View style={wc.Body}>
            <GenerateRecipesCard onPress={handleChefPairing} />
            {servingLoading ? (
              <View style={wc.loadingRow}><ActivityIndicator color={colors.gold} /><Text style={wc.Small}>Thinking about how best to serve this…</Text></View>
            ) : serving ? (
              <>
                <ServingGlance serving={serving} />
                <PairingIngredientsCard ingredients={intelIngredients} loading={ingredientsLoading} />
                <ComplementaryPairings serving={serving} renderPick={(slot, style) => intelPickRow(pickFromCellar(style, homeWines), slot, style)} />
              </>
            ) : (
              <TouchableOpacity onPress={() => { setServingExpanded(false); void toggleServing(); }} activeOpacity={0.7}>
                <Text style={wc.Small}>Couldn't load serving suggestions — tap to try again.</Text>
              </TouchableOpacity>
            )}
            {!serving ? <PairingIngredientsCard ingredients={intelIngredients} loading={ingredientsLoading} /> : null}
          </View>
        ) : null}
      </>
    );
  }

  return (
    <>
    <SignInPromptModal
      visible={signInPromptVisible}
      allowContinue={false}
      onDismiss={() => setSignInPromptVisible(false)}
      onSignIn={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-in'); }}
      onCreateAccount={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-up'); }}
      onContinue={() => setSignInPromptVisible(false)}
    />
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      {isIntelOnlyFlow ? (
        <WineCardHero
          path={null}
          uri={heroUri}
          title={[wine.producer, wine.wineName !== wine.producer ? wine.wineName : null, wine.vintage].filter(Boolean).join(' ')}
          subtitle={[wine.region, (wine.grape ?? '').trim() || intel.grapeVariety].filter(Boolean).join(' · ')}
          chip=""
          onBack={intelGoBack}
          onPhotoPress={() => { if (heroUri) setZoomOpen(true); }}
          onPhotoLongPress={() => { if (heroUri) setZoomOpen(true); }}
          onTitlePress={openEditWine}
          placeholder={
            <View style={styles.heroPlaceholderBig}>
              <Text style={styles.heroPhProducer} numberOfLines={3}>{wine.producer || wine.wineName}</Text>
              <View style={styles.heroPhRule} />
              {wine.wineName && wine.wineName !== wine.producer ? <Text style={styles.heroPhName} numberOfLines={3}>{wine.wineName}</Text> : null}
              {wine.vintage ? <Text style={styles.heroPhVintage}>{wine.vintage}</Text> : null}
            </View>
          }
          rightAction={intelligence ? (
            <TouchableOpacity onPress={openEditWine} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7} style={{ minWidth: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={styles.scanAgainText}>Edit Wine</Text>
            </TouchableOpacity>
          ) : undefined}
          badge={intel?.isNatural ? <NaturalWineBadge /> : intel?.isSpirit ? <SpiritBadge /> : null}
        />
      ) : (
      <>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => router.dismissTo(
          backTo ? (decodeURIComponent(backTo) as any)
          : isLineupFlow ? '/cellar/scan-lineup'
          // Wine Intel is launched from the Scan tab now, so return there by
          // default rather than the old Cellar home. Non-Scan origins should
          // still pass an explicit backTo.
          : isIntelOnlyFlow ? '/(tabs)/scan'
          : '/(tabs)/cellar'
        )}
      >
        <Text accessibilityLabel="Back" style={[styles.backLink, { color: colors.gold, fontSize: 22 }]}>←</Text>
      </TouchableOpacity>

      {/* Top-right action: Edit Wine (correct the wine or re-scan). Export moved
          to a gold button in the actions section. */}
      {isIntelOnlyFlow && intelligence ? (
        <View style={styles.topRightActions}>
          <TouchableOpacity
            onPress={openEditWine}
            hitSlop={{ top: 6, bottom: 8, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={styles.scanAgainText}>Edit Wine</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={styles.pageTitle}>{context === 'add-location' ? `Add to ${pendingLocation?.name ?? 'Location'}` : isAddFlow ? 'Add to Cellar' : 'Wine Intel'}</Text>

      {/* One separator line beneath the title. The stats bar itself now sits
          lower — below the wine identity, just above Vinster's Note / Map. */}
      {!isAddFlow ? <View style={styles.titleRule} /> : null}

      {/* Header block: the wine-card row + the "Not this wine?" link both sit
          ABOVE the separator line (the block's bottom border). */}
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          {/* Wine-card layout: the scanned/uploaded label photo on the left, the
              wine identity (name · region · grape) on its right. Manual entries
              have no imageUri, so the text column simply fills the row. */}
          {heroUri ? (
            <TouchableOpacity onPress={() => setZoomOpen(true)} activeOpacity={0.85} style={styles.heroFrame}>
              <Image source={{ uri: heroUri }} style={styles.heroImage} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            // No photo (and no web label yet / at all): a designed label tile so
            // the card is never imageless; a found label replaces it.
            <View style={styles.heroFrame}>
              <View style={[styles.heroImage, styles.heroPlaceholder]}>
                <Text style={styles.heroPhProducer} numberOfLines={3}>{wine.producer || wine.wineName}</Text>
                <View style={styles.heroPhRule} />
                {wine.wineName && wine.wineName !== wine.producer ? <Text style={styles.heroPhName} numberOfLines={3}>{wine.wineName}</Text> : null}
                {wine.vintage ? <Text style={styles.heroPhVintage}>{wine.vintage}</Text> : null}
              </View>
            </View>
          )}
          <View style={styles.headerText}>
            {/* Full wine identity — Producer · Name · Vintage (white), Region +
                Grape (gold) — the app-wide format, wrapping rather than truncating. */}
            <WineIdentityHeader
              producer={wine.producer}
              wineName={wine.wineName}
              vintage={wine.vintage}
              region={wine.region}
              grape={(wine.grape ?? '').trim() || intel.grapeVariety}
              align="left"
              size="md"
            />
            {/* Natural-wine badge — tappable, below the identity. Shown only when
                the intel flags the wine as natural. */}
            {intel?.isNatural ? <NaturalWineBadge /> : null}
            {/* Spirit badge — a spirit won't also be natural; show whichever applies. */}
            {intel?.isSpirit ? <SpiritBadge /> : null}
          </View>
        </View>

        {/* The correction action moved to the top-right ("Edit / Scan Again",
            below Export) — see the header actions above. */}
      </View>

      </>
      )}

      {/* Tap the label photo to view it full-screen with pinch/zoom + pan. */}
      <LabelPhotoViewer visible={zoomOpen} uri={heroUri} onClose={() => setZoomOpen(false)} />
      <DrinkingWindowSheet
        visible={windowSheetOpen}
        onClose={() => setWindowSheetOpen(false)}
        wineName={[wine?.producer, wine?.wineName && wine.wineName !== wine.producer ? wine.wineName : null, wine?.vintage].filter(Boolean).join(' ')}
        from={intel.drinkingWindowFrom}
        to={intel.drinkingWindowTo}
        fallbackStatus={intel.drinkingWindowStatus}
      />

      {/* "Edit Wine" — manual edit of photo + identity + grape + bottle size,
          then regenerate the intel card. */}
      <Modal visible={editWineOpen} transparent animationType="fade" onRequestClose={() => !savingEdit && setEditWineOpen(false)}>
        <View style={styles.editWineOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={styles.editWineScroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
            <View style={styles.editWineSheet}>
              <Text style={styles.editWineTitle}>Edit Wine</Text>

              {/* Photo */}
              <View style={styles.editWinePhotoRow}>
                {(editImageUri || imageUri) ? (
                  <Image source={{ uri: (editImageUri ?? imageUri)! }} style={styles.editWineThumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.editWineThumb, styles.editWineThumbBlank]}><Text style={styles.editWineThumbBlankText}>No photo</Text></View>
                )}
                <View style={styles.editWinePhotoBtns}>
                  <TouchableOpacity style={styles.editWinePhotoBtn} onPress={() => void pickEditPhoto('camera')} activeOpacity={0.8}>
                    <Text style={styles.editWinePhotoBtnText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editWinePhotoBtn} onPress={() => void pickEditPhoto('library')} activeOpacity={0.8}>
                    <Text style={styles.editWinePhotoBtnText}>Upload</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.editWineLabel}>Producer</Text>
              <TextInput style={styles.editWineInput} value={editProducer} onChangeText={setEditProducer} placeholder="Producer" placeholderTextColor={colors.textMuted} />
              <Text style={styles.editWineLabel}>Wine name</Text>
              <TextInput style={styles.editWineInput} value={editWineName} onChangeText={setEditWineName} placeholder="Wine name (optional)" placeholderTextColor={colors.textMuted} />
              <Text style={styles.editWineLabel}>Vintage</Text>
              <TextInput style={styles.editWineInput} value={editVintage} onChangeText={(t) => setEditVintage(t.replace(/[^0-9A-Za-z]/g, '').slice(0, 7))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={7} />
              <Text style={styles.editWineLabel}>Region</Text>
              <TextInput style={styles.editWineInput} value={editRegion} onChangeText={setEditRegion} placeholder="Region" placeholderTextColor={colors.textMuted} />
              <Text style={styles.editWineLabel}>Grape variety</Text>
              <TextInput style={styles.editWineInput} value={editGrape} onChangeText={setEditGrape} placeholder="Grape variety" placeholderTextColor={colors.textMuted} />
              <Text style={styles.editWineLabel}>Style (optional)</Text>
              <TextInput style={styles.editWineInput} value={editStyle} onChangeText={setEditStyle} placeholder="Red / White / Rosé / Sparkling / Fortified" placeholderTextColor={colors.textMuted} />
              <Text style={styles.editWineLabel}>Bottle size</Text>
              <BottleSizePicker value={editBottleSizeMl} onChange={setEditBottleSizeMl} />

              <TouchableOpacity style={[styles.editWineSave, savingEdit && styles.btnDisabled]} onPress={() => void saveEditWine()} disabled={savingEdit} activeOpacity={0.85}>
                {savingEdit ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.editWineSaveText}>Save & Regenerate</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.editWineCancel} onPress={() => setEditWineOpen(false)} disabled={savingEdit} activeOpacity={0.7}>
                <Text style={styles.editWineCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      {/* Generate Wine Intel came back empty → prompt to check the name/format. */}
      {/* Weak intel: if we found candidate bottlings, the disambiguation modal
          takes over; otherwise fall back to the check-details prompt. */}
      <NoIntelPrompt
        visible={isIntelOnlyFlow && intelligence != null && intel.criticScore == null && intel.estimatedValue == null && !noIntelDismissed && !candidatesOpen && candidates.length === 0}
        onDismiss={() => setNoIntelDismissed(true)}
        onEdit={() => router.dismissTo(backTo ? (decodeURIComponent(backTo) as any) : '/(tabs)/scan')}
        editLabel="Check details"
      />

      {/* Vintage prompt — the label had no readable vintage. */}
      <Modal visible={vintagePromptOpen} transparent animationType="fade" onRequestClose={confirmNoVintage}>
        <View style={styles.candOverlay}>
          <View style={styles.candSheet}>
            {confirmGenerating ? (
              <View style={styles.candLoading}><ActivityIndicator color={colors.gold} /><Text style={styles.candLoadingText}>Updating for {vintageInput}…</Text></View>
            ) : (
              <>
                <Text style={styles.candTitle}>What's the vintage?</Text>
                <Text style={styles.candBody}>Vinster couldn't read the vintage from the label. Enter the year — or "NV" for a non-vintage wine — so the score, value and drinking window are accurate.</Text>
                <TextInput
                  style={styles.vintagePromptInput}
                  value={vintageInput}
                  onChangeText={(t) => setVintageInput(t.replace(/[^0-9a-zA-Z ]/g, '').slice(0, 12))}
                  placeholder="e.g. 2018 or NV"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={12}
                  autoFocus
                />
                <TouchableOpacity style={styles.candConfirmBtn} onPress={submitVintage} activeOpacity={0.8}>
                  <Text style={styles.candConfirmText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.candCancel} onPress={confirmNoVintage} activeOpacity={0.7}>
                  <Text style={styles.candCancelText}>Skip (treat as NV)</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* "Which wine is this?" — Claude's list of this producer's plausible
          bottlings, shown when intel came back weak. Picking one regenerates
          intel for the exact wine. */}
      <Modal visible={candidatesOpen} transparent animationType="fade" onRequestClose={() => !regenerating && setCandidatesOpen(false)}>
        <View style={styles.candOverlay}>
          <View style={styles.candSheet}>
            <Text style={styles.candTitle}>Which wine is this?</Text>
            <Text style={styles.candBody}>We couldn't find a confident match. Pick the exact {wine.producer} wine to get accurate intel — it may be a bottling the label reading missed.</Text>
            {regenerating ? (
              <View style={styles.candLoading}><ActivityIndicator color={colors.gold} /><Text style={styles.candLoadingText}>Getting intel…</Text></View>
            ) : (
              <>
                <ScrollView style={{ maxHeight: 320 }}>
                  {candidates.map((c, i) => {
                    const on = selectedCand === i;
                    return (
                      <TouchableOpacity key={`${c.wineName}-${i}`} style={styles.candRow} onPress={() => setSelectedCand(on ? null : i)} activeOpacity={0.7}>
                        <Text style={[styles.candCheck, on && styles.candCheckOn]}>{on ? '☑' : '☐'}</Text>
                        <View style={styles.candRowText}>
                          <Text style={styles.candItemName} numberOfLines={2}>{formatWineTitle({ producer: wine.producer, wineName: c.wineName, region: c.region, vintage: wine.vintage })}</Text>
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
                  activeOpacity={0.8}
                >
                  <Text style={styles.candConfirmText}>Select This Wine</Text>
                </TouchableOpacity>
              </>
            )}
            {/* No "None of these — keep as is": the wine as read is already the
                first option in the list, so picking it keeps it. */}
          </View>
        </View>
      </Modal>

      {/* Intel content — hidden in the Add flow, which carries no intel (it's
          generated later, only from Generate Wine Intel). The scan / search
          Wine Intel screen uses the wine-card tabs instead. */}
      {isIntelOnlyFlow ? renderIntelTabs() : !isAddFlow && (
        <>
          {/* Gold stats bar — moved here, beneath the wine identity and above
              Vinster's Note / Map. Full-width yellow rules top and bottom (the
              bottom rule is the separator above the Note/Map section). Three
              tappable figures — Score · Value · Drinking Window — each opening a
              short "why" popup. */}
          <View style={styles.statBarRule} />
          <View style={styles.statBar}>
            <TouchableOpacity style={styles.statBarItem} onPress={openScoreInfo} disabled={intelLoading || intel.criticScore == null} activeOpacity={0.7}>
              {intelLoading ? <ActivityIndicator size="small" color={colors.gold} /> : (
                <Text style={[styles.statBarValueGold, intel.criticScore == null && styles.statBarValueMuted]}>
                  {intel.criticScore != null ? `${intel.criticScore}/100` : '—'}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.statBarSepGold}>·</Text>
            <TouchableOpacity style={styles.statBarItem} onPress={openValueInfo} disabled={intelLoading || intel.estimatedValue == null} activeOpacity={0.7}>
              {intelLoading ? <ActivityIndicator size="small" color={colors.gold} /> : (
                <Text style={[styles.statBarValueGold, intel.estimatedValue == null && styles.statBarValueMuted]}>
                  {intel.estimatedValue != null ? formatCurrency(intel.estimatedValue, userCurrency, { decimals: 0 }) : '—'}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.statBarSepGold}>·</Text>
            <TouchableOpacity style={styles.statBarItem} onPress={openWindowInfo} disabled={intelLoading || intel.isSpirit || (!(intel.drinkingWindowFrom && intel.drinkingWindowTo) && intel.drinkingWindowStatus === 'unknown')} activeOpacity={0.7}>
              {intelLoading ? <ActivityIndicator size="small" color={colors.gold} /> : intel.isSpirit ? (
                // Spirits don't mature — no drinking window applies.
                <Text style={[styles.statBarValueGold, styles.statBarValueMuted]}>NA</Text>
              ) : (
                <Text style={[styles.statBarValueGold, !(intel.drinkingWindowFrom && intel.drinkingWindowTo) && styles.statBarValueMuted]}>
                  {intel.drinkingWindowFrom && intel.drinkingWindowTo ? `${intel.drinkingWindowFrom} - ${intel.drinkingWindowTo}` : '—'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {/* Affordance INSIDE the bar — below the stats, above the lower rule.
              Each stat is tappable (opens a "how Vinster worked it out" popup);
              static bars elsewhere omit this caption. */}
          <Text style={styles.statBarHint}>Tap any stat to see how Vinster worked it out</Text>
          {/* The "estimated value only / no reliable market data" caveat is no longer
              shown in the bar — it surfaces when the user taps the value (openValueInfo). */}
          <View style={styles.statBarRule} />

          {/* Vinster's Note — collapsible; its "(what's this)" is replaced by the
              explainer shown in gold italics below the note when it's open.
              (Vinster's Map removed for now — to revisit later.) */}
          <View style={styles.noteMapSection}>
            <View style={styles.noteMapHeadingRow}>
              <VinstersNoteHeading expanded={noteExpanded} onToggle={() => setNoteExpanded((v) => !v)} hideExplainerLink />
            </View>
            {noteExpanded ? <Text style={styles.tastingNotes}>{intel.tastingNotes}</Text> : null}
            {noteExpanded ? <Text style={styles.noteExplainer}>{VINSTERS_NOTE_EXPLAINER}</Text> : null}
          </View>

          {/* Vinster's Vintage & Market Comparison — a third collapsible with a
              chevron matching the Note/Map above. On first expand it generates a
              Wine-Searcher per-vintage table (aggregate critic score + market
              price). Intel view only — it needs live lookups. */}
          {isIntelOnlyFlow ? (
            <View style={styles.vintageSection}>
              <TouchableOpacity style={styles.vintageHeadingRow} onPress={toggleVintages} activeOpacity={0.7}>
                <Text style={styles.mapTitle}>Vinster's Vintage &amp; Market Comparison</Text>
                <Text style={styles.mapChevron}>{vintagesExpanded ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>
              {vintagesExpanded ? (
                vintagesLoading ? (
                  <View style={styles.vintageLoading}>
                    <ActivityIndicator color={colors.gold} />
                    <Text style={styles.vintageLoadingText}>Checking Wine-Searcher across vintages…</Text>
                  </View>
                ) : vintageRows && vintageRows.length > 0 ? (
                  <View style={styles.vintageTable}>
                    <View style={[styles.vintageRow, styles.vintageHeadRow]}>
                      <Text style={[styles.vintageCell, styles.vintageColYear, styles.vintageHeadCell]}>Vintage</Text>
                      <Text style={[styles.vintageCell, styles.vintageColScore, styles.vintageHeadCell]}>Score</Text>
                      <Text style={[styles.vintageCell, styles.vintageColPrice, styles.vintageHeadCell]}>Price</Text>
                    </View>
                    {vintageRows.map((r) => (
                      <View key={r.vintage} style={[styles.vintageRow, String(r.vintage) === (wine.vintage ?? '') && styles.vintageRowThis]}>
                        <Text style={[styles.vintageCell, styles.vintageColYear]}>{r.vintage}</Text>
                        <Text style={[styles.vintageCell, styles.vintageColScore]}>{r.score != null ? `${r.score}/100` : '—'}</Text>
                        <Text style={[styles.vintageCell, styles.vintageColPrice]}>{r.price != null ? formatCurrency(r.price, userCurrency, { decimals: 0 }) : '—'}</Text>
                      </View>
                    ))}
                    <Text style={styles.vintageFootnote}>Wine-Searcher market value and aggregate critic score, by vintage.</Text>
                  </View>
                ) : (
                  <Text style={styles.vintageEmpty}>Wine-Searcher has no per-vintage listings for this wine.</Text>
                )
              ) : null}
            </View>
          ) : null}

          {/* Serving Suggestions — same gold-bubble layout as the wine card,
              generated on first expand from the confirmed wine details. */}
          {isIntelOnlyFlow ? (
            <View style={styles.vintageSection}>
              <TouchableOpacity style={styles.vintageHeadingRow} onPress={toggleServing} activeOpacity={0.7}>
                <Text style={styles.mapTitle}>Serving Suggestions</Text>
                <Text style={styles.mapChevron}>{servingExpanded ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>
              {servingExpanded ? (
                servingLoading ? (
                  <View style={styles.vintageLoading}>
                    <ActivityIndicator color={colors.gold} />
                    <Text style={styles.vintageLoadingText}>Thinking about how best to serve this…</Text>
                  </View>
                ) : serving ? (
                  <View style={styles.servingBubble}>
                    {serving.temperature ? <Text style={styles.servingLine}><Text style={styles.servingTitle}>Temperature · </Text>{serving.temperature}</Text> : null}
                    {serving.decant ? <Text style={styles.servingLine}><Text style={styles.servingTitle}>Decanting · </Text>{serving.decant}</Text> : null}
                    {serving.glassware ? <Text style={styles.servingLine}><Text style={styles.servingTitle}>Glassware · </Text>{serving.glassware}</Text> : null}
                    {serving.aperitif?.style ? <Text style={styles.servingLine}><Text style={styles.servingTitle}>Drink Before · </Text>{serving.aperitif.style}{serving.aperitif.reason ? ` — ${serving.aperitif.reason}` : ''}</Text> : null}
                    {serving.digestif?.style ? <Text style={styles.servingLine}><Text style={styles.servingTitle}>Drink After · </Text>{serving.digestif.style}{serving.digestif.reason ? ` — ${serving.digestif.reason}` : ''}</Text> : null}
                  </View>
                ) : (
                  <Text style={styles.vintageEmpty}>Couldn't load serving suggestions — tap the header to try again.</Text>
                )
              ) : null}
            </View>
          ) : null}

          {/* Chef Inspired Recipe Pairings — opens the recipe-requirements flow
              (moved up from the action buttons at the foot of the page). */}
          {isIntelOnlyFlow ? (
            <View style={styles.vintageSection}>
              <TouchableOpacity style={styles.vintageHeadingRow} onPress={handleChefPairing} activeOpacity={0.7}>
                <Text style={styles.mapTitle}>Chef Inspired Recipe Pairings</Text>
                <Text style={styles.mapChevron}>›</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* The Inside Line — the "sommelier best friend" verdict: how this
              vintage actually fared and how this producer stacked up against its
              peers that year. Real in-the-know context, not a dictionary entry. */}
          {(hasRealInsiderNote(intel.insiderNote) || isIntelOnlyFlow) ? (
            <View style={styles.section}>
              <Text style={styles.insiderTitle}>The Inside Line</Text>
              {/* While the note is still being generated the body reads
                  "Generating…" — never the jokey no-note placeholder. */}
              <Text style={styles.insiderBody}>{hasRealInsiderNote(intel.insiderNote) ? intel.insiderNote?.trim() : 'Generating…'}</Text>
              {isIntelOnlyFlow ? (
                <TouchableOpacity onPress={handleDiveDeeper} activeOpacity={0.7}>
                  <Text style={styles.diveDeeperLink}>Dive deeper into this wine →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {/* Where this wine sits in the producer's range — the context most
              wine apps don't offer. Wine Intel card only (needs a live lookup). */}
          {isIntelOnlyFlow && (producerRangeLoading || rangeWines.length > 0) ? (
            <View style={styles.section}>
              <Text style={styles.rangeTitle}>The {wine.producer} range</Text>
              {rangeWines.some((rw) => !rw.isThis) ? (
                <Text style={styles.rangeHint}>Tap a wine for its inside line</Text>
              ) : null}
              {producerRange ? (
                <>
                  {rangeWines.map((rw, i) => (
                    // The current wine — and a consolidated entry-level line — aren't
                    // tappable (there's no single inside line for a group of wines).
                    <TouchableOpacity key={`${rw.wineName}-${i}`} style={[styles.rangeRow, rw.isThis && styles.rangeRowThis]} onPress={() => { setRangeNoteWine(rw.wineName); setRangeNoteTier(rw.tier ?? null); }} activeOpacity={(rw.isThis || rw.grouped) ? 1 : 0.7} disabled={rw.isThis || rw.grouped}>
                      <View style={styles.rangeRowMain}>
                        <Text style={[styles.rangeMarker, !rw.isThis && styles.rangeMarkerHidden]}>▸</Text>
                        <Text style={[styles.rangeName, rw.isThis && styles.rangeNameThis]} numberOfLines={rw.grouped ? 4 : 2}>{rw.wineName}</Text>
                      </View>
                      <View style={styles.rangeRight}>
                        <Text style={[styles.rangeBand, rw.isThis && styles.rangeBandThis]}>{currencySymbol(userCurrency).repeat(rw.band)}</Text>
                        {rw.tier ? <Text style={styles.rangeTier}>{rw.tier}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                  {producerRange.summary ? <Text style={styles.rangeSummary}>{producerRange.summary}</Text> : null}
                </>
              ) : (
                <View style={styles.rangeLoading}>
                  <ActivityIndicator color={colors.gold} />
                  <Text style={styles.rangeLoadingText}>Mapping the range…</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Inside-line note for a tapped range wine. */}
          <RangeWineNoteSheet
            producer={wine.producer}
            wineName={rangeNoteWine}
            region={wine.region}
            tier={rangeNoteTier}
            visible={!!rangeNoteWine}
            onClose={() => setRangeNoteWine(null)}
          />
        </>
      )}

      {!isAddFlow && !isIntelOnlyFlow && (
        <View style={styles.section}>
          <View style={styles.communityRow}>
            <Text style={styles.communityLabel}>Community notes on this wine</Text>
            <Text style={styles.communityComingSoon}>coming soon</Text>
          </View>
          <Text style={styles.communityCaption}>See what other Vinster users have noted about this wine.</Text>
        </View>
      )}

      {isIntelOnlyFlow ? (
        // Wine Intel saves from the card's own "Save to Your Cellar" button.
        <TouchableOpacity style={styles.discardButton} onPress={() => router.dismissTo(backTo ? (decodeURIComponent(backTo) as any) : '/(tabs)/scan')}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
      ) : (
        <>
          {/* This is the dedicated Add-to-Cellar flow (Cellar → Add Wine),
              a committed action — so only the primary Add to Cellar button
              shows. Review-only capture has its own entry point and isn't
              offered here. */}
          <View style={styles.actionStack}>
            <TouchableOpacity
              style={styles.primaryAddBtn}
              onPress={() => setAddingToCellar(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryAddBtnText}>Add to Cellar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.discardButton} onPress={() => { setPendingStorageLocationId(null); router.replace('/(tabs)/cellar'); }}>
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={addingToCellar} transparent animationType="slide">
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{context === 'add-location' ? 'Add to Location' : 'Add to Cellar'}</Text>
            {/* Full identity — producer · wine name · appellation/region, country · vintage. */}
            <Text style={styles.modalWine}>{formatWineTitle({ producer: wine.producer, wineName: wine.wineName, region: regionWithCountry(wine.region), vintage: wine.vintage })}</Text>
            <AddingToCellarLine
              fixed={context === 'add-location'}
              onSwitch={() => { setSelectedRackId(null); setSelectedLocationId(null); }}
            />

            {/* Destination picker: hidden only when we're actually filing into a
                home storage location (context gate), so a stale
                pendingStorageLocationId can never hide it on a normal add. */}
            {context !== 'add-location' && (
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
                    <Text style={[styles.storageChipText, styles.storageChipNewText, selectedRackId === '__new__' && styles.storageChipTextActive]}>+ New Location</Text>
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

              </>
            )}

            {/* Home storage location: destination is fixed (the location), but a
                bottle count still matters — e.g. photographing a whole case. */}
            {context === 'add-location' && (
              <>
                <Text style={[styles.modalLabel, styles.modalLabelGold]}>Bottle Size</Text>
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

                <Text style={[styles.modalLabel, styles.modalLabelGold]}>Number of Bottles</Text>
                <TextInput
                  style={styles.countInput}
                  value={bottleCount ? String(bottleCount) : ''}
                  onChangeText={(t) => {
                    const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
                    setBottleCount(Number.isNaN(n) ? 0 : n);
                  }}
                  placeholder="1"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="number-pad"
                />

                {pendingCaseId ? (
                  <Text style={styles.caseAddingNote}>Adding to your open case.</Text>
                ) : (
                  <>
                    <Text style={[styles.modalLabel, styles.modalLabelGold]}>How Is This Wine Packaged</Text>
                    <TouchableOpacity
                      style={[styles.pkgBubble, storageKind === 'loose' && styles.pkgBubbleActive]}
                      onPress={() => { setStorageKind('loose'); setExistingCaseId(null); setCaseName(''); setCaseNote(''); }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.pkgBubbleText, storageKind === 'loose' && styles.pkgBubbleTextActive]}>Loose Bottle(s)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pkgBubble, storageKind === 'existing' && styles.pkgBubbleActive]}
                      onPress={openExistingCasePicker}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.pkgBubbleText, storageKind === 'existing' && styles.pkgBubbleTextActive]}>
                        {storageKind === 'existing' && existingCaseId
                          ? `In case: ${locationCases.find((c) => c.id === existingCaseId)?.name ?? 'Case'}`
                          : 'Add to Existing Case'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pkgBubble, storageKind === 'new' && styles.pkgBubbleActive]}
                      onPress={() => { setStorageKind('new'); setExistingCaseId(null); }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.pkgBubbleText, storageKind === 'new' && styles.pkgBubbleTextActive]}>Create New Case</Text>
                    </TouchableOpacity>

                    {storageKind === 'new' && (
                      <>
                        <Text style={styles.modalLabel}>Case name <Text style={styles.modalLabelHint}>(up to 12 characters)</Text></Text>
                        <TextInput
                          style={styles.caseInput}
                          value={caseName}
                          onChangeText={setCaseName}
                          placeholder="e.g. Rhône reds"
                          placeholderTextColor={colors.textSubtle}
                          maxLength={12}
                        />
                        <Text style={styles.modalLabel}>Note <Text style={styles.modalLabelHint}>(optional)</Text></Text>
                        <View style={styles.caseNoteRow}>
                          <TextInput
                            style={[styles.caseInput, styles.caseNoteInput]}
                            value={caseNote}
                            onChangeText={setCaseNote}
                            placeholder="Ie. in the back next to the Petrus"
                            placeholderTextColor={colors.textSubtle}
                            multiline
                          />
                          <MicButton value={caseNote} onChangeText={setCaseNote} onClear={() => setCaseNote('')} domain="note" />
                        </View>
                      </>
                    )}
                  </>
                )}
              </>
            )}

            <Text style={[styles.modalLabel, styles.modalLabelGold]}>Estimated Purchase Price <Text style={styles.modalLabelHint}>(adjust for accuracy)</Text></Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>{currencySymbol(userCurrency)}</Text>
              <TextInput
                style={styles.priceInput}
                value={purchasePrice}
                onChangeText={(t) => { setPurchasePrice(t); setPurchasePriceUserEdited(true); }}
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
                    ? 'Save & Add New Location'
                    : selectedRackId
                      ? `Save & Place in ${racks.find((r) => r.id === selectedRackId)?.name ?? 'Rack'}`
                      : selectedLocationId
                        ? `Save to ${cellarLocations.find((l) => l.id === selectedLocationId)?.name ?? 'Location'}`
                        : context === 'add-location'
                          ? 'Save to Location'
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
              {openField === 'bottle' ? 'Bottle size' : 'Number of bottles'}
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

    {/* Off-screen branded card for the Share button — mounted only while a
        share is in flight, captured by react-native-view-shot. */}
    {intelSharePayload && (
      <View style={styles.shareCardWrap} pointerEvents="none">
        <WineIntelShareCard ref={intelShareRef} {...intelSharePayload} />
      </View>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  // "/75cl" after a value: same size and font as the figure, in white.
  per75: { color: colors.text },
  // A price reads white like the rest of the card's figures (gold is kept for
  // comparisons such as "+12% vs market").
  marketValue: { color: colors.text },
  container: { flex: 1, backgroundColor: colors.background },
  // Off-screen host for the share card — positioned far off-canvas so it renders
  // for the captureRef snapshot but never appears on screen.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: fonts.bodyRegular, fontSize: 16 },
  linkText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, marginTop: spacing.md },
  backRow: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm, alignSelf: 'flex-start' },
  backLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },

  scanAgainText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Stacked top-right actions (Export, then Edit / Scan Again), same gold font.
  topRightActions: { position: 'absolute', top: 56, right: spacing.xl, zIndex: 10, alignItems: 'flex-end', gap: spacing.xs },

  pageTitle: { fontSize: 26, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm, marginTop: spacing.xs },
  // No bottom border now — the stats bar (moved below this block) provides the
  // separator above Vinster's Note / Map.
  headerBlock: {},
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.sm },
  // Framed label picture — the photo sits in a cream mat with a subtle lift,
  // exactly like the restaurant-review photo (LabelThumb), integrated beside the
  // wine identity in the header row.
  heroFrame: { backgroundColor: colors.cream, padding: 5, borderRadius: 12, marginRight: spacing.md, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 3 },
  heroImage: { width: 120, aspectRatio: 3 / 4, borderRadius: 7, backgroundColor: colors.surface },
  heroPlaceholderBig: { width: 200, height: 260, borderRadius: 6, backgroundColor: '#3E2120', alignItems: 'center', justifyContent: 'center', padding: 14, gap: 6, borderWidth: 1, borderColor: 'rgba(224,184,74,0.5)' },
  heroPlaceholder: { backgroundColor: '#3E2120', alignItems: 'center', justifyContent: 'center', padding: 8, gap: 4, borderWidth: 1, borderColor: 'rgba(224,184,74,0.5)' },
  heroPhProducer: { fontFamily: fonts.headingBold, fontSize: 13, color: colors.gold, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.6 },
  heroPhRule: { width: 28, height: 1, backgroundColor: 'rgba(224,184,74,0.6)' },
  heroPhName: { fontFamily: fonts.headingItalic, fontSize: 12.5, color: colors.text, textAlign: 'center' },
  heroPhVintage: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold },
  // Generating-intel screen: full-screen container + a larger label thumbnail.
  genContainer: { flex: 1, backgroundColor: colors.background },
  genThumb: { width: 200, aspectRatio: 3 / 4, borderRadius: 12, backgroundColor: colors.surface },
  headerText: { flex: 1 },
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
  vintagePromptInput: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, fontSize: 22, fontFamily: fonts.bodyBold, color: colors.text, backgroundColor: colors.surface, textAlign: 'center', letterSpacing: 3, marginBottom: spacing.sm },
  candConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  candConfirmBtnDisabled: { opacity: 0.4 },
  candConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  candCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  candCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },

  section: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Vinster's Note + Map combined block — tighter than a full section, with a
  // single bottom border (the separator before The Inside Line) and no divider
  // between the note and the map.
  // Note/Map + the Vintage & Market Comparison read as one group — no separator
  // line between them (the comparison's own bottom border closes the group).
  noteMapSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  // Vinster's Note beside Vinster's Map — centred as a pair with an indent
  // between them; text baselines aligned so both titles sit on one line.
  noteMapHeadingRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: spacing.xl, flexWrap: 'wrap' },

  // The "(what's this)" explainer, now shown inline in gold italics below the
  // note when it's expanded instead of behind a link.
  noteExplainer: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold, lineHeight: 19, marginTop: spacing.sm },

  // Inline headline stats bar: Score · Value · Drinking Window, bracketed by
  // full-width rules top and bottom (matches the app's other stats bars).
  // Full-width yellow (gold) rules bracketing the stats bar, edge to edge.
  // Faded gold rule top & bottom of the stats bar (matches the app's stats bars).
  statBarRule: { height: 1, backgroundColor: colors.divider },
  // Subtle separator directly beneath the "Wine Intel" title.
  titleRule: { height: 1, backgroundColor: colors.border },
  // "Edit Wine" modal.
  editWineOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  editWineScroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  editWineSheet: { borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg },
  editWineTitle: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.4, marginBottom: spacing.md },
  editWinePhotoRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  editWineThumb: { width: 84, height: 112, borderRadius: 6, backgroundColor: colors.surface },
  editWineThumbBlank: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderWhite },
  editWineThumbBlankText: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted },
  editWinePhotoBtns: { flex: 1, gap: spacing.sm },
  editWinePhotoBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  editWinePhotoBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  editWineLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: 4 },
  editWineInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  editWineSave: { borderWidth: 1, borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.12)', borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  editWineSaveText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
  editWineCancel: { alignItems: 'center', paddingVertical: spacing.md },
  editWineCancelText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted },
  btnDisabled: { opacity: 0.5 },
  statBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  statBarItem: { alignItems: 'center', flexShrink: 1, paddingHorizontal: 2 },

  statBarValueMuted: { color: colors.textMuted, fontFamily: fonts.bodySemibold },

  // Gold, label-less headline stats bar under the title — tappable figures.
  statBarValueGold: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.gold, letterSpacing: 0.3, textAlign: 'center' },
  statBarSepGold: { fontSize: 26, color: colors.gold, opacity: 0.75 },
  // Caption that marks the stat bar as tappable (Option A). Only on interactive
  // bars — static bars app-wide omit it, keeping the bar's format identical.
  statBarHint: { fontFamily: fonts.bodyItalic, fontSize: 12.5, color: colors.gold, opacity: 0.85, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.sm },

  // Vinster's Vintage & Market Comparison — collapsible section + its table.
  vintageSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  vintageHeadingRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  vintageLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingTop: spacing.md },
  vintageLoadingText: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  vintageEmpty: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingTop: spacing.md },
  vintageTable: { marginTop: spacing.md },
  vintageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  vintageHeadRow: { borderBottomColor: colors.gold },
  vintageRowThis: { backgroundColor: 'rgba(224,184,74,0.10)' },
  vintageCell: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text },
  vintageHeadCell: { fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.6 },
  vintageColYear: { flex: 1 },
  vintageColScore: { flex: 1, textAlign: 'center' },
  vintageColPrice: { flex: 1, textAlign: 'right' },
  vintageFootnote: { fontSize: 11, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  // Serving Suggestions bubble — matches the wine card.
  servingBubble: { backgroundColor: 'rgba(224,184,74,0.06)', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.lg, marginTop: spacing.md },
  servingLine: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 22, marginBottom: spacing.md },
  servingTitle: { fontFamily: fonts.bodySemibold, color: colors.gold },
  marketMissingNote: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.md },

  // "The Inside Line" — sommelier-best-friend commentary. Header matches the
  // producer-range header (rangeTitle) and is gold, per design.
  insiderTitle: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  insiderBody: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 23 },
  // Producer range ladder — entry → flagship, this wine highlighted. Header gold
  // to match The Inside Line above it.
  rangeTitle: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  rangeHint: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.sm },
  rangeLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  rangeLoadingText: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  rangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  rangeRowThis: { backgroundColor: 'rgba(212,176,96,0.10)', borderRadius: 8, paddingHorizontal: spacing.sm, borderBottomColor: 'transparent' },
  rangeRowMain: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.xs },
  rangeMarker: { fontSize: 14, color: colors.gold, width: 14, textAlign: 'center' },
  rangeMarkerHidden: { opacity: 0 },
  rangeName: { flex: 1, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text },
  rangeNameThis: { fontFamily: fonts.bodySemibold, color: colors.gold },
  rangeRight: { alignItems: 'flex-end' },
  rangeBand: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.textMuted, letterSpacing: 1 },
  rangeBandThis: { color: colors.gold },
  rangeTier: { fontSize: 10, fontFamily: fonts.bodyRegular, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },
  rangeSummary: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 21, marginTop: spacing.md },
  // Confirm-first panel (shown before a card when the scan couldn't be verified).
  confirmTitle: { fontSize: 18, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.xs },

  confirmLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  confirmLoadingText: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  confirmRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  confirmRowName: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.text },
  confirmRowMeta: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },

  // Thumbnail-only header on the confirm screen (no wine title).
  confirmThumbRow: { alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.xs },
  // Selected row in the confirm list — subtle gold highlight.
  confirmRowSelected: { backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: spacing.sm },
  confirmRowNameSelected: { color: colors.gold },
  // Regular-size action buttons below the list (Confirm · Search Again · Cancel).
  confirmActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  confirmActionBtn: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center', justifyContent: 'center' },
  confirmActionText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textAlign: 'center' },
  confirmActionGhost: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center', justifyContent: 'center' },
  confirmActionGhostText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.textMuted, textAlign: 'center' },

  // Yellow italic "Dive deeper" link, sits below The Inside Line blurb.
  diveDeeperLink: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, marginTop: spacing.sm },

  tastingNotes: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 22 },

  mapTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text },
  mapChevron: { fontSize: 15, color: colors.gold, fontFamily: fonts.bodySemibold },

  communityRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  communityLabel: { fontSize: 16, fontFamily: fonts.bodySemibold, color: 'rgba(212,176,96,0.45)', letterSpacing: 0.3 },
  communityComingSoon: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textTransform: 'lowercase', letterSpacing: 0.5 },
  communityCaption: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 19 },
  actionStack: { marginHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.sm },
  primaryAddBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  primaryAddBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, letterSpacing: 0.3 },

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
  discardButton: { margin: spacing.xl, alignItems: 'center', paddingVertical: spacing.sm },
  discardText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.xs },
  modalWine: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.lg },
  modalLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  modalLabelGold: { color: colors.gold },
  // Lower-case bracketed hint inside an uppercase label, e.g. "(adjust for accuracy)".
  modalLabelHint: { fontFamily: fonts.bodyItalic, fontSize: 11, color: colors.textMuted, textTransform: 'none', letterSpacing: 0 },
  caseAddingNote: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, marginBottom: spacing.md },
  // Gold "bubble" packaging choices (Loose / Add to Existing / Create New). The
  // selected one fills gold with dark text; the modal's own white Cancel sits at
  // the very bottom of the sheet.
  // White, unfilled by default; the selected one brightens with a subtle white
  // wash (no solid-gold fill) so it reads as "chosen" without the yellow.
  pkgBubble: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.sm + 2, alignItems: 'center', marginBottom: spacing.sm },
  pkgBubbleActive: { backgroundColor: 'rgba(255,255,255,0.16)', borderColor: '#FFFFFF' },
  pkgBubbleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: '#FFFFFF' },
  pkgBubbleTextActive: { color: '#FFFFFF' },

  caseInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, marginBottom: spacing.sm },

  caseNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  caseNoteInput: { flex: 1, minHeight: 44, marginBottom: 0, textAlignVertical: 'top' },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  cancelButton: { alignItems: 'center', marginTop: spacing.md },
  cancelText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  priceCurrency: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.textMuted, marginRight: spacing.xs },
  priceInput: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.sm },
  countInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, marginBottom: spacing.md },
});
