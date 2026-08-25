import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';
import { splitPersonality } from '../utils/personalityText';
import { colors, spacing } from '../constants/theme';
import { fontsSpectral as fonts } from '../constants/fonts';

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Carousel of the user's alter-ego sketches (title + date), newest first — each
// card opens that sketch. A user with none yet sees the brown "coming" card and
// two dashed "future" placeholders. Styled like the Cellar / Cookbook carousels.
export function AlterEgoCarousel({ requireAccount }: { requireAccount: (action: () => void) => void }) {
  const { session } = useAuth();
  const userId = session?.user.id;

  const { data: sketches = [] } = useQuery({
    queryKey: ['alter-ego-sketches', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('personality_sketches')
        .select('id, text, created_at')
        .eq('user_id', userId!)
        .eq('category', 'alter-ego')
        .order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const hasSketches = sketches.length > 0;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {hasSketches ? (
        sketches.map((s: any) => {
          const { title } = splitPersonality(s.text ?? '');
          return (
            <TouchableOpacity
              key={s.id}
              style={styles.card}
              onPress={() => requireAccount(() => router.push(`/profile/personality?category=alter-ego&sketchId=${s.id}` as any))}
              activeOpacity={0.85}
            >
              <Text style={styles.cardName} numberOfLines={3}>{title || 'Your Vinster Alter-Ego'}</Text>
              <Text style={styles.cardDate}>{fmtDate(s.created_at)}</Text>
            </TouchableOpacity>
          );
        })
      ) : (
        // No sketches yet — the brown "coming" card. Tap to have Vinster draw
        // the first sketch once there's enough to read.
        <TouchableOpacity
          style={styles.mysteryCard}
          onPress={() => requireAccount(() => router.push('/profile/personality?category=alter-ego' as any))}
          activeOpacity={0.85}
        >
          <Text style={styles.mysteryTitle}>You Are, As Yet, A Mystery</Text>
          <Text style={styles.mysterySub}>Vinster is quietly judging… your alter-ego is coming.</Text>
        </TouchableOpacity>
      )}
      {/* Two dashed "future" placeholders always trail the carousel. */}
      <View style={styles.futureCard}><Text style={styles.futureText}>Future Alter Ego's Appear Here</Text></View>
      <View style={styles.futureCard}><Text style={styles.futureText}>Future Alter Ego's Appear Here</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  // Real sketch card — title then date beneath. Elegant (Cormorant) type to
  // match the Review header. Same footprint as the Cellar / Cookbook chips.
  // Deliberately a touch larger than the Cellar/Cookbook chips (190×134 vs
  // 152×108), with bigger type, as these alter-ego cards are the hero here.
  card: { width: 190, height: 134, borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 14, padding: spacing.md, justifyContent: 'flex-start', gap: spacing.xs, backgroundColor: colors.surface },
  cardName: { fontSize: 19, fontFamily: fonts.headingSemibold, color: colors.gold, lineHeight: 24 },
  cardDate: { fontSize: 14, fontFamily: fonts.headingRegular, color: colors.textMuted },
  // Brown "your alter-ego is coming" placeholder.
  mysteryCard: { width: 190, height: 134, borderWidth: 1, borderColor: '#6B4A32', borderRadius: 14, padding: spacing.md, justifyContent: 'center', gap: 4, backgroundColor: '#3A2A20' },
  mysteryTitle: { fontSize: 18, fontFamily: fonts.headingBold, color: '#E8D6B8', lineHeight: 23 },
  mysterySub: { fontSize: 14, fontFamily: fonts.headingItalic, color: 'rgba(232,214,184,0.8)', lineHeight: 18 },
  // Dashed gold "future" tiles — same look as the "+ Add" carousel tiles.
  futureCard: { width: 190, height: 134, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  futureText: { fontSize: 15, fontFamily: fonts.headingRegular, color: colors.gold, textAlign: 'center', lineHeight: 19 },
});
