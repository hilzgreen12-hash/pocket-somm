import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { createStorageLocation, setStorageLocationPhoto } from '../../../src/api/storageLocations';
import { uploadLocationPhoto } from '../../../src/api/labelPhotos';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Create a non-grid home storage location: a PORTRAIT photo of the space + a
// name. Vinster only accepts portrait images here, so the picker is locked to a
// 3:4 crop.
export default function NewStorageLocationScreen() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function pickPhoto(source: 'camera' | 'library') {
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4], // portrait
      quality: 1,
    };
    const res = source === 'camera'
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets.length) return;
    const asset = res.assets[0];
    // Guard against landscape slipping through if a platform ignores the crop.
    if (asset.width && asset.height && asset.width > asset.height) {
      showAlert({ title: 'Portrait only', body: 'Vinster only accepts portrait images for Other Home Storage Locations. Please crop it upright.' });
      return;
    }
    setPhotoUri(asset.uri);
  }

  async function handleSave() {
    if (saving) return;
    if (!session?.user.id) { showAlert({ title: 'Sign in needed', body: 'Sign in to create a storage location.' }); return; }
    if (!name.trim()) { showAlert({ title: 'Name needed', body: 'Give this location a name — e.g. "The shed".' }); return; }
    if (!photoUri) { showAlert({ title: 'Photo needed', body: 'Add a portrait photo of the space first.' }); return; }
    setSaving(true);
    try {
      const loc = await createStorageLocation(session.user.id, name);
      const path = await uploadLocationPhoto(session.user.id, photoUri, loc.id);
      await setStorageLocationPhoto(loc.id, path);
      qc.invalidateQueries({ queryKey: ['storage-locations', session.user.id] });
      router.replace(`/cellar/storage-location/${loc.id}` as any);
    } catch (err) {
      showAlert({ title: 'Could not create location', body: err instanceof Error ? err.message : 'Please try again.' });
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Location</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.notice}>Vinster only accepts portrait images for Other Home Storage Locations.</Text>

        {photoUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.retakeBtn} activeOpacity={0.7}>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto('camera')} activeOpacity={0.85}>
              <Text style={styles.photoBtnText}>Take a photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoBtn, styles.photoBtnSecondary]} onPress={() => pickPhoto('library')} activeOpacity={0.85}>
              <Text style={[styles.photoBtnText, styles.photoBtnTextSecondary]}>Choose from library</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.fieldLabel}>Location name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. The shed, Under the bed…"
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={[styles.saveBtn, saving && styles.btnDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.saveBtnText}>Create Location</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  notice: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold, textAlign: 'center', lineHeight: 19, marginBottom: spacing.lg },
  photoButtons: { gap: spacing.sm },
  photoBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center' },
  photoBtnSecondary: { borderColor: '#FFFFFF' },
  photoBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  photoBtnTextSecondary: { color: '#FFFFFF' },
  previewWrap: { alignItems: 'center' },
  preview: { width: 210, height: 280, borderRadius: 14, backgroundColor: colors.surface },
  retakeBtn: { marginTop: spacing.sm, paddingVertical: 6, paddingHorizontal: spacing.md },
  retakeText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
  btnDisabled: { opacity: 0.5 },
});
