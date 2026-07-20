# Code Review — 2026-07-10

Automated review of the Pocket Somm codebase (Expo SDK 54 / expo-router / Supabase / Claude API).

No application code has been committed since the initial codebase. All findings from prior reports carry forward. See `2026-06-19-code-review.md` for the full historical list (H1–H6, M1–M19, L1–L13, S1–S8, U1–U7, N1–N6) and `2026-07-09-code-review.md` for a focused restatement of the most critical items.

This pass adds three new findings not present in any prior report.

---

## Bugs and Crashes

### High

**H1 — `scan_sessions` table is never written to** *(carry-forward from 2026-06-19)*
`app/(tabs)/history.tsx:16–25` queries `scan_sessions`, but no code anywhere in `app/` or `src/` inserts or upserts a row. Every user's History tab is permanently empty regardless of how many scans they run. The entire history feature is structurally broken on the write side.

**H2 — `router.replace()` called synchronously during the render body** *(carry-forward)*
`app/scan/results.tsx:22–25` and `app/scan/preview.tsx:11` call `router.replace` directly in the render body, not in a `useEffect`. This triggers navigation during React's commit phase, which produces "Cannot update a component while rendering a different component" warnings and can cause navigation loops or missed history entries.

Fix for `results.tsx`:
```tsx
useEffect(() => {
  if (!recommendation) router.replace('/(tabs)/scan');
}, [recommendation]);
if (!recommendation) return null;
```
Same pattern needed for `preview.tsx:11`.

**H3 — No React Error Boundary in the root layout** *(carry-forward)*
`app/_layout.tsx` has no `ErrorBoundary`. Any uncaught synchronous throw from a child component crashes the entire app to a blank screen with no recovery path. Expo Router 3+ supports exporting a custom `ErrorBoundary` from each layout file.

**H4 — SSRF via unvalidated `url` parameter in OCR edge function** *(carry-forward)*
`supabase/functions/ocr/index.ts:51` fetches the caller-supplied `url` with no scheme check or IP-range blocklist. Any caller with the public anon key can POST `{ "url": "http://169.254.169.254/latest/meta-data/" }` and receive Supabase infrastructure responses. Validate that `url` starts with `https://` and reject RFC-1918 ranges before fetching.

**H5 — `scan_sessions` INSERT policy has no explicit `WITH CHECK`** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:27–31`: The `FOR ALL` policy omits `WITH CHECK`. PostgreSQL defaults it to the `USING` expression, but future tooling or policy regeneration could silently drop the insert guard. Make it explicit: `WITH CHECK (auth.uid() = user_id)`.

**H6 — `Promise.all` in multi-image OCR rejects entirely if one image fails** *(carry-forward)*
`app/scan/extracting.tsx:77`: If any single image fails to parse, all successfully extracted wines from other images are discarded. Replace with `Promise.allSettled`, filter for fulfilled results, and show a partial-success notice when fewer than all images succeeded.

---

### Medium

**M1 — New signed-in users bypass onboarding** *(carry-forward)*
`app/index.tsx:20`: `preferences === null` is `false` while the query is still loading (`undefined`), so new users reach `/(tabs)/scan` before preferences are confirmed absent. `app/(auth)/sign-in.tsx:19` also routes directly to scan on sign-in, bypassing `index.tsx` entirely.

Fix: destructure `isLoading` from `usePreferences` in `index.tsx` and hold the redirect until loading completes. After sign-in, route through `index.tsx` instead of directly to scan.

**M2 — Auth forms leave `loading` stuck if the call throws** *(carry-forward)*
`app/(auth)/sign-in.tsx:12–20` and `app/(auth)/sign-up.tsx:12–22`: `setLoading(false)` is only reached on the happy path. A network timeout or SDK exception leaves the button permanently disabled. Move `setLoading(false)` into a `finally` block in both files.

**M3 — `handleCapture` has no guard against concurrent invocations** *(carry-forward)*
`app/scan/camera.tsx:29–98`: A double-tap before `takePictureAsync` resolves launches two parallel capture pipelines, both calling `router.push('/scan/preview')`. Add an `isCapturing` ref that bails early if already `true`.

**M4 — `handleCapture` has no error handling** *(carry-forward)*
`app/scan/camera.tsx:29–98`: `takePictureAsync` and `manipulateAsync` are awaited with no `try/catch`. Hardware errors produce unhandled promise rejections and a frozen camera UI. Wrap the function body in `try/catch` and show an `Alert` on failure.

**M5 — Onboarding save is fire-and-forget; navigation races the save** *(carry-forward)*
`app/onboarding.tsx:37–50`: `updatePreferences()` is `mutation.mutate` (returns `void`). `router.replace('/(tabs)/scan')` fires on the next line while the async upsert is still in-flight. Use `mutation.mutateAsync` with `await`, navigate in `onSuccess`, and surface failures.

**M6 — Upsert errors never propagate; preferences silently fail to save** *(carry-forward)*
`src/hooks/usePreferences.ts:38–47`: `supabase.from('profiles').upsert(...)` return value is discarded. The `mutationFn` never throws on Supabase errors, so `onError` never fires and users receive no feedback. Fix:
```ts
const { error } = await supabase.from('profiles').upsert({ ... });
if (error) throw error;
```

**M7 — Pre-filter uses saved-profile budget; scan-level budget override is ignored** *(carry-forward)*
`app/scan/extracting.tsx:37–39`: `prefs.defaultBudget` from `userProfile` (Supabase) is used, not `preferences.budget` from the scan store. Adjusting the budget slider on the scan tab before scanning has no effect on which wines are passed to the recommender.

**M8 — `recommendWines` called with structurally incomplete input from `preferences.tsx`** *(carry-forward)*
`app/scan/preferences.tsx:28–34`: Missing `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, `dislikedGrapes` (all required by `RecommendInput`). This screen is also unreachable via any navigation path (see N2).

**M9 — `handleScreenshot` has no error handling** *(carry-forward)*
`app/(tabs)/scan.tsx:86–101`: `ImagePicker.launchImageLibraryAsync` is called without `try/catch`. On some Android versions or after mid-session permission revocation the call throws, producing an unhandled rejection with no user feedback.

**M10 — `handleEmailChange` leaves `emailSaving` permanently true if `updateUser` throws** *(carry-forward)*
`app/(tabs)/profile.tsx:110–128`: If `supabase.auth.updateUser` throws, `setEmailSaving(false)` is never reached. The Confirm button shows a permanent `ActivityIndicator` until the app is killed. Move `setEmailSaving(false)` into a `finally` block.

**M11 — `handleSignOut` routes to sign-in even if `signOut()` fails** *(carry-forward)*
`app/(tabs)/profile.tsx:130–133`: The `error` from `supabase.auth.signOut()` is discarded. A network failure navigates the user to sign-in while the server-side session remains valid. Check or document the error; `supabase-js` v2 clears the local session regardless of server error, so the behaviour is safe but should be documented.

**M12 — Pre-filter can produce an empty wine list with no guard before `recommendWines`** *(carry-forward)*
`app/scan/extracting.tsx:99–117`: Strict budget, disliked-region, or disliked-grape combinations can reduce `winesForRecommend` to `[]`. There is no guard before calling `recommendWines`. The model receives `wines: []`, may hallucinate wines not on the list, and returns a structurally valid but meaningless result.

**M13 — History query failure renders misleading "No scans yet" empty state** *(carry-forward)*
`app/(tabs)/history.tsx:13–25`: `isError` is not destructured from `useQuery`. A Supabase query failure renders the empty-state copy instead of an error message.

**M14 — Sign-up discards the returned session when email confirmation is disabled** *(carry-forward)*
`app/(auth)/sign-up.tsx:14`: `data` is not destructured from `signUp`. When email confirmation is disabled in the Supabase project, a live session is returned immediately. The current code always shows "Check your email" and routes to sign-in, forcing users to re-enter credentials.

**M15 — `AsyncStorage.getItem` in entry-point has no catch; blank screen on storage failure** *(carry-forward)*
`app/index.tsx:13`:
```tsx
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```
No `.catch()`. Storage corruption or a full-disk error keeps `hasLaunched` permanently `null`, causing line 16 to render `null` — a blank screen with no recovery. Add `.catch(() => setHasLaunched(false))`.

**M16 — `getSession()` in `AuthProvider` has no catch; auth loading stuck permanently on failure** *(carry-forward)*
`src/hooks/useAuth.tsx:17`: No `.catch()` on `supabase.auth.getSession()`. A network error or corrupted SecureStore value means `setLoading(false)` is never called, leaving the app on a permanent blank screen. Add `.catch(() => setLoading(false))`.

**M17 — URL injection via unencoded `vintage` in wine-searcher-proxy** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:47–48`: `wineName` is URL-encoded but `vintageParam` is interpolated verbatim. A crafted `vintage` value like `NV&format=csv&other=injected` appends arbitrary query parameters to the Wine-Searcher API request. Fix: `encodeURIComponent(String(vintage))`.

---

### Low

**L1 — Font loading error silently hangs on a blank screen** *(carry-forward)*
`app/_layout.tsx:15`: `Font.useFonts` error element is discarded. If any font file fails to load, `fontsLoaded` stays `false` permanently. Destructure and handle the error value.

**L2 — `defaultBudget` type mismatch between interface and runtime value** *(carry-forward)*
`src/types/preferences.ts:6` declares `defaultBudget: number` (non-nullable). `src/hooks/usePreferences.ts:26` returns `defaultBudget: data.default_budget ?? null`. The `as UserPreferences` cast on line 31 silences the TypeScript error, hiding nullable accesses downstream.

**L3 — Non-null assertions on environment variables obscure misconfiguration** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:1`, `ocr/index.ts:3`, `recommend/index.ts:3` use `Deno.env.get('...')!`. A missing secret returns `undefined`; the `!` silences TypeScript. Failures manifest as downstream 401s or cryptic API errors rather than a clear startup error.

**L4 — Silent fallback when grape-diversity retry also fails** *(carry-forward)*
`src/services/recommender.ts:75–82`: If the strict-diversity retry fails Zod validation, the original result with duplicate grape varieties is silently returned. Throw instead so the error surfaces to the user.

**L5 — Budget default inconsistency between `preferences.tsx` and `scan.tsx`** *(carry-forward)*
`app/scan/preferences.tsx:17` initialises `budget` to `preferences?.defaultBudget ?? 150`; `app/(tabs)/scan.tsx:30` initialises to `savedPreferences?.defaultBudget ?? null`. Two entry-points apply different default caps.

**L6 — No request timeout on URL fetch in OCR edge function** *(carry-forward)*
`supabase/functions/ocr/index.ts:51`: `fetch(url, ...)` has no `AbortSignal.timeout(...)`. A slow URL hangs the Deno function until Supabase's function timeout (~60 s). Add `signal: AbortSignal.timeout(10_000)`.

**L7 — Claude Opus used for structured OCR; Haiku or Sonnet is cheaper and adequate** *(carry-forward)*
`supabase/functions/ocr/index.ts:57,65`: Both OCR paths invoke `claude-opus-4-6` with `max_tokens: 8096`. Wine-list JSON extraction is well-defined and does not need Opus-level reasoning. `claude-haiku-4-5-20251001` handles it reliably at a fraction of the cost.

**L8 — `invokeFunction` calls `JSON.parse` without try/catch** *(carry-forward)*
`src/api/claude.ts:17`: If the edge function returns non-JSON (Cloudflare 502, maintenance page), `JSON.parse` throws a `SyntaxError` with raw HTML as the message. Wrap in try/catch and throw a user-friendly message.

**L9 — `WineRecommendationCard` is dead code** *(carry-forward)*
`src/components/results/WineRecommendationCard.tsx` (196 lines) is never imported by `results.tsx` or any other screen. The results screen re-implements the same layout inline. Delete or adopt.

**L10 — `profiles.updated_at` is never updated on upserts** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:7`: No trigger updates `updated_at` on row modification. Every profile row shows its original creation timestamp regardless of subsequent preference changes.

**L11 — History loading text is invisible against dark background** *(carry-forward)*
`app/(tabs)/history.tsx:41`: `<Text style={typography.body}>` inherits black system text, invisible on the dark terracotta background. Apply `color: colors.textMuted`.

**L12 — `£` hardcoded in client-side price display; `wine.currency` ignored** *(carry-forward)*
`app/scan/results.tsx:82`: `£{wine.menuPrice}` hardcoded. For EUR or USD menus the symbol is wrong. Use `wine.currency` to derive the appropriate symbol.

**L13 — `defaultCurrency` field in `UserPreferences` is never stored or populated** *(carry-forward)*
`src/types/preferences.ts:7`: `defaultCurrency: string` has no corresponding column, no upsert path, and is never returned by `usePreferences`. The `as UserPreferences` cast hides this at compile time; any code reading `preferences.defaultCurrency` gets `undefined` at runtime.

---

## Supabase and Edge Function Issues

**S1 — No authentication check on any edge function** *(carry-forward)*
All three functions (`ocr`, `recommend`, `wine-searcher-proxy`) accept requests from any caller presenting only the public anon key. No JWT verification. OCR and recommend functions call Claude at the project owner's expense with no per-user attribution or rate limiting.

Fix: add `supabase.auth.getUser(req.headers.get('Authorization'))` at the top of each function and return 401 if no valid session is present.

**S2 — Missing `Authorization` header on edge function calls from client** *(carry-forward)*
`src/api/claude.ts:8–13`: raw `fetch` sends only `apikey: ANON_KEY`. No `Authorization: Bearer <jwt>`. Use `supabase.functions.invoke()` (which attaches the session JWT automatically) or manually forward the token.

**S3 — No CORS headers on OCR or recommend edge functions** *(carry-forward)*
`supabase/functions/ocr/index.ts` and `recommend/index.ts` return responses without `Access-Control-Allow-Origin`. Any Expo Web build will fail with CORS errors on every call.

**S4 — Budget constraint hardcodes `£` in recommend prompt** *(carry-forward)*
`supabase/functions/recommend/index.ts:139,154`: For EUR, USD, or other currency menus, the model receives a currency mismatch and may incorrectly apply or reject the budget constraint.

**S5 — `pricing_cache` has no Row Level Security** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:32–44`: `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY` is never called. Any authenticated user can read, overwrite, or delete cache rows directly via the REST API, poisoning value-score estimates for all users.

**S6 — `pricing_cache` upsert failure silently ignored** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:68–75`: The upsert result is unchecked. On failure, subsequent requests hit the Wine-Searcher API directly, silently burning quota.

**S7 — Recommend prompt does not inject today's date** *(carry-forward)*
`supabase/functions/recommend/index.ts:38–43`: The model is told to evaluate drinking windows "as of today's date" but no date is provided. It infers the year from its training cutoff. Inject `new Date().toISOString().slice(0, 10)` into the user message.

**S8 — OCR function does not cap image payload size server-side** *(carry-forward)*
`supabase/functions/ocr/index.ts:65–81`: No size limit on the base64 payload. A misconfigured or malicious client can send an arbitrarily large image.

**S9 — Wine-Searcher API key embedded in URL query string** *(new)*
`supabase/functions/wine-searcher-proxy/index.ts:48`:
```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&winename=...`;
```
API keys in URLs are logged verbatim by every server, proxy, and CDN between the edge function and Wine-Searcher. If the Wine-Searcher API offers a header-based auth option (e.g., `Authorization` or `X-Api-Key`), use it instead. If not, document this as an accepted risk.

---

## UX and Performance Issues

**U1 — Two simultaneous "may take a minute" messages during recommending stage** *(carry-forward)*
`app/scan/extracting.tsx:146–152`: When `stage === 'recommending'`, both "Scoring by critic rating…" and "This may take a minute or two" render simultaneously. Remove the redundant second line.

**U2 — Skipping onboarding traps authenticated users in a redirect loop** *(carry-forward)*
`app/onboarding.tsx:144`: "Skip for now" navigates without creating a profile row. On the next cold start, `usePreferences` returns `null` and `index.tsx:20` redirects back to `/onboarding`. Upsert an empty preferences row before navigating from the skip button.

**U3 — History cards are tappable but do nothing** *(carry-forward)*
`app/(tabs)/history.tsx:64`: `<TouchableOpacity>` has no `onPress`. Users get press feedback with no result. Wire up a detail view route or change to `<View>`.

**U4 — Profile "back" button uses `router.push` instead of `router.back`** *(carry-forward)*
`app/(tabs)/profile.tsx:182–184`: `router.push('/(tabs)/scan')` adds a stack entry. Subsequent back navigation returns to profile, creating a push-pop loop. Replace with `router.back()`.

**U5 — Safe area insets not handled in scan-flow screens** *(carry-forward)*
`app/scan/camera.tsx`, `preview.tsx`, `results.tsx`, `extracting.tsx` do not use `SafeAreaView` or `useSafeAreaInsets`. Content is obscured by the Dynamic Island on current iPhone models. Hardcoded `paddingTop: 96` in `scan.tsx:181` and `profile.tsx:449` is too small on newer devices and too large on notchless devices.

**U6 — Scan tab preferences do not re-sync after in-session profile edits** *(carry-forward)*
`app/(tabs)/scan.tsx:58–66`: `prefsLoaded` is set `true` on first sync and never reset. Profile edits made during the same session are not reflected. Remove the `prefsLoaded` guard and sync on every `savedPreferences` change.

**U7 — Camera screen has no back/cancel button** *(carry-forward)*
`app/scan/camera.tsx` and `src/components/scan/CameraOverlay.tsx` have no cancel affordance. The overlay's `paddingTop: 80` provides space for a dismiss icon. Add a `×` button calling `router.back()`.

**U8 — "Change your subscription email account" is misleading copy** *(new)*
`app/(tabs)/profile.tsx:153`:
```tsx
<Text style={styles.emailLabel}>Change your subscription email account</Text>
```
The label says "subscription email account", implying a paid subscription. The app has no subscription tier — this is a standard email address update. Misleading copy may confuse users into thinking this affects billing. Rename to "Change email address".

**U9 — Import declarations interleaved with runtime code** *(new)*
`app/(tabs)/scan.tsx:3–7` and `app/(tabs)/profile.tsx:3–7`:
```tsx
import { ..., Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {         // ← runtime statement
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router } from 'expo-router';    // ← import after runtime code
```
ECMAScript specification requires `import` declarations to precede all other statements in a module. Metro/Babel hoists `import` declarations so this works at runtime, but it violates the spec and will break in strict ESM environments (e.g., if the project ever runs `import.meta` or targets a spec-compliant bundler). Move the `if (Platform.OS === 'android')` block to after all `import` statements, or call `UIManager.setLayoutAnimationEnabledExperimental?.(true)` inside a `useEffect` in the component body.

---

## Navigation Issues

**N1 — History tab has no write path; structural dead-end** *(carry-forward)*
See H1. No scan result is persisted to `scan_sessions`. The read implementation exists but the write side is completely absent.

**N2 — `/scan/preferences` is an unreachable orphaned route** *(carry-forward)*
`app/scan/preferences.tsx` is registered by expo-router but no `router.push('/scan/preferences')` exists anywhere. Wire it back into the flow or delete it.

**N3 — `/scan/url` is a silent dead-end** *(carry-forward)*
`app/scan/url.tsx` contains only `<Redirect href="/(tabs)/scan" />`. The OCR edge function has a complete URL-based extraction path that no client UI exposes. Implement or remove.

**N4 — No cancel affordance on the extracting screen** *(carry-forward)*
`app/scan/extracting.tsx`: Once extraction begins the user is locked in for the full duration. The `token.active` cancellation pattern is already in place; add a "Cancel" button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')`.

**N5 — No route to replay a historical recommendation** *(carry-forward)*
`app/(tabs)/history.tsx` renders session summaries but there is no `/history/[id]` detail route. History is visually present but has no actionable detail view.

**N6 — Missing `app/auth/callback.tsx` route for email-change deep link** *(carry-forward)*
`app/(tabs)/profile.tsx:113` creates a redirect URL to `auth/callback`. No matching route file exists. When the user taps the confirmation link, expo-router cannot match the route and silently drops them on whatever the root index resolves to.
