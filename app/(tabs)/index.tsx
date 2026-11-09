import { NAMED_LABELS } from '../../src/components/ExamplePlaceholder';
import { JournalCarousel } from '../../src/components/JournalCarousel';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Image, ActivityIndicator, TextInput, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
// Page scroll from the gesture library, so a picked-up carousel section cancels
// the page scroll instead of fighting it.
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { router, useFocusEffect } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../../src/components/AppAlert';
import { ensureConnectionForUpload } from '../../src/utils/connectionGuard';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HelpTitle } from '../../src/components/HelpTitle';
import { RecentScansCarousel } from '../../src/components/RecentScansCarousel';
import { DrinkNowCarousel } from '../../src/components/DrinkNowCarousel';
import { CellarInsightsCarousel } from '../../src/components/CellarInsightsCarousel';
import { ReorderableSections, mergeSectionOrder, useAutoScrollHost } from '../../src/components/ReorderableSections';
import { HomeVoiceModal } from '../../src/components/HomeVoiceModal';
import { useAuth } from '../../src/hooks/useAuth';
import { useScanStore } from '../../src/stores/scanStore';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { prepareImageBase64, scanLabel, searchWines, fetchAutoLabelUri, type WineSearchResult } from '../../src/api/label';
import { File, Paths } from 'expo-file-system';
import { formatWineTitle } from '../../src/utils/wineTitle';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { tidyWineRegion } from '../../src/utils/regionFormat';
import { generateWineIntel, fetchPricing, fetchVintageComparison, isWineSearcherUnavailable, type VintageComparisonRow } from '../../src/services/pricing';
import { vintageVerdict } from '../../src/utils/wineCardInsights';
import { useCellar } from '../../src/hooks/useCellar';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { wineNameKey } from '../../src/utils/wineIdentity';
import { wineQueryName, wineQueryAltName } from '../../src/utils/wineIdentity';
import { formatCurrency, currencySymbol } from '../../src/constants/currency';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { resolveIntelCurrency } from '../../src/utils/localCurrency';
import { scanHistoryKey } from '../../src/hooks/useScanHistory';
import type { WineDetailsComplete } from '../../src/types/wine';
import { generateVintageVerdict, type VintageVerdictAI } from '../../src/api/wineExtras';
import { colors, spacing } from '../../src/constants/theme';
import { withBordeauxInfo } from '../../src/constants/bordeauxClassification';
import { fonts } from '../../src/constants/fonts';

// Module-level so it survives the Scan tab unmounting/remounting on navigation:
// the welcome overlay shows once per app session (a fresh launch resets it),
// not every time the user returns to the Scan tab.
let welcomeShownThisSession = false;

// "How Scan works" — the help body behind the underlined Scan title, matching
// the other tabs' tappable titles.
// Search & Discover tile images (bundled). The restaurant photo is from Unsplash
// (free licence) — see assets/images/tiles/CREDITS.md.
const SD_LABEL_IMAGE = NAMED_LABELS.denisMortet;
const SD_RESTAURANT_IMAGE: number | null = require('../../assets/images/tiles/restaurant-interior.jpg');
// Light labels only — the Search tile reads best bright (Piper Rare was too dark).
const SD_COLLAGE_IMAGES = [NAMED_LABELS.lynchBages, NAMED_LABELS.tollotBeaut, NAMED_LABELS.donnhoff, NAMED_LABELS.benditoDestino];

// The Home carousels take no props, so memoised copies don't redraw when only
// Home's own state changes (e.g. while a section is being dragged).
const RecentScansMemo = memo(RecentScansCarousel);
const DrinkNowMemo = memo(DrinkNowCarousel);
const CellarInsightsMemo = memo(CellarInsightsCarousel);
const JournalMemo = memo(JournalCarousel);

const HOME_ORDER_KEY = 'home_section_order_v1';
const HOME_SECTION_DEFAULT = ['search', 'scans', 'cellar', 'insights', 'musings'];

const SCAN_HELP = `Expert training + Wine Searcher Market API result in the most comprehensive and customized experience in wine exploration.

Home is your starting point. Scan a label for instant Wine Intel — critic scores, tasting notes, drinking windows and today's value — or scan a wine list for tailored picks from the menu. No label to hand? Search a Wine from Vinster's catalogue. Below, revisit your Recent Scans, see which cellar bottles are drinking now, and catch up on Community Musings.`;

// The Scan landing — the app's home tab. A 2×2 grid of scan actions (each with
// a corner "Upload" button) plus a Search tile, then the Your Lineup Archive
// carousel. The six-tab bar handles all other navigation, so there's no hamburger.
// Dot colour for a wine's colour in the search results: red → wine red, white →
// gold/yellow (as requested), rosé → pink. Unknown → transparent (no dot).
function colourDotColour(c: string | null | undefined): string {
  switch ((c ?? '').toLowerCase()) {
    case 'red': return '#B23A2E';
    case 'white': return '#E0B84A';
    case 'rosé': case 'rose': return '#E39AA6';
    default: return 'transparent';
  }
}

export default function ScanLandingScreen() {
  const { session } = useAuth();
  // Match every other tab page's top spacing so the Vinster mark + title sit at
  // a consistent height across the bottom-nav surfaces.
  const { height } = useWindowDimensions();
  // SET RULE: every tab page's title sits at the SAME height. This must match
  // Review (scan.tsx), Pair (chef.tsx), Cellar, Share and You exactly — the same
  // Math.max(55, height * 0.095) with no per-tab nudges.
  const paddingTop = Math.max(55, height * 0.095);
  const username = (session?.user.user_metadata?.display_name ?? '').trim();
  const { setImage, setWineDetails, setWineDetailsConfirmed, setIntelligence, setError, reset: resetLabelStore } = useLabelStore();
  const { setExtractedWines, setRecommendation } = useScanStore();
  const { preferences } = usePreferences();
  // The user's cellar — search results say when they already own the wine.
  const { wines: cellarWines } = useCellar();
  // The user's reviews — search results say when they've reviewed the wine.
  const { chosenWines } = useChosenWines();

  const [wineSearch, setWineSearch] = useState('');
  // Predictive "Search a Wine" dropdown, powered by the wines_catalog.
  const [searchResults, setSearchResults] = useState<WineSearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchReqRef = useRef(0);
  const skipSearchRef = useRef(false);
  // A wine picked from the dropdown, awaiting only its vintage before intel.
  const [vintageWine, setVintageWine] = useState<WineSearchResult | null>(null);
  const [vintageDraft, setVintageDraft] = useState('');
  // "Compare Vintages" — Vinster's Market & Vintage Comparison for the picked wine.
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareRows, setCompareRows] = useState<VintageComparisonRow[] | null>(null);
  // Wine-Searcher didn't answer (down / daily limit) — distinct from "no data".
  const [compareDown, setCompareDown] = useState(false);
  // "Dive Deeper →" under Vinster's verdict: the full market analysis across
  // the vintages (the same considered verdict the Market tabs give).
  const [deepVerdict, setDeepVerdict] = useState<VintageVerdictAI | null>(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepTried, setDeepTried] = useState(false);
  const deepReqRef = useRef(0);
  const [generatingIntel, setGeneratingIntel] = useState(false);
  const [scanningLabel, setScanningLabel] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [hardGate, setHardGate] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  // The "Search a Wine" tile opens the predictive typeahead in a prompt.
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  // The Scan tab always shows its normal compact header. On the first landing
  // after opening the app, a welcome overlay (logo · "Real Wine Experience, AI Delivered" ·
  // Welcome) appears over it, dismissed with "Continue". Shown once per app
  // session (the ref resets on a fresh launch).
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  useFocusEffect(useCallback(() => {
    if (!welcomeShownThisSession) { welcomeShownThisSession = true; setWelcomeOpen(true); }
  }, []));

  // Soft gate: guest sees the prompt but may Continue (scanning is guest-open).
  function requireAuth(action: () => void) {
    if (!session) { setHardGate(false); pendingActionRef.current = action; setSignInPromptVisible(true); return; }
    action();
  }
  // Hard gate: account-only (revisiting saved history) — no "continue" escape.
  function requireAccount(action: () => void) {
    if (!session) { setHardGate(true); pendingActionRef.current = null; setSignInPromptVisible(true); return; }
    action();
  }
  function dismissSignInPrompt() { setSignInPromptVisible(false); setHardGate(false); pendingActionRef.current = null; }
  function continueWithoutAccount() {
    setSignInPromptVisible(false);
    const action = pendingActionRef.current; pendingActionRef.current = null; action?.();
  }

  // Revisit the last restaurant-list recommendation (long-press Scan a Wine List).
  async function handleViewLastListResult() {
    try {
      const raw = await AsyncStorage.getItem(scanHistoryKey(session?.user.id));
      const items = raw ? JSON.parse(raw) : [];
      if (!items.length) { showAlert({ title: 'No previous search', body: 'Once you scan a wine list, you can come back here to revisit it.' }); return; }
      const last = items[0];
      setExtractedWines(last.extractedWines);
      setRecommendation(last.recommendation);
      const params = new URLSearchParams({ fromHistory: 'true' });
      if (last.savedAt) params.set('date', last.savedAt);
      if (last.restaurantName) params.set('restaurant', last.restaurantName);
      if (last.city) params.set('city', last.city);
      if (last.sessionId) params.set('sessionId', last.sessionId);
      router.push(`/scan/results?${params.toString()}`);
    } catch {
      showAlert({ title: 'No previous search', body: 'Once you scan a wine list, you can come back here to revisit it.' });
    }
  }

  // Re-hydrate the transient label store from the persisted snapshot, then open
  // the last intel card (long-press Scan a Wine Label).
  function handleViewLastIntel() {
    const { wine, intel } = useLastIntelStore.getState();
    if (!wine || !intel) { showAlert({ title: 'No previous result', body: 'Once you generate wine intel from a label, you can come back here to revisit it.' }); return; }
    const ls = useLabelStore.getState();
    ls.setWineDetailsConfirmed(wine);
    ls.setIntelligence(intel);
    router.push('/label/results?context=intel');
  }

  // Predictive dropdown — query the catalog (debounced, from 3 chars). Ignores
  // stale responses and skips the search that follows a pick.
  useEffect(() => {
    if (skipSearchRef.current) { skipSearchRef.current = false; setSearchLoading(false); setSearchOpen(false); return; }
    const q = wineSearch.trim();
    if (q.length < 3) { setSearchResults([]); setSearchLoading(false); setSearchOpen(false); return; }
    setSearchLoading(true);
    setSearchOpen(true);
    const id = ++searchReqRef.current;
    const t = setTimeout(async () => {
      try {
        const r = await searchWines(q);
        if (id !== searchReqRef.current) return;
        setSearchResults(r);
      } catch {
        if (id === searchReqRef.current) setSearchResults([]);
      } finally {
        if (id === searchReqRef.current) setSearchLoading(false);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [wineSearch]);

  // Pick a wine from the dropdown. If the search query already carried a vintage
  // (e.g. "Forts de Latour 2009"), apply it and go straight to the intel card —
  // don't re-ask. Otherwise open the vintage prompt so the user can specify one.
  function selectWine(wine: WineSearchResult) {
    requireAuth(() => {
      skipSearchRef.current = true;
      setSearchOpen(false);
      setSearchModalOpen(false);
      setSearchResults([]);
      setWineSearch('');
      if (wine.vintage) {
        void generateSelectedIntel(wine.vintage, wine);
      } else {
        setVintageDraft('');
        setVintageWine(wine);
      }
    });
  }

  // Escape hatch: a wine the catalog doesn't know → the manual Confirm flow,
  // seeded with the typed text.
  function useTypedWine() {
    const q = wineSearch.trim();
    if (!q) return;
    requireAuth(() => {
      skipSearchRef.current = true;
      setSearchOpen(false);
      setSearchModalOpen(false);
      resetLabelStore();
      setWineSearch('');
      router.push(`/label/confirm?manual=1&context=intel&seed=${encodeURIComponent(q)}&backTo=${encodeURIComponent('/(tabs)')}`);
    });
  }

  // Best-effort label thumbnail for the intel card (mirrors confirm's ensureAutoLabel).
  async function fetchLabelThumb(producer: string, wineName: string | null) {
    try {
      if (useLabelStore.getState().imageUri) return;
      if (!producer.trim()) return;
      const uri = await fetchAutoLabelUri(producer, wineName);
      if (uri && !useLabelStore.getState().imageUri) useLabelStore.getState().setImageUri(uri);
    } catch { /* no thumbnail is fine */ }
  }

  // Vintage entered (or carried in from the search query) → generate intel
  // straight to the card, with a label thumbnail. `wineArg` lets selectWine pass
  // the picked wine directly, bypassing the vintage-prompt state.
  // Compare Vintages: the same per-vintage Wine-Searcher table as the wine card's
  // Market tab, in a pop-up. Tapping a vintage generates its intel.
  // "You have X bottles of this wine in your cellar" for a search result: same
  // wine (producer + name), and the same vintage when one was typed.
  function cellarHoldings(r: WineSearchResult): { n: number; id: string } | null {
    const key = wineNameKey(r.producer, r.wineName);
    if (!key) return null;
    const v = (r.vintage ?? '').trim();
    const matches = cellarWines.filter((w) => !w.archived_at && !w.is_wishlist && (w.quantity ?? 0) > 0
      && wineNameKey(w.producer, w.wine_name) === key && (!v || (w.vintage ?? '').trim() === v));
    if (!matches.length) return null;
    const n = matches.reduce((sum, w) => sum + (w.quantity ?? 0), 0);
    const top = [...matches].sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0))[0];
    return { n, id: top.id };
  }

  // "You reviewed this wine on dd/mm/yy" — their most recent written review of
  // the same wine (and vintage, when one was typed).
  function reviewHolding(r: WineSearchResult): { id: string; date: string } | null {
    const key = wineNameKey(r.producer, r.wineName);
    if (!key) return null;
    const v = (r.vintage ?? '').trim();
    const mine = chosenWines.filter((c) => !c.wishlist && !c.review_dismissed
      && (!!(c.tasting_note && c.tasting_note.trim()) || c.user_score != null)
      && wineNameKey(c.producer, c.wine_name) === key && (!v || String(c.vintage ?? '').trim() === v));
    if (!mine.length) return null;
    const when = (c: typeof mine[number]) => new Date(c.reviewed_at ?? c.chosen_at).getTime();
    const latest = [...mine].sort((a, b) => when(b) - when(a))[0];
    const d = new Date(latest.reviewed_at ?? latest.chosen_at);
    return { id: latest.id, date: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) };
  }

  async function diveDeeper(bestValueVintage: number | null, total: number) {
    const wine = vintageWine;
    if (!wine || !compareRows?.length || deepLoading) return;
    const req = ++deepReqRef.current;
    setDeepLoading(true);
    setDeepTried(true);
    try {
      const res = await generateVintageVerdict(
        { producer: wine.producer, wine_name: wine.wineName, region: wine.region, vintage: null, grape_variety: (wine as any).grape ?? null, style: (wine as any).style ?? null } as any,
        { rows: compareRows, currency: preferences?.defaultCurrency ?? 'GBP', qualityRank: null, valueRank: null, total, bestValueVintage, window: null, rarity: null, scope: 'range' },
      );
      if (req === deepReqRef.current) setDeepVerdict(res);
    } catch {
      if (req === deepReqRef.current) setDeepVerdict(null);
    } finally {
      if (req === deepReqRef.current) setDeepLoading(false);
    }
  }

  async function openCompareVintages() {
    const wine = vintageWine;
    if (!wine) return;
    setCompareOpen(true);
    setCompareRows(null);
    setCompareDown(false);
    setDeepVerdict(null);
    setDeepTried(false);
    setDeepLoading(false);
    deepReqRef.current += 1; // drop any analysis still on its way for the last wine
    setCompareLoading(true);
    try {
      const rows = await fetchVintageComparison(wineQueryName(wine.producer, wine.wineName), preferences?.defaultCurrency ?? 'GBP', null, wineQueryAltName(wine.producer, wine.wineName, wine.region));
      setCompareRows(rows);
    } catch (e) {
      setCompareDown(isWineSearcherUnavailable(e));
      setCompareRows([]);
    } finally {
      setCompareLoading(false);
    }
  }

  async function generateSelectedIntel(vintage: string, wineArg?: WineSearchResult | null) {
    const wine = wineArg ?? vintageWine;
    if (!wine) return;
    setVintageWine(null);
    resetLabelStore();
    const confirmed: WineDetailsComplete = withBordeauxInfo({
      producer: wine.producer,
      region: wine.region ?? '',
      wineName: wine.wineName,
      vintage: vintage.trim() || 'NV',
      style: wine.style ?? null,
      grape: wine.grape ?? null,
      bottleSizeMl: null,
      quantity: 1,
    });
    setWineDetailsConfirmed(confirmed);
    setIntelligence(null);
    // Fetch a web label in the background so the shell gets a header image; it
    // sets the store's imageUri when it lands. Navigate immediately.
    void fetchLabelThumb(confirmed.producer, confirmed.wineName);
    // gen=1: build the intel ON the results screen (instant shell + swirls).
    // confirmed=1: the user picked this exact wine, so don't re-ask "which wine".
    // noRecent=1: Manually Search isn't a tile scan — keep it out of Recent Scans.
    router.push(`/label/results?context=intel&fresh=1&confirmed=1&gen=1&noRecent=1&backTo=${encodeURIComponent('/(tabs)')}`);
  }

  // "Scan a Lineup" now offers two destinations: add the bottles to the cellar
  // (scan-lineup), or archive them as a drunk lineup (archive-night).
  function handleScanLineup() {
    requireAuth(() => showAlert({
      title: 'Scan a Lineup',
      body: 'What would you like to do with this lineup?',
      buttons: [
        { text: 'Add a lineup to Your Cellar', onPress: () => router.push('/cellar/scan-lineup' as any) },
        { text: 'Archive a Lineup', onPress: () => router.push('/cellar/archive-night') },
        { text: 'Cancel', style: 'cancel' },
      ],
    }));
  }
  // "manual input" under Search a Wine — enter a wine by hand (no typeahead) via
  // the manual confirm screen.
  function handleManualInput() {
    requireAuth(() => {
      resetLabelStore();
      router.push(`/label/confirm?manual=1&mode=input&context=intel&backTo=${encodeURIComponent('/(tabs)')}`);
    });
  }
  // "upload instead" — same two destinations, but each opens the library picker
  // straight away (?upload=1) rather than the in-app camera.
  function handleUploadLineup() {
    requireAuth(() => showAlert({
      title: 'Upload a Lineup',
      body: 'What would you like to do with this lineup?',
      buttons: [
        { text: 'Add a lineup to Your Cellar', onPress: () => router.push('/cellar/scan-lineup?upload=1' as any) },
        { text: 'Archive a Lineup', onPress: () => router.push('/cellar/archive-night?upload=1') },
        { text: 'Cancel', style: 'cancel' },
      ],
    }));
  }

  async function handleUploadLabel() {
    if (!(await ensureMediaPermission('library'))) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    await scanLabelFromUri(result.assets[0].uri);
  }

  // Read a label photo and open its Wine Intel — shared by "upload instead" and
  // images shared into Vinster from Photos / a screenshot (share sheet).
  async function scanLabelFromUri(uri: string) {
    const backTo = encodeURIComponent('/(tabs)');
    if (!(await ensureConnectionForUpload())) return;
    setScanningLabel(true);
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      const confirmed: WineDetailsComplete = {
        producer: (details.producer ?? '').trim(),
        region: (details.region ?? '').trim(),
        wineName: (details.wineName ?? '').trim() || null,
        vintage: (details.vintage ?? '').trim(),
        style: (details.style ?? '').trim() || null,
        grape: (details.grape ?? '').trim() || null,
        bottleSizeMl: details.bottleSizeMl ?? null,
        quantity: details.quantity ?? 1,
      };
      setWineDetailsConfirmed(confirmed);
      const currency = await resolveIntelCurrency(preferences?.defaultCurrency);
      const queryName = [confirmed.producer, confirmed.wineName].filter(Boolean).join(' ').trim() || (confirmed.wineName ?? '');
      const vintageNum = confirmed.vintage && confirmed.vintage !== 'NV' ? Number(confirmed.vintage) : null;
      let verified = false;
      try {
        const pricing = await fetchPricing(queryName, Number.isFinite(vintageNum) ? vintageNum : null, currency);
        verified = pricing.source === 'wine-searcher' && pricing.matched !== false;
      } catch { verified = false; }

      if (!verified) {
        setIntelligence(null);
        setScanningLabel(false);
        router.push(`/label/results?context=intel&via=upload&fresh=1&confirm=1&backTo=${backTo}`);
        return;
      }

      // Verified — build the intel ON the results screen (instant shell + swirls).
      // A label upload IS a tile scan, so it records to Recent Scans (no noRecent).
      setIntelligence(null);
      setScanningLabel(false);
      router.push(`/label/results?context=intel&via=upload&fresh=1&gen=1&backTo=${backTo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
      setScanningLabel(false);
      router.push(`/label/confirm?context=intel&via=upload&backTo=${backTo}`);
    }
  }

  // A label photo or screenshot shared to Vinster from the phone's share sheet:
  // generate its Wine Intel straight away (same path as "upload instead").
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const sharedHandledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hasShareIntent) return;
    const file = shareIntent?.files?.find((f) => (f.mimeType ?? '').startsWith('image/')) ?? shareIntent?.files?.[0];
    const path = file?.path;
    resetShareIntent();
    if (!path || sharedHandledRef.current === path) return;
    sharedHandledRef.current = path;
    const uri = path.startsWith('file://') || path.startsWith('content://') ? path : `file://${path}`;
    void scanLabelFromUri(uri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShareIntent, shareIntent]);

  // User-arranged order of the Home carousels (saved per device).
  const [homeOrder, setHomeOrder] = useState<string[]>(HOME_SECTION_DEFAULT);
  const [scrollLocked, setScrollLocked] = useState(false);
  // Lets a carousel drag auto-scroll the page near the screen edges.
  const homeScroll = useAutoScrollHost();
  useEffect(() => {
    AsyncStorage.getItem(HOME_ORDER_KEY)
      .then((raw) => { if (raw) setHomeOrder(mergeSectionOrder(JSON.parse(raw), HOME_SECTION_DEFAULT)); })
      .catch(() => {});
  }, []);
  function saveHomeOrder(next: string[]) {
    setHomeOrder(next);
    AsyncStorage.setItem(HOME_ORDER_KEY, JSON.stringify(next)).catch(() => {});
  }

  return (
    <TabSwipeView style={styles.container}>
    <GHScrollView {...homeScroll.scrollProps} style={{ flex: 1 }} scrollEnabled={!scrollLocked} contentContainerStyle={[styles.scroll, { paddingTop }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      {/* This scroll has paddingHorizontal (other tabs pad per-section), which
          would push the mark inward — pull it back to the screen edge so the V
          sits where it does on every other tab. */}
      <View style={styles.headerBleed}><VinsterHeader /></View>
      <View style={styles.titleRow}>
        <HelpTitle label="Home" title="How Home works" body={SCAN_HELP} textStyle={styles.appName} />
        {/* Voice Command — top-right text link (matches the Reviews "Add +").
            Discovery only (recommend / consult / wine intel). */}
        <TouchableOpacity style={styles.voiceLink} onPress={() => setVoiceOpen(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={styles.voiceLinkText}>Ask Vinster</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.homeSubtitle}>The launchpad into your Vinous endeavours</Text>
      <View style={styles.blurbSeparator} />

      {/* Home carousels — each title has a grip at its left indent; hold and drag
          to reorder. The order is saved on this device. */}
      <ReorderableSections
        order={homeOrder}
        onReorder={saveHomeOrder}
        onDragActive={(on) => setScrollLocked(on)}
        autoScroll={homeScroll.host}
        headerStyle={styles.carouselHeader}
        separatorStyle={styles.sectionSeparator}
        sections={[
          {
            key: 'search',
            title: 'Search & Discover',
            // The three ways in. Scan tiles have a small "Upload" button in the corner.
            content: (
                <View style={styles.carouselBleed}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sdCarousel}>
                    {/* Search a Wine → the typeahead prompt */}
                    <View style={styles.sdCard}>
                      <TouchableOpacity style={styles.sdThumb} onPress={() => setSearchModalOpen(true)} activeOpacity={0.85}>
                        <View style={styles.sdCollage}>
                          {SD_COLLAGE_IMAGES.map((img, i) => (
                            <Image key={i} source={img} style={styles.sdCollageCell} resizeMode="cover" />
                          ))}
                        </View>
                        <View style={styles.sdTitleWrap} pointerEvents="none"><View style={styles.sdTitleBand}><Text style={styles.sdTitle} numberOfLines={2} allowFontScaling={false}>Search a Wine</Text></View></View>
                      </TouchableOpacity>
                      <Text style={styles.sdName} numberOfLines={1} allowFontScaling={false}>Generate Wine Intel</Text>
                      <Text style={styles.sdStamp} numberOfLines={1} allowFontScaling={false}>Powered by Wine Searcher</Text>
                    </View>

                    {/* Scan a Label → intel */}
                    <View style={styles.sdCard}>
                      <TouchableOpacity
                        style={styles.sdThumb}
                        onPress={() => requireAuth(() => router.push(`/label/camera?context=intel&backTo=${encodeURIComponent('/(tabs)')}`))}
                        onLongPress={() => requireAccount(handleViewLastIntel)}
                        activeOpacity={0.85}
                      >
                        <Image source={SD_LABEL_IMAGE} style={styles.sdImage} resizeMode="cover" />
                        <View style={styles.sdTitleWrap} pointerEvents="none"><View style={styles.sdTitleBand}><Text style={styles.sdTitle} numberOfLines={2} allowFontScaling={false}>Scan a Label</Text></View></View>
                        <TouchableOpacity style={styles.sdUpload} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Upload a photo instead" onPress={() => requireAuth(handleUploadLabel)} activeOpacity={0.7}>
                          <Feather name="upload" size={12} color="#FFFFFF" allowFontScaling={false} />
                          <Text style={styles.sdUploadText} allowFontScaling={false}>Upload</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                      <Text style={styles.sdName} numberOfLines={1} allowFontScaling={false}>Generate Wine Intel</Text>
                      <Text style={styles.sdStamp} numberOfLines={1} allowFontScaling={false}>Powered by Wine Searcher</Text>
                    </View>

                    {/* Scan a Wine List → recommendations */}
                    <View style={styles.sdCard}>
                      <TouchableOpacity
                        style={styles.sdThumb}
                        onPress={() => router.push('/scan/wine-list')}
                        onLongPress={() => requireAccount(handleViewLastListResult)}
                        activeOpacity={0.85}
                      >
                        {SD_RESTAURANT_IMAGE ? (
                          <Image source={SD_RESTAURANT_IMAGE} style={styles.sdImage} resizeMode="cover" />
                        ) : (
                          <View style={[styles.sdImage, styles.sdFallback]}>
                            <Ionicons name="restaurant-outline" size={40} color="rgba(255,255,255,0.55)" allowFontScaling={false} />
                          </View>
                        )}
                        <View style={styles.sdTitleWrap} pointerEvents="none"><View style={styles.sdTitleBand}><Text style={styles.sdTitle} numberOfLines={2} allowFontScaling={false}>Scan a Wine List</Text></View></View>
                        <TouchableOpacity style={styles.sdUpload} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Upload a photo instead" onPress={() => router.push('/scan/wine-list?upload=1')} activeOpacity={0.7}>
                          <Feather name="upload" size={12} color="#FFFFFF" allowFontScaling={false} />
                          <Text style={styles.sdUploadText} allowFontScaling={false}>Upload</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                      <Text style={styles.sdName} numberOfLines={1} allowFontScaling={false}>Restaurant Wine Lists</Text>
                      <Text style={styles.sdStamp} numberOfLines={1} allowFontScaling={false}>Tailored bottle picks</Text>
                    </View>
                  </ScrollView>
                </View>
            ),
          },
          // Recent Scans — mixed label + list scans, most recent first.
          { key: 'scans', title: 'Label Scan Library', content: <View style={styles.carouselBleed}><RecentScansMemo /></View> },
          // Drink Now — cellar bottles at last call, most urgent first.
          { key: 'cellar', title: 'Home Cellar Insights', content: <View style={styles.carouselBleed}><DrinkNowMemo /></View> },
          // Running-low bottles to replenish, then facts buried in the data.
          { key: 'insights', title: "Vinster's Insights", content: <View style={styles.carouselBleed}><CellarInsightsMemo /></View> },
          // The Journal entries (the website blog feed, each card opening its post).
          { key: 'musings', title: 'Community Musings', content: <View style={styles.carouselBleed}><JournalMemo /></View> },
        ]}
      />

      {/* Dictate-to-search is shelved for now: on-device speech-to-text mangles
          foreign/proper wine names (e.g. "Heidsieck" → "Isaac"), which then risks
          a hallucinated match. Re-enable once the search is dictation-hardened. */}

      <Modal visible={scanningLabel} transparent animationType="fade">
        <View style={styles.scanningOverlay}>
          <View style={styles.scanningSheet}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={styles.scanningTitle}>Reading your wine label…</Text>
            <Text style={styles.scanningBody}>Vinster is identifying the producer, region and vintage from your photo.</Text>
          </View>
        </View>
      </Modal>

      {/* "What's the Vintage?" — the only thing Vinster needs after a pick. */}
      <Modal visible={!!vintageWine && !compareOpen} transparent animationType="fade" onRequestClose={() => setVintageWine(null)}>
        <View style={styles.vintageOverlay}>
          <View style={styles.vintageSheet}>
            <Text style={styles.vintageWine} numberOfLines={2}>
              {vintageWine ? formatWineTitle({ producer: vintageWine.producer, wineName: vintageWine.wineName, region: vintageWine.region }) : ''}
            </Text>
            <Text style={styles.vintageTitle}>Input Vintage or Compare Vintage Data</Text>
            <TextInput
              style={styles.vintageInput}
              value={vintageDraft}
              onChangeText={(t) => setVintageDraft(t.replace(/[^0-9a-zA-Z ]/g, '').slice(0, 12))}
              placeholder="e.g. 2019 or NV"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              autoFocus
              onSubmitEditing={() => generateSelectedIntel(/^(nv|non[\s-]?vintage)$/i.test(vintageDraft.trim()) ? 'NV' : vintageDraft)}
            />
            <TouchableOpacity style={styles.vintageBtn} onPress={() => generateSelectedIntel(/^(nv|non[\s-]?vintage)$/i.test(vintageDraft.trim()) ? 'NV' : vintageDraft)} activeOpacity={0.8}>
              <Text style={styles.vintageBtnText}>Generate Intel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.vintageBtn, { marginTop: spacing.sm }]} onPress={() => void openCompareVintages()} activeOpacity={0.8}>
              <Text style={styles.vintageBtnText}>Compare Vintages</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setVintageWine(null)} style={styles.vintageCancel}>
              <Text style={styles.vintageCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Vinster's Market & Vintage Comparison — from "Compare Vintages". */}
      <Modal visible={compareOpen} transparent animationType="fade" onRequestClose={() => setCompareOpen(false)}>
        <View style={styles.vintageOverlay}>
          <View style={[styles.vintageSheet, styles.cmpSheet]}>
            <View style={styles.cmpHead}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.vintageWine, { textAlign: 'left' }]} numberOfLines={2}>
                  {vintageWine ? formatWineTitle({ producer: vintageWine.producer, wineName: vintageWine.wineName, region: vintageWine.region }) : ''}
                </Text>
                <Text style={[styles.vintageTitle, { textAlign: 'left', marginBottom: 0 }]}>Vinster's Market & Vintage Comparison</Text>
              </View>
              <TouchableOpacity onPress={() => setCompareOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close" style={styles.cmpClose}>
                <Text style={styles.cmpCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            {compareLoading ? (
              <View style={styles.cmpLoading}>
                <ActivityIndicator color={colors.gold} />
                <Text style={styles.cmpNote}>Checking Wine-Searcher across vintages…</Text>
              </View>
            ) : compareRows && compareRows.length > 0 ? (() => {
              const cur = preferences?.defaultCurrency ?? 'GBP';
              const sym = currencySymbol(cur);
              const verdict = vintageVerdict(compareRows, null, (n) => formatCurrency(n, cur, { decimals: 0 }));
              return (
                <ScrollView style={{ maxHeight: height * 0.62 }}>
                  <View style={[styles.cmpRow, styles.cmpHeadRow]}>
                    <Text style={[styles.cmpCell, styles.cmpYear, styles.cmpLabel]}>Vintage</Text>
                    <Text style={[styles.cmpCell, styles.cmpLabel]}>Score</Text>
                    <Text style={[styles.cmpCell, styles.cmpLabel]}>Price</Text>
                    <Text style={[styles.cmpCell, styles.cmpLabel]}>{sym} / pt</Text>
                    <View style={styles.cmpChevCol} />
                  </View>
                  {verdict.rows.map((r) => {
                    const best = r.vintage === verdict.bestValueVintage;
                    const top = r.vintage === verdict.topScoreVintage;
                    return (
                      <TouchableOpacity key={r.vintage} style={styles.cmpRow} onPress={() => { setCompareOpen(false); void generateSelectedIntel(String(r.vintage)); }} activeOpacity={0.7} accessibilityLabel={`Generate intel for ${r.vintage}`}>
                        <Text style={[styles.cmpCell, styles.cmpYear]}>{r.vintage}</Text>
                        <Text style={[styles.cmpCell, top && styles.cmpGold]}>{r.score ?? '—'}</Text>
                        <Text style={styles.cmpCell}>{r.price != null ? formatCurrency(r.price, cur, { decimals: 0 }) : '—'}</Text>
                        <Text style={[styles.cmpCell, best && styles.cmpGold]}>{r.ppt != null ? `${sym}${r.ppt.toFixed(2)}${best ? ' ★' : ''}` : '—'}</Text>
                        <Text style={[styles.cmpChevCol, styles.cmpChev]}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                  <Text style={styles.cmpNote}>Wine-Searcher market value and aggregate critic score, by vintage. Tap a vintage to generate its intel.</Text>
                  {verdict.text ? (
                    <View style={styles.cmpVerdict}>
                      <Text style={styles.cmpVerdictTitle}>Vinster's verdict</Text>
                      <View style={styles.cmpChips}>
                        {verdict.bestValueVintage != null ? <Text style={styles.cmpChip}>Best value: {verdict.bestValueVintage}</Text> : null}
                        {verdict.topScoreVintage != null ? <Text style={styles.cmpChip}>Top score: {verdict.topScoreVintage}</Text> : null}
                      </View>
                      <Text style={styles.cmpVerdictText}>{verdict.text}</Text>
                    </View>
                  ) : null}
                  {/* Dive Deeper → the considered market analysis across the range. */}
                  {deepLoading ? (
                    <View style={styles.cmpLoading}><ActivityIndicator color={colors.gold} /><Text style={styles.cmpNote}>Vinster is weighing up the vintages…</Text></View>
                  ) : deepVerdict ? (
                    <View style={styles.cmpVerdict}>
                      <Text style={styles.cmpVerdictTitle}>Vinster's market analysis</Text>
                      {deepVerdict.verdict ? <Text style={styles.cmpVerdictText}>{deepVerdict.verdict}</Text> : null}
                      {deepVerdict.drinkNow ? (
                        <View style={{ gap: 2 }}>
                          <Text style={styles.cmpVerdictText}>Best for Drinking Now: <Text style={{ color: colors.gold, fontFamily: fonts.bodySemibold }}>{deepVerdict.drinkNow.vintages.join(', ')}</Text></Text>
                          {deepVerdict.drinkNow.reason ? <Text style={styles.cmpNote}>{deepVerdict.drinkNow.reason}</Text> : null}
                        </View>
                      ) : null}
                      {deepVerdict.layDown ? (
                        <View style={{ gap: 2 }}>
                          <Text style={styles.cmpVerdictText}>Best to Lay Down: <Text style={{ color: colors.gold, fontFamily: fonts.bodySemibold }}>{deepVerdict.layDown.vintages.join(', ')}</Text></Text>
                          {deepVerdict.layDown.reason ? <Text style={styles.cmpNote}>{deepVerdict.layDown.reason}</Text> : null}
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => void diveDeeper(verdict.bestValueVintage ?? null, verdict.total)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.cmpDeeper}>{deepTried ? "Couldn't load the analysis — try again →" : 'Dive Deeper →'}</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              );
            })() : (
              <Text style={styles.cmpNote}>{compareDown
                ? "Wine-Searcher isn't responding just now, so Vinster can't compare vintages. Please try again later, or enter a vintage to generate its intel."
                : 'Wine-Searcher has no per-vintage market data for this wine. Enter a vintage to generate its intel.'}</Text>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={generatingIntel} transparent animationType="fade">
        <View style={styles.scanningOverlay}>
          <View style={styles.scanningSheet}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={styles.scanningTitle}>Generating wine intel…</Text>
            <Text style={styles.scanningBody}>Vinster is pulling in scores, tasting notes, the drinking window and value.</Text>
          </View>
        </View>
      </Modal>

      {/* Search a Wine — predictive typeahead in a prompt (opened from the tile). */}
      <Modal visible={searchModalOpen} transparent animationType="fade" onRequestClose={() => setSearchModalOpen(false)}>
        <KeyboardAvoidingView style={styles.searchModalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.searchModalSheet}>
            <View style={styles.searchModalHeaderRow}>
              <Text style={styles.searchModalTitle}>Search a Wine</Text>
            </View>
            <View style={styles.searchRow}>
              <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInputInner}
                value={wineSearch}
                onChangeText={setWineSearch}
                placeholder="Search a Wine Name for Intel"
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
                onSubmitEditing={useTypedWine}
              />
              {searchLoading ? <ActivityIndicator color={colors.gold} style={{ marginLeft: spacing.sm }} /> : null}
            </View>
            {searchOpen && (searchLoading || searchResults.length > 0 || wineSearch.trim().length >= 3) ? (
              <ScrollView style={styles.searchDropdown} keyboardShouldPersistTaps="handled">
                {searchResults.length === 0 && searchLoading ? (
                  <Text style={styles.searchDropdownEmpty}>Searching…</Text>
                ) : (
                  <>
                    {searchResults.map((r, i) => (
                      <View key={`${r.producer}-${r.wineName ?? ''}-${i}`}>
                      {/* "Did you mean…" heads the sound-alike suggestions (typos, winemaker names). */}
                      {r.suggested && !searchResults[i - 1]?.suggested ? <Text style={styles.searchDidYouMean}>Did you mean…</Text> : null}
                      <TouchableOpacity style={styles.searchOption} onPress={() => selectWine(r)} activeOpacity={0.7}>
                        {/* Show the typed vintage on the result so the list offers
                            the full wine + vintage the user searched. */}
                        <View style={styles.searchOptionNameRow}>
                          {r.colour ? <View style={[styles.colourDot, { backgroundColor: colourDotColour(r.colour) }]} /> : null}
                          <Text style={styles.searchOptionName}>{wineHeaderLine(r.producer, r.wineName, r.vintage)}</Text>
                        </View>
                        {/* Region + grape in gold beneath the white name (shared style). */}
                        {tidyWineRegion(r.region) || r.grape ? <Text style={[styles.searchOptionMeta, { color: colors.gold }]} numberOfLines={1}>{[tidyWineRegion(r.region), r.grape].filter(Boolean).join(' · ')}</Text> : null}
                        {(() => {
                          const h = cellarHoldings(r);
                          if (!h) return null;
                          return (
                            <Text style={styles.searchHolding}>
                              You have {h.n} {h.n === 1 ? 'bottle' : 'bottles'} of this wine in your cellar ·{' '}
                              <Text style={styles.searchHoldingLink} onPress={() => { setSearchModalOpen(false); setSearchOpen(false); router.push(`/cellar/${h.id}` as any); }}>View in Cellar</Text>
                            </Text>
                          );
                        })()}
                        {(() => {
                          const rv = reviewHolding(r);
                          if (!rv) return null;
                          return (
                            <Text style={styles.searchHolding}>
                              You reviewed this wine on {rv.date} ·{' '}
                              <Text style={styles.searchHoldingLink} onPress={() => { setSearchModalOpen(false); setSearchOpen(false); router.push(`/wines/chosen?openReview=${rv.id}&backTo=${encodeURIComponent('/(tabs)')}` as any); }}>View review</Text>
                            </Text>
                          );
                        })()}
                      </TouchableOpacity>
                      </View>
                    ))}
                    {!searchLoading && wineSearch.trim().length >= 3 ? (
                      <TouchableOpacity style={styles.searchOption} onPress={useTypedWine} activeOpacity={0.7}>
                        <Text style={styles.searchOptionName}>Use “{wineSearch.trim()}”</Text>
                        <Text style={styles.searchOptionMeta}>{searchResults.length ? 'Not listed? Enter it yourself.' : 'No match — enter it yourself.'}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </>
                )}
              </ScrollView>
            ) : null}
            <TouchableOpacity onPress={() => { setSearchModalOpen(false); setWineSearch(''); setSearchOpen(false); }} style={styles.searchModalCancel}>
              <Text style={styles.searchModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Welcome overlay — brand block on first landing; "Continue" dismisses it. */}
      <Modal visible={welcomeOpen} transparent animationType="fade" onRequestClose={() => setWelcomeOpen(false)}>
        <View style={styles.welcomeOverlay}>
          <View style={styles.welcomeSheet}>
            <Image source={require('../../assets/vinster-logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>Real Wine Experience, AI Delivered</Text>
            <View style={styles.ruleRow}>
              <View style={styles.rule} />
              <Text style={styles.ruleMark}>◇</Text>
              <View style={styles.rule} />
            </View>
            <Text style={styles.welcome}>{username ? `Welcome, ${username}` : 'Welcome'}</Text>
            <TouchableOpacity onPress={() => setWelcomeOpen(false)} activeOpacity={0.7} style={styles.welcomeContinueBtn}>
              <Text style={styles.welcomeContinue}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SignInPromptModal
        visible={signInPromptVisible}
        allowContinue={!hardGate}
        onDismiss={dismissSignInPrompt}
        onSignIn={() => { dismissSignInPrompt(); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { dismissSignInPrompt(); router.push('/(auth)/sign-up'); }}
        onContinue={continueWithoutAccount}
      />

      <HomeVoiceModal visible={voiceOpen} onClose={() => setVoiceOpen(false)} />

    </GHScrollView>
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Brand block sits higher now (no hamburger row above it) — moderate top pad.
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  // Cancels the scroll's horizontal padding so the Vinster mark aligns with the
  // other tabs (whose scrolls have no horizontal padding).
  headerBleed: { marginLeft: -spacing.xl },

  hero: { alignItems: 'center', marginBottom: spacing.sm },
  // Welcome overlay — centred brand sheet on first landing.
  welcomeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  welcomeSheet: { backgroundColor: colors.background, borderRadius: 20, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.xl, alignItems: 'center', width: '100%', maxWidth: 460 },
  welcomeContinueBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xxl, alignItems: 'center', marginTop: spacing.lg },
  welcomeContinue: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.5 },
  logo: { width: 300, height: 230, marginBottom: 0, marginTop: -spacing.sm },
  tagline: { fontFamily: fonts.headingItalic, fontSize: 19, color: colors.gold, marginTop: -spacing.md, letterSpacing: 1 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: spacing.sm, marginBottom: spacing.sm, paddingHorizontal: spacing.xxl },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(224,184,74,0.55)' },
  ruleMark: { color: colors.gold, fontSize: 15, marginHorizontal: spacing.sm, fontFamily: fonts.headingSemibold },
  welcome: { fontFamily: fonts.headingItalic, fontSize: 23, color: '#FFFFFF', marginTop: spacing.xs },

  // Compact header — mirrors the other tab pages (Vinster mark top-left via
  // VinsterHeader, big centred title, blurb beneath).
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  appName: { fontSize: 42, fontFamily: fonts.headingBold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  // Voice Command — top-right text link, vertically centred on the title (matches
  // the Reviews "Add +"). Absolute so it never shifts the centred title.
  voiceLink: { position: 'absolute', right: 0, top: -22 },
  voiceLinkText: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.gold },
  // Rule beneath the title row, above Search & Discover.
  // Short line under the Home title — same look as the Cellar tab's subtitle.
  homeSubtitle: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', textAlign: 'center', lineHeight: 26 },
  blurbSeparator: { height: 1, backgroundColor: colors.divider, marginTop: 18, marginBottom: 18 },

  // Discover carousels — section header, full-width separator, and a bleed
  // wrapper so each carousel scrolls edge-to-edge past the scroll's h-padding.
  sectionSeparator: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg },
  carouselHeader: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.text, letterSpacing: 0.5, textAlign: 'center', marginBottom: spacing.md },
  // Gold stats line under a carousel header (matches the app-wide stats bars).
  carouselStats: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', marginTop: -spacing.sm, marginBottom: spacing.md },
  carouselBleed: { marginHorizontal: -spacing.xl },
  // Search & Discover carousel — same card shape as the carousels below
  // (220×165 image, title, gold note).
  sdCarousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  sdCard: { width: 220 },
  // Same framing as the tiles in the carousels below: the photo inset 6pt
  // inside the white-edged tile, with its own rounded corners.
  sdThumb: { width: 220, height: 165, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderWhite, padding: 6 },
  // Faded like the Community Musings cards: image at 55% under a dark scrim.
  sdImage: { width: '100%', height: '100%', opacity: 0.85, borderRadius: 8 },
  sdFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  // Title sits on its own dark band so the photos around it stay bright.
  sdTitleBand: { backgroundColor: 'rgba(18,11,10,0.78)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  sdCollage: { width: '100%', height: '100%', flexDirection: 'row', flexWrap: 'wrap', borderRadius: 8, overflow: 'hidden' },
  sdCollageCell: { width: '50%', height: '50%', opacity: 0.85 },
  // Small "Upload" button in the tile's bottom-right corner (the old full-width
  // bar pushed the title up, out of line with Search a Wine).
  sdUpload: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: 'rgba(18,11,10,0.78)', borderWidth: 1, borderColor: 'rgba(224,184,74,0.55)' },
  sdUploadText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: '#FFFFFF', letterSpacing: 0.3 },
  // Title overlaid on the tile, centred — gold, like the Community Musings cards.
  sdTitleWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  sdTitle: { fontFamily: fonts.headingSemibold, fontSize: 21, color: colors.gold, lineHeight: 26, textAlign: 'center' },
  // White name + gold line beneath, matching the carousels below.
  sdName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  sdStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3 },
  discoverHint: { fontFamily: fonts.headingItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  // "Voice Command" gold bubble beneath the search bar (matches the search bar
  // footprint). This same yellow-bubble treatment is used app-wide.
  // Full-width to match the "Manually Search a Wine" bar (no alignSelf: stretches
  // across the padded content). marginBottom pairs with blurbSeparator to centre
  // the rule beneath it.
  voiceBubble: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm, marginBottom: 18 },
  voiceBubbleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },

  // Search-a-Wine prompt (opened from the Search tile).
  searchModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  searchModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg },
  // Header row: title on the left, mic + bin (voice command) top-right, above the field.
  searchModalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  searchModalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, letterSpacing: 0.5, flexShrink: 1 },
  searchModalCancel: { alignItems: 'center', paddingTop: spacing.md },
  searchHolding: { fontFamily: fonts.bodyItalic, fontSize: 12.5, color: colors.text, marginTop: 3 },
  searchHoldingLink: { fontFamily: fonts.bodySemibold, fontStyle: 'normal', color: colors.gold, textDecorationLine: 'underline' },
  searchDidYouMean: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 2 },
  searchModalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  // "Search a Wine Name for Intel" — magnifying-glass icon left of the field.
  searchRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  searchIcon: { marginRight: spacing.sm },
  searchInputInner: { flex: 1, paddingVertical: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text },
  // Predictive dropdown under the search bar.
  searchDropdown: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, marginTop: spacing.xs, maxHeight: 280 },
  searchDropdownEmpty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, padding: spacing.md },
  searchOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchOptionNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  colourDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.3)' },
  searchOptionName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, flexShrink: 1 },
  searchOptionMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  // "What's the Vintage?" prompt.
  vintageOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  vintageSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%' },
  // Wine name — now the white header (matches how "What's the Vintage?" used to
  // read), with "Input Vintage" as a gold-italic subtitle beneath it.
  vintageWine: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  vintageTitle: { fontFamily: fonts.headingItalic, fontSize: 16, color: colors.gold, textAlign: 'center', marginBottom: spacing.md },
  vintageInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 18, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, textAlign: 'center', marginBottom: spacing.md },
  cmpSheet: { padding: spacing.lg },
  cmpHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  cmpClose: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  cmpCloseText: { fontSize: 20, color: colors.text },
  cmpLoading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  cmpRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  cmpHeadRow: { minHeight: 30, borderBottomColor: 'rgba(255,255,255,0.15)' },
  cmpCell: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  cmpYear: { flex: 1.1 },
  cmpLabel: { fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },
  cmpGold: { color: colors.gold, fontFamily: fonts.bodySemibold },
  cmpChevCol: { width: 18 },
  cmpChev: { fontSize: 18, color: colors.gold, textAlign: 'right' },
  cmpNote: { fontFamily: fonts.bodyItalic, fontSize: 12.5, lineHeight: 18, color: 'rgba(255,255,255,0.9)', marginTop: spacing.sm },
  cmpVerdict: { marginTop: spacing.md, padding: spacing.sm, borderRadius: 12, backgroundColor: 'rgba(224,184,74,0.08)', borderWidth: 1, borderColor: 'rgba(224,184,74,0.35)', gap: 8 },
  cmpVerdictTitle: { fontFamily: fonts.bodySemibold, fontSize: 12.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.gold },
  cmpChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cmpChip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: colors.gold, color: colors.gold, fontFamily: fonts.bodyRegular, fontSize: 12.5, overflow: 'hidden' },
  cmpVerdictText: { fontFamily: fonts.bodyRegular, fontSize: 14, lineHeight: 21, color: colors.text },
  cmpDeeper: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, marginTop: spacing.md },
  vintageBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  vintageBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  vintageNv: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center', paddingVertical: spacing.md },
  vintageCancel: { alignItems: 'center', paddingBottom: 4 },
  vintageCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },

  scanningOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  scanningSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, alignItems: 'center', gap: spacing.md, width: '100%' },
  scanningTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  scanningBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },

  readyOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  readySheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  readyLabel: { fontFamily: fonts.headingSemibold, fontSize: 11, color: 'rgba(224,184,74,0.75)', letterSpacing: 1.8, textAlign: 'center', marginBottom: spacing.xs },
  readyHeading: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  readyTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.gold, textAlign: 'center', lineHeight: 32, marginBottom: spacing.md },
  readyBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  readyPrimaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  readyPrimaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
  readyDismissBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  readyDismissBtnText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
