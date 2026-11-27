-- Producer ranges round 3: Champagne. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- CHARLES HEIDSIECK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Charles Heidsieck', 'Brut Réserve', 'Champagne, France', 'Pinot Noir/Chardonnay/Meunier', 'Sparkling'),  -- https://www.charlesheidsieck.com/en/wines/brut-reserve
  ('Charles Heidsieck', 'Rosé Réserve', 'Champagne, France', 'Pinot Noir/Chardonnay/Meunier', 'Sparkling'),  -- https://www.charlesheidsieck.com/en/wines/rose-reserve
  ('Charles Heidsieck', 'Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.charlesheidsieck.com/en/wines/blanc-de-blancs
  ('Charles Heidsieck', 'Brut Millésimé', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.charlesheidsieck.com/en/wines/brut-millesime-2018
  ('Charles Heidsieck', 'Rosé Millésimé', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.charlesheidsieck.com/en/wines/rose-millesime-2018
  ('Charles Heidsieck', 'Blanc des Millénaires', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.charlesheidsieck.com/en/wines/blanc-des-millenaires-2017
  ('Charles Heidsieck', 'Champagne Charlie', 'Champagne, France', null, 'Sparkling'),  -- https://www.charlesheidsieck.com/en/house/champagne-charlie
  ('Charles Heidsieck', 'Collection Crayères', 'Champagne, France', null, 'Sparkling'),  -- https://www.charlesheidsieck.com/en/wines/la-collection-crayeres-2026
  ('Charles Heidsieck', 'Coteaux Champenois Ambonnay', 'Montagne de Reims, Champagne, France', 'Pinot Noir', 'Red')  -- https://www.charlesheidsieck.com/en/wines/coteaux-champenois-ambonnay
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TAITTINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Taittinger', 'Brut Réserve', 'Champagne, France', 'Chardonnay/Pinot Noir/Meunier', 'Sparkling'),  -- https://www.taittinger.com/en/champagnes/brut-reserve
  ('Taittinger', 'Prestige Rosé', 'Champagne, France', 'Chardonnay/Pinot Noir/Meunier', 'Sparkling'),  -- https://www.taittinger.com/en/champagnes/prestige-rose
  ('Taittinger', 'Prélude Grands Crus', 'Champagne, France', 'Chardonnay/Pinot Noir', 'Sparkling'),  -- https://www.taittinger.com/en/champagnes/prelude-grands-crus
  ('Taittinger', 'Brut Millésimé', 'Champagne, France', 'Chardonnay/Pinot Noir', 'Sparkling'),  -- https://www.taittinger.com/en/champagnes/brut-millesime
  ('Taittinger', 'Folies de la Marquetterie', 'Champagne, France', 'Chardonnay/Pinot Noir', 'Sparkling'),  -- https://www.taittinger.com/en/champagnes/folies-de-la-marquetterie
  ('Taittinger', 'Nocturne', 'Champagne, France', 'Chardonnay/Pinot Noir/Meunier', 'Sparkling'),  -- https://www.taittinger.com/en/champagnes/nocturne
  ('Taittinger', 'Nocturne Rosé', 'Champagne, France', 'Chardonnay/Pinot Noir/Meunier', 'Sparkling'),  -- https://www.taittinger.com/en/champagnes/nocturne-rose
  ('Taittinger', 'Comtes de Champagne Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.taittinger.com/en/champagnes/comtes-de-champagne-blanc-de-blancs
  ('Taittinger', 'Comtes de Champagne Rosé', 'Champagne, France', 'Chardonnay/Pinot Noir', 'Sparkling')  -- https://www.taittinger.com/en/champagnes/comtes-de-champagne-rose
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VEUVE CLICQUOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Veuve Clicquot', 'Brut Yellow Label', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/brut-yellow-label/
  ('Veuve Clicquot', 'Brut Rosé', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/brut-rose/
  ('Veuve Clicquot', 'Rich', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/rich-and-rich-rose/
  ('Veuve Clicquot', 'Rich Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/rich-and-rich-rose/
  ('Veuve Clicquot', 'Vintage Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/vintage-and-cave-privee/
  ('Veuve Clicquot', 'Vintage Rosé Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/vintage-and-cave-privee/
  ('Veuve Clicquot', 'Cave Privée', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/vintage-and-cave-privee/
  ('Veuve Clicquot', 'Cave Privée Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/vintage-and-cave-privee/
  ('Veuve Clicquot', 'Extra Brut Extra Old', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/extra-brut-extra-old/
  ('Veuve Clicquot', 'La Grande Dame', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/la-grande-dame/
  ('Veuve Clicquot', 'La Grande Dame Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/la-grande-dame/
  ('Veuve Clicquot', 'Parcelle Clos Colin', 'Champagne, France', null, 'Sparkling')  -- https://www.veuveclicquot.com/en-gb/our-champagnes/our-champagnes/la-grande-dame/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- G.H. MUMM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('G.H. Mumm', 'Cordon Rouge', 'Champagne, France', 'Pinot Noir/Chardonnay/Meunier', 'Sparkling'),  -- https://www.mumm.com/en-ww/product/cordon-rouge-new-repack/
  ('G.H. Mumm', 'Grand Cordon', 'Champagne, France', null, 'Sparkling'),  -- https://www.mumm.com/en-ww/our-champagnes/
  ('G.H. Mumm', 'Le Rosé', 'Champagne, France', 'Pinot Noir/Chardonnay/Meunier', 'Sparkling'),  -- https://www.mumm.com/en-ww/product/le-rose-redesign/
  ('G.H. Mumm', 'Ice Xtra', 'Champagne, France', null, 'Sparkling'),  -- https://www.mumm.com/en-ww/product/mumm-ice-xtra/
  ('G.H. Mumm', 'Millésimé', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.mumm.com/en-ww/product/millesime-vintage-2016/
  ('G.H. Mumm', 'RSRV Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.mumm.com/en-ww/our-champagnes/
  ('G.H. Mumm', 'RSRV Blanc de Noirs', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.mumm.com/en-ww/our-champagnes/
  ('G.H. Mumm', 'RSRV Cuvée 4.5', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.mumm.com/en-ww/product/cuvee-4-5/
  ('G.H. Mumm', 'RSRV Rosé Foujita', 'Champagne, France', null, 'Sparkling'),  -- https://www.mumm.com/en-ww/our-champagnes/
  ('G.H. Mumm', 'RSRV Cuvée Lalou', 'Champagne, France', null, 'Sparkling')  -- https://www.mumm.com/en-ww/our-champagnes/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MOËT & CHANDON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Moët & Chandon', 'Moët Impérial', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
  ('Moët & Chandon', 'Rosé Impérial', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
  ('Moët & Chandon', 'Ice Impérial', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
  ('Moët & Chandon', 'Ice Impérial Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
  ('Moët & Chandon', 'Nectar Impérial', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
  ('Moët & Chandon', 'Nectar Impérial Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
  ('Moët & Chandon', 'Grand Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
  ('Moët & Chandon', 'Grand Vintage Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
  ('Moët & Chandon', 'Grand Vintage Collection', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
  ('Moët & Chandon', 'Collection Impériale n°1', 'Champagne, France', null, 'Sparkling')  -- https://www.moet.com/en-gb/our-champagnes-moet-chandon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PIPER-HEIDSIECK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Piper-Heidsieck', 'Cuvée Brut', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/cuvee-brut/
  ('Piper-Heidsieck', 'Brut Rosé', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/brut-rose/
  ('Piper-Heidsieck', 'Cuvée Sublime', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/cuvee-sublime/
  ('Piper-Heidsieck', 'Riviera', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/riviera/
  ('Piper-Heidsieck', 'Vintage', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/vintage-2018/
  ('Piper-Heidsieck', 'Essentiel Extra Brut', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/essentiel/
  ('Piper-Heidsieck', 'Essentiel Blanc de Noirs', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/essentiel-blanc-de-noirs/
  ('Piper-Heidsieck', 'Essentiel Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/essentiel-blanc-de-blancs/
  ('Piper-Heidsieck', 'Hors-Série', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling')  -- https://www.piper-heidsieck.com/en/wine/hors-serie-1971/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LANSON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Lanson', 'Le Black Création', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/le-black-creation
  ('Lanson', 'Le Rosé Création', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/le-rose-creation
  ('Lanson', 'Le Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://lanson.com/en/products/le-blanc-de-blancs
  ('Lanson', 'Le White Label Sec', 'Champagne, France', 'Pinot Noir/Chardonnay/Meunier', 'Sparkling'),  -- https://lanson.com/en/products/le-white-label
  ('Lanson', 'Le Vintage', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://lanson.com/en/products/le-vintage-2014
  ('Lanson', 'Le Green Bio-Organic', 'Champagne, France', 'Pinot Noir/Chardonnay/Meunier', 'Sparkling'),  -- https://lanson.com/en/products/le-green-bio-organic
  ('Lanson', 'Le Réserve Extra Brut', 'Champagne, France', 'Pinot Noir/Chardonnay/Meunier', 'Sparkling'),  -- https://lanson.com/en/products/le-reserve-extra-brut
  ('Lanson', 'Le Clos Lanson', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://lanson.com/en/products/le-clos-lanson
  ('Lanson', 'Noble Champagne Brut', 'Champagne, France', 'Chardonnay/Pinot Noir', 'Sparkling'),  -- https://lanson.com/en/products/noble-champagne-brut-vintage
  ('Lanson', 'Noble Champagne Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling')  -- https://lanson.com/en/products/noble-champagne-blanc-de-blancs-vintage
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAURENT-PERRIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Laurent-Perrier', 'La Cuvée', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/la-cuvee/
  ('Laurent-Perrier', 'Cuvée Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/cuvee-rose/
  ('Laurent-Perrier', 'Blanc de Blancs Brut Nature', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/blanc-de-blancs-brut-nature/
  ('Laurent-Perrier', 'Ultra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/ultra-brut/
  ('Laurent-Perrier', 'Harmony', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/harmony/
  ('Laurent-Perrier', 'Héritage', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/heritage/
  ('Laurent-Perrier', 'Brut Millésimé', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/brut-millesime/
  ('Laurent-Perrier', 'Alexandra Rosé Millésimé', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/alexandra-rose-millesime/
  ('Laurent-Perrier', 'Grand Siècle Iteration', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/grand-siecle/iteration-27/
  ('Laurent-Perrier', 'Grand Siècle Les Réserves', 'Champagne, France', null, 'Sparkling')  -- https://www.laurent-perrier.com/en/champagnes/grand-siecle/les-reserves-iteration-20/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOLLINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Bollinger', 'Special Cuvée', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/wine/special-cuvee
  ('Bollinger', 'Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/wine/bollinger-rose
  ('Bollinger', 'La Grande Année', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/grande-annee
  ('Bollinger', 'La Grande Année Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/grande-annee-rose
  ('Bollinger', 'R.D.', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/bollinger-rd
  ('Bollinger', 'PN', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/bollinger-pn
  ('Bollinger', 'B13', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/wine/bollinger-b13/
  ('Bollinger', 'B16', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/wine/bollinger-b16/
  ('Bollinger', 'La Côte aux Enfants Champagne', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/cote-enfants-champagne
  ('Bollinger', 'Vieilles Vignes Françaises', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/vieilles-vignes-francaises
  ('Bollinger', 'La Côte aux Enfants', 'Champagne, France', null, 'Red')  -- https://www.champagne-bollinger.com/en/the-collection/cote-enfants
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- POL ROGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Pol Roger', 'Brut Réserve', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.polroger.com/en/champagnes/2/brut-reserve
  ('Pol Roger', 'Brut Vintage', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.polroger.com/en/champagnes/3/brut-vintage
  ('Pol Roger', 'Rosé Vintage', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.polroger.com/en/champagnes/7/rose-vintage
  ('Pol Roger', 'Blanc de Blancs Vintage', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.polroger.com/en/champagnes/1/blanc-de-blancs-vintage
  ('Pol Roger', 'Rich Demi-Sec', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.polroger.com/en/champagnes/6/rich
  ('Pol Roger', 'Pure Brut Nature', 'Champagne, France', null, 'Sparkling'),  -- https://www.polroger.com/en/champagnes/5/pure-brut-nature
  ('Pol Roger', 'Cuvée Sir Winston Churchill', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.polroger.com/en/champagnes/4/cuvee-sir-winston-churchill
  ('Pol Roger', 'Brut Vintage Vinothèque', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling')  -- https://www.polroger.com/en/champagnes/8/vinotheque-brut-vintage
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RUINART ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Ruinart', 'R de Ruinart', 'Champagne, France', null, 'Sparkling'),  -- https://www.ruinart.com/en-gb/cprderuinart.html
  ('Ruinart', 'Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.ruinart.com/en-gb/cpruinartblancdeblancs.html
  ('Ruinart', 'Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.ruinart.com/en-gb/cpruinartrose.html
  ('Ruinart', 'Blanc Singulier', 'Champagne, France', null, 'Sparkling'),  -- https://www.ruinart.com/en-gb/collectionruinartblancsingulier.html
  ('Ruinart', 'Dom Ruinart Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.ruinart.com/en-gb/cpdomruinartblancdeblancs2013.html
  ('Ruinart', 'Dom Ruinart Rosé', 'Champagne, France', null, 'Sparkling')  -- https://www.ruinart.com/en-gb/cpdomruinartrose2009.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DEUTZ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Deutz', 'Brut Classic', 'Champagne, France', 'Chardonnay/Pinot Noir/Meunier', 'Sparkling'),  -- https://www.champagne-deutz.com/en/our-champagnes/brut-classic
  ('Deutz', 'Brut Rosé', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.champagne-deutz.com/en/our-champagnes/rose
  ('Deutz', 'Brut Millésimé', 'Champagne, France', 'Chardonnay/Pinot Noir', 'Sparkling'),  -- https://www.champagne-deutz.com/en/our-champagnes/brut-millesime
  ('Deutz', 'Rosé Millésimé', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.champagne-deutz.com/en/our-champagnes/rose-millesime
  ('Deutz', 'Blanc de Blancs Millésimé', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-deutz.com/en/our-champagnes/blanc-de-blancs-millesime
  ('Deutz', 'Amour de Deutz', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-deutz.com/en/our-champagnes/amour-de-deutz
  ('Deutz', 'Amour de Deutz Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-deutz.com/en/our-champagnes/amour-de-deutz-rose
  ('Deutz', 'William Deutz', 'Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.champagne-deutz.com/en/our-champagnes/william-deutz
  ('Deutz', 'Hommage à William Deutz Meurtet', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.champagne-deutz.com/en/our-champagnes/hommage-meurtet
  ('Deutz', 'Hommage à William Deutz La Côte Glacière', 'Champagne, France', 'Pinot Noir', 'Sparkling')  -- https://www.champagne-deutz.com/en/our-champagnes/hommage-cote-glaciere
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GOSSET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Gosset', 'Grande Réserve', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/our-champagne-wines/gosset-grande-reserve/
  ('Gosset', 'Cuvée Zéro Dosage', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/our-champagne-wines/cuvee-zero-dosage/
  ('Gosset', 'Grand Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/our-champagne-wines/gosset-grand-rose/
  ('Gosset', 'Grand Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-gosset.com/en/our-champagne-wines/gosset-grand-blanc-de-blancs/
  ('Gosset', 'Cuvée Suzanne Gosset', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/our-champagne-wines/cuvee-suzanne-gosset/
  ('Gosset', 'Petite Douceur Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/our-champagne-wines/gosset-petite-douceur-rose/
  ('Gosset', 'Grand Millésime', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/our-champagne-wines/gosset-grand-millesime-2016/
  ('Gosset', '12 Ans de Cave a Minima Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/our-champagne-wines/12-ans-de-cave-a-minima-rose/
  ('Gosset', '21 Ans de Cave a Minima', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/our-champagne-wines/gosset-21-ans-de-cave-a-minima/
  ('Gosset', 'Celebris Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/gosset-celebris/gosset-celebris-vintage-2012/
  ('Gosset', 'Celebris Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-gosset.com/en/gosset-celebris/gosset-celebris-rose-2009/
  ('Gosset', 'Celebris Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling')  -- https://www.champagne-gosset.com/en/gosset-celebris/gosset-celebris-blanc-de-blancs-2012/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HENRIOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Henriot', 'Brut Souverain', 'Champagne, France', 'Pinot Noir/Chardonnay/Meunier', 'Sparkling'),  -- https://www.champagne-henriot.com/en/collection/henriot-brut-souverain
  ('Henriot', 'Blanc Souverain', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-henriot.com/en/collection/henriot-blanc-souverain
  ('Henriot', 'Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-henriot.com/en/collection/henriot-rose
  ('Henriot', 'Millésime', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-henriot.com/en/collection/henriot-millesime-2015
  ('Henriot', 'Rosé Millésime', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-henriot.com/en/collection/henriot-rose-millesime-2015
  ('Henriot', 'Cuve des Enchanteleurs', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-henriot.com/en/collection/cuvee-des-enchanteleurs-2015
  ('Henriot', 'L''Inattendue', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-henriot.com/en/collection/henriot-linattendue-2018
  ('Henriot', 'Cuve 38', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-henriot.com/en/collection/henriot-cuve-38
  ('Henriot', 'Mémoires', 'Champagne, France', 'Chardonnay/Pinot Noir', 'Sparkling')  -- https://www.champagne-henriot.com/en/collection/henriot-memoires
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- AYALA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Ayala', 'Brut Majeur', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-ayala.fr/en/champagne/brut-majeur/
  ('Ayala', 'Brut Nature', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-ayala.fr/en/champagne/brut-nature/
  ('Ayala', 'Rosé Majeur', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-ayala.fr/en/champagne/rose-majeur/
  ('Ayala', 'Le Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-ayala.fr/en/champagne/le-blanc-de-blancs/
  ('Ayala', 'Perle d''Ayala', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-ayala.fr/en/champagne/perle-dayala/
  ('Ayala', 'Collection N°18 Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-ayala.fr/en/the-collection-ayala/
  ('Ayala', 'Collection N°16', 'Champagne, France', 'Chardonnay/Arbane/Petit Meslier/Pinot Blanc', 'Sparkling'),  -- https://www.champagne-ayala.fr/en/the-collection-ayala/
  ('Ayala', 'Collection N°14 Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-ayala.fr/en/the-collection-ayala/
  ('Ayala', 'Collection N°7', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-ayala.fr/en/the-collection-ayala/
  ('Ayala', 'Collection Rosé N°8', 'Champagne, France', null, 'Sparkling')  -- https://www.champagne-ayala.fr/en/the-collection-ayala/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DELAMOTTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Delamotte', 'Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-delamotte.com/en/products/brut
  ('Delamotte', 'Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-delamotte.com/en/products/blanc-de-blancs
  ('Delamotte', 'Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-delamotte.com/en/products/rose
  ('Delamotte', 'Blanc de Blancs Vintage', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-delamotte.com/en/products/blanc-de-blancs-vintage-2018
  ('Delamotte', 'Blanc de Blancs Collection', 'Champagne, France', 'Chardonnay', 'Sparkling')  -- https://www.champagne-delamotte.com/en/products/blanc-de-blancs-collection-2008
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PHILIPPONNAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Philipponnat', 'Réserve Perpétuelle Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/reserve-perpetuelle/
  ('Philipponnat', 'Réserve Perpétuelle Non Dosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/reserve-perpetuelle/
  ('Philipponnat', 'Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/rose/
  ('Philipponnat', 'Blanc de Noirs', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/millesimes/
  ('Philipponnat', 'Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/millesimes/
  ('Philipponnat', 'Cuvée 1522 Extra-Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/1522/
  ('Philipponnat', 'Cuvée 1522 Rosé Extra-Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/1522/
  ('Philipponnat', 'La Rémissonne', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/parcellaires/
  ('Philipponnat', 'Le Léon', 'Champagne, France', null, 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/parcellaires/
  ('Philipponnat', 'Les Cintres', 'Champagne, France', null, 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/parcellaires/
  ('Philipponnat', 'Clos des Goisses', 'Champagne, France', null, 'Sparkling'),  -- https://www.philipponnat.com/en/gamme/clos-des-goisses/
  ('Philipponnat', 'Clos des Goisses Juste Rosé', 'Champagne, France', null, 'Sparkling')  -- https://www.philipponnat.com/en/gamme/clos-des-goisses/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JOSEPH PERRIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Joseph Perrier', 'Cuvée Royale Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/cuvee-royale-brut/
  ('Joseph Perrier', 'Cuvée Royale Brut Nature', 'Champagne, France', null, 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/cuvee-royale-brut-nature/
  ('Joseph Perrier', 'Cuvée Royale Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/cuvee-royale-brut-blanc-de-blancs/
  ('Joseph Perrier', 'Cuvée Royale Brut Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/cuvee-royale-brut-rose/
  ('Joseph Perrier', 'Cuvée Royale Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/cuvee-royale-vintage-2018/
  ('Joseph Perrier', 'Cuvée Royale Demi-Sec', 'Champagne, France', null, 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/cuvee-royale-demi-sec/
  ('Joseph Perrier', 'Les Chalmonts', 'Champagne, France', null, 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/les-chalmonts/
  ('Joseph Perrier', 'Le Ciergelot', 'Champagne, France', null, 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/cuvee-ciergelot-2020/
  ('Joseph Perrier', 'La Côte à Bras', 'Champagne, France', null, 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/la-cote-a-bras-2016/
  ('Joseph Perrier', 'Joséphine', 'Champagne, France', null, 'Sparkling'),  -- https://www.josephperrier.com/en/champagnes-et-cuvees/josephine-2014/
  ('Joseph Perrier', 'Cuvée 200', 'Champagne, France', null, 'Sparkling')  -- https://www.josephperrier.com/en/champagnes-et-cuvees/cuvee-200/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CANARD-DUCHÊNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Canard-Duchêne', 'Léonie Iconic Brut', 'Champagne, France', null, 'Sparkling'),  -- https://canard-duchene.fr/en/products/cuvee-leonie-iconic-brut
  ('Canard-Duchêne', 'Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://canard-duchene.fr/en/products/blanc-de-blancs-iconic-champagne
  ('Canard-Duchêne', 'Blanc de Noirs', 'Champagne, France', null, 'Sparkling'),  -- https://canard-duchene.fr/en/products/blanc-de-noirs-iconic-champagne
  ('Canard-Duchêne', 'Demi-Sec', 'Champagne, France', null, 'Sparkling'),  -- https://canard-duchene.fr/en/products/cuvee-demi-sec-essentiel
  ('Canard-Duchêne', 'P181 Organic Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://canard-duchene.fr/en/products/p181-organic-champagne
  ('Canard-Duchêne', 'Millésime Savoir-Faire Brut', 'Champagne, France', null, 'Sparkling')  -- https://canard-duchene.fr/en/products/2018-vintage-champagne
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NICOLAS FEUILLATTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Nicolas Feuillatte', 'Réserve Exclusive Brut', 'Champagne, France', null, 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/reserve-exclusive-brut
  ('Nicolas Feuillatte', 'Réserve Exclusive Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/reserve-exclusive-rose
  ('Nicolas Feuillatte', 'Réserve Exclusive Demi-Sec', 'Champagne, France', null, 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/reserve-exclusive-demi-sec
  ('Nicolas Feuillatte', 'Réserve Exclusive Premier Cru Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/reserve-exclusive-premier-cru-extra-brut
  ('Nicolas Feuillatte', 'Organic Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/organic
  ('Nicolas Feuillatte', 'Brut Millésime', 'Champagne, France', null, 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/brut-millesime-2018
  ('Nicolas Feuillatte', 'Blanc de Blancs Millésime', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/blanc-de-blancs-millesime-2020
  ('Nicolas Feuillatte', 'Grand Cru Blanc de Noirs', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/grand-cru-millesime-2015-blanc-de-noirs
  ('Nicolas Feuillatte', 'Grand Cru Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/grand-cru-millesime-2016-blanc-de-blancs
  ('Nicolas Feuillatte', 'Palmes d''Or Brut', 'Champagne, France', null, 'Sparkling'),  -- https://nicolas-feuillatte.com/en/products/palmes-dor-2009-brut
  ('Nicolas Feuillatte', 'Palmes d''Or Rosé', 'Champagne, France', null, 'Sparkling')  -- https://nicolas-feuillatte.com/en/products/palmes-dor-2008-rose-intense
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DUVAL-LEROY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Duval-Leroy', 'Brut Réserve', 'Champagne, France', null, 'Sparkling'),  -- https://www.duval-leroy.com/en/?champagne=brutreserve
  ('Duval-Leroy', 'Rosé Prestige Premier Cru', 'Champagne, France', null, 'Sparkling'),  -- https://www.duval-leroy.com/en/?champagne=rose-prestige-premier-cru
  ('Duval-Leroy', 'Brut Organic Viticulture', 'Champagne, France', null, 'Sparkling'),  -- https://www.duval-leroy.com/en/?champagne=brut-organic-viticulture
  ('Duval-Leroy', 'Cuvée MOF', 'Champagne, France', null, 'Sparkling'),  -- https://www.duval-leroy.com/en/?champagne=m-o-f
  ('Duval-Leroy', 'Precious Parcel Clos des Bouveries', 'Champagne, France', null, 'Sparkling'),  -- https://www.duval-leroy.com/en/?champagne=clos-des-bouveries-2
  ('Duval-Leroy', 'Precious Parcel Petit Meslier', 'Champagne, France', 'Petit Meslier', 'Sparkling'),  -- https://www.duval-leroy.com/en/?champagne=authentis-petit-meslier-vintage-2005
  ('Duval-Leroy', 'Femme de Champagne', 'Champagne, France', null, 'Sparkling'),  -- https://www.duval-leroy.com/en/?champagne=femme-de-champagne-vintage-2004
  ('Duval-Leroy', 'Femme de Champagne Rosé', 'Champagne, France', null, 'Sparkling')  -- https://www.duval-leroy.com/en/?champagne=femme-de-champagne-rose-2007
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KRUG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Krug', 'Grande Cuvée', 'Champagne, France', null, 'Sparkling'),  -- https://www.krug.com/en-int/krug-grande-cuvee
  ('Krug', 'Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.krug.com/en-int/krug-rose
  ('Krug', 'Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.krug.com/en-int/krug-vintage
  ('Krug', 'Clos du Mesnil', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.krug.com/en-int/champagne/krug-clos-du-mesnil-2009
  ('Krug', 'Clos d''Ambonnay', 'Champagne, France', null, 'Sparkling'),  -- https://www.krug.com/en-int/champagne/krug-clos-dambonnay-2008
  ('Krug', 'Collection', 'Champagne, France', null, 'Sparkling')  -- https://www.krug.com/en-int/krug-collection
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALFRED GRATIEN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Alfred Gratien', 'Cuvée Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/cuvee-des-anges-en/
  ('Alfred Gratien', 'Cuvée Brut Nature', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/cuvee-des-anges-brut-nature-en/
  ('Alfred Gratien', 'Cuvée Brut Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/cuvee-des-anges-brut-rose-en/
  ('Alfred Gratien', 'Cuvée Paradis Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/cuvee-paradis-2018-blanc-de-blancs-en/
  ('Alfred Gratien', 'Cuvée Paradis Brut Millésimé', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/cuvee-paradis-2018-brut-millesime-en/
  ('Alfred Gratien', 'Cuvée Paradis Brut Rosé Millésimé', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/cuvee-paradis-2008-brut-rose-millesime-en/
  ('Alfred Gratien', 'Cuvée Memory', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/collection-memory-1996-en/
  ('Alfred Gratien', 'Cuvée Les 12 Anges', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/cuvee-des-12-anges-en/
  ('Alfred Gratien', 'Cuvée Clos le Village', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/clos-le-village-en/
  ('Alfred Gratien', 'Cuvée Grand Assemblage', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/grand-assemblage-2016-en/
  ('Alfred Gratien', 'Cuvée Blanc de Noirs Grand Cru', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/grand-cru-2016-blanc-de-noirs-en/
  ('Alfred Gratien', 'Cuvée 565', 'Champagne, France', null, 'Sparkling'),  -- https://www.alfredgratien.com/en/les-cuvees/cuvee-565-en/
  ('Alfred Gratien', 'Cuvée 595', 'Champagne, France', null, 'Sparkling')  -- https://www.alfredgratien.com/en/les-cuvees/cuvee-595-en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LENOBLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Lenoble', 'Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-lenoble.com/champagne/extra-brut-v-21/
  ('Lenoble', 'Dosage Zéro', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-lenoble.com/champagne/dosage-zero-v-19/
  ('Lenoble', 'Blanc de Blancs Grand Cru Chouilly', 'Côte des Blancs, Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://champagne-lenoble.com/champagne/blanc-de-blancs-grand-cru-chouilly-v-20/
  ('Lenoble', 'Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-lenoble.com/champagne/rose-chouilly-bisseuil-v-19/
  ('Lenoble', 'Blanc de Noirs Premier Cru Bisseuil', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://champagne-lenoble.com/champagne/blanc-de-noirs-premier-cru-bisseuil/
  ('Lenoble', 'Blanc de Blancs Grand Cru Chouilly Millésime', 'Côte des Blancs, Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://champagne-lenoble.com/champagne/blanc-de-blancs-grand-cru-chouilly/
  ('Lenoble', 'Gentilhomme Grand Cru', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://champagne-lenoble.com/champagne/gentilhomme-blanc-de-blancs-grand-cru-chouilly/
  ('Lenoble', 'Les Aventures Grand Cru', 'Champagne, France', 'Chardonnay', 'Sparkling')  -- https://champagne-lenoble.com/champagne/les-aventures-blanc-de-blancs-grand-cru-chouilly/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BRUNO PAILLARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Bruno Paillard', 'Première Cuvée', 'Champagne, France', null, 'Sparkling'),  -- https://champagnebrunopaillard.com/en/champagnes/premiere-cuvee-en/
  ('Bruno Paillard', 'Rosé Première Cuvée', 'Champagne, France', null, 'Sparkling'),  -- https://champagnebrunopaillard.com/en/champagnes/rose-premiere-cuvee-en/
  ('Bruno Paillard', 'Blanc de Blancs Grand Cru', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://champagnebrunopaillard.com/en/champagnes/blanc-de-blancs-grand-cru-en/
  ('Bruno Paillard', 'Blanc de Noirs Grand Cru', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://champagnebrunopaillard.com/en/champagnes/blanc-de-noirs-grand-cru-en/
  ('Bruno Paillard', 'Dosage Zéro', 'Champagne, France', null, 'Sparkling'),  -- https://champagnebrunopaillard.com/en/champagnes/dosage-zero-en/
  ('Bruno Paillard', 'Cuvée 72', 'Champagne, France', null, 'Sparkling'),  -- https://champagnebrunopaillard.com/en/champagnes/cuvee-72-en/
  ('Bruno Paillard', 'Blanc de Blancs Millésime', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://champagnebrunopaillard.com/en/champagnes/blanc-de-blancs-2015-en/
  ('Bruno Paillard', 'Assemblage', 'Champagne, France', null, 'Sparkling'),  -- https://champagnebrunopaillard.com/en/champagnes/assemblage-2015-anglais/
  ('Bruno Paillard', 'N.P.U. Nec Plus Ultra', 'Champagne, France', null, 'Sparkling')  -- https://champagnebrunopaillard.com/en/champagnes/n-p-u-nec-plus-ultra-2009-anglais/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHAMPAGNE DEVAUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Champagne Devaux', 'Grande Réserve', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-classique
  ('Champagne Devaux', 'Crème de Cuvée', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-classique
  ('Champagne Devaux', 'Cuvée D', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-d
  ('Champagne Devaux', 'Ultra D', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-d
  ('Champagne Devaux', 'D Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-d
  ('Champagne Devaux', 'D Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-devaux.com/collection-d
  ('Champagne Devaux', 'D Millésimé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-d
  ('Champagne Devaux', 'Distinction', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-distinction
  ('Champagne Devaux', 'Sténopé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-stenope
  ('Champagne Devaux', 'Cœur des Bar Blanc de Noirs', 'Côte des Bar, Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.champagne-devaux.com/collection-terroirs-de-coeur
  ('Champagne Devaux', 'Cœur des Bar Rosé', 'Côte des Bar, Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-terroirs-de-coeur
  ('Champagne Devaux', 'Cœur des Bar Blanc de Blancs', 'Côte des Bar, Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-devaux.com/collection-terroirs-de-coeur
  ('Champagne Devaux', 'Cœur de Nature', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-devaux.com/collection-terroirs-de-coeur
  ('Champagne Devaux', 'Coteaux Champenois Rouge En Chanzeux', 'Champagne, France', null, 'Red'),  -- https://www.champagne-devaux.com/collection-vins-tranquilles
  ('Champagne Devaux', 'Coteaux Champenois Blanc La Boulangère', 'Champagne, France', null, 'White'),  -- https://www.champagne-devaux.com/collection-vins-tranquilles
  ('Champagne Devaux', 'Rosé des Riceys Chanseux', 'Champagne, France', null, 'Rosé'),  -- https://www.champagne-devaux.com/collection-vins-tranquilles
  ('Champagne Devaux', 'Rosé des Riceys Val Bazot', 'Champagne, France', null, 'Rosé')  -- https://www.champagne-devaux.com/collection-vins-tranquilles
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOIZEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Boizel', 'Brut Réserve', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/champagne-brut-reserve/
  ('Boizel', 'Rosé Absolu', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/champagne-rose-absolu/
  ('Boizel', 'Ultime Zéro', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/champagne-ultime-zero/
  ('Boizel', 'Blanc de Blancs Premier Cru', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.boizel.com/en/wine/champagne-blanc-de-blancs/
  ('Boizel', 'Blanc de Noirs Premier Cru', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/champagne-blanc-de-noirs/
  ('Boizel', 'Grand Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/grand-vintage-2019/
  ('Boizel', 'Cuvée Sous Bois', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/champagne-cuvee-sous-bois-2009/
  ('Boizel', 'Joyau de France', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/joyau-2013/
  ('Boizel', 'Joyau Chardonnay', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.boizel.com/en/wine/champagne-joyau-chardonnay-2007/
  ('Boizel', 'Joyau Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/champagne-joyau-rose-2012/
  ('Boizel', 'Collection Trésor', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/champagne-collection-tresor1996/
  ('Boizel', 'Avize Blanc de Blancs Grand Cru', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.boizel.com/en/wine/avize-2020-blanc-de-blancs-grand-cru-2/
  ('Boizel', 'Tours-sur-Marne Blanc de Noirs Grand Cru', 'Champagne, France', null, 'Sparkling'),  -- https://www.boizel.com/en/wine/tours-sur-marne-2020-blanc-de-noirs-grand-cru/
  ('Boizel', 'Ratafia Nouvelle Vague', 'Champagne, France', null, 'Fortified')  -- https://www.boizel.com/en/wine/ratafia-nouvelle-vague/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THIÉNOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Thiénot', 'Collection Origine Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-thienot.com/en/collection-origine/
  ('Thiénot', 'Collection Origine Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagne-thienot.com/en/collection-origine/
  ('Thiénot', 'Collection Origine Brut Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-thienot.com/en/collection-origine/
  ('Thiénot', 'Collection Origine Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-thienot.com/en/collection-origine/
  ('Thiénot', 'Cuvée Stanislas', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-thienot.com/en/collection-famille/
  ('Thiénot', 'Cuvée Garance', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-thienot.com/en/collection-famille/
  ('Thiénot', 'Cuvée Alain Thiénot', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-thienot.com/en/collection-famille/
  ('Thiénot', 'Cuvée Vinothèque', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-thienot.com/en/collection-famille/
  ('Thiénot', 'La Vigne aux Gamins', 'Champagne, France', null, 'Sparkling')  -- https://www.champagne-thienot.com/en/special-release/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MAILLY GRAND CRU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Mailly Grand Cru', 'Brut Réserve', 'Montagne de Reims, Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.champagne-mailly.com/en/our-cuvees/brut-reserve/
  ('Mailly Grand Cru', 'L''Intemporelle', 'Montagne de Reims, Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.champagne-mailly.com/en/our-cuvees/lintemporelle/
  ('Mailly Grand Cru', 'L''Intemporelle Rosé', 'Montagne de Reims, Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.champagne-mailly.com/en/our-cuvees/lintemporelle-rose/
  ('Mailly Grand Cru', 'Délice', 'Montagne de Reims, Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.champagne-mailly.com/en/our-cuvees/delice/
  ('Mailly Grand Cru', 'Blanc de Pinot Noir', 'Montagne de Reims, Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.champagne-mailly.com/en/our-cuvees/blanc-de-pinot-noir/
  ('Mailly Grand Cru', 'Rosé de Mailly', 'Montagne de Reims, Champagne, France', null, 'Sparkling'),  -- https://www.champagne-mailly.com/en/our-cuvees/rose-de-mailly/
  ('Mailly Grand Cru', 'Extra Brut Millésimé', 'Montagne de Reims, Champagne, France', null, 'Sparkling'),  -- https://www.champagne-mailly.com/en/our-cuvees/extra-brut-millesime/
  ('Mailly Grand Cru', 'Les Échansons', 'Montagne de Reims, Champagne, France', 'Pinot Noir/Chardonnay', 'Sparkling'),  -- https://www.champagne-mailly.com/en/our-cuvees/les-echansons/
  ('Mailly Grand Cru', 'Coteaux Champenois Rouge', 'Montagne de Reims, Champagne, France', 'Pinot Noir', 'Red'),  -- https://www.champagne-mailly.com/en/our-cuvees/coteaux-champenois-rouge/
  ('Mailly Grand Cru', 'Coteaux Champenois Blanc', 'Montagne de Reims, Champagne, France', 'Pinot Noir', 'White')  -- https://www.champagne-mailly.com/en/our-cuvees/white-coteaux-champenois/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOUIS ROEDERER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Louis Roederer', 'Collection', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/collection/246
  ('Louis Roederer', 'Brut Premier', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/brut-premier/non-vintage
  ('Louis Roederer', 'Carte Blanche', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/carte-blanche/non-vintage
  ('Louis Roederer', 'Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/vintage/2018
  ('Louis Roederer', 'Rosé Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/rose-vintage/2017
  ('Louis Roederer', 'Blanc de Blancs Vintage', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/blanc-de-blancs-vintage/2019
  ('Louis Roederer', 'Brut Nature', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/brut-nature/2018
  ('Louis Roederer', 'Brut Nature Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/brut-nature-rose/2018
  ('Louis Roederer', 'Cristal', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/cristal/2016
  ('Louis Roederer', 'Cristal Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/cristal-rose/2015
  ('Louis Roederer', 'Cristal Vinothèque', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/cristal-vinotheque/2004
  ('Louis Roederer', 'Cristal Rosé Vinothèque', 'Champagne, France', null, 'Sparkling'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/cristal-rose-vinotheque/2004
  ('Louis Roederer', 'Coteaux Champenois Hommage à Camille Charmont', 'Champagne, France', null, 'Red'),  -- https://mmdusa.net/portfolio/champagne-louis-roederer/camille-charmont/2022
  ('Louis Roederer', 'Coteaux Champenois Hommage à Camille Volibarts', 'Champagne, France', null, 'White')  -- https://mmdusa.net/portfolio/champagne-louis-roederer/camille-volibarts/2022
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOM PÉRIGNON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Dom Pérignon', 'Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.bbr.com/producer-703-dom-perignon
  ('Dom Pérignon', 'Rosé Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.bbr.com/producer-703-dom-perignon
  ('Dom Pérignon', 'P2', 'Champagne, France', null, 'Sparkling'),  -- https://www.bbr.com/producer-703-dom-perignon
  ('Dom Pérignon', 'P2 Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.bbr.com/producer-703-dom-perignon
  ('Dom Pérignon', 'Oenothèque', 'Champagne, France', null, 'Sparkling')  -- https://www.bbr.com/producer-703-dom-perignon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SALON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Salon', 'Le Mesnil Blanc de Blancs', 'Côte des Blancs, Champagne, France', 'Chardonnay', 'Sparkling')  -- https://www.champagne-salon.fr/en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COLLET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Collet', 'Art Déco Brut', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-collet.com/en/wines/art-deco-brut
  ('Collet', 'Art Déco Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-collet.com/en/wines/art-deco-extra-brut
  ('Collet', 'Esprit Couture', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-collet.com/en/wines/esprit-couture
  ('Collet', 'Blanc de Blancs Brut', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://champagne-collet.com/en/wines/blanc-de-blancs
  ('Collet', 'Blanc de Noirs Brut', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-collet.com/en/wines/blanc-de-noirs
  ('Collet', 'Rosé Brut', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-collet.com/en/wines/rose-brut
  ('Collet', 'Origine Brut', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-collet.com/en/wines/origine-brut
  ('Collet', 'Origine Demi-Sec', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-collet.com/en/wines/origine-demi-sec
  ('Collet', 'Millésime', 'Champagne, France', null, 'Sparkling'),  -- https://champagne-collet.com/en/wines/millesime
  ('Collet', 'Aÿ Grand Cru', 'Champagne, France', null, 'Sparkling')  -- https://champagne-collet.com/en/wines/ay-grand-cru
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BESSERAT DE BELLEFON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Besserat de Bellefon', 'Bleu Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/simplicity-line
  ('Besserat de Bellefon', 'Rosé Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/simplicity-line
  ('Besserat de Bellefon', 'Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/simplicity-line
  ('Besserat de Bellefon', 'Blanc de Noirs Grand Cru', 'Champagne, France', null, 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/elegance-line
  ('Besserat de Bellefon', 'Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/elegance-line
  ('Besserat de Bellefon', 'Millésime', 'Champagne, France', null, 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/elegance-line
  ('Besserat de Bellefon', 'Cuvée BB 1843', 'Champagne, France', null, 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/liberty-line
  ('Besserat de Bellefon', 'Cuvée Brigitte Bardot', 'Champagne, France', null, 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/liberty-line
  ('Besserat de Bellefon', 'Millésime Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/prestige-line
  ('Besserat de Bellefon', 'Blanc de Blancs Millésime Extra Brut', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/prestige-line
  ('Besserat de Bellefon', 'Le Triple B', 'Champagne, France', null, 'Sparkling'),  -- https://www.besseratdebellefon.com/en/our-champagnes/triple-b
  ('Besserat de Bellefon', 'Cuvée 180th Anniversary', 'Champagne, France', null, 'Sparkling')  -- https://www.besseratdebellefon.com/en/our-champagnes/anniversary-cuvee
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BILLECART-SALMON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Billecart-Salmon', 'Le Réserve', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Le Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Blanc de Blancs Grand Cru', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Le Sous Bois', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Brut Nature', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Cuvée Nicolas François Billecart', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Cuvée Louis Salmon Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Cuvée Elisabeth Salmon Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Le Clos Saint-Hilaire', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Les Rendez-Vous N°3 Pinot Meunier Extra Brut', 'Champagne, France', 'Meunier', 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Les Rendez-Vous N°9 Pinot Noir Extra Brut', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.millesima.co.uk/producer-billecart-salmon.html
  ('Billecart-Salmon', 'Extra Brut', 'Champagne, France', null, 'Sparkling')  -- https://fr.gaultmillau.com/en/wineries/billecart-salmon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PERRIER-JOUËT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Perrier-Jouët', 'Grand Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-perrier-jouet.html
  ('Perrier-Jouët', 'Blason Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-perrier-jouet.html
  ('Perrier-Jouët', 'Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.millesima.co.uk/producer-perrier-jouet.html
  ('Perrier-Jouët', 'Belle Epoque', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-perrier-jouet.html
  ('Perrier-Jouët', 'Belle Epoque Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-perrier-jouet.html
  ('Perrier-Jouët', 'Belle Epoque Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling')  -- https://www.millesima.co.uk/producer-perrier-jouet.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- POMMERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Pommery', 'Apanage Brut 1874', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-pommery.html
  ('Pommery', 'Apanage Rosé 1874', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-pommery.html
  ('Pommery', 'Apanage 1874 Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.millesima.co.uk/producer-pommery.html
  ('Pommery', 'Cuvée 150 Ans Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.millesima.co.uk/producer-pommery.html
  ('Pommery', 'Clos Pompadour Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.millesima.co.uk/producer-pommery.html
  ('Pommery', 'Cuvée Louise Brut Nature', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-pommery.html
  ('Pommery', 'Cuvée Louise Brut Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-pommery.html
  ('Pommery', 'Cuvée Louise Édition Parcelle', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-pommery.html
  ('Pommery', 'Brut Royal', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagnepommery.com/wines/brut/cuvee-brut-royal
  ('Pommery', 'Grand Cru Royal', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagnepommery.com/wines/brut-pommery/cuvee-grand-cru-royal
  ('Pommery', 'Royal Blue Sky', 'Champagne, France', 'Pinot Noir/Meunier/Chardonnay', 'Sparkling'),  -- https://www.champagnepommery.com/wines/brut-pommery/cuvee-royal-blue-sky
  ('Pommery', 'Brut Apanage', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagnepommery.com/wines/cuvee-apanage/cuvee-brut-apanage
  ('Pommery', 'Rosé Apanage', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagnepommery.com/wines/cuvee-apanage/cuvee-rose-apanage
  ('Pommery', 'Blanc de Blancs Apanage', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.champagnepommery.com/wines/cuvee-apanage/cuvee-blanc-de-blancs-apanage
  ('Pommery', 'Blanc de Noirs Apanage', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagnepommery.com/wines/cuvee-apanage/cuvee-blanc-de-noirs-apanage
  ('Pommery', 'Cuvée Louise Millésime', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagnepommery.com/wines/louise/cuvee-millesime-2008
  ('Pommery', 'Pop', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagnepommery.com/wines/pop/cuvee-pop
  ('Pommery', 'Vintage Pop', 'Champagne, France', null, 'Sparkling')  -- https://www.champagnepommery.com/wines/pop/cuvee-vintage-pop
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BARONS DE ROTHSCHILD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Barons de Rothschild', 'Concordia Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
  ('Barons de Rothschild', 'Brut Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
  ('Barons de Rothschild', 'Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
  ('Barons de Rothschild', 'Brut Nature', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
  ('Barons de Rothschild', 'Rare Collection Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
  ('Barons de Rothschild', 'Rare Collection Rosé', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
  ('Barons de Rothschild', 'Le Grand Clos Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
  ('Barons de Rothschild', 'Les Maladries', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
  ('Barons de Rothschild', 'Le Bateau', 'Champagne, France', null, 'Sparkling'),  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
  ('Barons de Rothschild', 'Triptyque', 'Champagne, France', null, 'Sparkling')  -- https://www.millesima.co.uk/producer-barons-de-rothschild.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HEIDSIECK & CO. MONOPOLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_champagne.sql)'
from (values
  ('Heidsieck & Co. Monopole', 'Blue Top', 'Champagne, France', null, 'Sparkling')  -- https://www.millesima.co.uk/producer-heidsieck-co-monopole.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
