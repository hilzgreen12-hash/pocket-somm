import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Share, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../../src/utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { clearChosenReview } from '../../src/api/chosenWines';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { EditChosenWineModal } from '../../src/components/EditChosenWineModal';
import { EditCellarReviewModal } from '../../src/components/EditCellarReviewModal';
import { AddChosenWineModal } from '../../src/components/AddChosenWineModal';
import { showAlert } from '../../src/components/AppAlert';
import { ShareIcon } from '../../src/components/ShareIcon';
import { WineReviewShareCard } from '../../src/components/WineReviewShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { LabelThumb } from '../../src/components/LabelThumb';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { normaliseCity } from '../../src/utils/city';
import { splitLocationString } from '../../src/services/reviewSync';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { ChosenWine, CellarWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Mic + Camera marks drawn in the same hand-drawn gold-outline style as the
// home-screen tile motifs (List / Chef / Cellar / Community) — bordered Views,
// no image assets.
function MicMotif() {
  return (
    <View style={motifStyles.micStack}>
      <View style={motifStyles.micHead} />
      <View style={motifStyles.micStem} />
      <View style={motifStyles.micBase} />
    </View>
  );
}

function CameraMotif() {
  return (
    <View style={motifStyles.cameraBody}>
      <View style={motifStyles.cameraBump} />
      <View style={motifStyles.cameraLens} />
    </View>
  );
}

function PencilMotif() {
  return (
    <View style={motifStyles.pencilStack}>
      <View style={motifStyles.pencilBody} />
      <View style={motifStyles.pencilTip} />
    </View>
  );
}

const motifStyles = StyleSheet.create({
  micStack: { alignItems: 'center' },
  micHead: { width: 13, height: 19, borderWidth: 1, borderColor: colors.gold, borderRadius: 6.5 },
  micStem: { width: 1.5, height: 5, backgroundColor: colors.gold },
  micBase: { width: 14, height: 1.5, backgroundColor: colors.gold, borderRadius: 1 },
  cameraBody: { width: 30, height: 22, borderWidth: 1, borderColor: colors.gold, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  cameraBump: { position: 'absolute', top: -4, alignSelf: 'center', width: 10, height: 4, borderWidth: 1, borderColor: colors.gold, borderBottomWidth: 0, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  cameraLens: { width: 11, height: 11, borderWidth: 1, borderColor: colors.gold, borderRadius: 5.5 },
  pencilStack: { alignItems: 'center' },
  pencilBody: { width: 9, height: 15, borderWidth: 1, borderColor: colors.gold, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderBottomWidth: 0 },
  pencilTip: { width: 0, height: 0, borderLeftWidth: 4.5, borderRightWidth: 4.5, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.gold },
});

// A chosen wine counts as "reviewed" once it carries any review content —
// a tasting note, personal notes, or a score. Bare bottle picks (added via
// List → "Add to Bottle Picks") have none of these and live only in You ·
// Your Restaurants until the user reviews them.
function chosenHasReview(wine: ChosenWine): boolean {
  return !!(
    (wine.tasting_note && wine.tasting_note.trim()) ||
    (wine.other_observations && wine.other_observations.trim()) ||
    wine.user_score != null
  );
}

function locationLine(wine: ChosenWine): string {
  // City normalised on read so legacy rows saved as "Greater London"
  // (UK reverse-geocode subregion) render as "London" without needing
  // a backfill migration. New writes go in canonical via normaliseCity
  // at the save sites — see ChosenWineModal etc.
  const parts = [wine.restaurant_name, normaliseCity(wine.city)].filter(Boolean);
  return parts.join(', ');
}

function formatListPrice(wine: ChosenWine): string | null {
  if (wine.menu_price == null) return null;
  const cur = (wine.currency ?? 'GBP').toUpperCase();
  const map: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', JPY: '¥', CHF: 'Fr', HKD: 'HK$', SGD: 'S$' };
  const sym = map[cur] ?? `${cur} `;
  return `${sym}${wine.menu_price}`;
}

function normKey(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

// Identity key for cross-referencing a review against wishlist/cellar
// rows — producer + name + vintage, normalised. Mirrors the matching
// used by reviewSync.
function wineIdentityKey(
  producer: string | null | undefined,
  wineName: string | null | undefined,
  vintage: string | number | null | undefined,
): string {
  return `${normKey(producer)}|${normKey(wineName)}|${normKey(vintage != null ? String(vintage) : '')}`;
}

// Source discriminator drives the Type filter chip. 'restaurant' and
// 'other' both live on chosen_wines and are distinguished by the
// `source` column (migration 042); 'cellar' is derived from any
// cellar_wines row with user review content.
type ReviewItem =
  | { source: 'restaurant'; date: string; score: number | null; wine: ChosenWine }
  | { source: 'other';      date: string; score: number | null; wine: ChosenWine }
  | { source: 'cellar';     date: string; score: number | null; wine: CellarWine };

export default function ChosenWinesScreen() {
  const { chosenWines, isLoading, remove } = useChosenWines();
  const { wines: cellarWines, updateWine } = useCellar();
  const qc = useQueryClient();
  const { setImage, setWineDetails, setError } = useLabelStore();
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);
  const [editingCellarWine, setEditingCellarWine] = useState<CellarWine | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  // OCR pre-fill for the Add-a-Review modal when the user came via Scan/Upload
  // (null for Manual Input). Keeps all three on the same review input screen.
  const [addInitial, setAddInitial] = useState<{ producer?: string | null; wineName?: string | null; vintage?: string | number | null; region?: string | null } | null>(null);
  // Local uri of a scanned/uploaded label, retained through the Add-a-Review
  // modal so the new review can carry its label photo (Part 3). Null for Manual.
  const [pendingReviewLabelUri, setPendingReviewLabelUri] = useState<string | null>(null);
  // "+ Add" opens a chooser first — Scan / Upload / Manual — then the
  // chosen path takes over (manual reuses the existing AddChosenWineModal;
  // scan + upload feed into the label flow with context=reviews).
  const [chooserOpen, setChooserOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Filter / sort state — mirrors the Full Cellar List pattern: one
  // chip per filter dimension, each opens a modal dropdown with the
  // available options. Sort is gold-bordered to mark it as the most
  // common interaction. Default sort is "Recently added" (the previous
  // 'date' option, renamed for consistency with Full Cellar List).
  type SortMode = 'recent' | 'score-desc' | 'score-asc';
  type TypeFilter = 'all' | 'cellar' | 'restaurant' | 'wishlist' | 'other';
  type FilterField = 'sort' | 'type' | 'location' | 'favourite' | null;
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [favouriteFilter, setFavouriteFilter] = useState<'all' | 'fav'>('all');
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [search, setSearch] = useState('');

  // Cellar wines that have ANY user-supplied review content count as a
  // "cellar review".
  const cellarReviews = cellarWines.filter((w) =>
    (w.user_notes && w.user_notes.trim().length > 0) ||
    w.review_score != null ||
    (w.review_location && w.review_location.trim().length > 0) ||
    !!w.review_date
  );

  const items: ReviewItem[] = [
    // The `source` column on chosen_wines (migration 042) drives the
    // restaurant-vs-other split here. Legacy rows default to
    // 'restaurant'; the "Review without adding" path tags 'other'.
    ...chosenWines.map((w): ReviewItem => ({
      source: w.source === 'other' ? 'other' : 'restaurant',
      date: w.chosen_at,
      score: w.user_score,
      wine: w,
    })),
    ...cellarReviews.map((w): ReviewItem => ({ source: 'cellar', date: w.review_date ?? w.created_at, score: w.review_score, wine: w })),
  ];

  // Restaurant bottle picks the user has NOT yet reviewed — these are excluded
  // from the main reviews list (they live in Your Restaurants until reviewed),
  // and surface in the "Bottle Picks Awaiting Review" section + the on-open prompt.
  const awaitingReview = chosenWines.filter((w) => !chosenHasReview(w));

  // One-time, dismissible prompt nudging the user to review a waiting pick.
  const { session } = useAuth();
  const promptKey = `vinster-bottle-pick-prompt-dismissed:${session?.user.id ?? 'anon'}`;
  const [reviewPrompt, setReviewPrompt] = useState<ChosenWine | null>(null);
  const [dontShowPrompt, setDontShowPrompt] = useState(false);
  const promptShownRef = useRef(false);
  // Deep-link params from Your Label Library's click-into-a-label popup (see
  // below). Read up here so the on-open review nudge can bow out when we've
  // arrived to open/create a specific review rather than for a plain visit.
  const params = useLocalSearchParams<{ openReview?: string; seedAdd?: string; sp?: string; sw?: string; sv?: string; sr?: string }>();
  const cameViaLabelLink = !!params.openReview || params.seedAdd === '1';
  useEffect(() => {
    if (promptShownRef.current || isLoading || awaitingReview.length === 0) return;
    // Don't nudge when arriving from the Label Library to view/create a review —
    // that prompt is only for a plain visit to Your Wine Reviews.
    if (cameViaLabelLink) { promptShownRef.current = true; return; }
    promptShownRef.current = true;
    const first = awaitingReview[0];
    AsyncStorage.getItem(promptKey)
      .then((dismissed) => { if (!dismissed) setReviewPrompt(first); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, awaitingReview.length]);

  async function resolvePrompt(review: boolean) {
    const wine = reviewPrompt;
    setReviewPrompt(null);
    if (review && wine) setEditingWine(wine);
  }

  // Deep-link params (declared above) from Your Label Library's click-into-a-
  // label popup:
  //   ?openReview=<id>          → open that review for viewing/editing
  //   ?seedAdd=1&sp&sw&sv&sr    → open a fresh review seeded with the identity
  // Handled once per distinct param set so re-renders don't reopen the modal.
  const handledParamRef = useRef<string | null>(null);
  useEffect(() => {
    if (params.openReview) {
      const key = `open:${params.openReview}`;
      if (handledParamRef.current === key) return;
      const match = chosenWines.find((w) => w.id === params.openReview);
      if (match) { handledParamRef.current = key; setEditingWine(match); }
      return;
    }
    if (params.seedAdd === '1') {
      const key = `add:${params.sp}|${params.sw}|${params.sv}`;
      if (handledParamRef.current === key) return;
      handledParamRef.current = key;
      setAddInitial({ producer: params.sp || null, wineName: params.sw || null, vintage: params.sv || null, region: params.sr || null });
      setPendingReviewLabelUri(null);
      setAddOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.openReview, params.seedAdd, params.sp, params.sw, params.sv, params.sr, chosenWines]);

  // "Don't show me this again" — a direct action (no tick box): opt out
  // permanently and dismiss.
  async function dontShowPromptForever() {
    try { await AsyncStorage.setItem(promptKey, '1'); } catch { /* non-fatal */ }
    setReviewPrompt(null);
  }

  // Wish-list is a review-level flag on chosen_wines only — cellar-source
  // reviews are never wish-list.
  function isWishlist(item: ReviewItem): boolean {
    return item.source !== 'cellar' && !!(item.wine as ChosenWine).wishlist;
  }

  // Canonical city for a review so every review type can feed the Location
  // filter. Restaurant / off-list reviews carry a clean chosen_wines.city;
  // cellar reviews keep a free-form review_location ("Restaurant, City" — or
  // just a place), so parse the city out of it (falling back to the whole
  // string when there's no comma).
  function cityFor(item: ReviewItem): string {
    if (item.source === 'cellar') {
      const loc = (item.wine as CellarWine).review_location ?? '';
      const { city } = splitLocationString(loc);
      return normaliseCity(city || loc);
    }
    return normaliseCity((item.wine as ChosenWine).city);
  }

  // Cities surfaced by the Location chip — every city that appears on a shown
  // review (bare, unreviewed picks live in Your Restaurants, so skip them),
  // normalised + de-duplicated.
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      if ((it.source === 'restaurant' || it.source === 'other') && !chosenHasReview(it.wine as ChosenWine)) continue;
      const c = cityFor(it);
      if (c) set.add(c);
    }
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    // items is a derived array — listing it as a dep is fine, useMemo
    // will recompute when chosenWines / cellarReviews change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenWines, cellarReviews]);

  // Apply filters. Search is applied last so the chips still own the
  // visible "shape" — typing a query just narrows whatever filters
  // are on, matching Full Cellar List's behaviour.
  const q = search.trim().toLowerCase();
  const filtered = items.filter((it) => {
    if (typeFilter === 'wishlist') {
      if (!isWishlist(it)) return false;
    } else if (typeFilter === 'all') {
      // Bare bottle picks (no written review) — List or Off-List — live only in
      // You · Your Restaurants. A pick that's since been reviewed still belongs
      // here. (Wish-listed picks stay reachable via the Wish List slice above.)
      if ((it.source === 'restaurant' || it.source === 'other') && !chosenHasReview(it.wine as ChosenWine)) return false;
    } else if (typeFilter === 'restaurant') {
      // Restaurant Wines slice — both List Bottles ('restaurant') and Off-List
      // Bottles ('other'), and only those actually reviewed (bare picks stay in
      // Your Restaurants).
      if (it.source !== 'restaurant' && it.source !== 'other') return false;
      if (!chosenHasReview(it.wine as ChosenWine)) return false;
    } else if (it.source !== typeFilter) {
      return false;
    }
    if (locationFilter !== 'All' && cityFor(it) !== locationFilter) return false;
    if (favouriteFilter === 'fav' && !(it.wine as { is_favourite?: boolean }).is_favourite) return false;
    if (q) {
      const w = it.wine as { producer?: string | null; wine_name?: string | null; region?: string | null; grape_variety?: string | null; vintage?: string | number | null };
      const hay = [w.producer, w.wine_name, w.region, w.grape_variety, w.vintage != null ? String(w.vintage) : null]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Sort. Score-asc and score-desc both push score-less rows to the
  // bottom (they're not interesting in either direction). Recent uses
  // the unified `date` (chosen_at for restaurant, review_date /
  // created_at for cellar — set when items[] is built).
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'score-desc' || sortMode === 'score-asc') {
      const ar = a.score;
      const br = b.score;
      const aMissing = ar == null;
      const bMissing = br == null;
      if (aMissing !== bMissing) return aMissing ? 1 : -1;
      if (ar != null && br != null && ar !== br) {
        return sortMode === 'score-desc' ? br - ar : ar - br;
      }
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Labels surfaced inside each chip's value line.
  const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: 'recent',     label: 'Recently added (default)' },
    { value: 'score-desc', label: 'Descending score' },
    { value: 'score-asc',  label: 'Ascending score' },
  ];
  // "Portfolio" — which slice of the user's reviews to show. Absorbs the old
  // standalone Wish List filter as the "Wish List Wines" option.
  const PORTFOLIO_OPTIONS: { value: TypeFilter; label: string }[] = [
    { value: 'all',        label: 'All Reviews' },
    { value: 'cellar',     label: 'Cellar Wines' },
    // Restaurant Wines = wines reviewed at a restaurant — both List Bottles
    // (source 'restaurant', chosen off the list) and Off-List Bottles (source
    // 'other', brought to the visit). Bare picks with no review stay in Your
    // Restaurants and are filtered out below.
    { value: 'restaurant', label: 'Restaurant Wines' },
    { value: 'wishlist',   label: 'Wish List Wines' },
  ];
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? 'Recently added (default)';
  const portfolioLabel = PORTFOLIO_OPTIONS.find((o) => o.value === typeFilter)?.label ?? 'All Reviews';
  const yourScoreLabel = (sortMode === 'score-desc' || sortMode === 'score-asc') ? sortLabel : 'Any';
  const locationLabel = locationFilter === 'All' ? 'All' : locationFilter;
  const favouriteLabel = favouriteFilter === 'fav' ? 'Favourites' : 'All';

  // Build the dropdown config for whichever chip the user tapped.
  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'sort') return { title: 'Your Score', options: SORT_OPTIONS, selected: sortMode, onSelect: (v) => setSortMode(v as SortMode) };
    if (field === 'type') return { title: 'Collection', options: PORTFOLIO_OPTIONS, selected: typeFilter, onSelect: (v) => setTypeFilter(v as TypeFilter) };
    if (field === 'favourite') return {
      title: 'Favourites',
      options: [{ value: 'all', label: 'All reviews' }, { value: 'fav', label: 'View Favourites' }],
      selected: favouriteFilter,
      onSelect: (v) => setFavouriteFilter(v as 'all' | 'fav'),
    };
    if (field === 'location') {
      return {
        title: 'Filter by city',
        options: availableCities.map((c) => ({ value: c, label: c === 'All' ? 'All cities' : c })),
        selected: locationFilter,
        onSelect: setLocationFilter,
      };
    }
    return null;
  }
  const activeDropdown = dropdownConfig(openDropdown);

  // A review's wine may also live in the wishlist or cellar. Match by
  // identity so each card can note when it was added there. date_received
  // is the user-set acquisition date; fall back to created_at when blank.
  const cellarByIdentity = new Map(
    cellarWines.map((w) => [wineIdentityKey(w.producer, w.wine_name, w.vintage), w] as const),
  );
  function addedNote(item: ReviewItem): { kind: 'cellar'; date: string } | null {
    if (item.source === 'cellar') {
      return { kind: 'cellar', date: item.wine.date_received ?? item.wine.created_at };
    }
    const key = wineIdentityKey(item.wine.producer, item.wine.wine_name, item.wine.vintage);
    const cellarMatch = cellarByIdentity.get(key);
    if (cellarMatch) return { kind: 'cellar', date: cellarMatch.date_received ?? cellarMatch.created_at };
    return null;
  }

  // Label photo for a review card, shown like a cellar wine card. Cellar
  // reviews carry it directly; chosen reviews use their own captured photo
  // (migration 067) and fall back to a matching cellar wine's photo by
  // identity. Null → the card stays text-only (no empty frame).
  function labelPathFor(item: ReviewItem): string | null {
    if (item.source === 'cellar') return (item.wine as CellarWine).label_image_path ?? null;
    const own = (item.wine as ChosenWine).label_image_path;
    if (own) return own;
    const key = wineIdentityKey(item.wine.producer, item.wine.wine_name, item.wine.vintage);
    return cellarByIdentity.get(key)?.label_image_path ?? null;
  }

  // Long-press a review to delete it. A restaurant review is its own
  // chosen_wines row, so it's deleted outright. A cellar review lives on
  // the cellar_wines row, so we only clear the review fields — the bottle
  // stays in the cellar.
  function handleLongPressReview(item: ReviewItem) {
    const w = item.wine;
    const label = wineHeaderLine(w.producer, w.wine_name, w.vintage);
    const onError = (err: unknown) => showAlert({
      title: 'Could not delete',
      body: err instanceof Error ? err.message : 'Please try again.',
    });
    const isCellar = item.source === 'cellar';
    // A restaurant bottle pick (linked to a scan session) returns to "awaiting
    // review" — clear its review, keep the pick. A standalone review is removed.
    const isBottlePick = !isCellar && !!(item.wine as ChosenWine).scan_session_id;
    showAlert({
      title: 'Delete review?',
      body: isCellar
        ? `${label}\n\nThis clears your review — the bottle stays in your cellar.`
        : isBottlePick
          ? `${label}\n\nThis clears your review — the bottle stays in Your Restaurants, awaiting review.`
          : `${label}\n\nThis permanently removes your review.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete review',
          style: 'destructive',
          onPress: () => {
            if (isCellar) {
              updateWine.mutate(
                {
                  id: item.wine.id,
                  updates: { user_notes: null, review_score: null, review_location: null, review_date: null },
                },
                { onError },
              );
            } else if (isBottlePick) {
              clearChosenReview(item.wine.id)
                .then(() => qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] }))
                .catch(onError);
            } else {
              remove.mutate(item.wine.id, { onError });
            }
          },
        },
      ],
    });
  }

  const hasAnything = items.length > 0;

  // Off-screen branded card used for review shares. Holds the props of
  // the review currently being shared; mounted only while a share is in
  // flight so we don't pay for layout work when nothing's queued.
  const reviewShareRef = useRef<View>(null);
  const [reviewSharing, setReviewSharing] = useState(false);
  // Scroll-to for the "awaiting review" summary link → the awaiting section.
  const listScrollRef = useRef<ScrollView>(null);
  const [awaitingY, setAwaitingY] = useState(0);
  const [reviewSharePayload, setReviewSharePayload] = useState<{
    producer: string | null;
    wineName: string;
    vintage: string | number | null;
    region: string | null;
    userScore: number | null;
    criticScore: number | null;
    tastingNote: string | null;
    otherObservations: string | null;
    date: string | null;
    location: string | null;
    isFavourite: boolean;
  } | null>(null);

  // Hand a review to the native share sheet as a branded PNG — mirrors
  // the WineListShareCard path used by List recommendations so the two
  // surfaces feel like one family. Falls back to the previous plain-
  // text share if capture or expo-sharing isn't available (older
  // devices, simulator without share support).
  async function handleShareReview(item: ReviewItem) {
    if (reviewSharing) return;
    const w = item.wine;
    // Both restaurant and other reviews live on chosen_wines, so they
    // share the same field shape for sharing. Only cellar splits off.
    const isChosen = item.source !== 'cellar';
    const cw = isChosen ? (w as ChosenWine) : null;
    const cellar = !isChosen ? (w as CellarWine) : null;

    const locText = isChosen
      ? locationLine(cw!)
      : (cellar!.review_location?.trim() ?? '');
    const tastingNote = isChosen
      ? cw!.tasting_note ?? ''
      : cellar!.user_notes ?? '';
    const otherObs = isChosen ? (cw!.other_observations ?? '') : '';
    const criticScore = isChosen ? cw!.critic_score : cellar!.critic_score;

    setReviewSharePayload({
      producer: w.producer,
      wineName: w.wine_name,
      vintage: w.vintage,
      region: w.region,
      userScore: item.score,
      criticScore,
      tastingNote,
      otherObservations: otherObs,
      date: formatDate(item.date),
      location: locText || null,
      isFavourite: !!(w as { is_favourite?: boolean }).is_favourite,
    });
    setReviewSharing(true);

    try {
      // One paint to let the off-screen card mount with the new props.
      await new Promise((r) => setTimeout(r, 250));
      if (reviewShareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(reviewShareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
        return;
      }
      // Plain-text fallback — same shape as the previous behaviour so
      // sharing still works on devices where capture / expo-sharing
      // isn't supported. The Get Vinster footer is always appended.
      const header = wineHeaderLine(w.producer, w.wine_name, w.vintage);
      const scoreText = item.score != null ? `\nMy score: ${item.score}/100` : '';
      const locFormatted = locText ? `\nWhere: ${locText}` : '';
      const noteFormatted = tastingNote.trim() ? `\n\n"${tastingNote.trim()}"` : '';
      await Share.share({
        message: `${header}${scoreText}${locFormatted}${noteFormatted}${VINSTER_TEXT_SHARE_FOOTER}`,
        title: header,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setReviewSharing(false);
      setReviewSharePayload(null);
    }
  }

  function handleChooseManual() {
    setChooserOpen(false);
    setAddInitial(null);
    setPendingReviewLabelUri(null);
    setAddOpen(true);
  }

  // Scan / Upload both OCR a label and then open the SAME Add-a-Review modal as
  // Manual (pre-filled) — no wine intel card, no /label detour.
  async function handleChooseScan() { setChooserOpen(false); void ocrThenReview('camera'); }
  async function handleChooseUpload() { setChooserOpen(false); void ocrThenReview('library'); }

  async function ocrThenReview(source: 'camera' | 'library') {
    try {
      if (!(await ensureMediaPermission(source))) return;
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const picked = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (picked.canceled || !picked.assets?.[0]) return;
      const uri = picked.assets[0].uri;
      let ocr: { producer?: string | null; wineName?: string | null; vintage?: string | number | null; region?: string | null } | null = null;
      setUploading(true);
      try {
        const base64 = await prepareImageBase64(uri);
        const details = await scanLabel(base64);
        ocr = { producer: details.producer, wineName: details.wineName, vintage: details.vintage, region: details.region };
      } catch {
        // OCR failed — still open the review input so the user can type it in.
        ocr = null;
      } finally {
        setUploading(false);
      }
      setAddInitial(ocr);
      setPendingReviewLabelUri(uri);
      // The scanned photo rides onto the review itself (AddChosenWineModal's
      // labelImageUri). It no longer ALSO spawns a Your Label Library row —
      // the label library (Scan Archive) is fed only by actual label scans,
      // so a review no longer duplicates the wine into it.
      setAddOpen(true);
    } catch (err) {
      showAlert({ title: 'Could not open photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  return (
    <View style={styles.container}>
      <EditChosenWineModal
        wine={editingWine}
        visible={!!editingWine}
        onClose={() => { setEditingWine(null); if (cameViaLabelLink) router.replace('/scan/archive'); }}
        onSaved={() => { setEditingWine(null); if (cameViaLabelLink) router.replace('/scan/archive'); }}
      />

      <EditCellarReviewModal
        wine={editingCellarWine}
        visible={!!editingCellarWine}
        onClose={() => setEditingCellarWine(null)}
        onSaved={() => setEditingCellarWine(null)}
      />

      <AddChosenWineModal
        visible={addOpen}
        initial={addInitial}
        labelImageUri={pendingReviewLabelUri}
        onClose={() => { setAddOpen(false); setAddInitial(null); setPendingReviewLabelUri(null); if (cameViaLabelLink) router.replace('/scan/archive'); }}
        onSaved={() => { setAddOpen(false); setAddInitial(null); setPendingReviewLabelUri(null); if (cameViaLabelLink) router.replace('/scan/archive'); }}
      />

      {/* "+ Add" chooser — Scan / Upload run the same label recognise+confirm
          pathway as an intel scan, but land on the review input (context=reviews)
          instead of the intel card. Manual opens the by-hand review form. */}
      <Modal visible={chooserOpen} transparent animationType="fade" onRequestClose={() => setChooserOpen(false)}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={() => setChooserOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>Add a wine review</Text>
            <Text style={styles.chooserBody}>Scan or upload a wine label and Vinster will identify the bottle, then take you straight to your review — or enter it by hand.</Text>
            <TouchableOpacity style={styles.chooserBtn} onPress={handleChooseScan} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={handleChooseUpload} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Upload A Wine Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={handleChooseManual} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Manual Input</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setChooserOpen(false)} style={styles.chooserCancel}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* On-open nudge to review a waiting restaurant bottle pick. */}
      <Modal visible={!!reviewPrompt} transparent animationType="fade" onRequestClose={() => setReviewPrompt(null)}>
        <View style={styles.promptOverlay}>
          <View style={styles.promptSheet}>
            <Text style={styles.promptTitle}>Wines you drank recently are awaiting your review</Text>
            {reviewPrompt ? (
              <Text style={styles.promptWineList}>{wineHeaderLine(reviewPrompt.producer, reviewPrompt.wine_name, reviewPrompt.vintage)}</Text>
            ) : null}
            <TouchableOpacity style={styles.promptReviewBtnFull} onPress={() => resolvePrompt(true)} activeOpacity={0.85}>
              <Text style={styles.promptReviewText}>Review Wine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.promptDontShow} onPress={dontShowPromptForever} activeOpacity={0.7}>
              <Text style={styles.promptDontShowText}>Don't show me this again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

{/* Fullscreen overlay while the chosen photo is being read. Sits
          above the screen so the user can't tap "+ Add" again mid-scan. */}
      {uploading ? (
        <View style={styles.uploadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.uploadingText}>Reading the label…</Text>
        </View>
      ) : null}

      {/* Off-screen branded share card. Mounted only while a share is
          in flight so its layout work doesn't sit idle in the tree. */}
      {reviewSharePayload && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <WineReviewShareCard
            ref={reviewShareRef}
            producer={reviewSharePayload.producer}
            wineName={reviewSharePayload.wineName}
            vintage={reviewSharePayload.vintage}
            region={reviewSharePayload.region}
            userScore={reviewSharePayload.userScore}
            criticScore={reviewSharePayload.criticScore}
            tastingNote={reviewSharePayload.tastingNote}
            otherObservations={reviewSharePayload.otherObservations}
            date={reviewSharePayload.date}
            location={reviewSharePayload.location}
            isFavourite={reviewSharePayload.isFavourite}
          />
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Wine Reviews</Text>
        <TouchableOpacity
          onPress={() => setChooserOpen(true)}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        >
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? null : !hasAnything ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>
            When you review a wine from a Vinster recommendation, it's saved here — or tap + Add at the top to enter one by hand. The reviews you write on your cellar wines appear here too.
          </Text>
        </View>
      ) : (
        <>
          {/* Summary + filter chips + search — mirrors Full Cellar List
              so the two screens read the same way. Chip lineup (left to
              right): Sort (gold-bordered, most common interaction) /
              Type (cellar vs restaurant) / Favourites / Location. */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {(() => {
                const wineKeys = new Set(filtered.map((it) => {
                  const w = it.wine as { producer?: string | null; wine_name?: string | null; vintage?: string | number | null };
                  return `${(w.producer ?? '').toLowerCase()}|${(w.wine_name ?? '').toLowerCase()}|${w.vintage ?? ''}`;
                }));
                const r = filtered.length, n = wineKeys.size;
                return `${r} ${r === 1 ? 'Review' : 'Reviews'} · ${n} ${n === 1 ? 'Wine' : 'Wines'}`;
              })()}
            </Text>
            <TouchableOpacity
              onPress={() => { if (awaitingReview.length > 0) listScrollRef.current?.scrollTo({ y: Math.max(0, awaitingY - 12), animated: true }); }}
              disabled={awaitingReview.length === 0}
              activeOpacity={0.7}
            >
              <Text style={[styles.summaryText, awaitingReview.length > 0 && styles.summaryLink]}>
                {awaitingReview.length} {awaitingReview.length === 1 ? 'wine' : 'wines'} awaiting your review
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.filterHint}>Listed by {sortMode === 'recent' ? 'recency' : sortLabel} · Swipe to see all filters →</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity style={[styles.filterChip, styles.filterChipSort]} onPress={() => setOpenDropdown('sort')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Your Score</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'sort' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, yourScoreLabel !== 'Any' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{yourScoreLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('favourite')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Favourites</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'favourite' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, favouriteFilter === 'fav' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{favouriteLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('location')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>City</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'location' ? '▴' : '▾'}</Text>
              </View>
              <Text style={styles.filterChipValue} numberOfLines={1} ellipsizeMode="tail">{locationLabel}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Search sits below the chips and narrows whatever the chips
              already filter — same pattern as Full Cellar List. */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search producer, wine, region…"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.searchClearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

        <ScrollView ref={listScrollRef} contentContainerStyle={{ paddingBottom: 60 }}>
          {sorted.length === 0 ? (
            <View style={styles.emptyFilter}>
              <Text style={styles.emptyBody}>No reviews match these filters.</Text>
            </View>
          ) : (
            sorted.map((item) => {
              const w = item.wine;
              // Every thumbnail opens a focused review input, never the full
              // wine card: chosen_wines reviews (restaurant + other) open
              // EditChosenWineModal; cellar reviews open the sibling
              // EditCellarReviewModal (which saves to cellar_wines).
              const isChosen = item.source !== 'cellar';
              const onPress = isChosen
                ? () => setEditingWine(item.wine as ChosenWine)
                : () => setEditingCellarWine(item.wine as CellarWine);
              const locText = isChosen
                ? locationLine(item.wine as ChosenWine)
                : (item.wine as CellarWine).review_location ?? '';
              const note = addedNote(item);
              const thumbPath = labelPathFor(item);
              return (
                <TouchableOpacity
                  key={`${item.source}-${w.id}`}
                  style={styles.cardCompact}
                  onPress={onPress}
                  onLongPress={() => handleLongPressReview(item)}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardCompactOuter}>
                    {thumbPath ? (
                      <LabelThumb path={thumbPath} fallbackText={w.wine_name} style={styles.reviewThumb} radius={4} frame={3} />
                    ) : null}
                    <View style={styles.cardCompactBody}>
                      <View style={styles.cardCompactRow}>
                        <Text style={styles.wineNameCompact} numberOfLines={2}>
                          {wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                        </Text>
                        <View style={styles.scoreCluster}>
                          <View style={styles.scoreLine}>
                            {isChosen && (item.wine as ChosenWine).is_favourite ? (
                              <Text style={styles.favouriteStar}>★</Text>
                            ) : null}
                            {item.score != null && (
                              <Text style={styles.scoreCompact}>{item.score}</Text>
                            )}
                          </View>
                        </View>
                      </View>
                      {w.region ? <Text style={styles.regionText} numberOfLines={1}>{w.region}</Text> : null}
                      <View style={styles.cardCompactMetaRow}>
                        <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                        {locText ? <Text style={styles.metaText} numberOfLines={1}> · {locText}</Text> : null}
                        {isChosen && formatListPrice(item.wine as ChosenWine) ? (
                          <Text style={styles.metaText}> · {formatListPrice(item.wine as ChosenWine)}</Text>
                        ) : null}
                        {/* No visible "Restaurant" / "Cellar" suffix here —
                            the user found it redundant. Internally each
                            review still carries item.source which drives
                            the filter chips, sort logic, share routing
                            and the long-press delete prompt, so this
                            cosmetic removal doesn't disturb behaviour. */}
                      </View>
                      {note ? (
                        <Text style={styles.addedNote}>
                          You added this to your {note.kind} on {formatDate(note.date)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {/* Bottle Picks Awaiting Review — restaurant picks not yet reviewed.
              Tapping one opens the same review flow as Your Restaurants. */}
          {awaitingReview.length > 0 ? (
            <View style={styles.awaitingSection} onLayout={(e) => setAwaitingY(e.nativeEvent.layout.y)}>
              <Text style={styles.awaitingHeader}>Restaurant Wines Awaiting Review</Text>
              {awaitingReview.map((w) => (
                <TouchableOpacity
                  key={`await-${w.id}`}
                  style={styles.awaitingRow}
                  onPress={() => setEditingWine(w)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.awaitingName} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                  <Text style={styles.awaitingMeta} numberOfLines={1}>
                    {[locationLine(w), formatDate(w.chosen_at)].filter(Boolean).join(' · ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </ScrollView>
        </>
      )}

      {/* Filter dropdown — single modal driven by openDropdown. The
          chip the user tapped sets dropdownConfig, which feeds title
          + options + current value into this sheet. Matches Full
          Cellar List's interaction model so the two screens behave
          identically. */}
      <Modal visible={!!activeDropdown} transparent animationType="fade" onRequestClose={() => setOpenDropdown(null)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setOpenDropdown(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.dropdownSheet} onPress={() => {}}>
            {activeDropdown && (
              <>
                <Text style={styles.dropdownTitle}>{activeDropdown.title}</Text>
                <ScrollView style={{ maxHeight: 400 }}>
                  {activeDropdown.options.map((opt) => {
                    const active = activeDropdown.selected === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.dropdownOption, active && styles.dropdownOptionActive]}
                        onPress={() => {
                          activeDropdown.onSelect(opt.value);
                          setOpenDropdown(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dropdownOptionText, active && styles.dropdownOptionTextActive]}>{opt.label}</Text>
                        {active && <Text style={styles.dropdownOptionCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity style={styles.dropdownCancel} onPress={() => setOpenDropdown(null)}>
                  <Text style={styles.dropdownCancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 70,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  // On-open review prompt.
  promptOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  promptSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 440 },
  promptTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  promptBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, lineHeight: 22, textAlign: 'center' },
  promptWine: { fontFamily: fonts.bodySemibold, color: colors.gold },
  promptCheckRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  promptCheckbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  promptCheckboxOn: { backgroundColor: 'rgba(224,184,74,0.18)' },
  promptCheckTick: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold },
  promptCheckLabel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  promptActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg },
  promptLater: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  promptReviewBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  promptReviewText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Restyled awaiting-review prompt: wine name, then Review Wine, then a plain
  // "Don't show me this again" link (no tick box).
  promptWineList: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 22 },
  promptReviewBtnFull: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  promptDontShow: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  promptDontShowText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  // Bottle Picks Awaiting Review section.
  awaitingSection: { marginTop: spacing.xl },
  awaitingHeader: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: spacing.xl, marginBottom: spacing.sm },
  awaitingRow: { marginHorizontal: spacing.xl, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  awaitingName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  awaitingMeta: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 3 },
  addLink: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.5, width: 50, textAlign: 'right' },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  cardCompact: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  // When a review has a label photo it sits as a small framed thumbnail to the
  // left of the text (like a cellar wine card); text-only otherwise.
  cardCompactOuter: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardCompactBody: { flex: 1 },
  reviewThumb: { width: 46, height: 60 },
  cardCompactRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  cardCompactMetaRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  wineNameCompact: { flex: 1, fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, lineHeight: 22 },
  regionText: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 2 },
  // The user's own review score — white, matching the wine cards (critic scores
  // are gold; the user's score is white).
  scoreCompact: { fontSize: 18, fontFamily: fonts.bodyBold, color: '#FFFFFF' },
  // Cluster sits as a column on the right: score (+ favourite star) at
  // the top, the white share icon below it.
  scoreCluster: { alignItems: 'flex-end', gap: spacing.xs },
  scoreLine: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  favouriteStar: { fontSize: 18, color: colors.gold },
  metaText: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  addedNote: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold, marginTop: spacing.xs },
  emptyFilter: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  // Summary + filter carousel — copied from Full Cellar List
  // (app/cellar/list.tsx) so the two screens look identical above the
  // list itself. Sort chip is gold-bordered to mark it as the most
  // common interaction.
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  // Tappable variant of the awaiting-review line (no underline, per house style).
  summaryLink: { marginTop: 4 },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  // Mic + Camera "Add" prompts above the filters.
  addIconsRow: { flexDirection: 'row', gap: spacing.xl, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  iconsSeparator: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs },
  addIconBtn: { width: 52, height: 52, borderRadius: 12, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 120, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  filterChipSort: { borderColor: colors.gold },
  filterChipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  // Heading row inside a filter chip — label + a small up/down chevron
  // (flips when this chip's dropdown is open) so users see it's selectable.
  filterChipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  filterChipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.xs, marginBottom: spacing.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  // Tiny inline "clear" affordance next to the search input — treated as muted UI text, not a primary button.
  searchClearText: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  dropdownSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  dropdownTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  dropdownOptionText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  dropdownOptionTextActive: { color: colors.gold },
  dropdownOptionCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  dropdownCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  dropdownCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  chooserOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  chooserSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  chooserTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  chooserBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  chooserBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  chooserBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  chooserCancel: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: 4 },
  chooserCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  // Status read-out shown during background upload — treat as subtle/muted info text.
  uploadingText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
  // Hides the off-screen branded share card from the visible layout
  // while still keeping it mountable for react-native-view-shot to
  // snapshot. Matches the WineListShareCard pattern in scan/results.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
