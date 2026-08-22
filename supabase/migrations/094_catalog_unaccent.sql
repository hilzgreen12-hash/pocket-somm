-- Accent-insensitive catalog search. The display column keeps proper accents
-- ("Domaine de la Romanée-Conti"), but users type plain ASCII ("romanee"), so
-- ILIKE/trigram on the raw display missed accented wines. Fold both sides with
-- unaccent(). The catalog is small (<10k rows) so the per-row unaccent in the
-- WHERE is fine without a dedicated functional index.
create extension if not exists unaccent;

create or replace function public.search_wines_catalog(q text, lim integer default 8)
returns table (producer text, wine_name text, region text, grape text, style text)
language sql stable as $$
  with nq as (select unaccent(lower(q)) as qq)
  select c.producer, c.wine_name, c.region, c.grape, c.style
  from public.wines_catalog c, nq
  where unaccent(lower(c.display)) like '%' || nq.qq || '%'
     or unaccent(lower(c.display)) % nq.qq
  order by
    (unaccent(lower(c.display)) like nq.qq || '%') desc,
    similarity(unaccent(lower(c.display)), nq.qq) desc,
    c.hit_count desc
  limit greatest(1, least(lim, 20));
$$;
