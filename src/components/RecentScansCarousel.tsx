import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { WineCardThumb } from './WineCardThumb';
import { RecentScansPlaceholder } from './RecentScansPlaceholder';
import { useLastIntelStore } from '../stores/lastIntelStore';
import { useLabelStore } from '../stores/labelStore';
import { useScanStore } from '../stores/scanStore';
import { useScanHistory, type ScanArchiveItem } from '../hooks/useScanHistory';
import { formatWineTitle } from '../utils/wineTitle';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A unified "recent scan" — either a single-bottle label→intel scan or a wine-
// list scan — merged by recency for the Discover tab carousel.
type Recent =
  | { kind: 'label'; ts: number; title: string; stamp: string; imageUri: string | null; producer: string | null; wineName: string | null; open: () => void }
  | { kind: 'list'; ts: number; title: string; stamp: string; path: string | null; open: () => void };

// Shared date format for the "date · location" stamp beneath each thumbnail.
function stampDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// A session the user has RATED or noted is a restaurant review — it belongs in
// Recent Reviews, not Recent Scans (even though it may also carry a scanned list).
function restaurantReviewed(a: ScanArchiveItem): boolean {
  return !!(
    a.ratingOverall != null || a.ratingFood != null || a.ratingService != null ||
    a.ratingWineList != null || a.ratingAtmosphere != null || a.ratingValue != null ||
    (a.restaurantNote && a.restaurantNote.trim())
  );
}

// Totals for the "XX Wine Labels · XX Wine Lists" stats line under the header.
export function useRecentScanCounts(): { labels: number; lists: number } {
  const recent = useLastIntelStore((s) => s.recent);
  const { archive } = useScanHistory();
  const labels = recent.length;
  const lists = archive.filter((a) => (a.extractedWines?.length ?? 0) > 0 && !restaurantReviewed(a)).length;
  return { labels, lists };
}

function RecentCard({ item }: { item: Recent }) {
  return (
    <TouchableOpacity style={styles.card} onPress={item.open} activeOpacity={0.85}>
      <WineCardThumb
        localUri={item.kind === 'label' ? item.imageUri : null}
        path={item.kind === 'list' ? item.path : null}
        producer={item.kind === 'label' ? item.producer : null}
        wineName={item.kind === 'label' ? item.wineName : null}
        fallbackText={item.title}
      />
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
    producer: r.wine.producer ?? null,
    wineName: r.wine.wineName ?? null,
    open: () => {
      const ls = useLabelStore.getState();
      ls.setWineDetailsConfirmed(r.wine);
      ls.setIntelligence(r.intel);
      ls.setImageUri(r.imageUri ?? null);
      router.push('/label/results?context=intel');
    },
  }));

  // Only genuine wine-list scans that HAVEN'T been reviewed — a scanned list the
  // user then rated/noted is a restaurant review and belongs in Recent Reviews.
  const listItems: Recent[] = archive.filter((a) => (a.extractedWines?.length ?? 0) > 0 && !restaurantReviewed(a)).map((a) => {
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
    return <RecentScansPlaceholder />;
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
  emptyCard: { height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, textAlign: 'center', lineHeight: 18 },
});
