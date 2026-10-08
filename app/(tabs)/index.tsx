import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Image, ActivityIndicator, TextInput, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../../src/components/AppAlert';
import { MicButton } from '../../src/components/MicButton';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HelpTitle } from '../../src/components/HelpTitle';
import { RecentScansCarousel } from '../../src/components/RecentScansCarousel';
import { DrinkNowCarousel } from '../../src/components/DrinkNowCarousel';
import { CellarInsightsCarousel } from '../../src/components/CellarInsightsCarousel';
import { DiscoverVoiceModal } from '../../src/components/DiscoverVoiceModal';
import { useAuth } from '../../src/hooks/useAuth';
import { useScanStore } from '../../src/stores/scanStore';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { prepareImageBase64, scanLabel, searchWines, searchLabelImages, type WineSearchResult } from '../../src/api/label';
import { File, Paths } from 'expo-file-system';
import { formatWineTitle } from '../../src/utils/wineTitle';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { tidyWineRegion } from '../../src/utils/regionFormat';
import { generateWineIntel, fetchPricing } from '../../src/services/pricing';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { resolveIntelCurrency } from '../../src/utils/localCurrency';
import { scanHistoryKey } from '../../src/hooks/useScanHistory';
import type { WineDetailsComplete } from '../../src/types/wine';
import { colors, spacing } from '../../src/constants/theme';
import { withBordeauxInfo } from '../../src/constants/bordeauxClassification';
import { fonts } from '../../src/constants/fonts';

// Module-level so it survives the Scan tab unmounting/remounting on navigation:
// the welcome overlay shows once per app session (a fresh launch resets it),
// not every time the user returns to the Scan tab.
let welcomeShownThisSession = false;

// "How Scan works" — the help body behind the underlined Scan title, matching
// the other tabs' tappable titles.
const SCAN_HELP = `Home is your starting point. Scan a label for instant Wine Intel — critic scores, tasting notes, drinking windows and today's value — or scan a wine list for tailored picks from the menu. No label to hand? Search a Wine from Vinster's catalogue. Below, revisit your Recent Scans, see which cellar bottles are drinking now, and catch up on Community Musings.`;

// The Scan landing — the app's home tab. A 2×2 grid of scan actions (each with
// an "upload instead" banner) plus a Search tile, then the Your Lineup Archive
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
      const cands = await searchLabelImages({ producer, wineName });
      if (!cands.length) return;
      const dest = new File(Paths.cache, `autolabel-${Date.now()}.img`);
      try { if (dest.exists) dest.delete(); } catch { /* ignore */ }
      const file = await File.downloadFileAsync(cands[0].url, dest);
      useLabelStore.getState().setImageUri(file.uri);
    } catch { /* no thumbnail is fine */ }
  }

  // Vintage entered (or carried in from the search query) → generate intel
  // straight to the card, with a label thumbnail. `wineArg` lets selectWine pass
  // the picked wine directly, bypassing the vintage-prompt state.
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
    const uri = result.assets[0].uri;
    const backTo = encodeURIComponent('/(tabs)');
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

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { paddingTop }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      {/* This scroll has paddingHorizontal (other tabs pad per-section), which
          would push the mark inward — pull it back to the screen edge so the V
          sits where it does on every other tab. */}
      <View style={styles.headerBleed}><VinsterHeader /></View>
      <View style={styles.titleRow}>
        <HelpTitle label="Home" title="How Home works" body={SCAN_HELP} textStyle={styles.appName} />
        {/* Voice Command — top-right text link (matches the Reviews "Add +").
            Discovery only (recommend / consult / wine intel). */}
        <TouchableOpacity style={styles.voiceLink} onPress={() => setVoiceOpen(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={styles.voiceLinkText}>Voice Command</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.blurb}>
        Vinster Training + Wine Searcher Market API result in the most comprehensive and customized experience in wine exploration.
      </Text>

      <View style={styles.blurbSeparator} />

      {/* 2×2 grid of scan actions. Each scan tile carries an "upload instead"
          banner across its bottom; the Search tile opens the typeahead prompt. */}
      <View style={styles.grid}>
        {/* Scan a Wine Label → intel */}
        <View style={styles.tile}>
          <TouchableOpacity
            style={styles.tileMain}
            onPress={() => requireAuth(() => router.push(`/label/camera?context=intel&backTo=${encodeURIComponent('/(tabs)')}`))}
            onLongPress={() => requireAccount(handleViewLastIntel)}
            activeOpacity={0.85}
          >
            <Ionicons name="camera-outline" size={30} color="#FFFFFF" style={styles.tileIcon} />
            <Text style={styles.tileTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>Scan a Label</Text>
            <View style={styles.tileDivider} />
            <Text style={styles.tileDesc} numberOfLines={2}>Generate Wine Intel{'\n'}Review &amp; Cellar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tileBanner} onPress={() => requireAuth(handleUploadLabel)} activeOpacity={0.7}>
            <Feather name="upload" size={11} color="#FFFFFF" />
            <Text style={styles.tileBannerText}>upload instead</Text>
          </TouchableOpacity>
        </View>

        {/* Scan a Wine List → recommendations */}
        <View style={styles.tile}>
          <TouchableOpacity
            style={styles.tileMain}
            onPress={() => router.push('/scan/wine-list')}
            onLongPress={() => requireAccount(handleViewLastListResult)}
            activeOpacity={0.85}
          >
            <Ionicons name="camera-outline" size={30} color="#FFFFFF" style={styles.tileIcon} />
            <Text style={styles.tileTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>Scan a List</Text>
            <View style={styles.tileDivider} />
            <Text style={styles.tileDesc} numberOfLines={2}>Tailored bottle picks from a wine menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tileBanner} onPress={() => router.push('/scan/wine-list?upload=1')} activeOpacity={0.7}>
            <Feather name="upload" size={11} color="#FFFFFF" />
            <Text style={styles.tileBannerText}>upload instead</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Search bar directly beneath the two scan tiles (above the separator). */}
      <TouchableOpacity style={styles.searchBar} onPress={() => setSearchModalOpen(true)} activeOpacity={0.7}>
        <Feather name="search" size={18} color={colors.textMuted} style={styles.searchBarIcon} />
        <Text style={styles.searchBarText}>Search a Wine</Text>
      </TouchableOpacity>

      {/* Recent Scans — mixed label + list scans, most recent first. */}
      <View style={styles.sectionSeparator} />
      <Text style={styles.carouselHeader}>Your Recent Scans</Text>
      <View style={styles.carouselBleed}><RecentScansCarousel /></View>

      {/* Drink Now — cellar bottles at last call (drinkable now, window closes
          within 5 years), most urgent first. Replaces the redundant Recent
          Reviews carousel (reviews live in the Review tab) and consolidates the
          old "Drink Soon" carousel. */}
      <View style={styles.sectionSeparator} />
      <Text style={styles.carouselHeader}>Your Cellar Insights</Text>
      <View style={styles.carouselBleed}><DrinkNowCarousel /></View>

      {/* Cellar Insights — actionable "running low" bottles to replenish, then a
          few facts buried in the data (top-rated grape, oldest vintage, most-
          collected producer). Chef/ingredient tiles deferred — not tracked yet. */}
      <View style={styles.sectionSeparator} />
      <Text style={styles.carouselHeader}>Vinster's Insights</Text>
      <View style={styles.carouselBleed}><CellarInsightsCarousel /></View>

      {/* Community Musings — coming soon (recently shared reviews, journal). */}
      <View style={styles.sectionSeparator} />
      <Text style={styles.carouselHeader}>Community Musings</Text>
      <View style={styles.comingSoonCard}>
        <Text style={styles.comingSoonText}>Coming soon</Text>
        <Text style={styles.comingSoonSub}>Recently shared wine &amp; restaurant reviews, journal entries and more from the Vinster community.</Text>
      </View>

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
      <Modal visible={!!vintageWine} transparent animationType="fade" onRequestClose={() => setVintageWine(null)}>
        <View style={styles.vintageOverlay}>
          <View style={styles.vintageSheet}>
            <Text style={styles.vintageWine} numberOfLines={2}>
              {vintageWine ? formatWineTitle({ producer: vintageWine.producer, wineName: vintageWine.wineName, region: vintageWine.region }) : ''}
            </Text>
            <Text style={styles.vintageTitle}>Input Vintage</Text>
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
            <TouchableOpacity onPress={() => setVintageWine(null)} style={styles.vintageCancel}>
              <Text style={styles.vintageCancelText}>Cancel</Text>
            </TouchableOpacity>
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
              <MicButton value={wineSearch} onChangeText={setWineSearch} onClear={() => setWineSearch('')} domain="wine" serverCorrect />
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
                      <TouchableOpacity key={`${r.producer}-${r.wineName ?? ''}-${i}`} style={styles.searchOption} onPress={() => selectWine(r)} activeOpacity={0.7}>
                        {/* Show the typed vintage on the result so the list offers
                            the full wine + vintage the user searched. */}
                        <View style={styles.searchOptionNameRow}>
                          {r.colour ? <View style={[styles.colourDot, { backgroundColor: colourDotColour(r.colour) }]} /> : null}
                          <Text style={styles.searchOptionName}>{wineHeaderLine(r.producer, r.wineName, r.vintage)}</Text>
                        </View>
                        {/* Region + grape in gold beneath the white name (shared style). */}
                        {tidyWineRegion(r.region) || r.grape ? <Text style={[styles.searchOptionMeta, { color: colors.gold }]} numberOfLines={1}>{[tidyWineRegion(r.region), r.grape].filter(Boolean).join(' · ')}</Text> : null}
                      </TouchableOpacity>
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

      <DiscoverVoiceModal visible={voiceOpen} onClose={() => setVoiceOpen(false)} />

    </ScrollView>
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
  blurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, textAlign: 'center', marginBottom: 0 },
  // Rule between the intro blurb and the 2×2 grid (Voice Command now lives in the
  // header, so the grid moves up into the reclaimed space).
  blurbSeparator: { height: 1, backgroundColor: colors.divider, marginTop: 18, marginBottom: 18 },

  // 2×2 grid of tiles — motif/icon, gold title, short divider, italic blurb,
  // and (on scan tiles) an "upload instead" banner across the bottom.
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  tile: { width: '48%', aspectRatio: 1.0, borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surface, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  tileMain: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  // Fixed line box so every tile's icon occupies the SAME vertical space — the
  // search vs camera glyphs have different metrics, which pushed the Search a
  // Wine title higher than its neighbours. A constant height keeps all four
  // titles on the same line.
  tileIcon: { marginBottom: spacing.sm, height: 34, lineHeight: 34, textAlign: 'center' },
  tileTitle: { fontFamily: fonts.headingBold, fontSize: 19, color: '#FFFFFF', letterSpacing: 1, textAlign: 'center' },
  tileDivider: { width: 34, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', marginVertical: spacing.xs },
  // Fixed two-line height so every tile's blurb occupies the same space — a
  // one-line blurb (Scan a Lineup) would otherwise shift its title down out of
  // line with the two-line tiles beside it. Font is +1pt (14) per request.
  tileDesc: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textAlign: 'center', lineHeight: 18, minHeight: 36 },
  tileBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderTopWidth: 1, borderTopColor: 'rgba(224,184,74,0.4)', backgroundColor: 'rgba(224,184,74,0.12)' },
  tileBannerText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: '#FFFFFF', letterSpacing: 0.3 },
  // Separator + "Manually Search a Wine" bar beneath the two scan tiles.
  searchBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 14, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, marginTop: spacing.md },
  searchBarIcon: { marginRight: 2 },
  searchBarText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.textMuted, letterSpacing: 0.3 },
  // Discover carousels — section header, full-width separator, and a bleed
  // wrapper so each carousel scrolls edge-to-edge past the scroll's h-padding.
  sectionSeparator: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg },
  carouselHeader: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.text, letterSpacing: 0.5, textAlign: 'center', marginBottom: spacing.md },
  // Gold stats line under a carousel header (matches the app-wide stats bars).
  carouselStats: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', marginTop: -spacing.sm, marginBottom: spacing.md },
  carouselBleed: { marginHorizontal: -spacing.xl },
  discoverHint: { fontFamily: fonts.headingItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  // "Voice Command" gold bubble beneath the search bar (matches the search bar
  // footprint). This same yellow-bubble treatment is used app-wide.
  // Full-width to match the "Manually Search a Wine" bar (no alignSelf: stretches
  // across the padded content). marginBottom pairs with blurbSeparator to centre
  // the rule beneath it.
  voiceBubble: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm, marginBottom: 18 },
  voiceBubbleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Community Musings placeholder — faded dashed card until the feature ships.
  comingSoonCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderWhite, borderRadius: 14, paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, alignItems: 'center', opacity: 0.85 },
  comingSoonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.5, marginBottom: spacing.xs },
  comingSoonSub: { fontFamily: fonts.headingRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },


  // Search-a-Wine prompt (opened from the Search tile).
  searchModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  searchModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg },
  // Header row: title on the left, mic + bin (voice command) top-right, above the field.
  searchModalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  searchModalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, letterSpacing: 0.5, flexShrink: 1 },
  searchModalCancel: { alignItems: 'center', paddingTop: spacing.md },
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
