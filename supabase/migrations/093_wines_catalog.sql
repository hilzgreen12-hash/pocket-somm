-- Local wine catalog powering the predictive "Search a Wine" typeahead.
--
-- Previously the typeahead asked Claude to invent matches per keystroke — slow
-- (an LLM round-trip each query) and inconsistent (non-deterministic, patchy on
-- the long tail). This table is a real, searchable catalog: seeded with a
-- focused set of well-known wines and grown organically from confirmed
-- Wine-Searcher matches + scans. Search hits this table first (instant, stable),
-- falling back to the Claude typeahead only when the catalog is thin.
create extension if not exists pg_trgm;

create table if not exists public.wines_catalog (
  id uuid primary key default gen_random_uuid(),
  producer text not null,
  wine_name text,                 -- cuvée / bottling; null when sold under the producer name
  region text,
  grape text,
  style text,                     -- Red / White / Rosé / Sparkling / Fortified
  ws_wine_id text,                -- Wine-Searcher id when known (verification anchor)
  search_key text not null unique, -- normalized "producer|wine_name" for dedup
  display text not null,          -- "Producer WineName" — the text we fuzzy-match on
  source text not null default 'seed', -- 'seed' | 'wine-searcher' | 'scan'
  hit_count integer not null default 0, -- times matched/selected — light ranking boost
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigram indexes for fast fuzzy + substring matching on the display text.
create index if not exists wines_catalog_display_trgm on public.wines_catalog using gin (display gin_trgm_ops);
create index if not exists wines_catalog_producer_trgm on public.wines_catalog using gin (producer gin_trgm_ops);

alter table public.wines_catalog enable row level security;
-- The catalog is reference data — readable by anyone (guest search is allowed).
-- There is deliberately NO insert/update/delete policy, so writes only happen
-- through the service role (the seed + organic-population edge functions).
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'wines_catalog' and policyname = 'wines_catalog_read') then
    create policy wines_catalog_read on public.wines_catalog for select using (true);
  end if;
end $$;

-- Ranked typeahead search: exact prefix first, then trigram similarity, then the
-- popularity boost. ILIKE '%q%' catches substrings the trigram threshold misses.
create or replace function public.search_wines_catalog(q text, lim integer default 8)
returns table (producer text, wine_name text, region text, grape text, style text)
language sql stable as $$
  select producer, wine_name, region, grape, style
  from public.wines_catalog
  where display ilike '%' || q || '%' or display % q
  order by
    (display ilike q || '%') desc,
    similarity(display, q) desc,
    hit_count desc
  limit greatest(1, least(lim, 20));
$$;
