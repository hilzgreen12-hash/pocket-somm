import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';
import { usePreferences } from '../src/hooks/usePreferences';

export default function Index() {
  const { session, loading } = useAuth();
  const { preferences, prefsLoading, prefsError } = usePreferences();
  const [hasLaunched, setHasLaunched] = useState<boolean | null>(null);
  const [tourSeen, setTourSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet(['hasLaunched', 'vinster_tour_seen']).then(([launched, tour]) => {
      setHasLaunched(launched[1] === 'true');
      setTourSeen(tour[1] === 'true');
    });
  }, []);

  if (loading || hasLaunched === null || tourSeen === null || (session && prefsLoading)) return null;

  // Signed-in users
  if (session) {
    // Show the 3-screen tour once on first signed-in visit before any
    // preferences setup or main app routing.
    if (!tourSeen) return <Redirect href="/onboarding-tour" />;
    if (!prefsError && !preferences) return <Redirect href="/(tabs)/welcome" />;
    return <Redirect href="/(tabs)/scan" />;
  }

  // Returning guest — skip welcome
  if (hasLaunched) return <Redirect href="/(tabs)/scan" />;

  // First-time visitor
  return <Redirect href="/welcome" />;
}
