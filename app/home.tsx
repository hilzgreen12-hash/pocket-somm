import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';
import { usePersonalityPrompt } from '../src/hooks/usePersonalityPrompt';
import { PersonalityPromptModal } from '../src/components/PersonalityPromptModal';
import { supabase } from '../src/api/supabase';
import { splitPersonality } from '../src/utils/personalityText';
import { colors, spacing } from '../src/constants/theme';
import { fonts } from '../src/constants/fonts';

// Per-category AsyncStorage key — set to the timestamp of the most recent
// sketch the user has viewed for that category. Popup re-appears whenever
// the live sketch's timestamp is newer than (or absent from) the ack.
function ackKey(category: 'wine' | 'recipe') {
  return `vinster_personality_acked_${category}`;
}

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
  // Classic chef's hat — a wider puff (rounded top, flat bottom) sitting
  // on a narrower band. Both outlined in gold so the silhouette reads at
  // the small tile size.
  return (
    <View style={motifStyles.chefStack}>
      <View style={motifStyles.chefPuff} />
      <View style={motifStyles.chefBand} />
    </View>
  );
}

function CellarMotif() {
  // Wine bottle lying on its side — small solid cork on the left, a thin
  // neck, then a fuller rounded body. Reads horizontally as a single
  // bottle silhouette.
  return (
    <View style={motifStyles.bottleRow}>
      <View style={motifStyles.bottleCork} />
      <View style={motifStyles.bottleNeck} />
      <View style={motifStyles.bottleBody} />
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
  chefStack: { alignItems: 'center' },
  // Puff: wider rounded-top rectangle with no bottom border so it flows
  // into the band. Band: narrower rectangle below.
  chefPuff: { width: 28, height: 20, borderWidth: 1, borderColor: colors.gold, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomWidth: 0 },
  chefBand: { width: 22, height: 6, borderWidth: 1, borderColor: colors.gold, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  bottleRow: { flexDirection: 'row', alignItems: 'center' },
  bottleCork: { width: 3, height: 5, backgroundColor: colors.gold, borderRadius: 1 },
  bottleNeck: { width: 8, height: 7, borderWidth: 1, borderColor: colors.gold, marginLeft: 1 },
  bottleBody: { width: 20, height: 15, borderWidth: 1, borderColor: colors.gold, borderRadius: 3, marginLeft: -1 },
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

// --- Featured personality (popup-driven) ----------------------------------
// Returns the most-recently-generated sketch (wine or recipe) so the home
// can decide whether to surface the "your personality is ready" popup.
// Includes the generation timestamp so the popup can re-fire after Vinster
// updates the sketch — never bug users about a sketch they've already
// acknowledged, but never miss a fresh one either.
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
      candidates.sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));
      const top = candidates[0];
      const { title } = splitPersonality(top.text);
      return { category: top.category, title: title ?? '', at: top.at };
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

  // "Your personality is ready" popup — fires when Vinster has generated
  // a sketch the user hasn't viewed yet (or has generated a NEW sketch
  // since the last view). Dismiss-for-now closes the popup but it returns
  // every time the home regains focus until the user actually views the
  // sketch. View = navigate to /profile/personality; the personality
  // screen itself writes the ack timestamp so the popup stops re-firing.
  const [readyPopupVisible, setReadyPopupVisible] = useState(false);
  useFocusEffect(useCallback(() => {
    let cancelled = false;
    (async () => {
      if (!featured?.at) { if (!cancelled) setReadyPopupVisible(false); return; }
      const ackedAt = await AsyncStorage.getItem(ackKey(featured.category));
      const needsAck = !ackedAt || (featured.at ?? '') > ackedAt;
      if (!cancelled) setReadyPopupVisible(needsAck);
    })();
    return () => { cancelled = true; };
  }, [featured?.at, featured?.category]));

  function handleViewReady() {
    if (!featured) return;
    setReadyPopupVisible(false);
    router.push(`/profile/personality?category=${featured.category}` as any);
  }
  function handleDismissReady() {
    // Local-state dismiss only — leaves the AsyncStorage ack untouched so
    // the popup reappears the next time the user lands on home.
    setReadyPopupVisible(false);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={require('../assets/vinster-logo.png')} style={styles.logo} resizeMode="contain" />
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

      <PersonalityPromptModal
        visible={!!personalityCategory && !promptDismissed}
        category={personalityCategory ?? 'wine'}
        onGenerate={() => {
          setPromptDismissed(true);
          router.push(`/profile/personality?category=${personalityCategory}` as any);
        }}
        onDismiss={() => setPromptDismissed(true)}
      />

      {/* "Your personality is ready" popup — surfaces a freshly generated
          sketch each time the user lands on home, until they view it. */}
      <Modal
        visible={readyPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDismissReady}
      >
        <TouchableOpacity style={styles.readyOverlay} activeOpacity={1} onPress={handleDismissReady}>
          <TouchableOpacity activeOpacity={1} style={styles.readySheet} onPress={() => {}}>
            <Text style={styles.readyLabel}>
              {featured?.category === 'wine' ? 'YOUR WINE PERSONALITY' : 'YOUR FOODIE PERSONALITY'}
            </Text>
            <Text style={styles.readyHeading}>Your sketch is ready</Text>
            {featured?.title ? (
              <Text style={styles.readyTitle} numberOfLines={2}>"{featured.title}"</Text>
            ) : null}
            <Text style={styles.readyBody}>
              Vinster has sketched a fresh personality for you — take a look, share it with friends, or just enjoy it.
            </Text>
            <TouchableOpacity style={styles.readyPrimaryBtn} onPress={handleViewReady} activeOpacity={0.8}>
              <Text style={styles.readyPrimaryBtnText}>View my personality</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.readyDismissBtn} onPress={handleDismissReady} activeOpacity={0.7}>
              <Text style={styles.readyDismissBtnText}>Not now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingBottom: spacing.xxl },
  // Top padding doubled (48 → 96) so VINSTER sits comfortably below the
  // status bar / notch instead of crowding the top edge.
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl * 2, paddingBottom: spacing.lg },

  // Hero — bigger letter-spacing on VINSTER, italic gold tagline, and a
  // small decorative rule with a diamond marker so the brand block reads
  // more "wine list" than "app shell".
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 240, height: 210, marginBottom: spacing.xs },
  appName: { fontFamily: fonts.headingBold, fontSize: 44, color: '#FFFFFF', letterSpacing: 8 },
  tagline: { fontFamily: fonts.headingItalic, fontSize: 15, color: colors.gold, marginTop: 2, letterSpacing: 1 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: spacing.sm, marginBottom: spacing.sm, paddingHorizontal: spacing.xxl },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(224,184,74,0.55)' },
  ruleMark: { color: colors.gold, fontSize: 12, marginHorizontal: spacing.sm, fontFamily: fonts.headingSemibold },
  welcome: { fontFamily: fonts.headingItalic, fontSize: 18, color: '#FFFFFF', marginTop: spacing.xs },

  // "Your personality is ready" popup styles — centred sheet over a dim
  // overlay; tapping outside or "Not now" dismisses for this session.
  readyOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  readySheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  readyLabel: { fontFamily: fonts.headingSemibold, fontSize: 11, color: 'rgba(224,184,74,0.75)', letterSpacing: 1.8, textAlign: 'center', marginBottom: spacing.xs },
  readyHeading: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  readyTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.gold, textAlign: 'center', lineHeight: 32, marginBottom: spacing.md },
  readyBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  readyPrimaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  readyPrimaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
  readyDismissBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  readyDismissBtnText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },

  // Tiles — motif at top, big gold label, short divider, italic tagline,
  // and a subtle → in the corner to telegraph navigation.
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  tile: { width: '48%', aspectRatio: 0.92, borderWidth: 1, borderColor: colors.gold, borderRadius: 16, paddingTop: spacing.lg, paddingHorizontal: spacing.md, paddingBottom: spacing.md, alignItems: 'center' },
  tileMotif: { height: 40, justifyContent: 'center', marginBottom: spacing.sm },
  tileTitle: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.gold, letterSpacing: 2, textAlign: 'center' },
  tileDivider: { width: 36, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', marginVertical: spacing.xs },
  tileDesc: { fontFamily: fonts.headingItalic, fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 2, paddingHorizontal: 4, lineHeight: 18 },
  tileArrow: { position: 'absolute', right: 10, bottom: 8, fontSize: 14, color: 'rgba(224,184,74,0.55)' },
});
