import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { getBins, getBinCells, deleteBin } from '../../../src/api/bins';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';
import type { BinCell } from '../../../src/types/wine';

const SQRT2 = Math.SQRT2;
const CANVAS_H = 380;
const MAX_CELL = 66;

// Enumerate the diamond tessellation in unit coords (cell = 1), spatial order,
// splitting full diamonds from clipped edge cells — the same tessellation the
// sizer draws and buildBinCells counts. Positions let us lay each STORED cell
// (diamonds first, then triangles) at its place in the lattice.
function tessellate(across: number, down: number): { full: { x: number; y: number }[]; clipped: { x: number; y: number }[] } {
  const full: { x: number; y: number }[] = [];
  const clipped: { x: number; y: number }[] = [];
  const E = 1e-9;
  for (let jj = -1; jj <= down * 2 + 1; jj++) {
    const y = jj / 2;
    const offset = Math.abs(jj) % 2 === 0 ? 0 : 0.5;
    for (let x = offset - 1; x <= across + 1 + E; x += 1) {
      // Skip cells whose bounding box doesn't overlap the frame interior.
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
  return colors.gold + '66'; // partly filled
}

export default function BinDetailScreen() {
  const { binId } = useLocalSearchParams<{ binId: string }>();
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;
  const [vpw, setVpw] = useState(0);

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

  // Pair each geometric position with the stored cell it represents (diamonds
  // to full positions, triangles to clipped positions — order within each kind
  // is arbitrary but stable, since the stored cells carry no position).
  const laid = useMemo(() => {
    const storedDiamonds = cells.filter((c) => c.kind === 'diamond');
    const storedTriangles = cells.filter((c) => c.kind === 'triangle');
    const out: { x: number; y: number; cell: BinCell }[] = [];
    geo.full.forEach((g, i) => { const s = storedDiamonds[i]; if (s) out.push({ ...g, cell: s }); });
    geo.clipped.forEach((g, i) => { const s = storedTriangles[i]; if (s) out.push({ ...g, cell: s }); });
    return out;
  }, [geo, cells]);

  const totalBottles = cells.reduce((sum, c) => sum + (c.bottleCount ?? 0), 0);
  const totalCapacity = cells.reduce((sum, c) => sum + c.capacity, 0);

  const d = Math.min(MAX_CELL, vpw > 0 ? vpw / across : MAX_CELL, CANVAS_H / down);
  const W = across * d;
  const H = down * d;
  const originLeft = (vpw - W) / 2;
  const originTop = (CANVAS_H - H) / 2;
  const sd = d / SQRT2;

  // A tap on the lattice opens the cell whose centre is nearest — for a diamond
  // tessellation the nearest centre is exactly the cell you tapped.
  function onTapFrame(lx: number, ly: number) {
    let best: BinCell | null = null;
    let bestDist = Infinity;
    for (const p of laid) {
      const dx = p.x * d - lx;
      const dy = p.y * d - ly;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) { bestDist = dist; best = p.cell; }
    }
    if (best) router.push(`/cellar/bin/cell/${best.id}` as any);
  }

  function handleDelete() {
    if (!binId) return;
    showAlert({
      title: bin?.name ?? 'Delete bin',
      body: 'Permanently remove this bin? Wines stay in your cellar — they\'re just no longer filed in it.',
      buttons: [
        {
          text: 'Delete bin',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBin(binId);
              qc.invalidateQueries({ queryKey: ['bins'] });
              qc.invalidateQueries({ queryKey: ['cellar'] });
              router.back();
            } catch (err) {
              showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

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
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}>
          <Text style={styles.summary}>{totalBottles}/{totalCapacity} bottles</Text>
          <Text style={styles.hint}>Tap a diamond or triangle to see or add its wines. The fill shows how full each cubby is.</Text>

          <View style={styles.canvas} onLayout={(e) => setVpw(e.nativeEvent.layout.width)}>
            {W > 0 && H > 0 ? (
              <Pressable
                style={[styles.frame, { left: originLeft, top: originTop, width: W, height: H }]}
                onPress={(e) => onTapFrame(e.nativeEvent.locationX, e.nativeEvent.locationY)}
              >
                {laid.map((p) => (
                  <View
                    key={p.cell.id}
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: p.x * d - sd / 2,
                      top: p.y * d - sd / 2,
                      width: sd,
                      height: sd,
                      transform: [{ rotate: '45deg' }],
                      borderWidth: 1.25,
                      borderColor: colors.gold,
                      backgroundColor: fillColor(p.cell),
                    }}
                  />
                ))}
              </Pressable>
            ) : null}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.surfaceElevated }]} /><Text style={styles.legendText}>Empty</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.gold + '66' }]} /><Text style={styles.legendText}>Part full</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.gold }]} /><Text style={styles.legendText}>Full</Text></View>
          </View>
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
  summary: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center' },
  hint: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: spacing.lg, lineHeight: 19 },
  canvas: { height: CANVAS_H, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  frame: { position: 'absolute', overflow: 'hidden', borderWidth: 2, borderColor: colors.gold, borderRadius: 3, backgroundColor: colors.surface },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 3, borderWidth: 1, borderColor: colors.gold, transform: [{ rotate: '45deg' }] },
  legendText: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
});
