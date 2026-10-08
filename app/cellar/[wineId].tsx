import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Keyboard, ActivityIndicator, Share, ScrollView } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../../src/utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { showAlert } from '../../src/components/AppAlert';
import { DateInput } from '../../src/components/DateInput';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { useCellar, useArchive, useWishList } from '../../src/hooks/useCellar';
import { WineReviewShareCard } from '../../src/components/WineReviewShareCard';
import { WineIntelShareCard } from '../../src/components/WineIntelShareCard';
import { NoIntelPrompt } from '../../src/components/NoIntelPrompt';
import { WineIdentityHeader } from '../../src/components/WineIdentityHeader';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { hasRealInsiderNote } from '../../src/constants/insiderNote';
import { COMMUNITY_ENABLED } from '../../src/constants/features';
import { useAuth } from '../../src/hooks/useAuth';
import { buildEntry, entriesOf, latestEntry, byRecency, flatMirror } from '../../src/utils/cellarReview';
import { findMatchingChosenWine } from '../../src/api/chosenWines';
import { useRacks } from '../../src/hooks/useRacks';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useLabelStore } from '../../src/stores/labelStore';
import { useRackStore } from '../../src/stores/rackStore';
import { generatePairings, fetchProducerRange, type ProducerRange, type ProducerRangeWine } from '../../src/api/label';
import { valueWine } from '../../src/services/pricing';
import { getSlotAssignments, clearWineFromRacks, removeSlotsForWine, clearSlot } from '../../src/api/racks';
import { fetchPlacementsForWine, placedCount, clearLocationPlacements, releaseBottlesFromPlacements, releaseFromLocation } from '../../src/api/placements';
import { effectiveMaturity } from '../../src/utils/maturity';
import { addCellarWine, addCellarWineRemoval, listCellarWineRemovals } from '../../src/api/cellar';
import { generateServingSuggestion, generateMarketVintage } from '../../src/api/wineExtras';
import { wineNameKey } from '../../src/utils/wineIdentity';
import { publishCommunityReview } from '../../src/api/community';
import { supabase } from '../../src/api/supabase';
import * as ImagePicker from 'expo-image-picker';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { evictCachedLabel, getCachedLabelUri } from '../../src/api/labelImageCache';
import { LabelThumb } from '../../src/components/LabelThumb';
import { bottleSizeCl } from '../../src/components/BottleSizePicker';
import { fetchCellarLocations, addWinesToFilter, removeWineFromFilter } from '../../src/api/customFilters';
import { fetchStorageLocations, assignWineToStorageLocation, assignWineToCase, deleteEmptyCasesForLocation, fetchStorageLocationCases, fetchStorageCasesByIds } from '../../src/api/storageLocations';
import { LabelPhotoViewer } from '../../src/components/LabelPhotoViewer';
import { EditCellarReviewModal } from '../../src/components/EditCellarReviewModal';
import { PackagingPrompt } from '../../src/components/PackagingPrompt';
import { SearchProgress } from '../../src/components/SearchProgress';
import { RangeWineNoteSheet } from '../../src/components/RangeWineNoteSheet';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import { formatCurrency, currencySymbol } from '../../src/constants/currency';
import type { WineDetailsComplete, CellarWine, GrapeVariant } from '../../src/types/wine';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// A distinct physical place a wine's bottles sit in, offered as an archive source
// when the wine is split across more than one (a rack, an alt cellar, a bin, loose).
type ArchiveSource =
  | { kind: 'rack'; rackId: string; label: string; count: number }
  | { kind: 'location'; locationId: string; label: string; count: number }
  | { kind: 'bin'; label: string; count: number }
  | { kind: 'loose'; label: string; count: number };

const STATUS_COLORS: Record<string, string> = {
  too_young: colors.warning,
  approaching: colors.gold,
  peak: colors.gold,
  // Declining reads in the same gold as the other maturity levels — never red.
  declining: colors.gold,
  unknown: colors.textMuted,
};

const STATUS_LABELS: Record<string, string> = {
  too_young: 'Too Young',
  approaching: 'Approaching Peak',
  peak: 'Peak Now',
  declining: 'Declining',
  unknown: 'Unknown',
};

// Read-only summary row on the wine card. Bottle count and date only —
// the note-editing affordance lives in the archive folder so this card
// stays focused on the live cellar view.
function RemovalRow({ removal }: { removal: { id: string; removed_at: string; count: number; note: string | null } }) {
  const dateLabel = new Date(removal.removed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <View style={styles.removalRow}>
      <View style={styles.removalHeader}>
        <Text style={styles.removalCount}>{removal.count} {removal.count === 1 ? 'bottle' : 'bottles'}</Text>
        <View style={styles.removalDateWrap}>
          <Text style={styles.removalDate}>{dateLabel}</Text>
          {removal.note && removal.note.trim() ? (
            <TouchableOpacity
              onPress={() => showAlert({ title: dateLabel, body: removal.note!.trim() })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Text style={styles.removalNoteLink}>Note</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function CellarWineDetail() {
  useKeepAwake();
  const { wineId, from, fromRackId, fromRow, fromCol } = useLocalSearchParams<{ wineId: string; from?: string; fromRackId?: string; fromRow?: string; fromCol?: string }>();
  // The exact rack slot the user tapped to open this card (when arriving from a
  // rack), so archive/remove frees THAT bottle's slot rather than an arbitrary one.
  const tappedSlot = fromRackId && fromRow != null && fromCol != null
    ? { rackId: fromRackId, row: parseInt(fromRow, 10), col: parseInt(fromCol, 10) }
    : null;
  // Coming in via Profile → Wine Reviews — the chef-pairing button on
  // this card is swapped for a Post Review to Community CTA so the user
  // can share what they just wrote with other Vinster users.
  const cameFromReviews = from === 'reviews';
  // Coming in from the Wish List screen — surfaces an Add to Cellar
  // affordance and hides cellar-only actions (Add bottles, Archive,
  // Removal History) that don't make sense for a wine the user
  // hasn't bought yet.
  const cameFromWishlist = from === 'wishlist';
  const { session } = useAuth();
  const { wines, updateWine, isLoading: cellarLoading } = useCellar();
  const { wines: wishlistWines, isLoading: wishlistLoading, deleteWine: deleteWishlistWine } = useWishList();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const { setWineDetailsConfirmed, setPairings, setFilters, setError } = useLabelStore();
  const { setPendingWineId, setPendingAddMode } = useRackStore();
  const qc = useQueryClient();
  const { wines: archivedWines, isLoading: archiveLoading } = useArchive();
  // Unified lookup — the card now serves cellar, wishlist and archive
  // rows out of the same screen. Mode flags below drive the
  // affordance differences.
  const wine = wines.find((w) => w.id === wineId)
    ?? wishlistWines.find((w) => w.id === wineId)
    ?? archivedWines.find((w) => w.id === wineId);
  const isArchived = !!wine?.archived_at;
  const isWishlist = !!wine?.is_wishlist;

  const { data: removals = [] } = useQuery({
    queryKey: ['cellar-removals', wineId],
    queryFn: () => listCellarWineRemovals(wineId!),
    enabled: !!wineId,
  });

  const rackIds = racks.map((r) => r.id);
  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });
  // Unified placements (migration 103/104) — read path. Bottles not covered by
  // any placement are "unplaced" (loose in the Full Cellar List); surfacing them
  // fixes the "3 in a rack, where are the other 3?" gap.
  const { data: winePlacements = [] } = useQuery({
    queryKey: ['placements', wineId],
    queryFn: () => fetchPlacementsForWine(wineId!),
    enabled: !!wineId,
  });
  // Alt-cellar placements (a wine can be in several locations/cases). Case names
  // are resolved for the breakdown lines.
  const locationPlacements = winePlacements.filter((p) => p.kind === 'location');
  const placementCaseIds = Array.from(new Set(locationPlacements.map((p) => p.case_id).filter(Boolean) as string[]));
  const { data: placementCases = [] } = useQuery({
    queryKey: ['placement-cases', placementCaseIds],
    queryFn: () => fetchStorageCasesByIds(placementCaseIds),
    enabled: placementCaseIds.length > 0,
  });
  // A single listing's bottles can span several racks, so tally a per-rack
  // count and surface one "N bottles in <rack>" link for each.
  const wineRackCounts = slotAssignments.reduce<Record<string, number>>((acc, s) => {
    if (s.cellar_wine_id === wineId) acc[s.rack_id] = (acc[s.rack_id] ?? 0) + 1;
    return acc;
  }, {});
  const wineRacks = Object.entries(wineRackCounts).flatMap(([rackId, count]) => {
    const rack = racks.find((r) => r.id === rackId);
    return rack ? [{ rack, count }] : [];
  });

  // Cellar-wide Location filters — offered as add destinations and as the
  // "remove from which location?" choices.
  const { data: locations = [] } = useQuery({
    queryKey: ['cellar-locations', session?.user.id],
    queryFn: () => fetchCellarLocations(session!.user.id),
    enabled: !!session?.user.id,
  });
  // Cellar List "Location" filters this wine is filed under. Without this the
  // card only checked rack placement, so a wine filed ONLY in a Location kept
  // showing "Add to Location" as if it had none.
  const wineLocations = locations.filter((l) => l.wineIds?.includes(wineId ?? ''));

  // Other Home Storage (storage_locations) — also valid "Add to
  // Location" destinations. A wine filed here lives via
  // cellar_wines.storage_location_id (the shed, under the bed…).
  const { data: storageLocations = [] } = useQuery({
    queryKey: ['storage-locations', session?.user.id],
    queryFn: () => fetchStorageLocations(session!.user.id),
    enabled: !!session?.user.id,
  });
  const wineStorageLocation = storageLocations.find((l) => l.id === wine?.storage_location_id) ?? null;
  // If this wine is boxed in a case within its home storage location, resolve the
  // case so the placement line can read "Location Name - Case name".
  const { data: storageCases = [] } = useQuery({
    queryKey: ['storage-location-cases', wine?.storage_location_id],
    queryFn: () => fetchStorageLocationCases(wine!.storage_location_id!),
    enabled: !!wine?.storage_location_id && !!wine?.case_id,
  });
  const wineCase = wine?.case_id ? storageCases.find((c) => c.id === wine.case_id) ?? null : null;
  // The location whose membership a pending add/remove applies to.
  const [pendingLocationId, setPendingLocationId] = useState<string | null>(null);
  const [removeLocationId, setRemoveLocationId] = useState<string | null>(null);

  // Cellar Note — a short private note shown ONLY on the wine card (never in a
  // review). Edited through a small dictate/type popup, capped at 100 chars.
  const [cellarNoteOpen, setCellarNoteOpen] = useState(false);
  // Read-only popup shown when an existing cellar note's chevron is tapped —
  // offers Edit / Delete. (The input popup, cellarNoteOpen, is the editor.)
  const [cellarNoteViewOpen, setCellarNoteViewOpen] = useState(false);
  // "View in Cellar" popup — lists every physical place this wine's bottles sit
  // (external cellars, or a home wine split across locations).
  const [cellarViewOpen, setCellarViewOpen] = useState(false);
  const [noteText, setNoteText] = useState(wine?.cellar_note ?? '');
  const [savingNote, setSavingNote] = useState(false);

  const [removeCount, setRemoveCount] = useState('1');
  const [removeDate, setRemoveDate] = useState(todayISO());
  // Brief, optional note on the removal — where/with whom it was drunk. Capped
  // at 50 chars; shown per-removal in the Bottles in my Archive list.
  const [removeNote, setRemoveNote] = useState('');
  const [removing, setRemoving] = useState(false);
  const [rackRemovalMsg, setRackRemovalMsg] = useState<string | null>(null);
  const [removeStep, setRemoveStep] = useState<'idle' | 'confirm' | 'success'>('idle');
  // True for the brief window between deletion and auto-navigation. Used to
  // suppress the "Wine not found" fallback (the cellar query has already
  // refetched without this wine) so the auto-dismissing success toast can
  // render on top of an otherwise-empty screen.
  const [justDeleted, setJustDeleted] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [addBottlesOpen, setAddBottlesOpen] = useState(false);
  const [addBottlesCount, setAddBottlesCount] = useState('1');
  const [addingBottles, setAddingBottles] = useState(false);

  const [findingPairings, setFindingPairings] = useState(false);
  const [postingReview, setPostingReview] = useState(false);
  const [reviewPosted, setReviewPosted] = useState(false);

  const [editingPrice, setEditingPrice] = useState(false);
  const [purchasePriceDraft, setPurchasePriceDraft] = useState(wine?.purchase_price != null ? String(wine.purchase_price) : '');
  const [savingPrice, setSavingPrice] = useState(false);
  const [refreshingValue, setRefreshingValue] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [titleEditOpen, setTitleEditOpen] = useState(false);
  const [archiveHistoryOpen, setArchiveHistoryOpen] = useState(false);
  const [producerDraft, setProducerDraft] = useState('');
  const [wineNameDraft, setWineNameDraft] = useState('');
  const [regionDraft, setRegionDraft] = useState('');
  const [vintageDraft, setVintageDraft] = useState('');
  const [grapeDraft, setGrapeDraft] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  // "Confirm this wine" grape prompt. Fires before the intel card is committed
  // when the wine is genuinely ambiguous — the same producer + name sold as more
  // than one wine (e.g. a Mullineux single-vineyard as both a Syrah and a Chenin
  // Blanc). The card can't be accurate until Vinster knows the variety, so we ask
  // rather than guess. Never fires for ordinary wines (grape known/inferable).
  const [grapeConfirmOpen, setGrapeConfirmOpen] = useState(false);
  const [grapeVariants, setGrapeVariants] = useState<GrapeVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  // Auto-generate intel whenever a wine card opens missing its key intel — the
  // critic score or market value. A critic score is core intel; the user must
  // never have to tap "Generate" for it. A fully-bare wine (nothing yet) shows
  // the full-screen tracker so the card only ever appears finished; a card that
  // already has some intel but is missing the score generates quietly in the
  // background so a populated card isn't hidden behind a loader. Fires once per
  // wine per open; the user can still re-run via the Generate buttons.
  const autoGenRef = useRef<string | null>(null);
  // True while a first-open auto-generation is running — drives the full-screen
  // "generating" tracker so the card only ever appears finished.
  const [autoGenerating, setAutoGenerating] = useState(false);
  // True only when a first-open auto-generation genuinely produced NO intel —
  // so the "couldn't generate" prompt fires for a real miss, not the brief
  // window while the cache refetches the freshly-generated values.
  const [autoGenFailed, setAutoGenFailed] = useState(false);
  useEffect(() => {
    if (!wine || isWishlist || isArchived || refreshingValue) return;
    // Re-generate when the score/value is missing, OR when the Inside Line is
    // blank or still the jokey placeholder — so a wine whose note was written
    // before the prompt was strengthened re-runs and gets a real line (a famous
    // producer like Produttori del Barbaresco should never keep the joke).
    const missingKeyIntel = wine.critic_score == null || wine.estimated_value == null || !hasRealInsiderNote(wine.insider_note);
    const fullyBare = wine.critic_score == null && wine.estimated_value == null && !wine.grape_variety;
    if (missingKeyIntel && autoGenRef.current !== wine.id) {
      autoGenRef.current = wine.id;
      // Only a fully-bare wine hides behind the tracker; a partially-enriched
      // card refreshes in the background.
      if (fullyBare) setAutoGenerating(true);
      handleRefreshEstimate()
        .then((produced) => {
          // 'ambiguous' → handleRefreshEstimate opened the confirm prompt; the
          // card fills once the user picks a variant, so it's not a failure.
          if (produced === 'ambiguous') return;
          if (fullyBare) setAutoGenFailed(!produced);
        })
        .finally(() => setAutoGenerating(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wine?.id, wine?.critic_score, wine?.estimated_value, wine?.grape_variety, wine?.insider_note, isWishlist, isArchived]);

  // After an auto-generate attempt, if Vinster still couldn't produce any intel
  // (no critic score and no value), it's almost always because the wine name is
  // misspelt or the producer/name are in the wrong fields — so prompt the user
  // to check and edit. Dismissible; resets per wine.
  const [noIntelDismissed, setNoIntelDismissed] = useState(false);
  useEffect(() => { setNoIntelDismissed(false); setAutoGenFailed(false); }, [wine?.id]);

  const [reviewExpanded, setReviewExpanded] = useState(false);
  // The review is now edited only through the canonical EditCellarReviewModal,
  // never inline on the card. This opens it.
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // +Add Review goes straight to the review input screen — no "create vs import"
  // prompt. Any review the user already wrote in Dine → Your Wine Reviews is
  // pulled in automatically by the auto-link effect below, so there's nothing to
  // import by hand; the user just writes their review (append-only) and Back
  // returns them to this wine intel screen.
  function openAddReview() {
    setReviewModalOpen(true);
  }

  // Auto-link an existing review: if this cellar wine carries no review yet but
  // the user already reviewed it in Your Wine Reviews (same producer/name/vintage),
  // pull that review onto the bottle so its Your Review shows straight away. This
  // runs on every screen FOCUS (not just first mount) so a review written AFTER
  // the card was first opened still gets attached when the user returns to it —
  // previously it checked once and gave up, so a later review never linked.
  // `autoLinkBusy` guards only against overlapping runs within one focus.
  const autoLinkBusy = useRef(false);
  useFocusEffect(
    useCallback(() => {
      // Archived wines DO link — a common flow is to review a bottle then archive
      // it, and the review must still show on the archived card. Only wishlist
      // wines (not yet owned/drunk) are excluded.
      if (!wine || isWishlist) return;
      if (entriesOf(wine).length > 0) return; // already has its own review
      if (autoLinkBusy.current) return;
      autoLinkBusy.current = true;
      void (async () => {
        if (!session?.user.id) { autoLinkBusy.current = false; return; }
        try {
          const match = await findMatchingChosenWine(session.user.id, { producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage, wsWineId: wine.ws_wine_id });
          if (!match) return;
          const hasContent = !!((match.tasting_note && match.tasting_note.trim()) || (match.other_observations && match.other_observations.trim()) || match.user_score != null);
          if (!hasContent) return;
          const entry = buildEntry({
            note: match.tasting_note ?? '',
            personalNotes: match.other_observations ?? '',
            score: match.user_score,
            location: [match.restaurant_name, match.city].map((s) => (s ?? '').trim()).filter(Boolean).join(', '),
            date: match.chosen_at ? match.chosen_at.split('T')[0] : null,
            drinkingWindow: match.user_drinking_window ?? '',
          });
          const next = [...entriesOf(wine), entry];
          await updateWine.mutateAsync({ id: wine.id, updates: { review_entries: next, ...flatMirror(latestEntry(next)) } });
        } catch { /* best-effort — the manual import stays available */ }
        finally { autoLinkBusy.current = false; }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wine?.id, isWishlist, isArchived, session?.user.id]),
  );

  // Vinster's Note — collapsed by default now (was always visible).
  // The "(what's this)" link surfaces a short explanation modal so a
  // user encountering the field for the first time knows what it is.
  const [vinstersNoteOpen, setVinstersNoteOpen] = useState(false);
  // On-demand card sections (generated when first opened, then cached on the wine).
  const [servingOpen, setServingOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [generatingServing, setGeneratingServing] = useState(false);
  const [generatingMarket, setGeneratingMarket] = useState(false);

  // Off-screen share card for "Share outside the app" — captured to
  // PNG and handed to the native share sheet. Same pattern Wine
  // Reviews uses.
  const reviewShareRef = useRef<View>(null);
  const [sharingOutside, setSharingOutside] = useState(false);
  const [reviewSharePayload, setReviewSharePayload] = useState<React.ComponentProps<typeof WineReviewShareCard> | null>(null);

  // Same off-screen-capture pattern for the top-right "Share" on the wine
  // card itself — shares Vinster's intelligence (scores, value, tasting note).
  const intelShareRef = useRef<View>(null);
  const [sharingIntel, setSharingIntel] = useState(false);
  const [intelSharePayload, setIntelSharePayload] = useState<React.ComponentProps<typeof WineIntelShareCard> | null>(null);

  // The Other Home Storage location a wine was just filed into → drives the
  // "How is this wine packaged?" prompt. MUST live above the auto-generate
  // early-return below — a hook after it changes the hook count when the loader
  // shows/hides, which crashes the card ("Something went wrong") the first time
  // a fresh wine generates intel.
  const [packagingLocationId, setPackagingLocationId] = useState<string | null>(null);

  // "The {producer} range" — a live producer-range lookup shown under Vinster's
  // Review/Map, mirroring the scan Wine Intel card. Fetched once per wine, only
  // after the wine has intel (so it matches the intel timing) and has a producer.
  // These hooks MUST stay above the early-return below (see the note above).
  const [producerRange, setProducerRange] = useState<ProducerRange | null>(null);
  const [producerRangeLoading, setProducerRangeLoading] = useState(false);
  const producerRangeTriedRef = useRef<string | null>(null);
  const [rangeNoteWine, setRangeNoteWine] = useState<string | null>(null);
  const [rangeNoteTier, setRangeNoteTier] = useState<string | null>(null);
  // Deduped range — same as the scan Wine Intel card: collapse the same wine
  // listed twice (bare vs. with the château in parentheses) by a normalised key.
  const rangeWines = useMemo<ProducerRangeWine[]>(() => {
    const wines = producerRange?.wines ?? [];
    const norm = (s: string) => (s ?? '')
      .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const byKey = new Map<string, ProducerRangeWine>();
    for (const w of wines) {
      const k = norm(w.wineName);
      if (!k) continue;
      const prev = byKey.get(k);
      if (!prev) { byKey.set(k, w); continue; }
      const keep = w.isThis ? w : prev.isThis ? prev : (w.wineName.length < prev.wineName.length ? w : prev);
      byKey.set(k, { ...keep, isThis: keep.isThis || w.isThis || prev.isThis });
    }
    return Array.from(byKey.values());
  }, [producerRange]);
  useEffect(() => {
    if (!wine || isWishlist || isArchived) return;
    const hasIntel = wine.critic_score != null || wine.estimated_value != null;
    if (!hasIntel || !wine.producer?.trim()) return;
    if (producerRangeTriedRef.current === wine.id) return;
    producerRangeTriedRef.current = wine.id;
    setProducerRange(null);
    setProducerRangeLoading(true);
    (async () => {
      try {
        const r = await fetchProducerRange({ producer: wine.producer, region: wine.region, wineName: wine.wine_name, vintage: wine.vintage });
        if (r.wines.length > 0) setProducerRange(r);
      } catch { /* silent — the section just doesn't render */ }
      finally { setProducerRangeLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wine?.id, wine?.critic_score, wine?.estimated_value, isWishlist, isArchived]);

  // Add or replace this wine's framed label photo. Take a fresh photo or
  // pick one from the library, then upload + persist the path. Best-effort
  // with surfaced errors; this is how photo-less / manually-added wines get
  // their label thumbnail (the scan flow fills it automatically).
  async function handleAddPhoto() {
    if (!session?.user.id || !wine) return;
    const pick = async (fromCamera: boolean) => {
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert({ title: 'Permission needed', body: fromCamera ? 'Allow camera access to photograph your label.' : 'Allow photo access to choose a label.' });
        return;
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets?.[0]) return;
      setUploadingPhoto(true);
      try {
        const path = await uploadLabelImage(session.user.id, result.assets[0].uri, wine.id);
        await updateWine.mutateAsync({ id: wine.id, updates: { label_image_path: path } });
        qc.invalidateQueries({ queryKey: ['cellar'] });
        qc.invalidateQueries({ queryKey: ['cellar-archive'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        // Bust the cached signed URL for this path so a replaced photo shows
        // immediately rather than the previous image (the path is reused per
        // wine id, so without this the cached URL/bitmap would persist).
        qc.invalidateQueries({ queryKey: ['label-image', path] });
      } catch (err) {
        showAlert({ title: 'Could not save photo', body: err instanceof Error ? err.message : 'Please try again.' });
      } finally {
        setUploadingPhoto(false);
      }
    };
    showAlert({
      title: wine.label_image_path ? 'Change label photo' : 'Add a label photo',
      body: 'Take a photo of the bottle label, choose one from your library, or let Vinster find one online.',
      buttons: [
        { text: 'Take Photo', onPress: () => pick(true) },
        { text: 'Choose from Library', onPress: () => pick(false) },
        { text: 'Find Label Online', onPress: () => router.push(`/label/find-label?wineId=${wine.id}&producer=${encodeURIComponent(wine.producer ?? '')}&wineName=${encodeURIComponent(wine.wine_name ?? '')}` as any) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Long-press on the thumbnail → change or remove. The label library is fed
  // only by actual label scans now (the Scan Archive), so cellar wines no
  // longer copy themselves into it — that was the duplication we removed.
  function handlePhotoMenu() {
    showAlert({
      title: 'Label photo',
      body: 'Change this label photo, or remove it.',
      buttons: [
        { text: 'Change photo', onPress: () => void handleAddPhoto() },
        { text: 'Delete photo', style: 'destructive', onPress: () => void handleDeletePhoto() },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  async function handleDeletePhoto() {
    if (!wine) return;
    try {
      await updateWine.mutateAsync({ id: wine.id, updates: { label_image_path: null } });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      qc.invalidateQueries({ queryKey: ['cellar-archive'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
    } catch (err) {
      showAlert({ title: 'Could not remove photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Edit the wine's title identity — name + grape variety (not the date).
  function openTitleEdit() {
    if (!wine) return;
    setProducerDraft(wine.producer ?? '');
    setWineNameDraft(wine.wine_name ?? '');
    setRegionDraft(wine.region ?? '');
    setVintageDraft(wine.vintage ?? '');
    setGrapeDraft(wine.grape_variety ?? '');
    setTitleEditOpen(true);
  }

  async function handleSaveTitle() {
    if (!wine) return;
    Keyboard.dismiss();
    setSavingTitle(true);
    try {
      await updateWine.mutateAsync({
        id: wine.id,
        updates: {
          producer: producerDraft.trim() || null,
          wine_name: wineNameDraft.trim() || wine.wine_name,
          region: regionDraft.trim() || null,
          vintage: vintageDraft.trim() || null,
          grape_variety: grapeDraft.trim() || null,
        },
      });
      setTitleEditOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingTitle(false);
    }
  }

  // Brief "Wine removed from your records" toast — shown for ~1.4s after
  // a permanent delete, then the auto-dismiss timer navigates back. The
  // user just confirmed deletion, so the underlying wine row is gone and
  // we render this on top of an empty screen rather than the wine card.
  if (justDeleted) {
    return (
      <View style={styles.removeModalOverlay}>
        <View style={styles.removeModalSheet}>
          <Text style={styles.removeModalTitle}>Wine has been removed from your records</Text>
        </View>
      </View>
    );
  }

  // While the cellar query is in flight, show a spinner instead of the
  // "Wine not found" fallback — otherwise the user sees a flash of that
  // message right after a wine is added (the navigation lands before the
  // cellar refetch resolves).
  if (!wine && (cellarLoading || archiveLoading || wishlistLoading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!wine) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Wine not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // First open of an un-enriched wine: keep the card hidden behind the List-style
  // generating tracker until Vinster's intel is in, so the user only ever sees
  // the finished card — never it assembling. (Shown from load → through gen;
  // hides once enriched, or if generation fails.)
  const ungeneratedNow = wine.critic_score == null && wine.estimated_value == null && !wine.grape_variety;
  if (!isWishlist && !isArchived && (autoGenerating || (ungeneratedNow && autoGenRef.current !== wine.id))) {
    return (
      <SearchProgress
        title="Vinster is generating Wine Intel"
        subtitle="You'll have it in just a moment"
        body="Vinster is pulling together critic scores, market value, the drinking window and a tasting note for this wine."
        durationMs={25000}
      />
    );
  }

  // Send the wine to a rack grid for visual placement. `addMode` = are these NEW
  // bottles (bump quantity) or EXISTING ones being placed/moved (quantity
  // unchanged)? Passing addMode:true for "Add to Location" (placing already-counted
  // bottles) double-counted them by adding the placed count to quantity.
  function placeInRack(rackId: string, addMode: boolean) {
    setPendingWineId(wine!.id);
    setPendingAddMode(addMode);
    router.push(`/cellar/rack/${rackId}` as any);
  }

  // Place EXISTING unplaced bottles: open the rack in select-slots mode, capped at
  // the unplaced count. The user taps that many empty slots (thumbnails fill) and
  // presses Confirm — no "how many?" prompt or starting-slot run.
  async function placeUnplacedInRack(rackId: string) {
    if (!wine) return;
    // Cap from a FRESH placement read, not the React-Query snapshot — a stale/empty
    // snapshot would inflate `unplaced` and let the rack screen offer (and place) more
    // slots than the wine has loose bottles, pushing placed above quantity.
    const pls = await fetchPlacementsForWine(wine.id).catch(() => winePlacements);
    const unplaced = Math.max(0, (wine.quantity ?? 0) - placedCount(pls));
    if (unplaced <= 0) {
      showAlert({ title: 'All placed', body: 'Every bottle of this wine is already placed in your cellar.' });
      return;
    }
    router.push(`/cellar/rack/${rackId}?placeWine=${wine.id}&placeLimit=${unplaced}` as any);
  }

  // File the (unplaced) wine under a cellar-wide bespoke Location filter — an
  // instant tag, no physical placement.
  async function addWineToLocationFilter(locationId: string) {
    try {
      await addWinesToFilter(locationId, [wine!.id]);
      qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
      showAlert({ title: 'Added to location', body: `Filed under ${locations.find((l) => l.id === locationId)?.name ?? 'the location'}.` });
    } catch (err) {
      showAlert({ title: 'Could not add to location', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // File the (unplaced) wine into an Other Home Storage location — the same
  // cellar_wines.storage_location_id assignment the location screen uses.
  async function fileInStorageLocation(locationId: string) {
    try {
      // Filing into a location clears any rack slots and bin cell first, so the
      // wine can't be double-counted (its old rack/bin membership would still
      // show it there) — mirrors the S3 guard in the label results flow.
      await clearWineFromRacks(wine!.id);
      if (wine!.bin_cell_id) await updateWine.mutateAsync({ id: wine!.id, updates: { bin_cell_id: null } });
      await assignWineToStorageLocation(wine!.id, locationId);
      qc.invalidateQueries({ queryKey: ['storage-locations'] });
      qc.invalidateQueries({ queryKey: ['storage-location-wines', locationId] });
      qc.invalidateQueries({ queryKey: ['bins'] });
      qc.invalidateQueries({ queryKey: ['bin-cells'] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      // Ask how it's packaged in this Other Home Storage location.
      setPackagingLocationId(locationId);
    } catch (err) {
      showAlert({ title: 'Could not add to location', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // "Add to Location" on an unplaced wine — place it in a live rack/fridge, file
  // it into an Other Home Storage location, or tag it under a Cellar List location.
  function handleAddToLocation() {
    const buttons = [
      // Existing unplaced bottles → select empty slots to place them (no count bump).
      ...racks.map((r) => ({ text: r.name, onPress: () => void placeUnplacedInRack(r.id) })),
      // Home-storage alt cellars only — a Full Cellar List wine can't be moved
      // INTO external/offsite storage, so external locations are excluded.
      ...storageLocations.filter((l) => !l.is_external).map((l) => ({ text: l.name, onPress: () => fileInStorageLocation(l.id) })),
      ...locations.map((l) => ({ text: l.name, onPress: () => addWineToLocationFilter(l.id) })),
    ];
    if (buttons.length === 0) {
      showAlert({ title: 'No locations yet', body: 'Create a rack, fridge or home storage location first, then you can add wines to it.' });
      return;
    }
    showAlert({
      title: 'Add to Location',
      body: 'Place in a Home Storage Location.',
      buttons: [
        ...buttons,
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  // Add to the Cellar List with no specific folder — just bump the count.
  // Deliberately does NOT tag the wine into any bespoke Location folder, so a
  // same-wine bottle already filed in a folder keeps its membership untouched.
  function startAddToCellarList() {
    setPendingLocationId(null);
    setAddBottlesCount('1');
    setAddBottlesOpen(true);
  }

  function handleAddBottlesEntry() {
    // "+ Add bottles" → choose a destination first: a live rack/fridge for
    // visual placement, or the Cellar List for a plain count bump. We do NOT
    // list bespoke Location folders here — folders are managed in the Cellar
    // List itself, and offering them here filed bottles into the wrong place.
    const dests: { text: string; onPress: () => void }[] = [
      // Genuinely NEW bottles → placing them bumps the quantity.
      ...racks.map((r) => ({ text: r.name, onPress: () => placeInRack(r.id, true) })),
      { text: 'Cellar List', onPress: startAddToCellarList },
    ];
    if (dests.length === 1) {
      // Only the Cellar List option (no racks/fridges yet) — skip the prompt.
      dests[0].onPress();
      return;
    }
    showAlert({
      title: 'Add to',
      body: 'Where are these bottles going?',
      buttons: [
        ...dests,
        { text: 'Cancel', style: 'cancel' as const, onPress: () => { setPendingWineId(null); setPendingAddMode(false); setPendingLocationId(null); } },
      ],
    });
  }

  // "- Remove bottles" → if the wine is filed under more than one location, ask
  // which one first; then the existing Archive/Delete popup runs.
  function handleRemoveBottlesEntry() {
    const inLocs = locations.filter((l) => l.wineIds.includes(wine!.id));
    if (inLocs.length > 1) {
      showAlert({
        title: 'Remove from which location?',
        body: 'This wine is filed under more than one location.',
        buttons: [
          ...inLocs.map((l) => ({ text: l.name, onPress: () => { setRemoveLocationId(l.id); setArchiveModalOpen(true); } })),
          { text: 'Cancel', style: 'cancel' as const },
        ],
      });
    } else {
      setRemoveLocationId(inLocs[0]?.id ?? null);
      setArchiveModalOpen(true);
    }
  }

  function openCellarNote() {
    setNoteText(wine?.cellar_note ?? '');
    setCellarNoteOpen(true);
  }

  // On-demand Serving Suggestions — generate once, cache on the wine. Never part
  // of the auto wine-card generation or "update intel", so it doesn't slow those.
  async function handleGenerateServing() {
    if (!wine || generatingServing) return;
    setGeneratingServing(true);
    try {
      const data = await generateServingSuggestion(wine);
      await updateWine.mutateAsync({ id: wine.id, updates: { serving_suggestion: data } });
    } catch {
      showAlert({ title: 'Could not generate', body: 'Please try again in a moment.' });
    } finally {
      setGeneratingServing(false);
    }
  }

  // On-demand Market & Vintage Comparison — generate once, cache on the wine.
  async function handleGenerateMarket() {
    if (!wine || generatingMarket) return;
    setGeneratingMarket(true);
    try {
      const data = await generateMarketVintage(wine, preferences?.defaultCurrency ?? wine.estimated_value_currency ?? 'GBP');
      await updateWine.mutateAsync({ id: wine.id, updates: { market_vintage_note: data } });
    } catch {
      showAlert({ title: 'Could not generate', body: 'Please try again in a moment.' });
    } finally {
      setGeneratingMarket(false);
    }
  }

  async function handleSaveCellarNote() {
    Keyboard.dismiss();
    setSavingNote(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: { cellar_note: noteText.trim().slice(0, 100) || null },
      });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      setCellarNoteOpen(false);
    } catch {
      showAlert({ title: 'Error', body: 'Could not save note.' });
    } finally {
      setSavingNote(false);
    }
  }

  // Delete the cellar note outright (clears the field, closes the sheet).
  async function handleDeleteCellarNote() {
    Keyboard.dismiss();
    setSavingNote(true);
    try {
      await updateWine.mutateAsync({ id: wine!.id, updates: { cellar_note: null } });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      setNoteText('');
      setCellarNoteOpen(false);
      setCellarNoteViewOpen(false);
    } catch {
      showAlert({ title: 'Error', body: 'Could not delete note.' });
    } finally {
      setSavingNote(false);
    }
  }

  // Which PHYSICAL place the bottles being archived come from. Set by the "Archive
  // from which location?" chooser; read inside handleArchiveWine. A ref (not state)
  // so the value is available synchronously to the archive that runs right after the
  // chooser tap, with no setState-timing race.
  const archiveSourceRef = useRef<ArchiveSource | null>(null);

  // Break the wine's bottles into the distinct physical places they sit in, so the
  // user can say WHERE an archived bottle comes from when it's split. Each rack is
  // its own bucket; each alt-cellar location its own; bins and loose are single
  // buckets. Empty buckets are omitted.
  function archiveSourceBuckets(): ArchiveSource[] {
    const buckets: ArchiveSource[] = [];
    const rackCounts = new Map<string, number>();
    for (const p of winePlacements) {
      if (p.kind === 'rack' && p.rack_id) rackCounts.set(p.rack_id, (rackCounts.get(p.rack_id) ?? 0) + (p.quantity ?? 1));
    }
    for (const [rackId, count] of rackCounts) {
      buckets.push({ kind: 'rack', rackId, label: racks.find((r) => r.id === rackId)?.name ?? 'a rack', count });
    }
    const locCounts = new Map<string, number>();
    for (const p of winePlacements) {
      if (p.kind === 'location' && p.storage_location_id) locCounts.set(p.storage_location_id, (locCounts.get(p.storage_location_id) ?? 0) + (p.quantity ?? 0));
    }
    for (const [locId, count] of locCounts) {
      buckets.push({ kind: 'location', locationId: locId, label: storageLocations.find((l) => l.id === locId)?.name ?? 'a home storage location', count });
    }
    const binCount = winePlacements.filter((p) => p.kind === 'bin').reduce((s, p) => s + (p.quantity ?? 0), 0);
    if (binCount > 0) buckets.push({ kind: 'bin', label: 'a wine bin', count: binCount });
    const loose = Math.max(0, (wine!.quantity ?? 0) - placedCount(winePlacements));
    if (loose > 0) buckets.push({ kind: 'loose', label: 'Not yet placed (loose)', count: loose });
    return buckets;
  }

  // Every physical place this wine's bottles sit — racks + storage-location
  // placements (home or external) + bins — for the "View in Cellar" link/popup.
  // Home entries carry an href to that cellar's view; external ones don't
  // (external cellars aren't browsable).
  function buildCellarEntries(): { key: string; label: string; quantity: number | null; caseFormat: string | null; isExternal: boolean; href: string | null }[] {
    const entries: { key: string; label: string; quantity: number | null; caseFormat: string | null; isExternal: boolean; href: string | null }[] = [];
    for (const { rack, count } of wineRacks) {
      entries.push({ key: `rack-${rack.id}`, label: rack.name, quantity: count, caseFormat: null, isExternal: false, href: `/cellar/rack/${rack.id}?highlight=${wine!.id}` });
    }
    for (const p of locationPlacements) {
      const loc = storageLocations.find((l) => l.id === p.storage_location_id);
      const cs = placementCases.find((c) => c.id === p.case_id);
      entries.push({
        key: p.id,
        label: loc?.name ?? 'A location',
        quantity: p.quantity ?? null,
        caseFormat: cs?.name ?? null,
        isExternal: !!loc?.is_external,
        href: loc?.is_external ? null : `/cellar/storage-location/${p.storage_location_id}`,
      });
    }
    for (const p of winePlacements.filter((x) => x.kind === 'bin')) {
      entries.push({ key: p.id, label: 'Wine bin', quantity: p.quantity ?? null, caseFormat: null, isExternal: false, href: null });
    }
    return entries;
  }

  // Tapped "Archive Wine" in the modal. For a PARTIAL archive of a wine split across
  // more than one place — and not already scoped by a tapped rack slot — ask which
  // place the bottles come from first, then archive. Otherwise archive straight away.
  async function onArchivePressed() {
    const count = parseInt(removeCount) || 0;
    const isPartial = count >= 1 && count < (wine!.quantity ?? 0);
    if (isPartial && !tappedSlot) {
      const buckets = archiveSourceBuckets();
      if (buckets.length > 1) {
        setArchiveModalOpen(false);
        showAlert({
          title: 'Archive the bottle from which location?',
          body: 'This wine is split across more than one place — choose where these bottles come from.',
          buttons: [
            ...buckets.map((b) => ({ text: `${b.label} · ${b.count} bottle${b.count === 1 ? '' : 's'}`, onPress: () => { void runArchive(b); } })),
            { text: 'Cancel', style: 'cancel' as const },
          ],
        });
        return;
      }
    }
    await runArchive(null);
  }

  async function runArchive(source: ArchiveSource | null) {
    archiveSourceRef.current = source;
    try {
      await handleArchiveWine();
    } finally {
      archiveSourceRef.current = null;
      setArchiveModalOpen(false);
    }
  }

  async function handleArchiveWine() {
    const count = parseInt(removeCount) || 0;
    if (count < 1) {
      showAlert({ title: 'Invalid', body: 'Enter at least 1 bottle to archive.' });
      return;
    }
    if (count > wine!.quantity) {
      showAlert({ title: 'Invalid', body: `You only have ${wine!.quantity} bottle${wine!.quantity === 1 ? '' : 's'}.` });
      return;
    }

    const newQuantity = wine!.quantity - count;
    const wineLabel = [wine!.producer, wine!.wine_name].filter(Boolean).join(' ') || (wine!.wine_name ?? 'this wine');
    const confirmMsg = `${count} bottle${count === 1 ? '' : 's'} of ${wineLabel} ${count === 1 ? 'has' : 'have'} been archived from your cellar.`;

    setRemoving(true);
    try {
      // Log the structured removal event regardless of partial vs full —
      // these power the Removal History block on the wine card and the
      // Cellar Archive view.
      await addCellarWineRemoval({
        cellarWineId: wine!.id,
        removedAt: removeDate,
        count,
        note: removeNote.trim() || null,
      });
      qc.invalidateQueries({ queryKey: ['cellar-removals', wine!.id] });

      if (newQuantity === 0) {
        // Archive the row with the actual number removed in this event so the
        // "Bottles in My Archive" stat on the wine card sums correctly.
        await updateWine.mutateAsync({
          id: wine!.id,
          updates: {
            quantity: count,
            archived_at: `${removeDate}T12:00:00.000Z`,
          },
        });
        await clearWineFromRacks(wine!.id);
        // Also drop its alt-cellar ('location') placements — these are app-owned
        // (migration 106) and NOT cleared by clearWineFromRacks, so without this
        // an archived bottle's thumbnail lingers in the home storage location
        // screen (which reads cellar_placements) even after a refetch.
        await clearLocationPlacements(wine!.id);
        // Leaving the cellar also leaves any case it was boxed in — clear the
        // case pointer and sweep a now-empty case, so a wine archived from its
        // own card (not the location menu) doesn't leave a ghost case behind.
        const archLocId = wine!.storage_location_id;
        await assignWineToCase(wine!.id, null);
        if (archLocId) await deleteEmptyCasesForLocation(archLocId).catch(() => {});
        if (session?.user.id) {
          // Drop the archived wine from the live cellar cache straight away —
          // it no longer belongs in the Cellar List, and leaving it there
          // would let a fresh add falsely match it as a duplicate if the
          // refetch lags or fails.
          qc.setQueryData<CellarWine[]>(['cellar', session.user.id], (old) =>
            (old ?? []).filter((w) => w.id !== wine!.id));
          qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
          qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
        }
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        // Refresh the alt-cellar screens broadly. Keying off the legacy
        // storage_location_id (as before) skipped this entirely for
        // placements-native alt-cellar wines, where that column is null — the
        // root cause of the archived-bottle thumbnail lingering in the location.
        qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
        qc.invalidateQueries({ queryKey: ['storage-location-cases'] });
        qc.invalidateQueries({ queryKey: ['storage-locations'] });
        showAlert({
          title: 'Archived',
          body: confirmMsg,
          buttons: [{ text: 'OK', onPress: () => router.back() }],
        });
      } else {
        // Partial removal. FREE THE PHYSICAL BOTTLES FIRST, then decrement the
        // cellar row. Order is critical: the quantity update fires the mig-107 trim
        // trigger, which trims location placements down to (quantity − rack/bin). If
        // we decremented first, that trim would run against the STALE (pre-removal)
        // rack/location counts and delete the wrong bottle — e.g. nuking an alt-cellar
        // bottle when the user archived a RACK one. Freeing first leaves the placements
        // already correct, so the trim (and the rack/bin resync) is a clean no-op.
        //
        // Base the freeing plan on a FRESH placement read. The React-Query snapshot can
        // be empty/stale, which used to make `loose` too high and leave placements
        // un-freed — quantity drifting below placed, then the heal baking in a phantom
        // bottle.
        const freshPlacements = await fetchPlacementsForWine(wine!.id).catch(() => winePlacements);
        const placedBefore = placedCount(freshPlacements);
        // If the user opened this card by tapping a SPECIFIC rack slot, remove THAT
        // exact bottle FIRST — even when loose (unplaced) stock exists — so the
        // thumbnail they pressed is the one that disappears. Any remainder then comes
        // from loose bottles first, then other placements.
        let remaining = count;
        let freedAny = false;
        const source = archiveSourceRef.current;
        if (tappedSlot && Number.isFinite(tappedSlot.row) && Number.isFinite(tappedSlot.col)) {
          await clearSlot(tappedSlot.rackId, tappedSlot.row, tappedSlot.col);
          remaining -= 1;
          freedAny = true;
        } else if (source && (source.kind === 'rack' || source.kind === 'location')) {
          // The user chose a specific physical place — take from THERE first (even when
          // loose bottles exist), so the bottle leaves the place they picked. Only the
          // overflow beyond that place spills to the default loose-first fallback below.
          const take = Math.min(remaining, source.count);
          if (take > 0) {
            if (source.kind === 'rack') await removeSlotsForWine(wine!.id, take, source.rackId);
            else await releaseFromLocation(wine!.id, source.locationId, take);
            remaining -= take;
            freedAny = true;
          }
        }
        // 'bin'/'loose' sources (and any overflow) fall through here. A bin mirrors
        // quantity — the mig-104 resync rebuilds it on the quantity update — and loose
        // bottles have no placement, so this frees from placements ONLY when the removal
        // still exceeds the loose bottles.
        if (remaining > 0) {
          const loose = Math.max(0, (wine!.quantity ?? 0) - placedBefore);
          const toFree = Math.max(0, remaining - loose);
          if (toFree > 0) { await releaseBottlesFromPlacements(wine!.id, toFree); freedAny = true; }
        }
        // Now decrement the live cellar row and clone an archive row carrying the
        // bottles removed in this event. Without the clone, the "Bottles in My Archive"
        // stat (which sums archived matching rows) wouldn't reflect the bottles pulled.
        await updateWine.mutateAsync({
          id: wine!.id,
          updates: { quantity: newQuantity },
        });
        const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = wine!;
        await addCellarWine({
          ...rest,
          quantity: count,
          archived_at: `${removeDate}T12:00:00.000Z`,
          is_wishlist: false,
        });
        if (session?.user.id) {
          qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
        }
        if (freedAny) {
          qc.invalidateQueries({ queryKey: ['slot-assignments'] });
          qc.invalidateQueries({ queryKey: ['rack-slots'] });
          qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
        }
        setRackRemovalMsg(null);
        qc.invalidateQueries({ queryKey: ['placements', wine!.id] });
        qc.invalidateQueries({ queryKey: ['placements-list'] });
        setRemoveCount('1');
        setRemoveNote('');
        setArchiveModalOpen(false);
        showAlert({ title: 'Archived', body: confirmMsg });
      }
      // Removal was scoped to a location → untag the wine from it. Single-row
      // delete (not a full set-replace), so other members are never touched.
      if (removeLocationId) {
        await removeWineFromFilter(removeLocationId, wine!.id);
        qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
        setRemoveLocationId(null);
      }
    } catch {
      showAlert({ title: 'Error', body: 'Could not record removal. Please try again.' });
    } finally {
      setRemoving(false);
    }
  }

  async function handleAddBottles() {
    const count = parseInt(addBottlesCount) || 0;
    if (count < 1) {
      showAlert({ title: 'Invalid', body: 'Enter at least 1 bottle to add.' });
      return;
    }
    setAddingBottles(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: { quantity: wine!.quantity + count },
      });
      // If the user picked a Location for this add, file the wine under it.
      // Incremental insert (ignores duplicates) — never rewrites the set from a
      // cached list, so a stale cache can't drop the location's other wines.
      if (pendingLocationId) {
        await addWinesToFilter(pendingLocationId, [wine!.id]);
        qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
      }
      setAddBottlesOpen(false);
      setAddBottlesCount('1');
      setPendingLocationId(null);
    } catch {
      showAlert({ title: 'Error', body: 'Could not add bottles. Please try again.' });
    } finally {
      setAddingBottles(false);
    }
  }

  async function handleSavePrice() {
    Keyboard.dismiss();
    const trimmed = purchasePriceDraft.trim();
    const parsed = trimmed ? Number(trimmed) : null;
    if (trimmed && (parsed === null || Number.isNaN(parsed) || parsed < 0)) {
      showAlert({ title: 'Invalid', body: 'Enter a positive number for the purchase price.' });
      return;
    }
    setSavingPrice(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: {
          purchase_price: parsed,
          // Stamp the user's current currency only on first entry; preserve
          // existing currency on subsequent edits so historical prices stay
          // in their original currency.
          ...(wine!.purchase_price_currency ? {} : { purchase_price_currency: preferences?.defaultCurrency ?? 'GBP' }),
        },
      });
      setEditingPrice(false);
    } catch {
      showAlert({ title: 'Error', body: 'Could not save purchase price.' });
    } finally {
      setSavingPrice(false);
    }
  }

  // The Your Review chevron just expands/collapses the read-only note now —
  // editing happens in EditCellarReviewModal, so there's no save-on-collapse
  // (which previously saved date-stamp-only reviews). Personal Notes still
  // uses the inline auto-save pattern below.
  function toggleReview() {
    setReviewExpanded((v) => !v);
  }

  async function handleRemoveWine() {
    // Respects the quantity entered in the Archive/Delete sheet. Deleting FEWER
    // than all bottles of a LIVE wine is a partial delete — decrement the row
    // and free that many rack slots, leaving the rest. Only "all" (or an
    // already-archived record) removes the whole cellar_wines row.
    if (!wine) return;
    const count = Math.max(1, Math.min(parseInt(removeCount) || wine.quantity, wine.quantity));
    const partial = !isArchived && count < wine.quantity;
    setRemoving(true);
    // Remember the location before the row (and its case pointer) is gone, so a
    // now-empty case can be swept and that location's lists refreshed.
    const delLocId = wine.storage_location_id;
    try {
      if (partial) {
        await updateWine.mutateAsync({ id: wine.id, updates: { quantity: wine.quantity - count } });
        // Free `count` bottles taking loose ones first, then rack slots, then
        // alt-cellar placements — so removing bottles that lived in an alt cellar
        // doesn't leave ghost bottles there (removeSlotsForWine touched racks only).
        const wp = await fetchPlacementsForWine(wine.id);
        const unplaced = Math.max(0, wine.quantity - placedCount(wp));
        const toFree = Math.max(0, count - unplaced);
        if (toFree > 0) await releaseBottlesFromPlacements(wine.id, toFree);
        qc.invalidateQueries({ queryKey: ['cellar'] });
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
        setRemoveStep('idle');
        setRemoveCount('1');
        setRemoveNote('');
        setRemoving(false);
        return;
      }
      await clearWineFromRacks(wine.id);
      const { error } = await supabase.from('cellar_wines').delete().eq('id', wine.id);
      if (error) throw error;
      evictCachedLabel(wine.label_image_path); // drop the local cached label
      if (delLocId) {
        await deleteEmptyCasesForLocation(delLocId).catch(() => {});
        qc.invalidateQueries({ queryKey: ['storage-location-wines', delLocId] });
        qc.invalidateQueries({ queryKey: ['storage-location-cases', delLocId] });
        qc.invalidateQueries({ queryKey: ['storage-locations'] });
      }
      // Prune the deleted wine from the cached cellar list synchronously, so
      // its "memory" is gone immediately and the duplicate-detection on a
      // fresh add can never match it — even if the background refetch below
      // is slow or fails on a flaky connection (which previously left the
      // stale row in cache for up to gcTime and triggered a false
      // "already in your cellar" prompt).
      if (session?.user.id) {
        qc.setQueryData<CellarWine[]>(['cellar', session.user.id], (old) =>
          (old ?? []).filter((w) => w.id !== wine.id));
      }
      qc.invalidateQueries({ queryKey: ['cellar'] });
      qc.invalidateQueries({ queryKey: ['cellar-archive'] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      // The FK cascade drops the wine from every location's membership; refresh
      // the Location lists so those counts update without a manual reload.
      qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
      setRemoveStep('idle');
      // Flip the just-deleted flag BEFORE the cellar refetch can land — the
      // dedicated render block at the top of the component renders the
      // toast and suppresses the "Wine not found" fallback. Auto-dismiss
      // after a beat, then navigate back to wherever the user came from.
      setJustDeleted(true);
      setTimeout(() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(tabs)/cellar');
      }, 1400);
    } catch {
      setRemoveStep('idle');
      showAlert({ title: 'Could not remove', body: 'Please try again.' });
    } finally {
      setRemoving(false);
    }
  }

  // opts pins a specific variant (from the "confirm this wine" grape prompt) and
  // can force past the ambiguity gate. When called straight from a button onPress
  // the press event lands in `opts` harmlessly — all its fields read undefined.
  async function handleRefreshEstimate(opts?: {
    wineNameForQuery?: string;
    style?: string | null;
    grape?: string | null;
    force?: boolean;
  }): Promise<boolean | 'ambiguous'> {
    if (!wine) return false;
    setRefreshingValue(true);
    const currency = preferences?.defaultCurrency ?? 'GBP';
    // A grape is "pinned" when the user just picked a variant, or the wine
    // already carries one — either way we trust it and skip the ambiguity gate.
    const pinnedGrape = opts?.grape ?? wine.grape_variety ?? null;
    try {
      // valueWine() tries Wine-Searcher first (real market price + ws-score as
      // the critic-score anchor), falling back to the Claude estimate when
      // there's no match. The critic score is always a Vinster score, anchored
      // to Wine-Searcher's when available.
      const v = await valueWine({
        producer: wine.producer ?? '',
        region: wine.region ?? '',
        // A picked variant appends its grape to the query so Wine-Searcher and
        // the intel resolve the RIGHT wine (e.g. the Syrah, not the Chenin).
        wineName: opts?.wineNameForQuery ?? (wine.wine_name || null),
        vintage: wine.vintage || 'NV',
        style: opts?.style ?? wine.style ?? null,
        grape: pinnedGrape,
      } as any, currency);

      // Genuine grape ambiguity (same name = two different wines) and nothing
      // pins which one yet: don't commit a guessed card — ask the user first.
      // The intel card really can't be accurate until Vinster knows the variety.
      if (!opts?.force && v.grapeAmbiguous && !pinnedGrape && (v.grapeOptions?.length ?? 0) >= 2) {
        setGrapeVariants(v.grapeOptions);
        setSelectedVariant(null);
        setGrapeConfirmOpen(true);
        return 'ambiguous';
      }

      await updateWine.mutateAsync({
        id: wine.id,
        updates: {
          estimated_value: v.estimatedValue,
          estimated_value_currency: v.currency,
          estimated_value_at: new Date().toISOString(),
          estimated_value_source: v.valueSource,
          // The Wine-Searcher offer spread the headline value averages.
          estimated_value_low: v.estimatedValueLow ?? null,
          estimated_value_high: v.estimatedValueHigh ?? null,
          // Exact-vintage vs all-vintage fallback, so the value's sub-label and
          // the market note below stay accurate after this refetch.
          estimated_value_scope: v.priceScope ?? null,
          // Keep the (WS-anchored) critic score fresh on refresh too.
          critic_score: v.criticScore,
          critic_score_note: v.criticScoreNote,
          // Canonical identity anchor when Wine-Searcher matched.
          ...(v.wsWineId ? { ws_wine_id: v.wsWineId, ws_wine_name: v.wsWineName ?? null } : {}),
          // valueWine() also returns Vinster's tasting note + drinking window
          // (+ grape). Persist them so imported/bare wines gain a Vinster's
          // Review and drinking window from the same Generate action — these
          // were previously discarded, leaving the note permanently blank.
          tasting_notes: v.tastingNotes ?? wine.tasting_notes ?? null,
          insider_note: v.insiderNote ?? wine.insider_note ?? null,
          drinking_window_from: v.drinkingWindowFrom ?? wine.drinking_window_from ?? null,
          drinking_window_to: v.drinkingWindowTo ?? wine.drinking_window_to ?? null,
          drinking_window_status: v.drinkingWindowStatus ?? wine.drinking_window_status ?? 'unknown',
          // Pin the confirmed variant's grape (and style) when the user picked
          // one; otherwise keep any existing grape, else Vinster's best guess.
          grape_variety: pinnedGrape ?? v.grapeVariety ?? null,
          ...(opts?.style ? { style: opts.style } : {}),
          // Seed an estimated purchase price from the market value when the user
          // hasn't entered one — never clobber a real price they've recorded.
          purchase_price: wine.purchase_price ?? v.estimatedValue ?? null,
          purchase_price_currency: wine.purchase_price != null ? wine.purchase_price_currency : (v.currency ?? null),
        },
      });
      // Whether intel actually came back — used to decide if the "couldn't
      // generate" prompt is warranted (vs a false flash while the cache
      // refetches the freshly-saved values).
      return v.criticScore != null || v.estimatedValue != null;
    } catch {
      showAlert({ title: 'Could not refresh', body: 'Vinster couldn\'t generate an estimate right now. Please try again.' });
      return false;
    } finally {
      setRefreshingValue(false);
    }
  }

  // User picked a variant in the "confirm this wine" prompt — regenerate intel
  // pinned to that grape (behind the full-screen tracker, so the card only ever
  // reappears finished and accurate).
  async function confirmGrapeVariant() {
    if (selectedVariant == null || !wine) return;
    const opt = grapeVariants[selectedVariant];
    if (!opt) return;
    setGrapeConfirmOpen(false);
    setAutoGenerating(true);
    const wineNameForQuery = [wine.wine_name, opt.grape].filter(Boolean).join(' ');
    try {
      await handleRefreshEstimate({ wineNameForQuery, style: opt.style, grape: opt.grape });
    } finally {
      setAutoGenerating(false);
    }
  }

  // "None of these" escape hatch — the user must always get a card, so generate
  // with Vinster's best-guess grape rather than blocking on the prompt.
  async function generateWithoutGrapeConfirm() {
    setGrapeConfirmOpen(false);
    setAutoGenerating(true);
    try {
      await handleRefreshEstimate({ force: true });
    } finally {
      setAutoGenerating(false);
    }
  }

  async function handlePostToCommunity() {
    if (!wine || postingReview || reviewPosted) return;
    if (!session?.user.id) {
      showAlert({ title: 'Sign in required', body: 'You need an account to post a review to the community.' });
      return;
    }
    const titleParts = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean);
    const title = titleParts.join(' · ').trim() || wine.wine_name || 'Wine review';
    const subtitleParts = [wine.region, wine.grape_variety].filter(Boolean);
    const subtitle = subtitleParts.join(' · ') || null;
    // Prefer the new review_note column for the post body; fall back
    // to user_notes for legacy rows where the user wrote everything
    // into "Additional Notes" before the split (migration 043).
    const body = (wine.review_note ?? '').trim() || (wine.user_notes ?? '').trim() || null;
    showAlert({
      title: 'Share with the community?',
      body: `Post your review of ${title} to the Vinster community feed. Other users will be able to read your notes and rating.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Post',
          onPress: async () => {
            setPostingReview(true);
            try {
              const displayName = (session.user.email ?? '').split('@')[0] || null;
              await publishCommunityReview(
                {
                  category: 'wine',
                  source_table: 'cellar_wines',
                  source_id: wine.id,
                  title,
                  subtitle,
                  rating: wine.review_score,
                  body,
                  metadata: {
                    producer: wine.producer ?? null,
                    region: wine.region ?? null,
                    vintage: wine.vintage ?? null,
                    grape_variety: wine.grape_variety ?? null,
                    critic_score: wine.critic_score ?? null,
                    review_date: wine.review_date ?? null,
                  },
                },
                displayName,
              );
              setReviewPosted(true);
              showAlert({ title: 'Shared to community', body: 'Thanks for sharing your review — it now appears in the Vinster community feed.' });
            } catch (err) {
              const detail = err instanceof Error ? err.message : String(err);
              const alreadyPosted = detail.toLowerCase().includes('community_reviews_source_unique') || detail.toLowerCase().includes('duplicate');
              if (alreadyPosted) {
                setReviewPosted(true);
                showAlert({ title: 'Already shared', body: 'You\'ve already posted a review of this wine to the community.' });
              } else {
                showAlert({ title: 'Could not post', body: detail });
              }
            } finally {
              setPostingReview(false);
            }
          },
        },
      ],
    });
  }

  // Share the review as a branded PNG card via the native share sheet
  // (WhatsApp, Messages, Instagram, etc.). Mirrors the Wine Reviews
  // share flow so all three Vinster review surfaces use the same card.
  async function handleShareReviewOutside() {
    if (!wine || sharingOutside) return;
    const headerLine = (() => {
      const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
      return sameName
        ? [wine.producer, wine.vintage].filter(Boolean).join(' ')
        : [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ');
    })();
    let labelUri: string | null = null;
    if (wine.label_image_path) {
      try { labelUri = await getCachedLabelUri(wine.label_image_path); } catch { /* no photo */ }
    }
    setReviewSharePayload({
      producer: wine.producer,
      wineName: wine.wine_name,
      vintage: wine.vintage,
      region: wine.region,
      userScore: wine.review_score,
      criticScore: wine.critic_score,
      tastingNote: wine.review_note ?? wine.user_notes ?? '',
      otherObservations: null,
      date: wine.review_date ? new Date(wine.review_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
      location: wine.review_location ?? null,
      isFavourite: wine.is_favourite,
      imageUri: labelUri,
    });
    setSharingOutside(true);
    try {
      // One paint to let the off-screen card mount with the new props.
      await new Promise((r) => setTimeout(r, 250));
      if (reviewShareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(reviewShareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a wine review') });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const note = (wine.review_note ?? '').trim();
      const noteFormatted = note ? `\n\n"${note}"` : '';
      const scoreText = wine.review_score != null ? `\nMy score: ${wine.review_score}/100` : '';
      const locFormatted = wine.review_location ? `\nWhere: ${wine.review_location}` : '';
      await Share.share({
        message: `${headerLine}${scoreText}${locFormatted}${noteFormatted}${VINSTER_TEXT_SHARE_FOOTER}`,
        title: headerLine,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharingOutside(false);
      setReviewSharePayload(null);
    }
  }

  async function handleShareIntel() {
    if (!wine || sharingIntel) return;
    const headerLine = (() => {
      const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
      return sameName
        ? [wine.producer, wine.vintage].filter(Boolean).join(' ')
        : [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ');
    })();
    // Only share an unambiguous year range — skip the bare "Unknown" status.
    const drinkingWindow = wine.drinking_window_from && wine.drinking_window_to
      ? `${wine.drinking_window_from}–${wine.drinking_window_to}`
      : null;
    const estimatedValue = wine.estimated_value != null
      ? formatCurrency(Number(wine.estimated_value), wine.estimated_value_currency, { decimals: 0 })
      : null;
    // Resolve the stored label photo to a local uri up front so the off-screen
    // card includes it in the captured PNG.
    let labelUri: string | null = null;
    if (wine.label_image_path) {
      try { labelUri = await getCachedLabelUri(wine.label_image_path); } catch { /* no photo */ }
    }
    setIntelSharePayload({
      producer: wine.producer,
      wineName: wine.wine_name,
      vintage: wine.vintage,
      region: wine.region,
      grape: wine.grape_variety,
      criticScore: wine.critic_score,
      drinkingWindow,
      estimatedValue,
      tastingNote: wine.tasting_notes,
      imageUri: labelUri,
    });
    setSharingIntel(true);
    try {
      // One paint to let the off-screen card mount with the new props.
      await new Promise((r) => setTimeout(r, 250));
      if (intelShareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(intelShareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a wine note') });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const lines: string[] = [];
      if (wine.critic_score != null) lines.push(`Critic score: ${wine.critic_score} pts`);
      if (drinkingWindow) lines.push(`Drinking window: ${drinkingWindow}`);
      if (estimatedValue) lines.push(`Estimated value: ${estimatedValue}`);
      const note = (wine.tasting_notes ?? '').trim();
      const noteFormatted = note ? `\n\n${note}` : '';
      const statsFormatted = lines.length ? `\n${lines.join('\n')}` : '';
      await Share.share({
        message: `${headerLine}${statsFormatted}${noteFormatted}${VINSTER_TEXT_SHARE_FOOTER}`,
        title: headerLine,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharingIntel(false);
      setIntelSharePayload(null);
    }
  }

  function handleFindPairings() {
    if (!wine) return;
    // Route through the same per-search preferences screen that the Chef
    // tab uses (dietary / allergy / difficulty / time / specific concerns),
    // rather than generating pairings inline from profile preferences only.
    // The screen reads wineDetailsConfirmed from the label store, so we set
    // it here. from=cellar lets the results screen know to route Back to
    // the wine card on tap rather than to the Chef tab.
    const confirmed: WineDetailsComplete = {
      producer: wine.producer || '',
      region: wine.region || '',
      wineName: wine.wine_name || null,
      vintage: wine.vintage || 'NV',
      style: null,
    };
    setWineDetailsConfirmed(confirmed);
    router.push(`/chef/review-requirements?from=cellar&wineId=${wine.id}`);
  }

  if (findingPairings) {
    return (
      <SearchProgress
        title="Crafting your pairings…"
        subtitle="Vinster needs up to a minute for your result"
        body="Vinster is selecting three chef-inspired dishes to complement your wine"
        durationMs={60000}
      />
    );
  }

  // Drinking-window status — use the SINGLE canonical derivation (maturity.ts,
  // the same one the Full Cellar List filter, Cellar Statistics and the Drink Now
  // carousel use), so the status shown on the card always matches the bucket the
  // filter puts the wine in. It derives from the from/to years when present
  // (always current) and falls back to the stored status only when there are none.
  const effectiveWindowStatus = effectiveMaturity(wine);
  const windowColor = STATUS_COLORS[effectiveWindowStatus] ?? colors.textMuted;
  const windowLabel = STATUS_LABELS[effectiveWindowStatus] ?? 'Unknown';

  // Count bottles across all rows (cellar + archive) that match this wine's
  // identity. Producer + wine name + vintage normalised so 'NV' / null /
  // case differences don't fragment the count.
  const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
  // Same wine + same vintage, matched on the shared identity KEY rather than
  // exact producer/name equality — so a bottle archived while the wine was
  // stored under a slightly different name-split (e.g. 'Château X' vs 'X', or a
  // scan vs a re-add) is still recognised as the same wine and remembered in
  // "Bottles in My Archive". Mirrors the review/search dedup hardening.
  const wineKey = wineNameKey(wine.producer, wine.wine_name);
  const matchesIdentity = (w: typeof wine) =>
    wineNameKey(w.producer, w.wine_name) === wineKey &&
    norm(w.vintage) === norm(wine.vintage);
  const bottlesInCellar = wines.filter(matchesIdentity).reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  const archivedMatches = archivedWines.filter(matchesIdentity);
  const bottlesInArchive = archivedMatches.reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  // Most-recent archive date + bottle size among the matching archived bottles,
  // for the "Bottles in My Archive" stat (e.g. "1x75cl, 24/06/26").
  const lastArchivedAt = archivedMatches.reduce<string | null>((latest, w) => {
    if (!w.archived_at) return latest;
    return !latest || new Date(w.archived_at).getTime() > new Date(latest).getTime() ? w.archived_at : latest;
  }, null);
  const archiveBottleMl = archivedMatches.find((w) => w.bottle_size_ml)?.bottle_size_ml ?? wine.bottle_size_ml ?? 750;

  function bottleLabel(n: number) {
    return `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
  }

  // Wishlist-only delete. Confirms first, then removes the wishlist row
  // and routes back to the Wish List. Reuses the justDeleted toast +
  // auto-navigate pattern used by the cellar hard-delete above.
  function handleDeleteFromWishlist() {
    if (!wine) return;
    showAlert({
      title: 'Remove from wish list?',
      body: 'This will remove the wine from your wish list. You can add it again any time.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await deleteWishlistWine.mutateAsync(wine.id);
              setJustDeleted(true);
              setTimeout(() => {
                if (router.canGoBack()) router.back();
                else router.replace('/cellar/list');
              }, 1400);
            } catch {
              showAlert({ title: 'Could not remove', body: 'Please try again.' });
            } finally {
              setRemoving(false);
            }
          },
        },
      ],
    });
  }

  // From an archived wine card, the review flow should return the user back
  // HERE (backTo) with a "saved to Your Wine Reviews" confirmation, rather than
  // stranding them on the reviews list.
  // Always return to THIS wine card when the review closes: a cellar review lives
  // in Your Wine Reviews, but the user opened it from here and should land back
  // here — not stranded on the reviews list. Archived wines also get the "saved
  // to Your Wine Reviews" confirmation toast.
  const archiveReviewReturn = `&backTo=${encodeURIComponent(`/cellar/${wine.id}`)}${
    isArchived ? `&savedToast=${encodeURIComponent([wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ') || wine.wine_name || 'this wine')}` : ''
  }`;

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      keyboardShouldPersistTaps="always"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      bottomOffset={24}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text accessibilityLabel="Back" style={[styles.backText, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        {/* Card-type label — sits centred between Back and the star
            so it reads as a chip / breadcrumb identifying which kind
            of card the user is looking at. */}
        <Text style={styles.cardTypeLabel}>
          {isWishlist ? 'Wish List Wine' : isArchived ? 'Archived Wine' : 'Wine Card'}
        </Text>
        {/* Export moved to a button above Archive/Delete; keep a spacer so the
            card-type label stays centred between Back and this edge. */}
        <View style={styles.topBarSpacer} />
      </View>

      {/* Date cellared — sits just below the 'Wine Card' chip, with a gap before
          the wine name. Same muted style as before. */}
      {(() => {
        const added = wine.date_received ?? wine.created_at;
        if (!added) return null;
        const cellaredLabel = `Cellared ${new Date(added).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        return <Text style={styles.addedDateTop}>{cellaredLabel}</Text>;
      })()}

      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* Thumbnail to the left of the name. Tap to view; long-press an
              existing photo to change or delete it (no separate button). */}
          <TouchableOpacity
            onPress={() => (wine.label_image_path ? setPhotoViewerOpen(true) : handleAddPhoto())}
            onLongPress={() => (wine.label_image_path ? handlePhotoMenu() : handleAddPhoto())}
            delayLongPress={350}
            activeOpacity={0.85}
          >
            <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.detailThumb} />
          </TouchableOpacity>
          {/* Tap the identity (name · region · vintage / grape) to edit the wine
              — the standalone "Edit" link was removed in favour of this. */}
          <TouchableOpacity
            style={styles.headerTextCol}
            onPress={() => router.push(`/cellar/edit-wine/${wine.id}` as any)}
            activeOpacity={0.7}
          >
            <WineIdentityHeader
              producer={wine.producer}
              wineName={wine.wine_name}
              vintage={wine.vintage}
              region={wine.region}
              grape={wine.grape_variety}
              align="left"
              size="lg"
            />
            {/* Bottle format is NOT shown here — it lives in the "Bottles in My
                Cellar" count below (e.g. "1x75cl"). */}
          </TouchableOpacity>
        </View>
        {uploadingPhoto ? <Text style={styles.photoSaving}>Saving photo…</Text> : null}
      </View>

      <LabelPhotoViewer
        visible={photoViewerOpen}
        path={wine.label_image_path}
        fallbackText={wine.wine_name}
        onClose={() => setPhotoViewerOpen(false)}
      />

      {/* "Confirm this wine" — shown when the same producer + name is sold as
          more than one wine (e.g. a Syrah AND a Chenin). Picking the variant
          pins the grape so the intel card is accurate. Mirrors the scan flow's
          confirm popup. */}
      {/* Archive / removal history — opened from the "View Archive History" link. */}
      <Modal visible={archiveHistoryOpen} transparent animationType="fade" onRequestClose={() => setArchiveHistoryOpen(false)}>
        <View style={styles.titleEditOverlay}>
          <View style={styles.titleEditSheet}>
            <Text style={styles.titleEditHeading}>Archive History</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {removals.map((ev) => (<RemovalRow key={ev.id} removal={ev} />))}
            </ScrollView>
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => setArchiveHistoryOpen(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={grapeConfirmOpen} transparent animationType="fade" onRequestClose={() => setGrapeConfirmOpen(false)}>
        <View style={styles.candOverlay}>
          <View style={styles.candSheet}>
            <Text style={styles.candTitle}>Confirm this wine</Text>
            <Text style={styles.candBody}>
              {[wine.producer, wine.wine_name].filter(Boolean).join(' ')} is made as more than one wine under this name. Which is this? Vinster needs the grape to get the score, value and notes right.
            </Text>
            <View>
              {grapeVariants.map((gv, i) => {
                const on = selectedVariant === i;
                return (
                  <TouchableOpacity key={`${gv.grape}-${i}`} style={styles.candRow} onPress={() => setSelectedVariant(on ? null : i)} activeOpacity={0.7}>
                    <Text style={[styles.candCheck, on && styles.candCheckOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={styles.candRowText}>
                      <Text style={styles.candItemName} numberOfLines={2}>{gv.grape}</Text>
                      {gv.style ? <Text style={styles.candItemMeta} numberOfLines={1}>{gv.style}</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.candConfirmBtn, selectedVariant == null && styles.candConfirmBtnDisabled]}
              onPress={confirmGrapeVariant}
              disabled={selectedVariant == null}
              activeOpacity={0.85}
            >
              <Text style={styles.candConfirmText}>Confirm Wine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.candCancel} onPress={generateWithoutGrapeConfirm}>
              <Text style={styles.candCancelText}>Not sure — let Vinster choose</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit the title — name + grape variety. */}
      <Modal visible={titleEditOpen} transparent animationType="fade" onRequestClose={() => setTitleEditOpen(false)}>
        <KeyboardAvoidingView behavior="padding" style={styles.titleEditOverlay}>
          <View style={styles.titleEditSheet}>
            <Text style={styles.titleEditHeading}>Edit wine</Text>
            {/* Label photo — add / change / remove without leaving the Edit sheet.
                Closes this modal first so the picker/menu isn't stacked behind it. */}
            <Text style={styles.fieldLabel}>Label photo</Text>
            <View style={styles.editPhotoRow}>
              <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.editThumb} />
              <TouchableOpacity
                onPress={() => { setTitleEditOpen(false); void handleAddPhoto(); }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.editPhotoLink}>{wine.label_image_path ? 'Change label photo' : '+ Add label photo'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Producer</Text>
            <TextInput style={styles.input} value={producerDraft} onChangeText={setProducerDraft} placeholder="Producer" placeholderTextColor={colors.textMuted} />
            <Text style={styles.fieldLabel}>Wine name</Text>
            <TextInput style={styles.input} value={wineNameDraft} onChangeText={setWineNameDraft} placeholder="Wine name" placeholderTextColor={colors.textMuted} />
            <Text style={styles.fieldLabel}>Region</Text>
            <TextInput style={styles.input} value={regionDraft} onChangeText={setRegionDraft} placeholder="Region" placeholderTextColor={colors.textMuted} />
            <Text style={styles.fieldLabel}>Vintage</Text>
            <TextInput style={styles.input} value={vintageDraft} onChangeText={setVintageDraft} placeholder="Vintage (e.g. 2019 or NV)" placeholderTextColor={colors.textMuted} maxLength={7} />
            <Text style={styles.fieldLabel}>Grape variety</Text>
            <TextInput style={styles.input} value={grapeDraft} onChangeText={setGrapeDraft} placeholder="Grape variety" placeholderTextColor={colors.textMuted} />
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => setTitleEditOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTitle} disabled={savingTitle}>
                <Text style={styles.saveBtnText}>{savingTitle ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Couldn't-generate-intel prompt. Shows after a failed auto-generate
          (no critic score and no value) — usually a misspelt or wrongly-split
          name. Offers a jump straight into the Edit sheet. */}
      <NoIntelPrompt
        visible={
          !!wine && !isWishlist && !isArchived && !autoGenerating && !refreshingValue &&
          autoGenRef.current === wine.id && autoGenFailed && wine.critic_score == null && wine.estimated_value == null &&
          !noIntelDismissed
        }
        onDismiss={() => setNoIntelDismissed(true)}
        onEdit={() => { setNoIntelDismissed(true); openTitleEdit(); }}
        editLabel="Edit Wine"
      />

      {/* Bottles grid moved ABOVE the chef button so the user can see
          at a glance whether they own (or have owned) the wine before
          deciding whether to pair a meal to it. Hidden for wishlist
          wines — bottle counts don't apply to a wine not yet bought. */}
      {!isWishlist && (
      <View style={[styles.statsGrid, { paddingTop: 0 }]}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Bottles in My Cellar</Text>
          <Text style={styles.statValue}>{bottlesInCellar}x{bottleSizeCl(wine.bottle_size_ml ?? 750)}cl</Text>
          {/* A single yellow "View in Cellar →" (matching "Add to Archive →")
              replaces the inline where-they-are breakdown. A single home location
              navigates straight there; external cellars or a multi-location wine
              open a popup listing each cellar, its quantity and case format. */}
          {(() => {
            const entries = buildCellarEntries();
            const unplaced = Math.max(0, (wine.quantity ?? 0) - placedCount(winePlacements));
            if (entries.length === 0) {
              // Nothing placed yet — keep the "Add to Location" affordance.
              return (!isArchived && !isWishlist) ? (
                <TouchableOpacity onPress={handleAddToLocation}>
                  <Text style={styles.statAction}>Add to Location</Text>
                </TouchableOpacity>
              ) : null;
            }
            // One home location and no stray unplaced bottles → go straight there.
            const singleHome = entries.length === 1 && !entries[0].isExternal && !!entries[0].href && unplaced === 0;
            return (
              <TouchableOpacity onPress={() => singleHome ? router.push(entries[0].href as any) : setCellarViewOpen(true)}>
                <Text style={styles.statAction}>View in Cellar →</Text>
              </TouchableOpacity>
            );
          })()}
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Bottles in My Archive</Text>
          {bottlesInArchive === 0 ? (
            <Text style={[styles.statValue, styles.statValueMuted]}>{bottleLabel(0)}</Text>
          ) : (
            <Text style={styles.statValue}>
              {bottlesInArchive}x{bottleSizeCl(archiveBottleMl)}cl
              {lastArchivedAt ? `, ${new Date(lastArchivedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}` : ''}
            </Text>
          )}
          {/* Archive bottles from the cellar — asks how many (and which location
              if the wine is filed in several), then confirms. Replaces the old
              "I drank some" wording on the cellar side. */}
          {bottlesInCellar > 0 && !isArchived ? (
            <TouchableOpacity onPress={handleRemoveBottlesEntry} activeOpacity={0.7}>
              <Text style={styles.statAction}>Add to Archive →</Text>
            </TouchableOpacity>
          ) : null}
          {/* Quick access to this wine's archive/removal history — only when there
              is one. */}
          {removals.length > 0 ? (
            <TouchableOpacity onPress={() => setArchiveHistoryOpen(true)} activeOpacity={0.7}>
              <Text style={styles.statAction}>View Archive History</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      )}

      {!isArchived && rackRemovalMsg && (
        <Text style={[styles.rackRemovalMsg, { marginHorizontal: spacing.xl }]}>{rackRemovalMsg}</Text>
      )}

      {/* Your Review (left) beside Cellar Note (right); each header stays in its
          column, but its expanded body lays out FULL WIDTH below the row. */}
      <View style={styles.reviewRow}>
        <View style={styles.reviewCol}>
          {/* Your Review — the chevron opens this wine's review in Your Wine
              Reviews when one exists, or jumps straight to the review input
              when it doesn't. No in-card expand; no yellow prompt. */}
          {(() => {
            const hasReview = wine.review_score != null || wine.review_note || wine.review_location || wine.review_date || wine.user_drinking_window;
            const reviewHref = hasReview
              ? `/wines/chosen?openCellarReview=${wine.id}${archiveReviewReturn}`
              : `/wines/chosen?openCellarReviewInput=${wine.id}${archiveReviewReturn}`;
            return (
              <>
                <View style={styles.vinsterHeaderRow}>
                  <TouchableOpacity onPress={() => router.push(reviewHref as any)} activeOpacity={0.7} style={styles.vinsterReviewToggle}>
                    <Text style={styles.vinsterReviewTitle}>Your Review</Text>
                    <Ionicons name="chevron-forward-outline" size={16} color={colors.gold} />
                  </TouchableOpacity>
                </View>
                {/* Collapsed summary when a review exists — also opens the card. */}
                {hasReview ? (
                  <TouchableOpacity onPress={() => router.push(reviewHref as any)} activeOpacity={0.7}>
                    <Text style={styles.reviewScoreLine} numberOfLines={1}>
                      {wine.review_score != null ? <Text style={styles.reviewScoreValue}>{wine.review_score}/100</Text> : null}
                      {wine.review_score != null && wine.review_date ? <Text style={styles.reviewScoreDash}> – </Text> : null}
                      {wine.review_date ? (
                        <Text style={styles.reviewScoreDate}>
                          {new Date(wine.review_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      ) : null}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            );
          })()}
        </View>

        {!isWishlist && (
        <View style={styles.reviewCol}>
          {/* Cellar Note — a short private note, card-only. The chevron opens a
              read-only popup (Edit / Delete) when a note exists, or the manual
              input popup when it doesn't. No yellow prompt. */}
          <View style={styles.vinsterHeaderRow}>
            <TouchableOpacity onPress={() => wine.cellar_note ? setCellarNoteViewOpen(true) : openCellarNote()} activeOpacity={0.7} style={styles.vinsterReviewToggle}>
              <Text style={styles.vinsterReviewTitle}>Cellar Note</Text>
              <Ionicons name="chevron-forward-outline" size={16} color={colors.gold} />
            </TouchableOpacity>
          </View>
          {/* One-line preview when a note exists — tapping it opens the popup. */}
          {wine.cellar_note ? (
            <TouchableOpacity onPress={() => setCellarNoteViewOpen(true)} activeOpacity={0.7}>
              <Text style={styles.cellarNotePreview} numberOfLines={1}>{wine.cellar_note}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        )}
      </View>

      <View style={styles.cardDivider} />

      {/* Compact stats grid — score / window / bottle counts only. The
          Purchase and Estimated values are pulled out into full-width rows
          below so each has room to breathe and a clearer call to action. */}
      <View style={[styles.statsGrid, { paddingBottom: 0 }]}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Avg Critic Score</Text>
          {wine.critic_score != null ? (
            <Text style={styles.statValue}>{wine.critic_score}</Text>
          ) : refreshingValue ? (
            <Text style={[styles.statValue, styles.statValueMuted]}>Generating…</Text>
          ) : (
            <TouchableOpacity onPress={() => handleRefreshEstimate()} disabled={refreshingValue} activeOpacity={0.7}>
              <Text style={styles.statAction}>+ Generate</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Drinking Window</Text>
          <Text style={[styles.statValue, { color: windowColor }]}>{windowLabel}</Text>
          {wine.drinking_window_from && wine.drinking_window_to && (
            <Text style={styles.statSub}>{wine.drinking_window_from}–{wine.drinking_window_to}</Text>
          )}
        </View>
      </View>

      {/* On-demand Serving Suggestions — temperature, decant, glassware and a wine
          to enjoy before/after. Generated on command (not during wine-card
          generation or "update intel") and cached on the wine. */}
      {!isWishlist ? (
        <>
          <View style={styles.reviewRow}>
            <View style={styles.vinsterHeaderRow}>
              <TouchableOpacity onPress={() => setServingOpen((v) => !v)} activeOpacity={0.7} style={styles.vinsterReviewToggle}>
                <Text style={styles.vinsterReviewTitle}>Serving Suggestions</Text>
                <Ionicons name="chevron-forward-outline" size={16} color={colors.gold} />
              </TouchableOpacity>
            </View>
          </View>
          {servingOpen ? (
            <View style={styles.reviewExpandedFull}>
              {wine.serving_suggestion ? (
                <>
                  {wine.serving_suggestion.temperature ? <Text style={styles.servingLine}>Temperature · {wine.serving_suggestion.temperature}</Text> : null}
                  {wine.serving_suggestion.decant ? <Text style={styles.servingLine}>Decanting · {wine.serving_suggestion.decant}</Text> : null}
                  {wine.serving_suggestion.glassware ? <Text style={styles.servingLine}>Glassware · {wine.serving_suggestion.glassware}</Text> : null}
                  {wine.serving_suggestion.aperitif?.style ? <Text style={[styles.servingLine, { marginTop: spacing.sm }]}>Enjoy before · {wine.serving_suggestion.aperitif.style}{wine.serving_suggestion.aperitif.reason ? ` — ${wine.serving_suggestion.aperitif.reason}` : ''}</Text> : null}
                  {wine.serving_suggestion.digestif?.style ? <Text style={styles.servingLine}>Enjoy after · {wine.serving_suggestion.digestif.style}{wine.serving_suggestion.digestif.reason ? ` — ${wine.serving_suggestion.digestif.reason}` : ''}</Text> : null}
                  <TouchableOpacity onPress={handleGenerateServing} disabled={generatingServing} activeOpacity={0.7}>
                    <Text style={styles.diveDeeperLink}>{generatingServing ? 'Regenerating…' : 'Regenerate →'}</Text>
                  </TouchableOpacity>
                </>
              ) : generatingServing ? (
                <Text style={styles.tastingNotes}>Generating…</Text>
              ) : (
                <TouchableOpacity style={styles.generateNoteBtn} onPress={handleGenerateServing} activeOpacity={0.7}>
                  <Text style={styles.generateNoteBtnText}>Generate</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </>
      ) : null}

      <View style={styles.cardDivider} />

      <View style={[styles.statsGrid, { paddingBottom: 0 }]}>
        {!isWishlist && (
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Purchase Price</Text>
          {editingPrice ? (
            <>
              <TextInput
                style={styles.statInput}
                value={purchasePriceDraft}
                onChangeText={setPurchasePriceDraft}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <View style={styles.statActions}>
                <TouchableOpacity onPress={() => { setEditingPrice(false); setPurchasePriceDraft(wine.purchase_price != null ? String(wine.purchase_price) : ''); }}>
                  <Text style={styles.statCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSavePrice} disabled={savingPrice}>
                  <Text style={[styles.statAction, savingPrice && { opacity: 0.5 }]}>{savingPrice ? '…' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={() => setEditingPrice(true)} activeOpacity={0.7}>
              {wine.purchase_price != null ? (
                <>
                  <Text style={styles.statValue}>{formatCurrency(Number(wine.purchase_price), wine.purchase_price_currency, { decimals: 0 })}</Text>
                  {wine.estimated_value != null && Number(wine.purchase_price) === Number(wine.estimated_value) ? (
                    <Text style={styles.priceEstimatedNote}>Estimated upon entry, update</Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.statAction}>+ Add Price</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        )}
        <TouchableOpacity
          style={styles.statCell}
          onPress={() => handleRefreshEstimate()}
          activeOpacity={refreshingValue ? 1 : 0.7}
          disabled={refreshingValue}
        >
          <Text style={styles.statLabel}>Estimated Value</Text>
          {refreshingValue ? (
            <Text style={[styles.statValue, styles.statValueMuted]}>Estimating…</Text>
          ) : wine.estimated_value != null ? (
            <>
              <Text style={[styles.statValue, styles.estimatedValueGold]}>
                {formatCurrency(Number(wine.estimated_value), wine.estimated_value_currency, { decimals: 0 })}
                <Text style={styles.estimateUpdateLink}> (update)</Text>
              </Text>
              {wine.estimated_value_low != null && wine.estimated_value_high != null ? (
                <Text style={styles.statSub}>
                  Range {formatCurrency(Number(wine.estimated_value_low), wine.estimated_value_currency, { decimals: 0 })}–{formatCurrency(Number(wine.estimated_value_high), wine.estimated_value_currency, { decimals: 0 })}
                </Text>
              ) : null}
              {wine.estimated_value_at ? (
                <Text style={styles.statSub}>
                  {wine.estimated_value_source === 'wine-searcher'
                    ? (wine.estimated_value_scope === 'all-vintage' ? 'WS · all vintages · ' : 'Wine-Searcher · ')
                    : wine.estimated_value_source === 'vinster' ? 'Vinster estimate · ' : ''}
                  {new Date(wine.estimated_value_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.statAction}>+ Generate</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* When no critic score is available, surface Vinster's brief
          explanation so the dash doesn't feel like an error. */}
      {wine.critic_score == null && wine.critic_score_note ? (
        <View style={styles.scoreNoteBlock}>
          <Text style={styles.scoreNoteLabel}>Why no critic score?</Text>
          <Text style={styles.scoreNoteText}>{wine.critic_score_note}</Text>
        </View>
      ) : null}

      {/* Honest market-value context, mirroring the scan intel card. Only after
          a real generate attempt (estimated_value_at set), so it never shows on
          a bare wine before Vinster has looked. */}
      {!isWishlist && !isArchived && !refreshingValue && wine.estimated_value_at ? (
        wine.estimated_value_source === 'wine-searcher' && wine.estimated_value_scope === 'all-vintage' ? (
          <View style={styles.scoreNoteBlock}>
            <Text style={styles.scoreNoteLabel}>About this value</Text>
            <Text style={styles.scoreNoteText}>
              No live market price for the {wine.vintage || 'listed'} vintage on Wine-Searcher — this is its global average across all vintages of the wine, in {wine.estimated_value_currency ?? 'GBP'}.
            </Text>
          </View>
        ) : wine.estimated_value_source === 'vinster' && wine.estimated_value != null ? (
          <View style={styles.scoreNoteBlock}>
            <Text style={styles.scoreNoteLabel}>About this value</Text>
            <Text style={styles.scoreNoteText}>
              No market listing found on Wine-Searcher for this wine — this is Vinster's own estimate from the producer, region and vintage, in {wine.estimated_value_currency ?? 'GBP'}. Treat it as a guide, not a confirmed market price.
            </Text>
          </View>
        ) : wine.estimated_value == null ? (
          <View style={styles.scoreNoteBlock}>
            <Text style={styles.scoreNoteLabel}>No market price</Text>
            <Text style={styles.scoreNoteText}>
              Wine-Searcher has no live listing for this wine and vintage, and Vinster couldn't confidently estimate one. Try the closest vintage, or check the wine's global page on Wine-Searcher.
            </Text>
          </View>
        ) : null
      ) : null}

      {/* On-demand "Vinster's Market & Vintage Comparison" — how this vintage
          compares and where its market value sits. Generated on command (not in
          wine-card generation or "update intel") and cached on the wine. */}
      {!isWishlist ? (
        <>
          <View style={styles.reviewRow}>
            <View style={styles.vinsterHeaderRow}>
              <TouchableOpacity onPress={() => setMarketOpen((v) => !v)} activeOpacity={0.7} style={styles.vinsterReviewToggle}>
                <Text style={styles.vinsterReviewTitle}>Vinster's Market & Vintage Comparison</Text>
                <Ionicons name="chevron-forward-outline" size={16} color={colors.gold} />
              </TouchableOpacity>
            </View>
          </View>
          {marketOpen ? (
            <View style={styles.reviewExpandedFull}>
              {wine.market_vintage_note ? (
                <>
                  {wine.market_vintage_note.vintage ? (<><Text style={styles.servingSubhead}>Vintage</Text><Text style={styles.tastingNotes}>{wine.market_vintage_note.vintage}</Text></>) : null}
                  {wine.market_vintage_note.market ? (<><Text style={[styles.servingSubhead, { marginTop: spacing.sm }]}>Market</Text><Text style={styles.tastingNotes}>{wine.market_vintage_note.market}</Text></>) : null}
                  <TouchableOpacity onPress={handleGenerateMarket} disabled={generatingMarket} activeOpacity={0.7}>
                    <Text style={styles.diveDeeperLink}>{generatingMarket ? 'Regenerating…' : 'Regenerate →'}</Text>
                  </TouchableOpacity>
                </>
              ) : generatingMarket ? (
                <Text style={styles.tastingNotes}>Generating…</Text>
              ) : (
                <TouchableOpacity style={styles.generateNoteBtn} onPress={handleGenerateMarket} activeOpacity={0.7}>
                  <Text style={styles.generateNoteBtnText}>Generate</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </>
      ) : null}

      {/* Vinster's Review — Vinster's AI tasting note, collapsed behind a
          chevron toggle. Sits last of the three review blocks (after Your
          Review and Personal Notes). The "(what's this)" link surfaces a
          short explainer. Hidden for wishlist wines: their stored note is
          the user's own, and Vinster's AI review only exists in the cellar. */}
      {!isWishlist ? (
        <>
        {/* Vinster's Review — its body lays out full width below. (Vinster's Map
            removed for now — to revisit later.) */}
        <View style={styles.reviewRow}>
          <View style={styles.vinsterHeaderRow}>
            <TouchableOpacity onPress={() => setVinstersNoteOpen((v) => !v)} activeOpacity={0.7} style={styles.vinsterReviewToggle}>
              <Text style={styles.vinsterReviewTitle}>Vinster's Review</Text>
              <Ionicons name="chevron-forward-outline" size={16} color={colors.gold} />
            </TouchableOpacity>
          </View>
        </View>
        {vinstersNoteOpen ? (
          <View style={styles.reviewExpandedFull}>
            {wine.tasting_notes ? (
              <>
                <Text style={styles.tastingNotes}>{wine.tasting_notes}</Text>
                {/* The former "(what's this)" explainer, now shown inline. */}
                <Text style={styles.vinsterExplainer}>
                  Vinster digs deeply into the online world for critic scores and reviews, vintage information, market values, and overall producer quality to generate information on this wine and use it for the basis of its wine note, which covers the classics — fruit, acidity, tannin, body, and finish. Your own thoughts can be recorded in "Your Review" and "Personal Notes" on the wine card.
                </Text>
              </>
            ) : refreshingValue ? (
              <Text style={styles.tastingNotes}>Generating Vinster's review…</Text>
            ) : (
              <TouchableOpacity style={styles.generateNoteBtn} onPress={() => handleRefreshEstimate()} activeOpacity={0.7}>
                <Text style={styles.generateNoteBtnText}>Generate</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* The Inside Line — Vinster's sommelier-best-friend verdict, shown just
            as on the scan Wine Intel card. Filled once the wine's intel runs. */}
        {(hasRealInsiderNote(wine.insider_note) || !isArchived) ? (
          <View style={styles.insiderSection}>
            <Text style={styles.insiderTitle}>The Inside Line</Text>
            {/* While intel is still filling the note, show "Generating…" — never
                the jokey no-note placeholder. */}
            <Text style={styles.insiderBody}>{hasRealInsiderNote(wine.insider_note) ? wine.insider_note?.trim() : 'Generating…'}</Text>
            {!isArchived ? (
              <TouchableOpacity onPress={() => router.push(`/cellar/wine-knowledge/${wine.id}`)} activeOpacity={0.7}>
                <Text style={styles.diveDeeperLink}>Dive deeper into this wine →</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* Where this wine sits in the producer's range — as on the intel card. */}
        {producerRangeLoading || rangeWines.length > 0 ? (
          <View style={styles.rangeSection}>
            <Text style={styles.rangeTitle}>The {wine.producer} range</Text>
            {rangeWines.some((rw) => !rw.isThis) ? (
              <Text style={styles.rangeHint}>Tap a wine for its inside line</Text>
            ) : null}
            {producerRange ? (
              <>
                {rangeWines.map((rw, i) => (
                  // The current wine — and a consolidated entry-level line — aren't
                  // tappable (no single inside line for a group of wines).
                  <TouchableOpacity key={`${rw.wineName}-${i}`} style={[styles.rangeRow, rw.isThis && styles.rangeRowThis]} onPress={() => { setRangeNoteWine(rw.wineName); setRangeNoteTier(rw.tier ?? null); }} activeOpacity={(rw.isThis || rw.grouped) ? 1 : 0.7} disabled={rw.isThis || rw.grouped}>
                    <View style={styles.rangeRowMain}>
                      <Text style={[styles.rangeMarker, !rw.isThis && styles.rangeMarkerHidden]}>▸</Text>
                      <Text style={[styles.rangeName, rw.isThis && styles.rangeNameThis]} numberOfLines={rw.grouped ? 4 : 2}>{rw.wineName}</Text>
                    </View>
                    <View style={styles.rangeRight}>
                      <Text style={[styles.rangeBand, rw.isThis && styles.rangeBandThis]}>{currencySymbol(preferences?.defaultCurrency ?? wine.estimated_value_currency ?? 'GBP').repeat(rw.band)}</Text>
                      {rw.tier ? <Text style={styles.rangeTier}>{rw.tier}</Text> : null}
                    </View>
                  </TouchableOpacity>
                ))}
                {producerRange.summary ? <Text style={styles.rangeSummary}>{producerRange.summary}</Text> : null}
              </>
            ) : (
              <View style={styles.rangeLoading}>
                <ActivityIndicator color={colors.gold} />
                <Text style={styles.rangeLoadingText}>Mapping the range…</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Inside-line note for a tapped range wine. */}
        <RangeWineNoteSheet
          producer={wine.producer}
          wineName={rangeNoteWine}
          region={wine.region}
          tier={rangeNoteTier}
          visible={!!rangeNoteWine}
          onClose={() => setRangeNoteWine(null)}
        />
        </>
      ) : null}

      {!isWishlist && <View style={styles.cardDivider} />}

      {isWishlist && (
        <TouchableOpacity
          style={[styles.chefBtn, { borderColor: colors.gold }]}
          onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/cellar/list'); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.chefBtnText, { color: colors.gold }]}>Add to Cellar</Text>
        </TouchableOpacity>
      )}

      {isWishlist && (
        <TouchableOpacity
          style={[styles.chefBtn, { borderColor: colors.gold }]}
          onPress={handleDeleteFromWishlist}
          disabled={removing}
          activeOpacity={0.7}
        >
          <Text style={[styles.chefBtnText, { color: colors.gold }]}>Delete from Wish List</Text>
        </TouchableOpacity>
      )}

      {/* Chef pairing CTA — moved down to sit just above Archive/Delete.
          Wishlist wines hide it (no bottle yet); the reviews-flow variant
          posts the review to the community instead. */}
      {!isArchived && (
        isWishlist ? null : cameFromReviews ? (
          <TouchableOpacity
            style={[styles.chefBtn, (!COMMUNITY_ENABLED || postingReview || reviewPosted) && styles.chefBtnDisabled]}
            onPress={handlePostToCommunity}
            disabled={!COMMUNITY_ENABLED || postingReview || reviewPosted}
            activeOpacity={0.7}
          >
            <Text style={styles.chefBtnText}>
              {!COMMUNITY_ENABLED ? 'Share Review To Community (coming soon)' : reviewPosted ? '✓ Shared to Community' : postingReview ? 'Sharing…' : 'Share Review To Community'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.chefBtn} onPress={handleFindPairings}>
            <Text style={styles.chefBtnText}>Find me a recipe for this wine</Text>
          </TouchableOpacity>
        )
      )}

      {/* Regenerate the wine card's intel from scratch — refreshes value, score,
          tasting notes, drinking window AND fills The Inside Line for wines whose
          intel predates that feature. Same handler as the value-refresh action. */}
      {!isArchived && (
        <TouchableOpacity
          style={[styles.chefBtn, { marginTop: spacing.md }]}
          onPress={() => handleRefreshEstimate()}
          disabled={refreshingValue}
          activeOpacity={refreshingValue ? 1 : 0.7}
        >
          {refreshingValue ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={[styles.chefBtnText, { marginLeft: spacing.xs }]}>Regenerating…</Text>
            </View>
          ) : (
            <Text style={styles.chefBtnText}>Regenerate Wine Card Intel</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Export (share the wine card) — moved here from the top-right, as a
          yellow button sitting directly above Archive / Delete. */}
      <TouchableOpacity style={styles.exportBtn} onPress={handleShareIntel} disabled={sharingIntel} activeOpacity={0.85}>
        <Text style={styles.exportBtnText}>{sharingIntel ? 'Preparing…' : 'Export'}</Text>
      </TouchableOpacity>

      {!isArchived && !isWishlist && (
        <TouchableOpacity style={styles.archiveAccessBtn} onPress={() => setArchiveModalOpen(true)}>
          <Text style={styles.archiveAccessBtnText}>Archive or Delete Wine</Text>
        </TouchableOpacity>
      )}

      {!isWishlist && removals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{isArchived ? 'Archived' : 'Removal History'}</Text>
            {isArchived && wine.archived_at && (
              <Text style={styles.archivedAt}>{new Date(wine.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            )}
          </View>
          {removals.map((ev) => (
            <RemovalRow key={ev.id} removal={ev} />
          ))}
          {!isArchived && (
            <Text style={styles.removalArchiveHint}>Edit your removal history in your archive folder.</Text>
          )}
        </View>
      )}

      {isArchived && (
        <TouchableOpacity
          style={[styles.removeWineBtn, styles.archivedDeleteBtn, removing && styles.buttonDisabled]}
          onPress={() => setRemoveStep('confirm')}
          disabled={removing}
        >
          <Text style={styles.removeWineBtnText}>Delete Wine From Your Records</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={addBottlesOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !addingBottles && setAddBottlesOpen(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.archiveModalSheet}>
            <Text style={styles.archiveModalTitle}>Add bottles</Text>
            <Text style={styles.archiveModalWine}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>
            {pendingLocationId ? (
              <Text style={styles.addToLocationNote}>Filing under {locations.find((l) => l.id === pendingLocationId)?.name ?? 'location'}</Text>
            ) : null}

            <Text style={styles.fieldLabel}>How many bottles to add?</Text>
            <TextInput
              style={styles.input}
              value={addBottlesCount}
              onChangeText={setAddBottlesCount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              selectTextOnFocus
            />

            <TouchableOpacity
              style={[styles.removeBtn, { borderColor: colors.gold }, addingBottles && styles.buttonDisabled]}
              onPress={handleAddBottles}
              disabled={addingBottles}
            >
              <Text style={[styles.removeBtnText, { color: colors.gold }]}>
                {addingBottles ? 'Adding…' : 'Add to Cellar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setAddBottlesOpen(false); setPendingLocationId(null); }} style={styles.archiveModalCancel} disabled={addingBottles}>
              <Text style={styles.archiveModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={archiveModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !removing && setArchiveModalOpen(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.archiveModalSheet}>
            <Text style={styles.archiveModalTitle}>Archive or Delete Wine</Text>
            <Text style={styles.archiveModalWine}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>

            {wine.quantity > 1 && (
              <>
                <Text style={styles.fieldLabel}>How many of your {wine.quantity} bottles?</Text>
                <TextInput
                  style={styles.input}
                  value={removeCount}
                  onChangeText={setRemoveCount}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Date removed</Text>
            <DateInput
              style={styles.input}
              valueIso={removeDate}
              onChangeIso={setRemoveDate}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              value={removeNote}
              onChangeText={(t) => setRemoveNote(t.slice(0, 50))}
              placeholder="e.g. dinner with the Smiths"
              placeholderTextColor={colors.textMuted}
              maxLength={50}
            />
            <Text style={styles.removeNoteHint}>{removeNote.length}/50 — where or with whom you drank it.</Text>

            <TouchableOpacity
              style={[styles.removeBtn, removing && styles.buttonDisabled]}
              onPress={async () => { await onArchivePressed(); }}
              disabled={removing}
            >
              <Text style={styles.removeBtnText}>{removing ? 'Working…' : 'Archive Wine'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.removeWineBtn, removing && styles.buttonDisabled]}
              onPress={() => { setArchiveModalOpen(false); setRemoveStep('confirm'); }}
              disabled={removing}
            >
              <Text style={styles.removeWineBtnText}>Delete Wine From Your Records</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setArchiveModalOpen(false)} style={styles.archiveModalCancel} disabled={removing}>
              <Text style={styles.archiveModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      {/* Off-screen share card for the Share button on Your Review.
          Mounted only while a share is in flight. */}
      {reviewSharePayload && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <WineReviewShareCard ref={reviewShareRef} {...reviewSharePayload} />
        </View>
      )}

      {/* Off-screen share card for the top-right "Share" on the wine card. */}
      {intelSharePayload && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <WineIntelShareCard ref={intelShareRef} {...intelSharePayload} />
        </View>
      )}

      <Modal
        visible={removeStep !== 'idle'}
        transparent
        animationType="fade"
        onRequestClose={() => removeStep === 'success' ? null : setRemoveStep('idle')}
      >
        <View style={styles.removeModalOverlay}>
          <View style={styles.removeModalSheet}>
            {removeStep === 'confirm' ? (
              <>
                <Text style={styles.removeModalTitle}>Delete this wine?</Text>
                <Text style={styles.removeModalBody}>
                  {(() => {
                    const c = Math.max(1, Math.min(parseInt(removeCount) || wine.quantity, wine.quantity));
                    const partial = !isArchived && c < wine.quantity;
                    const label = `${wine.wine_name}${wine.vintage ? ` ${wine.vintage}` : ''}`;
                    return partial
                      ? `This will permanently delete ${c} of your ${wine.quantity} bottles of ${label}. This can't be undone.`
                      : "Permanently remove it from your cellar, but keep your reviews. This can't be undone.";
                  })()}
                </Text>
                <TouchableOpacity
                  style={[styles.removeModalConfirmBtn, removing && styles.buttonDisabled]}
                  onPress={handleRemoveWine}
                  disabled={removing}
                >
                  <Text style={styles.removeModalConfirmText}>{removing ? 'Removing…' : 'Remove permanently'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRemoveStep('idle')} style={styles.removeModalCancel}>
                  <Text style={styles.removeModalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Canonical review form — the single place a cellar wine's review is
          edited (same component Your Wine Reviews opens). Reached via 'Add
          Review' / 'Edit Review' on the card. */}
      <EditCellarReviewModal
        wine={wine}
        visible={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['cellar'] })}
      />

      {/* "How is this wine packaged?" — after filing this wine into an Other
          Home Storage location. */}
      <PackagingPrompt
        visible={packagingLocationId !== null}
        wineId={wine?.id ?? null}
        locationId={packagingLocationId}
        userId={session?.user.id ?? ''}
        onClose={() => setPackagingLocationId(null)}
        onDone={() => {
          if (packagingLocationId) qc.invalidateQueries({ queryKey: ['storage-location-cases', packagingLocationId] });
          qc.invalidateQueries({ queryKey: ['cellar'] });
        }}
      />

      {/* Cellar Note popup — dictate or type a short private note (<=50 chars).
          Card-only; never touches the review. */}
      <Modal visible={cellarNoteOpen} transparent animationType="fade" onRequestClose={() => setCellarNoteOpen(false)}>
        <View style={styles.cnOverlay}>
          <View style={styles.cnSheet}>
            <View style={styles.cnHeaderRow}>
              <Text style={styles.cnTitle}>Cellar Note</Text>
              <View style={styles.cnHeaderRight}>
                <TouchableOpacity onPress={() => setCellarNoteOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
                  <Text style={styles.cnCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.cnBody}>A short private note, shown only here on the wine card — 100 characters or less.</Text>
            <TextInput
              style={styles.cnInput}
              value={noteText}
              onChangeText={(t) => setNoteText(t.slice(0, 100))}
              placeholder="e.g. Gift from Dad — lay down till 2030"
              placeholderTextColor={colors.textMuted}
              maxLength={100}
              multiline
              autoFocus
            />
            <Text style={styles.cnCount}>{noteText.length}/100</Text>
            <TouchableOpacity style={styles.cnSaveBtn} onPress={handleSaveCellarNote} disabled={savingNote} activeOpacity={0.85}>
              <Text style={styles.cnSaveText}>{savingNote ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
            {wine.cellar_note ? (
              <TouchableOpacity style={styles.cnCancel} onPress={handleDeleteCellarNote} disabled={savingNote}>
                <Text style={styles.cnDeleteText}>Delete Note</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Cellar Note read-only popup — shown when an existing note's chevron is
          tapped. Full wine name header, the note, then Edit / Delete. */}
      <Modal visible={cellarNoteViewOpen} transparent animationType="fade" onRequestClose={() => setCellarNoteViewOpen(false)}>
        <TouchableOpacity style={styles.cnOverlay} activeOpacity={1} onPress={() => setCellarNoteViewOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.cnSheet} onPress={() => {}}>
            <Text style={styles.cnViewWineName} numberOfLines={2}>{[wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ')}</Text>
            <Text style={styles.cnViewSub}>Cellar Note</Text>
            <Text style={styles.cnViewNote}>{wine.cellar_note}</Text>
            <TouchableOpacity style={styles.cnSaveBtn} onPress={() => { setCellarNoteViewOpen(false); openCellarNote(); }} activeOpacity={0.85}>
              <Text style={styles.cnSaveText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cnCancel} onPress={handleDeleteCellarNote} disabled={savingNote}>
              <Text style={styles.cnDeleteText}>{savingNote ? 'Deleting…' : 'Delete'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* View in Cellar popup — full wine name header + "Bottles In My Cellar",
          then one line per place (external cellars show quantity + case but no
          link; home locations link through to that cellar's view). */}
      <Modal visible={cellarViewOpen} transparent animationType="fade" onRequestClose={() => setCellarViewOpen(false)}>
        <TouchableOpacity style={styles.cnOverlay} activeOpacity={1} onPress={() => setCellarViewOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.cnSheet} onPress={() => {}}>
            <Text style={styles.cnViewWineName} numberOfLines={2}>{[wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ')}</Text>
            <Text style={styles.cnViewSub}>Bottles In My Cellar</Text>
            {buildCellarEntries().map((e) => {
              const qty = e.quantity != null ? `${e.quantity} bottle${e.quantity === 1 ? '' : 's'}` : 'Bottles';
              const line = `${qty} in ${e.label}${e.caseFormat ? ` · ${e.caseFormat}` : ''}`;
              return e.href ? (
                <TouchableOpacity key={e.key} onPress={() => { setCellarViewOpen(false); router.push(e.href as any); }} activeOpacity={0.7}>
                  <Text style={styles.cellarViewLink}>{line} →</Text>
                </TouchableOpacity>
              ) : (
                <Text key={e.key} style={styles.cellarViewPlain}>{line}{e.isExternal ? '  (external cellar)' : ''}</Text>
              );
            })}
            {(() => {
              const unplaced = Math.max(0, (wine.quantity ?? 0) - placedCount(winePlacements));
              return unplaced > 0 ? <Text style={styles.cellarViewPlain}>{unplaced} bottle{unplaced === 1 ? '' : 's'} not yet placed</Text> : null;
            })()}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  // Inter — error body
  errorText: { color: colors.text, fontFamily: fonts.bodyRegular, fontSize: 16 },
  // Cormorant — action link reads as a button
  linkText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, marginTop: spacing.md },
  backRow: { paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, alignSelf: 'flex-start' },
  // Inter — back/nav link
  // Back / Share share one Cormorant face, regular weight, first-letter cap —
  // level with the bold WINE CARD title between them.
  backText: { fontSize: 16, fontFamily: fonts.headingRegular, color: colors.gold },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  // Cormorant — card-type header title, bold + uppercase.
  cardTypeLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 16,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  topBarActions: { flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  // Right-edge spacer balancing the Back arrow so the card-type label centres.
  topBarSpacer: { width: 24 },
  topBarShareText: { fontSize: 16, fontFamily: fonts.headingRegular, color: colors.gold },
  editPhotoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  editThumb: { width: 44, height: 56 },
  editPhotoLink: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.gold },
  favouriteStar: { fontSize: 28, color: 'rgba(255,255,255,0.55)', lineHeight: 28 },
  favouriteStarActive: { color: colors.gold },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerTextCol: { flex: 1 },
  addedDate: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  // Date added, centred under the 'Cellar Wine' chip with a gap before the name.
  addedDateTop: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  // Grape (left) + Added (right) on one line; Edit on its own line below.
  grapeRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 },
  editRow: { alignItems: 'flex-end', marginTop: 2 },
  // Subtle gold "Edit" link on the date line — opens the title editor.
  editTitleLink: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, textDecorationLine: 'underline' },
  titleEditOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  titleEditSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  titleEditHeading: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  photoSaving: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.gold, marginTop: spacing.sm },
  // Match the Wine Intel card's label image (larger, 3:4 portrait).
  detailThumb: { width: 120, height: 160 },
  // Inter — wine card name (card content, not a page header)
  headerLine: { fontSize: 22, fontFamily: fonts.bodyBold, color: colors.text, lineHeight: 28 },
  // Inter — region caption
  region: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 4 },
  // Inter — grape caption
  grape: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold },
  // "Confirm this wine" grape prompt — mirrors the scan flow's confirm popup.
  candOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  candSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%', maxWidth: 440 },
  candTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  candBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  candRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  candCheck: { fontSize: 24, color: colors.textMuted, width: 28, textAlign: 'center' },
  candCheckOn: { color: colors.gold },
  candRowText: { flex: 1 },
  candItemName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  candItemMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  candConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  candConfirmBtnDisabled: { opacity: 0.4 },
  candConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  candCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  candCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // Non-standard bottle format line under the grape (e.g. "150cl bottle").
  bottleFormat: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 2 },
  tastingBlock: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Inter — info label
  infoLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Inter — info value read-out
  infoValue: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, textAlign: 'right' },
  // Inter — small caption sub
  infoSub: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  section: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Reviews group — one header over Vinster's / Your Review / Personal Notes,
  // each a borderless subsection so they read as one consistent block.
  reviewsHeader: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm, marginBottom: spacing.xs },
  reviewPriceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, backgroundColor: colors.surface, marginBottom: spacing.md },
  reviewPriceCurrency: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textMuted, marginRight: 4 },
  reviewPriceInput: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.sm },
  autoSaveHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, marginBottom: spacing.sm },
  reviewSubsection: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  // The Inside Line + producer range — mirrored from the scan Wine Intel card.
  insiderSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  // "Dive deeper into this wine →" link beneath the inside line — matches the
  // scan Wine Intel card (moved here from a button at the bottom of the screen).
  diveDeeperLink: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, marginTop: spacing.sm },
  insiderTitle: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  insiderBody: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 23 },
  rangeSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  rangeTitle: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  rangeHint: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.sm },
  rangeLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  rangeLoadingText: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  rangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  rangeRowThis: { backgroundColor: 'rgba(212,176,96,0.10)', borderRadius: 8, paddingHorizontal: spacing.sm, borderBottomColor: 'transparent' },
  rangeRowMain: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.xs },
  rangeMarker: { fontSize: 14, color: colors.gold, width: 14, textAlign: 'center' },
  rangeMarkerHidden: { opacity: 0 },
  rangeName: { flex: 1, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text },
  rangeNameThis: { fontFamily: fonts.bodySemibold, color: colors.gold },
  rangeRight: { alignItems: 'flex-end' },
  rangeBand: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.textMuted, letterSpacing: 1 },
  rangeBandThis: { color: colors.gold },
  rangeTier: { fontSize: 10, fontFamily: fonts.bodyRegular, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },
  rangeSummary: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 21, marginTop: spacing.md },
  // Two-column review row: Personal Notes (left) beside Your Review (right).
  // The row carries the horizontal padding; each column just flexes.
  reviewRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.lg, alignItems: 'flex-start' },
  reviewCol: { flex: 1, paddingTop: spacing.sm },
  // An expanded Your Review / Cellar Note / Vinster's Review / Vinster's Map
  // body laid out across the full card width, below the two-column header row.
  reviewExpandedFull: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  reviewSubTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text },
  // Vinster's Review is gold (title + chevron); "what's this" sits close beside.
  vinsterHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  vinsterReviewTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: '#FFFFFF' },
  // Full-width separator between card sections.
  cardDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginVertical: spacing.md },
  // Field label + dictation mic on one row.
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, marginBottom: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  // Cormorant — section header
  sectionTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text },
  // "Your Review" gets a larger subheader treatment vs other section titles.
  reviewSectionTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text },
  // A line above the Your Review block on wishlist cards (sits between the
  // Estimated Value stats and the review section).
  reviewDivider: { height: 1, backgroundColor: colors.border, marginTop: spacing.sm },
  // Cormorant — edit link reads as a button
  editLink: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
  // Inter — tasting notes body
  tastingNotes: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 22 },
  // The inlined "what's this" explainer shown in italics after Vinster's Review.
  vinsterExplainer: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold, lineHeight: 19, marginTop: spacing.sm },
  // "Generate" button shown inside Vinster's Review when there's no note yet.
  // On-demand Serving Suggestions / Market & Vintage dropdown bodies.
  servingLine: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 22 },
  servingSubhead: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  generateNoteBtn: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.xs, paddingHorizontal: spacing.lg, marginTop: spacing.xs },
  generateNoteBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  // Vinster's Review toggle — mirrors the List results "Sommelier Note":
  // gold uppercase label + chevron, centred, with the "(what's this)"
  // explainer link beside it.
  vinsterReviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  vinsterReviewToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  vinsterReviewToggleText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1.2 },
  // (toggle label intentionally Cormorant, matching the List Sommelier Note toggle)
  // Inter — form label
  fieldLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Inter — form input
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  buttonDisabled: { opacity: 0.6 },
  // Inter — cancel link inside modal (not a button)
  cancelText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14 },
  // Inter — note body
  noteText: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.text, lineHeight: 22 },
  cellarNoteEditInline: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.gold },
  noteInput: { minHeight: 90, textAlignVertical: 'top' },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  // Cormorant — button text
  saveBtnText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
  removeBlock: { paddingTop: spacing.sm },
  removeBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  // Cormorant — button text
  removeBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  removeWineBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  // Cormorant — button text
  removeWineBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  archivedDeleteBtn: { marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  // Inter — subtle small info (archived date)
  archivedAt: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 0.5 },
  removalRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  removalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  removalDateWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  // Count + date match the drinking-window read-out (statValue) size/font.
  removalCount: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, lineHeight: 20 },
  removalDate: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, lineHeight: 20 },
  // Gold "Note" link beside the date, shown when the removal carries a note.
  removalNoteLink: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.3 },
  // Char-count hint under the removal note field in the archive modal.
  removeNoteHint: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: -2, marginBottom: spacing.sm },
  // Inter — subtle hint
  removalArchiveHint: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  removeModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  removeModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  // Cormorant — remove modal title
  removeModalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm, lineHeight: 28 },
  // Inter — remove modal body
  removeModalBody: { fontFamily: fonts.bodyItalic, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  removeModalConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  // Cormorant — modal confirm button text
  removeModalConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  removeModalCancel: { alignItems: 'center', paddingVertical: spacing.sm },
  // Inter — cancel link (not a button)
  removeModalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  removeModalOkBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  // Cormorant — modal OK button text
  removeModalOkText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Inter — caption status
  rackRemovalMsg: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold, textAlign: 'center', marginTop: spacing.md },
  chefBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg },
  chefBtnDisabled: { opacity: 0.6 },
  // Cormorant — button text
  chefBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  archiveAccessBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.md },
  // Cormorant — button text
  archiveAccessBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  // Yellow Export button above Archive/Delete — matches archiveAccessBtn footprint.
  exportBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.md },
  exportBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  archiveModalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.border },
  // Cormorant — archive modal title
  archiveModalTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, marginBottom: 2 },
  // Inter — wine sub-line in modal
  archiveModalWine: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.lg },
  addToLocationNote: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: -spacing.sm, marginBottom: spacing.lg },
  archiveModalCancel: { alignItems: 'center', marginTop: spacing.md },
  // Inter — cancel link (not a button)
  archiveModalCancelText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  // Full-width "label left, value/action right" rows used for Purchase
  // and Estimated value — these get their own single-line treatment so the
  // CTAs are scannable instead of cramped into the 50%-wide grid.
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  // Inter — value label
  valueLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Inter — value read-out
  valueText: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text, flexShrink: 1, textAlign: 'right' },
  // Inter — muted variant
  valueTextMuted: { color: colors.textMuted, fontFamily: fonts.bodyItalic },
  // Cormorant — action link reads as a button
  valueAction: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
  valueEditBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, justifyContent: 'flex-end' },
  // Inter — form input
  valueInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minWidth: 80, maxWidth: 120, textAlign: 'right' },
  // Inter — subtle cancel
  valueCancel: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  // Cormorant — save button text
  valueSave: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold },
  scoreNoteBlock: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  // Inter — note label
  scoreNoteLabel: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  // Inter — note body
  scoreNoteText: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.text, lineHeight: 18 },
  statCell: {
    width: '50%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  // Inter — stat label
  statLabel: {
    fontSize: 11,
    fontFamily: fonts.bodySemibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  // Inter — stat value read-out
  statValue: {
    fontSize: 16,
    fontFamily: fonts.bodySemibold,
    color: colors.text,
    lineHeight: 20,
  },
  // Inter — muted variant
  statValueMuted: {
    color: colors.textMuted,
    fontFamily: fonts.bodyItalic,
  },
  // Estimated Value shown in gold with an inline "(update)" link.
  estimatedValueGold: {
    color: colors.gold,
  },
  // Gold note under an auto-estimated purchase price, prompting an update.
  priceEstimatedNote: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.gold,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  estimateUpdateLink: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
  // Inter — small caption sub
  statSub: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Cormorant — action link reads as a button
  statAction: {
    fontSize: 12,
    fontFamily: fonts.headingSemibold,
    color: colors.gold,
    marginTop: 4,
  },
  // Informational (non-tappable) placement note — muted italic.
  statActionMuted: {
    fontSize: 12,
    fontFamily: fonts.bodyItalic,
    color: colors.textMuted,
    marginTop: 4,
  },
  // External-cellar placement line — same weight as a link but not tappable
  // (external cellars aren't browsable), so no arrow and the neutral text colour.
  statActionPlain: {
    fontSize: 12,
    fontFamily: fonts.headingSemibold,
    color: colors.text,
    marginTop: 4,
  },
  // Inter — subtle cancel
  statCancel: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
  },
  // Inter — form input
  statInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: colors.surface,
    marginTop: 2,
  },
  statActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  // Inter — subtle "(what's this)" inline link
  whatsThisLink: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'underline',
    marginLeft: spacing.sm,
  },
  // Inter — personal notes hint
  personalNotesHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  // Your Review quick-stats row — Score / Where / When at a glance.
  reviewQuickStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  // Collapsed "Your Review" summary line: score in gold, then the date.
  reviewScoreLine: { marginTop: 2 },
  // Collapsed cellar-note preview — keep the app font/colour (not the default
  // black system font) so it matches how it reads when expanded.
  cellarNotePreview: { marginTop: 2, fontFamily: fonts.bodyItalic, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  reviewScoreValue: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
  reviewScoreDash: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textMuted },
  reviewScoreDate: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textMuted },
  // Gold "+ Add Review" link (no review yet) + "Edit Review" link (review exists).
  addReviewLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, marginTop: 0 },
  // "View Full Review(s)" link — drills to the wine's review card.
  viewFullReviewLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, marginTop: spacing.xs, textDecorationLine: 'underline' },
  // Cellar Note popup.
  cnOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  cnSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  cnHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cnHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cnCloseText: { fontFamily: fonts.bodyRegular, fontSize: 20, color: colors.textMuted },
  cnDeleteText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.error },
  cnTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text },
  cnBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  // Read-only cellar-note popup: full wine name, "Cellar Note" subhead, the note.
  cnViewWineName: { fontFamily: fonts.headingBold, fontSize: 19, color: colors.text, textAlign: 'center', lineHeight: 24 },
  cnViewSub: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', marginTop: 4, marginBottom: spacing.md },
  cnViewNote: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, textAlign: 'center', lineHeight: 22 },
  // "View in Cellar" popup lines — gold link (home, navigable) vs plain (external/bin).
  cellarViewLink: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, textAlign: 'center', paddingVertical: spacing.xs },
  cellarViewPlain: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, textAlign: 'center', paddingVertical: spacing.xs },
  cnInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, backgroundColor: colors.surface, minHeight: 52, textAlignVertical: 'top' },
  cnCount: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  cnSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.md },
  cnSaveText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  cnCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  cnCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  reviewEmptyText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.sm },
  reviewEntryBlock: { marginTop: spacing.sm, marginBottom: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  reviewEntryMeta: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, marginBottom: 4 },
  reviewEntryBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 22, marginTop: 2 },
  reviewEntryBodyMuted: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, lineHeight: 20, marginTop: 2 },
  editReviewLink: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold, textDecorationLine: 'underline', marginTop: spacing.sm, textAlign: 'center' },
  // Inter — user written review body
  reviewNoteBody: {
    fontFamily: fonts.bodyItalic,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  // Share-to-community + Share buttons under Your Review.
  reviewShareRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  reviewShareBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Cormorant — share button text
  reviewShareBtnText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 14,
    color: colors.gold,
    textAlign: 'center',
  },
  // Small "(coming soon)" sub-line under the Share to Community label.
  reviewShareBtnSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  // Hides the off-screen branded share card while it's mounted for
  // capture by react-native-view-shot.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
