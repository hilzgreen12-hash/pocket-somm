-- Predictive search: match on ALL query tokens, not the whole phrase.
--
-- 096 matched `display LIKE '%<full query>%'` OR trigram-similar. That misses
-- multi-word partials where the words aren't contiguous in `display` — e.g.
-- "Leflaive Clavoi" never sits together in "Domaine Leflaive Puligny-Montrachet
-- Clavoillon", and the short query's overall similarity to the long display
-- falls under the threshold. So a real producer + partial cuvée returned nothing.
--
-- Now every whitespace-delimited token must appear somewhere in the normalised
-- display (AND of per-token substring), which is how a user actually narrows a
-- wine ("leflaive" + "clavoi" → Leflaive Clavoillon). The first token drives an
-- indexable LIKE so the GIN trigram index still prunes before the token filter;
-- a whole-phrase trigram match is kept as a typo-tolerant fallback.

create or replace function public.search_wines_catalog(q text, lim integer default 8)
returns table (producer text, wine_name text, region text, grape text, style text)
language sql stable as $$
  with toks as (
    select public.f_unaccent(t) as tok
    from regexp_split_to_table(lower(trim(q)), '\s+') as t
    where length(t) > 0
  )
  select c.producer, c.wine_name, c.region, c.grape, c.style
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
