import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';

export default function ChefTab() {
  const { setImage, setWineDetails, setError } = useLabelStore();

  async function handleUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/label/confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
      router.push('/label/confirm');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>Vinster</Text>
        <Text style={styles.subtitle}>Scan a wine label and receive meal inspiration.</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/label/camera')}>
          <Text style={styles.primaryButtonText}>Scan Label</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleUpload}>
          <Text style={styles.secondaryButtonText}>Upload Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  appName: { fontSize: 28, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  subtitle: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  body: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  primaryButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  secondaryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  secondaryButtonText: { color: colors.text, fontFamily: 'CormorantGaramond_400Regular', fontSize: 16 },
});
