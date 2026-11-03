-- "Sounds like" catalogue lookup for voice correction.
--
-- The typeahead search (search_wines_catalog) needs every typed fragment to
-- appear in the wine's name, so a misheard dictation like "Even CD Colmela 2000"
-- finds nothing. This scores each catalogue wine by how closely each spoken word
-- resembles a word in its name (trigram word_similarity), so "colmela" still
-- lands on "Columella". correct-voice passes the top matches to the model as
-- likely answers, the way the Cellar voice command resolves against owned wines.

create or replace function public.catalog_sounds_like(q text, lim integer default 12)
returns table (producer text, wine_name text, region text, score real)
language sql stable as $$
  with toks as (
    select public.f_unaccent(t) as tok
    from regexp_split_to_table(lower(trim(q)), '[^[:alnum:]]+') as t
    where length(t) >= 3 and t !~ '^[0-9]+$'
  ),
  scored as (
    select c.producer, c.wine_name, c.region, c.hit_count,
           sum(word_similarity(toks.tok, public.f_unaccent(lower(c.display))))::real as score
    from public.wines_catalog c
    cross join toks
    -- Rows a verification pass flagged as fake/unsure are never offered as matches.
    where c.verification_status not in ('implausible', 'needs_review')
    group by c.id, c.producer, c.wine_name, c.region, c.hit_count
  )
  select producer, wine_name, region, score
  from scored
  where score > 0.6
  order by score desc, hit_count desc
  limit greatest(1, least(lim, 25));
$$;

grant execute on function public.catalog_sounds_like(text, integer) to anon, authenticated, service_role;

-- The typeahead must not offer catalogue rows already flagged as fake
-- (migration 111 marks LLM-seeded inventions 'implausible'). A typeahead pick
-- skips verification, so a fake row would surface as a "real" wine.
create or replace function public.search_wines_catalog(q text, lim integer default 8)
returns table (producer text, wine_name text, region text, grape text, style text, colour text, ws_wine_id text, ws_wine_name text)
language sql stable as $$
  with toks as (
    select public.f_unaccent(t) as tok
    from regexp_split_to_table(lower(trim(q)), '\s+') as t
    where length(t) > 0
  )
  select c.producer, c.wine_name, c.region, c.grape, c.style, c.colour, c.ws_wine_id, c.ws_wine_name
  from public.wines_catalog c
  where
    c.verification_status <> 'implausible'
    and public.f_unaccent(lower(c.display)) like '%' || (select tok from toks limit 1) || '%'
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
