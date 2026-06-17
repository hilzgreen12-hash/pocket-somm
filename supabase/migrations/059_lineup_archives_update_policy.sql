-- Migration 056 created lineup_archives with SELECT/INSERT/DELETE policies but
-- NO UPDATE policy. With RLS enabled, an UPDATE that no policy permits succeeds
-- silently while affecting zero rows — so setLineupFavourite (and the old
-- insert-then-update image_path step) were no-ops, and the Lineup Library never
-- showed a photo or remembered a favourite. Add the missing UPDATE policy.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'lineup_archives' and policyname = 'lineup_archives_update_own') then
    create policy lineup_archives_update_own on public.lineup_archives
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
