import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';
import { usePreferences } from '../src/hooks/usePreferences';

export default function Index() {
  const { session, loading } = useAuth();
  const { preferences, prefsLoading, prefsError } = usePreferences();
  const [hasLaunched, setHasLaunched] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
  }, []);

  if (loading || hasLaunched === null || (session && prefsLoading)) return null;

  // Signed-in users
  if (session) {
    if (!prefsError && preferences === null) return <Redirect href="/(tabs)/welcome" />;
    return <Redirect href="/(tabs)/scan" />;
  }

  // Returning guest — skip welcome
  if (hasLaunched) return <Redirect href="/(tabs)/scan" />;

  // First-time visitor
  return <Redirect href="/welcome" />;
}
