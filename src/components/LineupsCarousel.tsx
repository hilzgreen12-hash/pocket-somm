import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { listLineupArchives, lineupSignedUrl, deleteLineupArchive, type LineupArchive } from '../api/lineups';
import { showAlert } from './AppAlert';
import { PlaceholderCardView, type PlaceholderCard } from './ExamplePlaceholder';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Placeholder tiles shown until the user saves their first lineup — faded bottle
// glyphs with a scrim overlay, mirroring the empty "Your Recent Scans" carousel.
const LINEUP_EXAMPLES: PlaceholderCard[] = [
  { kind: 'icon', icon: 'wine', title: 'Your Lineup', stamp: '20 Dec 2029 · La Steakhouse', overlay: 'Your first lineup replaces this content' },
  { kind: 'icon', icon: 'wine', title: 'Your Lineup', stamp: '18 Dec 2029 · At Home', overlay: 'Your second lineup replaces this content' },
  { kind: 'icon', icon: 'wine', title: 'Your Lineup', stamp: '02 Dec 2029 · The Cellar Door', overlay: 'Your third lineup replaces this content' },
];

// One lineup in the carousel — a large thumbnail with a date · location stamp.
function LineupCard({ item }: { item: LineupArchive }) {
  const [url, setUrl] = useState<string | null>(null);
  const qc = useQueryClient();
  useEffect(() => {
    let active = true;
    lineupSignedUrl(item.image_path).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [item.image_path]);
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
        {url ? <Image source={{ uri: url }} style={styles.cardImage} resizeMode="cover" /> : <ActivityIndicator color={colors.gold} />}
      </View>
      {item.name?.trim() ? <Text style={styles.cardName} numberOfLines={1}>{item.name.trim()}</Text> : null}
      <Text style={[styles.cardStamp, item.name?.trim() ? styles.cardStampTight : null]} numberOfLines={1}>{date}{place ? ` · ${place}` : ''}</Text>
    </TouchableOpacity>
  );
}

// "Your Lineups" — the Archive-a-Night thumbnail carousel, with an "Add a
// lineup" tile at the end. Self-contained (loads the user's lineups); pass
// requireAccount to gate the add action behind sign-in on account-only tabs.
export function LineupsCarousel({ requireAccount }: { requireAccount?: (action: () => void) => void }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const gate = requireAccount ?? ((a: () => void) => a());
  const { data: lineups = [], isLoading } = useQuery({
    queryKey: ['lineup-archives', userId],
    queryFn: () => listLineupArchives(userId!),
    enabled: !!userId,
  });
  if (isLoading) return <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {lineups.map((l) => <LineupCard key={l.id} item={l} />)}
      {/* Empty state → three faded bottle placeholders (like the scan carousel). */}
      {lineups.length === 0 ? LINEUP_EXAMPLES.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />) : null}
      <TouchableOpacity style={styles.addCard} onPress={() => gate(() => router.push('/cellar/archive-night'))} activeOpacity={0.85}>
        <Text style={styles.addCardIcon}>＋</Text>
        <Text style={styles.addCardText}>Add</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.lg, alignItems: 'center' },
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  cardImageWrap: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardImage: { width: 220, height: 165 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, marginTop: 6, letterSpacing: 0.3 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 6 },
  cardStampTight: { marginTop: 2 },
  addCard: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', gap: 6 },
  addCardIcon: { fontFamily: fonts.headingBold, fontSize: 30, color: colors.gold },
  addCardText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
