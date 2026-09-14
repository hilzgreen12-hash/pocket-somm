-- 107_trim_location_placements.sql
-- Keep location (alt-cellar) placements consistent when a wine's total drops
-- (drinking / archiving / deleting some bottles). Location placements are
-- app-managed, so a reduction elsewhere must not leave them over-counting.
--
-- When quantity falls below what's placed, trim location placements (newest
-- first) so the location bottles never exceed (quantity - rack/bin bottles).
-- Automatic + safe; a future step can add a "remove from which location?" prompt.

create or replace function public.trim_location_placements(p_wine_id uuid)
returns void language plpgsql as $$
declare
  v_quantity int;
  v_nonloc   int;   -- bottles placed in racks + bins (mirror-managed)
  v_locsum   int;   -- bottles placed in alt cellars
  v_allowed  int;   -- max alt-cellar bottles this wine may hold
  v_over     int;
  r record;
begin
  if p_wine_id is null then return; end if;
  select coalesce(quantity, 0) into v_quantity from public.cellar_wines where id = p_wine_id;
  select coalesce(sum(quantity), 0) into v_nonloc from public.cellar_placements
    where cellar_wine_id = p_wine_id and kind in ('rack', 'bin');
  select coalesce(sum(quantity), 0) into v_locsum from public.cellar_placements
    where cellar_wine_id = p_wine_id and kind = 'location';

  v_allowed := greatest(0, v_quantity - v_nonloc);
  v_over := v_locsum - v_allowed;
  if v_over <= 0 then return; end if;

  for r in
    select id, quantity from public.cellar_placements
     where cellar_wine_id = p_wine_id and kind = 'location'
     order by created_at desc
  loop
    exit when v_over <= 0;
    if r.quantity <= v_over then
      delete from public.cellar_placements where id = r.id;
      v_over := v_over - r.quantity;
    else
      update public.cellar_placements set quantity = quantity - v_over where id = r.id;
      v_over := 0;
    end if;
  end loop;
end $$;

-- Run the trim right after the rack/bin resync on any cellar_wines change.
create or replace function public.trg_sync_placements_cellar_wines()
returns trigger language plpgsql as $$
begin
  perform public.sync_wine_placements(new.id);
  perform public.trim_location_placements(new.id);
  return new;
end $$;

-- One-time reconcile so any wine that's currently over-placed is trimmed now.
do $$ declare w record; begin
  for w in select id from public.cellar_wines loop
    perform public.trim_location_placements(w.id);
  end loop;
end $$;
