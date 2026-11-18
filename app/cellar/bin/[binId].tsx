import { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { useCellarContext } from '../../../src/hooks/useCellarContext';
import { useCellar, invalidateCellarViews } from '../../../src/hooks/useCellar';
import { useBinFilters, type BinEntry } from '../../../src/hooks/useBinFilters';
import { useStorageLocationNav } from '../../../src/hooks/useStorageLocationNav';
import { VIEW_ONLY_MESSAGE } from '../../../src/api/cellarContext';
import { getBins, getBinCells, deleteBin, emptyBinCell, emptyBin, renameBin } from '../../../src/api/bins';
import { fetchPlacementsForWines, placedCount } from '../../../src/api/placements';
import { binCellLabels, binDiamondCount } from '../../../src/utils/binGeometry';
import { binCellNoun, confirmCellCapacity, fileLooseBottlesInCell, moveBetweenBinCells } from '../../../src/services/binMoves';
import { BinLattice } from '../../../src/components/bin/BinLattice';
import { BinFilterModal } from '../../../src/components/bin/BinFilterModal';
import { useBinWineMenu } from '../../../src/components/bin/useBinWineMenu';
import { binStyles } from '../../../src/components/bin/styles';
import { RenameModal } from '../../../src/components/RenameModal';
import { CellarCommandModal } from '../../../src/components/CellarCommandModal';
import { showAlert } from '../../../src/components/AppAlert';
import { bottleSizeLabel } from '../../../src/components/BottleSizePicker';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { tidyWineRegion } from '../../../src/utils/regionFormat';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';
import type { BinCell } from '../../../src/types/wine';

// Bottles being moved: from another cell, or loose bottles waiting to be filed
// in this bin (no `fromCellId`).
type Moving = { id: string; name: string; qty: number; fromCellId?: string };

export default function BinDetailScreen() {
  const { binId, highlight } = useLocalSearchParams<{ binId: string; highlight?: string }>();
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;
  const canEdit = useCellarContext().role !== 'view';
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [savingRename, setSavingRename] = useState(false);
  const [moving, setMoving] = useState<Moving | null>(null);
  // A tap while a move is still saving must not file the bottles twice.
  const placingRef = useRef(false);

  const { data: bins = [] } = useQuery({
    queryKey: ['bins', userId],
    queryFn: () => getBins(userId!),
    enabled: !!userId,
  });
  const bin = bins.find((b) => b.id === binId);
  const { data: cells = [], isLoading } = useQuery({
    queryKey: ['bin-cells', binId],
    queryFn: () => getBinCells(binId!),
    enabled: !!binId,
  });

  // Header ‹ › hop across ALL home storage in the carousel's order.
  const storageNav = useStorageLocationNav();
  const prevLoc = storageNav.prev(binId);
  const nextLoc = storageNav.next(binId);

  const across = bin?.diamonds_across ?? 1;
  const down = bin?.diamonds_down ?? 1;
  const labels = useMemo(() => binCellLabels(across, down), [across, down]);
  const entries = useMemo<BinEntry[]>(() => {
    const labelFor = (c: BinCell) => (c.kind === 'diamond'
      ? labels.diamondLabels[c.idx]
      : labels.triangleLabels[c.idx - binDiamondCount(across, down)]) ?? null;
    return cells.flatMap((c) => (c.wines ?? []).map((wine) => ({ wine, cellId: c.id, label: labelFor(c) })));
  }, [cells, labels, across, down]);
  const filters = useBinFilters(binId, entries, highlight);

  // Bottles moved into this bin (e.g. by Quick Command) that have no cell yet:
  // each wine's bottles that aren't placed anywhere.
  const { wines: allWines } = useCellar();
  const awaitingWines = useMemo(() => allWines.filter((w) => w.awaiting_placement_unit_id === binId), [allWines, binId]);
  const { data: awaitingPlacements = [] } = useQuery({
    queryKey: ['placements-list', 'bin-awaiting', binId, awaitingWines.map((w) => w.id).join(',')],
    queryFn: () => fetchPlacementsForWines(awaitingWines.map((w) => w.id)),
    enabled: awaitingWines.length > 0,
  });
  const looseOf = (wineId: string, quantity: number) =>
    Math.max(0, quantity - placedCount(awaitingPlacements.filter((p) => p.cellar_wine_id === wineId)));
  const awaitingBottles = awaitingWines.reduce((s, w) => s + looseOf(w.id, w.quantity ?? 0), 0);

  const wineMenu = useBinWineMenu({
    binId,
    binName: bin?.name ?? 'this bin',
    entries,
    canEdit,
    onHighlight: (wineId) => { filters.highlightWine(wineId); filters.setListOpen(false); },
    onStartMove: (w, cellId, qty) => {
      setMoving({ id: w.id, name: w.wine_name, fromCellId: cellId, qty });
      filters.highlightWine(null);
      filters.setListOpen(false);
    },
  });

  const diamonds = cells.filter((c) => c.kind === 'diamond').length;
  const halfDiamonds = cells.length - diamonds;
  const wineCount = new Set(entries.map((e) => e.wine.id)).size;
  const totalBottles = cells.reduce((sum, c) => sum + (c.bottleCount ?? 0), 0);
  const totalCapacity = cells.reduce((sum, c) => sum + c.capacity, 0);
  const fail = (title: string, err: unknown) => showAlert({ title, body: err instanceof Error ? err.message : 'Please try again.' });

  // A tap files the bottles being moved, else opens the cell — straight into
  // its add chooser when it's empty and the user can add.
  function onPressCell(c: BinCell) {
    if (moving) { void placeMoving(c); return; }
    const offerAdd = canEdit && (c.wines?.length ?? 0) === 0;
    router.push(`/cellar/bin/cell/${c.id}${offerAdd ? '?add=1' : ''}` as any);
  }

  function onLongPressCell(c: BinCell) {
    if (moving) return;
    const noun = binCellNoun(c.kind);
    const label = c.kind === 'diamond' ? labels.diamondLabels[c.idx] : labels.triangleLabels[c.idx - binDiamondCount(across, down)];
    showAlert({
      title: label ? `${c.kind === 'triangle' ? 'Half Diamond' : 'Diamond'} ${label}` : `This ${noun}`,
      buttons: [
        { text: 'Add Wines', onPress: () => router.push(`/cellar/bin/cell/${c.id}?add=1` as any) },
        ...((c.wines?.length ?? 0) > 0 ? [{
          text: 'Empty Contents',
          style: 'destructive' as const,
          onPress: () => showAlert({
            title: `Empty this ${noun}?`,
            body: 'The wines stay in your cellar as loose bottles — this only clears them out of this cubby.',
            buttons: [
              { text: 'Cancel', style: 'cancel' as const },
              { text: 'Empty', style: 'destructive' as const, onPress: async () => {
                  try { await emptyBinCell(c.id); }
                  catch (err) { fail('Could not empty', err); }
                  finally { invalidateCellarViews(qc); }
                } },
            ],
          }),
        }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  async function placeMoving(cell: BinCell) {
    const m = moving;
    if (!m || placingRef.current) return;
    if (m.fromCellId === cell.id) { setMoving(null); return; } // put back where it was
    placingRef.current = true;
    try {
      if (!(await confirmCellCapacity(cell, (cell.bottleCount ?? 0) + m.qty, 'Place'))) return;
      if (m.fromCellId) {
        await moveBetweenBinCells(m.id, m.fromCellId, cell.id, m.qty);
      } else if ((await fileLooseBottlesInCell(m.id, cell.id)) === 0) {
        showAlert({ title: 'Already placed', body: 'All bottles of this wine are already filed in your storage.' });
      }
      setMoving(null);
    } catch (err) {
      fail('Could not move', err);
    } finally {
      placingRef.current = false;
      invalidateCellarViews(qc);
    }
  }

  // Top-right "Edit": bin management, as the rack/fridge Edit offers. A bin's
  // diamond geometry is fixed at creation, so there's no resize.
  function openBinEdit() {
    const run = (title: string, work: () => Promise<void>, after?: () => void) => async () => {
      try { await work(); after?.(); }
      catch (err) { fail(title, err); }
      finally { invalidateCellarViews(qc); }
    };
    showAlert({
      title: bin?.name ?? 'Bin',
      body: 'Manage this bin.',
      buttons: [
        { text: 'Rename Bin', onPress: () => setRenameOpen(true) },
        { text: 'Empty Bin Contents', style: 'destructive', onPress: () => showAlert({
            title: 'Empty this bin?',
            body: "This empties every cell in this bin. The wines stay in your cellar — they're just unassigned from this bin.",
            buttons: [
              { text: 'Empty bin', style: 'destructive', onPress: run('Could not empty', () => emptyBin(binId)) },
              { text: 'Cancel', style: 'cancel' },
            ],
          }) },
        { text: 'Delete Bin', style: 'destructive', onPress: () => showAlert({
            title: bin?.name ?? 'Delete bin',
            body: "Permanently remove this bin? Wines stay in your cellar — they're just no longer filed in it.",
            buttons: [
              { text: 'Delete bin', style: 'destructive', onPress: run('Could not delete', () => deleteBin(binId), () => router.back()) },
              { text: 'Cancel', style: 'cancel' },
            ],
          }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  async function handleRename(name: string) {
    const n = name.trim();
    if (!n) return;
    setSavingRename(true);
    try {
      await renameBin(binId, n);
      invalidateCellarViews(qc);
      setRenameOpen(false);
    } catch (err) {
      fail('Could not rename', err);
    } finally {
      setSavingRename(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleNav}>
          <TouchableOpacity onPress={() => prevLoc && router.replace(prevLoc.route as any)} disabled={!prevLoc} hitSlop={{ top: 12, bottom: 12, left: 12, right: 6 }} accessibilityLabel="Previous storage location">
            <Text style={[styles.navArrow, !prevLoc && styles.navArrowDisabled]}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{bin?.name ?? 'Bin'}</Text>
          <TouchableOpacity onPress={() => nextLoc && router.replace(nextLoc.route as any)} disabled={!nextLoc} hitSlop={{ top: 12, bottom: 12, left: 6, right: 12 }} accessibilityLabel="Next storage location">
            <Text style={[styles.navArrow, !nextLoc && styles.navArrowDisabled]}>›</Text>
          </TouchableOpacity>
        </View>
        {canEdit ? (
          <TouchableOpacity onPress={openBinEdit} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
            <Text style={styles.headerEdit}>Edit</Text>
          </TouchableOpacity>
        ) : <View style={styles.headerSpacer} />}
      </View>

      {canEdit && (
        <TouchableOpacity onPress={() => setVoiceOpen(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7} style={styles.voiceBubble}>
          <Text style={styles.voiceBubbleText}>Quick Command</Text>
        </TouchableOpacity>
      )}
      <View style={styles.headerDivider} />

      {isLoading || !bin ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : (
        <>
          {/* Static header — stats, instructions and the moving banner. Only
              the filters, list and lattice below scroll. */}
          <Text style={styles.statsLine1}>{diamonds} {diamonds === 1 ? 'Diamond' : 'Diamonds'} · {halfDiamonds} Half {halfDiamonds === 1 ? 'Diamond' : 'Diamonds'}</Text>
          <Text style={styles.statsLine2}>{wineCount} {wineCount === 1 ? 'Wine' : 'Wines'} · {totalBottles} {totalBottles === 1 ? 'Bottle' : 'Bottles'} · {totalCapacity} Slots</Text>
          {canEdit
            ? <Text style={styles.hint}>Short tap an area to add wine or view / edit contents. Long hold to empty.</Text>
            : <Text style={styles.hint}>{VIEW_ONLY_MESSAGE}</Text>}
          {canEdit && awaitingBottles > 0 && !moving ? (
            <View style={styles.awaitingBlock}>
              <Text style={styles.awaitingBanner}>{awaitingBottles} {awaitingBottles === 1 ? 'Bottle' : 'Bottles'} moved here — awaiting placement</Text>
              {awaitingWines.map((w) => {
                const start = () => setMoving({ id: w.id, name: w.wine_name, qty: looseOf(w.id, w.quantity ?? 0) });
                return (
                  <TouchableOpacity key={w.id} style={styles.awaitingRow} onPress={start} onLongPress={start} delayLongPress={400} activeOpacity={0.7}>
                    <Text style={styles.awaitingWine} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name}</Text>
                    <Text style={styles.awaitingHint}>Long-press, then tap a diamond to place →</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
          {moving ? (
            <View style={styles.movingBanner}>
              <Text style={styles.movingBannerText} numberOfLines={2}>Moving {moving.name} — tap a diamond to file it there.</Text>
              <TouchableOpacity onPress={() => setMoving(null)}><Text style={styles.movingCancel}>Cancel</Text></TouchableOpacity>
            </View>
          ) : null}

          <ScrollView contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
            {/* List reveals the contents; each saved filter is a chip that
                highlights its diamonds; + Add builds a new one. */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} keyboardShouldPersistTaps="handled">
              <TouchableOpacity style={[styles.filterChip, filters.listOpen && styles.filterChipActive]} onPress={() => filters.setListOpen(!filters.listOpen)} activeOpacity={0.7}>
                <Text style={[styles.filterChipText, filters.listOpen && styles.filterChipTextActive]} allowFontScaling={false}>List {filters.listOpen ? '▴' : '▾'}</Text>
              </TouchableOpacity>
              {filters.customFilters.map((f) => {
                const active = filters.activeFilterId === f.id;
                return (
                  <TouchableOpacity key={f.id} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => filters.toggleFilter(f.id)} onLongPress={canEdit ? () => filters.openFilterOptions(f) : undefined} delayLongPress={400} activeOpacity={0.7}>
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]} numberOfLines={1} allowFontScaling={false}>{f.name}</Text>
                  </TouchableOpacity>
                );
              })}
              {canEdit && (
                <TouchableOpacity style={styles.filterChipAdd} onPress={filters.openNewFilter} activeOpacity={0.7}>
                  <Text style={styles.filterChipAddText} allowFontScaling={false}>+ Add</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={filters.searchQuery}
                onChangeText={filters.search}
                placeholder="Search producer, wine, region, vintage…"
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {filters.searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => filters.search('')} style={styles.searchClear}><Text style={styles.searchClearText}>✕</Text></TouchableOpacity>
              ) : null}
            </View>

            {filters.showList ? (
              <View style={styles.listSection}>
                {filters.filteredEntries.length === 0 ? (
                  <Text style={binStyles.emptyList}>{entries.length === 0 ? 'No wines in this bin yet.' : `No wines match "${filters.searchQuery}"`}</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {filters.filteredEntries.map(({ wine, label, cellId }) => {
                      const active = filters.highlightedWineId === wine.id;
                      const regionLine = [tidyWineRegion(wine.region), wine.grape_variety].filter(Boolean).join(' · ');
                      return (
                        <TouchableOpacity
                          key={`${wine.id}-${cellId}`}
                          style={[styles.wineRow, active && styles.wineRowActive]}
                          onPress={() => {
                            // Tapping the highlighted wine again clears it.
                            filters.highlightWine(active ? null : wine.id);
                            if (!active) filters.setListOpen(false);
                          }}
                          onLongPress={() => wineMenu.open(wine, cellId)}
                          delayLongPress={400}
                          activeOpacity={0.7}
                        >
                          <View style={binStyles.wineRowTop}>
                            {label ? <Text style={binStyles.cubbyTag}>{label}</Text> : null}
                            <Text style={binStyles.wineName} numberOfLines={1}>{wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}</Text>
                          </View>
                          {regionLine ? <Text style={[styles.wineMeta, { color: colors.gold }]} numberOfLines={1}>{regionLine}</Text> : null}
                          <Text style={styles.wineMeta} numberOfLines={1}>{`${wine.bin_cell_quantity ?? 0} × ${bottleSizeLabel(wine.bottle_size_ml ?? 750)}`}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            ) : null}

            <BinLattice
              across={across}
              down={down}
              cells={cells}
              labels={labels}
              highlighted={filters.highlightedCellIds}
              onPressCell={onPressCell}
              onLongPressCell={canEdit ? onLongPressCell : undefined}
            />
          </ScrollView>
        </>
      )}

      <BinFilterModal filters={filters} entries={entries} />
      <RenameModal visible={renameOpen} initialName={bin?.name ?? ''} title="Rename bin" saving={savingRename} onSave={handleRename} onClose={() => setRenameOpen(false)} />
      {/* Quick Command — the Cellar tab's engine, scoped to this bin. */}
      <CellarCommandModal visible={voiceOpen} onClose={() => setVoiceOpen(false)} locationName={bin?.name ?? null} scope={binId ? { kind: 'bin', id: binId } : undefined} hereWineIds={Array.from(new Set(entries.map((e) => e.wine.id)))} />
      {wineMenu.sheets}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voiceBubble: { alignSelf: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 8, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  voiceBubbleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  headerDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  // Equal-width back / Edit so the flex-1 title is truly screen-centred.
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 50 },
  headerEdit: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.gold, textAlign: 'right', width: 50 },
  headerSpacer: { width: 50 },
  // Centred nav cluster: ‹ bin name › — gold arrows hop across all home storage.
  titleNav: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  navArrow: { fontSize: 26, fontFamily: fonts.headingSemibold, color: colors.gold, paddingHorizontal: 2 },
  navArrowDisabled: { color: 'rgba(224,184,74,0.25)' },
  title: { flexShrink: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  statsLine1: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', marginTop: spacing.lg },
  statsLine2: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', marginTop: 2 },
  hint: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: spacing.md, lineHeight: 19, paddingHorizontal: spacing.xl },
  movingBanner: { marginHorizontal: spacing.xl, marginBottom: spacing.sm, padding: spacing.md, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.14)', borderWidth: 1, borderColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  movingBannerText: { flex: 1, fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.text },
  movingCancel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold },
  // "Awaiting placement" banner + yellow rows (moved here, no cell yet).
  awaitingBlock: { paddingTop: spacing.xs },
  awaitingBanner: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textAlign: 'center', paddingHorizontal: spacing.xl },
  awaitingRow: { marginHorizontal: spacing.xl, marginTop: spacing.sm, padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.12)' },
  awaitingWine: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
  awaitingHint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.sm },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md, backgroundColor: colors.surface, maxWidth: 170 },
  filterChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.12)' },
  filterChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  filterChipTextActive: { color: colors.gold },
  filterChipAdd: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md },
  filterChipAddText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text },
  searchClear: { paddingLeft: spacing.sm, paddingVertical: spacing.sm },
  searchClearText: { fontSize: 14, color: colors.textMuted },
  listSection: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  wineRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineRowActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  wineMeta: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
});
