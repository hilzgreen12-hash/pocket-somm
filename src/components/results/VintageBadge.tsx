import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { VintageAssessment } from '../../types/wine';

interface Props {
  assessment: VintageAssessment;
}

const LABEL_COLORS: Record<string, string> = {
  Exceptional: '#5CB85C',
  Excellent:   '#4AA84A',
  Good:        '#6BAA72',
  Average:     '#C4823A',
  Challenging: '#C46030',
  Poor:        '#C44040',
};

export function VintageBadge({ assessment }: Props) {
  const scoreText = assessment.score > 0 ? ` · ${assessment.score}/100` : '';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.star}>★</Text>
        <View style={styles.textGroup}>
          <Text style={styles.label}>{assessment.label} Vintage{scoreText}</Text>
          <Text style={styles.notes}>{assessment.notes}</Text>
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
