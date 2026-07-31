-- Phase 2 — cellar reviews become append-only, 24h-locked dated entries.
--
-- A cellar bottle keeps a growing BODY of review entries (the original plus any
-- "Add a new review" entries), stored in review_entries. The existing flat
-- review_* fields are KEPT and continue to mirror the LATEST entry, so every
-- surface that reads them today — Your Wine Reviews derivation, the card's
-- quick-stats, community posts, the identity-mirror sync — keeps working
-- unchanged. This is purely additive; nothing is removed.
--
-- Each entry is a JSON object:
--   { id, savedAt, date, location, score, note, personalNotes, drinkingWindow }
-- `savedAt` is the immutable per-entry 24h edit clock (client-set at save time);
-- backfilled entries use the review's own date so historical reviews lock
-- immediately.
alter table public.cellar_wines
  add column if not exists review_entries jsonb not null default '[]'::jsonb;

update public.cellar_wines
set review_entries = jsonb_build_array(jsonb_build_object(
  'id', gen_random_uuid(),
  'savedAt', to_char(coalesce(review_date::timestamptz, updated_at, created_at, now()) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  'date', coalesce(to_char(review_date, 'YYYY-MM-DD'), to_char(coalesce(updated_at, created_at), 'YYYY-MM-DD')),
  'location', coalesce(review_location, ''),
  'score', review_score,
  'note', coalesce(review_note, ''),
  'personalNotes', coalesce(user_notes, ''),
  'drinkingWindow', coalesce(user_drinking_window, '')
))
where jsonb_array_length(review_entries) = 0
  and (
    (review_note is not null and review_note <> '')
    or review_score is not null
    or (review_location is not null and review_location <> '')
    or review_date is not null
    or (user_notes is not null and user_notes <> '')
  );
