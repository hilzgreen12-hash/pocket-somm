import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { fetchStorageLocations } from '../api/storageLocations';
import { fetchPlacementsForWines } from '../api/placements';
import { getArchivedWines } from '../api/cellar';
import { wineNameKey } from '../utils/wineIdentity';
import { effectiveMaturity } from '../utils/maturity';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard } from './ExamplePlaceholder';
import { wineHeaderLine } from '../utils/wineHeader';
import type { CellarWine } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Example cards shown when the cellar has nothing to surface yet.
const CELLAR_EXAMPLES: PlaceholderCard[] = [
  { kind: 'label', producer: 'Charles Heidsieck', wineName: 'Brut Vintage', title: 'Charles Heidsieck 1995', stamp: 'Last Call · final year', overlay: 'Cellar Insights appear here as you use Vinster' },
  { kind: 'label', producer: "Dow's", wineName: 'Vintage Port', title: "Dow's 1994", stamp: 'Running Low · 1 left', overlay: 'Cellar Insights appear here as you use Vinster' },
  { kind: 'label', producer: 'Giacomo Conterno', wineName: 'Monfortino', title: 'Conterno 2010', stamp: 'Top Rated · 98 pts', overlay: 'Cellar Insights appear here as you use Vinster' },
];

// Last Call now = drinkable now AND the window closes within the next 3 years
// (or has already closed) — the bottles to open soonest.
const LAST_CALL_HORIZON = 3;
const RUNNING_LOW_MAX = 2;

function isLastCall(w: CellarWine, nowYear: number): boolean {
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

function buildCellarInsights(wines: CellarWine[], archivedKeys?: Set<string> | null): InsightTile[] {
  const nowYear = new Date().getFullYear();
  const owned = wines.filter((w) => (w.quantity ?? 0) > 0);
  const tiles: InsightTile[] = [];
  const used = new Set<string>();
  const add = (w: CellarWine | undefined, badge: string, meta: string) => {
    if (w && !used.has(w.id)) { used.add(w.id); tiles.push({ wine: w, badge, meta }); }
  };

  // Last Call — most urgent (soonest close) first.
  owned.filter((w) => isLastCall(w, nowYear))
    .sort((a, b) => (a.drinking_window_to ?? 9999) - (b.drinking_window_to ?? 9999))
    .forEach((w) => {
      const to = w.drinking_window_to as number;
      add(w, 'Last Call', to < nowYear ? `Drink now · past ${to}` : to === nowYear ? 'Drink now · final year' : `Drink by ${to}`);
    });

  // Running Low — fewest bottles first. Only for wines that were once better
  // stocked: require at least one bottle of that wine in the archive (i.e. it's
  // genuinely been drunk DOWN), so a wine you only ever owned one of isn't tagged
  // "running low". When archivedKeys is absent (back-compat count) the gate is off.
  owned.filter((w) => (w.quantity ?? 0) <= RUNNING_LOW_MAX && (!archivedKeys || archivedKeys.has(rlKey(w))))
    .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0))
    .forEach((w) => add(w, 'Running Low', `${w.quantity} bottle${w.quantity === 1 ? '' : 's'} left`));

  // Highest-scored wine.
  const topRated = owned.filter((w) => w.critic_score != null)
    .sort((a, b) => (b.critic_score ?? 0) - (a.critic_score ?? 0))[0];
  if (topRated) add(topRated, 'Top Rated', `${topRated.critic_score} pts`);

  // Most-collected wine (only meaningful at 2+ bottles).
  const mostCollected = [...owned].sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0))[0];
  if (mostCollected && (mostCollected.quantity ?? 0) >= 2) add(mostCollected, 'Most Collected', `${mostCollected.quantity} bottles`);

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
  return { total: buildCellarInsights(wines).length, lastCall: lc };
}

// "Your Cellar Insights" — Last Call / Running Low / Top Rated / Most Collected /
// Oldest Vintage, each a badged wine tile. Tap → the wine card.
export function DrinkNowCarousel() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { wines } = useCellar();
  // Home Cellar Insights: exclude wines that live ONLY in an external/offsite
  // cellar — this carousel is about the stock you keep at home.
  const { data: locations = [] } = useQuery({
    queryKey: ['cellar-locations-ext', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });
  const externalIds = new Set(locations.filter((l) => l.is_external).map((l) => l.id));
  const wineIds = wines.map((w) => w.id);
  const { data: placements = [] } = useQuery({
    queryKey: ['home-insights-placements', userId, wineIds.length],
    queryFn: () => fetchPlacementsForWines(wineIds),
    enabled: !!userId && wineIds.length > 0 && externalIds.size > 0,
  });
  const extByWine = new Map<string, number>();
  for (const p of placements) {
    if (p.kind === 'location' && p.storage_location_id && externalIds.has(p.storage_location_id)) {
      extByWine.set(p.cellar_wine_id, (extByWine.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
    }
  }
  const homeWines = externalIds.size === 0 ? wines : wines.filter((w) => {
    const ext = extByWine.get(w.id) ?? 0;
    // Legacy single-location filing straight on the row.
    if (!!w.storage_location_id && externalIds.has(w.storage_location_id) && ext === 0) return false;
    return (w.quantity ?? 0) - ext > 0; // at least one home/loose bottle
  });
  // Archive identities, so "Running Low" only tags wines actually drunk down.
  const { data: archived = [] } = useQuery({
    queryKey: ['archived-wines', userId],
    queryFn: () => getArchivedWines(userId!),
    enabled: !!userId,
  });
  const archivedKeys = new Set(archived.map(rlKey));
  const tiles = buildCellarInsights(homeWines, archivedKeys);
  const fill = tiles.length < CELLAR_EXAMPLES.length ? CELLAR_EXAMPLES.slice(tiles.length) : [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {tiles.map(({ wine: w, badge, meta }) => (
        <TouchableOpacity key={`${w.id}-${badge}`} style={styles.card} onPress={() => router.push(`/cellar/${w.id}` as any)} activeOpacity={0.85}>
          <View>
            <WineCardThumb path={w.label_image_path} producer={w.producer} wineName={w.wine_name} fallbackText={w.wine_name} />
            <View style={styles.badge}><Text style={styles.badgeText} allowFontScaling={false}>{badge}</Text></View>
          </View>
          <Text style={styles.cardName} numberOfLines={2} allowFontScaling={false}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
          <Text style={styles.cardMeta} numberOfLines={1} allowFontScaling={false}>{meta}</Text>
        </TouchableOpacity>
      ))}
      {fill.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardMeta: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  // Gold-on-black pill, top-right of the thumbnail — labels which insight this is.
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(18,11,10,0.82)', borderRadius: 8, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, letterSpacing: 0.3 },
});
