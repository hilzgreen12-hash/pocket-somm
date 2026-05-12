# Automated Code Review — 2026-05-10

> All issues from the 2026-05-08 review remain unresolved unless noted otherwise.
> This report repeats those findings for traceability and adds four new findings discovered today.

---

## Bugs and Crashes

### HIGH — `app/scan/results.tsx:22–24` — `router.replace` called during render *(unresolved)*

`router.replace('/(tabs)/scan')` is called synchronously in the component body when `recommendation` is null, outside of a `useEffect`. Calling navigation APIs during the React render phase is illegal and can trigger a crash loop if the store is partially reset between renders.

Fix: wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

**Severity: High**

---

### HIGH — `app/_layout.tsx:14–39` — No error boundary wrapping the app *(unresolved)*

The root layout renders `<AuthProvider>`, `<QueryClientProvider>`, and `<Stack>` with no React error boundary. Any unhandled render exception — null-dereference in a component, malformed Claude response that slips past Zod, or a missing font — will crash the entire app to a blank screen with no recovery UI.

Fix: add a top-level `ErrorBoundary` component wrapping the children in `RootLayout`.

**Severity: High**

---

### HIGH — `src/api/claude.ts:7–18` — Edge functions invoked without user JWT *(unresolved)*

`invokeFunction` authenticates only with `'apikey': ANON_KEY`. The anon key is public by design (`EXPO_PUBLIC_` prefix). Anyone who extracts it can call `/functions/v1/ocr` and `/functions/v1/recommend` without a valid user session, incurring unbounded Anthropic API costs.

Fix: read the session with `supabase.auth.getSession()` and add `'Authorization': \`Bearer ${session.access_token}\`` to the request headers. Reject unauthenticated calls in each edge function with a 401.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:49–54` — SSRF via `url` parameter *(unresolved)*

The OCR function fetches a caller-supplied URL server-side with no domain allow-list or RFC-1918 address rejection:

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

An attacker can supply `http://169.254.169.254/latest/meta-data/` or internal Supabase URLs. Because the endpoint requires only the public anon key, this is exploitable by anyone with the key.

Fix: validate that `url` uses `https:` and passes a domain allow-list before fetching.

**Severity: High**

---

### MEDIUM — `src/hooks/useAuth.tsx:17` — `getSession` rejection unhandled; app permanently blank on network failure *(NEW)*

```ts
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

There is no `.catch()` handler. If `getSession` rejects — network unavailable at cold start, SecureStore locked, Supabase project paused — the promise rejection is swallowed, `setLoading(false)` is never called, and `loading` stays `true` forever. The index route (`app/index.tsx:16`) returns `null` indefinitely, leaving the user staring at a blank screen with no way to recover.

Fix: add `.catch(() => setLoading(false))` or convert to async/await with a try/catch that calls `setLoading(false)` in a finally block.

**Severity: Medium**

---

### MEDIUM — `app/index.tsx:9,19–20` — New signed-in users bypass onboarding *(unresolved)*

`usePreferences` does not expose `isLoading`. While React Query is fetching, `preferences` is `undefined` (not `null`). The guard `if (preferences === null)` on line 20 evaluates to false, so the user is immediately redirected to `/(tabs)/scan` instead of `/onboarding`. New users with no profile row never reach the onboarding flow unless auth resolution happens to race ahead of preferences settlement.

Fix: expose `isLoading` from `usePreferences` and gate the index component on it alongside `loading` from `useAuth`.

**Severity: Medium**

---

### MEDIUM — `app/index.tsx:12–13` — `AsyncStorage.getItem` rejects silently; app stuck on blank screen *(unresolved)*

```ts
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```

No `.catch()`. If `AsyncStorage` throws (corrupted storage, permission revoked), `hasLaunched` stays `null` forever and line 16 returns `null` indefinitely.

Fix: add `.catch(() => setHasLaunched(false))`.

**Severity: Medium**

---

### MEDIUM — `app/scan/camera.tsx:29–98` — `handleCapture` has no try/catch *(unresolved)*

`takePictureAsync` and two `ImageManipulator.manipulateAsync` calls are awaited inside an async function with no try/catch. Storage-full errors, hardware failures, and NaN crop dimensions produce unhandled promise rejections that can terminate the JS thread in modern React Native.

Fix: wrap the body in try/catch and show an `Alert` on failure.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/scan.tsx:86–102` — `handleScreenshot` has no try/catch *(unresolved)*

`ImagePicker.launchImageLibraryAsync` can throw on certain Android versions. The rejection is unhandled; the action fails silently with no user feedback.

Fix: wrap in try/catch and show an `Alert`.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/history.tsx:12–25` — Query error state silently discarded *(unresolved)*

Only `{ data: sessions, isLoading }` is destructured from `useQuery`. When the Supabase query fails, `isLoading` becomes false, `sessions` is `undefined`, and the "No scans yet" empty state renders — users with real history see an empty list with no error message and no retry option.

Fix: also destructure `isError` / `error` and render a visible error state.

**Severity: Medium**

---

### MEDIUM — `src/hooks/usePreferences.ts:38` — Supabase upsert error silently discarded *(unresolved)*

```ts
await supabase.from('profiles').upsert({...});
```

`supabase-js` returns `{ data, error }` — it does not throw. The error is not checked. If the upsert fails (RLS violation, network error), `mutationFn` returns successfully, `onSuccess` fires, and the `onError` handler is never called. The user's preference change is silently lost.

Fix: destructure the return value, check `error`, and throw if set.

**Severity: Medium**

---

### MEDIUM — `app/scan/camera.tsx:15,109` — Tap-to-focus state set but never passed to `CameraView` *(unresolved)*

`focusPoint` state is updated on tap but the `<CameraView>` component on lines 103–110 has no `focusPoint` prop. The gesture sets state that is immediately discarded. Users tapping the viewfinder see no response and receive no focus change.

Fix: either pass `focusPoint` to the camera API if the SDK supports it, or remove the handler and state entirely.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/scan.tsx:59–66` — Profile preference changes never re-sync to the scan tab *(unresolved)*

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

Once `prefsLoaded` is true, the effect never runs again. If the user updates their profile in the Profile tab (which invalidates the React Query cache), the scan tab never picks up the new values and sends stale preferences to the edge function.

Fix: remove the `prefsLoaded` guard and re-sync unconditionally when `savedPreferences` changes.

**Severity: Medium**

---

### LOW — `app/onboarding.tsx:144` — "Skip for now" discards all partially-entered preferences silently *(NEW)*

The "Skip for now" button calls `router.replace('/(tabs)/scan')` directly without calling `updatePreferences`. If a user selects wine types on step 0, styles on step 1, and then decides to skip on step 2, all of their choices are discarded. There is no indication to the user that their selections were not saved.

Fix: call `updatePreferences` with the selections accumulated so far before navigating, or add a confirmation dialog explaining that choices will be lost.

**Severity: Low**

---

### LOW — `app/onboarding.tsx:36–51` — Navigation fires before preferences save completes *(unresolved)*

`updatePreferences({...})` calls `mutation.mutate`, which is fire-and-forget. `router.replace('/(tabs)/scan')` fires on the next line without awaiting. If the upsert fails, the user lands on the scan screen with no indication that their onboarding choices were not persisted.

Fix: use `mutation.mutateAsync` inside a try/catch, show an error alert on failure, and only navigate on success.

**Severity: Low**

---

### LOW — `app/(tabs)/profile.tsx:130–133` — Sign-out error not handled *(unresolved)*

```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

If `signOut` returns an error, the app navigates to sign-in while the Supabase session remains active. Fix: check `const { error } = await supabase.auth.signOut()` and show an `Alert` before navigating.

**Severity: Low**

---

### LOW — `src/types/preferences.ts:7–8` — `defaultBudget` typed non-nullable but is null at runtime; `defaultCurrency` typed but never used *(unresolved + NEW)*

`UserPreferences` declares `defaultBudget: number` and `defaultCurrency: string`. At runtime:
- `usePreferences.ts:28` maps `data.default_budget ?? null` — returning `null` — contradicting the type.
- `defaultCurrency` is not fetched in `usePreferences.ts`, not stored in any migration, and not referenced anywhere in the codebase. It is a phantom field.

Fix: change `defaultBudget` to `number | null`. Remove `defaultCurrency` from the type or add the corresponding DB column, fetch, and save logic.

**Severity: Low**

---

### LOW — `src/types/preferences.ts:8` / `app/scan/results.tsx:84` / `supabase/functions/recommend/index.ts:139` — Currency hardcoded to GBP/£ throughout *(NEW)*

`wine.currency` is extracted from the menu and stored in `ExtractedWine`, but it is never used for display. Results always render `£${wine.menuPrice}` regardless of the actual currency code. The recommend edge function's budget constraint always formats as `£${budget}`. If a restaurant prices in EUR or USD, users see wrong currency symbols and the AI may misinterpret budget constraints.

Fix: use `wine.currency` to format prices in `app/scan/results.tsx`. Pass the detected currency to the edge function and format the budget line accordingly.

**Severity: Low**

---

### LOW — `src/services/recommender.ts:75–82` — Strict-diversity retry silently falls through on second Zod failure *(unresolved)*

If the initial response contains duplicate grapes, a second call is made with `_strictDiversity: true`. If `parsed2.success` is false, execution falls through to `return parsed.data` — returning the original duplicate-grape result with no log entry:

```ts
const parsed2 = RecommendationResponseSchema.safeParse(raw2);
if (parsed2.success) return parsed2.data;
// silent fall-through — returns first (duplicate) result
```

Fix: add `console.warn` and optionally throw so the edge function log captures the double failure.

**Severity: Low**

---

## Supabase and Edge Function Issues

### HIGH — `supabase/functions/ocr/index.ts` and `recommend/index.ts` — No authentication or rate-limiting *(unresolved)*

Neither function checks the `Authorization` header or verifies a valid Supabase user session. The public anon key is the only credential required. Any external party can drive unlimited OCR and recommendation requests, generating uncapped Anthropic API costs.

Fix: verify the Bearer JWT via `supabase.auth.getUser(jwt)` at the top of each function and return 401 for unauthenticated requests.

**Severity: High**

---

### MEDIUM — `supabase/migrations/001_initial_schema.sql:32–44` — `pricing_cache` table has no RLS *(unresolved)*

`profiles` and `scan_sessions` have RLS enabled. `pricing_cache` does not. Any future misconfiguration or overly permissive grant would expose the full pricing cache to unauthenticated reads or writes.

Fix: add `alter table pricing_cache enable row level security;` in a new migration. With no policies added, the table becomes inaccessible to all roles except service role, which is the correct access pattern for a server-only cache.

**Severity: Medium**

---

### MEDIUM — `supabase/functions/recommend/index.ts:169` — `max_tokens: 4096` may truncate responses for large wine lists *(unresolved)*

With 25 wines and the full nested JSON output (three wines, each with `vintageAssessment`, `drinkingWindow`, `rarityAssessment`, `rationale`), output can approach 3,500–4,000 tokens. A verbose wine list can produce a truncated mid-JSON response, causing `JSON.parse` on line 186 to throw and return a 500.

Fix: raise to `max_tokens: 8096` to match the OCR function.

**Severity: Medium**

---

### MEDIUM — `supabase/functions/recommend/index.ts` — Current date never injected into prompt *(unresolved)*

The system prompt instructs Claude to assess drinking windows "as of today's date" (line 38), but no date is injected into the prompt or user message. Claude infers the current year from training data. As time passes, the gap between Claude's knowledge cutoff and the real date grows, making drinking window statuses progressively less accurate.

Fix: inject the server date into the user message:
```ts
const today = new Date().toISOString().slice(0, 10);
// Add to userContext: `- Today's date: ${today}`
```

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/history.tsx:16–24` — Scan results never written to `scan_sessions`; History tab permanently empty *(unresolved)*

No code in the application performs an INSERT into `scan_sessions`. After `recommendWines` resolves in `app/scan/extracting.tsx:116`, `setRecommendation` is called and the user navigates to results, but no Supabase write occurs. The History tab always shows "No scans yet" for every user, regardless of how many scans they have performed.

**Severity: Medium**

---

### LOW — `supabase/functions/wine-searcher-proxy/index.ts:48` — API key exposed in URL query string *(unresolved)*

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&...`;
```

The key appears in HTTP server access logs on the Wine-Searcher side and any CDN/proxy between them.

Fix: use an `Authorization` header or POST body if the API supports it; if not, document the risk.

**Severity: Low**

---

### LOW — `supabase/functions/ocr/index.ts:59,65` — `claude-opus-4-6` used for structured JSON extraction *(unresolved)*

Both the image and URL paths use `claude-opus-4-6`. Structured field extraction from a wine list is well within the capability of `claude-haiku-4-5-20251001` at roughly 1/20th the cost per token. Given the endpoint currently has no authentication, this amplifies the financial exposure of every unauthorised call.

Fix: switch the OCR function to `claude-haiku-4-5-20251001` and measure accuracy against real wine list images.

**Severity: Low**

---

## UX and Performance Issues

### MEDIUM — `app/(tabs)/history.tsx:64` — History cards are `TouchableOpacity` with no `onPress` *(unresolved)*

Every scan history card responds visually to taps (opacity flash) but has no `onPress` handler. Tapping does nothing. Users reasonably expect to re-open a past recommendation. This is either a missing feature or the wrong component — `View` should be used for non-interactive elements.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:182–184` — Back arrow on a tab screen *(unresolved)*

Profile is a tab-routed screen. An `arrow-back` icon implies stack navigation semantics; pressing it adds a spurious stack entry instead of switching tabs. Remove the back arrow and rely on the tab bar, or replace the Ionicons icon with a more appropriate affordance (e.g., a close "×" if the profile is meant to appear modal).

**Severity: Medium**

---

### MEDIUM — `app/scan/camera.tsx` — No visible back/cancel affordance *(unresolved)*

The camera screen has no back button. On Android, users must use the hardware back button to exit without capturing; on iOS, the swipe-back gesture requires a visible header or explicit gesture recogniser. If a user taps "Scan Wine List" by mistake, there is no obvious way to cancel without taking a photo.

Fix: add a visible "Cancel" or "✕" button that calls `router.back()`.

**Severity: Medium**

---

### LOW — `app/scan/extracting.tsx:144–150` — Two "minute or two" messages shown simultaneously during recommendation stage *(NEW)*

When `stage === 'recommending'`:
- The ternary on line 144–147 renders "Scoring by critic rating, vintage quality and value"
- The conditional on line 150 *also* renders "This may take a minute or two"

Both elements appear at the same time, producing two separate paragraphs of loading copy. The body text and the separate "may take a minute" line are redundant and should be merged into a single message.

**Severity: Low**

---

### LOW — `app/scan/extracting.tsx:153` — "Please don't leave this page" copy is alarming and unexplained *(unresolved)*

The message does not explain the consequence of navigating away.

Fix: replace with "Navigating away will cancel this scan."

**Severity: Low**

---

### LOW — `app/scan/preferences.tsx` — Screen is unreachable and calls edge function with incomplete payload *(unresolved)*

No screen in the navigation graph links to `/scan/preferences`. The file calls `recommendWines` on lines 28–33 without `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, or `dislikedGrapes` — all required by `RecommendInput`. The screen is dead code with a latent type mismatch.

Fix: delete the file or connect it intentionally to the navigation graph with a complete payload.

**Severity: Low**

---

### LOW — `app/scan/url.tsx` — Dead route silently redirects *(unresolved)*

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

If URL-based scanning was intentionally removed, this file should be deleted. A silent redirect misleads future developers reading the router's route map.

**Severity: Low**

---

### LOW — `app/(tabs)/profile.tsx:153` — Email change label references "subscription" that doesn't exist *(unresolved)*

The tappable label reads "Change your subscription email account." There is no subscription model in the codebase. This implies a product feature that does not exist and may confuse users into believing a subscription manages their account.

Fix: change the label to "Change email address."

**Severity: Low**

---

## Navigation Issues

### HIGH — `app/index.tsx:19–20` — Onboarding check fires before preferences query resolves; new users skip onboarding *(unresolved)*

Described in full in Bugs section. `preferences` is `undefined` while `usePreferences` is fetching; the `=== null` guard never fires; new users are sent to `/(tabs)/scan` instead of `/onboarding`.

**Severity: High**

---

### HIGH — `app/scan/results.tsx:22–24` — `router.replace` called synchronously during render *(unresolved)*

Described in full in Bugs section. Navigation APIs must not be called during the render phase.

**Severity: High**

---

### MEDIUM — `app/(tabs)/profile.tsx:113` — Email-change deep link points to a non-existent route *(unresolved)*

```ts
const redirectTo = Linking.createURL('auth/callback');
```

There is no `app/auth/callback.tsx` route. After confirming the email change, Supabase redirects to `auth/callback`, which either 404s or fails to open the app, leaving the email change silently incomplete.

Fix: create `app/auth/callback.tsx` to handle the auth code exchange and redirect the user home.

**Severity: Medium**

---

### MEDIUM — `app/(auth)/_layout.tsx` — No route back to welcome from auth screens *(unresolved)*

`headerShown: false` hides the default stack back button on both `sign-in` and `sign-up`. Users who enter the auth stack from the welcome screen cannot escape without completing sign-in or sign-up.

Fix: add a "Continue without account" link or re-enable the header back button.

**Severity: Medium**

---

### LOW — `app/scan/url.tsx` — Dead route should be deleted *(unresolved)*

Duplicated from UX section for navigation-graph completeness.

**Severity: Low**

---

## Summary

| Severity | Count | New This Week | Persistent (Unresolved) |
|----------|-------|---------------|-------------------------|
| High     | 6     | 0             | 6                       |
| Medium   | 14    | 1             | 13                      |
| Low      | 14    | 4             | 10                      |
| **Total**| **34**| **5**         | **29**                  |

### New findings this week

1. **`src/hooks/useAuth.tsx:17` (Medium)** — `getSession` rejection unhandled; permanent blank screen on network failure at cold start.
2. **`app/onboarding.tsx:144` (Low)** — "Skip for now" silently discards all partially-entered preferences.
3. **`src/types/preferences.ts:8` (Low)** — `defaultCurrency` field typed but never fetched, stored, or used anywhere in the codebase.
4. **`app/scan/results.tsx:84` / `supabase/functions/recommend/index.ts:139` (Low)** — Currency hardcoded to `£`/GBP throughout; `wine.currency` is extracted but never used for display or budget formatting.
5. **`app/scan/extracting.tsx:144–150` (Low)** — Two overlapping loading messages ("Scoring by critic rating…" and "This may take a minute or two") displayed simultaneously during the recommendation stage.

### Critical unresolved items requiring immediate attention

1. **Edge functions callable without authentication** — unbounded Anthropic API cost exposure (`src/api/claude.ts:7`).
2. **SSRF in OCR function** — arbitrary URL fetch with no allow-list (`supabase/functions/ocr/index.ts:49`).
3. **`router.replace` during render** — potential crash loop (`app/scan/results.tsx:22`).
4. **Scan sessions never persisted** — History tab is permanently non-functional for every user.
5. **`getSession` rejection unhandled** — cold-start network failure leaves app on a permanent blank screen (`src/hooks/useAuth.tsx:17`).
