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
import { clearChosenReview, patchChosenWine } from '../../src/api/chosenWines';
import { useCellar, useArchive } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { EditChosenWineModal } from '../../src/components/EditChosenWineModal';
import { ReviewDetailModal } from '../../src/components/ReviewDetailModal';
import { fromChosenGroup, fromCellar } from '../../src/utils/reviewModel';
import { byRecency, entriesOf, flatMirror } from '../../src/utils/cellarReview';
import { EditCellarReviewModal } from '../../src/components/EditCellarReviewModal';
import { AddChosenWineModal } from '../../src/components/AddChosenWineModal';
import { showAlert } from '../../src/components/AppAlert';
import { ShareIcon } from '../../src/components/ShareIcon';
import { WineReviewShareCard } from '../../src/components/WineReviewShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { LabelThumb } from '../../src/components/LabelThumb';
import { AddPhotoThumb } from '../../src/components/AddPhotoThumb';
import { LabelPhotoViewer } from '../../src/components/LabelPhotoViewer';
import { regionWithCountry } from '../../src/utils/wineOrigin';
import { useAttachLabelPhoto } from '../../src/hooks/useAttachLabelPhoto';
import { useLibraryFilters } from '../../src/hooks/useLibraryFilters';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import type { LibraryFilter } from '../../src/api/libraryFilters';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { normaliseCity, cityKey } from '../../src/utils/city';
import { foldAccents } from '../../src/utils/wineIdentity';
import { wineNameKey } from '../../src/utils/wineConnections';
import { splitLocationString } from '../../src/services/reviewSync';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { ChosenWine, CellarWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Month key + label for the Month filter. Key is 'YYYY-MM' (sortable);
// label is "July 2026". 'all' is the no-filter sentinel.
function monthKey(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(key: string): string {
  if (key === 'all' || !key) return 'All';
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
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
  // `entries` holds the review's dated entries (the original plus any "Add to
  // this review" entries), newest first; `wine` is the newest (representative).
  | { source: 'restaurant'; date: string; score: number | null; wine: ChosenWine; entries: ChosenWine[] }
  | { source: 'other';      date: string; score: number | null; wine: ChosenWine; entries: ChosenWine[] }
  | { source: 'cellar';     date: string; score: number | null; wine: CellarWine };

export default function ChosenWinesScreen() {
  const { chosenWines, isLoading, remove, dismissAwaiting, setFavourite } = useChosenWines();
  const { wines: cellarWines, updateWine } = useCellar();
  const { wines: archivedWines } = useArchive();
  const qc = useQueryClient();
  const { setImage, setWineDetails, setError } = useLabelStore();
  const attachPhoto = useAttachLabelPhoto();
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);
  // Every review (restaurant / cellar / other) opens the same unified detail view.
  const [detailItem, setDetailItem] = useState<ReviewItem | null>(null);
  // A label thumbnail tapped (in the list) to view full-screen.
  const [expandedThumb, setExpandedThumb] = useState<{ path: string; name?: string | null } | null>(null);
  // The detail card that spawned an Edit — so closing the editor returns to the
  // card, not out to the list. A REF (not state) so that a delete, which fires
  // onSaved() then onClose() synchronously, clears it in onSaved before onClose
  // reads it — otherwise a stale closure would restore the just-deleted card.
  const returnToDetailRef = useRef<ReviewItem | null>(null);
  const [editingCellarWine, setEditingCellarWine] = useState<CellarWine | null>(null);
  // True when the cellar review modal was opened to EDIT the latest entry (from
  // the review card's Edit) rather than to add a fresh one.
  const [editingCellarLatest, setEditingCellarLatest] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  // OCR pre-fill for the Add-a-Review modal when the user came via Scan/Upload
  // (null for Manual Input). Keeps all three on the same review input screen.
  const [addInitial, setAddInitial] = useState<{ producer?: string | null; wineName?: string | null; vintage?: string | number | null; region?: string | null; listPrice?: number | null; date?: string | null } | null>(null);
  // Local uri of a scanned/uploaded label, retained through the Add-a-Review
  // modal so the new review can carry its label photo (Part 3). Null for Manual.
  const [pendingReviewLabelUri, setPendingReviewLabelUri] = useState<string | null>(null);
  // Set when the Add-a-Review modal is opened from Your Label Library, where the
  // wine identity is already confirmed — the modal then shows a review CARD
  // (name header + editable date + thumbnail) rather than the blank manual form.
  const [addConfirmed, setAddConfirmed] = useState(false);
  const [addLabelPath, setAddLabelPath] = useState<string | null>(null);
  // When set, the Add-a-Review modal is in "add to THIS review" mode: it appends
  // a dated entry to this review_group_id and skips the "reviewed before" prompt.
  const [addToGroupId, setAddToGroupId] = useState<string | null>(null);
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
  // Which collection to show. Wish List is gone from this screen — reviews are
  // restaurant, cellar, or other only. Drives the centred collection selector.
  type TypeFilter = 'all' | 'cellar' | 'restaurant' | 'other';
  type FilterField = 'sort' | 'type' | 'month' | 'location' | 'favourite' | null;
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [favouriteFilter, setFavouriteFilter] = useState<'all' | 'fav'>('all');
  // Toggled by tapping "X Wines awaiting your review" in the header — shows only
  // the not-yet-reviewed picks; tap again to clear.
  const [awaitingOnly, setAwaitingOnly] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [search, setSearch] = useState('');
  // Bespoke user-created filters (the "+ Add" chip), same as the Label Library.
  const { filters: customFilters, create: createFilter, setItems: setFilterItems, rename: renameFilter, remove: removeFilter } = useLibraryFilters('wine-review');
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<LibraryFilter | null>(null);
  const [savingFilter, setSavingFilter] = useState(false);
  // "+ Add" is a two-step chooser: first the collection (Restaurant / Cellar /
  // Other), then — for restaurant/other — Scan / Upload / Manual. Cellar routes
  // to a picker over the live cellar (a cellar review must attach to a real
  // bottle). addSource carries the chosen collection into AddChosenWineModal.
  const [collectionChooserOpen, setCollectionChooserOpen] = useState(false);
  // "+ Add → Restaurant Wine" first shows the restaurant wines you've already
  // recorded and not yet reviewed, so you review those rather than re-entering
  // them. "Add Wine Anyway" drops through to the Scan/Upload/Manual chooser.
  const [restaurantAwaitingOpen, setRestaurantAwaitingOpen] = useState(false);
  const [addSource, setAddSource] = useState<'restaurant' | 'other'>('other');
  const [cellarPickerOpen, setCellarPickerOpen] = useState(false);
  const [cellarPickerSearch, setCellarPickerSearch] = useState('');
  // Bespoke "Other" filters (e.g. "BBR Tasting") — named tags the user creates
  // and assigns to Other-wine reviews, then filters by. Held per-user in
  // AsyncStorage (no server column): `otherTags` is the ordered tag list,
  // `tagAssign` maps a chosen_wines review id → the tags on it. `tagFilter` is
  // the active tag (only meaningful while the Other collection is selected).
  const [otherTags, setOtherTags] = useState<string[]>([]);
  const [tagAssign, setTagAssign] = useState<Record<string, string[]>>({});
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [newTagOpen, setNewTagOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  // Review id whose tag-assignment sheet is open (null = closed).
  const [assignForId, setAssignForId] = useState<string | null>(null);
  // Remembers the review being tagged while the "New filter" sheet is open, so
  // creating a tag mid-assign files it onto that review (only one modal shows at
  // a time — we close the assign sheet, create, then reopen it).
  const pendingAssignRef = useRef<string | null>(null);

  // Cellar wines that have ANY user-supplied review content count as a
  // "cellar review". Archived bottles are included too — a review added from an
  // archived wine card must still surface in Your Wine Reviews, not vanish
  // because the bottle left the live cellar.
  const cellarReviews = [...cellarWines, ...archivedWines].filter((w) =>
    (w.user_notes && w.user_notes.trim().length > 0) ||
    w.review_score != null ||
    (w.review_location && w.review_location.trim().length > 0) ||
    !!w.review_date
  );

  // A cellar review that's really the SAME wine as an existing reviewed chosen
  // review — auto-linked / imported onto a cellar bottle — must not list twice.
  // Drop the cellar copy from this list (the chosen review represents it here;
  // the wine card still shows it via its own review_entries). Match by
  // Wine-Searcher id, else order-independent name tokens + vintage.
  const reviewedChosen = chosenWines.filter(chosenHasReview);
  const reviewedWsIds = new Set(reviewedChosen.map((w) => w.ws_wine_id).filter((v): v is string => !!v));
  const reviewKey = (w: { producer?: string | null; wine_name?: string | null; vintage?: string | number | null }) =>
    `${wineNameKey(w.producer, w.wine_name)}|${String(w.vintage ?? '').trim()}`;
  const reviewedChosenKeys = new Set(reviewedChosen.map(reviewKey));
  const dedupedCellarReviews = cellarReviews.filter((w) =>
    !(w.ws_wine_id && reviewedWsIds.has(w.ws_wine_id)) && !reviewedChosenKeys.has(reviewKey(w)),
  );

  // Group chosen reviews that share a review_group_id (an original review plus
  // its later "Add to this review" entries) into ONE review card. Entries are
  // ordered newest-first; the newest is the representative shown on the card.
  const chosenGroupsMap = new Map<string, ChosenWine[]>();
  for (const w of chosenWines) {
    const k = w.review_group_id ?? w.id;
    const arr = chosenGroupsMap.get(k);
    if (arr) arr.push(w); else chosenGroupsMap.set(k, [w]);
  }
  const chosenGroups = [...chosenGroupsMap.values()].map((entries) =>
    [...entries].sort((a, b) => new Date(b.chosen_at).getTime() - new Date(a.chosen_at).getTime()),
  );

  const items: ReviewItem[] = [
    // The `source` column on chosen_wines (migration 042) drives the
    // restaurant-vs-other split here. Legacy rows default to
    // 'restaurant'; the "Review without adding" path tags 'other'.
    ...chosenGroups.map((entries): ReviewItem => {
      const rep = entries[0];
      return {
        source: rep.source === 'other' ? 'other' : 'restaurant',
        date: rep.chosen_at,
        score: rep.user_score,
        wine: rep,
        entries,
      };
    }),
    // Cellar wine reviews are shown here too, selectable via the collection
    // header (All / Restaurant / Cellar / Other). Each is derived from a
    // cellar_wines row carrying user review content; the review date drives
    // recency + the Month filter, the review score drives sort.
    ...dedupedCellarReviews.map((w): ReviewItem => ({
      source: 'cellar',
      date: w.review_date ?? w.updated_at ?? w.created_at,
      score: w.review_score ?? null,
      wine: w,
    })),
  ];

  // Restaurant bottle picks the user has NOT yet reviewed — these are excluded
  // from the main reviews list (they live in Your Restaurants until reviewed),
  // and surface in the "Bottle Picks Awaiting Review" section + the on-open prompt.
  // Identities (producer·name·vintage) that already carry a review somewhere —
  // a chosen review OR a cellar review. A bare bottle-pick row for one of these
  // is a phantom (e.g. a legacy duplicate) and must NOT show as "awaiting", so a
  // wine you've reviewed never appears in the awaiting list too.
  const idKey = (w: { producer?: string | null; wine_name?: string | null; vintage?: string | number | null }) =>
    `${(w.producer ?? '').trim().toLowerCase()}|${(w.wine_name ?? '').trim().toLowerCase()}|${String(w.vintage ?? '').trim().toLowerCase()}`;
  const reviewedIdentityKeys = new Set<string>();
  for (const w of chosenWines) if (chosenHasReview(w)) reviewedIdentityKeys.add(idKey(w));
  for (const w of cellarReviews) reviewedIdentityKeys.add(idKey(w));
  const awaitingReview = chosenWines.filter((w) => !chosenHasReview(w) && !reviewedIdentityKeys.has(idKey(w)) && !w.review_dismissed);

  // Long-press an awaiting-review pick to remove it from this list. It's a soft
  // dismiss, not a delete — the wine stays on its restaurant's card in Your
  // Restaurants (both screens read the same row).
  function promptDismissAwaiting(w: ChosenWine) {
    const label = wineHeaderLine(w.producer, w.wine_name, w.vintage) || (w.wine_name ?? 'this wine');
    showAlert({
      title: 'Remove from Awaiting Review?',
      body: `${label}\n\nThis clears it from Awaiting Review here. The wine stays on its restaurant in Your Restaurants.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => dismissAwaiting.mutate(w.id) },
      ],
    });
  }

  // One-time, dismissible prompt nudging the user to review a waiting pick.
  const { session } = useAuth();
  const promptKey = `vinster-bottle-pick-prompt-dismissed:${session?.user.id ?? 'anon'}`;

  // Load this user's bespoke Other filters + assignments from local storage.
  const tagsKey = `vinster-other-tags:${session?.user.id ?? 'anon'}`;
  const assignKey = `vinster-other-tag-assign:${session?.user.id ?? 'anon'}`;
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet([tagsKey, assignKey])
      .then((pairs) => {
        if (cancelled) return;
        const tagsRaw = pairs.find(([k]) => k === tagsKey)?.[1];
        const assignRaw = pairs.find(([k]) => k === assignKey)?.[1];
        if (tagsRaw) { try { const v = JSON.parse(tagsRaw); if (Array.isArray(v)) setOtherTags(v); } catch { /* ignore */ } }
        if (assignRaw) { try { const v = JSON.parse(assignRaw); if (v && typeof v === 'object') setTagAssign(v); } catch { /* ignore */ } }
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  function persistTags(next: string[]) {
    setOtherTags(next);
    AsyncStorage.setItem(tagsKey, JSON.stringify(next)).catch(() => {});
  }
  function persistAssign(next: Record<string, string[]>) {
    setTagAssign(next);
    AsyncStorage.setItem(assignKey, JSON.stringify(next)).catch(() => {});
  }
  // Toggle a tag on/off for a given review id.
  function toggleTagForReview(reviewId: string, tag: string) {
    const current = tagAssign[reviewId] ?? [];
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    const map = { ...tagAssign };
    if (next.length) map[reviewId] = next; else delete map[reviewId];
    persistAssign(map);
  }
  // Create a bespoke Other filter. Trims, ignores blanks + case-insensitive dupes.
  function createTag(name: string): string | null {
    const clean = name.trim();
    if (!clean) return null;
    const existing = otherTags.find((t) => t.toLowerCase() === clean.toLowerCase());
    if (existing) return existing;
    persistTags([...otherTags, clean]);
    return clean;
  }
  // Toggle a review in/out of a bespoke Folder (LibraryFilter). This is the same
  // system the folder chips + filtering use, so an assignment is reflected there.
  function toggleReviewInFolder(reviewId: string, f: LibraryFilter) {
    const has = f.itemIds.includes(reviewId);
    setFilterItems.mutate({ filterId: f.id, itemIds: has ? f.itemIds.filter((x) => x !== reviewId) : [...f.itemIds, reviewId] });
  }
  // Confirm the "New folder" sheet. If it was opened mid-assign (from a review's
  // "Add to Folder" sheet), create the folder with that review already in it and
  // reopen the assign sheet; otherwise just create an empty folder.
  function commitNewTag() {
    const name = newTagName.trim();
    const target = pendingAssignRef.current;
    pendingAssignRef.current = null;
    setNewTagOpen(false);
    if (!name) return;
    createFilter.mutate({ name, itemIds: target ? [target] : [] });
    if (target) setAssignForId(target);
  }
  // Cancel the "New filter" sheet. If it was opened mid-assign, return to that
  // review's assign sheet rather than dropping the user back to the list.
  function cancelNewTag() {
    const target = pendingAssignRef.current;
    pendingAssignRef.current = null;
    setNewTagOpen(false);
    if (target) setAssignForId(target);
  }
  // Remove a bespoke filter entirely — drop it from the list and off every review.
  function deleteTag(tag: string) {
    persistTags(otherTags.filter((t) => t !== tag));
    const map: Record<string, string[]> = {};
    for (const [id, tags] of Object.entries(tagAssign)) {
      const kept = tags.filter((t) => t !== tag);
      if (kept.length) map[id] = kept;
    }
    persistAssign(map);
    if (tagFilter === tag) setTagFilter('all');
  }
  // The full list of wines awaiting review, snapshotted when the on-open prompt
  // fires. More than one (e.g. two wines from the same restaurant visit) → the
  // prompt lists them all, each a link into its review input card.
  const [reviewPrompt, setReviewPrompt] = useState<ChosenWine[] | null>(null);
  const [dontShowPrompt, setDontShowPrompt] = useState(false);
  const promptShownRef = useRef(false);
  // Deep-link params from Your Label Library's click-into-a-label popup (see
  // below). Read up here so the on-open review nudge can bow out when we've
  // arrived to open/create a specific review rather than for a plain visit.
  const params = useLocalSearchParams<{ openReview?: string; openCellarReview?: string; openCellarReviewInput?: string; seedAdd?: string; addManual?: string; sp?: string; sw?: string; sv?: string; sr?: string; slp?: string; slu?: string; sd?: string; backTo?: string; savedToast?: string }>();
  const cameViaLabelLink = !!params.openReview || params.seedAdd === '1';
  // Broader "arrived via a deep link to a specific wine's review" flag — also
  // covers the cellar-review links (used by the Lineup wine list). Any of these
  // should return to `backTo` (or the Label Library) when the review closes.
  const cameViaLink = cameViaLabelLink || !!params.openCellarReview || !!params.openCellarReviewInput;
  // Return to wherever the user arrived from — an explicit backTo (e.g. a
  // restaurant card via ?openSession) when provided, else the Label Library.
  // dismissTo pops back to the EXISTING screen in the stack (don't router.replace
  // — that pushes a duplicate on top, which is why Back then needed several
  // presses to escape).
  const returnToLibrary = () => router.dismissTo((params.backTo ? decodeURIComponent(params.backTo) : '/scan/archive') as any);

  // After saving a review that arrived via a Label-Library link, land on THIS
  // wine's review detail card (showing the entry just made) instead of bouncing
  // back to the library. Refetches so the new entry is present, then opens the
  // unified detail view; Back from there returns to the library (cameViaLink).
  async function openSavedReviewDetail(target: { id?: string | null; producer?: string | null; wineName?: string | null; vintage?: string | number | null }) {
    try { await qc.refetchQueries({ queryKey: ['chosen-wines', session?.user.id] }); } catch { /* fall back to cache */ }
    const fresh = (qc.getQueryData(['chosen-wines', session?.user.id]) as ChosenWine[] | undefined) ?? chosenWines;
    const wantKey = idKey({ producer: target.producer, wine_name: target.wineName, vintage: target.vintage });
    let match = target.id ? fresh.find((w) => w.id === target.id) : undefined;
    if (!match) match = fresh.find((w) => idKey(w) === wantKey && chosenHasReview(w));
    if (!match) match = fresh.find((w) => idKey(w) === wantKey);
    if (!match) { returnToLibrary(); return; }
    const gid = match.review_group_id ?? match.id;
    const entries = fresh
      .filter((w) => (w.review_group_id ?? w.id) === gid)
      .sort((a, b) => new Date(b.chosen_at ?? 0).getTime() - new Date(a.chosen_at ?? 0).getTime());
    const source: 'restaurant' | 'other' = match.source === 'other' ? 'other' : 'restaurant';
    setDetailItem({ source, date: entries[0]?.chosen_at ?? '', score: entries[0]?.user_score ?? null, wine: entries[0] ?? match, entries: entries.length ? entries : [match] });
  }

  useEffect(() => {
    if (promptShownRef.current || isLoading || awaitingReview.length === 0) return;
    // Don't nudge when arriving from the Label Library to view/create a review —
    // that prompt is only for a plain visit to Your Wine Reviews.
    if (cameViaLabelLink) { promptShownRef.current = true; return; }
    promptShownRef.current = true;
    const list = [...awaitingReview];
    AsyncStorage.getItem(promptKey)
      .then((dismissed) => { if (!dismissed) setReviewPrompt(list); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, awaitingReview.length]);

  // Tap a wine in the awaiting-review prompt → open its review input card.
  function openAwaitingReview(w: ChosenWine) {
    setReviewPrompt(null);
    setEditingWine(w);
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
      if (match) {
        handledParamRef.current = key;
        // A pick that's still AWAITING review (a bottle pick with no review
        // content yet) opens the INPUT directly — going to the read-only detail
        // card and making the user tap Edit is wrong for an unreviewed wine.
        if (!chosenHasReview(match)) { setEditingWine(match); return; }
        // Otherwise open the unified READ-ONLY detail view (not the input card).
        // Gather this review's dated entries — every row sharing its
        // review_group_id — newest first, exactly as the list does.
        const gid = match.review_group_id ?? match.id;
        const entries = chosenWines
          .filter((w) => (w.review_group_id ?? w.id) === gid)
          .sort((a, b) => new Date(b.chosen_at ?? 0).getTime() - new Date(a.chosen_at ?? 0).getTime());
        const source: 'restaurant' | 'other' = match.source === 'other' ? 'other' : 'restaurant';
        setDetailItem({ source, date: entries[0]?.chosen_at ?? '', score: entries[0]?.user_score ?? null, wine: entries[0] ?? match, entries: entries.length ? entries : [match] });
      }
      return;
    }
    if (params.openCellarReview) {
      // From a cellar wine card's "View Full Review(s)" link — open that
      // bottle's unified review card (read-only), matching by cellar_wines id.
      const key = `openCellar:${params.openCellarReview}`;
      if (handledParamRef.current === key) return;
      const w = cellarWines.find((x) => x.id === params.openCellarReview)
        ?? archivedWines.find((x) => x.id === params.openCellarReview);
      if (w) {
        handledParamRef.current = key;
        setDetailItem({ source: 'cellar', date: w.review_date ?? '', score: w.review_score ?? null, wine: w });
      }
      return;
    }
    if (params.openCellarReviewInput) {
      // From a lineup wine with no review yet — open that cellar bottle's review
      // INPUT (a fresh entry), not the read-only card.
      const key = `openCellarInput:${params.openCellarReviewInput}`;
      if (handledParamRef.current === key) return;
      const w = cellarWines.find((x) => x.id === params.openCellarReviewInput)
        ?? archivedWines.find((x) => x.id === params.openCellarReviewInput);
      if (w) {
        handledParamRef.current = key;
        setEditingCellarLatest(false);
        setEditingCellarWine(w);
      }
      return;
    }
    if (params.addManual === '1') {
      // From the Review tab's "Add a wine review" — open the mode-of-input
      // chooser (Scan / Upload / Manual Input / Select from Cellar).
      if (handledParamRef.current === 'addManual') return;
      handledParamRef.current = 'addManual';
      setAddSource('other');
      setAddToGroupId(null);
      setChooserOpen(true);
      return;
    }
    if (params.seedAdd === '1') {
      const key = `add:${params.sp}|${params.sw}|${params.sv}`;
      if (handledParamRef.current === key) return;
      handledParamRef.current = key;
      setAddInitial({ producer: params.sp || null, wineName: params.sw || null, vintage: params.sv || null, region: params.sr || null, date: params.sd || null });
      // slu=1 → a fresh scan (Save to Reviews → Review now) whose label is still
      // a local uri in the label store; carry it so the +Add modal uploads it on
      // save. slp carries an already-uploaded storage path instead.
      setPendingReviewLabelUri(params.slu === '1' ? (useLabelStore.getState().imageUri ?? null) : null);
      // Identity is confirmed → review-card presentation, carrying the label's
      // photo (existing path via slp, or the local scan via slu above).
      setAddConfirmed(true);
      setAddLabelPath(params.slp || null);
      setAddOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.openReview, params.openCellarReview, params.openCellarReviewInput, params.seedAdd, params.addManual, params.sp, params.sw, params.sv, params.sr, params.slu, chosenWines, cellarWines, archivedWines]);

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
    // De-duplicate by canonical key so "Novello" and "Novello, Italy" collapse
    // to one entry; keep the richest label (usually the one with the country).
    const byKey = new Map<string, string>();
    for (const it of items) {
      if ((it.source === 'restaurant' || it.source === 'other') && !chosenHasReview(it.wine as ChosenWine)) continue;
      const c = cityFor(it);
      if (!c) continue;
      const key = cityKey(c);
      const prev = byKey.get(key);
      if (!prev || c.length > prev.length) byKey.set(key, c);
    }
    return ['All', ...Array.from(byKey.values()).sort((a, b) => a.localeCompare(b))];
    // items is a derived array — listing it as a dep is fine, useMemo
    // will recompute when chosenWines / cellarReviews change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenWines, cellarReviews]);

  // A not-yet-reviewed restaurant/other pick that should surface in Your Wine
  // Reviews as "Awaiting Review": has no review, its identity isn't already
  // reviewed elsewhere (phantom rows), and it hasn't been dismissed. Same rule
  // the flat `awaitingReview` list uses.
  const isAwaitingPick = (w: ChosenWine): boolean =>
    !chosenHasReview(w) && !reviewedIdentityKeys.has(idKey(w)) && !w.review_dismissed;
  function isAwaitingItem(it: ReviewItem): boolean {
    return (it.source === 'restaurant' || it.source === 'other') && isAwaitingPick(it.wine as ChosenWine);
  }

  // Whether an item belongs in the list at all — a written chosen review, any
  // cellar review, OR an awaiting pick (which now stacks in by date alongside
  // reviews rather than sitting in a separate section). Used by the Location /
  // Month option lists and the main filter so they agree on what's visible.
  function isShownReview(it: ReviewItem): boolean {
    if (isWishlist(it)) return false;
    if (it.source === 'restaurant' || it.source === 'other') return chosenHasReview(it.wine as ChosenWine) || isAwaitingPick(it.wine as ChosenWine);
    return true; // cellar reviews are always shown
  }

  // Months surfaced by the Month chip — every month that carries a shown review,
  // most-recent first. 'all' is the no-filter sentinel.
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      if (!isShownReview(it)) continue;
      const k = monthKey(it.date);
      if (k) set.add(k);
    }
    return ['all', ...Array.from(set).sort((a, b) => b.localeCompare(a))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenWines, cellarReviews]);

  // Apply filters. Search is applied last so the chips still own the
  // visible "shape" — typing a query just narrows whatever filters
  // are on, matching Full Cellar List's behaviour.
  const q = foldAccents(search.trim());
  const filtered = items.filter((it) => {
    // Wish List wines never appear here. Awaiting picks DO show now (stacked by
    // date); the header's "X awaiting" toggle narrows to only them.
    if (!isShownReview(it)) return false;
    if (awaitingOnly && !isAwaitingItem(it)) return false;
    // Collection selector: All shows everything; otherwise a single source. The
    // three collections map straight onto item.source (restaurant / cellar /
    // other) now that they're distinct slices.
    if (typeFilter !== 'all' && it.source !== typeFilter) return false;
    // Bespoke Other filter — only bites while the Other collection is active.
    if (typeFilter === 'other' && tagFilter !== 'all' && !(tagAssign[it.wine.id] ?? []).includes(tagFilter)) return false;
    if (monthFilter !== 'all' && monthKey(it.date) !== monthFilter) return false;
    if (locationFilter !== 'All' && cityKey(cityFor(it)) !== cityKey(locationFilter)) return false;
    if (favouriteFilter === 'fav' && !(it.wine as { is_favourite?: boolean }).is_favourite) return false;
    if (activeCustomId) {
      const f = customFilters.find((cf) => cf.id === activeCustomId);
      if (!(f?.itemIds ?? []).includes(it.wine.id)) return false;
    }
    if (q) {
      const w = it.wine as { producer?: string | null; wine_name?: string | null; region?: string | null; grape_variety?: string | null; vintage?: string | number | null };
      const hay = foldAccents([w.producer, w.wine_name, w.region, w.grape_variety, w.vintage != null ? String(w.vintage) : null]
        .filter(Boolean)
        .join(' '));
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

  // Bespoke-filter management — mirrors the Label Library.
  function applyCustom(id: string) {
    setActiveCustomId((prev) => (prev === id ? null : id));
  }
  function openCreateFilter() {
    setEditingFilter(null);
    setFilterModalOpen(true);
  }
  function openFilterOptions(f: LibraryFilter) {
    showAlert({
      title: f.name,
      body: 'Edit this folder’s name and wines, or delete it. Your reviews stay in the list either way.',
      buttons: [
        { text: 'Edit', onPress: () => { setEditingFilter(f); setFilterModalOpen(true); } },
        { text: 'Delete', style: 'destructive', onPress: () => { if (activeCustomId === f.id) setActiveCustomId(null); removeFilter.mutate(f.id); } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  async function saveFilter(name: string, ids: string[]) {
    setSavingFilter(true);
    try {
      if (editingFilter) {
        await renameFilter.mutateAsync({ filterId: editingFilter.id, name });
        await setFilterItems.mutateAsync({ filterId: editingFilter.id, itemIds: ids });
      } else {
        await createFilter.mutateAsync({ name, itemIds: ids });
      }
      setFilterModalOpen(false);
      setEditingFilter(null);
    } catch (err) {
      showAlert({ title: 'Could not save filter', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingFilter(false);
    }
  }
  // Items offered in the create/edit sheet — every reviewed/awaiting wine, by
  // name + review date. Deduped by wine id (one entry per review group).
  const filterItems = useMemo(() => {
    const seen = new Set<string>();
    const out: { id: string; label: string; sublabel?: string }[] = [];
    for (const it of items) {
      if (!isShownReview(it)) continue;
      if (seen.has(it.wine.id)) continue;
      seen.add(it.wine.id);
      const w = it.wine as ChosenWine;
      out.push({
        id: it.wine.id,
        label: wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name || w.producer || 'Wine',
        sublabel: it.date ? new Date(it.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined,
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Labels surfaced inside each chip's value line.
  const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: 'recent',     label: 'Recently added (default)' },
    { value: 'score-desc', label: 'Descending score' },
    { value: 'score-asc',  label: 'Ascending score' },
  ];
  // Collection — the centred selector above the filters. Restaurant / Cellar /
  // Other are distinct slices mapped onto item.source; Wish List is no longer
  // part of Wine Reviews.
  const COLLECTION_OPTIONS: { value: TypeFilter; label: string }[] = [
    { value: 'all',        label: 'All Wine Reviews' },
    { value: 'restaurant', label: 'Restaurant Wine Reviews' },
    { value: 'cellar',     label: 'Cellar Wine Reviews' },
    { value: 'other',      label: 'Other Wine Reviews' },
  ];
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? 'Recently added (default)';
  const collectionLabel = COLLECTION_OPTIONS.find((o) => o.value === typeFilter)?.label ?? 'All Wine Reviews';
  const yourScoreLabel = (sortMode === 'score-desc' || sortMode === 'score-asc') ? sortLabel : 'Any';
  const locationLabel = locationFilter === 'All' ? 'All' : locationFilter;
  const favouriteLabel = favouriteFilter === 'fav' ? 'Favourites' : 'All';

  // Build the dropdown config for whichever chip the user tapped.
  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'sort') return { title: 'Your Score', options: SORT_OPTIONS, selected: sortMode, onSelect: (v) => setSortMode(v as SortMode) };
    if (field === 'type') return { title: 'Collection', options: COLLECTION_OPTIONS, selected: typeFilter, onSelect: (v) => setTypeFilter(v as TypeFilter) };
    if (field === 'month') return {
      title: 'Filter by month',
      options: availableMonths.map((k) => ({ value: k, label: monthLabel(k) })),
      selected: monthFilter,
      onSelect: setMonthFilter,
    };
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

  // Long-press a review. Other reviews get a first step so the user can file
  // them under a bespoke filter (e.g. "BBR Tasting") as well as delete; every
  // other source goes straight to the delete confirm.
  function handleLongPressReview(item: ReviewItem) {
    if (item.source === 'other') {
      const w = item.wine;
      showAlert({
        title: wineHeaderLine(w.producer, w.wine_name, w.vintage),
        buttons: [
          { text: 'Add to Folder', onPress: () => setAssignForId(w.id) },
          { text: 'Delete wine', style: 'destructive', onPress: () => confirmDeleteReview(item) },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    confirmDeleteReview(item);
  }

  // Delete a review. A restaurant review is its own chosen_wines row, so it's
  // deleted outright. A cellar review lives on the cellar_wines row, so we only
  // clear the review fields — the bottle stays in the cellar.
  function confirmDeleteReview(item: ReviewItem) {
    const w = item.wine;
    const label = wineHeaderLine(w.producer, w.wine_name, w.vintage);
    const onError = (err: unknown) => showAlert({
      title: 'Could not delete',
      body: err instanceof Error ? err.message : 'Please try again.',
    });
    const isCellar = item.source === 'cellar';
    // Long-press delete removes the WINE from the reviews list (not just its
    // review text). To delete the review only — keeping the wine — the user opens
    // it and taps Edit. A cellar wine's bottle stays in the cellar either way.
    showAlert({
      title: 'Delete this wine?',
      body: isCellar
        ? `${label}\n\nThis will delete your review and remove this wine from your list of wines to review — the bottle stays in your cellar. To delete the review only, open it and tap Edit.`
        : `${label}\n\nThis will delete your review and remove this wine from your list of wines to review. To delete the review only, open it and tap Edit.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const uid = session?.user.id;
            if (isCellar) {
              // Optimistically clear the review fields on the cellar row so the
              // wine leaves the reviews list instantly; the mutation reconciles.
              qc.setQueryData(['cellar', uid], (old: any) =>
                Array.isArray(old)
                  ? old.map((c: any) =>
                      c.id === item.wine.id
                        ? { ...c, user_notes: null, review_score: null, review_location: null, review_date: null, review_entries: [] }
                        : c,
                    )
                  : old,
              );
              updateWine.mutate(
                {
                  id: item.wine.id,
                  updates: { user_notes: null, review_score: null, review_location: null, review_date: null, review_entries: [] } as any,
                },
                {
                  onError: (err) => {
                    qc.invalidateQueries({ queryKey: ['cellar', uid] });
                    onError(err);
                  },
                },
              );
            } else {
              // Delete every chosen_wines row in this wine's review group so the
              // whole wine leaves the list (not just the head entry).
              const gid = (item.wine as ChosenWine).review_group_id ?? item.wine.id;
              const ids = chosenWines.filter((c) => (c.review_group_id ?? c.id) === gid).map((c) => c.id);
              const targets = ids.length ? ids : [item.wine.id];
              const drop = new Set(targets);
              // Optimistically remove the rows from the list so it updates instantly.
              qc.setQueryData(['chosen-wines', uid], (old: any) =>
                Array.isArray(old) ? old.filter((c: any) => !drop.has(c.id)) : old,
              );
              targets.forEach((id) =>
                remove.mutate(id, {
                  onError: (err) => {
                    qc.invalidateQueries({ queryKey: ['chosen-wines', uid] });
                    onError(err);
                  },
                }),
              );
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
    setAddConfirmed(false);
    setAddLabelPath(null);
    setAddOpen(true);
  }

  // Scan / Upload both OCR a label and then open the SAME Add-a-Review modal as
  // Manual (pre-filled) — no wine intel card, no /label detour.
  async function handleChooseScan() { setChooserOpen(false); void ocrThenReview('camera'); }
  async function handleChooseUpload() { setChooserOpen(false); void ocrThenReview('library'); }
  // Review a wine already in the cellar — hand off to the cellar picker, which
  // opens that bottle's cellar review.
  function handleChooseCellar() { setChooserOpen(false); setCellarPickerSearch(''); setCellarPickerOpen(true); }

  // "Scan again" from the review input — redo the capture for a bad OCR read.
  function handleScanAgain() {
    showAlert({
      title: 'Scan again',
      body: 'Take a new photo of the label, or upload one.',
      buttons: [
        { text: 'Scan Photo', onPress: () => void ocrThenReview('camera') },
        { text: 'Upload Photo', onPress: () => void ocrThenReview('library') },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  async function ocrThenReview(source: 'camera' | 'library') {
    try {
      if (!(await ensureMediaPermission(source))) return;
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const picked = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (picked.canceled || !picked.assets?.[0]) return;
      const uri = picked.assets[0].uri;
      // Close any open add modal so it re-seeds cleanly on reopen (the reset only
      // runs on a visible false→true toggle). No-op on the first scan.
      setAddOpen(false);
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
      setAddConfirmed(false);
      setAddLabelPath(null);
      // The scanned photo rides onto the review itself (AddChosenWineModal's
      // labelImageUri). It no longer ALSO spawns a Your Label Library row —
      // the label library (Scan Archive) is fed only by actual label scans,
      // so a review no longer duplicates the wine into it.
      setAddOpen(true);
    } catch (err) {
      showAlert({ title: 'Could not open photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Bottle tallies for the open review — how many bottles of THIS wine the user
  // holds in the active cellar vs the archive. Matched on the same robust
  // name-token + vintage key the reviews list uses, summed by quantity so the
  // figures update as bottles are added or archived.
  const detailBottleCounts = (() => {
    if (!detailItem) return { cellar: 0, archive: 0 };
    const key = reviewKey(detailItem.wine);
    const tally = (rows: CellarWine[]) =>
      rows.filter((w) => reviewKey(w) === key).reduce((n, w) => n + (w.quantity ?? 1), 0);
    return { cellar: tally(cellarWines), archive: tally(archivedWines) };
  })();

  return (
    <View style={styles.container}>
      <EditChosenWineModal
        // Pass the LIVE row (not the snapshot) so a label photo attached from
        // inside the modal shows immediately — the snapshot never refreshes.
        wine={editingWine ? (chosenWines.find((w) => w.id === editingWine.id) ?? editingWine) : null}
        visible={!!editingWine}
        onClose={() => { setEditingWine(null); const back = returnToDetailRef.current; returnToDetailRef.current = null; if (back) setDetailItem(back); else if (cameViaLabelLink) returnToLibrary(); }}
        onSaved={() => {
          const w = editingWine;
          setEditingWine(null);
          if (returnToDetailRef.current) { returnToDetailRef.current = null; return; }
          // Came via a Label-Library link → show this wine's review detail card.
          if (cameViaLabelLink && w) { void openSavedReviewDetail({ id: w.id, producer: w.producer, wineName: w.wine_name, vintage: w.vintage }); }
        }}
      />

      <ReviewDetailModal
        review={detailItem
          ? (detailItem.source === 'cellar'
              ? fromCellar(detailItem.wine as CellarWine)
              : fromChosenGroup((detailItem as Extract<ReviewItem, { source: 'restaurant' }>).entries))
          : null}
        cellarBottles={detailBottleCounts.cellar}
        archiveBottles={detailBottleCounts.archive}
        visible={!!detailItem}
        onShare={() => { if (detailItem) void handleShareReview(detailItem); }}
        onNoteGenerated={(note) => {
          // Persist a card-generated Vinster's Note so it never regenerates.
          // Restaurant/other reviews have a rationale column (the head row);
          // cellar reviews don't, so they regenerate on demand each time.
          const it = detailItem; if (!it || it.source === 'cellar') return;
          void patchChosenWine(it.wine.id, { rationale: note })
            .then(() => qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] }))
            .catch(() => { /* best-effort persistence */ });
        }}
        onClose={() => { setDetailItem(null); if (cameViaLink) returnToLibrary(); }}
        onAddReview={() => {
          const it = detailItem; if (!it) return;
          setDetailItem(null);
          if (it.source === 'cellar') { setEditingCellarLatest(false); setEditingCellarWine(it.wine as CellarWine); return; }
          // Occasion add-to: open the review input pre-filled with this wine;
          // its dedup then offers "Add to that review / Create a new review".
          const w = it.wine as ChosenWine;
          // Carry the stored menu price so the new entry keeps the restaurant
          // list price even though the user no longer has the menu.
          setAddInitial({ producer: w.producer, wineName: w.wine_name, vintage: w.vintage, region: w.region, listPrice: w.menu_price });
          setAddSource(it.source === 'other' ? 'other' : 'restaurant');
          // Review-card add flow: the wine is known, so use the clean review-card
          // layout (thumbnail + name, no identity fields / header), carry the
          // photo, and append to THIS review's group with no "reviewed before" prompt.
          setAddConfirmed(true);
          setAddLabelPath(labelPathFor(it));
          setAddToGroupId(w.review_group_id ?? w.id);
          setAddOpen(true);
        }}
        onEditLatest={() => {
          const it = detailItem; if (!it) return;
          returnToDetailRef.current = it; // restore this card when the editor closes
          setDetailItem(null);
          if (it.source === 'cellar') { setEditingCellarLatest(true); setEditingCellarWine(it.wine as CellarWine); }
          else setEditingWine((it as Extract<ReviewItem, { source: 'restaurant' }>).entries[0]);
        }}
        thumbPath={detailItem ? labelPathFor(detailItem) : null}
        onAddPhoto={() => {
          const it = detailItem; if (!it) return;
          attachPhoto.present({
            kind: it.source === 'cellar' ? 'cellar' : 'chosen',
            wineId: it.wine.id,
            producer: it.wine.producer,
            wineName: it.wine.wine_name,
          });
        }}
        onDeleteEntry={async (entryId) => {
          const it = detailItem; if (!it) return;
          if (it.source === 'cellar') {
            // Drop just this entry from the bottle's review_entries and re-mirror
            // the flat review_* fields onto whatever entry is now the latest.
            const w = it.wine as CellarWine;
            const remaining = byRecency(entriesOf(w)).filter((e) => e.id !== entryId);
            await updateWine.mutateAsync({ id: w.id, updates: { review_entries: remaining, ...flatMirror(remaining[0] ?? null) } });
          } else {
            // Occasion entries are individual chosen_wines rows.
            await remove.mutateAsync(entryId);
          }
        }}
      />

      <EditCellarReviewModal
        wine={editingCellarWine}
        visible={!!editingCellarWine}
        editLatest={editingCellarLatest}
        onClose={() => { setEditingCellarWine(null); const back = returnToDetailRef.current; returnToDetailRef.current = null; if (back) setDetailItem(back); else if (cameViaLink) returnToLibrary(); }}
        onSaved={() => {
          setEditingCellarWine(null);
          returnToDetailRef.current = null;
          // Saved from an archived wine card: confirm it landed in Your Wine
          // Reviews, then send the user back to the archived wine card (backTo).
          if (params.savedToast) {
            const name = decodeURIComponent(params.savedToast);
            showAlert({
              title: 'Review Saved',
              body: `Your review of ${name} has been saved to Your Wine Reviews.`,
              buttons: [{ text: 'OK', onPress: () => returnToLibrary() }],
            });
          } else if (cameViaLink) {
            returnToLibrary();
          }
        }}
      />

      <AddChosenWineModal
        visible={addOpen}
        initial={addInitial}
        labelImageUri={pendingReviewLabelUri}
        onScanAgain={handleScanAgain}
        confirmedIdentity={addConfirmed}
        labelImagePath={addLabelPath}
        addToGroupId={addToGroupId}
        source={addSource}
        onClose={() => { setAddOpen(false); setAddInitial(null); setPendingReviewLabelUri(null); setAddConfirmed(false); setAddLabelPath(null); setAddToGroupId(null); if (cameViaLabelLink) returnToLibrary(); }}
        onSaved={() => {
          const init = addInitial;
          setAddOpen(false); setAddInitial(null); setPendingReviewLabelUri(null); setAddConfirmed(false); setAddLabelPath(null); setAddToGroupId(null);
          // Came via a Label-Library link → show this wine's review detail card.
          if (cameViaLabelLink) { void openSavedReviewDetail({ producer: init?.producer, wineName: init?.wineName, vintage: init?.vintage }); }
        }}
      />

      <LibraryFilterModal
        visible={filterModalOpen}
        title={editingFilter ? 'Edit folder' : 'New folder'}
        itemNoun="wines"
        nounLabel="folder"
        items={filterItems}
        initialName={editingFilter?.name}
        initialSelected={editingFilter?.itemIds}
        saving={savingFilter}
        onSave={saveFilter}
        onClose={() => { setFilterModalOpen(false); setEditingFilter(null); }}
      />

      {/* "+ Add" step 1 — "Add a Wine Review": pick the collection. Restaurant
          and Other both flow into the Scan / Upload / Manual chooser (tagged with
          the chosen source); Cellar opens a picker over the live cellar, since a
          cellar review must attach to a real bottle you own. */}
      <Modal visible={collectionChooserOpen} transparent animationType="fade" onRequestClose={() => setCollectionChooserOpen(false)}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={() => setCollectionChooserOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>Add a Wine Review</Text>
            <Text style={styles.chooserBody}>Which kind of wine are you reviewing?</Text>
            <TouchableOpacity style={styles.chooserBtn} onPress={() => { setCollectionChooserOpen(false); setAddSource('restaurant'); setRestaurantAwaitingOpen(true); }} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Restaurant Wine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={() => { setCollectionChooserOpen(false); setCellarPickerSearch(''); setCellarPickerOpen(true); }} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Cellar Wine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={() => { setCollectionChooserOpen(false); setAddSource('other'); setChooserOpen(true); }} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Other Wine</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCollectionChooserOpen(false)} style={styles.chooserCancel}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* "+ Add" → Restaurant Wine — first offer the restaurant wines already
          recorded and awaiting review (tap one to review it). If there are none,
          say so and let the user "Add Wine Anyway", which drops into the usual
          Scan / Upload / Manual chooser. */}
      <Modal visible={restaurantAwaitingOpen} transparent animationType="fade" onRequestClose={() => setRestaurantAwaitingOpen(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setRestaurantAwaitingOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.dropdownSheet} onPress={() => {}}>
            <Text style={styles.dropdownTitle}>Restaurant Wine</Text>
            {awaitingReview.length === 0 ? (
              <>
                <Text style={styles.pickerEmpty}>You have no restaurant wines awaiting review.</Text>
                <TouchableOpacity
                  onPress={() => { setRestaurantAwaitingOpen(false); setChooserOpen(true); }}
                  style={styles.addAnywayWrap}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addAnywayLink}>Add Wine Anyway</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.chooserBody}>Pick a wine you've recorded and want to review.</Text>
                <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
                  {awaitingReview.map((w) => (
                    <TouchableOpacity
                      key={`await-pick-${w.id}`}
                      style={styles.dropdownOption}
                      onPress={() => { setRestaurantAwaitingOpen(false); setEditingWine(w); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownOptionText} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                      {[locationLine(w), w.chosen_at ? formatDate(w.chosen_at) : ''].filter(Boolean).length ? (
                        <Text style={styles.awaitingMeta} numberOfLines={1}>
                          {[locationLine(w), w.chosen_at ? formatDate(w.chosen_at) : ''].filter(Boolean).join(' · ')}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  onPress={() => { setRestaurantAwaitingOpen(false); setChooserOpen(true); }}
                  style={styles.addAnywayWrap}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addAnywayLink}>Add Wine Anyway</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.dropdownCancel} onPress={() => setRestaurantAwaitingOpen(false)}>
              <Text style={styles.dropdownCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* "+ Add" → Cellar Wine — pick a bottle from the live cellar to review.
          Selecting one opens EditCellarReviewModal (the same review form as the
          wine card), which writes the review onto that cellar_wines row. */}
      <Modal visible={cellarPickerOpen} transparent animationType="fade" onRequestClose={() => setCellarPickerOpen(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setCellarPickerOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.dropdownSheet} onPress={() => {}}>
            <Text style={styles.dropdownTitle}>Choose a cellar wine</Text>
            <TextInput
              style={styles.pickerSearch}
              value={cellarPickerSearch}
              onChangeText={setCellarPickerSearch}
              placeholder="Search your cellar…"
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
            />
            {(() => {
              const pq = cellarPickerSearch.trim().toLowerCase();
              const rows = cellarWines
                .filter((w) => !w.is_wishlist && !w.archived_at)
                .filter((w) => {
                  if (!pq) return true;
                  const hay = [w.producer, w.wine_name, w.region, w.vintage != null ? String(w.vintage) : null].filter(Boolean).join(' ').toLowerCase();
                  return hay.includes(pq);
                })
                .sort((a, b) => wineHeaderLine(a.producer, a.wine_name, a.vintage).localeCompare(wineHeaderLine(b.producer, b.wine_name, b.vintage)));
              return (
                <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
                  {rows.length === 0 ? (
                    <Text style={styles.pickerEmpty}>No cellar wines match.</Text>
                  ) : rows.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      style={styles.dropdownOption}
                      onPress={() => { setCellarPickerOpen(false); setEditingCellarWine(w); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownOptionText} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                      {w.review_score != null || (w.user_notes && w.user_notes.trim()) ? (
                        <Text style={styles.pickerReviewed}>Reviewed</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              );
            })()}
            <TouchableOpacity style={styles.dropdownCancel} onPress={() => setCellarPickerOpen(false)}>
              <Text style={styles.dropdownCancelText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* "+ Add" step 2 (restaurant / other) — Scan / Upload run the same label
          recognise+confirm pathway as an intel scan, but land on the review input
          instead of the intel card. Manual opens the by-hand review form. */}
      <Modal visible={chooserOpen} transparent animationType="fade" onRequestClose={() => setChooserOpen(false)}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={() => setChooserOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>Add a wine review</Text>
            <Text style={styles.chooserBody}>Scan or upload a label and Vinster identifies the bottle, enter it by hand, or pick a wine from your cellar — then straight to your review.</Text>
            <TouchableOpacity style={styles.chooserBtn} onPress={handleChooseScan} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={handleChooseUpload} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Upload A Wine Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={handleChooseManual} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Search/Manual Input</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={handleChooseCellar} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Select from Cellar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setChooserOpen(false)} style={styles.chooserCancel}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Create a bespoke Other filter (e.g. "BBR Tasting"). */}
      <Modal visible={newTagOpen} transparent animationType="fade" onRequestClose={cancelNewTag}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={cancelNewTag}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>New folder</Text>
            <Text style={styles.chooserBody}>Name a bespoke folder for your Other wine reviews — a tasting, an event, a merchant. You'll then file reviews under it.</Text>
            <TextInput
              style={styles.pickerSearch}
              value={newTagName}
              onChangeText={setNewTagName}
              placeholder="e.g. BBR Tasting"
              placeholderTextColor={colors.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={commitNewTag}
            />
            <TouchableOpacity style={styles.chooserBtn} onPress={commitNewTag} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Create folder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelNewTag} style={styles.chooserCancel}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Assign a review to bespoke filters — tick the tags it belongs to, or
          create a new one on the spot. */}
      <Modal visible={!!assignForId} transparent animationType="fade" onRequestClose={() => setAssignForId(null)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setAssignForId(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.dropdownSheet} onPress={() => {}}>
            <Text style={styles.dropdownTitle}>Add to Folder</Text>
            {customFilters.length === 0 ? (
              <Text style={styles.pickerEmpty}>No folders yet — create one below.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 340 }}>
                {customFilters.map((f) => {
                  const on = !!(assignForId && f.itemIds.includes(assignForId));
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.dropdownOption, on && styles.dropdownOptionActive]}
                      onPress={() => { if (assignForId) toggleReviewInFolder(assignForId, f); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownOptionText, on && styles.dropdownOptionTextActive]}>{f.name}</Text>
                      {on && <Text style={styles.dropdownOptionCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.chooserBtn}
              onPress={() => { pendingAssignRef.current = assignForId; setAssignForId(null); setNewTagName(''); setNewTagOpen(true); }}
              activeOpacity={0.85}
            >
              <Text style={styles.chooserBtnText}>＋ New folder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownCancel} onPress={() => setAssignForId(null)}>
              <Text style={styles.dropdownCancelText}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* On-open nudge to review a waiting restaurant bottle pick. */}
      <Modal visible={!!reviewPrompt} transparent animationType="fade" onRequestClose={() => setReviewPrompt(null)}>
        <View style={styles.promptOverlay}>
          <View style={styles.promptSheet}>
            <TouchableOpacity style={styles.promptClose} onPress={() => setReviewPrompt(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
              <Text style={styles.promptCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.promptTitle}>Wines you drank recently are awaiting your review</Text>
            <Text style={styles.promptSubheader}>Select a wine to review it</Text>
            <ScrollView style={{ maxHeight: 320 }} alwaysBounceVertical={false}>
              {(reviewPrompt ?? []).map((w) => (
                <TouchableOpacity key={w.id} style={styles.promptWineRow} onPress={() => openAwaitingReview(w)} activeOpacity={0.7}>
                  <Text style={styles.promptWineLink} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name || 'Wine'}</Text>
                  {(w.restaurant_name || w.city) ? (
                    <Text style={styles.promptWineMeta} numberOfLines={1}>{[w.restaurant_name, w.city].filter(Boolean).join(' · ')}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.promptDontShow} onPress={dontShowPromptForever} activeOpacity={0.7}>
              <Text style={styles.promptDontShowText}>Don't show me this again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full-screen zoomable viewer for a tapped label thumbnail. */}
      <LabelPhotoViewer
        visible={!!expandedThumb}
        path={expandedThumb?.path}
        fallbackText={expandedThumb?.name ?? undefined}
        onClose={() => setExpandedThumb(null)}
      />

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
          onPress={() => { setAddSource('other'); setAddToGroupId(null); setChooserOpen(true); }}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        >
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.empty}><ActivityIndicator size="large" color={colors.gold} /></View>
      ) : !hasAnything ? (
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
                // Awaiting picks now live in `filtered` too, so count reviews and
                // awaiting separately: reviews = shown items minus awaiting; wines
                // = distinct identities across both.
                const wineKeys = new Set(filtered.map((it) => {
                  const w = it.wine as { producer?: string | null; wine_name?: string | null; vintage?: string | number | null };
                  return `${(w.producer ?? '').toLowerCase()}|${(w.wine_name ?? '').toLowerCase()}|${w.vintage ?? ''}`;
                }));
                const r = filtered.filter((it) => !isAwaitingItem(it)).length;
                const n = wineKeys.size;
                // Total awaiting in the current collection (independent of the
                // toggle, so the label stays stable when tapped).
                const a = awaitingReview.filter((w) =>
                  typeFilter === 'all' || (w.source === 'other' ? 'other' : 'restaurant') === typeFilter,
                ).length;
                return (
                  <>
                    {`${r} ${r === 1 ? 'Review' : 'Reviews'} · ${n} ${n === 1 ? 'Wine' : 'Wines'}`}
                    {(a > 0 || awaitingOnly) ? (
                      // Tap to toggle the "awaiting only" filter; tap again to clear.
                      // Stays visible while the toggle is on so it's always escapable.
                      <Text>{'\n'}<Text style={[styles.summaryLink, awaitingOnly && styles.summaryLinkActive]} onPress={() => setAwaitingOnly((v) => !v)}>{`${a} ${a === 1 ? 'Wine' : 'Wines'} awaiting your review${awaitingOnly ? '  ✕' : ''}`}</Text></Text>
                    ) : null}
                  </>
                );
              })()}
            </Text>
          </View>

          {/* Collection selector — centred, gold, with a chevron. Tapping it
              opens the same 'type' dropdown (All / Restaurant / Cellar / Other
              Wine Reviews) that the old Collection chip used to. */}
          <TouchableOpacity style={styles.collectionHeader} onPress={() => setOpenDropdown('type')} activeOpacity={0.7}>
            <Text style={styles.collectionHeaderText}>{collectionLabel}</Text>
            <Text style={styles.collectionChevron}>{openDropdown === 'type' ? '▴' : '▾'}</Text>
          </TouchableOpacity>

          {/* Bespoke Other filters — create named tags (e.g. "BBR Tasting") and
              file Other reviews under them (long-press a review → "Add to a
              filter"). Only shown while the Other collection is selected. */}
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
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('month')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Month</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'month' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, monthFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{monthLabel(monthFilter)}</Text>
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
            {customFilters.map((f) => {
              const active = activeCustomId === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterChip, active && styles.filterChipSort]}
                  onPress={() => applyCustom(f.id)}
                  onLongPress={() => openFilterOptions(f)}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  {/* Two-row layout with a top-right chevron so bespoke filters
                      match the standard filter bubbles. */}
                  <View style={styles.filterChipHeadingRow}>
                    <Text style={styles.filterChipLabel}>Your Folder</Text>
                    <Text style={styles.filterChipChevron}>▾</Text>
                  </View>
                  <Text style={[styles.filterChipValue, active && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{f.name}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.customChipAdd} onPress={openCreateFilter} activeOpacity={0.7}>
              <Text style={styles.customChipAddText}>+ Add</Text>
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
              const awaiting = isAwaitingItem(item);
              // All reviews open the same unified detail view.
              const entries = isChosen ? (item as Extract<ReviewItem, { source: 'restaurant' }>).entries : [];
              const uni = isChosen ? fromChosenGroup(entries) : fromCellar(item.wine as CellarWine);
              // Awaiting picks open the review INPUT (write your review); reviewed
              // items open the detail view.
              const onPress = () => awaiting ? setEditingWine(item.wine as ChosenWine) : setDetailItem(item);
              const locText = isChosen
                ? locationLine(item.wine as ChosenWine)
                : (item.wine as CellarWine).review_location ?? '';
              const thumbPath = labelPathFor(item);
              return (
                <TouchableOpacity
                  key={`${item.source}-${w.id}`}
                  style={styles.cardCompact}
                  onPress={onPress}
                  onLongPress={() => awaiting ? promptDismissAwaiting(item.wine as ChosenWine) : handleLongPressReview(item)}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardCompactOuter}>
                    <View style={styles.reviewThumbWrap}>
                      {thumbPath ? (
                        <TouchableOpacity onPress={() => setExpandedThumb({ path: thumbPath, name: w.wine_name })} activeOpacity={0.85}>
                          <LabelThumb path={thumbPath} fallbackText={w.wine_name} style={styles.reviewThumb} radius={5} frame={3} />
                        </TouchableOpacity>
                      ) : (
                        // No label shot (e.g. a wine picked from a scanned list) —
                        // offer to add one right from the review card.
                        <AddPhotoThumb
                          style={styles.reviewThumb}
                          radius={5}
                          onPress={() => attachPhoto.present({
                            kind: isChosen ? 'chosen' : 'cellar',
                            wineId: w.id,
                            producer: w.producer,
                            wineName: w.wine_name,
                          })}
                        />
                      )}
                      {/* Favourite star — always visible in the thumbnail's
                          top-right; a subtle outline when off, gold ★ when on.
                          Tapping toggles it without opening the review. */}
                      {(() => {
                        const fav = !!(item.wine as { is_favourite?: boolean }).is_favourite;
                        return (
                          <TouchableOpacity
                            style={styles.reviewFavStar}
                            onPress={() => {
                              if (isChosen) setFavourite.mutate({ id: w.id, isFavourite: !fav });
                              else updateWine.mutate({ id: w.id, updates: { is_favourite: !fav } });
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.reviewFavStarText, !fav && styles.reviewFavStarTextOff]}>{fav ? '★' : '☆'}</Text>
                          </TouchableOpacity>
                        );
                      })()}
                    </View>
                    <View style={styles.cardCompactBody}>
                      {/* Producer · Name · Vintage (white). No score here. */}
                      <Text style={styles.wineNameCompact} numberOfLines={2}>
                        {wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                      </Text>
                      {/* Region, Country (yellow). No grape. */}
                      {w.region ? <Text style={styles.regionText} numberOfLines={1}>{regionWithCountry(w.region)}</Text> : null}
                      {/* Review date · location stamp (white). Wraps when long. */}
                      <Text style={[styles.metaText, styles.cardCompactMeta]}>
                        {formatDate(item.date)}{locText ? ` · ${locText}` : ''}
                      </Text>
                      {/* Yellow stats line — "Awaiting Review" for a pick not yet
                          reviewed, otherwise the entry count + average score. */}
                      <Text style={styles.reviewStatsLine}>
                        {awaiting
                          ? 'Awaiting Review'
                          : `${uni.count} ${uni.count === 1 ? 'Review' : 'Reviews'}${uni.averageScore != null ? ` · ${uni.averageScore} Average Score` : ''}`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {/* Awaiting-review picks now stack into the list above, sorted by date
              (see isShownReview) — no separate bottom section. */}
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
  promptClose: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10, padding: 6 },
  promptCloseText: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.textMuted, lineHeight: 20 },
  promptTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.lg },
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
  // Sub-header + tappable wine rows for the awaiting-review prompt list.
  promptSubheader: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  promptWineRow: { paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
  promptWineLink: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold, lineHeight: 22 },
  promptWineMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  promptDontShow: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  promptDontShowText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  // Bottle Picks Awaiting Review section.
  awaitingSection: { marginTop: spacing.xl },
  awaitingHeader: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: spacing.xl, marginBottom: spacing.sm },
  subHeader: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.sm },
  // Centred collection selector (All / Restaurant / Cellar / Other Wine Reviews)
  // that sits where the old "Wine Reviews" sub-header was — gold, with a chevron.
  collectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.xl },
  collectionHeaderText: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  collectionChevron: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold },
  // Bespoke Other filter chips (pill row under the collection header).
  tagScroll: { flexGrow: 0, flexShrink: 0 },
  tagRow: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xs, gap: spacing.xs, alignItems: 'center' },
  tagChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 6, marginRight: spacing.xs },
  tagChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.14)' },
  tagChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted },
  tagChipTextActive: { color: colors.gold },
  tagChipNew: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 6 },
  tagChipNewText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  // Cellar-wine picker (+ Add → Cellar Wine).
  pickerSearch: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: spacing.sm },
  pickerEmpty: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  addAnywayWrap: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs },
  addAnywayLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textDecorationLine: 'underline' },
  pickerReviewed: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.gold, marginLeft: spacing.sm },
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
  // Larger thumbnail, matching the Label Library, with a top-right favourite star.
  reviewThumb: { width: 100, height: 130 },
  reviewThumbWrap: { width: 100, height: 130 },
  reviewFavStar: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  reviewFavStarText: { fontSize: 14, color: colors.gold, lineHeight: 16 },
  reviewFavStarTextOff: { color: 'rgba(255,255,255,0.75)' },
  cardCompactRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  cardCompactMeta: { marginTop: 2 },
  reviewStatsLine: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.gold, marginTop: 3 },
  wineNameCompact: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, lineHeight: 22 },
  regionText: { fontSize: 14, fontFamily: fonts.headingItalic, color: colors.gold, marginTop: 2 },
  // The user's own review score — white, matching the wine cards (critic scores
  // are gold; the user's score is white).
  scoreCompact: { fontSize: 18, fontFamily: fonts.bodyBold, color: '#FFFFFF' },
  // Cluster sits as a column on the right: score (+ favourite star) at
  // the top, the white share icon below it.
  scoreCluster: { alignItems: 'flex-end', gap: spacing.xs },
  scoreLine: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  favouriteStar: { fontSize: 18, color: colors.gold },
  metaText: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  emptyFilter: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  // Summary + filter carousel — copied from Full Cellar List
  // (app/cellar/list.tsx) so the two screens look identical above the
  // list itself. Sort chip is gold-bordered to mark it as the most
  // common interaction.
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  // Tappable variant of the awaiting-review line (no underline, per house style).
  summaryLink: { marginTop: 4 },
  // Active state — the "awaiting only" toggle is on; underline + '✕' signal it.
  summaryLinkActive: { textDecorationLine: 'underline' },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  // Mic + Camera "Add" prompts above the filters.
  addIconsRow: { flexDirection: 'row', gap: spacing.xl, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  iconsSeparator: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs },
  addIconBtn: { width: 52, height: 52, borderRadius: 12, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 120, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  filterChipSort: { borderColor: colors.gold },
  // Bespoke user-created filter chips (the "+ Add" row) — same look as the
  // Label Library, with the trailing margin the built-in chips use.
  customChip: { height: 56, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.md, marginRight: spacing.sm, maxWidth: 160 },
  customChipActive: { borderColor: colors.gold },
  customChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  customChipAdd: { height: 56, justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.md, marginRight: spacing.sm },
  customChipAddText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
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
