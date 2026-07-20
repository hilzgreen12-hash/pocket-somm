# Code Review — 2026-07-20

Automated review of the full source tree. No application code has changed since the initial commit. All findings from prior reports remain open. This report carries forward every unresolved High and Medium finding with exact file paths and line numbers, and adds two new issues not previously reported.

---

## Bugs and Crashes

### High Severity

**H1 — Invalid Claude model ID breaks every scan (carry-forward)**
`supabase/functions/ocr/index.ts:59,65` · `supabase/functions/recommend/index.ts:170`

Both edge functions pass `model: 'claude-opus-4-6'` to the Anthropic SDK. The current valid Opus model identifier is `claude-opus-4-8`. Every OCR and recommendation call returns a model-not-found error. No scan can succeed for any user. This has been the top-priority bug since the first automated review.

Fix: replace `'claude-opus-4-6'` with `'claude-opus-4-8'` in both files (three occurrences total).

---

**H2 — Auth initialisation hangs permanently on network failure (carry-forward)**
`src/hooks/useAuth.tsx:17–20`

```tsx
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

No `.catch()` is attached. If `getSession()` rejects (network failure, Supabase downtime), `setLoading(false)` is never called. The app shows a blank screen with no recovery path. `app/index.tsx:16` renders `null` while `loading` is `true`.

Fix: add `.catch(() => setLoading(false))` or use `async/await` with `try/finally`.

---

**H3 — `AsyncStorage.getItem` has no error handler; app hangs blank on storage failure (carry-forward)**
`app/index.tsx:13`

```tsx
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```

No `.catch()`. If AsyncStorage throws (device storage full, corrupted on some Android versions), `hasLaunched` stays `null` permanently and line 16 renders `null` indefinitely.

Fix: `.catch(() => setHasLaunched(false))`.

---

**H4 — `scan_sessions` table is never written to; history is permanently empty (carry-forward)**
`app/(tabs)/history.tsx:16–25`

The history tab reads from `scan_sessions`. A grep for any insert or upsert into `scan_sessions` across `src/` and `app/` returns zero results. Every authenticated user's history is structurally empty regardless of how many scans they complete. The write path has never been implemented.

---

**H5 — Auth form buttons freeze permanently when auth call throws (carry-forward)**
`app/(auth)/sign-in.tsx:12–20` · `app/(auth)/sign-up.tsx:12–22` · `app/(tabs)/profile.tsx:110–118`

All three handlers set `loading(true)` before an awaited auth call and `loading(false)` on the line immediately after. If the call throws (DNS failure, unexpected SDK error), `setLoading(false)` is skipped and the button stays permanently in loading state.

Fix: move `setLoading(false)` into a `finally` block in all three functions.

---

**H6 — `router.replace()` called during render body, not in an effect (carry-forward)**
`app/scan/results.tsx:22–25`

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Navigation side effects called synchronously during render trigger "Cannot update a component while rendering a different component" warnings and can cause double-navigation or an infinite render loop under React concurrent mode.

Fix: wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

---

**H7 — Pre-filter applies saved profile budget, not the per-scan budget override (carry-forward)**
`app/scan/extracting.tsx:37–39`

```tsx
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
}
```

`prefs` here is `userProfile` (saved Supabase preferences), not the scan-level budget set in the scan store. A user who sets their saved budget to £80 but overrides it to £150 before scanning will have wines in the £81–£150 range silently removed before they reach the recommender.

Fix: pass the active scan budget (from `useScanStore`) into `preFilterWines` instead of `prefs.defaultBudget`.

---

**H8 — `usePreferences` query error returns `null`, incorrectly triggering onboarding for existing users (carry-forward)**
`src/hooks/usePreferences.ts:18–21` · `app/index.tsx:19–21`

When a transient Supabase error occurs, `usePreferences` returns `null`. `app/index.tsx:20` checks `if (preferences === null)` and redirects to `/onboarding`. An authenticated user who has already completed onboarding will be silently re-routed there on any cold start with a backend hiccup.

Fix: return a distinct error sentinel from `usePreferences` instead of `null`, and guard it separately in `index.tsx`.

---

### Medium Severity

**M1 — `recommendation.topPick` does not exist; wine names never render on history cards (carry-forward)**
`app/(tabs)/history.tsx:71–73`

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` has `wines: WineRecommendation[]` and `summary: string` — no `topPick` field. This expression always evaluates to `undefined`; the wine name line never renders on any card.

Fix: `item.recommendation?.wines?.[0]?.name`.

---

**M2 — New signed-in users routed to scan instead of onboarding (carry-forward)**
`app/index.tsx:19–21`

While auth resolves but the preferences query is still loading, `preferences` is `undefined` (React Query loading state). The guard `if (preferences === null)` evaluates to `false`, so a brand-new user with no profile row bypasses onboarding and lands on the scan tab.

Fix: destructure `isLoading` from `usePreferences` and hold the redirect decision until both `auth.loading` and `preferences.isLoading` are `false`.

---

**M3 — Onboarding save is fire-and-forget; navigation fires before save completes (carry-forward)**
`app/onboarding.tsx:37–47`

```tsx
updatePreferences({ wineTypes, styleProfiles, ... });
router.replace('/(tabs)/scan');
```

`updatePreferences` is `mutation.mutate` (returns `void`). `router.replace` fires immediately while the async upsert is still in flight. If the network drops, the user navigates away with no error and their preferences are silently lost. `onError` at `src/hooks/usePreferences.ts:50` only calls `console.error`.

Fix: use `mutation.mutateAsync` with `await`, wrap in `try/catch`, and only navigate on success.

---

**M4 — `handleCapture` in camera screen has no error handling (carry-forward)**
`app/scan/camera.tsx:29–98`

`takePictureAsync` (line 32) and both `ImageManipulator.manipulateAsync` calls (lines 44, 88) are awaited inside an async function with no `try/catch`. Any hardware failure, low-storage error, or manipulation error causes an unhandled promise rejection. The camera appears to freeze with no user feedback.

Fix: wrap the function body in `try/catch` and show an `Alert` on failure.

---

**M5 — `handleSignOut` navigates on failure, leaving a stale session in SecureStore (carry-forward)**
`app/(tabs)/profile.tsx:130–133`

```tsx
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

`signOut()` returns `{ error }`, which is not checked. On failure the user is at the sign-in screen but the session token remains in SecureStore. The next cold start restores the stale session and the app appears still signed in.

Fix: destructure `{ error }`, show an `Alert` if non-null, and only navigate on success.

---

**M6 — Double-tap on the capture button pushes `/scan/preview` twice (carry-forward)**
`app/scan/camera.tsx:29–98`

`handleCapture` is async with no guard against concurrent invocations. A double-tap before `takePictureAsync` resolves starts two parallel capture flows, both calling `router.push('/scan/preview')`, requiring two back presses to exit.

Fix: add an `isCapturing` ref that returns early if already `true`.

---

**M7 — Skipping onboarding traps authenticated users in an infinite redirect loop (carry-forward)**
`app/onboarding.tsx:144`

The "Skip for now" button navigates to `/(tabs)/scan` without writing a profile row. On the next cold start, `usePreferences` returns `null` (no row) and `app/index.tsx:20` redirects back to `/onboarding`. Authenticated users who skip are forced through onboarding on every launch indefinitely.

Fix: upsert an empty preferences row (or a `has_completed_onboarding` boolean column) before navigating on skip.

---

**M8 — Missing `app/auth/callback.tsx` route; email-change link drops users silently (carry-forward)**
`app/(tabs)/profile.tsx:113`

```tsx
const redirectTo = Linking.createURL('auth/callback');
```

No `app/auth/callback.tsx` exists in the file system. When a user taps the email-confirmation link from their inbox, Expo Router cannot match the route and the user is dropped at the root with no feedback on whether the email change succeeded.

---

**M9 — `handleScreenshot` has no error handling (carry-forward)**
`app/(tabs)/scan.tsx:86–101`

`ImagePicker.launchImageLibraryAsync` is called with no `try/catch`. On some Android versions or after mid-session permission revocation, this throws rather than returning `{ canceled: true }`, producing an unhandled rejection with no user feedback.

---

**M10 — `preFilterWines` can produce an empty array; recommender is called with zero wines (carry-forward)**
`app/scan/extracting.tsx:99–112`

`preFilterWines` applies budget, disliked-region, and disliked-grape hard filters. If every wine on the list fails the filter, `winesForRecommend` is an empty array and `recommendWines` is called with it. The model prompt says "recommend exactly 3 wines" — it may hallucinate wines, return an empty array, or error.

Fix: check `winesForRecommend.length === 0` before calling `recommendWines` and show an actionable error instead.

---

**M11 — Font load failure hangs app on blank screen (carry-forward)**
`app/_layout.tsx:15`

```tsx
const [fontsLoaded] = Font.useFonts({ ... });
```

`Font.useFonts` returns `[boolean, Error | null]`. The error is discarded. If any Cormorant Garamond font fails to load, `fontsLoaded` stays `false` and line 28 renders `null` indefinitely.

Fix: destructure the error element and render a fallback UI.

---

**M12 — History query failure silently renders "No scans yet" instead of an error (carry-forward)**
`app/(tabs)/history.tsx:12–55`

`isError` is not destructured from `useQuery`. When the Supabase query fails, `isLoading` becomes `false` and `sessions` is `undefined`. The component falls through to the `!sessions?.length` branch and renders "No scans yet" — misleading the user into thinking they have an empty history rather than showing a load error.

Fix: destructure `isError` and render a distinct error state with a retry affordance.

---

**M13 — Results screen renders no wine cards and no empty-state message when `wines` is empty (carry-forward)**
`app/scan/results.tsx:49–115`

The Zod schema at `src/services/recommender.ts:56` accepts an empty `wines` array as valid. If the recommender returns zero wines, the results screen renders the header and summary but no cards and no explanation. The screen looks incomplete with no actionable feedback.

Fix: check `recommendation.wines.length === 0` and render "No qualifying wines were found on this list with your current preferences."

---

**M14 — `response.content[0]` accessed without a length guard in both edge functions (new)**
`supabase/functions/ocr/index.ts:84` · `supabase/functions/recommend/index.ts:181`

```ts
const text = response.content[0].type === 'text' ? response.content[0].text : '';
```

Both functions access `response.content[0]` without first checking that `response.content.length > 0`. If the Anthropic API returns an empty `content` array (possible when `stop_reason` is `'max_tokens'` and the model generated nothing before the limit, or if the response contract changes), this line throws `TypeError: Cannot read properties of undefined (reading 'type')`, which is caught by the outer `try/catch` and surfaced to the client as a generic 500 error with no useful diagnostic.

Fix: use optional chaining: `response.content[0]?.type === 'text' ? response.content[0].text : ''`, or add an explicit `if (!response.content.length) throw new Error('Empty model response')` before accessing the array.

---

### Low Severity

**L1 — Disliked region/grape free-text inputs bypass the 5-item cap (carry-forward)**
`app/(tabs)/profile.tsx:88–101`

`handleAddCustomDislikedRegion` (line 88) and `handleAddCustomDislikedGrape` (line 96) check for duplicates but not `current.length >= 5`. Unlike the favourites handlers (lines 75, 83), the disliked lists can grow unbounded through the free-text path even though the `ChipPicker` enforces `max={5}`.

---

**L2 — `profiles.updated_at` never updates; column reflects creation time only (carry-forward)**
`supabase/migrations/001_initial_schema.sql:7` · `src/hooks/usePreferences.ts:38–47`

No `before update` trigger sets `updated_at = now()` and the upsert payload never includes `updated_at`. Every profile row shows its original creation timestamp regardless of how many preference changes the user has made.

---

**L3 — `defaultBudget` type mismatch between interface and runtime value (carry-forward)**
`src/types/preferences.ts:7` · `src/hooks/usePreferences.ts:26`

`UserPreferences.defaultBudget` is declared as `number` (non-nullable) but the hook returns `data.default_budget ?? null`. TypeScript strict-null checks flag every consumer that treats `defaultBudget` as non-nullable, and the `null` case is silently carried at runtime.

---

**L4 — Duplicate-grape retry is not re-checked before returning (carry-forward)**
`src/services/recommender.ts:75–82`

`hasDuplicateGrapes` is not run on `parsed2.data` after the retry. If the retry response also contains duplicate grapes, they are silently returned. If the retry fails schema validation, the original duplicate-grape result is returned instead of throwing.

---

**L5 — `JSON.parse(text)` in `invokeFunction` throws raw `SyntaxError` on non-JSON responses (carry-forward)**
`src/api/claude.ts:17`

If Cloudflare returns a 502 or Supabase returns an HTML maintenance page, `JSON.parse` throws a `SyntaxError` with the raw token text as its message. This propagates to the user-visible error detail in `extracting.tsx:120` as a raw JavaScript error rather than actionable copy.

Fix: wrap `JSON.parse(text)` in `try/catch` and rethrow as "Service temporarily unavailable. Please try again."

---

**L6 — `WineRecommendationCard` is dead code (carry-forward)**
`src/components/results/WineRecommendationCard.tsx`

This 196-line component is imported by no file. `app/scan/results.tsx` reimplements the wine card layout inline. Two divergent representations must be kept in sync independently.

---

**L7 — No root-level React error boundary (carry-forward)**
`app/_layout.tsx:30–39`

No `<ErrorBoundary>` wraps the `<Stack>`. Any unhandled render error in any screen crashes the entire app with a white screen and no recovery path.

---

**L8 — `UserPreferences.defaultCurrency` declared but has no database column and is never populated (carry-forward)**
`src/types/preferences.ts:6` · `src/hooks/usePreferences.ts:16–31`

The interface declares `defaultCurrency: string`. No `default_currency` column exists in the `profiles` table across all three migrations. The field is never selected or returned. Any code reading `preferences.defaultCurrency` receives `undefined`.

---

---

## Supabase and Edge Function Issues

**S1 — SSRF via unvalidated `url` parameter in OCR edge function (carry-forward)**
`supabase/functions/ocr/index.ts:51–53`

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

`url` is read directly from the request body with no scheme check or IP-range validation. Any caller with the anon key can pass `http://169.254.169.254/latest/meta-data/` or other RFC 1918 / link-local addresses to probe the Supabase internal network. `app/scan/url.tsx` is a client-side stub only; the edge function is publicly reachable at its direct URL.

Fix: validate `url` starts with `https://` and reject requests targeting private IP ranges before fetching.

---

**S2 — Edge functions accept unauthenticated callers; unlimited API spend possible (carry-forward)**
`src/api/claude.ts:9–12`

`invokeFunction` sends only `apikey: ANON_KEY`, no session JWT in the `Authorization` header. The edge functions perform no identity check. Anyone who extracts the anon key from the app bundle can make unlimited Claude API calls at the project owner's expense with no per-user attribution or rate limiting.

Fix: pass the session JWT in `Authorization: Bearer <jwt>` and validate it inside each function with `supabase.auth.getUser(jwt)`.

---

**S3 — `pricing_cache` has no Row Level Security (carry-forward)**
`supabase/migrations/001_initial_schema.sql:32–44`

`profiles` and `scan_sessions` both enable RLS. `pricing_cache` does not. Any caller with the anon key can read or overwrite all cached pricing data without authentication.

---

**S4 — No CORS headers on OCR or recommend edge functions (carry-forward)**
`supabase/functions/ocr/index.ts` · `supabase/functions/recommend/index.ts`

Neither function returns `Access-Control-Allow-Origin` or handles `OPTIONS` preflight requests. Any Expo Web build will fail with CORS errors on every OCR and recommendation call.

---

**S5 — Budget constraint hardcodes `£` regardless of menu currency (carry-forward)**
`supabase/functions/recommend/index.ts:139,155` · `app/scan/results.tsx:84`

The recommend prompt injects `£${budget}` and the results screen always renders `£{wine.menuPrice}`. The OCR function correctly extracts a `currency` field but it is ignored downstream. EUR and USD menus receive an incorrect currency symbol throughout the scan flow.

---

**S6 — Upsert result in `usePreferences` is not checked for errors (carry-forward)**
`src/hooks/usePreferences.ts:38–47`

```ts
await supabase.from('profiles').upsert({ ... });
```

The Supabase client resolves with `{ data, error }` rather than throwing. The result is not destructured. Any upsert error — RLS rejection, network failure, schema mismatch — is silently discarded. `onError` at line 50 is never invoked because the `mutationFn` resolved without throwing.

Fix: destructure the result and `throw error` if non-null.

---

**S7 — `pricing_cache` upsert failure is silently ignored (carry-forward)**
`supabase/functions/wine-searcher-proxy/index.ts:68–75`

The `supabase.from('pricing_cache').upsert(...)` result is not checked. If the upsert fails, the function still returns pricing data but nothing is cached. All subsequent requests for the same wine bypass the cache and go directly to Wine-Searcher, silently burning API quota.

---

**S8 — No request timeout on URL fetch in OCR function (carry-forward)**
`supabase/functions/ocr/index.ts:51`

No `AbortSignal.timeout(...)` is passed to `fetch`. A slow or unresponsive URL hangs the Deno function until Supabase's wall-clock limit kills it (typically 60 s), burning the entire function budget and returning an opaque timeout error to the client.

Fix: `fetch(url, { signal: AbortSignal.timeout(10_000), headers: { ... } })`.

---

---

## UX and Performance Issues

**U1 — Extracting screen copy references a non-existent filter UI (carry-forward)**
`app/scan/extracting.tsx:155–159`

```tsx
{stage === 'reading' && (
  <Text style={styles.profileNote}>
    We're making a recommendation based on your profile preferences. Change your preferences for this result only by setting filters for this search.
  </Text>
)}
```

"Setting filters for this search" implies an in-scan filter UI on this screen. No such UI exists. `app/scan/preferences.tsx` is unreachable from any navigation path (see N2). Users who follow this instruction find nothing to tap.

Fix: remove the "Change your preferences for this result only…" sentence until the preferences screen is wired in.

---

**U2 — History cards show press feedback but do nothing on tap (carry-forward)**
`app/(tabs)/history.tsx:64`

`<TouchableOpacity style={styles.card}>` has no `onPress`. Users receive the visual tap affordance with no navigation or action. Replace with `<View>` until a detail route is implemented, or add `onPress` with navigation to a results detail screen.

---

**U3 — Profile back button pushes a new stack entry instead of navigating back (carry-forward)**
`app/(tabs)/profile.tsx:182–184`

```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

`router.push` adds an entry to the navigation stack. The back-arrow icon implies popping the stack. Replace with `router.back()` or remove the button.

---

**U4 — Two "may take a minute" messages appear simultaneously during recommendation (carry-forward)**
`app/scan/extracting.tsx:144–152`

When `stage === 'recommending'`, line 148 renders "Scoring by critic rating, vintage quality and value" and lines 150–152 render an unconditional second `<Text>` "This may take a minute or two" — both visible at the same time alongside the stage title.

---

**U5 — Scan preferences not re-synced after in-session profile edits (carry-forward)**
`app/(tabs)/scan.tsx:58–66`

`prefsLoaded` is set `true` after the first sync and never reset. If a user edits their profile preferences mid-session, the scan tab's local `wineTypes`, `styleProfiles`, and `budget` stay stale because the effect guard always short-circuits.

Fix: remove the `prefsLoaded` guard and rely on React's state comparison for idempotency.

---

**U6 — Safe area insets not handled in any scan flow screen (carry-forward)**
`app/scan/camera.tsx` · `app/scan/preview.tsx` · `app/scan/results.tsx` · `app/scan/extracting.tsx`

None of these screens use `SafeAreaView` or `useSafeAreaInsets`. On iPhones with Dynamic Island, the capture button and top content can be obscured. `app/(tabs)/scan.tsx:181` and `app/(tabs)/profile.tsx:449` hardcode `paddingTop: 96`, which is insufficient on newer devices.

---

**U7 — No cancel affordance on the extracting screen; users are locked in during network stalls (carry-forward)**
`app/scan/extracting.tsx`

Once OCR begins there is no way to abort without killing the app. The `token.active` cancellation pattern is already in place (lines 64–67); a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')` would complete it with minimal effort.

---

**U8 — OCR uses Claude Opus for structured JSON extraction; Haiku would cost ~25× less (carry-forward)**
`supabase/functions/ocr/index.ts:59,65`

Both OCR paths call `claude-opus-4-6` (which is also the invalid model from H1) with `max_tokens: 8096`. Extracting a structured wine list from an image is a well-defined extraction task that `claude-haiku-4-5` handles reliably at a fraction of the cost. Using Haiku or Sonnet for OCR and reserving Opus for the recommend function would materially reduce API spend per scan.

---

**U9 — Budget slider initialises to wrong position on first render (carry-forward)**
`app/(tabs)/scan.tsx:24–30,58–66`

`savedPreferences` is `undefined` at `useState` initialisation time (React Query is async). The initial `budget` state is always `null`. The `useEffect` at line 59 corrects this — but only once, due to the `prefsLoaded` guard. On slower devices the slider may briefly render at the `null` position before correcting, or remain incorrect if the effect fires before the query resolves.

Fix: derive the slider value directly from `savedPreferences?.defaultBudget ?? null` without local state, removing the double-initialisation problem entirely.

---

---

## Navigation Issues

**N1 — History tab has a complete read path but zero write path (carry-forward)**
`app/(tabs)/history.tsx:16–25` — see H4. The read implementation is structurally sound; no corresponding write path exists anywhere in the codebase. Every user's history is permanently empty.

---

**N2 — `/scan/preferences` is an unreachable orphaned screen (carry-forward)**
`app/scan/preferences.tsx`

No `router.push('/scan/preferences')` or `href="/scan/preferences"` exists in any file. The screen is never reachable via any navigation path. The extracting screen references it in copy (see U1) but never navigates to it.

---

**N3 — `/scan/url` is a silent dead-end; URL-based scan is unimplemented on the client (carry-forward)**
`app/scan/url.tsx`

The file contains only `<Redirect href="/(tabs)/scan" />`. The OCR edge function has a fully working URL-based extraction path (`supabase/functions/ocr/index.ts:49–63`), but no client UI exposes it.

---

**N4 — No cancel affordance on the extracting screen (carry-forward)**
`app/scan/extracting.tsx` — see U7. The back gesture and hardware back are the only escapes, and both leave the scan store in a partially populated state. The `token.active` pattern is in place but no UI control surfaces it.

---

**N5 — No route to replay a historical recommendation (carry-forward)**
`app/(tabs)/history.tsx:63–75`

Tapping a history card does nothing (U2). There is no `/scan/history-result` or equivalent route. The full `recommendation` JSONB object is stored in `scan_sessions` but there is no UI to render it after the fact.

---

*Automated review — 2026-07-20. No application code has changed since the initial commit. All findings above are open.*
