import { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../../src/components/AppAlert';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HelpButton } from '../../src/components/HelpButton';
import { useScanStore } from '../../src/stores/scanStore';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { useAuth } from '../../src/hooks/useAuth';
import { scanHistoryKey } from '../../src/hooks/useScanHistory';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const SCAN_HELP = `Vinster filters wine lists to offer three recommendations tailored to your profile preferences and what it's learned about your tastes.

Vinster is trained by wine professionals to weigh up what it discovers online regarding average critic scores, region specific vintage quality, value for money, and rarity.`;

export default function ScanTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  const { session } = useAuth();
  const { setExtractedWines, setRecommendation } = useScanStore();
  const { setImage, setWineDetails, setError, reset: resetLabelStore } = useLabelStore();

  const [addWineOpen, setAddWineOpen] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [scanningLabel, setScanningLabel] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  function requireAuth(action: () => void) {
    if (!session) {
      pendingActionRef.current = action;
      setSignInPromptVisible(true);
      return;
    }
    action();
  }

  function dismissSignInPrompt() {
    setSignInPromptVisible(false);
    pendingActionRef.current = null;
  }

  function continueWithoutAccount() {
    setSignInPromptVisible(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }

  // ---- Wine List: revisit the last restaurant-list recommendation ----
  async function handleViewLastListResult() {
    try {
      const raw = await AsyncStorage.getItem(scanHistoryKey(session?.user.id));
      const items = raw ? JSON.parse(raw) : [];
      if (!items.length) {
        showAlert({ title: 'No previous search', body: 'Once you scan a wine list, you can come back here to revisit it.' });
        return;
      }
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

  // ---- Wine Label: the Generate Wine Intel flow (moved here from Cellar) ----
  // Re-hydrate the (transient) label store from the persisted snapshot, then
  // open the intel card. Needed because /label/results reads the label store,
  // which is empty after a restart even though the persisted result survives.
  function handleViewLastIntel() {
    const { wine, intel } = useLastIntelStore.getState();
    if (!wine || !intel) {
      showAlert({ title: 'No previous result', body: 'Once you generate wine intel from a label, you can come back here to revisit it.' });
      return;
    }
    const ls = useLabelStore.getState();
    ls.setWineDetailsConfirmed(wine);
    ls.setIntelligence(intel);
    router.push('/label/results?context=intel');
  }

  async function handleUploadLabel() {
    if (!(await ensureMediaPermission('library'))) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    // Scanning overlay covers the ~5–15s OCR round-trip so the app doesn't
    // appear frozen between the picker dismiss and the confirm screen.
    setScanningLabel(true);
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
    } finally {
      setScanningLabel(false);
    }
    router.push('/label/confirm?context=intel');
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <VinsterHeader />

      <View style={styles.titleRow}>
        <Text style={styles.appName}>Scan</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.topBlurb}>
          Scan or upload a restaurant wine list for tailored recommendations, save and review bottles and restaurants. Scan or upload a wine label to generate intel and dive deeply into what's in the bottle.
        </Text>
        <HelpButton label="More About Scan" title="How Scan works" body={SCAN_HELP} />
      </View>

      <View style={styles.divider} />

      {/* Wine List → restaurant-list recommendations */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => router.push('/scan/wine-list')}>
          <Text style={styles.buttonText}>Wine List</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleViewLastListResult}>
          <Text style={styles.lastResultLink}>View Last Result</Text>
        </TouchableOpacity>
      </View>

      {/* Wine Label → Generate Wine Intel */}
      <View style={[styles.section, { marginTop: spacing.lg }]}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => setAddWineOpen(true))}>
          <Text style={styles.buttonText}>Wine Label</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleViewLastIntel}>
          <Text style={styles.lastResultLink}>View Last Result</Text>
        </TouchableOpacity>
      </View>

      {/* Generate Wine Intel chooser (same flow as the old Cellar button). */}
      <Modal visible={addWineOpen} transparent animationType="fade" onRequestClose={() => setAddWineOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddWineOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Generate Wine Intel</Text>
            <Text style={styles.modalBody}>Scan, upload, or enter a wine and Vinster will pull in critic scores, tasting notes, the drinking window and estimated value.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => { setAddWineOpen(false); router.push('/label/camera?context=intel'); }}
            >
              <Text style={styles.modalButtonText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: spacing.sm }]}
              onPress={() => { setAddWineOpen(false); handleUploadLabel(); }}
            >
              <Text style={styles.modalButtonText}>Upload A Wine Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: spacing.sm }]}
              onPress={() => {
                setAddWineOpen(false);
                // Clear any prior scan so Confirm Wine Details opens blank
                // for the user to fill in by hand.
                resetLabelStore();
                router.push('/label/confirm?manual=1&context=intel');
              }}
            >
              <Text style={styles.modalButtonText}>Manual Input</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddWineOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={scanningLabel} transparent animationType="fade">
        <View style={styles.scanningOverlay}>
          <View style={styles.scanningSheet}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={styles.scanningTitle}>Reading your wine label…</Text>
            <Text style={styles.scanningBody}>
              Vinster is identifying the producer, region and vintage from your photo.
            </Text>
          </View>
        </View>
      </Modal>

      <SignInPromptModal
        visible={signInPromptVisible}
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
  // Big "Scan" tab title — header, Cormorant.
  appName: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  // Top blurb under the Scan heading — kept Cormorant per user spec
  // ("blurbs below the headers on the tab screens").
  topBlurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs, textAlign: 'center' },
  // Gold "More About Scan" placeholder link beneath the blurb.
  moreAboutLink: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center' },
  // "View last result" link — matches the other tab pages.
  lastResultLink: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center', marginBottom: spacing.sm },
  buttonFull: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  scanningOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  scanningSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, alignItems: 'center', gap: spacing.md, width: '100%' },
  scanningTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  scanningBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  modalBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  modalButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  modalButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
