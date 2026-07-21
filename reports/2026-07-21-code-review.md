# Vinster Code Review — 2026-07-21

Branch reviewed: `main` (commit `5a35923`, 2026-07-16). Every finding below was verified by reading the current file at the cited line this run. Findings from previous reports that are no longer present in the code have been omitted.

---

## Bugs and Crashes

### 1. Nine edge functions accept calls without authenticating the caller

- **Files**: `supabase/functions/scan-label/index.ts` (line 61), `supabase/functions/food-wine-pairing/index.ts` (line 143), `supabase/functions/wine-intelligence/index.ts` (line 5), `supabase/functions/wine-knowledge/index.ts` (line 8), `supabase/functions/detect-rack/index.ts` (line 19), `supabase/functions/detect-lineup/index.ts` (line 8), `supabase/functions/import-cellar/index.ts` (line 5), `supabase/functions/personality/index.ts` (line 121), `supabase/functions/generate-pairings/index.ts` (line 226)
- **Severity**: High
- **Description**: Each of these functions reads the request body and immediately calls Claude (or Wine-Searcher) without first checking whether the caller holds a valid Supabase JWT. By contrast, `ocr/index.ts` (line 43–55) and `recommend/index.ts` (line 141–148) both call `userClient.auth.getUser()` and return 401 if that fails. The nine unauthenticated functions are reachable by anyone who discovers a function URL — no login required. This was first flagged in the 2026-05-11 report and remains unresolved.
- **Impact**: An unauthenticated actor can burn Anthropic API credits and Wine-Searcher quota at will. A logged-in user can spam all nine functions at unlimited rate (no rate limiting is present either — see Supabase section below).
- **Fix**: Copy the auth-guard pattern from `ocr/index.ts` lines 43–55 into each function: create a user-scoped Supabase client from the `Authorization` header, call `getUser()`, and return 401 if it fails. Add the same `check_and_log_function_call` rate-limit RPC used by `ocr` and `recommend`.

### 2. `wine-searcher-proxy` uses the service-role key with no auth or rate limit

- **File**: `supabase/functions/wine-searcher-proxy/index.ts` (lines 33–36, 164)
- **Severity**: High
- **Description**: The function constructs a Supabase client using `SUPABASE_SERVICE_ROLE_KEY` (which bypasses all Row-Level Security) at line 33, then serves any caller at line 164 with no JWT check. A caller who discovers this function URL can: (a) trigger unlimited Wine-Searcher API calls; (b) write arbitrary rows to `pricing_cache` and `fx_rates` tables (lines 234–244 and 83–85) under the unrestricted service-role key; (c) read cached prices for any wine key.
- **Fix**: Add a JWT auth check (same pattern as `ocr`). Use the anon-key client for auth validation; keep the service-role client only for the internal cache writes that genuinely need to bypass RLS.

### 3. `handleAlternativeList` swallows errors with no user feedback

- **File**: `app/scan/results.tsx` (lines 449–472, specifically lines 467–470)
- **Severity**: Medium
- **Description**: The catch block is:
  ```ts
  } catch (err) {
    // silently fail — existing results remain
  }
  ```
  When the alternative-list API call fails (network drop, rate-limit 429, server 500), `isGenerating` is set back to false and the original results reappear — but the user receives no alert, toast, or any indication that the request failed. The button appears to have done nothing. Since this generation can run 20–65 seconds before failing, the silent drop is especially confusing.
- **Fix**: Add a `showAlert` in the catch block: `showAlert({ title: 'Could not generate alternatives', body: err instanceof Error ? err.message : 'Please try again.' });`

### 4. `personality/index.ts` prompt is self-contradictory about the output format

- **File**: `supabase/functions/personality/index.ts` (lines 20–25 and line 51 in `buildWinePrompt`; lines 81–86 and line 117–118 in `buildRecipePrompt`)
- **Severity**: Low
- **Description**: Both prompt builders open with an `OUTPUT FORMAT` section that instructs Claude to begin the response with `# Title` (a Markdown H1 heading) on the first line. But the very last line of each prompt says: *"Return only the prose — no preamble, no title, no markdown headers. Just the character sketch, ready to display."* These two instructions directly contradict each other. In practice the H1 title appears to be parsed by the client (the app splits on newlines to extract the sketch title), but the contradictory closing instruction causes Claude to occasionally omit the title heading, which breaks the client-side parse.
- **Fix**: Remove the closing disclaimer about "no markdown headers" from both `buildWinePrompt` and `buildRecipePrompt`. The opening `OUTPUT FORMAT` section already specifies the exact format; the contradictory closer only confuses it.

---

## Supabase and Edge Function Issues

### 1. No rate limiting on nine AI-backed edge functions

- **Files**: `supabase/functions/scan-label/index.ts`, `supabase/functions/food-wine-pairing/index.ts`, `supabase/functions/wine-intelligence/index.ts`, `supabase/functions/wine-knowledge/index.ts`, `supabase/functions/detect-rack/index.ts`, `supabase/functions/detect-lineup/index.ts`, `supabase/functions/import-cellar/index.ts`, `supabase/functions/personality/index.ts`, `supabase/functions/generate-pairings/index.ts`
- **Severity**: High
- **Description**: `ocr` and `recommend` both call `check_and_log_function_call` (an RPC that enforces per-user hourly and daily limits). None of the nine other AI functions call this RPC, meaning a signed-in user can trigger unlimited Claude generations. `generate-pairings` is particularly expensive — it runs `claude-sonnet-4-6` at `max_tokens: 8192` with an optional `max_tokens: 8192` streaming call — and a script that repeatedly calls it would accumulate significant cost in minutes.
- **Fix**: Add the same `check_and_log_function_call` RPC call to every function, with limits appropriate to the feature's expected use frequency. `detect-rack` and `detect-lineup` can share the same function-name key as they are infrequently used; `wine-intelligence` and `generate-pairings` justify their own keys given cost-per-call.

### 2. Single-attempt JSON parsing in `food-wine-pairing`, `wine-knowledge`, `detect-rack`, `detect-lineup`, `import-cellar`, and `personality`

- **Files**: `supabase/functions/food-wine-pairing/index.ts` (line 159–162), `supabase/functions/wine-knowledge/index.ts` (lines 40–42), `supabase/functions/detect-rack/index.ts` (lines 36–40), `supabase/functions/detect-lineup/index.ts` (lines 47–51), `supabase/functions/import-cellar/index.ts` (lines 58–63), `supabase/functions/personality/index.ts` (lines 133–142)
- **Severity**: Medium
- **Description**: Each of these functions attempts to extract JSON from the Claude response exactly once. If the model returns a non-JSON response (which happens on rare but non-zero occasions — the same failure mode that motivated the retry logic now in `ocr` and `recommend`), the outer catch returns a generic 500. `ocr/index.ts` (lines 91–129) and `recommend/index.ts` (lines 261–295) both implement a two-attempt retry with logging on the first failure. The six listed functions have no retry, so a single non-deterministic Claude output generates a hard error for the user.
- **Fix**: Add a one-retry wrapper matching the pattern in `ocr/index.ts` `attemptOCR`. Even without full retry infrastructure, adding `try { … } catch { /* retry once */ }` would eliminate the majority of transient failures.

### 3. `food-wine-pairing` has no CORS headers on its error response

- **File**: `supabase/functions/food-wine-pairing/index.ts` (line 168)
- **Severity**: Low
- **Description**: The function's error response at line 168 is `new Response(JSON.stringify({ error: message }), { status: 500 })` with no CORS headers. The successful path at line 163 also omits them. `delete-account/index.ts` (line 4–8) correctly includes CORS preflight and header handling. In practice Supabase's function proxy adds CORS headers, but an error thrown before the Deno server sends headers could slip through without them in edge cases.
- **Fix**: Add a `corsHeaders` constant (see `delete-account` for the pattern) and include it in every response, including the error catch.

---

## UX and Performance Issues

### 1. `handleAlternativeList` provides no user feedback on failure

- **File**: `app/scan/results.tsx` (line 467–470)
- **Severity**: Medium
- **Description**: Covered under Bugs and Crashes item 3 above. Repeated here as a UX issue: after the ~20-second "Finding your alternative picks…" progress screen, a silent failure resets to the original results with no explanation. From the user's perspective the button did nothing.

### 2. Off-screen `WineListShareCard` is always rendered regardless of whether the user ever shares

- **File**: `app/scan/results.tsx` (lines 956–965)
- **Severity**: Low
- **Description**: The share card is mounted unconditionally on every results render at `position: 'absolute', top: 100000, opacity: 0`. It receives the full `recommendation.wines` data and renders three wine cards with text, which adds to layout and paint cost on every results screen load even when the user never taps Share. On older devices with many wines this is a measurable first-paint delay.
- **Fix**: Wrap the share card in a `{sharing && <WineListShareCard … />}` conditional or mount it lazily the first time `handleShare` is called (set a `shareCardVisible` boolean after the first share attempt). `captureRef` requires the view to be mounted before capture, so gate on a boolean set one frame before `captureRef` rather than on the `sharing` flag.

### 3. Restaurant name input loses focus if the keyboard dismisses between `onBlur` and `onSubmitEditing`

- **File**: `app/scan/results.tsx` (lines 627–637)
- **Severity**: Low
- **Description**: The inline restaurant-name `TextInput` calls `handleSaveRestaurant()` on both `onBlur` and `onSubmitEditing`. On some Android keyboards both events fire in sequence, which means `handleSaveRestaurant` runs twice. The second call hits the `effectiveSessionId` branch (the first call's save has landed) and calls `supabase.from('scan_sessions').update(…)` a second time with the same name — a harmless duplicate write, but it doubles the DB call count for this common action.
- **Fix**: Debounce the save or use a `savingRef` flag: skip the second call if one is already in flight.

---

## Navigation Issues

### 1. `scan/wine-list` and many cellar sub-screens are not declared in the root Stack layout

- **File**: `app/_layout.tsx` (lines 153–205)
- **Severity**: Low
- **Description**: `app/scan/wine-list.tsx` is linked from `(tabs)/scan.tsx` via `router.push('/scan/wine-list')`, but there is no `<Stack.Screen name="scan/wine-list" />` in the root Stack. Similarly absent: `cellar/import-cellar`, `cellar/lineups`, `cellar/lineup/[id]`, `cellar/labels`, `cellar/archive-night`, `cellar/scan-lineup`, `cellar/wine-knowledge/[wineId]`, `cellar/storage-location/[id]`, `cellar/storage-location/new`. In Expo Router all file-based routes are auto-registered and are reachable without an explicit declaration, so navigation does not break. However, without the declaration these screens receive no custom transition or `gestureEnabled` option, and the default presentation (full-screen push) may be inappropriate for some modal-style flows (e.g. `storage-location/new`).
- **Fix**: Add `<Stack.Screen>` declarations for every navigable route with any non-default presentation need. Routes used only as modals (new, confirm, prompt screens) should typically include `presentation: 'modal'`.

### 2. `router.dismissTo('/scan/wine-list')` from a history-loaded results screen may not find the target in the stack

- **File**: `app/scan/results.tsx` (lines 474–478)
- **Severity**: Low
- **Description**: When `recommendation` becomes null while the user is on the results screen, the effect at line 474 calls `router.dismissTo('/scan/wine-list')`. When the user arrived via "View Last Result" (the `isFromHistory` path in `(tabs)/scan.tsx`), the navigation stack does not contain `/scan/wine-list` — the user went `(tabs)/scan → scan/results` directly. `dismissTo` when the target is absent from the stack falls back to a `push`, which adds a `/scan/wine-list` screen on top of the current stack rather than returning to the scan hub. The user ends up with an unexpected extra screen in their back-stack.
- **Fix**: Guard with `if (isFromHistory) { router.back(); } else { router.dismissTo('/scan/wine-list'); }` to use the appropriate navigation verb for each entry path.
