# Vinster — Code & UX Review
**Date:** 2026-05-05  
**Reviewer:** Vinster Agent  
**Scope:** Full codebase review — bugs, crashes, Supabase/edge function issues, UX, navigation

---

## 1. Bugs and Crashes

### HIGH

---

#### BUG-01 · `app/index.tsx:20` · **Signed-in users skip onboarding due to `undefined` vs `null` check**
**Severity: High**

```tsx
// app/index.tsx L20
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

`usePreferences` is backed by React Query. Before the query resolves, `preferences` is `undefined` (React Query's initial state), not `null`. The guard only tests for `null`, so a freshly signed-in user with no saved preferences immediately hits `<Redirect href="/(tabs)/scan" />` before the query finishes. Once the query resolves returning `null` (PGRST116 — no profile row), the component re-renders and redirects to `/onboarding`, but by that point the router has already navigated away. Affected users are sent to the scan tab without completing onboarding, receive unguided default recommendations, and never set taste preferences.

**Fix:** Expose `isLoading` from `usePreferences`, include it in the loading guard at line 16, and additionally guard against `preferences === undefined`.

---

#### BUG-02 · `app/scan/results.tsx:23-25` · **`router.replace()` called during render**
**Severity: High**

```tsx
// app/scan/results.tsx L23-25
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

`router.replace` is a side effect and must not be called synchronously during a component's render phase. React will fire this on every render pass, including StrictMode double-invocations. This causes a "Cannot update a component from inside the function body of a different component" warning in dev and produces unexpected navigation loops in production (the navigator state is mutated mid-render before the commit phase completes).

**Fix:** Move the redirect into a `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])` and return `null` from the render body independently.

---

#### BUG-03 · `app/(tabs)/history.tsx` (entire file) · **Scan sessions are never written to the database**
**Severity: High**

The `scan_sessions` table is read by the history tab but nothing in the entire codebase inserts into it. Searching for `scan_sessions` yields only the migration, the history query, and the `ScanSession` type — there is no `supabase.from('scan_sessions').insert(...)` call anywhere. Every user's history tab will display "No scans yet" forever regardless of how many scans they complete.

**Fix:** After `setRecommendation(recommendation)` is called in `app/scan/extracting.tsx:116`, insert a row into `scan_sessions` (with `user_id`, `captured_at`, `extracted_wines`, `recommendation`, and `preferences_snapshot`) if `session` is present.

---

#### BUG-04 · `supabase/functions/wine-searcher-proxy/index.ts:48` · **Incorrect Wine-Searcher API endpoint — pricing entirely non-functional**
**Severity: High**

```ts
// supabase/functions/wine-searcher-proxy/index.ts L48
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&winename=...`;
```

`wine-searcher.com/api/wine-check` is not a documented Wine-Searcher API endpoint. The real Wine-Searcher API base is `https://api.wine-searcher.com/` with a different path and parameter structure. Every call to this function will return a 4xx or 5xx from Wine-Searcher, be caught by the catch block at line 82, and return `{ source: 'unavailable' }`. The pricing feature silently reports unavailable on every request.

**Fix:** Verify the correct endpoint and parameter names from the Wine-Searcher API documentation and update line 48 accordingly. Add a non-silent error log distinguishing API errors from network errors.

---

#### BUG-05 · `app/onboarding.tsx:37-50` · **Preferences save is fire-and-forget; user navigated before save completes**
**Severity: High**

```ts
// app/onboarding.tsx L37-50
function handleNext() {
  if (isLast) {
    updatePreferences({ ... });      // mutation.mutate() — synchronous call that queues async work
    router.replace('/(tabs)/scan');  // fires immediately
  }
}
```

`updatePreferences` is `mutation.mutate`, which returns `void` and dispatches the mutation asynchronously. `router.replace` fires before the Supabase upsert is in flight. If the network is slow or fails, the user is already on the scan tab when the mutation eventually errors; `onError` in `usePreferences.ts:50` only does `console.error`. The user's onboarding preferences are silently lost.

**Fix:** Use `mutation.mutateAsync` + `await`, keep the user on the onboarding screen (spinner is already wired via `isSaving`), and navigate only on success. Add an `Alert` on error.

---

#### BUG-06 · `src/api/supabase.ts:7-18` · **`expo-secure-store` 2 048-byte value limit silently breaks session persistence**
**Severity: High**

Supabase access tokens are JWTs that commonly exceed 2 048 bytes, which is `expo-secure-store`'s hard value-size limit. When the token exceeds this limit, `SecureStore.setItemAsync` silently fails (no error thrown, just a no-op). On the next cold launch, `getItemAsync` returns `null` and the user is logged out unexpectedly.

**Fix:** Implement a chunked storage adapter (the community `LargeSecureStore` pattern, or Supabase's own recommended chunking approach for Expo) before shipping. Without this fix, token persistence will be unreliable for users with long JWTs.

---

### MEDIUM

---

#### BUG-07 · `app/scan/camera.tsx:29-98` · **`handleCapture` has no try/catch — unhandled promise rejection on camera error**
**Severity: Medium**

```ts
// app/scan/camera.tsx L29
async function handleCapture() {
  if (!cameraRef.current) return;
  await Haptics.impactAsync(...);
  const photo = await cameraRef.current.takePictureAsync({ ... });
  // No try/catch around any of this
```

If `takePictureAsync` or `ImageManipulator.manipulateAsync` throws (low memory, permission revoked mid-session, hardware error), the rejection propagates uncaught. The camera UI freezes with no error message and the user has no way to recover or retry.

**Fix:** Wrap the body of `handleCapture` in a `try/catch`, surface the error to the user with `Alert.alert`, and add a local `loading` state to disable the shutter button while capture is in progress.

---

#### BUG-08 · `app/(tabs)/history.tsx:13-25` · **No error UI branch — query failures display "No scans yet"**
**Severity: Medium**

```tsx
// app/(tabs)/history.tsx L13-25
const { data: sessions, isLoading } = useQuery({ ... });
```

`isError` is not destructured. On a network failure or RLS error, `isLoading` becomes `false` and `sessions` is `undefined`. The component falls through to `!sessions?.length` at line 47 and renders the "No scans yet" empty state. The user sees a misleading empty state rather than an error message, making the failure invisible and unactionable.

**Fix:** Destructure `isError` and `error` from `useQuery` and render a dedicated error state (e.g., "Could not load your history. Pull to refresh.").

---

#### BUG-09 · `app/(tabs)/history.tsx:64` · **History cards have no `onPress` — entire history list is non-interactive**
**Severity: Medium**

```tsx
// app/(tabs)/history.tsx L64
<TouchableOpacity style={styles.card}>
  {/* No onPress */}
```

Every history card is wrapped in `TouchableOpacity` with no `onPress` handler. Tapping a card produces a visual press animation but nothing happens. There is no way to view the full recommendation details for a past scan.

**Fix:** Either (a) navigate to a detail screen passing the session ID, or (b) replace `TouchableOpacity` with `View` until detail navigation is implemented, so the card doesn't imply interactivity.

---

#### BUG-10 · `app/scan/preferences.tsx:28-33` · **`recommendWines` called with missing required fields (TypeScript type violation)**
**Severity: Medium**

```ts
// app/scan/preferences.tsx L28-33
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes all missing
});
```

`RecommendInput` in `src/services/recommender.ts:5-15` declares all eight fields as required (no `?`). The call site in `preferences.tsx` omits five of them, passing `undefined` to the edge function. This is a compile-time TypeScript error that also degrades runtime behaviour: the edge function will silently receive `undefined` for colour, region, and grape constraints, ignoring all profile-based hard rules.

**Fix:** Pass all required fields. At minimum, source them from `useScanStore().preferences` which already stores them.

---

#### BUG-11 · `app/(tabs)/scan.tsx:86-101` · **`handleScreenshot` not wrapped in try/catch**
**Severity: Medium**

```ts
// app/(tabs)/scan.tsx L86
async function handleScreenshot() {
  const result = await ImagePicker.launchImageLibraryAsync({ ... });
```

`launchImageLibraryAsync` can throw if the system denies photo library access or if an internal ImagePicker error occurs. The rejection is unhandled and will silently crash the interaction. No error is shown to the user.

**Fix:** Wrap in `try/catch` and show `Alert.alert('Could not open photo library', err.message)`.

---

#### BUG-12 · `app/(tabs)/history.tsx:66` · **`format(new Date(item.captured_at), ...)` throws on invalid dates**
**Severity: Medium**

```tsx
// app/(tabs)/history.tsx L66
{format(new Date(item.captured_at), 'd MMM yyyy · h:mm a')}
```

`date-fns/format` throws a `RangeError: Invalid time value` when passed an `Invalid Date` object. If `captured_at` is null, empty string, or a non-ISO string from the DB, `new Date(...)` produces an invalid date and this line throws. Because there is no error boundary around the FlatList, the crash propagates to a white screen.

**Fix:** Replace with `isValid(parseISO(item.captured_at)) ? format(...) : 'Unknown date'` using `date-fns/isValid` and `date-fns/parseISO`.

---

#### BUG-13 · `supabase/functions/ocr/index.ts:87` · **Greedy JSON regex can corrupt response parsing**
**Severity: Medium**

```ts
// supabase/functions/ocr/index.ts L87
const match = text.match(/\{[\s\S]*\}/);
```

This regex is greedy and matches from the first `{` to the **last** `}` in the response. If Claude returns any trailing commentary or multiple JSON-like substrings, the extracted string is not valid JSON. `JSON.parse(match[0])` then throws and the entire OCR request fails. The same pattern exists in `supabase/functions/recommend/index.ts:184`.

**Fix:** Use a JSON-specific extractor: match the outermost balanced braces using a state-machine approach, or make the model more reliably return only JSON by appending a `<json>` sentinel and splitting on it, or use `JSON.parse` on successive substrings until one succeeds.

---

#### BUG-14 · `app/scan/results.tsx:27` · **Empty `wines` array renders a blank results page with no message**
**Severity: Medium**

```tsx
// app/scan/results.tsx L27
const noVintages = recommendation.wines.every((w) => !w.vintage); // true if wines=[]
// L50
{recommendation.wines.map((wine, i) => { ... })}
```

`RecommendationResponseSchema` at `src/services/recommender.ts:55` validates `wines` as an array with `.max(3)` but no minimum. An empty array passes validation. The results screen renders the header, the `noVintages` note, and an empty list — no "no results" message is shown. The user sees a page with only the header and a "Start Another Search" button, with no explanation.

**Fix:** Add `.min(1)` to the schema array validator, or add an explicit empty-state message in the results screen when `recommendation.wines.length === 0`.

---

### LOW

---

#### BUG-15 · `src/api/claude.ts:3-4` · **Missing env var causes confusing runtime crash, not a clear startup error**
**Severity: Low**

```ts
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

The `!` non-null assertions silence TypeScript. If either variable is absent (new developer, CI without `.env`), the app crashes at the first API call with `TypeError: Failed to fetch` against `undefined/functions/v1/...`, not with a clear message.

**Fix:** Add early validation at module level: `if (!supabaseUrl || !anonKey) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY')`.

---

#### BUG-16 · `src/services/recommender.ts:77` · **`_strictDiversity` not declared in `RecommendInput` interface**
**Severity: Low**

```ts
// src/services/recommender.ts L77
const raw2 = await callRecommend({ ...input, _strictDiversity: true });
```

`_strictDiversity` is not part of the `RecommendInput` interface. TypeScript raises an error (`Object literal may only specify known properties`). The edge function reads it at `recommend/index.ts:128` so it works at runtime, but this breaks strict type checking.

**Fix:** Add `_strictDiversity?: boolean` to `RecommendInput`.

---

#### BUG-17 · `app/scan/url.tsx` · **Route exists but immediately redirects; URL OCR feature unreachable from any UI**
**Severity: Low**

```tsx
// app/scan/url.tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The `ocr` edge function supports URL-based extraction (lines 49–62), but the URL screen immediately redirects away and there is no UI entry point to reach it. Dead code in both the route file and the edge function.

---

#### BUG-18 · `src/components/results/WineRecommendationCard.tsx` · **Component defined but never imported or used**
**Severity: Low**

`WineRecommendationCard` is a self-contained card component in `src/components/results/WineRecommendationCard.tsx` that imports `PricingBadge`, `VintageBadge`, etc. It is never imported by any screen. The results screen (`app/scan/results.tsx`) renders wine cards inline with duplicated logic. Dead code consuming bundle size.

---

#### BUG-19 · `app/scan/preferences.tsx` · **Screen has no navigation entry point — dead route**
**Severity: Low**

`app/scan/preferences.tsx` exists as a valid Expo Router route but is never navigated to from any screen in the app. The scan flow is `camera → preview → extracting → results`; preferences is not on that path. The screen also calls `recommendWines` without all required fields (BUG-10). This is dead code.

---

---

## 2. Supabase and Edge Function Issues

---

#### SUP-01 · `supabase/migrations/001_initial_schema.sql` · **`pricing_cache` has RLS disabled — publicly readable and writable**
**Severity: High**

```sql
-- 001_initial_schema.sql L38-45
create table pricing_cache (
  wine_key text primary key,
  ...
);
-- No: alter table pricing_cache enable row level security;
-- No policy defined
```

`profiles` and `scan_sessions` both have RLS enabled, but `pricing_cache` does not. With RLS disabled, any request using the anon key can read all cached pricing entries and upsert arbitrary records. A malicious user could pollute the cache with fake pricing data (wrong average prices, fabricated critic scores) that would be served to all other users for up to 7 days.

**Fix:** Add `alter table pricing_cache enable row level security;` and a policy that restricts direct client access to reads only (or no direct access at all, since it should only be written by the service-role edge function). The edge function already uses `SUPABASE_SERVICE_ROLE_KEY` so it bypasses RLS correctly.

---

#### SUP-02 · `src/hooks/usePreferences.ts:36-47` · **Upsert errors silently swallowed — failed saves not surfaced to user**
**Severity: Medium**

```ts
// src/hooks/usePreferences.ts L38-47
await supabase.from('profiles').upsert({ ... });
// No error check on the returned {data, error}
```

The `upsert` call does not check the returned `error` field. A failed upsert (e.g., RLS violation if `user_id` mismatches, network drop, schema constraint failure) is silently ignored. The `onError` callback at line 50 only fires if the `mutationFn` throws, but `upsert` returns `{data, error}` without throwing. This means preference saves can fail completely with no user notification and no thrown error.

**Fix:** Change to `const { error } = await supabase.from('profiles').upsert({ ... }); if (error) throw error;` so the mutation's `onError` handler fires correctly on DB errors.

---

#### SUP-03 · `supabase/functions/recommend/index.ts` · **Current date never injected into prompt — drinking window assessments are unreliable**
**Severity: Medium**

The system prompt at line 38 instructs Claude to "Assess whether the wine is currently within its optimal drinking window **as of today's date**." However, today's date is never included anywhere in the request. Claude's internal sense of the current date is based on training data and is unreliable (typically lags by months). A 2020 Barolo assessed in a model believing it's 2023 vs 2026 will produce very different drinking window verdicts.

**Fix:** Add `Today's date is ${new Date().toISOString().split('T')[0]}` to the `userContext` string at `recommend/index.ts:150`.

---

#### SUP-04 · `supabase/functions/recommend/index.ts:139` · **Budget constraint hardcodes £ symbol regardless of user currency**
**Severity: Medium**

```ts
// recommend/index.ts L139
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```

The currency symbol is hardcoded as £ even though the app supports multiple currencies. A user browsing a USD wine list with a $80 budget would have the constraint communicated to Claude as `£80`, which may cause Claude to mis-apply the rule when matching against USD menu prices.

**Fix:** Accept a `currency` field in the edge function request body and use it in the budget constraint string: `${currency}${budget}`.

---

#### SUP-05 · `supabase/functions/ocr/index.ts:59` · **OCR function uses `claude-opus-4-6` for structured extraction — unnecessary cost**
**Severity: Low**

Both the OCR and recommend edge functions use `claude-opus-4-6`, the most expensive model. Wine list extraction is a structured JSON extraction task that does not require the full reasoning capability of Opus. `claude-sonnet-4-6` costs roughly 3–5× less per token and performs equivalently on this task.

**Fix:** Change the OCR function to use `claude-sonnet-4-6`. Leave `claude-opus-4-6` in the recommend function where nuanced reasoning (vintage assessment, value scoring, diversity constraints) benefits from the larger model.

---

#### SUP-06 · `src/hooks/usePreferences.ts:19-22` · **`.single()` PGRST116 logged as a warning on every new user**
**Severity: Low**

```ts
// usePreferences.ts L19-22
if (error) {
  console.warn('[Preferences] Query error:', error.message);
  return null;
}
```

When a new user logs in and has no `profiles` row, `.single()` returns `PGRST116: "no rows"`. This is the expected state for new users, but `console.warn` treats it as an error. Every new user triggers a console warning in dev and in production crash-reporting tools.

**Fix:** Check `error.code === 'PGRST116'` and return `null` silently, logging a warning only for unexpected error codes.

---

---

## 3. UX and Performance Issues

---

#### UX-01 · `app/_layout.tsx` · **No error boundary — any render error crashes the entire app to a white screen**
**Severity: High**

The root layout wraps the navigator in `GestureHandlerRootView → QueryClientProvider → AuthProvider → Stack` with no `<ErrorBoundary>`. Any unhandled throw during rendering (e.g., BUG-12's date-fns crash) propagates to the root and produces a white screen with no recovery path. On iOS there is no restart prompt; on Android the OS offers a crash restart dialog only.

**Fix:** Wrap the `<Stack>` in an `<ErrorBoundary>` component that renders a friendly "Something went wrong — restart the app" screen with a reset button.

---

#### UX-02 · `app/(tabs)/history.tsx` · **No pull-to-refresh on the history list**
**Severity: Medium**

The `FlatList` at line 59 has no `refreshing` or `onRefresh` props. Once the user is on the history tab, the list cannot be manually refreshed without leaving and re-entering the tab. This is especially important given BUG-03 (sessions not yet being written), but even once fixed, stale data with no pull-to-refresh is poor UX.

**Fix:** Add `refreshing={isRefetching}` and `onRefresh={() => refetch()}` to the `FlatList`. Destructure `isRefetching` and `refetch` from the `useQuery` result.

---

#### UX-03 · `app/scan/camera.tsx` · **No loading state after capture — double-tap risk**
**Severity: Medium**

After the user taps the capture button, `handleCapture` performs haptic feedback, takes a photo, runs `ImageManipulator.manipulateAsync` twice (normalise + crop), and navigates. This can take 1–3 seconds. During this time the capture button remains enabled and fully interactive. The user seeing no feedback may tap it again, causing a second capture to begin.

**Fix:** Add a `capturing` state, set it to `true` at the start of `handleCapture` and `false` at the end, disable the capture button when `capturing === true`, and show a loading indicator in the UI (e.g., a spinner replacing the inner circle of the shutter button).

---

#### UX-04 · `app/scan/extracting.tsx` · **No cancel option during the AI processing flow**
**Severity: Medium**

The extracting screen tells users "Please don't leave this page while we're searching" but provides no cancel button. If the user changes their mind or the request is taking too long (a network issue could hold `fetch` indefinitely if no timeout is set), they are stranded on the loading screen. iOS back-swipe and Android hardware back both work, but there is no visible affordance.

**Fix:** Add a "Cancel" button that calls `token.active = false` and `router.replace('/(tabs)/scan')`. Also add a `signal: AbortController.signal` to the `fetch` calls in `invokeFunction` (in `src/api/claude.ts`) tied to the token, so the network request is aborted.

---

#### UX-05 · `app/(tabs)/profile.tsx:182-184` · **Back/home icon positioned top-right with wrong direction**
**Severity: Low**

```tsx
// app/(tabs)/profile.tsx L182-184
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

An `arrow-back` icon is placed in the **top-right** corner of the profile screen. Platform conventions place back navigation in the top-left. A back arrow in the top-right is confusing and visually clashes with the `headerRow` layout where it sits next to the "Your Account" heading. The destination (`scan` tab) is also not the "previous" screen but the app's home tab.

**Fix:** Replace with `Ionicons name="camera-outline"` or `name="home-outline"` to communicate the destination, or remove it entirely since the tab bar already provides navigation to Scan.

---

#### UX-06 · `app/scan/results.tsx` · **No back-to-camera button; "Start Another Search" resets too aggressively**
**Severity: Low**

"Start Another Search" at line 123 calls `reset()` which clears the entire scan store (wines, recommendation, image URIs) and sends the user to the scan tab. If the user wanted to tweak preferences and re-run on the same list, they must rescan the menu from scratch. There is also no way to return to the extracting/loading screen to retry.

**Fix:** Add a secondary "Change Preferences & Re-scan" button that preserves `extractedWines` in the store, resets only `recommendation`, and navigates to the preferences screen.

---

#### UX-07 · `app/onboarding.tsx` · **Step 4 shows both regional and varietal dislikes but only one scroll view**
**Severity: Low**

Step 4 renders two `ChipPicker` lists (regions to avoid, grapes to avoid) stacked vertically inside the `ScrollView`. With the full list of regions (`WINE_REGIONS`) and grape varieties (`GRAPE_VARIETIES`), this step is significantly longer than all other steps. The "Next" button is below both pickers and may not be visible without scrolling, and there is no indication to the user that there is more content below.

**Fix:** Split step 4 into two separate steps (one for regional dislikes, one for varietal dislikes), update `STEPS.length` and the progress dots accordingly.

---

#### UX-08 · `src/components/preferences/ChipPicker.tsx:16-19` · **Local state desync with parent causes stale selections**
**Severity: Low**

```tsx
// ChipPicker.tsx L16-19
const [local, setLocal] = useState(selected);
useEffect(() => {
  setLocal(selected);
}, [selected]);
```

`local` is initialised from `selected` and re-synced when `selected` changes. However, if the parent triggers an `onChange` and re-renders before the Supabase mutation completes (optimistic vs committed state mismatch), there is a brief flicker where the local state resets to the pre-mutation server value. This is particularly visible during rapid chip toggling in the profile screen.

**Fix:** Consider driving the component directly from the parent's state (passing `selected` and `onChange` without the internal `local` copy), since the profile and scan screens already maintain local state for these values.

---

---

## 4. Navigation Issues

---

#### NAV-01 · `app/scan/` directory · **No `_layout.tsx` for scan sub-stack — scan screens share root Stack**
**Severity: Medium**

The `app/scan/` directory has no `_layout.tsx`. All scan route screens (`camera`, `preview`, `extracting`, `results`, `preferences`, `url`) are treated as children of the root Stack. This means:
1. The root `Stack screenOptions={{ headerShown: false }}` applies globally, which is working as intended, but there is no way to configure scan-stack-specific options (e.g., `gestureEnabled: false` on the extracting screen to prevent accidental swipe-back during AI processing).
2. All scan routes appear as full-screen modals/pushes in the root stack history, which means navigating back from results could theoretically navigate back through preview and camera if the user uses OS back gestures.

**Fix:** Add `app/scan/_layout.tsx` with a nested `<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>` and disable gestures specifically on the extracting screen.

---

#### NAV-02 · `app/(auth)/sign-in.tsx:19` · **After sign-in, navigation bypasses onboarding check**
**Severity: Medium**

```ts
// app/(auth)/sign-in.tsx L19
router.replace('/(tabs)/scan');
```

After a successful sign-in, the code navigates directly to `/(tabs)/scan` rather than back to `/` (the index guard). A user who signs in for the first time on a new device has no profile row, but they are sent to the scan tab instead of onboarding. The index guard at `app/index.tsx` would have caught this, but it is bypassed by the direct navigation.

**Fix:** Replace `router.replace('/(tabs)/scan')` with `router.replace('/')` so the index guard re-evaluates whether onboarding is needed.

---

#### NAV-03 · `app/welcome.tsx:8-10` · **"Start Scanning" sets `hasLaunched` but guest's scan preferences never initialised**
**Severity: Low**

```ts
// app/welcome.tsx L8-10
async function handleGuest() {
  await AsyncStorage.setItem('hasLaunched', 'true');
  router.replace('/(tabs)/scan');
}
```

After a guest taps "Start Scanning", `hasLaunched` is set and they land on the scan tab. On subsequent launches, `app/index.tsx:25` sends them directly to `/(tabs)/scan` (bypassing welcome). However, since there is no session, `usePreferences` returns `undefined` and the scan tab defaults to all-empty preferences. There is no prompt or discovery mechanism for guests to ever reach the onboarding flow or understand that signing up provides better recommendations (other than a small footnote on the welcome screen).

---

#### NAV-04 · `app/index.tsx:9` · **`usePreferences` called unconditionally, creates subscription for non-authenticated users**
**Severity: Low**

```tsx
// app/index.tsx L9
const { preferences } = usePreferences();
```

`usePreferences` is called at the top of the index component for all users including guests. The hook subscribes to the React Query cache and creates a query entry (even though `enabled: !!session` prevents the actual fetch). For unauthenticated users this is harmless but creates unnecessary overhead on every app launch.

**Fix:** Call `usePreferences()` only within the authenticated branch, or accept the minor overhead as negligible.

---

*End of report — 2026-05-05*
