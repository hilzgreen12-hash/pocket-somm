-- 086 — Lineup venue
-- A free-text venue / place name for a lineup (the restaurant, bar, or home
-- where it happened) — distinct from `city` (the geographical location). Shown
-- as the third part of the Date · City · Venue stamp and beneath each library
-- tile. Nullable; the user fills it in.

alter table public.lineup_archives
  add column if not exists venue text;

-- Reload PostgREST's schema cache so the new column is queryable immediately.
notify pgrst, 'reload schema';
