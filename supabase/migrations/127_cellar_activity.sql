-- 127: Shared cellar activity log.
-- When someone a cellar has been shared with (cellar_members, mig 123) changes
-- the owner's cellar, a line is written here so the owner sees it next time they
-- open Vinster ("Since you last looked, Tom archived 2 bottles of …").
-- Written ONLY by the triggers below (security definer). Only edits made by a
-- signed-in user who is NOT the owner are logged: the owner's own changes and
-- background/system writes (no auth.uid()) never are. Consecutive identical
-- actions within 5 minutes merge into one line (e.g. placing bottles slot by slot).

create table if not exists public.cellar_activity (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  actor_id    uuid not null references auth.users(id) on delete cascade,
  actor_name  text,
  action      text not null check (action in ('added', 'archived', 'removed', 'deleted', 'placed', 'edited')),
  wine_id     uuid,
  wine_label  text,
  count       integer,
  detail      text,
  created_at  timestamptz not null default now(),
  seen_at     timestamptz
);

create index if not exists cellar_activity_owner_idx on public.cellar_activity(owner_id, created_at desc);

alter table public.cellar_activity enable row level security;

drop policy if exists "owner reads cellar activity" on public.cellar_activity;
create policy "owner reads cellar activity" on public.cellar_activity
  for select using (owner_id = auth.uid());

drop policy if exists "owner marks cellar activity seen" on public.cellar_activity;
create policy "owner marks cellar activity seen" on public.cellar_activity
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Write (or merge into) one activity line.
create or replace function public.log_cellar_activity(
  p_owner uuid, p_action text, p_wine uuid, p_label text, p_count integer, p_detail text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_actor uuid := auth.uid();
  v_name  text;
  v_id    uuid;
begin
  if v_actor is null or p_owner is null or v_actor = p_owner then return; end if;
  -- Only people the cellar is actually shared with.
  if not exists (select 1 from public.cellar_members m
                 where m.owner_id = p_owner and m.member_id = v_actor and m.status = 'accepted') then
    return;
  end if;
  v_name := coalesce(nullif(trim(auth.jwt() -> 'user_metadata' ->> 'display_name'), ''), auth.jwt() ->> 'email');

  -- An archive of part of a wine first lowers the original's bottle count, then
  -- adds the archived copy: drop the matching "removed" line so it reads once.
  if p_action = 'archived' then
    delete from public.cellar_activity
     where owner_id = p_owner and actor_id = v_actor and action = 'removed' and seen_at is null
       and wine_label = p_label and count = p_count and created_at > now() - interval '1 minute';
  end if;

  select id into v_id from public.cellar_activity
   where owner_id = p_owner and actor_id = v_actor and action = p_action
     and wine_id is not distinct from p_wine and coalesce(detail, '') = coalesce(p_detail, '')
     and seen_at is null and created_at > now() - interval '5 minutes'
   order by created_at desc limit 1;
  if v_id is not null then
    update public.cellar_activity
       set count = case when p_action = 'edited' then null else coalesce(count, 0) + coalesce(p_count, 0) end,
           created_at = now()
     where id = v_id;
  else
    insert into public.cellar_activity (owner_id, actor_id, actor_name, action, wine_id, wine_label, count, detail)
    values (p_owner, v_actor, v_name, p_action, p_wine, p_label,
            case when p_action = 'edited' then null else p_count end, p_detail);
  end if;
end;
$$;

create or replace function public.cellar_wine_label(w public.cellar_wines) returns text
language sql immutable as $$
  select trim(concat_ws(' ',
    w.producer,
    case when lower(coalesce(w.wine_name, '')) = lower(coalesce(w.producer, '')) then null else w.wine_name end,
    w.vintage));
$$;

-- cellar_wines: added / archived / removed (fewer bottles) / deleted / edited.
create or replace function public.trg_cellar_activity_wines()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return coalesce(new, old); end if;
  if tg_op = 'INSERT' then
    if coalesce(new.is_wishlist, false) then return new; end if;
    perform public.log_cellar_activity(new.user_id,
      case when new.archived_at is not null then 'archived' else 'added' end,
      new.id, public.cellar_wine_label(new), new.quantity, null);
  elsif tg_op = 'DELETE' then
    if coalesce(old.is_wishlist, false) then return old; end if;
    perform public.log_cellar_activity(old.user_id,
      'deleted',
      old.id, public.cellar_wine_label(old), old.quantity,
      case when old.archived_at is not null then 'from the archive' else null end);
  else
    if coalesce(new.is_wishlist, false) then return new; end if;
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

drop trigger if exists trg_cellar_activity_wines on public.cellar_wines;
create trigger trg_cellar_activity_wines
  after insert or update or delete on public.cellar_wines
  for each row execute function public.trg_cellar_activity_wines();

-- cellar_placements: bottles placed into a rack / fridge / bin / alt cellar.
create or replace function public.trg_cellar_activity_placements()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  w     public.cellar_wines;
  n     integer;
  place text;
begin
  if auth.uid() is null then return new; end if;
  -- Rack/fridge placements are rebuilt wholesale from rack_slots on every slot
  -- change, so they're logged from rack_slots instead (below).
  if new.kind = 'rack' then return new; end if;
  n := new.quantity - case when tg_op = 'UPDATE' then coalesce(old.quantity, 0) else 0 end;
  if n <= 0 then return new; end if;
  select * into w from public.cellar_wines where id = new.cellar_wine_id;
  if w.id is null or coalesce(w.is_wishlist, false) or w.archived_at is not null then return new; end if;
  if new.kind = 'bin' then
    select r.name into place from public.bin_cells c join public.wine_racks r on r.id = c.bin_id where c.id = new.bin_cell_id;
  else
    select name into place from public.storage_locations where id = new.storage_location_id;
  end if;
  perform public.log_cellar_activity(w.user_id, 'placed', w.id, public.cellar_wine_label(w), n, place);
  return new;
end;
$$;

drop trigger if exists trg_cellar_activity_placements on public.cellar_placements;
create trigger trg_cellar_activity_placements
  after insert or update of quantity on public.cellar_placements
  for each row execute function public.trg_cellar_activity_placements();

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
  if w.id is null or coalesce(w.is_wishlist, false) or w.archived_at is not null then return new; end if;
  select name into place from public.wine_racks where id = new.rack_id;
  perform public.log_cellar_activity(w.user_id, 'placed', w.id, public.cellar_wine_label(w), 1, place);
  return new;
end;
$$;

drop trigger if exists trg_cellar_activity_rack_slots on public.rack_slots;
create trigger trg_cellar_activity_rack_slots
  after insert or update of cellar_wine_id on public.rack_slots
  for each row execute function public.trg_cellar_activity_rack_slots();
