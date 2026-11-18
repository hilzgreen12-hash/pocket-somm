-- 138_rack_slot_moves.sql
-- Rack slots: safe moves and swaps, and no more empty slot rows.
--
-- 1. move_rack_slot() moves one bottle from a rack/fridge slot to another slot
--    (in the same unit or another unit of the same cellar), or swaps it with the
--    bottle already there, in ONE transaction. The app used to do this as two
--    separate writes, so a failure in between, or a screen that was out of date,
--    could overwrite a bottle or leave one unplaced. The function refuses when
--    the source slot no longer holds the bottle the app picked up, or the target
--    no longer holds what the app showed there.
--    SECURITY INVOKER: the caller's own row-level security (migration 123's
--    cellar_can_edit policies) applies to every read and write inside it.
--
-- 2. rack_slots.cellar_wine_id becomes ON DELETE CASCADE (it was SET NULL), so
--    deleting a wine removes its slot rows instead of leaving empty rows that
--    still count as "taken". Existing empty rows are removed and the column
--    becomes NOT NULL.
--    Trigger check: the placements mirror (migs 104/116) rebuilds a wine's rack
--    placements AFTER each slot delete; on a cascade the wine's slots are all
--    gone by then, so it inserts nothing. The activity log trigger (mig 133)
--    fires only on insert/update, never on delete.
--
-- Safe to re-run.

-- ── 2. Cascade instead of SET NULL ──────────────────────────────────────────

-- Drop whichever foreign key links rack_slots.cellar_wine_id to cellar_wines
-- (named rack_slots_cellar_wine_id_fkey by migration 007, unless renamed since).
do $$
declare c record;
begin
  for c in
    select con.conname
      from pg_constraint con
      join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
     where con.conrelid = 'public.rack_slots'::regclass
       and con.contype = 'f'
       and con.confrelid = 'public.cellar_wines'::regclass
       and att.attname = 'cellar_wine_id'
  loop
    execute format('alter table public.rack_slots drop constraint %I', c.conname);
  end loop;
end $$;

-- Rows left behind by deleted wines hold no bottle.
delete from public.rack_slots where cellar_wine_id is null;

alter table public.rack_slots alter column cellar_wine_id set not null;

alter table public.rack_slots
  add constraint rack_slots_cellar_wine_id_fkey
  foreign key (cellar_wine_id) references public.cellar_wines (id) on delete cascade;

-- ── 1. Move or swap one bottle ──────────────────────────────────────────────

-- p_expected_to_wine is the wine the app showed in the target slot (null = the
-- app showed it empty). Returns 'moved' or 'swapped'. Raises with one of these
-- messages, which the app turns into its own wording:
--   rack_missing             either unit no longer exists (or isn't visible)
--   rack_other_cellar        the two units belong to different cellars
--   cellar_view_only         the caller can't edit this cellar
--   rack_slot_off_grid       the target is outside the unit's grid
--   rack_slot_source_changed the source slot no longer holds p_wine_id
--   rack_slot_target_changed the target slot no longer holds p_expected_to_wine
--   rack_slot_wine_archived  the bottle has been archived
--   rack_slot_refused        a write was refused (row-level security)
create or replace function public.move_rack_slot(
  p_wine_id uuid,
  p_from_rack uuid, p_from_row integer, p_from_col integer,
  p_to_rack uuid, p_to_row integer, p_to_col integer,
  p_expected_to_wine uuid default null
) returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_from public.wine_racks;
  v_to   public.wine_racks;
  v_src  public.rack_slots;
  v_dst  public.rack_slots;
  v_rows integer;
begin
  select * into v_from from public.wine_racks where id = p_from_rack;
  select * into v_to   from public.wine_racks where id = p_to_rack;
  if v_from.id is null or v_to.id is null then
    raise exception 'rack_missing';
  end if;
  if v_from.user_id <> v_to.user_id then
    raise exception 'rack_other_cellar';
  end if;
  if not public.cellar_can_edit(v_to.user_id) then
    raise exception 'cellar_view_only';
  end if;
  if not (
       (p_to_row = -1 and p_to_col >= 0 and p_to_col < coalesce(v_to.large_format_cols, 0))
    or (p_to_row >= 0 and p_to_row < v_to.rows and p_to_col >= 0 and p_to_col < v_to.cols)
  ) then
    raise exception 'rack_slot_off_grid';
  end if;

  -- Lock both slots, always in id order, so two overlapping swaps can't deadlock.
  perform 1
     from public.rack_slots
    where (rack_id = p_from_rack and row_index = p_from_row and col_index = p_from_col)
       or (rack_id = p_to_rack and row_index = p_to_row and col_index = p_to_col)
    order by id
      for update;

  select * into v_src from public.rack_slots
   where rack_id = p_from_rack and row_index = p_from_row and col_index = p_from_col;
  if v_src.id is null or v_src.cellar_wine_id is distinct from p_wine_id then
    raise exception 'rack_slot_source_changed';
  end if;
  if (p_from_rack, p_from_row, p_from_col) = (p_to_rack, p_to_row, p_to_col) then
    return 'moved';
  end if;
  if exists (select 1 from public.cellar_wines where id = p_wine_id and archived_at is not null) then
    raise exception 'rack_slot_wine_archived';
  end if;

  select * into v_dst from public.rack_slots
   where rack_id = p_to_rack and row_index = p_to_row and col_index = p_to_col;
  if v_dst.cellar_wine_id is distinct from p_expected_to_wine then
    raise exception 'rack_slot_target_changed';
  end if;

  if v_dst.id is null then
    -- Delete + insert (not an in-place update) so the activity log records the
    -- bottle going into its new slot, exactly as the app's old writes did.
    delete from public.rack_slots where id = v_src.id;
    get diagnostics v_rows = row_count;
    if v_rows = 0 then raise exception 'rack_slot_refused'; end if;
    insert into public.rack_slots (rack_id, row_index, col_index, cellar_wine_id)
    values (p_to_rack, p_to_row, p_to_col, p_wine_id);
    return 'moved';
  end if;

  update public.rack_slots set cellar_wine_id = v_dst.cellar_wine_id where id = v_src.id;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then raise exception 'rack_slot_refused'; end if;
  update public.rack_slots set cellar_wine_id = p_wine_id where id = v_dst.id;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then raise exception 'rack_slot_refused'; end if;
  return 'swapped';
end;
$$;

revoke execute on function public.move_rack_slot(uuid, uuid, integer, integer, uuid, integer, integer, uuid) from public, anon;
grant execute on function public.move_rack_slot(uuid, uuid, integer, integer, uuid, integer, integer, uuid) to authenticated;
