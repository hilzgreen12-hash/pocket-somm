# Code Review — 2026-05-06

Reviewed by: automated code review agent  
Scope: full codebase — Expo SDK 54, expo-router, Supabase, Claude API

Previous review: 2026-05-05. **None of the findings from yesterday's report have been fixed.** All 15 bugs, 5 Supabase/edge-function issues, 6 UX issues, and 4 navigation issues from that report remain in the codebase. This report does not repeat them in full; it references them by their original numbers and adds new findings discovered today.

---

## Bugs and Crashes

### HIGH — New findings

**B-16. `src/api/supabase.ts:17` + missing `app/auth/callback.tsx` — email verification and email-change confirmation are silently broken**

Severity: **High**

```ts
detectSessionInUrl: false,
```

The Supabase client is correctly configured with `detectSessionInUrl: false` for React Native. However, this means the app must handle the resulting deep link manually by calling `supabase.auth.exchangeCodeForSession()` with the code parameter from the URL. No deep-link handler exists anywhere in the app. When a new user taps the confirmation link in their sign-up email, or when an existing user taps either link in an email-change confirmation, the app opens but the URL parameters are never processed. The session is never established. Users cannot confirm their email address; the sign-up confirmation link does nothing. `app/(tabs)/profile.tsx:113` calls `Linking.createURL('auth/callback')` as the `emailRedirectTo` value, but the path `auth/callback` does not exist as an expo-router route — there is no `app/auth/callback.tsx` file.

Fix: create `app/auth/callback.tsx`, read the `code` query parameter via `useLocalSearchParams`, and call `supabase.auth.exchangeCodeForSession(code)` inside a `useEffect`.

---

**B-17. `src/api/claude.ts:9–12` — raw `fetch` omits `Authorization` header; edge functions can never receive a user's JWT**

Severity: **High**

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
},
```

The `invokeFunction` helper calls Supabase edge functions using raw `fetch` with only the anon key. It never sends `Authorization: Bearer {jwt}`. By contrast, `src/api/wine-searcher.ts` correctly uses `supabase.functions.invoke()`, which automatically attaches the current user's JWT. The OCR and recommend functions therefore always appear as anonymous callers. Even if authentication checks were added to those edge functions (as recommended in the previous review, issue S-4), they would reject every call because no JWT is present. Using `supabase.functions.invoke()` in `src/api/claude.ts` would fix both this issue and S-4 simultaneously.

---

### MEDIUM — New findings

**B-18. `app/(tabs)/profile.tsx:113` — `Linking.createURL('auth/callback')` generates a URL with no matching route**

Severity: **Medium**

```tsx
const redirectTo = Linking.createURL('auth/callback');
const { error } = await supabase.auth.updateUser(
  { email: newEmail.trim() },
  { emailRedirectTo: redirectTo },
);
```

`Linking.createURL('auth/callback')` produces something like `exp://192.168.x.x:8081/auth/callback` in development or the production universal link equivalent. expo-router will attempt to route this path, but there is no `app/auth/callback.tsx` route. The user will either land on the root index screen or receive a 404. Because `detectSessionInUrl: false` is also set, the URL params will not be parsed even if the app opens. This means the "Check both inboxes" alert is shown to the user but neither confirmation link actually completes the email change.

---

**B-19. `app/onboarding.tsx:38–47` — preferences are not saved before navigation; `mutate` fires and returns immediately**

Severity: **Medium**

```tsx
function handleNext() {
  if (isLast) {
    updatePreferences({ ... });
    router.replace('/(tabs)/scan');  // fires before save completes
  }
```

`updatePreferences` is `mutation.mutate` (`src/hooks/usePreferences.ts:56`), not `mutation.mutateAsync`. `mutate` dispatches the async work and returns immediately. `router.replace('/(tabs)/scan')` therefore fires before the Supabase upsert completes. If the user backgrounds the app or the network is slow, the upsert may never complete. The user arrives at the scan tab believing their preferences are saved. Combined with the silent upsert error issue from the previous report (B-7), a failure here produces no feedback whatsoever.

Fix: use `mutateAsync` with a `try/catch` and only call `router.replace` after the upsert resolves.

---

**B-20. `app/(tabs)/profile.tsx:131–133` — `supabase.auth.signOut()` error is silently ignored**

Severity: **Medium**

```tsx
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

The return value of `signOut()` is discarded. If the call fails (network error, invalid JWT), the error is swallowed and the user is navigated to the sign-in screen regardless. The Supabase session may still be active in secure storage. The next app launch will restore it via `getSession()`, leaving the user apparently signed in again despite having just signed out. Add `const { error } = await supabase.auth.signOut(); if (error) { Alert.alert('Sign out failed', error.message); return; }`.

---

### LOW — New findings

**B-21. `app/(tabs)/profile.tsx:88–93` — custom disliked-region entry has no max-5 cap despite UI label saying "(select up to 5)"**

Severity: **Low**

```tsx
function handleAddCustomDislikedRegion() {
  const trimmed = customDislikedRegion.trim();
  const current = preferences?.dislikedRegions ?? [];
  if (!trimmed || current.includes(trimmed)) return;  // no length check
  updatePreferences({ dislikedRegions: [...current, trimmed] });
```

`handleAddCustomRegion` (line 73) and `handleAddCustomGrape` (line 81) both guard against adding more than 5 items. `handleAddCustomDislikedRegion` (line 88) and `handleAddCustomDislikedGrape` (line 96) do not. The section header in the profile UI reads "Regional Dislikes (select up to 5)" but the custom-input path bypasses this limit. The same omission applies to the disliked-grape custom input.

---

**B-22. `supabase/functions/recommend/index.ts:139` — budget prompt hardcodes `£` regardless of user currency**

Severity: **Low**

```ts
const budgetLine = budget
  ? `HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle...`
  : '';
```

The `£` symbol is hardcoded in the prompt that is sent to Claude. If a user's wine list is denominated in EUR, USD, or any other currency, the model is told the budget is in pounds regardless. The `currency` field exists on `ExtractedWine` and `WineRecommendation` but is never used in the budget constraint. A non-UK user's budget rule would be applied to the wrong currency.

---

**B-23. `src/types/preferences.ts:7` — `defaultCurrency` field in `UserPreferences` is never fetched or stored**

Severity: **Low**

```ts
export interface UserPreferences {
  ...
  defaultCurrency: string;
  ...
}
```

The `defaultCurrency` field exists in the type definition but:
- The Supabase `profiles` table (across all three migrations) has no `default_currency` column.
- `src/hooks/usePreferences.ts` does not select or map this field.
- No UI allows the user to set it.

The field is dead. It is never populated at runtime, meaning any code that reads `preferences.defaultCurrency` will get `undefined`. The `as UserPreferences` cast at `usePreferences.ts:31` suppresses the TypeScript error.

---

### Previously reported — still unresolved

The following bugs from the 2026-05-05 review remain in the code without any change:

| ID | File | Description | Severity |
|----|------|-------------|----------|
| B-1 | `app/scan/results.tsx:23` | `router.replace` called in render body, not in `useEffect` | High |
| B-2 | `app/(tabs)/history.tsx` | `scan_sessions` table never written to; history is permanently empty | High |
| B-3 | `app/(tabs)/history.tsx:64` | History `TouchableOpacity` cards have no `onPress` | High |
| B-4 | `app/scan/url.tsx:1` | URL scan route is a redirect stub; OCR URL path is dead code | High |
| B-5 | `app/scan/camera.tsx:32` | `takePictureAsync` and `manipulateAsync` have no error handling | Medium |
| B-6 | `app/(tabs)/scan.tsx:86` | `handleScreenshot` has no try/catch and upload button is never disabled | Medium |
| B-7 | `src/hooks/usePreferences.ts:38` | Supabase `upsert` error not destructured; preference saves fail silently | Medium |
| B-8 | `app/index.tsx:20` | Supabase error on startup redirects onboarded users to onboarding | Medium |
| B-9 | `supabase/functions/ocr/index.ts:84` and `recommend/index.ts:181` | `response.content[0]` accessed without bounds check | Medium |
| B-10 | `app/(tabs)/history.tsx:13` | `isError` not checked; Supabase failure shows "No scans yet" | Medium |
| B-11 | `app/scan/preferences.tsx:28` | `recommendWines` called with 5 missing required fields; TypeScript error | Medium |
| B-12 | `src/api/claude.ts:17` | `JSON.parse` throws with no useful context on HTML error responses | Medium |
| B-13 | `app/_layout.tsx:28` | App renders blank screen indefinitely if font loading fails | Low |
| B-14 | `app/(auth)/sign-in.tsx:12` | No client-side validation before Supabase auth call | Low |
| B-15 | `app/(auth)/sign-up.tsx:12` | No client-side password length validation | Low |

---

## Supabase and Edge Function Issues

### New findings

**S-6. `supabase/functions/wine-searcher-proxy/index.ts` — no authentication check; any holder of the anon key can query the Wine-Searcher proxy**

Severity: **High**

The wine-searcher-proxy function, like the OCR and recommend functions, performs no JWT validation. It is callable by anyone with the anon key, which is embedded in the mobile bundle as `EXPO_PUBLIC_SUPABASE_ANON_KEY`. An attacker can call this function to exhaust Wine-Searcher API quota and trigger costs without any legitimate user session. This is the same class of issue as S-4 from the previous report.

---

### Previously reported — still unresolved

| ID | File | Description |
|----|------|-------------|
| S-1 | `supabase/migrations/001_initial_schema.sql:36` | `pricing_cache` table has no RLS; all cached pricing data is publicly readable |
| S-2 | `supabase/functions/ocr/index.ts:50` | SSRF: arbitrary client-supplied URLs fetched server-side without validation |
| S-3 | `supabase/functions/wine-searcher-proxy/index.ts:48` | Wine-Searcher API key passed in URL query string; appears in logs |
| S-4 | `supabase/functions/ocr/index.ts` and `recommend/index.ts` | No authentication check; functions callable by any holder of the anon key |
| S-5 | `src/hooks/usePreferences.ts:38` | Upsert error not surfaced (cross-referenced from B-7) |

---

## UX and Performance Issues

### New findings

**U-7. `app/(auth)/sign-up.tsx` — successful sign-up redirects to sign-in but `hasLaunched` is never set; guest user who creates an account gets stuck in onboarding on next launch**

Severity: **Medium**

`app/welcome.tsx:8` sets `AsyncStorage.setItem('hasLaunched', 'true')` when a user chooses "Start Scanning" as a guest. But if a first-time visitor taps "Create Account" directly on the welcome screen (`welcome.tsx:26`) and successfully signs up, `hasLaunched` is never set. On subsequent launches, `app/index.tsx:13` reads `hasLaunched` as `false`, and since the user now has a session, the index logic redirects to `/onboarding` (if preferences are null) or `/(tabs)/scan`. This is arguably correct, but the guest path that later creates an account will also never set `hasLaunched`, leaving the welcome screen potentially reachable on the next cold launch after sign-out if the `session` is null and `hasLaunched` is still false.

---

**U-8. `app/scan/extracting.tsx:155–159` — "Please don't leave this page" instruction is unenforceable and creates anxiety**

Severity: **Low**

```tsx
<Text style={styles.stayNote}>Please don't leave this page while we're searching</Text>
```

The extraction runs as a plain `async` function inside a `useEffect`. If the user navigates away, the `token.active = false` cancellation mechanism prevents store updates and navigation, but the Claude API calls and image processing continue running in the background, consuming network and compute resources. The "please don't leave" warning is correct but creates unnecessary anxiety — alternatively, the extraction could be made resilient to navigation by continuing in the background and notifying when done. As written, it is also missing a cleanup for the case where the app is backgrounded by the OS on low-memory devices (the active token check helps but doesn't stop the underlying API calls).

---

**U-9. `app/(tabs)/profile.tsx` — "Change your subscription email account" label is misleading**

Severity: **Low**

```tsx
<Text style={styles.emailLabel}>Change your subscription email account</Text>
```

The tappable label at profile.tsx line 153 says "Change your subscription email account." The app has no subscription or paid tier visible in the codebase. This copy implies a billing context that doesn't exist. "Change email address" would be accurate.

---

### Previously reported — still unresolved

| ID | File | Description |
|----|------|-------------|
| U-1 | `app/scan/extracting.tsx:145` | Duplicate "may take a minute or two" text during recommending stage |
| U-2 | `src/components/preferences/ChipPicker.tsx:18` | `?? []` prop creates new array reference each render, causing spurious `useEffect` firing |
| U-3 | `app/(tabs)/scan.tsx:159` | Upload button has no loading/disabled state |
| U-4 | `app/(tabs)/profile.tsx` | Preference form renders with empty values while Supabase fetch is in-flight; no skeleton |
| U-5 | `app/scan/results.tsx` | No back button; "Start Another Search" destroys scan state with no confirmation |
| U-6 | `app/(tabs)/scan.tsx:58` | Double-initialization of preference state causes a redundant re-render on warm-cache mount |

---

## Navigation Issues

### New findings

**N-5. `app/(auth)/sign-in.tsx:19` and `app/(auth)/sign-up.tsx:20` — sign-in and sign-up both bypass `app/index.tsx` routing logic**

Severity: **Medium**

```tsx
// sign-in.tsx:19
router.replace('/(tabs)/scan');

// sign-up.tsx:19–21 (after alert OK)
{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') },
```

`app/index.tsx` contains all the routing logic for deciding whether a user should see onboarding, the scan tab, or the welcome screen. Both auth screens skip it by calling `router.replace('/(tabs)/scan')` directly on sign-in. A newly signed-in user who has never completed onboarding will land directly on the scan tab without being asked for their preferences. The index.tsx onboarding guard (`if (preferences === null) return <Redirect href="/onboarding" />`) is only exercised on cold launch, not when the user signs in mid-session.

---

### Previously reported — still unresolved

| ID | File | Description |
|----|------|-------------|
| N-1 | `app/scan/url.tsx:1` | URL route immediately redirects; URL OCR feature is entirely unreachable |
| N-2 | `app/scan/preferences.tsx` | Screen is orphaned; no navigation path leads to `/scan/preferences` |
| N-3 | `app/(tabs)/history.tsx:64` | History cards have a pressed state but no `onPress`; navigation dead-end |
| N-4 | `app/index.tsx:20` | Supabase query error on startup sends onboarded users back to onboarding |
