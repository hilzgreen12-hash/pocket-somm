import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useLabelImageUrl } from '../hooks/useLabelImageUrl';
import { useLastIntelStore } from '../stores/lastIntelStore';
import { useLabelStore } from '../stores/labelStore';
import { useScanStore } from '../stores/scanStore';
import { useScanHistory } from '../hooks/useScanHistory';
import { formatWineTitle } from '../utils/wineTitle';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A unified "recent scan" — either a single-bottle label→intel scan or a wine-
// list scan — merged by recency for the Discover tab carousel.
type Recent =
  | { kind: 'label'; ts: number; title: string; stamp: string; imageUri: string | null; open: () => void }
  | { kind: 'list'; ts: number; title: string; stamp: string; path: string | null; open: () => void };

// Shared date format for the "date · location" stamp beneath each thumbnail.
function stampDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RecentCard({ item }: { item: Recent }) {
  // Label scans carry a local file:// photo; list scans carry a storage path.
  const resolved = useLabelImageUrl(item.kind === 'list' ? item.path : null);
  const uri = item.kind === 'label' ? item.imageUri : resolved;
  return (
    <TouchableOpacity style={styles.card} onPress={item.open} activeOpacity={0.85}>
      <View style={styles.thumb}>
        {uri ? (
          <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
        ) : (
          <Text style={styles.thumbFallback} numberOfLines={3}>{item.title}</Text>
        )}
      </View>
      <Text style={styles.cardName} numberOfLines={2}>{item.title}</Text>
      {item.stamp ? <Text style={styles.cardStamp} numberOfLines={1}>{item.stamp}</Text> : null}
    </TouchableOpacity>
  );
}

export function RecentScansCarousel() {
  const recent = useLastIntelStore((s) => s.recent);
  const { archive } = useScanHistory();

  const labelItems: Recent[] = recent.map((r) => ({
    kind: 'label',
    ts: r.ts,
    title: formatWineTitle({ producer: r.wine.producer, wineName: r.wine.wineName, vintage: r.wine.vintage }),
    stamp: [stampDate(new Date(r.ts)), (r.wine.region ?? '').trim()].filter(Boolean).join(' · '),
    imageUri: r.imageUri,
    open: () => {
      const ls = useLabelStore.getState();
      ls.setWineDetailsConfirmed(r.wine);
      ls.setIntelligence(r.intel);
      ls.setImageUri(r.imageUri ?? null);
      router.push('/label/results?context=intel');
    },
  }));

  // Only genuine wine-list scans (they extracted wines) — a pure restaurant
  // review has none and belongs in Recent Reviews, not Recent Scans.
  const listItems: Recent[] = archive.filter((a) => (a.extractedWines?.length ?? 0) > 0).map((a) => {
    const d = a.capturedAt ? new Date(a.capturedAt) : null;
    const dateStr = d ? stampDate(d) : '';
    return {
      kind: 'list' as const,
      ts: a.capturedAt ? new Date(a.capturedAt).getTime() : 0,
      title: a.restaurantName?.trim() || 'Wine list',
      stamp: [dateStr, a.city?.trim()].filter(Boolean).join(' · '),
      path: a.restaurantPhotoPath,
      open: () => {
        const ss = useScanStore.getState();
        ss.setExtractedWines(a.extractedWines);
        ss.setRecommendation(a.recommendation);
        const params = new URLSearchParams({ fromHistory: 'true' });
        if (a.id) params.set('sessionId', a.id);
        if (a.restaurantName) params.set('restaurant', a.restaurantName);
        if (a.city) params.set('city', a.city);
        if (a.capturedAt) params.set('date', a.capturedAt);
        router.push(`/scan/results?${params.toString()}`);
      },
    };
  });

  const merged = [...labelItems, ...listItems].sort((a, b) => b.ts - a.ts).slice(0, 12);

  if (merged.length === 0) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        <View style={[styles.card, styles.emptyCard]}>
          <Text style={styles.emptyText}>Scan a label or a wine list — your recent scans appear here.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {merged.map((item, i) => <RecentCard key={`${item.kind}-${i}`} item={item} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  thumb: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: spacing.sm },
  thumbImg: { width: '100%', height: '100%' },
  thumbFallback: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textAlign: 'center' },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  emptyCard: { height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderWhite, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
