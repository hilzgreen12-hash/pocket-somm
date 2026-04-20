import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { RarityAssessment } from '../../types/wine';

interface Props {
  rarity: RarityAssessment;
}

const LABEL_MAP: Record<string, string> = {
  'Very Rare': 'Unicorn Wine',
  'Rare':      'Rare Find',
  'Uncommon':  'Small Production Wine',
};

const LABEL_COLORS: Record<string, string> = {
  'Very Rare': '#C9A84C',
  'Rare':      '#B8934A',
  'Uncommon':  '#9A7A56',
};

export function RarityBadge({ rarity }: Props) {
  if (rarity.label === 'Widely Available') return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.star}>★</Text>
        <View style={styles.textGroup}>
          <Text style={styles.label}>{LABEL_MAP[rarity.label] ?? rarity.label}</Text>
          <Text style={styles.notes}>{rarity.notes}</Text>
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
