-- Append-only, time-locked reviews (Phase 1 — occasion reviews).
--
-- Rows that share a review_group_id form ONE review: a single card whose
-- multiple dated entries are the original review plus any later "Add to this
-- review" entries. A NULL review_group_id means a standalone, single-entry
-- review — so every existing chosen_wines row stays valid, each its own review,
-- with no backfill needed.
--
-- The 24-hour edit window is driven per-entry by the existing reviewed_at column
-- (migration 047), which is server-stamped and immutable — no new timestamp is
-- required here. This migration only adds the grouping key.
-- Default gen_random_uuid() so every row — existing (backfilled per-row on add)
-- and new — automatically starts its own group. "Add to this review" simply
-- inserts a new row carrying the target review's existing review_group_id.
alter table public.chosen_wines
  add column if not exists review_group_id uuid default gen_random_uuid();

create index if not exists chosen_wines_review_group_idx
  on public.chosen_wines (review_group_id);
