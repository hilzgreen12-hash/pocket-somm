-- The Journal now lives on the Squarespace blog (vinsterapp.com/share); the app
-- reads its RSS feed. journal.vinsterapp.com (the Astro site rebuilt from
-- blog_posts) is retired, so stop pinging its Cloudflare deploy hook.
-- The blog_posts table itself is left in place (existing data kept).
drop trigger if exists rebuild_journal on public.blog_posts;
drop function if exists public.trigger_rebuild_journal();
