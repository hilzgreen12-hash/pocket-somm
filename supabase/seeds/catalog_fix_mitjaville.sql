-- ============================================================================
-- wines_catalog fix — Mitjaville family (Roc de Cambes) vs Tertre Rôteboeuf
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent (search_key auto-normalises via the
-- BEFORE INSERT/UPDATE trigger; inserts use ON CONFLICT DO NOTHING).
--
-- Problem: a scan stored "Roc de Cambes" as the PRODUCER (producer='Château Roc de
-- Cambes', wine_name=null). Roc de Cambes (Côtes de Bourg) is the WINE; the producer
-- is the Mitjaville family — Françoise et Émilie Mitjaville.
--
-- Château Tertre Rôteboeuf (Saint-Émilion) is a SEPARATE producer, sold under the
-- château name — it must NOT be grouped under Mitjaville. Recorded here on its own.
-- ============================================================================

-- 1) Correct the mis-attributed row (wine name was stored as the producer). The
--    search_key trigger recomputes on the producer/wine_name change; display is set
--    here explicitly (the trigger only touches search_key).
update public.wines_catalog
set producer   = 'Françoise et Émilie Mitjaville',
    wine_name  = 'Roc de Cambes',
    region     = 'Côtes de Bourg, Bordeaux',
    grape      = 'Merlot/Cabernet Sauvignon/Cabernet Franc',
    style      = 'Red',
    display    = 'Françoise et Émilie Mitjaville Roc de Cambes',
    updated_at = now()
where producer = 'Château Roc de Cambes' and wine_name is null;

-- 2) The rest of the Bourg estate under the SAME producer (Françoise et Émilie
--    Mitjaville). Deliberately excludes Château Tertre Rôteboeuf.
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Françoise et Émilie Mitjaville', 'Domaine de Cambes', 'Côtes de Bourg, Bordeaux', 'Merlot/Cabernet Sauvignon/Cabernet Franc', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- 3) Château Tertre Rôteboeuf — its OWN producer (Saint-Émilion), NOT Mitjaville.
--    The grand vin is sold under the château name (wine_name null); Les Astéries is
--    its separate Saint-Émilion cuvée.
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Château Tertre Rôteboeuf', null,            'Saint-Émilion Grand Cru, Bordeaux', 'Merlot/Cabernet Franc', 'Red'),
  ('Château Tertre Rôteboeuf', 'Les Astéries',  'Saint-Émilion Grand Cru, Bordeaux', 'Merlot/Cabernet Franc', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- Verify:
--   select producer, wine_name, region, style from public.wines_catalog
--   where producer ilike '%mitjaville%' or producer ilike '%rôteboeuf%' or wine_name ilike '%cambes%'
--   order by producer, wine_name;
