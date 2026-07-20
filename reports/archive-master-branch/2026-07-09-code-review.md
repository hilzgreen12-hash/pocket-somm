# Code Review — 2026-07-09

Automated review of the Pocket Somm codebase (Expo SDK 54 / expo-router / Supabase / Claude API).

---

## Bugs and Crashes

### HIGH — `router.replace` called synchronously during render body
**Files:**
- `app/scan/results.tsx:23–25`
- `app/scan/preview.tsx:11`

**`results.tsx:23`:**
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
**`preview.tsx:11`:**
```tsx
if (!imageUri) router.replace('/(tabs)/scan');
```

Calling `router.replace` (or any navigation method) directly in the render body — not inside a `useEffect` — is a React anti-pattern. It triggers a navigation state update during the commit phase, which causes React to schedule another render before the current one has finished. In practice this produces "Cannot update a component while rendering a different component" warnings and can result in navigation loops or missed route history entries on both iOS and Android.

**Fix:** Wrap both in `useEffect` with the dependency that drives the redirect:
```tsx
useEffect(() => {
  if (!recommendation) router.replace('/(tabs)/scan');
}, [recommendation]);
if (!recommendation) return null;
```

---

### HIGH — No React Error Boundary; any uncaught render error blanks the screen
**File:** `app/_layout.tsx:14`

No `ErrorBoundary` component exists anywhere in the tree. If any screen throws during render (e.g., `recommendation.wines.map(...)` where `wines` is unexpectedly not an array, or a Zod parse error that bubbles up), the app crashes to a blank/white screen with no recovery path. In production Expo builds there is no dev overlay; users are stuck.

**Fix:** Add a top-level error boundary wrapping the `<Stack>` in `RootLayout`. Expo Router 3+ supports exporting a custom `ErrorBoundary` from each layout file:
```tsx
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Something went wrong. Please restart the app.</Text>
      <Button onPress={retry} title="Try Again" />
    </View>
  );
}
```

---

### HIGH — Edge functions have no authentication check; anon key in bundle enables free-ride API abuse
**Files:**
- `supabase/functions/ocr/index.ts:38` (entry point)
- `supabase/functions/recommend/index.ts:115` (entry point)
- `src/api/claude.ts:9–13` (call site)

Neither edge function verifies a caller JWT. The client sends only `apikey: ANON_KEY` (a static, anon-role key), not an `Authorization: Bearer <jwt>` token from a signed-in user. The anon key is embedded in the compiled app bundle (via `EXPO_PUBLIC_SUPABASE_ANON_KEY`), where it can be extracted by anyone who unpacks the IPA/APK.

This means anyone with the anon key can call `/functions/v1/ocr` or `/functions/v1/recommend` directly, triggering Anthropic API calls at the project's expense — with no rate limiting or user attribution.

**Fix:** Forward the user JWT from the Supabase client session and verify it inside the function:
```ts
// In the edge function
const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
const { data: { user }, error } = await supabaseClient.auth.getUser(jwt);
if (error || !user) return new Response('Unauthorized', { status: 401 });
```
In the client, use `supabase.functions.invoke(...)` (which automatically attaches the session JWT) instead of `fetch` with a hardcoded `apikey` header.

---

### MEDIUM — `handleScreenshot` in scan tab has no try/catch; ImagePicker errors are silently swallowed
**File:** `app/(tabs)/scan.tsx:86–102`

`handleScreenshot` is `async` but has no `try/catch`. If `ImagePicker.launchImageLibraryAsync` rejects (e.g., permission revoked mid-session, OS error), the unhandled rejection silently drops. The user sees nothing and the scan tab appears frozen.

**Fix:**
```tsx
async function handleScreenshot() {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({ ... });
    ...
  } catch (err) {
    Alert.alert('Unable to open photo library', 'Please try again.');
  }
}
```

---

### MEDIUM — `supabase.from('profiles').upsert(...)` return value never checked; preference saves fail silently
**File:** `src/hooks/usePreferences.ts:38–47`

The `mutationFn` calls `await supabase.from('profiles').upsert(...)` but discards the return value entirely. If the upsert fails (RLS rejection, network outage, schema mismatch), the `onError` callback logs it to the console (line 50) but no error is surfaced to the user. From the user's perspective, their preferences appeared to save (the accordion closed, the summary text updated optimistically) but the database was never updated.

**Fix:**
```ts
const { error } = await supabase.from('profiles').upsert({ ... });
if (error) throw error; // triggers onError → propagate to UI
```

---

### MEDIUM — `handleSignOut` routes to sign-in even if `signOut()` fails
**File:** `app/(tabs)/profile.tsx:130–133`

```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

`signOut()` can fail (e.g., no network). The error is discarded. The user is routed to the sign-in screen regardless, but their server-side session token remains valid. A sophisticated user could replay the old token.

**Fix:** Check for error before routing, or at minimum invalidate the local session unconditionally (which `signOut` does even on server error by default in supabase-js v2+). If you rely on that behaviour, document it:
```ts
const { error } = await supabase.auth.signOut();
if (error) console.warn('[Auth] Server signOut failed:', error.message);
// supabase-js clears the local session regardless of server error
router.replace('/(auth)/sign-in');
```

---

### MEDIUM — Retry on duplicate grape varieties silently returns the duplicate result if re-parse fails
**File:** `src/services/recommender.ts:75–83`

```ts
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data;
  // falls through to line 83
}
return parsed.data;  // returns duplicate-grape result
```

If the retry also fails Zod validation (which can happen when Claude returns a non-conforming structure), the function silently returns the original `parsed.data` — a result containing duplicate grape varieties, which the prompt's hard rule explicitly prohibits. The function should throw in this branch so the error surfaces to the user rather than returning a result that violates its own constraints.

**Fix:** Replace the fallthrough with:
```ts
if (parsed2.success) return parsed2.data;
throw new Error('Recommendation contained duplicate grape varieties and the retry also failed. Please try again.');
```

---

### LOW — Error response from `recommend` edge function missing `Content-Type` header
**File:** `supabase/functions/recommend/index.ts:194`

```ts
return new Response(JSON.stringify({ error: message }), { status: 500 });
```

The success response on line 188 includes `headers: { 'Content-Type': 'application/json' }` but the error response does not. Some HTTP clients inspect `Content-Type` before attempting `JSON.parse`. This is inconsistent and will cause issues if the calling code ever checks headers.

**Fix:** Add `headers: { 'Content-Type': 'application/json' }` to the error response object.

---

## Supabase and Edge Function Issues

### HIGH — `pricing_cache` table has no Row Level Security policy
**File:** `supabase/migrations/001_initial_schema.sql:33–45`

```sql
create table pricing_cache (
  wine_key text primary key,
  ...
);
-- No: alter table pricing_cache enable row level security;
-- No: create policy ...
```

`profiles` and `scan_sessions` both have RLS enabled. `pricing_cache` does not. Any authenticated user can:
- `SELECT *` from `pricing_cache` — leaks wine pricing and critic score data for all wines queried by all users
- `DELETE FROM pricing_cache WHERE wine_key = '...'` — force-expire cache entries to trigger paid Wine-Searcher API calls
- `INSERT` or `UPDATE` arbitrary cache rows with false pricing/score data — corrupt recommendations for other users

**Fix:** Enable RLS and create a restricted policy. Since this is internal cache data that should only be written by the service role (edge function), the public policy should be read-only at most, or no access at all:
```sql
alter table pricing_cache enable row level security;
-- No direct client access — reads/writes go through the edge function using service role key
```

---

### MEDIUM — `recommend` edge function uses a hardcoded currency symbol (£) for all users
**File:** `supabase/functions/recommend/index.ts:139,143`

```ts
? `HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle...`
: '';
...
`Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```

The prompt hardcodes `£` even when the wine list uses a different currency. A user dining in the US, EU, or Australia would have their budget described to the model in pounds, but the wine list prices are in dollars or euros. This means the model's budget hard-rule would compare mismatched currency values: a $80 bottle could be rejected because the user set a £80 budget but the model reads "$80 > £80".

The `currency` field exists on `ExtractedWine` (defaulting to 'GBP') but is not used in the budget prompt construction. **Fix:** Derive the dominant currency from the wine list and use it in the prompt.

---

### MEDIUM — OCR edge function sends raw HTML to Claude via the URL path without sanitising JavaScript
**File:** `supabase/functions/ocr/index.ts:25–35`

The `stripHtml` function removes `<script>` and `<style>` tags but:
1. It does not remove `<noscript>` tags.
2. It does not handle HTML entities comprehensively (e.g., `&#60;`, `&#x3C;`).
3. The 12,000-character cap (`slice(0, 12000)`) is applied after stripping, not before fetching. A 50MB page would still be fetched in full before truncation.

More critically, there is no SSRF protection. The function will fetch any URL provided in the request body. Combined with finding #3 (no auth on the function), an unauthenticated caller can use this as an SSRF proxy to make requests from the Supabase edge network to internal or third-party services.

**Fix:** Validate the URL against an allowlist or at minimum ensure it resolves to a public IP before fetching. Add authentication to the function (see bug #3).

---

### MEDIUM — Outdated model IDs in both edge functions
**Files:**
- `supabase/functions/ocr/index.ts:57,66`
- `supabase/functions/recommend/index.ts:170`

Both functions use `model: 'claude-opus-4-6'`. As of the current date (July 2026), the latest models are Opus 4.8 (`claude-opus-4-8`) and Sonnet 5 (`claude-sonnet-5`). `claude-opus-4-6` may still be available but is no longer the current generation. For the OCR task (structured JSON extraction from an image), `claude-haiku-4-5-20251001` would perform comparably at a fraction of the cost. For the recommend task, `claude-sonnet-5` provides a better capability/cost balance than Opus 4.6.

---

### LOW — Recommend prompt tells model to reason from "today's date" but never provides it
**File:** `supabase/functions/recommend/index.ts:39`

```
"Assess whether the wine is currently within its optimal drinking window as of today's date."
```

The model has a training knowledge cutoff. Without an explicit date in the prompt, it will assume "today" is somewhere near its training cutoff — potentially 12+ months behind the real current date. This causes systematically early drinking window assessments: a wine that should be at peak in 2026 might be told it's still "Approaching".

**Fix:** Inject the current ISO date into the user message:
```ts
const today = new Date().toISOString().split('T')[0]; // "2026-07-09"
// In the user message:
`Today's date is ${today}. Assess drinking windows accordingly.`
```

---

## UX and Performance Issues

### MEDIUM — History list items are wrapped in `TouchableOpacity` with no `onPress`
**File:** `app/(tabs)/history.tsx:64`

```tsx
<TouchableOpacity style={styles.card}>
  <Text style={styles.cardDate}>...</Text>
  ...
</TouchableOpacity>
```

The card has active-opacity press feedback (the default 0.2 opacity flash) but no `onPress` handler. Users will tap a history item expecting to view the full recommendation, get visual feedback that their tap registered, and then nothing happens. This is a broken interaction — either wire up a detail view route or replace `TouchableOpacity` with `View`.

---

### MEDIUM — New signed-in users bypass onboarding; preferences are never set
**Files:** `app/index.tsx:20` and `app/(auth)/sign-in.tsx:19`

`index.tsx` has logic to redirect to `/onboarding` when `preferences === null` (no profile row). But `sign-in.tsx` routes directly to `/(tabs)/scan` on successful sign-in (line 19), skipping `index.tsx` entirely. New users who sign up and sign in go straight to the scan tab with empty preferences. The onboarding flow at `/onboarding` is unreachable via the normal sign-up path.

The `index.tsx` onboarding redirect would only fire if the app is restarted while a session is already stored and the profile query returns null — a narrow race that most users won't hit.

**Fix:** After sign-up (or after first sign-in) check whether a profile row exists and route to `/onboarding` if not, or redirect through `index.tsx` instead of directly to scan.

---

### MEDIUM — Duplicate "may take a minute or two" message during recommending stage
**File:** `app/scan/extracting.tsx:147–152`

```tsx
<Text style={styles.body}>
  {stage === 'reading'
    ? 'This could take a minute or two'          // line 148
    : 'Scoring by critic rating, vintage quality and value'}
</Text>
...
{stage === 'recommending' && (
  <Text style={styles.body}>This may take a minute or two</Text>  // line 151
)}
```

When `stage === 'recommending'`, both the dynamic body text AND a separate "This may take a minute or two" line render simultaneously, producing two status lines of visible body copy. Remove the redundant line 151–153 block.

---

### LOW — `app/scan/url.tsx` exists as a file but immediately redirects away; dead route
**File:** `app/scan/url.tsx`

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

This route is registered by expo-router (it's a file in the `app/` directory) but immediately redirects to scan. No code navigates to it. It appears to be a planned feature (URL-based wine list input) that was never implemented. Since it's a stub that only redirects, it should either be implemented or removed to keep the route table clean and avoid confusion for future developers.

---

### LOW — Profile save errors are never communicated to the user
**File:** `src/hooks/usePreferences.ts:50`

```ts
onError: (err) => console.error('[Preferences] Save error:', err),
```

When a preference save fails, only a `console.error` is emitted. The user sees no feedback — accordions close as if the save succeeded. In production, console output is invisible. At minimum, show a brief toast or `Alert` when `onError` fires so users know to retry.

---

## Navigation Issues

### HIGH — `router.replace` during render in `results.tsx` and `preview.tsx` (also listed under Bugs)
**Files:**
- `app/scan/results.tsx:23–25`
- `app/scan/preview.tsx:11`

(See detailed write-up in Bugs and Crashes section. Repeated here because the root cause is navigational: a guard that should be a side-effect inside `useEffect` is incorrectly placed in the render body, causing unpredictable navigation timing.)

---

### MEDIUM — `app/scan/preferences.tsx` is an orphaned route; nothing navigates to it
**File:** `app/scan/preferences.tsx`

This screen exists as a registered expo-router route but no `router.push('/scan/preferences')` call appears in the codebase. The `extracting.tsx` screen now calls `recommendWines` directly in the same pass as OCR. `preferences.tsx` contains its own `recommendWines` call and a `StylePicker`, suggesting it was the original preferences step in an older flow before the scan tab was redesigned to inline the preference UI.

This dead route will show up in any stack trace analysis and confuses the routing graph. If the intent is for users to be able to adjust preferences after OCR (but before recommending), wire `preview.tsx` to push to `/scan/preferences` before extracting. If the flow is intentionally inlined in the scan tab, delete the file.

---

### LOW — Back navigation on sign-in/sign-up flows returns to welcome when `router.replace` would be more appropriate
**Files:** `app/welcome.tsx:25,29` and `app/(auth)/sign-up.tsx`

`welcome.tsx` uses `router.push('/(auth)/sign-up')` and `router.push('/(auth)/sign-in')`, adding both auth screens to the history stack. On sign-in, `router.replace('/(tabs)/scan')` is called, which replaces the top of the stack but leaves welcome in history. On Android, pressing the hardware back button from the scan tab could navigate back to the welcome screen.

**Fix:** Replace `router.push` with `router.replace` when navigating from `welcome.tsx` to the auth screens, so the welcome screen is removed from the history stack before auth begins.
