import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import {
  fetchRecentWhereToBuy, openWhereToBuy, WHERE_TO_BUY_LIST_SIZE, WHERE_TO_BUY_RECENT_KEY, type WhereToBuyEntry,
} from '../../src/api/merchantLinks';
import { WineCardThumb } from '../../src/components/WineCardThumb';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

const fmtDay = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Where to Buy Search List: the last wines the user tapped Find Merchants on,
// each one tap from Wine-Searcher again.
export default function WhereToBuyListScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { data: entries = [], isLoading } = useQuery({
    queryKey: [WHERE_TO_BUY_RECENT_KEY, userId],
    enabled: !!userId,
    queryFn: () => fetchRecentWhereToBuy(userId!),
  });
  const refreshList = () => void qc.invalidateQueries({ queryKey: [WHERE_TO_BUY_RECENT_KEY] });

  const renderRow = ({ item: w }: { item: WhereToBuyEntry }) => (
    <View style={styles.row}>
      <WineCardThumb producer={w.producer} wineName={w.wine_name} fallbackText={w.wine_name ?? w.producer ?? ''} style={styles.thumb} />
      <View style={styles.rowMain}>
        <Text style={styles.name} numberOfLines={2}>{[w.producer, w.wine_name].filter(Boolean).join(' ') || w.wine_name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{[w.vintage, `Searched ${fmtDay(w.tappedAt)}`].filter(Boolean).join(' · ')}</Text>
        <TouchableOpacity onPress={() => openWhereToBuy(w, userId, 'search-list', refreshList)} activeOpacity={0.7}>
          <Text style={styles.link}>Find Merchants →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Where to Buy Search List</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No searches yet</Text>
          <Text style={styles.emptyBody}>Tap Find Merchants on any wine's Market tab and it appears here.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(w) => `${w.producer ?? ''}|${w.wine_name ?? ''}|${w.vintage ?? ''}`}
          renderItem={renderRow}
          ListHeaderComponent={<Text style={styles.intro}>The last {WHERE_TO_BUY_LIST_SIZE} wines you looked for merchants for.</Text>}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  title: { fontSize: 18, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8, flex: 1, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  intro: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  rowMain: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text },
  meta: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  link: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold, marginTop: spacing.xs },
});
