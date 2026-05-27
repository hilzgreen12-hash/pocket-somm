# Code Review — 2026-05-27

> **Status note:** No application code has been committed since the 2026-05-26 review. All issues from that report remain unresolved. This report confirms their continued presence and adds new findings discovered in today's full read-through.

---

## Bugs and Crashes

### HIGH

**H1 — `scan_sessions` table is never written to**
`app/(tabs)/history.tsx:16-24` queries `scan_sessions` with `.select('*')`. `supabase/migrations/001_initial_schema.sql:15-24` creates the table. No file in `app/` or `src/` performs an insert or upsert to this table. Every signed-in user who opens the History tab will see an empty state forever, regardless of how many scans they complete. The write path must be added at the end of the successful recommendation flow in `app/scan/extracting.tsx` (around line 116, after `setRecommendation`). Severity: **High**

**H2 — `router.replace()` called during the render phase**
`app/scan/results.tsx:23-25`:
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
`router.replace` is a navigation side effect called directly in the function body, not inside a `useEffect`. In React's concurrent rendering mode this triggers "Cannot update a component while rendering a different component" warnings and can produce double-navigation or an infinite render loop. The fix is `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`. Severity: **High**

**H3 — `pricing_cache` table has no Row Level Security**
`supabase/migrations/001_initial_schema.sql:32-44` creates `pricing_cache` without `alter table pricing_cache enable row level security`. Both `profiles` (line 10) and `scan_sessions` (line 27) have RLS enabled. `pricing_cache` is accessible to any caller with the anon key, which is bundled in the app binary. Any user can run `supabase.from('pricing_cache').select('*')` to enumerate all cached wine pricing data without authentication. Severity: **High**

**H4 — `AsyncStorage.getItem` floating promise; blank screen on rejection** *(new)*
`app/index.tsx:13`:
```ts
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```
There is no `.catch()` handler. If `AsyncStorage.getItem` rejects (device storage unavailable, SecureStore misconfiguration), `hasLaunched` stays `null` permanently. The guard at line 16 (`if (loading || hasLaunched === null) return null`) then renders a permanent blank screen with no recovery path. Add `.catch(() => setHasLaunched(false))`. Severity: **High**

---

### MEDIUM

**M1 — New authenticated users with no profile row bypass onboarding**
`app/index.tsx:19-21`:
```tsx
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```
`loading` (auth) and `hasLaunched` are both resolved before this code runs, but `preferences` from `usePreferences` (React Query) is `undefined` — not `null` — while its query is still in-flight. The check `preferences === null` evaluates to `false` when `preferences` is `undefined`, so a brand-new signed-in user with no `profiles` row is silently redirected to `/(tabs)/scan` instead of `/onboarding`. A second loading guard from the preferences query is required before this conditional. Severity: **Medium**

**M2 — Onboarding preference save is fire-and-forget; navigation fires before save completes**
`app/onboarding.tsx:37-50`:
```tsx
function handleNext() {
  if (isLast) {
    updatePreferences({ ... });   // mutation.mutate — synchronous call, returns void
    router.replace('/(tabs)/scan');
  }
}
```
`updatePreferences` is `mutation.mutate`, which does not return a Promise. Navigation fires on the next line without waiting for the Supabase upsert. If the save fails (network error, RLS rejection), preferences are silently lost and the user is already on the scan tab with no indication of failure. Use `mutation.mutateAsync` with `await`, and move `router.replace` into `onSuccess`. Severity: **Medium**

**M3 — `handleCapture` in camera screen has no error handling**
`app/scan/camera.tsx:29-98`: The entire async capture-and-crop pipeline — `takePictureAsync` (line 32), `manipulateAsync` called twice (lines 44-93) — has no try/catch. On low-storage devices, hardware errors, or image manipulation failures, the promise rejects silently. The camera UI appears to freeze with no feedback to the user. Severity: **Medium**

**M4 — `recommendWines` called with incomplete input from `preferences.tsx`**
`app/scan/preferences.tsx:28-34`:
```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes all missing
});
```
`RecommendInput` in `src/services/recommender.ts:5-15` defines all eight fields without `?`. This is a TypeScript compile error. At runtime the edge function receives `undefined` for five fields, so colour preferences, all exclusions, and favourites from the user's profile are silently ignored for any recommendation triggered from the preferences screen. Severity: **Medium**

**M5 — `handleScreenshot` in scan tab has no error handling**
`app/(tabs)/scan.tsx:86-101`: `ImagePicker.launchImageLibraryAsync` is called without a try/catch. On certain Android versions, or after camera-roll permission is revoked mid-session, this throws instead of returning `{ canceled: true }`. The unhandled rejection produces no user feedback. Severity: **Medium**

**M6 — Preference save failures are silently swallowed**
`src/hooks/usePreferences.ts:50`:
```ts
onError: (err) => console.error('[Preferences] Save error:', err),
```
If a Supabase upsert fails, the error is logged to console only. Every call site — `app/onboarding.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/scan.tsx` — shows no feedback to the user. An `Alert.alert` or toast in `onError` is required. Severity: **Medium**

**M7 — `preFilterWines` uses profile budget, not scan-time budget override** *(new)*
`app/scan/extracting.tsx:37-39`:
```ts
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
}
```
`prefs` here is `userProfile` (the persisted profile from Supabase). The scan-time budget set by the user in the Scan tab (`preferences.budget` from `useScanStore`) is passed to the `recommendWines` call at line 105 but is never used in `preFilterWines`. If a user sets a higher scan-time budget (e.g. £200) than their profile default (£100), wines priced £101–£200 are eliminated by `preFilterWines` before reaching the recommender — even though the user explicitly raised their budget for this scan. Replace `prefs.defaultBudget` with `preferences.budget` (from `useScanStore`) in the pre-filter call, or pass the scan-time budget explicitly. Severity: **Medium**

**M8 — `JSON.parse` on edge function response has no error handling** *(new)*
`src/api/claude.ts:17`:
```ts
return JSON.parse(text);
```
If the Supabase edge runtime returns a non-JSON body (HTML error page, gateway timeout, empty response), `JSON.parse` throws a `SyntaxError`. This propagates as "Unexpected token < in JSON at position 0" — an opaque error that hides the real failure. Wrap in try/catch and re-throw with the HTTP status and raw response body for diagnostics. Severity: **Medium**

**M9 — Duplicate "this may take a minute" messages shown simultaneously**
`app/scan/extracting.tsx:145-152`:
```tsx
<Text style={styles.body}>
  {stage === 'reading' ? 'This could take a minute or two' : 'Finding your best match…'}
</Text>
<Text style={styles.body}>
  {stage === 'recommending' && 'This may take a minute or two'}
</Text>
```
When `stage === 'recommending'`, the first Text renders "Finding your best match…" and the second renders "This may take a minute or two" — both visible beneath the spinner simultaneously. Remove the second `<Text>` block. Severity: **Medium**

**M10 — Skipping onboarding traps authenticated users in a loop**
`app/onboarding.tsx:144`: The "Skip for now" button calls `router.replace('/(tabs)/scan')` without writing any row to `profiles`. On next launch, `usePreferences` returns `null` (no profile row), `app/index.tsx:20` evaluates `preferences === null` as `true`, and redirects back to `/onboarding`. Authenticated users who skip are permanently looped back to onboarding on every launch. Upsert a default (empty) `profiles` row before navigating away. Severity: **Medium**

---

### LOW

**L1 — `focusPoint` state is set but never consumed** *(new)*
`app/scan/camera.tsx:15`:
```ts
const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);
```
`handleTap` at line 24-27 sets `focusPoint` on every screen tap. `CameraView` has no prop that accepts this value — it is never passed to the camera component or used in any visual indicator. Every tap allocates a new state object, triggers a re-render of `CameraScreen`, and provides no visible feedback to the user. Remove the state entirely or implement a tap-to-focus ring UI that actually consumes it. Severity: **Low**

**L2 — `format(new Date(item.captured_at), ...)` crashes on null or invalid date**
`app/(tabs)/history.tsx:66`:
```tsx
{format(new Date(item.captured_at), 'd MMM yyyy · h:mm a')}
```
`captured_at` has `DEFAULT now()` in the schema but is not declared `NOT NULL` in `supabase/migrations/001_initial_schema.sql:17`. If a row is ever inserted with a null or malformed timestamp, `new Date(null)` returns the epoch date and `new Date('invalid')` throws a `RangeError: Invalid time value`, crashing the FlatList render. Guard with `item.captured_at ? format(...) : 'Unknown date'`. Severity: **Low**

**L3 — `key={wine.name + i}` in results list is unsafe when `wine.name` is undefined**
`app/scan/results.tsx:54`:
```tsx
<View key={wine.name + i} ...>
```
If the edge function returns a wine object where `name` is missing or undefined (schema violation, partial parse), the key becomes `"undefined0"`, `"undefined1"`, etc. Multiple wines with missing names produce identical keys, causing React to silently reuse the wrong component instances. Use `key={String(i)}` since the array length is bounded at 3. Severity: **Low**

**L4 — `handleGuest` in welcome screen is async with no try/catch** *(new)*
`app/welcome.tsx:7-9`:
```ts
async function handleGuest() {
  await AsyncStorage.setItem('hasLaunched', 'true');
  router.replace('/(tabs)/scan');
}
```
If `AsyncStorage.setItem` throws (device storage full, permissions revoked), the rejection is unhandled because `onPress` callers do not catch async errors. The navigation still fires on the next line only if the await resolves — but if it throws, the user gets no feedback and `hasLaunched` is never persisted, so the welcome screen reappears on next launch. Wrap in try/catch and navigate regardless (the missing flag is non-critical). Severity: **Low**

**L5 — `defaultBudget` type mismatch between TypeScript interface and runtime value**
`src/types/preferences.ts:7` declares `defaultBudget: number` (non-nullable). `src/hooks/usePreferences.ts:26` returns `defaultBudget: data.default_budget ?? null`, yielding `null` when the column is unset. TypeScript strict-null checks would flag every consumer that treats this as `number`. The interface should be `defaultBudget: number | null`. Severity: **Low**

**L6 — Non-null assertions on missing env vars produce obscured errors**
`supabase/functions/wine-searcher-proxy/index.ts:1`, `supabase/functions/ocr/index.ts:3`, `supabase/functions/recommend/index.ts:3` all use `Deno.env.get('KEY')!`. If a secret is absent, `undefined` is used as the value — for API keys this means the upstream API returns 401, not an error indicating a missing env var. Add an explicit startup guard: `if (!key) throw new Error('ANTHROPIC_API_KEY is not set')`. Severity: **Low**

**L7 — No root-level React error boundary**
`app/_layout.tsx:14-39` wraps the entire app in providers but has no `<ErrorBoundary>`. Any unhandled JavaScript exception thrown by a screen component produces a blank red error screen with no recovery affordance. Severity: **Low**

**L8 — `handleSignOut` has no error handling**
`app/(tabs)/profile.tsx:130-133`:
```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```
If `signOut()` rejects (network offline, token already expired), the error is unhandled. The user is redirected to the sign-in screen regardless. While low-impact in practice, a toast or alert on failure would confirm the outcome. Severity: **Low**

---

## Supabase and Edge Function Issues

**S1 — SSRF via unvalidated `url` parameter in OCR edge function**
`supabase/functions/ocr/index.ts:51-53`:
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
The `url` value is taken directly from `req.json()` with no scheme validation, allowlist, or RFC 1918 IP blocklist. Any caller possessing the anon key can pass `http://169.254.169.254/latest/meta-data/` (AWS instance metadata) or internal Supabase network addresses to enumerate infrastructure. The client-side entry point (`app/scan/url.tsx`) is a no-op redirect, but the function is a public HTTP endpoint. At minimum, verify `url.startsWith('https://')` and reject any host resolving to a private IP range. Severity: **High**

**S2 — No CORS headers on OCR or recommend edge functions**
`supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` return responses without `Access-Control-Allow-Origin` or `Access-Control-Allow-Methods` headers and do not handle `OPTIONS` preflight requests. The OCR function is invoked via raw `fetch` in `src/api/claude.ts:7-17`. Any Expo Web build will fail all OCR and recommend calls with CORS errors. Add a CORS helper returning `Access-Control-Allow-Origin: *` (or a specific origin) and handle `OPTIONS` with a 204 response. Severity: **Medium**

**S3 — Edge functions are called without user identity; unlimited abuse is possible**
`src/api/claude.ts:8-12` sends only `apikey: ANON_KEY`, which is publicly visible in the compiled app bundle. No `Authorization: Bearer <jwt>` header is included. Inside the edge functions, there is no auth check. Any party who extracts the anon key from the app binary can make unlimited Claude API calls (OCR and recommend) at the project owner's expense, with no per-user attribution, rate limiting, or abuse detection. Pass the user's session JWT in `Authorization` and validate it inside the functions via `supabase.auth.getUser(jwt)`. Severity: **Medium**

**S4 — No timeout on URL-mode `fetch` in OCR edge function** *(new)*
`supabase/functions/ocr/index.ts:51`:
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
There is no `AbortController` timeout. If the target server is slow or unresponsive, the Deno function will hang until the Supabase Function platform timeout (~60 seconds). The client receives no progress update and eventually gets a generic 504. Add `AbortSignal.timeout(15_000)` to the fetch options. Severity: **Medium**

**S5 — Budget currency hardcoded as `£` regardless of menu currency**
`supabase/functions/recommend/index.ts:139,154`:
```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
// ...
`Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```
The OCR function extracts a `currency` field per wine (line 14 of `supabase/functions/ocr/index.ts`). If a restaurant's menu is priced in EUR or USD, the budget constraint in the prompt still specifies `£`, misleading the model into applying the wrong currency comparison. Pass the detected menu currency through the payload and use it in both lines. Severity: **Low**

**S6 — `pricing_cache` upsert error silently ignored**
`supabase/functions/wine-searcher-proxy/index.ts:68-75`: The `.upsert(...)` return value is not awaited for its error. If the upsert fails (schema mismatch, RLS if ever added), pricing data is returned to the client but nothing is cached. Every subsequent call for the same wine hits the Wine-Searcher API directly, burning quota with no log of the failure. Destructure `{ error }` from the upsert and log it. Severity: **Low**

---

## UX and Performance Issues

**U1 — History cards are tappable but do nothing**
`app/(tabs)/history.tsx:64`:
```tsx
<TouchableOpacity style={styles.card}>
```
No `onPress` prop is set. Users receive visual tap feedback (opacity change) with no result. Either add a route to a historical-result detail screen or replace `TouchableOpacity` with a plain `View`. Severity: **Medium**

**U2 — Profile "back" button adds to the navigation stack instead of navigating back**
`app/(tabs)/profile.tsx:182-184`:
```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```
`router.push` adds a new entry to the history stack. Pressing the system/gesture back button after tapping this creates a cycle: profile → scan → profile. Replace with `router.back()` or remove the button (the tab bar already handles tab switching). Severity: **Low**

**U3 — Safe area insets not applied on scan flow screens**
`app/scan/camera.tsx`, `app/scan/preview.tsx`, `app/scan/results.tsx`, and `app/scan/extracting.tsx` do not use `SafeAreaView` or `useSafeAreaInsets`. On iPhones with Dynamic Island or a notch, header content and the camera capture button can be partially hidden. `app/(tabs)/scan.tsx:181` and `app/(tabs)/profile.tsx:449` hardcode `paddingTop: 96` and `paddingTop: 96` respectively, which is wrong on both notchless and newer devices. Use `useSafeAreaInsets()` from `react-native-safe-area-context` instead. Severity: **Low**

**U4 — Saved preferences do not re-sync after in-session profile edits**
`app/(tabs)/scan.tsx:58-66`:
```tsx
const [prefsLoaded, setPrefsLoaded] = useState(false);
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    setWineTypes(savedPreferences.wineTypes ?? []);
    // ...
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```
`prefsLoaded` is set to `true` on first sync and never reset. If the user edits their preferences on the Profile tab in the same session, React Query invalidates and refetches, `savedPreferences` updates, but the `!prefsLoaded` guard blocks the re-sync. The Scan tab's local state is stale until the app restarts. Remove the `prefsLoaded` guard; the effect handles idempotent re-sync via stable state setters. Severity: **Low**

**U5 — "Subscription email" copy on Profile tab is misleading** *(new)*
`app/(tabs)/profile.tsx:153`:
```tsx
<Text style={styles.emailLabel}>Change your subscription email account</Text>
```
There is no subscription or paid tier visible anywhere in the codebase. This copy implies the app has a subscription product. Users who tap it expecting subscription management will instead see an email-change flow for their auth account. Change to "Change account email" or "Update email address". Severity: **Low**

**U6 — No `wineTypes` field passed to `recommendWines` from `preferences.tsx`**
Same as M4 above — `app/scan/preferences.tsx:28-34` omits `wineTypes` from the `recommendWines` call. The result: the Scan Preferences screen (when reachable) never honours the user's colour preference. Severity: **Medium** *(duplicate of M4)*

---

## Navigation Issues

**N1 — `/scan/preferences` is an orphaned, unreachable screen**
`app/scan/preferences.tsx` is a complete implementation. A search of all route-producing calls in `app/` (`router.push`, `router.replace`, `<Redirect href=`, `href=`) finds no reference to `/scan/preferences`. The screen is unreachable from any navigation path. The old scan flow directed users here after OCR; `extracting.tsx` now goes directly to results. Delete the file or wire it back into the flow. Severity: **Medium**

**N2 — `/scan/url` is a dead-end with a silent redirect**
`app/scan/url.tsx` contains only:
```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```
The URL-based wine list feature has full backend support in `supabase/functions/ocr/index.ts:49-63` but no client-side UI. Any deep link or internal reference to `/scan/url` silently drops the user on the scan tab with no explanation. Severity: **Low**

**N3 — No escape from the extracting screen while processing is in flight**
`app/scan/extracting.tsx` provides no back button or cancel affordance. The `token.active` pattern (lines 65-67) already supports cancellation — setting `token.active = false` will abort the pipeline on its next checkpoint. Adding a "Cancel" button that sets the token inactive and calls `router.replace('/(tabs)/scan')` would let users recover from stalled scans without force-quitting the app. Severity: **Low**

**N4 — No route exists to view a historical scan's full recommendations**
`app/(tabs)/history.tsx` renders session summaries including `topPick.name` (line 72) but there is no detail screen (no `/scan/history-result` or equivalent). The history feature is present but functionally incomplete — users can see a wine name from the past but cannot access the rationale, vintage assessment, or drinking window that were computed at scan time. Severity: **Medium**

**N5 — Authenticated users signing in are routed to scan regardless of profile state**
`app/(auth)/sign-in.tsx:18-19`:
```ts
} else {
  router.replace('/(tabs)/scan');
}
```
After a successful sign-in, the user is always routed to `/(tabs)/scan`, bypassing the `app/index.tsx` routing logic that checks for a missing profile row. A user who creates an account but abandons onboarding before completing it will land on the scan tab on subsequent sign-ins, never reaching `/onboarding`. Route to `/(tabs)/scan` via `router.replace('/');` so the root index logic applies the correct redirect. Severity: **Medium**
