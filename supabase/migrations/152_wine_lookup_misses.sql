-- Wines nothing recognised. When a scanned, typed or spoken wine gets a card
-- that none of Vinster's checks recognised (catalogue, Wine-Searcher, Vinster's
-- own knowledge, the web check), the app records what it was given, so gaps
-- in recognition show up straight away instead of through a user. No photos —
-- just the wine details. The app only ever adds rows; reading them is for the
-- owner, in the database.

create table if not exists wine_lookup_misses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  producer text,
  wine_name text,
  vintage text,
  region text,
  -- Wine-Searcher couldn't be asked at all (outage or daily allowance used),
  -- as opposed to having no listing.
  wine_searcher_down boolean not null default false,
  app_version text,
  created_at timestamptz not null default now()
);

create index if not exists wine_lookup_misses_created_at_idx on wine_lookup_misses (created_at);

alter table wine_lookup_misses enable row level security;

drop policy if exists "Users add their own misses" on wine_lookup_misses;
create policy "Users add their own misses" on wine_lookup_misses
  for insert to authenticated
  with check (auth.uid() = user_id);
