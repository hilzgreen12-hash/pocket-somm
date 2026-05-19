# Automated Code Review — 2026-05-19

> Issues carried forward from previous reviews (unresolved as of 2026-05-18) are marked **[UNRESOLVED]**.
> New findings discovered in this review are marked **[NEW]**.

---

## Bugs and Crashes

### HIGH — `app/scan/results.tsx:22–24` — `router.replace` called during render [UNRESOLVED]

```ts
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

`router.replace` is called synchronously in the component body, not inside a `useEffect`. This is a side effect during the React render phase and triggers "Cannot update a component while rendering a different component." If `useScanStore`'s `reset()` nulls `recommendation` while the results screen is still mounted, this becomes a crash loop.

**Fix:** wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])` and return `null` under the same condition outside the effect.

**Severity: High**

---

### HIGH — `app/_layout.tsx:14–39` — No root error boundary [UNRESOLVED]

The entire app renders under `<AuthProvider>` and `<QueryClientProvider>` with no React `ErrorBoundary`. Any uncaught render exception — a null dereference in a results component, a malformed Claude response slipping past Zod, or a font resolution failure — crashes to a blank screen with no recovery path.

**Fix:** wrap the children of `RootLayout` in a custom `ErrorBoundary` class component that renders a "Something went wrong — tap to restart" fallback.

**Severity: High**

---

### HIGH — `src/api/claude.ts:7–18` — Edge functions called with anon key only; no user auth header [UNRESOLVED]

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
},
```

`EXPO_PUBLIC_SUPABASE_ANON_KEY` is public by construction and ships in the mobile bundle. Both OCR and recommend edge functions accept this key without a valid user JWT. Anyone who extracts the key can invoke `/functions/v1/ocr` and `/functions/v1/recommend` without an account, driving unbounded Anthropic API costs.

**Fix:** call `supabase.auth.getSession()` before each invocation, add `'Authorization': \`Bearer ${session.access_token}\`` to request headers, and reject requests without a valid JWT in both edge functions with a 401.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:49–54` — Server-Side Request Forgery via `url` parameter [UNRESOLVED]

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

The `url` parameter is fetched server-side with no domain allow-list and no RFC-1918 address rejection. Since the endpoint requires only the anon key (see above), anyone can supply `http://169.254.169.254/latest/meta-data/` to probe AWS/GCP metadata endpoints or internal Supabase infrastructure URLs.

**Fix:** validate that `url` uses `https:`, reject private IP ranges and localhost, and enforce a domain allow-list before issuing the fetch.

**Severity: High**

---

### HIGH — `supabase/functions/wine-searcher-proxy/index.ts:1–88` — No JWT authentication; callable with anon key [UNRESOLVED]

The wine-searcher-proxy edge function performs no JWT validation. It reads from and writes to the `pricing_cache` table using the service role key, meaning any caller who holds only the anon key can trigger real Wine-Searcher API requests (consuming paid API quota) and write arbitrary rows to the cache.

**Fix:** read the `Authorization` header at the top of the function, verify the JWT with Supabase's `auth.getUser()`, and return 401 if absent or invalid.

**Severity: High**

---

### HIGH — `app/(tabs)/history.tsx:71` — `recommendation.topPick` does not exist in `RecommendationResponse` [UNRESOLVED]

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (defined at `src/types/wine.ts:50–53`) has only `wines: WineRecommendation[]` and `summary: string`. There is no `topPick` property. This expression always evaluates to `undefined`, so the wine name line never renders on any history card.

**Fix:** replace `item.recommendation?.topPick` with `item.recommendation?.wines?.[0]` so the first (top-ranked) wine is displayed.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:58` and `supabase/functions/recommend/index.ts:170` — Both edge functions reference `claude-opus-4-6`, which does not match any current model ID [UNRESOLVED]

```ts
model: 'claude-opus-4-6',  // same in both functions
```

The current Opus model ID is `claude-opus-4-7`. The model `claude-opus-4-6` is a retired or non-existent identifier. If Anthropic's API rejects requests for this model ID, every OCR call and every recommendation call fails immediately, making the app completely non-functional for its core scanning feature.

**Fix:** update both edge functions to `claude-opus-4-7`. Verify the model ID against Anthropic's current model list before deploying.

**Severity: High**

---

### HIGH — `app/scan/extracting.tsx`, `app/scan/results.tsx`, `src/services/recommender.ts` — `scan_sessions` table is never written to; history is permanently empty [NEW]

The entire scan flow — `extracting.tsx` calling `extractWineList` then `recommendWines`, followed by `setRecommendation(recommendation)` and `router.replace('/scan/results')` — contains no code that inserts or upserts a row into the `scan_sessions` Supabase table. Neither edge function (`ocr/index.ts`, `recommend/index.ts`) performs any database write. The `ScanSession` type (`src/types/scan.ts`) and the `scan_sessions` table (`supabase/migrations/001_initial_schema.sql:15–26`) are fully defined, and `app/(tabs)/history.tsx` queries the table correctly, but there are zero rows ever written. Every authenticated user who completes a scan will see "No scans yet" on the History tab regardless of how many scans they perform.

**Fix:** after a successful recommendation in `extracting.tsx` (after line 116, before `router.replace`), insert a row into `scan_sessions` via Supabase client:
```ts
if (session?.user.id) {
  await supabase.from('scan_sessions').insert({
    user_id: session.user.id,
    extracted_wines: wines,
    recommendation,
    preferences_snapshot: preferences,
  });
}
```
Import `useAuth` and `supabase` in `extracting.tsx` to access the session and client.

**Severity: High**

---

### MEDIUM — `src/hooks/useAuth.tsx:17–19` — `getSession` rejection unhandled; app permanently blank on cold-start network failure [UNRESOLVED]

```ts
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

No `.catch()` handler. If `getSession` rejects — network unavailable at cold start, SecureStore locked, or the Supabase project paused — `setLoading(false)` is never called. `loading` stays `true` forever, `app/index.tsx:16` returns `null` indefinitely, and the user sees a blank screen with no recovery path.

**Fix:** add `.catch(() => setLoading(false))`, or rewrite as `async/await` with `finally { setLoading(false) }`.

**Severity: Medium**

---

### MEDIUM — `app/index.tsx:20` — New signed-in users bypass onboarding because `undefined !== null` [UNRESOLVED]

```ts
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

While the React Query fetch is in-flight, `preferences` is `undefined` (not `null`). The guard evaluates to `false`, so the user is immediately redirected to `/(tabs)/scan`. New users with no `profiles` row consistently lose this race and never reach onboarding.

**Fix:** export `isLoading` from `usePreferences`, import it in `index.tsx`, and add it to the early-return guard: `if (loading || hasLaunched === null || isLoading) return null`.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/scan.tsx:86–101` — `handleScreenshot` has no try/catch; unhandled rejection on storage permission revocation [UNRESOLVED]

```ts
async function handleScreenshot() {
  const result = await ImagePicker.launchImageLibraryAsync({ ... });
  ...
}
```

`launchImageLibraryAsync` throws on certain Android versions when storage permission is revoked mid-session or the OS kills the picker activity. There is no `try/catch`, so the rejection propagates unhandled. The UI is left in a stuck state with no feedback.

**Fix:** wrap the body of `handleScreenshot` in `try/catch` and show an `Alert` on failure.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:130–133` — `handleSignOut` ignores the error result; user is redirected even if sign-out fails [UNRESOLVED]

```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

`signOut()` can fail on network errors. The error is silently discarded and the app navigates to sign-in regardless. The session token remains in SecureStore; on next launch `getSession()` restores it and the user appears signed in again.

**Fix:** destructure `{ error }` from `signOut()` and alert the user if the call fails, keeping them on the profile screen.

**Severity: Medium**

---

### MEDIUM — `app/onboarding.tsx:38+47` — `updatePreferences` called fire-and-forget then immediately `router.replace`; save failure is invisible [UNRESOLVED]

```ts
function handleNext() {
  if (isLast) {
    updatePreferences({ wineTypes, styleProfiles, ... }); // mutation.mutate — async, no await
    router.replace('/(tabs)/scan');                        // fires immediately
  }
}
```

`mutation.mutate` is a fire-and-forget call. `router.replace` executes in the same synchronous frame before the Supabase upsert can complete or fail. If the network request fails, the `onError` callback fires after the user has already navigated away with no indication their preferences were not saved.

**Fix:** use `mutation.mutateAsync` (or the `onSuccess`/`onError` callbacks) to defer navigation until the save completes. Only call `router.replace` inside `onSuccess`.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:113` — Email change `redirectTo` points to a non-existent route [UNRESOLVED]

```ts
const redirectTo = Linking.createURL('auth/callback');
const { error } = await supabase.auth.updateUser(
  { email: newEmail.trim() },
  { emailRedirectTo: redirectTo },
);
```

`Linking.createURL('auth/callback')` produces a deep link like `pocket-somm://auth/callback`. No file exists at `app/auth/callback.tsx` or `app/(auth)/callback.tsx`. When the user taps the confirmation link in their email, the app opens but expo-router cannot resolve the route. The email change may succeed server-side but the user receives no in-app confirmation.

**Fix:** create `app/auth/callback.tsx` that reads the Supabase session from the URL params and shows an "Email updated" confirmation screen, or use a web-based `redirectTo` URL that doesn't require the app to handle it.

**Severity: Medium**

---

### MEDIUM — `app/scan/camera.tsx:29–99` — `handleCapture` has no try/catch; unhandled rejection on camera or disk failure [UNRESOLVED]

```ts
async function handleCapture() {
  if (!cameraRef.current) return;
  await Haptics.impactAsync(...);
  const photo = await cameraRef.current.takePictureAsync({ ... });
  const normalised = await ImageManipulator.manipulateAsync(uri, [], { ... });
  const cropped = await ImageManipulator.manipulateAsync(normalised.uri, [...], { ... });
}
```

`takePictureAsync` can throw on hardware error or when disk space is exhausted. `ImageManipulator.manipulateAsync` can throw if the source URI is invalid after normalisation. Neither call is wrapped in try/catch. An unhandled rejection leaves the camera screen frozen with no user feedback.

**Fix:** wrap the full body of `handleCapture` (after the null guard) in a `try/catch`, show an `Alert` on failure, and reset capture state.

**Severity: Medium**

---

### LOW — `app/index.tsx:13` — `AsyncStorage.getItem` rejection unhandled; app permanently blank if storage is unavailable [UNRESOLVED]

```ts
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```

No `.catch()` handler. If AsyncStorage rejects, `setHasLaunched` is never called. `hasLaunched` stays `null` forever and the guard at `index.tsx:16` never clears, leaving the user on a blank screen.

**Fix:** add `.catch(() => setHasLaunched(false))` so the app defaults to first-launch flow on storage failure.

**Severity: Low**

---

### LOW — `app/scan/results.tsx:50` — No empty-wines guard; empty wines array renders a content-free screen [UNRESOLVED]

```tsx
{recommendation.wines.map((wine, i) => ...)}
```

`RecommendationResponseSchema` at `src/services/recommender.ts:55–58` applies `.max(3)` but no `.min(1)` on the wines array. If Claude returns `{"wines": [], "summary": "..."}` (possible when budget constraints filter out every wine on the list), validation passes and `results.tsx` renders a header, a score note, and a "Start Another Search" button with no wine cards and no explanatory message.

**Fix:** add a guard: `if (!recommendation.wines.length)` render "No wines matched your preferences — try relaxing your budget or filters" above the button.

**Severity: Low**

---

### LOW — `src/services/recommender.ts:75–82` — Silent fallback to duplicate-grape result when diversity retry also fails Zod validation [UNRESOLVED]

```ts
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data;
  // falls through to: return parsed.data (original duplicate-grape response)
}
return parsed.data;
```

When the retry also returns an invalid response, execution falls through and returns the original response with duplicate grape varieties with no log entry indicating both attempts failed.

**Fix:** add a `console.warn` when `!parsed2.success` so the retry failure is observable in Edge Function logs, and consider throwing rather than silently serving a degraded result.

**Severity: Low**

---

## Supabase and Edge Function Issues

### HIGH — `supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` — No JWT authentication [UNRESOLVED]

Neither edge function reads or validates an `Authorization` header. The functions are effectively public APIs gated only by the anon key, which ships in the mobile bundle. See the matching `src/api/claude.ts` entry in Bugs and Crashes for full context.

**Fix:** add an `Authorization: Bearer <jwt>` check at the top of each function using Supabase's `createClient` with the request JWT. Return 401 if the token is absent or invalid.

**Severity: High**

---

### HIGH — `supabase/functions/wine-searcher-proxy/index.ts` — No JWT authentication [UNRESOLVED]

See the matching entry in Bugs and Crashes above.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:49–54` — SSRF via unsanitised `url` parameter [UNRESOLVED]

See the matching entry in Bugs and Crashes above.

**Severity: High**

---

### MEDIUM — `supabase/functions/wine-searcher-proxy/index.ts:48` — Wine-Searcher API key passed as a URL query parameter; exposed in server-side access logs [UNRESOLVED]

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&winename=${encodeURIComponent(wineName)}&vintage=${vintageParam}&format=json`;
```

The API key is embedded in the request URL. Any HTTP access log, CDN log, or network observability tool connected to the Supabase Edge Function runtime records the full URL including the key. If logs are exported to a third-party service, the key is exfiltrated.

**Fix:** check whether the Wine-Searcher API supports key delivery via a request header (e.g. `X-API-Key` or `Authorization`). If so, move the key out of the URL. If query-parameter delivery is mandatory, ensure log scrubbing is configured for the `api_key` parameter in all connected log pipelines.

**Severity: Medium**

---

### MEDIUM — `supabase/migrations/001_initial_schema.sql:36–43` — `pricing_cache` table has no RLS policy [UNRESOLVED]

```sql
create table pricing_cache (
  wine_key text primary key,
  ...
);
-- No: alter table pricing_cache enable row level security;
-- No policy defined
```

`profiles` and `scan_sessions` both have RLS enabled and scoping policies. `pricing_cache` has neither. PostgREST exposes the table to the `anon` role, allowing any caller with the anon key to `SELECT` all cached pricing data or `INSERT`/`UPDATE` rows to poison the cache with false pricing.

**Fix:** add `alter table pricing_cache enable row level security;` and a restrictive policy granting access only to `service_role`, since this table is only accessed from the wine-searcher-proxy edge function.

**Severity: Medium**

---

### MEDIUM — `supabase/functions/recommend/index.ts:139` — Budget currency hardcoded as `£`; breaks for non-GBP users [UNRESOLVED]

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle...`
```

The prompt unconditionally uses `£` regardless of the user's currency. A user with a $100 budget receives `£100` in the prompt sent to Claude. The OCR function also defaults currency to `'GBP'` when it cannot detect one from the menu.

**Fix:** pass the active currency code through the preferences payload and use it to format the budget line.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/history.tsx:13–25` — Query fetch error silently renders as "No scans yet" [UNRESOLVED]

`isError` is not destructured from the `useQuery` result. If the query fails (RLS rejection, network error, malformed response), `sessions` is `undefined` and `isLoading` is `false`. The component falls through to the `!sessions?.length` branch and renders "No scans yet" — indistinguishable from a legitimately empty history.

**Fix:** destructure `isError` and render a distinct error state (e.g. "Couldn't load your history — tap to retry") with a `refetch()` call on press.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:419–427` — `BudgetSlider.onChange` triggers a Supabase upsert on every slider drag step [UNRESOLVED]

```tsx
<BudgetSlider
  value={preferences?.defaultBudget ?? 100}
  onChange={(budget) => updatePreferences({ defaultBudget: budget })}
/>
```

`BudgetSlider` wires `onChange` directly to the Slider's `onValueChange` (`src/components/preferences/BudgetSlider.tsx:53`), which fires continuously as the user drags. With 51 discrete steps, dragging from one end to the other triggers up to 51 calls to `updatePreferences` → 51 Supabase `upsert` network requests in rapid succession. There is no debounce.

**Fix:** add a debounce (e.g. 400 ms using `useRef` + `clearTimeout`/`setTimeout`) in `BudgetSlider` around the `onChange` call, or use the Slider's `onSlidingComplete` callback instead of `onValueChange` for the database write.

**Severity: Medium**

---

### LOW — `src/api/claude.ts:1` — `supabase` import unused [UNRESOLVED]

```ts
import { supabase } from './supabase';
```

`supabase` is imported but never referenced anywhere in `claude.ts`. The file calls `fetch` directly instead. This is dead code and may cause confusion about whether the Supabase client is used for auth in these calls (it is not — see the anon-key-only issue above).

**Fix:** remove the unused import.

**Severity: Low**

---

### LOW — `src/hooks/usePreferences.ts:46–50` — Upsert failure is logged but never surfaced to the user [UNRESOLVED]

```ts
onError: (err) => console.error('[Preferences] Save error:', err),
```

`usePreferences` exposes `isSaving` but not `isError`. Profile changes silently fail on network error. The user sees no indication the save failed and the next session shows the previous values.

**Fix:** expose `isError` from the mutation and display a toast or alert on failure so the user knows to retry.

**Severity: Low**

---

### LOW — `app/scan/preferences.tsx:28–33` — `recommendWines` called without required `RecommendInput` fields [UNRESOLVED]

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes all absent
});
```

`RecommendInput` (defined at `src/services/recommender.ts:5–15`) requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. At runtime the edge function receives `undefined` for these fields and the entire saved taste profile is ignored for any scan initiated from this screen.

**Fix:** pass the missing fields from `usePreferences`, defaulting each to `[]` if null.

**Severity: Low**

---

## UX and Performance Issues

### MEDIUM — `app/(tabs)/history.tsx:39–53` — Loading and empty states render on wrong background in a dark-themed app [UNRESOLVED]

```tsx
if (isLoading) {
  return (
    <View style={styles.center}>           // no backgroundColor
      <Text style={typography.body}>Loading history…</Text>  // no color
    </View>
  );
}
```

`styles.center` does not set `backgroundColor`. When the loading or empty-authenticated state renders, the tab navigator's default (white/system) background shows through rather than `colors.background`. `typography.body` sets no `color`, leaving "Loading history…" black-on-white. Both states look visually broken compared to all other screens.

**Fix:** add `backgroundColor: colors.background` to `styles.center`, and add `color: colors.text` to the loading `Text` style.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/history.tsx:64` — History cards have no `onPress` handler; tapping does nothing [UNRESOLVED]

```tsx
<TouchableOpacity style={styles.card}>
```

The `TouchableOpacity` wrapping each history entry has no `onPress` prop. Users tap a card expecting to see their past recommendation but nothing happens. No detail route exists for individual scan sessions.

**Fix:** either add an `onPress` handler that navigates to a results detail screen, or replace `TouchableOpacity` with a `View` until the detail screen is built, so the tap affordance is not presented without an action.

**Severity: Medium**

---

### MEDIUM — `src/api/claude.ts:7–18` — No fetch timeout; spinner runs indefinitely if an edge function hangs [UNRESOLVED]

```ts
const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, { ... });
```

React Native's `fetch` has no default timeout. If an edge function call to Claude stalls — Claude API timeout, cold-start delay, Supabase infrastructure issue — the `extracting` screen displays its loading spinner forever. The user is instructed "Please don't leave this page" while waiting for a call that may never complete.

**Fix:** wrap `fetch` with an `AbortController` and a `setTimeout` (e.g. 90 s for OCR, 60 s for recommend) and throw a user-facing error if the timeout fires.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/scan.tsx:88–89` — No `selectionLimit` on image picker; unlimited parallel OCR calls [NEW]

```ts
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsMultipleSelection: true,
  quality: 1,
  // no selectionLimit
});
```

With `allowsMultipleSelection: true` and no `selectionLimit`, a user can select an unlimited number of images. Each selected image triggers a separate `extractWineList` call inside `Promise.all` in `extracting.tsx:77`. Selecting 20 photos fires 20 simultaneous Edge Function invocations, each making a separate Claude API call. There is no cost guard, rate-limit handling, or progress indication for multi-image batches.

**Fix:** add `selectionLimit: 5` (or another reasonable cap) to the `launchImageLibraryAsync` options. Additionally, implement sequential processing with progress feedback for multi-image batches rather than unbounded `Promise.all` parallelism.

**Severity: Medium**

---

### LOW — `app/(tabs)/scan.tsx:48` — "Continue without account" on sign-in does not set `hasLaunched`; welcome screen reappears on next cold start [UNRESOLVED]

```ts
onPress={() => router.replace('/(tabs)/scan')}
```

When a first-time user navigates to sign-in and taps "Continue without account", `hasLaunched` is never written to AsyncStorage. On the next cold start, `index.tsx:25` evaluates `hasLaunched === false` and redirects back to `/welcome`.

**Fix:** call `AsyncStorage.setItem('hasLaunched', 'true')` inside the handler, matching the behaviour of `welcome.tsx:handleGuest`.

**Severity: Low**

---

### LOW — `app/(auth)/sign-in.tsx:12–21` and `app/(auth)/sign-up.tsx:12–23` — No client-side validation before hitting Supabase [UNRESOLVED]

Both auth screens submit the form with no empty-field or email-format check. An empty email and password will fire a network request to Supabase, incur latency, and return a Supabase error string.

**Fix:** guard with `if (!email.trim() || !password.trim()) return;` before `setLoading(true)`.

**Severity: Low**

---

### LOW — `app/(tabs)/scan.tsx:24–31` — Preferences initialise from `undefined`; brief flash of empty defaults before saved values load [UNRESOLVED]

```ts
const [wineTypes, setWineTypes] = useState<WineType[]>(
  savedPreferences?.wineTypes ?? []
);
```

`savedPreferences` is `undefined` on first render (React Query not yet resolved). All three state values initialise to empty/null defaults, then the `useEffect` at line 59 fires once preferences arrive. Users with saved preferences see the accordion labels flash "e.g. Red Wine" and "e.g. Burgundy" before their selections appear.

**Fix:** initialise unconditionally to `[]`/`null` and let the existing `useEffect` handle the first application of saved preferences. Add a loading guard before rendering accordion content.

**Severity: Low**

---

### LOW — `app/(tabs)/profile.tsx:153` — Copy says "subscription email account"; implies a paid tier that does not exist [UNRESOLVED]

```tsx
<Text style={styles.emailLabel}>Change your subscription email account</Text>
```

The word "subscription" implies a paid product tier. This label is misleading — users may interpret it as referring to a newsletter or billing account rather than their auth login.

**Fix:** change copy to "Change email address" or "Update login email".

**Severity: Low**

---

### LOW — `app/scan/extracting.tsx:142–153` — Two duration warnings render simultaneously in the recommending stage [UNRESOLVED]

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

When `stage === 'recommending'`, the screen shows "Scoring by critic rating, vintage quality and value" immediately followed by "This may take a minute or two" — two consecutive body-level strings that clash in tone and appear redundant.

**Fix:** remove the separate `stage === 'recommending'` text block and consolidate: `'Scoring by critic rating, vintage quality and value — this may take a minute or two'`.

**Severity: Low**

---

### LOW — `app/scan/extracting.tsx:139–161` — No cancel button during extraction; users cannot abort a stuck operation [UNRESOLVED]

The extracting screen instructs users "Please don't leave this page" but provides no cancel/abort button. The `token` object prevents state updates after unmount but does not cancel the in-flight `fetch` calls. Combined with the missing fetch timeout, a user who wants to abort has no recourse other than force-quitting the app.

**Fix:** add a "Cancel" `TouchableOpacity` to the extracting screen that calls `router.replace('/(tabs)/scan')` and sets the abort token to inactive. Pass an `AbortController.signal` through `invokeFunction` so the underlying fetch is also cancelled when the user navigates away.

**Severity: Low**

---

## Navigation Issues

### MEDIUM — `app/scan/results.tsx:22–24` — Side-effecting navigation during render phase [UNRESOLVED]

See the full description in Bugs and Crashes above. Calling `router.replace` during render can also leave the navigation history stack in an inconsistent state, making the back gesture behave unexpectedly.

**Severity: Medium** (navigation aspect; crash risk rated High above)

---

### MEDIUM — `app/(tabs)/history.tsx:64` — Tapping a history card is a dead-end with no navigation target [UNRESOLVED]

See full description in UX and Performance above. No route exists for a scan session detail view; the `TouchableOpacity` presents a tap affordance that silently does nothing.

**Severity: Medium**

---

### LOW — `app/scan/url.tsx:1–5` — `/scan/url` is a silent redirect stub with no user feedback [UNRESOLVED]

```ts
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The route `/scan/url` immediately redirects to scan. The OCR edge function already supports URL-based extraction (`supabase/functions/ocr/index.ts:49`), so this feature is partially implemented but unrouted. If any in-app link or deep link targets `/scan/url`, the user is silently dropped on the scan screen with no explanation.

**Fix:** either remove the file so the route returns 404, or build the URL input screen. If planned, add a "Coming soon" placeholder.

**Severity: Low**

---

### LOW — `app/(tabs)/profile.tsx:182–184` — Back arrow uses `router.push` instead of `router.back()`; accumulates stack entries [UNRESOLVED]

```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

`router.push` adds a new Scan entry to the navigation stack rather than popping back to it. Repeated tapping accumulates stack entries. Replace with `router.back()` or `router.replace('/(tabs)/scan')`.

**Severity: Low**

---

### LOW — `app/(auth)/sign-in.tsx` — No route back to `/welcome`; first-time users who explore sign-in are stuck [UNRESOLVED]

The sign-in screen has a link to sign-up (line 52) but no back button and no link to `/welcome`. A first-time user who taps "Sign In" on the welcome screen to explore it cannot return without closing the app.

**Fix:** add a `router.back()` chevron to the sign-in header, or navigate to sign-in with `router.replace` from welcome so the hardware back button on Android returns to welcome.

**Severity: Low**

---

### LOW — `app/scan/preferences.tsx` — `/scan/preferences` route is unreachable in the current navigation flow [UNRESOLVED]

No screen in the codebase navigates to `/scan/preferences`. The current scan flow is: scan tab → camera/upload → preview → extracting → results. The `preferences.tsx` screen was superseded by the inline preference controls on the scan tab (`app/(tabs)/scan.tsx`), but the file was not removed. It also contains a `recommendWines` call that omits required fields (separate LOW finding above). The route exists in the router but is dead code.

**Fix:** remove `app/scan/preferences.tsx` or connect it to the navigation flow. If removed, also audit for any remaining references to `/scan/preferences`.

**Severity: Low**

---

## Summary

| Area | High | Medium | Low | Total |
|------|------|--------|-----|-------|
| Bugs and Crashes | 8 | 7 | 3 | 18 |
| Supabase / Edge Functions | 3 | 5 | 3 | 11 |
| UX and Performance | 0 | 4 | 6 | 10 |
| Navigation | 0 | 2 | 4 | 6 |
| **Total** | **11** | **18** | **16** | **45** |

**New this review (2 findings):**
- HIGH: `scan_sessions` table is never written to by any code in the scan flow — the History tab is permanently empty for all authenticated users, regardless of how many scans they perform. This is the most impactful new finding.
- MEDIUM: No `selectionLimit` on `ImagePicker.launchImageLibraryAsync` — a user can select unlimited photos, triggering unbounded parallel Edge Function and Claude API calls in a single action.

**Persistent critical items (High, 8+ reviews unresolved):** all three edge functions accept unauthenticated requests using only the public anon key; the OCR function is vulnerable to SSRF via the `url` parameter; the app has no root error boundary; `router.replace` is called during render in `results.tsx`; and `claude-opus-4-6` is a potentially invalid model ID in both OCR and recommend functions. The newly discovered scan session persistence gap means the History feature has never worked in production and represents a missing core functionality that should be addressed immediately alongside the security issues.
