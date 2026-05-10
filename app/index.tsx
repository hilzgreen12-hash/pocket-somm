import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { session, loading } = useAuth();
  const [tourSeen, setTourSeen] = useState<boolean | null>(null);

  // Tour-seen is keyed per user_id so a fresh sign-up on a device that's
  // previously seen the tour still triggers it for the new account.
  useEffect(() => {
    let cancelled = false;
    (async () => {
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

  if (loading || tourSeen === null) return null;

  // Signed-in users
  if (session) {
    if (!tourSeen) return <Redirect href="/onboarding-tour" />;
    return <Redirect href="/(tabs)/scan" />;
  }

  // Everyone else lands on the welcome page — account setup is required.
  return <Redirect href="/welcome" />;
}
