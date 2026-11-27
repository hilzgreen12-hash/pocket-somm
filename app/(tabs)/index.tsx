import { NAMED_LABELS, RESTAURANT_IMG } from '../../src/components/ExamplePlaceholder';
import { JournalCarousel } from '../../src/components/JournalCarousel';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Image, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
// Page scroll from the gesture library, so a picked-up carousel section cancels
// the page scroll instead of fighting it.
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { router, useFocusEffect, useRootNavigationState } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { launchImageLibrary } from '../../src/utils/imagePicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../../src/components/AppAlert';
import { CompareWinesModal } from '../../src/components/CompareWinesModal';
import { useCompareStore } from '../../src/stores/compareStore';
import { ensureConnectionForUpload } from '../../src/utils/connectionGuard';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HelpTitle } from '../../src/components/HelpTitle';
import { RecentScansCarousel } from '../../src/components/RecentScansCarousel';
import { DrinkNowCarousel } from '../../src/components/DrinkNowCarousel';
import { CellarInsightsCarousel } from '../../src/components/CellarInsightsCarousel';
import { ReorderableSections, mergeSectionOrder, useAutoScrollHost } from '../../src/components/ReorderableSections';
import { useAuth } from '../../src/hooks/useAuth';
import { useScanStore } from '../../src/stores/scanStore';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { classifyLabelRead, alertBadLabelPhoto, alertLabelFailure } from '../../src/services/labelRead';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { scanHistoryKey } from '../../src/hooks/useScanHistory';
import type { WineDetailsComplete } from '../../src/types/wine';
import { HOME_TILE, colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import { MAX_SHARED_PDF_BYTES } from '../../src/api/scanJob';

// Module-level so it survives the Scan tab unmounting/remounting on navigation:
// the welcome overlay shows once per app session (a fresh launch resets it),
// not every time the user returns to the Scan tab.
let welcomeShownThisSession = false;

// "How Scan works" — the help body behind the underlined Scan title, matching
// the other tabs' tappable titles.
// Search & Discover tile images (bundled). The restaurant photo (RESTAURANT_IMG)
// is from Unsplash (free licence) — see assets/images/tiles/CREDITS.md.
// Light labels only — the Search tile reads best bright (Piper Rare was too dark).
// Compare Wines tile: two Bordeaux labels side by side.
const SD_COMPARE_IMAGES = [NAMED_LABELS.gruaudLarose, NAMED_LABELS.rocDeCambes];
// Generate Wine Intel tile: one label, Dönnhoff.
const SD_INTEL_IMAGE = NAMED_LABELS.donnhoff;

// The Home carousels take no props, so memoised copies don't redraw when only
// Home's own state changes (e.g. while a section is being dragged).
const RecentScansMemo = memo(RecentScansCarousel);
const DrinkNowMemo = memo(DrinkNowCarousel);
const CellarInsightsMemo = memo(CellarInsightsCarousel);
const JournalMemo = memo(JournalCarousel);

// A repeat of the same share within this window is the same event, not a re-share.
const SHARE_REPEAT_MS = 4000;
const HOME_ORDER_KEY = 'home_section_order_v1';
const HOME_SECTION_DEFAULT = ['search', 'scans', 'cellar', 'insights', 'musings'];

const SCAN_HELP = `Expert training + Wine Searcher Market API result in the most comprehensive and customized experience in wine exploration.

Home is your starting point. Scan a label for instant Wine Intel — critic scores, tasting notes, drinking windows and today's value — or scan a wine list for tailored picks from the menu. No label to hand? Search a Wine from Vinster's catalogue. Below, revisit your Recent Scans, see which cellar bottles are drinking now, and catch up on Community Musings.`;

// The Scan landing — the app's home tab. A 2×2 grid of scan actions (each with
// a corner "Upload" button) plus a Search tile, then the Your Lineup Archive
// carousel. The six-tab bar handles all other navigation, so there's no hamburger.
// The web link in a share: the shared URL itself, or the first link in shared
// text ("Our list (https://…pdf)." → without the trailing bracket and full stop).
function sharedLink(webUrl: string | null | undefined, text: string | null | undefined): string | null {
  const raw = webUrl || (text ?? '').match(/https?:\/\/\S+/)?.[0];
  return raw ? raw.replace(/[)\].,;:!?'"’”>]+$/, '') : null;
}

// Run a pop-up button's action once the pop-up has gone. iOS swallows a picker
// or pop-up opened while the previous one is still dismissing, so it waits;
// Android doesn't need to.
function afterAlertCloses(fn: () => void): () => void {
  return () => { if (Platform.OS === 'ios') setTimeout(fn, 350); else fn(); };
}

export default function ScanLandingScreen() {
  const { session, loading: authLoading } = useAuth();
  // Match every other tab page's top spacing so the Vinster mark + title sit at
  // a consistent height across the bottom-nav surfaces.
  const { height } = useWindowDimensions();
  // SET RULE: every tab page's title sits at the SAME height. This must match
  // Review (scan.tsx), Pair (chef.tsx), Cellar, Share and You exactly — the same
  // Math.max(55, height * 0.095) with no per-tab nudges.
  const paddingTop = Math.max(55, height * 0.095);
  const username = (session?.user.user_metadata?.display_name ?? '').trim();
  const { setImage, setWineDetails, setWineDetailsConfirmed, setIntelligence, reset: resetLabelStore } = useLabelStore();
  const { setExtractedWines, setRecommendation } = useScanStore();
  const { preferences } = usePreferences();

  // Compare Wines or Vintages pop-up.
  const [compareOpen, setCompareOpen] = useState(false);
  const [scanningLabel, setScanningLabel] = useState(false);

  // The Scan tab always shows its normal compact header. On the first landing
  // after opening the app, a welcome overlay (logo · "Real Wine Experience, AI Delivered" ·
  // Welcome) appears over it, dismissed with "Continue". Shown once per app
  // session (the ref resets on a fresh launch).
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  useFocusEffect(useCallback(() => {
    if (!welcomeShownThisSession) { welcomeShownThisSession = true; setWelcomeOpen(true); }
    // Back from a failed wine-list scan's Try Again: reopen the list chooser.
    if (useScanStore.getState().restartListChoice) {
      useScanStore.getState().setRestartListChoice(false);
      setTimeout(() => openWineListChoice(), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

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

  async function handleUploadLabel() {
    try {
      if (!(await ensureMediaPermission('library'))) return;
      const result = await launchImageLibrary({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets[0]) return;
      await scanLabelFromUri(result.assets[0].uri);
    } catch (err) {
      // Never fail silently — a picker that can't open must say so.
      showAlert({ title: 'Could not open your photos', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Read a label photo and open its Wine Intel — shared by Upload a Label and a
  // photo shared into Vinster as "A Wine Label". The user has said it's a label.
  async function scanLabelFromUri(uri: string) {
    const backTo = encodeURIComponent('/(tabs)');
    if (!(await ensureConnectionForUpload())) return;
    setScanningLabel(true);
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      const kind = classifyLabelRead(details);
      // Not a label, or nothing readable: say so (don't build a card from it).
      // A wine list picked by mistake can still be read as one.
      if (kind !== 'label') {
        setScanningLabel(false);
        alertBadLabelPhoto(kind === 'unreadable' ? 'unreadable' : 'not-wine',
          kind === 'list' ? { text: 'Read as a Wine List', onPress: () => openSharedWineList({ imageUri: uri }) } : undefined);
        return;
      }
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
      // Straight to the card, built ON the results screen (instant shell +
      // swirls), as a camera scan does: no confirm detour when Wine-Searcher
      // doesn't list the wine by this name (the card's own checks still stop a
      // wine that doesn't exist). A label upload IS a tile scan, so it records
      // to Recent Scans (no noRecent).
      setIntelligence(null);
      setScanningLabel(false);
      router.push(`/label/results?context=intel&via=upload&fresh=1&gen=1&backTo=${backTo}`);
    } catch (err) {
      // Server or connection trouble — say which (never a blank form).
      setScanningLabel(false);
      alertLabelFailure(err);
    }
  }

  // Something shared to Vinster from another app's share sheet:
  //   a web page or PDF link  → the wine list online (preferences, then read)
  //   a PDF file              → that PDF as the wine list
  //   a photo / screenshot    → a label (Wine Intel) or, if it's a list, the list scan
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  // The last share handled and when. The same share event can arrive twice in
  // quick succession (the effect re-running as login or navigation settles);
  // only that is ignored — sharing the same photo again later must work.
  const sharedHandledRef = useRef<{ key: string; at: number } | null>(null);
  // A share can restart Vinster's screen (Android opens it inside the sharing
  // app first), and Home then appears before the app's navigation is ready —
  // opening the list at that moment crashed to a white screen. Wait for it.
  const navReady = !!useRootNavigationState()?.key;
  useEffect(() => {
    // Opening from a share can also beat the login restoring — wait for that
    // too. Signed out, the share is kept (not reset) until the user has signed
    // in and is back here.
    if (!hasShareIntent || authLoading || !session || !navReady) return;
    const intent = shareIntent;
    resetShareIntent();
    const files = intent?.files ?? [];
    const pdf = files.find((f) => (f.mimeType ?? '').includes('pdf') || /\.pdf$/i.test(f.path ?? ''));
    const image = files.find((f) => (f.mimeType ?? '').startsWith('image/'));
    const link = sharedLink(intent?.webUrl, intent?.text);
    const key = pdf?.path ?? image?.path ?? link ?? files[0]?.path ?? intent?.text ?? '';
    // One line per share in the device log (no file contents or addresses), so
    // a share that seems to do nothing can be traced with adb logcat.
    const kind = pdf ? 'pdf' : image ? 'photo' : link ? 'link' : files.length ? 'file' : 'text';
    const last = sharedHandledRef.current;
    if (!key || (last && last.key === key && Date.now() - last.at < SHARE_REPEAT_MS)) {
      console.log(`[Share] ${kind} ignored (${key ? 'repeat of the same share' : 'nothing usable'})`);
      return;
    }
    console.log(`[Share] ${kind} received`);
    sharedHandledRef.current = { key, at: Date.now() };
    const asUri = (p: string) => (p.startsWith('file://') || p.startsWith('content://') ? p : `file://${p}`);
    if (pdf?.path) {
      // Big PDFs can't be sent whole — the list's web link is the better route.
      if ((pdf.size ?? 0) > MAX_SHARED_PDF_BYTES) {
        showAlert({ title: 'That PDF is too large', body: "Vinster can read PDFs up to 10 MB. Share the wine list's web link instead, or a screenshot of the page you want." });
        return;
      }
      openSharedWineList({ fileUri: asUri(pdf.path), title: pdf.fileName ?? 'Wine list (PDF)' });
    } else if (image?.path) {
      chooseSharedPhotoUse(asUri(image.path));
    } else if (link) {
      openSharedWineList({ url: link, title: intent?.meta?.title ?? undefined });
    } else {
      // A file type or plain text Vinster can't use (a document, a note…).
      showAlert({ title: "Vinster can't read that", body: 'Share a photo or screenshot of a wine list or label, a PDF wine list, or the web link to a wine list.' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShareIntent, shareIntent, authLoading, session, navReady]);

  // A photo shared into Vinster could be a label, a list or a lineup — guessing
  // turned lineups into "that doesn't look like a wine label", so ask.
  function chooseSharedPhotoUse(uri: string) {
    const after = afterAlertCloses;
    showAlert({
      title: "What's in this photo?",
      showCloseX: true,
      buttons: [
        { text: 'A Wine Label', onPress: after(() => { void scanLabelFromUri(uri); }) },
        { text: 'A Wine List', onPress: after(() => openSharedWineList({ imageUri: uri })) },
        { text: 'A Lineup', onPress: after(() => router.push(`/cellar/archive-night?photo=${encodeURIComponent(uri)}` as any)) },
      ],
    });
  }

  // A wine list that arrived from outside (a shared link, PDF or screenshot):
  // open Wine List Preferences with it ready; Read Wine List then reads it.
  function openSharedWineList(src: { url?: string; fileUri?: string; title?: string; imageUri?: string }) {
    const st = useScanStore.getState();
    if (src.imageUri) {
      st.setImage(src.imageUri, 'upload');
      router.push('/scan/wine-list?shared=1' as any);
      return;
    }
    let domain: string | undefined;
    try { domain = src.url ? new URL(src.url).hostname.replace(/^www\./, '') : undefined; } catch { domain = undefined; }
    st.setOnlineSource({ url: src.url ?? '', restaurant: '', city: null, title: src.title ?? domain ?? 'Wine list', domain, fileUri: src.fileUri });
    router.push('/scan/wine-list?online=1' as any);
  }

  // Generate Wine Intel tile → choose how to find the wine. On iOS each action
  // waits for the pop-up to finish closing (a picker or another pop-up opened
  // while it is still dismissing gets swallowed); Android opens at once, as the
  // other upload buttons do.
  function openWineIntelChoice() {
    const after = afterAlertCloses;
    showAlert({
      title: 'How would you like to search your wine?',
      showCloseX: true,
      buttons: [
        // The same Search/Manual Input screen as Cellar → Add Wines: search
        // first, "Input Your Wine Instead ▾" to type it in; Confirm → Wine Intel.
        { text: 'Search/Manual Input', onPress: after(() => { resetLabelStore(); router.push(`/label/confirm?manual=1&context=intel&backTo=${encodeURIComponent('/(tabs)')}`); }) },
        { text: 'Scan a Label', onPress: after(() => router.push(`/label/camera?context=intel&backTo=${encodeURIComponent('/(tabs)')}`)) },
        { text: 'Upload a Label', onPress: after(handleUploadLabel) },
      ],
    });
  }

  // Read A Wine List tile → choose how Vinster gets the list (Find Online
  // searches the web for the restaurant's list).
  function openWineListChoice() {
    const after = afterAlertCloses;
    showAlert({
      title: 'How should Vinster read the list?',
      showCloseX: true,
      buttons: [
        { text: 'Find Online', onPress: after(() => router.push('/scan/find-online')) },
        { text: 'Scan a List', onPress: after(() => router.push('/scan/wine-list')) },
        { text: 'Upload a List', onPress: after(() => router.push('/scan/wine-list?upload=1')) },
        { text: 'View Last Result', style: 'link', onPress: after(handleViewLastListResult) },
      ],
    });
  }

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
        {/* "Ask Vinster" (Home voice command) is archived: voice command now lives
            only on Pair and Cellar. HomeVoiceModal stays (Cellar still uses it). */}
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
            // Generate Wine Intel, Compare Wines or Vintages, and Read A Wine List.
            content: (
                <View style={styles.carouselBleed}>
                  <Text style={styles.sdSubheader} allowFontScaling={false}>Powered by Wine Searcher</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sdCarousel}>
                    {/* Generate Wine Intel — one tile for every way in: a pop-up
                        offers Search/Manual Input, Scan a Label or Upload a Label.
                        Long-press reopens the last intel. */}
                    <View style={styles.sdCard}>
                      <TouchableOpacity
                        style={styles.sdThumb}
                        onPress={openWineIntelChoice}
                        onLongPress={handleViewLastIntel}
                        activeOpacity={0.85}
                      >
                        <Image source={SD_INTEL_IMAGE} style={styles.sdImage} resizeMode="cover" />
                      </TouchableOpacity>
                      <Text style={styles.sdName} numberOfLines={1} allowFontScaling={false}>Label Scan & Search</Text>
                      <Text style={styles.sdStamp} numberOfLines={1} allowFontScaling={false}>Generate Wine Intel</Text>
                    </View>

                    {/* Compare Wines or Vintages → pick 2 to 4 wines, then Vinster's
                        side-by-side comparison. */}
                    <View style={styles.sdCard}>
                      <TouchableOpacity style={styles.sdThumb} onPress={() => setCompareOpen(true)} activeOpacity={0.85}>
                        <View style={styles.sdCollage}>
                          {SD_COMPARE_IMAGES.map((img, i) => (
                            <Image key={i} source={img} style={styles.sdCompareCell} resizeMode="cover" />
                          ))}
                        </View>
                      </TouchableOpacity>
                      <Text style={styles.sdName} numberOfLines={1} allowFontScaling={false}>Compare Wines</Text>
                      <Text style={styles.sdStamp} numberOfLines={1} allowFontScaling={false}>Up to 4 at a time</Text>
                    </View>

                    {/* Read A Wine List → a pop-up offers Scan a List or Upload a
                        List. Long-press reopens the last list result. */}
                    <View style={styles.sdCard}>
                      <TouchableOpacity
                        style={styles.sdThumb}
                        onPress={openWineListChoice}
                        onLongPress={handleViewLastListResult}
                        activeOpacity={0.85}
                      >
                        <Image source={RESTAURANT_IMG} style={styles.sdImage} resizeMode="cover" />
                      </TouchableOpacity>
                      <Text style={styles.sdName} numberOfLines={1} allowFontScaling={false}>Read A Wine List</Text>
                      <Text style={styles.sdStamp} numberOfLines={1} allowFontScaling={false}>Restaurant Bottle Picks</Text>
                    </View>
                  </ScrollView>
                </View>
            ),
          },
          // Recent Scans — mixed label + list scans, most recent first.
          { key: 'scans', title: 'Label Scan Library', content: <View style={styles.carouselBleed}><RecentScansMemo /></View> },
          // Drink Now — cellar bottles at last call, most urgent first.
          { key: 'cellar', title: 'Cellar Insights', content: <View style={styles.carouselBleed}><DrinkNowMemo /></View> },
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
            <Text style={styles.scanningTitle}>Reading your label…</Text>
          </View>
        </View>
      </Modal>

      <CompareWinesModal
        visible={compareOpen}
        onClose={() => setCompareOpen(false)}
        onConfirm={(wines) => {
          useCompareStore.getState().setWines(wines);
          setCompareOpen(false);
          setTimeout(() => router.push('/compare'), 350);
        }}
      />

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
  // Rule beneath the title row, above Search & Discover.
  // Short line under the Home title — same look as the Cellar tab's subtitle.
  homeSubtitle: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', textAlign: 'center', lineHeight: 26 },
  blurbSeparator: { height: 1, backgroundColor: colors.divider, marginTop: 18, marginBottom: 18 },

  // Discover carousels — section header, full-width separator, and a bleed
  // wrapper so each carousel scrolls edge-to-edge past the scroll's h-padding.
  // 18pt under the last caption line beneath the tiles (as under the header).
  sectionSeparator: { height: 1, backgroundColor: colors.divider, marginTop: 18, marginBottom: 18 },
  carouselHeader: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.text, letterSpacing: 0.5, textAlign: 'center', marginBottom: spacing.md },

  carouselBleed: { marginHorizontal: -spacing.xl },
  // Search & Discover carousel — same card shape as the carousels below
  // (220×165 image, title, gold note).
  // "Powered by Wine Searcher" under the Search & Discover title — gold caps (the app accent).
  sdSubheader: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', marginTop: -spacing.xs, marginBottom: spacing.sm, paddingHorizontal: spacing.xl },
  sdCarousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  sdCard: { width: HOME_TILE.w },
  // Home tile size, photo edge to edge inside a white outline.
  sdThumb: { width: HOME_TILE.w, height: HOME_TILE.h, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderWhite },
  // Faded like the Community Musings cards: image at 55% under a dark scrim.
  sdImage: { width: '100%', height: '100%', opacity: 0.85 },
  sdCollage: { width: '100%', height: '100%', flexDirection: 'row', flexWrap: 'wrap' },
  sdCompareCell: { width: '50%', height: '100%', opacity: 0.85 },
  // White name + gold line beneath, matching the carousels below.
  // Fonts swapped (colours kept): the white top line takes the small capitals,
  // the gold line beneath takes the heading font.
  sdName: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.text, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  sdStamp: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, marginTop: 3, letterSpacing: 0.2 },

  vintageCancel: { alignItems: 'center', paddingBottom: 4 },
  vintageCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },

  scanningOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  scanningSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, alignItems: 'center', gap: spacing.md, width: '100%' },
  scanningTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
});
