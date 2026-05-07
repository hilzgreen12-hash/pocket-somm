import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useCellar } from '../../src/hooks/useCellar';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { useScanHistory } from '../../src/hooks/useScanHistory';
import { generatePersonality } from '../../src/api/label';
import { supabase } from '../../src/api/supabase';
import { splitPersonality } from '../../src/utils/personalityText';
import { colors, spacing } from '../../src/constants/theme';

type Category = 'wine' | 'recipe' | 'restaurant';

export default function PersonalityScreen() {
  useKeepAwake();
  const { category } = useLocalSearchParams<{ category: string }>();
  const cat: Category = category === 'recipe' ? 'recipe' : category === 'restaurant' ? 'restaurant' : 'wine';
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const { wines } = useCellar();
  const { chosenWines } = useChosenWines();
  const { archive } = useScanHistory();

  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from cached value on the user's profile so users don't burn a
  // call every time they open this screen — they only burn one when they
  // tap "Not quite me, have another go" or land on it for the first time.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!session?.user.id) return;
    const column = cat === 'wine' ? 'last_wine_personality'
      : cat === 'recipe' ? 'last_recipe_personality'
      : 'last_restaurant_personality';
    supabase.from('profiles').select(column).eq('user_id', session.user.id).single()
      .then(({ data }) => {
        if (data && (data as any)[column]) setText((data as any)[column]);
        setHydrated(true);
      });
  }, [session?.user.id, cat]);

  // Auto-generate on first visit if there's no cached text yet.
  useEffect(() => {
    if (hydrated && !text && !loading && !error) {
      generate();
    }
  }, [hydrated]);

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
      const restaurantData = cat === 'restaurant'
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
      const result = await generatePersonality(cat, {
        preferences: cat === 'restaurant' ? null : (preferences as unknown as Record<string, unknown>),
        wines: wineData,
        restaurants: restaurantData,
      });
      setText(result.text);
      // Cache to private profile so we don't regenerate every visit.
      const column = cat === 'wine' ? 'last_wine_personality'
        : cat === 'recipe' ? 'last_recipe_personality'
        : 'last_restaurant_personality';
      await supabase.from('profiles').upsert({ user_id: session.user.id, [column]: result.text });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate personality.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.intro}>
          <Text style={styles.heading}>{
            cat === 'wine' ? 'Your Wine Personality'
            : cat === 'recipe' ? 'Your Recipe Personality'
            : 'Your Restaurant Personality'
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
            <TouchableOpacity style={styles.regenBtn} onPress={generate}>
              <Text style={styles.regenBtnText}>Not quite me, have another go</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backRow: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, alignSelf: 'flex-start' },
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  intro: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center', gap: spacing.xs },
  heading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 32, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  subheading: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: spacing.xs },
  center: { padding: spacing.xl, alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  loadingText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  errorTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.text },
  errorBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  retryBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.gold },
  sketchCard: { marginHorizontal: spacing.xl, marginTop: spacing.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, backgroundColor: 'rgba(212,176,96,0.06)' },
  sketchTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 24, color: colors.gold, letterSpacing: 0.5, lineHeight: 30, marginBottom: spacing.md, textAlign: 'center' },
  sketchText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 16, color: colors.text, lineHeight: 26 },
  regenBtn: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg },
  regenBtnText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted },
});
