import { Redirect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../src/hooks/useAuth';
import { supabase } from '../src/api/supabase';

export default function Index() {
  const { session, loading } = useAuth();
  const userId = session?.user.id;

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

  if (loading) return null;

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
