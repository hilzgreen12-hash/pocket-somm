import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useScanHistory, type RestaurantVisit } from '../../src/hooks/useScanHistory';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { useAuth } from '../../src/hooks/useAuth';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { createManualRestaurantSession, discardEmptyVisit } from '../../src/api/restaurantSessions';
import { unlinkFromSession } from '../../src/api/chosenWines';
import { useAttachRestaurantPhoto, DISMISS_DELAY_MS } from '../../src/hooks/useAttachRestaurantPhoto';
import { LabelThumb } from '../../src/components/LabelThumb';
import { AddPhotoThumb } from '../../src/components/AddPhotoThumb';
import { LabelPhotoViewer } from '../../src/components/LabelPhotoViewer';
import { getCachedLabelUri } from '../../src/api/labelImageCache';
import { fetchAutoLabelUri } from '../../src/api/label';
import { useLabelStore } from '../../src/stores/labelStore';
import { EditChosenWineModal } from '../../src/components/EditChosenWineModal';
import { StarRating } from '../../src/components/StarRating';
import { showAlert } from '../../src/components/AppAlert';
import { useLibraryFilters } from '../../src/hooks/useLibraryFilters';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import type { LibraryFilter } from '../../src/api/libraryFilters';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { foldAccents } from '../../src/utils/wineIdentity';
import {
  UNNAMED_RESTAURANT, formatVisitDate, hasRestaurantReview, isRestaurantVisit, lineupForVisitHref, sessionsWithWines, visitStats,
} from '../../src/utils/restaurantReview';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { ChosenWine } from '../../src/types/wine';

function normName(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

type RatingFilter = 'all' | '5' | '4plus' | '3plus';
type FilterField = 'date' | 'rating' | null;

// Year-month key + label for the Month filter — one entry per month that has a
// visit, e.g. "June 2026".
function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// How a visit's review form came to be opened. 'link' = the ?openSession param
// (Review-tab carousel, or Back from a wine's review/intel); 'resume' = reopened
// after Find Online; 'list' = tapped on this screen.
type OpenedVia = 'link' | 'resume' | 'list';

export default function RestaurantReviewsScreen() {
  const { archive, archiveLoading, archiveError, refetchArchive, deleteVisit } = useScanHistory();
  const { chosenWines, remove } = useChosenWines();
  const attachRestaurantPhoto = useAttachRestaurantPhoto();
  const { session } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<RestaurantVisit | null>(null);
  // The restaurant "photo of the night" opened full-screen (zoomable viewer).
  const [viewerPhoto, setViewerPhoto] = useState<{ path: string; name: string } | null>(null);
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);
  // True when the wine edit was opened via "Edit Wine" (open the identity sheet
  // directly) rather than "Add/View Review" (open the review view).
  const [editWineIdentity, setEditWineIdentity] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');         // 'all' | 'YYYY-MM'
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [awaitingOpen, setAwaitingOpen] = useState(false);
  // Bespoke user-created filters (the "+ Add" chip), same as the Label Library.
  const { filters: customFilters, create: createFilter, setItems: setFilterItems, rename: renameFilter, remove: removeFilter } = useLibraryFilters('restaurant-review');
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<LibraryFilter | null>(null);
  const [savingFilter, setSavingFilter] = useState(false);

  // --- Opening a visit from outside this screen ---
  // ?openSession=<id> opens that visit's form once the archive has it. The
  // param is cleared once read, so a later Back to this screen carrying the
  // same id opens it again, and an unrelated refocus doesn't.
  const { openSession, add } = useLocalSearchParams<{ openSession?: string; add?: string }>();
  // Arrived straight into a visit (from the Review-tab carousel): closing that
  // visit returns there rather than leaving the user on this list.
  const enteredViaLinkRef = useRef(!!openSession);
  const leaveOnCloseRef = useRef(false);
  // The visit to reopen when this screen regains focus after Find Online.
  const resumeOnFocusRef = useRef<string | null>(null);
  const [pendingOpen, setPendingOpen] = useState<{ id: string; via: OpenedVia } | null>(null);

  useFocusEffect(useCallback(() => {
    const resumeId = resumeOnFocusRef.current;
    resumeOnFocusRef.current = null;
    if (resumeId) setPendingOpen({ id: resumeId, via: 'resume' });
    else if (openSession) setPendingOpen({ id: openSession, via: 'link' });
    if (openSession) router.setParams({ openSession: undefined });
  }, [openSession]));

  // Waits until the visit is in the archive (it may still be loading or
  // refetching after Find Online saved a photo).
  useEffect(() => {
    if (!pendingOpen) return;
    const item = archive.find((a) => a.id === pendingOpen.id);
    if (!item) return;
    setPendingOpen(null);
    openVisit(item, pendingOpen.via);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOpen, archive]);

  function openVisit(item: RestaurantVisit, via: OpenedVia) {
    if (via !== 'resume') leaveOnCloseRef.current = via === 'link' && enteredViaLinkRef.current;
    setEditing(item);
  }

  // --- "Add +": a visit added by hand ---
  // Creates a blank scan_sessions row and opens the same form on it. If the user
  // backs out without saving anything, closeRestaurantReview deletes it.
  const manualDraftIdRef = useRef<string | null>(null);
  const addingRef = useRef(false); // a ref, not state: guards a fast double-tap
  const [addingRestaurant, setAddingRestaurant] = useState(false);

  async function handleAddRestaurant() {
    if (!session?.user.id || addingRef.current) return;
    addingRef.current = true;
    setAddingRestaurant(true);
    try {
      const id = await createManualRestaurantSession(session.user.id);
      manualDraftIdRef.current = id;
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      openVisit({
        id,
        capturedAt: new Date().toISOString(),
        extractedWines: [],
        recommendation: null as any,
        city: null,
        restaurantName: null,
        restaurantNote: null,
        ratingFood: null,
        ratingService: null,
        ratingWineList: null,
        ratingOverall: null,
        ratingValue: null,
        ratingAtmosphere: null,
        ratingGlassware: null,
        isFavourite: false,
        restaurantPhotoPath: null,
      }, 'list');
    } catch (err) {
      showAlert({ title: 'Could not start a review', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      addingRef.current = false;
      setAddingRestaurant(false);
    }
  }

  // From the Review tab's "Add a restaurant review" (?add=1) — start a fresh
  // visit on arrival, once.
  const addTriggeredRef = useRef(false);
  useEffect(() => {
    if (add === '1' && session?.user.id && !addTriggeredRef.current) {
      addTriggeredRef.current = true;
      void handleAddRestaurant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [add, session]);

  // `editing` is a snapshot, so follow the archive for the photo: one added from
  // inside the form (camera / library) shows in its banner straight away.
  useEffect(() => {
    if (!editing) return;
    const fresh = archive.find((a) => a.id === editing.id);
    if (fresh && fresh.restaurantPhotoPath !== editing.restaurantPhotoPath) {
      setEditing((prev) => (prev ? { ...prev, restaurantPhotoPath: fresh.restaurantPhotoPath } : prev));
    }
  }, [archive, editing]);

  // Close the form. `pop` returns to the screen the user came from when they
  // arrived straight into this visit; pass false when another in-page modal
  // (Edit Wine) opens next — popping would unmount this screen under it.
  function closeRestaurantReview(pop = true) {
    const draftId = manualDraftIdRef.current;
    if (draftId && draftId === editing?.id) {
      manualDraftIdRef.current = null;
      void discardEmptyVisit(draftId)
        .then((deleted) => { if (deleted) qc.invalidateQueries({ queryKey: ['scan-archive'] }); })
        .catch(() => {});
    }
    setEditing(null);
    if (pop && leaveOnCloseRef.current) {
      leaveOnCloseRef.current = false;
      router.back();
    }
  }

  // Close the form for another screen and come back to this visit after —
  // used by Find Online and "+ Add a lineup", which can't show over the form's Modal.
  async function leaveFormAndResume(saveDraft: () => Promise<void>) {
    if (!editing) return;
    // The draft saves in the background so the next screen opens at once
    // (waiting on it left the screen doing nothing for a moment).
    const saving = saveDraft();
    resumeOnFocusRef.current = editing.id;
    setEditing(null);
    saving.catch((err) => showAlert({ title: 'Could not save your review', body: err instanceof Error ? err.message : 'Please try again.' }));
  }

  function handleLongPressRestaurant(item: RestaurantVisit) {
    showAlert({
      title: 'Delete this visit?',
      body: `${item.restaurantName?.trim() || UNNAMED_RESTAURANT}\n\nThis deletes the visit and its restaurant review. Wines from it stay in Your Wine Reviews.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteVisit.mutate(item.id, {
              onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
          },
        },
      ],
    });
  }

  // Two indexes:
  //  - chosenBySession: wines linked to a visit by scan_session_id (migration 032).
  //  - chosenByRestaurant: older wines with no link, matched to a visit by
  //    restaurant name (see fallbackForVisit).
  const { chosenBySession, chosenByRestaurant } = useMemo(() => {
    const bySession = new Map<string, ChosenWine[]>();
    const byRestaurant = new Map<string, ChosenWine[]>();
    for (const cw of chosenWines) {
      if (cw.scan_session_id) {
        const list = bySession.get(cw.scan_session_id) ?? [];
        list.push(cw);
        bySession.set(cw.scan_session_id, list);
      } else {
        const key = normName(cw.restaurant_name);
        if (!key) continue;
        const list = byRestaurant.get(key) ?? [];
        list.push(cw);
        byRestaurant.set(key, list);
      }
    }
    return { chosenBySession: bySession, chosenByRestaurant: byRestaurant };
  }, [chosenWines]);

  // Generate + show Wine Intel for a wine tapped in the visit form. Same
  // pattern as the Label Library: fill the label store and open the intel card.
  function viewWineIntel(cw: ChosenWine, returnToSession: string) {
    const details = {
      producer: cw.producer ?? '',
      region: cw.region ?? '',
      wineName: cw.wine_name || null,
      vintage: cw.vintage != null ? String(cw.vintage) : 'NV',
    };
    const ls = useLabelStore.getState();
    ls.reset();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ls.setWineDetailsConfirmed(details as any);
    ls.setIntelligence(null);
    ls.setImageUri(null);
    // Header image in the background: this wine's own label if it has one, else a
    // web label. Best-effort — title-only until it lands.
    void (async () => {
      try {
        // The disk-cached copy: instant when already seen, no fresh signed URL.
        let img = await getCachedLabelUri(cw.label_image_path);
        if (!img) img = await fetchAutoLabelUri(cw.producer, cw.wine_name);
        if (img) useLabelStore.getState().setImageUri(img);
      } catch { /* photoless */ }
    })();
    // gen=1: build intel on the results screen (instant shell). confirmed=1: known
    // wine, no "which wine?" prompt. noRecent=1: a review view isn't a scan.
    const backTo = encodeURIComponent(`/restaurants/reviews?openSession=${returnToSession}`);
    router.push(`/label/results?context=intel&confirmed=1&gen=1&noRecent=1&backTo=${backTo}` as any);
  }

  // "Delete Wine" on a visit. Taking it off the visit is the default; deleting
  // its review is offered separately because that removes it from Your Wine
  // Reviews as well.
  function confirmDeleteWine(cw: ChosenWine) {
    const onError = (err: unknown) => showAlert({ title: 'Could not remove', body: err instanceof Error ? err.message : 'Please try again.' });
    showAlert({
      title: 'Remove this wine?',
      body: `${wineHeaderLine(cw.producer, cw.wine_name, cw.vintage)}\n\nTake it off this visit and keep its review in Your Wine Reviews, or delete the wine review too.`,
      buttons: [
        {
          text: 'Remove from Visit',
          onPress: () => {
            unlinkFromSession(cw.id)
              .then(() => qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] }))
              .catch(onError);
          },
        },
        { text: 'Delete Review Too', style: 'destructive', onPress: () => remove.mutate(cw.id, { onError }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Unlinked (legacy) wines that belong to this visit — same restaurant name,
  // same city when both are known, and chosen within a day of the visit. No
  // "closest regardless of time" fallback: that pulled wines from a different
  // visit to the same restaurant into this one.
  function fallbackForVisit(item: RestaurantVisit): ChosenWine[] {
    const key = normName(item.restaurantName);
    if (!key) return [];
    const candidates = chosenByRestaurant.get(key) ?? [];
    if (candidates.length === 0) return [];

    const visitCity = normName(item.city);
    const sameCity = candidates.filter((c) => {
      const candKey = normName(c.city);
      return !candKey || !visitCity || candKey === visitCity;
    });
    const pool = sameCity.length > 0 ? sameCity : candidates;
    const visitTime = new Date(item.capturedAt).getTime();
    const DAY = 24 * 60 * 60 * 1000;
    return pool.filter((c) => Math.abs(new Date(c.chosen_at).getTime() - visitTime) <= DAY);
  }

  // A visit's wines: those linked to it plus any matching unlinked ones, in the
  // order they were drunk/added.
  function findChosenForVisit(item: RestaurantVisit): ChosenWine[] {
    const linked = chosenBySession.get(item.id) ?? [];
    const seen = new Set(linked.map((c) => c.id));
    const merged = [...linked];
    for (const c of fallbackForVisit(item)) {
      if (!seen.has(c.id)) { merged.push(c); seen.add(c.id); }
    }
    merged.sort((a, b) => new Date(a.chosen_at).getTime() - new Date(b.chosen_at).getTime());
    return merged;
  }

  const visits = useMemo(() => {
    const withWines = sessionsWithWines(chosenWines);
    return archive.filter((v) => isRestaurantVisit(v, withWines));
  }, [archive, chosenWines]);

  // Month options — one per month that has a visit, newest first.
  const availableMonths = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of visits) {
      const k = monthKey(item.capturedAt);
      if (!seen.has(k)) seen.set(k, item.capturedAt);
    }
    return Array.from(seen.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([value, iso]) => ({ value, label: monthLabel(iso) }));
  }, [visits]);

  const filtered = useMemo(() => {
    const q = foldAccents(search.trim());
    return visits.filter((item) => {
      if (dateFilter !== 'all' && monthKey(item.capturedAt) !== dateFilter) return false;
      // Free-text search across restaurant name, location and the visit's wines.
      if (q) {
        const nameHit = foldAccents(item.restaurantName ?? '').includes(q);
        const cityHit = foldAccents(item.city ?? '').includes(q);
        const wineHit = !nameHit && !cityHit && findChosenForVisit(item).some((cw) =>
          foldAccents(cw.wine_name ?? '').includes(q) || foldAccents(cw.producer ?? '').includes(q),
        );
        if (!nameHit && !cityHit && !wineHit) return false;
      }
      if (ratingFilter !== 'all') {
        const r = item.ratingOverall;
        if (r == null) return false;
        if (ratingFilter === '5' && r < 5) return false;
        if (ratingFilter === '4plus' && r < 4) return false;
        if (ratingFilter === '3plus' && r < 3) return false;
      }
      if (activeCustomId) {
        const f = customFilters.find((cf) => cf.id === activeCustomId);
        if (!(f?.itemIds ?? []).includes(item.id)) return false;
      }
      return true;
    });
    // findChosenForVisit reads the chosenWines-derived indexes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits, search, chosenWines, dateFilter, ratingFilter, activeCustomId, customFilters]);

  // Visits with no rating or note yet — the "Awaiting Review" link and its sheet.
  const awaitingRestaurants = useMemo(() => visits.filter((it) => !hasRestaurantReview(it)), [visits]);
  const stats = visitStats(filtered);

  // Always newest-first.
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
  }, [filtered]);

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
      body: 'Edit this filter’s name and restaurants, or delete it. Your reviews stay in the list either way.',
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
  // Items offered in the create/edit sheet — every visit, by name + date.
  const filterItems = useMemo(() => visits.map((item) => ({
    id: item.id,
    label: item.restaurantName?.trim() || UNNAMED_RESTAURANT,
    sublabel: [formatVisitDate(item.capturedAt), item.city].filter(Boolean).join(' · ') || undefined,
  })), [visits]);

  // Chip value labels.
  const dateChipLabel = dateFilter === 'all' ? 'All' : (availableMonths.find((m) => m.value === dateFilter)?.label ?? 'All');
  const ratingChipLabel = ratingFilter === 'all' ? 'Any' : ratingFilter === '5' ? '5★' : ratingFilter === '4plus' ? '4★+' : '3★+';

  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'date') return { title: 'Filter by month', options: [{ value: 'all', label: 'All' }, ...availableMonths], selected: dateFilter, onSelect: setDateFilter };
    if (field === 'rating') return {
      title: 'Filter by rating',
      options: [
        { value: 'all', label: 'Any rating' },
        { value: '3plus', label: '3★ and up' },
        { value: '4plus', label: '4★ and up' },
        { value: '5', label: '5★ only' },
      ],
      selected: ratingFilter,
      onSelect: (v) => setRatingFilter(v as RatingFilter),
    };
    return null;
  }
  const activeDropdown = dropdownConfig(openDropdown);

  // Wines in the open form, in display order (the modal refers to them by index).
  const editingWines = editing ? findChosenForVisit(editing) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Restaurant Reviews</Text>
        <TouchableOpacity onPress={handleAddRestaurant} disabled={addingRestaurant} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.addLink}>{addingRestaurant ? '…' : 'Add +'}</Text>
        </TouchableOpacity>
      </View>

      {archiveLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : archiveError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn&apos;t load your visits</Text>
          <Text style={styles.emptyBody}>Check your connection and try again. Your reviews are safe.</Text>
          <TouchableOpacity onPress={() => { void refetchArchive(); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
            <Text style={styles.addLink}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : visits.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No restaurants yet</Text>
          <Text style={styles.emptyBody}>Tap Add + to review a restaurant. After scanning a wine list, you can also name the restaurant on the results page and tap it — your visits appear here so you can capture the food, atmosphere and service.</Text>
        </View>
      ) : (
        <>
        {/* Header, stats, filters and search stay fixed; only the list scrolls. */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {stats.restaurants} {stats.restaurants === 1 ? 'Restaurant' : 'Restaurants'} · {stats.reviews} {stats.reviews === 1 ? 'Review' : 'Reviews'}
          </Text>
          <TouchableOpacity onPress={() => setAwaitingOpen(true)} disabled={awaitingRestaurants.length === 0} activeOpacity={0.7}>
            <Text style={[styles.summaryLink, awaitingRestaurants.length === 0 && { opacity: 0.5 }]}>View Restaurants Awaiting Review</Text>
          </TouchableOpacity>
        </View>
          <Text style={styles.filterHint}>Listed by recency · Swipe to see all filters →</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterChipRow}>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('date')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Month</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'date' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, dateFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{dateChipLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('rating')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Rating</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'rating' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, ratingFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{ratingChipLabel}</Text>
            </TouchableOpacity>
            {customFilters.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.customChip, activeCustomId === f.id && styles.customChipActive]}
                onPress={() => applyCustom(f.id)}
                onLongPress={() => openFilterOptions(f)}
                delayLongPress={400}
                activeOpacity={0.7}
              >
                {/* Capitalized "YOUR FOLDER" heading mirrors the built-in
                    chips' CITY / FAVOURITES label so bespoke folders read the
                    same way in the filter row. */}
                <View style={styles.filterChipHeadingRow}>
                  <Text style={styles.filterChipLabel}>Your Folder</Text>
                </View>
                <Text style={[styles.customChipText, activeCustomId === f.id && { color: colors.gold }]} numberOfLines={1}>{f.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.customChipAdd} onPress={openCreateFilter} activeOpacity={0.7}>
              <Text style={styles.customChipAddText}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Search across restaurant name, location and the bottle picks
              chosen on each visit. */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by City, Name, Bottles you drank…"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          {sorted.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyBody}>No visits match these filters. Try widening the date range or lowering the rating.</Text>
            </View>
          ) : (
            sorted.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.cardCompact}
                  onPress={() => openVisit(item, 'list')}
                  onLongPress={() => handleLongPressRestaurant(item)}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  {/* The whole tile opens the review on tap and offers Delete on
                      long-press. The photo on the left keeps its own actions:
                      tap to view it full-screen, long-press to change or
                      remove it. */}
                  <View style={styles.headerWithThumb}>
                    {item.restaurantPhotoPath ? (
                      <TouchableOpacity
                        onPress={() => setViewerPhoto({ path: item.restaurantPhotoPath!, name: item.restaurantName || 'Photo of the night' })}
                        onLongPress={() => attachRestaurantPhoto.present({ sessionId: item.id, restaurant: item.restaurantName, city: item.city, hasPhoto: true })}
                        delayLongPress={400}
                        activeOpacity={0.8}
                      >
                        <LabelThumb path={item.restaurantPhotoPath} fallbackText={item.restaurantName} size="thumb" style={styles.restaurantThumb} radius={5} frame={3} />
                      </TouchableOpacity>
                    ) : (
                      <AddPhotoThumb
                        style={styles.restaurantThumb}
                        radius={5}
                        onPress={() => attachRestaurantPhoto.present({ sessionId: item.id, restaurant: item.restaurantName, city: item.city })}
                      />
                    )}
                  <View style={styles.headerTextCol}>
                    <View style={styles.cardCompactRow}>
                      <Text style={styles.restaurantName} numberOfLines={1}>
                        {item.restaurantName?.trim() || UNNAMED_RESTAURANT}
                      </Text>
                    </View>
                    <View style={styles.cardCompactMetaRow}>
                      <Text style={styles.metaText}>{formatVisitDate(item.capturedAt)}</Text>
                      {item.city ? (
                        <Text style={styles.metaText} numberOfLines={1}> · {item.city}</Text>
                      ) : null}
                    </View>
                    {/* Overall star rating — sits below the date · location line. */}
                    {item.ratingOverall != null && (
                      <View style={styles.starRow}>
                        <StarRating value={item.ratingOverall} size={14} readonly />
                      </View>
                    )}
                    {/* Gold "Awaiting Review" for a visit with no rating or note
                        yet — mirrors Your Wine Reviews. */}
                    {!hasRestaurantReview(item) && (
                      <Text style={styles.awaitingReviewNote}>Awaiting Review</Text>
                    )}
                    {/* First line of the review, in place of the detailed rating grid. */}
                    {item.restaurantNote?.trim() ? (
                      <Text style={styles.reviewSnippet} numberOfLines={1} ellipsizeMode="tail">{item.restaurantNote.trim()}</Text>
                    ) : null}
                  </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
        </>
      )}

      {editing && (
        <RestaurantReviewModal
          visible
          sessionId={editing.id}
          initialName={editing.restaurantName}
          initialNote={editing.restaurantNote}
          initialRatings={{
            food: editing.ratingFood,
            service: editing.ratingService,
            wineList: editing.ratingWineList,
            overall: editing.ratingOverall,
            value: editing.ratingValue,
            atmosphere: editing.ratingAtmosphere,
            glassware: editing.ratingGlassware,
          }}
          initialFavourite={editing.isFavourite}
          city={editing.city}
          date={formatVisitDate(editing.capturedAt)}
          capturedAt={editing.capturedAt}
          restaurantPhotoPath={editing.restaurantPhotoPath}
          onViewPhoto={editing.restaurantPhotoPath ? () => setViewerPhoto({ path: editing.restaurantPhotoPath!, name: editing.restaurantName || 'Photo of the night' }) : undefined}
          onAddPhoto={(name, city, saveDraft) => attachRestaurantPhoto.present({
            sessionId: editing.id,
            restaurant: (name || editing.restaurantName) ?? null,
            city: (city || editing.city) ?? null,
            hasPhoto: !!editing.restaurantPhotoPath,
            leaveModal: () => leaveFormAndResume(saveDraft),
          })}
          onOpenLineup={async (lineupId, saveDraft) => {
            await leaveFormAndResume(saveDraft);
            setTimeout(() => router.push(`/cellar/lineup/${lineupId}` as any), DISMISS_DELAY_MS);
          }}
          onAddLineup={async (upload, name, city, saveDraft) => {
            const visit = editing;
            await leaveFormAndResume(saveDraft);
            setTimeout(() => router.push(lineupForVisitHref({
              sessionId: visit.id,
              venue: name || visit.restaurantName,
              city: city || visit.city,
              capturedAt: visit.capturedAt,
              upload,
            }) as any), DISMISS_DELAY_MS);
          }}
          wines={editingWines.map((cw) => ({
            producer: cw.producer,
            wineName: cw.wine_name,
            vintage: cw.vintage,
            userScore: cw.user_score,
            source: cw.source,
          }))}
          // Wine reviews live in Your Wine Reviews, never on this screen: open the
          // wine's review there, with Back returning to this visit (?openSession).
          // The push waits for the form's Modal to finish closing.
          onReviewWine={(i) => {
            const cw = editingWines[i];
            if (!cw) return;
            const backTo = encodeURIComponent(`/restaurants/reviews?openSession=${editing.id}`);
            setEditing(null);
            setTimeout(() => router.push(`/wines/chosen?openReview=${cw.id}&backTo=${backTo}` as any), DISMISS_DELAY_MS);
          }}
          onEditWine={(i) => {
            const cw = editingWines[i];
            if (!cw) return;
            closeRestaurantReview(false);
            setEditWineIdentity(true);
            setEditingWine(cw);
          }}
          onViewIntel={(i) => {
            const cw = editingWines[i];
            if (!cw) return;
            const visitId = editing.id;
            setEditing(null);
            setTimeout(() => viewWineIntel(cw, visitId), DISMISS_DELAY_MS);
          }}
          onDeleteWine={(i) => {
            const cw = editingWines[i];
            if (cw) confirmDeleteWine(cw);
          }}
          onClose={() => closeRestaurantReview()}
          onSaved={() => { manualDraftIdRef.current = null; closeRestaurantReview(); }}
        />
      )}

      <EditChosenWineModal
        // Live row (not the snapshot) so a label photo attached in the modal
        // shows immediately.
        wine={editingWine ? (chosenWines.find((w) => w.id === editingWine.id) ?? editingWine) : null}
        visible={editingWine !== null}
        initialIdentityEdit={editWineIdentity}
        onClose={() => { setEditingWine(null); setEditWineIdentity(false); }}
        onSaved={() => { setEditingWine(null); setEditWineIdentity(false); }}
      />

      <LibraryFilterModal
        visible={filterModalOpen}
        title={editingFilter ? 'Edit filter' : 'New filter'}
        itemNoun="restaurants"
        items={filterItems}
        initialName={editingFilter?.name}
        initialSelected={editingFilter?.itemIds}
        saving={savingFilter}
        onSave={saveFilter}
        onClose={() => { setFilterModalOpen(false); setEditingFilter(null); }}
      />

      {/* Filter dropdown — single sheet driven by openDropdown, matching the
          Full Cellar List / Your Wine Reviews interaction. */}
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

      {/* Visits awaiting review — opened from the summary link. Tap one to
          jump straight into its review. */}
      <Modal visible={awaitingOpen} transparent animationType="fade" onRequestClose={() => setAwaitingOpen(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setAwaitingOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.dropdownSheet} onPress={() => {}}>
            <Text style={styles.dropdownTitle}>Restaurants awaiting review</Text>
            {awaitingRestaurants.length === 0 ? (
              <Text style={styles.awaitingEmpty}>Nothing awaiting — you're all caught up.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 360 }}>
                {awaitingRestaurants.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.awaitingRow}
                    onPress={() => { setAwaitingOpen(false); openVisit(item, 'list'); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.awaitingName} numberOfLines={1}>{item.restaurantName?.trim() || UNNAMED_RESTAURANT}</Text>
                    <Text style={styles.awaitingMeta} numberOfLines={1}>{[formatVisitDate(item.capturedAt), item.city].filter(Boolean).join(' · ')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.dropdownCancel} onPress={() => setAwaitingOpen(false)}>
              <Text style={styles.dropdownCancelText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Full-screen, zoomable "photo of the night" viewer — pinch/double-tap to
          zoom, drag to pan, ✕ (top-right) to close. */}
      <LabelPhotoViewer
        visible={!!viewerPhoto}
        path={viewerPhoto?.path}
        fallbackText={viewerPhoto?.name}
        onClose={() => setViewerPhoto(null)}
        contain
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // The filters / search / review-bubble list scroll on a cream "page"; the
  // bubbles, chips and search bar keep their own terracotta fill (below) so
  // their interiors — and their white/gold text — are unchanged.
  scrollArea: { flex: 1 },

  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  addLink: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.gold, width: 50, textAlign: 'right' },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },

  // Review bubbles — the same brown as the carousel cards on other pages.
  cardCompact: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  cardCompactRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },

  cardCompactMetaRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  restaurantName: { flex: 1, fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  // Photo-of-the-night thumbnail + header, side by side.
  headerWithThumb: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerTextCol: { flex: 1 },
  // Larger portrait thumbnail, matching Your Wine Reviews (100×130).
  restaurantThumb: { width: 100, height: 130 },
  // First line of the review, shown in place of the rating grid.
  reviewSnippet: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, marginTop: 6 },
  // Overall stars moved beneath the date · location line.
  starRow: { marginTop: 6, flexDirection: 'row' },
  metaText: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },

  // Black on the cream scroll page (was muted white on terracotta).
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterChipRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 120, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  // Bespoke user-created filter chips (the "+ Add" row) — same look as the
  // Label Library.
  customChip: { height: 56, justifyContent: 'center', alignItems: 'flex-start', borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, minWidth: 110, maxWidth: 180, overflow: 'hidden' },
  customChipActive: { borderColor: colors.gold },
  customChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  customChipAdd: { height: 56, justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.md },
  customChipAddText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  filterChipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  filterChipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  filterChipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  dropdownSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  dropdownTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  dropdownOptionText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  dropdownOptionTextActive: { color: colors.gold },
  dropdownOptionCheck: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold },
  dropdownCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  dropdownCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // "Restaurants awaiting review" list rows.
  awaitingEmpty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
  awaitingRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Yellow "Awaiting Review" note on an un-reviewed restaurant entry — matches
  // reviewStatsLine on Your Wine Reviews.
  awaitingReviewNote: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.gold, marginTop: 3 },
  awaitingName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  awaitingMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },

  // Search bar — mirrors Your Wine Reviews: a light input, not a dark filled row.
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.xs, marginBottom: spacing.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { fontSize: 15, color: colors.textMuted, paddingLeft: spacing.sm },
  // Gold summary bar (mirrors Your Wine Reviews).
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  summaryLink: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
});
