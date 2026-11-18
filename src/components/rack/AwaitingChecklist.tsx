import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { wineHeaderLine } from '../../utils/wineHeader';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import type { CellarWine } from '../../types/wine';

type Row = { placed: number; total: number; done: boolean; canTakeOut: boolean };

// Bottles sent to this rack without a slot yet (Quick Command, a Lineup, a
// move). Tick a wine, then tap an empty slot to file its next bottle; a row
// ticks when its bottles are all placed. Tapping a finished row offers to take
// those bottles back out. Bottles that won't fit can be left unplaced.
export function AwaitingChecklist({ wines, rowOf, activeId, onSelect, onTakeOut, onLeaveRest }: {
  wines: CellarWine[];
  rowOf: (w: CellarWine) => Row;
  activeId: string | null;
  onSelect: (id: string) => void;
  onTakeOut: (w: CellarWine) => void;
  onLeaveRest: () => void;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.title}>Tick a wine, then tap an empty slot to place it</Text>
      {wines.map((w) => {
        const { placed, total, done, canTakeOut } = rowOf(w);
        const active = activeId === w.id;
        return (
          <TouchableOpacity
            key={w.id}
            style={[styles.row, active && !done && styles.rowActive]}
            onPress={() => (done ? canTakeOut && onTakeOut(w) : onSelect(w.id))}
            activeOpacity={0.7}
          >
            <View style={[styles.check, (done || active) && styles.checkOn]}>
              {done ? <Text style={styles.tick}>✓</Text> : null}
            </View>
            <Text style={styles.wine} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name}</Text>
            <Text style={styles.count}>{placed}/{total}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity onPress={onLeaveRest} style={styles.leave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.leaveText}>Leave the rest unplaced</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { paddingTop: spacing.sm },
  title: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.4 },
  // Checkbox + wine + placed/total. White/unfilled by default; the ticked
  // (active) row brightens with a gold wash.
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.xl, marginTop: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.borderWhite },
  rowActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.14)' },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.borderWhite, alignItems: 'center', justifyContent: 'center' },
  checkOn: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.22)' },
  tick: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold },
  wine: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 15, color: '#FFFFFF' },
  count: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  leave: { alignSelf: 'center', marginTop: spacing.sm },
  leaveText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
});
