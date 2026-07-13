-- Case storage for home storage locations.
--
-- A "case" groups bottles physically boxed together inside a storage location:
--   * kind='single' — many bottles of ONE wine (an OWC of 12, a "Meyney Case").
--     Modelled as a single cellar_wines row with quantity = N and case_id set.
--   * kind='mixed'  — DIFFERENT wines boxed together ("Mixed Burgundy", "New
--     World Whites"). Several cellar_wines rows share one case via case_id.
--
-- Wines keep their storage_location_id, so the existing location list is
-- unaffected; case_id just adds grouping on top. Dropping a case dissolves it
-- (its wines fall back to loose bottles in the same location).

create table if not exists public.storage_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_location_id uuid references public.storage_locations(id) on delete cascade,
  name text not null,
  kind text not null default 'single' check (kind in ('single', 'mixed')),
  note text,
  created_at timestamptz not null default now()
);

alter table public.cellar_wines
  add column if not exists case_id uuid references public.storage_cases(id) on delete set null;

create index if not exists storage_cases_location_idx on public.storage_cases (storage_location_id);
create index if not exists cellar_wines_case_idx on public.cellar_wines (case_id);

alter table public.storage_cases enable row level security;

drop policy if exists "own storage cases" on public.storage_cases;
create policy "own storage cases" on public.storage_cases
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
