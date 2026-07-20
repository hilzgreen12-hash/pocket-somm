# Automated Code Review — 2026-05-16

> Issues carried forward from previous reviews (unresolved as of 2026-05-15) are marked **[UNRESOLVED]**.
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

`router.replace` is called synchronously in the component body, not inside a `useEffect`. This is a side effect during the React render phase and triggers "Cannot update a component while rendering a different component." If `useScanStore`'s `reset()` nulls `recommendation` while the results screen is still mounted, this becomes a crash loop.

**Fix:** wrap in `useEffect(() => { if (!recommendation) router.replace('/(tabs)/scan'); }, [recommendation])` and return `null` under the same condition outside the effect.

**Severity: High**

---

### HIGH — `app/_layout.tsx:14–39` — No root error boundary [UNRESOLVED]

The entire app renders under `<AuthProvider>` and `<QueryClientProvider>` with no React `ErrorBoundary`. Any uncaught render exception — a null dereference in a results component, a malformed Claude response slipping past Zod, or a font resolution failure — crashes to a blank screen with no recovery path.

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

`EXPO_PUBLIC_SUPABASE_ANON_KEY` is public by construction and ships in the mobile bundle. Both OCR and recommend edge functions accept this key without a valid user JWT. Anyone who extracts the key can invoke `/functions/v1/ocr` and `/functions/v1/recommend` without an account, driving unbounded Anthropic API costs.

**Fix:** call `supabase.auth.getSession()` before each invocation, add `'Authorization': \`Bearer ${session.access_token}\`` to request headers, and reject requests without a valid JWT in both edge functions with a 401.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:49–54` — Server-Side Request Forgery via `url` parameter [UNRESOLVED]

```ts
const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
```

The `url` parameter is fetched server-side with no domain allow-list and no RFC-1918 address rejection. Since the endpoint requires only the anon key (see above), anyone can supply `http://169.254.169.254/latest/meta-data/` to probe AWS/GCP metadata endpoints or internal Supabase infrastructure URLs.

**Fix:** validate that `url` uses `https:`, reject private IP ranges and localhost, and enforce a domain allow-list before issuing the fetch.

**Severity: High**

---

### HIGH — `supabase/functions/wine-searcher-proxy/index.ts:1–88` — No JWT authentication; callable with anon key [NEW]

The wine-searcher-proxy edge function, like the OCR and recommend functions, performs no JWT validation. It reads from and writes to the `pricing_cache` table using the service role key, which means any caller who holds only the anon key can trigger real Wine-Searcher API requests (consuming paid API quota) and write arbitrary rows to the cache.

**Fix:** read the `Authorization` header at the top of the function, verify the JWT with Supabase's `auth.getUser()`, and return 401 if absent or invalid — matching the fix required for OCR and recommend.

**Severity: High**

---

### MEDIUM — `src/hooks/useAuth.tsx:17–19` — `getSession` rejection unhandled; app permanently blank on cold-start network failure [UNRESOLVED]

```ts
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

No `.catch()` handler. If `getSession` rejects — network unavailable at cold start, SecureStore locked after a failed biometric unlock, or the Supabase project paused — `setLoading(false)` is never called. `loading` stays `true` forever, `app/index.tsx:16` returns `null` indefinitely, and the user sees a blank screen with no error message and no recovery path.

**Fix:** add `.catch(() => setLoading(false))`, or rewrite as `async/await` with `finally { setLoading(false) }`.

**Severity: Medium**

---

### MEDIUM — `app/index.tsx:20` — New signed-in users bypass onboarding because `undefined !== null` [UNRESOLVED]

```ts
if (preferences === null) return <Redirect href="/onboarding" />;
return <Redirect href="/(tabs)/scan" />;
```

While the React Query fetch is in-flight, `preferences` is `undefined` (not `null`). The guard evaluates to `false`, so the user is immediately redirected to `/(tabs)/scan`. New users with no `profiles` row consistently lose this race and never reach onboarding.

**Fix:** export `isLoading` from `usePreferences`, import it in `index.tsx`, and add it to the early-return guard: `if (loading || hasLaunched === null || isLoading) return null`.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/scan.tsx:86–101` — `handleScreenshot` has no try/catch; unhandled rejection on storage permission revocation [UNRESOLVED]

```ts
async function handleScreenshot() {
  const result = await ImagePicker.launchImageLibraryAsync({ ... });
  ...
}
```

`launchImageLibraryAsync` throws on certain Android versions when storage permission is revoked mid-session or the OS kills the picker activity. There is no `try/catch`, so the rejection propagates unhandled. The UI is left in a stuck state with no feedback.

**Fix:** wrap the body of `handleScreenshot` in `try/catch` and show an `Alert` on failure.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:130–133` — `handleSignOut` ignores the error result; user is redirected even if sign-out fails [UNRESOLVED]

```ts
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

`signOut()` can fail on network errors. The error is silently discarded and the app navigates to sign-in regardless. The session token remains in SecureStore; on next launch `getSession()` restores it and the user appears signed in again — inconsistent with the action they confirmed.

**Fix:** destructure `{ error }` from `signOut()` and alert the user if the call fails, keeping them on the profile screen.

**Severity: Medium**

---

### MEDIUM — `app/onboarding.tsx:38+47` — `updatePreferences` called fire-and-forget then immediately `router.replace`; save failure is invisible [NEW]

```ts
function handleNext() {
  if (isLast) {
    updatePreferences({ wineTypes, styleProfiles, ... }); // mutation.mutate — async, no await
    router.replace('/(tabs)/scan');                        // fires immediately
  }
}
```

`mutation.mutate` is a fire-and-forget call. `router.replace` executes in the same synchronous frame, before the Supabase upsert can complete or fail. If the network request fails, the `onError` callback fires after the user has already navigated away. The user lands on the scan screen believing their preferences were saved; on the next session they find them missing.

**Fix:** use `mutation.mutateAsync` (or the `onSuccess`/`onError` callbacks) to defer navigation until the save completes. Show an `ActivityIndicator` on the Next button while saving and only call `router.replace` inside `onSuccess`.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:113` — Email change `redirectTo` points to a non-existent route [NEW]

```ts
const redirectTo = Linking.createURL('auth/callback');
const { error } = await supabase.auth.updateUser(
  { email: newEmail.trim() },
  { emailRedirectTo: redirectTo },
);
```

`Linking.createURL('auth/callback')` produces a deep link like `pocket-somm://auth/callback`. No file exists at `app/auth/callback.tsx` or `app/(auth)/callback.tsx` (confirmed by directory listing). When the user taps the confirmation link in their email, the app opens but expo-router cannot resolve the route, likely falling back to the index screen with no indication that the email change completed. The change may still succeed server-side, but the user has no in-app confirmation.

**Fix:** create `app/auth/callback.tsx` that reads the Supabase session from the URL params and shows a "Email updated" confirmation screen, or use a web-based `redirectTo` URL that doesn't require the app to handle it.

**Severity: Medium**

---

## Supabase and Edge Function Issues

### HIGH — `supabase/functions/ocr/index.ts` and `supabase/functions/recommend/index.ts` — No JWT authentication [UNRESOLVED]

Neither edge function reads or validates an `Authorization` header. The functions are effectively public APIs gated only by the anon key, which ships in the mobile bundle. See the matching `src/api/claude.ts` entry in Bugs and Crashes for full context.

**Fix:** add a `Authorization: Bearer <jwt>` check at the top of each function using Supabase's `createClient` with the request JWT. Return 401 if the token is absent or invalid.

**Severity: High**

---

### HIGH — `supabase/functions/wine-searcher-proxy/index.ts` — No JWT authentication [NEW]

See the matching entry in Bugs and Crashes above.

**Severity: High**

---

### HIGH — `supabase/functions/ocr/index.ts:49–54` — SSRF via unsanitised `url` parameter [UNRESOLVED]

See the matching entry in Bugs and Crashes above.

**Severity: High**

---

### MEDIUM — `supabase/migrations/001_initial_schema.sql:36–43` — `pricing_cache` table has no RLS policy [UNRESOLVED]

```sql
create table pricing_cache (
  wine_key text primary key,
  ...
);
-- No: alter table pricing_cache enable row level security;
-- No policy defined
```

`profiles` and `scan_sessions` both have RLS enabled and scoping policies. `pricing_cache` has neither. PostgREST exposes the table to the `anon` role, allowing any caller with the anon key to `SELECT` all cached pricing data or `INSERT`/`UPDATE` rows to poison the cache with false pricing before a real Wine-Searcher fetch overwrites them.

**Fix:** add `alter table pricing_cache enable row level security;` and a restrictive policy granting access only to `service_role`, since this table is only accessed from the wine-searcher-proxy edge function.

**Severity: Medium**

---

### MEDIUM — `supabase/functions/recommend/index.ts:139` — Budget currency hardcoded as `£`; breaks for non-GBP users [UNRESOLVED]

```ts
: `HARD RULE — BUDGET: The diner's maximum budget is £${budget} per bottle...`
```

The prompt unconditionally uses `£` regardless of the user's currency. A user with a $100 budget will see `£100` in the prompt sent to Claude. The OCR function also defaults currency to `'GBP'` when it cannot detect one from the menu.

**Fix:** pass the active currency code through the preferences payload and use it to format the budget line, or omit the symbol and state the amount numerically since the `budget` context makes the meaning clear.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/history.tsx:39–45` — Query fetch error silently renders as "No scans yet" [UNRESOLVED]

`isError` is not destructured from the `useQuery` result. If the query fails (RLS rejection, network error, malformed response), `sessions` is `undefined` and `isLoading` is `false`. The component falls through to the `!sessions?.length` branch and renders "No scans yet" — indistinguishable from a legitimately empty history.

**Fix:** destructure `isError` and render a distinct error state (e.g. "Couldn't load your history — tap to retry") with a `refetch()` call on press.

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/profile.tsx:424–427` — `BudgetSlider.onChange` triggers a Supabase upsert on every slider drag step [NEW]

```tsx
<BudgetSlider
  value={preferences?.defaultBudget ?? 100}
  onChange={(budget) => updatePreferences({ defaultBudget: budget })}
/>
```

`BudgetSlider` wires `onChange` directly to the Slider's `onValueChange`, which fires continuously as the user drags. With 51 discrete steps, dragging from one end to the other triggers up to 51 calls to `updatePreferences` → 51 Supabase `upsert` network requests in rapid succession. There is no debounce. This will visibly degrade performance and can exhaust Supabase rate limits.

**Fix:** add a debounce (e.g. 400 ms using `useRef` + `clearTimeout`/`setTimeout`) in `BudgetSlider` around the `onChange` call, or use the Slider's `onSlidingComplete` callback instead of `onValueChange` for the database write.

**Severity: Medium**

---

### LOW — `src/hooks/usePreferences.ts:46–50` — Upsert failure is logged but never surfaced to the user [UNRESOLVED]

```ts
onError: (err) => console.error('[Preferences] Save error:', err),
```

`usePreferences` exposes `isSaving` but not `isError`. Profile changes silently fail on network error. The user sees no indication the save failed and the next session shows the previous values.

**Fix:** expose `isError` from the mutation and display a toast or alert on failure so the user knows to retry.

**Severity: Low**

---

### LOW — `app/scan/preferences.tsx:28–33` — `recommendWines` called without required `RecommendInput` fields [UNRESOLVED]

```ts
const recommendation = await recommendWines({
  wines: extractedWines,
  styleProfiles,
  budget,
  foodPairing,
  // wineTypes, favouriteRegions, favouriteGrapes, dislikedRegions, dislikedGrapes all absent
});
```

`RecommendInput` (defined at `src/services/recommender.ts:5–15`) requires `wineTypes`, `favouriteRegions`, `favouriteGrapes`, `dislikedRegions`, and `dislikedGrapes`. Omitting all five is a TypeScript compile error. At runtime the edge function receives `undefined` for these fields and falls back to `?? []` guards, so it degrades gracefully rather than crashing — but the preferences screen path ignores the user's entire saved taste profile.

**Fix:** pass the missing fields from `usePreferences`, defaulting each to `[]` if null.

**Severity: Low**

---

## UX and Performance Issues

### MEDIUM — `app/(tabs)/history.tsx:38–44` — Loading and empty states render on white/system background in a dark-themed app [NEW]

```tsx
if (isLoading) {
  return (
    <View style={styles.center}>           // no backgroundColor
      <Text style={typography.body}>Loading history…</Text>  // no color
    </View>
  );
}

if (!sessions?.length) {
  return (
    <View style={styles.center}>           // no backgroundColor
      <Text style={styles.emptyTitle}>No scans yet</Text>
      ...
    </View>
  );
}
```

`styles.center` does not set `backgroundColor`. When the loading or empty-authenticated state renders, the tab navigator's default (white/system) background shows through rather than `colors.background` (the dark terracotta the rest of the app uses). `typography.body` also sets no `color`, leaving the "Loading history…" text black. Both states look visually broken compared to all other screens.

**Fix:** add `backgroundColor: colors.background` to `styles.center`, and add `color: colors.text` to the loading `Text` style (or use an existing style that includes both).

**Severity: Medium**

---

### MEDIUM — `app/(tabs)/history.tsx:64` — History cards have no `onPress` handler; tapping does nothing [UNRESOLVED]

```tsx
<TouchableOpacity style={styles.card}>
```

The `TouchableOpacity` wrapping each history entry has no `onPress` prop. Users tap a card expecting to see their past recommendation but nothing happens. No detail route exists for individual scan sessions.

**Fix:** either add an `onPress` handler that navigates to a results detail screen, or replace `TouchableOpacity` with a `View` until the detail screen is built, so the tap affordance is not presented without an action.

**Severity: Medium**

---

### MEDIUM — `src/api/claude.ts:7–18` — No fetch timeout; spinner runs indefinitely if an edge function hangs [UNRESOLVED]

```ts
const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, { ... });
```

React Native's `fetch` has no default timeout. If an edge function call to Claude stalls — Claude API timeout, cold-start delay, Supabase infrastructure issue — the `extracting` screen displays its loading spinner forever. The user is instructed "Please don't leave this page" while waiting for a call that may never complete.

**Fix:** wrap `fetch` with an `AbortController` and a `setTimeout` (e.g. 90 s for OCR, 60 s for recommend) and throw a user-facing error if the timeout fires.

**Severity: Medium**

---

### LOW — `app/(auth)/sign-in.tsx:48` — "Continue without account" does not set `hasLaunched`; welcome screen reappears on next cold start [UNRESOLVED]

```ts
onPress={() => router.replace('/(tabs)/scan')}
```

When a first-time user navigates to sign-in and taps "Continue without account", `hasLaunched` is never written to AsyncStorage. On the next cold start, `index.tsx:25` evaluates `hasLaunched === false` and redirects back to `/welcome`.

**Fix:** call `AsyncStorage.setItem('hasLaunched', 'true')` inside the handler, matching the behaviour of `welcome.tsx:handleGuest`.

**Severity: Low**

---

### LOW — `app/(auth)/sign-in.tsx:12–21` and `app/(auth)/sign-up.tsx:12–23` — No client-side validation before hitting Supabase [UNRESOLVED]

Both auth screens submit the form with no empty-field or email-format check. An empty email and password will fire a network request to Supabase, incur latency, and return a Supabase error string.

**Fix:** guard with `if (!email.trim() || !password.trim()) return;` before `setLoading(true)` and optionally validate email format with a basic regex.

**Severity: Low**

---

### LOW — `app/(tabs)/scan.tsx:24–31` — Preferences initialise from `undefined`; brief flash of empty defaults before saved values load [UNRESOLVED]

```ts
const [wineTypes, setWineTypes] = useState<WineType[]>(
  savedPreferences?.wineTypes ?? []
);
```

`savedPreferences` is `undefined` on first render (React Query not yet resolved). All three state values initialise to empty/null defaults, then the `useEffect` at line 59 fires once preferences arrive. Users with saved preferences see the accordion labels flash "e.g. Red Wine" and "e.g. Burgundy" before their selections appear.

**Fix:** don't seed `useState` from an async value. Initialise unconditionally to `[]`/`null` and let the existing `useEffect` handle first application of saved preferences. Add a loading guard before rendering accordion content.

**Severity: Low**

---

### LOW — `app/(tabs)/profile.tsx:153` — Copy says "subscription email account"; implies a paid tier that does not exist [NEW]

```tsx
<Text style={styles.emailLabel}>Change your subscription email account</Text>
```

The word "subscription" implies a paid product tier. The app has no subscription model. This label is misleading — users may interpret it as referring to a newsletter or billing account rather than their auth login.

**Fix:** change copy to "Change email address" or "Update login email".

**Severity: Low**

---

### LOW — `app/scan/extracting.tsx:142–153` — Two duration warnings render simultaneously in the recommending stage [NEW]

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

When `stage === 'recommending'`, the screen shows "Scoring by critic rating, vintage quality and value" immediately followed by "This may take a minute or two" — two consecutive body-level strings that clash in tone and appear redundant.

**Fix:** remove the separate `stage === 'recommending'` text block and include the duration note in the conditional above: `'Scoring by critic rating, vintage quality and value — this may take a minute or two'`.

**Severity: Low**

---

## Navigation Issues

### MEDIUM — `app/scan/results.tsx:22–24` — Side-effecting navigation during render phase [UNRESOLVED]

See the full description in Bugs and Crashes above. Calling `router.replace` during render can also leave the navigation history stack in an inconsistent state, making the back gesture behave unexpectedly.

**Severity: Medium** (navigation aspect; crash risk rated High above)

---

### MEDIUM — `app/(tabs)/history.tsx:64` — Tapping a history card is a dead-end with no navigation target [UNRESOLVED]

See full description in UX and Performance above. No route exists for a scan session detail view; the `TouchableOpacity` presents a tap affordance that silently does nothing.

**Severity: Medium**

---

### LOW — `app/scan/url.tsx:1–5` — `/scan/url` is a silent redirect stub with no user feedback [UNRESOLVED]

```ts
export default function UrlScreen() {
  return <Redirect href="/(tabs)/scan" />;
}
```

The route `/scan/url` immediately redirects to scan. If any in-app link or deep link targets `/scan/url`, the user is silently dropped on the scan screen with no explanation. The OCR edge function already supports URL-based extraction (`supabase/functions/ocr/index.ts:49`), so this feature is partially implemented but unrouted.

**Fix:** either remove the file so the route returns 404, or build the URL input screen. If planned, add a "Coming soon" placeholder.

**Severity: Low**

---

### LOW — `app/(tabs)/profile.tsx:182–184` — Back arrow uses `router.push` instead of `router.back()`; accumulates stack entries [UNRESOLVED]

```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

`router.push` adds a new Scan entry to the navigation stack rather than popping back to it. Repeated tapping accumulates stack entries. Replace with `router.back()` or `router.replace('/(tabs)/scan')`.

**Severity: Low**

---

### LOW — `app/(auth)/sign-in.tsx` — No route back to `/welcome`; first-time users who explore sign-in are stuck [UNRESOLVED]

The sign-in screen has a link to sign-up (line 52) but no back button and no link to `/welcome`. A first-time user who taps "Sign In" on the welcome screen to explore it cannot return without closing the app.

**Fix:** add a `router.back()` chevron to the sign-in header, or navigate to sign-in with `router.replace` from welcome so the hardware back button on Android returns to welcome.

**Severity: Low**
