-- 104_placements_sync_triggers.sql
-- Phase 2 (read path): keep cellar_placements a LIVE MIRROR of the legacy model
-- (rack_slots + cellar_wines.storage_location_id / bin_cell_id / case_id / quantity)
-- so the app can READ from placements while WRITES still go through the old fields.
-- These triggers are dropped in Phase 3, when the app writes placements directly.
--
-- Safe to apply: it only rebuilds a wine's placement rows to match its current
-- legacy placement. It never touches racks, bins, locations or the wine itself.

-- Rebuild ONE wine's placements from the legacy sources.
create or replace function public.sync_wine_placements(p_wine_id uuid)
returns void language plpgsql as $$
begin
  if p_wine_id is null then return; end if;

  delete from public.cellar_placements where cellar_wine_id = p_wine_id;

  -- Racks/fridges: one placement per occupied slot (quantity 1).
  insert into public.cellar_placements (cellar_wine_id, kind, quantity, rack_id, row_index, col_index)
  select rs.cellar_wine_id, 'rack', 1, rs.rack_id, rs.row_index, rs.col_index
  from public.rack_slots rs
  where rs.cellar_wine_id = p_wine_id;

  -- Bin: count-based membership in one cell (quantity = the wine's total).
  insert into public.cellar_placements (cellar_wine_id, kind, quantity, bin_cell_id)
  select w.id, 'bin', greatest(1, coalesce(w.quantity, 1)), w.bin_cell_id
  from public.cellar_wines w
  where w.id = p_wine_id and w.bin_cell_id is not null;

  -- Alt cellar: loose (or cased) in one location (quantity = the wine's total).
  insert into public.cellar_placements (cellar_wine_id, kind, quantity, storage_location_id, case_id)
  select w.id, 'location', greatest(1, coalesce(w.quantity, 1)), w.storage_location_id, w.case_id
  from public.cellar_wines w
  where w.id = p_wine_id and w.storage_location_id is not null;
end $$;

-- rack_slots insert/update/delete → resync the affected wine(s).
create or replace function public.trg_sync_placements_rack_slots()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_wine_placements(old.cellar_wine_id);
    return old;
  end if;
  if tg_op = 'UPDATE' and old.cellar_wine_id is distinct from new.cellar_wine_id then
    perform public.sync_wine_placements(old.cellar_wine_id);
  end if;
  perform public.sync_wine_placements(new.cellar_wine_id);
  return new;
end $$;

drop trigger if exists trg_placements_rack_slots on public.rack_slots;
create trigger trg_placements_rack_slots
  after insert or update or delete on public.rack_slots
  for each row execute function public.trg_sync_placements_rack_slots();

-- cellar_wines placement-field / quantity changes → resync that wine.
create or replace function public.trg_sync_placements_cellar_wines()
returns trigger language plpgsql as $$
begin
  perform public.sync_wine_placements(new.id);
  return new;
end $$;

drop trigger if exists trg_placements_cellar_wines on public.cellar_wines;
create trigger trg_placements_cellar_wines
  after update of storage_location_id, bin_cell_id, case_id, quantity on public.cellar_wines
  for each row execute function public.trg_sync_placements_cellar_wines();

-- One-time resync so anything that changed between 103 and now is consistent.
do $$
declare w record;
begin
  for w in select id from public.cellar_wines loop
    perform public.sync_wine_placements(w.id);
  end loop;
end $$;
