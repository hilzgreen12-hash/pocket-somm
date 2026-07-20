# Pocket Somm — Code Review
**Date:** 2026-07-13  
**Reviewer:** Automated (Claude)  
**Scope:** Full codebase — app/, src/, supabase/functions/, supabase/migrations/

> **Note:** The only commit since the 2026-07-12 review added that report file itself. No application code has changed. This is the 63rd consecutive daily review; every HIGH and MEDIUM issue listed below has been present and unfixed since the first review in May 2026. This header exists so the reader does not mistake these for newly discovered issues.

---

## Bugs and Crashes

### HIGH

**1. `eas.json:9–10` — Live Supabase credentials committed to version control**  
The production Supabase project URL and anon key are stored in plaintext inside `eas.json`, which is tracked by git. Anyone with repo access can call the Supabase REST API, invoke Edge Functions, and read or write data within the anon role's permissions. The `.gitignore` correctly excludes `.env` files but does not exclude `eas.json`.  
**Fix:** Rotate the exposed anon key immediately. Replace hardcoded values with EAS Secrets or CI environment variables. Remove any plaintext credentials from committed files.

**2. `app/scan/results.tsx:22–25` — `router.replace()` called imperatively during render**
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
Navigation is called unconditionally in the render body, outside any `useEffect`. This is invalid in React and triggers "Cannot update a component while rendering a different component" in React Strict Mode and Expo Router's concurrent renderer.  
**Fix:**
```tsx
useEffect(() => {
  if (!recommendation) router.replace('/(tabs)/scan');
}, [recommendation]);
if (!recommendation) return null;
```

**3. `app/(tabs)/history.tsx:71` — `topPick` property does not exist on `RecommendationResponse`**
```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```
`RecommendationResponse` is typed as `{ wines: WineRecommendation[], summary: string }`. There is no `topPick` field. This expression is always falsy; no wine name is ever shown on any history card even if the table were populated.  
**Fix:** Replace with `item.recommendation?.wines?.[0]?.name`.

**4. `supabase/functions/ocr/index.ts:51` — Server-Side Request Forgery (SSRF)**
```typescript
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
The edge function accepts a `url` field from the caller's request body and fetches it server-side with no validation. A caller can supply `http://169.254.169.254/` (AWS/GCP instance metadata), `http://localhost`, or internal Supabase service addresses to probe infrastructure unreachable from the public internet.  
**Fix:** Validate that `url` is HTTPS only and reject private/link-local IP ranges before fetching:
```typescript
const parsed = new URL(url);
if (parsed.protocol !== 'https:') throw new Error('Only HTTPS URLs are accepted');
```

---

### MEDIUM

**5. `src/hooks/useAuth.tsx:17` — `getSession()` promise error unhandled; app hangs permanently on failure**
```typescript
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```
No `.catch()` is attached. If `getSession()` rejects (network error, malformed response, Supabase misconfiguration), `setLoading(false)` is never called, `loading` stays `true` forever, and the app displays a blank screen permanently — with no error message or recovery path.  
**Fix:**
```typescript
supabase.auth.getSession()
  .then(({ data }) => { setSession(data.session); setLoading(false); })
  .catch(() => setLoading(false));
```

**6. `app/index.tsx:19–21` — New signed-in users bypass onboarding due to `undefined` vs. `null` race**
```tsx
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```
`usePreferences()` returns `undefined` (not `null`) while the query is in-flight. The guard `preferences === null` evaluates to `false` during loading, so a brand-new user with no profile row is sent directly to `/(tabs)/scan`, skipping onboarding entirely. This persists until a hard app restart.  
**Fix:** Expose `isLoading` from `usePreferences()` and gate on it:
```tsx
const { preferences, isLoading: prefsLoading } = usePreferences();
if (loading || hasLaunched === null || (session && prefsLoading)) return null;
```

**7. `app/onboarding.tsx:38–47` — Save is fire-and-forget; navigation proceeds before data is persisted**
```tsx
updatePreferences({ wineTypes, styleProfiles, ... });
router.replace('/(tabs)/scan');
```
`updatePreferences` is `mutation.mutate` — an async operation that returns immediately. `router.replace` fires on the very next line before the network call completes. On a slow or failing network, the user arrives at the scan screen with their onboarding choices silently lost.  
**Fix:** Use `mutateAsync` with `await`, or place navigation in the mutation's `onSuccess`:
```tsx
mutation.mutate(prefs, {
  onSuccess: () => router.replace('/(tabs)/scan'),
  onError: (e) => Alert.alert('Save failed', e.message),
});
```

**8. `src/hooks/usePreferences.ts:38` — Upsert error silently discarded; save failures are invisible**
```typescript
await supabase.from('profiles').upsert({ user_id: session.user.id, ... });
```
Supabase client methods return `{ data, error }` — they never throw. The destructured `error` is not inspected here. If the upsert fails for any reason (RLS rejection, constraint violation, network error), execution continues normally, `onSuccess` fires, and the user gets no feedback that their preferences were not saved.  
**Fix:**
```typescript
const { error } = await supabase.from('profiles').upsert({ ... });
if (error) throw error;
```

**9. `app/(tabs)/scan.tsx:58–66` — Profile preference changes not reflected after first load**
```tsx
const [prefsLoaded, setPrefsLoaded] = useState(false);
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    setWineTypes(savedPreferences.wineTypes ?? []);
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```
Once `prefsLoaded` becomes `true`, all subsequent changes to `savedPreferences` are ignored. A user who edits their regional or varietal preferences in the Profile tab and returns to Scan will see and use stale values for the remainder of the session.  
**Fix:** Remove the `prefsLoaded` guard so the effect re-syncs on every preferences change.

**10. `src/services/recommender.ts:79–82` — Retry on duplicate grapes falls through to known-bad result**
```typescript
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data;
}
return parsed.data;  // ← returns the duplicate-grape result if retry also fails validation
```
If the retry response fails Zod validation, the function silently returns the original `parsed.data` — a recommendation the code already identified as violating the grape-diversity constraint. The user receives a silently broken result with no warning.  
**Fix:** After a failed retry, throw rather than fall through:
```typescript
throw new Error('Could not find a diverse recommendation. Please try again.');
```

**11. `app/(tabs)/profile.tsx:113` — Email-change deep link points to a non-existent route**
```tsx
const redirectTo = Linking.createURL('auth/callback');
```
This produces `pocket-som://auth/callback`. There is no `app/auth/callback.tsx` in the router. When the user taps the confirmation link in their inbox, the app opens but lands on an unhandled route — the user is left on a blank or redirected screen with no confirmation that the email change succeeded.  
**Fix:** Create `app/auth/callback.tsx` to handle the Supabase session exchange (see Navigation Issues item 4).

**12. `supabase/functions/ocr/index.ts:84` and `supabase/functions/recommend/index.ts:181` — Array access without length guard**
```typescript
const text = response.content[0].type === 'text' ? response.content[0].text : '';
```
Both functions access `response.content[0]` directly. If the Anthropic API returns an empty `content` array (possible on safety-blocked requests or certain error conditions), this throws `TypeError: Cannot read properties of undefined`, producing a 500 with a confusing stack trace instead of a meaningful error message.  
**Fix:**
```typescript
const block = response.content?.[0];
const text = block?.type === 'text' ? block.text : '';
if (!text) throw new Error('Empty response from Claude');
```

**13. `app/scan/preferences.tsx:28–34` — Dead screen calls `recommendWines` with missing required fields**
```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // Missing: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```
Five fields required by `RecommendInput` are absent. TypeScript would catch this in strict mode. The screen is also unreachable from any current navigation path but compiles into the bundle and represents a crash if ever navigated to via a deep link or future code change.  
**Fix:** Delete the file (see Navigation Issues item 1).

---

### LOW

**14. `src/api/claude.ts:17` — `JSON.parse(text)` throws an uncaught `SyntaxError` on non-JSON responses**  
If a Supabase infrastructure error returns an HTML error page (common during outages), `JSON.parse(text)` throws without a user-friendly message. The `!res.ok` check on line 16 catches HTTP error status codes, but a 200 response with an HTML body still reaches the parse call.  
**Fix:** Wrap `JSON.parse` in a try/catch and surface a descriptive error.

**15. `app/_layout.tsx` — No global React error boundary**  
There is no `ErrorBoundary` component anywhere in the component tree. Any unhandled render-time throw in a child — including null dereferences on malformed Claude responses — surfaces as a permanent white screen in production with no recovery path.  
**Fix:** Wrap the root layout children in a React error boundary that shows a "Something went wrong" screen with a retry option.

**16. `app/scan/camera.tsx:29–98` — No error handling around camera capture pipeline**  
`handleCapture` awaits `takePictureAsync`, two `ImageManipulator.manipulateAsync` calls, `Haptics.impactAsync`, and `router.push` with no try/catch. If any step throws (camera not ready, storage full, permissions revoked mid-session), the user is left staring at the camera viewfinder with no feedback and no way to recover.  
**Fix:** Wrap the entire body in try/catch and show an `Alert` on failure.

**17. `app/scan/extracting.tsx:144–152` — Two loading messages rendered simultaneously during `recommending` stage**  
During the `recommending` stage, both line 147 ("Scoring by critic rating, vintage quality and value") and lines 150–152 ("This may take a minute or two") render at the same time, producing redundant stacked copy.  
**Fix:** Remove the conditional block at lines 150–152 and consolidate into the first `Text` element.

**18. `app/_layout.tsx:10,24` — SplashScreen errors fully silenced**  
Both `SplashScreen.preventAutoHideAsync().catch(() => {})` and `SplashScreen.hideAsync().catch(() => {})` swallow errors entirely. Failures here (e.g., SDK version mismatch) are invisible in logs.  
**Fix:** At minimum log the error: `.catch((e) => console.warn('[SplashScreen]', e))`.

---

## Supabase and Edge Function Issues

**1. `supabase/migrations/001_initial_schema.sql:32–44` — `pricing_cache` has no RLS (MEDIUM)**  
`profiles` and `scan_sessions` both have RLS enabled. `pricing_cache` does not — the `alter table pricing_cache enable row level security` statement is absent. While the edge function writes via the service role (which bypasses RLS), an unintentional future `GRANT` on the anon or authenticated role would immediately expose all cached pricing data.  
**Fix:**
```sql
alter table pricing_cache enable row level security;
-- No SELECT policy needed — only the service role should access this table.
```

**2. `supabase/functions/ocr/index.ts` and `recommend/index.ts` — No auth check; anyone with the anon key can invoke at owner's API cost (MEDIUM)**  
Both functions accept any request bearing the Supabase anon key, which is committed in plaintext to `eas.json` (see Bugs item 1). An attacker can call these functions in a loop with arbitrary inputs, burning the owner's Anthropic API quota indefinitely. Neither function inspects the `Authorization` header for a valid user JWT.  
**Fix:** Add at the top of each function:
```typescript
const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(jwt ?? '');
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}
```
Note: `src/api/claude.ts` must also be updated to send `Authorization: Bearer <access_token>` (see item 3 below).

**3. `src/api/claude.ts:7–17` — Edge functions invoked without the user's JWT (MEDIUM)**
```typescript
headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY }
```
Only the anon key is sent — no `Authorization` header. The edge functions cannot identify the calling user, making per-user rate limiting impossible and blocking the auth fix above without a client-side change.  
**Fix:** Retrieve and attach the session token before invoking:
```typescript
const { data: { session } } = await supabase.auth.getSession();
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
};
if (session?.access_token) {
  headers['Authorization'] = `Bearer ${session.access_token}`;
}
```

**4. `supabase/migrations/001_initial_schema.sql` — `scan_sessions` table is never written to by the client (MEDIUM)**  
A search across all app code finds zero `insert` or `upsert` calls targeting `scan_sessions`. Every scan result lives only in the Zustand store and is lost when the app is closed. The History tab queries this table on every render, finds nothing, and always displays the "No scans yet" empty state — making the entire History feature non-functional.  
**Fix:** Add an insert to `scan_sessions` inside `app/scan/extracting.tsx` after `setRecommendation` succeeds:
```typescript
await supabase.from('scan_sessions').insert({
  user_id: session.user.id,
  extracted_wines: wines,
  recommendation,
  preferences_snapshot: preferences,
});
```

**5. `supabase/functions/recommend/index.ts:139,154` — Budget prompt hardcodes `£` regardless of user currency (MEDIUM)**
```typescript
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
// and:
`- Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```
The currency symbol is always `£`. For users at restaurants pricing in EUR, USD, or any other currency, the model receives a contradictory brief (e.g., "budget is £200" while the wine list shows `$200`). This causes the budget hard rule to be applied incorrectly.  
**Fix:** Pass `currency` through `ScanPreferences` and substitute it into the prompt dynamically.

**6. `supabase/functions/ocr/index.ts:54` — URL content silently truncated at 12,000 characters (LOW)**
```typescript
const pageText = stripHtml(html).slice(0, 12000);
```
For long restaurant wine lists, wines near the bottom of the page are silently excluded from extraction with no warning to the user or in the response body.  
**Fix:** Either increase the cap or include a `truncated: true` flag in the response so the client can warn the user.

**7. `supabase/functions/wine-searcher-proxy/index.ts:82–87` — Proxy returns HTTP 200 on all errors (LOW)**
```typescript
return new Response(
  JSON.stringify({ source: 'unavailable', averageMarketPrice: null, ... }),
  { status: 200 }
);
```
Every error — API key not configured, rate limit hit, network failure — returns 200. The client cannot distinguish a legitimate "no data" response from a broken integration. Real errors in production are invisible in monitoring.  
**Fix:** Return 200 only when the wine is genuinely not found in the Wine-Searcher index. Use 502 or 503 for proxy failures.

---

## UX and Performance Issues

**1. `app/(tabs)/history.tsx:12–78` — History feature is completely non-functional (HIGH)**  
Two independent bugs cause this:  
(a) `scan_sessions` is never written to (Supabase item 4), so every user sees the "No scans yet" empty state regardless of how many scans they've done.  
(b) Even if the table were populated, the wine name at line 71 accesses `item.recommendation?.topPick?.name`, which is always `undefined` because `topPick` is not a field on `RecommendationResponse` (see Bugs item 3).  
Both must be fixed independently for the feature to work.

**2. `app/(tabs)/history.tsx:64` — History cards have no `onPress` handler (MEDIUM)**
```tsx
<TouchableOpacity style={styles.card}>
```
Every card highlights on press (giving the affordance of being interactive) but does nothing. There is no route or screen to view a past recommendation.  
**Fix:** Either implement a detail view at `/scan/history/[id]` or replace `TouchableOpacity` with `View` to remove the false affordance.

**3. `app/(tabs)/scan.tsx:58–66` — Profile changes not reflected until app restart (MEDIUM)**  
See Bugs item 9. A user who edits their regional or varietal preferences in the Profile tab and returns to Scan continues to see and use their stale initial values.

**4. `app/scan/extracting.tsx:155–159` — On-screen copy references non-existent filter controls (LOW)**
```tsx
<Text style={styles.profileNote}>
  We're making a recommendation based on your profile preferences. Change your preferences
  for this result only by setting filters for this search.
</Text>
```
"Setting filters for this search" implies an in-context UI that does not exist on this screen. The user is looking at a spinner with no controls.  
**Fix:** Remove or rewrite the copy to remove the misleading call to action.

**5. `app/(tabs)/profile.tsx:153` — Copy implies a subscription model that does not exist (LOW)**
```tsx
<Text style={styles.emailLabel}>Change your subscription email account</Text>
```
The word "subscription" suggests a paid tier. If no subscription model exists, this creates confusion and may set false expectations.  
**Fix:** Change to "Change your email address".

**6. `app/(tabs)/profile.tsx:182` — Back button pushes a new Scan screen instead of navigating back (LOW)**
```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```
`router.push` adds a new entry to the navigation stack. In a tab navigator the correct idiom is to let the tab bar handle tab switching; adding a redundant push button here can leave orphaned history entries.  
**Fix:** Remove this custom back button. The tab bar already provides navigation to Scan.

**7. `src/components/results/PricingBadge.tsx` and `src/components/results/WineRecommendationCard.tsx` — Fully implemented but unused components (LOW)**  
Neither component is imported anywhere in `app/`. `results.tsx` implements its own inline accordion UI. These files add dead code maintenance overhead and give a misleading impression of the app's capabilities (e.g., `PricingBadge` implies market price comparison is shown to users, but it is not).  
**Fix:** Delete both files, or wire them into `results.tsx`.

**8. `src/constants/vintageCharts.ts` — Placeholder file; lookup always returns null (LOW)**
```typescript
export const VINTAGE_CHARTS: Record<string, Record<number, number>> = {};
```
`lookupVintageScore` always returns `null`. The file gives a false impression that a local vintage data lookup system exists.  
**Fix:** Either populate with real data or delete the file.

---

## Navigation Issues

**1. `app/scan/preferences.tsx` — Unreachable route with a compile error (LOW)**  
No screen, button, or link in the app navigates to `/scan/preferences`. The file is an orphan, likely superseded by the inline preference accordions in `scan.tsx`. It also contains the TypeScript error documented in Bugs item 13 (five missing required fields in the `recommendWines` call).  
**Fix:** Delete the file.

**2. `app/scan/url.tsx` — Feature stub that immediately redirects (LOW)**
```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```
The OCR edge function fully supports URL-based wine list input (HTML fetch + strip), but the client UI was never implemented. The route exists and causes a redirect if reached via deep link.  
**Fix:** Either build the URL input screen or delete this file and remove the URL handling branch from the OCR edge function.

**3. `app/(tabs)/history.tsx:64` — Interactive history cards lead nowhere (MEDIUM)**  
See UX item 2. `TouchableOpacity` with no `onPress` gives false interaction affordance and dead-ends the user with a visual tap response but no outcome.

**4. No `auth/callback` route for deep link handling (MEDIUM)**  
The email-change flow in `profile.tsx` generates `pocket-som://auth/callback` via `Linking.createURL`. This path is not defined anywhere in the router. When the user taps the confirmation link in their inbox, the app opens but has no handler — the user lands on a blank or root-redirected screen.  
**Fix:** Create `app/auth/callback.tsx`:
```tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../src/api/supabase';

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/(tabs)/scan');
    });
    return () => subscription.unsubscribe();
  }, []);
  return null;
}
```

---

## Summary

| Severity | Bugs & Crashes | Supabase / Edge Functions | UX & Performance | Navigation |
|----------|---------------|--------------------------|-----------------|------------|
| HIGH     | 4             | 0                        | 1               | 0          |
| MEDIUM   | 9             | 4                        | 2               | 2          |
| LOW      | 5             | 3                        | 5               | 2          |
| **Total**| **18**        | **7**                    | **8**           | **4**      |

**Highest priority — unfixed for 63+ consecutive daily reviews:**

1. **`eas.json`** — Rotate the exposed Supabase anon key immediately. Credentials are live, in git, and public to anyone with repo access.
2. **`supabase/functions/ocr/index.ts:51`** — Fix the SSRF vulnerability. The URL code path accepts arbitrary server-side fetch targets including cloud metadata endpoints.
3. **`app/(tabs)/history.tsx`** — The History feature is entirely non-functional. Two independent bugs (no `scan_sessions` inserts; wrong `topPick` property access) must both be fixed.
4. **`app/scan/results.tsx:22`** — Move `router.replace` into a `useEffect`. Calling navigation during render is illegal in React's concurrent mode.
5. **`src/hooks/usePreferences.ts:38`** — Check the upsert `error` return value. Save failures are currently completely invisible to the user.
6. **`app/onboarding.tsx:38`** — Await the preferences save before navigating. On slow or failing networks, onboarding choices are silently lost.
