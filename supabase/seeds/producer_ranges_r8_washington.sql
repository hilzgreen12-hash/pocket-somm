-- Producer ranges round 8: Washington. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- CHATEAU STE. MICHELLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Chateau Ste. Michelle', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'Columbia Valley Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'Columbia Valley Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'Columbia Valley Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'Columbia Valley Rosé', 'Columbia Valley, Washington, USA', 'Syrah, Cabernet Sauvignon, Grenache', 'Rosé'),  -- https://www.ste-michelle.com/rose-columbia-valley
  ('Chateau Ste. Michelle', 'Columbia Valley Red Blend', 'Columbia Valley, Washington, USA', 'Syrah, Cabernet Sauvignon, Grenache, Malbec, Mourvèdre, Cinsault', 'Red'),  -- https://www.ste-michelle.com/red-blend-columbia-valley
  ('Chateau Ste. Michelle', 'Columbia Valley Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.ste-michelle.com/riesling-columbia-valley
  ('Chateau Ste. Michelle', 'Columbia Valley Dry Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'Harvest Select Sweet Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'Sweet'),  -- https://www.ste-michelle.com/sweet-riesling-columbia-valley
  ('Chateau Ste. Michelle', 'Indian Wells Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'Indian Wells Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'Indian Wells Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'Indian Wells Red Wine Blend', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'LIGHT Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'LIGHT Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.ste-michelle.com/columbia-valley-wines
  ('Chateau Ste. Michelle', 'Le Rosé', 'Columbia Valley, Washington, USA', null, 'Rosé'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release The Main Event Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Viognier', 'Columbia Valley, Washington, USA', 'Viognier', 'White'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Sparkling Pinot Grigio', 'Yakima Valley, Washington, USA', 'Pinot Grigio', 'Sparkling'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Evergreen Vineyard Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Blanc de Noir Cabernet Franc', 'Columbia Valley, Washington, USA', 'Cabernet Franc', 'Sparkling'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Cabernet Franc', 'Columbia Valley, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Midsummer''s White', 'Columbia Valley, Washington, USA', null, 'White'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Blanc de Blanc Cuvée 3', 'Columbia Valley, Washington, USA', null, 'Sparkling'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Blanc de Blanc Cuvée 2', 'Columbia Valley, Washington, USA', null, 'Sparkling'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Blanc de Blanc Cuvée De Coeur Deux', 'Columbia Valley, Washington, USA', null, 'Sparkling'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release "The Nod" Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Cold Creek Red Wine Blend', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Petit Verdot', 'Columbia Valley, Washington, USA', 'Petit Verdot', 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Grenache', 'Columbia Valley, Washington, USA', 'Grenache', 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Cabernet Sauvignon Horse Heaven Hills', 'Horse Heaven Hills, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'IMPETUS Red Wine', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Austral Red Wine', 'Columbia Valley, Washington, USA', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Canoe Ridge Estate Cabernet Sauvignon', 'Horse Heaven Hills, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Canoe Ridge Estate Merlot', 'Horse Heaven Hills, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Canoe Ridge Estate Chardonnay', 'Horse Heaven Hills, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Canoe Ridge Estate Red Wine Blend', 'Horse Heaven Hills, Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Chenin Blanc', 'Columbia Valley, Washington, USA', 'Chenin Blanc', 'White'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release White Cabernet Sauvignon', 'Horse Heaven Hills, Washington, USA', 'Cabernet Sauvignon', 'White'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release G-S-M', 'Columbia Valley, Washington, USA', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Pinot Gris', 'Columbia Valley, Washington, USA', 'Pinot Gris', 'White'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Snipes Mountain Syrah', 'Snipes Mountain, Washington, USA', 'Syrah', 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Artist Series Red Wine', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Mimi Chardonnay', 'Horse Heaven Hills, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Mimi Cabernet Sauvignon', 'Horse Heaven Hills, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Fringes Pinot Noir', 'Columbia Gorge, Washington, USA', 'Pinot Noir', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Dry Riesling', 'Royal Slope, Washington, USA', 'Riesling', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Cold Creek Vineyard Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Cold Creek Vineyard Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Cold Creek Vineyard Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Cold Creek Vineyard Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Gamay Noir', 'Yakima Valley, Washington, USA', 'Gamay Noir', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Red Mountain Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Druthers Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Horse Heaven Vineyard Sauvignon Blanc', 'Horse Heaven Hills, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Yakima Valley Red Wine Blend', 'Yakima Valley, Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Mourvèdre', 'Columbia Valley, Washington, USA', 'Mourvèdre', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Malbec', 'Columbia Valley, Washington, USA', 'Malbec, Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Block 9 Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Block 9 Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Jonté Sauvignon Blanc', 'Yakima Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.ste-michelle.com/shop
  ('Chateau Ste. Michelle', 'Limited Release Autumn White Blend', 'Yakima Valley, Washington, USA', null, 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Muscat Canelli', 'Columbia Valley, Washington, USA', 'Muscat Canelli', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Dry Muscat Canelli', 'Columbia Valley, Washington, USA', 'Muscat Canelli', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Ethos Reserve Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Ethos Reserve Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Ethos Reserve Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Zinfandel', 'Horse Heaven Hills, Washington, USA', 'Zinfandel', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Whidbey''s Reserve Port', 'Washington, USA', null, 'Fortified'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release C-S-M White Wine', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc, Chenin Blanc, Muscat Canelli', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Seasons Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release White Wine Blend', 'Columbia Valley, Washington, USA', null, 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Limited Release Sangiovese', 'Horse Heaven Hills, Washington, USA', 'Sangiovese', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Grenache Blanc', 'Columbia Valley, Washington, USA', 'Grenache Blanc', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Sémillon', 'Horse Heaven Hills, Washington, USA', 'Sémillon', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Dry White Blend', 'Columbia Valley, Washington, USA', null, 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Pinot Blanc', 'Yakima Valley, Washington, USA', 'Pinot Blanc', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Marsanne', 'Rattlesnake Hills, Washington, USA', 'Marsanne', 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Boreal Syrah', 'Columbia Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Boreal Red Wine', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Cinsaut', 'Yakima Valley, Washington, USA', 'Cinsaut', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Syrah Wahluke Slope', 'Wahluke Slope, Washington, USA', 'Syrah', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Counoise', 'Horse Heaven Hills, Washington, USA', 'Counoise', 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'The Concert Series White Wine Blend', 'Columbia Valley, Washington, USA', null, 'White'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'The Concert Series Red Wine Blend', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Limited Release Midsummer''s Red Wine', 'Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Eroica Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.eroicawine.com/wines
  ('Chateau Ste. Michelle', 'Eroica XLC Dry Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.eroicawine.com/wines
  ('Chateau Ste. Michelle', 'Eroica Gold Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.eroicawine.com/wines
  ('Chateau Ste. Michelle', 'Eroica Single Berry Select', 'Columbia Valley, Washington, USA', null, 'Sweet'),  -- https://www.eroicawine.com/wines
  ('Chateau Ste. Michelle', 'Eroica Ice Wine', 'Horse Heaven Hills, Washington, USA', null, 'Sweet')  -- https://www.eroicawine.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SPRING VALLEY VINEYARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Spring Valley Vineyard', 'Uriah Red Wine', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Frederick Red Wine', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Mule Skinner Merlot', 'Walla Walla Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Katherine Corkrum Cabernet Franc', 'Walla Walla Valley, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Sharilee Petit Verdot', 'Walla Walla Valley, Washington, USA', 'Petit Verdot', 'Red'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Derby Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Nina Lee Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Viognier', 'Walla Walla Valley, Washington, USA', 'Viognier', 'White'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Rosé', 'Walla Walla Valley, Washington, USA', null, 'Rosé'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Corkrum Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.springvalleyvineyard.com/wines
  ('Spring Valley Vineyard', 'Corkrum Cabernet Franc', 'Walla Walla Valley, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://www.springvalleyvineyard.com/svv/wine-shop/all-wine/5637149848.c?skip=18
  ('Spring Valley Vineyard', 'Malbec', 'Walla Walla Valley, Washington, USA', 'Malbec', 'Red'),  -- https://www.springvalleyvineyard.com/svv/wine-shop/all-wine/5637149848.c?skip=18
  ('Spring Valley Vineyard', 'Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red')  -- https://www.springvalleyvineyard.com/svv/wine-shop/all-wine/5637149848.c?skip=36
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COL SOLARE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Col Solare', 'Red Mountain Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://colsolare.com/product/2021-col-solare-cabernet-sauvignon/
  ('Col Solare', 'Tenuta Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://colsolare.com/collection/tenuta
  ('Col Solare', 'Component Collection Cabernet Franc', 'Washington, USA', 'Cabernet Franc', 'Red'),  -- https://colsolare.com/collection/component-collection/
  ('Col Solare', 'Component Collection Malbec', 'Washington, USA', 'Malbec', 'Red'),  -- https://colsolare.com/collection/component-collection/
  ('Col Solare', 'Component Collection Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://colsolare.com/collection/component-collection/
  ('Col Solare', 'Collector''s Society Rosé', 'Washington, USA', null, 'Rosé'),  -- https://colsolare.com/collection/collectors-society/
  ('Col Solare', 'Collector''s Society Cabernet Franc', 'Washington, USA', 'Cabernet Franc', 'Red'),  -- https://colsolare.com/collection/collectors-society/
  ('Col Solare', 'Collector''s Society Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://colsolare.com/collection/collectors-society/
  ('Col Solare', 'Collector''s Society Malbec', 'Washington, USA', 'Malbec', 'Red'),  -- https://colsolare.com/collection/collectors-society/
  ('Col Solare', 'Collector''s Society Red Blend', 'Washington, USA', null, 'Red')  -- https://colsolare.com/collection/collectors-society/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NORTHSTAR WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Northstar Winery', 'Premier Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Premier Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Premier Dionysus Vineyard Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Walla Walla Valley Malbec', 'Walla Walla Valley, Washington, USA', 'Malbec', 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Walla Walla Valley Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Walla Walla Valley Red Wine Blend', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Walla Walla Valley Cabernet Franc', 'Walla Walla Valley, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Walla Walla Valley Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Stella Blanca White Wine', 'Columbia Valley, Washington, USA', null, 'White'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Stella Maris Red Wine', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
  ('Northstar Winery', 'Columbia Valley Petit Verdot', 'Columbia Valley, Washington, USA', 'Petit Verdot', 'Red')  -- https://www.northstarwinery.com/northstar/wine-shop/all-wines/5637149853.c
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CANOE RIDGE VINEYARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Canoe Ridge Vineyard', 'Expedition Sauvignon Blanc', 'Horse Heaven Hills, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://canoeridgevineyard.orderport.net/wines/Expedition
  ('Canoe Ridge Vineyard', 'Expedition Red Blend', 'Horse Heaven Hills, Washington, USA', null, 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Expedition
  ('Canoe Ridge Vineyard', 'Expedition Merlot', 'Horse Heaven Hills, Washington, USA', 'Merlot', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Expedition
  ('Canoe Ridge Vineyard', 'Expedition Malbec', 'Horse Heaven Hills, Washington, USA', 'Malbec', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Expedition
  ('Canoe Ridge Vineyard', 'Expedition Pinot Gris', 'Horse Heaven Hills, Washington, USA', 'Pinot Gris', 'White'),  -- https://canoeridgevineyard.orderport.net/wines/Expedition
  ('Canoe Ridge Vineyard', 'Expedition Rosé', 'Horse Heaven Hills, Washington, USA', null, 'Rosé'),  -- https://canoeridgevineyard.orderport.net/wines/Expedition
  ('Canoe Ridge Vineyard', 'Expedition Chardonnay', 'Horse Heaven Hills, Washington, USA', 'Chardonnay', 'White'),  -- https://canoeridgevineyard.orderport.net/wines/Expedition
  ('Canoe Ridge Vineyard', 'Explorer Cabernet Sauvignon', 'Horse Heaven Hills, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/The-Explorer
  ('Canoe Ridge Vineyard', 'The Explorer Red Blend', 'Horse Heaven Hills, Washington, USA', null, 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/The-Explorer
  ('Canoe Ridge Vineyard', 'Explorer Merlot', 'Horse Heaven Hills, Washington, USA', 'Merlot', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/The-Explorer
  ('Canoe Ridge Vineyard', 'Summit Series Cabernet Franc', 'Washington, USA', 'Cabernet Franc', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Summit-Series
  ('Canoe Ridge Vineyard', 'Summit Series Carmenere', 'Washington, USA', 'Carmenere', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Summit-Series
  ('Canoe Ridge Vineyard', 'Summit Series Grenache Syrah', 'Washington, USA', 'Grenache, Syrah', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Summit-Series
  ('Canoe Ridge Vineyard', 'Summit Series Dwelley Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Summit-Series
  ('Canoe Ridge Vineyard', 'Summit Series 35th Anniversary Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Summit-Series
  ('Canoe Ridge Vineyard', 'Summit Series Malbec', 'Washington, USA', 'Malbec', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Summit-Series
  ('Canoe Ridge Vineyard', 'Summit Series Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://canoeridgevineyard.orderport.net/wines/Summit-Series
  ('Canoe Ridge Vineyard', 'Summit Series Semillon', 'Washington, USA', 'Semillon', 'White'),  -- https://canoeridgevineyard.orderport.net/wines/Summit-Series
  ('Canoe Ridge Vineyard', 'Summit Series Sparkling Rosé', 'Washington, USA', null, 'Sparkling'),  -- https://canoeridgevineyard.orderport.net/wines/Summit-Series
  ('Canoe Ridge Vineyard', 'Limited Edition Brut Bubbles', 'Washington, USA', null, 'Sparkling'),  -- https://canoeridgevineyard.orderport.net/wines/Tasting-Room-Exclusives
  ('Canoe Ridge Vineyard', 'Limited Edition Rosé Bubbles', 'Washington, USA', null, 'Sparkling'),  -- https://canoeridgevineyard.orderport.net/wines/Tasting-Room-Exclusives
  ('Canoe Ridge Vineyard', 'Viognier', 'Washington, USA', 'Viognier', 'White')  -- https://www.canoeridgevineyard.com
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COLUMBIA CREST ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Columbia Crest', 'Grand Estates Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Grand Estates Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Grand Estates Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Grand Estates Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Grand Estates Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Reserve Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Reserve Walter Clore Red Wine', 'Washington, USA', null, 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Founders Series Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Founders Series Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Founders Series Merlot', 'Washington, USA', 'Merlot', 'Red')  -- https://www.columbiacrest.com/our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- 14 HANDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('14 Hands', 'Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Hot to Trot Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Sauvignon Blanc', 'Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Pinot Grigio', 'Washington, USA', 'Pinot Grigio', 'White'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Sweet Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Run Wild Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Stampede Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Rosé', 'Washington, USA', null, 'Rosé'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Buttery Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'White Bubbles', 'Washington, USA', null, 'Sparkling'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Rosé Bubbles', 'Washington, USA', null, 'Sparkling')  -- https://www.14hands.com/our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HOGUE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Hogue Cellars', 'Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.hoguecellars.com/wines
  ('Hogue Cellars', 'Sweet Riesling', 'Washington, USA', 'Riesling', 'White'),  -- https://www.hoguecellars.com/wines
  ('Hogue Cellars', 'Pinot Grigio', 'Washington, USA', 'Pinot Grigio', 'White'),  -- https://www.hoguecellars.com/wines
  ('Hogue Cellars', 'Sauvignon Blanc', 'Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.hoguecellars.com/wines
  ('Hogue Cellars', 'Riesling', 'Washington, USA', 'Riesling', 'White'),  -- https://www.hoguecellars.com/wines
  ('Hogue Cellars', 'Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.hoguecellars.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COLUMBIA WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Columbia Winery', 'Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.columbiawinery.com/wines
  ('Columbia Winery', 'Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.columbiawinery.com/wines
  ('Columbia Winery', 'Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.columbiawinery.com/wines
  ('Columbia Winery', 'Merlot', 'Washington, USA', 'Merlot', 'Red')  -- https://www.columbiawinery.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHARLES SMITH WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Charles Smith Wines', 'Bubbled Kung Fu Girl Riesling', 'Washington, USA', 'Riesling', 'Sparkling'),  -- https://www.charlessmithwines.com/wines
  ('Charles Smith Wines', 'Bubbled Band of Roses Rosé', 'Washington, USA', null, 'Sparkling'),  -- https://www.charlessmithwines.com/wines
  ('Charles Smith Wines', 'Band of Roses Rosé', 'Washington, USA', null, 'Rosé'),  -- https://www.charlessmithwines.com/wines
  ('Charles Smith Wines', 'Boom Boom! Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://www.charlessmithwines.com/wines
  ('Charles Smith Wines', 'Chateau Smith Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.charlessmithwines.com/wines
  ('Charles Smith Wines', 'Eve Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.charlessmithwines.com/wines
  ('Charles Smith Wines', 'Kung Fu Girl Riesling', 'Washington, USA', 'Riesling', 'White'),  -- https://www.charlessmithwines.com/wines
  ('Charles Smith Wines', 'The Velvet Devil Merlot', 'Washington, USA', 'Merlot', 'Red')  -- https://www.charlessmithwines.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WINES OF SUBSTANCE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Wines of Substance', 'Cs Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.systembolaget.se/7408301
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WATERBROOK WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Waterbrook Winery', 'Columbia Valley Malbec', 'Columbia Valley, Washington, USA', 'Malbec', 'Red'),  -- https://waterbrook.orderport.net/wines/Columbia-Valley
  ('Waterbrook Winery', 'Columbia Valley Melange Red Blend', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://waterbrook.orderport.net/wines/Columbia-Valley
  ('Waterbrook Winery', 'Columbia Valley Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://waterbrook.orderport.net/wines/Columbia-Valley
  ('Waterbrook Winery', 'Columbia Valley Pinot Gris', 'Columbia Valley, Washington, USA', 'Pinot Gris', 'White'),  -- https://waterbrook.orderport.net/wines/Columbia-Valley
  ('Waterbrook Winery', 'Columbia Valley Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://waterbrook.orderport.net/wines/Columbia-Valley
  ('Waterbrook Winery', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://waterbrook.orderport.net/wines/Columbia-Valley
  ('Waterbrook Winery', 'Columbia Valley Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://waterbrook.orderport.net/wines/Columbia-Valley
  ('Waterbrook Winery', 'Columbia Valley Sangiovese Rosé', 'Columbia Valley, Washington, USA', 'Sangiovese', 'Rosé'),  -- https://waterbrook.orderport.net/wines/Columbia-Valley
  ('Waterbrook Winery', 'Columbia Valley Syrah', 'Columbia Valley, Washington, USA', 'Syrah', 'Red'),  -- https://waterbrook.orderport.net/wines/Columbia-Valley
  ('Waterbrook Winery', 'Reserve Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://waterbrook.orderport.net/wines/Reserve
  ('Waterbrook Winery', 'Reserve Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://waterbrook.orderport.net/wines/Reserve
  ('Waterbrook Winery', 'Vintners Selection Red Blend', 'Washington, USA', null, 'Red'),  -- https://waterbrook.orderport.net/wines/Reserve
  ('Waterbrook Winery', 'Reserve Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://waterbrook.orderport.net/wines/Reserve
  ('Waterbrook Winery', 'Reserve Red Mountain Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://waterbrook.orderport.net/wines/Reserve
  ('Waterbrook Winery', 'Waterbrook Farms Mélange Blanc', 'Washington, USA', null, 'White'),  -- https://waterbrook.orderport.net/wines/Farm-Tier
  ('Waterbrook Winery', 'Waterbrook Farms Rose Bubbles', 'Washington, USA', null, 'Sparkling'),  -- https://waterbrook.orderport.net/wines/Farm-Tier
  ('Waterbrook Winery', 'ICON Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Mourvedre', 'Washington, USA', 'Mourvedre', 'Red'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Barbera', 'Washington, USA', 'Barbera', 'Red'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Dolcetto', 'Washington, USA', 'Dolcetto', 'Red'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Carménère', 'Washington, USA', 'Carménère', 'Red'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Rose', 'Washington, USA', null, 'Rosé'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Sparkling Brut', 'Washington, USA', null, 'Sparkling'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Sparkling Brut Rosé', 'Washington, USA', null, 'Sparkling'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Estate Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'ICON Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://waterbrook.orderport.net/wines/Icon
  ('Waterbrook Winery', 'Clean Non-Alcoholic Pinot Grigio', 'Washington, USA', 'Pinot Grigio', 'White'),  -- https://waterbrook.orderport.net/wines/Waterbrook-Clean
  ('Waterbrook Winery', 'Clean Non-Alcoholic Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://waterbrook.orderport.net/wines/Waterbrook-Clean
  ('Waterbrook Winery', 'Clean Non-Alcoholic Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://waterbrook.orderport.net/wines/Waterbrook-Clean
  ('Waterbrook Winery', 'Brut Bubbles', 'Washington, USA', null, 'Sparkling')  -- https://www.waterbrook.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BROWNE FAMILY VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Browne Family Vineyards', 'Medallion Series Bitner Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'City Collection Bellevue Red Blend', 'Washington, USA', null, 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'City Collection Seattle Red', 'Washington, USA', null, 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'City Collection Walla Walla Red Blend', 'Washington, USA', null, 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'City Collection Tacoma Red Blend', 'Washington, USA', null, 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Estate Vineyard Cabernet Franc', 'Washington, USA', 'Cabernet Franc', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Estate Vineyard Malbec', 'Washington, USA', 'Malbec', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Estate Vineyard Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Estate Vineyard Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Estate Vineyard Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Premier Collection Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Premier Collection Cabernet Franc', 'Washington, USA', 'Cabernet Franc', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Premier Collection Malbec', 'Washington, USA', 'Malbec', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Proprietor''s Red Blend', 'Washington, USA', null, 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Quintessence Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Spymaster Series "The Continent" Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Spymaster Series "The Farm" Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Spymaster Series "Homecoming" Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Spymaster Series "Liberation of Paris" Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Do Epic Shit Reserve Red Blend', 'Washington, USA', null, 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Do Epic Shit Red Blend', 'Washington, USA', null, 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/2
  ('Browne Family Vineyards', 'Do Epic Shit Sparkling Wine', 'Washington, USA', null, 'Sparkling'),  -- https://brownefamilyvineyards.orderport.net/wines/Sparkling
  ('Browne Family Vineyards', 'Forest Project Conservation Collection Malbec', 'Washington, USA', 'Malbec', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Forest Project Conservation Collection Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Forest Project Red Mountain Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
  ('Browne Family Vineyards', 'Forest Project Canyon Ranch Petit Verdot', 'Washington, USA', 'Petit Verdot', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Forest Project Kiona Vyd Malbec', 'Washington, USA', 'Malbec', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Forest Project White Blend', 'Washington, USA', null, 'White'),  -- https://brownefamilyvineyards.orderport.net/wines/White-Wine
  ('Browne Family Vineyards', 'Mural Collection Grenache', 'Washington, USA', 'Grenache', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Mural Collection GSM', 'Washington, USA', null, 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Mural Collection Pinot Gris', 'Washington, USA', 'Pinot Gris', 'White'),  -- https://brownefamilyvineyards.orderport.net/wines/White-Wine
  ('Browne Family Vineyards', 'Tequila Barrel Aged Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Vineyard Collection Petit Verdot', 'Washington, USA', 'Petit Verdot', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Bitner Estate Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Bitner Estate Tribute Red Blend', 'Washington, USA', null, 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/2
  ('Browne Family Vineyards', 'Bitner Estate Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://brownefamilyvineyards.orderport.net/wines/White-Wine
  ('Browne Family Vineyards', 'Bitner Estate Brut', 'Washington, USA', null, 'Sparkling'),  -- https://brownefamilyvineyards.orderport.net/wines/Sparkling
  ('Browne Family Vineyards', 'Bitner Estate Grenache Rose', 'Washington, USA', 'Grenache', 'Rosé'),  -- https://brownefamilyvineyards.orderport.net/wines/Rose-Wine
  ('Browne Family Vineyards', 'Skull & Chain Red Mountain Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Heritage Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/1
  ('Browne Family Vineyards', 'Heritage Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://brownefamilyvineyards.orderport.net/wines/White-Wine
  ('Browne Family Vineyards', 'Medallion Series Dottie Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://brownefamilyvineyards.orderport.net/wines/White-Wine
  ('Browne Family Vineyards', 'Medallion Series Georgia Brut', 'Washington, USA', null, 'Sparkling'),  -- https://brownefamilyvineyards.orderport.net/wines/Sparkling
  ('Browne Family Vineyards', 'Port', 'Washington, USA', null, 'Fortified')  -- https://brownefamilyvineyards.orderport.net/wines/red-wine/page/2
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALDER RIDGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Alder Ridge', 'Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://brownefamilyvineyards.orderport.net/wines/Red-Wine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- L'ECOLE NO 41 ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('L''Ecole No 41', 'DSB Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Ferguson', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Perigee', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Apogee', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Estate Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Walla Walla Valley Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Estate Merlot', 'Walla Walla Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Columbia Valley Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Seven Hills Vineyard Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Columbia Valley Syrah', 'Columbia Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'StoneTree Vineyard Grenache', 'Wahluke Slope, Washington, USA', 'Grenache', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Frenchtown Red Wine', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Seven Hills Vineyard GSM', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Estate Cabernet Franc/Merlot', 'Walla Walla Valley, Washington, USA', 'Cabernet Franc, Merlot', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Walla Walla Valley Malbec', 'Walla Walla Valley, Washington, USA', 'Malbec', 'Red'),  -- https://www.lecole.com/our-wines/red-wines/
  ('L''Ecole No 41', 'Luminesce', 'Walla Walla Valley, Washington, USA', null, 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Columbia Valley Semillon', 'Columbia Valley, Washington, USA', 'Semillon', 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Stillwater Creek Vineyard Semillon', 'Royal Slope, Washington, USA', 'Semillon', 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Frenchtown Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Columbia Valley Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Stillwater Creek Vineyard Chardonnay', 'Royal Slope, Washington, USA', 'Chardonnay', 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Phil Church Vineyard Chenin Blanc', 'Yakima Valley, Washington, USA', 'Chenin Blanc', 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Old Vines Chenin Blanc', 'Yakima Valley, Washington, USA', 'Chenin Blanc', 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Upland Vineyard Old Vines Chenin Blanc', 'Snipes Mountain, Washington, USA', 'Chenin Blanc', 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Loch Block Vineyard Grenache Blanc', 'Yakima Valley, Washington, USA', 'Grenache Blanc', 'White'),  -- https://www.lecole.com/our-wines/white-wines/
  ('L''Ecole No 41', 'Alder Ridge Vineyard Grenache Rosé', 'Horse Heaven Hills, Washington, USA', 'Grenache', 'Rosé')  -- https://www.lecole.com/our-wines/white-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WOODWARD CANYON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Woodward Canyon', 'Estate Sauvignon Blanc', 'Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Washington State Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Non-Vintage Red Wine', 'Washington, USA', null, 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Washington State Barbera', 'Washington, USA', 'Barbera', 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Estate Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Estate Cabernet Franc', 'Washington, USA', 'Cabernet Franc', 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Estate Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Estate Grenache-Mourvèdre-Syrah-Malbec', 'Washington, USA', 'Grenache, Mourvèdre, Syrah, Malbec', 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Artist Series Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Estate Clone 4 Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Estate Clone 191 Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Estate Reserve Red Wine', 'Washington, USA', null, 'Red'),  -- https://woodwardcanyon.orderport.net/wines/our-wines
  ('Woodward Canyon', 'Old Vines Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://woodwardcanyon.orderport.net/wines/our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SEVEN HILLS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Seven Hills Winery', 'Walla Walla Valley Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Quintessence Vineyard Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'SHW Founding Vineyard Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Ciel du Cheval Vineyard Red Wine', 'Red Mountain, Washington, USA', null, 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'SHW Founding Vineyard Merlot', 'Walla Walla Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'McClellan Estate Vineyard Malbec', 'Walla Walla Valley, Washington, USA', 'Malbec', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'McClellan Estate Vineyard Petit Verdot', 'Walla Walla Valley, Washington, USA', 'Petit Verdot', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Pentad Red Wine', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Defiant III', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Defiant II', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Defiant I', 'Walla Walla Valley, Washington, USA', null, 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Summit View Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'McClellan Estate Vineyard Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Walla Walla Valley Carménère', 'Walla Walla Valley, Washington, USA', 'Carménère', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Walla Walla Valley Cabernet Franc', 'Walla Walla Valley, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Walla Walla Valley Merlot', 'Walla Walla Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.sevenhillswinery.com/our-wines/our-reds/
  ('Seven Hills Winery', 'Reserve Sauvignon Blanc', 'White Bluffs, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.sevenhillswinery.com/our-wines/whites-and-rose/
  ('Seven Hills Winery', 'Columbia Valley Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.sevenhillswinery.com/our-wines/whites-and-rose/
  ('Seven Hills Winery', 'Columbia Valley Rosé', 'Columbia Valley, Washington, USA', 'Cabernet Franc, Malbec, Petit Verdot', 'Rosé')  -- https://www.sevenhillswinery.com/shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PEPPER BRIDGE WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Pepper Bridge Winery', 'Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Petit Verdot, Malbec, Merlot, Cabernet Franc', 'Red'),  -- https://www.pepperbridge.com/wine/2023-cabernet-sauvignon
  ('Pepper Bridge Winery', 'Merlot', 'Walla Walla Valley, Washington, USA', 'Merlot, Malbec, Cabernet Franc', 'Red'),  -- https://www.pepperbridge.com/wine/2024-merlot
  ('Pepper Bridge Winery', 'Trine', 'Walla Walla Valley, Washington, USA', 'Cabernet Franc, Cabernet Sauvignon, Merlot, Malbec, Petit Verdot', 'Red'),  -- https://www.pepperbridge.com/wine/2023-trine
  ('Pepper Bridge Winery', 'Sauvignon Blanc', 'Walla Walla Valley, Washington, USA', 'Sauvignon Blanc, Sémillon', 'White'),  -- https://www.pepperbridge.com/wine/2025-sauvignon-blanc
  ('Pepper Bridge Winery', 'Pepper Bridge Vineyard', 'Walla Walla Valley, Washington, USA', 'Merlot, Cabernet Sauvignon, Malbec, Petit Verdot', 'Red'),  -- https://www.pepperbridge.com/wine/2023-pepper-bridge-vineyard
  ('Pepper Bridge Winery', 'Seven Hills Vineyard', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Merlot, Malbec, Cabernet Franc, Petit Verdot', 'Red')  -- https://www.pepperbridge.com/wine/2024-seven-hills-vineyard
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DUNHAM CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Dunham Cellars', 'Three Legged Red', 'Washington, USA', 'Merlot, Cabernet Sauvignon, Syrah', 'Red'),  -- https://dunhamcellars.com/product/2024-three-legged-red
  ('Dunham Cellars', 'Zags Red', 'Washington, USA', null, 'Red'),  -- https://dunhamcellars.com/product/2025-zags-red
  ('Dunham Cellars', 'Cabernet Sauvignon XXVIII', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://dunhamcellars.com/product/2022-cabernet-sauvignon-xxviii
  ('Dunham Cellars', 'Trutina', 'Washington, USA', 'Merlot, Cabernet Sauvignon, Malbec, Petit Verdot', 'Red'),  -- https://dunhamcellars.com/product/2022-trutina
  ('Dunham Cellars', 'Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://dunhamcellars.com/product/2022-syrah
  ('Dunham Cellars', 'Lewis Vineyard Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://dunhamcellars.com/product/2021-lewis-vineyard-cabernet-sauvignon
  ('Dunham Cellars', 'Lewis Vineyard Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://dunhamcellars.com/acs-shop/
  ('Dunham Cellars', 'Lewis Vineyard Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://dunhamcellars.com/acs-shop/
  ('Dunham Cellars', 'Shirley Mays Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://dunhamcellars.com/product/2025-shirley-mays-chardonnay
  ('Dunham Cellars', 'Sauvignon Blanc', 'Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://dunhamcellars.com/product/2025-sauvignon-blanc
  ('Dunham Cellars', 'Super Tuscan', 'Washington, USA', 'Sangiovese, Merlot, Malbec', 'Red'),  -- https://dunhamcellars.com/product/2022-wine-club-super-tuscan
  ('Dunham Cellars', 'Petit Verdot', 'Washington, USA', 'Petit Verdot', 'Red')  -- https://dunhamcellars.com/product/2022-wine-club-petit-verdot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BARNARD GRIFFIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Barnard Griffin', 'Columbia Valley Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.skurnik.com/producer/barnard-griffin
  ('Barnard Griffin', 'Columbia Valley Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.skurnik.com/producer/barnard-griffin
  ('Barnard Griffin', 'Columbia Valley Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.skurnik.com/producer/barnard-griffin
  ('Barnard Griffin', 'Columbia Valley Rosé of Sangiovese', 'Columbia Valley, Washington, USA', 'Sangiovese', 'Rosé'),  -- https://www.skurnik.com/producer/barnard-griffin
  ('Barnard Griffin', 'Columbia Valley Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.skurnik.com/producer/barnard-griffin
  ('Barnard Griffin', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.skurnik.com/producer/barnard-griffin
  ('Barnard Griffin', 'Rob''s Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.skurnik.com/producer/barnard-griffin
  ('Barnard Griffin', 'Columbia Valley Albariño', 'Columbia Valley, Washington, USA', 'Albariño', 'White'),  -- https://www.skurnik.com/producer/barnard-griffin
  ('Barnard Griffin', 'Columbia Valley Syrah Port', 'Columbia Valley, Washington, USA', 'Syrah', 'Fortified')  -- https://www.skurnik.com/producer/barnard-griffin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MILBRANDT VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Milbrandt Vineyards', 'Wahluke Slope Merlot', 'Wahluke Slope, Washington, USA', 'Merlot', 'Red'),  -- https://evergreenfamilywines.com/brand/milbrandt/
  ('Milbrandt Vineyards', 'Wahluke Slope Cabernet Sauvignon', 'Wahluke Slope, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://evergreenfamilywines.com/brand/milbrandt/
  ('Milbrandt Vineyards', 'Brothers Blend Red Wine', 'Wahluke Slope, Washington, USA', null, 'Red')  -- https://evergreenfamilywines.com/brand/milbrandt/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LONG SHADOWS VINTNERS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Long Shadows Vintners', 'Pedestal Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.decanter.com/wine-reviews/search/long-shadows/2/
  ('Long Shadows Vintners', 'Feather Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/long-shadows/2/
  ('Long Shadows Vintners', 'Pirouette', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.decanter.com/wine-reviews/search/long-shadows/2/
  ('Long Shadows Vintners', 'Saggi', 'Columbia Valley, Washington, USA', 'Sangiovese, Cabernet Sauvignon', 'Red'),  -- https://longshadows.com/winemakers
  ('Long Shadows Vintners', 'Sequel Syrah', 'Columbia Valley, Washington, USA', 'Syrah', 'Red'),  -- https://longshadows.com/winemakers
  ('Long Shadows Vintners', 'Chester-Kidder', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon, Syrah, Petit Verdot', 'Red'),  -- https://www.winespectator.com/wine/wine-detail/id/1329178/name/long-shadows-vintners-chester-kidder-columbia-valley-2021/guest
  ('Long Shadows Vintners', 'Poet''s Leap Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/long-shadows/2/
  ('Long Shadows Vintners', 'Poet''s Leap Dry Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/long-shadows/2/
  ('Long Shadows Vintners', 'Dance Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/long-shadows/2/
  ('Long Shadows Vintners', 'Julia''s Dazzle Rosé', 'Columbia Valley, Washington, USA', 'Pinot Gris', 'Rosé'),  -- https://www.washingtontastingroom.com/wine-reviews/long-shadows-nine-hats
  ('Long Shadows Vintners', 'Cymbal Sauvignon Blanc', 'Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://longshadows.com/trade-media
  ('Long Shadows Vintners', 'Nine Hats Red Wine', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon, Syrah, Merlot', 'Red'),  -- https://www.winespectator.com/wine/wine-detail/id/1316812/name/nine-hats-columbia-valley-2022/guest
  ('Long Shadows Vintners', 'Nine Hats Syrah', 'Columbia Valley, Washington, USA', 'Syrah', 'Red'),  -- https://delectable.com/wine/long-shadows-vintners/nine-hats-columbia-valley-syrah
  ('Long Shadows Vintners', 'Méritant Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://owenbargreen.com/blog/2026/8/18/long-shadows
  ('Long Shadows Vintners', 'Méritant Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://owenbargreen.com/blog/2026/8/18/long-shadows
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUILCEDA CREEK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Quilceda Creek', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.quilcedacreek.com/wines
  ('Quilceda Creek', 'Palengat Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.quilcedacreek.com/wine/2023-quilceda-creek-palengat-cabernet-sauvignon/
  ('Quilceda Creek', 'Tchelistcheff Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.quilcedacreek.com/wine/2023-quilceda-creek-tchelistcheff-cabernet-sauvignon/
  ('Quilceda Creek', 'Galitzine Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.quilcedacreek.com/wine/2023-quilceda-creek-galitzine-cabernet-sauvignon/
  ('Quilceda Creek', 'CVR Red Wine', 'Washington, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot', 'Red')  -- https://www.quilcedacreek.com/wine/2024-quilceda-creek-cvr-red-wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LEONETTI CELLAR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Leonetti Cellar', 'Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://leonetticellar.com/wines/cabernet-sauvignon/
  ('Leonetti Cellar', 'Merlot', 'Walla Walla Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.leonetticellar.com/wines
  ('Leonetti Cellar', 'Reserve', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://leonetticellar.com/wines/reserve/
  ('Leonetti Cellar', 'Sangiovese', 'Walla Walla Valley, Washington, USA', 'Sangiovese', 'Red'),  -- https://www.leonetticellar.com/wines
  ('Leonetti Cellar', 'Aglianico', 'Walla Walla Valley, Washington, USA', 'Aglianico', 'Red'),  -- https://leonetticellar.com/wines/aglianico/
  ('Leonetti Cellar', 'Mill Creek Upland', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://leonetticellar.com/wines/single-vineyard-series/2023-leonetti-single-vineyard-series/
  ('Leonetti Cellar', 'Loess', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Malbec', 'Red'),  -- https://leonetticellar.com/wines/single-vineyard-series/2023-leonetti-single-vineyard-series/
  ('Leonetti Cellar', 'Holy Roller', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Sangiovese', 'Red'),  -- https://leonetticellar.com/wines/single-vineyard-series/2023-leonetti-single-vineyard-series/
  ('Leonetti Cellar', 'Serra Pedace', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://leonetticellar.com/wines/single-vineyard-series/2023-leonetti-single-vineyard-series/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAYUSE VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Cayuse Vineyards', 'Armada Vineyard Syrah', 'Walla Walla Valley, Oregon, USA', 'Syrah', 'Red'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'Bionic Frog Syrah', 'Walla Walla Valley, Oregon, USA', 'Syrah', 'Red'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'Cailloux Vineyard Syrah', 'Walla Walla Valley, Oregon, USA', 'Syrah', 'Red'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'Cailloux Vineyard Viognier', 'Walla Walla Valley, Oregon, USA', 'Viognier', 'White'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'En Cerise Vineyard Syrah', 'Walla Walla Valley, Oregon, USA', 'Syrah', 'Red'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'En Chamberlin Vineyard Syrah', 'Walla Walla Valley, Oregon, USA', 'Syrah', 'Red'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'Edith Grenache Rosé', 'Walla Walla Valley, Oregon, USA', 'Grenache', 'Rosé'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'God Only Knows Grenache', 'Walla Walla Valley, Oregon, USA', 'Grenache', 'Red'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'Impulsivo Tempranillo', 'Walla Walla Valley, Oregon, USA', 'Tempranillo', 'Red'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'Widowmaker Cabernet Sauvignon', 'Walla Walla Valley, Oregon, USA', 'Cabernet Sauvignon', 'Red'),  -- https://cayusevineyards.com/static/wines-list.aspx
  ('Cayuse Vineyards', 'Camaspelo', 'Walla Walla Valley, Oregon, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.skurnik.com/producer/cayuse-vineyards/
  ('Cayuse Vineyards', 'Flying Pig', 'Walla Walla Valley, Oregon, USA', null, 'Red')  -- https://www.skurnik.com/producer/cayuse-vineyards/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HORSEPOWER VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Horsepower Vineyards', 'Sur Echalas Vineyard Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://www.skurnik.com/producer/horsepower-vineyards/
  ('Horsepower Vineyards', 'Sur Echalas Vineyard Grenache', 'Walla Walla Valley, Oregon, USA', 'Grenache', 'Red'),  -- https://www.skurnik.com/producer/horsepower-vineyards/
  ('Horsepower Vineyards', 'Fiddleneck Grenache', 'Washington, USA', 'Grenache', 'Red'),  -- https://www.skurnik.com/producer/horsepower-vineyards/
  ('Horsepower Vineyards', 'The Tribe Vineyard Syrah', 'Walla Walla Valley, Oregon, USA', 'Syrah', 'Red')  -- https://www.decanter.com/wine-reviews/search/term/cayuse/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NO GIRLS WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('No Girls Wines', 'La Paciencia Vineyard Syrah', 'Walla Walla Valley, Oregon, USA', 'Syrah', 'Red'),  -- https://www.winespectator.com/wine/wine-detail/id/1330653/name/no-girls-syrah-walla-walla-valley-la-paciencia-vineyard-2022/guest
  ('No Girls Wines', 'La Paciencia Vineyard Grenache', 'Walla Walla Valley, Oregon, USA', 'Grenache', 'Red'),  -- https://www.winespectator.com/wine/wine-detail/id/1330654/name/no-girls-grenache-walla-walla-valley-la-paciencia-vineyard-2022/guest
  ('No Girls Wines', 'La Paciencia Vineyard Tempranillo', 'Walla Walla Valley, Oregon, USA', 'Tempranillo', 'Red')  -- https://www.vivino.com/en/wineries/us-no-girls
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ANDREW WILL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Andrew Will', 'Sorella', 'Horse Heaven Hills, Washington, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot', 'Red'),  -- https://decanter.com/wine-reviews/usa/washington/andrew-will-sorella-columbia-valley-horse-heaven-hills-88418
  ('Andrew Will', 'Champoux Vineyard Red Wine', 'Horse Heaven Hills, Washington, USA', 'Merlot, Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://decanter.com/wine-reviews/usa/washington/andrew-will-champoux-vineyard-red-wine-horse-heaven-hills-88462
  ('Andrew Will', 'Ciel du Cheval Red Wine', 'Red Mountain, Washington, USA', 'Cabernet Franc, Merlot', 'Red'),  -- https://decanter.com/wine-reviews/usa/washington/andrew-will-ciel-du-cheval-red-wine-red-mountain-2021-88463
  ('Andrew Will', 'Two Blondes Red Wine', 'Yakima Valley, Washington, USA', 'Merlot', 'Red'),  -- https://decanter.com/wine-reviews/usa/washington/andrew-will-two-blondes-red-wine-yakima-valley-2021-88507
  ('Andrew Will', 'Two Blondes Merlot', 'Yakima Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.andrewwill.com/wines
  ('Andrew Will', 'Two Blondes Cabernet Franc', 'Yakima Valley, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://www.andrewwill.com/wines
  ('Andrew Will', 'Two Blondes Cabernet Sauvignon', 'Yakima Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.andrewwill.com/wines
  ('Andrew Will', 'Champoux Cabernet Sauvignon', 'Horse Heaven Hills, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.andrewwill.com/wines
  ('Andrew Will', 'Champoux Cabernet Franc', 'Horse Heaven Hills, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://www.andrewwill.com/wines
  ('Andrew Will', 'Champoux Merlot', 'Horse Heaven Hills, Washington, USA', 'Merlot', 'Red'),  -- https://www.andrewwill.com/wines
  ('Andrew Will', 'Cuvée Lucia Semillon', 'Washington, USA', 'Semillon', 'White'),  -- https://www.andrewwill.com/wines
  ('Andrew Will', 'Cuvée Lucia Sauvignon Blanc', 'Washington, USA', 'Sauvignon Blanc', 'White')  -- https://www.andrewwill.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BETZ FAMILY WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Betz Family Winery', 'Clos de Betz', 'Columbia Valley, Washington, USA', 'Merlot, Cabernet Sauvignon, Cabernet Franc, Petit Verdot', 'Red'),  -- https://www.winerelease.com/WineryInfo/betz.html
  ('Betz Family Winery', 'Père de Famille', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon, Petit Verdot, Cabernet Franc', 'Red'),  -- https://www.decanter.com/wine-reviews/usa/washington/betz-family-pere-de-famille-columbia-valley-2022-93812
  ('Betz Family Winery', 'Heart of the Hill Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.winerelease.com/WineryInfo/betz.html
  ('Betz Family Winery', 'Bésoleil', 'Columbia Valley, Washington, USA', 'Grenache, Mourvèdre, Counoise, Petite Sirah', 'Red'),  -- https://www.winerelease.com/WineryInfo/betz.html
  ('Betz Family Winery', 'La Serenne Syrah', 'Yakima Valley, Washington, USA', 'Syrah', 'Red'),  -- https://decanter.com/wine-reviews/usa/washington/betz-family-la-serenne-syrah-columbia-valley-yakima-93807
  ('Betz Family Winery', 'La Côte Patriarche Syrah', 'Yakima Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.winerelease.com/WineryInfo/betz.html
  ('Betz Family Winery', 'La Côte Rousse Syrah', 'Yakima Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.winerelease.com/WineryInfo/betz.html
  ('Betz Family Winery', 'Domaine de Pierres Syrah', 'Walla Walla Valley, Oregon, USA', 'Syrah', 'Red'),  -- https://www.winerelease.com/WineryInfo/betz.html
  ('Betz Family Winery', 'Rosé Cache', 'Columbia Valley, Washington, USA', 'Grenache, Counoise', 'Rosé')  -- https://www.winerelease.com/WineryInfo/betz.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DELILLE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('DeLille Cellars', 'D2 Red Blend', 'Columbia Valley, Washington, USA', 'Merlot, Cabernet Sauvignon, Petit Verdot, Malbec, Cabernet Franc', 'Red'),  -- https://delillecellars.com/product/2023-d2-red-blend/
  ('DeLille Cellars', 'Chaleur Estate Red Blend', 'Yakima Valley, Washington, USA', 'Cabernet Sauvignon, Merlot, Cabernet Franc', 'Red'),  -- https://delillecellars.com/product/2023-chaleur-estate-red-blend/
  ('DeLille Cellars', 'Chaleur Blanc White Blend', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc, Sémillon', 'White'),  -- https://delillecellars.com/product/2024-chaleur-blanc-white-blend/
  ('DeLille Cellars', 'Four Flags Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://delillecellars.com/product/2023-four-flags-cabernet-sauvignon/
  ('DeLille Cellars', 'Grand Ciel Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://delillecellars.com/collection/red-wines
  ('DeLille Cellars', 'Grand Ciel Syrah', 'Red Mountain, Washington, USA', 'Syrah', 'Red'),  -- https://delillecellars.com/product/2023-grand-ciel-syrah/
  ('DeLille Cellars', 'Signature Syrah', 'Yakima Valley, Washington, USA', 'Syrah, Viognier', 'Red'),  -- https://delillecellars.com/product/2022-signature-syrah/
  ('DeLille Cellars', 'Shaw Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://delillecellars.com/product/2023-shaw-cabernet-sauvignon/
  ('DeLille Cellars', 'Klipsun Vineyard Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://delillecellars.com/product/21-klipsun-cabernet-sauvignon/
  ('DeLille Cellars', 'Reserve Red Blend', 'Columbia Valley, Washington, USA', 'Cabernet Franc, Merlot', 'Red'),  -- https://delillecellars.com/product/2023-reserve-red-blend/
  ('DeLille Cellars', 'Reserve Grenache', 'Yakima Valley, Washington, USA', 'Grenache', 'Red'),  -- https://delillecellars.com/collection/all-wines
  ('DeLille Cellars', 'Reserve Syrah', 'Yakima Valley, Washington, USA', 'Syrah', 'Red'),  -- https://delillecellars.com/collection/all-wines
  ('DeLille Cellars', 'Harrison Hill Red Blend', 'Snipes Mountain, Washington, USA', null, 'Red'),  -- https://delillecellars.com/collection/red-wines
  ('DeLille Cellars', 'Upland Syrah', 'Snipes Mountain, Washington, USA', 'Syrah', 'Red'),  -- https://delillecellars.com/product/2023-upland-syrah/
  ('DeLille Cellars', 'Red Willow Syrah', 'Yakima Valley, Washington, USA', 'Syrah', 'Red'),  -- https://delillecellars.com/product/2023-red-willow-syrah/
  ('DeLille Cellars', 'Red Willow Malbec', 'Yakima Valley, Washington, USA', 'Malbec', 'Red'),  -- https://delillecellars.com/collection/all-wines
  ('DeLille Cellars', 'Red Willow Blend', 'Yakima Valley, Washington, USA', 'Cabernet Franc, Merlot', 'Red'),  -- https://delillecellars.com/product/2022-red-willow-blend/
  ('DeLille Cellars', 'Red Willow Chardonnay', 'Yakima Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://delillecellars.com/collection/white-wines
  ('DeLille Cellars', 'Le Colosse', 'Yakima Valley, Washington, USA', 'Merlot', 'Red'),  -- https://delillecellars.com/product/2021lecolosse/
  ('DeLille Cellars', 'Minuit', 'Yakima Valley, Washington, USA', 'Malbec, Cabernet Sauvignon', 'Red'),  -- https://delillecellars.com/product/2021-minuit-red-wine/
  ('DeLille Cellars', 'Le Dessein GSM', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://delillecellars.com/collection/red-wines
  ('DeLille Cellars', 'Métier Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://delillecellars.com/collection/red-wines
  ('DeLille Cellars', 'Métier Red Blend', 'Columbia Valley, Washington, USA', 'Syrah, Cabernet Sauvignon, Merlot, Malbec', 'Red'),  -- https://delillecellars.com/product/2023-metier-red-blend/
  ('DeLille Cellars', 'Métier Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://delillecellars.com/collection/white-wines
  ('DeLille Cellars', 'Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://delillecellars.com/collection/red-wines
  ('DeLille Cellars', 'Marguerite Sauvignon Blanc', 'White Bluffs, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://delillecellars.com/collection/white-wines
  ('DeLille Cellars', 'Sagemoor Vineyards Riesling', 'White Bluffs, Washington, USA', 'Riesling', 'White'),  -- https://delillecellars.com/collection/white-wines
  ('DeLille Cellars', 'Ciel du Cheval Vineyard Roussanne', 'Red Mountain, Washington, USA', 'Roussanne', 'White'),  -- https://delillecellars.com/collection/white-wines
  ('DeLille Cellars', 'Le Petit Doux', 'Red Mountain, Washington, USA', 'Sémillon, Sauvignon Blanc', 'Sweet'),  -- https://delillecellars.com/product/2022-le-petit-doux/
  ('DeLille Cellars', 'Rosé', 'Columbia Valley, Washington, USA', null, 'Rosé'),  -- https://delillecellars.com/collection/all-wines
  ('DeLille Cellars', 'Forget-Me-Not Blanc de Blancs', 'Columbia Valley, Washington, USA', null, 'Sparkling'),  -- https://delillecellars.com/collection/sparkling
  ('DeLille Cellars', 'Forget-Me-Not Sparkling Rosé', 'Columbia Valley, Washington, USA', null, 'Sparkling')  -- https://delillecellars.com/collection/sparkling
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOYENNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Doyenne', 'Red Blend', 'Columbia Valley, Washington, USA', 'Syrah, Cabernet Sauvignon, Mourvèdre', 'Red')  -- https://delillecellars.com/product/2023-doyenne-red-blend/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- K VINTNERS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('K Vintners', 'Motor City Kitty Syrah', 'Yakima Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.jamessuckling.com/wine-tasting-reports/washington-2025-tasting-report-winemaking-without-compromise
  ('K Vintners', 'The Boy Grenache', 'Walla Walla Valley, Washington, USA', 'Grenache', 'Red'),  -- https://www.jamessuckling.com/wine-tasting-reports/washington-2025-tasting-report-winemaking-without-compromise
  ('K Vintners', 'Powerline Vineyard Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.winespectator.com/wine/wine-detail/id/1325330/name/k-syrah-walla-walla-valley-powerline-vineyard-2022/guest
  ('K Vintners', 'The Beautiful Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red'),  -- https://creamwine.com/brand.php?id=122
  ('K Vintners', 'Art Den Hoed Vineyard Viognier', 'Yakima Valley, Washington, USA', 'Viognier', 'White'),  -- https://creamwine.com/brand.php?id=122
  ('K Vintners', 'The Creator', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://creamwine.com/brand.php?id=122
  ('K Vintners', 'Milbrandt Syrah', 'Wahluke Slope, Washington, USA', 'Syrah', 'Red'),  -- https://creamwine.com/brand.php?id=122
  ('K Vintners', 'Royal City Syrah', 'Royal Slope, Washington, USA', 'Syrah', 'Red'),  -- https://creamwine.com/brand.php?id=122
  ('K Vintners', 'The Deal Syrah', 'Wahluke Slope, Washington, USA', 'Syrah', 'Red'),  -- https://creamwine.com/brand.php?id=122
  ('K Vintners', 'Guido Sangiovese', 'Walla Walla Valley, Washington, USA', 'Sangiovese', 'Red'),  -- https://owenbargreen.com/blog/2024/9/11/k-vintners
  ('K Vintners', 'Cattle King Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://owenbargreen.com/blog/2024/9/11/k-vintners
  ('K Vintners', 'Jack''s Vineyard Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://owenbargreen.com/blog/2024/9/11/k-vintners
  ('K Vintners', 'Powerline Vineyard Viognier', 'Washington, USA', 'Viognier', 'White')  -- https://owenbargreen.com/blog/2024/9/11/k-vintners
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GRAMERCY CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Gramercy Cellars', 'Lagniappe Red Willow Vineyard Syrah', 'Columbia Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.winespectator.com/wine/wine-detail/id/1318358/name/gramercy-cellars-syrah-columbia-valley-lagniappe-red-willow-vineyard-2021/guest
  ('Gramercy Cellars', 'Lower East The Bowery Red Wine', 'Washington, USA', 'Syrah, Mourvèdre, Carignan, Grenache', 'Red'),  -- https://owenbargreen.com/blog/2024/2/6/gramercy-cellars
  ('Gramercy Cellars', 'Lower East Syrah', 'Columbia Valley, Washington, USA', 'Syrah', 'Red'),  -- https://owenbargreen.com/blog/2024/2/6/gramercy-cellars
  ('Gramercy Cellars', 'Lower East Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://owenbargreen.com/blog/2024/2/6/gramercy-cellars
  ('Gramercy Cellars', 'Forgotten Hills Vineyard Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://owenbargreen.com/blog/2024/2/6/gramercy-cellars
  ('Gramercy Cellars', 'Olsen Vineyard Mourvèdre', 'Yakima Valley, Washington, USA', 'Mourvèdre', 'Red'),  -- https://owenbargreen.com/blog/2024/2/6/gramercy-cellars
  ('Gramercy Cellars', 'John Lewis Reserve Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://owenbargreen.com/blog/2024/2/6/gramercy-cellars
  ('Gramercy Cellars', 'Gramercy Estates Red Wine', 'Washington, USA', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://owenbargreen.com/blog/2024/2/6/gramercy-cellars
  ('Gramercy Cellars', 'Estate Merlot', 'Walla Walla Valley, Washington, USA', 'Merlot', 'Red'),  -- https://owenbargreen.com/blog/2024/2/6/gramercy-cellars
  ('Gramercy Cellars', 'Reserve Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://owenbargreen.com/blog/2024/2/6/gramercy-cellars
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- REYNVAAN FAMILY VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Reynvaan Family Vineyards', 'Stonessence Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.reynvaanfamilyvineyards.com/wp-content/uploads/2025/10/2023TechSheets_StoneessanceSyrah.pdf
  ('Reynvaan Family Vineyards', 'In the Rocks Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah, Viognier', 'Red'),  -- https://www.reynvaanfamilyvineyards.com/wp-content/uploads/2025/10/2023TechSheets_InTheRocksSyrah.pdf
  ('Reynvaan Family Vineyards', 'The Contender Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah, Marsanne', 'Red'),  -- https://www.reynvaanfamilyvineyards.com/wp-content/uploads/2025/10/2023TechSheets_ContenderSyrah.pdf
  ('Reynvaan Family Vineyards', 'Foothills Reserve Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.reynvaanfamilyvineyards.com/wp-content/uploads/2025/10/2023TechSheets_FoothillsSyrah.pdf
  ('Reynvaan Family Vineyards', 'In the Hills Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah, Viognier', 'Red'),  -- https://www.reynvaanfamilyvineyards.com/wp-content/uploads/2025/10/2023TechSheets_InTheHillSyrah.pdf
  ('Reynvaan Family Vineyards', 'The Classic', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Cabernet Franc, Petit Verdot', 'Red'),  -- https://reynvaanfamilyvineyards.com/wp-content/uploads/2025/03/2021-The-Classic.pdf
  ('Reynvaan Family Vineyards', 'Merlot', 'Walla Walla Valley, Washington, USA', 'Merlot', 'Red'),  -- https://reynvaanfamilyvineyards.com/wp-content/uploads/2025/03/2021-Merlot.pdf
  ('Reynvaan Family Vineyards', 'In the Rocks Viognier', 'Walla Walla Valley, Washington, USA', 'Viognier', 'White'),  -- https://www.reynvaanfamilyvineyards.com/wp-content/uploads/2025/10/2023TechSheets_Viognier.pdf
  ('Reynvaan Family Vineyards', 'Grenache Blanc', 'Walla Walla Valley, Washington, USA', 'Grenache Blanc', 'White'),  -- https://www.reynvaanfamilyvineyards.com/wp-content/uploads/2025/10/2023TechSheets_GrenacheBlanc.pdf
  ('Reynvaan Family Vineyards', 'Queen''s Road White Blend', 'Walla Walla Valley, Washington, USA', 'Viognier, Marsanne', 'White')  -- https://www.reynvaanfamilyvineyards.com/wp-content/uploads/2025/10/2023TechSheets_WhiteBlend.pdf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- AVENNIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Avennia', 'Oliane Sauvignon Blanc', 'Yakima Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://owenbargreen.com/blog/2025/4/17/avennia
  ('Avennia', 'La Perle White Wine', 'Columbia Valley, Washington, USA', 'Roussanne, Marsanne', 'White'),  -- https://owenbargreen.com/blog/2025/4/17/avennia
  ('Avennia', 'L''Egerie Rosé', 'Washington, USA', 'Grenache, Mourvèdre', 'Rosé'),  -- https://owenbargreen.com/blog/2025/4/17/avennia
  ('Avennia', 'Estate Vineyard Red Wine', 'Red Mountain, Washington, USA', null, 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/avennia/usa/page/1/3/
  ('Avennia', 'Estate Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/avennia/usa/page/1/3/
  ('Avennia', 'Estate Cabernet Franc', 'Red Mountain, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/avennia/usa/page/1/3/
  ('Avennia', 'Valery', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.avennia.com/product/2023-valery/
  ('Avennia', 'Sestina Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.avennia.com/product/2023-sestina-cabernet-sauvignon/
  ('Avennia', 'Justine', 'Yakima Valley, Washington, USA', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://www.decanter.com/wine-reviews/usa/washington/avennia-justine-columbia-valley-yakima-valley-2023-102409/
  ('Avennia', 'Gravura', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon, Merlot, Cabernet Franc', 'Red'),  -- https://www.decanter.com/wine-reviews/usa/washington/avennia-gravura-columbia-valley-washington-usa-2021-82075/
  ('Avennia', 'Arnaut Boushey Vineyard Syrah', 'Yakima Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/avennia/usa/page/2/3/
  ('Avennia', 'Parapine Grenache', 'Columbia Valley, Washington, USA', 'Grenache', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/avennia/usa/page/1/3/
  ('Avennia', 'Champoux Vineyard Cabernet Franc', 'Horse Heaven Hills, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/avennia/usa/page/2/3/
  ('Avennia', 'Lydian GSM', 'Columbia Valley, Washington, USA', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://decanter.com/wine-reviews/usa/washington/avennia-lydian-gsm-columbia-valley-washington-usa-2021-77472
  ('Avennia', 'Lydian Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.avennia.com/product/2023-lydian-cabernet-sauvignon/
  ('Avennia', 'Red Mountain Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.avennia.com/product/2023-red-mountain-cabernet-sauvignon/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARK RYAN WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Mark Ryan Winery', 'Chardonnay', 'Yakima Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Viognier', 'Yakima Valley, Washington, USA', 'Viognier', 'White'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Sauvignon Blanc', 'Red Mountain, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Rosé', 'Washington, USA', null, 'Rosé'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'The Dissident', 'Washington, USA', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Long Haul', 'Washington, USA', 'Merlot', 'Red'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Dead Horse', 'Washington, USA', 'Cabernet Sauvignon, Merlot, Cabernet Franc', 'Red'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Little Sister', 'Washington, USA', 'Merlot, Petit Verdot', 'Red'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Monkey Wrench', 'Washington, USA', 'Cabernet Sauvignon, Malbec, Merlot', 'Red'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Lonely Heart', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Wild Eyed', 'Red Mountain, Washington, USA', 'Syrah', 'Red'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Lost Soul', 'Yakima Valley, Washington, USA', 'Syrah', 'Red'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Caballo Muerto', 'Red Mountain, Washington, USA', null, 'Red'),  -- https://www.markryanwinery.com/our-wines/mark-ryan
  ('Mark Ryan Winery', 'Crazy Mary', 'Washington, USA', 'Mourvèdre, Syrah', 'Red')  -- https://www.markryanwinery.com/our-wines/mark-ryan
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SLEIGHT OF HAND CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Sleight of Hand Cellars', 'Off He Goes Block 50 Les Collines Vineyard Syrah', 'Walla Walla Valley, Washington, USA', 'Syrah', 'Red'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'The Magician Evergreen Vineyard Riesling', 'Ancient Lakes, Washington, USA', 'Riesling', 'White'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'The Enchantress Chardonnay', 'Yakima Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'The Spellbinder Red Blend', 'Washington, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot, Petit Verdot', 'Red'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'The Conjurer Red Blend', 'Washington, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot', 'Red'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'The Archimage Reserve Bordeaux Blend', 'Washington, USA', 'Cabernet Franc, Merlot', 'Red'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'The Illusionist Reserve Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon, Cabernet Franc, Petit Verdot', 'Red'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'The Sorceress Grenache', 'Washington, USA', 'Grenache', 'Red'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'Levitation Reserve Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'The Psychedelic Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'Spiders from Mars Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://sofhcellars.orderport.net/wines/Current-Releases
  ('Sleight of Hand Cellars', 'The Flip Side Lewis Vineyard Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://sofhcellars.orderport.net/wines/library
  ('Sleight of Hand Cellars', 'Higher Ground WeatherEye Grenache', 'Washington, USA', 'Grenache', 'Red')  -- https://sofhcellars.orderport.net/wines/library
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ABEJA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Abeja', 'Washington State Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Walla Walla Valley Chardonnay', 'Walla Walla Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Walla Walla Valley Viognier', 'Walla Walla Valley, Washington, USA', 'Viognier', 'White'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Columbia Valley Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot', 'Red'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Walla Walla Valley Cabernet Franc', 'Walla Walla Valley, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Heather Hill Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Skysill Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Skysill Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://owenbargreen.com/blog/2025/10/24/abeja
  ('Abeja', 'Skysill Merlot', 'Washington, USA', 'Merlot', 'Red')  -- https://owenbargreen.com/blog/2025/10/24/abeja
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOUBLEBACK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Doubleback', 'Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Malbec', 'Red'),  -- https://doubleback.com/wines/cabernet-sauvignon/2023
  ('Doubleback', 'Estate Reserve', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Malbec, Petit Verdot', 'Red'),  -- https://doubleback.com/wines/estate-reserve/2023
  ('Doubleback', 'Merlot', 'Walla Walla Valley, Washington, USA', 'Merlot, Cabernet Franc', 'Red')  -- https://doubleback.com/wines/merlot/2023
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FIGGINS ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Figgins Estate', 'Estate Red Wine', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon, Merlot, Petit Verdot', 'Red'),  -- https://www.figginswine.com/2023-estate-red-wine
  ('Figgins Estate', 'Estate Riesling', 'Walla Walla Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.figginswine.com/2023-estate-riesling
  ('Figgins Estate', 'Figlia', 'Walla Walla Valley, Washington, USA', 'Merlot, Petit Verdot', 'Red'),  -- https://www.figginswine.com/2023-figlia
  ('Figgins Estate', 'The Caves Cabernet Sauvignon', 'Walla Walla Valley, Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://store.figginswine.com
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NOVELTY HILL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Novelty Hill', 'Oxbow', 'Washington, USA', 'Syrah, Grenache, Mourvèdre', 'Red'),  -- https://shop.noveltyhilljanuik.com/product-details/0519/novelty-hill-2022-oxbow
  ('Novelty Hill', 'Royal Slope Red', 'Royal Slope, Washington, USA', 'Cabernet Sauvignon, Merlot, Cabernet Franc, Malbec, Sangiovese', 'Red'),  -- https://shop.noveltyhilljanuik.com/product-details/0924/novelty-hill-2022-royal-slope-red
  ('Novelty Hill', 'Il Corvo', 'Washington, USA', 'Sangiovese, Cabernet Sauvignon, Merlot', 'Red'),  -- https://shop.noveltyhilljanuik.com/product-details/1042/novelty-hill-2023-il-corvo
  ('Novelty Hill', 'Maidenhair', 'Washington, USA', 'Sémillon, Sauvignon Blanc', 'White'),  -- https://shop.noveltyhilljanuik.com/product-details/1102/novelty-hill-2025-maidenhair
  ('Novelty Hill', 'Stillwater Creek Vineyard Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Stillwater Creek Vineyard Malbec', 'Washington, USA', 'Malbec', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Stillwater Creek Vineyard Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Stillwater Creek Vineyard Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Stillwater Creek Vineyard Late Harvest Semillon', 'Washington, USA', 'Semillon', 'Sweet'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Stillwater Creek Vineyard Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Stillwater Creek Vineyard Viognier', 'Washington, USA', 'Viognier', 'White'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Stillwater Creek Vineyard Grenache', 'Washington, USA', 'Grenache', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Columbia Valley Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Columbia Valley Syrah', 'Columbia Valley, Washington, USA', 'Syrah', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
  ('Novelty Hill', 'Columbia Valley Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White')  -- https://shop.noveltyhilljanuik.com/wines/Novelty-Hill
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JANUIK WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Januik Winery', 'Boushey Vineyard Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Weinbau Vineyard Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Weinbau Vineyard Cabernet Franc', 'Washington, USA', 'Cabernet Franc', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Boushey Vineyard Grenache', 'Washington, USA', 'Grenache', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Reserve Red', 'Washington, USA', null, 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Cerulean', 'Washington, USA', null, 'White'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Weinbau Vineyard Riesling', 'Washington, USA', 'Riesling', 'White'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Ciel du Cheval Vineyard Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Quintessence Vineyard Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Ciel du Cheval Vineyard Petit Verdot', 'Washington, USA', 'Petit Verdot', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Red Mountain Merlot', 'Red Mountain, Washington, USA', 'Merlot', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Columbia Valley Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Columbia Valley Red Wine', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://shop.noveltyhilljanuik.com/wines/Januik
  ('Januik Winery', 'Sagemoor Vineyards Sauvignon Blanc', 'Washington, USA', 'Sauvignon Blanc', 'White')  -- https://shop.noveltyhilljanuik.com/wines/Januik
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HEDGES FAMILY ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Hedges Family Estate', 'LitroVin', 'Red Mountain, Washington, USA', 'Merlot, Cabernet Sauvignon, Cabernet Franc, Syrah, Grenache, Counoise, Mourvèdre', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/1010/litrovin
  ('Hedges Family Estate', 'DLD Le Rosé', 'Red Mountain, Washington, USA', 'Syrah, Grenache, Counoise, Mourvèdre', 'Rosé'),  -- https://hedgesfamilyestate.orderport.net/product-details/1000/2025-dld-le-rose
  ('Hedges Family Estate', 'DLD Le Blanc', 'Red Mountain, Washington, USA', 'Marsanne, Viognier', 'White'),  -- https://hedgesfamilyestate.orderport.net/product-details/1001/2024-dld-le-blanc
  ('Hedges Family Estate', 'Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon, Merlot, Syrah, Malbec, Petit Verdot', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/0920/2022-hedges-family-estate-cabernet-sauvignon
  ('Hedges Family Estate', 'Red Mountain', 'Red Mountain, Washington, USA', null, 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/1015/2023-hedges-family-estate-red-mountain
  ('Hedges Family Estate', 'DLD Syrah', 'Red Mountain, Washington, USA', 'Syrah', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/1002/2023-dld-syrah
  ('Hedges Family Estate', 'Limited Cabernet Franc', 'Red Mountain, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/1005/2023-hedges-limited-cabernet-franc
  ('Hedges Family Estate', 'Goedhart Family Syrah', 'Red Mountain, Washington, USA', 'Syrah', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/0772/2021-goedhart-family-syrah
  ('Hedges Family Estate', 'La Haute Cuvée', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon, Petit Verdot, Merlot', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/0586/2019-la-haute-cuvee
  ('Hedges Family Estate', 'Bio Syrah', 'Red Mountain, Washington, USA', 'Syrah', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/0511/2019-hedges-family-estate-bio-syrah
  ('Hedges Family Estate', 'Single Vineyard Limited Tinta Cao', 'Red Mountain, Washington, USA', 'Tinta Cão', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/0730/2019-single-vineyard-limited-tinta-cao
  ('Hedges Family Estate', 'Single Vineyard Limited Souzao - Tinta Cao', 'Red Mountain, Washington, USA', 'Souzão, Tinta Cão', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/0453/2018-single-vineyard-limited-souzao--tinta-cao
  ('Hedges Family Estate', 'Single Vineyard Limited Merlot', 'Red Mountain, Washington, USA', 'Merlot', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/0595/2017-single-vineyard-limited-merlot
  ('Hedges Family Estate', 'CMS Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://hedgesfamilyestate.orderport.net/product-details/0996/2025-cms-sauvignon-blanc
  ('Hedges Family Estate', 'CMS Red', 'Columbia Valley, Washington, USA', 'Merlot, Cabernet Sauvignon, Syrah', 'Red'),  -- https://hedgesfamilyestate.orderport.net/product-details/0688/2021-cms-red
  ('Hedges Family Estate', 'CMS Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://hedgesfamilyestate.orderport.net/product-details/0894/2022-cms-cabernet-sauvignon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SPARKMAN CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Sparkman Cellars', 'Kingpin Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1233/2021-kingpin-cabernet-sauvignon
  ('Sparkman Cellars', 'Holler Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon, Merlot, Malbec, Petit Verdot, Cabernet Franc', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1326/2022-holler-cabernet-sauvignon
  ('Sparkman Cellars', 'Gaga Touriga Nacional Blend', 'Yakima Valley, Washington, USA', 'Touriga Nacional, Petite Sirah', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1344/2022-gaga-touriga-nacional-blend
  ('Sparkman Cellars', 'Baba Sangiovese Blend', 'Yakima Valley, Washington, USA', 'Sangiovese, Cabernet Sauvignon', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1345/2022-baba-sangiovese-blend
  ('Sparkman Cellars', 'Evermore Old Vines Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1361/2022-evermore-old-vines-cabernet-sauvignon
  ('Sparkman Cellars', 'Ruby Leigh Merlot Blend', 'Columbia Valley, Washington, USA', 'Merlot, Cabernet Franc, Malbec', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1363/2022-ruby-leigh-merlot-blend
  ('Sparkman Cellars', 'Darkness Syrah', 'Yakima Valley, Washington, USA', 'Syrah', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1458/2023-darkness-syrah
  ('Sparkman Cellars', 'Preposterous Malbec', 'Columbia Valley, Washington, USA', 'Malbec, Syrah', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1480/2023-preposterous-malbec
  ('Sparkman Cellars', 'Rainmaker Cabernet Sauvignon', 'Yakima Valley, Washington, USA', 'Cabernet Sauvignon, Malbec', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1494/2023-rainmaker-cabernet-sauvignon
  ('Sparkman Cellars', 'Outlaw Merlot', 'Columbia Valley, Washington, USA', 'Merlot, Cabernet Sauvignon', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1495/2023-outlaw-merlot
  ('Sparkman Cellars', 'Hallelujah Port', 'Snipes Mountain, Washington, USA', 'Touriga Nacional, Souzão', 'Fortified'),  -- https://sparkmancellars.orderport.net/product-details/1074/2019-hallelujah-port
  ('Sparkman Cellars', 'Ruckus Syrah Blend', 'Red Mountain, Washington, USA', 'Syrah, Cabernet Sauvignon', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1316/2022-ruckus-syrah-blend
  ('Sparkman Cellars', 'Underworld Petit Verdot', 'Columbia Valley, Washington, USA', 'Petit Verdot, Cabernet Sauvignon', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1346/2022-underworld-petit-verdot
  ('Sparkman Cellars', 'Stella Mae Cabernet Sauvignon Blend', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon, Malbec', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1364/2022-stella-mae-cabernet-sauvignon-blend
  ('Sparkman Cellars', 'Greater Than Some GSM', 'Yakima Valley, Washington, USA', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1457/2023-greater-than-some-gsm
  ('Sparkman Cellars', 'Wonderland Grenache', 'Columbia Valley, Washington, USA', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1459/2023-wonderland-grenache
  ('Sparkman Cellars', 'Untamed Syrah', 'Columbia Valley, Washington, USA', 'Syrah', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1470/2023-untamed-syrah
  ('Sparkman Cellars', 'Wilderness Red Blend', 'Columbia Valley, Washington, USA', 'Syrah, Petite Sirah, Sangiovese, Touriga Nacional, Mourvèdre, Grenache, Souzão', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1479/2023-wilderness-red-blend
  ('Sparkman Cellars', 'Black Dragon', 'Columbia Valley, Washington, USA', 'Malbec, Petit Verdot, Cabernet Sauvignon, Merlot', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1496/2023-black-dragon
  ('Sparkman Cellars', 'Yonder Cabernet Franc', 'Columbia Valley, Washington, USA', 'Cabernet Franc, Merlot', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1498/2023-yonder-cabernet-franc
  ('Sparkman Cellars', 'En Theos Cabernet Sauvignon', 'Royal Slope, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1168/2020-en-theos-cabernet-sauvignon
  ('Sparkman Cellars', 'as you wish Old Vines Sauvignon Blanc', 'White Bluffs, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://sparkmancellars.orderport.net/product-details/1772/2025-as-you-wish-old-vines-sauvignon-blanc
  ('Sparkman Cellars', 'Pearl Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://sparkmancellars.orderport.net/product-details/1598/2025-pearl-sauvignon-blanc
  ('Sparkman Cellars', 'this old porch rosé', 'Columbia Valley, Washington, USA', 'Syrah, Cabernet Sauvignon, Malbec, Sangiovese', 'Rosé'),  -- https://sparkmancellars.orderport.net/product-details/1657/2025-this-old-porch-rose
  ('Sparkman Cellars', 'Lumière Chardonnay', 'Royal Slope, Washington, USA', 'Chardonnay', 'White'),  -- https://sparkmancellars.orderport.net/product-details/1658/2024-lumiere-chardonnay
  ('Sparkman Cellars', 'Apparition Rhône Blend', 'Yakima Valley, Washington, USA', 'Roussanne, Grenache Blanc, Marsanne', 'White'),  -- https://sparkmancellars.orderport.net/product-details/1659/2025-apparition-rhone-blend
  ('Sparkman Cellars', 'Kindred Red Blend', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon, Malbec, Merlot, Syrah, Petit Verdot, Cabernet Franc, Petite Sirah, Grenache, Touriga Nacional', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1442/2022-kindred-red-blend
  ('Sparkman Cellars', 'Kindred Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon, Petit Verdot, Malbec', 'Red'),  -- https://sparkmancellars.orderport.net/product-details/1481/2023-kindred-cabernet-sauvignon
  ('Sparkman Cellars', 'Kindred Malbec', 'Columbia Valley, Washington, USA', 'Malbec, Merlot', 'Red')  -- https://sparkmancellars.orderport.net/product-details/1613/2024-kindred-malbec-750ml
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CADENCE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Cadence', 'Bel Canto', 'Washington, USA', 'Cabernet Franc, Merlot', 'Red'),  -- https://cadencewinery.com/wines/bel-canto-2023/
  ('Cadence', 'Camerata', 'Washington, USA', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://cadencewinery.com/wines/camerata-2023/
  ('Cadence', 'Tapteil', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot', 'Red'),  -- https://cadencewinery.com/wines/tapteil-2019/
  ('Cadence', 'Ciel du Cheval', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot, Petit Verdot', 'Red'),  -- https://cadencewinery.com/wines/ciel-du-cheval-2018/
  ('Cadence', 'Coda', 'Washington, USA', 'Petit Verdot, Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://cadencewinery.com/wines/coda-2024/
  ('Cadence', 'Coda Rosé', 'Washington, USA', 'Petit Verdot, Cabernet Sauvignon', 'Rosé'),  -- https://cadencewinery.com/wines/coda-rose-2025/
  ('Cadence', 'Cara Mia Vineyard Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://store.nexternal.com/cadence/defaultredirect.aspx
  ('Cadence', 'Cara Mia Vineyard Petit Verdot', 'Washington, USA', 'Petit Verdot', 'Red'),  -- https://store.nexternal.com/cadence/defaultredirect.aspx
  ('Cadence', 'Cara Mia Vineyard Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://store.nexternal.com/cadence/defaultredirect.aspx
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- OWEN ROE WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_washington.sql)'
from (values
  ('Owen Roe Winery', 'Yakima Valley Cabernet Sauvignon', 'Yakima Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://creamwine.com/product.php?id=22210
  ('Owen Roe Winery', 'Rosa Mystica Cabernet Franc', 'Yakima Valley, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://creamwine.com/brand.php?id=165
  ('Owen Roe Winery', 'Abbot''s Table', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://creamwine.com/brand.php?id=165
  ('Owen Roe Winery', 'Yakima Valley Red', 'Yakima Valley, Washington, USA', null, 'Red'),  -- https://creamwine.com/brand.php?id=165
  ('Owen Roe Winery', 'Sinister Hand', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://creamwine.com/brand.php?id=165
  ('Owen Roe Winery', 'Ex Umbris Syrah', 'Yakima Valley, Washington, USA', 'Syrah', 'Red')  -- https://creamwine.com/brand.php?id=165
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
