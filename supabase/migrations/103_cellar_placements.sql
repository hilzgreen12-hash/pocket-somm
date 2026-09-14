-- 103_cellar_placements.sql
-- Unified home-storage placements: one table describing WHERE a wine's bottles
-- live, across ANY mix of racks / fridges / bins / alt cellars. Replaces the
-- asymmetric mechanisms (rack_slots for racks, cellar_wines.bin_cell_id for bins,
-- cellar_wines.storage_location_id for alt cellars) with one model so a single
-- wine (one Full Cellar List line) can be split across storage types.
--
-- SAFE TO APPLY EARLY: this migration is ADDITIVE + BACKFILL only. No app code
-- reads cellar_placements yet, and the old columns/tables are left untouched, so
-- applying it changes nothing user-facing until the read/write phases land.

-- 1) The table -------------------------------------------------------------
create table if not exists public.cellar_placements (
  id                  uuid primary key default gen_random_uuid(),
  cellar_wine_id      uuid not null references public.cellar_wines(id) on delete cascade,
  kind                text not null check (kind in ('rack', 'bin', 'location')),
  quantity            integer not null default 1 check (quantity > 0),
  -- rack placement (positional; quantity is always 1)
  rack_id             uuid references public.wine_racks(id) on delete cascade,
  row_index           integer,
  col_index           integer,
  -- bin placement (count-based, in a diamond/triangle cell)
  bin_cell_id         uuid references public.bin_cells(id) on delete cascade,
  -- location placement (loose in an alt cellar, optionally boxed in a case)
  storage_location_id uuid references public.storage_locations(id) on delete cascade,
  case_id             uuid references public.storage_cases(id) on delete set null,
  created_at          timestamptz not null default now(),
  -- one physical rack slot can hold only one bottle (NULLs are distinct, so this
  -- constrains rack rows only — bin/location rows all have null rack coords).
  constraint cellar_placements_rack_slot_unique unique (rack_id, row_index, col_index),
  -- shape guard: each row must be a well-formed placement of its kind.
  constraint cellar_placements_kind_shape check (
    (kind = 'rack'     and rack_id is not null and row_index is not null and col_index is not null
                        and bin_cell_id is null and storage_location_id is null and quantity = 1)
    or (kind = 'bin'   and bin_cell_id is not null
                        and rack_id is null and row_index is null and col_index is null and storage_location_id is null)
    or (kind = 'location' and storage_location_id is not null
                        and rack_id is null and row_index is null and col_index is null and bin_cell_id is null)
  )
);

create index if not exists cellar_placements_wine_idx     on public.cellar_placements (cellar_wine_id);
create index if not exists cellar_placements_rack_idx     on public.cellar_placements (rack_id);
create index if not exists cellar_placements_bincell_idx  on public.cellar_placements (bin_cell_id);
create index if not exists cellar_placements_location_idx on public.cellar_placements (storage_location_id);
create index if not exists cellar_placements_case_idx     on public.cellar_placements (case_id);

-- 2) RLS: a placement belongs to whoever owns its cellar wine ---------------
alter table public.cellar_placements enable row level security;
drop policy if exists "own cellar placements" on public.cellar_placements;
create policy "own cellar placements" on public.cellar_placements
  for all
  using (
    exists (select 1 from public.cellar_wines w
            where w.id = cellar_placements.cellar_wine_id and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.cellar_wines w
            where w.id = cellar_placements.cellar_wine_id and w.user_id = auth.uid())
  );

-- 3) Backfill from the three existing mechanisms ---------------------------
--    Guarded so re-running is a no-op (only backfills when the table is empty).
do $$
begin
  if not exists (select 1 from public.cellar_placements) then

    -- Racks/fridges: one placement per occupied slot (quantity 1).
    insert into public.cellar_placements (cellar_wine_id, kind, quantity, rack_id, row_index, col_index)
    select rs.cellar_wine_id, 'rack', 1, rs.rack_id, rs.row_index, rs.col_index
    from public.rack_slots rs
    where rs.cellar_wine_id is not null;

    -- Bins: the wine's bottles sit in one cell (count-based). quantity = wine total.
    insert into public.cellar_placements (cellar_wine_id, kind, quantity, bin_cell_id)
    select w.id, 'bin', greatest(1, coalesce(w.quantity, 1)), w.bin_cell_id
    from public.cellar_wines w
    where w.bin_cell_id is not null;

    -- Alt cellars: the wine's bottles are loose (or cased) in one location.
    insert into public.cellar_placements (cellar_wine_id, kind, quantity, storage_location_id, case_id)
    select w.id, 'location', greatest(1, coalesce(w.quantity, 1)), w.storage_location_id, w.case_id
    from public.cellar_wines w
    where w.storage_location_id is not null;

  end if;
end $$;

-- NOTE: the old columns (cellar_wines.storage_location_id / bin_cell_id / case_id)
-- and the rack_slots table are intentionally left in place. They are dropped in a
-- later cleanup migration once the app reads/writes placements exclusively.
