// Google sign-in is temporarily DISABLED for this release. The native module
// (@react-native-google-signin/google-signin) is removed to avoid a CocoaPods
// build conflict on iOS, and the buttons are hidden via SOCIAL_SIGN_IN_ENABLED.
//
// To RE-ENABLE (once the pod issue is resolved + it's device-tested):
//   1. npm install @react-native-google-signin/google-signin
//   2. app.json plugins: add
//        ["@react-native-google-signin/google-signin",
//          { "iosUrlScheme": "com.googleusercontent.apps.876379327160-dtd9hsbuvab09nfpe7ov6t70fesq4g4a" }]
//   3. Restore the real implementation from git history (WEB_CLIENT_ID
//      876379327160-15mq34rt4ili3ncopbaub7r9ps1442b2, IOS_CLIENT_ID
//      876379327160-dtd9hsbuvab09nfpe7ov6t70fesq4g4a).
//   4. Flip SOCIAL_SIGN_IN_ENABLED in src/constants/features.ts.

export function isGoogleSignInCancelled(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | undefined;
  return e?.code === 'SIGN_IN_CANCELLED' || /cancel/i.test(e?.message ?? '');
}

export async function signInWithGoogle(): Promise<void> {
  throw new Error('Google sign-in is not available in this build.');
}
