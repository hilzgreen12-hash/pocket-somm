# Pocket Somm — Code Review
**Date:** 2026-07-12  
**Reviewer:** Automated (Claude)  
**Scope:** Full codebase — app/, src/, supabase/functions/, supabase/migrations/

> **Note:** The majority of issues in this report were flagged in earlier reviews (the reports directory contains 60+ consecutive daily reviews). None of the issues marked as HIGH or MEDIUM in this report have been remediated in the codebase. This note is included so the reader understands this is not a fresh finding list — these are persistent, known defects.

---

## Bugs and Crashes

### HIGH

**1. `eas.json:9–10` — Live Supabase credentials committed to version control**  
The production Supabase project URL (`https://skwfykendnhnhhbdrfbr.supabase.co`) and anon key (`sb_publishable_wsa6cGlrAaULP_YA1JwDlQ_h-qaHTke`) are stored in plaintext inside `eas.json`, which is tracked by git. Anyone with repo access can call the Supabase REST API, invoke Edge Functions, and read/write data within the anon role's permissions. The `.gitignore` correctly excludes `.env` but does not exclude `eas.json`.  
**Fix:** Rotate the exposed anon key immediately. Replace the values with EAS Secrets or CI environment variables. Remove any plaintext credentials from committed files.

**2. `app/scan/results.tsx:22–25` — `router.replace()` called imperatively during render**  
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
Navigation is called unconditionally in the render body — outside any `useEffect`. This is illegal in React and can trigger "Cannot update a component while rendering a different component" warnings or silent failures in React Strict Mode and Expo Router's concurrent renderer.  
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
The `RecommendationResponse` type is `{ wines: WineRecommendation[], summary: string }`. There is no `topPick` property. This expression is always falsy; no wine name is ever shown on any history card.  
**Fix:** Replace with `item.recommendation?.wines?.[0]?.name`.

**4. `supabase/functions/ocr/index.ts:51` — Server-Side Request Forgery (SSRF)**  
```typescript
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
The edge function accepts a `url` field from the request body and fetches it server-side with no validation whatsoever. A caller can supply `http://169.254.169.254/` (cloud metadata), `http://localhost`, or internal Supabase service URLs to probe infrastructure unreachable from the public internet.  
**Fix:** Validate `url` is `https://` only and reject private/link-local IP ranges before fetching. Example:
```typescript
const parsed = new URL(url);
if (parsed.protocol !== 'https:') throw new Error('Only HTTPS URLs are accepted');
```

---

### MEDIUM

**5. `src/hooks/useAuth.tsx:17` — `getSession()` promise error unhandled; app hangs forever on failure**  
```typescript
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```
There is no `.catch()`. If `getSession()` rejects (network error, malformed response, Supabase client misconfiguration), `setLoading(false)` is never called, `loading` stays `true` forever, and the app displays a blank screen permanently.  
**Fix:**
```typescript
supabase.auth.getSession()
  .then(({ data }) => { setSession(data.session); setLoading(false); })
  .catch(() => setLoading(false));
```

**6. `app/index.tsx:19–21` — New signed-in users bypass onboarding due to undefined vs. null race**  
```tsx
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```
`usePreferences()` returns `undefined` (not `null`) while the query is in-flight. The guard `preferences === null` evaluates to `false` during loading, so a brand-new signed-in user with no profile row is sent directly to `/(tabs)/scan`, bypassing onboarding entirely, until a hard restart.  
**Fix:** Expose `isLoading` from `usePreferences()` and treat `undefined` as still-loading:
```tsx
const { preferences, isLoading: prefsLoading } = usePreferences();
if (loading || hasLaunched === null || (session && prefsLoading)) return null;
```

**7. `app/onboarding.tsx:38–47` — Save is fire-and-forget; navigation proceeds before data is persisted**  
```tsx
updatePreferences({ wineTypes, styleProfiles, ... });
router.replace('/(tabs)/scan');
```
`updatePreferences` is `mutation.mutate` — a fire-and-forget call. `router.replace` executes synchronously on the next line before the async save completes. On a slow or failing network, the user arrives at the scan screen with their onboarding choices silently lost.  
**Fix:** Use `mutateAsync` with `await`, or pass navigation into the mutation's `onSuccess`:
```tsx
mutation.mutate(prefs, {
  onSuccess: () => router.replace('/(tabs)/scan'),
  onError: (e) => Alert.alert('Save failed', e.message),
});
```

**8. `src/hooks/usePreferences.ts:38` — Upsert error is silently discarded; save failures are invisible**  
```typescript
await supabase.from('profiles').upsert({ user_id: session.user.id, ... });
```
Supabase client methods return `{ data, error }` — they never throw. The error is not destructured or inspected. If the upsert fails for any reason (RLS rejection, constraint violation, network error), execution continues normally, `onSuccess` fires, and the user gets no feedback that their preferences were not saved.  
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
Once `prefsLoaded` becomes `true`, any subsequent changes to `savedPreferences` (e.g., the user edits their profile in the Profile tab) are ignored. The Scan tab continues displaying and using the stale initial values for the rest of the session.  
**Fix:** Remove the `prefsLoaded` guard and sync directly on preference changes.

**10. `src/services/recommender.ts:79–82` — Retry on duplicate grapes falls through to known-bad result**  
```typescript
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data;
}
return parsed.data;  // returns the duplicate-grape result if retry fails validation
```
If the retry response also fails Zod validation, the function returns the original `parsed.data` — a recommendation the app already flagged as violating the grape-diversity constraint. The user receives a silently broken result.  
**Fix:** After retry failure, throw rather than return the invalid result.

**11. `app/(tabs)/profile.tsx:113` — Email-change deep link points to a non-existent route**  
```tsx
const redirectTo = Linking.createURL('auth/callback');
```
This produces `pocket-som://auth/callback`. There is no `app/auth/callback.tsx` route in the application. When the user taps the confirmation link in their inbox, the app opens but lands on an unhandled route.  
**Fix:** Create `app/auth/callback.tsx` to handle the Supabase session exchange, or redirect to `/(auth)/sign-in`.

**12. `supabase/functions/ocr/index.ts:84` and `supabase/functions/recommend/index.ts:181` — Array access without length guard**  
```typescript
const text = response.content[0].type === 'text' ? response.content[0].text : '';
```
Both functions access `response.content[0]` directly. If the Anthropic API returns an empty `content` array (possible on safety-blocked requests or certain error modes), this throws `TypeError: Cannot read properties of undefined`, producing a 500 with a confusing stack trace rather than a meaningful error.  
**Fix:**
```typescript
const block = response.content[0];
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
Five fields required by `RecommendInput` are absent — TypeScript would catch this (strict mode is on in `tsconfig.json`). The screen is also unreachable from any current navigation path, but it still compiles into the bundle and represents a crash if ever navigated to.  
**Fix:** Delete the file entirely (see Navigation Issues item 3).

---

### LOW

**14. `src/api/claude.ts:17` — `JSON.parse(text)` throws on non-JSON response bodies**  
If a Supabase infrastructure error returns an HTML error page instead of JSON (common during outages), `JSON.parse(text)` throws a `SyntaxError` that propagates without a user-friendly message. The `!res.ok` check on line 16 only catches HTTP error statuses — a 200 response with non-JSON body would still reach the parse call.  
**Fix:** Wrap `JSON.parse` in a try/catch and throw a descriptive error.

**15. `app/_layout.tsx` — No global error boundary**  
There is no `ErrorBoundary` anywhere in the component tree. Any unhandled render-time error in a child component will surface as a white screen in production with no recovery UI.  
**Fix:** Wrap the root layout children in a React error boundary that shows a "Something went wrong" screen with a retry option.

**16. `app/scan/camera.tsx:29–98` — No error handling around camera capture pipeline**  
`handleCapture` is async and calls `takePictureAsync`, two `ImageManipulator.manipulateAsync` calls, `Haptics.impactAsync`, and `router.push`. There is no try/catch around any of these. If any step throws (camera not ready, storage full, permissions revoked mid-session), the user is left staring at the camera viewfinder with no feedback.  
**Fix:** Wrap the body in try/catch and show an Alert on failure.

**17. `app/scan/extracting.tsx:144–152` — Two loading messages rendered simultaneously**  
During the `recommending` stage:
- Line 147: "Scoring by critic rating, vintage quality and value"
- Line 150–152: "This may take a minute or two"

Both are rendered at the same time, producing redundant stacked copy visible to the user.  
**Fix:** Remove the conditional block at lines 150–152 and consolidate the wait message into the first `Text`.

**18. `app/_layout.tsx:10,24` — SplashScreen errors fully silenced**  
Both `SplashScreen.preventAutoHideAsync().catch(() => {})` and `SplashScreen.hideAsync().catch(() => {})` suppress errors entirely with empty catch blocks.  
**Fix:** At minimum log the error: `.catch((e) => console.warn('[SplashScreen]', e))`.

---

## Supabase and Edge Function Issues

**1. `supabase/migrations/001_initial_schema.sql:32–44` — `pricing_cache` has no RLS (MEDIUM)**  
`profiles` and `scan_sessions` both have RLS enabled. `pricing_cache` does not — `alter table pricing_cache enable row level security` is absent. While the edge function writes via the service role (which bypasses RLS), leaving the table without RLS means any future grant on the anon role would expose it immediately.  
**Fix:**
```sql
alter table pricing_cache enable row level security;
-- No policy needed — only the service role should access this table.
```

**2. `supabase/functions/ocr/index.ts` and `recommend/index.ts` — No auth check; anyone with the anon key can invoke at the owner's API cost (MEDIUM)**  
Both functions accept any request bearing the Supabase anon key, which is committed in plaintext to `eas.json`. An attacker can invoke these functions in a tight loop with arbitrary inputs, burning the owner's Anthropic API quota indefinitely. Neither function checks the `Authorization` header for a valid user JWT.  
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
Only the anon key is sent — no `Authorization` header. The edge functions therefore cannot identify the calling user, making per-user rate limiting and the auth fix above impossible without changing this.  
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
The `scan_sessions` table has a full schema and RLS policy. A search across all app code (`app/`, `src/`) finds zero `insert` or `upsert` calls targeting this table. Every scan result lives only in the Zustand store and is lost when the app is closed. The History tab queries this table, finds nothing, and always displays the empty state.  
**Fix:** Add an insert to `scan_sessions` inside `extracting.tsx` after `setRecommendation` succeeds.

**5. `supabase/functions/recommend/index.ts:139` — Budget prompt hardcodes `£` regardless of user currency (MEDIUM)**  
```typescript
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```
And in the user context block (line 154):
```typescript
`- Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```
The currency symbol is always `£`. For users on EUR, USD, or any other currency, the model receives an internally contradictory brief (e.g., "budget is £200" while the wine list prices are in EUR). This would cause the budget hard rule to be applied incorrectly.  
**Fix:** Pass `currency` through `ScanPreferences` and substitute it into the prompt dynamically.

**6. `supabase/functions/ocr/index.ts:54` — URL content silently truncated at 12,000 characters (LOW)**  
```typescript
const pageText = stripHtml(html).slice(0, 12000);
```
For large restaurant wine lists, wines near the bottom of the page are silently excluded from extraction with no warning surfaced to the user or in the response.  
**Fix:** Either increase the cap (test against Claude's context limit) or include a `truncated: true` field in the response.

**7. `supabase/functions/wine-searcher-proxy/index.ts:82–87` — Proxy returns HTTP 200 on all errors (LOW)**  
```typescript
return new Response(
  JSON.stringify({ source: 'unavailable', averageMarketPrice: null, ... }),
  { status: 200 }
);
```
Every error condition — API key not configured, rate limit, network failure — returns 200. The client cannot distinguish a successful "no data" from a misconfigured or broken integration. Real errors in production are invisible.  
**Fix:** Return 200 only for the "no data found" case (e.g., wine not in Wine-Searcher index). Use 502 or 503 for genuine proxy failures.

---

## UX and Performance Issues

**1. `app/(tabs)/history.tsx:12–78` — History feature is completely non-functional (HIGH)**  
Two independent bugs cause this:  
(a) The `scan_sessions` table is never written to (Supabase item 4), so every user sees the "No scans yet" empty state regardless of how many scans they've done.  
(b) Even if the table were populated, the wine name display at line 71 accesses `item.recommendation?.topPick?.name`, which is always `undefined` because `topPick` is not a field on `RecommendationResponse`.  
Both must be fixed for the feature to work.

**2. `app/(tabs)/history.tsx:64` — History cards have no `onPress` handler (MEDIUM)**  
```tsx
<TouchableOpacity style={styles.card}>
```
Every card highlights on press (giving the affordance of being interactive) but does nothing. There is no route or screen to view a past recommendation.  
**Fix:** Either implement a detail view at `/scan/history/[id]` or replace `TouchableOpacity` with `View`.

**3. `app/(tabs)/scan.tsx:58–66` — Profile changes not reflected until app restart (MEDIUM)**  
See Bugs section item 9. A user who edits their regional preferences in the Profile tab and returns to the Scan tab will still see and use their old preferences.

**4. `app/scan/extracting.tsx:155–159` — On-screen copy references non-existent filter controls (LOW)**  
```tsx
<Text style={styles.profileNote}>
  We're making a recommendation based on your profile preferences. Change your preferences
  for this result only by setting filters for this search.
</Text>
```
"Setting filters for this search" implies an in-context UI that doesn't exist on this screen. The user is looking at a spinner with no way to change anything.  
**Fix:** Remove or rewrite the copy to remove the misleading reference.

**5. `app/(tabs)/profile.tsx:153` — Copy implies a subscription model that does not exist (LOW)**  
```tsx
<Text style={styles.emailLabel}>Change your subscription email account</Text>
```
The word "subscription" suggests a paid tier. If the app has no subscription, this creates confusion and may set false expectations.  
**Fix:** Change to "Change your email address".

**6. `app/(tabs)/profile.tsx:182` — Back button pushes a new Scan screen instead of navigating back (LOW)**  
```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```
`router.push` adds a new entry to the navigation stack. In a tab navigator, the correct approach is to use the tab bar for navigation between tabs, or `router.back()` to return to the previous screen.  
**Fix:** Remove this custom back button; the tab bar already provides navigation to Scan.

**7. `src/components/results/PricingBadge.tsx` and `src/components/results/WineRecommendationCard.tsx` — Fully implemented but unused components (LOW)**  
Neither component is imported anywhere in `app/`. The results screen (`app/scan/results.tsx`) implements its own inline accordion UI. These files add maintenance overhead and give a misleading picture of the app's capabilities (e.g., `PricingBadge` implies market price comparison is shown to users, but it is not).  
**Fix:** Delete both files, or wire them into `results.tsx`.

**8. `src/constants/vintageCharts.ts:13` — Placeholder file always returns null (LOW)**  
```typescript
export const VINTAGE_CHARTS: Record<string, Record<number, number>> = {};
```
`lookupVintageScore` always returns `null`. The file gives a false impression that a local vintage data lookup system exists. Vintage quality information comes entirely from Claude's response.  
**Fix:** Either populate with real data or delete the file.

---

## Navigation Issues

**1. `app/scan/preferences.tsx` — Unreachable route with a compile error (LOW)**  
No screen, button, or link in the app navigates to `/scan/preferences`. The file is an orphan, likely superseded by the inline preference accordions in `scan.tsx`. It also contains the TypeScript compile error documented in Bugs item 13 (missing required `RecommendInput` fields).  
**Fix:** Delete the file.

**2. `app/scan/url.tsx` — Feature stub that immediately redirects (LOW)**  
```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```
The OCR edge function fully supports URL-based wine list input (HTML fetch + strip), but the client UI was never built. The route exists and causes a redirect loop if reached via deep link.  
**Fix:** Either build the URL input screen or delete this file and remove URL handling from the edge function.

**3. `app/(tabs)/history.tsx:64` — Interactive history cards lead nowhere (MEDIUM)**  
See UX item 2. `TouchableOpacity` with no `onPress` gives false interaction affordance and dead-ends the user.

**4. No `auth/callback` route for deep link handling (MEDIUM)**  
Both the email-change flow in `profile.tsx` and any Supabase magic link or OAuth flow would route the user to `pocket-som://auth/callback`. This path is not defined anywhere in the router. The app opens on the deep link but has no handler — the user is either shown a blank screen or the root index redirect.  
**Fix:** Create `app/auth/callback.tsx`:
```tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../src/api/supabase';

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    // Supabase SDK processes the session from the URL automatically;
    // just redirect to the app once the session is ready.
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/(tabs)/scan');
    });
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

**Most urgent — none of these have been fixed across 60+ daily reviews:**

1. `eas.json` — Rotate the exposed Supabase anon key immediately (credentials are live and in git)
2. `supabase/functions/ocr/index.ts:51` — Fix SSRF; the URL code path accepts arbitrary server-side fetch targets
3. `app/scan/results.tsx:22` — Move `router.replace` into a `useEffect` (render-phase side effect)
4. `app/(tabs)/history.tsx:71` — Fix `topPick` → `wines[0]` and write `scan_sessions` inserts so history actually works
5. `src/hooks/usePreferences.ts:38` — Check the upsert error; save failures are currently completely invisible
6. `app/onboarding.tsx:38` — Await the save before navigating; preferences silently lost on slow networks
