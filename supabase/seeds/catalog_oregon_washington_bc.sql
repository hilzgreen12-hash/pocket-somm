-- ============================================================================
-- wines_catalog seed — Oregon + Washington + British Columbia
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent: search_key auto-normalises via the
-- trigger and ON CONFLICT (search_key) DO NOTHING absorbs existing rows.
-- Real producers + flagship/well-documented cuvées only. Style ∈ Red / White /
-- Rosé / Sparkling / Fortified. wine_name NULL where sold under the producer name.
-- ============================================================================

-- ---- OREGON (mostly Willamette Valley) --------------------------------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Domaine Serene', 'Evenstad Reserve Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Domaine Serene', 'Yamhill Cuvée Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Domaine Serene', 'Evenstad Reserve Chardonnay', 'Willamette Valley', 'Chardonnay', 'White'),
  ('Domaine Drouhin Oregon', 'Laurène', 'Dundee Hills', 'Pinot Noir', 'Red'),
  ('Domaine Drouhin Oregon', 'Dundee Hills Pinot Noir', 'Dundee Hills', 'Pinot Noir', 'Red'),
  ('Domaine Drouhin Oregon', 'Arthur Chardonnay', 'Dundee Hills', 'Chardonnay', 'White'),
  ('Domaine Drouhin Oregon', 'Roserock Pinot Noir', 'Eola-Amity Hills', 'Pinot Noir', 'Red'),
  ('Beaux Frères', 'The Beaux Frères Vineyard Pinot Noir', 'Ribbon Ridge', 'Pinot Noir', 'Red'),
  ('Beaux Frères', 'Willamette Valley Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Beaux Frères', 'The Upper Terrace Pinot Noir', 'Ribbon Ridge', 'Pinot Noir', 'Red'),
  ('Bergström', 'Cumberland Reserve Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Bergström', 'Sigrid Chardonnay', 'Willamette Valley', 'Chardonnay', 'White'),
  ('Bergström', 'Old Stones Chardonnay', 'Willamette Valley', 'Chardonnay', 'White'),
  ('Cristom', 'Mt Jefferson Cuvée Pinot Noir', 'Eola-Amity Hills', 'Pinot Noir', 'Red'),
  ('Cristom', 'Marjorie Vineyard Pinot Noir', 'Eola-Amity Hills', 'Pinot Noir', 'Red'),
  ('Cristom', 'Jessie Vineyard Pinot Noir', 'Eola-Amity Hills', 'Pinot Noir', 'Red'),
  ('Cristom', 'Louise Vineyard Pinot Noir', 'Eola-Amity Hills', 'Pinot Noir', 'Red'),
  ('Ken Wright Cellars', 'Shea Vineyard Pinot Noir', 'Yamhill-Carlton', 'Pinot Noir', 'Red'),
  ('Ken Wright Cellars', 'Carter Vineyard Pinot Noir', 'Yamhill-Carlton', 'Pinot Noir', 'Red'),
  ('Ken Wright Cellars', 'Abbott Claim Vineyard Pinot Noir', 'Yamhill-Carlton', 'Pinot Noir', 'Red'),
  ('The Eyrie Vineyards', 'Original Vines Pinot Noir', 'Dundee Hills', 'Pinot Noir', 'Red'),
  ('The Eyrie Vineyards', 'Pinot Gris', 'Dundee Hills', 'Pinot Gris', 'White'),
  ('Adelsheim', 'Willamette Valley Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Adelsheim', 'Breaking Ground Pinot Noir', 'Chehalem Mountains', 'Pinot Noir', 'Red'),
  ('Archery Summit', 'Arcus Estate Pinot Noir', 'Dundee Hills', 'Pinot Noir', 'Red'),
  ('Archery Summit', 'Premier Cuvée Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Ponzi Vineyards', 'Reserve Pinot Noir', 'Laurelwood District', 'Pinot Noir', 'Red'),
  ('Ponzi Vineyards', 'Tavola Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Elk Cove Vineyards', 'Willamette Valley Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Elk Cove Vineyards', 'La Bohème Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Elk Cove Vineyards', 'Pinot Gris', 'Willamette Valley', 'Pinot Gris', 'White'),
  ('Evening Land Vineyards', 'Seven Springs La Source Pinot Noir', 'Eola-Amity Hills', 'Pinot Noir', 'Red'),
  ('Evening Land Vineyards', 'Seven Springs Chardonnay', 'Eola-Amity Hills', 'Chardonnay', 'White'),
  ('Antica Terra', 'Botanica Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Antica Terra', 'Ceras Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Walter Scott', 'Cuvée Anne Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Walter Scott', 'La Combe Verte Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Lingua Franca', 'Avni Pinot Noir', 'Eola-Amity Hills', 'Pinot Noir', 'Red'),
  ('Lingua Franca', 'Estate Pinot Noir', 'Eola-Amity Hills', 'Pinot Noir', 'Red'),
  ('Soter Vineyards', 'Mineral Springs Ranch Pinot Noir', 'Yamhill-Carlton', 'Pinot Noir', 'Red'),
  ('Soter Vineyards', 'Brut Rosé', 'Willamette Valley', 'Pinot Noir/Chardonnay', 'Sparkling'),
  ('Patricia Green Cellars', 'Reserve Pinot Noir', 'Ribbon Ridge', 'Pinot Noir', 'Red'),
  ('Brick House', 'Les Dijonnais Pinot Noir', 'Ribbon Ridge', 'Pinot Noir', 'Red'),
  ('Chehalem', 'Three Vineyard Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Chehalem', 'INOX Chardonnay', 'Willamette Valley', 'Chardonnay', 'White'),
  ('Big Table Farm', 'Pinot Noir', 'Willamette Valley', 'Pinot Noir', 'Red'),
  ('Big Table Farm', 'Chardonnay', 'Willamette Valley', 'Chardonnay', 'White')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- WASHINGTON (Columbia Valley, Walla Walla, Red Mountain, HHH) -----------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Quilceda Creek', 'Cabernet Sauvignon', 'Columbia Valley', 'Cabernet Sauvignon', 'Red'),
  ('Quilceda Creek', 'CVR Red', 'Columbia Valley', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('Quilceda Creek', 'Palengat', 'Columbia Valley', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('Leonetti Cellar', 'Cabernet Sauvignon', 'Walla Walla Valley', 'Cabernet Sauvignon', 'Red'),
  ('Leonetti Cellar', 'Merlot', 'Walla Walla Valley', 'Merlot', 'Red'),
  ('Leonetti Cellar', 'Reserve', 'Walla Walla Valley', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('Woodward Canyon', 'Artist Series Cabernet Sauvignon', 'Columbia Valley', 'Cabernet Sauvignon', 'Red'),
  ('Woodward Canyon', 'Old Vines Cabernet Sauvignon', 'Walla Walla Valley', 'Cabernet Sauvignon', 'Red'),
  ('L''Ecole No 41', 'Ferguson', 'Walla Walla Valley', 'Cabernet Sauvignon/Merlot/Malbec', 'Red'),
  ('L''Ecole No 41', 'Estate Cabernet Sauvignon', 'Walla Walla Valley', 'Cabernet Sauvignon', 'Red'),
  ('L''Ecole No 41', 'Chenin Blanc', 'Columbia Valley', 'Chenin Blanc', 'White'),
  ('Cayuse Vineyards', 'Bionic Frog Syrah', 'Walla Walla Valley', 'Syrah', 'Red'),
  ('Cayuse Vineyards', 'Cailloux Vineyard Syrah', 'Walla Walla Valley', 'Syrah', 'Red'),
  ('Cayuse Vineyards', 'En Cerise Vineyard Syrah', 'Walla Walla Valley', 'Syrah', 'Red'),
  ('Cayuse Vineyards', 'God Only Knows Grenache', 'Walla Walla Valley', 'Grenache', 'Red'),
  ('Gramercy Cellars', 'Lower East Syrah', 'Columbia Valley', 'Syrah', 'Red'),
  ('Gramercy Cellars', 'Cabernet Sauvignon', 'Columbia Valley', 'Cabernet Sauvignon', 'Red'),
  ('Andrew Will', 'Sorella', 'Red Mountain', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('Andrew Will', 'Champoux Vineyard', 'Horse Heaven Hills', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('K Vintners', 'Royal City Syrah', 'Columbia Valley', 'Syrah', 'Red'),
  ('K Vintners', 'The Beautiful Syrah', 'Walla Walla Valley', 'Syrah', 'Red'),
  ('Charles Smith', 'Kung Fu Girl Riesling', 'Columbia Valley', 'Riesling', 'White'),
  ('Betz Family Winery', 'Père de Famille Cabernet Sauvignon', 'Columbia Valley', 'Cabernet Sauvignon', 'Red'),
  ('Betz Family Winery', 'La Serenne Syrah', 'Yakima Valley', 'Syrah', 'Red'),
  ('Betz Family Winery', 'Clos de Betz', 'Columbia Valley', 'Merlot/Cabernet Sauvignon', 'Red'),
  ('DeLille Cellars', 'D2', 'Columbia Valley', 'Merlot/Cabernet Sauvignon/Cabernet Franc', 'Red'),
  ('DeLille Cellars', 'Chaleur Estate Red', 'Red Mountain', 'Cabernet Sauvignon/Merlot', 'Red'),
  ('DeLille Cellars', 'Grand Ciel Cabernet Sauvignon', 'Red Mountain', 'Cabernet Sauvignon', 'Red'),
  ('Col Solare', 'Red Mountain', 'Red Mountain', 'Cabernet Sauvignon/Merlot/Syrah', 'Red'),
  ('Chateau Ste Michelle', 'Cold Creek Cabernet Sauvignon', 'Columbia Valley', 'Cabernet Sauvignon', 'Red'),
  ('Chateau Ste Michelle', 'Eroica Riesling', 'Columbia Valley', 'Riesling', 'White'),
  ('Chateau Ste Michelle', 'Indian Wells Cabernet Sauvignon', 'Columbia Valley', 'Cabernet Sauvignon', 'Red'),
  ('Owen Roe', 'Ex Umbris Syrah', 'Columbia Valley', 'Syrah', 'Red'),
  ('Owen Roe', 'Sinister Hand', 'Columbia Valley', 'Grenache/Syrah/Mourvèdre', 'Red'),
  ('Reynvaan Family Vineyards', 'In the Rocks Syrah', 'Walla Walla Valley', 'Syrah', 'Red'),
  ('Reynvaan Family Vineyards', 'Stonessence Syrah', 'Walla Walla Valley', 'Syrah', 'Red'),
  ('Force Majeure', 'Estate Red', 'Red Mountain', 'Cabernet Sauvignon/Syrah', 'Red'),
  ('Long Shadows', 'Feather Cabernet Sauvignon', 'Columbia Valley', 'Cabernet Sauvignon', 'Red'),
  ('Long Shadows', 'Sequel Syrah', 'Columbia Valley', 'Syrah', 'Red'),
  ('Long Shadows', 'Poet''s Leap Riesling', 'Columbia Valley', 'Riesling', 'White'),
  ('Long Shadows', 'Pedestal Merlot', 'Columbia Valley', 'Merlot', 'Red'),
  ('Doubleback', 'Cabernet Sauvignon', 'Walla Walla Valley', 'Cabernet Sauvignon', 'Red'),
  ('Pepper Bridge', 'Cabernet Sauvignon', 'Walla Walla Valley', 'Cabernet Sauvignon', 'Red'),
  ('Mark Ryan', 'Dead Horse', 'Red Mountain', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('Figgins', 'Estate Red', 'Walla Walla Valley', 'Cabernet Sauvignon/Merlot/Petit Verdot', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- BRITISH COLUMBIA (mostly Okanagan Valley) -----------------------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Mission Hill Family Estate', 'Oculus', 'Okanagan Valley', 'Merlot/Cabernet Sauvignon/Cabernet Franc', 'Red'),
  ('Mission Hill Family Estate', 'Quatrain', 'Okanagan Valley', 'Merlot/Syrah/Cabernet Sauvignon', 'Red'),
  ('Mission Hill Family Estate', 'Perpetua Chardonnay', 'Okanagan Valley', 'Chardonnay', 'White'),
  ('Osoyoos Larose', 'Le Grand Vin', 'Okanagan Valley', 'Merlot/Cabernet Sauvignon/Cabernet Franc', 'Red'),
  ('Osoyoos Larose', 'Pétales d''Osoyoos', 'Okanagan Valley', 'Merlot/Cabernet Sauvignon', 'Red'),
  ('Burrowing Owl', 'Cabernet Sauvignon', 'Okanagan Valley', 'Cabernet Sauvignon', 'Red'),
  ('Burrowing Owl', 'Syrah', 'Okanagan Valley', 'Syrah', 'Red'),
  ('Burrowing Owl', 'Meritage', 'Okanagan Valley', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('CedarCreek Estate Winery', 'Platinum Block Pinot Noir', 'Okanagan Valley', 'Pinot Noir', 'Red'),
  ('Quails'' Gate', 'Stewart Family Reserve Pinot Noir', 'Okanagan Valley', 'Pinot Noir', 'Red'),
  ('Quails'' Gate', 'Chardonnay', 'Okanagan Valley', 'Chardonnay', 'White'),
  ('Tantalus Vineyards', 'Old Vines Riesling', 'Okanagan Valley', 'Riesling', 'White'),
  ('Tantalus Vineyards', 'Riesling', 'Okanagan Valley', 'Riesling', 'White'),
  ('Painted Rock Estate Winery', 'Red Icon', 'Okanagan Valley', 'Merlot/Cabernet Franc/Malbec', 'Red'),
  ('Painted Rock Estate Winery', 'Syrah', 'Okanagan Valley', 'Syrah', 'Red'),
  ('Nk''Mip Cellars', 'Qwam Qwmt Cabernet Sauvignon', 'Okanagan Valley', 'Cabernet Sauvignon', 'Red'),
  ('Nk''Mip Cellars', 'Mer''r''iym', 'Okanagan Valley', 'Merlot/Cabernet Sauvignon/Cabernet Franc', 'Red'),
  ('Le Vieux Pin', 'Équinoxe Syrah', 'Okanagan Valley', 'Syrah', 'Red'),
  ('Le Vieux Pin', 'Cuvée Violette Syrah', 'Okanagan Valley', 'Syrah', 'Red'),
  ('La Stella', 'Maestoso Merlot', 'Okanagan Valley', 'Merlot', 'Red'),
  ('La Stella', 'Fortissimo', 'Okanagan Valley', 'Merlot/Cabernet Sauvignon/Sangiovese', 'Red'),
  ('CheckMate Artisanal Winery', 'Little Pawn Chardonnay', 'Okanagan Valley', 'Chardonnay', 'White'),
  ('CheckMate Artisanal Winery', 'Queen Taken Chardonnay', 'Okanagan Valley', 'Chardonnay', 'White'),
  ('Meyer Family Vineyards', 'Chardonnay', 'Okanagan Valley', 'Chardonnay', 'White'),
  ('Meyer Family Vineyards', 'Pinot Noir', 'Okanagan Valley', 'Pinot Noir', 'Red'),
  ('Blue Mountain Vineyard', 'Brut', 'Okanagan Valley', 'Pinot Noir/Chardonnay/Pinot Gris', 'Sparkling'),
  ('Blue Mountain Vineyard', 'Pinot Noir', 'Okanagan Valley', 'Pinot Noir', 'Red'),
  ('Martin''s Lane', 'Riesling', 'Okanagan Valley', 'Riesling', 'White'),
  ('Martin''s Lane', 'Pinot Noir', 'Okanagan Valley', 'Pinot Noir', 'Red'),
  ('Culmina Family Estate Winery', 'Hypothesis', 'Okanagan Valley', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),
  ('Laughing Stock Vineyards', 'Portfolio', 'Okanagan Valley', 'Merlot/Cabernet Sauvignon/Cabernet Franc', 'Red'),
  ('Phantom Creek Estates', 'Cabernet Sauvignon', 'Okanagan Valley', 'Cabernet Sauvignon', 'Red'),
  ('Phantom Creek Estates', 'Syrah', 'Okanagan Valley', 'Syrah', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;
