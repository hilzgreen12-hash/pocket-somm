# Code Review — 2026-06-17

Automated review covering: `app/`, `src/`, and `supabase/`.

---

## Bugs and Crashes

### HIGH

**1. Onboarding skipped for new authenticated users**
`app/index.tsx:20`
```ts
if (preferences === null) return <Redirect href="/onboarding" />;
```
`preferences` comes from `usePreferences()`, which is a React Query data value. Before the Supabase query resolves it is `undefined`, not `null`. The gate only intercepts when the profile row genuinely doesn't exist (`null`). During the network round-trip it is `undefined`, so the condition is false and the user falls through to the `/(tabs)/scan` redirect (line 21). New authenticated users silently bypass onboarding. Fix: also guard on `undefined` — `if (!preferences)` — or track the preferences loading state alongside `useAuth().loading`.
- Severity: **High**

**2. `router.replace()` called synchronously during render**
`app/scan/results.tsx:22–25`
```ts
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
Calling `router.replace` in the render path (outside a `useEffect`) is a side-effect during render. In Expo Router / React this triggers "Cannot update a component while rendering a different component" warnings and can cause navigation loops when the component is rendered twice under React StrictMode or fast-refresh. Move to a `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.
- Severity: **High**

**3. No React Error Boundary in the root layout**
`app/_layout.tsx` (entire file)
No `ErrorBoundary` class component wraps the navigator. Any synchronous throw during render (e.g., accessing `.name` on an undefined recommendation wine, or a font loading edge case) crashes the app with a red-screen and forces a full restart. Wrap the `Stack` in a minimal error boundary that shows a recovery screen.
- Severity: **High**

**4. SSRF via unvalidated `url` parameter in OCR edge function**
`supabase/functions/ocr/index.ts:50–53`
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
The `url` body field is fetched verbatim by the server without any validation, allowlist, or scheme check. Because the function is callable with only the public anon key (no auth check), any external actor can POST `{ "url": "http://169.254.169.254/latest/meta-data" }` or an internal Supabase infrastructure address and receive the response. At minimum: validate the scheme is `https`, optionally add a domain allowlist, or remove URL support entirely (the `app/scan/url.tsx` screen already redirects away from this feature).
- Severity: **High**

**5. `scan_sessions` RLS policy missing `WITH CHECK` on INSERT**
`supabase/migrations/001_initial_schema.sql:27–31`
```sql
create policy "Users manage own scans"
  on scan_sessions for all
  using (auth.uid() = user_id);
```
PostgreSQL evaluates `USING` only for SELECT, UPDATE, and DELETE row filtering. For INSERT operations it has no effect — only `WITH CHECK` is evaluated. Without a `WITH CHECK (auth.uid() = user_id)` clause, any authenticated user can insert a `scan_sessions` row with an arbitrary `user_id`, including another user's UUID. Add `WITH CHECK (auth.uid() = user_id)` to this policy.
- Severity: **High**

---

### MEDIUM

**6. Wrong property path reads history recommendation data**
`app/(tabs)/history.tsx:71`
```ts
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```
`RecommendationResponse` has a `wines: WineRecommendation[]` array and a `summary: string`. There is no `topPick` property. This condition is always falsy; the top wine name is never rendered on any history card. Fix: `item.recommendation?.wines?.[0]?.name`.
- Severity: **Medium**

**7. Upsert errors silently swallowed in `usePreferences`**
`src/hooks/usePreferences.ts:38–48`
```ts
await supabase.from('profiles').upsert({ user_id: session.user.id, ... });
```
The `{ data, error }` return value is discarded. If the upsert fails (e.g., RLS violation, network error), `mutationFn` resolves normally and `onError` is never invoked. The user receives no feedback and the preference update is silently lost. Fix: destructure `{ error }`, and if truthy `throw error` so React Query routes it to `onError`.
- Severity: **Medium**

**8. No capture guard — double-tap fires two concurrent photo pipelines**
`app/scan/camera.tsx:29–98`
`handleCapture` is an async function with no guard state. If the user taps the shutter button twice before the first `takePictureAsync` resolves, two concurrent pipelines start: two image manipulations, two `setImage` calls, and two `router.push('/scan/preview')` calls. Add a `const [capturing, setCapturing] = useState(false)` guard and return early if `capturing` is true.
- Severity: **Medium**

**9. `pricing_cache` table has no RLS**
`supabase/migrations/001_initial_schema.sql:33–44`
```sql
create table pricing_cache (
  wine_key text primary key,
  ...
);
```
`ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY` is never called. Supabase's default grants give the `anon` role read and write access to all public tables without RLS. Any unauthenticated client can read or overwrite the pricing cache via the REST API, poisoning cost estimates or critic scores shown to all users. Add `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY;` and a read-only policy for authenticated users, plus a service-role-only write policy.
- Severity: **Medium**

**10. `recommendWines` called with incomplete input from preferences screen**
`app/scan/preferences.tsx:28–33`
```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
});
```
`RecommendInput` (defined in `src/services/recommender.ts:5–15`) requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` — none of which are passed here. TypeScript does not flag this because the interface fields aren't marked optional, which suggests a type-checking gap. At runtime the edge function receives `undefined` for those fields and silently ignores them via optional chaining, producing a degraded recommendation. Additionally, this screen is never navigated to anywhere in the app (see Navigation Issues below), so this code path is dead.
- Severity: **Medium**

**11. Missing `Authorization` header on Edge Function calls**
`src/api/claude.ts:8–13`
```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
},
```
Only the `apikey` routing header is sent. The `Authorization: Bearer <jwt>` header is omitted. Edge functions that need to identify the calling user (e.g., to log a scan session or enforce per-user rate limits) cannot do so. This also means any future auth-aware logic inside the functions would silently see no user context. Use `supabase.functions.invoke()` (which automatically attaches the session JWT) instead of raw `fetch`, or add `Authorization: 'Bearer ' + (await supabase.auth.getSession()).data.session?.access_token`.
- Severity: **Medium**

**12. Budget constraint in recommend prompt hardcodes GBP symbol**
`supabase/functions/recommend/index.ts:139,154`
```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
// ...
`Budget: up to £${budget ?? 'unlimited'} per bottle`
```
The currency symbol is hardcoded as `£` in both the hard-rule and the user context block. When used in non-GBP markets, the model may misinterpret the budget (e.g., a `budget=150` USD value being treated as £150). The `currency` field exists on `ScanPreferences` but is not threaded through to the prompt.
- Severity: **Medium**

---

### LOW

**13. Tappable history cards navigate nowhere**
`app/(tabs)/history.tsx:64`
```ts
<TouchableOpacity style={styles.card}>
```
The `TouchableOpacity` has no `onPress` prop. On all platforms, tapping a history card produces a visible press animation but does nothing. This is confusing UX — either add an `onPress` that navigates to a detail view or change it to a `View`.
- Severity: **Low**

**14. `handleSignOut` silently swallows sign-out errors**
`app/(tabs)/profile.tsx:130–133`
```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```
If `signOut()` returns an error (e.g., network failure), it is discarded. The user is still navigated to the sign-in screen but the local session tokens may not be fully cleared. Check the `{ error }` return and show an `Alert` on failure.
- Severity: **Low**

**15. No cancel affordance during scan extraction**
`app/scan/extracting.tsx:139–161`
The loading UI tells users "Please don't leave this page while we're searching" but provides no escape hatch. If the Claude API is slow (common for large wine lists), users are locked on a spinner with no way to abort except force-quitting the app. Add a Cancel button that calls `router.replace('/(tabs)/scan')` and sets `token.active = false`.
- Severity: **Low**

**16. Scan tab preference state does not re-sync after profile updates in same session**
`app/(tabs)/scan.tsx:59–66`
```ts
const [prefsLoaded, setPrefsLoaded] = useState(false);
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    ...
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```
`prefsLoaded` is set to `true` on first load and never reset. If the user updates their preferences on the Profile tab and navigates back to the Scan tab within the same session, the scan tab still reflects stale values. Remove the `prefsLoaded` flag and sync unconditionally, or use a `useRef` to track the last synced preferences object.
- Severity: **Low**

---

## Supabase and Edge Function Issues

**1. No authentication check on any edge function**
`supabase/functions/ocr/index.ts`, `supabase/functions/recommend/index.ts`, `supabase/functions/wine-searcher-proxy/index.ts`
All three functions accept requests from any caller with only the public anon key. There is no JWT verification step (e.g., `const { user } = await supabaseClient.auth.getUser(req.headers.get('Authorization'))`). This means:
- OCR and recommend functions (which call the Claude API) can be invoked by anyone, incurring API costs.
- The wine-searcher proxy can be called freely, burning Wine-Searcher API quota.
Add an auth check at the top of each function and return 401 if no valid session is present.

**2. OCR function does not validate image size before sending to Claude**
`supabase/functions/ocr/index.ts:65–81`
The image is accepted and forwarded to Claude with no size limit. The client resizes to 1600px wide (in `src/services/ocr.ts:23–29`), but the edge function itself places no cap on the base64 payload size. A malicious or misconfigured client could send an extremely large image, causing slow responses or exceeding Claude's message size limits.

**3. Recommend function prompt doesn't communicate today's date**
`supabase/functions/recommend/index.ts:38–43`
The drinking window logic says "assess whether the wine is currently within its optimal drinking window as of today's date," but today's date is never injected into the prompt. The model must guess the current year from its training cutoff. For a real-time recommendation engine this matters — a wine the model thinks is "Approaching Peak" in 2024 may already be "Peak" or "Fading" in 2026. Inject `new Date().getFullYear()` or the full ISO date into the user message.
- This is a **medium** quality issue that affects recommendation accuracy.

---

## UX and Performance Issues

**1. Preferences screen accordion re-renders entire scroll tree on toggle**
`app/(tabs)/profile.tsx` and `app/(tabs)/scan.tsx`
Every accordion toggle calls `LayoutAnimation.configureNext` which animates the entire tree, not just the toggled section. On the Profile tab this is particularly noticeable because the scroll view contains six independently-togglable sections each containing large `ChipPicker` lists. Consider memoizing individual sections with `React.memo` or splitting each accordion into a separate component so re-renders are scoped.
- Severity: **Low** (performance)

**2. `ChipPicker` duplicates state with local mirror**
`src/components/preferences/ChipPicker.tsx:16,19–21`
```ts
const [local, setLocal] = useState(selected);
useEffect(() => { setLocal(selected); }, [selected]);
```
The component maintains a local copy of `selected` and re-syncs via `useEffect` whenever the parent prop changes. This causes an extra render on every parent-initiated update. Since `onChange` is called synchronously on every toggle, and the parent in Profile tab (`updatePreferences`) sends the new value to Supabase and triggers a React Query invalidation, there's a window where `local` and `selected` diverge. Prefer fully controlled behaviour (remove local state, use `selected` directly) unless optimistic updates are deliberately intended.
- Severity: **Low** (performance/correctness)

**3. Loading state on History tab shows unstyled text**
`app/(tabs)/history.tsx:40–44`
```ts
<View style={styles.center}>
  <Text style={typography.body}>Loading history…</Text>
</View>
```
`typography.body` only sets `fontSize` and `lineHeight`, not colour. The text inherits the default black colour, which is invisible against the dark background during loading. Every other empty/error state in the file applies `colors.text` or `colors.textMuted`. Add `color: colors.textMuted` to this text.
- Severity: **Low** (UX)

**4. Sign-in screen has no spinner during sign-in**
`app/(auth)/sign-in.tsx:44–46`
The button text changes to "Signing in…" but there's no visual feedback beyond the text change — the button colour and shape are unchanged. Contrast with the Email Change button in profile which shows an `ActivityIndicator`. Minor inconsistency; consider adding a spinner.
- Severity: **Low** (UX)

**5. Duplicate body-text lines during `recommending` stage**
`app/scan/extracting.tsx:146–152`
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
During `recommending`, two separate `<Text>` elements are rendered: one saying "Scoring by critic rating…" and immediately below it "This may take a minute or two." The second duplicates the sentiment of the first and should be collapsed or removed.
- Severity: **Low** (copy)

---

## Navigation Issues

**1. `/scan/url.tsx` is a dead end — feature not implemented**
`app/scan/url.tsx:1–5`
```ts
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```
The URL-based scan feature redirects to the scan tab immediately. The OCR edge function supports a `url` parameter but the client never navigates here. Either implement the feature or remove the route to reduce confusion.

**2. `/scan/preferences.tsx` is an orphan — no navigation leads here**
`app/scan/preferences.tsx`
The preferences override screen (which lets users re-filter after OCR) is never navigated to from anywhere in the scan flow. The flow is: camera → preview → extracting → results. The intended navigation point was presumably between `extracting` and `results`, but `extracting.tsx` calls `router.replace('/scan/results')` directly. The screen is dead code.

**3. History cards are tappable but have no destination route**
`app/(tabs)/history.tsx:64`
Each history card is a `TouchableOpacity` with no `onPress`. There is no `/history/[id]` detail route. Tapping is a dead-end interaction. Either add a detail route or make the cards non-interactive `View`s.

**4. Camera screen has no back/dismiss button**
`app/scan/camera.tsx`
On iOS, the camera screen fills the display and there is no back button or swipe gesture (the camera view consumes touch events). The Android hardware back button works, but iOS users have no affordance to cancel without taking a photo. Add a dismiss icon (e.g., `×`) in the top-left corner that calls `router.back()`.
