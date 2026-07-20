# Pocket Somm — Code Review
**Date:** 2026-07-11  
**Reviewer:** Automated (Claude)  
**Scope:** Full codebase — app/, src/, supabase/functions/, supabase/migrations/

---

## Bugs and Crashes

### HIGH

**1. `eas.json:9,10` — Live Supabase credentials committed to git**  
`eas.json` is tracked by version control and contains the production Supabase URL and anon key in plaintext (`https://skwfykendnhnhhbdrfbr.supabase.co` / `sb_publishable_...`). The `.env.example` file also contains the same live keys, not example placeholders. Anyone with access to the repo can call the Supabase REST API, invoke Edge Functions, and read/write data within the anon role's permissions. The `.gitignore` correctly excludes `.env` but does not exclude `eas.json`.  
**Fix:** Rotate the exposed anon key immediately. Remove credentials from `eas.json` and `.env.example`. Store them in EAS Secrets or CI environment variables, not in committed files.

**2. `app/(tabs)/history.tsx:71` — Wrong data shape; wine name never shown in history**  
```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```
`RecommendationResponse` has the shape `{ wines: WineRecommendation[], summary: string }`. There is no `topPick` property. This expression is always falsy; the wine name is never rendered in any history card. Every history entry shows only the date and optional restaurant name.  
**Fix:** Replace with `item.recommendation?.wines?.[0]?.name`.

**3. `supabase/functions/ocr/index.ts:51` — Server-Side Request Forgery (SSRF) via unvalidated URL**  
```typescript
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
The OCR function accepts a `url` parameter from the request body and fetches it server-side with no validation. A caller can supply `http://169.254.169.254/` (cloud metadata), `http://localhost` (Deno runtime internals), or any internal Supabase service URL. The edge function environment may have access to internal services unreachable from the public internet.  
**Fix:** Validate `url` against an allowlist of schemes (`https://` only) and optionally a blocklist of private IP ranges before fetching. At minimum, enforce `https://` and reject URLs resolving to RFC-1918 addresses.

**4. `app/scan/results.tsx:23` — `router.replace()` called imperatively during render**  
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
Calling `router.replace()` directly in the render body (outside `useEffect`) is a React anti-pattern. It triggers a navigation side-effect during rendering, which can cause "Cannot update a component while rendering a different component" warnings and unpredictable behavior, particularly in React Strict Mode.  
**Fix:** Wrap in `useEffect`:
```tsx
useEffect(() => {
  if (!recommendation) router.replace('/(tabs)/scan');
}, [recommendation]);
if (!recommendation) return null;
```

---

### MEDIUM

**5. `app/index.tsx:19-21` — New signed-in users bypass onboarding due to async race**  
```tsx
if (session) {
  if (preferences === null) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/scan" />;
}
```
`usePreferences()` is async — during the brief window between `loading` becoming false (auth resolved) and the preferences query completing, `preferences` is `undefined`, not `null`. The guard `preferences === null` evaluates false, sending the user to `/(tabs)/scan`. A brand-new signed-in user with no profile row is routed to scan instead of onboarding until they hard-restart the app.  
**Fix:** Expose `isLoading` from `usePreferences()` and treat `undefined` as still-loading:
```tsx
const { preferences, isLoading: prefsLoading } = usePreferences();
if (loading || hasLaunched === null || (session && prefsLoading)) return null;
```

**6. `app/(tabs)/history.tsx:64` — History items are tappable but have no `onPress` handler**  
```tsx
<TouchableOpacity style={styles.card}>
```
All history list items highlight on press (giving the user visual feedback that they are interactive) but do nothing. There is no route or screen to view a past scan's full recommendation.  
**Fix:** Either add a route for viewing scan details and wire up `onPress`, or replace `TouchableOpacity` with `View` to remove the misleading interaction affordance.

**7. `app/scan/preferences.tsx:28-33` — `recommendWines` called with missing required fields**  
```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // Missing: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```
`RecommendInput` requires `wineTypes: string[]`, `favouriteRegions: string[]`, `favouriteGrapes: string[]`, `dislikedRegions: string[]`, `dislikedGrapes: string[]`. All five are absent. This is a TypeScript compile error (strict mode is enabled in `tsconfig.json`). If this screen were ever reached at runtime, the missing fields would be `undefined`, causing incorrect recommendations and potential edge function errors. Additionally, this screen appears to be unreachable — no navigation path leads to `/scan/preferences`.  
**Fix:** Either add the missing fields (pulling them from `usePreferences()`) or delete the file as dead code.

**8. `src/services/recommender.ts:79-82` — Duplicate-grape retry silently returns invalid result on second failure**  
```typescript
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data;
}
return parsed.data;  // <-- returns duplicate-grape result if retry also fails
```
If the retry response also fails Zod validation, execution falls through to `return parsed.data`, silently returning a recommendation the app already flagged as invalid. The user receives results that break the grape-diversity constraint with no error shown.  
**Fix:** After the retry fails, either throw an error or return `parsed2.data` if it at least parses partially. Do not silently return a known-bad result.

**9. `app/onboarding.tsx:38-43` — Preferences save is fire-and-forget; navigation proceeds regardless**  
```tsx
updatePreferences({ wineTypes, ... });
router.replace('/(tabs)/scan');
```
`updatePreferences` is a React Query mutation that fires asynchronously. `router.replace` is called immediately without waiting for the mutation to complete. If the save fails (e.g., network error), the user is navigated to the scan tab and sees no error. Their onboarding choices are silently lost.  
**Fix:** Use `mutateAsync` and `await` it, or use the mutation's `onSuccess` callback to trigger navigation:
```tsx
mutation.mutate(prefs, { onSuccess: () => router.replace('/(tabs)/scan'), onError: (e) => Alert.alert('Save failed', e.message) });
```

**10. `app/(tabs)/scan.tsx:59-66` — Profile preference changes not reflected after first tab load**  
```tsx
const [prefsLoaded, setPrefsLoaded] = useState(false);
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    setWineTypes(savedPreferences.wineTypes ?? []);
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```
`prefsLoaded` is set to `true` on the first successful sync. Subsequent changes to `savedPreferences` (e.g., the user edits their profile in the Profile tab and returns) are ignored. The scan tab continues to display and use the stale initial values.  
**Fix:** Remove the `prefsLoaded` guard. Only run the sync when the user hasn't made manual local changes:
```tsx
useEffect(() => {
  if (savedPreferences) {
    setWineTypes(savedPreferences.wineTypes ?? []);
    setStyleProfiles(savedPreferences.styleProfiles ?? []);
    setBudget(savedPreferences.defaultBudget ?? null);
  }
}, [savedPreferences?.wineTypes, savedPreferences?.styleProfiles, savedPreferences?.defaultBudget]);
```

**11. `src/hooks/usePreferences.ts:38-47` — Upsert result unchecked; save failures are silent**  
```typescript
await supabase.from('profiles').upsert({ user_id: session.user.id, ... });
```
The `upsert` call does not destructure `{ error }`, so any database error (constraint violation, RLS rejection, network failure) is silently dropped. The mutation's `onError` callback only fires if an exception is thrown, not for Supabase client errors returned as data.  
**Fix:**
```typescript
const { error } = await supabase.from('profiles').upsert({ ... });
if (error) throw error;
```

**12. `app/(tabs)/profile.tsx:113` — Email change redirect points to a non-existent route**  
```tsx
const redirectTo = Linking.createURL('auth/callback');
```
`Linking.createURL('auth/callback')` produces `pocket-som://auth/callback`. There is no `app/auth/callback.tsx` or equivalent route defined in the app. When the user taps the email-change confirmation link from their inbox, the deep link opens the app but lands on a non-existent route, likely falling through to the root index.  
**Fix:** Either create an `app/auth/callback.tsx` screen that handles the session exchange, or route to an existing screen (e.g., `/(auth)/sign-in`).

**13. `supabase/functions/recommend/index.ts:181` — `response.content[0]` accessed without length check**  
```typescript
const text = response.content[0].type === 'text' ? response.content[0].text : '';
```
If the Anthropic API returns a response with an empty `content` array (possible in edge cases such as safety blocks that produce no content), `response.content[0]` is `undefined` and this line throws, causing a 500 error with a confusing stack trace.  
**Fix:** Guard the access:
```typescript
const block = response.content[0];
const text = block?.type === 'text' ? block.text : '';
if (!text) throw new Error('Empty response from Claude');
```

---

### LOW

**14. `app/scan/extracting.tsx:144-152` — Two loading messages rendered simultaneously during recommendation stage**  
During the `recommending` stage, the first body `<Text>` renders "Scoring by critic rating, vintage quality and value" and immediately below, the conditional block renders "This may take a minute or two". Both are visible at the same time, producing redundant stacked copy.  
**Fix:** Remove the duplicate conditional block (lines 150-152) and include the wait copy directly in the `else` branch of the first `Text`.

**15. `app/scan/camera.tsx:15,110` — Tap-to-focus state is set but never applied**  
```tsx
const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);
// ...
onTouchEnd={handleTap}  // sets focusPoint
```
`focusPoint` is stored in state but never passed to `<CameraView>`. The `expo-camera` `CameraView` component does not expose a `focusPoint` prop in SDK 54; focus is only controllable via `autoFocus`. The tap gesture produces haptic feedback (none is called actually — only the capture does) but does not affect camera focus.  
**Fix:** Either remove the `focusPoint` state and tap handler, or implement focus using the supported API when available.

**16. `app/_layout.tsx:10` and `24` — SplashScreen errors silently swallowed**  
Both `SplashScreen.preventAutoHideAsync().catch(() => {})` and `SplashScreen.hideAsync().catch(() => {})` swallow errors completely. If splash screen operations fail, the user may see a flash of unstyled content with no diagnostic information.  
**Fix:** At minimum, log the error: `.catch((e) => console.warn('[SplashScreen]', e))`.

---

## Supabase and Edge Function Issues

**1. `supabase/migrations/001_initial_schema.sql:34-42` — `pricing_cache` has no RLS (MEDIUM)**  
The `profiles` and `scan_sessions` tables have RLS enabled with policies. `pricing_cache` does not — `alter table pricing_cache enable row level security` is absent. While the `anon` role has no implicit grants and the edge function uses the service role key to write, leaving RLS disabled is inconsistent with the security posture of the rest of the schema and makes the table vulnerable if any future policy inadvertently grants anon access.  
**Fix:**
```sql
alter table pricing_cache enable row level security;
-- No policies needed — only service role should read/write this table.
```

**2. `supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` — No authentication check; anyone with the anon key can invoke at the owner's API cost (MEDIUM)**  
Both edge functions accept any request bearing the Supabase anon key, which is embedded in the app bundle and visible to anyone who inspects it. An attacker can call these functions in a loop with arbitrary inputs, consuming the owner's Anthropic API quota. Neither function checks `req.headers.get('Authorization')` for a valid user JWT.  
**Fix:** Add an auth check at the top of each function:
```typescript
const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(jwt);
if (error || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
```
Note: `src/api/claude.ts` currently sends only `apikey: ANON_KEY` — the user JWT must also be sent as `Authorization: Bearer <jwt>` for this check to work.

**3. `src/api/claude.ts:7-17` — Edge functions invoked without user JWT; per-user tracking impossible (MEDIUM)**  
```typescript
headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY }
```
The `invokeFunction` helper sends only the anon key, not the user's session JWT. As a result, the edge functions cannot identify which user made a request, making per-user rate limiting, audit logging, and the auth fix above impossible without changing this.  
**Fix:** Inject the session token:
```typescript
const session = await supabase.auth.getSession();
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
};
if (session.data.session?.access_token) {
  headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
}
```

**4. `supabase/functions/ocr/index.ts:54` — URL wine list silently truncated at 12,000 characters (LOW)**  
```typescript
const pageText = stripHtml(html).slice(0, 12000);
```
For large wine lists hosted on restaurant websites, the content is silently cut at 12,000 characters. Wines listed near the end of a long page will be excluded from extraction with no warning to the user.  
**Fix:** Either increase the cap and test against token limits, or surface a warning in the response if truncation occurred.

**5. `supabase/migrations` — `scan_sessions` populated by schema but never written by the app (LOW)**  
The `scan_sessions` table exists in migrations 001 with full RLS. No `insert` or `upsert` into `scan_sessions` appears anywhere in the client codebase (`src/` or `app/`). Every scan result is ephemeral — held in Zustand store memory only. The History tab queries this table, finds nothing, and shows the empty state for all users.  
**Fix:** Add an insert to `scan_sessions` at the end of the `extracting.tsx` pipeline after `setRecommendation` succeeds.

---

## UX and Performance Issues

**1. `app/(tabs)/history.tsx:71` — History cards are always empty (HIGH)**  
See Bugs section item 2. Every history card shows only a date and restaurant name (if set). The wine recommendation is never displayed due to the wrong property name. Since `scan_sessions` is also never populated (see Supabase item 5), the History tab shows "No scans yet" for every user.

**2. `app/(tabs)/profile.tsx:113` — Email change deep link points to non-existent route (MEDIUM)**  
See Bugs section item 12. The confirmation email sends the user to `pocket-som://auth/callback`, which is unhandled.

**3. `app/scan/extracting.tsx:144-152` — Duplicate loading copy (LOW)**  
See Bugs section item 14.

**4. `app/scan/extracting.tsx:153` — "Please don't leave this page" instruction is unenforceable (LOW)**  
```tsx
<Text style={styles.stayNote}>Please don't leave this page while we're searching</Text>
```
The pipeline uses a cancellation token (`{ active: boolean }`) so leaving the screen doesn't cause a crash — it just orphans the in-flight API calls. The instruction is UX noise and creates unnecessary anxiety. A background-safe flow or a progress indicator tied to the actual state would be better.

**5. `app/index.tsx:9` — `usePreferences()` called unconditionally before session check (LOW)**  
`usePreferences()` is called at the top of `Index` regardless of auth state. The hook guards with `enabled: !!session` so no query fires for guests, but the hook itself always runs. This is minor overhead but can be cleaned up by moving `usePreferences()` into a separate authenticated sub-component.

**6. `src/components/results/PricingBadge.tsx`, `WineRecommendationCard.tsx` — Fully implemented components that are never used (LOW)**  
Both components exist in `src/components/results/` and are fully coded. Neither is imported in `app/scan/results.tsx`, which implements its own inline accordion instead. These components represent dead code and maintenance overhead.

**7. `src/constants/vintageCharts.ts` — Vintage chart lookup is a placeholder that always returns null (LOW)**  
```typescript
export const VINTAGE_CHARTS: Record<string, Record<number, number>> = {};
```
`lookupVintageScore` always returns `null`. The vintage quality information displayed in the app comes entirely from the Claude response, not from these charts. The file gives a false impression that a local lookup system exists.  
**Fix:** Either populate with real data or delete the file and remove the import.

---

## Navigation Issues

**1. `app/(tabs)/history.tsx:64` — History items appear tappable but are dead ends (MEDIUM)**  
`TouchableOpacity` with no `onPress` means every history item gives press feedback but navigates nowhere. Users who tap to re-view a past recommendation will find nothing happens.  
**Fix:** Implement a detail view route (e.g., `/scan/history/[id]`) and add `onPress={() => router.push(`/scan/history/${item.id}`)}`.

**2. `app/scan/url.tsx:1-5` — URL scan route immediately redirects; feature is unimplemented on client (LOW)**  
```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```
The OCR edge function has full URL-based wine list support, including HTML fetching and stripping. The client-side UI for entering a URL was never built. The stub route should either be removed or replaced with a real URL input screen.

**3. `app/scan/preferences.tsx` — Screen is unreachable from any navigation path (LOW)**  
No screen, button, or link in the app navigates to `/scan/preferences`. It is an orphaned screen likely superseded by the inline preference accordions in `scan.tsx` and the pre-filtering in `extracting.tsx`. It also contains the TypeScript compile error documented in Bugs item 7.  
**Fix:** Delete the file.

**4. `app/welcome.tsx` — Guest entry does not persist `hasLaunched` atomically before navigation (LOW)**  
```tsx
async function handleGuest() {
  await AsyncStorage.setItem('hasLaunched', 'true');
  router.replace('/(tabs)/scan');
}
```
If the app is killed between the `setItem` completing and the navigation completing, the flag is persisted but the user may see the welcome screen on the next cold start depending on the exact timing. This is an extremely unlikely race but worth noting.

---

## Summary of Severity Counts

| Severity | Count |
|----------|-------|
| HIGH     | 4     |
| MEDIUM   | 13    |
| LOW      | 11    |

**Most urgent items:**
1. Rotate the exposed Supabase credentials in `eas.json` and `.env.example` (HIGH — credentials are live)
2. Fix the SSRF in the OCR edge function URL handler (HIGH — security)
3. Fix the `router.replace` during render in results screen (HIGH — crash risk)
4. Fix history card data shape `topPick` → `wines[0]` (HIGH — feature is completely broken)
5. Wire `scan_sessions` inserts so history actually populates (MEDIUM — table is never written to)
6. Fix the onboarding → scan race condition for new users (MEDIUM — onboarding is bypassed)
