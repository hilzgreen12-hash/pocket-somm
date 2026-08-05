import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { mostRepresentedRegions } from '../../src/utils/wineRegionGroup';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

function pct(n: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((n / total) * 100)}%`;
}

// "View In Maps" — the home for the cellar region map. The full visual/atlas map
// is still to come; for now this shows the complete region breakdown (the data
// the map will draw from) so the entry point is live and useful.
export default function CellarRegionsMapScreen() {
  const { wines } = useCellar();
  const totalWines = wines.length;
  const totalBottles = wines.reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  const regions = mostRepresentedRegions(wines, 999);
  const topCount = regions.length ? regions[0][1] : 0;

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

        {/* The visual map is on its way — this panel is where it will live. */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderTitle}>Region map coming soon</Text>
          <Text style={styles.mapPlaceholderBody}>
            A visual map of the wine regions in your cellar is on its way. For now, here's the full breakdown by share of your bottles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Regions</Text>
          {regions.length === 0 ? (
            <Text style={styles.muted}>No region data yet. Add wines with a region to see them here.</Text>
          ) : (
            regions.map(([region, count]) => (
              <View key={region} style={styles.regionRow}>
                <View style={styles.regionTop}>
                  <Text style={styles.regionLabel} numberOfLines={1}>{region}</Text>
                  <Text style={styles.regionPct}>{pct(count, totalBottles)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${topCount ? Math.max(4, (count / topCount) * 100) : 0}%` }]} />
                </View>
                <Text style={styles.regionCount}>{count} {count === 1 ? 'bottle' : 'bottles'}</Text>
              </View>
            ))
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
  mapPlaceholder: { margin: spacing.xl, padding: spacing.lg, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', gap: spacing.xs },
  mapPlaceholderTitle: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  mapPlaceholderBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  section: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  sectionTitle: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  muted: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 17 },
  regionRow: { marginBottom: spacing.md },
  regionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  regionLabel: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, flexShrink: 1 },
  regionPct: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, marginLeft: spacing.md },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, marginTop: 6, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  regionCount: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 3 },
});
