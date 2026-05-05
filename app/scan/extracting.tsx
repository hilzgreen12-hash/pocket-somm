import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { extractWineList } from '../../src/services/ocr';
import { recommendWines } from '../../src/services/recommender';
import { colors, spacing } from '../../src/constants/theme';
import type { ExtractedWine } from '../../src/types/wine';
import type { UserPreferences } from '../../src/types/preferences';

function preFilterWines(wines: ExtractedWine[], prefs: UserPreferences | null | undefined): ExtractedWine[] {
  if (!prefs) return wines.slice(0, 80);

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

  return [...favourited, ...others].slice(0, 80);
}

type Stage = 'reading' | 'recommending' | 'error';

export default function ExtractingScreen() {
  useKeepAwake();
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
        wineTypes: preferences.wineTypes,
        styleProfiles: preferences.styleProfiles,
        budget: preferences.budget,
        foodPairing: preferences.foodPairing,
        favouriteRegions: preferences.favouriteRegions,
        favouriteGrapes: preferences.favouriteGrapes,
        dislikedRegions: preferences.dislikedRegions,
        dislikedGrapes: preferences.dislikedGrapes,
        profileWineTypes: preferences.profileWineTypes,
        profileStyleProfiles: preferences.profileStyleProfiles,
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
    <SearchProgress
      title={stage === 'reading' ? 'Reading your wine list…' : 'Finding your perfect match…'}
      subtitle="Vinster needs up to a minute for your result"
      body={stage === 'reading'
        ? 'Identifying every wine on the list'
        : 'Scoring by critic rating, vintage quality and value'}
    />
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
  brand: {
    fontSize: 36,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.text,
    letterSpacing: 1.5,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  timing: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
  stayNote: {
    fontSize: 12,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    opacity: 0.8,
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
    borderWidth: 1,
    borderColor: '#FFFFFF',
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
