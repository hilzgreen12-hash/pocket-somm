# Automated Code Review — 2026-05-08

> All issues from the 2026-05-07 review remain unresolved. This report repeats those findings for traceability and adds new findings discovered in today's pass.

---

## Bugs and Crashes

### HIGH — `app/scan/results.tsx:22–24` — `router.replace` called during render *(unresolved from 2026-05-07)*

`router.replace('/(tabs)/scan')` is called synchronously in the component body when `recommendation` is null, not inside a `useEffect`. Calling navigation APIs during the React render phase is illegal and can trigger a crash loop if the store is partially reset. Fix: wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

**Severity: High**

---

### HIGH — `app/_layout.tsx:14–39` — No error boundary wrapping the app *(unresolved from 2026-05-07)*

The root layout renders `<AuthProvider>`, `<QueryClientProvider>`, and `<Stack>` with no React error boundary. Any unhandled render exception (null-dereference in a component, malformed Claude response that slips through Zod, missing font) will crash the entire app to a blank screen. A top-level `ErrorBoundary` should catch render errors and show a recovery screen.

**Severity: High**

---

### HIGH — `src/api/claude.ts:7–18` — Edge functions invoked without the user's JWT *(unresolved from 2026-05-07)*

`invokeFunction` sends only `'apikey': ANON_KEY`. The anon key is public by design (`EXPO_PUBLIC_` prefix). Any party who extracts it can call `/functions/v1/ocr` and `/functions/v1/recommend` unlimited times with no authentication, incurring unbounded Anthropic API costs. Fix: read the session from `supabase.auth.getSession()` and add `'Authorization': \`Bearer ${session.access_token}\`` to the request headers. Reject unauthenticated calls in each edge function with a 401.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:49–54` — SSRF via `url` parameter *(unresolved from 2026-05-07)*

The OCR function fetches an arbitrary caller-supplied URL server-side with no domain allow-list or RFC-1918 address rejection:

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

An attacker can supply `http://169.254.169.254/latest/meta-data/` or other internal Deno Deploy / Supabase URLs. Because the endpoint requires only the public anon key (see previous finding), this is exploitable by anyone.

**Severity: High**

---

### MEDIUM — `app/index.tsx:9,19–20` — New signed-in users bypass onboarding *(unresolved from 2026-05-07)*

`usePreferences` does not expose `isLoading`. While React Query is fetching, `preferences` is `undefined` (not `null`). The guard `if (preferences === null)` on line 20 evaluates to false and the user is redirected to `/(tabs)/scan` instead of `/onboarding`. New users with no profile row never see the onboarding flow unless the network is too slow for auth to settle first. Fix: expose `isLoading` from `usePreferences` and gate the index component on it.

**Severity: Medium**

---

### MEDIUM — `app/index.tsx:12–13` — `AsyncStorage.getItem` rejects silently; app stuck on blank screen *(unresolved from 2026-05-07)*

```ts
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```

No `.catch()`. If `AsyncStorage` throws (encrypted storage locked, corrupted storage), the rejection is silent, `hasLaunched` stays `null` forever, and line 16 returns `null` indefinitely — an unrecoverable blank screen. Fix: `.catch(() => setHasLaunched(false))`.

**Severity: Medium**

---

### MEDIUM — `app/scan/camera.tsx:29–98` — `handleCapture` has no try/catch *(unresolved from 2026-05-07)*

`takePictureAsync` and two `ImageManipulator.manipulateAsync` calls are all unawaited inside an async function with no try/catch. Storage-full errors, hardware failures, and NaN crop dimensions produce unhandled promise rejections that can terminate the JS thread on modern React Native. Fix: wrap the body in try/catch and show an `Alert` on failure.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/scan.tsx:86–102` — `handleScreenshot` has no try/catch *(unresolved from 2026-05-07)*

`ImagePicker.launchImageLibraryAsync` can throw on certain Android versions. The rejection is unhandled; the action fails silently with no user feedback. Fix: wrap in try/catch and show an `Alert`.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/history.tsx:12–25` — Query error state silently discarded *(unresolved from 2026-05-07)*

Only `{ data: sessions, isLoading }` is destructured from `useQuery`. When the Supabase query fails, `isLoading` becomes false, `sessions` is `undefined`, and the "No scans yet" empty state renders — users with real history see an empty list with no error message. Fix: also destructure `error` and render a visible error state.

**Severity: Medium**

---

### MEDIUM — `src/hooks/usePreferences.ts:38` — Supabase upsert error silently discarded *(unresolved from 2026-05-07)*

```ts
await supabase.from('profiles').upsert({...});
```

`supabase-js` returns `{ data, error }` — it does not throw. The error is not destructured or checked. If the upsert fails (RLS violation, network error, schema mismatch), `mutationFn` returns `undefined` successfully, `onSuccess` fires, `queryClient.invalidateQueries` runs, and the `onError` handler on line 50 is never invoked. The user's preference change is silently lost. Fix: destructure the error and throw it so `onError` can display a user-visible alert.

**Severity: Medium**

---

### MEDIUM *(NEW)* — `app/scan/camera.tsx:15,109` — Tap-to-focus is silently broken

`focusPoint` state is set on tap at line 109:

```ts
const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);
...
function handleTap(event: ...) {
  setFocusPoint({ x, y });
}
```

But `focusPoint` is never passed to `<CameraView>` — there is no `focusPoint` or equivalent prop on the rendered `CameraView` (line 103–110). The user taps the camera preview expecting to set focus, but nothing happens. `autofocus="on"` provides automatic focus but not the tap-controlled focus the gesture implies. Either wire `focusPoint` to the camera API or remove the `handleTap` handler and `focusPoint` state entirely.

**Severity: Medium**

---

### MEDIUM *(NEW)* — `app/(tabs)/scan.tsx:59–66` — Profile preference updates never re-sync to the scan tab

The `useEffect` that copies `savedPreferences` into local state is guarded by `prefsLoaded`:

```ts
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    setWineTypes(savedPreferences.wineTypes ?? []);
    ...
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```

Once `prefsLoaded` is `true`, the effect never runs again even if the user updates their profile in the Profile tab and React Query invalidates the `preferences` query. From the scan tab's perspective, preferences are permanently frozen at their first-load values for the lifetime of the session. Fix: remove the `prefsLoaded` guard and use the React Query data directly to initialise state, or accept `savedPreferences` as a dependency and re-sync unconditionally.

**Severity: Medium**

---

### LOW — `app/onboarding.tsx:36–51` — Navigation fires before preferences save completes *(unresolved from 2026-05-07)*

`updatePreferences({...})` is fire-and-forget (`mutation.mutate`, not `mutateAsync`). `router.replace('/(tabs)/scan')` fires on the next line without waiting. If the save fails, the user lands on the scan screen with no indication their onboarding choices were not persisted.

**Severity: Low**

---

### LOW — `app/(tabs)/profile.tsx:130–133` — Sign-out error not handled; navigation proceeds unconditionally *(unresolved from 2026-05-07)*

```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

If `signOut` returns an error, the app navigates to sign-in while the Supabase session remains active. Fix: check `const { error } = await supabase.auth.signOut()` and show an `Alert` before navigating.

**Severity: Low**

---

### LOW *(NEW)* — `src/types/preferences.ts:7` / `src/hooks/usePreferences.ts:28` — `defaultBudget` typed as `number` but can be `null` at runtime

`UserPreferences` declares `defaultBudget: number` (non-nullable). However, `usePreferences` maps the DB column as `data.default_budget ?? null`, returning `null` when no budget is set. Downstream code at `app/scan/extracting.tsx:37` checks `if (prefs.defaultBudget)` and the profile tab's `BudgetSlider onChange` may call `updatePreferences({ defaultBudget: null })` when the slider is at "No limit". TypeScript treats `null` as a type error here, but the mismatch will silently pass at runtime. Fix: change the type to `defaultBudget: number | null` and audit all uses.

**Severity: Low**

---

### LOW *(NEW)* — `src/services/recommender.ts:75–82` — Strict-diversity retry silently falls through on second Zod failure

If the initial response contains duplicate grapes, a second call is made with `_strictDiversity: true`. If `parsed2.success` is false (second response also fails Zod), the `if (parsed2.success)` branch is skipped and execution falls through to `return parsed.data` — returning the original duplicate-grape result without any log entry or user-facing indication that the retry also failed.

```ts
const parsed2 = RecommendationResponseSchema.safeParse(raw2);
if (parsed2.success) return parsed2.data;
// silent fall-through
```

Fix: add `console.warn` when `parsed2.success` is false so failures are observable in edge function logs.

**Severity: Low**

---

## Supabase and Edge Function Issues

### HIGH — `supabase/functions/ocr/index.ts` and `recommend/index.ts` — No authentication or rate-limiting *(unresolved from 2026-05-07)*

Neither function checks the `Authorization` header or verifies a valid Supabase session. The public anon key is the only credential required. Any external party can drive unlimited OCR and recommendation requests, generating uncapped Anthropic API costs. Fix: verify the Bearer JWT via `supabase.auth.getUser(jwt)` at the top of each function and return 401 for unauthenticated requests. Add a per-user rate-limit counter in Supabase.

**Severity: High**

---

### MEDIUM — `supabase/migrations/001_initial_schema.sql:31–44` — `pricing_cache` table has no RLS *(unresolved from 2026-05-07)*

`profiles` and `scan_sessions` have RLS enabled. `pricing_cache` does not. Any permissive future policy or misconfiguration would expose the full pricing cache to unauthenticated reads. Fix: add `alter table pricing_cache enable row level security;` and restrict access to the service role only (no policies = anon/authenticated roles cannot read/write).

**Severity: Medium**

---

### MEDIUM — `supabase/functions/recommend/index.ts:169` — `max_tokens: 4096` may truncate responses for large wine lists *(unresolved from 2026-05-07)*

The OCR function uses `max_tokens: 8096`. The recommend function uses 4096. With 25 wines and the full nested JSON output (three wines, each with `vintageAssessment`, `drinkingWindow`, `rarityAssessment`, `rationale`), output can approach 3,500–4,000 tokens. A large or verbose wine list can produce a truncated mid-JSON response, causing `JSON.parse` on line 186 to throw a 500. Fix: raise to `max_tokens: 8096`.

**Severity: Medium**

---

### MEDIUM — `supabase/functions/recommend/index.ts` *(NEW)* — Current date never injected into prompt; drinking window assessments degrade over time

The system prompt instructs Claude to assess drinking windows "as of today's date" (line 38: "Assess whether the wine is currently within its optimal drinking window as of today's date"). However, no date is injected into the prompt or the user message. Claude infers the current year from training data. As time passes, the gap between Claude's knowledge cutoff and the actual date grows, making drinking window statuses ("Too Young", "Peak", "Fading") progressively less accurate.

Fix: inject the server-side date into the user message:

```ts
const today = new Date().toISOString().slice(0, 10); // "2026-05-08"
// Add to userContext:
`- Today's date: ${today} (use this for drinking window calculations)`
```

**Severity: Medium**

---

### MEDIUM — Scan results are never written to `scan_sessions`; History tab permanently empty *(unresolved from 2026-05-07)*

No code in the application performs an INSERT into `scan_sessions`. After `recommendWines` resolves in `app/scan/extracting.tsx:116`, `setRecommendation` is called and the user navigates to results, but no Supabase write occurs. The History tab always shows "No scans yet" for every user regardless of how many scans they have performed.

**Severity: Medium**

---

### LOW — `supabase/functions/wine-searcher-proxy/index.ts:48` — API key in URL query string *(unresolved from 2026-05-07)*

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&...`;
```

The key appears in HTTP server logs on the Wine-Searcher side and any CDN/proxy logs in between. Use an `Authorization` header or POST body if the API supports it.

**Severity: Low**

---

### LOW *(NEW)* — `supabase/functions/ocr/index.ts:59,65` — `claude-opus-4-6` used for OCR; should use a cheaper model

Both the image path (line 65) and URL path (line 59) of the OCR function invoke `claude-opus-4-6`. Structured JSON extraction from a wine list image is well within the capability of `claude-haiku-4-5-20251001` at roughly 1/20th the cost per token. Given the endpoint has no authentication (separate finding), this amplifies the financial exposure of every unauthorized call.

**Severity: Low**

---

## UX and Performance Issues

### MEDIUM — `app/(tabs)/history.tsx:64` — History cards wrapped in `TouchableOpacity` with no `onPress` *(unresolved from 2026-05-07)*

Every scan history card is a `TouchableOpacity` that responds visually to taps but has no `onPress` handler. Tapping does nothing. Users reasonably expect to open a past recommendation. This is either a missing feature or the wrong component (`View` should be used for non-interactive elements).

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:182–184` — Back arrow on tab screen navigates incorrectly *(unresolved from 2026-05-07)*

```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

Profile is a tab screen. A back arrow icon implies stack navigation semantics; pressing it adds a spurious entry to the stack and confuses users who expect the tab bar to handle cross-tab navigation. Remove the back arrow.

**Severity: Medium**

---

### LOW — `app/scan/extracting.tsx:153` — "Please don't leave this page" copy is alarming and unexplained *(unresolved from 2026-05-07)*

The message appears during the OCR stage but does not explain the consequence of leaving (scan cancellation). Replace with: "Navigating away will cancel this scan."

**Severity: Low**

---

### LOW — `app/scan/preferences.tsx` — Screen is unreachable; dead code *(unresolved from 2026-05-07)*

No screen in the navigation graph links to `/scan/preferences`. The file calls `recommendWines` with an incomplete `RecommendInput` (lines 28–33 omit `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, `dislikedGrapes`). Delete the file or add it to the router as an explicitly disabled route.

**Severity: Low**

---

### LOW — `app/scan/url.tsx` — Dead route silently redirects *(unresolved from 2026-05-07)*

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

If URL-based scanning was intentionally removed, this file should be deleted. A silent redirect is indistinguishable from an active feature to future developers and misleads anyone reading the router's route map.

**Severity: Low**

---

## Navigation Issues

### HIGH — `app/index.tsx:19–20` — Onboarding check fires before preferences query resolves; new users skip onboarding *(unresolved from 2026-05-07)*

Described fully in Bugs section. `preferences` is `undefined` (not `null`) while `usePreferences` is fetching. The guard `if (preferences === null)` never fires, so new signed-in users are redirected to `/(tabs)/scan` instead of `/onboarding`. Fix: expose `isLoading` from `usePreferences` and add it to the loading gate on line 16.

**Severity: High**

---

### HIGH — `app/scan/results.tsx:22–24` — `router.replace` called synchronously during render *(unresolved from 2026-05-07)*

Duplicated from Bugs section. Navigation APIs must not be called during the render phase. Use `useEffect`.

**Severity: High**

---

### MEDIUM — `app/(tabs)/profile.tsx:113` — Email-change redirect URL points to a non-existent route *(unresolved from 2026-05-07)*

```ts
const redirectTo = Linking.createURL('auth/callback');
```

There is no `app/auth/callback.tsx` route. After the user confirms their email change, Supabase redirects to `auth/callback`, which either 404s or fails to open the app, leaving the email change incomplete. Create `app/auth/callback.tsx` to handle the auth code exchange and redirect the user home.

**Severity: Medium**

---

### MEDIUM — `app/(auth)/_layout.tsx` — No route back to welcome screen from auth screens *(unresolved from 2026-05-07)*

`headerShown: false` hides the default stack back button on both `sign-in` and `sign-up`. Users who tap "Sign In" or "Create Account" from the welcome screen are stranded in the auth stack if they change their mind. Fix: add a "Continue without account" link or re-enable the header back button.

**Severity: Medium**

---

### LOW — `app/scan/url.tsx` — Dead route should be deleted *(unresolved from 2026-05-07)*

Duplicated from UX section. A file that immediately redirects pollutes the router's route map and is indistinguishable from an intentional active route.

**Severity: Low**

---

## Summary

| Severity | Count | New This Week | Persistent (Unresolved) |
|----------|-------|---------------|-------------------------|
| High     | 6     | 0             | 6                       |
| Medium   | 13    | 4             | 9                       |
| Low      | 10    | 3             | 7                       |
| **Total**| **29**| **7**         | **22**                  |

**Critical unresolved items requiring immediate attention:**
1. Edge functions callable without authentication — unbounded Anthropic API cost exposure (`src/api/claude.ts:7`)
2. SSRF in OCR function — server-side request forgery with no URL validation (`supabase/functions/ocr/index.ts:49`)
3. `router.replace` during render causing potential crash loop (`app/scan/results.tsx:22`)
4. Scan sessions never persisted — History tab is permanently non-functional

**New issues requiring attention:**
1. Tap-to-focus broken in camera — `focusPoint` state set but never passed to `CameraView` (`app/scan/camera.tsx:15`)
2. Current date not injected into recommend prompt — drinking window assessments become stale over time (`supabase/functions/recommend/index.ts`)
3. Profile preference changes never re-sync to scan tab after first load (`app/(tabs)/scan.tsx:59`)
