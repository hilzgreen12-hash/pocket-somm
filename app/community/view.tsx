import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { listCommunityReviews, type CommunityCategory, type CommunityReview } from '../../src/api/community';
import { colors, spacing } from '../../src/constants/theme';

const HEADINGS: Record<string, string> = {
  wine: 'Latest Wine Reviews',
  recipe: 'Latest Recipe Reviews',
  restaurant: 'Latest Restaurant Reviews',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ReviewCard({ review }: { review: CommunityReview }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.title} numberOfLines={1}>{review.title}</Text>
        {review.rating != null && (
          <Text style={styles.rating}>{review.rating}</Text>
        )}
      </View>
      {review.subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>{review.subtitle}</Text>
      ) : null}
      {review.body ? (
        <Text style={styles.body} numberOfLines={3}>{review.body}</Text>
      ) : null}
      <View style={styles.meta}>
        <Text style={styles.metaText}>{review.display_name || 'Anonymous'}</Text>
        <Text style={styles.metaText}>{formatDate(review.created_at)}</Text>
      </View>
    </View>
  );
}

export default function CommunityViewScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const key = (category ?? 'wine').toLowerCase() as CommunityCategory;
  const heading = HEADINGS[key] ?? 'Latest Reviews';

  const { data: reviews = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['community-reviews', key],
    queryFn: () => listCommunityReviews(key, 50),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{heading}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : isError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn't load reviews</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryLink}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing posted yet</Text>
          <Text style={styles.emptyBody}>Be the first to share — head back and tap "Upload your latest reviews".</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60, paddingTop: spacing.md }}>
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  retryLink: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm },
  title: { flex: 1, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  rating: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  subtitle: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 2 },
  body: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 20, marginTop: spacing.sm },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  metaText: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
});
