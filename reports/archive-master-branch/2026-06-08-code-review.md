# Code Review — 2026-06-08

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

---

## Bugs and Crashes

### High Severity

**H1 — Race condition: new signed-in users bypass onboarding**
- `app/index.tsx:20`
- `usePreferences` returns `undefined` (not `null`) while the React Query fetch is in flight. The check `preferences === null` is `false` for `undefined`, so the component falls through to `return <Redirect href="/(tabs)/scan" />` before the query resolves. New users who have no profile row in Supabase never reach `/onboarding`. The fix is to expose `isLoading` from `usePreferences` and return `null` from `index.tsx` until the query settles.

**H2 — `router.replace` called during render, not inside `useEffect`**
- `app/scan/results.tsx:23-25`
- When `recommendation` is `null`, the component calls `router.replace('/(tabs)/scan')` directly in the render function body. Calling a navigation action during render is a side effect that produces the React warning "Cannot update a component while rendering a different component" and is likely to crash under React 19 strict mode. Wrap in a `useEffect` with `[recommendation]` as the dependency.

**H3 — `takePictureAsync` and `manipulateAsync` not wrapped in try/catch**
- `app/scan/camera.tsx:29-99`
- The entire `handleCapture` async function has no try/catch. `cameraRef.current.takePictureAsync()` (line 32) and each `ImageManipulator.manipulateAsync()` call (lines 44, 88) can throw on hardware failure, revoked permission, or disk full. Any error produces an unhandled promise rejection with no user feedback and no recovery path.

**H4 — `pricing_cache` table has no RLS policy**
- `supabase/migrations/001_initial_schema.sql` — no `alter table pricing_cache enable row level security` statement
- `profiles` and `scan_sessions` have RLS enabled; `pricing_cache` does not. Without RLS, any authenticated Supabase client can read, insert, or overwrite cache entries directly. An attacker could poison cache rows to return fake critic scores or pricing data, corrupting recommendations for all users.

---

### Medium Severity

**M1 — Supabase upsert result ignored in preferences mutation**
- `src/hooks/usePreferences.ts:38-47`
- `supabase.from('profiles').upsert({...})` is awaited but its `{ data, error }` return value is never checked. If Supabase returns an error (RLS violation, network timeout, constraint failure), `onSuccess` still fires and the user receives no indication that their preferences were not persisted. Add `const { error } = await supabase.from(...).upsert(...)` and throw on error.

**M2 — Duplicate-grape retry silently returns invalid data**
- `src/services/recommender.ts:75-82`
- When the retry after detecting duplicate grape varieties fails Zod validation (`parsed2.success` is false), the code falls through and returns the original `parsed.data`, which contains the duplicate grapes the hard rule was supposed to prevent. `parsed2.error` is never logged. The user receives a response that violates a stated hard rule with no indication anything went wrong.

**M3 — `handleScreenshot` has no try/catch**
- `app/(tabs)/scan.tsx:86-102`
- The async `handleScreenshot` function calls `ImagePicker.launchImageLibraryAsync` with no try/catch. Any picker-level error (permission denied at OS level, device fault) causes an unhandled promise rejection.

**M4 — `signOut` error silently swallowed**
- `app/(tabs)/profile.tsx:130-133`
- `supabase.auth.signOut()` is awaited but its return value is ignored. If sign-out fails (network error), the user is redirected to the sign-in screen while still authenticated. The session token remains valid in SecureStore, creating an inconsistent auth state.

**M5 — Navigation fires before `updatePreferences` mutation resolves**
- `app/onboarding.tsx:37-50`
- On the final step, `updatePreferences({...})` calls `mutation.mutate`, which is fire-and-forget (it does not return a Promise). `router.replace('/(tabs)/scan')` is called synchronously in the same tick, before the Supabase upsert has started. On a slow connection the user lands on the scan screen while their onboarding preferences are still saving. Use `mutation.mutateAsync` and `await` it before navigating.

**M6 — No timeout or cancel for edge function calls**
- `app/scan/extracting.tsx:70-124`
- Neither `extractWineList` nor `recommendWines` apply any timeout. If either edge function hangs (Claude API latency spike, network failure that doesn't close the connection), the loading screen is displayed indefinitely. There is no cancel button and no escape path short of force-quitting the app.

**M7 — `scan_sessions` INSERT policy missing `with check` clause**
- `supabase/migrations/001_initial_schema.sql:22-25`
- The policy is `for all using (auth.uid() = user_id)`. The `using` clause restricts SELECT/UPDATE/DELETE but does not apply to INSERT. For INSERT rows, a separate `with check` clause is required. Without it, an authenticated user can insert rows with any `user_id` value, including other users' IDs. Change the policy to `using (auth.uid() = user_id) with check (auth.uid() = user_id)`.

---

### Low Severity

**L1 — `hasDuplicateGrapes` skips wines with no grape field**
- `src/services/recommender.ts:60-64`
- Wines where `grape` is `undefined` are filtered out before the Set comparison. If all three recommended wines have no grape field, the function returns `false` and no diversity retry is triggered, even though the grape-diversity hard rule has been violated by omission.

**L2 — Cache write failure silently ignored in wine-searcher proxy**
- `supabase/functions/wine-searcher-proxy/index.ts:68-77`
- The `pricing_cache.upsert(...)` result is not checked. A failed write means subsequent calls for the same wine re-hit the Wine-Searcher API, burning API quota unnecessarily.

---

## Supabase and Edge Function Issues

**S1 — OCR and Recommend edge functions have no authentication**
- `supabase/functions/ocr/index.ts:38` and `supabase/functions/recommend/index.ts:115`
- Both functions accept any request that includes the public anon key. There is no JWT verification, no user identity check, and no per-user rate limiting. The anon key is bundled in the app binary and is trivially extractable. Any actor with the key can make unlimited OCR and recommendation requests, generating unlimited Claude API costs with no attribution.

**S2 — Edge function calls do not attach the user JWT**
- `src/api/claude.ts:6-16`
- `invokeFunction` sets only the `apikey` (anon key) header. The `Authorization: Bearer <user_jwt>` header is not sent. This means edge functions cannot distinguish authenticated users from anonymous callers even if they are updated to require auth. Replace `invokeFunction` with `supabase.functions.invoke()`, which automatically attaches the active session token, as is already done correctly in `src/api/wine-searcher.ts:12`.

**S3 — Query error and missing profile both return `null`, triggering false onboarding redirects**
- `src/hooks/usePreferences.ts:19-21`
- When the Supabase query fails for any reason (network error, RLS denial, `.single()` returning no rows), the query function returns `null`. In `app/index.tsx:20`, `preferences === null` triggers a redirect to `/onboarding`. A returning user with saved preferences will re-enter the onboarding flow every time the preferences query fails at launch. Distinguish between "no row exists" (PGRST116 error code) and other errors; only redirect to onboarding for the former.

**S4 — Wine-Searcher API key passed as a URL query parameter**
- `supabase/functions/wine-searcher-proxy/index.ts:48`
- The API key is appended to the request URL as `?api_key=...`. This exposes the key in Wine-Searcher's access logs, CDN logs, and any intermediary HTTP proxies. Pass the key as a request header (e.g., `X-Api-Key` or `Authorization`) instead.

**S5 — `scan/preferences.tsx` calls `recommendWines` with an incomplete payload**
- `app/scan/preferences.tsx:28-33`
- This screen passes only `{ wines, styleProfiles, budget, foodPairing }` to `recommendWines`. The `RecommendInput` type requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. All five fields are `undefined`, so all user preference constraints are silently ignored when a user arrives via this screen. TypeScript does not catch this because the fields are typed as arrays (not required by the interface where this is called).

---

## UX and Performance Issues

**U1 — History cards tap to nothing**
- `app/(tabs)/history.tsx:64`
- `<TouchableOpacity style={styles.card}>` has no `onPress` handler. The card renders with a press highlight affordance but tapping does nothing. Users cannot drill into past scans to review their recommendations.

**U2 — Duplicate body text on extracting screen during recommending stage**
- `app/scan/extracting.tsx:141-148`
- When `stage === 'recommending'`, two `<Text>` elements are rendered consecutively: "Scoring by critic rating, vintage quality and value" and "This may take a minute or two". The second is rendered by the `stage === 'recommending' && (...)` block and duplicates the time estimate already implied by the first. Remove the second message.

**U3 — Profile screen shows empty/default state while preferences load**
- `app/(tabs)/profile.tsx:147-441`
- The profile screen renders immediately with all pickers in their default empty state before Supabase returns the user's actual preferences. There is no loading indicator. A user who opens Profile quickly after launch will see "No preference" or "I like them all" for all fields and may believe their saved preferences were lost.

**U4 — Back arrow in Profile tab pushes Scan onto the stack**
- `app/(tabs)/profile.tsx:182-184`
- An `arrow-back` Ionicon navigates via `router.push('/(tabs)/scan')`. Because Profile is a tab, there is no "back" in the navigation-stack sense. `router.push` here stacks scan on top of the tab navigator, creating a confusing navigation state where pressing the device back button lands in the wrong place. Remove the icon, or replace with `router.navigate` if a shortcut to Scan is genuinely needed.

**U5 — No cancel button during multi-minute AI processing**
- `app/scan/extracting.tsx:139-161`
- The loading view tells users "Please don't leave this page" but provides no cancel or retry mechanism. If either API call is unexpectedly slow or fails silently (without throwing), the user is stranded with no recovery path. Add a cancel button that calls `token.active = false` and `router.replace('/(tabs)/scan')`.

**U6 — No input validation before auth API calls**
- `app/(auth)/sign-in.tsx:12-20` and `app/(auth)/sign-up.tsx:12-20`
- Both forms submit empty email/password fields directly to Supabase, which responds with a raw error message surfaced via `Alert.alert('Sign in failed', error.message)`. Validate that both fields are non-empty and that the email matches a basic format before making the network call.

**U7 — `WineRecommendationCard` component is dead code**
- `src/components/results/WineRecommendationCard.tsx:1-195`
- This component is not imported or referenced anywhere in the app. `app/scan/results.tsx` renders wine cards entirely inline. The component contains significant duplicated logic (rank labels, outside-preferences notice, badge rendering) and will drift from the live UI unless removed.

---

## Navigation Issues

**N1 — `/scan/url` is an unimplemented stub that redirects immediately**
- `app/scan/url.tsx:1-4`
- The route body is `return <Redirect href="/(tabs)/scan" />`. No URL-based wine list input is implemented. No other screen in the app navigates to this route. The file should either be removed (if the feature is abandoned) or implemented and linked from the scan tab.

**N2 — `/scan/preferences` is an orphaned screen unreachable by navigation**
- `app/scan/preferences.tsx:1-127`
- The current scan flow is: camera → preview → extracting → results. Nothing navigates to `/scan/preferences`. The screen cannot be reached through normal app use, and its `recommendWines` call is broken (see S5 above). The file should be removed or wired back into the flow.

**N3 — "Account" button in Scan tab pushes Profile onto the scan stack**
- `app/(tabs)/scan.tsx:163`
- `router.push('/(tabs)/profile')` pushes the Profile tab screen onto the scan stack. The user sees Profile in the scan navigator context, and the device back button returns them to the scan tab rather than staying in Profile. Tab switching should use `router.navigate('/(tabs)/profile')` or rely on the bottom tab bar.

**N4 — Signed-in users with a load-time network error loop into onboarding**
- `app/index.tsx:20` and `src/hooks/usePreferences.ts:19-21`
- As described in S3: when the preferences query fails at launch (network error), `preferences` is `null`, which `index.tsx` interprets as "no preferences set" and redirects to `/onboarding`. A returning user who experiences a connectivity blip will re-complete onboarding, overwriting their saved preferences once the write goes through.
