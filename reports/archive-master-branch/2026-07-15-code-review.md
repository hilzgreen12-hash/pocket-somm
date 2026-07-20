# Pocket Somm — Code Review
**Date:** 2026-07-15  
**Reviewer:** Automated (Claude Code)  
**Scope:** Full codebase — bugs/crashes, Supabase/edge functions, UX/performance, navigation

---

## Bugs and Crashes

### Critical

**C-1 — Silent Supabase upsert failure; preferences never confirmed saved**
- **File:** `src/hooks/usePreferences.ts:38`
- **Severity:** Critical
- The Supabase `.upsert()` call does not destructure or check `{ error }`. Supabase JS does not throw on RLS denial or network failure — it returns `{ data, error }`. Because the return value is ignored, the React Query `mutationFn` always resolves successfully and `onError` is never invoked. Any RLS rejection, schema mismatch, or network drop silently discards the user's wine preferences with no feedback and no retry.
- **Fix:** `const { error } = await supabase.from('profiles').upsert({...}); if (error) throw error;`

**C-2 — Navigation fires before `updatePreferences` mutation completes (onboarding)**
- **File:** `app/onboarding.tsx:38`
- **Severity:** Critical
- `handleNext()` calls `updatePreferences(...)` (i.e. `mutation.mutate()`) and then immediately calls `router.replace('/(tabs)/scan')` on the next line. `mutation.mutate()` is fire-and-forget — it does not return a promise. The router call fires synchronously on the same tick before the save has started. Combined with C-1, the user is navigated away and their onboarding preferences are silently lost on every first-run.
- **Fix:** Use `mutation.mutateAsync()` and `await` it, or move navigation to the `onSuccess` callback.

**C-3 — `router.replace()` called during the render phase**
- **File:** `app/scan/results.tsx:23`
- **Severity:** Critical
- The guard `if (!recommendation) { router.replace('/(tabs)/scan'); return null; }` executes a navigation side-effect in the render body. React prohibits state/navigation updates during rendering. In React 19 Strict Mode this causes "Cannot update a component while rendering a different component" errors and can trigger double-navigation.
- **Fix:** Move to a `useEffect`: `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation]);`

**C-4 — `takePictureAsync` and `manipulateAsync` have no error handling**
- **File:** `app/scan/camera.tsx:29`
- **Severity:** Critical
- The `handleCapture` function awaits `cameraRef.current.takePictureAsync(...)` and two calls to `ImageManipulator.manipulateAsync(...)` with no surrounding `try/catch`. A camera hardware error, temporary permission revocation, or out-of-memory condition on the image manipulator will throw an unhandled promise rejection, silently killing the capture flow with no user feedback or recovery path.

**C-5 — Missing `expo-camera` and `expo-image-picker` plugins in `app.json`**
- **File:** `app.json:31` (plugins array)
- **Severity:** Critical
- Both `expo-camera` and `expo-image-picker` require their Expo config plugins to inject permission strings (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` on iOS; `CAMERA`, `READ_MEDIA_IMAGES` on Android). Neither plugin is present in the `plugins` array. On iOS, the OS will hard-crash the app when the camera or photo library permission is first requested. On Android, permissions are silently denied or a `SecurityException` is thrown.
- **Fix:** Add to `app.json` plugins:
  ```json
  ["expo-camera", { "cameraPermission": "Pocket Somm needs your camera to scan wine lists." }],
  ["expo-image-picker", { "photosPermission": "Pocket Somm needs photo access to scan screenshots of wine lists." }]
  ```

**C-6 — `JSON.parse(text)` unguarded; throws `SyntaxError` on non-JSON gateway responses**
- **File:** `src/api/claude.ts:17`
- **Severity:** Critical
- After a successful HTTP status check, `return JSON.parse(text)` is called with no try/catch. If the Supabase gateway returns a valid HTTP 200 with an HTML error page or a plain-text timeout message (common on cold starts), `JSON.parse` throws a `SyntaxError` with the message `"Unexpected token '<'"` — losing all context about which function failed or what the raw response was.
- **Fix:** Wrap in try/catch and rethrow with context: `try { return JSON.parse(text); } catch { throw new Error(\`${name}: invalid JSON response: ${text.slice(0, 200)}\`); }`

---

### High

**H-1 — History cards have no `onPress` handler (navigation dead-end)**
- **File:** `app/(tabs)/history.tsx:64`
- **Severity:** High
- Every scan history entry is rendered as a `TouchableOpacity` with no `onPress` prop. Tapping gives visual tap feedback (opacity change) but does nothing. Users will repeatedly tap thinking a detail view will open.
- **Fix:** Add `onPress={() => router.push({ pathname: '/scan/results', params: { sessionId: item.id } })}` or remove the `TouchableOpacity` wrapper if detail navigation is not yet implemented.

**H-2 — `recommendation.topPick` does not exist on `RecommendationResponse`; wine name never shown in history**
- **File:** `app/(tabs)/history.tsx:71`
- **Severity:** High
- The render path checks `item.recommendation?.topPick` and renders `topPick.name`, but `RecommendationResponse` has `{ wines: WineRecommendation[]; summary: string }` — there is no `topPick` field. The `as ScanSession[]` cast suppresses the TypeScript error. At runtime, `topPick` is always `undefined`, so the wine name subtitle is never rendered. History cards show only the date.
- **Fix:** `item.recommendation?.wines?.[0]?.name`

**H-3 — `scan_sessions` table is never written to; history is permanently empty**
- **File:** Entire codebase (no write site exists)
- **Severity:** High
- The history tab queries `scan_sessions` correctly and RLS is configured, but no code in the app ever inserts a row into `scan_sessions`. The history feature is architecturally complete but functionally dead. Every user's history will be empty until persistence is implemented (presumably at the end of a successful scan in `app/scan/results.tsx`).

**H-4 — `preferences === null` check misses `undefined` loading state; onboarding skippable on first load**
- **File:** `app/index.tsx:20`
- **Severity:** High
- The auth redirect logic checks `if (preferences === null)` to detect a new user who needs onboarding. However, `useQuery` returns `data` as `undefined` while loading (not `null`). `null` is only returned when the queryFn explicitly returns it on a Supabase error. During the loading window after a new sign-up, `preferences` is `undefined`, which does not satisfy `=== null`, so the user is sent to `/(tabs)/scan` before onboarding completes.
- **Fix:** Add a loading guard: `if (preferences === undefined) return null; // loading`

**H-5 — `recommendWines` called with 5 missing required fields**
- **File:** `app/scan/preferences.tsx:28`
- **Severity:** High
- The call to `recommendWines({ wines, styleProfiles, budget, foodPairing })` omits `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` — all required by the `RecommendInput` interface. At runtime these arrive as `undefined` in the edge function, rendering all user profile filters as "None specified". TypeScript likely catches this as a compile error, making this screen potentially dead code; there is no navigation to `app/scan/preferences.tsx` in the current scan flow.

**H-6 — Back arrow in profile tab uses `router.push` instead of `router.back()`**
- **File:** `app/(tabs)/profile.tsx:182`
- **Severity:** High
- `onPress={() => router.push('/(tabs)/scan')}` adds a new entry to the navigation stack instead of popping the current one. Repeated tapping accumulates stack entries. Users cannot use the OS back gesture to return to where they came from.
- **Fix:** Replace with `router.back()`.

**H-7 — Sign-out error not handled; navigates to sign-in even on failure**
- **File:** `app/(tabs)/profile.tsx:130`
- **Severity:** High
- `await supabase.auth.signOut()` result is not checked. On network failure, `signOut()` returns `{ error }` without throwing. Navigation to `/(auth)/sign-in` fires regardless, leaving a live session token in `SecureStore` while the UI shows the sign-in screen. The `AuthProvider` will re-detect the session on next render and immediately redirect back, creating a navigation loop.

**H-8 — `UserPreferences.defaultBudget` typed `number` but runtime value is `number | null`**
- **File:** `app/scan/extracting.tsx:38` / `src/types/preferences.ts`
- **Severity:** High
- `UserPreferences` declares `defaultBudget: number` but `usePreferences.ts` maps the column as `defaultBudget: data.default_budget ?? null`. The `as UserPreferences` cast hides the discrepancy from TypeScript. The truthiness guard `if (prefs.defaultBudget)` papers over `null` at runtime but also skips filtering when the budget is legitimately `0`.
- **Fix:** Change the type to `defaultBudget: number | null`.

---

### Low

**L-1 — Dead root files from pre-expo-router setup**
- **File:** `index.ts`, `App.tsx` (project root)
- **Severity:** Low
- `index.ts` calls `registerRootComponent(App)`. `package.json` sets `"main": "expo-router/entry"`, so these files are never executed. They should be deleted to avoid confusing future contributors.

---

## Supabase and Edge Function Issues

**S-1 — `pricing_cache` table has no RLS (publicly readable and writable)**
- **File:** `supabase/migrations/001_initial_schema.sql`
- RLS is enabled on `profiles` and `scan_sessions` but not on `pricing_cache`. Any client holding the anon key can read all cached wine prices or insert/overwrite rows (cache poisoning). The edge function uses the service role key and is unaffected, but direct client access is unrestricted.
- **Fix:** `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY;` with a policy granting SELECT to `authenticated` at most, or restricting to service-role only.

**S-2 — Edge functions invoked via raw `fetch` without user JWT**
- **File:** `src/api/claude.ts`
- The OCR and recommend edge functions are called using raw `fetch` with only the anon key in the `apikey` header — no `Authorization: Bearer <user_token>`. The `wine-searcher.ts` service correctly uses `supabase.functions.invoke()` which attaches the authenticated JWT automatically. Without the JWT, edge functions cannot identify the calling user, per-user rate limiting is impossible, and some Supabase gateway configurations will return 401 errors.
- **Fix:** Replace raw `fetch` with `supabase.functions.invoke()`, or manually add `Authorization: Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` to the headers.

**S-3 — Wine-Searcher proxy uses guessed/unofficial API endpoint and field names**
- **File:** `supabase/functions/wine-searcher-proxy/index.ts:48`
- The endpoint `https://www.wine-searcher.com/api/wine-check` and response fields `price_avg`, `price_min`, `price_max`, `critic_score` are speculative — a developer comment in the file explicitly says "field names are guesses" and "adjust once you have API access." This function returns null pricing data for all wines until confirmed against the actual Wine-Searcher commercial API response schema.

**S-4 — Edge functions use `claude-opus-4-6` — high cost for structured extraction tasks**
- **File:** `supabase/functions/ocr/index.ts:58`, `supabase/functions/recommend/index.ts:170`
- Both edge functions specify `model: 'claude-opus-4-6'`. Opus is roughly 5× more expensive per token than Sonnet. OCR wine list extraction is a structured task well within Sonnet's capability. At any meaningful scan volume this is a significant and avoidable cost.
- **Fix:** Switch both to `claude-sonnet-4-6` or `claude-sonnet-5`.

**S-5 — Duplicate-grape retry falls through to original bugged response on second parse failure**
- **File:** `src/services/recommender.ts:75`
- If `hasDuplicateGrapes` is true, a strict-diversity retry is attempted. If the retry's Zod parse also fails (`parsed2.success === false`), the code falls through and returns `parsed.data` — the original response that triggered the duplicate check. No error is logged and no exception is thrown. The user receives a deduplicated-grapes violation silently.

**S-6 — Base64 image payload not size-bounded before sending to edge function**
- **File:** `src/services/ocr.ts:22`
- Images are resized to 1600px wide at 0.85 JPEG quality before base64-encoding. A 1600×2240 JPEG at this quality is approximately 600KB–1.5MB, yielding a base64 string of ~900KB–2MB. Supabase Edge Functions have a configurable request body limit (default 1MB). There is no size check before the payload is sent. Large captures on high-end phones may silently exceed the limit.
- **Fix:** Reduce width to 1200 or compress to 0.7, or add a payload size check and show a user-facing error.

---

## UX and Performance Issues

**U-1 — Scan history shows empty wine name for every entry**
- **File:** `app/(tabs)/history.tsx:71`
- See H-2. The wine name subtitle is never shown due to a non-existent field reference. Every history card displays only the date.

**U-2 — Empty `wines` array renders a blank results screen with no empty-state message**
- **File:** `app/scan/results.tsx:27`
- The Zod schema for `RecommendationResponse` does not enforce `.min(1)` on the `wines` array. If Claude returns zero recommendations (valid when no wines match hard constraints), the screen renders "Pocket Somm Recommends" followed by nothing. No empty-state message, illustration, or retry suggestion is shown.
- **Fix:** Add a conditional empty-state view when `recommendation.wines.length === 0`.

**U-3 — Tap-to-focus gesture sets state but never applies to the camera**
- **File:** `app/scan/camera.tsx:15`
- `handleTap` sets `focusPoint` state on tap but `focusPoint` is never passed to the `CameraView` component. No visual focus ring is shown and no focus command is sent to the camera hardware. The tap gesture is completely non-functional and will confuse users who expect standard camera focus behavior.

**U-4 — Stale profile preferences on scan tab after in-session profile update**
- **File:** `app/(tabs)/scan.tsx:59`
- The `prefsLoaded` flag prevents the scan tab's local state from re-syncing when `savedPreferences` changes. If a user updates their preferences in the profile tab while the scan tab remains mounted (common in tab navigation), the scan tab continues using the old values until it is unmounted.
- **Fix:** Remove the `prefsLoaded` guard and instead use the `savedPreferences` data directly (controlled component), or reset `prefsLoaded` when `savedPreferences` reference changes.

**U-5 — Sign-out does not clear `scanStore`; previous user's scan data visible to next user**
- **File:** `app/(tabs)/profile.tsx:130`
- Zustand `scanStore` persists in memory across sessions (image URI, extracted wines, recommendation, preferences). If a different user signs in on the same device without restarting the app, they will briefly see stale data from the previous session until a new scan is started.
- **Fix:** Call `useScanStore.getState().reset()` (or equivalent) before navigating to sign-in.

**U-6 — No input validation on sign-in and sign-up forms**
- **File:** `app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`
- Both forms perform no client-side validation. Empty email/password fields trigger unnecessary network requests. Sign-up has no password confirmation field, making it easy for users to lock themselves out with a typo.

**U-7 — `PricingBadge` component is wired but `fetchPricing` is never called**
- **File:** `src/components/results/PricingBadge.tsx`, `app/scan/results.tsx`
- `WineRecommendationCard` accepts and renders a `pricing` prop, and `PricingBadge` is a complete component. However, `app/scan/results.tsx` never imports or calls `fetchPricing`, so `pricing` is always `undefined`. The market-price feature is visually absent from the results screen despite being implemented at the component level.

**U-8 — "subscription email" label on profile screen is misleading**
- **File:** `app/(tabs)/profile.tsx:153`
- The label reads "Change your subscription email account." The app has no subscription or payment system. This copy will confuse users into thinking there is a separate subscription email, or that they're updating billing contact info.
- **Fix:** Change to "Email address" or "Account email".

---

## Navigation Issues

**N-1 — `app/scan/results.tsx` — Side-effect navigation during render (see C-3)**
- **File:** `app/scan/results.tsx:23`
- `router.replace()` inside the render body causes React rule violations. Move to `useEffect`.

**N-2 — History cards are tappable with no destination (see H-1)**
- **File:** `app/(tabs)/history.tsx:64`
- `TouchableOpacity` wraps each card but has no `onPress`. Users cannot navigate to a scan detail view.

**N-3 — Back button in profile adds stack entries instead of going back (see H-6)**
- **File:** `app/(tabs)/profile.tsx:182`
- `router.push('/(tabs)/scan')` should be `router.back()`.

**N-4 — `app/scan/url.tsx` is a stub that only redirects (dead route)**
- **File:** `app/scan/url.tsx`
- The entire screen body is `return <Redirect href="/(tabs)/scan" />`. The route exists in the file system but navigates immediately away. It should be implemented or deleted.

**N-5 — `app/scan/preferences.tsx` is orphaned — no navigation path reaches it**
- **File:** `app/scan/preferences.tsx`
- The scan flow proceeds: `scan` → `camera` → `preview` → `extracting` → `results`. There is no `router.push('/scan/preferences')` anywhere in the codebase. The file exists but is unreachable by any in-app navigation.

**N-6 — Onboarding-to-scan navigation races the preferences save (see C-2)**
- **File:** `app/onboarding.tsx:38`
- `router.replace('/(tabs)/scan')` fires before `updatePreferences` resolves. If `app/index.tsx` re-evaluates during the transition, `preferences` may still be `undefined` or `null`, re-triggering the onboarding redirect and creating a navigation loop for new users.

**N-7 — Sign-out navigation fires even on `signOut()` failure (see H-7)**
- **File:** `app/(tabs)/profile.tsx:130`
- If `signOut()` errors, the `AuthProvider` still holds an active session. Navigating to `/(auth)/sign-in)` causes the auth guard to immediately redirect back to `/(tabs)/scan`, creating a redirect loop until the session expires.

---

## Summary

| ID | File | Severity | Issue |
|----|------|----------|-------|
| C-1 | `src/hooks/usePreferences.ts:38` | Critical | Supabase upsert error silently swallowed; preferences never confirmed saved |
| C-2 | `app/onboarding.tsx:38` | Critical | `updatePreferences` not awaited; navigation fires before save |
| C-3 | `app/scan/results.tsx:23` | Critical | `router.replace()` called during render phase |
| C-4 | `app/scan/camera.tsx:29` | Critical | `takePictureAsync` / `manipulateAsync` have no error handling |
| C-5 | `app.json:31` | Critical | Missing `expo-camera` and `expo-image-picker` plugins → device permission crash |
| C-6 | `src/api/claude.ts:17` | Critical | Unguarded `JSON.parse` throws on non-JSON gateway response |
| H-1 | `app/(tabs)/history.tsx:64` | High | History cards have no `onPress` — navigation dead-end |
| H-2 | `app/(tabs)/history.tsx:71` | High | `recommendation.topPick` doesn't exist on the type; wine name never shown |
| H-3 | (codebase-wide) | High | `scan_sessions` never written — history permanently empty |
| H-4 | `app/index.tsx:20` | High | Loading state (`undefined`) not guarded; onboarding skippable on first load |
| H-5 | `app/scan/preferences.tsx:28` | High | `recommendWines` called with 5 missing required fields |
| H-6 | `app/(tabs)/profile.tsx:182` | High | Back arrow uses `router.push` — adds stack entry instead of going back |
| H-7 | `app/(tabs)/profile.tsx:130` | High | Sign-out error not handled; navigates to sign-in on failure |
| H-8 | `src/types/preferences.ts` / `app/scan/extracting.tsx:38` | High | `defaultBudget` typed `number` but runtime value is `number \| null` |
| S-1 | `supabase/migrations/001_initial_schema.sql` | Medium | `pricing_cache` has no RLS — publicly readable and writable |
| S-2 | `src/api/claude.ts` | Medium | Raw `fetch` omits user JWT; edge functions can't identify the caller |
| S-3 | `supabase/functions/wine-searcher-proxy/index.ts:48` | Medium | Guessed Wine-Searcher API endpoint and field names — returns null for all pricing |
| S-4 | `supabase/functions/ocr/index.ts:58`, `recommend/index.ts:170` | Low | `claude-opus-4-6` used for both functions — should use Sonnet to reduce cost |
| S-5 | `src/services/recommender.ts:75` | Medium | Duplicate-grape retry silently falls through to original bugged response |
| S-6 | `src/services/ocr.ts:22` | Low | No base64 payload size limit; may exceed edge function body limit |
| U-1 | `app/(tabs)/history.tsx:71` | High | History shows empty wine name due to wrong field reference |
| U-2 | `app/scan/results.tsx:27` | Medium | Empty `wines` array shows blank screen with no empty-state message |
| U-3 | `app/scan/camera.tsx:15` | Medium | `focusPoint` state set on tap but never applied — tap-to-focus broken |
| U-4 | `app/(tabs)/scan.tsx:59` | Medium | Stale scan-tab preferences after in-session profile update |
| U-5 | `app/(tabs)/profile.tsx:130` | Medium | Sign-out doesn't reset `scanStore`; stale scan data visible to next user |
| U-6 | `app/(auth)/sign-in.tsx`, `sign-up.tsx` | Medium | No client-side input validation on auth forms |
| U-7 | `app/scan/results.tsx` | Low | `PricingBadge` component implemented but `fetchPricing` never called |
| U-8 | `app/(tabs)/profile.tsx:153` | Low | "subscription email" label is misleading — no subscription exists |
| N-1 | `app/scan/results.tsx:23` | Critical | Side-effect navigation during render (duplicate of C-3) |
| N-2 | `app/(tabs)/history.tsx:64` | High | History cards tappable with no destination |
| N-3 | `app/(tabs)/profile.tsx:182` | High | Back button adds stack entries instead of going back |
| N-4 | `app/scan/url.tsx` | Low | Stub screen that only redirects — dead route |
| N-5 | `app/scan/preferences.tsx` | Low | Screen is unreachable — no navigation path leads to it |
| N-6 | `app/onboarding.tsx:38` | Critical | Preferences save races with navigation; onboarding redirect loop risk |
| N-7 | `app/(tabs)/profile.tsx:130` | High | Sign-out failure causes redirect loop between sign-in and scan screens |
