-- "Archive a Night" — a saved record of each lineup photo the user archived,
-- shown in Your Lineup Library with the date. The photo itself lives in the
-- existing wine-labels storage bucket under {userId}/lineups/{id}.jpg (covered
-- by that bucket's per-user-folder RLS, so no storage policy change needed).
create table if not exists public.lineup_archives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null,
  bottle_count integer,
  archived_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists lineup_archives_user_idx on public.lineup_archives(user_id, archived_at desc);

alter table public.lineup_archives enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'lineup_archives' and policyname = 'lineup_archives_select_own') then
    create policy lineup_archives_select_own on public.lineup_archives for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'lineup_archives' and policyname = 'lineup_archives_insert_own') then
    create policy lineup_archives_insert_own on public.lineup_archives for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'lineup_archives' and policyname = 'lineup_archives_delete_own') then
    create policy lineup_archives_delete_own on public.lineup_archives for delete using (auth.uid() = user_id);
  end if;
end $$;
