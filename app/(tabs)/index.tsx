import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Image, ActivityIndicator, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { showAlert } from '../../src/components/AppAlert';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { PersonalityPromptModal } from '../../src/components/PersonalityPromptModal';
import { usePersonalityPrompt } from '../../src/hooks/usePersonalityPrompt';
import { useAuth } from '../../src/hooks/useAuth';
import { useScanStore } from '../../src/stores/scanStore';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { prepareImageBase64, scanLabel, searchWines, searchLabelImages, type WineSearchResult } from '../../src/api/label';
import { File, Paths } from 'expo-file-system';
import { formatWineTitle } from '../../src/utils/wineTitle';
import { generateWineIntel, fetchPricing } from '../../src/services/pricing';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { resolveIntelCurrency } from '../../src/utils/localCurrency';
import { supabase } from '../../src/api/supabase';
import { splitPersonality } from '../../src/utils/personalityText';
import { scanHistoryKey } from '../../src/hooks/useScanHistory';
import type { WineDetailsComplete } from '../../src/types/wine';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Per-category AsyncStorage key — the timestamp of the most recent sketch the
// user has viewed for that category (drives the "your sketch is ready" popup).
function ackKey(category: 'wine' | 'recipe') {
  return `vinster_personality_acked_${category}`;
}
const NUDGE_CAP = 3;
const NUDGE_COUNT_KEY = 'vinster_personality_nudge_shows';

// Module-level so it survives the Scan tab unmounting/remounting on navigation:
// the welcome overlay shows once per app session (a fresh launch resets it),
// not every time the user returns to the Scan tab.
let welcomeShownThisSession = false;

// Most-recently-generated sketch (wine or recipe) so the landing can decide
// whether to surface the "your personality is ready" popup.
function useFeaturedPersonality(userId: string | undefined) {
  return useQuery({
    queryKey: ['home-featured-personality', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('last_wine_personality, last_wine_personality_at, last_recipe_personality, last_recipe_personality_at')
        .eq('user_id', userId!)
        .maybeSingle();
      if (!data) return null;
      const candidates: Array<{ category: 'wine' | 'recipe'; text: string; at: string | null }> = [];
      if (data.last_wine_personality) candidates.push({ category: 'wine', text: data.last_wine_personality, at: data.last_wine_personality_at });
      if (data.last_recipe_personality) candidates.push({ category: 'recipe', text: data.last_recipe_personality, at: data.last_recipe_personality_at });
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));
      const top = candidates[0];
      const { title } = splitPersonality(top.text);
      return { category: top.category, title: title ?? '', at: top.at };
    },
  });
}

// The Scan landing — the app's home tab. Brand block up top, then the two big
// scan actions and a manual "Search A Wine" bar. The six-tab bar handles all
// other navigation, so there's no hamburger here.
export default function ScanLandingScreen() {
  const { session } = useAuth();
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
    }, 300);
    return () => clearTimeout(t);
  }, [wineSearch]);

  // Pick a wine from the dropdown → skip the confirm form; just ask the vintage.
  function selectWine(wine: WineSearchResult) {
    requireAuth(() => {
      skipSearchRef.current = true;
      setSearchOpen(false);
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

  // --- Personality nudge + "ready" popups (moved from the old home hub) ------
  const { data: featured } = useFeaturedPersonality(session?.user.id);
  const personalityCategory = usePersonalityPrompt();
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [nudgeSuppressed, setNudgeSuppressed] = useState(false);
  const nudgeBumpedRef = useRef(false);
  useEffect(() => {
    (async () => {
      const n = parseInt((await AsyncStorage.getItem(NUDGE_COUNT_KEY)) ?? '0', 10) || 0;
      if (n >= NUDGE_CAP) setNudgeSuppressed(true);
    })();
  }, []);
  useEffect(() => {
    if (!personalityCategory || promptDismissed || nudgeSuppressed || nudgeBumpedRef.current) return;
    nudgeBumpedRef.current = true;
    (async () => {
      const n = (parseInt((await AsyncStorage.getItem(NUDGE_COUNT_KEY)) ?? '0', 10) || 0) + 1;
      await AsyncStorage.setItem(NUDGE_COUNT_KEY, String(n));
      if (n >= NUDGE_CAP) setNudgeSuppressed(true);
    })();
  }, [personalityCategory, promptDismissed, nudgeSuppressed]);

  const [readyPopupVisible, setReadyPopupVisible] = useState(false);
  useFocusEffect(useCallback(() => {
    let cancelled = false;
    (async () => {
      if (!featured?.at) { if (!cancelled) setReadyPopupVisible(false); return; }
      const ackedAt = await AsyncStorage.getItem(ackKey(featured.category));
      const needsAck = !ackedAt || (featured.at ?? '') > ackedAt;
      if (!cancelled) setReadyPopupVisible(needsAck);
    })();
    return () => { cancelled = true; };
  }, [featured?.at, featured?.category]));

  function handleViewReady() {
    if (!featured) return;
    setReadyPopupVisible(false);
    router.push(`/profile/personality?category=${featured.category}` as any);
  }
  async function handleDismissReady() {
    if (featured?.at) { try { await AsyncStorage.setItem(ackKey(featured.category), featured.at); } catch { /* non-fatal */ } }
    setReadyPopupVisible(false);
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      <VinsterHeader />
      <View style={styles.titleRow}>
        <Text style={styles.appName}>Scan</Text>
      </View>
      <Text style={styles.blurb}>
        Generate wine intel from labels, bottle recommendations from wine lists, and archive your vinous exploits — Vinster keeps a record of it all for you.
      </Text>

      <View style={styles.actions}>
        {/* Predictive "Search a Wine" — as you type, matches from the catalog
            drop down; pick one and Vinster only asks the vintage. */}
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

        {/* Wine Label → intel. Big gold Scan (camera), white Upload, then the
            Label Scan History (the library of every label you've scanned). */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => requireAuth(() => router.push(`/label/camera?context=intel&backTo=${encodeURIComponent('/(tabs)')}`))}
          onLongPress={() => requireAccount(handleViewLastIntel)}
          activeOpacity={0.85}
        >
          <Feather name="camera" size={20} color="#FFFFFF" style={styles.scanIcon} />
          <Text style={styles.scanButtonText}>Scan a Wine Label</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={() => requireAuth(handleUploadLabel)} activeOpacity={0.8}>
          <Text style={styles.uploadButtonText}>Upload Wine Label</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={() => requireAccount(() => router.push('/scan/archive'))} activeOpacity={0.8}>
          <Text style={styles.uploadButtonText}>Your Label Scans</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Wine List → recommendations. Big gold Scan (camera), white Upload,
            then List Scan History (revisit the last list result). */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/scan/wine-list')}
          onLongPress={() => requireAccount(handleViewLastListResult)}
          activeOpacity={0.85}
        >
          <Feather name="camera" size={20} color="#FFFFFF" style={styles.scanIcon} />
          <Text style={styles.scanButtonText}>Scan a Wine List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={() => router.push('/scan/wine-list?upload=1')} activeOpacity={0.8}>
          <Text style={styles.uploadButtonText}>Upload Wine List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={() => requireAccount(handleViewLastListResult)} activeOpacity={0.8}>
          <Text style={styles.uploadButtonText}>Your List Scans</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Archive a Lineup → photograph a bottle lineup and save it; Your
            Lineups is the gallery. (Both moved here from the Cellar tab.) */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => requireAuth(() => router.push('/cellar/archive-night'))}
          onLongPress={() => showAlert({
            title: 'Archive a Lineup',
            body: "Drank some bottles?\n\nSnap a pic of your lineup to save automatically to Your Lineups — revisit, review, comment and share at a convenient time. Vinster can archive bottles it identifies from your cellar along the way.\n\nChin-Chin!",
          })}
          activeOpacity={0.85}
        >
          <Feather name="camera" size={20} color="#FFFFFF" style={styles.scanIcon} />
          <Text style={styles.scanButtonText}>Archive a Lineup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={() => requireAuth(() => router.push('/cellar/lineups'))} activeOpacity={0.8}>
          <Text style={styles.uploadButtonText}>Your Lineups</Text>
        </TouchableOpacity>
      </View>

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

      <PersonalityPromptModal
        visible={!!personalityCategory && !promptDismissed && !nudgeSuppressed}
        category={personalityCategory ?? 'wine'}
        onGenerate={() => { setPromptDismissed(true); router.push(`/profile/personality?category=${personalityCategory}` as any); }}
        onDismiss={() => setPromptDismissed(true)}
      />

      <Modal visible={readyPopupVisible} transparent animationType="fade" onRequestClose={handleDismissReady}>
        <TouchableOpacity style={styles.readyOverlay} activeOpacity={1} onPress={handleDismissReady}>
          <TouchableOpacity activeOpacity={1} style={styles.readySheet} onPress={() => {}}>
            <Text style={styles.readyLabel}>{featured?.category === 'wine' ? 'YOUR WINE PERSONALITY' : 'YOUR FOODIE PERSONALITY'}</Text>
            <Text style={styles.readyHeading}>Your sketch is ready</Text>
            {featured?.title ? <Text style={styles.readyTitle} numberOfLines={2}>"{featured.title}"</Text> : null}
            <Text style={styles.readyBody}>Vinster has sketched a fresh personality for you — take a look, share it with friends, or just enjoy it.</Text>
            <TouchableOpacity style={styles.readyPrimaryBtn} onPress={handleViewReady} activeOpacity={0.8}>
              <Text style={styles.readyPrimaryBtnText}>View my personality</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.readyDismissBtn} onPress={handleDismissReady} activeOpacity={0.7}>
              <Text style={styles.readyDismissBtnText}>Not now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Brand block sits higher now (no hamburger row above it) — moderate top pad.
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl },

  hero: { alignItems: 'center', marginBottom: spacing.sm },
  // Welcome overlay — centred brand sheet on first landing.
  welcomeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  welcomeSheet: { backgroundColor: colors.background, borderRadius: 20, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, alignItems: 'center', width: '100%', maxWidth: 420 },
  welcomeContinueBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xxl, alignItems: 'center', marginTop: spacing.lg },
  welcomeContinue: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.5 },
  logo: { width: 220, height: 170, marginBottom: 0 },
  tagline: { fontFamily: fonts.headingItalic, fontSize: 15, color: colors.gold, marginTop: -spacing.md, letterSpacing: 1 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: spacing.sm, marginBottom: spacing.sm, paddingHorizontal: spacing.xxl },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(224,184,74,0.55)' },
  ruleMark: { color: colors.gold, fontSize: 12, marginHorizontal: spacing.sm, fontFamily: fonts.headingSemibold },
  welcome: { fontFamily: fonts.headingItalic, fontSize: 18, color: '#FFFFFF', marginTop: spacing.xs },

  // Compact header — mirrors the other tab pages (Vinster mark top-left via
  // VinsterHeader, big centred title, blurb beneath).
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  appName: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  blurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, textAlign: 'center', marginBottom: spacing.xl },

  // Big gold-outlined Scan buttons (camera icon + label), each with a smaller
  // white Upload button beneath; the manual search bar sits last.
  actions: {},
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg },
  scanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 16, paddingVertical: spacing.md, marginTop: spacing.sm },
  scanIcon: { marginRight: spacing.sm },
  scanButtonText: { fontFamily: fonts.headingBold, fontSize: 20, color: '#FFFFFF', letterSpacing: 1, textAlign: 'center' },
  uploadButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  uploadButtonText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textAlign: 'center' },
  // "Search a Wine Name for Intel" — magnifying-glass icon left of the field.
  searchRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: spacing.md, backgroundColor: colors.surface, marginTop: spacing.md },
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
