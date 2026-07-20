# Code Review — 2026-06-12

Codebase: Pocket Somm (Expo SDK 54, expo-router, Supabase, Claude API)
Reviewer: Automated code review agent
Scope: Bugs & crashes · Supabase & edge functions · UX & performance · Navigation

---

## Bugs and Crashes

### HIGH

**1. Onboarding navigates before save completes**
`app/onboarding.tsx:38–47`

`handleNext()` calls `updatePreferences({...})` (which fires `mutation.mutate`, an async operation) and then immediately calls `router.replace('/(tabs)/scan')` in the same synchronous function body. The router fires before the Supabase upsert resolves. If the network is slow or the upsert fails, the user arrives at the scan tab with no preferences saved and no error shown.

```ts
updatePreferences({ wineTypes, ... }); // async — not awaited
router.replace('/(tabs)/scan');         // fires immediately
```

Fix: expose `mutateAsync` from the hook and await it, or navigate in `onSuccess`.

---

**2. New authenticated users silently skip onboarding**
`app/index.tsx:20`

The onboarding gate reads:

```ts
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

React Query's `data` is `undefined` (not `null`) while the preferences query is in-flight. For a freshly signed-in user with no profile row the query is enabled but not yet resolved, so `preferences === undefined`, the `null` check is false, and the app immediately redirects to `/(tabs)/scan`. The user never sees onboarding. Only `loading` from `useAuth` is awaited (line 16); there is no equivalent guard for the preferences query.

Fix: also wait for preferences to resolve: `if (loading || hasLaunched === null || (session && preferences === undefined)) return null;`

---

**3. Supabase upsert errors silently discarded in `usePreferences`**
`src/hooks/usePreferences.ts:38–47`

`@supabase/supabase-js` v2 returns `{ data, error }` rather than throwing. The `mutationFn` never inspects the returned `error`:

```ts
await supabase.from('profiles').upsert({ user_id: ..., ...updates });
// error is thrown away — mutation resolves as success
```

Because no exception is thrown, `onError` never fires and the user sees no feedback when a save fails. This affects both the onboarding and profile screens.

Fix: destructure `{ error }` and throw if it is set.

---

**4. `handleCapture` in camera screen has no error handling**
`app/scan/camera.tsx:29–98`

The async `handleCapture` function calls `cameraRef.current.takePictureAsync()` and two `ImageManipulator.manipulateAsync()` calls with no try-catch. Any failure (hardware error, out-of-memory on large sensor output, manipulator failure) produces an unhandled promise rejection. On iOS this is a silent no-op; on Android it can crash the JS thread.

Fix: wrap the body of `handleCapture` in try-catch and route errors to a user-visible message.

---

### MEDIUM

**5. History cards access non-existent `topPick` property**
`app/(tabs)/history.tsx:71–73`

```ts
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` has `wines: WineRecommendation[]` and `summary: string` — there is no `topPick` field (`src/types/wine.ts:50–53`). Optional chaining prevents a runtime crash, but the wine name is never rendered for any history item. The correct access is `item.recommendation?.wines?.[0]?.name`.

---

**6. `scan/preferences.tsx` calls `recommendWines` with missing required fields**
`app/scan/preferences.tsx:28–34`

The call omits `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`, all of which are non-optional in the `RecommendInput` interface (`src/services/recommender.ts:5–15`). This is a TypeScript compile error. The screen is currently unreachable from any navigation path (see Navigation Issues §4), but it will block a clean build and indicates the screen was left half-finished.

---

**7. Duplicate-grape retry falls back to duplicate result without signalling**
`src/services/recommender.ts:74–82`

After detecting duplicate grapes the function retries once. If the second parse also fails (`!parsed2.success`), the `if` body exits without returning and execution falls through to `return parsed.data` — the original result with duplicate grapes — with no warning thrown or logged.

```ts
if (parsed2.success) return parsed2.data;
// falls through silently if parsed2 also fails
```

Fix: add an `else` branch that throws or returns the first result explicitly with a console warning.

---

**8. `AsyncStorage.getItem` rejection never caught**
`app/index.tsx:13`

```ts
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```

There is no `.catch()`. If AsyncStorage fails (possible on first boot, storage full, or corrupt keychain), the promise rejects silently, `hasLaunched` stays `null` forever, and the `loading || hasLaunched === null` guard on line 16 keeps the app stuck on a blank screen.

Fix: `.then(...).catch(() => setHasLaunched(false))`.

---

**9. No error boundaries anywhere in the app**
`app/_layout.tsx`

There are no React error boundaries wrapping any route group or the root `<Stack>`. A render-time exception in any component (e.g., a null-dereference in a results card) will crash the entire app with an unrecoverable white screen. React Native does not automatically recover from render errors without a boundary.

Fix: wrap at minimum the `<Stack>` and the tab layout in an `<ErrorBoundary>` component that displays a recoverable error screen.

---

### LOW

**10. `handleScreenshot` not wrapped in try-catch**
`app/(tabs)/scan.tsx:86–102`

`ImagePicker.launchImageLibraryAsync` is awaited but there is no try-catch. Permissions denied or OS-level picker failures can throw, producing an unhandled rejection.

---

**11. Budget filter type unsafety**
`app/scan/extracting.tsx:37–39`

```ts
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => ... w.menuPrice <= prefs.defaultBudget);
}
```

`prefs.defaultBudget` is `number | null`. Inside the filter callback, TypeScript does not narrow it to `number` from the outer `if` guard, so this is likely a compile error or requires a non-null assertion. A budget of `0` would also be excluded by the falsy check, silently disabling the filter.

---

## Supabase and Edge Function Issues

**1. Edge functions have no authentication check — unlimited Claude API cost exposure**
`supabase/functions/ocr/index.ts:38` · `supabase/functions/recommend/index.ts:115`

Neither edge function checks the `Authorization` header or validates that the caller is a legitimate app user. `src/api/claude.ts:7–13` invokes them with only `apikey: ANON_KEY`. The anon key is public by design (bundled in the app). Any party who knows the Supabase project URL and anon key — easily extracted from the binary — can call these functions directly, triggering unlimited Claude API calls billed to the developer.

Fix: add a Supabase JWT check at the top of each function:
```ts
const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
if (!jwt) return new Response('Unauthorized', { status: 401 });
const { data: { user }, error } = await supabase.auth.getUser(jwt);
if (error || !user) return new Response('Unauthorized', { status: 401 });
```
And update the client to include the session JWT in the `Authorization` header.

---

**2. SSRF: OCR edge function fetches arbitrary user-supplied URLs**
`supabase/functions/ocr/index.ts:51`

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

The `url` value comes directly from the request body with no allowlist or scheme check. An attacker can supply `http://169.254.169.254/latest/meta-data/` (AWS IMDS) or any internal Supabase/Deno host to exfiltrate environment variables or service credentials from within the function's network boundary.

Fix: validate that `url` starts with `https://` and matches an allowlist of restaurant/menu domains, or use a URL-parsing check to reject private IP ranges and cloud metadata endpoints.

---

**3. `pricing_cache` table has no RLS policy**
`supabase/migrations/001_initial_schema.sql:33–44`

RLS is enabled on `profiles` and `scan_sessions`, but `pricing_cache` has no `create policy` statement. Any authenticated Supabase user can read, insert, update, or delete rows in this table directly via the REST API, bypassing the edge function entirely. This enables cache poisoning: a malicious user could insert crafted price data for a wine name they know will be queried.

Fix: add a policy that allows only reads by authenticated users and reserves writes to the service role:
```sql
alter table pricing_cache enable row level security;
create policy "Service role only writes" on pricing_cache
  for all using (false) with check (false);
create policy "Authenticated reads" on pricing_cache
  for select using (auth.role() = 'authenticated');
```

---

**4. Upsert errors silently swallowed in `usePreferences`**
`src/hooks/usePreferences.ts:38–47`

Repeated from Bugs §3. Supabase's client-side library does not throw on error; the `mutationFn` never checks `error`, so failed saves look identical to successful ones in the UI.

---

**5. Wine-Searcher API key logged in server access logs**
`supabase/functions/wine-searcher-proxy/index.ts:48`

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&...`;
```

The API key is embedded in the query string. Web server access logs, reverse proxies, and network monitoring tools routinely log the full URL. If Wine-Searcher supports an `Authorization` header, use that instead.

---

## UX and Performance Issues

**1. History cards are not tappable — dead interaction**
`app/(tabs)/history.tsx:64`

```tsx
<TouchableOpacity style={styles.card}>
```

The `TouchableOpacity` has no `onPress`. Tapping any scan history item does nothing, with no visual affordance to indicate it is non-interactive. Users expect to see the full recommendation when they tap a past scan.

Fix: either add an `onPress` that navigates to a detail view and restores the recommendation, or replace `TouchableOpacity` with `View` to avoid setting a false expectation.

---

**2. `WineRecommendationCard` component is dead code**
`src/components/results/WineRecommendationCard.tsx`

This component exists and is fully implemented, but is never rendered. The results screen (`app/scan/results.tsx`) uses an entirely separate inline accordion UI. No other screen imports `WineRecommendationCard` for rendering. This creates maintenance confusion — bugs fixed in one card UI won't be reflected in the other.

---

**3. Scan tab shows default values before saved preferences load**
`app/(tabs)/scan.tsx:24–66`

`wineTypes`, `styleProfiles`, and `budget` are initialised from `savedPreferences` in `useState` calls (lines 24–31), but `savedPreferences` is `undefined` on first render (React Query hasn't resolved). The `useEffect` (line 59–66) then overwrites state once preferences load. This creates two problems:

- A flash of empty/default controls on every app open for signed-in users.
- If the user changes a preference before the effect fires, their change is silently overwritten when `savedPreferences` loads.

Fix: render preference controls only after `savedPreferences` has resolved, or initialise from the Zustand store which is seeded from preferences earlier in the flow.

---

**4. Duplicate body text on the extracting screen**
`app/scan/extracting.tsx:144–152`

When `stage === 'recommending'`, two `<Text>` nodes with overlapping content are both visible:
- "Scoring by critic rating, vintage quality and value"
- "This may take a minute or two"

The second message is redundant given the first already conveys what is happening. The layout also shows three stacked body-text lines (title + two body lines + stay note), which is cluttered.

---

**5. No error state in history query**
`app/(tabs)/history.tsx:12–25`

`useQuery` is called but only `data` and `isLoading` are destructured; `error` is ignored. If the Supabase query fails (network error, RLS block), `isLoading` becomes false and `sessions` is `undefined`, causing the component to render the "No scans yet" empty state with no indication that a fetch error occurred.

Fix: destructure `error` and show a user-facing error message when it is set.

---

**6. Email change input has no format validation**
`app/(tabs)/profile.tsx:110–128`

`handleEmailChange` submits any non-empty string to Supabase without validating that it is a valid email address. Supabase will reject it with an error, but the user sees a generic alert rather than inline validation feedback.

---

**7. Onboarding gives no error feedback on save failure**
`app/onboarding.tsx:37–50`

Due to the upsert error issue (Bugs §3) and the immediate navigation (Bugs §1), if the save fails the user arrives at the scan tab with no preferences stored and no error message. The `isSaving` spinner correctly disables the button during the in-flight mutation, but there is no `onError` callback that surfaces a recoverable error to the user.

---

## Navigation Issues

**1. New authenticated users skip onboarding — race condition**
`app/index.tsx:19–21`

Described in Bugs §2. The `preferences === null` check evaluates before the React Query fetch resolves. During the resolution window, `preferences` is `undefined`, and the condition is false, sending the user to `/(tabs)/scan` without onboarding. This affects every new sign-up.

---

**2. `/scan/url` route is a stub redirect with no UI**
`app/scan/url.tsx:1–5`

```ts
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The route exists in the file system (making it a valid expo-router path) but immediately bounces the user back. Any navigation to `/scan/url` — including deep links — produces a silent redirect with no explanation. Either implement the URL input feature or delete the file.

---

**3. `/scan/preferences` is an orphaned, unreachable route**
`app/scan/preferences.tsx`

No file in the codebase navigates to `/scan/preferences`. The scan flow goes `camera → preview → extracting → results` (and `screenshot → preview/extracting → results`). This screen is dead code and also contains a TypeScript error (see Bugs §6). It should be removed or integrated into the flow.

---

**4. Android back button from results re-triggers full OCR pipeline**
`app/scan/results.tsx`

Results are pushed onto the stack via `router.replace('/scan/results')` in `extracting.tsx:117`, so the extracting screen is replaced, not the full stack. The stack at that point is still `[scan → camera|preview → extracting → results]`. On Android, the hardware back button pops the stack to wherever `results` was replaced from. If that is `extracting`, the effect in `extracting.tsx` will re-run, making another pair of Claude API calls. 

Fix: use `router.replace` from the scan tab to results, clearing the scan sub-stack, and add a back button on the results screen that calls `reset()` and navigates to the scan tab.

---

**5. Sign-out navigates directly to sign-in, bypassing root router**
`app/(tabs)/profile.tsx:130–133`

```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

The root index (`app/index.tsx`) is the canonical routing entry point based on auth state. Navigating directly to `/(auth)/sign-in` after sign-out bypasses that logic. If the auth state listener in `useAuth` fires after the navigation, a second redirect may occur. The `hasLaunched` flag also won't be evaluated, meaning a user who signs out would be sent to sign-in rather than the welcome screen on their next session.

Fix: navigate to `/` after sign-out and let the root index route based on the new auth state.
