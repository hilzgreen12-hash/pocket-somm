-- Taps on "Where to Buy" links (Wine-Searcher today; merchants later), so
-- Vinster can see which wines people want to buy and show partners the demand.
-- The app only ever adds rows; reading them is for the owner, in the database.
create table if not exists merchant_link_taps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination text not null,     -- 'wine-searcher'
  source text not null,          -- where in the app: 'wine-card'
  cellar_wine_id uuid references cellar_wines (id) on delete set null,
  producer text,
  wine_name text,
  vintage text,
  archived boolean not null default false,  -- tapped from an archived (drunk) wine: a re-buy
  country_code text,
  created_at timestamptz not null default now()
);

create index if not exists merchant_link_taps_created_at_idx on merchant_link_taps (created_at);

alter table merchant_link_taps enable row level security;

drop policy if exists "Users add their own taps" on merchant_link_taps;
create policy "Users add their own taps" on merchant_link_taps
  for insert to authenticated
  with check (auth.uid() = user_id);
