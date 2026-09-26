-- ============================================================================
-- wines_catalog seed — Lebanon + Greece
-- ============================================================================
-- Run in the Supabase SQL editor (writes go via the service role; there is no
-- insert RLS policy). Safe to re-run: search_key is auto-normalised by the
-- trg_wines_catalog_search_key trigger and ON CONFLICT (search_key) DO NOTHING
-- absorbs anything already present. `display` is computed here (producer + cuvée).
--
-- Real, well-documented producers and flagship cuvées only — no invented
-- bottlings (the whole point of the catalog is to avoid hallucinated wines).
-- Style ∈ Red / White / Rosé / Sparkling / Fortified. wine_name NULL where the
-- wine is sold under the producer name.
-- ============================================================================

-- ---- LEBANON ---------------------------------------------------------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Château Musar', 'Red', 'Bekaa Valley', 'Cabernet Sauvignon/Cinsault/Carignan', 'Red'),
  ('Château Musar', 'White', 'Bekaa Valley', 'Obaideh/Merwah', 'White'),
  ('Château Musar', 'Rosé', 'Bekaa Valley', 'Cinsault/Mourvèdre', 'Rosé'),
  ('Château Musar', 'Hochar Père et Fils', 'Bekaa Valley', 'Cinsault/Grenache/Cabernet Sauvignon', 'Red'),
  ('Château Musar', 'Musar Jeune Red', 'Bekaa Valley', 'Cinsault/Syrah/Cabernet Sauvignon', 'Red'),
  ('Château Musar', 'Musar Jeune White', 'Bekaa Valley', 'Viognier/Vermentino/Chardonnay', 'White'),
  ('Château Musar', 'Musar Jeune Rosé', 'Bekaa Valley', 'Cinsault/Syrah', 'Rosé'),
  ('Massaya', 'Classic Red', 'Bekaa Valley', 'Cinsault/Grenache/Cabernet Sauvignon', 'Red'),
  ('Massaya', 'Classic White', 'Bekaa Valley', 'Clairette/Sauvignon Blanc/Chardonnay', 'White'),
  ('Massaya', 'Classic Rosé', 'Bekaa Valley', 'Cinsault/Grenache/Tempranillo', 'Rosé'),
  ('Massaya', 'Terrasses de Baalbeck', 'Bekaa Valley', 'Grenache/Mourvèdre/Cabernet Sauvignon', 'Red'),
  ('Massaya', 'Le Colombier', 'Bekaa Valley', 'Cinsault/Syrah/Grenache/Mourvèdre', 'Red'),
  ('Massaya', 'Gold Reserve', 'Bekaa Valley', 'Grenache/Mourvèdre/Cabernet Sauvignon', 'Red'),
  ('Château Kefraya', 'Les Bretèches', 'Bekaa Valley', 'Cinsault/Syrah/Cabernet Sauvignon', 'Red'),
  ('Château Kefraya', 'Comte de M', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah/Mourvèdre', 'Red'),
  ('Château Kefraya', 'Rouge', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah/Carignan', 'Red'),
  ('Château Kefraya', 'Blanc de Blancs', 'Bekaa Valley', 'Bourboulenc/Clairette/Muscat', 'White'),
  ('Château Kefraya', 'Myst de Kefraya', 'Bekaa Valley', 'Cinsault/Syrah', 'Rosé'),
  ('Château Ksara', 'Réserve du Couvent', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah/Cabernet Franc', 'Red'),
  ('Château Ksara', 'Le Souverain', 'Bekaa Valley', 'Arinarnoa/Cabernet Sauvignon', 'Red'),
  ('Château Ksara', 'Cuvée du Troisième Millénaire', 'Bekaa Valley', 'Petit Verdot/Cabernet Sauvignon/Syrah', 'Red'),
  ('Château Ksara', 'Château Ksara Rouge', 'Bekaa Valley', 'Cabernet Sauvignon/Merlot/Petit Verdot', 'Red'),
  ('Château Ksara', 'Blanc de Blancs', 'Bekaa Valley', 'Sauvignon Blanc/Sémillon/Chardonnay', 'White'),
  ('Château Ksara', 'Merwah', 'Bekaa Valley', 'Merwah', 'White'),
  ('Château Ksara', 'Sunset Rosé', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah', 'Rosé'),
  ('Domaine des Tourelles', 'Marquis des Beys', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah', 'Red'),
  ('Domaine des Tourelles', 'Vieilles Vignes Cinsault', 'Bekaa Valley', 'Cinsault', 'Red'),
  ('Domaine des Tourelles', 'Syrah', 'Bekaa Valley', 'Syrah', 'Red'),
  ('Domaine des Tourelles', 'Red', 'Bekaa Valley', 'Cinsault/Syrah/Cabernet Sauvignon/Carignan', 'Red'),
  ('Domaine des Tourelles', 'White', 'Bekaa Valley', 'Viognier/Muscat/Chardonnay', 'White'),
  ('Ixsir', 'Grande Réserve Red', 'Batroun', 'Syrah/Cabernet Sauvignon/Caladoc', 'Red'),
  ('Ixsir', 'Grande Réserve White', 'Batroun', 'Viognier/Chardonnay/Muscat', 'White'),
  ('Ixsir', 'Altitudes Red', 'Lebanon', 'Syrah/Cabernet Sauvignon/Tempranillo', 'Red'),
  ('Ixsir', 'Altitudes White', 'Lebanon', 'Viognier/Muscat/Obeideh', 'White'),
  ('Ixsir', 'Altitudes Rosé', 'Lebanon', 'Syrah/Tempranillo/Cinsault', 'Rosé'),
  ('Ixsir', 'El Red', 'Batroun', 'Syrah/Cabernet Sauvignon', 'Red'),
  ('Château Marsyas', 'Red', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah/Merlot', 'Red'),
  ('Château Marsyas', 'White', 'Bekaa Valley', 'Sauvignon Blanc/Chardonnay', 'White'),
  ('Château Marsyas', 'B-Qa de Marsyas Red', 'Bekaa Valley', 'Syrah/Cabernet Sauvignon/Grenache', 'Red'),
  ('Château St Thomas', 'Les Gourmets', 'Bekaa Valley', 'Cinsault/Cabernet Sauvignon', 'Red'),
  ('Château St Thomas', 'Château St Thomas Red', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah/Merlot', 'Red'),
  ('Château St Thomas', 'Obeideh', 'Bekaa Valley', 'Obeideh', 'White'),
  ('Domaine Wardy', 'Les Terroirs Red', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah', 'Red'),
  ('Domaine Wardy', 'Private Selection', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah/Merlot', 'Red'),
  ('Domaine Wardy', 'Clos Blanc', 'Bekaa Valley', 'Obeideh/Sauvignon Blanc', 'White'),
  ('Château Belle-Vue', 'La Renaissance', 'Bhamdoun', 'Cabernet Sauvignon/Syrah/Merlot', 'Red'),
  ('Château Belle-Vue', 'Le Château', 'Bhamdoun', 'Cabernet Sauvignon/Merlot/Syrah', 'Red'),
  ('Karam Winery', 'Arc-en-Ciel', 'Jezzine', 'Cabernet Sauvignon/Syrah', 'Red'),
  ('Karam Winery', 'Corpus Christi', 'Jezzine', 'Cabernet Sauvignon', 'Red'),
  ('Château Khoury', 'Symphonie', 'Bekaa Valley', 'Cabernet Sauvignon/Cabernet Franc/Merlot', 'Red'),
  ('Château Qanafar', 'Red', 'West Bekaa', 'Cabernet Sauvignon/Syrah/Merlot', 'Red'),
  ('Sept Winery', 'Blanc', 'Batroun', 'Obeideh/Merwah', 'White'),
  ('Mersel Wine', 'Lebnani Red', 'Mount Lebanon', 'Cinsault/Merwah', 'Red'),
  ('Coteaux du Liban', 'Réserve', 'Bekaa Valley', 'Cabernet Sauvignon/Syrah', 'Red'),
  ('Château Nakad', 'Red', 'Bekaa Valley', 'Cinsault/Cabernet Sauvignon', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- GREECE ----------------------------------------------------------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  -- Santorini & islands
  ('Domaine Sigalas', 'Santorini Assyrtiko', 'Santorini', 'Assyrtiko', 'White'),
  ('Domaine Sigalas', 'Kavalieros', 'Santorini', 'Assyrtiko', 'White'),
  ('Domaine Sigalas', 'Nykteri', 'Santorini', 'Assyrtiko', 'White'),
  ('Domaine Sigalas', 'Vinsanto', 'Santorini', 'Assyrtiko/Aidani', 'White'),
  ('Estate Argyros', 'Santorini Assyrtiko', 'Santorini', 'Assyrtiko', 'White'),
  ('Estate Argyros', 'Cuvée Monsignori', 'Santorini', 'Assyrtiko', 'White'),
  ('Estate Argyros', 'Estate Assyrtiko', 'Santorini', 'Assyrtiko', 'White'),
  ('Estate Argyros', 'Vinsanto', 'Santorini', 'Assyrtiko/Aidani/Athiri', 'White'),
  ('Gaia Wines', 'Thalassitis', 'Santorini', 'Assyrtiko', 'White'),
  ('Gaia Wines', 'Wild Ferment Assyrtiko', 'Santorini', 'Assyrtiko', 'White'),
  ('Gaia Wines', 'Assyrtiko by Gaia', 'Santorini', 'Assyrtiko', 'White'),
  ('Gaia Wines', 'Gaia S', 'Nemea', 'Agiorgitiko/Syrah', 'Red'),
  ('Gaia Wines', 'Nemea Agiorgitiko', 'Nemea', 'Agiorgitiko', 'Red'),
  ('Domaine Hatzidakis', 'Santorini Assyrtiko', 'Santorini', 'Assyrtiko', 'White'),
  ('Domaine Hatzidakis', 'Nykteri', 'Santorini', 'Assyrtiko', 'White'),
  ('Domaine Hatzidakis', 'Aidani', 'Santorini', 'Aidani', 'White'),
  ('Artemis Karamolegos', 'Santorini Assyrtiko', 'Santorini', 'Assyrtiko', 'White'),
  ('Artemis Karamolegos', '34 Terroirs', 'Santorini', 'Assyrtiko', 'White'),
  ('Artemis Karamolegos', 'Pyritis', 'Santorini', 'Assyrtiko', 'White'),
  ('Vassaltis', 'Santorini Assyrtiko', 'Santorini', 'Assyrtiko', 'White'),
  ('Venetsanos', 'Santorini Assyrtiko', 'Santorini', 'Assyrtiko', 'White'),
  ('Santo Wines', 'Santorini Assyrtiko', 'Santorini', 'Assyrtiko', 'White'),
  ('Santo Wines', 'Nykteri', 'Santorini', 'Assyrtiko', 'White'),
  ('Santo Wines', 'Vinsanto', 'Santorini', 'Assyrtiko/Aidani', 'White'),
  ('T-Oinos', 'Clos Stegasta Assyrtiko', 'Tinos', 'Assyrtiko', 'White'),
  ('T-Oinos', 'Clos Stegasta Mavrotragano', 'Tinos', 'Mavrotragano', 'Red'),
  ('Sclavos', 'Robola', 'Cephalonia', 'Robola', 'White'),
  ('Gentilini', 'Robola', 'Cephalonia', 'Robola', 'White'),
  -- Northern Greece (Naoussa, Amyndeon, Drama, Epanomi)
  ('Kir-Yianni', 'Ramnista', 'Naoussa', 'Xinomavro', 'Red'),
  ('Kir-Yianni', 'Diaporos', 'Naoussa', 'Xinomavro/Syrah', 'Red'),
  ('Kir-Yianni', 'Akakies', 'Amyndeon', 'Xinomavro', 'Rosé'),
  ('Kir-Yianni', 'Paranga Red', 'Macedonia', 'Xinomavro/Merlot/Syrah', 'Red'),
  ('Kir-Yianni', 'Samaropetra', 'Florina', 'Sauvignon Blanc/Roditis', 'White'),
  ('Alpha Estate', 'Xinomavro Reserve Old Vines', 'Amyndeon', 'Xinomavro', 'Red'),
  ('Alpha Estate', 'Estate Red', 'Amyndeon', 'Syrah/Merlot/Xinomavro', 'Red'),
  ('Alpha Estate', 'Sauvignon Blanc', 'Amyndeon', 'Sauvignon Blanc', 'White'),
  ('Alpha Estate', 'Malagousia', 'Amyndeon', 'Malagousia', 'White'),
  ('Thymiopoulos', 'Uranos', 'Naoussa', 'Xinomavro', 'Red'),
  ('Thymiopoulos', 'Earth and Sky', 'Naoussa', 'Xinomavro', 'Red'),
  ('Thymiopoulos', 'Young Vines Xinomavro', 'Naoussa', 'Xinomavro', 'Red'),
  ('Domaine Karydas', 'Naoussa', 'Naoussa', 'Xinomavro', 'Red'),
  ('Dalamara', 'Paliokalias', 'Naoussa', 'Xinomavro', 'Red'),
  ('Boutari', 'Naoussa Grande Réserve', 'Naoussa', 'Xinomavro', 'Red'),
  ('Boutari', 'Santorini', 'Santorini', 'Assyrtiko', 'White'),
  ('Boutari', 'Moschofilero', 'Mantinia', 'Moschofilero', 'White'),
  ('Tsantali', 'Rapsani Reserve', 'Rapsani', 'Xinomavro/Krassato/Stavroto', 'Red'),
  ('Tsantali', 'Kanenas', 'Mount Athos', 'Limnio/Cabernet Sauvignon', 'Red'),
  ('Domaine Gerovassiliou', 'Malagousia', 'Epanomi', 'Malagousia', 'White'),
  ('Domaine Gerovassiliou', 'Estate White', 'Epanomi', 'Malagousia/Assyrtiko', 'White'),
  ('Domaine Gerovassiliou', 'Avaton', 'Epanomi', 'Limnio/Mavroudi/Mavrotragano', 'Red'),
  ('Domaine Gerovassiliou', 'Evangelo', 'Epanomi', 'Syrah/Viognier', 'Red'),
  ('Ktima Biblia Chora', 'White', 'Pangeon', 'Sauvignon Blanc/Assyrtiko', 'White'),
  ('Ktima Biblia Chora', 'Ovilos White', 'Pangeon', 'Assyrtiko/Sémillon', 'White'),
  ('Ktima Biblia Chora', 'Ovilos Red', 'Pangeon', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('Ktima Pavlidis', 'Thema White', 'Drama', 'Assyrtiko/Sauvignon Blanc', 'White'),
  ('Ktima Pavlidis', 'Thema Red', 'Drama', 'Agiorgitiko/Syrah', 'Red'),
  ('Ktima Pavlidis', 'Emphasis Tempranillo', 'Drama', 'Tempranillo', 'Red'),
  ('Wine Art Estate', 'Techni Alipias Red', 'Drama', 'Syrah/Agiorgitiko', 'Red'),
  ('Wine Art Estate', 'Idisma Drios', 'Drama', 'Assyrtiko', 'White'),
  ('Domaine Costa Lazaridi', 'Amethystos Red', 'Drama', 'Cabernet Sauvignon/Merlot/Agiorgitiko', 'Red'),
  ('Domaine Costa Lazaridi', 'Amethystos White', 'Drama', 'Sauvignon Blanc/Assyrtiko', 'White'),
  ('Domaine Costa Lazaridi', 'Amethystos Fumé', 'Drama', 'Sauvignon Blanc', 'White'),
  -- Peloponnese
  ('Domaine Skouras', 'Megas Oenos', 'Peloponnese', 'Agiorgitiko/Cabernet Sauvignon', 'Red'),
  ('Domaine Skouras', 'Saint George', 'Nemea', 'Agiorgitiko', 'Red'),
  ('Domaine Skouras', 'Moscofilero', 'Mantinia', 'Moschofilero', 'White'),
  ('Domaine Tselepos', 'Mantinia Moschofilero', 'Mantinia', 'Moschofilero', 'White'),
  ('Domaine Tselepos', 'Kokkinomylos', 'Peloponnese', 'Merlot', 'Red'),
  ('Domaine Tselepos', 'Avlotopi Cabernet Sauvignon', 'Peloponnese', 'Cabernet Sauvignon', 'Red'),
  ('Semeli Estate', 'Nemea Reserve', 'Nemea', 'Agiorgitiko', 'Red'),
  ('Papaioannou', 'Nemea Agiorgitiko', 'Nemea', 'Agiorgitiko', 'Red'),
  ('Papaioannou', 'Palaia Klimata Old Vines', 'Nemea', 'Agiorgitiko', 'Red'),
  ('Mercouri Estate', 'Domaine Mercouri', 'Ilia', 'Refosco/Mavrodaphne', 'Red'),
  ('Parparoussis', 'Mavrodaphne of Patras', 'Patras', 'Mavrodaphne', 'Fortified'),
  ('Achaia Clauss', 'Mavrodaphne of Patras', 'Patras', 'Mavrodaphne', 'Fortified'),
  -- Crete
  ('Lyrarakis', 'Dafni', 'Crete', 'Dafni', 'White'),
  ('Lyrarakis', 'Plyto', 'Crete', 'Plyto', 'White'),
  ('Lyrarakis', 'Assyrtiko', 'Crete', 'Assyrtiko', 'White'),
  ('Douloufakis', 'Dafnios Red', 'Crete', 'Liatiko', 'Red'),
  ('Douloufakis', 'Vidiano', 'Crete', 'Vidiano', 'White'),
  ('Economou', 'Liatiko', 'Crete', 'Liatiko', 'Red'),
  ('Manousakis', 'Nostos', 'Crete', 'Syrah/Grenache/Mourvèdre', 'Red'),
  -- Central Greece / Epirus / Thessaly
  ('Katogi Averoff', 'Rossiu di Munte', 'Metsovo', 'Xinomavro', 'Red'),
  ('Zafeirakis', 'Limniona', 'Tyrnavos', 'Limniona', 'Red'),
  ('Zafeirakis', 'Malagousia', 'Tyrnavos', 'Malagousia', 'White'),
  ('Domaine Porto Carras', 'Château Porto Carras', 'Halkidiki', 'Cabernet Sauvignon/Limnio/Merlot', 'Red'),
  ('Domaine Porto Carras', 'Melissanthi', 'Halkidiki', 'Assyrtiko/Athiri', 'White'),
  ('Muses Estate', 'Estate Red', 'Boeotia', 'Agiorgitiko/Cabernet Sauvignon', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- Row counts added (for a sanity check after running):
--   select count(*) from public.wines_catalog where region in
--     ('Bekaa Valley','Batroun','Jezzine','West Bekaa','Mount Lebanon','Bhamdoun');
--   select count(*) from public.wines_catalog where region in
--     ('Santorini','Naoussa','Amyndeon','Nemea','Mantinia','Drama','Crete','Epanomi');
