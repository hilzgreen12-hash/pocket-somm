import { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LabelThumb } from '../LabelThumb';
import { slotKey } from '../../utils/rackSlots';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import type { CellarWine, RackSlot as RackSlotRow, WineRack } from '../../types/wine';

export const GRID_GAP = 4;
// The cream viewport's side margin + padding (spacing.md each side, twice).
export const GRID_INSET = spacing.md * 4;
// Smallest slot that is still comfortable to tap; a wider rack scrolls sideways.
const MIN_SLOT = 16;

type GridRow = { rowIndex: number; cols: number; slotWidth: number };

// Slot sizes for a rack on a screen this wide. Standard slots share the width
// (never below MIN_SLOT); the optional large-format band (row -1) sits on top
// and spans the same total width, so fewer slots means each is wider.
export function rackLayout(rack: Pick<WineRack, 'rows' | 'cols' | 'large_format_cols'>, screenWidth: number) {
  const cols = Math.max(1, rack.cols);
  const slotSize = Math.max(MIN_SLOT, Math.floor((screenWidth - GRID_INSET - GRID_GAP * (cols - 1)) / cols));
  const gridWidth = cols * slotSize + (cols - 1) * GRID_GAP;
  const lfCols = rack.large_format_cols ?? 0;
  const rows: GridRow[] = [];
  if (lfCols > 0) rows.push({ rowIndex: -1, cols: lfCols, slotWidth: Math.floor((gridWidth - GRID_GAP * (lfCols - 1)) / lfCols) });
  for (let r = 0; r < rack.rows; r++) rows.push({ rowIndex: r, cols, slotWidth: slotSize });
  return { rows, gridWidth, overflows: gridWidth > screenWidth - GRID_INSET };
}

interface GridProps {
  rows: GridRow[];
  slotMap: Record<string, RackSlotRow>;
  optimisticSlots: Record<string, CellarWine>;
  highlightedIds: ReadonlySet<string>;
  movingKey: string | null;
  selected: ReadonlySet<string>;
  onPress: (row: number, col: number) => void;
  onLongPress: (row: number, col: number) => void;
}

// The rack's rows of slots — rendered inline and in the full-screen zoom.
export function RackGrid({ rows, slotMap, optimisticSlots, highlightedIds, movingKey, selected, onPress, onLongPress }: GridProps) {
  return (
    <>
      {rows.map((r) => (
        <View key={r.rowIndex} style={[styles.row, r.rowIndex === -1 && styles.largeFormatRow]}>
          {Array.from({ length: r.cols }, (_, col) => {
            const key = slotKey(r.rowIndex, col);
            const slot = slotMap[key];
            const real = slot?.cellar_wine_id ? (slot.wine ?? null) : null;
            const wine = real ?? optimisticSlots[key] ?? null;
            return (
              <RackSlot
                key={col}
                row={r.rowIndex}
                col={col}
                size={r.slotWidth}
                wineId={wine?.id ?? null}
                labelPath={wine?.label_image_path ?? null}
                wineName={wine?.wine_name ?? null}
                placing={!real && !!wine}
                highlighted={!!wine && highlightedIds.has(wine.id)}
                dimmed={highlightedIds.size > 0 && !!wine && !highlightedIds.has(wine.id)}
                movingSource={movingKey === key}
                selected={selected.has(key)}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      ))}
    </>
  );
}

interface SlotProps {
  row: number;
  col: number;
  size: number;
  wineId: string | null;
  labelPath: string | null;
  wineName: string | null;
  // An optimistic fill: shown at once with a swirl until the real slot lands.
  placing: boolean;
  highlighted: boolean;
  dimmed: boolean;
  movingSource: boolean;
  selected: boolean;
  onPress: (row: number, col: number) => void;
  onLongPress: (row: number, col: number) => void;
}

// One slot. Memoised on plain values so a tap re-renders only the slots whose
// contents changed, not the whole grid (racks run to 900 slots).
const RackSlot = memo(function RackSlot({ row, col, size, wineId, labelPath, wineName, placing, highlighted, dimmed, movingSource, selected, onPress, onLongPress }: SlotProps) {
  const filled = !!wineId;
  return (
    <TouchableOpacity
      style={[
        styles.slot,
        { width: size, height: size },
        filled ? styles.filled : styles.empty,
        highlighted && styles.highlighted,
        dimmed && styles.dimmed,
        movingSource && styles.movingSource,
        selected && styles.selected,
      ]}
      onPress={() => onPress(row, col)}
      onLongPress={() => onLongPress(row, col)}
      delayLongPress={300}
      activeOpacity={0.8}
    >
      {filled ? (
        <>
          <LabelThumb
            path={labelPath}
            fallbackText={wineName}
            style={styles.thumb}
            radius={2}
            frame={2}
            fallbackFontSize={Math.max(7, Math.min(12, Math.round(size / 7)))}
          />
          {placing && (
            <View style={styles.placingOverlay} pointerEvents="none">
              <ActivityIndicator size="small" color={colors.gold} />
            </View>
          )}
        </>
      ) : (
        <Text style={[styles.plus, selected && styles.plusSelected]} allowFontScaling={false}>{selected ? '✓' : '+'}</Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: GRID_GAP, marginBottom: GRID_GAP },
  largeFormatRow: { marginBottom: GRID_GAP * 2 },
  slot: { borderRadius: 4, borderWidth: 1, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', padding: 2, overflow: 'hidden' },
  // Filled slot — the framed label thumbnail is the visual, so drop the
  // cell's own border/padding and let the thumb fill it edge to edge.
  filled: { borderWidth: 0, padding: 0, backgroundColor: 'transparent' },
  empty: { borderColor: 'rgba(87,47,43,0.20)', backgroundColor: 'rgba(255,255,255,0.35)' },
  thumb: { width: '100%', height: '100%' },
  placingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 2 },
  // Search highlight — a gold ring around the matched bottle.
  highlighted: { borderWidth: 2, borderColor: colors.gold },
  dimmed: { opacity: 0.25 },
  movingSource: { borderColor: colors.gold, borderWidth: 2, opacity: 0.4 },
  selected: { borderColor: colors.gold, borderWidth: 2, backgroundColor: 'rgba(224,184,74,0.28)' },
  // Inter — slot plus glyph
  plus: { fontSize: 16, color: 'rgba(87,47,43,0.40)', fontFamily: fonts.bodyRegular },
  plusSelected: { color: colors.gold, fontFamily: fonts.headingBold },
});
