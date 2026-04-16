import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useScanStore } from '../../src/stores/scanStore';
import { VintageBadge } from '../../src/components/results/VintageBadge';
import { DrinkingWindowBadge } from '../../src/components/results/DrinkingWindowBadge';
import { RarityBadge } from '../../src/components/results/RarityBadge';
import { RationaleBlock } from '../../src/components/results/RationaleBlock';
import { colors, spacing } from '../../src/constants/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const RANK_LABELS = ['Top Pick', 'Second Choice', 'Third Choice'];

export default function ResultsScreen() {
  const { recommendation, reset } = useScanStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!recommendation) {
    router.replace('/(tabs)/scan');
    return null;
  }

  const noVintages = recommendation.wines.every((w) => !w.vintage);

  function toggleWine(i: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Pocket Somm{'\n'}Recommends</Text>
        {noVintages && (
          <Text style={styles.vintageNote}>Note: there are no vintages provided on this list</Text>
        )}
        {recommendation.summary ? (
          <Text style={styles.summary}>{recommendation.summary}</Text>
        ) : null}
      </View>

      {/* Wine accordions */}
      <View style={styles.list}>
        {recommendation.wines.map((wine, i) => {
          const isOpen = openIndex === i;
          const isTop = i === 0;
          return (
            <View key={wine.name + i} style={[styles.card, isTop && styles.cardTop]}>

              {/* Collapsed row — always visible */}
              <TouchableOpacity
                style={styles.row}
                onPress={() => toggleWine(i)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.rankRow}>
                    <Text style={[styles.rankLabel, isTop && styles.rankLabelTop]}>
                      {RANK_LABELS[i] ?? `#${i + 1}`}
                    </Text>
                    {wine.criticScore > 0 && (
                      <View style={styles.scoreChip}>
                        <Text style={styles.scoreText}>{wine.criticScore}</Text>
                        <Text style={styles.scoreUnit}> pts</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.wineName}>
                    {wine.name}{wine.appellation ? `, ${wine.appellation}` : ''}
                  </Text>
                  <Text style={styles.wineProducer}>
                    {wine.producer}{wine.region ? ` · ${wine.region}` : ''}{wine.grape ? ` · ${wine.grape}` : ''}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  {wine.menuPrice != null && (
                    <Text style={styles.price}>£{wine.menuPrice}</Text>
                  )}
                  <Ionicons
                    name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={16}
                    color={colors.text}
                  />
                </View>
              </TouchableOpacity>

              {/* Expanded details */}
              {isOpen && (
                <View style={styles.details}>

                  {wine.outsidePreferences && (
                    <View style={styles.outsideNotice}>
                      <Text style={styles.outsideText}>
                        ⚠ This is outside your preferences, but it's worth your consideration — {wine.outsidePreferences}
                      </Text>
                    </View>
                  )}

                  <View style={styles.divider} />

                  {!noVintages && <VintageBadge assessment={wine.vintageAssessment} />}
                  {!noVintages && <DrinkingWindowBadge window={wine.drinkingWindow} />}
                  <RarityBadge rarity={wine.rarityAssessment} />
                  <RationaleBlock text={wine.rationale} />
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Text style={styles.scoreNote}>
        Scores are Pocket Somm's estimates based on critical consensus from its training data.
      </Text>

      <TouchableOpacity
        style={styles.newScanButton}
        onPress={() => { reset(); router.replace('/(tabs)/scan'); }}
      >
        <Text style={styles.newScanText}>Start Another Search</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 96,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 42,
    color: colors.text,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  vintageNote: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  summary: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 24,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardTop: {
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  rowLeft: {
    flex: 1,
    paddingRight: spacing.sm,
    alignItems: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: 3,
  },
  rankLabel: {
    fontSize: 19,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  rankLabelTop: {
    color: colors.text,
  },
  wineName: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 2,
    textAlign: 'center',
  },
  wineProducer: {
    fontSize: 13,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.text,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  price: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreText: {
    fontSize: 19,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
  },
  scoreUnit: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  details: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  grape: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  outsideNotice: {
    backgroundColor: 'rgba(180,140,60,0.12)',
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  outsideText: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 13,
    color: colors.gold,
    lineHeight: 19,
  },
  scoreNote: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    fontSize: 16,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: 'rgba(255,255,255,0.70)',
    textAlign: 'center',
    lineHeight: 24,
  },
  newScanButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  newScanText: {
    color: colors.textMuted,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
