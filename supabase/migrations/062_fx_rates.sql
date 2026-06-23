-- USD-base foreign-exchange rates, used to convert Wine-Searcher prices (which
-- the account always returns in USD) into the user's selected currency.
--
-- Refreshed at most once a day by the `wine-searcher-proxy` edge function from
-- the free ECB feed (frankfurter.app). `rate` is "1 USD = <rate> <currency>".
-- USD itself is stored as 1.0. Service-role only — clients never touch it.
create table if not exists public.fx_rates (
  currency text primary key,
  rate numeric not null,
  fetched_at timestamptz not null default now()
);

alter table public.fx_rates enable row level security;
-- No anon/authenticated policies on purpose: only the edge function, which runs
-- with the service-role key (and bypasses RLS), reads or writes this table.
