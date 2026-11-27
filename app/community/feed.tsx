import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { FeedCard } from '../../src/components/community/CommunityCards';
import { FEED_KEY, listFeed, setCheer, type FeedItem } from '../../src/api/community';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

const PAGE = 20;

// A Community list: the latest wine or restaurant reviews (View All), or every
// review in one member's bulk share. Loads more as you scroll.
export default function CommunityFeedScreen() {
  const { category, bulkId, title } = useLocalSearchParams<{ category?: string; bulkId?: string; title?: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const cat = category === 'wine' || category === 'restaurant' ? category : undefined;
  // Cheers tapped here show at once; the server count catches up on refresh.
  const [cheered, setCheered] = useState<Record<string, boolean>>({});

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useInfiniteQuery({
    queryKey: [FEED_KEY, 'list', cat ?? null, bulkId ?? null],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => listFeed({ category: cat, bulkId, limit: PAGE, before: pageParam }),
    getNextPageParam: (last) => (last.length === PAGE ? last[last.length - 1].created_at : undefined),
  });
  const items = (data?.pages ?? []).flat();

  async function cheer(item: FeedItem) {
    if (!userId) return;
    const on = !(cheered[item.id] ?? item.liked_by_me);
    setCheered((c) => ({ ...c, [item.id]: on }));
    try {
      await setCheer(item.id, userId, on);
      void qc.invalidateQueries({ queryKey: [FEED_KEY], refetchType: 'none' });
    } catch {
      setCheered((c) => ({ ...c, [item.id]: !on }));
      showAlert({ title: 'Could Not Cheer', body: 'Please try again.' });
    }
  }

  // The item as it should show, with any cheer tapped here applied.
  const shown = (item: FeedItem): FeedItem => {
    const on = cheered[item.id];
    if (on == null || on === item.liked_by_me) return item;
    return { ...item, liked_by_me: on, like_count: item.like_count + (on ? 1 : -1) };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title || 'Gather'}</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <FeedCard item={shown(item)} onPress={() => router.push(`/community/post/${item.id}` as any)} onCheer={() => void cheer(item)} />
          )}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
          onEndReachedThreshold={0.6}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { setCheered({}); void refetch(); }} tintColor={colors.gold} />}
          ListEmptyComponent={<Text style={styles.empty}>Nothing has been shared here yet.</Text>}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={colors.gold} style={{ margin: spacing.lg }} /> : null}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  title: { flex: 1, fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.6, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', padding: spacing.xl },
});
