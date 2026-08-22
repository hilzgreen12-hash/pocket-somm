import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Image, ActivityIndicator, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { prepareImageBase64, scanLabel } from '../../src/api/label';
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
  const [scanningLabel, setScanningLabel] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [hardGate, setHardGate] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // First landing after opening the app shows the full brand hero; returning to
  // the Scan tab (after using a function, or switching tabs and back) shows the
  // compact "like any other page" header. Focus count survives while the tab
  // stays mounted; it resets on a fresh app launch, so the hero returns then.
  const [compact, setCompact] = useState(false);
  const focusCountRef = useRef(0);
  useFocusEffect(useCallback(() => {
    focusCountRef.current += 1;
    if (focusCountRef.current > 1) setCompact(true);
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

  // "Search A Wine" — the manual-input entry point; carries the typed text into
  // the manual Confirm flow where the predictive search picks it up.
  function submitWineSearch() {
    const q = wineSearch.trim();
    if (!q) return;
    requireAuth(() => {
      resetLabelStore();
      setWineSearch('');
      router.push(`/label/confirm?manual=1&context=intel&seed=${encodeURIComponent(q)}&backTo=${encodeURIComponent('/(tabs)')}`);
    });
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

      {compact ? (
        <>
          <VinsterHeader />
          <View style={styles.titleRow}>
            <Text style={styles.appName}>Scan</Text>
          </View>
          <Text style={styles.blurb}>
            Scan or upload a wine label for deep intel on the bottle, or a wine list for tailored recommendations. Or search a wine by name.
          </Text>
        </>
      ) : (
        <View style={styles.hero}>
          <Image source={require('../../assets/vinster-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>Your AI Sommelier</Text>
          <View style={styles.ruleRow}>
            <View style={styles.rule} />
            <Text style={styles.ruleMark}>◇</Text>
            <View style={styles.rule} />
          </View>
          <Text style={styles.welcome}>{username ? `Welcome, ${username}` : 'Welcome'}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {/* Wine Label → intel. Big gold Scan (camera) with a smaller white
            Upload beneath. Long-press Scan to revisit the last intel card. */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => requireAuth(() => router.push(`/label/camera?context=intel&backTo=${encodeURIComponent('/(tabs)')}`))}
          onLongPress={() => requireAccount(handleViewLastIntel)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="camera-outline" size={26} color={colors.gold} style={styles.scanIcon} />
          <Text style={styles.scanButtonText}>Scan a Wine Label</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={() => requireAuth(handleUploadLabel)} activeOpacity={0.8}>
          <Text style={styles.uploadButtonText}>Upload Wine Label</Text>
        </TouchableOpacity>

        {/* Wine List → recommendations. Long-press Scan to revisit the last. */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/scan/wine-list')}
          onLongPress={() => requireAccount(handleViewLastListResult)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="camera-outline" size={26} color={colors.gold} style={styles.scanIcon} />
          <Text style={styles.scanButtonText}>Scan a Wine List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={() => router.push('/scan/wine-list?upload=1')} activeOpacity={0.8}>
          <Text style={styles.uploadButtonText}>Upload Wine List</Text>
        </TouchableOpacity>

        {/* Manual-input search — type a wine to generate intel by hand. */}
        <TextInput
          style={styles.searchInput}
          value={wineSearch}
          onChangeText={setWineSearch}
          placeholder="Search A Wine"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={submitWineSearch}
        />
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
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xl },

  hero: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 240, height: 210, marginBottom: spacing.xs },
  tagline: { fontFamily: fonts.headingItalic, fontSize: 15, color: colors.gold, marginTop: 2, letterSpacing: 1 },
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
  scanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 16, paddingVertical: spacing.lg, marginTop: spacing.md },
  scanIcon: { marginRight: spacing.sm },
  scanButtonText: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold, letterSpacing: 1, textAlign: 'center' },
  uploadButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  uploadButtonText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, textAlign: 'center', marginTop: spacing.md },

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
