-- Speed up predictive wine search now the catalog has ~doubled (>18k rows).
-- 094 did a per-row unaccent(lower(display)) in the WHERE with no index — fine
-- at <10k rows, but a full scan per keystroke as the catalog grew. unaccent()
-- is only STABLE, so it can't be indexed directly; wrap it IMMUTABLE and build
-- a trigram GIN index on the wrapped expression, then point the search at it.

create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- IMMUTABLE unaccent wrapper (pins the dictionary) so it can be used in an index.
create or replace function public.f_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
as $$ select public.unaccent('public.unaccent'::regdictionary, $1) $$;

-- Trigram GIN index on the NORMALISED display — serves both LIKE and %
-- (similarity). NB: a plain-`display` trigram index (wines_catalog_display_trgm)
-- already exists from 093 but can't serve f_unaccent(lower(display)) predicates,
-- so this needs its own name (a reused name would be skipped by IF NOT EXISTS).
create index if not exists wines_catalog_display_norm_trgm
  on public.wines_catalog
  using gin (public.f_unaccent(lower(display)) gin_trgm_ops);

-- Same behaviour as 094, but using f_unaccent AND inlining the normalised query
-- (no CTE join): a trigram GIN index can only be used when the search key is a
-- per-call constant, not a value pulled from a joined relation (nq.qq), which is
-- why 094 always seq-scanned. f_unaccent(lower(q)) on the parameter is constant
-- per call, so the WHERE now hits wines_catalog_display_trgm.
create or replace function public.search_wines_catalog(q text, lim integer default 8)
returns table (producer text, wine_name text, region text, grape text, style text)
language sql stable as $$
  select c.producer, c.wine_name, c.region, c.grape, c.style
  from public.wines_catalog c
  where public.f_unaccent(lower(c.display)) like '%' || public.f_unaccent(lower(q)) || '%'
     or public.f_unaccent(lower(c.display)) % public.f_unaccent(lower(q))
  order by
    (public.f_unaccent(lower(c.display)) like public.f_unaccent(lower(q)) || '%') desc,
    similarity(public.f_unaccent(lower(c.display)), public.f_unaccent(lower(q))) desc,
    c.hit_count desc
  limit greatest(1, least(lim, 20));
$$;
