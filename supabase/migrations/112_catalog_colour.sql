-- 112_catalog_colour.sql
-- Capture wine COLOUR as its own attribute, separate from `style` (which conflates
-- colour + format). Rosé Champagnes are stored style='Sparkling' so their colour was
-- invisible; Hermitage white/red are already separate rows via style. The Search-a-Wine
-- typeahead shows a colour dot (red / white / rosé) using this field.
--
-- Populated here by heuristic (style + name); an LLM refine pass (verify-catalog-batch
-- {colourfix:true}) then corrects the ambiguous Sparkling/Fortified rows.

alter table public.wines_catalog add column if not exists colour text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'wines_catalog_colour_chk') then
    alter table public.wines_catalog
      add constraint wines_catalog_colour_chk check (colour in ('red','white','rosé'));
  end if;
end $$;

-- Straight from style where unambiguous.
update public.wines_catalog set colour = 'red'   where colour is null and style = 'Red';
update public.wines_catalog set colour = 'white' where colour is null and style = 'White';
update public.wines_catalog set colour = 'rosé'  where colour is null and style = 'Rosé';

-- Sparkling → rosé when the name/display says so, otherwise white.
update public.wines_catalog set colour = 'rosé'
  where colour is null and style = 'Sparkling'
    and (coalesce(wine_name,'') || ' ' || coalesce(display,'')) ~* '(ros[eé]|rosado|rosato|saign[eé]e)';
update public.wines_catalog set colour = 'white'
  where colour is null and style = 'Sparkling';

-- Fortified → rosé if stated; white for pale styles; else red (Port-dominant).
update public.wines_catalog set colour = 'rosé'
  where colour is null and style = 'Fortified' and coalesce(wine_name,'') ~* '(ros[eé]|rosado)';
update public.wines_catalog set colour = 'white'
  where colour is null and style = 'Fortified'
    and coalesce(wine_name,'') ~* '(white|branco|blanc|fino|manzanilla|amontillado|oloroso|palo\s*cortado|cream|pale)';
update public.wines_catalog set colour = 'red'
  where colour is null and style = 'Fortified';

-- Anything left (null/odd style) stays null; the LLM refine pass fills it.

-- Search RPC now also returns colour. (Return type changes, so drop first.)
drop function if exists public.search_wines_catalog(text, integer);
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
    public.f_unaccent(lower(c.display)) like '%' || (select tok from toks limit 1) || '%'
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

-- Count of still-unassigned colour (for the LLM refine pass to target), plus the
-- ambiguous Sparkling/Fortified it should double-check.
create or replace function public.fetch_colour_todo(p_limit int default 30)
returns table (id uuid, producer text, wine_name text, region text, grape text, style text, colour text)
language sql volatile as $$
  select id, producer, wine_name, region, grape, style, colour
  from public.wines_catalog
  where colour is null
     or style in ('Sparkling','Fortified')  -- heuristic-guessed → worth an LLM check
  order by random()
  limit greatest(1, least(p_limit, 500));
$$;
