import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LabelThumb } from './LabelThumb';
import { useChosenWines } from '../hooks/useChosenWines';
import { useScanHistory, type ScanArchiveItem } from '../hooks/useScanHistory';
import { wineHeaderLine } from '../utils/wineHeader';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

type Review = { key: string; ts: number; title: string; stamp: string; path: string | null; open: () => void };

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

function ReviewCard({ item }: { item: Review }) {
  return (
    <TouchableOpacity style={styles.card} onPress={item.open} activeOpacity={0.85}>
      <LabelThumb path={item.path} fallbackText={item.title} style={styles.thumb} radius={10} frame={4} />
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
    open: () => router.push(`/wines/chosen?openReview=${w.id}` as any),
  }));

  const restaurantItems: Review[] = archive.filter(restaurantReviewed).map((a) => ({
    key: `r-${a.id}`,
    ts: a.capturedAt ? new Date(a.capturedAt).getTime() : 0,
    title: a.restaurantName?.trim() || 'Restaurant',
    stamp: [a.capturedAt ? stampDate(new Date(a.capturedAt)) : '', a.city?.trim()].filter(Boolean).join(' · '),
    path: a.restaurantPhotoPath,
    open: () => router.push(`/restaurants/reviews?openSession=${a.id}` as any),
  }));

  const merged = [...wineItems, ...restaurantItems].sort((a, b) => b.ts - a.ts).slice(0, 12);

  if (merged.length === 0) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        <View style={[styles.card, styles.emptyCard]}>
          <Text style={styles.emptyText}>Your wine & restaurant reviews will appear here.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {merged.map((item) => <ReviewCard key={item.key} item={item} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  thumb: { width: 220, height: 165 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  emptyCard: { height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderWhite, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
