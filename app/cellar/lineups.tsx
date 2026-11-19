import { useMemo, useState } from 'react';
import { LineupThumb } from '../../src/components/LineupThumb';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { listLineupArchives, deleteLineupArchive, lineupBottleTotal, type LineupArchive } from '../../src/api/lineups';
import { cityKey } from '../../src/utils/city';
import { useLibraryFilters } from '../../src/hooks/useLibraryFilters';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import type { LibraryFilter } from '../../src/api/libraryFilters';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

function monthKey(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// One lineup row: thumbnail left, date · venue / title / note right.
function LineupTile({ item, size, onPress, onLongPress }: { item: LineupArchive; size: number; onPress: () => void; onLongPress: () => void }) {
  const date = new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} onLongPress={onLongPress} delayLongPress={400} activeOpacity={0.7}>
      <View style={{ width: size, height: Math.round(size * 0.78) }}>
        <LineupThumb path={item.image_path} width={size} height={Math.round(size * 0.78)} borderRadius={5} />
      </View>
      <View style={styles.rowBody}>
        {/* Date · venue (the city when no venue was given). */}
        <View style={styles.rowStampRow}>
          <Text style={[styles.rowStamp, { flex: 1 }]} numberOfLines={1}>{date}{(item.venue?.trim() || item.city) ? ` · ${item.venue?.trim() || item.city}` : ''}</Text>
        </View>
        {item.name?.trim() ? <Text style={styles.rowTitle} numberOfLines={1}>{item.name.trim()}</Text> : null}
        {item.note ? <Text style={styles.rowNote} numberOfLines={2}>{item.note}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function LineupLibraryScreen() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;

  const { data: lineups = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['lineup-archives', userId],
    queryFn: () => listLineupArchives(userId!),
    enabled: !!userId,
  });

  const [cityFilter, setCityFilter] = useState<string>('All');
  const [monthFilter, setMonthFilter] = useState<string>('All');
  const [openDropdown, setOpenDropdown] = useState<'city' | 'month' | null>(null);

  // Add + → photograph a lineup now, or upload one (both via Archive a Night).
  function chooseLineupSource() {
    showAlert({
      title: 'Add a Lineup',
      buttons: [
        { text: 'Photograph a Lineup', onPress: () => router.push('/cellar/archive-night' as any) },
        { text: 'Upload a Lineup', onPress: () => router.push('/cellar/archive-night?upload=1' as any) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

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
    return [{ value: 'All', label: 'All dates' }, ...seen.map((m) => ({ value: m, label: m }))];
  }, [lineups]);

  // City options — distinct cities the lineups were captured in, alphabetical.
  const cityOptions = useMemo(() => {
    // De-duplicate by canonical key so e.g. "Novello" and "Novello, Italy"
    // collapse to a single entry (keeping the richer label).
    const byKey = new Map<string, string>();
    for (const l of lineups) {
      const c = (l.city ?? '').trim();
      if (!c) continue;
      const key = cityKey(c);
      const prev = byKey.get(key);
      if (!prev || c.length > prev.length) byKey.set(key, c);
    }
    const seen = Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
    return [{ value: 'All', label: 'All cities' }, ...seen.map((c) => ({ value: c, label: c }))];
  }, [lineups]);

  const filtered = useMemo(() => {
    let list = lineups;
    if (cityFilter !== 'All') list = list.filter((l) => cityKey(l.city) === cityKey(cityFilter));
    if (monthFilter !== 'All') list = list.filter((l) => monthKey(l.archived_at) === monthFilter);
    if (activeCustomId) {
      const f = customFilters.find((cf) => cf.id === activeCustomId);
      const ids = new Set(f?.itemIds ?? []);
      list = list.filter((l) => ids.has(l.id));
    }
    return list;
  }, [lineups, cityFilter, monthFilter, activeCustomId, customFilters]);

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
  const filterItems = useMemo(() => lineups.map((l) => {
    const bottles = lineupBottleTotal(l);
    return {
      id: l.id,
      label: new Date(l.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      sublabel: bottles ? `${bottles} bottle${bottles === 1 ? '' : 's'}` : undefined,
    };
  }), [lineups]);

  // Long-press a tile to delete the lineup (photo + record).
  function confirmDeleteLineup(item: LineupArchive) {
    const date = new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    showAlert({
      title: 'Delete this lineup?',
      body: `This permanently removes the lineup photo from ${date} and its note. This can't be undone.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete lineup',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLineupArchive(item.id);
              qc.invalidateQueries({ queryKey: ['lineup-archives', userId] });
            } catch (err) {
              showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          },
        },
      ],
    });
  }

  const cityLabel = cityFilter === 'All' ? 'All cities' : cityFilter;
  const monthLabel = monthFilter === 'All' ? 'All dates' : monthFilter;

  const dropdown = openDropdown === 'city'
    ? { title: 'City', options: cityOptions, selected: cityFilter, onSelect: (v: string) => setCityFilter(v) }
    : openDropdown === 'month'
    ? { title: 'Date', options: monthOptions, selected: monthFilter, onSelect: (v: string) => setMonthFilter(v) }
    : null;

  // Tally for the lineups currently shown (respects the filters).
  const lineupBottles = filtered.reduce((sum, l) => sum + lineupBottleTotal(l), 0);

  // Lineups with no wines yet (saved with no bottles read) — they need
  // "Identify wines". Counted across the WHOLE library, not the active filter,
  // so the nudge reflects the real backlog, like "wines awaiting review".
  const awaitingLineups = lineups.filter((l) => !l.wines?.length);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Lineup Library</Text>
        <TouchableOpacity onPress={chooseLineupSource} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.addLink}>Add +</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : isError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn't load your lineups</Text>
          <Text style={styles.emptyBody}>Something went wrong reaching your library. Check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : lineups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No lineups yet</Text>
          <Text style={styles.emptyBody}>Add a lineup from the Review tab's Your Lineups, or Scan a Lineup — your photographed bottle lineups will appear here.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.lineupSummary}>
            {filtered.length} {filtered.length === 1 ? 'Lineup' : 'Lineups'} · {lineupBottles} {lineupBottles === 1 ? 'Bottle' : 'Bottles'}
          </Text>
          {/* Awaiting-attention line — mirrors "N wines awaiting your review".
              Shown whenever there is a backlog; the count is the whole library,
              not the active filter. */}
          {awaitingLineups.length > 0 && (
            <Text style={styles.lineupAwaiting}>
              {awaitingLineups.length} {awaitingLineups.length === 1 ? 'lineup' : 'lineups'} awaiting attention
            </Text>
          )}
          <View style={styles.summaryDivider} />
          <Text style={styles.filterHint}>Listed by Recency · Swipe to see all filters →</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
            <TouchableOpacity style={[styles.filterChip, monthFilter !== 'All' && styles.filterChipActive]} onPress={() => setOpenDropdown('month')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Date</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'month' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, monthFilter !== 'All' && { color: colors.gold }]} numberOfLines={1}>{monthLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, cityFilter !== 'All' && styles.filterChipActive]} onPress={() => setOpenDropdown('city')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>City</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'city' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, cityFilter !== 'All' && { color: colors.gold }]} numberOfLines={1}>{cityLabel}</Text>
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
            <ScrollView contentContainerStyle={styles.listContent}>
              {filtered.map((item) => (
                <LineupTile key={item.id} item={item} size={104} onPress={() => router.push(`/cellar/lineup/${item.id}` as any)} onLongPress={() => confirmDeleteLineup(item)} />
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

  addLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.gold, textAlign: 'right', minWidth: 40 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  // Gold whole-library tally, same treatment as the Full Cellar List summary.
  lineupSummary: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  lineupAwaiting: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: 4 },
  summaryDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginTop: spacing.md },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 112, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
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
  listContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowBody: { flex: 1 },
  rowStampRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowStamp: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text, lineHeight: 20 },
  rowTitle: { fontSize: 13.5, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 3 },

  rowNote: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 4 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  retryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  retryBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15 },
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
});
