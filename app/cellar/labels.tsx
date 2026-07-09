import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { showAlert } from '../../src/components/AppAlert';
import { LabelThumb } from '../../src/components/LabelThumb';
import { useLibraryFilters } from '../../src/hooks/useLibraryFilters';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import type { LibraryFilter } from '../../src/api/libraryFilters';
import type { CellarWine } from '../../src/types/wine';
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

export default function MyLabelsScreen() {
  useAuth();
  const { wines, isLoading, updateWine } = useCellar();
  const { width } = useWindowDimensions();

  // Toggle a label as a Library favourite (distinct from a favourite wine).
  async function toggleLabelFav(w: CellarWine) {
    try {
      await updateWine.mutateAsync({ id: w.id, updates: { label_favourite: !w.label_favourite } });
    } catch (err) {
      showAlert({ title: 'Could not update', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  const [viewMode, setViewMode] = useState<ViewMode>('thumbnails');
  const [favFilter, setFavFilter] = useState<FavFilter>('all');
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);

  // "+ Add" a label — reuses the standard scan/upload-a-wine path, so the new
  // label is a full cellar wine (with its photo) and gets note/share for free.
  const { setImage, setWineDetails, setError } = useLabelStore();
  const [addOpen, setAddOpen] = useState(false);
  const [scanningLabel, setScanningLabel] = useState(false);
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
    router.push('/label/confirm');
  }

  // Bespoke user-created filters.
  const { filters: customFilters, create, setItems, rename, remove } = useLibraryFilters('label');
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<LibraryFilter | null>(null);
  const [savingFilter, setSavingFilter] = useState(false);

  // Most-recently-added first (useCellar already orders by created_at desc),
  // limited to wines that actually have a label photo.
  const labels = useMemo(() => {
    let list = wines.filter((w) => w.label_image_path);
    if (favFilter === 'fav') list = list.filter((w) => w.label_favourite);
    if (activeCustomId) {
      const f = customFilters.find((cf) => cf.id === activeCustomId);
      const ids = new Set(f?.itemIds ?? []);
      list = list.filter((w) => ids.has(w.id));
    }
    return list;
  }, [wines, favFilter, activeCustomId, customFilters]);

  function applyCustom(id: string) { setActiveCustomId((prev) => (prev === id ? null : id)); }
  function openCreateFilter() { setEditingFilter(null); setFilterModalOpen(true); }
  function openFilterOptions(f: LibraryFilter) {
    showAlert({
      title: f.name,
      body: 'Edit this filter’s name and labels, or delete it. Your labels stay in the library either way.',
      buttons: [
        { text: 'Edit', onPress: () => { setEditingFilter(f); setFilterModalOpen(true); } },
        { text: 'Delete', style: 'destructive', onPress: () => { if (activeCustomId === f.id) setActiveCustomId(null); remove.mutate(f.id); } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  async function saveFilter(name: string, ids: string[]) {
    setSavingFilter(true);
    try {
      if (editingFilter) {
        await rename.mutateAsync({ filterId: editingFilter.id, name });
        await setItems.mutateAsync({ filterId: editingFilter.id, itemIds: ids });
      } else {
        await create.mutateAsync({ name, itemIds: ids });
      }
      setFilterModalOpen(false);
      setEditingFilter(null);
    } catch (err) {
      showAlert({ title: 'Could not save filter', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingFilter(false);
    }
  }
  // Items offered in the create/edit sheet — every wine that has a label photo.
  const filterItems = useMemo(() => wines.filter((w) => w.label_image_path).map((w) => ({
    id: w.id,
    label: w.wine_name,
    sublabel: [w.producer, w.vintage].filter(Boolean).join(' · ') || undefined,
  })), [wines]);

  const cols = VIEW_COLS[viewMode];
  const gap = spacing.sm;
  const tileWidth = (width - spacing.xl * 2 - gap * (cols - 1)) / cols;
  const tileHeight = tileWidth * 1.3;

  const viewLabel = VIEW_OPTIONS.find((o) => o.value === viewMode)?.label ?? 'Thumbnails';
  const favLabel = FAV_OPTIONS.find((o) => o.value === favFilter)?.label ?? 'All labels';

  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'view') {
      return { title: 'View', options: VIEW_OPTIONS, selected: viewMode, onSelect: (v) => setViewMode(v as ViewMode) };
    }
    if (field === 'fav') {
      return { title: 'Favourites', options: FAV_OPTIONS, selected: favFilter, onSelect: (v) => setFavFilter(v as FavFilter) };
    }
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

  const hasAnyPhotos = wines.some((w) => w.label_image_path);

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

      {!hasAnyPhotos ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No labels yet</Text>
          <Text style={styles.emptyBody}>Scan or photograph a wine and its label appears here.</Text>
        </View>
      ) : (
        <>
          {/* Default ordering + filter carousel — mirrors the Full Cellar List. */}
          <Text style={styles.filterHint}>Listed by Recency · Swipe to see all filters →</Text>
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
            {customFilters.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.customChip, activeCustomId === f.id && styles.customChipActive]}
                onPress={() => applyCustom(f.id)}
                onLongPress={() => openFilterOptions(f)}
                delayLongPress={400}
                activeOpacity={0.7}
              >
                <Text style={[styles.customChipText, activeCustomId === f.id && { color: colors.gold }]} numberOfLines={1}>{f.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.customChipAdd} onPress={openCreateFilter} activeOpacity={0.7}>
              <Text style={styles.customChipAddText}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>

          {labels.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No labels match</Text>
              <Text style={styles.emptyBody}>Try clearing the Favourites filter to see all your labels.</Text>
            </View>
          ) : (
            <ScrollView style={styles.listScroll} contentContainerStyle={styles.grid}>
              {labels.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={[styles.tile, { width: tileWidth, marginRight: gap, marginBottom: gap }]}
                  onPress={() => router.push(`/cellar/${w.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={{ width: tileWidth, height: tileHeight }}>
                    <LabelThumb
                      path={w.label_image_path}
                      fallbackText={w.wine_name}
                      style={{ width: tileWidth, height: tileHeight }}
                    />
                    {/* Star selector — only on the large (Enlarge) view; a
                        thumbnail is too small to tap. Sets a favourite LABEL,
                        separate from a favourite wine. */}
                    {viewMode === 'enlarge' && (
                      <TouchableOpacity
                        style={styles.favStar}
                        onPress={() => toggleLabelFav(w)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.favStarText, w.label_favourite && styles.favStarActive]}>{w.label_favourite ? '★' : '☆'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.caption} numberOfLines={1}>
                    {w.label_favourite ? '★ ' : ''}{w.wine_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

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

      <LibraryFilterModal
        visible={filterModalOpen}
        title={editingFilter ? 'Edit filter' : 'New filter'}
        itemNoun="labels"
        items={filterItems}
        initialName={editingFilter?.name}
        initialSelected={editingFilter?.itemIds}
        saving={savingFilter}
        onSave={saveFilter}
        onClose={() => { setFilterModalOpen(false); setEditingFilter(null); }}
      />

      {/* Add a label — scan or upload a wine photo. Runs the same path as any
          scanned wine, so it lands in the cellar (and this library) with note
          and share available on the wine card. */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a label</Text>
            <Text style={styles.addBody}>Scan a wine label or upload a photo — Vinster reads the details and it joins your cellar and this library.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => { setAddOpen(false); router.push('/label/camera'); }} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { marginTop: spacing.sm }]} onPress={handleUpload} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Upload a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {scanningLabel && (
        <View style={styles.scanningOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.scanningText}>Reading the label…</Text>
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
  headerSpacer: { width: 40 },
  addLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.gold, textAlign: 'right', minWidth: 40 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  // Filter hint + carousel — mirrors app/cellar/list.tsx.
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 150, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  filterChipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  filterChipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  filterChipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  // Bespoke custom-filter pills + the "+ Add" pill.
  customChip: { height: 56, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.md, marginRight: spacing.sm, maxWidth: 160 },
  customChipActive: { borderColor: colors.gold },
  customChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  customChipAdd: { height: 56, justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.md, marginRight: spacing.sm },
  customChipAddText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  listScroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },
  tile: { alignItems: 'flex-start' },
  caption: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.text, marginTop: spacing.xs, alignSelf: 'stretch' },
  // Favourite-label star, top-right of the enlarged image.
  favStar: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  favStarText: { fontSize: 24, color: '#FFFFFF', lineHeight: 26 },
  favStarActive: { color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  modalOptionText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  modalOptionCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // "Add a label" chooser — mirrors the Cellar List add-wine sheet.
  addBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  addBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  scanningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  scanningText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
});
