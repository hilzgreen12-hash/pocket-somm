-- Producer ranges round 3: New Zealand. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- VILLA MARIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Villa Maria', 'Attorney Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://villamariawines.com/nz/products/attorney-pinot-noir/
  ('Villa Maria', 'Blush Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'Rosé'),  -- https://villamariawines.com/nz/products/blush-sauvignon-blanc/
  ('Villa Maria', 'Cellar Selection Chardonnay', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://villamariawines.com/nz/products/cellar-selection-hawkes-bay-chardonnay/
  ('Villa Maria', 'Cellar Selection Merlot Cabernet Sauvignon', 'Hawke''s Bay, New Zealand', 'Merlot/Cabernet Sauvignon', 'Red'),  -- https://villamariawines.com/nz/products/cellar-selection-merlot-cabernet-sauvignon/
  ('Villa Maria', 'Cellar Selection Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://villamariawines.com/nz/products/cellar-selection-pinot-gris/
  ('Villa Maria', 'Cellar Selection Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://villamariawines.com/nz/products/cellar-selection-pinot-noir/
  ('Villa Maria', 'Cellar Selection Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://villamariawines.com/nz/products/cellar-selection-rose/
  ('Villa Maria', 'Cellar Selection Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/cellar-selection-sauvignon-blanc/
  ('Villa Maria', 'Cellar Selection Syrah', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://villamariawines.com/nz/products/cellar-selection-syrah/
  ('Villa Maria', 'EarthGarden Chardonnay', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://villamariawines.com/nz/products/earthgarden-chardonnay/
  ('Villa Maria', 'EarthGarden Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://villamariawines.com/nz/products/earthgarden-pinot-noir/
  ('Villa Maria', 'EarthGarden Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/earthgarden-sauvignon-blanc/
  ('Villa Maria', 'Keltern Chardonnay', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://villamariawines.com/nz/products/keltern-chardonnay/
  ('Villa Maria', 'Ngakirikiri', 'Hawke''s Bay, New Zealand', null, 'Red'),  -- https://villamariawines.com/nz/products/ngakirikiri/
  ('Villa Maria', 'Private Bin Chardonnay', 'New Zealand', 'Chardonnay', 'White'),  -- https://villamariawines.com/nz/products/private-bin-chardonnay/
  ('Villa Maria', 'Private Bin Gewürztraminer', 'New Zealand', 'Gewürztraminer', 'White'),  -- https://villamariawines.com/nz/products/private-bin-gewurztraminer/
  ('Villa Maria', 'Private Bin Lighter Rosé', 'New Zealand', null, 'Rosé'),  -- https://villamariawines.com/nz/products/private-bin-lighter-rose/
  ('Villa Maria', 'Private Bin Lighter Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/private-bin-lighter-sauvignon-blanc/
  ('Villa Maria', 'Private Bin Merlot Cabernet', 'New Zealand', 'Merlot/Cabernet Sauvignon/Cabernet Franc/Malbec', 'Red'),  -- https://villamariawines.com/nz/products/private-bin-merlot-cabernet/
  ('Villa Maria', 'Private Bin Merlot', 'Hawke''s Bay, New Zealand', 'Merlot', 'Red'),  -- https://villamariawines.com/nz/products/private-bin-merlot/
  ('Villa Maria', 'Private Bin Pinot Gris', 'New Zealand', 'Pinot Gris', 'White'),  -- https://villamariawines.com/nz/products/private-bin-pinot-gris/
  ('Villa Maria', 'Private Bin Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://villamariawines.com/nz/products/private-bin-pinot-noir/
  ('Villa Maria', 'Private Bin Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://villamariawines.com/nz/products/private-bin-riesling/
  ('Villa Maria', 'Private Bin Rosé', 'Hawke''s Bay, New Zealand', null, 'Rosé'),  -- https://villamariawines.com/nz/products/private-bin-rose/
  ('Villa Maria', 'Private Bin Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/private-bin-sauvignon-blanc/
  ('Villa Maria', 'Reserve Albariño', 'Gisborne, New Zealand', 'Albariño', 'White'),  -- https://villamariawines.com/nz/products/reserve-albarino/
  ('Villa Maria', 'Reserve Cabernet Sauvignon Merlot', 'Hawke''s Bay, New Zealand', 'Cabernet Sauvignon/Merlot', 'Red'),  -- https://villamariawines.com/nz/products/reserve-cabernet-sauvignon-merlot/
  ('Villa Maria', 'Reserve Chardonnay', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://villamariawines.com/nz/products/reserve-chardonnay/
  ('Villa Maria', 'Reserve Clifford Bay Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/reserve-clifford-bay-sauvignon-blanc/
  ('Villa Maria', 'Reserve Méthode Traditionnelle', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://villamariawines.com/nz/products/reserve-methode-traditionnelle/
  ('Villa Maria', 'Reserve Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://villamariawines.com/nz/products/reserve-pinot-noir/
  ('Villa Maria', 'Reserve Wairau Valley Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/reserve-wairau-valley-sauvignon-blanc/
  ('Villa Maria', 'Single Vineyard Attorney Pinot Noir Rosé', 'Marlborough, New Zealand', 'Pinot Noir', 'Rosé'),  -- https://villamariawines.com/nz/products/single-vineyard-attorney-pinot-noir-rose/
  ('Villa Maria', 'Single Vineyard Bankhouse Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/single-vineyard-bankhouse-sauvignon-blanc/
  ('Villa Maria', 'Single Vineyard Braided Gravels Albariño', 'Hawke''s Bay, New Zealand', 'Albariño', 'White'),  -- https://villamariawines.com/nz/products/single-vineyard-braided-gravels-albarino/
  ('Villa Maria', 'Single Vineyard Ihumātao Chardonnay', 'Auckland, New Zealand', 'Chardonnay', 'White'),  -- https://villamariawines.com/nz/products/single-vineyard-ihumatao-chardonnay/
  ('Villa Maria', 'Single Vineyard McDiarmid Hill Chardonnay', 'Gisborne, New Zealand', 'Chardonnay', 'White'),  -- https://villamariawines.com/nz/products/single-vineyard-mcdiarmid-hill-chardonnay/
  ('Villa Maria', 'Single Vineyard Seaspray Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/single-vineyard-seaspray-sauvignon-blanc/
  ('Villa Maria', 'Single Vineyard Seddon Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://villamariawines.com/nz/products/single-vineyard-seddon-pinot-gris/
  ('Villa Maria', 'Single Vineyard Seddon Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://villamariawines.com/nz/products/single-vineyard-seddon-pinot-noir/
  ('Villa Maria', 'Single Vineyard Southern Clays Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/single-vineyard-southern-clays-sauvignon-blanc/
  ('Villa Maria', 'Single Vineyard Taylors Pass Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://villamariawines.com/nz/products/single-vineyard-taylors-pass-chardonnay/
  ('Villa Maria', 'Single Vineyard Taylors Pass Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://villamariawines.com/nz/products/single-vineyard-taylors-pass-pinot-noir/
  ('Villa Maria', 'Single Vineyard Taylors Pass Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://villamariawines.com/nz/products/single-vineyard-taylors-pass-sauvignon-blanc/
  ('Villa Maria', 'Single Vineyard Twyford Gravels Syrah', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://villamariawines.com/nz/products/single-vineyard-twyford-gravels-syrah/
  ('Villa Maria', 'Sparkling Brut Rosé', 'New Zealand', null, 'Sparkling'),  -- https://villamariawines.com/nz/products/sparkling-brut-rose/
  ('Villa Maria', 'Sparkling Cuvée Brut', 'New Zealand', null, 'Sparkling'),  -- https://villamariawines.com/nz/products/sparkling-cuvee-brut/
  ('Villa Maria', 'Woven Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White')  -- https://villamariawines.com/nz/products/woven-sauvignon-blanc/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- OYSTER BAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Oyster Bay', 'Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.oysterbaywines.com/nz/our-wines/marlborough-sauvignon-blanc/
  ('Oyster Bay', 'Marlborough Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://www.oysterbaywines.com/nz/our-wines/marlborough-chardonnay/
  ('Oyster Bay', 'Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.oysterbaywines.com/nz/our-wines/marlborough-pinot-noir/
  ('Oyster Bay', 'Marlborough Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://www.oysterbaywines.com/nz/our-wines/marlborough-rose/
  ('Oyster Bay', 'Hawke''s Bay Merlot', 'Hawke''s Bay, New Zealand', 'Merlot', 'Red'),  -- https://www.oysterbaywines.com/nz/our-wines/hawkes-bay-merlot/
  ('Oyster Bay', 'Hawke''s Bay Pinot Gris', 'Hawke''s Bay, New Zealand', 'Pinot Gris', 'White'),  -- https://www.oysterbaywines.com/nz/our-wines/hawkes-bay-pinot-gris/
  ('Oyster Bay', 'Hawke''s Bay Pinot Grigio', 'Hawke''s Bay, New Zealand', 'Pinot Gris', 'White'),  -- https://www.oysterbaywines.com/uk/our-wines/hawkes-bay-pinot-grigio/
  ('Oyster Bay', 'Sparkling Cuvée Brut', 'New Zealand', null, 'Sparkling'),  -- https://www.oysterbaywines.com/nz/our-wines/sparkling-cuvee-brut/
  ('Oyster Bay', 'Sparkling Cuvée Rosé', 'New Zealand', null, 'Sparkling')  -- https://www.oysterbaywines.com/nz/our-wines/sparkling-cuvee-rose/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KIM CRAWFORD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Kim Crawford', 'Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.kimcrawfordwines.com/products/sauvignon-blanc
  ('Kim Crawford', 'Chardonnay', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://www.kimcrawfordwines.com/products/chardonnay
  ('Kim Crawford', 'Pinot Gris', 'Hawke''s Bay, New Zealand', 'Pinot Gris', 'White'),  -- https://www.kimcrawfordwines.com/products/pinot-gris
  ('Kim Crawford', 'Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.kimcrawfordwines.com/products/pinot-noir
  ('Kim Crawford', 'Illuminate Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.kimcrawfordwines.com/products/illuminate-sauvignon-blanc
  ('Kim Crawford', 'Illuminate Rosé', 'Hawke''s Bay, New Zealand', null, 'Rosé')  -- https://www.kimcrawfordwines.com/products/hawke-s-bay-rose
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STONELEIGH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Stoneleigh', 'Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://stoneleigh.com/products/classic-sauvignon-blanc
  ('Stoneleigh', 'Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://stoneleigh.com/products/classic-pinot-noir
  ('Stoneleigh', 'Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://stoneleigh.com/products/classic-pinot-gris
  ('Stoneleigh', 'Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://stoneleigh.com/products/classic-chardonnay
  ('Stoneleigh', 'Pinot Noir Rosé', 'Marlborough, New Zealand', 'Pinot Noir', 'Rosé'),  -- https://stoneleigh.com/products/classic-pinot-noir-rose
  ('Stoneleigh', 'Merlot', 'Marlborough, New Zealand', 'Merlot', 'Red'),  -- https://stoneleigh.com/products/classic-merlot
  ('Stoneleigh', 'Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://stoneleigh.com/products/classic-riesling
  ('Stoneleigh', 'Latitude Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://stoneleigh.com/products/latitude-sauvignon-blanc
  ('Stoneleigh', 'Latitude Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://stoneleigh.com/products/latitude-chardonnay
  ('Stoneleigh', 'Latitude Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://stoneleigh.com/products/latitude-pinot-noir
  ('Stoneleigh', 'Latitude Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://stoneleigh.com/products/latitude-rose
  ('Stoneleigh', 'Latitude Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://stoneleigh.com/products/latitude-pinot-gris
  ('Stoneleigh', 'Lighter Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://stoneleigh.com/products/lighter-sauvignon-blanc
  ('Stoneleigh', 'Lighter Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://stoneleigh.com/products/lighter-rose
  ('Stoneleigh', 'Lighter Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://stoneleigh.com/products/lighter-pinot-gris
  ('Stoneleigh', 'Wild Valley Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://stoneleigh.com/products/wild-valley-sauvignon-blanc
  ('Stoneleigh', 'Wild Valley Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://stoneleigh.com/products/wild-valley-rose
  ('Stoneleigh', 'Wild Valley Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://stoneleigh.com/products/wild-valley-chardonnay
  ('Stoneleigh', 'Wild Valley Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://stoneleigh.com/products/wild-valley-pinot-gris
  ('Stoneleigh', 'Wild Valley Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://stoneleigh.com/products/wild-valley-pinot-noir
  ('Stoneleigh', 'Organic Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://stoneleigh.com/products/organic-sauvignon-blanc
  ('Stoneleigh', 'Organic Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://stoneleigh.com/products/organic-chardonnay
  ('Stoneleigh', 'Organic Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://stoneleigh.com/products/organic-pinot-gris
  ('Stoneleigh', 'Organic Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://stoneleigh.com/products/organic-pinot-noir
  ('Stoneleigh', 'Organic Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://stoneleigh.com/products/organic-rose
  ('Stoneleigh', 'Rapaura Series Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://stoneleigh.com/products/rapaura-chardonnay
  ('Stoneleigh', 'Rapaura Series Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://stoneleigh.com/products/rapaura-pinot-gris
  ('Stoneleigh', 'Rapaura Series Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://stoneleigh.com/products/rapaura-pinot-noir
  ('Stoneleigh', 'Rapaura Series Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://stoneleigh.com/products/rapaura-sauvignon-blanc
  ('Stoneleigh', 'Sparkling Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'Sparkling')  -- https://stoneleigh.com/products/sparkling-sauvignon-blanc
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BRANCOTT ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Brancott Estate', 'Sauvignon Blanc', 'New Zealand', 'Sauvignon Blanc', 'White'),  -- https://brancottestate.com/products/brancott-estate-sauvignon-blanc
  ('Brancott Estate', 'Chardonnay', 'New Zealand', 'Chardonnay', 'White'),  -- https://brancottestate.com/products/brancott-estate-chardonnay
  ('Brancott Estate', 'Merlot', 'New Zealand', 'Merlot', 'Red'),  -- https://brancottestate.com/products/brancott-estate-merlot
  ('Brancott Estate', 'Pinot Gris', 'New Zealand', 'Pinot Gris', 'White'),  -- https://brancottestate.com/products/brancott-estate-pinot-gris
  ('Brancott Estate', 'Pinot Noir', 'New Zealand', 'Pinot Noir', 'Red'),  -- https://brancottestate.com/products/brancott-estate-pinot-noir
  ('Brancott Estate', 'Riesling', 'New Zealand', 'Riesling', 'White'),  -- https://brancottestate.com/products/brancott-estate-riesling
  ('Brancott Estate', 'Letter Series B Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://brancottestate.com/products/letter-series-b-sauvignon-blanc
  ('Brancott Estate', 'Letter Series O Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://brancottestate.com/products/letter-series-o-chardonnay
  ('Brancott Estate', 'Letter Series T Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://brancottestate.com/products/letter-series-t-pinot-noir
  ('Brancott Estate', 'Reserve Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://brancottestate.com/products/reserve-sauvignon-blanc
  ('Brancott Estate', 'Reserve Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://brancottestate.com/products/reserve-chardonnay
  ('Brancott Estate', 'Reserve Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://brancottestate.com/products/reserve-pinot-gris
  ('Brancott Estate', 'Reserve Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://brancottestate.com/products/reserve-pinot-noir
  ('Brancott Estate', 'Reserve Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://brancottestate.com/products/reserve-rose
  ('Brancott Estate', 'Reserve Syrah', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://brancottestate.com/products/reserve-syrah
  ('Brancott Estate', 'Flight Sauvignon Blanc', 'New Zealand', 'Sauvignon Blanc', 'White'),  -- https://brancottestate.com/products/flight-sauvignon-blanc
  ('Brancott Estate', 'Flight Pinot Gris', 'New Zealand', 'Pinot Gris', 'White'),  -- https://brancottestate.com/products/flight-pinot-gris
  ('Brancott Estate', 'Flight Rosé', 'New Zealand', null, 'Rosé'),  -- https://brancottestate.com/products/flight-rose
  ('Brancott Estate', 'Sparkling Brut Cuvée', 'New Zealand', null, 'Sparkling'),  -- https://brancottestate.com/products/sparkling-brut-cuvee
  ('Brancott Estate', 'Sparkling Rosé', 'New Zealand', null, 'Sparkling'),  -- https://brancottestate.com/products/sparkling-rose
  ('Brancott Estate', 'Sparkling Sauvignon Blanc Brut', 'New Zealand', 'Sauvignon Blanc', 'Sparkling')  -- https://brancottestate.com/products/sparkling-sauvignon-blanc-brut
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MATUA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Matua', 'Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.matuawine.com/collections/all/products/crisp-marlborough-sauv-blanc
  ('Matua', 'First Frost Lighter Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.matuawine.com/collections/all/products/first-frost-sauv-blanc
  ('Matua', 'Marlborough Lighter Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.matuawine.com/collections/all/products/marlborough-lighter-sauv-blanc
  ('Matua', 'The Original New Zealand Sauvignon Blanc', 'New Zealand', 'Sauvignon Blanc', 'White')  -- https://www.matuawine.com/collections/all/products/the-original-new-zealand-sauvignon-blanc
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOUDY BAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Cloudy Bay', 'Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.cloudybay.com/en-ww/our-wines/sauvignon-blanc-2026
  ('Cloudy Bay', 'Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://www.cloudybay.com/en-ww/our-wines/chardonnay-2024
  ('Cloudy Bay', 'Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.cloudybay.com/en-ww/our-wines/pinot-noir-2024
  ('Cloudy Bay', 'Te Koko', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.cloudybay.com/en-ww/our-wines/te-koko-2024
  ('Cloudy Bay', 'Te Wāhi', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.cloudybay.com/en-ww/our-wines/te-wahi-2022
  ('Cloudy Bay', 'Pelorus', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://www.cloudybay.com/en-ww/our-wines/pelorus
  ('Cloudy Bay', 'Pelorus Rosé', 'Marlborough, New Zealand', null, 'Sparkling')  -- https://www.cloudybay.com/en-ww/our-wines/pelorus-rose
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SAINT CLAIR FAMILY ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Saint Clair Family Estate', 'Barrique Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://saintclair.co.nz/products/barrique-sauvignon-blanc-2020
  ('Saint Clair Family Estate', 'Doctor''s Creek Reserve Noble Riesling', 'Marlborough, New Zealand', 'Riesling', 'Sweet'),  -- https://saintclair.co.nz/products/doctors-creek-reserve-noble-riesling-2025
  ('Saint Clair Family Estate', 'Godfrey''s Creek Reserve Gewürztraminer', 'Marlborough, New Zealand', 'Gewürztraminer', 'White'),  -- https://saintclair.co.nz/products/godfreys-creek-reserve-gewurztraminer-2025
  ('Saint Clair Family Estate', 'Godfrey''s Creek Reserve Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://saintclair.co.nz/products/godfreys-creek-reserve-pinot-gris-2024
  ('Saint Clair Family Estate', 'Hawke''s Bay Origin Viognier', 'Hawke''s Bay, New Zealand', 'Viognier', 'White'),  -- https://saintclair.co.nz/products/hawkes-bay-origin-viognier-2019
  ('Saint Clair Family Estate', 'James Sinclair Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://saintclair.co.nz/products/james-sinclair-chardonnay-2024
  ('Saint Clair Family Estate', 'James Sinclair Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://saintclair.co.nz/products/james-sinclair-pinot-gris-2020
  ('Saint Clair Family Estate', 'James Sinclair Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://saintclair.co.nz/products/james-sinclair-pinot-noir-2020
  ('Saint Clair Family Estate', 'James Sinclair Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://saintclair.co.nz/products/james-sinclair-sauvignon-blanc-2024
  ('Saint Clair Family Estate', 'James Sinclair Cabernet Merlot', 'New Zealand', 'Cabernet Sauvignon/Merlot', 'Red'),  -- https://saintclair.co.nz/
  ('Saint Clair Family Estate', 'Marlborough Origin Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://saintclair.co.nz/products/marlborough-origin-chardonnay-2024
  ('Saint Clair Family Estate', 'Marlborough Origin Grüner Veltliner', 'Marlborough, New Zealand', 'Grüner Veltliner', 'White'),  -- https://saintclair.co.nz/products/marlborough-origin-gruner-veltliner-2021
  ('Saint Clair Family Estate', 'Marlborough Origin Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://saintclair.co.nz/products/marlborough-origin-pinot-gris-2025
  ('Saint Clair Family Estate', 'Marlborough Origin Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://saintclair.co.nz/products/marlborough-origin-pinot-noir-2025
  ('Saint Clair Family Estate', 'Marlborough Origin Pinot Gris Rosé', 'Marlborough, New Zealand', 'Pinot Gris', 'Rosé'),  -- https://saintclair.co.nz/products/marlborough-origin-rose-2025
  ('Saint Clair Family Estate', 'Marlborough Origin Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://saintclair.co.nz/products/marlborough-origin-sauvignon-blanc-2026
  ('Saint Clair Family Estate', 'Omaka Reserve Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://saintclair.co.nz/products/omaka-reserve-chardonnay-2025
  ('Saint Clair Family Estate', 'Omaka Reserve Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://saintclair.co.nz/products/omaka-reserve-pinot-noir-2024
  ('Saint Clair Family Estate', 'Origin Cabernet Merlot', 'New Zealand', 'Cabernet Sauvignon/Merlot', 'Red'),  -- https://saintclair.co.nz/products/origin-cabernet-merlot-2021
  ('Saint Clair Family Estate', 'Origin Gimblett Gravels Merlot', 'Hawke''s Bay, New Zealand', 'Merlot', 'Red'),  -- https://saintclair.co.nz/products/origin-merlot-2022
  ('Saint Clair Family Estate', 'Pioneer Block 10 Twin Hills Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://saintclair.co.nz/products/pioneer-block-10-chardonnay-2023
  ('Saint Clair Family Estate', 'Pioneer Block 10 Twin Hills Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://saintclair.co.nz/products/pioneer-block-10-pinot-noir-2023
  ('Saint Clair Family Estate', 'Pioneer Block 12 Lone Gum Gewürztraminer', 'Marlborough, New Zealand', 'Gewürztraminer', 'White'),  -- https://saintclair.co.nz/products/pioneer-block-12-gewurztraminer-2025
  ('Saint Clair Family Estate', 'Pioneer Block 14 Doctor''s Creek Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://saintclair.co.nz/products/pioneer-block-14-pinot-noir-2021
  ('Saint Clair Family Estate', 'Pioneer Block 15 Strip Block Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://saintclair.co.nz/products/pioneer-block-15-pinot-noir-2022
  ('Saint Clair Family Estate', 'Plateau Block Cabernet Merlot', 'New Zealand', 'Cabernet Sauvignon/Merlot', 'Red'),  -- https://saintclair.co.nz/products/pioneer-block-17-cabernet-merlot-2021
  ('Saint Clair Family Estate', 'Pioneer Block 17 Plateau Merlot', 'New Zealand', 'Merlot', 'Red'),  -- https://saintclair.co.nz/products/pioneer-block-17-merlot-2021
  ('Saint Clair Family Estate', 'Pioneer Block 20 Cash Block Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://saintclair.co.nz/products/pioneer-block-20-sauvignon-blanc-2022
  ('Saint Clair Family Estate', 'Pioneer Block 28 Camp Block Pinot Blanc', 'Marlborough, New Zealand', 'Pinot Blanc', 'White'),  -- https://saintclair.co.nz/products/pioneer-block-28-pinot-blanc-2022
  ('Saint Clair Family Estate', 'Pioneer Block 3 43 Degrees Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://saintclair.co.nz/products/pioneer-block-3-sauvignon-blanc-2025
  ('Saint Clair Family Estate', 'Pioneer Block 30 Table Top Cabernet Franc', 'New Zealand', 'Cabernet Franc', 'Red'),  -- https://saintclair.co.nz/products/pioneer-block-30-cabernet-franc-2021
  ('Saint Clair Family Estate', 'Pioneer Block 5 Bull Block Grüner Veltliner', 'Marlborough, New Zealand', 'Grüner Veltliner', 'White'),  -- https://saintclair.co.nz/products/pioneer-block-5-gruner-veltliner-2021
  ('Saint Clair Family Estate', 'Pioneer Block 5 Bull Block Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://saintclair.co.nz/products/pioneer-block-5-pinot-gris-2022
  ('Saint Clair Family Estate', 'Pioneer Block 9 Big John Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://saintclair.co.nz/products/pioneer-block-9-riesling-2025
  ('Saint Clair Family Estate', 'Pioneer Block 2 Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://saintclair.co.nz/products/saint-clair-pioneer-block-2-sauvignon-blanc-2023
  ('Saint Clair Family Estate', 'Pioneer Block 23 Master Block Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://saintclair.co.nz/products/saint-clair-pioneer-block-23-master-block-pinot-noir-2018
  ('Saint Clair Family Estate', 'Pioneer Block 4 Sawcut Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://saintclair.co.nz/products/saint-clair-pioneer-block-4-sawcut-chardonnay-2021
  ('Saint Clair Family Estate', 'Dawn Méthode Traditionnelle', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://saintclair.co.nz/products/saint-clair-nv-dawn-methode-traditionnelle
  ('Saint Clair Family Estate', 'Sparkling Rosé', 'New Zealand', null, 'Sparkling'),  -- https://saintclair.co.nz/products/saint-clair-sparkling-rose
  ('Saint Clair Family Estate', 'Vicar''s Choice Bright Light Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://saintclair.co.nz/products/vicars-choice-bright-light-sauvignon-blanc-2026
  ('Saint Clair Family Estate', 'Vicar''s Choice Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://saintclair.co.nz/products/vicars-choice-chardonnay-2022
  ('Saint Clair Family Estate', 'Vicar''s Choice Merlot', 'New Zealand', 'Merlot', 'Red'),  -- https://saintclair.co.nz/products/vicars-choice-merlot-2021
  ('Saint Clair Family Estate', 'Vicar''s Choice Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://saintclair.co.nz/products/vicars-choice-pinot-gris-2025
  ('Saint Clair Family Estate', 'Vicar''s Choice Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red')  -- https://saintclair.co.nz/products/vicars-choice-pinot-noir-2023-intl-1
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WHITEHAVEN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Whitehaven', 'Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2025-whitehaven-marlborough-sauvignon-blanc
  ('Whitehaven', 'Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://whitehaven.co.nz/collections/all-wines/products/2023-whitehaven-marlborough-pinot-noir
  ('Whitehaven', 'Marlborough Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2023-whitehaven-marlborough-riesling
  ('Whitehaven', 'Marlborough Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2024-whitehaven-marlborough-chardonnay
  ('Whitehaven', 'Marlborough Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2024-whitehaven-marlborough-pinot-gris
  ('Whitehaven', 'Marlborough Gewürztraminer', 'Marlborough, New Zealand', 'Gewürztraminer', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2025-whitehaven-marlborough-gewurztraminer
  ('Whitehaven', 'Marlborough Pinot Noir Rosé', 'Marlborough, New Zealand', 'Pinot Noir', 'Rosé'),  -- https://whitehaven.co.nz/collections/all-wines/products/2026-whitehaven-marlborough-pinot-noir-rose
  ('Whitehaven', 'Greg Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://whitehaven.co.nz/collections/all-wines/products/2020-whitehaven-greg-pinot-noir
  ('Whitehaven', 'Greg Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2024-whitehaven-greg-sauvignon-blanc
  ('Whitehaven', 'Single Vineyard Series ''Block 11'' Barrel Fermented Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2022-whitehaven-single-vineyard-series-block-11-barrel-fermented-sauvignon-blanc-copy
  ('Whitehaven', 'Single Vineyard Series Fossil Block Riverside Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2024-whitehaven-single-vineyard-series-fossil-block-riverside-chardonnay
  ('Whitehaven', 'Single Vineyard Series Tussocks Skin Contact Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'Orange'),  -- https://whitehaven.co.nz/collections/all-wines/products/2024-whitehaven-single-vineyard-series-tussocks-skin-contact-pinot-gris
  ('Whitehaven', '''The Daughters'' Pinot Noir Rosé Méthode Traditionnelle', 'Marlborough, New Zealand', 'Pinot Noir', 'Sparkling'),  -- https://whitehaven.co.nz/collections/all-wines/products/2022-whitehaven-the-daughters-pinot-noir-rose-methode-traditionnelle
  ('Whitehaven', 'Mansion House Bay Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://whitehaven.co.nz/collections/all-wines/products/2020-mansion-house-bay-marlborough-pinot-noir
  ('Whitehaven', 'Mansion House Bay Marlborough Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2025-mansion-house-bay-marlborough-pinot-gris
  ('Whitehaven', 'Mansion House Bay Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2025-mansion-house-bay-marlborough-sauvignon-blanc
  ('Whitehaven', 'Kōparepare Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://whitehaven.co.nz/collections/all-wines/products/2020-koparepare-marlborough-pinot-noir-copy
  ('Whitehaven', 'Kōparepare Marlborough Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2024-koparepare-marlborough-chardonnay
  ('Whitehaven', 'Kōparepare Marlborough Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2024-koparepare-marlborough-pinot-gris
  ('Whitehaven', 'Kōparepare Marlborough Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://whitehaven.co.nz/collections/all-wines/products/2024-koparepare-marlborough-riesling
  ('Whitehaven', 'Kōparepare Marlborough Pinot Noir Rosé', 'Marlborough, New Zealand', 'Pinot Noir', 'Rosé'),  -- https://whitehaven.co.nz/collections/all-wines/products/2025-koparepare-marlborough-pinot-noir-rose
  ('Whitehaven', 'Kōparepare Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White')  -- https://whitehaven.co.nz/collections/all-wines/products/2025-koparepare-marlborough-sauvignon-blanc
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GIESEN WINE ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Giesen Wine Estate', 'Estate Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.giesenwines.com/products/giesen-estate-sauvignon-blanc-2024
  ('Giesen Wine Estate', 'Chardonnay', 'New Zealand', 'Chardonnay', 'White'),  -- https://www.giesenwines.com/products/chardonnay
  ('Giesen Wine Estate', 'Merlot', 'Hawke''s Bay, New Zealand', 'Merlot', 'Red'),  -- https://www.giesenwines.com/products/merlot
  ('Giesen Wine Estate', 'Pinot Gris', 'New Zealand', 'Pinot Gris', 'White'),  -- https://www.giesenwines.com/products/pinot-gris
  ('Giesen Wine Estate', 'Riesling', 'New Zealand', 'Riesling', 'White'),  -- https://www.giesenwines.com/products/riesling
  ('Giesen Wine Estate', 'Blush Riesling', 'New Zealand', 'Riesling', 'Rosé'),  -- https://www.giesenwines.com/products/blush-riesling
  ('Giesen Wine Estate', 'Organic Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.giesenwines.com/products/organic-sauvignon-blanc
  ('Giesen Wine Estate', 'The August Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.giesenwines.com/collections/all-wines/products/the-august-sauvignon-blanc
  ('Giesen Wine Estate', 'The Brothers Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.giesenwines.com/products/the-brothers-sauvignon-blanc
  ('Giesen Wine Estate', 'Clayvin Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://www.giesenwines.com/products/clayvin-chardonnay
  ('Giesen Wine Estate', 'Clayvin Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.giesenwines.com/products/clayvin-pinot-noir
  ('Giesen Wine Estate', 'Clayvin Syrah', 'Marlborough, New Zealand', 'Syrah', 'Red'),  -- https://www.giesenwines.com/products/clayvin-syrah
  ('Giesen Wine Estate', 'Gemstone Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://www.giesenwines.com/products/gemstone-riesling
  ('Giesen Wine Estate', 'Uncharted Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.giesenwines.com/products/giesen-uncharted-sauvignon-blanc
  ('Giesen Wine Estate', 'Uncharted Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://www.giesenwines.com/products/giesen-uncharted-chardonnay
  ('Giesen Wine Estate', 'Uncharted Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.giesenwines.com/collections/all-wines/products/uncharted-pinot-noir
  ('Giesen Wine Estate', 'Vineyard Selection Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.giesenwines.com/collections/all-wines/products/vineyard-selection-sauvignon-blanc
  ('Giesen Wine Estate', 'Vineyard Selection Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://www.giesenwines.com/collections/all-wines/products/vineyard-selection-pinot-gris
  ('Giesen Wine Estate', 'Vineyard Selection Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.giesenwines.com/collections/all-wines/products/vineyard-selection-pinot-noir
  ('Giesen Wine Estate', 'Pure Light Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.giesenwines.com/products/pure-light-sauvignon-blanc
  ('Giesen Wine Estate', 'Pure Light Pinot Gris', 'New Zealand', 'Pinot Gris', 'White'),  -- https://www.giesenwines.com/products/pure-light-pinot-gris
  ('Giesen Wine Estate', 'Pure Light Merlot', 'New Zealand', 'Merlot', 'Red'),  -- https://www.giesenwines.com/products/pure-light-merlot
  ('Giesen Wine Estate', '0% Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.giesenwines.com/products/0-sauvignon-blanc
  ('Giesen Wine Estate', '0% Chardonnay', 'New Zealand', 'Chardonnay', 'White'),  -- https://www.giesenwines.com/products/0-chardonnay
  ('Giesen Wine Estate', '0% Merlot', 'New Zealand', 'Merlot', 'Red'),  -- https://www.giesenwines.com/products/0-merlot
  ('Giesen Wine Estate', '0% Pinot Gris', 'New Zealand', 'Pinot Gris', 'White'),  -- https://www.giesenwines.com/products/0-pinot-gris
  ('Giesen Wine Estate', '0% Riesling', 'New Zealand', 'Riesling', 'White'),  -- https://www.giesenwines.com/products/0-riesling
  ('Giesen Wine Estate', '0% Rosé', 'New Zealand', null, 'Rosé'),  -- https://www.giesenwines.com/products/0-rose
  ('Giesen Wine Estate', '0% Sparkling', 'New Zealand', null, 'Sparkling')  -- https://www.giesenwines.com/products/0-sparkling-brut
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- YEALANDS ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Yealands Estate', 'Single Vineyard Albariño', 'Marlborough, New Zealand', 'Albariño', 'White'),  -- https://www.yealands.co.nz/discover-wines/
  ('Yealands Estate', 'Single Vineyard Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.yealands.co.nz/discover-wines/
  ('Yealands Estate', 'Single Vineyard P.G.R', 'Marlborough, New Zealand', 'Pinot Gris/Gewürztraminer/Riesling', 'White'),  -- https://www.yealands.co.nz/discover-wines/
  ('Yealands Estate', 'Single Block S1 Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.yealands.co.nz/discover-wines/
  ('Yealands Estate', 'Reserve Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White')  -- https://www.yealands.co.nz/discover-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WITHER HILLS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Wither Hills', 'Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://witherhills.co.nz/collections/our-wines-1/products/wairau-valley-sauvignon-blanc
  ('Wither Hills', 'Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://witherhills.co.nz/collections/our-wines-1/products/wairau-valley-chardonnay
  ('Wither Hills', 'Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://witherhills.co.nz/collections/our-wines-1/products/wairau-valley-pinot-gris
  ('Wither Hills', 'Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://witherhills.co.nz/collections/our-wines-1/products/wairau-valley-pinot-noir
  ('Wither Hills', 'Pinot Noir Rosé', 'Marlborough, New Zealand', 'Pinot Noir', 'Rosé'),  -- https://witherhills.co.nz/collections/our-wines-1/products/wairau-valley-pinot-noir-rose
  ('Wither Hills', 'Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://witherhills.co.nz/collections/our-wines-1/products/wairau-valley-riesling
  ('Wither Hills', 'Hawke''s Bay Merlot', 'Hawke''s Bay, New Zealand', 'Merlot', 'Red'),  -- https://witherhills.co.nz/collections/our-wines-1/products/merlot
  ('Wither Hills', 'Hawke''s Bay Syrah', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://witherhills.co.nz/collections/our-wines-1/products/syrah
  ('Wither Hills', 'Early Light Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://witherhills.co.nz/collections/our-wines-1/products/early-light-sauvignon-blanc
  ('Wither Hills', 'Early Light Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://witherhills.co.nz/collections/our-wines-1/products/early-light-pinot-gris
  ('Wither Hills', 'Early Light Pinot Noir Rosé', 'Marlborough, New Zealand', 'Pinot Noir', 'Rosé'),  -- https://witherhills.co.nz/collections/our-wines-1/products/early-light-rose
  ('Wither Hills', 'Cellar Collection Barrel Fermented Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/barrel-fermented-chardonnay-2018-single-bottle-1
  ('Wither Hills', 'Cellar Collection Amphora Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/cellar-collection-amphora-chardonnay-2024
  ('Wither Hills', 'Cellar Collection Block 13 Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/cellar-collection-block-13-pinot-noir-2024
  ('Wither Hills', 'Cellar Collection Frivoli Gewürztraminer', 'Marlborough, New Zealand', 'Gewürztraminer', 'White'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/cellar-collection-frivoli
  ('Wither Hills', 'Cellar Collection Late Harvest Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'Sweet'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/cellar-collection-late-harvest-sauvignon-blanc
  ('Wither Hills', 'Cellar Collection Noble Riesling', 'Marlborough, New Zealand', 'Riesling', 'Sweet'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/cellarcollection-noble-riesling-2022
  ('Wither Hills', 'Cellar Collection Gewürztraminer', 'Marlborough, New Zealand', 'Gewürztraminer', 'White'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/gewurztraminer-2020
  ('Wither Hills', 'Cellar Collection Gruner Veltliner', 'Marlborough, New Zealand', 'Grüner Veltliner', 'White'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/gruner-veltliner-2018-2019
  ('Wither Hills', 'Cellar Collection Stone Creek Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/old-renwick-road-pinot-gris-2019
  ('Wither Hills', 'Cellar Collection Rarangi Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/rarangi-riesling-2011
  ('Wither Hills', '30th Anniversary Méthode Traditionnelle', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/30th-anniversary-methode-traditionnelle-vintage-2018
  ('Wither Hills', 'Legado Tawny Port', 'New Zealand', null, 'Fortified'),  -- https://witherhills.co.nz/collections/cellar-collection-1/products/30th-anniversary-port
  ('Wither Hills', 'The Honourable Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://witherhills.co.nz/collections/single-vineyard/products/the-honourable
  ('Wither Hills', 'Single Vineyard Benmorven Organic Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://witherhills.co.nz/collections/single-vineyard/products/single-vineyard-ben-morven-chardonnay-single-bottle
  ('Wither Hills', 'Single Vineyard Rarangi Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://witherhills.co.nz/collections/single-vineyard/products/single-vineyard-rarangi-sauvignon-blanc
  ('Wither Hills', 'Single Vineyard Taylor River Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red')  -- https://witherhills.co.nz/collections/single-vineyard/products/single-vineyard-taylor-river-pinot-noir
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CRAGGY RANGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Craggy Range', 'Le Sol', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://craggyrange.com/products/2024-le-sol-gimblett-gravels
  ('Craggy Range', 'The Quarry', 'Hawke''s Bay, New Zealand', null, 'Red'),  -- https://craggyrange.com/products/2020-the-quarry-museum-prestige-collection
  ('Craggy Range', 'Sophia', 'Hawke''s Bay, New Zealand', null, 'Red'),  -- https://craggyrange.com/products/2024-sophia-gimblett-gravels
  ('Craggy Range', 'Aroha', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://craggyrange.com/products/2024-aroha-te-muna
  ('Craggy Range', 'Pinot Noir Block One Te Muna Estate Vineyard', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://craggyrange.com/products/2024-block-1-pinot-noir
  ('Craggy Range', 'Pinot Noir Block 27 Te Muna Estate Vineyard', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://craggyrange.com/products/2024-block-27-pinot-noir
  ('Craggy Range', 'Les Beaux Cailloux', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://craggyrange.com/products/2024-les-beaux-cailloux-gimblett-gravels
  ('Craggy Range', 'Riesling Te Muna Road Vineyard', 'Martinborough, New Zealand', 'Riesling', 'White'),  -- https://craggyrange.com/products/2024-riesling-te-muna-martinborough
  ('Craggy Range', 'Syrah Block 8 Gimblett Gravels Vineyard', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://craggyrange.com/products/2024-syrah-block-8-gimblett-gravels-vineyard
  ('Craggy Range', 'Syrah Gimblett Gravels Vineyard', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://craggyrange.com/products/2024-syrah-gimblett-gravels
  ('Craggy Range', 'Te Kahu Gimblett Gravels Vineyard', 'Hawke''s Bay, New Zealand', null, 'Red'),  -- https://craggyrange.com/products/2024-te-kahu-gimblett-gravels
  ('Craggy Range', 'Chardonnay Gimblett Gravels Vineyard', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://craggyrange.com/products/2025-chardonnay-gimblett-gravels-vineyard
  ('Craggy Range', 'Chardonnay Kidnappers Hawke''s Bay', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://craggyrange.com/products/2025-chardonnay-kidnappers-hawkes-bay
  ('Craggy Range', 'Pinot Noir Te Muna Road Vineyard', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://craggyrange.com/products/2025-pinot-noir-te-muna-road-vineyard
  ('Craggy Range', 'Sauvignon Blanc Te Muna', 'Martinborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://craggyrange.com/products/2025-sauvignon-blanc-te-muna
  ('Craggy Range', 'Pinot Gris Te Muna Road Vineyard', 'Martinborough, New Zealand', 'Pinot Gris', 'White'),  -- https://craggyrange.com/products/2026-pinot-gris-te-muna-road-vineyard
  ('Craggy Range', 'Rosé Hawke''s Bay', 'Hawke''s Bay, New Zealand', null, 'Rosé')  -- https://craggyrange.com/products/2026-rose-hawkes-bay
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SPY VALLEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Spy Valley', 'Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://spyvalleywine.co.nz/collections/spy-valley
  ('Spy Valley', 'Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://spyvalleywine.co.nz/collections/spy-valley
  ('Spy Valley', 'Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://spyvalleywine.co.nz/collections/spy-valley
  ('Spy Valley', 'Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://spyvalleywine.co.nz/collections/spy-valley
  ('Spy Valley', 'Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://spyvalleywine.co.nz/collections/spy-valley
  ('Spy Valley', 'Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://spyvalleywine.co.nz/products/spy-valley-rose-2024
  ('Spy Valley', 'Gewürztraminer', 'Marlborough, New Zealand', 'Gewürztraminer', 'White'),  -- https://spyvalleywine.co.nz/products/2024-spy-valley-gewurztraminer
  ('Spy Valley', 'Late Harvest Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'Sweet'),  -- https://spyvalleywine.co.nz/products/2017-late-harvest-spy-valley-sauvignon-blanc
  ('Spy Valley', 'Easy Tiger Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://spyvalleywine.co.nz/products/2022-easy-tiger-sauvignon-blanc
  ('Spy Valley', 'Envoy Johnson Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://spyvalleywine.co.nz/products/2016-envoy-johnson-vineyard-sauvignon-blanc
  ('Spy Valley', 'Envoy Johnson Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://spyvalleywine.co.nz/products/2017-envoy-johnson-pinot-noir
  ('Spy Valley', 'Envoy Johnson Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://spyvalleywine.co.nz/products/2017-envoy-johnson-vineyard-chardonnay
  ('Spy Valley', 'Envoy Johnson Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://spyvalleywine.co.nz/products/envoy-johnson-riesling-2026
  ('Spy Valley', 'Envoy Outpost Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://spyvalleywine.co.nz/products/2017-envoy-outpost-vineyard-pinot-noir
  ('Spy Valley', 'B Block Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://spyvalleywine.co.nz/products/b-block-chardonnay-2025
  ('Spy Valley', 'C Block Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://spyvalleywine.co.nz/products/c-block-pinot-gris-2025
  ('Spy Valley', 'E Block Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://spyvalleywine.co.nz/products/e-block-sauvignon-blanc-2023
  ('Spy Valley', 'S Block Syrah', 'Marlborough, New Zealand', 'Syrah', 'Red'),  -- https://spyvalleywine.co.nz/products/s-block-syrah-2016
  ('Spy Valley', 'Y Block Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://spyvalleywine.co.nz/products/y-block-sauvignon-blanc-2024
  ('Spy Valley', 'F Block Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://spyvalleywine.co.nz/collections/envoy
  ('Spy Valley', 'N Block Pinot Nouveau', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://spyvalleywine.co.nz/collections/envoy
  ('Spy Valley', 'P Block White Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'White'),  -- https://spyvalleywine.co.nz/collections/envoy
  ('Spy Valley', 'Echelon Méthode Traditionnelle', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://spyvalleywine.co.nz/collections/envoy
  ('Spy Valley', 'Echelon Rosé Méthode Traditionnelle', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://spyvalleywine.co.nz/products/echelon-rose-methode-traditionnelle-2023
  ('Spy Valley', 'Satellite Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://spyvalleywine.co.nz/products/satellite-sauvignon-blanc-2025
  ('Spy Valley', 'Satellite Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red')  -- https://spyvalleywine.co.nz/products/satellite-pinot-noir-2025
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TE MATA ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Te Mata Estate', 'Coleraine', 'Hawke''s Bay, New Zealand', null, 'Red'),  -- https://www.temata.co.nz/collection/wines/
  ('Te Mata Estate', 'Bullnose', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://www.temata.co.nz/collection/wines/
  ('Te Mata Estate', 'Awatea', 'Hawke''s Bay, New Zealand', null, 'Red'),  -- https://www.temata.co.nz/collection/wines/
  ('Te Mata Estate', 'Elston', 'Hawke''s Bay, New Zealand', null, 'White'),  -- https://www.temata.co.nz/collection/wines/
  ('Te Mata Estate', 'Cape Crest', 'Hawke''s Bay, New Zealand', null, 'White')  -- https://www.temata.co.nz/collection/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BABICH WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Babich Wines', 'Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Hawke''s Bay Chardonnay', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Marlborough Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Marlborough Pinot Noir Rosé', 'Marlborough, New Zealand', 'Pinot Noir', 'Rosé'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'New Zealand Rosé', 'New Zealand', null, 'Rosé'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Hawke''s Bay Syrah', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Hawke''s Bay Merlot Cabernet', 'Hawke''s Bay, New Zealand', 'Merlot/Cabernet Sauvignon', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Hawke''s Bay Cabernet Merlot', 'Hawke''s Bay, New Zealand', 'Cabernet Sauvignon/Merlot', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Estates Organic Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Estates Organic Marlborough Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Estates Organic Marlborough Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Estates Organic Marlborough Albariño', 'Marlborough, New Zealand', 'Albariño', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Estates Organic Marlborough Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Estates Organic Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Black Label Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Black Label Marlborough Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Black Label Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Reserve Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Reserve Hawke''s Bay Chardonnay', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Reserve Marlborough Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Reserve Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Reserve Hawke''s Bay Syrah', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Family Reserve Hawke''s Bay Merlot Cabernet', 'Hawke''s Bay, New Zealand', 'Merlot/Cabernet Sauvignon', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Winemakers'' Reserve Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Winemakers'' Reserve Hawke''s Bay Syrah', 'Hawke''s Bay, New Zealand', 'Syrah', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Winemakers'' Reserve Hawke''s Bay Merlot', 'Hawke''s Bay, New Zealand', 'Merlot', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Winemakers'' Reserve Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Winemakers'' Reserve Noble Marlborough Riesling', 'Marlborough, New Zealand', 'Riesling', 'Sweet'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Irongate Gimblett Gravels Chardonnay', 'Hawke''s Bay, New Zealand', 'Chardonnay', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Irongate Gimblett Gravels Cabernet Merlot Franc', 'Hawke''s Bay, New Zealand', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'The Patriarch Gimblett Gravels Red Blend', 'Hawke''s Bay, New Zealand', null, 'Red'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'Select Blocks Organic Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.babichwines.com/wines/our-range/
  ('Babich Wines', 'East Coast Vintara Red', 'New Zealand', null, 'Red')  -- https://www.babichwines.com/wines/our-range/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALLAN SCOTT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Allan Scott', 'Cecilia Brut Marlborough Cuvée', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://allanscott.com/products/allan-scott-cecilia-brut-marlborough-cuvee-nv
  ('Allan Scott', 'Cecilia Rosé Marlborough Cuvée', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://allanscott.com/products/allan-scott-cecilia-rose-marlborough-cuvee-nv
  ('Allan Scott', 'Cecilia Vintage Méthode Traditionnelle', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://allanscott.com/products/allan-scott-cecilia-vintage-methode-traditionnelle
  ('Allan Scott', 'Hawkes Bay Merlot', 'Hawke''s Bay, New Zealand', 'Merlot', 'Red'),  -- https://allanscott.com/products/allan-scott-hawkes-bay-merlot-2025
  ('Allan Scott', 'Marlborough Black Label Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://allanscott.com/products/allan-scott-marlborough-black-label-chardonnay-2025
  ('Allan Scott', 'Marlborough Black Label Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://allanscott.com/products/allan-scott-marlborough-black-label-pinot-noir-2025
  ('Allan Scott', 'Marlborough Black Label Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://allanscott.com/products/allan-scott-marlborough-black-label-sauvignon-blanc-2023
  ('Allan Scott', 'Marlborough Black Label Riesling Auslese', 'Marlborough, New Zealand', 'Riesling', 'Sweet'),  -- https://allanscott.com/products/marlborough-black-label-riesling-auslese-2024
  ('Allan Scott', 'Marlborough Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://allanscott.com/products/allan-scott-marlborough-pinot-gris-2026
  ('Allan Scott', 'Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://allanscott.com/products/allan-scott-marlborough-pinot-noir-2025
  ('Allan Scott', 'Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://allanscott.com/products/allan-scott-marlborough-sauvignon-blanc-2026
  ('Allan Scott', 'Marlborough Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://allanscott.com/
  ('Allan Scott', 'The Eli Collection Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://allanscott.com/
  ('Allan Scott', 'The Eli Collection Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://allanscott.com/products/allan-scott-the-eli-collection-pinot-noir-2022
  ('Allan Scott', 'The Eli Collection Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://allanscott.com/products/allan-scott-the-eli-collection-sauvignon-blanc-2023
  ('Allan Scott', 'By Josh Scott Marlborough Pétillant Naturel', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://allanscott.com/products/by-josh-scott-marlborough-petillant-naturel
  ('Allan Scott', 'By Josh Scott Marlborough Sauvignon Blanc XXXL', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://allanscott.com/products/by-josh-scott-marlborough-sauvignon-blanc-xxxl
  ('Allan Scott', 'By Josh Scott Deal With It Natural Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://allanscott.com/products/by-josh-scott-natural-pinot-noir-2025
  ('Allan Scott', 'By Josh Scott Bla Bla Bla Natural Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://allanscott.com/products/by-josh-scott-natural-rose-2026
  ('Allan Scott', 'By Josh Scott Yeah Cool Natural Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://allanscott.com/products/by-josh-scott-natural-sauvignon-blanc-2025
  ('Allan Scott', 'Scott Base Central Otago Pinot Noir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://allanscott.com/products/scott-base-central-otago-pinot-noir-2023
  ('Allan Scott', 'Scott Base Emperor Rosé Méthode Traditionnelle', 'New Zealand', null, 'Sparkling')  -- https://allanscott.com/products/scott-base-emperor-rose-methode-tradiotionnelle
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JULES TAYLOR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Jules Taylor', 'Marlborough Blanc de Blancs', 'Marlborough, New Zealand', 'Chardonnay', 'Sparkling'),  -- https://www.julestaylor.com/products/marlborough-blanc-de-blancs
  ('Jules Taylor', 'Marlborough Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://www.julestaylor.com/products/marlborough-chardonnay
  ('Jules Taylor', 'Marlborough Gruner Veltliner', 'Marlborough, New Zealand', 'Grüner Veltliner', 'White'),  -- https://www.julestaylor.com/products/marlborough-gruner-veltliner
  ('Jules Taylor', 'Marlborough Late Harvest Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'Sweet'),  -- https://www.julestaylor.com/products/marlborough-late-harvest
  ('Jules Taylor', 'Marlborough Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://www.julestaylor.com/products/marlborough-pinot-gris
  ('Jules Taylor', 'Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.julestaylor.com/products/marlborough-pinot-noir
  ('Jules Taylor', 'Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.julestaylor.com/products/marlborough-sauvignon-blanc
  ('Jules Taylor', 'On The Quiet Single Vineyard Marlborough Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.julestaylor.com/products/on-the-quiet-pinot-noir
  ('Jules Taylor', 'On The Quiet Single Vineyard Barrel Aged Marlborough Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.julestaylor.com/products/on-the-quiet-sauvignon-blanc
  ('Jules Taylor', 'On The Quiet Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://www.julestaylor.com
  ('Jules Taylor', 'JULES Rosé', 'New Zealand', null, 'Rosé')  -- https://www.julestaylor.com/products/the-jules-rose
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NAUTILUS ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Nautilus Estate', 'Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.nautilusestate.com/our-wines
  ('Nautilus Estate', 'Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://www.nautilusestate.com/our-wines
  ('Nautilus Estate', 'Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://www.nautilusestate.com/our-wines
  ('Nautilus Estate', 'Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.nautilusestate.com/our-wines
  ('Nautilus Estate', 'Albariño', 'Marlborough, New Zealand', 'Albariño', 'White'),  -- https://www.nautilusestate.com/our-wines
  ('Nautilus Estate', 'Marlborough Cuvée Brut', 'Marlborough, New Zealand', null, 'Sparkling'),  -- https://www.nautilusestate.com/our-wines
  ('Nautilus Estate', 'Vintage Rosé', 'Marlborough, New Zealand', 'Pinot Noir', 'Sparkling'),  -- https://www.nautilusestate.com/wines/vintage-ros%C3%A9
  ('Nautilus Estate', 'Clay Hills Vineyard Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.nautilusestate.com/our-wines
  ('Nautilus Estate', 'Clay Hills Vineyard Pinot Noir Block 3 WB', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.nautilusestate.com/our-wines
  ('Nautilus Estate', 'Southern Valleys Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.nautilusestate.com/our-wines
  ('Nautilus Estate', 'The Paper Nautilus Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White')  -- https://www.nautilusestate.com/our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GREYWACKE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Greywacke', 'Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://greywacke.com/thewines
  ('Greywacke', 'Wild Sauvignon', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://greywacke.com/thewines
  ('Greywacke', 'Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://greywacke.com/thewines
  ('Greywacke', 'Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://greywacke.com/thewines
  ('Greywacke', 'Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://greywacke.com/thewines
  ('Greywacke', 'Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red')  -- https://greywacke.com/thewines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MUD HOUSE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Mud House', 'Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://mudhouse.co.nz/products/sauvignon-blanc
  ('Mud House', 'Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://mudhouse.co.nz/products/chardonnay
  ('Mud House', 'Rosé', 'Marlborough, New Zealand', null, 'Rosé'),  -- https://mudhouse.co.nz/products/rose
  ('Mud House', 'Riesling', 'Waipara, New Zealand', 'Riesling', 'White'),  -- https://mudhouse.co.nz/products/riesling
  ('Mud House', 'Pinot Noir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://mudhouse.co.nz/products/pinot-noir
  ('Mud House', 'Merlot', 'Hawke''s Bay, New Zealand', 'Merlot', 'Red'),  -- https://mudhouse.co.nz/products/merlot
  ('Mud House', 'Woolshed Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://mudhouse.co.nz/products/woolshed-sauvignon-blanc
  ('Mud House', 'Claim 431 Pinot Noir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red')  -- https://mudhouse.co.nz/products/claim-431-pinot-noir
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BLIND RIVER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Blind River', 'Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://lawsonsdryhills.co.nz/product/blind-river-pinot-noir-2022-new/
  ('Blind River', 'Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://lawsonsdryhills.co.nz/product/blind-river-sauvignon-blanc-2024/
  ('Blind River', 'Tekau Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White')  -- https://lawsonsdryhills.co.nz/product/blind-river-tekau-sauvignon-blanc-2024/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAWSON'S DRY HILLS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Lawson''s Dry Hills', 'Late Harvest Riesling', 'Marlborough, New Zealand', 'Riesling', 'Sweet'),  -- https://lawsonsdryhills.co.nz/product/lawsons-dry-hills-late-harvest-riesling-2024/
  ('Lawson''s Dry Hills', 'Estate Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://lawsonsdryhills.co.nz/product/ldh-estate-chardonnay-2026/
  ('Lawson''s Dry Hills', 'Estate Gewürztraminer', 'Marlborough, New Zealand', 'Gewürztraminer', 'White'),  -- https://lawsonsdryhills.co.nz/product/ldh-estate-gewurztraminer-2025/
  ('Lawson''s Dry Hills', 'Estate Lighter in Alcohol Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://lawsonsdryhills.co.nz/product/ldh-estate-lighter-in-alcohol-sauvignon-blanc-2025/
  ('Lawson''s Dry Hills', 'Estate Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://lawsonsdryhills.co.nz/product/ldh-estate-pinot-gris-2025/
  ('Lawson''s Dry Hills', 'Estate Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://lawsonsdryhills.co.nz/product/ldh-estate-pinot-noir-2023/
  ('Lawson''s Dry Hills', 'Estate Riesling', 'Marlborough, New Zealand', 'Riesling', 'White'),  -- https://lawsonsdryhills.co.nz/product/ldh-estate-riesling-2022-copy/
  ('Lawson''s Dry Hills', 'Estate Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://lawsonsdryhills.co.nz/product/ldh-estate-sauvignon-blanc-2026/
  ('Lawson''s Dry Hills', 'PINK Pinot Rosé', 'Marlborough, New Zealand', 'Pinot Noir', 'Rosé'),  -- https://lawsonsdryhills.co.nz/product/ldh-pink-pinot-rose-2025/
  ('Lawson''s Dry Hills', 'Reserve Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://lawsonsdryhills.co.nz/product/ldh-reserve-chardonnay-2024/
  ('Lawson''s Dry Hills', 'Reserve Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://lawsonsdryhills.co.nz/product/ldh-reserve-pinot-gris-2025/
  ('Lawson''s Dry Hills', 'Reserve Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://lawsonsdryhills.co.nz/product/ldh-reserve-pinot-noir-2023/
  ('Lawson''s Dry Hills', 'Reserve Sauvignon Blanc', 'Marlborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://lawsonsdryhills.co.nz/product/ldh-reserve-sauvignon-blanc-2026/
  ('Lawson''s Dry Hills', 'The Max Chardonnay', 'Marlborough, New Zealand', 'Chardonnay', 'White'),  -- https://lawsonsdryhills.co.nz/product/the-max-chardonnay-2019/
  ('Lawson''s Dry Hills', 'The Max Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://lawsonsdryhills.co.nz/product/the-max-pinot-noir-2019/
  ('Lawson''s Dry Hills', 'The Pioneer Gewürztraminer', 'Marlborough, New Zealand', 'Gewürztraminer', 'White'),  -- https://lawsonsdryhills.co.nz/product/the-pioneer-gewurztraminer-2024/
  ('Lawson''s Dry Hills', 'The Pioneer Pinot Gris', 'Marlborough, New Zealand', 'Pinot Gris', 'White'),  -- https://lawsonsdryhills.co.nz/product/the-pioneer-pinot-gris-2024/
  ('Lawson''s Dry Hills', 'The Pioneer Pinot Noir', 'Marlborough, New Zealand', 'Pinot Noir', 'Red')  -- https://lawsonsdryhills.co.nz/product/the-pioneer-pinot-noir-2023/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FELTON ROAD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Felton Road', 'Pinot Noir Bannockburn', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://feltonroad.com/our-wines/variety/pinot-noir/
  ('Felton Road', 'Pinot Noir Cornish Point', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://feltonroad.com/our-wines/variety/pinot-noir/
  ('Felton Road', 'Pinot Noir MacMuir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://feltonroad.com/our-wines/variety/pinot-noir/
  ('Felton Road', 'Pinot Noir Block 3', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://feltonroad.com/our-wines/variety/pinot-noir/
  ('Felton Road', 'Pinot Noir Block 5', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://feltonroad.com/our-wines/variety/pinot-noir/
  ('Felton Road', 'Pinot Noir Calvert', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://feltonroad.com/our-wines/variety/pinot-noir/
  ('Felton Road', 'Chardonnay Bannockburn', 'Central Otago, New Zealand', 'Chardonnay', 'White'),  -- https://feltonroad.com/our-wines/variety/chardonnay/
  ('Felton Road', 'Chardonnay Block 2', 'Central Otago, New Zealand', 'Chardonnay', 'White'),  -- https://feltonroad.com/our-wines/variety/chardonnay/
  ('Felton Road', 'Chardonnay Block 6', 'Central Otago, New Zealand', 'Chardonnay', 'White'),  -- https://feltonroad.com/our-wines/variety/chardonnay/
  ('Felton Road', 'Riesling Bannockburn', 'Central Otago, New Zealand', 'Riesling', 'White'),  -- https://feltonroad.com/our-wines/variety/riesling/
  ('Felton Road', 'Riesling Block 1', 'Central Otago, New Zealand', 'Riesling', 'White'),  -- https://feltonroad.com/our-wines/variety/riesling/
  ('Felton Road', 'Dry Riesling', 'Central Otago, New Zealand', 'Riesling', 'White'),  -- https://feltonroad.com/our-wines/variety/riesling/
  ('Felton Road', 'Vin Gris', 'Central Otago, New Zealand', 'Pinot Noir', 'Rosé')  -- https://feltonroad.com/our-wines/variety/other/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ESCARPMENT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Escarpment', 'Chardonnay', 'Martinborough, New Zealand', 'Chardonnay', 'White'),  -- https://escarpment.co.nz/products/escarpment-chardonnay
  ('Escarpment', 'Pinot Noir', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://escarpment.co.nz/products/escarpment-pinot-noir
  ('Escarpment', 'Sauvignon Blanc', 'Martinborough, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://escarpment.co.nz/products/escarpment-sauvignon-blanc
  ('Escarpment', 'Kiwa Pinot Noir', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://escarpment.co.nz/products/kiwa-pinot-noir
  ('Escarpment', 'Kupe Pinot Noir', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://escarpment.co.nz/products/kupe
  ('Escarpment', 'NOIR Pinot Noir', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://escarpment.co.nz/products/noir
  ('Escarpment', 'Pahi Pinot Noir', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://escarpment.co.nz/products/pahi-pinot-noir
  ('Escarpment', 'Te Rehua Pinot Noir', 'Martinborough, New Zealand', 'Pinot Noir', 'Red'),  -- https://escarpment.co.nz/products/te-rehua-pinot-noir
  ('Escarpment', 'Pinot Blanc', 'Martinborough, New Zealand', 'Pinot Blanc', 'White'),  -- https://escarpment.co.nz/products/pinot-blanc
  ('Escarpment', 'GRIS Pinot Gris', 'Martinborough, New Zealand', 'Pinot Gris', 'White'),  -- https://escarpment.co.nz/products/pinot-gris
  ('Escarpment', 'Pinot Rosé', 'Martinborough, New Zealand', 'Pinot Noir', 'Rosé'),  -- https://escarpment.co.nz/products/pinot-rose
  ('Escarpment', 'The Edge Pinot Noir', 'Martinborough, New Zealand', 'Pinot Noir', 'Red')  -- https://escarpment.co.nz/products/edge-pinot-noir
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RIPPON VINEYARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Rippon Vineyard', 'Emma''s Block Mature Vine Pinot Noir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://rippon.co.nz/products/rippon-emma-s-block-mature-vine-pinot-noir
  ('Rippon Vineyard', 'Tinker''s Field Mature Vine Pinot Noir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://rippon.co.nz/products/rippon-tinker-s-field-mature-vine-pinot-noir
  ('Rippon Vineyard', 'Mature Vine Pinot Noir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://rippon.co.nz/products/rippon-mature-vine-pinot-noir
  ('Rippon Vineyard', 'Young Vine Pinot Noir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://rippon.co.nz/products/rippon-young-vine-pinot-noir
  ('Rippon Vineyard', 'Mature Vine Riesling', 'Central Otago, New Zealand', 'Riesling', 'White'),  -- https://rippon.co.nz/products/rippon-mature-vine-riesling
  ('Rippon Vineyard', 'Gewurztraminer', 'Central Otago, New Zealand', 'Gewürztraminer', 'White'),  -- https://rippon.co.nz/products/rippon-gewurztraminer
  ('Rippon Vineyard', 'Osteiner', 'Central Otago, New Zealand', 'Osteiner', 'White'),  -- https://rippon.co.nz/products/rippon-osteiner
  ('Rippon Vineyard', 'Sauvignon Blanc', 'Central Otago, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://rippon.co.nz/products/rippon-sauvignon-blanc
  ('Rippon Vineyard', 'Wanaka Village Pinot Noir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red'),  -- https://rippon.co.nz/products/wanaka-village-pinot-noir
  ('Rippon Vineyard', 'Threads Pinot Noir', 'Central Otago, New Zealand', 'Pinot Noir', 'Red')  -- https://rippon.co.nz/products/threads-pinot-noir
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PEGASUS BAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_new_zealand.sql)'
from (values
  ('Pegasus Bay', 'Cabernet Franc', 'Waipara, New Zealand', 'Cabernet Franc', 'Red'),  -- https://www.pegasusbay.com/products/cabernet-franc-2022
  ('Pegasus Bay', 'Chardonnay', 'Waipara, New Zealand', 'Chardonnay', 'White'),  -- https://www.pegasusbay.com/products/chardonnay-2023
  ('Pegasus Bay', 'Gewürztraminer', 'Waipara, New Zealand', 'Gewürztraminer', 'White'),  -- https://www.pegasusbay.com/products/gewurztraminer-2025
  ('Pegasus Bay', 'Malbec', 'Waipara, New Zealand', 'Malbec', 'Red'),  -- https://www.pegasusbay.com/products/malbec-2023
  ('Pegasus Bay', 'Merlot Cabernet', 'Waipara, New Zealand', 'Merlot/Cabernet Sauvignon', 'Red'),  -- https://www.pegasusbay.com/products/merlot-cabernet-2023
  ('Pegasus Bay', 'Muscat', 'Waipara, New Zealand', 'Muscat', 'White'),  -- https://www.pegasusbay.com/products/muscat-2020
  ('Pegasus Bay', 'Pinot Noir', 'Waipara, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.pegasusbay.com/products/pinot-noir-2024
  ('Pegasus Bay', 'Riesling', 'Waipara, New Zealand', 'Riesling', 'White'),  -- https://www.pegasusbay.com/products/riesling-2026
  ('Pegasus Bay', 'Sauvignon Blanc', 'Waipara, New Zealand', 'Sauvignon Blanc', 'White'),  -- https://www.pegasusbay.com/products/sauvignon-blanc-2025
  ('Pegasus Bay', 'ARIA Late Picked Riesling', 'Waipara, New Zealand', 'Riesling', 'Sweet'),  -- https://www.pegasusbay.com/products/aria-late-picked-riesling-2025
  ('Pegasus Bay', 'BEL CANTO Dry Riesling', 'Waipara, New Zealand', 'Riesling', 'White'),  -- https://www.pegasusbay.com/products/bel-canto-dry-riesling-2024
  ('Pegasus Bay', 'FORTISSIMO Fortified Muscat', 'Waipara, New Zealand', 'Muscat', 'Fortified'),  -- https://www.pegasusbay.com/products/fortissimo-fortified-muscat-2023
  ('Pegasus Bay', 'MAESTRO Merlot Malbec', 'Waipara, New Zealand', 'Merlot/Malbec', 'Red'),  -- https://www.pegasusbay.com/products/maestro-merlot-malbec-2020
  ('Pegasus Bay', 'MINUETTO Semillon Sauvignon', 'Waipara, New Zealand', 'Semillon/Sauvignon Blanc', 'White'),  -- https://www.pegasusbay.com/products/minuetto-sauvignon-semillon-2023
  ('Pegasus Bay', 'PRIMA DONNA Pinot Noir', 'Waipara, New Zealand', 'Pinot Noir', 'Red'),  -- https://www.pegasusbay.com/products/prima-donna-pinot-noir-2016-aged-release
  ('Pegasus Bay', 'VIRTUOSO Chardonnay', 'Waipara, New Zealand', 'Chardonnay', 'White')  -- https://www.pegasusbay.com/products/virtuoso-chardonnay-2021
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
