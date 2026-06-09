-- Custom filters (migration 050) — user-defined named collections of cellar
-- wines, e.g. "Christmas Wines", "Monday Wines". Selecting one on the rack
-- page highlights its bottles. A filter is global to the user (can span
-- racks); the join table records which cellar wines belong to it.

create table if not exists public.custom_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.custom_filters enable row level security;

drop policy if exists "own custom_filters" on public.custom_filters;
create policy "own custom_filters" on public.custom_filters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.custom_filter_wines (
  filter_id uuid not null references public.custom_filters(id) on delete cascade,
  cellar_wine_id uuid not null references public.cellar_wines(id) on delete cascade,
  primary key (filter_id, cellar_wine_id)
);

alter table public.custom_filter_wines enable row level security;

drop policy if exists "own custom_filter_wines" on public.custom_filter_wines;
create policy "own custom_filter_wines" on public.custom_filter_wines
  for all using (
    exists (select 1 from public.custom_filters f where f.id = filter_id and f.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.custom_filters f where f.id = filter_id and f.user_id = auth.uid())
  );
