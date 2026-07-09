// Feature flags for not-yet-live features. Flip to true to switch a feature on
// app-wide in one place.

// The Vinster community feed isn't live yet, so every "Share to Community"
// action is shown faded and non-clickable until it is. Set to true to enable.
export const COMMUNITY_ENABLED = false;

// Google / Apple social sign-in. Wired but not yet verified end-to-end (the
// Supabase Apple provider + a device test are still pending), and Apple rejects
// apps that offer Google sign-in without a WORKING Sign in with Apple — so the
// buttons stay hidden until it's tested. Flip to true once verified.
export const SOCIAL_SIGN_IN_ENABLED: boolean = false;
