-- Profiles: stores user taste preferences
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  style_preferences text[] default '{}',
  default_budget integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = user_id);

-- Scan sessions: stores each wine list scan and its recommendation
create table scan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  captured_at timestamptz default now(),
  restaurant_name text,
  image_path text,
  extracted_wines jsonb default '[]',
  recommendation jsonb,
  preferences_snapshot jsonb
);

alter table scan_sessions enable row level security;
create policy "Users manage own scans"
  on scan_sessions for all
  using (auth.uid() = user_id);

-- Pricing cache: reduces Wine-Searcher API calls
create table pricing_cache (
  wine_key text primary key,        -- "{wineName}_{vintage}"
  market_price_avg numeric,
  market_price_min numeric,
  market_price_max numeric,
  critic_score integer,
  currency text default 'GBP',
  fetched_at timestamptz default now()
);

-- TTL: cache entries older than 7 days are considered stale
-- (handled in application logic in the Edge Function)
