# Code Review — 2026-05-28

Zero issues from the 2026-05-26 report have been resolved. All carry-forward findings are noted below alongside five new issues identified in this pass.

---

## Bugs and Crashes

### High

**H1 — `scan_sessions` table is never written to** *(carry-forward)*
`app/(tabs)/history.tsx:16-25` reads from `scan_sessions`. No code anywhere in `app/` or `src/` inserts or upserts a row into this table. Every user's history tab is permanently empty regardless of how many scans they run. The entire history feature is structurally broken on the write side.

**H2 — `router.replace()` called during the render phase** *(carry-forward)*
`app/scan/results.tsx:23-25`:
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
`router.replace` is a side effect invoked unconditionally in the render body, not inside a `useEffect`. Under React strict mode or concurrent rendering this produces "Cannot update a component while rendering a different component" warnings and can trigger double-navigation or infinite render loops. Fix: wrap in `useEffect(() => { if (!recommendation) router.replace(...); }, [recommendation])`.

**H3 — `pricing_cache` has no Row Level Security** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:32-44` creates `pricing_cache` without `alter table pricing_cache enable row level security`. The `profiles` and `scan_sessions` tables both have RLS enabled. Any caller who extracts the anon key from the app bundle (which is trivial to do) can query `supabase.from('pricing_cache').select('*')` directly and read all cached wine pricing data without authentication.

**H4 — Auth forms leave `loading` permanently stuck if the auth call throws** *(new)*
`app/(auth)/sign-in.tsx:12-20` and `app/(auth)/sign-up.tsx:12-20`:
```tsx
async function handleSignIn() {
  setLoading(true);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  setLoading(false); // never reached if the above line throws
  ...
}
```
If `supabase.auth.signInWithPassword` throws rather than returns (e.g. on network timeout or unexpected SDK error), the `await` rejects and `setLoading(false)` on the next line is skipped. The button stays in "Signing in…" state permanently and the form is frozen until the app is killed. Both sign-in and sign-up have the same pattern. Fix: move `setLoading(false)` into a `finally` block.

**H5 — Pre-filter uses saved-profile budget; scan-level budget override is ignored, excluding valid wines** *(new)*
`app/scan/extracting.tsx:37-39`:
```tsx
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
}
```
`prefs` here is `userProfile` — the saved Supabase preferences. The `preferences.budget` from the scan store (set in scan.tsx before the user taps "Scan Wine List") is not used. If a user's saved profile budget is £80 but they raise it to £150 for a specific scan, the pre-filter still discards wines priced £81–£150 before they reach the recommender. The recommender then operates on a candidate list that is missing wines the user explicitly asked to consider. Fix: use `Math.max(prefs.defaultBudget, scanPreferences.budget)` or pass the scan-level budget into `preFilterWines`.

---

### Medium

**M1 — New authenticated users redirected to scan instead of onboarding** *(carry-forward)*
`app/index.tsx:19-21`: `preferences === null` only evaluates to `true` if the React Query result has resolved to `null`. When auth resolves but the preferences query is still loading, `preferences` is `undefined`. The guard `preferences === null` evaluates to `false`, so a brand-new signed-in user with no profile row is sent to `/(tabs)/scan` rather than `/onboarding`. Fix: also check the `isLoading` state from `usePreferences`.

**M2 — Onboarding preferences save is fire-and-forget; navigation fires before save completes** *(carry-forward)*
`app/onboarding.tsx:37-50`: `updatePreferences(...)` is `mutation.mutate`, which returns `void`. `router.replace('/(tabs)/scan')` fires on the next line synchronously while the async upsert is still in flight. If the save fails, the user has already navigated away and sees no error. Fix: use `mutation.mutateAsync` with `await`, place navigation in `onSuccess`, and surface errors.

**M3 — `handleCapture` has no error handling** *(carry-forward)*
`app/scan/camera.tsx:29-98`: `takePictureAsync` and two calls to `manipulateAsync` are all `await`-ed inside an `async` function with no `try/catch`. Hardware errors, low-storage conditions, or manipulation failures produce unhandled promise rejections. The camera UI appears to freeze with no feedback to the user.

**M4 — `recommendWines` called with structurally incomplete input from `preferences.tsx`** *(carry-forward)*
`app/scan/preferences.tsx:28-34` calls `recommendWines` without `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, or `dislikedGrapes`. These fields are all required (non-optional) in `RecommendInput` at `src/services/recommender.ts:5-15`. At runtime the edge function receives `undefined` for all five fields; colour preferences, exclusions, and favourites from the user's profile are silently ignored.

**M5 — `handleScreenshot` has no error handling** *(carry-forward)*
`app/(tabs)/scan.tsx:86-101`: `ImagePicker.launchImageLibraryAsync` is called without `try/catch`. On some Android versions or after mid-session permission revocation the call throws rather than returning `{ canceled: true }`, producing an unhandled rejection with no user feedback.

**M6 — Preference save errors are only logged to console** *(carry-forward)*
`src/hooks/usePreferences.ts:50`: `onError: (err) => console.error(...)`. A Supabase upsert failure (network error, RLS rejection, schema mismatch) is completely invisible to the user. Profile and onboarding saves fail silently.

**M7 — History query failure shows "No scans yet" instead of an error** *(new)*
`app/(tabs)/history.tsx:13-25`:
```tsx
const { data: sessions, isLoading } = useQuery({...});
```
`isError` is not destructured. When the Supabase query fails (network error, expired session, RLS problem), `isLoading` becomes `false` and `sessions` is `undefined`. The component falls through to the `!sessions?.length` branch and renders "No scans yet" rather than an error message. Users with a failing network see misleading empty-state copy instead of being told something went wrong.

**M8 — Double-tap on capture button pushes `/scan/preview` twice** *(new)*
`app/scan/camera.tsx:29-98`: `handleCapture` is an async function with no guard against concurrent invocations. If the user double-taps the shutter before the first `takePictureAsync` completes, two concurrent capture flows start in parallel. Both eventually call `setImage(uri)` and `router.push('/scan/preview')`, pushing the preview route twice onto the stack. The user must press back twice to escape preview. Fix: set an `isCapturing` ref to `true` at the start of the function and return early if it is already `true`.

---

### Low

**L1 — `defaultBudget` type mismatch between interface and runtime value** *(carry-forward)*
`src/types/preferences.ts:7` declares `defaultBudget: number` (non-nullable). `src/hooks/usePreferences.ts:26` returns `defaultBudget: data.default_budget ?? null`. TypeScript strict null checks would flag every consumer.

**L2 — Non-null assertions on environment variables obscure misconfiguration** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:1`, `supabase/functions/ocr/index.ts:3`, and `supabase/functions/recommend/index.ts:3` use `Deno.env.get('...')!`. A missing secret returns `undefined`; the `!` silences TypeScript without throwing at the point of access. The failure manifests as a downstream HTTP 401 or cryptic API error, hiding the root cause. Explicit startup guards with meaningful error messages are preferable.

**L3 — No root-level React error boundary** *(carry-forward)*
`app/_layout.tsx:14-39` has no `<ErrorBoundary>` wrapping the Stack. Any unhandled JavaScript error thrown by a child component crashes the entire app with no recovery path.

**L4 — Silent fallback when retry also fails grape-diversity check** *(new)*
`src/services/recommender.ts:75-82`:
```tsx
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data;
}
return parsed.data; // silently returns the original with duplicate grapes
```
If the retry response also fails to parse or still contains duplicate grapes (`parsed2.success === false`), `parsed.data` — the original result violating the diversity constraint — is returned to the user without any log message or indicator that the HARD RULE was breached. At minimum this path should log a warning; ideally it should throw or surface a flag so the results screen can display a caveat.

**L5 — Budget default inconsistency between `preferences.tsx` and `scan.tsx`** *(new)*
`app/scan/preferences.tsx:17` initialises `budget` to `preferences?.defaultBudget ?? 150`, applying a £150 cap when no profile preference exists. `app/(tabs)/scan.tsx:30` initialises `budget` to `savedPreferences?.defaultBudget ?? null`, meaning no cap. The two entry-points to the recommender apply different default caps when the user has no saved budget preference. `preferences.tsx` is currently orphaned (N2 below), so this does not affect users today, but the discrepancy will cause a regression if that screen is re-wired.

---

## Supabase and Edge Function Issues

**S1 — SSRF via unvalidated `url` parameter in OCR function** *(carry-forward)*
`supabase/functions/ocr/index.ts:51-53`:
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
`url` is taken directly from the request body with no scheme validation or IP-range blocklist. Any caller with the anon key can pass `http://169.254.169.254/latest/meta-data/` or other internal Supabase network addresses. The client-side entry point (`app/scan/url.tsx`) is a stub redirect, but the edge function is publicly accessible via its URL. At minimum: validate `url` starts with `https://` and reject RFC 1918 address ranges before fetching.

**S2 — No CORS headers on OCR or recommend edge functions** *(carry-forward)*
`supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` return responses without `Access-Control-Allow-Origin` or preflight handling. `src/api/claude.ts:7-17` calls these functions via raw `fetch`, not the Supabase client. Any Expo Web build will fail with CORS errors on every OCR and recommend call.

**S3 — Edge functions accept any caller; no user identity, rate limiting, or abuse attribution** *(carry-forward)*
`src/api/claude.ts:9-12` sends only `apikey: ANON_KEY` — no `Authorization: Bearer <jwt>`. The edge functions perform no authentication check. Any actor who extracts the anon key from the app bundle can make unlimited Claude API calls (OCR and recommend) at the project owner's expense with no per-user attribution or rate limiting. Fix: pass the session JWT in `Authorization`, validate it inside each function with `supabase.auth.getUser(jwt)`, and enforce per-user rate limits.

**S4 — Budget constraint in recommend prompt hardcodes `£` regardless of menu currency** *(carry-forward)*
`supabase/functions/recommend/index.ts:139`:
```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```
The currency symbol is hardcoded as `£` even though the OCR function extracts a per-wine `currency` field. For menus in EUR or USD, the model receives a budget constraint in the wrong currency and may misapply it.

**S5 — `pricing_cache` upsert failure is silently ignored** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:68-75`: The `supabase.from('pricing_cache').upsert(...)` return value is not awaited for its error. If the upsert fails (schema mismatch, RLS, network error), the function still returns pricing data but nothing is cached. All subsequent requests will hit the Wine-Searcher API directly, burning quota without any log entry or alert to indicate the cache is broken.

---

## UX and Performance Issues

**U1 — Two simultaneous "this may take a minute" messages during recommendation stage** *(carry-forward)*
`app/scan/extracting.tsx:144-152`: When `stage === 'recommending'`, the first `<Text>` renders "Finding your best match…" and a second unconditional `<Text>` renders "This may take a minute or two" — both visible at the same time. The second `<Text>` (lines 150-152) should be removed; the timing note belongs in the first element only.

**U2 — Skipping onboarding traps authenticated users in an infinite onboarding loop** *(carry-forward)*
`app/onboarding.tsx:144`: The "Skip for now" button navigates to `/(tabs)/scan` without creating a profile row. On the next app launch, `usePreferences` returns `null` (no row) and `app/index.tsx:20` redirects back to `/onboarding`. Authenticated users who skip will be forced into onboarding on every cold start. Fix: upsert an empty preferences row before navigating away from the skip button.

**U3 — History cards are tappable but do nothing** *(carry-forward)*
`app/(tabs)/history.tsx:64`:
```tsx
<TouchableOpacity style={styles.card}>
```
`onPress` is absent. Users receive the visual press-feedback affordance with no result. Either add a route to display the historical recommendation or replace `TouchableOpacity` with `View`.

**U4 — Profile "back" button calls `router.push` instead of `router.back`** *(carry-forward)*
`app/(tabs)/profile.tsx:182-184`: `router.push('/(tabs)/scan')` adds a new stack entry. After pressing this, the hardware/gesture back navigates to the profile tab, creating a push-pop loop. Replace with `router.back()` or remove the button (the tab bar already handles tab switching).

**U5 — Safe area insets not handled in scan flow screens** *(carry-forward)*
`app/scan/camera.tsx`, `app/scan/preview.tsx`, `app/scan/results.tsx`, and `app/scan/extracting.tsx` do not use `SafeAreaView` or `useSafeAreaInsets`. On iPhones with Dynamic Island, the capture button and top content can be obscured. `app/(tabs)/scan.tsx:181` and `app/(tabs)/profile.tsx:449` hardcode `paddingTop: 96`, which is both too small on newer devices and too large on older notchless devices.

**U6 — Scan tab preferences don't re-sync after in-session profile edits** *(carry-forward)*
`app/(tabs)/scan.tsx:58-66`: `prefsLoaded` is set to `true` after the first preferences sync and never reset. If the user updates their profile during the same session, the scan tab's local `wineTypes`, `styleProfiles`, and `budget` state are never updated because the effect's guard always evaluates to `false`. Remove the `prefsLoaded` guard; the `useEffect` will handle idempotent re-sync through normal React state comparison.

**U7 — Camera screen has no explicit back button; Android users have no visible exit path** *(new)*
`app/scan/camera.tsx` and `src/components/scan/PermissionScreen.tsx` have no back or cancel button. iOS users can swipe back via the Stack navigator gesture, but Android users relying on the on-screen back button are not guaranteed to get it (depends on OS version and gesture navigation mode). Adding an `✕` or "Cancel" button in the top corner of the camera overlay would resolve this for all platforms. Note: `CameraOverlay` already has a `container` style with `paddingTop: 80` that provides room for this button.

---

## Navigation Issues

**N1 — History tab has no write path; structural dead-end** *(carry-forward)*
See H1. The history tab has a complete read implementation (query, render, load states) with zero corresponding write path anywhere in the codebase. No scan result is ever persisted to `scan_sessions`.

**N2 — `/scan/preferences` is an unreachable orphaned screen** *(carry-forward)*
`app/scan/preferences.tsx` is a complete, functional screen. A search of all route-pushing calls in `app/` reveals no `router.push('/scan/preferences')` or `href="/scan/preferences"` anywhere. The screen is unreachable from any navigation path in the running app. The old flow directed users here after OCR; the current flow in `extracting.tsx` proceeds directly to results. The file should be wired back in or deleted.

**N3 — `/scan/url` is a silent dead-end** *(carry-forward)*
`app/scan/url.tsx` contains only `<Redirect href="/(tabs)/scan" />`. The OCR edge function (`supabase/functions/ocr/index.ts:49-63`) has a complete URL-based wine list extraction path, but no client UI exposes it. Any deep link or future internal reference to `/scan/url` silently drops the user at the scan tab with no explanation.

**N4 — No cancel affordance on the extracting screen** *(carry-forward)*
`app/scan/extracting.tsx` has no back button or cancel option. Once OCR begins, the user is locked in for the full duration. On network stalls or slow responses, there is no way to abort without killing the app. The `token.active` cancellation pattern is already in place; adding a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')` would complete it.

**N5 — No route exists to replay a historical recommendation** *(carry-forward)*
`app/(tabs)/history.tsx` renders scan session summaries but tapping them does nothing (U3). There is no `/scan/history-result` or equivalent route to display a past `recommendation` JSONB object stored in `scan_sessions`. The history feature is visually present but has no detail view.
