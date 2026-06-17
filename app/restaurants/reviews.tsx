import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share, Modal, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useScanHistory } from '../../src/hooks/useScanHistory';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { useAuth } from '../../src/hooks/useAuth';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { EditChosenWineModal } from '../../src/components/EditChosenWineModal';
import { StarRating } from '../../src/components/StarRating';
import { ShareIcon } from '../../src/components/ShareIcon';
import { RestaurantReviewShareCard } from '../../src/components/RestaurantReviewShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { showAlert } from '../../src/components/AppAlert';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { normaliseCity } from '../../src/utils/city';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { ScanArchiveItem } from '../../src/hooks/useScanHistory';
import type { ChosenWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function normName(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

type RatingFilter = 'all' | '5' | '4plus' | '3plus';
// 'toreview' = a restaurant added from a List result that has no ratings or
// note yet; 'reviewed' = it carries review content.
type ReviewStatusFilter = 'all' | 'toreview' | 'reviewed';
type FilterField = 'date' | 'review' | 'location' | 'rating' | null;

// Year-month key + label for the Date filter — one entry per month that
// has a review, e.g. "June 2026".
function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
// A bottle pick counts as "reviewed" once it carries any review content.
function chosenHasReview(w: ChosenWine): boolean {
  return !!(
    (w.tasting_note && w.tasting_note.trim()) ||
    (w.other_observations && w.other_observations.trim()) ||
    w.user_score != null
  );
}

export default function RestaurantReviewsScreen() {
  const { archive, archiveLoading, removeArchiveItem } = useScanHistory();

  // Off-screen branded share card — mirrors the WineListShareCard +
  // WineReviewShareCard pattern so all three Vinster surfaces share
  // one visual language when posted into a chat thread. Only mounted
  // during a share so it doesn't sit idle in the tree.
  const restaurantShareRef = useRef<View>(null);
  const [restaurantSharing, setRestaurantSharing] = useState(false);
  const [restaurantSharePayload, setRestaurantSharePayload] = useState<{
    restaurantName: string;
    city: string | null;
    date: string | null;
    ratingOverall: number | null;
    ratingFood: number | null;
    ratingService: number | null;
    ratingWineList: number | null;
    ratingValue: number | null;
    note: string | null;
    wines: Array<{ producer: string | null; wineName: string; vintage: string | number | null; userScore: number | null }>;
  } | null>(null);

  // Render a single rating as a "★★★★☆ (4/5)" plain-text line for the
  // share text body. Returns null when the rating is missing. Used by
  // the plain-text fallback share only — the branded card builds its
  // own star rows.
  function ratingLine(label: string, value: number | null): string | null {
    if (value == null) return null;
    const stars = '★'.repeat(value) + '☆'.repeat(5 - value);
    return `${label}: ${stars} (${value}/5)`;
  }

  // Hand a restaurant visit to the native share sheet as a branded
  // PNG capture. Mirrors the WineListShareCard / WineReviewShareCard
  // flow. Falls back to the previous plain-text share if capture or
  // expo-sharing isn't available on the device.
  async function handleShareRestaurant(item: ScanArchiveItem) {
    if (restaurantSharing) return;
    const restaurant = item.restaurantName?.trim() || 'Restaurant visit';
    const date = formatDate(item.capturedAt);
    const chosen = findChosenForVisit(item);
    const winesForCard = chosen.map((cw) => ({
      producer: cw.producer,
      wineName: cw.wine_name,
      vintage: cw.vintage,
      userScore: cw.user_score,
    }));

    setRestaurantSharePayload({
      restaurantName: restaurant,
      city: item.city?.trim() || null,
      date,
      ratingOverall: item.ratingOverall,
      ratingFood: item.ratingFood,
      ratingService: item.ratingService,
      ratingWineList: item.ratingWineList,
      ratingValue: item.ratingValue,
      note: item.restaurantNote?.trim() || null,
      wines: winesForCard,
    });
    setRestaurantSharing(true);

    try {
      // One paint to mount the off-screen card with the new props
      // before the snapshot.
      await new Promise((r) => setTimeout(r, 250));
      if (restaurantShareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(restaurantShareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Share ${restaurant}`,
          UTI: 'public.png',
        });
        return;
      }

      // Plain-text fallback — preserves the previous behaviour for
      // devices where capture / expo-sharing isn't available.
      const header = item.city?.trim() ? `${restaurant} · ${item.city.trim()}` : restaurant;
      const ratings = [
        ratingLine('Overall',  item.ratingOverall),
        ratingLine('Food',     item.ratingFood),
        ratingLine('Wine list', item.ratingWineList),
        ratingLine('Service',  item.ratingService),
        ratingLine('Value',    item.ratingValue),
      ].filter(Boolean).join('\n');
      const note = item.restaurantNote?.trim()
        ? `\n\n"${item.restaurantNote.trim()}"`
        : '';
      const winesBlock = chosen.length === 0
        ? ''
        : '\n\nWines I had:\n' + chosen.map((cw) => {
            const wineLine = [cw.producer, cw.wine_name, cw.vintage]
              .filter((x) => x != null && String(x).trim().length > 0)
              .join(' · ');
            const score = cw.user_score != null ? ` (${cw.user_score}/100)` : '';
            return `· ${wineLine}${score}`;
          }).join('\n');
      const message =
        `${header}\n${date}` +
        (ratings ? `\n\n${ratings}` : '') +
        note +
        winesBlock +
        VINSTER_TEXT_SHARE_FOOTER;
      await Share.share({ message, title: restaurant });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setRestaurantSharing(false);
      setRestaurantSharePayload(null);
    }
  }

  function handleLongPressRestaurant(item: ScanArchiveItem) {
    const label = item.restaurantName?.trim() || 'this restaurant';
    showAlert({
      title: 'Remove from Your Restaurants?',
      body: `${label}\n\nThis permanently deletes the scan and its restaurant review.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeArchiveItem.mutate(item.id, {
              onError: (err) => showAlert({ title: 'Could not remove', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
          },
        },
      ],
    });
  }
  const { chosenWines } = useChosenWines();
  const { session } = useAuth();
  const [editing, setEditing] = useState<ScanArchiveItem | null>(null);
  // True when the review form was auto-opened via the ?openSession deep link
  // (i.e. from the List results page) — closing then returns the user there.
  const [editingFromLink, setEditingFromLink] = useState(false);
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');         // 'all' | 'YYYY-MM'
  const [reviewStatusFilter, setReviewStatusFilter] = useState<ReviewStatusFilter>('all');
  const [locationFilter, setLocationFilter] = useState<string>('All'); // 'All' | city | 'Unrecorded'
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [bottlePicksOpen, setBottlePicksOpen] = useState(false);

  // Deep-link from the List results page (?openSession=<id>) — auto-open
  // that visit's review form once the archive has loaded, so the user lands
  // on the input rather than the bare list. Only fires once.
  const { openSession } = useLocalSearchParams<{ openSession?: string }>();
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (autoOpenedRef.current || !openSession) return;
    const item = archive.find((a) => a.id === openSession);
    if (item) {
      setEditing(item);
      setEditingFromLink(true);
      autoOpenedRef.current = true;
    }
  }, [openSession, archive]);

  // Close the restaurant review form, returning to the origin screen: if it
  // was opened from the List results page (deep link), pop back there;
  // otherwise just dismiss and stay on the Your Restaurants list.
  function closeRestaurantReview() {
    setEditing(null);
    if (editingFromLink) {
      setEditingFromLink(false);
      router.back();
    }
  }

  // Two indexes:
  //  - chosenBySession: precise FK lookup for wines saved after migration
  //    032 — multiple wines per session land here together.
  //  - chosenByRestaurant: fallback for legacy rows with scan_session_id
  //    null (pre-migration saves, or wines added manually).
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

  function findChosenForVisit(item: ScanArchiveItem): ChosenWine[] {
    // Prefer the precise FK lookup if any wines were saved with this
    // session_id. Skips the fuzzy fallback entirely in that case.
    const linked = chosenBySession.get(item.id);
    if (linked && linked.length > 0) return linked;

    const key = normName(item.restaurantName);
    if (!key) return [];
    const candidates = chosenByRestaurant.get(key) ?? [];
    if (candidates.length === 0) return [];

    const visitCity = normName(item.city);
    const sameCity = candidates.filter((c) => {
      const cityKey = normName(c.city);
      return !cityKey || !visitCity || cityKey === visitCity;
    });
    const pool = sameCity.length > 0 ? sameCity : candidates;
    const visitTime = new Date(item.capturedAt).getTime();
    let closest: ChosenWine | null = null;
    let closestDelta = Infinity;
    for (const c of pool) {
      const t = new Date(c.chosen_at).getTime();
      const delta = Math.abs(t - visitTime);
      if (delta < closestDelta) {
        closestDelta = delta;
        closest = c;
      }
    }
    return closest ? [closest] : [];
  }

  const reviewed = archive.filter((a) => (a.restaurantName && a.restaurantName.trim()) || (a.restaurantNote && a.restaurantNote.trim()));

  // Date options — one per month that has a review, newest first.
  const availableMonths = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of reviewed) {
      const k = monthKey(item.capturedAt);
      if (!seen.has(k)) seen.set(k, item.capturedAt);
    }
    return Array.from(seen.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([value, iso]) => ({ value, label: monthLabel(iso) }));
  }, [reviewed]);

  // Location options — every city visited, plus an "Unrecorded" bucket when
  // any visit has no city recorded.
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    let hasUnrecorded = false;
    for (const item of reviewed) {
      const c = normaliseCity(item.city);
      if (c) set.add(c); else hasUnrecorded = true;
    }
    return { cities: Array.from(set).sort((a, b) => a.localeCompare(b)), hasUnrecorded };
  }, [reviewed]);

  // A restaurant counts as reviewed once it carries any rating or a note.
  // Otherwise it's "to review" — a name captured from a List result, awaiting
  // the user's actual review.
  const restaurantReviewed = (item: typeof reviewed[number]) => !!(
    item.ratingOverall != null || item.ratingFood != null || item.ratingService != null ||
    item.ratingWineList != null || item.ratingValue != null ||
    (item.restaurantNote && item.restaurantNote.trim())
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviewed.filter((item) => {
      if (dateFilter !== 'all' && monthKey(item.capturedAt) !== dateFilter) return false;
      if (reviewStatusFilter === 'toreview' && restaurantReviewed(item)) return false;
      if (reviewStatusFilter === 'reviewed' && !restaurantReviewed(item)) return false;
      // Free-text search across restaurant name, location, and the wines
      // (bottle picks) chosen on that visit.
      if (q) {
        const nameHit = (item.restaurantName ?? '').toLowerCase().includes(q);
        const cityHit = (item.city ?? '').toLowerCase().includes(q);
        const pickHit = chosenWines.some((cw) =>
          cw.scan_session_id === item.id && (
            (cw.wine_name ?? '').toLowerCase().includes(q) ||
            (cw.producer ?? '').toLowerCase().includes(q)
          )
        );
        if (!nameHit && !cityHit && !pickHit) return false;
      }
      if (locationFilter !== 'All') {
        const c = normaliseCity(item.city);
        if (locationFilter === 'Unrecorded') { if (c) return false; }
        else if (c !== locationFilter) return false;
      }
      if (ratingFilter !== 'all') {
        const r = item.ratingOverall;
        if (r == null) return false;
        if (ratingFilter === '5' && r < 5) return false;
        if (ratingFilter === '4plus' && r < 4) return false;
        if (ratingFilter === '3plus' && r < 3) return false;
      }
      return true;
    });
  }, [reviewed, search, chosenWines, dateFilter, reviewStatusFilter, locationFilter, ratingFilter]);

  // Always newest-first.
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
  }, [filtered]);

  // Every bottle pick the user has added (restaurant-context chosen_wines —
  // not the "review without adding" path), newest first.
  const bottlePicks = useMemo(() => {
    return chosenWines
      .filter((cw) => cw.source !== 'other')
      .slice()
      .sort((a, b) => new Date(b.chosen_at).getTime() - new Date(a.chosen_at).getTime());
  }, [chosenWines]);

  // Chip value labels.
  const dateChipLabel = dateFilter === 'all' ? 'All' : (availableMonths.find((m) => m.value === dateFilter)?.label ?? 'All');
  const reviewChipLabel = reviewStatusFilter === 'all' ? 'All' : reviewStatusFilter === 'toreview' ? 'To review' : 'Reviewed';
  const locationChipLabel = locationFilter === 'All' ? 'All' : locationFilter;
  const ratingChipLabel = ratingFilter === 'all' ? 'Any' : ratingFilter === '5' ? '5★' : ratingFilter === '4plus' ? '4★+' : '3★+';

  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'date') return { title: 'Filter by month', options: [{ value: 'all', label: 'All' }, ...availableMonths], selected: dateFilter, onSelect: setDateFilter };
    if (field === 'review') return {
      title: 'Review status',
      options: [
        { value: 'all', label: 'All' },
        { value: 'toreview', label: 'To review' },
        { value: 'reviewed', label: 'Reviewed' },
      ],
      selected: reviewStatusFilter,
      onSelect: (v) => setReviewStatusFilter(v as ReviewStatusFilter),
    };
    if (field === 'location') {
      const opts = [
        { value: 'All', label: 'All locations' },
        ...availableLocations.cities.map((c) => ({ value: c, label: c })),
        ...(availableLocations.hasUnrecorded ? [{ value: 'Unrecorded', label: 'Unrecorded' }] : []),
      ];
      return { title: 'Filter by location', options: opts, selected: locationFilter, onSelect: setLocationFilter };
    }
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

  // Tap a bottle pick → go to the restaurant where it was picked (its review
  // modal offers "Review this wine →"). Falls back to the wine's own review
  // when the pick isn't tied to a restaurant visit.
  function openBottlePick(cw: ChosenWine) {
    setBottlePicksOpen(false);
    const visit = cw.scan_session_id ? archive.find((a) => a.id === cw.scan_session_id) : null;
    if (visit) { setEditing(visit); setEditingFromLink(false); }
    else { setEditingWine(cw); }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Restaurants</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sign in to view your restaurants</Text>
          <Text style={styles.emptyBody}>Your restaurant visits are saved with your account.</Text>
        </View>
      ) : archiveLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : (reviewed.length === 0 && bottlePicks.length === 0) ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No restaurants yet</Text>
          <Text style={styles.emptyBody}>After scanning a wine list, add the restaurant name on the results page and tap "Review this restaurant" — your visits will appear here so you can capture the food, atmosphere and service.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.filterHint}>Listed by recency · Swipe to see all filters →</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterChipRow}>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('date')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Date</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'date' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, dateFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{dateChipLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('review')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Review Status</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'review' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, reviewStatusFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{reviewChipLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('rating')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Rating</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'rating' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, ratingFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{ratingChipLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('location')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Location</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'location' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, locationFilter !== 'All' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{locationChipLabel}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Search across restaurant name, location and the bottle picks
              chosen on each visit. */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by Bottle Pick, Name, Location…"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {sorted.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyBody}>No visits match these filters. Try widening the date range or lowering the rating.</Text>
            </View>
          ) : (
            sorted.map((item) => {
              const chosen = findChosenForVisit(item);
              const hasAnyRating = item.ratingFood != null || item.ratingService != null || item.ratingWineList != null || item.ratingOverall != null || item.ratingValue != null;
              return (
                <View key={item.id} style={styles.cardCompact}>
                  {/* Restaurant header — tap to edit the restaurant review.
                      Wines below have their own tap targets so the user can
                      jump straight into a wine review. */}
                  <TouchableOpacity
                    onPress={() => { setEditing(item); setEditingFromLink(false); }}
                    onLongPress={() => handleLongPressRestaurant(item)}
                    delayLongPress={400}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardCompactRow}>
                      <Text style={styles.restaurantName} numberOfLines={1}>
                        {item.restaurantName || 'Unnamed restaurant'}
                      </Text>
                      <View style={styles.rightCluster}>
                        {item.ratingOverall != null && (
                          <StarRating value={item.ratingOverall} size={14} readonly />
                        )}
                      </View>
                    </View>
                    <View style={styles.cardCompactMetaRow}>
                      <Text style={styles.metaText}>{formatDate(item.capturedAt)}</Text>
                      {item.city ? (
                        <Text style={styles.metaText} numberOfLines={1}> · {item.city}</Text>
                      ) : null}
                    </View>
                    {hasAnyRating && (
                      <View style={styles.ratingGrid}>
                        {item.ratingFood != null && (
                          <View style={styles.ratingCell}>
                            <Text style={styles.ratingCellLabel}>Food</Text>
                            <StarRating value={item.ratingFood} size={11} readonly />
                          </View>
                        )}
                        {item.ratingService != null && (
                          <View style={styles.ratingCell}>
                            <Text style={styles.ratingCellLabel}>Service</Text>
                            <StarRating value={item.ratingService} size={11} readonly />
                          </View>
                        )}
                        {item.ratingWineList != null && (
                          <View style={styles.ratingCell}>
                            <Text style={styles.ratingCellLabel}>Wine list</Text>
                            <StarRating value={item.ratingWineList} size={11} readonly />
                          </View>
                        )}
                        {item.ratingValue != null && (
                          <View style={styles.ratingCell}>
                            <Text style={styles.ratingCellLabel}>Value</Text>
                            <StarRating value={item.ratingValue} size={11} readonly />
                          </View>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>

                  {chosen.length > 0 ? (
                    <View style={styles.wineList}>
                      {chosen.map((cw) => {
                        const wineLine = [cw.producer, cw.wine_name, cw.vintage]
                          .filter((x) => x != null && String(x).trim().length > 0)
                          .join(' · ');
                        return (
                          <TouchableOpacity
                            key={cw.id}
                            style={styles.wineRow}
                            onPress={() => setEditingWine(cw)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.wineLine} numberOfLines={1}>Bottle Pick: {wineLine}</Text>
                            {cw.user_score != null ? (
                              <Text style={styles.wineScore}>{cw.user_score}/100</Text>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
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
          }}
          initialFavourite={editing.isFavourite}
          city={editing.city}
          date={formatDate(editing.capturedAt)}
          wines={findChosenForVisit(editing).map((cw) => ({
            producer: cw.producer,
            wineName: cw.wine_name,
            vintage: cw.vintage,
            userScore: cw.user_score,
          }))}
          onReviewWine={(i) => {
            const cw = findChosenForVisit(editing)[i];
            if (cw) { closeRestaurantReview(); setEditingWine(cw); }
          }}
          onClose={closeRestaurantReview}
          onSaved={closeRestaurantReview}
        />
      )}

      <EditChosenWineModal
        wine={editingWine}
        visible={editingWine !== null}
        onClose={() => setEditingWine(null)}
        onSaved={() => setEditingWine(null)}
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

      {/* Off-screen branded share card. Mounted only during a share
          so layout work doesn't sit idle when nothing is queued. */}
      {restaurantSharePayload && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <RestaurantReviewShareCard
            ref={restaurantShareRef}
            restaurantName={restaurantSharePayload.restaurantName}
            city={restaurantSharePayload.city}
            date={restaurantSharePayload.date}
            ratingOverall={restaurantSharePayload.ratingOverall}
            ratingFood={restaurantSharePayload.ratingFood}
            ratingService={restaurantSharePayload.ratingService}
            ratingWineList={restaurantSharePayload.ratingWineList}
            ratingValue={restaurantSharePayload.ratingValue}
            note={restaurantSharePayload.note}
            wines={restaurantSharePayload.wines}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  // Hides the off-screen branded share card from the visible layout
  // while still mounting it so react-native-view-shot can snapshot.
  // Matches the WineListShareCard / WineReviewShareCard pattern. No
  // opacity:0 — on Android that degrades the rasterised PNG, so the card
  // is hidden by off-screen position alone.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0 },
  cardCompact: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cardCompactRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  // Star rating sits above the share icon on the right of each card.
  rightCluster: { alignItems: 'flex-end', gap: spacing.xs },
  cardCompactMetaRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  restaurantName: { flex: 1, fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  metaText: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  notePreview: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  ratingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  ratingCell: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingCellLabel: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  wineList: { marginTop: spacing.xs, gap: 2 },
  wineRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingVertical: 4 },
  // Wine name italics inside a restaurant card — wine reference, treat as caption.
  wineLine: { flex: 1, fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold },
  wineScore: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, marginLeft: spacing.sm },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterChipRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 120, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
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
  sectionDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.xs },
  // Search bar beneath the filter chips.
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text },
  searchClear: { fontSize: 15, color: colors.textMuted, paddingLeft: spacing.sm },
  bottlePicksLinkRow: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs },
  bottlePicksLink: { fontFamily: fonts.headingBold, fontSize: 19, color: colors.gold, letterSpacing: 0.5 },
  bottlePicksList: { marginHorizontal: spacing.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md },
  bottlePicksEmpty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, paddingVertical: spacing.md, textAlign: 'center' },
  pickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  pickRowMain: { flex: 1 },
  pickWine: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  pickMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pickStatusCol: { alignItems: 'flex-end', minWidth: 64 },
  pickStatus: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  pickStatusDone: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.4 },
  pickStatusDate: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  personalityButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.md, backgroundColor: 'rgba(212,176,96,0.08)' },
  personalityButtonText: { fontFamily: fonts.headingBold, fontSize: 15, color: colors.gold, letterSpacing: 0.5 },
});
