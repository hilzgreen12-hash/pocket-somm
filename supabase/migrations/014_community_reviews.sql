-- Unified community reviews table for wines, recipes, and restaurants.
-- Each row is a publishable post derived from a user's local review/note,
-- or composed standalone. The source_table + source_id columns optionally
-- link back to the originating row (chosen_wines, scan_sessions, etc.) so
-- we can prevent duplicate uploads from the same source.

create table community_reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  display_name  text,
  category      text not null check (category in ('wine', 'recipe', 'restaurant')),
  source_table  text,
  source_id     uuid,
  title         text not null,
  subtitle      text,
  rating        int check (rating is null or (rating >= 0 and rating <= 100)),
  body          text,
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now()
);

alter table community_reviews enable row level security;

-- Anyone authenticated can read the community feed.
create policy "Anyone can read community reviews" on community_reviews
  for select using (true);

-- Users can manage their own reviews only.
create policy "Users insert own community reviews" on community_reviews
  for insert with check (auth.uid() = user_id);

create policy "Users update own community reviews" on community_reviews
  for update using (auth.uid() = user_id);

create policy "Users delete own community reviews" on community_reviews
  for delete using (auth.uid() = user_id);

-- Index for the "View latest" feed: one query per category, sorted newest first.
create index community_reviews_category_idx
  on community_reviews (category, created_at desc);

-- Index for "Your uploads" / dedupe checks.
create index community_reviews_user_idx
  on community_reviews (user_id, created_at desc);

-- Partial unique constraint to prevent duplicate uploads from the same source row.
create unique index community_reviews_source_unique
  on community_reviews (user_id, source_table, source_id)
  where source_id is not null;
