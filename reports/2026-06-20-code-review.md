# Code Review — 2026-06-20

No application code has been committed since 2026-06-19. The only commit since the last review is the automated report itself. All findings from the 2026-06-19 report carry forward unchanged. This pass adds two new findings not present in any prior report.

---

## Bugs and Crashes

### High

**H1 — `scan_sessions` table is never written to** *(carry-forward)*
`app/(tabs)/history.tsx:16–25` queries `scan_sessions`, but no code anywhere in `app/` or `src/` inserts or upserts a row into this table. Every user's History tab is permanently empty regardless of how many scans they run. The entire history feature is structurally broken on the write side.

**H2 — `router.replace()` called during the render phase** *(carry-forward)*
`app/scan/results.tsx:22–25`:
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
`router.replace` is a side-effect invoked directly in the render body, not inside a `useEffect`. Under React concurrent rendering this triggers "Cannot update a component while rendering a different component" warnings and can produce double-navigation or infinite render loops. Fix: wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

**H3 — No React Error Boundary in the root layout** *(carry-forward)*
`app/_layout.tsx` (entire file) has no `ErrorBoundary` wrapping the Stack. Any unhandled synchronous throw from a child component crashes the entire app to a red screen with no recovery path. Add a minimal error boundary class around `<Stack>` that shows a "Something went wrong — tap to restart" prompt.

**H4 — SSRF via unvalidated `url` parameter in OCR edge function** *(carry-forward)*
`supabase/functions/ocr/index.ts:51`:
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
`url` is taken verbatim from the request body with no scheme check or IP-range blocklist. Any caller with the public anon key can POST `{ "url": "http://169.254.169.254/latest/meta-data/" }` and receive internal Supabase infrastructure responses. Validate that `url` begins with `https://` and reject RFC-1918 address ranges before fetching.

**H5 — `scan_sessions` INSERT policy relies on implicit `WITH CHECK`** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:27–31`:
```sql
create policy "Users manage own scans"
  on scan_sessions for all
  using (auth.uid() = user_id);
```
The `FOR ALL` policy has no explicit `WITH CHECK` clause. While PostgreSQL defaults `WITH CHECK` to the `USING` expression when omitted, the intent is ambiguous and future migration tooling or policy regeneration could silently drop the INSERT protection. Make the constraint explicit: add `WITH CHECK (auth.uid() = user_id)`.

**H6 — `Promise.all` in multi-image OCR discards all results if any single image fails** *(carry-forward)*
`app/scan/extracting.tsx:77`:
```tsx
const results = await Promise.all(imageUris.map(extractWineList));
```
If a user uploads four images and one fails to parse, `Promise.all` rejects immediately and discards all successfully extracted wines from the other three images. The user sees "No wines were detected" with no indication that three uploads worked. Fix: replace with `Promise.allSettled`, filter fulfilled results, and surface a partial-success notice when fewer than all images succeeded.

---

### Medium

**M1 — Onboarding skipped for new authenticated users** *(carry-forward)*
`app/index.tsx:20`:
```tsx
if (preferences === null) return <Redirect href="/onboarding" />;
```
Before the Supabase query resolves, `preferences` is `undefined`, not `null`. The guard is false during the network round-trip and the user is sent to `/(tabs)/scan` instead of `/onboarding`. Fix: destructure `isLoading` from `usePreferences` and hold the redirect until loading completes.

**M2 — Auth forms leave `loading` stuck if the auth call throws** *(carry-forward)*
`app/(auth)/sign-in.tsx:12–20` and `app/(auth)/sign-up.tsx:12–22`: if `signInWithPassword` or `signUp` throws (network timeout, SDK error), `setLoading(false)` is never reached. The button stays in its loading state permanently and the form is frozen until the app is killed. Move `setLoading(false)` into a `finally` block in both files.

**M3 — `handleCapture` has no guard against concurrent invocations** *(carry-forward)*
`app/scan/camera.tsx:29–98`: `handleCapture` is async with no lock state. A double-tap before `takePictureAsync` resolves launches two parallel capture pipelines, both calling `router.push('/scan/preview')`. Add an `isCapturing` ref that returns early if already `true`.

**M4 — `handleCapture` has no error handling** *(carry-forward)*
`app/scan/camera.tsx:29–98`: `takePictureAsync` and the two `manipulateAsync` calls are all `await`-ed with no `try/catch`. Hardware errors or low-storage conditions produce unhandled promise rejections and a frozen camera UI. Wrap the entire function body in `try/catch` and show an `Alert` on failure.

**M5 — Onboarding preferences save is fire-and-forget** *(carry-forward)*
`app/onboarding.tsx:37–50`: `updatePreferences(...)` is `mutation.mutate`, which returns `void`. `router.replace('/(tabs)/scan')` fires on the next line while the async upsert is still in-flight. If the save fails the user navigates away with no error. Use `mutation.mutateAsync` with `await`, place navigation in `onSuccess`, and surface failures.

**M6 — Upsert errors never reach `onError`; preferences silently not saved** *(carry-forward)*
`src/hooks/usePreferences.ts:38–47`:
```ts
await supabase.from('profiles').upsert({ user_id: session.user.id, ... });
```
The return value `{ data, error }` is discarded. The `mutationFn` never throws on Supabase errors, so React Query calls `onSuccess` regardless of whether the data was saved. The `onError` handler at line 50 never fires. Users receive no feedback and their preference updates are silently lost. Fix: destructure `const { error } = await supabase.from('profiles').upsert(...)` and `if (error) throw error`.

**M7 — Pre-filter uses saved-profile budget; scan-level budget override is ignored** *(carry-forward)*
`app/scan/extracting.tsx:37–39`:
```tsx
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
}
```
`prefs` is `userProfile` (the Supabase saved preferences). `preferences.budget` from the scan store (set in `scan.tsx` when the user adjusts the slider before tapping "Scan Wine List") is not used. A scan-level budget raise or override is ignored and wines above the profile budget are discarded before reaching the recommender.

**M8 — `recommendWines` called with structurally incomplete input from `preferences.tsx`** *(carry-forward)*
`app/scan/preferences.tsx:28–34` calls `recommendWines` without `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, or `dislikedGrapes`. These are required fields in `RecommendInput`. The edge function receives `undefined` for all five and silently ignores exclusions and favourites. This screen is also unreachable from any navigation path (see N2).

**M9 — `handleScreenshot` has no error handling** *(carry-forward)*
`app/(tabs)/scan.tsx:86–101`: `ImagePicker.launchImageLibraryAsync` is called without `try/catch`. On some Android versions or after mid-session permission revocation the call throws, producing an unhandled rejection with no user feedback.

**M10 — Preference save errors visible only via console** *(carry-forward)*
`src/hooks/usePreferences.ts:50`: `onError: (err) => console.error(...)`. As noted in M6, this path is never reached. But even if it were, a silent console log is never seen by the user.

**M11 — History query failure renders misleading "No scans yet" state** *(carry-forward)*
`app/(tabs)/history.tsx:13–25`: `isError` is not destructured from `useQuery`. When the Supabase query fails, `sessions` is `undefined` and the component renders the empty-state copy instead of an error message.

**M12 — Sign-up discards the returned session when email confirmation is disabled** *(carry-forward)*
`app/(auth)/sign-up.tsx:14`: `data` is not destructured from `supabase.auth.signUp`. When the Supabase project has email confirmation disabled, `signUp()` returns a live session in `data.session`. The current code always shows "Check your email" and routes to sign-in, forcing users to re-enter their credentials.

**M13 — `handleEmailChange` leaves `emailSaving` permanently true if `updateUser` throws** *(carry-forward)*
`app/(tabs)/profile.tsx:110–128`: If `supabase.auth.updateUser` throws, `setEmailSaving(false)` is skipped. The Confirm button shows a permanent `ActivityIndicator` until the app is killed. Move `setEmailSaving(false)` into a `finally` block.

**M14 — `handleSignOut` silently ignores sign-out errors** *(carry-forward)*
`app/(tabs)/profile.tsx:130–133`:
```tsx
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```
`signOut()` returns `{ error }` which is not destructured or checked. A network failure navigates the user to sign-in while the session remains active in `SecureStore`, causing the next app launch to restore a stale session.

**M15 — `preFilterWines` can produce an empty array with no guard before `recommendWines`** *(carry-forward)*
`app/scan/extracting.tsx:99–117`: Strict budget, disliked-region, or disliked-grape filters can reduce `winesForRecommend` to an empty array. There is no guard before `recommendWines` is called. The model receives `wines: []`, may hallucinate wines not on the list, and the Zod schema (`z.array(...).max(3)`) accepts an empty array as valid. The user would see a results screen with no wine cards and no explanation.

**M16 — URL injection via unencoded `vintage` parameter in wine-searcher-proxy** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:47–48`:
```ts
const vintageParam = vintage ?? 'NV';
const url = `https://...&vintage=${vintageParam}&format=json`;
```
`wineName` is correctly URL-encoded with `encodeURIComponent`, but `vintageParam` is interpolated verbatim. A caller with the anon key can pass a crafted `vintage` value such as `"NV&format=csv&another=injected"` to append arbitrary query parameters to the Wine-Searcher API request, potentially returning different wine data that gets written to `pricing_cache`. Fix: `encodeURIComponent(String(vintage))`.

**M17 — `ChipPicker` maintains redundant local state that diverges from parent** *(carry-forward)*
`src/components/preferences/ChipPicker.tsx:16–21`:
```ts
const [local, setLocal] = useState(selected);
useEffect(() => { setLocal(selected); }, [selected]);
```
This creates a window where `local` and `selected` disagree. When `onChange` triggers a Supabase upsert that fails silently (M6), React Query re-fetches and resets the prop to the old value, causing the UI to snap back after the user's toggle. Prefer fully controlled behaviour: remove `local`, use `selected` directly, and call `onChange` without caching state.

**M18 — `AsyncStorage.getItem` in app entry-point has no error handler; blank screen on storage failure** *(carry-forward)*
`app/index.tsx:13`:
```tsx
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```
There is no `.catch()` on this promise. If AsyncStorage encounters a read error, the promise rejects silently, `hasLaunched` stays `null` permanently, and line 16 returns `null` rendering a blank screen with no recovery path. Add `.catch(() => setHasLaunched(false))`.

**M19 — `getSession()` in `AuthProvider` has no error handler; auth loading state stuck permanently on network failure** *(carry-forward)*
`src/hooks/useAuth.tsx:17`:
```tsx
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```
There is no `.catch()` on this call. If `getSession()` throws — due to a network error, an expired token in `SecureStore`, or a Supabase SDK exception — `setLoading(false)` is never called. `loading` stays `true` permanently. `app/index.tsx:16` returns `null` while `loading` is `true`, so the app renders a blank screen that persists until the user force-quits. Fix: add `.catch(() => setLoading(false))`.

**M20 — `focusPoint` state is dead code; tap-to-focus never applied to camera** *(new)*
`app/scan/camera.tsx:15–27`:
```tsx
const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);

function handleTap(event: { nativeEvent: { locationX: number; locationY: number } }) {
  const { locationX: x, locationY: y } = event.nativeEvent;
  setFocusPoint({ x, y });
}
```
`focusPoint` is computed and stored on every tap but is never passed to `CameraView`. The component renders `<CameraView autofocus="on" ... onTouchEnd={handleTap} />` without any prop that conveys the focus point to the camera. Tap-to-focus does not work: the user taps expecting to lock focus to a specific area, the state change triggers a re-render, and the camera continues autofocusing with its default behaviour unchanged. Either wire `focusPoint` through the appropriate `CameraView` prop (check expo-camera docs for the current SDK) or remove the dead state and `handleTap` function.

---

### Low

**L1 — Font loading error silently hangs on a blank screen** *(carry-forward)*
`app/_layout.tsx:15`: `Font.useFonts` returns a tuple `[boolean, Error | null]`. The error element is discarded. If any font file fails to load, `fontsLoaded` stays `false` permanently and the app renders `null`. Destructure and handle the error value.

**L2 — `defaultBudget` type mismatch between interface and runtime value** *(carry-forward)*
`src/types/preferences.ts:6` declares `defaultBudget: number` (non-nullable). `src/hooks/usePreferences.ts:26` returns `defaultBudget: data.default_budget ?? null`. TypeScript strict null checks are silenced by the `as UserPreferences` cast on line 31, hiding every nullable access downstream.

**L3 — Non-null assertions on environment variables obscure misconfiguration** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:1`, `ocr/index.ts:3`, `recommend/index.ts:3` use `Deno.env.get('...')!`. A missing secret returns `undefined` at runtime; the `!` silences TypeScript without throwing at the point of access. Failures manifest as downstream 401s or cryptic API errors.

**L4 — Silent fallback when grape-diversity retry also fails** *(carry-forward)*
`src/services/recommender.ts:75–82`: If the strict-diversity retry parses unsuccessfully, the original result with duplicate grape varieties is returned silently. Log a warning or throw to surface the failure.

**L5 — Budget default inconsistency between `preferences.tsx` and `scan.tsx`** *(carry-forward)*
`app/scan/preferences.tsx:17` initialises `budget` to `preferences?.defaultBudget ?? 150`; `app/(tabs)/scan.tsx:30` initialises to `savedPreferences?.defaultBudget ?? null`. Two entry-points to the recommender apply different default caps when no saved budget exists.

**L6 — No request timeout on URL fetch in OCR edge function** *(carry-forward)*
`supabase/functions/ocr/index.ts:51`: `fetch(url, ...)` has no `AbortSignal.timeout(...)`. A slow or unresponsive URL hangs the Deno function until Supabase's function timeout (typically 60 s), burning wall-clock time. Add `signal: AbortSignal.timeout(10_000)`.

**L7 — Claude Opus used for structured OCR; Haiku or Sonnet would be cheaper** *(carry-forward)*
`supabase/functions/ocr/index.ts:59,65`: Both the image and URL OCR paths invoke `claude-opus-4-6` with `max_tokens: 8096`. Wine-list JSON extraction is a well-defined task that does not require Opus-level reasoning. `claude-haiku-4-5` costs roughly 25× less per token and handles structured extraction reliably. Switch OCR to Haiku or Sonnet and reserve Opus for the recommend function.

**L8 — `invokeFunction` calls `JSON.parse` without try/catch** *(carry-forward)*
`src/api/claude.ts:17`: If the edge function returns non-JSON (Cloudflare 502, Supabase maintenance page), `JSON.parse` throws a `SyntaxError` with raw HTML as the message. Wrap in try/catch and throw a user-friendly message.

**L9 — `WineRecommendationCard` component is dead code** *(carry-forward)*
`src/components/results/WineRecommendationCard.tsx` (196 lines) is never imported by `results.tsx` or any other file. The results screen re-implements the same layout inline. Two divergent representations exist and drift independently. Delete or adopt.

**L10 — `profiles.updated_at` is never updated on upserts** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:7` sets `updated_at` as a `default now()` column. No trigger updates it on row modification. Every profile row shows its original creation timestamp regardless of subsequent preference changes.

**L11 — History loading text is invisible against dark background** *(carry-forward)*
`app/(tabs)/history.tsx:41`:
```tsx
<Text style={typography.body}>Loading history…</Text>
```
`typography.body` sets only `fontSize` and `lineHeight`. The text inherits system default black, rendering invisible on the dark background. Apply `color: colors.textMuted`.

**L12 — `£` hardcoded in client-side price display; `wine.currency` field ignored** *(carry-forward)*
`app/scan/results.tsx:82`: `£{wine.menuPrice}` is hardcoded regardless of the `currency` field extracted by OCR. For menus priced in EUR, USD, or other currencies the symbol is always wrong. Use `wine.currency` to derive the appropriate symbol.

**L13 — `defaultCurrency` field in `UserPreferences` interface is never stored or populated** *(carry-forward)*
`src/types/preferences.ts:7` declares `defaultCurrency: string`. This field does not exist in any migration, is never included in the `upsert` payload, and is never returned by the `queryFn`. The `as UserPreferences` cast on line 31 of `usePreferences.ts` silences the TypeScript error. Any code that reads `preferences.defaultCurrency` gets `undefined` at runtime while TypeScript reports it as `string`.

**L14 — `response.content[0]` accessed without array bounds check in edge functions** *(new)*
`supabase/functions/ocr/index.ts:84` and `supabase/functions/recommend/index.ts:181`:
```ts
const text = response.content[0].type === 'text' ? response.content[0].text : '';
```
`response.content` is an array. If Claude returns an empty content array (possible in edge cases such as tool-use stop reasons or unexpected API behaviour), `response.content[0]` is `undefined` and `.type` throws `TypeError: Cannot read properties of undefined`. This is caught by the outer `try/catch` and returns a 500 with the raw TypeError message — `"Cannot read properties of undefined (reading 'type')"` — rather than a meaningful error. Fix: guard with `if (!response.content.length || response.content[0].type !== 'text') throw new Error('Unexpected Claude response format')`.

---

## Supabase and Edge Function Issues

**S1 — No authentication check on any edge function** *(carry-forward)*
`supabase/functions/ocr/index.ts`, `recommend/index.ts`, `wine-searcher-proxy/index.ts`: all three functions accept requests from any caller presenting only the public anon key. There is no JWT verification step. OCR and recommend functions call the Claude API at the project owner's expense with no per-user attribution or rate limiting. Add `supabase.auth.getUser(req.headers.get('Authorization'))` at the top of each function and return 401 if no valid session is present.

**S2 — Missing `Authorization` header on edge function calls from client** *(carry-forward)*
`src/api/claude.ts:8–13`: raw `fetch` is used with only `apikey: ANON_KEY`. No `Authorization: Bearer <jwt>` header is sent. Future auth-aware logic inside edge functions would silently see no user context. Use `supabase.functions.invoke()` (which automatically attaches the session JWT) or manually attach the token.

**S3 — No CORS headers on OCR or recommend edge functions** *(carry-forward)*
`supabase/functions/ocr/index.ts` and `recommend/index.ts` return responses without `Access-Control-Allow-Origin` or preflight handling. Any Expo Web build will fail with CORS errors on every OCR and recommend call.

**S4 — Budget constraint hardcodes `£` in recommend prompt** *(carry-forward)*
`supabase/functions/recommend/index.ts:139,154`: Both the hard-rule and user-context budget lines use the `£` symbol unconditionally. For menus priced in EUR, USD, or other currencies the model receives the wrong currency symbol and may misapply the constraint.

**S5 — `pricing_cache` has no Row Level Security** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:32–44`: `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY` is never called. Any caller with the anon key can read or overwrite the pricing cache directly via the Supabase REST API, poisoning value-score estimates shown to all users. Add RLS with a service-role-only write policy and a read-only policy for authenticated users.

**S6 — `pricing_cache` upsert failure is silently ignored** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:68–75`: The `supabase.from('pricing_cache').upsert(...)` call result is not checked. On failure, the function returns pricing data but nothing is cached; subsequent requests hit the Wine-Searcher API directly, silently burning quota.

**S7 — Recommend prompt does not inject today's date; model guesses current year** *(carry-forward)*
`supabase/functions/recommend/index.ts:38–43`: The system prompt instructs the model to evaluate drinking windows "as of today's date" but the current date is never injected. The model infers the year from its training cutoff, which may be years in the past. A wine flagged "Approaching" in 2023 may be "Peak" or "Fading" today. Inject `new Date().toISOString().slice(0, 10)` into the user message.

**S8 — OCR function does not validate image size before forwarding to Claude** *(carry-forward)*
`supabase/functions/ocr/index.ts:65–81`: No size cap is enforced on the base64 payload received by the edge function. The client resizes to 1600px, but the edge function itself places no limit. A misconfigured or malicious client can send an arbitrarily large image.

---

## UX and Performance Issues

**U1 — Two simultaneous "this may take a minute" messages during recommending stage** *(carry-forward)*
`app/scan/extracting.tsx:146–152`: When `stage === 'recommending'`, both "Scoring by critic rating…" and "This may take a minute or two" render simultaneously. The second line is redundant. Remove it.

**U2 — Skipping onboarding traps authenticated users in an infinite onboarding loop** *(carry-forward)*
`app/onboarding.tsx:144`: "Skip for now" navigates to `/(tabs)/scan` without creating a profile row. On the next cold start, `usePreferences` returns `null` and `app/index.tsx:20` redirects back to `/onboarding`. Upsert an empty preferences row before navigating from the skip button.

**U3 — History cards are tappable but do nothing** *(carry-forward)*
`app/(tabs)/history.tsx:64`: `<TouchableOpacity>` has no `onPress`. Users see press feedback with no result. Either add a route to the historical recommendation detail or change to `<View>`.

**U4 — Profile "back" button calls `router.push` instead of `router.back`** *(carry-forward)*
`app/(tabs)/profile.tsx:182–184`: `router.push('/(tabs)/scan')` adds a new stack entry. Pressing back then navigates back to profile, creating a push-pop loop. Replace with `router.back()` or remove the button since the tab bar already handles tab switching.

**U5 — Safe area insets not handled in scan-flow screens** *(carry-forward)*
`app/scan/camera.tsx`, `preview.tsx`, `results.tsx`, `extracting.tsx` do not use `SafeAreaView` or `useSafeAreaInsets`. Content is obscured by Dynamic Island on current iPhone models. `app/(tabs)/scan.tsx:181` and `app/(tabs)/profile.tsx:449` hardcode `paddingTop: 96`, which is both too small on newer devices and too large on notchless devices.

**U6 — Scan tab preferences do not re-sync after in-session profile edits** *(carry-forward)*
`app/(tabs)/scan.tsx:58–66`: `prefsLoaded` is set `true` on first sync and never reset. Profile edits made during the same session are not reflected on the scan tab. Remove the `prefsLoaded` flag and sync unconditionally.

**U7 — Camera screen has no back button; Android users have no visible exit path** *(carry-forward)*
`app/scan/camera.tsx` and `src/components/scan/CameraOverlay.tsx` have no cancel or back affordance. The `CameraOverlay` container has `paddingTop: 80` providing space for a dismiss icon. Add a `×` button calling `router.back()`.

---

## Navigation Issues

**N1 — History tab has no write path; structural dead-end** *(carry-forward)*
See H1. The history tab's read implementation has zero corresponding write path. No scan result is ever persisted to `scan_sessions`.

**N2 — `/scan/preferences` is an unreachable orphaned screen** *(carry-forward)*
`app/scan/preferences.tsx` is a complete, functional screen. No `router.push('/scan/preferences')` or `href="/scan/preferences"` exists anywhere in the codebase. The scan flow proceeds directly from `extracting` to `results`. Wire it back into the flow between OCR and recommendation, or delete it.

**N3 — `/scan/url` is a silent dead-end** *(carry-forward)*
`app/scan/url.tsx` contains only `<Redirect href="/(tabs)/scan" />`. The OCR edge function has a complete URL-based extraction path, but no client UI exposes it. Any deep link to `/scan/url` silently drops the user at the scan tab.

**N4 — No cancel affordance on the extracting screen** *(carry-forward)*
`app/scan/extracting.tsx`: once extraction begins, the user is locked in for the full duration. The `token.active` cancellation pattern is already in place. Add a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')`.

**N5 — No route exists to replay a historical recommendation** *(carry-forward)*
`app/(tabs)/history.tsx` renders scan session summaries but there is no `/history/[id]` or equivalent detail route. History is visually present but has no actionable detail view.

**N6 — Missing `app/auth/callback.tsx` route for email-change deep link** *(carry-forward)*
`app/(tabs)/profile.tsx:113`:
```tsx
const redirectTo = Linking.createURL('auth/callback');
```
No file matching `app/auth/callback.tsx` exists. When the user taps the confirmation link from their email, Expo Router cannot match the route and silently drops the user on whatever the root index resolves to, with no confirmation that the email change succeeded. Create `app/auth/callback.tsx` to handle the redirect.
