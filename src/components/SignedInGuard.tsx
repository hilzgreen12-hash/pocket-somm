import { useEffect } from 'react';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

// Screens someone can see before signing in: the start router, the age gate,
// the welcome page, sign-in / sign-up / password reset, the email-link
// handlers, and the legal and about pages.
const PUBLIC_ROUTES = new Set(['index', 'welcome', 'age-gate', '(auth)', 'auth', 'legal', 'about']);

// Vinster needs an account: anyone without a session (signed out, session
// expired, or arriving by a link or share) is sent to the welcome page.
export function SignedInGuard() {
  const { session, loading } = useAuth();
  const segments = useSegments() as string[];
  const navReady = !!useRootNavigationState()?.key;
  const first = segments[0] ?? 'index';
  const blocked = !loading && !session && !PUBLIC_ROUTES.has(first);

  useEffect(() => {
    if (blocked && navReady) router.replace('/welcome');
  }, [blocked, navReady]);

  return null;
}
