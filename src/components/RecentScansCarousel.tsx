import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard } from './ExamplePlaceholder';
import { useLabels } from '../hooks/useLabels';
import { useLabelStore } from '../stores/labelStore';
import { useScanStore } from '../stores/scanStore';
import { getCachedLabelUri } from '../api/labelImageCache';
import { useScanHistory, type ScanArchiveItem } from '../hooks/useScanHistory';
import { formatWineTitle } from '../utils/wineTitle';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A unified "recent scan" — either a single-bottle label→intel scan or a wine-
// list scan — merged by recency for the Home tab carousel. Both now read from the
// cloud (labels table + scan_sessions), so scans survive reinstalls and appear
// across devices; the thumbnail resolves from the stored photo path.
type Recent =
  | { kind: 'label'; ts: number; title: string; stamp: string; path: string | null; producer: string | null; wineName: string | null; open: () => void }
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

// Example cards shown when a new user has no scans yet.
const SCAN_EXAMPLES: PlaceholderCard[] = [
  { kind: 'label', producer: 'Domaine de la Romanée-Conti', wineName: 'La Romanée-Conti', title: 'La Romanée-Conti 2002', stamp: '01 Jan 2030 · At Home', overlay: 'Your first scan replaces this content' },
  { kind: 'winelist', title: 'Wine list', stamp: '20 Dec 2029 · La Steakhouse', overlay: 'Your second scan replaces this content' },
  { kind: 'label', producer: 'Kistler', wineName: 'Chardonnay', title: 'Kistler Chardonnay 2020', stamp: '18 Dec 2029', overlay: 'Your third scan replaces this content' },
];

// Identity key for de-duping re-scans of the same wine (newest kept).
function labelKey(producer: string | null, wineName: string | null, vintage: number | null): string {
  return [producer, wineName, vintage].map((s) => (s ?? '').toString().trim().toLowerCase()).join('|');
}

// Totals for the stats line under the header.
export function useRecentScanCounts(): { labels: number; lists: number } {
  const { labels } = useLabels();
  const { archive } = useScanHistory();
  const lists = archive.filter((a) => (a.extractedWines?.length ?? 0) > 0 && !restaurantReviewed(a)).length;
  return { labels: labels.length, lists };
}

function RecentCard({ item }: { item: Recent }) {
  return (
    <TouchableOpacity style={styles.card} onPress={item.open} activeOpacity={0.85}>
      <WineCardThumb
        path={item.path}
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
  const { labels } = useLabels();
  const { archive } = useScanHistory();

  // Cloud label scans → Recent label cards, de-duped by identity (labels arrive
  // newest-first, so the first occurrence of each wine is the most recent).
  const seen = new Set<string>();
  const labelItems: Recent[] = [];
  for (const l of labels) {
    const key = labelKey(l.producer, l.wine_name, l.vintage);
    if (seen.has(key)) continue;
    seen.add(key);
    labelItems.push({
      kind: 'label',
      ts: new Date(l.created_at).getTime(),
      title: formatWineTitle({ producer: l.producer, wineName: l.wine_name, vintage: l.vintage != null ? String(l.vintage) : null }),
      stamp: [stampDate(new Date(l.created_at)), (l.region ?? '').trim(), (l.captured_place ?? '').trim()].filter(Boolean).slice(0, 2).join(' · '),
      path: l.label_image_path,
      producer: l.producer,
      wineName: l.wine_name,
      open: async () => {
        const ls = useLabelStore.getState();
        ls.setWineDetailsConfirmed({
          producer: l.producer ?? '',
          region: l.region ?? '',
          wineName: l.wine_name,
          vintage: l.vintage != null ? String(l.vintage) : 'NV',
          grape: l.intel?.grapeVariety ?? null,
          bottleSizeMl: null,
          quantity: 1,
        });
        ls.setIntelligence(l.intel ?? null);
        // Resolve the stored photo to a local uri for the hero image.
        let uri: string | null = null;
        try { uri = await getCachedLabelUri(l.label_image_path); } catch { /* no photo */ }
        ls.setImageUri(uri);
        // labelId is carried so the screen won't re-write a cloud row; when the
        // snapshot is missing we regenerate intel (gen=1) without recording anew.
        const suffix = l.intel ? '' : '&gen=1&confirmed=1&noRecent=1';
        router.push(`/label/results?context=intel&labelId=${l.id}${suffix}`);
      },
    });
  }

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

  const merged = [...labelItems, ...listItems].sort((a, b) => b.ts - a.ts).slice(0, 8);
  // Real scans fill the carousel from the left, replacing placeholder tiles in
  // order; the remaining example tiles stay until there are at least three.
  const fill = merged.length < SCAN_EXAMPLES.length ? SCAN_EXAMPLES.slice(merged.length) : [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {merged.map((item, i) => <RecentCard key={`${item.kind}-${i}`} item={item} />)}
      {fill.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />)}
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
