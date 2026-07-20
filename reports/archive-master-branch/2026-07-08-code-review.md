# Code Review — 2026-07-08

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

---

## Bugs and Crashes

### High

**1. Scan history is never saved — history tab is permanently empty for every user**
`app/scan/extracting.tsx:116` / `app/(tabs)/history.tsx:13`

After `recommendWines()` resolves, `setRecommendation(recommendation)` stores the result in Zustand and `router.replace('/scan/results')` fires — but no code anywhere writes to the `scan_sessions` table. `history.tsx` queries `scan_sessions` and will always land on the "No scans yet" empty state regardless of how many scans a user has completed. The fix requires inserting a row in `scan_sessions` after line 116 in `extracting.tsx`.

**2. `handleCapture` in camera screen has no try/catch — errors produce unhandled promise rejections**
`app/scan/camera.tsx:29`

`handleCapture` is `async` with no surrounding `try/catch`. Any exception from `cameraRef.current.takePictureAsync()` (camera permission revoked mid-session, hardware error) or either `ImageManipulator.manipulateAsync()` call (storage full, EXIF parse failure) produces an unhandled promise rejection. The user sees nothing — the shutter button appears to silently fail with no error state.

**3. Race condition in `index.tsx` routes new signed-in users past onboarding**
`app/index.tsx:20`

Auth and preferences resolve independently. When auth resolves with a valid session but the preferences query is still pending, `preferences` is `undefined` (not `null`). The guard `if (preferences === null)` on line 20 evaluates to `false` when preferences is `undefined`, so new users who have no profile row are routed to `/(tabs)/scan` instead of `/onboarding`. Onboarding is only reached when the query has resolved AND returned `null` — the `undefined` window during loading is unguarded.

**4. Edge functions accept unauthenticated requests — anyone with the anon key can run AI at the developer's expense**
`supabase/functions/ocr/index.ts:38` / `supabase/functions/recommend/index.ts:115`

Neither function validates caller identity. `src/api/claude.ts` sends only `apikey: ANON_KEY` in the request header — not a user JWT. The anon key is embedded in the app bundle and trivially extracted with a proxy. Any third party who obtains it can invoke these functions without being a registered user, consuming Anthropic API credits with no rate limiting or user attribution. The fix is to require `Authorization: Bearer <jwt>` and call `supabase.auth.getUser(jwt)` inside each function.

**5. `pricing_cache` table has no RLS — authenticated users can poison the cache directly**
`supabase/migrations/001_initial_schema.sql:33`

The `pricing_cache` create block (lines 33–41) is never followed by `alter table pricing_cache enable row level security`. Any authenticated user can query, insert, update, or delete all rows in `pricing_cache` via the Supabase JS client. The Edge Function uses the service-role key and bypasses RLS, but direct client-side access is completely unrestricted, enabling cache poisoning of market prices and critic scores for other users.

---

### Medium

**6. Onboarding navigates to scan tab before preference save completes**
`app/onboarding.tsx:37-47`

`updatePreferences({...})` is `mutation.mutate`, which starts the async upsert and returns synchronously. `router.replace('/(tabs)/scan')` on line 47 fires immediately after — before the Supabase write completes. On a slow connection the user reaches the scan tab with no profile written. The `isSaving` guard on the Next button prevents a double-click but does not prevent this race.

**7. Preference save failures have no user-facing feedback**
`src/hooks/usePreferences.ts:38-50`

`await supabase.from('profiles').upsert({...})` on line 38 does not check the returned `{ error }`. If the upsert fails (RLS violation, network error, DB constraint), `onError` on line 50 logs to console only — the user receives no alert, toast, or indication that their preferences were not saved. This affects every preference change on the Profile tab and the final step of onboarding.

**8. `router.replace()` called in the render body, not inside `useEffect`**
`app/scan/results.tsx:22-25`

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace()` during render is a React side-effect-in-render anti-pattern. It fires on every render pass before the guard resolves, can produce unexpected navigation stack states in concurrent mode, and triggers a React warning. Should be wrapped: `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

**9. Budget and currency in the recommend prompt are hardcoded to GBP**
`supabase/functions/recommend/index.ts:139,157`

The HARD RULE budget line (line 139) and the diner context budget summary (line 157) both hardcode the `£` symbol:

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle`
`- Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```

`ExtractedWine` has a `currency` field populated by OCR. On non-GBP menus (EUR, USD, CHF), Claude is told to enforce a GBP budget against prices in a different currency, producing incorrect budget filtering. The currency should be read from the extracted wines and passed through.

**10. Today's date is never injected into the recommend prompt — drinking window assessments are unreliable**
`supabase/functions/recommend/index.ts:38`

The system prompt instructs Claude to assess "whether the wine is currently within its optimal drinking window as of today's date." No date is ever injected into the system prompt or user message. Claude will default to its training-cutoff assumed date, which as of July 2026 is at least a year out of date. A wine assessed as "Too Young" at the model's assumed date may be "Approaching" or "Peak" now. The fix is to append `Today's date: ${new Date().toISOString().slice(0, 10)}` to the user message.

**11. Custom disliked regions and grapes in profile have no max-count cap**
`app/(tabs)/profile.tsx:88-101`

`handleAddCustomDislikedRegion()` (line 88) and `handleAddCustomDislikedGrape()` (line 96) check for duplicates but not for the 5-item cap that `ChipPicker` enforces for the same fields via `max={5}`. The equivalent favourite-region handler at line 72 does check `current.length >= 5`. Users can accumulate unlimited disliked entries through the free-text input field, bloating the recommend prompt without bound.

---

### Low

**12. No root error boundary — any render exception crashes the entire app**
`app/_layout.tsx`

There is no `<ErrorBoundary>` wrapping the root layout or any tab screen. A runtime render exception (e.g., an unexpected null field in a `RecommendationResponse` returned by the AI) crashes the whole app to a blank screen with no recovery path.

**13. `focusPoint` state is set on every tap but never consumed**
`app/scan/camera.tsx:15-26`

`const [focusPoint, setFocusPoint] = useState(...)` is updated in `handleTap` (line 26) but `focusPoint` is never read or passed to `CameraView`. The `CameraView` component does not expose a prop for a programmatic focus point. Every tap triggers a state update and re-render of `CameraScreen` with no functional effect. The state and handler should be removed until auto-focus by tap-point is properly implemented.

**14. `UserPreferences.defaultCurrency` is defined in the type but doesn't exist in the DB or hook**
`src/types/preferences.ts:7`

The `defaultCurrency: string` field appears in the `UserPreferences` interface. There is no `default_currency` column in any migration, and `usePreferences` never reads or writes it. The field is a dead stub that creates a false impression of multi-currency support.

---

## Supabase and Edge Function Issues

### High

**15. OCR and Recommend functions lack authentication (see Bug #4 above)**

**16. `pricing_cache` lacks RLS (see Bug #5 above)**

---

### Medium

**17. `_strictDiversity` accepted from raw client input without validation**
`supabase/functions/recommend/index.ts:127`

`_strictDiversity` is destructured directly from `req.json()`. Any caller can pass `_strictDiversity: true` on their first request to immediately force the more expensive diversity-retry prompt, bypassing the client-side `hasDuplicateGrapes` check that is supposed to gate the retry. This burns additional Claude API budget on demand.

**18. Both Edge Functions use the deprecated `claude-opus-4-6` model**
`supabase/functions/ocr/index.ts:58,66` / `supabase/functions/recommend/index.ts:170`

Both functions pin to `model: 'claude-opus-4-6'`, which has been superseded by `claude-opus-4-8`. The outdated model may be deprecated or removed, and the current release offers improved instruction-following and output quality. Update both to `claude-opus-4-8`.

---

### Low

**19. `WINE_SEARCHER_API_KEY` non-null asserted but never validated**
`supabase/functions/wine-searcher-proxy/index.ts:1`

`Deno.env.get('WINE_SEARCHER_API_KEY')!` uses a non-null assertion but never checks the value. If the env var is missing from a deployment, the API is called with an empty key, returns a 401, and the catch block returns a silent degradation response (`source: 'unavailable'`). No error is surfaced to deployment monitoring.

**20. `scan_sessions` query has no explicit `user_id` filter — relies entirely on RLS**
`app/(tabs)/history.tsx:17-21`

The query has no `.eq('user_id', session.user.id)` clause. RLS handles isolation correctly today, but if RLS were ever inadvertently disabled on this table, the query would return all users' sessions. A defense-in-depth explicit filter is best practice.

---

## UX and Performance Issues

### High

**21. History cards are tappable but do nothing**
`app/(tabs)/history.tsx:64`

```tsx
<TouchableOpacity style={styles.card}>
```

The `TouchableOpacity` wrapping each history entry has no `onPress` prop. Tapping a card produces visible press feedback but triggers nothing. Users have no way to view the details of a past scan, and there is no route that would display a historical result even if `onPress` were added.

---

### Medium

**22. Preferences flash empty before React Query resolves on the Scan tab**
`app/(tabs)/scan.tsx:24-31`

`wineTypes`, `styleProfiles`, and `budget` are initialised from `savedPreferences` at mount time, when `savedPreferences` is always `undefined`. The `useEffect` at line 59 re-syncs after the query resolves, but the first render shows placeholder text ("e.g. Red Wine", "e.g. Burgundy") instead of the user's saved values. Users with saved preferences see their defaults flash briefly before their actual choices appear.

**23. Duplicate wait-time copy appears during the recommending stage**
`app/scan/extracting.tsx:143-152`

When `stage === 'recommending'`, two body text elements are shown simultaneously: "Scoring by critic rating, vintage quality and value" (from the conditional in the first `<Text>`, line 145) AND "This may take a minute or two" (from the separate `stage === 'recommending'` guard on line 150). The duplicate message is redundant and clutters the loading screen. Remove the second `<Text>` block.

**24. Unbounded parallel OCR requests for multiple screenshots**
`app/scan/extracting.tsx:77`

```ts
const results = await Promise.all(imageUris.map(extractWineList));
```

All OCR requests fire simultaneously. Each encodes a full base64 JPEG and calls the Edge Function, which calls the Claude API. With several screenshots this can exhaust Edge Function concurrency slots or hit Claude rate limits, producing opaque failures. A sequential or concurrency-limited strategy (e.g., `p-limit` with a limit of 2) would be more resilient.

**25. Currency hardcoded to `£` in the results price display**
`app/scan/results.tsx:83`

```tsx
<Text style={styles.price}>£{wine.menuPrice}</Text>
```

`WineRecommendation` has a `currency` field, but the price renders with a hardcoded `£` symbol. Non-GBP menus (EUR, USD, CHF) will display the wrong currency symbol. The display should use the `wine.currency` field to resolve the correct symbol.

---

### Low

**26. "Retake" button label is wrong when arriving from the photo library**
`app/scan/preview.tsx:33`

When arriving via the image picker, pressing "Retake" calls `reset()` and navigates to `/(tabs)/scan` — it does not reopen the library. The label implies the camera or library will reopen. "Choose Again" or "Cancel" would be accurate.

**27. Multiple-screenshot selection skips preview entirely**
`app/(tabs)/scan.tsx:96-100`

Single image: shows preview before extracting. Multiple images: routes directly to `extracting.tsx`. Users with multiple screenshots cannot review or deselect images before the OCR process (which is slow and cannot be cancelled mid-flight) starts.

---

## Navigation Issues

### Medium

**28. `/scan/url` is a dead-end silent redirect**
`app/scan/url.tsx:1-5`

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The URL wine-list input feature is partially implemented in `supabase/functions/ocr/index.ts` (lines 49–63) but the route bounces users back to the Scan tab with no message. Any user or deep link that reaches `/scan/url` is silently redirected with no indication that the feature is unavailable or coming soon.

**29. `/scan/preferences` is unreachable and contains a TypeScript compile error**
`app/scan/preferences.tsx:28-33`

This screen is not navigated to from anywhere in the active flow, but it exists as a registered route. Its call to `recommendWines()` omits five required fields from `RecommendInput`:

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // missing: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```

This is a TypeScript compile error. If the route were accidentally reached, `undefined` values for array arguments would produce runtime failures in the Edge Function. The screen should be wired into the flow correctly or deleted.

**30. Blank screen shown while preferences query resolves for signed-in users**
`app/index.tsx:16`

After `loading` clears, the index component returns `null` while the preferences React Query resolves. A signed-in user who reopens the app sees a blank screen with no visual feedback between the splash screen hiding and the redirect firing. A minimal loading indicator should be shown during this window.
