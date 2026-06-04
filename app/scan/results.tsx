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
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { findExistingReview, appendDatedEntry, todayLabel } from '../../src/utils/reviewDedup';
import { normaliseCity } from '../../src/utils/city';
import { recommendWines } from '../../src/services/recommender';
import { SearchProgress } from '../../src/components/SearchProgress';
import { ChosenWineModal } from '../../src/components/ChosenWineModal';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { WineListShareCard } from '../../src/components/WineListShareCard';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import type { WineRecommendation } from '../../src/types/wine';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const RANK_LABELS = ['Top Pick', 'Second Choice', 'Third Choice'];

// Join appellation + region without repeating the location. The AI sometimes
// puts the country in both (e.g. appellation "West Sussex/England" + region
// "England"), which read as "West Sussex/England, England". If one already
// contains the other, keep the more specific one.
function joinPlace(appellation?: string | null, region?: string | null): string {
  const a = (appellation ?? '').trim();
  const r = (region ?? '').trim();
  if (!a) return r;
  if (!r) return a;
  const al = a.toLowerCase();
  const rl = r.toLowerCase();
  if (al.includes(rl)) return a;
  if (rl.includes(al)) return r;
  return `${a}, ${r}`;
}

export default function ResultsScreen() {
  const { fromHistory, sessionId, restaurant: historyRestaurant, city: historyCity, date: historyDate } = useLocalSearchParams<{ fromHistory?: string; sessionId?: string; restaurant?: string; city?: string; date?: string }>();
  const isFromHistory = fromHistory === 'true';
  const { recommendation, extractedWines, preferences, setRecommendation, reset } = useScanStore();
  const { autoSave, archive } = useScanHistory();
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
  // Per-recommendation map: index → wishlist row id. Used to toggle
  // a wine on/off the wish list from the results screen — if there's
  // a row id stored, the same button removes it; otherwise it adds
  // and stashes the new id. Lets a user undo an accidental tap
  // without leaving the screen.
  const { save: saveChosen, update: updateChosen, chosenWines } = useChosenWines();
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
  const [restaurantReviewOpen, setRestaurantReviewOpen] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);

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
        const raw = geo?.city ?? geo?.subregion ?? geo?.region ?? null;
        const city = raw ? normaliseCity(raw) : null;
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

  // Save any restaurant name in place, then open the restaurant review form
  // right here on the results screen. Used by both the tappable location
  // line and the foot-of-page CTA — the form opens in place rather than
  // bouncing the user to the Your Restaurants list.
  async function openRestaurantReview() {
    await handleSaveRestaurant();
    const id = sessionId ?? autoSave.data?.[0]?.sessionId ?? null;
    if (!id) {
      showAlert({ title: 'Add a restaurant first', body: 'Add the restaurant name above, then you can review it.' });
      return;
    }
    setReviewSessionId(id);
    setRestaurantReviewOpen(true);
  }

  // The List Archive is gone — autoSave still fires from
  // handleSaveRestaurant so a scan with a restaurant name lands in
  // Your Restaurants, but there's no longer an explicit save button or
  // post-save confirmation block on this screen.

  const isSaved = !!autoSave.data;

  // Quick Select — the user says "I chose this one" without writing a
  // full review. Writes a chosen_wines row with empty review fields so
  // Vinster's personalisation has the signal but the user isn't pushed
  // through the review modal. They can upgrade to a full review later
  // via the Review Wine button on the expanded card.
  //
  // Duplicate behaviour: if a review for this wine identity already
  // exists, we don't create a second row. Instead we update the
  // existing review's other_observations with a dated "Selected at X"
  // line so the user's history reads as a small log of when they've
  // chosen this wine. Mirrors the user's mental model: ordering a wine
  // they've had before should reinforce the existing review, not
  // fragment it. Same-scan-session re-taps are a silent no-op (the chip
  // just flips to Chosen).
  async function handleQuickSelect(wine: WineRecommendation, i: number) {
    if (!session || chosenIndexes.has(i)) return;
    try {
      const sid = isFromHistory
        ? (sessionId ?? null)
        : (autoSave.data?.[0]?.sessionId ?? null);
      const cityValue = isFromHistory
        ? (historyCity ?? '')
        : (autoSave.data?.[0]?.city ?? '');
      const currentRestaurant = restaurantName ?? '';

      const existing = findExistingReview(chosenWines, {
        producer: wine.producer,
        wineName: wine.name,
        vintage: wine.vintage,
      });

      if (existing) {
        // Same scan session → the user already noted this wine on this
        // list (probably tapped Quick Select twice). Treat as a no-op
        // so we don't add duplicate "Selected at" lines for one event.
        if (existing.scan_session_id && sid && existing.scan_session_id === sid) {
          setChosenIndexes((prev) => new Set([...prev, i]));
          showAlert({
            title: 'Already noted',
            body: "You've already chosen this wine on this list.",
          });
          return;
        }

        // Different occasion (or no scan-session info to compare) →
        // append a dated "Selected at {place}" line to the existing
        // review's other_observations, keeping their original tasting
        // note, score and where/when intact. The new place lives in
        // the dated entry rather than overwriting the existing
        // restaurant_name/city so the original review context survives.
        const places = [currentRestaurant.trim(), (cityValue ?? '').trim()]
          .filter(Boolean)
          .join(', ');
        const selectionLine = places ? `Selected at ${places}.` : 'Selected again.';
        const label = todayLabel();
        await updateChosen.mutateAsync({
          id: existing.id,
          input: {
            restaurantName: existing.restaurant_name ?? '',
            city: existing.city ?? '',
            tastingNote: existing.tasting_note ?? '',
            otherObservations: appendDatedEntry(existing.other_observations, selectionLine, label),
            userScore: existing.user_score,
            listPrice: existing.menu_price,
            isFavourite: existing.is_favourite,
            producer: existing.producer,
            wineName: existing.wine_name,
            vintage: existing.vintage,
          },
        });
        setChosenIndexes((prev) => new Set([...prev, i]));
        showAlert({
          title: 'Noted',
          body: "Added to your existing review for this wine — Vinster will fold this latest selection into your vinous amour.",
        });
        return;
      }

      await saveChosen.mutateAsync({
        wine,
        scanSessionId: sid,
        restaurantName: currentRestaurant,
        city: cityValue,
        tastingNote: '',
        otherObservations: '',
        userScore: null,
        listPrice: null,
        isFavourite: false,
      });
      setChosenIndexes((prev) => new Set([...prev, i]));
      showAlert({
        title: 'Noted',
        body: "Your selection has been noted — Vinster will apply this to their understanding of your vinous amour.",
      });
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }


  async function handleAlternativeList() {
    if (!extractedWines || !recommendation) return;
    setIsGenerating(true);
    try {
      // Exclude by full identity (producer + name + vintage), not just the
      // bare name — a cuvée name alone is often ambiguous, which let Claude
      // re-recommend the same wine. Full identity makes the exclusion exact.
      const excludeWines = recommendation.wines.map((w) =>
        [w.producer, w.name, w.vintage].filter(Boolean).join(' ')
      );
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
  // Highest critic score across the picks — used to compute the fallback
  // Critic Score note ("Highest of the picks…") before the recommend
  // function is redeployed with an AI-written criticScoreNote.
  const maxCriticScore = Math.max(0, ...recommendation.wines.map((w) => w.criticScore ?? 0));

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
        // No forced width/height — capture the card at its natural size
        // so the wine fonts can breathe and there's no fixed-height empty
        // space at top or bottom.
        const uri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 1,
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
        // Flavour profile on its own line, indented, so it reads as a
        // pull-quote about taste rather than an extension of the
        // header. Omitted when missing (older saved scans).
        const flavour = w.flavourProfile ? `\n   ${w.flavourProfile}` : '';
        return `${rank}: ${vintage}${w.name}${score}${flavour}`;
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
        {stampDate ? (
          <View style={styles.stampRow}>
            <Text style={styles.stampDate}>{stampDate}</Text>
          </View>
        ) : null}

        {/* Compact restaurant line — single line between the date and
            'Vinster Recommends'. Empty state shows the pin + a tap-to-add
            prompt. Once a name lands, the row reads pin · name · city.
            Locked to read-only display when a scan_sessions row already
            backs this result (edits happen via the CTA at the bottom of
            the page). */}
        {effectiveSessionId && restaurantName.trim().length > 0 ? (
          <TouchableOpacity style={styles.restaurantLine} onPress={openRestaurantReview} activeOpacity={0.7}>
            <Text style={styles.restaurantPin}>📍</Text>
            <Text style={styles.restaurantLineText} numberOfLines={1}>
              {restaurantName}{stampCity ? ` · ${stampCity}` : ''}
            </Text>
          </TouchableOpacity>
        ) : editingRestaurant ? (
          <View style={styles.restaurantLine}>
            <Text style={styles.restaurantPin}>📍</Text>
            <TextInput
              style={styles.restaurantLineInput}
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Tap to add restaurant"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoFocus
              onBlur={handleSaveRestaurant}
              onSubmitEditing={handleSaveRestaurant}
              returnKeyType="done"
            />
            {stampCity ? <Text style={styles.restaurantLineCity}> · {stampCity}</Text> : null}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.restaurantLine}
            onPress={() => setEditingRestaurant(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.restaurantPin}>📍</Text>
            <Text
              style={[styles.restaurantLineText, !restaurantName && styles.restaurantLinePlaceholder]}
              numberOfLines={1}
            >
              {restaurantName || 'Tap to add restaurant'}{stampCity ? ` · ${stampCity}` : ''}
            </Text>
          </TouchableOpacity>
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

      {/* Wine cards — flat, scannable layout. No row-level accordion;
          everything except the long-form sommelier note is visible by
          default. Each card flows: name → producer line → price + score
          → outside-prefs warning → ◆ standout points → ★ drinkability +
          rarity → action buttons → expandable sommelier note. */}
      <View style={styles.list}>
        {recommendation.wines.map((wine, i) => {
          const sommOpen = openIndex === i;
          // The four labelled parameter notes, always in the same order.
          // Critic Score / Value come from the AI once the recommend
          // function is redeployed; until then Critic Score falls back to a
          // computed line and Value stays hidden. Vintage + Producer reuse
          // the existing assessment notes.
          const criticScoreText = wine.criticScoreNote
            ?? (wine.criticScore > 0
              ? (wine.criticScore === maxCriticScore && recommendation.wines.length > 1
                  ? `Highest of the picks at ${wine.criticScore} points`
                  : `${wine.criticScore} points`)
              : null);
          const valueText = wine.valueNote ?? null;
          const vintageText = !noVintages && wine.vintageAssessment
            ? [wine.vintageAssessment.notes, wine.drinkingWindow?.notes].filter(Boolean).join(' ')
            : null;
          const producerText = wine.rarityAssessment?.notes ?? null;
          // Top pick only — one synthesis line. Falls back to joining the
          // legacy topPickReasons until standoutNote ships.
          const standoutText = wine.standoutNote
            ?? (wine.topPickReasons?.length ? wine.topPickReasons.join(' · ') : null);
          // Title reads "Producer, Wine Name, Vintage"; the line below reads
          // "Regional Placement · Grape". Producer is dropped from the title
          // when it's identical to the wine name (e.g. a grower whose estate
          // name IS the wine) so it isn't printed twice.
          const producerSameAsName = !!wine.producer && !!wine.name
            && wine.producer.trim().toLowerCase() === wine.name.trim().toLowerCase();
          const wineTitle = [
            wine.producer,
            producerSameAsName ? null : wine.name,
            wine.vintage ? String(wine.vintage) : null,
          ].filter(Boolean).join(', ');
          const regionalPlacement = joinPlace(wine.appellation, wine.region);
          const wineSubline = [regionalPlacement, wine.grape].filter(Boolean).join(' · ');
          return (
            <View key={wine.name + i} style={styles.card}>
              <View style={styles.cardInner}>

                <Text style={styles.wineName}>{wineTitle}</Text>
                {wineSubline ? (
                  <Text style={styles.wineProducer}>{wineSubline}</Text>
                ) : null}

                {/* Price + score share one line beneath the name. Either
                    field can be missing (some lists omit the price, some
                    wines lack a critic score) — the row stays balanced
                    by rendering only the present halves. */}
                {(wine.menuPrice != null || wine.criticScore > 0) && (
                  <View style={styles.priceScoreRow}>
                    {wine.menuPrice != null && (
                      <Text style={styles.priceScoreText}>£{wine.menuPrice}</Text>
                    )}
                    {wine.menuPrice != null && wine.criticScore > 0 && (
                      <Text style={styles.priceScoreDot}> · </Text>
                    )}
                    {wine.criticScore > 0 && (
                      <Text style={styles.priceScoreText}>{wine.criticScore} pts</Text>
                    )}
                  </View>
                )}

                {/* One-line flavour profile — pure tasting note. Sits
                    between the price/score and the bulleted standouts so
                    the user reads "this is what it tastes like" before
                    "this is why we picked it". */}
                {wine.flavourProfile ? (
                  <Text style={styles.wineFlavour}>{wine.flavourProfile}</Text>
                ) : null}

                {wine.outsidePreferences && (
                  <View style={styles.outsideNotice}>
                    <Text style={styles.outsideText}>
                      ⚠ This is outside your preferences, but it's worth your consideration — {wine.outsidePreferences}
                    </Text>
                  </View>
                )}

                {/* Top pick only — one gold synthesis line (no bullet),
                    sitting directly above the four parameter notes. */}
                {i === 0 && standoutText ? (
                  <Text style={styles.standoutStatement}>{standoutText}</Text>
                ) : null}

                {/* Four labelled parameters, always in the same order for
                    consistency and clarity — no bullets, one clean line each:
                    Critic Score, Value, Vintage/Drinkability, Producer Note.
                    Each renders only when it has content. Left-aligned; only
                    the top-pick gold line above is centred. */}
                <View style={styles.paramBlock}>
                  {criticScoreText ? (
                    <Text style={styles.paramText}>
                      <Text style={styles.paramLabel}>Critic Score</Text>{`  ${criticScoreText}`}
                    </Text>
                  ) : null}
                  {valueText ? (
                    <Text style={styles.paramText}>
                      <Text style={styles.paramLabel}>Value</Text>{`  ${valueText}`}
                    </Text>
                  ) : null}
                  {vintageText ? (
                    <Text style={styles.paramText}>
                      <Text style={styles.paramLabel}>Vintage/Readiness</Text>{`  ${vintageText}`}
                    </Text>
                  ) : null}
                  {producerText ? (
                    <Text style={styles.paramText}>
                      <Text style={styles.paramLabel}>Producer Note</Text>{`  ${producerText}`}
                    </Text>
                  ) : null}
                </View>

                {session && (
                  <TouchableOpacity
                    style={[styles.bottlePicksButton, chosenIndexes.has(i) && styles.bottlePicksButtonDone]}
                    onPress={() => {
                      if (chosenIndexes.has(i)) {
                        router.push('/wines/chosen');
                      } else {
                        handleQuickSelect(wine, i);
                      }
                    }}
                    disabled={saveChosen.isPending && !chosenIndexes.has(i)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.bottlePicksButtonText, chosenIndexes.has(i) && styles.bottlePicksButtonTextDone]}>
                      {chosenIndexes.has(i) ? '✓ Added · View in Your Wine Reviews' : 'Add to Your Restaurants - Bottle Picks'}
                    </Text>
                  </TouchableOpacity>
                )}

                {session && (
                  <View style={styles.detailActionsRow}>
                    <TouchableOpacity
                      style={styles.detailActionBtn}
                      onPress={() => setChosenModalWine(wine)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailActionBtnText}>Review Wine</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Vinster's Sommelier Note — collapsed by default. The
                    rationale is the longest prose block on the card, so
                    hiding it behind a tap keeps the page scannable while
                    leaving the full sommelier reasoning a tap away. */}
                <TouchableOpacity
                  style={styles.sommNoteToggle}
                  onPress={() => toggleWine(i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sommNoteToggleText}>
                    Vinster's Sommelier Note
                  </Text>
                  <Ionicons
                    name={sommOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={16}
                    color={colors.gold}
                  />
                </TouchableOpacity>
                {sommOpen && (
                  <Text style={styles.sommNoteText}>{wine.rationale}</Text>
                )}

              </View>
            </View>
          );
        })}
      </View>

      {/* Review or Edit Your Restaurant — moved to the foot of the
          results page so the wine cards are the visual focus above it.
          Shown only when a restaurant name is set; the compact header
          line is the path for adding one in the first place. */}
      {restaurantName.trim().length > 0 && !editingRestaurant && (
        <TouchableOpacity
          style={styles.reviewRestaurantBtn}
          onPress={openRestaurantReview}
          activeOpacity={0.8}
        >
          <Text style={styles.reviewRestaurantBtnText}>Review or Edit Your Restaurant →</Text>
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
        onClose={() => setChosenModalWine(null)}
        onSaved={() => {
          const idx = recommendation!.wines.indexOf(chosenModalWine!);
          if (idx !== -1) setChosenIndexes((prev) => new Set([...prev, idx]));
          setChosenModalWine(null);
        }}
      />

      {/* Restaurant review form — opened from the location line or the
          foot-of-page CTA. Pre-filled from the saved scan_session when one
          exists (e.g. View Last Result), blank for a fresh review. */}
      {reviewSessionId ? (() => {
        const item = archive.find((a) => a.id === reviewSessionId) ?? null;
        return (
          <RestaurantReviewModal
            visible={restaurantReviewOpen}
            sessionId={reviewSessionId}
            initialName={restaurantName || item?.restaurantName || null}
            initialNote={item?.restaurantNote ?? null}
            initialRatings={item ? { food: item.ratingFood, service: item.ratingService, wineList: item.ratingWineList, overall: item.ratingOverall } : null}
            city={stampCity}
            date={stampDate}
            onClose={() => setRestaurantReviewOpen(false)}
            onSaved={() => { setRestaurantReviewOpen(false); qc.invalidateQueries({ queryKey: ['scan-archive'] }); }}
          />
        );
      })() : null}

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
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backLink: {
    fontSize: 16,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
  },
  shareBtnText: {
    fontSize: 14,
    fontFamily: fonts.headingSemibold,
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
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  // Compact restaurant line — pin · name · city. Sits between the
  // date stamp and the 'Vinster Recommends' heading. Replaces the old
  // bordered "Dining at" card.
  restaurantLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    maxWidth: '100%',
  },
  restaurantPin: {
    fontSize: 16,
  },
  restaurantLineText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  restaurantLinePlaceholder: {
    fontFamily: fonts.bodyItalic,
    color: 'rgba(255,255,255,0.55)',
  },
  restaurantLineInput: {
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.30)',
    minWidth: 140,
    paddingVertical: 2,
  },
  restaurantLineCity: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.text,
  },
  heading: {
    fontFamily: fonts.headingSemibold,
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
    fontFamily: fonts.headingBold,
    fontSize: 14,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: 'center',
  },
  // Italic banner explainer — body italic (not a tab tagline).
  topScoringBannerBody: {
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    color: 'rgba(212,176,96,0.80)',
    lineHeight: 20,
    textAlign: 'center',
  },
  vintageNote: {
    fontSize: 16,
    fontFamily: fonts.bodyItalic,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  // Sommelier summary prose — italic body, not a header.
  summary: {
    fontSize: 17,
    fontFamily: fonts.bodyItalic,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
  },
  // Footer CTA — sits below the third wine card, routes the user to
  // Your Restaurants for the proper review/edit flow. Margin-wide so it
  // mirrors the alternativeButton beneath it.
  reviewRestaurantBtn: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    alignItems: 'center',
  },
  reviewRestaurantBtnText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 14,
    color: '#FFFFFF',
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
  },
  cardInner: {
    padding: spacing.md,
  },
  // Wine name on the recommendation card — body (data value).
  wineName: {
    fontSize: 21,
    fontFamily: fonts.bodyBold,
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 2,
    textAlign: 'center',
  },
  wineProducer: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: 6,
  },
  // Price + score share one line directly below the producer row.
  priceScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 6,
  },
  priceScoreText: {
    fontFamily: fonts.bodyBold,
    fontSize: 19,
    color: colors.text,
  },
  priceScoreDot: {
    fontFamily: fonts.bodyRegular,
    fontSize: 19,
    color: colors.textMuted,
  },
  // Flavour-profile line — italic gold "Vinster's voice".
  wineFlavour: {
    fontSize: 14,
    fontFamily: fonts.bodyItalic,
    color: colors.gold,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  // Four labelled parameter lines — Critic Score / Value / Vintage /
  // Producer. One clean centred line each, bold label + regular note.
  paramBlock: {
    gap: 7,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  paramText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
    textAlign: 'left',
  },
  paramLabel: {
    fontFamily: fonts.bodySemibold,
    color: colors.gold,
  },
  // Top-pick synthesis line — italic white, no bullet, sits above the params.
  standoutStatement: {
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  // Two-button row — Review Wine + Add to Wish List, side by side.
  detailActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  detailActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  detailActionBtnDone: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,176,96,0.10)',
  },
  detailActionBtnText: {
    color: '#FFFFFF',
    fontFamily: fonts.headingSemibold,
    fontSize: 14,
  },
  detailActionBtnTextDone: {
    color: colors.gold,
  },
  // Long primary CTA — Add to Your Bottle Picks. Sits below the
  // two-button row as the headline action on each card.
  bottlePicksButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bottlePicksButtonDone: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,176,96,0.18)',
  },
  bottlePicksButtonText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  bottlePicksButtonTextDone: {
    color: colors.gold,
  },
  // Sommelier note expand toggle — collapsed by default, label + chevron.
  sommNoteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 6,
  },
  sommNoteToggleText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 13,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sommNoteText: {
    marginTop: 4,
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.text,
    lineHeight: 23,
    paddingHorizontal: spacing.xs,
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
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.gold,
    lineHeight: 22,
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
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
  },
});
