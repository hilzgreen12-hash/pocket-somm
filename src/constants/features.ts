// Feature flags for not-yet-live features. Flip to true to switch a feature on
// app-wide in one place.

// The Vinster Community is on in development and preview builds (eas.json sets
// EXPO_PUBLIC_COMMUNITY) for testing, and off in store builds until it's ready
// to launch — then set it to true here.
export const COMMUNITY_ENABLED: boolean = process.env.EXPO_PUBLIC_COMMUNITY === '1';

// Gather (the Community) still needs work: while true, everything about it is
// shown but faded and can't be used — the tab, its page, and every "Share to
// Community" / Community profile control. Set false to open it up.
export const GATHER_LOCKED: boolean = true;

// How faded a locked Gather control is.
export const GATHER_LOCKED_OPACITY = 0.35;

// Google / Apple social sign-in. Google uses Supabase web OAuth (no native
// module, so the iOS build stays clean); Apple uses the native expo-apple-
// authentication button (required by App Store when other social logins are
// offered). Needs the Supabase Google + Apple providers configured and the
// `vinster://auth/callback` redirect allow-listed.
export const SOCIAL_SIGN_IN_ENABLED: boolean = true;
