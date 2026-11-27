-- "Did you mean…" suggestions in wine search showed no colour dot: the
-- sound-alike search returned only producer, name and region. It now also
-- returns colour, grape and style. The return shape changes, so the function
-- is dropped and recreated; older app builds ignore the extra columns.

drop function if exists public.catalog_sounds_like(text, integer);

create function public.catalog_sounds_like(q text, lim integer default 12)
 returns table(producer text, wine_name text, region text, score real, colour text, grape text, style text)
 language plpgsql
as $function$
  declare
    words text[];
    toks text[];
    tk text;
    sk text;
    ids uuid[] := '{}';
    i int;
  begin
    select coalesce(array_agg(public.f_unaccent(t) order by n), '{}') into words
    from regexp_split_to_table(lower(trim(q)), '[^[:alnum:]]+') with ordinality as x(t, n)
    where length(t) > 0 and t !~ '^[0-9]+$';

    select coalesce(array_agg(distinct w), '{}') into toks
    from unnest(words) as w where length(w) >= 3;
    for i in 1 .. coalesce(array_length(words, 1), 0) - 1 loop
      if length(words[i] || words[i + 1]) >= 5 then
        toks := array_append(toks, words[i] || words[i + 1]);
        toks := array_append(toks, words[i] || words[i + 1]);
      end if;
    end loop;
    if coalesce(array_length(toks, 1), 0) = 0 then return; end if;

    perform set_config('pg_trgm.word_similarity_threshold', '0.45', true);

    foreach tk in array toks loop
      sk := public.sound_key(tk);
      ids := ids || array(
        select c.id from public.wines_catalog c
        where tk <% public.f_unaccent(lower(c.display))
          and c.verification_status not in ('implausible', 'needs_review')
        limit 300
      );
      if length(sk) >= 3 then
        ids := ids || array(
          select c.id from public.wines_catalog c
          where sk <% public.sound_key(c.display || ' ' || coalesce(c.match_extra, ''))
            and c.verification_status not in ('implausible', 'needs_review')
          limit 300
        );
      end if;
    end loop;
    if coalesce(array_length(ids, 1), 0) = 0 then return; end if;

    return query
    select s.producer, s.wine_name, s.region, s.score, s.colour, s.grape, s.style from (
      select c.producer, c.wine_name, c.region, c.hit_count, c.colour, c.grape, c.style,
             sum(greatest(
               word_similarity(x.tok, public.f_unaccent(lower(c.display))),
               word_similarity(public.sound_key(x.tok), public.sound_key(c.display || ' ' || coalesce(c.match_extra, '')))
             ))::real as score
      from public.wines_catalog c
      cross join unnest(toks) as x(tok)
      where c.id = any(ids)
      group by c.id, c.producer, c.wine_name, c.region, c.hit_count, c.colour, c.grape, c.style
    ) s
    where s.score > 0.6
    order by s.score desc, s.hit_count desc
    limit greatest(1, least(lim, 25));
  end;
$function$;

grant execute on function public.catalog_sounds_like(text, integer) to anon, authenticated, service_role;
