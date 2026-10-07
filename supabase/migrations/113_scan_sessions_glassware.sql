-- Restaurant reviews gain a Glassware star rating (migration 113). It takes the
-- grid slot previously held by the overall rating — the overall star rating now
-- lives under "Your Review" as the headline score, while Glassware joins Food,
-- Wine List, Service, Atmosphere and Value in the ratings grid. Nullable so
-- existing scan_sessions rows are unaffected.
alter table public.scan_sessions
  add column if not exists rating_glassware integer;
