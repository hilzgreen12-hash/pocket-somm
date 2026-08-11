-- 087 — Chosen-wine review dismissed
-- A restaurant "bottle pick" awaiting review is a chosen_wines row shown in TWO
-- places: the "Awaiting Review" list on Your Wine Reviews, and the wine's
-- restaurant card in Your Restaurants (both read the same rows). This flag lets
-- a user long-press-dismiss such a pick from the Your Wine Reviews awaiting list
-- WITHOUT deleting the row — so it stays on the restaurant card in Your
-- Restaurants. Defaults false; only the app's dismiss action sets it true.

alter table public.chosen_wines
  add column if not exists review_dismissed boolean not null default false;

-- Reload PostgREST's schema cache so the new column is queryable immediately.
notify pgrst, 'reload schema';
