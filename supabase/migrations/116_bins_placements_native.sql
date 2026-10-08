-- 116_bins_placements_native.sql
-- Bins become placements-native (app-owned), like alt-cellar locations in mig 106.
--
-- Until now bin membership lived on cellar_wines.bin_cell_id (ONE wine row = its
-- WHOLE quantity in ONE cell) and a mirror trigger copied that into a single
-- cellar_placements kind='bin' row. That made it impossible for one wine to sit
-- in a rack AND a bin at once (one row can hold only one bin_cell_id), so adding
-- bin bottles of a wine you already owned spawned a SECOND cellar_wines row — the
-- "4 + 5 = two listings" bug.
--
-- From now the mirror manages ONLY 'rack' placements (rebuilt from rack_slots).
-- 'bin' and 'location' placements are owned by the app, which writes/updates/
-- deletes them directly — so a single cellar_wines line can be distributed across
-- a rack, one or more bin cells, alt cellars, and loose stock.
--
-- Non-destructive: existing bin placements (mirror-created by migs 104/106/115,
-- one per wine = whole quantity in its cell) are LEFT IN PLACE and simply become
-- the app-owned rows. No bin data is deleted or rebuilt here.

create or replace function public.sync_wine_placements(p_wine_id uuid)
returns void language plpgsql as $$
begin
  if p_wine_id is null then return; end if;

  -- Only RACK is mirrored from the legacy model now. 'bin' and 'location'
  -- placements are app-managed and must survive (never delete them here).
  delete from public.cellar_placements
   where cellar_wine_id = p_wine_id and kind = 'rack';

  insert into public.cellar_placements (cellar_wine_id, kind, quantity, rack_id, row_index, col_index)
  select rs.cellar_wine_id, 'rack', 1, rs.rack_id, rs.row_index, rs.col_index
  from public.rack_slots rs
  where rs.cellar_wine_id = p_wine_id;
end $$;
