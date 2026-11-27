-- Vinster Community: sharing many reviews at once (e.g. a member's reviews
-- imported from their own Vivino export).
--
-- A bulk share is one deliberate action, so it doesn't count against the
-- everyday sharing limit. Its reviews are checked in batches in the
-- background, and the feed shows the batch as one card rather than letting
-- hundreds of reviews flood it. Shares over 200 reviews are flagged for
-- Vinster to look at afterwards — they still go through straight away.

create table if not exists public.community_bulk_shares (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  total        int not null default 0,
  processed    int not null default 0,
  held         int not null default 0,
  status       text not null default 'running' check (status in ('running', 'done', 'failed')),
  flagged      boolean generated always as (total > 200) stored,
  created_at   timestamptz not null default now(),
  finished_at  timestamptz
);
create index if not exists community_bulk_shares_user_idx on public.community_bulk_shares (user_id, created_at desc);
create index if not exists community_bulk_shares_flagged_idx on public.community_bulk_shares (created_at desc) where flagged;
alter table public.community_bulk_shares enable row level security;
-- Members see the progress of their own bulk shares; the edge function writes them.
create policy "Members see their own bulk shares" on public.community_bulk_shares
  for select to authenticated using (user_id = auth.uid());

-- Each shared review remembers the bulk share it came in with, if any.
alter table public.community_reviews
  add column if not exists bulk_share_id uuid references public.community_bulk_shares(id) on delete set null;
create index if not exists community_reviews_bulk_idx
  on public.community_reviews (bulk_share_id) where bulk_share_id is not null;

-- The feed view gains bulk_share_id (added at the end, as a view's existing
-- columns can't move) so the app can show a bulk share as one card.
create or replace view public.community_feed
with (security_invoker = true) as
select
  r.id, r.user_id, r.category, r.source_table, r.source_id, r.title, r.subtitle,
  r.rating, r.body, r.metadata, r.image_path, r.status, r.created_at, r.updated_at,
  p.username, p.avatar_path,
  (select count(*) from public.community_review_likes l where l.review_id = r.id) as like_count,
  (select count(*) from public.community_review_comments c where c.review_id = r.id and c.status = 'visible') as comment_count,
  exists (select 1 from public.community_review_likes l where l.review_id = r.id and l.user_id = auth.uid()) as liked_by_me,
  r.bulk_share_id
from public.community_reviews r
join public.community_profiles p on p.user_id = r.user_id;
