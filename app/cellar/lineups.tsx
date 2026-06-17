import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { listLineupArchives, lineupSignedUrl, setLineupFavourite, type LineupArchive } from '../../src/api/lineups';
import { useLibraryFilters } from '../../src/hooks/useLibraryFilters';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import type { LibraryFilter } from '../../src/api/libraryFilters';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const FAV_OPTIONS = [
  { value: 'all', label: 'All lineups' },
  { value: 'fav', label: 'Favourites only' },
];

function monthKey(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// A single lineup tile — resolves a fresh signed URL for its photo on mount.
function LineupTile({ item, size, onPress, onToggleFav }: { item: LineupArchive; size: number; onPress: () => void; onToggleFav: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    lineupSignedUrl(item.image_path).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [item.image_path]);

  const date = new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <TouchableOpacity style={[styles.tile, { width: size }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.tileImageWrap, { width: size, height: size * 1.1 }]}>
        {url ? <Image source={{ uri: url }} style={{ width: size, height: size * 1.1 }} resizeMode="cover" />
             : <ActivityIndicator color={colors.gold} />}
        <TouchableOpacity style={styles.favStar} onPress={onToggleFav} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={[styles.favStarText, item.is_favourite && styles.favStarActive]}>{item.is_favourite ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.tileDate}>{item.is_favourite ? '★ ' : ''}{date}</Text>
      {item.bottle_count ? <Text style={styles.tileCount}>{item.bottle_count} bottle{item.bottle_count === 1 ? '' : 's'}</Text> : null}
    </TouchableOpacity>
  );
}

export default function LineupLibraryScreen() {
  const { session } = useAuth();
  const { width } = useWindowDimensions();
  const qc = useQueryClient();
  const userId = session?.user.id;

  const { data: lineups = [], isLoading } = useQuery({
    queryKey: ['lineup-archives', userId],
    queryFn: () => listLineupArchives(userId!),
    enabled: !!userId,
  });

  const [favFilter, setFavFilter] = useState<'all' | 'fav'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('All');
  const [openDropdown, setOpenDropdown] = useState<'fav' | 'month' | null>(null);

  // Bespoke user-created filters.
  const { filters: customFilters, create, setItems, rename, remove } = useLibraryFilters('lineup');
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<LibraryFilter | null>(null);
  const [savingFilter, setSavingFilter] = useState(false);

  // Month options grow as the collection does — distinct months, newest first.
  const monthOptions = useMemo(() => {
    const seen: string[] = [];
    for (const l of lineups) { const k = monthKey(l.archived_at); if (!seen.includes(k)) seen.push(k); }
    return [{ value: 'All', label: 'All months' }, ...seen.map((m) => ({ value: m, label: m }))];
  }, [lineups]);

  const filtered = useMemo(() => {
    let list = lineups;
    if (favFilter === 'fav') list = list.filter((l) => l.is_favourite);
    if (monthFilter !== 'All') list = list.filter((l) => monthKey(l.archived_at) === monthFilter);
    if (activeCustomId) {
      const f = customFilters.find((cf) => cf.id === activeCustomId);
      const ids = new Set(f?.itemIds ?? []);
      list = list.filter((l) => ids.has(l.id));
    }
    return list;
  }, [lineups, favFilter, monthFilter, activeCustomId, customFilters]);

  function applyCustom(id: string) {
    setActiveCustomId((prev) => (prev === id ? null : id));
  }
  function openCreateFilter() {
    setEditingFilter(null);
    setFilterModalOpen(true);
  }
  function openFilterOptions(f: LibraryFilter) {
    showAlert({
      title: f.name,
      body: 'Edit this filter’s name and lineups, or delete it. Your lineups stay in the library either way.',
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
  // Items offered in the create/edit sheet — every lineup, by date.
  const filterItems = useMemo(() => lineups.map((l) => ({
    id: l.id,
    label: new Date(l.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    sublabel: l.bottle_count ? `${l.bottle_count} bottle${l.bottle_count === 1 ? '' : 's'}` : undefined,
  })), [lineups]);

  async function toggleFav(item: LineupArchive) {
    try {
      await setLineupFavourite(item.id, !item.is_favourite);
      qc.invalidateQueries({ queryKey: ['lineup-archives', userId] });
    } catch (err) {
      showAlert({ title: 'Could not update', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  async function openViewer(item: LineupArchive) {
    const u = await lineupSignedUrl(item.image_path);
    setViewerUrl(u);
    setViewerOpen(true);
  }

  const cols = 2;
  const gap = spacing.md;
  const tileWidth = (width - spacing.xl * 2 - gap * (cols - 1)) / cols;

  const favLabel = FAV_OPTIONS.find((o) => o.value === favFilter)?.label ?? 'All lineups';
  const monthLabel = monthFilter === 'All' ? 'All months' : monthFilter;

  const dropdown = openDropdown === 'fav'
    ? { title: 'Favourites', options: FAV_OPTIONS, selected: favFilter, onSelect: (v: string) => setFavFilter(v as 'all' | 'fav') }
    : openDropdown === 'month'
    ? { title: 'Month enjoyed', options: monthOptions, selected: monthFilter, onSelect: (v: string) => setMonthFilter(v) }
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Lineup Library</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.blurb}>
        A visual record of your vinous exploits. Lineups photographed in Archive a Night under Cellar will appear here with date stamps.
      </Text>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : lineups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No lineups yet</Text>
          <Text style={styles.emptyBody}>Use Archive a Night in your Cellar to photograph a bottle lineup — each one is saved here with its date.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.filterHint}>Listed by Recency · Swipe to see all filters →</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
            <TouchableOpacity style={[styles.filterChip, favFilter !== 'all' && styles.filterChipActive]} onPress={() => setOpenDropdown('fav')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Favourites</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'fav' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, favFilter !== 'all' && { color: colors.gold }]} numberOfLines={1}>{favLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, monthFilter !== 'All' && styles.filterChipActive]} onPress={() => setOpenDropdown('month')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Month enjoyed</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'month' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, monthFilter !== 'All' && { color: colors.gold }]} numberOfLines={1}>{monthLabel}</Text>
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

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No lineups match</Text>
              <Text style={styles.emptyBody}>Try clearing the filters above.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.grid}>
              {filtered.map((item) => (
                <LineupTile key={item.id} item={item} size={tileWidth} onPress={() => openViewer(item)} onToggleFav={() => toggleFav(item)} />
              ))}
            </ScrollView>
          )}
        </>
      )}

      <Modal visible={!!dropdown} transparent animationType="fade" onRequestClose={() => setOpenDropdown(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpenDropdown(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            {dropdown && (
              <>
                <Text style={styles.modalTitle}>{dropdown.title}</Text>
                <ScrollView style={{ maxHeight: 320 }}>
                  {dropdown.options.map((opt) => {
                    const active = dropdown.selected === opt.value;
                    return (
                      <TouchableOpacity key={opt.value} style={[styles.modalOption, active && styles.modalOptionActive]} onPress={() => { dropdown.onSelect(opt.value); setOpenDropdown(null); }} activeOpacity={0.7}>
                        <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{opt.label}</Text>
                        {active && <Text style={styles.modalOptionCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setOpenDropdown(null)}>
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={viewerOpen} transparent animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <TouchableOpacity style={styles.viewerOverlay} activeOpacity={1} onPress={() => setViewerOpen(false)}>
          {viewerUrl ? <Image source={{ uri: viewerUrl }} style={styles.viewerImage} resizeMode="contain" /> : <ActivityIndicator color={colors.gold} />}
        </TouchableOpacity>
      </Modal>

      <LibraryFilterModal
        visible={filterModalOpen}
        title={editingFilter ? 'Edit filter' : 'New filter'}
        itemNoun="lineups"
        items={filterItems}
        initialName={editingFilter?.name}
        initialSelected={editingFilter?.itemIds}
        saving={savingFilter}
        onSave={saveFilter}
        onClose={() => { setFilterModalOpen(false); setEditingFilter(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  headerSpacer: { width: 40 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  blurb: { fontSize: 15, fontFamily: fonts.headingItalic, color: colors.textMuted, lineHeight: 21, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 160, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  filterChipActive: { borderColor: colors.gold },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.xl, paddingBottom: 60 },
  tile: { alignItems: 'flex-start' },
  tileImageWrap: { borderRadius: 10, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tileDate: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, marginTop: spacing.xs },
  tileCount: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  favStar: { position: 'absolute', top: spacing.xs, right: spacing.xs, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  favStarText: { fontSize: 20, color: '#FFFFFF', lineHeight: 22 },
  favStarActive: { color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
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
  viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  viewerImage: { width: '100%', height: '80%' },
});
