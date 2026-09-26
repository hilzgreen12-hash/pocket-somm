-- Catalog Wine-Searcher anchoring — foundation for:
--   * verifying catalog rows against Wine-Searcher and stamping the canonical
--     ws_wine_id / ws_wine_name (the `catalog-backfill-ws` edge function), and
--   * carrying that anchor from a Search-a-Wine pick into the Wine Intel flow so
--     the WS lookup is exact (fewer fuzzy misses) — the search fn now returns it.
--
-- 1) ws_checked_at makes the backfill resumable + quota-friendly: it processes
--    rows still missing an id that haven't been checked, and stamps the time it
--    tried each one — so an unmatched wine isn't re-queried on every pass.
alter table public.wines_catalog add column if not exists ws_checked_at timestamptz;
-- The canonical Wine-Searcher name that matched (093 shipped ws_wine_id but not
-- this). Lets a picked wine carry the exact WS query string into intel.
alter table public.wines_catalog add column if not exists ws_wine_name text;

-- Partial index over exactly the backfill's working set (unverified, unchecked),
-- most-searched first, so each batch is a cheap index scan.
create index if not exists wines_catalog_unverified_idx
  on public.wines_catalog (hit_count desc, created_at)
  where ws_wine_id is null and ws_checked_at is null;

-- 2) The typeahead now also returns the anchor (ws_wine_id / ws_wine_name) so a
--    picked wine can carry it into intel. Return-type change ⇒ drop + recreate.
drop function if exists public.search_wines_catalog(text, integer);

create or replace function public.search_wines_catalog(q text, lim integer default 8)
returns table (producer text, wine_name text, region text, grape text, style text, ws_wine_id text, ws_wine_name text)
language sql stable as $$
  with toks as (
    select public.f_unaccent(t) as tok
    from regexp_split_to_table(lower(trim(q)), '\s+') as t
    where length(t) > 0
  )
  select c.producer, c.wine_name, c.region, c.grape, c.style, c.ws_wine_id, c.ws_wine_name
  from public.wines_catalog c
  where
    -- First token drives an indexable LIKE (GIN trigram prunes on it)…
    public.f_unaccent(lower(c.display)) like '%' || (select tok from toks limit 1) || '%'
    -- …then require EVERY token to be present (no token missing).
    and not exists (
      select 1 from toks
      where public.f_unaccent(lower(c.display)) not like '%' || toks.tok || '%'
    )
  order by
    (public.f_unaccent(lower(c.display)) like public.f_unaccent(lower(trim(q))) || '%') desc,
    similarity(public.f_unaccent(lower(c.display)), public.f_unaccent(lower(trim(q)))) desc,
    c.hit_count desc
  limit greatest(1, least(lim, 20));
$$;
