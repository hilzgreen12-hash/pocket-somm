# Code Review — 2026-06-02

Automated review of the full codebase: `app/`, `src/`, `supabase/functions/`, and `supabase/migrations/`.

**Note on previous findings:** The git log shows no application code commits since the 2026-06-01 review (only the review report commit itself). All issues flagged on 2026-06-01 remain open. This report carries them forward with updated line references and adds newly discovered issues. New findings are marked **[NEW]**.

---

## Bugs and Crashes

### High Severity

**1. `getSession()` rejection leaves the app permanently blank — `src/hooks/useAuth.tsx:17-19` — High**

```ts
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

No `.catch()` is attached. If `getSession()` rejects — network failure on cold boot, `SecureStore` error on a new device, or an expired SSL cert — `setLoading(false)` is never called. `loading` stays `true`, `app/index.tsx:16` returns `null`, and the user sees a permanent blank screen with no recovery path except force-quitting. Fix: add `.catch(() => setLoading(false))`.

---

**2. Preference saves fail silently — `src/hooks/usePreferences.ts:38` — High**

```ts
await supabase.from('profiles').upsert({ ... });
```

The Supabase JS client returns `{ data, error }` — it does not throw. The `mutationFn` awaits the call and completes without inspecting `error`, so React Query's `onError` handler (line 50) never fires. Any RLS violation, network error, or schema mismatch silently discards the save while the UI shows success. Fix: add `const { error } = await supabase...upsert(); if (error) throw error;`.

---

**3. `router.replace()` called synchronously during render — `app/scan/results.tsx:22-24` — High**

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace()` inside the render function triggers a navigation state update during render. React 18 throws "Cannot update during an existing state transition" when this happens. This crashes the results screen every time it is mounted without a recommendation in the store — which occurs after force-quitting the app with `/scan/results` in the navigation history. Fix: wrap the redirect in a `useEffect`.

---

**4. New signed-in users bypass onboarding — `app/index.tsx:20` — High**

```tsx
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

`usePreferences` returns `undefined` (not `null`) while the React Query fetch is in flight because `enabled: !!session` means the query doesn't start until after auth resolves — but `app/index.tsx:16` only waits on `loading` (auth) and `hasLaunched` (AsyncStorage), not on the preferences query. For a newly signed-in user, `preferences` is `undefined` when the redirect fires, the null-guard fails, and the user is sent directly to the scan tab. New accounts never see `/onboarding`. Fix: expose `isLoading` from `usePreferences` and include it in the loading guard on line 16.

---

**5. Camera capture errors are silently swallowed — `app/scan/camera.tsx:29-99` — High**

```ts
async function handleCapture() {
  if (!cameraRef.current) return;
  await Haptics.impactAsync(...);
  const photo = await cameraRef.current.takePictureAsync({ ... });
  ...
```

`handleCapture` is an `async` function called via the `onPress` of the capture button with no surrounding `try/catch` and no `.catch()` at the call site (`CameraOverlay.tsx:35`). If `takePictureAsync` throws (camera interrupted, permissions revoked mid-session), or if either `ImageManipulator.manipulateAsync` call throws, the error is an unhandled promise rejection. The camera screen shows no feedback and the user has no indication the capture failed. Fix: wrap the body of `handleCapture` in a `try/catch` and show an alert or reset state on failure. Severity raised from Medium to High because this can block the app's primary feature with no recovery UI.

---

### Medium Severity

**6. Capture button allows concurrent `takePictureAsync` calls — `app/scan/camera.tsx:29` — Medium [NEW]**

`handleCapture` has no guard against rapid double-taps. There is no `loading` state variable to disable the capture button while a capture is in progress. If a user taps the button twice quickly, two concurrent calls to `cameraRef.current.takePictureAsync()` are made. The second call may throw (only one capture can be active at a time), or both may succeed and the second `setImage` call will overwrite the first — sending the wrong image to the preview screen. Fix: add a `capturing` boolean state, set it to `true` at the start of `handleCapture` and back to `false` in a `finally` block, and pass `disabled={capturing}` to `CameraOverlay`.

---

**7. History cards always show blank wine name — `app/(tabs)/history.tsx:71` — Medium**

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (defined in `src/types/wine.ts:50`) has `wines: WineRecommendation[]` and `summary: string`. There is no `topPick` property. The `as ScanSession[]` cast on line 23 suppresses the TypeScript error. At runtime `recommendation?.topPick` is always `undefined`, so no history card ever shows a wine name. Fix: `item.recommendation?.wines?.[0]?.name`.

---

**8. `preferences.tsx` calls `recommendWines` with missing required fields — `app/scan/preferences.tsx:28-33` — Medium**

```tsx
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
});
```

`RecommendInput` (`src/services/recommender.ts:5-15`) requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. None are passed here — TypeScript does not catch this because there is no strict check at the call site. The edge function receives `undefined` for all exclusion fields, so the colour filter, disliked regions, and disliked grapes hard rules are silently skipped for any scan that goes through this screen. (The route itself is unreachable — see Navigation #3 — but this is a latent correctness bug if the route is ever wired up.)

---

**9. `UserPreferences.defaultCurrency` declared but never populated — `src/types/preferences.ts:7` — Medium [NEW]**

```ts
export interface UserPreferences {
  ...
  defaultCurrency: string;
  ...
}
```

`src/hooks/usePreferences.ts` selects `style_preferences`, `default_budget`, `default_wine_types`, `favourite_regions`, `favourite_grapes`, `disliked_regions`, `disliked_grapes` from the `profiles` table (line 16). There is no `default_currency` column in the DB and no `defaultCurrency` field in the returned object. The `as UserPreferences` cast on line 31 suppresses the TypeScript error. Any code that reads `preferences.defaultCurrency` receives `undefined` at runtime despite the type declaring it `string`. Currently no code reads this field, but it is a silent type lie in the interface that will cause a runtime error if used.

---

**10. `UserPreferences.defaultBudget` typed non-nullable but returns `null` at runtime — `src/types/preferences.ts:6`, `src/hooks/usePreferences.ts:23` — Medium [NEW]**

```ts
// types/preferences.ts
defaultBudget: number;

// usePreferences.ts
defaultBudget: data.default_budget ?? null,
```

The type says `number` but the hook returns `number | null` (via the `?? null` fallback on line 23). The `as UserPreferences` cast on line 31 conceals the mismatch. Code that calls `preferences.defaultBudget` and performs arithmetic on it without a null check — e.g., `app/scan/extracting.tsx:38` where `w.menuPrice <= prefs.defaultBudget` — is performing `number <= null`, which evaluates to `false` in JavaScript, silently excluding all wines with any price from the recommendation when the user has no budget set. The outer `if (prefs.defaultBudget)` guard on line 37 does catch the `null` case, so this doesn't crash — but the type system provides no safety and the guard is fragile (it also skips filtering for `defaultBudget === 0`). Fix: change the type to `number | null` and update all call sites.

---

### Low Severity

**11. `WineRecommendationCard` component is dead code — `src/components/results/WineRecommendationCard.tsx` — Low [NEW]**

`WineRecommendationCard` is defined with its own rendering of `VintageBadge`, `DrinkingWindowBadge`, `RarityBadge`, `RationaleBlock`, and `PricingBadge`. It is not imported by `app/scan/results.tsx`, which re-implements its own inline accordion card layout. The component is orphaned. Future edits to the results display made in `WineRecommendationCard.tsx` will have no effect. The file should either be deleted or replace the inline rendering in `results.tsx`.

---

**12. `PricingBadge` hardcodes £ symbol regardless of `pricing.currency` — `src/components/results/PricingBadge.tsx:35` — Low [NEW]**

```tsx
{marketAvg !== null ? `£${marketAvg.toFixed(0)}` : '—'}
```

The `£` symbol is hardcoded. `PricingData.currency` is available as `pricing.currency` and is already passed into the component. If the wine-searcher returns pricing in EUR, USD, AUD, or any other currency, the badge displays the wrong currency symbol. Fix: use a lookup table from ISO 4217 code to symbol, or at minimum render `${pricing.currency} ${marketAvg.toFixed(0)}`.

---

**13. `useEffect` in `extracting.tsx` has empty dependency array — `app/scan/extracting.tsx:60` — Low**

```tsx
useEffect(() => { ... run(token); ... }, []);
```

`run()` closes over `imageUri`, `imageUris`, `preferences`, and `userProfile`. These are correctly captured at mount time and the screen is single-use, so this is not a crash today. However, it causes a spurious `react-hooks/exhaustive-deps` lint warning that can mask real violations elsewhere in the codebase.

---

**14. Duplicate-grape retry silently returns invalid result on second parse failure — `src/services/recommender.ts:75-82` — Low**

```ts
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data;
}
return parsed.data;  // <-- returned even if it had duplicate grapes
```

If the retry also returns duplicate grapes and `parsed2` fails, the fallthrough returns `parsed.data` — the original invalid response — with no log and no user-facing indication. The recommendation violates the grape diversity constraint the system prompt treats as non-negotiable. Add a `console.warn` on the retry failure path and consider throwing instead of silently returning bad data.

---

**15. Pre-filter uses profile budget, not scan-time budget override — `app/scan/extracting.tsx:101` — Low**

```tsx
const winesForRecommend = preFilterWines(wines, userProfile);
```

`preFilterWines` uses `userProfile.defaultBudget` (the saved profile). If the user set a lower budget on the scan tab for this specific scan, that value lives in `useScanStore().preferences.budget` and is not applied at this stage. The edge function does apply the scan-time budget as a hard rule, so results are correct — but wines above the scan-time budget are unnecessarily forwarded in the prompt payload, increasing token usage.

---

## Supabase and Edge Function Issues

**1. `pricing_cache` table has no row-level security — `supabase/migrations/001_initial_schema.sql:32-44`**

`profiles` (line 10) and `scan_sessions` (line 27) have RLS enabled. `pricing_cache` does not. Supabase's default grants `SELECT` on all tables to the `anon` role. The `EXPO_PUBLIC_SUPABASE_ANON_KEY` is compiled into the app bundle. Anyone who extracts that key can query the pricing cache via the public REST API, reading a log of every wine ever looked up. Worse, the `anon` role can also `INSERT` and `UPDATE` rows, allowing cache poisoning with false pricing data. Fix: `alter table pricing_cache enable row level security;` and grant write access exclusively to the `service_role` key used by the edge function.

---

**2. OCR and recommend edge functions called without user JWT — `src/api/claude.ts:8-14`**

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
},
```

Only the anon key is sent — no `Authorization: Bearer <jwt>` header. The edge functions run in an unauthenticated context with no per-user attribution, and anyone who extracts the anon key from the app bundle can call `ocr` and `recommend` directly, generating unlimited Claude Opus API calls at the developer's cost with no rate-limiting. The `wine-searcher.ts` client uses `supabase.functions.invoke()` which attaches the session JWT automatically — the raw `fetch` in `claude.ts` should do the same or switch to `supabase.functions.invoke()`.

---

**3. No CORS preflight handler on any edge function — `supabase/functions/ocr/index.ts`, `supabase/functions/recommend/index.ts`, `supabase/functions/wine-searcher-proxy/index.ts`**

None of the three functions handle `OPTIONS` preflight requests. All three will be blocked by the browser's CORS policy if the app is built for Expo Web or tested via browser-based dev tools. Each `Deno.serve` callback needs an early return for `OPTIONS` that emits `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`.

---

**4. Wine-Searcher API key passed as URL query parameter — `supabase/functions/wine-searcher-proxy/index.ts:48`**

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&winename=...`;
```

API keys in URLs are captured in HTTP server access logs, CDN logs, Supabase function logs, and any network proxy. Send the key as a request header (`Authorization` or a custom `X-Api-Key` header) rather than in the query string.

---

**5. `recommend` edge function `max_tokens` too low for complex lists — `supabase/functions/recommend/index.ts:169`**

`max_tokens: 4096` is set for the recommend function. Each of the three recommendations includes `rationale`, `vintageAssessment.notes`, `drinkingWindow.notes`, `rarityAssessment.notes`, `fitScore`, `valueScore`, and `outsidePreferences`, plus the top-level `summary`. With a 25-wine prompt payload and three richly structured output objects, 4096 tokens is regularly exhausted on complex wine lists. A truncated response fails the regex match on line 184 and surfaces as a crash to the user. The OCR function uses `max_tokens: 8096` — set recommend to match.

---

**6. Budget currency hardcoded to £ in recommend prompt — `supabase/functions/recommend/index.ts:139`**

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle.`
```

The currency symbol is hardcoded to `£`. Menus priced in USD, EUR, AUD, or other currencies produce a contradiction: the model is told the budget is "£50" but the wine list JSON contains prices in a different currency. The model cannot correctly apply the budget hard rule. `ScanPreferences` (`src/stores/scanStore.ts:8`) has no `currency` field. Add a `currency` field to `ScanPreferences`, pass it to the edge function, and interpolate it into the prompt.

---

**7. URL-mode OCR strips HTML structure — `supabase/functions/ocr/index.ts:26-36`**

`stripHtml()` removes all tags and collapses whitespace. Wine list pages frequently use `<table>`, `<dl>`, or columnar layouts where the spatial relationship between wine name and price is encoded by DOM position. After stripping, a wine name and its price may no longer be adjacent in the text, causing the model to produce mismatched or incomplete extractions. Preserve table structure by converting `<td>` and `<tr>` boundaries to tab and newline characters before stripping remaining tags.

---

## UX and Performance Issues

**1. Two redundant body-text lines during `recommending` stage — `app/scan/extracting.tsx:147-151`**

```tsx
<Text style={styles.body}>
  {stage === 'reading'
    ? 'This could take a minute or two'
    : 'Scoring by critic rating, vintage quality and value'}
</Text>
{stage === 'recommending' && (
  <Text style={styles.body}>This may take a minute or two</Text>
)}
```

During `recommending`, both lines render simultaneously: "Scoring by critic rating…" and "This may take a minute or two" stack vertically. The wait-time note is already shown for the reading stage (line 148) and is redundant here. Fold it into the conditional text block.

---

**2. History cards are tappable but `onPress` is missing — `app/(tabs)/history.tsx:63`**

```tsx
<TouchableOpacity style={styles.card}>
```

No `onPress` handler. Cards render a press ripple on Android and opacity change on iOS but nothing happens. The `recommendation` JSON is stored in the `scan_sessions` row and could re-display the results. A dead tap target trains users not to trust interactive elements in the app.

---

**3. No React error boundary anywhere in the component tree — `app/_layout.tsx`**

An unhandled render-time error (e.g., a `null` deref in a component, a bad recommendation payload shape) produces a blank white screen in production with no recovery path. Expo Router supports per-segment `_error.tsx` files. At minimum, add an error boundary at the root layout to show a "Something went wrong — restart the app" UI.

---

**4. Preferences snap-update on scan tab — `app/(tabs)/scan.tsx:24-26` and `59-66`**

The scan tab initialises `wineTypes`, `styleProfiles`, and `budget` from `savedPreferences` in `useState` (which is `undefined` on first render while React Query fetches), then a `useEffect` re-sets those values once preferences load. This causes a visible snap from placeholder text to saved values, and the `prefsLoaded` flag causes a redundant re-render. Fix: remove the `useState` initialisers or the `useEffect`, keeping one initialisation path.

---

**5. "Change your subscription email account" — `app/(tabs)/profile.tsx:153`**

The label reads "Change your subscription email account". The app has no subscription tier. "Subscription" implies a paid plan or newsletter. Replace with "Change email address".

---

**6. No cancel button on the extracting screen — `app/scan/extracting.tsx:140-161`**

Line 153 tells users "Please don't leave this page" but provides no cancel mechanism. OCR of a complex list can take 60–90 seconds. A cancel button that sets `token.active = false` and calls `router.back()` would materially improve the experience when the user changes their mind mid-wait.

---

**7. No password reset flow on sign-in screen — `app/(auth)/sign-in.tsx`**

There is no "Forgot password?" link. Users who cannot remember their password have no visible recovery path. Supabase provides `supabase.auth.resetPasswordForEmail()`. Add a link below the sign-in form that triggers it.

---

## Navigation Issues

**1. `router.replace()` during render crashes results screen — `app/scan/results.tsx:22-24`**

Documented in Bugs section. Move the redirect into a `useEffect` with `[recommendation]` dependency.

---

**2. New signed-in users bypass onboarding — `app/index.tsx:20`**

Documented in Bugs section. Wait for the preferences query to resolve before redirecting.

---

**3. `/scan/preferences` is an unreachable orphan route — `app/scan/preferences.tsx`**

No file in the codebase navigates to `/scan/preferences`. The active flow is `scan → camera → preview → extracting → results`. Preferences are set inline on the scan home tab. This file is dead code that also contains a latent bug (missing required fields for `recommendWines`, Bugs #8). Delete it or wire it into the flow.

---

**4. Back arrow on profile tab pushes rather than pops — `app/(tabs)/profile.tsx:182`**

```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
```

`router.push()` adds a stack entry. On Android, pressing the OS back button from scan returns to profile, creating a loop. The icon implies `router.back()` semantics. Replace `router.push('/(tabs)/scan')` with `router.back()`.

---

**5. `auth/callback` deep-link route does not exist — `app/(tabs)/profile.tsx:113`**

```ts
const redirectTo = Linking.createURL('auth/callback');
```

`Linking.createURL('auth/callback')` generates the deep link used in the email-change confirmation email. There is no `app/auth/callback.tsx`. When the user taps the confirmation link, Expo Router shows an unmatched-route 404. The email change completes on Supabase's side but the app session never refreshes and there is no confirmation UI. Create `app/auth/callback.tsx` with a `useEffect` that calls `supabase.auth.exchangeCodeForSession()` or `getSession()` and redirects to the profile tab.

---

**6. OS back from extracting screen leaves stale store state — `app/scan/extracting.tsx`**

`extracting.tsx` is pushed (not replaced), so the Android back gesture or iOS swipe returns to `preview.tsx`. If the user taps "Use This Photo" again, a new `extracting.tsx` mounts and `run()` fires. The cancellation token correctly aborts the in-flight request, but `extractedWines` from the partial run may remain in the store. `scanStore.reset()` is only called via the "Retake" button in `preview.tsx:handleRetake`. Add a `reset()` call at the start of `preview.tsx:handleConfirm` to clear stale state before pushing to extracting.

---

**7. `/scan/url` unconditionally redirects to scan tab — `app/scan/url.tsx:1-5`**

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

Any navigation to `/scan/url` is silently discarded. There is no URL-input entry point in the UI either. If URL scanning is not planned, delete the file. If it is planned, implement it.
