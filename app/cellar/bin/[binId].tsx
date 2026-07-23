import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { getBins, getBinCells, deleteBin, emptyBinCell, binCellLabels, binDiamondCount } from '../../../src/api/bins';
import { showAlert } from '../../../src/components/AppAlert';
import { bottleSizeLabel } from '../../../src/components/BottleSizePicker';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';
import type { BinCell, CellarWine } from '../../../src/types/wine';

const SQRT2 = Math.SQRT2;
const CANVAS_H = 380;
const MAX_CELL = 66;

const MATURITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'too_young', label: 'Too Young' },
  { value: 'approaching', label: 'Early but Approachable' },
  { value: 'peak', label: 'Sweet Spot' },
  { value: 'declining', label: 'In Decline' },
];

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
  const [maturity, setMaturity] = useState('');
  const [maturityOpen, setMaturityOpen] = useState(false);

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

  const allWines = useMemo(() => cells.flatMap((c) => c.wines ?? []), [cells]);
  const listEntries = useMemo(
    () => cells.flatMap((c) => (c.wines ?? []).map((w) => ({ w, label: labelFor(c) }))),
    [cells, labels],
  );
  const filteredEntries = maturity ? listEntries.filter((e) => e.w.drinking_window_status === maturity) : listEntries;

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

  // Short tap → add / view the cell. Long hold → Empty or Edit.
  function onTapFrame(lx: number, ly: number) {
    const c = nearestCell(lx, ly);
    if (c) router.push(`/cellar/bin/cell/${c.id}?add=1` as any);
  }
  function onLongPressFrame(lx: number, ly: number) {
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

  const renderEntry = (entry: { w: CellarWine; label: string | null }) => {
    const { w, label } = entry;
    return (
      <TouchableOpacity key={w.id} style={styles.wineRow} onPress={() => router.push(`/cellar/${w.id}` as any)} activeOpacity={0.7}>
        <View style={styles.wineRowTop}>
          {label ? <Text style={styles.cubbyTag}>{label}</Text> : null}
          <Text style={styles.wineName} numberOfLines={1}>{[w.producer, w.wine_name, w.vintage].filter(Boolean).join(' ')}</Text>
        </View>
        <Text style={styles.wineMeta} numberOfLines={1}>
          {[w.region, `${w.quantity ?? 1} × ${bottleSizeLabel(w.bottle_size_ml ?? 750)}`].filter(Boolean).join(' · ')}
        </Text>
      </TouchableOpacity>
    );
  };

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
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Two-line stats, mirroring the rack/fridge summary. */}
          <Text style={styles.statsLine1}>{diamonds} {diamonds === 1 ? 'Diamond' : 'Diamonds'} · {halfDiamonds} Half {halfDiamonds === 1 ? 'Diamond' : 'Diamonds'}</Text>
          <Text style={styles.statsLine2}>{allWines.length} {allWines.length === 1 ? 'Wine' : 'Wines'} · {totalBottles} {totalBottles === 1 ? 'Bottle' : 'Bottles'} · {totalCapacity} Slots</Text>
          <Text style={styles.hint}>Short tap an area to add wine or view contents. Long hold to Empty or Edit.</Text>

          {/* Filter row — List reveals the full contents; Maturity filters it. */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <TouchableOpacity style={[styles.filterChip, listOpen && styles.filterChipActive]} onPress={() => { setListOpen((v) => !v); setMaturityOpen(false); }} activeOpacity={0.7}>
              <Text style={[styles.filterChipText, listOpen && styles.filterChipTextActive]}>List {listOpen ? '▴' : '▾'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, maturity ? styles.filterChipActive : null]} onPress={() => { setMaturityOpen((v) => !v); setListOpen(false); }} activeOpacity={0.7}>
              <Text style={[styles.filterChipText, maturity ? styles.filterChipTextActive : null]}>
                {maturity ? (MATURITY_OPTIONS.find((o) => o.value === maturity)?.label ?? 'Maturity') : 'Maturity'} {maturityOpen ? '▴' : '▾'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {maturityOpen ? (
            <View style={styles.maturityDropdown}>
              {MATURITY_OPTIONS.map((o) => {
                const active = maturity === o.value;
                return (
                  <TouchableOpacity key={o.value || 'all'} style={[styles.maturityOption, active && styles.maturityOptionActive]} onPress={() => { setMaturity(o.value); setMaturityOpen(false); setListOpen(true); }} activeOpacity={0.7}>
                    <Text style={[styles.maturityOptionText, active && styles.maturityOptionTextActive]}>{o.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {listOpen ? (
            <View style={styles.listSection}>
              {filteredEntries.length === 0 ? (
                <Text style={styles.emptyList}>{allWines.length === 0 ? 'No wines in this bin yet.' : 'No wines match this filter.'}</Text>
              ) : filteredEntries.map(renderEntry)}
            </View>
          ) : (
            <>
              <View style={styles.canvasWrap}>
                <View style={styles.canvas} onLayout={(e) => setVpw(e.nativeEvent.layout.width)}>
                  {W > 0 && H > 0 ? (
                    <Pressable
                      style={[styles.frame, { left: originLeft, top: originTop, width: W, height: H }]}
                      onPress={(e) => onTapFrame(e.nativeEvent.locationX, e.nativeEvent.locationY)}
                      onLongPress={(e) => onLongPressFrame(e.nativeEvent.locationX, e.nativeEvent.locationY)}
                      delayLongPress={400}
                    >
                      {laid.map((p) => (
                        <View key={p.cell.id} pointerEvents="none">
                          <View
                            style={{ position: 'absolute', left: p.x * d - sd / 2, top: p.y * d - sd / 2, width: sd, height: sd, transform: [{ rotate: '45deg' }], borderWidth: 1.25, borderColor: colors.gold, backgroundColor: fillColor(p.cell) }}
                          />
                          {p.label ? (
                            <Text style={{ position: 'absolute', left: p.x * d - 18, top: p.y * d - 6, width: 36, textAlign: 'center', fontSize: 8.5, fontFamily: fonts.bodySemibold, color: (p.cell.bottleCount ?? 0) >= p.cell.capacity ? colors.background : colors.textMuted }}>
                              {p.label}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.surfaceElevated }]} /><Text style={styles.legendText}>Empty</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.gold + '66' }]} /><Text style={styles.legendText}>Part full</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.gold }]} /><Text style={styles.legendText}>Full</Text></View>
              </View>
            </>
          )}
        </ScrollView>
      )}
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
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.sm },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md, backgroundColor: colors.surface, maxWidth: 170 },
  filterChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.12)' },
  filterChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  filterChipTextActive: { color: colors.gold },
  maturityDropdown: { marginHorizontal: spacing.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, overflow: 'hidden' },
  maturityOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  maturityOptionActive: { backgroundColor: 'rgba(212,176,96,0.12)' },
  maturityOptionText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  maturityOptionTextActive: { color: colors.gold, fontFamily: fonts.bodySemibold },
  listSection: { paddingHorizontal: spacing.xl },
  emptyList: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
  wineRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
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
});
