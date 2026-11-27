-- Producer ranges round 9: southwest. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- CHÂTEAU DU CÈDRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château du Cèdre', null, 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.chateauducedre.com/cuvee/chateau-du-cedre
  ('Château du Cèdre', 'Cahors Le Cèdre', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.chateauducedre.com/cuvee/le-cedre
  ('Château du Cèdre', 'Cahors GC', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.chateauducedre.com/cuvee/gc
  ('Château du Cèdre', 'Cahors Juvéniles', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.chateauducedre.com/cuvee/juveniles
  ('Château du Cèdre', 'Cahors Extra Libre', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.chateauducedre.com/cuvee/extra-libre
  ('Château du Cèdre', 'Cahors Charly', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.chateauducedre.com/les-vins
  ('Château du Cèdre', 'Côtes du Lot Le Cèdre Blanc', 'Côtes du Lot, South-West France, France', 'Viognier', 'White'),  -- https://www.chateauducedre.com/cuvee/le-cedre-blanc
  ('Château du Cèdre', 'Côtes du Lot Les Grèzes', 'Côtes du Lot, South-West France, France', 'Sauvignon Blanc, Muscadelle', 'White'),  -- https://www.chateauducedre.com/cuvee/les-grezes
  ('Château du Cèdre', 'Sweet Malbec', 'Cahors, South-West France, France', 'Malbec', 'Fortified'),  -- https://www.chateauducedre.com/cuvee/sweet-malbec
  ('Château du Cèdre', 'Cahors Cèdre Héritage', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.vintageandvine.com/producers/south-west-france/chateau-du-cedre
  ('Château du Cèdre', 'Cèdre Héritage Blanc', 'South-West France, France', 'Chardonnay', 'White'),  -- https://www.vintageandvine.com/producers/south-west-france/chateau-du-cedre
  ('Château du Cèdre', 'Comté Tolosan Marcel Malbec', 'Comté Tolosan, South-West France, France', 'Malbec', 'Red')  -- https://www.vintageandvine.com/producers/south-west-france/chateau-du-cedre
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS TRIGUEDINA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Clos Triguedina', 'Cahors Probus', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.famille-baldes.com/clos-triguedina/
  ('Clos Triguedina', 'Cahors Probus Padirac Cuvée des 130 ans', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.jlbaldes.fr/produit/probus-padirac-2018-cuvee-des-130-ans-3eme-edition/
  ('Clos Triguedina', 'Cahors Cuvée Classique', 'Cahors, South-West France, France', 'Malbec, Merlot, Tannat', 'Red'),  -- https://www.famille-baldes.com/clos-triguedina/
  ('Clos Triguedina', 'Cahors Pavillon', 'Cahors, South-West France, France', 'Malbec, Merlot, Tannat', 'Red'),  -- https://www.jlbaldes.fr/produit/clos-triguedina-pavillion/
  ('Clos Triguedina', 'Cahors Malbec du Clos French Malbec', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.jlbaldes.fr/produit/malbec-du-closfrench-malbec/
  ('Clos Triguedina', 'Cahors Au Coin du Bois', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.famille-baldes.com/clos-triguedina/
  ('Clos Triguedina', 'Cahors Les Galets', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.famille-baldes.com/clos-triguedina/
  ('Clos Triguedina', 'Cahors Les Petites Cailles', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.famille-baldes.com/clos-triguedina/
  ('Clos Triguedina', 'Cahors The New Black Wine', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.famille-baldes.com/the-new-black-wine/
  ('Clos Triguedina', 'Comté Tolosan Viognier Chardonnay', 'Comté Tolosan, South-West France, France', 'Viognier, Chardonnay', 'White'),  -- https://www.jlbaldes.fr/produit/viognier-chardonnay/
  ('Clos Triguedina', 'Comté Tolosan Chenin-Or du Clos', 'Comté Tolosan, South-West France, France', 'Chenin Blanc', 'Sweet'),  -- https://www.jlbaldes.fr/produit/chenin/
  ('Clos Triguedina', 'Comté Tolosan The New Pink Wine', 'Comté Tolosan, South-West France, France', 'Malbec', 'Rosé'),  -- https://www.jlbaldes.fr/produit/the-new-pink-wine/
  ('Clos Triguedina', 'Côtes du Lot Bul''s', 'Côtes du Lot, South-West France, France', 'Malbec', 'Sparkling'),  -- https://www.jlbaldes.fr/produit/buls/
  ('Clos Triguedina', 'Black Vintage', 'Cahors, South-West France, France', 'Malbec', 'Fortified'),  -- https://www.jlbaldes.fr/produit/black-vintage/
  ('Clos Triguedina', 'Cahors Petit Clos', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.twil.fr/france/sud-ouest/clos-triguedina.html
  ('Clos Triguedina', 'Cahors Vin de Lune Malbec', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.twil.fr/france/sud-ouest/clos-triguedina.html
  ('Clos Triguedina', 'Comté Tolosan Vin de Lune Chenin Moelleux', 'Comté Tolosan, South-West France, France', 'Chenin Blanc', 'Sweet')  -- https://www.twil.fr/france/sud-ouest/clos-triguedina.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LAGRÉZETTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Lagrézette', null, 'Cahors, South-West France, France', null, 'Red'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Cahors Chevalier', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Cahors Cuvée Marguerite', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Cahors Lagrézette de MaSO', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Cahors Paragon', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Cahors Dame Honneur', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Cahors Le Pigeonnier', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Côtes du Lot Rosé de Julie', 'Côtes du Lot, South-West France, France', 'Malbec', 'Rosé'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Côtes du Lot Roseberry', 'Côtes du Lot, South-West France, France', null, 'Rosé'),  -- https://www.chateau-lagrezette.com/
  ('Château Lagrézette', 'Côtes du Lot Le Pigeonnier Rosé', 'Côtes du Lot, South-West France, France', null, 'Rosé'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Côtes du Lot Blanc de Julie', 'Côtes du Lot, South-West France, France', null, 'White'),  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
  ('Château Lagrézette', 'Côtes du Lot Le Pigeonnier Blanc', 'Côtes du Lot, South-West France, France', null, 'White')  -- https://www.chateau-lagrezette.com/collections/tous-nos-vins
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS LA COUTALE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Clos la Coutale', null, 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://closlacoutale.com/boutique/clos-la-coutale/
  ('Clos la Coutale', 'Cahors La Griotte', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://closlacoutale.com/boutique/la-griotte/
  ('Clos la Coutale', 'Cahors Grand Coutale', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://closlacoutale.com/boutique/grand-coutale/
  ('Clos la Coutale', 'Côtes du Lot Coutale Rosé', 'Côtes du Lot, South-West France, France', 'Malbec', 'Rosé')  -- https://closlacoutale.com/boutique/coutale-rose/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE COSSE MAISONNEUVE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Domaine Cosse Maisonneuve', 'Cahors Les Laquets', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://www.cosse-maisonneuve.fr/les-grandes-cuvee-de-cosse-and-maisonneuve.html
  ('Domaine Cosse Maisonneuve', 'Cahors La Marguerite', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.cosse-maisonneuve.fr/les-grandes-cuvee-de-cosse-and-maisonneuve.html
  ('Domaine Cosse Maisonneuve', 'Sidérolithe', 'South-West France, France', 'Cabernet Franc', 'Red'),  -- https://www.cosse-maisonneuve.fr/les-grandes-cuvee-de-cosse-and-maisonneuve.html
  ('Domaine Cosse Maisonneuve', 'Carmenet', 'South-West France, France', 'Cabernet Franc', 'Red'),  -- https://www.cosse-maisonneuve.fr/les-grandes-cuvee-de-cosse-and-maisonneuve.html
  ('Domaine Cosse Maisonneuve', 'Cahors La Fage', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.twil.fr/france/sud-ouest/domaine-cosse-maisonneuve.html
  ('Domaine Cosse Maisonneuve', 'Cahors Le Combal', 'Cahors, South-West France, France', null, 'Red')  -- https://www.twil.fr/france/sud-ouest/domaine-cosse-maisonneuve.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE HAUTE-SERRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château de Haute-Serre', 'Cahors Grand Malbec', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://hauteserre.fr/download/ft-grandmalbec-2023.pdf
  ('Château de Haute-Serre', 'Cahors Icône', 'Cahors, South-West France, France', 'Malbec', 'Red'),  -- https://hauteserre.fr/download/ft-icone-2020.pdf
  ('Château de Haute-Serre', 'Cahors Géron Dadine', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.twil.fr/france/sud-ouest/chateau-de-haute-serre.html
  ('Château de Haute-Serre', 'Cahors Lucter', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.twil.fr/france/sud-ouest/chateau-de-haute-serre.html
  ('Château de Haute-Serre', 'Cahors Georges', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.twil.fr/france/sud-ouest/chateau-de-haute-serre.html
  ('Château de Haute-Serre', 'Côtes du Lot Le Petit Serre', 'Côtes du Lot, South-West France, France', 'Malbec', 'Red'),  -- https://www.twil.fr/france/sud-ouest/chateau-de-haute-serre.html
  ('Château de Haute-Serre', 'Côtes du Lot Opuscule Pinot Noir', 'Côtes du Lot, South-West France, France', 'Pinot Noir', 'Red'),  -- https://www.twil.fr/france/sud-ouest/chateau-de-haute-serre.html
  ('Château de Haute-Serre', 'Côtes du Lot Opuscule Prunelard', 'Côtes du Lot, South-West France, France', 'Prunelard', 'Red'),  -- https://www.twil.fr/france/sud-ouest/chateau-de-haute-serre.html
  ('Château de Haute-Serre', 'Côtes du Lot Albesco', 'Côtes du Lot, South-West France, France', 'Chardonnay', 'White'),  -- https://www.twil.fr/france/sud-ouest/chateau-de-haute-serre.html
  ('Château de Haute-Serre', 'Côtes du Lot Cybèle', 'Côtes du Lot, South-West France, France', 'Malbec', 'Rosé'),  -- https://www.twil.fr/france/sud-ouest/chateau-de-haute-serre.html
  ('Château de Haute-Serre', 'Bellefleur Brut Rosé', 'South-West France, France', 'Malbec', 'Sparkling')  -- https://hauteserre.fr/fr/our-wines.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LAMARTINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Lamartine', null, 'Cahors, South-West France, France', null, 'Red'),  -- https://www.twil.fr/france/sud-ouest/chateau-lamartine.html
  ('Château Lamartine', 'Cahors Cuvée Particulière', 'Cahors, South-West France, France', null, 'Red'),  -- https://www.twil.fr/france/sud-ouest/chateau-lamartine.html
  ('Château Lamartine', 'Cahors Tandem', 'Cahors, South-West France, France', null, 'Red')  -- https://www.twil.fr/france/sud-ouest/chateau-lamartine.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU EUGÉNIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Eugénie', null, 'Cahors, South-West France, France', null, 'Red')  -- https://www.twil.fr/france/sud-ouest/chateau-eugenie.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MONTUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Montus', 'Pacherenc du Vic-Bilh Blanc Sec', 'Pacherenc du Vic-Bilh, South-West France, France', 'Petit Courbu', 'White'),  -- https://www.brumont.fr/fr/vin/16/montus-blanc-sec
  ('Château Montus', 'Madiran Rouge', 'Madiran, South-West France, France', 'Tannat, Cabernet Sauvignon', 'Red'),  -- https://www.brumont.fr/fr/vin/15/montus-rouge
  ('Château Montus', 'Madiran Prestige', 'Madiran, South-West France, France', 'Tannat', 'Red'),  -- https://www.brumont.fr/fr/vin/12/montus-prestige
  ('Château Montus', 'Madiran XL', 'Madiran, South-West France, France', 'Tannat', 'Red')  -- https://www.brumont.fr/fr/vin/13/montus-xl
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BOUSCASSÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Bouscassé', null, 'Madiran, South-West France, France', 'Tannat, Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.brumont.fr/fr/vin/18/bouscasse
  ('Château Bouscassé', 'Madiran Argile Rouge', 'Madiran, South-West France, France', 'Tannat, Cabernet Sauvignon, Cabernet Franc, Fer Servadou', 'Red'),  -- https://www.brumont.fr/fr/vin/19/argile-rouge
  ('Château Bouscassé', 'Madiran Vieilles Vignes', 'Madiran, South-West France, France', 'Tannat', 'Red'),  -- https://www.brumont.fr/fr/vin/17/vieilles-vignes
  ('Château Bouscassé', 'Pacherenc du Vic-Bilh Les Jardins Philosophiques', 'Pacherenc du Vic-Bilh, South-West France, France', 'Petit Courbu, Petit Manseng', 'White'),  -- https://www.brumont.fr/fr/vin/21/les-jardins-philosophiques
  ('Château Bouscassé', 'Pacherenc du Vic-Bilh Vendémiaire', 'Pacherenc du Vic-Bilh, South-West France, France', 'Petit Manseng', 'Sweet'),  -- https://www.brumont.fr/fr/vin/22/vendemiaire
  ('Château Bouscassé', 'Pacherenc du Vic-Bilh Brumaire', 'Pacherenc du Vic-Bilh, South-West France, France', 'Petit Manseng', 'Sweet'),  -- https://www.brumont.fr/fr/vin/23/brumaire
  ('Château Bouscassé', 'Pacherenc du Vic-Bilh Frimaire', 'Pacherenc du Vic-Bilh, South-West France, France', 'Petit Manseng', 'Sweet')  -- https://www.brumont.fr/fr/vin/24/frimaire
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALAIN BRUMONT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Alain Brumont', 'Pacherenc du Vic-Bilh Larmes Célestes', 'Pacherenc du Vic-Bilh, South-West France, France', 'Petit Manseng', 'Sweet'),  -- https://www.brumont.fr/fr/vin/25/larmes-celestes
  ('Alain Brumont', 'Côtes de Gascogne Menhir', 'Côtes de Gascogne, South-West France, France', 'Tannat, Merlot', 'Red'),  -- https://www.brumont.fr/fr/vin/20/menhir
  ('Alain Brumont', 'Madiran La Tyre', 'Madiran, South-West France, France', 'Tannat', 'Red')  -- https://www.brumont.fr/fr/vin/2/la-tyre
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE TARIQUET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Domaine de Tariquet', 'Côtes de Gascogne Classic', 'Côtes de Gascogne, South-West France, France', 'Ugni Blanc, Colombard, Gros Manseng, Sauvignon', 'White'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'Côtes de Gascogne Premières Grives', 'Côtes de Gascogne, South-West France, France', 'Gros Manseng', 'Sweet'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'Côtes de Gascogne St-Amand Le Blanc', 'Côtes de Gascogne, South-West France, France', 'Chardonnay, Gros Manseng, Sauvignon', 'White'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'Côtes de Gascogne St-Amand Le Rosé', 'Côtes de Gascogne, South-West France, France', 'Syrah, Marselan, Malbec', 'Rosé'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'Côtes de Gascogne St-Amand Le Rouge', 'Côtes de Gascogne, South-West France, France', 'Pinot Noir, Syrah', 'Red'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'Comté Tolosan St-Amand Les Bulles', 'Comté Tolosan, South-West France, France', 'Chenin, Chardonnay', 'Sparkling'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'Côtes de Gascogne Sauvignon', 'Côtes de Gascogne, South-West France, France', 'Sauvignon Blanc', 'White'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'Côtes de Gascogne Chardonnay', 'Côtes de Gascogne, South-West France, France', 'Chardonnay', 'White'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'Côtes de Gascogne Dernières Grives', 'Côtes de Gascogne, South-West France, France', 'Petit Manseng', 'Sweet'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'L''Idée Folle', 'South-West France, France', 'Gros Manseng, Chardonnay, Sauvignon, Folle Blanche', 'Fortified'),  -- https://www.tariquet.com/nos-vins/
  ('Domaine de Tariquet', 'Côtes de Gascogne Amplitude', 'Côtes de Gascogne, South-West France, France', 'Gros Manseng', 'White'),  -- https://www.tariquet.com/en/?p=14462
  ('Domaine de Tariquet', 'Gers Imprévu', 'Gers, South-West France, France', 'Riesling, Ugni Blanc', 'White'),  -- https://www.tariquet.com/en/?p=14462
  ('Domaine de Tariquet', 'Côtes de Gascogne Côté', 'Côtes de Gascogne, South-West France, France', 'Chardonnay, Sauvignon', 'White'),  -- https://www.tariquet.com/en/?p=14462
  ('Domaine de Tariquet', 'Côtes de Gascogne Réserve', 'Côtes de Gascogne, South-West France, France', 'Gros Manseng, Chardonnay, Sauvignon, Sémillon', 'White'),  -- https://www.tariquet.com/en/?p=14468
  ('Domaine de Tariquet', 'Côtes de Gascogne Chenin-Chardonnay', 'Côtes de Gascogne, South-West France, France', 'Chenin, Chardonnay', 'White'),  -- https://www.tariquet.com/en/?p=14462
  ('Domaine de Tariquet', 'Côtes de Gascogne Chardonnay Tête de Cuvée', 'Côtes de Gascogne, South-West France, France', 'Chardonnay', 'White'),  -- https://www.tariquet.com/en/?p=14462
  ('Domaine de Tariquet', 'Entracte Brut Nature', 'South-West France, France', null, 'Sparkling')  -- https://www.tariquet.com/en/?p=13848
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PLAIMONT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Plaimont', 'Saint-Mont Entre Nos Vignes Rouge', 'Saint-Mont, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge
  ('Plaimont', 'Madiran Petit Tom', 'Madiran, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge
  ('Plaimont', 'Côtes de Gascogne Corolle Rouge', 'Côtes de Gascogne, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge
  ('Plaimont', 'Côtes de Gascogne Moonseng', 'Côtes de Gascogne, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge
  ('Plaimont', 'Saint-Mont Béret Noir Rouge', 'Saint-Mont, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge
  ('Plaimont', 'Madiran Maestria Rouge', 'Madiran, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge
  ('Plaimont', 'Saint-Mont L''Empreinte du Faîte Rouge', 'Saint-Mont, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge
  ('Plaimont', 'Côtes de Gascogne Domaine de Cassaigne Rouge', 'Côtes de Gascogne, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge
  ('Plaimont', 'Madiran Géoglyphe', 'Madiran, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge
  ('Plaimont', 'Saint-Mont Hauts de Bergelle Rouge', 'Saint-Mont, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge?page=2
  ('Plaimont', 'Saint-Mont Un Pas de Côté', 'Saint-Mont, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge?page=2
  ('Plaimont', 'Saint-Mont Le Faîte Rouge', 'Saint-Mont, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge?page=2
  ('Plaimont', 'Saint-Mont La Madeleine de Saint Mont', 'Saint-Mont, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge?page=2
  ('Plaimont', 'Madiran Plénitude', 'Madiran, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge?page=2
  ('Plaimont', 'Comté Tolosan Paparoc', 'Comté Tolosan, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge?page=2
  ('Plaimont', 'Madiran Néomad', 'Madiran, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge?page=2
  ('Plaimont', 'Côtes de Gascogne Gratitude Pierre Seillan', 'Côtes de Gascogne, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge?page=2
  ('Plaimont', 'Saint-Mont Cépages d''Auteurs Rouge', 'Saint-Mont, South-West France, France', null, 'Red'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rouge?page=2
  ('Plaimont', 'Côtes de Gascogne Colombelle Sélection', 'Côtes de Gascogne, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc
  ('Plaimont', 'Côtes de Gascogne Elia Liberty Blanc', 'Côtes de Gascogne, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc
  ('Plaimont', 'Saint-Mont Projoe', 'Saint-Mont, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc
  ('Plaimont', 'Côtes de Gascogne Domaine de Cassaigne Blanc', 'Côtes de Gascogne, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc
  ('Plaimont', 'Côtes de Gascogne Pan', 'Côtes de Gascogne, South-West France, France', null, 'Sweet'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc
  ('Plaimont', 'Côtes de Gascogne Charmes', 'Côtes de Gascogne, South-West France, France', null, 'Sweet'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc
  ('Plaimont', 'Pacherenc du Vic-Bilh Maestria Blanc Doux', 'Pacherenc du Vic-Bilh, South-West France, France', null, 'Sweet'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc
  ('Plaimont', 'Pacherenc du Vic-Bilh Saint Albert', 'Pacherenc du Vic-Bilh, South-West France, France', null, 'Sweet'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc
  ('Plaimont', 'Saint-Mont Cirque Nord', 'Saint-Mont, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=2
  ('Plaimont', 'Saint-Mont Béret Noir Blanc', 'Saint-Mont, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=2
  ('Plaimont', 'Saint-Mont Les Vignes Retrouvées', 'Saint-Mont, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=2
  ('Plaimont', 'Saint-Mont Le Faîte Blanc', 'Saint-Mont, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=2
  ('Plaimont', 'Saint-Mont L''Empreinte du Faîte Blanc', 'Saint-Mont, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=2
  ('Plaimont', 'Pacherenc du Vic-Bilh Saint Sylvestre', 'Pacherenc du Vic-Bilh, South-West France, France', null, 'Sweet'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=2
  ('Plaimont', 'Pacherenc du Vic-Bilh Maestria Blanc Sec', 'Pacherenc du Vic-Bilh, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=2
  ('Plaimont', 'Saint-Mont Cépages d''Auteurs Blanc', 'Saint-Mont, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=2
  ('Plaimont', 'Côtes de Gascogne Colombard de Vieilles Vignes', 'Côtes de Gascogne, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=2
  ('Plaimont', 'Côtes de Gascogne Colombelle L''Original', 'Côtes de Gascogne, South-West France, France', null, 'White'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-blanc?page=3
  ('Plaimont', 'Saint-Mont Rosé d''Enfer', 'Saint-Mont, South-West France, France', null, 'Rosé'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rose
  ('Plaimont', 'Saint-Mont Entre Nos Vignes Rosé', 'Saint-Mont, South-West France, France', null, 'Rosé'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rose
  ('Plaimont', 'Côtes de Gascogne Corolle Rosé', 'Côtes de Gascogne, South-West France, France', null, 'Rosé'),  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rose
  ('Plaimont', 'Côtes de Gascogne Elia Liberty Rosé', 'Côtes de Gascogne, South-West France, France', null, 'Rosé')  -- https://boutique.plaimont.com/fr/taxons/nos-vins/type-de-vin/vin-rose
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BERTHOUMIEU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Domaine Berthoumieu', 'Madiran Constance', 'Madiran, South-West France, France', 'Tannat, Cabernet Franc, Cabernet Sauvignon, Pinenc', 'Red'),  -- https://www.domaine-berthoumieu.com
  ('Domaine Berthoumieu', 'Madiran Charles de Batz', 'Madiran, South-West France, France', 'Tannat, Cabernet Sauvignon', 'Red'),  -- https://www.domaine-berthoumieu.com
  ('Domaine Berthoumieu', 'Madiran Aulet', 'Madiran, South-West France, France', 'Tannat', 'Red'),  -- https://www.domaine-berthoumieu.com
  ('Domaine Berthoumieu', 'Madiran La Fé', 'Madiran, South-West France, France', 'Tannat', 'Red'),  -- https://www.domaine-berthoumieu.com
  ('Domaine Berthoumieu', 'Pacherenc du Vic-Bilh Les Pierres de Grés', 'Pacherenc du Vic-Bilh, South-West France, France', 'Petit Manseng, Gros Manseng', 'Sweet'),  -- https://www.domaine-berthoumieu.com
  ('Domaine Berthoumieu', 'Pacherenc du Vic-Bilh Sec La Fé', 'Pacherenc du Vic-Bilh, South-West France, France', 'Gros Manseng, Arrufiac', 'White'),  -- https://www.domaine-berthoumieu.com
  ('Domaine Berthoumieu', 'Tanatis', 'South-West France, France', 'Tannat', 'Fortified')  -- https://www.domaine-berthoumieu.com
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ARRETXEA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Domaine Arretxea', 'Irouléguy Rosé', 'Irouléguy, South-West France, France', 'Tannat, Cabernet Franc', 'Rosé'),  -- https://domaine-arretxea.com/vins/rose/
  ('Domaine Arretxea', 'Irouléguy Rouge', 'Irouléguy, South-West France, France', 'Tannat, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://domaine-arretxea.com/vins/rouge-tradition/
  ('Domaine Arretxea', 'Irouléguy Cuvée Haitza', 'Irouléguy, South-West France, France', 'Tannat, Cabernet Franc', 'Red'),  -- https://domaine-arretxea.com/vins/cuvee-haitza/
  ('Domaine Arretxea', 'Irouléguy Dolia', 'Irouléguy, South-West France, France', 'Tannat, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://domaine-arretxea.com/vins/dolia/
  ('Domaine Arretxea', 'Irouléguy Burdin Harria', 'Irouléguy, South-West France, France', 'Tannat, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://domaine-arretxea.com/vins/burdin-harria/
  ('Domaine Arretxea', 'Irouléguy Hegoxuri', 'Irouléguy, South-West France, France', 'Gros Manseng, Petit Manseng, Petit Courbu', 'White'),  -- https://domaine-arretxea.com/vins/hegoxuri/
  ('Domaine Arretxea', 'Irouléguy Grès', 'Irouléguy, South-West France, France', 'Petit Manseng, Gros Manseng', 'White'),  -- https://domaine-arretxea.com/vins/gres/
  ('Domaine Arretxea', 'Irouléguy Schistes', 'Irouléguy, South-West France, France', 'Petit Manseng, Gros Manseng', 'White')  -- https://domaine-arretxea.com/vins/schistes/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ILARRIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Domaine Ilarria', 'Irouléguy Blanc', 'Irouléguy, South-West France, France', 'Petit Manseng, Petit Courbu', 'White'),  -- https://www.domaine-ilarria.fr/les-vins/
  ('Domaine Ilarria', 'Irouléguy Rosé', 'Irouléguy, South-West France, France', 'Tannat, Cabernet', 'Rosé'),  -- https://www.domaine-ilarria.fr/les-vins/
  ('Domaine Ilarria', 'Irouléguy Rouge Tradition', 'Irouléguy, South-West France, France', null, 'Red'),  -- https://www.domaine-ilarria.fr/les-vins/
  ('Domaine Ilarria', 'Irouléguy Cuvée Sans Soufre Ajouté', 'Irouléguy, South-West France, France', 'Cabernet, Tannat', 'Red'),  -- https://www.domaine-ilarria.fr/les-vins/
  ('Domaine Ilarria', 'Irouléguy Rouge Méthode Naturelle', 'Irouléguy, South-West France, France', 'Cabernet, Tannat', 'Red')  -- https://www.domaine-ilarria.fr/les-vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS LAPEYRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Clos Lapeyre', 'Jurançon Sec', 'Jurançon, South-West France, France', 'Gros Manseng', 'White'),  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-de-jurancon-sec/
  ('Clos Lapeyre', 'Jurançon Moelleux', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-de-jurancon-moelleux/
  ('Clos Lapeyre', 'Jurançon Sec Vitatge Vielh', 'Jurançon, South-West France, France', null, 'White'),  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-de-jurancon-sec-vitatge-vielh/
  ('Clos Lapeyre', 'Jurançon La Magendia', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-de-jurancon-moelleux-la-magendia-de-lapeyre/
  ('Clos Lapeyre', 'Jurançon Sec Mantoulan', 'Jurançon, South-West France, France', null, 'White'),  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-de-jurancon-sec-le-mantoulan-de-lapeyre/
  ('Clos Lapeyre', 'Jurançon Balaguera', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-de-jurancon-moelleux-balaguera-de-lapeyre/
  ('Clos Lapeyre', 'Jurançon Vent Balaguèr', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-de-jurancon-moelleux-vent-balaguer-de-lapeyre/
  ('Clos Lapeyre', 'Jurançon Evidéncia', 'Jurançon, South-West France, France', 'Gros Manseng, Petit Manseng, Courbu, Camaralet', 'White'),  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-de-jurancon-nature-evidencia-de-lapeyre/
  ('Clos Lapeyre', 'Jurançon Amaros', 'Jurançon, South-West France, France', 'Gros Manseng', 'Orange'),  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-de-jurancon-nature-amaros-de-lapeyre/
  ('Clos Lapeyre', 'Lo Pecic', 'Jurançon, South-West France, France', 'Gros Manseng', 'Sparkling')  -- https://www.jurancon-lapeyre.fr/produit/clos-lapeyre-vin-libre-de-jurancon-lo-pecic-de-lapeyre/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CAUHAPÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Domaine Cauhapé', 'Jurançon Sec Chant des Vignes', 'Jurançon, South-West France, France', 'Gros Manseng, Camaralet', 'White'),  -- https://www.jurancon-cauhape.com/les-vins/chant-des-vignes
  ('Domaine Cauhapé', 'Jurançon Sec Geyser', 'Jurançon, South-West France, France', null, 'White'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Sec Quatre Temps', 'Jurançon, South-West France, France', null, 'White'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Sec La Canopée', 'Jurançon, South-West France, France', null, 'White'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Sec C de Cauhapé', 'Jurançon, South-West France, France', null, 'White'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Sec Escapade', 'Jurançon, South-West France, France', null, 'White'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Ballet d''Octobre', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Boléro', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Symphonie de Novembre', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Noblesse du Temps', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Quatuor', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Belle des Vignes', 'Jurançon, South-West France, France', null, 'Sweet'),  -- https://www.jurancon-cauhape.com
  ('Domaine Cauhapé', 'Jurançon Quintessence du Petit Manseng', 'Jurançon, South-West France, France', 'Petit Manseng', 'Sweet'),  -- https://www.jurancon-cauhape.com/les-vins/quintessence-du-petit-manseng
  ('Domaine Cauhapé', 'Jurançon Folie de Janvier', 'Jurançon, South-West France, France', 'Petit Manseng', 'Sweet')  -- https://www.jurancon-cauhape.com/les-vins/folie-de-janvier
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PLAGEOLES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Domaine Plageoles', 'Vin de France Contre Pied No. 2', 'Vin de France, South-West France, France', 'Duras, Braucol, Syrah', 'Red'),  -- https://www.vin-bio-ardoneo.com/en/87-domaine-plageoles
  ('Domaine Plageoles', 'Gaillac Loin de l''Oeil', 'Gaillac, South-West France, France', null, 'Sweet'),  -- https://www.vin-bio-ardoneo.com/en/87-domaine-plageoles
  ('Domaine Plageoles', 'Gaillac Duras', 'Gaillac, South-West France, France', 'Duras', 'Red'),  -- https://www.vin-bio-ardoneo.com/en/87-domaine-plageoles
  ('Domaine Plageoles', 'Gaillac Mauzac Nature', 'Gaillac, South-West France, France', 'Mauzac', 'Sparkling'),  -- https://www.vin-bio-ardoneo.com/en/87-domaine-plageoles
  ('Domaine Plageoles', 'Côtes du Tarn Prunelart', 'Côtes du Tarn, South-West France, France', 'Prunelart', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Plageoles
  ('Domaine Plageoles', 'Côtes du Tarn Syrah', 'Côtes du Tarn, South-West France, France', 'Syrah', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Plageoles
  ('Domaine Plageoles', 'Gaillac Mauzac Vert', 'Gaillac, South-West France, France', 'Mauzac', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Plageoles
  ('Domaine Plageoles', 'Gaillac Vin de Voile', 'Gaillac, South-West France, France', null, 'White'),  -- https://idealwine.com/en/buy-wine/domain-Plageoles
  ('Domaine Plageoles', 'Gaillac Braucol', 'Gaillac, South-West France, France', 'Braucol', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Plageoles
  ('Domaine Plageoles', 'Gaillac Ondenc', 'Gaillac, South-West France, France', 'Ondenc', 'Sweet'),  -- https://idealwine.com/en/buy-wine/domain-Plageoles
  ('Domaine Plageoles', 'Gaillac Vin d''Autan', 'Gaillac, South-West France, France', null, 'Sweet'),  -- https://idealwine.com/en/buy-wine/domain-Plageoles
  ('Domaine Plageoles', 'Vin de France Mauzac Noir', 'Vin de France, South-West France, France', 'Mauzac Noir', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Plageoles
  ('Domaine Plageoles', 'Vin de France Verdanel', 'Vin de France, South-West France, France', 'Verdanel', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Plageoles
  ('Domaine Plageoles', 'Gaillac Mauzac Roux', 'Gaillac, South-West France, France', 'Mauzac Roux', 'Sweet'),  -- https://www.vin-bio-ardoneo.com/en/domaine-plageoles/2471-domaine-plageoles-gaillac-mauzac-roux-2023.html
  ('Domaine Plageoles', 'Gaillac Caprice d''Autan', 'Gaillac, South-West France, France', 'Ondenc', 'Sweet'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1131/earl-robert-et-bernard-plageoles
  ('Domaine Plageoles', 'Gaillac Muscadelle Doux', 'Gaillac, South-West France, France', 'Muscadelle', 'Sweet')  -- https://www.vivino.com/en/wineries/robert-bernard-plageoles
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ROTIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Domaine Rotier', 'Gaillac La Vie en Bulles Brut Rosé', 'Gaillac, South-West France, France', null, 'Sparkling'),  -- https://domaine-rotier.com/product/la-vie-en-bulles-brut-rose-2025/
  ('Domaine Rotier', 'Gaillac Renaissance Brut Nature Blanc', 'Gaillac, South-West France, France', null, 'Sparkling'),  -- https://domaine-rotier.com/product/renaissance-brut-nature-blanc-2025/
  ('Domaine Rotier', 'Gaillac Esquisse Blanc Sec', 'Gaillac, South-West France, France', null, 'White'),  -- https://domaine-rotier.com/product/esquisse-blanc-sec-2025/
  ('Domaine Rotier', 'Gaillac Jubilate Rouge', 'Gaillac, South-West France, France', null, 'Red'),  -- https://domaine-rotier.com/product/jubilate-rouge-2025/
  ('Domaine Rotier', 'Gaillac Les Choses Simples Rouge', 'Gaillac, South-West France, France', null, 'Red'),  -- https://domaine-rotier.com/product/les-choses-simples-rouge-2026/
  ('Domaine Rotier', 'Gaillac Les Gravels Blanc Sec', 'Gaillac, South-West France, France', null, 'White'),  -- https://domaine-rotier.com/product/les-gravels-blanc-sec-2024/
  ('Domaine Rotier', 'Gaillac Les Gravels Rosé', 'Gaillac, South-West France, France', null, 'Rosé'),  -- https://domaine-rotier.com/product/les-gravels-rose-2024/
  ('Domaine Rotier', 'Gaillac Renaissance Rosé', 'Gaillac, South-West France, France', null, 'Rosé'),  -- https://domaine-rotier.com/product/renaissance-rose-2024/
  ('Domaine Rotier', 'Gaillac Les Gravels Rouge', 'Gaillac, South-West France, France', null, 'Red'),  -- https://domaine-rotier.com/product/les-gravels-rouge-2021/
  ('Domaine Rotier', 'Gaillac Les Gravels Blanc Doux', 'Gaillac, South-West France, France', null, 'Sweet'),  -- https://domaine-rotier.com/product/les-gravels-blanc-doux-2024/
  ('Domaine Rotier', 'Gaillac Renaissance Blanc Sec', 'Gaillac, South-West France, France', null, 'White'),  -- https://domaine-rotier.com/product/renaissance-blanc-sec-2023/
  ('Domaine Rotier', 'Gaillac Renaissance Rouge', 'Gaillac, South-West France, France', null, 'Red'),  -- https://domaine-rotier.com/product/renaissance-rouge-2022/
  ('Domaine Rotier', 'Gaillac Renaissance Vendanges Tardives', 'Gaillac, South-West France, France', null, 'Sweet'),  -- https://domaine-rotier.com/product/renaissance-blanc-50-cl-vendanges-tardives-2020/
  ('Domaine Rotier', 'Gaillac L''Âme Rouge', 'Gaillac, South-West France, France', 'Duras', 'Red')  -- https://domaine-rotier.com/product/lame-rouge-2019/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TIRECUL LA GRAVIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Tirecul La Gravière', 'Monbazillac Madame', 'Monbazillac, South-West France, France', null, 'Sweet'),  -- https://tirecul-la-graviere.fr/vins/
  ('Château Tirecul La Gravière', 'Monbazillac', 'Monbazillac, South-West France, France', null, 'Sweet'),  -- https://tirecul-la-graviere.fr/vins/
  ('Château Tirecul La Gravière', 'Monbazillac Les Pins', 'Monbazillac, South-West France, France', null, 'Sweet'),  -- https://tirecul-la-graviere.fr/vins/
  ('Château Tirecul La Gravière', 'Périgord Andréa Blanc Sec', 'Périgord, South-West France, France', null, 'White'),  -- https://tirecul-la-graviere.fr/vins/
  ('Château Tirecul La Gravière', 'Bergerac Le Georges', 'Bergerac, South-West France, France', null, 'Red'),  -- https://tirecul-la-graviere.fr/vins/
  ('Château Tirecul La Gravière', 'Jackie Méthode Traditionnelle', 'South-West France, France', 'Sémillon', 'Sparkling'),  -- https://tirecul-la-graviere.fr/jackie-2019/
  ('Château Tirecul La Gravière', 'Jo Méthode Traditionnelle', 'South-West France, France', 'Sémillon, Chenin Blanc', 'Sparkling'),  -- https://tirecul-la-graviere.fr/jo-methode-traditionnelle/
  ('Château Tirecul La Gravière', 'Jo Rosé Méthode Traditionnelle', 'South-West France, France', 'Merlot, Cabernet Franc', 'Sparkling')  -- https://tirecul-la-graviere.fr/jo-methode-traditionnelle/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE LA JAUBERTIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château de la Jaubertie', 'Tradition Blanc', 'South-West France, France', null, 'White'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Chardonnay', 'South-West France, France', 'Chardonnay', 'White'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Tradition Rosé', 'South-West France, France', null, 'Rosé'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Tradition Rouge', 'South-West France, France', null, 'Red'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Mirabelle Blanc', 'South-West France, France', null, 'White'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Mirabelle Rosé', 'South-West France, France', null, 'Rosé'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Mirabelle Rouge', 'South-West France, France', null, 'Red'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Monbazillac Mirabelle', 'Monbazillac, South-West France, France', null, 'Sweet'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Monologue Chardonnay', 'South-West France, France', 'Chardonnay', 'White'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Monologue Rouge', 'South-West France, France', null, 'Red'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Les Cépages Oubliés Blanc', 'South-West France, France', null, 'White'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Les Cépages Oubliés Rouge', 'South-West France, France', null, 'Red'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Joe & Bertie Pet''Nat''', 'South-West France, France', null, 'Sparkling'),  -- https://www.chateau-jaubertie.com/les-vins/
  ('Château de la Jaubertie', 'Brut Rosé', 'South-West France, France', 'Malbec, Cabernet Franc', 'Sparkling')  -- https://www.chateau-jaubertie.com/les-vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BELLEVUE LA FORÊT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Bellevue la Forêt', 'Fronton Originel Rouge', 'Fronton, South-West France, France', null, 'Red'),  -- https://www.chateaubellevuelaforet.com/vendange-vin-rouge-cepages-fronton
  ('Château Bellevue la Forêt', 'Fronton La Forêt Royale Rouge', 'Fronton, South-West France, France', null, 'Red'),  -- https://www.chateaubellevuelaforet.com/vendange-vin-rouge-cepages-fronton
  ('Château Bellevue la Forêt', 'Fronton Optimum', 'Fronton, South-West France, France', null, 'Red'),  -- https://www.chateaubellevuelaforet.com/vendange-vin-rouge-cepages-fronton
  ('Château Bellevue la Forêt', 'Fronton Vin de Minuit', 'Fronton, South-West France, France', null, 'Red'),  -- https://www.chateaubellevuelaforet.com/vendange-vin-rouge-cepages-fronton
  ('Château Bellevue la Forêt', 'Fronton Originel Rosé', 'Fronton, South-West France, France', null, 'Rosé'),  -- https://www.chateaubellevuelaforet.com/vin-rose-cepages-vinification-fronton
  ('Château Bellevue la Forêt', 'Fronton Forêt Royale Rosé', 'Fronton, South-West France, France', null, 'Rosé'),  -- https://www.chateaubellevuelaforet.com/vin-rose-cepages-vinification-fronton
  ('Château Bellevue la Forêt', 'Comté Tolosan Originel Blanc', 'Comté Tolosan, South-West France, France', null, 'White')  -- https://www.chateaubellevuelaforet.com/cepages-vins-blancs-vignoble-fronton
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BELINGARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Belingard', 'Bergerac Blanc Sec', 'Bergerac, South-West France, France', null, 'White'),  -- https://www.belingard.com/vins-bergerac-blanc-belingard/
  ('Château Belingard', 'Bergerac Réserve Blanc Sec', 'Bergerac, South-West France, France', null, 'White'),  -- https://www.belingard.com/vins-bergerac-blanc-belingard/
  ('Château Belingard', 'Côtes de Bergerac Demi-Sec', 'Côtes de Bergerac, South-West France, France', null, 'White'),  -- https://www.belingard.com/vins-bergerac-blanc-belingard/
  ('Château Belingard', 'Périgord Rivages Blanc', 'Périgord, South-West France, France', null, 'White'),  -- https://www.belingard.com/vins-bergerac-blanc-belingard/
  ('Château Belingard', 'Périgord Rivages Rosé', 'Périgord, South-West France, France', null, 'Rosé'),  -- https://www.belingard.com/vins-bergerac-rose-et-rouge/
  ('Château Belingard', 'Périgord Rivages Rouge', 'Périgord, South-West France, France', null, 'Red'),  -- https://www.belingard.com/vins-bergerac-rose-et-rouge/
  ('Château Belingard', 'Bergerac Rosé', 'Bergerac, South-West France, France', null, 'Rosé'),  -- https://www.belingard.com/vins-bergerac-rose-et-rouge/
  ('Château Belingard', 'Bergerac Rouge', 'Bergerac, South-West France, France', null, 'Red'),  -- https://www.belingard.com/vins-bergerac-rose-et-rouge/
  ('Château Belingard', 'Côtes de Bergerac Réserve Rouge', 'Côtes de Bergerac, South-West France, France', null, 'Red'),  -- https://www.belingard.com/vins-bergerac-rose-et-rouge/
  ('Château Belingard', 'Côtes de Bergerac Ortus Rouge', 'Côtes de Bergerac, South-West France, France', null, 'Red'),  -- https://www.belingard.com/vins-bergerac-rose-et-rouge/
  ('Château Belingard', 'Monbazillac Réserve', 'Monbazillac, South-West France, France', null, 'Sweet'),  -- https://www.belingard.com/vins-monbazillac/
  ('Château Belingard', 'Monbazillac Ortus', 'Monbazillac, South-West France, France', null, 'Sweet')  -- https://www.belingard.com/vins-monbazillac/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TOUR DES GENDRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Tour des Gendres', 'Bergerac Sec Moulin des Dames', 'Bergerac, South-West France, France', 'Sauvignon Blanc', 'White'),  -- https://www.chateautourdesgendres.com/vins/moulin-des-dames
  ('Château Tour des Gendres', 'Périgord Le Vif', 'Périgord, South-West France, France', 'Savagnin', 'White'),  -- https://www.chateautourdesgendres.com/vins/le-vif
  ('Château Tour des Gendres', 'Bergerac Sec Anthologia', 'Bergerac, South-West France, France', 'Sauvignon Blanc', 'White'),  -- https://www.chateautourdesgendres.com/vins/anthologia
  ('Château Tour des Gendres', 'Bergerac Cantalouette Rouge', 'Bergerac, South-West France, France', 'Malbec, Merlot, Cabernet Franc', 'Red'),  -- https://www.chateautourdesgendres.com/vins/cantalouette-rouge
  ('Château Tour des Gendres', 'Côtes de Bergerac La Gloire de mon Père', 'Côtes de Bergerac, South-West France, France', 'Cabernet, Malbec, Merlot', 'Red'),  -- https://www.chateautourdesgendres.com/vins/gloire-de-pere
  ('Château Tour des Gendres', 'Côtes de Bergerac Les Gendres', 'Côtes de Bergerac, South-West France, France', 'Merlot', 'Red'),  -- https://www.chateautourdesgendres.com/vins/les-gendres
  ('Château Tour des Gendres', 'Côtes de Bergerac Les Anciens Francs', 'Côtes de Bergerac, South-West France, France', 'Cabernet Franc', 'Red'),  -- https://www.chateautourdesgendres.com/vins/les-anciens-francs
  ('Château Tour des Gendres', 'Bergerac Swing', 'Bergerac, South-West France, France', 'Malbec, Merlot', 'Red'),  -- https://www.chateautourdesgendres.com/vins/swing
  ('Château Tour des Gendres', 'Périgord Cantalouette Blanc', 'Périgord, South-West France, France', 'Chenin Blanc, Sauvignon Blanc, Savagnin', 'White')  -- https://www.chateautourdesgendres.com/vins/cantalouette
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LES HAUTS DE CAILLEVEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Château Les Hauts de Caillevel', 'Côtes de Bergerac Ebène', 'Côtes de Bergerac, South-West France, France', 'Cabernet Franc, Cabernet Sauvignon, Merlot', 'Red'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Côtes de Bergerac Les Terres Chaudes', 'Côtes de Bergerac, South-West France, France', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Bergerac L''Authentique', 'Bergerac, South-West France, France', 'Cabernet Franc, Cabernet Sauvignon, Merlot', 'Red'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Bergerac Fruissance', 'Bergerac, South-West France, France', 'Merlot, Malbec', 'Red'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Vin de France L''Envolée', 'Vin de France, South-West France, France', 'Sauvignon Blanc, Sauvignon Gris, Chenin Blanc', 'White'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Vin de France L''Atypique', 'Vin de France, South-West France, France', 'Sauvignon Blanc, Sauvignon Gris, Chenin Blanc', 'White'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Bergerac Fleur de Roche', 'Bergerac, South-West France, France', 'Sauvignon Blanc, Sauvignon Gris', 'White'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Chenin de Compostelle', 'South-West France, France', 'Chenin Blanc', 'White'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Monbazillac Grains de Folie', 'Monbazillac, South-West France, France', 'Sauvignon Gris', 'Sweet'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Monbazillac Les Brumes', 'Monbazillac, South-West France, France', 'Sémillon', 'Sweet'),  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
  ('Château Les Hauts de Caillevel', 'Bergerac Rosenvie', 'Bergerac, South-West France, France', 'Malbec', 'Rosé')  -- https://chateauleshautsdecaillevel.com/nos-cuvees/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DU CROS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_southwest.sql)'
from (values
  ('Domaine du Cros', 'Marcillac Les Rougiers', 'Marcillac, South-West France, France', 'Fer Servadou', 'Red'),  -- https://www.domaine-du-cros.com/nos-vins/les-rougiers-201/
  ('Domaine du Cros', 'Marcillac Lo Sang del Païs Rosé', 'Marcillac, South-West France, France', null, 'Rosé'),  -- https://www.domaine-du-cros.com/nos-vins/
  ('Domaine du Cros', 'Marcillac Lo Sang del Païs', 'Marcillac, South-West France, France', null, 'Red'),  -- https://www.domaine-du-cros.com/nos-vins/
  ('Domaine du Cros', 'Marcillac Cuvée N°25', 'Marcillac, South-West France, France', 'Fer Servadou', 'Red'),  -- https://www.domaine-du-cros.com/nos-vins/cuvee-n-25/
  ('Domaine du Cros', 'Marcillac Vieilles Vignes', 'Marcillac, South-West France, France', 'Fer Servadou', 'Red'),  -- https://www.domaine-du-cros.com/nos-vins/aoc-marcillac-cuvee-vv/
  ('Domaine du Cros', 'Aveyron Blanc', 'Aveyron, South-West France, France', 'Muscat à Petits Grains, Sémillon', 'White'),  -- https://www.domaine-du-cros.com/nos-vins/igp-aveyron-doux-vin-blanc/
  ('Domaine du Cros', 'Aveyron Doux', 'Aveyron, South-West France, France', 'Sauvignon Blanc, Sémillon, Petit Manseng', 'Sweet')  -- https://www.domaine-du-cros.com/nos-vins/igp-vin-blanc-doux-aveyron/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
