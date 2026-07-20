# Code Review — 2026-05-25

Reviewed by: automated review agent  
Scope: full codebase — `app/`, `src/`, `supabase/functions/`, `supabase/migrations/`

This report documents **new findings not present in the 2026-05-24 review**, followed by a priority summary of critical findings from that report that remain unresolved. All line numbers reference the current state of the files.

---

## Bugs and Crashes

### High Severity

**1. `src/api/claude.ts:7-13` — OCR and Recommend edge function calls do not send the user's JWT**

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
},
```

`invokeFunction()` calls the OCR and Recommend edge functions using raw `fetch` with only the anon key. No `Authorization: Bearer <token>` header is attached. The `wine-searcher-proxy` path avoids this problem by using `supabase.functions.invoke()`, which automatically attaches the session JWT. As a result: (a) if JWT verification is added to the edge functions per the security recommendations in the 2026-05-24 report, all OCR and Recommend calls will immediately break with 401 and the connection between `claude.ts` and the edge functions will need to be reworked; (b) the current architecture means there is no way to attribute edge function invocations to a specific user for rate-limiting or abuse tracking. Replace the raw `fetch` in `invokeFunction` with `supabase.functions.invoke()` so that the session JWT is forwarded automatically.

**2. `app/onboarding.tsx:38-50` — Preferences silently discarded on slow or failing network**

```tsx
function handleNext() {
  if (isLast) {
    updatePreferences({ wineTypes, styleProfiles, ... }); // fire-and-forget
    router.replace('/(tabs)/scan');                        // immediate navigation
  }
}
```

`updatePreferences` is `mutation.mutate` from React Query, which queues the mutation and returns `void` immediately — it does not wait for the Supabase upsert to complete. `router.replace` runs synchronously in the same call frame, before any re-render or network activity. If the upsert fails (network error, RLS violation, cold-start timeout), the user has completed onboarding, been navigated to the scan tab, and their entire preference set has been silently discarded. They will see empty defaults on every subsequent scan with no indication that anything went wrong. The `isSaving` / `disabled` guard on the button does not prevent this because it cannot fire until after the next render cycle, which the synchronous navigation prevents. Fix: use `mutateAsync` and `await` it, navigate in the `onSuccess` callback, and show an error state in `onError`.

---

### Medium Severity

**3. `app/(tabs)/scan.tsx:86-101` — `handleScreenshot` missing try/catch, unhandled rejection on image picker failure**

```tsx
async function handleScreenshot() {
  const result = await ImagePicker.launchImageLibraryAsync({ ... });
  ...
}
```

`handleScreenshot` is an `async` function with no `try/catch`. On Android, `launchImageLibraryAsync` can throw if storage permission is revoked between the permission check and the picker launch, or if the OS kills the picker intent. The uncaught promise rejection propagates to the top level; in Expo production builds this triggers the global unhandled rejection handler and can crash the scan tab. Wrap the body in try/catch and show an `Alert` on failure.

**4. `app/(tabs)/history.tsx:65` — `date-fns format()` throws on null or invalid `captured_at`**

```tsx
{format(new Date(item.captured_at), 'd MMM yyyy · h:mm a')}
```

`new Date(null)` produces `Invalid Date`; `format()` from date-fns throws "Invalid time value" when passed one. The `captured_at` column in `supabase/migrations/001_initial_schema.sql:19` has a `default now()` but no `NOT NULL` constraint, so a null value is technically possible. If any one row has a null or malformed `captured_at`, the entire `FlatList` render throws and the History tab crashes with an uncaught error boundary gap (there are no error boundaries in the app). Add a null/validity guard: `item.captured_at ? format(new Date(item.captured_at), ...) : 'Unknown date'`.

---

### Low Severity

**5. `app/(tabs)/scan.tsx:3-6`, `app/(tabs)/profile.tsx:5-7`, `app/scan/results.tsx:12-14` — `UIManager.setLayoutAnimationEnabledExperimental` called at module scope in three separate files**

```tsx
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
```

This Android API is called at the top level of three different screen modules. Module-level side effects run on every first import of the module. In production this is typically benign (each module imports once), but in development with Fast Refresh the modules can be re-evaluated multiple times, generating redundant calls and potentially masking warnings about calling this after the UI thread has started. Centralise this call once in `app/_layout.tsx` and remove it from the three screen files.

---

## Supabase and Edge Function Issues

**6. `supabase/functions/wine-searcher-proxy/index.ts:48` — Wine Searcher API key included as a URL query parameter**

```ts
const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&winename=...`;
```

HTTP request URLs, including query strings, are routinely recorded in web server access logs, CDN edge logs, and Supabase's own function invocation logs. An API key embedded in a URL is visible in plain text in any of these log sinks. If the Wine Searcher API supports header-based authentication (e.g. `Authorization: Bearer` or `X-Api-Key`), the key should be moved there. If URL-based auth is the only option, this should be explicitly noted as an accepted risk and the project's Supabase function logs should be reviewed for access controls.

---

## UX and Performance Issues

**7. `app/scan/extracting.tsx:144-162` — loading screen shows two separate "this may take a minute" messages simultaneously during the recommending stage**

```tsx
<Text style={styles.body}>
  {stage === 'reading'
    ? 'This could take a minute or two'
    : 'Scoring by critic rating, vintage quality and value'}
</Text>
{stage === 'recommending' && (
  <Text style={styles.body}>This may take a minute or two</Text>  // line 151
)}
```

During the `recommending` stage, the first `<Text>` shows "Scoring by critic rating, vintage quality and value" and the second renders "This may take a minute or two" directly below. These two messages appear simultaneously in the same view and read as contradictory or poorly structured to a user looking at the loading screen. There is no visual separator between them. Merge them into a single coherent message per stage.

**8. `app/scan/extracting.tsx` — no timeout or abort on long-running OCR and Recommend fetches**

The OCR step calls `callOCR` which calls `invokeFunction('ocr', ...)` using a raw `fetch` with no `AbortController` or timeout option. Supabase edge functions have a 60-second wall-clock limit; a Claude API call that runs close to that limit will receive a `504 Gateway Timeout` from the Supabase gateway. The client's `fetch` call will see a non-OK response and throw a useful error. However, if the user's **network connection drops mid-request**, the `fetch` call hangs indefinitely on some React Native network stacks (particularly on iOS when transitioning between WiFi and cellular). The user would be stuck on the loading screen with the spinner running forever, unable to cancel. Add an `AbortController` with a 90-second timeout to both OCR and Recommend fetch calls, and surface the timeout as a human-readable error message.

---

## Navigation Issues

No new navigation issues were identified in this review cycle. The following issues from the 2026-05-24 report remain unresolved and are re-listed here at reduced detail for tracking:

- **`app/scan/results.tsx:22-24`** — `router.replace()` called during render (finding #2 in 2026-05-24 report). Still present.
- **`app/scan/preferences.tsx`** — unreachable dead route with broken `recommendWines` call (findings #12 and #28). Still present.
- **`app/scan/url.tsx`** — stub route that redirects immediately, URL scan feature non-functional (finding #29). Still present.
- **`app/(auth)/sign-in.tsx:48`** — "Continue without account" does not set `hasLaunched`, causing returning guest to see welcome screen on next cold launch (finding #31). Still present.

---

## Critical Unresolved Findings from 2026-05-24 (High Priority)

The following findings from yesterday's report have not been addressed and are reproduced here with abbreviated descriptions to maintain visibility. The full detail is in `reports/2026-05-24-code-review.md`.

| # | File | Issue | Severity |
|---|------|--------|----------|
| 3 | `app/scan/extracting.tsx` + Supabase | Scan sessions are **never written** to `scan_sessions` — History tab is permanently empty for all users | High |
| 4, 5, 18 | `supabase/functions/ocr/index.ts`, `recommend/index.ts`, `wine-searcher-proxy/index.ts` | All three edge functions accept any request with the anon key — no JWT verification. High-cost Claude Opus calls are open to abuse | High |
| 2 | `app/scan/results.tsx:22-24` | `router.replace()` called during render, not in `useEffect` — React 18 anti-pattern causing intermittent navigation failures | High |
| 6 | `app/index.tsx:20` | `preferences === null` check misses `undefined` loading state — newly signed-in users can bypass onboarding | Medium |
| 8 | `src/hooks/usePreferences.ts:38` | Supabase upsert error silently dropped — preference saves fail without user feedback | Medium |
| 9 | `supabase/functions/ocr/index.ts:84`, `recommend/index.ts:181` | `response.content[0]` accessed without array length check — crashes when Claude returns empty content (content policy block) | Medium |
| 10 | `supabase/functions/ocr/index.ts:51` | SSRF via unvalidated `url` parameter — any caller can make the edge function issue requests to internal Supabase endpoints or cloud metadata APIs | Medium |
| 24 | `app/(auth)/sign-up.tsx` | Email confirmation deep link not configured — sign-up confirmation flow opens a browser instead of the app; session is never established on mobile | Medium |
| 17 | `supabase/migrations/001_initial_schema.sql:34` | `pricing_cache` table has no RLS — readable and writable by any authenticated or anonymous request via Supabase REST API | Medium |
