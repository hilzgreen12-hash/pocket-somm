import { View, Text, StyleSheet } from 'react-native';
import { DrinkingWindowBadge } from './DrinkingWindowBadge';
import { PricingBadge } from './PricingBadge';
import { RarityBadge } from './RarityBadge';
import { RationaleBlock } from './RationaleBlock';
import { VintageBadge } from './VintageBadge';
import { colors, spacing, typography } from '../../constants/theme';
import type { WineRecommendation, PricingData } from '../../types/wine';

interface Props {
  wine: WineRecommendation;
  rank: number;
  pricing?: PricingData;
}

const RANK_LABELS = ['Top Pick', 'Second Choice', 'Third Choice'];

export function WineRecommendationCard({ wine, rank, pricing }: Props) {
  const isTop = rank === 1;

  return (
    <View style={[styles.card, isTop && styles.cardTop]}>

      {/* Rank label */}
      <View style={styles.rankRow}>
        <Text style={[styles.rankLabel, isTop && styles.rankLabelTop]}>
          {RANK_LABELS[rank - 1] ?? `#${rank}`}
        </Text>
        {wine.criticScore > 0 && (
          <View style={styles.scoreChip}>
            <Text style={styles.scoreText}>{wine.criticScore}</Text>
            <Text style={styles.scoreUnit}> pts</Text>
          </View>
        )}
      </View>

      {/* Name + vintage + price */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{wine.name}</Text>
          {wine.vintage && (
            <Text style={styles.vintage}>{wine.vintage}</Text>
          )}
        </View>
        {wine.menuPrice != null && (
          <Text style={styles.menuPrice}>£{wine.menuPrice}</Text>
        )}
      </View>

      {/* Producer · region · appellation */}
      <Text style={styles.producer}>
        {wine.producer}
        {wine.region ? ` · ${wine.region}` : ''}
        {wine.appellation ? ` · ${wine.appellation}` : ''}
      </Text>

      {wine.grape && (
        <Text style={styles.grape}>{wine.grape}</Text>
      )}

      <View style={styles.divider} />

      <VintageBadge assessment={wine.vintageAssessment} />
      <DrinkingWindowBadge window={wine.drinkingWindow} />
      <RarityBadge rarity={wine.rarityAssessment} />

      <RationaleBlock text={wine.rationale} />

      {pricing && <PricingBadge pricing={pricing} menuPrice={wine.menuPrice} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rankLabel: {
    fontSize: 11,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  rankLabelTop: {
    color: colors.gold,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  scoreText: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.gold,
  },
  scoreUnit: {
    fontSize: 11,
    color: colors.goldDim,
    fontFamily: 'CormorantGaramond_600SemiBold',
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
    paddingRight: spacing.sm,
  },
  name: {
    fontSize: 19,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    letterSpacing: -0.3,
  },
  vintage: {
    fontSize: 15,
    color: colors.gold,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  menuPrice: {
    fontSize: 19,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
  },
  producer: {
    fontSize: 13,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  grape: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
