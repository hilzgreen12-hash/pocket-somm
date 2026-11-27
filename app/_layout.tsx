import { useEffect } from 'react';
import { ShareIntentProvider } from 'expo-share-intent';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { AppBottomBar } from '../src/components/AppBottomBar';
import { FoundBannerHost } from '../src/components/FoundBanner';
import { ScanCloudBackfillRunner } from '../src/components/ScanCloudBackfillRunner';
import { SignedInGuard } from '../src/components/SignedInGuard';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/hooks/useAuth';
import * as Font from 'expo-font';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/api/supabase';
import * as ScreenOrientation from 'expo-screen-orientation';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { UpdatePromptModal } from '../src/components/UpdatePromptModal';
import { AppAlertHost, showAlert } from '../src/components/AppAlert';
import { PersistedQueryProvider } from '../src/components/PersistedQueryProvider';
import { configurePersistedQueries } from '../src/api/queryPersistence';
import { markRecoveryPending, recoveryLinkState, setRecoveryState } from '../src/services/recoveryLink';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Links being redeemed right now (by fingerprint).
const redeemingNow = new Set<string>();

// React Query defaults tuned for a mobile app where most data (cellar
// inventory, racks, profile prefs, scan history) doesn't change without the
// user explicitly mutating it. Mutations still invalidate keys directly so
// fresh writes are reflected immediately; this just stops every screen
// re-mount from triggering an unnecessary refetch.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,           // treat data as fresh for 60s — no eager refetch
      gcTime: 5 * 60_000,          // keep cache for 5 min after last subscriber unmounts
      refetchOnWindowFocus: false, // don't refetch when app regains focus
      refetchOnReconnect: true,    // do refetch when network comes back
      retry: 1,                    // a single retry on failure (default 3 was overkill)
      // Run queries even with no connection: on failure they ERROR (which
      // screens handle) instead of hanging forever in the default "paused"
      // state — that pause was what left offline launches on a blank screen.
      networkMode: 'offlineFirst',
    },
  },
});
// Lists, carousels and storage grids are saved to disk and restored on the
// next open, so they draw at once and refresh in the background.
configurePersistedQueries(queryClient);

export default function RootLayout() {
  const [fontsLoaded, fontError] = Font.useFonts({
    // Display / editorial — Cormorant Garamond. Used on headers,
    // tab blurbs, buttons, pop-up titles, About Vinster and the
    // header / blurb pair on every tab landing screen.
    CormorantGaramond_400Regular: require('@expo-google-fonts/cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf'),
    CormorantGaramond_400Regular_Italic: require('@expo-google-fonts/cormorant-garamond/400Regular_Italic/CormorantGaramond_400Regular_Italic.ttf'),
    CormorantGaramond_600SemiBold: require('@expo-google-fonts/cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf'),
    CormorantGaramond_700Bold: require('@expo-google-fonts/cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf'),
    // Body / readability — Inter. Used everywhere else: body text,
    // form labels, card content, pop-up bodies, hints, captions etc.
    // See src/constants/fonts.ts for the semantic mapping.
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_400Regular_Italic: require('@expo-google-fonts/inter/400Regular_Italic/Inter_400Regular_Italic.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
    // Body trial — Spectral. Loaded so a couple of screens (currently
    // cellar/list and cellar/stats) can override their body text and
    // see whether Spectral reads better than Cormorant before we
    // commit to a global swap.
    Spectral_400Regular: require('@expo-google-fonts/spectral/400Regular/Spectral_400Regular.ttf'),
    Spectral_400Regular_Italic: require('@expo-google-fonts/spectral/400Regular_Italic/Spectral_400Regular_Italic.ttf'),
    Spectral_500Medium: require('@expo-google-fonts/spectral/500Medium/Spectral_500Medium.ttf'),
    Spectral_600SemiBold: require('@expo-google-fonts/spectral/600SemiBold/Spectral_600SemiBold.ttf'),
    Spectral_700Bold: require('@expo-google-fonts/spectral/700Bold/Spectral_700Bold.ttf'),
  });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // The auth links already acted on (short fingerprints, newest last).
    const HANDLED_KEY = 'vinster_handled_auth_links';
    const fingerprint = (u: string) => {
      let h = 0;
      for (let i = 0; i < u.length; i++) h = (Math.imul(31, h) + u.charCodeAt(i)) | 0;
      return `${u.length}:${h}`;
    };
    // In memory too: the same link can arrive twice at once, before storage is written.
    const handledNow = new Set<string>();
    async function linkAlreadyHandled(fp: string): Promise<boolean> {
      if (handledNow.has(fp)) return true;
      handledNow.add(fp);
      try {
        const seen: string[] = JSON.parse((await AsyncStorage.getItem(HANDLED_KEY)) ?? '[]');
        if (seen.includes(fp)) return true;
      } catch { /* storage unavailable: handle the link as before */ }
      return false;
    }
    // Remembered across restarts only once the link has actually been
    // redeemed — a failed attempt (offline) leaves the link usable again.
    async function rememberHandled(fp: string) {
      try {
        const seen: string[] = JSON.parse((await AsyncStorage.getItem(HANDLED_KEY)) ?? '[]');
        if (!seen.includes(fp)) await AsyncStorage.setItem(HANDLED_KEY, JSON.stringify([...seen, fp].slice(-20)));
      } catch { /* storage unavailable */ }
    }

    // Supabase email-confirm redirects can land here in one of two shapes:
    //   1. Server-verified flow: vinster://auth/callback#access_token=…&refresh_token=…
    //      (or the same params as a query string). Supabase has already
    //      verified the OTP on its server; we just need to install the
    //      tokens as our session via setSession.
    //   2. PKCE / client-verify flow: vinster://auth/callback?token_hash=…&type=signup
    //      Here we redeem the OTP ourselves via verifyOtp.
    // Earlier code only handled (2), which is why fresh signups were landing
    // back in the app without a session. This handler now covers both.
    async function handleUrl(url: string) {
      // Act on each sign-in / reset link only once. Android hands the link
      // that opened the app back again (getInitialURL, the url event, a
      // restart), and a reset link's tokens stay valid for a while — handling
      // it again put the user back on "Set a new password" after they had
      // already set one. Remembered across restarts.
      if (!/(access_token|token_hash)=/.test(url)) return;
      const looksLikeRecovery = /[?#&]type=recovery\b/.test(url);
      // Tell the reset screen a recovery link is being worked on, so it waits
      // for the outcome rather than sending the user home.
      if (looksLikeRecovery && recoveryLinkState() !== 'pending') setRecoveryState('redeeming');
      const fp = fingerprint(url);
      if (await linkAlreadyHandled(fp)) {
        if (recoveryLinkState() === 'redeeming' && looksLikeRecovery && redeemingNow.size === 0) setRecoveryState('idle');
        return;
      }
      redeemingNow.add(fp);
      let isRecovery = looksLikeRecovery;
      // Wrapped in try/catch because Linking.parse, setSession, and verifyOtp
      // can all throw (malformed URL, expired/already-redeemed token, network).
      // An unhandled rejection inside the addEventListener('url', …) callback
      // is silently swallowed by React Native at best, and surfaces as a
      // confusing yellow box in development. Log so TestFlight diagnostics
      // can see when deep-link redemption is failing.
      try {
        const { queryParams } = Linking.parse(url);

        // Pull params from both query string AND hash fragment (Supabase
        // server-redirect uses the fragment by default).
        const fragmentParams: Record<string, string> = {};
        const hashIdx = url.indexOf('#');
        if (hashIdx >= 0) {
          const hash = url.slice(hashIdx + 1);
          for (const pair of hash.split('&')) {
            const [k, v] = pair.split('=');
            if (k) fragmentParams[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
          }
        }

        // type is carried in the query string (PKCE flow) or the hash
        // fragment (server-redirect flow). A recovery link must land the
        // user on the reset-password screen to set a new password —
        // every other type just re-evaluates the session at index.
        const type = (queryParams?.type as string | undefined) ?? fragmentParams.type;
        isRecovery = type === 'recovery';
        if (isRecovery && recoveryLinkState() !== 'pending') setRecoveryState('redeeming');
        const dest = isRecovery ? '/auth/reset-password' : '/';

        // Once a link is redeemed: remember it, and for a recovery link flag
        // that a password reset is genuinely pending (the reset screen only
        // shows while this is set).
        const onRedeemed = async () => {
          await rememberHandled(fp);
          if (isRecovery) await markRecoveryPending();
          router.replace(dest);
        };

        const access_token = (queryParams?.access_token as string | undefined) ?? fragmentParams.access_token;
        const refresh_token = (queryParams?.refresh_token as string | undefined) ?? fragmentParams.refresh_token;
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
          // Bounce back through the index router so it re-evaluates with the
          // fresh session — otherwise the user can land on the public welcome
          // screen (because index already decided "no session" before we
          // installed it) and miss the onboarding tour entirely.
          await onRedeemed();
          return;
        }

        const token_hash = (queryParams?.token_hash as string | undefined) ?? fragmentParams.token_hash;
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
          if (error) throw error;
          await onRedeemed();
          return;
        }
        // Nothing redeemable in the link.
        if (isRecovery && recoveryLinkState() === 'redeeming') setRecoveryState('failed');
      } catch (err) {
        console.warn('[deep-link] handleUrl failed:', url, err);
        // Let the same link be tried again (e.g. once back online).
        handledNow.delete(fp);
        if (isRecovery && recoveryLinkState() === 'redeeming') setRecoveryState('failed');
        showAlert({
          title: isRecovery ? 'Could Not Open Reset Link' : 'Could Not Open Link',
          body: isRecovery
            ? 'Please check your connection and tap the link in your email again, or request a new one.'
            : 'Please check your connection and tap the link in your email again.',
        });
      } finally {
        redeemingNow.delete(fp);
      }
    }

    Linking.getInitialURL().then((url) => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    // Share sheet → Vinster (a label photo / screenshot): read on Home, which
    // generates its Wine Intel. Must wrap everything (expo-share-intent).
    <ShareIntentProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <KeyboardProvider>
      <ErrorBoundary>
      <PersistedQueryProvider client={queryClient}>
        <AuthProvider>
          <View style={{ flex: 1 }}>
          <OfflineBanner />
          <UpdatePromptModal />
          <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="onboarding-tour" />
            <Stack.Screen name="welcome-profile" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="auth/callback" />
            <Stack.Screen name="auth/reset-password" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="scan/camera" />
            <Stack.Screen name="scan/preview" />
            <Stack.Screen name="scan/find-online" />
            <Stack.Screen name="compare" />
            {/* No swipe-back mid-scan: leaving would abandon a scan that's still running (and paid for). */}
            <Stack.Screen name="scan/extracting" options={{ gestureEnabled: false }} />
            <Stack.Screen name="scan/results" />
            <Stack.Screen name="label/camera" />
            <Stack.Screen name="label/confirm" />
            <Stack.Screen name="label/results" />
            <Stack.Screen name="label/find-label" />
            <Stack.Screen name="chef/camera" />
            <Stack.Screen name="chef/confirm" />
            <Stack.Screen name="chef/review-requirements" />
            <Stack.Screen name="chef/results" />
            <Stack.Screen name="chef/recipe-full" />
            <Stack.Screen name="chef/find-folder-photo" />
            <Stack.Screen name="chef/find-pairing" />
            <Stack.Screen name="chef/pairing-results" />
            <Stack.Screen name="chef/archive" />
            <Stack.Screen name="cellar/list" />
            <Stack.Screen name="cellar/stats" />
            <Stack.Screen name="cellar/regions-map" />
            <Stack.Screen name="cellar/serve-market" />
            <Stack.Screen name="cellar/racks" />
            <Stack.Screen name="cellar/rack/[rackId]" />
            <Stack.Screen name="cellar/last-call" />
            <Stack.Screen name="cellar/running-low" />
            <Stack.Screen name="cellar/[wineId]" />
            <Stack.Screen name="cellar/edit-wine/[wineId]" />
            <Stack.Screen name="cellar/mood-picks" />
            {/* Lineup routes (opened from the Review/Scan tab) — register as root
                screens over the tabs so opening one doesn't switch the active tab. */}
            <Stack.Screen name="cellar/lineups" />
            <Stack.Screen name="cellar/lineup/[id]" />
            <Stack.Screen name="cellar/archive-night" />
            <Stack.Screen name="cellar/scan-lineup" />
            <Stack.Screen name="discover/consult" />
            <Stack.Screen name="profile/wine" />
            <Stack.Screen name="profile/recipe" />
            <Stack.Screen name="profile/settings" />
            <Stack.Screen name="profile/share-cellar" />
            <Stack.Screen name="profile/personality" />
            <Stack.Screen name="profile/observations" />
            <Stack.Screen name="profile/personality-archive" />
            <Stack.Screen name="wines/chosen" />
            <Stack.Screen name="wines/where-to-buy" />
            <Stack.Screen name="recipes/chosen" />
            <Stack.Screen name="restaurants/reviews" />
            <Stack.Screen name="community/join" />
            <Stack.Screen name="community/feed" />
            <Stack.Screen name="community/post/[id]" />
            <Stack.Screen name="community/search" />
            <Stack.Screen name="about" />
            <Stack.Screen name="age-gate" />
            <Stack.Screen name="legal/privacy" />
          </Stack>
          {/* Quick Command "Found X bottles" banner over storage screens. */}
          <FoundBannerHost />
          </View>
          <AppBottomBar />
          <ScanCloudBackfillRunner />
          <SignedInGuard />
          </View>
          <StatusBar style="light" />
          <AppAlertHost />
        </AuthProvider>
      </PersistedQueryProvider>
      </ErrorBoundary>
      </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </ShareIntentProvider>
  );
}
