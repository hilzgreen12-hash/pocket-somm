-- ============================================================================
-- wines_catalog seed — Famille Perrin portfolio (Rhône, Provence, Paso Robles)
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent (search_key auto-normalises via the
-- BEFORE INSERT/UPDATE trigger; ON CONFLICT DO NOTHING).
--
-- Why: Canadian users scanned "Famille Perrin Les Sinards" (Châteauneuf-du-Pape)
-- and Vinster didn't recognise it. The catalogue held only Beaucastel, La Vieille
-- Ferme, Nicolas Perrin, Miraval and two Famille Perrin rows.
--
-- EVERY row below was verified against a real page on 2026-11-26 (URL on each row).
-- Main source: the family's own tech-sheet catalogue (vincod.com, the same thing as
-- m.familleperrin.com) and the "Terroirs" page at
-- https://www.familleperrin.com/les-vins/terroirs/ . Grapes come only from the
-- page cited; null where it doesn't state them.
--
-- Rows already in wines_catalog (Beaucastel CdP rouge/blanc/Roussanne VV, Hommage,
-- Coudoulet rouge/blanc, La Vieille Ferme Rouge/Blanc/Rosé/Réserve, Nicolas Perrin
-- Condrieu/Cornas/Hermitage/Côte-Rôtie, Miraval Rosé/Blanc/Muse/Studio rosé/Éclat,
-- Fleur de Miraval, Perrin & Fils Réserve CdR Rouge) are left out on purpose.
--
-- Every row is inserted as verification_status 'verified' (verified_source
-- 'producer-site'), so Wine Intel's identity check leans on it.
--
-- Naming: red cuvées have no colour suffix; whites and rosés end in "Blanc" / "Rosé".
-- ============================================================================

-- ---- FAMILLE PERRIN — Les Crus (Côtes du Rhône range + Southern Rhône crus) ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'producer-site', now(), 'Famille Perrin range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/famille_perrin_range.sql)'
from (values
  ('Famille Perrin', 'Châteauneuf-du-Pape Les Sinards', 'Châteauneuf-du-Pape, Southern Rhône, France', 'Grenache/Mourvèdre/Syrah', 'Red'),          -- https://vincod.com/TU2V8F ; https://www.lcbo.com/en/famille-perrin-les-sinards-ch-teauneuf-du-pape-926626
  ('Famille Perrin', 'Châteauneuf-du-Pape Les Sinards Blanc', 'Châteauneuf-du-Pape, Southern Rhône, France', 'Clairette/Grenache Blanc/Roussanne', 'White'), -- https://vincod.com/M2UXCF ; https://www.familleperrin.com/wine/famille-perrin-chateauneuf-du-pape-les-sinards-blanc/
  ('Famille Perrin', 'Gigondas La Gille', 'Gigondas, Southern Rhône, France', 'Grenache/Syrah', 'Red'),                                         -- https://vincod.com/TX8I2F ; https://www.familleperrin.com/wine/famille-perrin-gigondas-la-gille/
  ('Famille Perrin', 'Vacqueyras Les Christins', 'Vacqueyras, Southern Rhône, France', 'Grenache/Syrah', 'Red'),                                -- https://vincod.com/V2S95F
  ('Famille Perrin', 'Vacqueyras Les Christins Blanc', 'Vacqueyras, Southern Rhône, France', 'Bourboulenc/Clairette/Grenache Blanc', 'White'),  -- https://vincod.com/FKP2QF
  ('Famille Perrin', 'Rasteau L''Andéol', 'Rasteau, Southern Rhône, France', 'Grenache/Syrah', 'Red'),                                         -- https://vincod.com/SLVI2F ; https://www.familleperrin.com/wine/famille-perrin-rasteau-landeol/
  ('Famille Perrin', 'Cairanne Peyre Blanche', 'Cairanne, Southern Rhône, France', 'Grenache/Syrah', 'Red'),                                    -- https://vincod.com/S39W2F ; https://www.familleperrin.com/wine/famille-perrin-cairanne-peyre-blanche/
  ('Famille Perrin', 'Cairanne Peyre Blanche Blanc', 'Cairanne, Southern Rhône, France', 'Clairette/Grenache Blanc/Roussanne', 'White'),       -- https://vincod.com/V9F2MF
  ('Famille Perrin', 'Vinsobres Les Cornuds', 'Vinsobres, Southern Rhône, France', 'Grenache/Syrah', 'Red'),                                    -- https://vincod.com/BFZ2IF
  ('Famille Perrin', 'Tavel Rosé', 'Tavel, Southern Rhône, France', 'Cinsault/Grenache/Mourvèdre', 'Rosé'),                                    -- https://vincod.com/DCY1PF
  ('Famille Perrin', 'Muscat de Beaumes-de-Venise', 'Muscat de Beaumes-de-Venise, Southern Rhône, France', 'Muscat Blanc à Petits Grains/Muscat Blanc à Gros Grains', 'Fortified'), -- https://vincod.com/L1E1HF (VDN)
  ('Famille Perrin', 'Côtes du Rhône Villages', 'Côtes du Rhône Villages, Southern Rhône, France', 'Grenache/Syrah', 'Red'),                  -- https://vincod.com/YFI2YF ; https://www.familleperrin.com/wine/famille-perrin-cotes-du-rhone-villages/
  ('Famille Perrin', 'Côtes du Rhône Réserve Blanc', 'Côtes du Rhône, Southern Rhône, France', 'Grenache Blanc/Marsanne/Roussanne/Viognier', 'White'), -- https://vincod.com/C2TXNF
  ('Famille Perrin', 'Côtes du Rhône Réserve Rosé', 'Côtes du Rhône, Southern Rhône, France', 'Cinsault/Grenache/Mourvèdre/Syrah', 'Rosé'),   -- https://vincod.com/32HF2F
  ('Famille Perrin', 'Côtes du Rhône Signature', 'Côtes du Rhône, Southern Rhône, France', 'Grenache/Syrah', 'Red'),                          -- https://vincod.com/612QBF
  ('Famille Perrin', 'Côtes du Rhône Signature Blanc', 'Côtes du Rhône, Southern Rhône, France', 'Grenache Blanc/Marsanne/Roussanne/Viognier', 'White'), -- https://vincod.com/GA2GXF
  ('Famille Perrin', 'Côtes du Rhône Signature Rosé', 'Côtes du Rhône, Southern Rhône, France', 'Cinsault/Grenache/Mourvèdre/Syrah', 'Rosé'), -- https://vincod.com/2F248F
  ('Famille Perrin', 'Côtes du Rhône Cuvée Perrin', 'Côtes du Rhône, Southern Rhône, France', null, 'Red'),                                   -- https://vincod.com/CJ2B3F
  ('Famille Perrin', 'Côtes du Rhône Nature', 'Côtes du Rhône, Southern Rhône, France', null, 'Red'),                                        -- https://www.familleperrin.com/wine/famille-perrin-cotes-du-rhone-nature-rouge/ ; https://www.bbr.com/products-48287-2016-cotes-du-rhone-nature-rouge-la-famille-perrin
  ('Famille Perrin', 'Côtes du Rhône Nature Blanc', 'Côtes du Rhône, Southern Rhône, France', null, 'White'),                                 -- https://www.familleperrin.com/wine/famille-perrin-cotes-du-rhone-nature-blanc/
  ('Famille Perrin', 'Côtes du Rhône Nature Rosé', 'Côtes du Rhône, Southern Rhône, France', null, 'Rosé'),                                   -- https://www.familleperrin.com/wine/famille-perrin-cotes-du-rhone-nature-rose/
  ('Famille Perrin', 'Côtes du Rhône Les Grands Préaux Réserve', 'Côtes du Rhône, Southern Rhône, France', null, 'Red'),                      -- https://m.familleperrin.com/10IAYF/get/print (tech sheet 2023)
  ('Famille Perrin', 'Côtes du Rhône Les Grands Préaux Réserve Blanc', 'Côtes du Rhône, Southern Rhône, France', null, 'White'),              -- https://m.familleperrin.com/K1YNHF/get/print (tech sheet 2023)
  ('Famille Perrin', 'Ventoux', 'Ventoux, Southern Rhône, France', 'Carignan/Cinsault/Grenache/Syrah', 'Red'),                                -- https://vincod.com/IP2CCF
  ('Famille Perrin', 'Ventoux Rosé', 'Ventoux, Southern Rhône, France', 'Cinsault/Grenache/Syrah', 'Rosé'),                                   -- https://vincod.com/SY1LFF
  ('Famille Perrin', 'Luberon Blanc', 'Luberon, Southern Rhône, France', 'Bourboulenc/Grenache Blanc/Roussanne/Ugni Blanc', 'White'),         -- https://vincod.com/H29HKF
  ('Famille Perrin', 'Luberon Rosé', 'Luberon, Southern Rhône, France', 'Grenache/Mourvèdre/Syrah/Grenache Blanc/Vermentino', 'Rosé'),        -- https://vincod.com/F2G22F
  ('Famille Perrin', 'Chassangre Blanc', 'Sud de France, France', 'Grenache Blanc/Vermentino/Viognier', 'White'),                              -- https://vincod.com/ML20SF
  ('Famille Perrin', 'La Plume Blanc', 'Vin de France, France', 'Bourboulenc/Grenache Blanc/Ugni Blanc/Vermentino', 'White'),               -- https://vincod.com/E1523F
  ('Famille Perrin', 'La Plume Rosé', 'Vin de France, France', 'Cinsault/Grenache/Syrah', 'Rosé'),                                            -- https://vincod.com/2Y2EJF
  ('Famille Perrin', 'La Grange St Martin Côtes du Rhône', 'Côtes du Rhône, Southern Rhône, France', 'Syrah/Grenache', 'Red'),               -- https://www.decanter.com/wine-reviews/france/rhone/slugs-100902/ (Co-op UK exclusive)
  ('Famille Perrin', 'Châteauneuf-du-Pape Le Grand Prébois', 'Châteauneuf-du-Pape, Southern Rhône, France', 'Grenache/Mourvèdre/Syrah', 'Red'), -- https://vincod.com/0IH6CF ; https://www.e.leclerc/fp/le-grand-prebois-2024-chateauneuf-du-pape-aop-rouge-75-cl-3296180005066
  ('Famille Perrin', 'Côtes du Rhône Le Grand Prébois', 'Côtes du Rhône, Southern Rhône, France', null, 'Red')                                -- https://shop.waddesdon.org.uk/collections/all/products/famille-perrin-le-grand-prebois-cote-du-rhone-rouge-2022-a-c-cotes-du-rhone-france
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- FAMILLE PERRIN — Sélections Parcellaires ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'producer-site', now(), 'Famille Perrin range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/famille_perrin_range.sql)'
from (values
  ('Famille Perrin', 'Châteauneuf-du-Pape Les Chapouins', 'Châteauneuf-du-Pape, Southern Rhône, France', 'Grenache/Mourvèdre/Syrah', 'Red'),  -- https://vincod.com/VX1CXF ; https://www.familleperrin.com/wine/famille-perrin-les-chapouins/
  ('Famille Perrin', 'Gigondas L''Argnée Vieilles Vignes', 'Gigondas, Southern Rhône, France', 'Grenache/Syrah', 'Red'),                    -- https://vincod.com/TV2Y8F ; https://www.familleperrin.com/wine/famille-perrin-largnee-vieilles-vignes/
  ('Famille Perrin', 'Vinsobres Les Hauts de Julien Vieilles Vignes', 'Vinsobres, Southern Rhône, France', 'Grenache/Syrah', 'Red'),       -- https://vincod.com/92C0GF ; https://www.familleperrin.com/wine/famille-perrin-les-hauts-de-julien-vieilles-vignes/
  ('Famille Perrin', 'Côtes du Rhône Brézème Domaine de Bréseyme', 'Côtes du Rhône Brézème, Northern Rhône, France', 'Syrah', 'Red'),       -- https://vincod.com/T3U92F ; https://lesalexandrins.com/nos-vins/produit-GN731F/
  ('Famille Perrin', 'Côtes du Rhône Brézème Domaine de Bréseyme Blanc', 'Côtes du Rhône Brézème, Northern Rhône, France', 'Viognier/Marsanne/Roussanne', 'White') -- https://vincod.com/82TWDF ; https://lesalexandrins.com/nos-vins/produit-1F370F/
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- DOMAINE DU CLOS DES TOURELLES (Gigondas) ----
-- The red is sold under the domaine name alone (wine_name null).
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'producer-site', now(), 'Famille Perrin range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/famille_perrin_range.sql)'
from (values
  ('Domaine du Clos des Tourelles', null, 'Gigondas, Southern Rhône, France', 'Grenache/Syrah', 'Red'),             -- https://vincod.com/G4BZ2F ; https://www.familleperrin.com/wine/domaine-du-clos-des-tourelles/
  ('Domaine du Clos des Tourelles', 'Blanc', 'Gigondas, Southern Rhône, France', 'Clairette/Roussanne', 'White')     -- https://vincod.com/TA2DRF
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- LA VIEILLE FERME (additional bottlings; Rouge/Blanc/Rosé/Réserve already exist) ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'producer-site', now(), 'Famille Perrin range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/famille_perrin_range.sql)'
from (values
  ('La Vieille Ferme', 'Ventoux Rouge', 'Ventoux, Southern Rhône, France', 'Carignan/Cinsault/Grenache/Syrah', 'Red'),                       -- https://vincod.com/4VK2LF
  ('La Vieille Ferme', 'Ventoux Rosé', 'Ventoux, Southern Rhône, France', 'Cinsault/Grenache/Syrah', 'Rosé'),                               -- https://vincod.com/1SCYSF
  ('La Vieille Ferme', 'Luberon Blanc', 'Luberon, Southern Rhône, France', 'Bourboulenc/Grenache Blanc/Roussanne/Ugni Blanc/Vermentino', 'White'), -- https://vincod.com/FV202F
  ('La Vieille Ferme', 'Luberon Rosé', 'Luberon, Southern Rhône, France', 'Cinsault/Grenache/Syrah', 'Rosé'),                               -- https://vincod.com/J5XB2F
  ('La Vieille Ferme', 'Côtes du Rhône Villages Rouge', 'Côtes du Rhône Villages, Southern Rhône, France', 'Grenache/Mourvèdre/Syrah', 'Red'), -- https://vincod.com/2JWIHF
  ('La Vieille Ferme', 'Sparkling Blanc', 'Vin de France, France', 'Chardonnay/Ugni Blanc', 'Sparkling'),                                 -- https://vincod.com/QEFL8F
  ('La Vieille Ferme', 'Sparkling Rosé', 'Vin de France, France', 'Grenache/Cinsault/Pinot Noir', 'Sparkling')                            -- https://vincod.com/QMFFIF
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- MAISON / DOMAINE LES ALEXANDRINS (Northern Rhône; Nicolas Perrin's house, listed by Famille Perrin) ----
-- Full range: https://lesalexandrins.com/pages/collection-complete
-- Existing "Nicolas Perrin" / "Maison Nicolas Perrin" rows are the earlier label and are left alone.
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'producer-site', now(), 'Famille Perrin range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/famille_perrin_range.sql)'
from (values
  ('Maison Les Alexandrins', 'Condrieu', 'Condrieu, Northern Rhône, France', null, 'White'),                                    -- https://lesalexandrins.com/pages/collection-complete
  ('Maison Les Alexandrins', 'Cornas', 'Cornas, Northern Rhône, France', null, 'Red'),                                          -- https://lesalexandrins.com/nos-vins/produit-GA1T5F/
  ('Maison Les Alexandrins', 'Côte-Rôtie', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),                                  -- http://lesalexandrins.com/nos-vins/produit-ID14IF
  ('Maison Les Alexandrins', 'Hermitage', 'Hermitage, Northern Rhône, France', null, 'Red'),                                    -- http://lesalexandrins.com/nos-vins/produit-14039F
  ('Maison Les Alexandrins', 'Hermitage Blanc', 'Hermitage, Northern Rhône, France', null, 'White'),                            -- https://lesalexandrins.com/nos-vins/produit-HI14AF/
  ('Maison Les Alexandrins', 'Crozes-Hermitage', 'Crozes-Hermitage, Northern Rhône, France', null, 'Red'),                      -- http://lesalexandrins.com/nos-vins/produit-591N4F/
  ('Maison Les Alexandrins', 'Crozes-Hermitage Blanc', 'Crozes-Hermitage, Northern Rhône, France', null, 'White'),              -- http://lesalexandrins.com/nos-vins/produit-QRI12F/
  ('Maison Les Alexandrins', 'Saint-Joseph', 'Saint-Joseph, Northern Rhône, France', null, 'Red'),                              -- https://lesalexandrins.com/nos-vins/produit-1KK24F/
  ('Maison Les Alexandrins', 'Saint-Joseph Blanc', 'Saint-Joseph, Northern Rhône, France', null, 'White'),                      -- http://lesalexandrins.com/nos-vins/produit-R1R12F
  ('Maison Les Alexandrins', 'Terrasses de l''Eridan', 'Côtes du Rhône, Northern Rhône, France', null, 'Red'),                  -- http://lesalexandrins.com/nos-vins/produit-JXHJ6F/
  ('Maison Les Alexandrins', 'Terrasses de l''Eridan Blanc', 'Côtes du Rhône, Northern Rhône, France', null, 'White'),          -- http://lesalexandrins.com/nos-vins/produit-125KEF/
  ('Maison Les Alexandrins', 'Craies Rouges', 'Collines Rhodaniennes, Northern Rhône, France', null, 'Red'),                    -- https://lesalexandrins.com/pages/collection-complete
  ('Maison Les Alexandrins', 'Craies Blanches', 'Collines Rhodaniennes, Northern Rhône, France', null, 'White'),                -- https://lesalexandrins.com/pages/collection-complete
  ('Domaine Les Alexandrins', 'Crozes-Hermitage Les Chaflans', 'Crozes-Hermitage, Northern Rhône, France', null, 'Red'),        -- http://lesalexandrins.com/nos-vins/produit-419PQF ; https://lesalexandrins.com/pages/collection-complete
  ('Domaine Les Alexandrins', 'Crozes-Hermitage Les Garennes Blanc', 'Crozes-Hermitage, Northern Rhône, France', null, 'White'), -- http://lesalexandrins.com/nos-vins/produit-RT914F ; https://lesalexandrins.com/pages/collection-complete
  ('Domaine Les Alexandrins', 'Condrieu La Caille', 'Condrieu, Northern Rhône, France', null, 'White'),                         -- https://lesalexandrins.com/nos-vins/produit-RE12SF/ ; https://lesalexandrins.com/pages/collection-complete
  ('Domaine Les Alexandrins', 'Saint-Joseph Les Ponts', 'Saint-Joseph, Northern Rhône, France', null, 'Red')                    -- https://lesalexandrins.com/nos-vins/produit-K94Q1F/ ; https://lesalexandrins.com/pages/collection-complete
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- MIRAVAL (Provence; Perrin co-owned) — only the bottlings not already present ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'producer-site', now(), 'Famille Perrin range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/famille_perrin_range.sql)'
from (values
  ('Château Miraval', 'Studio Blanc by Miraval', 'Méditerranée, Provence, France', 'Grenache Blanc/Rolle', 'White'),                              -- https://vincod.com/2VWQJF
  ('Château Miraval', 'Côtes de Provence Cru Sainte-Victoire Rosé', 'Côtes de Provence Sainte-Victoire, Provence, France', 'Cinsault/Grenache/Syrah', 'Rosé') -- https://vincod.com/FL226F
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- TABLAS CREEK VINEYARD (Paso Robles; Perrin–Haas partnership) ----
-- Source for all rows: https://tablascreek.com/story/vineyard_and_winemaking/our_wines
-- (also listed on https://www.familleperrin.com/les-vins/terroirs/)
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'producer-site', now(), 'Famille Perrin range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/famille_perrin_range.sql)'
from (values
  ('Tablas Creek Vineyard', 'Esprit de Tablas', 'Paso Robles, California, USA', null, 'Red'),
  ('Tablas Creek Vineyard', 'Esprit de Tablas Blanc', 'Paso Robles, California, USA', null, 'White'),
  ('Tablas Creek Vineyard', 'Côtes de Tablas', 'Paso Robles, California, USA', null, 'Red'),
  ('Tablas Creek Vineyard', 'Côtes de Tablas Blanc', 'Paso Robles, California, USA', null, 'White'),
  ('Tablas Creek Vineyard', 'Patelin de Tablas', 'Paso Robles, California, USA', null, 'Red'),
  ('Tablas Creek Vineyard', 'Patelin de Tablas Blanc', 'Paso Robles, California, USA', null, 'White'),
  ('Tablas Creek Vineyard', 'Patelin de Tablas Rosé', 'Paso Robles, California, USA', null, 'Rosé'),
  ('Tablas Creek Vineyard', 'Dianthus', 'Paso Robles, California, USA', null, 'Rosé')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- Verify:
--   select producer, wine_name, region, style from public.wines_catalog
--   where producer ~* '(perrin|tourelles|alexandrins|vieille ferme|miraval|tablas)'
--   order by producer, wine_name;
