-- Voice: find the wine someone meant when speech-to-text mangles it.
--
-- Speech-to-text turns French and Italian sounds into English words —
-- "Roc de Cambes" → "roc do comb", "Clos de Vougeot" → "clout de vue joe",
-- "Sassicaia" → "sassy kaya" — so the vowels and word breaks never line up and
-- the sound-alike search missed them. A word's consonant "skeleton" survives:
-- comb / Cambes → kmb, vue joe / Vougeot → bj, sassy kaya / Sassicaia → sk.
-- Tested 2026-11-26 on 15 typical mishearings: the right wine reached the
-- candidate list for 14 (was 12).

-- 1) The skeleton of a name: its sound key, soft g as j, French silent endings
--    after r/n dropped (Sinards → sinar), vowels removed except at the start of
--    a word, doubled letters collapsed.
create or replace function public.sound_skel(t text)
returns text
language sql
immutable parallel safe
as $$
  select regexp_replace(
           regexp_replace(
             regexp_replace(
               regexp_replace(public.sound_key(t), 'g([ei])', 'j\1', 'g'),
               '([rn])[dts]+\M', '\1', 'g'),
             '\Y[aeiou]+', '', 'g'),
           '([a-z])\1+', '\1', 'g');
$$;

-- 2) Each catalogue wine's word skeletons, kept with the row and indexed.
alter table public.wines_catalog
  add column if not exists sound_skel_words text[]
  generated always as (string_to_array(public.sound_skel(display || ' ' || coalesce(match_extra, '')), ' ')) stored;

create index if not exists wines_catalog_sound_skel_words_gin
  on public.wines_catalog using gin (sound_skel_words);

-- 3) The sound-alike search gains a skeleton channel: a spoken word (3+
--    consonants) or two neighbouring spoken words run together (2+) that match
--    a catalogue word's skeleton add that wine to the candidates and lift its
--    score — longer skeletons count for more.
drop function if exists public.catalog_sounds_like(text, integer);

create function public.catalog_sounds_like(q text, lim integer default 12)
 returns table(producer text, wine_name text, region text, score real, colour text, grape text, style text)
 language plpgsql
as $function$
  declare
    words text[];
    toks text[];
    skels text[] := '{}';
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
        limit 600
      );
    end if;

    if coalesce(array_length(ids, 1), 0) = 0 then return; end if;

    return query
    select s.producer, s.wine_name, s.region, s.score, s.colour, s.grape, s.style from (
      select c.producer, c.wine_name, c.region, c.hit_count, c.colour, c.grape, c.style,
             (coalesce((
               select sum(greatest(
                 word_similarity(x.tok, public.f_unaccent(lower(c.display))),
                 word_similarity(public.sound_key(x.tok), public.sound_key(c.display || ' ' || coalesce(c.match_extra, '')))
               ))
               from unnest(toks) as x(tok)
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
grant execute on function public.sound_skel(text) to anon, authenticated, service_role;
