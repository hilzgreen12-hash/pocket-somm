import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { PricingData } from '../../types/wine';

interface Props {
  pricing: PricingData;
  menuPrice: number | null;
}

export function PricingBadge({ pricing, menuPrice }: Props) {
  if (pricing.source === 'unavailable') return null;

  const marketAvg = pricing.averageMarketPrice;
  const isGoodValue =
    menuPrice !== null && marketAvg !== null && menuPrice <= marketAvg * 1.5;
  const isPoorValue =
    menuPrice !== null && marketAvg !== null && menuPrice > marketAvg * 2.5;

  const valueLabel = isPoorValue
    ? 'Poor value vs market'
    : isGoodValue
    ? 'Good value vs market'
    : 'Fair value vs market';

  const valueLabelColor = isPoorValue
    ? colors.error
    : isGoodValue
    ? colors.success
    : colors.textMuted;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.marketLabel}>Market avg</Text>
        <Text style={styles.marketPrice}>
          {marketAvg !== null ? `£${marketAvg.toFixed(0)}` : '—'}
        </Text>
        {pricing.criticScore !== null && (
          <Text style={styles.score}>{pricing.criticScore} pts</Text>
        )}
      </View>
      {menuPrice !== null && marketAvg !== null && (
        <Text style={[styles.valueLabel, { color: valueLabelColor }]}>{valueLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  marketLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  marketPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  score: {
    fontSize: 13,
    color: colors.gold,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
