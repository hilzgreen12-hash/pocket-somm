-- Personality archive: every time a sketch is generated we keep the full
-- text and a timestamp so the user can scroll back through how their
-- gastronomic personality has evolved over time. The current sketch on
-- profiles.last_*_personality stays as the cached "now" version for fast
-- reads on the personality screen.

create table if not exists personality_sketches (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  category     text not null check (category in ('wine', 'recipe')),
  text         text not null,
  created_at   timestamptz not null default now()
);

create index if not exists personality_sketches_user_cat_idx
  on personality_sketches (user_id, category, created_at desc);

alter table personality_sketches enable row level security;

drop policy if exists "Users manage own personality sketches" on personality_sketches;
create policy "Users manage own personality sketches"
  on personality_sketches for all
  using (auth.uid() = user_id);
