-- Wine bins — diamond-shaped bulk storage.
--
-- A bin is a piece of top-level furniture (shown in the "Racks, Fridges & Bins"
-- carousel alongside racks and fridges), so it reuses `wine_racks` with
-- storage_type = 'bin'. Unlike a rack (position-based, one bottle per slot) a
-- bin is COUNT-BASED: it is a grid of diamonds, each diamond holding several
-- bottles in bulk. Cells on the edge of the unit are triangles (half-diamonds)
-- that hold half a full diamond's capacity.
--
-- Model:
--   * wine_racks (storage_type='bin')  — the unit. New columns below carry the
--     diamond arrangement + per-diamond capacity. rows/cols are left NULL for
--     bins (they are the slot grid, which bins don't use).
--   * bin_cells                        — one row per diamond/triangle cell,
--     parallel to rack_slots but count-based (a cell has a capacity, not a
--     single occupant).
--   * cellar_wines.bin_cell_id         — count-based membership, mirroring
--     case_id: a wine in a bin is a cellar_wines row (quantity N, its own
--     bottle_size_ml) pointing at the cell it lives in. No rack_slots.

-- wine_racks.rows/cols are NOT NULL on racks; bins don't use them. Relax so a
-- bin row can omit them.
alter table public.wine_racks alter column rows drop not null;
alter table public.wine_racks alter column cols drop not null;

alter table public.wine_racks
  add column if not exists diamonds_across  integer,
  add column if not exists diamonds_down    integer,
  add column if not exists diamond_capacity integer; -- bottles per FULL diamond

create table if not exists public.bin_cells (
  id       uuid primary key default gen_random_uuid(),
  bin_id   uuid not null references public.wine_racks(id) on delete cascade,
  idx      integer not null,                         -- position in the grid, row-major
  kind     text not null check (kind in ('diamond', 'triangle')),
  capacity integer not null,                         -- diamond = full, triangle = half
  unique (bin_id, idx)
);

alter table public.cellar_wines
  add column if not exists bin_cell_id uuid references public.bin_cells(id) on delete set null;

create index if not exists bin_cells_bin_idx on public.bin_cells (bin_id);
create index if not exists cellar_wines_bin_cell_idx on public.cellar_wines (bin_cell_id);

alter table public.bin_cells enable row level security;

-- A cell is manageable when its parent bin belongs to the user (same shape as
-- the rack_slots policy).
drop policy if exists "own bin cells" on public.bin_cells;
create policy "own bin cells" on public.bin_cells
  for all
  using (
    exists (
      select 1 from public.wine_racks
      where wine_racks.id = bin_cells.bin_id
        and wine_racks.user_id = auth.uid()
    )
  );
