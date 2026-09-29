import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { fetchWineIdsWithRemovals } from '../api/cellar';
import { useInsightDismissStore } from '../stores/insightDismissStore';
import { showAlert } from './AppAlert';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard } from './ExamplePlaceholder';
import { wineHeaderLine } from '../utils/wineHeader';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { CellarWine } from '../types/wine';

// Cap on how many "last bottle" tiles show, so a big cellar doesn't create a
// 40-tile strip. Newest additions first.
const LAST_BOTTLE_CAP = 8;
// A grape needs at least this many scored wines for its average to be meaningful.
const MIN_GRAPE_WINES = 2;

// Placeholder tiles shown until the cellar has enough data to surface real ones.
const INSIGHT_EXAMPLES: PlaceholderCard[] = [
  { kind: 'icon', icon: 'sparkles-outline', title: 'Top-Rated Grape', stamp: 'Nebbiolo · avg 94', overlay: 'Your cellar insights appear here' },
  { kind: 'icon', icon: 'time-outline', title: 'Oldest Vintage', stamp: '1998', overlay: 'Your cellar insights appear here' },
  { kind: 'icon', icon: 'trophy-outline', title: 'Most Collected', stamp: 'Guigal · 7 bottles', overlay: 'Your cellar insights appear here' },
];

type Tile =
  | { kind: 'bottle'; key: string; dismissKey: string; wine: CellarWine }
  | { kind: 'fact'; key: string; dismissKey: string; icon: keyof typeof Ionicons.glyphMap; value: string; title: string; meta: string; wineId?: string };

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
  const dset = new Set(dismissed);

  // Last-bottle tiles: at 1 bottle AND drawn down to it (has removal history) —
  // NOT wines simply added as a single. Newest additions first, capped.
  const lastBottles = runningLowWines(wines, new Set(removalIds), dismissed).slice(0, LAST_BOTTLE_CAP);

  // Fact tiles — only included when the data supports them (and not dismissed).
  const facts: Tile[] = [];

  // Top-rated grape by average critic score (needs a few scored wines).
  const grapeAgg = new Map<string, { label: string; sum: number; n: number }>();
  for (const w of wines) {
    const g = (w.grape_variety ?? '').trim();
    if (!g || w.critic_score == null) continue;
    const cur = grapeAgg.get(g.toLowerCase()) ?? { label: g, sum: 0, n: 0 };
    cur.sum += w.critic_score;
    cur.n += 1;
    grapeAgg.set(g.toLowerCase(), cur);
  }
  const topGrape = [...grapeAgg.values()]
    .filter((x) => x.n >= MIN_GRAPE_WINES)
    .map((x) => ({ label: x.label, avg: Math.round(x.sum / x.n) }))
    .sort((a, b) => b.avg - a.avg)[0];
  if (topGrape && !dset.has('fact:grape')) {
    facts.push({ kind: 'fact', key: 'grape', dismissKey: 'fact:grape', icon: 'sparkles-outline', value: topGrape.label, title: 'Top-Rated Grape', meta: `Avg ${topGrape.avg}` });
  }

  // Oldest vintage in the cellar (vintage is stored as a string).
  const vintaged = wines
    .map((w) => ({ w, y: w.vintage ? parseInt(w.vintage, 10) : NaN }))
    .filter((x) => Number.isFinite(x.y) && x.y > 1900);
  const oldest = vintaged.length ? vintaged.reduce((m, x) => (x.y < m.y ? x : m)) : null;
  if (oldest && !dset.has('fact:vintage')) {
    facts.push({
      kind: 'fact', key: 'vintage', dismissKey: 'fact:vintage', icon: 'time-outline', value: String(oldest.y), title: 'Oldest Vintage',
      meta: [oldest.w.producer, oldest.w.wine_name].filter(Boolean).join(' ') || 'In your cellar',
      wineId: oldest.w.id,
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
  if (topProducer && topProducer.bottles >= 2 && !dset.has('fact:producer')) {
    facts.push({ kind: 'fact', key: 'producer', dismissKey: 'fact:producer', icon: 'trophy-outline', value: topProducer.label, title: 'Most Collected', meta: `${topProducer.bottles} bottles` });
  }

  // Last-bottle tiles first (actionable), then the facts.
  const tiles: Tile[] = [
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
            onPress={t.wineId ? () => router.push(`/cellar/${t.wineId}` as any) : undefined}
            onLongPress={() => tileLongPress(t)}
            delayLongPress={400}
            activeOpacity={t.wineId ? 0.85 : 1}
          >
            <View style={styles.factBox}>
              <Ionicons name={t.icon} size={30} color={colors.gold} />
              <Text style={styles.factValue} numberOfLines={2}>{t.value}</Text>
            </View>
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
  // "Only 1 Left" pill, top-right of the thumbnail — IDENTICAL to the Drink Now
  // "Last Call" stamp: black ground, gold (yellow) text + border.
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(18,11,10,0.82)', borderRadius: 8, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, letterSpacing: 0.3 },
});
