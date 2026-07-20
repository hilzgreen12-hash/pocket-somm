# Automated Code Review — 2026-05-15

> Issues carried forward from previous reviews (unresolved as of 2026-05-10) are marked **[UNRESOLVED]**.  
> New findings discovered in this review are marked **[NEW]**.

---

## Bugs and Crashes

### HIGH — `app/scan/results.tsx:22–24` — `router.replace` called during render [UNRESOLVED]

```ts
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

`router.replace` is called synchronously in the component body — not inside a `useEffect` — making it a side effect during the React render phase. This is illegal in React and triggers a "Cannot update a component while rendering a different component" warning, which can escalate to a crash loop if `useScanStore` is partially reset between renders (e.g., `reset()` is called, nulling `recommendation`, while the results screen is still mounted).

**Fix:** wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])` and return `null` on the same condition outside the effect.

**Severity: High**

---

### HIGH — `app/_layout.tsx:14–39` — No root error boundary [UNRESOLVED]

The entire app renders under `<AuthProvider>` and `<QueryClientProvider>` with no React `ErrorBoundary`. Any uncaught render exception — a null-dereference in a result component, a malformed Claude response that slips past Zod, or an issue resolving a custom font — crashes to a blank screen with no recovery path. The user must force-quit and restart.

**Fix:** wrap the children of `RootLayout` in a custom `ErrorBoundary` class component that renders a "Something went wrong — tap to restart" fallback.

**Severity: High**

---

### HIGH — `src/api/claude.ts:7–18` — Edge functions called with anon key only; no user auth header [UNRESOLVED]

```ts
headers: {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
},
```

`ANON_KEY` is public by construction (`EXPO_PUBLIC_` prefix exposes it to the client bundle). Both the OCR and recommend edge functions accept this key without requiring a valid user JWT. Anyone who extracts the key can invoke `/functions/v1/ocr` and `/functions/v1/recommend` without a user account, driving unbounded Anthropic API costs.

**Fix:** call `supabase.auth.getSession()` before each invocation, add `'Authorization': \`Bearer ${session.access_token}\`` to the request headers, and reject requests without a valid JWT in both edge functions with a 401.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:49–54` — Server-Side Request Forgery via `url` parameter [UNRESOLVED]

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

The `url` parameter is fetched server-side without a domain allow-list or RFC-1918 address rejection. Because the endpoint requires only the anon key (see above), anyone can supply `http://169.254.169.254/latest/meta-data/` to probe AWS/GCP metadata endpoints or internal Supabase infrastructure URLs.

**Fix:** validate that `url` uses `https:`, reject private IP ranges, and enforce a domain allow-list before issuing the fetch.

**Severity: High**

---

### MEDIUM — `src/hooks/useAuth.tsx:17–19` — `getSession` rejection unhandled; app permanently blank on cold-start network failure [UNRESOLVED]

```ts
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

There is no `.catch()` handler. If `getSession` rejects — network unavailable at cold start, SecureStore locked by iOS after a failed unlock, or the Supabase project paused — `setLoading(false)` is never called. `loading` stays `true` forever, `app/index.tsx:16` returns `null` indefinitely, and the user sees a blank screen with no error message and no recovery path.

**Fix:** add `.catch(() => setLoading(false))`, or rewrite as `async/await` with `finally { setLoading(false) }`.

**Severity: Medium**

---

### MEDIUM — `app/index.tsx:20` — New signed-in users bypass onboarding because `undefined !== null` [UNRESOLVED]

```ts
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

`usePreferences` does not expose `isLoading`. While the React Query fetch is in-flight, `preferences` is `undefined` (not `null`). The guard evaluates to `false`, so the user is immediately redirected to `/(tabs)/scan`. New users with no `profiles` row never reach onboarding unless the auth state happens to resolve before preferences — a race they consistently lose.

**Fix:** export `isLoading` from `usePreferences`, import it in `index.tsx`, and add it to the early-return guard: `if (loading || hasLaunched === null || isLoading) return null`.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/scan.tsx:86–101` — `handleScreenshot` has no try/catch; unhandled rejection crashes the app [NEW]

```ts
async function handleScreenshot() {
  const result = await ImagePicker.launchImageLibraryAsync({ ... });
  ...
}
```

`launchImageLibraryAsync` throws on certain Android versions when storage permission is revoked mid-session or when the OS kills the picker activity. There is no `try/catch`, so the rejection is unhandled. React Native's global unhandled-promise handler will log the error to the crash reporter (if configured) or silently swallow it, leaving the UI in a stuck state with no feedback to the user.

**Fix:** wrap the body of `handleScreenshot` in `try/catch` and show an `Alert` on failure.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:130–133` — `handleSignOut` ignores the error result; user is redirected even if sign-out fails [NEW]

```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

`signOut()` can fail if the network is unavailable. The error is silently discarded; the app navigates to sign-in regardless. The session token remains in SecureStore. On next launch, `getSession()` will restore the session and the user will appear signed in again — inconsistent with the action they just confirmed.

**Fix:** destructure `{ error }` from `signOut()` and alert the user if the call fails, keeping them on the profile screen.

**Severity: Medium**

---

## Supabase and Edge Function Issues

### HIGH — `supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` — No JWT authentication; anon key is sufficient to invoke [UNRESOLVED]

Neither edge function reads or validates an `Authorization` header. The Deno runtime exposes `Deno.serve` without built-in JWT verification. The functions are effectively public APIs gated only by the anon key, which ships in the mobile bundle. See the `src/api/claude.ts` entry above for full context.

**Fix:** add a `Authorization: Bearer <jwt>` check at the top of each edge function using Supabase's `createClient` with the request JWT. Reject with 401 if the token is absent or invalid.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:49–54` — SSRF via unsanitised `url` parameter [UNRESOLVED]

See the matching entry in Bugs and Crashes above.

**Severity: High**

---

### MEDIUM — `supabase/migrations/001_initial_schema.sql:36–43` — `pricing_cache` table has no RLS policy [NEW]

```sql
create table pricing_cache (
  wine_key text primary key,
  ...
);
-- No "alter table pricing_cache enable row level security"
-- No policy
```

`profiles` and `scan_sessions` both have RLS enabled and a scoping policy. `pricing_cache` has neither. Without RLS, PostgREST (Supabase's REST API) exposes the table to all roles including `anon`. Any user with the public anon key can `SELECT` all cached pricing data, and — more critically — `INSERT` or `UPDATE` rows to poison the cache with false pricing before a real Wine-Searcher fetch overwrites them.

**Fix:** add `alter table pricing_cache enable row level security;` and a restrictive policy that grants `SELECT` only to `service_role`, since this table is only accessed from the edge function.

**Severity: Medium**

---

### MEDIUM — `supabase/functions/recommend/index.ts:139` — Budget currency hardcoded as `£`; breaks for non-GBP users [NEW]

```ts
: `HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle...`
```

The prompt unconditionally uses `£` regardless of the user's currency. A user in the US with a $100 budget will see `£100` in the prompt, which is both misleading to Claude and results in incorrect budget framing. The OCR function also defaults currency to `'GBP'` when it cannot detect one.

**Fix:** pass the active currency code through the preferences payload and use it to format the budget line (or omit the symbol and rely on the numeric value alone, since Claude understands the `budget` context).

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/history.tsx:39–45` — Query fetch error renders as "No scans yet" empty state [NEW]

```ts
const { data: sessions, isLoading } = useQuery({
  ...
  queryFn: async () => {
    const { data, error } = await supabase.from('scan_sessions')...
    if (error) throw error;
    return data as ScanSession[];
  },
});
```

`isError` is not destructured. If the query fails (RLS rejection, network error, malformed response), `sessions` is `undefined` and `isLoading` becomes `false`. The component falls through to the `!sessions?.length` branch (line 47) and renders "No scans yet" — indistinguishable from a legitimately empty history. Users have no way to know a fetch error occurred.

**Fix:** destructure `isError` and render a distinct error state (e.g., "Couldn't load your history — tap to retry") with a `refetch()` call on press.

**Severity: Medium**

---

### LOW — `src/hooks/usePreferences.ts:37–48` — Upsert failure is logged but never surfaced to the user [NEW]

```ts
onError: (err) => console.error('[Preferences] Save error:', err),
```

`usePreferences` exposes `isSaving` but not `isError`. Profile changes (region picks, style selections, budget) silently fail on network error. The UI shows no indication that the save did not complete, and the next session will show the previous values.

**Fix:** expose `isError` from the mutation and display a toast or alert on failure so the user knows to retry.

**Severity: Low**

---

### LOW — `app/scan/preferences.tsx:28–33` — `recommendWines` called without required `RecommendInput` fields [NEW]

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes all absent
});
```

The `RecommendInput` interface (`src/services/recommender.ts:5–15`) requires `wineTypes: string[]`, `favouriteRegions: string[]`, `favouriteGrapes: string[]`, `dislikedRegions: string[]`, and `dislikedGrapes: string[]`. This call omits all five, which is a TypeScript compile error. At runtime the edge function receives `undefined` for these fields and falls back to `?? []` guards, so behaviour degrades gracefully rather than crashing. However, it means the preferences screen path ignores the user's saved taste profile entirely.

**Fix:** pass the missing fields from `usePreferences`, defaulting each to `[]` if null.

**Severity: Low**

---

## UX and Performance Issues

### MEDIUM — `app/(tabs)/history.tsx:64` — History cards have no `onPress` handler; tapping does nothing [NEW]

```tsx
<TouchableOpacity style={styles.card}>
  <Text style={styles.cardDate}>...</Text>
  ...
</TouchableOpacity>
```

The `TouchableOpacity` wrapping each history entry has no `onPress` prop. Users tap a card expecting to see their past recommendation, but nothing happens. There is no detail route for individual scan sessions, so this is a complete dead-end for a primary use case of the History tab.

**Fix:** either add a `onPress` handler that navigates to a results detail screen (passing the recommendation via params or re-hydrating the store), or remove `TouchableOpacity` and replace with a `View` until the detail screen is built, so the tap affordance is not shown without an action.

**Severity: Medium**

---

### MEDIUM — `src/api/claude.ts:7–18` — No fetch timeout; spinner runs indefinitely if an edge function hangs [NEW]

```ts
const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, { ... });
```

React Native's `fetch` has no default timeout. If an edge function call to Claude stalls (Claude API timeout, cold-start delay, Supabase infrastructure issue), the `extracting` screen displays its loading spinner with no timeout path. The user is instructed "Please don't leave this page" while waiting for a call that may never complete.

**Fix:** wrap `fetch` with an `AbortController` and a `setTimeout` (e.g., 90 seconds for OCR, 60 seconds for recommend), and throw a user-facing error if the timeout is reached.

**Severity: Medium**

---

### LOW — `app/(auth)/sign-in.tsx:48` — "Continue without account" does not set `hasLaunched`; welcome screen reappears on next cold start [NEW]

```ts
<TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)/scan')}>
```

When a first-time user navigates from the welcome screen to sign-in and then taps "Continue without account", `hasLaunched` is never written to AsyncStorage. On the next cold start, `index.tsx:25` evaluates `hasLaunched === false` (guest, not launched) and redirects back to `/welcome`. The welcome screen loop only terminates once the user presses "Start Scanning" directly on that screen.

**Fix:** call `AsyncStorage.setItem('hasLaunched', 'true')` inside the "Continue without account" handler, matching the behaviour of `welcome.tsx:handleGuest`.

**Severity: Low**

---

### LOW — `app/(auth)/sign-in.tsx:12–21` and `app/(auth)/sign-up.tsx:12–23` — No client-side validation before hitting Supabase [NEW]

Both auth screens submit the form with no empty-field or email-format check. An empty `email` and `password` will fire a network request to Supabase, incur latency, and return a Supabase error string. The button does disable while `loading` is true, so double-submission is prevented, but a blank submit still makes a round trip.

**Fix:** guard with `if (!email.trim() || !password.trim()) return;` before `setLoading(true)`, and optionally validate email format with a basic regex.

**Severity: Low**

---

### LOW — `app/(tabs)/scan.tsx:24–31` — Preferences initialise from stale undefined; brief flash of empty defaults before saved values load [NEW]

```ts
const [wineTypes, setWineTypes] = useState<WineType[]>(
  savedPreferences?.wineTypes ?? []
);
```

`savedPreferences` is `undefined` on first render (React Query hasn't resolved yet). All three local state values initialise to their empty/null defaults, then the `useEffect` at line 59 fires once `savedPreferences` arrives and updates them. Users who have saved preferences will see the accordion labels flash "e.g. Red Wine" and "e.g. Burgundy" for the duration of the query before their real selections appear.

**Fix:** don't seed `useState` from an async value. Initialise to `[]`/`null` unconditionally and let the `useEffect` (which already has the correct sync logic) handle the first application of saved preferences. To avoid the visual flash, add a `!isLoading` guard before rendering the accordion content.

**Severity: Low**

---

## Navigation Issues

### MEDIUM — `app/scan/results.tsx:22–24` — Side-effecting navigation during render phase [UNRESOLVED]

See full description in Bugs and Crashes above. This is also a navigation correctness issue: calling `router.replace` during render can trigger intermediate navigation states that leave the history stack in an inconsistent state.

**Severity: Medium** (navigation aspect; crash aspect rated High above)

---

### MEDIUM — `app/(tabs)/history.tsx:64` — Tapping a history card is a dead-end with no navigation target [NEW]

See full description in UX and Performance above. No route exists for a scan session detail view; the `TouchableOpacity` presents a tap affordance that silently does nothing.

**Severity: Medium**

---

### LOW — `app/scan/url.tsx:1–5` — `/scan/url` is a silent redirect stub with no user feedback [NEW]

```ts
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The route `/scan/url` is registered in expo-router (the file exists) but immediately redirects to scan. If any in-app link or deep link targets `/scan/url`, the user is silently dropped on the scan screen with no explanation that URL scanning is unavailable. The OCR edge function already has URL-fetch capability (`supabase/functions/ocr/index.ts:49`), so this is either a planned feature that was abandoned or one that was never wired up.

**Fix:** either remove the file so the route returns a 404 and the edge function URL path is unreachable, or build the URL input screen. If it's planned, add a "Coming soon" placeholder so users who land here understand what happened.

**Severity: Low**

---

### LOW — `app/(tabs)/profile.tsx:182–184` — Back arrow uses `router.push` instead of `router.back()`, adding to the stack [NEW]

```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

Within a tab navigator each tab maintains its own stack. Pressing this back arrow calls `router.push('/(tabs)/scan')`, which adds a new Scan entry to the navigation stack rather than popping back. Repeated tapping accumulates stack entries. If the user navigated into Profile from a non-tab context (e.g., a future modal), this would navigate away without dismissing the modal.

**Fix:** replace with `router.back()` if there is a meaningful previous screen, or `router.replace('/(tabs)/scan')` to avoid stack accumulation.

**Severity: Low**

---

### LOW — `app/(auth)/sign-in.tsx` — No route back to `/welcome`; first-time users who navigate sign-in → back are stuck [NEW]

The sign-in screen has a link to sign-up (line 52) but no back button and no link to `/welcome`. A first-time user who taps "Sign In" on the welcome screen to explore it cannot return to the welcome screen without closing the app. The `router.replace` used on sign-in success/guest-bypass means the welcome screen is not in the stack, but users navigating to sign-in via `router.push` from welcome would expect a back affordance.

**Fix:** add a `router.back()` back button or chevron to the sign-in header, or use `router.replace('/(auth)/sign-in')` from welcome so the hardware back button on Android returns to welcome.

**Severity: Low**
