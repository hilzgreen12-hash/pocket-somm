# Code Review — 2026-07-19

Reviewed by automated agent. Covers the full source tree as of today's commit.

---

## Bugs and Crashes

### HIGH

**1. Onboarding bypass race condition**
- **File:** `app/index.tsx:20`
- **Severity:** High
- **Detail:** `usePreferences` returns `undefined` (not `null`) while the React Query fetch is still in flight. The routing check is `if (preferences === null)`. Because `undefined !== null`, a freshly signed-in user whose preferences haven't loaded yet falls through to `return <Redirect href="/(tabs)/scan" />` and skips onboarding entirely. The `loading` guard on line 16 only covers auth loading, not preferences loading.
- **Fix:** Add an `isLoading` return value from `usePreferences` and hold the null render until it resolves, or treat both `null` and `undefined` as "no profile yet":
  ```diff
  - if (preferences === null) return <Redirect href="/onboarding" />;
  + if (preferences == null) return <Redirect href="/onboarding" />;
  ```

**2. History cards are non-interactive — onPress missing**
- **File:** `app/(tabs)/history.tsx:64`
- **Severity:** High
- **Detail:** `<TouchableOpacity style={styles.card}>` has no `onPress` prop. Cards appear tappable but do nothing. There is no detail or re-run flow reachable from history.
- **Fix:** Wire up an `onPress` that either navigates to a results detail screen or restores the scan state and pushes to `/scan/results`.

**3. Recommender silently returns grape-duplicate results on retry failure**
- **File:** `src/services/recommender.ts:78-82`
- **Severity:** High
- **Detail:** When `hasDuplicateGrapes` fires and the retry is attempted, the code is:
  ```ts
  if (parsed2.success) return parsed2.data;
  // falls through — returns original duplicate data
  return parsed.data;
  ```
  If the retry response fails Zod validation, `parsed.data` (the original, rule-violating response with duplicate grapes) is silently returned. The hard diversity rule is broken with no signal to the caller or the user.
- **Fix:** Throw on retry parse failure instead of silently falling back:
  ```diff
  + if (!parsed2.success) throw new Error('Could not parse recommendation response.');
  if (parsed2.success) return parsed2.data;
  ```

**4. `router.replace` called during render in ResultsScreen**
- **File:** `app/scan/results.tsx:23-25`
- **Severity:** High
- **Detail:**
  ```ts
  if (!recommendation) {
    router.replace('/(tabs)/scan');
    return null;
  }
  ```
  Calling `router.replace` synchronously during render is not safe in React. It triggers a navigation side-effect during the render phase, which can cause a warning loop and unpredictable behaviour especially on fast re-renders.
- **Fix:** Wrap in `useEffect`:
  ```ts
  useEffect(() => {
    if (!recommendation) router.replace('/(tabs)/scan');
  }, [recommendation]);
  if (!recommendation) return null;
  ```

**5. Missing `Authorization` header — OCR and recommend Edge Function calls will 401**
- **File:** `src/api/claude.ts:8-13`
- **Severity:** High
- **Detail:** `invokeFunction` sends requests with only `'apikey': ANON_KEY` in the headers:
  ```ts
  headers: {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    // no Authorization header
  },
  ```
  Supabase Edge Functions default to `verify_jwt = true`. Without an `Authorization: Bearer <user-jwt>` header, every OCR and recommend call returns HTTP 401. The separate `wine-searcher.ts` correctly uses `supabase.functions.invoke()` which auto-injects the session JWT — but `claude.ts` uses raw `fetch` without it. This means the core OCR and recommend flows are broken for all users unless the functions were deployed with `--no-verify-jwt`.
- **Fix:** Obtain the current session and add the bearer token:
  ```ts
  const { data: { session } } = await supabase.auth.getSession();
  headers: {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${session?.access_token ?? ANON_KEY}`,
  }
  ```

**6. `preFilterWines` uses saved profile budget instead of current scan budget**
- **File:** `app/scan/extracting.tsx:101`
- **Severity:** High
- **Detail:**
  ```ts
  const winesForRecommend = preFilterWines(wines, userProfile);  // uses userProfile.defaultBudget
  const recommendation = await recommendWines({
    ...
    budget: preferences.budget,  // scan-level override
  ```
  If the user set a scan-specific budget override (e.g., profile says £150, they set £300 for this dinner), `preFilterWines` hard-removes all wines priced between £150 and £300 before Claude sees the list. Claude is then instructed the budget is £300 — but those wines are already gone. The correct wines are silently discarded.
- **Fix:** Pass `preferences.budget` (from the scan store) instead of `userProfile` to `preFilterWines`, or merge the budgets taking the more permissive value.

**7. Onboarding save is fire-and-forget — navigation races the Supabase write**
- **File:** `app/onboarding.tsx:37-51`
- **Severity:** High
- **Detail:**
  ```ts
  function handleNext() {
    if (isLast) {
      updatePreferences({ ... });      // mutation.mutate — async, not awaited
      router.replace('/(tabs)/scan'); // fires immediately
    }
  }
  ```
  `mutation.mutate` starts the async upsert but `handleNext` does not await it. Navigation happens before the Supabase write completes. If the write fails (network error, RLS rejection), the user is on the scan tab with no preferences saved and sees no error. The `isSaving` indicator on the button is rendered but becomes immediately irrelevant once navigation fires.
- **Fix:** Switch to `mutation.mutateAsync` and wrap in try/catch:
  ```ts
  async function handleNext() {
    if (isLast) {
      try {
        await updatePreferencesAsync({ ... });
        router.replace('/(tabs)/scan');
      } catch (err) {
        Alert.alert('Failed to save preferences', 'Please try again.');
      }
    }
  }
  ```

**8. Supabase upsert errors are silently swallowed in `usePreferences`**
- **File:** `src/hooks/usePreferences.ts:38`
- **Severity:** High
- **Detail:** The mutation function does:
  ```ts
  await supabase.from('profiles').upsert({ ... });
  ```
  It never destructures `{ error }` from the result, so a Supabase RLS rejection, constraint violation, or network error will silently succeed from React Query's perspective. `onError` is never called, `isSaving` flips back to false, and the user sees no feedback. Profile changes are lost without warning.
- **Fix:**
  ```diff
  - await supabase.from('profiles').upsert({ ... });
  + const { error } = await supabase.from('profiles').upsert({ ... });
  + if (error) throw new Error(error.message);
  ```

---

### MEDIUM

**9. Live Supabase credentials committed to `eas.json`**
- **File:** `eas.json:7-8`
- **Severity:** High
- **Detail:** The `preview` build profile hardcodes the real Supabase project URL and anon key as env vars directly in the committed file:
  ```json
  "EXPO_PUBLIC_SUPABASE_URL": "https://skwfykendnhnhhbdrfbr.supabase.co",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": "sb_publishable_wsa6cGlrAaULP_YA1JwDlQ_h-qaHTke"
  ```
  Supabase anon keys are designed to be client-visible, but committing the actual project URL + key exposes the endpoint to anyone with read access to the repository. Combined with misconfigured RLS, this could allow direct database access. The `.env.example` file also contains these live values rather than placeholders.
- **Fix:** Move secrets to EAS secret environment variables (set via `eas secret:create`) and reference them in `eas.json` using the `env` → secret reference syntax. Replace `.env.example` values with `<your-value-here>` placeholders.

**10. `takePictureAsync` has no error handling**
- **File:** `app/scan/camera.tsx:31`
- **Severity:** Medium
- **Detail:** `handleCapture` is an `async` function but has no `try/catch`. If `cameraRef.current.takePictureAsync()` throws (camera hardware error, permission revoked mid-session, out of storage), it produces an unhandled promise rejection that surfaces as a blank crash with no user-facing message.
- **Fix:** Wrap the body of `handleCapture` in try/catch and show an `Alert` on failure.

**7. `format(new Date(item.captured_at), ...)` crashes on null/invalid date**
- **File:** `app/(tabs)/history.tsx:65`
- **Severity:** Medium
- **Detail:** `item.captured_at` is typed as `string` but `captured_at` could be null or malformed if a session was written without it. `new Date(null)` produces an `Invalid Date` and `date-fns` `format` will throw `RangeError: Invalid time value`, crashing the entire FlatList render.
- **Fix:**
  ```ts
  {item.captured_at ? format(new Date(item.captured_at), 'd MMM yyyy · h:mm a') : '—'}
  ```

**8. Multi-image OCR uses `Promise.all` — one failure kills all results**
- **File:** `app/scan/extracting.tsx:77`
- **Severity:** Medium
- **Detail:**
  ```ts
  const results = await Promise.all(imageUris.map(extractWineList));
  ```
  If any single image fails OCR (network error, model refusal, parse error), `Promise.all` rejects and the entire flow fails. For a 4-screenshot upload, one blurry image discards the other 3's results.
- **Fix:** Use `Promise.allSettled` and filter fulfilled results:
  ```ts
  const settled = await Promise.allSettled(imageUris.map(extractWineList));
  const results = settled
    .filter((r): r is PromiseFulfilledResult<ExtractedWine[]> => r.status === 'fulfilled')
    .map((r) => r.value);
  if (!results.length) throw new Error('All images failed to process.');
  ```

**9. No error boundaries anywhere in the app**
- **Files:** `app/_layout.tsx`, all screen files
- **Severity:** Medium
- **Detail:** There are no React error boundary components. Any uncaught render-phase exception (including in result badge components if AI returns unexpected shapes) will white-screen the entire app with no recovery path. On iOS this is a hard freeze; on Android it may crash to home.
- **Fix:** Wrap the router in a top-level `ErrorBoundary` component with a "Something went wrong — tap to restart" fallback, or use Expo's built-in `<ErrorRecovery>` if available.

**10. Edge functions have no authentication — open to abuse**
- **Files:** `supabase/functions/ocr/index.ts:38`, `supabase/functions/recommend/index.ts:115`, `supabase/functions/wine-searcher-proxy/index.ts:11`
- **Severity:** Medium
- **Detail:** All three edge functions accept requests authenticated only with the anon key, which is embedded in the mobile bundle and is effectively public. Any person who extracts the anon key can call the OCR and recommend functions at will, running up Anthropic API costs. The wine-searcher proxy additionally makes billable API calls with no per-user rate limiting.
- **Fix:** Pass the user's JWT (from `supabase.auth.getSession()`) in the `Authorization` header when calling edge functions, and verify it inside each function with `createClient` using the service role key and `req.headers.get('Authorization')`.

**11. Scan session history query relies solely on RLS with no explicit user filter**
- **File:** `app/(tabs)/history.tsx:17-24`
- **Severity:** Medium
- **Detail:**
  ```ts
  const { data, error } = await supabase
    .from('scan_sessions')
    .select('*')
    .order('captured_at', { ascending: false })
    .limit(50);
  ```
  There is no `.eq('user_id', session.user.id)` clause. Correctness depends entirely on an RLS policy on the `scan_sessions` table. If RLS is misconfigured or disabled (e.g., during a schema migration), this query returns every session from every user. The defence-in-depth fix is to add the explicit filter in the client query regardless of RLS.
- **Fix:** Add `.eq('user_id', session.user.id)` to the query.

---

### LOW

**12. `/scan/url` is a dead stub route**
- **File:** `app/scan/url.tsx`
- **Severity:** Low
- **Detail:** This screen does nothing but redirect back to `/(tabs)/scan`. Any deep link or internal navigation to `/scan/url` silently bounces the user with no message. If a URL-input feature was planned (fetching wine lists from a restaurant website URL), the screen was never implemented.
- **Fix:** Either implement the URL input flow (matching the `url` path supported by the OCR edge function) or remove the file. If keeping it as a placeholder, display a "Coming soon" message rather than a silent redirect.

**13. Sign-in form has no client-side validation**
- **File:** `app/(auth)/sign-in.tsx:12-20`
- **Severity:** Low
- **Detail:** `handleSignIn` fires immediately with whatever is in the fields, including empty strings. The round-trip to Supabase is wasted. No visible error is shown for an empty email — the Supabase error message ("Email not confirmed" or "Invalid login credentials") can be confusing to users who forgot to type.
- **Fix:** Check `email.trim()` and `password.length` before calling `signInWithPassword`, and show inline field errors rather than an `Alert`.

**14. Sign-up shows no password requirements**
- **File:** `app/(auth)/sign-up.tsx:13-21`
- **Severity:** Low
- **Detail:** Supabase's default minimum password length is 6 characters. Users who type shorter passwords see an `Alert` with a cryptic server error after submission. No hint text or inline requirement is shown before they try.
- **Fix:** Add a hint line below the password field: "At least 6 characters." Validate client-side before submit.

**15. Budget currency hardcoded to GBP in recommend prompt**
- **File:** `supabase/functions/recommend/index.ts:139`
- **Severity:** Low
- **Detail:**
  ```ts
  `HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
  ```
  The pound sign is hardcoded. If a wine list is in USD, EUR, or any other currency, the model will compare budget to menu prices in different units and produce nonsense results (e.g., treating a $200 budget as £200 when the list shows USD prices).
- **Fix:** Pass `currency` through from the user's preferences and interpolate it into the prompt. The `ScanPreferences` type already has a `currency` field path via `UserPreferences.defaultCurrency`, but it isn't plumbed through to the recommend call.

**16. Scan tab preferences don't resync after profile edits**
- **File:** `app/(tabs)/scan.tsx:58-66`
- **Severity:** Low
- **Detail:** The `useEffect` syncing saved profile preferences to the scan tab's local state has a `prefsLoaded` guard:
  ```ts
  if (savedPreferences && !prefsLoaded) { ...; setPrefsLoaded(true); }
  ```
  Once `prefsLoaded` is true, profile changes (e.g., the user goes to Profile tab and updates their default budget, then returns to Scan) are ignored. The scan form shows stale values.
- **Fix:** Remove the `prefsLoaded` guard and instead only sync fields the user hasn't manually overridden in the current session, or simply always sync if the user hasn't interacted with a given picker.

---

## Supabase and Edge Function Issues

**17. Supabase client auth storage does not handle SecureStore async errors**
- **File:** `src/api/supabase.ts:8-17`
- **Detail:** The custom storage adapter wraps `SecureStore.getItemAsync`, `setItemAsync`, and `deleteItemAsync` directly. These can throw on older devices or when the secure enclave is unavailable (some Android emulators). The Supabase client does not catch errors from the storage adapter; a `SecureStore` failure will bubble up as an unhandled rejection during session restore, causing the app to hang on the splash screen (since `SplashScreen.hideAsync` is gated on `fontsLoaded`, but auth state loading would still be stuck).
- **Fix:** Wrap each storage call in try/catch and return `null` on failure for `getItem`, swallow errors on `setItem`/`removeItem`.

**18. OCR edge function: media type is hardcoded to `image/jpeg`**
- **File:** `supabase/functions/ocr/index.ts:73`
- **Detail:**
  ```ts
  source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
  ```
  The client's `prepareImage` does compress to JPEG (`SaveFormat.JPEG`), so this is correct today. But the `url` path in the same function fetches arbitrary web pages and doesn't send an image at all — yet if someone passes both `imageBase64` and `url`, the `url` branch takes precedence and never sends an image. If the priority is reversed, the JPEG declaration would be incorrect for PNG screenshots. This is a latent inconsistency risk. No fix required urgently but worth noting if image type flexibility is added.

**19. Wine-Searcher proxy: stale cache is never invalidated on error**
- **File:** `supabase/functions/wine-searcher-proxy/index.ts:25-44`
- **Detail:** If cached data exists but is older than `CACHE_TTL_DAYS`, the proxy attempts a fresh Wine-Searcher call. If that call fails (line 82), it returns a `source: 'unavailable'` response with status 200 — but the stale cache row is not returned either. The user gets no data at all rather than the stale-but-useful cached price. Meanwhile the stale row stays in the DB for the next caller to also miss on.
- **Fix:** On a fresh-fetch failure, return the stale cached data with a `source: 'cache-stale'` flag rather than returning nothing.

**20. `profiles` upsert has no conflict target specified**
- **File:** `src/hooks/usePreferences.ts:38`
- **Detail:** `supabase.from('profiles').upsert({ user_id: ..., ... })` without an explicit `onConflict` column. Supabase infers the conflict column from the table's primary key. If the `profiles` table has a composite primary key or the primary key isn't `user_id`, upsert may insert duplicate rows instead of updating. The query in `usePreferences` reads with `.eq('user_id', ...)` and `.single()` — a duplicate row would then throw `PGRST116 (multiple rows)` and break the entire preferences fetch for that user.
- **Fix:** Add explicit conflict target: `.upsert({ ... }, { onConflict: 'user_id' })`.

---

## UX and Performance Issues

**21. Extracting screen shows duplicate "This could take a minute" copy**
- **File:** `app/scan/extracting.tsx:146-151`
- **Detail:** During the `recommending` stage, the component renders:
  1. `"Scoring by critic rating, vintage quality and value"` (line 148)
  2. `"This may take a minute or two"` (line 151, shown only when `stage === 'recommending'`)
  
  But line 146 also renders `"This could take a minute or two"` unconditionally (it renders for both stages). Two similar "may take a while" messages appear simultaneously during the recommending stage.
- **Fix:** Make line 146 conditional on `stage === 'reading'` or remove it and rely only on the stage-specific text.

**22. No loading state while auth initialises on the index screen**
- **File:** `app/index.tsx:16`
- **Detail:** `if (loading || hasLaunched === null) return null` renders a blank screen while auth and AsyncStorage are initialising. On a slow device or cold start, users see a pure white/dark screen for 1-2 seconds with no indication the app is loading. The splash screen should cover this, but if `SplashScreen.hideAsync` fires before this branch resolves, the blank flash is visible.
- **Fix:** Return an `<ActivityIndicator>` or a branded loading state instead of `null`.

**23. BudgetSlider minimum value is £20 with no way to set "No budget"**
- **File:** `src/components/preferences/BudgetSlider.tsx:6-15`
- **Detail:** `VALUES` starts at 20, meaning users cannot indicate a budget below £20. More significantly, the only way to communicate "no budget preference" is to drag all the way to the rightmost position (`null`). Users who drag slightly left of the end will be set to £1500 — a hard budget cap that would silently filter every premium bottle. The "No limit" option is not prominent.
- **Fix:** This is a UX call, but consider adding a distinct "No budget limit" toggle separate from the slider, rather than encoding it as the slider maximum.

**24. `WineRecommendationCard` is defined but not used in the results flow**
- **File:** `src/components/results/WineRecommendationCard.tsx`
- **Detail:** `app/scan/results.tsx` implements its own inline accordion card rather than importing `WineRecommendationCard`. The component exists but is dead code. It accepts a `pricing` prop (for Wine-Searcher data) and `PricingBadge`, but neither is shown to the user in the actual results screen. The `PricingBadge` and `fetchPricing` service are therefore also unreachable from any active user flow.
- **Fix:** Either wire up `WineRecommendationCard` into `results.tsx` (which would also surface the Wine-Searcher pricing data), or delete the unused component and service.

**25. Tap-to-focus sets state but the value is never passed to `CameraView`**
- **File:** `app/scan/camera.tsx:15,24-27,102-111`
- **Severity:** Low
- **Detail:**
  ```ts
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);
  function handleTap(event) {
    setFocusPoint({ x, y }); // sets state
  }
  // CameraView:
  <CameraView ref={cameraRef} style={...} facing="back" autofocus="on" onTouchEnd={handleTap} />
  // No focusPoint prop passed
  ```
  The tap handler fires and updates state, but `focusPoint` is never used. The camera runs continuous autofocus regardless. Tap-to-focus is silently non-functional.
- **Fix:** Pass the focus point to `CameraView` via `focusCoordinates={{ x: focusPoint.x, y: focusPoint.y }}` (expo-camera v17 API) or whichever prop name the installed version exposes.

**26. `preferences.tsx` calls `recommendWines` with 5 missing required fields**
- **File:** `app/scan/preferences.tsx:28-33`
- **Severity:** Low (screen appears unreachable from current nav flow)
- **Detail:**
  ```ts
  const recommendation = await recommendWines({
    wines: extractedWines,
    styleProfiles,
    budget,
    foodPairing,
    // wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes — all missing
  });
  ```
  `RecommendInput` declares all eight fields as required. The five omitted fields will be `undefined` at runtime, meaning Claude receives no colour preference, no region/grape inclusions or exclusions. This screen is currently not reachable in the main scan flow, but the broken call would silently produce incorrect recommendations if it were ever wired up.

**27. Profile tab has a back arrow that navigates to Scan rather than back**
- **File:** `app/(tabs)/profile.tsx:182`
- **Detail:**
  ```tsx
  <TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
    <Ionicons name="arrow-back" size={24} color={colors.text} />
  </TouchableOpacity>
  ```
  The back arrow in the Profile header always navigates to the Scan tab, not to the previous screen. If the user reached Profile from a settings link within a nested navigator, pressing "back" doesn't actually go back — it pushes a new scan route.
- **Fix:** Use `router.back()` or check if `router.canGoBack()` and conditionally use `back()` or `replace`.

---

## Navigation Issues

**26. `/scan/url` route exists but is entirely unimplemented**
- **File:** `app/scan/url.tsx`
- **Detail:** The file is a single `<Redirect href="/(tabs)/scan" />`. The OCR edge function (`supabase/functions/ocr/index.ts:49-63`) already supports fetching and parsing a URL — the server-side logic exists, but the client has no UI for it. Any in-app deep link or future marketing link to `/scan/url` sends the user silently back to scan with no explanation. This creates a dead-end if users try to share restaurant URLs.

**27. Onboarding has no back-navigation from first step to welcome/sign-in**
- **File:** `app/onboarding.tsx:124-130`
- **Detail:** On step 0, the Back button renders as an empty `<View style={styles.backButton} />`. There is no way for a user who reached onboarding to return to the welcome screen or choose a different auth path (e.g., sign in with an existing account instead of creating one). If they realise mid-onboarding that they already have an account, they are stuck.
- **Fix:** On step 0, render a "Sign In Instead" link or use `router.back()` to return to the previous screen.

**28. Guest users who "Continue without account" on sign-in are redirected to scan, skipping welcome**
- **File:** `app/(auth)/sign-in.tsx:48-50`
- **Detail:**
  ```tsx
  <TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)/scan')}>
    <Text style={styles.guestText}>Continue without account</Text>
  </TouchableOpacity>
  ```
  This button replaces directly to scan without setting `hasLaunched` in AsyncStorage. On next cold start, the user will be shown the welcome screen again (since `hasLaunched` is still not `'true'`). This creates an inconsistent first-launch experience for users who navigate to sign-in and then choose to proceed as a guest.
- **Fix:** Call `AsyncStorage.setItem('hasLaunched', 'true')` before the redirect, matching the behaviour in `welcome.tsx:handleGuest`.

**29. Tabs layout includes no tab bar icons**
- **File:** `app/(tabs)/_layout.tsx`
- **Detail:** The three `<Tabs.Screen>` entries only set `title` — no `tabBarIcon` prop is provided. The tab bar renders text-only tabs without icons, which is visually sparse and inconsistent with standard iOS/Android conventions. The `Ionicons` library is already a dependency and used elsewhere.
- **Fix:** Add `tabBarIcon` to each `Tabs.Screen`:
  ```tsx
  options={{ title: 'Scan', tabBarIcon: ({ color }) => <Ionicons name="camera-outline" size={22} color={color} /> }}
  ```
