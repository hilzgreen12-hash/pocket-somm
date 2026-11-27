-- Producer ranges round 2: Australia. Every row confirmed on a real page (URL on each row), 2026-11-26.
-- Run in the Supabase SQL editor. Re-runnable: existing rows are only upgraded to verified.

-- ---- D'ARENBERG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('d''Arenberg', 'The Dead Arm Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.darenberg.com.au/icons/
  ('d''Arenberg', 'The Coppermine Road Cabernet Sauvignon', 'McLaren Vale, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.darenberg.com.au/icons/
  ('d''Arenberg', 'The Ironstone Pressings Grenache Shiraz Mourvèdre', 'McLaren Vale, South Australia, Australia', 'Grenache, Shiraz, Mourvèdre', 'Red'),  -- https://www.darenberg.com.au/icons/
  ('d''Arenberg', 'The Bonsai Vine Grenache Shiraz Mourvèdre', 'McLaren Vale, South Australia, Australia', 'Grenache, Shiraz, Mourvèdre', 'Red'),  -- https://www.darenberg.com.au/classics/
  ('d''Arenberg', 'The Laughing Magpie Shiraz Viognier', 'McLaren Vale, South Australia, Australia', 'Shiraz, Viognier', 'Red'),  -- https://www.darenberg.com.au/classics/
  ('d''Arenberg', 'The Galvo Garage', 'McLaren Vale, South Australia, Australia', null, 'Red'),  -- https://www.darenberg.com.au/classics/
  ('d''Arenberg', 'The Derelict Vineyard Grenache', 'McLaren Vale, South Australia, Australia', 'Grenache', 'Red'),  -- https://www.darenberg.com.au/classics/
  ('d''Arenberg', 'The Twenty Eight Road Mourvèdre', 'McLaren Vale, South Australia, Australia', 'Mourvèdre', 'Red'),  -- https://www.darenberg.com.au/classics/
  ('d''Arenberg', 'The Hermit Crab Viognier Marsanne', 'McLaren Vale, South Australia, Australia', 'Viognier, Marsanne', 'White'),  -- https://www.darenberg.com.au/originals/
  ('d''Arenberg', 'The Olive Grove Chardonnay', 'McLaren Vale, South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.darenberg.com.au/originals/
  ('d''Arenberg', 'The Dry Dam Riesling', 'McLaren Vale, South Australia, Australia', 'Riesling', 'White'),  -- https://www.darenberg.com.au/originals/
  ('d''Arenberg', 'The Custodian Grenache', 'McLaren Vale, South Australia, Australia', 'Grenache', 'Red'),  -- https://www.darenberg.com.au/originals/
  ('d''Arenberg', 'd''Arry''s Original Grenache Shiraz', 'McLaren Vale, South Australia, Australia', 'Grenache, Shiraz', 'Red'),  -- https://www.darenberg.com.au/originals/
  ('d''Arenberg', 'The Footbolt Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.darenberg.com.au/originals/
  ('d''Arenberg', 'The High Trellis Cabernet Sauvignon', 'McLaren Vale, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.darenberg.com.au/originals/
  ('d''Arenberg', 'The Stump Jump Shiraz', null, 'Shiraz', 'Red'),  -- https://www.darenberg.com.au/stump-jumps/
  ('d''Arenberg', 'The Stump Jump Grenache Shiraz Mourvèdre', null, 'Grenache, Shiraz, Mourvèdre', 'Red'),  -- https://www.darenberg.com.au/stump-jumps/
  ('d''Arenberg', 'The Stump Jump Riesling', null, 'Riesling', 'White'),  -- https://www.darenberg.com.au/stump-jumps/
  ('d''Arenberg', 'Nostalgia Rare Tawny', 'McLaren Vale, South Australia, Australia', null, 'Fortified'),  -- https://www.darenberg.com.au/fortified/
  ('d''Arenberg', 'The Daddy Long Legs Extra Rare', 'McLaren Vale, South Australia, Australia', null, 'Fortified')  -- https://www.darenberg.com.au/fortified/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HENSCHKE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Henschke', 'Hill of Grace', 'Eden Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.libertywines.co.uk/our-portfolio/HE501-hill-of-grace-eden-valley-shiraz
  ('Henschke', 'Mount Edelstone', 'Eden Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.libertywines.co.uk/our-portfolio/HE503-mount-edelstone-eden-valley-shiraz
  ('Henschke', 'Cyril Henschke Cabernet Sauvignon', 'Eden Valley, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.libertywines.co.uk/our-portfolio/HE502-cyril-henschke-eden-valley-cabernet-sauvignon
  ('Henschke', 'Keyneton Euphonium', 'Barossa, South Australia, Australia', 'Shiraz, Cabernet Sauvignon, Merlot, Cabernet Franc', 'Red'),  -- https://www.libertywines.co.uk/our-portfolio/HE504-keyneton-euphonium-barossa-shirazcabernet-sauvignonmerlotcabernet-franc
  ('Henschke', 'Johann''s Garden', 'Barossa Valley, South Australia, Australia', 'Grenache, Mataro', 'Red'),  -- https://www.libertywines.co.uk/our-portfolio/HE505-johann's-garden-barossa-valley-grenachemataro
  ('Henschke', 'Henry''s Seven', 'Barossa, South Australia, Australia', 'Shiraz, Grenache, Mataro, Viognier', 'Red'),  -- https://www.libertywines.co.uk/our-portfolio/HE506-henry's-seven-barossa-shirazgrenachemataroviognier
  ('Henschke', 'Hill of Roses', 'Eden Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.libertywines.co.uk/our-portfolio/HE515-hill-of-roses-eden-valley-shiraz
  ('Henschke', 'The Wheelwright', 'Eden Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.libertywines.co.uk/our-portfolio/HE517-the-wheelwright-eden-valley-shiraz
  ('Henschke', 'Julius Riesling', 'Eden Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.libertywines.co.uk/our-portfolio/HE508-julius-eden-valley-riesling
  ('Henschke', 'Peggy''s Hill Riesling', 'Eden Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.libertywines.co.uk/our-portfolio/HE519-peggy's-hill-eden-valley-riesling
  ('Henschke', 'Louis Semillon', 'Eden Valley, South Australia, Australia', 'Semillon', 'White'),  -- https://www.libertywines.co.uk/our-portfolio/HE509-louis-eden-valley-semillon
  ('Henschke', 'Hill of Peace', 'Eden Valley, South Australia, Australia', 'Semillon', 'White'),  -- https://www.winecompanion.com.au/wineries/south-australia/eden-valley/henschke
  ('Henschke', 'Abbotts Prayer Vineyard', 'Adelaide Hills, South Australia, Australia', 'Merlot, Cabernet Sauvignon', 'Red')  -- https://www.winecompanion.com.au/wineries/south-australia/eden-valley/henschke
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TYRRELL'S ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Tyrrell''s', 'Vat 1 Semillon', null, 'Semillon', 'White'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Vat 47 Chardonnay', null, 'Chardonnay', 'White'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Vat 9 Shiraz', null, 'Shiraz', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Vat 8 Shiraz Cabernet', null, 'Shiraz, Cabernet', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Vat 6 Pinot Noir', null, 'Pinot Noir', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Vat 63 Chardonnay Semillon', null, 'Chardonnay, Semillon', 'White'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'HVD Semillon', null, 'Semillon', 'White'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'HVD Chardonnay', null, 'Chardonnay', 'White'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Belford Semillon', null, 'Semillon', 'White'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Stevens Semillon', null, 'Semillon', 'White'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Johnno''s Semillon', null, 'Semillon', 'White'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', '4 Acres Shiraz', null, 'Shiraz', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', '8 Acres Shiraz', null, 'Shiraz', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Old Patch Shiraz', null, 'Shiraz', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Stevens Shiraz', null, 'Shiraz', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Rufus Stone Heathcote Shiraz', 'Heathcote, Victoria, Australia', 'Shiraz', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Lunatiq Heathcote Shiraz', 'Heathcote, Victoria, Australia', 'Shiraz', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Vineyard Selection Semillon', null, 'Semillon', 'White'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Vineyard Selection Shiraz', null, 'Shiraz', 'Red'),  -- https://www.tyrrells.com.au/wines
  ('Tyrrell''s', 'Old Winery Chardonnay', null, 'Chardonnay', 'White')  -- https://www.tyrrells.com.au/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MCGUIGAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('McGuigan', 'Bin 9000 Semillon', 'Hunter Valley, New South Wales, Australia', 'Semillon', 'White'),  -- https://mcguiganwines.com.au/shop/shop-by-range/bin-9000/2025-mcguigan-bin-9000-semillon/1214680.html
  ('McGuigan', 'Black Label Shiraz', null, 'Shiraz', 'Red'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Red', null, null, 'Red'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Malbec', null, 'Malbec', 'Red'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Tempranillo', null, 'Tempranillo', 'Red'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Sauvignon Blanc', null, 'Sauvignon Blanc', 'White'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Pinot Grigio', null, 'Pinot Grigio', 'White'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Verdelho', null, 'Verdelho', 'White'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Moscato', null, 'Moscato', 'White'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Sparkling Shiraz', null, 'Shiraz', 'Sparkling'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'Black Label Chardonnay Pinot Noir Bubbles', null, 'Chardonnay, Pinot Noir', 'Sparkling'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/black-label/
  ('McGuigan', 'The Shortlist Riesling', null, 'Riesling', 'White'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/the-shortlist/
  ('McGuigan', 'Personal Reserve Shiraz', null, 'Shiraz', 'Red'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/personal-reserve/
  ('McGuigan', 'Personal Reserve Chardonnay', null, 'Chardonnay', 'White'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/personal-reserve/
  ('McGuigan', 'Personal Reserve Coonawarra Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/personal-reserve/
  ('McGuigan', 'Personal Reserve Bainton Vineyard Shiraz', null, 'Shiraz', 'Red'),  -- https://www.mcguiganwines.com.au/shop/shop-by-range/personal-reserve/
  ('McGuigan', 'Personal Reserve Tawny', null, null, 'Fortified')  -- https://www.mcguiganwines.com.au/shop/shop-by-range/personal-reserve/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BROWN BROTHERS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Brown Brothers', 'Patricia Pinot Noir & Chardonnay Brut', 'King Valley, Victoria, Australia', 'Pinot Noir, Chardonnay', 'Sparkling'),  -- https://www.brownbrothers.com.au/our-wines/ranges-patricia
  ('Brown Brothers', 'Patricia Shiraz', 'Victoria, Australia', 'Shiraz', 'Red'),  -- https://www.brownbrothers.com.au/our-wines/ranges-patricia
  ('Brown Brothers', 'Patricia Cabernet Sauvignon', 'Victoria, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.brownbrothers.com.au/our-wines/ranges-patricia
  ('Brown Brothers', 'Classic Pinot Grigio', null, 'Pinot Grigio', 'White'),  -- https://www.brownbrothers.com.au/our-wines/ranges-classic
  ('Brown Brothers', 'Classic Dry Rosé', null, null, 'Rosé'),  -- https://www.brownbrothers.com.au/our-wines/ranges-classic
  ('Brown Brothers', 'Classic Pinot Noir', null, 'Pinot Noir', 'Red'),  -- https://www.brownbrothers.com.au/our-wines/ranges-classic
  ('Brown Brothers', 'Classic Sauvignon Blanc', null, 'Sauvignon Blanc', 'White'),  -- https://www.brownbrothers.com.au/our-wines/ranges-classic
  ('Brown Brothers', 'Classic Shiraz', 'Heathcote, Victoria, Australia', 'Shiraz', 'Red'),  -- https://www.brownbrothers.com.au/our-wines/ranges-classic
  ('Brown Brothers', 'Classic Chardonnay', null, 'Chardonnay', 'White'),  -- https://www.brownbrothers.com.au/our-wines/ranges-classic
  ('Brown Brothers', 'Classic Fiano', null, 'Fiano', 'White'),  -- https://www.brownbrothers.com.au/our-wines/ranges-classic
  ('Brown Brothers', 'Classic Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://www.brownbrothers.com.au/our-wines/ranges-classic
  ('Brown Brothers', 'Moscato', null, 'Moscato', 'White'),  -- https://www.brownbrothers.com.au/our-wines/varietals-moscato
  ('Brown Brothers', 'Sparkling Moscato', null, 'Moscato', 'Sparkling'),  -- https://www.brownbrothers.com.au/our-wines/varietals-moscato
  ('Brown Brothers', 'Moscato Rosé', null, 'Moscato', 'Rosé'),  -- https://www.brownbrothers.com.au/our-wines/varietals-moscato
  ('Brown Brothers', 'Sparkling Moscato Rosé', null, 'Moscato', 'Sparkling'),  -- https://www.brownbrothers.com.au/our-wines/varietals-moscato
  ('Brown Brothers', 'King Valley Prosecco', 'King Valley, Victoria, Australia', 'Prosecco', 'Sparkling'),  -- https://www.brownbrothers.com.au/our-wines/varietals-prosecco
  ('Brown Brothers', 'Prosecco Brut Reserve', 'King Valley, Victoria, Australia', 'Prosecco', 'Sparkling'),  -- https://www.brownbrothers.com.au/our-wines/varietals-prosecco
  ('Brown Brothers', 'King Valley Prosecco Rosé', 'King Valley, Victoria, Australia', 'Prosecco', 'Sparkling'),  -- https://www.brownbrothers.com.au/our-wines/varietals-prosecco
  ('Brown Brothers', 'Cienna', null, 'Sumoll, Cabernet Sauvignon', 'Red')  -- https://www.brownbrothers.com.au/our-wines/varietals-cienna
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TAYLORS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Taylors', 'Estate Label Shiraz', null, 'Shiraz', 'Red'),  -- https://www.taylorswines.com.au/products/estate-shiraz-2024-taylors-750-6-dom-s
  ('Taylors', 'Estate Label Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://www.taylorswines.com.au/products/estate-cabernet-sauvignon-2024-taylors-750-6
  ('Taylors', 'Estate Label Merlot', null, 'Merlot', 'Red'),  -- https://www.taylorswines.com.au/products/estate-merlot-2025-taylors-750-6-dom
  ('Taylors', 'Estate Label Pinot Noir', null, 'Pinot Noir', 'Red'),  -- https://www.taylorswines.com.au/products/estate-pinot-noir-2025-taylors-750-6-dom
  ('Taylors', 'Estate Label Pinot Gris', null, 'Pinot Gris', 'White'),  -- https://www.taylorswines.com.au/products/estate-pinot-gris-2026-taylors-750-6-dom-s
  ('Taylors', 'Estate Label Sauvignon Blanc', null, 'Sauvignon Blanc', 'White'),  -- https://www.taylorswines.com.au/products/estate-sauvignon-blanc-2025-taylors-750-6-dom
  ('Taylors', 'Estate Label Riesling', null, 'Riesling', 'White'),  -- https://www.taylorswines.com.au/products/estate-riesling-2026-taylors-750-6-dom
  ('Taylors', 'Estate Label Chardonnay', null, 'Chardonnay', 'White'),  -- https://www.taylorswines.com.au/products/estate-label-chardonnay-2025
  ('Taylors', 'Estate Label Rosé', null, null, 'Rosé'),  -- https://www.taylorswines.com.au/products/estate-rose-2026-taylors-750-6-dom
  ('Taylors', 'St Andrews Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.taylorswines.com.au/products/st-andrews-shiraz-2021-taylors-750-6-dom-s
  ('Taylors', 'St Andrews Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.taylorswines.com.au/products/st-andrews-cabernet-sauvignon-2021-taylors-750-6-dom
  ('Taylors', 'St Andrews Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.taylorswines.com.au/products/st-andrews-riesling-2026-taylors-750-6-dom
  ('Taylors', 'St Andrews Chardonnay', 'Clare Valley, South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.taylorswines.com.au/products/st-andrews-taylors-chardonnay-2024-750-6-dom
  ('Taylors', 'Jaraman Shiraz', null, 'Shiraz', 'Red'),  -- https://www.taylorswines.com.au/products/jaraman-shiraz-taylors-2025-750-6-dom
  ('Taylors', 'Jaraman Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://www.taylorswines.com.au/products/jaraman-cabernet-sauvignon-2024-taylors-750-6-dom
  ('Taylors', 'Masterstroke Shiraz', null, 'Shiraz', 'Red'),  -- https://www.taylorswines.com.au/products/masterstroke-shiraz-2022-taylors-750-6-dom
  ('Taylors', 'Masterstroke Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://www.taylorswines.com.au/products/masterstroke-cabernet-sauvignon-2021-taylors-750-6-dom-s
  ('Taylors', 'The Pioneer Shiraz', null, 'Shiraz', 'Red'),  -- https://www.taylorswines.com.au/products/the-pioneer-shiraz-2019-750-3-dom
  ('Taylors', 'The Visionary Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://www.taylorswines.com.au/products/the-visionary-cabernet-sauvignon-2019-taylors-750-3-dom
  ('Taylors', 'The Legacy Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Cabernet Sauvignon', 'Red')  -- https://www.taylorswines.com.au/products/the-legacy-cabernet-sauvignon-taylors-2018-dom
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PETER LEHMANN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Peter Lehmann', 'Stonewell Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.peterlehmannwines.com/products/2019-stonewell-shiraz
  ('Peter Lehmann', 'VSV 1893 Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.peterlehmannwines.com/products/2022-vsv-1893-shiraz
  ('Peter Lehmann', 'VSV Rohrlach Old Vine Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.peterlehmannwines.com/products/2023-vsv-rohrlach-old-vine-shiraz
  ('Peter Lehmann', 'VSV Ruediger Cabernet Sauvignon', 'Barossa, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.peterlehmannwines.com/products/2023-vsv-ruediger-cab-sauvignon
  ('Peter Lehmann', 'Eight Songs Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.peterlehmannwines.com/products/2022-masters-eight-songs-shiraz
  ('Peter Lehmann', 'Mentor Cabernet Sauvignon', 'Barossa, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.peterlehmannwines.com/products/2022-masters-mentor-cabernet-sauvignon
  ('Peter Lehmann', 'Margaret Semillon', 'Barossa, South Australia, Australia', 'Semillon', 'White'),  -- https://www.peterlehmannwines.com/products/2018-masters-margaret-semillon
  ('Peter Lehmann', 'Wigan Riesling', null, 'Riesling', 'White'),  -- https://www.peterlehmannwines.com/products/2019-masters-wigan-riesling
  ('Peter Lehmann', 'The Barossan Cabernet Sauvignon', 'Barossa, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.peterlehmannwines.com/products/2023-the-barossan-cabernet-sauvignon
  ('Peter Lehmann', 'The Bond Shiraz', null, 'Shiraz', 'Red'),  -- https://www.peterlehmannwines.com/products/2024-the-bond-shiraz
  ('Peter Lehmann', 'Portrait Shiraz', null, 'Shiraz', 'Red'),  -- https://www.peterlehmannwines.com/products/2023-portrait-shiraz-1
  ('Peter Lehmann', 'Portrait Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://www.peterlehmannwines.com/products/2022-portrait-cabernet-sauvignon-1
  ('Peter Lehmann', 'Portrait Eden Valley Riesling', 'Eden Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.peterlehmannwines.com/products/2026-portrait-eden-valley-riesling
  ('Peter Lehmann', 'Portrait Chardonnay', null, 'Chardonnay', 'White'),  -- https://www.peterlehmannwines.com/products/2025-portrait-chardonnay
  ('Peter Lehmann', 'Portrait Sauvignon Blanc', 'Adelaide Hills, South Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://winecompanion.com.au/wineries/south-australia/barossa-valley/peter-lehmann
  ('Peter Lehmann', 'Hill & Valley Chardonnay', null, 'Chardonnay', 'White'),  -- https://www.peterlehmannwines.com/products/2024-hill-valley-chardonnay
  ('Peter Lehmann', 'Hill & Valley Shiraz', null, 'Shiraz', 'Red'),  -- https://www.peterlehmannwines.com/products/2023-hill-valley-shiraz
  ('Peter Lehmann', 'Hill & Valley Pinot Noir', 'Adelaide Hills, South Australia, Australia', 'Pinot Noir', 'Red'),  -- https://www.peterlehmannwines.com/products/2025-hill-valley-pinot-noir
  ('Peter Lehmann', 'The Queen Sparkling Shiraz', null, 'Shiraz', 'Sparkling'),  -- https://www.peterlehmannwines.com/products/2021-the-queen-sparkling-shiraz
  ('Peter Lehmann', 'The King Vintage Port', null, null, 'Fortified')  -- https://www.peterlehmannwines.com/products/2021-the-king-vintage-port
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LEEUWIN ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Leeuwin Estate', 'Art Series Chardonnay', 'Margaret River, Western Australia, Australia', 'Chardonnay', 'White'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Art Series Cabernet Sauvignon', 'Margaret River, Western Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Art Series Riesling', 'Margaret River, Western Australia, Australia', 'Riesling', 'White'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Art Series Sauvignon Blanc', 'Margaret River, Western Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Art Series Shiraz', 'Margaret River, Western Australia, Australia', 'Shiraz', 'Red'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Prelude Vineyards Chardonnay', 'Margaret River, Western Australia, Australia', 'Chardonnay', 'White'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Prelude Vineyards Cabernet Sauvignon', 'Margaret River, Western Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Siblings Sauvignon Blanc', 'Margaret River, Western Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Siblings Shiraz', 'Margaret River, Western Australia, Australia', 'Shiraz', 'Red'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Classic Dry White', 'Margaret River, Western Australia, Australia', null, 'White'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Brut', null, 'Chardonnay, Pinot Noir', 'Sparkling'),  -- https://www.leeuwinestate.com.au/shop
  ('Leeuwin Estate', 'Rosé', null, null, 'Rosé')  -- https://www.leeuwinestate.com.au/shop
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VASSE FELIX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Vasse Felix', 'Tom Cullity', 'Margaret River, Western Australia, Australia', null, 'Red'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Heytesbury Chardonnay', 'Margaret River, Western Australia, Australia', 'Chardonnay', 'White'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Cabernet Sauvignon', 'Margaret River, Western Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Chardonnay', 'Margaret River, Western Australia, Australia', 'Chardonnay', 'White'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Syrah', 'Margaret River, Western Australia, Australia', 'Syrah', 'Red'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Sauvignon Blanc', 'Margaret River, Western Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Filius Cabernet Sauvignon', 'Margaret River, Western Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Filius Chardonnay', 'Margaret River, Western Australia, Australia', 'Chardonnay', 'White'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Filius Shiraz', 'Margaret River, Western Australia, Australia', 'Shiraz', 'Red'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Filius Sauvignon Blanc', 'Margaret River, Western Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Cane Cut Semillon', 'Margaret River, Western Australia, Australia', 'Semillon', 'White'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Classic Dry White', 'Margaret River, Western Australia, Australia', null, 'White'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Classic Dry Rosé', 'Margaret River, Western Australia, Australia', null, 'Rosé'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Classic Dry Red', 'Margaret River, Western Australia, Australia', null, 'Red'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Idée Fixe Premier Brut', null, null, 'Sparkling'),  -- https://www.vassefelix.com.au/store
  ('Vasse Felix', 'Idée Fixe Brut Rosé', null, null, 'Sparkling')  -- https://www.vassefelix.com.au/store
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAPE MENTELLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Cape Mentelle', 'Cabernet Sauvignon', 'Margaret River, Western Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Shiraz', 'Margaret River, Western Australia, Australia', 'Shiraz', 'Red'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Zinfandel', 'Margaret River, Western Australia, Australia', 'Zinfandel', 'Red'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Heritage Cabernet Sauvignon', 'Margaret River, Western Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Heritage Chardonnay', 'Margaret River, Western Australia, Australia', 'Chardonnay', 'White'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Brooks Chardonnay', 'Margaret River, Western Australia, Australia', 'Chardonnay', 'White'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Brooks Sauvignon Blanc Semillon', 'Margaret River, Western Australia, Australia', 'Sauvignon Blanc, Semillon', 'White'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Single Site Block 10 Chardonnay', 'Margaret River, Western Australia, Australia', 'Chardonnay', 'White'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Sixteen Hectares Rosé', 'Margaret River, Western Australia, Australia', null, 'Rosé'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Trinders Cabernet Merlot', 'Margaret River, Western Australia, Australia', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Wallcliffe Cabernet Franc', 'Margaret River, Western Australia, Australia', 'Cabernet Franc', 'Red'),  -- https://www.capementelle.com.au/product-listing/
  ('Cape Mentelle', 'Wallcliffe Sauvignon Blanc', 'Margaret River, Western Australia, Australia', 'Sauvignon Blanc', 'White')  -- https://www.capementelle.com.au/product-listing/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TORBRECK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Torbreck', 'The Laird', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://torbreck.com/products/2021-the-laird
  ('Torbreck', 'The Forebear', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://torbreck.com/products/2021-the-forebear
  ('Torbreck', 'RunRig', 'Barossa Valley, South Australia, Australia', 'Shiraz, Viognier', 'Red'),  -- https://torbreck.com/products/2023-runrig
  ('Torbreck', 'Descendant', 'Barossa Valley, South Australia, Australia', null, 'Red'),  -- https://torbreck.com/products/2023-descendant
  ('Torbreck', 'The Factor', 'Barossa Valley, South Australia, Australia', null, 'Red'),  -- https://torbreck.com/products/2023-the-factor
  ('Torbreck', 'Les Amis', 'Barossa Valley, South Australia, Australia', 'Grenache', 'Red'),  -- https://torbreck.com/products/2023-les-amis
  ('Torbreck', 'The Pict', 'Barossa Valley, South Australia, Australia', 'Mataro', 'Red'),  -- https://torbreck.com/products/2023-the-pict
  ('Torbreck', 'The Steading', 'Barossa Valley, South Australia, Australia', null, 'Red'),  -- https://torbreck.com/products/2024-the-steading
  ('Torbreck', 'The Steading Blanc', 'Barossa Valley, South Australia, Australia', null, 'White'),  -- https://torbreck.com/products/2024-the-steading-blanc
  ('Torbreck', 'The Struie', 'Barossa, South Australia, Australia', null, 'Red'),  -- https://torbreck.com/products/2024-the-struie
  ('Torbreck', 'The Gask', 'Barossa, South Australia, Australia', null, 'Red'),  -- https://torbreck.com/products/2024-the-gask
  ('Torbreck', 'Cuvée Juveniles', 'Barossa Valley, South Australia, Australia', null, 'Red'),  -- https://torbreck.com/products/2024-cuvee-juveniles
  ('Torbreck', 'Cuvée Juveniles Blanc', 'Barossa Valley, South Australia, Australia', null, 'White'),  -- https://torbreck.com/products/2026-cuvee-juveniles-blanc
  ('Torbreck', 'Woodcutter''s Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://torbreck.com/products/2025-woodcutters-shiraz
  ('Torbreck', 'Woodcutter''s Semillon', 'Barossa Valley, South Australia, Australia', 'Semillon', 'White'),  -- https://torbreck.com/products/2026-woodcutters-semillon
  ('Torbreck', 'Woodcutter''s Rosé', 'Barossa Valley, South Australia, Australia', null, 'Rosé'),  -- https://torbreck.com/products/2026-woodcutter-s-rose
  ('Torbreck', 'Kyloe Mataro', 'Barossa Valley, South Australia, Australia', 'Mataro', 'Red'),  -- https://torbreck.com/products/2024-kyloe-mataro
  ('Torbreck', 'Hillside Vineyard Grenache', 'Barossa Valley, South Australia, Australia', 'Grenache', 'Red'),  -- https://torbreck.com/products/2024-hillside-vineyard-grenache
  ('Torbreck', 'Hillside Vineyard Shiraz Roussanne', 'Barossa Valley, South Australia, Australia', 'Shiraz, Roussanne', 'Red')  -- https://torbreck.com/products/2024-hillside-vineyard-shiraz-roussanne
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TWO HANDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Two Hands', 'Bella''s Garden Barossa Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2023-bellas-garden-barossa-shiraz
  ('Two Hands', 'Lily''s Garden McLaren Vale Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2023-lilys-garden-mclaren-vale-shiraz
  ('Two Hands', 'Charlie''s Garden Eden Valley Shiraz', 'Eden Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2023-charlies-garden-eden-valley-shiraz
  ('Two Hands', 'Max''s Garden Heathcote Shiraz', 'Heathcote, Victoria, Australia', 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2023-maxs-garden-heathcote-shiraz
  ('Two Hands', 'Samantha''s Garden Clare Valley Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2023-samanthas-garden-clare-valley-shiraz
  ('Two Hands', 'Ares Barossa Valley Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2021-ares-barossa-valley-shiraz
  ('Two Hands', 'Aphrodite Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://www.twohandswines.com/products/2021-aphrodite-cabernet-sauvignon
  ('Two Hands', 'Aerope Barossa Grenache', 'Barossa, South Australia, Australia', 'Grenache', 'Red'),  -- https://www.twohandswines.com/products/2021-aerope-barossa-grenache
  ('Two Hands', 'My Hands Barossa Valley Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2019-my-hands-barossa-valley-shiraz
  ('Two Hands', 'Gnarly Dudes Shiraz', null, 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2025-gnarly-dudes-shiraz
  ('Two Hands', 'Angels'' Share McLaren Vale Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2025-angels-share-mclaren-vale-shiraz
  ('Two Hands', 'Sexy Beast Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://www.twohandswines.com/products/2024-sexy-beast-cabernet-sauvignon
  ('Two Hands', 'Brave Faces Grenache Mourvèdre Shiraz', null, 'Grenache, Mourvèdre, Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2024-brave-faces
  ('Two Hands', 'Fields of Joy Clare Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.twohandswines.com/products/2025-fields-of-joy-shiraz
  ('Two Hands', 'Yesterdays Hero Grenache', null, 'Grenache', 'Red'),  -- https://www.twohandswines.com/products/2025-yesterdays-hero-grenache
  ('Two Hands', 'Trusty Rusty Grenache Rosé', null, 'Grenache', 'Rosé'),  -- https://www.twohandswines.com/products/2026-trusty-rusty-grenache-rose
  ('Two Hands', 'The Boy Eden Valley Riesling', 'Eden Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.twohandswines.com/products/2026-the-boy-eden-valley-riesling
  ('Two Hands', 'Hell Freezes Over Chardonnay', null, 'Chardonnay', 'White'),  -- https://www.twohandswines.com/products/2022-hell-freezes-over-chardonnay
  ('Two Hands', 'Lucky Duck Sparkling Blanc de Noir', null, null, 'Sparkling'),  -- https://www.twohandswines.com/products/2020-lucky-duck-sparkling-pinot-noir
  ('Two Hands', 'Wanderlust Cabernet Sauvignon Petit Verdot', null, 'Cabernet Sauvignon, Petit Verdot', 'Red')  -- https://www.twohandswines.com/products/2022-wanderlust-cabernet-sauvignon-petit-verdot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- 19 CRIMES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('19 Crimes', 'Red Blend', null, null, 'Red'),  -- https://19crimes.com/products/19-crimes-red-blend-nv
  ('19 Crimes', 'Shiraz', null, 'Shiraz', 'Red'),  -- https://19crimes.com/products/19-crimes-shiraz-nv
  ('19 Crimes', 'Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://19crimes.com/products/19-crimes-cabernet-sauvignon-nv
  ('19 Crimes', 'The Banished Dark Red', null, null, 'Red'),  -- https://19crimes.com/products/19-crimes-the-banished-dark-red-nv
  ('19 Crimes', 'The Warden Red Blend', null, null, 'Red'),  -- https://19crimes.com/products/19-crimes-the-warden-red-blend-22
  ('19 Crimes', 'Uprising Red Blend', null, null, 'Red'),  -- https://19crimes.com/products/19-crimes-uprising-red-blend-1
  ('19 Crimes', 'Pinot Noir', null, 'Pinot Noir', 'Red'),  -- https://19crimes.com/products/19-crimes-pinot-noir-25
  ('19 Crimes', 'Hard Chard', null, 'Chardonnay', 'White'),  -- https://19crimes.com/products/19-crimes-hard-chard-25
  ('19 Crimes', 'Sauv Block', null, 'Sauvignon Blanc', 'White'),  -- https://19crimes.com/products/19-crimes-sauv-block-25
  ('19 Crimes', 'Snoop Dogg Cali Rosé', null, null, 'Rosé'),  -- https://19crimes.com/products/19-crimes-snoop-dogg-cali-rose-copy
  ('19 Crimes', 'Snoop Dogg Cali Gold', null, null, 'Sparkling')  -- https://19crimes.com/products/19-crimes-snoop-dogg-cali-gold-copy
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WIRRA WIRRA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Wirra Wirra', 'Church Block Cabernet Sauvignon Shiraz Merlot', 'McLaren Vale, South Australia, Australia', 'Cabernet Sauvignon, Shiraz, Merlot', 'Red'),  -- https://wirrawirra.com/products/2023-church-block-cabernet-sauvignon-shiraz-merlot
  ('Wirra Wirra', 'RSW Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://wirrawirra.com/products/2023-rsw-shiraz-750ml
  ('Wirra Wirra', 'The Angelus Cabernet Sauvignon', 'McLaren Vale, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://wirrawirra.com/products/2023-the-angelus-750ml
  ('Wirra Wirra', 'Woodhenge', 'McLaren Vale, South Australia, Australia', null, 'Red'),  -- https://wirrawirra.com/products/2023-woodhenge
  ('Wirra Wirra', 'Catapult Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://wirrawirra.com/products/2025-catapult-shiraz
  ('Wirra Wirra', 'Chook Block Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://wirrawirra.com/products/2022-chook-block-shiraz
  ('Wirra Wirra', 'House Block Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://wirrawirra.com/products/2022-house-block-shiraz
  ('Wirra Wirra', 'The Holy Thirst Cabernet Shiraz', 'McLaren Vale, South Australia, Australia', 'Cabernet, Shiraz', 'Red'),  -- https://wirrawirra.com/products/2022-the-holy-thirst-cabernet-shiraz
  ('Wirra Wirra', 'Church Block Grenache Shiraz', 'McLaren Vale, South Australia, Australia', 'Grenache, Shiraz', 'Red'),  -- https://wirrawirra.com/products/2025-church-block-grenache-shiraz
  ('Wirra Wirra', 'The Absconder Grenache', 'McLaren Vale, South Australia, Australia', 'Grenache', 'Red'),  -- https://wirrawirra.com/products/2025-the-absconder-grenache
  ('Wirra Wirra', 'Farmer''s Heart Grenache', 'McLaren Vale, South Australia, Australia', 'Grenache', 'Red'),  -- https://wirrawirra.com/products/2025-farmers-heart-grenache
  ('Wirra Wirra', 'Single Vineyard Blagrove Grenache', 'McLaren Vale, South Australia, Australia', 'Grenache', 'Red'),  -- https://wirrawirra.com/products/2025-single-vineyard-blagrove-grenache
  ('Wirra Wirra', 'Bell Tower Single Vineyard Touriga Tempranillo', 'McLaren Vale, South Australia, Australia', 'Touriga, Tempranillo', 'Red'),  -- https://wirrawirra.com/products/2025-bell-tower-single-vineyard-touriga-tempranillo
  ('Wirra Wirra', 'Hickinbotham Single Vineyard Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://wirrawirra.com/products/2025-hickinbotham-single-vineyard-cabernet-sauvignon
  ('Wirra Wirra', 'Dry Grenache Rosé', 'McLaren Vale, South Australia, Australia', 'Grenache', 'Rosé'),  -- https://wirrawirra.com/products/2025-dry-grenache-rose
  ('Wirra Wirra', 'The 12th Man Chardonnay', null, 'Chardonnay', 'White'),  -- https://wirrawirra.com/products/2025-the-12th-man-chardonnay
  ('Wirra Wirra', 'Single Vineyard Yandra Chardonnay', null, 'Chardonnay', 'White'),  -- https://wirrawirra.com/products/2025-single-vineyard-yandra-chardonnay
  ('Wirra Wirra', 'Hiding Champion Sauvignon Blanc', null, 'Sauvignon Blanc', 'White'),  -- https://wirrawirra.com/products/2026-hiding-champion-sauvignon-blanc
  ('Wirra Wirra', 'The Lost Watch Riesling', null, 'Riesling', 'White')  -- https://wirrawirra.com/products/2026-the-lost-watch-riesling
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GRANT BURGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Grant Burge', 'Meshach Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://grantburgewines.com.au/products/2022-grant-burge-meshach-shiraz
  ('Grant Burge', 'Shadrach Cabernet Sauvignon', 'Barossa, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://grantburgewines.com.au/products/2013-grant-burge-shadrach-cabernet-sauvignon
  ('Grant Burge', 'Abednego', 'Barossa, South Australia, Australia', null, 'Red'),  -- https://grantburgewines.com.au/products/grant-burge-abednego-2021
  ('Grant Burge', 'Balthasar Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://grantburgewines.com.au/products/grant-burge-balthasar-shiraz-2022
  ('Grant Burge', 'Filsell Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://grantburgewines.com.au/products/grant-burge-filsell-shiraz-2023
  ('Grant Burge', 'The Holy Trinity Grenache Shiraz Mourvèdre', 'Barossa Valley, South Australia, Australia', 'Grenache, Shiraz, Mourvèdre', 'Red'),  -- https://grantburgewines.com.au/products/2023-grant-burge-the-holy-trinity-grenache-shiraz-mourvedre
  ('Grant Burge', 'Corryton Park Cabernet Sauvignon', 'Barossa, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://grantburgewines.com.au/products/grant-burge-corryton-park-cabernet-sauvignon-2022
  ('Grant Burge', 'Nebu Cabernet Sauvignon Shiraz', 'Barossa, South Australia, Australia', 'Cabernet Sauvignon, Shiraz', 'Red'),  -- https://grantburgewines.com.au/products/2017-grant-burge-nebu-cabernet-sauvignon-shiraz
  ('Grant Burge', 'Thorn Eden Valley Riesling', 'Eden Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://grantburgewines.com.au/products/grant-burge-thorn-eden-valley-riesling
  ('Grant Burge', 'East Argyle Pinot Gris', null, 'Pinot Gris', 'White'),  -- https://grantburgewines.com.au/products/grant-burge-east-argyle-pinot-gris
  ('Grant Burge', 'Fifth Generation Merlot', null, 'Merlot', 'Red'),  -- https://grantburgewines.com.au/products/grant-burge-fifth-generation-merlot-1
  ('Grant Burge', 'Pearl Chardonnay', null, 'Chardonnay', 'White'),  -- https://grantburgewines.com.au/products/grant-burge-pearl-chardonnay
  ('Grant Burge', 'Barossa Ink Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://grantburgewines.com.au/products/grant-burge-barossa-ink-shiraz-1
  ('Grant Burge', 'Midnight Ink Shiraz', null, 'Shiraz', 'Red'),  -- https://grantburgewines.com.au/products/grant-burge-midnight-ink-shiraz
  ('Grant Burge', 'Coonawarra Ink Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://grantburgewines.com.au/products/grant-burge-coonawarra-ink-cabernet-sauvignon-1
  ('Grant Burge', 'Sunset Ink Chardonnay', null, 'Chardonnay', 'White'),  -- https://grantburgewines.com.au/products/grant-burge-sunset-ink-chardonnay
  ('Grant Burge', 'Sparkling Pinot Noir Chardonnay', null, 'Pinot Noir, Chardonnay', 'Sparkling'),  -- https://grantburgewines.com.au/products/grant-burge-sparkling-pinot-noir-chardonnay-nv
  ('Grant Burge', 'Sparkling Pinot Noir Chardonnay Rosé', null, 'Pinot Noir, Chardonnay', 'Sparkling'),  -- https://grantburgewines.com.au/products/grant-burge-sparkling-pinot-noir-chardonnay-rose-nv
  ('Grant Burge', '20 Year Old Tawny', null, null, 'Fortified'),  -- https://grantburgewines.com.au/products/grant-burge-20-year-old-tawny-1
  ('Grant Burge', 'Little Kings Grenache Shiraz Mourvèdre', null, 'Grenache, Shiraz, Mourvèdre', 'Red')  -- https://grantburgewines.com.au/products/grant-burge-little-kings-grenache-shiraz-mourvedre
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROSEMOUNT ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Rosemount Estate', 'Diamond Selection Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://groceries.morrisons.com/products/rosemount-diamond-selection-shiraz/105263886
  ('Rosemount Estate', 'Diamond Label Pinot Noir Chardonnay', null, 'Pinot Noir, Chardonnay', 'Sparkling'),  -- https://theshout.com.au/rosemount-releases-new-sparkling
  ('Rosemount Estate', 'Diamond Label Pinot Grigio', null, 'Pinot Grigio', 'White'),  -- https://justwines.com.au/blog/rosemount-diamond-label-pinot-family-wines/
  ('Rosemount Estate', 'Diamond Label Pinot Noir', null, 'Pinot Noir', 'Red'),  -- https://justwines.com.au/blog/rosemount-diamond-label-pinot-family-wines/
  ('Rosemount Estate', 'Little Berry McLaren Vale Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://winecompanion.com.au/wineries/south-australia/mclaren-vale/rosemount-estate
  ('Rosemount Estate', 'GSM', 'McLaren Vale, South Australia, Australia', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://winecompanion.com.au/wineries/south-australia/mclaren-vale/rosemount-estate
  ('Rosemount Estate', 'Balmoral Shiraz', null, 'Shiraz', 'Red'),  -- https://www.vivino.com/en/wineries/rosemount
  ('Rosemount Estate', 'Show Reserve GSM', null, null, 'Red'),  -- https://www.vivino.com/en/wineries/rosemount
  ('Rosemount Estate', 'Show Reserve Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red')  -- https://www.vivino.com/en/wineries/rosemount
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JIM BARRY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Jim Barry', 'The Armagh', 'Clare Valley, South Australia, Australia', null, 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'The McRae Wood Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'The Benbournie Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Pb Shiraz Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Shiraz, Cabernet Sauvignon', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'First XI Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Spring Farm Block 73 Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Clarevale Cabernet Malbec', 'Clare Valley, South Australia, Australia', 'Cabernet, Malbec', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'St Clare Cabernet Malbec', 'Clare Valley, South Australia, Australia', 'Cabernet, Malbec', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'St Clare Malbec', 'Clare Valley, South Australia, Australia', 'Malbec', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'The Florita Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Assyrtiko', 'Clare Valley, South Australia, Australia', 'Assyrtiko', 'White'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'The Farm Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'The Farm Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'The Farm Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Cover Drive Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Barry Bros Shiraz Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Shiraz, Cabernet Sauvignon', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Lodge Hill Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Lodge Hill Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Watervale Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.jimbarry.com/wines
  ('Jim Barry', 'Annabelle''s Rosé', 'Clare Valley, South Australia, Australia', null, 'Rosé')  -- https://www.jimbarry.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SHAW + SMITH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Shaw + Smith', 'Sauvignon Blanc', 'Adelaide Hills, South Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.shawandsmith.com/store
  ('Shaw + Smith', 'Riesling', 'Adelaide Hills, South Australia, Australia', 'Riesling', 'White'),  -- https://www.shawandsmith.com/store
  ('Shaw + Smith', 'M3 Chardonnay', 'Adelaide Hills, South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.shawandsmith.com/store
  ('Shaw + Smith', 'Pinot Noir', 'Adelaide Hills, South Australia, Australia', 'Pinot Noir', 'Red'),  -- https://www.shawandsmith.com/store
  ('Shaw + Smith', 'Gamay', 'Adelaide Hills, South Australia, Australia', 'Gamay', 'Red'),  -- https://www.shawandsmith.com/store
  ('Shaw + Smith', 'Shiraz', 'Adelaide Hills, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.shawandsmith.com/store
  ('Shaw + Smith', 'Lenswood Vineyard Chardonnay', 'Adelaide Hills, South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.shawandsmith.com/store
  ('Shaw + Smith', 'Lenswood Vineyard Pinot Noir', 'Adelaide Hills, South Australia, Australia', 'Pinot Noir', 'Red'),  -- https://www.shawandsmith.com/store
  ('Shaw + Smith', 'Balhannah Vineyard Shiraz', 'Adelaide Hills, South Australia, Australia', 'Shiraz', 'Red')  -- https://www.shawandsmith.com/store
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MOLLYDOOKER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Mollydooker', 'The Violinist Verdelho', 'South Australia, Australia', 'Verdelho', 'White'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'The Scooter Merlot', 'South Australia, Australia', 'Merlot', 'Red'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'The Maitre D'' Cabernet Sauvignon', 'South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Two Left Feet Shiraz Merlot Cabernet', 'South Australia, Australia', 'Shiraz, Merlot, Cabernet', 'Red'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'The Boxer Shiraz', 'South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Miss Molly Sparkling Shiraz', 'South Australia, Australia', 'Shiraz', 'Sparkling'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Euphoria Sparkling Verdelho', 'South Australia, Australia', 'Verdelho', 'Sparkling'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Summer of ''69 Early Pick Verdelho', 'South Australia, Australia', 'Verdelho', 'White'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Serenity Merlot Rosé', 'South Australia, Australia', 'Merlot', 'Rosé'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Gigglepot Cabernet Sauvignon', 'South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Blue Eyed Boy Shiraz', 'South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Enchanted Path Shiraz Cabernet Sauvignon', 'South Australia, Australia', 'Shiraz, Cabernet Sauvignon', 'Red'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Carnival of Love Shiraz', 'South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.mollydookerwines.com/shop
  ('Mollydooker', 'Velvet Glove Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red')  -- https://www.mollydookerwines.com/shop
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KILIKANOON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_australia.sql)'
from (values
  ('Kilikanoon', 'Attunga 1865 Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://kilikanoon.com.au/products/2016-attunga-1865-shiraz
  ('Kilikanoon', 'Oracle Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://kilikanoon.com.au/products/2018-oracle-shiraz-1
  ('Kilikanoon', 'Covenant Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://kilikanoon.com.au/products/2024-covenant-shiraz
  ('Kilikanoon', 'Revelation Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://kilikanoon.com.au/products/2019-revelation-shiraz
  ('Kilikanoon', 'Prophecy Shiraz', 'Clare Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://kilikanoon.com.au/products/2022-prophecy-shiraz-dozen
  ('Kilikanoon', 'Tregea Reserve Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://kilikanoon.com.au/products/2019-tregea-reserve-cabernet-sauvignon
  ('Kilikanoon', 'Blocks Road Cabernet Sauvignon', 'Clare Valley, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://kilikanoon.com.au/products/2019-blocks-road-cabernet-sauvignon
  ('Kilikanoon', 'Baudinet GSM', 'Clare Valley, South Australia, Australia', null, 'Red'),  -- https://kilikanoon.com.au/products/2024-baudinet-gsm
  ('Kilikanoon', 'Walton 1946 Grenache', 'Clare Valley, South Australia, Australia', 'Grenache', 'Red'),  -- https://kilikanoon.com.au/products/2022-walton-1946-grenache
  ('Kilikanoon', 'Mort''s Block Watervale Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://kilikanoon.com.au/products/2024-morts-block-watervale-riesling
  ('Kilikanoon', 'Mort''s Reserve Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://kilikanoon.com.au/products/2023-morts-reserve-riesling
  ('Kilikanoon', 'Mort''s Cut Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://kilikanoon.com.au/products/2023-morts-cut-riesling
  ('Kilikanoon', 'Golden Hillside Watervale Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://kilikanoon.com.au/products/2023-golden-hillside-watervale-riesling
  ('Kilikanoon', 'Skilly Valley Pinot Gris', 'Clare Valley, South Australia, Australia', 'Pinot Gris', 'White'),  -- https://kilikanoon.com.au/products/2025-skilly-valley-pinot-gris
  ('Kilikanoon', 'Symphony Rosé', 'Clare Valley, South Australia, Australia', null, 'Rosé'),  -- https://kilikanoon.com.au/products/2025-symphony-rose
  ('Kilikanoon', 'Killerman''s Run Shiraz', null, 'Shiraz', 'Red'),  -- https://kilikanoon.com.au/products/2022-killermans-run-shiraz
  ('Kilikanoon', 'Killerman''s Run Cabernet Sauvignon', null, 'Cabernet Sauvignon', 'Red'),  -- https://kilikanoon.com.au/products/2023-killermans-run-cabernet-sauvignon
  ('Kilikanoon', 'Killerman''s Run GSM', null, null, 'Red'),  -- https://kilikanoon.com.au/products/2025-killermans-run-gsm
  ('Kilikanoon', 'Killerman''s Run Riesling', null, 'Riesling', 'White'),  -- https://kilikanoon.com.au/products/2024-killermans-run-riesling
  ('Kilikanoon', 'Killerman''s Run Pinot Gris', null, 'Pinot Gris', 'White')  -- https://kilikanoon.com.au/products/2026-killermans-run-pinot-gris
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
