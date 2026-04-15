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
  const color = STATUS_COLORS[dw.status] ?? colors.textMuted;
  const range = dw.from && dw.to ? `${dw.from}–${dw.to}` : dw.from ? `from ${dw.from}` : null;

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: color + '25', borderColor: color + '60' }]}>
        <Text style={[styles.label, { color }]}>Drinking Window · {dw.status}</Text>
        {range && <Text style={[styles.range, { color }]}>{range}</Text>}
      </View>
      <Text style={styles.notes}>{dw.notes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: 0.2,
  },
  range: {
    fontSize: 13,
    fontFamily: 'CormorantGaramond_700Bold',
  },
  notes: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    lineHeight: 19,
  },
});
