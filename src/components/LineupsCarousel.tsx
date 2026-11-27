import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { listLineupArchives, deleteLineupArchive, lineupBottleTotal, type LineupArchive } from '../api/lineups';
import { showAlert } from './AppAlert';
import { LineupThumb } from './LineupThumb';
import { ReviewStatsBar } from './ReviewCarousels';
import { PlaceholderCardView, type PlaceholderCard, placeholderLabelImages } from './ExamplePlaceholder';
import { HOME_TILE, colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Placeholder tiles shown until the user saves their first lineup — a faded row
// of bundled wine labels (a bottle lineup) under a scrim, mirroring the empty
// "Your Recent Scans" carousel.
const LINEUP_OVERLAY = 'Your lineup appears here as you add them';
const LINEUP_EXAMPLES: PlaceholderCard[] = [
  { kind: 'labelLineup', images: placeholderLabelImages(0, 4), title: 'Your Lineup', stamp: '20 Dec 2029 · La Steakhouse', overlay: LINEUP_OVERLAY },
  { kind: 'labelLineup', images: placeholderLabelImages(4, 4), title: 'Your Lineup', stamp: '18 Dec 2029 · At Home', overlay: LINEUP_OVERLAY },
  { kind: 'labelLineup', images: placeholderLabelImages(8, 4), title: 'Your Lineup', stamp: '02 Dec 2029 · The Cellar Door', overlay: LINEUP_OVERLAY },
];

// One lineup in the carousel — a large thumbnail with a date · location stamp.
function LineupCard({ item }: { item: LineupArchive }) {
  const qc = useQueryClient();
  const date = new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const place = (item.venue || item.city || '').trim();
  // Long-hold to permanently delete this lineup (photo + notes + wines).
  function confirmDelete() {
    showAlert({
      title: 'Delete this lineup?',
      body: `${item.name?.trim() || date}${place ? ` · ${place}` : ''} — this permanently removes the photo, note and wines. This can't be undone.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteLineupArchive(item.id);
            qc.invalidateQueries({ queryKey: ['lineup-archives'] });
          } catch (err) {
            showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
          }
        } },
      ],
    });
  }
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/cellar/lineup/${item.id}` as any)} onLongPress={confirmDelete} delayLongPress={450} activeOpacity={0.85}>
      <View style={styles.cardImageWrap}>
        <LineupThumb path={item.image_path} width={220} height={165} />
      </View>
      {item.name?.trim() ? <Text style={styles.cardName} numberOfLines={1} allowFontScaling={false}>{item.name.trim()}</Text> : null}
      <Text style={[styles.cardStamp, item.name?.trim() ? styles.cardStampTight : null]} numberOfLines={1} allowFontScaling={false}>{date}{place ? ` · ${place}` : ''}</Text>
    </TouchableOpacity>
  );
}

// "Your Lineups" — the Archive-a-Night thumbnail carousel on the Review tab.
// Self-contained (loads the user's lineups). New lineups are started from the
// tab's "+ Add" menu, so the carousel itself only shows and opens them.
export function LineupsCarousel({ max, onViewAll }: { max?: number; onViewAll?: () => void }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: lineups = [], isLoading } = useQuery({
    queryKey: ['lineup-archives', userId],
    queryFn: () => listLineupArchives(userId!),
    enabled: !!userId,
  });
  if (isLoading) return <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>;

  const bottleCount = lineups.reduce((n, l) => n + lineupBottleTotal(l), 0);
  return (
    <>
      {onViewAll ? (
        <ReviewStatsBar text={`${lineups.length} ${lineups.length === 1 ? 'Lineup' : 'Lineups'} · ${bottleCount} ${bottleCount === 1 ? 'Bottle' : 'Bottles'}`} onViewAll={onViewAll} />
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {(max ? lineups.slice(0, max) : lineups).map((l) => <LineupCard key={l.id} item={l} />)}
        {/* Empty state → three faded bottle placeholders (like the scan carousel). */}
        {lineups.length === 0 ? LINEUP_EXAMPLES.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.lg, alignItems: 'center' },
  // No bottom padding: the separator below sits 18pt under the last caption line.
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md },
  card: { width: HOME_TILE.w },
  cardImageWrap: { width: HOME_TILE.w, height: HOME_TILE.h, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },

  // Lineup title white; date · location gold beneath it.
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3 },
  cardStampTight: { marginTop: 2 },
});
