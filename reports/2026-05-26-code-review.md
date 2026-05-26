# Code Review — 2026-05-26

## Bugs and Crashes

### HIGH

**H1 — `scan_sessions` table is never written to**
`app/(tabs)/history.tsx:18` reads from `scan_sessions`. `supabase/migrations/001_initial_schema.sql:15-24` creates the table. No code in `app/` or `src/` inserts or upserts into this table. The history tab will be permanently empty for all users regardless of how many scans they run. Severity: **High**

**H2 — `router.replace()` called during the render phase**
`app/scan/results.tsx:23-25`:
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
Calling `router.replace` directly in the function body (not inside a `useEffect`) is a navigation side effect during render. In React strict mode and concurrent rendering this triggers "Cannot update a component while rendering a different component" warnings and can cause double-navigation or infinite render loops. This should be wrapped in `useEffect(() => { if (!recommendation) router.replace(...); }, [recommendation])`. Severity: **High**

**H3 — `pricing_cache` table has no Row Level Security**
`supabase/migrations/001_initial_schema.sql:32-44` creates `pricing_cache` without `alter table pricing_cache enable row level security`. The `profiles` and `scan_sessions` tables both have RLS enabled. `pricing_cache` is accessible to any caller with the anon key (which is bundled in the app), meaning any client can directly query all cached wine pricing data by calling `supabase.from('pricing_cache').select('*')` with no authentication. Severity: **High**

---

### MEDIUM

**M1 — New authenticated users with no profile row are routed to scan instead of onboarding**
`app/index.tsx:16-21`:
```tsx
if (loading || hasLaunched === null) return null;
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```
`loading` is the auth loading state from `useAuth`. When auth resolves (`loading = false`), `preferences` from React Query (`usePreferences`) is still `undefined` — the Supabase query hasn't resolved yet. The guard `preferences === null` evaluates to `false` when `preferences` is `undefined`, so a brand-new signed-in user with no profile row gets redirected to `/(tabs)/scan` instead of `/onboarding`. The onboarding redirect only fires if the query has already returned and resolved to `null`. A second `isLoading` check from the preferences query is needed before evaluating the null check. Severity: **Medium**

**M2 — Preference saves are fire-and-forget; failures are silent and navigation fires immediately**
`app/onboarding.tsx:37-50`:
```tsx
function handleNext() {
  if (isLast) {
    updatePreferences({ ... });   // mutation.mutate — returns void, not a Promise
    router.replace('/(tabs)/scan');
  }
}
```
`updatePreferences` is `mutation.mutate`, which does not return a Promise. Navigation fires synchronously on the next line before the async save completes. If the Supabase upsert fails, the user has already navigated to the scan tab and preferences are silently lost. `mutation.mutateAsync` should be used with `await`, and the navigation should be inside `onSuccess`. Severity: **Medium**

**M3 — `handleCapture` in camera screen has no error handling**
`app/scan/camera.tsx:29-98`: The entire capture-and-crop flow — `takePictureAsync`, `manipulateAsync` (called twice) — is `async` with no try/catch. On devices where `takePictureAsync` throws (low storage, hardware error), or on image manipulation failures, the promise rejects silently. The user sees no feedback; the camera UI appears to freeze. Severity: **Medium**

**M4 — `recommendWines` called with structurally incomplete input from `preferences.tsx`**
`app/scan/preferences.tsx:28-34`:
```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // missing: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```
`RecommendInput` in `src/services/recommender.ts:5-15` defines all eight fields as required (non-optional). This is a TypeScript compile error. At runtime the edge function receives `undefined` for those fields, so all colour preferences, exclusions, and favourites from the user's profile are silently ignored. Severity: **Medium**

**M5 — `handleScreenshot` has no error handling**
`app/(tabs)/scan.tsx:86-101`: `ImagePicker.launchImageLibraryAsync` is called without a try/catch. On certain Android versions or after permission is revoked mid-session, this call can throw rather than return `{ canceled: true }`. The resulting unhandled rejection produces no user feedback. Severity: **Medium**

**M6 — Preference save errors are only logged to console**
`src/hooks/usePreferences.ts:50`:
```ts
onError: (err) => console.error('[Preferences] Save error:', err),
```
If a Supabase upsert fails (network error, RLS rejection, schema mismatch), the error is silently dropped. The `onboarding.tsx`, `profile.tsx`, and anywhere else `updatePreferences` is called will show no feedback to the user. An `Alert` or toast in `onError` is needed. Severity: **Medium**

---

### LOW

**L1 — `defaultBudget` type mismatch between interface and runtime value**
`src/types/preferences.ts:7` declares `defaultBudget: number` (non-nullable). `src/hooks/usePreferences.ts:26` returns `defaultBudget: data.default_budget ?? null`, which is `null` when unset. TypeScript strict null checks would flag every consumer that treats this as `number`. Severity: **Low**

**L2 — `WINE_SEARCHER_API_KEY` non-null assertion fails silently**
`supabase/functions/wine-searcher-proxy/index.ts:1`:
```ts
const WINE_SEARCHER_API_KEY = Deno.env.get('WINE_SEARCHER_API_KEY')!;
```
If the secret is not configured in the Supabase project, `Deno.env.get(...)` returns `undefined`. The `!` assertion does not throw at this point; instead, the value is used as a URL query param (`api_key=undefined`) and the Wine-Searcher API returns a 401. The root cause (missing env var) is obscured. Same pattern applies to `ANTHROPIC_API_KEY!` in `supabase/functions/ocr/index.ts:3` and `supabase/functions/recommend/index.ts:3`. An explicit startup check with a meaningful error message is preferable. Severity: **Low**

**L3 — No root-level React error boundary**
`app/_layout.tsx:14-39`: There is no `<ErrorBoundary>` wrapping the Stack. Any unhandled JavaScript error thrown by a child component will crash the entire app with a blank or red error screen and no recovery path for the user. Severity: **Low**

---

## Supabase and Edge Function Issues

**S1 — SSRF via unvalidated `url` parameter in OCR function**
`supabase/functions/ocr/index.ts:51-53`:
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
The `url` value is taken directly from `req.json()` with no scheme check, allowlist, or IP-range validation. Any caller with the anon key can pass `http://169.254.169.254/` (AWS metadata) or other internal URLs to probe the Supabase network. This code path is already dead on the client side (`app/scan/url.tsx` just redirects), but the edge function is publicly accessible. At minimum, validate that the URL starts with `https://` and blocklist RFC 1918 address ranges. Severity: **High**

**S2 — No CORS headers on OCR or recommend edge functions**
`supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` return `new Response(...)` without `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, or preflight handling. The OCR function is called via raw `fetch` (not the Supabase client) in `src/api/claude.ts:7-17`. Any Expo Web build will fail with CORS errors on every OCR and recommend call. Add a CORS header helper and handle `OPTIONS` preflight requests. Severity: **Medium**

**S3 — Edge functions receive no user identity; rate limiting and abuse attribution are impossible**
`src/api/claude.ts:7-12` calls edge functions with only `apikey: ANON_KEY` and no `Authorization: Bearer <jwt>` header. Inside the edge functions there is no auth check whatsoever. Any caller who extracts the anon key from the app bundle can make unlimited Claude API calls at the project owner's expense with no per-user attribution or rate limiting. Passing the session JWT and validating it inside the functions (`supabase.auth.getUser(jwt)`) would tie requests to authenticated users. Severity: **Medium**

**S4 — Budget currency hardcoded as `£` regardless of user locale**
`supabase/functions/recommend/index.ts:139`:
```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```
The currency symbol is hardcoded as `£` even though the OCR function extracts a `currency` field per wine and users could be in any country. If a menu uses EUR or USD, the budget constraint in the prompt specifies the wrong currency, and the model may misapply it. The `currency` field from the scan should be passed through and used in the prompt. Severity: **Low**

**S5 — `pricing_cache` upsert error silently ignored in wine-searcher proxy**
`supabase/functions/wine-searcher-proxy/index.ts:68-75`: The `supabase.from('pricing_cache').upsert(...)` call has no `await` error check. If the upsert fails (e.g. schema mismatch after a migration), the function still returns the pricing data, but nothing is cached. Subsequent calls will always hit the Wine-Searcher API, burning quota. The `{ data, error }` return should be destructured and the error logged. Severity: **Low**

---

## UX and Performance Issues

**U1 — Two identical "this may take a minute" messages appear simultaneously during recommendation stage**
`app/scan/extracting.tsx:145-152`:
```tsx
<Text style={styles.body}>
  {stage === 'reading' ? 'This could take a minute or two' : 'Finding your best match…'}
</Text>
<Text style={styles.body}>
  {stage === 'recommending' && 'This may take a minute or two'}
</Text>
```
When `stage === 'recommending'`, the first `<Text>` renders "Finding your best match…" and the second renders "This may take a minute or two" — both visible at the same time below the spinner. The second `<Text>` should be removed; the timing note should be consolidated into the first element. Severity: **Medium**

**U2 — Skipping onboarding loops authenticated users back to onboarding on every launch**
`app/onboarding.tsx:144`: The "Skip for now" button calls `router.replace('/(tabs)/scan')` without saving anything to `profiles`. On the next app launch, `usePreferences` returns `null` (no profile row) and `app/index.tsx:20` redirects back to `/onboarding`. Authenticated users who want to skip onboarding are trapped in an infinite onboarding loop. The fix is to upsert an empty preferences row (or a sentinel value) before navigating away. Severity: **Medium**

**U3 — History cards are tappable but do nothing**
`app/(tabs)/history.tsx:64`:
```tsx
<TouchableOpacity style={styles.card}>
```
The `TouchableOpacity` has no `onPress` prop. Users tap past scan cards and get visual press feedback with no result. Either add a route to view historical results or remove the `TouchableOpacity` wrapper and use a plain `View`. Severity: **Medium**

**U4 — Profile's "back" button pushes a new route instead of navigating back**
`app/(tabs)/profile.tsx:182-184`:
```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```
`router.push` adds a new entry to the navigation stack. Using the hardware/gesture back button after this creates a loop (profile → scan → profile). Replace with `router.back()` or simply remove the button since the tab bar already handles tab switching. Severity: **Low**

**U5 — Safe area not handled on scan flow screens**
`app/scan/camera.tsx`, `app/scan/preview.tsx`, `app/scan/results.tsx`, and `app/scan/extracting.tsx` do not use `SafeAreaView` or `useSafeAreaInsets`. On iPhones with Dynamic Island or standard notch, the top content and the capture button on the camera screen can be partially obscured. `app/(tabs)/scan.tsx:181` and `app/(tabs)/profile.tsx:449` hardcode `paddingTop: 96` rather than using insets, which is too small on some newer devices and too large on older notchless devices. Severity: **Low**

**U6 — Saved preferences don't re-sync after profile edits within the same session**
`app/(tabs)/scan.tsx:58-66`:
```tsx
const [prefsLoaded, setPrefsLoaded] = useState(false);
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    setWineTypes(savedPreferences.wineTypes ?? []);
    ...
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```
`prefsLoaded` is set to `true` after the first sync and never reset. If a user edits their preferences on the Profile tab during the same session, the Scan tab's local state (`wineTypes`, `styleProfiles`, `budget`) is never updated because `prefsLoaded` is still `true`. The guard should be removed; `useEffect` will handle idempotent re-sync on its own since the state setters are stable. Severity: **Low**

---

## Navigation Issues

**N1 — `scan_sessions` write path is missing, so history tab is structurally broken**
Covered above as H1. The history tab has a complete read implementation but there is no corresponding write path anywhere in the app to create sessions. Severity: **High**

**N2 — `/scan/preferences` is an orphaned screen**
`app/scan/preferences.tsx` is a fully implemented screen. A search of all `.tsx` files in `app/` confirms no `router.push('/scan/preferences')` or `href="/scan/preferences"` exists. The screen is unreachable from any navigation path in the app. The old flow apparently directed users here after OCR; the new flow in `extracting.tsx` goes directly to results. The file should either be wired back in or deleted. Severity: **Medium**

**N3 — `/scan/url` is a dead-end with silent redirect**
`app/scan/url.tsx` contains only:
```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```
The URL wine list feature has backend support in `supabase/functions/ocr/index.ts:49-63` but no client-side UI. Any deep link or internal reference to `/scan/url` silently drops the user at the scan tab with no explanation. Severity: **Low**

**N4 — No escape from the extracting screen during processing**
`app/scan/extracting.tsx` has no back button or cancel affordance. Once OCR starts, the user is locked in. If the process stalls (network timeout, slow response), the user cannot return to the scan tab without killing the app. The `token.active` pattern already supports cancellation; adding a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')` would complete this. Severity: **Low**

**N5 — No route to view a historical scan's recommendations**
`app/(tabs)/history.tsx` renders scan session summaries but tapping them does nothing (N, U3). There is no `/scan/history-result` or similar route to display a past `recommendation` object. The history feature is visually present but functionally incomplete. Severity: **Medium**
