# Vinster Code Review — 2026-05-11

Scope: bugs/crashes, Supabase queries and edge functions, UX/performance, expo-router navigation.

Items previously audited and resolved (commits 8bbd737, 3302da2, 80f14cf, a225955, 00495bd) have been excluded.

---

## Bugs and Crashes

### 1. `handleScreenshot` recurses through itself as the deferred action
- **File**: `app/(tabs)/scan.tsx`
- **Line**: 175
- **Severity**: High
- **Description**: `maybeShowSignInPrompt(() => handleScreenshot())` passes a closure that calls `handleScreenshot()` again. After the sign-in prompt is dismissed, the function re-enters from the top — and on the second pass `signInPromptShown` has flipped to `true`, so it falls through to the image picker. This works *today* but it is also a latent infinite loop: any change that sets `signInPromptShown` back to `false` before the action fires (or removes the `signInPromptShown` short-circuit) will spin forever, locking up the UI.
- **Fix**: Pass a non-recursive proceed callback that only does the image-picker work, mirroring the pattern in `handleScan` on line 168: `if (maybeShowSignInPrompt(go)) return; go();` where `go` is the resumable inner body.

### 2. Pending-route action is dropped when the gated sign-in prompt is dismissed
- **File**: `app/(tabs)/profile.tsx` (lines 16–24, 80–86) and `app/(tabs)/community.tsx` (lines 14–22, 54–60)
- **Line**: 18, 22 (profile); 16, 20 (community)
- **Severity**: Medium
- **Description**: `gated(route)` stores the route in `pendingRoute` to gate-prompt, but every modal handler (`onDismiss`, `onContinue`, `onSignIn`, `onCreateAccount`) sets it to `null` without ever consuming the pending route. After "Continue without account" the user is back on the same tab having tapped a button that produced zero visible effect — they have to tap it a second time. Compare to `app/(tabs)/scan.tsx` and `app/(tabs)/cellar.tsx` which both use `pendingActionRef` and re-invoke the action on continue.
- **Fix**: Use the same `pendingActionRef` pattern: store the proceed callback, invoke it on dismiss/continue, and clear the modal state separately.

### 3. `Linking.parse(url)` can throw on malformed deep-link URLs
- **File**: `app/_layout.tsx`
- **Line**: 63
- **Severity**: Medium
- **Description**: `handleUrl` is not wrapped in a try/catch. `Linking.parse` and `supabase.auth.setSession` / `verifyOtp` can all reject — an unhandled rejection inside the `addEventListener('url', …)` callback (line 98) is silently swallowed by React Native but, depending on the build target, can also surface as a "possible unhandled promise rejection" yellow box that confuses email-confirmation users.
- **Fix**: Wrap the body of `handleUrl` in a try/catch and log to `console.warn` so we can see in TestFlight logs when deep-link redemption is failing.

### 4. `JSON.parse(match[0])` in wine-intelligence used as truthiness check then discarded
- **File**: `supabase/functions/wine-intelligence/index.ts`
- **Line**: 49
- **Severity**: Medium
- **Description**: `return new Response(JSON.parse(match[0]) ? match[0] : JSON.stringify({ error: 'empty' }), …)` — `JSON.parse` is called, the result is coerced to a boolean, and the same string is sent back. If the JSON is malformed (e.g. truncated by `max_tokens: 1024` on a long tasting note), `JSON.parse` throws and the catch block returns a generic 500 with the parse error message. The client surfaces this as "Could not refresh / wine-intelligence: …" which has been a recurring user complaint.
- **Fix**: Replace with `const parsed = JSON.parse(match[0]); return new Response(JSON.stringify(parsed), …)`. Either keep the parsed-then-stringified path so the response is guaranteed to be valid JSON, or guard inside the same try/catch.

### 5. `account.tsx` updates Supabase user metadata without awaiting or surfacing errors
- **File**: `app/account.tsx`
- **Line**: 38–40, 194, 203
- **Severity**: Medium
- **Description**: `updateNotifySetting` calls `supabase.auth.updateUser(...)` without `try/catch` and the `onValueChange` invocation doesn't `await`. The switch flips visually regardless of whether the update succeeded. On the next app launch the user sees the old value, with no indication anything went wrong.
- **Fix**: Await the call, catch errors, and on failure revert the local state and surface a `showAlert`.

### 6. `repairRackedWines` swallows all errors silently
- **File**: `src/api/cellar.ts`
- **Line**: 75, 82, 91
- **Severity**: Low
- **Description**: The healing routine returns `0` on the assignment-lookup error and ignores the result of both update queries except for counting rows. If the wishlist-reset update fails due to an RLS policy, the function returns "fixed: N" while leaving wines in a broken state.
- **Fix**: At minimum, log the errors (`console.error('repairRackedWines', err)`) so they surface in TestFlight Sentry / dev tools.

### 7. Sign-out flow can leave the user signed in if it fails after navigation
- **File**: `app/account.tsx`
- **Line**: 89–96
- **Severity**: Low
- **Description**: `handleSignOut` returns early on error without resetting any state, but only after `supabase.auth.signOut()` has presumably tried to clear the session. The user sees an alert, taps it away, and they're back on the Account screen still signed in. This is technically correct, but the lack of a destination after a successful signOut (the bouncing through `/(auth)/sign-in`) versus the failure case means the user has no clear next step. Adding `setLoading(true)` while the operation is in flight would also prevent double-tap.
- **Fix**: Disable the Sign Out button while in flight, and on error keep the modal closed but tell the user to retry.

### 8. Non-null assertion on `session` in `usePreferences` and `useScanHistory` when query is enabled
- **File**: `src/hooks/usePreferences.ts`
- **Line**: 17
- **Severity**: Low
- **Description**: `session!.user.id` — react-query's `enabled: !!session` ensures the query function only runs when there's a session, so this is currently safe. But the assertion sidesteps a class of bugs (e.g. a future `enabled: !!session?.user` that allows guest sessions with no user). Same pattern in `src/hooks/useScanHistory.ts:87`.
- **Fix**: Early-return `null` from the `queryFn` if `!session?.user.id`. Lets TypeScript prove no `!`.

### 9. `(tabs)/label.tsx` uses deprecated `ImagePicker.MediaTypeOptions.Images`
- **File**: `app/(tabs)/label.tsx`
- **Line**: 13
- **Severity**: Low
- **Description**: Expo SDK 54 replaced `MediaTypeOptions` with the string array form (`mediaTypes: ['images']`). The file is currently hidden behind `href: null` in the tabs layout, so the bug isn't reachable — but the file is also dead code that can be deleted.
- **Fix**: Delete `app/(tabs)/label.tsx`. It's not referenced by any navigation and is hidden by the tabs layout.

---

## Supabase and Edge Function Issues

### 1. `recommend` and `ocr` functions reject when called without an Authorization header — but every other edge function accepts unauthenticated calls
- **File**: `supabase/functions/recommend/index.ts` (line 113), `supabase/functions/ocr/index.ts` (line 30)
- **Severity**: Medium
- **Description**: `scan-label`, `wine-intelligence`, `generate-pairings`, `food-wine-pairing`, `personality`, `detect-rack`, `import-cellar`, and `wine-searcher-proxy` all have no `Authorization` check. Guest users (those who tapped "Continue without account") can therefore call them. That's intentional for the freemium funnel, but it's inconsistent — `recommend` and `ocr` (the two most expensive endpoints) gate, the others don't. Either every function should gate, or none. Given the API spend, the right answer is probably "all of them should at least require the anon key" (which `supabase.functions.invoke` attaches automatically).
- **Fix**: Either remove the auth check from `recommend` and `ocr`, or add a parallel `if (!req.headers.get('Authorization'))` gate to the other seven functions for consistency.

### 2. No CORS headers on any edge function
- **File**: every file in `supabase/functions/*/index.ts`
- **Severity**: Low (today; High if web client is added)
- **Description**: No `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, or `Access-Control-Allow-Headers` are set. Mobile clients don't enforce CORS so this hasn't bitten yet, but the moment a web preview / admin dashboard / share-card-renderer hits these functions from a browser they'll fail preflight. Also no `OPTIONS` handler.
- **Fix**: Add a shared CORS helper to a `supabase/functions/_shared/cors.ts` file and prefix every `Deno.serve` handler with an OPTIONS branch returning `204` with the headers.

### 3. `wine-searcher-proxy` swallows write errors when populating the cache
- **File**: `supabase/functions/wine-searcher-proxy/index.ts`
- **Line**: 68–76
- **Severity**: Low
- **Description**: `await supabase.from('pricing_cache').upsert(...)` is unawaited only as far as error handling goes — if the upsert fails (RLS, unique-key violation, etc.) the function still returns the pricing payload but the next call will re-hit the upstream API. Not catastrophic, but invisible.
- **Fix**: Destructure `{ error }` from the upsert and log it.

### 4. `delete-account` returns 500 with the raw error message — and has no CORS headers
- **File**: `supabase/functions/delete-account/index.ts`
- **Line**: 28–31
- **Severity**: Low
- **Description**: If `admin.deleteUser` fails, the catch block returns `JSON.stringify({ error: message })` with the raw Supabase error. That's typically fine but for an admin-API failure it can leak the service-role error envelope. Also no CORS.
- **Fix**: Sanitise to a generic "Could not delete account, contact support" string in production; keep the raw error only in `__DEV__`-equivalent mode (Deno.env check on `SUPABASE_PROJECT_REF` or similar).

### 5. `useCellar.deleteWine` invalidates only `cellar` and `cellar-archive`, not `wishlist`
- **File**: `src/hooks/useCellar.ts`
- **Line**: 33–39
- **Severity**: Low
- **Description**: `deleteWine` calls `archiveCellarWine` (which sets `archived_at`). If the user archives a wine that was actually on their wishlist (`is_wishlist=true`), the wishlist query stays stale until the cache GC kicks in or they navigate away and back. This is an unusual path but possible from the cellar tab.
- **Fix**: Add `qc.invalidateQueries({ queryKey: ['wishlist', userId] })` to `deleteWine.onSuccess`.

### 6. `useArchive.updateNote` doesn't invalidate `rack-slots` (where the wine's note is also surfaced)
- **File**: `src/hooks/useCellar.ts`
- **Line**: 104–108
- **Severity**: Low
- **Description**: Editing a note on an archived wine should be rare, but `app/cellar/[wineId].tsx:175` explicitly invalidates `['rack-slots']` on note save — which means the rack view needs the cached wine note to be up to date. The `useArchive` hook is missing this invalidation, so notes edited from the archive view of a wine that's still racked won't refresh on the rack screen.
- **Fix**: Add `qc.invalidateQueries({ queryKey: ['rack-slots'] })` to `updateNote.onSuccess`.

### 7. `usePreferences.mutation.onError` logs to console only
- **File**: `src/hooks/usePreferences.ts`
- **Line**: 63
- **Severity**: Medium
- **Description**: When the preferences upsert fails (e.g. network blip, RLS rejection), `console.error` is called but no UI feedback is given. `app/profile/wine.tsx:76–79` shows "Your profile has been saved" for 2.5 seconds without checking the mutation state. Users believe their preferences are saved when they may not be.
- **Fix**: Either (a) return the mutation's `isError` / `error` state from the hook and gate the "saved" banner in `wine.tsx` and `recipe.tsx` on `!isError`, or (b) trigger a `showAlert` from inside `onError` so the user knows.

### 8. `food-wine-pairing` and `recommend` use raw `JSON.parse` with no schema validation
- **File**: `supabase/functions/food-wine-pairing/index.ts` (line 117), `supabase/functions/recommend/index.ts` (line 214)
- **Severity**: Low
- **Description**: Both functions extract the first `{ … }` substring from Claude's response and parse it. If Claude returns valid JSON in an unexpected shape (e.g. `{ "wines": "we couldn't find any" }`), the parse succeeds but the client downstream may crash trying to `.map(...)` over a string. `generate-pairings` at least guards with `if (!Array.isArray(parsed?.pairings) || parsed.pairings.length !== 3)`.
- **Fix**: Add shape validation in `food-wine-pairing` (must have `recommendations` array, items must have the documented keys) and in `recommend` (must have `wines` array of 1–3 items, each with the required keys).

---

## UX and Performance Issues

### 1. Onboarding step indicator is visually misleading on step 4 ("Anything to avoid?")
- **File**: `app/onboarding.tsx`
- **Line**: 103–120
- **Severity**: Low
- **Description**: Step 4 renders TWO `ChipPicker` widgets (regions to avoid, grapes to avoid) inside a single ScrollView, but no visual divider beyond the small `subLabel`. With a long region list collapsed at the top, the grapes-to-avoid section sits below the fold and many users don't realise it exists. Skip rate likely high.
- **Fix**: Add a visible divider between the two pickers (the `softDivider` style from `profile/wine.tsx` would work), and surface a count of selections (`Regions to avoid (2 selected)`).

### 2. "Saved" confirmation in profile screens isn't tied to the mutation result
- **File**: `app/profile/wine.tsx` (lines 76–79), `app/profile/recipe.tsx` (lines 33–39)
- **Severity**: Medium
- **Description**: `handleSave` sets `saved=true` and clears after 2.5s. There's no mutation in flight — every individual change has already been persisted by the dropdown's `onChange`. So the user taps "Save Wine Preferences", sees "Your profile has been saved", and exits — but the button was never actually saving anything. If the inline mutations failed (see preferences-error finding above) the user has no recourse. Either remove the button entirely or have it explicitly re-run the mutations.
- **Fix**: Either (a) delete the Save buttons and replace with a passive "Changes are saved automatically" hint, or (b) batch the preference updates locally and only call `updatePreferences` from the Save button.

### 3. `account.tsx` Edit username/email panel is closeable mid-save with no confirmation
- **File**: `app/account.tsx`
- **Line**: 147–183
- **Severity**: Low
- **Description**: While `savingIdentity` is true (the spinner is shown), the user can still tap the username or email TextInput, type, and hit the Cancel link — and on the next render the drafts revert. There's no visual lock on the panel during save. Edge case but disorienting.
- **Fix**: Disable the inputs and cancel link with `editable={!savingIdentity}` while saving.

### 4. Cellar tab has 100+ lines of dead "Import Document" / "Import Spreadsheet" handler code
- **File**: `app/(tabs)/cellar.tsx`
- **Line**: 92–176
- **Severity**: Low
- **Description**: `handleImportDocument` and `handleImportSpreadsheet` (and the `parseCSV`, `findCol` helpers) are never called — the import buttons are rendered as `<View style={styles.buttonDisabled}>` with a "coming soon" tag. This is dead code that increases bundle size and confuses readers.
- **Fix**: Either wire the handlers back up to the buttons, or delete the unused code until the feature ships.

### 5. Chef tab keeps two separate "last result" code paths that don't agree on what counts as "no previous search"
- **File**: `app/(tabs)/chef.tsx`
- **Line**: 26–48, 50–71
- **Severity**: Low
- **Description**: `handleViewLastPairing` checks `if (generalResult || cellarResult)` (in-memory) before falling back to the archive. `handleViewLastLabelSearch` does the analogous `if (wineDetailsConfirmed && pairings.length)`. If the user signed out then back in (clearing the store but not the archive), the messaging is inconsistent. Minor.
- **Fix**: Consolidate to a single helper that always prefers the archive, falling back to the in-memory store only when the archive is empty.

### 6. Scan tab budget can flicker when the profile preference loads after first render
- **File**: `app/(tabs)/scan.tsx`
- **Line**: 33, 78–84
- **Severity**: Low
- **Description**: Initial `useState(savedPreferences?.defaultBudget ?? null)` uses the at-mount value of `savedPreferences`, which is undefined during the first react-query cycle. The effect on line 78 then re-syncs once preferences load. Users see "Budget: ???" briefly, then a jump to the saved default. Cosmetic but jarring on slow networks.
- **Fix**: Render the budget slider only after `savedPreferences !== undefined` (i.e. `isLoading === false`), or show a skeleton.

### 7. `account.tsx` "you're one of the first 10,000 users" copy is shown even for guests at the bottom of the screen with no session
- **File**: `app/account.tsx`
- **Line**: 130 vs 223–230
- **Severity**: Low
- **Description**: The thank-you message renders unconditionally, but the screen also includes a "Sign In" button when `!session`. Users hitting Account without an account see the thank-you and an "Edit username or email" panel with blank fields and `Delete Account` at the bottom — confusing. The screen should be gated behind a session check.
- **Fix**: At the top of the component, return an `ArchiveSignInPrompt`-style screen when `!session`, only rendering the full account UI for signed-in users.

### 8. `welcome.tsx` redirects to `/` via `useEffect(session)` instead of in a top-level guard, so the screen flashes for signed-in users
- **File**: `app/welcome.tsx`
- **Line**: 14–16
- **Severity**: Low
- **Description**: When a signed-in user lands on welcome (e.g. after deep-link redemption that didn't redirect cleanly), the entire screen renders for one frame before the effect fires `router.replace('/')`. The right pattern is the early-return guard, mirroring `app/index.tsx`.
- **Fix**: `if (session) return <Redirect href="/" />;` at the top of the component.

---

## Navigation Issues

### 1. `label/results.tsx` redirects to a non-existent route `/(tabs)/label` on error
- **File**: `app/label/results.tsx`
- **Line**: 59
- **Severity**: High
- **Description**: When the screen mounts without `wineDetailsConfirmed` or `intelligence`, the error fallback offers a "Scan a label" link that calls `router.replace('/(tabs)/label')`. That tab exists in the filesystem but is registered with `href: null` in `app/(tabs)/_layout.tsx:26`, so navigating to it lands the user on a tab that has no entry point. The actual label flow is `/label/camera`. This is reachable any time the user navigates to label/results with a fresh store (e.g. session was cleared).
- **Fix**: Change `/(tabs)/label` to `/(tabs)/cellar` (where the label/scan entry is) or `/label/camera` (start the flow directly).

### 2. `app/(auth)/_layout.tsx` doesn't register `forgot-password` though the file is in the same group
- **File**: `app/(auth)/_layout.tsx`
- **Line**: 5–9
- **Severity**: Low
- **Description**: The auth-group layout's Stack only lists `sign-in` and `sign-up`. `forgot-password` exists at `app/(auth)/forgot-password.tsx` and is registered globally at `app/_layout.tsx:116` as `(auth)/forgot-password`. Expo-router still resolves it through filesystem-based routing, but the inconsistency means the screen won't pick up any shared options the group layout defines later. The Stack registry is also misleading for new contributors.
- **Fix**: Add `<Stack.Screen name="forgot-password" />` to the (auth) layout and remove the duplicate `(auth)/forgot-password` line from the root layout.

### 3. `cellar/archive` route is reachable but missing from the root Stack registry
- **File**: `app/_layout.tsx`
- **Line**: 134–144
- **Severity**: Low
- **Description**: `app/(tabs)/cellar.tsx:230` does `router.push('/cellar/archive')`. The file `app/cellar/archive.tsx` exists. The Stack.Screen registry in `_layout.tsx` lists every other cellar route (`list`, `full-list`, `wishlist`, etc.) but not `archive`. Filesystem routing means it still works, but the same applies to `cellar/notes.tsx` and `chef/label-archive.tsx` (orphan files not referenced from anywhere — and not in the registry either). Mixing "everything must be registered" with "some routes can be implicit" is a maintenance footgun.
- **Fix**: Either register every routed screen (`<Stack.Screen name="cellar/archive" />`) or delete the registry entirely and rely on filesystem-based routing. The middle ground we have now is the worst of both.

### 4. Dead/orphan route files
- **File**: `app/cellar/notes.tsx`, `app/chef/label-archive.tsx`, `app/(tabs)/label.tsx`
- **Severity**: Low
- **Description**: None of these are referenced from any other file's `router.push` / `router.replace` / `<Link>`. They are reachable only by direct URL typing (in dev mode) and contribute dead code to bundle. `app/cellar/notes.tsx` is referenced only in a stale comment at `app/wines/chosen.tsx:32`.
- **Fix**: Delete them, or document why they exist (if they're WIP).

### 5. `history.tsx` is in the tabs folder with `href: null` but reachable via `/scan/history`
- **File**: `app/(tabs)/history.tsx`, `app/scan/history.tsx`
- **Severity**: Low
- **Description**: Both files exist. `app/(tabs)/scan.tsx:279` pushes `/scan/history` — that resolves to `app/scan/history.tsx`. `app/(tabs)/history.tsx` is hidden via `href: null` and not pushed from anywhere. Two screens, both named "history", with different layouts and routing semantics. Confusing on inspection.
- **Fix**: Delete `app/(tabs)/history.tsx` if `/scan/history` is the canonical path, or vice versa.

### 6. After email confirm via `auth/callback`, both the callback screen AND the global handler in `_layout.tsx` can try to redeem the same token
- **File**: `app/_layout.tsx` (lines 62–95), `app/auth/callback.tsx` (lines 17–52)
- **Severity**: Low (already handled defensively, but worth flagging)
- **Description**: The deep-link handler in `_layout.tsx` calls `supabase.auth.verifyOtp(...)` on cold-start. The callback screen ALSO calls `verifyOtp` on mount with the same params. The callback file's own comment (line 11) acknowledges this race and falls back to `getSession()` — but the fix is fragile. A token can only be redeemed once, so on the slower of the two paths the user sees the "Couldn't verify" error fallback for a fraction of a second before the session check rescues them.
- **Fix**: Pick one redeemer. Recommended: have `_layout.tsx` do all token redemption and the callback screen just acts as a passive landing page that checks `getSession()` and redirects. Strip the `verifyOtp` call from `callback.tsx`.

---

## Summary of Findings

| Severity | Count |
| --- | --- |
| High | 2 |
| Medium | 8 |
| Low | 16 |
| **Total** | **26** |

### Top 3 Most Impactful

1. **`label/results.tsx` redirects to dead `/(tabs)/label` route** — high severity, user-facing dead-end on a common error path.
2. **`handleScreenshot` recursion latent infinite loop** — high severity, fragile pattern that will break under any refactor.
3. **Preferences mutations failing silently while showing "saved" confirmation** — medium severity but two screens are affected (`profile/wine.tsx`, `profile/recipe.tsx`) and it actively misleads the user.
