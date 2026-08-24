import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Image, ActivityIndicator, TextInput, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../../src/components/AppAlert';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { useAuth } from '../../src/hooks/useAuth';
import { useScanStore } from '../../src/stores/scanStore';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { prepareImageBase64, scanLabel, searchWines, searchLabelImages, type WineSearchResult } from '../../src/api/label';
import { listLineupArchives, lineupSignedUrl, type LineupArchive } from '../../src/api/lineups';
import { useQuery } from '@tanstack/react-query';
import { File, Paths } from 'expo-file-system';
import { formatWineTitle } from '../../src/utils/wineTitle';
import { generateWineIntel, fetchPricing } from '../../src/services/pricing';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { resolveIntelCurrency } from '../../src/utils/localCurrency';
import { scanHistoryKey } from '../../src/hooks/useScanHistory';
import type { WineDetailsComplete } from '../../src/types/wine';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Module-level so it survives the Scan tab unmounting/remounting on navigation:
// the welcome overlay shows once per app session (a fresh launch resets it),
// not every time the user returns to the Scan tab.
let welcomeShownThisSession = false;

// One photo in the "Your Lineup Archive" carousel — resolves a fresh signed URL
// on mount and taps through to the lineup's detail screen.
function LineupThumb({ item }: { item: LineupArchive }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    lineupSignedUrl(item.image_path).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [item.image_path]);
  const date = new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return (
    <TouchableOpacity style={styles.carouselItem} onPress={() => router.push(`/cellar/lineup/${item.id}` as any)} activeOpacity={0.85}>
      <View style={styles.carouselImageWrap}>
        {url ? <Image source={{ uri: url }} style={styles.carouselImage} resizeMode="cover" /> : <ActivityIndicator color={colors.gold} />}
      </View>
      <Text style={styles.carouselDate} numberOfLines={1}>{date}{item.city ? ` · ${item.city}` : ''}</Text>
    </TouchableOpacity>
  );
}

// The Scan landing — the app's home tab. A 2×2 grid of scan actions (each with
// an "upload instead" banner) plus a Search tile, then the Your Lineup Archive
// carousel. The six-tab bar handles all other navigation, so there's no hamburger.
export default function ScanLandingScreen() {
  const { session } = useAuth();
  // Match every other tab page's top spacing so the Vinster mark + title sit at
  // a consistent height across the bottom-nav surfaces.
  const { height } = useWindowDimensions();
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

  // Your Lineup Archive carousel — the user's saved lineup photos, newest first.
  const userId = session?.user.id;
  const { data: lineups = [] } = useQuery({
    queryKey: ['lineup-archives', userId],
    queryFn: () => listLineupArchives(userId!),
    enabled: !!userId,
  });

  // The Scan tab always shows its normal compact header. On the first landing
  // after opening the app, a welcome overlay (logo · "Your AI Sommelier" ·
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

  // Pick a wine from the dropdown → skip the confirm form; just ask the vintage.
  function selectWine(wine: WineSearchResult) {
    requireAuth(() => {
      skipSearchRef.current = true;
      setSearchOpen(false);
      setSearchModalOpen(false);
      setSearchResults([]);
      setWineSearch('');
      setVintageDraft('');
      setVintageWine(wine);
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

  // Vintage entered → generate intel straight to the card, with a label thumbnail.
  async function generateSelectedIntel(vintage: string) {
    const wine = vintageWine;
    if (!wine) return;
    setVintageWine(null);
    resetLabelStore();
    const confirmed: WineDetailsComplete = {
      producer: wine.producer,
      region: wine.region ?? '',
      wineName: wine.wineName,
      vintage: vintage.trim() || 'NV',
      style: wine.style ?? null,
      grape: wine.grape ?? null,
      bottleSizeMl: null,
      quantity: 1,
    };
    setWineDetailsConfirmed(confirmed);
    setGeneratingIntel(true);
    try {
      const currency = await resolveIntelCurrency(preferences?.defaultCurrency);
      const [intel] = await Promise.all([
        generateWineIntel(confirmed, currency),
        fetchLabelThumb(confirmed.producer, confirmed.wineName),
      ]);
      setIntelligence(intel);
      useLastIntelStore.getState().setLast(confirmed, intel);
      setGeneratingIntel(false);
      router.push(`/label/results?context=intel&fresh=1&backTo=${encodeURIComponent('/(tabs)')}`);
    } catch (err) {
      setGeneratingIntel(false);
      setError(err instanceof Error ? err.message : 'Failed to generate intel');
      // Fall back to the confirm screen so it's never a dead end.
      router.push(`/label/confirm?manual=1&context=intel&seed=${encodeURIComponent(wine.producer)}&backTo=${encodeURIComponent('/(tabs)')}`);
    }
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

      const intel = await generateWineIntel(confirmed, currency);
      setIntelligence(intel);
      useLastIntelStore.getState().setLast(confirmed, intel);
      setScanningLabel(false);
      router.push(`/label/results?context=intel&via=upload&fresh=1&backTo=${backTo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
      setScanningLabel(false);
      router.push(`/label/confirm?context=intel&via=upload&backTo=${backTo}`);
    }
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { paddingTop }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      <VinsterHeader />
      <View style={styles.titleRow}>
        <Text style={styles.appName}>Scan</Text>
      </View>
      <Text style={styles.blurb}>
        Generate wine intel from labels, bottle recommendations from wine lists, and archive your vinous exploits — Vinster keeps a record of it all for you.
      </Text>

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
            <Feather name="camera" size={26} color={colors.gold} style={styles.tileIcon} />
            <Text style={styles.tileTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>Scan a Wine Label</Text>
            <View style={styles.tileDivider} />
            <Text style={styles.tileDesc} numberOfLines={2}>Wine intel from a bottle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tileBanner} onPress={() => requireAuth(handleUploadLabel)} activeOpacity={0.7}>
            <Feather name="upload" size={11} color={colors.gold} />
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
            <Feather name="list" size={26} color={colors.gold} style={styles.tileIcon} />
            <Text style={styles.tileTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>Scan a Wine List</Text>
            <View style={styles.tileDivider} />
            <Text style={styles.tileDesc} numberOfLines={2}>Bottle picks from a menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tileBanner} onPress={() => router.push('/scan/wine-list?upload=1')} activeOpacity={0.7}>
            <Feather name="upload" size={11} color={colors.gold} />
            <Text style={styles.tileBannerText}>upload instead</Text>
          </TouchableOpacity>
        </View>

        {/* Scan a Lineup → photograph a bottle lineup and save it */}
        <View style={styles.tile}>
          <TouchableOpacity
            style={styles.tileMain}
            onPress={() => requireAuth(() => router.push('/cellar/archive-night'))}
            activeOpacity={0.85}
          >
            <Feather name="grid" size={26} color={colors.gold} style={styles.tileIcon} />
            <Text style={styles.tileTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>Scan a Lineup</Text>
            <View style={styles.tileDivider} />
            <Text style={styles.tileDesc} numberOfLines={2}>Save tonight's bottles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tileBanner} onPress={() => requireAuth(() => router.push('/cellar/archive-night?upload=1'))} activeOpacity={0.7}>
            <Feather name="upload" size={11} color={colors.gold} />
            <Text style={styles.tileBannerText}>upload instead</Text>
          </TouchableOpacity>
        </View>

        {/* Search a Wine → predictive typeahead (no upload equivalent) */}
        <View style={styles.tile}>
          <TouchableOpacity style={styles.tileMain} onPress={() => setSearchModalOpen(true)} activeOpacity={0.85}>
            <Feather name="search" size={26} color={colors.gold} style={styles.tileIcon} />
            <Text style={styles.tileTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>Search a Wine</Text>
            <View style={styles.tileDivider} />
            <Text style={styles.tileDesc} numberOfLines={2}>Wine intel by name</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Your Lineup Archive — a horizontal carousel of saved lineup photos. */}
      <View style={styles.archiveDivider} />
      <View style={styles.archiveHeaderRow}>
        <Text style={styles.archiveTitle}>Your Lineup Archive</Text>
        {lineups.length > 0 ? (
          <TouchableOpacity onPress={() => requireAccount(() => router.push('/cellar/lineups'))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.archiveSeeAll}>See all</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {lineups.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {lineups.map((l) => <LineupThumb key={l.id} item={l} />)}
        </ScrollView>
      ) : (
        <Text style={styles.archiveEmpty}>No lineups yet — “Scan a Lineup” to save tonight's bottles.</Text>
      )}

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
            <Text style={styles.vintageTitle}>What's the Vintage?</Text>
            <TextInput
              style={styles.vintageInput}
              value={vintageDraft}
              onChangeText={setVintageDraft}
              placeholder="e.g. 2019"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              onSubmitEditing={() => generateSelectedIntel(vintageDraft)}
            />
            <TouchableOpacity style={styles.vintageBtn} onPress={() => generateSelectedIntel(vintageDraft)} activeOpacity={0.85}>
              <Text style={styles.vintageBtnText}>Generate Intel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => generateSelectedIntel('NV')} activeOpacity={0.7}>
              <Text style={styles.vintageNv}>No vintage (NV)</Text>
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
        <View style={styles.searchModalOverlay}>
          <View style={styles.searchModalSheet}>
            <Text style={styles.searchModalTitle}>Search a Wine</Text>
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
              <View style={styles.searchDropdown}>
                {searchResults.length === 0 && searchLoading ? (
                  <Text style={styles.searchDropdownEmpty}>Searching…</Text>
                ) : (
                  <>
                    {searchResults.map((r, i) => (
                      <TouchableOpacity key={`${r.producer}-${r.wineName ?? ''}-${i}`} style={styles.searchOption} onPress={() => selectWine(r)} activeOpacity={0.7}>
                        <Text style={styles.searchOptionName} numberOfLines={2}>{formatWineTitle({ producer: r.producer, wineName: r.wineName, region: r.region })}</Text>
                        {r.region || r.style ? <Text style={styles.searchOptionMeta} numberOfLines={1}>{[r.region, r.style].filter(Boolean).join(' · ')}</Text> : null}
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
              </View>
            ) : null}
            <TouchableOpacity onPress={() => { setSearchModalOpen(false); setWineSearch(''); setSearchOpen(false); }} style={styles.searchModalCancel}>
              <Text style={styles.searchModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Welcome overlay — brand block on first landing; "Continue" dismisses it. */}
      <Modal visible={welcomeOpen} transparent animationType="fade" onRequestClose={() => setWelcomeOpen(false)}>
        <View style={styles.welcomeOverlay}>
          <View style={styles.welcomeSheet}>
            <Image source={require('../../assets/vinster-logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>Your AI Sommelier</Text>
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

    </ScrollView>
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Brand block sits higher now (no hamburger row above it) — moderate top pad.
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

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
  appName: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  blurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, textAlign: 'center', marginBottom: spacing.xl },

  // 2×2 grid of tiles — motif/icon, gold title, short divider, italic blurb,
  // and (on scan tiles) an "upload instead" banner across the bottom.
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  tile: { width: '48%', aspectRatio: 0.9, borderWidth: 1, borderColor: colors.gold, borderRadius: 16, overflow: 'hidden' },
  tileMain: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  tileIcon: { marginBottom: spacing.sm },
  tileTitle: { fontFamily: fonts.headingBold, fontSize: 19, color: colors.gold, letterSpacing: 1, textAlign: 'center' },
  tileDivider: { width: 34, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', marginVertical: spacing.xs },
  tileDesc: { fontFamily: fonts.headingItalic, fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 17 },
  tileBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderTopWidth: 1, borderTopColor: 'rgba(224,184,74,0.4)', backgroundColor: 'rgba(224,184,74,0.12)' },
  tileBannerText: { fontFamily: fonts.headingItalic, fontSize: 12, color: colors.gold, letterSpacing: 0.3 },

  // Your Lineup Archive — divider, header, then a horizontal thumbnail carousel.
  archiveDivider: { height: 1, backgroundColor: colors.divider, marginTop: spacing.xl, marginBottom: spacing.lg },
  archiveHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: spacing.md },
  archiveTitle: { fontFamily: fonts.headingSemibold, fontSize: 22, color: '#FFFFFF', letterSpacing: 0.5 },
  archiveSeeAll: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  archiveEmpty: { fontFamily: fonts.headingItalic, fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 22 },
  carousel: { gap: spacing.md, paddingRight: spacing.md },
  carouselItem: { width: 130 },
  carouselImageWrap: { width: 130, height: 102, borderRadius: 8, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  carouselImage: { width: 130, height: 102 },
  carouselDate: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 4 },

  // Search-a-Wine prompt (opened from the Search tile).
  searchModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  searchModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg },
  searchModalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  searchModalCancel: { alignItems: 'center', paddingTop: spacing.md },
  searchModalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  // "Search a Wine Name for Intel" — magnifying-glass icon left of the field.
  searchRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  searchIcon: { marginRight: spacing.sm },
  searchInputInner: { flex: 1, paddingVertical: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text },
  // Predictive dropdown under the search bar.
  searchDropdown: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, marginTop: spacing.xs, overflow: 'hidden' },
  searchDropdownEmpty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, padding: spacing.md },
  searchOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchOptionName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  searchOptionMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  // "What's the Vintage?" prompt.
  vintageOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  vintageSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%' },
  vintageWine: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  vintageTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
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
