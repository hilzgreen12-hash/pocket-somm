import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useChosenWines, useWineReviewCards } from '../hooks/useChosenWines';
import { useScanHistory } from '../hooks/useScanHistory';
import { UNNAMED_RESTAURANT, formatVisitDate, isRestaurantVisit, sessionsWithWines, visitStats } from '../utils/restaurantReview';
import { LabelThumb } from './LabelThumb';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard, placeholderLabelImages, RESTAURANT_IMG } from './ExamplePlaceholder';
import { reviewTotals, type UnifiedReview } from '../utils/reviewModel';
import { drinkingDateTime } from '../utils/cellarReview';
import { HOME_TILE, colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Review tab carousels: the latest Wine Reviews and Restaurant Reviews (up to 8
// each), newest first. Read-only views of the same records the full pages list;
// tapping a card opens it there, and "View All" opens the full page.
const MAX = 8;

const fmtDay = (date: string | null | undefined) => {
  const t = drinkingDateTime(date);
  return t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};

// The newest wine review cards, and the same totals Your Wine Reviews shows.
function useWineReviewItems() {
  const { cards, isLoading } = useWineReviewCards();
  const newest = [...cards].sort((a, b) => drinkingDateTime(b.latestDate) - drinkingDateTime(a.latestDate));
  return { items: newest.slice(0, MAX), loading: isLoading, ...reviewTotals(cards) };
}

// Open a card on Your Wine Reviews; its Back returns here to the Review tab.
function openWineReview(card: UnifiedReview) {
  const backTo = `&backTo=${encodeURIComponent('/(tabs)/scan')}`;
  const row = card.chosenRows[0];
  router.push((row
    ? `/wines/chosen?openReview=${row.id}${backTo}`
    : `/wines/chosen?openCellarReview=${card.cellarWines[0].id}${backTo}`) as any);
}

const WINE_EXAMPLES: PlaceholderCard[] = [
  { kind: 'labelCollage', images: placeholderLabelImages(0, 1), title: 'Your Wine Review', stamp: '20 Dec 2029 · 94 pts', overlay: 'Your wine reviews appear here as you use Vinster' },
  { kind: 'labelCollage', images: placeholderLabelImages(1, 1), title: 'Your Wine Review', stamp: '12 Dec 2029 · 92 pts', overlay: 'Your wine reviews appear here as you use Vinster' },
];
const RESTAURANT_EXAMPLES: PlaceholderCard[] = [
  { kind: 'image', uri: RESTAURANT_IMG, title: 'Your Restaurant Review', stamp: '18 Dec 2029 · London', overlay: 'Your restaurant reviews appear here as you use Vinster' },
];

// Gold stats bar under each Review-tab carousel title — mirrors Your Cookbook's.
export function ReviewStatsBar({ text, onViewAll }: { text: string; onViewAll: () => void }) {
  return (
    <>
      <TouchableOpacity style={styles.statsRow} onPress={onViewAll} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Text style={styles.statsText}>{text} · View All →</Text>
      </TouchableOpacity>
      <View style={styles.statsSep} />
    </>
  );
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function WineReviewsCarousel({ onViewAll }: { onViewAll: () => void }) {
  const { items, loading, wines, reviews } = useWineReviewItems();
  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>;
  return (
    <>
    <ReviewStatsBar text={`${plural(wines, 'Wine', 'Wines')} · ${plural(reviews, 'Review', 'Reviews')}`} onViewAll={onViewAll} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {items.map((card) => (
        <TouchableOpacity key={card.key} style={styles.card} onPress={() => openWineReview(card)} activeOpacity={0.85}>
          <View style={styles.imageWrap}>
            {card.photoPath
              ? <LabelThumb path={card.photoPath} fallbackText={card.wineName ?? card.producer ?? ''} style={styles.image} radius={0} frame={0} />
              : <WineCardThumb producer={card.producer} wineName={card.wineName} fallbackText={card.wineName ?? card.producer ?? ''} style={styles.image} />}
          </View>
          <Text style={styles.name} numberOfLines={2} allowFontScaling={false}>
            {[card.producer, card.wineName && card.wineName !== card.producer ? card.wineName : null, card.vintage].filter(Boolean).join(' ')}
          </Text>
          {/* Same average score as the card on Your Wine Reviews. */}
          <Text style={styles.stamp} numberOfLines={1} allowFontScaling={false}>{[fmtDay(card.latestDate), card.averageScore != null ? `${card.averageScore} pts` : null].filter(Boolean).join(' · ')}</Text>
        </TouchableOpacity>
      ))}
      {items.length === 0 ? WINE_EXAMPLES.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />) : null}
    </ScrollView>
    </>
  );
}

export function RestaurantReviewsCarousel({ onViewAll }: { onViewAll: () => void }) {
  const { archive, archiveLoading } = useScanHistory();
  const { chosenWines } = useChosenWines();
  if (archiveLoading) return <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>;
  // The same visits and counts as Your Restaurant Reviews.
  const withWines = sessionsWithWines(chosenWines);
  const all = archive
    .filter((a) => isRestaurantVisit(a, withWines))
    .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
  const items = all.slice(0, MAX);
  const stats = visitStats(all);
  return (
    <>
    <ReviewStatsBar text={`${plural(stats.restaurants, 'Restaurant', 'Restaurants')} · ${plural(stats.reviews, 'Review', 'Reviews')}`} onViewAll={onViewAll} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {items.map((a) => (
        <TouchableOpacity key={a.id} style={styles.card} onPress={() => router.push(`/restaurants/reviews?openSession=${a.id}` as any)} activeOpacity={0.85}>
          <View style={styles.imageWrap}>
            <LabelThumb path={a.restaurantPhotoPath} fallbackText={a.restaurantName ?? ''} style={styles.image} radius={0} frame={0} />
          </View>
          <Text style={styles.name} numberOfLines={2} allowFontScaling={false}>{a.restaurantName?.trim() || UNNAMED_RESTAURANT}</Text>
          <Text style={styles.stamp} numberOfLines={1} allowFontScaling={false}>
            {[formatVisitDate(a.capturedAt), a.city, a.ratingOverall != null ? '★'.repeat(Math.max(0, Math.min(5, a.ratingOverall))) : null].filter(Boolean).join(' · ')}
          </Text>
        </TouchableOpacity>
      ))}
      {items.length === 0 ? RESTAURANT_EXAMPLES.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />) : null}
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.lg, alignItems: 'center' },
  // No bottom padding: the separator below sits 18pt under the last caption line.
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md },
  card: { width: HOME_TILE.w },
  imageWrap: { width: HOME_TILE.w, height: HOME_TILE.h, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, overflow: 'hidden' },
  image: { width: HOME_TILE.w, height: HOME_TILE.h },
  name: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  stamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3 },
  // Same as Your Cookbook's stats bar.
  statsRow: { marginTop: spacing.xs, paddingVertical: spacing.xs, alignItems: 'center', paddingHorizontal: spacing.xl },
  statsText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  // Spacing only — no full-width rule above the carousel.
  statsSep: { marginTop: spacing.sm, marginBottom: spacing.md },
});
