-- Vinster Community: deleting a review takes its share down with it, so the
-- Community never shows a review its author has deleted. (A shared photo left
-- in the community bucket is removed with the account.)

create or replace function public.community_unshare_deleted_source()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  delete from public.community_reviews
  where source_table = tg_table_name and source_id = old.id;
  return old;
end;
$$;

drop trigger if exists community_unshare_deleted on public.chosen_wines;
create trigger community_unshare_deleted
  after delete on public.chosen_wines
  for each row execute function public.community_unshare_deleted_source();

drop trigger if exists community_unshare_deleted on public.cellar_wines;
create trigger community_unshare_deleted
  after delete on public.cellar_wines
  for each row execute function public.community_unshare_deleted_source();

drop trigger if exists community_unshare_deleted on public.scan_sessions;
create trigger community_unshare_deleted
  after delete on public.scan_sessions
  for each row execute function public.community_unshare_deleted_source();
