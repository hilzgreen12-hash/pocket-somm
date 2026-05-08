import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { session, loading } = useAuth();
  const [hasLaunched, setHasLaunched] = useState<boolean | null>(null);
  const [tourSeen, setTourSeen] = useState<boolean | null>(null);

  // Read both keys whenever the session changes so a fresh sign-up on a
  // device that's previously seen the tour still triggers the tour for the
  // new account. Tour-seen is keyed per user_id.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [launchedRaw] = await Promise.all([AsyncStorage.getItem('hasLaunched')]);
      if (cancelled) return;
      setHasLaunched(launchedRaw === 'true');

      if (session?.user.id) {
        const tourRaw = await AsyncStorage.getItem(`vinster_tour_seen_${session.user.id}`);
        if (cancelled) return;
        setTourSeen(tourRaw === 'true');
      } else {
        setTourSeen(false);
      }
    })();
    return () => { cancelled = true; };
  }, [session?.user.id]);

  if (loading || hasLaunched === null || tourSeen === null) return null;

  // Signed-in users
  if (session) {
    if (!tourSeen) return <Redirect href="/onboarding-tour" />;
    return <Redirect href="/(tabs)/scan" />;
  }

  // Returning guest — skip welcome
  if (hasLaunched) return <Redirect href="/(tabs)/scan" />;

  // First-time visitor
  return <Redirect href="/welcome" />;
}
