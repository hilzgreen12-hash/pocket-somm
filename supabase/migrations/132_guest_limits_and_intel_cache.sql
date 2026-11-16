-- 132_guest_limits_and_intel_cache.sql
--
-- 1. Usage limits for guests (no account). function_call_log (mig 031) limits
--    signed-in users only, so anyone calling with just the app's public key
--    could loop the paid functions. Guests are now counted per device address,
--    stored only as a one-way hash (never the address itself).
--
-- 2. Saved Wine Intel results. The same wine, vintage and currency used to be
--    regenerated from scratch on every scan or reopen: slow, paid each time, and
--    the insider note changed on every open. Results are kept 30 days.
--
-- Both tables are written only by edge functions (service role): RLS on, no policies.

-- 1. Guest usage limits ---------------------------------------------------------
create table if not exists public.guest_call_log (
  id            bigserial primary key,
  guest_key     text not null,          -- SHA-256 of the device address
  function_name text not null,
  called_at     timestamptz not null default now()
);

create index if not exists guest_call_log_lookup_idx
  on public.guest_call_log (guest_key, function_name, called_at desc);

alter table public.guest_call_log enable row level security;

-- Same rule as check_and_log_function_call: over either limit → false, and the
-- call isn't recorded; otherwise it's recorded → true.
create or replace function public.check_and_log_guest_call(
  p_guest_key text,
  p_function_name text,
  p_hourly_limit int,
  p_daily_limit int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from guest_call_log
      where guest_key = p_guest_key and function_name = p_function_name
        and called_at > now() - interval '1 hour') >= p_hourly_limit then
    return false;
  end if;
  if (select count(*) from guest_call_log
      where guest_key = p_guest_key and function_name = p_function_name
        and called_at > now() - interval '1 day') >= p_daily_limit then
    return false;
  end if;
  insert into guest_call_log (guest_key, function_name) values (p_guest_key, p_function_name);
  -- Housekeeping: entries older than 2 days are never counted again.
  delete from guest_call_log where called_at < now() - interval '2 days' and random() < 0.01;
  return true;
end;
$$;

revoke execute on function public.check_and_log_guest_call(text, text, int, int) from public, anon, authenticated;
grant execute on function public.check_and_log_guest_call(text, text, int, int) to service_role;

-- 2. Saved Wine Intel results -----------------------------------------------------
-- cache_key: catalogue key | vintage | currency | style | grape | score anchor.
create table if not exists public.wine_intel_cache (
  cache_key  text primary key,
  result     jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.wine_intel_cache enable row level security;
