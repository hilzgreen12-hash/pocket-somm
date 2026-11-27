-- Producer ranges round 3: South Africa. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- KANONKOP ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Kanonkop', 'Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red'),  -- https://kanonkop.co.za/wines/estate-range/
  ('Kanonkop', 'Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://kanonkop.co.za/wines/estate-range/
  ('Kanonkop', 'Paul Sauer', 'Stellenbosch, South Africa', null, 'Red'),  -- https://kanonkop.co.za/wines/estate-range/
  ('Kanonkop', 'Black Label Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red'),  -- https://kanonkop.co.za/wines/estate-range/
  ('Kanonkop', 'Kadette Pinotage Rosé', 'Stellenbosch, South Africa', 'Pinotage', 'Rosé'),  -- https://kanonkop.co.za/wines/kadette-range/
  ('Kanonkop', 'Kadette Cape Blend', 'Stellenbosch, South Africa', null, 'Red'),  -- https://kanonkop.co.za/wines/kadette-range/
  ('Kanonkop', 'Kadette Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red'),  -- https://kanonkop.co.za/wines/kadette-range/
  ('Kanonkop', 'Kadette Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red')  -- https://kanonkop.co.za/wines/kadette-range/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GRAHAM BECK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Graham Beck', 'Cuvée Clive', 'Western Cape, South Africa', null, 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Cuvée Clive X', 'Western Cape, South Africa', null, 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Extended Lees Ageing', 'Western Cape, South Africa', null, 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Pinot Meunier', 'Western Cape, South Africa', 'Pinot Meunier', 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Chardonnay 14:277', 'Western Cape, South Africa', 'Chardonnay', 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Ultra Brut', 'Western Cape, South Africa', null, 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Blanc de Blancs', 'Western Cape, South Africa', 'Chardonnay', 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Pinot Noir Rosé', 'Western Cape, South Africa', 'Pinot Noir', 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Brut Rosé', 'Western Cape, South Africa', null, 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Brut', 'Western Cape, South Africa', null, 'Sparkling'),  -- https://www.grahambeck.com/wines
  ('Graham Beck', 'Bliss Nectar', 'Western Cape, South Africa', null, 'Sparkling')  -- https://www.grahambeck.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MEERLUST ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Meerlust', 'Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.meerlust.co.za/our-wines/
  ('Meerlust', 'Pinot Noir', 'Stellenbosch, South Africa', 'Pinot Noir', 'Red'),  -- https://www.meerlust.co.za/our-wines/
  ('Meerlust', 'Estate Red', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.meerlust.co.za/our-wines/
  ('Meerlust', 'Merlot', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://www.meerlust.co.za/our-wines/
  ('Meerlust', 'Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.meerlust.co.za/our-wines/
  ('Meerlust', 'Rubicon', 'Stellenbosch, South Africa', null, 'Red')  -- https://www.meerlust.co.za/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KWV ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('KWV', 'Classic Chardonnay', 'Western Cape, South Africa', 'Chardonnay', 'White'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Grenache Blanc', 'Western Cape, South Africa', 'Grenache Blanc', 'White'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Moscato', 'Western Cape, South Africa', 'Muscat', 'White'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Sauvignon Blanc', 'Western Cape, South Africa', 'Sauvignon Blanc', 'White'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Moscato Rosé', 'Western Cape, South Africa', 'Muscat', 'Rosé'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Rosé', 'Western Cape, South Africa', null, 'Rosé'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Cabernet Sauvignon', 'Western Cape, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Cape Blend', 'Western Cape, South Africa', null, 'Red'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Merlot', 'Western Cape, South Africa', 'Merlot', 'Red'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Petit Verdot', 'Western Cape, South Africa', 'Petit Verdot', 'Red'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Pinotage', 'Western Cape, South Africa', 'Pinotage', 'Red'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Shiraz', 'Western Cape, South Africa', 'Shiraz', 'Red'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Sparkling Cuvée Brut', 'Western Cape, South Africa', 'Chenin Blanc', 'Sparkling'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Sparkling Brut Rosé', 'Western Cape, South Africa', null, 'Sparkling'),  -- https://kwv.co.za/product-category/wine/wine-sparkling-wine/
  ('KWV', 'Sparkling Demi-Sec', 'Western Cape, South Africa', null, 'Sparkling'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Sparkling Moscato Rosé', 'Western Cape, South Africa', 'Muscat', 'Sparkling'),  -- https://kwv.co.za/kwv-classic-collection-wines/
  ('KWV', 'Classic Cape Ruby', 'Western Cape, South Africa', null, 'Fortified'),  -- https://kwv.co.za/fortified-wine-products/
  ('KWV', 'Classic Red Muscadel', 'Western Cape, South Africa', 'Muscat', 'Fortified'),  -- https://kwv.co.za/fortified-wine-products/
  ('KWV', 'Classic Cape Tawny', 'Western Cape, South Africa', null, 'Fortified'),  -- https://kwv.co.za/fortified-wine-products/
  ('KWV', 'Roodeberg', 'Western Cape, South Africa', null, 'Red'),  -- https://kwv.co.za/iconic-roodeberg-wines/
  ('KWV', 'Roodeberg Reserve', 'Western Cape, South Africa', null, 'Red'),  -- https://kwv.co.za/iconic-roodeberg-wines/
  ('KWV', 'Roodeberg Black', 'Western Cape, South Africa', null, 'Red'),  -- https://kwv.co.za/iconic-roodeberg-wines/
  ('KWV', 'Dr Charles Niehaus Roodeberg', 'Western Cape, South Africa', null, 'Red'),  -- https://kwv.co.za/iconic-roodeberg-wines/
  ('KWV', 'The Mentors Grenache Blanc', 'Western Cape, South Africa', 'Grenache Blanc', 'White'),  -- https://kwv.co.za/product-category/brands/brands-the-mentors/
  ('KWV', 'The Mentors Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://kwv.co.za/product-category/brands/brands-the-mentors/
  ('KWV', 'The Mentors Perold', 'Western Cape, South Africa', null, 'Red'),  -- https://kwv.co.za/product-category/brands/brands-the-mentors/
  ('KWV', 'The Mentors Cabernet Franc', 'Western Cape, South Africa', 'Cabernet Franc', 'Red'),  -- https://kwv.co.za/product-category/brands/brands-the-mentors/
  ('KWV', 'The Mentors Canvas', 'Western Cape, South Africa', null, 'Red'),  -- https://kwv.co.za/product-category/brands/brands-the-mentors/
  ('KWV', 'The Mentors Orchestra', 'Western Cape, South Africa', null, 'Red'),  -- https://kwv.co.za/product-category/brands/brands-the-mentors/
  ('KWV', 'The Mentors Petit Verdot', 'Western Cape, South Africa', 'Petit Verdot', 'Red'),  -- https://kwv.co.za/product-category/brands/brands-the-mentors/
  ('KWV', 'The Mentors Pinotage', 'Western Cape, South Africa', 'Pinotage', 'Red'),  -- https://kwv.co.za/product-category/brands/brands-the-mentors/
  ('KWV', 'Cathedral Cellar Chardonnay', 'Western Cape, South Africa', 'Chardonnay', 'White'),  -- https://kwv.co.za/cathedral-cellar/
  ('KWV', 'Cathedral Cellar Sauvignon Blanc', 'Western Cape, South Africa', 'Sauvignon Blanc', 'White'),  -- https://kwv.co.za/cathedral-cellar/
  ('KWV', 'Cathedral Cellar Cabernet Sauvignon', 'Western Cape, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://kwv.co.za/cathedral-cellar/
  ('KWV', 'Cathedral Cellar Pinotage', 'Western Cape, South Africa', 'Pinotage', 'Red'),  -- https://kwv.co.za/cathedral-cellar/
  ('KWV', 'Cathedral Cellar Shiraz', 'Western Cape, South Africa', 'Shiraz', 'Red'),  -- https://kwv.co.za/cathedral-cellar/
  ('KWV', 'Cathedral Cellar Triptych', 'Western Cape, South Africa', null, 'Red')  -- https://kwv.co.za/cathedral-cellar/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LABORIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Laborie', 'Chardonnay', 'Paarl, South Africa', 'Chardonnay', 'White'),  -- https://kwv.co.za/product-category/wine/wine-white-wine/
  ('Laborie', 'Chenin Blanc', 'Paarl, South Africa', 'Chenin Blanc', 'White'),  -- https://kwv.co.za/product-category/wine/wine-white-wine/
  ('Laborie', 'Sauvignon Blanc', 'Paarl, South Africa', 'Sauvignon Blanc', 'White'),  -- https://kwv.co.za/product-category/wine/wine-white-wine/
  ('Laborie', 'Cap Classique Blanc de Blancs', 'Paarl, South Africa', 'Chardonnay', 'Sparkling'),  -- https://kwv.co.za/product-category/wine/wine-sparkling-wine/
  ('Laborie', 'Cap Classique Brut', 'Paarl, South Africa', null, 'Sparkling'),  -- https://kwv.co.za/product-category/wine/wine-sparkling-wine/
  ('Laborie', 'Cap Classique Rosé', 'Paarl, South Africa', null, 'Sparkling'),  -- https://kwv.co.za/product-category/wine/wine-sparkling-wine/
  ('Laborie', 'Cap Classique Nectar Rosé', 'Paarl, South Africa', null, 'Sparkling'),  -- https://kwv.co.za/product-category/wine/wine-sparkling-wine/
  ('Laborie', 'Pineau de Laborie', 'Paarl, South Africa', 'Pinotage', 'Fortified')  -- https://kwv.co.za/fortified-wine-products/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SPIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Spier', 'Frans K. Smit White', 'Stellenbosch, South Africa', null, 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Frans K. Smit Red', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', '21 Gables Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', '21 Gables Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', '21 Gables Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', '21 Gables Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Seaward Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Seaward Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Seaward Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Seaward Pinot Noir', 'Stellenbosch, South Africa', 'Pinot Noir', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Seaward Shiraz', 'Stellenbosch, South Africa', 'Shiraz', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Seaward Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Seaward Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Private Collection Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Private Collection Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Private Collection Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Private Collection Shiraz', 'Stellenbosch, South Africa', 'Shiraz', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Signature Albariño', 'Western Cape, South Africa', 'Albariño', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Signature Sauvignon Blanc', 'Western Cape, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Signature Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Signature Chardonnay', 'Western Cape, South Africa', 'Chardonnay', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Signature Shiraz', 'Western Cape, South Africa', 'Shiraz', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Signature Cabernet Sauvignon', 'Western Cape, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Signature Pinotage', 'Western Cape, South Africa', 'Pinotage', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Signature Red Blend', 'Western Cape, South Africa', null, 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Signature Merlot', 'Western Cape, South Africa', 'Merlot', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Farmer Angus Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Farmer Angus Rosé', 'Stellenbosch, South Africa', null, 'Rosé'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Farmer Angus Red Blend', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Good Natured Organic Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Good Natured Organic Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Good Natured Organic Rosé', 'Stellenbosch, South Africa', null, 'Rosé'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Good Natured Organic Shiraz/Cabernet Sauvignon', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Creative Block 2', 'Stellenbosch, South Africa', null, 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Creative Block 3', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Creative Block 5', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Creative Block 8', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'PS White', 'Stellenbosch, South Africa', null, 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'PS Rosé', 'Stellenbosch, South Africa', null, 'Rosé'),  -- https://www.spier.co.za/wine/
  ('Spier', 'PS Red', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Ideology Grenache Blanc', 'Stellenbosch, South Africa', 'Grenache Blanc', 'White'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Ideology Grenache Rosé', 'Stellenbosch, South Africa', 'Grenache', 'Rosé'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Ideology Grenache Noir', 'Stellenbosch, South Africa', 'Grenache', 'Red'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Cap Classique Brut', 'Stellenbosch, South Africa', null, 'Sparkling'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Cap Classique Brut Rosé', 'Stellenbosch, South Africa', null, 'Sparkling'),  -- https://www.spier.co.za/wine/
  ('Spier', 'Cap Classique Prestige Cuvée', 'Stellenbosch, South Africa', null, 'Sparkling')  -- https://www.spier.co.za/wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WARWICK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Warwick', 'Trilogy', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'Cabernet Franc', 'Stellenbosch, South Africa', 'Cabernet Franc', 'Red'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The Blue Lady Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The Black Lady Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The White Lady Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'Professor Black Pitch Black', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'Professor Black Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The First Lady Red', 'Western Cape, South Africa', null, 'Red'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The First Lady Cabernet Sauvignon', 'Western Cape, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The First Lady Pinotage', 'Western Cape, South Africa', 'Pinotage', 'Red'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The First Lady Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The First Lady Chardonnay', 'Western Cape, South Africa', 'Chardonnay', 'White'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The First Lady Dry Rosé', 'Western Cape, South Africa', null, 'Rosé'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The First Lady Sauvignon Blanc', 'Western Cape, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.warwickwine.com/collection/wine/
  ('Warwick', 'The First Lady Brut Rosé', 'Western Cape, South Africa', null, 'Sparkling')  -- https://www.warwickwine.com/collection/wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RUSTENBERG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Rustenberg', 'Five Soldiers', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Peter Barlow', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'John X Merriman', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Grenache Blanc', 'Stellenbosch, South Africa', 'Grenache Blanc', 'White'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Wild Ferment Unwooded Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Wild Ferment Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Petit Verdot Rosé', 'Stellenbosch, South Africa', 'Petit Verdot', 'Rosé'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'RM Nicholson', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Grenache', 'Stellenbosch, South Africa', 'Grenache', 'Red'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Malbec', 'Stellenbosch, South Africa', 'Malbec', 'Red'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Merlot', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Stellenbosch Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Old Vine Muscat of Alexandria', 'Stellenbosch, South Africa', 'Muscat of Alexandria', 'Fortified'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Muscat Blanc', 'Stellenbosch, South Africa', 'Muscat Blanc', 'Fortified'),  -- https://www.rustenberg.co.za/wine-portfolio/
  ('Rustenberg', 'Red Muscadel', 'Stellenbosch, South Africa', 'Muscat', 'Fortified')  -- https://www.rustenberg.co.za/wine-portfolio/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PORCUPINE RIDGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Porcupine Ridge', 'Syrah', 'Western Cape, South Africa', 'Syrah', 'Red'),  -- https://invincible.wine/porcupine-ridge/
  ('Porcupine Ridge', 'Sauvignon Blanc', 'Western Cape, South Africa', 'Sauvignon Blanc', 'White'),  -- https://invincible.wine/porcupine-ridge/
  ('Porcupine Ridge', 'Rosé', 'Western Cape, South Africa', null, 'Rosé'),  -- https://invincible.wine/porcupine-ridge/
  ('Porcupine Ridge', 'Merlot', 'Western Cape, South Africa', 'Merlot', 'Red'),  -- https://invincible.wine/porcupine-ridge/
  ('Porcupine Ridge', 'Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://invincible.wine/porcupine-ridge/
  ('Porcupine Ridge', 'Chardonnay', 'Western Cape, South Africa', 'Chardonnay', 'White'),  -- https://invincible.wine/porcupine-ridge/
  ('Porcupine Ridge', 'Cabernet Sauvignon', 'Western Cape, South Africa', 'Cabernet Sauvignon', 'Red')  -- https://invincible.wine/porcupine-ridge/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THE WOLFTRAP ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('The Wolftrap', 'White', 'Western Cape, South Africa', null, 'White'),  -- https://invincible.wine/the-wolftrap/
  ('The Wolftrap', 'Rosé', 'Western Cape, South Africa', null, 'Rosé'),  -- https://invincible.wine/the-wolftrap/
  ('The Wolftrap', 'Red', 'Western Cape, South Africa', null, 'Red')  -- https://invincible.wine/the-wolftrap/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOEKENHOUTSKLOOF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Boekenhoutskloof', 'Syrah', 'Swartland, South Africa', 'Syrah', 'Red'),  -- https://invincible.wine/boekenhoutskloof/
  ('Boekenhoutskloof', 'Stellenbosch Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://invincible.wine/boekenhoutskloof/
  ('Boekenhoutskloof', 'Franschhoek Cabernet Sauvignon', 'Franschhoek, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://invincible.wine/boekenhoutskloof/
  ('Boekenhoutskloof', 'Semillon', 'Franschhoek, South Africa', 'Semillon', 'White'),  -- https://invincible.wine/boekenhoutskloof/
  ('Boekenhoutskloof', 'Noble Late Harvest', 'Franschhoek, South Africa', 'Semillon', 'Sweet'),  -- https://invincible.wine/boekenhoutskloof/
  ('Boekenhoutskloof', 'The Chocolate Block', 'Western Cape, South Africa', null, 'Red')  -- https://invincible.wine/the-chocolate-block/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAP MARITIME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Cap Maritime', 'Chardonnay', 'Hemel-en-Aarde, South Africa', 'Chardonnay', 'White'),  -- https://invincible.wine/cap-maritime/
  ('Cap Maritime', 'Pinot Noir', 'Hemel-en-Aarde, South Africa', 'Pinot Noir', 'Red'),  -- https://invincible.wine/cap-maritime/
  ('Cap Maritime', 'Coastal Chardonnay', 'Cape South Coast, South Africa', 'Chardonnay', 'White'),  -- https://invincible.wine/cap-maritime/
  ('Cap Maritime', 'Coastal Pinot Noir', 'Cape South Coast, South Africa', 'Pinot Noir', 'Red')  -- https://invincible.wine/cap-maritime/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PATINA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Patina', 'Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White')  -- https://invincible.wine/patina/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DIEMERSDAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Diemersdal', '8 Rows Sauvignon Blanc', 'Durbanville, South Africa', 'Sauvignon Blanc', 'White'),  -- https://diemersdal.co.za/shop/
  ('Diemersdal', 'Cabernet Sauvignon Merlot', 'Durbanville, South Africa', null, 'Red'),  -- https://diemersdal.co.za/shop/page/3/
  ('Diemersdal', 'Chardonnay Reserve', 'Durbanville, South Africa', 'Chardonnay', 'White'),  -- https://diemersdal.co.za/shop/
  ('Diemersdal', 'Chardonnay Unwooded', 'Durbanville, South Africa', 'Chardonnay', 'White'),  -- https://diemersdal.co.za/shop/
  ('Diemersdal', 'Grüner Veltliner', 'Durbanville, South Africa', 'Grüner Veltliner', 'White'),  -- https://diemersdal.co.za/shop/page/3/
  ('Diemersdal', 'Malbec', 'Durbanville, South Africa', 'Malbec', 'Red'),  -- https://diemersdal.co.za/shop/
  ('Diemersdal', 'MCC Blanc de Blancs', 'Durbanville, South Africa', 'Chardonnay', 'Sparkling'),  -- https://diemersdal.co.za/shop/page/3/
  ('Diemersdal', 'Merlot', 'Durbanville, South Africa', 'Merlot', 'Red'),  -- https://diemersdal.co.za/shop/page/4/
  ('Diemersdal', 'Noble Late Harvest Sauvignon Blanc', 'Durbanville, South Africa', 'Sauvignon Blanc', 'Sweet'),  -- https://diemersdal.co.za/shop/
  ('Diemersdal', 'Pinot Noir', 'Durbanville, South Africa', 'Pinot Noir', 'Red'),  -- https://diemersdal.co.za/shop/page/4/
  ('Diemersdal', 'Pinotage', 'Durbanville, South Africa', 'Pinotage', 'Red'),  -- https://diemersdal.co.za/shop/
  ('Diemersdal', 'Pinotage Reserve', 'Durbanville, South Africa', 'Pinotage', 'Red'),  -- https://diemersdal.co.za/shop/
  ('Diemersdal', 'Private Collection', 'Durbanville, South Africa', null, 'Red'),  -- https://diemersdal.co.za/shop/
  ('Diemersdal', 'Sauvignon Blanc', 'Durbanville, South Africa', 'Sauvignon Blanc', 'White'),  -- https://diemersdal.co.za/shop/page/2/
  ('Diemersdal', 'Sauvignon Blanc Reserve', 'Durbanville, South Africa', 'Sauvignon Blanc', 'White'),  -- https://diemersdal.co.za/shop/page/2/
  ('Diemersdal', 'Sauvignon Rosé', 'Durbanville, South Africa', 'Sauvignon Blanc', 'Rosé'),  -- https://diemersdal.co.za/shop/page/2/
  ('Diemersdal', 'Shiraz', 'Durbanville, South Africa', 'Shiraz', 'Red'),  -- https://diemersdal.co.za/shop/page/3/
  ('Diemersdal', 'Syrah', 'Durbanville, South Africa', 'Syrah', 'Red'),  -- https://diemersdal.co.za/shop/page/2/
  ('Diemersdal', 'The Globe Sauvignon Blanc', 'Durbanville, South Africa', 'Sauvignon Blanc', 'White'),  -- https://diemersdal.co.za/shop/page/3/
  ('Diemersdal', 'Winter Ferment Sauvignon Blanc', 'Durbanville, South Africa', 'Sauvignon Blanc', 'White'),  -- https://diemersdal.co.za/shop/page/3/
  ('Diemersdal', 'The Journal Cabernet Sauvignon', 'Durbanville, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://diemersdal.co.za/shop/page/4/
  ('Diemersdal', 'The Journal Merlot', 'Durbanville, South Africa', 'Merlot', 'Red'),  -- https://diemersdal.co.za/shop/page/5/
  ('Diemersdal', 'The Journal Pinotage', 'Durbanville, South Africa', 'Pinotage', 'Red'),  -- https://diemersdal.co.za/shop/page/4/
  ('Diemersdal', 'The Journal Sauvignon Blanc', 'Durbanville, South Africa', 'Sauvignon Blanc', 'White'),  -- https://diemersdal.co.za/shop/page/3/
  ('Diemersdal', 'Prospect Barbera', 'Durbanville, South Africa', 'Barbera', 'Red'),  -- https://diemersdal.co.za/shop/page/2/
  ('Diemersdal', 'Prospect Darling Sauvignon Blanc', 'Durbanville, South Africa', 'Sauvignon Blanc', 'White')  -- https://diemersdal.co.za/shop/page/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GROOT CONSTANTIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Groot Constantia', 'Méthode Cap Classique Brut Rosé', 'Constantia, South Africa', null, 'Sparkling'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Rosé', 'Constantia, South Africa', null, 'Rosé'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Sauvignon Blanc', 'Constantia, South Africa', 'Sauvignon Blanc', 'White'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Chardonnay', 'Constantia, South Africa', 'Chardonnay', 'White'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Gouverneurs Reserve White', 'Constantia, South Africa', null, 'White'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Lady of Abundance', 'Constantia, South Africa', null, 'Red'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Cabernet Sauvignon', 'Constantia, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Pinotage', 'Constantia, South Africa', 'Pinotage', 'Red'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Merlot', 'Constantia, South Africa', 'Merlot', 'Red'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Shiraz', 'Constantia, South Africa', 'Shiraz', 'Red'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Gouverneurs Reserve', 'Constantia, South Africa', null, 'Red'),  -- https://grootconstantia.co.za/wine-shop/
  ('Groot Constantia', 'Grand Constance', 'Constantia, South Africa', 'Muscat', 'Sweet')  -- https://grootconstantia.co.za/wine-shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KLEIN CONSTANTIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Klein Constantia', 'Sauvignon Blanc', 'Constantia, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.kleinconstantia.com/wine-range/kc-range/
  ('Klein Constantia', 'Perdeblokke', 'Constantia, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.kleinconstantia.com/wine-range/kc-range/
  ('Klein Constantia', 'Clara', 'Constantia, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.kleinconstantia.com/wine-range/kc-range/
  ('Klein Constantia', 'Blanc de Blancs', 'Constantia, South Africa', 'Chardonnay', 'Sparkling'),  -- https://www.kleinconstantia.com/wine-range/kc-range/
  ('Klein Constantia', 'Rietbos', 'Constantia, South Africa', 'Chardonnay', 'White'),  -- https://www.kleinconstantia.com/wine-range/kc-range/
  ('Klein Constantia', 'Estate Red', 'Constantia, South Africa', null, 'Red'),  -- https://www.kleinconstantia.com/wine-range/kc-range/
  ('Klein Constantia', 'Vin de Constance', 'Constantia, South Africa', 'Muscat de Frontignan', 'Sweet')  -- https://www.kleinconstantia.com/wine-range/vin-de-constance-range/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ANWILKA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Anwilka', 'Anwilka', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.kleinconstantia.com/wine-range/anwilka/
  ('Anwilka', 'Ugaba', 'Stellenbosch, South Africa', null, 'Red')  -- https://www.kleinconstantia.com/wine-range/anwilka/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JORDAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Jordan', 'Chameleon Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://www.jordanwines.com/product-category/chameleon-range/
  ('Jordan', 'Chameleon Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.jordanwines.com/product-category/chameleon-range/
  ('Jordan', 'Chameleon Cabernet Sauvignon Merlot', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.jordanwines.com/product-category/chameleon-range/
  ('Jordan', 'Chameleon No Added Sulphur Merlot', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://www.jordanwines.com/product-category/chameleon-range/
  ('Jordan', 'Chameleon Merlot', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://www.jordanwines.com/product-category/chameleon-range/
  ('Jordan', 'Chameleon Syrah', 'Stellenbosch, South Africa', 'Syrah', 'Red'),  -- https://www.jordanwines.com/product-category/chameleon-range/
  ('Jordan', 'Assyrtiko', 'Stellenbosch, South Africa', 'Assyrtiko', 'White'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'The Outlier Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'Unoaked Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'Dry Rosé', 'Stellenbosch, South Africa', null, 'Rosé'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'Fold Mountain Brut Cap Classique', 'Stellenbosch, South Africa', null, 'Sparkling'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'Barrel Fermented Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'Inspector Péringuey Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'The Real McCoy Riesling', 'Stellenbosch, South Africa', 'Riesling', 'White'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'Black Magic Merlot', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'The Prospector Syrah', 'Stellenbosch, South Africa', 'Syrah', 'Red'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'The Long Fuse Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.jordanwines.com/product-category/estate-range/
  ('Jordan', 'Sophia', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.jordanwines.com/product-category/reserve-range/
  ('Jordan', 'Cap Classique Blanc de Blancs', 'Stellenbosch, South Africa', 'Chardonnay', 'Sparkling'),  -- https://www.jordanwines.com/product-category/reserve-range/
  ('Jordan', 'Nine Yards Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.jordanwines.com/product-category/reserve-range/
  ('Jordan', 'Cobblers Hill', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.jordanwines.com/product-category/reserve-range/
  ('Jordan', 'Timepiece Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.jordanwines.com/product-category/timepiece-range/
  ('Jordan', 'Timepiece Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.jordanwines.com/product-category/timepiece-range/
  ('Jordan', 'Timepiece Riesling', 'Stellenbosch, South Africa', 'Riesling', 'Sweet'),  -- https://www.jordanwines.com/product-category/timepiece-range/
  ('Jordan', 'Timepiece Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.jordanwines.com/product-category/timepiece-range/
  ('Jordan', 'Timepiece Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White')  -- https://www.jordanwines.com/product-category/timepiece-range/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NEWTON JOHNSON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Newton Johnson', 'Sauvignon Blanc', 'Cape South Coast, South Africa', 'Sauvignon Blanc', 'White'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Albariño', 'Hemel-en-Aarde, South Africa', 'Albariño', 'White'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Southend Chardonnay', 'Cape South Coast, South Africa', 'Chardonnay', 'White'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Walker Bay Pinot Noir', 'Walker Bay, South Africa', 'Pinot Noir', 'Red'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Full Stop Rock', 'Cape South Coast, South Africa', null, 'Red'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Family Vineyards Chardonnay', 'Hemel-en-Aarde, South Africa', 'Chardonnay', 'White'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Family Vineyards Pinot Noir', 'Hemel-en-Aarde, South Africa', 'Pinot Noir', 'Red'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Falkirk Grenache', 'Hemel-en-Aarde, South Africa', 'Grenache', 'Red'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Falkirk Syrah', 'Hemel-en-Aarde, South Africa', 'Syrah', 'Red'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Falkirk Mourvèdre', 'Hemel-en-Aarde, South Africa', 'Mourvèdre', 'Red'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Seadragon Pinot Noir', 'Hemel-en-Aarde, South Africa', 'Pinot Noir', 'Red'),  -- https://newtonjohnson.com/wines/
  ('Newton Johnson', 'Windansea Pinot Noir', 'Hemel-en-Aarde, South Africa', 'Pinot Noir', 'Red')  -- https://newtonjohnson.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THELEMA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Thelema', 'Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Cap Classique', 'Stellenbosch, South Africa', null, 'Sparkling'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Gargantua Muscadel', 'Stellenbosch, South Africa', 'Muscat', 'Fortified'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Grenache', 'Stellenbosch, South Africa', 'Grenache', 'Red'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Merlot', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Merlot Reserve', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Mountain Red', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Mountain White', 'Stellenbosch, South Africa', null, 'White'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Rabelais', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Roussanne', 'Stellenbosch, South Africa', 'Roussanne', 'White'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Shiraz', 'Stellenbosch, South Africa', 'Shiraz', 'Red'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'The Abbey', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'The Mint Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.thelema.co.za/range/thelema
  ('Thelema', 'Vin de Hel Muscat Late Harvest', 'Stellenbosch, South Africa', 'Muscat', 'Sweet')  -- https://www.thelema.co.za/range/thelema
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SUTHERLAND ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Sutherland', 'Anna Chardonnay', 'Elgin, South Africa', 'Chardonnay', 'White'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Cabernet Sauvignon', 'Elgin, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Chardonnay', 'Elgin, South Africa', 'Chardonnay', 'White'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Emily Petit Verdot', 'Elgin, South Africa', 'Petit Verdot', 'Red'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Grenache', 'Elgin, South Africa', 'Grenache', 'Red'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Grenache Rosé', 'Elgin, South Africa', 'Grenache', 'Rosé'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Lisa Grenache', 'Elgin, South Africa', 'Grenache', 'Red'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Pinot Noir', 'Elgin, South Africa', 'Pinot Noir', 'Red'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Riesling', 'Elgin, South Africa', 'Riesling', 'White'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Sarah Red', 'Elgin, South Africa', null, 'Red'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Sauvignon Blanc', 'Elgin, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Syrah', 'Elgin, South Africa', 'Syrah', 'Red'),  -- https://www.thelema.co.za/range/sutherland
  ('Sutherland', 'Viognier Roussanne', 'Elgin, South Africa', null, 'White')  -- https://www.thelema.co.za/range/sutherland
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WATERKLOOF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Waterkloof', 'Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Syrah', 'Stellenbosch, South Africa', 'Syrah', 'Red'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Boreas', 'Stellenbosch, South Africa', null, 'Red'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Astraeus MCC Reserve Pinot Noir', 'Stellenbosch, South Africa', 'Pinot Noir', 'Sparkling'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Astraeus Brut Chardonnay', 'Stellenbosch, South Africa', 'Chardonnay', 'Sparkling'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Circumstance Sauvignon Blanc', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Circumstance Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Circumstance Cape Coral', 'Stellenbosch, South Africa', null, 'Rosé'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Circumstance Merlot', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Circumstance Syrah', 'Stellenbosch, South Africa', 'Syrah', 'Red'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Circumstance Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://waterkloofwines.co.za/shop/
  ('Waterkloof', 'Circumstance Cabernet Franc', 'Stellenbosch, South Africa', 'Cabernet Franc', 'Red'),  -- https://waterkloofwines.co.za/shop/page/2/
  ('Waterkloof', 'Circumstance Mourvèdre', 'Stellenbosch, South Africa', 'Mourvèdre', 'Red'),  -- https://waterkloofwines.co.za/shop/page/2/
  ('Waterkloof', 'Seriously Cool Cinsault', 'Stellenbosch, South Africa', 'Cinsault', 'Red'),  -- https://waterkloofwines.co.za/shop/page/2/
  ('Waterkloof', 'Seriously Cool Chenin Blanc', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://waterkloofwines.co.za/shop/page/2/
  ('Waterkloof', 'Peacock Wild Ferment Sauvignon Blanc', 'Western Cape, South Africa', 'Sauvignon Blanc', 'White'),  -- https://waterkloofwines.co.za/shop/page/2/
  ('Waterkloof', 'Peacock Wild Ferment Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://waterkloofwines.co.za/shop/page/2/
  ('Waterkloof', 'Peacock Wild Ferment Merlot', 'Western Cape, South Africa', 'Merlot', 'Red'),  -- https://waterkloofwines.co.za/shop/page/3/
  ('Waterkloof', 'Peacock Wild Ferment Cabernet Sauvignon', 'Western Cape, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://waterkloofwines.co.za/shop/page/3/
  ('Waterkloof', 'False Bay Slow Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://waterkloofwines.co.za/shop/page/3/
  ('Waterkloof', 'False Bay Windswept Sauvignon Blanc', 'Western Cape, South Africa', 'Sauvignon Blanc', 'White'),  -- https://waterkloofwines.co.za/shop/page/3/
  ('Waterkloof', 'False Bay Crystalline Chardonnay', 'Western Cape, South Africa', 'Chardonnay', 'White'),  -- https://waterkloofwines.co.za/shop/page/3/
  ('Waterkloof', 'False Bay Whole Bunch Cinsault Mourvèdre Rosé', 'Western Cape, South Africa', null, 'Rosé'),  -- https://waterkloofwines.co.za/shop/page/3/
  ('Waterkloof', 'False Bay Bush Vine Pinotage', 'Western Cape, South Africa', 'Pinotage', 'Red'),  -- https://waterkloofwines.co.za/shop/page/3/
  ('Waterkloof', 'False Bay Old School Syrah', 'Western Cape, South Africa', 'Syrah', 'Red')  -- https://waterkloofwines.co.za/shop/page/3/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HAMILTON RUSSELL VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Hamilton Russell Vineyards', 'Chardonnay', 'Hemel-en-Aarde, South Africa', 'Chardonnay', 'White'),  -- https://hamiltonrussellvineyards.com/home/our-wines/
  ('Hamilton Russell Vineyards', 'Pinot Noir', 'Hemel-en-Aarde, South Africa', 'Pinot Noir', 'Red')  -- https://hamiltonrussellvineyards.com/home/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SADIE FAMILY WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Sadie Family Wines', 'Columella', 'Swartland, South Africa', null, 'Red'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Palladius', 'Swartland, South Africa', null, 'White'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Soldaat', 'Swartland, South Africa', 'Grenache', 'Red'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Pofadder', 'Swartland, South Africa', 'Cinsault', 'Red'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Sonvang', 'Swartland, South Africa', null, 'Red'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Treinspoor', 'Swartland, South Africa', 'Tinta Barocca', 'Red'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Skerpioen', 'Swartland, South Africa', null, 'White'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', '''T Voetpad', 'Swartland, South Africa', null, 'White'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Kokerboom', 'Western Cape, South Africa', 'Semillon', 'White'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Twiswind', 'Swartland, South Africa', null, 'White'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Skurfberg', 'Swartland, South Africa', 'Chenin Blanc', 'White'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Rotsbank', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://thesadiefamily.com/the-wine-collection/
  ('Sadie Family Wines', 'Mev. Kirsten', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White')  -- https://thesadiefamily.com/the-wine-collection/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GLEN CARLOU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Glen Carlou', 'Gravel Quarry Cabernet Sauvignon', 'Paarl, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://glencarlou.com/wine/
  ('Glen Carlou', 'Quartz Stone Chardonnay', 'Paarl, South Africa', 'Chardonnay', 'White'),  -- https://glencarlou.com/wine/
  ('Glen Carlou', 'The Grand Classique', 'Paarl, South Africa', null, 'Red'),  -- https://glencarlou.com/wine/
  ('Glen Carlou', 'Blanc de Blancs Brut', 'Paarl, South Africa', 'Chardonnay', 'Sparkling'),  -- https://glencarlou.com/wine/
  ('Glen Carlou', 'Cabernet Sauvignon', 'Paarl, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://glencarlou.com/wine/
  ('Glen Carlou', 'Merlot', 'Paarl, South Africa', 'Merlot', 'Red'),  -- https://glencarlou.com/wine/
  ('Glen Carlou', 'Chardonnay', 'Paarl, South Africa', 'Chardonnay', 'White')  -- https://glencarlou.com/wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FAIRVIEW ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Fairview', 'Cyril Back', 'Paarl, South Africa', null, 'Red'),  -- https://fairviewmarketplace.co.za/shop
  ('Fairview', 'Beryl Back', 'Paarl, South Africa', null, 'White'),  -- https://fairviewmarketplace.co.za/shop
  ('Fairview', 'Stok by Paaltjie Grenache Noir', 'Paarl, South Africa', 'Grenache', 'Red'),  -- https://fairviewmarketplace.co.za/shop
  ('Fairview', 'Primo Pinotage', 'Paarl, South Africa', 'Pinotage', 'Red'),  -- https://fairviewmarketplace.co.za/shop
  ('Fairview', 'Lanner Hill Syrah', 'Paarl, South Africa', 'Syrah', 'Red'),  -- https://fairviewmarketplace.co.za/shop
  ('Fairview', 'Eenzaamheid Shiraz', 'Paarl, South Africa', 'Shiraz', 'Red'),  -- https://fairviewmarketplace.co.za/shop
  ('Fairview', 'Beacon Shiraz', 'Paarl, South Africa', 'Shiraz', 'Red'),  -- https://fairviewmarketplace.co.za/shop
  ('Fairview', 'Pegleg Carignan', 'Paarl, South Africa', 'Carignan', 'Red'),  -- https://fairviewmarketplace.co.za/shop
  ('Fairview', 'La Beryl Blanc', 'Paarl, South Africa', 'Chenin Blanc', 'Sweet'),  -- https://fairviewmarketplace.co.za/shop
  ('Fairview', 'Sweet Red', 'Paarl, South Africa', null, 'Sweet')  -- https://fairviewmarketplace.co.za/shop
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAUL CLUVER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Paul Cluver', 'Seven Flags Pinot Noir', 'Elgin, South Africa', 'Pinot Noir', 'Red'),  -- https://cluver.com/seven-flags/
  ('Paul Cluver', 'Seven Flags Chardonnay', 'Elgin, South Africa', 'Chardonnay', 'White'),  -- https://cluver.com/seven-flags/
  ('Paul Cluver', 'The Estate Pinot Noir', 'Elgin, South Africa', 'Pinot Noir', 'Red'),  -- https://cluver.com/estate-range/
  ('Paul Cluver', 'The Estate Chardonnay', 'Elgin, South Africa', 'Chardonnay', 'White'),  -- https://cluver.com/estate-range/
  ('Paul Cluver', 'Village Pinot Noir', 'Elgin, South Africa', 'Pinot Noir', 'Red'),  -- https://cluver.com/village-range/
  ('Paul Cluver', 'Village Chardonnay', 'Elgin, South Africa', 'Chardonnay', 'White'),  -- https://cluver.com/village-range/
  ('Paul Cluver', 'Riesling', 'Elgin, South Africa', 'Riesling', 'White'),  -- https://cluver.com/riesling/
  ('Paul Cluver', 'Noble Late Harvest', 'Elgin, South Africa', 'Riesling', 'Sweet'),  -- https://cluver.com/riesling/
  ('Paul Cluver', 'Sauvignon Blanc', 'Elgin, South Africa', 'Sauvignon Blanc', 'White')  -- https://cluver.com/sauvignon-blanc/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DELHEIM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Delheim', 'Pinotage Rosé', 'Western Cape, South Africa', 'Pinotage', 'Rosé'),  -- https://delheim.com/our-wines/family-lifestyle-range/
  ('Delheim', 'Sauvignon Blanc', 'Western Cape, South Africa', 'Sauvignon Blanc', 'White'),  -- https://delheim.com/our-wines/family-lifestyle-range/
  ('Delheim', 'Shiraz Cabernet Sauvignon', 'Western Cape, South Africa', null, 'Red'),  -- https://delheim.com/our-wines/family-lifestyle-range/
  ('Delheim', 'Chenin Blanc Unwooded', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://delheim.com/our-wines/family-lifestyle-range/
  ('Delheim', 'Grand Reserve', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://delheim.com/our-wines/family-estate-range/
  ('Delheim', 'Vera Cruz Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red'),  -- https://delheim.com/our-wines/family-estate-range/
  ('Delheim', 'Chardonnay Sur Lie', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://delheim.com/our-wines/family-estate-range/
  ('Delheim', 'Edelspatz Noble Late Harvest', 'Stellenbosch, South Africa', null, 'Sweet'),  -- https://delheim.com/our-wines/family-estate-range/
  ('Delheim', 'Chenin Blanc Wild Ferment', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://delheim.com/our-wines/family-premium-range/
  ('Delheim', 'Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red'),  -- https://delheim.com/our-wines/family-premium-range/
  ('Delheim', 'Merlot', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://delheim.com/our-wines/family-premium-range/
  ('Delheim', 'Cabernet Sauvignon', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://delheim.com/our-wines/family-premium-range/
  ('Delheim', 'Gewürztraminer', 'Stellenbosch, South Africa', 'Gewürztraminer', 'White'),  -- https://delheim.com/our-wines/family-heritage-wines/
  ('Delheim', 'Spatzendreck', 'Stellenbosch, South Africa', null, 'Sweet'),  -- https://delheim.com/our-wines/family-heritage-wines/
  ('Delheim', 'Staying Alive Riesling', 'Stellenbosch, South Africa', 'Riesling', 'White'),  -- https://delheim.com/our-wines/collaborations-limited-releases/
  ('Delheim', 'Iconoclast Cabernet Franc', 'Stellenbosch, South Africa', 'Cabernet Franc', 'Red'),  -- https://delheim.com/our-wines/collaborations-limited-releases/
  ('Delheim', 'Iconoclast Cape Blend', 'Stellenbosch, South Africa', null, 'Red')  -- https://delheim.com/our-wines/collaborations-limited-releases/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SIMONSIG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Simonsig', 'Cuvée Royale', 'Stellenbosch, South Africa', 'Chardonnay', 'Sparkling'),  -- https://www.simonsig.co.za/cap-classique/
  ('Simonsig', 'Kaapse Vonkel Brut', 'Stellenbosch, South Africa', null, 'Sparkling'),  -- https://www.simonsig.co.za/cap-classique/
  ('Simonsig', 'Kaapse Vonkel Brut Rosé', 'Stellenbosch, South Africa', null, 'Sparkling'),  -- https://www.simonsig.co.za/cap-classique/
  ('Simonsig', 'Kaapse Vonkel Satin Nectar', 'Stellenbosch, South Africa', null, 'Sparkling'),  -- https://www.simonsig.co.za/cap-classique/
  ('Simonsig', 'Kaapse Vonkel Satin Nectar Rosé', 'Stellenbosch, South Africa', null, 'Sparkling'),  -- https://www.simonsig.co.za/cap-classique/
  ('Simonsig', 'Kaapse Vonkel Satin Royale', 'Stellenbosch, South Africa', null, 'Sparkling'),  -- https://www.simonsig.co.za/cap-classique/
  ('Simonsig', 'The Langbult Steen', 'Stellenbosch, South Africa', 'Chenin Blanc', 'White'),  -- https://www.simonsig.co.za/the-langbult-steen/
  ('Simonsig', 'Tiara', 'Stellenbosch, South Africa', null, 'Red'),  -- https://www.simonsig.co.za/tastings/
  ('Simonsig', 'Redhill Pinotage', 'Stellenbosch, South Africa', 'Pinotage', 'Red')  -- https://www.simonsig.co.za/tastings/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BELLINGHAM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Bellingham', 'The Bernard Series Old Vine Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://www.bellinghamwines.com/pages/bernard-series
  ('Bellingham', 'The Bernard Series Bush Vine Pinotage', 'Western Cape, South Africa', 'Pinotage', 'Red'),  -- https://www.bellinghamwines.com/pages/bernard-series
  ('Bellingham', 'The Bernard Series Basket Press Syrah', 'Western Cape, South Africa', 'Syrah', 'Red'),  -- https://www.bellinghamwines.com/pages/bernard-series
  ('Bellingham', 'The Bernard Series The Maverick S.M.V', 'Western Cape, South Africa', null, 'Red'),  -- https://www.bellinghamwines.com/pages/bernard-series
  ('Bellingham', 'Founders Series Freda White Blend', 'Western Cape, South Africa', null, 'White'),  -- https://www.bellinghamwines.com/pages/founders-series
  ('Bellingham', 'Founders Series The Quintessential Couple Rosé', 'Western Cape, South Africa', null, 'Rosé'),  -- https://www.bellinghamwines.com/pages/founders-series
  ('Bellingham', 'Founders Series Pod Red Blend', 'Western Cape, South Africa', null, 'Red'),  -- https://www.bellinghamwines.com/pages/founders-series
  ('Bellingham', 'Homestead Sauvignon Blanc', 'Western Cape, South Africa', 'Sauvignon Blanc', 'White'),  -- https://www.bellinghamwines.com/pages/homestead-series
  ('Bellingham', 'Homestead Chenin Blanc', 'Western Cape, South Africa', 'Chenin Blanc', 'White'),  -- https://www.bellinghamwines.com/pages/homestead-series
  ('Bellingham', 'Homestead Chardonnay', 'Western Cape, South Africa', 'Chardonnay', 'White'),  -- https://www.bellinghamwines.com/pages/homestead-series
  ('Bellingham', 'Homestead Pinotage', 'Western Cape, South Africa', 'Pinotage', 'Red'),  -- https://www.bellinghamwines.com/pages/homestead-series
  ('Bellingham', 'Homestead Shiraz', 'Western Cape, South Africa', 'Shiraz', 'Red'),  -- https://www.bellinghamwines.com/pages/homestead-series
  ('Bellingham', 'Homestead Red Blend', 'Western Cape, South Africa', null, 'Red')  -- https://www.bellinghamwines.com/pages/homestead-series
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MULLINEUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Mullineux', 'Old Vines White', 'Swartland, South Africa', 'Chenin Blanc', 'White'),  -- https://mlfwines.com/mullineux-wine-tasting/
  ('Mullineux', 'Syrah', 'Swartland, South Africa', 'Syrah', 'Red'),  -- https://mlfwines.com/mullineux-wine-tasting/
  ('Mullineux', 'Straw Wine', 'Swartland, South Africa', 'Chenin Blanc', 'Sweet'),  -- https://mlfwines.com/mullineux-wine-tasting/
  ('Mullineux', 'Single Terroir Chenin Blanc', 'Swartland, South Africa', 'Chenin Blanc', 'White'),  -- https://mlfwines.com/mullineux-wine-tasting/
  ('Mullineux', 'Single Terroir Syrah', 'Swartland, South Africa', 'Syrah', 'Red'),  -- https://mlfwines.com/mullineux-wine-tasting/
  ('Mullineux', 'Roundstone Blanc', 'Swartland, South Africa', null, 'White'),  -- https://mlfwines.com/mullineux-wine-tasting/
  ('Mullineux', 'Roundstone', 'Swartland, South Africa', null, 'Red')  -- https://mlfwines.com/mullineux-wine-tasting/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VERGELEGEN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_south_africa.sql)'
from (values
  ('Vergelegen', 'Chardonnay Reserve', 'Stellenbosch, South Africa', 'Chardonnay', 'White'),  -- https://vergelegen.co.za/wine-tasting/reserve-range/
  ('Vergelegen', 'Merlot Reserve', 'Stellenbosch, South Africa', 'Merlot', 'Red'),  -- https://vergelegen.co.za/wine-tasting/reserve-range/
  ('Vergelegen', 'Cabernet Sauvignon Reserve', 'Stellenbosch, South Africa', 'Cabernet Sauvignon', 'Red'),  -- https://vergelegen.co.za/wine-tasting/reserve-range/
  ('Vergelegen', 'Florence Rosé', 'Stellenbosch, South Africa', null, 'Rosé'),  -- https://vergelegen.co.za/wine-tasting/heritage-range/
  ('Vergelegen', 'Wild Winds Sauvignon', 'Stellenbosch, South Africa', 'Sauvignon Blanc', 'White'),  -- https://vergelegen.co.za/wine-tasting/heritage-range/
  ('Vergelegen', 'Mill Race Red', 'Stellenbosch, South Africa', null, 'Red'),  -- https://vergelegen.co.za/wine-tasting/heritage-range/
  ('Vergelegen', 'Estate White', 'Stellenbosch, South Africa', null, 'White'),  -- https://vergelegen.co.za/wine-tasting/estate-and-v-range/
  ('Vergelegen', 'Estate Red', 'Stellenbosch, South Africa', null, 'Red')  -- https://vergelegen.co.za/wine-tasting/estate-and-v-range/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
