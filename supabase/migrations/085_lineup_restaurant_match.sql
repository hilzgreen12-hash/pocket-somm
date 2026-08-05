-- 085 — Match a saved lineup to a restaurant review
-- A lineup photographed at a restaurant is often the same night as a restaurant
-- review in Your Restaurants (a scan_sessions row). Storing that link lets the
-- Lineup Library show "Matched to <restaurant>" and keeps the wine reviews on
-- both surfaces associated. Nullable; on_delete handled in-app (a removed
-- restaurant review simply stops resolving to a name).

alter table public.lineup_archives
  add column if not exists restaurant_session_id uuid;

-- Reload PostgREST's schema cache so the new column is queryable immediately.
notify pgrst, 'reload schema';
