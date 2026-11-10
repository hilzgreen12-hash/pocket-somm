import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard, NAMED_LABELS } from './ExamplePlaceholder';
import { useLabels } from '../hooks/useLabels';
import { useLabelStore } from '../stores/labelStore';
import { useScanStore } from '../stores/scanStore';
import { getCachedLabelUri } from '../api/labelImageCache';
import { useScanHistory, type ScanArchiveItem } from '../hooks/useScanHistory';
import { useAttachRestaurantPhoto } from '../hooks/useAttachRestaurantPhoto';
import { useAttachLabelPhoto } from '../hooks/useAttachLabelPhoto';
import { showAlert } from './AppAlert';
import { formatWineTitle } from '../utils/wineTitle';
import { HOME_TILE, colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A unified "recent scan" — either a single-bottle label→intel scan or a wine-
// list scan — merged by recency for the Home tab carousel. Both now read from the
// cloud (labels table + scan_sessions), so scans survive reinstalls and appear
// across devices; the thumbnail resolves from the stored photo path.
// A wine-list card with no photo shows a "+ Add Image" tile (onAddImage) that
// runs the restaurant-photo flow; opening a list card revisits it read-only.

// A unified "recent scan" — either a single-bottle label→intel scan or a wine-
// list scan — merged by recency for the Home tab carousel. Both now read from the
// cloud (labels table + scan_sessions), so scans survive reinstalls and appear
// across devices; the thumbnail resolves from the stored photo path.
type Recent =
  | { kind: 'label'; ts: number; title: string; stamp: string; path: string | null; producer: string | null; wineName: string | null; open: () => void; onLongPress?: () => void }
  | { kind: 'list'; ts: number; title: string; stamp: string; path: string | null; open: () => void; onAddImage?: () => void; onLongPress?: () => void };

// Shared date format for the "date · location" stamp beneath each thumbnail.
function stampDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Example cards shown when a new user has no scans yet.
const SCAN_EXAMPLES: PlaceholderCard[] = [
  { kind: 'labelCollage', images: [NAMED_LABELS.lynchBages], title: 'Château Lynch-Bages 2010', stamp: '01 Jan 2030', overlay: 'Your Label Scan Library fills up here as you use Vinster' },
  { kind: 'labelCollage', images: [NAMED_LABELS.donnhoff], title: 'Dönnhoff Krötenpfuhl Riesling GG 2019', stamp: '20 Dec 2029', overlay: 'Your Label Scan Library fills up here as you use Vinster' },
  { kind: 'labelCollage', images: [NAMED_LABELS.rocDeCambes], title: 'Roc de Cambes 2015', stamp: '18 Dec 2029', overlay: 'Your Label Scan Library fills up here as you use Vinster' },
];

// Identity key for de-duping re-scans of the same wine (newest kept).
function labelKey(producer: string | null, wineName: string | null, vintage: number | null): string {
  return [producer, wineName, vintage].map((s) => (s ?? '').toString().trim().toLowerCase()).join('|');
}

// Totals for the stats line under the header.
export function useRecentScanCounts(): { labels: number; lists: number } {
  const { labels } = useLabels();
  const { archive } = useScanHistory();
  const lists = archive.filter((a) => (a.extractedWines?.length ?? 0) > 0).length;
  return { labels: labels.length, lists };
}

function RecentCard({ item }: { item: Recent }) {
  // A wine-list card with no photo shows a tappable "+ Add Image" tile that runs
  // the add-photo flow, instead of a plain fallback thumbnail.
  const showAddImage = item.kind === 'list' && !item.path && !!item.onAddImage;
  return (
    <TouchableOpacity style={styles.card} onPress={item.open} onLongPress={item.onLongPress} delayLongPress={400} activeOpacity={0.85}>
      {showAddImage ? (
        <TouchableOpacity style={styles.addImageThumb} onPress={item.onAddImage} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={26} color={colors.gold} allowFontScaling={false} />
          <Text style={styles.addImageText} allowFontScaling={false}>+ Add Image</Text>
        </TouchableOpacity>
      ) : (
        <WineCardThumb
          compact
          path={item.path}
          producer={item.kind === 'label' ? item.producer : null}
          wineName={item.kind === 'label' ? item.wineName : null}
          fallbackText={item.title}
        />
      )}
      <Text style={styles.cardName} numberOfLines={2} allowFontScaling={false}>{item.title}</Text>
      {item.stamp ? <Text style={styles.cardStamp} numberOfLines={1} allowFontScaling={false}>{item.stamp}</Text> : null}
    </TouchableOpacity>
  );
}

export function RecentScansCarousel() {
  const { labels, remove: removeLabel } = useLabels();
  const { archive, removeArchiveItem } = useScanHistory();
  const attachRestaurantPhoto = useAttachRestaurantPhoto();
  const attachLabelPhoto = useAttachLabelPhoto();

  // Long-press → "Update photo" / "Remove from carousel" for either card type.
  function labelLongPress(l: { id: string; producer: string | null; wine_name: string | null; label_image_path: string | null }) {
    showAlert({
      title: 'Recent scan',
      buttons: [
        { text: 'Update photo', onPress: () => setTimeout(() => attachLabelPhoto.present({ kind: 'label', wineId: l.id, producer: l.producer, wineName: l.wine_name, hasPhoto: !!l.label_image_path }), 250) },
        { text: 'Remove from carousel', style: 'destructive', onPress: () => removeLabel.mutate(l.id) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function listLongPress(a: ScanArchiveItem) {
    showAlert({
      title: 'Recent scan',
      buttons: [
        { text: 'Update photo', onPress: () => setTimeout(() => attachRestaurantPhoto.present({ sessionId: a.id, restaurant: a.restaurantName?.trim() || null, city: a.city?.trim() || null, hasPhoto: !!a.restaurantPhotoPath }), 250) },
        { text: 'Remove from carousel', style: 'destructive', onPress: () => removeArchiveItem.mutate(a.id) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

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
      // Just the scan date beneath the full wine name (name/date/origin used to
      // jumble together). Shown gold via cardStamp.
      stamp: stampDate(new Date(l.created_at)),
      path: l.label_image_path,
      producer: l.producer,
      wineName: l.wine_name,
      onLongPress: () => labelLongPress(l),
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
        // A stored snapshot is only worth displaying if it actually carries intel
        // (a score or a value). An EMPTY snapshot — e.g. a Wine-Searcher/Claude
        // hiccup at scan time — would just surface the "unable to generate intel"
        // prompt, so treat it like a missing one and regenerate (results heals the
        // stored row on success). A usable snapshot displays instantly, no cost.
        const usable = !!(l.intel && (l.intel.criticScore != null || l.intel.estimatedValue != null));
        ls.setIntelligence(usable ? l.intel : null);
        // Resolve the stored photo to a local uri for the hero image.
        let uri: string | null = null;
        try { uri = await getCachedLabelUri(l.label_image_path); } catch { /* no photo */ }
        ls.setImageUri(uri);
        // labelId is carried so the screen heals the existing row instead of writing
        // a new one; gen=1 regenerates when the snapshot is missing or empty.
        const suffix = usable ? '' : '&gen=1&confirmed=1&noRecent=1';
        // Opened from the Home carousel → Back returns to Home, not the Scan tab
        // (the results screen's default origin).
        router.push(`/label/results?context=intel&labelId=${l.id}${suffix}&backTo=${encodeURIComponent('/(tabs)')}`);
      },
    });
  }

  // Every wine-list scan belongs in Recent Scans — it's the scanned list itself.
  // Rating/noting the restaurant additionally surfaces it in Recent Reviews, but
  // must NOT remove it from here (previously it did, so saving a restaurant review
  // made the scan vanish from the scans carousel).
  const listItems: Recent[] = archive.filter((a) => (a.extractedWines?.length ?? 0) > 0).map((a) => {
    const d = a.capturedAt ? new Date(a.capturedAt) : null;
    const dateStr = d ? stampDate(d) : '';
    const venue = a.restaurantName?.trim() || '';
    const loc = a.city?.trim() || '';
    // Title = the venue/location the user entered; date (+ location when the title
    // is the venue) sits beneath it.
    const title = venue || loc || 'Wine list';
    const stamp = [dateStr, venue && loc ? loc : null].filter(Boolean).join(' · ');
    return {
      kind: 'list' as const,
      ts: a.capturedAt ? new Date(a.capturedAt).getTime() : 0,
      title,
      stamp,
      path: a.restaurantPhotoPath,
      // No photo yet → the card shows "+ Add Image", which runs the restaurant
      // photo flow (take / upload / find online) for this scan's session.
      onAddImage: a.restaurantPhotoPath
        ? undefined
        : () => attachRestaurantPhoto.present({ sessionId: a.id, restaurant: venue || null, city: loc || null, hasPhoto: false }),
      onLongPress: () => listLongPress(a),
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

  // Label scans only — wine-list scans were dropped from this carousel (it's now
  // "Your Recent Label Scans"). listItems is still built above but not surfaced here.
  const merged = [...labelItems].sort((a, b) => b.ts - a.ts).slice(0, 8);
  // Real scans fill the carousel from the left, replacing placeholder tiles in
  // order; the remaining example tiles stay until there are at least three.
  // Examples are generic, so they only show before the user's first scan —
  // never padding out real scans.
  const fill = merged.length === 0 ? SCAN_EXAMPLES : [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {/* Stable content key (kind + timestamp + title), not the array index —
          otherwise a new scan reorders the list and React mis-associates cards. */}
      {merged.map((item) => <RecentCard key={`${item.kind}-${item.ts}-${item.title}`} item={item} />)}
      {fill.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} compact />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: HOME_TILE.w },
  thumb: { width: HOME_TILE.w, height: HOME_TILE.h, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  thumbFallback: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textAlign: 'center' },
  // "+ Add Image" tile for a photo-less wine-list card.
  addImageThumb: { width: HOME_TILE.w, height: HOME_TILE.h, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 6 },
  addImageText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 0.3 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3 },
  emptyCard: { height: HOME_TILE.h, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, textAlign: 'center', lineHeight: 18 },
});
