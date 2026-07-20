# Code Review — 2026-06-16

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API). No application code has been committed since the initial codebase was created — all issues identified in prior reports remain open. Three new issues are identified in this pass.

---

## Bugs and Crashes

### High

**H1 — `scan_sessions` table is never written to** *(carry-forward)*
`app/(tabs)/history.tsx:16–25` reads from `scan_sessions`. No code anywhere in `app/` or `src/` inserts or upserts a row into this table. Every user's History tab is permanently empty regardless of how many scans they run. The entire history feature is structurally broken on the write side.

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
If `supabase.auth.signInWithPassword` throws rather than returns (network timeout, unexpected SDK error), `setLoading(false)` is skipped. The button stays in "Signing in…" permanently and the form is frozen until the app is killed. Both sign-in and sign-up have the same pattern. Fix: move `setLoading(false)` into a `finally` block.

**H5 — Pre-filter uses saved-profile budget; scan-level budget override is ignored** *(carry-forward)*
`app/scan/extracting.tsx:37–39`:
```tsx
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
}
```
`prefs` is `userProfile` — the Supabase-saved preferences. The `preferences.budget` from the Zustand scan store (set in `scan.tsx` before the user taps "Scan Wine List") is not used. If a user's saved profile budget is £80 but they raise it to £150 for a specific scan, the pre-filter still discards wines priced £81–£150 before they reach the recommender. Fix: pass the scan-level budget into `preFilterWines` and use whichever is higher.

**H6 — `recommendation.topPick` is a non-existent field; wine names never render on history cards** *(carry-forward)*
`app/(tabs)/history.tsx:71`:
```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```
`RecommendationResponse` (`src/types/wine.ts:50–53`) has `wines: WineRecommendation[]` and `summary: string`. There is no `topPick` field. This always evaluates to `undefined`, so the wine name line never renders on any history card even if a recommendation JSONB object is present. The correct expression is `item.recommendation?.wines?.[0]?.name`.

**H7 — `handleEmailChange` leaves `emailSaving` permanently true if `updateUser` throws** *(carry-forward)*
`app/(tabs)/profile.tsx:110–128`: `setEmailSaving(false)` is never reached if `supabase.auth.updateUser` throws. The Confirm button renders an `ActivityIndicator` permanently and the email-change UI is frozen until the app is killed. Fix: wrap in `try/finally` with `setEmailSaving(false)` in the `finally` clause.

**H8 — Upsert error silently discarded; preferences appear saved when they are not** *(carry-forward)*
`src/hooks/usePreferences.ts:38–47`:
```ts
await supabase.from('profiles').upsert({ ... });
```
The Supabase client does not throw on database errors — it returns `{ error }` in the response. The returned object is not destructured or checked. React Query's `mutationFn` therefore always resolves, `onSuccess` fires, the query is invalidated, and the user gets no indication that their preferences were never persisted. `onError` at line 50 is unreachable. Fix: destructure and throw: `const { error } = await supabase.from('profiles').upsert(...); if (error) throw error;`.

---

### Medium

**M1 — New authenticated users redirected to scan instead of onboarding** *(carry-forward)*
`app/index.tsx:19–21`: `preferences === null` only evaluates to `true` if the React Query result has resolved to `null`. When auth resolves but the preferences query is still loading, `preferences` is `undefined`. A brand-new signed-in user with no profile row is sent to `/(tabs)/scan` instead of `/onboarding`. Fix: also destructure and check `isLoading` from `usePreferences`.

**M2 — Onboarding preferences save is fire-and-forget; navigation fires before save completes** *(carry-forward)*
`app/onboarding.tsx:37–50`: `updatePreferences(...)` is `mutation.mutate`, which returns `void`. `router.replace('/(tabs)/scan')` fires synchronously on the next line while the async upsert is still in flight. If the save fails, the user has already navigated away with no error shown. Fix: use `mutation.mutateAsync` with `await`, place navigation in the `onSuccess` callback, and surface errors.

**M3 — `handleCapture` has no error handling** *(carry-forward)*
`app/scan/camera.tsx:29–98`: `takePictureAsync` and two calls to `manipulateAsync` are all `await`-ed inside an `async` function with no `try/catch`. Hardware errors, low-storage conditions, or manipulation failures produce unhandled promise rejections. The camera UI appears to freeze with no feedback. Fix: wrap the entire function body in `try/catch` and show an `Alert` on error.

**M4 — `tap-to-focus` state set but never consumed; feature is silently unimplemented** *(new)*
`app/scan/camera.tsx:15` declares `const [focusPoint, setFocusPoint] = useState`. `handleTap` at line 24–27 updates it on user taps. The `focusPoint` value is never passed to `CameraView` or any prop — there is no expo-camera API prop that receives it in this component. Users tap the viewfinder expecting to manually focus, but nothing happens. The state update and tap handler are dead code. Either wire up the focus prop if `expo-camera` exposes one or remove the handler and state.

**M5 — `recommendWines` called with structurally incomplete input from `preferences.tsx`** *(carry-forward)*
`app/scan/preferences.tsx:28–34` calls `recommendWines` without `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, or `dislikedGrapes`. These fields are all required (non-optional) in `RecommendInput` at `src/services/recommender.ts:5–15`. The edge function receives `undefined` for all five fields; colour preferences, exclusions, and favourites from the user's profile are silently ignored when the preferences override flow is used.

**M6 — `handleScreenshot` has no error handling** *(carry-forward)*
`app/(tabs)/scan.tsx:86–101`: `ImagePicker.launchImageLibraryAsync` is called without `try/catch`. On some Android versions or after mid-session permission revocation the call throws rather than returning `{ canceled: true }`, producing an unhandled rejection with no user feedback.

**M7 — Preference save errors are only logged to console** *(carry-forward)*
`src/hooks/usePreferences.ts:50`: `onError: (err) => console.error(...)`. A Supabase upsert failure is completely invisible to the user. Profile and onboarding saves fail silently with no alert or retry mechanism. (Note: this is compounded by H8, which means the error never reaches `onError` at all.)

**M8 — History query failure shows "No scans yet" instead of an error** *(carry-forward)*
`app/(tabs)/history.tsx:13–25`: `isError` is not destructured from `useQuery`. When the Supabase query fails, `isLoading` becomes `false` and `sessions` is `undefined`. The component falls through to the `!sessions?.length` branch and renders the misleading "No scans yet" empty state.

**M9 — Double-tap on capture button pushes `/scan/preview` twice** *(carry-forward)*
`app/scan/camera.tsx:29–98`: `handleCapture` is async with no guard against concurrent invocations. A double-tap before `takePictureAsync` completes launches two parallel capture flows, both eventually calling `router.push('/scan/preview')`. The user must press back twice to escape. Fix: set an `isCapturing` ref to `true` at the start and return early if already `true`.

**M10 — `handleSignOut` has no error handling; sign-out failures are silent** *(carry-forward)*
`app/(tabs)/profile.tsx:130–133`: `supabase.auth.signOut()` returns `{ error }`, which is not destructured or checked. If sign-out fails, `router.replace` still navigates the user to the sign-in screen while the session remains active in `SecureStore`. On the next app launch, `useAuth` restores the stale session. Fix: destructure `error`, show an `Alert` if non-null, and only navigate on success.

**M11 — Font loading error silently hangs the app on a blank screen** *(carry-forward)*
`app/_layout.tsx:15`:
```tsx
const [fontsLoaded] = Font.useFonts({...});
```
`Font.useFonts` returns `[boolean, Error | null]`. The error element is discarded. If any font file fails to load, `fontsLoaded` remains `false` permanently and the app renders `null` at line 28 — a permanent blank screen with no recovery path. Fix: destructure the error value and show a fallback UI or retry prompt.

**M12 — Missing `app/auth/callback.tsx` route for email-change deep link** *(carry-forward)*
`app/(tabs)/profile.tsx:113`: `Linking.createURL('auth/callback')` constructs a deep link pointing to `auth/callback`. No file matching `app/auth/callback.tsx` (or `app/auth/callback/index.tsx`) exists. When the user taps the email confirmation link, Expo Router cannot match the route and silently drops them on whatever the root index resolves to, with no acknowledgment that the email change was confirmed.

**M13 — `preFilterWines` receives zero wines when user's profile has aggressive exclusions; recommender is called with empty wine list** *(carry-forward)*
`app/scan/extracting.tsx:99–117`: If a user's saved profile has a strict budget or aggressive exclusions and every wine on the scanned list fails the filter, `winesForRecommend` is an empty array. There is no guard before `recommendWines` is called. The recommender edge function receives `wines: []`; the model may hallucinate wines or return 0 wines, and the client would render a results screen with no wine cards. Fix: if `winesForRecommend.length === 0`, show an informative error screen.

**M14 — Sign-up discards the returned session when email confirmation is disabled** *(carry-forward)*
`app/(auth)/sign-up.tsx:13`: `data` is not destructured. When a Supabase project has email confirmation disabled, `signUp()` returns `data.session` as a live, valid session immediately. The current code ignores this, always shows "Check your email", and routes to sign-in — forcing the user to enter their credentials a second time.

---

### Low

**L1 — `defaultBudget` type mismatch between interface and runtime value** *(carry-forward)*
`src/types/preferences.ts:7` declares `defaultBudget: number` (non-nullable). `src/hooks/usePreferences.ts:26` returns `defaultBudget: data.default_budget ?? null`. TypeScript strict null checks flag every consumer of `defaultBudget` that treats it as non-nullable.

**L2 — Non-null assertions on environment variables obscure misconfiguration** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:1`, `supabase/functions/ocr/index.ts:3`, and `supabase/functions/recommend/index.ts:3` use `Deno.env.get('...')!`. A missing secret returns `undefined`; the `!` silences TypeScript. Failures manifest as downstream HTTP 401s or cryptic API errors.

**L3 — No root-level React error boundary** *(carry-forward)*
`app/_layout.tsx:14–39` has no `<ErrorBoundary>` wrapping the Stack. Any unhandled JavaScript error thrown by a child component crashes the entire app with no recovery path.

**L4 — Silent fallback when retry also fails grape-diversity check** *(carry-forward)*
`src/services/recommender.ts:75–82`: If the strict-diversity retry also fails to parse or still contains duplicate grapes, `parsed.data` — the original result violating the diversity constraint — is returned silently. At minimum this path should log a warning; ideally it should throw.

**L5 — Budget default inconsistency between `preferences.tsx` and `scan.tsx`** *(carry-forward)*
`app/scan/preferences.tsx:17` initialises `budget` to `preferences?.defaultBudget ?? 150`, applying a hard £150 cap. `app/(tabs)/scan.tsx:30` initialises `budget` to `savedPreferences?.defaultBudget ?? null` (no cap). The two entry-points apply different defaults when the user has no saved budget.

**L6 — No request timeout on URL fetch in OCR edge function** *(carry-forward)*
`supabase/functions/ocr/index.ts:51`: No `AbortSignal.timeout(...)` is passed. If the target URL is slow or unresponsive, the Deno function hangs until Supabase's own function timeout kills it. Fix: `fetch(url, { signal: AbortSignal.timeout(10_000), headers: {...} })`.

**L7 — URL OCR truncates stripped HTML at 12,000 chars; wines deep in the page are silently omitted** *(new)*
`supabase/functions/ocr/index.ts:54`:
```ts
const pageText = stripHtml(html).slice(0, 12000);
```
Many restaurant websites have large navigation menus, hero sections, and intro copy before the wine list. After `stripHtml`, the wine content may begin at character position 5,000–15,000. With a 12,000-character cap, any wines appearing after position 12,000 in the stripped text are silently discarded. There is no warning in the response, so the client shows a partial wine list without knowing it's incomplete. Fix: raise the limit, or implement a smarter extraction that skips header/footer boilerplate before capping.

**L8 — `Dimensions.get('window')` called at module scope in `CameraOverlay`; frame guides don't respond to rotation** *(new)*
`src/components/scan/CameraOverlay.tsx:4–6`:
```ts
const { width } = Dimensions.get('window');
const FRAME_WIDTH = width * 0.9;
const FRAME_HEIGHT = FRAME_WIDTH * 1.4;
```
These constants are computed once when the module is first loaded. If the user launches the app in portrait mode, opens the camera, then rotates to landscape, `FRAME_WIDTH` and `FRAME_HEIGHT` remain portrait-sized. The guide frame renders at the wrong size and, more critically, the `frameRect` values passed to the crop calculation in `camera.tsx:50–95` are stale. The resulting crop will be incorrect in any non-initial orientation. Fix: move the dimension calculation inside the component and subscribe to `Dimensions.addEventListener('change', ...)` or use the `useWindowDimensions` hook.

**L9 — Claude Opus used for structured OCR; Haiku or Sonnet would be substantially cheaper** *(carry-forward)*
`supabase/functions/ocr/index.ts:59,65`: Both OCR paths use `claude-opus-4-6` with `max_tokens: 8096`. Structured wine list extraction is a well-defined task that does not require Opus-level reasoning. Switching OCR to `claude-haiku-4-5` would reduce API spend per scan by roughly 25× without a meaningful quality loss.

**L10 — `invokeFunction` calls `JSON.parse(text)` without try/catch; gateway errors produce raw SyntaxError messages** *(carry-forward)*
`src/api/claude.ts:17`: If the edge function returns non-JSON (Cloudflare 502 HTML, Supabase maintenance page), `JSON.parse` throws a `SyntaxError`. The user sees "SyntaxError: Unexpected token '<', '<!DOCTYPE...' is not valid JSON" with no actionable guidance. Fix: wrap in try/catch inside `invokeFunction` and re-throw a user-friendly message.

**L11 — `WineRecommendationCard` component is dead code** *(carry-forward)*
`src/components/results/WineRecommendationCard.tsx` (196 lines) is never imported by `app/scan/results.tsx` or any other file. The results screen re-implements the wine card layout inline with a different accordion design. Client-side Wine-Searcher pricing (`src/services/pricing.ts`, `src/api/wine-searcher.ts`) is also never called from any screen; `fetchPricing` has no call site. Both the card component and the pricing client are dead code. Either wire them in or delete them.

**L12 — `profiles.updated_at` is never updated on upserts; column reflects creation time only** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:7` defines `updated_at timestamptz default now()`. No `before update` trigger updates it. `src/hooks/usePreferences.ts:38–47` upserts without including `updated_at` in the payload. Every profile row shows its original creation timestamp regardless of how many preference changes the user has made.

**L13 — `pricing_cache` has no purge mechanism; table grows unbounded** *(new)*
`supabase/migrations/001_initial_schema.sql:32–44` and `supabase/functions/wine-searcher-proxy/index.ts:29–43`: Cache TTL enforcement is done entirely in application code — entries older than 7 days are considered stale and re-fetched, but the old rows are never deleted. Over time `pricing_cache` accumulates an unbounded number of rows, one per unique wine+vintage combination ever queried. There is no `DELETE WHERE fetched_at < now() - interval '7 days'` job, no pg_cron schedule, and no row expiry. Fix: add a `pg_cron` job or a Supabase scheduled function that deletes stale cache rows, or use Supabase's built-in TTL row expiry.

---

## Supabase and Edge Function Issues

**S1 — SSRF via unvalidated `url` parameter in OCR function** *(carry-forward)*
`supabase/functions/ocr/index.ts:51–53`: `url` is taken directly from the request body with no scheme validation or IP-range blocklist. Any caller with the anon key can pass internal Supabase network addresses (e.g. `http://169.254.169.254/latest/meta-data/`). Fix: validate `url` starts with `https://` and reject RFC 1918 address ranges before fetching.

**S2 — No CORS headers on OCR or recommend edge functions** *(carry-forward)*
`supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` return responses without `Access-Control-Allow-Origin` or preflight handling. `src/api/claude.ts:7–17` calls these functions via raw `fetch`. Any Expo Web build will fail with CORS errors on every OCR and recommend call.

**S3 — Edge functions accept any caller; no user identity, rate limiting, or abuse attribution** *(carry-forward)*
`src/api/claude.ts:9–12` sends only `apikey: ANON_KEY` — no `Authorization: Bearer <jwt>`. The edge functions perform no authentication check. Any actor who extracts the anon key from the app bundle can make unlimited Claude API calls at the project owner's expense with no per-user attribution or rate limiting.

**S4 — Budget constraint in recommend prompt hardcodes `£` regardless of menu currency** *(carry-forward)*
`supabase/functions/recommend/index.ts:139`:
```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```
The currency symbol is hardcoded as `£`. For menus priced in EUR or USD the model receives a budget constraint in the wrong currency and may misapply it.

**S5 — `pricing_cache` upsert failure is silently ignored** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:68–75`: The upsert call is not checked for an error return. If the upsert fails, the function still returns pricing data but nothing is cached, burning Wine-Searcher API quota on every subsequent request for the same wine.

---

## UX and Performance Issues

**U1 — Two simultaneous "this may take a minute" messages during recommendation stage** *(carry-forward)*
`app/scan/extracting.tsx:144–152`: When `stage === 'recommending'`, both a `<Text>` at line 146 and a second unconditional `<Text>` at lines 150–152 render "this may take a minute" copy simultaneously. The second element is redundant.

**U2 — Skipping onboarding traps authenticated users in an infinite onboarding loop** *(carry-forward)*
`app/onboarding.tsx:144`: The "Skip for now" button navigates to `/(tabs)/scan` without creating a profile row. On the next app launch, `usePreferences` returns `null` (no row) and `app/index.tsx:20` redirects back to `/onboarding`. Fix: upsert an empty preferences row before navigating away from the skip button.

**U3 — History cards are tappable but do nothing** *(carry-forward)*
`app/(tabs)/history.tsx:64`: `<TouchableOpacity style={styles.card}>` has no `onPress`. Users receive the visual press-feedback affordance with no result. Either add a route to display the historical recommendation detail or replace `TouchableOpacity` with `View`.

**U4 — Profile "back" button calls `router.push` instead of `router.back`** *(carry-forward)*
`app/(tabs)/profile.tsx:182–184`: `router.push('/(tabs)/scan')` adds a new stack entry. After pressing this, the hardware/gesture back navigates to the profile tab, creating a push-pop loop. Replace with `router.back()`.

**U5 — Safe area insets not handled in scan flow screens** *(carry-forward)*
`app/scan/camera.tsx`, `app/scan/preview.tsx`, `app/scan/results.tsx`, and `app/scan/extracting.tsx` do not use `SafeAreaView` or `useSafeAreaInsets`. On iPhones with Dynamic Island the capture button and top content can be obscured. `paddingTop: 96` and `paddingTop: 80` are hardcoded throughout.

**U6 — Scan tab preferences don't re-sync after in-session profile edits** *(carry-forward)*
`app/(tabs)/scan.tsx:58–66`: `prefsLoaded` is set to `true` after the first preferences sync and never reset. If the user updates their profile during the same session, the scan tab's local state is never updated. Fix: remove the `prefsLoaded` guard.

**U7 — Camera screen has no explicit back button; Android users have no visible exit path** *(carry-forward)*
`app/scan/camera.tsx` and `src/components/scan/CameraOverlay.tsx` have no back or cancel button. iOS users can swipe back, but Android users relying on on-screen navigation may have no affordance to exit the camera. The overlay already has `paddingTop: 80` providing room for a cancel button.

---

## Navigation Issues

**N1 — History tab has no write path; structural dead-end** *(carry-forward)*
See H1. The history tab has a complete read implementation with zero corresponding write path anywhere in the codebase. No scan result is ever persisted to `scan_sessions`.

**N2 — `/scan/preferences` is an unreachable orphaned screen** *(carry-forward)*
`app/scan/preferences.tsx` is a complete, functional screen. No `router.push('/scan/preferences')` or `href="/scan/preferences"` exists anywhere in `app/`. The screen is unreachable from any navigation path in the running app.

**N3 — `/scan/url` is a silent dead-end** *(carry-forward)*
`app/scan/url.tsx` contains only `<Redirect href="/(tabs)/scan" />`. The OCR edge function has a complete URL-based extraction path, but no client UI exposes it. Any deep link or future internal reference to `/scan/url` silently drops the user at the scan tab with no explanation.

**N4 — No cancel affordance on the extracting screen** *(carry-forward)*
`app/scan/extracting.tsx` has no back button or cancel option. Once OCR begins, the user is locked in for the full duration. On network stalls or slow responses, there is no way to abort without killing the app. The `token.active` cancellation pattern is already in place; a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')` would complete it.

**N5 — No route exists to replay a historical recommendation** *(carry-forward)*
`app/(tabs)/history.tsx` renders scan session summaries but tapping them does nothing (U3). There is no `/scan/history-result` or equivalent route to display a past `recommendation` JSONB object. The history feature is visually present but has no detail view.
