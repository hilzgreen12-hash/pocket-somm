import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { usePreferences } from '../src/hooks/usePreferences';

export default function Index() {
  const { session, loading } = useAuth();
  const { preferences } = usePreferences();

  if (loading) return null;

  if (!session) return <Redirect href="/(auth)/sign-in" />;

  // New user — no profile saved yet
  if (preferences === null) return <Redirect href="/onboarding" />;

  return <Redirect href="/(tabs)/scan" />;
}
