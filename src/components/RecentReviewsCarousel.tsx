import { Text, TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard } from './ExamplePlaceholder';
import { useChosenWines } from '../hooks/useChosenWines';
import { useScanHistory, type ScanArchiveItem } from '../hooks/useScanHistory';
import { wineHeaderLine } from '../utils/wineHeader';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

type Review = { key: string; ts: number; title: string; stamp: string; path: string | null; producer: string | null; wineName: string | null; badge: string | null; open: () => void };

function stampDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// A restaurant scan_sessions row counts as a review once it has ratings or a note.
function restaurantReviewed(a: ScanArchiveItem): boolean {
  return !!(
    a.ratingOverall != null || a.ratingFood != null || a.ratingService != null ||
    a.ratingWineList != null || a.ratingAtmosphere != null || a.ratingValue != null ||
    (a.restaurantNote && a.restaurantNote.trim())
  );
}

// Example cards shown when a new user has no reviews yet.
const REVIEW_EXAMPLES: PlaceholderCard[] = [
  { kind: 'icon', icon: 'restaurant-outline', title: 'La Steakhouse', stamp: '20 Dec 2029 · London', overlay: 'Your first review replaces this content' },
  { kind: 'label', producer: 'Domaine de la Romanée-Conti', wineName: 'La Romanée-Conti', title: 'La Romanée-Conti 2002', stamp: '30 Jan 2030 · La Steakhouse', overlay: 'Your second review replaces this content' },
  { kind: 'label', producer: 'Château Haut-Brion', wineName: 'Haut-Brion Blanc', title: 'Haut-Brion Blanc 2012', stamp: '14 Dec 2029 · Maison Jules', overlay: 'Your third review replaces this content' },
];

// Totals for the "XX Wines · XX Restaurants" stats line under the header.
export function useRecentReviewCounts(): { wines: number; restaurants: number } {
  const { chosenWines } = useChosenWines();
  const { archive } = useScanHistory();
  const wines = chosenWines.length;
  const restaurants = archive.filter(restaurantReviewed).length;
  return { wines, restaurants };
}

function ReviewCard({ item }: { item: Review }) {
  return (
    <TouchableOpacity style={styles.card} onPress={item.open} activeOpacity={0.85}>
      <View>
        <WineCardThumb path={item.path} producer={item.producer} wineName={item.wineName} fallbackText={item.title} />
        {/* Top-right score (wines, XX/100) or overall star rating (restaurants);
            nothing shown when a review carries neither. */}
        {item.badge ? (
          <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>
        ) : null}
      </View>
      <Text style={styles.cardName} numberOfLines={2}>{item.title}</Text>
      {item.stamp ? <Text style={styles.cardStamp} numberOfLines={1}>{item.stamp}</Text> : null}
    </TouchableOpacity>
  );
}

// "Recent Reviews" — the user's wine reviews and restaurant reviews mixed by
// recency for the Discover tab. Tapping a card opens that review.
export function RecentReviewsCarousel() {
  const { chosenWines } = useChosenWines();
  const { archive } = useScanHistory();

  const wineItems: Review[] = chosenWines.map((w) => ({
    key: `w-${w.id}`,
    ts: w.chosen_at ? new Date(w.chosen_at).getTime() : 0,
    title: wineHeaderLine(w.producer, w.wine_name, w.vintage) || (w.wine_name ?? 'Wine'),
    stamp: [w.chosen_at ? stampDate(new Date(w.chosen_at)) : '', (w.restaurant_name || w.city || '').trim()].filter(Boolean).join(' · '),
    path: w.label_image_path,
    producer: w.producer ?? null,
    wineName: w.wine_name ?? null,
    badge: w.user_score != null ? `${w.user_score}/100` : null,
    open: () => router.push(`/wines/chosen?openReview=${w.id}` as any),
  }));

  const restaurantItems: Review[] = archive.filter(restaurantReviewed).map((a) => ({
    key: `r-${a.id}`,
    ts: a.capturedAt ? new Date(a.capturedAt).getTime() : 0,
    title: a.restaurantName?.trim() || 'Restaurant',
    stamp: [a.capturedAt ? stampDate(new Date(a.capturedAt)) : '', a.city?.trim()].filter(Boolean).join(' · '),
    path: a.restaurantPhotoPath,
    producer: null,
    wineName: null,
    badge: a.ratingOverall != null ? `${a.ratingOverall}★` : null,
    open: () => router.push(`/restaurants/reviews?openSession=${a.id}` as any),
  }));

  const merged = [...wineItems, ...restaurantItems].sort((a, b) => b.ts - a.ts).slice(0, 12);
  // Real reviews fill from the left, replacing placeholder tiles in order; the
  // remaining example tiles stay until there are at least three.
  const fill = merged.length < REVIEW_EXAMPLES.length ? REVIEW_EXAMPLES.slice(merged.length) : [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {merged.map((item) => <ReviewCard key={item.key} item={item} />)}
      {fill.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  thumb: { width: 220, height: 165 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  // Score (XX/100) or overall stars, top-right of the thumbnail.
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(18,11,10,0.82)', borderRadius: 8, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, letterSpacing: 0.3 },
});
