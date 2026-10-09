import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';
import { useChefPairingHistory, useChefLabelHistory } from '../hooks/useChefHistory';
import { useScanHistory } from '../hooks/useScanHistory';
import { useCellar } from '../hooks/useCellar';
import { LabelThumb } from './LabelThumb';
import { PlaceholderCardView, type PlaceholderCard } from './ExamplePlaceholder';
import { splitPersonality } from '../utils/personalityText';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Vinster's Insights is NON-cellar: a data-driven, per-user strip of what the
// user has been DOING in the app — kept tight at six tiles. Only tiles with real
// data for this user appear; the rest are skipped.
const MAX_TILES = 6;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const INSIGHT_EXAMPLES: PlaceholderCard[] = [
  { kind: 'icon', icon: 'person-circle-outline', title: 'Your Personality Sketch', stamp: 'The Quiet Collector', overlay: 'Your insights appear here as you use Vinster' },
  { kind: 'icon', icon: 'albums-outline', title: 'Archived Last Month', stamp: '6 bottles', overlay: 'Your insights appear here as you use Vinster' },
  { kind: 'icon', icon: 'restaurant-outline', title: 'Dined Out Last Month', stamp: '3 restaurants', overlay: 'Your insights appear here as you use Vinster' },
];

type Tile = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  meta: string;
  value?: string;       // big number/word for an icon tile
  collage?: string[];   // storage paths for a 2×2 thumbnail collage
  onTap?: () => void;
};

export function CellarInsightsCarousel() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { sessions: pairingSessions } = useChefPairingHistory();
  const { sessions: recipeSessions } = useChefLabelHistory();
  const { archive } = useScanHistory();
  const { wines } = useCellar();
  // Cellar wine thumbnails, by id and as a recent sample — for tile collages.
  const thumbById = new Map(wines.filter((w) => w.label_image_path).map((w) => [w.id, w.label_image_path as string]));
  const sampleThumbs = wines.filter((w) => w.label_image_path).slice(0, 4).map((w) => w.label_image_path as string);

  // Personality sketch (whichever exists).
  const { data: sketches } = useQuery({
    queryKey: ['personality-generated', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from('profiles')
        .select('last_wine_personality, last_recipe_personality')
        .eq('user_id', userId!).maybeSingle();
      return {
        wine: (data?.last_wine_personality as string | null) ?? null,
        recipe: (data?.last_recipe_personality as string | null) ?? null,
      };
    },
  });

  // Bottles archived in the last month — count + labels for the collage.
  const { data: archivedLM = [] } = useQuery({
    queryKey: ['insights-archived-month', userId],
    enabled: !!userId,
    queryFn: async () => {
      const since = new Date(Date.now() - MONTH_MS).toISOString();
      const { data } = await supabase.from('cellar_wines')
        .select('id, label_image_path, quantity, archived_at')
        .eq('user_id', userId!).not('archived_at', 'is', null).gte('archived_at', since)
        .order('archived_at', { ascending: false }).limit(12);
      return data ?? [];
    },
  });

  // Restaurants dined at in the last month — distinct venues + their photos.
  const { data: restosLM = [] } = useQuery({
    queryKey: ['insights-restos-month', userId],
    enabled: !!userId,
    queryFn: async () => {
      const since = new Date(Date.now() - MONTH_MS).toISOString();
      const { data } = await supabase.from('scan_sessions')
        .select('id, restaurant_name, restaurant_photo_path, captured_at')
        .eq('user_id', userId!).not('restaurant_name', 'is', null).gte('captured_at', since)
        .order('captured_at', { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const tiles: Tile[] = [];

  // 1) Personality Sketch.
  const sketchText = sketches?.wine ?? sketches?.recipe ?? null;
  const sketchCat: 'wine' | 'recipe' = sketches?.wine ? 'wine' : 'recipe';
  if (sketchText) {
    tiles.push({
      key: 'personality', icon: 'person-circle-outline',
      title: 'Your Personality Sketch', meta: splitPersonality(sketchText).title ?? 'Tap to read',
      // A collage of bottles from the collection the sketch is drawn from.
      collage: sampleThumbs.length > 0 ? sampleThumbs : undefined,
      onTap: () => router.push(`/profile/personality?category=${sketchCat}` as any),
    });
  }

  // 2) Your Favourite Chef — the chef inspiration referenced most across saved
  // recipe pairings. Only shown once there's a genuine favourite (≥2 references),
  // so it reflects real engagement rather than a single one-off recipe.
  const chefCounts = new Map<string, number>();
  for (const s of recipeSessions as any[]) {
    for (const p of (s.pairings ?? []) as { chefInspiration?: string | null }[]) {
      const c = (p.chefInspiration ?? '').trim();
      if (c) chefCounts.set(c, (chefCounts.get(c) ?? 0) + 1);
    }
  }
  let favChef: string | null = null;
  let favCount = 0;
  for (const [c, n] of chefCounts) { if (n > favCount) { favCount = n; favChef = c; } }
  if (favChef && favCount >= 2) {
    tiles.push({
      key: 'fav-chef', icon: 'ribbon-outline',
      title: 'Your Favourite Chef', meta: favChef,
      onTap: () => router.push('/chef/archive' as any),
    });
  }

  // 3) Bottles archived last month (collage of their labels).
  const archivedBottles = archivedLM.reduce((s: number, w: any) => s + (w.quantity ?? 0), 0);
  if (archivedBottles > 0) {
    tiles.push({
      key: 'archived', icon: 'albums-outline',
      title: 'Archived Last Month', meta: `${archivedBottles} bottle${archivedBottles === 1 ? '' : 's'}`,
      collage: archivedLM.map((w: any) => w.label_image_path).filter(Boolean),
      onTap: () => router.push('/cellar/archive' as any),
    });
  }

  // 3) Restaurants dined at last month (collage of venue photos).
  const distinctRestos = new Map<string, string | null>();
  for (const r of restosLM as any[]) {
    const k = (r.restaurant_name ?? '').trim().toLowerCase();
    if (k && !distinctRestos.has(k)) distinctRestos.set(k, r.restaurant_photo_path ?? null);
  }
  if (distinctRestos.size > 0) {
    tiles.push({
      key: 'restaurants', icon: 'restaurant-outline',
      title: 'Dined Out Last Month', meta: `${distinctRestos.size} restaurant${distinctRestos.size === 1 ? '' : 's'}`,
      collage: [...distinctRestos.values()].filter(Boolean) as string[],
      onTap: () => router.push('/restaurants/reviews' as any),
    });
  }

  // 4) Pairings generated — collage of the cellar wines that were paired.
  if (pairingSessions.length > 0) {
    const pairedThumbs: string[] = [];
    for (const s of pairingSessions as any[]) {
      for (const r of (s.cellar_result ?? []) as { cellarWineId?: string }[]) {
        const t = r.cellarWineId ? thumbById.get(r.cellarWineId) : undefined;
        if (t && !pairedThumbs.includes(t)) pairedThumbs.push(t);
        if (pairedThumbs.length >= 4) break;
      }
      if (pairedThumbs.length >= 4) break;
    }
    tiles.push({
      key: 'pairings', icon: 'wine-outline', value: pairedThumbs.length > 0 ? undefined : String(pairingSessions.length),
      title: 'Pairings Generated', meta: 'Across your dishes',
      collage: pairedThumbs.length > 0 ? pairedThumbs : undefined,
      onTap: () => router.push('/(tabs)/chef' as any),
    });
  }

  // 5) Recipes saved to Your Cookbook.
  if (recipeSessions.length > 0) {
    tiles.push({
      key: 'recipes', icon: 'book-outline', value: String(recipeSessions.length),
      title: 'Recipes in Your Cookbook', meta: 'Saved for later',
      onTap: () => router.push('/chef/archive' as any),
    });
  }

  // 6) Wines scanned / searched.
  if (archive.length > 0) {
    tiles.push({
      key: 'scans', icon: 'scan-outline', value: String(archive.length),
      title: 'Wines Scanned', meta: 'Labels & lists',
    });
  }

  const shown = tiles.slice(0, MAX_TILES);
  const fill = shown.length < INSIGHT_EXAMPLES.length ? INSIGHT_EXAMPLES.slice(shown.length) : [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {shown.map((t) => (
        <TouchableOpacity key={t.key} style={styles.card} onPress={t.onTap} activeOpacity={t.onTap ? 0.85 : 1}>
          {t.collage && t.collage.length > 0 ? (
            <Collage paths={t.collage} />
          ) : (
            <View style={styles.factBox}>
              <Ionicons name={t.icon} size={30} color={colors.gold} />
              {t.value ? <Text style={styles.factValue}>{t.value}</Text> : null}
            </View>
          )}
          <Text style={styles.cardName} numberOfLines={2}>{t.title}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>{t.meta}</Text>
        </TouchableOpacity>
      ))}
      {fill.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />)}
    </ScrollView>
  );
}

// 2×2 thumbnail collage (up to 4) filling the 220×165 tile footprint.
function Collage({ paths }: { paths: string[] }) {
  const p = paths.slice(0, 4);
  if (p.length === 1) {
    return <View style={styles.collageBox}><LabelThumb path={p[0]} style={styles.collageFull} radius={12} frame={0} /></View>;
  }
  return (
    <View style={styles.collageBox}>
      <View style={styles.collageGrid}>
        {p.map((pp, i) => <LabelThumb key={i} path={pp} style={styles.collageCell} radius={0} frame={0} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardMeta: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  factBox: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: 10 },
  factValue: { fontFamily: fonts.headingSemibold, fontSize: 34, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  collageBox: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, overflow: 'hidden' },
  collageFull: { width: 220, height: 165 },
  collageGrid: { width: 220, height: 165, flexDirection: 'row', flexWrap: 'wrap' },
  collageCell: { width: 110, height: 82.5 },
});
