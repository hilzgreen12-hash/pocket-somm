import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { prepareScanTiles } from '../../src/services/ocr';
import { finalizeRecommendation } from '../../src/services/recommender';
import { startScanJob, pollScanJob, logScanClientError, type StartedScanJob } from '../../src/api/scanJob';
import { useAuth } from '../../src/hooks/useAuth';
import { showAlert } from '../../src/components/AppAlert';
import { isNetworkError } from '../../src/api/invokeResilient';
import { ensureConnectionForUpload } from '../../src/utils/connectionGuard';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import { resolveIntelCurrency } from '../../src/utils/localCurrency';
import { noteHappyMoment } from '../../src/services/ratingPrompt';
import { File } from 'expo-file-system';

// The "reading your wine list" screen. It prepares the photos (or the chosen
// online list), starts the scan on the server (scan-start), polls until the
// picks are ready, then hands them to the results screen. On failure it shows
// "The Problem:" with a reference code; Try Again returns to Home to start over.
//
//   prepare photos → currency → start job → poll → finalise picks → results

type Stage = 'reading' | 'recommending' | 'error';

export default function ExtractingScreen() {
  useKeepAwake();
  const { imageUri, imageUris, imageSource, onlineSource, preferences, setExtractedWines, setRecommendation, setError } = useScanStore();
  const { preferences: userProfile, prefsLoading } = usePreferences();
  const [stage, setStage] = useState<Stage>('reading');
  const [errorDetail, setErrorDetail] = useState('');
  // Small print on the error screen: a reference code (the job's, or one made
  // on the phone) and the real reason, so any failure can be traced.
  const [errorRef, setErrorRef] = useState<{ ref: string; reason: string } | null>(null);
  const { session } = useAuth();
  const stepRef = useRef('checking the connection');
  // One id for this scan attempt (see startScanJob) — retries reuse the job.
  const clientRefRef = useRef(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
  const jobRef = useRef<StartedScanJob | null>(null);
  const source = onlineSource ? 'online' : imageSource;

  // A failure on the phone: show its reference and send it to the server log.
  function phoneFailure(reason: string) {
    const ref = jobRef.current ? jobRef.current.jobId.slice(0, 8).toUpperCase() : Math.random().toString(36).slice(2, 8).toUpperCase();
    const full = `${reason} (while ${stepRef.current})`;
    setErrorRef({ ref, reason: full });
    logScanClientError({ ref, stage: stepRef.current, message: reason, source, guest: !session });
  }

  // Start once, after the saved preferences have loaded — otherwise dislikes and
  // the default currency/budget could be silently missing from the scan.
  const started = useRef(false);
  const tokenRef = useRef({ active: true });
  useEffect(() => () => { tokenRef.current.active = false; }, []);
  useEffect(() => {
    if (started.current || prefsLoading) return;
    started.current = true;
    if (!imageUri && !imageUris && !onlineSource) {
      router.dismissTo('/scan/wine-list');
      return;
    }
    run(tokenRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsLoading]);

  async function run(token: { active: boolean }) {
    try {
      // Pre-flight the connection before the heavy upload: block if offline,
      // warn+confirm on a weak signal, otherwise proceed as usual.
      if (!(await ensureConnectionForUpload())) { router.dismissTo('/scan/wine-list'); return; }
      // Step 1: prepare the image(s) locally (resize/compress to base64). Only
      // the prep is client-side now; the OCR itself runs server-side in the job.
      setStage('reading');
      stepRef.current = 'preparing the photos';
      const uris = onlineSource ? [] : (imageUris ?? (imageUri ? [imageUri] : []));
      const images: string[] = [];
      for (const u of uris) {
        // A tall photo becomes 2–4 overlapping tiles so small print stays sharp.
        try { images.push(...await prepareScanTiles(u, imageSource)); }
        catch { /* skip an unreadable image; the batch continues */ }
      }
      if (!token.active) return;
      if (!images.length && !onlineSource) {
        setErrorDetail('Could not read the photo. Please try a clearer, well-lit shot with the full list in frame.');
        phoneFailure('none of the photos could be opened on this phone');
        setStage('error');
        return;
      }

      // Step 2: local-currency detection (client-side — GPS). Only PROMPTS when
      // the detected country's currency differs from the diner's home currency,
      // so home users are never asked. Done up front so the background job runs
      // uninterrupted.
      const profileCurrency = (userProfile?.defaultCurrency ?? 'GBP').toUpperCase();
      // Abroad, ask once per app session whether to use the local currency (the
      // answer is remembered). A list found online isn't where the phone is, so
      // it always uses the home currency.
      const scanCurrency = onlineSource ? profileCurrency : await resolveIntelCurrency(profileCurrency);
      if (!token.active) return;

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

      stepRef.current = 'sending the list';
      const input = onlineSource?.fileUri
        ? { pdfBase64: await new File(onlineSource.fileUri).base64() }
        : onlineSource ? { sourceUrl: onlineSource.url } : { images };
      const job = await startScanJob(input, { scanPreferences: preferences, profile, currency: scanCurrency }, clientRefRef.current);
      jobRef.current = job;
      if (!token.active) return;

      stepRef.current = 'waiting for the result';
      const outcome = await pollScanJob(job, {
        isCancelled: () => !token.active,
        timeoutMs: onlineSource ? 300000 : undefined,
        onStatus: (s) => { if (s === 'recommending') setStage('recommending'); },
      });
      if (!token.active) return;

      if (outcome.status === 'error' || !outcome.recommendation) {
        // The server's own record of what went wrong, under this job's code.
        setErrorRef({ ref: job.jobId.slice(0, 8).toUpperCase(), reason: outcome.failure || outcome.error || 'no picks came back' });
        setErrorDetail(outcome.error ?? (onlineSource ? "Vinster couldn't read that wine list. Try another result, or use Scan a List or Upload a List instead." : 'Vinster was unable to generate recommendations from this input — make sure the list is clear and well lit, with all the information in focus.'));
        setStage('error');
        return;
      }

      stepRef.current = 'showing the picks';
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
      noteHappyMoment('wine-list-scan');
      // Some photos couldn't be read: the picks are real, but from part of the list.
      // (Photos are sent as tiles, so this is "part of the list", not a count.)
      if (outcome.photosFailed && outcome.photosFailed > 0) {
        setTimeout(() => showAlert({
          title: "Part of the list couldn't be read",
          body: 'Your picks come from the rest of it. For the full list next time, take each page straight on, well lit and in focus.',
        }), 600);
      }
    } catch (err) {
      if (!token.active) return;
      if (err instanceof Error && err.message === 'cancelled') return;
      const message = err instanceof Error ? err.message : String(err);
      const isRateLimit = /minute|too many|rate limit/i.test(message);
      const friendly = isNetworkError(err)
        ? "Vinster couldn't reach the internet — you may be offline or on a weak signal. Find better reception and tap Try Again."
        : err instanceof Error && err.name === 'ScanTimeout'
        ? "This scan is taking much longer than usual — it isn't your photo. Please try again in a moment."
        : err instanceof Error && err.name === 'ScanLost'
        ? "Vinster lost touch with this scan — it isn't your photo. Please try again; signing in again may help."
        : isRateLimit
        ? message
        : 'Vinster was unable to generate recommendations from this input — make sure the list is clear and well lit, with all the information in focus.';
      setErrorDetail(friendly);
      setError(message);
      phoneFailure(message);
      setStage('error');
    }
  }

  if (stage === 'error') {
    return (
      <ScrollView contentContainerStyle={styles.errorContainer}>
        <Text style={styles.errorTitle}>Please Try Again!</Text>
        {/* "The Problem:" tells the user this is real feedback about their scan,
            not a generic failure. */}
        <Text style={styles.errorLabel}>The Problem:</Text>
        <Text style={styles.errorBody}>{errorDetail}</Text>
        {errorRef ? (
          <Text style={styles.errorRef} selectable>Ref {errorRef.ref} · {errorRef.reason.slice(0, 160)}</Text>
        ) : null}
        {/* Start again from the beginning: back to Home, with "How should
            Vinster read the list?" open (no half-remembered route or photo). */}
        <TouchableOpacity style={styles.retryButton} onPress={() => {
          const st = useScanStore.getState();
          st.reset();
          st.setRestartListChoice(true);
          router.dismissAll();
          router.navigate('/(tabs)' as any);
        }}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <SearchProgress
      title={stage === 'reading' ? (onlineSource ? 'Reading the wine list online…' : 'Reading your wine list…') : 'Finding your perfect match…'}
      subtitle={onlineSource ? 'Usually under a minute — longer lists can take up to two' : 'Usually under a minute'}
      body="Vinster is assessing the wine list for its 3 top picks based on critic scores, value for money, and vintage quality/drinkability, all set against your preferences"
      durationMs={onlineSource ? 120000 : 70000}
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
  // Header — large and white.
  errorTitle: {
    fontSize: 34,
    fontFamily: fonts.headingBold,
    color: '#FFFFFF',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  // "The Problem:" and the description beneath it, both gold.
  errorLabel: {
    fontSize: 18,
    fontFamily: fonts.bodySemibold,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  errorBody: {
    fontSize: 18,
    fontFamily: fonts.bodyRegular,
    color: colors.gold,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  // Reference code + real reason, small and quiet beneath the message.
  errorRef: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.md,
    marginBottom: spacing.xl,
    opacity: 0.8,
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
