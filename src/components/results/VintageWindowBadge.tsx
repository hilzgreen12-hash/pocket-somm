import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { VintageAssessment, DrinkingWindow } from '../../types/wine';

interface Props {
  assessment: VintageAssessment;
  window: DrinkingWindow;
}

const STATUS_LABELS: Record<string, string> = {
  'Too Young':   'Too young to drink',
  'Approaching': 'Approaching peak',
  'Peak':        'Ready to drink',
  'Fading':      'Fading',
  'Past Peak':   'Past peak',
};

export function VintageWindowBadge({ assessment, window: dw }: Props) {
  const statusLabel = STATUS_LABELS[dw.status] ?? dw.status;
  const range = dw.from && dw.to ? ` · ${dw.from}–${dw.to}` : dw.from ? ` · from ${dw.from}` : '';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.star}>★</Text>
        <View style={styles.textGroup}>
          <Text style={styles.label}>
            {statusLabel} · {assessment.label} Vintage{range}
          </Text>
          <Text style={styles.notes}>{assessment.notes}</Text>
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
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    lineHeight: 19,
  },
});
