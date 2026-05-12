# Code Review — 2026-05-05

Reviewed by: automated code review agent  
Scope: full codebase — Expo SDK 54, expo-router, Supabase, Claude API

---

## Bugs and Crashes

### HIGH

**1. `app/scan/results.tsx:23` — `router.replace` called during render, not inside `useEffect`**

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Navigation is triggered as a side effect inside the render function body. React 19's concurrent renderer can invoke render multiple times before committing; firing a navigation call here violates the rules of render and causes "Cannot update a component while rendering a different component" warnings. In StrictMode it can trigger the navigation twice. Fix: wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])` and return `null` unconditionally until the effect fires.

---

**2. `app/(tabs)/history.tsx` — `scan_sessions` table is never written to; history is permanently empty for all users**

The `scan_sessions` table is defined in `supabase/migrations/001_initial_schema.sql` and queried in `app/(tabs)/history.tsx:16–25`, but no code anywhere in the application inserts rows into it. The entire scan flow (`extracting.tsx` → `results.tsx`) calls `setRecommendation()` and navigates, but never calls `supabase.from('scan_sessions').insert(...)`. Every user's history tab will always show "No scans yet". The `ScanSession` type in `src/types/scan.ts` and the table schema are both wasted.

---

**3. `app/(tabs)/history.tsx:64` — History cards have no `onPress`; tapping a past scan does nothing**

```tsx
<TouchableOpacity style={styles.card}>
```

The `TouchableOpacity` wrapping each history card has no `onPress` prop. Users receive haptic-style press feedback but no navigation occurs. There is no detail screen to navigate to, making this a navigation dead-end as well as a crash-free but broken feature.

---

**4. `app/scan/url.tsx:1–5` — URL scan route is a dead redirect; OCR edge function URL path is dead code**

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The OCR edge function (`supabase/functions/ocr/index.ts:49–63`) has a complete implementation for fetching and parsing a URL-based wine list. The client-side screen that was supposed to expose this was replaced with a redirect to the scan tab. The URL feature is entirely unreachable from the UI and the edge function code handling it is dead.

---

### MEDIUM

**5. `app/scan/camera.tsx:32–34` — `takePictureAsync` and `ImageManipulator.manipulateAsync` unhandled exceptions**

```tsx
const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 1 });
```

Neither `takePictureAsync` (line 32) nor the two `ImageManipulator.manipulateAsync` calls (lines 44, 88) are inside a try/catch. Camera capture failures — hardware error, permissions revoked mid-session, low storage — will throw unhandled promise rejections. The `useEffect` in `extracting.tsx` has a catch block, but `camera.tsx` uses `handleCapture` as an event handler with no enclosing error boundary. A crash here leaves the user on a broken camera screen with no way to recover.

---

**6. `app/(tabs)/scan.tsx:86–101` — `handleScreenshot` has no error handling and no loading state**

```tsx
async function handleScreenshot() {
  const result = await ImagePicker.launchImageLibraryAsync({ ... });
  ...
}
```

No try/catch around the async function. On Android, if the system photo picker throws (e.g., permission revoked at OS level after the app checks), the rejection is unhandled. Additionally, the upload button (line 159) has no disabled state during the async operation, so users can tap it multiple times and open duplicate image library pickers.

---

**7. `src/hooks/usePreferences.ts:38` — Supabase `upsert` error is silently swallowed**

```tsx
await supabase.from('profiles').upsert({ ... });
```

The return value of `upsert` is not destructured to check `{ error }`. If the operation fails due to an RLS policy violation, network failure, or schema mismatch, the error is lost. The `onError` callback on the mutation (line 51) only fires when an exception is thrown, not when Supabase returns an error object. Preference saves fail silently with no user feedback.

Fix:
```tsx
const { error } = await supabase.from('profiles').upsert({ ... });
if (error) throw new Error(error.message);
```

---

**8. `app/index.tsx:20` — Supabase preferences query error sends authenticated users to onboarding**

```tsx
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```

`usePreferences` returns `null` (via `console.warn` + `return null`) when the Supabase query errors (`src/hooks/usePreferences.ts:19–21`). A transient Supabase failure on startup will redirect a fully-onboarded authenticated user to the onboarding flow, where they can overwrite their saved preferences. The correct guard should also check whether the preferences query has settled (React Query's `isError` / `status` field).

---

**9. `supabase/functions/ocr/index.ts:84` and `supabase/functions/recommend/index.ts:181` — `response.content[0]` accessed without bounds check**

```ts
const text = response.content[0].type === 'text' ? response.content[0].text : '';
```

Both edge functions access `response.content[0]` without checking whether the array is non-empty. The Claude API can return an empty `content` array when `stop_reason` is `max_tokens` and no text was generated before the limit, or in edge cases with tool use. This throws `TypeError: Cannot read properties of undefined (reading 'type')`, which the outer try/catch surfaces as a 500 error, but the root cause is obscured.

Fix: `const text = response.content[0]?.type === 'text' ? response.content[0].text : '';`

---

**10. `app/(tabs)/history.tsx:13–25` — Query error state not handled; shows "No scans yet" on Supabase failure**

```tsx
const { data: sessions, isLoading } = useQuery({ ... });
```

`isError` is not destructured. When the Supabase query fails (network error, RLS block, expired JWT), `sessions` is `undefined`, `isLoading` is `false`, and `!sessions?.length` is `true`. The component renders "No scans yet" — an accurate-looking but misleading empty state. Users have no way to know a fetch error occurred or to retry.

---

**11. `app/scan/preferences.tsx:28–33` — `recommendWines` called with incomplete `RecommendInput`**

```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // Missing: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```

`RecommendInput` in `src/services/recommender.ts:5–15` declares `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` as required non-optional fields. This call omits all five. TypeScript will flag this as a type error. The `preferences.tsx` screen appears to be a legacy entry point that was not updated when those fields were added and is now incompatible with the current interface.

---

**12. `src/api/claude.ts:17` — `JSON.parse` throws on malformed edge function response with no useful context**

```tsx
return JSON.parse(text);
```

If the Supabase edge runtime returns an HTML error page (e.g., during a cold-start timeout or deployment error), `JSON.parse` throws `SyntaxError: Unexpected token '<'`. The error propagates to the caller without indicating what the raw response contained. The calling code in `extracting.tsx` catches it and shows `err.message`, which will be the raw parse error rather than anything actionable. Should log `text` and rethrow with a clearer message.

---

### LOW

**13. `app/_layout.tsx:28` — App renders `null` indefinitely if fonts fail to load**

```tsx
if (!fontsLoaded) return null;
```

`Font.useFonts` can fail (network unavailable, corrupted bundle). There is no timeout, no error state, and no fallback UI. If font loading stalls, the user sees a blank screen with no indication of what is wrong and no way to proceed.

---

**14. `app/(auth)/sign-in.tsx:12` — No client-side validation before auth API call**

`handleSignIn` submits to Supabase even when `email` or `password` are empty strings. The API will reject the request, but the round-trip adds unnecessary latency and produces a server-side error message instead of an immediate local one.

---

**15. `app/(auth)/sign-up.tsx:12` — No client-side password length validation**

Supabase enforces a minimum password length (default: 8 characters), but the sign-up form doesn't validate this locally. Users receive a confusing server error ("Password should be at least 8 characters") after a round-trip rather than immediate inline feedback.

---

## Supabase and Edge Function Issues

**1. `supabase/migrations/001_initial_schema.sql:36–44` — `pricing_cache` table has no RLS**

`profiles` and `scan_sessions` both have RLS enabled (lines 11, 28). `pricing_cache` does not. The table is currently only written to by the `wine-searcher-proxy` edge function using the service role key, but the anon key can read from it directly without restriction. All cached wine pricing data (market prices, critic scores) is publicly readable. Either enable RLS with a restrictive policy, or add an explicit comment that this is intentionally public.

---

**2. `supabase/functions/ocr/index.ts:50–53` — SSRF: edge function fetches arbitrary client-supplied URLs**

```ts
const { imageBase64, url } = body;
...
if (url) {
  const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

The `url` parameter is taken directly from the client request body and fetched server-side without any validation, allowlist, or scheme check. An attacker with the anon key can use this to make the edge function fetch internal Supabase infrastructure URLs (`http://localhost:*`, `http://meta.internal/...`), perform port scanning, or access cloud metadata endpoints (e.g., `http://169.254.169.254/` on AWS). Since the URL scan UI is currently broken (`app/scan/url.tsx` redirects away), this vector is only exploitable by direct API calls, but the anon key is public.

Fix: validate that `url` starts with `https://` and optionally allowlist known wine list domains.

---

**3. `supabase/functions/wine-searcher-proxy/index.ts:48` — API key exposed in URL query string**

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&...`;
```

Placing the API key in the URL query string causes it to appear in Supabase edge function logs, Wine-Searcher server access logs, and potentially in CDN/proxy access logs. If Wine-Searcher supports an `Authorization` header or `X-API-Key` header, use that instead.

---

**4. `supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` — No authentication check; functions callable by anyone with the anon key**

Both functions call Claude's API (at `claude-opus-4-6` pricing) without verifying that the caller is an authenticated user. The anon key is embedded in the mobile bundle via `EXPO_PUBLIC_*` and is effectively public. Any actor who extracts the anon key and the Supabase URL can call these functions at will, generating unbounded Claude API costs. Add a JWT check at the top of each function:

```ts
const authHeader = req.headers.get('Authorization');
if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
```

---

**5. `src/hooks/usePreferences.ts:38` — Upsert error not surfaced (covered in Bugs section #7, repeated here for completeness)**

---

## UX and Performance Issues

**1. `app/scan/extracting.tsx:145–156` — Duplicate "may take a minute or two" copy during recommending stage**

When `stage === 'recommending'`, three separate text elements render: "Finding your best match…" (title), "Scoring by critic rating, vintage quality and value" (body), and a second "This may take a minute or two" (line 151). The third line is only conditionally rendered for `recommending` but is identical in meaning to copy already visible. This makes the loading screen feel cluttered and repetitive.

---

**2. `src/components/preferences/ChipPicker.tsx:18–21` — `?? []` default causes `selected` prop to be a new array reference on every render, triggering spurious `useEffect`**

```tsx
useEffect(() => {
  setLocal(selected);
}, [selected]);
```

Call sites pass `preferences?.favouriteRegions ?? []`. The `?? []` expression creates a new array object on every render of the parent (since `preferences` is `undefined` during loading). React compares the `selected` dependency by reference, so the effect fires on every parent re-render, resetting `local` state even when the underlying data hasn't changed. Visible symptom: chip selections can flicker or reset while the parent re-renders (e.g., during a preference save). Fix: memoize the prop at the call site, or replace the `useEffect` sync with a derived value pattern.

---

**3. `app/(tabs)/scan.tsx:159` — Upload button has no loading/disabled state**

```tsx
<TouchableOpacity style={styles.uploadButton} onPress={handleScreenshot}>
```

The `handleScreenshot` function is async. During execution — while the image library picker is open — the button remains fully interactive. On Android, tapping it again while the picker is visible opens a second picker instance. Add a `loading` state that disables the button until the async operation completes.

---

**4. `app/(tabs)/profile.tsx` — Preference form renders with default/empty values while Supabase fetch is in-flight**

`usePreferences` returns `preferences = undefined` while the React Query fetch is pending (the query is enabled only when `session` exists). The profile form renders immediately with `preferences?.wineTypes ?? []`, showing empty selections until data arrives. There is no loading indicator, skeleton, or disabled state on the form during this window. Users who tap quickly may see their saved preferences appear to vanish and reappear.

---

**5. `app/scan/results.tsx` — No back navigation; "Start Another Search" destroys store state**

The results screen has no back button. The only exit is "Start Another Search" (line 122–127), which calls `reset()` on the scan store before navigating. If a user accidentally taps this, or navigates away and returns, all recommendation data is destroyed. A back-to-scan button that does not reset would be safer, with an explicit "New Scan" action that clears state.

---

**6. `app/(tabs)/scan.tsx:58–66` — Double-initialization of preference state causes extra re-render**

```tsx
const [wineTypes, setWineTypes] = useState<WineType[]>(savedPreferences?.wineTypes ?? []);
...
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    setWineTypes(savedPreferences.wineTypes ?? []);
    ...
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```

State is initialized from `savedPreferences` in `useState` and then set again in `useEffect` when preferences load. If preferences are already in the React Query cache on mount, the initial state is correct but the effect still triggers a second state update (and a re-render) with the same values. The `prefsLoaded` guard prevents infinite updates but not the initial double-set. This is low-impact but adds an unnecessary render cycle on every mount when the cache is warm.

---

## Navigation Issues

**1. `app/scan/url.tsx:1–5` — URL scan route immediately redirects; feature is unreachable**

The route `/scan/url` exists in the router but renders a `<Redirect href="/(tabs)/scan" />`. Any link or code path that navigates to `/scan/url` silently drops the user on the scan tab with no feedback. The OCR edge function's URL input handling is dead code as a result. Either restore the URL input UI or remove the route and strip the URL handling from the edge function.

---

**2. `app/scan/preferences.tsx` — Screen is orphaned; never navigated to in the current scan flow**

The file `app/scan/preferences.tsx` exists and registers as a route at `/scan/preferences`, but no file in the codebase calls `router.push('/scan/preferences')`. The scan flow goes directly from `preview.tsx` to `extracting.tsx`. This screen appears to be a legacy intermediate step that was bypassed when the scan flow was redesigned. It also has the `RecommendInput` type mismatch noted in Bugs #11. The screen should either be wired back in or deleted.

---

**3. `app/(tabs)/history.tsx:64` — History items are tappable but navigate nowhere (duplicate of Bugs #3)**

There is no route for viewing the detail of a past scan session, and the `TouchableOpacity` on each card has no `onPress`. The visual affordance (card with a pressed state) implies tappability, creating user confusion.

---

**4. `app/index.tsx:20` — Supabase error on startup redirects authenticated users to onboarding (duplicate of Bugs #8)**

`preferences === null` is the error state from `usePreferences`. A Supabase connectivity failure on app launch sends an authenticated user who has already completed onboarding back through the six-step onboarding flow, where they may unknowingly overwrite their saved preferences with empty defaults.
