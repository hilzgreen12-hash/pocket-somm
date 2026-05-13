import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import * as Location from 'expo-location';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { extractWineList } from '../../src/services/ocr';
import { recommendWines } from '../../src/services/recommender';
import { colors, spacing } from '../../src/constants/theme';
import { COUNTRY_TO_CURRENCY } from '../../src/constants/currency';
import type { ExtractedWine } from '../../src/types/wine';
import type { UserPreferences } from '../../src/types/preferences';

async function detectLocalCurrency(): Promise<{ currency: string; country: string | null } | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
    const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    const iso = geo?.isoCountryCode?.toUpperCase();
    if (!iso) return null;
    const currency = COUNTRY_TO_CURRENCY[iso];
    if (!currency) return null;
    return { currency, country: geo?.country ?? null };
  } catch {
    return null;
  }
}

function askUseLocalCurrency(local: string, profile: string, country: string | null): Promise<string> {
  const where = country ? `in ${country}` : `somewhere using ${local}`;
  return new Promise((resolve) => {
    showAlert({
      title: 'Local currency detected',
      body: `You appear to be ${where}. Use local currency (${local}) for budget and value guidance on this list?`,
      dismissable: false,
      buttons: [
        { text: `Use ${local}`, onPress: () => resolve(local) },
        { text: `Keep ${profile}`, style: 'cancel', onPress: () => resolve(profile) },
      ],
    });
  });
}

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
      let wines: ExtractedWine[];
      if (imageUris) {
        // Multiple screenshots — run OCR in parallel and merge. Use
        // allSettled so one bad image (timeout, parse failure on a
        // dense page) doesn't sink the whole batch; we surface a
        // generic error only when every image failed.
        const results = await Promise.allSettled(imageUris.map(extractWineList));
        const fulfilled: ExtractedWine[] = [];
        const failures: string[] = [];
        for (const r of results) {
          if (r.status === 'fulfilled') fulfilled.push(...r.value);
          else failures.push(r.reason instanceof Error ? r.reason.message : String(r.reason));
        }
        if (fulfilled.length === 0) {
          throw new Error(
            failures[0] ??
            'No wines could be extracted from the uploaded images. Try fewer, clearer shots.'
          );
        }
        const seen = new Set<string>();
        wines = fulfilled.filter((w) => {
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

      // Step 2: Local-currency detection. If we can geolocate the user to a
      // country whose currency differs from their profile currency, ask
      // whether they want to apply local currency for this search. Skips
      // silently when permission is denied or country can't be resolved.
      const profileCurrency = (userProfile?.defaultCurrency ?? 'GBP').toUpperCase();
      let scanCurrency = profileCurrency;
      const detected = await detectLocalCurrency();
      if (!token.active) return;
      if (detected && detected.currency !== profileCurrency) {
        scanCurrency = await askUseLocalCurrency(detected.currency, profileCurrency, detected.country);
        if (!token.active) return;
      }

      // Step 3: Pre-filter by user profile then recommend
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
        currency: scanCurrency,
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
      durationMs={70000}
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
    fontSize: 16,
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
