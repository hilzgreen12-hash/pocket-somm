import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { extractWineList } from '../../src/services/ocr';
import { recommendWines } from '../../src/services/recommender';
import { colors, spacing } from '../../src/constants/theme';
import type { ExtractedWine } from '../../src/types/wine';
import type { UserPreferences } from '../../src/types/preferences';

function preFilterWines(wines: ExtractedWine[], prefs: UserPreferences | null | undefined): ExtractedWine[] {
  if (!prefs) return wines.slice(0, 25);

  let filtered = wines;

  // Hard filter: remove disliked regions
  if (prefs.dislikedRegions?.length) {
    filtered = filtered.filter((w) =>
      !prefs.dislikedRegions.some((r) =>
        w.region?.toLowerCase().includes(r.toLowerCase()) ||
        (w.appellation ?? '').toLowerCase().includes(r.toLowerCase())
      )
    );
  }

  // Hard filter: remove disliked grapes
  if (prefs.dislikedGrapes?.length) {
    filtered = filtered.filter((w) =>
      !prefs.dislikedGrapes.some((g) =>
        (w.grape ?? '').toLowerCase().includes(g.toLowerCase())
      )
    );
  }

  // Hard filter: remove wines above budget
  if (prefs.defaultBudget) {
    filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
  }

  // Soft sort: favourites first
  const isFavourite = (w: ExtractedWine) =>
    prefs.favouriteRegions?.some((r) => w.region?.toLowerCase().includes(r.toLowerCase())) ||
    prefs.favouriteGrapes?.some((g) => (w.grape ?? '').toLowerCase().includes(g.toLowerCase()));

  const favourited = filtered.filter(isFavourite);
  const others = filtered.filter((w) => !isFavourite(w));

  return [...favourited, ...others].slice(0, 25);
}

type Stage = 'reading' | 'recommending' | 'error';

export default function ExtractingScreen() {
  const { imageUri, imageUris, preferences, setExtractedWines, setRecommendation, setError } = useScanStore();
  const { preferences: userProfile } = usePreferences();
  const [stage, setStage] = useState<Stage>('reading');
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    if (!imageUri && !imageUris) {
      router.replace('/(tabs)/scan');
      return;
    }
    const token = { active: true };
    run(token);
    return () => { token.active = false; };
  }, []);

  async function run(token: { active: boolean }) {
    try {
      // Step 1: OCR
      setStage('reading');
      let wines;
      if (imageUris) {
        // Multiple screenshots — run OCR in parallel and merge
        const results = await Promise.all(imageUris.map(extractWineList));
        const seen = new Set<string>();
        wines = results.flat().filter((w) => {
          const key = `${w.name}__${w.producer}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      } else {
        wines = await extractWineList(imageUri!);
      }

      if (!token.active) return;

      if (!wines.length) {
        setErrorDetail('No wines were detected. Try a clearer shot with better lighting, and make sure the full list is in frame.');
        setStage('error');
        return;
      }

      setExtractedWines(wines);

      // Step 2: Pre-filter by user profile then recommend
      setStage('recommending');
      const winesForRecommend = preFilterWines(wines, userProfile);
      const recommendation = await recommendWines({
        wines: winesForRecommend,
        wineType: preferences.wineType,
        styleProfiles: preferences.styleProfiles,
        budget: preferences.budget,
        foodPairing: preferences.foodPairing,
      });

      if (!token.active) return;

      setRecommendation(recommendation);
      router.replace('/scan/results');
    } catch (err) {
      if (!token.active) return;
      const message = err instanceof Error ? err.message : String(err);
      setErrorDetail(message);
      setError(message);
      setStage('error');
    }
  }

  if (stage === 'error') {
    return (
      <ScrollView contentContainerStyle={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorBody}>{errorDetail}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.replace('/(tabs)/scan')}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.gold} />
      <Text style={styles.title}>
        {stage === 'reading' ? 'Reading wine list…' : 'Finding your best match…'}
      </Text>
      <Text style={styles.body}>
        {stage === 'reading'
          ? 'This could take a minute or two'
          : 'Scoring by critic rating, vintage quality and value'}
      </Text>
      {stage === 'reading' && (
        <Text style={styles.profileNote}>
          We're making a recommendation based on your profile preferences. Change your preferences for this result only by setting filters for this search.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
  profileNote: {
    fontSize: 12,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.burgundy,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryText: {
    color: '#fff',
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
  },
});
