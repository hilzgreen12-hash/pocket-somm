import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import * as ImagePicker from 'expo-image-picker';
import { useLabelStore } from '../../src/stores/labelStore';
import { useFoodPairingStore } from '../../src/stores/foodPairingStore';
import { useChefLabelHistory, useChefPairingHistory } from '../../src/hooks/useChefHistory';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';

interface AppMessage { title: string; body: string; }

export default function ChefTab() {
  const { height } = useWindowDimensions();
  // Match the Cellar / Community tabs so the header sits at a consistent
  // height across the bottom-nav surfaces.
  const paddingTop = Math.max(60, height * 0.13);
  const { setImage, setWineDetails, setError, setWineDetailsConfirmed, setPairings, setFilters, pairings, wineDetailsConfirmed } = useLabelStore();
  const { generalResult, cellarResult, setDish, setMode, setCellarResult, setGeneralResult } = useFoodPairingStore();
  const { sessions: labelSessions } = useChefLabelHistory();
  const { sessions: pairingSessions } = useChefPairingHistory();
  const [message, setMessage] = useState<AppMessage | null>(null);

  function handleViewLastPairing() {
    if (generalResult || cellarResult) {
      router.push('/chef/pairing-results');
      return;
    }
    const last = pairingSessions[0];
    if (!last) {
      setMessage({ title: 'No previous search', body: 'Once you save a wine pairing to your archive, you can come back here to revisit it.' });
      return;
    }
    setDish(last.dish);
    setMode(last.mode);
    if (last.mode === 'cellar') setCellarResult(last.cellar_result ?? []);
    else setGeneralResult(last.general_result ?? [], last.general_summary ?? undefined);
    router.push({
      pathname: '/chef/pairing-results',
      params: {
        fromHistory: 'true',
        savedAt: last.saved_at,
        city: last.city ?? '',
      },
    });
  }

  function handleViewLastLabelSearch() {
    if (wineDetailsConfirmed && pairings.length) {
      router.push('/chef/results');
      return;
    }
    const last = labelSessions[0];
    if (!last) {
      setMessage({ title: 'No previous search', body: 'Once you save a label scan to your archive, you can come back here to revisit it.' });
      return;
    }
    setWineDetailsConfirmed(last.wine);
    setPairings(last.pairings);
    setFilters(last.filters ?? null);
    router.push({
      pathname: '/chef/results',
      params: {
        fromHistory: 'true',
        savedAt: last.saved_at,
        city: last.city ?? '',
      },
    });
  }

  async function handleUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/chef/confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
      router.push('/chef/confirm');
    }
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <Text style={styles.appName}>Chef</Text>

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>
          Set your food preferences in your profile to ensure Vinster's recommendations are tailored to your tastes and dietary concerns.
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subheading}>Chosen your bottle first?</Text>
        <Text style={styles.sectionDesc}>
          Scan or upload a photo of the label to receive deep AI generated, top chef inspired recipe suggestions.
        </Text>
        <TouchableOpacity onPress={handleViewLastLabelSearch}>
          <Text style={styles.lastResultLink}>View last result</Text>
        </TouchableOpacity>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/chef/camera')}>
            <Text style={styles.buttonText}>Scan Wine Label</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={handleUpload}>
            <Text style={styles.buttonText}>Upload Screenshot / Photo</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.buttonFull, { borderColor: '#FFFFFF', marginTop: spacing.sm }]} onPress={() => router.push('/chef/archive')}>
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>View Your Cookbook</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subheading}>Need a wine for your recipe?</Text>
        <Text style={styles.sectionDesc}>
          Tell Vinster what you're cooking and we'll help guide a new purchase or pull a bottle from your cellar.
        </Text>
        <TouchableOpacity onPress={handleViewLastPairing}>
          <Text style={styles.lastResultLink}>View last result</Text>
        </TouchableOpacity>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.buttonHalf, { flex: 1 }]} onPress={() => router.push('/chef/find-pairing')}>
            <Text style={styles.buttonText}>Find a Wine Pairing</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={!!message} transparent animationType="fade" onRequestClose={() => setMessage(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMessage(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>{message?.title}</Text>
            <Text style={styles.modalBody}>{message?.body}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setMessage(null)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
    <TabFooter />
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appName: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm },
  profileNote: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: 24, marginBottom: spacing.xs },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  subheading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 24, color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center', marginBottom: spacing.xs },
  sectionDesc: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  lastResultLink: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', textDecorationLine: 'underline', textAlign: 'center', marginBottom: spacing.sm },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonFull: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  modalBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  modalButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  modalButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
});
