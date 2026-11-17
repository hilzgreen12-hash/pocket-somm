-- 137: Shared-cellar activity lines for archiving and Return to Cellar.
--
-- The app now archives part of a wine in a safer order: the archive copy is
-- inserted FIRST, then the live row's bottle count is lowered (so a failure in
-- between can never lose a bottle). Migration 127 expected the opposite order:
-- its "archived" log call deletes a "removed" line written just before it, but
-- in the new order the "removed" line comes second and stays, so the owner saw
-- the same bottles twice ("archived 1 bottle" + "removed 1 bottle"). Now a
-- count drop is not logged as "removed" when an archive copy of exactly those
-- bottles (same wine, size and count) was created by this change moments ago.
-- The old-order clean-up in log_cellar_activity stays, for older app builds.
--
-- Return to Cellar (new) undoes an archive: the archived row becomes live again,
-- or its bottles join the live row of the same wine and the archived row is
-- deleted. Both now read as one line, "added N bottles of …": un-archiving logs
-- "added" (it logged nothing before), and the archive row's delete is not also
-- logged when this person has just added bottles of that wine.
--
-- Everything else is exactly as migration 133 left it. Idempotent: replaces the
-- trigger function only (the trigger itself already points at it).

create or replace function public.trg_cellar_activity_wines()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return coalesce(new, old); end if;
  if tg_op = 'INSERT' then
    perform public.log_cellar_activity(new.user_id,
      case when new.archived_at is not null then 'archived' else 'added' end,
      new.id, public.cellar_wine_label(new), new.quantity, null);
  elsif tg_op = 'DELETE' then
    -- An archived row deleted by Return to Cellar: its bottles were just added
    -- to the live row, which already reads "added".
    if old.archived_at is not null and exists (
      select 1 from public.cellar_activity a
       where a.owner_id = old.user_id and a.actor_id = auth.uid() and a.action = 'added'
         and a.wine_label = public.cellar_wine_label(old) and a.seen_at is null
         and a.created_at > now() - interval '1 minute'
    ) then
      return old;
    end if;
    perform public.log_cellar_activity(old.user_id,
      'deleted',
      old.id, public.cellar_wine_label(old), old.quantity,
      case when old.archived_at is not null then 'from the archive' else null end);
  else
    if old.archived_at is null and new.archived_at is not null then
      perform public.log_cellar_activity(new.user_id, 'archived', new.id, public.cellar_wine_label(new), new.quantity, null);
    elsif old.archived_at is not null and new.archived_at is null then
      -- Return to Cellar: the archived bottles are back.
      perform public.log_cellar_activity(new.user_id, 'added', new.id, public.cellar_wine_label(new), new.quantity, null);
    elsif new.archived_at is null and coalesce(new.quantity, 0) > coalesce(old.quantity, 0) then
      perform public.log_cellar_activity(new.user_id, 'added', new.id, public.cellar_wine_label(new), new.quantity - coalesce(old.quantity, 0), null);
    elsif new.archived_at is null and coalesce(new.quantity, 0) < coalesce(old.quantity, 0) then
      -- Part of the wine archived: the archive copy (inserted first) already
      -- logged these bottles as "archived".
      if not exists (
        select 1 from public.cellar_wines a
         where a.user_id = new.user_id and a.id <> new.id
           and a.archived_at is not null
           and a.created_at > now() - interval '1 minute'
           and a.quantity = coalesce(old.quantity, 0) - new.quantity
           and a.producer is not distinct from new.producer
           and a.wine_name is not distinct from new.wine_name
           and a.vintage is not distinct from new.vintage
           and a.bottle_size_ml is not distinct from new.bottle_size_ml
      ) then
        perform public.log_cellar_activity(new.user_id, 'removed', new.id, public.cellar_wine_label(new), coalesce(old.quantity, 0) - new.quantity, null);
      end if;
    elsif (new.producer, new.wine_name, new.vintage, new.bottle_size_ml, new.cellar_note)
            is distinct from (old.producer, old.wine_name, old.vintage, old.bottle_size_ml, old.cellar_note)
       or (new.purchase_price is distinct from old.purchase_price and not coalesce(new.purchase_price_estimated, false)) then
      perform public.log_cellar_activity(new.user_id, 'edited', new.id, public.cellar_wine_label(new), null, null);
    end if;
  end if;
  return coalesce(new, old);
end;
$$;
