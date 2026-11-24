-- Where and on what people use Vinster, refreshed by the app when it opens.
-- country_code: the phone's region setting (e.g. 'BR'); time_zone backs it up,
-- since a phone set to US English can still be in Brazil. No GPS involved.
alter table profiles
  add column if not exists country_code text,
  add column if not exists time_zone text,
  add column if not exists app_version text,
  add column if not exists platform text,
  add column if not exists last_active_at timestamptz;

-- "Active users this month" and per-country counts.
create index if not exists profiles_last_active_at_idx on profiles (last_active_at);
