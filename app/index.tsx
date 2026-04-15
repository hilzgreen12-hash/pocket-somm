import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';
import { usePreferences } from '../src/hooks/usePreferences';

export default function Index() {
  const { session, loading } = useAuth();
  const { preferences } = usePreferences();
  const [hasLaunched, setHasLaunched] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
  }, []);

  if (loading || hasLaunched === null) return null;

  // Signed-in users
  if (session) {
    if (preferences === null) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)/scan" />;
  }

  // Returning guest — skip welcome
  if (hasLaunched) return <Redirect href="/(tabs)/scan" />;

  // First-time visitor
  return <Redirect href="/welcome" />;
}
