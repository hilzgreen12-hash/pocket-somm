import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { getArchivedWines } from '../api/cellar';
import { wineNameKey } from '../utils/wineIdentity';
import { effectiveMaturity } from '../utils/maturity';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard, NAMED_LABELS } from './ExamplePlaceholder';
import { wineHeaderLine } from '../utils/wineHeader';
import type { CellarWine } from '../types/wine';
import { HOME_TILE, colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import { mostRepresentedRegions, baseRegionGroup } from '../utils/wineRegionGroup';
import { formatCurrency } from '../constants/currency';

// Example cards shown when the cellar has nothing to surface yet.
const CELLAR_EXAMPLES: PlaceholderCard[] = [
  { kind: 'labelCollage', images: [NAMED_LABELS.gruaudLarose], title: 'Château Gruaud-Larose 1979', stamp: 'Last Call · final year', overlay: 'Cellar Insights appear here as you use Vinster' },
  { kind: 'labelCollage', images: [NAMED_LABELS.tollotBeaut], title: 'Tollot-Beaut Beaune-Grèves 2020', stamp: 'Running Low · 1 left', overlay: 'Cellar Insights appear here as you use Vinster' },
  { kind: 'labelCollage', images: [NAMED_LABELS.munjebel], title: 'Cornelissen Munjebel CS 2016', stamp: 'Top Rated · by you', overlay: 'Cellar Insights appear here as you use Vinster' },
];

// Last Call = drinkable now AND no more than 2 years left in the drinking
// window (or it has already closed) — the bottles to open soonest. A wine with
// more than two years left is never Last Call.
const LAST_CALL_HORIZON = 2;
// Running Low: a wine bought 6+ bottles deep is flagged at 2 or fewer left;
// one bought 5 or fewer deep is flagged at its last bottle. Either way it must
// have been drunk down (a bottle in the archive) — a one-off single bottle
// isn't "running low".
const RUNNING_LOW_BIG_START = 6;
const RUNNING_LOW_BIG_LEFT = 2;

export function isLastCall(w: CellarWine, nowYear: number = new Date().getFullYear()): boolean {
  // Spirits don't mature — never surface them as Last Call / peak-now.
  if (w.is_spirit) return false;
  const to = w.drinking_window_to;
  if (to == null) return false;
  if (to > nowYear + LAST_CALL_HORIZON) return false;
  const status = effectiveMaturity(w);
  return status === 'peak' || status === 'declining';
}

type InsightTile = { wine: CellarWine; badge: string; meta: string };

// Build the "Your Cellar Insights" tiles: Last Call, then Running Low, then the
// three cellar facts (top-rated, most-collected, oldest). Deduped by wine so a
// bottle only appears once, under its highest-priority badge.
// Identity key for the archive cross-reference (producer+name + vintage).
const rlKey = (w: CellarWine) => `${wineNameKey(w.producer, w.wine_name)}|${(w.vintage ?? '').toString().trim()}`;

function buildCellarInsights(wines: CellarWine[]): InsightTile[] {
  const owned = wines.filter((w) => (w.quantity ?? 0) > 0);
  const tiles: InsightTile[] = [];
  const used = new Set<string>();
  const add = (w: CellarWine | undefined, badge: string, meta: string) => {
    if (w && !used.has(w.id)) { used.add(w.id); tiles.push({ wine: w, badge, meta }); }
  };

  // Last Call wines are grouped into ONE tile (see DrinkNowCarousel), not one
  // tile each.

  // Running Low wines are grouped into ONE tile too (see DrinkNowCarousel).

  // Highest-scored wine.
  const topRated = owned.filter((w) => w.critic_score != null)
    .sort((a, b) => (b.critic_score ?? 0) - (a.critic_score ?? 0))[0];
  if (topRated) add(topRated, 'Top Rated', `${topRated.critic_score} pts`);

  // Most Collected is now a REGION tile (see DrinkNowCarousel).

  // Oldest vintage.
  const oldest = owned.filter((w) => w.vintage && /^\d{4}$/.test(String(w.vintage)))
    .sort((a, b) => parseInt(String(a.vintage), 10) - parseInt(String(b.vintage), 10))[0];
  if (oldest) add(oldest, 'Oldest Vintage', String(oldest.vintage));

  return tiles;
}

// Back-compat: index.tsx used to read counts for the (now-removed) stats line.
export function useDrinkNowCounts(): { total: number; lastCall: number } {
  const { wines } = useCellar();
  const nowYear = new Date().getFullYear();
  const lc = wines.filter((w) => (w.quantity ?? 0) > 0 && isLastCall(w, nowYear)).length;
  return { total: buildCellarInsights(wines).length + (lc > 0 ? 1 : 0), lastCall: lc };
}

// The cellar wines Cellar Insights looks at: the whole cellar, including wines
// kept in external storage.
function useInsightWines(): { cellarWines: CellarWine[]; archived: CellarWine[] } {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { wines: cellarWines } = useCellar();
  // Archived bottles (each removal is saved as an archived row), so Running Low
  // knows how many bottles of a wine there were to begin with.
  const { data: archived = [] } = useQuery({
    queryKey: ['archived-wines', userId],
    queryFn: () => getArchivedWines(userId!),
    enabled: !!userId,
  });
  return { cellarWines, archived };
}

export type RunningLowWine = { wine: CellarWine; left: number; started: number };

// Running Low wines in the cellar, fewest bottles left first. Bottles are
// counted per wine + vintage across cellar rows; "started" = bottles now plus
// bottles archived (drunk or removed).
function runningLowFrom(cellarWines: CellarWine[], archived: CellarWine[]): RunningLowWine[] {
  const archivedQty = new Map<string, number>();
  for (const a of archived) archivedQty.set(rlKey(a), (archivedQty.get(rlKey(a)) ?? 0) + Math.max(0, a.quantity ?? 0));
  const groups = new Map<string, { wine: CellarWine; left: number }>();
  for (const w of cellarWines) {
    const q = w.quantity ?? 0;
    if (q <= 0 || w.is_spirit) continue;
    const k = rlKey(w);
    const g = groups.get(k);
    if (!g) groups.set(k, { wine: w, left: q });
    else { g.left += q; if (q > (g.wine.quantity ?? 0)) g.wine = w; }
  }
  const out: RunningLowWine[] = [];
  for (const [k, g] of groups) {
    const drunk = archivedQty.get(k) ?? 0;
    if (drunk === 0) continue;
    const started = g.left + drunk;
    const low = started >= RUNNING_LOW_BIG_START ? g.left <= RUNNING_LOW_BIG_LEFT : g.left === 1;
    if (low) out.push({ wine: g.wine, left: g.left, started });
  }
  return out.sort((a, b) => a.left - b.left || b.started - a.started);
}

export function useRunningLowWines(): RunningLowWine[] {
  const { cellarWines, archived } = useInsightWines();
  return runningLowFrom(cellarWines, archived);
}

// Last Call wines in the cellar, most urgent (soonest window close) first.
// Shared by the Last Call tile and its list screen so the count always matches.
export function useLastCallWines(): CellarWine[] {
  return lastCallFrom(useInsightWines().cellarWines);
}
function lastCallFrom(cellarWines: CellarWine[]): CellarWine[] {
  const nowYear = new Date().getFullYear();
  return cellarWines
    .filter((w) => (w.quantity ?? 0) > 0 && isLastCall(w, nowYear))
    .sort((a, b) => (a.drinking_window_to ?? 9999) - (b.drinking_window_to ?? 9999));
}

// Cellar Insights — group tiles (Last Call, Running Low, Most Collected region,
// Cellar Stats), then the Top Rated and Oldest Vintage wine tiles (tap → card).
export function DrinkNowCarousel() {
  const { cellarWines, archived } = useInsightWines();
  const lastCall = lastCallFrom(cellarWines);
  const runningLow = runningLowFrom(cellarWines, archived);
  const tiles = buildCellarInsights(cellarWines);
  const owned = cellarWines.filter((w) => (w.quantity ?? 0) > 0);

  // Most Collected: the region (Burgundy, Tuscany… as in Cellar Statistics)
  // with the most bottles, and that region's best-stocked wines as the picture.
  const [topRegion, regionBottles] = mostRepresentedRegions(owned, 1)[0] ?? [null, 0];
  const regionWines = topRegion
    ? owned.filter((w) => baseRegionGroup(w.region) === topRegion).sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0))
    : [];

  // Cellar Stats: total bottles and estimated value (same sums as Cellar
  // Statistics; one total per currency), the most valuable labels as the picture.
  const totalBottles = owned.reduce((n, w) => n + (w.quantity ?? 0), 0);
  const valueByCurrency: Record<string, number> = {};
  for (const w of owned) {
    if (w.estimated_value == null) continue;
    const code = (w.estimated_value_currency ?? 'GBP').toUpperCase();
    valueByCurrency[code] = (valueByCurrency[code] ?? 0) + Number(w.estimated_value) * (w.quantity ?? 0);
  }
  const valueText = Object.entries(valueByCurrency).map(([code, amt]) => formatCurrency(amt, code, { decimals: 2 })).join(' · ');
  const valuable = [...owned].filter((w) => w.estimated_value != null).sort((a, b) => Number(b.estimated_value) - Number(a.estimated_value));
  const statsPicture = valuable.length ? valuable : owned;

  // Examples only before there's anything real to show — never beside real tiles.
  const fill = owned.length === 0 ? CELLAR_EXAMPLES : [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {lastCall.length > 0 ? (
        <GroupTile title="Last Call, Drink Now" wines={lastCall} onPress={() => router.push('/cellar/last-call' as any)} />
      ) : null}
      {runningLow.length > 0 ? (
        <GroupTile title="Running Low" wines={runningLow.map((r) => r.wine)} onPress={() => router.push('/cellar/running-low' as any)} />
      ) : null}
      {topRegion && regionBottles > 0 ? (
        <GroupTile
          title={`Most Collected · ${topRegion}`}
          sub={`${regionBottles} ${regionBottles === 1 ? 'Bottle' : 'Bottles'}`}
          wines={regionWines}
          onPress={() => router.push('/cellar/regions-map' as any)}
        />
      ) : null}
      {owned.length > 0 ? (
        // Not tappable — a summary only.
        <GroupTile
          title="Cellar Stats"
          sub={`${totalBottles} ${totalBottles === 1 ? 'Bottle' : 'Bottles'}${valueText ? ` · ${valueText}` : ''}`}
          wines={statsPicture}
        />
      ) : null}
      {tiles.map(({ wine: w, badge, meta }) => (
        <TouchableOpacity key={`${w.id}-${badge}`} style={styles.card} onPress={() => router.push(`/cellar/${w.id}` as any)} activeOpacity={0.85}>
          <WineCardThumb compact path={w.label_image_path} producer={w.producer} wineName={w.wine_name} fallbackText={w.wine_name} />
          <Text style={styles.cardName} numberOfLines={2} allowFontScaling={false}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
          {/* The insight (Running Low, Top Rated…) now leads the gold line —
              the title overlay on the picture is gone. */}
          <Text style={styles.cardMeta} numberOfLines={1} allowFontScaling={false}>{badge} · {meta}</Text>
        </TouchableOpacity>
      ))}
      {fill.map((c, i) => <PlaceholderCardView compact key={`ph-${i}`} card={c} />)}
    </ScrollView>
  );
}

// One tile standing for a group of wines (Last Call, Running Low, Most
// Collected, Cellar Stats): up to four labels as the picture, the title in
// white, then a gold line — "X Wines · View All" unless `sub` is given. Without
// onPress the tile isn't tappable.
function GroupTile({ title, sub, wines, onPress }: { title: string; sub?: string; wines: CellarWine[]; onPress?: () => void }) {
  const collage = wines.slice(0, wines.length >= 4 ? 4 : Math.min(2, wines.length));
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress} activeOpacity={0.85}>
      <View style={styles.collage}>
        {collage.map((w) => (
          <WineCardThumb
            key={w.id}
            compact
            path={w.label_image_path}
            producer={w.producer}
            wineName={w.wine_name}
            fallbackText={w.wine_name}
            style={collage.length === 1 ? styles.cellFull : collage.length === 2 ? styles.cellHalf : styles.cellQuarter}
          />
        ))}
      </View>
      <Text style={styles.cardName} numberOfLines={1} allowFontScaling={false}>{title}</Text>
      <Text style={styles.cardCount} numberOfLines={1} allowFontScaling={false}>{sub ?? `${wines.length} ${wines.length === 1 ? 'Wine' : 'Wines'} · View All`}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // No bottom padding: the separator below sits 18pt under the last caption line.
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md },
  card: { width: HOME_TILE.w },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardMeta: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  // Last Call tile: gold count line, not in capitals.
  cardCount: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2 },
  // Last Call picture: up to four labels inside one white-outlined tile.
  collage: { width: HOME_TILE.w, height: HOME_TILE.h, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, overflow: 'hidden', flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface },
  cellFull: { width: '100%', height: '100%', borderWidth: 0, borderRadius: 0 },
  cellHalf: { width: '50%', height: '100%', borderWidth: 0, borderRadius: 0 },
  cellQuarter: { width: '50%', height: '50%', borderWidth: 0, borderRadius: 0 },
});
