-- Restaurant review redesign (migration 046). The "Add a Review" page for
-- a restaurant visit gains a Value star rating (alongside Food, Wine List,
-- Service and the existing Overall) plus a favourite flag, mirroring the
-- favourite star on the wine review page. Both default to null/false so
-- existing scan_sessions rows are unaffected.
alter table public.scan_sessions
  add column if not exists rating_value integer,
  add column if not exists is_favourite boolean not null default false;
