import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../src/api/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useScanStore } from '../../src/stores/scanStore';
import { useScanHistory, cacheScanLocally } from '../../src/hooks/useScanHistory';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { recommendWines } from '../../src/services/recommender';
import { SearchProgress } from '../../src/components/SearchProgress';
import { VintageWindowBadge } from '../../src/components/results/VintageWindowBadge';
import { RarityBadge } from '../../src/components/results/RarityBadge';
import { RationaleBlock } from '../../src/components/results/RationaleBlock';
import { ChosenWineModal } from '../../src/components/ChosenWineModal';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { colors, spacing } from '../../src/constants/theme';
import type { WineRecommendation } from '../../src/types/wine';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const RANK_LABELS = ['Top Pick', 'Second Choice', 'Third Choice'];

export default function ResultsScreen() {
  const { fromHistory, sessionId, restaurant: historyRestaurant, city: historyCity, date: historyDate } = useLocalSearchParams<{ fromHistory?: string; sessionId?: string; restaurant?: string; city?: string; date?: string }>();
  const isFromHistory = fromHistory === 'true';
  const { recommendation, extractedWines, preferences, setRecommendation, reset } = useScanStore();
  const { autoSave } = useScanHistory();
  const { session } = useAuth();
  const { preferences: userPrefs } = usePreferences();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasSaved = useRef(false);
  const [chosenModalWine, setChosenModalWine] = useState<WineRecommendation | null>(null);
  const [chosenIndexes, setChosenIndexes] = useState<Set<number>>(new Set());
  const [restaurantReviewVisible, setRestaurantReviewVisible] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [renderedAt] = useState(() => new Date().toISOString());
  const qc = useQueryClient();

  // Pre-fill restaurant name from GPS once the search has been saved
  useEffect(() => {
    const detected = autoSave.data?.[0]?.restaurantName;
    if (detected && !restaurantName) setRestaurantName(detected);
  }, [autoSave.data]);

  // Cache fresh scans to local AsyncStorage on render so View Last Result
  // works in-session even when the user hasn't tapped Save to Archive.
  // Only fires once per render of a fresh scan (skips history loads).
  useEffect(() => {
    if (isFromHistory) return;
    if (!recommendation || !extractedWines) return;
    cacheScanLocally({ extractedWines, recommendation, restaurantName: restaurantName || null });
  }, []);

  async function handleSaveRestaurant() {
    setEditingRestaurant(false);
    const sid = autoSave.data?.[0]?.sessionId;
    if (!sid) return;
    await supabase.from('scan_sessions').update({ restaurant_name: restaurantName.trim() || null }).eq('id', sid);
    qc.invalidateQueries({ queryKey: ['scan-archive'] });
  }

  function handleSaveToArchive() {
    if (!recommendation || !extractedWines || hasSaved.current) return;
    hasSaved.current = true;
    autoSave.mutate(
      { extractedWines, recommendation, restaurantNameOverride: restaurantName },
      {
        onError: (err) => {
          hasSaved.current = false;
          Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.');
        },
      },
    );
  }

  const isSaved = !!autoSave.data;
  const isSaving = autoSave.isPending;

  async function handleAlternativeList() {
    if (!extractedWines || !recommendation) return;
    setIsGenerating(true);
    try {
      const excludeWines = recommendation.wines.map((w) => w.name);
      const newRec = await recommendWines({
        wines: extractedWines.slice(0, 80),
        ...preferences,
        excludeWines,
        currency: userPrefs?.defaultCurrency ?? 'GBP',
      });
      setRecommendation(newRec);
      setOpenIndex(0);
    } catch (err) {
      // silently fail — existing results remain
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    if (!recommendation) {
      router.replace('/(tabs)/scan');
    }
  }, [recommendation]);

  if (!recommendation) return null;

  if (isGenerating) {
    return (
      <SearchProgress
        title="Finding your alternative picks…"
        subtitle="Vinster needs up to 20 seconds"
        body="Scoring a fresh selection by critic rating, vintage quality and value"
        durationMs={20000}
      />
    );
  }

  const noVintages = recommendation.wines.every((w) => !w.vintage);

  // Build a date + location stamp shown at the top of the page. For fresh
  // scans the date defaults to the moment results rendered; once saved it's
  // refreshed from the saved row. History loads pull from the URL param.
  const stampDateSource = historyDate ?? autoSave.data?.[0]?.savedAt ?? renderedAt;
  const stampDate = stampDateSource
    ? new Date(stampDateSource).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const stampRestaurant = historyRestaurant ?? autoSave.data?.[0]?.restaurantName ?? restaurantName ?? null;
  const stampCity = historyCity ?? autoSave.data?.[0]?.city ?? null;
  const stampLocation = [stampRestaurant, stampCity].filter(Boolean).join(' · ');

  function toggleWine(i: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (isFromHistory) {
              router.back();
            } else {
              // Skip the camera/preview/extracting stack on the way back —
              // jump straight to the List tab.
              reset();
              router.replace('/(tabs)/scan');
            }
          }}
          style={styles.backRow}
        >
          <Text style={styles.backLink}>Back</Text>
        </TouchableOpacity>
        {(stampDate || stampLocation) && (
          <View style={styles.stampRow}>
            {stampDate ? <Text style={styles.stampDate}>{stampDate}</Text> : null}
            {stampLocation ? <Text style={styles.stampLocation}>{stampLocation}</Text> : null}
          </View>
        )}
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

      {/* Dining location — editable on fresh scans */}
      {!isFromHistory && (
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => setEditingRestaurant(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.locationPin}>📍</Text>
          {editingRestaurant ? (
            <TextInput
              style={styles.locationInput}
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Restaurant name"
              placeholderTextColor="rgba(255,255,255,0.30)"
              autoFocus
              onBlur={handleSaveRestaurant}
              onSubmitEditing={handleSaveRestaurant}
              returnKeyType="done"
            />
          ) : (
            <Text style={styles.locationText}>
              {restaurantName || 'Add restaurant name'}
            </Text>
          )}
        </TouchableOpacity>
      )}

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
                    {wine.vintage ? `${wine.vintage} ` : ''}{wine.name}{wine.appellation ? `, ${wine.appellation}` : ''}
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
                    {chosenIndexes.has(i) ? '✓ Added to Your Wine Reviews' : 'Review This Wine'}
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

      {isFromHistory && sessionId && (
        <TouchableOpacity
          style={styles.restaurantButton}
          onPress={() => setRestaurantReviewVisible(true)}
        >
          <Text style={styles.restaurantButtonText}>Review this Restaurant</Text>
        </TouchableOpacity>
      )}

      {/* Save to Archive is always available — fresh scans show the call-to-
          action; history loads default to "Saved ✓" so the user has a clear
          confirmation that the result is in their archive. */}
      <TouchableOpacity
        style={[styles.saveButton, (isSaved || isSaving || isFromHistory) && styles.saveButtonDone]}
        onPress={handleSaveToArchive}
        disabled={isSaved || isSaving || isFromHistory}
        activeOpacity={0.8}
      >
        <Text style={[styles.saveButtonText, (isSaved || isSaving || isFromHistory) && styles.saveButtonTextDone]}>
          {(isSaved || isFromHistory) ? 'Saved ✓' : isSaving ? 'Saving…' : 'Save to Archive'}
        </Text>
      </TouchableOpacity>

      {!isFromHistory && (
        <TouchableOpacity
          style={styles.alternativeButton}
          onPress={handleAlternativeList}
        >
          <Text style={styles.alternativeText}>Generate An Alternative List</Text>
        </TouchableOpacity>
      )}

      <ChosenWineModal
        wine={chosenModalWine}
        visible={chosenModalWine !== null}
        initialRestaurantName={isFromHistory ? (historyRestaurant ?? null) : (restaurantName || null)}
        initialCity={isFromHistory ? (historyCity ?? null) : (autoSave.data?.[0]?.city ?? null)}
        showReturnToArchive={isFromHistory}
        onClose={() => setChosenModalWine(null)}
        onSaved={() => {
          const idx = recommendation!.wines.indexOf(chosenModalWine!);
          if (idx !== -1) setChosenIndexes((prev) => new Set([...prev, idx]));
          setChosenModalWine(null);
        }}
      />

      {sessionId && (
        <RestaurantReviewModal
          visible={restaurantReviewVisible}
          sessionId={sessionId}
          onClose={() => setRestaurantReviewVisible(false)}
          onSaved={() => setRestaurantReviewVisible(false)}
        />
      )}

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
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  backLink: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
  },
  stampRow: {
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 2,
  },
  stampDate: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 13,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stampLocation: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 6,
  },
  locationPin: {
    fontSize: 14,
  },
  locationText: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
  },
  locationInput: {
    flex: 1,
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 15,
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.30)',
    paddingVertical: 2,
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
  restaurantButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
  },
  restaurantButtonText: {
    color: colors.text,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
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
    borderColor: colors.gold,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveButtonDone: {
    backgroundColor: 'rgba(212,176,96,0.10)',
  },
  saveButtonText: {
    color: colors.gold,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
  },
  saveButtonTextDone: {
    color: colors.gold,
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
