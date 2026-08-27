-- Producer-range grounding: return a producer's REAL cuvées from wines_catalog
-- so the intel card's "The {producer} range" is sourced from Vinster's own
-- database (thousands of seeded, real bottlings) rather than only the LLM's
-- recall. The producer-range edge function passes the scanned producer here,
-- then hands the returned wines to Claude ONLY to order / band / summarise them.
--
-- Trigram-similar producer match (with a substring fallback) so OCR variants and
-- "Domaine X" / "X" spellings still resolve; each row carries its catalog
-- producer + similarity so the caller can keep the best-matching variant(s) and
-- avoid pulling a different producer that merely shares a word.

create or replace function public.catalog_producer_wines(p text, lim integer default 40)
returns table (producer text, wine_name text, region text, sim real)
language sql stable as $$
  select c.producer, c.wine_name, c.region,
         similarity(public.f_unaccent(lower(c.producer)), public.f_unaccent(lower(trim(p)))) as sim
  from public.wines_catalog c
  where public.f_unaccent(lower(c.producer)) % public.f_unaccent(lower(trim(p)))
     or public.f_unaccent(lower(c.producer)) like '%' || public.f_unaccent(lower(trim(p))) || '%'
  order by sim desc, c.wine_name
  limit greatest(1, least(lim, 60));
$$;
