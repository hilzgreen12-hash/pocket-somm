-- Producer ranges round 10: israel. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- GOLAN HEIGHTS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Golan Heights Winery', 'Mount Hermon Moscato', 'Golan Heights, Israel', 'Moscato', 'Sweet'),  -- https://www.golanwines.co.il/en/wines/
  ('Golan Heights Winery', 'Mount Hermon White', 'Golan Heights, Israel', null, 'White'),  -- https://www.golanwines.co.il/en/wines/
  ('Golan Heights Winery', 'Mount Hermon Rosé', 'Golan Heights, Israel', null, 'Rosé'),  -- https://www.golanwines.co.il/en/wines/
  ('Golan Heights Winery', 'Mount Hermon Cabernet Sauvignon', 'Golan Heights, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.golanwines.co.il/en/wines/
  ('Golan Heights Winery', 'Mount Hermon Indigo', 'Golan Heights, Israel', null, 'Red'),  -- https://www.golanwines.co.il/en/wines/
  ('Golan Heights Winery', 'Mount Hermon Red', 'Golan Heights, Israel', null, 'Red'),  -- https://www.golanwines.co.il/en/wines/
  ('Golan Heights Winery', 'Golan Sauvignon Blanc', 'Golan Heights, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.golanwines.co.il/en/wine-series/golan/
  ('Golan Heights Winery', 'Golan Rosé', 'Golan Heights, Israel', null, 'Rosé'),  -- https://www.golanwines.co.il/en/wine-series/golan/
  ('Golan Heights Winery', 'Golan Syrah', 'Golan Heights, Israel', 'Syrah', 'Red'),  -- https://www.golanwines.co.il/en/wine-series/golan/
  ('Golan Heights Winery', 'Golan Merlot', 'Golan Heights, Israel', 'Merlot', 'Red'),  -- https://www.golanwines.co.il/en/wine-series/golan/
  ('Golan Heights Winery', 'Golan Cabernet Sauvignon', 'Golan Heights, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.golanwines.co.il/en/wine-series/golan/
  ('Golan Heights Winery', 'Yarden Gewürztraminer', 'Golan Heights, Israel', 'Gewürztraminer', 'White'),  -- https://www.golanwines.co.il/en/wine-series/yarden/
  ('Golan Heights Winery', 'Yarden HeightsWine', 'Golan Heights, Israel', null, 'Sweet'),  -- https://www.golanwines.co.il/en/wine-series/yarden/
  ('Golan Heights Winery', 'Yarden T²', 'Golan Heights, Israel', null, 'Sweet'),  -- https://www.golanwines.co.il/en/wine-series/yarden/
  ('Golan Heights Winery', 'Yarden Brut Rosé', 'Golan Heights, Israel', null, 'Sparkling'),  -- https://www.golanwines.co.il/en/wine-series/yarden/
  ('Golan Heights Winery', 'Yarden Blanc de Blancs', 'Golan Heights, Israel', null, 'Sparkling'),  -- https://www.golanwines.co.il/en/wine-series/yarden/
  ('Golan Heights Winery', 'Yarden Rosé', 'Golan Heights, Israel', null, 'Rosé'),  -- https://www.golanwines.co.il/en/wine-series/yarden/
  ('Golan Heights Winery', 'Yarden Sauvignon Blanc', 'Golan Heights, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.golanwines.co.il/en/wine-series/yarden/
  ('Golan Heights Winery', 'Yarden Pinot Gris', 'Golan Heights, Israel', 'Pinot Gris', 'White'),  -- https://www.golanwines.co.il/en/wine-series/yarden/
  ('Golan Heights Winery', 'Yarden Chardonnay', 'Golan Heights, Israel', 'Chardonnay', 'White'),  -- https://www.golanwines.co.il/en/wine-series/yarden/
  ('Golan Heights Winery', 'Gamla Chardonnay', 'Golan Heights, Israel', 'Chardonnay', 'White'),  -- https://www.golanwines.co.il/en/wine-series/gamla/
  ('Golan Heights Winery', 'Gamla Blanco', 'Golan Heights, Israel', null, 'White'),  -- https://www.golanwines.co.il/en/wine-series/gamla/
  ('Golan Heights Winery', 'Gamla Sauvignon Blanc', 'Golan Heights, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.golanwines.co.il/en/wine-series/gamla/
  ('Golan Heights Winery', 'Gamla Riesling', 'Golan Heights, Israel', 'Riesling', 'White'),  -- https://www.golanwines.co.il/en/wine-series/gamla/
  ('Golan Heights Winery', 'Gamla Gewürztraminer', 'Golan Heights, Israel', 'Gewürztraminer', 'White'),  -- https://www.golanwines.co.il/en/wine-series/gamla/
  ('Golan Heights Winery', 'Gamla Brut', 'Golan Heights, Israel', null, 'Sparkling'),  -- https://www.golanwines.co.il/en/wine-series/gamla/
  ('Golan Heights Winery', 'Gamla Tempranillo', 'Golan Heights, Israel', 'Tempranillo', 'Red'),  -- https://www.golanwines.co.il/en/wine-series/gamla/
  ('Golan Heights Winery', 'Gamla Sangiovese', 'Golan Heights, Israel', 'Sangiovese', 'Red'),  -- https://www.golanwines.co.il/en/wine-series/gamla/
  ('Golan Heights Winery', 'Gamla Merlot', 'Golan Heights, Israel', 'Merlot', 'Red'),  -- https://www.golanwines.co.il/en/wine-series/gamla/
  ('Golan Heights Winery', 'Yarden Cabernet Sauvignon', 'Golan Heights, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Cabernet Sauvignon Bar''On Vineyard', 'Golan Heights, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Cabernet Franc', 'Golan Heights, Israel', 'Cabernet Franc', 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Merlot', 'Golan Heights, Israel', 'Merlot', 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Merlot Allone Habashan', 'Golan Heights, Israel', 'Merlot', 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Syrah', 'Golan Heights, Israel', 'Syrah', 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Syrah Bar''On Vineyard', 'Golan Heights, Israel', 'Syrah', 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Malbec', 'Golan Heights, Israel', 'Malbec', 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Katzrin', 'Golan Heights, Israel', null, 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Katzrin Chardonnay', 'Golan Heights, Israel', 'Chardonnay', 'White'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Chardonnay Odem Vineyard', 'Golan Heights, Israel', 'Chardonnay', 'White'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Allone Habashan', 'Golan Heights, Israel', null, 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden Bar''On', 'Golan Heights, Israel', null, 'Red'),  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
  ('Golan Heights Winery', 'Yarden 2T', 'Golan Heights, Israel', 'Touriga Nacional, Tinta Cão', 'Red')  -- https://www.saratogawine.com/producer/yarden-golan-heights-winery/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TEPERBERG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Teperberg', 'Legacy Petit Verdot', 'Judean Hills, Israel', 'Petit Verdot', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Legacy Cabernet Franc', 'Judean Hills, Israel', 'Cabernet Franc', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Legacy Petite Sirah', 'Judean Hills, Israel', 'Petite Sirah', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Essence Pinot Gris', 'Judean Hills, Israel', 'Pinot Gris', 'White'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Essence Chardonnay', 'Judean Hills, Israel', 'Chardonnay', 'White'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Essence Cabernet Sauvignon', 'Judean Hills, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Essence Malbec', 'Judean Hills, Israel', 'Malbec', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Essence Merlot', 'Judean Hills, Israel', 'Merlot', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Essence Fortified Red Wine', 'Judean Hills, Israel', null, 'Fortified'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Inspire Malbec & Marselan', 'Judean Hills, Israel', 'Malbec, Marselan', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Inspire Cabernet Sauvignon & Merlot & Petit Verdot & Cabernet Franc', 'Judean Hills, Israel', 'Cabernet Sauvignon, Merlot, Petit Verdot, Cabernet Franc', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Inspire Carignan & Mourvedre & Grenache & Syrah', 'Judean Hills, Israel', 'Carignan, Mourvedre, Grenache, Syrah', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Inspire Sauvignon Blanc & French Colombard', 'Judean Hills, Israel', 'Sauvignon Blanc, French Colombard', 'White'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Impression Chardonnay', 'Judean Hills, Israel', 'Chardonnay', 'White'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Impression Gewurztraminer', 'Judean Hills, Israel', 'Gewurztraminer', 'White'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Impression Late Harvest Riesling', 'Judean Hills, Israel', 'Riesling', 'Sweet'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Impression Cabernet Sauvignon', 'Judean Hills, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Impression Merlot', 'Judean Hills, Israel', 'Merlot', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Impression Sirah', 'Judean Hills, Israel', 'Sirah', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Impression Sangiovese', 'Judean Hills, Israel', 'Sangiovese', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Impression Cabernet Sauvignon Semi-Dry', 'Judean Hills, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Impression Rosé', 'Judean Hills, Israel', null, 'Rosé'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Vision Shiraz', 'Judean Hills, Israel', 'Shiraz', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Vision Semi-Dry White', 'Judean Hills, Israel', null, 'White'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Vision Dry White', 'Judean Hills, Israel', null, 'White'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Vision Cabernet Sauvignon', 'Judean Hills, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Vision Merlot', 'Judean Hills, Israel', 'Merlot', 'Red'),  -- https://teperbergwinery.co.il/en/?p=1462
  ('Teperberg', 'Vision Malbec', 'Judean Hills, Israel', 'Malbec', 'Red')  -- https://teperbergwinery.co.il/en/?p=1462
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DALTON WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Dalton Winery', 'Estate Cabernet Sauvignon', 'Upper Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.dalton-winery.com/en/wines/estate/
  ('Dalton Winery', 'Estate Shiraz', 'Upper Galilee, Israel', 'Shiraz', 'Red'),  -- https://www.dalton-winery.com/en/wines/estate/
  ('Dalton Winery', 'Estate Merlot', 'Upper Galilee, Israel', 'Merlot', 'Red'),  -- https://www.dalton-winery.com/en/wines/estate/
  ('Dalton Winery', 'Estate Petite Sirah', 'Upper Galilee, Israel', 'Petite Sirah', 'Red'),  -- https://www.dalton-winery.com/en/wines/estate/
  ('Dalton Winery', 'Estate Rosé', 'Upper Galilee, Israel', null, 'Rosé'),  -- https://www.dalton-winery.com/en/wines/estate/
  ('Dalton Winery', 'Estate Sauvignon Blanc Fumé', 'Upper Galilee, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.dalton-winery.com/en/wines/estate/
  ('Dalton Winery', 'Estate Chardonnay', 'Upper Galilee, Israel', 'Chardonnay', 'White'),  -- https://www.dalton-winery.com/en/wines/estate/
  ('Dalton Winery', 'Nadav Single Vineyard', 'Upper Galilee, Israel', null, 'Red'),  -- https://www.dalton-winery.com/en/wines/single-vineyard/
  ('Dalton Winery', 'Cabernet Sauvignon Kerem Elkosh', 'Upper Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.dalton-winery.com/en/wines/single-vineyard/
  ('Dalton Winery', 'Single Vineyard Shiraz Elkosh', 'Upper Galilee, Israel', 'Shiraz', 'Red'),  -- https://www.dalton-winery.com/en/wines/single-vineyard/
  ('Dalton Winery', 'Family Collection Cabernet Sauvignon', 'Upper Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.dalton-winery.com/en/wines/family-collection/
  ('Dalton Winery', 'Family Collection Shiraz', 'Upper Galilee, Israel', 'Shiraz', 'Red'),  -- https://www.dalton-winery.com/en/wines/family-collection/
  ('Dalton Winery', 'Family Collection Sauvignon Blanc', 'Upper Galilee, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.dalton-winery.com/en/wines/family-collection/
  ('Dalton Winery', 'Alma Deep Red', 'Upper Galilee, Israel', null, 'Red'),  -- https://www.dalton-winery.com/en/wines/alma/
  ('Dalton Winery', 'Alma Red', 'Upper Galilee, Israel', null, 'Red'),  -- https://www.dalton-winery.com/en/wines/alma/
  ('Dalton Winery', 'Alma White', 'Upper Galilee, Israel', null, 'White'),  -- https://www.dalton-winery.com/en/wines/alma/
  ('Dalton Winery', 'Alma Rosé', 'Upper Galilee, Israel', null, 'Rosé'),  -- https://www.dalton-winery.com/en/wines/alma/
  ('Dalton Winery', 'Anna', 'Upper Galilee, Israel', null, 'Red'),  -- https://www.dalton-winery.com/en/wines/special/
  ('Dalton Winery', 'Galilo', 'Upper Galilee, Israel', null, 'Red'),  -- https://www.dalton-winery.com/en/wines/special/
  ('Dalton Winery', 'Matatia', 'Upper Galilee, Israel', null, 'Red'),  -- https://www.dalton-winery.com/en/wines/special/
  ('Dalton Winery', 'Canaan Red', 'Upper Galilee, Israel', null, 'Red'),  -- https://www.dalton-winery.com/en/wines/cannan-mevushal/
  ('Dalton Winery', 'Canaan White', 'Upper Galilee, Israel', null, 'White'),  -- https://www.dalton-winery.com/en/wines/cannan-mevushal/
  ('Dalton Winery', 'Brut de Galilee', 'Upper Galilee, Israel', null, 'Sparkling')  -- https://www.dalton-winery.com/en/product/alma-deep-red/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RECANATI WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Recanati Winery', 'Single Vineyard Cabernet Sauvignon Odem Vineyard', 'Upper Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.recanati-winery.com/en/single-vineyard/
  ('Recanati Winery', 'Single Vineyard Merlot Odem Vineyard', 'Upper Galilee, Israel', 'Merlot', 'Red'),  -- https://www.recanati-winery.com/en/single-vineyard/
  ('Recanati Winery', 'Single Vineyard Sauvignon Blanc Odem Vineyard', 'Upper Galilee, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.recanati-winery.com/en/single-vineyard/
  ('Recanati Winery', 'Single Vineyard Chardonnay Tel Fares Vineyard', 'Israel', 'Chardonnay', 'White'),  -- https://www.recanati-winery.com/en/single-vineyard/
  ('Recanati Winery', 'Single Vineyard Chenin Blanc Kidron Vineyard', 'Israel', 'Chenin Blanc', 'White'),  -- https://www.recanati-winery.com/en/single-vineyard/
  ('Recanati Winery', 'Wild Carignan Judean Hills Vineyard', 'Judean Hills, Israel', 'Carignan', 'Red'),  -- https://www.recanati-winery.com/en/single-vineyard/
  ('Recanati Winery', 'Single Vineyard Marselan Kidmat Tzvi Vineyard', 'Israel', 'Marselan', 'Red'),  -- https://www.recanati-winery.com/en/single-vineyard/
  ('Recanati Winery', 'Single Vineyard Petite Sirah Jezreel Valley Vineyard', 'Israel', 'Petite Sirah', 'Red'),  -- https://www.recanati-winery.com/en/single-vineyard/
  ('Recanati Winery', 'Single Vineyard Cabernet Sauvignon Lebanon Vineyard', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.recanati-winery.com/en/single-vineyard/
  ('Recanati Winery', 'Special Reserve Red', 'Israel', 'Cabernet Sauvignon, Syrah, Petite Sirah, Carignan, Marselan', 'Red'),  -- https://www.recanati-winery.com/en/special-reserve/
  ('Recanati Winery', 'Special Reserve White', 'Israel', 'Roussanne, Marsanne', 'White'),  -- https://www.recanati-winery.com/en/special-reserve/
  ('Recanati Winery', 'Yasmin Red', 'Israel', 'Petite Sirah, Cabernet Sauvignon', 'Red'),  -- https://www.recanati-winery.com/en/recanati-yasmin/
  ('Recanati Winery', 'Yasmin White', 'Israel', 'Sauvignon Blanc, Colombard', 'White'),  -- https://www.recanati-winery.com/en/recanati-yasmin/
  ('Recanati Winery', 'Jonathan Red', 'Israel', 'Syrah, Petite Sirah, Cabernet Sauvignon', 'Red'),  -- https://www.recanati-winery.com/en/recanati-jonathan/
  ('Recanati Winery', 'Jonathan White', 'Israel', 'Colombard, Sauvignon Blanc', 'White'),  -- https://www.recanati-winery.com/en/recanati-jonathan/
  ('Recanati Winery', 'By The Glass Colombard Tel Fares', 'Golan Heights, Israel', 'Colombard', 'White'),  -- https://www.recanati-winery.com/en/by-the-glass/
  ('Recanati Winery', 'By The Glass Chenin Blanc Tel Fares', 'Golan Heights, Israel', 'Chenin Blanc', 'White'),  -- https://www.recanati-winery.com/en/by-the-glass/
  ('Recanati Winery', 'By The Glass Carignan Young Vines', 'Judean Hills, Israel', 'Carignan', 'Red'),  -- https://www.recanati-winery.com/en/by-the-glass/
  ('Recanati Winery', 'By The Glass Pét-Nat Marselan', 'Golan Heights, Israel', 'Marselan', 'Sparkling'),  -- https://www.recanati-winery.com/en/by-the-glass/
  ('Recanati Winery', 'By The Glass Pét-Nat Colombard', 'Golan Heights, Israel', 'Colombard', 'Sparkling')  -- https://www.recanati-winery.com/en/by-the-glass/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CARMEL WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Carmel Winery', 'Admon Malbec', 'Upper Galilee, Israel', 'Malbec', 'Red'),  -- https://signature.carmelwines.co.il/carmel-signature/
  ('Carmel Winery', 'Kayoumi Shiraz', 'Upper Galilee, Israel', 'Shiraz', 'Red'),  -- https://signature.carmelwines.co.il/carmel-signature/
  ('Carmel Winery', 'Tel Machfi Gewurztraminer', 'Golan Heights, Israel', 'Gewurztraminer', 'Sweet'),  -- https://signature.carmelwines.co.il/carmel-signature/
  ('Carmel Winery', 'Guvrin Petite Sirah', 'Israel', 'Petite Sirah', 'Red'),  -- https://signature.carmelwines.co.il/carmel-signature/
  ('Carmel Winery', 'Wadi Milek Carignan', 'Israel', 'Carignan', 'Red'),  -- https://signature.carmelwines.co.il/carmel-signature/
  ('Carmel Winery', 'Ma''alya', 'Judean Hills, Israel', null, 'Fortified'),  -- https://signature.carmelwines.co.il/carmel-signature/
  ('Carmel Winery', 'Vineyards North Golan Sauvignon Blanc', 'Golan Heights, Israel', 'Sauvignon Blanc', 'White'),  -- https://signature.carmelwines.co.il/carmel-signature/
  ('Carmel Winery', 'Vineyards Merom HaGalil Chardonnay', 'Upper Galilee, Israel', 'Chardonnay', 'White'),  -- https://signature.carmelwines.co.il/carmel-signature/
  ('Carmel Winery', 'Vineyards Merom HaGalil Cabernet Sauvignon', 'Upper Galilee, Israel', 'Cabernet Sauvignon', 'Red')  -- https://signature.carmelwines.co.il/carmel-signature/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GALIL MOUNTAIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Galil Mountain', 'Bar Syrah', 'Upper Galilee, Israel', 'Syrah', 'Red'),  -- https://www.galilmountain.co.il/en/wines/a/item/?ItemID=32
  ('Galil Mountain', 'Bar Cabernet Sauvignon', 'Upper Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.galilmountain.co.il/en/wines/a/item/?ItemID=23
  ('Galil Mountain', 'Bar Rosé', 'Israel', 'Syrah, Cabernet Franc, Grenache, Sangiovese', 'Rosé'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Bar White', 'Israel', 'Viognier, Chardonnay', 'White'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Galil Cabernet Sauvignon', 'Upper Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.galilmountain.co.il/en/wines/a/item/?ItemID=89
  ('Galil Mountain', 'Galil Alon', 'Upper Galilee, Israel', 'Cabernet Sauvignon, Merlot, Petit Verdot', 'Red'),  -- https://www.galilmountain.co.il/en/wines/a/item/?ItemID=35
  ('Galil Mountain', 'Misgav Am Vineyard', 'Upper Galilee, Israel', 'Cabernet Franc', 'Red'),  -- https://www.galilmountain.co.il/en/wines/a/item/?ItemID=53
  ('Galil Mountain', 'Hatzuk Vineyard', 'Upper Galilee, Israel', 'Syrah', 'Red'),  -- https://www.galilmountain.co.il/en/wines/a/item/?ItemID=59
  ('Galil Mountain', 'Haverim – Friends', 'Upper Galilee, Israel', 'Syrah, Cabernet Sauvignon', 'Red'),  -- https://www.galilmountain.co.il/en/wines/a/item/?ItemID=95
  ('Galil Mountain', 'Stav Rosé', 'Israel', null, 'Rosé'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Galil Rosé', 'Israel', null, 'Rosé'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Alon White', 'Israel', null, 'White'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Galil Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Galil Ela', 'Israel', null, 'Red'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Galil Syrah', 'Israel', 'Syrah', 'Red'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Aviv Rosé', 'Israel', null, 'Rosé'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Aviv White', 'Israel', null, 'White'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Aviv Red', 'Israel', null, 'Red'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Haverot', 'Israel', null, 'White'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Yiron Rosé', 'Israel', null, 'Rosé'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Yiron Sauvignon Blanc', 'Israel', 'Sauvignon Blanc', 'White'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Yiron White', 'Israel', null, 'White'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Yiron Syrah', 'Israel', 'Syrah', 'Red'),  -- https://www.galilmountain.co.il/en/
  ('Galil Mountain', 'Yiron Red', 'Upper Galilee, Israel', null, 'Red')  -- https://www.galilmountain.co.il/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SEGAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Segal', 'Fusion Red', 'Israel', null, 'Red'),  -- https://royalwine.com/brand/segal/
  ('Segal', 'Fusion White', 'Israel', null, 'White'),  -- https://royalwine.com/brand/segal/
  ('Segal', 'Special Reserve Merlot', 'Israel', 'Merlot', 'Red'),  -- https://royalwine.com/brand/segal/
  ('Segal', 'Special Reserve Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://royalwine.com/brand/segal/
  ('Segal', 'Special Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/segal/
  ('Segal', 'Unfiltered Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/segal/
  ('Segal', 'Petit Unfiltered Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red')  -- https://royalwine.com/brand/segal/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TABOR WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Tabor Winery', 'Tabor Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Tabor Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Tabor Gewürztraminer', 'Israel', 'Gewürztraminer', 'White'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Tabor Merlot', 'Israel', 'Merlot', 'Red'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Tabor Moscato', 'Israel', 'Muscat Canelli', 'Sparkling'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Tabor Moscato Rosa', 'Israel', 'Muscat Canelli, Merlot', 'Sparkling'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Tabor Rosé', 'Israel', 'Merlot', 'Rosé'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Tabor Shiraz', 'Israel', 'Shiraz', 'Red'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Tabor White Blend', 'Israel', 'Colombard, Sauvignon Blanc, Chenin Blanc', 'White'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Ramat Sirin Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Ramat Sirin Merlot', 'Israel', 'Merlot', 'Red'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Ramat Sirin Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Ramat Sirin Sauvignon Blanc', 'Israel', 'Sauvignon Blanc', 'White'),  -- https://www.taborwinery.co.il/en/
  ('Tabor Winery', 'Adama Merlot', 'Israel', 'Merlot', 'Red'),  -- https://royalwine.com/brand/tabor/
  ('Tabor Winery', 'Adama Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/tabor/
  ('Tabor Winery', 'Adama Barbera Rosé', 'Israel', 'Barbera', 'Rosé'),  -- https://royalwine.com/brand/tabor/
  ('Tabor Winery', 'Adama Sauvignon Blanc', 'Israel', 'Sauvignon Blanc', 'White'),  -- https://royalwine.com/brand/tabor/
  ('Tabor Winery', 'Malkiya Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/tabor/
  ('Tabor Winery', 'Single Vineyard Chardonnay', 'Israel', 'Chardonnay', 'White')  -- https://royalwine.com/brand/tabor/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BARKAN WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Barkan Wine Cellars', 'Classic Sauvignon Blanc', 'Israel', 'Sauvignon Blanc', 'White'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Classic Pinot Noir', 'Israel', 'Pinot Noir', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Classic Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Classic Petite Sirah', 'Israel', 'Petite Sirah', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Classic Merlot', 'Israel', 'Merlot', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Classic Shiraz', 'Israel', 'Shiraz', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Classic Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Classic Malbec', 'Israel', 'Malbec', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Classic Argaman', 'Israel', 'Argaman', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Reserve Merlot', 'Israel', 'Merlot', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Gold Merlot', 'Israel', 'Merlot', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Gold Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Gold Gewurztraminer', 'Israel', 'Gewurztraminer', 'White'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Gold Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Platinum Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/barkan/
  ('Barkan Wine Cellars', 'Superieur Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red')  -- https://royalwine.com/brand/barkan/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BINYAMINA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Binyamina', 'Yogev Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Yogev Cabernet Petit Verdot', 'Israel', 'Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Yogev Cabernet Shiraz', 'Israel', 'Cabernet Sauvignon, Shiraz', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Yogev Cabernet Merlot', 'Israel', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Yogev Chardonnay Sauvignon', 'Israel', 'Chardonnay, Sauvignon Blanc', 'White'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Reserve Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Reserve Merlot', 'Israel', 'Merlot', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Reserve Shiraz', 'Israel', 'Shiraz', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Moshava Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Moshava Merlot', 'Israel', 'Merlot', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Moshava Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Chosen Tarshish', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'Chosen Sapphire', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://royalwine.com/brand/binyamina/
  ('Binyamina', 'The Cave Winemaker''s Choice Petit Verdot', 'Israel', 'Petit Verdot', 'Red')  -- https://royalwine.com/brand/binyamina/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JERUSALEM WINERIES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Jerusalem Wineries', '5600 Special Reserve Cabernet Sauvignon Merlot Petit Verdot', 'Judean Hills, Israel', 'Cabernet Sauvignon, Merlot, Petit Verdot', 'Red'),  -- https://www.vivino.com/en/wineries/jerusalem
  ('Jerusalem Wineries', '5600 Special Reserve Cabernet Sauvignon Merlot', 'Judean Hills, Israel', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.vivino.com/en/wineries/jerusalem
  ('Jerusalem Wineries', 'Heritage Gewürztraminer', 'Judean Hills, Israel', 'Gewürztraminer', 'White'),  -- https://www.vivino.com/en/wineries/jerusalem
  ('Jerusalem Wineries', '4990 Single Vineyard Petit Verdot', 'Judean Hills, Israel', 'Petit Verdot', 'Red'),  -- https://www.vivino.com/en/wineries/jerusalem
  ('Jerusalem Wineries', 'The Windmill Project Old Vines Single Vineyard Petite Sirah', 'Judean Hills, Israel', 'Petite Sirah', 'Red'),  -- https://www.vivino.com/en/wineries/jerusalem
  ('Jerusalem Wineries', 'The Windmill Project Petit Verdot', 'Judean Hills, Israel', 'Petit Verdot', 'Red'),  -- https://www.vivino.com/en/wineries/jerusalem
  ('Jerusalem Wineries', 'Jerusalem Jubilee Single Vineyard Petit Verdot', 'Judean Hills, Israel', 'Petit Verdot', 'Red'),  -- https://www.vivino.com/en/wineries/jerusalem
  ('Jerusalem Wineries', 'Jerusalem Citadel Dry Marselan', 'Judean Hills, Israel', 'Marselan', 'Red'),  -- https://www.vivino.com/en/wineries/jerusalem
  ('Jerusalem Wineries', 'Jerusalem Legacy Red Blend', 'Judean Hills, Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/jerusalem
  ('Jerusalem Wineries', '3400 Premium Pinotage', 'Judean Hills, Israel', 'Pinotage', 'Red')  -- https://www.vivino.com/en/wineries/jerusalem
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HAYOTZER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Hayotzer', 'Lyrica Barbera', 'Israel', 'Barbera', 'Red'),  -- https://www.hayotzerwine.co.il/
  ('Hayotzer', 'Lyrica Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.hayotzerwine.co.il/
  ('Hayotzer', 'Lyrica', 'Galilee, Israel', 'Grenache, Syrah, Mourvedre', 'Red'),  -- https://www.firstleaf.com/a/wine-directory/product/lyrica-hayotzer
  ('Hayotzer', 'Lyrica Syrah', 'Galilee, Israel', 'Syrah', 'Red'),  -- https://www.firstleaf.com/a/wine-directory/product/lyrica-hayotzer-40427
  ('Hayotzer', 'Lyrica Meritage', 'Galilee, Israel', 'Cabernet Sauvignon, Merlot, Petit Verdot, Cabernet Franc', 'Red')  -- https://bestbuyliquors.com/hayotzer-lyrica-meritage-2014
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DU CASTEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Domaine du Castel', 'Grand Vin', 'Judean Hills, Israel', 'Cabernet Sauvignon, Merlot, Petit Verdot, Cabernet Franc', 'Red'),  -- https://castel.co.il/en/wines-2022/
  ('Domaine du Castel', 'C Blanc du Castel', 'Judean Hills, Israel', 'Chardonnay', 'White'),  -- https://castel.co.il/en/wines-2022/
  ('Domaine du Castel', 'Petit Castel', 'Judean Hills, Israel', 'Merlot, Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://castel.co.il/en/wines-2022/
  ('Domaine du Castel', 'Rosé du Castel', 'Judean Hills, Israel', 'Merlot, Malbec, Cabernet Franc', 'Rosé'),  -- https://castel.co.il/en/wines-2022/
  ('Domaine du Castel', 'La Vie Rouge du Castel', 'Judean Hills, Israel', 'Cabernet Sauvignon, Merlot, Cabernet Franc, Malbec, Petit Verdot, Syrah', 'Red'),  -- https://castel.co.il/en/wines-2022/
  ('Domaine du Castel', 'La Vie Blanc du Castel', 'Judean Hills, Israel', 'Sauvignon Blanc, Chardonnay, Gewurztraminer', 'White'),  -- https://castel.co.il/en/wines-2022/
  ('Domaine du Castel', 'M du Castel', 'Judean Hills, Israel', 'Muscat', 'Sweet')  -- https://castel.co.il/en/wines-2022/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FLAM WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Flam Winery', 'Classico', 'Judean Hills, Israel', 'Petit Verdot, Syrah, Cabernet Sauvignon, Merlot, Malbec, Cabernet Franc', 'Red'),  -- https://www.flamwinery.com/en/product/classico/
  ('Flam Winery', 'Noble', 'Judean Hills, Israel', 'Cabernet Sauvignon, Cabernet Franc, Syrah, Petit Verdot', 'Red'),  -- https://www.flamwinery.com/en/product/noble/
  ('Flam Winery', 'Even Sapir', 'Judean Hills, Israel', 'Syrah, Cabernet Sauvignon, Cabernet Franc, Petit Verdot', 'Red'),  -- https://www.flamwinery.com/en/product/even-sapir/
  ('Flam Winery', 'Camellia', 'Judean Hills, Israel', 'Chardonnay, Sauvignon Blanc', 'White'),  -- https://www.flamwinery.com/en/product/camellia/
  ('Flam Winery', 'Blanc', 'Judean Hills, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.flamwinery.com/en/
  ('Flam Winery', 'Rosé', 'Judean Hills, Israel', null, 'Rosé')  -- https://www.flamwinery.com/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SHILOH WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Shiloh Winery', 'Chenin Blanc', 'Shomron, Israel', 'Chenin Blanc', 'White'),  -- https://www.shilohwinery.com/whites
  ('Shiloh Winery', 'Chardonnay', 'Shomron, Israel', 'Chardonnay', 'White'),  -- https://www.shilohwinery.com/whites
  ('Shiloh Winery', 'Sauvignon Blanc', 'Shomron, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.shilohwinery.com/whites
  ('Shiloh Winery', 'Rosé', 'Shomron, Israel', null, 'Rosé')  -- https://www.shilohwinery.com/whites
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- YATIR WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Yatir Winery', 'Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/yatir-winery
  ('Yatir Winery', 'Petit Verdot', 'Israel', 'Petit Verdot', 'Red'),  -- https://www.vivino.com/en/wineries/yatir-winery
  ('Yatir Winery', 'White Mt. Amasa', 'Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/yatir-winery
  ('Yatir Winery', 'Creek White', 'Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/yatir-winery
  ('Yatir Winery', 'Darom White', 'Israel', null, 'White')  -- https://www.vivino.com/en/wineries/yatir-winery
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DE GAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Clos de Gat', 'Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/yatir-winery
  ('Clos de Gat', 'Har''El Syrah', 'Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/yatir-winery
  ('Clos de Gat', 'Har''El Merlot', 'Israel', 'Merlot', 'Red')  -- https://www.vivino.com/en/wineries/yatir-winery
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PSAGOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Psagot', 'Red Blend', 'Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/psagot
  ('Psagot', 'Single Vineyard Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/psagot
  ('Psagot', 'Malbec', 'Israel', 'Malbec', 'Red'),  -- https://www.vivino.com/en/wineries/psagot
  ('Psagot', 'Special Reserve Edom Red', 'Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/psagot
  ('Psagot', 'Edom Red', 'Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/psagot
  ('Psagot', 'Jerusalem Mountain Vineyards Rosé', 'Israel', null, 'Rosé')  -- https://www.vivino.com/en/wineries/psagot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VITKIN WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Vitkin Winery', 'Insight Macabeo', 'Israel', 'Macabeo', 'White'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Grenache Noir', 'Israel', 'Grenache Noir', 'Red'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Petite Sirah', 'Israel', 'Petite Sirah', 'Red'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Carignan', 'Israel', 'Carignan', 'Red'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Cabernet Franc', 'Israel', 'Cabernet Franc', 'Red'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Grenache Blanc', 'Israel', 'Grenache Blanc', 'White'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Israeli Journey Special Edition Red', 'Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Old Vines Carignan', 'Israel', 'Carignan', 'Red'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Israeli Journey Rosé', 'Israel', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Israeli Journey White', 'Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/vitkin
  ('Vitkin Winery', 'Gewürztraminer', 'Israel', 'Gewürztraminer', 'White')  -- https://www.vivino.com/en/wineries/vitkin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TULIP ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Tulip', 'Petit Verdot Reserve', 'Israel', 'Petit Verdot', 'Red'),  -- https://www.vivino.com/en/wineries/tulip
  ('Tulip', 'Mata Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/tulip
  ('Tulip', 'Syrah Reserve', 'Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/tulip
  ('Tulip', 'Givat Ada Mourvèdre', 'Israel', 'Mourvèdre', 'Red'),  -- https://www.vivino.com/en/wineries/tulip
  ('Tulip', 'Franc - Merlot Reserve', 'Israel', 'Cabernet Franc, Merlot', 'Red'),  -- https://www.vivino.com/en/wineries/tulip
  ('Tulip', 'White Franc', 'Israel', 'Cabernet Franc', 'White'),  -- https://www.vivino.com/en/wineries/tulip
  ('Tulip', 'Mostly Shiraz', 'Israel', 'Shiraz', 'Red')  -- https://www.vivino.com/en/wineries/tulip
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TZORA VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Tzora Vineyards', 'Shoresh Blanc', 'Judean Hills, Israel', null, 'White'),  -- https://www.tzoravineyards.com/en/wines
  ('Tzora Vineyards', 'Judean Hills Blanc', 'Judean Hills, Israel', null, 'White'),  -- https://www.tzoravineyards.com/en/wines
  ('Tzora Vineyards', 'Or', 'Judean Hills, Israel', null, 'Sweet'),  -- https://www.tzoravineyards.com/en/wines
  ('Tzora Vineyards', 'Judean Hills Red', 'Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/tzora
  ('Tzora Vineyards', 'Neve Ilan Blanc', 'Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/tzora
  ('Tzora Vineyards', 'River-Bed Stone Valley Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/tzora
  ('Tzora Vineyards', 'Ilan Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/tzora
  ('Tzora Vineyards', 'Ilan Merlot', 'Israel', 'Merlot', 'Red')  -- https://www.vivino.com/en/wineries/tzora
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PELTER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Pelter', 'T-Selection Petit Verdot', 'Israel', 'Petit Verdot', 'Red'),  -- https://www.vivino.com/en/wineries/pelter
  ('Pelter', 'T-Selection Cabernet Franc', 'Israel', 'Cabernet Franc', 'Red'),  -- https://www.vivino.com/en/wineries/pelter
  ('Pelter', 'Vinoir Red', 'Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/pelter
  ('Pelter', 'Rosé', 'Israel', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/pelter
  ('Pelter', 'T-Selection Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/pelter
  ('Pelter', 'Cabernet - Shiraz', 'Israel', 'Cabernet Sauvignon, Shiraz', 'Red'),  -- https://www.vivino.com/en/wineries/pelter
  ('Pelter', 'T-Selection Barbera', 'Israel', 'Barbera', 'Red'),  -- https://www.vivino.com/en/wineries/pelter
  ('Pelter', 'T-Selection GSM', 'Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/pelter
  ('Pelter', 'T-Selection Shiraz', 'Israel', 'Shiraz', 'Red'),  -- https://www.vivino.com/en/wineries/pelter
  ('Pelter', 'T-Selection Shiraz - Grenache', 'Israel', 'Shiraz, Grenache', 'Red')  -- https://www.vivino.com/en/wineries/pelter
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JEZREEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Jezreel', 'Kerem Kedesh Syrah', 'Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/jezreel
  ('Jezreel', 'Red Blend', 'Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/jezreel
  ('Jezreel', 'Special Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/jezreel
  ('Jezreel', 'Single Vineyard Argaman', 'Israel', 'Argaman', 'Red'),  -- https://www.vivino.com/en/wineries/jezreel
  ('Jezreel', 'Kerem Nilly Argaman', 'Israel', 'Argaman', 'Red'),  -- https://www.vivino.com/en/wineries/jezreel
  ('Jezreel', 'Carignan', 'Israel', 'Carignan', 'Red'),  -- https://www.vivino.com/en/wineries/jezreel
  ('Jezreel', 'Syrah', 'Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/jezreel
  ('Jezreel', 'Single Vineyard Carignan', 'Israel', 'Carignan', 'Red')  -- https://www.vivino.com/en/wineries/jezreel
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SPHERA WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Sphera Winery', 'White Signature', 'Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/sphera
  ('Sphera Winery', 'White Concepts Sauvignon Blanc', 'Israel', 'Sauvignon Blanc', 'White'),  -- https://www.vivino.com/en/wineries/sphera
  ('Sphera Winery', 'White Concepts First Page', 'Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/sphera
  ('Sphera Winery', 'White Concepts Riesling', 'Israel', 'Riesling', 'White'),  -- https://www.vivino.com/en/wineries/sphera
  ('Sphera Winery', 'White Concepts Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/sphera
  ('Sphera Winery', 'Sarona Colony Rosé', 'Israel', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/sphera
  ('Sphera Winery', 'White Concepts Once', 'Israel', null, 'White')  -- https://www.vivino.com/en/wineries/sphera
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GVAOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Gvaot', 'Gofna Cabernet Franc', 'Israel', 'Cabernet Franc', 'Red'),  -- https://www.vivino.com/en/wineries/gvaot
  ('Gvaot', 'Gofna Reserve Cabernet Franc', 'Israel', 'Cabernet Franc', 'Red'),  -- https://www.vivino.com/en/wineries/gvaot
  ('Gvaot', 'Masada Pinot Noir', 'Israel', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/gvaot
  ('Gvaot', 'Gofna Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/gvaot
  ('Gvaot', 'Gofna Reserve Petit Verdot', 'Israel', 'Petit Verdot', 'Red'),  -- https://www.vivino.com/en/wineries/gvaot
  ('Gvaot', 'Gofna Reserve Pinot Noir', 'Israel', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/gvaot
  ('Gvaot', 'Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red')  -- https://www.vivino.com/en/wineries/gvaot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BAT SHLOMO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Bat Shlomo', 'Non-Meshuval Rosé', 'Israel', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/bat-shlomo
  ('Bat Shlomo', 'Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/bat-shlomo
  ('Bat Shlomo', 'Sauvignon Blanc', 'Israel', 'Sauvignon Blanc', 'White'),  -- https://www.vivino.com/en/wineries/bat-shlomo
  ('Bat Shlomo', 'White Elegant Blend', 'Israel', null, 'White')  -- https://www.vivino.com/en/wineries/bat-shlomo
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ASSAF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Assaf', 'Moise Single Vineyard Grand Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', '50 - 50 Cabernet Sauvignon - Shiraz', 'Israel', 'Cabernet Sauvignon, Shiraz', 'Red'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', 'Shiraz', 'Israel', 'Shiraz', 'Red'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', 'Rujum 91 Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', 'Reserve Shiraz', 'Israel', 'Shiraz', 'Red'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', '4 Seasons Pinotage', 'Israel', 'Pinotage', 'Red'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', 'Cabernet Sauvignon Silver', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', 'Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', 'Pinot Gris', 'Israel', 'Pinot Gris', 'White'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', 'Colombard', 'Israel', 'Colombard', 'White'),  -- https://www.vivino.com/en/wineries/assaf
  ('Assaf', 'Chenin Blanc', 'Israel', 'Chenin Blanc', 'White')  -- https://www.vivino.com/en/wineries/assaf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARGALIT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Margalit', 'Paradigma', 'Coastal Plain, Israel', null, 'Red'),  -- https://www.skurnik.com/producer/margalit/
  ('Margalit', 'Cabernet Sauvignon', 'Coastal Plain, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.skurnik.com/producer/margalit/
  ('Margalit', 'Cabernet Franc', 'Coastal Plain, Israel', 'Cabernet Franc', 'Red'),  -- https://www.skurnik.com/producer/margalit/
  ('Margalit', 'Enigma', 'Coastal Plain, Israel', null, 'Red'),  -- https://www.skurnik.com/producer/margalit/
  ('Margalit', 'Cabernet Sauvignon Special Reserve', 'Coastal Plain, Israel', 'Cabernet Sauvignon', 'Red')  -- https://www.skurnik.com/producer/margalit/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TURA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Tura', 'Merlot', 'Israel', 'Merlot', 'Red'),  -- https://shop.turawinery.com/
  ('Tura', 'Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://shop.turawinery.com/
  ('Tura', 'Cabernet Sauvignon Vista', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://shop.turawinery.com/
  ('Tura', 'Sauvignon Blanc', 'Israel', 'Sauvignon Blanc', 'White'),  -- https://shop.turawinery.com/
  ('Tura', 'Dolcetto', 'Israel', 'Dolcetto', 'Red'),  -- https://shop.turawinery.com/
  ('Tura', 'Pinot Noir', 'Israel', 'Pinot Noir', 'Red'),  -- https://shop.turawinery.com/
  ('Tura', 'Chardonnay', 'Israel', 'Chardonnay', 'White'),  -- https://shop.turawinery.com/
  ('Tura', 'Cabernet Franc', 'Israel', 'Cabernet Franc', 'Red'),  -- https://shop.turawinery.com/
  ('Tura', 'Marselan', 'Israel', 'Marselan', 'Red'),  -- https://shop.turawinery.com/
  ('Tura', 'Shiraz', 'Israel', 'Shiraz', 'Red'),  -- https://shop.turawinery.com/
  ('Tura', 'Rosé', 'Israel', null, 'Rosé')  -- https://shop.turawinery.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NETOFA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Netofa', 'Masei Red', 'Galilee, Israel', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://netofa.com/en/shop
  ('Netofa', 'Masei Rosé', 'Galilee, Israel', null, 'Rosé'),  -- https://netofa.com/en/shop
  ('Netofa', 'Masei White', 'Galilee, Israel', 'Vermentino, Grenache Blanc', 'White'),  -- https://netofa.com/en/shop
  ('Netofa', 'Masei Gamay Noir', 'Galilee, Israel', 'Gamay', 'Red'),  -- https://netofa.com/en/shop
  ('Netofa', 'Latour Tzahov', 'Galilee, Israel', 'Roussanne, Chenin Blanc', 'White'),  -- https://netofa.com/en/shop
  ('Netofa', 'Latour Red', 'Galilee, Israel', 'Syrah, Mourvèdre', 'Red'),  -- https://netofa.com/en/shop
  ('Netofa', 'Latour Rosado', 'Galilee, Israel', 'Tempranillo', 'Rosé'),  -- https://netofa.com/en/shop
  ('Netofa', 'Latour White', 'Galilee, Israel', 'Chenin Blanc', 'White'),  -- https://netofa.com/en/shop
  ('Netofa', 'Tel Qasser Red', 'Galilee, Israel', 'Grenache, Syrah', 'Red'),  -- https://netofa.com/en/shop
  ('Netofa', 'Tel Qasser White', 'Galilee, Israel', 'Roussanne', 'White'),  -- https://netofa.com/en/shop
  ('Netofa', 'Tel Qasser Rosé', 'Galilee, Israel', 'Grenache, Syrah', 'Rosé'),  -- https://netofa.com/en/shop
  ('Netofa', 'Dor Syrah', 'Galilee, Israel', 'Syrah', 'Red'),  -- https://netofa.com/en/shop
  ('Netofa', 'Dor Tempranillo', 'Galilee, Israel', 'Tempranillo', 'Red'),  -- https://netofa.com/en/shop
  ('Netofa', 'LBV', 'Galilee, Israel', null, 'Fortified'),  -- https://netofa.com/en/shop
  ('Netofa', 'Ruby', 'Galilee, Israel', 'Touriga Nacional, Tempranillo', 'Fortified'),  -- https://netofa.com/en/shop
  ('Netofa', 'Tawny', 'Galilee, Israel', null, 'Fortified'),  -- https://netofa.com/en/shop
  ('Netofa', 'VDN', 'Galilee, Israel', 'Chenin Blanc', 'Fortified')  -- https://netofa.com/en/shop
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KISHOR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Kishor', 'Red', 'Galilee, Israel', null, 'Red'),  -- https://kishor-winery.co.il/shop/
  ('Kishor', 'White', 'Galilee, Israel', null, 'White'),  -- https://kishor-winery.co.il/shop/
  ('Kishor', 'Rosé', 'Galilee, Israel', null, 'Rosé'),  -- https://kishor-winery.co.il/shop/
  ('Kishor', 'Cabernet Franc', 'Galilee, Israel', 'Cabernet Franc', 'Red'),  -- https://kishor-winery.co.il/shop/
  ('Kishor', 'Sauvignon Blanc', 'Galilee, Israel', 'Sauvignon Blanc', 'White'),  -- https://kishor-winery.co.il/shop/
  ('Kishor', 'Viognier', 'Galilee, Israel', 'Viognier', 'White'),  -- https://kishor-winery.co.il/shop/
  ('Kishor', 'Dry Riesling', 'Galilee, Israel', 'Riesling', 'White'),  -- https://kishor-winery.co.il/shop/
  ('Kishor', 'Tefen Red', 'Galilee, Israel', null, 'Red'),  -- https://kishor-winery.co.il/shop/
  ('Kishor', 'Tefen White', 'Galilee, Israel', null, 'White')  -- https://kishor-winery.co.il/shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RAZI'EL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Razi''el', 'Red', 'Israel', null, 'Red')  -- https://8wines.com/wines/israel?id=8
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LEWINSOHN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Lewinsohn', 'Garage de Papa Blanc', 'Upper Galilee, Israel', 'Chardonnay', 'White'),  -- https://www.palatepress.com/tag/lewinsohn
  ('Lewinsohn', 'Garage de Papa Rouge', 'Israel', null, 'Red')  -- https://delectable.com/wine/lewinsohn/garage-de-papa-rouge--red-blend/2017
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ELLA VALLEY VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Ella Valley Vineyards', 'Merlot', 'Israel', 'Merlot', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/ella-valley-vineyards/1165
  ('Ella Valley Vineyards', 'Ever Red', 'Judean Hills, Israel', null, 'Red'),  -- https://www.nataliemaclean.com/wineries/info/ella-valley-vineyards/1165
  ('Ella Valley Vineyards', 'Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/ella-valley-vineyards/1165
  ('Ella Valley Vineyards', 'Sauvignon Blanc', 'Israel', 'Sauvignon Blanc', 'White'),  -- https://www.nataliemaclean.com/wineries/info/ella-valley-vineyards/1165
  ('Ella Valley Vineyards', 'Chardonnay', 'Israel', 'Chardonnay', 'White')  -- https://www.nataliemaclean.com/wineries/info/ella-valley-vineyards/1165
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RAMAT NEGEV ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Ramat Negev', 'Neve Midbar Orange', 'Negev, Israel', 'Pinot Gris, Semillon', 'Orange'),  -- https://www.rnwinery.co.il/?p=1980
  ('Ramat Negev', 'Neve Midbar Cabernet Sauvignon', 'Negev, Israel', 'Cabernet Sauvignon, Petit Verdot', 'Red'),  -- https://www.rnwinery.co.il/?p=1980
  ('Ramat Negev', 'Neve Midbar White', 'Negev, Israel', 'Chardonnay, Sauvignon Blanc', 'White'),  -- https://www.rnwinery.co.il/?p=1980
  ('Ramat Negev', 'Neve Midbar Sauvignon Blanc Autumn', 'Negev, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.rnwinery.co.il/?p=1980
  ('Ramat Negev', 'Neve Midbar Chardonnay Spring', 'Negev, Israel', 'Chardonnay', 'White'),  -- https://www.rnwinery.co.il/?p=1980
  ('Ramat Negev', 'Neve Midbar Pinot Gris', 'Negev, Israel', 'Pinot Gris', 'White'),  -- https://www.rnwinery.co.il/?p=1980
  ('Ramat Negev', 'Neve Midbar Syrah', 'Negev, Israel', 'Syrah, Merlot', 'Red'),  -- https://www.rnwinery.co.il/?p=1980
  ('Ramat Negev', 'Midbar Adom', 'Negev, Israel', null, 'Red'),  -- https://www.rnwinery.co.il/?p=1980
  ('Ramat Negev', 'Kadesh Barnea Cabernet Sauvignon', 'Negev, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.rnwinery.co.il/en/kadesh-barnea-series/
  ('Ramat Negev', 'Kadesh Barnea Merlot', 'Negev, Israel', 'Merlot', 'Red'),  -- https://www.rnwinery.co.il/en/kadesh-barnea-series/
  ('Ramat Negev', 'Kadesh Barnea Negev', 'Negev, Israel', 'Cabernet Sauvignon, Shiraz, Cabernet Franc', 'Red'),  -- https://www.rnwinery.co.il/en/kadesh-barnea-series/
  ('Ramat Negev', 'Kadesh Barnea Malbec', 'Negev, Israel', 'Malbec', 'Red'),  -- https://www.rnwinery.co.il/en/kadesh-barnea-series/
  ('Ramat Negev', 'Kadesh Barnea Rosé', 'Negev, Israel', 'Cabernet Franc', 'Rosé'),  -- https://www.rnwinery.co.il/en/kadesh-barnea-series/
  ('Ramat Negev', 'Kadesh Barnea Gewürztraminer', 'Negev, Israel', 'Gewürztraminer', 'White'),  -- https://www.rnwinery.co.il/en/kadesh-barnea-series/
  ('Ramat Negev', 'Ramon Petit Verdot', 'Negev, Israel', 'Petit Verdot', 'Red'),  -- https://www.rnwinery.co.il/en/ramon-series/
  ('Ramat Negev', 'Ramon Cabernet Franc', 'Negev, Israel', 'Cabernet Franc', 'Red'),  -- https://www.rnwinery.co.il/en/ramon-series/
  ('Ramat Negev', 'Ramon Malbec', 'Negev, Israel', 'Malbec', 'Red'),  -- https://www.rnwinery.co.il/en/ramon-series/
  ('Ramat Negev', 'Exodus Rosé', 'Negev, Israel', 'Cabernet Franc, Syrah', 'Rosé'),  -- https://www.rnwinery.co.il/en/exodus-series/
  ('Ramat Negev', 'Exodus White', 'Negev, Israel', 'Chenin Blanc, Chardonnay, Semillon', 'White'),  -- https://www.rnwinery.co.il/en/exodus-series/
  ('Ramat Negev', 'Exodus Reserve Bordo', 'Negev, Israel', 'Petit Verdot, Malbec, Cabernet Franc', 'Red'),  -- https://www.rnwinery.co.il/en/exodus-series/
  ('Ramat Negev', 'Exodus Grand Reserve Red', 'Negev, Israel', 'Malbec, Petit Verdot', 'Red'),  -- https://www.rnwinery.co.il/en/exodus-series/
  ('Ramat Negev', 'Golden Port', 'Negev, Israel', 'Gewürztraminer', 'Sweet'),  -- https://www.rnwinery.co.il/en/spacial-wines-series/
  ('Ramat Negev', 'Port', 'Negev, Israel', 'Cabernet Sauvignon, Shiraz', 'Fortified')  -- https://www.rnwinery.co.il/en/spacial-wines-series/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HAR BRACHA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Har Bracha', 'Gewurztraminer', 'Shomron, Israel', 'Gewurztraminer', 'White'),  -- https://winewarehousestore.com/blogs/taste-and-ritual/discover-har-bracha-winery-a-taste-of-israels-samarian-hills
  ('Har Bracha', 'Highlander Cabernet Franc', 'Shomron, Israel', 'Cabernet Franc', 'Red'),  -- https://winewarehousestore.com/blogs/taste-and-ritual/discover-har-bracha-winery-a-taste-of-israels-samarian-hills
  ('Har Bracha', 'Highlander Shiraz Merlot', 'Shomron, Israel', 'Shiraz, Merlot', 'Red'),  -- https://winewarehousestore.com/blogs/taste-and-ritual/discover-har-bracha-winery-a-taste-of-israels-samarian-hills
  ('Har Bracha', 'Highlander Cabernet Sauvignon Special Reserve', 'Shomron, Israel', 'Cabernet Sauvignon, Petit Verdot, Merlot', 'Red'),  -- https://winewarehousestore.com/blogs/taste-and-ritual/discover-har-bracha-winery-a-taste-of-israels-samarian-hills
  ('Har Bracha', 'Jozef Cabernet Sauvignon', 'Shomron, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://winewarehousestore.com/blogs/taste-and-ritual/discover-har-bracha-winery-a-taste-of-israels-samarian-hills
  ('Har Bracha', 'Jozef Merlot', 'Shomron, Israel', 'Merlot', 'Red')  -- https://winewarehousestore.com/blogs/taste-and-ritual/discover-har-bracha-winery-a-taste-of-israels-samarian-hills
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RAMOT NAFTALY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Ramot Naftaly', 'Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/ramot-naftaly
  ('Ramot Naftaly', 'Barbera', 'Israel', 'Barbera', 'Red'),  -- https://www.vivino.com/en/wineries/ramot-naftaly
  ('Ramot Naftaly', 'Rosé', 'Israel', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/ramot-naftaly
  ('Ramot Naftaly', 'Malbec', 'Israel', 'Malbec', 'Red'),  -- https://www.vivino.com/en/wineries/ramot-naftaly
  ('Ramot Naftaly', 'Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/ramot-naftaly
  ('Ramot Naftaly', 'Petit Verdot', 'Israel', 'Petit Verdot', 'Red'),  -- https://www.vivino.com/en/wineries/ramot-naftaly
  ('Ramot Naftaly', 'Special Edition Shiraz', 'Israel', 'Shiraz', 'Red')  -- https://www.vivino.com/en/wineries/ramot-naftaly
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BAZELET HAGOLAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Bazelet HaGolan', '188 Limited Edition Cabernet Sauvignon', 'Golan Heights, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/bazelet-hagolan
  ('Bazelet HaGolan', '188 Cabernet Sauvignon', 'Golan Heights, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/bazelet-hagolan
  ('Bazelet HaGolan', 'Merlot Reserve', 'Golan Heights, Israel', 'Merlot', 'Red'),  -- https://www.vivino.com/en/wineries/bazelet-hagolan
  ('Bazelet HaGolan', 'Cabernet Sauvignon Bronze', 'Golan Heights, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/bazelet-hagolan
  ('Bazelet HaGolan', 'Cabernet Sauvignon Reserve', 'Golan Heights, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/bazelet-hagolan
  ('Bazelet HaGolan', 'Chardonnay Reserve', 'Golan Heights, Israel', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/bazelet-hagolan
  ('Bazelet HaGolan', 'Rosé', 'Golan Heights, Israel', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/bazelet-hagolan
  ('Bazelet HaGolan', 'Negev Golan Chardonnay', 'Golan Heights, Israel', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/bazelet-hagolan
  ('Bazelet HaGolan', 'Negev Golan Cabernet Sauvignon', 'Golan Heights, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/bazelet-hagolan
  ('Bazelet HaGolan', 'Negev Golan Merlot', 'Golan Heights, Israel', 'Merlot', 'Red')  -- https://www.vivino.com/en/wineries/bazelet-hagolan
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ODEM MOUNTAIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Odem Mountain', '1060 Single Vineyard Cabernet Sauvignon', 'Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/odem-mountain
  ('Odem Mountain', 'Amber Red', 'Galilee, Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/odem-mountain
  ('Odem Mountain', 'Reserve Syrah', 'Galilee, Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/odem-mountain
  ('Odem Mountain', 'Amber White', 'Galilee, Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/odem-mountain
  ('Odem Mountain', 'Reserve Cabernet Franc', 'Galilee, Israel', 'Cabernet Franc', 'Red'),  -- https://www.vivino.com/en/wineries/odem-mountain
  ('Odem Mountain', 'Reserve Nebbiolo Syrah', 'Galilee, Israel', 'Nebbiolo, Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/odem-mountain
  ('Odem Mountain', 'Alfasi Dry White', 'Galilee, Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/odem-mountain
  ('Odem Mountain', 'Limited Dry Red', 'Galilee, Israel', null, 'Red')  -- https://www.vivino.com/en/wineries/odem-mountain
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LUERIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Lueria', 'Special Edition Syrah', 'Galilee, Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/lueria
  ('Lueria', 'Malbec', 'Galilee, Israel', 'Malbec', 'Red'),  -- https://www.vivino.com/en/wineries/lueria
  ('Lueria', 'Sharkia Late Harvest', 'Galilee, Israel', null, 'Sweet'),  -- https://www.vivino.com/en/wineries/lueria
  ('Lueria', 'Shiraz', 'Galilee, Israel', 'Shiraz', 'Red'),  -- https://www.vivino.com/en/wineries/lueria
  ('Lueria', 'Cabernet Sauvignon', 'Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/lueria
  ('Lueria', 'Gewurztraminer', 'Galilee, Israel', 'Gewurztraminer', 'White'),  -- https://www.vivino.com/en/wineries/lueria
  ('Lueria', 'Pinot Grigio', 'Galilee, Israel', 'Pinot Grigio', 'White'),  -- https://www.vivino.com/en/wineries/lueria
  ('Lueria', 'Barbera', 'Galilee, Israel', 'Barbera', 'Red'),  -- https://www.vivino.com/en/wineries/lueria
  ('Lueria', 'Gewurztraminer Pinot Grigio Special Edition', 'Galilee, Israel', 'Gewurztraminer, Pinot Grigio', 'White'),  -- https://www.vivino.com/en/wineries/lueria
  ('Lueria', 'Rouge Haute Galilée', 'Upper Galilee, Israel', null, 'Red')  -- https://www.vivino.com/en/wineries/lueria
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KITRON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Kitron', 'Reserve Cabernet Sauvignon', 'Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/kitron
  ('Kitron', 'Reserve Shiraz', 'Galilee, Israel', 'Shiraz', 'Red'),  -- https://www.vivino.com/en/wineries/kitron
  ('Kitron', 'Reserve Chardonnay', 'Galilee, Israel', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/kitron
  ('Kitron', 'Reserve Gewürztraminer', 'Galilee, Israel', 'Gewürztraminer', 'White'),  -- https://www.vivino.com/en/wineries/kitron
  ('Kitron', 'Gewürztraminer', 'Galilee, Israel', 'Gewürztraminer', 'White'),  -- https://www.vivino.com/en/wineries/kitron
  ('Kitron', 'Dessert', 'Galilee, Israel', null, 'Sweet'),  -- https://www.vivino.com/en/wineries/kitron
  ('Kitron', 'Reserve Merlot', 'Galilee, Israel', 'Merlot', 'Red'),  -- https://www.vivino.com/en/wineries/kitron
  ('Kitron', 'Shiraz', 'Galilee, Israel', 'Shiraz', 'Red'),  -- https://www.vivino.com/en/wineries/kitron
  ('Kitron', 'Chardonnay', 'Galilee, Israel', 'Chardonnay', 'White')  -- https://www.vivino.com/en/wineries/kitron
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SOMEK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Somek', 'Cabernet Franc', 'Mount Carmel, Israel', 'Cabernet Franc', 'Red'),  -- https://www.vivino.com/en/wineries/somek
  ('Somek', 'Syrah', 'Mount Carmel, Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/somek
  ('Somek', 'Single Vineyard Syrah', 'Mount Carmel, Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/somek
  ('Somek', 'Carignan', 'Mount Carmel, Israel', 'Carignan', 'Red'),  -- https://www.vivino.com/en/wineries/somek
  ('Somek', 'Rosé', 'Mount Carmel, Israel', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/somek
  ('Somek', 'Adom', 'Mount Carmel, Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/somek
  ('Somek', 'Sauvignon Blanc', 'Mount Carmel, Israel', 'Sauvignon Blanc', 'White')  -- https://www.vivino.com/en/wineries/somek
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ADIR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Adir', 'Plot Ninety Eight Blush', 'Galilee, Israel', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/adir
  ('Adir', 'Limited Edition Cabernet Sauvignon', 'Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/adir
  ('Adir', 'Kerem Ben Zimra Blush Port', 'Galilee, Israel', null, 'Fortified'),  -- https://www.vivino.com/en/wineries/adir
  ('Adir', 'Winemaker Edition Malbec', 'Galilee, Israel', 'Malbec', 'Red'),  -- https://www.vivino.com/en/wineries/adir
  ('Adir', 'Winemaker Edition A Red Blend', 'Galilee, Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/adir
  ('Adir', 'A Red', 'Galilee, Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/adir
  ('Adir', 'Winemaker Petite Sirah', 'Galilee, Israel', 'Petite Sirah', 'Red'),  -- https://www.vivino.com/en/wineries/adir
  ('Adir', 'Kerem Ben Zimra Grenache Blanc', 'Galilee, Israel', 'Grenache Blanc', 'White'),  -- https://www.vivino.com/en/wineries/adir
  ('Adir', 'Kerem Ben Zimra Colombard', 'Galilee, Israel', 'Colombard', 'White'),  -- https://www.vivino.com/en/wineries/adir
  ('Adir', 'Special Edition Cabernet Sauvignon', 'Galilee, Israel', 'Cabernet Sauvignon', 'Red')  -- https://www.vivino.com/en/wineries/adir
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FELDSTEIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Feldstein', 'Gilgamesh', 'Galilee, Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Syrah', 'Galilee, Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Cabernet Sauvignon', 'Galilee, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Semillon', 'Galilee, Israel', 'Semillon', 'White'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Grenache Rosé', 'Galilee, Israel', 'Grenache', 'Rosé'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Ishtar', 'Galilee, Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Roussanne', 'Galilee, Israel', 'Roussanne', 'White'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Sauvignon Blanc', 'Galilee, Israel', 'Sauvignon Blanc', 'White'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Sémillon Sauvignon', 'Galilee, Israel', 'Sémillon, Sauvignon Blanc', 'White'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Shalem', 'Galilee, Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Sauvignon Blanc Roussanne', 'Galilee, Israel', 'Sauvignon Blanc, Roussanne', 'White'),  -- https://www.vivino.com/en/wineries/feldstein
  ('Feldstein', 'Shemesh', 'Galilee, Israel', null, 'Red')  -- https://www.vivino.com/en/wineries/feldstein
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- AGUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Agur', 'Layam Blanc', 'Judean Hills, Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/agur
  ('Agur', 'Rosa', 'Judean Hills, Israel', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/agur
  ('Agur', 'Blanc', 'Judean Hills, Israel', null, 'White'),  -- https://www.vivino.com/en/wineries/agur
  ('Agur', 'Reinecke Edition Syrah', 'Judean Hills, Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/agur
  ('Agur', 'Cabernet Sauvignon', 'Judean Hills, Israel', 'Cabernet Sauvignon', 'Red')  -- https://www.vivino.com/en/wineries/agur
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SEA HORSE WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Sea Horse Winery', 'Wild Syrah', 'Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/sea-horse
  ('Sea Horse Winery', 'Wild Chenin Blanc', 'Israel', 'Chenin Blanc', 'White'),  -- https://www.vivino.com/en/wineries/sea-horse
  ('Sea Horse Winery', 'Sauvignon Blanc Chenin Blanc', 'Israel', 'Sauvignon Blanc, Chenin Blanc', 'White')  -- https://www.vivino.com/en/wineries/sea-horse
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HEVRON HEIGHTS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Hevron Heights', 'The Jacob''s Ladder Cabernet Sauvignon', 'Judean Hills, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/hevron-heights
  ('Hevron Heights', 'Isaac''s Ram Cabernet Franc', 'Judean Hills, Israel', 'Cabernet Franc', 'Red'),  -- https://www.vivino.com/en/wineries/hevron-heights
  ('Hevron Heights', 'Mount Hevron Reserve Cabernet Sauvignon', 'Judean Hills, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/hevron-heights
  ('Hevron Heights', 'Isaac''s Ram Cabernet Sauvignon', 'Judean Hills, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/hevron-heights
  ('Hevron Heights', 'Judean Heights Petite Sirah', 'Judean Hills, Israel', 'Petite Sirah', 'Red'),  -- https://www.vivino.com/en/wineries/hevron-heights
  ('Hevron Heights', 'Judean Heights Cabernet Sauvignon', 'Judean Hills, Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/hevron-heights
  ('Hevron Heights', 'Judean Heights Cabernet Franc', 'Judean Hills, Israel', 'Cabernet Franc', 'Red')  -- https://www.vivino.com/en/wineries/hevron-heights
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TANYA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Tanya', 'Enosh Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/tanya
  ('Tanya', 'Vital Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/tanya
  ('Tanya', 'Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/tanya
  ('Tanya', 'Eliya Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/tanya
  ('Tanya', 'Dry Red', 'Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/tanya
  ('Tanya', 'Cabernet Franc', 'Israel', 'Cabernet Franc', 'Red'),  -- https://www.vivino.com/en/wineries/tanya
  ('Tanya', 'Halel Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/tanya
  ('Tanya', 'Halel Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/tanya
  ('Tanya', 'Ivri Merlot', 'Israel', 'Merlot', 'Red'),  -- https://www.vivino.com/en/wineries/tanya
  ('Tanya', 'Ivri Reserve Cabernet Sauvignon', 'Israel', 'Cabernet Sauvignon', 'Red')  -- https://www.vivino.com/en/wineries/tanya
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MIA LUCE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_israel.sql)'
from (values
  ('Mia Luce', 'Rosso', 'Judean Hills, Israel', null, 'Red'),  -- https://www.vivino.com/en/wineries/mia-luce
  ('Mia Luce', 'Syrah & Stems', 'Judean Hills, Israel', 'Syrah', 'Red'),  -- https://www.vivino.com/en/wineries/mia-luce
  ('Mia Luce', 'Whole Cluster Marselan', 'Judean Hills, Israel', 'Marselan', 'Red'),  -- https://www.vivino.com/en/wineries/mia-luce
  ('Mia Luce', 'Bianco', 'Judean Hills, Israel', null, 'White')  -- https://www.vivino.com/en/wineries/mia-luce
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
