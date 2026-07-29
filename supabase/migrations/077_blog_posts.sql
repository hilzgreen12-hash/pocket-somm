-- The Vinster Journal — an owner-authored blog surfaced in the Community tab.
-- Everyone reads published posts; only the Vinster account writes them.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  excerpt text,
  body text not null,
  cover_image_url text,
  tags text[] not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (is_published, published_at desc nulls last, created_at desc);

alter table public.blog_posts enable row level security;

-- Anyone (incl. signed-out) may read PUBLISHED posts.
drop policy if exists "blog_read_published" on public.blog_posts;
create policy "blog_read_published" on public.blog_posts
  for select using (is_published = true);

-- The Vinster owner may read their own drafts too, and is the only writer.
drop policy if exists "blog_owner_read" on public.blog_posts;
create policy "blog_owner_read" on public.blog_posts
  for select using ((auth.jwt() ->> 'email') = 'hilary@vinsterapp.com');

drop policy if exists "blog_owner_insert" on public.blog_posts;
create policy "blog_owner_insert" on public.blog_posts
  for insert with check ((auth.jwt() ->> 'email') = 'hilary@vinsterapp.com');

drop policy if exists "blog_owner_update" on public.blog_posts;
create policy "blog_owner_update" on public.blog_posts
  for update using ((auth.jwt() ->> 'email') = 'hilary@vinsterapp.com');

drop policy if exists "blog_owner_delete" on public.blog_posts;
create policy "blog_owner_delete" on public.blog_posts
  for delete using ((auth.jwt() ->> 'email') = 'hilary@vinsterapp.com');
