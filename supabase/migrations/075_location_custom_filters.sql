-- Scope custom filters to a home storage location too (migration 075). Racks
-- got per-rack filters in 051 via rack_id; Other Home Storage locations need
-- the same "+ Add" bespoke filter feature, so add a nullable
-- storage_location_id (null = a rack/global filter, left untouched). Cascade-
-- delete so removing a location also removes its filters.
alter table public.custom_filters
  add column if not exists storage_location_id uuid references public.storage_locations(id) on delete cascade;

create index if not exists custom_filters_storage_location_id_idx
  on public.custom_filters(storage_location_id);
