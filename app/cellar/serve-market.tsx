import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useCellar } from '../../src/hooks/useCellar';
import { usePreferences } from '../../src/hooks/usePreferences';
import { suggestMarketStyles } from '../../src/api/wineExtras';
import type { CellarWine } from '../../src/types/wine';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Wine card → Serve → Drink Before / After, when nothing suitable is in the
// cellar: three wine styles to buy from the wider market, each justified and
// with a price range.
export default function ServeMarketScreen() {
  // wineId for a cellar wine; or the wine's identity (sp/sw/sr/sv/sg) from a
  // Wine Intel screen, where the bottle isn't in the cellar.
  const { wineId, slot, suggested, sp, sw, sr, sv, sg } = useLocalSearchParams<{ wineId?: string; slot?: string; suggested?: string; sp?: string; sw?: string; sr?: string; sv?: string; sg?: string }>();
  const { wines } = useCellar();
  const { preferences } = usePreferences();
  const wine = wines.find((w) => w.id === wineId)
    ?? (sp || sw ? ({ id: 'intel', producer: sp ?? null, wine_name: sw ?? sp ?? '', region: sr ?? null, vintage: sv ?? null, grape_variety: sg ?? null, style: null } as unknown as CellarWine) : null);
  const when: 'before' | 'after' = slot === 'after' ? 'after' : 'before';
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const wineLabel = wine ? [wine.producer, wine.wine_name !== wine.producer ? wine.wine_name : null, wine.vintage].filter(Boolean).join(' ') : '';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['serve-market', wineId, when, suggested, currency],
    enabled: !!wine,
    staleTime: Infinity,
    queryFn: () => suggestMarketStyles(wine!, when, suggested ?? '', currency),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ width: 44 }} accessibilityLabel="Back">
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{when === 'before' ? 'Drink Before' : 'Drink After'}</Text>
        <View style={{ width: 44 }} />
      </View>
      <Text style={styles.blurb}>Three styles to look for{wineLabel ? `, to serve ${when} your ${wineLabel}` : ''}.</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {isLoading || !wine ? (
          <View style={styles.loading}><ActivityIndicator color={colors.gold} /><Text style={styles.loadingText}>Vinster is choosing three styles…</Text></View>
        ) : isError || !data?.length ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Vinster couldn't suggest styles just now.</Text>
            <TouchableOpacity onPress={() => void refetch()} activeOpacity={0.7}><Text style={styles.link}>Try again</Text></TouchableOpacity>
          </View>
        ) : data.map((s, i) => (
          <View key={`${s.style}-${i}`} style={styles.card}>
            <Text style={styles.rank}>{i === 0 ? 'Best choice' : i === 1 ? 'Also great' : 'Another option'}</Text>
            <Text style={styles.style}>{s.style}</Text>
            {s.priceRange ? <Text style={styles.price}>{s.priceRange} a bottle</Text> : null}
            {s.reason ? <Text style={styles.reason}>{s.reason}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.5 },
  blurb: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.md, lineHeight: 22 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 60, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, gap: 6 },
  rank: { fontFamily: fonts.bodyRegular, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },
  style: { fontFamily: fonts.headingBold, fontSize: 19, color: colors.gold },
  price: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  reason: { fontFamily: fonts.bodyRegular, fontSize: 14.5, lineHeight: 22, color: colors.text },
  loading: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl },
  loadingText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  link: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
