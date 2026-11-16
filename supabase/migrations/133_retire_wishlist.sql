-- 133_retire_wishlist.sql
-- The Wish List feature has been removed from the app. This retires it in the
-- database too:
--
--   1. Old wish-list data: wish-list entries that carry something the user
--      wrote (a score, a note) are KEPT as ordinary reviews; empty placeholders
--      are removed, as are wish-list wines in cellar_wines (wines the user
--      didn't own, invisible since the feature was removed).
--   2. A guard so app builds still in the stores (which can send the old
--      wish-list flags) can never create a wish-list row again.
--   3. The cellar-sharing rules and cellar-activity triggers no longer test
--      the wish-list flag.
--
-- The two columns (cellar_wines.is_wishlist, chosen_wines.wishlist) stay for
-- now, always false: older app builds still name them in their queries, and
-- dropping them would break those builds. Drop them once every user is on
-- 1.7.31 or later.

-- 1. Old wish-list data ---------------------------------------------------------
-- Reviews flagged as wish list: keep anything the user wrote, as a normal review.
update public.chosen_wines
set wishlist = false
where wishlist
  and (user_score is not null
       or coalesce(btrim(tasting_note), '') <> ''
       or coalesce(btrim(other_observations), '') <> '');

-- ...and remove the empty placeholders.
delete from public.chosen_wines where wishlist;

-- Wish-list wines in the cellar table (never owned bottles).
delete from public.cellar_wines where is_wishlist;

-- 2. Guard against old app builds -------------------------------------------------
update public.cellar_wines set is_wishlist = false where is_wishlist is null;
alter table public.cellar_wines alter column is_wishlist set default false;
alter table public.cellar_wines alter column is_wishlist set not null;

create or replace function public.retire_wishlist_flag()
returns trigger language plpgsql as $$
begin
  if tg_table_name = 'cellar_wines' then
    new.is_wishlist := false;
  else
    new.wishlist := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_retire_wishlist on public.cellar_wines;
create trigger trg_retire_wishlist
  before insert or update of is_wishlist on public.cellar_wines
  for each row when (new.is_wishlist) execute function public.retire_wishlist_flag();

drop trigger if exists trg_retire_wishlist on public.chosen_wines;
create trigger trg_retire_wishlist
  before insert or update of wishlist on public.chosen_wines
  for each row when (new.wishlist) execute function public.retire_wishlist_flag();

comment on column public.cellar_wines.is_wishlist is
  'Retired (mig 133): always false. Kept only until app builds older than 1.7.31 are gone.';
comment on column public.chosen_wines.wishlist is
  'Retired (mig 133): always false. Kept only until app builds older than 1.7.31 are gone.';

-- 3. Sharing rules and activity triggers without the wish-list flag -----------------
drop policy if exists "cellar members view" on public.cellar_wines;
create policy "cellar members view" on public.cellar_wines
  for select using (public.cellar_can_view(user_id));
drop policy if exists "cellar members edit" on public.cellar_wines;
create policy "cellar members edit" on public.cellar_wines
  for all using (public.cellar_can_edit(user_id))
  with check (public.cellar_can_edit(user_id));

-- cellar_wines: added / archived / removed (fewer bottles) / deleted / edited.
create or replace function public.trg_cellar_activity_wines()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return coalesce(new, old); end if;
  if tg_op = 'INSERT' then
    perform public.log_cellar_activity(new.user_id,
      case when new.archived_at is not null then 'archived' else 'added' end,
      new.id, public.cellar_wine_label(new), new.quantity, null);
  elsif tg_op = 'DELETE' then
    perform public.log_cellar_activity(old.user_id,
      'deleted',
      old.id, public.cellar_wine_label(old), old.quantity,
      case when old.archived_at is not null then 'from the archive' else null end);
  else
    if old.archived_at is null and new.archived_at is not null then
      perform public.log_cellar_activity(new.user_id, 'archived', new.id, public.cellar_wine_label(new), new.quantity, null);
    elsif new.archived_at is null and coalesce(new.quantity, 0) > coalesce(old.quantity, 0) then
      perform public.log_cellar_activity(new.user_id, 'added', new.id, public.cellar_wine_label(new), new.quantity - coalesce(old.quantity, 0), null);
    elsif new.archived_at is null and coalesce(new.quantity, 0) < coalesce(old.quantity, 0) then
      perform public.log_cellar_activity(new.user_id, 'removed', new.id, public.cellar_wine_label(new), coalesce(old.quantity, 0) - new.quantity, null);
    elsif (new.producer, new.wine_name, new.vintage, new.bottle_size_ml, new.cellar_note)
            is distinct from (old.producer, old.wine_name, old.vintage, old.bottle_size_ml, old.cellar_note)
       or (new.purchase_price is distinct from old.purchase_price and not coalesce(new.purchase_price_estimated, false)) then
      perform public.log_cellar_activity(new.user_id, 'edited', new.id, public.cellar_wine_label(new), null, null);
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

-- cellar_placements: bottles placed into a fridge / bin / alt cellar.
create or replace function public.trg_cellar_activity_placements()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  w     public.cellar_wines;
  n     integer;
  place text;
begin
  if auth.uid() is null then return new; end if;
  -- Rack/fridge placements are rebuilt wholesale from rack_slots on every slot
  -- change, so they're logged from rack_slots instead.
  if new.kind = 'rack' then return new; end if;
  n := new.quantity - case when tg_op = 'UPDATE' then coalesce(old.quantity, 0) else 0 end;
  if n <= 0 then return new; end if;
  select * into w from public.cellar_wines where id = new.cellar_wine_id;
  if w.id is null or w.archived_at is not null then return new; end if;
  if new.kind = 'bin' then
    select r.name into place from public.bin_cells c join public.wine_racks r on r.id = c.bin_id where c.id = new.bin_cell_id;
  else
    select name into place from public.storage_locations where id = new.storage_location_id;
  end if;
  perform public.log_cellar_activity(w.user_id, 'placed', w.id, public.cellar_wine_label(w), n, place);
  return new;
end;
$$;

-- rack_slots: a bottle put into a rack / fridge slot.
create or replace function public.trg_cellar_activity_rack_slots()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  w     public.cellar_wines;
  place text;
begin
  if auth.uid() is null or new.cellar_wine_id is null then return new; end if;
  if tg_op = 'UPDATE' and old.cellar_wine_id is not distinct from new.cellar_wine_id then return new; end if;
  select * into w from public.cellar_wines where id = new.cellar_wine_id;
  if w.id is null or w.archived_at is not null then return new; end if;
  select name into place from public.wine_racks where id = new.rack_id;
  perform public.log_cellar_activity(w.user_id, 'placed', w.id, public.cellar_wine_label(w), 1, place);
  return new;
end;
$$;
