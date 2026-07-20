# Code Review — 2026-07-07

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

---

## Bugs and Crashes

### High

**1. Scan history is never saved — the history tab is permanently empty**
`app/(tabs)/history.tsx:13` / `app/scan/extracting.tsx:102-116`

No code anywhere in the app writes to the `scan_sessions` table. After `recommendWines()` resolves in `extracting.tsx`, the result is stored in Zustand and the user is routed to results — the DB insert is simply missing. `history.tsx` queries `scan_sessions` and will always land on the "No scans yet" empty state for every user regardless of how many scans they have run.

**2. Supabase upsert error silently ignored — preference saves fail without any feedback**
`src/hooks/usePreferences.ts:38`

```ts
await supabase.from('profiles').upsert({ ... });
```

The returned `{ data, error }` object is never destructured or checked. If the upsert fails (RLS violation, network error, constraint failure), no exception is thrown, `onSuccess` fires, the React Query cache is invalidated, and the user sees nothing wrong. Their preferences are not saved. This affects both the onboarding flow and every in-session edit on the Profile tab.

**3. `handleCapture` in CameraScreen has no try/catch — camera errors are silently swallowed**
`app/scan/camera.tsx:29`

`handleCapture` is `async` but has no error handling. Any exception from `cameraRef.current.takePictureAsync()` or either `ImageManipulator.manipulateAsync()` call (storage full, camera API error, EXIF parse failure) produces an unhandled promise rejection. The user sees nothing — the capture button appears to silently fail.

---

### Medium

**4. Race condition in index.tsx skips onboarding for new signed-in users**
`app/index.tsx:16-21`

The `loading` guard on line 16 waits only for `useAuth` to resolve. The `usePreferences` query resolves independently and asynchronously. When a signed-in user reaches the index for the first time, there is a window where `loading=false` (auth done) and `preferences=undefined` (preferences query still pending). The onboarding check `if (preferences === null)` on line 20 is `false` when preferences is `undefined`, so the user is redirected to `/(tabs)/scan` instead of `/onboarding`. New users who have no profile row in the DB are silently skipped past onboarding.

**5. Onboarding navigation fires before preferences save completes**
`app/onboarding.tsx:38-49`

```ts
updatePreferences({ ... });        // fires mutation — does not await
router.replace('/(tabs)/scan');    // happens immediately
```

`updatePreferences` is `mutation.mutate`, which starts the async upsert but returns synchronously. `router.replace` runs before the Supabase write completes. If the network is slow, the user reaches the scan tab with no profile written. The `isSaving` guard prevents a second click but does not prevent this race.

**6. `router.replace()` called in the render body, not inside `useEffect`**
`app/scan/results.tsx:22-25`

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace()` during render (outside a hook or effect) is a React side-effect-in-render anti-pattern. It fires on every render pass, can trigger React concurrent-mode warnings, and can produce unexpected navigation stack states. Should be wrapped in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])`.

---

### Low

**7. No root error boundary — any render exception crashes the entire app**
`app/_layout.tsx`

There is no `<ErrorBoundary>` wrapping the root layout or any tab screen. A runtime exception during render (e.g., unexpected null field in a `RecommendationResponse` returned by the AI) will crash the whole app to a white screen with no recovery path.

---

## Supabase and Edge Function Issues

### High

**8. OCR and Recommend edge functions have no authentication check**
`supabase/functions/ocr/index.ts:38` / `supabase/functions/recommend/index.ts:115`

Neither function validates that the caller is an authenticated user. The `claude.ts` API layer sends only the anon key (`apikey: ANON_KEY`), not a user JWT (`Authorization: Bearer <access_token>`). The anon key is embedded in the app bundle and trivially extractable with a proxy. Any third party who obtains it can call these AI endpoints — at the app owner's expense — with no rate limiting or user attribution. The fix is to require `Authorization: Bearer <jwt>` and call `supabase.auth.getUser(jwt)` to validate inside each function.

**9. `pricing_cache` table has RLS disabled — any authenticated user can poison the cache**
`supabase/migrations/001_initial_schema.sql:35-43`

`alter table pricing_cache enable row level security` is missing. Authenticated app users can directly query, modify, or delete all rows in `pricing_cache` via the Supabase JS client. The Edge Function uses the service role key and bypasses RLS, but direct client access is completely unrestricted, enabling cache poisoning (injecting false market prices or critic scores).

---

### Medium

**10. Budget enforced in GBP regardless of menu currency**
`supabase/functions/recommend/index.ts:139,157`

The budget lines in the Claude prompt hardcode `£`:

```ts
`HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle`
`- Budget: up to £${budget ?? 'unlimited'} per bottle on the menu`
```

The `ExtractedWine` schema has a `currency` field. If a wine list is in EUR or USD, Claude is being told to enforce a GBP budget against non-GBP prices, producing incorrect budget filtering.

**11. `_strictDiversity` accepted from raw client input without validation**
`supabase/functions/recommend/index.ts:127`

`_strictDiversity` is destructured directly from `req.json()`. A caller can pass `_strictDiversity: true` on their first request to force the stricter (and more expensive) diversity-retry prompt immediately, bypassing the client-side `hasDuplicateGrapes` check that is supposed to gate the retry. This wastes Claude API budget on demand.

---

### Low

**12. `WINE_SEARCHER_API_KEY` used without validation**
`supabase/functions/wine-searcher-proxy/index.ts:1`

`Deno.env.get('WINE_SEARCHER_API_KEY')!` uses a non-null assertion but never validates the value. If the env var is absent in a deployment, the Wine-Searcher API is called with an empty key, returns a 401, and the catch block returns a silent degradation response. The error never surfaces as a deployment alert.

---

## UX and Performance Issues

### High

**13. History cards are tappable but do nothing**
`app/(tabs)/history.tsx:64`

```tsx
<TouchableOpacity style={styles.card}>
```

The `TouchableOpacity` wrapping each history entry has no `onPress` prop. Tapping it produces visible press feedback but triggers nothing. Users have no way to view the details of a past scan.

---

### Medium

**14. Preferences flash empty before React Query resolves**
`app/(tabs)/scan.tsx:24-29`

`wineTypes`, `styleProfiles`, and `budget` are initialised from `savedPreferences` on the initial render, which is always `undefined` before the query completes. The useEffect at line 59 re-syncs after the data loads, but the initial render shows empty/default values. Users briefly see "e.g. Red Wine" and "e.g. Burgundy" placeholders instead of their saved preferences.

**15. Misleading in-progress copy — profile note appears during OCR, not recommendation**
`app/scan/extracting.tsx:155-159`

During the `'reading'` stage (OCR is running), the screen shows: *"We're making a recommendation based on your profile preferences. Change your preferences for this result only by setting filters for this search."* OCR is happening at this point — preferences are not yet involved. The copy is factually wrong for the current stage and the instruction to "set filters for this search" refers to UI that does not exist on this screen.

**16. Unbounded parallel OCR for multiple screenshots**
`app/scan/extracting.tsx:77`

```ts
const results = await Promise.all(imageUris.map(extractWineList));
```

All OCR requests fire simultaneously. Each call sends a full base64 JPEG to the edge function, which calls Claude. With a large set of screenshots, this exhausts edge function concurrency or hits Claude rate limits, producing an opaque error. A sequential or concurrency-limited approach (e.g., `p-limit`) would be more resilient.

---

### Low

**17. "Retake" button label is wrong for screenshot upload path**
`app/scan/preview.tsx:33`

When arriving at preview via the photo library picker (not the camera), pressing "Retake" calls `reset()` and routes to `/(tabs)/scan`. The label implies it reopens the camera or library, but it discards the selection and exits. "Choose Again" or "Cancel" would be clearer.

**18. Multiple screenshot selection skips the preview step**
`app/(tabs)/scan.tsx:97-101`

When a user selects more than one image, the flow goes directly to `extracting.tsx`. For a single image, preview is shown first. This inconsistency means users with multiple screenshots have no way to review or deselect images before the (potentially slow and expensive) OCR starts.

---

## Navigation Issues

### Medium

**19. `/scan/url` is a dead-end redirect for an unfinished feature**
`app/scan/url.tsx:1-5`

```tsx
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The URL wine-list input feature exists in the OCR edge function (`supabase/functions/ocr/index.ts:49-63`) but the route just bounces users back to the scan tab with no explanation. Any user or deep link that reaches `/scan/url` gets silently redirected with no indication that the feature is unavailable.

**20. `/scan/preferences` is unreachable but contains a broken `recommendWines` call**
`app/scan/preferences.tsx:28-34`

The preferences screen is not navigated to from anywhere in the current flow. However, it exists as a valid route and calls `recommendWines` with missing required fields:

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // missing: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```

This is a TypeScript compile error (`RecommendInput` requires all five omitted fields). If this route were ever navigated to, the call would pass `undefined` for the array arguments, causing runtime failures in the edge function. The screen should either be wired into the flow correctly or deleted.

**21. No loading state during preferences resolution for signed-in users**
`app/index.tsx:16`

After auth resolves, the index component returns `null` while waiting for the preferences query. This renders a blank screen with no visual feedback — the user sees nothing between the splash screen hiding and the redirect firing.
