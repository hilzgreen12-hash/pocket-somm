-- Shared household cellar.
-- A cellar owner invites another Vinster account (by email) as a member with
-- 'view' or 'edit' access. Once accepted, the member's app opens the owner's
-- cellar: wines (incl. the archive), placements, racks/fridges/bins, alt
-- cellars, cases, removal history and custom filters. Rows keep the OWNER's
-- user_id; members get access through the policies below. Reviews, taste
-- profile, scans and wishlists stay personal (separate tables / own user_id).
-- The old cellar_shares table is left untouched (unused).

create table if not exists public.cellar_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid references auth.users(id) on delete cascade,
  invite_email text not null,
  role text not null default 'edit' check (role in ('view', 'edit')),
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  owner_name text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index if not exists cellar_members_owner_idx on public.cellar_members(owner_id);
create index if not exists cellar_members_member_idx on public.cellar_members(member_id);
create index if not exists cellar_members_email_idx on public.cellar_members(lower(invite_email));
-- One live invite per owner + email, and a member belongs to one shared cellar.
create unique index if not exists cellar_members_owner_email_uq on public.cellar_members(owner_id, lower(invite_email));
create unique index if not exists cellar_members_one_cellar_uq on public.cellar_members(member_id) where status = 'accepted';

alter table public.cellar_members enable row level security;

-- Owners see and manage their invites.
drop policy if exists "owner manages cellar members" on public.cellar_members;
create policy "owner manages cellar members" on public.cellar_members
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Invitees see invites addressed to their email, and their own membership.
drop policy if exists "invitee sees own invites" on public.cellar_members;
create policy "invitee sees own invites" on public.cellar_members
  for select using (member_id = auth.uid() or lower(invite_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Members can leave (delete their own accepted membership) or decline an invite.
drop policy if exists "invitee leaves or declines" on public.cellar_members;
create policy "invitee leaves or declines" on public.cellar_members
  for delete using (member_id = auth.uid() or lower(invite_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Access helpers (security definer so policies can read cellar_members without
-- recursing through its own RLS).
create or replace function public.cellar_can_view(owner uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select owner = auth.uid() or exists (
    select 1 from public.cellar_members m
    where m.owner_id = owner and m.member_id = auth.uid() and m.status = 'accepted'
  );
$$;

create or replace function public.cellar_can_edit(owner uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select owner = auth.uid() or exists (
    select 1 from public.cellar_members m
    where m.owner_id = owner and m.member_id = auth.uid() and m.status = 'accepted' and m.role = 'edit'
  );
$$;

-- True when the caller and `other` are in the same shared cellar (either way
-- round) — used for label photos, which live in each uploader's own folder.
create or replace function public.shares_cellar_with(other text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.cellar_members m
    where m.status = 'accepted'
      and ((m.owner_id = auth.uid() and m.member_id::text = other)
        or (m.member_id = auth.uid() and m.owner_id::text = other))
  );
$$;

-- Accept an invite addressed to the caller's email.
create or replace function public.accept_cellar_invite(invite_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  em text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from public.cellar_members where member_id = auth.uid() and status = 'accepted' and id <> invite_id) then
    raise exception 'You are already in a shared cellar. Leave it before joining another.';
  end if;
  update public.cellar_members
     set member_id = auth.uid(), status = 'accepted', accepted_at = now()
   where id = invite_id and lower(invite_email) = em and owner_id <> auth.uid();
  if not found then raise exception 'Invite not found'; end if;
end;
$$;
grant execute on function public.accept_cellar_invite(uuid) to authenticated;

-- ── Member access to the owner's cellar (added alongside the existing owner
-- policies; Postgres ORs permissive policies). ──────────────────────────────

-- cellar_wines: shared cellar rows only (never another person's wishlist).
drop policy if exists "cellar members view" on public.cellar_wines;
create policy "cellar members view" on public.cellar_wines
  for select using (coalesce(is_wishlist, false) = false and public.cellar_can_view(user_id));
drop policy if exists "cellar members edit" on public.cellar_wines;
create policy "cellar members edit" on public.cellar_wines
  for all using (coalesce(is_wishlist, false) = false and public.cellar_can_edit(user_id))
  with check (coalesce(is_wishlist, false) = false and public.cellar_can_edit(user_id));

drop policy if exists "cellar members view" on public.cellar_wine_removals;
create policy "cellar members view" on public.cellar_wine_removals
  for select using (public.cellar_can_view(user_id));
drop policy if exists "cellar members edit" on public.cellar_wine_removals;
create policy "cellar members edit" on public.cellar_wine_removals
  for all using (public.cellar_can_edit(user_id)) with check (public.cellar_can_edit(user_id));

drop policy if exists "cellar members view" on public.wine_racks;
create policy "cellar members view" on public.wine_racks
  for select using (public.cellar_can_view(user_id));
drop policy if exists "cellar members edit" on public.wine_racks;
create policy "cellar members edit" on public.wine_racks
  for all using (public.cellar_can_edit(user_id)) with check (public.cellar_can_edit(user_id));

drop policy if exists "cellar members view" on public.storage_locations;
create policy "cellar members view" on public.storage_locations
  for select using (public.cellar_can_view(user_id));
drop policy if exists "cellar members edit" on public.storage_locations;
create policy "cellar members edit" on public.storage_locations
  for all using (public.cellar_can_edit(user_id)) with check (public.cellar_can_edit(user_id));

drop policy if exists "cellar members view" on public.storage_cases;
create policy "cellar members view" on public.storage_cases
  for select using (public.cellar_can_view(user_id));
drop policy if exists "cellar members edit" on public.storage_cases;
create policy "cellar members edit" on public.storage_cases
  for all using (public.cellar_can_edit(user_id)) with check (public.cellar_can_edit(user_id));

drop policy if exists "cellar members view" on public.custom_filters;
create policy "cellar members view" on public.custom_filters
  for select using (public.cellar_can_view(user_id));
drop policy if exists "cellar members edit" on public.custom_filters;
create policy "cellar members edit" on public.custom_filters
  for all using (public.cellar_can_edit(user_id)) with check (public.cellar_can_edit(user_id));

-- Child tables: access follows the parent row's owner.
drop policy if exists "cellar members view" on public.custom_filter_wines;
create policy "cellar members view" on public.custom_filter_wines
  for select using (exists (select 1 from public.custom_filters f where f.id = custom_filter_wines.filter_id and public.cellar_can_view(f.user_id)));
drop policy if exists "cellar members edit" on public.custom_filter_wines;
create policy "cellar members edit" on public.custom_filter_wines
  for all using (exists (select 1 from public.custom_filters f where f.id = custom_filter_wines.filter_id and public.cellar_can_edit(f.user_id)))
  with check (exists (select 1 from public.custom_filters f where f.id = custom_filter_wines.filter_id and public.cellar_can_edit(f.user_id)));

drop policy if exists "cellar members view" on public.rack_slots;
create policy "cellar members view" on public.rack_slots
  for select using (exists (select 1 from public.wine_racks r where r.id = rack_slots.rack_id and public.cellar_can_view(r.user_id)));
drop policy if exists "cellar members edit" on public.rack_slots;
create policy "cellar members edit" on public.rack_slots
  for all using (exists (select 1 from public.wine_racks r where r.id = rack_slots.rack_id and public.cellar_can_edit(r.user_id)))
  with check (exists (select 1 from public.wine_racks r where r.id = rack_slots.rack_id and public.cellar_can_edit(r.user_id)));

drop policy if exists "cellar members view" on public.bin_cells;
create policy "cellar members view" on public.bin_cells
  for select using (exists (select 1 from public.wine_racks r where r.id = bin_cells.bin_id and public.cellar_can_view(r.user_id)));
drop policy if exists "cellar members edit" on public.bin_cells;
create policy "cellar members edit" on public.bin_cells
  for all using (exists (select 1 from public.wine_racks r where r.id = bin_cells.bin_id and public.cellar_can_edit(r.user_id)))
  with check (exists (select 1 from public.wine_racks r where r.id = bin_cells.bin_id and public.cellar_can_edit(r.user_id)));

drop policy if exists "cellar members view" on public.cellar_placements;
create policy "cellar members view" on public.cellar_placements
  for select using (exists (select 1 from public.cellar_wines w where w.id = cellar_placements.cellar_wine_id and public.cellar_can_view(w.user_id)));
drop policy if exists "cellar members edit" on public.cellar_placements;
create policy "cellar members edit" on public.cellar_placements
  for all using (exists (select 1 from public.cellar_wines w where w.id = cellar_placements.cellar_wine_id and public.cellar_can_edit(w.user_id)))
  with check (exists (select 1 from public.cellar_wines w where w.id = cellar_placements.cellar_wine_id and public.cellar_can_edit(w.user_id)));

-- Label photos: readable by anyone in the same shared cellar.
drop policy if exists "wine-labels select shared cellar" on storage.objects;
create policy "wine-labels select shared cellar" on storage.objects
  for select using (bucket_id = 'wine-labels' and public.shares_cellar_with((storage.foldername(name))[1]));
