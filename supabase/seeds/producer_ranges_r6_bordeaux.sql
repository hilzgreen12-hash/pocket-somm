-- Producer ranges round 6: Bordeaux. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- CHÂTEAU LATOUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Latour', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-latour.html
  ('Château Latour', 'Les Forts de Latour', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-latour.html
  ('Château Latour', 'Pauillac de Latour', 'Pauillac, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=107176
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LAFITE ROTHSCHILD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Lafite Rothschild', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-lafite-rothschild.html
  ('Château Lafite Rothschild', 'Carruades de Lafite', 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-lafite-rothschild.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MOUTON ROTHSCHILD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Mouton Rothschild', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-mouton-rothschild.html
  ('Château Mouton Rothschild', 'Le Petit Mouton de Mouton Rothschild', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-mouton-rothschild.html
  ('Château Mouton Rothschild', 'Aile d''Argent', 'Bordeaux, France', null, 'White')  -- https://www.millesima.co.uk/producer-chateau-mouton-rothschild.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PICHON BARON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Pichon Baron', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-pichon-longueville-baron.html
  ('Château Pichon Baron', 'Les Griffons de Pichon Baron', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-pichon-longueville-baron.html
  ('Château Pichon Baron', 'Les Tourelles de Longueville', 'Pauillac, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=47949
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PICHON LONGUEVILLE COMTESSE DE LALANDE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Pichon Longueville Comtesse de Lalande', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-pichon-longueville-comtesse-de-lalande.html
  ('Château Pichon Longueville Comtesse de Lalande', 'Réserve de Pichon Comtesse', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-pichon-longueville-comtesse-de-lalande.html
  ('Château Pichon Longueville Comtesse de Lalande', 'Réserve de la Comtesse', 'Pauillac, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=46017
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LÉOVILLE LAS CASES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Léoville Las Cases', null, 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-leoville-las-cases.html
  ('Château Léoville Las Cases', 'Le Petit Lion du Marquis de Las Cases', 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-leoville-las-cases.html
  ('Château Léoville Las Cases', 'Clos du Marquis', 'Saint-Julien, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117124
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LÉOVILLE POYFERRÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Léoville Poyferré', null, 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-leoville-poyferre.html
  ('Château Léoville Poyferré', 'Pavillon de Léoville Poyferré', 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-leoville-poyferre.html
  ('Château Léoville Poyferré', 'Moulin Riche', 'Saint-Julien, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=66283
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LÉOVILLE BARTON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Léoville Barton', null, 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-leoville-barton.html
  ('Château Léoville Barton', 'La Réserve de Léoville Barton', 'Saint-Julien, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=76259
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LANGOA BARTON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Langoa Barton', null, 'Saint-Julien, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-langoa-barton.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DUCRU-BEAUCAILLOU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Ducru-Beaucaillou', null, 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-ducru-beaucaillou.html
  ('Château Ducru-Beaucaillou', 'La Croix Ducru-Beaucaillou', 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-ducru-beaucaillou.html
  ('Château Ducru-Beaucaillou', 'Le Petit Ducru de Ducru-Beaucaillou', 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-ducru-beaucaillou.html
  ('Château Ducru-Beaucaillou', 'Madame de Beaucaillou', 'Haut-Médoc, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-ducru-beaucaillou.html
  ('Château Ducru-Beaucaillou', 'La Croix de Beaucaillou', 'Saint-Julien, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=40292
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GRUAUD LAROSE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Gruaud Larose', null, 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-gruaud-larose.html
  ('Château Gruaud Larose', 'Sarget de Gruaud Larose', 'Saint-Julien, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-gruaud-larose.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BEYCHEVELLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Beychevelle', null, 'Saint-Julien, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-beychevelle.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TALBOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Talbot', null, 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-talbot.html
  ('Château Talbot', 'Connétable Talbot', 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-talbot.html
  ('Château Talbot', 'Caillou Blanc', 'Bordeaux, France', null, 'White')  -- https://www.millesima.co.uk/producer-chateau-talbot.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BRANAIRE-DUCRU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Branaire-Ducru', null, 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-branaire-ducru.html
  ('Château Branaire-Ducru', 'Duluc de Branaire-Ducru', 'Saint-Julien, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-branaire-ducru.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LAGRANGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Lagrange', null, 'Saint-Julien, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-lagrange.html
  ('Château Lagrange', 'Les Fiefs de Lagrange', 'Saint-Julien, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-lagrange.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SAINT-PIERRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Saint-Pierre', null, 'Saint-Julien, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-saint-pierre.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU COS D'ESTOURNEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Cos d''Estournel', null, 'Saint-Estèphe, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-cos-d-estournel.html
  ('Château Cos d''Estournel', 'Les Pagodes de Cos', 'Saint-Estèphe, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-cos-d-estournel.html
  ('Château Cos d''Estournel', 'G d''Estournel', 'Médoc, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-cos-d-estournel.html
  ('Château Cos d''Estournel', 'Cos d''Estournel Blanc', 'Bordeaux, France', 'Sauvignon Blanc, Semillon', 'White'),  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117182
  ('Château Cos d''Estournel', 'Les Pagodes de Cos Blanc', 'Bordeaux, France', null, 'White')  -- https://www.farrvintners.com/wine.php?wine=120346
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MONTROSE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Montrose', null, 'Saint-Estèphe, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-montrose.html
  ('Château Montrose', 'La Dame de Montrose', 'Saint-Estèphe, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-montrose.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CALON-SÉGUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Calon-Ségur', null, 'Saint-Estèphe, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-calon-segur.html
  ('Château Calon-Ségur', 'Le Marquis de Calon Ségur', 'Saint-Estèphe, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-calon-segur.html
  ('Château Calon-Ségur', 'C de Calon Ségur', 'Saint-Estèphe, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-calon-segur.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU COS LABORY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Cos Labory', null, 'Saint-Estèphe, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-cos-labory.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LAFON-ROCHET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Lafon-Rochet', null, 'Saint-Estèphe, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-lafon-rochet.html
  ('Château Lafon-Rochet', 'Les Pèlerins de Lafon-Rochet', 'Saint-Estèphe, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-lafon-rochet.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LYNCH-BAGES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Lynch-Bages', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-lynch-bages.html
  ('Château Lynch-Bages', 'Echo de Lynch-Bages', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-lynch-bages.html
  ('Château Lynch-Bages', 'Blanc de Lynch-Bages', 'Bordeaux, France', null, 'White')  -- https://www.millesima.co.uk/producer-chateau-lynch-bages.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PONTET-CANET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Pontet-Canet', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-pontet-canet.html
  ('Château Pontet-Canet', 'Les Hauts de Pontet-Canet', 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-pontet-canet.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DUHART-MILON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Duhart-Milon', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-duhart-milon.html
  ('Château Duhart-Milon', 'Moulin de Duhart', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-duhart-milon.html
  ('Château Duhart-Milon', 'Duhart-Milon Blanc', 'Bordeaux, France', null, 'White')  -- https://www.farrvintners.com/wine.php?wine=108672
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GRAND-PUY-LACOSTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Grand-Puy-Lacoste', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-grand-puy-lacoste.html
  ('Château Grand-Puy-Lacoste', 'Lacoste-Borie', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-grand-puy-lacoste.html
  ('Château Grand-Puy-Lacoste', 'Lacoste-Borie Vignes du Parc', 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-grand-puy-lacoste.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GRAND-PUY-DUCASSE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Grand-Puy-Ducasse', null, 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-grand-puy-ducasse.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU D'ARMAILHAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château d''Armailhac', null, 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-d-armailhac.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CLERC MILON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Clerc Milon', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-clerc-milon.html
  ('Château Clerc Milon', 'Pastourelle de Clerc Milon', 'Pauillac, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=50195
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BATAILLEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Batailley', null, 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-batailley.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU HAUT-BATAILLEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Haut-Batailley', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-haut-batailley.html
  ('Château Haut-Batailley', 'Verso', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-haut-batailley.html
  ('Château Haut-Batailley', 'Nomade de Haut-Batailley', 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-haut-batailley.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CROIZET-BAGES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Croizet-Bages', null, 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-croizet-bages.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LYNCH-MOUSSAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Lynch-Moussas', null, 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-lynch-moussas.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PÉDESCLAUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Pédesclaux', null, 'Pauillac, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-pedesclaux.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU HAUT-BAGES LIBÉRAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Haut-Bages Libéral', null, 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.millesima.co.uk/producer-chateau-haut-bages-liberal.html
  ('Château Haut-Bages Libéral', 'Ceres', 'Haut-Médoc, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-haut-bages-liberal.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MARGAUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Margaux', null, 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.chateau-margaux.com/en/
  ('Château Margaux', 'Pavillon Rouge du Château Margaux', 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.chateau-margaux.com/en/
  ('Château Margaux', 'Margaux du Château Margaux', 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.chateau-margaux.com/en/
  ('Château Margaux', 'Pavillon Blanc du Château Margaux', 'Bordeaux, France', null, 'White'),  -- https://www.chateau-margaux.com/en/
  ('Château Margaux', 'Pavillon Blanc Second Vin', 'Bordeaux, France', null, 'White')  -- https://www.farrvintners.com/winelist_csv.php?output=txt
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PALMER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Palmer', null, 'Margaux, Bordeaux, France', 'Merlot, Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://www.chateau-palmer.com/en/wine-library
  ('Château Palmer', 'Alter Ego', 'Margaux, Bordeaux, France', 'Merlot, Cabernet Sauvignon, Petit Verdot', 'Red')  -- https://www.chateau-palmer.com/en/wine-library
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU KIRWAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Kirwan', null, 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.chateau-kirwan.com/en/
  ('Château Kirwan', 'Charmes de Kirwan', 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.chateau-kirwan.com/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LASCOMBES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Lascombes', null, 'Margaux, Bordeaux, France', 'Cabernet Sauvignon', 'Red'),  -- https://www.chateau-lascombes.com/en/
  ('Château Lascombes', 'Lascombes La Côte', 'Margaux, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/winelist_csv.php?output=txt
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MALESCOT SAINT-EXUPÉRY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Malescot Saint-Exupéry', null, 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.malescot.com/en/our-wines/
  ('Château Malescot Saint-Exupéry', 'La Dame de Malescot', 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.malescot.com/en/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PRIEURÉ-LICHINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Prieuré-Lichine', null, 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.prieure-lichine.fr/en/
  ('Château Prieuré-Lichine', 'Confidences de Prieuré-Lichine', 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.prieure-lichine.fr/en/
  ('Château Prieuré-Lichine', 'Le Blanc du Château Prieuré-Lichine', 'Bordeaux, France', null, 'White')  -- https://www.prieure-lichine.fr/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CANTEMERLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Cantemerle', null, 'Haut-Médoc, Bordeaux, France', 'Cabernet Sauvignon, Merlot, Petit Verdot, Cabernet Franc', 'Red'),  -- https://www.chateau-cantemerle.com/en/
  ('Château Cantemerle', 'Les Allées de Cantemerle', 'Haut-Médoc, Bordeaux, France', null, 'Red')  -- https://www.chateau-cantemerle.com/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BELGRAVE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Belgrave', null, 'Haut-Médoc, Bordeaux, France', null, 'Red'),  -- https://www.chateau-belgrave.com/en/
  ('Château Belgrave', 'Diane de Belgrave', 'Haut-Médoc, Bordeaux, France', null, 'Red')  -- https://www.chateau-belgrave.com/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DAUZAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Dauzac', null, 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.chateaudauzac.com/en/vins/aurore-de-dauzac/
  ('Château Dauzac', 'Aurore de Dauzac', 'Margaux, Bordeaux, France', 'Cabernet Sauvignon, Merlot, Petit Verdot', 'Red'),  -- https://www.chateaudauzac.com/en/vins/aurore-de-dauzac/
  ('Château Dauzac', 'Haut-Médoc de Dauzac', 'Haut-Médoc, Bordeaux, France', null, 'Red'),  -- https://www.chateaudauzac.com/en/vins/aurore-de-dauzac/
  ('Château Dauzac', 'D de Dauzac Blanc', 'Bordeaux, France', null, 'White'),  -- https://www.chateaudauzac.com/en/vins/aurore-de-dauzac/
  ('Château Dauzac', 'D de Dauzac Rouge', 'Bordeaux, France', null, 'Red')  -- https://www.chateaudauzac.com/en/vins/aurore-de-dauzac/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA LAGUNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Lagune', null, 'Haut-Médoc, Bordeaux, France', null, 'Red'),  -- https://chateau-lalagune.com/?p=135
  ('Château La Lagune', 'Moulin du Château La Lagune', 'Haut-Médoc, Bordeaux, France', 'Merlot', 'Red')  -- https://chateau-lalagune.com/?p=135
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GISCOURS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Giscours', 'La Sirène de Giscours', 'Margaux, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.millesima-usa.com/la-sirene-de-giscours-2024-c-cc-6.html
  ('Château Giscours', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.farrvintners.com/winelist_csv.php?output=txt
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU RAUZAN-SÉGLA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Rauzan-Ségla', null, 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.farrvintners.com/winelist.php?producer=3533
  ('Château Rauzan-Ségla', 'Ségla', 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.farrvintners.com/winelist.php?producer=3533
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BRANE-CANTENAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Brane-Cantenac', null, 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.farrvintners.com/winelist_csv.php?output=txt
  ('Château Brane-Cantenac', 'Baron de Brane', 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.farrvintners.com/winelist_csv.php?output=txt
  ('Château Brane-Cantenac', 'Brane Cantenac Blanc', 'Bordeaux, France', null, 'White')  -- https://www.farrvintners.com/winelist_csv.php?output=txt
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CANTENAC BROWN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Cantenac Brown', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.farrvintners.com/winelist_csv.php?output=txt
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DURFORT-VIVENS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Durfort-Vivens', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.farrvintners.com/winelist_csv.php?output=txt
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DU TERTRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château du Tertre', null, 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.farrvintners.com/winelist_csv.php?output=txt
  ('Château du Tertre', 'Hauts du Tertre', 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.farrvintners.com/winelist_csv.php?output=txt
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU D'ISSAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château d''Issan', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.farrvintners.com/winelist_csv.php?output=txt
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GAZIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Gazin', 'L''Hospitalet de Gazin', 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.moueix.com/en/pomerol/lhospitalet-de-gazin
  ('Château Gazin', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.millesima-usa.com/producer-chateau-gazin.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIEUX CHÂTEAU CERTAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Vieux Château Certan', 'La Gravette de Certan', 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.bbr.com/products-20208124171-2020-la-gravette-de-certan-pomerol-bordeaux
  ('Vieux Château Certan', null, 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red')  -- https://www.millesima-usa.com/producer-vieux-chateau-certan.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FIGEAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Figeac', 'Petit-Figeac', 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.millesima-usa.com/petit-figeac-2022.html
  ('Château Figeac', null, 'Saint-Émilion, Bordeaux, France', 'Cabernet Sauvignon, Cabernet Franc, Merlot', 'Red')  -- https://www.millesima-usa.com/chateau-figeac-2022.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TROTANOY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Trotanoy', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red'),  -- https://www.moueix.com/en/pomerol/trotanoy
  ('Château Trotanoy', 'Espérance de Trotanoy', 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.moueix.com/en/pomerol/esperance-de-trotanoy
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BELAIR-MONANGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Belair-Monange', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red'),  -- https://www.moueix.com/en/saint-emilion/belair-monange
  ('Château Belair-Monange', 'Annonce de Bélair-Monange', 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.moueix.com/en/saint-emilion/annonce
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU ANGÉLUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Angélus', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red'),  -- https://www.millesima-usa.com/chateau-angelus-2022.html
  ('Château Angélus', 'Le Carillon d''Angélus', 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.millesima-usa.com/carillon-d-angelus-2022.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CHEVAL BLANC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Cheval Blanc', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.millesima-usa.com/chateau-cheval-blanc-2022.html
  ('Château Cheval Blanc', 'Le Petit Cheval', 'Saint-Émilion, Bordeaux, France', null, 'Red'),  -- https://www.millesima-usa.com/le-petit-cheval-2022.html
  ('Château Cheval Blanc', 'Le Petit Cheval Blanc', 'Bordeaux, France', 'Sauvignon Blanc, Sémillon', 'White')  -- https://www.millesima-usa.com/le-petit-cheval-2022-1.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PAVIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Pavie', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.millesima-usa.com/chateau-pavie-2022.html
  ('Château Pavie', 'Arômes de Pavie', 'Saint-Émilion, Bordeaux, France', null, 'Red'),  -- https://www.millesima-usa.com/producer-chateau-pavie.html
  ('Château Pavie', 'Esprit de Pavie', 'Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=44262
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CANON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Canon', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red'),  -- https://www.millesima-usa.com/chateau-canon-2022.html
  ('Château Canon', 'Croix Canon', 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.bbr.com/products-20208104113-
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU AUSONE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Ausone', null, 'Saint-Émilion, Bordeaux, France', 'Cabernet Franc, Merlot', 'Red'),  -- https://www.millesima-usa.com/chateau-ausone-2022.html
  ('Château Ausone', 'Chapelle d''Ausone', 'Saint-Émilion, Bordeaux, France', 'Cabernet Franc', 'Red')  -- https://www.millesima-usa.com/producer-chateau-ausone.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU VALANDRAUD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Valandraud', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.millesima-usa.com/chateau-valandraud-2022.html
  ('Château Valandraud', 'Virginie de Valandraud', 'Saint-Émilion, Bordeaux, France', null, 'Red'),  -- https://www.millesima-usa.com/producer-chateau-valandraud.html
  ('Château Valandraud', 'Blanc de Valandraud', 'Bordeaux, France', null, 'White')  -- https://www.millesima-usa.com/producer-chateau-valandraud.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PÉTRUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Pétrus', null, 'Pomerol, Bordeaux, France', null, 'Red')  -- https://www.millesima-usa.com/petrus-2022.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU L'ÉGLISE-CLINET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château L''Église-Clinet', null, 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red'),  -- https://www.millesima-usa.com/producer-chateau-l-eglise-clinet.html
  ('Château L''Église-Clinet', 'La Petite Eglise', 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117144
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU L'ÉVANGILE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château L''Évangile', null, 'Pomerol, Bordeaux, France', null, 'Red'),  -- https://www.millesima-usa.com/producer-chateau-l-evangile.html
  ('Château L''Évangile', 'Blason de l''Évangile', 'Pomerol, Bordeaux, France', null, 'Red')  -- https://www.millesima-usa.com/producer-chateau-l-evangile.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA CONSEILLANTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Conseillante', null, 'Pomerol, Bordeaux, France', null, 'Red')  -- https://www.millesima-usa.com/producer-chateau-la-conseillante.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CLINET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Clinet', null, 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red')  -- https://www.millesima-usa.com/producer-chateau-clinet.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU NENIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Nenin', null, 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.millesima-usa.com/producer-chateau-nenin.html
  ('Château Nenin', 'La Fugue de Nénin', 'Pomerol, Bordeaux, France', null, 'Red')  -- https://www.millesima-usa.com/producer-chateau-nenin.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BEAUREGARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Beauregard', null, 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red')  -- https://www.millesima-usa.com/chateau-beauregard-2022.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LE PIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Le Pin', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.millesima-usa.com/producer-chateau-le-pin.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TROTTEVIEILLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Trottevieille', null, 'Saint-Émilion, Bordeaux, France', 'Cabernet Franc', 'Red')  -- https://www.millesima-usa.com/producer-chateau-trottevieille.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LAFLEUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Lafleur', null, 'Pomerol, Bordeaux, France', null, 'Red'),  -- https://wine.sothebys.com/blogs/producer/the-many-expressions-of-lafleur
  ('Château Lafleur', 'Pensées de Lafleur', 'Pomerol, Bordeaux, France', null, 'Red'),  -- https://wine.sothebys.com/blogs/producer/the-many-expressions-of-lafleur
  ('Château Lafleur', 'Champs Libres', 'Bordeaux, France', 'Sauvignon Blanc', 'White')  -- https://wine.sothebys.com/blogs/producer/the-many-expressions-of-lafleur
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU HAUT-BRION ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Haut-Brion', null, 'Pessac-Léognan, Bordeaux, France', null, 'Red'),  -- https://www.haut-brion.com/nos-vins/
  ('Château Haut-Brion', 'Blanc', 'Pessac-Léognan, Bordeaux, France', null, 'White'),  -- https://www.haut-brion.com/nos-vins/
  ('Château Haut-Brion', 'Le Clarence de Haut-Brion', 'Pessac-Léognan, Bordeaux, France', 'Merlot, Cabernet Sauvignon, Cabernet Franc, Petit Verdot', 'Red'),  -- https://www.bbr.com/products-20228014317-
  ('Château Haut-Brion', 'La Clarté de Haut-Brion', 'Pessac-Léognan, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'White')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117198
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA MISSION HAUT-BRION ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Mission Haut-Brion', null, 'Pessac-Léognan, Bordeaux, France', null, 'Red'),  -- https://www.mission-haut-brion.com/nos-vins/
  ('Château La Mission Haut-Brion', 'Blanc', 'Pessac-Léognan, Bordeaux, France', 'Sémillon', 'White'),  -- https://www.mission-haut-brion.com/nos-vins/
  ('Château La Mission Haut-Brion', 'La Chapelle de La Mission Haut-Brion', 'Pessac-Léognan, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117148
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SMITH HAUT LAFITTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Smith Haut Lafitte', null, 'Pessac-Léognan, Bordeaux, France', null, 'Red'),  -- https://www.smith-haut-lafitte.com/en/
  ('Château Smith Haut Lafitte', 'Blanc', 'Pessac-Léognan, Bordeaux, France', null, 'White'),  -- https://www.smith-haut-lafitte.com/en/
  ('Château Smith Haut Lafitte', 'Le Petit Haut Lafitte Rouge', 'Pessac-Léognan, Bordeaux, France', null, 'Red'),  -- https://www.smith-haut-lafitte.com/en/
  ('Château Smith Haut Lafitte', 'Le Petit Haut Lafitte Blanc', 'Pessac-Léognan, Bordeaux, France', null, 'White'),  -- https://www.smith-haut-lafitte.com/en/
  ('Château Smith Haut Lafitte', 'Les Hauts de Smith Rouge', 'Pessac-Léognan, Bordeaux, France', null, 'Red'),  -- https://www.smith-haut-lafitte.com/en/
  ('Château Smith Haut Lafitte', 'Les Hauts de Smith Blanc', 'Pessac-Léognan, Bordeaux, France', null, 'White')  -- https://www.smith-haut-lafitte.com/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE CHEVALIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Domaine de Chevalier', null, 'Pessac-Léognan, Bordeaux, France', 'Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot', 'Red'),  -- https://www.domainedechevalier.com/en/the-first-wine
  ('Domaine de Chevalier', 'Blanc', 'Pessac-Léognan, Bordeaux, France', null, 'White'),  -- https://www.domainedechevalier.com/en/the-first-wine
  ('Domaine de Chevalier', 'L''Esprit de Chevalier Rouge', 'Pessac-Léognan, Bordeaux, France', null, 'Red'),  -- https://www.domainedechevalier.com/en/lesprit-de-chevalier
  ('Domaine de Chevalier', 'L''Esprit de Chevalier Blanc', 'Pessac-Léognan, Bordeaux, France', null, 'White')  -- https://www.domainedechevalier.com/en/lesprit-de-chevalier
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU D'YQUEM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château d''Yquem', null, 'Sauternes, Bordeaux, France', null, 'Sweet'),  -- https://www.yquem.fr/en/
  ('Château d''Yquem', 'Y d''Yquem', 'Bordeaux, France', 'Sauvignon Blanc, Semillon', 'White')  -- https://www.farrvintners.com/wine.php?wine=119450
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GUIRAUD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Guiraud', null, 'Sauternes, Bordeaux, France', 'Sémillon, Sauvignon Blanc', 'Sweet'),  -- https://www.chateauguiraud.com/en/
  ('Château Guiraud', 'Petit Guiraud', 'Sauternes, Bordeaux, France', null, 'Sweet'),  -- https://www.chateauguiraud.com/en/
  ('Château Guiraud', 'G de Guiraud', 'Bordeaux, France', 'Sauvignon Blanc, Sémillon', 'White'),  -- https://www.chateauguiraud.com/en/
  ('Château Guiraud', 'Grand Vin Blanc Sec', 'Bordeaux, France', 'Sémillon, Sauvignon Blanc', 'White')  -- https://www.chateauguiraud.com/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LAMOTHE-VINCENT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Lamothe-Vincent', 'The Rosé', 'Bordeaux, France', null, 'Rosé'),  -- https://lamothe-vincent.com/en/the-wines/
  ('Château Lamothe-Vincent', 'The Reserves Red', 'Bordeaux, France', null, 'Red'),  -- https://lamothe-vincent.com/en/the-wines/
  ('Château Lamothe-Vincent', 'The Reserves White', 'Bordeaux, France', null, 'White'),  -- https://lamothe-vincent.com/en/the-wines/
  ('Château Lamothe-Vincent', 'Libertae', 'Bordeaux, France', 'Cabernet Sauvignon', 'Red'),  -- https://lamothe-vincent.com/en/the-wines/
  ('Château Lamothe-Vincent', 'The Heritage Red', 'Bordeaux, France', null, 'Red'),  -- https://lamothe-vincent.com/en/the-wines/
  ('Château Lamothe-Vincent', 'The Heritage White', 'Bordeaux, France', null, 'White')  -- https://lamothe-vincent.com/en/the-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOURTHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Dourthe', 'La Grande Cuvée Bordeaux Blanc', 'Bordeaux, France', 'Sauvignon Blanc', 'White'),  -- https://www.dourthe.com/en/entity/la-grande-cuvee/
  ('Dourthe', 'La Grande Cuvée Bordeaux Rouge', 'Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.dourthe.com/en/entity/la-grande-cuvee/
  ('Dourthe', 'La Grande Cuvée Bordeaux Rosé', 'Bordeaux, France', null, 'Rosé'),  -- https://www.dourthe.com/en/entity/la-grande-cuvee/
  ('Dourthe', 'La Grande Cuvée Médoc', 'Médoc, Bordeaux, France', null, 'Red'),  -- https://www.dourthe.com/en/entity/la-grande-cuvee/
  ('Dourthe', 'La Grande Cuvée Saint-Émilion', 'Saint-Émilion, Bordeaux, France', null, 'Red')  -- https://www.dourthe.com/en/entity/la-grande-cuvee/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CALVET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Calvet', 'Limited Release Cuvée du Cap Bordeaux', 'Bordeaux, France', 'Sauvignon Blanc', 'White'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Saint-Émilion Grand Cru', 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Château Roc Montalon Bordeaux Supérieur', 'Bordeaux, France', 'Merlot, Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Vieux Château des Jouans Saint-Émilion', 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Château Saint-Germain Bordeaux', 'Bordeaux, France', 'Merlot, Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Crémant de Bordeaux Brut', 'Bordeaux, France', 'Merlot, Sémillon', 'Sparkling'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Crémant de Bordeaux Brut Bio', 'Bordeaux, France', 'Merlot', 'Sparkling'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Crémant de Bordeaux Rosé', 'Bordeaux, France', 'Cabernet Franc, Merlot', 'Sparkling'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Crémant de Bordeaux Demi-Sec', 'Bordeaux, France', 'Merlot, Sémillon', 'Sparkling'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Crémant de Bordeaux Brut Blanc de Noirs', 'Bordeaux, France', 'Merlot', 'Sparkling'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Crémant de Bordeaux Blanc de Blancs', 'Bordeaux, France', 'Sémillon, Muscadelle', 'Sparkling'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Crémant de Bordeaux Extra Brut', 'Bordeaux, France', 'Merlot, Sémillon', 'Sparkling'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Crémant de Bordeaux Brut Rosé', 'Bordeaux, France', 'Merlot, Cabernet Franc', 'Sparkling'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Conversation Bordeaux Blanc', 'Bordeaux, France', 'Sauvignon Blanc', 'White'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Conversation Bordeaux Rouge', 'Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Réserve Bordeaux Blanc', 'Bordeaux, France', 'Sauvignon Blanc', 'White'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Réserve Bordeaux Rouge', 'Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Grande Réserve Bordeaux Supérieur', 'Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Prestige Bordeaux Blanc', 'Bordeaux, France', 'Sauvignon Blanc', 'White'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Prestige Bordeaux Rouge', 'Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Réserve du Ciron Sauternes', 'Sauternes, Bordeaux, France', 'Sémillon, Sauvignon Blanc, Muscadelle', 'Sweet'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Réserve des Remparts Saint-Émilion', 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Réserve de Canterane Graves', 'Graves, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Réserve des Jalles Haut-Médoc', 'Haut-Médoc, Bordeaux, France', 'Cabernet Sauvignon, Merlot, Cabernet Franc', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Réserve de l''Estey Médoc', 'Médoc, Bordeaux, France', 'Cabernet Sauvignon, Merlot, Petit Verdot', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Réserve de l''Île Margaux', 'Margaux, Bordeaux, France', 'Cabernet Sauvignon, Merlot, Malbec', 'Red'),  -- https://www.calvet.com/en/region/bordeaux/
  ('Calvet', 'Réserve de Saint-Jacques Pomerol', 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.calvet.com/en/region/bordeaux/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU HAUT-BAILLY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Haut-Bailly', 'Haut-Bailly II', 'Pessac-Léognan, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.bbr.com/products-20208037220-
  ('Château Haut-Bailly', null, 'Pessac-Léognan, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117040
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PAPE CLÉMENT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Pape Clément', null, 'Pessac-Léognan, Bordeaux, France', null, 'Red'),  -- https://www.premiumgrandscrus.com/en/106_chateau-pape-clement
  ('Château Pape Clément', 'Blanc', 'Pessac-Léognan, Bordeaux, France', 'Sauvignon Blanc, Sémillon', 'White'),  -- https://www.bbr.com/products-20218011521-
  ('Château Pape Clément', 'Le Clémentin de Pape Clément Blanc', 'Pessac-Léognan, Bordeaux, France', null, 'White')  -- https://www.premiumgrandscrus.com/en/106_chateau-pape-clement
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MALARTIC-LAGRAVIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Malartic-Lagravière', null, 'Pessac-Léognan, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.bbr.com/products-20211012677-
  ('Château Malartic-Lagravière', 'La Réserve de Malartic Rouge', 'Pessac-Léognan, Bordeaux, France', 'Merlot, Cabernet Sauvignon, Cabernet Franc, Petit Verdot', 'Red'),  -- https://www.walaclub.sg/product/752/chateau-malartic-lagraviere-la-reserve-de-malartic-pessac-leognan-rouge-2016
  ('Château Malartic-Lagravière', 'Blanc', 'Pessac-Léognan, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'White')  -- https://www.farrvintners.com/wine.php?wine=52855
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SUDUIRAUT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Suduiraut', null, 'Sauternes, Bordeaux, France', null, 'Sweet'),  -- https://www.vinatis.com/124_chateau-suduiraut
  ('Château Suduiraut', 'Lions de Suduiraut', 'Sauternes, Bordeaux, France', null, 'Sweet'),  -- https://www.vinatis.com/124_chateau-suduiraut
  ('Château Suduiraut', 'Castelnau de Suduiraut', 'Sauternes, Bordeaux, France', null, 'Sweet'),  -- https://www.vinatis.com/124_chateau-suduiraut
  ('Château Suduiraut', 'Vieilles Vignes', 'Bordeaux, France', null, 'White'),  -- https://www.vinatis.com/124_chateau-suduiraut
  ('Château Suduiraut', 'Le Blanc Sec de Suduiraut', 'Bordeaux, France', null, 'White')  -- https://www.vinatis.com/124_chateau-suduiraut
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BONNET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Bonnet', 'Blanc', 'Entre-Deux-Mers, Bordeaux, France', null, 'White'),  -- https://www.andrelurton.com/en/chateau/chateau-bonnet/
  ('Château Bonnet', 'Rouge', 'Bordeaux, France', null, 'Red'),  -- https://www.andrelurton.com/en/chateau/chateau-bonnet/
  ('Château Bonnet', 'Rosé', 'Bordeaux, France', null, 'Rosé'),  -- https://www.andrelurton.com/en/chateau/chateau-bonnet/
  ('Château Bonnet', 'Cuvée Eden Rouge', 'Bordeaux, France', null, 'Red'),  -- https://www.andrelurton.com/en/chateau/chateau-bonnet/
  ('Château Bonnet', 'Petit Bonnet Blanc', 'Entre-Deux-Mers, Bordeaux, France', null, 'White'),  -- https://www.andrelurton.com/en/chateau/chateau-bonnet/
  ('Château Bonnet', 'Petit Bonnet Rosé', 'Bordeaux, France', null, 'Rosé'),  -- https://www.andrelurton.com/en/chateau/chateau-bonnet/
  ('Château Bonnet', 'Réserve Blanc', 'Entre-Deux-Mers, Bordeaux, France', 'Sauvignon Blanc, Sémillon', 'White'),  -- https://www.andrelurton.com/en/chateau/chateau-bonnet/
  ('Château Bonnet', 'Réserve Rouge', 'Bordeaux, France', null, 'Red'),  -- https://www.andrelurton.com/en/chateau/chateau-bonnet/
  ('Château Bonnet', 'Divinus de Château Bonnet', 'Bordeaux, France', null, 'Red')  -- https://www.andrelurton.com/en/chateau/chateau-bonnet/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MOUTON CADET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Mouton Cadet', 'Rouge', 'Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Blanc', 'Bordeaux, France', null, 'White'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Organic Rouge', 'Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Rosé', 'Bordeaux, France', null, 'Rosé'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Les Terroirs Sauvignon Blanc', 'Bordeaux, France', 'Sauvignon Blanc', 'White'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Réserve Mouton Cadet Graves Rouge', 'Graves, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Réserve Mouton Cadet Graves Blanc', 'Graves, Bordeaux, France', null, 'White'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Réserve Mouton Cadet Sauternes', 'Sauternes, Bordeaux, France', null, 'Sweet'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Rouge x Pierre', 'Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Blanc x Nathan', 'Bordeaux, France', null, 'White'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Rosé x Mathilde', 'Bordeaux, France', null, 'Rosé'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Réserve Mouton Cadet Pauillac', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Réserve Mouton Cadet Saint-Estèphe', 'Saint-Estèphe, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Réserve Mouton Cadet Margaux', 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Réserve Mouton Cadet Saint-Émilion', 'Saint-Émilion, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Réserve Mouton Cadet Haut-Médoc', 'Haut-Médoc, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Réserve Mouton Cadet Médoc', 'Médoc, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/collection/reserve-en
  ('Mouton Cadet', 'Sélection Haut-Médoc', 'Haut-Médoc, Bordeaux, France', null, 'Red')  -- https://www.moutoncadet.com/en/collection/reserve-en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU RIEUSSEC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Rieussec', 'Carmes de Rieussec', 'Sauternes, Bordeaux, France', 'Sémillon, Muscadelle, Sauvignon Blanc', 'Sweet'),  -- https://www.premiumgrandscrus.com/en/bordeaux/4897-carmes-de-rieussec-2016.html
  ('Château Rieussec', 'R de Rieussec', 'Bordeaux, France', null, 'White'),  -- https://www.farrvintners.com/wine.php?wine=67517
  ('Château Rieussec', null, 'Sauternes, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/wine.php?wine=114808
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CARBONNIEUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Carbonnieux', 'La Croix de Carbonnieux Blanc', 'Pessac-Léognan, Bordeaux, France', 'Sauvignon Blanc, Sémillon', 'White'),  -- https://www.closdesmillesimes.com/30257-pessac-leognan-la-croix-de-carbonnieux---blanc-2021.html
  ('Château Carbonnieux', null, 'Pessac-Léognan, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=76651
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU D'AIGUILHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château d''Aiguilhe', null, 'Castillon Côtes de Bordeaux, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=120510
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BALESTARD LA TONNELLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Balestard La Tonnelle', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=51624
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BARDE-HAUT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Barde-Haut', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=25848
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BEAU-SÉJOUR BÉCOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Beau-Séjour Bécot', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=109364
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BEAUMONT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Beaumont', null, 'Haut-Médoc, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=91003
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BEAUSÉJOUR DUFFAU-LAGARROSSE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Beauséjour Duffau-Lagarrosse', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=100345
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BELLEFONT-BELCIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Bellefont-Belcier', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=100385
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BELLEVUE MONDOTTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Bellevue Mondotte', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=10427
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BERLIQUET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Berliquet', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117180
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BERNADOTTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Bernadotte', null, 'Haut-Médoc, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=47783
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TRONQUOY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Tronquoy', 'Blanc de Tronquoy', 'Bordeaux, France', null, 'White'),  -- https://www.farrvintners.com/wine.php?wine=101407
  ('Château Tronquoy', null, 'Saint-Estèphe, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99285
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BRANAS GRAND POUJEAUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Branas Grand Poujeaux', null, 'Moulis-en-Médoc, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=117836
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CLOSIOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Closiot', 'C de Sec du Château Closiot', 'Bordeaux, France', null, 'White'),  -- https://www.farrvintners.com/wine.php?wine=116424
  ('Château Closiot', 'Closiot Bonneau', 'Barsac, Bordeaux, France', null, 'Sweet')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117344
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LES CARMES HAUT-BRION ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Les Carmes Haut-Brion', 'C des Carmes Haut-Brion', 'Pessac-Léognan, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.farrvintners.com/wine.php?wine=113650
  ('Château Les Carmes Haut-Brion', null, 'Pessac-Léognan, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117150
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CANON LA GAFFELIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Canon La Gaffelière', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=113062
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CAPBERN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Capbern', null, 'Saint-Estèphe, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117210
  ('Château Capbern', 'Capbern Gasqueton', 'Saint-Estèphe, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=27322
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CARIGNAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Carignan', null, 'Cadillac Côtes de Bordeaux, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=110974
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CERTAN DE MAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Certan de May', null, 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/wine.php?wine=45907
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CHASSE-SPLEEN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Chasse-Spleen', null, 'Moulis-en-Médoc, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=69357
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CHAUVIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Chauvin', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=118170
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CLIMENS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Climens', null, 'Barsac, Bordeaux, France', 'Sémillon', 'Sweet')  -- https://www.farrvintners.com/wine.php?wine=46053
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CLOS FOURTET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Clos Fourtet', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99009
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS LA MADELEINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Clos La Madeleine', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/wine.php?wine=115856
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS MANOU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Clos Manou', null, 'Médoc, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=91717
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CLOS RENÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Clos René', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=115476
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS SAINT-MARTIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Clos Saint-Martin', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=5350
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CLOS DU CLOCHER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Clos du Clocher', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=112256
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU COUTET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Coutet', null, 'Barsac, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117156
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE MALLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château de Malle', null, 'Sauternes, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/wine.php?wine=14262
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DOISY-DAËNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Doisy-Daëne', null, 'Barsac, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet'),  -- https://www.farrvintners.com/wine.php?wine=109390
  ('Château Doisy-Daëne', 'L''Extravagant de Doisy-Daëne', 'Barsac, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/wine.php?wine=27106
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DOISY-VÉDRINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Doisy-Védrines', null, 'Barsac, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117160
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU QUINTUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Quintus', 'Dragon de Quintus', 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red'),  -- https://www.farrvintners.com/wine.php?wine=99249
  ('Château Quintus', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117206
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ENCLOS TOURMALINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Enclos Tourmaline', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=52823
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FEYTIT-CLINET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Feytit-Clinet', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=8986
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FILHOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Filhot', null, 'Sauternes, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/wine.php?wine=120896
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FLEUR CARDINALE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Fleur Cardinale', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=30350
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE FONBEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château de Fonbel', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117188
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FONTENIL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Fontenil', null, 'Fronsac, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=37204
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GIGAULT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Gigault', 'Cuvée Viva', 'Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=11031
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GLORIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Gloria', null, 'Saint-Julien, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117032
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GRACIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Gracia', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=25944
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GRAND CORBIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Grand Corbin', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=118172
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU HAUT-BERGEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Haut-Bergey', null, 'Pessac-Léognan, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=17136
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU HOSANNA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Hosanna', null, 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99223
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- L'IF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('L''If', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117208
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA CHENADE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Chenade', null, 'Lalande-de-Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117152
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA CLOTTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Clotte', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99007
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA CLUSIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Clusière', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=14097
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA FLEUR-PÉTRUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Fleur-Pétrus', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=109250
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA FLEUR DE BOÜARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Fleur de Boüard', null, 'Lalande-de-Pomerol, Bordeaux, France', 'Merlot', 'Red'),  -- https://www.farrvintners.com/wine.php?wine=25929
  ('Château La Fleur de Boüard', 'Plus de la Fleur de Boüard', 'Lalande-de-Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=65039
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA GAFFELIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Gaffelière', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117028
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA MONDOTTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Mondotte', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/wine.php?wine=49160
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA TOUR BLANCHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Tour Blanche', null, 'Sauternes, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/wine.php?wine=99201
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA TOUR FIGEAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Tour Figeac', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=88103
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA VIOLETTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Violette', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99141
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LABÉGORCE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Labégorce', null, 'Margaux, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=113204
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LAFAURIE-PEYRAGUEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Lafaurie-Peyraguey', null, 'Sauternes, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/wine.php?wine=14595
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LARCIS DUCASSE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Larcis Ducasse', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99167
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LAROQUE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Laroque', null, 'Saint-Émilion, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117202
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LATOUR À POMEROL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Latour à Pomerol', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=91997
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LE BON PASTEUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Le Bon Pasteur', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=88101
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LE DÔME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Le Dôme', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=25915
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LE GAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Le Gay', null, 'Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99033
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LE PRIEURÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Le Prieuré', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=61493
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LES CRUZELLES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Les Cruzelles', null, 'Lalande-de-Pomerol, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117186
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LES GRANDES MURAILLES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Les Grandes Murailles', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=106618
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU L'HÊTRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château L''Hêtre', null, 'Castillon Côtes de Bordeaux, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99269
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MAGDELAINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Magdelaine', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=29527
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FOMBRAUGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Fombrauge', 'Magrez-Fombrauge', 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=62317
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MANGOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Mangot', null, 'Saint-Émilion, Bordeaux, France', null, 'Red')  -- https://www.farrvintners.com/wine.php?wine=99281
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MEYNEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Meyney', null, 'Saint-Estèphe, Bordeaux, France', 'Cabernet Sauvignon, Merlot, Petit Verdot', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117072
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MONBOUSQUET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Monbousquet', 'Monbousquet Blanc', 'Bordeaux, France', 'Sauvignon Blanc, Semillon', 'White')  -- https://www.farrvintners.com/wine.php?wine=92071
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TROPLONG MONDOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Troplong Mondot', 'Mondot', 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red'),  -- https://www.farrvintners.com/wine.php?wine=94299
  ('Château Troplong Mondot', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117116
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MONTLANDRIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Montlandrie', null, 'Castillon Côtes de Bordeaux, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117200
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MOULIN SAINT-GEORGES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Moulin Saint-Georges', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117142
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU NAIRAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Nairac', null, 'Barsac, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/wine.php?wine=14640
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU OLIVIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Olivier', 'Blanc', 'Pessac-Léognan, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'White')  -- https://www.farrvintners.com/wine.php?wine=107322
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LES ORMES DE PEZ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Les Ormes de Pez', null, 'Saint-Estèphe, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117082
  ('Château Les Ormes de Pez', 'Les Ormes de Pez Blanc', 'Bordeaux, France', 'Sauvignon Blanc, Semillon', 'White')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117374
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PAVIE MACQUIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Pavie Macquin', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/wine.php?wine=109346
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PETIT VILLAGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Petit Village', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=32375
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PHÉLAN SÉGUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Phélan Ségur', null, 'Saint-Estèphe, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117092
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU POTENSAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Potensac', null, 'Médoc, Bordeaux, France', 'Merlot, Cabernet Sauvignon, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117102
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU POUGET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Pouget', null, 'Margaux, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=120220
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU POUJEAUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Poujeaux', null, 'Moulis-en-Médoc, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=74569
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU QUINAULT L'ENCLOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Quinault L''Enclos', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=46014
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU ROC DE CAMBES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Roc de Cambes', null, 'Côtes de Bourg, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99121
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU ROCHEYRON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Rocheyron', null, 'Saint-Émilion, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=83083
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU ROUGET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Rouget', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=118180
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SÉNÉJAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Sénéjac', null, 'Haut-Médoc, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=29581
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SIRAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Siran', null, 'Margaux, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117130
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SOCIANDO-MALLET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Sociando-Mallet', null, 'Haut-Médoc, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=95977
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TERTRE RÔTEBOEUF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Tertre Rôteboeuf', null, 'Saint-Émilion, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=52899
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TOUR SAINT-CHRISTOPHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Tour Saint-Christophe', null, 'Saint-Émilion, Bordeaux, France', 'Merlot, Cabernet Franc', 'Red')  -- https://www.farrvintners.com/wine.php?wine=99261
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TRONQUOY-LALANDE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Tronquoy-Lalande', null, 'Saint-Estèphe, Bordeaux, France', 'Merlot, Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=58391
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU VRAY CROIX DE GAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Vray Croix de Gay', null, 'Pomerol, Bordeaux, France', 'Merlot', 'Red')  -- https://www.farrvintners.com/wine.php?wine=60789
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE FARGUES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château de Fargues', null, 'Sauternes, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'Sweet')  -- https://www.farrvintners.com/wine.php?wine=14332
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE FIEUZAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château de Fieuzal', null, 'Pessac-Léognan, Bordeaux, France', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117024
  ('Château de Fieuzal', 'Blanc', 'Pessac-Léognan, Bordeaux, France', 'Sauvignon Blanc, Semillon', 'White')  -- https://www.farrvintners.com/en_primeur/wine.php?wine=117162
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE PEZ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château de Pez', null, 'Saint-Estèphe, Bordeaux, France', 'Cabernet Sauvignon', 'Red')  -- https://www.farrvintners.com/wine.php?wine=119678
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU RAUZAN-GASSIES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Rauzan-Gassies', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-rauzan-gassies.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MARQUIS DE TERME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Marquis de Terme', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-marquis-de-terme.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MARQUIS D'ALESME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Marquis d''Alesme', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-marquis-d-alesme-becker.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BOYD-CANTENAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Boyd-Cantenac', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-boyd-cantenac.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DESMIRAIL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Desmirail', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-desmirail.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FERRIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château Ferrière', null, 'Margaux, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-ferriere.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA TOUR CARNET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_bordeaux.sql)'
from (values
  ('Château La Tour Carnet', null, 'Haut-Médoc, Bordeaux, France', null, 'Red')  -- https://www.millesima.co.uk/producer-chateau-la-tour-carnet.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
