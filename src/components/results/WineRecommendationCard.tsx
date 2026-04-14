import { View, Text, StyleSheet } from 'react-native';
import { PricingBadge } from './PricingBadge';
import { RationaleBlock } from './RationaleBlock';
import { VintageBadge } from './VintageBadge';
import { colors, spacing, typography } from '../../constants/theme';
import type { WineRecommendation, PricingData } from '../../types/wine';

interface Props {
  wine: WineRecommendation;
  rank: number;
  pricing?: PricingData;
}

export function WineRecommendationCard({ wine, rank, pricing }: Props) {
  return (
    <View style={[styles.card, rank === 1 && styles.topPick]}>
      {rank === 1 && <Text style={styles.topPickLabel}>Top Pick</Text>}

      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{wine.name}</Text>
          {wine.vintage && <Text style={styles.vintage}>{wine.vintage}</Text>}
        </View>
        {wine.menuPrice && (
          <Text style={styles.menuPrice}>£{wine.menuPrice}</Text>
        )}
      </View>

      <Text style={styles.producer}>
        {wine.producer} · {wine.region}
        {wine.appellation ? ` · ${wine.appellation}` : ''}
      </Text>

      {wine.grape && <Text style={styles.grape}>{wine.grape}</Text>}

      <VintageBadge assessment={wine.vintageAssessment} />

      <RationaleBlock text={wine.rationale} />

      {pricing && <PricingBadge pricing={pricing} menuPrice={wine.menuPrice} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topPick: {
    borderColor: colors.burgundy,
    borderWidth: 2,
  },
  topPickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.burgundy,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  vintage: {
    fontSize: 15,
    color: colors.textMuted,
  },
  menuPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  producer: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  grape: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
});
