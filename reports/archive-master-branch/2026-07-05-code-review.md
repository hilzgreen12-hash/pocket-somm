# Code Review — 2026-07-05

Automated review of the full Vinster / Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API). Every finding has a specific file path and line number.

---

## Bugs and Crashes

### High

**1. `router.replace` called during render, not in an effect**
- File: `app/scan/results.tsx`, line 24–25
- Severity: **High**
- `if (!recommendation) { router.replace('/(tabs)/scan'); return null; }` executes a navigation side-effect synchronously during component render. In React, side effects during render are not allowed and can produce crashes or infinite loops. Move this into a `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

**2. New users who sign in bypass onboarding entirely**
- File: `app/(auth)/sign-in.tsx`, line 19
- Severity: **High**
- After a successful sign-in, `handleSignIn` calls `router.replace('/(tabs)/scan')` directly, completely skipping the routing logic in `app/index.tsx` that checks for a missing profile and redirects to onboarding. A brand-new user who creates an account, then signs in, is sent straight to the scan tab with no onboarding and no saved preferences. Fix: navigate to `'/'` and let `index.tsx` decide the destination.

**3. `handleCapture` in camera screen has no error handling**
- File: `app/scan/camera.tsx`, line 29–98
- Severity: **High**
- `handleCapture` is `async` and calls `cameraRef.current.takePictureAsync()` and two `ImageManipulator.manipulateAsync()` invocations with no try/catch. If any of these throw (camera hardware error, memory pressure, EXIF parsing failure), the exception propagates unhandled, the UI freezes on the camera screen with no feedback, and the user has no way to recover except force-quitting the app. Wrap the body of `handleCapture` in try/catch and show an Alert on failure.

**4. Preference save in `usePreferences` silently drops Supabase errors**
- File: `src/hooks/usePreferences.ts`, line 38
- Severity: **High**
- The mutation calls `await supabase.from('profiles').upsert({...})` but does not destructure the return value. Supabase does not throw on query errors — it returns `{ data, error }`. Because `error` is never inspected, an RLS violation, network failure, or schema mismatch will silently succeed from the caller's perspective. The `onError` callback at line 50 will never fire because the `mutationFn` itself never throws. Fix: `const { error } = await supabase.from('profiles').upsert({...}); if (error) throw error;`.

**5. Onboarding save is fire-and-forget before navigation**
- File: `app/onboarding.tsx`, lines 37–50
- Severity: **High**
- `handleNext` calls `updatePreferences(...)` (which is `mutation.mutate`, returning `void`) and then immediately calls `router.replace('/(tabs)/scan')`. Navigation happens unconditionally, before the async save completes. If the upsert fails (network error, RLS block), the user lands on the scan tab with no preferences saved and no error message. Fix: use `mutation.mutateAsync`, await it inside a try/catch, and only navigate on success.

---

### Medium

**6. History card shows wrong field — `topPick` does not exist on `RecommendationResponse`**
- File: `app/(tabs)/history.tsx`, line 70–72
- Severity: **Medium**
- The history list reads `item.recommendation?.topPick.name`, but `RecommendationResponse` (defined in `src/types/wine.ts`, line 50) has no `topPick` field — it has `wines: WineRecommendation[]`. This expression always evaluates to `undefined`, so the top wine name is never displayed on any history card. Fix: `item.recommendation?.wines?.[0]?.name`.

**7. Preferences loading race condition — new users may skip onboarding**
- File: `app/index.tsx`, lines 19–21
- Severity: **Medium**
- When a user opens the app with an existing session, `usePreferences` starts its query asynchronously. During the window when auth is resolved but the preferences query is still in-flight, `preferences` is `undefined`. The check `if (preferences === null)` is false for `undefined`, so the code falls through to `return <Redirect href="/(tabs)/scan" />` before the query returns. A new user who needs onboarding could be routed past it. Fix: also check the loading state from `usePreferences` and return `null` while loading.

**8. Duplicate-grape retry swallows second parse failure**
- File: `src/services/recommender.ts`, lines 74–82
- Severity: **Medium**
- When duplicate grapes are detected, the code retries once. If the retry also fails `RecommendationResponseSchema.safeParse`, the function falls through to `return parsed.data` (line 82) — returning the original response that had duplicate grape varieties, with no warning to the user. The duplicate-grape bug is silently perpetuated. Fix: if `parsed2.success` is false after retry, either throw an error or explicitly return `parsed.data` with a console warning that makes the condition visible.

**9. Outdated Claude model IDs in both edge functions**
- File: `supabase/functions/ocr/index.ts`, lines 57 and 65; `supabase/functions/recommend/index.ts`, line 170
- Severity: **Medium**
- Both functions use `model: 'claude-opus-4-6'`. The current Anthropic model lineup has superseded this with `claude-opus-4-8`. If `claude-opus-4-6` has been deprecated, API calls will start returning 404 or validation errors, causing all OCR and recommendation requests to fail. Update to `claude-opus-4-8` (or `claude-sonnet-5` if cost is a concern for OCR).

**10. Extracting screen has no timeout or cancel mechanism**
- File: `app/scan/extracting.tsx`, lines 60–125
- Severity: **Medium**
- The `run()` function awaits sequential API calls (OCR → recommend) with no timeout and no way for the user to cancel. If an edge function cold-starts slowly, experiences network delay, or hangs, the user is trapped on the loading screen indefinitely. The instruction "Please don't leave this page while we're searching" (line 153) makes this worse. Fix: add an `AbortController` or a `Promise.race` with a timeout, and add a visible "Cancel" button.

---

### Low

**11. `preferences.tsx` (scan flow) does not pass region/grape filters to `recommendWines`**
- File: `app/scan/preferences.tsx`, lines 28–33
- Severity: **Low**
- `handleGetRecommendation` calls `recommendWines({ wines, styleProfiles, budget, foodPairing })` without including `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, or `dislikedGrapes`. The `RecommendInput` interface (`src/services/recommender.ts`, line 5) requires all of these. This screen is no longer in the primary navigation flow (the extracting screen handles recommendation directly), but if this screen is ever surfaced again it will produce incomplete recommendations.

**12. Camera loading state missing between capture and navigation**
- File: `app/scan/camera.tsx`, lines 29–98
- Severity: **Low**
- After the user presses capture, `handleCapture` performs up to two `ImageManipulator.manipulateAsync` operations before calling `router.push`. There is no UI feedback during this processing (no spinner, no haptics beyond the initial tap, no overlay). On slower devices this creates a 1–3 second freeze that looks like a crash.

---

## Supabase and Edge Function Issues

**1. `pricing_cache` table has no RLS policy**
- File: `supabase/migrations/001_initial_schema.sql`, line 34–45
- Severity: **High**
- The `pricing_cache` table is created with `enable row level security` missing entirely. There are no policies defined for it. Any client holding the anon key can `SELECT`, `INSERT`, `UPDATE`, or `DELETE` all rows in this table, including poisoning the cache with false pricing data. The wine-searcher-proxy function uses the service role key to write to it, which is correct, but direct client access should be blocked. Fix: add `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY;` and create a read-only policy (or no policy at all, which blocks all client access while the edge function's service role still works).

**2. OCR function exposes an unauthenticated SSRF vector via URL mode**
- File: `supabase/functions/ocr/index.ts`, lines 49–53
- Severity: **High**
- The `url` path (`if (url) { const pageRes = await fetch(url, ...) }`) makes an outbound HTTP request to any URL the caller supplies, with no allowlist or validation. An attacker can call this edge function with an internal URL (e.g. `http://169.254.169.254/` on AWS, or Supabase internal metadata endpoints) and receive the response body via the OCR output. Fix: validate that `url` uses `https://`, is not a private IP or localhost, and optionally enforce a domain allowlist.

**3. Upsert errors in `usePreferences` are silently swallowed**
- File: `src/hooks/usePreferences.ts`, line 38
- Severity: **High**
- As noted in Bugs above — Supabase errors from `upsert` are never surfaced. Documented here separately because the root cause is Supabase-specific: the library returns errors in the response object, not as thrown exceptions, and the code pattern of `await supabase.from(...).upsert()` without destructuring `{ error }` is a pervasive gotcha across Supabase-based codebases.

**4. `recommend` error response missing `Content-Type` header**
- File: `supabase/functions/recommend/index.ts`, line 192–194
- Severity: **Medium**
- The success response includes `{ 'Content-Type': 'application/json' }` (line 188) but the `catch` block's error response does not. Some HTTP clients and middleware will treat the body as `text/plain` and fail to parse it as JSON, causing a secondary parse error that obscures the original error message in client logs.

**5. `scan_sessions.user_id` allows NULL, creating orphaned rows**
- File: `supabase/migrations/001_initial_schema.sql`, line 18
- Severity: **Low**
- `user_id uuid references auth.users(id) on delete cascade` has no `NOT NULL` constraint. A row inserted with `user_id = NULL` is not covered by the RLS policy (`auth.uid() = user_id`), making it permanently invisible to all users and uncleanable without service role access. Add `NOT NULL` to the column definition.

**6. `wine-searcher-proxy` returns HTTP 200 on API failure**
- File: `supabase/functions/wine-searcher-proxy/index.ts`, lines 82–88
- Severity: **Low**
- The catch block returns `status: 200` with `source: 'unavailable'`. The client in `src/api/wine-searcher.ts` checks for the Supabase functions client's `error` object (line 13), which is only set on non-2xx responses. Since 200 is returned even on failure, the client never receives an error signal and silently uses null pricing data. This makes Wine-Searcher API outages invisible to monitoring and debugging. Return HTTP 502 or 503 on failure so alerting can detect it.

---

## UX and Performance Issues

**1. History card tap does nothing**
- File: `app/(tabs)/history.tsx`, line 64
- Severity: **High**
- Every `TouchableOpacity` in the history `FlatList` wraps a scan session card but has no `onPress` handler. Tapping a past scan does nothing. Users naturally expect to re-view their recommendations. Either implement navigation to a detail view, or replace `TouchableOpacity` with `View` so the affordance doesn't mislead users.

**2. Currency symbol hardcoded as `£` regardless of `currency` field**
- File: `app/scan/results.tsx`, line 83; `src/components/results/WineRecommendationCard.tsx`, line 55
- Severity: **Medium**
- Both the results screen and the card component display `£{wine.menuPrice}` unconditionally. The `WineRecommendation` type has a `currency: string` field that is populated by Claude and can be `EUR`, `USD`, `CHF`, etc. A wine list in a non-UK restaurant will show the wrong currency symbol. Fix: map `wine.currency` to a symbol (`EUR` → `€`, `USD` → `$`) or display the code prefix (`EUR 85`).

**3. Budget slider fires `updatePreferences` on every thumb move in Profile tab**
- File: `app/(tabs)/profile.tsx`, line 423–426
- Severity: **Medium**
- `BudgetSlider` is wired to `onChange={(budget) => updatePreferences({ defaultBudget: budget })}`. `BudgetSlider.onChange` fires on every `onValueChange` from the slider (every tick). This triggers a Supabase upsert on every slider position change — potentially 50+ database writes for a single drag. Fix: debounce the `onChange` callback or use `onSlidingComplete` from `@react-native-community/slider` to write only when the user releases.

**4. Preferences sync from profile is one-shot and stale after profile edits**
- File: `app/(tabs)/scan.tsx`, lines 58–66
- Severity: **Low**
- The `prefsLoaded` guard ensures saved preferences seed the scan form only once. If the user edits their profile preferences in the Profile tab and immediately switches to the Scan tab in the same session, the scan form still shows the old defaults. Remove the `prefsLoaded` guard and instead derive the initial state from `savedPreferences` directly, or reset when `savedPreferences` changes.

**5. Loading state not shown while fonts are loading on cold start**
- File: `app/_layout.tsx`, line 28
- Severity: **Low**
- `if (!fontsLoaded) return null` renders a blank screen during font loading (typically 200–800 ms on first cold start before assets are cached). A brief branded loading indicator or placeholder would prevent the jarring blank-to-content transition.

---

## Navigation Issues

**1. `/scan/url` route is a dead end — the URL feature is non-functional**
- File: `app/scan/url.tsx`, lines 1–5
- Severity: **High**
- The file at `app/scan/url.tsx` is a `<Redirect href="/(tabs)/scan" />`. The OCR edge function fully supports URL-based wine list parsing (lines 49–63 of `supabase/functions/ocr/index.ts`), but there is no UI entry point for it. Any code path or deep link that navigates to `/scan/url` silently drops the user back to scan. Either build the URL input screen or remove the route to avoid confusion.

**2. Sign-in bypasses `index.tsx` routing logic — onboarding gate is skipped**
- File: `app/(auth)/sign-in.tsx`, line 19
- Severity: **High**
- Documented in Bugs above. From a navigation perspective: the intended flow is `app → index.tsx → (onboarding if no profile) → scan`, but sign-in short-circuits to scan directly. The onboarding guard in `index.tsx` only works on cold-app-open with an existing session, not on fresh sign-in.

**3. Profile back button pushes instead of going back**
- File: `app/(tabs)/profile.tsx`, line 182
- Severity: **Medium**
- The chevron-left button calls `router.push('/(tabs)/scan')` instead of `router.back()`. Each tap from Profile to Scan pushes a new scan screen onto the navigation stack. Over multiple back-and-forth navigations, the stack accumulates stale screen instances. Use `router.back()` or `router.navigate('/(tabs)/scan')` to avoid stack growth.

**4. Auth layout missing from router stack — `(auth)` routes are always accessible**
- File: `app/(auth)/_layout.tsx` — file does not exist
- Severity: **Medium**
- The `app/(auth)/` group has no `_layout.tsx`. Without a layout, expo-router uses the default stack layout with the root `app/_layout.tsx` `<Stack>`. Authenticated users can navigate directly to `/(auth)/sign-in` at any time (e.g. via a deep link or accidental navigation) with no redirect guard back to the app. Add an `(auth)/_layout.tsx` that redirects authenticated users to `/(tabs)/scan`.

**5. No error boundary anywhere in the component tree**
- File: `app/_layout.tsx`, line 14–39
- Severity: **Medium**
- There is no `ErrorBoundary` component wrapping the app or any screen. An uncaught render-time error (e.g. accessing a property of an undefined recommendation object) will crash the entire app with a red error screen in development and a white blank screen in production. At minimum, wrap `<Stack>` in an error boundary that shows a friendly recovery UI and optionally resets navigation.
