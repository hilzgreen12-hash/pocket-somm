# Automated Code Review — 2026-05-07

## Bugs and Crashes

### HIGH — `app/scan/results.tsx:22–24` — `router.replace` called during render
`router.replace('/(tabs)/scan')` is called synchronously inside the component body when `recommendation` is null, not inside a `useEffect`. Calling navigation APIs during the React render phase is illegal in React and in expo-router; it causes "cannot update a component from inside the function body of a different component" warnings and can produce a crash loop if the store has been partially reset. Fix: wrap the redirect in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

**Severity: High**

---

### HIGH — `app/_layout.tsx:14–39` — No error boundary wrapping the app
The root layout renders `<AuthProvider>`, `<QueryClientProvider>`, and the `<Stack>` with no React error boundary. Any unhandled exception thrown during rendering (e.g., a missing font, a null-dereference in a component, a malformed Claude response that slips through Zod validation) will crash the entire app to a white screen with no user-facing message. At minimum, a top-level error boundary should catch render errors and show a "Something went wrong — restart the app" screen.

**Severity: High**

---

### HIGH — `src/api/claude.ts:7–18` — Edge functions called without the user's JWT
`invokeFunction` sends only `'apikey': ANON_KEY` in the headers. The authenticated user's session token is never attached. As a result, the edge functions cannot identify the calling user, cannot perform per-user rate limiting, and cannot enforce any user-level access control. Anyone who extracts the anon key from the app bundle (it is public by design via `EXPO_PUBLIC_`) can call the `ocr` and `recommend` functions as many times as they like, incurring unbounded Anthropic API costs. Fix: obtain the session from Supabase auth and add `'Authorization': `Bearer ${session?.access_token}`` to the headers in `invokeFunction`. The edge functions should then verify the JWT using `supabase.auth.getUser(jwt)` and reject unauthenticated calls with 401.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:49–54` — Server-Side Request Forgery (SSRF) via `url` parameter
When a `url` is supplied in the request body, the OCR edge function fetches it server-side without any allow-list or domain validation:
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
An attacker can supply URLs such as `http://169.254.169.254/latest/meta-data/` (AWS instance metadata), Supabase internal service URLs, or any intranet address reachable from the Deno Deploy runtime. Since the function is callable with just the anon key (see the finding above), this is exploitable by any user. Fix: validate that `url` matches an explicit allow-list of domains, or reject non-HTTPS URLs and any RFC-1918 / link-local addresses.

**Severity: High**

---

### MEDIUM — `app/index.tsx:9,19–20` — New signed-in users bypass onboarding when preferences query is still loading
`usePreferences` does not expose an `isLoading` flag. In `app/index.tsx` the only loading gate is `useAuth`'s `loading` state (line 16). Once `loading` is false and a session exists, the code checks `if (preferences === null)` on line 20. However, until the React Query fetch for preferences resolves, `preferences` is `undefined` (not `null`). `undefined === null` is false, so the onboarding redirect is skipped and the user is sent straight to `/(tabs)/scan`. A new user who has just signed up (no profile row in Supabase) will see the scan screen instead of onboarding on their first session unless they are on a slow-enough connection that the query resolves before the auth state.

**Severity: Medium**

---

### MEDIUM — `app/index.tsx:12–13` — `AsyncStorage.getItem` has no error handler; hangs on failure
```ts
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```
There is no `.catch()`. If `AsyncStorage` throws (corrupted storage, device encryption error), the Promise rejects silently. `hasLaunched` remains `null` forever, and line 16 returns `null` indefinitely — the app is stuck on a blank screen. Fix: add `.catch(() => setHasLaunched(false))`.

**Severity: Medium**

---

### MEDIUM — `app/scan/camera.tsx:29–98` — `handleCapture` has no try/catch
`handleCapture` is an async function that calls `cameraRef.current.takePictureAsync`, two `ImageManipulator.manipulateAsync` calls, and then `router.push`. None of these are wrapped in a try/catch. Hardware errors (storage full, camera hardware failure), EXIF processing errors, or crop arithmetic that produces NaN dimensions will all produce unhandled promise rejections. On newer React Native versions this terminates the JS thread. Fix: wrap the body of `handleCapture` in try/catch and show an `Alert` on failure.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/scan.tsx:86–102` — `handleScreenshot` has no try/catch
`ImagePicker.launchImageLibraryAsync` can throw on certain Android versions and configurations. The unhandled rejection silently kills the action with no user feedback. Fix: wrap in try/catch and show an `Alert`.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/history.tsx:12–25` — Query error state is silently discarded
The `useQuery` destructuring only pulls out `{ data: sessions, isLoading }`. The `error` field is not used. When the Supabase query fails (RLS error, network timeout, etc.), `isLoading` becomes false and `sessions` is `undefined`, causing the "No scans yet" empty state to render. Users with real scan history who hit a transient network error will see an empty list with no indication that something went wrong.

**Severity: Medium**

---

### MEDIUM — `src/hooks/usePreferences.ts:38` — Supabase upsert error is silently discarded; `onError` never fires
```ts
await supabase.from('profiles').upsert({...});
```
`supabase-js` does not throw on error — it returns `{ data, error }`. The error is never checked. If the upsert fails (RLS violation, schema mismatch, network error), the `mutationFn` returns `undefined` successfully, `onSuccess` fires, and `queryClient.invalidateQueries` runs. The `onError` handler on line 50 never receives the failure. The user's preference change is silently lost. Fix: destructure the error and `throw` it so `onError` can show a user-visible alert.

**Severity: Medium**

---

### LOW — `app/onboarding.tsx:36–41` — Navigate away fires before preferences save completes
```ts
updatePreferences({...});
router.replace('/(tabs)/scan');
```
`mutation.mutate` is fire-and-forget. `router.replace` fires on the next line without waiting for the save to complete or succeed. If the save fails (the `onError` handler only console-logs), the user is already on the scan screen and has no way to know their onboarding choices were not persisted. Fix: use `mutation.mutateAsync` inside an async handler so you can `await` the save, handle errors, and then navigate.

**Severity: Low**

---

### LOW — `app/(tabs)/profile.tsx:130–133` — Sign-out error is not handled; navigation proceeds unconditionally
```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```
If `signOut` returns an error (e.g., network failure), the app navigates to the sign-in screen while the Supabase session is still active. The user believes they are signed out but their session persists. Fix: check the returned error and show an `Alert` before navigating.

**Severity: Low**

---

## Supabase and Edge Function Issues

### HIGH — `supabase/functions/ocr/index.ts` and `recommend/index.ts` — No authentication or rate-limiting on edge functions
Neither function checks the `Authorization` header or verifies that the caller has a valid Supabase session. The only credential required is the anon key, which is publicly visible in the app bundle under `EXPO_PUBLIC_SUPABASE_ANON_KEY`. This means any external party can send unlimited OCR and recommendation requests, generating uncapped Anthropic API bills. There is no per-user quota, IP-based throttle, or abuse detection. Fix: verify the Bearer JWT via `supabase.auth.getUser(jwt)` at the top of each function and return 401 for unauthenticated requests. Add a lightweight rate-limit check against a counter in Supabase (e.g., per user, per hour).

**Severity: High**

---

### MEDIUM — `supabase/migrations/001_initial_schema.sql:31–44` — `pricing_cache` table has no RLS
The `profiles` and `scan_sessions` tables have RLS enabled, but `pricing_cache` does not. There is no `alter table pricing_cache enable row level security;` statement. If any future Supabase migration or developer mistake grants SELECT to the `anon` or `authenticated` role, the full pricing cache (wine names, market prices, critic scores) becomes world-readable. The table should have RLS enabled and be restricted to the service role only (i.e., no SELECT/INSERT/UPDATE/DELETE policies, so only service-role bypasses RLS).

**Severity: Medium**

---

### MEDIUM — `supabase/functions/recommend/index.ts:169` — `max_tokens: 4096` may truncate responses for large wine lists
The OCR function uses `max_tokens: 8096`, but the recommend function uses only `4096`. With 25 wines in the input and a detailed JSON response structure (three wines, each with `vintageAssessment`, `drinkingWindow`, `rarityAssessment`, `rationale`, etc.), output can approach 3,000–4,000 tokens. On large, verbose wine lists the response can be truncated mid-JSON. The `JSON.parse` on line 186 then throws, returning a 500 error to the client. Fix: increase to `max_tokens: 8096`. Add a check after parsing to validate that exactly the expected schema was returned.

**Severity: Medium**

---

### MEDIUM — `src/hooks/usePreferences.ts:38` — Supabase upsert error discarded; mutation always succeeds
Detailed above in Bugs section. The `mutationFn` does not check the `{ error }` returned by `supabase.from('profiles').upsert()`. The mutation's `onError` callback is dead code for all Supabase-level failures.

**Severity: Medium**

---

### MEDIUM — Scan results are never written to `scan_sessions`; History tab is permanently empty
The `scan_sessions` table is read in `app/(tabs)/history.tsx` and the schema is defined, but no code in the application ever performs an INSERT into `scan_sessions`. After `recommendWines` resolves in `app/scan/extracting.tsx` (line 116), `setRecommendation` is called and the user is navigated to results, but no Supabase write occurs. The History tab will show "No scans yet" for every user regardless of how many scans they have done.

**Severity: Medium**

---

### LOW — `supabase/functions/wine-searcher-proxy/index.ts:48` — API key appended to URL query string
```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&...`;
```
Appending the API key as a URL query parameter causes it to appear in HTTP server access logs on the Wine-Searcher side, and in any proxy or CDN logs between the Deno Deploy runtime and the API. If the Wine-Searcher API supports an `Authorization` header or a POST body for the key, use that instead to keep the key out of logs.

**Severity: Low**

---

## UX and Performance Issues

### MEDIUM — `app/(tabs)/history.tsx:64` — History cards wrapped in `TouchableOpacity` with no `onPress`
Every scan history card is a `TouchableOpacity` that visually responds to taps (opacity change, haptic on some devices) but has no `onPress` handler. Tapping does nothing. Users reasonably expect to tap a history item to revisit its recommendation. This is either a missing feature or a misleading component choice (should be `View` if non-interactive).

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:182–184` — Back arrow on Profile tab navigates to scan rather than going back
```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```
Profile is a tab screen, not a stack screen. It does not have a navigation history to "go back" to. Using a back arrow icon that navigates to a sibling tab is semantically misleading: it implies stack navigation, adds a spurious entry to the stack history, and will confuse users who expect the back arrow to undo navigation they performed to arrive at Profile. Remove the back arrow entirely; tab bars provide the expected navigation paradigm.

**Severity: Medium**

---

### LOW — `app/scan/extracting.tsx:153` — "Please don't leave this page" is alarming and unexplained
The copy `"Please don't leave this page while we're searching"` does not tell the user what will happen if they do leave (the scan will be cancelled). It is also displayed during the OCR stage (`stage === 'reading'`) when the note immediately below it explicitly says the text applies to OCR results. The message is redundant with the description already on screen and creates unnecessary anxiety. Replace with a calm in-context note: "Navigating away will cancel this scan."

**Severity: Low**

---

### LOW — `app/scan/preferences.tsx` — Screen is unreachable; dead code
`app/scan/preferences.tsx` defines a full preferences + recommendation flow, but no screen in the current navigation graph links to `/scan/preferences`. The active flow goes: scan tab → camera → preview → extracting → results. The preferences screen has its own call to `recommendWines` and represents an earlier architectural approach. It is dead code that calls `recommendWines` with an incomplete `RecommendInput` (missing `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, `dislikedGrapes` — lines 28–33), which would cause a TypeScript error if strict checks are enabled. Delete the file or make it explicit in the router as an intentionally disabled route.

**Severity: Low**

---

### LOW — `app/scan/url.tsx` — Dead route silently redirects; should be deleted
```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```
This file exists, occupies a route slot, and silently redirects any visitor to scan. If URL-based wine list scanning was deliberately removed, the file should be deleted. A dead silent redirect is worse than a 404 because it gives the caller no indication that the feature is unavailable.

**Severity: Low**

---

## Navigation Issues

### HIGH — `app/index.tsx:19–20` — Onboarding check fires before preferences query resolves; new users skip onboarding
Described fully in Bugs section. `preferences` is `undefined` (not `null`) while `usePreferences` is fetching. The guard `if (preferences === null)` never fires, so new signed-in users with no profile row are redirected to `/(tabs)/scan` instead of `/onboarding`. Fix: expose `isLoading` from `usePreferences` and add it to the loading gate on line 16: `if (loading || hasLaunched === null || prefsLoading) return null;`.

**Severity: High**

---

### HIGH — `app/scan/results.tsx:22–24` — `router.replace` called synchronously during render
Duplicated from Bugs section. Navigation APIs must not be called during the render phase. Use `useEffect`.

**Severity: High**

---

### MEDIUM — `app/(tabs)/profile.tsx:113` — Email-change redirect URL points to a non-existent route
```ts
const redirectTo = Linking.createURL('auth/callback');
```
After the user confirms their email change, Supabase redirects them to `auth/callback`. There is no `app/auth/callback.tsx` route in the project. The deep link will either open the app to a 404 screen or fail to launch the app at all, leaving the email change incomplete. Create `app/auth/callback.tsx` with logic to exchange the auth code for a session and navigate the user home, or use a Supabase-hosted redirect page.

**Severity: Medium**

---

### MEDIUM — `app/(auth)/_layout.tsx` — No route back to the welcome screen from auth screens
From the sign-in or sign-up screen, there is no back button and no link to return to `/welcome`. Users who tap "Sign In" or "Create Account" from the welcome screen are stranded in the auth stack if they change their mind and want to continue as a guest. The auth layout has `headerShown: false`, which hides the default stack back button. Fix: add a "Continue without account" link or re-enable the header back button on auth screens.

**Severity: Medium**

---

### LOW — `app/scan/url.tsx` — Dead route should be deleted, not silently redirected
Duplicated from UX section. Leaving a route file that immediately redirects pollutes the router's route map and is indistinguishable from an active feature to future developers.

**Severity: Low**
