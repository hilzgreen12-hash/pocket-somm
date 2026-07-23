import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { getBins, getBinCells, deleteBin, emptyBinCell, removeWineFromCell, binCellLabels, binDiamondCount } from '../../../src/api/bins';
import { updateCellarWine, archiveCellarWine, deleteCellarWine } from '../../../src/api/cellar';
import { useCustomFilters } from '../../../src/hooks/useCustomFilters';
import { showAlert } from '../../../src/components/AppAlert';
import { bottleSizeLabel } from '../../../src/components/BottleSizePicker';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';
import type { BinCell, CellarWine } from '../../../src/types/wine';

const SQRT2 = Math.SQRT2;
const CANVAS_H = 380;
const MAX_CELL = 66;

// Enumerate the diamond tessellation in unit coords (cell = 1), spatial order,
// splitting full diamonds from clipped edge cells — the same tessellation the
// sizer draws and buildBinCells counts.
function tessellate(across: number, down: number): { full: { x: number; y: number }[]; clipped: { x: number; y: number }[] } {
  const full: { x: number; y: number }[] = [];
  const clipped: { x: number; y: number }[] = [];
  const E = 1e-9;
  for (let jj = -1; jj <= down * 2 + 1; jj++) {
    const y = jj / 2;
    const offset = Math.abs(jj) % 2 === 0 ? 0 : 0.5;
    for (let x = offset - 1; x <= across + 1 + E; x += 1) {
      if (x + 0.5 <= E || x - 0.5 >= across - E || y + 0.5 <= E || y - 0.5 >= down - E) continue;
      const isFull = x - 0.5 >= -E && x + 0.5 <= across + E && y - 0.5 >= -E && y + 0.5 <= down + E;
      (isFull ? full : clipped).push({ x, y });
    }
  }
  return { full, clipped };
}

function fillColor(cell: BinCell): string {
  const n = cell.bottleCount ?? 0;
  if (n <= 0) return colors.surfaceElevated;
  if (n >= cell.capacity) return colors.gold;
  return colors.gold + '66';
}

export default function BinDetailScreen() {
  const { binId } = useLocalSearchParams<{ binId: string }>();
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;
  const [vpw, setVpw] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedWineId, setHighlightedWineId] = useState<string | null>(null);
  const [activeCustomFilterId, setActiveCustomFilterId] = useState<string | null>(null);
  const [movingWine, setMovingWine] = useState<{ id: string; name: string } | null>(null);

  // Bespoke filters live in the same custom_filters table as racks, scoped to
  // this bin's id (a bin is a wine_racks row), so the +Add flow just works.
  const { customFilters, create: createFilter, setWines: setFilterWines, rename: renameFilter, remove: removeFilter } = useCustomFilters(binId);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [selectedWineIds, setSelectedWineIds] = useState<Set<string>>(new Set());
  const [savingFilter, setSavingFilter] = useState(false);

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

  const across = bin?.diamonds_across ?? 1;
  const down = bin?.diamonds_down ?? 1;
  const geo = useMemo(() => tessellate(across, down), [across, down]);
  const labels = useMemo(() => binCellLabels(across, down), [across, down]);

  const labelFor = (cell: BinCell): string | null =>
    cell.kind === 'diamond'
      ? labels.diamondLabels[cell.idx] ?? null
      : labels.triangleLabels[cell.idx - binDiamondCount(across, down)] ?? null;

  const laid = useMemo(() => {
    const storedDiamonds = cells.filter((c) => c.kind === 'diamond');
    const storedTriangles = cells.filter((c) => c.kind === 'triangle');
    const out: { x: number; y: number; cell: BinCell; label: string | null }[] = [];
    geo.full.forEach((g, i) => { const s = storedDiamonds[i]; if (s) out.push({ ...g, cell: s, label: labels.diamondLabels[i] ?? null }); });
    geo.clipped.forEach((g, i) => { const s = storedTriangles[i]; if (s) out.push({ ...g, cell: s, label: labels.triangleLabels[i] ?? null }); });
    return out;
  }, [geo, cells, labels]);

  // Every wine in the bin, tagged with the cell it sits in (a wine has exactly
  // one bin_cell_id) so search/list taps can highlight that diamond.
  const entries = useMemo(
    () => cells.flatMap((c) => (c.wines ?? []).map((w) => ({ wine: w, cellId: c.id, label: labelFor(c) }))),
    [cells, labels],
  );

  const q = searchQuery.toLowerCase().trim();
  const filteredEntries = useMemo(() => {
    if (!q) return entries;
    return entries.filter(({ wine }) =>
      wine.wine_name.toLowerCase().includes(q) ||
      (wine.producer ?? '').toLowerCase().includes(q) ||
      (wine.region ?? '').toLowerCase().includes(q) ||
      (wine.grape_variety ?? '').toLowerCase().includes(q) ||
      (wine.vintage ?? '').toString().includes(q)
    );
  }, [entries, q]);

  // Which diamonds glow: every search match while searching; otherwise the
  // cells holding an active filter's wines, or the single wine tapped in the list.
  const highlightedCellIds = useMemo(() => {
    if (q) return new Set(filteredEntries.map((e) => e.cellId));
    if (activeCustomFilterId) {
      const f = customFilters.find((cf) => cf.id === activeCustomFilterId);
      const ids = new Set(f?.wineIds ?? []);
      return new Set(entries.filter((e) => ids.has(e.wine.id)).map((e) => e.cellId));
    }
    if (highlightedWineId) {
      const e = entries.find((en) => en.wine.id === highlightedWineId);
      return e ? new Set([e.cellId]) : new Set<string>();
    }
    return new Set<string>();
  }, [q, filteredEntries, activeCustomFilterId, customFilters, highlightedWineId, entries]);

  const diamonds = cells.filter((c) => c.kind === 'diamond').length;
  const halfDiamonds = cells.filter((c) => c.kind === 'triangle').length;
  const totalBottles = cells.reduce((sum, c) => sum + (c.bottleCount ?? 0), 0);
  const totalCapacity = cells.reduce((sum, c) => sum + c.capacity, 0);

  const d = Math.min(MAX_CELL, vpw > 0 ? vpw / across : MAX_CELL, CANVAS_H / down);
  const W = across * d;
  const H = down * d;
  const originLeft = (vpw - W) / 2;
  const originTop = (CANVAS_H - H) / 2;
  const sd = d / SQRT2;

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['bin-cells', binId] });
    qc.invalidateQueries({ queryKey: ['bins'] });
    qc.invalidateQueries({ queryKey: ['cellar'] });
  }

  function nearestCell(lx: number, ly: number): BinCell | null {
    let best: BinCell | null = null;
    let bestDist = Infinity;
    for (const p of laid) {
      const dx = p.x * d - lx;
      const dy = p.y * d - ly;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) { bestDist = dist; best = p.cell; }
    }
    return best;
  }

  // Short tap → place the wine being moved, else add / view the cell.
  function onTapFrame(lx: number, ly: number) {
    const c = nearestCell(lx, ly);
    if (!c) return;
    if (movingWine) { void placeMoving(c); return; }
    router.push(`/cellar/bin/cell/${c.id}?add=1` as any);
  }
  function onLongPressFrame(lx: number, ly: number) {
    if (movingWine) return;
    const c = nearestCell(lx, ly);
    if (!c) return;
    const kind = c.kind === 'triangle' ? 'triangle' : 'diamond';
    const label = labelFor(c);
    const heading = label ? (c.kind === 'triangle' ? `Half Diamond ${label}` : `Diamond ${label}`) : `This ${kind}`;
    showAlert({
      title: heading,
      buttons: [
        {
          text: 'Empty',
          style: 'destructive',
          onPress: () => showAlert({
            title: `Empty this ${kind}?`,
            body: 'The wines stay in your cellar as loose bottles — this only clears them out of this cubby.',
            buttons: [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Empty', style: 'destructive', onPress: async () => { try { await emptyBinCell(c.id); invalidate(); } catch (err) { showAlert({ title: 'Could not empty', body: err instanceof Error ? err.message : 'Please try again.' }); } } },
            ],
          }),
        },
        { text: 'Edit', onPress: () => router.push(`/cellar/bin/cell/${c.id}` as any) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  async function placeMoving(cell: BinCell) {
    if (!movingWine) return;
    try {
      await updateCellarWine(movingWine.id, { bin_cell_id: cell.id });
      invalidate();
      setMovingWine(null);
    } catch (err) {
      showAlert({ title: 'Could not move', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Long-press a wine in the list → the same verbs as a rack slot.
  function openWineMenu(w: CellarWine) {
    showAlert({
      title: [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' '),
      body: 'What would you like to do?',
      buttons: [
        { text: 'View Wine Intel', onPress: () => router.push(`/cellar/${w.id}` as any) },
        { text: 'Edit Wine', onPress: () => router.push(`/cellar/${w.id}` as any) },
        { text: 'Move to Another Diamond', onPress: () => { setMovingWine({ id: w.id, name: w.wine_name }); setListOpen(false); setSearchQuery(''); setHighlightedWineId(null); } },
        {
          text: 'Archive Wine',
          onPress: () => showAlert({
            title: 'Archive this wine?',
            body: 'It moves to Your Archive and leaves this bin. Your reviews and history stay.',
            buttons: [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Archive', onPress: async () => { try { await removeWineFromCell(w.id); await archiveCellarWine(w.id); invalidate(); } catch (err) { showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' }); } } },
            ],
          }),
        },
        {
          text: 'Delete Wine (Permanent)',
          style: 'destructive',
          onPress: () => showAlert({
            title: 'Delete wine?',
            body: "Permanently remove it from your records. This can't be undone.",
            buttons: [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteCellarWine(w.id); invalidate(); } catch (err) { showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }); } } },
            ],
          }),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function applyCustomFilter(id: string) {
    setActiveCustomFilterId((prev) => (prev === id ? null : id));
    setHighlightedWineId(null);
    setSearchQuery('');
  }

  function openCreateFilter() {
    setEditingFilterId(null);
    setFilterName('');
    setSelectedWineIds(new Set());
    setFilterModalOpen(true);
  }
  function openEditFilter(f: { id: string; name: string; wineIds: string[] }) {
    setEditingFilterId(f.id);
    setFilterName(f.name);
    setSelectedWineIds(new Set(f.wineIds));
    setFilterModalOpen(true);
  }
  function openFilterOptions(f: { id: string; name: string; wineIds: string[] }) {
    showAlert({
      title: f.name,
      body: 'Rename this filter or change the wines it holds, or delete it. Your wines stay in the cellar either way.',
      buttons: [
        { text: 'Rename / Add / Remove Wines', onPress: () => openEditFilter(f) },
        { text: 'Delete', style: 'destructive', onPress: () => { if (activeCustomFilterId === f.id) setActiveCustomFilterId(null); removeFilter.mutate(f.id); } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function toggleWineInSelection(id: string) {
    setSelectedWineIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  async function saveFilter() {
    const name = filterName.trim();
    if (!name) { showAlert({ title: 'Name needed', body: 'Give your filter a name first.' }); return; }
    const binWineIds = new Set(entries.map((e) => e.wine.id));
    const wineIds = Array.from(selectedWineIds).filter((id) => binWineIds.has(id));
    setSavingFilter(true);
    try {
      if (editingFilterId) {
        await renameFilter.mutateAsync({ filterId: editingFilterId, name });
        await setFilterWines.mutateAsync({ filterId: editingFilterId, wineIds });
      } else {
        await createFilter.mutateAsync({ name, wineIds });
      }
      setFilterModalOpen(false);
      setEditingFilterId(null);
    } catch (err) {
      showAlert({ title: 'Could not save filter', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingFilter(false);
    }
  }

  function handleDelete() {
    if (!binId) return;
    showAlert({
      title: bin?.name ?? 'Delete bin',
      body: 'Permanently remove this bin? Wines stay in your cellar — they\'re just no longer filed in it.',
      buttons: [
        { text: 'Delete bin', style: 'destructive', onPress: async () => { try { await deleteBin(binId); qc.invalidateQueries({ queryKey: ['bins'] }); qc.invalidateQueries({ queryKey: ['cellar'] }); router.back(); } catch (err) { showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }); } } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const showList = listOpen || q.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onLongPress={handleDelete} delayLongPress={400} activeOpacity={1} style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{bin?.name ?? 'Bin'}</Text>
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      {isLoading || !bin ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
          {/* Two-line stats, mirroring the rack/fridge summary. */}
          <Text style={styles.statsLine1}>{diamonds} {diamonds === 1 ? 'Diamond' : 'Diamonds'} · {halfDiamonds} Half {halfDiamonds === 1 ? 'Diamond' : 'Diamonds'}</Text>
          <Text style={styles.statsLine2}>{entries.length} {entries.length === 1 ? 'Wine' : 'Wines'} · {totalBottles} {totalBottles === 1 ? 'Bottle' : 'Bottles'} · {totalCapacity} Slots</Text>
          <Text style={styles.hint}>Short tap an area to add wine or view contents. Long hold to Empty or Edit.</Text>

          {movingWine ? (
            <View style={styles.movingBanner}>
              <Text style={styles.movingBannerText} numberOfLines={2}>Moving {movingWine.name} — tap a diamond to file it there.</Text>
              <TouchableOpacity onPress={() => setMovingWine(null)}><Text style={styles.movingCancel}>Cancel</Text></TouchableOpacity>
            </View>
          ) : null}

          {/* Filter row — List reveals the contents; each saved filter is a chip
              that highlights its diamonds; + Add builds a bespoke one. */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={[styles.filterChip, listOpen && styles.filterChipActive]} onPress={() => setListOpen((v) => !v)} activeOpacity={0.7}>
              <Text style={[styles.filterChipText, listOpen && styles.filterChipTextActive]}>List {listOpen ? '▴' : '▾'}</Text>
            </TouchableOpacity>
            {customFilters.map((f) => {
              const active = activeCustomFilterId === f.id;
              return (
                <TouchableOpacity key={f.id} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => applyCustomFilter(f.id)} onLongPress={() => openFilterOptions(f)} delayLongPress={400} activeOpacity={0.7}>
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]} numberOfLines={1}>{f.name}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.filterChipAdd} onPress={openCreateFilter} activeOpacity={0.7}>
              <Text style={styles.filterChipAddText}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Search bar — matches racks/fridges. */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={(t) => { setSearchQuery(t); setActiveCustomFilterId(null); setHighlightedWineId(null); }}
              placeholder="Search producer, wine, region, vintage…"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}><Text style={styles.searchClearText}>✕</Text></TouchableOpacity>
            ) : null}
          </View>

          {showList ? (
            <View style={styles.listSection}>
              {filteredEntries.length === 0 ? (
                <Text style={styles.emptyList}>{entries.length === 0 ? 'No wines in this bin yet.' : `No wines match "${searchQuery}"`}</Text>
              ) : (
                <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {filteredEntries.map(({ wine, label }) => {
                    const active = highlightedWineId === wine.id;
                    return (
                      <TouchableOpacity
                        key={wine.id}
                        style={[styles.wineRow, active && styles.wineRowActive]}
                        onPress={() => { setHighlightedWineId(wine.id); setActiveCustomFilterId(null); setSearchQuery(''); setListOpen(false); }}
                        onLongPress={() => openWineMenu(wine)}
                        delayLongPress={400}
                        activeOpacity={0.7}
                      >
                        <View style={styles.wineRowTop}>
                          {label ? <Text style={styles.cubbyTag}>{label}</Text> : null}
                          <Text style={styles.wineName} numberOfLines={1}>{wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}</Text>
                        </View>
                        <Text style={styles.wineMeta} numberOfLines={1}>
                          {[wine.region, `${wine.quantity ?? 1} × ${bottleSizeLabel(wine.bottle_size_ml ?? 750)}`].filter(Boolean).join(' · ')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          ) : null}

          <View style={styles.canvasWrap}>
            <View style={styles.canvas} onLayout={(e) => setVpw(e.nativeEvent.layout.width)}>
              {W > 0 && H > 0 ? (
                <Pressable
                  style={[styles.frame, { left: originLeft, top: originTop, width: W, height: H }]}
                  onPress={(e) => onTapFrame(e.nativeEvent.locationX, e.nativeEvent.locationY)}
                  onLongPress={(e) => onLongPressFrame(e.nativeEvent.locationX, e.nativeEvent.locationY)}
                  delayLongPress={400}
                >
                  {laid.map((p) => {
                    const hot = highlightedCellIds.has(p.cell.id);
                    const dim = highlightedCellIds.size > 0 && !hot;
                    return (
                      <View key={p.cell.id} pointerEvents="none" style={{ opacity: dim ? 0.3 : 1 }}>
                        <View
                          style={{ position: 'absolute', left: p.x * d - sd / 2, top: p.y * d - sd / 2, width: sd, height: sd, transform: [{ rotate: '45deg' }], borderWidth: hot ? 2.5 : 1.25, borderColor: hot ? '#fff2cc' : colors.gold, backgroundColor: hot ? colors.gold : fillColor(p.cell) }}
                        />
                        {p.label ? (
                          <Text style={{ position: 'absolute', left: p.x * d - 18, top: p.y * d - 6, width: 36, textAlign: 'center', fontSize: 8.5, fontFamily: fonts.bodySemibold, color: hot || (p.cell.bottleCount ?? 0) >= p.cell.capacity ? colors.background : colors.textMuted }}>
                            {p.label}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.surfaceElevated }]} /><Text style={styles.legendText}>Empty</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.gold + '66' }]} /><Text style={styles.legendText}>Part full</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.gold }]} /><Text style={styles.legendText}>Full</Text></View>
          </View>
        </ScrollView>
      )}

      {/* Bespoke-filter builder — name it, tick the wines it holds. */}
      <Modal visible={filterModalOpen} transparent animationType="fade" onRequestClose={() => setFilterModalOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{editingFilterId ? 'Edit Filter' : 'New Filter'}</Text>
            <TextInput style={styles.input} value={filterName} onChangeText={setFilterName} placeholder="Filter name (e.g. Drink First)" placeholderTextColor={colors.textMuted} />
            <Text style={styles.sheetLabel}>Wines in this filter</Text>
            <ScrollView style={{ maxHeight: 280 }} nestedScrollEnabled>
              {entries.length === 0 ? (
                <Text style={styles.emptyList}>No wines in this bin yet.</Text>
              ) : entries.map(({ wine, label }) => {
                const on = selectedWineIds.has(wine.id);
                return (
                  <TouchableOpacity key={wine.id} style={styles.pickRow} onPress={() => toggleWineInSelection(wine.id)} activeOpacity={0.7}>
                    <View style={[styles.checkbox, on && styles.checkboxOn]}>{on ? <Text style={styles.checkboxTick}>✓</Text> : null}</View>
                    <View style={styles.wineRowTop}>
                      {label ? <Text style={styles.cubbyTag}>{label}</Text> : null}
                      <Text style={styles.wineName} numberOfLines={1}>{wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.saveBtn, savingFilter && { opacity: 0.5 }]} onPress={saveFilter} disabled={savingFilter} activeOpacity={0.85}>
              {savingFilter ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.saveBtnText}>{editingFilterId ? 'Save Filter' : 'Create Filter'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setFilterModalOpen(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  titleWrap: { flex: 1 },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  statsLine1: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', marginTop: spacing.lg },
  statsLine2: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', marginTop: 2 },
  hint: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: spacing.md, lineHeight: 19, paddingHorizontal: spacing.xl },
  movingBanner: { marginHorizontal: spacing.xl, marginBottom: spacing.sm, padding: spacing.md, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.14)', borderWidth: 1, borderColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  movingBannerText: { flex: 1, fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.text },
  movingCancel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold },
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
  emptyList: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  wineRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineRowActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  wineRowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cubbyTag: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.gold, borderWidth: 1, borderColor: colors.gold, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden' },
  wineName: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text, flexShrink: 1 },
  wineMeta: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  canvasWrap: { paddingHorizontal: spacing.xl },
  canvas: { height: CANVAS_H, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  frame: { position: 'absolute', overflow: 'hidden', borderWidth: 2, borderColor: colors.gold, borderRadius: 3, backgroundColor: colors.surface },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 3, borderWidth: 1, borderColor: colors.gold, transform: [{ rotate: '45deg' }] },
  legendText: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  sheetTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  sheetLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.16)' },
  checkboxTick: { fontSize: 13, color: colors.gold, fontFamily: fonts.bodySemibold },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelBtn: { alignItems: 'center', paddingTop: spacing.md },
  cancelBtnText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
