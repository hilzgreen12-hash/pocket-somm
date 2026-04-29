import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useScanStore } from '../../src/stores/scanStore';
import { useScanHistory } from '../../src/hooks/useScanHistory';
import { useAuth } from '../../src/hooks/useAuth';
import { recommendWines } from '../../src/services/recommender';
import { VintageWindowBadge } from '../../src/components/results/VintageWindowBadge';
import { RarityBadge } from '../../src/components/results/RarityBadge';
import { RationaleBlock } from '../../src/components/results/RationaleBlock';
import { ChosenWineModal } from '../../src/components/ChosenWineModal';
import { colors, spacing } from '../../src/constants/theme';
import type { WineRecommendation } from '../../src/types/wine';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const RANK_LABELS = ['Top Pick', 'Second Choice', 'Third Choice'];

export default function ResultsScreen() {
  const { recommendation, extractedWines, preferences, setRecommendation, reset } = useScanStore();
  const { autoSave, saveToAccount } = useScanHistory();
  const { session } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedToAccount, setSavedToAccount] = useState(false);
  const hasSaved = useRef(false);
  const [chosenModalWine, setChosenModalWine] = useState<WineRecommendation | null>(null);
  const [chosenIndexes, setChosenIndexes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (recommendation && extractedWines && !hasSaved.current) {
      hasSaved.current = true;
      autoSave.mutate({ extractedWines, recommendation });
    }
  }, []);

  async function handleAlternativeList() {
    if (!extractedWines || !recommendation) return;
    setIsGenerating(true);
    try {
      const excludeWines = recommendation.wines.map((w) => w.name);
      const newRec = await recommendWines({
        wines: extractedWines.slice(0, 25),
        ...preferences,
        excludeWines,
      });
      setRecommendation(newRec);
      setOpenIndex(0);
    } catch (err) {
      // silently fail — existing results remain
    } finally {
      setIsGenerating(false);
    }
  }

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
        <Text style={styles.heading}>Vinster{'\n'}Recommends</Text>
        {recommendation.topScoringMode && (
          <View style={styles.topScoringBanner}>
            <Text style={styles.topScoringBannerTitle}>Top Scoring Mode</Text>
            <Text style={styles.topScoringBannerBody}>
              These are the three highest-rated wines on the list by critic score. Your usual preferences, budget, and style have not been applied. Some wines may not yet be in their ideal drinking window, may represent poor value, or may fall outside your usual tastes — check the details before ordering.
            </Text>
          </View>
        )}
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

              {/* Chosen indicator */}
              {session && (
                <TouchableOpacity
                  style={[styles.chosenButton, chosenIndexes.has(i) && styles.chosenButtonDone]}
                  onPress={() => {
                    if (!chosenIndexes.has(i)) setChosenModalWine(wine);
                  }}
                >
                  <Text style={[styles.chosenButtonText, chosenIndexes.has(i) && styles.chosenButtonTextDone]}>
                    {chosenIndexes.has(i) ? '✓ Added to Your Chosen Wines' : 'I ordered this'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Top pick reasons — always visible on card #1 */}
              {isTop && wine.topPickReasons && wine.topPickReasons.length > 0 && (
                <View style={styles.topPickReasons}>
                  {wine.topPickReasons.map((reason, ri) => (
                    <View key={ri} style={styles.topPickReasonRow}>
                      <Text style={styles.topPickBullet}>◆</Text>
                      <Text style={styles.topPickReasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              )}

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

                  {!noVintages && <VintageWindowBadge assessment={wine.vintageAssessment} window={wine.drinkingWindow} />}
                  <RarityBadge rarity={wine.rarityAssessment} />
                  <RationaleBlock text={wine.rationale} />
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Text style={styles.scoreNote}>
        Scores are Vinster's estimates based on critical consensus from its training data.
      </Text>

      <TouchableOpacity
        style={styles.alternativeButton}
        onPress={handleAlternativeList}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <Text style={styles.alternativeText}>Generate An Alternative List</Text>
        )}
      </TouchableOpacity>

      {session && !savedToAccount && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={async () => {
            const items = autoSave.data;
            if (!items?.[0]) return;
            await saveToAccount.mutateAsync(items[0]);
            setSavedToAccount(true);
          }}
          disabled={saveToAccount.isPending}
        >
          <Text style={styles.saveButtonText}>
            {saveToAccount.isPending ? 'Saving…' : 'Save to My Account'}
          </Text>
        </TouchableOpacity>
      )}
      {savedToAccount && (
        <Text style={styles.savedConfirm}>Saved to your account</Text>
      )}

      <TouchableOpacity
        style={styles.newScanButton}
        onPress={() => { reset(); router.replace('/(tabs)/scan'); }}
      >
        <Text style={styles.newScanText}>Start Another Search</Text>
      </TouchableOpacity>

      <ChosenWineModal
        wine={chosenModalWine}
        visible={chosenModalWine !== null}
        onClose={() => setChosenModalWine(null)}
        onSaved={() => {
          const idx = recommendation!.wines.indexOf(chosenModalWine!);
          if (idx !== -1) setChosenIndexes((prev) => new Set([...prev, idx]));
          setChosenModalWine(null);
        }}
      />

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
  topScoringBanner: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(212,176,96,0.08)',
    width: '100%',
  },
  topScoringBannerTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 14,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: 'center',
  },
  topScoringBannerBody: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 14,
    color: 'rgba(212,176,96,0.80)',
    lineHeight: 20,
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
  chosenButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 2,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    alignItems: 'center',
  },
  chosenButtonDone: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,176,96,0.10)',
  },
  chosenButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.50)',
  },
  chosenButtonTextDone: {
    color: colors.gold,
  },
  topPickReasons: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 6,
  },
  topPickReasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  topPickBullet: {
    fontSize: 8,
    color: colors.gold,
    marginTop: 5,
  },
  topPickReasonText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.gold,
    lineHeight: 20,
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
  alternativeButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  alternativeText: {
    color: colors.text,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
  },
  saveButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
  },
  savedConfirm: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 14,
    color: colors.gold,
    textAlign: 'center',
    marginTop: spacing.md,
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
