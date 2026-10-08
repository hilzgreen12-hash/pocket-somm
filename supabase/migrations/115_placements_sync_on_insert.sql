-- 115_placements_sync_on_insert.sql
-- Bug: a wine added straight into a wine-bin diamond is created as a NEW
-- cellar_wines row with bin_cell_id set (an INSERT). The mig-104/106 mirror
-- trigger only fired on UPDATE of bin_cell_id/quantity, so no 'bin' placement
-- row was ever written for a fresh bin add. The wine card then saw zero
-- placements and treated all the bottles as loose — showing "Add to Location"
-- and omitting the bin from "Bottles in my Cellar".
--
-- Fix: fire the cellar_wines mirror on INSERT as well as UPDATE. sync_wine_placements
-- (as redefined in mig 106) only rebuilds 'rack' + 'bin' placements and never
-- touches app-owned 'location' placements, so an INSERT that sets
-- storage_location_id can't double-write a location placement — it's a no-op for
-- anything but bin_cell_id. Fresh rack adds (no slots yet) stay a no-op until
-- their rack_slots rows land and the rack trigger fires.

drop trigger if exists trg_placements_cellar_wines on public.cellar_wines;
create trigger trg_placements_cellar_wines
  after insert or update of storage_location_id, bin_cell_id, case_id, quantity on public.cellar_wines
  for each row execute function public.trg_sync_placements_cellar_wines();

-- One-time backfill: rebuild bin placements for any wine already sitting in a
-- bin that has no matching 'bin' placement row (added before this fix).
do $$
declare w record;
begin
  for w in
    select id from public.cellar_wines
    where bin_cell_id is not null
      and id not in (select cellar_wine_id from public.cellar_placements where kind = 'bin')
  loop
    perform public.sync_wine_placements(w.id);
  end loop;
end $$;
