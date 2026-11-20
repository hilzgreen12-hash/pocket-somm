-- 140: Vinster's Observations.
-- One row per user: what Vinster has inferred about their taste from their own
-- reviews, cellar and choices (observations), what they have told it directly
-- (told — always wins over an inference), inferences they removed (dismissed),
-- and a compact profile_summary that the recommend / pairing / cellar-pick
-- prompts read as soft guidance. Written only by the `observations` edge
-- function, using the caller's own login, so RLS is the access control.
-- Idempotent.

create table if not exists public.taste_observations (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  observations    jsonb not null default '[]'::jsonb,  -- [{id, group, text, evidence, hint}]
  told            jsonb not null default '[]'::jsonb,  -- [{id, text, created_at}]
  dismissed       jsonb not null default '[]'::jsonb,  -- [{id, text}]
  profile_summary text,
  data_signature  text,
  generated_at    timestamptz,
  updated_at      timestamptz not null default now()
);

alter table public.taste_observations enable row level security;

drop policy if exists "own taste observations: read" on public.taste_observations;
create policy "own taste observations: read" on public.taste_observations
  for select using (user_id = auth.uid());

drop policy if exists "own taste observations: create" on public.taste_observations;
create policy "own taste observations: create" on public.taste_observations
  for insert with check (user_id = auth.uid());

drop policy if exists "own taste observations: update" on public.taste_observations;
create policy "own taste observations: update" on public.taste_observations
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update on public.taste_observations to authenticated;
