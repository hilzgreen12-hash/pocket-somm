import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Share, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { getCellarWineById } from '../../src/api/cellar';
import { patchChosenWine, bulkDeleteChosenWines, clearChosenReview, deleteChosenWine } from '../../src/api/chosenWines';
import { deleteLibraryFilter, type LibraryFilter } from '../../src/api/libraryFilters';
import { getCachedLabelUri } from '../../src/api/labelImageCache';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { useChosenWines, useWineReviewCards } from '../../src/hooks/useChosenWines';
import { useCellar, useArchive } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useAttachLabelPhoto } from '../../src/hooks/useAttachLabelPhoto';
import { useLibraryFilters } from '../../src/hooks/useLibraryFilters';
import { useLabelStore } from '../../src/stores/labelStore';
import { EditChosenWineModal } from '../../src/components/EditChosenWineModal';
import { EditCellarReviewModal, type NewReviewSeed } from '../../src/components/EditCellarReviewModal';
import { AddChosenWineModal } from '../../src/components/AddChosenWineModal';
import { ReviewDetailModal } from '../../src/components/ReviewDetailModal';
import { WineReviewShareCard } from '../../src/components/WineReviewShareCard';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import { LabelThumb } from '../../src/components/LabelThumb';
import { AddPhotoThumb } from '../../src/components/AddPhotoThumb';
import { LabelPhotoViewer } from '../../src/components/LabelPhotoViewer';
import { showAlert } from '../../src/components/AppAlert';
import {
  cardKeyForChosen, chosenGroupId, chosenHasReview, refsOf, reviewIdentityKey, reviewTotals,
  type EntryRef, type UnifiedEntry, type UnifiedReview,
} from '../../src/utils/reviewModel';
import { drinkingDateTime, entriesOf, latestEntry, withoutEntries } from '../../src/utils/cellarReview';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../../src/utils/shareCard';
import { ensureConnectionForUpload } from '../../src/utils/connectionGuard';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { isMonthFirstCurrency } from '../../src/utils/vivinoCsv';
import { regionWithCountry } from '../../src/utils/wineOrigin';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { isoToYmd } from '../../src/utils/reviewDate';
import { normaliseCity } from '../../src/utils/city';
import { foldAccents, matchesWineSearch } from '../../src/utils/wineIdentity';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { ChosenWine, CellarWine } from '../../src/types/wine';
import { findCellarHoldings } from '../../src/services/archiveNight';
import { launchCamera, launchImageLibrary } from '../../src/utils/imagePicker';

function formatDate(date: string | null | undefined): string {
  const t = drinkingDateTime(date);
  return t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

// Month key + label for the Month filter. Key is 'YYYY-MM' (sortable);
// label is "July 2026". 'all' is the no-filter sentinel.
function monthKey(date: string | null | undefined): string {
  const t = drinkingDateTime(date);
  if (!t) return '';
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(key: string): string {
  if (key === 'all' || !key) return 'All';
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// City normalised on read so legacy rows saved as "Greater London" (a UK
// reverse-geocode subregion) render as "London".
function locationLine(wine: ChosenWine): string {
  return [wine.restaurant_name, normaliseCity(wine.city)].filter(Boolean).join(', ');
}

// One row of the list: a wine's review card, or a pick still awaiting review.
type ListItem =
  | { kind: 'review'; card: UnifiedReview }
  | { kind: 'awaiting'; pick: ChosenWine };

type Identity = { producer: string | null; wine_name: string | null; vintage: string | number | null; region: string | null; grape: string | null };

const itemKey = (it: ListItem) => (it.kind === 'review' ? it.card.key : `pick:${it.pick.id}`);
const itemDate = (it: ListItem) => (it.kind === 'review' ? it.card.latestDate ?? '' : it.pick.chosen_at);
const itemScore = (it: ListItem) => (it.kind === 'review' ? it.card.averageScore : null);
const itemIdentity = (it: ListItem): Identity => (it.kind === 'review'
  ? { producer: it.card.producer, wine_name: it.card.wineName, vintage: it.card.vintage, region: it.card.region, grape: it.card.grape }
  : { producer: it.pick.producer, wine_name: it.pick.wine_name, vintage: it.pick.vintage, region: it.pick.region, grape: it.pick.grape });
// The id a folder stores for this item. A pick reviewed in place keeps the
// same group id, so it stays in its folder once reviewed.
const itemFolderId = (it: ListItem) => (it.kind === 'review' ? it.card.folderId : chosenGroupId(it.pick));
// Every id a folder may hold for this item — older folders stored row ids.
const itemMemberIds = (it: ListItem): string[] => (it.kind === 'review'
  ? [it.card.folderId, ...it.card.chosenRows.map((r) => r.id), ...it.card.cellarWines.map((w) => w.id)]
  : [chosenGroupId(it.pick), it.pick.id]);

type SortMode = 'recent' | 'score-desc' | 'score-asc';
// Collection filter — restaurant (Winelist), cellar or other.
type TypeFilter = 'all' | 'cellar' | 'restaurant' | 'other';
type FilterField = 'sort' | 'type' | 'month' | null;

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'recent',     label: 'All' },
  { value: 'score-desc', label: 'Descending score' },
  { value: 'score-asc',  label: 'Ascending score' },
];
const COLLECTION_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all',        label: 'All Wine Reviews' },
  { value: 'restaurant', label: 'Winelist Wines' },
  { value: 'cellar',     label: 'Cellar Wines' },
  { value: 'other',      label: 'Other Wines' },
];

type AddSeed = { producer?: string | null; wineName?: string | null; vintage?: string | number | null; region?: string | null; grape?: string | null; listPrice?: number | null; date?: string | null };

export default function ChosenWinesScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { chosenWines, dismissAwaiting } = useChosenWines();
  const { cards, awaiting, isLoading } = useWineReviewCards();
  const { wines: liveWines, updateWine } = useCellar();
  const { wines: archivedWines } = useArchive();
  const { preferences } = usePreferences();
  const attachPhoto = useAttachLabelPhoto();
  const params = useLocalSearchParams<{
    openReview?: string; openCellarReview?: string; openCellarReviewInput?: string; openCellarReviewEdit?: string;
    seedAdd?: string; addManual?: string; sp?: string; sw?: string; sv?: string; sr?: string; sg?: string; slp?: string; slu?: string; sd?: string;
    backTo?: string; savedToast?: string; fromIntel?: string;
    // With openCellarReviewInput, from the archived-wines prompt: the new
    // review is dated the archive day, at the place its Archive Note names.
    fromArchive?: string;
  }>();

  // The user's own bottles. In a shared household cellar the cellar queries
  // hold the owner's bottles, which aren't the user's to review here.
  const ownLive = useMemo(() => liveWines.filter((w) => w.user_id === userId), [liveWines, userId]);
  const ownArchived = useMemo(() => archivedWines.filter((w) => w.user_id === userId), [archivedWines, userId]);
  const findBottle = (id: string) => ownLive.find((w) => w.id === id) ?? ownArchived.find((w) => w.id === id);

  // ---- Arriving for one wine -------------------------------------------------
  // A deep link to a specific wine (a wine card, Wine Intel, a lineup, the
  // Review tab carousel) returns there when its review closes.
  const arrivedForOneWine = !!(params.openReview || params.openCellarReview || params.openCellarReviewInput || params.openCellarReviewEdit || params.seedAdd === '1');
  // Pop back to the explicit backTo screen (pushing it again would stack a
  // duplicate that takes several Backs to escape), else simply go back.
  const returnToCaller = () => {
    if (params.backTo) router.dismissTo(decodeURIComponent(params.backTo) as any);
    else router.back();
  };

  // ---- Open review card + editors ---------------------------------------------
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const detailCard = detailKey ? cards.find((c) => c.key === detailKey) ?? null : null;
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);
  const [editingCellar, setEditingCellar] = useState<{ wine: CellarWine; entryId: string | null; seed?: NewReviewSeed } | null>(null);
  // The card an editor was opened from, reopened when the editor closes.
  const returnToDetailRef = useRef<string | null>(null);
  // Hidden twins of the entry being edited (see UnifiedEntry.twins). Removed
  // once the edit is saved, so the old copy can't resurface beside it.
  const pendingCopiesRef = useRef<EntryRef[]>([]);
  // A first cellar review hands off to Edit Wine Details when the title is
  // tapped; remember the bottle so the review reopens (draft intact) on return.
  const reopenCellarEditorRef = useRef<{ id: string; entryId: string | null } | null>(null);
  const [expandedThumb, setExpandedThumb] = useState<{ path: string; name?: string | null } | null>(null);

  // ---- Add a review -------------------------------------------------------------
  const [chooserOpen, setChooserOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  // Pre-fill for the Add modal — OCR from Scan / Upload, or a known wine.
  const [addInitial, setAddInitial] = useState<AddSeed | null>(null);
  // A scanned/uploaded label's local uri, uploaded with the new review.
  const [pendingReviewLabelUri, setPendingReviewLabelUri] = useState<string | null>(null);
  // The wine is already known, so the Add modal shows the review card layout.
  const [addConfirmed, setAddConfirmed] = useState(false);
  const [addLabelPath, setAddLabelPath] = useState<string | null>(null);
  // Set from a card's "+ Add Review": the new entry joins this review group.
  const [addToGroupId, setAddToGroupId] = useState<string | null>(null);
  const [addSource, setAddSource] = useState<'restaurant' | 'other'>('other');
  const [uploading, setUploading] = useState(false);
  const [cellarPickerOpen, setCellarPickerOpen] = useState(false);
  const [cellarPickerSearch, setCellarPickerSearch] = useState('');

  // ---- Filters ------------------------------------------------------------------
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  // Toggled by the "X Wines awaiting your review" line: only awaiting picks.
  const [awaitingOnly, setAwaitingOnly] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [search, setSearch] = useState('');
  // Your Folders — user-created filters (the "+ Add" chip).
  const { filters: customFilters, create: createFilter, setItems: setFilterItems, rename: renameFilter, remove: removeFilter } = useLibraryFilters('wine-review');
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<LibraryFilter | null>(null);
  const [savingFilter, setSavingFilter] = useState(false);
  // An import folder's delete can cover thousands of reviews — show progress.
  const [deletingImport, setDeletingImport] = useState(false);
  // The item whose "Add to Folder" sheet is open, and the folder picked in it.
  const [assignFor, setAssignFor] = useState<ListItem | null>(null);
  const [assignPick, setAssignPick] = useState<string | null>(null);
  useEffect(() => { if (assignFor) setAssignPick(null); }, [assignFor]);
  // Cards being deleted from a long-press, hidden until the refetch lands.
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());

  // ---- Data refresh + entry removal ----------------------------------------------
  function invalidateReviews() {
    return Promise.all([
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] }),
      qc.invalidateQueries({ queryKey: ['cellar', userId] }),
      qc.invalidateQueries({ queryKey: ['cellar-archive', userId] }),
      qc.invalidateQueries({ queryKey: ['my-community-uploads', userId] }),
    ]);
  }

  // Remove stored entries, touching only the rows they live in. A restaurant
  // pick keeps its row on its visit with the review cleared — and with
  // `dismissPicks`, hidden from Awaiting Review too.
  async function removeEntries(refs: EntryRef[], { dismissPicks = false } = {}) {
    const jobs: Promise<unknown>[] = [];
    const entriesByBottle = new Map<string, { wine: CellarWine; ids: string[] }>();
    for (const ref of refs) {
      if (ref.kind === 'chosen') {
        jobs.push(ref.row.scan_session_id
          ? clearChosenReview(ref.row.id, { dismiss: dismissPicks })
          : deleteChosenWine(ref.row.id));
      } else {
        const bottle = entriesByBottle.get(ref.wine.id) ?? { wine: ref.wine, ids: [] };
        bottle.ids.push(ref.entryId);
        entriesByBottle.set(ref.wine.id, bottle);
      }
    }
    // One write per bottle, from its latest cached copy, so removing several
    // entries can't overwrite each other.
    for (const { wine, ids } of entriesByBottle.values()) {
      const live = findBottle(wine.id) ?? wine;
      jobs.push(updateWine.mutateAsync({ id: live.id, updates: withoutEntries(live, ids) }));
    }
    try {
      await Promise.all(jobs);
    } finally {
      await invalidateReviews();
    }
  }

  function collapsePendingCopies() {
    const copies = pendingCopiesRef.current;
    pendingCopiesRef.current = [];
    if (copies.length) void removeEntries(copies).catch(() => { /* a leftover copy is harmless */ });
  }

  // ---- Opening editors / cards -----------------------------------------------------
  function openEntryEditor(ref: EntryRef, copies: EntryRef[]) {
    pendingCopiesRef.current = copies;
    if (ref.kind === 'chosen') setEditingWine(ref.row);
    else setEditingCellar({ wine: ref.wine, entryId: ref.entryId });
  }

  // A new entry on a cellar bottle (entryId null), or edit one of its entries.
  function openCellarEditor(wine: CellarWine, entryId: string | null, seed?: NewReviewSeed) {
    pendingCopiesRef.current = [];
    setEditingCellar({ wine, entryId, seed });
  }

  // Wait for fresh data before opening a card a save may have just created.
  async function refreshThenOpen(findKey: () => string | null) {
    await Promise.all([
      qc.refetchQueries({ queryKey: ['chosen-wines', userId] }),
      qc.refetchQueries({ queryKey: ['cellar', userId] }),
      qc.refetchQueries({ queryKey: ['cellar-archive', userId] }),
    ]).catch(() => { /* fall back to the cache */ });
    const key = findKey();
    if (key) setDetailKey(key);
    else if (arrivedForOneWine) returnToCaller();
  }

  // An editor closed (saved or not): back to the card it was opened from, else
  // — when we arrived for this one wine — back to the caller.
  function afterEditorClosed(openAfter: (() => string | null) | null = null) {
    const back = returnToDetailRef.current;
    returnToDetailRef.current = null;
    if (back) {
      if (cards.some((c) => c.key === back)) setDetailKey(back);
      else void refreshThenOpen(() => back);
    } else if (openAfter) {
      void refreshThenOpen(openAfter);
    } else if (arrivedForOneWine) {
      returnToCaller();
    }
  }

  function closeDetail() {
    setDetailKey(null);
    if (arrivedForOneWine) returnToCaller();
  }

  // The open card's last entry was deleted (or the wine otherwise left the
  // list) — close it.
  useEffect(() => {
    if (detailKey && !isLoading && !detailCard) closeDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailKey, detailCard, isLoading]);

  useFocusEffect(useCallback(() => {
    const pending = reopenCellarEditorRef.current;
    if (!pending) return;
    reopenCellarEditorRef.current = null;
    getCellarWineById(pending.id)
      .then((fresh) => { if (fresh) setEditingCellar({ wine: fresh, entryId: pending.entryId }); })
      .catch(() => {});
  }, []));

  // ---- Deep links ------------------------------------------------------------------
  //   ?openReview=<chosen id>            → that row's review card (or its input, if it's an unreviewed pick)
  //   ?openCellarReview=<cellar id>      → that bottle's review card
  //   ?openCellarReviewInput=<cellar id> → a new entry on that bottle
  //   ?openCellarReviewEdit=<cellar id>  → edit that bottle's latest entry
  //   ?addManual=1                       → the "Add a wine review" chooser
  //   ?seedAdd=1&sp&sw&sv&sr&sg&sd&slp&slu → a new review of a known wine
  // Each is handled once per distinct param set.
  const handledParamRef = useRef<string | null>(null);
  useEffect(() => {
    if (isLoading) return;
    const once = (key: string) => {
      if (handledParamRef.current === key) return false;
      handledParamRef.current = key;
      return true;
    };
    if (params.openReview) {
      const row = chosenWines.find((w) => w.id === params.openReview);
      if (!row || !once(`open:${row.id}`)) return;
      const card = cards.find((c) => c.chosenRows.some((r) => r.id === row.id));
      if (card) setDetailKey(card.key);
      else setEditingWine(row); // an unreviewed pick opens straight onto its input
      return;
    }
    const bottleId = params.openCellarReview ?? params.openCellarReviewInput ?? params.openCellarReviewEdit;
    if (bottleId) {
      const bottle = findBottle(bottleId);
      if (!bottle || !once(`bottle:${bottleId}`)) return;
      const card = cards.find((c) => c.cellarWines.some((w) => w.id === bottleId));
      if (params.openCellarReview && card) { setDetailKey(card.key); return; }
      const latest = params.openCellarReviewEdit ? latestEntry(entriesOf(bottle)) : null;
      if (!latest) {
        const seed = params.fromArchive === '1' ? { date: isoToYmd(bottle.archived_at), venue: bottle.archive_note ?? null } : undefined;
        openCellarEditor(bottle, null, seed);
        return;
      }
      const entry = card?.entries.find((e) => refsOf(e).some((r) => r.kind === 'cellar' && r.entryId === latest.id));
      const self: EntryRef = { kind: 'cellar', wine: bottle, entryId: latest.id };
      openEntryEditor(self, entry ? refsOf(entry).filter((r) => !(r.kind === 'cellar' && r.entryId === latest.id)) : []);
      return;
    }
    if (params.addManual === '1') {
      if (!once('addManual')) return;
      setAddSource('other');
      setAddToGroupId(null);
      setChooserOpen(true);
      return;
    }
    if (params.seedAdd === '1') {
      if (!once(`add:${params.sp}|${params.sw}|${params.sv}`)) return;
      setAddInitial({ producer: params.sp || null, wineName: params.sw || null, vintage: params.sv || null, region: params.sr || null, grape: params.sg || null, date: params.sd || null });
      // slu=1: a fresh scan whose label is still a local uri in the label
      // store; slp: an already-uploaded storage path.
      setPendingReviewLabelUri(params.slu === '1' ? (useLabelStore.getState().imageUri ?? null) : null);
      setAddConfirmed(true);
      setAddLabelPath(params.slp || null);
      setAddOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, params.openReview, params.openCellarReview, params.openCellarReviewInput, params.openCellarReviewEdit, params.seedAdd, params.addManual, params.sp, params.sw, params.sv, chosenWines, cards, liveWines, archivedWines]);

  // ---- Awaiting-review prompt --------------------------------------------------------
  // One-time, dismissible nudge listing the picks waiting for a review. Only
  // on a plain visit — not when the user deep-linked in for a specific wine.
  const promptKey = `vinster-bottle-pick-prompt-dismissed:${userId ?? 'anon'}`;
  const [reviewPrompt, setReviewPrompt] = useState<ChosenWine[] | null>(null);
  const promptShownRef = useRef(false);
  useEffect(() => {
    if (promptShownRef.current || isLoading || awaiting.length === 0) return;
    promptShownRef.current = true;
    if (arrivedForOneWine) return;
    const list = [...awaiting];
    AsyncStorage.getItem(promptKey)
      .then((dismissed) => { if (!dismissed) setReviewPrompt(list); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, awaiting.length]);
  async function dontShowPromptForever() {
    try { await AsyncStorage.setItem(promptKey, '1'); } catch { /* non-fatal */ }
    setReviewPrompt(null);
  }

  // Long-press an awaiting pick: a soft dismiss, not a delete — the wine stays
  // on its restaurant's card in Your Restaurants.
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

  // ---- The list --------------------------------------------------------------------
  const items: ListItem[] = useMemo(() => [
    ...cards.filter((c) => !deletingKeys.has(c.key)).map((card): ListItem => ({ kind: 'review', card })),
    ...awaiting.map((pick): ListItem => ({ kind: 'awaiting', pick })),
  ], [cards, awaiting, deletingKeys]);

  // A wine the user owns (in the live cellar) belongs to the Cellar collection
  // even when it was reviewed at a restaurant.
  const ownedIdentities = useMemo(() => new Set(ownLive.map(reviewIdentityKey)), [ownLive]);
  function collectionOf(it: ListItem): TypeFilter {
    if (it.kind === 'review' && it.card.source === 'cellar') return 'cellar';
    if (ownedIdentities.has(reviewIdentityKey(itemIdentity(it)))) return 'cellar';
    return it.kind === 'review' ? it.card.source : it.pick.source;
  }

  const availableMonths = useMemo(() => {
    const months = new Set(items.map((it) => monthKey(itemDate(it))).filter(Boolean));
    return ['all', ...Array.from(months).sort((a, b) => b.localeCompare(a))];
  }, [items]);

  const activeFolder = activeCustomId ? customFilters.find((f) => f.id === activeCustomId) : undefined;
  const q = foldAccents(search.trim());
  const filtered = items.filter((it) => {
    if (awaitingOnly && it.kind !== 'awaiting') return false;
    if (typeFilter !== 'all' && collectionOf(it) !== typeFilter) return false;
    if (monthFilter !== 'all' && monthKey(itemDate(it)) !== monthFilter) return false;
    if (activeFolder && !itemMemberIds(it).some((id) => activeFolder.itemIds.includes(id))) return false;
    if (q) {
      const w = itemIdentity(it);
      if (!matchesWineSearch([w.producer, w.wine_name, w.region, w.grape, w.vintage], q)) return false;
    }
    return true;
  });

  // Score sorts push score-less items to the bottom; ties fall back to recency.
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode !== 'recent') {
      const as = itemScore(a);
      const bs = itemScore(b);
      if ((as == null) !== (bs == null)) return as == null ? 1 : -1;
      if (as != null && bs != null && as !== bs) return sortMode === 'score-desc' ? bs - as : as - bs;
    }
    return drinkingDateTime(itemDate(b)) - drinkingDateTime(itemDate(a));
  });

  const totals = reviewTotals(filtered.flatMap((it) => (it.kind === 'review' ? [it.card] : [])));
  const awaitingCount = new Set(filtered.flatMap((it) => (it.kind === 'awaiting' ? [reviewIdentityKey(it.pick)] : []))).size;

  // A bottle's label photo stands in when a review has none of its own.
  const cellarPhotoByIdentity = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of ownLive) if (w.label_image_path) map.set(reviewIdentityKey(w), w.label_image_path);
    return map;
  }, [ownLive]);
  function labelPathFor(it: ListItem): string | null {
    const own = it.kind === 'review' ? it.card.photoPath : it.pick.label_image_path;
    return own ?? cellarPhotoByIdentity.get(reviewIdentityKey(itemIdentity(it))) ?? null;
  }
  // Where an added photo goes: the review's newest chosen row, else its bottle.
  function presentAddPhoto(it: ListItem) {
    const row = it.kind === 'awaiting' ? it.pick : it.card.chosenRows.find(chosenHasReview);
    const bottle = it.kind === 'review' ? it.card.cellarWines[0] : undefined;
    const target = row ?? bottle;
    if (!target) return;
    attachPhoto.present({ kind: row ? 'chosen' : 'cellar', wineId: target.id, producer: target.producer, wineName: target.wine_name });
  }

  // ---- Deleting a whole wine (long-press) ---------------------------------------------
  function handleLongPressReview(card: UnifiedReview) {
    if (card.source !== 'other') { confirmDeleteCard(card); return; }
    // Other reviews can also be filed into a folder (e.g. "BBR Tasting").
    showAlert({
      title: wineHeaderLine(card.producer, card.wineName, card.vintage),
      buttons: [
        { text: 'Add to Folder', onPress: () => setAssignFor({ kind: 'review', card }) },
        { text: 'Delete wine', style: 'destructive', onPress: () => confirmDeleteCard(card) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Removes every review of the wine. Bottles stay in the cellar and restaurant
  // picks stay on their visits; only the reviews go.
  function confirmDeleteCard(card: UnifiedReview) {
    const label = wineHeaderLine(card.producer, card.wineName, card.vintage);
    const keepsBottle = card.cellarWines.length > 0 ? ' — the bottle stays in your cellar' : '';
    showAlert({
      title: 'Delete this wine?',
      body: `${label}\n\nThis deletes ${card.count === 1 ? 'your review' : `all ${card.count} of your reviews`} and removes this wine from your reviews${keepsBottle}. To delete a single review, open the wine and use Delete on that review.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Unreviewed rows in the group go too, so the wine leaves the list.
            const bareRows: EntryRef[] = card.chosenRows.filter((r) => !chosenHasReview(r)).map((row) => ({ kind: 'chosen', row }));
            setDeletingKeys((prev) => new Set(prev).add(card.key));
            removeEntries([...card.entries.flatMap(refsOf), ...bareRows], { dismissPicks: true })
              .catch((err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }))
              .finally(() => setDeletingKeys((prev) => { const next = new Set(prev); next.delete(card.key); return next; }));
          },
        },
      ],
    });
  }

  // ---- Folders -------------------------------------------------------------------------
  function openFilterOptions(f: LibraryFilter) {
    // An "Import — <date>" folder can also delete every review it brought in —
    // the clean way to undo an import before re-importing a corrected file.
    const isImport = /^import\b/i.test(f.name.trim());
    showAlert({
      title: f.name,
      body: 'Edit this folder’s name and wines, or delete it. Deleting the folder keeps your reviews in the list.',
      buttons: [
        { text: 'Edit', onPress: () => { setEditingFilter(f); setFilterModalOpen(true); } },
        { text: 'Delete Folder Only', style: 'destructive', onPress: () => { if (activeCustomId === f.id) setActiveCustomId(null); removeFilter.mutate(f.id); } },
        ...(isImport ? [{ text: 'Delete Import & Its Reviews', style: 'destructive' as const, onPress: () => confirmDeleteImport(f) }] : []),
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function confirmDeleteImport(f: LibraryFilter) {
    const n = f.itemIds.length;
    showAlert({
      title: 'Delete this import?',
      body: `This permanently deletes the folder “${f.name}” and all ${n} review${n === 1 ? '' : 's'} it imported. This can’t be undone.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Everything', style: 'destructive', onPress: async () => {
          setDeletingImport(true);
          try {
            if (activeCustomId === f.id) setActiveCustomId(null);
            // The folder's own ids are row ids (imports) or group ids; delete
            // the chosen rows of every review in it. Cellar entries are untouched.
            const rowIds = new Set(f.itemIds);
            for (const it of items) {
              if (it.kind === 'review' && itemMemberIds(it).some((id) => f.itemIds.includes(id))) {
                for (const r of it.card.chosenRows) rowIds.add(r.id);
              }
            }
            await bulkDeleteChosenWines([...rowIds]);
            await deleteLibraryFilter(f.id);
            qc.invalidateQueries({ queryKey: ['chosen-wines'] });
            qc.invalidateQueries({ queryKey: ['library-filters'] });
          } catch (err) {
            showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
          } finally {
            setDeletingImport(false);
          }
        } },
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
  // Every wine on the list, offered in the create/edit folder sheet.
  const filterItems = useMemo(() => items.map((it) => {
    const w = itemIdentity(it);
    const date = itemDate(it);
    return {
      id: itemFolderId(it),
      label: wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name || w.producer || 'Wine',
      sublabel: date ? new Date(drinkingDateTime(date)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined,
    };
  }), [items]);
  // A folder's current members as folder ids (older folders hold row ids).
  const editingFilterSelection = useMemo(() => (editingFilter
    ? items.filter((it) => itemMemberIds(it).some((id) => editingFilter.itemIds.includes(id))).map(itemFolderId)
    : undefined), [editingFilter, items]);

  // ---- Filter chips ----------------------------------------------------------------------
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? 'All';
  const collectionChipLabel = typeFilter === 'all' ? 'All'
    : typeFilter === 'restaurant' ? 'Winelist'
    : typeFilter === 'cellar' ? 'Cellar' : 'Other';
  const yourScoreLabel = sortMode === 'recent' ? 'All' : sortLabel;
  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'sort') return { title: 'Your Score', options: SORT_OPTIONS, selected: sortMode, onSelect: (v) => setSortMode(v as SortMode) };
    if (field === 'type') return { title: 'Collection', options: COLLECTION_OPTIONS, selected: typeFilter, onSelect: (v) => setTypeFilter(v as TypeFilter) };
    if (field === 'month') return {
      title: 'Filter by month',
      options: availableMonths.map((k) => ({ value: k, label: monthLabel(k) })),
      selected: monthFilter,
      onSelect: setMonthFilter,
    };
    return null;
  }
  const activeDropdown = dropdownConfig(openDropdown);

  // ---- Import -------------------------------------------------------------------------------
  // Reviews come in from a Vivino export or a general spreadsheet, both as CSV
  // (xlsx text mangles on-device).
  function openReviewImportMenu() {
    showAlert({
      title: 'Import Reviews',
      buttons: [
        { text: 'Import Vivino CSV File', onPress: () => showImportInstructions('vivino-reviews') },
        { text: 'Import Spreadsheet', onPress: () => showImportInstructions('review-spreadsheet') },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function showImportInstructions(src: 'vivino-reviews' | 'review-spreadsheet') {
    const dateLine = isMonthFirstCurrency(preferences?.defaultCurrency)
      ? "You're in the US/Canada, so your file will be read with the date formatted month/day/year."
      : "You're in the UK/Europe, so your file will be read with the date formatted day/month/year.";
    const scoreLine = src === 'vivino-reviews'
      ? 'Your Vivino star ratings convert to Vinster\'s 100-point scale — each star is worth 20 points:\n\n5★ = 100   ·   4.5★ = 90   ·   4★ = 80\n3.5★ = 70   ·   3★ = 60   ·   2.5★ = 50'
      : 'Ratings on a 0–5 scale convert to Vinster\'s 100-point scale (each point = 20: 5 = 100, 4 = 80, 3 = 60). Scores already on a 0–100 scale are kept as they are.';
    showAlert({
      title: src === 'vivino-reviews' ? 'Import a Vivino CSV' : 'Import a Spreadsheet',
      body:
        'Vinster can only accept uploads saved as CSV files — please make sure you have saved your document correctly before uploading.\n\n' +
        'Ensure you have kept the Column Header row in the file, stating which input is in each column (Wine Name, Vintage, etc).\n\n' +
        scoreLine + '\n\n' +
        dateLine,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose File', onPress: () => router.push(`/cellar/import-cellar?source=${src}` as any) },
      ],
    });
  }

  // ---- Sharing ------------------------------------------------------------------------------
  // A review shares as a branded PNG (WineReviewShareCard, captured off-screen),
  // falling back to plain text where capture or expo-sharing isn't available.
  const reviewShareRef = useRef<View>(null);
  const [reviewSharing, setReviewSharing] = useState(false);
  const [reviewSharePayload, setReviewSharePayload] = useState<{
    producer: string | null; wineName: string; vintage: string | number | null; region: string | null;
    userScore: number | null; criticScore: number | null; tastingNote: string | null;
    date: string | null; location: string | null; isFavourite: boolean; imageUri: string | null;
  } | null>(null);

  async function handleShareReview(card: UnifiedReview) {
    if (reviewSharing) return;
    const latest = card.entries[0];
    // Only the shareable "Your Review" — never the private personal note.
    const tastingNote = (latest?.note ?? '').trim();
    const location = (latest?.location ?? '').trim();
    let imageUri: string | null = null;
    const photo = labelPathFor({ kind: 'review', card });
    if (photo) { try { imageUri = await getCachedLabelUri(photo); } catch { /* no photo */ } }
    setReviewSharePayload({
      producer: card.producer,
      wineName: card.wineName ?? '',
      vintage: card.vintage,
      region: card.region,
      userScore: card.averageScore,
      criticScore: card.vinsterIntel.criticScore,
      tastingNote,
      date: formatDate(latest?.dateIso) || null,
      location: location || null,
      isFavourite: !!latest?.favourite,
      imageUri,
    });
    setReviewSharing(true);
    try {
      // One paint to let the off-screen card mount with the new props.
      await new Promise((r) => setTimeout(r, 250));
      if (reviewShareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(reviewShareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a wine review') });
        return;
      }
      const header = wineHeaderLine(card.producer, card.wineName, card.vintage);
      const scoreText = card.averageScore != null ? `\nMy score: ${card.averageScore}/100` : '';
      const where = location ? `\nWhere: ${location}` : '';
      const note = tastingNote ? `\n\n"${tastingNote}"` : '';
      await Share.share({ message: `${header}${scoreText}${where}${note}${VINSTER_TEXT_SHARE_FOOTER}`, title: header });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setReviewSharing(false);
      setReviewSharePayload(null);
    }
  }

  // ---- "+ Add Review" chooser ----------------------------------------------------------------
  function resetAdd() {
    setAddOpen(false); setAddInitial(null); setPendingReviewLabelUri(null);
    setAddConfirmed(false); setAddLabelPath(null); setAddToGroupId(null);
  }
  function handleChooseManual() {
    setChooserOpen(false);
    resetAdd();
    setAddOpen(true);
  }
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

  // Scan / Upload read the label, then open the same Add modal as Manual,
  // pre-filled; the photo is uploaded with the review.
  async function ocrThenReview(source: 'camera' | 'library') {
    setChooserOpen(false);
    try {
      if (!(await ensureMediaPermission(source))) return;
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const picked = source === 'camera'
        ? await launchCamera(opts)
        : await launchImageLibrary(opts);
      if (picked.canceled || !picked.assets?.[0]) return;
      const uri = picked.assets[0].uri;
      // Close any open Add modal so it re-seeds cleanly when reopened.
      setAddOpen(false);
      if (!(await ensureConnectionForUpload())) return;
      let ocr: AddSeed | null = null;
      setUploading(true);
      try {
        const details = await scanLabel(await prepareImageBase64(uri));
        ocr = { producer: details.producer, wineName: details.wineName, vintage: details.vintage, region: details.region, grape: details.grape ?? null };
        // A wine the user holds takes their cellar's naming, so the review and
        // the bottle are recognised as the same wine (one card, and the
        // "exists in your cellar" offer on save).
        if (userId) {
          const own = (await findCellarHoldings(userId, { producer: ocr.producer ?? null, wineName: ocr.wineName ?? null, vintage: ocr.vintage ?? null }).catch(() => []))[0]?.wine;
          if (own) ocr = { ...ocr, producer: own.producer, wineName: own.wine_name, region: own.region ?? ocr.region, grape: own.grape_variety ?? ocr.grape };
        }
      } catch {
        // OCR failed — still open the input so the user can type the wine in.
      } finally {
        setUploading(false);
      }
      resetAdd();
      setAddInitial(ocr);
      setPendingReviewLabelUri(uri);
      // A label Vinster could read opens straight on the review card, headed by
      // the wine it read (Edit, top right, corrects it). Only an unreadable
      // photo falls back to the "Find Your Wine" step.
      setAddConfirmed(!!(ocr && (ocr.producer?.trim() || ocr.wineName?.trim())));
      setAddOpen(true);
    } catch (err) {
      showAlert({ title: 'Could not open photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // How many bottles of the open wine the user holds, live vs archived.
  const detailBottleCounts = useMemo(() => {
    if (!detailCard) return { cellar: 0, archive: 0 };
    const tally = (rows: CellarWine[]) => rows
      .filter((w) => reviewIdentityKey(w) === detailCard.identityKey)
      .reduce((n, w) => n + (w.quantity ?? 1), 0);
    return { cellar: tally(ownLive), archive: tally(ownArchived) };
  }, [detailCard, ownLive, ownArchived]);

  const editingCellarWine = editingCellar ? (findBottle(editingCellar.wine.id) ?? editingCellar.wine) : null;

  return (
    <View style={styles.container}>
      <EditChosenWineModal
        // The LIVE row, so a photo attached from inside the modal shows at once.
        wine={editingWine ? (chosenWines.find((w) => w.id === editingWine.id) ?? editingWine) : null}
        visible={!!editingWine}
        onSaved={collapsePendingCopies}
        onClose={() => {
          const row = editingWine;
          setEditingWine(null);
          pendingCopiesRef.current = [];
          // Arrived to review this one pick → show its card once saved.
          afterEditorClosed(arrivedForOneWine && row ? () => {
            const fresh = qc.getQueryData<ChosenWine[]>(['chosen-wines', userId])?.find((w) => w.id === row.id);
            return fresh && chosenHasReview(fresh) ? cardKeyForChosen(fresh) : null;
          } : null);
        }}
      />

      <EditCellarReviewModal
        wine={editingCellarWine}
        visible={!!editingCellar}
        editEntryId={editingCellar?.entryId ?? null}
        seed={editingCellar?.seed}
        onEditWine={(w) => {
          reopenCellarEditorRef.current = { id: w.id, entryId: editingCellar?.entryId ?? null };
          setEditingCellar(null);
          router.push(`/cellar/edit-wine/${w.id}` as any);
        }}
        onClose={() => { setEditingCellar(null); pendingCopiesRef.current = []; afterEditorClosed(); }}
        onSaved={() => {
          collapsePendingCopies();
          setEditingCellar(null);
          // Saved from an archived wine card: confirm where it went, then back.
          if (params.savedToast && !returnToDetailRef.current) {
            const name = decodeURIComponent(params.savedToast);
            showAlert({
              title: 'Review Saved',
              body: `Your review of ${name} has been saved to Your Wine Reviews.`,
              buttons: [{ text: 'OK', onPress: returnToCaller }],
            });
            return;
          }
          afterEditorClosed();
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
        onClose={() => { resetAdd(); afterEditorClosed(); }}
        onSaved={() => {
          const seed = addInitial;
          resetAdd();
          // From a Wine Intel card → straight back to that card.
          if (params.fromIntel === '1' && !returnToDetailRef.current) { returnToCaller(); return; }
          afterEditorClosed(arrivedForOneWine && seed ? () => {
            const want = reviewIdentityKey({ producer: seed.producer, wine_name: seed.wineName, vintage: seed.vintage });
            const fresh = qc.getQueryData<ChosenWine[]>(['chosen-wines', userId]) ?? [];
            const row = fresh.find((w) => chosenHasReview(w) && reviewIdentityKey(w) === want);
            return row ? cardKeyForChosen(row) : null;
          } : null);
        }}
      />

      <ReviewDetailModal
        review={detailCard}
        visible={!!detailCard}
        cellarBottles={detailBottleCounts.cellar}
        archiveBottles={detailBottleCounts.archive}
        thumbPath={detailCard ? labelPathFor({ kind: 'review', card: detailCard }) : null}
        onClose={closeDetail}
        onShare={() => { if (detailCard) void handleShareReview(detailCard); }}
        onAddPhoto={() => { if (detailCard) presentAddPhoto({ kind: 'review', card: detailCard }); }}
        onAddReview={() => {
          const card = detailCard; if (!card) return;
          returnToDetailRef.current = card.key;
          setDetailKey(null);
          const head = card.chosenRows.find(chosenHasReview);
          if (!head) {
            // A cellar-only review grows on its bottle (a live one if there is).
            openCellarEditor(card.cellarWines.find((w) => !w.archived_at) ?? card.cellarWines[0], null);
            return;
          }
          // The wine is known: the review-card layout, its photo, and the stored
          // menu price, appended to this review's group with no "reviewed before" prompt.
          resetAdd();
          setAddInitial({ producer: card.producer, wineName: card.wineName, vintage: card.vintage, region: card.region, grape: card.grape, listPrice: head.menu_price });
          setAddSource(card.source === 'other' ? 'other' : 'restaurant');
          setAddConfirmed(true);
          setAddLabelPath(labelPathFor({ kind: 'review', card }));
          setAddToGroupId(card.folderId);
          setAddOpen(true);
        }}
        onEditEntry={(entry: UnifiedEntry) => {
          if (detailCard) returnToDetailRef.current = detailCard.key;
          setDetailKey(null);
          openEntryEditor(entry.ref, entry.twins);
        }}
        onDeleteEntry={(entry: UnifiedEntry) => removeEntries(refsOf(entry))}
        onSavePersonalNote={async (entry, note) => {
          if (entry.ref.kind !== 'chosen') return;
          await patchChosenWine(entry.ref.row.id, { other_observations: note.trim() || null });
          await qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
        }}
        onNoteGenerated={(note) => {
          // Persist a generated Vinster's Note so it never regenerates. Only
          // chosen rows have a rationale column; cellar-only cards regenerate.
          const head = detailCard?.chosenRows.find(chosenHasReview);
          if (!head) return;
          void patchChosenWine(head.id, { rationale: note })
            .then(() => qc.invalidateQueries({ queryKey: ['chosen-wines', userId] }))
            .catch(() => { /* best-effort persistence */ });
        }}
      />

      <LibraryFilterModal
        visible={filterModalOpen}
        title={editingFilter ? 'Edit folder' : 'New folder'}
        itemNoun="wines"
        nounLabel="folder"
        items={filterItems}
        initialName={editingFilter?.name}
        initialSelected={editingFilterSelection}
        saving={savingFilter}
        onSave={saveFilter}
        onClose={() => { setFilterModalOpen(false); setEditingFilter(null); }}
      />

      {/* "+ Add" → Select from Cellar: a review written onto one of your bottles. */}
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
              const rows = ownLive
                .filter((w) => !pq || [w.producer, w.wine_name, w.region, w.vintage != null ? String(w.vintage) : null].filter(Boolean).join(' ').toLowerCase().includes(pq))
                .sort((a, b) => wineHeaderLine(a.producer, a.wine_name, a.vintage).localeCompare(wineHeaderLine(b.producer, b.wine_name, b.vintage)));
              return (
                <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
                  {rows.length === 0 ? (
                    <Text style={styles.pickerEmpty}>No cellar wines match.</Text>
                  ) : rows.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      style={styles.dropdownOption}
                      onPress={() => { setCellarPickerOpen(false); openCellarEditor(w, null); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownOptionText} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                      {entriesOf(w).length > 0 ? <Text style={styles.pickerReviewed}>Reviewed</Text> : null}
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

      {/* "+ Add Review" — Scan / Upload read a label into the review input;
          Search/Manual opens it blank; Select from Cellar reviews a bottle. */}
      <Modal visible={chooserOpen} transparent animationType="fade" onRequestClose={() => setChooserOpen(false)}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={() => setChooserOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>Add a wine review</Text>
            <Text style={styles.chooserBody}>Scan or upload a label and Vinster identifies the bottle, search for it, or pick a wine from your cellar — then straight to your review.</Text>
            <TouchableOpacity style={styles.chooserBtn} onPress={() => void ocrThenReview('camera')} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={() => void ocrThenReview('library')} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Upload A Wine Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={handleChooseManual} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Search/Manual Input</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={handleChooseCellar} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Select from Cellar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, { marginTop: spacing.sm }]} onPress={() => { setChooserOpen(false); openReviewImportMenu(); }} activeOpacity={0.85}>
              <Text style={styles.chooserBtnText}>Import Review Files</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setChooserOpen(false)} style={styles.chooserCancel}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Add a review to a folder — highlight one, Confirm files it. */}
      <Modal visible={!!assignFor} transparent animationType="fade" onRequestClose={() => setAssignFor(null)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setAssignFor(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.dropdownSheet} onPress={() => {}}>
            <Text style={styles.dropdownTitle}>Add to Folder</Text>
            {customFilters.length === 0 ? (
              <Text style={styles.pickerEmpty}>No folders yet. Create one from the folder row on the reviews screen.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 340 }}>
                {customFilters.map((f) => {
                  const picked = assignPick === f.id;
                  const already = !!assignFor && itemMemberIds(assignFor).some((id) => f.itemIds.includes(id));
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.dropdownOption, picked && styles.dropdownOptionActive]}
                      onPress={() => setAssignPick(f.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownOptionText, picked && styles.dropdownOptionTextActive]}>{f.name}</Text>
                      {already && <Text style={styles.dropdownOptionCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity
              style={[styles.confirmBtn, !assignPick && styles.confirmBtnDisabled]}
              disabled={!assignPick}
              onPress={() => {
                const f = customFilters.find((x) => x.id === assignPick);
                if (assignFor && f && !itemMemberIds(assignFor).some((id) => f.itemIds.includes(id))) {
                  setFilterItems.mutate({ filterId: f.id, itemIds: [...f.itemIds, itemFolderId(assignFor)] });
                }
                setAssignFor(null);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownCancel} onPress={() => setAssignFor(null)}>
              <Text style={styles.dropdownCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* On-open nudge listing the picks waiting for a review. */}
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
                <TouchableOpacity key={w.id} style={styles.promptWineRow} onPress={() => { setReviewPrompt(null); setEditingWine(w); }} activeOpacity={0.7}>
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

      {/* Blocks the screen while a scanned label is read, so "+ Add" can't be
          tapped again mid-scan. */}
      {uploading ? (
        <View style={styles.prepOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : null}

      {deletingImport ? (
        <View style={styles.uploadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.deletingText}>Deleting Folder & Contents…</Text>
        </View>
      ) : null}

      {/* Off-screen share card, mounted only while a share is in flight. */}
      {reviewSharePayload && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <WineReviewShareCard ref={reviewShareRef} {...reviewSharePayload} otherObservations={null} />
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Wine Reviews</Text>
        <TouchableOpacity
          onPress={() => { setAddSource('other'); setAddToGroupId(null); setChooserOpen(true); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerActionLink}>+ Add Review</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.empty}><ActivityIndicator size="large" color={colors.gold} /></View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>
            When you review a wine from a Vinster recommendation, it's saved here — or tap + Add at the top to enter one by hand. The reviews you write on your cellar wines appear here too.
          </Text>
        </View>
      ) : (
        <>
          {/* Wines · Reviews (every dated entry), then the awaiting toggle. */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {`${totals.wines} ${totals.wines === 1 ? 'Wine' : 'Wines'} · ${totals.reviews} ${totals.reviews === 1 ? 'Review' : 'Reviews'}`}
              {(awaitingCount > 0 || awaitingOnly) ? (
                <Text>{'\n'}<Text style={[styles.summaryLink, awaitingOnly && styles.summaryLinkActive]} onPress={() => setAwaitingOnly((v) => !v)}>{`${awaitingCount} ${awaitingCount === 1 ? 'Wine' : 'Wines'} awaiting your review${awaitingOnly ? '  ✕' : ''}`}</Text></Text>
              ) : null}
            </Text>
          </View>

          {/* Filter chips — Month / Your Score / Collection, then Your Folders
              and "+ Add" to create one. Same pattern as Full Cellar List. */}
          <Text style={styles.filterHint}>Listed by {sortMode === 'recent' ? 'recency' : sortLabel} · Swipe to see all filters →</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('month')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Month</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'month' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, monthFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{monthLabel(monthFilter)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('sort')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Your Score</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'sort' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, yourScoreLabel !== 'All' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{yourScoreLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('type')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Collection</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'type' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, typeFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{collectionChipLabel}</Text>
            </TouchableOpacity>
            {customFilters.map((f) => {
              const active = activeCustomId === f.id;
              // Import folders ("Import — <date>") show the date under an
              // "Import" heading; the user's own folders their name.
              const isImport = /^import\b/i.test(f.name.trim());
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setActiveCustomId((prev) => (prev === f.id ? null : f.id))}
                  onLongPress={() => openFilterOptions(f)}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  <View style={styles.filterChipHeadingRow}>
                    <Text style={styles.filterChipLabel}>{isImport ? 'Import' : 'Your Folder'}</Text>
                    <Text style={styles.filterChipChevron}>▾</Text>
                  </View>
                  <Text style={[styles.filterChipValue, active && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">
                    {isImport ? f.name.replace(/^import\s*[—-]\s*/i, '').trim() : f.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.customChipAdd} onPress={() => { setEditingFilter(null); setFilterModalOpen(true); }} activeOpacity={0.7}>
              <Text style={styles.customChipAddText}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>

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

          <FlatList
            data={sorted}
            keyExtractor={itemKey}
            contentContainerStyle={{ paddingBottom: 60 }}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={11}
            removeClippedSubviews
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyFilter}>
                <Text style={styles.emptyBody}>No reviews match these filters.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const w = itemIdentity(item);
              const thumbPath = labelPathFor(item);
              const place = item.kind === 'review' ? (item.card.entries[0]?.location ?? '') : locationLine(item.pick);
              return (
                <TouchableOpacity
                  style={styles.cardCompact}
                  // A review opens its card; an awaiting pick opens its input.
                  onPress={() => (item.kind === 'review' ? setDetailKey(item.card.key) : setEditingWine(item.pick))}
                  onLongPress={() => (item.kind === 'review' ? handleLongPressReview(item.card) : promptDismissAwaiting(item.pick))}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardCompactOuter}>
                    <View style={styles.reviewThumb}>
                      {thumbPath ? (
                        <TouchableOpacity onPress={() => setExpandedThumb({ path: thumbPath, name: w.wine_name })} activeOpacity={0.85}>
                          <LabelThumb path={thumbPath} fallbackText={w.wine_name} style={styles.reviewThumb} radius={5} frame={3} />
                        </TouchableOpacity>
                      ) : (
                        <AddPhotoThumb style={styles.reviewThumb} radius={5} onPress={() => presentAddPhoto(item)} />
                      )}
                    </View>
                    <View style={styles.cardCompactBody}>
                      <Text style={styles.wineNameCompact} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                      {w.region ? <Text style={styles.regionText} numberOfLines={1}>{regionWithCountry(w.region)}</Text> : null}
                      {w.grape ? <Text style={styles.grapeText} numberOfLines={1}>{w.grape}</Text> : null}
                      <Text style={[styles.metaText, styles.cardCompactMeta]}>
                        {formatDate(itemDate(item))}{place ? ` · ${place}` : ''}
                      </Text>
                      <Text style={styles.reviewStatsLine}>
                        {item.kind === 'awaiting'
                          ? 'Awaiting Review'
                          : `${item.card.count} ${item.card.count === 1 ? 'Review' : 'Reviews'}${item.card.averageScore != null ? ` · ${item.card.averageScore} Average Score` : ''}`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}

      {/* The dropdown for whichever filter chip was tapped. */}
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
                        onPress={() => { activeDropdown.onSelect(opt.value); setOpenDropdown(null); }}
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
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  // On-open review prompt.
  promptOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  promptSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 440 },
  promptClose: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10, padding: 6 },
  promptCloseText: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.textMuted, lineHeight: 20 },
  promptTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.lg },

  // Sub-header + tappable wine rows for the awaiting-review prompt list.
  promptSubheader: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  promptWineRow: { paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
  promptWineLink: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold, lineHeight: 22 },
  promptWineMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  promptDontShow: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  promptDontShowText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },

  // Cellar-wine picker (+ Add → Select from Cellar).
  pickerSearch: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: spacing.sm },
  pickerEmpty: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  pickerReviewed: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.gold, marginLeft: spacing.sm },

  headerActionLink: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.5, textAlign: 'right' },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  // Review bubbles — brown (colors.surface), matching Your Restaurant Reviews
  // and the carousel cards elsewhere.
  cardCompact: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  cardCompactOuter: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardCompactBody: { flex: 1 },
  // Label thumbnail to the left of the card text, like a cellar wine card.
  reviewThumb: { width: 100, height: 130 },

  cardCompactMeta: { marginTop: 2 },
  reviewStatsLine: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.gold, marginTop: 3 },
  wineNameCompact: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, lineHeight: 22 },
  regionText: { fontSize: 14, fontFamily: fonts.headingItalic, color: colors.gold, marginTop: 2 },
  grapeText: { fontSize: 13, fontFamily: fonts.headingItalic, color: colors.textMuted, marginTop: 1 },

  metaText: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  emptyFilter: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  // Summary + filter carousel — matches Full Cellar List (app/cellar/list.tsx)
  // so the two screens look the same above the list.
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  // Tappable variant of the awaiting-review line (no underline, per house style).
  summaryLink: { marginTop: 4 },
  // Active state — the "awaiting only" toggle is on; underline + '✕' signal it.
  summaryLinkActive: { textDecorationLine: 'underline' },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },

  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 120, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  // A selected folder chip.
  filterChipActive: { borderColor: colors.gold },

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
  prepOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  dropdownSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  dropdownTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  dropdownOptionText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  dropdownOptionTextActive: { color: colors.gold },
  dropdownOptionCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  dropdownCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  dropdownCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  confirmBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.surface, letterSpacing: 0.3 },
  chooserOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  chooserSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  chooserTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  chooserBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  chooserBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  chooserBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  chooserCancel: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: 4 },
  chooserCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },

  deletingText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
  // Hides the off-screen branded share card from the visible layout
  // while still keeping it mountable for react-native-view-shot to
  // snapshot. Matches the WineListShareCard pattern in scan/results.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
