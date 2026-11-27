-- ============================================================================
-- wines_catalog seed — French producer ranges, round 2 (Champagne houses,
-- Alsace, Loire, Provence and Bordeaux brands)
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent: search_key is set by the BEFORE
-- INSERT/UPDATE trigger (mig 102); existing rows are only upgraded to 'verified'.
--
-- EVERY row was confirmed on a real page on 2026-11-26 (URL on each row).
-- Grapes only where the cited page (or the wine's own name) states them.
-- Current ranges only: library / collector / one-off releases left out.

-- ---- MOËT & CHANDON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Moët & Chandon', 'Brut Impérial', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-int/moet-imperial
  ('Moët & Chandon', 'Rosé Impérial', 'Champagne, France', null, 'Rosé'),  -- https://www.moet.com/en-int/rose-imperial
  ('Moët & Chandon', 'Nectar Impérial', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-int/nectar-imperial
  ('Moët & Chandon', 'Nectar Impérial Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.moet.com/en-int/nectar-imperial-rose
  ('Moët & Chandon', 'Ice Impérial', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-int/ice-imperial
  ('Moët & Chandon', 'Ice Impérial Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.moet.com/en-int/ice-imperial-rose
  ('Moët & Chandon', 'Grand Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.moet.com/en-int/grand-vintage-2016
  ('Moët & Chandon', 'Grand Vintage Rosé', 'Champagne, France', null, 'Rosé')   -- https://www.moet.com/en-int/grand-vintage-rose-2016
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VEUVE CLICQUOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Veuve Clicquot', 'Yellow Label Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-int/our-champagnes/our-champagnes/brut-yellow-label/
  ('Veuve Clicquot', 'Brut Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.veuveclicquot.com/en-int/our-champagnes/our-champagnes/brut-rose/
  ('Veuve Clicquot', 'Rich', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-int/our-champagnes/our-champagnes/rich-and-rich-rose/
  ('Veuve Clicquot', 'Rich Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.veuveclicquot.com/en-int/our-champagnes/our-champagnes/rich-and-rich-rose/
  ('Veuve Clicquot', 'Demi-Sec', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-int/veuve-clicquot-demi-sec-1047679.html
  ('Veuve Clicquot', 'Extra Brut Extra Old', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-int/our-champagnes/our-champagnes/extra-brut-extra-old/
  ('Veuve Clicquot', 'La Grande Dame', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-int/la-grande-dame/
  ('Veuve Clicquot', 'La Grande Dame Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.veuveclicquot.com/en-int/la-grande-dame/our-latest-vintages-champagnes/la-grande-dame-rose-2015/
  ('Veuve Clicquot', 'Vintage Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.veuveclicquot.com/en-int/our-champagnes/our-champagnes/vintage-and-cave-privee/
  ('Veuve Clicquot', 'Vintage Rosé Brut', 'Champagne, France', null, 'Rosé')   -- https://www.veuveclicquot.com/en-int/our-champagnes/our-champagnes/vintage-and-cave-privee/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TAITTINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Taittinger', 'Brut Réserve', 'Champagne, France', null, 'Sparkling'),  -- https://taittinger.com/en/faq
  ('Taittinger', 'Prestige Rosé', 'Champagne, France', null, 'Rosé'),  -- https://taittinger.com/en/faq
  ('Taittinger', 'Nocturne', 'Champagne, France', null, 'Sparkling'),  -- https://taittinger.com/en/faq
  ('Taittinger', 'Nocturne Rosé', 'Champagne, France', null, 'Rosé'),  -- https://taittinger.com/en/faq
  ('Taittinger', 'Prélude Grands Crus', 'Champagne, France', null, 'Sparkling'),  -- https://taittinger.com/en/faq
  ('Taittinger', 'Brut Millésimé', 'Champagne, France', null, 'Sparkling'),  -- https://taittinger.com/en/faq
  ('Taittinger', 'Folies de la Marquetterie', 'Champagne, France', null, 'Sparkling'),  -- https://taittinger.com/en/faq
  ('Taittinger', 'Demi Sec', 'Champagne, France', null, 'Sparkling'),  -- https://taittinger.com/en/faq
  ('Taittinger', 'Comtes de Champagne Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://taittinger.com/en/faq
  ('Taittinger', 'Comtes de Champagne Rosé', 'Champagne, France', null, 'Rosé')   -- https://taittinger.com/en/faq
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOLLINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Bollinger', 'Special Cuvée', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/wine/special-cuvee/
  ('Bollinger', 'Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.champagne-bollinger.com/en/wine/bollinger-rose/
  ('Bollinger', 'La Grande Année', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/grande-annee
  ('Bollinger', 'La Grande Année Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.champagne-bollinger.com/en/the-collection/grande-annee-rose
  ('Bollinger', 'R.D.', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/bollinger-rd
  ('Bollinger', 'PN', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/bollinger-pn
  ('Bollinger', 'La Côte aux Enfants Champagne', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/cote-enfants-champagne
  ('Bollinger', 'Vieilles Vignes Françaises', 'Champagne, France', null, 'Sparkling'),  -- https://www.champagne-bollinger.com/en/the-collection/vieilles-vignes-francaises
  ('Bollinger', 'La Côte aux Enfants', 'Coteaux Champenois, Champagne, France', null, 'Red')   -- https://www.champagne-bollinger.com/en/the-collection/cote-enfants
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAURENT-PERRIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Laurent-Perrier', 'La Cuvée', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/la-cuvee/
  ('Laurent-Perrier', 'Cuvée Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.laurent-perrier.com/en/champagnes/cuvee-rose/
  ('Laurent-Perrier', 'Ultra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/ultra-brut/
  ('Laurent-Perrier', 'Blanc de Blancs Brut Nature', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/blanc-de-blancs-brut-nature/
  ('Laurent-Perrier', 'Harmony', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/harmony/
  ('Laurent-Perrier', 'Héritage', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/heritage/
  ('Laurent-Perrier', 'Brut Millésimé', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/brut-millesime/
  ('Laurent-Perrier', 'Grand Siècle', 'Champagne, France', null, 'Sparkling'),  -- https://www.laurent-perrier.com/en/champagnes/grand-siecle/
  ('Laurent-Perrier', 'Alexandra Rosé Millésimé', 'Champagne, France', null, 'Rosé')   -- https://www.laurent-perrier.com/en/champagnes/alexandra-rose-millesime/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- POL ROGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Pol Roger', 'Brut Réserve', 'Champagne, France', null, 'Sparkling'),  -- https://www.polroger.com/en/champagnes
  ('Pol Roger', 'Pure', 'Champagne, France', null, 'Sparkling'),  -- https://www.polroger.com/en/champagnes
  ('Pol Roger', 'Rich', 'Champagne, France', null, 'Sparkling'),  -- https://www.polroger.com/en/champagnes
  ('Pol Roger', 'Brut Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.polroger.com/en/champagnes
  ('Pol Roger', 'Blanc de Blancs Vintage', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.polroger.com/en/champagnes
  ('Pol Roger', 'Rosé Vintage', 'Champagne, France', null, 'Rosé'),  -- https://www.polroger.com/en/champagnes
  ('Pol Roger', 'Cuvée Sir Winston Churchill', 'Champagne, France', null, 'Sparkling')   -- https://www.polroger.com/en/champagnes
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOUIS ROEDERER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Louis Roederer', 'Collection 246', 'Champagne, France', null, 'Sparkling'),  -- https://app.louis-roederer.com/QR/01/04/-/2021/C/
  ('Louis Roederer', 'Collection 247', 'Champagne, France', null, 'Sparkling'),  -- https://www.systembolaget.se/produkt/vin/760201/
  ('Louis Roederer', 'Brut Premier', 'Champagne, France', null, 'Sparkling'),  -- https://www.louis-roederer.com/en/wines
  ('Louis Roederer', 'Carte Blanche', 'Champagne, France', null, 'Sparkling'),  -- https://www.louis-roederer.com/en/wines
  ('Louis Roederer', 'Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.louis-roederer.com/en/wines
  ('Louis Roederer', 'Rosé Vintage', 'Champagne, France', null, 'Rosé'),  -- https://www.louis-roederer.com/en/wines
  ('Louis Roederer', 'Blanc de Blancs Vintage', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.louis-roederer.com/en/wines
  ('Louis Roederer', 'Cristal', 'Champagne, France', null, 'Sparkling'),  -- https://www.louis-roederer.com/en/wines
  ('Louis Roederer', 'Cristal Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.louis-roederer.com/en/wines
  ('Louis Roederer', 'Brut Nature', 'Champagne, France', null, 'Sparkling'),  -- https://www.louis-roederer.com/en/wines
  ('Louis Roederer', 'Hommage à Camille Blanc', 'Coteaux Champenois, Champagne, France', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/france/champagne/louis-roederer-hommage-a-camille-coteaux-champenois-2022-89274
  ('Louis Roederer', 'Hommage à Camille Rouge', 'Coteaux Champenois, Champagne, France', 'Pinot Noir', 'Red')   -- https://decanter.com/wine-reviews/france/champagne/louis-roederer-camille-hommage-rouge-coteaux-champenois-49126
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NICOLAS FEUILLATTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Nicolas Feuillatte', 'Réserve Exclusive Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.palmbay.com/wines/champagne-nicolas-feuillatte/
  ('Nicolas Feuillatte', 'Réserve Exclusive Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.palmbay.com/wines/champagne-nicolas-feuillatte/r%C3%A9serve-exclusive-ros%C3%A9/
  ('Nicolas Feuillatte', 'Réserve Exclusive Premier Cru Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.saq.com/en/15115732
  ('Nicolas Feuillatte', 'Collection Organic Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.saq.com/en/14879562
  ('Nicolas Feuillatte', 'Brut Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.palmbay.com/wines/champagne-nicolas-feuillatte/
  ('Nicolas Feuillatte', 'Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.palmbay.com/wines/champagne-nicolas-feuillatte/
  ('Nicolas Feuillatte', 'Grand Cru Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.palmbay.com/wines/champagne-nicolas-feuillatte/
  ('Nicolas Feuillatte', 'Grand Cru Blanc de Noirs', 'Champagne, France', null, 'Sparkling'),  -- https://www.palmbay.com/wines/champagne-nicolas-feuillatte/
  ('Nicolas Feuillatte', 'Palmes d''Or Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.palmbay.com/wines/champagne-nicolas-feuillatte/
  ('Nicolas Feuillatte', 'Palmes d''Or Rosé Intense', 'Champagne, France', null, 'Rosé')   -- https://www.palmbay.com/wines/champagne-nicolas-feuillatte/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PIPER-HEIDSIECK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Piper-Heidsieck', 'Cuvée Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/cuvee-brut/
  ('Piper-Heidsieck', 'Brut Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.piper-heidsieck.com/en/wine/brut-rose/
  ('Piper-Heidsieck', 'Cuvée Sublime', 'Champagne, France', null, 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/cuvee-sublime/
  ('Piper-Heidsieck', 'Riviera', 'Champagne, France', null, 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/riviera/
  ('Piper-Heidsieck', 'Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/vintage-2018/
  ('Piper-Heidsieck', 'Essentiel Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/essentiel/
  ('Piper-Heidsieck', 'Essentiel Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.piper-heidsieck.com/en/wine/essentiel-blanc-de-blancs/
  ('Piper-Heidsieck', 'Essentiel Blanc de Noirs', 'Champagne, France', null, 'Sparkling')   -- https://www.piper-heidsieck.com/en/wine/essentiel-blanc-de-noirs/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LANSON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Lanson', 'Le Black Création', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/le-black-creation
  ('Lanson', 'Le Rosé Création', 'Champagne, France', null, 'Rosé'),  -- https://lanson.com/en/products/le-rose-creation
  ('Lanson', 'Vibrant Edition', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/vibrant-edition
  ('Lanson', 'Le Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://lanson.com/en/products/le-blanc-de-blancs
  ('Lanson', 'Le White Label Sec', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/le-white-label
  ('Lanson', 'Le Vintage', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/le-vintage-2014
  ('Lanson', 'Le Green Bio-Organic', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/le-green-bio-organic
  ('Lanson', 'Le Réserve Extra Brut', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/le-reserve-extra-brut
  ('Lanson', 'Le Clos Lanson', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/le-clos-lanson
  ('Lanson', 'Noble Champagne', 'Champagne, France', null, 'Sparkling'),  -- https://lanson.com/en/products/noble-champagne-brut-vintage
  ('Lanson', 'Noble Champagne Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling')   -- https://lanson.com/en/products/noble-champagne-blanc-de-blancs-vintage
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- G.H. MUMM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('G.H. Mumm', 'Cordon Rouge', 'Champagne, France', null, 'Sparkling'),  -- https://www.mumm.com/en-ww/product/cordon-rouge-new-repack/
  ('G.H. Mumm', 'Le Rosé', 'Champagne, France', null, 'Rosé'),  -- https://www.mumm.com/en-ww/product/le-rose-redesign/
  ('G.H. Mumm', 'Mumm 4', 'Champagne, France', null, 'Sparkling'),  -- https://www.mumm.com/en-ww/product/mumm-4-new-pack/
  ('G.H. Mumm', 'Ice Xtra', 'Champagne, France', null, 'Sparkling'),  -- https://www.mumm.com/en-ww/product/mumm-ice-xtra/
  ('G.H. Mumm', 'Millésimé', 'Champagne, France', null, 'Sparkling'),  -- https://www.mumm.com/en-ww/product/vintage-champagne-millesime-2019/
  ('G.H. Mumm', 'RSRV Blanc de Blancs', 'Champagne, France', 'Chardonnay', 'Sparkling'),  -- https://www.mumm.com/en-ww/our-champagnes/mumm-rsrv-blanc-de-blancs/
  ('G.H. Mumm', 'RSRV Blanc de Noirs', 'Champagne, France', 'Pinot Noir', 'Sparkling'),  -- https://www.mumm.com/en-ww/our-champagnes/mumm-rsrv-blanc-de-noirs/
  ('G.H. Mumm', 'Cuvée 4.5', 'Champagne, France', null, 'Sparkling'),  -- https://www.mumm.com/en-ww/product/cuvee-4-5-magnum/
  ('G.H. Mumm', 'Cuvée Lalou', 'Champagne, France', null, 'Sparkling')   -- https://www.mumm.com/en-ww/product/lalou-2008/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HUGEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Hugel', 'Gentil', 'Alsace, France', null, 'White'),  -- https://vincod.com/2498G1XEUE?preview=1
  ('Hugel', 'Riesling Classic', 'Alsace, France', 'Riesling', 'White'),  -- https://vincod.com/260G788JZT?preview=1
  ('Hugel', 'Sylvaner Classic', 'Alsace, France', 'Sylvaner', 'White'),  -- https://vincod.com/260G788JZT?preview=1
  ('Hugel', 'Muscat Classic', 'Alsace, France', 'Muscat', 'White'),  -- https://vincod.com/260G788JZT?preview=1
  ('Hugel', 'Pinot Gris Classic', 'Alsace, France', 'Pinot Gris', 'White'),  -- https://vincod.com/260G788JZT?preview=1
  ('Hugel', 'Gewurztraminer Classic', 'Alsace, France', 'Gewurztraminer', 'White'),  -- https://vincod.com/260G788JZT?preview=1
  ('Hugel', 'Pinot Noir Classic', 'Alsace, France', 'Pinot Noir', 'Red'),  -- https://frederickwildman.com/producers/famille-hugel/2023-famille-hugel-pinot-noir-classic/
  ('Hugel', 'Pinot Blanc Cuvée Les Amours', 'Alsace, France', 'Pinot Blanc', 'White'),  -- https://frederickwildman.com/producers/famille-hugel/2025-famille-hugel-pinot-blanc-cuvee-les-amours/
  ('Hugel', 'Riesling Estate', 'Alsace, France', 'Riesling', 'White'),  -- https://vincod.com/2497G1XDFG?preview=1
  ('Hugel', 'Pinot Gris Estate', 'Alsace, France', 'Pinot Gris', 'White'),  -- https://vincod.com/2497G1XDFG?preview=1
  ('Hugel', 'Gewurztraminer Estate', 'Alsace, France', 'Gewurztraminer', 'White'),  -- https://vincod.com/2497G1XDFG?preview=1
  ('Hugel', 'Riesling Grossi Laüe', 'Alsace Grand Cru, Alsace, France', 'Riesling', 'White'),  -- https://vincod.com/2605G20DAD?preview=1
  ('Hugel', 'Gewurztraminer Grossi Laüe', 'Alsace Grand Cru, Alsace, France', 'Gewurztraminer', 'White'),  -- https://vincod.com/2605G20DAD?preview=1
  ('Hugel', 'Pinot Noir Grossi Laüe', 'Alsace, France', 'Pinot Noir', 'Red'),  -- https://vincod.com/2605G20DAD?preview=1
  ('Hugel', 'Riesling Schoelhammer', 'Alsace Grand Cru, Alsace, France', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/germany/mosel/famille-hugel-schoelhammer-riesling-grand-cru-82583/
  ('Hugel', 'Riesling Vendange Tardive', 'Alsace, France', 'Riesling', 'White'),  -- https://vincod.com/264G7CKIZY?preview=1
  ('Hugel', 'Pinot Gris Vendange Tardive', 'Alsace, France', 'Pinot Gris', 'White'),  -- https://vincod.com/264G7CKIZY?preview=1
  ('Hugel', 'Gewurztraminer Vendange Tardive', 'Alsace, France', 'Gewurztraminer', 'White'),  -- https://vincod.com/264G7CKIZY?preview=1
  ('Hugel', 'Riesling Sélection de Grains Nobles', 'Alsace, France', 'Riesling', 'White'),  -- https://vincod.com/262G7AKXQ2?preview=1
  ('Hugel', 'Pinot Gris Sélection de Grains Nobles', 'Alsace, France', 'Pinot Gris', 'White'),  -- https://vincod.com/262G7AKXQ2?preview=1
  ('Hugel', 'Gewurztraminer Sélection de Grains Nobles', 'Alsace, France', 'Gewurztraminer', 'White')   -- https://vincod.com/262G7AKXQ2?preview=1
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TRIMBACH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Trimbach', 'Riesling', 'Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Pinot Blanc', 'Alsace, France', 'Auxerrois/Pinot Blanc', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Gewurztraminer', 'Alsace, France', 'Gewurztraminer', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Riesling Réserve', 'Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Riesling Vieilles Vignes', 'Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Sylvaner Weinbaum', 'Alsace, France', 'Sylvaner', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Pinot Gris Réserve', 'Alsace, France', 'Pinot Gris', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Gewurztraminer Réserve', 'Alsace, France', 'Gewurztraminer', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Pinot Noir Réserve', 'Alsace, France', 'Pinot Noir', 'Red'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Pinot Noir Cuve 7', 'Alsace, France', 'Pinot Noir', 'Red'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Muscat Réserve', 'Alsace, France', 'Muscat', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Pinot Gris Réserve Personnelle', 'Alsace, France', 'Pinot Gris', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Gewurztraminer Seigneurs de Ribeaupierre', 'Alsace, France', 'Gewurztraminer', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Riesling Hommage à Hubert Trimbach', 'Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Riesling Frédéric Emile', 'Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Riesling Grand Cru Mandelberg', 'Alsace Grand Cru, Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Riesling Grand Cru Schlossberg', 'Alsace Grand Cru, Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Riesling Grand Cru Geisberg', 'Alsace Grand Cru, Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Riesling Grand Cru Brand', 'Alsace Grand Cru, Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Riesling Clos Sainte Hune', 'Alsace, France', 'Riesling', 'White'),  -- https://www.trimbach.fr/clos-sainte-hune
  ('Trimbach', 'Pinot Gris Vendanges Tardives', 'Alsace, France', 'Pinot Gris', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Gewurztraminer Vendanges Tardives', 'Alsace, France', 'Gewurztraminer', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Pinot Gris Sélection de Grains Nobles', 'Alsace, France', 'Pinot Gris', 'White'),  -- https://www.trimbach.fr/vins-alsace
  ('Trimbach', 'Gewurztraminer Sélection de Grains Nobles', 'Alsace, France', 'Gewurztraminer', 'White')   -- https://www.trimbach.fr/vins-alsace
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PASCAL JOLIVET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Pascal Jolivet', 'Sancerre Blanc', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/produits/vins/signature/sancerre-blanc-signature-aop-sancerre/
  ('Pascal Jolivet', 'Sancerre Rosé', 'Sancerre, Loire Valley, France', null, 'Rosé'),  -- https://pascaljolivet.com/produits/vins/signature/sancerre-rose-signature/
  ('Pascal Jolivet', 'Sancerre Rouge', 'Sancerre, Loire Valley, France', null, 'Red'),  -- https://pascaljolivet.com/produits/vins/signature/sancerre-rouge-signature/
  ('Pascal Jolivet', 'Blanc Fumé', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/produits/vins/signature/blanc-fume/
  ('Pascal Jolivet', 'Sancerre Les Caillottes', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/produits/vins/sancerre/sancerre-blanc-les-caillottes/
  ('Pascal Jolivet', 'Pouilly-Fumé Terres Blanches', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/produits/vins/sancerre/pouilly-fume-terres-blanches-sauvignon-blanc/
  ('Pascal Jolivet', 'Sancerre Clos du Roy', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/produits/vins/parcellaires/sancerre-blanc-clos-du-roy/
  ('Pascal Jolivet', 'Sancerre Le Grand Chemarin', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/produits/vins/parcellaires/sancerre-blanc-le-grand-chemarin/
  ('Pascal Jolivet', 'Sancerre Le Chêne Marchand', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/produits/vins/parcellaires/sancerre-blanc-le-chene-marchand/
  ('Pascal Jolivet', 'Sancerre Le Roc', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/produits/vins/parcellaires/sancerre-blanc-le-roc/
  ('Pascal Jolivet', 'Sancerre Rouge La Bondenotte', 'Sancerre, Loire Valley, France', null, 'Red'),  -- https://pascaljolivet.com/produits/vins/parcellaires/sancerre-rouge-la-bondenotte/
  ('Pascal Jolivet', 'Pouilly-Fumé Les Griottes', 'Pouilly-Fumé, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/nos-vins/les-parcellaires/
  ('Pascal Jolivet', 'Sancerre Sauvage', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/produits/vins/pure-expression/sancerre-blanc-sauvage/
  ('Pascal Jolivet', 'Sancerre Rouge Autochtone', 'Sancerre, Loire Valley, France', null, 'Red'),  -- https://pascaljolivet.com/nos-vins/pure-expression/
  ('Pascal Jolivet', 'Pouilly-Fumé Indigène', 'Pouilly-Fumé, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/produits/vins/pure-expression/pouilly-fume-indigene/
  ('Pascal Jolivet', 'Attitude Sauvignon Blanc', 'Val de Loire IGP, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/produits/vins/attitude/sauvignon-blanc-attitude-igp-du-val-de-loire/
  ('Pascal Jolivet', 'Attitude Pinot Noir', 'Val de Loire IGP, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://pascaljolivet.com/produits/vins/attitude/pinot-noir-attitude-igp-du-val-de-loire/
  ('Pascal Jolivet', 'Attitude Rosé', 'Loire Valley, France', null, 'Rosé'),  -- https://pascaljolivet.com/produits/vins/attitude/attitude-rose/
  ('Pascal Jolivet', 'Édition Blanc', 'Coteaux du Giennois, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/produits/vins/edition/edition-n3-blanc/
  ('Pascal Jolivet', 'Édition Rouge', 'Coteaux du Giennois, Loire Valley, France', null, 'Red')   -- https://pascaljolivet.com/produits/vins/edition/edition-n3-rouge/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HENRI BOURGEOIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Henri Bourgeois', 'Grande Réserve Blanc', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'Grande Réserve Rouge', 'Sancerre, Loire Valley, France', null, 'Red'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'Grande Réserve Rosé', 'Sancerre, Loire Valley, France', null, 'Rosé'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'd''Antan', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'Jadis', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'ES-56 Blanc', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'La Bourgeoise', 'Sancerre, Loire Valley, France', null, 'Red'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'JS-150', 'Pouilly-Fumé, Loire Valley, France', null, 'White'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'La Demoiselle de Bourgeois', 'Pouilly-Fumé, Loire Valley, France', null, 'White'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'En Travertin', 'Pouilly-Fumé, Loire Valley, France', null, 'White'),  -- https://famillebourgeois-sancerre.com/
  ('Henri Bourgeois', 'Les Baronnes', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.ocado.com/products/henri-bourgeois-les-baronnes-sancerre/499528011
  ('Henri Bourgeois', 'La Côte des Monts Damnés', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White')   -- https://www.winespectator.com/wine/wine-detail/id/1335234/name/henri-bourgeois-sancerre-la-cote-des-monts-damnes-2024/guest
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DE LADOUCETTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('de Ladoucette', 'Pouilly-Fumé', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://mmdusa.net/portfolio/ladoucette/pouilly-fume-sauvignon-blanc/2024
  ('de Ladoucette', 'Baron de L', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://mmdusa.net/portfolio/ladoucette/baron-de-l-pouilly-fume-sauvignon-blanc/2022
  ('de Ladoucette', 'Comte Lafond Sancerre Blanc', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://mmdusa.net/portfolio/ladoucette/comte-lafond-sancerre-blanc/2025
  ('de Ladoucette', 'Comte Lafond Grande Cuvée Blanc', 'Sancerre, Loire Valley, France', null, 'White'),  -- https://mmdusa.net/portfolio/ladoucette/comte-lafond-grande-cuvee-blanc/2024
  ('de Ladoucette', 'Les Deux Tours Sauvignon Blanc', 'Touraine, Loire Valley, France', 'Sauvignon Blanc', 'White')   -- https://mmdusa.net/portfolio/ladoucette/les-deux-tours-sauvignon-blanc/2024
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU D'ESCLANS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Château d''Esclans', 'Whispering Angel', 'Côtes de Provence, Provence, France', 'Grenache/Cinsault/Rolle', 'Rosé'),  -- https://www.esclans.com/en-int/our-wines/whispering-angel
  ('Château d''Esclans', 'Rock Angel', 'Côtes de Provence, Provence, France', 'Grenache/Cinsault/Rolle/Syrah', 'Rosé'),  -- https://www.esclans.com/en-int/our-wines/rock-angel
  ('Château d''Esclans', 'Château d''Esclans', 'Côtes de Provence, Provence, France', 'Grenache/Rolle', 'Rosé'),  -- https://www.esclans.com/en-int/our-wines/chateau-desclans
  ('Château d''Esclans', 'Les Clans', 'Côtes de Provence, Provence, France', 'Grenache/Rolle', 'Rosé'),  -- https://www.esclans.com/en-int/our-wines/les-clans
  ('Château d''Esclans', 'Garrus', 'Côtes de Provence, Provence, France', 'Grenache/Rolle', 'Rosé'),  -- https://www.esclans.com/en-int/our-wines/garrus
  ('Château d''Esclans', 'The Beach', 'Coteaux d''Aix-en-Provence, Provence, France', 'Grenache/Cinsault/Syrah', 'Rosé'),  -- https://www.esclans.com/en-int/our-wines/beach
  ('Château d''Esclans', 'The Pale', 'IGP Var, Provence, France', 'Grenache/Cinsault/Rolle/Syrah', 'Rosé')   -- https://www.esclans.com/en-int/our-wines/pale
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MOUTON CADET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Mouton Cadet', 'Rouge', 'Bordeaux, France', 'Merlot/Cabernet Sauvignon/Cabernet Franc', 'Red'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-rouge/
  ('Mouton Cadet', 'Blanc', 'Bordeaux, France', 'Sauvignon Blanc/Sémillon/Muscadelle', 'White'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-blanc/
  ('Mouton Cadet', 'Rosé', 'Bordeaux, France', 'Merlot', 'Rosé'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-rose/
  ('Mouton Cadet', 'Rouge Bio', 'Bordeaux, France', 'Merlot/Cabernet Sauvignon/Cabernet Franc', 'Red'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-rouge-bio/
  ('Mouton Cadet', 'Les Terroirs Sauvignon Blanc', 'Bordeaux, France', 'Sauvignon Blanc', 'White'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-sauvignon-blanc/
  ('Mouton Cadet', 'Sélection Côtes de Bordeaux', 'Côtes de Bordeaux, Bordeaux, France', 'Merlot', 'Red'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-selection-cotes-de-bordeaux/
  ('Mouton Cadet', 'Sélection Haut-Médoc', 'Haut-Médoc, Bordeaux, France', 'Merlot/Cabernet Sauvignon', 'Red'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-selection-haut-medoc/
  ('Mouton Cadet', 'Cuvée Héritage', 'Bordeaux, France', 'Merlot/Cabernet Sauvignon', 'Red'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-cuvee-heritage/
  ('Mouton Cadet', 'Réserve Saint-Estèphe', 'Saint-Estèphe, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/vins/reserve-mouton-cadet-saint-estephe/
  ('Mouton Cadet', 'Réserve Pauillac', 'Pauillac, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-pauillac/
  ('Mouton Cadet', 'Réserve Pessac-Léognan', 'Pessac-Léognan, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-pessac-leognan/
  ('Mouton Cadet', 'Réserve Margaux', 'Margaux, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/vins/reserve-mouton-cadet-margaux/
  ('Mouton Cadet', 'Réserve Saint-Émilion', 'Saint-Émilion, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-saint-emilion/
  ('Mouton Cadet', 'Réserve Haut-Médoc', 'Haut-Médoc, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/vins/mouton-cadet-haut-medoc/
  ('Mouton Cadet', 'Réserve Médoc', 'Médoc, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/vins/reserve-mouton-cadet-medoc/
  ('Mouton Cadet', 'Réserve Graves Rouge', 'Graves, Bordeaux, France', null, 'Red'),  -- https://www.moutoncadet.com/en/vins/reserve-mouton-cadet-graves-rouge/
  ('Mouton Cadet', 'Réserve Graves Blanc', 'Graves, Bordeaux, France', null, 'White'),  -- https://www.moutoncadet.com/en/vins/reserve-mouton-cadet-graves-blanc/
  ('Mouton Cadet', 'Réserve Sauternes', 'Sauternes, Bordeaux, France', 'Sémillon/Sauvignon Blanc', 'White')   -- https://www.moutoncadet.com/en/vins/mouton-cadet-sauternes/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MINUTY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_france.sql)'
from (values
  ('Château Minuty', 'M de Minuty Rosé', 'Côtes de Provence, Provence, France', 'Grenache/Cinsault/Syrah/Tibouren', 'Rosé'),  -- https://www.systembolaget.se/produkt/vin/m-de-minuty-rose-2025-259001/
  ('Château Minuty', 'M de Minuty Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/en/wineries/minuty
  ('Château Minuty', 'M de Minuty Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.minuty.com/en/
  ('Château Minuty', 'Prestige Rosé', 'Côtes de Provence, Provence, France', 'Grenache/Syrah/Cinsault/Rolle', 'Rosé'),  -- https://www.systembolaget.se/7935301
  ('Château Minuty', 'Prestige Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/en/wineries/minuty
  ('Château Minuty', 'Prestige Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.minuty.com/en/
  ('Château Minuty', 'Rosé et Or', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/minuty
  ('Château Minuty', 'Blanc et Or', 'Côtes de Provence, Provence, France', 'Rolle/Sauvignon Blanc/Viognier', 'White'),  -- https://12bouteilles.com/en/chateau-minuty/5393-chateau-minuty-cuvee-blanc-et-or-2024.html
  ('Château Minuty', 'Rouge et Or', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.vivino.com/en/wineries/minuty
  ('Château Minuty', '281', 'Côtes de Provence, Provence, France', 'Grenache/Syrah', 'Rosé'),  -- https://www.decanter.com/wine-reviews/france/provence/chateau-minuty-281-cotes-de-provence-provence-2024-110988/
  ('Château Minuty', 'Gabriel', 'Provence, France', null, 'Red')   -- https://minuty.com/en/pages/gabriel
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
