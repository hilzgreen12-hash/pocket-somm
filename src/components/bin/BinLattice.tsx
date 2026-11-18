import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { tessellate } from '../../utils/binGeometry';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import type { BinCell } from '../../types/wine';

const CANVAS_H = 380;
const MAX_CELL = 66;

function fillColor(cell: BinCell): string {
  const n = cell.bottleCount ?? 0;
  if (n <= 0) return colors.surfaceElevated;
  if (n >= cell.capacity) return colors.gold;
  return colors.gold + '66';
}

// The bin drawn as its diamond lattice: each stored cell at its place in the
// tessellation, filled by how full it is, with its grid reference. A tap or a
// long-press goes to the nearest cell. `highlighted` cells glow and the rest dim.
export function BinLattice({ across, down, cells, labels, highlighted, onPressCell, onLongPressCell }: {
  across: number;
  down: number;
  cells: BinCell[];
  labels: { diamondLabels: (string | null)[]; triangleLabels: (string | null)[] };
  highlighted: Set<string>;
  onPressCell: (cell: BinCell) => void;
  onLongPressCell?: (cell: BinCell) => void;
}) {
  const [vpw, setVpw] = useState(0);
  const d = Math.min(MAX_CELL, vpw > 0 ? vpw / across : MAX_CELL, CANVAS_H / down);
  const W = across * d;
  const H = down * d;
  const originLeft = (vpw - W) / 2;
  const originTop = (CANVAS_H - H) / 2;
  const sd = d / Math.SQRT2; // rotated-square side whose diagonal is one cell

  // Stored cells pair with the tessellation in order: diamonds, then triangles.
  const laid = useMemo(() => {
    const geo = tessellate(across, down);
    const diamonds = cells.filter((c) => c.kind === 'diamond');
    const triangles = cells.filter((c) => c.kind === 'triangle');
    const out: { x: number; y: number; cell: BinCell; label: string | null }[] = [];
    geo.full.forEach((g, i) => { if (diamonds[i]) out.push({ x: g.x, y: g.y, cell: diamonds[i], label: labels.diamondLabels[i] ?? null }); });
    geo.clipped.forEach((g, i) => { if (triangles[i]) out.push({ x: g.x, y: g.y, cell: triangles[i], label: labels.triangleLabels[i] ?? null }); });
    return out;
  }, [across, down, cells, labels]);

  function nearestCell(lx: number, ly: number): BinCell | null {
    let best: BinCell | null = null;
    let bestDist = Infinity;
    for (const p of laid) {
      const dist = (p.x * d - lx) ** 2 + (p.y * d - ly) ** 2;
      if (dist < bestDist) { bestDist = dist; best = p.cell; }
    }
    return best;
  }
  const at = (fn: ((cell: BinCell) => void) | undefined) => fn
    ? (e: { nativeEvent: { locationX: number; locationY: number } }) => {
        const c = nearestCell(e.nativeEvent.locationX, e.nativeEvent.locationY);
        if (c) fn(c);
      }
    : undefined;
  const dimmed = (cellId: string) => highlighted.size > 0 && !highlighted.has(cellId);

  return (
    <>
      <View style={styles.canvasWrap}>
        <View style={styles.canvas} onLayout={(e) => setVpw(e.nativeEvent.layout.width)}>
          {W > 0 && H > 0 ? (
            <>
              <Pressable
                style={[styles.frame, { left: originLeft, top: originTop, width: W, height: H }]}
                onPress={at(onPressCell)}
                onLongPress={at(onLongPressCell)}
                delayLongPress={400}
              >
                {laid.map((p) => {
                  const hot = highlighted.has(p.cell.id);
                  return (
                    <View
                      key={p.cell.id}
                      pointerEvents="none"
                      style={{ position: 'absolute', left: p.x * d - sd / 2, top: p.y * d - sd / 2, width: sd, height: sd, opacity: dimmed(p.cell.id) ? 0.3 : 1, transform: [{ rotate: '45deg' }], borderWidth: hot ? 2.5 : 1.25, borderColor: hot ? '#fff2cc' : colors.gold, backgroundColor: hot ? colors.gold : fillColor(p.cell) }}
                    />
                  );
                })}
              </Pressable>
              {/* Grid references sit in an unclipped overlay so the ones on the
                  edge half-diamonds stay legible, nudged towards the inside. */}
              <View pointerEvents="none" style={{ position: 'absolute', left: originLeft, top: originTop, width: W, height: H }}>
                {laid.map((p) => {
                  if (!p.label) return null;
                  const EDGE = 1e-6;
                  const nx = p.x <= EDGE ? 1 : p.x >= across - EDGE ? -1 : 0;
                  const ny = p.y <= EDGE ? 1 : p.y >= down - EDGE ? -1 : 0;
                  const nudge = d * 0.28;
                  return (
                    <Text
                      key={`lbl-${p.cell.id}`}
                      style={[styles.label, { left: p.x * d - 20 + nx * nudge, top: p.y * d - 7 + ny * nudge, opacity: dimmed(p.cell.id) ? 0.3 : 1 }]}
                      allowFontScaling={false}
                    >
                      {p.label}
                    </Text>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.surfaceElevated }]} /><Text style={styles.legendText} allowFontScaling={false}>Empty</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.gold + '66' }]} /><Text style={styles.legendText} allowFontScaling={false}>Part full</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colors.gold }]} /><Text style={styles.legendText} allowFontScaling={false}>Full</Text></View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  canvasWrap: { paddingHorizontal: spacing.xl },
  canvas: { height: CANVAS_H, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  frame: { position: 'absolute', overflow: 'hidden', borderWidth: 2, borderColor: colors.gold, borderRadius: 3, backgroundColor: colors.surface },
  label: { position: 'absolute', width: 40, textAlign: 'center', fontSize: 10, fontFamily: fonts.bodySemibold, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2.5 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 3, borderWidth: 1, borderColor: colors.gold, transform: [{ rotate: '45deg' }] },
  legendText: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
});
