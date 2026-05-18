import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/hooks/useAuth';
import { supabase } from '../src/api/supabase';

// Local key written by /age-gate. We only check for presence here — the
// gate screen validates the date of birth itself and stores the result.
const AGE_GATE_KEY = 'vinster_age_verified_at';

export default function Index() {
  const { session, loading } = useAuth();
  const userId = session?.user.id;

  // null = still checking, true = verified, false = not yet verified.
  // Routing waits for this resolves before deciding where to send the user
  // so an unverified user can't briefly see content before the gate.
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(AGE_GATE_KEY).then((v) => setAgeVerified(!!v)).catch(() => setAgeVerified(false));
  }, []);

  // onboarding_completed lives on the profile (server-side) so it
  // survives a cache clear — a returning user who clears their cache
  // should still go straight to the app, not back through onboarding.
  const { data: onboardingComplete, isLoading: statusLoading, isError: statusError } = useQuery({
    queryKey: ['onboarding-complete', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data?.onboarding_completed ?? false;
    },
  });

  if (loading || ageVerified === null) return null;

  // Age gate runs before anything else — app stores require a neutral
  // age-verification screen for alcohol apps, and we don't want to show
  // any wine content (welcome page included) to an unverified user.
  if (!ageVerified) return <Redirect href="/age-gate" />;

  // Not signed in → public welcome page.
  if (!session) return <Redirect href="/welcome" />;

  // Wait for the onboarding check before routing a signed-in user.
  if (statusLoading) return null;

  // On a status-check failure, fail open to the hub rather than
  // trapping a returning user in onboarding.
  if (statusError) return <Redirect href="/home" />;

  // New (or not-yet-onboarded) users go through the carousel and then
  // the onboarding setup page. Everyone else lands on the home hub.
  if (!onboardingComplete) return <Redirect href="/onboarding-tour" />;
  return <Redirect href="/home" />;
}
