# Code Review — 2026-06-01

Automated review of the full codebase: `app/`, `src/`, `supabase/functions/`, and `supabase/migrations/`.

---

## Bugs and Crashes

### High Severity

**1. New signed-in users bypass onboarding — `app/index.tsx:20` — High**

```tsx
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

`usePreferences` returns `undefined` (not `null`) while the React Query fetch is in flight. The guard `preferences === null` is only true after the query completes with no matching row. But the index route does not wait for the preferences query — it only waits for `loading` (auth) and `hasLaunched` (line 16). So for a newly signed-in user whose preferences haven't loaded yet, `preferences` is `undefined`, the null-check fails, and the fallthrough `<Redirect href="/(tabs)/scan" />` fires. New accounts never reach `/onboarding`. Fix: expose `isLoading` from `usePreferences` and add it to the loading guard on line 16.

**2. Schema missing columns that the app reads and writes — `supabase/migrations/001_initial_schema.sql:1-8` — High**

The `profiles` table as defined contains only `user_id`, `style_preferences`, `default_budget`, `created_at`, and `updated_at`. `src/hooks/usePreferences.ts:16` selects `default_wine_types`, `favourite_regions`, `favourite_grapes`, `disliked_regions`, and `disliked_grapes` — none of which exist in the schema. Supabase silently returns `undefined` for missing columns, so `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` are always `[]` regardless of what the user saves. The upsert on line 38 writes these same non-existent columns and silently discards the data. All hard exclusion preferences (regions and grapes to avoid) are permanently non-functional at the database level. A migration must add these columns before any other fix to this area is meaningful.

**3. `router.replace()` called synchronously during render — `app/scan/results.tsx:22-24` — High**

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

`router.replace()` triggers a navigation state update inside the render function. React 18 throws "Cannot update during an existing state transition" when this happens. The results screen crashes every time it is mounted without a recommendation in the store — this occurs after force-quitting and reopening the app with `/scan/results` in the navigation history. Fix: wrap the redirect in a `useEffect`.

**4. Preference saves fail silently — `src/hooks/usePreferences.ts:38` — High**

```tsx
await supabase.from('profiles').upsert({ ... });
```

The Supabase JS client returns `{ data, error }` — it does not throw on error. The `mutationFn` awaits the call and completes without inspecting the result, so React Query's `onError` handler (line 50) never fires. If the upsert fails due to a network error, RLS violation, or the column-name mismatch described above, the user sees the loading spinner disappear and assumes the save succeeded. Add `if (error) throw error;` immediately after the `upsert` call.

**5. `getSession()` rejection leaves the app permanently blank — `src/hooks/useAuth.tsx:16-19` — High**

```tsx
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

There is no `.catch()`. If `getSession()` rejects — due to a network failure or `SecureStore` error on cold boot — `setLoading(false)` is never called. `loading` stays `true` forever, `app/index.tsx:16` returns `null`, and the user sees a permanent blank screen with no way to recover without force-quitting. Add `.catch(() => setLoading(false))` to ensure the app always exits its loading state.

---

### Medium Severity

**6. History cards always show blank wine name — `app/(tabs)/history.tsx:71` — Medium**

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (defined in `src/types/wine.ts:50`) has a `wines: WineRecommendation[]` array and a `summary` string. There is no `topPick` property. The `as ScanSession[]` cast on line 23 suppresses the TypeScript error. At runtime `recommendation?.topPick` is always `undefined`, so no history card ever shows the top recommended wine. Fix: `item.recommendation?.wines?.[0]?.name`.

**7. `preferences.tsx` calls `recommendWines` with missing required fields — `app/scan/preferences.tsx:28-33` — Medium**

```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
});
```

`RecommendInput` (`src/services/recommender.ts:5-15`) requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. None are passed here. The edge function receives `undefined` for those fields. The hard exclusion rules (disliked regions, disliked grapes, colour filter) are silently skipped for any scan that goes through this screen.

**8. Camera capture errors are silently swallowed — `app/scan/camera.tsx:29-99` — Medium**

`handleCapture` is an `async` function called via `onPress` with no surrounding `try/catch` and no `.catch()` at the call site. If `cameraRef.current.takePictureAsync()` throws (e.g., camera interrupted, permissions revoked mid-session) or if either `ImageManipulator.manipulateAsync()` call throws, the error is an unhandled promise rejection. The camera screen shows no feedback, the button appears functional, and the user has no way to know the capture failed. Wrap the body of `handleCapture` in a `try/catch` and show an alert or reset state on failure.

---

### Low Severity

**9. `useEffect` in `extracting.tsx` has empty dependency array — `app/scan/extracting.tsx:60` — Low**

```tsx
useEffect(() => { ... run(token); ... }, []);
```

`run()` closes over `imageUri`, `imageUris`, `preferences`, and `userProfile`. These are correctly captured at mount and the screen is single-use, so this is not a runtime crash today. However, this will cause a spurious `react-hooks/exhaustive-deps` lint error that masks real violations elsewhere, and it would fail silently if this screen were ever kept alive across navigation.

**10. Duplicate-grape retry has no circuit-breaker — `src/services/recommender.ts:75-81` — Low**

When the recommendation returns wines with duplicate grape varieties, the service immediately retries once with `_strictDiversity: true`. If the wine list genuinely contains only a single grape variety (e.g., an all-Pinot-Noir list), the retry will also return duplicates. The original duplicate result is then returned silently anyway. The full second call to Claude Opus is wasted. Before retrying, check whether the deduplicated extracted wine list actually has enough distinct grape varieties to satisfy the diversity constraint.

**11. Pre-filter uses saved profile budget, not scan-time override — `app/scan/extracting.tsx:101` — Low**

```tsx
const winesForRecommend = preFilterWines(wines, userProfile);
```

`preFilterWines` uses `userProfile.defaultBudget` (the saved profile value). The scan-screen budget override in `useScanStore().preferences.budget` is not applied at this stage. If the user set a lower budget for this specific scan, wines above that budget are still forwarded to Claude, increasing prompt token usage. The recommend edge function does apply the scan-time budget as a hard rule, so results are correct — but the list sent to Claude is unnecessarily large.

---

## Supabase and Edge Function Issues

**1. `pricing_cache` table has no row-level security — `supabase/migrations/001_initial_schema.sql:38-44`**

`profiles` (line 10) and `scan_sessions` (line 27) both have `alter table ... enable row level security`. `pricing_cache` does not. Supabase's default grants `SELECT` to the `anon` role on all tables. The `EXPO_PUBLIC_SUPABASE_ANON_KEY` is compiled into the app bundle and visible to anyone who extracts it. That key can be used to read the full pricing cache via the public REST API, exposing a log of every wine that has ever been looked up. Worse, `INSERT` and `UPDATE` via the `anon` role can poison cache entries with false pricing data. Add `alter table pricing_cache enable row level security;` and grant write access only to the `service_role` key (i.e., only from the edge function).

**2. Edge functions called without user JWT — `src/api/claude.ts:8-14`**

The `invokeFunction` helper sends only the `apikey` (anon key) header:

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
},
```

There is no `Authorization: Bearer <jwt>` header. This means: (a) OCR and recommend functions run in an unauthenticated context with no per-user attribution; (b) anyone who extracts the anon key from the bundle can call `ocr` and `recommend` directly, generating unlimited Claude Opus API calls at the developer's cost. The `wine-searcher.ts` client correctly uses `supabase.functions.invoke()` which attaches the session JWT automatically — the custom `fetch` helper in `claude.ts` should do the same or switch to `supabase.functions.invoke()`.

**3. No CORS preflight handler on any edge function — `supabase/functions/ocr/index.ts`, `supabase/functions/recommend/index.ts`, `supabase/functions/wine-searcher-proxy/index.ts`**

None of the three functions handle `OPTIONS` preflight requests. All three will be blocked by the browser's CORS policy if the app is built for Expo Web or tested via a browser-based dev tool. Add an `OPTIONS` handler returning `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers` at the top of each `Deno.serve` callback.

**4. Wine-Searcher API key passed as URL query parameter — `supabase/functions/wine-searcher-proxy/index.ts:48`**

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&winename=...`;
```

API keys in URLs are captured in HTTP server access logs, CDN logs, Supabase function execution logs, and any network monitoring tool. Send the key in a request header (e.g., `Authorization` or `X-API-Key`) instead.

**5. `recommend` edge function `max_tokens` too low for complex lists — `supabase/functions/recommend/index.ts:173`**

`max_tokens: 4096` is set for the recommend function. Each recommendation includes `rationale`, `vintageAssessment.notes`, `drinkingWindow.notes`, `rarityAssessment.notes`, `fitScore`, `valueScore`, `outsidePreferences`, plus the top-level `summary`. With 25 wines as input context and three richly structured recommendations in output, 4096 tokens can be exhausted on complex wine lists. A truncated response fails the `JSON.parse` on line 186 and surfaces as an error to the user. The OCR function uses 8096; raise the recommend function to match.

**6. Budget currency hardcoded to `£` in the recommend prompt — `supabase/functions/recommend/index.ts:139`**

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```

The currency symbol is hardcoded to `£`. If the user is scanning a menu priced in USD, EUR, AUD, or any other currency, the model receives an instruction that says "£50" while the menu prices in the wine list JSON are in a different currency. The model cannot apply the budget rule correctly. The `ScanPreferences` type (`src/stores/scanStore.ts:8`) includes no `currency` field; add one and pass it through to the edge function prompt.

**7. URL-mode OCR uses raw webpage text without structure preservation — `supabase/functions/ocr/index.ts:26-36`**

The `url` path strips all HTML tags and truncates to 12,000 characters. Wine list pages often use table structure or definition lists to associate wine names with their prices and vintages. After tag stripping, the spatial relationship between columns is lost. A wine name on one line may no longer be adjacent to its price, causing the model to produce mismatched or incomplete extractions. Consider preserving table structure (e.g., converting `<td>` to tab-separated columns) rather than stripping all markup.

---

## UX and Performance Issues

**1. Two "This may take a minute" messages shown simultaneously — `app/scan/extracting.tsx:147-151`**

During the `recommending` stage, both of these render at the same time:
- Line 148: `'Scoring by critic rating, vintage quality and value'`
- Line 151: `'This may take a minute or two'`

The result is two body-text lines stacked vertically, the second redundant with the reading stage message on line 146. Fold the wait note into the same conditional text block as the stage description.

**2. History cards are tappable but `onPress` is missing — `app/(tabs)/history.tsx:63`**

```tsx
<TouchableOpacity style={styles.card}>
```

There is no `onPress` handler. The card shows a visual press state (ripple on Android, opacity on iOS) but nothing happens. The `recommendation` JSON is stored in the `scan_sessions` row and could be re-displayed. As-is the tap is a dead interaction that teaches users not to trust tappable elements in the app.

**3. No React error boundary in the component tree — `app/_layout.tsx`**

No component wraps children in a React error boundary. An unhandled render error produces a blank white screen in production with no recovery path. Expo Router supports per-segment `_error.tsx` files. At minimum, add an error boundary at the root layout level to show a "Something went wrong" UI with a restart option.

**4. Preferences snap update on scan tab — `app/(tabs)/scan.tsx:24-26` and `59-66`**

The scan tab initialises `wineTypes`, `styleProfiles`, and `budget` from `savedPreferences` in `useState` (which is `undefined` on mount while React Query fetches), then the `useEffect` on line 59 sets the same values again when preferences arrive. This causes a visible snap: accordions show placeholder text, then jump to saved values. The `prefsLoaded` flag also causes a redundant extra render. Use a single initialisation path — either lazily initialise `useState` from preferences and remove the effect, or initialise to `[]`/`null` and use only the effect.

**5. "Change your subscription email account" copy — `app/(tabs)/profile.tsx:153`**

The label reads "Change your subscription email account". The app has no subscription model. Users reading "subscription" may think this controls a paid plan or email list. Replace with "Change email address".

**6. No cancel/back button on camera, extracting, or results screens — `app/scan/camera.tsx`, `app/scan/extracting.tsx`, `app/scan/results.tsx`**

All three screens have no back navigation control. On `extracting.tsx`, the instruction "Please don't leave this page while we're searching" (line 153) tells users not to navigate away but provides no cancel mechanism. OCR can take 60+ seconds. A cancel button (setting `token.active = false` and calling `router.back()`) on the extracting screen would materially improve the experience when the user changes their mind.

**7. No password reset flow in sign-in screen — `app/(auth)/sign-in.tsx`**

The sign-in screen has email and password fields and a "Sign In" button but no "Forgot password?" link. Users who cannot remember their password have no recovery path visible in the app. Supabase provides `supabase.auth.resetPasswordForEmail()` — a link to trigger it should appear below the sign-in form.

---

## Navigation Issues

**1. `router.replace()` during render on results screen — `app/scan/results.tsx:22-24`**

Documented in Bugs section. The redirect must be moved inside a `useEffect` to avoid the React 18 "Cannot update during an existing state transition" crash.

**2. New signed-in users bypass onboarding — `app/index.tsx:20`**

Documented in Bugs section. The index route must wait for the preferences query before deciding to redirect.

**3. `/scan/preferences` is an unreachable orphan route — `app/scan/preferences.tsx`**

No file in the codebase navigates to `/scan/preferences`. The scan flow is: `scan → camera → preview → extracting → results`. Preferences are set inline on the scan home tab. This screen is dead code. It also calls `recommendWines` with missing required fields (see Bugs #7). The file should be deleted or wired into the flow.

**4. Back arrow on profile tab pushes rather than pops — `app/(tabs)/profile.tsx:182`**

```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
```

`router.push('/(tabs)/scan')` adds a new stack entry. Pressing the OS back button from the scan tab returns to the profile tab. On Android this creates a loop: scan → back → profile → scan → back → profile. The back arrow icon implies `router.back()` semantics. Replace with `router.back()`.

**5. `auth/callback` deep-link route does not exist — `app/(tabs)/profile.tsx:113`**

```tsx
const redirectTo = Linking.createURL('auth/callback');
```

`Linking.createURL('auth/callback')` generates a deep link that Supabase sends back in the email-change confirmation email. There is no `app/auth/callback.tsx` file. When the user taps the confirmation link, Expo Router will show a 404 unmatched-route screen. The email change completes in Supabase's backend but the app never refreshes the session or shows a confirmation. Create `app/auth/callback.tsx` with a `useEffect` that calls `supabase.auth.getSession()` and redirects to the profile tab.

**6. OS back gesture from `extracting` screen leaves stale store state — `app/scan/extracting.tsx`**

`extracting.tsx` is pushed onto the stack (not replaced). The Android back gesture or iOS swipe returns to `preview.tsx`. If the user taps "Use This Photo" again, a new `extracting.tsx` is pushed and the `run()` function fires again. The cancellation token correctly aborts the in-flight request on unmount, but `extractedWines` from the aborted partial run may remain in the store. `scanStore.reset()` is only called in the "Retake" flow (preview's `handleRetake`). Add a `reset()` call at the start of `handleConfirm` in `preview.tsx` to clear stale state before pushing to extracting.

**7. `app/scan/url.tsx` unconditionally redirects to scan tab — `app/scan/url.tsx:1-5`**

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

This route silently discards any navigation to `/scan/url`. There is no URL-based wine list scanning entry point visible in the UI either — the scan tab only surfaces camera and screenshot. If URL scanning is not ready, the file should be removed to avoid confusion. If it is intended, it needs a real implementation.
