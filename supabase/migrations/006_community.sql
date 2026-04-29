create table community_posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  display_name  text not null,
  avatar        text,
  content       text not null,
  wine_name     text,
  wine_producer text,
  wine_vintage  text,
  cellar_wine_id uuid references cellar_wines(id) on delete set null,
  created_at    timestamptz default now()
);

alter table community_posts enable row level security;

create policy "Anyone can read posts" on community_posts
  for select using (true);

create policy "Users create own posts" on community_posts
  for insert with check (auth.uid() = user_id);

create policy "Users delete own posts" on community_posts
  for delete using (auth.uid() = user_id);

create table community_likes (
  post_id uuid references community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (post_id, user_id)
);

alter table community_likes enable row level security;

create policy "Anyone can read likes" on community_likes
  for select using (true);

create policy "Users manage own likes" on community_likes
  for all using (auth.uid() = user_id);

create table community_comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references community_posts(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete cascade,
  display_name text not null,
  avatar       text,
  content      text not null,
  created_at   timestamptz default now()
);

alter table community_comments enable row level security;

create policy "Anyone can read comments" on community_comments
  for select using (true);

create policy "Users add own comments" on community_comments
  for insert with check (auth.uid() = user_id);

create policy "Users delete own comments" on community_comments
  for delete using (auth.uid() = user_id);
