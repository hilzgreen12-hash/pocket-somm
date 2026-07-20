# Code Review — 2026-07-03

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

---

## Bugs and Crashes

### HIGH — New authenticated users bypass onboarding
**File:** `app/index.tsx:20`

```ts
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

`useQuery` returns `undefined` (not `null`) while the preferences fetch is still in flight. The `=== null` check only matches after the query resolves with "no rows found". Until then, a brand-new authenticated user — whose profile row doesn't exist yet — sees `preferences === undefined`, falls through the check, and is immediately redirected to `/(tabs)/scan` instead of `/onboarding`. Onboarding is silently skipped every time.

**Fix:** Replace `preferences === null` with `preferences == null` (loose equality catches both `null` and `undefined`), or add `isLoading` from `useQuery` to the guard condition in `index.tsx`.

---

### HIGH — `handleCapture` in camera screen has no error handling
**File:** `app/scan/camera.tsx:29–99`

`handleCapture` calls `Haptics.impactAsync`, `cameraRef.current.takePictureAsync()`, and two `ImageManipulator.manipulateAsync()` calls without any `try/catch`. A hardware camera failure, out-of-memory error, or permission revocation mid-session will produce an unhandled promise rejection and crash the app. There is no fallback UI either.

**Fix:** Wrap the entire `handleCapture` body in a `try/catch` and navigate to the scan tab on failure with an appropriate error alert.

---

### HIGH — `recommendWines` called with missing required fields in preferences screen
**File:** `app/scan/preferences.tsx:28–35`

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
});
```

`RecommendInput` (defined in `src/services/recommender.ts:5–15`) requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` as non-optional fields. All five are absent from this call. TypeScript should reject this at compile time. At runtime, these fields arrive as `undefined` at the Edge Function, so the hard-rule enforcement for colour, excluded regions, and excluded grapes in the recommend prompt is silently disabled for every recommendation made from the manual preferences screen.

**Fix:** Pass the missing fields. Since the preferences screen already imports `usePreferences`, pull the saved profile fields and include them in the call.

---

### HIGH — `router.replace` called during the render phase
**File:** `app/scan/results.tsx:22–25`

```ts
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace` unconditionally during the render function causes a navigation side-effect in the React render phase. React logs "Cannot update a component while rendering a different component" and behaviour is undefined — double navigation or state corruption can occur on some versions of expo-router.

**Fix:** Move this redirect into a `useEffect` with `recommendation` as a dependency, as is already done correctly in `app/scan/preview.tsx:10–12`.

---

### MEDIUM — `UserPreferences` type mismatch: `defaultBudget` and `defaultCurrency` are inconsistent with actual data
**File:** `src/types/preferences.ts:7–8`

```ts
defaultBudget: number;
defaultCurrency: string;
```

`usePreferences.ts:25` returns `data.default_budget ?? null`, so in practice `defaultBudget` is `number | null`, not `number`. TypeScript allows this through implicit narrowing in some call sites but causes incorrect comparisons elsewhere (e.g., `app/scan/extracting.tsx:38`: `if (prefs.defaultBudget)` is false when budget is 0, but only because TS believes it's non-nullable). Additionally, `defaultCurrency` is declared in the type but never selected from the database in `usePreferences.ts:16` and never populated — every consumer receives `undefined` for this field.

**Fix:** Update the type to `defaultBudget: number | null` and either add `default_currency` to the Supabase select query or remove `defaultCurrency` from the interface.

---

### MEDIUM — Silent fallback to duplicate-grape response after retry
**File:** `src/services/recommender.ts:75–82`

```ts
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data;
}

return parsed.data; // still has duplicate grapes
```

If the retry either (a) returns duplicate grapes again or (b) fails Zod validation, the code silently falls through and returns the original `parsed.data`, which violates the core grape-diversity rule. Neither case is logged or surfaced to the user. The `_strictDiversity` flag signals that diversity failed once but on retry failure there is no second chance or error signal.

**Fix:** After the retry, check `hasDuplicateGrapes` on `parsed2.data` as well. If it still fails, throw an error or at minimum log a warning that the hard constraint could not be satisfied.

---

### MEDIUM — Preferences `upsert` error is never checked
**File:** `src/hooks/usePreferences.ts:38–47`

```ts
await supabase.from('profiles').upsert({...});
```

The return value `{ data, error }` is discarded. If the upsert fails (network error, RLS violation, schema mismatch), the mutation's `onSuccess` callback fires via `onError`, but because `mutationFn` doesn't throw, React Query treats it as a success and invalidates the cache. The user sees no feedback that their preferences were not saved.

**Fix:** Destructure `{ error }` and `throw error` (or `throw new Error(error.message)`) if it is non-null, so React Query can call `onError` and surface the failure.

---

### MEDIUM — Onboarding navigates before save completes
**File:** `app/onboarding.tsx:37–51`

```ts
updatePreferences({...});
router.replace('/(tabs)/scan');
```

`updatePreferences` calls `mutation.mutate`, which is fire-and-forget. `router.replace` fires on the same tick. If the Supabase upsert fails, the user is already on the scan tab with no indication the preferences save failed. Combined with the `index.tsx` bug above, a new user whose onboarding save fails will loop back into onboarding on next app launch with no explanation.

**Fix:** Switch `updatePreferences` to `mutation.mutateAsync` and `await` it inside a `try/catch` before calling `router.replace`. Display an error alert if the save fails.

---

### LOW — Stale local preferences after profile edit
**File:** `app/(tabs)/scan.tsx:59–66`

```ts
const [prefsLoaded, setPrefsLoaded] = useState(false);
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    // sync once...
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```

The `prefsLoaded` flag ensures the local state is only initialised from the server once. If the user edits their profile on the Profile tab (invalidating the React Query cache), `savedPreferences` updates but the local state in `ScanTab` does not follow because `prefsLoaded` is already `true`. The scan filters shown to the user will be stale until they restart the app.

**Fix:** Remove the `prefsLoaded` guard and instead check whether the incoming `savedPreferences` object differs from current state before applying, or expose `savedPreferences` directly to consumers and derive defaults at the point of submission.

---

## Supabase and Edge Function Issues

### HIGH — `pricing_cache` table has no Row Level Security
**File:** `supabase/migrations/001_initial_schema.sql`

`scan_sessions` and `profiles` both have RLS enabled and scoped to `auth.uid() = user_id`. The `pricing_cache` table has neither `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY` nor any policies. Any client with the Supabase anon key can directly SELECT, INSERT, UPDATE, or DELETE all rows in `pricing_cache`, bypassing the Edge Function caching layer. This exposes every wine name and vintage ever queried by any user, and allows an attacker to poison the cache with false pricing data.

**Fix:** Add `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY` to the migration. Since only the Edge Function (service role) should ever write to this table, do not add any public-facing policies — the service role bypasses RLS by default. To also block direct reads, add a `USING (false)` policy or leave the table with RLS enabled and no permissive policies.

---

### HIGH — Edge Function calls send no user auth token
**File:** `src/api/claude.ts:6–18`

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
},
```

The manual `fetch` wrapper only sends the Supabase anon key. There is no `Authorization: Bearer <session.access_token>` header. As a result, Edge Functions receive all requests as anonymous and cannot enforce per-user rate limits, charge usage to specific users, or enforce any identity-based logic. The OCR and recommend functions are effectively public endpoints limited only by knowledge of the anon key.

**Fix:** After obtaining the session from `supabase.auth.getSession()`, append `Authorization: Bearer ${session.access_token}` to the headers. Alternatively, replace the manual `fetch` with `supabase.functions.invoke(name, { body })` (already used in `src/api/wine-searcher.ts`), which attaches auth headers automatically.

---

### MEDIUM — Budget constraint in recommend prompt hardcodes `£`
**File:** `supabase/functions/recommend/index.ts:139`

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```

And in the user context block at line 154:
```ts
`- Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```

The app passes a currency-agnostic integer but the prompt always presents it as pounds sterling. On a menu priced in USD, EUR, or any other currency, Claude applies the budget constraint against `£X` while the wine list shows prices in a different currency, rendering the budget filter meaningless or incorrect. The `ExtractedWine.currency` field defaults to `GBP` even for non-UK restaurants because the OCR prompt also defaults to `GBP` (`supabase/functions/ocr/index.ts:17`).

**Fix:** Pass the user's currency through the scan preferences payload. Use that currency symbol in the budget string, and update the OCR prompt to infer currency from the menu's price format.

---

### MEDIUM — Outdated model ID in both Edge Functions
**Files:** `supabase/functions/ocr/index.ts:58,66` and `supabase/functions/recommend/index.ts:170`

Both functions specify `model: 'claude-opus-4-6'`. The current Opus model is `claude-opus-4-8`. Using a deprecated or non-latest model ID may result in slower responses, higher latency, or unexpected behaviour as older model versions age out.

**Fix:** Update both functions to `model: 'claude-opus-4-8'`.

---

### LOW — Wine-Searcher response field mapping is speculative
**File:** `supabase/functions/wine-searcher-proxy/index.ts:57–63`

```ts
const pricing = {
  averageMarketPrice: wsData.price_avg ?? null,  // comment: "adjust once you have API access"
  minPrice: wsData.price_min ?? null,
  ...
};
```

The comment in the code explicitly acknowledges these field names are guesses. If the actual Wine-Searcher API response uses different keys (e.g., `average_price`, `min_price`), all pricing fields will silently return `null`. The cache will then store nulls, and subsequent cache hits will serve nulls indefinitely until entries expire after 7 days. There is no validation that the response contains the expected fields before caching.

**Fix:** Once actual API access is available, validate the response shape (e.g., with Zod) and throw if required fields are missing, rather than silently writing nulls to the cache.

---

## UX and Performance Issues

### HIGH — History cards are tappable but do nothing
**File:** `app/(tabs)/history.tsx:64`

```tsx
<TouchableOpacity style={styles.card}>
```

Each history card is wrapped in `TouchableOpacity` with no `onPress` handler. Tapping a card produces the standard opacity feedback, implying it is interactive, but nothing happens. Users attempting to re-read a past recommendation will be confused.

**Fix:** Either remove `TouchableOpacity` (replace with `View`) until a detail screen exists, or add an `onPress` that navigates to a detail view or re-populates the scan store with the historical recommendation.

---

### MEDIUM — History query error falls silently into empty state
**File:** `app/(tabs)/history.tsx:12–24`

The `useQuery` call for `scan_sessions` does not check `isError`. If the query fails (Supabase returns an error, network is offline), `sessions` is `undefined`, `isLoading` is `false`, and the component renders "No scans yet". A user who has many past scans but is offline will see an empty state with no indication that something went wrong.

**Fix:** Destructure `isError` from `useQuery` and render a distinct error state (e.g., "Couldn't load your history. Check your connection.") when `isError` is true.

---

### MEDIUM — "Continue without account" doesn't persist guest state
**File:** `app/(auth)/sign-in.tsx:48–50`

```tsx
<TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)/scan')}>
  <Text style={styles.guestText}>Continue without account</Text>
</TouchableOpacity>
```

The sign-in screen allows continuing as a guest, but does not call `AsyncStorage.setItem('hasLaunched', 'true')`. The welcome screen's "Start Scanning" button (`app/welcome.tsx:8`) does set this flag. If a user navigates welcome → sign-in → "Continue without account", the flag is never set and they will be shown the welcome screen again on next app launch.

**Fix:** Add `await AsyncStorage.setItem('hasLaunched', 'true')` to this `onPress` handler before navigating.

---

### MEDIUM — Email update has no client-side format validation
**File:** `app/(tabs)/profile.tsx:110–111`

```ts
async function handleEmailChange() {
  if (!newEmail.trim()) return;
  // calls supabase.auth.updateUser immediately
```

Only emptiness is checked before making the API call. Submitting `"not-an-email"` sends a request to Supabase which returns an error message such as `"unable to validate email address: invalid format"`. This appears as a generic `Alert.alert` rather than inline validation. The keyboard is also dismissed by the alert, requiring the user to re-tap the input.

**Fix:** Add a simple regex check (e.g., `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) before the API call and show an inline error rather than a modal alert.

---

### LOW — Duplicate "may take a minute or two" text during recommending stage
**File:** `app/scan/extracting.tsx:145–153`

When `stage === 'recommending'`, the component renders:
- Line 147: `'This could take a minute or two'` (inside the generic `body` text)
- Line 150: `<Text style={styles.body}>This may take a minute or two</Text>` (inside the `recommending` block)

Both lines are visible simultaneously, producing duplicate copy on screen.

**Fix:** Move the stage-specific body text (`'Scoring by critic rating…'`) out of the unconditional render block, or conditionally swap between the two strings instead of appending.

---

### LOW — Tab bar background missing from layout
**File:** `app/(tabs)/_layout.tsx:8–12`

```ts
tabBarStyle: { borderTopColor: colors.border },
```

The `tabBarStyle` sets only `borderTopColor` with no `backgroundColor`. On iOS this results in the tab bar using a translucent system default that may not match the dark `colors.background` used elsewhere in the app. On Android the default white background will clash visibly with the dark theme.

**Fix:** Add `backgroundColor: colors.background` to `tabBarStyle`.

---

## Navigation Issues

### MEDIUM — `/scan/url` is an unimplemented stub
**File:** `app/scan/url.tsx`

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The entire screen is a redirect back to the scan tab. This route is registered in the filesystem router and is reachable but does nothing. The OCR Edge Function does accept a `url` parameter (`supabase/functions/ocr/index.ts:50–63`), suggesting URL-based scanning was planned but the screen was never implemented.

**Fix:** Either implement URL input and extraction, or delete the file to prevent the route from existing in the router until it is ready.

---

### LOW — History detail view is a dead-end with no back navigation path
**File:** `app/(tabs)/history.tsx:64`

There is no route for viewing the details of a past scan (`/scan/history/:id` or similar). History cards have a tappable affordance but no destination. Combined with the missing `onPress` noted in the UX section above, there is currently no way for users to revisit a previous recommendation. The `ScanSession.recommendation` field is stored in the database, so the data is available — it is only the UI path that is missing.

**Fix:** Add a detail route (e.g., `app/scan/history/[id].tsx`) that loads a session by ID and renders the existing `ResultsScreen`-style layout using the stored recommendation. Link to it from the history card's `onPress`.
