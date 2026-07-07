-- Home storage "locations" (migration 064) — the user's own non-grid storage
-- spaces (the shed, under the bed…). Distinct from racks (a grid) AND from the
-- Cellar List "Locations" filter (custom_filters). Each carries a portrait
-- photo of the space (stored in the wine-labels bucket, under
-- <user>/locations/<id>.jpg) and holds a loose list of wines via a new
-- cellar_wines.storage_location_id (a wine physically lives in one place).

create table if not exists public.storage_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Location',
  photo_path text,
  created_at timestamptz not null default now()
);

alter table public.storage_locations enable row level security;

drop policy if exists "own storage_locations" on public.storage_locations;
create policy "own storage_locations" on public.storage_locations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.cellar_wines
  add column if not exists storage_location_id uuid references public.storage_locations(id) on delete set null;

create index if not exists cellar_wines_storage_location_id_idx
  on public.cellar_wines(storage_location_id);
