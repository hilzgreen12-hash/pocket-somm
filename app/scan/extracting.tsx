import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { prepareScanImageBase64 } from '../../src/services/ocr';
import { finalizeRecommendation } from '../../src/services/recommender';
import { startScanJob, pollScanJob } from '../../src/api/scanJob';
import { isNetworkError } from '../../src/api/invokeResilient';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import { detectLocalCurrency, askUseLocalCurrency } from '../../src/utils/localCurrency';

type Stage = 'reading' | 'recommending' | 'error';

export default function ExtractingScreen() {
  useKeepAwake();
  const { imageUri, imageUris, imageSource, preferences, setExtractedWines, setRecommendation, setError } = useScanStore();
  const { preferences: userProfile } = usePreferences();
  const [stage, setStage] = useState<Stage>('reading');
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    if (!imageUri && !imageUris) {
      router.dismissTo('/scan/wine-list');
      return;
    }
    const token = { active: true };
    run(token);
    return () => { token.active = false; };
  }, []);

  async function run(token: { active: boolean }) {
    try {
      // Step 1: prepare the image(s) locally (resize/compress to base64). Only
      // the prep is client-side now; the OCR itself runs server-side in the job.
      setStage('reading');
      const uris = imageUris ?? (imageUri ? [imageUri] : []);
      const images: string[] = [];
      for (const u of uris) {
        try { images.push(await prepareScanImageBase64(u, imageSource)); }
        catch { /* skip an unreadable image; the batch continues */ }
      }
      if (!token.active) return;
      if (!images.length) {
        setErrorDetail('Could not read the photo. Please try a clearer, well-lit shot with the full list in frame.');
        setStage('error');
        return;
      }

      // Step 2: local-currency detection (client-side — GPS). Only PROMPTS when
      // the detected country's currency differs from the diner's home currency,
      // so home users are never asked. Done up front so the background job runs
      // uninterrupted.
      const profileCurrency = (userProfile?.defaultCurrency ?? 'GBP').toUpperCase();
      let scanCurrency = profileCurrency;
      const detected = await detectLocalCurrency();
      if (!token.active) return;
      if (detected && detected.currency !== profileCurrency) {
        scanCurrency = await askUseLocalCurrency(detected.currency, profileCurrency, detected.country);
        if (!token.active) return;
      }

      // Step 3: start the async job (returns in <1s), then poll for the result.
      // The colour "no {colour} wines" check and the preference pre-filters now
      // run server-side inside the job — the app never holds the ~90s connection.
      const profile = userProfile ? {
        dislikedRegions: userProfile.dislikedRegions,
        dislikedGrapes: userProfile.dislikedGrapes,
        defaultBudget: userProfile.defaultBudget,
        favouriteRegions: userProfile.favouriteRegions,
        favouriteGrapes: userProfile.favouriteGrapes,
      } : null;

      const jobId = await startScanJob(images, { scanPreferences: preferences, profile, currency: scanCurrency });
      if (!token.active) return;

      const outcome = await pollScanJob(jobId, {
        isCancelled: () => !token.active,
        onStatus: (s) => { if (s === 'recommending') setStage('recommending'); },
      });
      if (!token.active) return;

      if (outcome.status === 'error' || !outcome.recommendation) {
        setErrorDetail(outcome.error ?? 'Vinster was unable to generate recommendations from this input — make sure the list is clear and well lit, with all the information in focus.');
        setStage('error');
        return;
      }

      // Apply the same post-processing as the inline path — crucially, inject the
      // real menu price into each pick from the OCR-read list.
      const recommendation = finalizeRecommendation(outcome.recommendation, {
        wines: outcome.wines ?? [],
        currency: scanCurrency,
      });
      if (!recommendation.wines.length) {
        setErrorDetail('No wines on this list matched your preferences. Try widening your budget or clearing a filter, then scan again.');
        setStage('error');
        return;
      }

      if (outcome.wines) setExtractedWines(outcome.wines);
      setRecommendation(recommendation);
      // Land results DIRECTLY on the Wine List form: dismiss the transient
      // camera/preview/extracting screens first, then push results. Otherwise
      // those screens sit below results in the stack and Back — including the
      // Android system back, which the native stack handles itself and JS
      // BackHandler can't intercept — pops to a stale/erroring transient screen.
      router.dismissTo('/scan/wine-list');
      router.push('/scan/results');
    } catch (err) {
      if (!token.active) return;
      if (err instanceof Error && err.message === 'cancelled') return;
      const message = err instanceof Error ? err.message : String(err);
      const isRateLimit = /minute|too many|rate limit/i.test(message);
      const friendly = isNetworkError(err)
        ? "Vinster couldn't reach the internet — you may be offline or on a weak signal. Find better reception and tap Try Again."
        : isRateLimit
        ? message
        : 'Vinster was unable to generate recommendations from this input — make sure the list is clear and well lit, with all the information in focus.';
      setErrorDetail(friendly);
      setError(message);
      setStage('error');
    }
  }

  if (stage === 'error') {
    return (
      <ScrollView contentContainerStyle={styles.errorContainer}>
        <Text style={styles.errorTitle}>Please try again!</Text>
        <Text style={styles.errorBody}>{errorDetail}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.dismissTo('/scan/wine-list')}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <SearchProgress
      title={stage === 'reading' ? 'Reading your wine list…' : 'Finding your perfect match…'}
      subtitle="Vinster needs up to a minute for your result"
      body="Vinster is assessing the wine list for its 3 top picks based on critic scores, value for money, and vintage quality/drinkability, all set against your preferences"
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
    fontFamily: fonts.headingSemibold,
    color: colors.text,
    letterSpacing: 1.5,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.headingBold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  // Italic timing hint sitting under the progress title — body-italic.
  timing: {
    fontSize: 16,
    fontFamily: fonts.bodyItalic,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  stayNote: {
    fontSize: 12,
    fontFamily: fonts.bodySemibold,
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
    fontFamily: fonts.headingBold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 20,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 28,
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
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
  },
});
