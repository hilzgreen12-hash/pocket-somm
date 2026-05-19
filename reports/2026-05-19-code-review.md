# Vinster Code Review — 2026-05-19

Scope: 11 commits between `25f2bc9..2f710d6` (Home polish through Duplicate-review prompt). Focus on the new age gate / privacy work, large-format rack row, bottle-size pipeline, personality popup + nudge, review-dedup flow, and the assorted bug-fix/polish sweeps. The long-known pre-existing type drift list is excluded.

---

## Bugs and Crashes

### 1. Migration 041 (`large_format_cols`, `large_format_bottle_size_ml`) was never committed
- **File**: `supabase/migrations/` (the file should be `041_large_format_rack_row.sql`)
- **Severity**: High
- **Description**: Commit `00e62d6` ("Large-format rack/fridge row") added app code that reads `rack.large_format_cols` (`app/cellar/rack/[rackId].tsx:119`) and writes `large_format_cols` / `large_format_bottle_size_ml` on insert (`src/api/racks.ts:43-46`). The commit message claims migration 041 was created — `git show 00e62d6 --stat` shows only `src/`, `app/`, and no migration. `supabase/migrations/` ends at 040. Any user who opts in to "Insert large-format row" will hit a Supabase error on insert (`column wine_racks.large_format_cols does not exist`); reads still work because Postgres just ignores unknown selector columns, but every rack render will show a missing large-format row even if the user thought they configured one. The CHECK constraint the commit message mentions also doesn't exist, so a future hotfix has nothing to enforce coupling.
- **Fix**: Create `supabase/migrations/041_large_format_rack_row.sql` adding the two columns plus `check ((large_format_cols is null) = (large_format_bottle_size_ml is null))`, and run it against the remote project before the next build.

### 2. Domain harmonisation reverted by the next commit
- **File**: `supabase/email-templates/confirm-signup.html`, `reset-password.html`, `change-email.html` (line 67 in each)
- **Severity**: High
- **Description**: `a315a0a` updated all three Supabase email-template footers from `vinsterapp.com` to `vinster.app` (with a follow-on note that the live Supabase dashboard was also edited manually). The very next commit `2f710d6` ("Home polish: VINSTER breathing room, new motifs, personality popup") flips every footer back to `vinsterapp.com` — see the `2f710d6` diff against those three files. The "Home polish" commit otherwise touches nothing remotely related to email templates, so this looks like an accidental revert from an out-of-date local copy. The live Supabase dashboard now disagrees with the repo, and the next `eas` build that includes these will be inconsistent with the app's stated `vinster.app` policy URL and bundle id.
- **Fix**: Re-apply `vinster.app` to the three HTML files (or, if `vinsterapp.com` is the real intent, document that and revert `legal/PRIVACY_POLICY.md:9` plus `app/legal/privacy.tsx:6` which still say `vinsterapp.com`). Either way the repo + Supabase dashboard need to agree.

### 3. Large-format row placement leaks into the standard grid
- **File**: `app/label/results.tsx` (`computeSlots`, lines 103-122) and `app/cellar/rack/[rackId].tsx` (`computePlacementSlots`, lines 170-186)
- **Severity**: High
- **Description**: Both functions treat the rack as a single `rows × cols` grid. The large-format row uses `row_index = -1` as a sentinel. If the user taps an empty large-format slot and asks for 3 bottles "Vertical", the loop starts at `row = -1`, then increments to `0, 1, …` — happily inserting two of the magnums into the first two standard-row slots. Horizontal placement is OK as long as `count <= large_format_cols`, but `count > large_format_cols` wraps into `col = 0; row++` and writes a magnum into the standard grid. The receiving `assignSlots` call has no constraint on `row_index` so the writes succeed silently and the rack grid then renders the magnum bottle in a 750ml slot (with no size warning anywhere).
- **Fix**: When `pendingSlot.row === -1` or `placingAt.row === -1`, cap the loop with `large_format_cols` and `largeFormat: true`, and bail out when the orientation would cross into the standard grid. Or simpler: forbid multi-slot placement in the large-format row (one bottle at a time) until the call sites understand the two-grid geometry.

### 4. Age gate "rejected" state isn't persisted — quitting the app bypasses the under-18 block
- **File**: `app/age-gate.tsx`
- **Line**: 84-86, 117
- **Severity**: High
- **Description**: When the user enters a DOB that's under 18, the screen shows a blocked-state view with a "Try again" button — but nothing is written to AsyncStorage. Closing the app and reopening it lands the user back on the fresh, blank gate (`vinster_age_verified_at` is still unset), and a different DOB walks them straight into the app. For an Apple/Google review submission this is exactly the failure case both stores look for (the gate must be persistent against trivial bypass). The "Try again" button itself zeroes the inputs but doesn't time-bound or rate-limit retries either.
- **Fix**: When `result.age < MIN_AGE_YEARS`, write a `vinster_age_blocked_at` entry to AsyncStorage and check it in `app/index.tsx` so a blocked device hits the rejection screen on every cold-start. A "contact support" or "I entered the wrong date" path can still exist behind a confirmation prompt — but the default must be "blocked stays blocked."

### 5. Age gate silently no-ops when the DOB is invalid
- **File**: `app/age-gate.tsx`
- **Line**: 79-83
- **Severity**: Medium
- **Description**: `validateDob` returns `{ ok: false, reason: '…' }` for empty fields, impossible dates (31 Feb), or out-of-range years. The handler reads only `result.ok` and falls through: nothing is shown to the user. With the Continue button disabled until `dobLooksFilled` (day length > 0, month > 0, year === 4), the user typically can't trigger this — but a single-digit day plus a 4-digit year is enough to pass the gate but fail validation, and they tap a button that does nothing. The `reason` field is computed and discarded.
- **Fix**: Add `useState<string | null>` for an inline error message and show `result.reason` under the date row when validation fails. Or relax `dobLooksFilled` to require `>= 1`, `>= 1`, and `=== 4` so the "doesn't look like a valid date" path can never be reached and just delete `reason`.

### 6. Two competing personality modals can show simultaneously on home
- **File**: `app/home.tsx` (lines 132-151, 208-216, 220-243)
- **Severity**: Medium
- **Description**: `HomeScreen` now renders both `PersonalityPromptModal` (for an ungenerated sketch that's met the activity gate) and a "Your personality is ready" `Modal` (for a generated-but-unacknowledged sketch). A realistic state — wine sketch exists and was never acknowledged, foodie sketch hasn't been generated but the foodie activity gate has been met — has both `personalityCategory` truthy AND `featured.at` truthy with no ack. React Native will mount both Modals; depending on platform / animation timing one stacks visually on top of the other and the user has to dismiss both. The "ready" popup also doesn't suppress the nudge or vice versa.
- **Fix**: Decide priority (probably "ready" wins, since it's the more compelling moment) and short-circuit: `visible={!!personalityCategory && !promptDismissed && !readyPopupVisible}` on the prompt modal. Even better, build a single shared popup component that gets a `mode: 'nudge' | 'ready'` prop.

### 7. `usePersonalityPrompt` bumps the spacing counter inside the effect even when the user can never see the prompt
- **File**: `src/hooks/usePersonalityPrompt.ts`
- **Line**: 18-19, 79-83
- **Severity**: Medium
- **Description**: The module-level `bumpedSpacingThisSession` flips to `true` the first time the effect runs for a user who's earned at least one sketch (`generated.wine || generated.recipe`). The bump happens before the `setCategory` decision is made, so if the user is on a route where the home screen is mounted but invisible (e.g. coming back via deep link), the spacing counter still advances. Same module-level flag is shared between all callers of the hook, so if the hook is ever reused on another screen, the counter advances twice for the same "session." The lifetime model is "module reload = new session," which holds for cold-starts but breaks under Fast Refresh in dev. Probably not user-visible today but fragile.
- **Fix**: Only bump after the user actually dismisses the prompt (move the bump into `onDismiss` on `PersonalityPromptModal`'s parent). The current design has the side-effect happening at "we considered showing this" not "we actually showed it."

### 8. `scoreCluster` share-icon TouchableOpacity is nested inside the card's TouchableOpacity
- **File**: `app/wines/chosen.tsx`
- **Line**: 437-450
- **Severity**: Low
- **Description**: The compact review card is a `TouchableOpacity` (open editor on press). The new `ShareIcon` sits inside a child `TouchableOpacity` (line 437) that calls `handleShareReview`. In React Native the inner Touchable wins the responder so the parent's `onPress` is suppressed — that part is fine. But the `onLongPress` (delete-review prompt) is also attached to the parent, and long-pressing on the share icon's hit-slop does trigger the parent's long-press because the inner Touchable's responder is only claimed on `onPressIn`/`onPress` short events. Long-pressing the share icon by 400 ms will open the "Delete review?" alert.
- **Fix**: Add `onLongPress={() => handleShareReview(item)}` (or a no-op) to the inner Touchable so it claims the long-press handler too, OR pull the share icon out of the card's touchable hierarchy entirely.

### 9. `bumpedSpacingThisSession` is a module-level `let` — Fast Refresh in dev reuses it
- **File**: `src/hooks/usePersonalityPrompt.ts` line 18
- **Severity**: Low
- **Description**: Module state survives JS hot-reload in dev (intentional in some setups, but unpredictable in Expo). In production it's fine for cold-starts, but in TestFlight a user who's signed out and back in without a process restart will keep the prior session's bump. Not user-impacting but a fragility flag.
- **Fix**: Move the bump tracking into AsyncStorage keyed on a session ID, or use a `useRef` shared via React context.

### 10. `handleSaveReview` on label/results crashes if `wine.wineName` and `wine.producer` are both null
- **File**: `app/label/results.tsx`
- **Line**: 318-321
- **Severity**: Low
- **Description**: `wineName: wine.wineName ?? wine.producer` falls back to producer when wineName is null. But `WineDetailsComplete.wineName` is `string | null` and `producer` is `string`, so this is type-safe at compile time. The risk is downstream: `saveManual` requires a non-empty wineName for the row — passing `wine.producer` works, but `(wine.wineName ?? wine.producer)` can produce a duplicate of the producer field as the wine_name. Once that row is saved, the Your Wine Reviews list shows e.g. "Mullineux — Mullineux 2019" which is confusing. The manual-add path through `AddChosenWineModal` validates wineName separately (`AddChosenWineModal.tsx:55`) so this is the only path that swallows the case.
- **Fix**: Validate that `wineName.trim().length > 0` on the modal before allowing Save, or skip the fallback and require wineName.

---

## Supabase and Edge Function Issues

### 1. `scan-label`'s bottle-size response will mismatch Half / Quarter bottles in cl
- **File**: `supabase/functions/scan-label/index.ts`
- **Line**: 19-22 (prompt), 47-52 (clamp)
- **Severity**: Low
- **Description**: The prompt says "Convert to millilitres: 75cl → 750; 37.5cl / Half → 375; 50cl → 500; 1L → 1000; 1.5L / Magnum → 1500…". The clamp accepts 50ml-30000ml. Two edge cases the prompt doesn't enumerate but Claude is likely to encounter: 187ml ("quarter bottle" / "piccolo", common for sparkling), and 250ml (a frequent restaurant by-the-glass carafe — though that's a serve not a bottle). The clamp range accepts 187 and 250 but the picker only offers 375 / 500 / 750 / 1000 / 1500 / 3000 / Other. A label with "187ml" scanned will arrive at the cellar picker showing "Other" pre-populated to 18.7cl, which is awkward but not broken.
- **Fix**: Either teach the prompt to map 187 → 375 (round up to closest standard), or add 187ml/piccolo to `COMMON_BOTTLE_SIZES`. The clamp is fine — the prompt is the right place to fix it.

### 2. `bottle_size_ml` migration runs `add column if not exists … not null default 750` — fine on Postgres but doesn't gate the backfill
- **File**: `supabase/migrations/040_bottle_size_ml.sql`
- **Line**: 6-7
- **Severity**: Low
- **Description**: `not null default 750` backfills every existing row with 750. That's correct for the 99% case. If the user already has magnums in the cellar from before this column existed, those rows will silently report 750ml — there's no way for the migration to know. Not a bug per se, but worth a one-time data audit: a tool that lets the user mark up oversized bottles (or a "your large-format wines may be wrong" note on the cellar list) would catch this.
- **Fix**: One-off — no schema change needed. Just acknowledge the assumption in the migration comment and consider a "review oversized bottles" prompt one time on first launch after this column lands.

### 3. `useChosenWines.remove` doesn't invalidate the community feed or cellar caches
- **File**: `src/hooks/useChosenWines.ts`
- **Line**: 89-95
- **Severity**: Low
- **Description**: `remove` is the new delete-review mutation. It invalidates `['chosen-wines', userId]` and `['my-community-uploads', userId]` but not `['community-feed']` (other users' visibility of your published review) or any cellar/wishlist cache that mirrors the same wine. If the review was published to the community feed via `publishChosenWineToCommunity`, the row may still be live in `community_reviews` (the mutation only deletes from `chosen_wines`) — investigate whether the publish path leaves a row in another table that should also be deleted.
- **Fix**: Add `['community-feed']` to the invalidation set, and if `community_reviews` rows are written by the publish path, delete those too when the source `chosen_wines` is removed (or add a cascade on the FK).

### 4. Pruning retired style ids fires for every preferences load even after it succeeds
- **File**: `src/hooks/usePreferences.ts`
- **Line**: 38-49
- **Severity**: Low
- **Description**: The cleanup writes `cleanedStyles` back to the row when `cleanedStyles.length !== rawStyles.length`. After the first successful prune, the next read returns the cleaned list — so this condition is false and no further writes happen. Fine. But if the prune **fails** (RLS, network) the warn is logged and the in-memory result is still the cleaned list, so the UI looks right; the DB row is left dirty and the prune retries on every page reload. Not catastrophic but wasted writes.
- **Fix**: Add a guard like `if (rawStyles.length > 0 && cleanedStyles.length === 0)` to avoid the case where every saved style was retired (the user gets reset to "Any" silently), and either fire-and-forget once per session or store a "pruned at" marker in AsyncStorage.

### 5. `chosen_wines.chosen_at` written as a date string, not a timestamp
- **File**: `src/api/chosenWines.ts`
- **Line**: 93-96
- **Severity**: Low
- **Description**: `if (reviewDate) row.chosen_at = reviewDate;` sets `chosen_at` to `YYYY-MM-DD` (no time component). The column was timestamp-typed (it previously defaulted to `now()`). Postgres will coerce a date-only string to `2026-05-18 00:00:00+00`, which means every review backdated by the user now sits at midnight UTC — which on a UK user is the previous evening. So a review the user types in for "18 May 2026" will sort just before reviews timed for noon on the 17th. The list sort by `chosen_at` (Your Wine Reviews) is by date alone (`new Date(b.chosen_at).getTime()`) so the UX impact is small, but the data is now slightly wrong for any tooling that compares timestamps across reviews.
- **Fix**: Parse the date in local time and write `${dateIso}T12:00:00` (mid-day local) so the row's local date matches what the user picked regardless of timezone.

---

## UX and Performance Issues

### 1. Privacy policy contact email is a typo'd domain
- **File**: `app/legal/privacy.tsx` (line 11), `legal/PRIVACY_POLICY.md` (line 95)
- **Severity**: Medium
- **Description**: `CONTACT_EMAIL = 'tellme@vinterapp.com'` — missing the 's' in "Vinster" (compare against the app's stated domain `vinster.app` and the founder-acknowledged target `vinsterapp.com`). This email is the *only* contact route given to users for data-subject requests under UK GDPR. If the mailbox doesn't exist (or worse, someone else owns `vinterapp.com` and is now receiving Vinster users' privacy requests), the ICO will treat this as a failure to provide a working contact. The same typo lives at `app/about.tsx:5` for `FEEDBACK_EMAIL` — that one is pre-existing, but the privacy-policy use is new in this batch and amplifies the impact. Both store-submission privacy policies will copy this verbatim.
- **Fix**: Confirm the real domain (`vinsterapp.com` or `vinster.app`) and update both files plus `app/about.tsx`. Test the inbox before submitting to the App Store.

### 2. Privacy policy still says `[Your Full Legal Name]` (placeholder) and `https://vinsterapp.com/privacy`
- **File**: `app/legal/privacy.tsx` (line 18), `legal/PRIVACY_POLICY.md` (lines 9, 18)
- **Severity**: Medium
- **Description**: The "Who we are" section identifies the operator as "[Your Full Legal Name], a sole trader based in the United Kingdom." Shipping this through TestFlight (or worse, App Store review) with a placeholder bracket will not pass — both stores explicitly require a named legal entity. The hosted-URL comment also says `https://vinsterapp.com/privacy` even though the app and bundle id moved to `vinster.app`.
- **Fix**: Drop the founder's legal name into both files and pick the canonical domain. Bump the `POLICY_VERSION` line when you do (it currently reads "Version 1.0 · Last updated May 2026").

### 3. Privacy policy "We may briefly use your device location (with your permission)" overstates the consent UX
- **File**: `app/legal/privacy.tsx`
- **Line**: 22 (the "What we collect" body)
- **Severity**: Low
- **Description**: The text claims "with your permission." The app does request location permission via the Expo location API, but the privacy text doesn't mention that the city is also written back to `chosen_wines.city` and `cellar_wines.review_location`, both of which are queryable by community-publish paths if the user opts in. If the user toggles community publish on (an action that's covered separately in the policy), the city derived from their location ends up in `community_reviews` — i.e. inferable PII tied to the user's account. Worth saying explicitly.
- **Fix**: Append one sentence: "If you publish a review to the community feed, any city you've attached to that review is published with it."

### 4. `dobLooksFilled` allows submit when day is a single digit
- **File**: `app/age-gate.tsx`
- **Line**: 102
- **Severity**: Low
- **Description**: `dobLooksFilled = day.length > 0 && month.length > 0 && year.length === 4;` — `day.length > 0` accepts a single digit. `month.length > 0` also accepts single. The user can type "1/1/2000" and tap Continue; validateDob then accepts it (parseInt of "1" is 1, both within bounds). The form is forgiving but doesn't enforce padding visually. Combined with the silent-no-op on invalid dates (finding 5 above), an edge case of (say) "29/2/2025" — not a leap year — silently does nothing.
- **Fix**: Tighten `dobLooksFilled` to require length 2/2/4 or show the validation reason on Continue. Either approach kills the silent-fail path.

### 5. Personality popup uses `useFocusEffect` to re-fire — but the AsyncStorage read races the navigation
- **File**: `app/home.tsx`
- **Line**: 142-151
- **Severity**: Low
- **Description**: When the user taps "View my personality", `handleViewReady` sets `readyPopupVisible(false)` and pushes the personality route. The `useFocusEffect` cleanup sets `cancelled = true`, but the AsyncStorage read inside has already resolved with `needsAck=true`, scheduled a `setReadyPopupVisible(true)` call that runs after the screen has unfocused. The cancelled flag catches this — but only because the `setReadyPopupVisible` is inside the `if (!cancelled)` branch. Looking at it carefully, the code is correct as written. The actual risk is the gap between the ack-write (which happens on the personality screen mount, line 71-75 of `app/profile/personality.tsx`) and the home re-focus. If the user backs out before the ack write completes, the next focus on home will re-show the popup. Edge case but visible on slow devices.
- **Fix**: Eagerly write the ack key when handleViewReady fires (don't wait for the personality screen to mount), or store the ack in a synchronous in-memory cache that's checked first.

### 6. Wine list share card no longer has a fixed height — captureRef gets a very tall image for some recipes / sketches
- **File**: `src/components/PersonalityShareCard.tsx` (line 50), `src/components/RecipeShareCard.tsx` (line 87), `src/components/WineListShareCard.tsx` (line 85), `app/profile/personality.tsx` (line 241-249), `app/chef/results.tsx` (line 182-186), `app/scan/results.tsx` (line 268-275)
- **Severity**: Low
- **Description**: The shift from "fixed 1080×N (capped)" to "natural height" is a good user-facing fix (clipping was the bigger issue), but the capture can now produce a single PNG that's 1080×4000+ for a long personality sketch or a verbose recipe. WhatsApp, iMessage, and email handle this OK; Instagram Stories will downscale aggressively (story canvas is 9:16 = 1080×1920). Worth noting because some recipe shares may render unreadably small in Stories now where they were sized correctly before.
- **Fix**: Optional — set a max height (e.g. clamp at 3000px) and let captureRef shrink overlong cards rather than producing 5000px tall PNGs. Or detect content length and switch to a multi-page card for very long recipes.

### 7. `bottleSizeLabel` for 750ml renders "75cl" not "Standard" — Cellar List rows that DO have non-default sizes show the label, hiding the implicit context
- **File**: `app/cellar/list.tsx`
- **Line**: 306-308
- **Severity**: Low
- **Description**: The code reads `if (w.bottle_size_ml && w.bottle_size_ml !== 750)` then appends `bottleSizeLabel(...)`. Implementation is correct. The minor UX wrinkle: when a user has a Magnum next to a regular bottle, the regular one shows "Margaux · Cabernet Sauvignon" and the magnum shows "Margaux · Cabernet Sauvignon · 1.5L (Magnum)" — so the absence of a size label on the regular row reads as "no info," not "default." Some users will infer the regular bottles are also magnums because the label is missing.
- **Fix**: Either always show the size label (which makes 750ml rows verbose), or use a more prominent gold badge for non-default sizes so the absence reads as "standard" not "unknown."

### 8. Add Wine modal's three primary actions (Scan / Upload / Manual) have no keyboard accessibility — modal is unscrollable
- **File**: `app/(tabs)/cellar.tsx`
- **Line**: 132-166
- **Severity**: Low
- **Description**: The modal sheet is a `<TouchableOpacity activeOpacity={1}>` with three stacked `TouchableOpacity` buttons. On a short device (iPhone SE, 568pt height) the sheet renders past the visible area when the keyboard isn't up, and there's no scrolling — the Cancel link is sometimes below the home indicator. Low-priority since the modal is only 3 buttons + title + body but worth flagging now while the modal still has room to grow.
- **Fix**: Wrap the sheet in a ScrollView, or test on the smallest target device and confirm everything's visible.

### 9. `chooser` modal in cellar/racks.tsx reuses generic styles — close-on-tap-outside also fires when the modal is half-open
- **File**: `app/cellar/racks.tsx`
- **Line**: 207-231
- **Severity**: Low
- **Description**: `<Modal animationType="fade" onRequestClose={() => setChooser(null)}>` is wrapped in a full-screen TouchableOpacity that fires `setChooser(null)` on press. During the fade-in animation a tap on the overlay (which is now the only thing showing) closes the modal before the user sees what's in it. iOS-tap-too-fast users will mistake this for an unresponsive button.
- **Fix**: Either disable `onPress` on the overlay until `animationType` completes, or skip the close-on-overlay-press pattern and require explicit Cancel.

### 10. `useFocusEffect` ack-popup compares timestamps as strings (`>` on ISO strings) — works but fragile
- **File**: `app/home.tsx`
- **Line**: 147
- **Severity**: Low
- **Description**: `(featured.at ?? '') > ackedAt` — ISO 8601 string comparison happens to be correctly ordered for `YYYY-MM-DDTHH:MM:SS.sssZ` strings. This is intentional but unobvious. If a future migration ever introduces a non-UTC timezone offset (`+01:00`) or a fractional second precision change, the comparison silently breaks.
- **Fix**: Compare numerically: `new Date(featured.at).getTime() > new Date(ackedAt).getTime()`. One extra parse, but the intent is explicit.

### 11. Privacy-policy "Get in touch" link is a `Text` `onPress` with `Linking.openURL`, not a TouchableOpacity
- **File**: `app/legal/privacy.tsx`
- **Line**: 87-90
- **Severity**: Low
- **Description**: `<Text style={styles.contactLink} onPress={() => Linking.openURL(…)}>` works but provides no visual press feedback and no `accessibilityRole="link"`. Screen-reader users have no signal this is tappable; sighted users see a static-looking gold underlined word and may not realise it opens a mail composer.
- **Fix**: Wrap in a `<TouchableOpacity activeOpacity={0.7}>` with the link styling, and add `accessibilityRole="link"`.

---

## Navigation Issues

### 1. Rack Back button now navigates to /(tabs)/cellar but skips intermediate screens the user came from
- **File**: `app/cellar/rack/[rackId].tsx`
- **Line**: 332-336
- **Severity**: Low
- **Description**: The fix in `097792b` ("Wine rack Back button … router.back() landed on a scanner") changed `router.back()` to `router.navigate('/(tabs)/cellar')`. This solves the dead-end on the scan-then-rack flow, but it ALSO bypasses the Racks list page (`/cellar/racks`) when the user reached the rack from that page. A user navigating Cellar → Racks → individual rack → Back now lands on Cellar (skipping Racks), so they can't easily compare two racks side by side. Pre-fix behaviour was "back to wherever I came from"; post-fix is "always back to Cellar."
- **Fix**: Track entry origin in the rack store (or pass `from=racks` as a query param) and route accordingly. Or accept the trade-off (the fix prevents the scanner dead-end which is arguably worse).

### 2. /label/confirm's manual mode has Cancel → router.back(), which lands on the previous screen — Cellar tab is correct, but Wishlist add-via-manual is missing
- **File**: `app/label/confirm.tsx`
- **Line**: 141-149
- **Severity**: Low
- **Description**: The Manual Input path is only wired up from the Cellar tab Add Wine modal. There's no equivalent in the Wishlist or Reviews entry flows even though both have an Add chooser. A user who wants to record a wine in their wishlist by hand has to go through Cellar → Add → Manual Input → save → archive flow, which feels indirect.
- **Fix**: Add a Manual Input option to the Wishlist add chooser (mirroring `app/(tabs)/cellar.tsx:149-160`) routing to `/label/confirm?context=wishlist&manual=1`. The forwarding logic in `confirm.tsx:17` already handles arbitrary `context` strings.

### 3. The age-gate route is registered in app/_layout.tsx but allowed to be deep-linked into
- **File**: `app/_layout.tsx`
- **Line**: 170-171
- **Severity**: Low
- **Description**: `<Stack.Screen name="age-gate" />` and `<Stack.Screen name="legal/privacy" />` are registered alongside other authenticated screens. A signed-in user can call `router.push('/age-gate')` directly and re-trigger the gate; the AsyncStorage read in `index.tsx` is bypassed because they're navigating manually rather than going through index. Not a real-world threat but worth flagging — the gate should be an `app/index`-only redirect.
- **Fix**: Either hide the route from the registered Stack (filesystem routing still resolves it on cold start) or add `if (ageVerified) return <Redirect href="/" />` to the gate component so manual visits are a no-op.

---

## Type Safety

### 1. `WineType` re-export from `WineTypePicker.tsx` is shadowed by import
- **File**: `src/components/preferences/WineTypePicker.tsx`
- **Line**: 1-7
- **Severity**: Low
- **Description**: The picker imports `WineType` from `../../types/preferences` and then re-exports it (`export type { WineType };`). The local `type WineType = …` line was removed and the re-export is correct, but anything that imports `WineType` from the picker now relies on a transitive re-export. Older imports of `WineType` from the picker still work, but newer code should pull from `types/preferences`. Worth a comment or a deprecation note.
- **Fix**: Add a `// @deprecated — import from types/preferences` comment above the re-export, then sweep call sites in a follow-up.

### 2. `useChosenWines` `remove` return shape isn't typed in the hook return
- **File**: `src/hooks/useChosenWines.ts`
- **Line**: 88-94
- **Severity**: Low
- **Description**: The hook returns `{ chosenWines, isLoading, save, update, saveManual, remove }`. `remove` is a `UseMutationResult` with `mutationFn: (id: string) => Promise<void>`. Callers correctly use `remove.mutate(id, { onSuccess, onError })`. No issue today — but the hook's return type isn't declared (inferred), so a future caller could try `remove(id)` expecting a plain function and get an "is not a function" error.
- **Fix**: Add an explicit return type to `useChosenWines()`. Same applies to `useCellar`, `useWishList`, `useArchive` — they share the same implicit-return-type style.

---

## Privacy & Compliance

### 1. Age gate doesn't comply with Apple's "permanent rejection" requirement
- **File**: `app/age-gate.tsx`
- **Line**: see Bug #4 above
- **Severity**: High (compliance)
- **Description**: This is the same issue as bug #4 above, but worth flagging in the compliance section: Apple App Store Review Guideline 1.4.3 ("Apps with alcohol… use") requires that under-age users are *permanently* blocked from the app on a given device until they re-verify (re-install). Both stores look for "the user just types in a different date" as a known bypass. The current implementation leaves no trace of the rejection, so a tester sees the gate pass after a fresh date even though the device is "blocked" from the previous attempt.
- **Fix**: Same as Bug #4. Apple reviewers WILL test this case.

### 2. Privacy policy mentions Anthropic doesn't train on user data — true under current API terms, but the policy doesn't pin which API tier
- **File**: `app/legal/privacy.tsx`
- **Line**: ~46 (the "Third parties" body) and `legal/PRIVACY_POLICY.md` line 50
- **Severity**: Low
- **Description**: The text reads "Anthropic does not retain this data for training under their API terms." That's accurate for the public Claude API, but Claude products vary — Anthropic's Workbench, Console UI, and free-tier behaviour differ. If Vinster ever falls back to a different Anthropic surface (e.g. a hypothetical "consumer" tier that does train), the policy will be out of date. Low risk today since the app explicitly calls the API.
- **Fix**: Tighten to "Anthropic does not retain or train on data submitted via the API under their commercial terms (https://www.anthropic.com/legal/commercial-terms)" and add a footnote that the policy refers to the API specifically.

### 3. Privacy policy "photos … are processed by Claude and then discarded by our edge functions — they are not retained on our servers" — true today, but the wishlist-note image flow doesn't go through edge functions
- **File**: `app/legal/privacy.tsx`
- **Line**: ~58 (the "AI and your data" body)
- **Severity**: Low
- **Description**: The text implies all photos are processed by edge functions. The label-scan flow does flow through `scan-label`, `wine-intelligence`, etc., which use the photo in memory and don't write it back. But uploaded wine-list / label photos are stored as base64 in the scan-history archive on the device's local store, and metadata IDs are written to `scan_sessions`. If the photo is also stored on Supabase Storage (which `prepareImageBase64` does on some paths), then "they are not retained on our servers" is technically false. Audit the actual storage paths before publishing.
- **Fix**: Trace every photo upload to confirm where bytes land; either update the policy or stop persisting photos.

---

## Tech Debt

### 1. `vinster_personality_acked_${cat}` and `vinster_age_verified_at` AsyncStorage keys have no migration story
- **File**: `app/age-gate.tsx`, `app/home.tsx`, `app/profile/personality.tsx`
- **Severity**: Low
- **Description**: New AsyncStorage keys are accumulating: `vinster_age_verified_at`, `vinster_personality_acked_wine`, `vinster_personality_acked_recipe`, `vinster_personality_second_prompt_skips`. None have a version number, none are namespaced in a single helper. If the value shape ever changes (e.g. switching the age-gate storage to include a "blocked" flag — see Bug #4), there's no way to migrate the existing JSON. A `vinster_storage_v1` namespace prefix + a centralised key registry would let future migrations be explicit.
- **Fix**: Move every AsyncStorage key into `src/storage/keys.ts` and prefix them with a version: `'v1:age-verified-at'`, `'v1:personality-acked:wine'`. Then a future v2 can read both during a migration window.

### 2. The age-gate writes the user's DOB to local AsyncStorage, accessible to any code in the app
- **File**: `app/age-gate.tsx`
- **Line**: 94
- **Severity**: Low
- **Description**: `AsyncStorage.setItem(AGE_GATE_KEY, JSON.stringify({ verifiedAt, dob: result.iso }))` — the DOB is now stored in plain text in the device's AsyncStorage, which is unencrypted on Android and only encrypted on iOS when the device is locked. The DOB is PII; if a future feature reads it, the comment ("birthday wishes, age-adjusted recommendations") suggests the founder anticipates reuse, but right now no caller reads `dob`. Storing it for "cheap and useful future use" is a privacy footprint that the privacy policy doesn't mention.
- **Fix**: Drop the DOB; store only `{ verifiedAt, ageGateAge: result.age }` so the gate decision is preserved without persisting an actual birth date. If future features need it, add the storage at that time (and the policy line).

### 3. `BottleSizePicker` "Other" cl input + `bottleSizeLabel` function are duplicated across cellar/list, add modals, and the wish list — but the truth-source of standard sizes is in one place. Good. The issue: no canonical place to map ml → user-facing label.
- **File**: `src/components/BottleSizePicker.tsx`
- **Line**: 19-26
- **Severity**: Low
- **Description**: `bottleSizeLabel` is exported from the picker module, which is correct. The risk: if a future screen wants to render a bottle size without importing a picker, it'll import a Picker module just for the label function. Better to lift the label fn to `src/utils/bottleSize.ts` (or similar).
- **Fix**: Cosmetic — move `COMMON_BOTTLE_SIZES` and `bottleSizeLabel` to `src/utils/bottleSize.ts` and import from there in both the picker and the list screens.

### 4. The new `reviewDedup.ts` "norm" function is yet another normaliser
- **File**: `src/utils/reviewDedup.ts`
- **Line**: 7-9
- **Severity**: Low
- **Description**: `norm(s) = (s ?? '').trim().toLowerCase()` is repeated in `src/services/reviewSync.ts`, in `app/cellar/wishlist.tsx:90`, and now in `reviewDedup.ts`. Three copies of the same identity-matching code makes a behaviour change (e.g. trim Unicode whitespace, collapse internal whitespace, strip accents) hard to roll out safely.
- **Fix**: Move `norm` and `wineIdentityKey` to `src/utils/wineIdentity.ts` and import from there. Even better: rewrite `findExistingReview` to consume `wineIdentityKey` for the comparison instead of recomputing.

### 5. `HelpButton` body strings are inline constants in each tab — no localisation hook
- **File**: `app/(tabs)/cellar.tsx` line 13-19 (CELLAR_HELP), and the equivalents in `app/(tabs)/scan.tsx`, `app/(tabs)/chef.tsx`, `app/(tabs)/community.tsx`
- **Severity**: Low
- **Description**: Each tab carries its help text as a module-level template-literal const. For a single-language MVP this is fine. For a future locale split (the privacy policy is GDPR-tuned, suggesting EU users are expected) the help bodies will need a translation table.
- **Fix**: Move all help text to `src/copy/help.ts` (one place to update wording too) and pass IDs into `HelpButton`. Cosmetic now, painful later.

---

## What Landed Well

- **Age gate's neutral DOB pattern** — three numeric inputs with auto-advance focus, day/month/year separated, no leading question about whether the user is "over 18." This is the right pattern; the issues are around persistence (Bug #4), not design.
- **Personality popup acknowledgement design** (`app/profile/personality.tsx:71-77`) — using the `lastGeneratedAt` timestamp as the ack key (so a future regeneration auto-invalidates the ack) is genuinely clever and avoids the alternative of "incrementing a counter," which would be brittle.
- **Bottle-size OCR clamping** (`supabase/functions/scan-label/index.ts:47-52`) — stringy coercion + 50-30000 ml clamp + `Number.isFinite` check is exactly the right defensive shape for a Claude-parsed integer field that can occasionally arrive as `"750"` or `0`.
- **Duplicate-review prompt's "Add to" mode appends a dated tasting** (`src/utils/reviewDedup.ts:34-46`) — preserving the original review and stacking dated entries is the right model; "Update" would have lost the history. Good restraint to keep the original `chosen_at`, location, and price untouched on append.
- **Compact wish-list card → dedicated note edit screen** (`app/cellar/wishlist-note/[id].tsx`) — moving the multi-field editor onto its own route instead of inline state on the card cleans up a previously-bloated list and gives keyboard handling proper room. Best-effort sync to the matching `chosen_wines` review (lines 49-67) is the right pattern.

---

## Summary of Findings

| Severity | Count |
| --- | --- |
| High | 5 |
| Medium | 5 |
| Low | 21 |
| **Total** | **31** |

### Top 3 Most Impactful

1. **Migration 041 was never committed** (Bugs #1) — the large-format-row feature is wired up app-side but the schema is missing. Any user who opts in will hit a Supabase error. Ship the migration before the next TestFlight build.
2. **Age gate doesn't persist rejection** (Bugs #4 / Privacy #1) — Apple/Google reviewers will hit this on submission. Under-18 user types a date, hits the rejection screen, kills the app, re-launches, types an adult date, walks in. Block on AsyncStorage.
3. **Domain harmonisation reverted by the next commit** (Bug #2) — `2f710d6` flipped the three email-template footers back from `vinster.app` to `vinsterapp.com`, and the live Supabase dashboard was changed manually so it now disagrees with the repo. Plus the privacy policy and `about.tsx` use `tellme@vinterapp.com` (a typo'd domain). Pick one canonical domain, fix all three surfaces (in-app, repo email templates, live Supabase template).
