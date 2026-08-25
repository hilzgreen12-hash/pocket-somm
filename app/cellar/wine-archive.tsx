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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Wine Archive</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Your Lineups — stats + a carousel of large lineup thumbnails. */}
        <Text style={styles.sectionHeader}>Your Lineups</Text>
        <Text style={styles.stats}>{lineups.length} {lineups.length === 1 ? 'Lineup' : 'Lineups'}</Text>
        {lineupsLoading ? (
          <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>
        ) : lineups.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {lineups.map((l) => <LineupCard key={l.id} item={l} />)}
          </ScrollView>
        ) : (
          <Text style={styles.empty}>No lineups yet — “Scan a Lineup” from the Scan tab to save one.</Text>
        )}

        <View style={styles.separator} />

        {/* Your Cellar Archive — click through to the dedicated archived-bottles
            view (the old "Archive" filter, now its own destination). */}
        <Text style={styles.sectionHeader}>Your Cellar Archive</Text>
        <Text style={styles.stats}>
          {archivedWines.length} {archivedWines.length === 1 ? 'Wine' : 'Wines'} · {archivedBottles} {archivedBottles === 1 ? 'Bottle' : 'Bottles'}
        </Text>
        <TouchableOpacity style={styles.archiveBtn} onPress={() => router.push('/cellar/list?archived=1')} activeOpacity={0.85}>
          <Text style={styles.archiveBtnText}>View Your Cellar Archive</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8, textAlign: 'center' },

  sectionHeader: { fontFamily: fonts.headingSemibold, fontSize: 20, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.xs },
  stats: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', marginBottom: spacing.md },
  loading: { paddingVertical: spacing.lg, alignItems: 'center' },
  empty: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: 22 },

  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  cardImageWrap: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardImage: { width: 220, height: 165 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 6 },

  separator: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.xl, marginHorizontal: spacing.xl },

  archiveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl },
  archiveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
});
