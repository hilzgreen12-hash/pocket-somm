import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LabelThumb } from '../LabelThumb';
import { WineIdentityHeader } from '../WineIdentityHeader';
import { bottleSizeCl } from '../BottleSizePicker';
import { formatCurrency } from '../../constants/currency';
import { PER_75CL } from '../../utils/bottleValue';
import { visibleReviewScore } from '../../utils/cellarReview';
import { colors, spacing } from '../../constants/theme';
import { fontsSpectral as fonts } from '../../constants/fonts';
import type { CellarWine } from '../../types/wine';

interface Props {
  wine: CellarWine;
  bottles: number;              // the bottles this line stands for (see CellarListRowData)
  showYourScore: boolean;       // sorting by Your Score: show the user's score, not the critic's
  showArchivedDate: boolean;
  selectMode: boolean;
  selected: boolean;
  onPress: (wine: CellarWine) => void;
  onLongPress: (wine: CellarWine) => void;
}

// One line of Your Cellar List / Your Cellar Archive. Memoised: the list can
// hold thousands of lines, so a line only re-renders when its own props change.
export const CellarListRow = memo(function CellarListRow({
  wine: w, bottles, showYourScore, showArchivedDate, selectMode, selected, onPress, onLongPress,
}: Props) {
  const valueText = w.estimated_value != null
    ? `${formatCurrency(Number(w.estimated_value), w.estimated_value_currency, { decimals: 0 })}${PER_75CL}`
    : null;
  const score = showYourScore ? visibleReviewScore(w) : w.critic_score;
  return (
    <TouchableOpacity
      style={[styles.row, selected && styles.rowSelected]}
      onPress={() => onPress(w)}
      onLongPress={() => onLongPress(w)}
      delayLongPress={350}
      activeOpacity={0.7}
      accessibilityState={selectMode ? { selected } : undefined}
    >
      {selectMode && (
        <View style={[styles.tick, selected && styles.tickOn]}>
          {selected && <Text style={styles.tickMark}>✓</Text>}
        </View>
      )}
      <LabelThumb path={w.label_image_path} fallbackText={w.wine_name} size="thumb" style={styles.thumb} />
      <View style={styles.main}>
        <WineIdentityHeader
          producer={w.producer}
          wineName={w.wine_name}
          vintage={w.vintage}
          region={w.region}
          grape={w.grape_variety}
          size="sm"
          align="left"
        />
        {showArchivedDate && w.archived_at ? (
          <Text style={styles.archivedDate}>Archived {new Date(w.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {score != null && <Text style={showYourScore ? styles.scoreYours : styles.score}>{score} pts</Text>}
        {valueText && <Text style={styles.value}>{valueText}</Text>}
        <Text style={styles.qty}>{bottles}x{bottleSizeCl(w.bottle_size_ml ?? 750)}</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowSelected: { backgroundColor: 'rgba(212,176,96,0.18)' },
  tick: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  tickOn: { backgroundColor: colors.gold },
  tickMark: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.background },
  thumb: { width: 38, height: 48, marginRight: spacing.md },
  main: { flex: 1, marginRight: spacing.md },
  archivedDate: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 3, letterSpacing: 0.2 },
  right: { alignItems: 'flex-end', gap: 2 },
  score: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.gold },
  scoreYours: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.text },
  value: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.text },
  qty: { fontSize: 11, fontFamily: fonts.bodyRegular, color: colors.textMuted },
});
