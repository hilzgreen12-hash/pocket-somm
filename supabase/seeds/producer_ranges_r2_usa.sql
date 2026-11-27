-- Producer ranges round 2: widely distributed USA producers.
-- Every row confirmed on a real page opened 2026-11-26; source URL on each row.
-- Run in the Supabase SQL editor (committing this file does not apply it).

-- ---- BAREFOOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Barefoot', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Malbec', 'California, USA', 'Malbec', 'Red'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Rich Red Blend', 'California, USA', null, 'Red'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Sweet Red Blend', 'California, USA', null, 'Red'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Red Moscato', 'California, USA', 'Moscato', 'Red'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Moscato', 'California, USA', 'Moscato', 'White'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Buttery Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Riesling', 'California, USA', 'Riesling', 'White'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Pink Moscato', 'California, USA', 'Moscato', 'Rosé'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'White Zinfandel', 'California, USA', 'Zinfandel', 'Rosé'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Rosé', 'California, USA', null, 'Rosé'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Brut Cuvée', 'California, USA', null, 'Sparkling'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Bubbly Extra Dry', 'California, USA', null, 'Sparkling'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Brut Rosé', 'California, USA', null, 'Sparkling'),  -- https://www.barefootwine.com/our-wines.html
  ('Barefoot', 'Bubbly Moscato Spumante', 'California, USA', 'Moscato', 'Sparkling')  -- https://www.barefootwine.com/our-wines.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- APOTHIC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Apothic', 'Red', 'California, USA', null, 'Red'),  -- https://www.apothic.com/wines
  ('Apothic', 'Dark', 'California, USA', null, 'Red'),  -- https://www.apothic.com/wines
  ('Apothic', 'Inferno', 'California, USA', null, 'Red'),  -- https://www.apothic.com/wines
  ('Apothic', 'Crush', 'California, USA', null, 'Red'),  -- https://www.apothic.com/wines
  ('Apothic', 'Cabernet', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.apothic.com/wines
  ('Apothic', 'Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://www.apothic.com/wines
  ('Apothic', 'Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.apothic.com/wines
  ('Apothic', 'White', 'California, USA', null, 'White'),  -- https://www.apothic.com/wines
  ('Apothic', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.apothic.com/wines
  ('Apothic', 'Rosé', 'California, USA', null, 'Rosé')  -- https://www.apothic.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOUIS M. MARTINI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Louis M. Martini', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/louis-m-martini/page/1/2/
  ('Louis M. Martini', 'Monte Rosso Vineyard Cabernet Sauvignon', 'Sonoma Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decanter.com/wine-reviews/search/louis-m-martini/page/1/2/
  ('Louis M. Martini', 'Lot No. 1', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.decanter.com/wine-reviews/search/louis-m-martini/page/1/2/
  ('Louis M. Martini', 'The Gryphon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.louismartini.com/the-gryphon/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GALLO FAMILY VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Gallo Family Vineyards', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Moscato', 'California, USA', 'Moscato', 'White'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Pink Moscato', 'California, USA', 'Moscato', 'Rosé'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Red Moscato', 'California, USA', 'Moscato', 'Red'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Sweet Red', 'California, USA', null, 'Red'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Café Zinfandel', 'California, USA', 'Zinfandel', 'Red'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'White Merlot', 'California, USA', 'Merlot', 'Rosé'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'White Zinfandel', 'California, USA', 'Zinfandel', 'Rosé'),  -- https://www.gallofamily.com/wines.php
  ('Gallo Family Vineyards', 'Hearty Burgundy', 'California, USA', null, 'Red')  -- https://www.gallofamily.com/wines/hearty-burgundy.php
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DUCKHORN VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Duckhorn Vineyards', 'Napa Valley Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/collections/merlot
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/products/2022-duckhorn-vineyards-napa-valley-cabernet-sauvignon
  ('Duckhorn Vineyards', 'North Coast Sauvignon Blanc', 'North Coast, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.duckhorn.com/product/2024-duckhorn-vineyards-north-coast-sauvignon-blanc
  ('Duckhorn Vineyards', 'Three Palms Vineyard Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/products/2022-duckhorn-vineyards-napa-valley-merlot-three-palms-vineyard
  ('Duckhorn Vineyards', 'The Discussion', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.duckhorn.com/products/duckhorn-vineyards-the-discussion-napa-valley-red-wine
  ('Duckhorn Vineyards', 'Carneros Merlot', 'Carneros, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/products/2020-duckhorn-vineyards-carneros-napa-valley-merlot
  ('Duckhorn Vineyards', 'Atlas Peak Merlot', 'Atlas Peak, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/collections/merlot
  ('Duckhorn Vineyards', 'Rector Creek Vineyard Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.duckhorn.com/products/2021-duckhorn-vineyards-napa-valley-merlot-rector-creek-vineyard
  ('Duckhorn Vineyards', 'Napa Valley Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.duckhorn.com/products/2023-duckhorn-vineyards-napa-valley-cabernet-franc
  ('Duckhorn Vineyards', 'Rutherford Cabernet Sauvignon', 'Rutherford, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/products/2020-duckhorn-vineyards-rutherford-napa-valley-cabernet-sauvignon
  ('Duckhorn Vineyards', 'Howell Mountain Cabernet Sauvignon', 'Howell Mountain, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/products/2021-duckhorn-vineyards-howell-mountain-napa-valley-cabernet-sauvignon
  ('Duckhorn Vineyards', 'Oakville Cabernet Sauvignon', 'Oakville, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.duckhorn.com/products/2022-duckhorn-vineyards-oakville-napa-valley-cabernet-sauvignon
  ('Duckhorn Vineyards', 'Stags Leap District Cabernet Sauvignon', 'Stags Leap District, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.duckhorn.com/products/2023-duckhorn-vineyards-napa-valley-stags-leap-district-cabernet-sauvignon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DECOY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Decoy', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Red Blend', 'California, USA', null, 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Zinfandel', 'California, USA', 'Zinfandel', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Rosé', 'California, USA', null, 'Rosé'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Brut Cuvée', 'California, USA', null, 'Sparkling'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Featherweight Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Featherweight Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Featherweight Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Limited Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Limited Alexander Valley Cabernet Sauvignon', 'Alexander Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Limited Paso Robles Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Limited Alexander Valley Merlot', 'Alexander Valley, California, USA', 'Merlot', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Limited Alexander Valley Red Blend', 'Alexander Valley, California, USA', null, 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Limited Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Limited Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.decoywines.com/wines
  ('Decoy', 'Limited North Coast Sauvignon Blanc', 'North Coast, California, USA', 'Sauvignon Blanc', 'White')  -- https://www.decoywines.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SILVER OAK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Silver Oak', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/silver-oak
  ('Silver Oak', 'Alexander Valley Cabernet Sauvignon', 'Alexander Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/silver-oak
  ('Silver Oak', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White')  -- https://www.decanter.com/wine-reviews/search/silver-oak/page/1/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STAG'S LEAP WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Stag''s Leap Wine Cellars', 'Artemis Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.stagsleapwinecellars.com/?p=8
  ('Stag''s Leap Wine Cellars', 'Karia Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.stagsleapwinecellars.com/?p=8
  ('Stag''s Leap Wine Cellars', 'Aveta Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.stagsleapwinecellars.com/?p=8
  ('Stag''s Leap Wine Cellars', 'Fay Cabernet Sauvignon', 'Stags Leap District, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.stagsleapwinecellars.com/?p=8
  ('Stag''s Leap Wine Cellars', 'S.L.V. Cabernet Sauvignon', 'Stags Leap District, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.stagsleapwinecellars.com/?p=8
  ('Stag''s Leap Wine Cellars', 'Cask 23 Cabernet Sauvignon', 'Stags Leap District, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.decanter.com/wine-reviews/usa/california/stags-leap-wine-cellars-cask-23-cabernet-sauvignon-napa-97067/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRANK FAMILY VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Frank Family Vineyards', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://frankfamilyvineyards.com/wine/napa-valley/napa-valley-cabernet-sauvignon-2023
  ('Frank Family Vineyards', 'Napa Valley Zinfandel', 'Napa Valley, California, USA', 'Zinfandel', 'Red'),  -- https://frankfamilyvineyards.com/wine/napa-valley/napa-valley-zinfandel-2023
  ('Frank Family Vineyards', 'Carneros Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://frankfamilyvineyards.com/wine/napa-valley/carneros-chardonnay-2024
  ('Frank Family Vineyards', 'Carneros Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://frankfamilyvineyards.com/wine/napa-valley/carneros-pinot-noir-2023
  ('Frank Family Vineyards', 'Blanc de Blancs', 'Carneros, California, USA', 'Chardonnay', 'Sparkling'),  -- https://www.frankfamilyvineyards.com/wine/bubbles/blanc-de-blancs-2020
  ('Frank Family Vineyards', 'Brut Rosé', 'Carneros, California, USA', 'Pinot Noir', 'Sparkling'),  -- https://www.frankfamilyvineyards.com/wine/bubbles/brut-rose-2020
  ('Frank Family Vineyards', 'Patriarch', 'Rutherford, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.frankfamilyvineyards.com/wine/reserve/patriarch-2022
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- J. LOHR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('J. Lohr', 'Seven Oaks Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.jlohr.com/wines/2023-seven-oaks-cabernet-sauvignon
  ('J. Lohr', 'Los Osos Merlot', 'Paso Robles, California, USA', 'Merlot', 'Red'),  -- https://www.jlohr.com/wines/2022-los-osos-merlot
  ('J. Lohr', 'South Ridge Syrah', 'Paso Robles, California, USA', 'Syrah', 'Red'),  -- https://www.jlohr.com/wines/2022-south-ridge-syrah
  ('J. Lohr', 'Riverstone Chardonnay', 'Arroyo Seco, California, USA', 'Chardonnay', 'White'),  -- https://www.jlohr.com/wines/2023-riverstone-chardonnay
  ('J. Lohr', 'Flume Crossing Sauvignon Blanc', 'Arroyo Seco, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.jlohr.com/wines/2023-flume-crossing-sauvignon-blanc
  ('J. Lohr', 'Falcon''s Perch Pinot Noir', 'Monterey, California, USA', 'Pinot Noir', 'Red'),  -- https://www.jlohr.com/wines/2024-falcons-perch-pinot-noir
  ('J. Lohr', 'Paperwhite Unoaked Chardonnay', 'Arroyo Seco, California, USA', 'Chardonnay', 'White'),  -- https://www.jlohr.com/wines/2024-paperwhite-by-j-lohr-unoaked-chardonnay
  ('J. Lohr', 'Bay Mist White Riesling', 'Monterey, California, USA', 'Riesling', 'White'),  -- https://www.jlohr.com/wines/2024-bay-mist-white-riesling
  ('J. Lohr', 'Wildflower Valdiguié', 'Monterey, California, USA', 'Valdiguié', 'Red'),  -- https://www.jlohr.com/wines/2025-wildflower-valdiguie
  ('J. Lohr', 'Hilltop Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.jlohr.com/wines/2023-hilltop-cabernet-sauvignon
  ('J. Lohr', 'Signature Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.jlohr.com/wines/2022-signature-cabernet-sauvignon
  ('J. Lohr', 'Carol''s Vineyard Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.jlohr.com/wines/2023-carols-vineyard-cabernet-sauvignon
  ('J. Lohr', 'Cuvée PAU', 'Paso Robles, California, USA', null, 'Red'),  -- https://www.jlohr.com/wines/2023-cuvee-pau-red-blend
  ('J. Lohr', 'Cuvée POM', 'Paso Robles, California, USA', null, 'Red'),  -- https://www.jlohr.com/wines/2023-cuvee-pom
  ('J. Lohr', 'Cuvée St. E', 'Paso Robles, California, USA', null, 'Red'),  -- https://www.jlohr.com/wines/2023-cuvee-st-e
  ('J. Lohr', 'Pure Paso Proprietary Red Wine', 'Paso Robles, California, USA', null, 'Red'),  -- https://www.jlohr.com/wines/2023-pure-paso
  ('J. Lohr', 'Tower Road Petite Sirah', 'Paso Robles, California, USA', 'Petite Sirah', 'Red'),  -- https://www.jlohr.com/wines/2023-tower-road-petite-sirah
  ('J. Lohr', 'October Night Chardonnay', 'Arroyo Seco, California, USA', 'Chardonnay', 'White'),  -- https://www.jlohr.com/wines/2023-october-night-chardonnay
  ('J. Lohr', 'Arroyo Vista Chardonnay', 'Arroyo Seco, California, USA', 'Chardonnay', 'White'),  -- https://www.jlohr.com/wines/2024-arroyo-vista-chardonnay
  ('J. Lohr', 'Fog''s Reach Pinot Noir', 'Arroyo Seco, California, USA', 'Pinot Noir', 'Red')  -- https://www.jlohr.com/wines/2024-fogs-reach-pinot-noir
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RIDGE VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Ridge Vineyards', 'Monte Bello', 'Santa Cruz Mountains, California, USA', null, 'Red'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Estate Cabernet Sauvignon', 'Santa Cruz Mountains, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Estate Merlot', 'Santa Cruz Mountains, California, USA', 'Merlot', 'Red'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Estate Chardonnay', 'Santa Cruz Mountains, California, USA', 'Chardonnay', 'White'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Monte Bello Chardonnay', 'Santa Cruz Mountains, California, USA', 'Chardonnay', 'White'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Geyserville', 'Alexander Valley, California, USA', null, 'Red'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Lytton Springs', 'Dry Creek Valley, California, USA', null, 'Red'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Three Valleys', 'Sonoma County, California, USA', null, 'Red'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'East Bench Zinfandel', 'Dry Creek Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Pagani Ranch Zinfandel', 'Sonoma Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Ponzo Zinfandel', 'Russian River Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.ridgewine.com/wines/
  ('Ridge Vineyards', 'Lytton Estate Petite Sirah', 'Dry Creek Valley, California, USA', 'Petite Sirah', 'Red')  -- https://www.ridgewine.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAKEBREAD CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Cakebread Cellars', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Cabernet Franc', 'Napa Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Dancing Bear Cabernet Sauvignon', 'Howell Mountain, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Benchland Select Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Suscol Springs Syrah', 'Napa Valley, California, USA', 'Syrah', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Two Creeks Vineyards Pinot Noir', 'Anderson Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.cakebread.com/collection/red/
  ('Cakebread Cellars', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.cakebread.com/collection/white-wine/
  ('Cakebread Cellars', 'Chardonnay Reserve', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.cakebread.com/collection/white-wine/
  ('Cakebread Cellars', 'Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White')  -- https://www.cakebread.com/collection/white-wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RODNEY STRONG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Rodney Strong', 'Sonoma County Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.rodneystrong.com/our-wines/
  ('Rodney Strong', 'Alexander Valley Sauvignon Blanc', 'Alexander Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.rodneystrong.com/our-wines/new-release/alexander-valley-sauvignon-blanc/
  ('Rodney Strong', 'Chalk Hill Chardonnay', 'Chalk Hill, California, USA', 'Chardonnay', 'White'),  -- https://www.rodneystrong.com/our-wines/
  ('Rodney Strong', 'Reserve Cabernet Sauvignon', 'Alexander Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.rodneystrong.com/our-wines/
  ('Rodney Strong', 'Knights Valley Cabernet Sauvignon', 'Knights Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.rodneystrong.com/our-wines/
  ('Rodney Strong', 'Symmetry', 'Alexander Valley, California, USA', null, 'Red'),  -- https://www.rodneystrong.com/our-story/appellations-vineyards/
  ('Rodney Strong', 'Rockaway Vineyard Cabernet Sauvignon', 'Alexander Valley, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.rodneystrong.com/our-story/appellations-vineyards/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SONOMA-CUTRER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Sonoma-Cutrer', 'Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/sonoma-cutrer/2/
  ('Sonoma-Cutrer', 'Russian River Ranches Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/sonoma-cutrer/2/
  ('Sonoma-Cutrer', 'Les Pierres Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/sonoma-cutrer/2/
  ('Sonoma-Cutrer', 'The Cutrer Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/sonoma-cutrer/2/
  ('Sonoma-Cutrer', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/sonoma-cutrer/2/
  ('Sonoma-Cutrer', 'Les Plus Haut Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/sonoma-cutrer/2/
  ('Sonoma-Cutrer', 'Rosé of Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Rosé')  -- https://www.decanter.com/wine-reviews/search/sonoma-cutrer/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- 14 HANDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('14 Hands', 'Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Sweet Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Run Wild Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Stampede Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Buttery Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Sauvignon Blanc', 'Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Pinot Grigio', 'Washington, USA', 'Pinot Grigio', 'White'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Rosé', 'Washington, USA', null, 'Rosé'),  -- https://www.14hands.com/our-wines
  ('14 Hands', 'Hot to Trot Red Blend', 'Columbia Valley, Washington, USA', null, 'Red')  -- https://www.vivino.com/en/wineries/fourteen-hands
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COLUMBIA CREST ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Columbia Crest', 'Grand Estates Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Grand Estates Merlot', 'Washington, USA', 'Merlot', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Grand Estates Syrah', 'Washington, USA', 'Syrah', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Grand Estates Red Blend', 'Washington, USA', null, 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Grand Estates Chardonnay', 'Washington, USA', 'Chardonnay', 'White'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Reserve Cabernet Sauvignon', 'Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Reserve Walter Clore Red Wine', 'Washington, USA', null, 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Founders Series Cabernet Sauvignon', 'Horse Heaven Hills, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Founders Series Merlot', 'Horse Heaven Hills, Washington, USA', 'Merlot', 'Red'),  -- https://www.columbiacrest.com/our-wines
  ('Columbia Crest', 'Founders Series Chardonnay', 'Horse Heaven Hills, Washington, USA', 'Chardonnay', 'White')  -- https://www.columbiacrest.com/our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LA CREMA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('La Crema', 'Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Russian River Valley Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Sonoma County Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Fog Veil Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Saralee''s Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Anderson Valley Pinot Noir', 'Anderson Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Los Carneros Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Arroyo Seco Pinot Noir', 'Arroyo Seco, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Santa Lucia Highlands Pinot Noir', 'Santa Lucia Highlands, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Russian River Valley Brut Rosé', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/wines
  ('La Crema', 'Willamette Valley Blanc de Blancs', 'Willamette Valley, Oregon, USA', null, 'Sparkling')  -- https://www.lacrema.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MÉNAGE À TROIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Ménage à Trois', 'Red Blend', 'California, USA', null, 'Red'),  -- https://www.menageatroiswines.com/wines/red-blend/
  ('Ménage à Trois', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.menageatroiswines.com/wines/cabernet-sauvignon/
  ('Ménage à Trois', 'Bourbon Barrel Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.menageatroiswines.com/wines/bourbon-barrel-cabernet-sauvignon/
  ('Ménage à Trois', 'Decadence Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.menageatroiswines.com/wines/decadence-cabernet-sauvignon/
  ('Ménage à Trois', 'Lavish Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://www.menageatroiswines.com/wines/lavish-merlot/
  ('Ménage à Trois', 'Lucious Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.menageatroiswines.com/wines/lucious-pinot-noir/
  ('Ménage à Trois', 'Silk Soft Red Blend', 'California, USA', null, 'Red'),  -- https://www.menageatroiswines.com/wines/silk-soft-red-blend/
  ('Ménage à Trois', 'Sublime Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.menageatroiswines.com/wines/sublime-sauvignon-blanc/
  ('Ménage à Trois', 'Exotic White Blend', 'California, USA', null, 'White'),  -- https://www.menageatroiswines.com/wines/exotic-white-blend/
  ('Ménage à Trois', 'Gold Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.menageatroiswines.com/wines/gold-chardonnay/
  ('Ménage à Trois', 'Limelight Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://www.menageatroiswines.com/wines/limelight-pinot-grigio/
  ('Ménage à Trois', 'Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://www.menageatroiswines.com/wines/pinot-grigio/
  ('Ménage à Trois', 'Moscato Sweet White Blend', 'California, USA', 'Moscato', 'White'),  -- https://www.menageatroiswines.com/wines/moscato-sweet-white-blend/
  ('Ménage à Trois', 'Light Red Blend', 'California, USA', null, 'Red'),  -- https://www.menageatroiswines.com/wines/light-red-blend/
  ('Ménage à Trois', 'Light Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://www.menageatroiswines.com/wines/light-pinot-grigio/
  ('Ménage à Trois', 'Light Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.menageatroiswines.com/wines/light-sauvignon-blanc/
  ('Ménage à Trois', 'Northern Seduction Red Blend', 'Columbia Valley, Washington, USA', null, 'Red')  -- https://www.menageatroiswines.com/wines/northern-seduction-red-blend/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THE PRISONER WINE COMPANY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('The Prisoner Wine Company', 'The Prisoner Red Blend', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.napawineproject.com/the-prisoner-wine-company/
  ('The Prisoner Wine Company', 'The Prisoner Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.napawineproject.com/the-prisoner-wine-company/
  ('The Prisoner Wine Company', 'The Prisoner Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.napawineproject.com/the-prisoner-wine-company/
  ('The Prisoner Wine Company', 'Saldo Zinfandel', 'California, USA', 'Zinfandel', 'Red')  -- https://www.napawineproject.com/the-prisoner-wine-company/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- AUSTIN HOPE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Austin Hope', 'Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://hopefamilywines.com/our-wine/austin-hope/
  ('Austin Hope', 'Reserve Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://hopefamilywines.com/our-wine/austin-hope/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TREANA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Treana', 'Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://hopefamilywines.com/our-wine/treana/
  ('Treana', 'Red Blend', 'Central Coast, California, USA', null, 'Red'),  -- https://hopefamilywines.com/our-wine/treana/
  ('Treana', 'Blanc', 'Central Coast, California, USA', null, 'White'),  -- https://hopefamilywines.com/our-wine/treana/
  ('Treana', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://hopefamilywines.com/our-wine/treana/
  ('Treana', 'Blanc de Blancs', 'California, USA', null, 'Sparkling')  -- https://hopefamilywines.com/our-wine/treana/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LIBERTY SCHOOL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Liberty School', 'Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://hopefamilywines.com/our-wine/liberty-school/
  ('Liberty School', 'Reserve Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://hopefamilywines.com/our-wine/liberty-school/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SUTTER HOME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Sutter Home', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'Red Moscato', 'California, USA', 'Moscato', 'Red'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'Sweet Red Wine', 'California, USA', null, 'Red'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'Moscato', 'California, USA', 'Moscato', 'White'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'Pink Moscato', 'California, USA', 'Moscato', 'Rosé'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'White Merlot', 'California, USA', 'Merlot', 'Rosé'),  -- https://www.sutterhome.com/wines
  ('Sutter Home', 'White Zinfandel', 'California, USA', 'Zinfandel', 'Rosé')  -- https://www.sutterhome.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RAVENSWOOD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Ravenswood', 'Dry Creek Valley Zinfandel', 'Dry Creek Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.ravenswoodwinery.com/our-wines.html
  ('Ravenswood', 'Monte Rosso Vineyard Zinfandel', 'Moon Mountain District, California, USA', 'Zinfandel', 'Red'),  -- https://www.ravenswoodwinery.com/our-wines.html
  ('Ravenswood', 'Teldeschi Vineyard Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.ravenswoodwinery.com/our-wines.html
  ('Ravenswood', 'MacMurray Vineyard Zinfandel', 'Russian River Valley, California, USA', 'Zinfandel', 'Red')  -- https://www.ravenswoodwinery.com/our-wines.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DU BOIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_usa.sql)'
from (values
  ('Clos du Bois', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.closdubois.com/our-wines.html
  ('Clos du Bois', 'Buttery Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.closdubois.com/our-wines.html
  ('Clos du Bois', 'Tropical Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.closdubois.com/our-wines.html
  ('Clos du Bois', 'Reserve Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.closdubois.com/our-wines.html
  ('Clos du Bois', 'Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://www.closdubois.com/our-wines.html
  ('Clos du Bois', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.closdubois.com/our-wines.html
  ('Clos du Bois', 'Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.closdubois.com/our-wines.html
  ('Clos du Bois', 'Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://www.closdubois.com/our-wines.html
  ('Clos du Bois', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.closdubois.com/our-wines.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
