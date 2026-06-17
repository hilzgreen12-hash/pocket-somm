-- Bespoke user-created filters for the Label Library and Lineup Library,
-- mirroring the rack custom_filters but generic: scope distinguishes which
-- library, and item_id is a free-text id (cellar_wine_id for 'label',
-- lineup_archive_id for 'lineup').
create table if not exists public.library_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('label', 'lineup')),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.library_filter_items (
  filter_id uuid not null references public.library_filters(id) on delete cascade,
  item_id text not null,
  primary key (filter_id, item_id)
);

create index if not exists library_filters_user_scope_idx on public.library_filters(user_id, scope, created_at);

alter table public.library_filters enable row level security;
alter table public.library_filter_items enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'library_filters' and policyname = 'library_filters_own') then
    create policy library_filters_own on public.library_filters for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  -- Items are reachable only through a filter the user owns.
  if not exists (select 1 from pg_policies where tablename = 'library_filter_items' and policyname = 'library_filter_items_own') then
    create policy library_filter_items_own on public.library_filter_items for all
      using (exists (select 1 from public.library_filters f where f.id = filter_id and f.user_id = auth.uid()))
      with check (exists (select 1 from public.library_filters f where f.id = filter_id and f.user_id = auth.uid()));
  end if;
end $$;
