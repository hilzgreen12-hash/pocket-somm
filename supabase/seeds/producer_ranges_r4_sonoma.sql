-- Producer ranges round 4: Sonoma Coast. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- PEAY VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Peay Vineyards', 'Ama Estate Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://peayvineyards.com/store
  ('Peay Vineyards', 'Pomarium Estate Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://peayvineyards.com/store
  ('Peay Vineyards', 'Scallop Shelf Estate Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://peayvineyards.com/store
  ('Peay Vineyards', 'Richardson Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://peayvineyards.com/store
  ('Peay Vineyards', 'West Sonoma Coast Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://peayvineyards.com/store
  ('Peay Vineyards', 'La Bruma Estate Syrah', 'West Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://peayvineyards.com/store
  ('Peay Vineyards', 'Les Titans Estate Syrah', 'West Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://peayvineyards.com/store
  ('Peay Vineyards', 'West Sonoma Coast Syrah', 'West Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://peayvineyards.com/store
  ('Peay Vineyards', 'Maritima Estate Chardonnay', 'West Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://peayvineyards.com/store
  ('Peay Vineyards', 'Richardson Chardonnay', 'West Sonoma Coast, California, USA', 'Chardonnay', 'White')  -- https://peayvineyards.com/store
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CEP VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Cep Vineyards', 'Estate Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://peayvineyards.com/store
  ('Cep Vineyards', 'Sonoma Coast Estate Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://peayvineyards.com/wines/cep-wines
  ('Cep Vineyards', 'Hopkins Rosé of Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Rosé'),  -- https://peayvineyards.com/wines/cep-wines
  ('Cep Vineyards', 'Hopkins Sauvignon Blanc', 'Russian River Valley, California, USA', 'Sauvignon Blanc', 'White')  -- https://peayvineyards.com/wines/cep-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RADIO-COTEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Radio-Coteau', 'Wingtine Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Heintz Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'SeaBed Sonoma Coast Estate Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Sonoma Coast Estate Riesling', 'Sonoma Coast, California, USA', 'Riesling', 'White'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'La Neblina Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Alberigi Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Dierke Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Belay Sonoma Coast Estate Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Las Colinas Sonoma Coast Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Dusty Lane Sonoma Coast Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Harrison Grade Sonoma Coast Estate Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Lemorel Sonoma Coast Estate Zinfandel', 'Sonoma Coast, California, USA', 'Zinfandel', 'Red'),  -- https://radiocoteau.com/wines/
  ('Radio-Coteau', 'Board & Batten Sonoma Coast Estate Proprietary Red', 'Sonoma Coast, California, USA', null, 'Red')  -- https://radiocoteau.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARTINELLI WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Martinelli Winery', 'Charles Ranch Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Three Sisters Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Lolita Ranch Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Martinelli Road Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Zio Tony Ranch Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Blue Slide Ridge Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Lolita Ranch Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Moonshine Ranch Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Sky Ridge Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Three Sisters Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Wild Thyme Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Bella Vigna Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Bondi Home Ranch Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Zio Tony Ranch Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Fort Ross-Seaview Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Jackass Hill Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Jackass Vineyard Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Lolita Ranch Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Vellutini Ranch Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Giuseppe & Luisa Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Vigneto di Evo Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Chico’s Hill Syrah', 'Sonoma County, California, USA', 'Syrah', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Hop Barn Hill Syrah', 'Sonoma County, California, USA', 'Syrah', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Lolita Ranch Syrah', 'Sonoma County, California, USA', 'Syrah', 'Red'),  -- https://www.martinelliwinery.com/martinelli_wines/
  ('Martinelli Winery', 'Vellutini Ranch Syrah', 'Sonoma County, California, USA', 'Syrah', 'Red')  -- https://www.martinelliwinery.com/martinelli_wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PATZ & HALL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Patz & Hall', 'Bootlegger’s Hill Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.patzhall.com/product/2023-bootleggers-hill-vineyard-chardonnay/
  ('Patz & Hall', 'Hyde Vineyard Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.patzhall.com/product/2023-hyde-vineyard-chardonnay/
  ('Patz & Hall', 'Kent Ritchie Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.patzhall.com/product/2023-kent-ritchie-vineyard-chardonnay/
  ('Patz & Hall', 'Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.patzhall.com/product/2023-sonoma-coast-chardonnay/
  ('Patz & Hall', 'Zio Tony Ranch Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.patzhall.com/product/2023-zio-tony-ranch-chardonnay/
  ('Patz & Hall', 'Bootlegger’s Hill Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.patzhall.com/product/2022-bootleggers-hill-vineyard-pinot-noir/
  ('Patz & Hall', 'Burnside Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.patzhall.com/product/2022-burnside-vineyard-pinot-noir/
  ('Patz & Hall', 'Chenoweth Ranch Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.patzhall.com/product/2022-chenoweth-ranch-pinot-noir/
  ('Patz & Hall', 'Gap’s Crown Vineyard Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.patzhall.com/product/2022-gaps-crown-vineyard-pinot-noir/
  ('Patz & Hall', 'Hyde Vineyard Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.patzhall.com/product/2022-hyde-vineyard-pinot-noir/
  ('Patz & Hall', 'Little Boot Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.patzhall.com/product/2022-little-boot-vineyard-pinot-noir/
  ('Patz & Hall', 'Moses-Hall Vineyard Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.patzhall.com/product/2022-moses-hall-vineyard-pinot-noir/
  ('Patz & Hall', 'Sanchietti Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.patzhall.com/product/2022-sanchietti-vineyard-pinot-noir/
  ('Patz & Hall', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red')  -- https://www.patzhall.com/product/2022-sonoma-coast-pinot-noir/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DUMOL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('DuMOL', 'Sonoma Coast Rosé of Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Rosé'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Sonoma Coast Chenin Blanc', 'Sonoma Coast, California, USA', 'Chenin Blanc', 'White'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Bressay Estate Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Charles Heintz Vineyard Isobel Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Highland Divide Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Wester Reach Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Lorenzo Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Estate Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Chloe Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Wildrose Estate Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Flax Estate Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Bressay Estate Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'MacIntyre Estate Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Highland Divide Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Wester Reach Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Estate Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Finn Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Dutton-Jentoft Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.dumol.com/wines/
  ('DuMOL', 'Ryan Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red')  -- https://www.dumol.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SENSES WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Senses Wines', 'Russian River Valley Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'West Sonoma Coast Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Charles Heintz Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'El Diablo Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'UV – Silver Eagle Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Tenth Stop Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'B.A. Thieriot Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Dutton Ranch Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Kanzler Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Terra de Promissio Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Dutton Bodega Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'MCM88 Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Day One Estate Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.senseswines.com/wines
  ('Senses Wines', 'Bodega Thieriot Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red')  -- https://www.senseswines.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WILLIAMS SELYEM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Williams Selyem', 'Allen Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Estate Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Bucher Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Cohn Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Lewis MacGregor Estate Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Eastside Road Neighbors Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Hirsch Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Rochioli Riverblock Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Precious Mountain Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Bacigalupi Vineyard Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Carlisle Vineyard Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Saitone Estate Vineyard Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Allen Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Lewis MacGregor Estate Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
  ('Williams Selyem', 'Estate Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White')  -- https://www.williamsselyem.com/wine-releases/fall-2026-release/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ERNEST VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Ernest Vineyards', 'Joyce Vineyard Chardonnay', 'West Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.ernestvineyards.com/wines/
  ('Ernest Vineyards', 'Cleary Ranch Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.ernestvineyards.com/wines/
  ('Ernest Vineyards', 'Bennett Valley Aligoté', 'Sonoma County, California, USA', 'Aligoté', 'White')  -- https://www.ernestvineyards.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FAILLA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Failla', 'Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://faillawines.orderport.net/wines/essentials
  ('Failla', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red')  -- https://faillawines.orderport.net/wines/essentials
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GARY FARRELL WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Gary Farrell Winery', 'Gap''s Crown Vineyard Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.garyfarrellwinery.com/product/2022-gap-s-crown-vineyard-pinot-noir/
  ('Gary Farrell Winery', 'Hallberg Vineyard Dijon Clones Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.garyfarrellwinery.com/product/2022-hallberg-vineyard-dijon-clones/
  ('Gary Farrell Winery', 'Bacigalupi Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.garyfarrellwinery.com/product/2023-bacigalupi-vineyard-chardonnay/
  ('Gary Farrell Winery', 'Fort Ross Vineyard Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.garyfarrellwinery.com/product/fort-ross-vineyard-pinot-noir/
  ('Gary Farrell Winery', 'Olivet Lane Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.garyfarrellwinery.com/product/olivet-lane-vineyard-chardonnay/
  ('Gary Farrell Winery', 'Rochioli-Allen Vineyards Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.garyfarrellwinery.com/product/rochioli-allen-vineyards-chardonnay/
  ('Gary Farrell Winery', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.garyfarrellwinery.com/product/sonoma-coast-pinot-noir/
  ('Gary Farrell Winery', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.garyfarrellwinery.com/product/russian-river-pinot-noir-case/
  ('Gary Farrell Winery', 'Russian River Valley Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White')  -- https://www.garyfarrellwinery.com/product/russian-river-chardonnay-case/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LA CREMA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('La Crema', 'Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Russian River Valley Sparkling Rosé', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Saralee''s Vineyard Blanc de Blancs', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Russian River Valley Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Fog Veil Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Saralee''s Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Sealift Vineyard Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Saralee''s Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Russian River Valley Brut Rosé', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Durell Vineyard Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Los Carneros Pinot Noir', 'Carneros, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Kelli Ann Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Bellflower Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Tidal Break Vineyard Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Nine Barrel Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Nine Barrel Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.lacrema.com/shop-wine/
  ('La Crema', 'Sonoma County Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.lacrema.com/shop-wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KENDALL-JACKSON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Kendall-Jackson', 'Cloud Landing Pinot Noir', 'Petaluma Gap, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kj.com/shop-wines/
  ('Kendall-Jackson', 'Cloud Landing Chardonnay', 'Petaluma Gap, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/shop-wines/
  ('Kendall-Jackson', 'Carneros Hills Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/shop-wines/
  ('Kendall-Jackson', 'Three Vistas Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/shop-wines/
  ('Kendall-Jackson', 'Tidal Break Vineyard Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kj.com/shop-wines/
  ('Kendall-Jackson', 'Winemaker''s Red Wine Blend', 'Sonoma County, California, USA', null, 'Red')  -- https://www.kj.com/shop-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SIDURI WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Siduri Wines', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.siduri.com/shop-wines/
  ('Siduri Wines', 'Parsons'' Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.siduri.com/shop-wines/
  ('Siduri Wines', 'Barbieri Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.siduri.com/shop-wines/
  ('Siduri Wines', 'Dutton-Perry Ranch Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.siduri.com/shop-wines/
  ('Siduri Wines', 'Sealift Vineyard Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.siduri.com/shop-wines/
  ('Siduri Wines', 'Seascape Vineyard Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.siduri.com/shop-wines/
  ('Siduri Wines', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.siduri.com/shop-wines/
  ('Siduri Wines', 'Van der Kamp Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.siduri.com/shop-wines/
  ('Siduri Wines', 'Sonoma County Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White')  -- https://www.siduri.com/shop-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- IRON HORSE VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Iron Horse Vineyards', 'Year of the Horse', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Wedding Cuvée', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Gratitude', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Classic Vintage Brut', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Ocean Reserve', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Russian River Cuvée', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Fairy Tale Cuvée', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Resilience', 'Russian River Valley, California, USA', null, 'Sparkling'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Audrey Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Rued Clone Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'UnOaked Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Heart of the Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://ironhorsevineyards.com/wine/
  ('Iron Horse Vineyards', 'Winery Block Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red')  -- https://ironhorsevineyards.com/wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DECOY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Decoy', 'Limited Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.decoywines.com/collections/decoy-all-wines
  ('Decoy', 'Limited Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.decoywines.com/collections/decoy-all-wines
  ('Decoy', 'Limited Alexander Valley Merlot', 'Sonoma County, California, USA', 'Merlot', 'Red'),  -- https://www.decoywines.com/collections/decoy-all-wines
  ('Decoy', 'Limited Alexander Valley Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.decoywines.com/collections/decoy-all-wines
  ('Decoy', 'Limited Alexander Valley Red Blend', 'Sonoma County, California, USA', null, 'Red')  -- https://www.decoywines.com/collections/decoy-all-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GLORIA FERRER CAVES & VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Gloria Ferrer Caves & Vineyards', 'Royal Cuvée', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.gloriaferrer.com/collection/all-wine-shop/
  ('Gloria Ferrer Caves & Vineyards', 'Carneros Cuvée', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.gloriaferrer.com/collection/all-wine-shop/
  ('Gloria Ferrer Caves & Vineyards', 'Blanc de Blancs Late Disgorged', 'Carneros, California, USA', null, 'Sparkling'),  -- https://www.gloriaferrer.com/collection/all-wine-shop/
  ('Gloria Ferrer Caves & Vineyards', 'Brut Rosé', 'Carneros, California, USA', null, 'Sparkling')  -- https://www.gloriaferrer.com/collection/all-wine-shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- J VINEYARDS & WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('J Vineyards & Winery', 'Blanc de Blancs', 'Sonoma County, California, USA', null, 'Sparkling'),  -- https://www.jwine.com/collection/sparkling-wines/
  ('J Vineyards & Winery', 'Blanc de Noirs', 'Sonoma County, California, USA', null, 'Sparkling'),  -- https://www.jwine.com/collection/sparkling-wines/
  ('J Vineyards & Winery', 'Late Disgorged Vintage Brut', 'Sonoma County, California, USA', null, 'Sparkling'),  -- https://www.jwine.com/collection/sparkling-wines/
  ('J Vineyards & Winery', 'Vintage Brut', 'Sonoma County, California, USA', null, 'Sparkling'),  -- https://www.jwine.com/collection/sparkling-wines/
  ('J Vineyards & Winery', 'Vintage Brut Rosé', 'Sonoma County, California, USA', null, 'Sparkling'),  -- https://www.jwine.com/collection/sparkling-wines/
  ('J Vineyards & Winery', 'XLD', 'Sonoma County, California, USA', null, 'Sparkling'),  -- https://www.jwine.com/collection/sparkling-wines/
  ('J Vineyards & Winery', 'Annapolis Ridge Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.jwine.com/collection/pinot-noir/
  ('J Vineyards & Winery', 'Barrel 16 Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.jwine.com/collection/pinot-noir/
  ('J Vineyards & Winery', 'Canfield Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.jwine.com/collection/pinot-noir/
  ('J Vineyards & Winery', 'Eastside Knoll Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.jwine.com/collection/pinot-noir/
  ('J Vineyards & Winery', 'Foggy Bend Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.jwine.com/collection/pinot-noir/
  ('J Vineyards & Winery', 'STRATA Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.jwine.com/collection/pinot-noir/
  ('J Vineyards & Winery', 'Bow Tie Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.jwine.com/collection/wines/
  ('J Vineyards & Winery', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.jwine.com/collection/pinot-noir/
  ('J Vineyards & Winery', 'Rosé of Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Rosé'),  -- https://www.jwine.com/collection/pinot-noir/
  ('J Vineyards & Winery', 'Russian River Valley Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.jwine.com/collection/white/
  ('J Vineyards & Winery', 'Bow Tie Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.jwine.com/collection/white/
  ('J Vineyards & Winery', 'STRATA Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.jwine.com/collection/white/
  ('J Vineyards & Winery', 'Estate Pinot Gris', 'Sonoma County, California, USA', 'Pinot Gris', 'White'),  -- https://www.jwine.com/collection/white/
  ('J Vineyards & Winery', 'Daybloom', 'Sonoma County, California, USA', null, 'White')  -- https://www.jwine.com/collection/white/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LANDMARK VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Landmark Vineyards', 'Overlook Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.landmarkwine.com/product/2017-overlook-chardonnay-750-lmchs0175017
  ('Landmark Vineyards', 'Grand Detour Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.landmarkwine.com/product/2021-grand-detour-pinot-noir
  ('Landmark Vineyards', 'Hop Kiln Estate Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.landmarkwine.com/product/2021-hop-kiln-estate-pinot-noir
  ('Landmark Vineyards', 'Lorenzo Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.landmarkwine.com/product/2021-lorenzo-chardonnay
  ('Landmark Vineyards', 'Rayhill Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.landmarkwine.com/product/2021-rayhill-pinot-noir
  ('Landmark Vineyards', 'Rodgers Creek Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.landmarkwine.com/product/2021-rodgers-creek-chardonnay
  ('Landmark Vineyards', 'Sangiacomo Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.landmarkwine.com/product/2021-sangiacomo-chardonnay
  ('Landmark Vineyards', 'Hop Kiln Estate Reserve Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.landmarkwine.com/product/2022-hop-kiln-estate-reserve-pinot-noir
  ('Landmark Vineyards', 'Starr Ridge Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.landmarkwine.com/product/2022-starr-ridge-vineyard-chardonnay-750
  ('Landmark Vineyards', 'Damaris Reserve Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.landmarkwine.com/product/2023-damaris-reserve-chardonnay-750
  ('Landmark Vineyards', 'Flocchini Chardonnay', 'Petaluma Gap, California, USA', 'Chardonnay', 'White'),  -- https://www.landmarkwine.com/product/2024-flocchini-chardonnay-750ml
  ('Landmark Vineyards', 'Pinot Gris', 'Russian River Valley, California, USA', 'Pinot Gris', 'White'),  -- https://www.landmarkwine.com/product/2025-pinot-gris-750ml
  ('Landmark Vineyards', 'Steel Plow Grenache', 'Sonoma County, California, USA', 'Grenache', 'Red'),  -- https://www.landmarkwine.com/product/2025-steel-plow-grenache-750ml
  ('Landmark Vineyards', 'Steel Plow Rosé', 'Sonoma County, California, USA', null, 'Rosé')  -- https://www.landmarkwine.com/product/2025-steel-plow-rose-750ml
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HARTFORD FAMILY WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Hartford Family Winery', 'Dina''s Vineyard Zinfandel', 'Russian River Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Fanucchi-Wood Road Vineyard Zinfandel', 'Russian River Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Fog Dance Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Fog Dance Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Hartford Vineyard Zinfandel', 'Russian River Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Highwire Vineyard Zinfandel', 'Russian River Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Jennifer''s Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Jennifer''s Vineyard Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Jolene’s Vineyard Zinfandel', 'Russian River Valley, California, USA', 'Zinfandel', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'MacLean''s Block Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Three Jacks Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Outer Limits Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Seascape Vineyard Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Stone Côte Vineyard Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Morning Chorus Grenache', 'Sonoma County, California, USA', 'Grenache', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Far Coast Vineyard Chardonnay', 'West Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Far Coast Vineyard Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.hartfordwines.com/wines/
  ('Hartford Family Winery', 'Seascape Vineyard Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red')  -- https://www.hartfordwines.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COPAIN WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Copain Wine Cellars', 'Estate Trousseau Noir', 'Russian River Valley, California, USA', 'Trousseau', 'Red'),  -- https://www.copainwines.com/cpw-our-wines/
  ('Copain Wine Cellars', 'Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.copainwines.com/cpw-our-wines/
  ('Copain Wine Cellars', 'Cote Bannie Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.copainwines.com/cpw-our-wines/
  ('Copain Wine Cellars', 'Daybreak Sparkling Wine', 'Sonoma Coast, California, USA', null, 'Sparkling'),  -- https://www.copainwines.com/cpw-our-wines/
  ('Copain Wine Cellars', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.copainwines.com/cpw-our-wines/
  ('Copain Wine Cellars', 'SeaLift Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://www.copainwines.com/cpw-our-wines/
  ('Copain Wine Cellars', 'Sealift Vineyard Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.copainwines.com/cpw-our-wines/
  ('Copain Wine Cellars', 'Tidal Break Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.copainwines.com/cpw-our-wines/
  ('Copain Wine Cellars', 'Daybreak White Blend', 'Sonoma County, California, USA', null, 'White'),  -- https://www.copainwines.com/cpw-our-wines/
  ('Copain Wine Cellars', 'Sparkling Cuvée', 'Sonoma County, California, USA', null, 'Sparkling')  -- https://www.copainwines.com/cpw-our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FREEMAN WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Freeman Winery', 'Yu-ki Estate Brut Rosé', 'Sonoma County, California, USA', null, 'Sparkling'),  -- https://www.freemanwinery.com/wine/overview
  ('Freeman Winery', 'Ryo-fu Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.freemanwinery.com/wine/overview
  ('Freeman Winery', 'Hawk Hill Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.freemanwinery.com/wine/overview
  ('Freeman Winery', 'Heintz Ranch Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.freemanwinery.com/wine/overview
  ('Freeman Winery', 'Akiko’s Cuvée Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.freemanwinery.com/wine/overview
  ('Freeman Winery', 'Yu-ki Estate Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.freemanwinery.com/wine/overview
  ('Freeman Winery', 'Gloria Estate Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.freemanwinery.com/wine/overview
  ('Freeman Winery', 'West Sonoma Coast Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.freemanwinery.com/wine/overview
  ('Freeman Winery', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.freemanwinery.com/wine/overview
  ('Freeman Winery', 'KR Ranch Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red')  -- https://www.freemanwinery.com/wine/overview
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MERRY EDWARDS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Merry Edwards Winery', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://merryedwards.com/eu-ingredients/2023-russian-river-valley-pinot-noir/
  ('Merry Edwards Winery', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://merryedwards.com/eu-ingredients/2023-sonoma-coast-pinot-noir/
  ('Merry Edwards Winery', 'Russian River Valley Sauvignon Blanc', 'Russian River Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://merryedwards.com/eu-ingredients/2024-russian-river-valley-sauvignon-blanc/
  ('Merry Edwards Winery', 'Olivet Lane Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://merryedwards.com/vineyards/
  ('Merry Edwards Winery', 'Meredith Estate Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red')  -- https://merryedwards.com/vineyards/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SONOMA-CUTRER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Sonoma-Cutrer', 'Founders Reserve Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Founders Reserve Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Owsley Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Vine Hill Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Vine Hill Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Les Pierres 10 Year Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Grand Cuvee Sparkling Late Disgorge', 'Sonoma County, California, USA', null, 'Sparkling'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Rosé of Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Rosé'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Les Pierres Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Wicket Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Wicket Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'The Cutrer Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Miel Late Harvest Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'Sweet'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Les Plus Haut Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Russian River Ranches Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Sonoma County Sauvignon Blanc', 'Sonoma County, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Sonoma Coast Low-Calories Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
  ('Sonoma-Cutrer', 'Amphora Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White')  -- https://www.sonomacutrer.com/sitemap_products_1.xml?from=9388345655521&to=9680207642849
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LITTORAI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Littorai', 'B.A. Thieriot Vineyard Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.littorai.com/vineyards/bathieriot
  ('Littorai', 'B.A. Thieriot Vineyard Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.littorai.com/vineyards/bathieriot
  ('Littorai', 'Charles Heintz Vineyard Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.littorai.com/vineyards/charlesheintz
  ('Littorai', 'The Haven Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.littorai.com/vineyards/haven
  ('Littorai', 'The Haven Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.littorai.com/vineyards/haven
  ('Littorai', 'Hirsch Vineyard Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.littorai.com/vineyards/hirsch
  ('Littorai', 'Mays Canyon Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.littorai.com/vineyards/mayscanyon
  ('Littorai', 'Mays Canyon Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red')  -- https://www.littorai.com/vineyards/mayscanyon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BANSHEE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Banshee', 'Storey Creek Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.bansheewines.com/wine/storey-creek-chardonnay/
  ('Banshee', 'Morning Light Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.bansheewines.com/wine/morning-light-pinot-noir-2024/
  ('Banshee', 'Morning Light Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.bansheewines.com/wine/morning-light-chardsonnay-2024/
  ('Banshee', 'Barlow Lane Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.bansheewines.com/wine/barlow-lane-pinot-noir/
  ('Banshee', 'Grand Vent Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.bansheewines.com/wine/grand-vent-pinot-noir/
  ('Banshee', 'Sonoma County Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.bansheewines.com/wine/pinot-noir/
  ('Banshee', 'Sonoma County Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.bansheewines.com/wine/chardonnay/
  ('Banshee', 'Sonoma County Rosé', 'Sonoma County, California, USA', null, 'Rosé'),  -- https://www.bansheewines.com/wine/rose/
  ('Banshee', 'Sonoma County Sauvignon Blanc', 'Sonoma County, California, USA', 'Sauvignon Blanc', 'White')  -- https://www.bansheewines.com/wine/sauvignon-blanc/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Cline Cellars', 'Shifting Tides Sauvignon Blanc', 'Sonoma County, California, USA', 'Sauvignon Blanc', 'White'),  -- https://clinecellars.com/sonoma-ava-series
  ('Cline Cellars', 'Hat Strap Chardonnay', 'Carneros, California, USA', 'Chardonnay', 'White'),  -- https://clinecellars.com/sonoma-ava-series
  ('Cline Cellars', 'Fog Swept Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://clinecellars.com/sonoma-ava-series
  ('Cline Cellars', 'Eight Spur Zinfandel', 'Sonoma County, California, USA', 'Zinfandel', 'Red'),  -- https://clinecellars.com/sonoma-ava-series
  ('Cline Cellars', 'Rock Carved Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://clinecellars.com/sonoma-ava-series
  ('Cline Cellars', 'Seven Ranchlands Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://clinecellars.com/single-vineyards-collection
  ('Cline Cellars', 'Seven Ranchlands Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://clinecellars.com/single-vineyards-collection
  ('Cline Cellars', 'Seven Ranchlands Sauvignon Blanc', 'Sonoma County, California, USA', 'Sauvignon Blanc', 'White')  -- https://clinecellars.com/single-vineyards-collection
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FLOWERS VINEYARD & WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Flowers Vineyard & Winery', 'Camp Meeting Ridge Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.flowerswinery.com/2024-estate-wines/
  ('Flowers Vineyard & Winery', 'Sea View Ridge Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.flowerswinery.com/members-only-2026/
  ('Flowers Vineyard & Winery', 'Fort Ross-Seaview Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.flowerswinery.com/members-only-2026-river/
  ('Flowers Vineyard & Winery', 'Russian River Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.flowerswinery.com/members-only-2026-ch/
  ('Flowers Vineyard & Winery', 'Sonoma Coast Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.flowerswinery.com/members-only-2026-river-ch/
  ('Flowers Vineyard & Winery', 'Almar Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.flowerswinery.com/members-only-oct-2026/
  ('Flowers Vineyard & Winery', 'Cielo Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.flowerswinery.com/site-series-allocation/
  ('Flowers Vineyard & Winery', 'Pietra Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red')  -- https://www.flowerswinery.com/site-series-allocation/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ARNOT-ROBERTS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Arnot-Roberts', 'Clajeux Vineyard Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.arnotroberts.com/vineyard/clajeux-vineyard/
  ('Arnot-Roberts', 'Clary Ranch Syrah', 'Petaluma Gap, California, USA', 'Syrah', 'Red'),  -- https://www.arnotroberts.com/vineyard/clary-ranch/
  ('Arnot-Roberts', 'Solas Vineyard Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://www.arnotroberts.com/vineyard/solas-vineyard/
  ('Arnot-Roberts', 'Heaven & Earth Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.arnotroberts.com/vineyard/heaven-and-earth/
  ('Arnot-Roberts', 'Bedrock Vineyard Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.arnotroberts.com/vineyard/bedrock-vineyard/
  ('Arnot-Roberts', 'Persia Vineyard Cabernet Franc', 'Sonoma County, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.arnotroberts.com/vineyard/persia-vineyard/
  ('Arnot-Roberts', 'Lichau Hill Vineyard Cabernet Sauvignon', 'Petaluma Gap, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.arnotroberts.com/vineyard/lichau-hill-vineyard/
  ('Arnot-Roberts', 'Que Syrah Vineyard Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://www.arnotroberts.com/vineyard/que-syrah-vineyard/
  ('Arnot-Roberts', 'Baker Lane Vineyard Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red')  -- https://www.arnotroberts.com/vineyard/baker-lane-vineyard/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ANTHILL FARMS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Anthill Farms Winery', 'Campbell Ranch Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.anthillfarms.com/vineyards
  ('Anthill Farms Winery', 'Peters Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.anthillfarms.com/vineyards
  ('Anthill Farms Winery', 'Peters Syrah', 'Sonoma Coast, California, USA', 'Syrah', 'Red'),  -- https://www.anthillfarms.com/vineyards
  ('Anthill Farms Winery', 'Peugh Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White')  -- https://www.anthillfarms.com/vineyards
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WAYFARER VINEYARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Wayfarer Vineyard', 'The Estate Syrah', 'Fort Ross-Seaview, California, USA', 'Syrah', 'Red'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'Cuvée Cleo Chardonnay', 'Fort Ross-Seaview, California, USA', 'Chardonnay', 'White'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'The Estate Chardonnay', 'Fort Ross-Seaview, California, USA', 'Chardonnay', 'White'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'Golden Mean Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'Mother Rock Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'Paige''s Ridge Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'The Estate Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'The Traveler Pinot Noir', 'Fort Ross-Seaview, California, USA', 'Pinot Noir', 'Red'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'WF2 Chardonnay', 'Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'WF2 Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.wayfarervineyard.com/wines
  ('Wayfarer Vineyard', 'WF2 Rosé', 'Sonoma Coast, California, USA', null, 'Rosé')  -- https://www.wayfarervineyard.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KISTLER VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Kistler Vineyards', 'Durrell Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kistlervineyards.com/wine/durrell-vineyard
  ('Kistler Vineyards', 'Dutton Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kistlervineyards.com/wine/dutton-ranch
  ('Kistler Vineyards', 'Kistler Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kistlervineyards.com/wine/kistler-vineyard
  ('Kistler Vineyards', 'Kistler Vineyard Cuvée Cathleen Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kistlervineyards.com/wine/kistler-vineyard-cuvee-cathleen
  ('Kistler Vineyards', 'Laguna Ridge Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kistlervineyards.com/wine/laguna-ridge-vineyard-chardonnay
  ('Kistler Vineyards', 'Laguna Ridge Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kistlervineyards.com/wine/laguna-ridge-vineyard-pinot-noir
  ('Kistler Vineyards', 'McCrea Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kistlervineyards.com/wine/mccrea-vineyard
  ('Kistler Vineyards', 'Silver Belt Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kistlervineyards.com/wine/silver-belt-vineyard
  ('Kistler Vineyards', 'Stock Ranch Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kistlervineyards.com/wine/stock-ranch
  ('Kistler Vineyards', 'Stone Flat Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kistlervineyards.com/wine/stone-flat-vineyard
  ('Kistler Vineyards', 'Trenton Roadhouse Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kistlervineyards.com/wine/trenton-roadhouse-vineyard
  ('Kistler Vineyards', 'Vine Hill Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White')  -- https://www.kistlervineyards.com/wine/vine-hill-vineyard
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROCHIOLI VINEYARD & WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Rochioli Vineyard & Winery', 'Big Hill Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.rochioliwinery.com/wines/single-vineyard-pinot-noir-accolades/
  ('Rochioli Vineyard & Winery', 'Little Hill Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.rochioliwinery.com/wines/single-vineyard-pinot-noir-accolades/
  ('Rochioli Vineyard & Winery', 'River Block Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.rochioliwinery.com/wines/single-vineyard-pinot-noir-accolades/
  ('Rochioli Vineyard & Winery', 'Sweetwater Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.rochioliwinery.com/wines/single-vineyard-pinot-noir-accolades/
  ('Rochioli Vineyard & Winery', 'Three Corner Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.rochioliwinery.com/wines/single-vineyard-pinot-noir-accolades/
  ('Rochioli Vineyard & Winery', 'West Block Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.rochioliwinery.com/wines/single-vineyard-pinot-noir-accolades/
  ('Rochioli Vineyard & Winery', 'Little Hill Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.rochioliwinery.com/wines/single-vineyard-chardonnay-accolades/
  ('Rochioli Vineyard & Winery', 'Rachael’s Vineyard Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.rochioliwinery.com/wines/single-vineyard-chardonnay-accolades/
  ('Rochioli Vineyard & Winery', 'River Block Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.rochioliwinery.com/wines/single-vineyard-chardonnay-accolades/
  ('Rochioli Vineyard & Winery', 'South River Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.rochioliwinery.com/wines/single-vineyard-chardonnay-accolades/
  ('Rochioli Vineyard & Winery', 'Sweetwater Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.rochioliwinery.com/wines/single-vineyard-chardonnay-accolades/
  ('Rochioli Vineyard & Winery', 'Old Vine Sauvignon Blanc', 'Russian River Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.rochioliwinery.com/wines/single-vineyard-sauvignon-blanc-accolades/
  ('Rochioli Vineyard & Winery', 'Estate Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.rochioliwinery.com/wines/estate-pinot-noir-accolades/
  ('Rochioli Vineyard & Winery', 'Estate Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.rochioliwinery.com/wines/estate-chardonnay-accolades/
  ('Rochioli Vineyard & Winery', 'Estate Sauvignon Blanc', 'Russian River Valley, California, USA', 'Sauvignon Blanc', 'White')  -- https://www.rochioliwinery.com/wines/estate-sauvignon-blanc-accolades/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KOSTA BROWNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Kosta Browne', 'Treehouse Vineyard Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kostabrowne.com/wines
  ('Kosta Browne', 'Bootlegger’s Hill Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kostabrowne.com/wines
  ('Kosta Browne', 'Giusti Ranch Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kostabrowne.com/wines
  ('Kosta Browne', 'Bootlegger’s Hill Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.kostabrowne.com/wines
  ('Kosta Browne', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kostabrowne.com/wines
  ('Kosta Browne', 'One-Sixteen Russian River Valley Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.kostabrowne.com/wines
  ('Kosta Browne', 'Keefer Ranch Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kostabrowne.com/wines
  ('Kosta Browne', 'El Diablo Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White')  -- https://www.kostabrowne.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HANZELL VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Hanzell Vineyards', 'Heritage Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.hanzell.com/wines
  ('Hanzell Vineyards', 'Heritage Pinot Noir', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.hanzell.com/wines
  ('Hanzell Vineyards', 'Heritage Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.hanzell.com/wines
  ('Hanzell Vineyards', 'Chardonnay Ambassador’s 1953 Vineyard', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.hanzell.com/wines
  ('Hanzell Vineyards', 'Pinot Noir Ambassador’s 1953 Vineyard', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.hanzell.com/wines
  ('Hanzell Vineyards', 'Farm Chardonnay The Zellerbach Selection', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.hanzell.com/wines
  ('Hanzell Vineyards', 'Chardonnay The de Brye Selection', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.hanzell.com/wines
  ('Hanzell Vineyards', 'Farm Pinot Noir The Maggie’s Selection', 'Sonoma County, California, USA', 'Pinot Noir', 'Red'),  -- https://www.hanzell.com/wines
  ('Hanzell Vineyards', 'Sebella Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://www.hanzell.com/wines
  ('Hanzell Vineyards', 'Sebella Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red')  -- https://www.hanzell.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LIOCO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('LIOCO', 'Casa Seca Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.liocowine.com/wines
  ('LIOCO', 'Estero Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.liocowine.com/wines
  ('LIOCO', 'Lejano Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.liocowine.com/wines
  ('LIOCO', 'Sonoma County Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White')  -- https://www.liocowine.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DEHLINGER WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Dehlinger Winery', 'Estate Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://order.dehlingerwinery.com/product/category/shop/
  ('Dehlinger Winery', 'Champ de Mars Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://order.dehlingerwinery.com/product/category/library-wines/
  ('Dehlinger Winery', 'Estate Cabernet Sauvignon', 'Russian River Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://order.dehlingerwinery.com/product/category/library-wines/
  ('Dehlinger Winery', 'Goldridge Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://order.dehlingerwinery.com/product/category/library-wines/
  ('Dehlinger Winery', 'Goldridge Syrah', 'Russian River Valley, California, USA', 'Syrah', 'Red')  -- https://order.dehlingerwinery.com/product/category/library-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAUL HOBBS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_sonoma.sql)'
from (values
  ('Paul Hobbs Winery', 'Cuvée Agustina Katherine Lindsay Estate Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://paulhobbswinery.com/wines/pinot-noir/
  ('Paul Hobbs Winery', 'Goldrock Estate Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://paulhobbswinery.com/wines/pinot-noir/
  ('Paul Hobbs Winery', 'Katherine Lindsay Estate Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://paulhobbswinery.com/wines/pinot-noir/
  ('Paul Hobbs Winery', 'Russian River Valley Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://paulhobbswinery.com/wines/pinot-noir/
  ('Paul Hobbs Winery', 'West Sonoma Coast Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://paulhobbswinery.com/wines/pinot-noir/
  ('Paul Hobbs Winery', 'Cleary Estate Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://paulhobbswinery.com/wines/pinot-noir/
  ('Paul Hobbs Winery', 'George Menini Estate Pinot Noir', 'Russian River Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://paulhobbswinery.com/wines/pinot-noir/
  ('Paul Hobbs Winery', 'Cuvée Agustina Richard Dinner Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://paulhobbswinery.com/wines/chardonnay/
  ('Paul Hobbs Winery', 'Cuvée Louisa Goldrock Estate Chardonnay', 'West Sonoma Coast, California, USA', 'Chardonnay', 'White'),  -- https://paulhobbswinery.com/wines/chardonnay/
  ('Paul Hobbs Winery', 'Edward James Estate Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://paulhobbswinery.com/wines/chardonnay/
  ('Paul Hobbs Winery', 'Ellen Lane Estate Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://paulhobbswinery.com/wines/chardonnay/
  ('Paul Hobbs Winery', 'George Menini Estate Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://paulhobbswinery.com/wines/chardonnay/
  ('Paul Hobbs Winery', 'Richard Dinner Vineyard Chardonnay', 'Sonoma County, California, USA', 'Chardonnay', 'White'),  -- https://paulhobbswinery.com/wines/chardonnay/
  ('Paul Hobbs Winery', 'Ross Station Estate Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://paulhobbswinery.com/wines/chardonnay/
  ('Paul Hobbs Winery', 'Russian River Valley Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://paulhobbswinery.com/wines/chardonnay/
  ('Paul Hobbs Winery', 'West Sonoma Coast Chardonnay', 'West Sonoma Coast, California, USA', 'Chardonnay', 'White')  -- https://paulhobbswinery.com/wines/chardonnay/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
