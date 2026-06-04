import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useCellar } from '../../src/hooks/useCellar';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { useScanHistory } from '../../src/hooks/useScanHistory';
import { useChefLabelHistory, useChefPairingHistory } from '../../src/hooks/useChefHistory';
import { generatePersonality } from '../../src/api/label';
import { supabase } from '../../src/api/supabase';
import { splitPersonality } from '../../src/utils/personalityText';
import { PersonalityShareCard } from '../../src/components/PersonalityShareCard';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

type Category = 'wine' | 'recipe';

// Personality updates aren't user-triggered any more — the app surfaces a
// fresh sketch only when Vinster decides the user has engaged enough to
// have meaningfully evolved. The previous "I've evolved, Update my sketch"
// button (and its threshold + "Not yet" modal) were removed to prevent
// users from regenerating on demand.

export default function PersonalityScreen() {
  useKeepAwake();
  const { category } = useLocalSearchParams<{ category: string }>();
  const cat: Category = category === 'recipe' ? 'recipe' : 'wine';
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const { wines } = useCellar();
  const { chosenWines } = useChosenWines();
  const { archive } = useScanHistory();
  const { sessions: chefLabelSessions } = useChefLabelHistory();
  const { sessions: chefPairingSessions } = useChefPairingHistory();

  // Gate the auto-generate behind a minimum-activity bar so first-time users
  // don't get a personality sketch invented from nothing.
  // Wine: ≥2 wine list scans OR ≥5 bottles in the cellar.
  // Foodie: ≥2 total signals across rated/noted restaurants + saved recipes
  // (chef sessions) + chef pairings. Anything with content from the user
  // counts as one signal.
  const hasEnoughData = (() => {
    if (cat === 'wine') {
      const totalBottles = (wines ?? []).reduce((sum, w) => sum + (w.quantity ?? 0), 0);
      const wineListScanCount = archive?.length ?? 0;
      return wineListScanCount >= 2 || totalBottles >= 5;
    }
    const restaurantSignals = (archive ?? []).filter((a) =>
      (a.restaurantName && a.restaurantName.trim()) ||
      a.ratingOverall != null || a.ratingFood != null ||
      (a.restaurantNote && a.restaurantNote.trim())
    ).length;
    const labels = chefLabelSessions?.length ?? 0;
    const pairings = chefPairingSessions?.length ?? 0;
    return restaurantSignals + labels + pairings >= 2;
  })();

  const [text, setText] = useState<string | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const shareCardRef = useRef<View>(null);

  // When the user has the current sketch on screen, mark it acknowledged
  // so the "your personality is ready" popup on the home screen stops
  // firing for this version. A future regeneration will advance
  // lastGeneratedAt past the stored ack and the popup will return.
  useEffect(() => {
    if (text && lastGeneratedAt) {
      AsyncStorage.setItem(`vinster_personality_acked_${cat}`, lastGeneratedAt).catch(() => {});
    }
  }, [text, lastGeneratedAt, cat]);

  // Hydrate cached sketch + last-generated timestamp.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!session?.user.id) return;
    const textColumn = cat === 'wine' ? 'last_wine_personality' : 'last_recipe_personality';
    const tsColumn = cat === 'wine' ? 'last_wine_personality_at' : 'last_recipe_personality_at';
    supabase
      .from('profiles')
      .select(`${textColumn}, ${tsColumn}`)
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          if ((data as any)[textColumn]) setText((data as any)[textColumn]);
          if ((data as any)[tsColumn]) setLastGeneratedAt((data as any)[tsColumn]);
        }
        setHydrated(true);
      });
  }, [session?.user.id, cat]);

  // Auto-generate on first visit if there's no cached text yet AND the user
  // has met the minimum activity bar — otherwise we'd invent a sketch from
  // thin air on someone's first session.
  useEffect(() => {
    if (hydrated && !text && !loading && !error && hasEnoughData) {
      generate();
    }
  }, [hydrated, hasEnoughData]);

  async function generate() {
    if (!session?.user.id) return;
    setLoading(true);
    setError(null);
    try {
      const wineData = cat === 'wine'
        ? [
            ...(wines ?? []).map((w) => ({ producer: w.producer, wine_name: w.wine_name, vintage: w.vintage, region: w.region })),
            ...(chosenWines ?? []).map((w) => ({ producer: w.producer, wine_name: w.wine_name, vintage: w.vintage != null ? String(w.vintage) : null, region: w.region })),
          ].slice(0, 30)
        : undefined;
      // Foodie personality folds in restaurant dining history, saved
      // recipes (each pairing as its own entry, with the session's
      // favourite/star carried through), and any free-form pairing
      // searches. Together this gives Vinster a picture of where they
      // eat, what they cook, and what they treasure.
      const restaurantData = cat === 'recipe'
        ? archive
            .filter((a) => (a.restaurantName && a.restaurantName.trim()) || a.ratingOverall != null || a.ratingFood != null)
            .slice(0, 25)
            .map((a) => ({
              name: a.restaurantName,
              city: a.city,
              food: a.ratingFood,
              service: a.ratingService,
              wineList: a.ratingWineList,
              overall: a.ratingOverall,
              note: a.restaurantNote,
            }))
        : undefined;
      const recipeData = cat === 'recipe'
        ? (chefLabelSessions ?? [])
            .flatMap((s) => (s.pairings ?? []).map((p) => ({
              dishName: p.dishName,
              chefInspiration: p.chefInspiration ?? null,
              pairingNotes: p.pairingNotes ?? null,
              isFavourite: !!s.is_starred,
            })))
            .slice(0, 25)
        : undefined;
      const result = await generatePersonality(cat, {
        preferences: preferences as unknown as Record<string, unknown>,
        wines: wineData,
        restaurants: restaurantData,
        recipes: recipeData,
      });
      setText(result.text);
      setPublishState('idle');
      const now = new Date().toISOString();
      setLastGeneratedAt(now);
      const textColumn = cat === 'wine' ? 'last_wine_personality' : 'last_recipe_personality';
      const tsColumn = cat === 'wine' ? 'last_wine_personality_at' : 'last_recipe_personality_at';
      await supabase.from('profiles').upsert({
        user_id: session.user.id,
        [textColumn]: result.text,
        [tsColumn]: now,
      });
      // Append to the personality archive so the user can scroll back
      // through every sketch Vinster has ever drawn for them.
      await supabase.from('personality_sketches').insert({
        user_id: session.user.id,
        category: cat,
        text: result.text,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate personality.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadToCommunity() {
    if (!text || !session?.user.id || publishState !== 'idle') return;
    const username = session.user.user_metadata?.display_name
      || (session.user.email?.split('@')[0] ?? 'Anonymous');
    const field = cat === 'wine' ? 'wine_personality' : 'recipe_personality';
    setPublishState('saving');
    try {
      const { error } = await supabase.from('community_profiles').upsert({
        user_id: session.user.id,
        username,
        [field]: text,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setPublishState('saved');
    } catch (err) {
      setPublishState('idle');
      showAlert({ title: 'Could not upload', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function handleShare() {
    if (!text) return;
    const { title, body } = splitPersonality(text);
    const heading = cat === 'wine' ? 'My Wine Personality, by Vinster' : 'My Foodie Personality, by Vinster';
    const caption = [heading, title ? `\n${title}` : ''].filter(Boolean).join('\n');

    try {
      // Capture the off-screen branded card as a PNG and hand it to the
      // native share sheet. Falls back to text-only share if capture fails
      // or if expo-sharing isn't available on this device.
      if (shareCardRef.current) {
        // No fixed width/height — capture the card at its natural size so
        // the whole sketch is shared, however long it runs.
        const uri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: heading,
            UTI: 'public.png',
          });
          return;
        }
      }
      await Share.share({ message: `${caption}\n\n${body}`, title: heading });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          {text ? (
            <View style={styles.topRightStack}>
              <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.7}>
                <Text style={styles.shareText}>+ SHARE</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUploadToCommunity} disabled={publishState !== 'idle'} style={styles.postLinkBtn} activeOpacity={0.7}>
                <Text style={styles.postLinkText}>
                  {publishState === 'saved' ? 'posted ✓' : publishState === 'saving' ? 'posting…' : 'post to community'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.intro}>
          <Text style={styles.heading}>{
            cat === 'wine' ? 'Your Wine Personality' : 'Your Foodie Personality'
          }</Text>
          <Text style={styles.subheading}>A character sketch through the lens of your profile and your choices so far.</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>Vinster is sketching your personality…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>Couldn't generate</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={generate}>
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : !text && !hasEnoughData ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>We don't have enough on you yet</Text>
            <Text style={styles.errorBody}>
              {cat === 'wine'
                ? 'Scan some lists or labels for your personality sketch.'
                : 'Rate a few restaurants, save some recipes, or find wine pairings — we need a couple of breadcrumbs before we can sketch you as a foodie.'}
            </Text>
          </View>
        ) : text ? (
          <>
            <View style={styles.sketchCard}>
              {(() => {
                const { title, body } = splitPersonality(text);
                return (
                  <>
                    {title ? <Text style={styles.sketchTitle}>{title}</Text> : null}
                    <Text style={styles.sketchText}>{body}</Text>
                  </>
                );
              })()}
            </View>

            <TouchableOpacity
              onPress={() => router.push({ pathname: '/profile/personality-archive', params: { category: cat } })}
              style={styles.archiveLink}
              activeOpacity={0.7}
            >
              <Text style={styles.archiveLinkText}>Personality Archive →</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>

{/* Off-screen branded share card — rendered at its natural size (1080
          wide, height grows with the sketch) so the capture is never clipped. */}
      {text ? (
        <View style={styles.offscreenShareWrap} pointerEvents="none">
          {(() => {
            const { title, body } = splitPersonality(text);
            return <PersonalityShareCard ref={shareCardRef} title={title} body={body} category={cat} />;
          })()}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  topRightStack: { alignItems: 'flex-end', gap: 4 },
  postLinkBtn: { paddingVertical: 2, paddingHorizontal: 8 },
  postLinkText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  backRow: {},
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  shareBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  shareText: { fontFamily: fonts.headingBold, fontSize: 14, color: colors.gold, letterSpacing: 1 },
  intro: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center', gap: spacing.xs },
  heading: { fontFamily: fonts.headingBold, fontSize: 32, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  subheading: { fontFamily: fonts.headingItalic, fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: spacing.xs },
  center: { padding: spacing.xl, alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  loadingText: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.textMuted, textAlign: 'center' },
  errorTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text },
  errorBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  retryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  sketchCard: { marginHorizontal: spacing.xl, marginTop: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, backgroundColor: 'rgba(212,176,96,0.06)' },
  sketchTitle: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.gold, letterSpacing: 0.5, lineHeight: 30, marginBottom: spacing.md, textAlign: 'center' },
  sketchText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 26 },
  archiveLink: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  archiveLinkText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  // Hidden off-screen by position only (NOT opacity:0 — that degrades the
  // view-shot rasterisation on Android, which was softening the text).
  offscreenShareWrap: { position: 'absolute', left: -10000, top: 0 },
});
