-- Sound-alike matching + winemaker aliases for the voice "sounds like" lookup.
--
-- 1. sound_key(): folds spellings that SOUND the same onto one form, so
--    dictation errors still land: v≈b, c/q≈k (soft c≈s), ph≈f, z≈s, y≈i,
--    French endings (-et/-ai/-ay/-ez/-er ≈ e, eau/au ≈ o, silent final s/t/d/x),
--    doubled letters collapsed. "Pontay Kanay" ≈ "Pontet-Canet",
--    "Ebensady" ≈ "Eben Sadie".
-- 2. producer_aliases: names people SAY for an estate (usually the winemaker):
--    "Eben Sadie" → Sadie Family Wines. Copied onto each catalogue row's
--    match_extra (with the alias and producer also written as one joined word,
--    because speech recognition often merges words: "Ebensady").
-- 3. catalog_sounds_like() now gathers candidates by BOTH the plain spelling and
--    the sound key, and scores each spoken word by whichever matches better.
--    Spoken word pairs are also tried joined ("eben"+"sadie").

create or replace function public.sound_key(t text)
returns text language plpgsql immutable parallel safe as $$
declare s text;
begin
  s := public.f_unaccent(lower(coalesce(t, '')));
  s := regexp_replace(s, '[^a-z0-9]+', ' ', 'g');
  s := regexp_replace(s, 'eaux?|aux?', 'o', 'g');
  s := regexp_replace(s, 'ph', 'f', 'g');
  s := regexp_replace(s, 'qu', 'k', 'g');
  s := regexp_replace(s, 'gn', 'ni', 'g');
  s := regexp_replace(s, 'c([eiy])', 's\1', 'g');
  s := regexp_replace(s, '[cq]', 'k', 'g');
  s := regexp_replace(s, 'v', 'b', 'g');
  s := regexp_replace(s, 'z', 's', 'g');
  s := regexp_replace(s, 'x', 'ks', 'g');
  s := regexp_replace(s, 'y', 'i', 'g');
  s := regexp_replace(s, '(ai|ei|et|es|er)\M', 'e', 'g');
  s := regexp_replace(s, 'ie\M', 'i', 'g');
  s := regexp_replace(s, '([aeiou])[stdk]+\M', '\1', 'g');
  s := regexp_replace(s, '(^|[^s])h', '\1', 'g');
  s := regexp_replace(s, '([a-z])\1+', '\1', 'g');
  return btrim(regexp_replace(s, '\s+', ' ', 'g'));
end;
$$;

-- Names people say for an estate. `producer` is matched as a fragment of the
-- catalogue producer (accent/case-insensitive), so "Sadie Family" covers
-- "Sadie Family Wines". Add rows any time; the trigger below updates the catalogue.
create table if not exists public.producer_aliases (
  alias text primary key,
  producer text not null,
  created_at timestamptz not null default now()
);
alter table public.producer_aliases enable row level security;

alter table public.wines_catalog add column if not exists match_extra text;

create or replace function public.catalog_match_extra(p_producer text)
returns text language sql stable as $$
  select btrim(
    replace(coalesce(p_producer, ''), ' ', '') || ' ' ||
    coalesce((
      select string_agg(pa.alias || ' ' || replace(pa.alias, ' ', ''), ' ')
      from public.producer_aliases pa
      where public.f_unaccent(lower(p_producer)) like '%' || public.f_unaccent(lower(pa.producer)) || '%'
    ), '')
  );
$$;

create or replace function public.wines_catalog_set_match_extra()
returns trigger language plpgsql as $$
begin
  new.match_extra := public.catalog_match_extra(new.producer);
  return new;
end;
$$;
drop trigger if exists wines_catalog_match_extra on public.wines_catalog;
create trigger wines_catalog_match_extra
  before insert or update of producer on public.wines_catalog
  for each row execute function public.wines_catalog_set_match_extra();

create or replace function public.producer_aliases_refresh()
returns trigger language plpgsql as $$
declare p text := coalesce(new.producer, old.producer);
begin
  update public.wines_catalog c
     set match_extra = public.catalog_match_extra(c.producer)
   where public.f_unaccent(lower(c.producer)) like '%' || public.f_unaccent(lower(p)) || '%';
  return null;
end;
$$;
drop trigger if exists producer_aliases_refresh on public.producer_aliases;
create trigger producer_aliases_refresh
  after insert or update or delete on public.producer_aliases
  for each row execute function public.producer_aliases_refresh();

insert into public.producer_aliases (alias, producer) values
  ('eben sadie', 'Sadie Family'),
  ('manfred krankl', 'Sine Qua Non'),
  ('krankl', 'Sine Qua Non'),
  ('gianfranco soldera', 'Case Basse'),
  ('soldera', 'Case Basse'),
  ('emmanuel reynaud', 'Rayas'),
  ('jacques reynaud', 'Rayas'),
  ('aubert de villaine', 'Romanée-Conti'),
  ('drc', 'Romanée-Conti'),
  ('lalou bize-leroy', 'Leroy'),
  ('anne-claude leflaive', 'Leflaive'),
  ('dominique lafon', 'Comtes Lafon'),
  ('jacques seysses', 'Dujac'),
  ('jeremy seysses', 'Dujac'),
  ('anselme selosse', 'Selosse'),
  ('chris alheit', 'Alheit'),
  ('andrea mullineux', 'Mullineux'),
  ('chris mullineux', 'Mullineux'),
  ('craig hawkins', 'Testalonga'),
  ('duncan savage', 'Savage'),
  ('peter-allan finlayson', 'Crystallum'),
  ('adi badenhorst', 'Badenhorst'),
  ('donovan rall', 'Rall'),
  ('elisabetta foradori', 'Foradori'),
  ('ted lemon', 'Littorai'),
  ('cathy corison', 'Corison'),
  ('randall grahm', 'Bonny Doon'),
  ('abe schoener', 'Scholium'),
  ('morgan twain-peterson', 'Bedrock'),
  ('paul draper', 'Ridge'),
  ('bill harlan', 'Harlan'),
  ('justin smith', 'Saxum'),
  ('peter gago', 'Penfolds'),
  ('ron laughton', 'Jasper Hill'),
  ('tim mondavi', 'Continuum')
on conflict (alias) do nothing;

-- One-off fill for existing rows (the insert trigger covers new ones).
update public.wines_catalog set match_extra = public.catalog_match_extra(producer);

create index if not exists wines_catalog_sound_trgm
  on public.wines_catalog
  using gin (public.sound_key(display || ' ' || coalesce(match_extra, '')) gin_trgm_ops);

create or replace function public.catalog_sounds_like(q text, lim integer default 12)
returns table (producer text, wine_name text, region text, score real)
language plpgsql volatile as $$
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

  -- Single words (3+ letters) plus each adjacent pair joined ("eben"+"sadie").
  select coalesce(array_agg(distinct w), '{}') into toks
  from unnest(words) as w where length(w) >= 3;
  for i in 1 .. coalesce(array_length(words, 1), 0) - 1 loop
    if length(words[i] || words[i + 1]) >= 5 then
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
  select s.producer, s.wine_name, s.region, s.score from (
    select c.producer, c.wine_name, c.region, c.hit_count,
           sum(greatest(
             word_similarity(x.tok, public.f_unaccent(lower(c.display))),
             word_similarity(public.sound_key(x.tok), public.sound_key(c.display || ' ' || coalesce(c.match_extra, '')))
           ))::real as score
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
grant execute on function public.sound_key(text) to anon, authenticated, service_role;
