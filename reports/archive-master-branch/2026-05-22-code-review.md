# Code Review — 2026-05-22

Reviewed by: automated review agent  
Scope: full codebase — bugs/crashes, Supabase/Edge Functions, UX, navigation

---

## Bugs and Crashes

### High

**1. `app/onboarding.tsx:38,47` — Preferences silently lost on save failure; navigation fires before write completes**

```ts
updatePreferences({ wineTypes, styleProfiles, ... }); // fire-and-forget
router.replace('/(tabs)/scan');                        // fires immediately
```

`updatePreferences` is `mutation.mutate` (fire-and-forget), not `mutateAsync`. `router.replace` is called unconditionally on the next line, so navigation happens regardless of whether the Supabase upsert succeeded or failed. Additionally, the `mutationFn` in `usePreferences` does not throw on Supabase errors (see Bugs #8 below), so `onError` never fires and the user receives no feedback that their data was not saved.

Fix: replace `updatePreferences(...)` with `await mutation.mutateAsync(...)` (after fixing the silent-swallow in `usePreferences`), and navigate only inside `onSuccess`.

---

**2. `app/_layout.tsx` — No error boundary; any render crash kills the entire app**

There is no `ErrorBoundary` component anywhere in the layout tree. An uncaught error thrown during rendering in any screen — including a `null` dereference in the results accordion — crashes the app to a red screen with a raw stack trace. Expo Router supports an exported `ErrorBoundary` from `app/_layout.tsx`.

Fix: export an `ErrorBoundary` from `app/_layout.tsx` that renders a user-facing recovery screen.

---

**3. `app/scan/preferences.tsx:28–33` — `recommendWines` called with five missing required fields**

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // MISSING: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```

`RecommendInput` (defined in `src/services/recommender.ts:5–15`) requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. These five fields are absent. The call compiles via implicit `undefined` for the missing fields; at runtime the Edge Function receives `undefined` for all five preference arrays and silently treats them as "no preference". This is also an orphaned screen that is never navigated to in the current flow (see Navigation Issues #5), but it remains in the route tree and can be deep-linked.

---

**4. `app/scan/results.tsx` / `app/scan/extracting.tsx` / `app/(tabs)/history.tsx` — No scan session is ever written to Supabase; history is permanently empty**

The `scan_sessions` table is created in `supabase/migrations/001_initial_schema.sql:16–25` and queried in `app/(tabs)/history.tsx:16–24`. However, there is no code anywhere in the app that inserts or upserts into `scan_sessions`. After every scan, `setRecommendation(recommendation)` is called (extracting.tsx:116) and `router.replace('/scan/results')` is called (extracting.tsx:117). `results.tsx` reads from the store but never persists to Supabase. Every user's history tab is permanently empty regardless of how many scans they do.

Fix: at the point of successful recommendation in `app/scan/extracting.tsx` (after line 116), insert a row into `scan_sessions` with `user_id`, `extracted_wines`, and `recommendation`.

---

### Medium

**5. `app/index.tsx:20` — `preferences === null` does not match `undefined`; new authenticated users bypass onboarding**

```tsx
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```

React Query returns `undefined` (not `null`) while a query is loading. When an authenticated user's session resolves (setting `loading = false`), the preferences query is still in-flight and `preferences` is `undefined`. The `=== null` check is false, so the component immediately redirects to `/(tabs)/scan`. New users who have just confirmed their email and have no profile row will skip onboarding entirely.

Fix: gate on preferences loading state: `if (loading || hasLaunched === null || (session && preferences === undefined)) return null;`

---

**6. `app/scan/results.tsx:23–25` — `router.replace` called synchronously in the render body**

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace` unconditionally in the function body (not inside a `useEffect`) mutates navigation state during the render phase. This is a React anti-pattern and can trigger "Cannot update a component from inside the function body of a different component" warnings or a no-op navigation, leaving the user on a blank screen with no escape.

Fix: `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

---

**7. `app/(tabs)/history.tsx:71` — Accesses `recommendation.topPick` which does not exist on the type**

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (defined in `src/types/wine.ts:50–53`) has `wines: WineRecommendation[]`, not a `topPick` property. This expression is always falsy; the recommended wine name is never displayed on history cards even if a recommendation exists.

Fix: `item.recommendation?.wines?.[0]?.name`.

---

**8. `src/hooks/usePreferences.ts:38–47` — Supabase upsert errors are silently swallowed; mutation always appears to succeed**

```ts
mutationFn: async (updates: Partial<UserPreferences>) => {
  if (!session) return;
  await supabase.from('profiles').upsert({ ... });
  // no error check — returns undefined regardless of success or failure
},
onError: (err) => console.error('[Preferences] Save error:', err),
```

`supabase.from(...).upsert(...)` returns `{ data, error }`. If the upsert fails (RLS violation, constraint error, network error), the function body ends without throwing, so the mutation resolves as successful. `onSuccess` fires and invalidates the cache (triggering a refetch that re-confirms the old data), `onError` is never called, and the user receives no indication that their preference save failed. This affects every preference write in the app: onboarding, scan tab, profile tab.

Fix: destructure and throw on error: `const { error } = await supabase.from('profiles').upsert({...}); if (error) throw error;`

---

**9. `app/scan/camera.tsx:29–98` — `handleCapture` is async with no try/catch; hardware failures leave the UI frozen**

`handleCapture` calls `cameraRef.current.takePictureAsync()` and two `ImageManipulator.manipulateAsync()` calls, all of which can throw (hardware error, storage full, permission revoked mid-session). There is no `try/catch`. A thrown error produces an unhandled promise rejection and leaves the user frozen on the camera screen with no feedback and no escape.

Fix: wrap the body of `handleCapture` in `try/catch` and navigate back to `/(tabs)/scan` or show a toast on failure.

---

**10. `app/scan/camera.tsx:15` — `focusPoint` state is set by tap but never applied to the camera**

```tsx
const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);
...
function handleTap(event: ...) {
  setFocusPoint({ x, y }); // never used
}
```

`focusPoint` is updated on every user tap but is never passed to the `CameraView` component as a prop. The camera does not actually change its focus point when the user taps. The user can tap, observe nothing happening, and assume the camera is unresponsive.

Fix: either pass `focusPoint` to the relevant `CameraView` prop (if expo-camera exposes one), or remove the `handleTap` / `focusPoint` dead code.

---

### Low

**11. `src/services/recommender.ts:75–82` — Diversity retry falls back to the original duplicate-grape result without logging**

```ts
const raw2 = await callRecommend({ ...input, _strictDiversity: true });
const parsed2 = RecommendationResponseSchema.safeParse(raw2);
if (parsed2.success) return parsed2.data;
// falls through to return parsed.data — the original duplicate response
```

If `parsed2.success` is false, the function silently returns `parsed.data`, the original response containing duplicate grape varieties. No error is thrown or logged; the user receives a result that violates the app's diversity constraint with no indication.

---

**12. `supabase/functions/wine-searcher-proxy/index.ts:1` — Missing env var causes silent all-null response**

```ts
const WINE_SEARCHER_API_KEY = Deno.env.get('WINE_SEARCHER_API_KEY')!;
```

If `WINE_SEARCHER_API_KEY` is absent (missing deployment secret), the variable is `undefined`. The downstream fetch to Wine-Searcher returns a 401, the catch block returns HTTP 200 with all-null pricing, and the caller has no way to distinguish "key missing" from "wine not in database."

Fix: guard at startup: `if (!WINE_SEARCHER_API_KEY) return new Response(JSON.stringify({ error: 'WINE_SEARCHER_API_KEY not configured' }), { status: 500 });`

---

**13. `app/(tabs)/scan.tsx:86–101` — `handleScreenshot` has no try/catch; unhandled rejection on picker failure**

```ts
async function handleScreenshot() {
  const result = await ImagePicker.launchImageLibraryAsync({ ... });
  ...
}
```

`launchImageLibraryAsync` can throw if permissions are revoked or if the picker crashes on some devices. Without a `try/catch`, this is an unhandled promise rejection with no user feedback.

---

## Supabase and Edge Function Issues

### Medium

**1. `src/api/claude.ts:7–14` — OCR and recommend Edge Function calls omit the user's Authorization header**

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
  // no Authorization: Bearer <token>
},
```

The `invokeFunction` helper sends only the anon key. The OCR and recommend functions receive no JWT and cannot identify the calling user. This means there is no per-user rate limiting, no audit trail, and any third party who obtains the public anon key can invoke Claude-backed functions unlimited times. Note: `src/api/wine-searcher.ts` correctly uses `supabase.functions.invoke()` which attaches the bearer token automatically.

Fix: replace the raw `fetch` in `invokeFunction` with `supabase.functions.invoke()`, which automatically attaches the current session's JWT.

---

**2. `supabase/migrations/001_initial_schema.sql:33–44` — `pricing_cache` table has no RLS policy**

`profiles` and `scan_sessions` both have `enable row level security` and policies. `pricing_cache` does not. Any client with the anon key can read all cached pricing records directly via the Supabase REST API, bypassing the Edge Function proxy. The proxy uses the service-role key to write; there is no constraint on direct client reads or inserts.

Fix: add `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY;` and a restrictive policy. Since this table is only meant to be read/written by the Edge Function's service role, a policy that denies all client access (or grants read-only to authenticated users if public pricing data is acceptable) is appropriate.

---

**3. `supabase/functions/recommend/index.ts:139` — Budget currency hardcoded as GBP regardless of wine list currency**

```ts
`- Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```

The diner's budget is described to the model with a `£` symbol regardless of what currency the wine list uses. If the restaurant prices wines in USD or EUR, the model is asked to compare a GBP budget against USD prices, producing incorrect filtering. The `currency` field is present in `ExtractedWine` (defaulting to `'GBP'`) but is never used to localise the budget prompt.

Fix: derive the currency from the extracted wines array (e.g. the first wine's `currency` field) and use it in the budget prompt line.

---

### Low

**4. `supabase/migrations/001_initial_schema.sql:20` — `scan_sessions.user_id` has no NOT NULL constraint**

```sql
user_id uuid references auth.users(id) on delete cascade,
```

`user_id` is nullable. A row with `user_id = null` satisfies the FK (null does not violate referential integrity in PostgreSQL) but will never be returned by the RLS policy (`auth.uid() = user_id` evaluates to NULL when `user_id` is NULL), creating orphaned rows with no recovery path.

Fix: add `NOT NULL` to the column definition.

---

**5. `supabase/functions/ocr/index.ts:87` and `recommend/index.ts:184` — Greedy regex extracts oversized JSON when model adds trailing text**

```ts
const match = text.match(/\{[\s\S]*\}/);
```

This greedy pattern matches from the first `{` to the last `}` in the string. If the model appends any text after the JSON that contains a `}` — or if a string value inside the JSON contains `}` followed by further model commentary — the extracted substring will be malformed and `JSON.parse` will throw. Both edge functions use the identical pattern.

Fix: attempt `JSON.parse` on progressively larger substrings starting from each `{`, or use a streaming JSON parser. The existing system prompts already instruct the model to return only JSON, which reduces risk, but the fallback extraction should be more robust.

---

**6. `supabase/functions/ocr/index.ts:59` — OCR function uses `claude-opus-4-6` for structured image parsing**

Structured data extraction from a constrained schema (the `WINE_FIELDS` specification) does not require Opus-level reasoning. Switching the OCR function to `claude-haiku-4-5-20251001` would substantially reduce per-scan cost with minimal quality impact given the explicit field definitions and JSON-only output instruction. `recommend/index.ts:170` correctly uses Opus for the complex ranking task; OCR does not need the same model tier.

---

## UX and Performance Issues

### High

**1. `app/(tabs)/history.tsx` — History tab always shows "No scans yet" because nothing writes to `scan_sessions`**

Covered in Bugs #4. From the user's perspective, this is a feature that appears to work (the UI renders correctly, loading state shows, empty state shows) but has never functioned for any user since launch. The tab communicates broken trust — users expect their history to persist.

---

### Medium

**2. `app/(tabs)/history.tsx:64` — History cards appear tappable but have no `onPress` handler**

```tsx
<TouchableOpacity style={styles.card}>
```

The `TouchableOpacity` renders with no `onPress`. It provides a visual press response (opacity change) when tapped, implying navigation, but nothing happens. Users who tap a card to see the full recommendation will be confused.

Fix: either wire up navigation to a detail view, or replace `TouchableOpacity` with `View` until a detail screen exists.

---

**3. `app/scan/extracting.tsx:143–152` — Duplicate "may take a minute" copy renders simultaneously during recommending stage**

```tsx
<Text style={styles.body}>
  {stage === 'reading'
    ? 'This could take a minute or two'
    : 'Scoring by critic rating, vintage quality and value'}
</Text>
{stage === 'recommending' && (
  <Text style={styles.body}>This may take a minute or two</Text>  {/* line 151 */}
)}
```

When `stage === 'recommending'`, both "Scoring by critic rating…" and "This may take a minute or two" are visible simultaneously as separate stacked text elements. The duplicate makes the loading screen feel inconsistent.

Fix: remove the second conditional `<Text>` block (lines 150–152); the first element already handles all stage copy.

---

**4. `src/components/results/WineRecommendationCard.tsx` — Component is dead code; `results.tsx` renders an inline accordion instead**

`WineRecommendationCard` (defined in `src/components/results/WineRecommendationCard.tsx:1–196`) is not imported or used anywhere in the current codebase. `app/scan/results.tsx` renders recommendation cards inline. This creates two divergent implementations of the same UI; the component version includes `PricingBadge` logic that the inline version omits.

Fix: either migrate `results.tsx` to use `WineRecommendationCard` to consolidate the implementation, or delete the component file to avoid confusion.

---

### Low

**5. `app/scan/extracting.tsx:153` — "Please don't leave this page" warning is permanently visible and misleading**

```tsx
<Text style={styles.stayNote}>Please don't leave this page while we're searching</Text>
```

This warning is shown throughout the entire extraction flow with no context-sensitivity. The app handles navigation away gracefully (the cancellation token in `run()` prevents stale state updates), so the warning overstates the consequences. The phrasing is more alarming than necessary.

---

**6. `app/scan/url.tsx:1–5` — URL-based wine list scanning is fully implemented in the Edge Function but permanently unreachable**

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

`supabase/functions/ocr/index.ts:49–63` handles URL extraction with full HTML fetching and stripping logic. The `/scan/url` route immediately redirects back to the scan tab. The feature exists in the backend and is completely unavailable to users.

---

**7. `app/scan/preferences.tsx` — Orphaned screen remains registered in the route tree**

The current flow is: scan tab → camera → preview → extracting → results. `/scan/preferences` is not navigated to from any screen but remains as a registered route. It can be reached via deep link and contains the missing-fields bug noted in Bugs #3.

Fix: remove `app/scan/preferences.tsx` entirely, or add a guard that redirects to `/(tabs)/scan` when `extractedWines` is null.

---

**8. `app/(tabs)/profile.tsx` — Each individual preference change fires an immediate Supabase upsert with no debounce**

The profile tab calls `updatePreferences(...)` directly in `onChange` callbacks for `WineTypePicker`, `ChipPicker`, and `StylePicker`. On a slow network, rapid changes (toggling several chips quickly) will queue multiple concurrent upserts to the same row. Since each upsert is a full profile write and they execute in parallel, a slower earlier write arriving after a later write will silently overwrite the user's last change.

Fix: debounce preference writes by at least 500ms, or collect changes and submit with a single "Save" button.

---

**9. `src/components/scan/CameraOverlay.tsx:4–5` — Frame dimensions computed once at module load; does not update on screen size changes**

```ts
const { width } = Dimensions.get('window');
const FRAME_WIDTH = width * 0.9;
const FRAME_HEIGHT = FRAME_WIDTH * 1.4;
```

These are module-level constants evaluated once when the module is first imported. An orientation change or iPad split-screen would leave the overlay frame mis-sized relative to the actual camera preview. Low risk given the current portrait-only configuration.

---

## Navigation Issues

### Medium

**1. `app/index.tsx:20` — New authenticated users are redirected to `/(tabs)/scan` instead of `/onboarding`**

Covered in Bugs #5. The root navigation symptom: a newly registered user who confirms their email is immediately sent to the scan tab, never encountering the onboarding flow. Their profile row does not exist, and all preference reads fall back to empty arrays for the session's lifetime.

---

**2. `app/scan/results.tsx:23–25` — `router.replace` called synchronously in the render body**

Covered in Bugs #6. When `recommendation` is null (e.g. direct deep-link to `/scan/results`), the navigation attempt fires during the render phase, which Expo Router may silently ignore. The component returns `null`, leaving the user on a blank screen with no back navigation.

---

### Low

**3. `app/(tabs)/_layout.tsx:14–16` — No `tabBarIcon` configured on any tab**

```tsx
<Tabs.Screen name="scan" options={{ title: 'Scan' }} />
<Tabs.Screen name="history" options={{ title: 'History' }} />
<Tabs.Screen name="profile" options={{ title: 'Profile' }} />
```

The tab bar shows text-only labels. No icons are configured. On iOS, the system renders default placeholder icons alongside the label text, which looks unpolished. Android tab bars without icons also look unfinished.

---

**4. `app/scan/camera.tsx` and `app/scan/extracting.tsx` — No cancel button in camera or loading screens**

Neither screen provides a visible control to cancel and return to the scan tab. The only exit is the OS back gesture (Android swipe, iOS edge swipe). During a long extraction, users who want to cancel have no clear affordance. The extracting screen's error state does render a "Try Again" button that returns to scan, but the loading state has no corresponding cancel path.

Fix: add a `×` or "Cancel" button to both screens that calls `reset()` and `router.replace('/(tabs)/scan')`.

---

**5. `app/scan/preferences.tsx` — Dead route registered in the router with no navigation to it**

Covered in UX Issues #7. From a navigation standpoint, any routing tooling or link-sharing attempt that targets `/scan/preferences` will render a screen with missing props and a broken API call.

---

*End of report.*
