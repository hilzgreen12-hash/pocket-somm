import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { searchMyCommunityUploads, type CommunityCategory, type CommunityReview } from '../../src/api/community';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';

const TITLES: Record<string, string> = {
  recipe: 'Recipe Reviews',
  wine: 'Wine Reviews',
  restaurant: 'Restaurant Reviews',
};

const SUBTITLES: Record<string, string> = {
  recipe: 'Share your recipe pairings, see what other home cooks are loving, and find new ideas worth trying.',
  wine: 'Share the wines you\'ve loved, see what the community is drinking, and discover bottles worth seeking out.',
  restaurant: 'Share the restaurants you\'ve been to, read what the community thinks, and find your next great meal.',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isCategory(v: string | undefined): v is CommunityCategory {
  return v === 'wine' || v === 'restaurant' || v === 'recipe';
}

export default function CommunityCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const key = (category ?? '').toLowerCase();
  const title = TITLES[key] ?? 'Reviews';
  const subtitle = SUBTITLES[key] ?? '';
  const validCategory = isCategory(key) ? key : null;
  const { session } = useAuth();
  const userId = session?.user.id;
  const [search, setSearch] = useState('');

  const { data: myReviews = [], isLoading } = useQuery({
    queryKey: ['my-community-uploads', userId, validCategory, search.trim()],
    queryFn: () => searchMyCommunityUploads(validCategory!, search),
    enabled: !!userId && !!validCategory,
  });

  const reviewsLabel = useMemo(() => {
    if (!validCategory) return 'Your Reviews';
    if (validCategory === 'wine') return 'Your Wine Reviews';
    if (validCategory === 'restaurant') return 'Your Restaurant Reviews';
    return 'Your Recipe Reviews';
  }, [validCategory]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        {/* Community is still in build — the screen is previewable but
            faded and non-interactive. pointerEvents="none" lets the
            ScrollView keep scrolling while every control inside is inert;
            the Back button above stays outside this wrapper. */}
        <View pointerEvents="none" style={styles.muted}>

        <View style={styles.intro}>
          <Text style={styles.heading}>{title}</Text>
          {subtitle ? <Text style={styles.subheading}>{subtitle}</Text> : null}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={() => router.push(`/community/upload?category=${key}`)}>
            <Text style={styles.buttonText}>Upload your reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push(`/community/search?category=${key}`)}>
            <Text style={styles.buttonText}>Search community reviews</Text>
          </TouchableOpacity>
        </View>

        {validCategory && (
          <View style={styles.yourReviewsSection}>
            <Text style={styles.yourReviewsHeading}>{reviewsLabel}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search your reviews"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />

            {!session ? (
              <Text style={styles.emptyHint}>Sign in to see your reviews here.</Text>
            ) : isLoading ? (
              <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.lg }} />
            ) : myReviews.length === 0 ? (
              <Text style={styles.emptyHint}>
                {search.trim()
                  ? 'No reviews match that search.'
                  : 'Reviews you save in the app will appear here automatically.'}
              </Text>
            ) : (
              myReviews.map((r: CommunityReview) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewCardRow}>
                    <Text style={styles.reviewTitle} numberOfLines={2}>{r.title}</Text>
                    {r.rating != null && (
                      <Text style={styles.reviewRating}>{r.rating}</Text>
                    )}
                  </View>
                  {r.subtitle ? (
                    <Text style={styles.reviewSubtitle} numberOfLines={2}>{r.subtitle}</Text>
                  ) : null}
                  {r.body ? (
                    <Text style={styles.reviewBody} numberOfLines={3}>{r.body}</Text>
                  ) : null}
                  <Text style={styles.reviewDate}>{formatDate(r.created_at)}</Text>
                </View>
              ))
            )}
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Community isn't live yet — content is shown faded and the wrapper is
  // pointerEvents="none" so it can't be used, only previewed.
  muted: { opacity: 0.5 },
  backRow: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  intro: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center', gap: spacing.xs },
  heading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 32, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  subheading: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: spacing.xs },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  yourReviewsSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.sm },
  yourReviewsHeading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, letterSpacing: 0.5, marginBottom: spacing.xs },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  emptyHint: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg, lineHeight: 22 },
  reviewCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, marginTop: spacing.sm, gap: 4 },
  reviewCardRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  reviewTitle: { flex: 1, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text, lineHeight: 22 },
  reviewRating: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 17, color: colors.gold },
  reviewSubtitle: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, lineHeight: 19 },
  reviewBody: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.text, lineHeight: 19, marginTop: 2 },
  reviewDate: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
