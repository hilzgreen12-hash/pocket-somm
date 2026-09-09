-- Catalog de-duplication + prevention.
--
-- Near-duplicate rows had slipped into wines_catalog because the search_key
-- unique constraint only caught EXACT normalised matches — it missed the same
-- wine written with a bracketed producer echo ("… (Château Laforge)"), accent /
-- punctuation variants, or a large-format bottle size ("… Magnum") that is really
-- the same wine (size is chosen separately at input, not part of identity).
--
-- This migration:
--   1. defines the canonical merge key (producer-echo brackets + accents +
--      punctuation + large-format sizes collapsed; genuine cuvée words kept),
--   2. merges any remaining duplicate clusters (keep best row, fold hit_count),
--   3. rewrites every search_key to that canonical key,
--   4. installs a trigger so future writes normalise to it and the unique index
--      rejects/absorbs variants automatically — no edge-function change needed.

-- 1) Canonical key ---------------------------------------------------------------
create or replace function public._catalog_merge_key(producer text, wine_name text)
returns text language sql immutable as $$
  select trim(regexp_replace(
    regexp_replace(   -- drop large-format bottle-size words (size is a separate field)
      regexp_replace( -- punctuation -> space
        public.f_unaccent(lower(
          coalesce(producer,'') || ' ' ||
          coalesce(
            case  -- drop a producer-echo parenthetical; keep genuine qualifiers (e.g. "blanc")
              when public.f_unaccent(lower(coalesce((regexp_match(wine_name,'\((.*?)\)'))[1],''))) <> ''
               and position(
                     trim(regexp_replace(regexp_replace(public.f_unaccent(lower((regexp_match(wine_name,'\((.*?)\)'))[1])),'[^a-z0-9 ]',' ','g'),'\s+',' ','g'))
                     in
                     trim(regexp_replace(regexp_replace(public.f_unaccent(lower(coalesce(producer,''))),'[^a-z0-9 ]',' ','g'),'\s+',' ','g'))
                   ) > 0
              then regexp_replace(wine_name, '\s*\(.*?\)\s*', ' ', 'g')
              else wine_name
            end, '')
        )),
        '[^a-z0-9 ]', ' ', 'g'),
      '\y(magnums?|jeroboams?|rehoboam|mathusalem|methuselah|salmanazar|balthazar|nebuchadnezzar)\y', ' ', 'g'),
    '\s+', ' ', 'g'));
$$;

-- 2) Merge any remaining duplicate clusters by that key. Keeper = Wine-Searcher-
--    verified first, else the shortest/cleanest display, else most-hit. Its
--    hit_count absorbs the cluster's total; the rest are deleted. Idempotent, and
--    written as two self-contained statements (no temp table) so it runs the same
--    whether applied by the migration runner or pasted into the SQL editor.
--    NB: the UPDATE must run before the DELETE so the folded hit_count still
--    includes the rows about to be removed.
update public.wines_catalog c
set hit_count = agg.cluster_hits, updated_at = now()
from (
  select mkey,
         sum(hit_count) as cluster_hits,
         count(*)       as cluster_n,
         (array_agg(id order by (ws_wine_id is not null) desc, length(display), hit_count desc))[1] as keeper_id
  from (
    select id, display, ws_wine_id, hit_count, public._catalog_merge_key(producer, wine_name) as mkey
    from public.wines_catalog
  ) k
  group by mkey
) agg
where c.id = agg.keeper_id and agg.cluster_n > 1;

delete from public.wines_catalog c
using (
  select mkey,
         (array_agg(id order by (ws_wine_id is not null) desc, length(display), hit_count desc))[1] as keeper_id
  from (
    select id, display, ws_wine_id, hit_count, public._catalog_merge_key(producer, wine_name) as mkey
    from public.wines_catalog
  ) k
  group by mkey
  having count(*) > 1
) agg
where public._catalog_merge_key(c.producer, c.wine_name) = agg.mkey
  and c.id <> agg.keeper_id;

-- 3) Rewrite every search_key to the canonical key. Drop + re-add the unique
--    constraint around the bulk update so there's no transient-collision risk;
--    the re-add doubles as a safety check that step 2 left no duplicates.
do $$
declare cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.wines_catalog'::regclass
    and contype = 'u'
    and conkey = array[(select attnum from pg_attribute
                        where attrelid = 'public.wines_catalog'::regclass and attname = 'search_key')];
  if cname is not null then
    execute format('alter table public.wines_catalog drop constraint %I', cname);
  end if;
end $$;

update public.wines_catalog
  set search_key = public._catalog_merge_key(producer, wine_name);

alter table public.wines_catalog
  add constraint wines_catalog_search_key_key unique (search_key);

-- 4) Enforce on every future insert/update so variants can never re-enter. The
--    seed/organic upserts already use ON CONFLICT (search_key) DO NOTHING, so a
--    normalised collision is simply absorbed.
create or replace function public.wines_catalog_set_search_key()
returns trigger language plpgsql as $$
begin
  new.search_key := public._catalog_merge_key(new.producer, new.wine_name);
  return new;
end $$;

drop trigger if exists trg_wines_catalog_search_key on public.wines_catalog;
create trigger trg_wines_catalog_search_key
  before insert or update of producer, wine_name on public.wines_catalog
  for each row execute function public.wines_catalog_set_search_key();
