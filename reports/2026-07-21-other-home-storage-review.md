# Focused Code Review — Other Home Storage (Storage Locations & Cases)

**Date:** 2026-07-21 · **Branch:** `main` · **Scope:** the "Other Home Storage" feature — bespoke storage *locations* (not racks/fridges) and their *cases*.

This replaces tonight's general nightly review, at the developer's request, as the input to tomorrow's session focused on fixing this feature. Every finding below was verified by reading the cited file and line on `main`.

**Files reviewed:** `src/api/storageLocations.ts`, `app/cellar/storage-location/[id].tsx`, `app/cellar/storage-location/new.tsx`, `supabase/migrations/064_storage_locations.sql`, `supabase/migrations/069_storage_cases.sql`, and the storage-relevant paths in `app/cellar/racks.tsx`, `app/cellar/list.tsx`, `app/cellar/[wineId].tsx`, `app/label/results.tsx`, `src/api/racks.ts`, `src/api/labelPhotos.ts`.

---

## Suggested fix order for tomorrow

1. **S1** — location delete leaves stale caches (most user-visible).
2. **D1 + D2** — empty cases become invisible *and* undeletable; the "cases" sub-feature quietly rots the DB.
3. **S2** — wishlist wines counted/listed as physically stored (count correctness; diverges from racks).
4. **D3 / D4** — dangling `case_id` after remove; orphaned location on a partial create.

---

## Bugs & Crashes

**B1 — `deleteStorageLocation` drops the pre-delete select error** · Low
`src/api/storageLocations.ts:66`
Destructures only `{ data }` from the `photo_path` lookup, dropping `error`. Best-effort cleanup so no crash, but a failed read means the photo object may not be cleaned up. No user-facing failure.

*No unhandled promise rejections or missing-guard crashes were found in the core screens — `id` is guarded (`enabled: !!id`, early returns at `[id].tsx:308–318`), array accesses are length-checked, and `runBulk` (`[id].tsx:164–181`) tolerates mid-batch failures.*

## Data & RLS Integrity

**D1 — Empty cases become permanently invisible and undeletable** · Medium
`app/cellar/storage-location/[id].tsx:276–278`
`caseGroups` is built with `.filter((g) => g.wines.length > 0)`, so a case with zero wines is never rendered — and the only route to its Dissolve/Edit menu (`openCaseMenu`) is the case header, which only exists for rendered cases.
*Failure:* bulk-select every wine in a case and Delete (`:203`) or Remove-from-location (`:215`); the `storage_cases` row survives (wines just lose `case_id`/`storage_location_id`), the case disappears from the UI, and there is no path left to delete it — it lingers in the DB forever.

**D2 — Swallowed case-creation failure leaves an orphaned empty case** · Medium
`app/label/results.tsx:481–490`
`createStorageCase` then `assignWineToCase`, both inside `try { … } catch { /* swallowed */ }`. If the assign fails after the create succeeds, a zero-member case row is committed — which, per D1, is then invisible and undeletable.
*Failure:* a transient network drop between the two awaits on a "single / mixed case" add → a permanent orphan `storage_cases` row.

**D3 — Remove/archive/delete never clears a wine's `case_id`; dangling pointer** · Medium
`app/cellar/storage-location/[id].tsx:191` (archive), `:203` (delete), `:215` (remove-from-location)
These call `assignWineToStorageLocation(wid, null)` / archive / delete but never null `case_id`. "Remove from location" clears `storage_location_id` while leaving `case_id` pointing at a case still living in the former location.
*Failure:* remove a boxed wine from its location, then file it into a different location from the wine card — it carries the stale `case_id` from location A and only renders "loose" because location B happens to have no matching case. Correct by accident.

**D4 — Partial failure on create leaves an orphaned, photo-less location + misleading error** · Medium
`app/cellar/storage-location/new.tsx:52–61`
`createStorageLocation` runs first, then `uploadLocationPhoto`, then `setStorageLocationPhoto`. If a later step throws, the catch shows "Could not create location" and stops — but the row is already committed with `photo_path = null`, and nothing is rolled back or invalidated.
*Failure:* upload fails on flaky cellular → user sees "Could not create location", taps Create again → two same-named locations, one photo-less.

**D5 — Orphaned Storage object when photo-path persist fails** · Low
`src/api/labelPhotos.ts:70–80` + `new.tsx:55`
The file is uploaded, then the path persisted separately. If `setStorageLocationPhoto` fails, `${userId}/locations/${id}.jpg` is orphaned in the bucket, and `deleteStorageLocation` (`storageLocations.ts:66–72`) can't clean it because it keys cleanup off the (null) `photo_path`.

**✅ Clean:** cascade/FK design is sound — `storage_cases.storage_location_id … on delete cascade` (064), and `cellar_wines.storage_location_id / case_id … on delete set null` (064/069) — so deleting a *location* correctly dissolves its cases and frees its wines with no DB-level orphans. RLS is enabled with correct per-user `for all using/with check (auth.uid() = user_id)` on both tables.

## State & Consistency

**S1 — Deleting a location invalidates no cache** · Medium (High-ish visible symptom)
`app/cellar/storage-location/[id].tsx:136`
`await deleteStorageLocation(location.id); router.back();` with no `qc.invalidateQueries` — every other mutation in this feature invalidates, but this one doesn't.
*Failure:* delete a location → back on Home Storage (`racks.tsx`), whose `['storage-locations', userId]` query is still cached → the deleted card and its bottle count still show; tapping it lands on "This location no longer exists." The stale `['cellar']` cache also keeps listing those wines under the old `sloc:` filter until an unrelated refetch.

**S2 — Wishlist wines counted and listed as physically stored** · Medium
`src/api/storageLocations.ts:20–22` (`wineCount`) and `:76–85` (`fetchStorageLocationWines`)
Both filter only on `archived_at`, never excluding `is_wishlist` — whereas the rack path deliberately does (`src/api/racks.ts:143`, `.eq('wine.is_wishlist', false)`).
*Failure:* file a wishlist wine into a location from the wine card (`[wineId].tsx:451`) → it appears in the location's bottle list and inflates both the card count and the Home Storage "X Bottles" tally (`racks.tsx:93`), inconsistent with racks.

**S3 — Merge-add double-counts bottles across rack and location** · Low/Medium
`app/label/results.tsx:471–474`
An `add-location` merge sets `storage_location_id` and bumps `quantity` but never clears the wine's existing `rack_slots`.
*Failure:* a wine already placed in a rack is re-scanned into a location (matched → merge) → its `quantity` grows and it also carries `storage_location_id`; the Home Storage tally counts it once via `getRackBottleCounts` (slots) and again via the location's summed `quantity`.

## UX & Navigation

**U1 — `renameStorageLocation` exists but is unreachable** · Low
`src/api/storageLocations.ts:59–62` is exported with zero callers (grep-confirmed). The detail header long-press (`[id].tsx:126–143`) offers only Delete / Cancel — a location's name can never be changed after creation.

**U2 — An active search hides a case's "+ Add" affordance** · Low
`app/cellar/storage-location/[id].tsx:276–279`
Case groups are filtered by the *searched* wine list, so a search that excludes a case's wines removes the whole case block (including its "+ Add") — you can't add to a case while a non-matching search is active.

**✅ Clean:** destructive actions (delete location, dissolve case, bulk delete/archive/remove) all prompt for confirmation correctly.

---

*Focused review — 2026-07-21. Every finding verified against current `main`. The general nightly review was paused for tonight in favour of this.*
