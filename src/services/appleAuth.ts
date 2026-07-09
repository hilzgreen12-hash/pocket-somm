import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from '../api/supabase';

// Whether Sign in with Apple is usable (iOS 13+; false on Android/simulator w/o
// an Apple account). Callers hide the button when this is false.
export async function isAppleAuthAvailable(): Promise<boolean> {
  try { return await AppleAuthentication.isAvailableAsync(); } catch { return false; }
}

export function isAppleSignInCancelled(err: unknown): boolean {
  const e = err as { code?: string } | undefined;
  return e?.code === 'ERR_REQUEST_CANCELED' || e?.code === 'ERR_CANCELED';
}

// Native Sign in with Apple → exchange the identity token for a Supabase
// session. Uses a hashed nonce (Apple embeds it in the token; Supabase re-hashes
// the raw nonce we pass and compares) so the flow can't be replayed.
export async function signInWithApple(): Promise<void> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  if (!credential.identityToken) throw new Error('Apple sign-in did not return an identity token.');
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
}
