# Code Review — 2026-06-14

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

Zero issues from the 2026-06-12 report have been resolved. The codebase has had no application-code commits since the initial implementation; all prior findings carry forward. One new finding is identified in this pass and marked **NEW**.

---

## Bugs and Crashes

### High Severity

**H1 — `scan_sessions` table is never written to** *(carry-forward — unresolved since 2026-05-05)*
`app/(tabs)/history.tsx:16–25` and `app/scan/extracting.tsx:116–117`

The scan flow completes with `router.replace('/scan/results')` but never inserts or upserts a row into `scan_sessions`. No file anywhere in `app/` or `src/` contains a write to this table. Every authenticated user's History tab is permanently empty regardless of how many scans they complete. The entire history feature is broken on the write side.

Fix: after `setRecommendation(recommendation)` at `extracting.tsx:116`, upsert a row to `scan_sessions` with `user_id`, `captured_at`, `extracted_wines`, `recommendation`, and `preferences_snapshot`.

---

**H2 — Race condition: new signed-in users bypass onboarding**
`app/index.tsx:20`

`usePreferences` returns `undefined` (not `null`) while the React Query fetch is in-flight. The guard `preferences === null` evaluates to `false` for `undefined`, so a brand-new authenticated user with no profile row is redirected to `/(tabs)/scan` before onboarding.

Fix: hold at `return null` until preferences resolve: `if (loading || hasLaunched === null || (session && preferences === undefined)) return null;`

---

**H3 — `router.replace` called during render, not inside `useEffect`**
`app/scan/results.tsx:22–25`

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

This side effect fires in the render body. Under React strict mode or concurrent rendering it produces "Cannot update a component while rendering a different component" warnings and can cause double-navigation or infinite render loops.

Fix: `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

---

**H4 — `handleCapture` has no try/catch; unhandled rejection on hardware error**
`app/scan/camera.tsx:29–99`

`takePictureAsync` (line 32) and both `manipulateAsync` calls (lines 44, 88) are awaited inside an async function with no surrounding try/catch. A hardware failure, mid-session camera permission revocation, or disk-full condition produces an unhandled promise rejection. The UI appears frozen with no user feedback and no recovery path.

Fix: wrap the entire function body in try/catch and call `Alert.alert` on failure.

---

**H5 — Auth forms leave `loading` permanently stuck if the Supabase call throws**
`app/(auth)/sign-in.tsx:12–20` · `app/(auth)/sign-up.tsx:12–22`

```tsx
async function handleSignIn() {
  setLoading(true);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  setLoading(false); // never reached if the above throws
  ...
}
```

If `signInWithPassword` or `signUp` throws (network timeout, unexpected SDK error), `setLoading(false)` is never called. The button stays in "Signing in…" state permanently and the form is frozen until the app is killed. Both screens have this pattern.

Fix: move `setLoading(false)` into a `finally` block on both forms.

---

**H6 — Supabase upsert errors silently discarded in `usePreferences`**
`src/hooks/usePreferences.ts:38–47`

`@supabase/supabase-js` v2 returns `{ data, error }` rather than throwing. The `mutationFn` never inspects the returned `error`:

```ts
await supabase.from('profiles').upsert({ user_id: ..., ...updates });
// error returned here is thrown away — mutation resolves as success
```

Because no exception is thrown, TanStack Query's `onError` never fires, the query is invalidated, re-fetched, and the user sees stale data with no indication the save failed. This affects both the onboarding and profile screens.

Fix: `const { error } = await supabase.from('profiles').upsert({...}); if (error) throw error;`

---

### Medium Severity

**M1 — `AsyncStorage.getItem` rejection never caught**
`app/index.tsx:13`

```ts
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```

There is no `.catch()`. If AsyncStorage fails (first boot on some devices, corrupt keychain, storage full), the promise rejects silently, `hasLaunched` stays `null` forever, and the `loading || hasLaunched === null` guard on line 16 keeps the app stuck on a blank screen.

Fix: `.then(...).catch(() => setHasLaunched(false))`.

---

**M2 — Navigation fires before `updatePreferences` mutation resolves**
`app/onboarding.tsx:37–50`

`updatePreferences({...})` calls `mutation.mutate`, which returns `void`. `router.replace('/(tabs)/scan')` fires synchronously on the same tick. On a slow connection, the user arrives at the scan tab while the Supabase upsert has not completed. If the save fails (see H6), no error is shown and preferences are silently lost.

Fix: expose `mutateAsync` from `usePreferences`, await it, and place `router.replace` in the success path.

---

**M3 — Duplicate-grape retry falls back to the invalid original result**
`src/services/recommender.ts:74–82`

```ts
if (parsed2.success) return parsed2.data;
// falls through silently if parsed2 also fails — returns original with duplicates
```

When `hasDuplicateGrapes` triggers a retry and the retry also fails Zod validation, execution falls through to `return parsed.data` — the original response containing duplicate grape varieties — with no warning logged and no error thrown.

Fix: add an `else` branch that throws or at minimum logs the failure before returning the known-invalid result.

---

**M4 — `handleScreenshot` has no try/catch**
`app/(tabs)/scan.tsx:86–102`

`ImagePicker.launchImageLibraryAsync` is awaited with no try/catch. An OS-level permission denial or device fault can throw, producing an unhandled rejection with no user feedback.

---

**M5 — `signOut` error silently swallowed**
`app/(tabs)/profile.tsx:130–133`

```tsx
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

`supabase.auth.signOut()` returns `{ error }`, which is not checked. If sign-out fails (network error, expired token), the user navigates to the sign-in screen while still authenticated. The session remains valid in SecureStore; on the next cold start `useAuth` restores the stale session and the user appears still logged in.

Fix: destructure `{ error }`, show an `Alert` if non-null, and only navigate on success. Also navigate to `/` instead of `/(auth)/sign-in` so the root index re-evaluates auth state cleanly.

---

**M6 — No error boundaries anywhere in the app**
`app/_layout.tsx`

There are no React error boundaries wrapping any route group or the root `<Stack>`. A render-time exception in any component (null-dereference in a results card, unexpected shape from the Zod parser) crashes the entire app to an unrecoverable white screen.

Fix: wrap at minimum the `<Stack>` and the tab layout in an `<ErrorBoundary>` component that displays a recoverable error screen.

---

**M7 — No timeout or cancel path during edge function calls**
`app/scan/extracting.tsx:70–124`

Neither `extractWineList` nor `recommendWines` have a timeout or `AbortController`. If an edge function hangs due to Claude API latency or a non-closing connection, the extracting screen displays indefinitely. The `token.active` cancellation pattern is already in place; there is no cancel button to use it.

Fix: add a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')`. Consider also adding `AbortSignal.timeout(90_000)` to the `fetch` calls in `src/api/claude.ts`.

---

**M8 — `scan_sessions` RLS policy missing `WITH CHECK` clause**
`supabase/migrations/001_initial_schema.sql:22–25`

The policy is `for all using (auth.uid() = user_id)`. For PostgreSQL, the `USING` clause restricts row visibility (SELECT, UPDATE, DELETE) but does not restrict INSERT unless a `WITH CHECK` clause is also present. An authenticated user can insert rows with any arbitrary `user_id`.

Fix: `using (auth.uid() = user_id) with check (auth.uid() = user_id)`.

---

**M9 — Pre-filter uses saved-profile budget; per-scan budget override is ignored**
`app/scan/extracting.tsx:38–49` · `app/scan/extracting.tsx:101`

`preFilterWines(wines, userProfile)` applies `prefs.defaultBudget` (the saved profile value). `recommendWines` at line 102 receives `preferences.budget` from the scan store — the per-scan budget set on the Scan tab. If the user raised the per-scan budget above their saved default, wines in that elevated range are stripped before Claude sees them.

Fix: pass the current scan-level budget explicitly into `preFilterWines` rather than using `userProfile.defaultBudget`.

---

**M10 — Missing `app/auth/callback.tsx` route for email-change confirmation deep link**
`app/(tabs)/profile.tsx:113`

```tsx
const redirectTo = Linking.createURL('auth/callback');
```

No file matching `app/auth/callback.tsx` or `app/auth/callback/index.tsx` exists. When the user taps the confirmation link from their inbox, expo-router cannot resolve the path and drops them silently on whatever the root index resolves to — with no acknowledgment that the email change was confirmed.

Fix: create `app/auth/callback.tsx` to handle the OAuth redirect and surface a success or failure message.

---

**M11 — "Continue without account" on sign-in screen does not set `hasLaunched`**
`app/(auth)/sign-in.tsx:48`

```tsx
<TouchableOpacity onPress={() => router.replace('/(tabs)/scan')}>
```

`AsyncStorage.setItem('hasLaunched', 'true')` is never called here. Only `app/welcome.tsx:8` sets the flag via its "Start Scanning" button. A user who goes Welcome → Sign In → "Continue without account" will see the Welcome screen again on every subsequent cold start.

Fix: call `await AsyncStorage.setItem('hasLaunched', 'true')` before `router.replace` in this handler.

---

**M12 — Sign-up discards the returned session when email confirmation is disabled**
`app/(auth)/sign-up.tsx:13`

```tsx
const { error } = await supabase.auth.signUp({ email, password });
```

`data` is not destructured. When a Supabase project has email confirmation disabled, `signUp()` returns `data.session` as a live session immediately. The current code always shows "Check your email" and routes to sign-in — forcing the user to re-enter credentials.

Fix: destructure `data`; if `data.session` is non-null, navigate to `/(tabs)/scan` rather than showing the confirmation dialog.

---

**M13 — Android back button from results screen re-triggers the full OCR + recommend pipeline**
`app/scan/results.tsx` · `app/scan/extracting.tsx:117`

`extracting.tsx:117` uses `router.replace('/scan/results')` to navigate to results, which replaces only `extracting` in the stack. The earlier stack entries (`scan → camera/preview → extracting`) remain, so the hardware back button on Android pops back to the screen that was replaced — which triggers `extracting`'s `useEffect` again, making a fresh pair of Claude API calls with the same inputs.

Fix: clear the scan sub-stack before navigating to results (e.g. navigate from the scan tab root), or ensure the results screen is a full-stack replacement via `router.replace` from the scan root.

---

### Low Severity

**L1 — `hasDuplicateGrapes` skips wines with no grape field; diversity check has a blind spot**
`src/services/recommender.ts:60–64`

Wines where `grape` is `undefined` or empty are filtered out before the Set comparison. If Claude returns three wines without grape data (e.g. proprietary blends listed only by name), `grapes` is an empty array, `new Set(grapes).size === grapes.length === 0`, and `hasDuplicateGrapes` returns `false` — the diversity retry is never triggered even though variety diversity is unverified.

---

**L2 — Font loading error discarded; blank screen on asset failure**
`app/_layout.tsx:15`

```tsx
const [fontsLoaded] = Font.useFonts({...});
```

`Font.useFonts` returns `[boolean, Error | null]`. The error element is discarded. If any Cormorant Garamond file fails to load, `fontsLoaded` remains `false` permanently and the app renders `null` at line 28 — a blank screen with no recovery path.

Fix: destructure the error and show a fallback UI or retry prompt.

---

**L3 — `ChipPicker` local state resets on every render due to unstable `?? []` reference**
`src/components/preferences/ChipPicker.tsx:19–21` · `app/(tabs)/profile.tsx` (all ChipPicker call sites)

`ChipPicker` is called with `selected={preferences?.favouriteRegions ?? []}`. When `preferences?.favouriteRegions` is `undefined`, `?? []` creates a **new array reference** on every render. The `useEffect(() => { setLocal(selected); }, [selected])` fires on every render because arrays are compared by reference, resetting `local` to `[]` and erasing any in-progress chip selections.

Fix: memoize derived arrays at call sites with `useMemo`, or replace the `useEffect` inside `ChipPicker` with a comparison that avoids reference equality (e.g. JSON-stringified comparison or `fast-deep-equal`).

---

**L4 — `Promise.all` for multi-image OCR discards all results if a single image fails**
`app/scan/extracting.tsx:77`

```ts
const results = await Promise.all(imageUris.map(extractWineList));
```

If one uploaded screenshot fails OCR (blurry image, API timeout, parse error), `Promise.all` rejects immediately and all successfully extracted wines from the other images are discarded. The user must restart the entire scan.

Fix: use `Promise.allSettled`, filter for fulfilled results, merge them, and proceed with partial data — reporting the number of failed images rather than aborting entirely.

---

**L5 — Empty results screen shows no empty-state message**
`app/scan/results.tsx:49–115`

The Zod schema for recommendations uses `.max(3)`, which permits 0 wines. If Claude returns an empty array, the results screen renders only the "Pocket Somm Recommends" header and a "Start Another Search" button with no explanation.

Fix: add `if (recommendation.wines.length === 0)` and render an informative message such as "No wines matched your preferences on this list — try adjusting your budget or filters."

---

**L6 — `invokeFunction` calls `JSON.parse` without try/catch**
`src/api/claude.ts:17`

```ts
return JSON.parse(text);
```

If an edge function returns non-JSON (Cloudflare 502 HTML, Supabase maintenance page), `JSON.parse` throws a `SyntaxError`. The user sees "SyntaxError: Unexpected token '<'..." with no actionable guidance.

Fix: wrap in try/catch and rethrow as "Service temporarily unavailable. Please try again."

---

**L7 — Currency symbol hardcoded as `£` on results screen regardless of wine currency**
`app/scan/results.tsx:83`

```tsx
<Text style={styles.price}>£{wine.menuPrice}</Text>
```

`WineRecommendation` carries a `currency: string` field extracted by OCR. For menus priced in EUR, USD, CHF, or any other currency, the screen unconditionally displays `£`.

Fix: map `wine.currency` to a symbol (e.g. `{ GBP: '£', EUR: '€', USD: '$' }`) and render that symbol instead.

---

**L8 — Wine-Searcher API key logged in server access logs**
`supabase/functions/wine-searcher-proxy/index.ts:48`

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&...`;
```

The secret is embedded in the query string, exposing it in Wine-Searcher's access logs, any CDN or reverse-proxy logs, and network monitoring tools.

Fix: pass the key in a request header (`Authorization` or `X-Api-Key`) if supported by the Wine-Searcher API.

---

**L9 — Cache write failure silently ignored in wine-searcher proxy**
`supabase/functions/wine-searcher-proxy/index.ts:68–77`

The `supabase.from('pricing_cache').upsert(...)` result is not checked. A failed write means subsequent requests for the same wine re-hit the Wine-Searcher API, burning quota with no log entry to indicate the cache is not persisting.

---

**L10 — Tab bar `tabBarStyle` missing `backgroundColor`**
`app/(tabs)/_layout.tsx:11`

```tsx
tabBarStyle: { borderTopColor: colors.border },
```

No `backgroundColor` is set. Without an explicit value, iOS renders the tab bar with its default opaque white or translucent appearance, which clashes with the dark terracotta theme.

Fix: add `backgroundColor: colors.background` to `tabBarStyle`.

---

**L11 — Recommend system prompt references "today's date" but the actual date is never injected** *(NEW)*
`supabase/functions/recommend/index.ts:39`

The system prompt instructs Claude to assess drinking windows "as of today's date":

```
Assess whether the wine is currently within its optimal drinking window as of today's date.
```

The system prompt is a static constant declared outside `Deno.serve`. No date is injected into the user message either. Claude has no way to know the actual current date and will interpret "today" relative to its training data cutoff (August 2025). As of June 2026 this represents approximately a 10-month offset in all drinking window calculations: wines that were "Too Young" or "Approaching" peak in August 2025 may now be at "Peak" or "Fading", and wines listed as "Fading" may already be excluded from recommendations that the model would have correctly surfaced had it known the correct date.

Fix: inside `Deno.serve`, compute `const today = new Date().toISOString().slice(0, 10)` and prepend `Today's date: ${today}\n` to the `userContext` string before it is included in the user message.

---

## Supabase and Edge Function Issues

**S1 — OCR and Recommend edge functions accept any request with the anon key; no authentication**
`supabase/functions/ocr/index.ts:38` · `supabase/functions/recommend/index.ts:115`

Neither function validates a JWT or checks that the caller is a legitimate app user. The anon key is bundled in the app binary and trivially extractable. Any actor with the project URL and anon key can make unlimited Claude API calls with no attribution, rate limiting, or cost control.

Fix: add a JWT check at the top of each function using `supabase.auth.getUser(jwt)`. Update `src/api/claude.ts` to send `Authorization: Bearer <session_token>` alongside `apikey`. The pattern is already correct in `src/api/wine-searcher.ts:12` which uses `supabase.functions.invoke()` — replace the raw `fetch` calls in `claude.ts` with that pattern.

---

**S2 — SSRF: OCR edge function fetches arbitrary user-supplied URLs**
`supabase/functions/ocr/index.ts:51`

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

`url` is taken directly from the request body with no scheme validation or IP-range blocklist. A caller can supply `http://169.254.169.254/latest/meta-data/` or any other internal Supabase/cloud metadata endpoint to exfiltrate environment variables and service credentials from within the function's network boundary.

Fix: validate `url` starts with `https://`; optionally add `AbortSignal.timeout(10_000)` to prevent hanging.

---

**S3 — `pricing_cache` table has no Row Level Security**
`supabase/migrations/001_initial_schema.sql:33–44`

RLS is enabled on `profiles` and `scan_sessions`, but `pricing_cache` has no `CREATE POLICY` statement. Any authenticated user can read, insert, update, or delete rows via the REST API, bypassing the edge function entirely. This enables cache poisoning: a malicious user can insert crafted price data for any wine key.

Fix:
```sql
alter table pricing_cache enable row level security;
create policy "Authenticated reads" on pricing_cache
  for select using (auth.role() = 'authenticated');
-- writes reserved for service role (edge function) only
```

---

**S4 — Preferences query returns `null` for both a missing row and a network error; onboarding is triggered on transient failures**
`src/hooks/usePreferences.ts:18–21`

Both `PGRST116` (no row found, expected for new users) and genuine network or RLS errors return `null`. In `app/index.tsx:20`, `preferences === null` redirects to `/onboarding`. A returning user whose preferences query fails at launch (network blip) is sent back through onboarding and may overwrite their existing settings once the save completes.

Fix: inspect `error.code`; redirect to onboarding only on `PGRST116`. Rethrow all other errors so the query enters an error state.

---

**S5 — Budget constraint in recommend prompt hardcodes `£` regardless of menu currency**
`supabase/functions/recommend/index.ts:139`

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```

The currency symbol is hardcoded as `£` even though the OCR function extracts a per-wine `currency` field. For EUR- or USD-priced menus, the model receives a budget constraint in the wrong currency and may misapply it.

---

## UX and Performance Issues

**U1 — History cards are tappable but do nothing**
`app/(tabs)/history.tsx:64`

`<TouchableOpacity style={styles.card}>` has no `onPress`. Users receive the visual press feedback affordance with no result. Either add a detail view and navigate to it, or replace `TouchableOpacity` with `View`.

---

**U2 — History card wine name references non-existent `topPick` field**
`app/(tabs)/history.tsx:71`

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (`src/types/wine.ts:50–53`) has `wines: WineRecommendation[]` and `summary: string`; there is no `topPick` field. This expression always evaluates to `undefined` and wine names never render on any history card.

Fix: `item.recommendation?.wines?.[0]?.name`.

---

**U3 — Scan tab shows empty/default controls before saved preferences load**
`app/(tabs)/scan.tsx:24–66`

`wineTypes`, `styleProfiles`, and `budget` are initialised to empty defaults, then overwritten by a `useEffect` once React Query resolves. A signed-in user sees a flash of empty controls on every launch. If the user begins making selections before the effect fires, their choices are silently overwritten.

---

**U4 — Duplicate body text on extracting screen during recommendation stage**
`app/scan/extracting.tsx:141–152`

When `stage === 'recommending'`, two body `<Text>` nodes are visible simultaneously:
- "Scoring by critic rating, vintage quality and value"
- "This may take a minute or two"

The second is a redundant leftover from the reading-stage hint. Remove the `{stage === 'recommending' && ...}` block at lines 150–152.

---

**U5 — No error state in history query**
`app/(tabs)/history.tsx:12–25`

`useQuery` is called but only `data` and `isLoading` are destructured; `error` is ignored. If the Supabase query fails, `isLoading` becomes `false` and `sessions` is `undefined`, causing the component to render the "No scans yet" empty state with no indication that a fetch error occurred.

---

**U6 — Skipping onboarding traps authenticated users in an infinite loop**
`app/onboarding.tsx:144`

The "Skip for now" button navigates to `/(tabs)/scan` without creating a profile row. On the next cold start, `usePreferences` returns `null` (no row) and `index.tsx:20` redirects back to `/onboarding`. Authenticated users who skip are forced through onboarding on every cold start.

Fix: upsert an empty preferences row before navigating away on skip.

---

**U7 — No cancel button during multi-minute AI processing**
`app/scan/extracting.tsx:139–161`

The loading screen instructs users to "Please don't leave this page" but provides no cancel mechanism. If either API call stalls, the user is stranded indefinitely. The `token.active` cancellation pattern is already in place and only needs a visible cancel button to complete it.

---

**U8 — Email change input has no format validation**
`app/(tabs)/profile.tsx:110–128`

`handleEmailChange` submits any non-empty string to Supabase without validating it is a well-formed email address. Supabase rejects invalid addresses, but the user sees a generic alert rather than inline feedback.

---

**U9 — `WineRecommendationCard` component is dead code**
`src/components/results/WineRecommendationCard.tsx:1–195`

This 195-line component is not imported by any file. `app/scan/results.tsx` re-implements the wine card layout inline with a separate accordion design. Two divergent card implementations now exist and must be maintained independently.

Fix: delete `WineRecommendationCard.tsx` or refactor `results.tsx` to use it.

---

## Navigation Issues

**N1 — `/scan/url` is an unimplemented stub**
`app/scan/url.tsx:1–5`

The entire file is `return <Redirect href="/(tabs)/scan" />`. The OCR edge function has a complete URL-based extraction path (`supabase/functions/ocr/index.ts:49–63`), but no client UI exposes it. Any navigation or deep link to `/scan/url` silently bounces the user to the scan tab with no explanation.

Fix: implement the URL input feature or remove the file.

---

**N2 — `/scan/preferences` is an orphaned, unreachable screen**
`app/scan/preferences.tsx:1–127`

No active file navigates to `/scan/preferences`. The scan flow is `camera → preview → extracting → results`. This screen is dead code and also contains a TypeScript error (calls `recommendWines` without the required `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` fields).

Fix: remove the file or re-wire it into the scan flow.

---

**N3 — "Account" button in Scan tab stacks Profile onto the scan navigator**
`app/(tabs)/scan.tsx:163`

`router.push('/(tabs)/profile')` adds a new stack entry. The hardware back button then returns to the scan screen unexpectedly rather than staying in the tab layout.

Fix: use `router.navigate('/(tabs)/profile')` to switch tabs without stacking.

---

**N4 — Android back from results screen re-triggers OCR and recommendation pipeline**
`app/scan/extracting.tsx:117` · `app/scan/results.tsx`

`router.replace('/scan/results')` replaces only the extracting entry in the stack, leaving camera and preview entries below it. On Android, the hardware back button pops back to the screen that extracting replaced, re-running the `useEffect` in `extracting.tsx` and making a fresh pair of Claude API calls.

Fix: clear the full scan sub-stack before displaying results, or make the results screen a replacement of the scan tab root so the back button reaches the scan tab directly.

---

**N5 — Sign-out bypasses root router; `hasLaunched` state is not re-evaluated**
`app/(tabs)/profile.tsx:130–133`

```ts
router.replace('/(auth)/sign-in');
```

After sign-out, the app navigates directly to the sign-in screen rather than letting `app/index.tsx` re-evaluate auth state. A user who signed out should see the welcome screen on the next session (because `hasLaunched` is `true` but `session` is now `null`), but they land on sign-in instead. Subsequent back navigation can also expose stale stack entries.

Fix: navigate to `/` after sign-out and let the root index route based on the updated auth state.

---

**N6 — No route to replay a historical recommendation**
`app/(tabs)/history.tsx`

History cards render scan summaries but tapping them does nothing (see U1). No `/scan/history-result` or equivalent route exists to display a past `recommendation` JSONB object from `scan_sessions`. The history feature is visually present but has no functional detail view.
