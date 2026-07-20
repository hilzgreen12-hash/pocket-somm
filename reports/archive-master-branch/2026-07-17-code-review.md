# Code Review — 2026-07-17

Reviewed: Pocket Somm (Expo SDK 54, expo-router, Supabase, Claude API)

---

## Status of Prior High-Severity Findings

The following **High** findings from the 2026-07-16 report are **still unresolved** in the current codebase:

- `app/scan/results.tsx:23` — Router called during render body (crash on Android)
- `app/_layout.tsx` — No error boundary anywhere in the app
- `app/index.tsx:20` — New signed-in users can bypass onboarding (race condition)

The following **Medium** findings from 2026-07-16 are also still unresolved:

- `src/hooks/usePreferences.ts:38` — Upsert errors silently discarded
- `src/api/claude.ts:17` — `JSON.parse` may throw `SyntaxError` on non-JSON gateway errors
- `supabase/functions/ocr/index.ts:2` and `supabase/functions/recommend/index.ts:2` — Model ID `claude-opus-4-6` is one major version behind `claude-opus-4-8`
- `app/(auth)/sign-in.tsx:48` — "Continue without account" does not persist `hasLaunched`

---

## New Findings

---

## Bugs and Crashes

### High

**1. `app/(tabs)/history.tsx:71` — `recommendation.topPick` does not exist; wine names never appear in history**

```tsx
{item.recommendation?.topPick && (
  <Text style={styles.cardWine}>{item.recommendation.topPick.name}</Text>
)}
```

`RecommendationResponse` (defined in `src/types/wine.ts:50`) has two fields: `wines: WineRecommendation[]` and `summary: string`. There is no `topPick` field. `item.recommendation?.topPick` is always `undefined`, so the condition is always false, and wine names are never rendered on any history card. The correct expression is `item.recommendation?.wines?.[0]?.name`. This is invisible to TypeScript if `recommendation` is typed as `any` or `Json` from the Supabase column — check whether the query result is being cast without validation.

Severity: **High**

---

**2. `app/_layout.tsx:15` — Font load error is silently ignored; app can hang on splash indefinitely**

```ts
const [fontsLoaded] = Font.useFonts({ ... });
```

`expo-font`'s `useFonts` returns `[boolean, Error | null]`. The code destructures only the first element. If any font file is missing from the bundle (broken build, OTA update corruption, or network failure during a dynamic font fetch), `fontsLoaded` remains `false` forever. Line 28 returns `null` indefinitely and `SplashScreen.hideAsync` is never called, leaving the user on a permanent splash screen with no error message and no recovery path.

Fix: destructure and handle the error:
```ts
const [fontsLoaded, fontError] = Font.useFonts({ ... });

useEffect(() => {
  if (fontError) {
    console.error('[Fonts] Failed to load:', fontError);
    SplashScreen.hideAsync().catch(() => {});
  }
}, [fontError]);

if (!fontsLoaded && !fontError) return null;
```

Severity: **High**

---

### Medium

**3. `src/api/claude.ts:6–14` — OCR and Recommend edge functions called without the user's auth token**

```ts
async function invokeFunction(name: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,    // anon key only — no Authorization header
    },
    ...
  });
}
```

`wine-searcher.ts` (line 12) uses `supabase.functions.invoke`, which automatically attaches `Authorization: Bearer <access_token>` from the current session. The hand-rolled `fetch` in `claude.ts` sends only the anon key, so the edge functions have no way to identify the calling user. Consequences: (a) there is no per-user rate limiting on expensive Anthropic API calls — any holder of the published anon key can invoke OCR and Recommend at scale; (b) if these edge functions are ever updated to require authentication (e.g., to write scan history server-side), all existing clients will silently receive `401` responses.

Fix: use `supabase.functions.invoke` for all three functions, or manually retrieve the session token and add `Authorization: Bearer ${session?.access_token}` to the headers.

Severity: **Medium**

---

**4. `supabase/functions/wine-searcher-proxy/index.ts:48` — API key exposed in URL query string**

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&winename=...`;
```

Embedding the API key as a URL query parameter causes it to appear in Supabase edge function logs, Wine-Searcher's server-side access logs, and any intermediate network proxy. If Wine-Searcher's API supports an `Authorization` or `X-API-Key` header (common for REST APIs), prefer that approach. At minimum, redact this field in any log pipeline before it is written to persistent storage.

Severity: **Medium**

---

**5. `app/(tabs)/scan.tsx:94–99` — Multi-image selection skips the confirmation preview; no cancel path**

```ts
if (result.assets.length === 1) {
  setImage(result.assets[0].uri);
  router.push('/scan/preview');   // user can review and cancel
} else {
  setImageUris(result.assets.map((a) => a.uri));
  router.push('/scan/extracting'); // jumps straight to OCR — no back button
}
```

When a user picks a single image from the library they land on `/scan/preview` where they can inspect the image and tap "Retake" to abort. When they pick multiple images they are sent directly to `/scan/extracting`, where the only escape is the "Try Again" error button or waiting for the full OCR pipeline to run. If the user accidentally included a wrong image in a multi-select there is no way to correct it short of waiting for the flow to fail. Add a multi-image preview or confirmation step, or at minimum add a "Cancel" button on the `extracting` screen.

Severity: **Medium**

---

**6. `app/scan/preferences.tsx:28–29` — `recommendWines` called with structurally incomplete payload**

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // missing: wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes
});
```

`RecommendInput` in `src/services/recommender.ts:5–15` declares `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes` as required fields. The `preferences.tsx` call omits all five. TypeScript should flag this as a type error. At runtime, the edge function receives `undefined` for each omitted field, which means all hard rules in the system prompt (colour filter, exclusion lists, favourites) receive `undefined` inputs and behave unpredictably. This screen is currently unreachable (noted in the 2026-07-16 report), but the payload bug means any future attempt to wire it in will silently send malformed data.

Severity: **Medium** (latent, screen currently orphaned)

---

### Low

**7. `src/services/recommender.ts:79–82` — Duplicate-grape retry falls through to the original bad result without logging**

```ts
const raw2 = await callRecommend({ ...input, _strictDiversity: true });
const parsed2 = RecommendationResponseSchema.safeParse(raw2);
if (parsed2.success) return parsed2.data;
// falls through silently if parsed2 fails
return parsed.data;   // original result with duplicate grapes
```

If the retry call itself returns an unparseable response, `parsed2.success` is `false`, and the code returns `parsed.data` — the original response that had duplicate grapes. There is no `console.warn` at this point, so the caller has no visibility that the retry failed and the diversity constraint was not met. Add a warning log before the fallback return.

Severity: **Low**

---

**8. `supabase/functions/recommend/index.ts:194` — Error response omits `Content-Type: application/json` header**

```ts
// Success path:
return new Response(JSON.stringify(parsed), {
  headers: { 'Content-Type': 'application/json' },  // present
});
// Error path:
return new Response(JSON.stringify({ error: message }), { status: 500 }); // missing
```

The error response body is JSON but the header is absent. The Supabase SDK and most HTTP clients will still parse it correctly since `claude.ts` calls `res.text()` then `JSON.parse`, but the inconsistency causes confusion when inspecting responses in logs or Supabase's dashboard and may break clients that rely on content negotiation.

Severity: **Low**

---

## Supabase and Edge Function Issues

**9. `supabase/functions/ocr/index.ts:59` and `supabase/functions/recommend/index.ts:170` — Anthropic SDK key passed with non-null assertion; no startup validation**

```ts
const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
```

The `!` non-null assertion bypasses TypeScript's safety check. If `ANTHROPIC_API_KEY` is not set in the edge function's environment (e.g., after a Supabase project migration or secret rotation failure), `Deno.env.get` returns `undefined`, which is silently passed to the Anthropic SDK. The function initialises without error but fails at the first API call with a cryptic authentication error rather than a clear startup message. Add an explicit check:

```ts
const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
const client = new Anthropic({ apiKey });
```

This is especially important because `WINE_SEARCHER_API_KEY` in the proxy function (line 1) has the same pattern.

---

**10. `supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` — No CORS headers; cross-origin calls will fail if a web client is ever added**

Neither edge function returns `Access-Control-Allow-Origin` headers or handles `OPTIONS` preflight requests. If the app is ever served via the Expo web target (`expo start --web`) or a PWA, all fetch calls from the browser will be blocked by CORS policy. Supabase edge function deployments require explicit CORS configuration; add the standard preflight handler pattern used in Supabase's own function templates.

---

**11. `src/hooks/usePreferences.ts:10–33` — `useQuery` does not surface `isLoading` or `isError` to callers**

```ts
const { data: preferences } = useQuery({ ... });
return { preferences, updatePreferences: mutation.mutate, isSaving: mutation.isPending };
```

`isLoading` and `isError` are not included in the return value. All call sites check `preferences` for truthiness to determine whether data has loaded, but `useQuery` returns `undefined` for `data` both while loading AND when the row does not exist. Callers cannot distinguish between "still fetching" and "confirmed no profile row." This is the root cause of the onboarding race condition noted in the 2026-07-16 report (Bug #3). Expose `isLoading` (or `isPending`) from the hook.

---

## UX and Performance Issues

**12. `app/(tabs)/scan.tsx:24–26` — Local preference state initialised to `undefined` before saved preferences load**

```ts
const [wineTypes, setWineTypes] = useState<WineType[]>(
  savedPreferences?.wineTypes ?? []   // savedPreferences is undefined on first render
);
```

On first render `savedPreferences` is `undefined` (React Query has not yet resolved), so all three local state values are initialised to their empty/null defaults. The `useEffect` at lines 59–66 corrects this once `savedPreferences` arrives, but until then the scan form shows the user's default preferences as empty even if they have saved preferences. If the user is fast and taps "Scan Wine List" before the `useEffect` fires, their saved wine types, style profiles, and budget are not included in the scan preferences.

Severity: **Medium**

---

**13. `app/(tabs)/profile.tsx:153` — "Change your subscription email account" is misleading copy**

```tsx
<Text style={styles.emailLabel}>Change your subscription email account</Text>
```

The app has no subscription or billing — this is a free Expo/Supabase auth app. Calling the account a "subscription email account" implies a paid tier that does not exist and will confuse users, particularly if they are trying to simply update their login email. Change the label to "Change email address" or "Update login email".

Severity: **Low**

---

**14. `app/scan/extracting.tsx:144–152` — Loading copy is grammatically inconsistent across stages**

During the `reading` stage, the body text is:
> "This could take a minute or two"

During the `recommending` stage, the primary body (line 148) is:
> "Scoring by critic rating, vintage quality and value"

…followed immediately by a second `<Text>` block (line 151) that also renders:
> "This may take a minute or two" (note: "may" vs. "could")

This was flagged in the 2026-07-16 report (Finding #19) and is still present. The duplicate text block at lines 150–152 should be removed and the timing note consolidated into the single body string for the recommending stage.

Severity: **Low**

---

## Navigation Issues

**15. `app/(tabs)/scan.tsx:81–84` — `handleScan` navigates to camera without validating permissions**

```ts
function handleScan() {
  setPreferences(buildPreferences());
  router.push('/scan/camera');
}
```

`CameraScreen` requests camera permission after mounting, showing a blank black screen for a moment before the permission dialog appears. If the user has permanently denied camera permissions, they land on the `PermissionScreen` component inside `CameraScreen` — but there is no way to navigate back to the scan tab from there without using the OS back gesture. The `PermissionScreen` component (`src/components/scan/PermissionScreen.tsx`) should include a "Go Back" button alongside "Allow Camera Access".

Severity: **Medium**

---

**16. `app/onboarding.tsx:37–44` — Navigation fires before preferences are saved (still unresolved from 2026-07-16)**

```ts
function handleNext() {
  if (isLast) {
    updatePreferences({ ... });
    router.replace('/(tabs)/scan');  // fires in same tick as mutation dispatch
  }
}
```

`updatePreferences` dispatches a fire-and-forget mutation. `router.replace` runs synchronously in the same call, before the Supabase upsert completes. A user who loses connectivity in the instant between navigation and save will arrive at the scan tab with no stored preferences and no error message. This was flagged in the 2026-07-16 report (Finding #24) and is still unresolved. Move `router.replace` into the mutation's `onSuccess` callback.

Severity: **Medium**

---

**17. `app/(auth)/sign-in.tsx:48` — "Continue without account" leaves `hasLaunched` unset (still unresolved from 2026-07-16)**

See 2026-07-16 Finding #7. Still present. If a user navigates to sign-in and then taps "Continue without account", they bypass the `welcome.tsx` screen that calls `AsyncStorage.setItem('hasLaunched', 'true')`. On next cold launch they will see the welcome screen again. Add `await AsyncStorage.setItem('hasLaunched', 'true')` to the guest button's `onPress`.

Severity: **Medium**
