import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../src/api/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
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
  // Live GPS-derived city. The autoSave mutation also reads location at
  // save time and persists it on the row, but that doesn't land until the
  // server round-trip completes. Surfacing the city in the stamp on mount
  // gives the user immediate feedback that Vinster knows where they are.
  const [liveCity, setLiveCity] = useState<string | null>(null);
  const [editingCity, setEditingCity] = useState(false);
  const qc = useQueryClient();

  // Pre-fill restaurant name from GPS once the search has been saved
  useEffect(() => {
    const detected = autoSave.data?.[0]?.restaurantName;
    if (detected && !restaurantName) setRestaurantName(detected);
  }, [autoSave.data]);

  // Fetch a fresh GPS reading on mount so the stamp can show the user's
  // city in real time, before the server-side autoSave round-trip lands.
  // Requests permission if it hasn't been asked yet — the previous
  // `getForegroundPermissionsAsync` only read existing state, so on a
  // fresh install the prompt never fired and the stamp stayed blank.
  useEffect(() => {
    if (isFromHistory) return;
    let cancelled = false;
    (async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const req = await Location.requestForegroundPermissionsAsync();
          status = req.status;
        }
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        const city = geo?.city ?? geo?.subregion ?? geo?.region ?? null;
        if (city && !cancelled) setLiveCity(city);
      } catch { /* location unavailable — stamp falls back to whatever's on the saved row */ }
    })();
    return () => { cancelled = true; };
  }, [isFromHistory]);

  // Cache fresh scans to local AsyncStorage on render so View Last Result
  // works in-session even when the network save is still in flight or has
  // failed. Only fires once per render of a fresh scan (skips history
  // loads).
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
          showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
        },
      },
    );
  }

  // Auto-fire on mount removed by request — the user wants the explicit
  // "Save to Archive" button to be visible until they tap it, rather than
  // arriving on a screen that already says "Saved" without any user
  // action.

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
  // Prefer the persisted city (server-confirmed), falling back to the
  // live GPS reading taken on mount.
  const stampCity = historyCity ?? autoSave.data?.[0]?.city ?? liveCity;
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

      {/* Cross-link to Your Restaurants. Only surfaces once the scan has
          actually been saved — otherwise no row exists in scan_sessions
          and the destination screen would show an empty list. */}
      {!isFromHistory && restaurantName.trim().length > 0 && (isSaved || isFromHistory) && (
        <TouchableOpacity
          style={styles.reviewRestaurantLink}
          onPress={() => {
            qc.invalidateQueries({ queryKey: ['scan-archive'] });
            router.push('/restaurants/reviews');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.reviewRestaurantLinkText}>Review restaurant in your profile →</Text>
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

      {(isSaved || isFromHistory) ? (
        <View style={styles.savedBlock}>
          <Text style={styles.savedLabel}>Saved</Text>
          <TouchableOpacity
            onPress={() => {
              // Force the archive query to refetch so a just-saved scan
              // shows up on the destination screen — without this, react-
              // query's cache can briefly return the pre-save snapshot.
              qc.invalidateQueries({ queryKey: ['scan-archive'] });
              router.push('/scan/history');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewProfileLink}>View in List Archive</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveToArchive}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving…' : 'Save to Archive'}
          </Text>
        </TouchableOpacity>
      )}

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
        scanSessionId={isFromHistory ? (sessionId ?? null) : (autoSave.data?.[0]?.sessionId ?? null)}
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
    color: '#FFFFFF',
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
  reviewRestaurantLink: { alignSelf: 'center', marginTop: 2, marginBottom: spacing.sm, paddingVertical: 4, paddingHorizontal: spacing.sm },
  reviewRestaurantLinkText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  locationText: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
  savedBlock: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: 4,
  },
  savedLabel: {
    color: colors.gold,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  viewProfileLink: {
    color: colors.gold,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 14,
    textDecorationLine: 'underline',
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
