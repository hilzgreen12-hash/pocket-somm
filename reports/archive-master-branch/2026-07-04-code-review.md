# Code Review — 2026-07-04

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

> **Status note:** No application code has been committed since 2026-07-03. All findings from the 2026-07-03 report remain open. This report re-confirms those, corrects one grouping error from yesterday, and adds four new findings not previously reported.

---

## Bugs and Crashes

### HIGH — New authenticated users bypass onboarding (persistent — open since 2026-05-05)
**File:** `app/index.tsx:20`

```ts
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

`useQuery` returns `undefined` while the preferences fetch is in flight, not `null`. A brand-new authenticated user whose `profiles` row doesn't exist yet will have `preferences === undefined`. The strict `=== null` check does not match and they are immediately redirected to `/(tabs)/scan`, skipping onboarding entirely. Onboarding is only reachable if the user somehow waits long enough for the query to complete and return `null` in the same render cycle, which never happens because `<Redirect>` fires synchronously.

**Fix:** Change `preferences === null` to `preferences == null` (catches both `null` and `undefined`), and add `isLoading` from `useQuery` to the guard so the page waits until preferences are resolved before deciding.

---

### HIGH — `scan_sessions` is never written — History tab is permanently empty (new finding)
**Files:** `app/(tabs)/history.tsx:12–24`, `supabase/migrations/001_initial_schema.sql:16–25`

The `scan_sessions` table is fully defined with a proper schema, RLS policy, and a `recommendation jsonb` column. The History tab queries it and handles loading/empty states correctly. But no code in the application ever inserts a row into `scan_sessions`. The scan result lives only in the Zustand `scanStore` and is lost when the user navigates away. Every user's history will always be empty regardless of how many scans they have completed.

The `scan_sessions` table and History tab are essentially a dead feature — the infrastructure is there, the consumer is there, but the write path is missing.

**Fix:** After `setRecommendation(recommendation)` in `app/scan/extracting.tsx:116`, insert a row into `scan_sessions` via Supabase (only when a session exists — guest scans can be silently skipped). Include `user_id`, `captured_at`, `extracted_wines`, `recommendation`, and `preferences_snapshot`.

---

### HIGH — `handleCapture` in camera screen has no error handling (persistent — open since 2026-05-05)
**File:** `app/scan/camera.tsx:29–99`

`handleCapture` calls `Haptics.impactAsync`, `cameraRef.current.takePictureAsync()`, and two `ImageManipulator.manipulateAsync()` calls without any `try/catch`. A hardware camera failure, out-of-memory error, or permission revocation mid-session produces an unhandled promise rejection with no fallback UI.

**Fix:** Wrap the entire `handleCapture` body in `try/catch` and show an error alert with a prompt to retry.

---

### HIGH — `recommendWines` called with missing required fields in preferences screen (persistent — open since 2026-05-05)
**File:** `app/scan/preferences.tsx:28–35`

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
});
```

`RecommendInput` requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. All five are omitted. These fields arrive as `undefined` at the Edge Function, silently disabling all hard-rule enforcement (colour, region exclusions, grape exclusions) for every call made from this screen.

Additionally: this route (`/scan/preferences`) is never navigated to from any other screen in the app. No `router.push('/scan/preferences')` call exists anywhere. The screen exists as a registered route but is unreachable through normal use. See also: Navigation Issues below.

**Fix:** Pass the missing fields using `usePreferences()` data. Address the unreachable route separately.

---

### HIGH — `router.replace` called during the render phase (persistent — open since 2026-05-05)
**File:** `app/scan/results.tsx:22–25`

```ts
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Navigation side-effects during render can cause "Cannot update a component while rendering a different component" warnings, double navigation, or state corruption in expo-router.

**Fix:** Move this into a `useEffect` with `recommendation` as a dependency, as is done correctly in `app/scan/preview.tsx:10–12`.

---

### MEDIUM — Pre-filter uses saved profile budget, not the scan-time budget override (new finding)
**File:** `app/scan/extracting.tsx:37–39, 101–112`

`preFilterWines` at line 101 is called with `userProfile` (from `usePreferences()` — the user's saved profile budget). But `recommendWines` at lines 102–112 is called with `preferences.budget` (from the Zustand scan store — the budget set on the Scan tab for this specific scan). These two budgets can differ:

```ts
const winesForRecommend = preFilterWines(wines, userProfile);  // uses profile budget
const recommendation = await recommendWines({
  ...
  budget: preferences.budget,  // uses scan-time budget
});
```

If a user's profile budget is £50 but they raise it to £100 on the scan screen, `preFilterWines` hard-removes all wines priced £51–£100 before Claude sees them. Claude is then told the budget is £100, but those wines aren't in the list to consider. Budget overrides on the scan screen are silently ineffective for the pre-filter step.

**Fix:** Pass `preferences.budget` (from the scan store) to `preFilterWines` instead of `userProfile`, or merge the two budget sources consistently.

---

### MEDIUM — `UserPreferences` type mismatch: `defaultBudget` typed as `number`, returned as `number | null` (persistent — open since 2026-05-05)
**File:** `src/types/preferences.ts:7–8`, `src/hooks/usePreferences.ts:25`

`defaultBudget` is declared as `number` in the type but `usePreferences` returns `data.default_budget ?? null`, making it `number | null` in practice. `defaultCurrency: string` is declared in the type but never fetched from the database — all consumers receive `undefined`.

**Fix:** Update the type to `defaultBudget: number | null`. Either fetch `default_currency` from the `profiles` table or remove `defaultCurrency` from the interface.

---

### MEDIUM — Silent fallback to duplicate-grape response after retry (persistent — open since 2026-05-05)
**File:** `src/services/recommender.ts:75–82`

If the diversity retry returns duplicate grapes again (or fails Zod validation), the code falls through and returns the original `parsed.data` which violated the constraint. No log is emitted in this path.

**Fix:** After the retry, also check `hasDuplicateGrapes(parsed2.data.wines)`. If still violated, throw an error rather than silently returning non-compliant data.

---

### MEDIUM — Preferences `upsert` error is never checked (persistent — open since 2026-05-05)
**File:** `src/hooks/usePreferences.ts:38–47`

`await supabase.from('profiles').upsert({...})` discards its return value. Failed saves are never surfaced to the user. The `onError` callback is never reached because `mutationFn` does not throw.

**Fix:** Destructure `{ error }` and `throw error` if non-null, so React Query routes it to `onError`.

---

### MEDIUM — Onboarding navigates before save completes (persistent — open since 2026-05-05)
**File:** `app/onboarding.tsx:37–51`

`updatePreferences(...)` is fire-and-forget via `mutation.mutate`. `router.replace('/(tabs)/scan')` fires on the same tick. A failed save leaves the user on the scan tab with no profile row, causing them to be redirected back to onboarding on every subsequent launch (compounding the `index.tsx` bug above).

**Fix:** Switch to `mutation.mutateAsync`, `await` it inside `try/catch`, and navigate only on success.

---

### LOW — `focusPoint` state is set but never consumed (new finding)
**File:** `app/scan/camera.tsx:15, 26`

```ts
const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);
// ...
function handleTap(event) {
  setFocusPoint({ x, y });
}
```

`focusPoint` is never read after being set. The `CameraView` doesn't receive it. Tapping the camera view to focus records state but does not actually instruct the camera to focus at that point — the "tap to focus" feature is broken (or was never implemented).

**Fix:** Remove the `focusPoint` state and `handleTap` if tap-to-focus is not implemented, or implement it by passing the coordinates to `CameraView` via a supported prop.

---

### LOW — Stale local preferences after profile edit (persistent — open since 2026-05-05)
**File:** `app/(tabs)/scan.tsx:59–66`

The `prefsLoaded` flag means local state on the scan screen is only ever synced once from the server. If the user edits their profile and comes back, the scan filters remain stale until app restart.

**Fix:** Remove the `prefsLoaded` guard or compare incoming preferences against current state before deciding whether to apply.

---

## Supabase and Edge Function Issues

### HIGH — `pricing_cache` table has no Row Level Security (persistent — open since 2026-05-05)
**File:** `supabase/migrations/001_initial_schema.sql`

`profiles` and `scan_sessions` have RLS enabled. `pricing_cache` does not. Any client with the Supabase anon key can directly SELECT, INSERT, UPDATE, or DELETE all rows, exposing every wine name ever queried and allowing cache poisoning with false pricing data.

**Fix:** Add `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY` to the migration. Because only the Edge Function (service role) should write to this table, no permissive policies are needed — the service role bypasses RLS automatically.

---

### HIGH — Edge Function calls send no user auth token (persistent — open since 2026-05-05)
**File:** `src/api/claude.ts:6–18`

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
},
```

No `Authorization: Bearer <access_token>` header is sent. Edge Functions cannot identify the caller, enforce per-user rate limits, or apply any identity-based logic. The OCR and recommend endpoints are effectively public.

**Fix:** Use `supabase.functions.invoke(name, { body })` — which attaches auth headers automatically — instead of the manual `fetch` wrapper. This pattern is already used correctly in `src/api/wine-searcher.ts:12`.

---

### MEDIUM — Budget constraint in recommend prompt hardcodes `£` (persistent — open since 2026-05-05)
**File:** `supabase/functions/recommend/index.ts:139, 154`

The prompt always presents the budget as `£X`. Non-GBP menus will have Claude applying a sterling budget against prices in another currency. The OCR function also defaults all menus to `currency: "GBP"` regardless of the menu's actual currency.

**Fix:** Pass currency through the scan preferences payload and use it in both the OCR and recommend prompts.

---

### MEDIUM — Outdated model ID in both Edge Functions (persistent — open since 2026-05-05)
**Files:** `supabase/functions/ocr/index.ts:58, 66`, `supabase/functions/recommend/index.ts:170`

Both functions specify `model: 'claude-opus-4-6'`. The current Opus model is `claude-opus-4-8`. Using a deprecated model ID risks degraded performance or errors as older versions are retired.

**Fix:** Update both functions to `model: 'claude-opus-4-8'`.

---

### LOW — Wine-Searcher response field mapping is speculative (persistent — open since 2026-05-05)
**File:** `supabase/functions/wine-searcher-proxy/index.ts:57–63`

Field names (`wsData.price_avg`, `wsData.price_min`, etc.) are guesses acknowledged by an inline comment. Mismatches will silently cache nulls for 7 days.

**Fix:** Validate the response shape with Zod and throw on missing required fields rather than caching nulls.

---

## UX and Performance Issues

### HIGH — History cards are tappable but do nothing (persistent — open since 2026-05-05)
**File:** `app/(tabs)/history.tsx:64`

```tsx
<TouchableOpacity style={styles.card}>
```

`TouchableOpacity` with no `onPress`. Users tap, see the press animation, and nothing happens. Combined with the finding above (scan_sessions is never written), the History tab is double-broken: no data is ever saved, and even if it were, there is no detail view to navigate to.

**Fix:** Either replace `TouchableOpacity` with `View` until a detail route exists, or implement a detail screen and link to it.

---

### MEDIUM — History query error falls silently into empty state (persistent — open since 2026-05-05)
**File:** `app/(tabs)/history.tsx:12–24`

`isError` is not destructured from `useQuery`. A network failure renders "No scans yet" with no indication of an error.

**Fix:** Check `isError` and render a distinct error state.

---

### MEDIUM — "Continue without account" on sign-in doesn't set `hasLaunched` flag (persistent — open since 2026-05-05)
**File:** `app/(auth)/sign-in.tsx:48–50`

The guest bypass on the sign-in screen does not call `AsyncStorage.setItem('hasLaunched', 'true')`. Users who reach sign-in from the welcome screen and tap "Continue without account" will see the welcome screen again on next launch.

**Fix:** Add `await AsyncStorage.setItem('hasLaunched', 'true')` before the `router.replace` call.

---

### MEDIUM — Email update has no client-side format validation (persistent — open since 2026-05-05)
**File:** `app/(tabs)/profile.tsx:110–111`

Only emptiness is checked before calling the API. Invalid email formats are returned as a generic modal alert after a network round-trip.

**Fix:** Add a format check (e.g., `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) and surface inline validation before the API call.

---

### LOW — Duplicate "may take a minute or two" text during recommending stage (persistent — open since 2026-05-05)
**File:** `app/scan/extracting.tsx:145–153`

When `stage === 'recommending'`, two separate `<Text>` nodes with nearly identical copy are both visible: "This could take a minute or two" and "This may take a minute or two".

**Fix:** Conditionally swap between stage-specific strings rather than appending a second copy.

---

### LOW — Tab bar has no background colour (persistent — open since 2026-05-05)
**File:** `app/(tabs)/_layout.tsx:8–12`

`tabBarStyle` sets only `borderTopColor`. On iOS the tab bar defaults to a translucent system appearance; on Android it defaults to white — both clash with the dark `colors.background` used throughout the app.

**Fix:** Add `backgroundColor: colors.background` to `tabBarStyle`.

---

## Navigation Issues

### MEDIUM — `/scan/preferences` route exists but is unreachable (new finding)
**File:** `app/scan/preferences.tsx`

`app/scan/preferences.tsx` is registered as a file-system route (`/scan/preferences`) but no `router.push('/scan/preferences')` call exists anywhere in the application. The current scan flow is: Scan tab → Camera → Preview → Extracting → Results. The preferences screen was either removed from the flow without deleting the file, or was never wired up. Its broken `recommendWines` call (see Bugs section) means it would produce incorrect recommendations even if reachable.

**Fix:** Either delete the file, or reinstate it in the scan flow and fix the missing `RecommendInput` fields.

---

### MEDIUM — `/scan/url` is an unimplemented stub (persistent — open since 2026-05-05)
**File:** `app/scan/url.tsx`

The route simply redirects to `/(tabs)/scan`. The OCR Edge Function has URL-based extraction built in (`supabase/functions/ocr/index.ts:49–63`), but there is no reachable UI for it.

**Fix:** Implement URL input and extraction, or delete the file to remove the dead route.

---

### LOW — History detail view is missing (persistent — open since 2026-05-05)
**File:** `app/(tabs)/history.tsx:64`

No route exists for `/scan/history/[id]` or equivalent. The `recommendation` jsonb column in `scan_sessions` holds the data needed to render a past result using the existing `ResultsScreen` layout — only the route and navigation link are missing. Note: this is moot until `scan_sessions` writes are implemented (see Bugs section above).

**Fix:** Add `app/scan/history/[id].tsx`, load the session by ID, and pass `recommendation` to a read-only version of the results layout. Link from history card `onPress`.
