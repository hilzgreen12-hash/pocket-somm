import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { DrinkingWindow } from '../../types/wine';

interface Props {
  window: DrinkingWindow;
}

const STATUS_COLORS: Record<string, string> = {
  'Too Young':   '#5B8DD9',
  'Approaching': '#5BAAD9',
  'Peak':        '#5CB85C',
  'Fading':      '#C4823A',
  'Past Peak':   '#C44040',
};

export function DrinkingWindowBadge({ window: dw }: Props) {
  const range = dw.from && dw.to ? ` · ${dw.from}–${dw.to}` : dw.from ? ` · from ${dw.from}` : '';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.star}>★</Text>
        <View style={styles.textGroup}>
          <Text style={styles.label}>Drinking Window · {dw.status}{range}</Text>
          <Text style={styles.notes}>{dw.notes}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  star: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: 0.2,
    marginBottom: 2,
    color: colors.text,
  },
  notes: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    lineHeight: 19,
  },
});
