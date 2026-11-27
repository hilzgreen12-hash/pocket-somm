-- Vinster Community, stage 1: members, moderated shared reviews, likes,
-- comments, follows, blocks, reports and a public image bucket.
--
-- Anything other members can read as text (usernames, shared reviews,
-- comments) is written only by the `community` edge function, which checks it
-- with AI first, so nobody can post around the check. Likes, follows, blocks
-- and reports carry no public text, so the app writes those directly.
--
-- The old community_posts / community_likes / community_comments tables stay
-- for now: builds up to 2.0.0 still read community_posts (placements.ts), so
-- they're dropped once those builds are gone.

-- ---------- Blocks (first: the other tables' rules use them) ----------
create table if not exists public.community_blocks (
  blocker_id  uuid not null references auth.users(id) on delete cascade,
  blocked_id  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index if not exists community_blocks_blocked_idx on public.community_blocks (blocked_id);
alter table public.community_blocks enable row level security;
create policy "Members see their own blocks" on public.community_blocks
  for select to authenticated using (blocker_id = auth.uid());
create policy "Members block others" on public.community_blocks
  for insert to authenticated with check (blocker_id = auth.uid());
create policy "Members unblock" on public.community_blocks
  for delete to authenticated using (blocker_id = auth.uid());

-- True when either member has blocked the other. Security definer so the
-- blocked member's queries can see the block too (they can't read the row).
create or replace function public.community_blocked_between(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.community_blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- ---------- Members (community_profiles) ----------
-- A member is a profile whose owner has accepted the community guidelines.
alter table public.community_profiles
  add column if not exists avatar_path text,
  add column if not exists discoverable_by_email boolean not null default true,
  add column if not exists guidelines_accepted_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists community_profiles_username_unique
  on public.community_profiles (lower(username));

drop policy if exists "Anyone can read community profiles" on public.community_profiles;
drop policy if exists "Users insert own community profile" on public.community_profiles;
drop policy if exists "Users update own community profile" on public.community_profiles;
create policy "Members read member profiles" on public.community_profiles
  for select to authenticated using (
    user_id = auth.uid()
    or (guidelines_accepted_at is not null and not public.community_blocked_between(auth.uid(), user_id))
  );
-- "Users delete own community profile" (leaving the Community) is kept.

-- ---------- Shared reviews (community_reviews) ----------
-- pending → checked by the edge function → visible, or held for the owner of
-- Vinster to look at. removed = taken down after a report.
alter table public.community_reviews
  add column if not exists status text not null default 'pending',
  add column if not exists image_path text,
  add column if not exists moderation_note text,
  add column if not exists updated_at timestamptz not null default now();
alter table public.community_reviews drop constraint if exists community_reviews_status_check;
alter table public.community_reviews
  add constraint community_reviews_status_check check (status in ('pending', 'visible', 'held', 'removed'));

drop policy if exists "Anyone can read community reviews" on public.community_reviews;
drop policy if exists "Users insert own community reviews" on public.community_reviews;
drop policy if exists "Users update own community reviews" on public.community_reviews;
create policy "Members read visible reviews" on public.community_reviews
  for select to authenticated using (
    user_id = auth.uid()
    or (status = 'visible' and not public.community_blocked_between(auth.uid(), user_id))
  );
-- "Users delete own community reviews" (unsharing) is kept.

create index if not exists community_reviews_feed_idx
  on public.community_reviews (category, created_at desc) where status = 'visible';

-- ---------- Likes ("cheers") ----------
create table if not exists public.community_review_likes (
  review_id   uuid not null references public.community_reviews(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (review_id, user_id)
);
create index if not exists community_review_likes_user_idx on public.community_review_likes (user_id);
alter table public.community_review_likes enable row level security;
create policy "Members read likes" on public.community_review_likes
  for select to authenticated using (not public.community_blocked_between(auth.uid(), user_id));
create policy "Members like visible reviews" on public.community_review_likes
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.community_reviews r
      where r.id = review_id and r.status = 'visible'
        and not public.community_blocked_between(auth.uid(), r.user_id)
    )
  );
create policy "Members unlike" on public.community_review_likes
  for delete to authenticated using (user_id = auth.uid());

-- ---------- Comments ----------
create table if not exists public.community_review_comments (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null references public.community_reviews(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 1000),
  status      text not null default 'pending' check (status in ('pending', 'visible', 'held', 'removed')),
  created_at  timestamptz not null default now()
);
create index if not exists community_review_comments_review_idx
  on public.community_review_comments (review_id, created_at);
alter table public.community_review_comments enable row level security;
create policy "Members read visible comments" on public.community_review_comments
  for select to authenticated using (
    user_id = auth.uid()
    or (status = 'visible' and not public.community_blocked_between(auth.uid(), user_id))
  );
-- A member can delete their own comments, and any comment on their own review.
create policy "Members delete comments" on public.community_review_comments
  for delete to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from public.community_reviews r where r.id = review_id and r.user_id = auth.uid())
  );

-- ---------- Follows ----------
create table if not exists public.community_follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  followee_id  uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index if not exists community_follows_followee_idx on public.community_follows (followee_id);
alter table public.community_follows enable row level security;
create policy "Members read follows" on public.community_follows
  for select to authenticated using (
    not public.community_blocked_between(auth.uid(), follower_id)
    and not public.community_blocked_between(auth.uid(), followee_id)
  );
create policy "Members follow members" on public.community_follows
  for insert to authenticated with check (
    follower_id = auth.uid()
    and not public.community_blocked_between(follower_id, followee_id)
    and exists (
      select 1 from public.community_profiles p
      where p.user_id = followee_id and p.guidelines_accepted_at is not null
    )
  );
-- Unfollow, or remove someone who follows you.
create policy "Members unfollow" on public.community_follows
  for delete to authenticated using (follower_id = auth.uid() or followee_id = auth.uid());

-- Blocking someone ends any follow between the two of you.
create or replace function public.community_unfollow_on_block()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  delete from public.community_follows
  where (follower_id = new.blocker_id and followee_id = new.blocked_id)
     or (follower_id = new.blocked_id and followee_id = new.blocker_id);
  return new;
end;
$$;
drop trigger if exists community_unfollow_on_block on public.community_blocks;
create trigger community_unfollow_on_block
  after insert on public.community_blocks
  for each row execute function public.community_unfollow_on_block();

-- ---------- Reports ----------
create table if not exists public.community_reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references auth.users(id) on delete cascade,
  target_type  text not null check (target_type in ('review', 'comment', 'profile')),
  target_id    uuid not null,
  reason       text check (reason is null or char_length(reason) <= 500),
  status       text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at   timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);
create index if not exists community_reports_open_idx on public.community_reports (created_at) where status = 'open';
alter table public.community_reports enable row level security;
create policy "Members report" on public.community_reports
  for insert to authenticated with check (reporter_id = auth.uid());
create policy "Members see their own reports" on public.community_reports
  for select to authenticated using (reporter_id = auth.uid());

-- ---------- Feed view ----------
-- Shared reviews with the author's member name and photo, cheers and comment
-- counts, and whether the viewer has cheered. security_invoker, so every rule
-- above (visibility, blocks) applies to whoever is reading.
create or replace view public.community_feed
with (security_invoker = true) as
select
  r.id, r.user_id, r.category, r.source_table, r.source_id, r.title, r.subtitle,
  r.rating, r.body, r.metadata, r.image_path, r.status, r.created_at, r.updated_at,
  p.username, p.avatar_path,
  (select count(*) from public.community_review_likes l where l.review_id = r.id) as like_count,
  (select count(*) from public.community_review_comments c where c.review_id = r.id and c.status = 'visible') as comment_count,
  exists (select 1 from public.community_review_likes l where l.review_id = r.id and l.user_id = auth.uid()) as liked_by_me
from public.community_reviews r
join public.community_profiles p on p.user_id = r.user_id;

grant select on public.community_feed to authenticated;

-- ---------- Images ----------
-- Public bucket for member photos and shared label photos. Only the edge
-- function writes to it (after checking the image), so there are no upload
-- policies; review photos in wine-labels stay private.
insert into storage.buckets (id, name, public)
values ('community', 'community', true)
on conflict (id) do nothing;
