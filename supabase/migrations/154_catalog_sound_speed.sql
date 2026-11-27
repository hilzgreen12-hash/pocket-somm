-- Voice: the sound-alike search was slow (1.8–2.9s after 153), because for
-- every candidate wine it recomputed the catalogue name's sound key and
-- unaccented form, once per spoken word. Both are now stored with each wine,
-- and each spoken word's sound key is worked out once. Same results, faster.

alter table public.wines_catalog
  add column if not exists display_norm text
  generated always as (public.f_unaccent(lower(display))) stored;

alter table public.wines_catalog
  add column if not exists display_sound text
  generated always as (public.sound_key(display || ' ' || coalesce(match_extra, ''))) stored;

drop function if exists public.catalog_sounds_like(text, integer);

create function public.catalog_sounds_like(q text, lim integer default 12)
 returns table(producer text, wine_name text, region text, score real, colour text, grape text, style text)
 language plpgsql
as $function$
  declare
    words text[];
    toks text[];
    skels text[] := '{}';
    tok_sounds text[] := '{}';
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

    -- Skeletons: single spoken words with 3+ consonants, and neighbouring pairs
    -- run together with 2+.
    for i in 1 .. coalesce(array_length(words, 1), 0) loop
      sk := public.sound_skel(words[i]);
      if length(sk) >= 3 and sk !~ ' ' then skels := array_append(skels, sk); end if;
      if i < array_length(words, 1) then
        sk := public.sound_skel(words[i] || words[i + 1]);
        if length(sk) >= 2 and sk !~ ' ' then skels := array_append(skels, sk); end if;
      end if;
    end loop;
    select coalesce(array_agg(distinct s), '{}') into skels from unnest(skels) s;

    if coalesce(array_length(toks, 1), 0) = 0 and coalesce(array_length(skels, 1), 0) = 0 then return; end if;

    -- Each spoken token's sound key, worked out once rather than per wine.
    select coalesce(array_agg(public.sound_key(x) order by o), '{}') into tok_sounds
    from unnest(toks) with ordinality as u(x, o);

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

    if coalesce(array_length(skels, 1), 0) > 0 then
      ids := ids || array(
        select c.id from public.wines_catalog c
        where c.sound_skel_words && skels
          and c.verification_status not in ('implausible', 'needs_review')
        limit 200
      );
    end if;

    if coalesce(array_length(ids, 1), 0) = 0 then return; end if;

    return query
    select s.producer, s.wine_name, s.region, s.score, s.colour, s.grape, s.style from (
      select c.producer, c.wine_name, c.region, c.hit_count, c.colour, c.grape, c.style,
             (coalesce((
               select sum(greatest(
                 word_similarity(x.tok, c.display_norm),
                 word_similarity(x.ksound, c.display_sound)
               ))
               from unnest(toks, tok_sounds) as x(tok, ksound)
             ), 0)
             + coalesce((
               select sum(least(1.0, (length(k) - 1) * 0.5))
               from unnest(skels) as k
               where k = any(c.sound_skel_words)
             ), 0))::real as score
      from public.wines_catalog c
      where c.id = any(ids)
    ) s
    where s.score > 0.6
    order by s.score desc, s.hit_count desc
    limit greatest(1, least(lim, 25));
  end;
$function$;

grant execute on function public.catalog_sounds_like(text, integer) to anon, authenticated, service_role;
