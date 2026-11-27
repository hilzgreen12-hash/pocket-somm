-- The email a member uses in the Community — which can differ from the email
-- they sign in to Vinster with. Kept apart from community_profiles (which other
-- members can read) so it's never shown to anyone: only its owner can read it,
-- and only the community edge function writes it. Used so people who know the
-- address can find the member, when they allow that.
create table if not exists public.community_contact (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  updated_at timestamptz not null default now()
);

alter table public.community_contact enable row level security;

drop policy if exists "Members read own community contact" on public.community_contact;
create policy "Members read own community contact" on public.community_contact
  for select to authenticated using (user_id = auth.uid());

grant select on public.community_contact to authenticated;
