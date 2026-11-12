import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useRunningLowWines } from '../../src/components/DrinkNowCarousel';
import { WineCardThumb } from '../../src/components/WineCardThumb';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { tidyWineRegion } from '../../src/utils/regionFormat';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Running Low — cellar wines (home and external storage) nearly drunk down: bought 6+ bottles deep and
// down to 2 or fewer, or bought 5 or fewer deep and down to the last bottle.
// Opened from the Running Low tile in Cellar Insights.
export default function RunningLowScreen() {
  const wines = useRunningLowWines();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingTop: 56, paddingBottom: 60 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text accessibilityLabel="Back" style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Running Low</Text>
          <Text style={styles.count}>{wines.length} {wines.length === 1 ? 'Wine' : 'Wines'}</Text>
          <Text style={styles.subtitle}>Wines you've nearly drunk your way through: two or fewer left from six or more, or the last bottle from five or fewer.</Text>
        </View>

        <View style={styles.body}>
          {wines.length === 0 ? (
            <Text style={styles.empty}>Nothing is running low. Wines appear here as you drink them down.</Text>
          ) : wines.map(({ wine: w, left, started }) => (
            <TouchableOpacity key={w.id} style={styles.row} onPress={() => router.push(`/cellar/${w.id}` as any)} activeOpacity={0.8}>
              <WineCardThumb compact path={w.label_image_path} producer={w.producer} wineName={w.wine_name} fallbackText={w.wine_name} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                {tidyWineRegion(w.region) ? <Text style={styles.meta} numberOfLines={1}>{tidyWineRegion(w.region)}</Text> : null}
                <Text style={styles.left}>{left} {left === 1 ? 'bottle' : 'bottles'} left</Text>
                <Text style={styles.started}>of {started} {started === 1 ? 'bottle' : 'bottles'}</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  backArrow: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, alignItems: 'center' },
  title: { fontFamily: fonts.headingSemibold, fontSize: 34, color: '#FFFFFF', textAlign: 'center' },
  count: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, marginTop: spacing.xs },
  subtitle: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  body: { paddingHorizontal: spacing.xl },
  empty: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  thumb: { width: 80, height: 60, borderRadius: 8 },
  name: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  left: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, marginTop: 4 },
  started: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  chev: { fontSize: 22, color: colors.gold },
});
