import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import * as ImagePicker from 'expo-image-picker';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';

export default function ChefTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { setImage, setWineDetails, setError } = useLabelStore();

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
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Chef</Text>
        <Text style={styles.subtitle}>Choose a bottle, scan the label, and receive deep AI generated, top Chef inspired recipe inspiration.</Text>
        <Text style={styles.subtitle}>Tell us what you're cooking and we'll help guide a new purchase or pull a bottle from your cellar.</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/chef/find-pairing')}>
          <Text style={styles.secondaryButtonText}>Find a Wine Pairing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/chef/camera')}>
          <Text style={styles.primaryButtonText}>Scan Wine Label</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleUpload}>
          <Text style={styles.secondaryButtonText}>Upload Screenshot / Photo</Text>
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
  appName: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5 },
  subtitle: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  actions: { gap: spacing.sm },
  primaryButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  secondaryButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  secondaryButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
});
