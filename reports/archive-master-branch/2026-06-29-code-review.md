# Code Review — 2026-06-29

**Status:** No application code has changed since the initial commit. All findings from the 2026-06-28 report remain open. This review adds three new findings (H10, M15, L9) and carries forward all prior unresolved issues with verified file paths and line numbers.

---

## Bugs and Crashes

### High Severity

**H1 — Invalid Claude model ID breaks every scan (carry-forward)**
`supabase/functions/ocr/index.ts:59,65` · `supabase/functions/recommend/index.ts:170`

Both edge functions pass `model: 'claude-opus-4-6'` to the Anthropic SDK. The current valid Opus model identifier is `claude-opus-4-8`. Every call to either function returns a model-not-found error from the API. OCR and recommendation are completely broken for all users. No scan can succeed.

Fix: replace `'claude-opus-4-6'` with `'claude-opus-4-8'` in all three locations.

---

**H2 — Auth initialisation hangs permanently on network failure (carry-forward)**
`src/hooks/useAuth.tsx:17–20`

```tsx
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

No `.catch()` is attached. If `getSession()` rejects (network error, Supabase unavailable), `setLoading(false)` is never called. The `loading` state stays `true` forever. `app/index.tsx:16` returns `null` while `loading` is `true`, so the app displays a blank screen with no way out short of a force-quit.

Fix: add `.catch(() => setLoading(false))` or convert to `async/await` with `try/finally`.

---

**H3 — `AsyncStorage.getItem` has no error handler; app hangs on storage failure (carry-forward)**
`app/index.tsx:13`

```tsx
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```

No `.catch()` is attached. If AsyncStorage fails (device full, corrupted storage, first boot on some Android versions), the promise rejects silently and `hasLaunched` remains `null` permanently. Line 16 returns `null` while `hasLaunched === null`, leaving the app on a blank screen.

Fix: `.catch(() => setHasLaunched(false))` so the app can proceed to the welcome screen.

---

**H4 — `scan_sessions` table is never written to; history is permanently empty (carry-forward)**
`app/(tabs)/history.tsx:16–25`

The history tab reads from `scan_sessions`. No code anywhere in `app/` or `src/` performs an insert or upsert into this table. Every user's history is permanently empty regardless of how many scans they complete. The entire history feature is structurally broken on the write side.

---

**H5 — Auth form buttons freeze permanently when auth call throws (carry-forward)**
`app/(auth)/sign-in.tsx:12–20` · `app/(auth)/sign-up.tsx:12–22` · `app/(tabs)/profile.tsx:110–118`

All three handlers follow this pattern:
```tsx
setLoading(true);
const { error } = await supabase.auth.signXxx({ ... });
setLoading(false); // unreachable if the line above throws
```

If the auth call throws (DNS failure, unexpected SDK error), `setLoading(false)` is skipped. The button stays in loading state for the rest of the session.

Fix: move `setLoading(false)` into a `finally` block in all three functions.

---

**H6 — `router.replace()` called in the render body, not in an effect (carry-forward)**
`app/scan/results.tsx:22–25`

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

`router.replace` is a navigation side effect called unconditionally during the render phase. This triggers "Cannot update a component while rendering a different component" warnings and can cause double-navigation or infinite render loops under React concurrent mode.

Fix: `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

---

**H7 — Pre-filter discards wines within the scan-level budget override (carry-forward)**
`app/scan/extracting.tsx:37–39`

```tsx
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
}
```

`prefs` is `userProfile` — the saved Supabase preferences, not the per-scan budget set in the scan store. If a user's saved profile budget is £80 but they override it to £150 for this scan, `preFilterWines` still eliminates every wine priced £81–£150 before they reach the recommender.

Fix: pass the scan-level budget into `preFilterWines` and use whichever value is higher.

---

**H8 — `usePreferences` query error returns `null`, incorrectly triggering onboarding for existing users (carry-forward)**
`src/hooks/usePreferences.ts:18–21` · `app/index.tsx:19–21`

`null` is returned both when a database error occurs and when no profile row exists. These two cases are indistinguishable at the call site. An authenticated user who has already completed onboarding is silently redirected to `/onboarding` on every cold start whenever a transient Supabase error occurs.

Fix: return a sentinel value (e.g. `{ error: true }`) instead of `null` on query failure and handle it separately in `index.tsx`.

---

**H9 — RLS policies on `profiles` and `scan_sessions` have no `WITH CHECK` clause; users can insert rows with arbitrary `user_id` (carry-forward)**
`supabase/migrations/001_initial_schema.sql:11–13,26–28`

```sql
create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = user_id);

create policy "Users manage own scans"
  on scan_sessions for all
  using (auth.uid() = user_id);
```

In PostgreSQL RLS, the `USING` expression applies to `SELECT`, `UPDATE`, and `DELETE` (filtering existing rows). For `INSERT`, only the `WITH CHECK` expression is consulted. Because neither policy specifies `WITH CHECK`, the effective insert check is `WITH CHECK (TRUE)` — any authenticated user can insert a `profiles` or `scan_sessions` row with a `user_id` belonging to another user. This allows cross-user data poisoning: an attacker can insert a malicious preferences row under a victim's `user_id`, overwriting their profile on the next `upsert`.

Fix: add `with check (auth.uid() = user_id)` to both policies.

---

**H10 — `scan/preferences.tsx` is missing five required `RecommendInput` fields; enabling route N2 would cause an immediate build failure (new)**
`app/scan/preferences.tsx:28–34`

```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // MISSING: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```

`RecommendInput` (`src/services/recommender.ts:5–15`) declares `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` as required fields. All five are absent from the call in `preferences.tsx`. This is a TypeScript compile error that is currently hidden only because the route is orphaned (N2). If anyone wires `/scan/preferences` into the navigation flow, the build will fail to compile before reaching the missing-route issue. Additionally, because these fields would be `undefined` at runtime in a non-strict build, the recommender edge function would receive incomplete preference data, silently dropping colour restriction, regional exclusions, and grape exclusions for this code path.

Fix: read the missing fields from `usePreferences()` and include them in the `recommendWines` call, mirroring the pattern in `app/scan/extracting.tsx:101–112`.

---

### Medium Severity

**M1 — `recommendation.topPick` does not exist; wine names never render on history cards (carry-forward)**
`app/(tabs)/history.tsx:71–73`

`RecommendationResponse` has `wines: WineRecommendation[]` and `summary: string`, not a `topPick` field. This always evaluates to `undefined`; the wine name line never renders on any history card.

Fix: `item.recommendation?.wines?.[0]?.name`.

---

**M2 — New signed-in users routed to scan instead of onboarding (carry-forward)**
`app/index.tsx:19–21`

When auth resolves but the preferences query is still in flight, `preferences` is `undefined` (the React Query loading state), not `null`. The guard evaluates to `false` and the user is sent to scan. A brand-new user with no profile row bypasses onboarding on first launch.

Fix: also destructure and check `isLoading` from `usePreferences`.

---

**M3 — Onboarding save is fire-and-forget; navigation fires before save completes (carry-forward)**
`app/onboarding.tsx:37–47`

```tsx
updatePreferences({ wineTypes, styleProfiles, ... });
router.replace('/(tabs)/scan');
```

`updatePreferences` is `mutation.mutate`, which returns `void`. `router.replace` fires synchronously on the next line while the async upsert is still in flight. If the network drops or Supabase rejects the upsert, the user navigates away having seen no error.

Fix: use `mutation.mutateAsync` with `await`, wrap in `try/catch`, and only navigate on success.

---

**M4 — `handleCapture` in camera screen has no error handling (carry-forward)**
`app/scan/camera.tsx:29–98`

`takePictureAsync` (line 32) and two calls to `ImageManipulator.manipulateAsync` (lines 44, 88) are all awaited inside an async function with no `try/catch`. Hardware errors, low-storage conditions, or manipulation failures produce unhandled promise rejections.

Fix: wrap the entire function body in `try/catch` and show an `Alert` on failure.

---

**M5 — `handleSignOut` navigates on failure, leaving stale session in SecureStore (carry-forward)**
`app/(tabs)/profile.tsx:130–133`

`signOut()` returns `{ error }`, which is not checked. If it fails, navigation still proceeds. The session token remains in SecureStore and the user appears logged in on the next cold start.

Fix: destructure `{ error }`, show an `Alert` if non-null, and only navigate on success.

---

**M6 — Double-tap on capture button pushes `/scan/preview` twice (carry-forward)**
`app/scan/camera.tsx:29–98`

`handleCapture` is async with no guard against concurrent invocations. A double-tap before `takePictureAsync` resolves starts two parallel capture flows, both calling `router.push('/scan/preview')`. The user must press back twice to exit the preview screen.

Fix: add an `isCapturing` ref that returns early if already `true`.

---

**M7 — Skipping onboarding traps authenticated users in an infinite redirect loop (carry-forward)**
`app/onboarding.tsx:144`

The "Skip for now" button navigates to `/(tabs)/scan` without writing a profile row. On the next cold start, `usePreferences` returns `null` (no row exists) and `app/index.tsx:20` redirects back to `/onboarding`. Authenticated users who skip are forced into onboarding on every launch.

Fix: upsert an empty preferences row before navigating on skip.

---

**M8 — Missing `app/auth/callback.tsx` route; email-change confirmation link drops users silently (carry-forward)**
`app/(tabs)/profile.tsx:113`

```tsx
const redirectTo = Linking.createURL('auth/callback');
```

No `app/auth/callback.tsx` exists. When the user taps the email-confirmation link, Expo Router cannot match the route and the user is dropped at the root index with no acknowledgment that the email change succeeded or failed.

---

**M9 — `handleScreenshot` has no error handling (carry-forward)**
`app/(tabs)/scan.tsx:86–101`

`ImagePicker.launchImageLibraryAsync` is called without `try/catch`. On some Android versions or after mid-session permission revocation this throws rather than returning `{ canceled: true }`, producing an unhandled rejection with no user feedback.

---

**M10 — `preFilterWines` can produce an empty array; recommender is called with zero wines (carry-forward)**
`app/scan/extracting.tsx:99–112`

`preFilterWines` applies hard budget, disliked-region, and disliked-grape filters. If every wine on the list fails the filter, `winesForRecommend` is an empty array. No guard exists before `recommendWines` is called. The model may hallucinate wines not on the list, return an empty array, or error.

Fix: check `winesForRecommend.length === 0` before calling `recommendWines` and show an informative error message.

---

**M11 — Font load failure hangs app on blank screen (carry-forward)**
`app/_layout.tsx:15`

`Font.useFonts` returns `[boolean, Error | null]`. The error element is discarded. If any font file fails to load, `fontsLoaded` stays `false` and the app displays a blank screen indefinitely.

Fix: destructure the error element and show a fallback UI.

---

**M12 — History query failure silently renders "No scans yet" instead of an error (carry-forward)**
`app/(tabs)/history.tsx:12–55`

`isError` is not destructured from `useQuery`. When the query fails, `isLoading` becomes `false` and `sessions` is `undefined`. The component renders "No scans yet" — misleading copy hiding the actual error.

Fix: destructure `isError` and render a distinct error state with a retry affordance.

---

**M13 — Results screen renders no wine cards and no empty-state message when `wines` array is empty (carry-forward)**
`app/scan/results.tsx:49–115`

The Zod schema at `src/services/recommender.ts:56` validates `wines` as `z.array(WineRecommendationSchema).max(3)`, which accepts an empty array. If zero wines are returned, the screen shows the header, summary, and "Start Another Search" with no cards and no explanation.

Fix: add an explicit check for `recommendation.wines.length === 0` and render an appropriate empty-state message.

---

**M14 — Auth forms allow empty submission; Supabase error messages are cryptic to users (carry-forward)**
`app/(auth)/sign-in.tsx:12–21` · `app/(auth)/sign-up.tsx:12–22`

Neither `handleSignIn` nor `handleSignUp` validates inputs before calling Supabase. Submitting a blank email and password sends the request to the server and surfaces Supabase's raw error string in an `Alert.alert`. The Supabase error for an empty email is `"You must provide either an email or phone number and a password"` — this error copy is not user-friendly and could expose implementation details.

Fix: add explicit guards (`if (!email.trim() || !password.trim()) { Alert.alert('Please enter your email and password.'); return; }`) before calling `supabase.auth.signInWithPassword` or `supabase.auth.signUp`.

---

**M15 — `Promise.all` over multiple screenshots holds all base64 payloads in memory simultaneously (new)**
`app/scan/extracting.tsx:77`

```tsx
const results = await Promise.all(imageUris.map(extractWineList));
```

`extractWineList` → `prepareImage` resizes and JPEG-encodes each image to a base64 string in memory before uploading. With `Promise.all`, all N images are compressed and encoded concurrently. A 1600 px-wide JPEG at 0.85 quality is typically 400–900 KB; four images produce 1.6–3.6 MB of in-memory base64 strings simultaneously, held until all network calls resolve. On devices with limited RAM (older iPhones, budget Android devices), this can trigger jank or an OS-level memory warning mid-extraction.

Fix: process images sequentially with a `for…of` loop and merge the wine lists after each call, or limit concurrency to two at a time with a semaphore pattern.

---

### Low Severity

**L1 — Disliked region/grape free-text inputs do not enforce the 5-item cap (carry-forward)**
`app/(tabs)/profile.tsx:88–101`

`handleAddCustomDislikedRegion` (line 88) and `handleAddCustomDislikedGrape` (line 96) check `current.includes(trimmed)` but not `current.length >= 5`, unlike the corresponding "likes" handlers at lines 75 and 83. The disliked lists can grow unbounded through the free-text input path.

---

**L2 — `profiles.updated_at` never updates; column reflects creation time only (carry-forward)**
`supabase/migrations/001_initial_schema.sql:7` · `src/hooks/usePreferences.ts:38–47`

No `before update` trigger sets `updated_at = now()` on row modification. The upsert does not include `updated_at` in the payload. Every profile row shows its original creation timestamp.

---

**L3 — `defaultBudget` type mismatch between interface and runtime value (carry-forward)**
`src/types/preferences.ts:7` · `src/hooks/usePreferences.ts:26`

The interface declares `defaultBudget: number` (non-nullable). The hook returns `defaultBudget: data.default_budget ?? null`. TypeScript strict-null checks flag every consumer that treats `defaultBudget` as non-nullable.

---

**L4 — Retry after duplicate grape detection is not itself checked for duplicates (carry-forward)**
`src/services/recommender.ts:75–82`

`hasDuplicateGrapes` is not run on `parsed2.data` before returning it. If the retry still contains duplicates, they are silently returned. If the retry fails schema validation, the original duplicate-grape result is returned instead of throwing.

---

**L5 — `JSON.parse(text)` in `invokeFunction` throws raw `SyntaxError` on non-JSON responses (carry-forward)**
`src/api/claude.ts:17`

If a Cloudflare 502 or Supabase maintenance page is returned, `JSON.parse` throws a `SyntaxError` whose message propagates through to the user-visible error detail in `extracting.tsx:120`.

Fix: wrap `JSON.parse(text)` in `try/catch` and rethrow as "Service temporarily unavailable."

---

**L6 — `WineRecommendationCard` is dead code (carry-forward)**
`src/components/results/WineRecommendationCard.tsx`

This 196-line component is never imported by any file. `app/scan/results.tsx` reimplements the wine card layout inline. Two divergent representations exist and must be kept in sync independently.

---

**L7 — No root-level React error boundary (carry-forward)**
`app/_layout.tsx:30–39`

No `<ErrorBoundary>` wraps the `<Stack>`. Any unhandled render error in any screen crashes the entire app with a white screen and no recovery path.

---

**L8 — `UserPreferences.defaultCurrency` declared in type but has no database column and is never populated (carry-forward)**
`src/types/preferences.ts:6` · `src/hooks/usePreferences.ts:16–31`

No `default_currency` column exists in any migration. The query does not select it, and the returned object never sets it. Any code path that reads `preferences.defaultCurrency` receives `undefined`.

---

**L9 — `hasDuplicateGrapes` only splits on `/`; blend separators `,`, `-`, and `&` are not handled (new)**
`src/services/recommender.ts:61–64`

```tsx
const grapes = wines
  .map((w) => w.grape?.split('/')[0].trim().toLowerCase())
  .filter(Boolean) as string[];
```

The function extracts the primary grape by splitting on `/` only. Common blend notations include `"Cabernet Sauvignon, Merlot"`, `"Cabernet Sauvignon-Merlot"`, and `"Grenache & Syrah"`. A wine described as `"Cabernet Sauvignon, Merlot"` is treated as a single unique grape string rather than being normalised to `"Cabernet Sauvignon"`. If two different blends share the same primary variety but use different separators, the duplicate check produces a false negative and the constraint goes unenforced. Combined with L4 (retry not re-checked), the grape diversity guarantee can silently fail.

Fix: normalise on all four separators — `grape?.split(/[\/,\-&]/)[0].trim().toLowerCase()`.

---

---

## Supabase and Edge Function Issues

**S1 — SSRF via unvalidated `url` parameter in OCR edge function (carry-forward)**
`supabase/functions/ocr/index.ts:51–53`

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

`url` is read directly from the request body with no scheme check or IP-range validation. Any caller with the anon key can pass `http://169.254.169.254/latest/meta-data/` or other RFC 1918 / link-local addresses to probe the Supabase internal network.

Fix: validate `url` starts with `https://` and reject requests targeting private IP ranges before fetching.

---

**S2 — Edge functions accept unauthenticated callers; unlimited API spend possible (carry-forward)**
`src/api/claude.ts:9–12`

The `invokeFunction` call sends only `apikey: ANON_KEY`, no `Authorization: Bearer <jwt>`. The edge functions perform no identity check. Any actor who extracts the anon key from the app bundle can make unlimited Claude API calls at the project owner's expense with no per-user attribution or rate limiting.

Fix: pass the session JWT in the `Authorization` header; validate it inside each function with `supabase.auth.getUser(jwt)`.

---

**S3 — `pricing_cache` has no Row Level Security (carry-forward)**
`supabase/migrations/001_initial_schema.sql:32–44`

`profiles` and `scan_sessions` have `alter table … enable row level security`. `pricing_cache` does not. Any caller with the anon key can read or overwrite all cached pricing data without authentication.

---

**S4 — No CORS headers on OCR or recommend edge functions (carry-forward)**
`supabase/functions/ocr/index.ts` · `supabase/functions/recommend/index.ts`

Neither function returns `Access-Control-Allow-Origin` or handles `OPTIONS` preflight. Any Expo Web build will fail with CORS errors on every OCR and recommendation call.

---

**S5 — Budget constraint hardcodes `£` regardless of menu currency (carry-forward)**
`supabase/functions/recommend/index.ts:139,155` · `app/scan/results.tsx:84`

The recommend prompt injects `£${budget}` regardless of currency. The results screen always renders `£{wine.menuPrice}`. EUR and USD menus receive a budget constraint in the wrong currency symbol.

---

**S6 — Upsert result in `usePreferences` is not checked for errors (carry-forward)**
`src/hooks/usePreferences.ts:38–47`

```ts
await supabase.from('profiles').upsert({ ... });
```

The Supabase client resolves with `{ data, error }` rather than throwing. Because the result is not destructured, any error (RLS rejection, network failure, schema mismatch) is silently discarded. `onError` at line 50 is never invoked.

Fix: destructure the result and throw if `error` is non-null.

---

**S7 — `pricing_cache` upsert failure is silently ignored (carry-forward)**
`supabase/functions/wine-searcher-proxy/index.ts:68–75`

The `supabase.from('pricing_cache').upsert(...)` result is not checked. If the upsert fails, the function still returns pricing data but nothing is cached. All subsequent requests for the same wine go directly to Wine-Searcher, burning quota silently.

---

**S8 — No request timeout on URL fetch in OCR function (carry-forward)**
`supabase/functions/ocr/index.ts:51`

No `AbortSignal.timeout(...)` is passed. A slow or unresponsive URL hangs the Deno function until Supabase's wall-clock limit kills it (typically 60 s), burning the entire function budget and returning an opaque timeout error to the client.

Fix: `fetch(url, { signal: AbortSignal.timeout(10_000), headers: { ... } })`.

---

**S9 — Recommend function does not inject the current date; drinking window assessments are based on stale training data (carry-forward)**
`supabase/functions/recommend/index.ts:37–43`

The system prompt instructs the model to assess drinking windows "as of today's date":
```
Assess whether the wine is currently within its optimal drinking window as of today's date.
```

No actual date is injected into the request. The model uses its internal sense of "now" from training data, which can be months behind the real date. A wine assessed as "Approaching" peak in the model's training cut-off may actually be at "Peak" or beginning to "Fade" by the time the user scans it. This makes the drinking-window feature unreliable.

Fix: inject today's date into the user message: `Today's date: ${new Date().toISOString().slice(0, 10)}.` Add this line to the `userContext` block at line 150, before the wine list.

---

---

## UX and Performance Issues

**U1 — Extracting screen copy references a non-existent "filters" UI (carry-forward)**
`app/scan/extracting.tsx:155–159`

The phrase "setting filters for this search" implies an in-scan filter UI accessible from this screen. No such UI exists — `app/scan/preferences.tsx` is an orphaned screen unreachable from any navigation path (see N2). Users who follow this instruction will find nothing to tap.

Fix: remove the "Change your preferences for this result only…" sentence until the preferences screen is wired in.

---

**U2 — History cards show press feedback but do nothing on tap (carry-forward)**
`app/(tabs)/history.tsx:64`

`<TouchableOpacity style={styles.card}>` has no `onPress`. Users receive the visual ripple affordance with no result. Replace with `View` until a detail route is implemented, or add `onPress` with navigation.

---

**U3 — Profile back button pushes a new stack entry instead of navigating back (carry-forward)**
`app/(tabs)/profile.tsx:182–184`

```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

`router.push` adds a new entry to the history stack. The arrow-back icon implies popping the stack. Replace with `router.back()` or remove the button.

---

**U4 — Two near-identical "may take a minute" messages appear simultaneously during recommendation (carry-forward)**
`app/scan/extracting.tsx:144–152`

When `stage === 'recommending'`, line 148 renders "Scoring by critic rating, vintage quality and value" and lines 150–152 render "This may take a minute or two" as a second, unconditional `<Text>` element — both visible at the same time alongside the stage title.

---

**U5 — Scan preferences not re-synced after in-session profile edits (carry-forward)**
`app/(tabs)/scan.tsx:58–66`

`prefsLoaded` is set `true` after the first sync and never reset. If a user edits their profile during the same session, the scan tab's local `wineTypes`, `styleProfiles`, and `budget` are stale.

Fix: remove the `prefsLoaded` guard; React's state comparison handles idempotent re-syncing.

---

**U6 — Safe area insets not handled in scan flow screens (carry-forward)**
`app/scan/camera.tsx` · `app/scan/preview.tsx` · `app/scan/results.tsx` · `app/scan/extracting.tsx`

None of these screens use `SafeAreaView` or `useSafeAreaInsets`. On iPhones with Dynamic Island the capture button and top content can be obscured. `paddingTop: 96` is hardcoded in `app/(tabs)/scan.tsx:181` and `app/(tabs)/profile.tsx:449`.

---

**U7 — No cancel affordance on the extracting screen; users are locked in during network stalls (carry-forward)**
`app/scan/extracting.tsx`

Once OCR begins there is no way to abort without killing the app. The `token.active` cancellation pattern is already in place (lines 64–67); adding a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')` would complete it at minimal cost.

---

**U8 — OCR uses Claude Opus for structured JSON extraction; Haiku would cost ~25× less (carry-forward)**
`supabase/functions/ocr/index.ts:59,65`

Both OCR paths call `claude-opus-4-6` (also invalid — see H1) with `max_tokens: 8096`. Extracting a structured wine list is a well-defined extraction task. `claude-haiku-4-5` handles JSON extraction reliably at a fraction of the cost.

---

**U9 — `prefsLoaded` guard prevents budget slider from reflecting profile default on first load (carry-forward)**
`app/(tabs)/scan.tsx:24–30,58–66`

`savedPreferences` is `undefined` at the time `useState` initialises (React Query is async). The initial state is always `null`. The `useEffect` corrects this once `savedPreferences` loads, but only if `!prefsLoaded`. On first render, before the effect runs, `BudgetSlider` renders with `value={null}`, displaying an incorrect default position.

---

---

## Navigation Issues

**N1 — History tab has a complete read path but zero write path (carry-forward)**
`app/(tabs)/history.tsx:16–25` — see H4. The read implementation is structurally sound; no corresponding write path exists anywhere in the codebase.

---

**N2 — `/scan/preferences` is an unreachable orphaned screen (carry-forward)**
`app/scan/preferences.tsx`

No `router.push('/scan/preferences')` or `href="/scan/preferences"` exists in any file. The screen is unreachable from any navigation path. See also H10 — the screen contains a compile error that would be exposed if it were wired in. Delete this file or fix and wire it into the scan flow.

---

**N3 — `/scan/url` is a silent dead-end; URL-based scan is unimplemented on the client (carry-forward)**
`app/scan/url.tsx`

The file contains only `<Redirect href="/(tabs)/scan" />`. The OCR edge function has a fully working URL-based extraction path (`supabase/functions/ocr/index.ts:49–63`), but no client UI exposes it.

---

**N4 — No cancel affordance on the extracting screen (carry-forward)**
`app/scan/extracting.tsx` — see U7. Once extraction starts, back gesture and hardware back are the only escapes, and both leave the scan store in a partially populated state. The `token.active` pattern is in place but no UI control surfaces it.

---

**N5 — No route to replay a historical recommendation (carry-forward)**
`app/(tabs)/history.tsx:63–75`

Tapping a history card does nothing (U2). There is no `/scan/history-result` or equivalent route. The full `recommendation` JSONB object is stored in `scan_sessions` but there is no UI to render it after the fact.

---

*Automated review — 2026-06-29. No application code has changed since the initial commit. All findings above remain open.*
