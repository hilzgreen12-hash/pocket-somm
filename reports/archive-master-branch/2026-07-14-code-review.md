# Pocket Somm — Code Review
**Date:** 2026-07-14  
**Reviewer:** Automated (Claude)  
**Scope:** Full codebase — `app/`, `src/`, `supabase/functions/`, `supabase/migrations/`

> **Status note:** No application code has been committed since the initial codebase was created. The only commits between the 2026-07-13 review and today added that report file and a `test.md` file. This is the 64th consecutive daily review in which every finding below has been present and unfixed. The highest-priority items are flagged at the bottom of this report.

---

## Bugs and Crashes

### HIGH

**B-H1 — `eas.json:8–9` — Live Supabase credentials committed to version control**  
`eas.json` contains a plaintext Supabase project URL and anon key in the `preview.env` block, both tracked in git. Anyone with repository read access can call the Supabase REST API, invoke Edge Functions under the anon role, and trigger the OCR and recommend functions at the owner's expense with no attribution. The `.gitignore` excludes `.env` files but not `eas.json`.  
**Fix:** Rotate the exposed anon key immediately. Replace `env` values in `eas.json` with EAS Secrets (`eas secret:create`) or CI environment variables and remove all credential literals from the committed file.

**B-H2 — `app/scan/results.tsx:22–25` — `router.replace()` called imperatively in the render body**
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
Navigation side-effects must not be triggered during render. In React's concurrent renderer this causes "Cannot update a component (`ExpoRouter`) while rendering a different component (`ResultsScreen`)" warnings and can produce double-navigation or an infinite render loop.  
**Fix:**
```tsx
useEffect(() => {
  if (!recommendation) router.replace('/(tabs)/scan');
}, [recommendation]);
if (!recommendation) return null;
```

**B-H3 — `app/(tabs)/history.tsx:71` — `topPick` property does not exist on `RecommendationResponse`**
```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```
`RecommendationResponse` (`src/types/wine.ts:50–53`) is `{ wines: WineRecommendation[], summary: string }`. There is no `topPick` field. This expression is always falsy and no wine name is ever shown on any history card.  
**Fix:** Replace with `item.recommendation?.wines?.[0]?.name`.

**B-H4 — `supabase/functions/ocr/index.ts:51` — Server-Side Request Forgery (SSRF) via unvalidated URL parameter**
```typescript
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
`url` is taken verbatim from the caller's request body with no scheme check or IP-range blocklist. Any caller with the public anon key (which is in plaintext in `eas.json` — see B-H1) can POST `{ "url": "http://169.254.169.254/latest/meta-data/" }` and receive internal cloud infrastructure responses.  
**Fix:**
```typescript
const parsed = new URL(url);
if (parsed.protocol !== 'https:') throw new Error('Only HTTPS URLs are accepted');
// Also reject RFC-1918 and link-local ranges after DNS resolution.
```

---

### MEDIUM

**B-M1 — `src/hooks/useAuth.tsx:17` — `getSession()` rejection unhandled; app shows blank screen permanently**
```typescript
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```
No `.catch()` is attached. If `getSession()` rejects (network error, malformed token in `SecureStore`, SDK exception), `setLoading(false)` is never called and the app renders a blank screen indefinitely. `app/index.tsx:16` returns `null` while `loading === true`.  
**Fix:** Add `.catch(() => setLoading(false))`.

**B-M2 — `app/index.tsx:19–21` — New authenticated users bypass onboarding due to `undefined` vs. `null` race**
```tsx
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```
`usePreferences()` returns `undefined` (not `null`) while the React Query fetch is in-flight. During that window, `preferences === null` is `false` and a brand-new user with no profile row is sent to `/(tabs)/scan`, skipping onboarding entirely.  
**Fix:** Expose `isLoading` from `usePreferences()` and hold the decision:
```tsx
const { preferences, isLoading: prefsLoading } = usePreferences();
if (loading || hasLaunched === null || (session && prefsLoading)) return null;
```

**B-M3 — `app/onboarding.tsx:38–47` — Preferences save is fire-and-forget; navigation proceeds before data is persisted**
```tsx
updatePreferences({ wineTypes, styleProfiles, ... });
router.replace('/(tabs)/scan');
```
`updatePreferences` is `mutation.mutate`, which returns `void`. Navigation fires on the next line while the network call is still in-flight. On a slow or failing connection, the user arrives at the scan screen with their onboarding choices silently discarded.  
**Fix:** Use `mutateAsync` with `await` and place navigation in `onSuccess`:
```tsx
mutation.mutate(prefs, {
  onSuccess: () => router.replace('/(tabs)/scan'),
  onError: (e) => Alert.alert('Could not save preferences', e.message),
});
```

**B-M4 — `src/hooks/usePreferences.ts:38` — Supabase upsert error is silently discarded**
```typescript
await supabase.from('profiles').upsert({ user_id: session.user.id, ... });
```
Supabase client methods return `{ data, error }` and do not throw. The returned `error` is not inspected here. If the upsert fails for any reason (RLS rejection, constraint violation, network error), execution continues to `onSuccess` and the user receives no feedback that their preferences were not saved.  
**Fix:**
```typescript
const { error } = await supabase.from('profiles').upsert({ ... });
if (error) throw error;
```

**B-M5 — `app/(tabs)/scan.tsx:58–66` — Profile preference changes not reflected after first load**
```tsx
if (savedPreferences && !prefsLoaded) {
  setWineTypes(savedPreferences.wineTypes ?? []);
  setPrefsLoaded(true);
}
```
Once `prefsLoaded` becomes `true`, all subsequent changes to `savedPreferences` are ignored. A user who edits preferences in the Profile tab and returns to Scan will see and use stale values for the rest of the session.  
**Fix:** Remove the `prefsLoaded` guard so the effect re-syncs on every `savedPreferences` change.

**B-M6 — `app/(auth)/sign-in.tsx:12–20` — `loading` stuck permanently if auth call throws**  
If `signInWithPassword` throws (network timeout, SDK error), the `try`-less async path leaves `setLoading(false)` unreached and the button is permanently disabled.  
**Fix:** Move `setLoading(false)` into a `finally` block.

**B-M7 — `app/(auth)/sign-up.tsx:12–13` — `setLoading(true)` is never called**  
`loading` is initialised to `false` and never set to `true`. The "Creating account…" label never appears and `disabled={loading}` never activates, allowing multiple parallel `signUp` calls from rapid taps.  
**Fix:** Add `setLoading(true)` as the first statement in `handleSignUp` and move `setLoading(false)` into a `finally` block.

**B-M8 — `app/scan/extracting.tsx:77` — `Promise.all` for multi-image OCR discards all results on any single failure**
```tsx
const results = await Promise.all(imageUris.map(extractWineList));
```
If one image fails, `Promise.all` rejects immediately and discards wines successfully extracted from the other images. The user sees "No wines were detected" with no indication that other uploads succeeded.  
**Fix:** Replace with `Promise.allSettled`, filter fulfilled results, and surface a partial-success notice.

**B-M9 — `app/scan/camera.tsx:29–98` — No concurrent-capture guard**  
`handleCapture` is async with no lock. A double-tap before `takePictureAsync` resolves launches two parallel pipelines, both calling `router.push('/scan/preview')`.  
**Fix:** Add an `isCapturing` ref that returns early if already `true`.

**B-M10 — `app/scan/camera.tsx:29–98` — No error handling around capture pipeline**  
`takePictureAsync` and both `manipulateAsync` calls are awaited with no `try/catch`. Hardware errors or storage-full conditions produce unhandled rejections and a frozen camera UI.  
**Fix:** Wrap the entire function body in `try/catch` and show an `Alert` on failure.

**B-M11 — `src/services/recommender.ts:79–82` — Grape-diversity retry silently falls through to a known-bad result**
```typescript
if (parsed2.success) return parsed2.data;
// falls through:
return parsed.data;  // the duplicate-grape result
```
If the strict-diversity retry also fails Zod validation, the function silently returns the original result that was already identified as violating the grape-diversity constraint.  
**Fix:** After a failed retry, throw rather than fall through.

**B-M12 — `app/(tabs)/profile.tsx:113` — Email-change deep link targets a non-existent route**
```tsx
const redirectTo = Linking.createURL('auth/callback');
```
No `app/auth/callback.tsx` exists. When the user taps the confirmation link in their inbox, the app opens but lands on an unmatched route with no confirmation that the email change succeeded. See Navigation N4.

**B-M13 — `app/(tabs)/profile.tsx:110–128` — `emailSaving` permanently stuck if `updateUser` throws**  
If `supabase.auth.updateUser` throws, `setEmailSaving(false)` is skipped. The Confirm button shows a permanent `ActivityIndicator` until the app is killed.  
**Fix:** Move `setEmailSaving(false)` into a `finally` block.

**B-M14 — `supabase/functions/ocr/index.ts:84` and `recommend/index.ts:181` — `content[0]` accessed without array-length guard**
```typescript
const text = response.content[0].type === 'text' ? response.content[0].text : '';
```
If the Anthropic API returns an empty `content` array (possible on safety-blocked requests), `response.content[0]` is `undefined` and `.type` throws `TypeError`.  
**Fix:**
```typescript
const block = response.content?.[0];
const text = block?.type === 'text' ? block.text : '';
if (!text) throw new Error('Empty response from Claude');
```

**B-M15 — `app/index.tsx:13` — `AsyncStorage.getItem` rejection unhandled; blank screen on storage error**
```tsx
AsyncStorage.getItem('hasLaunched').then((v) => setHasLaunched(v === 'true'));
```
No `.catch()`. If AsyncStorage throws, `hasLaunched` stays `null` and `app/index.tsx:16` returns `null` indefinitely.  
**Fix:** Add `.catch(() => setHasLaunched(false))`.

**B-M16 — `app/scan/extracting.tsx:99–117` — Empty wine list after pre-filtering passed unchecked to `recommendWines`**  
Strict budget or dislike filters can reduce `winesForRecommend` to `[]`. There is no guard before `recommendWines` is called with an empty array. The model may hallucinate wines and the user sees a results screen with no explanation.  
**Fix:** Guard and show a user-facing error if `winesForRecommend.length === 0`.

**B-M17 — `app/(tabs)/history.tsx` — Query error renders misleading "No scans yet" empty state**  
`isError` is not destructured from `useQuery`. When the Supabase query fails, `sessions` is `undefined` and the component renders the empty-state copy instead of an error message.  
**Fix:** Destructure `isError` and render a distinct error state.

**B-M18 — `app/scan/preferences.tsx:28–34` — Orphaned screen calls `recommendWines` with five missing required fields**  
This screen is unreachable from any navigation path (see N1). It also omits `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` from the `RecommendInput` payload, sending `undefined` for all exclusion and favourite fields. TypeScript strict mode would flag this.  
**Fix:** Delete the file.

---

### LOW

**B-L1 — `app/_layout.tsx:15` — Font loading error discarded; app hangs on blank screen**  
`Font.useFonts` returns `[boolean, Error | null]`. The error element is ignored. If any font fails to load, `fontsLoaded` stays `false` permanently and the app never renders.  
**Fix:** Destructure and handle the error value.

**B-L2 — `src/types/preferences.ts:6` — `defaultBudget: number` declared non-nullable, returned as `null` at runtime**  
`usePreferences.ts:26` returns `defaultBudget: data.default_budget ?? null`. The type mismatch is hidden by `as UserPreferences` at line 31, causing silent downstream null-access errors in TypeScript.

**B-L3 — `src/api/claude.ts:17` — `JSON.parse` throws uncaught `SyntaxError` on non-JSON responses**  
If Supabase returns an HTML error page during an outage, `JSON.parse(text)` throws a `SyntaxError` with raw HTML as the message rather than a user-friendly error.  
**Fix:** Wrap in try/catch.

**B-L4 — `app/_layout.tsx:10,24` — SplashScreen errors completely silenced**  
Both `.catch(() => {})` blocks swallow all errors with no logging. A version-mismatch crash here is invisible in analytics.  
**Fix:** At minimum log: `.catch((e) => console.warn('[SplashScreen]', e))`.

**B-L5 — `app/(tabs)/scan.tsx:86–101` — `handleScreenshot` has no error handling**  
`launchImageLibraryAsync` is called without `try/catch`. On some Android versions or after permission revocation mid-session the call throws, producing an unhandled rejection.

---

## Supabase and Edge Function Issues

**S1 — `eas.json:8–9` — Supabase anon key committed in plaintext (HIGH, see B-H1)**  
The key exposed here is used as the sole credential to call all three Edge Functions (see S3). Rotate immediately.

**S2 — `supabase/migrations/001_initial_schema.sql:27–31` — `scan_sessions` table is never written to (HIGH)**  
A search across all application code finds zero `insert` or `upsert` calls targeting `scan_sessions`. Every scan result lives only in the Zustand store and is lost when the app closes. The History tab queries this table on every render, always finds nothing, and permanently shows "No scans yet".  
**Fix:** Insert into `scan_sessions` inside `app/scan/extracting.tsx` after `setRecommendation` succeeds.

**S3 — `supabase/functions/ocr/index.ts` and `recommend/index.ts` — No user auth check; callable by anyone with the anon key (MEDIUM)**  
Neither function inspects the `Authorization` header for a valid user JWT. Combined with B-H1 (anon key in plaintext in git), any party with read access to the repo can invoke OCR and recommend at the owner's Anthropic API cost, indefinitely and with no attribution.  
**Fix:** Add `supabase.auth.getUser(jwt)` at the top of each function and return 401 if no valid session.

**S4 — `src/api/claude.ts:7–17` — Edge functions invoked without the user's JWT (MEDIUM)**
```typescript
headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY }
```
Only the anon key is sent. No `Authorization: Bearer <access_token>` header is included, blocking any future server-side auth check (see S3) without a client-side change.  
**Fix:** Retrieve and attach the session token, or switch to `supabase.functions.invoke()` which attaches it automatically.

**S5 — `supabase/migrations/001_initial_schema.sql:32–44` — `pricing_cache` has no Row Level Security (MEDIUM)**  
`profiles` and `scan_sessions` both have RLS enabled. `pricing_cache` does not. Any caller with the anon key can read or overwrite cached pricing data via the Supabase REST API, poisoning value-score estimates shown to all users.  
**Fix:**
```sql
alter table pricing_cache enable row level security;
```

**S6 — `supabase/functions/recommend/index.ts:139,154` — Budget constraint hardcodes `£` regardless of restaurant currency (MEDIUM)**  
Both the hard-rule line and the diner-context line embed `£` unconditionally. For EUR or USD menus the model receives a contradictory brief and may misapply the budget filter.  
**Fix:** Pass `currency` through `ScanPreferences` and substitute it dynamically into the prompt.

**S7 — `supabase/migrations/001_initial_schema.sql:27–31` — `scan_sessions` INSERT policy has no explicit `WITH CHECK` (MEDIUM)**  
`FOR ALL` with only `USING` relies on PostgreSQL's implicit `WITH CHECK` defaulting to the `USING` expression. Future policy regeneration or tooling could silently drop the insert-time guard.  
**Fix:** Add explicit `WITH CHECK (auth.uid() = user_id)`.

**S8 — `supabase/functions/recommend/index.ts` — Current date not injected; model infers drinking windows from training cutoff (MEDIUM)**  
The system prompt instructs the model to evaluate drinking windows "as of today's date" but the actual date is never provided. The model guesses based on training data, which may be 1–2 years behind.  
**Fix:** Inject `new Date().toISOString().slice(0, 10)` into the user message.

**S9 — `supabase/functions/wine-searcher-proxy/index.ts:68–75` — Upsert failure silently ignored (LOW)**  
The cache write result is not checked. On failure the function returns pricing data but the cache is not populated, silently burning Wine-Searcher API quota on every subsequent request for the same wine.

**S10 — `supabase/functions/wine-searcher-proxy/index.ts:82–87` — Proxy returns HTTP 200 on all errors (LOW)**  
Every error condition (missing API key, rate limit, network failure) returns `status: 200` with `source: 'unavailable'`. The client cannot distinguish a legitimate "not found" result from a broken integration.  
**Fix:** Return 502 or 503 for proxy failures; reserve 200 for genuine "wine not indexed" results.

**S11 — `supabase/functions/ocr/index.ts:54` — URL content silently truncated at 12,000 characters (LOW)**  
Wines near the bottom of long wine list pages are silently excluded from extraction.  
**Fix:** Include a `truncated: true` flag in the response so the client can warn the user.

**S12 — `supabase/functions/ocr/index.ts` and `recommend/index.ts` — No CORS headers (LOW)**  
Neither function returns `Access-Control-Allow-Origin` or handles preflight `OPTIONS` requests. Any Expo Web build will fail with CORS errors on every OCR and recommend call.

**S13 — `supabase/functions/ocr/index.ts` — No request size limit on image payload (LOW)**  
The edge function places no cap on the base64 payload size. The client resizes to 1600 px, but a misconfigured or malicious client can send an arbitrarily large image, consuming Supabase function resources.

---

## UX and Performance Issues

**U1 — `app/(tabs)/history.tsx` — History feature is entirely non-functional (HIGH)**  
Two independent bugs make it permanently broken:  
(a) `scan_sessions` is never written to (S2) — every user always sees "No scans yet".  
(b) `item.recommendation?.topPick?.name` (line 71) is always `undefined` because `topPick` is not a field on `RecommendationResponse` (B-H3) — wine names would never appear even if the table were populated.

**U2 — `app/onboarding.tsx:144` — Skipping onboarding traps authenticated users in an infinite onboarding loop (MEDIUM)**  
"Skip for now" navigates to `/(tabs)/scan` without creating a profile row. On the next cold start, `usePreferences` returns `null` (no row found) and `app/index.tsx:20` redirects back to `/onboarding`. The loop is unbreakable without completing onboarding.  
**Fix:** Upsert an empty preferences row before navigating from the skip button.

**U3 — `app/(tabs)/history.tsx:64` — History cards give interactive affordance but have no `onPress` handler (MEDIUM)**
```tsx
<TouchableOpacity style={styles.card}>
```
Users see a tap-highlight response but nothing happens. No detail route exists.  
**Fix:** Either implement `/scan/history/[id]` or replace `TouchableOpacity` with `View`.

**U4 — `app/(tabs)/scan.tsx` — Scan tab preferences stale after in-session profile edits (MEDIUM — see B-M5)**

**U5 — `app/scan/extracting.tsx:144–152` — Two loading messages rendered simultaneously during the recommending stage (LOW)**  
When `stage === 'recommending'`, both "Scoring by critic rating, vintage quality and value" (line 147) and "This may take a minute or two" (lines 150–152) appear at the same time — redundant stacked copy.  
**Fix:** Remove the second conditional block.

**U6 — `app/scan/extracting.tsx:155–159` — Copy references filter controls that do not exist on screen (LOW)**
```tsx
"Change your preferences for this result only by setting filters for this search."
```
There are no filter controls on the extracting screen. This creates a false affordance.  
**Fix:** Remove or rewrite the sentence.

**U7 — `app/(tabs)/profile.tsx:153` — "subscription email account" copy implies a paid tier that does not exist (LOW)**
```tsx
<Text style={styles.emailLabel}>Change your subscription email account</Text>
```
**Fix:** Change to "Change your email address".

**U8 — `app/(tabs)/profile.tsx:182` — Back button pushes a new Scan entry onto the stack instead of navigating back (LOW)**
```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
```
`router.push` adds a stack entry. The tab bar already provides switching. This creates navigation debt on every press.  
**Fix:** Remove the button; the tab bar handles this.

**U9 — `src/components/results/PricingBadge.tsx` and `WineRecommendationCard.tsx` — Fully implemented but unused (LOW)**  
Neither component is imported anywhere. They add maintenance overhead and give a misleading impression of the app's feature surface.  
**Fix:** Delete or wire into `results.tsx`.

**U10 — `src/constants/vintageCharts.ts` — Empty placeholder; `lookupVintageScore` always returns `null` (LOW)**  
`VINTAGE_CHARTS` is an empty object. The function that queries it always returns `null`. The file gives a false impression that local vintage lookup exists.  
**Fix:** Populate with real data or delete the file.

**U11 — `app/scan/camera.tsx` — No back/cancel button; Android users cannot exit the camera (LOW)**  
`CameraOverlay` has no dismiss affordance. `CameraOverlay.tsx:52` includes `paddingTop: 80`, leaving space for a close button that was never added.  
**Fix:** Add an `×` icon calling `router.back()` at the top-left of the overlay.

**U12 — `app/(tabs)/history.tsx:40–45` — History loading text invisible on dark background (LOW)**
```tsx
<Text style={typography.body}>Loading history…</Text>
```
`typography.body` only sets `fontSize` and `lineHeight`. The text inherits black on the terracotta background.  
**Fix:** Apply `color: colors.textMuted`.

---

## Navigation Issues

**N1 — `app/scan/preferences.tsx` — Unreachable orphaned screen (LOW)**  
No screen, button, or link in the codebase navigates to `/scan/preferences`. It is superseded by the inline preference accordions in `scan.tsx`. It also contains the TypeScript error in B-M18.  
**Fix:** Delete the file.

**N2 — `app/scan/url.tsx` — Feature stub that immediately redirects (LOW)**
```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```
The OCR edge function fully supports URL-based wine list input, but the client UI was never built. Any deep link to `/scan/url` silently drops the user.  
**Fix:** Build the URL input screen or delete this file and remove the URL branch from the OCR edge function.

**N3 — `app/(tabs)/history.tsx:64` — Interactive cards dead-end the user (MEDIUM — see U3)**

**N4 — No `app/auth/callback.tsx` route for email-change confirmation link (MEDIUM)**  
`profile.tsx:113` generates `pocket-som://auth/callback` via `Linking.createURL`. This path is not declared in the router. When the user taps the confirmation link in their inbox, the app opens on an unmatched route with no session exchange or confirmation feedback.  
**Fix:** Create `app/auth/callback.tsx`:
```tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../src/api/supabase';

export default function AuthCallback() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/(tabs)/scan');
    });
    return () => subscription.unsubscribe();
  }, []);
  return null;
}
```

**N5 — No `/history/[id]` route to view a past recommendation (LOW)**  
History cards show a date and restaurant name. There is no detail view — tapping shows no more information. History is visually present but has no actionable depth.

---

## Summary

| Severity | Bugs & Crashes | Supabase / Edge Functions | UX & Performance | Navigation | Total |
|----------|---------------|--------------------------|-----------------|------------|-------|
| HIGH     | 4             | 1                        | 1               | 0          | **6** |
| MEDIUM   | 14            | 5                        | 2               | 2          | **23** |
| LOW      | 5             | 6                        | 6               | 3          | **20** |
| **Total**| **23**        | **12**                   | **9**           | **5**      | **49** |

---

## Highest-Priority Unfixed Issues (64 consecutive reviews)

1. **`eas.json:8–9` (B-H1 / S1)** — Rotate the exposed Supabase anon key immediately. It is live, in version control, and provides unauthenticated access to all three Edge Functions.  
2. **`supabase/functions/ocr/index.ts:51` (B-H4)** — Fix the SSRF vulnerability. The URL code path accepts arbitrary server-side fetch targets including cloud metadata endpoints.  
3. **`src/hooks/usePreferences.ts:38` (B-M4)** — Check the upsert `error` return value. Preference saves fail silently with no user feedback.  
4. **`app/onboarding.tsx:38` (B-M3)** — Await the preferences save before navigating. On a failing network, onboarding data is discarded with no error shown.  
5. **`app/scan/results.tsx:22` (B-H2)** — Move `router.replace` into `useEffect`. Navigation during render is invalid in React's concurrent mode.  
6. **`app/(tabs)/history.tsx` (U1)** — The History feature is structurally broken in two independent ways: `scan_sessions` is never written to, and `topPick` is not a real field on `RecommendationResponse`. Both must be fixed for the feature to work at all.
