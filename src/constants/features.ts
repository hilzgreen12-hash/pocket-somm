// Feature flags for not-yet-live features. Flip to true to switch a feature on
// app-wide in one place.

// The Vinster community feed isn't live yet, so every "Share to Community"
// action is shown faded and non-clickable until it is. Set to true to enable.
export const COMMUNITY_ENABLED = false;

// Google / Apple social sign-in. Google uses Supabase web OAuth (no native
// module, so the iOS build stays clean); Apple uses the native expo-apple-
// authentication button (required by App Store when other social logins are
// offered). Needs the Supabase Google + Apple providers configured and the
// `vinster://auth/callback` redirect allow-listed.
export const SOCIAL_SIGN_IN_ENABLED: boolean = true;
