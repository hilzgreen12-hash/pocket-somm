import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useChosenWines } from '../hooks/useChosenWines';
import { useCellar, useArchive } from '../hooks/useCellar';
import { useScanHistory } from '../hooks/useScanHistory';
import { LabelThumb } from './LabelThumb';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard, placeholderLabelImages, RESTAURANT_IMG } from './ExamplePlaceholder';
import { wineNameKey } from '../utils/wineIdentity';
import type { ChosenWine, CellarWine } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Review tab carousels: the latest Wine Reviews and Restaurant Reviews (up to 8
// each), newest first. Read-only views of the same records the full pages list;
// tapping a card opens it there, and "View All" opens the full page.
const MAX = 8;

const fmtDay = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// Same "reviewed" rules as Your Wine Reviews.
function chosenHasReview(w: ChosenWine): boolean {
  return !!((w.tasting_note && w.tasting_note.trim()) || (w.other_observations && w.other_observations.trim()) || w.user_score != null);
}
function cellarHasReview(w: CellarWine): boolean {
  const any = w as any;
  return (Array.isArray(any.review_entries) && any.review_entries.length > 0)
    || !!(w.review_note && w.review_note.trim()) || !!(w.user_notes && w.user_notes.trim())
    || w.review_score != null || !!(w.review_location && w.review_location.trim()) || !!w.review_date;
}

type WineItem = { key: string; producer: string | null; wineName: string | null; vintage: string | null; date: string; score: number | null; photo: string | null; open: () => void };

function useWineReviewItems(): { items: WineItem[]; loading: boolean; wineCount: number; reviewCount: number } {
  const { chosenWines, isLoading } = useChosenWines();
  const { wines } = useCellar();
  const { wines: archived } = useArchive();

  const reviewed = chosenWines.filter((w) => !w.wishlist && chosenHasReview(w));
  // One card per review (an original review + its later entries share a group).
  const groups = new Map<string, ChosenWine>();
  for (const w of reviewed) {
    const k = w.review_group_id ?? w.id;
    const cur = groups.get(k);
    if (!cur || new Date(w.chosen_at).getTime() > new Date(cur.chosen_at).getTime()) groups.set(k, w);
  }
  const key = (p: string | null | undefined, n: string | null | undefined, v: string | number | null | undefined) => `${wineNameKey(p, n)}|${String(v ?? '').trim()}`;
  const chosenKeys = new Set(reviewed.map((w) => key(w.producer, w.wine_name, w.vintage)));
  const chosenWs = new Set(reviewed.map((w) => w.ws_wine_id).filter(Boolean) as string[]);

  const items: WineItem[] = [...groups.values()].map((w) => ({
    key: `c-${w.id}`, producer: w.producer, wineName: w.wine_name, vintage: w.vintage != null ? String(w.vintage) : null,
    date: w.chosen_at, score: w.user_score, photo: w.label_image_path ?? null,
    open: () => router.push(`/wines/chosen?openReview=${w.id}` as any),
  }));
  for (const w of [...wines, ...archived]) {
    if (!cellarHasReview(w)) continue;
    if ((w.ws_wine_id && chosenWs.has(w.ws_wine_id)) || chosenKeys.has(key(w.producer, w.wine_name, w.vintage))) continue;
    items.push({
      key: `w-${w.id}`, producer: w.producer, wineName: w.wine_name, vintage: w.vintage,
      date: w.review_date ?? w.created_at, score: w.review_score ?? null, photo: w.label_image_path,
      open: () => router.push(`/wines/chosen?openCellarReview=${w.id}` as any),
    });
  }
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // Stats bar: one card per wine reviewed; reviews = every dated entry.
  let reviewCount = reviewed.length;
  for (const it of items) {
    if (!it.key.startsWith('w-')) continue;
    const w = [...wines, ...archived].find((x) => `w-${x.id}` === it.key) as any;
    reviewCount += Array.isArray(w?.review_entries) && w.review_entries.length ? w.review_entries.length : 1;
  }
  return { items: items.slice(0, MAX), loading: isLoading, wineCount: items.length, reviewCount };
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
  const { items, loading, wineCount, reviewCount } = useWineReviewItems();
  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>;
  return (
    <>
    <ReviewStatsBar text={`${plural(wineCount, 'Wine', 'Wines')} · ${plural(reviewCount, 'Review', 'Reviews')}`} onViewAll={onViewAll} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {items.map((it) => (
        <TouchableOpacity key={it.key} style={styles.card} onPress={it.open} activeOpacity={0.85}>
          <View style={styles.imageWrap}>
            {it.photo
              ? <LabelThumb path={it.photo} fallbackText={it.wineName ?? it.producer ?? ''} style={styles.image} radius={0} frame={0} />
              : <WineCardThumb producer={it.producer} wineName={it.wineName} fallbackText={it.wineName ?? it.producer ?? ''} style={styles.image} />}
          </View>
          <Text style={styles.name} numberOfLines={2} allowFontScaling={false}>
            {[it.producer, it.wineName && it.wineName !== it.producer ? it.wineName : null, it.vintage].filter(Boolean).join(' ')}
          </Text>
          <Text style={styles.stamp} numberOfLines={1} allowFontScaling={false}>{[fmtDay(it.date), it.score != null ? `${it.score} pts` : null].filter(Boolean).join(' · ')}</Text>
        </TouchableOpacity>
      ))}
      {items.length === 0 ? WINE_EXAMPLES.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />) : null}
    </ScrollView>
    </>
  );
}

export function RestaurantReviewsCarousel({ onViewAll }: { onViewAll: () => void }) {
  const { archive, archiveLoading } = useScanHistory();
  if (archiveLoading) return <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>;
  // Same rule as Your Restaurant Reviews: a visit with a named restaurant or a note.
  const all = archive
    .filter((a) => (a.restaurantName && a.restaurantName.trim()) || (a.restaurantNote && a.restaurantNote.trim()))
    .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
  const items = all.slice(0, MAX);
  const restaurantCount = new Set(all.map((a) => (a.restaurantName ?? '').trim().toLowerCase()).filter(Boolean)).size;
  return (
    <>
    <ReviewStatsBar text={`${plural(restaurantCount, 'Restaurant', 'Restaurants')} · ${plural(all.length, 'Review', 'Reviews')}`} onViewAll={onViewAll} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {items.map((a) => (
        <TouchableOpacity key={a.id} style={styles.card} onPress={() => router.push(`/restaurants/reviews?openSession=${a.id}` as any)} activeOpacity={0.85}>
          <View style={styles.imageWrap}>
            <LabelThumb path={a.restaurantPhotoPath} fallbackText={a.restaurantName ?? ''} style={styles.image} radius={0} frame={0} />
          </View>
          <Text style={styles.name} numberOfLines={2} allowFontScaling={false}>{a.restaurantName?.trim() || 'Restaurant visit'}</Text>
          <Text style={styles.stamp} numberOfLines={1} allowFontScaling={false}>
            {[fmtDay(a.capturedAt), a.city, a.ratingOverall != null ? '★'.repeat(Math.max(0, Math.min(5, a.ratingOverall))) : null].filter(Boolean).join(' · ')}
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
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  imageWrap: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, overflow: 'hidden' },
  image: { width: 220, height: 165 },
  name: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, marginTop: 6, letterSpacing: 0.3 },
  stamp: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, marginTop: 2 },
  // Same as Your Cookbook's stats bar.
  statsRow: { marginTop: spacing.xs, paddingVertical: spacing.xs, alignItems: 'center', paddingHorizontal: spacing.xl },
  statsText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  statsSep: { height: 1, backgroundColor: colors.divider, marginTop: spacing.sm, marginBottom: spacing.md },
});
