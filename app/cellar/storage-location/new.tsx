import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { createStorageLocation, setStorageLocationPhoto, deleteStorageLocation } from '../../../src/api/storageLocations';
import { uploadLocationPhoto } from '../../../src/api/labelPhotos';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Create a non-grid home storage location: a photo of the space + a name.
// The photo is taken as-is (any orientation) and displayed with the whole
// image visible — no forced crop.
export default function NewStorageLocationScreen() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function pickPhoto(source: 'camera' | 'library') {
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    // No allowsEditing: it opened an unexplained native crop screen. Take the
    // photo as-is (any orientation) and let the display fit the whole image.
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 1,
    };
    const res = source === 'camera'
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets.length) return;
    setPhotoUri(res.assets[0].uri);
  }

  async function handleSave() {
    if (saving) return;
    if (!session?.user.id) { showAlert({ title: 'Sign in needed', body: 'Sign in to create a storage location.' }); return; }
    if (!name.trim()) { showAlert({ title: 'Name needed', body: 'Give this location a name — e.g. "The shed".' }); return; }
    if (!photoUri) { showAlert({ title: 'Photo needed', body: 'Add a photo of the space first.' }); return; }
    setSaving(true);
    // Track the row so we can roll it back if a later step fails — otherwise a
    // flaky upload leaves a committed, photo-less location behind and a retry
    // creates a duplicate (D4).
    let createdId: string | null = null;
    try {
      const loc = await createStorageLocation(session.user.id, name);
      createdId = loc.id;
      const path = await uploadLocationPhoto(session.user.id, photoUri, loc.id);
      await setStorageLocationPhoto(loc.id, path);
      qc.invalidateQueries({ queryKey: ['storage-locations', session.user.id] });
      router.replace(`/cellar/storage-location/${loc.id}` as any);
    } catch (err) {
      if (createdId) {
        try { await deleteStorageLocation(createdId); } catch { /* best-effort rollback */ }
      }
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

      <KeyboardAwareScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xl * 3, paddingBottom: 80 }} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        <Text style={styles.notice}>Add a visual and a name to begin.</Text>
        <Text style={styles.noticeSub}>Landscape images work best.</Text>

        {photoUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
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
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  notice: { fontSize: 15, fontFamily: fonts.bodyRegular, color: '#FFFFFF', textAlign: 'center', lineHeight: 21, marginBottom: spacing.xs },
  noticeSub: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: spacing.lg },
  photoButtons: { gap: spacing.sm },
  photoBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center' },
  photoBtnSecondary: { borderColor: '#FFFFFF' },
  photoBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  photoBtnTextSecondary: { color: '#FFFFFF' },
  previewWrap: { alignItems: 'center' },
  // Landscape-shaped preview — matches how the photo displays on the location screen.
  preview: { width: '85%', aspectRatio: 4 / 3, borderRadius: 14, backgroundColor: colors.surface },
  retakeBtn: { marginTop: spacing.sm, paddingVertical: 6, paddingHorizontal: spacing.md },
  retakeText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  saveBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: '#FFFFFF', letterSpacing: 0.3 },
  btnDisabled: { opacity: 0.5 },
});
