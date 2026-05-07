-- Chef sessions: persist Chef tab searches to Supabase so the user has a
-- cross-device archive instead of just local AsyncStorage. Two shapes:
--
-- chef_label_sessions: user scanned a wine label and got 3 chef-inspired
--   recipes (Pairing[]). Stores the confirmed wine + filters used + recipes.
--
-- chef_pairing_sessions: user typed a dish and got wine recommendations,
--   either from their cellar (CellarRecommendation[]) or general guidance
--   (GeneralRecommendation[] + summary). Mode discriminates the JSON shape.

create table if not exists chef_label_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_at timestamptz not null default now(),
  wine jsonb not null,                 -- WineDetailsComplete
  filters jsonb,                       -- DietaryFilters used for this run
  pairings jsonb not null              -- Pairing[]
);

create index if not exists chef_label_sessions_user_saved_idx
  on chef_label_sessions (user_id, saved_at desc);

alter table chef_label_sessions enable row level security;

drop policy if exists "Users manage own chef label sessions" on chef_label_sessions;
create policy "Users manage own chef label sessions"
  on chef_label_sessions for all
  using (auth.uid() = user_id);

create table if not exists chef_pairing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_at timestamptz not null default now(),
  dish text not null,
  mode text not null check (mode in ('cellar', 'general')),
  cellar_result jsonb,                 -- CellarRecommendation[] when mode='cellar'
  general_result jsonb,                -- GeneralRecommendation[] when mode='general'
  general_summary text                 -- summary string when mode='general'
);

create index if not exists chef_pairing_sessions_user_saved_idx
  on chef_pairing_sessions (user_id, saved_at desc);

alter table chef_pairing_sessions enable row level security;

drop policy if exists "Users manage own chef pairing sessions" on chef_pairing_sessions;
create policy "Users manage own chef pairing sessions"
  on chef_pairing_sessions for all
  using (auth.uid() = user_id);
