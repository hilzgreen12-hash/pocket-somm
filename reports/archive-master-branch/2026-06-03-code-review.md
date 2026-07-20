# Code Review — 2026-06-03

Automated review of the Pocket Somm Expo/Supabase codebase. All findings include a file path and line number.

---

## Bugs and Crashes

### High

**1. New signed-in users skip onboarding due to `undefined` vs `null` race condition**
`app/index.tsx:20`

After auth resolves, `usePreferences` is still loading and returns `preferences === undefined`. The guard `if (preferences === null)` is false for `undefined`, so a brand-new user with no saved profile is immediately redirected to `/(tabs)/scan` instead of `/onboarding`. Once the preferences query finishes and returns `null` (no profile row found), the `index` component is no longer mounted and the redirect never fires. New signed-in users reliably bypass onboarding on first launch.

Fix: also wait for the preferences query to settle. Expose `isLoading` from `usePreferences` and add it to the early-return guard alongside `loading`:
```tsx
if (loading || isLoading || hasLaunched === null) return null;
```

---

**2. `JSON.parse` called without try/catch on Edge Function responses**
`src/api/claude.ts:17`

```typescript
return JSON.parse(text);
```

If Supabase infrastructure returns an HTML error page (e.g., a 503 from the edge network, a Cloudflare interstitial, or a cold-start timeout), `JSON.parse` throws a `SyntaxError: Unexpected token '<'`. This propagates all the way up to the user as an opaque crash rather than a readable message. The error boundary in `extracting.tsx` will catch it, but the message displayed will be the raw parse error, not something actionable.

Fix: wrap in try/catch and rethrow with a user-friendly message:
```typescript
try {
  return JSON.parse(text);
} catch {
  throw new Error(`Unexpected response from ${name}. Please try again.`);
}
```

---

### Medium

**3. `handleCapture` in camera screen has no error handling**
`app/scan/camera.tsx:29-99`

`takePictureAsync()` and `manipulateAsync()` are both capable of throwing — hardware errors, insufficient storage, permission revocation mid-session. Neither call is wrapped in try/catch. An unhandled rejection here freezes the camera screen with no feedback and no way for the user to recover except force-quitting the app.

Fix: wrap `handleCapture` body in try/catch and navigate to an error state or show an Alert.

---

**4. `router.replace()` called during render, not inside `useEffect`**
`app/scan/results.tsx:24-27`

```tsx
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace()` synchronously during a component render is a side effect inside React's render cycle. React's concurrent renderer and StrictMode may invoke the render function multiple times, triggering duplicate navigation calls. The correct pattern is to place this inside a `useEffect`.

Fix:
```tsx
useEffect(() => {
  if (!recommendation) router.replace('/(tabs)/scan');
}, [recommendation]);
if (!recommendation) return null;
```

---

**5. Onboarding save fires and then immediately navigates away without awaiting result**
`app/onboarding.tsx:38-47`

```typescript
function handleNext() {
  if (isLast) {
    updatePreferences({ ... });      // mutation.mutate — fire and forget
    router.replace('/(tabs)/scan');  // navigates immediately
  }
}
```

`mutation.mutate` does not return a promise. Navigation happens synchronously after dispatch, before the save has completed. If the Supabase write fails (network error, RLS rejection), the user is already on the scan screen with no indication their preferences were not saved.

Fix: use `mutateAsync` and await it, keeping the user on the onboarding screen until the save either succeeds or fails with an error alert.

---

**6. Upsert result in `usePreferences` mutation is silently discarded**
`src/hooks/usePreferences.ts:38`

```typescript
await supabase.from('profiles').upsert({ ... });
```

The return value is discarded entirely — `{ data, error }` is not destructured. If the upsert fails (RLS rejection, constraint violation, network error), the `onError` callback on line 50 never fires because no error is thrown. The mutation reports success and the cache is invalidated, but no data was actually written.

Fix:
```typescript
const { error } = await supabase.from('profiles').upsert({ ... });
if (error) throw error;
```

---

**7. `recommendWines` call in preferences screen is missing required fields**
`app/scan/preferences.tsx:28-34`

```typescript
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes — all missing
});
```

The `RecommendInput` interface (`src/services/recommender.ts:5-15`) requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. These are passed as `undefined` here, which TypeScript should catch as a compile-time error. The screen is not reachable from the current navigation flow (see Navigation Issues §20), which masks the bug.

---

## Supabase and Edge Function Issues

### High

**8. SSRF vulnerability in OCR Edge Function URL path**
`supabase/functions/ocr/index.ts:51-53`

```typescript
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

`url` is taken directly from the POST body with no validation. An attacker can supply any URL — including `http://169.254.169.254/latest/meta-data/` (AWS instance metadata), internal Supabase service URLs, or any private network endpoint reachable from the Edge Function's execution environment. The fetched content is then passed to the Claude API and the response returned to the caller, making this a potential data exfiltration vector.

Fix: validate that `url` is a parseable `https://` URL pointing to a public hostname before fetching. At minimum reject `localhost`, RFC-1918 ranges, and link-local addresses.

---

**9. Edge Functions callable by anyone with the anon key — no authentication check**
`src/api/claude.ts:6-17`

```typescript
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,   // only the anon key, no Authorization JWT
},
```

`EXPO_PUBLIC_SUPABASE_ANON_KEY` is baked into the app bundle and visible to anyone who inspects it. Both Edge Functions (`ocr` and `recommend`) accept any request bearing the anon key, with no check for a valid user session. An external caller can invoke the OCR or recommend functions repeatedly at no cost to themselves, running up Claude API charges on the project account.

Fix: pass the user's session JWT in the `Authorization: Bearer <token>` header. In the Edge Functions, call `supabase.auth.getUser()` (using the request's Authorization header) and reject requests from unauthenticated callers with a 401.

---

### Medium

**10. History query has no explicit user-id filter — relies entirely on RLS**
`app/(tabs)/history.tsx:16-25`

```typescript
const { data, error } = await supabase
  .from('scan_sessions')
  .select('*')
  .order('captured_at', { ascending: false })
  .limit(50);
```

There is no `.eq('user_id', session!.user.id)` filter. If RLS is misconfigured on the `scan_sessions` table, this query returns all users' scan history. Best practice is to include the explicit filter even when RLS exists, so the query is self-documenting and safe even during policy changes.

---

**11. Both Edge Functions use an outdated Claude model**
`supabase/functions/ocr/index.ts:57` and `supabase/functions/recommend/index.ts:169`

Both functions specify `model: 'claude-opus-4-6'`. The current model family as of this review:
- Opus: `claude-opus-4-8`
- Sonnet: `claude-sonnet-4-6`
- Haiku: `claude-haiku-4-5-20251001`

`claude-opus-4-6` is a retired model identifier. Anthropic will eventually sunset it; calls may silently fall back to an older or unspecified version. The OCR function is a particularly poor fit for Opus — `claude-haiku-4-5-20251001` handles structured image extraction at a fraction of the cost and with lower latency.

---

**12. Budget prompt hardcodes `£` currency regardless of the wine list's actual currency**
`supabase/functions/recommend/index.ts:138-139`

```typescript
const budgetLine = budget
  ? `HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle. ...`
  : '';
```

And in the user context block (line 155):
```typescript
- Budget: up to £${budget ?? 'unlimited'} per bottle on the menu
```

If the restaurant prices wines in USD, EUR, or another currency, the prompt instructs the model to compare against a `£` value, creating a currency mismatch. A wine priced at $80 would be incorrectly evaluated against a `£80` budget. The currency should be passed from the client (already tracked in `ExtractedWine.currency`) and used in the prompt.

---

## UX and Performance Issues

### Medium

**13. Duplicate "may take a minute or two" messages shown simultaneously during recommending stage**
`app/scan/extracting.tsx:146,150-151`

During the `recommending` stage, both these `Text` elements are visible at once:

- Line 146: `'This could take a minute or two'` (rendered unconditionally as the `body` style text)
- Lines 150-152: `{stage === 'recommending' && <Text style={styles.body}>This may take a minute or two</Text>}`

The first message is outside the stage conditional and shows for both `reading` and `recommending`. The user sees two nearly identical wait messages stacked on top of each other during recommendation.

---

**14. No error feedback if `updatePreferences` fails in onboarding**
`app/onboarding.tsx:132-143`

The `isSaving` spinner is shown on the Next button, but if the mutation fails, the user receives no alert. The `onError` handler in `usePreferences.ts:50` only calls `console.error`, which is invisible to the user. Combined with Bug #5 (navigation happens before the save anyway), users may proceed without any confirmation their preferences were stored.

---

**15. `handleSignOut` has no error handling**
`app/(tabs)/profile.tsx:130-133`

```typescript
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

If `signOut()` fails (network error), the user is redirected to the sign-in screen while still holding a valid session in SecureStore. On next app launch the auth check will restore the session and the user will be back in the app — but their expectation was that they signed out. The error should be caught and displayed.

---

**16. `prefsLoaded` flag prevents preferences from re-syncing within a session**
`app/(tabs)/scan.tsx:58-66`

```typescript
const [prefsLoaded, setPrefsLoaded] = useState(false);
useEffect(() => {
  if (savedPreferences && !prefsLoaded) {
    ...
    setPrefsLoaded(true);
  }
}, [savedPreferences]);
```

Once `prefsLoaded` is true, any subsequent invalidation of the `preferences` query (e.g., after saving from the Profile tab) will not update the scan screen's local state. If a user updates their preferences on the Profile tab and returns to Scan, the scan screen will still show the old defaults.

---

### Low

**17. Blank screen flash while fonts load before splash hides**
`app/_layout.tsx:28`

`SplashScreen.hideAsync()` is called when `fontsLoaded === true`, but the component returns `null` before that point. There is a brief window — after the splash screen hides and before the first paint — where the user sees a blank screen if font loading is slow. On slower devices this can be a visible 100–300 ms flash.

---

## Navigation Issues

### High

**18. History cards are tappable but have no `onPress` handler — dead-end**
`app/(tabs)/history.tsx:64`

```tsx
<TouchableOpacity style={styles.card}>
```

The `onPress` prop is absent. Tapping any past scan does nothing. There is no detail screen defined in the router. The history tab lists past scans but provides no way to view or revisit them — this is a core feature dead-end.

---

### Medium

**19. `/scan/url` route silently redirects to scan tab with no user explanation**
`app/scan/url.tsx:1-5`

```typescript
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The URL scan feature was planned but not implemented. The route exists in the filesystem and is registered by expo-router, but any navigation to `/scan/url` silently drops the user back at the scan tab. If any in-app link or deep link ever targets this route, users will be confused by the apparent no-op.

---

**20. `app/scan/preferences.tsx` is an orphaned screen unreachable from the current navigation flow**
`app/scan/preferences.tsx` (entire file)

The current scan flow is: camera → preview → extracting → results. The `preferences.tsx` screen was part of an older flow and is no longer navigated to from anywhere in the app. It contains stale logic (missing required fields on `recommendWines` call, per Bug #7) and a partial preference UI that duplicates what the scan tab already shows. It will appear in expo-router's route list but is a dead screen. It should be removed or documented as intentionally disabled.
