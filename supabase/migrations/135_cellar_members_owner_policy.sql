-- 135_cellar_members_owner_policy.sql
-- Close a loophole in migration 123. The owner's single `for all` policy on
-- cellar_members let an owner insert or update a row as 'accepted' with ANY
-- member_id, making that person a "member" of the owner's cellar without their
-- consent. shares_cellar_with() then granted the owner read access to that
-- person's label photos.
--
-- After this migration a membership can only become 'accepted' through
-- accept_cellar_invite(), which runs as the function owner and checks the
-- caller's own email. Owners may:
--   • see their rows,
--   • create PENDING invites only (no member, not accepted),
--   • change a member's role (view / edit) — the only column they can update,
--   • remove a member or cancel an invite.
-- Invitee policies (see / decline / leave) and the access helpers are unchanged.
--
-- Idempotent: safe to run more than once.

drop policy if exists "owner manages cellar members" on public.cellar_members;

drop policy if exists "owner sees cellar members" on public.cellar_members;
create policy "owner sees cellar members" on public.cellar_members
  for select using (owner_id = auth.uid());

drop policy if exists "owner invites cellar members" on public.cellar_members;
create policy "owner invites cellar members" on public.cellar_members
  for insert with check (
    owner_id = auth.uid()
    and status = 'pending'
    and member_id is null
    and accepted_at is null
  );

drop policy if exists "owner changes member role" on public.cellar_members;
create policy "owner changes member role" on public.cellar_members
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "owner removes cellar members" on public.cellar_members;
create policy "owner removes cellar members" on public.cellar_members
  for delete using (owner_id = auth.uid());

-- RLS can't compare old and new values, so the update policy above is paired
-- with a column grant: signed-in users may update `role` and nothing else.
-- accept_cellar_invite() is security definer, so it can still set member_id,
-- status and accepted_at.
revoke update on public.cellar_members from anon, authenticated;
grant update (role) on public.cellar_members to authenticated;
