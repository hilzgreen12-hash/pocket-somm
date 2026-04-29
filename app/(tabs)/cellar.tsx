import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import * as ImagePicker from 'expo-image-picker';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel, importCellarDocument } from '../../src/api/label';
import { useCellarImportStore } from '../../src/stores/cellarImportStore';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';

function requireAuth(session: ReturnType<typeof useAuth>['session'], action: () => void) {
  if (!session) {
    Alert.alert('Sign in required', 'You must be signed in to your account for access.');
    return;
  }
  action();
}

export default function CellarTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { session } = useAuth();
  const { setImage, setWineDetails, setError } = useLabelStore();
  const { setWines } = useCellarImportStore();
  const [importing, setImporting] = useState(false);

  async function handleImportDocument() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    setImporting(true);
    try {
      const base64 = await prepareImageBase64(result.assets[0].uri);
      const data = await importCellarDocument(base64);
      if (!data.wines || data.wines.length === 0) {
        Alert.alert('No wines found', 'Vinster could not identify any wines in that document. Try a clearer photo.');
        return;
      }
      setWines(data.wines);
      router.push('/cellar/import-preview');
    } catch (err) {
      Alert.alert('Error', 'Could not read the document. Please try again.');
    } finally {
      setImporting(false);
    }
  }

  async function handleUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
    }
    router.push('/label/confirm');
  }

  return (
    <View style={[styles.container, { paddingTop }]}>
      {importing && (
        <View style={styles.importingOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.importingText}>Reading your cellar document…</Text>
        </View>
      )}
      <View style={styles.hero}>
        <Text style={styles.title}>Cellar</Text>
        <Text style={styles.subtitle}>Scan or upload a wine label to add wines to your cellar, track your collection, and gain insight into your favourite bottles.</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewButton} onPress={() => requireAuth(session, () => router.push('/cellar/list'))}>
          <Text style={styles.viewButtonText}>View Cellar List</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.viewButton} onPress={() => requireAuth(session, () => router.push('/cellar/racks'))}>
          <Text style={styles.viewButtonText}>View Live Cellar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={() => requireAuth(session, () => router.push('/label/camera'))}>
          <Text style={styles.primaryButtonText}>Scan Wine Label</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => requireAuth(session, handleUpload)}>
          <Text style={styles.secondaryButtonText}>Upload Screenshot / Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => requireAuth(session, handleImportDocument)}>
          <Text style={styles.secondaryButtonText}>Import Cellar Document</Text>
        </TouchableOpacity>

      </View>
      <TabFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  hero: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  brandName: { fontSize: 22, fontFamily: 'CormorantGaramond_400Regular_Italic', color: 'rgba(255,255,255,0.50)', letterSpacing: 1, marginBottom: spacing.xl },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5 },
  subtitle: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  actions: { gap: spacing.sm },
  importingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10, gap: spacing.lg },
  importingText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
  viewButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  viewButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
  primaryButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  secondaryButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  secondaryButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
});
