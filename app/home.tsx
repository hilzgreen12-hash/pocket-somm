import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../src/hooks/useAuth';
import { usePersonalityPrompt } from '../src/hooks/usePersonalityPrompt';
import { TabFooter } from '../src/components/TabFooter';
import { PersonalityPromptModal } from '../src/components/PersonalityPromptModal';
import { supabase } from '../src/api/supabase';
import { splitPersonality } from '../src/utils/personalityText';
import { colors, spacing } from '../src/constants/theme';

// --- Tile motifs ----------------------------------------------------------
// Each motif is a small geometric mark drawn with bordered Views so the
// home screen reads as four distinct destinations even before a designer
// hands over final iconography. They pick up the gold accent and need no
// image assets, so they ship cleanly with the next preview build.

function ListMotif() {
  return (
    <View style={motifStyles.listBox}>
      <View style={motifStyles.listLine} />
      <View style={motifStyles.listLine} />
      <View style={motifStyles.listLine} />
    </View>
  );
}

function ChefMotif() {
  return (
    <View style={motifStyles.chefRow}>
      <View style={motifStyles.chefHandle} />
      <View style={motifStyles.chefPot} />
      <View style={motifStyles.chefHandle} />
    </View>
  );
}

function CellarMotif() {
  return (
    <View style={motifStyles.cellarStack}>
      <View style={motifStyles.cellarNeck} />
      <View style={motifStyles.cellarBody} />
    </View>
  );
}

function CommunityMotif() {
  return (
    <View style={motifStyles.commRow}>
      <View style={motifStyles.commCircle} />
      <View style={[motifStyles.commCircle, motifStyles.commCircleOverlap]} />
    </View>
  );
}

const motifStyles = StyleSheet.create({
  listBox: { width: 30, height: 34, borderWidth: 1, borderColor: colors.gold, borderRadius: 3, paddingVertical: 6, justifyContent: 'space-between' },
  listLine: { height: 1.5, backgroundColor: colors.gold, marginHorizontal: 5, borderRadius: 1 },
  chefRow: { flexDirection: 'row', alignItems: 'center', width: 38 },
  chefHandle: { width: 5, height: 5, borderWidth: 1, borderColor: colors.gold, borderRadius: 2.5 },
  chefPot: { flex: 1, height: 24, borderWidth: 1, borderColor: colors.gold, borderRadius: 4, marginHorizontal: -1 },
  cellarStack: { alignItems: 'center' },
  cellarNeck: { width: 6, height: 8, borderWidth: 1, borderColor: colors.gold, borderBottomWidth: 0, borderTopLeftRadius: 1, borderTopRightRadius: 1 },
  cellarBody: { width: 20, height: 24, borderWidth: 1, borderColor: colors.gold, borderRadius: 4, marginTop: -1 },
  commRow: { flexDirection: 'row', height: 22, width: 36 },
  commCircle: { width: 22, height: 22, borderWidth: 1, borderColor: colors.gold, borderRadius: 11 },
  commCircleOverlap: { marginLeft: -8 },
});

const TILES: ReadonlyArray<{ label: string; desc: string; route: string; Motif: () => React.JSX.Element }> = [
  { label: 'List',      desc: 'scan a wine list',      route: '/(tabs)/scan',      Motif: ListMotif },
  { label: 'Chef',      desc: 'get cooking',           route: '/(tabs)/chef',      Motif: ChefMotif },
  { label: 'Cellar',    desc: 'build your collection', route: '/(tabs)/cellar',    Motif: CellarMotif },
  { label: 'Community', desc: 'connect and share',     route: '/(tabs)/community', Motif: CommunityMotif },
];

// --- Featured personality strip -------------------------------------------
// Picks the most-recently-generated sketch (wine or recipe) and surfaces
// its title as a tappable card above the grid. Returns null when neither
// sketch exists, so brand-new users see the cleaner version of the home.
function useFeaturedPersonality(userId: string | undefined) {
  return useQuery({
    queryKey: ['home-featured-personality', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('last_wine_personality, last_wine_personality_at, last_recipe_personality, last_recipe_personality_at')
        .eq('user_id', userId!)
        .maybeSingle();
      if (!data) return null;
      const candidates: Array<{ category: 'wine' | 'recipe'; text: string; at: string | null }> = [];
      if (data.last_wine_personality) candidates.push({ category: 'wine', text: data.last_wine_personality, at: data.last_wine_personality_at });
      if (data.last_recipe_personality) candidates.push({ category: 'recipe', text: data.last_recipe_personality, at: data.last_recipe_personality_at });
      if (candidates.length === 0) return null;
      // Most recent first; nulls drop to the bottom via a sentinel string.
      candidates.sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));
      const top = candidates[0];
      const { title } = splitPersonality(top.text);
      return { category: top.category, title: title ?? '' };
    },
  });
}

export default function HomeScreen() {
  const { session } = useAuth();
  const username = (session?.user.user_metadata?.display_name ?? '').trim();
  const { data: featured } = useFeaturedPersonality(session?.user.id);

  // Nudge the user to generate a personality sketch once they've earned
  // one. Dismissing only hides it for this session — it returns on the
  // next app-open until they generate it.
  const personalityCategory = usePersonalityPrompt();
  const [promptDismissed, setPromptDismissed] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.appName}>VINSTER</Text>
          <Text style={styles.tagline}>Your AI Sommelier</Text>
          <View style={styles.ruleRow}>
            <View style={styles.rule} />
            <Text style={styles.ruleMark}>◇</Text>
            <View style={styles.rule} />
          </View>
          <Text style={styles.welcome}>
            {username ? `Welcome, ${username}` : 'Welcome'}
          </Text>
        </View>

        {featured?.title ? (
          <TouchableOpacity
            style={styles.featured}
            onPress={() => router.push(`/profile/personality?category=${featured.category}` as any)}
            activeOpacity={0.85}
          >
            <View style={styles.featuredBody}>
              <Text style={styles.featuredLabel}>
                {featured.category === 'wine' ? 'YOUR WINE PERSONALITY' : 'YOUR FOODIE PERSONALITY'}
              </Text>
              <Text style={styles.featuredTitle} numberOfLines={1}>{featured.title}</Text>
            </View>
            <Text style={styles.featuredArrow}>→</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.grid}>
          {TILES.map((tile) => {
            const Motif = tile.Motif;
            return (
              <TouchableOpacity
                key={tile.label}
                style={styles.tile}
                onPress={() => router.push(tile.route as any)}
                activeOpacity={0.8}
              >
                <View style={styles.tileMotif}>
                  <Motif />
                </View>
                <Text style={styles.tileTitle}>{tile.label}</Text>
                <View style={styles.tileDivider} />
                <Text style={styles.tileDesc}>{tile.desc}</Text>
                <Text style={styles.tileArrow}>→</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TabFooter />

      <PersonalityPromptModal
        visible={!!personalityCategory && !promptDismissed}
        category={personalityCategory ?? 'wine'}
        onGenerate={() => {
          setPromptDismissed(true);
          router.push(`/profile/personality?category=${personalityCategory}` as any);
        }}
        onDismiss={() => setPromptDismissed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingBottom: spacing.xxl },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.lg },

  // Hero — bigger letter-spacing on VINSTER, italic gold tagline, and a
  // small decorative rule with a diamond marker so the brand block reads
  // more "wine list" than "app shell".
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  appName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: '#FFFFFF', letterSpacing: 8 },
  tagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.gold, marginTop: 2, letterSpacing: 1 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: spacing.sm, marginBottom: spacing.sm, paddingHorizontal: spacing.xxl },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(224,184,74,0.55)' },
  ruleMark: { color: colors.gold, fontSize: 12, marginHorizontal: spacing.sm, fontFamily: 'CormorantGaramond_600SemiBold' },
  welcome: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 18, color: '#FFFFFF', marginTop: spacing.xs },

  // Featured strip — only renders when the user has at least one sketch.
  // Reads as a "your AI has been working" reward block.
  featured: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(224,184,74,0.06)' },
  featuredBody: { flex: 1 },
  featuredLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 11, color: 'rgba(224,184,74,0.75)', letterSpacing: 1.8, marginBottom: 2 },
  featuredTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.gold, letterSpacing: 0.5 },
  featuredArrow: { fontSize: 22, color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold' },

  // Tiles — motif at top, big gold label, short divider, italic tagline,
  // and a subtle → in the corner to telegraph navigation.
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  tile: { width: '48%', aspectRatio: 0.92, borderWidth: 1, borderColor: colors.gold, borderRadius: 16, paddingTop: spacing.lg, paddingHorizontal: spacing.md, paddingBottom: spacing.md, alignItems: 'center' },
  tileMotif: { height: 40, justifyContent: 'center', marginBottom: spacing.sm },
  tileTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 24, color: colors.gold, letterSpacing: 2, textAlign: 'center' },
  tileDivider: { width: 36, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', marginVertical: spacing.xs },
  tileDesc: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 2, paddingHorizontal: 4, lineHeight: 18 },
  tileArrow: { position: 'absolute', right: 10, bottom: 8, fontSize: 14, color: 'rgba(224,184,74,0.55)' },
});
