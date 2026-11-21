import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LabelThumb } from '../LabelThumb';
import { WineIdentityHeader } from '../WineIdentityHeader';
import { bottleSizeCl } from '../BottleSizePicker';
import type { LocationWineRow } from '../../api/placements';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// One wine in an alt cellar: its label, name and how many bottles of it are in
// this placement. Inside a case (grouped view) it sits within the case's box,
// the last row closing it. Memoised so a long imported list only re-renders
// the rows that changed.
export const AltCellarWineRow = memo(function AltCellarWineRow({ row, inCase, onPress, onLongPress }: {
  row: LocationWineRow;
  inCase?: { last: boolean };
  onPress: (row: LocationWineRow) => void;
  onLongPress: (row: LocationWineRow) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, inCase && styles.inCase, inCase?.last && styles.lastInCase]}
      onPress={() => onPress(row)}
      onLongPress={() => onLongPress(row)}
      delayLongPress={400}
      activeOpacity={0.7}
    >
      <LabelThumb path={row.label_image_path} fallbackText={row.wine_name} size="thumb" style={styles.thumb} />
      <View style={styles.main}>
        <WineIdentityHeader
          producer={row.producer}
          wineName={row.wine_name}
          vintage={row.vintage}
          region={row.region}
          grape={row.grape_variety}
          size="sm"
          align="left"
        />
        <Text style={styles.meta}>{row.quantity ?? 0} x {bottleSizeCl(row.bottle_size_ml ?? 750)}cl</Text>
      </View>
    </TouchableOpacity>
  );
});

const CASE_BORDER = 'rgba(224,184,74,0.30)';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.xl, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  inCase: { paddingHorizontal: spacing.sm, borderLeftWidth: 1, borderRightWidth: 1, borderLeftColor: CASE_BORDER, borderRightColor: CASE_BORDER },
  lastInCase: { borderBottomColor: CASE_BORDER, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: spacing.md },
  thumb: { width: 34, height: 44 },
  main: { flex: 1 },
  meta: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, flexShrink: 1, marginTop: 2 },
});

// A case's header in the grouped view: opens the box its wines sit in.
export const altCellarCaseStyles = StyleSheet.create({
  header: { marginHorizontal: spacing.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: 'rgba(224,184,74,0.10)', borderWidth: 1, borderBottomWidth: 0, borderColor: CASE_BORDER, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  name: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, flexShrink: 1 },
  note: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, marginTop: 3 },
});
