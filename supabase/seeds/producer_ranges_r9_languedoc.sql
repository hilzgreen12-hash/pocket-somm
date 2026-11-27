-- Producer ranges round 9: languedoc. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- PAUL MAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Paul Mas', 'Belluguette', 'Languedoc, Languedoc, France', 'Grenache, Vermentino, Roussanne, Viognier', 'White'),  -- https://www.cote-mas.fr/produit/chateau-paul-mas-belluguette-aoc-languedoc/
  ('Paul Mas', 'Clos des Mûres', 'Languedoc, Languedoc, France', 'Syrah, Grenache Noir', 'Red'),  -- https://www.cote-mas.fr/produit/chateau-paul-mas-clos-des-mures-aoc-languedoc/
  ('Paul Mas', 'Château des Crès Ricards Stécia', 'Terrasses du Larzac, Languedoc, France', 'Syrah, Grenache, Carignan', 'Red'),  -- https://www.cote-mas.fr/produit/cres-ricards-stecia/
  ('Paul Mas', 'Château des Crès Ricards Oenothera', 'Terrasses du Larzac, Languedoc, France', 'Syrah, Grenache', 'Red'),  -- https://www.cote-mas.fr/produit/chateau-des-cres-ricards-oenothera/
  ('Paul Mas', 'Secret d''Assemblage', 'Pays d''Oc, Languedoc, France', 'Chardonnay, Viognier, Muscat', 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-secret-dassemblage/
  ('Paul Mas', 'Château Villegly L''Excellence', 'Minervois, Languedoc, France', 'Syrah, Grenache, Cinsault, Carignan', 'Red'),  -- https://www.cote-mas.fr/produit/chateau-villegly-lexcellence/
  ('Paul Mas', 'Domaine Lauriga Racines', 'Côtes Catalanes, Roussillon, France', 'Carignan, Grenache, Syrah', 'Red'),  -- https://www.cote-mas.fr/produit/domaine-lauriga-racines/
  ('Paul Mas', 'Château Lauriga Réserve Cuvée Bastien', 'Côtes du Roussillon, Roussillon, France', 'Syrah, Carignan, Grenache', 'Red'),  -- https://www.cote-mas.fr/produit/chateau-lauriga-reserve-cuvee-bastien-2/
  ('Paul Mas', 'Domaine Lauriga La Figuera', 'Côtes Catalanes, Roussillon, France', 'Macabeu, Grenache Blanc, Muscat d''Alexandrie, Grenache Gris, Viognier', 'White'),  -- https://www.cote-mas.fr/produit/domaine-lauriga-la-figuera/
  ('Paul Mas', 'Château Lauriga Le Cadet', 'Côtes du Roussillon, Roussillon, France', 'Syrah, Carignan, Grenache', 'Red'),  -- https://www.cote-mas.fr/produit/chateau-lauriga-le-cadet/
  ('Paul Mas', 'Domaine les Verrières Clos des Soutyeres', 'Languedoc, Languedoc, France', 'Syrah, Grenache Noir, Carignan', 'Red'),  -- https://www.cote-mas.fr/produit/domaine-des-verrieres-clos-des-soutyeres-aoc-languedoc/
  ('Paul Mas', 'Domaine les Verrières Les 7 Fontaines', 'Languedoc, Languedoc, France', 'Syrah, Grenache Noir, Carignan, Cinsault', 'Red'),  -- https://www.cote-mas.fr/produit/domaine-les-verrieres-les-7-fontaines/
  ('Paul Mas', 'Viognier', 'Languedoc, France', 'Viognier', 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-viognier/
  ('Paul Mas', 'Château Martinolles Limoux Blanc Vieilles Vignes', 'Limoux, Languedoc, France', null, 'White'),  -- https://www.cote-mas.fr/produit/chateau-martinolles-limoux-blanc-vieilles-vignes/
  ('Paul Mas', 'Réserve Viognier', 'Pays d''Oc, Languedoc, France', 'Viognier', 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-reserve-viognier/
  ('Paul Mas', 'Vignes de Nicole Chardonnay Viognier', 'Pays d''Oc, Languedoc, France', 'Chardonnay, Viognier', 'White'),  -- https://www.cote-mas.fr/produit/vignes-de-nicole-chardonnay-viognier/
  ('Paul Mas', 'Domaine de la Ferrandière Grand Vin Blanc', 'Languedoc, France', null, 'White'),  -- https://www.cote-mas.fr/produit/domaine-la-ferrandiere-grand-vin-blanc/
  ('Paul Mas', 'Réserve Chardonnay', 'Pays d''Oc, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-reserve-chardonnay-2/
  ('Paul Mas', 'Vignes de Nicole Cabernet Sauvignon Syrah', 'Pays d''Oc, Languedoc, France', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://www.cote-mas.fr/produit/vignes-de-nicole-cabernet-sauvignon-syrah/
  ('Paul Mas', 'Le Chardonnay', 'Languedoc, France', 'Chardonnay', 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-le-chardonnay/
  ('Paul Mas', 'L''Artisan Le Chardonnay', 'Languedoc, France', 'Chardonnay', 'White'),  -- https://www.cote-mas.fr/produit/lartisan-le-chardonnay/
  ('Paul Mas', 'Domaine Lauriga Le Gris Rosé', 'Roussillon, France', null, 'Rosé'),  -- https://www.cote-mas.fr/produit/domaine-lauriga-rose/
  ('Paul Mas', '1892 Rouge Bio', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/paul-mas-1892-rouge-bio/
  ('Paul Mas', 'Esprit des Crès Ricards Marsanne Roussanne', 'Languedoc, France', 'Marsanne, Roussanne', 'White'),  -- https://www.cote-mas.fr/produit/esprit-des-cres-ricards-marsanne-roussanne/
  ('Paul Mas', 'Réserve Syrah Viognier', 'Languedoc, France', 'Syrah, Viognier', 'Red'),  -- https://www.cote-mas.fr/produit/paul-mas-reserve-syrah-viognier/
  ('Paul Mas', 'Vignes de Nicole Cabernet Sauvignon Merlot', 'Pays d''Oc, Languedoc, France', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.cote-mas.fr/produit/vignes-de-nicole-cabernet-sauvignon-merlot/
  ('Paul Mas', 'Réserve Carignan Vieilles Vignes', 'Languedoc, France', 'Carignan', 'Red'),  -- https://www.cote-mas.fr/produit/paul-mas-reserve-carignan-vieilles-vignes/
  ('Paul Mas', 'Esprit des Crès Ricards Viognier', 'Languedoc, France', 'Viognier', 'White'),  -- https://www.cote-mas.fr/produit/esprit-des-cres-ricards-viognier/
  ('Paul Mas', 'Mas des Tannes Classique Rouge Sans Sulfites', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/mas-des-tannes-classique-rouge-sans-sulfites/
  ('Paul Mas', 'Cuvée Secrète Chardonnay Sans Sulfites', 'Languedoc, France', 'Chardonnay', 'White'),  -- https://www.cote-mas.fr/produit/cuvee-secrete-chardonnay-sans-sulfite/
  ('Paul Mas', 'Réserve Pinot Noir', 'Languedoc, France', 'Pinot Noir', 'Red'),  -- https://www.cote-mas.fr/produit/paul-mas-reserve-pinot-noir/
  ('Paul Mas', 'Réserve Marsanne', 'Languedoc, France', 'Marsanne', 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-reserve-marsanne-2025/
  ('Paul Mas', 'Domaine Martinolles Chardonnay', 'Languedoc, France', 'Chardonnay', 'White'),  -- https://www.cote-mas.fr/produit/domaine-martinolles-chardonnay/
  ('Paul Mas', 'Cuvée Secrète Syrah', 'Languedoc, France', 'Syrah', 'Red'),  -- https://www.cote-mas.fr/produit/cuvee-secrete-syrah/
  ('Paul Mas', 'Prima Perla Blanquette de Limoux', 'Blanquette de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.cote-mas.fr/produit/paul-mas-prima-perla-blanc-de-blanc/
  ('Paul Mas', 'Sauvignon Blanc', 'Languedoc, France', 'Sauvignon Blanc', 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-sauvignon-blanc/
  ('Paul Mas', 'Château Capendu Corbières', 'Corbières, Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/chateau-capendu-aoc-corbieres/
  ('Paul Mas', 'Mas des Tannes Réserve Blanc', 'Languedoc, France', null, 'White'),  -- https://www.cote-mas.fr/produit/mas-des-tannes-reserve-blanc/
  ('Paul Mas', 'Domaine de la Ferrandière Le Grand Vin Rouge', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/domaine-de-la-ferrandiere-grand-rouge/
  ('Paul Mas', 'Le Cabernet Sauvignon', 'Languedoc, France', 'Cabernet Sauvignon', 'Red'),  -- https://www.cote-mas.fr/produit/paul-mas-le-cabernet-sauvignon/
  ('Paul Mas', 'Le Vermentino', 'Pays d''Oc, Languedoc, France', 'Vermentino', 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-le-vermentino/
  ('Paul Mas', 'Le Merlot', 'Pays d''Oc, Languedoc, France', 'Merlot', 'Red'),  -- https://www.cote-mas.fr/produit/paul-mas-le-merlot/
  ('Paul Mas', 'Jardin de Roses Rosé', 'Languedoc, Languedoc, France', null, 'Rosé'),  -- https://www.cote-mas.fr/produit/jardins-de-roses-aoc-languedoc/
  ('Paul Mas', '1892 Blanc Bio', 'Languedoc, France', null, 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-1892-blanc-bio/
  ('Paul Mas', 'Château Martinolles Limoux Rouge Le Garriguet', 'Limoux, Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/chateau-martinolles-limoux-rouge-le-guarriguet/
  ('Paul Mas', 'Château Lauriga Soleil Blanc', 'Roussillon, France', null, 'White'),  -- https://www.cote-mas.fr/produit/soleil-blanc-de-lauriga/
  ('Paul Mas', 'L''Artisan Le Grenache Noir', 'Languedoc, France', 'Grenache Noir', 'Red'),  -- https://www.cote-mas.fr/produit/lartisan-le-grenache-noir/
  ('Paul Mas', 'Château Jérémie Terroir des Corbières', 'Corbières, Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/chateau-jeremie-terroir-des-corbieres-aop/
  ('Paul Mas', 'Domaine Martinolles Pinot Noir', 'Languedoc, France', 'Pinot Noir', 'Red'),  -- https://www.cote-mas.fr/produit/domaine-martinolles-pinot-noir/
  ('Paul Mas', 'Château des Crès Ricards Les Galets', 'Languedoc, France', null, 'White'),  -- https://www.cote-mas.fr/produit/chateau-des-cres-ricards-les-galets/
  ('Paul Mas', 'RosOrange', 'Languedoc, France', null, 'Rosé'),  -- https://www.cote-mas.fr/produit/paul-mas-rosorange/
  ('Paul Mas', 'RougeOrange', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/paul-mas-rougeorange/
  ('Paul Mas', 'Clos de Savignac', 'Grès de Montpellier, Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/chateau-paul-mas-clos-de-savignac-aoc-gres-de-montpellier/
  ('Paul Mas', 'Domaine du Silène Mas des Peyrals Bio', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/silenus-domaine-silene-des-peyrals/
  ('Paul Mas', 'Le Gewurztraminer', 'Languedoc, France', 'Gewurztraminer', 'White'),  -- https://www.cote-mas.fr/produit/paul-mas-le-gewurstraminer/
  ('Paul Mas', 'L''Artisan Le Pinot Noir', 'Languedoc, France', 'Pinot Noir', 'Red'),  -- https://www.cote-mas.fr/produit/lartisan-le-pinot-noir/
  ('Paul Mas', 'Réserve Mourvèdre', 'Languedoc, France', 'Mourvèdre', 'Red'),  -- https://www.cote-mas.fr/produit/paul-mas-reserve-mourvedre/
  ('Paul Mas', 'Clos du Moulinas', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/chateau-paul-mas-clos-du-moulinas-2/
  ('Paul Mas', 'Château Jérémie Y', 'Corbières-Boutenac, Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/chateau-jeremie-y-aoc-corbieres-boutenac/
  ('Paul Mas', 'Domaine Lauriga Merlot-Cabernet', 'Roussillon, France', 'Merlot, Cabernet', 'Red'),  -- https://www.cote-mas.fr/produit/domaine-lauriga-merlot-cabernet-blackfriday/
  ('Paul Mas', 'Château des Crès Ricards L''Assemblage en Terrasses', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/cres-ricards-lassemblage/
  ('Paul Mas', 'Le Grenache Noir', 'Languedoc, France', 'Grenache Noir', 'Red'),  -- https://www.cote-mas.fr/produit/paul-mas-le-grenache-noir-2/
  ('Paul Mas', 'Domaine les Verrières Pierre Plantée', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/domaine-les-verrieres-pierre-plantee/
  ('Paul Mas', 'Château Mas des Tannes Rouge Bio', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/chateau-mas-des-tannes-rouge-bio/
  ('Paul Mas', 'Château Lauriga Rivesaltes Grenat', 'Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://www.cote-mas.fr/produit/chateau-lauriga-rose-rivesaltes-grenat/
  ('Paul Mas', 'Château Martinolles Grande Réserve', 'Limoux, Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/chateau-martinolles-grande-reserve/
  ('Paul Mas', 'Silénus', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/silenus/
  ('Paul Mas', 'Clos Martinolles Crémant de Limoux Extra Brut Extrême', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.cote-mas.fr/produit/clos-martinolles-cremant-de-limoux-extra-brut-extreme/
  ('Paul Mas', 'XMAS', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/x-mas-by-paul-mas/
  ('Paul Mas', 'Clos de Maro Chardonnay Bio', 'Languedoc, France', 'Chardonnay', 'White'),  -- https://www.cote-mas.fr/produit/clos-de-maro-chardonnay-bio/
  ('Paul Mas', 'Clos de Maro Pinot Noir Bio', 'Languedoc, France', 'Pinot Noir', 'Red'),  -- https://www.cote-mas.fr/produit/clos-de-maro-pinot-noir-bio/
  ('Paul Mas', 'Domaine de la Ferrandière Riesling', 'Languedoc, France', 'Riesling', 'White'),  -- https://www.cote-mas.fr/produit/domaine-ferrandiere-riesling/
  ('Paul Mas', 'Astelia Grand Vin Blanc', 'Languedoc, France', null, 'White'),  -- https://www.cote-mas.fr/produit/astelia-grand-vin-blanc/
  ('Paul Mas', 'Astelia Cabernet Sauvignon', 'Languedoc, France', 'Cabernet Sauvignon', 'Red'),  -- https://www.cote-mas.fr/produit/mas-astelia-cabernet-sauvignon-2/
  ('Paul Mas', 'Cuvée Secrète Pinot Noir', 'Languedoc, France', 'Pinot Noir', 'Red'),  -- https://www.cote-mas.fr/produit/cuvee-secrete-pinot-noir/
  ('Paul Mas', 'Cuvée Secrète Cabernet-Merlot Sans Sulfites', 'Languedoc, France', 'Cabernet, Merlot', 'Red'),  -- https://www.cote-mas.fr/produit/cuvee-secrete-cabernet-merlot-sans-sulfites/
  ('Paul Mas', 'Chai Mas Rouge', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/chai-mas-rouge/
  ('Paul Mas', 'Chai Mas Blanc', 'Languedoc, France', null, 'White'),  -- https://www.cote-mas.fr/produit/chais-mas-blanc/
  ('Paul Mas', 'Vive le Rouge ! Pinot Noir', 'Languedoc, France', 'Pinot Noir', 'Red'),  -- https://www.cote-mas.fr/produit/vive-le-rouge-pinot-noir/
  ('Paul Mas', 'Rural par Nature Rouge Bio', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/rural-par-nature-rouge-bio/
  ('Paul Mas', 'Le Marcel Gris de Gris', 'Languedoc, France', null, 'Rosé'),  -- https://www.cote-mas.fr/produit/le-marcel-gris-de-gris/
  ('Paul Mas', 'Haut de Valmoure Blanc', 'Languedoc, France', null, 'White'),  -- https://www.cote-mas.fr/produit/jean-claude-mas-haut-de-valmoure-blanc/
  ('Paul Mas', 'Vignes de Nicole L''Assemblage Blanc', 'Pays d''Oc, Languedoc, France', null, 'White')  -- https://www.cote-mas.fr/produit/vignes-de-nicole-lassemblage-blanc-2020/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ARROGANT FROG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Arrogant Frog', 'Chardonnay Viognier Plot de Naudy', 'Languedoc, France', 'Chardonnay, Viognier', 'White'),  -- https://www.cote-mas.fr/produit/arrogant-frog-chardonnay-viognier/
  ('Arrogant Frog', 'Syrah-Viognier Canteperdrix', 'Languedoc, France', 'Syrah, Viognier', 'Red'),  -- https://www.cote-mas.fr/produit/arrogant-frog-syrah-viognier/
  ('Arrogant Frog', 'Chardonnay Bio', 'Languedoc, France', 'Chardonnay', 'White'),  -- https://www.cote-mas.fr/produit/arrogant-frog-chardonnay-bio-2020/
  ('Arrogant Frog', 'Ribet Pink', 'Languedoc, France', null, 'Rosé'),  -- https://www.cote-mas.fr/produit/arrogant-frog-ribet-pink/
  ('Arrogant Frog', 'Réserve Limoux', 'Limoux, Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/arrogant-frog-reserve-aoplimoux/
  ('Arrogant Frog', 'Red Velvet', 'Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/arrogant-frog-red-velvet/
  ('Arrogant Frog', 'Cabernet Merlot', 'Pays d''Oc, Languedoc, France', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.cote-mas.fr/produit/arrogant-frog-cabernet-merlot-75cl-2024/
  ('Arrogant Frog', 'Limoux Rouge', 'Limoux, Languedoc, France', null, 'Red'),  -- https://www.paulmas.com/en/brands-signatures/
  ('Arrogant Frog', 'Limoux Blanc', 'Limoux, Languedoc, France', null, 'White')  -- https://www.paulmas.com/en/brands-signatures/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CÔTÉ MAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Côté Mas', 'Rosé Aurore', 'Pays d''Oc, Languedoc, France', null, 'Rosé'),  -- https://www.cote-mas.fr/produit/cote-mas-rose-aurore-igp-pays-doc/
  ('Côté Mas', 'Cru Pézenas', 'Pézenas, Languedoc, France', null, 'Red'),  -- https://www.cote-mas.fr/produit/cote-mas-cru-pezenas/
  ('Côté Mas', 'Syrah Grenache', 'Pays d''Oc, Languedoc, France', 'Syrah, Grenache', 'Red'),  -- https://www.cote-mas.fr/produit/cote-mas-syrah-grenache/
  ('Côté Mas', 'Sauvignon Vermentino', 'Pays d''Oc, Languedoc, France', 'Sauvignon, Vermentino', 'White'),  -- https://www.cote-mas.fr/produit/cote-mas-sauvignon-vermentino-2022/
  ('Côté Mas', 'Frisante Piquepoul Chardonnay', 'Languedoc, France', 'Piquepoul, Chardonnay', 'Sparkling'),  -- https://www.cote-mas.fr/produit/cote-mas-frisante-picpoul-chardonnay/
  ('Côté Mas', 'Orange', 'Languedoc, France', 'Grenache Blanc, Grenache Gris, Macabeu', 'Orange')  -- https://www.cote-mas.fr/produit/cote-mas-orange/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FORTANT DE FRANCE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Fortant de France', 'Réserve Chardonnay Grenache Blanc', 'Languedoc, France', 'Chardonnay, Grenache Blanc', 'White'),  -- https://www.fortant.com/fr/nos-vins.r-558/reserve.r-565/chardonnay-grenache-blanc.v-24747.html
  ('Fortant de France', 'Réserve Chardonnay Viognier', 'Languedoc, France', 'Chardonnay, Viognier', 'White'),  -- https://www.fortant.com/fr/nos-vins.r-558/reserve.r-565/chardonnay-viognier.v-24768.html
  ('Fortant de France', 'Réserve Merlot Pinot Noir', 'Languedoc, France', 'Merlot, Pinot Noir', 'Red'),  -- https://www.fortant.com/fr/nos-vins.r-558/reserve.r-565/merlot-pinot-noir.v-24770.html
  ('Fortant de France', 'Réserve Sauvignon Blanc Colombard', 'Languedoc, France', 'Sauvignon Blanc, Colombard', 'White'),  -- https://www.fortant.com/fr/nos-vins.r-558/reserve.r-565/sauvignon-blanc-colombard.v-24769.html
  ('Fortant de France', 'Chardonnay Altitude', 'Pays d''Oc, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.fortant.com/fr/nos-vins.r-558/terroir.r-570/igp-pays-d-oc-chardonnay-altitude.v-24754.html
  ('Fortant de France', 'Merlot Littoral', 'Pays d''Oc, Languedoc, France', 'Merlot', 'Red'),  -- https://www.fortant.com/fr/nos-vins.r-558/terroir.r-570/igp-pays-d-oc-merlot-littoral.v-24753.html
  ('Fortant de France', 'Pinot Noir Altitude', 'Pays d''Oc, Languedoc, France', 'Pinot Noir', 'Red'),  -- https://www.fortant.com/fr/nos-vins.r-558/terroir.r-570/igp-pays-d-oc-pinot-noir-altitude.v-24755.html
  ('Fortant de France', 'Rosé Littoral', 'Pays d''Oc, Languedoc, France', null, 'Rosé'),  -- https://www.fortant.com/fr/nos-vins.r-558/terroir.r-570/igp-pays-d-oc-rose-littoral.v-24752.html
  ('Fortant de France', 'Sauvignon Blanc', 'Languedoc, France', 'Sauvignon Blanc', 'White'),  -- https://www.fortant.com/fr/nos-vins.r-558/terroir.r-570/sauvignon-blanc.v-24751.html
  ('Fortant de France', 'Réserve des Grands Monts Languedoc Blanc', 'Languedoc, Languedoc, France', null, 'White'),  -- https://www.fortant.com/fr/nos-vins.r-558/reserve-des-grands-monts.r-567/aoc-languedoc-bl-rdgm.v-24760.html
  ('Fortant de France', 'Réserve des Grands Monts Languedoc Rouge', 'Languedoc, Languedoc, France', null, 'Red'),  -- https://www.fortant.com/fr/nos-vins.r-558/reserve-des-grands-monts.r-567/aoc-languedoc-rg-rdgm.v-24761.html
  ('Fortant de France', 'Réserve des Grands Monts Saint-Chinian Blanc', 'Saint-Chinian, Languedoc, France', null, 'White'),  -- https://www.fortant.com/fr/nos-vins.r-558/reserve-des-grands-monts.r-567/aoc-saint-chinian-bl-rdgm.v-24758.html
  ('Fortant de France', 'Réserve des Grands Monts Saint-Chinian Rouge', 'Saint-Chinian, Languedoc, France', null, 'Red'),  -- https://www.fortant.com/fr/nos-vins.r-558/reserve-des-grands-monts.r-567/aoc-saint-chinian-rg-rdgm.v-24759.html
  ('Fortant de France', 'La Marinière Grenache Gris', 'Pays d''Oc, Languedoc, France', 'Grenache Gris', 'Rosé')  -- https://www.fortant.com/fr/nos-vins.r-558/esprit-bord-de-mer.r-568/igp-pays-d-oc-mariniere-grenache-gris.v-24764.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GÉRARD BERTRAND ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Gérard Bertrand', 'Héritage An 873 Minervois', 'Minervois, Languedoc, France', 'Carignan, Syrah', 'Red'),  -- https://www.vinello.eu/gerard-bertrand-minervois-grand-terroir-aop
  ('Gérard Bertrand', 'Banyuls', 'Banyuls, Roussillon, France', null, 'Fortified'),  -- https://www.vinello.eu/banyuls-vin-doux-naturel-gerard-bertrand
  ('Gérard Bertrand', 'Gris Blanc', 'Pays d''Oc, Languedoc, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/vin-igp-pays-d-oc-gris-blanc-2025-vin-rose-bio-a-vis-75cl-13241.html
  ('Gérard Bertrand', 'Héritage An 1618 Picpoul de Pinet', 'Picpoul de Pinet, Languedoc, France', null, 'White'),  -- https://www.vinello.eu/terroir-picpoul-de-pinet-aop-gerard-bertrand
  ('Gérard Bertrand', 'Héritage An 806 Corbières', 'Corbières, Languedoc, France', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://www.vinello.eu/terroir-corbieres-aop-gerard-bertrand
  ('Gérard Bertrand', 'Héritage An 1650 La Clape', 'La Clape, Languedoc, France', 'Carignan, Mourvèdre, Syrah', 'Red'),  -- https://www.vinello.eu/heritage-1650-la-clape-gerard-bertrand
  ('Gérard Bertrand', 'Château l''Hospitalet Grand Vin Rouge', 'La Clape, Languedoc, France', null, 'Red'),  -- https://www.vinello.eu/chateau-lhospitalet-grand-vin-rouge-la-clape-gerard-bertrand
  ('Gérard Bertrand', 'Château l''Hospitalet Grand Vin Blanc', 'La Clape, Languedoc, France', null, 'White'),  -- https://www.vinello.eu/chateau-l-hospitalet-la-clape-blanc-gerard-bertrand
  ('Gérard Bertrand', 'L''Hospitalitas', 'La Clape, Languedoc, France', 'Mourvèdre, Syrah', 'Red'),  -- https://www.vinello.eu/lhospitalitas-la-clape-gerard-bertrand
  ('Gérard Bertrand', 'Côte des Roses Rosé', 'Languedoc, France', null, 'Rosé'),  -- https://www.vinello.eu/cote-des-roses-rose-gerard-bertrand
  ('Gérard Bertrand', 'Côte des Roses Chardonnay', 'Languedoc, France', 'Chardonnay', 'White'),  -- https://www.vinello.eu/cote-des-roses-chardonnay-gerard-bertrand
  ('Gérard Bertrand', 'Côte des Roses Pinot Noir', 'Languedoc, France', 'Pinot Noir', 'Red'),  -- https://www.vinello.eu/cote-des-roses-pinot-noir-gerard-bertrand
  ('Gérard Bertrand', 'Côte des Roses Sauvignon Blanc', 'Languedoc, France', 'Sauvignon Blanc', 'White'),  -- https://www.saratogawine.com/product/gerard-bertrand-cote-des-roses-sauvignon-blanc-2025-750ml/
  ('Gérard Bertrand', 'Esprit de Côte des Roses Brut Rosé', 'Languedoc, France', null, 'Sparkling'),  -- https://www.saratogawine.com/product/gerard-bertrand-esprit-de-cote-des-roses-sparkling-rose-nv-750ml/
  ('Gérard Bertrand', 'Change Chardonnay', 'Languedoc, France', 'Chardonnay', 'White'),  -- https://www.vinello.eu/change-chardonnay-gerard-bertrand
  ('Gérard Bertrand', 'Orange Gold', 'Languedoc, France', null, 'Orange'),  -- https://www.vinello.eu/orange-gold-gerard-bertrand
  ('Gérard Bertrand', 'Art de Vivre Clairette du Languedoc Adissan', 'Clairette du Languedoc, Languedoc, France', 'Clairette', 'White'),  -- https://www.vinello.eu/art-de-vivre-clairette-du-languedoc-adissan-gerard-bertrand
  ('Gérard Bertrand', 'Héritage An 560 Tautavel', 'Côtes du Roussillon Villages Tautavel, Roussillon, France', null, 'Red'),  -- https://www.vinello.eu/heritage-560-tautavel-gerard-bertrand
  ('Gérard Bertrand', 'Domaine de l''Aigle Pinot Noir', 'Haute Vallée de l''Aude, Languedoc, France', 'Pinot Noir', 'Red'),  -- https://www.vinello.eu/domaine-de-l-aigle-pinot-noir-gerard-bertrand
  ('Gérard Bertrand', 'Domaine de l''Aigle Chardonnay', 'Limoux, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.vinello.eu/domaine-de-l-aigle-chardonnay-limoux-aoc-gerard-bertrand
  ('Gérard Bertrand', 'Art de Vivre Languedoc Rouge', 'Languedoc, Languedoc, France', null, 'Red'),  -- https://www.vinello.eu/art-de-vivre-languedoc-rouge-gerard-bertrand
  ('Gérard Bertrand', 'Art de Vivre Rosé', 'Languedoc, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/vin-languedoc-roussillon-art-de-vivre-rose-9667.html
  ('Gérard Bertrand', 'Cigalus Blanc', 'Aude Hauterive, Languedoc, France', null, 'White'),  -- https://www.vinello.eu/cigalus-blanc-gerard-bertrand
  ('Gérard Bertrand', 'Cigalus Rouge', 'Aude Hauterive, Languedoc, France', null, 'Red'),  -- https://www.vinello.eu/cigalus-rouge-gerard-bertrand
  ('Gérard Bertrand', 'Héritage An 940 Chardonnay', 'Pays d''Oc, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.saratogawine.com/product/gerard-bertrand-chardonnay-pays-doc-heritage-an-940-2023-750ml/
  ('Gérard Bertrand', 'Castellum Cité de Carcassonne Rouge', 'Cité de Carcassonne, Languedoc, France', null, 'Red'),  -- https://www.saratogawine.com/product/gerard-bertrand-cite-de-carcassonne-rouge-castellum-2019-750ml/
  ('Gérard Bertrand', 'Castellum Sauvignon Blanc', 'Languedoc, France', 'Sauvignon Blanc', 'White'),  -- https://www.saratogawine.com/product/gerard-bertrand-sauvignon-blanc-castellum-2023-750ml/
  ('Gérard Bertrand', 'Vents & Garrigue Languedoc Rouge', 'Languedoc, Languedoc, France', null, 'Red'),  -- https://www.saratogawine.com/product/gerard-bertrand-languedoc-rouge-vents-garrigue-2023-750ml/
  ('Gérard Bertrand', 'So''vive Blanc', 'Pays d''Oc, Languedoc, France', null, 'White'),  -- https://www.saratogawine.com/product/gerard-bertrand-pays-doc-blanc-sovive-2024-750ml/
  ('Gérard Bertrand', 'Clos d''Ora', 'Minervois La Livinière, Languedoc, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/vin-aoc-minervois-la-liviniere-clos-d-ora-2019-9636.html
  ('Gérard Bertrand', 'Clos du Temple', 'Cabrières, Languedoc, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/vin-aop-languedoc-cabrieres-clos-du-temple-12854.html
  ('Gérard Bertrand', 'Château de Villemajou La Forge', 'Corbières-Boutenac, Languedoc, France', null, 'Red'),  -- https://www.saratogawine.com/product/gerard-bertrand-corbieres-la-forge-2021-750ml/
  ('Gérard Bertrand', 'Le Viala', 'Minervois La Livinière, Languedoc, France', null, 'Red'),  -- https://www.saratogawine.com/product/gerard-bertrand-minervois-la-liviniere-le-viala-2021-750ml/
  ('Gérard Bertrand', 'Château de Villemajou Grand Vin Rouge', 'Corbières-Boutenac, Languedoc, France', null, 'Red'),  -- https://onshorecellars.com/fr/collections/producer-gerard-bertrand
  ('Gérard Bertrand', 'Legend Vintage Rivesaltes', 'Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://onshorecellars.com/fr/collections/producer-gerard-bertrand
  ('Gérard Bertrand', 'Château Laville Bertrou', 'Minervois La Livinière, Languedoc, France', null, 'Red'),  -- https://www.decanter.com/wine-reviews/search/g%C3%A9rard-bertrand/2/
  ('Gérard Bertrand', 'Château La Sauvageonne Grand Vin Rouge', 'Terrasses du Larzac, Languedoc, France', null, 'Red'),  -- https://www.decanter.com/wine-reviews/search/g%C3%A9rard-bertrand/page/3/2/
  ('Gérard Bertrand', 'Château La Sauvageonne Grand Vin Blanc', 'Languedoc, Languedoc, France', null, 'White'),  -- https://www.decanter.com/wine-reviews/search/g%C3%A9rard-bertrand/page/3/2/
  ('Gérard Bertrand', 'An 825 Crémant de Limoux Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.decanter.com/wine-reviews/search/g%C3%A9rard-bertrand/page/3/2/
  ('Gérard Bertrand', 'Hampton Water Rosé', 'Languedoc, France', null, 'Rosé'),  -- https://www.decanter.com/wine-reviews/search/g%C3%A9rard-bertrand/page/3/2/
  ('Gérard Bertrand', 'Code Rouge Crémant de Limoux Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.decanter.com/wine-reviews/search/g%C3%A9rard-bertrand/page/4/2/
  ('Gérard Bertrand', 'Aigle Royal Chardonnay', 'Limoux, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/g%C3%A9rard-bertrand/page/2/2/
  ('Gérard Bertrand', 'Les Aspres Réserve', 'Côtes du Roussillon Villages, Roussillon, France', null, 'Red'),  -- https://www.decanter.com/wine-reviews/search/g%C3%A9rard-bertrand/page/2/2/
  ('Gérard Bertrand', 'Thomas Jefferson Crémant de Limoux Brut Rosé', 'Crémant de Limoux, Languedoc, France', 'Chardonnay, Chenin Blanc, Pinot Noir', 'Sparkling')  -- https://8wines.com/wines/gerard-bertrand-thomas-jefferson-cremant-de-limoux-brut-rose-2017
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE L'HORTUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Domaine de l''Hortus', 'Pic Saint-Loup Rouge', 'Pic Saint-Loup, Languedoc, France', 'Syrah, Mourvèdre, Grenache', 'Red'),  -- https://www.domaine-hortus.fr/nos-vins/domaine-de-lhortus/
  ('Domaine de l''Hortus', 'Val de Montferrand Blanc', 'Val de Montferrand, Languedoc, France', 'Chardonnay, Viognier, Petit Manseng, Sauvignon Gris', 'White'),  -- https://www.domaine-hortus.fr/nos-vins/domaine-de-lhortus-grande-cuvee-blanc/
  ('Domaine de l''Hortus', 'Pic Saint-Loup Bergerie de l''Hortus Rouge', 'Pic Saint-Loup, Languedoc, France', 'Syrah, Grenache, Mourvèdre', 'Red'),  -- https://www.domaine-hortus.fr/nos-vins/bergerie-de-lhortus-rouge/
  ('Domaine de l''Hortus', 'Val de Montferrand Bergerie de l''Hortus Blanc', 'Val de Montferrand, Languedoc, France', 'Sauvignon Blanc, Sauvignon Gris, Roussanne, Viognier, Petit Manseng, Chardonnay, Muscat Petit Grain', 'White'),  -- https://www.domaine-hortus.fr/nos-vins/bergerie-de-lhortus-blanc/
  ('Domaine de l''Hortus', 'Languedoc Bergerie de l''Hortus Rosé', 'Languedoc, France', 'Syrah, Grenache', 'Rosé'),  -- https://www.domaine-hortus.fr/nos-vins/bergerie-de-lhortus-rose/
  ('Domaine de l''Hortus', 'Le Dit de l''Hortus La Soulane', 'Languedoc, France', 'Mourvèdre', 'Red'),  -- https://www.domaine-hortus.fr/nos-vins/le-dit-de-lhortus-la-soulane/
  ('Domaine de l''Hortus', 'Le Dit de l''Hortus L''Ombrée', 'Languedoc, France', 'Syrah', 'Red')  -- https://www.domaine-hortus.fr/nos-vins/le-dit-de-lhortus-lombree/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MAS DE DAUMAS GASSAC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Mas de Daumas Gassac', 'Rouge', 'Saint-Guilhem-le-Désert, Languedoc, France', 'Cabernet Sauvignon, Cabernet Franc, Merlot, Petit Verdot, Pinot Noir, Tannat', 'Red'),  -- https://boutique.daumas-gassac.com/fr/mas-de-daumas-gassac/380-rouge-2024.html
  ('Mas de Daumas Gassac', 'Blanc', 'Saint-Guilhem-le-Désert, Languedoc, France', 'Chardonnay, Chenin, Muscat, Petit Manseng, Viognier', 'White'),  -- https://boutique.daumas-gassac.com/fr/mas-de-daumas-gassac/387-blanc.html
  ('Mas de Daumas Gassac', 'Rosé Frizant', 'Languedoc, France', null, 'Sparkling'),  -- https://boutique.daumas-gassac.com/fr/3-mas-de-daumas-gassac
  ('Mas de Daumas Gassac', 'Vin de Laurence', 'Languedoc, France', 'Muscat Petit Grain, Sercial', 'Fortified'),  -- https://boutique.daumas-gassac.com/fr/mas-de-daumas-gassac/132-vin-de-laurence.html
  ('Mas de Daumas Gassac', 'Moulin de Gassac Tèrra Rouge', 'Languedoc, France', 'Syrah, Grenache', 'Red'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Tèrra Blanc', 'Languedoc, France', 'Grenache Blanc, Roussanne', 'White'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Combe Calcaire Rouge', 'Languedoc, France', null, 'Red'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Combe Calcaire Blanc', 'Languedoc, France', null, 'White'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Albaran', 'Pays d''Hérault, Languedoc, France', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://boutique.daumas-gassac.com/fr/sas-moulin-de-gassac/36-albaran.html
  ('Mas de Daumas Gassac', 'Moulin de Gassac Elise', 'Pays d''Hérault, Languedoc, France', 'Merlot, Syrah', 'Red'),  -- https://boutique.daumas-gassac.com/fr/sas-moulin-de-gassac/35-elise.html
  ('Mas de Daumas Gassac', 'Moulin de Gassac Eraus', 'Languedoc, France', 'Sauvignon Blanc, Rolle', 'White'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Faune', 'Languedoc, France', 'Chardonnay, Viognier', 'White'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Guilhem Rouge', 'Languedoc, France', null, 'Red'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Guilhem Rosé', 'Languedoc, France', null, 'Rosé'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Guilhem Blanc', 'Languedoc, France', 'Rolle', 'White'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Picpoul de Pinet', 'Picpoul de Pinet, Languedoc, France', 'Piquepoul', 'White'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Grenache', 'Pays d''Oc, Languedoc, France', 'Grenache', 'Red'),  -- https://boutique.daumas-gassac.com/fr/sas-moulin-de-gassac/352-grenache.html
  ('Mas de Daumas Gassac', 'Moulin de Gassac Chardonnay', 'Languedoc, France', 'Chardonnay', 'White'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Sauvignon Blanc', 'Languedoc, France', 'Sauvignon Blanc', 'White'),  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
  ('Mas de Daumas Gassac', 'Moulin de Gassac Viognier', 'Languedoc, France', 'Viognier', 'White')  -- https://boutique.daumas-gassac.com/fr/6-sas-moulin-de-gassac
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PUECH-HAUT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Château Puech-Haut', 'Languedoc 40ème', 'Languedoc, France', 'Syrah, Grenache, Carignan', 'Red'),  -- https://puech-haut.com/nos-vins/vins-rouges/40eme-rouge/
  ('Château Puech-Haut', 'Languedoc Bosc Negre', 'Languedoc, France', 'Mourvèdre, Grenache', 'Red'),  -- https://puech-haut.com/nos-vins/vins-rouges/bosc-negre-rouge/
  ('Château Puech-Haut', 'Languedoc Quercus', 'Languedoc, France', 'Grenache, Syrah', 'Red'),  -- https://puech-haut.com/nos-vins/vins-rouges/quercus-rouge/
  ('Château Puech-Haut', 'Languedoc Recantou', 'Languedoc, France', 'Syrah, Grenache', 'Red'),  -- https://puech-haut.com/nos-vins/vins-rouges/recantou-rouge/
  ('Château Puech-Haut', 'Languedoc Tête de Bélier Rouge', 'Languedoc, France', 'Syrah, Grenache, Mourvèdre, Carignan', 'Red'),  -- https://puech-haut.com/nos-vins/
  ('Château Puech-Haut', 'Languedoc Tête de Bélier Blanc', 'Languedoc, France', 'Roussanne, Marsanne, Grenache Blanc, Viognier', 'White'),  -- https://puech-haut.com/nos-vins/vins-blancs/tete-de-belier-blanc/
  ('Château Puech-Haut', 'Languedoc Tête de Bélier Rosé', 'Languedoc, France', 'Mourvèdre, Grenache, Syrah', 'Rosé'),  -- https://puech-haut.com/nos-vins/roses/tete-de-belier-rose/
  ('Château Puech-Haut', 'Languedoc Prestige Rouge', 'Languedoc, France', 'Grenache, Syrah, Carignan', 'Red'),  -- https://puech-haut.com/nos-vins/vins-rouges/prestige-rouge/
  ('Château Puech-Haut', 'Languedoc Prestige Blanc', 'Languedoc, France', 'Roussanne, Marsanne', 'White'),  -- https://puech-haut.com/nos-vins/vins-blancs/prestige-blanc/
  ('Château Puech-Haut', 'Pic Saint-Loup Clos du Pic', 'Pic Saint-Loup, Languedoc, France', 'Syrah, Grenache, Mourvèdre', 'Red'),  -- https://puech-haut.com/nos-vins/
  ('Château Puech-Haut', 'Pic Saint-Loup Lavabre', 'Pic Saint-Loup, Languedoc, France', 'Syrah, Grenache, Mourvèdre', 'Red'),  -- https://puech-haut.com/nos-vins/
  ('Château Puech-Haut', 'Pic Saint-Loup Loup du Pic Rouge', 'Pic Saint-Loup, Languedoc, France', 'Syrah, Grenache, Mourvèdre', 'Red'),  -- https://puech-haut.com/nos-vins/
  ('Château Puech-Haut', 'Pic Saint-Loup Loup du Pic Rosé', 'Pic Saint-Loup, Languedoc, France', null, 'Rosé'),  -- https://puech-haut.com/nos-vins/
  ('Château Puech-Haut', 'Theyron Rouge', 'Pays d''Oc, Languedoc, France', 'Syrah, Grenache, Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://puech-haut.com/nos-vins/vins-rouges/theyron-rouge/
  ('Château Puech-Haut', 'Theyron Blanc', 'Pays d''Oc, Languedoc, France', 'Rolle', 'White'),  -- https://puech-haut.com/nos-vins/
  ('Château Puech-Haut', 'Theyron Rosé', 'Pays d''Oc, Languedoc, France', null, 'Rosé'),  -- https://puech-haut.com/nos-vins/
  ('Château Puech-Haut', 'Argali Rouge', 'Languedoc, France', 'Syrah, Grenache, Merlot', 'Red'),  -- https://puech-haut.com/nos-vins/vins-rouges/argali-rouge/
  ('Château Puech-Haut', 'Argali Blanc', 'Languedoc, France', 'Grenache Blanc, Muscat', 'White'),  -- https://puech-haut.com/nos-vins/vins-blancs/argali-blanc/
  ('Château Puech-Haut', 'Argali Rosé', 'Pays d''Oc, Languedoc, France', 'Grenache, Cinsault', 'Rosé'),  -- https://puech-haut.com/nos-vins/
  ('Château Puech-Haut', 'Argali Givré Blanc', 'Pays d''Oc, Languedoc, France', 'Rolle, Marsanne', 'White'),  -- https://puech-haut.com/nos-vins/vins-blancs/argali-givre-blanc/
  ('Château Puech-Haut', 'Argali Haut Perché Rosé', 'Pays d''Oc, Languedoc, France', 'Grenache, Cinsault, Rolle', 'Rosé'),  -- https://puech-haut.com/nos-vins/roses/argali-haut-perche-rose/
  ('Château Puech-Haut', 'Chill Blanc', 'Pays d''Oc, Languedoc, France', 'Rolle, Grenache Blanc', 'White'),  -- https://puech-haut.com/nos-vins/vins-blancs/chill-blanc/
  ('Château Puech-Haut', 'Chill Rosé', 'Pays d''Oc, Languedoc, France', 'Grenache, Cinsault', 'Rosé'),  -- https://puech-haut.com/nos-vins/roses/chill-rose/
  ('Château Puech-Haut', 'Sable de Camargue Watusi', 'Sable de Camargue, Languedoc, France', 'Grenache, Grenache Gris, Cabernet Franc, Merlot', 'Rosé')  -- https://puech-haut.com/nos-vins/roses/watusi-rose/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HECHT & BANNIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Hecht & Bannier', 'Languedoc Rouge', 'Languedoc, France', null, 'Red'),  -- https://hechtbannier.com/pages/hecht-bannier
  ('Hecht & Bannier', 'Languedoc Rosé', 'Languedoc, France', null, 'Rosé'),  -- https://hechtbannier.com/pages/hecht-bannier
  ('Hecht & Bannier', 'Picpoul de Pinet', 'Picpoul de Pinet, Languedoc, France', 'Piquepoul', 'White'),  -- https://hechtbannier.com/pages/hecht-bannier
  ('Hecht & Bannier', 'Minervois', 'Minervois, Languedoc, France', null, 'Red'),  -- https://hechtbannier.com/pages/hecht-bannier
  ('Hecht & Bannier', 'Saint-Chinian', 'Saint-Chinian, Languedoc, France', null, 'Red'),  -- https://hechtbannier.com/pages/hecht-bannier
  ('Hecht & Bannier', 'Pic Saint-Loup', 'Pic Saint-Loup, Languedoc, France', null, 'Red'),  -- https://hechtbannier.com/pages/hecht-bannier
  ('Hecht & Bannier', 'Faugères', 'Faugères, Languedoc, France', null, 'Red'),  -- https://hechtbannier.com/pages/hecht-bannier
  ('Hecht & Bannier', 'Côtes du Roussillon Villages', 'Côtes du Roussillon Villages, Roussillon, France', null, 'Red'),  -- https://hechtbannier.com/pages/hecht-bannier
  ('Hecht & Bannier', 'Crémant de Limoux Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://hechtbannier.com/pages/hecht-bannier
  ('Hecht & Bannier', 'Crémant de Limoux Brut Rosé', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling')  -- https://hechtbannier.com/pages/hecht-bannier
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE LA NEGLY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Château de la Negly', 'Les Terrasses Blanc', 'Pays d''Oc, Languedoc, France', 'Muscat Petits Grains, Sauvignon Blanc', 'White'),  -- https://boutique.lanegly.com/fr/vin-blanc/1-les-terrasses-blanc.html
  ('Château de la Negly', 'Les Terrasses Rosé', 'Pays d''Oc, Languedoc, France', 'Cabernet Sauvignon, Malbec, Syrah', 'Rosé'),  -- https://boutique.lanegly.com/fr/vins-roses/2-les-terrasses-rose.html
  ('Château de la Negly', 'Les Terrasses Rouge', 'Pays d''Oc, Languedoc, France', 'Grenache, Syrah', 'Red'),  -- https://boutique.lanegly.com/fr/vins-rouges/3-les-terrasses-rouge.html
  ('Château de la Negly', 'L''Oppidum', 'Pays d''Oc, Languedoc, France', 'Chardonnay', 'White'),  -- https://boutique.lanegly.com/fr/vin-blanc/4-l-oppidum.html
  ('Château de la Negly', 'Les Astérides Blanc', 'Pays d''Oc, Languedoc, France', 'Chardonnay, Grenache Gris, Colombard', 'White'),  -- https://boutique.lanegly.com/fr/vin-blanc/37-les-asterides-blanc.html
  ('Château de la Negly', 'Les Astérides Rosé', 'Pays d''Oc, Languedoc, France', 'Grenache Gris, Merlot, Syrah', 'Rosé'),  -- https://boutique.lanegly.com/fr/vins-roses/22-les-asterides-rose.html
  ('Château de la Negly', 'Les Astérides Rouge', 'Pays d''Oc, Languedoc, France', 'Grenache, Syrah', 'Red'),  -- https://boutique.lanegly.com/fr/vins-rouges/36-les-asterides-3.html
  ('Château de la Negly', 'Languedoc L''Écume Blanc', 'Languedoc, France', 'Bourboulenc, Marsanne, Rolle, Roussanne, Grenache Blanc', 'White'),  -- https://boutique.lanegly.com/fr/vin-blanc/17-lecume-blanc.html
  ('Château de la Negly', 'Languedoc L''Écume Rosé', 'Languedoc, France', 'Grenache Noir, Grenache Gris, Mourvèdre, Syrah', 'Rosé'),  -- https://boutique.lanegly.com/fr/vins-roses/7-l-ecume-rose.html
  ('Château de la Negly', 'Languedoc La Natice', 'Languedoc, France', 'Grenache Noir, Grenache Gris, Mourvèdre, Syrah', 'Rosé'),  -- https://boutique.lanegly.com/fr/vins-roses/8-la-natice.html
  ('Château de la Negly', 'La Clape La Brise Marine', 'La Clape, Languedoc, France', 'Bourboulenc, Rolle, Roussanne, Grenache Blanc', 'White'),  -- https://boutique.lanegly.com/fr/vin-blanc/6-la-brise-marine.html
  ('Château de la Negly', 'La Falaise Blanche', 'Pays d''Oc, Languedoc, France', 'Chardonnay, Grenache Gris, Sauvignon Gris', 'White'),  -- https://boutique.lanegly.com/fr/vin-blanc/5-la-falaise-blanche.html
  ('Château de la Negly', 'La Clape La Falaise Rouge', 'La Clape, Languedoc, France', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://boutique.lanegly.com/fr/vins-rouges/13-la-falaise-rouge.html
  ('Château de la Negly', 'La Clape La Côte', 'La Clape, Languedoc, France', 'Syrah, Carignan, Grenache, Mourvèdre', 'Red'),  -- https://boutique.lanegly.com/fr/vins-rouges/18-la-cote.html
  ('Château de la Negly', 'La Clape Les Grès', 'La Clape, Languedoc, France', 'Grenache, Syrah', 'Red'),  -- https://boutique.lanegly.com/fr/vins-rouges/12-les-gres.html
  ('Château de la Negly', 'La Clape L''Ancely', 'La Clape, Languedoc, France', 'Grenache, Mourvèdre', 'Red'),  -- https://boutique.lanegly.com/fr/vins-rouges/19-l-ancely.html
  ('Château de la Negly', 'Languedoc Villamanda', 'Languedoc, France', 'Syrah, Grenache Noir', 'Red'),  -- https://boutique.lanegly.com/fr/vins-rouges/11-villamanda.html
  ('Château de la Negly', 'Languedoc La Petite Villamanda', 'Languedoc, France', 'Syrah, Grenache Noir', 'Red'),  -- https://boutique.lanegly.com/fr/vins-rouges/10-la-petite-villamanda.html
  ('Château de la Negly', 'La Porte du Ciel', 'Languedoc, France', 'Grenache, Syrah', 'Red'),  -- https://boutique.lanegly.com/fr/vins-rouges/20-la-porte-du-ciel.html
  ('Château de la Negly', 'C des Truffiers', 'Languedoc, France', 'Grenache, Syrah', 'Red'),  -- https://boutique.lanegly.com/fr/LaNegly/51-c-des-truffiers.html
  ('Château de la Negly', 'Cinsault', 'Languedoc, France', 'Cinsault', 'Red')  -- https://boutique.lanegly.com/fr/vins-rouges/34-cinsault.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU D'AUSSIÈRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Château d''Aussières', 'Corbières Rouge', 'Corbières, Languedoc, France', 'Syrah, Mourvèdre', 'Red'),  -- https://winedirectory.lafite.com/en/the-wine-directory/product-TY106E-chateau-daussieres/
  ('Château d''Aussières', 'Corbières Rosé', 'Corbières, Languedoc, France', 'Grenache, Syrah', 'Rosé'),  -- https://winedirectory.lafite.com/en/the-wine-directory/product-1NF16E-chateau-daussieres-rose/
  ('Château d''Aussières', 'Corbières Altan d''Aussières', 'Corbières, Languedoc, France', 'Carignan, Grenache, Syrah, Mourvèdre', 'Red'),  -- https://winedirectory.lafite.com/en/the-wine-directory/product-6F2I1E-altan-daussieres/
  ('Château d''Aussières', 'Corbières Blason d''Aussières', 'Corbières, Languedoc, France', 'Syrah, Grenache, Carignan, Mourvèdre', 'Red'),  -- https://winedirectory.lafite.com/en/the-wine-directory/product-9DXG1E-blason-daussieres/
  ('Château d''Aussières', 'A d''Aussières Rouge', 'Pays d''Oc, Languedoc, France', 'Syrah, Grenache, Cabernet Sauvignon, Marselan, Carignan, Merlot, Cabernet Franc, Mourvèdre, Alicante Henri Bouschet, Petit Verdot', 'Red'),  -- https://winedirectory.lafite.com/en/the-wine-directory/product-MXS31E-a-daussieres-rouge/
  ('Château d''Aussières', 'A d''Aussières Rosé', 'Pays d''Oc, Languedoc, France', 'Grenache, Syrah', 'Rosé'),  -- https://winedirectory.lafite.com/en/the-wine-directory/product-17I1NE-a-daussieres-rose/
  ('Château d''Aussières', 'A d''Aussières Chardonnay', 'Pays d''Oc, Languedoc, France', 'Chardonnay', 'White')  -- https://winedirectory.lafite.com/en/the-wine-directory/product-N8G11E-a-daussieres-chardonnay/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LAFAGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Domaine Lafage', 'Moutou', 'Côtes Catalanes, Roussillon, France', 'Grenache, Syrah', 'Red'),  -- https://domaine-lafage.com/produit/moutou/
  ('Domaine Lafage', 'Cabirau Rouge', 'Maury, Roussillon, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://domaine-lafage.com/produit/cabirau-rouge/
  ('Domaine Lafage', 'Nicolas', 'Côtes Catalanes, Roussillon, France', 'Grenache', 'Red'),  -- https://domaine-lafage.com/produit/nicolas/
  ('Domaine Lafage', 'Léa', 'Côtes du Roussillon, Roussillon, France', 'Grenache Noir, Carignan, Syrah', 'Red'),  -- https://domaine-lafage.com/produit/lea/
  ('Domaine Lafage', 'La Rétro', 'Roussillon, France', 'Carignan, Lladoner, Grenache Noir, Grenache Gris', 'Red'),  -- https://domaine-lafage.com/produit/la-retro/
  ('Domaine Lafage', 'Authentique', 'Côtes du Roussillon, Roussillon, France', 'Carignan, Syrah, Grenache', 'Red'),  -- https://domaine-lafage.com/produit/authentique/
  ('Domaine Lafage', 'Cayrol', 'Côtes Catalanes, Roussillon, France', 'Carignan', 'Red'),  -- https://domaine-lafage.com/produit/cayrol/
  ('Domaine Lafage', 'Narassa', 'Côtes Catalanes, Roussillon, France', 'Grenache, Syrah', 'Red'),  -- https://domaine-lafage.com/produit/narassa/
  ('Domaine Lafage', 'Double Passage', 'Côtes Catalanes, Roussillon, France', 'Grenache, Mourvèdre, Cabernet Sauvignon', 'Red'),  -- https://domaine-lafage.com/produit/double-passage/
  ('Domaine Lafage', 'Le Vignon', 'Côtes du Roussillon, Roussillon, France', 'Grenache, Mourvèdre', 'Red'),  -- https://domaine-lafage.com/produit/le-vignon/
  ('Domaine Lafage', 'Les Onze Terrasses', 'Côtes du Roussillon Villages Les Aspres, Roussillon, France', 'Syrah, Mourvèdre, Grenache', 'Red'),  -- https://domaine-lafage.com/produit/les-onze-terrasses/
  ('Domaine Lafage', 'Arqueta', 'Collioure, Roussillon, France', 'Grenache Noir, Grenache Gris, Syrah, Carignan', 'Red'),  -- https://domaine-lafage.com/produit/arqueta/
  ('Domaine Lafage', 'Corbarol Rouge', 'Côtes du Roussillon, Roussillon, France', 'Syrah, Grenache Noir', 'Red'),  -- https://domaine-lafage.com/produit/vieilles-vignes-rouge/
  ('Domaine Lafage', 'Chimères', 'Côtes du Roussillon Villages, Roussillon, France', 'Grenache Noir, Syrah, Carignan', 'Red'),  -- https://domaine-lafage.com/produit/chimeres/
  ('Domaine Lafage', 'Kerbuccio', 'Maury, Roussillon, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://domaine-lafage.com/produit/kerbuccio/
  ('Domaine Lafage', 'Cantaca', 'Roussillon, France', 'Chardonnay, Petit Manseng, Chenin, Sauvignon Blanc', 'White'),  -- https://domaine-lafage.com/produit/cantaca/
  ('Domaine Lafage', 'Lafabuleuse Miraflors Blanc', 'Roussillon, France', 'Muscat d''Alexandrie, Rolle, Viognier, Grenache Blanc', 'Sparkling'),  -- https://domaine-lafage.com/produit/lafabuleuse/
  ('Domaine Lafage', 'Cadireta', 'Côtes Catalanes, Roussillon, France', 'Chardonnay, Viognier', 'White'),  -- https://domaine-lafage.com/produit/cadireta/
  ('Domaine Lafage', 'Centenaire', 'Côtes Catalanes, Roussillon, France', 'Grenache Blanc, Grenache Gris, Roussanne', 'White'),  -- https://domaine-lafage.com/produit/centenaire/
  ('Domaine Lafage', 'Cabirau Blanc', 'Côtes du Roussillon, Roussillon, France', 'Grenache Blanc, Grenache Gris, Macabeu', 'White'),  -- https://domaine-lafage.com/produit/cabirau-blanc/
  ('Domaine Lafage', 'Corbarol Blanc', 'Côtes du Roussillon, Roussillon, France', 'Grenache Blanc, Roussanne', 'White'),  -- https://domaine-lafage.com/produit/corbarol-blanc/
  ('Domaine Lafage', 'Miraflors', 'Côtes Catalanes, Roussillon, France', 'Grenache Gris, Grenache Noir, Mourvèdre', 'Rosé'),  -- https://domaine-lafage.com/produit/miraflors/
  ('Domaine Lafage', 'Gallica', 'Côtes du Roussillon, Roussillon, France', 'Mourvèdre, Grenache Noir, Syrah, Grenache Gris', 'Rosé'),  -- https://domaine-lafage.com/produit/domaine-lafage-gallica/
  ('Domaine Lafage', 'Maury Grenat', 'Maury, Roussillon, France', 'Grenache Noir', 'Fortified'),  -- https://domaine-lafage.com/produit/maury-grenat/
  ('Domaine Lafage', 'Rivesaltes Ambré Hors d''Age', 'Rivesaltes, Roussillon, France', 'Grenache Blanc, Grenache Gris', 'Fortified'),  -- https://domaine-lafage.com/produit/ambre-hors-dage/
  ('Domaine Lafage', 'Muscat de Rivesaltes Grain de Vigne', 'Muscat de Rivesaltes, Roussillon, France', 'Muscat Petits Grains, Muscat d''Alexandrie', 'Fortified'),  -- https://domaine-lafage.com/produit/grain-de-vigne/
  ('Domaine Lafage', 'Muscat de Noël Blanc comme neige', 'Muscat de Rivesaltes, Roussillon, France', 'Muscat Petits Grains, Muscat d''Alexandrie', 'Fortified'),  -- https://domaine-lafage.com/produit/muscat-de-noel-blanc-comme-neige/
  ('Domaine Lafage', 'La Triple Blanc', 'Roussillon, France', 'Chardonnay, Sauvignon, Viognier, Grenache Blanc', 'Sparkling')  -- https://domaine-lafage.com/produit/la-triple-blanc/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GAUBY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Domaine Gauby', 'Calcinaires Blanc', 'Côtes Catalanes, Roussillon, France', null, 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/gauby/id/11697
  ('Domaine Gauby', 'Calcinaires Rouge', 'Côtes Catalanes, Roussillon, France', null, 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/gauby/id/11697
  ('Domaine Gauby', 'Vieilles Vignes Rouge', 'Côtes Catalanes, Roussillon, France', null, 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/gauby/id/11697
  ('Domaine Gauby', 'Vieilles Vignes Blanc', 'Côtes Catalanes, Roussillon, France', null, 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/gauby/id/11697
  ('Domaine Gauby', 'Muntada', 'Côtes Catalanes, Roussillon, France', null, 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/gauby/id/11697
  ('Domaine Gauby', 'Coume Gineste Blanc', 'Côtes Catalanes, Roussillon, France', null, 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/gauby/id/11697
  ('Domaine Gauby', 'La Roque', 'Côtes Catalanes, Roussillon, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Gauby
  ('Domaine Gauby', 'Mel Rose', 'Côtes Catalanes, Roussillon, France', null, 'Rosé'),  -- https://www.idealwine.com/en/buy-wine/domain-Gauby
  ('Domaine Gauby', 'Foun Amphore', 'Côtes Catalanes, Roussillon, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Gauby
  ('Domaine Gauby', 'Coume des Lloups', 'Côtes Catalanes, Roussillon, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Gauby
  ('Domaine Gauby', 'Muntada Blanc', 'Côtes Catalanes, Roussillon, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Gauby
  ('Domaine Gauby', 'Coume Gineste Rouge', 'Côtes du Roussillon Villages, Roussillon, France', null, 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Gauby
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DES FÉES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Clos des Fées', 'Les Sorcières Rouge', 'Roussillon, France', 'Syrah, Grenache, Carignan', 'Red'),  -- https://www.closdesfees.com/les-vins/
  ('Clos des Fées', 'Les Sorcières Blanc', 'Roussillon, France', 'Vermentino, Roussanne, Macabeo', 'White'),  -- https://www.closdesfees.com/les-vins/
  ('Clos des Fées', 'L''Apprentie Sorcière', 'Roussillon, France', 'Grenache Noir, Carignan, Syrah, Mourvèdre', 'Rosé'),  -- https://www.lapetiteepicerieduclosdesfees.com/
  ('Clos des Fées', 'Oeil de Perdrix', 'Roussillon, France', null, 'Rosé'),  -- https://www.lapetiteepicerieduclosdesfees.com/
  ('Clos des Fées', 'Vieilles Vignes Blanc', 'Roussillon, France', 'Grenache Blanc, Grenache Gris', 'White'),  -- https://www.closdesfees.com/les-vins/
  ('Clos des Fées', 'Vieilles Vignes Rouge', 'Roussillon, France', 'Grenache, Lladoner Pelut, Carignan, Syrah', 'Red'),  -- https://www.closdesfees.com/les-vins/
  ('Clos des Fées', null, 'Roussillon, France', 'Syrah, Mourvèdre, Grenache, Carignan', 'Red'),  -- https://www.lapetiteepicerieduclosdesfees.com/
  ('Clos des Fées', 'La Petite Sibérie', 'Roussillon, France', 'Grenache Noir', 'Red'),  -- https://www.lapetiteepicerieduclosdesfees.com/
  ('Clos des Fées', 'De Battre mon Cœur s''est Arrêté', 'Roussillon, France', 'Syrah', 'Red'),  -- https://www.lapetiteepicerieduclosdesfees.com/
  ('Clos des Fées', 'Images Dérisoires', 'Roussillon, France', 'Tempranillo, Carignan', 'Red'),  -- https://www.closdesfees.com/les-vins/
  ('Clos des Fées', 'Un Faune avec son Fifre sous les Oliviers Sauvages Rouge', 'Roussillon, France', 'Cabernet Franc, Merlot', 'Red'),  -- https://www.closdesfees.com/les-vins/
  ('Clos des Fées', 'Un Faune avec son Fifre sous les Oliviers Sauvages Blanc', 'Roussillon, France', 'Sémillon', 'White'),  -- https://www.closdesfees.com/les-vins/
  ('Clos des Fées', 'Aimer, Rêver, Prier, Se Taire', 'Roussillon, France', 'Pinot Noir', 'Red'),  -- https://www.closdesfees.com/les-vins/
  ('Clos des Fées', 'Post Scriptum', 'Roussillon, France', null, 'Red'),  -- https://www.lapetiteepicerieduclosdesfees.com/
  ('Clos des Fées', '100 Phrases pour Éventails', 'Roussillon, France', null, 'Red'),  -- https://www.lapetiteepicerieduclosdesfees.com/
  ('Clos des Fées', 'Le Chat du Marquis', 'Roussillon, France', null, 'Red')  -- https://www.lapetiteepicerieduclosdesfees.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA RECTORIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Domaine de la Rectorie', 'Collioure Blanc Argile', 'Collioure, Roussillon, France', 'Grenache Gris, Grenache Blanc', 'White'),  -- https://www.rectorie.com/les-vins/collioure-blanc-argile/
  ('Domaine de la Rectorie', 'Collioure Rosé Côté Mer', 'Collioure, Roussillon, France', 'Grenache Noir, Syrah, Carignan', 'Rosé'),  -- https://www.rectorie.com/les-vins/collioure-rose-cote-mer-rose/
  ('Domaine de la Rectorie', 'Collioure Rosé La Goudie', 'Collioure, Roussillon, France', 'Grenache Noir', 'Rosé'),  -- https://www.rectorie.com/les-vins/collioure-rose-la-goudie/
  ('Domaine de la Rectorie', 'Collioure Rouge Côté Mer', 'Collioure, Roussillon, France', 'Syrah, Grenache, Carignan', 'Red'),  -- https://www.rectorie.com/les-vins/collioure-rouge-cote-mer/
  ('Domaine de la Rectorie', 'Collioure Rouge L''Oriental', 'Collioure, Roussillon, France', 'Grenache Noir, Carignan', 'Red'),  -- https://www.rectorie.com/les-vins/collioure-rouge-oriental/
  ('Domaine de la Rectorie', 'Collioure Rouge Montagne', 'Collioure, Roussillon, France', 'Mourvèdre, Grenache Noir, Carignan, Counoise', 'Red'),  -- https://www.rectorie.com/les-vins/collioure-rouge-montagne/
  ('Domaine de la Rectorie', 'Collioure Rouge Barlande', 'Collioure, Roussillon, France', 'Grenache Noir, Carignan', 'Red'),  -- https://www.rectorie.com/les-vins/collioure-rouge-barlande/
  ('Domaine de la Rectorie', 'Banyuls Thérèse Reig', 'Banyuls, Roussillon, France', 'Grenache Noir, Carignan', 'Fortified'),  -- https://www.rectorie.com/les-vins/banyuls-therese-reig/
  ('Domaine de la Rectorie', 'Banyuls Léon Parcé', 'Banyuls, Roussillon, France', 'Grenache, Carignan', 'Fortified'),  -- https://www.rectorie.com/les-vins/banyuls-leon-parce/
  ('Domaine de la Rectorie', 'Banyuls Pierre Rapidel', 'Banyuls, Roussillon, France', 'Grenache, Carignan', 'Fortified'),  -- https://www.rectorie.com/les-vins/banyuls-pierre-rapidel/
  ('Domaine de la Rectorie', 'Banyuls L''Oublée', 'Banyuls, Roussillon, France', 'Grenache Noir, Carignan, Grenache Gris', 'Fortified'),  -- https://www.rectorie.com/les-vins/l-oublee/
  ('Domaine de la Rectorie', 'Voile d''Argile', 'Roussillon, France', 'Grenache Gris, Grenache Blanc', 'White')  -- https://www.rectorie.com/les-vins/voile-dargile/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CAZES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Domaine Cazes', 'Ego Rouge', 'Côtes du Roussillon Villages, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html
  ('Domaine Cazes', 'Ego Blanc', 'Côtes du Roussillon, Roussillon, France', null, 'White'),  -- https://boutique.cazes-rivesaltes.com/blancs.html
  ('Domaine Cazes', 'Alter', 'Côtes du Roussillon Villages, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html
  ('Domaine Cazes', 'Le Credo', 'Côtes du Roussillon Villages, Roussillon, France', 'Syrah, Grenache, Mourvèdre', 'Red'),  -- https://www.cazes-rivesaltes.com/grands-vins/
  ('Domaine Cazes', 'Le Canon du Maréchal Rouge', 'Côtes Catalanes, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html
  ('Domaine Cazes', 'Le Canon du Maréchal Blanc', 'Côtes Catalanes, Roussillon, France', null, 'White'),  -- https://boutique.cazes-rivesaltes.com/blancs.html
  ('Domaine Cazes', 'Le Canon du Maréchal Rosé', 'Côtes Catalanes, Roussillon, France', null, 'Rosé'),  -- https://boutique.cazes-rivesaltes.com/roses.html
  ('Domaine Cazes', 'Mataro', 'Côtes Catalanes, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html?p=2
  ('Domaine Cazes', 'Samso Nature', 'Côtes Catalanes, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html?p=2
  ('Domaine Cazes', 'Hommage', 'Côtes du Roussillon, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html?p=2
  ('Domaine Cazes', 'Macabeo', 'Côtes Catalanes, Roussillon, France', 'Macabeo', 'Orange'),  -- https://boutique.cazes-rivesaltes.com/blancs.html
  ('Domaine Cazes', 'Rolle In Stone', 'Côtes Catalanes, Roussillon, France', 'Rolle', 'White'),  -- https://boutique.cazes-rivesaltes.com/blancs.html
  ('Domaine Cazes', 'Roc de Llana', 'Côtes du Roussillon Villages Tautavel, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html?p=2
  ('Domaine Cazes', 'Rivesaltes Aimé Cazes', 'Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://www.cazes-rivesaltes.com/grands-vins/
  ('Domaine Cazes', 'Rivesaltes Grenat', 'Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://boutique.cazes-rivesaltes.com/vins-doux-naturels.html
  ('Domaine Cazes', 'Rivesaltes Ambré', 'Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://boutique.cazes-rivesaltes.com/vins-doux-naturels.html
  ('Domaine Cazes', 'Rivesaltes Tuilé', 'Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://boutique.cazes-rivesaltes.com/vins-doux-naturels.html
  ('Domaine Cazes', 'Muscat de Rivesaltes', 'Muscat de Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://boutique.cazes-rivesaltes.com/vins-doux-naturels.html
  ('Domaine Cazes', 'Muscat de Noël', 'Muscat de Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://boutique.cazes-rivesaltes.com/vins-doux-naturels.html
  ('Domaine Cazes', 'Collection Vieux Rivesaltes', 'Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://boutique.cazes-rivesaltes.com/vins-doux-naturels.html
  ('Domaine Cazes', 'Collection Vieux Muscat de Rivesaltes', 'Muscat de Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://boutique.cazes-rivesaltes.com/vins-doux-naturels.html
  ('Domaine Cazes', 'Les Clos de Paulilles Collioure Rouge', 'Collioure, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html
  ('Domaine Cazes', 'Les Clos de Paulilles Collioure Blanc', 'Collioure, Roussillon, France', null, 'White'),  -- https://boutique.cazes-rivesaltes.com/blancs.html
  ('Domaine Cazes', 'Les Clos de Paulilles Collioure Rosé', 'Collioure, Roussillon, France', null, 'Rosé'),  -- https://boutique.cazes-rivesaltes.com/roses.html
  ('Domaine Cazes', 'Les Clos de Paulilles Cap Béar Rouge', 'Collioure, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html?p=2
  ('Domaine Cazes', 'Les Clos de Paulilles Cap Béar Blanc', 'Collioure, Roussillon, France', null, 'White'),  -- https://boutique.cazes-rivesaltes.com/blancs.html
  ('Domaine Cazes', 'Les Clos de Paulilles Cap Béar Rosé', 'Collioure, Roussillon, France', null, 'Rosé'),  -- https://boutique.cazes-rivesaltes.com/roses.html
  ('Domaine Cazes', 'Les Clos de Paulilles Notre Dame des Anges', 'Collioure, Roussillon, France', null, 'Red'),  -- https://boutique.cazes-rivesaltes.com/rouges.html?p=2
  ('Domaine Cazes', 'Les Clos de Paulilles Blanc de Noirs', 'Côte Vermeille, Roussillon, France', null, 'White'),  -- https://boutique.cazes-rivesaltes.com/blancs.html
  ('Domaine Cazes', 'Les Clos de Paulilles Banyuls Grand Cru', 'Banyuls Grand Cru, Roussillon, France', null, 'Fortified'),  -- https://boutique.cazes-rivesaltes.com/vins-doux-naturels.html
  ('Domaine Cazes', 'Les Clos de Paulilles Banyuls Traditionnel', 'Banyuls, Roussillon, France', null, 'Fortified')  -- https://boutique.cazes-rivesaltes.com/vins-doux-naturels.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MAS AMIEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Mas Amiel', 'Maury 20 Ans d''Âge', 'Maury, Roussillon, France', null, 'Fortified'),  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
  ('Mas Amiel', 'Maury 30 Ans d''Âge', 'Maury, Roussillon, France', null, 'Fortified'),  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
  ('Mas Amiel', 'Maury 40 Ans d''Âge', 'Maury, Roussillon, France', null, 'Fortified'),  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
  ('Mas Amiel', 'Maury Millésime 80', 'Maury, Roussillon, France', null, 'Fortified'),  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
  ('Mas Amiel', 'Maury', 'Maury, Roussillon, France', null, 'Fortified'),  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
  ('Mas Amiel', 'Maury Vintage', 'Maury, Roussillon, France', null, 'Fortified'),  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
  ('Mas Amiel', 'Muscat de Rivesaltes', 'Muscat de Rivesaltes, Roussillon, France', null, 'Fortified'),  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
  ('Mas Amiel', 'Maury Sec Altitude 433M', 'Maury, Roussillon, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
  ('Mas Amiel', 'Maury Sec Vers le Nord', 'Maury, Roussillon, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
  ('Mas Amiel', 'Côtes du Roussillon Altaïr', 'Côtes du Roussillon, Roussillon, France', null, 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Mas-Amiel
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SIEUR D'ARQUES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Sieur d''Arques', 'Limoux Toques et Clochers Terroir Haute-Vallée', 'Limoux, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.sieurdarques.com/vins-toques-et-clochers-c102x4019722
  ('Sieur d''Arques', 'Limoux Toques et Clochers Terroir Autan', 'Limoux, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.sieurdarques.com/vins-toques-et-clochers-c102x4019722
  ('Sieur d''Arques', 'Limoux Toques et Clochers Terroir Marin', 'Limoux, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.sieurdarques.com/vins-toques-et-clochers-c102x4019722
  ('Sieur d''Arques', 'Limoux Toques et Clochers Terroir Océanique', 'Limoux, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.sieurdarques.com/vins-toques-et-clochers-c102x4019722
  ('Sieur d''Arques', 'Limoux Occursus Rouge', 'Limoux, Languedoc, France', null, 'Red'),  -- https://www.sieurdarques.com/vins-toques-et-clochers-c102x4019722
  ('Sieur d''Arques', 'Crémant de Limoux Toques et Clochers Édition Limitée Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/vins-toques-et-clochers-c102x4019722
  ('Sieur d''Arques', 'Crémant de Limoux Toques et Clochers Édition Limitée Extra-Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/vins-toques-et-clochers-c102x4019722
  ('Sieur d''Arques', 'Crémant de Limoux Blason Rouge Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/cremant-de-limoux-brut-et-extra-brut-c102x4019726
  ('Sieur d''Arques', 'Crémant de Limoux Blason Rouge Brut Rosé', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/cremant-de-limoux-brut-et-extra-brut-c102x4019726
  ('Sieur d''Arques', 'Crémant de Limoux Blason Rouge White Edition Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/cremant-de-limoux-brut-et-extra-brut-c102x4019726
  ('Sieur d''Arques', 'Crémant de Limoux Première Bulle Rosé Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/cremant-de-limoux-brut-et-extra-brut-c102x4019726
  ('Sieur d''Arques', 'Crémant de Limoux Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/cremant-de-limoux-brut-et-extra-brut-c102x4019726
  ('Sieur d''Arques', 'Crémant de Limoux Extra Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/cremant-de-limoux-brut-et-extra-brut-c102x4019726
  ('Sieur d''Arques', 'Blanquette de Limoux Première Bulle Brut', 'Blanquette de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/blanquette-de-limoux-brut-et-demi-sec-c102x4019710
  ('Sieur d''Arques', 'Blanquette de Limoux Première Bulle Bio Brut', 'Blanquette de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/blanquette-de-limoux-brut-et-demi-sec-c102x4019710
  ('Sieur d''Arques', 'Blanquette de Limoux Diaphane Grande Cuvée Brut', 'Blanquette de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/blanquette-de-limoux-brut-et-demi-sec-c102x4019710
  ('Sieur d''Arques', 'Blanquette de Limoux Diaphane Brut', 'Blanquette de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/blanquette-de-limoux-brut-et-demi-sec-c102x4019710
  ('Sieur d''Arques', 'Blanquette de Limoux Diaphane Demi-Sec', 'Blanquette de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://www.sieurdarques.com/blanquette-de-limoux-brut-et-demi-sec-c102x4019710
  ('Sieur d''Arques', 'Limoux Château de Flandry Blanc', 'Limoux, Languedoc, France', null, 'White'),  -- https://www.sieurdarques.com/vins-aoc-limoux-c102x4019721
  ('Sieur d''Arques', 'Limoux Les Bénédictins Blanc', 'Limoux, Languedoc, France', null, 'White'),  -- https://www.sieurdarques.com/vins-aoc-limoux-c102x4019721
  ('Sieur d''Arques', 'Limoux Les Bénédictins Rouge', 'Limoux, Languedoc, France', null, 'Red'),  -- https://www.sieurdarques.com/vins-aoc-limoux-c102x4019721
  ('Sieur d''Arques', 'Limoux Coeur sur la Main Rouge Bio', 'Limoux, Languedoc, France', null, 'Red'),  -- https://www.sieurdarques.com/vins-aoc-limoux-c102x4019721
  ('Sieur d''Arques', 'Pays d''Oc Roi de Mari Merlot', 'Pays d''Oc, Languedoc, France', 'Merlot', 'Red'),  -- https://www.sieurdarques.com/vins-de-pays-d-oc-c102x4019717
  ('Sieur d''Arques', 'Pays d''Oc Vendanges de Nuit Chardonnay', 'Pays d''Oc, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.sieurdarques.com/vins-de-pays-d-oc-c102x4019717
  ('Sieur d''Arques', 'Pays d''Oc Vendanges de Nuit Merlot', 'Pays d''Oc, Languedoc, France', 'Merlot', 'Red'),  -- https://www.sieurdarques.com/vins-de-pays-d-oc-c102x4019717
  ('Sieur d''Arques', 'Pays d''Oc L''Oracle Chardonnay', 'Pays d''Oc, Languedoc, France', 'Chardonnay', 'White'),  -- https://www.sieurdarques.com/vins-de-pays-d-oc-c102x4019717
  ('Sieur d''Arques', 'Pays d''Oc L''Oracle Sauvignon', 'Pays d''Oc, Languedoc, France', 'Sauvignon', 'White'),  -- https://www.sieurdarques.com/vins-de-pays-d-oc-c102x4019717
  ('Sieur d''Arques', 'Pays d''Oc L''Oracle Merlot', 'Pays d''Oc, Languedoc, France', 'Merlot', 'Red'),  -- https://www.sieurdarques.com/vins-de-pays-d-oc-c102x4019717
  ('Sieur d''Arques', 'Pays d''Oc L''Oracle Rosé Cinsault', 'Pays d''Oc, Languedoc, France', 'Cinsault', 'Rosé'),  -- https://www.sieurdarques.com/vins-de-pays-d-oc-c102x4019717
  ('Sieur d''Arques', 'Pays d''Oc La Cuvée du Soleil Rosé', 'Pays d''Oc, Languedoc, France', 'Pinot Noir, Cinsault, Grenache', 'Rosé'),  -- https://www.sieurdarques.com/vins-de-pays-d-oc-c102x4019717
  ('Sieur d''Arques', 'Blanquette de Limoux Méthode Ancestrale Le Propriétaire Doux', 'Blanquette de Limoux, Languedoc, France', 'Mauzac', 'Sparkling'),  -- https://www.sieurdarques.com/blanquette-de-limoux-methode-ancestrale-vins-petillants-naturels-c102x4019724
  ('Sieur d''Arques', 'Limoux Première Bulle Gourmande Doux Méthode Ancestrale', 'Limoux, Languedoc, France', 'Mauzac', 'Sparkling'),  -- https://www.sieurdarques.com/blanquette-de-limoux-methode-ancestrale-vins-petillants-naturels-c102x4019724
  ('Sieur d''Arques', 'Pays d''Oc Pure Velvet Rouge', 'Pays d''Oc, Languedoc, France', 'Marselan', 'Red'),  -- https://www.sieurdarques.com/pure-velvet-c102x4148969
  ('Sieur d''Arques', 'Pays d''Oc Pure Velvet Blanc', 'Pays d''Oc, Languedoc, France', 'Colombard, Gewurztraminer', 'White')  -- https://www.sieurdarques.com/pure-velvet-c102x4148969
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BORIE DE MAUREL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Domaine Borie de Maurel', 'Minervois Esprit d''Automne', 'Minervois, Languedoc, France', null, 'Red'),  -- https://www.boriedemaurel.fr/
  ('Domaine Borie de Maurel', 'Minervois La Livinière La Féline', 'Minervois La Livinière, Languedoc, France', null, 'Red'),  -- https://www.boriedemaurel.fr/
  ('Domaine Borie de Maurel', 'Minervois La Belle Aude Blanc', 'Minervois, Languedoc, France', null, 'White'),  -- https://www.boriedemaurel.fr/
  ('Domaine Borie de Maurel', 'Minervois Maxime', 'Minervois, Languedoc, France', 'Mourvèdre', 'Red'),  -- https://www.boriedemaurel.fr/
  ('Domaine Borie de Maurel', 'Minervois Sylla', 'Minervois, Languedoc, France', 'Syrah', 'Red'),  -- https://www.boriedemaurel.fr/
  ('Domaine Borie de Maurel', 'Minervois Belle de Nuit', 'Minervois, Languedoc, France', 'Grenache', 'Red')  -- https://www.boriedemaurel.fr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MARIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Château Maris', 'Damn Good Soil White', 'Languedoc, France', null, 'White'),  -- https://chateaumaris.com/collections/tailored-for-nature
  ('Château Maris', 'Damn Good Soil Red', 'Languedoc, France', null, 'Red'),  -- https://chateaumaris.com/collections/tailored-for-nature
  ('Château Maris', 'Rare Orange', 'Languedoc, France', 'Muscat Petit Grain', 'Orange'),  -- https://chateaumaris.com/collections/tailored-for-nature
  ('Château Maris', 'Blushing Nymph', 'Languedoc, France', null, 'Rosé'),  -- https://chateaumaris.com/collections/tailored-for-nature
  ('Château Maris', 'Au Grand Air', 'Languedoc, France', null, 'Red'),  -- https://chateaumaris.com/collections/tailored-for-nature
  ('Château Maris', 'La Touge', 'Minervois La Livinière, Languedoc, France', 'Syrah', 'Red'),  -- https://www.mswalker.com/nationalwine/chateau-maris/
  ('Château Maris', 'Les Planels', 'Languedoc, France', null, 'Red'),  -- https://www.mswalker.com/nationalwine/chateau-maris/
  ('Château Maris', 'Natural Selection', 'Languedoc, France', null, 'Red'),  -- https://www.mswalker.com/nationalwine/chateau-maris/
  ('Château Maris', 'Chardonnay', 'Languedoc, France', 'Chardonnay', 'White')  -- https://www.mswalker.com/nationalwine/chateau-maris/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CALMEL & JOSEPH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Calmel & Joseph', 'Corbières La Madone n°1', 'Corbières, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-gammes
  ('Calmel & Joseph', 'Corbières La Madone n°2', 'Corbières, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-gammes
  ('Calmel & Joseph', 'Corbières La Madone n°3', 'Corbières, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-gammes
  ('Calmel & Joseph', 'Val de Dagne La Magdeleine', 'Val de Dagne, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-gammes
  ('Calmel & Joseph', 'Val de Dagne La Marquise', 'Val de Dagne, Languedoc, France', 'Roussanne, Grenache Gris', 'White'),  -- https://boutique.calmel-joseph.com/26-nos-gammes
  ('Calmel & Joseph', 'Pays d''Oc Le Penchant', 'Pays d''Oc, Languedoc, France', 'Roussanne', 'White'),  -- https://boutique.calmel-joseph.com/26-nos-gammes
  ('Calmel & Joseph', 'Pays d''Oc Le Sentier', 'Pays d''Oc, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-gammes
  ('Calmel & Joseph', 'Corbières Le Roc', 'Corbières, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-gammes
  ('Calmel & Joseph', 'Pic Saint-Loup Le Pic', 'Pic Saint-Loup, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-gammes
  ('Calmel & Joseph', 'Collioure Les Elmes', 'Collioure, Roussillon, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Vin de France La Ruffe', 'Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'La Livinière La Planette', 'Minervois La Livinière, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Saint-Chinian Les Sept Puits', 'Saint-Chinian, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Côtes du Roussillon Villages Caramany La Folie Douce', 'Côtes du Roussillon Villages Caramany, Roussillon, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Terrasses du Larzac L''Art du Vers', 'Terrasses du Larzac, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Saint-Chinian Blanc Le Saint-Festin', 'Saint-Chinian, Languedoc, France', null, 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Clairette du Languedoc L''Astre Divin', 'Clairette du Languedoc, Languedoc, France', 'Clairette Blanche', 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Côtes du Brian La Fabrique', 'Côtes du Brian, Languedoc, France', 'Carignan', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Saint-Chinian Le Bric-à-Brac', 'Saint-Chinian, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Faugères Le Gaillard', 'Faugères, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Minervois Les Frères d''Armes', 'Minervois, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=2
  ('Calmel & Joseph', 'Corbières L''Aventure', 'Corbières, Languedoc, France', 'Syrah, Grenache Noir', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Côtes du Roussillon Villages Le Petit Miracle', 'Côtes du Roussillon Villages, Roussillon, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Blanquette de Limoux Brut', 'Blanquette de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Crémant de Limoux Brut', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Crémant de Limoux Rosé', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Crémant de Limoux Brut Nature', 'Crémant de Limoux, Languedoc, France', null, 'Sparkling'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Villa Blanche Chardonnay', 'Pays d''Oc, Languedoc, France', 'Chardonnay', 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Villa Blanche Picpoul de Pinet', 'Picpoul de Pinet, Languedoc, France', 'Picpoul', 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Villa Blanche Sauvignon Blanc', 'Pays d''Oc, Languedoc, France', 'Sauvignon Blanc', 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Villa Blanche Viognier', 'Pays d''Oc, Languedoc, France', 'Viognier', 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Villa Blanche Grenache Rosé', 'Pays d''Oc, Languedoc, France', 'Grenache', 'Rosé'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=3
  ('Calmel & Joseph', 'Villa Blanche Syrah', 'Pays d''Oc, Languedoc, France', 'Syrah', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Villa Blanche Merlot', 'Pays d''Oc, Languedoc, France', 'Merlot', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Villa Blanche Pinot Noir', 'Pays d''Oc, Languedoc, France', 'Pinot Noir', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Villa Blanche Malbec', 'Pays d''Oc, Languedoc, France', 'Malbec', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Villa Blanche Terret Blanc Côtes de Thau', 'Côtes de Thau, Languedoc, France', 'Terret Blanc', 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Villa Blanche Piquepoul Noir', 'Languedoc, France', 'Piquepoul Noir', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Villa Blanche Marselan', 'Pays d''Oc, Languedoc, France', 'Marselan', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Amstramgram Cérès Rosé', 'Languedoc, France', null, 'Rosé'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Amstramgram L''Épicurius', 'Pays d''Oc, Languedoc, France', 'Petit Verdot, Malbec', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Amstramgram Les Sacrés Rouge', 'Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Amstramgram Le Roi Cinsault Rouge', 'Languedoc, France', 'Cinsault', 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Amstramgram La Reine Carignan(ne) Blanc', 'Languedoc, France', 'Carignan Blanc', 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=4
  ('Calmel & Joseph', 'Amstramgram Les Sacrés Blanc', 'Languedoc, France', null, 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=5
  ('Calmel & Joseph', 'Amstramgram Quartier Libre', 'Pays d''Oc, Languedoc, France', null, 'White'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=5
  ('Calmel & Joseph', 'Amstramgram Pomone Vin Orange', 'Languedoc, France', null, 'Orange'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=5
  ('Calmel & Joseph', 'Corbières La Pointe', 'Corbières, Languedoc, France', null, 'Red'),  -- https://boutique.calmel-joseph.com/26-nos-vins?page=5
  ('Calmel & Joseph', 'Haute Vallée de l''Orb L''Or Bohème', 'Haute Vallée de l''Orb, Languedoc, France', null, 'White')  -- https://boutique.calmel-joseph.com/26-nos-vins?page=5
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LES VIGNERONS DE ROQUEBRUN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Les Vignerons de Roquebrun', 'Soleil de Schiste Rouge', 'Languedoc, France', 'Syrah, Grenache, Mourvèdre', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Prestige Rouge', 'Languedoc, France', 'Mourvèdre, Grenache, Syrah', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Lune de Schiste Rouge', 'Languedoc, France', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Zénith de Schiste Rouge', 'Languedoc, France', 'Syrah, Grenache Noir', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Les Fiefs d''Aupenac Rouge', 'Languedoc, France', 'Syrah, Mourvèdre, Grenache', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Roches Noires Rouge', 'Languedoc, France', 'Syrah, Grenache, Mourvèdre', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Seigneur d''Aupenac Rouge', 'Languedoc, France', null, 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Sir de Rocbrun Rouge', 'Languedoc, France', 'Syrah, Grenache Noir', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Absolu de Schiste Rouge', 'Languedoc, France', 'Syrah, Grenache Noir, Carignan', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Infini de Schiste Rouge', 'Languedoc, France', 'Syrah, Grenache Noir, Mourvèdre', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Baron d''Aupenac Rouge', 'Languedoc, France', 'Syrah, Carignan, Grenache', 'Red'),  -- https://boutique.cave-roquebrun.fr/11-nos-rouges
  ('Les Vignerons de Roquebrun', 'Lune de Schiste Blanc', 'Languedoc, France', 'Viognier, Rolle, Chardonnay', 'White'),  -- https://boutique.cave-roquebrun.fr/13-nos-blancs
  ('Les Vignerons de Roquebrun', 'Zénith de Schiste Blanc', 'Languedoc, France', 'Roussanne, Grenache Blanc', 'White'),  -- https://boutique.cave-roquebrun.fr/13-nos-blancs
  ('Les Vignerons de Roquebrun', 'Soleil de Schiste Blanc', 'Languedoc, France', 'Roussanne, Grenache Blanc', 'White'),  -- https://boutique.cave-roquebrun.fr/13-nos-blancs
  ('Les Vignerons de Roquebrun', 'Les Fiefs d''Aupenac Blanc', 'Languedoc, France', 'Roussanne, Grenache Blanc', 'White'),  -- https://boutique.cave-roquebrun.fr/13-nos-blancs
  ('Les Vignerons de Roquebrun', 'Lune de Schiste Rosé', 'Languedoc, France', 'Syrah, Grenache Noir, Cinsault', 'Rosé'),  -- https://boutique.cave-roquebrun.fr/12-nos-roses
  ('Les Vignerons de Roquebrun', 'Zénith de Schiste Rosé', 'Languedoc, France', 'Syrah, Grenache Noir', 'Rosé'),  -- https://boutique.cave-roquebrun.fr/12-nos-roses
  ('Les Vignerons de Roquebrun', 'Soleil de Schiste Rosé', 'Languedoc, France', 'Syrah, Grenache', 'Rosé')  -- https://boutique.cave-roquebrun.fr/12-nos-roses
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CANET-VALETTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Domaine Canet-Valette', 'Saint-Chinian Antonyme', 'Saint-Chinian, Languedoc, France', null, 'Red'),  -- https://www.canetvalette.com/les-vins/
  ('Domaine Canet-Valette', 'Saint-Chinian Ivresses', 'Saint-Chinian, Languedoc, France', null, 'Red'),  -- https://www.canetvalette.com/les-vins/
  ('Domaine Canet-Valette', 'Saint-Chinian Maghani', 'Saint-Chinian, Languedoc, France', null, 'Red'),  -- https://www.canetvalette.com/les-vins/
  ('Domaine Canet-Valette', 'Saint-Chinian MV?', 'Saint-Chinian, Languedoc, France', null, 'Red'),  -- https://www.canetvalette.com/les-vins/
  ('Domaine Canet-Valette', 'Saint-Chinian Une et Mille Nuits Rouge', 'Saint-Chinian, Languedoc, France', 'Grenache, Carignan, Syrah, Mourvèdre, Cinsault', 'Red'),  -- https://www.canetvalette.com/les-vins/
  ('Domaine Canet-Valette', 'Une et Mille Nuits Blanc', 'Languedoc, France', 'Piquepoul, Bourboulenc', 'White')  -- https://www.canetvalette.com/les-vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA BARONNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Château La Baronne', 'Nos Bulles Blanc de Noir', 'Languedoc, France', 'Mourvèdre, Carignan', 'Sparkling'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'Corbières Les Chemins Blanc', 'Corbières, Languedoc, France', 'Grenache, Vermentino, Roussanne', 'White'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'NW Le Rolle', 'Languedoc, France', 'Vermentino', 'White'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'Le Grenache Gris de Jean', 'Languedoc, France', 'Grenache Gris', 'Orange'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'Roussanne de Las Vals', 'Languedoc, France', 'Roussanne', 'Orange'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'Juste le Rouge', 'Languedoc, France', null, 'Red'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'Corbières Les Lanes', 'Corbières, Languedoc, France', 'Carignan, Grenache', 'Red'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'Cayrelières', 'Languedoc, France', 'Grenache', 'Red'),  -- https://chateaulabaronne.com/vins/cayrelieres/
  ('Château La Baronne', 'Corbières Les Chemins Rouge', 'Corbières, Languedoc, France', 'Carignan, Syrah, Grenache, Mourvèdre', 'Red'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'Les Chemins de Traverse', 'Languedoc, France', 'Cinsault', 'Red'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'Mourvèdre de Las Vals', 'Languedoc, France', 'Mourvèdre', 'Red'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'Corbières En Montant l''Alaric', 'Corbières, Languedoc, France', 'Syrah, Carignan, Grenache', 'Red'),  -- https://chateaulabaronne.com/vins/
  ('Château La Baronne', 'La Pièce de Roche', 'Languedoc, France', 'Carignan', 'Red')  -- https://chateaulabaronne.com/vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU OLLIEUX ROMANIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_languedoc.sql)'
from (values
  ('Château Ollieux Romanis', 'Corbières Alba Rosé', 'Corbières, Languedoc, France', null, 'Rosé'),  -- https://boutique.artisans-partisans.com/product-category/tous/chateau-ollieux-romanis/
  ('Château Ollieux Romanis', 'Corbières Alba Rouge', 'Corbières, Languedoc, France', null, 'Red'),  -- https://boutique.artisans-partisans.com/product-category/tous/chateau-ollieux-romanis/
  ('Château Ollieux Romanis', 'Corbières Prestige Blanc', 'Corbières, Languedoc, France', null, 'White'),  -- https://boutique.artisans-partisans.com/product-category/tous/chateau-ollieux-romanis/
  ('Château Ollieux Romanis', 'Corbières Racine Blanc', 'Corbières, Languedoc, France', null, 'White'),  -- https://boutique.artisans-partisans.com/product-category/tous/chateau-ollieux-romanis/
  ('Château Ollieux Romanis', 'Corbières Racine Rosé', 'Corbières, Languedoc, France', null, 'Rosé'),  -- https://boutique.artisans-partisans.com/product-category/tous/chateau-ollieux-romanis/
  ('Château Ollieux Romanis', 'Corbières Racine Rouge', 'Corbières, Languedoc, France', null, 'Red'),  -- https://boutique.artisans-partisans.com/product-category/tous/chateau-ollieux-romanis/
  ('Château Ollieux Romanis', 'Corbières Nuit Céleste', 'Corbières, Languedoc, France', null, 'White'),  -- https://boutique.artisans-partisans.com/product/nuit-celeste/
  ('Château Ollieux Romanis', 'Corbières Boutenac Cuvée Or', 'Corbières Boutenac, Languedoc, France', null, 'Red'),  -- https://boutique.artisans-partisans.com/product/cuvee-or/
  ('Château Ollieux Romanis', 'Corbières Boutenac Souffle de Lune', 'Corbières Boutenac, Languedoc, France', null, 'Red'),  -- https://boutique.artisans-partisans.com/product/souffle-de-lune/
  ('Château Ollieux Romanis', 'Corbières Boutenac Atal Sia', 'Corbières Boutenac, Languedoc, France', null, 'Red')  -- https://boutique.artisans-partisans.com/product/atal-sia-2023/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
