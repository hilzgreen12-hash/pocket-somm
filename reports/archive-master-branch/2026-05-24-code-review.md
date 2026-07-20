# Code Review — 2026-05-24

Reviewed by: automated review agent  
Scope: full codebase — app/, src/, supabase/functions/, supabase/migrations/

---

## Bugs and Crashes

### High Severity

**1. `app/scan/camera.tsx:29` — `handleCapture` has no try/catch**  
`handleCapture` is an async function that calls `cameraRef.current.takePictureAsync()` and up to two `ImageManipulator.manipulateAsync()` calls with no error handling. A camera hardware failure, a write permission error on the device, or an OOM on image manipulation will throw an unhandled promise rejection and crash the app. Wrap the entire function body in try/catch and route any failure to an error state or an Alert.

**2. `app/scan/results.tsx:22-24` — `router.replace()` called during render**  
```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```
Navigation side-effects during render are a known React anti-pattern and cause undefined behaviour in expo-router. This should be inside a `useEffect`. The current code can trigger "Cannot update a component while rendering a different component" warnings and intermittent navigation failures on React 18+ strict mode.

**3. `app/(tabs)/history.tsx` + entire codebase — scan sessions are never persisted**  
The `scan_sessions` table exists and the History tab queries it, but there is no code anywhere in the app that writes a completed scan to Supabase. After `extracting.tsx` calls `setRecommendation(recommendation)` and navigates to `/scan/results`, the session is never saved. Every user will perpetually see "No scans yet" regardless of how many scans they perform. The write needs to happen in `app/scan/extracting.tsx` at the point the recommendation is received, before calling `router.replace('/scan/results')`.

**4. `supabase/functions/ocr/index.ts` — no authentication check**  
The OCR edge function accepts any request that includes the public anon key, which is shipped inside every app bundle. There is no JWT verification or RLS-style caller check. Any person who extracts the anon key (trivial with a proxy) can invoke the OCR function repeatedly, consuming Claude API credits at the project's expense. Add `const authHeader = req.headers.get('Authorization'); if (!authHeader) return 401;` and validate the JWT using Supabase's `@supabase/supabase-js` service client.

**5. `supabase/functions/recommend/index.ts` — no authentication check**  
Same issue as above. The recommend function is equally exposed. Both OCR and recommend are high-cost operations (Claude Opus) and must be gated behind a valid user JWT.

---

### Medium Severity

**6. `app/index.tsx:20` — `preferences === null` misses the `undefined` loading state**  
`usePreferences` returns `data` from React Query, which is `undefined` while the query is in-flight and `null` if it errors or the profile row doesn't exist. The routing logic checks `if (preferences === null)` to redirect to onboarding, but when the query is still loading `preferences` is `undefined`, which is falsy but not `=== null`. So a freshly signed-in user whose preferences query hasn't resolved yet falls through to `return <Redirect href="/(tabs)/scan" />` and bypasses onboarding entirely. Fix: also check `preferences === undefined` or wait for the query to settle before routing.

**7. `src/api/claude.ts:17` — `JSON.parse(text)` called without try/catch**  
```ts
return JSON.parse(text);
```
If the Supabase gateway returns an HTML error page, a 502 JSON string, or any non-JSON body, `JSON.parse` throws synchronously and the error propagates as an uncaught exception up through `invokeFunction`. This is technically caught in `extracting.tsx`'s outer try/catch, but the error message exposed to the user will be cryptic JSON parse noise rather than a meaningful message. Catch the parse error here and re-throw with a clear message.

**8. `src/hooks/usePreferences.ts:37-49` — upsert errors are silently dropped**  
The `mutationFn` calls `supabase.from('profiles').upsert(...)` but never checks or throws on the returned `error` property:
```ts
await supabase.from('profiles').upsert({ ... });
```
The Supabase JS client does not throw on RLS violations or network failures — it returns `{ data, error }`. Because nothing throws, React Query's `onError` callback never fires, users receive no feedback that their preference save failed, and the stale data continues to be displayed as if it saved. Fix: destructure `{ error }` from the upsert and throw if truthy.

**9. `supabase/functions/ocr/index.ts:84` and `supabase/functions/recommend/index.ts:181` — `response.content[0]` accessed without length check**  
```ts
const text = response.content[0].type === 'text' ? response.content[0].text : '';
```
Claude returns an empty `content` array when the request is blocked by its content policy or when a model-level error occurs. `response.content[0]` will be `undefined`, and `.type` will throw. Both edge functions have this exact bug. Add `if (!response.content.length)` guard before accessing `content[0]`.

**10. `supabase/functions/ocr/index.ts:50-53` — SSRF via unvalidated `url` parameter**  
```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```
The `url` parameter is passed directly to `fetch` with no scheme check, hostname allowlist, or SSRF protection. An attacker (or a compromised client) can make this Deno function issue requests to internal Supabase endpoints, cloud metadata APIs (`169.254.169.254`), or other internal services. At minimum, parse the URL and reject anything that isn't `https://`. A stricter approach would be an allowlist of known restaurant website domains.

**11. `src/types/preferences.ts:6` — `defaultBudget` typed as `number` but is `number | null` in practice**  
```ts
defaultBudget: number;
```
In `usePreferences.ts` line 26, the value is stored as `data.default_budget ?? null`, making it `number | null`. The mismatch means TypeScript doesn't catch null-unsafe uses of `defaultBudget`. In `app/scan/extracting.tsx` line 38, `w.menuPrice <= prefs.defaultBudget` would silently evaluate as `w.menuPrice <= null` (always false in JS) when budget is null, disabling the budget filter entirely without any error. Fix the type definition to `defaultBudget: number | null`.

**12. `app/scan/preferences.tsx:28-34` — `recommendWines()` called with missing required fields**  
```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
});
```
`RecommendInput` requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` — all missing here. This is a TypeScript compile error. The edge function will receive `undefined` for those fields and silently fall back to empty defaults, meaning user exclusions and colour preferences are ignored entirely for any flow that reaches this screen.

**13. `supabase/functions/recommend/index.ts:139` — budget instruction hardcodes £ regardless of currency**  
```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```
If the wine list uses USD, EUR, or another currency, the model is told the budget is in £ while the prices it sees are in another unit. A $200 restaurant using USD prices would be filtered as if the budget were £200. The currency should be passed from the client and used in both the budget line and the user context block.

---

### Low Severity

**14. `app/(auth)/sign-in.tsx:12` and `app/(auth)/sign-up.tsx:12` — no client-side validation before network call**  
Both auth forms submit without checking that email and password are non-empty. An accidental empty tap fires a Supabase network request and shows a raw Supabase error string ("Email not confirmed", "Invalid login credentials", etc.) that is not user-friendly. Add a simple `if (!email.trim() || !password.trim()) return;` guard.

**15. `app/(tabs)/profile.tsx:130-133` — `handleSignOut` ignores errors**  
```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```
If `signOut()` fails (network error, already expired session), the user is still redirected to sign-in. In most cases this is the desired outcome, but the silent failure means tokens may remain in SecureStore in a broken state. At minimum, add a console warning; ideally handle the error and notify the user.

**16. `app/scan/extracting.tsx:37-39` — budget filter evaluates `prefs.defaultBudget` when it may be null**  
```tsx
if (prefs.defaultBudget) {
  filtered = filtered.filter((w) => w.menuPrice === null || w.menuPrice <= prefs.defaultBudget);
}
```
The outer `if (prefs.defaultBudget)` guard is a truthiness check, not a null check. A budget of `0` (never intended to be valid, but possible given the type mismatch in finding #11) would skip the filter. More importantly, if `defaultBudget` is `null`, the inner comparison `w.menuPrice <= null` evaluates to false in JS, silently allowing all wines through. Tighten to `if (prefs.defaultBudget != null)`.

---

## Supabase and Edge Function Issues

**17. `supabase/migrations/001_initial_schema.sql:34` — `pricing_cache` table has no RLS**  
```sql
create table pricing_cache (
  wine_key text primary key,
  ...
);
-- No: alter table pricing_cache enable row level security;
```
`pricing_cache` is accessed only via the service role key in the edge function, so RLS bypass is intentional. However, with RLS disabled and no policy, the table is readable and writable by any authenticated or anonymous request that goes through the Supabase REST API. An attacker could poison the cache with fake prices or read all cached pricing data. Either enable RLS with a policy that denies all direct access (only service role is allowed), or add a `revoke all on pricing_cache from anon, authenticated;` statement.

**18. `supabase/functions/wine-searcher-proxy/index.ts` — no authentication check**  
Same issue as findings #4 and #5. The wine-searcher-proxy accepts any request with the anon key, allowing unauthenticated callers to query the Wine Searcher API and write arbitrary entries to the pricing cache. The Wine Searcher API has usage limits and costs; unauthenticated access could exhaust the quota.

**19. `supabase/functions/ocr/index.ts:87` and `supabase/functions/recommend/index.ts:184` — greedy regex for JSON extraction is fragile**  
```ts
const match = text.match(/\{[\s\S]*\}/);
```
This greedy match will capture everything from the first `{` to the last `}` in the response. If Claude's text contains an explanatory sentence after the JSON object (e.g., "I hope this helps!") that happens to include curly braces, or if it contains two top-level objects, the regex captures garbage and `JSON.parse` throws. A safer approach is to use a non-greedy match `/\{[\s\S]*?\}/` combined with attempting to parse progressively, or to instruct the model more strictly (the prompts already try to do this but the parse safety net shouldn't rely on perfect model compliance).

**20. `supabase/functions/recommend/index.ts` — `RecommendationResponseSchema` max of 3 wines is a `.max()` not a `.length()`**  
`src/services/recommender.ts` line 56:
```ts
const RecommendationResponseSchema = z.object({
  wines: z.array(WineRecommendationSchema).max(3),
  ...
});
```
`.max(3)` allows 0, 1, or 2 wines. If the model returns fewer than 3 (legitimate for a small wine list), the schema passes validation but the results screen has no empty state for 0 wines and no messaging for 1 or 2 wines — only the first three rank labels (`['Top Pick', 'Second Choice', 'Third Choice']`) are defined at `app/scan/results.tsx:16`. A 4th+ wine falls back to `#${i+1}` which is handled, but a 0-wine result renders an empty list with no feedback.

---

## UX and Performance Issues

**21. `app/(tabs)/history.tsx:64` — history cards are tappable but have no `onPress` handler**  
```tsx
<TouchableOpacity style={styles.card}>
```
Every history card shows press feedback (opacity change) but tapping does nothing. Users will repeatedly tap expecting to see their full recommendation and get no response. Either add a handler that navigates to a detail view, or use `<View>` instead of `<TouchableOpacity>` until the detail screen is implemented.

**22. `app/(tabs)/profile.tsx:153` — "Change your subscription email account" is misleading copy**  
The app has no subscription or payments. This label is confusing and implies a paid tier. Replace with "Change email address".

**23. `app/scan/results.tsx:50` — no empty state when `recommendation.wines` is empty**  
The Zod schema allows 0 wines in the recommendation response. If the model returns an empty array (which can happen if no wines on the list meet the hard constraints), `recommendation.wines.map(...)` renders nothing. The user sees a blank white screen below the header with no explanation. Add an empty state: "No wines matched your criteria. Try relaxing your filters."

**24. `app/(auth)/sign-up.tsx` — email confirmation deep link not handled**  
After sign-up, the user is told to check their email. Supabase sends a confirmation link that redirects to the `emailRedirectTo` URL. In `sign-up.tsx`, no `emailRedirectTo` is specified, so Supabase uses its project default — a web URL, not a mobile deep link. Tapping the confirmation email on the device opens a browser rather than the app, and the session is not established. `supabase.ts` sets `detectSessionInUrl: false`, which also suppresses URL-based session detection. The app needs to either (a) provide an `emailRedirectTo` using `Linking.createURL('auth/callback')` in the sign-up call, and (b) handle the incoming deep link in the root layout to call `supabase.auth.exchangeCodeForSession`.

**25. `app/(tabs)/scan.tsx:58-66` — no loading indicator while saved preferences fetch**  
When a logged-in user opens the Scan tab, the preference pickers show empty/default values until the React Query fetch completes. The `prefsLoaded` guard prevents overwriting edits but doesn't show a loading state. Users who quickly interact with the form before preferences load will see their selections replaced. Show a brief skeleton or disabled state until `savedPreferences` is defined.

**26. `app/scan/extracting.tsx:153` — "Please don't leave this page" with no state recovery**  
The warning asks users not to leave, but a back gesture or app backgrounding destroys the in-progress scan with no recovery mechanism. The store is reset on the next scan action. Either (a) implement state persistence so the user can resume, or (b) replace the text with a more honest message: "Navigating away will cancel this scan."

**27. `src/components/preferences/ChipPicker.tsx:16-22` — local state duplication causes stale-render flicker**  
```tsx
const [local, setLocal] = useState(selected);
useEffect(() => { setLocal(selected); }, [selected]);
```
Maintaining a local copy of `selected` that's synced via `useEffect` means there's always one render cycle where `local` is stale after a parent-driven update. This is visible as a momentary flash of the old state when Supabase returns updated preferences. Use `selected` directly and call `onChange` on toggle without duplicating state.

---

## Navigation Issues

**28. `app/scan/preferences.tsx` — screen is unreachable from normal navigation flow**  
No screen in the app calls `router.push('/scan/preferences')`. The screen exists as a file, expo-router registers it as a valid route, but there is no link to it. It's dead code. Additionally, its `recommendWines` call (finding #12) is missing required arguments, so even if it were reached, it would produce a TypeScript compile error and incorrect behaviour at runtime.

**29. `app/scan/url.tsx` — route is a stub that immediately redirects away**  
```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```
The `/scan/url` route exists and the OCR edge function has URL-parsing logic, but the UI entry point was never built. This is not a crash risk, but it means the URL scan feature is entirely non-functional and the route resolves to an unexpected destination if linked to externally.

**30. `app/index.tsx:25` — returning guest with no session can access `/(tabs)/scan` but `/(tabs)/history` shows a sign-in gate while `/(tabs)/profile` also shows a sign-in gate**  
A guest user who taps "Start Scanning" is routed to `/(tabs)/scan` without setting `hasLaunched`. The `hasLaunched` flag is only written in `welcome.tsx`'s `handleGuest` function. But `app/index.tsx` line 25 routes returning guests (`hasLaunched === true`) directly to `/(tabs)/scan`, bypassing the welcome screen where the flag would have been set on first launch. On subsequent app opens, the guest is routed back to welcome again. The flag set in `welcome.tsx` is correct; the issue is that a guest who signs out or clears the session but not `hasLaunched` will loop. This is an edge case but worth documenting.

**31. `app/(auth)/sign-in.tsx:48-50` — "Continue without account" in sign-in screen does not set `hasLaunched`**  
```tsx
<TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)/scan')}>
  <Text style={styles.guestText}>Continue without account</Text>
</TouchableOpacity>
```
This bypasses `hasLaunched` in the same way. On next cold launch, the user is sent back to the welcome screen again because `hasLaunched` is still unset. Set `hasLaunched` here as well as in `welcome.tsx`.
