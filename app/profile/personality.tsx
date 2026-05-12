import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share, Modal } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
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

type Category = 'wine' | 'recipe';

// Threshold of new content the user needs to add since the last sketch was
// generated before "I've evolved" unlocks. Set conservatively so users don't
// regenerate every visit, but reachable within a couple of weeks of regular
// use.
const EVOLUTION_THRESHOLD = 5;

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
  const [evolveModalOpen, setEvolveModalOpen] = useState(false);
  const shareCardRef = useRef<View>(null);

  // Hydrate cached sketch + last-generated timestamp so we can gate the
  // "I've evolved" button on whether the user has added enough new material.
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

  // Count new items the user has added since the saved sketch was generated.
  // If we never stamped a timestamp (legacy users on a pre-existing sketch),
  // treat as unlocked so they can regenerate once and seed the timestamp.
  async function countNewItemsSinceSketch(): Promise<number> {
    if (!session?.user.id) return 0;
    if (!lastGeneratedAt) return EVOLUTION_THRESHOLD;
    const userId = session.user.id;
    if (cat === 'wine') {
      const [{ count: c1 }, { count: c2 }] = await Promise.all([
        supabase.from('cellar_wines').select('id', { count: 'exact', head: true })
          .eq('user_id', userId).gt('created_at', lastGeneratedAt),
        supabase.from('chosen_wines').select('id', { count: 'exact', head: true })
          .eq('user_id', userId).gt('chosen_at', lastGeneratedAt),
      ]);
      return (c1 ?? 0) + (c2 ?? 0);
    }
    const [{ count: c1 }, { count: c2 }, { count: c3 }] = await Promise.all([
      supabase.from('chef_label_sessions').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).gt('saved_at', lastGeneratedAt),
      supabase.from('chef_pairing_sessions').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).gt('saved_at', lastGeneratedAt),
      // New restaurant signals since the last sketch — any scan_session with
      // a restaurant_name or an overall rating counts.
      supabase.from('scan_sessions').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).gt('captured_at', lastGeneratedAt)
        .or('restaurant_name.not.is.null,rating_overall.not.is.null'),
    ]);
    return (c1 ?? 0) + (c2 ?? 0) + (c3 ?? 0);
  }

  async function handleEvolve() {
    const newItems = await countNewItemsSinceSketch();
    if (newItems >= EVOLUTION_THRESHOLD) {
      generate();
    } else {
      setEvolveModalOpen(true);
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
        const uri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 1,
          width: 1080,
          height: 1350,
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
            <TouchableOpacity style={styles.evolveBtn} onPress={handleEvolve} activeOpacity={0.8}>
              <Text style={styles.evolveBtnText}>I've evolved, Update my sketch</Text>
            </TouchableOpacity>

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

      <Modal visible={evolveModalOpen} transparent animationType="fade" onRequestClose={() => setEvolveModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEvolveModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Not yet</Text>
            <Text style={styles.modalBody}>Engage regularly with Vinster to generate an updated personality sketch.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setEvolveModalOpen(false)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Off-screen branded share card — sits at native render size so the
          capture comes out at 1080×1350 regardless of screen size. */}
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
  postLinkText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 12, color: colors.gold, textDecorationLine: 'underline' },
  backRow: {},
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  shareBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  shareText: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 14, color: colors.gold, letterSpacing: 1 },
  intro: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center', gap: spacing.xs },
  heading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 32, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  subheading: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: spacing.xs },
  center: { padding: spacing.xl, alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  loadingText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  errorTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.text },
  errorBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  retryBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.gold },
  evolveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg },
  evolveBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.gold },
  sketchCard: { marginHorizontal: spacing.xl, marginTop: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, backgroundColor: 'rgba(212,176,96,0.06)' },
  sketchTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 24, color: colors.gold, letterSpacing: 0.5, lineHeight: 30, marginBottom: spacing.md, textAlign: 'center' },
  sketchText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 16, color: colors.text, lineHeight: 26 },
  archiveLink: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  archiveLinkText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  offscreenShareWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  modalBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  modalButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  modalButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
});
