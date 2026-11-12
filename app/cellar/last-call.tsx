import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useLastCallWines } from '../../src/components/DrinkNowCarousel';
import { WineCardThumb } from '../../src/components/WineCardThumb';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { tidyWineRegion } from '../../src/utils/regionFormat';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Last Call, Drink Now — every home-cellar wine with no more than two years
// left in its drinking window (or already past it), most urgent first. Opened
// from the Last Call tile in Home Cellar Insights.
export default function LastCallScreen() {
  const wines = useLastCallWines();
  const nowYear = new Date().getFullYear();

  const urgency = (to: number) =>
    to < nowYear ? `Past its window since ${to}` : to === nowYear ? 'Final year' : `Drink by ${to}`;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingTop: 56, paddingBottom: 60 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text accessibilityLabel="Back" style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Last Call, Drink Now</Text>
          <Text style={styles.count}>{wines.length} {wines.length === 1 ? 'Wine' : 'Wines'}</Text>
          <Text style={styles.subtitle}>Wines in your home cellar with two years or less left in their drinking window, most urgent first.</Text>
        </View>

        <View style={styles.body}>
          {wines.length === 0 ? (
            <Text style={styles.empty}>Nothing needs drinking urgently. Wines appear here once they have two years or less left in their drinking window.</Text>
          ) : wines.map((w) => (
            <TouchableOpacity key={w.id} style={styles.row} onPress={() => router.push(`/cellar/${w.id}` as any)} activeOpacity={0.8}>
              <WineCardThumb compact path={w.label_image_path} producer={w.producer} wineName={w.wine_name} fallbackText={w.wine_name} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                {tidyWineRegion(w.region) ? <Text style={styles.meta} numberOfLines={1}>{tidyWineRegion(w.region)}</Text> : null}
                <Text style={styles.window}>
                  Drinking window {w.drinking_window_from ? `${w.drinking_window_from}–` : 'until '}{w.drinking_window_to}
                </Text>
                <Text style={styles.urgency}>
                  {urgency(w.drinking_window_to as number)} · {w.quantity} {w.quantity === 1 ? 'bottle' : 'bottles'}
                </Text>
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
  window: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.text, marginTop: 4 },
  urgency: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.gold, marginTop: 2 },
  chev: { fontSize: 22, color: colors.gold },
});
