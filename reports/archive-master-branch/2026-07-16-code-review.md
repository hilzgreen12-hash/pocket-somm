# Code Review — 2026-07-16

Reviewed: Pocket Somm (Expo SDK 54, expo-router, Supabase, Claude API)

---

## Bugs and Crashes

### High

**1. `app/scan/results.tsx:23–24` — Router called during render (will crash)**

```ts
if (!recommendation) {
  router.replace('/(tabs)/scan');  // <-- called in render body
  return null;
}
```

`router.replace` is called synchronously in the render body, not inside a `useEffect`. React will throw "Cannot update a component while rendering a different component." The guard should be:

```ts
useEffect(() => {
  if (!recommendation) router.replace('/(tabs)/scan');
}, [recommendation]);
if (!recommendation) return null;
```

Severity: **High**

---

**2. `app/_layout.tsx` — No error boundary anywhere in the app**

There is no `ErrorBoundary` component at any level of the tree. Any unhandled JS error in a component (e.g., a bad `JSON.parse`, a null-dereference, or an unexpected shape from the Claude API) will crash the entire app with a white screen and no recovery path. Add a top-level `ErrorBoundary` wrapping the `<Stack>` in `RootLayout`.

Severity: **High**

---

**3. `app/index.tsx:20` — Race condition causes new signed-in users to skip onboarding**

```ts
const { preferences } = usePreferences();
// ...
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```

`usePreferences` returns `undefined` while the React Query fetch is in flight, and `undefined === null` is `false`. So a brand-new user who has just signed up and has no profile row yet will be redirected to `/(tabs)/scan` while the query is still loading, bypassing onboarding entirely. This only corrects itself if the query happens to resolve before the auth loading completes — a timing race.

Fix: expose `isLoading` from `usePreferences` and hold the redirect until both `loading` (auth) and preferences loading are both complete:

```ts
const { preferences, isLoading: prefsLoading } = usePreferences();
if (loading || hasLaunched === null || (session && prefsLoading)) return null;
```

Severity: **High**

---

### Medium

**4. `src/hooks/usePreferences.ts:38` — Upsert errors are silently discarded**

```ts
await supabase.from('profiles').upsert({ ... });
```

The Supabase client returns `{ data, error }` — it never throws. Because the code does not destructure `error`, any RLS violation, network failure, or constraint error on `profiles` is completely lost. The mutation's `onError` callback (line 50) will never fire. The user sees no feedback that their preference save failed.

Fix:
```ts
const { error } = await supabase.from('profiles').upsert({ ... });
if (error) throw error;
```

Severity: **Medium**

---

**5. `src/api/claude.ts:17` — Raw `JSON.parse` throws an uncaught `SyntaxError` on non-JSON responses**

```ts
const text = await res.text();
if (!res.ok) throw new Error(`${name} error ${res.status}: ${text}`);
return JSON.parse(text);
```

If the edge function returns HTML (e.g., Supabase's API gateway error page or a Cloudflare 502), `JSON.parse` throws a raw `SyntaxError` with a message like "Unexpected token '<'". This surfaces to the user as an undescriptive crash. Wrap in a try/catch:

```ts
try {
  return JSON.parse(text);
} catch {
  throw new Error(`${name} returned non-JSON response (status ${res.status})`);
}
```

Severity: **Medium**

---

**6. `supabase/functions/ocr/index.ts:59` and `supabase/functions/recommend/index.ts:170` — Outdated model ID**

Both edge functions use `model: 'claude-opus-4-6'`. The current latest Opus release is `claude-opus-4-8`. If `claude-opus-4-6` is deprecated or sunset, all OCR and recommendation calls will return a 404/400 from the Anthropic API with no graceful fallback. Update both functions to `claude-opus-4-8` and add model version to a shared constant to make future updates a single-line change.

Severity: **Medium**

---

**7. `app/(auth)/sign-in.tsx:48` — Guest "Continue without account" doesn't set `hasLaunched`**

```ts
<TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)/scan')}>
```

`welcome.tsx` sets `AsyncStorage.setItem('hasLaunched', 'true')` when the user taps "Start Scanning". But if a user navigates to the sign-in screen and then taps "Continue without account", `hasLaunched` is never stored. The next time they cold-launch the app, `hasLaunched === null`, so they'll be shown the welcome screen again — a confusing loop.

Fix: call `await AsyncStorage.setItem('hasLaunched', 'true')` before navigating in the guest button's `onPress`.

Severity: **Medium**

---

### Low

**8. `app/(auth)/sign-in.tsx:12` — No input validation before sign-in API call**

`handleSignIn` submits an empty email and password to Supabase without any client-side check. This triggers a network call that returns a somewhat opaque error. Add a guard: `if (!email.trim() || !password) return;` before calling `signInWithPassword`.

Severity: **Low**

---

**9. `app/(auth)/sign-up.tsx:12` — No client-side password length validation**

Supabase requires a minimum 6-character password by default. The sign-up form accepts any non-empty password and only surfaces the rejection after a round-trip. Add `if (password.length < 6) { Alert.alert(...); return; }` before the API call.

Severity: **Low**

---

## Supabase and Edge Function Issues

**10. `supabase/functions/ocr/index.ts:50–53` — URL parameter fetched without SSRF validation**

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

The `url` body parameter is passed directly to `fetch` with no validation. A malicious caller could supply internal network addresses (e.g., `http://localhost`, `http://10.0.0.1`, RFC-1918 ranges, or metadata endpoints like `http://169.254.169.254/`) to probe the edge function's internal network. Add URL parsing and reject non-`https:`, non-`http:` schemes and private IP ranges before fetching.

---

**11. `supabase/functions/ocr/index.ts:87` and `supabase/functions/recommend/index.ts:184` — Greedy regex for JSON extraction**

```ts
const match = text.match(/\{[\s\S]*\}/);
```

The `.*` (via `[\s\S]*`) is greedy and will match from the first `{` to the last `}` in the string. If Claude returns prose containing curly braces before the actual JSON object, this regex grabs the wrong span and the subsequent `JSON.parse` throws. Use a non-greedy match (`/\{[\s\S]*?\}/`) or, better, attempt `JSON.parse` from the beginning and fall back to the regex only if needed.

---

**12. `supabase/migrations/001_initial_schema.sql:33–44` — `pricing_cache` has no RLS enabled**

The `pricing_cache` table has no `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY` call. While the wine-searcher proxy uses the `SUPABASE_SERVICE_ROLE_KEY` (which bypasses RLS), omitting RLS leaves the table unprotected against future policy drift or any direct `anon`/`authenticated` role queries that might be added. Add `ALTER TABLE pricing_cache ENABLE ROW LEVEL SECURITY;` and a policy that restricts direct access to the service role only.

---

**13. `src/hooks/usePreferences.ts:38` — Upsert failure never surfaces (duplicate of Bug #4)**

Same file and line as Bug #4. The core Supabase issue means any upsert failure — including a permissions error from `profiles` RLS — is silently lost. The mutation's `onError` handler is effectively dead code until `error` is thrown.

---

**14. `supabase/functions/recommend/index.ts:139` — Budget is always formatted in GBP regardless of currency**

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```

The `£` symbol is hardcoded in the system prompt. If a user is using the app in another currency (the `preferences.ts` type includes `defaultCurrency`), the prompt misleads the model into comparing against a GBP value while the wine list prices may be in another currency. Pass the actual currency symbol or code into the prompt.

---

## UX and Performance Issues

**15. `app/(tabs)/history.tsx:64` — History cards have no `onPress` handler (dead-end UX)**

```ts
<TouchableOpacity style={styles.card}>
```

All history cards are `TouchableOpacity` with no `onPress`. A user tapping a past scan gets a visual "press" ripple and nothing else. Either add navigation to a detail screen showing the full past recommendation, or replace `TouchableOpacity` with `View` to remove the misleading tap affordance.

---

**16. `app/scan/preferences.tsx` — Screen is unreachable (orphaned route)**

No part of the app navigates to `/scan/preferences`. The main scan flow goes `camera → preview → extracting → results`. This screen is defined but dead code. Either wire it into the flow or delete it.

---

**17. `app/scan/url.tsx` — URL-based scanning feature is entirely inaccessible**

```ts
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The OCR edge function has a full `url`-based branch (lines 49–66) for scraping wine list pages. The corresponding UI route immediately redirects away. Users can never reach this feature. Either expose a URL input on the main scan screen or remove the edge function branch.

---

**18. `app/(tabs)/profile.tsx:182–184` — Back arrow icon placed on the right side**

```ts
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

A back-navigation arrow icon is placed in the top-right corner of the profile header, which is unconventional on both iOS (back chevron top-left) and Android (up-arrow top-left). Users opening the Profile tab from the tab bar will find an arrow pointing left on the right side, which is visually confusing. Remove it (tab bar handles navigation) or move it to the leading position of a proper navigation header.

---

**19. `app/scan/extracting.tsx:150–152` — Duplicate waiting message during recommending stage**

When `stage === 'recommending'`, the UI renders:
- Line 147: `"Scoring by critic rating, vintage quality and value"` (body text)
- Line 151: `"This may take a minute or two"` (second body text block, always rendered in recommending stage)

Meanwhile, the first body text (line 144–147) only shows "This could take a minute or two" for the reading stage. So in the recommending stage the user sees two separate body text lines. Remove the conditional block at lines 150–152 and integrate the timing note into the primary body text for that stage.

---

**20. `app/scan/extracting.tsx:60` — `useEffect` has empty dependency array but captures store values**

```ts
useEffect(() => {
  if (!imageUri && !imageUris) { ... }
  run(token);
  return () => { token.active = false; };
}, []);  // <-- missing imageUri, imageUris
```

`imageUri` and `imageUris` are read inside the effect but not listed as dependencies. ESLint `react-hooks/exhaustive-deps` would flag this. At runtime it's unlikely to matter (this screen is only ever mounted once per scan flow), but the stale-closure pattern means any store update after mount is invisible to the effect. The standard fix is either to read the values before the `useEffect` and capture them in variables, or add them to the dependency array with a `hasRun` guard to avoid double-execution.

---

## Navigation Issues

**21. `app/scan/results.tsx:23–24` — Router called during render (already in Bugs #1)**

See Bug #1. The navigation guard in `ResultsScreen` runs during render, not in an effect. This is both a React violation and a navigation dead-end if the store is cleared mid-navigation.

---

**22. `app/index.tsx:20` — New signed-in user can skip onboarding (already in Bugs #3)**

See Bug #3. The missing `isLoading` check creates a navigation race where a new user is sent to `/(tabs)/scan` before the preferences query resolves.

---

**23. `app/scan/preview.tsx:11` — `useEffect` dependency includes `imageUri` but also clears `imageUri` on retake via `reset()`**

When the user taps "Retake" on the preview screen, `reset()` sets `imageUri` to `null`, which triggers the `useEffect` and calls `router.replace('/(tabs)/scan')`. This is intentional and works correctly. However, if the user navigates back via the OS gesture (swipe-back on iOS), `imageUri` is still set but the preview screen is re-entered without going through the camera again. No immediate crash, but the back-gesture flow is inconsistent: swiping back from preview lands on the camera, but swiping back again from camera leaves the stale image in the store. Add a cleanup in `CameraScreen` to call `reset()` when the camera unmounts (or on back navigation).

---

**24. `app/onboarding.tsx:37–50` — Navigates away immediately on "Save & Start" without awaiting save**

```ts
function handleNext() {
  if (isLast) {
    updatePreferences({ ... });
    router.replace('/(tabs)/scan');  // fires immediately
  }
  ...
}
```

`updatePreferences` is a Zustand mutation (fire-and-forget). The `router.replace` runs in the same synchronous call, before the network request completes. Combined with Bug #4 (errors silently dropped), a user can be redirected to scan with no saved preferences and no error. The button correctly shows `isSaving` but the navigation doesn't wait for `onSuccess`. Wire `router.replace` into the mutation's `onSuccess` callback instead.

Severity: **Medium**
