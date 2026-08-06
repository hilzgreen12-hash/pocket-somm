import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { mostRepresentedRegions } from '../../src/utils/wineRegionGroup';
import { foldAccents } from '../../src/utils/wineIdentity';
import { CoteDorMap } from '../../src/components/CoteDorMap';
import coteDorData from '../../assets/maps/cote-dor.data.json';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

function pct(n: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((n / total) * 100)}%`;
}

// Côte d'Or villages, longest name first so "Savigny-lès-Beaune" wins over the
// bare "Beaune" it contains.
const COTE_DOR_VILLAGES = coteDorData.villages
  .map((v) => v.name)
  .sort((a, b) => b.length - a.length);

// Which Côte d'Or village (if any) a cellar wine belongs to — matched on its
// region / appellation / wine name, accent-insensitively.
function villageOf(w: { region?: string | null; appellation?: string | null; wine_name?: string | null }): string | null {
  const hay = foldAccents([w.region, (w as any).appellation, w.wine_name].filter(Boolean).join(' '));
  for (const v of COTE_DOR_VILLAGES) {
    if (hay.includes(foldAccents(v))) return v;
  }
  return null;
}

// Is this grouped region the one the Côte d'Or (Burgundy) map covers?
function isBurgundy(region: string): boolean {
  const r = foldAccents(region).toLowerCase();
  return r.includes('burgundy') || r.includes('bourgogne') || r.includes("cote d'or");
}

// "View In Maps" — top three cellar regions by share; tap one to reveal its map.
// Only Côte d'Or (Burgundy) has a plotted map today; the others reveal a
// placeholder until their atlas ships.
export default function CellarRegionsMapScreen() {
  const { wines } = useCellar();
  const totalWines = wines.length;
  const totalBottles = wines.reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  const top3 = mostRepresentedRegions(wines, 999).slice(0, 3);
  const [expanded, setExpanded] = useState<string | null>(top3.length ? top3[0][0] : null);

  // Group the user's Côte d'Or producers by village for the map overlay.
  const producersByVillage: Record<string, string[]> = {};
  let coteDorWineCount = 0;
  for (const w of wines) {
    const village = villageOf(w);
    if (!village) continue;
    coteDorWineCount += 1;
    const producer = (w.producer || w.wine_name || '').trim();
    if (!producer) continue;
    (producersByVillage[village] ??= []);
    if (!producersByVillage[village].includes(producer)) producersByVillage[village].push(producer);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cellar Regions</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryBar}>
          <Text style={styles.summaryLine}>
            {totalWines} {totalWines === 1 ? 'Wine' : 'Wines'} · {totalBottles} {totalBottles === 1 ? 'Bottle' : 'Bottles'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Top Regions</Text>
          {top3.length === 0 ? (
            <Text style={styles.muted}>No region data yet. Add wines with a region to see them here.</Text>
          ) : (
            top3.map(([region, count]) => {
              const open = expanded === region;
              const hasMap = isBurgundy(region) && coteDorWineCount > 0;
              return (
                <View key={region} style={styles.regionBlock}>
                  <TouchableOpacity style={styles.regionTop} onPress={() => setExpanded(open ? null : region)} activeOpacity={0.7}>
                    <Text style={styles.regionLabel} numberOfLines={1}>{region}</Text>
                    <View style={styles.regionRight}>
                      <Text style={styles.regionPct}>{pct(count, totalBottles)}</Text>
                      <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
                    </View>
                  </TouchableOpacity>
                  {open ? (
                    <View style={styles.mapReveal}>
                      {hasMap ? (
                        <>
                          <CoteDorMap producersByVillage={producersByVillage} />
                          <Text style={styles.mapCaption}>Your Côte d'Or producers, on their villages. Pinch to zoom.</Text>
                        </>
                      ) : (
                        <View style={styles.mapPlaceholder}>
                          <Text style={styles.mapPlaceholderTitle}>{region} map</Text>
                          <Text style={styles.mapPlaceholderBody}>
                            {isBurgundy(region)
                              ? "Add wines from a Côte d'Or (Burgundy) village and they'll plot onto the map here."
                              : `A visual ${region} map is on the way. You hold ${count} ${count === 1 ? 'bottle' : 'bottles'} from ${region}.`}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  back: { fontFamily: fonts.bodyRegular, fontSize: 22, color: colors.gold },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text },
  headerSpacer: { width: 22 },
  content: { paddingBottom: 60 },
  summaryBar: { alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryLine: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  mapCaption: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  mapPlaceholder: { padding: spacing.lg, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', gap: spacing.xs },
  mapPlaceholderTitle: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  mapPlaceholderBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  sectionTitle: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  muted: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 17 },
  // Each top region: a tappable header row that expands to reveal its map.
  regionBlock: { borderTopWidth: 1, borderTopColor: colors.border },
  regionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  regionLabel: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, flexShrink: 1 },
  regionRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  regionPct: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold },
  chevron: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted },
  mapReveal: { paddingBottom: spacing.lg },
});
