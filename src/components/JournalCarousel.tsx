import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { fetchBlogPosts } from '../api/blog';
import { colors, spacing } from '../constants/theme';
import { fontsSpectral as fonts } from '../constants/fonts';

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Carousel of Journal entries (title + date), newest first — each card opens
// that entry. Mirrors the "Vinster's Review of You" alter-ego carousel: before
// the first entry exists a "coming" card shows, and two dashed "future"
// placeholders always trail so the row reads as an evolving set of three.
// Reading the Journal is public, so cards navigate directly (no sign-in gate).
export function JournalCarousel() {
  const { data: posts = [] } = useQuery({
    queryKey: ['journal-posts'],
    // Keep the cache warm for a day so returning to the Share tab renders the
    // cards instantly (same reasoning as the alter-ego carousel).
    gcTime: 1000 * 60 * 60 * 24,
    queryFn: fetchBlogPosts,
  });
  const published = posts.filter((p) => p.is_published);
  const hasPosts = published.length > 0;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {hasPosts ? (
          published.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.card}
              onPress={() => router.push(`/community/blog/${p.id}` as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.cardName} numberOfLines={3}>{p.title}</Text>
              <Text style={styles.cardDate}>{fmtDate(p.published_at ?? p.created_at)}</Text>
            </TouchableOpacity>
          ))
        ) : (
          // No entries yet — the brown "coming" card.
          <View style={styles.comingCard}>
            <Text style={styles.comingTitle}>The First Entry Is Brewing</Text>
            <Text style={styles.comingSub}>Vinster's Journal opens with its first musing soon.</Text>
          </View>
        )}
        {/* Two dashed "future" placeholders always trail the carousel. */}
        <View style={styles.futureCard}><Text style={styles.futureText}>Future entries appear here</Text></View>
        <View style={styles.futureCard}><Text style={styles.futureText}>Future entries appear here</Text></View>
      </ScrollView>
      <Text style={styles.hint}>Listed by recency · Swipe to view all →</Text>
    </>
  );
}

const styles = StyleSheet.create({
  hint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  card: { width: 190, height: 134, borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 14, padding: spacing.md, justifyContent: 'center', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.surface },
  cardName: { fontSize: 19, fontFamily: fonts.headingSemibold, color: colors.gold, lineHeight: 24, textAlign: 'center' },
  cardDate: { fontSize: 14, fontFamily: fonts.headingRegular, color: colors.textMuted, textAlign: 'center' },
  // On-brand brown (matches a populated Vinster's Review of You entry) rather
  // than the old near-black placeholder.
  comingCard: { width: 190, height: 134, borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 14, padding: spacing.md, justifyContent: 'center', gap: 4, backgroundColor: colors.surface },
  comingTitle: { fontSize: 18, fontFamily: fonts.headingBold, color: colors.gold, lineHeight: 23 },
  comingSub: { fontSize: 14, fontFamily: fonts.headingItalic, color: '#FFFFFF', lineHeight: 18 },
  futureCard: { width: 190, height: 134, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  futureText: { fontSize: 15, fontFamily: fonts.headingRegular, color: colors.gold, textAlign: 'center', lineHeight: 19 },
});
