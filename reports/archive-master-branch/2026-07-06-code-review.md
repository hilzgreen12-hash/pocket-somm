# Code Review — 2026-07-06

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

---

## Bugs and Crashes

### High

**BUG-01** `app/scan/results.tsx:22–25` — **Severity: High**
`router.replace('/(tabs)/scan')` is called directly in the component function body during render when `recommendation` is null. Navigation calls made during render violate React's render-phase purity rules and fire on every reconciliation cycle. This should be inside a `useEffect` with the appropriate dependency.

```tsx
// Current (broken)
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}

// Fix
useEffect(() => {
  if (!recommendation) router.replace('/(tabs)/scan');
}, [recommendation]);
if (!recommendation) return null;
```

---

**BUG-02** `src/hooks/useAuth.tsx:17–20` — **Severity: High**
`supabase.auth.getSession()` has no `.catch()`. If the network is unavailable or Supabase returns an error, `setLoading(false)` is never called. The `loading` flag stays `true` permanently, blocking the entire app at a blank screen with no error message and no way to recover without a restart.

```ts
// Current (broken)
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});

// Fix
supabase.auth.getSession()
  .then(({ data }) => setSession(data.session))
  .catch(() => {}) // session stays null, loading clears
  .finally(() => setLoading(false));
```

---

**BUG-03** `app/scan/camera.tsx:29–98` — **Severity: High**
`handleCapture` is an `async` function with no `try/catch`. Any error thrown by `cameraRef.current.takePictureAsync()` or either `ImageManipulator.manipulateAsync()` call produces an unhandled promise rejection. On Android this can crash the JS thread silently. The user sees a frozen camera with no feedback. There is also no guard against double-tap: calling `handleCapture` twice in quick succession will fire two concurrent capture operations.

---

**BUG-04** `supabase/functions/ocr/index.ts:57` and `supabase/functions/recommend/index.ts:170` — **Severity: High**
Both edge functions specify model `claude-opus-4-6`. The current Anthropic API model ID for Claude Opus 4 is `claude-opus-4-8`. The model ID `claude-opus-4-6` is outdated. When the Anthropic API deprecates it, every OCR call and every recommendation call will return a 404 or 400 error, breaking all core functionality simultaneously. Update both to `claude-opus-4-8`.

---

**BUG-05** `src/api/claude.ts:7–17` — **Severity: High**
`invokeFunction` sends only `apikey: ANON_KEY` in the request headers, not an `Authorization: Bearer <jwt>` header. The edge functions therefore receive only the anon role — they cannot verify the caller's identity server-side, making the OCR and recommend endpoints callable by any unauthenticated party who knows the anon key (which is public in `eas.json` and `.env.example`). The correct pattern is `supabase.functions.invoke()`, which automatically attaches the user's JWT, as already done in `src/api/wine-searcher.ts:5`.

---

### Medium

**BUG-06** `app/index.tsx:20` — **Severity: Medium**
Onboarding gate uses strict `=== null`. `usePreferences` returns `undefined` while the React Query fetch is in-flight (the query is enabled but not yet resolved). `undefined === null` is false, so a new signed-in user whose profile query has not yet settled is routed directly to `/(tabs)/scan`, bypassing onboarding. The guard should be `preferences == null` (loose equality), or the screen should hold until `!isLoading`.

---

**BUG-07** `src/hooks/usePreferences.ts:38–47` — **Severity: Medium**
The `upsert` result is `await`ed but never destructured — `{ error }` is discarded. Supabase does not throw on DB errors; it returns the error inside the response object. Because the `mutationFn` never throws, React Query always calls `onSuccess`. Preference saves can fail (RLS violation, schema mismatch, network drop) with no error surfaced to the user and no retry attempted. Change to:
```ts
const { error } = await supabase.from('profiles').upsert({...});
if (error) throw error;
```

---

**BUG-08** `app/scan/extracting.tsx:37–39` — **Severity: Medium**
The budget pre-filter at line 101 passes `userProfile` (the persisted `profiles` row via `usePreferences`) to `preFilterWines`, and the filter uses `prefs.defaultBudget` (line 38). The scan-level budget override lives in the Zustand `preferences.budget` field (line 104), which is passed to the recommend call but never to `preFilterWines`. A user who sets a tighter budget on the scan screen will still see wines above that budget sent to the recommendation engine because the pre-filter uses the saved profile budget.

---

**BUG-09** `app/(auth)/sign-in.tsx:13–15` — **Severity: Medium**
`setLoading(false)` is called on line 15, immediately before the `if (error)` check on line 16. This means if `signInWithPassword` itself throws (network error, unexpected exception), the function exits before reaching line 15 and the loading spinner never clears, leaving the button permanently disabled. Use a `finally` block:
```ts
try {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) Alert.alert('Sign in failed', error.message);
  else router.replace('/(tabs)/scan');
} finally {
  setLoading(false);
}
```

---

**BUG-10** `app/(tabs)/history.tsx:71–73` — **Severity: Medium**
`item.recommendation?.topPick` does not exist on `RecommendationResponse`. The type at `src/types/wine.ts` defines `{ wines: WineRecommendation[]; summary: string }` — there is no `topPick` field. The expression is always `undefined`, so the wine name subtitle is never rendered in any history card. The correct access is `item.recommendation?.wines?.[0]?.name`.

---

**BUG-11** `src/services/recommender.ts:75–82` — **Severity: Medium**
After a duplicate-grape retry, if `parsed2.success` is false (the retry also returns malformed JSON or fails Zod validation), the code falls through to `return parsed.data` on line 82 — returning the original result that was already flagged as having duplicate grapes. No error is raised, no warning is logged. The user silently receives a response that violates the app's own diversity rules.

---

**BUG-12** `src/services/recommender.ts:62` — **Severity: Medium**
`hasDuplicateGrapes` extracts the primary grape by splitting on `/` only (`w.grape?.split('/')[0]`). Grapes returned with other separators — `"Cabernet Sauvignon, Merlot"`, `"Grenache & Syrah"`, `"Cabernet-Sauvignon"` — are not split, so the full string is compared. Two wines both listed as `"Cabernet Sauvignon, Merlot"` would be detected as duplicates, but `"Cabernet Sauvignon/Merlot"` and `"Cabernet Sauvignon, Merlot"` would not, producing false negatives in duplicate detection.

---

### Low

**BUG-13** `app/scan/camera.tsx:15,24–27` — **Severity: Low**
`focusPoint` state is updated by `handleTap` but is never passed to `CameraView`. Tapping the preview to focus does nothing. Remove the `focusPoint` state and `handleTap` handler, or wire `focusPoint` to the `CameraView` props when the `expo-camera` API supports it.

---

**BUG-14** `app/scan/preview.tsx:10–18` — **Severity: Low**
`handleRetake` calls `reset()` followed immediately by `router.replace('/(tabs)/scan')` on line 18. Setting `imageUri` to null via `reset()` causes the `useEffect` on line 10 to fire and call `router.replace('/(tabs)/scan')` a second time. This is a double-navigation race: both calls target the same destination so the symptom is benign today, but it will break if either the effect or the handler ever targets a different route.

---

**BUG-15** `src/constants/vintageCharts.ts` — **Severity: Low**
`VINTAGE_CHARTS` is defined as an empty object `{}`. The `lookupVintageScore()` function is implemented but unconditionally returns `null` because there is no data. Any feature that calls `lookupVintageScore` relies entirely on the LLM's knowledge of vintage quality rather than local lookup data. The constant should either be populated or removed so the empty-data state is explicit.

---

## Supabase and Edge Function Issues

**SUP-01** `supabase/migrations/001_initial_schema.sql:10–13` and `27–30` — **Severity: High**
Both the `profiles` and `scan_sessions` RLS policies use `FOR ALL USING (auth.uid() = user_id)` without a `WITH CHECK` clause. The `USING` predicate restricts SELECT, UPDATE, and DELETE but **not INSERT**. Any authenticated user can insert a row with an arbitrary `user_id` via the Supabase REST or JS client. Add `WITH CHECK (auth.uid() = user_id)` to both policies, or replace with separate `FOR SELECT/INSERT/UPDATE/DELETE` policies.

---

**SUP-02** `supabase/functions/ocr/index.ts:49–52` — **Severity: High**
The URL mode performs `fetch(url, ...)` with no validation of the URL scheme or host. A caller can pass `url: "http://169.254.169.254/latest/meta-data/"` (AWS IMDS) or any internal Supabase service address, turning the edge function into an SSRF proxy. Validate that the URL uses `https://` and resolves to a public IP before fetching.

---

**SUP-03** `eas.json:8–9` and `.env.example:2–3` — **Severity: High**
The real Supabase URL (`https://skwfykendnhnhhbdrfbr.supabase.co`) and anon key (`sb_publishable_wsa6cGlrAaULP_YA1JwDlQ_h-qaHTke`) are committed in plaintext to the repository. `.env.example` should contain only placeholder values. `eas.json` preview env vars should be moved to EAS Secret environment variables, not committed. Anyone with read access to the repo has these credentials.

---

**SUP-04** `supabase/migrations/001_initial_schema.sql:33–43` — **Severity: Medium**
`pricing_cache` has no RLS enabled. Any authenticated client with the anon key can read, update, or delete all pricing cache entries for all users. An attacker could poison pricing data, removing entries to force repeated Wine-Searcher API calls (quota exhaustion) or inserting fabricated prices. Enable RLS or restrict access to service-role only.

---

**SUP-05** `supabase/functions/recommend/index.ts:194` — **Severity: Medium**
The `catch` block returns a 500 response without a `Content-Type: application/json` header (line 194), while the success path sets it on line 189. Clients that check `Content-Type` before parsing (or Supabase's own SDK response handling) may fail to parse the error body as JSON, masking the real error message with a parse error instead.

---

**SUP-06** `supabase/functions/wine-searcher-proxy/index.ts:83–86` — **Severity: Medium**
On any error, the proxy returns HTTP 200 with `source: 'unavailable'`. The client cannot distinguish a successful empty-result from a complete backend failure without inspecting the response body. Pricing errors (network failure, API key invalid, quota exceeded) are all silent from the HTTP status perspective. Return a 4xx or 5xx so the caller can detect and log failures.

---

**SUP-07** `supabase/functions/wine-searcher-proxy/index.ts:48` — **Severity: Medium**
The Wine-Searcher API key is appended to the URL as a query parameter (`api_key=${WINE_SEARCHER_API_KEY}`). This key will appear in Supabase's edge function execution logs and in Wine-Searcher's access logs. Use an `Authorization` or `X-Api-Key` request header instead.

---

**SUP-08** `supabase/migrations/001_initial_schema.sql:21` — **Severity: Low**
`scan_sessions.user_id` is declared without `NOT NULL`. An unauthenticated insert (or a bug that passes `null`) would create a session row with no owner that is invisible to all users (the RLS policy `auth.uid() = user_id` never matches null) but occupies storage and can only be cleaned up by a service-role query.

---

**SUP-09** `supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` — **Severity: Low**
Neither edge function handles CORS. There are no `Access-Control-Allow-Origin` headers and no `OPTIONS` preflight handler. If the app ever targets a web platform, all direct invocations will fail with a CORS error. Add the standard Supabase CORS headers:
```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
```

---

## UX and Performance Issues

**UX-01** `app/(tabs)/profile.tsx` — **Severity: Medium**
`BudgetSlider` fires `onChange` on every value change during a drag via `onValueChange`. The profile screen passes `updatePreferences` directly to this callback, triggering a Supabase upsert on every individual pixel of slider movement. A single drag across the slider can fire 50–100 network requests in under a second. Replace `onValueChange` with `onSlidingComplete` in `BudgetSlider.tsx` so the save fires only when the user releases the slider.

---

**UX-02** `app/(tabs)/history.tsx:64` — **Severity: Medium**
History list cards are `TouchableOpacity` with no `onPress` handler. Tapping a past scan does nothing. The user has no way to view the full recommendation from a previous session. Either implement a detail screen and add `onPress={() => router.push('/scan/history/' + item.id)}`, or replace `TouchableOpacity` with `View` to remove the misleading interactive affordance.

---

**UX-03** `app/scan/extracting.tsx:155–159` — **Severity: Medium**
The `profileNote` text reads: "We're making a recommendation based on your profile preferences. Change your preferences for this result only by setting filters for this search." There is no per-scan filter UI. `app/scan/preferences.tsx` exists but is orphaned — it is never navigated to and missing required props. This copy creates a false expectation of functionality that does not exist.

---

**UX-04** `app/scan/extracting.tsx:143–151` — **Severity: Low**
When `stage === 'recommending'`, the component renders both the body `Text` at line 146–148 ("Scoring by critic rating, vintage quality and value") **and** a second `Text` block at line 150–152 ("This may take a minute or two"). Both are unconditionally rendered when recommending, so the user sees two separate stacked text labels under the spinner.

---

**UX-05** `app/(tabs)/_layout.tsx` — **Severity: Low**
The tab bar has no `tabBarIcon` configuration on any of the three `Tabs.Screen` entries. All three tabs display the same default placeholder icon (a small grid square). Users cannot distinguish tabs visually at a glance. Add `Ionicons` icons matching the tab purpose (camera/scan, clock/history, person/profile).

---

**UX-06** `app/welcome.tsx` — **Severity: Low**
The welcome screen root is a plain `View` with no `SafeAreaView`. On devices with top notches or bottom home indicators (iPhone 14 Pro, Pixel 7, etc.) the three CTA buttons may render under the home indicator or under the status bar.

---

**UX-07** `src/components/results/WineRecommendationCard.tsx` and `src/components/results/PricingBadge.tsx` — **Severity: Low**
Both components are dead code — they are not imported by any screen. `results.tsx` reimplements the wine card inline. Fixes applied to `WineRecommendationCard.tsx` have no effect on the UI. Either adopt `WineRecommendationCard` in `results.tsx` to reduce duplication, or delete both files.

---

## Navigation Issues

**NAV-01** `app/scan/results.tsx:22–25` — **Severity: High**
(Also logged as BUG-01.) `router.replace()` is called in the render body, not inside a `useEffect`. This is the same issue documented in BUG-01. In addition to the crash risk, calling `router.replace` during render means it fires before the component tree is committed, which can cause expo-router to navigate before its internal state is ready, leading to double-navigation or a blank screen.

---

**NAV-02** `app/(auth)/sign-in.tsx:19` — **Severity: High**
After a successful sign-in, the screen routes directly to `/(tabs)/scan`. This bypasses `app/index.tsx`'s routing logic entirely. A user who creates an account and signs in for the first time will never see the onboarding flow — they go straight to the scan tab with no preferences set. The fix is to route to `/` (the index) and let the router decide based on session and preference state.

---

**NAV-03** `app/(auth)/_layout.tsx` — **Severity: Medium**
No guard redirects authenticated users away from the auth screens. A signed-in user can navigate to `/(auth)/sign-in` or `/(auth)/sign-up` (e.g. via deep link or browser history) and see the login forms while already authenticated. Add a redirect:
```tsx
const { session } = useAuth();
if (session) return <Redirect href="/(tabs)/scan" />;
```

---

**NAV-04** `app/onboarding.tsx:36–47` — **Severity: Medium**
`handleNext` calls `mutation.mutate(...)` (fire-and-forget) on line 38 and then immediately calls `router.replace('/(tabs)/scan')` on line 47 without waiting for the save to complete. If the upsert takes longer than the navigation transition, the component unmounts mid-mutation, the mutation result is discarded, and the preferences are never saved. The user is onboarded with default/empty preferences despite completing the flow. Use `mutation.mutateAsync` and `await` it, or use the `onSuccess` callback to drive navigation.

---

**NAV-05** `app/(tabs)/profile.tsx` — **Severity: Low**
The back arrow button calls `router.push('/(tabs)/scan')` rather than `router.back()`. Each press pushes a new scan screen onto the navigation stack. After several back-and-forth navigations the stack grows unboundedly. Use `router.back()` or `router.replace` to navigate without stacking.

---

**NAV-06** `app/scan/preferences.tsx` — **Severity: Low**
This screen is unreachable from any navigation in the app. It is never the target of a `router.push`, `router.replace`, or `<Link>` anywhere in the codebase. It also contains a broken `recommendWines()` call missing five required fields (`wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, `dislikedGrapes`). Either wire it into the scan flow (per the orphaned copy in `extracting.tsx` that references "filters for this search") or delete it.

---

**NAV-07** `app/scan/url.tsx` — **Severity: Low**
The entire file is `<Redirect href="/(tabs)/scan" />`. URL-based scanning is unimplemented on the client despite the OCR edge function fully supporting a `url` parameter path. This is a dead route that silently redirects away from intended functionality.

---

*Generated by automated code review — 2026-07-06*
