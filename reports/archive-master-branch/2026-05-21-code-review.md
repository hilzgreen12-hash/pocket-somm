# Code Review — 2026-05-21

Reviewed by: automated review agent  
Scope: full codebase — bugs/crashes, Supabase/Edge Functions, UX, navigation

---

## Bugs and Crashes

### High

**1. `app/onboarding.tsx:37–47` — Silent data loss: preferences not saved before navigation**

`updatePreferences` is `mutation.mutate` (fire-and-forget), not `mutateAsync`. On line 47, `router.replace('/(tabs)/scan')` fires immediately after calling mutate, regardless of whether the save succeeded or failed. If the Supabase upsert fails (network error, RLS error, etc.), the user is navigated away from onboarding with no feedback and their preferences are silently discarded. The `onError` handler in `usePreferences` only logs to the console.

Fix: switch `mutation.mutate` → `mutation.mutateAsync` and await it, or use `mutation.onSuccess` callback to trigger navigation.

---

**2. `app/_layout.tsx` — No error boundary; unhandled render errors crash the entire app**

There is no `ErrorBoundary` component anywhere in the layout tree. Any uncaught render error in any screen (including `null` dereferences in result rendering) will crash the app and show a red screen with a raw stack trace. Expo Router supports `ErrorBoundary` exports on layout files.

Fix: export an `ErrorBoundary` from `app/_layout.tsx` (or individual route groups) to catch and display a recovery screen.

---

**3. `app/scan/preferences.tsx:28–33` — `recommendWines` called with missing required fields**

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // MISSING: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```

`RecommendInput` requires `wineTypes: string[]`, `favouriteRegions: string[]`, `favouriteGrapes: string[]`, `dislikedRegions: string[]`, and `dislikedGrapes: string[]`. These are not passed. TypeScript should flag this as a compile error (the call would produce `undefined` for those fields at runtime), and the Edge Function would receive `undefined` for all preference arrays, silently ignoring them. This screen appears to be an orphaned older flow — see Navigation Issues §4.

---

### Medium

**4. `app/index.tsx:9,20` — New signed-in users bypass onboarding when preferences query hasn't resolved**

```ts
const { preferences } = usePreferences();
...
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```

`usePreferences` uses React Query with `enabled: !!session`. When the app starts with an existing session, auth resolves first (setting `loading = false`), but the preferences query may not have resolved yet. Until the query completes, `preferences` is `undefined`, not `null`. The check `preferences === null` is false for `undefined`, so the component redirects to `/(tabs)/scan` immediately, before the onboarding check can fire. New users who just signed up and confirmed their email will skip onboarding entirely.

Fix: also gate on `preferences !== undefined`, or add a `preferencesLoading` check from the query's `isLoading` state.

---

**5. `app/scan/results.tsx:23–25` — `router.replace` called synchronously during render**

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace` in the function body of a component (not inside a `useEffect`) is a React anti-pattern. It mutates navigation state during the render phase and can trigger "Cannot update a component from inside the function body of a different component" warnings or navigation loop bugs in Expo Router.

Fix: wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

---

**6. `app/(tabs)/history.tsx:71` — Accesses `recommendation.topPick` which does not exist**

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (defined in `src/types/wine.ts`) has a `wines: WineRecommendation[]` array, not a `topPick` property. This expression is always falsy; the wine name is never displayed on history cards. This is a stale reference from an older API shape.

Fix: replace with `item.recommendation?.wines?.[0]?.name`.

---

**7. `app/(tabs)/scan.tsx:59–66` — Preference sync `useEffect` can overwrite in-progress user selections**

```ts
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    setWineTypes(savedPreferences.wineTypes ?? []);
    setStyleProfiles(savedPreferences.styleProfiles ?? []);
    setBudget(savedPreferences.defaultBudget ?? null);
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```

`prefsLoaded` starts as `false`. If the user interacts with any picker before `savedPreferences` loads from React Query (a typical async delay), the `useEffect` fires on the next render and silently overwrites whatever the user has selected with the saved defaults.

Fix: initialise state directly from `savedPreferences` using `useQuery`'s `initialData` or `placeholderData`, or only sync the fields the user has not yet touched.

---

**8. `app/scan/camera.tsx:29–98` — `handleCapture` is async with no try/catch; unhandled rejections**

`handleCapture` is declared `async` but contains no `try/catch`. If `cameraRef.current.takePictureAsync()` or any of the `ImageManipulator.manipulateAsync()` calls throw (hardware error, permission revoked mid-session, low storage), the error becomes an unhandled promise rejection and the UI freezes on the camera screen with no feedback.

Fix: wrap the body of `handleCapture` in `try/catch` and navigate back to scan tab or show a toast on failure.

---

### Low

**9. `src/services/recommender.ts:75–82` — Duplicate-grape retry silently falls back to bad result**

If the diversity retry also fails Zod validation, the function falls back to `return parsed.data` — the original response that contained duplicate grape varieties — without any logging or indication that the retry failed. The user receives a subtly wrong result.

---

**10. `supabase/functions/wine-searcher-proxy/index.ts:1` — Missing env var produces silent failure**

```ts
const WINE_SEARCHER_API_KEY = Deno.env.get('WINE_SEARCHER_API_KEY')!;
```

The `!` assertion does not validate at runtime. If the secret is missing (e.g. in a new deployment), `WINE_SEARCHER_API_KEY` is `undefined`, the request to Wine-Searcher returns a 401, and the catch block returns an HTTP 200 with all-null pricing fields. The caller has no way to distinguish "API key missing" from "wine not found."

Fix: add an explicit guard at startup and return a 500 with a descriptive error if the key is absent.

---

## Supabase and Edge Function Issues

### Medium

**1. `src/api/claude.ts:7–14` — Edge Function calls do not send an Authorization header**

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
}
```

The `invokeFunction` helper sends only the anon key, not the user's JWT (`Authorization: Bearer <session.access_token>`). The OCR and recommend Edge Functions have no way to identify the calling user. This means there is no per-user rate limiting, no audit trail, and any entity with the anon key (which is public) can call Claude-powered functions without any session at all. Cost and abuse exposure scales with anon key distribution.

Fix: import the `supabase` client and use `supabase.functions.invoke()` instead of raw `fetch`; it automatically attaches the current session's bearer token. (The `wine-searcher-proxy` correctly uses `supabase.functions.invoke()` — the OCR/recommend callers should do the same.)

---

**2. `supabase/migrations/001_initial_schema.sql` — `pricing_cache` table has no RLS**

The `profiles` and `scan_sessions` tables have RLS enabled. `pricing_cache` does not. Any client with the anon key can read all cached pricing data directly via the Supabase REST API, bypassing the Edge Function proxy entirely. The proxy uses the service-role key for writes, but there is no constraint preventing direct client reads or restricting direct inserts.

Fix: `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY;` and add a policy that only allows reads via the service role, or restrict to authenticated users if that is sufficient.

---

### Low

**3. `supabase/migrations/001_initial_schema.sql:20` — `scan_sessions.user_id` is nullable**

```sql
user_id uuid references auth.users(id) on delete cascade,
```

`user_id` has no `NOT NULL` constraint. A row with `user_id = null` would satisfy the FK (null FK does not violate referential integrity in PostgreSQL), but would be inaccessible to everyone since `auth.uid() = null` evaluates to `NULL` in SQL (not TRUE). Such rows would be orphaned with no recovery path.

Fix: add `NOT NULL` to the `user_id` column.

---

**4. `supabase/functions/ocr/index.ts:87–89` — Greedy regex for JSON extraction is fragile**

```ts
const match = text.match(/\{[\s\S]*\}/);
```

This greedy pattern extracts everything from the first `{` to the last `}`. If the model includes any explanatory text after the JSON that contains a closing brace, or nests commentary inside braces, the match will be oversized and `JSON.parse` will throw. The same pattern is used in `recommend/index.ts:184`.

Fix: use `JSON.parse` inside a loop scanning from the start of each `{`, or instruct Claude more explicitly via the system prompt (it already says "Return ONLY raw valid JSON") and add a stricter validation step.

---

**5. `supabase/functions/ocr/index.ts:66` and `recommend/index.ts:169` — Both functions use `claude-opus-4-6` for all requests**

OCR (structured data extraction from an image) does not require Opus-level reasoning. Switching the OCR function to `claude-haiku-4-5-20251001` would reduce cost per scan significantly with minimal quality impact, given the well-defined output schema and explicit field instructions.

---

## UX and Performance Issues

### Medium

**1. `app/(tabs)/history.tsx:64` — History cards appear tappable but do nothing**

```tsx
<TouchableOpacity style={styles.card}>
```

The `TouchableOpacity` has no `onPress` prop. Tapping a history card provides haptic feedback (from the OS touch layer) but navigates nowhere. Users who expect to tap through to a previous recommendation's details will be confused.

Fix: either add navigation to a detail screen (e.g. `/scan/results` pre-loaded from history), or replace `TouchableOpacity` with `View` if interaction is intentionally disabled for now.

---

**2. `app/scan/extracting.tsx:148–151` — Duplicate "may take a minute" text visible simultaneously**

```tsx
<Text style={styles.body}>
  {stage === 'reading'
    ? 'This could take a minute or two'
    : 'Scoring by critic rating, vintage quality and value'}
</Text>
{stage === 'recommending' && (
  <Text style={styles.body}>This may take a minute or two</Text>
)}
```

When `stage === 'recommending'`, both "Scoring by critic rating…" and "This may take a minute or two" are rendered as separate visible Text elements stacked below each other. The second line is redundant and makes the loading screen feel cluttered.

Fix: remove the second conditional `<Text>` block (lines 150–152); the body text already handles the copy for each stage.

---

### Low

**3. `app/scan/extracting.tsx:153` — "Please don't leave this page" message is always visible**

```tsx
<Text style={styles.stayNote}>Please don't leave this page while we're searching</Text>
```

This warning appears throughout both the reading and recommending stages with no context-sensitivity. The phrasing is more alarming than necessary and implies something will break if the user navigates away (the extraction will fail gracefully and the user can retry). Consider removing or softening this copy.

---

**4. `app/scan/url.tsx:1–5` — URL scan route is a non-functional redirect**

The OCR Edge Function (`supabase/functions/ocr/index.ts:49–63`) fully supports URL-based wine list extraction, but the `/scan/url` route immediately redirects back to `/(tabs)/scan`. The feature is implemented in the backend and completely unreachable from any UI.

---

**5. `app/scan/preferences.tsx` — Orphaned screen reachable as a route but never navigated to**

The current scan flow is: scan tab → camera → preview → extracting → results. The `/scan/preferences` route is not linked to from any screen in the current flow but remains registered in the route tree. It can be deep-linked to by accident or tooling, and its `recommendWines` call has the missing-fields bug noted above.

Fix: either remove the file entirely, or gate it behind a navigation guard that redirects if `extractedWines` is null.

---

**6. `src/components/scan/CameraOverlay.tsx:4–5` — Frame dimensions computed once at module load**

```ts
const { width } = Dimensions.get('window');
const FRAME_WIDTH = width * 0.9;
const FRAME_HEIGHT = FRAME_WIDTH * 1.4;
```

These are module-level constants. If the device's screen dimensions change (split-screen on iPad, orientation change if ever enabled), the overlay will not recompute. Low risk given the current portrait-only configuration but worth noting for future-proofing.

---

## Navigation Issues

### Medium

**1. `app/index.tsx:20` — `preferences === null` check does not match `undefined`; new users bypass onboarding**

Covered in Bugs §4. The root symptom is a navigation issue: new authenticated users are routed to `/(tabs)/scan` instead of `/onboarding`.

---

**2. `app/scan/results.tsx:23–25` — `router.replace` called synchronously in render body**

Covered in Bugs §5. The navigation concern is that this pattern can cause Expo Router to log warnings or silently no-op the navigation if the component tree is still mounting, leaving the user on a blank results screen with no way out.

---

### Low

**3. `app/(tabs)/_layout.tsx:14–16` — No tab bar icons configured**

```tsx
<Tabs.Screen name="scan" options={{ title: 'Scan' }} />
<Tabs.Screen name="history" options={{ title: 'History' }} />
<Tabs.Screen name="profile" options={{ title: 'Profile' }} />
```

No `tabBarIcon` is set on any tab. The tab bar shows text labels only. For a production app this is standard but looks incomplete; iOS guidelines recommend icons alongside labels.

---

**4. `app/scan/camera.tsx` and `app/scan/extracting.tsx` — No cancel / back button**

Both screens provide no explicit UI to cancel and return to the scan tab. The only exit is the system-level back gesture (Android) or swipe-back (iOS). If a user navigates to the camera accidentally, or the extraction gets stuck in the error state without the retry button appearing, there is no obvious escape. The extracting screen's error state does provide a "Try Again" button that returns to scan, but the loading state has no cancel.

---

*End of report.*
