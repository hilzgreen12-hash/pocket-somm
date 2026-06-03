import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/hooks/useAuth';
import * as Font from 'expo-font';
import * as Linking from 'expo-linking';
import { supabase } from '../src/api/supabase';
import * as ScreenOrientation from 'expo-screen-orientation';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { AppAlertHost } from '../src/components/AppAlert';

SplashScreen.preventAutoHideAsync().catch(() => {});

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
    },
  },
});

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
        const dest = type === 'recovery' ? '/auth/reset-password' : '/';

        const access_token = (queryParams?.access_token as string | undefined) ?? fragmentParams.access_token;
        const refresh_token = (queryParams?.refresh_token as string | undefined) ?? fragmentParams.refresh_token;
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          // Bounce back through the index router so it re-evaluates with the
          // fresh session — otherwise the user can land on the public welcome
          // screen (because index already decided "no session" before we
          // installed it) and miss the onboarding tour entirely.
          router.replace(dest);
          return;
        }

        const token_hash = (queryParams?.token_hash as string | undefined) ?? fragmentParams.token_hash;
        if (token_hash && type) {
          await supabase.auth.verifyOtp({ token_hash, type: type as any });
          router.replace(dest);
        }
      } catch (err) {
        console.warn('[deep-link] handleUrl failed:', url, err);
      }
    }

    Linking.getInitialURL().then((url) => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
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
            <Stack.Screen name="scan/extracting" />
            <Stack.Screen name="scan/results" />
            <Stack.Screen name="label/camera" />
            <Stack.Screen name="label/confirm" />
            <Stack.Screen name="label/results" />
            <Stack.Screen name="chef/camera" />
            <Stack.Screen name="chef/confirm" />
            <Stack.Screen name="chef/review-requirements" />
            <Stack.Screen name="chef/results" />
            <Stack.Screen name="chef/recipe-full" />
            <Stack.Screen name="chef/find-pairing" />
            <Stack.Screen name="chef/pairing-results" />
            <Stack.Screen name="chef/pairing-archive" />
            <Stack.Screen name="chef/archive" />
            <Stack.Screen name="cellar/list" />
            <Stack.Screen name="cellar/stats" />
            <Stack.Screen name="cellar/add" />
            <Stack.Screen name="cellar/import-preview" />
            <Stack.Screen name="cellar/racks" />
            <Stack.Screen name="cellar/rack/camera" />
            <Stack.Screen name="cellar/rack/detect" />
            <Stack.Screen name="cellar/rack/[rackId]" />
            <Stack.Screen name="cellar/[wineId]" />
            <Stack.Screen name="cellar/archive" />
            <Stack.Screen name="profile/wine" />
            <Stack.Screen name="profile/recipe" />
            <Stack.Screen name="profile/personality" />
            <Stack.Screen name="profile/personality-archive" />
            <Stack.Screen name="wines/chosen" />
            <Stack.Screen name="recipes/chosen" />
            <Stack.Screen name="restaurants/reviews" />
            <Stack.Screen name="community/[category]" />
            <Stack.Screen name="community/upload" />
            <Stack.Screen name="community/view" />
            <Stack.Screen name="community/search" />
            <Stack.Screen name="community/profile" />
            <Stack.Screen name="about" />
            <Stack.Screen name="age-gate" />
            <Stack.Screen name="legal/privacy" />
          </Stack>
          <StatusBar style="light" />
          <AppAlertHost />
        </AuthProvider>
      </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
