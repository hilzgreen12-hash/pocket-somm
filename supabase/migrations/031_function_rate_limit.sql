-- Per-user rate limiting for expensive edge functions (ocr, recommend).
-- Stops a hostile actor with a valid session token from draining Claude
-- credits via repeated calls. Edge functions call the RPC after auth check;
-- if it returns false the function returns 429.

create table if not exists function_call_log (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  function_name text not null,
  called_at timestamptz not null default now()
);

create index if not exists function_call_log_lookup_idx
  on function_call_log (user_id, function_name, called_at desc);

alter table function_call_log enable row level security;

-- Users can read their own log if they want; writes only via the RPC below
-- (which runs as security definer, so the row-level policies are bypassed).
create policy "Users can read own function log" on function_call_log
  for select using (auth.uid() = user_id);

-- Check the per-hour and per-day call counts for (user_id, function_name).
-- If either limit is exceeded, return false WITHOUT recording the call.
-- Otherwise record the call and return true.
--
-- Runs as security definer so it can insert into function_call_log even
-- when called by an authenticated user (whose own RLS policy on the table
-- is select-only).
create or replace function check_and_log_function_call(
  p_user_id uuid,
  p_function_name text,
  p_hourly_limit int default 30,
  p_daily_limit int default 100
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hourly_count int;
  daily_count int;
begin
  select count(*) into hourly_count
    from function_call_log
    where user_id = p_user_id
      and function_name = p_function_name
      and called_at > now() - interval '1 hour';
  if hourly_count >= p_hourly_limit then
    return false;
  end if;

  select count(*) into daily_count
    from function_call_log
    where user_id = p_user_id
      and function_name = p_function_name
      and called_at > now() - interval '1 day';
  if daily_count >= p_daily_limit then
    return false;
  end if;

  insert into function_call_log (user_id, function_name)
  values (p_user_id, p_function_name);

  return true;
end;
$$;

grant execute on function check_and_log_function_call(uuid, text, int, int)
  to authenticated, service_role;

-- Housekeeping: drop entries older than 8 days. Not auto-scheduled — call
-- manually or wire to pg_cron if the table grows uncomfortably. At 100
-- calls/user/day this stays small for thousands of users for a long time.
create or replace function cleanup_function_call_log() returns void
language plpgsql
as $$
begin
  delete from function_call_log where called_at < now() - interval '8 days';
end;
$$;
