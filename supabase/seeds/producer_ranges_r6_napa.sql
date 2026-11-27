-- Producer ranges round 6: Napa. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- DUCKHORN VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Duckhorn Vineyards', 'The Discussion Napa Valley Red Wine', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Merlot Three Palms Vineyard', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Sauvignon Monitor Ledge Vineyard', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Sauvignon Patzimaro Vineyard', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Rutherford Napa Valley Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Howell Mountain Napa Valley Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Carneros Napa Valley Merlot', 'Carneros, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Oakville Napa Valley Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Merlot Rector Creek Vineyard', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Sauvignon Rector Creek Vineyard', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Stags Leap District Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Merlot Stout Vineyard', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Sauvignon Three Palms Vineyard', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/wines
  ('Duckhorn Vineyards', 'Napa Valley Blanc de Blancs Sparkling Wine', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.duckhorn.com/collections/duckhorn-vineyards-current-release
  ('Duckhorn Vineyards', 'Napa Valley Legacy Blanc', 'Napa Valley, California, USA', null, 'White'),  -- https://www.duckhorn.com/collections/duckhorn-vineyards-current-release
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Sauvignon Cork Tree Vineyard', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/collections/duckhorn-vineyards-current-release
  ('Duckhorn Vineyards', 'Napa Valley Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/collections/duckhorn-vineyards-current-release
  ('Duckhorn Vineyards', 'Napa Valley Merlot Three Palms Vineyard Block 5', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/collections/duckhorn-vineyards-current-release
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Sauvignon To Kalon Vineyard', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/collections/duckhorn-vineyards-current-release
  ('Duckhorn Vineyards', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.duckhorn.com/collections/duckhorn-vineyards-chardonnay
  ('Duckhorn Vineyards', 'Napa Valley Carneros Chardonnay Huichica Hills Vineyard', 'Carneros, California, USA', 'Chardonnay', 'White')  -- https://www.duckhorn.com/collections/duckhorn-vineyards-chardonnay
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAYMUS VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Caymus Vineyards', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.caymus.com/
  ('Caymus Vineyards', 'Special Selection Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.caymus.com/
  ('Caymus Vineyards', 'Butala Vineyard Zinfandel', 'St. Helena, Napa Valley, California, USA', 'Zinfandel', 'Red')  -- https://www.napawineproject.com/caymus-vineyards/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STAG'S LEAP WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Stag''s Leap Wine Cellars', 'FAY Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.stagsleapwinecellars.com/acquire/
  ('Stag''s Leap Wine Cellars', 'CASK 23 Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.stagsleapwinecellars.com/acquire/
  ('Stag''s Leap Wine Cellars', 'ARTEMIS Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.stagsleapwinecellars.com/acquire/
  ('Stag''s Leap Wine Cellars', 'KARIA Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.stagsleapwinecellars.com/acquire/
  ('Stag''s Leap Wine Cellars', 'AVETA Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.stagsleapwinecellars.com/acquire/
  ('Stag''s Leap Wine Cellars', 'FAY APOLOGUE Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.stagsleapwinecellars.com/acquire/
  ('Stag''s Leap Wine Cellars', 'S.L.V. Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/stags-leap-wine-cellars/
  ('Stag''s Leap Wine Cellars', 'Rancho Chimiles Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/stags-leap-wine-cellars/
  ('Stag''s Leap Wine Cellars', 'Arcadia Vineyard Chardonnay', 'Coombsville, Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.napawineproject.com/stags-leap-wine-cellars/
  ('Stag''s Leap Wine Cellars', 'FAY Hillside Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.napawineproject.com/stags-leap-wine-cellars/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SILVER OAK CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Silver Oak Cellars', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.silveroak.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BERINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Beringer', 'Private Reserve Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.beringer.com/pages/discover-vineyard
  ('Beringer', 'Private Reserve Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.napawineproject.com/beringer-vineyards/
  ('Beringer', 'Luminus Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.treasurywineshop.com/
  ('Beringer', 'Steinhauer Ranch Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.treasurywineshop.com/
  ('Beringer', 'Bancroft Ranch Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.treasurywineshop.com/
  ('Beringer', 'Chabot Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.treasurywineshop.com/
  ('Beringer', 'Q Napa Valley Red Blend', 'Napa Valley, California, USA', null, 'Red')  -- https://www.treasurywineshop.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STAG'S LEAP WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Stag''s Leap Winery', 'Napa Valley Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/stags-leap-winery
  ('Stag''s Leap Winery', 'Napa Valley Viognier', 'Napa Valley, California, USA', 'Viognier', 'White'),  -- https://www.napawineproject.com/stags-leap-winery
  ('Stag''s Leap Winery', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.napawineproject.com/stags-leap-winery
  ('Stag''s Leap Winery', 'Ne Cede Malis Estate Petite Sirah', 'Napa Valley, California, USA', 'Petite Sirah', 'Red'),  -- https://www.napawineproject.com/stags-leap-winery
  ('Stag''s Leap Winery', 'Limited Edition Reserve Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/stags-leap-winery
  ('Stag''s Leap Winery', 'The Leap Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/stags-leap-winery
  ('Stag''s Leap Winery', 'Napa Valley Petite Sirah', 'Napa Valley, California, USA', 'Petite Sirah', 'Red'),  -- https://www.treasurywineshop.com/
  ('Stag''s Leap Winery', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.treasurywineshop.com/
  ('Stag''s Leap Winery', 'The Investor Napa Valley Red Wine', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.treasurywineshop.com/
  ('Stag''s Leap Winery', 'Audentia Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.treasurywineshop.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROBERT MONDAVI WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Robert Mondavi Winery', 'The Reserve Cabernet Sauvignon, To Kalon Vineyard', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Reserve Heritage Clone Cabernet Sauvignon, To Kalon Vineyard', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Reserve Cabernet Franc, To Kalon Vineyard', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Reserve Merlot, To Kalon Vineyard', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Reserve Red Blend, To Kalon Vineyard', 'Napa Valley, California, USA', null, 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'To Kalon Reserve Fumé Blanc', 'Napa Valley, California, USA', null, 'White'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Estates Cabernet Sauvignon, Oakville', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Estates Red Wine, Oakville', 'Oakville, Napa Valley, California, USA', null, 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Estates Cabernet Sauvignon, Stags'' Leap District', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Estates Sparkling Wine', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'Napa Valley Red Blend', 'Napa Valley, California, USA', null, 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'Napa Valley Rosé', 'Napa Valley, California, USA', null, 'Rosé'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'Ode to Soul Proprietary Red Wine', 'Napa Valley, California, USA', null, 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'Stags Leap District Sauvignon Blanc', 'Stags Leap District, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/robert-mondavi-winery/
  ('Robert Mondavi Winery', 'Napa Valley Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/robert-mondavi-winery/
  ('Robert Mondavi Winery', 'To Kalon Vineyard I Block Fumé Blanc', 'Oakville, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/robert-mondavi-winery/
  ('Robert Mondavi Winery', 'Fumé Blanc, Oakville', 'Oakville, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/robert-mondavi-winery/
  ('Robert Mondavi Winery', 'To Kalon Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/robert-mondavi-winery/
  ('Robert Mondavi Winery', 'Cabernet Sauvignon, St. Helena', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/robert-mondavi-winery/
  ('Robert Mondavi Winery', 'W.H. Vineyard Cabernet Sauvignon, Stags Leap District', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/robert-mondavi-winery/
  ('Robert Mondavi Winery', 'Reserve Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.napawineproject.com/robert-mondavi-winery/
  ('Robert Mondavi Winery', 'Moscato d''Oro', 'Napa Valley, California, USA', 'Muscat Canelli', 'Sweet'),  -- https://vinovoss.com/wine/robert-mondavi-moscato-d-oro
  ('Robert Mondavi Winery', '60th Anniversary Commemorative Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://robertmondaviwinery.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAKEBREAD CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Cakebread Cellars', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Benchland Select Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Dancing Bear Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Suscol Springs Syrah', 'Napa Valley, California, USA', 'Syrah', 'Red'),  -- https://www.cakebread.com/product/2023-syrah-suscol-springs/
  ('Cakebread Cellars', 'Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.cakebread.com/product/2024-cabernet-franc/
  ('Cakebread Cellars', 'Viewfinder Suscol Mountain Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.cakebread.com/product/2022-merlot/
  ('Cakebread Cellars', 'Vaca Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Vine Hill Ranch Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Suscol Springs Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Cuttings Wharf Vineyard Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.cakebread.com/collection/white-wine/
  ('Cakebread Cellars', 'Chardonnay Reserve', 'Carneros, Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.cakebread.com/collection/white-wine/
  ('Cakebread Cellars', 'Tinsley Vineyard Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.cakebread.com/product/2024-tinsley-vineyard-chardonnay-carneros/
  ('Cakebread Cellars', 'Sauvignon Blanc Reserve', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.cakebread.com/product/2025-sauvignon-blanc-reserve/
  ('Cakebread Cellars', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White')  -- https://www.cakebread.com/collection/white-wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FROG'S LEAP WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Frog''s Leap Winery', 'Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://frogsleap.com/the-wines-of-frogs-leap/
  ('Frog''s Leap Winery', 'Sauvignon Blanc', 'Rutherford, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://frogsleap.com/the-wines-of-frogs-leap/sauvignon-blanc/
  ('Frog''s Leap Winery', 'Shale and Stone Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://frogsleap.com/the-wines-of-frogs-leap/
  ('Frog''s Leap Winery', 'Merlot', 'Rutherford, Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://frogsleap.com/the-wines-of-frogs-leap/merlot/
  ('Frog''s Leap Winery', 'Williams Rossi Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://frogsleap.com/the-wines-of-frogs-leap/
  ('Frog''s Leap Winery', 'Williams Rossi Merlot', 'Rutherford, Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://frogsleap.com/the-wines-of-frogs-leap/
  ('Frog''s Leap Winery', 'Sauvignon Blanc Concrete Aged', 'Rutherford, Napa Valley, California, USA', 'Sauvignon Blanc', 'White')  -- https://www.frogsleap.com/the-wines-of-frogs-leap/evergreen-pdp-sauvignon-blanc-concrete-aged/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHATEAU MONTELENA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Chateau Montelena', 'Estate Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://montelena.com/wine/2022-montelena-estate-cabernet-sauvignon-750ml/
  ('Chateau Montelena', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.montelena.com/wines
  ('Chateau Montelena', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.montelena.com/wines
  ('Chateau Montelena', 'Estate Zinfandel', 'Napa Valley, California, USA', 'Zinfandel', 'Red'),  -- https://montelena.com/wine/2023-estate-zinfandel/
  ('Chateau Montelena', 'Napa Valley Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.montelena.com/wines
  ('Chateau Montelena', 'Calistoga Petite Sirah', 'Calistoga, Napa Valley, California, USA', 'Petite Sirah', 'Red')  -- https://montelena.com/shop/member-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JOSEPH PHELPS VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Joseph Phelps Vineyards', 'Insignia', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.josephphelps.com/wp-content/uploads/2025/07/2022-Insignia-Tech-Sheet.pdf
  ('Joseph Phelps Vineyards', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.josephphelps.com/wp-content/uploads/2025/02/2022-Phelps-Cabernet-Sauvignon.pdf
  ('Joseph Phelps Vineyards', 'Delice', 'St. Helena, Napa Valley, California, USA', 'Scheurebe', 'Sweet'),  -- https://www.josephphelps.com/wp-content/uploads/2025/01/2021-Delice.pdf
  ('Joseph Phelps Vineyards', 'Larry Hyde & Sons Vineyard Syrah', 'Napa Valley, California, USA', 'Syrah', 'Red'),  -- https://www.josephphelps.com/wp-content/uploads/2025/01/2021-LHS-Syrah-1.pdf
  ('Joseph Phelps Vineyards', 'Sauvignon Blanc', 'St. Helena, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.josephphelps.com/wp-content/uploads/2025/01/2023-Sauvignon-Blanc.pdf
  ('Joseph Phelps Vineyards', 'Viognier', 'Napa Valley, California, USA', 'Viognier', 'White')  -- https://www.josephphelps.com/wp-content/uploads/2025/01/2023-Viognier.pdf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FAR NIENTE WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Far Niente Winery', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2023-far-niente-cabernet-sauvignon-napa-valley
  ('Far Niente Winery', 'Oakville Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2023-far-niente-cabernet-sauvignon-oakville
  ('Far Niente Winery', 'Benson Vale Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2022-far-niente-benson-vale-cabernet-sauvignon-oakville-bottle
  ('Far Niente Winery', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://farniente.com/shop/wines/2024-far-niente-napa-valley-chardonnay
  ('Far Niente Winery', 'Napa Valley Cave Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2021-far-niente-napa-valley-cave-cabernet-sauvignon
  ('Far Niente Winery', 'Dolce', 'Napa Valley, California, USA', null, 'Sweet')  -- https://farniente.com/shop/wines/2021-dolce-napa-valley
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NICKEL & NICKEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Nickel & Nickel', 'C.C. Ranch Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2022-nickel-and-nickel-c-c-ranch-cabernet-sauvignon-rutherford
  ('Nickel & Nickel', 'DeCarle Vineyard Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2022-nickel-and-nickel-decarle-vineyard-cabernet-sauvignon-rutherford
  ('Nickel & Nickel', 'Fog Break Vineyard Cabernet Sauvignon', 'Atlas Peak, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2022-nickel-and-nickel-fog-break-vineyard-cabernet-sauvignon-atlas-peak
  ('Nickel & Nickel', 'Hawk''s Cradle Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2022-nickel-and-nickel-hawk-s-cradle-cabernet-sauvignon-howell-mountain
  ('Nickel & Nickel', 'Pellet Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2023-nickel-and-nickel-pellet-vineyard-cabernet-sauvignon-st-helena
  ('Nickel & Nickel', 'Quicksilver Vineyard Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2022-nickel-and-nickel-quicksilver-vineyard-cabernet-sauvignon-rutherford
  ('Nickel & Nickel', 'State Ranch Cabernet Sauvignon', 'Yountville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2023-nickel-and-nickel-state-ranch-cabernet-sauvignon-yountville
  ('Nickel & Nickel', 'Vaca Vista Vineyard Cabernet Sauvignon', 'Oak Knoll District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2022-nickel-and-nickel-vaca-vista-vineyard-cabernet-sauvignon-oak-knoll-district
  ('Nickel & Nickel', 'Bear Track Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2023-nickel-and-nickel-bear-track-cabernet-sauvignon-napa-valley
  ('Nickel & Nickel', 'John C. Sullenger Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2023-nickel-and-nickel-john-c-sullenger-vineyard-cabernet-sauvignon-oakville
  ('Nickel & Nickel', 'Martin Stelling Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2023-nickel-and-nickel-martin-stelling-vineyard-cabernet-sauvignon-oakville
  ('Nickel & Nickel', 'Mina Vineyard Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2023-nickel-and-nickel-mina-vineyard-cabernet-sauvignon-diamond-mountain
  ('Nickel & Nickel', 'Starling Crossing Vineyard Merlot', 'Oak Knoll District, Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://farniente.com/shop/wines/2023-nickel-and-nickel-starling-crossing-vineyard-merlot-oak-knoll
  ('Nickel & Nickel', 'Branding Iron Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://farniente.com/shop/wines/2017-nickel-nickel-branding-iron-cabernet-sauvignon-oakville
  ('Nickel & Nickel', 'Grand Sky Vineyard Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://farniente.com/shop/wines/2024-nickel-nickel-grand-sky-vineyard-chardonnay-carneros
  ('Nickel & Nickel', 'Truchard Vineyard Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White')  -- https://farniente.com/shop/wines/2024-nickel-nickel-truchard-vineyard-chardonnay-carneros-12c
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOUIS M. MARTINI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Louis M. Martini', 'Cypress Ranch Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.louismartini.com/product/2021-cypress-vineyard-cabernet-sauvignon/
  ('Louis M. Martini', 'Mount Veeder Cabernet Sauvignon', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.louismartini.com/collection/shop-current-releases/
  ('Louis M. Martini', 'Stagecoach Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.louismartini.com/product/2021-stagecoach-vineyard-cabernet-sauvignon/
  ('Louis M. Martini', 'Lot No. 1 Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.louismartini.com/product/2021-lot-no-1-cabernet-sauvignon/
  ('Louis M. Martini', 'Napa Valley Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.louismartini.com/collection/shop-current-releases/
  ('Louis M. Martini', 'Napa Valley Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.louismartini.com/collection/shop-current-releases/
  ('Louis M. Martini', 'The Gryphon Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.louismartini.com/collection/shop-current-releases/
  ('Louis M. Martini', 'Howell Mountain Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.louismartini.com/collection/shop-current-releases/
  ('Louis M. Martini', 'Napa Valley Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.louismartini.com/collection/shop-current-releases/
  ('Louis M. Martini', 'Coombsville Cabernet Sauvignon', 'Coombsville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.louismartini.com/collection/club-only-wines/
  ('Louis M. Martini', 'Cellar No. 254 Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.louismartini.com/product/2021-cellar-no-254-merlot/
  ('Louis M. Martini', 'Cellar No. 254 Mountain Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.louismartini.com/product/2020-cellar-no-254-mountain-cabernet-sauvignon/
  ('Louis M. Martini', 'Cellar No. 254 Petite Sirah', 'Napa Valley, California, USA', 'Petite Sirah', 'Red')  -- https://www.louismartini.com/product/2022-cellar-no-254-petite-sirah/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STERLING ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Sterling', 'Reserve Calistoga Cabernet Sauvignon', 'Calistoga, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.sterlingvineyards.com/
  ('Sterling', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.sterlingvineyards.com/
  ('Sterling', 'Calistoga Petite Sirah', 'Calistoga, Napa Valley, California, USA', 'Petite Sirah', 'Red'),  -- https://www.sterlingvineyards.com/
  ('Sterling', 'Reserve Yountville Cabernet Sauvignon', 'Yountville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.sterlingvineyards.com/
  ('Sterling', 'Reserve Diamond Mountain District Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.sterlingvineyards.com/
  ('Sterling', 'Yates Family Vineyard Cabernet Sauvignon', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.sterlingvineyards.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GRGICH HILLS ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Grgich Hills Estate', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://grgich.com/wines/napa-valley-selections/
  ('Grgich Hills Estate', 'Napa Valley Zinfandel', 'Napa Valley, California, USA', 'Zinfandel', 'Red'),  -- https://grgich.com/wines/napa-valley-selections/
  ('Grgich Hills Estate', 'Napa Valley Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://grgich.com/wines/napa-valley-selections/
  ('Grgich Hills Estate', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://grgich.com/wines/napa-valley-selections/
  ('Grgich Hills Estate', 'Napa Valley Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://grgich.com/wines/napa-valley-selections/
  ('Grgich Hills Estate', 'Miljenko''s Selection Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://grgich.com/wines/miljenkos-selections/
  ('Grgich Hills Estate', 'Miljenko''s Selection Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://grgich.com/wines/miljenkos-selections/
  ('Grgich Hills Estate', 'Miljenko''s Selection Petit Verdot', 'Napa Valley, California, USA', 'Petit Verdot', 'Red'),  -- https://grgich.com/wines/miljenkos-selections/
  ('Grgich Hills Estate', 'Miljenko''s Selection Petite Sirah', 'Napa Valley, California, USA', 'Petite Sirah', 'Red'),  -- https://grgich.com/wines/miljenkos-selections/
  ('Grgich Hills Estate', 'Miljenko''s Selection Rosé', 'Napa Valley, California, USA', null, 'Rosé'),  -- https://grgich.com/wines/miljenkos-selections/
  ('Grgich Hills Estate', 'Miljenko''s Selection Gewürztraminer', 'Napa Valley, California, USA', 'Gewürztraminer', 'White'),  -- https://grgich.com/wines/miljenkos-selections/
  ('Grgich Hills Estate', 'Miljenko''s Selection Riesling', 'Napa Valley, California, USA', 'Riesling', 'White'),  -- https://grgich.com/wines/miljenkos-selections/
  ('Grgich Hills Estate', 'Miljenko''s Selection Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://grgich.com/wines/miljenkos-selections/
  ('Grgich Hills Estate', 'Miljenko''s Selection Skin Fermented Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'Orange'),  -- https://grgich.com/wines/miljenkos-selections/
  ('Grgich Hills Estate', 'Paradise Block Cabernet Sauvignon', 'Yountville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://grgich.com/wines/legacy-selections/
  ('Grgich Hills Estate', 'Paris ''76 Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://grgich.com/wines/legacy-selections/
  ('Grgich Hills Estate', 'Napa Valley Essence Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://grgich.com/wines/legacy-selections/
  ('Grgich Hills Estate', 'Miljenko''s Old Vine Zinfandel', 'Napa Valley, California, USA', 'Zinfandel', 'Red'),  -- https://grgich.com/wines/legacy-selections/
  ('Grgich Hills Estate', 'Violetta Late Harvest', 'Napa Valley, California, USA', null, 'Sweet')  -- https://grgich.com/wines/legacy-selections/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SHAFER VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Shafer Vineyards', 'Hillside Select Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.shafervineyards.com/wines/hillside-select
  ('Shafer Vineyards', 'One Point Five Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.shafervineyards.com/wines/one-point-five
  ('Shafer Vineyards', 'Relentless', 'Napa Valley, California, USA', 'Syrah, Petite Sirah', 'Red'),  -- https://www.shafervineyards.com/wines/relentless
  ('Shafer Vineyards', 'Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.shafervineyards.com/wines/merlot
  ('Shafer Vineyards', 'TD-9', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Merlot, Malbec, Petit Verdot', 'Red'),  -- https://www.shafervineyards.com/wines/td-9
  ('Shafer Vineyards', 'Red Shoulder Ranch Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.shafervineyards.com/wines/red-shoulder-ranch
  ('Shafer Vineyards', 'Sauvignon Blanc', 'Carneros, California, USA', 'Sauvignon Blanc', 'White')  -- https://www.shafervineyards.com/wines/sauvignon-blanc
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HEITZ WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Heitz Wine Cellars', 'Martha''s Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://heitzcellar.com/purchase/
  ('Heitz Wine Cellars', 'Trailside Vineyard Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://heitzcellar.com/purchase/
  ('Heitz Wine Cellars', 'Linda Falls Vineyard Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://heitzcellar.com/purchase/
  ('Heitz Wine Cellars', 'Lot C-91 Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://heitzcellar.com/purchase/
  ('Heitz Wine Cellars', 'Bella Oaks Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://heitzcellar.com/vintages/
  ('Heitz Wine Cellars', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://heitzcellar.com/vintages/
  ('Heitz Wine Cellars', 'Fay Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://heitzcellar.com/vintages/
  ('Heitz Wine Cellars', 'Quartz Creek Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://heitzcellar.com/vintages/
  ('Heitz Wine Cellars', 'Lot C-91 Blanc', 'Napa Valley, California, USA', null, 'White')  -- https://heitzcellar.com/vintages/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TREFETHEN FAMILY VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Trefethen Family Vineyards', 'Dry Riesling', 'Oak Knoll District, Napa Valley, California, USA', 'Riesling', 'White'),  -- https://www.trefethen.com/wp-content/uploads/2026/05/Current-Vintage-Core-Wines-5.4.26.pdf
  ('Trefethen Family Vineyards', 'Chardonnay', 'Oak Knoll District, Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.trefethen.com/wp-content/uploads/2026/05/Current-Vintage-Core-Wines-5.4.26.pdf
  ('Trefethen Family Vineyards', 'Merlot', 'Oak Knoll District, Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.trefethen.com/wp-content/uploads/2026/05/Current-Vintage-Core-Wines-5.4.26.pdf
  ('Trefethen Family Vineyards', 'Cabernet Sauvignon', 'Oak Knoll District, Napa Valley, California, USA', 'Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://www.trefethen.com/wp-content/uploads/2026/05/Current-Vintage-Core-Wines-5.4.26.pdf
  ('Trefethen Family Vineyards', 'Dragon''s Tooth', 'Oak Knoll District, Napa Valley, California, USA', 'Malbec, Petit Verdot, Cabernet Sauvignon', 'Red'),  -- https://www.trefethen.com/wp-content/uploads/2026/05/Current-Vintage-Core-Wines-5.4.26.pdf
  ('Trefethen Family Vineyards', 'HāLo Cabernet Sauvignon', 'Oak Knoll District, Napa Valley, California, USA', 'Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://www.trefethen.com/wp-content/uploads/2026/05/Current-Vintage-Core-Wines-5.4.26.pdf
  ('Trefethen Family Vineyards', 'Reserve Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.trefethen.com/winecategory/small-lot-wines/
  ('Trefethen Family Vineyards', 'Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.trefethen.com/winecategory/small-lot-wines/
  ('Trefethen Family Vineyards', 'S.I.N. Rosé', 'Napa Valley, California, USA', null, 'Rosé'),  -- https://www.trefethen.com/winecategory/small-lot-wines/
  ('Trefethen Family Vineyards', 'Pinot Noir', 'Napa Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.trefethen.com/winecategory/small-lot-wines/
  ('Trefethen Family Vineyards', 'Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.trefethen.com/winecategory/small-lot-wines/
  ('Trefethen Family Vineyards', 'Malbec', 'Napa Valley, California, USA', 'Malbec', 'Red'),  -- https://www.trefethen.com/winecategory/small-lot-wines/
  ('Trefethen Family Vineyards', 'Petit Verdot', 'Napa Valley, California, USA', 'Petit Verdot', 'Red'),  -- https://www.trefethen.com/winecategory/small-lot-wines/
  ('Trefethen Family Vineyards', 'O.K.D. Four Red Blend', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.trefethen.com/winecategory/small-lot-wines/
  ('Trefethen Family Vineyards', 'Late Harvest Riesling', 'Napa Valley, California, USA', 'Riesling', 'Sweet')  -- https://www.trefethen.com/winecategory/small-lot-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FREEMARK ABBEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Freemark Abbey', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Rutherford Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Cabernet Bosché', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Sycamore Vineyard Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Mount Veeder Cabernet Sauvignon', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Malbec', 'Napa Valley, California, USA', 'Malbec', 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Spring Mountain Cabernet Sauvignon', 'Spring Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Colline Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Josephine Red Wine', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Ted''s Blend Red Wine', 'Rutherford, Napa Valley, California, USA', null, 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Partners Blend Red Wine', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.freemarkabbey.com/shop-red-wines/
  ('Freemark Abbey', 'Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.freemarkabbey.com/shop-white-wines/
  ('Freemark Abbey', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.freemarkabbey.com/shop-white-wines/
  ('Freemark Abbey', 'Los Carneros Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.freemarkabbey.com/shop-white-wines/
  ('Freemark Abbey', 'Viognier', 'Napa Valley, California, USA', 'Viognier', 'White'),  -- https://www.freemarkabbey.com/shop-white-wines/
  ('Freemark Abbey', 'Napa Valley Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.freemarkabbey.com/shop-library/
  ('Freemark Abbey', 'Merlot Bosché', 'Rutherford, Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.freemarkabbey.com/shop-library/
  ('Freemark Abbey', 'Cask 86 Syrah Dessert Wine', 'Mount Veeder, Napa Valley, California, USA', 'Syrah', 'Fortified')  -- https://www.freemarkabbey.com/shop-library/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DU VAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Clos Du Val', 'Yettalil', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot, Malbec, Petit Verdot', 'Red'),  -- https://www.closduval.com/pages/wines
  ('Clos Du Val', 'Estate Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.closduval.com/pages/wines
  ('Clos Du Val', 'Estate Cabernet Franc', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.closduval.com/pages/wines
  ('Clos Du Val', 'Napa Valley Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc, Sémillon', 'White'),  -- https://www.closduval.com/pages/wines
  ('Clos Du Val', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.closduval.com/pages/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROMBAUER VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Rombauer Vineyards', 'Carneros Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://rombauer.com/vineyards/
  ('Rombauer Vineyards', 'Proprietor Selection Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://rombauer.com/vineyards/
  ('Rombauer Vineyards', 'Buchli Station Vineyard Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://rombauer.com/vineyards/
  ('Rombauer Vineyards', 'Carneros Merlot', 'Carneros, California, USA', 'Merlot', 'Red'),  -- https://rombauer.com/vineyards/
  ('Rombauer Vineyards', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://rombauer.com/vineyards/
  ('Rombauer Vineyards', 'Diamond Selection Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://rombauer.com/vineyards/
  ('Rombauer Vineyards', 'Napa Valley Zinfandel', 'Napa Valley, California, USA', 'Zinfandel', 'Red'),  -- https://rombauer.com/vineyards/
  ('Rombauer Vineyards', 'Proprietor Selection Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://www.decanter.com/wine-reviews/usa/california/rombauer-proprietor-selection-napa-valley-2021-94613
  ('Rombauer Vineyards', 'Stice Lane Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/rombauer/2/
  ('Rombauer Vineyards', 'Atlas Peak Cabernet', 'Atlas Peak, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.rombauer.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- INGLENOOK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Inglenook', 'Rubicon', 'Rutherford, Napa Valley, California, USA', null, 'Red'),  -- https://inglenook.com/product/rubicon/
  ('Inglenook', 'Blancaneaux', 'Rutherford, Napa Valley, California, USA', null, 'White'),  -- https://inglenook.com/product/blancaneaux/
  ('Inglenook', 'Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://inglenook.com/product/cabernet-sauvignon/
  ('Inglenook', 'Sauvignon Blanc', 'Rutherford, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://inglenook.com/product/sauvignon-blanc/
  ('Inglenook', 'Cabernet Franc', 'Rutherford, Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://inglenook.com/product/cabernet-franc/
  ('Inglenook', 'RC Reserve Syrah', 'Rutherford, Napa Valley, California, USA', 'Syrah', 'Red')  -- https://inglenook.com/product/rc-reserve-syrah/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CARNEROS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Domaine Carneros', 'Estate Brut Cuvée', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.domainecarneros.com/our-wines/2022-estate-brut-cuvee
  ('Domaine Carneros', 'Brut Rosé', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.domainecarneros.com/our-wines/2022-brut-rose
  ('Domaine Carneros', 'Blanc de Noir', 'Carneros, California, USA', 'Pinot Noir', 'Sparkling'),  -- https://www.domainecarneros.com/our-wines/blanc-de-noir
  ('Domaine Carneros', 'Verméil Demi-Sec', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.domainecarneros.com/our-wines/2022-vermeil-demi-sec
  ('Domaine Carneros', 'Ultra Brut', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.domainecarneros.com/our-wines/2020-ultra-brut
  ('Domaine Carneros', 'Late Disgorged Brut', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.domainecarneros.com/our-wines/2019-late-disgorged-brut
  ('Domaine Carneros', 'Le Rêve Blanc de Blancs', 'Carneros, California, USA', 'Chardonnay', 'Sparkling'),  -- https://www.domainecarneros.com/our-wines/2018-le-reve-blanc-de-blancs
  ('Domaine Carneros', 'Late Disgorged Le Rêve', 'Carneros, California, USA', 'Chardonnay', 'Sparkling'),  -- https://www.domainecarneros.com/our-wines/2017-late-disgorged-le-reve
  ('Domaine Carneros', 'Estate Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.domainecarneros.com/our-wines/2023-estate-pinot-noir
  ('Domaine Carneros', 'Le Ciel Serein Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.domainecarneros.com/our-wines/2023-le-ciel-serein
  ('Domaine Carneros', 'The Famous Gate Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.domainecarneros.com/our-wines/2024-the-famous-gate-pinot-noir
  ('Domaine Carneros', 'Pommard Clone Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.domainecarneros.com/our-wines/2024-pommard-clone-pinot-noir
  ('Domaine Carneros', 'Tula Vista Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.domainecarneros.com/our-wines/2024-tula-vista-pinot-noir
  ('Domaine Carneros', 'Avant-Garde Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.domainecarneros.com/our-wines/2023-avant-garde-pinot-noir
  ('Domaine Carneros', 'La Rocaille Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.domainecarneros.com/our-wines/2024-la-rocaille-chardonnay
  ('Domaine Carneros', 'Hyde Vineyard Merlot', 'Carneros, California, USA', 'Merlot', 'Red'),  -- https://www.domainecarneros.com/our-wines/2023-hyde-vineyard-merlot
  ('Domaine Carneros', 'Dijon 777 Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.domainecarneros.com/wines
  ('Domaine Carneros', 'Clonal 114 Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red')  -- https://www.domainecarneros.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SCHRAMSBERG VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Schramsberg Vineyards', 'J. Davies Diamond Mountain District Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'J. Davies Jamie Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'J. Davies jd Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'J. Schram Late Disgorged', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=CR
  ('Schramsberg Vineyards', 'J. Schram Rosé', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=CR
  ('Schramsberg Vineyards', 'J. Schram Blancs', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=CR
  ('Schramsberg Vineyards', 'J. Schram Noirs', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=CR
  ('Schramsberg Vineyards', 'Green Valley Blanc de Blancs', 'Green Valley of Russian River Valley, California, USA', 'Chardonnay', 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=CR
  ('Schramsberg Vineyards', 'Sangiacomo Blanc de Blancs', 'Sonoma Coast, California, USA', 'Chardonnay', 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=CR
  ('Schramsberg Vineyards', 'Blanc de Noirs Late Disgorged', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Nobles Vineyard Blanc de Noirs', 'Fort Ross-Seaview, Sonoma Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Extra Brut', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Querencia Brut Rosé', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Blanc de Blancs Extra Brut', 'North Coast, California, USA', 'Chardonnay', 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Brut Rosé', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Crémant Demi-sec', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Blanc de Noirs', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Blanc de Blancs', 'North Coast, California, USA', 'Chardonnay', 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Mirabelle Brut Rosé', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Mirabelle Brut', 'North Coast, California, USA', null, 'Sparkling'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Schramsberg Vineyards', 'Reserve Late Disgorged', 'North Coast, California, USA', null, 'Sparkling')  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=CR
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DAVIES VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Davies Vineyards', 'Criscione Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'Leonardini Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'McGrath Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'Oliven Vineyard Cabernet Sauvignon', 'Calistoga, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'Red Cap Vineyard Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'Renteria 360 Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'Simpkins Vineyard Cabernet Sauvignon', 'Coombsville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'St. Helena Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', null, 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'Hyde Vineyards Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'Three Amigos Estate Vineyard Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
  ('Davies Vineyards', 'Napa Valley Carneros Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red')  -- https://shop.schramsberg.com/SHOP.AMS?LEVEL=MID&CAT=750
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MUMM NAPA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Mumm Napa', 'Prestige Cuvée', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/prestige-cuvee/
  ('Mumm Napa', 'Brut Rosé', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/brut-rose/
  ('Mumm Napa', 'Blanc de Blancs', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/blanc-de-blancs/
  ('Mumm Napa', 'Demi-Sec', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/demi-sec/
  ('Mumm Napa', 'Cuvée M Red', 'Napa Valley, California, USA', 'Pinot Noir', 'Sparkling'),  -- https://www.mummnapa.com/wines/mumm-napa-cuvee-m-red-2/
  ('Mumm Napa', 'Brut Reserve', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/nv-brut-reserve/
  ('Mumm Napa', 'Brut Reserve Rosé', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/brut-reserve-rose/
  ('Mumm Napa', 'Blanc de Noirs Reserve', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2021-blanc-de-noirs-reserve/
  ('Mumm Napa', 'Blanc de Blancs Reserve', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2021-blanc-de-blancs-reserve/
  ('Mumm Napa', 'Blanc de Blancs Reserve Extra Brut', 'Napa Valley, California, USA', 'Chardonnay', 'Sparkling'),  -- https://www.mummnapa.com/wines/2018-blanc-de-blancs-reserve-extra-brut/
  ('Mumm Napa', 'Brut Reserve Extended Tirage', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2017-brut-reserve-extended-tirage/
  ('Mumm Napa', 'Brut Reserve Rosé Extended Tirage', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/brut-reserve-rose-extended-tirage/
  ('Mumm Napa', 'Blanc de Blancs Reserve Extended Tirage', 'Napa Valley, California, USA', 'Chardonnay', 'Sparkling'),  -- https://www.mummnapa.com/wines/2016-mumm-napa-blanc-de-blancs-reserve-extended-tirage/
  ('Mumm Napa', 'DVX', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2016-dvx/
  ('Mumm Napa', 'DVX Rosé', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2017-dvx-rose/
  ('Mumm Napa', 'DVX Extended Tirage', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2016-dvx-extended-tirage/
  ('Mumm Napa', 'Oak Barrel Aged Blanc de Blancs', 'Napa Valley, California, USA', 'Chardonnay', 'Sparkling'),  -- https://www.mummnapa.com/wines/2019-oak-barrel-aged-blanc-de-blancs-2/
  ('Mumm Napa', 'Devaux Ranch Brut', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2022-devaux-ranch-brut/
  ('Mumm Napa', 'Trio C Vineyards Brut', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2022-trio-c-vineyards-brut/
  ('Mumm Napa', 'Sparkling Musqué Clone Blanc de Blancs', 'Napa Valley, California, USA', 'Chardonnay', 'Sparkling'),  -- https://www.mummnapa.com/wines/2021-sparkling-musque-clone-blanc-de-blancs/
  ('Mumm Napa', 'Oak Knoll District Brut', 'Oak Knoll District, Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2020-oak-knoll-district-brut-2/
  ('Mumm Napa', 'Sparkling Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Sparkling'),  -- https://www.mummnapa.com/wines/2020-sparkling-cabernet-sauvignon-2/
  ('Mumm Napa', 'Trefethen Family Vineyards Blanc de Noirs', 'Napa Valley, California, USA', 'Pinot Noir', 'Sparkling'),  -- https://www.mummnapa.com/wines/2021-trefethen-family-vineyards-blanc-de-noirs/
  ('Mumm Napa', 'Sparkling Pinot Meunier', 'Napa Valley, California, USA', null, 'Sparkling'),  -- https://www.mummnapa.com/wines/2022-sparkling-pinot-meunier/
  ('Mumm Napa', 'Sparkling Pinot Noir', 'Napa Valley, California, USA', 'Pinot Noir', 'Sparkling'),  -- https://www.mummnapa.com/wines/mumm-napa-sparkling-pinot-noir/
  ('Mumm Napa', 'Grand Année', 'Napa Valley, California, USA', null, 'Sparkling')  -- https://www.mummnapa.com/wines/2013-mumm-napa-grand-annee-magnum/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHAPPELLET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Chappellet', 'Pritchard Hill Estate Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Signature Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Hideaway Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Clone 4 Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Pritchard Hill Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Las Piedras', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Malbec', 'Napa Valley, California, USA', 'Malbec', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Pinot Noir', 'Napa Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Cultivation Red Wine', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Zinfandel', 'Napa Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Petite Sirah', 'Napa Valley, California, USA', 'Petite Sirah', 'Red'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Pritchard Hill Signature Chenin Blanc', 'Napa Valley, California, USA', 'Chenin Blanc', 'White'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Chenin Blanc', 'Napa Valley, California, USA', 'Chenin Blanc', 'White'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Signature Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
  ('Chappellet', 'Cold Creek Vineyard Viognier', 'Carneros, California, USA', 'Viognier', 'White')  -- https://www.winerelease.com/WineryInfo/chappellet-vineyard-wine-releases.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THE HESS COLLECTION ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('The Hess Collection', 'The Lion Mount Veeder Estate Cabernet Sauvignon', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.hessperssonestates.com/collection/hess-collection-wines/
  ('The Hess Collection', 'Mount Veeder Estate Cabernet Sauvignon', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.hessperssonestates.com/collection/hess-collection-wines/
  ('The Hess Collection', '19 Block Mountain Cuvée', 'Mount Veeder, Napa Valley, California, USA', null, 'Red'),  -- https://www.hessperssonestates.com/product/2023-19-block-mountain-cuve-mount-veeder
  ('The Hess Collection', 'Iron Corral Estate Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.hessperssonestates.com/collection/hess-collection-wines/
  ('The Hess Collection', 'Allomi Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.hessperssonestates.com/collection/hess-collection-wines/
  ('The Hess Collection', 'The Lioness Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.hessperssonestates.com/collection/hess-collection-wines/
  ('The Hess Collection', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.hessperssonestates.com/collection/hess-collection-wines/
  ('The Hess Collection', 'Napa Valley Reserve Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.hessperssonestates.com/collection/all-wines/
  ('The Hess Collection', 'Mount Veeder Reserve Cabernet Sauvignon', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.hessperssonestates.com/collection/all-wines/
  ('The Hess Collection', 'Mount Veeder Malbec', 'Mount Veeder, Napa Valley, California, USA', 'Malbec', 'Red'),  -- https://www.hessperssonestates.com/product/2022-malbec-mount-veeder
  ('The Hess Collection', 'Collectors Cuvée', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.hessperssonestates.com/product/2022-collectors-cuve-napa-valley
  ('The Hess Collection', 'Napa Valley Petite Sirah', 'Napa Valley, California, USA', 'Petite Sirah', 'Red'),  -- https://www.hessperssonestates.com/collection/all-wines/
  ('The Hess Collection', 'Napa Valley Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.hessperssonestates.com/collection/all-wines/
  ('The Hess Collection', 'Lion Tamer Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.hessperssonestates.com/collection/all-wines/
  ('The Hess Collection', 'Lion Tamer Nemea Reserve Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.hessperssonestates.com/collection/all-wines/
  ('The Hess Collection', 'Lion Tamer Red Blend', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.hessperssonestates.com/collection/all-wines/
  ('The Hess Collection', 'Lion Tamer Chimera Reserve Red Blend', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.hessperssonestates.com/collection/all-wines/
  ('The Hess Collection', 'Lion Tamer White Blend', 'Napa Valley, California, USA', null, 'White')  -- https://www.hessperssonestates.com/collection/all-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ORIN SWIFT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Orin Swift', 'Mercury Head', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.orinswift.com/wines/mercury-head
  ('Orin Swift', 'Palermo', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.orinswift.com/wines/palermo
  ('Orin Swift', 'Papillon', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.orinswift.com/wines/papillon
  ('Orin Swift', 'Firebent Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.orinswift.com/wines/firebent-napa-valley-chardonnay
  ('Orin Swift', 'Veladora', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.orinswift.com/wines/veladora
  ('Orin Swift', 'Scattered Stones', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.orinswift.com/wines/scattered-stones-red-blend
  ('Orin Swift', 'Double Take', 'Napa Valley, California, USA', 'Merlot', 'Red')  -- https://www.orinswift.com/wines/double-take
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHANDON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Chandon', 'étoile Brut', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.chandon.com/en-us/chandon-etoile-brut/1091544.html
  ('Chandon', 'étoile Rosé', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.chandon.com/en-us/chandon-etoile-rose/1091545.html
  ('Chandon', 'Réserve Pinot Noir Rosé', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.chandon.com/en-us/reserve-pinot-noir-rose/1091536.html
  ('Chandon', 'Réserve Blanc de Blancs', 'Carneros, California, USA', 'Chardonnay', 'Sparkling'),  -- https://www.chandon.com/en-us/chandon-reserve-blanc-de-blancs/1113312.html
  ('Chandon', '50th Anniversary Winemakers'' Blend', 'Napa Valley, California, USA', null, 'Sparkling')  -- https://www.chandon.com/en-us/50th-anniversary-winemakers-blend/1099766.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SPOTTSWOODE ESTATE VINEYARD & WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Spottswoode Estate Vineyard & Winery', 'Estate Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://spottswoode.com/spottswoode-wines/estate-cabernet-sauvignon/
  ('Spottswoode Estate Vineyard & Winery', 'Lyndenhurst Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://spottswoode.com/spottswoode-wines/lyndenhurst-cabernet-sauvignon/
  ('Spottswoode Estate Vineyard & Winery', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://spottswoode.com/spottswoode-wines/sauvignon-blanc/
  ('Spottswoode Estate Vineyard & Winery', 'Estate Sauvignon Blanc Mary''s Block', 'St. Helena, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://spottswoode.com/spottswoode-wines/estate-sauvignon-blanc-marys-block/
  ('Spottswoode Estate Vineyard & Winery', 'Field Book Rossi Vineyard Heritage Estate Red Wine', 'St. Helena, Napa Valley, California, USA', null, 'Red'),  -- https://spottswoode.com/spottswoode-wines/field-book-rossi-vineyard/
  ('Spottswoode Estate Vineyard & Winery', 'Field Book Spring Creek Vineyard Estate Red Wine', 'St. Helena, Napa Valley, California, USA', null, 'Red')  -- https://spottswoode.com/spottswoode-wines/field-book-spring-creek/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CORISON WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Corison Winery', 'Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.corison.com/all-wines/
  ('Corison Winery', 'Rutherford Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.corison.com/all-wines/
  ('Corison Winery', 'Sunbasket Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.corison.com/all-wines/
  ('Corison Winery', 'Kronos Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.corison.com/all-wines/
  ('Corison Winery', 'Helios Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.corison.com/all-wines/
  ('Corison Winery', 'Selene Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.corison.com/all-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DIAMOND CREEK VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Diamond Creek Vineyards', 'Gravelly Meadow Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.diamondcreekvineyards.com/
  ('Diamond Creek Vineyards', 'Red Rock Terrace Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.diamondcreekvineyards.com/
  ('Diamond Creek Vineyards', 'Volcanic Hill Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.diamondcreekvineyards.com/
  ('Diamond Creek Vineyards', 'Lake Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.diamondcreekvineyards.com/
  ('Diamond Creek Vineyards', 'Three Vineyard Blend Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.decanter.com/wine-reviews/search/diamond-creek-vineyards/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DUNN VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Dunn Vineyards', 'Howell Mountain Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.dunnvineyards.com/
  ('Dunn Vineyards', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.dunnvineyards.com/
  ('Dunn Vineyards', 'El Camino Reserve Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.decanter.com/wine-reviews/usa/howell-mountain/dunn-vineyards-el-camino-reserve-cabernet-sauvignon-napa-88942
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SCREAMING EAGLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Screaming Eagle', null, 'Oakville, Napa Valley, California, USA', null, 'Red'),  -- https://www.frw.co.uk/producer/612ec280060000000000030e/screaming-eagle
  ('Screaming Eagle', 'The Flight', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.frw.co.uk/producer/612ec280060000000000030e/screaming-eagle
  ('Screaming Eagle', 'Second Flight', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.frw.co.uk/producer/612ec280060000000000030e/screaming-eagle
  ('Screaming Eagle', 'Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White')  -- https://www.frw.co.uk/producer/612ec280060000000000030e/screaming-eagle
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOND ESTATES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Bond Estates', 'Melbury', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://benchmarkwine.com/winery/1946-bond
  ('Bond Estates', 'Pluribus', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://benchmarkwine.com/winery/1946-bond
  ('Bond Estates', 'St. Eden', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://benchmarkwine.com/winery/1946-bond
  ('Bond Estates', 'Quella', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://benchmarkwine.com/winery/1946-bond
  ('Bond Estates', 'Vecina', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://benchmarkwine.com/winery/1946-bond
  ('Bond Estates', 'Matriarch', 'Napa Valley, California, USA', null, 'Red')  -- https://www.benchmarkwine.com/products/5527-matriarch-2006
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HARLAN ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Harlan Estate', null, 'Oakville, Napa Valley, California, USA', null, 'Red'),  -- https://vinous.com/wines/harlan-harlan-estate/2021
  ('Harlan Estate', 'The Maiden', 'Oakville, Napa Valley, California, USA', null, 'Red')  -- https://vinous.com/wines/harlan-the-maiden/2021
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- OPUS ONE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Opus One', null, 'Oakville, Napa Valley, California, USA', null, 'Red'),  -- https://vinous.com/wines/opus-one-opus-one/2021
  ('Opus One', 'Overture', 'Napa Valley, California, USA', null, 'Red')  -- https://www.bbr.com/products-10008126452-opus-one-overture-napa-valley-california-usa-2020-release
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMINUS ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Dominus Estate', 'Dominus', 'Yountville, Napa Valley, California, USA', null, 'Red'),  -- https://vinous.com/wines/dominus-dominus/2021
  ('Dominus Estate', 'Napanook', 'Yountville, Napa Valley, California, USA', null, 'Red'),  -- https://vinous.com/wines/dominus-napanook/2021
  ('Dominus Estate', 'Othello', 'Napa Valley, California, USA', null, 'Red')  -- https://mmdusa.net/portfolio/dominus-estate/othello
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PROMONTORY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Promontory', null, 'Yountville, Napa Valley, California, USA', null, 'Red')  -- https://vinous.com/wines/promontory-promontory/2021
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DALLA VALLE VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Dalla Valle Vineyards', 'Maya', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.dallavallevineyards.com/wines/maya.html
  ('Dalla Valle Vineyards', 'Dalla Valle', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.dallavallevineyards.com/wines/cabernet.html
  ('Dalla Valle Vineyards', 'MDV', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.dallavallevineyards.com/wines/mdv.html
  ('Dalla Valle Vineyards', 'Collina Dalla Valle', 'Napa Valley, California, USA', null, 'Red')  -- https://www.dallavallevineyards.com/wines/collina-dalla-valle.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COLGIN CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Colgin Cellars', 'IX Estate', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.bbr.com/producer-2158-colgin-cellars
  ('Colgin Cellars', 'IX Estate Syrah', 'Napa Valley, California, USA', 'Syrah', 'Red'),  -- https://www.bbr.com/producer-2158-colgin-cellars
  ('Colgin Cellars', 'Tychson Hill Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.bbr.com/producer-2158-colgin-cellars
  ('Colgin Cellars', 'Cariad', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.bbr.com/producer-2158-colgin-cellars
  ('Colgin Cellars', 'Jubilation', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.jjbuckley.com/wine/2021-colgin-jubilation/2021-848572-750/
  ('Colgin Cellars', 'IX Estate Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.decanter.com/wine-reviews/search/colgin-cellars/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SCARECROW ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Scarecrow', null, 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.scarecrowwine.com/our-wine/
  ('Scarecrow', 'M. Étain', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon, Merlot, Malbec, Petit Verdot', 'Red'),  -- https://www.scarecrowwine.com/our-wine/
  ('Scarecrow', 'Toto''s Opium Dream', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.scarecrowwine.com/our-wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HUNDRED ACRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Hundred Acre', 'Fortification', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Fortified'),  -- https://www.decanter.com/wine-reviews/usa/california/hundred-acre-fortification-napa-valley-st-helena-2018-103221
  ('Hundred Acre', 'Few and Far Between Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/hundred-acre/2
  ('Hundred Acre', 'Morgan''s Way Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/hundred-acre/2
  ('Hundred Acre', 'Wraith Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/hundred-acre/2
  ('Hundred Acre', 'Wraith Holy Quest Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/hundred-acre/2
  ('Hundred Acre', 'Wraith Crypt Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/hundred-acre/2
  ('Hundred Acre', 'Dark Ark Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/hundred-acre/2
  ('Hundred Acre', 'Ark Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/hundred-acre/2
  ('Hundred Acre', 'Kayli Morgan Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/hundred-acre?source=pdp
  ('Hundred Acre', 'Precious Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.vivino.com/en/wineries/hundred-acre?source=pdp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CONTINUUM ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Continuum Estate', 'Continuum', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot, Petit Verdot', 'Red'),  -- https://www.continuumestate.com/wine/
  ('Continuum Estate', 'Novicium', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Cabernet Franc, Petit Verdot, Merlot', 'Red'),  -- https://www.continuumestate.com/wine/novicium/
  ('Continuum Estate', 'Sentium', 'Napa Valley, California, USA', 'Sauvignon Blanc, Sémillon', 'White')  -- https://www.continuumestate.com/wine/sentium/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KAPCSANDY FAMILY WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Kapcsandy Family Winery', 'Grand Vin Cabernet Sauvignon', 'Yountville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.kapcsandywines.com/wines
  ('Kapcsandy Family Winery', 'Roberta''s Reserve', 'Yountville, Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.kapcsandywines.com/wines
  ('Kapcsandy Family Winery', 'Rapszodia', 'Yountville, Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.kapcsandywines.com/wines
  ('Kapcsandy Family Winery', 'Estate Cuvée Cabernet Sauvignon', 'Yountville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.kapcsandywines.com/wines
  ('Kapcsandy Family Winery', 'Rapszodia Rosé', 'Yountville, Napa Valley, California, USA', 'Cabernet Franc, Merlot', 'Rosé'),  -- https://www.kapcsandywines.com/wines
  ('Kapcsandy Family Winery', 'Furmint', 'Yountville, Napa Valley, California, USA', 'Furmint', 'White'),  -- https://www.kapcsandywines.com/wines
  ('Kapcsandy Family Winery', 'Vino del Sol', 'Napa Valley, California, USA', 'Merlot, Cabernet Sauvignon, Petit Verdot', 'Fortified'),  -- https://www.kapcsandywines.com/wines
  ('Kapcsandy Family Winery', 'State Lane Vineyard Red', 'Yountville, Napa Valley, California, USA', null, 'Red'),  -- https://www.vivino.com/en/wineries/kapcsandy-family-winery
  ('Kapcsandy Family Winery', 'Grand Vin Rosé', 'Yountville, Napa Valley, California, USA', null, 'Rosé')  -- https://www.vivino.com/en/wineries/kapcsandy-family-winery
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAHLMEYER WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Pahlmeyer Winery', 'Proprietary Red', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.pahlmeyer.com/proprietary-red-vintages/
  ('Pahlmeyer Winery', 'Pièce de Résistance', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pahlmeyer.com/pahlmeyer-les-elus/
  ('Pahlmeyer Winery', 'Raison d''Être', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.pahlmeyer.com/pahlmeyer-les-elus/
  ('Pahlmeyer Winery', 'Jayson Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://napa.guides.winefolly.com/wineries/pahlmeyer/wines/jayson-cabernet-sauvignon
  ('Pahlmeyer Winery', 'Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.decanter.com/wine-reviews/search/pahlmeyer/2/
  ('Pahlmeyer Winery', 'Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/pahlmeyer/2/
  ('Pahlmeyer Winery', 'Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.decanter.com/wine-reviews/search/pahlmeyer/2/
  ('Pahlmeyer Winery', 'Savoir Faire Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White')  -- https://www.decanter.com/wine-reviews/search/pahlmeyer/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RAMEY WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Ramey Wine Cellars', 'Cabernet Sauvignon Napa Valley', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://napa.guides.winefolly.com/wineries/ramey-wine-cellars/wines/cabernet-sauvignon-napa-valley
  ('Ramey Wine Cellars', 'Annum Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://napa.guides.winefolly.com/wineries/ramey-wine-cellars/wines/cabernet-sauvignon-napa-valley
  ('Ramey Wine Cellars', 'Pedregal Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.rameywine.com/wine/
  ('Ramey Wine Cellars', 'Claret Napa Valley', 'Napa Valley, California, USA', null, 'Red'),  -- https://napa.guides.winefolly.com/wineries/ramey-wine-cellars/wines/claret-napa-valley
  ('Ramey Wine Cellars', 'Hyde Vineyard Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White')  -- https://napa.guides.winefolly.com/wineries/ramey-wine-cellars/wines/chardonnay-hyde-vineyard-carneros
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MAYACAMAS VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Mayacamas Vineyards', 'Red Wine', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon, Merlot, Cabernet Franc', 'Red'),  -- https://www.mayacamas.com/wines/mayacamas-red-wine/
  ('Mayacamas Vineyards', 'Cabernet Sauvignon', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/mayacamas-vineyards/
  ('Mayacamas Vineyards', 'Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.napawineproject.com/mayacamas-vineyards/
  ('Mayacamas Vineyards', 'Merlot', 'Napa Valley, California, USA', 'Merlot, Cabernet Franc', 'Red'),  -- https://www.napawineproject.com/mayacamas-vineyards/
  ('Mayacamas Vineyards', 'Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/mayacamas-vineyards/
  ('Mayacamas Vineyards', 'Grenache Rosé', 'Napa Valley, California, USA', 'Grenache', 'Rosé'),  -- https://www.napawineproject.com/mayacamas-vineyards/
  ('Mayacamas Vineyards', 'Pinot Noir', 'Mount Veeder, Napa Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.napawineproject.com/mayacamas-vineyards/
  ('Mayacamas Vineyards', 'Special Bottling Golden Hill Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.napawineproject.com/mayacamas-vineyards/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUINTESSA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Quintessa', null, 'Rutherford, Napa Valley, California, USA', null, 'Red')  -- https://www.quintessa.com/the-wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAUL HOBBS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Paul Hobbs Winery', 'Coombsville Cabernet Sauvignon', 'Coombsville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://paulhobbswinery.com/wines/
  ('Paul Hobbs Winery', 'Beckstoffer To Kalon Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/paul-hobbs/usa/page/4/3/
  ('Paul Hobbs Winery', 'Beckstoffer Dr. Crane Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/paul-hobbs/usa/page/4/3/
  ('Paul Hobbs Winery', 'Beckstoffer Las Piedras Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/paul-hobbs/usa/page/3/3/
  ('Paul Hobbs Winery', 'Nathan Coombs Estate Cabernet Sauvignon', 'Coombsville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/paul-hobbs/usa/page/4/3/
  ('Paul Hobbs Winery', 'Nathan Coombs Estate Cabernet Franc', 'Coombsville, Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/paul-hobbs/usa/page/4/3/
  ('Paul Hobbs Winery', 'Cuvée Sophia Proprietary Red', 'Coombsville, Napa Valley, California, USA', null, 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/paul-hobbs/usa/page/4/3/
  ('Paul Hobbs Winery', 'Nathan Coombs Estate Cristina''s Signature', 'Coombsville, Napa Valley, California, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot', 'Red'),  -- https://www.decanter.com/wine-reviews/usa/california/paul-hobbs-nathan-coombs-estate-cristinas-signature-napa-100258/
  ('Paul Hobbs Winery', 'CrossBarn Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.decanter.com/wine-reviews/search/term/paul-hobbs/usa/page/4/3/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOKOYA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Lokoya', 'Mount Veeder Cabernet Sauvignon', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.bbr.com/producer-2231-lokoya
  ('Lokoya', 'Howell Mountain Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.bbr.com/producer-2231-lokoya
  ('Lokoya', 'Spring Mountain District Cabernet Sauvignon', 'Spring Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.lokoya.com/collection/spring-mountain
  ('Lokoya', 'Diamond Mountain District Cabernet Sauvignon', 'Diamond Mountain District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.lokoya.com/collection/diamond-mountain
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VINE HILL RANCH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Vine Hill Ranch', 'Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://vinehillranch.com/cabernet-sauvignon-a-wine-of-place/cabernet-sauvignon-current-vintage/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CARDINALE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Cardinale', null, 'Napa Valley, California, USA', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.napawineproject.com/cardinale-estate
  ('Cardinale', 'Intrada', 'Napa Valley, California, USA', 'Sauvignon Blanc, Sémillon', 'White')  -- https://www.decanter.com/wine-reviews/usa/california/cardinale-intrada-napa-valley-california-usa-2021-69263
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- OVID NAPA VALLEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Ovid Napa Valley', null, 'Napa Valley, California, USA', 'Cabernet Sauvignon, Cabernet Franc, Merlot, Petit Verdot', 'Red'),  -- https://ovidnapavalley.com/pages/ovid
  ('Ovid Napa Valley', 'Hexameter', 'Napa Valley, California, USA', 'Cabernet Franc, Cabernet Sauvignon, Merlot, Petit Verdot', 'Red'),  -- https://ovidnapavalley.com/pages/hexameter
  ('Ovid Napa Valley', 'Syrah', 'Napa Valley, California, USA', 'Syrah', 'Red'),  -- https://ovidnapavalley.com/pages/syrah
  ('Ovid Napa Valley', 'Loc. Cit.', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://ovidnapavalley.com/pages/loc-cit
  ('Ovid Napa Valley', 'Experiment No. M2.3 Napa Valley Red Wine', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Merlot, Petit Verdot, Cabernet Franc', 'Red'),  -- https://www.napawineproject.com/ovid-napa-valley
  ('Ovid Napa Valley', 'Experiment Red Wine No. N6.1', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Petit Verdot, Cabernet Franc, Merlot', 'Red')  -- https://www.napawineproject.com/ovid-napa-valley
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- REALM CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Realm Cellars', 'The Bard', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot', 'Red'),  -- https://www.napawineproject.com/realm-cellars
  ('Realm Cellars', 'The Bard Riverbound Edition', 'Yountville, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/realm-cellars
  ('Realm Cellars', 'Fidelio', 'Coombsville, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/realm-cellars
  ('Realm Cellars', 'The Tempest', 'Napa Valley, California, USA', 'Merlot, Cabernet Sauvignon, Malbec', 'Red'),  -- https://www.napawineproject.com/realm-cellars
  ('Realm Cellars', 'Falstaff', 'Napa Valley, California, USA', 'Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/realm-cellars
  ('Realm Cellars', 'The Absurd', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.decanter.com/wine-reviews/search/realm-cellars/2/
  ('Realm Cellars', 'Hartwell XX Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/realm-cellars/2/
  ('Realm Cellars', 'Moonracer Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/realm-cellars/2/
  ('Realm Cellars', 'Houyi Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/realm-cellars/2/
  ('Realm Cellars', 'Heavenly Questions Houyi Vineyard Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.decanter.com/wine-reviews/search/realm-cellars/2/
  ('Realm Cellars', 'Farella Vineyard Cabernet Sauvignon', 'Coombsville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/realm-cellars/2/
  ('Realm Cellars', 'Beckstoffer Dr. Crane Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/realm-cellars/2/
  ('Realm Cellars', 'Beckstoffer To Kalon Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/realm-cellars/2/
  ('Realm Cellars', 'Beckstoffer To Kalon Vineyard Cabernet Franc', 'Oakville, Napa Valley, California, USA', 'Cabernet Franc', 'Red')  -- https://www.decanter.com/wine-reviews/search/realm-cellars/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DARIOUSH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Darioush', 'Darius II Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.darioush.com/shop/
  ('Darioush', 'Signature Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.darioush.com/shop/
  ('Darioush', 'Signature Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.darioush.com/shop/
  ('Darioush', 'Signature Shiraz', 'Napa Valley, California, USA', 'Shiraz', 'Red'),  -- https://www.darioush.com/shop/
  ('Darioush', 'Signature Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.darioush.com/shop/
  ('Darioush', 'Sage Vineyard Red Wine', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Franc, Merlot, Cabernet Sauvignon', 'Red')  -- https://www.darioush.com/shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALPHA OMEGA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Alpha Omega', 'Alvarez Vineyard Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Beckstoffer Bourn Vineyard Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Beckstoffer Dr. Crane Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Beckstoffer To Kalon Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Beckstoffer Vineyard Las Piedras Cabernet Sauvignon', 'St. Helena, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Beckstoffer Vineyard Missouri Hopper Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Angel''s Vista Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Paratus Vineyard Cabernet Sauvignon', 'Mount Veeder, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Sacrashe Vineyard Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Sleeping Lady Vineyard Cabernet Sauvignon', 'Yountville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Sunshine Valley Vineyard Cabernet Sauvignon', 'Oak Knoll District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Tench Vineyard Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'Toyon Vineyard Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.aowinery.com/wine-shop/single-vineyards/
  ('Alpha Omega', 'ERA Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.aowinery.com/wine-shop/era/
  ('Alpha Omega', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.napawineproject.com/alpha-omega
  ('Alpha Omega', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/alpha-omega
  ('Alpha Omega', 'Cordes Vineyard Cabernet Sauvignon', 'Atlas Peak, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.napawineproject.com/alpha-omega
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLIFF LEDE VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Cliff Lede Vineyards', 'Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc, Sémillon', 'White'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Marla Blanc', 'Napa Valley, California, USA', 'Sémillon, Sauvignon Blanc, Sauvignon Musqué', 'White'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Radio Edit', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Crossfade', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'High Fidelity', 'Napa Valley, California, USA', 'Merlot, Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Rutherford Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Oakville Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Howell Mountain Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Rhythm Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Poetry Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Songbook Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cliffledevineyards.com/wines
  ('Cliff Lede Vineyards', 'Beckstoffer To Kalon Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.cliffledevineyards.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PINE RIDGE WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Pine Ridge Winery', 'Stags Leap District Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/stags-leap-district-cabernet-sauvignon/
  ('Pine Ridge Winery', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/napa-valley-cabernet-sauvignon/
  ('Pine Ridge Winery', 'Rutherford Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/rutherford-cabernet-sauvignon/
  ('Pine Ridge Winery', 'Carneros Cabernet Sauvignon', 'Carneros, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/carneros-cabernet/
  ('Pine Ridge Winery', 'Atlas Peak Cabernet Sauvignon', 'Atlas Peak, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/atlas-peak-cabernet-sauvignon/
  ('Pine Ridge Winery', 'Howell Mountain Cabernet Sauvignon', 'Howell Mountain, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/howell-mountain-cabernet-sauvignon/
  ('Pine Ridge Winery', 'Oakville Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/oakville-cabernet-sauvignon/
  ('Pine Ridge Winery', 'Petit Verdot', 'Napa Valley, California, USA', 'Petit Verdot', 'Red'),  -- https://www.pineridgevineyards.com/wine/petit-verdot/
  ('Pine Ridge Winery', 'Malbec', 'Napa Valley, California, USA', 'Malbec', 'Red'),  -- https://www.pineridgevineyards.com/wine/malbec/
  ('Pine Ridge Winery', 'Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.pineridgevineyards.com/wine/merlot/
  ('Pine Ridge Winery', 'Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.pineridgevineyards.com/wine/chardonnay/
  ('Pine Ridge Winery', 'Napa Valley Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.pineridgevineyards.com/wine/napa-valley-sauvignon-blanc/
  ('Pine Ridge Winery', 'Andrus Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/andrus-cabernet-sauvignon/
  ('Pine Ridge Winery', 'Stags Crown Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/stags-crown-cabernet/
  ('Pine Ridge Winery', 'Locked Horns Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.pineridgevineyards.com/wine/locked-horns-cabernet/
  ('Pine Ridge Winery', 'Circle Hill Vineyard Cabernet Sauvignon', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.pineridgevineyards.com/wine/circle-hill-vineyard-cabernet-sauvignon/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THE MASCOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('The Mascot', null, 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://napavalley.wine/makers/wineries/The_Mascot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BEAULIEU VINEYARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r6_napa.sql)'
from (values
  ('Beaulieu Vineyard', 'Georges de Latour Private Reserve Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.bvwines.com/
  ('Beaulieu Vineyard', 'Tapestry Reserve Red Wine', 'Napa Valley, California, USA', 'Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot, Malbec', 'Red'),  -- https://www.napawineproject.com/beaulieu-vineyard
  ('Beaulieu Vineyard', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.bvwines.com/
  ('Beaulieu Vineyard', 'Rutherford Reserve Cabernet Sauvignon', 'Rutherford, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.bvwines.com/
  ('Beaulieu Vineyard', 'Reserve Carneros Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.bvwines.com/
  ('Beaulieu Vineyard', 'Maestro Collection Sauvignon Blanc', 'Rutherford, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.napawineproject.com/beaulieu-vineyard
  ('Beaulieu Vineyard', 'Napa Valley Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/beaulieu-vineyard
  ('Beaulieu Vineyard', 'Hewitt Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.napawineproject.com/beaulieu-vineyard
  ('Beaulieu Vineyard', 'Clone 6 Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.napawineproject.com/beaulieu-vineyard
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
