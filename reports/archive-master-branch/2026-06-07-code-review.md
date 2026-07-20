# Code Review — 2026-06-07

**Reviewer:** Automated (Claude Code)  
**Scope:** Full codebase — Expo SDK 54 / expo-router / Supabase / Claude API  
**Branch:** main

---

## Bugs and Crashes

### HIGH

#### BUG-01 — Invalid Claude model ID causes all AI calls to fail
**File:** `supabase/functions/ocr/index.ts:57,65` · `supabase/functions/recommend/index.ts:169`  
**Severity:** High

Both edge functions specify `model: 'claude-opus-4-6'`. This is not a valid model identifier. The current valid Anthropic model IDs are `claude-opus-4-8`, `claude-sonnet-4-6`, and `claude-haiku-4-5-20251001`. Sending an unknown model ID will return a 400 from the Anthropic API, surfacing as a 500 from the edge function, which causes the extracting screen to land on the error state for every scan. Every OCR and recommendation call is broken.

Fix: change `'claude-opus-4-6'` to `'claude-opus-4-8'` in both files.

---

#### BUG-02 — No try/catch around camera capture or image manipulation
**File:** `app/scan/camera.tsx:29–98`  
**Severity:** High

`handleCapture()` calls `cameraRef.current.takePictureAsync()` and two calls to `ImageManipulator.manipulateAsync()` with no surrounding try/catch. If the camera hardware fails, the device runs out of memory during manipulation, or the app lacks write permission to the temp directory, an unhandled promise rejection is thrown. React Native will report a red-screen crash in development and a silent hang or crash in production. The user has no recovery path.

Fix: wrap the entire `handleCapture` body in try/catch and call `router.replace('/(tabs)/scan')` (or show an inline error) on failure.

---

#### BUG-03 — Recommend and OCR edge functions have no authentication or rate limiting
**File:** `supabase/functions/recommend/index.ts:115–128` · `supabase/functions/ocr/index.ts:38–50`  
**Severity:** High

Both functions accept any POST request carrying only the public anon key, which is embedded in the client bundle and trivially extractable. There is no auth check, no per-user rate limit, and no IP throttle. Anyone who extracts the anon key and the Supabase URL can send arbitrary wine lists to the recommend function and exhaust the Anthropic API quota in minutes. The OCR function also fetches arbitrary external URLs (see BUG-10), compounding the abuse surface.

Fix: add `Authorization: Bearer <user-jwt>` to `src/api/claude.ts:invokeFunction` using the active Supabase session token, then verify `Authorization` inside each edge function with `supabaseClient.auth.getUser()`. Add a per-user daily request cap in a Supabase table or via Deno KV.

---

#### BUG-04 — History tab reads `recommendation.topPick` — a field that does not exist
**File:** `app/(tabs)/history.tsx:71`  
**Severity:** High

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

The `RecommendationResponse` type (defined in `src/types/wine.ts:50`) has the shape `{ wines: WineRecommendation[], summary: string }`. There is no `topPick` field. This condition is always falsy; the wine name never renders on any history card. The fix is `item.recommendation?.wines?.[0]?.name`.

---

#### BUG-05 — Scan sessions are never persisted; History tab is permanently empty
**File:** `app/scan/results.tsx` (entire file) · `app/(tabs)/history.tsx`  
**Severity:** High

The `scan_sessions` table exists in the database schema (`supabase/migrations/001_initial_schema.sql:15–26`), and the History tab queries it. However, no code anywhere in the app inserts a row into `scan_sessions` after a successful scan. Every user's history is therefore always empty. Users who tap "Start Another Search" after receiving recommendations lose all results permanently.

Fix: after `setRecommendation(recommendation)` succeeds in `app/scan/extracting.tsx:116`, call `supabase.from('scan_sessions').insert(...)` with the user ID, extracted wines, recommendation, and preferences snapshot.

---

### MEDIUM

#### BUG-06 — Race condition skips onboarding for new signed-in users
**File:** `app/index.tsx:19–21`  
**Severity:** Medium

```tsx
const { preferences } = usePreferences();
...
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```

React Query initialises `data` as `undefined` while the query is in flight. The strict equality check `preferences === null` is `false` when `preferences` is `undefined`, so users are immediately redirected to `/(tabs)/scan` before the profile fetch resolves. If the profile row does not exist (new user), they bypass onboarding entirely. The redirect to `/onboarding` only fires if the query completes and returns `null` — but by then the navigation has already happened.

Fix: add a `isPreferencesLoading` guard from `usePreferences` and return `null` (or a spinner) while `session && preferences === undefined`.

---

#### BUG-07 — `router.replace()` called during render phase, not in useEffect
**File:** `app/scan/results.tsx:23–25`  
**Severity:** Medium

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace()` synchronously during a render violates React's constraint against side effects during render. In React 18 concurrent mode this can fire multiple times, produce warnings, and cause unexpected navigation behaviour. The `app/scan/preview.tsx:10–12` handles the equivalent case correctly with `useEffect`.

Fix: move to `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

---

#### BUG-08 — `recommendWines()` called with incomplete args in preferences screen
**File:** `app/scan/preferences.tsx:28–34`  
**Severity:** Medium

```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes all missing
});
```

`RecommendInput` in `src/services/recommender.ts:5–15` declares all those fields as required. TypeScript will emit errors if strict mode is on. At runtime the missing fields reach the edge function as `undefined`, so colour, region, and grape preferences are silently discarded. This screen is not reachable from the main scan flow today, but it will produce incorrect results if it is wired up.

---

#### BUG-09 — Preferences save failures are silently dropped
**File:** `src/hooks/usePreferences.ts:47–49`  
**Severity:** Medium

```tsx
onError: (err) => console.error('[Preferences] Save error:', err),
```

If the Supabase upsert fails (network error, RLS rejection, etc.), the only signal is a console log. The user sees no toast, alert, or visual indicator. They believe their preferences are saved when they are not. This affects every write on the Profile tab and at the end of Onboarding.

Fix: add user-visible feedback in `onError` (e.g. `Alert.alert('Could not save preferences', err.message)`).

---

#### BUG-10 — `recommend` function `max_tokens` too low for full response
**File:** `supabase/functions/recommend/index.ts:171`  
**Severity:** Medium

The recommend function sets `max_tokens: 4096`. A full response for 3 wines each with `rationale`, `vintageAssessment`, `drinkingWindow`, `rarityAssessment`, `fitScore`, `valueScore`, and `outsidePreferences` is typically 2,000–3,500 tokens, but with a 25-wine list in the user message the total can push against 4,096. If the response is truncated mid-JSON, the regex `/{[\s\S]*}/` in the function still matches but `JSON.parse` throws, returning a 500 to the client. The OCR function correctly uses `max_tokens: 8096`.

Fix: raise to `max_tokens: 8096` to match the OCR function.

---

#### BUG-11 — Budget prompt hardcodes `£` regardless of selected currency
**File:** `supabase/functions/recommend/index.ts:139,154`  
**Severity:** Medium

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle...`
`Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```

The currency is always written as `£` in the LLM prompt even though `ExtractedWine.currency` can be any 3-letter code. When a menu lists prices in USD or EUR, the model receives a mixed-currency budget instruction (e.g. "max £100" when menu prices are in USD) and may apply it inconsistently or enforce the budget against the wrong currency.

Fix: pass `currency` from the front-end payload and substitute it into both prompt lines.

---

#### BUG-12 — Profile BudgetSlider overwrites saved budget if user drags before preferences load
**File:** `app/(tabs)/profile.tsx:423–427`  
**Severity:** Medium

```tsx
<BudgetSlider
  value={preferences?.defaultBudget ?? 100}
  onChange={(budget) => updatePreferences({ defaultBudget: budget })}
/>
```

When `preferences` is still undefined (query in-flight), the slider renders at £100. If the user drags the slider before the query resolves, `updatePreferences({ defaultBudget: <new value> })` fires and writes the wrong value to Supabase, overwriting their actual saved preference.

Fix: disable the slider (`pointerEvents="none"` or a loading overlay) until `preferences !== undefined`.

---

#### BUG-13 — TextInput text is invisible on dark background in auth screens
**File:** `app/(auth)/sign-in.tsx:81–86` · `app/(auth)/sign-up.tsx:78–84`  
**Severity:** Medium

Neither TextInput style sets a `color` property. `colors.surface` is `#572F2B` (dark maroon). On both iOS and Android, the default text input color is black (or the OS default), which renders as invisible or near-invisible text on the dark background. There is also no `placeholderTextColor`, so placeholder text uses the OS default. Users see a blank field as they type.

Fix: add `color: colors.text` and `placeholderTextColor: colors.textMuted` to the `input` style in both files.

---

### LOW

#### BUG-14 — `typography.body` used as sole style on `<Text>` does not set text color
**File:** `app/(tabs)/history.tsx:40`  
**Severity:** Low

```tsx
<Text style={typography.body}>Loading history…</Text>
```

`typography.body` (defined in `src/constants/theme.ts:39–42`) only sets `fontSize: 15` and `lineHeight: 22` — no `color`. The loading text renders in the OS default color against the dark `colors.background`, making it invisible. Other screens that use `typography.body` correctly pair it with an explicit `color`.

Fix: `<Text style={[typography.body, { color: colors.text }]}>Loading history…</Text>`.

---

#### BUG-15 — No timeout on the `run()` async pipeline in extracting screen
**File:** `app/scan/extracting.tsx:60–125`  
**Severity:** Low

The OCR + recommend pipeline can take 30–120 seconds with no timeout. If either edge function hangs (Supabase cold start, Anthropic upstream delay), the spinner runs forever. The copy "Please don't leave this page while we're searching" actively instructs users not to navigate away, trapping them. There is no cancel button.

Fix: wrap `Promise.all` and `recommendWines` in `Promise.race([..., new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out after 3 minutes')), 180000))])` and show the error state with a "Try Again" button on timeout.

---

#### BUG-16 — Second retry in `recommendWines` silently returns duplicate-grape response on parse failure
**File:** `src/services/recommender.ts:75–82`  
**Severity:** Low

When the retry response also fails Zod validation, `parsed2.success` is false and the function falls through to `return parsed.data` — the original duplicate-grape result. The caller and user are not informed that the diversity constraint was not met.

---

## Supabase and Edge Function Issues

#### SUP-01 — `pricing_cache` table has no RLS policies
**File:** `supabase/migrations/001_initial_schema.sql:31–42`  
**Severity:** Medium

The `profiles` and `scan_sessions` tables have RLS enabled with appropriate policies. The `pricing_cache` table has neither `enable row level security` nor any `CREATE POLICY` statement. By default in Supabase, tables without RLS enabled are accessible to any client with the anon key. Any user can read, insert, update, or delete pricing cache entries, enabling cache-poisoning attacks where corrupted price data is inserted and served to all users.

Fix: add `alter table pricing_cache enable row level security;` and a policy allowing reads for all authenticated users and writes only from the service role (used inside edge functions).

---

#### SUP-02 — OCR edge function is an open SSRF endpoint
**File:** `supabase/functions/ocr/index.ts:49–55`  
**Severity:** Medium

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

The `url` parameter is accepted from the request body with no validation. An attacker can pass `http://169.254.169.254/latest/meta-data/` (AWS instance metadata), internal Supabase service URLs, or any private IP. The edge function runs inside Supabase's infrastructure and may be able to reach internal services. The HTML is then passed to Claude, which would return whatever it finds.

Fix: validate that `url` is an `https://` URL resolving to a public IP before fetching. Use a DNS-allow list or block RFC-1918 ranges.

---

#### SUP-03 — Drinking window assessment uses model training cutoff, not actual date
**File:** `supabase/functions/recommend/index.ts:SYSTEM_PROMPT:39`  
**Severity:** Medium

The system prompt instructs the model to assess "whether the wine is currently within its optimal drinking window as of today's date." The model has no access to the current date and uses its training cutoff (early 2025 or earlier) as a proxy for "now." A 2023 Bordeaux that the model's training data considers "too young" may actually be entering its window by 2026. All drinking window assessments are potentially 1–2 years stale.

Fix: inject the actual ISO date into the user message: `Today's date: ${new Date().toISOString().slice(0, 10)}. Assess drinking windows relative to this date.`

---

#### SUP-04 — Edge functions return 500 with plain-text body on JSON parse failure
**File:** `supabase/functions/recommend/index.ts:193–195`  
**Severity:** Low

The OCR error response correctly includes `headers: { 'Content-Type': 'application/json' }` (line 97). The recommend function's error response at line 194 does not. The client in `src/api/claude.ts:16` reads the response as text and throws, so this does not cause a crash — but downstream consumers (e.g. future web clients) that try to parse the error body as JSON will fail.

Fix: add `headers: { 'Content-Type': 'application/json' }` to the 500 response in `recommend/index.ts:194`.

---

#### SUP-05 — No CORS handling in either edge function
**File:** `supabase/functions/ocr/index.ts:38` · `supabase/functions/recommend/index.ts:115`  
**Severity:** Low

Neither function handles `OPTIONS` preflight requests or sets `Access-Control-Allow-Origin` headers. This is harmless for the current React Native client but would block any web-based testing tool, admin dashboard, or future web port from calling these functions directly.

Fix: add standard CORS preflight handling at the top of each `Deno.serve` handler.

---

## UX and Performance Issues

#### UX-01 — History cards are tappable but have no action
**File:** `app/(tabs)/history.tsx:64`  
**Severity:** High

```tsx
<TouchableOpacity style={styles.card}>
```

Every history card is a `TouchableOpacity` with no `onPress` prop. Tapping produces a visual press state (opacity flash) but does nothing — no navigation, no expansion, no detail view. Users expect tapping a past scan to show the full recommendation. This is a broken affordance.

Fix: either convert to `<View>` if no detail screen exists yet, or implement navigation to a `/scan/history-detail` screen that re-displays the stored recommendation JSON.

---

#### UX-02 — Camera screen has no back button
**File:** `app/scan/camera.tsx` · `src/components/scan/CameraOverlay.tsx`  
**Severity:** Medium

The camera screen (`/scan/camera`) has no back button. The `CameraOverlay` component renders a frame guide and a capture button only. The only way to exit camera mode is to take a photo. If the user opened the camera accidentally or changed their mind, they must capture an unwanted photo and then tap "Retake" on the preview screen — two unnecessary steps.

Fix: add a back/close icon button to `CameraOverlay` that calls `router.back()`.

---

#### UX-03 — Screenshot picker errors are silently ignored
**File:** `app/(tabs)/scan.tsx:86–102`  
**Severity:** Medium

`handleScreenshot()` is `async` with no try/catch. If `ImagePicker.launchImageLibraryAsync()` throws (e.g., permissions revoked mid-session or picker crashes on certain Android OEM skins), the error is unhandled. No user-visible feedback appears. The function simply returns silently as though the user cancelled.

Fix: wrap the function body in try/catch and show `Alert.alert` on error.

---

#### UX-04 — No app-level error boundary
**File:** `app/_layout.tsx`  
**Severity:** Medium

There is no React error boundary wrapping the application. Any unhandled render-phase error (thrown component, missing font, unexpected null in JSX) will produce a red-screen crash in development and a blank white screen in production with no recovery mechanism. Users cannot navigate away or retry.

Fix: wrap the `Stack` and `AuthProvider` in a custom `ErrorBoundary` component that renders a "Something went wrong — restart the app" screen.

---

#### UX-05 — Onboarding `handleNext` does not await save before navigating
**File:** `app/onboarding.tsx:36–51`  
**Severity:** Medium

```tsx
function handleNext() {
  if (isLast) {
    updatePreferences({ ... });   // fires mutation, does not await
    router.replace('/(tabs)/scan');
  }
  ...
}
```

`updatePreferences` is `mutation.mutate` from React Query — it is not async and the navigation happens immediately. If the network is slow, the user lands on the Scan tab before the profile row exists in Supabase. The next time they open the app, `preferences` resolves as `null` and they are sent back to onboarding again (once BUG-06 is fixed).

Fix: use `mutation.mutateAsync` and `await` it, keeping the `ActivityIndicator` visible until the save completes. Handle the error case with an `Alert`.

---

#### UX-06 — `preFilterWines` uses profile budget, not session budget
**File:** `app/scan/extracting.tsx:37–39`  
**Severity:** Low

```tsx
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
}
```

The pre-filter for wines sent to the recommender uses `userProfile.defaultBudget` (the saved profile), not `preferences.budget` (the session-specific budget set on the Scan tab). If a user has a saved budget of £100 but sets a one-time budget of £60 before a scan, wines up to £100 pass the pre-filter and are included in the payload to Claude. Claude will correctly exclude them via the budget hard rule, but the wine list is larger than necessary, consuming extra tokens and increasing latency.

Fix: use `preferences.budget ?? userProfile?.defaultBudget` in `preFilterWines`.

---

#### UX-07 — `scan/preferences.tsx` is an orphaned legacy screen
**File:** `app/scan/preferences.tsx`  
**Severity:** Low

The route `/scan/preferences` exists and compiles but is not linked from any other screen. The main scan flow goes `scan → camera/preview → extracting → results`. This screen appears to be a remnant of an earlier flow design. It will appear in deep-link explorers and confuse future contributors.

Fix: delete the file or add a clear `// UNUSED — retained for reference` comment and a `@ts-nocheck` at the top until it is repurposed.

---

## Navigation Issues

#### NAV-01 — History tab dead-ends with no escape for signed-out users after sign-in redirect
**File:** `app/(tabs)/history.tsx:30–37`  
**Severity:** Medium

The History tab shows a "Sign In" button that calls `router.push('/(auth)/sign-in')`. After signing in, `sign-in.tsx:19` calls `router.replace('/(tabs)/scan')`. This is correct. However, if the user dismisses sign-in (Android back button or swipe-to-dismiss), they are returned to the history tab's guest state with no indication of what happened. The "Sign In" button remains, but no error is shown. This is a minor dead-end but creates a confusing loop.

---

#### NAV-02 — `scan/url.tsx` is a registered route that silently redirects
**File:** `app/scan/url.tsx`  
**Severity:** Low

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The route `/scan/url` exists but immediately redirects to the scan tab with no user feedback. If this screen is ever deep-linked (e.g., from a marketing link or a future "Scan URL" feature), the user is silently dropped on the Scan tab without understanding why the URL-based scan didn't work.

Fix: remove the file entirely, or replace with a placeholder screen explaining the feature is coming.

---

#### NAV-03 — Back navigation from sign-up to sign-in uses `<Link>` not `router.back()`
**File:** `app/(auth)/sign-up.tsx:50–52`  
**Severity:** Low

```tsx
<Link href="/(auth)/sign-in" style={styles.link}>
  Already have an account? Sign in
</Link>
```

This pushes a new sign-in screen onto the stack rather than popping the sign-up screen. If the user goes welcome → sign-up → sign-in via this link, the stack is three screens deep. Pressing Android back from sign-in returns to sign-up, not welcome. The correct navigation is `router.back()` or `<Link href="/(auth)/sign-in" replace>`.

---

#### NAV-04 — Scan tab preferences state survives `reset()` across sessions
**File:** `app/scan/extracting.tsx:117` · `app/(tabs)/scan.tsx:58–66`  
**Severity:** Low

`reset()` on the scan store clears `imageUri`, `extractedWines`, `recommendation`, and `error` — but the local component state in `scan.tsx` (`wineTypes`, `styleProfiles`, `budget`, `foodPairing`) is not reset. Since the Scan tab is a persistent tab screen (not unmounted on navigate), the `prefsLoaded` guard (`useState(false)`) prevents the profile sync effect from re-running after the first load. If the user changes preferences for one scan, those changes persist as defaults for the next scan — even if different from their saved profile.

This is arguably intentional behaviour (remember session choices), but it is not communicated to the user and conflicts with the profile defaults. If it is intentional, add a "Reset to defaults" button. If unintentional, call `setPrefsLoaded(false)` in the scan store's `reset()` call — though that requires refactoring the guard into the store.
