import { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { router } from 'expo-router';
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

type DateFilter = 'all' | '30d' | 'year';
type RatingFilter = 'all' | '5' | '4plus' | '3plus';

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
        ratingLine('Service',  item.ratingService),
        ratingLine('Wine list', item.ratingWineList),
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
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');

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

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff30d = now - 30 * 24 * 60 * 60 * 1000;
    const cutoffYear = now - 365 * 24 * 60 * 60 * 1000;
    return reviewed.filter((item) => {
      if (dateFilter !== 'all') {
        const t = new Date(item.capturedAt).getTime();
        if (dateFilter === '30d' && t < cutoff30d) return false;
        if (dateFilter === 'year' && t < cutoffYear) return false;
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
  }, [reviewed, dateFilter, ratingFilter]);

  // Always sort newest-first. The previous "Top rated" sort is now handled
  // by the rating filter (which removes lower-rated visits entirely).
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
  }, [filtered]);

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
      ) : reviewed.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No restaurants yet</Text>
          <Text style={styles.emptyBody}>After scanning a wine list, add the restaurant name on the results page and tap "Review this restaurant" — your visits will appear here so you can capture the food, atmosphere and service.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Date</Text>
            <TouchableOpacity
              style={[styles.filterChip, dateFilter === 'all' && styles.filterChipActive]}
              onPress={() => setDateFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, dateFilter === 'all' && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, dateFilter === '30d' && styles.filterChipActive]}
              onPress={() => setDateFilter('30d')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, dateFilter === '30d' && styles.filterChipTextActive]}>Last 30 days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, dateFilter === 'year' && styles.filterChipActive]}
              onPress={() => setDateFilter('year')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, dateFilter === 'year' && styles.filterChipTextActive]}>This year</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Rating</Text>
            <TouchableOpacity
              style={[styles.filterChip, ratingFilter === 'all' && styles.filterChipActive]}
              onPress={() => setRatingFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, ratingFilter === 'all' && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, ratingFilter === '3plus' && styles.filterChipActive]}
              onPress={() => setRatingFilter('3plus')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, ratingFilter === '3plus' && styles.filterChipTextActive]}>3★+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, ratingFilter === '4plus' && styles.filterChipActive]}
              onPress={() => setRatingFilter('4plus')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, ratingFilter === '4plus' && styles.filterChipTextActive]}>4★+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, ratingFilter === '5' && styles.filterChipActive]}
              onPress={() => setRatingFilter('5')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, ratingFilter === '5' && styles.filterChipTextActive]}>5★</Text>
            </TouchableOpacity>
          </View>
          {sorted.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyBody}>No visits match these filters. Try widening the date range or lowering the rating.</Text>
            </View>
          ) : (
            sorted.map((item) => {
              const chosen = findChosenForVisit(item);
              const hasAnyRating = item.ratingFood != null || item.ratingService != null || item.ratingWineList != null || item.ratingOverall != null;
              return (
                <View key={item.id} style={styles.cardCompact}>
                  {/* Restaurant header — tap to edit the restaurant review.
                      Wines below have their own tap targets so the user can
                      jump straight into a wine review. */}
                  <TouchableOpacity
                    onPress={() => setEditing(item)}
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
          }}
          city={editing.city}
          date={formatDate(editing.capturedAt)}
          wines={findChosenForVisit(editing).map((cw) => ({
            producer: cw.producer,
            wineName: cw.wine_name,
            vintage: cw.vintage,
            userScore: cw.user_score,
          }))}
          onClose={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      )}

      <EditChosenWineModal
        wine={editingWine}
        visible={editingWine !== null}
        onClose={() => setEditingWine(null)}
        onSaved={() => setEditingWine(null)}
      />

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
  // Matches the WineListShareCard / WineReviewShareCard pattern.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
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
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  filterLabel: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 6, minWidth: 50 },
  filterChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 14, paddingVertical: 3, paddingHorizontal: spacing.sm },
  filterChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  filterChipText: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  filterChipTextActive: { color: colors.gold },
  personalityButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.md, backgroundColor: 'rgba(212,176,96,0.08)' },
  personalityButtonText: { fontFamily: fonts.headingBold, fontSize: 15, color: colors.gold, letterSpacing: 0.5 },
});
