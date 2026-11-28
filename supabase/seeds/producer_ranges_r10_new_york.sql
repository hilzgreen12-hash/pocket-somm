-- Producer ranges round 10: New York. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- DR. KONSTANTIN FRANK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Dr. Konstantin Frank', 'Riesling Nature', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'Sparkling'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Brut', 'Keuka Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Blanc de Blancs', 'Keuka Lake, Finger Lakes, New York, USA', 'Chardonnay', 'Sparkling'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Blanc de Noirs', 'Keuka Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Sparkling'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Brut Rosé', 'Keuka Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Célèbre', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'Sparkling'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Célèbre Rosé', 'Keuka Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Grüner Veltliner', 'Keuka Lake, Finger Lakes, New York, USA', 'Grüner Veltliner', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Erste Grüner Veltliner', 'Keuka Lake, Finger Lakes, New York, USA', 'Grüner Veltliner', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Rkatsiteli', 'Keuka Lake, Finger Lakes, New York, USA', 'Rkatsiteli', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Sauvignon Blanc', 'Keuka Lake, Finger Lakes, New York, USA', 'Sauvignon Blanc', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Pinot Gris', 'Keuka Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Pinot Blanc', 'Keuka Lake, Finger Lakes, New York, USA', 'Pinot Blanc', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Dry Riesling', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Eugenia Dry Riesling', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Margrit Dry Riesling', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Ethos', 'Keuka Lake, Finger Lakes, New York, USA', 'Blend of Riesling, Rkatsiteli', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Chardonnay', 'Keuka Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Hilda Chardonnay', 'Keuka Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Gewürztraminer', 'Keuka Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Amber Rkatsiteli', 'Keuka Lake, Finger Lakes, New York, USA', 'Rkatsiteli', 'Orange'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Semi-Dry Riesling', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Muscat Ottonel', 'Keuka Lake, Finger Lakes, New York, USA', 'Muscat Ottonel', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Winter Ferment Gewürztraminer', 'Keuka Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Reserve Riesling', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Dry Rosé', 'Keuka Lake, Finger Lakes, New York, USA', 'Blend of Cabernet Franc, Blaufränkisch', 'Rosé'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Dry Rosé of Cabernet Franc', 'Keuka Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Rosé'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Dry Rosé of Blaufränkisch', 'Keuka Lake, Finger Lakes, New York, USA', 'Blaufränkisch', 'Rosé'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Dry Rosé of Saperavi', 'Keuka Lake, Finger Lakes, New York, USA', 'Saperavi', 'Rosé'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Old Vines Pinot Noir', 'Keuka Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Blaufränkisch', 'Keuka Lake, Finger Lakes, New York, USA', 'Blaufränkisch', 'Red'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Cabernet Franc', 'Keuka Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Merlot', 'Keuka Lake, Finger Lakes, New York, USA', 'Merlot', 'Red'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Cabernet Sauvignon', 'Keuka Lake, Finger Lakes, New York, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Saperavi', 'Keuka Lake, Finger Lakes, New York, USA', 'Saperavi', 'Red'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Lena Reserve', 'Keuka Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Amur', 'Keuka Lake, Finger Lakes, New York, USA', 'Amur', 'Red'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Tawny Pinot Gris', 'Keuka Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'Sweet'),  -- https://www.drfrankwines.com/our-wines/
  ('Dr. Konstantin Frank', 'Ruby Amur', 'Keuka Lake, Finger Lakes, New York, USA', 'Amur', 'Sweet')  -- https://www.drfrankwines.com/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RAVINES WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Ravines Wine Cellars', 'Pinot Noir', 'Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.ravineswine.com/
  ('Ravines Wine Cellars', 'Gewurztraminer', 'Finger Lakes, New York, USA', 'Gewurztraminer', 'White'),  -- https://www.ravineswine.com/
  ('Ravines Wine Cellars', 'Chardonnay', 'Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://www.ravineswine.com/
  ('Ravines Wine Cellars', 'Dry Riesling', 'Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.ravineswine.com/
  ('Ravines Wine Cellars', 'Limestone Vineyard Dry Riesling', 'Finger Lakes, New York, USA', 'Riesling', 'White')  -- https://www.ravineswine.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HERMANN J. WIEMER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Hermann J. Wiemer', 'Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Semi-Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Late Harvest Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Reserve Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'HJW Vineyard Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Magdalena Vineyard Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Bio Field Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Grüner Veltliner', 'Seneca Lake, Finger Lakes, New York, USA', 'Grüner Veltliner', 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Field White', 'Seneca Lake, Finger Lakes, New York, USA', null, 'White'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Field Red', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Magdalena Vineyard Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Cuvée Brut', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Blanc de Noir', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Brut Rosé', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Noble Select Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'Magdalena Vineyard Noble Select Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://www.wiemer.com/sitemap.xml
  ('Hermann J. Wiemer', 'HJW Vineyard Noble Select Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet')  -- https://www.wiemer.com/sitemap.xml
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FOX RUN VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Fox Run Vineyards', 'Dry Rosé', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Rosé'),  -- https://newyork.guides.winefolly.com/wineries/fox-run-vineyards/wines/dry-rose
  ('Fox Run Vineyards', 'Unoaked Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://newyork.guides.winefolly.com/wineries/fox-run-vineyards/wines/dry-rose
  ('Fox Run Vineyards', 'Unoaked Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://newyork.guides.winefolly.com/wineries/fox-run-vineyards/wines/dry-rose
  ('Fox Run Vineyards', 'Billante Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sparkling'),  -- https://newyork.guides.winefolly.com/wineries/fox-run-vineyards/wines/dry-rose
  ('Fox Run Vineyards', 'Doyle Family Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://newyork.guides.winefolly.com/wineries/fox-run-vineyards/wines/dry-rose
  ('Fox Run Vineyards', 'Silvan Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://newyork.guides.winefolly.com/wineries/fox-run-vineyards/wines/dry-rose
  ('Fox Run Vineyards', 'Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/fox-run-vineyards/7081
  ('Fox Run Vineyards', 'Pinot Noir', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/fox-run-vineyards/7081
  ('Fox Run Vineyards', 'Reserve Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://www.nataliemaclean.com/wineries/info/fox-run-vineyards/7081
  ('Fox Run Vineyards', 'Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://www.nataliemaclean.com/wineries/info/fox-run-vineyards/7081
  ('Fox Run Vineyards', 'Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.nataliemaclean.com/wineries/info/fox-run-vineyards/7081
  ('Fox Run Vineyards', 'Blanc de Blanc', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://www.nataliemaclean.com/wineries/info/fox-run-vineyards/7081
  ('Fox Run Vineyards', 'Lemberger', 'Seneca Lake, Finger Lakes, New York, USA', 'Lemberger', 'Red')  -- https://www.nataliemaclean.com/wineries/info/fox-run-vineyards/7081
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RED NEWT CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Red Newt Cellars', 'Lahoma Vineyard Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Sawmill Creek North Block Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Curry Creek Vineyard Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Glacier Ridge Vineyard Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Curry Creek Pinot Gris', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'The Knoll Lahoma Vineyards Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Noble Select Late Harvest Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Glacier Ridge Merlot', 'Seneca Lake, Finger Lakes, New York, USA', 'Merlot', 'Red'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Glacier Ridge Vineyard Pinot Gris', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Kelby James Russell Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Tango Oaks Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Noble Dry Riesling Late Harvest', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Glacier Ridge Skin Fermented Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Orange'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Tango Oaks Riesling Ice Wine', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Sparkling Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sparkling'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Barrel Fermented Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Tango Oaks Lees Reserve Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Amphibian', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Flor Style Pinot Gris', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Pinot Gris', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Glacier Ridge Vineyard Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Glacier Ridge Pinot Noir', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Viridescens', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Merlot', 'Seneca Lake, Finger Lakes, New York, USA', 'Merlot', 'Red'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Glacier Ridge Syrah', 'Seneca Lake, Finger Lakes, New York, USA', 'Syrah', 'Red'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Blue Newt White', 'Seneca Lake, Finger Lakes, New York, USA', null, 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Circle Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Salamander White', 'Seneca Lake, Finger Lakes, New York, USA', null, 'White'),  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
  ('Red Newt Cellars', 'Semi-Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White')  -- https://rednewt.com/sitemap_products_1.xml?from=9570525151487&to=9633751597311
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HEART & HANDS WINE COMPANY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Heart & Hands Wine Company', 'Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Polarity Pinot Noir Blanc', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'White'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Elaine''s Vineyard Clone 115 Reserve Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Elaine''s Vineyard Clone 667 Reserve Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Elaine''s Vineyard Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Nutt Road Vineyard Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Hobbit Hollow Vineyard Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Patrician Verona Vineyard Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Mo Chuisle Estate Reserve Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Estate Clone 667 Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Estate Clone 777 Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Estate Clone 828 Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Barrel Reserve Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/897/
  ('Heart & Hands Wine Company', 'Brut Rosé', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Sparkling')  -- https://www.princeofpinot.com/winery/897/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAMOREAUX LANDING ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Lamoreaux Landing', 'Red Oak Vineyard Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Unoaked Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Round Rock Vineyard Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Grüner Veltliner Vineyard Select', 'Seneca Lake, Finger Lakes, New York, USA', 'Grüner Veltliner', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Reserve Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Semi-Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Block 137 Gewurztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewurztraminer', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Riesling Cuvee', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Semi-Dry Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Yellow Dog Vineyard Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Moscato', 'Seneca Lake, Finger Lakes, New York, USA', 'Moscato', 'White'),  -- https://lamoreauxwine.orderport.net/wines/Whites
  ('Lamoreaux Landing', 'Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'T23 Unoaked Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'MJW Vineyard Unoaked Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'Terra West Vineyard Unoaked Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'Yellow Dog Vineyard Unoaked Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'Merlot Block 137', 'Seneca Lake, Finger Lakes, New York, USA', 'Merlot', 'Red'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'Pinot Noir', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'Dry Rosé', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Rosé'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'Rosé Cuvée', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Rosé'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', '76 West', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'Estate Red Cuvée', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://lamoreauxwine.orderport.net/wines/reds
  ('Lamoreaux Landing', 'Brut', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://lamoreauxwine.orderport.net/wines/sparkling
  ('Lamoreaux Landing', 'Blanc de Blanc', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://lamoreauxwine.orderport.net/wines/sparkling
  ('Lamoreaux Landing', 'Blanc de Noir', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://lamoreauxwine.orderport.net/wines/sparkling
  ('Lamoreaux Landing', 'Sparkling Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sparkling'),  -- https://lamoreauxwine.orderport.net/wines/sparkling
  ('Lamoreaux Landing', 'Gewürztraminer Ice', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'Sweet'),  -- https://lamoreauxwine.orderport.net/wines/dessert
  ('Lamoreaux Landing', 'Riesling Ice', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://lamoreauxwine.orderport.net/wines/dessert
  ('Lamoreaux Landing', 'Vidal Ice', 'Seneca Lake, Finger Lakes, New York, USA', 'Vidal', 'Sweet')  -- https://lamoreauxwine.orderport.net/wines/dessert
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ANTHONY ROAD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Anthony Road', 'Unoaked Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Barrel Ferment Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Blanc de Blanc', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Blanc', 'Sparkling'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Pinot Blanc', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Blanc', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Pinot Gris', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Barrel Ferment Pinot Gris', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Skin Ferment Pinot Gris', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'Orange'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Grüner Veltliner', 'Seneca Lake, Finger Lakes, New York, USA', 'Grüner Veltliner', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Devonian White', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling, Pinot Gris, Chardonnay, Grüner Veltliner, Sauvignon Blanc', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Skin Ferment Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Orange'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Art Series Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Rosé of Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc, Lemberger', 'Rosé'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Rosé of Lemberger', 'Seneca Lake, Finger Lakes, New York, USA', 'Lemberger', 'Rosé'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Pinot Noir', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Lemberger', 'Seneca Lake, Finger Lakes, New York, USA', 'Lemberger', 'Red'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Martini-Becraft Selection Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Cabernet Franc / Lemberger', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc, Lemberger', 'Red'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Devonian Red', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Tony''s Red', 'Seneca Lake, Finger Lakes, New York, USA', 'Rougeon', 'Red'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Vignoles', 'Seneca Lake, Finger Lakes, New York, USA', 'Vignoles', 'White'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Late Harvest Vignoles', 'Seneca Lake, Finger Lakes, New York, USA', 'Vignoles', 'Sweet'),  -- https://anthonyroadwine.orderport.net/wines/all-wines
  ('Anthony Road', 'Martini-Becraft Selection Vignoles', 'Seneca Lake, Finger Lakes, New York, USA', 'Vignoles', 'White')  -- https://anthonyroadwine.orderport.net/wines/all-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOUNDARY BREAKS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Boundary Breaks', 'Riesling Bubbly Dry #356', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sparkling'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Riesling Extra Dry #90', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Riesling Ovid Line North', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Riesling Reserve #198', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Riesling Dry #239', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Riesling #110 Grand', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Riesling #110 North', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Riesling Ice Wine', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Gewürztraminer Dry', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Gewürztraminer Medium-Dry', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Glitz Bubbly Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'Sparkling'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Rosé', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Rosé'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Rosé Bubbly', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Rosique Bubbly Rosé', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Cabernet Sauvignon', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Sauvignon', 'Red'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Chardonnay Unoaked', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Harmonic Red', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://boundarybreaks.com/media_trade
  ('Boundary Breaks', 'Vignette Bubbly', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling')  -- https://boundarybreaks.com/media_trade
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RED TAIL RIDGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Red Tail Ridge', 'Blanc de Noirs', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Blanc de Blanc', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Sparkling Rosé', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Sekt', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Riesling Pet Nat', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sparkling'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Pinot Noir Rosé Pet Nat', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Sparkling'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Sans Oak Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Pinot Noir Dry Rosé', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Rosé'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Dry Rosé', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Rosé'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Pinot Noir', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Dornfelder', 'Seneca Lake, Finger Lakes, New York, USA', 'Dornfelder', 'Red'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Blaufränkisch', 'Seneca Lake, Finger Lakes, New York, USA', 'Blaufränkisch', 'Red'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Lagrein', 'Seneca Lake, Finger Lakes, New York, USA', 'Lagrein', 'Red'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Teroldego', 'Seneca Lake, Finger Lakes, New York, USA', 'Teroldego', 'Red'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Sans Oak Blau Franc Blend', 'Seneca Lake, Finger Lakes, New York, USA', 'Blaufränkisch, Cabernet Franc', 'Red'),  -- https://redtailridgewinery.com/industry/
  ('Red Tail Ridge', 'Sparkling Rebel with a Cause', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling')  -- https://redtailridgewinery.com/industry/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STANDING STONE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Standing Stone', 'Timeline Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.wiemer.com/trade-media/
  ('Standing Stone', 'Riesling Skin Ferment', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Orange'),  -- https://www.wiemer.com/trade-media/
  ('Standing Stone', 'Farm White', 'Seneca Lake, Finger Lakes, New York, USA', null, 'White'),  -- https://www.wiemer.com/trade-media/
  ('Standing Stone', 'Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://www.wiemer.com/trade-media/
  ('Standing Stone', 'Teinturier Saperavi', 'Seneca Lake, Finger Lakes, New York, USA', 'Saperavi', 'Red'),  -- https://www.wiemer.com/trade-media/
  ('Standing Stone', 'Teinturier Saperavi Dry Rosé', 'Seneca Lake, Finger Lakes, New York, USA', 'Saperavi', 'Rosé'),  -- https://www.wiemer.com/trade-media/
  ('Standing Stone', 'Pétillant Naturel', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://www.wiemer.com/trade-media/
  ('Standing Stone', 'Blanc de Blanc', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://www.wiemer.com/trade-media/
  ('Standing Stone', 'Saperavi Brut Rosé', 'Seneca Lake, Finger Lakes, New York, USA', 'Saperavi', 'Sparkling')  -- https://www.wiemer.com/trade-media/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BLOOMER CREEK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Bloomer Creek', 'Tanzen Dame Auten Vineyard 1st Harvest', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.bloomercreek.com/ourlineup
  ('Bloomer Creek', 'Tanzen Dame Morehouse Road 1st Harvest', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.bloomercreek.com/ourlineup
  ('Bloomer Creek', 'Tanzen Dame Auten Vineyard Clone 10 2nd Harvest', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://www.bloomercreek.com/ourlineup
  ('Bloomer Creek', 'Tanzen Dame Edelzwicker Blue Cap', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling, Gewurztraminer, Cayuga White', 'White'),  -- https://www.bloomercreek.com/ourlineup
  ('Bloomer Creek', 'White Horse', 'Cayuga Lake, Finger Lakes, New York, USA', 'Cabernet Franc, Merlot', 'Red'),  -- https://www.bloomercreek.com/ourlineup
  ('Bloomer Creek', 'Vin d''été', 'Cayuga Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.bloomercreek.com/ourlineup
  ('Bloomer Creek', 'Cabernet Franc', 'Cayuga Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red')  -- https://www.bloomercreek.com/ourlineup
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SHELDRAKE POINT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Sheldrake Point', 'Cabernet Franc', 'Cayuga Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Gamay Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Gamay Noir', 'Red'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Pinot Gris', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'White'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Riesling Reserve', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Dry Riesling', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Beta Series Acid Head Riesling', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Gewurztraminer', 'Cayuga Lake, Finger Lakes, New York, USA', 'Gewurztraminer', 'White'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Chardonnay', 'Cayuga Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Riesling', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Dry Riesling Wild Ferment', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Riesling Ice Wine', 'Cayuga Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Pinot Noir', 'Cayuga Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Merlot', 'Cayuga Lake, Finger Lakes, New York, USA', 'Merlot', 'Red'),  -- https://sheldrake-point-winery.db.wine/wines/
  ('Sheldrake Point', 'Dry Rosé', 'Cayuga Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Rosé')  -- https://sheldrake-point-winery.db.wine/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FORGE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Forge Cellars', 'Dry Riesling Classique', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Sunrise Hill Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Willow Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Railroad Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Wagner Caywood East Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Caywood Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Freese Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Breakneck Creek Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Leidenfrost Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Tango Oaks Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Peach Orchard Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Navone Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Bellows Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Caywood Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Pinot Noir Classique', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Leidenfrost Pinot Noir', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Tango Oaks Pinot Noir', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Bellows Pinot Noir', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Willow Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Railroad Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Caywood Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Arlo Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.forgecellars.com/all-wines
  ('Forge Cellars', 'Leidenfrost Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red')  -- https://www.forgecellars.com/all-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WAGNER VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Wagner Vineyards', 'Bubbly Bliss', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Chardonnay Unoaked', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Chardonnay Barrel Fermented', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Chardonnay Reserve', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Gewurztraminer Dry', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewurztraminer', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Gewurztraminer Semi-Dry', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewurztraminer', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Fathom 107', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling, Gewurztraminer', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Riesling Caywood East Vineyard', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Riesling Dry', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Riesling Sparkling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sparkling'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Riesling Semi Dry', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Riesling Select', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Riesling Late Harvest Caywood West Vineyard', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Riesling Ice', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'Sweet'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Vidal Blanc Ice', 'Seneca Lake, Finger Lakes, New York, USA', 'Vidal Blanc', 'Sweet'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Alta B White', 'Seneca Lake, Finger Lakes, New York, USA', null, 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Cayuga White', 'Seneca Lake, Finger Lakes, New York, USA', 'Cayuga White', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Delaware', 'Seneca Lake, Finger Lakes, New York, USA', 'Delaware', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Melody', 'Seneca Lake, Finger Lakes, New York, USA', 'Melody', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Niagara', 'Seneca Lake, Finger Lakes, New York, USA', 'Niagara', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Seneca White', 'Seneca Lake, Finger Lakes, New York, USA', null, 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Vignoles', 'Seneca Lake, Finger Lakes, New York, USA', 'Vignoles', 'White'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Dry Rosé of Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Rosé'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Bubbly Rosé of Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Sparkling'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Alta B Blush', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Rosé'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Seneca Blush', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Rosé'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Cabernet Franc Ice', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Sweet'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Cabernet Franc Lone Oak Vineyard', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Cabernet Sauvignon', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Sauvignon', 'Red'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Meritage', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Merlot', 'Seneca Lake, Finger Lakes, New York, USA', 'Merlot', 'Red'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Pinot Noir Grace House', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Pinot Noir Reserve', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Alta B Red', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Seneca Red', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://wagnervineyards.com/finger-lakes-wine/
  ('Wagner Vineyards', 'Sunset Red', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red')  -- https://wagnervineyards.com/finger-lakes-wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DAMIANI WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Damiani Wine Cellars', 'Bollicine', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Brut Rosé', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Brut Méthode Champenoise', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Blanc de Noir Méthode Champenoise', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Sparkling'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Dry Riesling', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Dry Riesling Davis Vineyard', 'Seneca Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Pinot Gris', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Gris', 'White'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Chardonnay', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Chardonnay Standing Stone Farms', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Chardonnay Reserve', 'Seneca Lake, Finger Lakes, New York, USA', 'Chardonnay', 'White'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Vino Bianco', 'Seneca Lake, Finger Lakes, New York, USA', null, 'White'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Gewürztraminer', 'Seneca Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Dry Rosé', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Rosé'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Vino Rosso', 'Seneca Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Pinot Noir', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Pinot Noir Reserve', 'Seneca Lake, Finger Lakes, New York, USA', 'Pinot Noir', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Lemberger', 'Seneca Lake, Finger Lakes, New York, USA', 'Lemberger', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Lemberger Sunrise Hill Vineyard', 'Seneca Lake, Finger Lakes, New York, USA', 'Lemberger', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Merlot', 'Seneca Lake, Finger Lakes, New York, USA', 'Merlot', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Merlot Reserve', 'Seneca Lake, Finger Lakes, New York, USA', 'Merlot', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Cabernet Franc', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Cabernet Franc Reserve', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Cabernet Sauvignon', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Sauvignon', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Cabernet Sauvignon Reserve', 'Seneca Lake, Finger Lakes, New York, USA', 'Cabernet Sauvignon', 'Red'),  -- https://damianiwinecellars.orderport.net/wines/All-Wines
  ('Damiani Wine Cellars', 'Saperavi', 'Seneca Lake, Finger Lakes, New York, USA', 'Saperavi', 'Red')  -- https://damianiwinecellars.orderport.net/wines/All-Wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KEUKA LAKE VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Keuka Lake Vineyards', 'Semi-Dry Riesling', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Dry Riesling', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Evergreen Lek Riesling', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Semi-Dry Seyval Blanc', 'Keuka Lake, Finger Lakes, New York, USA', 'Seyval Blanc', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Vignoles', 'Keuka Lake, Finger Lakes, New York, USA', 'Vignoles', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Sauvignon Blanc', 'Keuka Lake, Finger Lakes, New York, USA', 'Sauvignon Blanc', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Turkey Run Vignoles', 'Keuka Lake, Finger Lakes, New York, USA', 'Vignoles', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Skin-Fermented Vignoles', 'Keuka Lake, Finger Lakes, New York, USA', 'Vignoles', 'Orange'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Seyval Blanc (Barrel)', 'Keuka Lake, Finger Lakes, New York, USA', 'Seyval Blanc', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Le Petit Riesling', 'Keuka Lake, Finger Lakes, New York, USA', 'Riesling', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Gewürztraminer', 'Keuka Lake, Finger Lakes, New York, USA', 'Gewürztraminer', 'White'),  -- https://klvineyards.orderport.net/wines/White-Wines
  ('Keuka Lake Vineyards', 'Seyval Blanc Pétillant Naturel', 'Keuka Lake, Finger Lakes, New York, USA', 'Seyval Blanc', 'Sparkling'),  -- https://klvineyards.orderport.net/wines/Sparkling
  ('Keuka Lake Vineyards', 'Vignoles Methode Ancestrale', 'Keuka Lake, Finger Lakes, New York, USA', 'Vignoles', 'Sparkling'),  -- https://klvineyards.orderport.net/wines/Sparkling
  ('Keuka Lake Vineyards', 'KLV Red', 'Keuka Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://klvineyards.orderport.net/wines/Red-Wines
  ('Keuka Lake Vineyards', 'Tin Pathi', 'Keuka Lake, Finger Lakes, New York, USA', null, 'Red'),  -- https://klvineyards.orderport.net/wines/Red-Wines
  ('Keuka Lake Vineyards', 'Cabernet Franc', 'Keuka Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://klvineyards.orderport.net/wines/Red-Wines
  ('Keuka Lake Vineyards', 'Merlot', 'Keuka Lake, Finger Lakes, New York, USA', 'Merlot', 'Red'),  -- https://klvineyards.orderport.net/wines/Red-Wines
  ('Keuka Lake Vineyards', 'Blaufränkisch', 'Keuka Lake, Finger Lakes, New York, USA', 'Blaufränkisch', 'Red'),  -- https://klvineyards.orderport.net/wines/Red-Wines
  ('Keuka Lake Vineyards', 'Dry Rose', 'Keuka Lake, Finger Lakes, New York, USA', null, 'Rosé'),  -- https://klvineyards.orderport.net/wines/Red-Wines
  ('Keuka Lake Vineyards', 'KLV Cabernet Franc', 'Keuka Lake, Finger Lakes, New York, USA', 'Cabernet Franc', 'Red'),  -- https://klvineyards.orderport.net/wines/Red-Wines
  ('Keuka Lake Vineyards', 'Leon Millot', 'Keuka Lake, Finger Lakes, New York, USA', 'Leon Millot', 'Red')  -- https://klvineyards.orderport.net/wines/Red-Wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHANNING DAUGHTERS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Channing Daughters', 'Blaufränkisch', 'The Hamptons, Long Island, New York, USA', 'Blaufränkisch', 'Red'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Brick Kiln Chardonnay', 'The Hamptons, Long Island, New York, USA', 'Chardonnay', 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Cabernet Franc', 'The Hamptons, Long Island, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Chardonnay', 'The Hamptons, Long Island, New York, USA', 'Chardonnay', 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Petit Verdot', 'The Hamptons, Long Island, New York, USA', 'Petit Verdot', 'Red'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Pinot Grigio', 'The Hamptons, Long Island, New York, USA', 'Pinot Grigio', 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosato di Cabernet Franc', 'The Hamptons, Long Island, New York, USA', 'Cabernet Franc', 'Rosé'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosso Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', null, 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Tocai Friulano', 'The Hamptons, Long Island, New York, USA', 'Tocai Friulano', 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Bianco "Cuvée Tropical" Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', null, 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Bianco Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', null, 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Diamond Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', 'Diamond', 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Dornfelder', 'The Hamptons, Long Island, New York, USA', 'Dornfelder', 'Red'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Gewürztraminer Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', 'Gewürztraminer', 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'HEART Red Table Wine', 'The Hamptons, Long Island, New York, USA', null, 'Red'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'HEART White Table Wine', 'The Hamptons, Long Island, New York, USA', null, 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'L''Enfant Sauvage Chardonnay', 'The Hamptons, Long Island, New York, USA', 'Chardonnay', 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Lagrein', 'The Hamptons, Long Island, New York, USA', 'Lagrein', 'Red'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Merlot/Lagrein Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', 'Merlot, Lagrein', 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Moscato Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', 'Moscato', 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Refosco', 'The Hamptons, Long Island, New York, USA', 'Refosco', 'Red'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Research Bianco', 'The Hamptons, Long Island, New York, USA', null, 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Ribolla Gialla', 'The Hamptons, Long Island, New York, USA', 'Ribolla Gialla', 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosato "The Blend"', 'The Hamptons, Long Island, New York, USA', null, 'Rosé'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosato Cabernet Franc / Refosco Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', 'Cabernet Franc, Refosco', 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosato di Franconia', 'The Hamptons, Long Island, New York, USA', 'Franconia', 'Rosé'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosato di Lagrein', 'The Hamptons, Long Island, New York, USA', 'Lagrein', 'Rosé'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosato di Merlot', 'The Hamptons, Long Island, New York, USA', 'Merlot', 'Rosé'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosato di Refosco', 'The Hamptons, Long Island, New York, USA', 'Refosco', 'Rosé'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosato di Sculpture Garden', 'The Hamptons, Long Island, New York, USA', null, 'Rosé'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosato Merlot Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', 'Merlot', 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Rosso Fresco', 'The Hamptons, Long Island, New York, USA', null, 'Red'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Sauvignon Blanc', 'The Hamptons, Long Island, New York, USA', 'Sauvignon Blanc', 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Scuttlehole Chardonnay', 'The Hamptons, Long Island, New York, USA', 'Chardonnay', 'White'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Sylvanus Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', null, 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Syrah', 'The Hamptons, Long Island, New York, USA', 'Syrah', 'Red'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Tocai Friulano Pétillant Naturel', 'The Hamptons, Long Island, New York, USA', 'Tocai Friulano', 'Sparkling'),  -- https://www.channingdaughters.com/
  ('Channing Daughters', 'Vino Bianco', 'The Hamptons, Long Island, New York, USA', null, 'White')  -- https://www.channingdaughters.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MCCALL WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('McCall Wines', 'Marjorie''s Rosé', 'North Fork of Long Island, New York, USA', null, 'Rosé'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Chardonnay Unoaked', 'North Fork of Long Island, New York, USA', 'Chardonnay', 'White'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Chardonnay Reserve', 'North Fork of Long Island, New York, USA', 'Chardonnay', 'White'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Nicola''s Sauvignon Blanc', 'North Fork of Long Island, New York, USA', 'Sauvignon Blanc', 'White'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Pinot Noir', 'North Fork of Long Island, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Pinot Noir Hillside', 'North Fork of Long Island, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Pinot Noir Reserve', 'North Fork of Long Island, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Ben''s Blend', 'North Fork of Long Island, New York, USA', null, 'Red'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Cabernet Franc', 'North Fork of Long Island, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Cabernet Sauvignon', 'North Fork of Long Island, New York, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Merlot', 'North Fork of Long Island, New York, USA', 'Merlot', 'Red'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Merlot Reserve', 'North Fork of Long Island, New York, USA', 'Merlot', 'Red'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Field Blend', 'North Fork of Long Island, New York, USA', null, 'Red'),  -- https://www.mccallwines.com/shop/
  ('McCall Wines', 'Petit Verdot', 'North Fork of Long Island, New York, USA', 'Petit Verdot', 'Red')  -- https://www.mccallwines.com/shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAUMANOK VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Paumanok Vineyards', 'Chenin Blanc', 'North Fork of Long Island, New York, USA', 'Chenin Blanc', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Minimalist Chenin Blanc', 'North Fork of Long Island, New York, USA', 'Chenin Blanc', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Sauvignon Blanc', 'North Fork of Long Island, New York, USA', 'Sauvignon Blanc', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Festival Chardonnay', 'North Fork of Long Island, New York, USA', 'Chardonnay', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Barrel Fermented Chardonnay', 'North Fork of Long Island, New York, USA', 'Chardonnay', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Minimalist Chardonnay', 'North Fork of Long Island, New York, USA', 'Chardonnay', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Dry Riesling', 'North Fork of Long Island, New York, USA', 'Riesling', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Semi Dry Riesling', 'North Fork of Long Island, New York, USA', 'Riesling', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Late Harvest Riesling', 'North Fork of Long Island, New York, USA', 'Riesling', 'Sweet'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Melon de Bourgogne', 'North Fork of Long Island, New York, USA', 'Melon de Bourgogne', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Dry Rosé', 'North Fork of Long Island, New York, USA', null, 'Rosé'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Vin Rosé', 'North Fork of Long Island, New York, USA', null, 'Rosé'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Festival Red', 'North Fork of Long Island, New York, USA', null, 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Minimalist Cabernet Franc', 'North Fork of Long Island, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Cabernet Franc', 'North Fork of Long Island, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Cabernet Sauvignon', 'North Fork of Long Island, New York, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Merlot', 'North Fork of Long Island, New York, USA', 'Merlot', 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Assemblage', 'North Fork of Long Island, New York, USA', null, 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Grand Vintage Cabernet Franc', 'North Fork of Long Island, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Apollo Drive Petit Verdot', 'North Fork of Long Island, New York, USA', 'Petit Verdot', 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Tuthills Lane Vineyard Cabernet Sauvignon', 'North Fork of Long Island, New York, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Late Harvest Sauvignon Blanc', 'North Fork of Long Island, New York, USA', 'Sauvignon Blanc', 'Sweet'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'De Nada Sauvignon Blanc', 'North Fork of Long Island, New York, USA', 'Sauvignon Blanc', 'White'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'De Nada Cabernet Sauvignon', 'North Fork of Long Island, New York, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.paumanok.com/store
  ('Paumanok Vineyards', 'Rosé de Pinot', 'North Fork of Long Island, New York, USA', null, 'Rosé')  -- https://www.paumanok.com/store
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MILLBROOK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Millbrook', 'Brut Rosé', 'New York, USA', null, 'Sparkling'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Late Harvest', 'New York, USA', null, 'Sweet'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Grüner Veltliner Proprietor''s Special Reserve', 'New York, USA', 'Grüner Veltliner', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Tocai Friulano Proprietor''s Special Reserve', 'New York, USA', 'Tocai Friulano', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Tocai Friulano Lollipop Hill', 'New York, USA', 'Tocai Friulano', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Unoaked Chardonnay', 'New York, USA', 'Chardonnay', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Chardonnay NYS', 'New York, USA', 'Chardonnay', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Chardonnay Artist Label', 'New York, USA', 'Chardonnay', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Chardonnay Proprietor''s Special Reserve', 'New York, USA', 'Chardonnay', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Castle Hill Chardonnay', 'New York, USA', 'Chardonnay', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Dry Riesling Proprietor''s Special Reserve', 'New York, USA', 'Riesling', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Castle Hill Riesling', 'New York, USA', 'Riesling', 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Hunt Country White', 'New York, USA', null, 'White'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Hunt Country Rosé', 'New York, USA', null, 'Rosé'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Hunt Country Red', 'New York, USA', null, 'Red'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Cabernet Franc NYS', 'New York, USA', 'Cabernet Franc', 'Red'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Cabernet Franc Proprietor''s Special Reserve', 'New York, USA', 'Cabernet Franc', 'Red'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Cabernet Franc Block Three East', 'New York, USA', 'Cabernet Franc', 'Red'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Cabernet Franc Artist Label', 'New York, USA', 'Cabernet Franc', 'Red'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Pinot Noir', 'New York, USA', 'Pinot Noir', 'Red'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Poppi Hill Pinot Noir', 'New York, USA', 'Pinot Noir', 'Red'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Gamay Noir', 'New York, USA', 'Gamay', 'Red'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Merlot', 'New York, USA', 'Merlot', 'Red'),  -- https://millbrookwine.orderport.net/wines/all-wine
  ('Millbrook', 'Merlot Proprietor''s Special Reserve', 'New York, USA', 'Merlot', 'Red')  -- https://millbrookwine.orderport.net/wines/all-wine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WHITECLIFF VINEYARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Whitecliff Vineyard', 'Awosting White', 'Hudson River Region, New York, USA', null, 'White'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Red Trail', 'Hudson River Region, New York, USA', null, 'Red'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Vidal Blanc', 'Hudson River Region, New York, USA', 'Vidal Blanc', 'White'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Merlot Malbec', 'Hudson River Region, New York, USA', 'Merlot, Malbec', 'Red'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Non Intervention Traminette', 'Hudson River Region, New York, USA', 'Traminette', 'White'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Non-Intervention Pinot Noir', 'Hudson River Region, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Pet Nat', 'Hudson River Region, New York, USA', null, 'Sparkling'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Petite Verdot', 'Hudson River Region, New York, USA', 'Petit Verdot', 'Red'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Reserve Chardonnay', 'Hudson River Region, New York, USA', 'Chardonnay', 'White'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Gamay Noir', 'Hudson River Region, New York, USA', 'Gamay', 'Red'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Dry Riesling', 'Hudson River Region, New York, USA', 'Riesling', 'White'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Cabernet Franc', 'Hudson River Region, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Riesling', 'Hudson River Region, New York, USA', 'Riesling', 'White'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Sky Island Red', 'Hudson River Region, New York, USA', null, 'Red'),  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
  ('Whitecliff Vineyard', 'Syrah', 'Hudson River Region, New York, USA', 'Syrah', 'Red')  -- https://www.whitecliffwine.com/buying-whitecliff-wine-online/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BENMARL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Benmarl', 'Slate Hill Red', 'Hudson River Region, New York, USA', null, 'Red'),  -- https://www.benmarl.com/
  ('Benmarl', 'Pétillant', 'Hudson River Region, New York, USA', null, 'Sparkling'),  -- https://www.benmarl.com/
  ('Benmarl', 'Malbec', 'Hudson River Region, New York, USA', 'Malbec', 'Red'),  -- https://www.benmarl.com/
  ('Benmarl', 'Reserve Riesling', 'Hudson River Region, New York, USA', 'Riesling', 'White'),  -- https://www.benmarl.com/
  ('Benmarl', 'Stainless Steel Chardonnay', 'Hudson River Region, New York, USA', 'Chardonnay', 'White'),  -- https://www.benmarl.com/
  ('Benmarl', 'Riesling', 'Hudson River Region, New York, USA', 'Riesling', 'White'),  -- https://www.benmarl.com/
  ('Benmarl', 'Dry Rose', 'Hudson River Region, New York, USA', null, 'Rosé'),  -- https://www.benmarl.com/
  ('Benmarl', 'Seyval Blanc Estate', 'Hudson River Region, New York, USA', 'Seyval Blanc', 'White'),  -- https://www.benmarl.com/
  ('Benmarl', 'Merlot', 'Hudson River Region, New York, USA', 'Merlot', 'Red')  -- https://www.benmarl.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FREEDOM RUN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_new_york.sql)'
from (values
  ('Freedom Run', 'Seanpenoise', 'Niagara Escarpment, New York, USA', null, 'Sparkling'),  -- https://www.freedomrunwinery.com/
  ('Freedom Run', 'Stone House Vineyard Pinot Noir', 'Niagara Escarpment, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.freedomrunwinery.com/
  ('Freedom Run', 'Cabernet Franc', 'Niagara Escarpment, New York, USA', 'Cabernet Franc', 'Red'),  -- https://www.freedomrunwinery.com/
  ('Freedom Run', 'Unoaked Chardonnay', 'Niagara Escarpment, New York, USA', 'Chardonnay', 'White'),  -- https://www.freedomrunwinery.com/
  ('Freedom Run', 'Riesling', 'Niagara Escarpment, New York, USA', 'Riesling', 'White'),  -- https://www.freedomrunwinery.com/
  ('Freedom Run', 'Estate Pinot Noir', 'Niagara Escarpment, New York, USA', 'Pinot Noir', 'Red'),  -- https://www.freedomrunwinery.com/
  ('Freedom Run', 'Quast & Rosie''s Garden Pinot Noir', 'Niagara Escarpment, New York, USA', 'Pinot Noir', 'Red')  -- https://www.freedomrunwinery.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
