import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { RarityAssessment } from '../../types/wine';

interface Props {
  rarity: RarityAssessment;
}

const LABEL_COLORS: Record<string, string> = {
  'Very Rare': '#C9A84C',
  'Rare':      '#B8934A',
  'Uncommon':  '#9A7A56',
};

export function RarityBadge({ rarity }: Props) {
  if (rarity.label === 'Widely Available') return null;

  const color = LABEL_COLORS[rarity.label] ?? colors.textMuted;

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: color + '25', borderColor: color + '60' }]}>
        <Text style={[styles.label, { color }]}>{rarity.label}</Text>
        <Text style={[styles.score, { color }]}>{rarity.score}/100</Text>
      </View>
      <Text style={styles.notes}>{rarity.notes}</Text>
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
  score: {
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
