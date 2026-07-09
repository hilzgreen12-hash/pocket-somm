import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { router } from 'expo-router';
import { useLabels } from '../../src/hooks/useLabels';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { findMatchingChosenWine } from '../../src/api/chosenWines';
import { generateWineIntel } from '../../src/services/pricing';
import { showAlert } from '../../src/components/AppAlert';
import { LabelThumb } from '../../src/components/LabelThumb';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import type { CellarWine, LibraryLabel, WineDetailsComplete, WineIntelligence } from '../../src/types/wine';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

// How many label tiles per row. "single" = one large label per row.
type ViewMode = 'thumbnails' | 'enlarge';
const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'thumbnails', label: 'Thumbnails' },
  { value: 'enlarge', label: 'Enlarge' },
];
const VIEW_COLS: Record<ViewMode, number> = { thumbnails: 3, enlarge: 1 };

type FavFilter = 'all' | 'fav';
const FAV_OPTIONS: { value: FavFilter; label: string }[] = [
  { value: 'all', label: 'All labels' },
  { value: 'fav', label: 'Favourites only' },
];

type FilterField = 'view' | 'fav' | null;

function formatStamp(label: LibraryLabel): string {
  const date = new Date(label.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const place = [label.captured_place, label.captured_city].filter(Boolean).join(', ');
  return place ? `${date} · ${place}` : date;
}

// Build a WineDetailsComplete identity from a label row, for intel + review.
function detailsFromLabel(label: LibraryLabel): WineDetailsComplete {
  return {
    producer: label.producer ?? '',
    region: label.region ?? '',
    wineName: label.wine_name,
    vintage: label.vintage != null ? String(label.vintage) : '',
  };
}

// A cellar wine already carries generated intel in its columns — snapshot it so
// a "Select from Cellar" label can show View Wine Intel without regenerating.
function intelFromCellar(w: CellarWine): WineIntelligence {
  return {
    criticScore: w.critic_score,
    criticScoreNote: w.critic_score_note,
    drinkingWindowFrom: w.drinking_window_from,
    drinkingWindowTo: w.drinking_window_to,
    drinkingWindowStatus: (w.drinking_window_status as WineIntelligence['drinkingWindowStatus']) ?? 'unknown',
    grapeVariety: w.grape_variety,
    tastingNotes: w.tasting_notes ?? '',
    estimatedValue: w.estimated_value,
    valueSource: (w.estimated_value_source as WineIntelligence['valueSource']) ?? null,
  };
}

export default function MyLabelsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { labels, isLoading, remove, setFavourite, create } = useLabels();
  const { wines: cellarWines } = useCellar();
  const { preferences } = usePreferences();
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const { width } = useWindowDimensions();

  const [viewMode, setViewMode] = useState<ViewMode>('thumbnails');
  const [favFilter, setFavFilter] = useState<FavFilter>('all');
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selectCellarOpen, setSelectCellarOpen] = useState(false);
  const [scanningLabel, setScanningLabel] = useState(false);
  const [generatingIntel, setGeneratingIntel] = useState(false);

  const { setImage, setWineDetails, setError } = useLabelStore();

  const shown = useMemo(() => {
    if (favFilter === 'fav') return labels.filter((l) => l.is_favourite);
    return labels;
  }, [labels, favFilter]);

  // Cellar wines that have a label photo — the pool for "Select from Cellar".
  const cellarWithPhotos = useMemo(() => cellarWines.filter((w) => w.label_image_path), [cellarWines]);

  async function toggleFav(label: LibraryLabel) {
    try {
      await setFavourite.mutateAsync({ id: label.id, value: !label.is_favourite });
    } catch (err) {
      showAlert({ title: 'Could not update', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // +Add · Scan Label — run the Scan Wine Label intel flow; the intel card
  // offers "Add label to Label Library?" on the result.
  function handleScan() {
    setAddOpen(false);
    router.push('/label/camera?context=intel');
  }

  // +Add · Upload a Photo — same intel flow, seeded from a gallery image.
  async function handleUpload() {
    setAddOpen(false);
    if (!(await ensureMediaPermission('library'))) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
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
    router.push('/label/confirm?context=intel');
  }

  // +Add · Select from Cellar — copy an existing cellar wine's label (photo +
  // identity + its intel snapshot) into the library. References the cellar
  // photo path directly (no re-upload).
  async function addFromCellar(w: CellarWine) {
    setSelectCellarOpen(false);
    try {
      await create.mutateAsync({
        imagePath: w.label_image_path,
        producer: w.producer,
        wineName: w.wine_name,
        vintage: w.vintage,
        region: w.region,
        intel: intelFromCellar(w),
      });
    } catch (err) {
      showAlert({ title: 'Could not add label', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Tap a label → View Wine Intel · View/Edit-or-Create Review · Remove.
  async function onTapLabel(label: LibraryLabel) {
    const header = wineHeaderLine(label.producer, label.wine_name, label.vintage) || 'This label';
    let existingId: string | null = null;
    try {
      if (userId) {
        const match = await findMatchingChosenWine(userId, { producer: label.producer, wineName: label.wine_name ?? '', vintage: label.vintage });
        existingId = match?.id ?? null;
      }
    } catch { /* fall back to Create a Review */ }
    showAlert({
      title: header,
      body: formatStamp(label),
      buttons: [
        { text: 'View Wine Intel', onPress: () => void handleViewIntel(label) },
        { text: existingId ? 'View or Edit Your Review' : 'Create a Review', onPress: () => goToReview(existingId, label) },
        { text: 'Remove from Library', style: 'destructive', onPress: () => confirmRemove(label) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function goToReview(existingId: string | null, label: LibraryLabel) {
    if (existingId) { router.push(`/wines/chosen?openReview=${existingId}`); return; }
    const q = [
      'seedAdd=1',
      `sp=${encodeURIComponent(label.producer ?? '')}`,
      `sw=${encodeURIComponent(label.wine_name ?? '')}`,
      `sv=${encodeURIComponent(label.vintage != null ? String(label.vintage) : '')}`,
      `sr=${encodeURIComponent(label.region ?? '')}`,
    ].join('&');
    router.push(`/wines/chosen?${q}`);
  }

  async function handleViewIntel(label: LibraryLabel) {
    const details = detailsFromLabel(label);
    const ls = useLabelStore.getState();
    if (label.intel) {
      ls.setWineDetailsConfirmed(details);
      ls.setIntelligence(label.intel);
      useLastIntelStore.getState().setLast(details, label.intel);
      router.push('/label/results?context=intel');
      return;
    }
    // No snapshot (review / older label) — regenerate on demand.
    setGeneratingIntel(true);
    try {
      const intel = await generateWineIntel(details, currency);
      ls.setWineDetailsConfirmed(details);
      ls.setIntelligence(intel);
      useLastIntelStore.getState().setLast(details, intel);
      router.push('/label/results?context=intel');
    } catch (err) {
      showAlert({ title: 'Could not load intel', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setGeneratingIntel(false);
    }
  }

  function confirmRemove(label: LibraryLabel) {
    showAlert({
      title: 'Remove from Library?',
      body: `${wineHeaderLine(label.producer, label.wine_name, label.vintage)}\n\nThis removes the label from Your Label Library. Your cellar wine and any review stay put.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => remove.mutate(label.id) },
      ],
    });
  }

  const cols = VIEW_COLS[viewMode];
  const gap = spacing.sm;
  const tileWidth = (width - spacing.xl * 2 - gap * (cols - 1)) / cols;
  const tileHeight = tileWidth * 1.3;

  const viewLabel = VIEW_OPTIONS.find((o) => o.value === viewMode)?.label ?? 'Thumbnails';
  const favLabel = FAV_OPTIONS.find((o) => o.value === favFilter)?.label ?? 'All labels';

  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'view') return { title: 'View', options: VIEW_OPTIONS, selected: viewMode, onSelect: (v) => setViewMode(v as ViewMode) };
    if (field === 'fav') return { title: 'Favourites', options: FAV_OPTIONS, selected: favFilter, onSelect: (v) => setFavFilter(v as FavFilter) };
    return null;
  }
  const activeDropdown = dropdownConfig(openDropdown);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Label Library</Text>
        <TouchableOpacity onPress={() => setAddOpen(true)} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {labels.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No labels yet</Text>
          <Text style={styles.emptyBody}>Scan a wine label — or tap + Add — and it's saved here, date and location stamped.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.filterHint}>Listed by Recency · Tap a label for intel & your review</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('view')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>View</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'view' ? '▴' : '▾'}</Text>
              </View>
              <Text style={styles.filterChipValue} numberOfLines={1} ellipsizeMode="tail">{viewLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('fav')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Favourites</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'fav' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, favFilter === 'fav' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{favLabel}</Text>
            </TouchableOpacity>
          </ScrollView>

          {shown.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No favourites yet</Text>
              <Text style={styles.emptyBody}>Tap the star on a label (in Enlarge view) to keep it here.</Text>
            </View>
          ) : (
            <ScrollView style={styles.listScroll} contentContainerStyle={styles.grid}>
              {shown.map((label) => (
                <TouchableOpacity
                  key={label.id}
                  style={[styles.tile, { width: tileWidth, marginRight: gap, marginBottom: gap }]}
                  onPress={() => onTapLabel(label)}
                  activeOpacity={0.7}
                >
                  <View style={{ width: tileWidth, height: tileHeight }}>
                    <LabelThumb
                      path={label.label_image_path}
                      fallbackText={label.wine_name}
                      style={{ width: tileWidth, height: tileHeight }}
                    />
                    {viewMode === 'enlarge' && (
                      <TouchableOpacity
                        style={styles.favStar}
                        onPress={() => toggleFav(label)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.favStarText, label.is_favourite && styles.favStarActive]}>{label.is_favourite ? '★' : '☆'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.caption} numberOfLines={1}>
                    {label.is_favourite ? '★ ' : ''}{label.wine_name ?? label.producer ?? 'Wine label'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* View / Favourites dropdown */}
      <Modal visible={!!activeDropdown} transparent animationType="fade" onRequestClose={() => setOpenDropdown(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpenDropdown(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            {activeDropdown && (
              <>
                <Text style={styles.modalTitle}>{activeDropdown.title}</Text>
                {activeDropdown.options.map((opt) => {
                  const active = activeDropdown.selected === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.modalOption, active && styles.modalOptionActive]}
                      onPress={() => { activeDropdown.onSelect(opt.value); setOpenDropdown(null); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{opt.label}</Text>
                      {active && <Text style={styles.modalOptionCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={styles.modalCancel} onPress={() => setOpenDropdown(null)}>
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* +Add chooser — Scan / Upload / Select from Cellar */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a label</Text>
            <Text style={styles.addBody}>Scan or upload a wine label, or pull one in from your cellar. Each is saved with the date and place.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleScan} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { marginTop: spacing.sm }]} onPress={handleUpload} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Upload a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { marginTop: spacing.sm }]} onPress={() => { setAddOpen(false); setSelectCellarOpen(true); }} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Select from Cellar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Select from Cellar — cellar wines that have a label photo */}
      <Modal visible={selectCellarOpen} transparent animationType="fade" onRequestClose={() => setSelectCellarOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectCellarOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, styles.cellarSheet]} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select from Cellar</Text>
            {cellarWithPhotos.length === 0 ? (
              <Text style={styles.addBody}>None of your cellar wines have a label photo yet.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {cellarWithPhotos.map((w) => (
                  <TouchableOpacity key={w.id} style={styles.cellarRow} onPress={() => addFromCellar(w)} activeOpacity={0.7}>
                    <LabelThumb path={w.label_image_path} fallbackText={w.wine_name} style={styles.cellarThumb} radius={4} frame={3} />
                    <View style={styles.cellarRowText}>
                      <Text style={styles.cellarWineName} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                      {w.region ? <Text style={styles.cellarRegion} numberOfLines={1}>{w.region}</Text> : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setSelectCellarOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {(scanningLabel || generatingIntel) && (
        <View style={styles.scanningOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.scanningText}>{scanningLabel ? 'Reading the label…' : 'Loading wine intel…'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  addLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.gold, textAlign: 'right', minWidth: 40 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 150, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  filterChipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  filterChipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  filterChipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  listScroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },
  tile: { alignItems: 'flex-start' },
  caption: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.text, marginTop: spacing.xs, alignSelf: 'stretch' },
  favStar: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  favStarText: { fontSize: 24, color: '#FFFFFF', lineHeight: 26 },
  favStarActive: { color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  cellarSheet: { maxHeight: '80%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  modalOptionText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  modalOptionCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  addBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  addBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Select-from-Cellar rows.
  cellarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  cellarThumb: { width: 40, height: 52 },
  cellarRowText: { flex: 1 },
  cellarWineName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  cellarRegion: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  scanningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  scanningText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
});
