import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';
import { fetchWineIdsWithRemovals } from '../api/cellar';
import { useChefPairingHistory } from '../hooks/useChefHistory';
import { useInsightDismissStore } from '../stores/insightDismissStore';
import { showAlert } from './AppAlert';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard } from './ExamplePlaceholder';
import { wineHeaderLine } from '../utils/wineHeader';
import { splitPersonality } from '../utils/personalityText';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { CellarWine } from '../types/wine';

// Cap on how many "last bottle" tiles show, so a big cellar doesn't create a
// 40-tile strip. Newest additions first.
const LAST_BOTTLE_CAP = 8;

// Placeholder tiles for a new user with no data yet — a faded example of each of
// the three staple insights, replaced left-to-right as real ones appear.
const INSIGHT_EXAMPLES: PlaceholderCard[] = [
  { kind: 'label', producer: 'Château Margaux', wineName: 'Grand Vin', title: 'Château Margaux 2015', stamp: 'Running low · Replenish?', overlay: 'Your content will appear here' },
  { kind: 'icon', icon: 'trophy-outline', title: 'Most Collected', stamp: 'Guigal · 7 bottles', overlay: 'Your content will appear here' },
  { kind: 'icon', icon: 'time-outline', title: 'Oldest Vintage', stamp: '1998', overlay: 'Your content will appear here' },
];

type Tile =
  | { kind: 'bottle'; key: string; dismissKey: string; wine: CellarWine }
  | { kind: 'fact'; key: string; dismissKey: string; icon: keyof typeof Ionicons.glyphMap; value: string; valueSmall?: boolean; title: string; meta: string; wineId?: string; thumbWine?: CellarWine; onTap?: () => void };

function runningLowWines(wines: CellarWine[], removalSet: Set<string>, dismissed: string[]): CellarWine[] {
  const dset = new Set(dismissed);
  return wines
    .filter((w) => (w.quantity ?? 0) === 1 && removalSet.has(w.id) && !dset.has(`bottle:${w.id}`))
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
}

// Count for the stats line under the header (running-low tiles, minus dismissed).
export function useCellarInsightsCount(): number {
  const { wines } = useCellar();
  const { session } = useAuth();
  const dismissed = useInsightDismissStore((s) => s.dismissed);
  const { data: removalIds = [] } = useQuery({
    queryKey: ['removal-wine-ids', session?.user.id],
    queryFn: fetchWineIdsWithRemovals,
    enabled: !!session?.user.id,
  });
  return runningLowWines(wines, new Set(removalIds), dismissed).length;
}

// "Your Cellar Insights" — actionable "running low" bottles first (wines drawn
// DOWN to their last bottle, so a replenish nudge makes sense), then a few
// buried-in-the-data facts. Tap opens the wine; long-press gives options.
export function CellarInsightsCarousel() {
  const { wines } = useCellar();
  const { session } = useAuth();
  const dismissed = useInsightDismissStore((s) => s.dismissed);
  const dismiss = useInsightDismissStore((s) => s.dismiss);
  const { data: removalIds = [] } = useQuery({
    queryKey: ['removal-wine-ids', session?.user.id],
    queryFn: fetchWineIdsWithRemovals,
    enabled: !!session?.user.id,
  });
  // Which personality sketches the user has generated (to surface a "view" tile).
  const { data: sketches } = useQuery({
    queryKey: ['personality-generated', session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('last_wine_personality, last_recipe_personality')
        .eq('user_id', session!.user.id)
        .maybeSingle();
      return {
        wine: !!data?.last_wine_personality,
        recipe: !!data?.last_recipe_personality,
        wineText: (data?.last_wine_personality as string | null) ?? null,
        recipeText: (data?.last_recipe_personality as string | null) ?? null,
      };
    },
  });
  // Pairing history — only surface a pairing insight if the user actually pairs.
  const { sessions: pairingSessions } = useChefPairingHistory();
  const dset = new Set(dismissed);

  // Last-bottle tiles: at 1 bottle AND drawn down to it (has removal history) —
  // NOT wines simply added as a single. Newest additions first, capped.
  const lastBottles = runningLowWines(wines, new Set(removalIds), dismissed).slice(0, LAST_BOTTLE_CAP);

  // Fact tiles — only included when the data supports them (and not dismissed).
  const facts: Tile[] = [];

  // Top critic score — the highest Vinster/critic-scored wine you own.
  const topCritic = wines.filter((w) => w.critic_score != null).sort((a, b) => (b.critic_score ?? 0) - (a.critic_score ?? 0))[0];
  const criticKey = topCritic ? `fact:critic:${topCritic.id}` : '';
  if (topCritic && !dset.has(criticKey)) {
    facts.push({
      kind: 'fact', key: 'critic', dismissKey: criticKey, icon: 'ribbon-outline',
      value: String(topCritic.critic_score), title: `Top Critic Score · ${topCritic.critic_score}`,
      meta: [topCritic.producer, topCritic.wine_name].filter(Boolean).join(' ') || 'In your cellar',
      wineId: topCritic.id, thumbWine: topCritic,
    });
  }

  // Your top score — the wine YOU rated highest.
  const topUser = wines.filter((w) => w.review_score != null).sort((a, b) => (b.review_score ?? 0) - (a.review_score ?? 0))[0];
  const userKey = topUser ? `fact:yourscore:${topUser.id}` : '';
  if (topUser && !dset.has(userKey)) {
    facts.push({
      kind: 'fact', key: 'yourscore', dismissKey: userKey, icon: 'star-outline',
      value: String(topUser.review_score), title: `Your Top Score · ${topUser.review_score}`,
      meta: [topUser.producer, topUser.wine_name].filter(Boolean).join(' ') || 'In your cellar',
      wineId: topUser.id, thumbWine: topUser,
    });
  }

  // Oldest vintage in the cellar (vintage is stored as a string).
  const vintaged = wines
    .map((w) => ({ w, y: w.vintage ? parseInt(w.vintage, 10) : NaN }))
    .filter((x) => Number.isFinite(x.y) && x.y > 1900);
  const oldest = vintaged.length ? vintaged.reduce((m, x) => (x.y < m.y ? x : m)) : null;
  const vintageKey = oldest ? `fact:vintage:${oldest.y}` : '';
  if (oldest && !dset.has(vintageKey)) {
    facts.push({
      kind: 'fact', key: 'vintage', dismissKey: vintageKey, icon: 'time-outline', value: String(oldest.y),
      // Vintage in the title, per request; the bottle thumbnail comes from thumbWine.
      title: `Oldest Vintage · ${oldest.y}`,
      meta: [oldest.w.producer, oldest.w.wine_name].filter(Boolean).join(' ') || 'In your cellar',
      wineId: oldest.w.id, thumbWine: oldest.w,
    });
  }

  // Most-collected producer by total bottles.
  const producerAgg = new Map<string, { label: string; bottles: number }>();
  for (const w of wines) {
    const p = (w.producer ?? '').trim();
    if (!p) continue;
    const cur = producerAgg.get(p.toLowerCase()) ?? { label: p, bottles: 0 };
    cur.bottles += w.quantity ?? 0;
    producerAgg.set(p.toLowerCase(), cur);
  }
  const topProducer = [...producerAgg.values()].sort((a, b) => b.bottles - a.bottles)[0];
  const producerKey = topProducer ? `fact:producer:${topProducer.label.toLowerCase()}` : '';
  if (topProducer && topProducer.bottles >= 2 && !dset.has(producerKey)) {
    // Representative wine for the thumbnail: the top-scored wine from that producer.
    const producerWine = wines
      .filter((w) => (w.producer ?? '').toLowerCase() === topProducer.label.toLowerCase())
      .sort((a, b) => (b.critic_score ?? 0) - (a.critic_score ?? 0))[0];
    facts.push({ kind: 'fact', key: 'producer', dismissKey: producerKey, icon: 'trophy-outline', value: topProducer.label, title: topProducer.label, meta: `Most Collected · ${topProducer.bottles} bottles`, wineId: producerWine?.id, thumbWine: producerWine });
  }

  // Pairing insight — ONLY for users who actually pair. "Your Most Paired Wine":
  // the cellar wine Vinster has recommended across the most of your dishes (your
  // most versatile food wine). Counted from each session's stored cellar_result.
  // Only shown when a wine recurs across ≥2 dishes (a genuine "most").
  const pairWineAgg = new Map<string, { name: string; n: number }>();
  for (const s of pairingSessions) {
    for (const rec of s.cellar_result ?? []) {
      if (!rec?.cellarWineId) continue;
      const cur = pairWineAgg.get(rec.cellarWineId) ?? { name: rec.wineName ?? '', n: 0 };
      cur.n += 1;
      pairWineAgg.set(rec.cellarWineId, cur);
    }
  }
  const topPairWine = [...pairWineAgg.entries()].sort((a, b) => b[1].n - a[1].n)[0];
  if (topPairWine && topPairWine[1].n >= 2) {
    const [wid, info] = topPairWine;
    const pairWineKey = `fact:mostpairedwine:${wid}`;
    if (!dset.has(pairWineKey)) {
      // Match to the live cellar wine (by id, then by name) so the tile uses that
      // wine's stored label image via WineCardThumb.
      const nameKey = info.name.trim().toLowerCase();
      const matched = wines.find((w) => w.id === wid)
        ?? (nameKey ? wines.find((w) => (w.wine_name ?? '').trim().toLowerCase() === nameKey) : undefined);
      facts.push({
        kind: 'fact', key: 'mostpairedwine', dismissKey: pairWineKey, icon: 'wine-outline',
        value: matched ? (matched.wine_name ?? info.name) : info.name,
        title: 'Your Most Paired Wine',
        meta: `Recommended for ${info.n} dishes`,
        wineId: matched ? matched.id : undefined,
        thumbWine: matched ?? undefined,
      });
    }
  }

  // Personality sketch — surfaced here so users see it without opening the You tab.
  // Only when a sketch exists (don't show an empty tile).
  const hasSketch = !!(sketches?.wine || sketches?.recipe);
  const sketchCat: 'wine' | 'recipe' = sketches?.wine ? 'wine' : 'recipe';
  const sketchTitle = splitPersonality(sketchCat === 'wine' ? sketches?.wineText : sketches?.recipeText).title;
  // The box shows a brief explainer of what a sketch IS (instead of a "You" logo);
  // the sketch's own title sits on the meta line below (replacing "Tap to read").
  const sketchBlurb = sketchCat === 'recipe'
    ? "Vinster's read on who you are in the kitchen — drawn from your recipes, dining and reviews."
    : "Vinster's read on who you are in the cellar — drawn from your bottles, choices and reviews.";
  const personalityTile: Tile | null = hasSketch && !dset.has('fact:personality')
    ? {
        kind: 'fact', key: 'personality', dismissKey: 'fact:personality', icon: 'person-circle-outline',
        value: sketchBlurb, valueSmall: true,
        title: 'Your Personality Sketch',
        meta: sketchTitle ?? 'Tap to read',
        onTap: () => router.push(`/profile/personality?category=${sketchCat}` as any),
      }
    : null;

  // Personality first (headline), then actionable last-bottle tiles, then facts.
  const tiles: Tile[] = [
    ...(personalityTile ? [personalityTile] : []),
    ...lastBottles.map((w): Tile => ({ kind: 'bottle', key: `b-${w.id}`, dismissKey: `bottle:${w.id}`, wine: w })),
    ...facts,
  ];

  // Long-press → options (never straight to the wine). "View Intel" + "View in
  // Cellar" only when the tile maps to an actual wine; every tile can be removed.
  function tileLongPress(t: Tile) {
    const wineId = t.kind === 'bottle' ? t.wine.id : t.wineId;
    const title = t.kind === 'bottle' ? (wineHeaderLine(t.wine.producer, t.wine.wine_name, t.wine.vintage) || 'This wine') : t.title;
    const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [];
    if (wineId) {
      buttons.push({ text: 'View Intel', onPress: () => router.push(`/cellar/${wineId}` as any) });
      buttons.push({ text: 'View in Cellar', onPress: () => router.push('/cellar/list' as any) });
    }
    buttons.push({ text: 'Remove from Carousel', style: 'destructive', onPress: () => dismiss(t.dismissKey) });
    buttons.push({ text: 'Cancel', style: 'cancel' });
    showAlert({ title, buttons });
  }

  // Real tiles fill from the left; example tiles fill the rest until there are 3.
  const fill = tiles.length < INSIGHT_EXAMPLES.length ? INSIGHT_EXAMPLES.slice(tiles.length) : [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {tiles.map((t) =>
        t.kind === 'bottle' ? (
          <TouchableOpacity key={t.key} style={styles.card} onPress={() => router.push(`/cellar/${t.wine.id}` as any)} onLongPress={() => tileLongPress(t)} delayLongPress={400} activeOpacity={0.85}>
            <View>
              <WineCardThumb path={t.wine.label_image_path} producer={t.wine.producer} wineName={t.wine.wine_name} fallbackText={t.wine.wine_name} />
              <View style={styles.badge}><Text style={styles.badgeText}>Only 1 Left</Text></View>
            </View>
            <Text style={styles.cardName} numberOfLines={2}>{wineHeaderLine(t.wine.producer, t.wine.wine_name, t.wine.vintage)}</Text>
            <Text style={styles.cardMetaAlert} numberOfLines={1}>Running low · Replenish?</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={t.key}
            style={styles.card}
            onPress={t.onTap ?? (t.wineId ? () => router.push(`/cellar/${t.wineId}` as any) : undefined)}
            onLongPress={() => tileLongPress(t)}
            delayLongPress={400}
            activeOpacity={t.onTap || t.wineId ? 0.85 : 1}
          >
            {t.thumbWine ? (
              // Show the actual bottle we're referring to (top-rated grape's wine,
              // the oldest bottle, a wine from the most-collected producer).
              <WineCardThumb path={t.thumbWine.label_image_path} producer={t.thumbWine.producer} wineName={t.thumbWine.wine_name} fallbackText={t.title} />
            ) : (
              <View style={styles.factBox}>
                <Ionicons name={t.icon} size={30} color={colors.gold} />
                <Text style={t.valueSmall ? styles.factBlurb : styles.factValue} numberOfLines={t.valueSmall ? 4 : 2}>{t.value}</Text>
              </View>
            )}
            <Text style={styles.cardName} numberOfLines={2}>{t.title}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>{t.meta}</Text>
          </TouchableOpacity>
        ),
      )}
      {fill.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardMeta: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardMetaAlert: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  // Fact tile — same 220×165 footprint as a wine thumbnail so the row aligns.
  factBox: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: 10 },
  factValue: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  // Smaller explanatory text (e.g. what a personality sketch is) that needs to fit a
  // full sentence in the box rather than a single headline value.
  factBlurb: { fontFamily: fonts.bodyRegular, fontSize: 13, lineHeight: 18, color: colors.textMuted, textAlign: 'center', letterSpacing: 0.2 },
  // "Only 1 Left" pill, top-right of the thumbnail — IDENTICAL to the Drink Now
  // "Last Call" stamp: black ground, gold (yellow) text + border.
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(18,11,10,0.82)', borderRadius: 8, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, letterSpacing: 0.3 },
});
