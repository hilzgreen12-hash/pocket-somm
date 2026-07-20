# Code Review — 2026-05-23

Reviewed by: automated review agent  
Scope: full codebase — bugs/crashes, Supabase/Edge Functions, UX, navigation  
Note: no application code was changed between 2026-05-22 and 2026-05-23. All findings from the previous report persist. New findings are marked **[NEW]**.

---

## Bugs and Crashes

### High

**1. `app/onboarding.tsx:38,47` — Preferences silently lost on save failure; navigation fires before write completes**

```ts
updatePreferences({ wineTypes, styleProfiles, ... }); // fire-and-forget
router.replace('/(tabs)/scan');                        // fires immediately
```

`updatePreferences` is `mutation.mutate` (fire-and-forget), not `mutateAsync`. `router.replace` is called unconditionally on the next line regardless of whether the Supabase upsert succeeded or failed. The `mutationFn` in `usePreferences` does not throw on Supabase errors (see Bug #9), so `onError` never fires and the user receives no feedback that their data was not saved.

Fix: use `mutation.mutateAsync(...)` (after fixing Bug #9) and navigate only inside `onSuccess`.

---

**2. `app/_layout.tsx` — No error boundary; any render crash kills the entire app**

There is no `ErrorBoundary` anywhere in the layout tree. An uncaught render error in any screen crashes the app to a raw red stack trace. Expo Router supports an exported `ErrorBoundary` from `app/_layout.tsx`.

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

`RecommendInput` (defined at `src/services/recommender.ts:5–15`) requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. All five are absent; TypeScript permits this because the values resolve as `undefined`. The Edge Function silently treats all five as empty/no-preference. This screen is also orphaned from the main navigation flow (see Navigation Issues #5), but remains in the route tree and is reachable via deep link.

---

**4. `app/scan/results.tsx`, `app/scan/extracting.tsx`, `app/(tabs)/history.tsx` — No scan session is ever written to Supabase; history is permanently empty for all users**

The `scan_sessions` table is defined at `supabase/migrations/001_initial_schema.sql:16–25` and queried at `app/(tabs)/history.tsx:16–24`. No code anywhere in the app inserts or upserts into `scan_sessions`. After every scan, `setRecommendation(recommendation)` (extracting.tsx:116) and `router.replace('/scan/results')` (extracting.tsx:117) are called, but the recommendation is never persisted. Every user's history tab shows "No scans yet" regardless of how many scans they have performed.

Fix: after line 116 in `app/scan/extracting.tsx`, insert a `scan_sessions` row with `user_id`, `extracted_wines`, `recommendation`, and `preferences_snapshot`.

---

**5. [NEW] `src/hooks/useAuth.tsx:17` — `getSession()` has no `.catch()`; network failure leaves app permanently stuck on loading**

```ts
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
// no .catch() — if the promise rejects, setLoading(false) is never called
```

If `getSession()` rejects (DNS failure, timeout, Supabase outage), the promise silently swallows the rejection. `loading` stays `true` forever; `app/index.tsx:16` returns `null`, which combined with `SplashScreen.preventAutoHideAsync()` in `_layout.tsx:10` means the splash screen never hides and the app appears frozen. Users have no recovery path other than force-quitting.

Fix:
```ts
supabase.auth.getSession()
  .then(({ data }) => setSession(data.session))
  .catch(() => {})
  .finally(() => setLoading(false));
```

---

### Medium

**6. `app/index.tsx:20` — `preferences === null` does not match `undefined`; new authenticated users bypass onboarding**

```tsx
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```

React Query returns `undefined` (not `null`) while a query is loading. When an authenticated user's session resolves, the preferences query is still in-flight and `preferences` is `undefined`. The `=== null` check is false, so the component immediately redirects to `/(tabs)/scan`. New users who have just confirmed their email and have no profile row skip onboarding entirely.

Fix: `if (loading || hasLaunched === null || (session && preferences === undefined)) return null;`

---

**7. `app/scan/results.tsx:23–25` — `router.replace` called synchronously in the render body**

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace` directly in the render body (not in a `useEffect`) mutates navigation state during the render phase. This can produce "Cannot update a component from inside the function body of a different component" warnings or a silent no-op, leaving the user on a blank screen with no back navigation.

Fix: `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

---

**8. `app/(tabs)/history.tsx:71` — Accesses `recommendation.topPick` which does not exist on `RecommendationResponse`**

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (defined at `src/types/wine.ts:50–53`) has `wines: WineRecommendation[]`, not a `topPick` property. This expression is always falsy and the top recommendation name is never shown on history cards even if a recommendation exists.

Fix: `item.recommendation?.wines?.[0]?.name`.

---

**9. `src/hooks/usePreferences.ts:38–47` — Supabase upsert errors are silently swallowed; mutation always appears to succeed**

```ts
mutationFn: async (updates: Partial<UserPreferences>) => {
  if (!session) return;
  await supabase.from('profiles').upsert({ ... });
  // no error check — returns undefined regardless of success or failure
},
```

`supabase.from(...).upsert(...)` returns `{ data, error }`. If the upsert fails (RLS violation, constraint error, network failure), the function ends without throwing. `onSuccess` fires and invalidates the cache, `onError` is never called, and the user receives no feedback. Affects every preference write: onboarding, scan tab, profile tab.

Fix: `const { error } = await supabase.from('profiles').upsert({...}); if (error) throw error;`

---

**10. `app/scan/camera.tsx:29–98` — `handleCapture` is async with no try/catch; hardware failures leave UI frozen**

`handleCapture` calls `cameraRef.current.takePictureAsync()` and two `ImageManipulator.manipulateAsync()` calls, all of which can throw (hardware error, storage full, permission revoked mid-session). No `try/catch` exists. A thrown error produces an unhandled promise rejection and leaves the user frozen on the camera screen with no feedback and no escape route.

Fix: wrap the body of `handleCapture` in `try/catch` and navigate to `/(tabs)/scan` with a toast on failure.

---

**11. `app/scan/camera.tsx:15` — `focusPoint` state is set by tap but never applied to the camera**

```tsx
const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);
...
function handleTap(event: ...) {
  setFocusPoint({ x, y }); // never passed to CameraView
}
```

`focusPoint` is never passed to `CameraView` as a prop. The camera does not change focus when the user taps. Users tap the screen, observe nothing happening, and assume the camera is broken.

Fix: pass `focusPoint` to the appropriate `CameraView` focus prop, or remove the dead `handleTap`/`focusPoint` code entirely.

---

**12. `app/(tabs)/scan.tsx:86–101` — `handleScreenshot` has no try/catch; unhandled rejection on picker failure**

```ts
async function handleScreenshot() {
  const result = await ImagePicker.launchImageLibraryAsync({ ... });
  ...
}
```

`launchImageLibraryAsync` can throw if permissions are revoked or if the picker crashes on certain devices. Without a `try/catch`, this is an unhandled promise rejection with no user feedback.

---

### Low

**13. `src/services/recommender.ts:75–82` — Diversity retry falls back to the original duplicate-grape result without logging**

```ts
const raw2 = await callRecommend({ ...input, _strictDiversity: true });
const parsed2 = RecommendationResponseSchema.safeParse(raw2);
if (parsed2.success) return parsed2.data;
// falls through to return parsed.data — the original duplicate response
```

If the retry also fails validation, the function silently returns `parsed.data` — the original response containing duplicate grape varieties. No error is thrown or logged. The user receives a result that violates the diversity constraint with no indication.

---

**14. [NEW] `src/api/claude.ts:17` — `JSON.parse(text)` has no try/catch; gateway-level errors will throw uncaught**

```ts
const text = await res.text();
if (!res.ok) throw new Error(`${name} error ${res.status}: ${text}`);
return JSON.parse(text); // throws SyntaxError if Supabase/gateway returns HTML
```

The `!res.ok` guard only fires on non-2xx responses. If a Supabase infrastructure error returns a 200-status HTML error page (which gateway proxies can do), `JSON.parse` throws a `SyntaxError` that is not caught here. This propagates as an unhandled exception to the calling screen. Separately, the Edge Functions themselves also use `JSON.parse` without try/catch at `supabase/functions/ocr/index.ts:89` and `recommend/index.ts:185`.

Fix: wrap `JSON.parse(text)` in a try/catch and throw a descriptive error if parsing fails.

---

**15. [NEW] `src/types/preferences.ts:7` — `defaultCurrency` field in `UserPreferences` is never stored, fetched, or used**

```ts
export interface UserPreferences {
  ...
  defaultCurrency: string;  // no corresponding DB column, never read or written
  ...
}
```

The `profiles` table has no `default_currency` column. `usePreferences.ts` never selects or upserts it. The field is declared in the interface but is dead code. Any code that reads `preferences.defaultCurrency` (if added in future) will always get `undefined` at runtime despite the type saying `string`.

Fix: remove the field from the interface, or add the column to the schema and wire it up in `usePreferences`.

---

## Supabase and Edge Function Issues

### High

**1. [NEW] `supabase/functions/ocr/index.ts:51` — SSRF: client-supplied URL is fetched server-side with no validation**

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

The `url` value comes directly from the client request body with no validation. Because the OCR function has no authentication check (the anon key alone is sufficient to invoke it), any party can use this endpoint to make the Deno function fetch arbitrary URLs — including Supabase internal service endpoints (`http://supabase_kong_...`), the metadata service, or other RFC-1918 addresses reachable from the function's network. This is a Server-Side Request Forgery (SSRF) vulnerability.

Fix: validate that `url` matches an allowed scheme (`https://` only) and optionally an allowlist of known restaurant hosting domains. At minimum, reject `http://`, `file://`, and private IP ranges before fetching.

---

### Medium

**2. `src/api/claude.ts:7–14` — OCR and recommend Edge Function calls omit the user's Authorization header**

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
  // no Authorization: Bearer <token>
},
```

The `invokeFunction` helper sends only the anon key. The Edge Functions receive no JWT, cannot identify the calling user, and cannot enforce per-user rate limiting or audit trails. Any party who obtains the public anon key can invoke Claude-backed functions without limit. `src/api/wine-searcher.ts` correctly uses `supabase.functions.invoke()` which attaches the session JWT automatically.

Fix: replace the raw `fetch` in `invokeFunction` with `supabase.functions.invoke()`.

---

**3. `supabase/migrations/001_initial_schema.sql:33–44` — `pricing_cache` table has no RLS policy**

`profiles` and `scan_sessions` have RLS enabled and policies defined. `pricing_cache` does not — no `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY` or policy exists. Any authenticated or anonymous client can read all cached pricing records directly via the Supabase REST API, bypassing the Edge Function proxy. The proxy uses the service role key to write; there is no constraint on direct client reads or inserts.

Fix: add `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY;` with a policy that denies all direct client access (reads and writes are service-role only).

---

**4. `supabase/functions/recommend/index.ts:139` — Budget currency hardcoded as GBP regardless of wine list currency**

```ts
`- Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```

The budget is always described to the model with a `£` symbol regardless of the wine list's actual currency. If the restaurant prices wines in USD or EUR, the model is asked to compare a GBP budget against differently-denominated prices, producing incorrect budget filtering. The `currency` field is present in `ExtractedWine` (defaulting to `'GBP'`) but is never used to localise the budget prompt.

Fix: derive the currency from the extracted wines array (e.g. `wines[0]?.currency ?? 'GBP'`) and use it in the budget prompt.

---

**5. `supabase/functions/ocr/index.ts:87` and `recommend/index.ts:184` — Greedy regex extracts oversized JSON when model appends trailing text**

```ts
const match = text.match(/\{[\s\S]*\}/);
```

This greedy pattern matches from the first `{` to the last `}`. If the model appends commentary after the JSON object containing a `}` character, the extracted substring is malformed and `JSON.parse` throws. Both functions use the identical pattern.

Fix: attempt `JSON.parse` on the model's full text first; if that fails, try extracting the first balanced `{...}` block, not the greedy max-extent match.

---

### Low

**6. `supabase/migrations/001_initial_schema.sql:20` — `scan_sessions.user_id` has no NOT NULL constraint**

```sql
user_id uuid references auth.users(id) on delete cascade,
```

`user_id` is nullable. A row with `user_id = null` satisfies the FK (null does not violate referential integrity in PostgreSQL) but is never returned by the RLS policy (`auth.uid() = user_id` evaluates to NULL when `user_id` is NULL), creating orphaned rows with no recovery path.

Fix: `user_id uuid NOT NULL references auth.users(id) on delete cascade`.

---

**7. `supabase/functions/wine-searcher-proxy/index.ts:1` — Missing env var causes silent all-null response**

```ts
const WINE_SEARCHER_API_KEY = Deno.env.get('WINE_SEARCHER_API_KEY')!;
```

If the deployment secret is absent, the variable is `undefined`. The downstream fetch returns a 401; the catch block returns HTTP 200 with all-null pricing, and the caller cannot distinguish "key missing" from "wine not found in database."

Fix: guard at startup: `if (!WINE_SEARCHER_API_KEY) return new Response(JSON.stringify({ error: 'WINE_SEARCHER_API_KEY not configured' }), { status: 500 });`

---

**8. `supabase/functions/ocr/index.ts:59` — OCR function uses `claude-opus-4-6` for structured image parsing**

Structured field extraction against a fixed schema does not require Opus-level reasoning. Switching the OCR function to `claude-haiku-4-5-20251001` would substantially reduce per-scan cost with negligible quality impact given the explicit JSON-only output instruction. `recommend/index.ts:170` correctly uses Opus for the complex multi-factor ranking task; OCR does not need the same model tier.

---

## UX and Performance Issues

### High

**1. `app/(tabs)/history.tsx` — History tab always shows "No scans yet" because nothing writes to `scan_sessions`**

Covered in Bugs #4. From the user's perspective this is a feature that appears to work (the UI renders correctly, loading state shows, empty state shows) but has never functioned for any user since launch. The tab communicates broken trust.

---

### Medium

**2. `app/(tabs)/history.tsx:64` — History cards appear tappable but have no `onPress` handler**

```tsx
<TouchableOpacity style={styles.card}>
```

No `onPress` is wired. The component provides a visual press response (opacity change) implying navigation, but nothing happens. Users who tap a card expecting to see the full recommendation encounter a silent dead-end.

Fix: navigate to a detail view, or replace `TouchableOpacity` with `View` until that view exists.

---

**3. `app/scan/extracting.tsx:143–152` — Duplicate "may take a minute" copy renders simultaneously during recommending stage**

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

When `stage === 'recommending'`, both "Scoring by critic rating…" and "This may take a minute or two" are visible simultaneously as separate stacked text elements.

Fix: remove lines 150–152 (the second conditional `<Text>` block).

---

**4. `src/components/results/WineRecommendationCard.tsx` — Component is dead code; `results.tsx` renders an inline accordion instead**

`WineRecommendationCard` (`src/components/results/WineRecommendationCard.tsx:1–196`) is not imported or used anywhere in the codebase. `app/scan/results.tsx` renders recommendation cards inline, and that inline version omits the `PricingBadge` that the component includes. Two divergent implementations exist simultaneously.

Fix: migrate `results.tsx` to use `WineRecommendationCard`, or delete the component file.

---

**5. [NEW] `app/(tabs)/history.tsx:39–45` — Loading and empty states have no `backgroundColor`; may flash white on Android**

```tsx
if (isLoading) {
  return (
    <View style={styles.center}>   // styles.center has no backgroundColor
      <Text style={typography.body}>Loading history…</Text>
    </View>
  );
}
```

`styles.center` has no `backgroundColor` property. On Android, unmounted views without a background color may briefly render white before the OS composites them, producing a flash inconsistent with the app's dark terracotta background. `styles.guestContainer` correctly sets `backgroundColor: colors.background` but the loading/empty states do not.

Fix: add `backgroundColor: colors.background` to `styles.center` and `styles.emptyTitle`'s parent.

---

**6. `app/(tabs)/profile.tsx` — Each individual preference change fires an immediate Supabase upsert with no debounce**

The profile tab calls `updatePreferences(...)` directly in `onChange` callbacks for `WineTypePicker`, `ChipPicker`, and `StylePicker`. Rapid changes (toggling several chips quickly) queue multiple concurrent upserts to the same row. Since each upsert is a full profile write executed in parallel, a slower earlier write arriving after a later write silently overwrites the user's most recent change.

Fix: debounce preference writes by at least 500ms, or collect changes and submit with a single "Save" button.

---

**7. `app/scan/extracting.tsx:153` — "Please don't leave this page" warning is permanently visible and overstated**

```tsx
<Text style={styles.stayNote}>Please don't leave this page while we're searching</Text>
```

The app handles navigation away gracefully (the `token.active` cancellation check prevents stale updates). The warning overstates the consequences and is more alarming than necessary for what is actually a recoverable action.

---

**8. `app/scan/url.tsx:1–5` — URL-based wine list scanning is implemented in the Edge Function but permanently unreachable**

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

`supabase/functions/ocr/index.ts:49–63` contains a complete URL-fetching path with HTML stripping. The `/scan/url` route immediately redirects users away. The backend feature is fully built and completely inaccessible.

---

**9. [NEW] `src/components/preferences/ChipPicker.tsx:19–21` — `useEffect` syncs from parent on every reference change; causes unnecessary re-renders**

```ts
useEffect(() => {
  setLocal(selected);
}, [selected]);
```

`selected` is typically a new array reference on every parent render (e.g. `preferences?.favouriteRegions ?? []` always creates a new `[]` when the value is null). Each re-render of the profile tab triggers this effect and causes `ChipPicker` to call `setLocal`, forcing a re-render of every chip option even when the values have not changed.

Fix: use a deep-equality comparison before calling `setLocal`, or move the state management to the parent and pass `selected` directly without internal duplication.

---

### Low

**10. `src/components/scan/CameraOverlay.tsx:4–6` — Frame dimensions computed at module load; does not update on screen size changes**

```ts
const { width } = Dimensions.get('window');
const FRAME_WIDTH = width * 0.9;
const FRAME_HEIGHT = FRAME_WIDTH * 1.4;
```

These are module-level constants evaluated once when the module is first imported. An orientation change or iPad split-screen would leave the overlay frame mis-sized relative to the actual camera preview. Low impact given current portrait-only configuration.

---

## Navigation Issues

### Medium

**1. `app/index.tsx:20` — New authenticated users are redirected to `/(tabs)/scan` instead of `/onboarding`**

Covered in Bugs #6. A newly registered user who confirms their email is immediately sent to the scan tab. Their profile row does not exist, and all preference reads fall back to empty arrays for the session's lifetime.

---

**2. `app/scan/results.tsx:23–25` — `router.replace` called synchronously in the render body**

Covered in Bugs #7. When `recommendation` is null (e.g. direct deep-link to `/scan/results`), the navigation attempt fires during the render phase, which Expo Router may silently ignore, leaving the user on a blank screen with no back navigation.

---

**3. `app/scan/camera.tsx` and `app/scan/extracting.tsx` — No cancel button in camera or loading screens**

Neither screen provides a visible control to cancel and return to the scan tab. The only exit during camera use or a long extraction is the OS back gesture (Android swipe, iOS edge swipe). The extracting screen's error state renders a "Try Again" button but the loading state has no corresponding cancel affordance.

Fix: add a `×` or "Cancel" button to both screens that calls `reset()` and `router.replace('/(tabs)/scan')`.

---

**4. `app/scan/preferences.tsx` — Orphaned route registered in the router with no navigation path to it**

`/scan/preferences` is not navigated to from any screen in the current flow, but remains as a registered route reachable via deep link. When reached, it fires `recommendWines` with five missing fields (Bugs #3).

Fix: delete `app/scan/preferences.tsx`, or add a guard that redirects to `/(tabs)/scan` when `extractedWines` is null.

---

**5. `app/(tabs)/_layout.tsx:14–16` — No `tabBarIcon` configured on any tab**

```tsx
<Tabs.Screen name="scan" options={{ title: 'Scan' }} />
<Tabs.Screen name="history" options={{ title: 'History' }} />
<Tabs.Screen name="profile" options={{ title: 'Profile' }} />
```

The tab bar shows text-only labels. On iOS, the system renders default placeholder icons. On Android, text-only tab bars look unpolished. No icons are configured.

---

*End of report.*
