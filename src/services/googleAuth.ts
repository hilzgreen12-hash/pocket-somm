import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../api/supabase';

// Google sign-in via Supabase OAuth in an in-app browser — deliberately NOT the
// native @react-native-google-signin module, which broke the iOS CocoaPods
// build. This adds no native iOS pod, so the iOS build stays clean.
//
// Supabase prerequisites (Dashboard → Authentication):
//   • Providers → Google: enabled, with the Web OAuth client ID + secret.
//   • URL Configuration → Redirect URLs: allow-list `vinster://auth/callback`.
// Google Cloud: the Web client's Authorized redirect URI must include
//   https://skwfykendnhnhhbdrfbr.supabase.co/auth/v1/callback

// Lets the in-app browser hand a completed session back on re-focus.
WebBrowser.maybeCompleteAuthSession();

export function isGoogleSignInCancelled(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | undefined;
  return e?.code === 'SIGN_IN_CANCELLED' || /cancel|dismiss/i.test(e?.message ?? '');
}

function fragmentParam(url: string, key: string): string | null {
  const frag = url.includes('#') ? url.slice(url.indexOf('#') + 1) : '';
  for (const part of frag.split('&')) {
    const [k, v] = part.split('=');
    if (k === key) return decodeURIComponent(v ?? '');
  }
  return null;
}

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Could not start Google sign-in.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'cancel' || result.type === 'dismiss') {
    const e = new Error('Google sign-in cancelled.');
    (e as { code?: string }).code = 'SIGN_IN_CANCELLED';
    throw e;
  }
  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign-in did not complete.');
  }

  // PKCE (the Supabase client default): the redirect carries ?code=…, which we
  // exchange for a session.
  const { queryParams } = Linking.parse(result.url);
  const code = typeof queryParams?.code === 'string' ? queryParams.code : null;
  if (code) {
    const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
    if (exErr) throw exErr;
    return;
  }
  // Implicit fallback: tokens live in the URL fragment.
  const access_token = fragmentParam(result.url, 'access_token');
  const refresh_token = fragmentParam(result.url, 'refresh_token');
  if (access_token && refresh_token) {
    const { error: sErr } = await supabase.auth.setSession({ access_token, refresh_token });
    if (sErr) throw sErr;
    return;
  }
  throw new Error('Google sign-in did not return a session.');
}
