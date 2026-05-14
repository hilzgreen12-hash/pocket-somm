import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return null;

  // Signed-in users land on the home hub — the single entry point for
  // returning users, whether it's a normal cold start or a reopen after
  // the cache was cleared. The onboarding carousel is no longer
  // auto-triggered from here.
  if (session) return <Redirect href="/home" />;

  // Everyone else lands on the public welcome page.
  return <Redirect href="/welcome" />;
}
