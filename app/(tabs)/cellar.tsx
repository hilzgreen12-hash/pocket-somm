import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Modal, ActivityIndicator } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import * as ImagePicker from 'expo-image-picker';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { useAuth } from '../../src/hooks/useAuth';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { colors, spacing } from '../../src/constants/theme';

export default function CellarTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { session } = useAuth();
  const { setImage, setWineDetails, setError } = useLabelStore();
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

      <Text style={styles.title}>Cellar</Text>

      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => setAddWineOpen(true))}>
          <Text style={styles.buttonText}>Add Wine / Generate Wine Intel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs, borderColor: '#FFFFFF' }]} onPress={() => requireAuth(() => router.push('/cellar/full-list'))}>
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Full Cellar List</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionDesc, { marginTop: spacing.lg }]}>
          View your cellar stats and your virtual storage racks, edit your cellar.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(() => router.push('/cellar/list'))}>
            <Text style={styles.buttonText}>Quick Cellar Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(() => router.push('/cellar/racks'))}>
            <Text style={styles.buttonText}>View / Edit Storage</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.buttonHalf, { borderColor: '#FFFFFF' }]} onPress={() => requireAuth(() => router.push('/cellar/wishlist'))}>
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>View Wish List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonHalf, { borderColor: '#FFFFFF' }]} onPress={() => requireAuth(() => router.push('/cellar/archive'))}>
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>View Archived Wines</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Section 3 — Import */}
      <View style={styles.section}>
        <Text style={styles.sectionDesc}>
          Import wines into your cellar from a photo (printed inventory, receipt, invoice) or a spreadsheet (CSV with columns: wine, producer, region, vintage, quantity, price).
        </Text>
        <Text style={styles.comingSoonNote}>(coming soon)</Text>
        <View style={styles.buttonRow}>
          <View style={[styles.buttonHalf, styles.buttonDisabled]}>
            <Text style={styles.buttonTextDisabled}>Photo / Receipt</Text>
          </View>
          <View style={[styles.buttonHalf, styles.buttonDisabled]}>
            <Text style={styles.buttonTextDisabled}>Upload Spreadsheet</Text>
          </View>
        </View>
      </View>

      <Modal visible={addWineOpen} transparent animationType="fade" onRequestClose={() => setAddWineOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddWineOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a wine</Text>
            <Text style={styles.modalBody}>Scan the label or upload a photo and Vinster will pull in the details.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => { setAddWineOpen(false); router.push('/label/camera'); }}
            >
              <Text style={styles.modalButtonText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: spacing.sm }]}
              onPress={() => { setAddWineOpen(false); handleUpload(); }}
            >
              <Text style={styles.modalButtonText}>Upload Screenshot / Photo</Text>
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
    <TabFooter />
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scanningOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  scanningSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, alignItems: 'center', gap: spacing.md, width: '100%' },
  scanningTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  scanningBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.lg },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sectionDesc: { fontSize: 17, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonFull: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
  buttonDisabled: { borderColor: colors.borderLight, opacity: 0.45 },
  buttonTextDisabled: { color: colors.textMuted, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
  comingSoonNote: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  modalBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  modalButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  modalButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
});
