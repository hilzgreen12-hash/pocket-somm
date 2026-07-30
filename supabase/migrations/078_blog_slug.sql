-- Add a stable, human-readable slug to blog posts for clean public URLs on the
-- web Journal (journal.vinsterapp.com/<slug>). New posts get their slug from the
-- app on create (see src/api/blog.ts); this backfills any existing rows.
alter table public.blog_posts add column if not exists slug text;

-- Backfill from the title: lower-case, non-alphanumerics collapsed to hyphens,
-- trimmed. (Accents are dropped by the [^a-z0-9] pass — the app's slugify folds
-- them first, so new posts keep e.g. "chateau" rather than "ch-teau".)
update public.blog_posts
set slug = nullif(trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')), '')
where slug is null or slug = '';

-- Non-unique on purpose: the backfill can collide on similar titles, and the web
-- build de-duplicates slugs at generation time (src/lib/posts.ts). The app
-- generates fresh slugs going forward.
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);
