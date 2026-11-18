-- 139_clear_legacy_location_pointers.sql
-- Retire the legacy alt-cellar pointer on cellar_wines (storage_location_id,
-- plus case_id, the legacy case link). Where a wine's bottles are stored has
-- lived in cellar_placements since migrations 103-107; the app no longer reads
-- or writes the pointer. Stale pointers made old code snap moved bottles back
-- and let "Delete Alt Cellar & Contents" treat a wine as still being there.
--
-- PART 1 files any wine that only the pointer still links to an alt cellar
-- (active, not waiting for a rack or bin, no 'location' placement yet): its
-- unplaced bottles get a placement there, in its case when the case belongs
-- to that cellar. PART 2 then clears every pointer. The columns stay.
--
-- The placement mirror trigger is paused for PART 2 only: clearing a pointer
-- changes no bottle counts, so there is nothing for it to rebuild or trim.
-- Everything runs in one block, so a failure leaves nothing half-done.
-- Idempotent: a second run finds no pointers and changes nothing.

do $$
begin
  -- PART 1: file pointer-only wines into their alt cellar.
  insert into public.cellar_placements (cellar_wine_id, kind, quantity, storage_location_id, case_id)
  select w.id, 'location', w.quantity - coalesce(placed.n, 0), w.storage_location_id,
         case when c.storage_location_id = w.storage_location_id then c.id end
  from public.cellar_wines w
  left join public.storage_cases c on c.id = w.case_id
  left join lateral (
    select sum(p.quantity) as n from public.cellar_placements p where p.cellar_wine_id = w.id
  ) placed on true
  where w.storage_location_id is not null
    and w.archived_at is null
    and w.awaiting_placement_unit_id is null
    and not exists (
      select 1 from public.cellar_placements p where p.cellar_wine_id = w.id and p.kind = 'location'
    )
    and w.quantity - coalesce(placed.n, 0) > 0;

  -- PART 2: clear the pointers.
  alter table public.cellar_wines disable trigger trg_placements_cellar_wines;
  update public.cellar_wines
     set storage_location_id = null, case_id = null
   where storage_location_id is not null or case_id is not null;
  alter table public.cellar_wines enable trigger trg_placements_cellar_wines;
end $$;
