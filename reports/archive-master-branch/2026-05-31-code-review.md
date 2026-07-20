# Code Review — 2026-05-31

Automated review of the full codebase: `app/`, `src/`, `supabase/functions/`, and `supabase/migrations/`.

---

## Bugs and Crashes

### High Severity

**1. New signed-in users skip onboarding — `app/index.tsx:21`**

`preferences` starts as `undefined` (React Query in-flight), not `null`. The guard `if (preferences === null)` never fires while the query is loading, so the fallthrough `return <Redirect href="/(tabs)/scan" />` on line 23 executes immediately. A brand-new account never reaches `/onboarding`. The fix is to also wait on a preferences `isLoading` flag alongside the existing `loading` check on line 17.

**2. Wine type preferences never persist — `supabase/migrations/002_extend_profiles.sql:3` + `src/hooks/usePreferences.ts:18,30`**

Migration 002 creates the column as `default_wine_type` (singular, TEXT). The app reads and writes `default_wine_types` (plural, array) everywhere:
- `usePreferences.ts:18` — `.select('... default_wine_types ...')`
- `usePreferences.ts:30` — `{ default_wine_types: updates.wineTypes }`

Supabase silently returns `undefined` for the non-existent column name, so `wineTypes` is always `[]` regardless of what the user saves. The upsert also silently fails to write the column. This is the single most impactful data bug in the app — a core user preference is completely non-functional.

**3. `router.replace()` called during render — `app/scan/results.tsx:22-24`**

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

`router.replace()` is called synchronously inside the render function. In React 18, updating navigation state during a render triggers a "Cannot update during an existing state transition" error. This causes a crash any time the results screen is mounted without a recommendation in the store (e.g., after a force-quit and reopen, or navigating directly to the route). Fix: move the redirect into a `useEffect`.

**4. Preference upserts fail silently — `src/hooks/usePreferences.ts:33`**

```tsx
await supabase.from('profiles').upsert({...});
```

The Supabase client returns `{ data, error }` — it does not throw. The `mutationFn` completes without throwing regardless of whether the upsert succeeded, so React Query's `onError` callback on line 38 never fires. If the upsert fails (network error, RLS violation, wrong column name), the user sees the spinner disappear and assumes their preferences were saved. There is no error surfaced.

**5. `pricing_cache` table has no RLS — `supabase/migrations/001_initial_schema.sql`**

`profiles` and `scan_sessions` both have `enable row level security` statements. `pricing_cache` does not. Supabase's default grants the `anon` role SELECT on all tables. Any user with the public anon key (which is embedded in the app bundle as `EXPO_PUBLIC_SUPABASE_ANON_KEY`) can read the entire pricing cache and observe what wines are being looked up. A malicious actor could also upsert false pricing data directly via the Supabase REST API, poisoning cache entries for any wine name. Add `alter table pricing_cache enable row level security;` and a restrictive policy.

---

### Medium Severity

**6. History cards never show the recommended wine — `app/(tabs)/history.tsx:30`**

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (`src/types/wine.ts`) has a `wines: WineRecommendation[]` array and a `summary` string. There is no `topPick` property. The `as ScanSession[]` type cast on line 23 suppresses the TypeScript error. At runtime, `recommendation?.topPick` is always `undefined`, so the wine name is never shown on any history card. Should be `item.recommendation?.wines?.[0]?.name`.

**7. `getSession()` rejection leaves app permanently blank — `src/hooks/useAuth.tsx:16-19`**

```tsx
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

There is no `.catch()`. If `getSession()` rejects — due to a network error or SecureStore failure — `setLoading(false)` is never called. `loading` stays `true` forever and `app/index.tsx:17` returns `null`, leaving the user on a permanent blank screen with no recovery path.

**8. `preferences.tsx` calls `recommendWines` with missing required fields — `app/scan/preferences.tsx:28-33`**

```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
});
```

`RecommendInput` in `src/services/recommender.ts` requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. None of these are passed here. The edge function receives `undefined` for those fields, causing the user's hard exclusion preferences (disliked regions, disliked grapes) to be silently ignored in this flow.

---

### Low Severity

**9. `extracting.tsx` effect has empty dependency array — `app/scan/extracting.tsx:60`**

```tsx
useEffect(() => { ... run(token); ... }, []);
```

`run()` closes over `imageUri`, `imageUris`, `preferences`, and `userProfile`. The ESLint `react-hooks/exhaustive-deps` rule would flag this. In practice the screen is visited once and unmounted, so it's not a runtime crash, but if the screen were ever kept alive across hot reloads the stale closure would execute with outdated values.

**10. Immediate retry on duplicate grapes wastes an API call — `src/services/recommender.ts:30-36`**

When the first call returns wines with duplicate grape varieties, the function immediately retries with `_strictDiversity: true` (no delay, no backoff). If the wine list genuinely only contains one grape variety — e.g., an all-Pinot-Noir list — the retry will also return duplicates. The original (duplicate) result is then returned silently anyway on line 36. The retry consumes a full Opus API call for no benefit in this case.

**11. Pre-filter ignores scan-time budget — `app/scan/extracting.tsx:101`**

`preFilterWines(wines, userProfile)` uses `userProfile.defaultBudget` (the saved profile budget) to filter wines before sending to the recommendation engine. The scan-screen budget override stored in `useScanStore().preferences.budget` is not applied at the pre-filter stage. If the user set a lower budget for this specific scan, wines above that budget are still sent to Claude, wasting prompt tokens and context window space. The recommend edge function does apply the scan-time budget as a hard rule, so recommendations are still correct — but the list sent to Claude is unnecessarily large.

---

## Supabase and Edge Function Issues

**1. `pricing_cache` table has no RLS** — documented above in Bugs #5.

**2. No CORS headers on any edge function — `supabase/functions/ocr/index.ts`, `supabase/functions/recommend/index.ts`, `supabase/functions/wine-searcher-proxy/index.ts`**

None of the three edge functions handle `OPTIONS` preflight requests or set `Access-Control-Allow-Origin` / `Access-Control-Allow-Methods` headers. If the app is built for Expo Web or accessed from a browser context, all three functions will be blocked by CORS policy. Add a CORS handler at the top of each `Deno.serve` callback:

```ts
if (req.method === 'OPTIONS') {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, apikey, Authorization',
    },
  });
}
```

**3. Edge functions called without `Authorization` header — `src/api/claude.ts:12`**

The `invokeFunction` helper sends only the `apikey` header, not `Authorization: Bearer <jwt>`. This means the OCR and recommend functions run in an unauthenticated context. More importantly, `EXPO_PUBLIC_SUPABASE_ANON_KEY` is embedded in the compiled JS bundle and visible to anyone who downloads the app. Any person with the anon key can call these functions directly with no rate limiting or per-user cost attribution, generating unlimited Claude Opus API calls at your cost.

The `wine-searcher.ts` client uses `supabase.functions.invoke()` which does attach the user JWT automatically — only the custom `fetch`-based helper in `claude.ts` is missing it.

**4. Wine-Searcher API key sent as URL query parameter — `supabase/functions/wine-searcher-proxy/index.ts:47`**

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&winename=...`;
```

API keys in URLs are captured in server access logs, CDN logs, Supabase function logs, and browser history. The Wine-Searcher key should be sent in a request header (e.g., `Authorization` or `X-API-Key`) to avoid accidental exposure.

**5. `recommend` edge function may truncate for large wine lists — `supabase/functions/recommend/index.ts:173`**

`max_tokens: 4096` is set for the recommend function. With 25 wines in the input and three detailed recommendation objects in the output (each with rationale, vintage assessment, drinking window, rarity assessment, fit/value scores), 4096 output tokens can be exhausted for complex lists. A truncated response fails JSON parsing and produces an error for the user. The OCR function uses 8096. Consider raising to 6144 or 8096 to match.

**6. Budget currency hardcoded as `£` in prompt — `supabase/functions/recommend/index.ts:139`**

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```

The `£` symbol is hardcoded. If the user is scanning a menu priced in USD, EUR, or any other currency, the comparison instruction sent to the model is misleading — it says "£50" when the menu prices may be in a different currency. The `currency` field exists in `ScanPreferences` type but is never passed to the edge function.

---

## UX and Performance Issues

**1. Duplicate "This may take a minute or two" text — `app/scan/extracting.tsx:146-151`**

During the `recommending` stage, two body-text elements appear simultaneously:
- Line 148: `'Scoring by critic rating, vintage quality and value'`
- Line 151: `'This may take a minute or two'`

The intent was to show a wait message, but the result is two separate lines of body text rendered at the same time, one factual and one a wait note. During the `reading` stage, the first block already shows `'This could take a minute or two'`, and line 151 is conditional on `recommending`, so the reading stage is fine. Fix: fold the wait note into the conditional text of the first block.

**2. History cards are tappable but nothing happens — `app/(tabs)/history.tsx:63`**

```tsx
<TouchableOpacity style={styles.card}>
```

There is no `onPress` handler. Users tap a history entry and see a visual press ripple but no navigation occurs. Given that the `recommendation` JSON is stored in the `scan_sessions` row, tapping a card should navigate to a detail view or re-display that recommendation. As-is it is a dead interaction.

**3. No error boundary in the app — `app/_layout.tsx`**

No component in the tree wraps children in a React error boundary. In production, an uncaught render error produces a blank white screen with no recovery path. Expo Router supports per-segment `_error.tsx` files; at minimum an error boundary at the root layout level would allow showing a "something went wrong" UI with a restart option.

**4. No loading indicator while preferences sync on scan screen — `app/(tabs)/scan.tsx:54-61`**

The scan tab initialises wine type and style pickers with empty defaults, then silently updates them when `savedPreferences` arrives from React Query. This causes a visible snap: accordions show "e.g. Red Wine" placeholder text, then jump to the user's actual saved selections. A skeleton state or a `isLoading` guard would prevent the snap.

**5. "Change your subscription email account" — `app/(tabs)/profile.tsx:153`**

The label reads "Change your subscription email account". The app has no subscription model. This copy confuses users who will read "subscription" and wonder what they're subscribed to, or whether changing this affects a paid plan. Replace with "Change email address".

**6. No back button or cancel on camera, extracting, or results screens**

`app/scan/camera.tsx`, `app/scan/extracting.tsx`, and `app/scan/results.tsx` have no back/cancel button. On `extracting.tsx` in particular, if OCR takes 60+ seconds, the user has no way to cancel — the instruction "Please don't leave this page" (line 153) is the only guidance, and it doesn't acknowledge that the user can't cancel. A cancel button that calls `token.active = false` and navigates back would address this.

**7. `prefsLoaded` flag causes a redundant render cycle — `app/(tabs)/scan.tsx:54-61`**

The scan screen initialises state from `savedPreferences` in `useState`, then the `useEffect` sets the same values again when preferences load:
```tsx
const [wineTypes, setWineTypes] = useState<WineType[]>(savedPreferences?.wineTypes ?? []);
// ...
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    setWineTypes(savedPreferences.wineTypes ?? []);
```
This triggers an extra re-render. The `useState` initial value already handles the case where preferences are available at mount. The `useEffect` only adds value when preferences arrive after mount (async). Consider using a single initialisation approach — either a `useEffect` only, or lazily initialising with `useState(() => savedPreferences?.wineTypes ?? [])` and removing the effect.

---

## Navigation Issues

**1. `router.replace()` during render on results screen — `app/scan/results.tsx:22-24`** — documented above in Bugs #3.

**2. New signed-in users skip onboarding — `app/index.tsx:21`** — documented above in Bugs #1.

**3. `app/scan/preferences.tsx` is an unreachable orphan route**

No file in the codebase navigates to `/scan/preferences`. The scan flow goes: `scan → camera → preview → extracting → results`, with preferences set on the scan home screen itself. The `preferences.tsx` screen at `app/scan/preferences.tsx` can never be reached by a user. It also calls `recommendWines` with missing required fields (see Bugs #8). This file is dead code and should either be wired into the flow or deleted.

**4. Back arrow on profile screen pushes rather than replaces — `app/(tabs)/profile.tsx:182`**

```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

`router.push('/(tabs)/scan')` adds a new entry to the navigation stack, so pressing OS back from the scan tab would return to the profile tab. On Android, the back button would loop: scan → back → profile → scan → back → profile. The `arrow-back` icon implies `router.back()` semantics. Replace with `router.back()` or use the tab navigator's own navigation.

**5. `app/scan/extracting.tsx` — OS back gesture re-triggers extraction**

The scan flow pushes `extracting.tsx` onto the stack. If the user uses the Android back gesture from `extracting.tsx` before it completes, they land on `preview.tsx`. If they press "Use This Photo" again, a new `extracting.tsx` is pushed and extraction runs again. The token cancellation (`token.active = false` in the cleanup) correctly cancels the in-flight request. However, the `extractedWines` partial state may be in the store from the aborted run, leading to stale data. The store should be reset on retake rather than only on `reset()`.

**6. No route defined for `auth/callback` — `app/(tabs)/profile.tsx:113`**

```tsx
const redirectTo = Linking.createURL('auth/callback');
```

`Linking.createURL('auth/callback')` generates a deep link (e.g., `exp://…/auth/callback` or the custom scheme URL). There is no `app/auth/callback.tsx` route in the codebase. When Supabase sends the email confirmation link and the user taps it, the deep link will open the app but Expo Router will show a 404 unmatched-route screen. The email change flow will complete on Supabase's side but the app will not react to it (no session refresh, no confirmation UI).
