import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';
import { cellarOwner } from '../api/cellarContext';
import { useChefPairingHistory, useChefLabelHistory } from '../hooks/useChefHistory';
import { useScanHistory } from '../hooks/useScanHistory';
import { useCellar, useArchive } from '../hooks/useCellar';
import { sameWineIdentity } from '../utils/wineMatch';
import { useLabels } from '../hooks/useLabels';
import { wineNameKey } from '../utils/wineIdentity';
import { LabelThumb } from './LabelThumb';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard, RESTAURANT_IMG, placeholderLabelImages } from './ExamplePlaceholder';
import { splitPersonality } from '../utils/personalityText';
import { HOME_TILE, colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Vinster's Insights is NON-cellar: a data-driven, per-user strip of what the
// user has been DOING in the app — kept tight at six tiles. Only tiles with real
// data for this user appear; the rest are skipped.
const MAX_TILES = 6;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const INSIGHT_OVERLAY = "Vinster's Insights appear here as you use Vinster";
// Order mirrors the real tiles so a populated tile replaces its own placeholder.
// Wine tiles are label collages; Dined Out stays a restaurant photo.
// Each example is keyed to the real tile it stands in for, so an example only
// ever shows when THAT tile has no data (never beside its own real tile).
const INSIGHT_EXAMPLES: { key: string; card: PlaceholderCard }[] = [
  { key: 'personality', card: { kind: 'labelCollage', images: placeholderLabelImages(0, 4), title: 'Your Personality Sketch', stamp: 'The Quiet Collector', overlay: INSIGHT_OVERLAY } },
  { key: 'archived', card: { kind: 'labelCollage', images: placeholderLabelImages(4, 4), title: 'Archived Last Month', stamp: '6 bottles', overlay: INSIGHT_OVERLAY } },
  { key: 'restaurants', card: { kind: 'image', uri: RESTAURANT_IMG, title: 'Dined Out Last Month', stamp: '3 restaurants', overlay: INSIGHT_OVERLAY } },
  { key: 'recipes-generated', card: { kind: 'labelCollage', images: placeholderLabelImages(2, 4), title: 'Recipes Generated', stamp: '4 of your wines', overlay: INSIGHT_OVERLAY } },
  { key: 'labels-month', card: { kind: 'labelCollage', images: placeholderLabelImages(6, 4), title: 'Labels Scanned Last Month', stamp: '12 wine labels', overlay: INSIGHT_OVERLAY } },
];

// Every insight tile shows a real IMAGE — a label collage or a photo. Tiles with
// no image to show are omitted (we never render a plain brown/icon tile).
type CollageItem = string | { producer: string | null; wineName: string | null };
type Tile = {
  key: string;
  title: string;
  meta: string;
  // Up to four thumbnails: a stored photo path, or a wine identity whose label
  // is looked up (used when the user has no photo of that wine).
  collage: CollageItem[];
  onTap?: () => void;
};

export function CellarInsightsCarousel() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { sessions: pairingSessions } = useChefPairingHistory();
  const { sessions: recipeSessions } = useChefLabelHistory();
  const { archive } = useScanHistory();
  const { wines } = useCellar();
  const { wines: archivedWines } = useArchive();
  const { labels } = useLabels();
  // Cellar wine thumbnails by id — for the pairings collage.
  const thumbById = new Map(wines.filter((w) => w.label_image_path).map((w) => [w.id, w.label_image_path as string]));
  // Thumbnail by wine IDENTITY (producer + name) — so a recipe's wine (stored as
  // details, not an id) can find its label image from the cellar or a label scan.
  const thumbByKey = new Map<string, string>();
  for (const w of wines) if (w.label_image_path) thumbByKey.set(wineNameKey(w.producer, w.wine_name), w.label_image_path);
  for (const l of labels as any[]) if (l.label_image_path && !thumbByKey.has(wineNameKey(l.producer, l.wine_name))) thumbByKey.set(wineNameKey(l.producer, l.wine_name), l.label_image_path);

  // Personality sketch — the LATEST ALTER-EGO sketch, the exact same source +
  // category the You-page "About You" carousel (AlterEgoCarousel) shows, so the
  // two always match. (Earlier this read profiles.last_* / the wine+recipe
  // categories, which are a different sketch type and drifted out of sync.)
  const { data: latestSketch } = useQuery({
    queryKey: ['latest-alter-ego-sketch', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from('personality_sketches')
        .select('text, category, created_at')
        .eq('user_id', userId!)
        .eq('category', 'alter-ego')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as { text: string | null; category: string | null } | null;
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
        .eq('user_id', cellarOwner(userId!)).not('archived_at', 'is', null).gte('archived_at', since)
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
  const sketchText = latestSketch?.text ?? null;
  // Collage for the Personality tile — label scans + restaurant thumbnails whose
  // name actually appears in the sketch (so the pictures relate to the words).
  // Falls back to the user's recent label scans + a restaurant photo when nothing
  // matches, rather than unrelated cellar bottles.
  const sketchLower = (sketchText ?? '').toLowerCase();
  const nameMentioned = (name: string) =>
    name.toLowerCase().split(/[^a-zà-ÿ0-9]+/).filter((w) => w.length >= 4).some((w) => sketchLower.includes(w));
  const matchedThumbs: string[] = [];
  if (sketchLower) {
    for (const l of labels as any[]) {
      if (l.label_image_path && nameMentioned(`${l.producer ?? ''} ${l.wine_name ?? ''} ${l.region ?? ''}`)) matchedThumbs.push(l.label_image_path);
    }
    for (const a of archive as any[]) {
      if (a.restaurantPhotoPath && a.restaurantName && nameMentioned(a.restaurantName)) matchedThumbs.push(a.restaurantPhotoPath);
    }
  }
  const fallbackThumbs = [
    ...(labels as any[]).filter((l) => l.label_image_path).slice(0, 3).map((l) => l.label_image_path as string),
    ...(archive as any[]).filter((a) => a.restaurantPhotoPath).slice(0, 1).map((a) => a.restaurantPhotoPath as string),
  ];
  const personalityCollage = (matchedThumbs.length > 0 ? matchedThumbs : fallbackThumbs).filter(Boolean).slice(0, 4);
  // Only show the sketch tile once we have labels to build its collage from —
  // never a bare brown tile.
  if (sketchText && personalityCollage.length > 0) {
    tiles.push({
      key: 'personality',
      title: 'Your Personality Sketch', meta: splitPersonality(sketchText).title ?? 'Tap to read',
      // A collage of bottles from the collection the sketch is drawn from.
      collage: personalityCollage,
      onTap: () => router.push('/profile/personality?category=alter-ego' as any),
    });
  }


  // 2) Bottles archived last month (collage of their labels). Needs ≥1 label.
  const archivedBottles = archivedLM.reduce((s: number, w: any) => s + (w.quantity ?? 0), 0);
  const archivedThumbs = archivedLM.map((w: any) => w.label_image_path).filter(Boolean) as string[];
  if (archivedBottles > 0 && archivedThumbs.length > 0) {
    tiles.push({
      key: 'archived',
      title: 'Archived Last Month', meta: `${archivedBottles} bottle${archivedBottles === 1 ? '' : 's'}`,
      collage: archivedThumbs,
      onTap: () => router.push('/cellar/archive' as any),
    });
  }

  // 3) Restaurants dined at last month — the venue photos the user saved (newest
  // first). Only shown when at least one photo exists; otherwise the empty-state
  // placeholder (a faded restaurant image) covers it.
  const distinctRestos = new Map<string, string | null>();
  for (const r of restosLM as any[]) {
    const k = (r.restaurant_name ?? '').trim().toLowerCase();
    if (k && !distinctRestos.has(k)) distinctRestos.set(k, r.restaurant_photo_path ?? null);
  }
  const restoPhotos = [...distinctRestos.values()].filter(Boolean) as string[];
  if (distinctRestos.size > 0 && restoPhotos.length > 0) {
    tiles.push({
      key: 'restaurants',
      title: 'Dined Out Last Month', meta: `${distinctRestos.size} restaurant${distinctRestos.size === 1 ? '' : 's'}`,
      collage: restoPhotos,
      onTap: () => router.push('/restaurants/reviews' as any),
    });
  }

  // 4) Recipes Generated — how many of the user's OWN wines have a recipe, shown
  // with the label thumbnail of the LAST wine paired. (A recipe in Pair is
  // generated for a specific wine, stored as details — matched by identity.)
  {
    // Up to FOUR of the most recently paired wines' labels (newest first, deduped
    // by identity) — a collage, like the other Insights tiles.
    const recipeWineKeys = new Set<string>();
    const recipeThumbs: CollageItem[] = [];
    let recipeFallback: CollageItem | null = null;
    const photoRows = [...wines, ...archivedWines].filter((x) => x.label_image_path);
    const photoByKey = new Map<string, string>();
    for (const x of photoRows) { const k = wineNameKey(x.producer, x.wine_name); if (k && !photoByKey.has(k)) photoByKey.set(k, x.label_image_path as string); }
    const recipePhotoFor = (rw: { producer?: string | null; wineName?: string | null; vintage?: string | null }): string | null => {
      // Exact name first (cheap); the fuzzy identity match only on a miss.
      const exact = photoByKey.get(wineNameKey(rw.producer ?? null, rw.wineName ?? null));
      if (exact) return exact;
      const hit = photoRows.find((x) => sameWineIdentity(
        { producer: x.producer, wine_name: x.wine_name, vintage: null } as any,
        { producer: rw.producer ?? null, wine_name: rw.wineName ?? null, vintage: null } as any,
      ));
      return (hit?.label_image_path as string | undefined) ?? null;
    };
    const seenThumbKeys = new Set<string>();
    for (const s of recipeSessions as any[]) {
      const w = s.wine;
      if (!w) continue;
      const key = wineNameKey(w.producer, w.wineName);
      recipeWineKeys.add(key);
      if (!seenThumbKeys.has(key) && recipeThumbs.length < 4) {
        seenThumbKeys.add(key);
        // The user's own photo of that wine — cellar, archive or a label scan,
        // matched by identity (not exact spelling) so archived and slightly
        // differently named bottles still find their picture. Wines with no
        // stored photo are left out rather than showing a name-only square.
        const photo = thumbByKey.get(key) ?? recipePhotoFor(w);
        if (photo) recipeThumbs.push(photo);
        else if (!recipeFallback) recipeFallback = { producer: w.producer ?? null, wineName: w.wineName ?? null };
      }
    }
    // No stored photo for any recipe wine → the newest one's label from the web.
    if (recipeThumbs.length === 0 && recipeFallback) recipeThumbs.push(recipeFallback);
    const recipeWineCount = recipeWineKeys.size;
    // Only shown when we have at least one paired wine's label to picture it —
    // never a bare brown/count tile.
    if (recipeWineCount > 0 && recipeThumbs.length > 0) {
      tiles.push({
        key: 'recipes-generated',
        title: 'Recipes Generated', meta: `${recipeWineCount} of your wine${recipeWineCount === 1 ? '' : 's'}`,
        collage: recipeThumbs,
        onTap: () => router.push('/chef/archive' as any),
      });
    }
  }

  // (The "Recipes in Your Cookbook" tile is retired for now — no artwork for it.)

  // 4) Labels scanned last month — a collage of those label thumbnails. Only
  // shown when we have at least one label image.
  {
    const since = Date.now() - MONTH_MS;
    const recentLabels = (labels as any[]).filter((l) => l.created_at && new Date(l.created_at).getTime() >= since);
    const labelThumbs = recentLabels.filter((l) => l.label_image_path).map((l) => l.label_image_path as string).slice(0, 4);
    if (recentLabels.length > 0 && labelThumbs.length > 0) {
      tiles.push({
        key: 'labels-month',
        title: 'Labels Scanned Last Month', meta: `${recentLabels.length} Wine Label${recentLabels.length === 1 ? '' : 's'}`,
        collage: labelThumbs,
      });
    }
  }

  // Only tiles with a real image (collage) ever render — no brown/icon tiles.
  const shown = tiles.filter((t) => t.collage.length > 0).slice(0, MAX_TILES);
  // Examples only before there's anything real to show — never beside real tiles.
  const fill = shown.length === 0 ? INSIGHT_EXAMPLES.map((e) => e.card) : [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {shown.map((t) => (
        <TouchableOpacity key={t.key} style={styles.card} onPress={t.onTap} activeOpacity={t.onTap ? 0.85 : 1}>
          <Collage paths={t.collage} />
          <Text style={styles.cardName} numberOfLines={2} allowFontScaling={false}>{t.title}</Text>
          <Text style={styles.cardMeta} numberOfLines={1} allowFontScaling={false}>{t.meta}</Text>
        </TouchableOpacity>
      ))}
      {fill.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} compact />)}
    </ScrollView>
  );
}

// 2×2 thumbnail collage (up to 4) filling the 220×165 tile footprint.
function CollageCell({ item, full }: { item: CollageItem; full?: boolean }) {
  const st = full ? styles.collageFull : styles.collageCell;
  if (typeof item === 'string') return <LabelThumb path={item} style={st} radius={full ? 12 : 0} frame={0} />;
  return <View style={[st, { overflow: 'hidden' }]}><WineCardThumb producer={item.producer} wineName={item.wineName} fallbackText={item.wineName ?? item.producer ?? ''} style={st} /></View>;
}
function CollageSlot({ item, w, h }: { item: CollageItem; w: number; h: number }) {
  const st = { width: w, height: h };
  if (typeof item === 'string') return <LabelThumb path={item} style={st} radius={0} frame={0} />;
  return <View style={[st, { overflow: 'hidden' }]}><WineCardThumb producer={item.producer} wineName={item.wineName} fallbackText={item.wineName ?? item.producer ?? ''} style={st} /></View>;
}
function Collage({ paths }: { paths: CollageItem[] }) {
  const p = paths.slice(0, 4);
  if (p.length === 1) {
    return <View style={styles.collageBox}><View style={styles.collageInner}><CollageCell item={p[0]} full /></View></View>;
  }
  // Two → side by side; three → one tall on the left, two stacked on the right.
  // (A 2×2 grid left blank squares.)
  if (p.length === 2 || p.length === 3) {
    return (
      <View style={styles.collageBox}>
        <View style={[styles.collageInner, { flexDirection: 'row' }]}>
          <CollageSlot item={p[0]} w={(HOME_TILE.w - 2) / 2} h={HOME_TILE.h - 2} />
          {p.length === 2 ? <CollageSlot item={p[1]} w={(HOME_TILE.w - 2) / 2} h={HOME_TILE.h - 2} /> : (
            <View>
              <CollageSlot item={p[1]} w={(HOME_TILE.w - 2) / 2} h={(HOME_TILE.h - 2) / 2} />
              <CollageSlot item={p[2]} w={(HOME_TILE.w - 2) / 2} h={(HOME_TILE.h - 2) / 2} />
            </View>
          )}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.collageBox}>
      <View style={[styles.collageInner, styles.collageGrid]}>
        {p.map((pp, i) => <CollageCell key={i} item={pp} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // No bottom padding: the separator below sits 18pt under the last caption line.
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md },
  card: { width: HOME_TILE.w },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardMeta: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  // Home tile: images edge to edge inside a white outline (no inset frame).
  collageBox: { width: HOME_TILE.w, height: HOME_TILE.h, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, overflow: 'hidden' },
  collageInner: { width: HOME_TILE.w - 2, height: HOME_TILE.h - 2, overflow: 'hidden' },
  collageFull: { width: HOME_TILE.w - 2, height: HOME_TILE.h - 2 },
  collageGrid: { width: HOME_TILE.w - 2, height: HOME_TILE.h - 2, flexDirection: 'row', flexWrap: 'wrap' },
  collageCell: { width: (HOME_TILE.w - 2) / 2, height: (HOME_TILE.h - 2) / 2 },
});
