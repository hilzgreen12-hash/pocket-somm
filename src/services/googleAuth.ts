import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../api/supabase';

// OAuth client IDs (public — safe to embed). The Web client is what Supabase +
// the native SDK use to mint/validate the ID token; the iOS client drives the
// iOS sign-in sheet. Configured in Google Cloud + enabled in Supabase.
const WEB_CLIENT_ID = '876379327160-15mq34rt4ili3ncopbaub7r9ps1442b2.apps.googleusercontent.com';
const IOS_CLIENT_ID = '876379327160-dtd9hsbuvab09nfpe7ov6t70fesq4g4a.apps.googleusercontent.com';

let configured = false;
function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, iosClientId: IOS_CLIENT_ID });
  configured = true;
}

export function isGoogleSignInCancelled(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | undefined;
  return e?.code === 'SIGN_IN_CANCELLED' || /cancel/i.test(e?.message ?? '');
}

// Native Google sign-in → exchange the returned ID token for a Supabase session.
export async function signInWithGoogle(): Promise<void> {
  ensureConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = (await GoogleSignin.signIn()) as { data?: { idToken?: string | null }; idToken?: string | null };
  const idToken = result?.data?.idToken ?? result?.idToken ?? null;
  if (!idToken) throw new Error('Google sign-in did not return an ID token.');
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
  if (error) throw error;
}
