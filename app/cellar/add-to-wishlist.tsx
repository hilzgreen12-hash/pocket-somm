import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '../../src/components/AppAlert';
import { router } from 'expo-router';
import { useWishList } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';

export default function AddToWishListScreen() {
  const { addWine } = useWishList();
  const { session } = useAuth();
  const { setImage, setWineDetails } = useLabelStore();

  const [wineName, setWineName] = useState('');
  const [producer, setProducer] = useState('');
  const [region, setRegion] = useState('');
  const [vintage, setVintage] = useState('');
  // Bottle size isn't relevant for a wish-list wine — they haven't
  // bought it yet, so 750ml is assumed at insert time and the picker
  // is hidden from this screen. The cellar add flow still surfaces
  // it because that IS a real bottle entering the rack.
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSave() {
    // Dismiss the keyboard explicitly so the iOS first-tap-eats-the-tap
    // bug can't strand the user on a focused TextInput.
    Keyboard.dismiss();
    if (!wineName.trim()) {
      showAlert({ title: 'Wine name required', body: 'Please enter a wine name.' });
      return;
    }
    if (!session?.user.id) return;
    setSaving(true);
    try {
      const trimmedName = wineName.trim();
      const trimmedProducer = producer.trim();
      const trimmedVintage = vintage.trim();
      await addWine.mutateAsync({
        user_id: session.user.id,
        wine_name: trimmedName,
        producer: trimmedProducer || null,
        region: region.trim() || null,
        vintage: trimmedVintage || null,
        quantity: 1,
        storage_location: null,
        date_received: new Date().toISOString().split('T')[0],
        critic_score: null,
        drinking_window_from: null,
        drinking_window_to: null,
        drinking_window_status: 'unknown',
        tasting_notes: null,
        grape_variety: null,
        label_image_path: null,
        user_notes: null,
        is_wishlist: true,
        // Default to 750ml silently — wishlist wines haven't been
        // bought yet, so a format picker on this screen is noise.
        bottle_size_ml: 750,
      });
      // Confirmation includes the vintage so the user sees the FULL
      // identity of what just landed on their wish list ("Château
      // Margaux 2013" not "Château Margaux"). Falls back gracefully
      // when no producer/vintage was entered.
      const confirmLabel = [trimmedProducer, trimmedName, trimmedVintage]
        .filter((s) => s && s.length > 0)
        .join(' ');
      showAlert({
        title: 'Added to your wish list',
        body: `${confirmLabel || trimmedName} has been added to your wish list.`,
        buttons: [{ text: 'OK', onPress: () => router.back() }],
      });
    } catch {
      showAlert({ title: 'Error', body: 'Could not save wine. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadPhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]) return;
      setUploading(true);
      const uri = result.assets[0].uri;
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/label/confirm?context=wishlist');
    } catch {
      showAlert({ title: 'Could not read photo', body: 'Please try a clearer image.' });
    } finally {
      setUploading(false);
    }
  }

  if (uploading) {
    return (
      <View style={styles.uploadingScreen}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.uploadingText}>Reading the label…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Add a Wine</Text>
      <Text style={styles.subheading}>Scan a label for full details, or enter manually.</Text>

      <View style={styles.scanRow}>
        <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/label/camera?context=wishlist')}>
          <Text style={styles.scanButtonText}>Scan Wine Label</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanButton} onPress={handleUploadPhoto}>
          <Text style={styles.scanButtonText}>Upload Screenshot/Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or enter manually</Text>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.label}>Wine Name *</Text>
      <TextInput
        style={styles.input}
        value={wineName}
        onChangeText={setWineName}
        placeholder="e.g. Château Margaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Producer</Text>
      <TextInput
        style={styles.input}
        value={producer}
        onChangeText={setProducer}
        placeholder="e.g. Château Margaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Region</Text>
      <TextInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
        placeholder="e.g. Bordeaux, France"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Vintage</Text>
      <TextInput
        style={styles.input}
        value={vintage}
        onChangeText={setVintage}
        placeholder="e.g. 2018"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color={colors.background} />
          : <Text style={styles.saveButtonText}>Add to Wish List</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 80, paddingBottom: 60 },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginBottom: spacing.xl },
  heading: { fontSize: 30, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  subheading: { fontSize: 17, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  scanRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  scanButton: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  scanButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
  uploadingScreen: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  uploadingText: { fontSize: 18, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted },
  label: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.lg },
  saveButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  saveButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
});
