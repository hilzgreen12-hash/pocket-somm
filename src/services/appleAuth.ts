// Sign in with Apple is temporarily DISABLED for this release. The native
// module (expo-apple-authentication) is removed to avoid a CocoaPods build
// conflict on iOS, and the buttons are hidden via SOCIAL_SIGN_IN_ENABLED.
//
// To RE-ENABLE (once device-tested + the Supabase Apple provider is set up):
//   1. npm install expo-apple-authentication
//   2. app.json: add "expo-apple-authentication" to plugins and
//      ios.usesAppleSignIn: true
//   3. Restore the real implementation from git history (hashed-nonce flow via
//      expo-crypto -> AppleAuthentication.signInAsync -> signInWithIdToken).
//   4. Flip SOCIAL_SIGN_IN_ENABLED in src/constants/features.ts.

export async function isAppleAuthAvailable(): Promise<boolean> {
  return false;
}

export function isAppleSignInCancelled(err: unknown): boolean {
  const e = err as { code?: string } | undefined;
  return e?.code === 'ERR_REQUEST_CANCELED' || e?.code === 'ERR_CANCELED';
}

export async function signInWithApple(): Promise<void> {
  throw new Error('Sign in with Apple is not available in this build.');
}
