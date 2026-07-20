# Code Review — 2026-06-25

Automated review of the Pocket Somm codebase (Expo SDK 54, expo-router, Supabase, Claude API).

---

## Bugs and Crashes

### BUG-01 — Invalid Claude model ID causes total failure of OCR and Recommend features
**Severity: High**
**Files:** `supabase/functions/ocr/index.ts:57,65` · `supabase/functions/recommend/index.ts:170`

Both edge functions pass `model: 'claude-opus-4-6'` to the Anthropic SDK. This model ID does not exist. The current valid Opus identifier is `claude-opus-4-8`. Every call to either function will fail with a model-not-found error from the API, making every scan completely broken. Replace `'claude-opus-4-6'` with `'claude-opus-4-8'` in all three locations.

---

### BUG-02 — Auth initialisation silently hangs on network failure
**Severity: High**
**File:** `src/hooks/useAuth.tsx:17-20`

```typescript
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
  setLoading(false);
});
```

There is no `.catch()` on this promise. If Supabase returns an error or the network is unavailable during startup, the rejection is unhandled and `setLoading(false)` is never called. The app stays on a permanent loading screen with no way to recover short of a restart. Fix: destructure `{ data, error }` and call `setLoading(false)` in both success and error paths.

---

### BUG-03 — Supabase upsert errors are silently ignored in `usePreferences`
**Severity: High**
**File:** `src/hooks/usePreferences.ts:38-47`

```typescript
await supabase.from('profiles').upsert({ ... });
```

The Supabase client never throws — it resolves with `{ data, error }`. Because the result is not destructured, an error (e.g. an RLS policy violation or a network failure) is silently discarded. The `onError` callback at line 50 never fires. From the user's perspective, preferences appear saved when they were not. Fix: destructure the result and throw if `error` is non-null, so that `onError` is triggered and the UI can surface the failure.

---

### BUG-04 — History tab shows "No scans yet" when there is a query error
**Severity: Medium**
**File:** `app/(tabs)/history.tsx:13-54`

`useQuery` is set up with `if (error) throw error` in the `queryFn`, but the component only checks `isLoading` — it never checks `isError`. When the query fails, `isLoading` becomes false and `data` is undefined, so the component falls into the `!sessions?.length` branch and shows "No scans yet". A user with a real network error will think their history is empty. Fix: add an `isError` branch that shows an error message with a retry option.

---

### BUG-05 — Sign-in button permanently disabled after network exception
**Severity: Medium**
**File:** `app/(auth)/sign-in.tsx:12-21`

`handleSignIn` is an `async` function that calls `supabase.auth.signInWithPassword()` but has no `try/catch`. If the call throws (e.g. DNS failure before the response is received), `setLoading(false)` at line 15 is never reached and the button stays disabled for the rest of the session, requiring the user to force-quit the app. Fix: wrap the body in `try/catch/finally`, calling `setLoading(false)` in `finally`.

---

### BUG-06 — Sign-out navigates on failure, leaving inconsistent auth state
**Severity: Medium**
**File:** `app/(tabs)/profile.tsx:130-133`

```typescript
async function handleSignOut() {
  await supabase.auth.signOut();
  router.replace('/(auth)/sign-in');
}
```

If `signOut()` throws or returns an error, navigation still proceeds. The user is sent to the sign-in screen but the Supabase session may not be cleared, creating a state where the app behaves as if the user is signed out but the session token persists in SecureStore. Fix: check the error returned by `signOut()` (or wrap in `try/catch`) before navigating.

---

### BUG-07 — Duplicate-grape retry returns the retried result even when it still has duplicates
**Severity: Medium**
**File:** `src/services/recommender.ts:75-82`

```typescript
if (hasDuplicateGrapes(parsed.data.wines)) {
  const raw2 = await callRecommend({ ...input, _strictDiversity: true });
  const parsed2 = RecommendationResponseSchema.safeParse(raw2);
  if (parsed2.success) return parsed2.data;
}
return parsed.data;
```

`hasDuplicateGrapes` is not run on `parsed2.data` before returning it. If the retry still contains duplicate grapes, the constraint is silently violated and the duplicate result is shown to the user. The Zod schema validates structure only — it does not enforce diversity. Fix: check `hasDuplicateGrapes(parsed2.data.wines)` before returning `parsed2.data`, and log a warning if the retry also fails.

---

### BUG-08 — History cards are tappable but do nothing
**Severity: Medium**
**File:** `app/(tabs)/history.tsx:64`

```typescript
<TouchableOpacity style={styles.card}>
```

No `onPress` prop is provided. The card renders as a pressable element (with visual tap feedback), but tapping it has no effect. Users will tap, see a ripple, and be confused. Either wire up navigation to a detail screen or replace `TouchableOpacity` with a plain `View`.

---

## Supabase and Edge Function Issues

### SUP-01 — `usePreferences` query logs a warning but returns `null` with no user feedback
**Severity: Low**
**File:** `src/hooks/usePreferences.ts:19-21`

When the preferences query errors, a `console.warn` is logged and `null` is returned. React Query treats this as a successful response with a `null` value — no retry, no error state. Consumers see default preferences with no indication that loading failed. Consider throwing the error so React Query can surface it and trigger retries.

---

### SUP-02 — Upsert mutation returns without executing when `session` is null
**Severity: Low**
**File:** `src/hooks/usePreferences.ts:36-37`

```typescript
mutationFn: async (updates: Partial<UserPreferences>) => {
  if (!session) return;
```

If the session expires between the time the component renders and the user taps a save button, the mutation silently returns `undefined`. `onSuccess` fires (because the function resolved), and `invalidateQueries` runs as if the save succeeded. The preference update is lost with no feedback. Fix: throw an error when there is no session so that `onError` is called.

---

### SUP-03 — Budget prompt and price display are hardcoded to GBP
**Severity: Low**
**Files:** `supabase/functions/recommend/index.ts:139,155` · `app/scan/results.tsx:84`

The recommend function injects `£${budget}` into the Claude prompt regardless of currency, and the results screen always renders `£{wine.menuPrice}`. The OCR function correctly extracts a `currency` field from wine lists (defaulting to `"GBP"`) but that field is ignored everywhere downstream. Non-GBP markets will see wrong currency symbols on every recommendation. Fix: pass the detected currency through from OCR response to the recommend prompt and results display.

---

### SUP-04 — Edge functions expose raw error messages in 500 responses
**Severity: Low**
**Files:** `supabase/functions/ocr/index.ts:97` · `supabase/functions/recommend/index.ts:193`

```typescript
return new Response(JSON.stringify({ error: message }), { status: 500 });
```

The raw exception message is returned in the 500 response body and surfaced in the client UI. For unexpected errors this can include stack traces or internal API error details. Consider returning a generic user-facing message and logging the full error server-side only.

---

### SUP-05 — No timeout on Claude API calls in edge functions
**Severity: Low**
**Files:** `supabase/functions/ocr/index.ts:56-82` · `supabase/functions/recommend/index.ts:169-179`

`client.messages.create()` has no timeout configured. Supabase edge functions have a hard wall-clock limit, but a slow Claude response can consume the entire budget before returning, giving the client a timeout error with no useful message. Consider wrapping the call with `Promise.race` against a timeout, or using `AbortSignal`, to return a clean error before Supabase's own timeout fires.

---

## UX and Performance Issues

### UX-01 — No error boundary protects the navigation tree
**Severity: Medium**
**File:** `app/_layout.tsx:30-39`

The root layout wraps children with `GestureHandlerRootView`, `QueryClientProvider`, and `AuthProvider`, but there is no React error boundary anywhere. An uncaught render error in any screen (e.g. a malformed recommendation object accessing a missing property) propagates to the root and crashes the entire app with a blank screen. Fix: wrap the `<Stack>` with an error boundary that renders a recovery UI and logs the error.

---

### UX-02 — Extracting screen copy is contradictory
**Severity: Low**
**File:** `app/scan/extracting.tsx:146-151`

When `stage === 'reading'`, the screen shows "This could take a minute or two". When `stage === 'recommending'`, it shows a second line: "This may take a minute or two" beneath "Scoring by critic rating, vintage quality and value". Both the reading and recommending stages show near-identical wait copy, giving users no sense of how far through the process they are. Consider a step indicator (e.g. "Step 1 of 2").

---

### UX-03 — Profile back button navigates forward to scan rather than back
**Severity: Low**
**File:** `app/(tabs)/profile.tsx:182-184`

```typescript
<TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
  <Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
```

The arrow-back icon calls `router.push`, adding a new entry to the stack instead of popping the current one. Within the tabs layout this likely makes no difference (tabs don't stack), but the icon implies backward navigation and the intent is misleading. If this is meant to switch to the scan tab, use `router.replace` or the tab navigator's own API.

---

### UX-04 — Duplicate grape retry happens silently
**Severity: Low**
**File:** `src/services/recommender.ts:75-77`

When duplicate grapes are detected and a second request is fired, there is no UI state change. The user watches the same spinner for potentially twice as long with no indication that a retry is in progress. The `ExtractingScreen` has a `stage` state but there is no `retrying` value for it. Consider updating stage text when a retry is underway.

---

## Navigation Issues

### NAV-01 — Camera screen has no back navigation
**Severity: Medium**
**File:** `app/scan/camera.tsx`

The camera screen renders a full-screen `CameraView` with a `CameraOverlay` component. There is no back button in the screen itself. If `CameraOverlay` does not provide one (not confirmed in this review), users who open the camera accidentally have no way to return to the scan tab without capturing a photo. Verify that `CameraOverlay` includes a visible back/close control; if not, add one.

---

### NAV-02 — `results.tsx` calls `router.replace` during render
**Severity: Low**
**File:** `app/scan/results.tsx:22-25`

```typescript
if (!recommendation) {
  router.replace('/(tabs)/scan');
  return null;
}
```

Calling `router.replace` synchronously during a render is discouraged in React — it triggers a navigation side effect inside the render phase. While it works in practice with expo-router, it can cause brief flashes and unexpected behaviour if the component is suspended. The idiomatic fix is to move this into a `useEffect`.

---

### NAV-03 — No auth guard on scan initiation for guests
**Severity: Low**
**File:** `app/(tabs)/scan.tsx`

Guests (no session) can progress through the full scan flow — camera, preview, extracting, results — without being prompted to sign in. Scan sessions are presumably not saved for guests (the save logic would need verifying), but if any Supabase write is attempted after extraction for a guest, it will fail silently. The current experience implies the app works fully without an account, which may be intentional, but should be explicitly designed rather than left as a gap.

---

*Report generated by automated review agent — 2026-06-25*
