import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, LayoutAnimation, Platform, UIManager, Share } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../src/api/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useScanStore } from '../../src/stores/scanStore';
import { useScanHistory, cacheScanLocally } from '../../src/hooks/useScanHistory';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useWishList } from '../../src/hooks/useCellar';
import { recommendWines } from '../../src/services/recommender';
import { SearchProgress } from '../../src/components/SearchProgress';
import { VintageWindowBadge } from '../../src/components/results/VintageWindowBadge';
import { RarityBadge } from '../../src/components/results/RarityBadge';
import { RationaleBlock } from '../../src/components/results/RationaleBlock';
import { ChosenWineModal } from '../../src/components/ChosenWineModal';
import { WineListShareCard } from '../../src/components/WineListShareCard';
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
  // Tracks the in-flight autoSave promise so concurrent callers
  // (onBlur of the input + the Review CTA tap) join the same save
  // rather than racing or skipping the wait. Without this, the CTA
  // could route to Your Restaurants before the scan_sessions row
  // landed, leaving the user staring at an empty list.
  const inFlightSaveRef = useRef<Promise<void> | null>(null);
  const [chosenModalWine, setChosenModalWine] = useState<WineRecommendation | null>(null);
  const [chosenIndexes, setChosenIndexes] = useState<Set<number>>(new Set());
  const [wishlistIndexes, setWishlistIndexes] = useState<Set<number>>(new Set());
  const { addWine: addToWishList } = useWishList();
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
  const shareCardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  // Pre-fill restaurant name from GPS once the search has been saved
  useEffect(() => {
    const detected = autoSave.data?.[0]?.restaurantName;
    if (detected && !restaurantName) setRestaurantName(detected);
  }, [autoSave.data]);

  // Pre-fill restaurant name from the URL params when the user came
  // back to a result via View Last Result. Without this the input
  // shows the empty placeholder even though the saved entry already
  // has a restaurant on it.
  useEffect(() => {
    if (historyRestaurant && !restaurantName) {
      setRestaurantName(historyRestaurant);
    }
  }, [historyRestaurant]);

  // Effective scan_sessions id used by every restaurant-edit path on
  // this screen. Prefers the URL sessionId (set when the user came in
  // via View Last Result or the archive), falling back to whatever
  // autoSave landed in this session.
  const effectiveSessionId = sessionId ?? autoSave.data?.[0]?.sessionId ?? null;

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
    const trimmed = restaurantName.trim();
    if (effectiveSessionId) {
      // Row already in scan_sessions — just update the restaurant name.
      // Covers both the in-session autoSave path and View Last Result
      // re-opens where the sessionId came in via URL params.
      try {
        const { error } = await supabase
          .from('scan_sessions')
          .update({ restaurant_name: trimmed || null })
          .eq('id', effectiveSessionId);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ['scan-archive'] });
      } catch (err) {
        showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
      }
      return;
    }
    // No row yet — promote this scan to scan_sessions so the entry
    // lands in Your Restaurants. Skip if there's no name to save and no
    // recommendation to save against.
    if (trimmed.length === 0 || !recommendation || !extractedWines) return;
    // If an autoSave is already in flight (e.g. the input's onBlur
    // started it and the Review CTA tap then re-enters this function),
    // join the existing promise instead of skipping the wait. The
    // previous "hasSaved" boolean returned immediately on the second
    // caller, so the CTA could route to Your Restaurants before the
    // row was actually inserted.
    if (inFlightSaveRef.current) {
      try { await inFlightSaveRef.current; } catch { /* original caller already alerted */ }
      return;
    }
    const promise = autoSave
      .mutateAsync({ extractedWines, recommendation, restaurantNameOverride: trimmed })
      .then(() => undefined);
    inFlightSaveRef.current = promise;
    try {
      await promise;
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      inFlightSaveRef.current = null;
    }
  }

  // The List Archive is gone — autoSave still fires from
  // handleSaveRestaurant so a scan with a restaurant name lands in
  // Your Restaurants, but there's no longer an explicit save button or
  // post-save confirmation block on this screen.

  const isSaved = !!autoSave.data;

  async function handleAddToWishlist(wine: WineRecommendation, i: number) {
    if (!session || wishlistIndexes.has(i)) return;
    try {
      await addToWishList.mutateAsync({
        user_id: session.user.id,
        wine_name: wine.name,
        producer: wine.producer,
        region: wine.region ?? null,
        vintage: wine.vintage ? String(wine.vintage) : null,
        quantity: 1,
        storage_location: null,
        date_received: new Date().toISOString().split('T')[0],
        critic_score: wine.criticScore ?? null,
        drinking_window_from: wine.drinkingWindow?.from ?? null,
        drinking_window_to: wine.drinkingWindow?.to ?? null,
        drinking_window_status: 'unknown',
        tasting_notes: null,
        grape_variety: wine.grape ?? null,
        label_image_path: null,
        user_notes: null,
        is_wishlist: true,
      });
      setWishlistIndexes((prev) => new Set([...prev, i]));
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

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

  async function handleShare() {
    if (!recommendation || sharing) return;
    setSharing(true);
    try {
      // Capture the off-screen branded card as a PNG and hand it to the
      // native share sheet so users can post to WhatsApp / Instagram /
      // Stories. Falls back to a plain-text share if capture fails or
      // expo-sharing isn't available on this device.
      if (shareCardRef.current) {
        const uri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 1,
          width: 1080,
          height: 1350,
          result: 'tmpfile',
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Vinster recommendations',
            UTI: 'public.png',
          });
          return;
        }
      }
      const lines = recommendation.wines.slice(0, 3).map((w, i) => {
        const rank = RANK_LABELS[i] ?? `#${i + 1}`;
        const vintage = w.vintage ? `${w.vintage} ` : '';
        const score = w.criticScore > 0 ? ` (${w.criticScore} pts)` : '';
        return `${rank}: ${vintage}${w.name}${score}`;
      });
      await Share.share({
        title: 'Vinster Recommends',
        message: `Vinster picked these wines for me:\n\n${lines.join('\n')}\n\nDownload Vinster — your AI sommelier.`,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
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
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backLink}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            disabled={sharing}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.shareBtnText, sharing && { opacity: 0.5 }]}>
              {sharing ? 'Preparing…' : '+ Share'}
            </Text>
          </TouchableOpacity>
        </View>
        {(stampDate || stampLocation) && (
          <View style={styles.stampRow}>
            {stampDate ? <Text style={styles.stampDate}>{stampDate}</Text> : null}
            {stampLocation ? <Text style={styles.stampLocation}>{stampLocation}</Text> : null}
          </View>
        )}
        <Text style={styles.heading}>Vinster Recommends</Text>
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

      {/* Dining card — prominent restaurant entry / review CTA. Shown
          for fresh scans AND when a saved result is reopened via View
          Last Result. Typing a name promotes the scan to scan_sessions
          so the row appears in Your Restaurants. Once the row exists
          the name is locked here — further edits happen in the proper
          restaurant review in Your Restaurants. The CTA below always
          routes there for adding or editing. */}
      <View style={styles.restaurantCard}>
        <Text style={styles.restaurantCardLabel}>Dining at</Text>
        {effectiveSessionId ? (
          // Locked display once a scan_sessions row backs the result.
          // Editing the restaurant name only here would leave the
          // change out of sync with chosen_wines and other surfaces,
          // so we steer the user to the proper Your Restaurants entry
          // for any rename.
          <View style={styles.restaurantNameRow}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.restaurantNameDisplay}>{restaurantName}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.restaurantNameRow}
            onPress={() => setEditingRestaurant(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.locationPin}>📍</Text>
            {editingRestaurant ? (
              <TextInput
                style={styles.restaurantNameInput}
                value={restaurantName}
                onChangeText={setRestaurantName}
                placeholder="Restaurant name"
                placeholderTextColor="rgba(255,255,255,0.45)"
                autoFocus
                onBlur={handleSaveRestaurant}
                onSubmitEditing={handleSaveRestaurant}
                returnKeyType="done"
              />
            ) : (
              <Text
                style={[
                  styles.restaurantNameDisplay,
                  !restaurantName && styles.restaurantNamePlaceholder,
                ]}
              >
                {restaurantName || 'Tap to add restaurant name'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {restaurantName.trim().length > 0 ? (
          <TouchableOpacity
            style={styles.reviewRestaurantBtn}
            onPress={async () => {
              // Make sure the scan_sessions row is in place before we
              // route to Your Restaurants. Without this, a user who
              // tapped the CTA before onBlur fired could land on an
              // empty list.
              await handleSaveRestaurant();
              qc.invalidateQueries({ queryKey: ['scan-archive'] });
              router.push('/restaurants/reviews');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.reviewRestaurantBtnText}>Add or Edit Review →</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.restaurantHint}>
            Capture the restaurant so you can review the food, atmosphere and service in Your Restaurants.
          </Text>
        )}
      </View>

      {/* Wine accordions */}
      <View style={styles.list}>
        {recommendation.wines.map((wine, i) => {
          const isOpen = openIndex === i;
          const isTop = i === 0;
          return (
            <View key={wine.name + i} style={styles.card}>

              {/* Collapsed row — always visible */}
              <TouchableOpacity
                style={styles.row}
                onPress={() => toggleWine(i)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.rankRow}>
                    <Text style={styles.rankLabel}>
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
                    if (chosenIndexes.has(i)) {
                      // Wine has already been added — route to the reviews
                      // list so the user can find it and tap to edit.
                      router.push('/wines/chosen');
                    } else {
                      setChosenModalWine(wine);
                    }
                  }}
                >
                  <Text style={[styles.chosenButtonText, chosenIndexes.has(i) && styles.chosenButtonTextDone]}>
                    {chosenIndexes.has(i) ? 'View and Edit Your Wine Review' : 'Review This Wine'}
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

                  {session && (
                    <TouchableOpacity
                      style={[styles.wishlistAddButton, wishlistIndexes.has(i) && styles.wishlistAddButtonDone]}
                      onPress={() => handleAddToWishlist(wine, i)}
                      disabled={wishlistIndexes.has(i) || addToWishList.isPending}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.wishlistAddButtonText, wishlistIndexes.has(i) && styles.wishlistAddButtonTextDone]}>
                        {wishlistIndexes.has(i) ? '✓ Added to Wish List' : 'Add to Wish List'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

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
        onClose={() => setChosenModalWine(null)}
        onSaved={() => {
          const idx = recommendation!.wines.indexOf(chosenModalWine!);
          if (idx !== -1) setChosenIndexes((prev) => new Set([...prev, idx]));
          setChosenModalWine(null);
        }}
      />

      {/* Off-screen share card. Positioned out of view; captured to a
          PNG when the user taps Share so the system share sheet gets a
          designed, branded image to hand to WhatsApp / Instagram / etc. */}
      <View style={styles.shareCardWrap} pointerEvents="none">
        <WineListShareCard
          ref={shareCardRef}
          wines={recommendation.wines}
          date={stampDate}
          restaurant={stampRestaurant}
          city={stampCity}
        />
      </View>

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
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backLink: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
  },
  shareBtnText: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  // Off-screen share card — positioned far below the viewport so it
  // renders for the captureRef snapshot but never appears on screen.
  shareCardWrap: {
    position: 'absolute',
    top: 100000,
    left: 0,
    opacity: 0,
  },
  stampRow: {
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  stampDate: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 18,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  stampLocation: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
  heading: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
    fontSize: 15,
    color: 'rgba(212,176,96,0.80)',
    lineHeight: 20,
    textAlign: 'center',
  },
  vintageNote: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  summary: {
    fontSize: 17,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  restaurantCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: 'rgba(212,176,96,0.06)',
  },
  restaurantCardLabel: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 12,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  restaurantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.xs,
  },
  locationPin: {
    fontSize: 18,
  },
  restaurantNameDisplay: {
    flex: 1,
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 20,
    color: colors.text,
    letterSpacing: 0.3,
  },
  restaurantNamePlaceholder: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 18,
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 0,
  },
  restaurantNameInput: {
    flex: 1,
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 20,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.30)',
    paddingVertical: 2,
  },
  restaurantHint: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  reviewRestaurantBtn: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  reviewRestaurantBtnText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.gold,
    marginBottom: spacing.md,
    overflow: 'hidden',
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
    fontSize: 14,
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
  wishlistAddButton: {
    marginTop: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    alignItems: 'center',
  },
  wishlistAddButtonDone: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,176,96,0.10)',
  },
  wishlistAddButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  wishlistAddButtonTextDone: {
    color: colors.gold,
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
    fontSize: 14,
    color: colors.gold,
    lineHeight: 19,
  },
  scoreNote: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    fontSize: 17,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: '#FFFFFF',
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
  savedConfirm: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
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
