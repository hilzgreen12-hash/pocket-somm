-- Faster "sounds like" lookup. 120 compared every spoken word against every
-- catalogue row (a full scan per word) and could hit the statement timeout
-- ("Even CD Colmela 2000"). Here each word is looked up on its own through the
-- trigram index on the normalised name (one indexed search per word — a key
-- taken from a join can't use the index), and only those candidates are scored.

create or replace function public.catalog_sounds_like(q text, lim integer default 12)
returns table (producer text, wine_name text, region text, score real)
language plpgsql volatile as $$
declare
  toks text[];
  tk text;
  ids uuid[] := '{}';
begin
  select coalesce(array_agg(distinct public.f_unaccent(t)), '{}') into toks
  from regexp_split_to_table(lower(trim(q)), '[^[:alnum:]]+') as t
  where length(t) >= 3 and t !~ '^[0-9]+$';
  if coalesce(array_length(toks, 1), 0) = 0 then return; end if;

  -- Loose per-word match (misheard words are often only ~half right).
  perform set_config('pg_trgm.word_similarity_threshold', '0.45', true);

  foreach tk in array toks loop
    ids := ids || array(
      select c.id from public.wines_catalog c
      where tk <% public.f_unaccent(lower(c.display))
        and c.verification_status not in ('implausible', 'needs_review')
      limit 300
    );
  end loop;
  if coalesce(array_length(ids, 1), 0) = 0 then return; end if;

  return query
  select s.producer, s.wine_name, s.region, s.score from (
    select c.producer, c.wine_name, c.region, c.hit_count,
           sum(word_similarity(x.tok, public.f_unaccent(lower(c.display))))::real as score
    from public.wines_catalog c
    cross join unnest(toks) as x(tok)
    where c.id = any(ids)
    group by c.id, c.producer, c.wine_name, c.region, c.hit_count
  ) s
  where s.score > 0.6
  order by s.score desc, s.hit_count desc
  limit greatest(1, least(lim, 25));
end;
$$;

grant execute on function public.catalog_sounds_like(text, integer) to anon, authenticated, service_role;
