-- The user's own drinking-window opinion on a wine (migration 048).
-- Distinct from Vinster's generated drinking_window estimate — this is the
-- user's free-text call ("drink now", "hold to 2030", "past its best"),
-- captured in the unified review input. Added to both review-bearing tables
-- so chosen-wine and cellar-wine reviews share the same field.
alter table public.chosen_wines
  add column if not exists user_drinking_window text;

alter table public.cellar_wines
  add column if not exists user_drinking_window text;
