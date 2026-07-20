# Code Review — 2026-06-04

Zero issues from the 2026-05-29 report have been resolved. No code commits exist since the initial codebase was created; all carry-forward findings remain open. Four new issues are identified in this pass.

---

## Bugs and Crashes

### High

**H1 — `scan_sessions` table is never written to** *(carry-forward)*
`app/(tabs)/history.tsx:16–25` reads from `scan_sessions`. No code anywhere in `app/` or `src/` inserts or upserts a row into this table. Every user's history tab is permanently empty regardless of how many scans they run. The entire history feature is structurally broken on the write side.

**H2 — `router.replace()` called during the render phase** *(carry-forward)*
`app/scan/results.tsx:22–25`:
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
`router.replace` is a side effect invoked unconditionally in the render body, not inside a `useEffect`. Under React strict mode or concurrent rendering this produces "Cannot update a component while rendering a different component" warnings and can trigger double-navigation or infinite render loops. Fix: wrap in `useEffect(() => { if (!recommendation) router.replace(...); }, [recommendation])`.

**H3 — `pricing_cache` has no Row Level Security** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:32–44` creates `pricing_cache` without `alter table pricing_cache enable row level security`. The `profiles` and `scan_sessions` tables both have RLS enabled. Any caller who extracts the anon key from the app bundle (trivial to do) can query `supabase.from('pricing_cache').select('*')` directly and read all cached wine pricing data without authentication.

**H4 — Auth forms leave `loading` permanently stuck if the auth call throws** *(carry-forward)*
`app/(auth)/sign-in.tsx:12–20` and `app/(auth)/sign-up.tsx:12–22`:
```tsx
async function handleSignIn() {
  setLoading(true);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  setLoading(false); // never reached if the above throws
  ...
}
```
If `supabase.auth.signInWithPassword` throws rather than returns (network timeout, unexpected SDK error), `setLoading(false)` on the next line is skipped. The button stays in "Signing in…" state permanently and the form is frozen until the app is killed. Both sign-in and sign-up have the same pattern. Fix: move `setLoading(false)` into a `finally` block.

**H5 — Pre-filter uses saved-profile budget; scan-level budget override is ignored** *(carry-forward)*
`app/scan/extracting.tsx:37–39`:
```tsx
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
}
```
`prefs` here is `userProfile` — the saved Supabase preferences. The `preferences.budget` from the scan store (set in `scan.tsx` before the user taps "Scan Wine List") is not used. If a user's saved profile budget is £80 but they raise it to £150 for a specific scan, the pre-filter still discards wines priced £81–£150 before they reach the recommender. Fix: pass the scan-level budget into `preFilterWines` and use whichever is higher.

**H6 — `recommendation.topPick` is a non-existent field; wine names never render on history cards** *(carry-forward)*
`app/(tabs)/history.tsx:71`:
```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```
`RecommendationResponse` (`src/types/wine.ts:50–53`) has fields `wines: WineRecommendation[]` and `summary: string`. There is no `topPick` field. This property access always evaluates to `undefined`, so the wine name line never renders on any history card even if a recommendation JSONB object is present in the database. The correct expression is `item.recommendation?.wines?.[0]?.name`. TypeScript would catch this if `recommendation` were typed as `RecommendationResponse` rather than accessed as a JSONB passthrough.

---

### Medium

**M1 — New authenticated users redirected to scan instead of onboarding** *(carry-forward)*
`app/index.tsx:19–21`: `preferences === null` only evaluates to `true` if the React Query result has resolved to `null`. When auth resolves but the preferences query is still loading, `preferences` is `undefined`. The guard evaluates to `false`, so a brand-new signed-in user with no profile row is sent to `/(tabs)/scan` rather than `/onboarding`. Fix: also destructure and check `isLoading` from `usePreferences`.

**M2 — Onboarding preferences save is fire-and-forget; navigation fires before save completes** *(carry-forward)*
`app/onboarding.tsx:37–50`: `updatePreferences(...)` is `mutation.mutate`, which returns `void`. `router.replace('/(tabs)/scan')` fires synchronously on the next line while the async upsert is still in flight. If the save fails, the user has already navigated away with no error shown. Fix: use `mutation.mutateAsync` with `await`, place navigation in the `onSuccess` callback, and surface errors to the user.

**M3 — `handleCapture` has no error handling** *(carry-forward)*
`app/scan/camera.tsx:29–98`: `takePictureAsync` and two calls to `manipulateAsync` are all `await`-ed inside an `async` function with no `try/catch`. Hardware errors, low-storage conditions, or manipulation failures produce unhandled promise rejections. The camera UI appears to freeze with no feedback. Fix: wrap the entire function body in `try/catch` and show an `Alert` on error.

**M4 — `recommendWines` called with structurally incomplete input from `preferences.tsx`** *(carry-forward)*
`app/scan/preferences.tsx:28–34` calls `recommendWines` without `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, or `dislikedGrapes`. These fields are all required (non-optional) in `RecommendInput` at `src/services/recommender.ts:5–15`. At runtime the edge function receives `undefined` for all five fields; colour preferences, exclusions, and favourites from the user's profile are silently ignored.

**M5 — `handleScreenshot` has no error handling** *(carry-forward)*
`app/(tabs)/scan.tsx:86–101`: `ImagePicker.launchImageLibraryAsync` is called without `try/catch`. On some Android versions or after mid-session permission revocation the call throws rather than returning `{ canceled: true }`, producing an unhandled rejection with no user feedback.

**M6 — Preference save errors are only logged to console** *(carry-forward)*
`src/hooks/usePreferences.ts:50`: `onError: (err) => console.error(...)`. A Supabase upsert failure (network error, RLS rejection, schema mismatch) is completely invisible to the user. Profile and onboarding saves fail silently with no alert or retry mechanism.

**M7 — History query failure shows "No scans yet" instead of an error** *(carry-forward)*
`app/(tabs)/history.tsx:13–25`: `isError` is not destructured from `useQuery`. When the Supabase query fails, `isLoading` becomes `false` and `sessions` is `undefined`. The component falls through to the `!sessions?.length` branch and renders "No scans yet" — misleading empty-state copy instead of an error message.

**M8 — Double-tap on capture button pushes `/scan/preview` twice** *(carry-forward)*
`app/scan/camera.tsx:29–98`: `handleCapture` is async with no guard against concurrent invocations. A double-tap before `takePictureAsync` completes launches two parallel capture flows, both eventually calling `router.push('/scan/preview')`. The user must press back twice to escape. Fix: set an `isCapturing` ref to `true` at the start and return early if already `true`.

**M9 — `handleSignOut` has no error handling; sign-out failures are silent** *(carry-forward)*
`app/(tabs)/profile.tsx:130–133`:
```tsx
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```
`supabase.auth.signOut()` returns `{ error }`, which is not destructured or checked. If sign-out fails (network error, expired token), `router.replace` still navigates the user to the sign-in screen while the session remains active in `SecureStore`. On the next app launch, `useAuth` will restore the stale session and appear logged in. Fix: destructure `error`, show an `Alert` if it is non-null, and only navigate on success.

**M10 — Font loading error silently hangs the app on a blank screen** *(carry-forward)*
`app/_layout.tsx:15`:
```tsx
const [fontsLoaded] = Font.useFonts({...});
```
`Font.useFonts` returns a tuple `[boolean, Error | null]`. The error element is discarded by the destructuring. If any of the four Cormorant Garamond font files fail to load (corrupt asset, out-of-memory, disk error), `fontsLoaded` remains `false` permanently and the app renders `null` at line 28, displaying a blank screen with no recovery path. Fix: destructure the error value and show a fallback UI or retry prompt.

**M11 — Missing `app/auth/callback.tsx` route for email-change confirmation deep link** *(new)*
`app/(tabs)/profile.tsx:113`:
```tsx
const redirectTo = Linking.createURL('auth/callback');
```
This constructs a deep link pointing to the `auth/callback` path in the Expo Router file system. No file matching `app/auth/callback.tsx` (or `app/auth/callback/index.tsx`) exists in the project. When the user taps the confirmation link from their email, the app opens at this path, Expo Router cannot match the route, and the user is silently dropped on whatever screen the root index resolves to — with no acknowledgment that the email change was confirmed. Create `app/auth/callback.tsx` to handle the redirect (call `supabase.auth.exchangeCodeForSession` if using PKCE, or show a confirmation message) and register the route.

**M12 — `preFilterWines` can produce an empty array; `recommendWines` is called with zero wines and no guard** *(new)*
`app/scan/extracting.tsx:99–117`:
```tsx
setExtractedWines(wines);                    // line 97 — stores full list
const winesForRecommend = preFilterWines(wines, userProfile);  // line 101
const recommendation = await recommendWines({ wines: winesForRecommend, ... }); // line 102
```
`preFilterWines` applies hard budget, disliked-region, and disliked-grape filters. If a user's saved profile has a strict budget or aggressive exclusions and every wine on the scanned list fails the filter, `winesForRecommend` is an empty array. There is no guard before `recommendWines` is called. The recommender edge function receives `wines: []`; the system prompt instructs it to "recommend exactly 3 wines," so the model may hallucinate wines not on the list, return 0 wines, or error. The Zod schema (`z.array(WineRecommendationSchema).max(3)`) accepts an empty array as valid, so the client would silently render a results screen with no wine cards. Fix: if `winesForRecommend.length === 0`, show an informative error — e.g. "All wines on this list are outside your budget or excluded by your profile. Try adjusting your preferences."

---

### Low

**L1 — `defaultBudget` type mismatch between interface and runtime value** *(carry-forward)*
`src/types/preferences.ts:7` declares `defaultBudget: number` (non-nullable). `src/hooks/usePreferences.ts:26` returns `defaultBudget: data.default_budget ?? null`. TypeScript strict null checks flag every consumer of `defaultBudget` that treats it as non-nullable.

**L2 — Non-null assertions on environment variables obscure misconfiguration** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:1`, `supabase/functions/ocr/index.ts:3`, and `supabase/functions/recommend/index.ts:3` use `Deno.env.get('...')!`. A missing secret returns `undefined`; the `!` silences TypeScript without throwing at the point of access. Failures manifest as downstream HTTP 401s or cryptic API errors, hiding the root cause.

**L3 — No root-level React error boundary** *(carry-forward)*
`app/_layout.tsx:14–39` has no `<ErrorBoundary>` wrapping the Stack. Any unhandled JavaScript error thrown by a child component crashes the entire app with no recovery path.

**L4 — Silent fallback when retry also fails grape-diversity check** *(carry-forward)*
`src/services/recommender.ts:75–82`: If the strict-diversity retry also fails to parse or still contains duplicate grapes (`parsed2.success === false`), `parsed.data` — the original result violating the diversity constraint — is returned silently. At minimum this path should log a warning; ideally it should throw so the error surfaces.

**L5 — Budget default inconsistency between `preferences.tsx` and `scan.tsx`** *(carry-forward)*
`app/scan/preferences.tsx:17` initialises `budget` to `preferences?.defaultBudget ?? 150`, applying a hard £150 cap when no profile preference exists. `app/(tabs)/scan.tsx:30` initialises `budget` to `savedPreferences?.defaultBudget ?? null`, meaning no cap. The two entry-points to the recommender apply different default caps when the user has no saved budget preference.

**L6 — No request timeout on URL fetch in OCR edge function** *(carry-forward)*
`supabase/functions/ocr/index.ts:51`:
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
No `AbortSignal.timeout(...)` is passed. If the target URL is slow or unresponsive, the Deno function hangs until Supabase's own function timeout kills it (typically 60 s), burning wall-clock time and blocking the caller. Fix: `fetch(url, { signal: AbortSignal.timeout(10_000), headers: {...} })`.

**L7 — Claude Opus used for structured OCR; Haiku or Sonnet would be substantially cheaper** *(carry-forward)*
`supabase/functions/ocr/index.ts:59,65`: Both the image and URL OCR paths call `claude-opus-4-6` with `max_tokens: 8096`. Extracting a structured wine list from an image is a well-defined extraction task that does not require Opus-level reasoning. `claude-haiku-4-5` costs roughly 25× less per token and handles JSON extraction reliably. Using Haiku or Sonnet for OCR while reserving Opus for the recommend function would significantly reduce API spend per scan.

**L8 — `invokeFunction` calls `JSON.parse(text)` without try/catch; gateway errors produce raw SyntaxError messages** *(new)*
`src/api/claude.ts:17`:
```ts
return JSON.parse(text);
```
If the edge function returns non-JSON (Cloudflare 502 HTML, Supabase maintenance page, etc.), `JSON.parse` throws a `SyntaxError`. This propagates uncaught through `callOCR` / `callRecommend` → `extractWineList` / `recommendWines` → the `catch` block in `extracting.tsx:118–124`, where `err.message` is set as the user-visible error detail. The user sees "SyntaxError: Unexpected token '<', '<!DOCTYPE...' is not valid JSON" with no actionable guidance. Fix: wrap `JSON.parse(text)` in a try/catch inside `invokeFunction` and re-throw a user-friendly message such as "Service temporarily unavailable. Please try again."

**L9 — `WineRecommendationCard` component is dead code; results screen re-implements its layout inline** *(new)*
`src/components/results/WineRecommendationCard.tsx` (196 lines) is defined but never imported by `app/scan/results.tsx` or any other file. The results screen (`app/scan/results.tsx:49–115`) re-implements the wine card layout inline with a different accordion design. Two divergent representations of the same data now exist and must be kept in sync independently. Any future change to the results UI (new fields, style updates) has a high chance of updating only one of the two. Either delete `WineRecommendationCard.tsx` or refactor `results.tsx` to use it.

---

## Supabase and Edge Function Issues

**S1 — SSRF via unvalidated `url` parameter in OCR function** *(carry-forward)*
`supabase/functions/ocr/index.ts:51–53`:
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
`url` is taken directly from the request body with no scheme validation or IP-range blocklist. Any caller with the anon key can pass `http://169.254.169.254/latest/meta-data/` or other internal Supabase network addresses. The client-side entry point (`app/scan/url.tsx`) is a stub redirect, but the edge function is publicly accessible via its URL. At minimum: validate `url` starts with `https://` and reject RFC 1918 address ranges before fetching.

**S2 — No CORS headers on OCR or recommend edge functions** *(carry-forward)*
`supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` return responses without `Access-Control-Allow-Origin` or preflight handling. `src/api/claude.ts:7–17` calls these functions via raw `fetch`, not the Supabase client. Any Expo Web build will fail with CORS errors on every OCR and recommend call.

**S3 — Edge functions accept any caller; no user identity, rate limiting, or abuse attribution** *(carry-forward)*
`src/api/claude.ts:9–12` sends only `apikey: ANON_KEY` — no `Authorization: Bearer <jwt>`. The edge functions perform no authentication check. Any actor who extracts the anon key from the app bundle can make unlimited Claude API calls (OCR and recommend) at the project owner's expense with no per-user attribution or rate limiting. Fix: pass the session JWT in the `Authorization` header, validate it inside each function with `supabase.auth.getUser(jwt)`, and enforce per-user rate limits.

**S4 — Budget constraint in recommend prompt hardcodes `£` regardless of menu currency** *(carry-forward)*
`supabase/functions/recommend/index.ts:139`:
```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```
The currency symbol is hardcoded as `£` even though the OCR function extracts a per-wine `currency` field. For menus priced in EUR or USD the model receives a budget constraint in the wrong currency and may misapply it.

**S5 — `pricing_cache` upsert failure is silently ignored** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:68–75`: The `supabase.from('pricing_cache').upsert(...)` call is not checked for an error return. If the upsert fails (schema mismatch, RLS, network error), the function still returns pricing data but nothing is cached. All subsequent requests for the same wine hit the Wine-Searcher API directly, burning quota without any log entry.

---

## UX and Performance Issues

**U1 — Two simultaneous "this may take a minute" messages during recommendation stage** *(carry-forward)*
`app/scan/extracting.tsx:144–152`: When `stage === 'recommending'`, the first `<Text>` at line 146 renders "Finding your best match…" and a second unconditional `<Text>` at lines 150–152 renders "This may take a minute or two" — both visible at the same time. The second element is redundant and should be removed; the timing note belongs in the first body element only.

**U2 — Skipping onboarding traps authenticated users in an infinite onboarding loop** *(carry-forward)*
`app/onboarding.tsx:144`: The "Skip for now" button navigates to `/(tabs)/scan` without creating a profile row. On the next app launch, `usePreferences` returns `null` (no row) and `app/index.tsx:20` redirects back to `/onboarding`. Authenticated users who skip are forced into onboarding on every cold start. Fix: upsert an empty preferences row before navigating away from the skip button.

**U3 — History cards are tappable but do nothing** *(carry-forward)*
`app/(tabs)/history.tsx:64`: `<TouchableOpacity style={styles.card}>` has no `onPress`. Users receive the visual press-feedback affordance with no result. Either add a route to display the historical recommendation detail or replace `TouchableOpacity` with `View`.

**U4 — Profile "back" button calls `router.push` instead of `router.back`** *(carry-forward)*
`app/(tabs)/profile.tsx:182–184`: `router.push('/(tabs)/scan')` adds a new stack entry. After pressing this, the hardware/gesture back navigates to the profile tab, creating a push-pop loop. Replace with `router.back()` or remove the button since the tab bar already handles tab switching.

**U5 — Safe area insets not handled in scan flow screens** *(carry-forward)*
`app/scan/camera.tsx`, `app/scan/preview.tsx`, `app/scan/results.tsx`, and `app/scan/extracting.tsx` do not use `SafeAreaView` or `useSafeAreaInsets`. On iPhones with Dynamic Island, the capture button and top content can be obscured. `app/(tabs)/scan.tsx:181` and `app/(tabs)/profile.tsx:449` hardcode `paddingTop: 96`, which is both too small on newer devices and too large on older notchless devices.

**U6 — Scan tab preferences don't re-sync after in-session profile edits** *(carry-forward)*
`app/(tabs)/scan.tsx:58–66`: `prefsLoaded` is set to `true` after the first preferences sync and never reset. If the user updates their profile during the same session, the scan tab's local `wineTypes`, `styleProfiles`, and `budget` state are never updated because the effect guard always evaluates to `false`. Fix: remove the `prefsLoaded` guard; the `useEffect` will handle idempotent re-sync through normal React state comparison.

**U7 — Camera screen has no explicit back button; Android users have no visible exit path** *(carry-forward)*
`app/scan/camera.tsx` and `src/components/scan/CameraOverlay.tsx` have no back or cancel button. iOS users can swipe back via the Stack navigator gesture, but Android users relying on on-screen navigation are not guaranteed a back affordance depending on OS version and gesture navigation mode. The `CameraOverlay` container already has `paddingTop: 80` providing room for a cancel button.

---

## Navigation Issues

**N1 — History tab has no write path; structural dead-end** *(carry-forward)*
See H1. The history tab has a complete read implementation with zero corresponding write path anywhere in the codebase. No scan result is ever persisted to `scan_sessions`.

**N2 — `/scan/preferences` is an unreachable orphaned screen** *(carry-forward)*
`app/scan/preferences.tsx` is a complete, functional screen. No `router.push('/scan/preferences')` or `href="/scan/preferences"` exists anywhere in `app/`. The screen is unreachable from any navigation path in the running app. The current flow in `extracting.tsx` proceeds directly to results, bypassing this screen entirely. It should be wired back in or deleted.

**N3 — `/scan/url` is a silent dead-end** *(carry-forward)*
`app/scan/url.tsx` contains only `<Redirect href="/(tabs)/scan" />`. The OCR edge function (`supabase/functions/ocr/index.ts:49–63`) has a complete URL-based wine list extraction path, but no client UI exposes it. Any deep link or future internal reference to `/scan/url` silently drops the user at the scan tab with no explanation.

**N4 — No cancel affordance on the extracting screen** *(carry-forward)*
`app/scan/extracting.tsx` has no back button or cancel option. Once OCR begins, the user is locked in for the full duration. On network stalls or slow responses, there is no way to abort without killing the app. The `token.active` cancellation pattern is already in place; adding a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')` would complete it.

**N5 — No route exists to replay a historical recommendation** *(carry-forward)*
`app/(tabs)/history.tsx` renders scan session summaries but tapping them does nothing (U3). There is no `/scan/history-result` or equivalent route to display a past `recommendation` JSONB object stored in `scan_sessions`. The history feature is visually present but has no detail view.
