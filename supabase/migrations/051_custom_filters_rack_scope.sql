-- Scope custom filters to a single rack (migration 051). Migration 050 made a
-- filter global to the user (it showed on every rack); users expect a filter
-- created on one rack to apply only to that rack. Add a nullable rack_id
-- (null = legacy global filter, left working for existing rows). The updated
-- app sets rack_id on create and fetches filters per-rack. Cascade-delete so
-- removing a rack also removes its filters.
alter table public.custom_filters
  add column if not exists rack_id uuid references public.wine_racks(id) on delete cascade;

create index if not exists custom_filters_rack_id_idx on public.custom_filters(rack_id);
