# Auth & login branding

Where the user-facing branding for each sign-in method actually lives. Most of it
is **provider-console / Supabase-dashboard configuration, not app code** — so it's
easy to forget where to change it. This is the map.

App display name is **Vinster** (`app.json` → `expo.name`). The Supabase project is
named **`pocket-som`** (ref `skwfykendnhnhhbdrfbr`) — that string is what leaks onto
consent screens/emails if a branding field is left unset.

## Sign in with Google  →  branding lives in Google Cloud, NOT Supabase or the app

- Flow: `src/services/googleAuth.ts` uses the **web OAuth flow** via Supabase
  (`supabase.auth.signInWithOAuth({ provider: 'google' })` → in-app browser →
  `…supabase.co/auth/v1/callback`). Deliberately not the native Google module (it
  broke the iOS CocoaPods build).
- The Google **"to continue to …" consent screen** shows the **App name from the
  Google Cloud project's OAuth consent screen (Branding)** — that is what was
  showing the project title instead of "Vinster".
- **The Google Cloud project that owns the OAuth clients is named `My First
  Project`** (the default auto-generated name — misleadingly, *not* the project
  called "vinster label scanner", which has no OAuth clients). It's the project
  whose **OAuth 2.0 Client IDs** (Credentials page) match the comma-separated
  **Client IDs** in Supabase → Authentication → Providers → Google. The client of
  type **Web application** is the one that drives the login consent screen.
  - Tip: a client ID is `<PROJECT_NUMBER>-<hash>.apps.googleusercontent.com` — the
    leading number is the Google Cloud project number, so you can match by it.
- **To change it:** with `My First Project` selected in the console project
  dropdown → **https://console.cloud.google.com/auth/branding** → set **App name =
  Vinster**, a support email, and add `vinsterapp.com` under Authorized domains →
  Save. Then **Audience/Publishing → Publish app (In production)** so all users
  (not just test users) get the branded screen. An App logo there also appears on
  the consent screen.
- Caveat: the redirect still passes through `…supabase.co`, so Google may show
  that domain in small text under the app name. Removing it needs a **Supabase
  custom auth domain** (e.g. `auth.vinsterapp.com`, Pro-plan + DNS) — optional.

## Sign in with Apple  →  already correct (native)

- Flow: `src/services/appleAuth.ts` uses the **native** sheet
  (`expo-apple-authentication` → `supabase.auth.signInWithIdToken`). The native
  sheet shows the **app's own display name** = "Vinster" (`app.json`), so there is
  **no console field to change** for the Apple consent name.

## Auth emails (confirm signup / reset password / change email)

- Branded HTML lives in `supabase/email-templates/` (`confirm-signup.html`,
  `reset-password.html`, `change-email.html`) — already Vinster-branded.
- There is **no `supabase/config.toml`** (dashboard-managed project, no CLI), so
  these are **not auto-deployed**. They must be pasted into **Supabase Dashboard →
  Authentication → Email Templates**, and the **Subject** for each set there too
  (e.g. "Confirm your Vinster account", "Reset your Vinster password").
- The email **sender "from" name** defaults to the Supabase project name. To make
  it "Vinster <…@vinsterapp.com>" you need **custom SMTP** (Dashboard → Project
  Settings → Auth → SMTP) with Sender name = Vinster.
