-- Restaurant reviews gain an Atmosphere star rating (migration 071), shown on
-- the review form below Service alongside Food, Wine List, Service, Value and
-- the overall rating. Nullable so existing scan_sessions rows are unaffected.
alter table public.scan_sessions
  add column if not exists rating_atmosphere integer;
