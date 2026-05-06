import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { useScanHistory } from '../../src/hooks/useScanHistory';
import { useAuth } from '../../src/hooks/useAuth';
import {
  listMyCommunityUploads,
  publishCommunityReview,
  unpublishCommunityReview,
  type CommunityCategory,
  type CommunityReviewInput,
} from '../../src/api/community';
import { colors, spacing } from '../../src/constants/theme';

const HEADINGS: Record<string, string> = {
  wine: 'Upload Wine Reviews',
  recipe: 'Upload Recipe Reviews',
  restaurant: 'Upload Restaurant Reviews',
};

interface SourceRow {
  sourceTable: string;
  sourceId: string;
  title: string;
  subtitle: string | null;
  rating: number | null;
  body: string | null;
  metadata?: Record<string, unknown>;
  capturedAt?: string;
}

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CommunityUploadScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const key = (category ?? 'wine').toLowerCase() as CommunityCategory;
  const heading = HEADINGS[key] ?? 'Upload Reviews';

  const { session } = useAuth();
  const qc = useQueryClient();
  const { chosenWines } = useChosenWines();
  const { archive } = useScanHistory();

  // Build source rows per category
  const sourceRows: SourceRow[] = useMemo(() => {
    if (key === 'wine') {
      return chosenWines.map((w) => ({
        sourceTable: 'chosen_wines',
        sourceId: w.id,
        title: `${w.vintage ? `${w.vintage} ` : ''}${w.wine_name}`,
        subtitle: [w.producer, w.region].filter(Boolean).join(' · ') || null,
        rating: w.user_score ?? null,
        body: [w.tasting_note, w.other_observations].filter(Boolean).join('\n\n') || null,
        metadata: { restaurant_name: w.restaurant_name, city: w.city, grape: w.grape },
        capturedAt: w.chosen_at,
      }));
    }
    if (key === 'restaurant') {
      return archive
        .filter((a) => (a.restaurantName && a.restaurantName.trim()) || (a.restaurantNote && a.restaurantNote.trim()))
        .map((a) => ({
          sourceTable: 'scan_sessions',
          sourceId: a.id,
          title: a.restaurantName || 'Unnamed restaurant',
          subtitle: a.city ?? null,
          rating: null,
          body: a.restaurantNote ?? null,
          metadata: {},
          capturedAt: a.capturedAt,
        }));
    }
    return [];
  }, [key, chosenWines, archive]);

  const { data: uploads = [], isLoading: uploadsLoading } = useQuery({
    queryKey: ['community-uploads', key],
    queryFn: () => listMyCommunityUploads(key),
    enabled: !!session,
  });

  const publishedBySource = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of uploads) {
      if (u.source_id) map.set(u.source_id, u.id);
    }
    return map;
  }, [uploads]);

  const publish = useMutation({
    mutationFn: (input: CommunityReviewInput) => {
      const displayName = (session?.user.email ?? '').split('@')[0] || null;
      return publishCommunityReview(input, displayName);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-uploads', key] });
      qc.invalidateQueries({ queryKey: ['community-reviews', key] });
    },
    onError: (err: any) => Alert.alert('Could not post', err?.message || 'Please try again.'),
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => unpublishCommunityReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-uploads', key] });
      qc.invalidateQueries({ queryKey: ['community-reviews', key] });
    },
    onError: (err: any) => Alert.alert('Could not remove', err?.message || 'Please try again.'),
  });

  function handleToggle(row: SourceRow) {
    const existingId = publishedBySource.get(row.sourceId);
    if (existingId) {
      unpublish.mutate(existingId);
    } else {
      publish.mutate({
        category: key,
        source_table: row.sourceTable,
        source_id: row.sourceId,
        title: row.title,
        subtitle: row.subtitle,
        rating: row.rating,
        body: row.body,
        metadata: row.metadata,
      });
    }
  }

  const isLoading = uploadsLoading;
  const recipeNotice = key === 'recipe';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{heading}</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sign in to post</Text>
          <Text style={styles.emptyBody}>Community uploads are saved to your account.</Text>
        </View>
      ) : recipeNotice ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Recipe reviews coming soon</Text>
          <Text style={styles.emptyBody}>Saving a recipe from a chef pairing isn't wired up yet — once it is, your saved recipe reviews will appear here ready to share.</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : sourceRows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing to upload yet</Text>
          <Text style={styles.emptyBody}>
            {key === 'wine'
              ? 'Once you Review a wine from a Vinster recommendation, it will appear here ready to publish to the community.'
              : 'Once you tap "Review Restaurant" on a wine list scan, the restaurant will appear here ready to publish.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60, paddingTop: spacing.md }}>
          <Text style={styles.helper}>Tap "Post" to share a review with the community. Tap "Posted" to remove it. Your underlying review is unaffected.</Text>
          {sourceRows.map((row) => {
            const posted = publishedBySource.has(row.sourceId);
            const busy = (publish.isPending && publish.variables?.source_id === row.sourceId)
              || (unpublish.isPending && unpublish.variables === publishedBySource.get(row.sourceId));
            return (
              <View key={row.sourceId} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{row.title}</Text>
                    {row.rating != null && <Text style={styles.rowRating}>{row.rating}</Text>}
                  </View>
                  {row.subtitle ? (
                    <Text style={styles.rowSubtitle} numberOfLines={1}>{row.subtitle}</Text>
                  ) : null}
                  <Text style={styles.rowMeta}>{formatDate(row.capturedAt)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionBtn, posted && styles.actionBtnPosted, busy && { opacity: 0.5 }]}
                  onPress={() => handleToggle(row)}
                  disabled={busy}
                >
                  <Text style={[styles.actionBtnText, posted && styles.actionBtnTextPosted]}>
                    {busy ? '…' : posted ? 'Posted ✓' : 'Post'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  headerTitle: { fontSize: 18, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  helper: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, lineHeight: 18 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md },
  rowTop: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  rowTitle: { flex: 1, fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  rowRating: { fontSize: 14, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  rowSubtitle: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  rowMeta: { fontSize: 11, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  actionBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md, alignItems: 'center', minWidth: 80 },
  actionBtnPosted: { backgroundColor: 'rgba(212,176,96,0.15)' },
  actionBtnText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  actionBtnTextPosted: { color: colors.gold },
});
