import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { LabelThumb } from '../../src/components/LabelThumb';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

// How many label tiles per row. "single" = one large label per row.
type ViewMode = 'single' | 'two' | 'three';
const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'single', label: 'Single photo (largest)' },
  { value: 'two', label: 'Two per line' },
  { value: 'three', label: 'Three per line' },
];
const VIEW_COLS: Record<ViewMode, number> = { single: 1, two: 2, three: 3 };

type FavFilter = 'all' | 'fav';
const FAV_OPTIONS: { value: FavFilter; label: string }[] = [
  { value: 'all', label: 'All labels' },
  { value: 'fav', label: 'Favourites only' },
];

type FilterField = 'view' | 'fav' | null;

export default function MyLabelsScreen() {
  useAuth();
  const { wines, isLoading } = useCellar();
  const { width } = useWindowDimensions();

  const [viewMode, setViewMode] = useState<ViewMode>('three');
  const [favFilter, setFavFilter] = useState<FavFilter>('all');
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);

  // Most-recently-added first (useCellar already orders by created_at desc),
  // limited to wines that actually have a label photo.
  const labels = useMemo(() => {
    let list = wines.filter((w) => w.label_image_path);
    if (favFilter === 'fav') list = list.filter((w) => w.is_favourite);
    return list;
  }, [wines, favFilter]);

  const cols = VIEW_COLS[viewMode];
  const gap = spacing.sm;
  const tileWidth = (width - spacing.xl * 2 - gap * (cols - 1)) / cols;
  const tileHeight = tileWidth * 1.3;

  const viewLabel = VIEW_OPTIONS.find((o) => o.value === viewMode)?.label ?? 'Three per line';
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
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Label Library</Text>
        <View style={styles.headerSpacer} />
      </View>

      {!hasAnyPhotos ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No labels yet</Text>
          <Text style={styles.emptyBody}>Scan or photograph a wine and its label appears here.</Text>
        </View>
      ) : (
        <>
          {/* Default ordering + filter carousel — mirrors the Full Cellar List. */}
          <Text style={styles.filterHint}>Listed by Recently Added · Swipe to see all filters →</Text>
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
                  <LabelThumb
                    path={w.label_image_path}
                    fallbackText={w.wine_name}
                    style={{ width: tileWidth, height: tileHeight }}
                  />
                  <Text style={styles.caption} numberOfLines={1}>
                    {w.is_favourite ? '★ ' : ''}{w.wine_name}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  headerSpacer: { width: 40 },
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
  listScroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },
  tile: { alignItems: 'flex-start' },
  caption: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.text, marginTop: spacing.xs, alignSelf: 'stretch' },
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
});
