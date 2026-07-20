# Code Review — 2026-06-26

**Status:** No application code has been changed since the initial commit. Every finding from prior reports remains open. This review identifies three new issues not previously reported and re-states all unresolved high- and medium-severity findings with verified file paths and line numbers.

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

**H3 — `AsyncStorage.getItem` has no error handler; app hangs on storage failure (new)**
`app/index.tsx:13`

```tsx
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```

No `.catch()` is attached. If AsyncStorage fails (device full, corrupted storage, first boot on some Android versions), the promise rejects silently and `hasLaunched` remains `null` permanently. Line 16 returns `null` while `hasLaunched === null`, leaving the app on a blank screen. Unlike H2 (auth failure), there is no timeout or fallback to trigger recovery.

Fix: `.catch(() => setHasLaunched(false))` so the app can proceed to the welcome screen.

---

**H4 — `scan_sessions` table is never written to; history is permanently empty (carry-forward)**
`app/(tabs)/history.tsx:16–25`

The history tab reads from `scan_sessions`. No code anywhere in `app/` or `src/` performs an insert or upsert into this table. A grep for `scan_sessions` in `src/` returns zero results. Every user's history is permanently empty regardless of how many scans they complete. The entire history feature is structurally broken on the write side.

---

**H5 — Auth form buttons freeze permanently when auth call throws (carry-forward)**
`app/(auth)/sign-in.tsx:12–20` · `app/(auth)/sign-up.tsx:12–22`

Both handlers follow this pattern:
```tsx
setLoading(true);
const { error } = await supabase.auth.signXxx({ email, password });
setLoading(false); // unreachable if the line above throws
```

If `signInWithPassword` or `signUp` throws (DNS failure, unexpected SDK error), `setLoading(false)` is skipped. The button stays in "Signing in…" / "Creating account…" state for the rest of the session. The same bug exists in `app/(tabs)/profile.tsx:110–118` for `handleEmailChange`.

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

`prefs` here is `userProfile` — the saved Supabase preferences, not the per-scan budget set in the scan store. If a user's saved profile budget is £80 but they override it to £150 for this scan via the scan tab UI, `preFilterWines` still eliminates every wine priced £81–£150 before they reach the recommender. The scan-level override (`preferences.budget` from `useScanStore`) is ignored entirely.

Fix: pass the scan-level budget into `preFilterWines` and use whichever value is higher.

---

### Medium Severity

**M1 — `recommendation.topPick` does not exist; wine names never render on history cards (carry-forward)**
`app/(tabs)/history.tsx:71–73`

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (defined in `src/types/wine.ts`) has fields `wines: WineRecommendation[]` and `summary: string`. There is no `topPick` field. This always evaluates to `undefined`; the wine name line never renders on any history card. The correct expression is `item.recommendation?.wines?.[0]?.name`.

---

**M2 — New signed-in users routed to scan instead of onboarding (carry-forward)**
`app/index.tsx:19–21`

```tsx
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

When auth resolves but the preferences query is still in flight, `preferences` is `undefined` (the React Query loading state), not `null`. The guard evaluates to `false` and the user is sent to scan. A brand-new user with no profile row bypasses onboarding on first launch. Destructuring and checking `isLoading` from `usePreferences` would fix this.

---

**M3 — Onboarding save is fire-and-forget; navigation fires before save completes (carry-forward)**
`app/onboarding.tsx:37–47`

```tsx
updatePreferences({ wineTypes, styleProfiles, ... });
router.replace('/(tabs)/scan');
```

`updatePreferences` is `mutation.mutate`, which returns `void`. `router.replace` fires synchronously on the next line while the async upsert is still in flight. If the network drops or Supabase rejects the upsert, the user navigates away having seen no error. `onError` at `src/hooks/usePreferences.ts:50` only calls `console.error`.

Fix: use `mutation.mutateAsync` with `await`, wrap in try/catch, and only navigate on success.

---

**M4 — `handleCapture` in camera screen has no error handling (carry-forward)**
`app/scan/camera.tsx:29–98`

`takePictureAsync` (line 32) and two calls to `ImageManipulator.manipulateAsync` (lines 44, 88) are all awaited inside an async function with no `try/catch`. Hardware errors, low-storage conditions, or manipulation failures produce unhandled promise rejections. The camera appears to freeze with no user feedback.

Fix: wrap the entire function body in `try/catch` and show an `Alert` on failure.

---

**M5 — `handleSignOut` navigates on failure, leaving stale session in SecureStore (carry-forward)**
`app/(tabs)/profile.tsx:130–133`

```tsx
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

`signOut()` returns `{ error }`, which is not checked. If it fails (network error, expired token), navigation still proceeds. The user is at the sign-in screen but the session token remains in SecureStore. On the next cold start `useAuth` restores the stale session and the app appears to be still logged in.

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

Fix: upsert an empty preferences row (or a sentinel value) before navigating on skip.

---

**M8 — Missing `app/auth/callback.tsx` route; email-change confirmation link drops users silently (carry-forward)**
`app/(tabs)/profile.tsx:113`

```tsx
const redirectTo = Linking.createURL('auth/callback');
```

This deep link targets `auth/callback` in the Expo Router file system. No `app/auth/callback.tsx` exists. When the user taps the email-confirmation link from their inbox, the app opens, Expo Router cannot match the route, and the user is silently dropped at the root index with no acknowledgment that the email change succeeded or failed.

---

**M9 — `handleScreenshot` has no error handling (carry-forward)**
`app/(tabs)/scan.tsx:86–101`

`ImagePicker.launchImageLibraryAsync` is called without `try/catch`. On some Android versions or after mid-session permission revocation this throws rather than returning `{ canceled: true }`, producing an unhandled rejection with no user feedback.

---

**M10 — `preFilterWines` can produce an empty array; recommender is called with zero wines (carry-forward)**
`app/scan/extracting.tsx:99–112`

`preFilterWines` applies hard budget, disliked-region, and disliked-grape filters. If every wine on the list fails the filter, `winesForRecommend` is an empty array. No guard exists before `recommendWines` is called. The recommender system prompt instructs the model to "recommend exactly 3 wines" — it may hallucinate wines not on the list, return an empty array (which the Zod schema accepts as valid), or error. In the best case the results screen renders with zero wine cards.

Fix: check `winesForRecommend.length === 0` before calling `recommendWines` and show an informative error.

---

**M11 — Font load failure hangs app on blank screen (carry-forward)**
`app/_layout.tsx:15`

```tsx
const [fontsLoaded] = Font.useFonts({ ... });
```

`Font.useFonts` returns `[boolean, Error | null]`. The error element is discarded. If any Cormorant Garamond font file fails to load, `fontsLoaded` stays `false` and line 28 returns `null` indefinitely, showing a blank screen with no recovery path.

Fix: destructure the error element and show a fallback UI.

---

### Low Severity

**L1 — Disliked region/grape text input does not enforce the 5-item cap (new)**
`app/(tabs)/profile.tsx:88–94`

`handleAddCustomDislikedRegion` (line 88) and `handleAddCustomDislikedGrape` (line 96) check `current.includes(trimmed)` but not `current.length >= 5`, unlike `handleAddCustomRegion` (line 75) and `handleAddCustomGrape` (line 83) which both check `current.length >= 5`. The `ChipPicker` for dislikes is rendered with `max={5}` (lines 343, 390), but users can bypass this cap by typing into the free-text input. This inconsistency means a user's disliked list can grow unbounded through the text field.

---

**L2 — `profiles.updated_at` never updates; column reflects creation time only (carry-forward)**
`supabase/migrations/001_initial_schema.sql:7` · `src/hooks/usePreferences.ts:38–47`

No `before update` trigger sets `updated_at = now()` on row modification. The upsert in `usePreferences` does not include `updated_at` in the payload. Every profile row shows its original creation timestamp regardless of how many preference changes the user has made.

---

**L3 — `defaultBudget` type mismatch between interface and runtime value (carry-forward)**
`src/types/preferences.ts:7` · `src/hooks/usePreferences.ts:26`

The interface declares `defaultBudget: number` (non-nullable). The hook returns `defaultBudget: data.default_budget ?? null`. TypeScript strict-null checks flag every consumer that treats `defaultBudget` as non-nullable.

---

**L4 — Retry after duplicate grape detection is not checked for the same constraint (carry-forward)**
`src/services/recommender.ts:75–82`

```ts
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data; // never checked for duplicates
}
return parsed.data;
```

`hasDuplicateGrapes` is not run on `parsed2.data` before returning it. If the retry still contains duplicates, they are silently returned to the user. If the retry fails schema validation, the original duplicate-grape result is returned instead.

---

**L5 — `JSON.parse(text)` in `invokeFunction` throws raw `SyntaxError` on non-JSON responses (carry-forward)**
`src/api/claude.ts:17`

If a Cloudflare 502 or Supabase maintenance page is returned, `JSON.parse` throws a `SyntaxError` whose message ("Unexpected token '<', '<!DOCTYPE...' is not valid JSON") propagates through to the user-visible error detail in `extracting.tsx:120`. The user sees a raw JavaScript error instead of actionable copy.

Fix: wrap `JSON.parse(text)` in `try/catch` and rethrow as "Service temporarily unavailable."

---

**L6 — `WineRecommendationCard` is dead code (carry-forward)**
`src/components/results/WineRecommendationCard.tsx`

This 196-line component is never imported by any file. `app/scan/results.tsx` reimplements the wine card layout inline. Two divergent representations exist and must be kept in sync independently. Delete `WineRecommendationCard.tsx` or refactor `results.tsx` to use it.

---

**L7 — No root-level React error boundary (carry-forward)**
`app/_layout.tsx:30–39`

No `<ErrorBoundary>` wraps the `<Stack>`. Any unhandled render error in any screen crashes the entire app with a white screen and no recovery path.

---

---

## Supabase and Edge Function Issues

**S1 — SSRF via unvalidated `url` parameter in OCR edge function (carry-forward)**
`supabase/functions/ocr/index.ts:51–53`

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

`url` is read directly from the request body with no scheme check or IP-range validation. Any caller with the anon key can pass `http://169.254.169.254/latest/meta-data/` or other RFC 1918 / link-local addresses to probe the Supabase internal network. `app/scan/url.tsx` is a stub redirect that prevents client-side access, but the edge function is publicly reachable via its direct URL.

Fix: validate `url` starts with `https://` and reject requests targeting private IP ranges before fetching.

---

**S2 — Edge functions accept unauthenticated callers; unlimited API spend possible (carry-forward)**
`src/api/claude.ts:9–12`

The `invokeFunction` call sends only `apikey: ANON_KEY`, no `Authorization: Bearer <jwt>`. The edge functions perform no identity check. Any actor who extracts the anon key from the app bundle can make unlimited Claude API calls (OCR and recommend) at the project owner's expense with no per-user attribution or rate limiting.

Fix: pass the session JWT in the `Authorization` header; validate it inside each function with `supabase.auth.getUser(jwt)`.

---

**S3 — `pricing_cache` has no Row Level Security (carry-forward)**
`supabase/migrations/001_initial_schema.sql:32–44`

`profiles` and `scan_sessions` both have `alter table … enable row level security`. `pricing_cache` does not. Any caller with the anon key can read or overwrite all cached pricing data without authentication.

---

**S4 — No CORS headers on OCR or recommend edge functions (carry-forward)**
`supabase/functions/ocr/index.ts` · `supabase/functions/recommend/index.ts`

Neither function returns `Access-Control-Allow-Origin` or handles `OPTIONS` preflight. Any Expo Web build will fail with CORS errors on every OCR and recommendation call.

---

**S5 — Budget constraint hardcodes `£` regardless of menu currency (carry-forward)**
`supabase/functions/recommend/index.ts:139,155` · `app/scan/results.tsx:84`

The recommend prompt injects `£${budget}` regardless of currency. The results screen always renders `£{wine.menuPrice}`. The OCR function correctly extracts a `currency` field (line 14, `currency: z.string().default('GBP')`), but this is ignored downstream. EUR and USD menus receive a budget constraint in the wrong currency.

---

**S6 — Upsert result in `usePreferences` is not checked for errors (carry-forward)**
`src/hooks/usePreferences.ts:38–47`

```ts
await supabase.from('profiles').upsert({ ... });
```

The Supabase client resolves with `{ data, error }` rather than throwing. Because the result is not destructured, any error (RLS rejection, network failure, schema mismatch) is silently discarded. `onError` at line 50 is never invoked because the `mutationFn` resolved without throwing.

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

---

## UX and Performance Issues

**U1 — Extracting screen copy references a non-existent "filters" UI (new)**
`app/scan/extracting.tsx:155–159`

```tsx
{stage === 'reading' && (
  <Text style={styles.profileNote}>
    We're making a recommendation based on your profile preferences. Change your preferences for this result only by setting filters for this search.
  </Text>
)}
```

The phrase "setting filters for this search" implies an in-scan filter UI accessible from this screen. No such UI exists. `app/scan/preferences.tsx` implements a preferences screen but is not reachable from any navigation path (see N2). Users who follow this instruction will find nothing to tap.

Fix: remove the "Change your preferences for this result only…" sentence until the preferences screen is wired in, or replace it with copy that matches the actual flow.

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

When `stage === 'recommending'`, line 148 renders "Scoring by critic rating, vintage quality and value" and lines 150–152 render "This may take a minute or two" as a second, unconditional `<Text>` element — both visible at the same time. The first body element already contains "This could take a minute or two" during the reading stage. The duplicate copy is confusing and should be removed.

---

**U5 — Scan preferences not re-synced after in-session profile edits (carry-forward)**
`app/(tabs)/scan.tsx:58–66`

`prefsLoaded` is set `true` after the first sync and never reset. If a user edits their profile during the same session, the scan tab's local `wineTypes`, `styleProfiles`, and `budget` are stale because the effect guard always short-circuits.

Fix: remove the `prefsLoaded` guard; React's state comparison will handle idempotent re-syncing.

---

**U6 — Safe area insets not handled in scan flow screens (carry-forward)**
`app/scan/camera.tsx` · `app/scan/preview.tsx` · `app/scan/results.tsx` · `app/scan/extracting.tsx`

None of these screens use `SafeAreaView` or `useSafeAreaInsets`. On iPhones with Dynamic Island the capture button and top content can be obscured. `app/(tabs)/scan.tsx:181` and `app/(tabs)/profile.tsx:449` hardcode `paddingTop: 96`, which is both insufficient on newer devices and excessive on older notchless devices.

---

**U7 — No cancel affordance on the extracting screen; users are locked in during network stalls (carry-forward)**
`app/scan/extracting.tsx`

Once OCR begins there is no way to abort without killing the app. The `token.active` cancellation pattern is already in place (lines 64–67); adding a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')` would complete it at minimal cost.

---

**U8 — OCR uses Claude Opus for structured JSON extraction; Haiku would cost ~25x less (carry-forward)**
`supabase/functions/ocr/index.ts:59,65`

Both OCR paths call `claude-opus-4-6` (also invalid — see H1) with `max_tokens: 8096`. Extracting a structured wine list from an image or text is a well-defined extraction task. `claude-haiku-4-5` handles JSON extraction reliably at a fraction of the cost. Using Haiku or Sonnet for OCR and reserving Opus for the recommend function would materially reduce API spend per scan.

---

---

## Navigation Issues

**N1 — History tab has a complete read path but zero write path (carry-forward)**
`app/(tabs)/history.tsx:16–25` — see H4. The history tab's read implementation is structurally sound; no corresponding write path exists anywhere in the codebase.

---

**N2 — `/scan/preferences` is an unreachable orphaned screen (carry-forward)**
`app/scan/preferences.tsx`

No `router.push('/scan/preferences')` or `href="/scan/preferences"` exists in any file in `app/`. The screen is unreachable from any navigation path. The extracting screen references this screen in copy (see U1) but never navigates to it. Delete this file or wire it into the scan flow.

---

**N3 — `/scan/url` is a silent dead-end; URL-based scan is unimplemented on the client (carry-forward)**
`app/scan/url.tsx`

The file contains only `<Redirect href="/(tabs)/scan" />`. The OCR edge function has a fully working URL-based wine list extraction path (`supabase/functions/ocr/index.ts:49–63`), but no client UI exposes it. Deep links or future references to `/scan/url` silently drop the user on the scan tab.

---

**N4 — No cancel affordance on the extracting screen (carry-forward)**
`app/scan/extracting.tsx` — see U7. Once extraction starts, back gesture and hardware back are the only escapes, and both leave the scan store in a partially populated state. The `token.active` pattern is in place but no UI control surfaces it.

---

**N5 — No route to replay a historical recommendation (carry-forward)**
`app/(tabs)/history.tsx:63–75`

Tapping a history card does nothing (U2). There is no `/scan/history-result` or equivalent route. The full `recommendation` JSONB object is stored in `scan_sessions` but there is no UI to render it after the fact. History is display-only with no drill-down.

---

*Automated review — 2026-06-26. No application code has changed since the initial commit. All findings above remain open.*
