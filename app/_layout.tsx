import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/hooks/useAuth';
import * as Font from 'expo-font';
import * as Linking from 'expo-linking';
import { supabase } from '../src/api/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = Font.useFonts({
    CormorantGaramond_400Regular: require('@expo-google-fonts/cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf'),
    CormorantGaramond_400Regular_Italic: require('@expo-google-fonts/cormorant-garamond/400Regular_Italic/CormorantGaramond_400Regular_Italic.ttf'),
    CormorantGaramond_600SemiBold: require('@expo-google-fonts/cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf'),
    CormorantGaramond_700Bold: require('@expo-google-fonts/cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    async function handleUrl(url: string) {
      const { queryParams } = Linking.parse(url);
      const token_hash = queryParams?.token_hash as string | undefined;
      const type = queryParams?.type as string | undefined;
      if (token_hash && type) {
        await supabase.auth.verifyOtp({ token_hash, type: type as any });
      }
    }

    Linking.getInitialURL().then((url) => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="welcome-profile" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(auth)/forgot-password" />
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
            <Stack.Screen name="chef/results" />
            <Stack.Screen name="chef/find-pairing" />
            <Stack.Screen name="chef/pairing-results" />
            <Stack.Screen name="cellar/list" />
            <Stack.Screen name="cellar/wishlist" />
            <Stack.Screen name="cellar/add-to-wishlist" />
            <Stack.Screen name="cellar/add" />
            <Stack.Screen name="cellar/import-preview" />
            <Stack.Screen name="cellar/racks" />
            <Stack.Screen name="cellar/rack/camera" />
            <Stack.Screen name="cellar/rack/detect" />
            <Stack.Screen name="cellar/rack/[rackId]" />
            <Stack.Screen name="cellar/[wineId]" />
            <Stack.Screen name="scan/history" />
            <Stack.Screen name="profile/wine" />
            <Stack.Screen name="profile/recipe" />
            <Stack.Screen name="wines/chosen" />
            <Stack.Screen name="recipes/chosen" />
            <Stack.Screen name="account" />
            <Stack.Screen name="about" />
          </Stack>
          <StatusBar style="light" />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
