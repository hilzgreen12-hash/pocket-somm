import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, LayoutAnimation, Platform, UIManager, Share, Modal, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../src/api/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../../src/utils/shareCard';
import { bottleFormatLabel, bottlesIn } from '../../src/utils/bottleFormat';
import { captureRef } from 'react-native-view-shot';
import { useScanStore } from '../../src/stores/scanStore';
import { useScanHistory, cacheScanLocally, updateLocalScan, saveScanRecommendation } from '../../src/hooks/useScanHistory';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { findExistingReview } from '../../src/utils/reviewDedup';
import { normaliseCity } from '../../src/utils/city';
import { currencySymbol } from '../../src/constants/currency';
import { recommendWines } from '../../src/services/recommender';
import { fetchPricing } from '../../src/services/pricing';
import { fetchVinsterReview } from '../../src/api/label';
import { SearchProgress } from '../../src/components/SearchProgress';
import { ChosenWineModal } from '../../src/components/ChosenWineModal';
import { PickReveal } from '../../src/components/PickReveal';
import { WineIdentityHeader } from '../../src/components/WineIdentityHeader';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { useAttachRestaurantPhoto, DISMISS_DELAY_MS } from '../../src/hooks/useAttachRestaurantPhoto';
import { deleteScanSession } from '../../src/api/restaurantSessions';
import { updateSessionRestaurant } from '../../src/api/chosenWines';
import { WineListShareCard } from '../../src/components/WineListShareCard';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import type { WineRecommendation } from '../../src/types/wine';
import { lineupForVisitHref } from '../../src/utils/restaurantReview';

// Shown by the "(what's this)" link next to Vinster's Review — mirrors the
// explainer on the wine card so the two surfaces read consistently.
const VINSTER_REVIEW_EXPLAINER =
  "Vinster digs deeply into the online world for critic scores and reviews, vintage information, market values, and overall producer quality to generate information on this wine and use it for the basis of its wine note, which covers the classics — fruit, acidity, tannin, body, and finish. Your own thoughts can be recorded in your own review of the wine.";

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const RANK_LABELS = ['Top Pick', 'Second Choice', 'Third Choice'];

// Per-pick Wine-Searcher enrichment, fetched after the recommendations render.
interface WsEnrich {
  criticScore: number | null;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: string;
  region: string | null;
  grape: string | null;
}

// Wine-Searcher's data for one pick, in its menu currency — null when it has
// no match. Wine-Searcher matches loosely; for an obscure pick it can return a
// different wine, so its data is used only when it's recognisably this wine.
async function lookupWs(w: WineRecommendation, cur: string): Promise<WsEnrich | null> {
  const queryName = [w.producer, w.name].filter(Boolean).join(' ').trim();
  if (!queryName) return null;
  const p = await fetchPricing(queryName, w.vintage ?? null, cur);
  if (p.source !== 'wine-searcher' || p.matched === false) return null;
  if (!sameWineByName(w.producer, w.name, p.wsWineName)) return null;
  return {
    criticScore: p.criticScore, avgPrice: p.averageMarketPrice, minPrice: p.minPrice, maxPrice: p.maxPrice,
    currency: cur, region: p.region ?? null, grape: p.grape ?? null,
  };
}

// Vinster's own reading of the published critics for this wine (null when it
// doesn't genuinely know the wine) — the score shown when Wine-Searcher has none.
function vinsterCriticScore(w: WineRecommendation): number | null {
  return w.criticScore != null && w.criticScore > 0 ? w.criticScore : null;
}

// The pop-up behind the score beside the price: Wine-Searcher's score and
// retail range, saying plainly what it doesn't have and when a Vinster Score
// stands in for the Wine-Searcher one.
function wsInfoBody(e: WsEnrich | null, vinsterScore: number | null): string {
  const sym = currencySymbol(e?.currency);
  const money = (n: number) => `${sym}${Math.round(n)}`;
  const score = e?.criticScore != null ? `Wine-Searcher score: ${e.criticScore} points.` : null;
  const range = e?.minPrice != null && e.maxPrice != null && Math.round(e.minPrice) !== Math.round(e.maxPrice)
    ? `Retail price range: ${money(e.minPrice)} – ${money(e.maxPrice)} a bottle.`
    : e?.avgPrice != null ? `Average retail price: ${money(e.avgPrice)} a bottle.` : null;
  const noScore = vinsterScore != null
    ? `No Wine-Searcher score is available for this wine, so a Vinster Score of ${vinsterScore} points is applied — Vinster's own reading of the published critic reviews (Wine Spectator, Wine Advocate, Decanter, Jancis Robinson, Vinous) for this wine.`
    : 'Wine-Searcher has no score for this wine.';
  if (!score && !range && vinsterScore == null) return 'Wine-Searcher has no score or retail prices for this wine.';
  return [score ?? noScore, range ?? 'Wine-Searcher has no retail prices for this wine.'].join('\n\n');
}

// Vinster's view of the critics against the Wine-Searcher average, added to
// the Critic Score line. vinster is Vinster's own reading of critic consensus.
function criticComparison(vinster: number, ws: number): string {
  const diff = vinster - ws;
  if (Math.abs(diff) <= 1) return 'Vinster agrees with the Wine-Searcher average.';
  const degree = Math.abs(diff) <= 3 ? 'slightly ' : '';
  return diff > 0
    ? `Vinster notes current critical acclaim for this wine is higher than the Wine-Searcher average, so would score it ${degree}up.`
    : `Vinster notes current critical acclaim for this wine is lower than the Wine-Searcher average, so would score it ${degree}down.`;
}

// Value-for-money line built from the real market average vs the list price.
// Both are in the same currency (we query WS in the wine's menu currency). The
// market average is for a 75cl bottle, so a magnum or half bottle is compared
// per bottle's worth.
function wsValueLine(menuPrice: number | null, avgPrice: number, sym: string, bottles = 1): string {
  const avg = `${sym}${Math.round(avgPrice)}`;
  if (menuPrice == null || menuPrice <= 0) return `Market average ${avg} (Wine-Searcher).`;
  const ratio = menuPrice / bottles / avgPrice;
  const verdict = ratio <= 1.5 ? 'strong value'
    : ratio <= 2 ? 'fair value'
    : ratio <= 2.5 ? 'full but defensible'
    : 'a steep markup';
  return `Market average ${avg} — about ${ratio.toFixed(1)}× retail, ${verdict}.`;
}

// Pull a readable message out of ANY thrown value. Supabase/PostgREST errors are
// plain objects (NOT Error instances), so `err instanceof Error ? err.message : …`
// silently collapsed every real DB failure (RLS, constraints, auth) to a useless
// "Please try again." This surfaces the code + message so failures are diagnosable.
function errText(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const e = err as { message?: string; code?: string; details?: string; hint?: string };
    const parts = [e.code, e.message, e.details, e.hint].filter(Boolean);
    if (parts.length) return parts.join(' — ');
    try { return JSON.stringify(err); } catch { /* fall through */ }
  }
  return 'Please try again.';
}

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

// Does Wine-Searcher's matched name look like this pick? True when it shares a
// distinctive word of the producer (or, with no usable producer word, of the
// wine's name). Generic words ("Château", "Estate", "Winery"…) don't count. An
// absent matched name is accepted, as before.
const GENERIC_WINE_WORDS = new Set(['chateau', 'domaine', 'domaines', 'estate', 'estates', 'winery', 'wines', 'wine', 'vineyards', 'vineyard', 'cellars', 'tenuta', 'bodega', 'bodegas', 'cantina', 'weingut', 'maison', 'quinta', 'casa', 'clos', 'cuvee', 'reserve', 'grand', 'blanc', 'rouge', 'rose', 'brut', 'cru']);
function sameWineByName(producer: string | null | undefined, name: string | null | undefined, wsName: string | null | undefined): boolean {
  if (!wsName) return true;
  const words = (t: string | null | undefined) => (t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .split(/[^a-z0-9]+/).filter((x) => x.length >= 4 && !GENERIC_WINE_WORDS.has(x));
  const ws = new Set(words(wsName));
  const own = words(producer).length ? words(producer) : words(name);
  return own.length === 0 || own.some((x) => ws.has(x));
}

// Up to n wines taken evenly across the whole list, keeping its order — so a
// long list contributes from every section, not just its first pages.
function sampleAcross<T>(list: T[], n: number): T[] {
  if (list.length <= n) return list;
  return Array.from({ length: n }, (_, k) => list[Math.floor((k * list.length) / n)]);
}

export default function ResultsScreen() {
  const { fromHistory, sessionId, restaurant: historyRestaurant, city: historyCity, date: historyDate } = useLocalSearchParams<{ fromHistory?: string; sessionId?: string; restaurant?: string; city?: string; date?: string }>();
  const isFromHistory = fromHistory === 'true';
  const { recommendation, extractedWines, preferences, setRecommendation, reset, onlineSource } = useScanStore();

  // The header "back" button. The transient camera/preview/extracting screens
  // are dismissed at extracting→results time, so the Wine List form sits
  // directly below results — plain back (this, plus the native system/gesture
  // back) returns to the form. We navigate first, then clear the scan store so
  // the next scan starts fresh (resetting first would flash the null state).
  // A list found online stays chosen, so the form still offers to read it
  // rather than switching to the camera.
  const goBack = useCallback(() => {
    if (isFromHistory) { router.back(); return; }
    router.dismissTo('/scan/wine-list');
    reset({ keepOnlineSource: true });
  }, [isFromHistory, reset]);

  const { autoSave, archive } = useScanHistory();
  const { session } = useAuth();
  const { preferences: userPrefs } = usePreferences();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  // "Vinster's Review" is fetched on demand when the chevron opens (keeps the
  // main recommend call light). reviewByIndex caches the fetched note per wine;
  // an empty-string value means the last fetch failed and a re-open retries.
  const [reviewByIndex, setReviewByIndex] = useState<Record<number, string>>({});
  const [reviewLoading, setReviewLoading] = useState<Set<number>>(new Set());
  // Indices whose review fetch FAILED (e.g. a 429) — shown as a tappable retry
  // rather than an endless "Generating…" spinner.
  const [reviewFailed, setReviewFailed] = useState<Set<number>>(new Set());
  // Indices Vinster doesn't genuinely recognise (server recognition gate) —
  // shown as an honest line, never stored as a review/rationale.
  const [reviewUnknown, setReviewUnknown] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  // Tracks the in-flight autoSave promise so concurrent callers
  // (onBlur of the input + the Review CTA tap) join the same save
  // rather than racing or skipping the wait. Without this, the CTA
  // could route to Your Restaurants before the scan_sessions row
  // landed, leaving the user staring at an empty list.
  const inFlightSaveRef = useRef<Promise<string | null> | null>(null);
  // The scan_sessions id created THIS session, captured synchronously the moment
  // autoSave resolves — so a follow-up tap reuses it instead of inserting a
  // second/third restaurant (autoSave.data lags a render behind). Fixes the
  // "same restaurant appears multiple times in Your Restaurants" bug.
  const savedSessionIdRef = useRef<string | null>(null);
  // wine index → the chosen_wine id we created for it on THIS results screen.
  // Authoritative record of what's selected right now, independent of the
  // chosen-wines cache / scan-session matching — so unselect always deletes the
  // right row and resets cleanly (fixes the "Noted: added to existing review"
  // popup appearing when trying to unselect after opening then discarding a review).
  const sessionPickIdRef = useRef<Map<number, string>>(new Map());
  // Wines whose select/unselect is currently in flight — a per-index guard so a
  // rapid second tap on the same wine can't fire a duplicate insert before the
  // first save lands. Fixes the "one wine appears N times" bug.
  const pendingIdxRef = useRef<Set<number>>(new Set());
  const [chosenModalWine, setChosenModalWine] = useState<WineRecommendation | null>(null);
  const [chosenIndexes, setChosenIndexes] = useState<Set<number>>(new Set());
  // index → real Wine-Searcher data for that pick (populated a beat after the
  // cards render, so results never wait on the API).
  const [wsByIndex, setWsByIndex] = useState<Record<number, WsEnrich>>({});
  // True once the Wine-Searcher lookups for these picks have all come back.
  const [wsChecked, setWsChecked] = useState(false);
  const { save: saveChosen, chosenWines, remove: removeChosen } = useChosenWines();
  // "Add a restaurant first" prompt — the List-Bottle button can't save without
  // a restaurant name, so we collect it (+ location) inline before proceeding.
  const [restaurantPromptOpen, setRestaurantPromptOpen] = useState(false);
  const [pendingWine, setPendingWine] = useState<{ wine: WineRecommendation; i: number } | null>(null);
  const [promptRestaurant, setPromptRestaurant] = useState('');
  const [promptCity, setPromptCity] = useState('');
  // Find Online: pre-fill the restaurant the user searched for.
  const [restaurantName, setRestaurantName] = useState(() => (!isFromHistory && onlineSource?.restaurant) || '');
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [renderedAt] = useState(() => new Date().toISOString());
  // Live GPS-derived city. The autoSave mutation also reads location at
  // save time and persists it on the row, but that doesn't land until the
  // server round-trip completes. Surfacing the city in the stamp on mount
  // gives the user immediate feedback that Vinster knows where they are.
  const [liveCity, setLiveCity] = useState<string | null>(() => (!isFromHistory && onlineSource?.city) || null);
  // Set after editing the restaurant review so the results card reflects the
  // new city immediately (autoSave.data isn't refetched on a review save).
  const [cityOverride, setCityOverride] = useState<string | null>(null);
  const [editingCity, setEditingCity] = useState(false);
  // Inline city-edit buffer. Seeded from the current stamp city when the user
  // taps the location, so an edit starts from Vinster's GPS guess rather than blank.
  const [cityInput, setCityInput] = useState('');
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

  // The scan_sessions row behind this result, if it exists yet: the URL's
  // sessionId (a reopened scan), else the row created on THIS screen (the ref is
  // set the moment the save resolves; autoSave.data lags a render behind).
  function currentSessionId(): string | null {
    return sessionId ?? savedSessionIdRef.current ?? autoSave.data?.[0]?.sessionId ?? null;
  }
  const effectiveSessionId = currentSessionId();
  const attachRestaurantPhoto = useAttachRestaurantPhoto();
  const [restaurantReviewOpen, setRestaurantReviewOpen] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  // Creating the row for the review form failed — the form offers a retry.
  const [reviewSessionError, setReviewSessionError] = useState(false);
  // Reopen the review form when this screen regains focus — set when the form
  // closes to show another screen (a wine's review, Find Online).
  const resumeReviewOnFocusRef = useRef(false);
  useFocusEffect(useCallback(() => {
    if (!resumeReviewOnFocusRef.current) return;
    resumeReviewOnFocusRef.current = false;
    setRestaurantReviewOpen(true);
  }, []));

  // Fetch a fresh GPS reading on mount so the stamp can show the user's
  // city in real time, before the server-side autoSave round-trip lands.
  // Requests permission if it hasn't been asked yet — the previous
  // `getForegroundPermissionsAsync` only read existing state, so on a
  // fresh install the prompt never fired and the stamp stayed blank.
  useEffect(() => {
    // A list found online isn't where the phone is — keep the typed town.
    if (isFromHistory || onlineSource) return;
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
    cacheScanLocally(session?.user.id ?? null, { extractedWines, recommendation, restaurantName: restaurantName || null });
    // Cloud-persist the scan straight away (nameless) so it appears in Recent
    // Scans even if the user never names a restaurant or reviews a wine. Naming a
    // restaurant later updates this same row (getOrCreateSession de-dupes).
    if (session) void getOrCreateSession();
  }, []);

  // "Still at the same restaurant?" — if the diner scans another list within
  // 4 hours of a previous scan that HAD a restaurant, offer to tag this one to
  // the same place. Saying yes REUSES that previous scan_sessions row, so every
  // wine pick and the review from both scans land in ONE Your Restaurants entry
  // for the visit rather than duplicating it. Fires once, only on a fresh scan
  // with no restaurant yet; a previous scan with no restaurant name is ignored.
  // Never for a list read online (a search, a pasted or shared link): that
  // says nothing about where the diner is now.
  const STILL_HERE_WINDOW_MS = 4 * 60 * 60 * 1000;
  const stillHereCheckedRef = useRef(false);
  useEffect(() => {
    if (isFromHistory || onlineSource || stillHereCheckedRef.current) return;
    if (!session?.user.id || !recommendation || restaurantName.trim()) return;
    stillHereCheckedRef.current = true;
    (async () => {
      try {
        const cutoff = new Date(Date.now() - STILL_HERE_WINDOW_MS).toISOString();
        // scan_sessions timestamps live in `captured_at` — there is no
        // `created_at` column, so querying it 400s and the prompt silently
        // never fired. Filter/order on captured_at.
        const { data } = await supabase
          .from('scan_sessions')
          .select('id, restaurant_name, captured_at')
          .eq('user_id', session.user.id)
          .not('restaurant_name', 'is', null)
          .gte('captured_at', cutoff)
          .order('captured_at', { ascending: false })
          .limit(1);
        const prev = data?.[0];
        const name = prev?.restaurant_name?.trim();
        if (!name || restaurantName.trim()) return; // nothing recent, or user already set one
        showAlert({
          title: `Are you still at ${name}?`,
          body: 'Any wine selection from this list will be added to the same visit in Your Restaurants.',
          buttons: [
            {
              text: 'Yes',
              onPress: async () => {
                setRestaurantName(name);
                // Reuse the SAME visit so picks + review consolidate into one
                // Your Restaurants entry (no duplicate for the same 4h session).
                // First discard the nameless row auto-created for THIS scan (await
                // any in-flight create), so it doesn't linger as a blank duplicate.
                let autoCreated = savedSessionIdRef.current;
                if (!autoCreated && inFlightSaveRef.current) { try { autoCreated = await inFlightSaveRef.current; } catch { /* ignore */ } }
                if (prev?.id) savedSessionIdRef.current = prev.id;
                if (autoCreated && autoCreated !== prev?.id) {
                  try {
                    await deleteScanSession(autoCreated);
                    qc.invalidateQueries({ queryKey: ['scan-archive'] });
                    // Point View Last Result at the visit this scan now belongs to.
                    if (prev?.id) await updateLocalScan(session?.user.id ?? null, autoCreated, { sessionId: prev.id, restaurantName: name });
                  } catch { /* best-effort cleanup */ }
                }
              },
            },
            { text: 'No', style: 'cancel' },
          ],
        });
      } catch { /* silent — this prompt is a convenience */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFromHistory, session?.user.id, recommendation]);

  // Keep the "Add to Bottle Picks" buttons in their saved state across
  // navigation (e.g. List → View Last Result). The local chosenIndexes set
  // is lost on remount, so reconcile it against the persisted chosen_wines:
  // a wine already saved on this scan session shows as "✓ Added".
  useEffect(() => {
    if (!session || !recommendation || !effectiveSessionId) return;
    setChosenIndexes((prev) => {
      const next = new Set(prev);
      recommendation.wines.forEach((wine, i) => {
        const existing = findExistingReview(chosenWines, {
          producer: wine.producer,
          wineName: wine.name,
          vintage: wine.vintage,
        });
        if (existing && existing.scan_session_id === effectiveSessionId) next.add(i);
      });
      return next;
    });
  }, [session, recommendation, chosenWines, effectiveSessionId]);

  // Fetch Vinster's Review for whichever pick is currently expanded. The first
  // wine is open by DEFAULT on mount (openIndex starts at 0), and the fetch used
  // to be tap-only — so wine #1 showed the "couldn't write" state without ever
  // calling the generator. Driving it off openIndex covers the default-open wine
  // and every tapped one. (ensureReview is hoisted + self-guards duplicates.)
  useEffect(() => {
    if (recommendation && openIndex != null) void ensureReview(openIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendation, openIndex]);

  // Progressively enrich the rendered picks with real Wine-Searcher data
  // (critic score, market price + value verdict, region/grape gap-fill). Runs
  // AFTER the cards render — in parallel, in each wine's own menu currency so
  // the value ratio is apples-to-apples. Cached server-side, so repeats are
  // instant; a no-match just leaves Claude's values untouched. Skipped for
  // history re-opens to avoid spending API calls on an old scan (the score
  // pop-up looks a pick up on tap instead).
  useEffect(() => {
    const wines = recommendation?.wines;
    setWsChecked(false);
    if (!wines?.length || isFromHistory) return;
    let active = true;
    (async () => {
      const results = await Promise.all(wines.map((w) => lookupWs(w, w.currency || userPrefs?.defaultCurrency || 'GBP')));
      if (!active) return;
      const map: Record<number, WsEnrich> = {};
      results.forEach((r, idx) => { if (r) map[idx] = r; });
      setWsByIndex(map);
      setWsChecked(true);
    })();
    return () => { active = false; };
  }, [recommendation, isFromHistory, userPrefs?.defaultCurrency]);

  // Ensure this scan is backed by a scan_sessions row, creating one (nameless) if
  // needed. Runs at most once concurrently (inFlightSaveRef) and reuses any row
  // already made this session, so the on-mount auto-persist and a later
  // restaurant-name save share ONE row instead of inserting duplicates. A nameless
  // row is intentional: it makes the scan appear in Recent Scans without polluting
  // Your Restaurants (which only lists sessions with a name or note).
  async function getOrCreateSession(): Promise<string | null> {
    const existing = currentSessionId();
    if (existing) return existing;
    if (inFlightSaveRef.current) return inFlightSaveRef.current;
    if (!recommendation || !extractedWines) return null;
    const promise = autoSave
      .mutateAsync({
        extractedWines, recommendation,
        // Find Online: the restaurant searched for and its town, not the phone's location.
        ...(onlineSource ? { restaurantNameOverride: onlineSource.restaurant || null, cityOverride: onlineSource.city } : {}),
      })
      .then((result: any) => {
        const id = (result?.[0]?.sessionId ?? null) as string | null;
        if (id) savedSessionIdRef.current = id;
        return id;
      })
      .finally(() => { inFlightSaveRef.current = null; });
    inFlightSaveRef.current = promise;
    try {
      return await promise;
    } catch (err) {
      showAlert({ title: 'Could not save', body: errText(err) });
      return null;
    }
  }

  // Save the restaurant name onto this scan's row (creating the row if needed)
  // and return the row's id, or null if that failed. Callers use the RETURNED
  // id: autoSave.data is still stale straight after the await.
  async function handleSaveRestaurant(nameOverride?: string): Promise<string | null> {
    setEditingRestaurant(false);
    const trimmed = (nameOverride ?? restaurantName).trim();
    // Make sure a row exists (created on mount for every scan, but this covers a
    // rapid name-save before that lands), then write the name onto it.
    const liveSessionId = await getOrCreateSession();
    if (!liveSessionId) return null;
    try {
      const { error } = await supabase
        .from('scan_sessions')
        .update({
          restaurant_name: trimmed || null,
          // Carry through a city the user edited before this row existed.
          ...(cityOverride !== null ? { city: cityOverride } : {}),
        })
        .eq('id', liveSessionId);
      if (error) throw error;
      // A rename also renames the wines already picked on this visit.
      if (trimmed) await updateSessionRestaurant(liveSessionId, { restaurantName: trimmed, ...(cityOverride !== null ? { city: cityOverride } : {}) });
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] });
      // …and the local copy, so View Last Result shows the restaurant too.
      await updateLocalScan(session?.user.id ?? null, liveSessionId, { restaurantName: trimmed || null });
    } catch (err) {
      showAlert({ title: 'Could not save', body: errText(err) });
    }
    return liveSessionId;
  }

  // Persist an inline edit to the location/city on the results stamp. Vinster
  // pre-fills the city from GPS, which is usually right but can read a
  // neighbouring town; this lets the user correct it without leaving the screen.
  // Updates the stamp immediately (cityOverride) and writes through to the
  // scan_sessions row if one already backs this result. If no row exists yet,
  // the override holds in memory and handleSaveRestaurant persists it when the
  // row is created.
  async function handleSaveCity(value: string): Promise<void> {
    setEditingCity(false);
    const trimmed = value.trim();
    setCityOverride(trimmed || null);
    const liveSessionId = currentSessionId();
    if (!liveSessionId) return;
    try {
      const { error } = await supabase
        .from('scan_sessions')
        .update({ city: trimmed || null })
        .eq('id', liveSessionId);
      if (error) throw error;
      await updateSessionRestaurant(liveSessionId, { city: trimmed || null });
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] });
    } catch (err) {
      showAlert({ title: 'Could not save', body: errText(err) });
    }
  }

  // Editable city node for the restaurant stamp line. Read-only tappable text
  // by default (keeps the pin · name · city look); flips to an inline input on
  // tap. Rendered as a sibling of the name so tapping the city edits the city
  // while tapping the name still opens the restaurant review.
  function renderCity() {
    // Revisiting a saved scan is read-only — show the city as plain text, no edit.
    if (isFromHistory) return stampCity ? <Text style={styles.restaurantLineCity}>· {stampCity}</Text> : null;
    if (editingCity) {
      return (
        <TextInput
          style={styles.cityLineInput}
          value={cityInput}
          onChangeText={setCityInput}
          placeholder="City"
          placeholderTextColor="rgba(255,255,255,0.45)"
          autoFocus
          onBlur={() => handleSaveCity(cityInput)}
          onSubmitEditing={() => handleSaveCity(cityInput)}
          returnKeyType="done"
        />
      );
    }
    if (!stampCity) return null;
    return (
      <TouchableOpacity
        onPress={() => { setCityInput(stampCity ?? ''); setEditingCity(true); }}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        activeOpacity={0.7}
      >
        <Text style={styles.restaurantLineCity}>· {stampCity}</Text>
      </TouchableOpacity>
    );
  }

  // Open the restaurant review form in place (tap on the restaurant line).
  // It opens INSTANTLY: the row id is resolved in the background, and the form
  // keeps Save and "+ Add a bottle" disabled until it lands.
  function openRestaurantReview() {
    setRestaurantReviewOpen(true);
    void resolveReviewSession();
  }

  // Persist the restaurant name and get this visit's row id for the form.
  async function resolveReviewSession() {
    setReviewSessionError(false);
    setReviewSessionId(currentSessionId());
    const id = await handleSaveRestaurant();
    if (id) setReviewSessionId(id);
    else setReviewSessionError(true);
  }

  // Path back to this screen as it is now, for screens that return via backTo.
  function resultsHref(): string {
    if (!isFromHistory) return '/scan/results';
    const q = new URLSearchParams({ fromHistory: 'true' });
    if (sessionId) q.set('sessionId', sessionId);
    if (historyRestaurant) q.set('restaurant', historyRestaurant);
    if (historyCity) q.set('city', historyCity);
    if (historyDate) q.set('date', historyDate);
    return `/scan/results?${q.toString()}`;
  }

  // "Select This Wine" — records that the diner chose this wine at this visit:
  // a chosen_wines row linked to the visit, with no review yet (they can review
  // it now from the popup, or later). Choosing a wine they've reviewed before
  // adds a new entry to that review (same review_group_id), so this visit gets
  // its own record while the earlier review stays as it was. Choosing it twice
  // on the same visit is a no-op.
  async function handleQuickSelect(wine: WineRecommendation, i: number, overrides?: { restaurant?: string; city?: string }) {
    if (!session || chosenIndexes.has(i) || pendingIdxRef.current.has(i)) return;
    pendingIdxRef.current.add(i);
    // Instant tactile feedback so the tap registers before anything paints.
    void Haptics.selectionAsync();

    const currentRestaurant = overrides?.restaurant ?? restaurantName ?? '';
    // A LOCAL check (no network): has the diner reviewed this wine before?
    const existing = findExistingReview(chosenWines, {
      producer: wine.producer,
      wineName: wine.name,
      vintage: wine.vintage,
    });
    const knownSessionId = currentSessionId();
    if (existing && knownSessionId && existing.scan_session_id === knownSessionId) {
      pendingIdxRef.current.delete(i);
      setChosenIndexes((prev) => new Set([...prev, i]));
      showAlert({ title: 'Already noted', body: "You've already chosen this wine on this list." });
      return;
    }

    // Confirm IMMEDIATELY: showAlert only re-renders the light alert host, so
    // firing it BEFORE the chip flip (below) lets the popup paint without
    // waiting on the three heavy wine cards re-rendering in the same commit.
    const place = currentRestaurant.trim() || 'Your Restaurants';
    showAlert({
      title: 'Wine Selected',
      body: existing
        ? `${wine.name} has been recorded in Your Restaurants – ${place}. Your earlier review of it stays in Your Wine Reviews.`
        : `${wine.name} has been recorded in Your Restaurants – ${place}.`,
      showCloseX: true,
      buttons: [
        { text: 'Review it now', onPress: () => setChosenModalWine(wine) },
        { text: 'Later', style: 'cancel' },
      ],
    });

    // Optimistic chip flip, deferred a tick so its heavy re-render lands in a
    // separate commit from the alert. pendingIdxRef already blocks a double-tap.
    setTimeout(() => setChosenIndexes((prev) => new Set([...prev, i])), 0);

    try {
      // Save the SAME city the diner saw on the stamp (incl. the live GPS
      // reading), so the pick's location matches what was on screen.
      const cityValue = overrides?.city
        ?? cityOverride
        ?? (isFromHistory ? (historyCity ?? '') : (autoSave.data?.[0]?.city ?? liveCity ?? ''));
      // Resolve (or create) the visit's row BEFORE writing the pick, so the pick
      // is never saved unlinked because the background save hadn't landed yet.
      const sid = isFromHistory
        ? (sessionId ?? null)
        : await handleSaveRestaurant(currentRestaurant);
      const input = {
        // Carry a Vinster's Review already generated on this screen onto the
        // pick, so its review card reuses it instead of regenerating.
        wine: { ...wine, rationale: wine.rationale ?? reviewByIndex[i] ?? null },
        scanSessionId: sid,
        restaurantName: currentRestaurant,
        city: cityValue,
        tastingNote: '',
        otherObservations: '',
        userScore: null,
        listPrice: null,
        isFavourite: false,
      };
      // A wine reviewed before gets a new entry on that review (same group).
      const created = await saveChosen.mutateAsync(
        existing ? { ...input, reviewGroupId: existing.review_group_id } : input,
      );
      // Track this visit's pick so unselect deletes exactly it.
      if (created?.id) sessionPickIdRef.current.set(i, created.id);
    } catch (err) {
      // Roll back the optimistic selection so the chip reflects reality.
      setChosenIndexes((prev) => { const n = new Set(prev); n.delete(i); return n; });
      showAlert({ title: 'Could not save', body: errText(err) });
    } finally {
      pendingIdxRef.current.delete(i);
    }
  }

  // Unselect a List Bottle added on THIS scan — deletes the chosen_wine created
  // for this session (never a pre-existing review from another visit) and clears
  // the chip so the button flips back to "Add …".
  async function unselectBottle(wine: WineRecommendation, i: number) {
    if (pendingIdxRef.current.has(i)) return;
    pendingIdxRef.current.add(i);
    // Optimistic: clear the chip + the tracked pick immediately so the chip
    // flips to "Select This Wine" instantly (isSelectedNow reads both).
    const trackedId = sessionPickIdRef.current.get(i);
    setChosenIndexes((prev) => { const n = new Set(prev); n.delete(i); return n; });
    sessionPickIdRef.current.delete(i);
    const sid = currentSessionId();
    const identity = { producer: wine.producer, wineName: wine.name, vintage: wine.vintage };
    try {
      if (trackedId) {
        // We created this pick on this screen — delete exactly it, no guessing.
        await removeChosen.mutateAsync(trackedId);
      } else {
        // Fallback (e.g. a pick reconciled from a prior visit-in-progress): find
        // it, refetching once if the cache lags, and only remove a THIS-session
        // pick — never a prior occasion's review.
        let existing = findExistingReview(chosenWines, identity);
        if (!existing) {
          await qc.refetchQueries({ queryKey: ['chosen-wines', session?.user.id] });
          const fresh = (qc.getQueryData(['chosen-wines', session?.user.id]) as typeof chosenWines) ?? [];
          existing = findExistingReview(fresh, identity);
        }
        if (existing && sid && existing.scan_session_id === sid) {
          await removeChosen.mutateAsync(existing.id);
        }
      }
    } catch (err) {
      setChosenIndexes((prev) => new Set([...prev, i])); // rollback
      if (trackedId) sessionPickIdRef.current.set(i, trackedId);
      showAlert({ title: 'Could not remove', body: errText(err) });
    } finally {
      pendingIdxRef.current.delete(i);
    }
  }

  // A wine is selected if the chip flags it OR we created a pick for it on this
  // screen. The ref survives a chosen-wines cache / scan-session desync, so the
  // chip label and the tap routing stay correct even after opening then
  // discarding the review card (which previously left the chip reading
  // "unselected" → a re-tap wrongly re-selected instead of removing).
  const isSelectedNow = (i: number) => chosenIndexes.has(i) || sessionPickIdRef.current.has(i);

  // Restaurant-first prompt: capture name (+ location), persist it, then add
  // the pending bottle with those details threaded in (state isn't updated yet
  // this tick, so pass overrides directly).
  async function continueAfterRestaurant() {
    const name = promptRestaurant.trim();
    if (!name) { showAlert({ title: 'Restaurant needed', body: 'Please enter a restaurant name to continue.' }); return; }
    const cityVal = promptCity.trim();
    setRestaurantName(name);
    if (cityVal) setCityOverride(cityVal);
    setRestaurantPromptOpen(false);
    await handleSaveRestaurant(name);
    const target = pendingWine;
    setPendingWine(null);
    if (target) await handleQuickSelect(target.wine, target.i, { restaurant: name, city: cityVal || undefined });
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
        // Sample the WHOLE list (not just its first 80 rows), as the scan does.
        wines: sampleAcross(extractedWines, 80),
        ...preferences,
        excludeWines,
        currency: userPrefs?.defaultCurrency ?? 'GBP',
      });
      // Reset ALL per-index state before swapping in the new list — these maps
      // are keyed by array position, so without clearing them the new wine #0
      // would show the PREVIOUS pick's cached review + Wine-Searcher price/score,
      // keep a stale "Selected" chip, and (worst) let an unselect delete the old
      // wine's saved pick via a stale sessionPickIdRef. The reconcile/ws/review
      // effects repopulate correctly for the new wines once these are empty.
      setReviewByIndex({});
      setReviewLoading(new Set());
      setReviewFailed(new Set());
      setReviewUnknown(new Set());
      setWsByIndex({});
      setChosenIndexes(new Set());
      sessionPickIdRef.current.clear();
      pendingIdxRef.current.clear();
      if (!newRec.wines.length) {
        showAlert({ title: 'No other picks', body: "Vinster couldn't find a different set that fits your preferences — your current picks stay." });
        return;
      }
      setRecommendation(newRec);
      setOpenIndex(0);
      // Save the new picks against this scan, so reopening it (View Last Result,
      // Recent Scans) shows these rather than the first set.
      const sid = currentSessionId();
      if (sid) void saveScanRecommendation(session?.user.id ?? null, sid, newRec).catch(() => {});
    } catch (err) {
      // Keep the current picks, but say why nothing changed.
      const msg = err instanceof Error && /minute|too many|rate limit/i.test(err.message)
        ? err.message
        : "Vinster couldn't find alternative picks just now. Your current picks stay — please try again in a moment.";
      showAlert({ title: 'No alternatives yet', body: msg });
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    if (!recommendation) {
      router.dismissTo('/scan/wine-list');
    }
  }, [recommendation]);

  // Tap on a pick's price/score: Wine-Searcher's score and retail range. A
  // history re-open hasn't looked the picks up, so it looks this one up now.
  async function showWsInfo(i: number) {
    const wine = recommendation?.wines[i];
    if (!wine) return;
    let e: WsEnrich | null = wsByIndex[i] ?? null;
    if (!e && !isFromHistory && !wsChecked) {
      showAlert({ title: 'Wine-Searcher', body: 'Still checking Wine-Searcher for this wine — try again in a moment.' });
      return;
    }
    if (!e && isFromHistory) {
      e = await lookupWs(wine, wine.currency || userPrefs?.defaultCurrency || 'GBP').catch(() => null);
      if (e) setWsByIndex((m) => ({ ...m, [i]: e! }));
    }
    showAlert({ title: e?.criticScore != null ? 'Wine-Searcher' : 'Score', body: wsInfoBody(e, e?.criticScore != null ? null : vinsterCriticScore(wine)) });
  }

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

  // "No vintages on this list" is about the LIST, not the three picks (three
  // non-vintage Champagnes don't mean the list has no years).
  const listWines = extractedWines?.length ? extractedWines : recommendation.wines;
  const noVintages = listWines.every((w) => !w.vintage);

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
  const stampCity = cityOverride ?? historyCity ?? autoSave.data?.[0]?.city ?? liveCity;

  function toggleWine(i: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // The fetch is driven by the openIndex effect above, which covers both the
    // default-open wine and any tapped one.
    setOpenIndex(openIndex === i ? null : i);
  }

  // Fetch Vinster's Review for wine i on first expand. No-ops if it's already
  // present (older cached scans still carry rationale), already cached, or in
  // flight. A prior failure stored '' — that is retryable, so we re-fetch.
  async function ensureReview(i: number) {
    const wine = recommendation?.wines?.[i];
    if (!wine) return;
    // Fresh scans always generate on demand (deferred), even if the recommend
    // call happened to include an inline rationale — so the review is the last
    // thing to land and the results present quicker. History reuses the saved one.
    const alreadyHave = (isFromHistory && wine.rationale) || (reviewByIndex[i] && reviewByIndex[i].length > 0);
    if (alreadyHave || reviewUnknown.has(i) || reviewLoading.has(i)) return;
    setReviewLoading((prev) => new Set(prev).add(i));
    setReviewFailed((prev) => { const n = new Set(prev); n.delete(i); return n; });
    try {
      const review = await fetchVinsterReview({
        producer: wine.producer,
        wineName: wine.name,
        region: wine.region,
        appellation: wine.appellation,
        grape: wine.grape,
        vintage: wine.vintage,
      });
      if (review && typeof review === 'object') { // WINE_UNKNOWN
        setReviewUnknown((prev) => new Set(prev).add(i));
      } else if (review) {
        setReviewByIndex((prev) => ({ ...prev, [i]: review }));
      } else {
        // Failed (e.g. rate-limited) — flag it so the card offers a retry instead
        // of spinning forever.
        setReviewFailed((prev) => new Set(prev).add(i));
      }
    } catch {
      setReviewFailed((prev) => new Set(prev).add(i));
    } finally {
      setReviewLoading((prev) => { const n = new Set(prev); n.delete(i); return n; });
    }
  }

  // Retry a failed review fetch (from the "tap to try again" affordance).
  function retryReview(i: number) {
    setReviewFailed((prev) => { const n = new Set(prev); n.delete(i); return n; });
    void ensureReview(i);
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
          await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a wine list') });
          return;
        }
      }
      const lines = recommendation.wines.slice(0, 3).map((w, i) => {
        const rank = RANK_LABELS[i] ?? `#${i + 1}`;
        const vintage = w.vintage ? `${w.vintage} ` : '';
        // The same score shown beside the price on the card.
        const shown = wsByIndex[i]?.criticScore ?? vinsterCriticScore(w);
        const score = shown != null ? ` (${shown} pts)` : '';
        // Flavour profile on its own line, indented, so it reads as a
        // pull-quote about taste rather than an extension of the
        // header. Omitted when missing (older saved scans).
        const flavour = w.flavourProfile ? `\n   ${w.flavourProfile}` : '';
        return `${rank}: ${vintage}${w.name}${score}${flavour}`;
      });
      await Share.share({
        title: 'Vinster Recommends',
        message: `Vinster picked these wines for me:\n\n${lines.join('\n')}\n\nDownload Vinster — Real Wine Experience, AI Delivered.`,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: errText(err) });
    } finally {
      setSharing(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      bottomOffset={24}
    >

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text accessibilityLabel="Back" style={[styles.backLink, { color: colors.gold, fontSize: 22 }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.topRightCol}>
            <TouchableOpacity
              onPress={handleShare}
              disabled={sharing}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Text style={[styles.shareBtnText, sharing && { opacity: 0.5 }]}>
                {sharing ? 'Preparing…' : '+ Share Results'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.heading}>Vinster Recommends</Text>

        {stampDate ? (
          <View style={styles.stampRow}>
            <Text style={styles.stampDate}>{stampDate}</Text>
          </View>
        ) : null}

        {/* Restaurant line: pin · name · city. Empty, it's a tap-to-add prompt;
            once named (and the scan's row exists), tapping the name opens the
            restaurant review form. Read-only on a reopened scan. */}
        {isFromHistory ? (
          // Revisiting a saved scan → read-only line: view the venue/location, no edit.
          <View style={styles.restaurantLine}>
            <Text style={styles.restaurantPin}>📍</Text>
            <Text style={[styles.restaurantLineText, !restaurantName && styles.restaurantLinePlaceholder]} numberOfLines={1}>
              {restaurantName || stampCity || 'Wine list'}
            </Text>
            {restaurantName ? renderCity() : null}
          </View>
        ) : editingRestaurant ? (
          // Editing MUST be checked before the "session exists + has a name"
          // read-only branch below: typing the first character makes
          // restaurantName non-empty, and if that branch were first it would win
          // and unmount this focused TextInput mid-keystroke — the "screen trips
          // out after the first letter" bug. While editing, we always show the
          // input, regardless of the current value.
          <View style={styles.restaurantLine}>
            <Text style={styles.restaurantPin}>📍</Text>
            <TextInput
              style={styles.restaurantLineInput}
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Tap to add restaurant"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoFocus
              onBlur={() => handleSaveRestaurant()}
              onSubmitEditing={() => handleSaveRestaurant()}
              returnKeyType="done"
            />
            {renderCity()}
          </View>
        ) : effectiveSessionId && restaurantName.trim().length > 0 ? (
          <TouchableOpacity style={styles.restaurantLine} onPress={openRestaurantReview} activeOpacity={0.7}>
            <Text style={styles.restaurantPin}>📍</Text>
            <Text style={styles.restaurantLineText} numberOfLines={1}>
              {restaurantName}
            </Text>
            {renderCity()}
          </TouchableOpacity>
        ) : (
          <View style={styles.restaurantLine}>
            <Text style={styles.restaurantPin}>📍</Text>
            <TouchableOpacity
              onPress={() => setEditingRestaurant(true)}
              activeOpacity={0.7}
              style={styles.restaurantLineNameTap}
            >
              <Text
                style={[styles.restaurantLineText, !restaurantName && styles.restaurantLinePlaceholder]}
                numberOfLines={1}
              >
                {restaurantName || 'Tap to add restaurant'}
              </Text>
            </TouchableOpacity>
            {renderCity()}
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
          // The labelled parameter notes, always in the same order.
          // Value prefers REAL market data — the live Wine-Searcher average vs the
          // menu price — and falls back to a Vinster market estimate only when
          // Wine-Searcher has no match. Critic Score prefers Wine-Searcher's
          // aggregated score, falling back to a computed line. Vintage + Producer
          // reuse the assessment notes.
          // Real Wine-Searcher data for this pick, once it has loaded in.
          const wsE = wsByIndex[i];
          // The score beside the price is Wine-Searcher's. Once the lookup has
          // found none, Vinster's own critic reading stands in, tagged (VS);
          // tapping either explains where it comes from.
          const vinsterFallback = wsE?.criticScore == null && (wsChecked || isFromHistory)
            ? vinsterCriticScore(wine) : null;
          const headlineScore = wsE?.criticScore ?? vinsterFallback;
          const effRegion = wine.region || wsE?.region || null;
          const effGrape = wine.grape || wsE?.grape || null;
          // Price shown on the pick: the menu price when the list gave one, else
          // the live Wine-Searcher market average (flagged "avg") so a pick is
          // never priceless just because the menu omitted it or OCR missed it.
          const priceValue = wine.menuPrice != null ? wine.menuPrice
            : (wsE?.avgPrice != null ? Math.round(wsE.avgPrice) : null);
          const priceIsEstimate = wine.menuPrice == null && priceValue != null;
          const priceCurrency = wine.currency || wsE?.currency || userPrefs?.defaultCurrency;
          // The list price is for a magnum, half bottle etc. — say which.
          const priceSize = wine.menuPrice != null ? bottleFormatLabel(wine.format) : null;
          // Vinster's own words on the critics, plus how its reading compares
          // with the Wine-Searcher score shown beside the price.
          const criticComparisonText = wsE?.criticScore != null && wine.criticScore > 0
            ? criticComparison(wine.criticScore, wsE.criticScore) : null;
          const criticScoreText = [wine.criticScoreNote, criticComparisonText].filter(Boolean).join(' ') || null;
          // Value verdict: prefer REAL live Wine-Searcher market data (average vs
          // the menu price). Only when Wine-Searcher has no match for this wine
          // do we fall back to Vinster's own market estimate (framed as an
          // estimate in the copy), so an obscure bottle still gets a verdict.
          const valueText = wsE && wsE.avgPrice != null
            ? wsValueLine(wine.menuPrice, wsE.avgPrice, currencySymbol(wsE.currency), bottlesIn(wine.format))
            : (wine.valueNote ?? null);
          // With no vintage printed, the vintage note says little, but the
          // drinking-window guidance ("the year isn't listed, but…") still helps.
          const vintageText = !noVintages && wine.vintageAssessment
            ? [wine.vintageAssessment.notes, wine.drinkingWindow?.notes].filter(Boolean).join(' ')
            : (wine.drinkingWindow?.notes || null);
          const producerText = wine.rarityAssessment?.notes ?? null;
          // Top pick only — one synthesis line. Falls back to joining the
          // legacy topPickReasons until standoutNote ships.
          const standoutText = wine.standoutNote
            ?? (wine.topPickReasons?.length ? wine.topPickReasons.join(' · ') : null);
          // Identity header: Producer · Wine Name · Vintage (white), then Region
          // (gold) and Grape (gold) on their own lines — the app-wide format.
          const regionalPlacement = joinPlace(wine.appellation, effRegion);
          return (
            <PickReveal key={wine.name + i} delay={isFromHistory ? 0 : i * 450} style={styles.card}>
              <View style={styles.cardInner}>

                {/* Gold "Select This Wine" bar above the name — mirrors the
                    cellar stats bars. Records the pick in Your Restaurants
                    (prompting for a restaurant name first if none is set);
                    tap again to remove. Hidden when revisiting a saved scan
                    (read-only) — you view it, but can't re-select from it. */}
                {!isFromHistory && (
                  <TouchableOpacity
                    style={[styles.selectBar, isSelectedNow(i) && styles.selectBarDone]}
                    onPress={() => {
                      if (pendingIdxRef.current.has(i)) return;
                      void Haptics.selectionAsync().catch(() => {});
                      if (isSelectedNow(i)) { unselectBottle(wine, i); return; }
                      // Can't record a pick in Your Restaurants without a
                      // restaurant name — collect it (and location) first.
                      if (!restaurantName.trim()) {
                        setPendingWine({ wine, i });
                        setPromptRestaurant(restaurantName);
                        setPromptCity('');
                        setRestaurantPromptOpen(true);
                        return;
                      }
                      handleQuickSelect(wine, i);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectBarText, isSelectedNow(i) && styles.selectBarTextDone]}>
                      {isSelectedNow(i) ? 'Selected · Tap to Remove' : 'Select This Wine'}
                    </Text>
                    {!isSelectedNow(i) && (
                      <Text style={styles.selectBarSub}>Add to Your Reviews</Text>
                    )}
                  </TouchableOpacity>
                )}

                <WineIdentityHeader
                  producer={wine.producer}
                  wineName={wine.name}
                  vintage={wine.vintage}
                  region={regionalPlacement}
                  grape={effGrape}
                  align="center"
                  size="md"
                />

                {/* Price + Wine-Searcher score share one line beneath the
                    name (tap for the details). Either can be missing (some
                    lists omit the price, Wine-Searcher may have no score) —
                    the row renders only the present halves. */}
                {(priceValue != null || headlineScore != null) && (
                  <TouchableOpacity style={styles.priceScoreRow} onPress={() => void showWsInfo(i)} activeOpacity={0.7}>
                    {priceValue != null && (
                      <Text style={styles.priceScoreText}>
                        {currencySymbol(priceCurrency)}{priceValue}
                        {/* No menu price was read for this pick — this is the shop price. */}
                        {priceIsEstimate ? <Text style={styles.priceEstimateTag}> market avg</Text> : null}
                        {priceSize ? <Text style={styles.priceEstimateTag}> {priceSize}</Text> : null}
                      </Text>
                    )}
                    {priceValue != null && headlineScore != null && (
                      <Text style={styles.priceScoreDot}> · </Text>
                    )}
                    {headlineScore != null && (
                      <Text style={styles.priceScoreText}>
                        {headlineScore} pts
                        {vinsterFallback != null ? <Text style={styles.vinsterScoreTag}> (VS)</Text> : null}
                      </Text>
                    )}
                  </TouchableOpacity>
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

                {/* Alternative-list re-recommendation: Vinster deliberately
                    brought back a wine the diner already saw, and says why. */}
                {wine.repeatNote ? (
                  <View style={styles.repeatNotice}>
                    <Text style={styles.repeatText}>★ {wine.repeatNote}</Text>
                  </View>
                ) : null}

                {/* One gold synthesis line per wine (no bullet) — the "why this
                    one" hook (pairing + how it compares on this list), above the
                    four parameter notes. Shown for all three picks. */}
                {standoutText ? (
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

                {/* "Review Wine" is no longer a standalone button here — after
                    adding to Bottle Picks the success popup offers it, so a wine
                    is reviewed either right after selecting or later from Your
                    Restaurants → Bottle Picks (avoids the re-entry loop). */}

                {/* Vinster's Sommelier Note — collapsed by default. The
                    rationale is the longest prose block on the card, so
                    hiding it behind a tap keeps the page scannable while
                    leaving the full sommelier reasoning a tap away. */}
                <View style={styles.sommHeaderRow}>
                  <TouchableOpacity
                    style={styles.sommNoteToggle}
                    onPress={() => toggleWine(i)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sommNoteToggleText}>
                      Vinster's Review
                    </Text>
                    <Ionicons
                      name={sommOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                      size={16}
                      color={colors.gold}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => showAlert({ title: "What is Vinster's Review?", body: VINSTER_REVIEW_EXPLAINER })}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.whatsThisLink}>what's this</Text>
                  </TouchableOpacity>
                </View>
                {sommOpen && (() => {
                  // A FRESH scan always defers to the on-demand fetch so the
                  // results screen presents fast and the review reveals only once
                  // ready — never pre-baked. History scans reuse the saved rationale.
                  const reviewText = isFromHistory ? (wine.rationale || reviewByIndex[i]) : reviewByIndex[i];
                  if (reviewText) return <Text style={styles.sommNoteText}>{reviewText}</Text>;
                  if (reviewUnknown.has(i)) return <Text style={styles.sommLoadingText}>Vinster doesn't know this bottle well enough to describe it.</Text>;
                  // Failed (and not currently retrying) → offer a tap-to-retry
                  // rather than an endless spinner (the 429 / rate-limit case).
                  if (reviewFailed.has(i) && !reviewLoading.has(i)) {
                    return (
                      <TouchableOpacity onPress={() => retryReview(i)} activeOpacity={0.7}>
                        <Text style={styles.sommLoadingText}>Vinster's Review didn't generate just now — tap to try again.</Text>
                      </TouchableOpacity>
                    );
                  }
                  // Otherwise still generating — no scary error, just "Generating".
                  return (
                    <View style={styles.sommLoadingRow}>
                      <ActivityIndicator color={colors.gold} />
                      <Text style={styles.sommLoadingText}>Generating Vinster's Review…</Text>
                    </View>
                  );
                })()}

              </View>
            </PickReveal>
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
        scanSessionId={effectiveSessionId}
        initialRestaurantName={isFromHistory ? (historyRestaurant ?? null) : (restaurantName || null)}
        initialCity={isFromHistory ? (historyCity ?? null) : (cityOverride ?? autoSave.data?.[0]?.city ?? liveCity ?? null)}
        onClose={() => setChosenModalWine(null)}
        onSaved={() => {
          const idx = recommendation!.wines.indexOf(chosenModalWine!);
          if (idx !== -1) setChosenIndexes((prev) => new Set([...prev, idx]));
          setChosenModalWine(null);
        }}
      />

      {/* "Add a restaurant first" — the List-Bottle button needs a restaurant
          name to save against, so collect it (and location) inline here. */}
      <Modal visible={restaurantPromptOpen} transparent animationType="fade" onRequestClose={() => setRestaurantPromptOpen(false)}>
        <View style={styles.promptOverlay}>
          <View style={styles.promptSheet}>
            <TouchableOpacity style={styles.promptCloseX} onPress={() => setRestaurantPromptOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.promptCloseXText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.promptTitle}>Add a restaurant</Text>
            <Text style={styles.promptBody}>Please input a restaurant before you can continue to save a bottle to Your Restaurants.</Text>
            <Text style={styles.promptLabel}>Restaurant Name</Text>
            <TextInput style={styles.promptInput} value={promptRestaurant} onChangeText={setPromptRestaurant} placeholder="Restaurant name" placeholderTextColor={colors.textMuted} autoFocus />
            <Text style={styles.promptLabel}>Location</Text>
            <TextInput style={styles.promptInput} value={promptCity} onChangeText={setPromptCity} placeholder="City or location" placeholderTextColor={colors.textMuted} />
            <TouchableOpacity style={styles.promptContinueBtn} onPress={continueAfterRestaurant} activeOpacity={0.85}>
              <Text style={styles.promptContinueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Restaurant review form — opened from the restaurant line. Pre-filled
          from the saved visit when there is one. */}
      {restaurantReviewOpen ? (() => {
        const item = reviewSessionId ? (archive.find((a) => a.id === reviewSessionId) ?? null) : null;
        // The wines recorded on this visit — picks from this list and bottles
        // added in the form — oldest first, as on Your Restaurant Reviews.
        const visitWines = reviewSessionId
          ? chosenWines
            .filter((cw) => cw.scan_session_id === reviewSessionId)
            .sort((a, b) => new Date(a.chosen_at).getTime() - new Date(b.chosen_at).getTime())
          : [];
        // Close the form for another screen; it reopens when this one regains focus.
        const leaveForm = () => { resumeReviewOnFocusRef.current = true; setRestaurantReviewOpen(false); };
        // Save before leaving; on failure say so and keep the form open.
        const saveDraftOrSay = async (saveDraft: () => Promise<void>) => {
          try { await saveDraft(); return true; }
          catch (err) { showAlert({ title: 'Could not save your review', body: err instanceof Error ? err.message : 'Please try again.' }); return false; }
        };
        return (
          <RestaurantReviewModal
            visible={restaurantReviewOpen}
            sessionId={reviewSessionId ?? ''}
            sessionError={reviewSessionError}
            onRetrySession={() => { void resolveReviewSession(); }}
            initialName={restaurantName || item?.restaurantName || null}
            initialNote={item?.restaurantNote ?? null}
            initialRatings={item ? { food: item.ratingFood, service: item.ratingService, wineList: item.ratingWineList, overall: item.ratingOverall, value: item.ratingValue, atmosphere: item.ratingAtmosphere, glassware: item.ratingGlassware } : null}
            initialFavourite={item?.isFavourite ?? false}
            city={stampCity}
            date={stampDate}
            capturedAt={item?.capturedAt ?? null}
            restaurantPhotoPath={item?.restaurantPhotoPath ?? null}
            wines={visitWines.map((cw) => ({
              producer: cw.producer,
              wineName: cw.wine_name,
              vintage: cw.vintage,
              userScore: cw.user_score,
              source: cw.source,
            }))}
            // Wine reviews live in Your Wine Reviews; Back from there returns here.
            onReviewWine={(idx) => {
              const cw = visitWines[idx];
              if (!cw) return;
              leaveForm();
              const backTo = encodeURIComponent(resultsHref());
              setTimeout(() => router.push(`/wines/chosen?openReview=${cw.id}&backTo=${backTo}` as any), DISMISS_DELAY_MS);
            }}
            onOpenLineup={async (lineupId, saveDraft, name, city) => {
              if (!(await saveDraftOrSay(saveDraft))) return;
              // The form reopens from this screen's state, so carry the edits.
              if (name) setRestaurantName(name);
              setCityOverride(city || null);
              leaveForm();
              setTimeout(() => router.push(`/cellar/lineup/${lineupId}` as any), DISMISS_DELAY_MS);
            }}
            onAddLineup={async (upload, name, city, saveDraft) => {
              const sid = reviewSessionId ?? (await getOrCreateSession());
              if (!sid) return; // getOrCreateSession has already said why
              if (!(await saveDraftOrSay(saveDraft))) return;
              // The form reopens from this screen's state, so carry the edits.
              if (name) setRestaurantName(name);
              setCityOverride(city || null);
              leaveForm();
              setTimeout(() => router.push(lineupForVisitHref({
                sessionId: sid,
                venue: name || restaurantName || null,
                city: city || stampCity || null,
                capturedAt: item?.capturedAt ?? stampDateSource,
                upload,
              }) as any), DISMISS_DELAY_MS);
            }}
            onAddPhoto={async (name, city, saveDraft) => {
              const sid = reviewSessionId ?? (await getOrCreateSession());
              if (!sid) return; // getOrCreateSession has already said why
              attachRestaurantPhoto.present({
                sessionId: sid,
                restaurant: name || null,
                city: city || null,
                hasPhoto: !!item?.restaurantPhotoPath,
                leaveModal: async () => {
                  // The draft saves in the background so the photo search opens
                  // at once; the form reopens from this screen's state, so carry
                  // the edits.
                  const saving = saveDraft();
                  if (name) setRestaurantName(name);
                  setCityOverride(city || null);
                  leaveForm();
                  saving.catch((err) => showAlert({ title: 'Could not save your review', body: err instanceof Error ? err.message : 'Please try again.' }));
                },
              });
            }}
            onClose={() => setRestaurantReviewOpen(false)}
            onSaved={(details) => {
              setRestaurantReviewOpen(false);
              if (details) {
                if (details.name != null) setRestaurantName(details.name);
                setCityOverride(details.city);
              }
              qc.invalidateQueries({ queryKey: ['scan-archive'] });
            }}
          />
        );
      })() : null}

      {/* Off-screen share card. Positioned out of view; captured to a
          PNG when the user taps Share so the system share sheet gets a
          designed, branded image to hand to WhatsApp / Instagram / etc. */}
      <View style={styles.shareCardWrap} pointerEvents="none">
        <WineListShareCard
          ref={shareCardRef}
          wines={recommendation.wines.map((w, i) => ({ ...w, criticScore: wsByIndex[i]?.criticScore ?? vinsterCriticScore(w) ?? 0 }))}
          date={stampDate}
          restaurant={stampRestaurant}
          city={stampCity}
          currency={userPrefs?.defaultCurrency}
        />
      </View>

    </KeyboardAwareScrollView>
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
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  topRightCol: { alignItems: 'flex-end', gap: spacing.xs },
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
    color: '#FFFFFF',
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
    // Match the venue name's font so the venue · location line reads as one.
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    color: colors.text,
  },
  // Wraps the restaurant name so it can shrink while the (separately tappable)
  // city stays visible on the same line.
  restaurantLineNameTap: {
    flexShrink: 1,
  },
  // Inline city editor — mirrors restaurantLineInput but narrower.
  cityLineInput: {
    // Same font as the venue input so both fields on the stamp line match.
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.30)',
    minWidth: 90,
    paddingVertical: 2,
  },
  heading: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
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
  // "(VS)" after a Vinster Score standing in for a missing Wine-Searcher one.
  vinsterScoreTag: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    color: colors.gold,
  },
  // "avg" marker when the shown price is a market estimate, not the menu price.
  priceEstimateTag: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
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

  // Long primary CTA — Add to Your Bottle Picks. Sits below the
  // two-button row as the headline action on each card.
  // "Select This Wine" bar — a gold band at the top of the card, above the
  // name, mirroring the cellar stats bars.
  selectBar: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: 2,
    marginBottom: spacing.sm,
    // Bubble: our deep-brown outline, faded-terracotta fill.
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.surfaceElevated,
    backgroundColor: 'rgba(127,79,76,0.30)',
  },
  selectBarDone: {
    backgroundColor: 'rgba(127,79,76,0.48)',
  },
  selectBarText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectBarTextDone: {
    color: colors.gold,
  },
  // Second line in the select bar — smaller, explains what selecting does.
  selectBarSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 0.3,
    marginTop: 2,
    opacity: 0.85,
  },
  // "Add a restaurant first" prompt.
  promptOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  promptSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  promptCloseX: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10, padding: 4 },
  promptCloseXText: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.textMuted },
  promptTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  promptBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: spacing.lg },
  promptLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  promptInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  promptContinueBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  promptContinueText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Sommelier note expand toggle — collapsed by default, label + chevron.
  // Row holding the Vinster's Review toggle + the "(what's this)" link.
  sommHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sommNoteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  whatsThisLink: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'underline',
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
  sommLoadingRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sommLoadingText: {
    fontFamily: fonts.bodyItalic,
    fontSize: 14,
    color: colors.textMuted,
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
  // A deliberate re-recommendation on an alternative list — a positive
  // endorsement, so a filled gold band rather than the muted "outside" notice.
  repeatNotice: {
    backgroundColor: 'rgba(212,176,96,0.18)',
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  repeatText: {
    fontFamily: fonts.bodySemibold,
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
