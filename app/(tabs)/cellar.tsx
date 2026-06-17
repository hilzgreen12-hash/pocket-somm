import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Modal, ActivityIndicator } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLineupStore } from '../../src/stores/lineupStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { useAuth } from '../../src/hooks/useAuth';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpButton } from '../../src/components/HelpButton';
import { VinsterHeader } from '../../src/components/VinsterHeader';

const CELLAR_HELP = `Your cellar, brought to life. Scan a label — or add a bottle by hand — and Vinster fills in the details for you: critic scores, tasting notes, drinking windows, and what each bottle is worth today.

Build virtual racks and fridges that mirror your real storage, so you always know where a bottle is and what's ready to open.

Dictate your wine reviews and view your label library while enjoying easy access to your full cellar stats. Truly a masterpiece in Cellar management.`;
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

export default function CellarTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  const { session } = useAuth();
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

  async function handleUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    // Show the scanning overlay so the user has a visual cue while the
    // image is encoded and the OCR edge function runs — without it the
    // app appears frozen for ~5–15s between the picker dismiss and the
    // confirm screen.
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
    router.push('/label/confirm');
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <VinsterHeader />

      <View style={styles.titleRow}>
        <Text style={styles.title}>Cellar</Text>
      </View>
      <Text style={styles.subtitle}>Gain quick insights into bottles and manage your collection. The only thing Vinster can't do with a bottle of wine is drink it.</Text>
      <HelpButton label="More About Cellar" title="How Cellar works" body={CELLAR_HELP} />

      <View style={styles.divider} />

      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => setAddWineOpen(true))}>
          <Text style={styles.buttonText}>Add Wine / Wine Intel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/cellar/stats'))}>
          <Text style={styles.buttonText}>Quick Cellar Stats</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => router.push('/cellar/list'))}>
          <Text style={styles.buttonText}>Cellar List</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/cellar/racks'))}>
          <Text style={styles.buttonText}>Racks & Fridges</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Your Archive. "Archive a Night" photographs a bottle lineup, matches
          each to the cellar and bulk-archives them; Cellar Archive lists the
          archived bottles. (Wine Reviews + Label Library now live in You.) */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => router.push('/cellar/archive-night'))}>
          <Text style={styles.buttonText}>Archive a Night</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/cellar/list?archived=1'))}>
          <Text style={styles.buttonText}>Cellar Archive</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Import an existing cellar from another app (Vivino, CellarTracker, a
          spreadsheet…) by screenshot/photo. */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => router.push('/cellar/import-cellar'))}>
          <Text style={styles.buttonText}>Import Cellar Document</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={addWineOpen} transparent animationType="fade" onRequestClose={() => setAddWineOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddWineOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a wine</Text>
            <Text style={styles.modalBody}>Scan the label or upload a photo and Vinster will pull in the details — or enter them yourself.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => { setAddWineOpen(false); router.push('/label/camera'); }}
            >
              <Text style={styles.modalButtonText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: spacing.sm }]}
              onPress={() => { setAddWineOpen(false); useLineupStore.getState().start(null); requireAuth(() => router.push('/cellar/scan-lineup')); }}
            >
              <Text style={styles.modalButtonText}>Scan a Lineup (up to 10 bottles)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: spacing.sm }]}
              onPress={() => { setAddWineOpen(false); handleUpload(); }}
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
                router.push('/label/confirm?manual=1');
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
  scanningOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  scanningSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, alignItems: 'center', gap: spacing.md, width: '100%' },
  // OCR overlay title — header-tier presence even though it's body
  // content. Cormorant per the modal-title rule (it sits as a title).
  scanningTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  // Overlay body — Inter.
  scanningBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  // Big "Cellar" tab title.
  title: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  // Italic blurb under the "Cellar" title — kept Cormorant per spec
  // ("blurbs below the headers on the tab screens").
  subtitle: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', textAlign: 'center', lineHeight: 26, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  // Body description text under section CTAs — Inter for readability.
  sectionDesc: { fontSize: 17, fontFamily: fonts.bodyRegular, color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonFull: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  // Button labels — Cormorant.
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  buttonDisabled: { borderColor: colors.borderLight, opacity: 0.45 },
  buttonTextDisabled: { color: colors.textMuted, fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // Coming-soon note — body content.
  comingSoonNote: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  // Pop-up title Cormorant, body Inter.
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  modalBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  modalButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  // Pop-up button — Cormorant.
  modalButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  // Cancel link in pop-up — body / link, Inter.
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
