# Code Review — 2026-06-09

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

All issues from the 2026-06-08 report remain unresolved. One new finding is marked **NEW** below. Carry-over issues retain the same identifiers for tracking.

---

## Bugs and Crashes

### High Severity

**H1 — Race condition: new signed-in users bypass onboarding** *(unresolved since 2026-06-08)*
- `app/index.tsx:20`
- `usePreferences` returns `undefined` (not `null`) while the React Query fetch is still in flight. The check `preferences === null` is `false` for `undefined`, so the component falls through to `return <Redirect href="/(tabs)/scan" />` before the query resolves. New users who have no profile row in Supabase never reach `/onboarding`. Fix: expose the `isLoading` flag from `usePreferences` and hold at `return null` in `index.tsx` until the query settles: `if (loading || hasLaunched === null || (!!session && prefsLoading)) return null`.

**H2 — `router.replace` called during render, not inside `useEffect`** *(unresolved since 2026-06-08)*
- `app/scan/results.tsx:22-25`
- When `recommendation` is `null`, the component calls `router.replace('/(tabs)/scan')` directly in the render function body — a side effect during render. This produces the React warning "Cannot update a component while rendering a different component" and will crash under React strict mode. Fix: wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

**H3 — `handleCapture` has no try/catch — unhandled promise rejection on hardware error** *(unresolved since 2026-06-08)*
- `app/scan/camera.tsx:29-99`
- The entire `handleCapture` async function contains no try/catch block. `cameraRef.current.takePictureAsync()` (line 32) and both `ImageManipulator.manipulateAsync()` calls (lines 44, 88) can throw on hardware failure, permission revocation mid-session, or disk full. Any such throw produces an unhandled promise rejection with no user feedback and no recovery path. Fix: wrap the function body in try/catch and call `Alert.alert('Could not capture photo', err.message)` on failure.

**H4 — `pricing_cache` table has no RLS policy** *(unresolved since 2026-06-08)*
- `supabase/migrations/001_initial_schema.sql` — no `alter table pricing_cache enable row level security` statement exists in any migration file.
- `profiles` and `scan_sessions` have RLS enabled; `pricing_cache` does not. Any authenticated client can directly read, insert, or overwrite cache rows. An attacker can poison cache entries to return false critic scores or pricing data, corrupting recommendations for all users. Fix: add `alter table pricing_cache enable row level security` and a policy granting read/write only to the service role.

---

### Medium Severity

**M1 — Supabase upsert result ignored in preferences mutation** *(unresolved since 2026-06-08)*
- `src/hooks/usePreferences.ts:38-47`
- `supabase.from('profiles').upsert({...})` is awaited but its `{ data, error }` return value is discarded. If Supabase returns an error (RLS violation, network timeout, constraint failure), `onSuccess` still fires and the user sees no indication their preferences were not saved. Fix: `const { error } = await supabase.from('profiles').upsert({...}); if (error) throw error;`

**M2 — Duplicate-grape retry silently returns invalid response** *(unresolved since 2026-06-08)*
- `src/services/recommender.ts:75-83`
- When the retry triggered by `hasDuplicateGrapes` also fails Zod validation, `parsed2.success` is `false` and the `if` block is not entered. Execution falls through to `return parsed.data`, which is the original response containing the duplicate grapes the hard rule was supposed to prevent. `parsed2.error` is never logged. Fix: throw an error or log a warning when the retry also fails, and do not return a response known to violate the grape diversity rule.

**M3 — `handleScreenshot` has no try/catch** *(unresolved since 2026-06-08)*
- `app/(tabs)/scan.tsx:86-102`
- `ImagePicker.launchImageLibraryAsync` is called in an async function with no try/catch. An OS-level permission denial or device fault causes an unhandled promise rejection.

**M4 — `signOut` error silently swallowed** *(unresolved since 2026-06-08)*
- `app/(tabs)/profile.tsx:130-133`
- `supabase.auth.signOut()` is awaited but the return value is not checked. If sign-out fails, the user is navigated to the sign-in screen while still authenticated. The session token remains valid in SecureStore, creating an inconsistent auth state where the user believes they're logged out but the session is still alive.

**M5 — Navigation fires before `updatePreferences` mutation resolves** *(unresolved since 2026-06-08)*
- `app/onboarding.tsx:37-50`
- `updatePreferences({...})` calls `mutation.mutate`, which is fire-and-forget (does not return a Promise). `router.replace('/(tabs)/scan')` is called synchronously in the same tick. On a slow connection, the user lands on the scan screen while the Supabase upsert has not yet completed. Fix: switch to `mutation.mutateAsync` and `await` it before calling `router.replace`.

**M6 — No timeout or cancel path for edge function calls** *(unresolved since 2026-06-08)*
- `app/scan/extracting.tsx:70-124`
- Neither `extractWineList` nor `recommendWines` have a timeout or abort mechanism. If an edge function hangs due to Claude API latency or a network connection that does not close, the extracting screen displays indefinitely. There is no cancel button and no escape path short of force-quitting. Fix: add an `AbortController` with a 120-second timeout and a cancel button that sets `token.active = false` and calls `router.replace('/(tabs)/scan')`.

**M7 — `scan_sessions` INSERT policy missing `with check` clause** *(unresolved since 2026-06-08)*
- `supabase/migrations/001_initial_schema.sql:22-25`
- The RLS policy is `for all using (auth.uid() = user_id)`. The `using` clause restricts SELECT, UPDATE, and DELETE but does not apply to INSERT rows. An authenticated user can insert scan session rows with any arbitrary `user_id`, including other users' IDs. Fix: change to `using (auth.uid() = user_id) with check (auth.uid() = user_id)`.

**M8 — Pre-filter uses profile default budget, not the current scan's budget** *(NEW)*
- `app/scan/extracting.tsx:38-49` and `app/scan/extracting.tsx:101`
- `preFilterWines(wines, userProfile)` at line 101 passes `userProfile` (the saved profile from `usePreferences`) and internally filters on `prefs.defaultBudget` (line 38). However, `recommendWines` at line 102-112 uses `preferences.budget` from the scan store, which is the per-scan budget set on the scan tab before this scan started. These two values can diverge. If the user's saved profile budget is £50 but they raised the per-scan budget to £200, wines priced £51-£200 are stripped from the wine list before Claude ever sees them — Claude can only recommend from the ≤£50 subset even though the current scan allows up to £200. The pre-filter must use the current scan's `preferences.budget`, not the profile default. Fix: change the call to `preFilterWines(wines, { defaultBudget: preferences.budget, ...userProfile })` or pass the scan budget explicitly.

---

### Low Severity

**L1 — `hasDuplicateGrapes` skips wines with no grape field** *(unresolved since 2026-06-08)*
- `src/services/recommender.ts:60-64`
- Wines where `grape` is `undefined` or `null` are filtered before the Set comparison. If all three recommended wines have no grape field set, the function returns `false` and no diversity retry is triggered, even though three wines of unknown or identical grape may violate the diversity hard rule.

**L2 — Cache write failure silently ignored in wine-searcher proxy** *(unresolved since 2026-06-08)*
- `supabase/functions/wine-searcher-proxy/index.ts:68-77`
- The `supabase.from('pricing_cache').upsert(...)` result is not checked. A failed write means subsequent calls for the same wine will bypass the cache and re-hit the Wine-Searcher API, burning quota unnecessarily and adding latency.

---

## Supabase and Edge Function Issues

**S1 — OCR and Recommend edge functions accept any request with the anon key — no auth** *(unresolved since 2026-06-08)*
- `supabase/functions/ocr/index.ts:38` and `supabase/functions/recommend/index.ts:115`
- Both functions perform no JWT verification or user identity check. The anon key is bundled in the app binary and trivially extractable. Any actor with the key can make unlimited OCR and recommendation requests, generating unlimited Claude API costs with no attribution or rate limiting.

**S2 — Edge function calls do not attach the user JWT** *(unresolved since 2026-06-08)*
- `src/api/claude.ts:6-16`
- `invokeFunction` sets only the `apikey` (anon key) header. The `Authorization: Bearer <user_jwt>` header is never sent. Edge functions cannot distinguish authenticated users from anonymous callers even if auth is added later. Fix: replace `invokeFunction` with `supabase.functions.invoke()`, which automatically attaches the active session token. This is already done correctly in `src/api/wine-searcher.ts:12`.

**S3 — Preferences query error and missing row both return `null`, causing false onboarding redirects** *(unresolved since 2026-06-08)*
- `src/hooks/usePreferences.ts:19-21`
- Both a genuine network error and a legitimately missing row return `null`. In `app/index.tsx:20`, `preferences === null` triggers a redirect to `/onboarding`. A returning user whose preferences query fails at launch (network blip, intermittent connectivity) will be sent back through onboarding and may overwrite their saved preferences. Fix: inspect `error.code` — redirect to onboarding only on `PGRST116` (no row found); rethrow all other errors so the query enters an error state that can be handled distinctly.

**S4 — Wine-Searcher API key exposed in URL query parameter** *(unresolved since 2026-06-08)*
- `supabase/functions/wine-searcher-proxy/index.ts:48`
- The API key is appended as `?api_key=${WINE_SEARCHER_API_KEY}` in the request URL, exposing it in Wine-Searcher's access logs, CDN logs, and any HTTP proxy logs. Fix: pass the key as a request header (`Authorization` or `X-Api-Key`) instead of in the URL.

**S5 — `scan/preferences.tsx` calls `recommendWines` with an incomplete payload** *(unresolved since 2026-06-08)*
- `app/scan/preferences.tsx:28-33`
- `recommendWines` is called with only `{ wines, styleProfiles, budget, foodPairing }`. The fields `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` are all `undefined`. All user preference constraints are silently ignored when a user arrives via this screen. This screen is also currently unreachable via normal navigation (see N2), but the broken call should be fixed if the screen is re-wired.

---

## UX and Performance Issues

**U1 — History cards tap to nothing** *(unresolved since 2026-06-08)*
- `app/(tabs)/history.tsx:64`
- `<TouchableOpacity style={styles.card}>` has no `onPress` prop. The card renders with the visual press affordance (opacity flash on Android, highlight on iOS) but tapping does nothing. Users cannot view the details of a past scan. Either implement a detail view and navigate to it on press, or remove `TouchableOpacity` and use a plain `View`.

**U2 — Duplicate body text on extracting screen during recommending stage** *(unresolved since 2026-06-08)*
- `app/scan/extracting.tsx:141-152`
- When `stage === 'recommending'`, two `<Text>` elements with `styles.body` are rendered consecutively: "Scoring by critic rating, vintage quality and value" and then "This may take a minute or two". The second is redundant. Remove the `{stage === 'recommending' && (<Text style={styles.body}>This may take a minute or two</Text>)}` block.

**U3 — Profile screen shows empty/default state while preferences load** *(unresolved since 2026-06-08)*
- `app/(tabs)/profile.tsx:147-441`
- The profile screen renders immediately with all pickers in their default empty state before Supabase returns the user's saved preferences. A user who opens Profile quickly after launch sees "No preference" or "I like them all" for every field and may believe their saved settings were lost. Add a loading skeleton or an `ActivityIndicator` gated on `preferences === undefined`.

**U4 — Back arrow in Profile tab stacks Scan onto the tab navigator** *(unresolved since 2026-06-08)*
- `app/(tabs)/profile.tsx:182-184`
- A back `arrow-back` icon navigates via `router.push('/(tabs)/scan')`. Profile is a tab screen, not a stack-pushed modal, so there is no conceptual "back". `router.push` stacks a new scan screen on top of the tab navigator; pressing the system back button then returns to Profile unexpectedly. Remove the icon or replace `router.push` with `router.navigate` to switch tabs without stacking.

**U5 — No cancel button during multi-minute AI processing** *(unresolved since 2026-06-08)*
- `app/scan/extracting.tsx:139-161`
- The loading screen instructs users "Please don't leave this page" and provides no cancel mechanism. If either API call is slow or silently hung, the user is stranded indefinitely. Add a cancel button (visible after e.g. 10 seconds) that marks `token.active = false` and calls `router.replace('/(tabs)/scan')`.

**U6 — No input validation before auth API calls** *(unresolved since 2026-06-08)*
- `app/(auth)/sign-in.tsx:12-20` and `app/(auth)/sign-up.tsx:12-20`
- Both forms submit with empty email/password directly to Supabase, which surfaces a raw server error via `Alert.alert`. Client-side validation (non-empty fields, basic email format, minimum password length) should run before any network call is made.

**U7 — `WineRecommendationCard` component is dead code** *(unresolved since 2026-06-08)*
- `src/components/results/WineRecommendationCard.tsx:1-195`
- This component is not imported anywhere in the app. `app/scan/results.tsx` renders wine cards entirely inline. The component contains duplicated logic (rank labels, outside-preferences notice, badge rendering) that will silently diverge from the live UI. Remove the file to prevent confusion.

---

## Navigation Issues

**N1 — `/scan/url` is an unimplemented stub** *(unresolved since 2026-06-08)*
- `app/scan/url.tsx:1-5`
- The entire file is `return <Redirect href="/(tabs)/scan" />`. No URL-based wine list scanning is implemented, and no other screen navigates here. Either remove the file or implement the feature and link to it from the scan tab.

**N2 — `/scan/preferences` is an orphaned screen unreachable by navigation** *(unresolved since 2026-06-08)*
- `app/scan/preferences.tsx:1-127`
- The current scan flow is `camera → preview → extracting → results`. No `router.push` or `router.replace` call in any active file targets `/scan/preferences`. The screen cannot be reached through normal app use, and its `recommendWines` call is broken (see S5). Remove the file or re-wire it into the flow.

**N3 — "Account" button in Scan tab stacks Profile on the scan navigator** *(unresolved since 2026-06-08)*
- `app/(tabs)/scan.tsx:163`
- `router.push('/(tabs)/profile')` pushes the Profile tab screen onto the scan stack. The device back button then returns to the scan screen rather than staying within the Profile tab. Use `router.navigate('/(tabs)/profile')` to switch tabs without stacking.

**N4 — Signed-in users with a launch-time network error are looped into onboarding** *(unresolved since 2026-06-08)*
- `app/index.tsx:20` and `src/hooks/usePreferences.ts:19-21`
- As described in S3: when the preferences query fails at launch, `preferences` is `null`, which `index.tsx` treats as "no preferences set" and redirects to `/onboarding`. A returning user on a flaky connection will be forced through onboarding again, overwriting their saved preferences once the upsert completes.
