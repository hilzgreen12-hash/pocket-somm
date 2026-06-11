# Code Review — 2026-06-11

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

Zero issues from the 2026-06-10 report have been resolved. All prior findings carry forward. Three new findings are identified in this pass and marked **NEW**.

---

## Bugs and Crashes

### High Severity

**H1 — `scan_sessions` table is never written to** *(carry-forward — unresolved since 2026-05-05)*
`app/(tabs)/history.tsx:16–25` reads from `scan_sessions`. No file in `app/` or `src/` contains an INSERT or UPSERT targeting `scan_sessions`. The scan flow (`extracting.tsx:116`) calls `router.replace('/scan/results')` after a successful recommendation but never persists the result. Every user's History tab is permanently empty regardless of how many scans they complete. The entire history feature is broken at the write side.

**H2 — Race condition: new signed-in users bypass onboarding** *(carry-forward)*
`app/index.tsx:20` — `usePreferences` returns `undefined` (not `null`) while the React Query fetch is still in flight. The guard `preferences === null` evaluates to `false` for `undefined`, so a brand-new authenticated user with no profile row is immediately redirected to `/(tabs)/scan` rather than `/onboarding`. Fix: expose `isLoading` from `usePreferences` and hold at `return null` in `index.tsx` until both auth and preferences queries have settled.

**H3 — `router.replace` called during render, not inside `useEffect`** *(carry-forward)*
`app/scan/results.tsx:22–25` — when `recommendation` is `null`, `router.replace('/(tabs)/scan')` is called directly in the render function body. Under React strict mode or concurrent rendering this produces "Cannot update a component while rendering a different component" warnings and can cause double-navigation or infinite render loops. Fix: `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

**H4 — `handleCapture` has no try/catch; unhandled promise rejection on hardware error** *(carry-forward)*
`app/scan/camera.tsx:29–99` — `takePictureAsync` (line 32) and both `manipulateAsync` calls (lines 44, 88) are `await`-ed with no surrounding try/catch. A hardware failure, mid-session permission revocation, or disk-full condition produces an unhandled promise rejection. The camera UI appears frozen with no user feedback and no recovery path. Fix: wrap the entire function body in try/catch and show `Alert.alert` on failure.

**H5 — `pricing_cache` table has no RLS policy** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql` — no `alter table pricing_cache enable row level security` statement exists in any migration file. `profiles` and `scan_sessions` have RLS enabled; `pricing_cache` does not. Any authenticated client can read, insert, or overwrite cache rows using the publicly extractable anon key. Poisoned cache entries corrupt critic scores and pricing data for all users.

**H6 — Auth forms leave loading state permanently stuck if the auth call throws** *(carry-forward — unresolved since 2026-05-05)*
`app/(auth)/sign-in.tsx:12–20` and `app/(auth)/sign-up.tsx:12–22`:
```tsx
async function handleSignIn() {
  setLoading(true);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  setLoading(false); // never reached if the above throws
  ...
}
```
If the SDK throws rather than returning `{ error }` (network timeout, unexpected SDK error), `setLoading(false)` is never called. The button remains in its loading state permanently and the form is frozen until the app is killed. Both sign-in and sign-up have this pattern. Fix: move `setLoading(false)` into a `finally` block.

---

### Medium Severity

**M1 — Supabase upsert result ignored in preferences mutation** *(carry-forward)*
`src/hooks/usePreferences.ts:38–47` — `supabase.from('profiles').upsert({...})` is awaited but its `{ error }` return value is discarded. An RLS violation, network timeout, or schema constraint failure causes `onSuccess` to fire anyway, the query is invalidated, and the user receives no indication that their preferences were not saved. Fix: `const { error } = await supabase.from('profiles').upsert({...}); if (error) throw error;`

**M2 — Duplicate-grape retry silently returns the invalid original response** *(carry-forward)*
`src/services/recommender.ts:75–83` — when `hasDuplicateGrapes` triggers a retry and the retry also fails Zod validation (`parsed2.success === false`), execution falls through to `return parsed.data` — the original response containing the duplicate grapes. `parsed2.error` is never logged. Fix: throw an error when the retry fails validation rather than returning a known-invalid result.

**M3 — `handleScreenshot` has no try/catch** *(carry-forward)*
`app/(tabs)/scan.tsx:86–102` — `ImagePicker.launchImageLibraryAsync` is called in an async function with no try/catch. An OS-level permission denial or device fault causes an unhandled promise rejection with no user feedback.

**M4 — `signOut` error silently swallowed** *(carry-forward)*
`app/(tabs)/profile.tsx:130–133` — `supabase.auth.signOut()` is awaited but the return value is not checked. If sign-out fails, the user is navigated to the sign-in screen while still authenticated. The session remains valid in SecureStore; the next cold start restores the stale session and the user appears still logged in.

**M5 — Navigation fires before `updatePreferences` mutation resolves** *(carry-forward)*
`app/onboarding.tsx:37–50` — `updatePreferences({...})` calls `mutation.mutate`, which returns `void`. `router.replace('/(tabs)/scan')` is called synchronously on the same tick. On a slow connection, the user lands on the scan screen while the Supabase upsert has not yet completed. If it fails, no error is shown and preferences are silently lost. Fix: switch to `mutation.mutateAsync` with `await`, and place `router.replace` in the success callback.

**M6 — No timeout or cancel path for edge function calls** *(carry-forward)*
`app/scan/extracting.tsx:70–124` — neither `extractWineList` nor `recommendWines` have a timeout or AbortController. If an edge function hangs on Claude API latency or a non-closing connection, the extracting screen displays indefinitely. There is no cancel button and no escape short of force-quitting the app.

**M7 — `scan_sessions` INSERT policy missing `with check` clause** *(carry-forward)*
`supabase/migrations/001_initial_schema.sql:22–25` — the RLS policy is `for all using (auth.uid() = user_id)`. For PostgreSQL, the `using` clause restricts row visibility (SELECT, UPDATE, DELETE) but does not restrict INSERT unless a `with check` clause is also present. An authenticated user can insert scan session rows with any arbitrary `user_id`. Fix: `using (auth.uid() = user_id) with check (auth.uid() = user_id)`.

**M8 — Pre-filter uses profile default budget, not the current scan's budget** *(carry-forward)*
`app/scan/extracting.tsx:38–49, 101` — `preFilterWines(wines, userProfile)` filters on `prefs.defaultBudget` (the saved profile value). `recommendWines` at line 102 uses `preferences.budget` from the scan store, which is the per-scan budget set on the scan tab. If the user raised the per-scan budget above their profile default, wines in that range are stripped before Claude sees them. Fix: pass the current scan budget explicitly into `preFilterWines`.

**M9 — Missing `app/auth/callback.tsx` route for email-change deep link** *(carry-forward — unresolved since 2026-05-05)*
`app/(tabs)/profile.tsx:113`:
```tsx
const redirectTo = Linking.createURL('auth/callback');
```
This deep link points to the `auth/callback` path in the Expo Router file system. No file matching `app/auth/callback.tsx` or `app/auth/callback/index.tsx` exists in the project. When the user taps the confirmation link from their email, the app opens at this path, expo-router cannot match the route, and the user is silently dropped on whatever the root index resolves to — with no acknowledgment that the email change was confirmed.

**M10 — "Continue without account" in sign-in does not set `hasLaunched`** *(carry-forward from 2026-06-10)*
`app/(auth)/sign-in.tsx:48`:
```tsx
<TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)/scan')}>
```
When a user navigates Welcome → Sign In → "Continue without account", `AsyncStorage.setItem('hasLaunched', 'true')` is never called. Only `app/welcome.tsx:8` sets this flag via its "Start Scanning" button. If a user exits and relaunches after taking the sign-in guest path, `hasLaunched` is still `null`, `index.tsx` treats them as a first-time visitor, and the Welcome screen is shown again. Fix: call `AsyncStorage.setItem('hasLaunched', 'true')` before `router.replace` in the sign-in guest handler.

**M11 — Sign-up discards the returned session when email confirmation is disabled** *(carry-forward — unresolved since 2026-05-05)*
`app/(auth)/sign-up.tsx:13`:
```tsx
const { error } = await supabase.auth.signUp({ email, password });
```
`data` is not destructured. When a Supabase project has email confirmation disabled, `signUp()` returns `data.session` as a live session immediately. The current code ignores this, always shows "Check your email", and routes to sign-in — forcing the user to re-enter credentials. Fix: destructure `data`; if `data.session` is non-null, navigate to `/(tabs)/scan` directly.

---

### Low Severity

**L1 — `hasDuplicateGrapes` skips wines with no grape field** *(carry-forward)*
`src/services/recommender.ts:60–64` — wines where `grape` is `undefined` or `null` are filtered out before the Set comparison. Three recommended wines with no grape field are never flagged as duplicates and bypass the diversity retry.

**L2 — Cache write failure silently ignored in wine-searcher proxy** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:68–77` — the `supabase.from('pricing_cache').upsert(...)` result is not checked. A failed write means subsequent calls for the same wine re-hit the Wine-Searcher API, burning quota without any log entry.

**L3 — Font loading error value is discarded; blank screen on asset failure** *(carry-forward — unresolved since 2026-05-05)*
`app/_layout.tsx:15`:
```tsx
const [fontsLoaded] = Font.useFonts({...});
```
`Font.useFonts` returns `[boolean, Error | null]`. The error element is discarded. If any font file fails to load, `fontsLoaded` remains `false` permanently and the app renders `null` at line 28 — a blank screen with no recovery path. Fix: destructure the error value and show a fallback UI or retry prompt.

**L4 — `ChipPicker` local state resets on every render due to unstable `?? []` prop reference** *(carry-forward from 2026-06-10)*
`src/components/preferences/ChipPicker.tsx:19–21` and call sites in `app/(tabs)/profile.tsx` — `ChipPicker` is called with `selected={preferences?.favouriteRegions ?? []}` and similar expressions. When `preferences?.favouriteRegions` is `undefined`, the `?? []` creates a **new array reference** on every render. `ChipPicker`'s `useEffect(() => { setLocal(selected); }, [selected])` fires on every render because React compares arrays by reference. Each fire resets `local` to `[]`, erasing any in-progress chip selections the user has made before the next re-render (e.g. toggling an accordion section). Fix: memoize the derived value at the call site with `useMemo`, or replace the `useEffect` inside `ChipPicker` with a JSON-stringified comparison.

**L5 — Empty results screen shows no empty-state message** *(carry-forward from 2026-06-10)*
`app/scan/results.tsx:49–115` — `recommendation.wines.map(...)` renders zero items if Claude returns an empty array. The Zod schema (`z.array(WineRecommendationSchema).max(3)`) explicitly permits 0 wines. The results screen would render only the "Pocket Somm Recommends" header and a "Start Another Search" button with no wines and no explanation. Fix: add an explicit `if (recommendation.wines.length === 0)` branch with a message such as "No wines matched your preferences on this list — try adjusting your budget or filters."

**L6 — `invokeFunction` parses JSON without try/catch; gateway errors surface as raw SyntaxError** *(carry-forward)*
`src/api/claude.ts:17`:
```ts
return JSON.parse(text);
```
If an edge function returns non-JSON (Cloudflare 502 HTML, Supabase maintenance page), `JSON.parse` throws a `SyntaxError`. The user sees "SyntaxError: Unexpected token '<', '<!DOCTYPE...' is not valid JSON" with no actionable guidance. Fix: wrap in try/catch and rethrow as "Service temporarily unavailable. Please try again."

**L7 — Currency symbol hardcoded as `£` on the results screen regardless of wine currency** *(NEW)*
`app/scan/results.tsx:83`:
```tsx
<Text style={styles.price}>£{wine.menuPrice}</Text>
```
`WineRecommendation` carries a `currency: string` field (extracted by OCR and passed through to the recommendation). For menus priced in EUR, USD, CHF, or any other currency, the results screen unconditionally displays `£`. Note that S6 tracks the same hardcoding in the edge function system prompt; this is a separate client-side display bug. Fix: map the `wine.currency` code to a symbol (e.g. `{ GBP: '£', EUR: '€', USD: '$' }`) and render that instead.

**L8 — `Promise.all` for multi-image OCR aborts all extraction if one image fails** *(NEW)*
`app/scan/extracting.tsx:77`:
```ts
const results = await Promise.all(imageUris.map(extractWineList));
```
If a single uploaded screenshot fails OCR (blurry image, API timeout, parse error), `Promise.all` rejects immediately and all successfully extracted wines from the other images are discarded. The user sees a generic error and must restart the entire scan. Fix: replace with `Promise.allSettled`, filter for fulfilled results, merge them, and proceed with partial data — reporting the number of failed images rather than aborting entirely.

**L9 — Tab bar `tabBarStyle` missing `backgroundColor`; system default will clash with dark theme** *(NEW)*
`app/(tabs)/_layout.tsx:11`:
```tsx
tabBarStyle: { borderTopColor: colors.border },
```
No `backgroundColor` is set. The app uses a dark terracotta background (`#69413C` — `colors.background`). Without an explicit `backgroundColor`, iOS renders the tab bar with its default opaque white or translucent appearance, which will clash sharply with the dark screen content above it. Fix: add `backgroundColor: colors.background` to `tabBarStyle`.

---

## Supabase and Edge Function Issues

**S1 — OCR and Recommend edge functions accept any request with the anon key — no auth** *(carry-forward)*
`supabase/functions/ocr/index.ts:38` and `supabase/functions/recommend/index.ts:115` — both functions perform no JWT verification. The anon key is bundled in the app binary and trivially extractable. Any actor with the key can make unlimited Claude API calls with no attribution or rate limiting, generating unbounded API costs.

**S2 — Edge function calls do not attach the user JWT** *(carry-forward)*
`src/api/claude.ts:6–16` — `invokeFunction` sends only the `apikey` (anon key) header. No `Authorization: Bearer <user_jwt>` is included. Edge functions cannot identify the caller even if auth checks are added later. Fix: replace `invokeFunction` calls with `supabase.functions.invoke()`, which automatically attaches the active session token — the pattern already used correctly in `src/api/wine-searcher.ts:12`.

**S3 — Preferences query error and missing row are indistinguishable, causing false onboarding redirects** *(carry-forward)*
`src/hooks/usePreferences.ts:18–21` — both a genuine network error and a legitimately missing row return `null`. In `app/index.tsx:20`, `preferences === null` redirects to `/onboarding`. A returning user whose preferences query fails at launch (network blip) is sent back through onboarding and may overwrite their saved settings. Fix: inspect `error.code` — redirect to onboarding only on `PGRST116` (no row found); rethrow all other errors so they surface as query errors (see also N4).

**S4 — Wine-Searcher API key exposed in URL query parameter** *(carry-forward)*
`supabase/functions/wine-searcher-proxy/index.ts:48`:
```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&...`;
```
The secret is in the request URL, exposing it in Wine-Searcher's access logs, CDN logs, and any HTTP proxy logs. Fix: pass the key in a request header (`Authorization` or `X-Api-Key`).

**S5 — `scan/preferences.tsx` calls `recommendWines` with an incomplete payload** *(carry-forward)*
`app/scan/preferences.tsx:28–33` — `recommendWines` is called with only `{ wines, styleProfiles, budget, foodPairing }`. The fields `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` — all required in `RecommendInput` — are `undefined`. All user preference constraints (colour, exclusions, favourites) are silently ignored. This screen is also currently unreachable via normal navigation (see N2).

**S6 — Budget constraint in recommend prompt hardcodes `£` regardless of menu currency** *(carry-forward)*
`supabase/functions/recommend/index.ts:139`:
```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```
The currency symbol is hardcoded as `£` even though the OCR function extracts a per-wine `currency` field. For menus priced in EUR or USD, the model receives a budget constraint in the wrong currency and may misapply it.

---

## UX and Performance Issues

**U1 — History cards are tappable but do nothing** *(carry-forward)*
`app/(tabs)/history.tsx:64` — `<TouchableOpacity style={styles.card}>` has no `onPress`. Users receive the visual press-feedback affordance with no result. Either implement a detail view and navigate to it, or replace `TouchableOpacity` with `View`.

**U2 — History card wine name uses non-existent `topPick` field** *(carry-forward)*
`app/(tabs)/history.tsx:71`:
```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```
`RecommendationResponse` (`src/types/wine.ts:50–53`) has `wines: WineRecommendation[]` and `summary: string`. There is no `topPick` field. This expression always evaluates to `undefined`; wine names never render on history cards even when recommendation data is present. Fix: `item.recommendation?.wines?.[0]?.name`.

**U3 — Duplicate body text on extracting screen during recommending stage** *(carry-forward)*
`app/scan/extracting.tsx:141–152` — when `stage === 'recommending'`, two body `<Text>` elements are visible simultaneously: "Scoring by critic rating, vintage quality and value" (line 147) and "This may take a minute or two" (line 151). The second element is a redundant leftover from the reading-stage hint. Remove the `{stage === 'recommending' && ...}` block at lines 150–152.

**U4 — Profile screen shows default empty state while preferences load** *(carry-forward)*
`app/(tabs)/profile.tsx:147–441` — all pickers render immediately with default empty values before Supabase returns saved preferences. A user who opens Profile shortly after launch sees "No preference" and "I like them all" across every field and may believe their settings were lost. Add a loading skeleton or `ActivityIndicator` gated on `preferences === undefined`.

**U5 — Back arrow in Profile tab stacks Scan onto the tab navigator** *(carry-forward)*
`app/(tabs)/profile.tsx:182–184` — `router.push('/(tabs)/scan')` adds a new stack entry. Pressing the system back button then returns to Profile unexpectedly. Remove the icon or replace with `router.navigate('/(tabs)/scan')` to switch tabs without stacking (see also N3).

**U6 — No cancel button during multi-minute AI processing** *(carry-forward)*
`app/scan/extracting.tsx:139–161` — the loading screen instructs "Please don't leave this page" but provides no cancel mechanism. If either API call stalls, the user is stranded indefinitely. The `token.active` cancellation pattern is already in place; a cancel button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')` would complete it.

**U7 — No input validation before auth API calls** *(carry-forward)*
`app/(auth)/sign-in.tsx:12–20` and `app/(auth)/sign-up.tsx:12–20` — both forms submit with empty email/password directly to Supabase, surfacing raw server error strings via `Alert`. Add client-side validation (non-empty fields, basic email format, minimum password length) before any network call.

**U8 — Skipping onboarding traps authenticated users in an infinite loop** *(carry-forward)*
`app/onboarding.tsx:144` — the "Skip for now" button navigates to `/(tabs)/scan` without creating a profile row. On the next cold start, `usePreferences` returns `null` (no row) and `index.tsx:20` redirects back to `/onboarding`. Authenticated users who skip are forced through onboarding on every cold start. Fix: upsert an empty preferences row before navigating away from the skip button.

**U9 — `WineRecommendationCard` component is dead code** *(carry-forward)*
`src/components/results/WineRecommendationCard.tsx:1–195` — not imported anywhere. `app/scan/results.tsx` re-implements the wine card layout inline. Two divergent card implementations exist and must be maintained independently. Remove the file.

---

## Navigation Issues

**N1 — `/scan/url` is an unimplemented stub** *(carry-forward)*
`app/scan/url.tsx:1–5` — the entire file is `return <Redirect href="/(tabs)/scan" />`. No URL-based wine list scanning is exposed, and no other screen navigates here. Either remove the file or implement the feature and link it from the scan tab.

**N2 — `/scan/preferences` is an orphaned screen unreachable by navigation** *(carry-forward)*
`app/scan/preferences.tsx:1–127` — the current scan flow is `camera → preview → extracting → results`. No `router.push` or `router.replace` in any active file targets `/scan/preferences`. The screen cannot be reached through normal app use and its `recommendWines` call is structurally broken (see S5). Remove the file or re-wire it into the flow.

**N3 — "Account" button in Scan tab stacks Profile on the scan navigator** *(carry-forward)*
`app/(tabs)/scan.tsx:163` — `router.push('/(tabs)/profile')` pushes the Profile tab screen onto the scan stack. The device back button then returns to the scan screen rather than staying in the tab layout. Fix: use `router.navigate('/(tabs)/profile')` to switch tabs without stacking.

**N4 — Signed-in users with a launch-time network error are looped into onboarding** *(carry-forward)*
`app/index.tsx:20` and `src/hooks/usePreferences.ts:18–21` — as described in S3: when the preferences query fails at launch, `preferences === null`, which `index.tsx` treats as "no preferences set" and redirects to `/onboarding`. A returning user on a flaky connection is forced through onboarding again and may overwrite saved preferences once the upsert completes.

**N5 — No route exists to replay a historical recommendation** *(carry-forward)*
`app/(tabs)/history.tsx` — history cards render scan summaries but tapping them does nothing (U1). No `/scan/history-result` or equivalent route exists to display a past `recommendation` JSONB object from `scan_sessions`. The history feature is visually present but has no functional detail view.
