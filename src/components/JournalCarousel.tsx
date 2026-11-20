import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { fetchJournalPosts } from '../api/journalFeed';
import { colors, spacing } from '../constants/theme';
import { fontsSpectral as fonts } from '../constants/fonts';
import { PlaceholderCardView, type PlaceholderCard, NAMED_LABELS, RESTAURANT_GLASSES_IMG, KITCHEN_IMG } from './ExamplePlaceholder';

// Until the feed has a post (or can't be reached offline), three bundled example
// tiles stand in — never a plain brown card.
const JOURNAL_OVERLAY = "Vinster's musings appear here soon";
const JOURNAL_EXAMPLES: PlaceholderCard[] = [
  { kind: 'labelCollage', images: [NAMED_LABELS.gruaudLarose], title: 'On Old Bordeaux', stamp: '20 Dec 2029', overlay: JOURNAL_OVERLAY },
  { kind: 'image', image: KITCHEN_IMG, title: 'Cooking for the Cellar', stamp: '12 Dec 2029', overlay: JOURNAL_OVERLAY },
  { kind: 'image', image: RESTAURANT_GLASSES_IMG, title: 'Reading a Wine List', stamp: '3 Dec 2029', overlay: JOURNAL_OVERLAY },
];

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Carousel of Journal entries (title + date), newest first, read from the
// Vinster website's blog feed — each card opens that post on the website. Two
// dashed "future" placeholders trail the real posts; with no posts the three
// example tiles show instead. Reading the Journal is public, so cards navigate
// directly (no sign-in gate).
export function JournalCarousel() {
  const { data: posts = [] } = useQuery({
    queryKey: ['journal-feed'],
    // Keep the cache warm for a day so returning to the Share tab renders the
    // cards instantly (same reasoning as the alter-ego carousel).
    gcTime: 1000 * 60 * 60 * 24,
    queryFn: fetchJournalPosts,
    staleTime: 1000 * 60 * 10,
  });
  const published = posts;
  const hasPosts = published.length > 0;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {hasPosts ? (
          <>
            {published.map((p) => (
              <TouchableOpacity
                key={p.link}
                style={styles.card}
                onPress={() => { WebBrowser.openBrowserAsync(p.link).catch(() => {}); }}
                activeOpacity={0.85}
              >
                {p.imageUrl ? (
                  <>
                    <Image source={{ uri: p.imageUrl }} style={styles.cardBg} resizeMode="cover" />
                    <View style={styles.cardScrim} pointerEvents="none" />
                  </>
                ) : null}
                <Text style={styles.cardName} numberOfLines={3}>{p.title}</Text>
                <Text style={styles.cardDate}>{fmtDate(p.publishedAt)}</Text>
              </TouchableOpacity>
            ))}
            {/* Two dashed "future" placeholders trail the real posts. */}
            <View style={styles.futureCard}><Text style={styles.futureText}>Future entries appear here</Text></View>
            <View style={styles.futureCard}><Text style={styles.futureText}>Future entries appear here</Text></View>
          </>
        ) : (
          JOURNAL_EXAMPLES.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} stampCaps />)
        )}
      </ScrollView>
      <Text style={styles.hint}>Listed by recency · Swipe to view all →</Text>
    </>
  );
}

const styles = StyleSheet.create({
  hint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  card: { width: 190, height: 134, borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 12, padding: spacing.md, justifyContent: 'center', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.surface, overflow: 'hidden' },
  // The post's own image, faded under a dark scrim so the title stays legible.
  cardBg: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0.55 },
  cardScrim: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,11,10,0.45)' },
  cardName: { fontSize: 19, fontFamily: fonts.headingSemibold, color: colors.gold, lineHeight: 24, textAlign: 'center' },
  cardDate: { fontSize: 14, fontFamily: fonts.headingRegular, color: colors.textMuted, textAlign: 'center' },
  futureCard: { width: 190, height: 134, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  futureText: { fontSize: 15, fontFamily: fonts.headingRegular, color: colors.gold, textAlign: 'center', lineHeight: 19 },
});
