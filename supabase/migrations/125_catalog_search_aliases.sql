-- Typed wine search also matches the names people use for an estate.
-- producer_aliases (mig 122) already says "Eben Sadie" IS Sadie Family Wines and
-- copies that onto each catalogue row's match_extra — but search_wines_catalog
-- only looked at the display name, so "Eben Sadie Palladius" found nothing.
-- Every typed word may now be found in the display name OR the aliases; ranking
-- still prefers the display name. A trigram index on that combined text keeps
-- the typeahead fast.

create index if not exists wines_catalog_search_hay_trgm
  on public.wines_catalog
  using gin (public.f_unaccent(lower(display || ' ' || coalesce(match_extra, ''))) gin_trgm_ops);

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
    and public.f_unaccent(lower(c.display || ' ' || coalesce(c.match_extra, ''))) like '%' || (select tok from toks limit 1) || '%'
    and not exists (
      select 1 from toks
      where public.f_unaccent(lower(c.display || ' ' || coalesce(c.match_extra, ''))) not like '%' || toks.tok || '%'
    )
  order by
    (public.f_unaccent(lower(c.display)) like public.f_unaccent(lower(trim(q))) || '%') desc,
    similarity(public.f_unaccent(lower(c.display)), public.f_unaccent(lower(trim(q)))) desc,
    c.hit_count desc
  limit greatest(1, least(lim, 20));
$$;

grant execute on function public.search_wines_catalog(text, integer) to anon, authenticated, service_role;
