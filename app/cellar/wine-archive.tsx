import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { useArchive } from '../../src/hooks/useCellar';
import { listLineupArchives, lineupSignedUrl, type LineupArchive } from '../../src/api/lineups';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// One lineup in the carousel — a large thumbnail with a date · location stamp.
function LineupCard({ item }: { item: LineupArchive }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    lineupSignedUrl(item.image_path).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [item.image_path]);
  const date = new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const place = (item.venue || item.city || '').trim();
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/cellar/lineup/${item.id}` as any)} activeOpacity={0.85}>
      <View style={styles.cardImageWrap}>
        {url ? <Image source={{ uri: url }} style={styles.cardImage} resizeMode="cover" /> : <ActivityIndicator color={colors.gold} />}
      </View>
      <Text style={styles.cardStamp} numberOfLines={1}>{date}{place ? ` · ${place}` : ''}</Text>
    </TouchableOpacity>
  );
}

// Your Wine Archive — a hub for the two kinds of archive: photographed lineups
// (drunk bottles kept as memories) and the Cellar Archive (bottles removed from
// the live cellar). Reached from the Cellar tab, under Cellar Statistics.
export default function WineArchiveScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const { data: lineups = [], isLoading: lineupsLoading } = useQuery({
    queryKey: ['lineup-archives', userId],
    queryFn: () => listLineupArchives(userId!),
    enabled: !!userId,
  });
  const { wines: archivedWines } = useArchive();
  const archivedBottles = archivedWines.reduce((s, w) => s + (w.quantity ?? 1), 0);
  const lineupBottles = lineups.reduce((s, l) => s + (l.bottle_count ?? 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Cellar Archive</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.xl, paddingBottom: 60 }}>
        {/* Your Cellar Archive — mirrors Pair's Your Cookbook: the page header is
            the title, then the blurb, a "View Your Cellar Archive →" link, and
            the stats bar. */}
        <Text style={styles.blurb}>Bottles you've moved out of your cellar live here. You can still add reviews and cellar notes for the wines in your archive.</Text>
        <TouchableOpacity onPress={() => router.push('/cellar/list?archived=1')} activeOpacity={0.7} style={styles.viewLinkRow}>
          <Text style={styles.viewLink}>View Your Cellar Archive →</Text>
        </TouchableOpacity>
        <Text style={styles.stats}>
          {archivedWines.length} {archivedWines.length === 1 ? 'Wine' : 'Wines'} · {archivedBottles} {archivedBottles === 1 ? 'Bottle' : 'Bottles'}
        </Text>

        <View style={styles.sepShort} />

        {/* Archive a Night Lineups — a sub-header (not a bubble), its blurb, the
            stats bar bracketed by full-width rules, then the thumbnail carousel
            with a swipe hint above it. */}
        <Text style={styles.sectionHeader}>Archive a Night Lineups</Text>
        <Text style={styles.blurb}>Your vinous exploits save here automatically from Scan a Lineup, or add Lineups directly. This archive is a diary of your best wine memories.</Text>
        <Text style={styles.stats}>
          {lineups.length} {lineups.length === 1 ? 'Lineup' : 'Lineups'} · {lineupBottles} {lineupBottles === 1 ? 'Bottle' : 'Bottles'}
        </Text>

        <Text style={styles.swipeHint}>Swipe right to view and add lineups →</Text>
        {lineupsLoading ? (
          <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {lineups.map((l) => <LineupCard key={l.id} item={l} />)}
            <TouchableOpacity style={styles.addCard} onPress={() => router.push('/cellar/archive-night')} activeOpacity={0.85}>
              <Text style={styles.addCardIcon}>＋</Text>
              <Text style={styles.addCardText}>Add a lineup</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Terracotta header band (lighter than the buttons) with cream fonts.
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // width 40 mirrors the right spacer so the flex-1 title is screen-centred.
  back: { width: 40, fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.8, textAlign: 'center' },

  // Gold "View Your Cellar Archive →" link beneath the blurb (matches the
  // Cookbook's "View Your Cookbook →" link).
  viewLinkRow: { alignItems: 'center', paddingTop: spacing.xs, paddingBottom: spacing.xs },
  viewLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },

  blurb: { fontSize: 16, fontFamily: fonts.headingRegular, color: colors.textMuted, lineHeight: 22, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.md },

  sectionHeader: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  // Stats bar — green outline + light-green fill bubble (matches the other pages).
  // Stats BAR — full-width, green rule top and bottom running edge to edge.
  stats: { marginVertical: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: colors.divider, borderBottomColor: colors.divider, fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  loading: { paddingVertical: spacing.lg, alignItems: 'center' },

  // Full-bleed rules bracket each stats bar; the short indented rule divides the
  // two sections.
  sepFull: { height: 1, backgroundColor: colors.border },
  sepShort: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg, marginHorizontal: spacing.xl },

  // "Swipe right to view and add lineups →" — white italic, left-indented above
  // the carousel (matches the Pair / cellar carousels).
  swipeHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, paddingLeft: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs, letterSpacing: 0.3 },

  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  cardImageWrap: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardImage: { width: 220, height: 165 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 6 },

  // Dashed "add a lineup" tile trailing the carousel, sized to the thumbnails.
  addCard: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', gap: 6 },
  addCardIcon: { fontFamily: fonts.headingBold, fontSize: 30, color: colors.gold },
  addCardText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
