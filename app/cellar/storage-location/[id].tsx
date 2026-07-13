import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchStorageLocation, fetchStorageLocationWines, deleteStorageLocation } from '../../../src/api/storageLocations';
import { prepareImageBase64, scanLabel } from '../../../src/api/label';
import { useLabelStore } from '../../../src/stores/labelStore';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { useLabelImageUrl } from '../../../src/hooks/useLabelImageUrl';
import { useRackStore } from '../../../src/stores/rackStore';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { showAlert } from '../../../src/components/AppAlert';
import { LabelThumb } from '../../../src/components/LabelThumb';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Search terms that map free text onto a drinking-window status (mirrors the
// rack screen), so a search for "peak" or "young" filters by maturity too.
const STATUS_SEARCH: { status: string; terms: string[] }[] = [
  { status: 'too_young', terms: ['too young', 'young', 'hold'] },
  { status: 'approaching', terms: ['approaching', 'approach'] },
  { status: 'peak', terms: ['peak', 'drinking now', 'drink now', 'ready', 'drinking'] },
  { status: 'declining', terms: ['declining', 'decline', 'fading', 'past peak'] },
];
const MATURITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'too_young', label: 'Too Young' },
  { value: 'approaching', label: 'Approaching' },
  { value: 'peak', label: 'Peak' },
  { value: 'declining', label: 'Declining' },
];

function bottleLabel(n: number) {
  return n === 0 ? 'Empty' : `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}

export default function StorageLocationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setPendingStorageLocationId } = useRackStore();
  const { setImage, setWineDetails } = useLabelStore();
  const [search, setSearch] = useState('');
  const [maturity, setMaturity] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: location, isLoading } = useQuery({
    queryKey: ['storage-location', id],
    queryFn: () => fetchStorageLocation(id!),
    enabled: !!id,
  });
  const { data: wines = [] } = useQuery({
    queryKey: ['storage-location-wines', id],
    queryFn: () => fetchStorageLocationWines(id!),
    enabled: !!id,
  });
  const photoUrl = useLabelImageUrl(location?.photo_path ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wines.filter((w) => {
      if (maturity && w.drinking_window_status !== maturity) return false;
      if (q) {
        const hay = [w.producer, w.wine_name, w.region, w.vintage].filter(Boolean).join(' ').toLowerCase();
        const statusTerms = STATUS_SEARCH.find((s) => s.status === w.drinking_window_status)?.terms ?? [];
        if (!hay.includes(q) && !statusTerms.some((t) => t.includes(q))) return false;
      }
      return true;
    });
  }, [wines, search, maturity]);

  // All add paths file the saved wine into THIS location (context=add-location,
  // pendingStorageLocationId set). A "case" is just a wine with a higher quantity.
  function handleScan() {
    if (!id) return;
    setPendingStorageLocationId(id);
    router.push('/label/camera?context=add-location' as any);
  }
  function handleManual() {
    if (!id) return;
    setPendingStorageLocationId(id);
    useLabelStore.getState().reset();
    router.push('/label/confirm?manual=1&context=add-location' as any);
  }
  async function handleUpload() {
    if (!id) return;
    if (!(await ensureMediaPermission('library'))) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setPendingStorageLocationId(id);
    setUploading(true);
    try {
      const uri = res.assets[0].uri;
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/label/confirm?context=add-location' as any);
    } catch (err) {
      showAlert({ title: 'Could not read label', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setUploading(false);
    }
  }

  function handleLongPressHeader() {
    if (!location) return;
    showAlert({
      title: location.name,
      body: 'Remove this storage location? The wines in it stay in your cellar — they just become loose bottles again.',
      buttons: [
        {
          text: 'Delete location',
          style: 'destructive',
          onPress: async () => {
            try { await deleteStorageLocation(location.id); router.back(); }
            catch (err) { showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }); }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>;
  }
  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyBody}>This location no longer exists.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>← Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onLongPress={handleLongPressHeader} delayLongPress={400} activeOpacity={1}>
          <Text style={styles.title} numberOfLines={1}>{location.name}</Text>
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 90 }} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.areaPhoto} resizeMode="cover" />
        ) : null}

        {/* Add a wine — filed straight into this location. Scan (wine or case),
            upload a photo, or enter by hand. */}
        <View style={styles.addSection}>
          <TouchableOpacity style={styles.addBtn} onPress={handleScan} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>Scan a Wine or Case Label</Text>
          </TouchableOpacity>
          <View style={styles.addRow}>
            <TouchableOpacity style={[styles.addBtn, styles.addBtnSecondary, { flex: 1 }]} onPress={handleUpload} activeOpacity={0.85}>
              <Text style={[styles.addBtnText, styles.addBtnTextSecondary]}>Upload Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, styles.addBtnSecondary, { flex: 1 }]} onPress={handleManual} activeOpacity={0.85}>
              <Text style={[styles.addBtnText, styles.addBtnTextSecondary]}>Manual Input</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.listHeader}>List</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search producer, wine, region, maturity…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.maturityRow}>
          {MATURITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value || 'all'}
              style={[styles.maturityChip, maturity === opt.value && styles.maturityChipActive]}
              onPress={() => setMaturity(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.maturityChipText, maturity === opt.value && styles.maturityChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <Text style={styles.emptyList}>{wines.length === 0 ? 'No wines here yet — photograph a label or a case to start filling it.' : 'No wines match your search.'}</Text>
        ) : (
          <View style={styles.listSection}>
            {filtered.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={styles.wineRow}
                onPress={() => router.push(`/cellar/${w.id}` as any)}
                activeOpacity={0.7}
              >
                <LabelThumb path={w.label_image_path} fallbackText={w.wine_name} style={styles.thumb} />
                <View style={styles.wineMain}>
                  <Text style={styles.wineName} numberOfLines={1}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                  <View style={styles.wineMetaRow}>
                    {w.region ? <Text style={styles.wineMeta} numberOfLines={1}>{w.region}</Text> : null}
                    {w.region ? <Text style={styles.wineMetaDot}>·</Text> : null}
                    <Text style={styles.wineMeta}>{bottleLabel(w.quantity ?? 0)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </KeyboardAwareScrollView>

      {uploading && (
        <View style={styles.uploadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.uploadingText}>Reading the label…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  backLink: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  areaPhoto: { width: '100%', height: 360, backgroundColor: colors.surface },
  addSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  addBtnSecondary: { borderColor: '#FFFFFF' },
  addBtnText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textAlign: 'center' },
  addBtnTextSecondary: { color: '#FFFFFF' },
  listHeader: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.3, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { fontSize: 15, color: colors.textMuted, paddingLeft: spacing.sm },
  maturityRow: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  maturityChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: spacing.md },
  maturityChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.12)' },
  maturityChipText: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  maturityChipTextActive: { color: colors.gold, fontFamily: fonts.bodySemibold },
  listSection: { paddingHorizontal: spacing.xl },
  emptyList: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, lineHeight: 20 },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  wineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  thumb: { width: 34, height: 44 },
  wineMain: { flex: 1 },
  wineName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  wineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  wineMeta: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, flexShrink: 1 },
  wineMetaDot: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  uploadingText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
});
