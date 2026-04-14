import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { VintageAssessment } from '../../types/wine';

interface Props {
  assessment: VintageAssessment;
}

const LABEL_COLORS: Record<string, string> = {
  Exceptional: '#1B5E20',
  Excellent: '#2E7D32',
  Good: '#388E3C',
  Average: '#F57F17',
  Challenging: '#E65100',
  Poor: '#C62828',
};

export function VintageBadge({ assessment }: Props) {
  const badgeColor = LABEL_COLORS[assessment.label] ?? colors.textMuted;

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: badgeColor + '1A', borderColor: badgeColor }]}>
        <Text style={[styles.label, { color: badgeColor }]}>{assessment.label} vintage</Text>
        <Text style={[styles.score, { color: badgeColor }]}>{assessment.score}/100</Text>
      </View>
      <Text style={styles.notes}>{assessment.notes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  score: {
    fontSize: 13,
    fontWeight: '700',
  },
  notes: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
