-- 106_placements_location_native.sql
-- Phase 3 (write cutover), alt cellars become placements-native.
-- The sync trigger from 104 rebuilt ALL of a wine's placements from the legacy
-- model on any change — which would wipe a directly-written 'location' placement
-- (that was the alt-cellar data-loss cascade). From now on the mirror manages
-- ONLY 'rack' and 'bin' placements; 'location' placements are owned by the app.
--
-- Racks/fridges/bins still use the legacy tables (rack_slots / bin_cell_id) and
-- keep being mirrored; alt-cellar placement lives in cellar_placements directly.

create or replace function public.sync_wine_placements(p_wine_id uuid)
returns void language plpgsql as $$
begin
  if p_wine_id is null then return; end if;

  -- Only rack + bin are mirrored from the legacy model. Location placements are
  -- app-managed and must survive (never delete them here).
  delete from public.cellar_placements
   where cellar_wine_id = p_wine_id and kind in ('rack', 'bin');

  insert into public.cellar_placements (cellar_wine_id, kind, quantity, rack_id, row_index, col_index)
  select rs.cellar_wine_id, 'rack', 1, rs.rack_id, rs.row_index, rs.col_index
  from public.rack_slots rs
  where rs.cellar_wine_id = p_wine_id;

  insert into public.cellar_placements (cellar_wine_id, kind, quantity, bin_cell_id)
  select w.id, 'bin', greatest(1, coalesce(w.quantity, 1)), w.bin_cell_id
  from public.cellar_wines w
  where w.id = p_wine_id and w.bin_cell_id is not null;
end $$;
