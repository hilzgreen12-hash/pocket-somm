-- Producer ranges round 8: Oregon. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- WILLAMETTE VALLEY VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Willamette Valley Vineyards', 'Estate Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-estate-pinot-noir/
  ('Willamette Valley Vineyards', 'Fuller Pinot Noir', 'Tualatin Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-fuller-pinot-noir/
  ('Willamette Valley Vineyards', 'Whole Cluster Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2024-whole-cluster-pinot-noir/
  ('Willamette Valley Vineyards', 'Bernau Block Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-bernau-block-pinot-noir/
  ('Willamette Valley Vineyards', 'Bernau Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-bernau-estate-pinot-noir/
  ('Willamette Valley Vineyards', 'O''Brien Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-o-brien-pinot-noir/
  ('Willamette Valley Vineyards', 'Hannah Pinot Noir', 'Tualatin Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-hannah-pinot-noir/
  ('Willamette Valley Vineyards', 'Vintage 50 Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-vintage-50-pinot-noir/
  ('Willamette Valley Vineyards', 'Kittyhawk Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2024-kittyhawk-pinot-noir/
  ('Willamette Valley Vineyards', 'Ingram Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2024-ingram-pinot-noir/
  ('Willamette Valley Vineyards', 'Founders'' Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-founders-reserve-pinot-noir/
  ('Willamette Valley Vineyards', 'Dijon Clone Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-dijon-clone-pinot-noir/
  ('Willamette Valley Vineyards', '"W" Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2023-w-pinot-noir/
  ('Willamette Valley Vineyards', 'Signature Cuvée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2022-signature-cuvee-pinot-noir/
  ('Willamette Valley Vineyards', 'Tualatin Estate Pinot Noir', 'Tualatin Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2022-tualatin-estate-pinot-noir/
  ('Willamette Valley Vineyards', 'Loeza Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.wvv.com/product/2022-loeza-pinot-noir/
  ('Willamette Valley Vineyards', 'Quinta Reserva Port-Style Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Fortified'),  -- https://www.wvv.com/product/2022-quinta-reserva-port-style-pinot-noir/
  ('Willamette Valley Vineyards', 'Estate Rosé of Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://www.wvv.com/product/2025-estate-rose-of-pinot-noir/
  ('Willamette Valley Vineyards', 'Oregon Blossom Sparkling Rosé', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.wvv.com/product/oregon-blossom-rose/
  ('Willamette Valley Vineyards', 'Père Ami Umpqua Valley Blend', 'Umpqua Valley, Oregon, USA', 'Syrah, Tempranillo, Merlot', 'Red'),  -- https://www.wvv.com/product/2022-pere-ami-red-blend/
  ('Willamette Valley Vineyards', 'Estate Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.wvv.com/product/2023-estate-chardonnay/
  ('Willamette Valley Vineyards', 'Bernau Block Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.wvv.com/product/2024-bernau-block-chardonnay/
  ('Willamette Valley Vineyards', 'Tualatin Estate Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.wvv.com/product/2024-tualatin-estate-chardonnay/
  ('Willamette Valley Vineyards', 'Founders'' Reserve Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.wvv.com/product/2023-founders-reserve-chardonnay/
  ('Willamette Valley Vineyards', 'Vintage 50 Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.wvv.com/product/2023-vintage-50-chardonnay/
  ('Willamette Valley Vineyards', 'Dijon Clone Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.wvv.com/product/2024-dijon-clone-chardonnay/
  ('Willamette Valley Vineyards', '"W" Chardonnay', 'Oregon, USA', 'Chardonnay', 'White'),  -- https://www.wvv.com/product/2023-w-chardonnay/
  ('Willamette Valley Vineyards', 'Sauvignon Blanc', 'Willamette Valley, Oregon, USA', 'Sauvignon Blanc', 'White'),  -- https://www.wvv.com/product/2024-sauvignon-blanc/
  ('Willamette Valley Vineyards', 'Pinot Blanc', 'Tualatin Hills, Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://www.wvv.com/product/2025-pinot-blanc/
  ('Willamette Valley Vineyards', 'Estate Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://www.wvv.com/product/2024-estate-pinot-gris/
  ('Willamette Valley Vineyards', 'Dry Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.wvv.com/product/2023-dry-riesling/
  ('Willamette Valley Vineyards', 'Dry Gewürztraminer', 'Willamette Valley, Oregon, USA', 'Gewürztraminer', 'White'),  -- https://www.wvv.com/product/2023-dry-gewurztraminer/
  ('Willamette Valley Vineyards', 'Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.wvv.com/product/2024-riesling/
  ('Willamette Valley Vineyards', 'Late Harvest Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'Sweet'),  -- https://www.wvv.com/product/2023-late-harvest-riesling/
  ('Willamette Valley Vineyards', 'Auxerrois', 'Willamette Valley, Oregon, USA', 'Auxerrois', 'White'),  -- https://www.wvv.com/product/2024-auxerrois/
  ('Willamette Valley Vineyards', 'Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://www.wvv.com/product/2024-ns-pinot-gris/
  ('Willamette Valley Vineyards', 'Tualatin Estate White Pinot Noir', 'Tualatin Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'White'),  -- https://www.wvv.com/product/2024-tualatin-estate-white-pinot-noir/
  ('Willamette Valley Vineyards', 'Tualatin Estate Semi-Sparkling Muscat', 'Willamette Valley, Oregon, USA', 'Muscat', 'Sparkling')  -- https://www.wvv.com/product/2023-tualatin-estate-semi-sparkling-muscat/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ERATH WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Erath Winery', 'Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/2024-erath-reserve-pinot-noir
  ('Erath Winery', 'Willakia Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/2023-willakia-pinot-noir
  ('Erath Winery', 'Fairsing Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/2023-fairsing-pinot-noir
  ('Erath Winery', 'Tuenge Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/2023-erath-tuenge-pinot-noir
  ('Erath Winery', 'Knight''s Gambit Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/2022-knights-gambit-pinot-noir
  ('Erath Winery', 'La Nuit Magique Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/2022-la-nuit-magique-pinot-noir
  ('Erath Winery', 'Luminous Hills Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/era-23-pin-lhv-sv-750-6
  ('Erath Winery', 'Willakia Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.erath.com/product/era-23-cha-wkv-sv-750-6
  ('Erath Winery', 'Carabella Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/2022-carabella-vineyard-pinot-noir
  ('Erath Winery', 'Oregon Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/2023-erath-oregon-pinot-noir
  ('Erath Winery', 'Oregon Pinot Gris', 'Oregon, USA', 'Pinot Gris', 'White'),  -- https://www.erath.com/product/2025-erath-oregon-pinot-gris
  ('Erath Winery', 'Oregon Pinot Noir Rosé', 'Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://www.erath.com/product/2025-erath-oregon-pinot-noir-rose
  ('Erath Winery', 'Resplendent Chardonnay', 'Oregon, USA', 'Chardonnay', 'White'),  -- https://www.erath.com/product/era-24-cha-rsp-750-6
  ('Erath Winery', 'Resplendent Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.erath.com/product/2025-resplendent-pinot-noir
  ('Erath Winery', 'La Lumière Magique Sparkling Pinot Blanc', 'Willamette Valley, Oregon, USA', 'Pinot Blanc', 'Sparkling'),  -- https://www.erath.com/product/2021-la-lumire-magique-sparkling-pinot-blanc
  ('Erath Winery', 'La Lumière Magique Sparkling Chardonnay', 'Oregon, USA', 'Chardonnay', 'Sparkling'),  -- https://www.erath.com/product/2022-sparkling-chardonnay-la-lumi-re-magique
  ('Erath Winery', 'La Lumière Magique Blanc de Blancs Sparkling', 'Oregon, USA', 'Chardonnay', 'Sparkling'),  -- https://www.erath.com/product/2023-la-lumiere-magique-blanc-de-blancs
  ('Erath Winery', 'Le Jour Magique White Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'White'),  -- https://www.erath.com/product/2023-le-jour-magique-white-pinot-noir
  ('Erath Winery', 'Sweet Harvest Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'Sweet'),  -- https://www.erath.com/product/2022-sweet-harvest-pinot-gris
  ('Erath Winery', 'Winemaker Series Reserve Rosé', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay, Pinot Noir', 'Rosé'),  -- https://www.erath.com/product/2023-winemaker-series-reserve-ros
  ('Erath Winery', 'L''Eclipse Magique Syrah', 'The Rocks District of Milton-Freewater, Oregon, USA', 'Syrah', 'Red')  -- https://www.erath.com/product/2022-leclipse-magique-syrah
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KING ESTATE WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('King Estate Winery', 'Domaine Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2022-king-estate-domaine-pinot-noir/
  ('King Estate Winery', 'Domaine Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://kingestate.com/products/2023-king-estate-domaine-pinot-gris/
  ('King Estate Winery', 'Brut Cuvée', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://kingestate.com/products/2021-king-estate-brut-cuvee/
  ('King Estate Winery', 'Sauvignon Blanc', 'Willamette Valley, Oregon, USA', 'Sauvignon Blanc', 'White'),  -- https://kingestate.com/products/2024-king-estate-sauvignon-blanc/
  ('King Estate Winery', 'Willamette Valley Muscat', 'Willamette Valley, Oregon, USA', 'Muscat', 'Sweet'),  -- https://kingestate.com/products/2023-king-estate-willamette-valley-muscat/
  ('King Estate Winery', 'Bradshaw Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2015-king-estate-bradshaw-pinot-noir/
  ('King Estate Winery', 'Croft Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2018-king-estate-croft-pinot-noir/
  ('King Estate Winery', 'Nicholas Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2018-king-estate-nicholas-pinot-noir/
  ('King Estate Winery', 'Tonalita Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2016-king-estate-tonalita-pinot-noir/
  ('King Estate Winery', 'Kennel Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2017-king-estate-kennel-pinot-noir/
  ('King Estate Winery', 'Pfeiffer Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2017-king-estate-pfeiffer-pinot-noir/
  ('King Estate Winery', 'Temperance Hill Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2017-king-estate-temperance-hill-pinot-noir/
  ('King Estate Winery', 'Seven Rows Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2018-king-estate-seven-rows-pinot-noir/
  ('King Estate Winery', 'Blackjack Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2021-king-estate-blackjack-pinot-noir/
  ('King Estate Winery', 'Chehalem Mountain Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2021-king-estate-chehalem-mountain-pinot-noir/
  ('King Estate Winery', 'Grand Oak Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2021-king-estate-grand-oak-pinot-noir/
  ('King Estate Winery', 'Eola Springs Pinot Gris', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://kingestate.com/products/2022-king-estate-eola-springs-pinot-gris/
  ('King Estate Winery', 'Goschie Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://kingestate.com/products/2022-king-estate-goschie-pinot-gris/
  ('King Estate Winery', 'Pfeiffer Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://kingestate.com/products/2022-king-estate-pfeiffer-pinot-gris/
  ('King Estate Winery', 'Steiner Block Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://kingestate.com/products/2022-king-estate-steiner-block-pinot-gris/
  ('King Estate Winery', 'Paradox Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://kingestate.com/products/2022-king-estate-paradox-pinot-gris/
  ('King Estate Winery', 'Croft Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://kingestate.com/products/2023-king-estate-croft-pinot-gris/
  ('King Estate Winery', 'Grand Oak Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://kingestate.com/products/2022-king-estate-grand-oak-chardonnay/
  ('King Estate Winery', 'Croft Sauvignon Blanc', 'Willamette Valley, Oregon, USA', 'Sauvignon Blanc', 'White'),  -- https://kingestate.com/products/2023-king-estate-croft-sauvignon-blanc/
  ('King Estate Winery', 'Havlin Gruner Veltliner', 'Willamette Valley, Oregon, USA', 'Grüner Veltliner', 'White'),  -- https://kingestate.com/products/2023-king-estate-havlin-gruner-veltliner/
  ('King Estate Winery', 'Bacchus Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://kingestate.com/products/2017-king-estate-bacchus-cabernet-sauvignon/
  ('King Estate Winery', 'Quintessence Cabernet Sauvignon', 'Red Mountain, Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://kingestate.com/products/2017-king-estate-quintessence-cabernet-sauvignon/
  ('King Estate Winery', 'Weinbau Cabernet Franc', 'Wahluke Slope, Columbia Valley, Washington, USA', 'Cabernet Franc', 'Red'),  -- https://kingestate.com/products/2017-king-estate-weinbau-cabernet-franc/
  ('King Estate Winery', 'Weinbau Merlot', 'Wahluke Slope, Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://kingestate.com/products/2017-king-estate-weinbau-merlot/
  ('King Estate Winery', 'Sonrisa Tempranillo', 'Rattlesnake Hills, Columbia Valley, Washington, USA', 'Tempranillo', 'Red'),  -- https://kingestate.com/products/2017-king-estate-sonrisa-tempranillo/
  ('King Estate Winery', 'Carpenter Hill Petite Sirah', 'Rogue Valley, Oregon, USA', 'Petite Sirah', 'Red'),  -- https://kingestate.com/products/2017-king-estate-carpenter-hill-petite-sirah-2/
  ('King Estate Winery', 'GSM', 'Rogue Valley, Oregon, USA', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://kingestate.com/products/2018-king-estate-gsm/
  ('King Estate Winery', 'Artisan Series Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2024-king-estate-artisan-series-pinot-noir/
  ('King Estate Winery', 'Artisan Series Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://kingestate.com/products/2025-king-estate-artisan-series-pinot-gris/
  ('King Estate Winery', 'Willamette Valley Rosé of Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://kingestate.com/products/2025-king-estate-willamette-valley-rose-of-pinot-noir/
  ('King Estate Winery', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://kingestate.com/products/2024-king-estate-willamette-valley-pinot-noir/
  ('King Estate Winery', 'Willamette Valley Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://kingestate.com/products/2024-king-estate-willamette-valley-pinot-gris/
  ('King Estate Winery', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://kingestate.com/products/2022-king-estate-willamette-valley-chardonnay/
  ('King Estate Winery', 'Inscription Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://kingestate.com/shop/?collection[]=innovation
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- UNDERWOOD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Underwood', 'Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.unionwinecompany.com/product/2023-underwood-pinot-noir-bottle
  ('Underwood', 'Pinot Gris', 'Oregon, USA', 'Pinot Gris', 'White'),  -- https://www.unionwinecompany.com/product/2024-underwood-pinot-gris-bottle
  ('Underwood', 'Nouveau Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.unionwinecompany.com/product/2025-underwood-nouveau-pinot-noir-bottle
  ('Underwood', 'Rosé', 'Oregon, USA', 'Pinot Gris, Pinot Noir, Muscat', 'Rosé'),  -- https://www.unionwinecompany.com/product/2025-underwood-rose-bottle
  ('Underwood', 'The Bubbles', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.unionwinecompany.com/product/underwood-in-a-can-the-bubbles
  ('Underwood', 'Rosé Bubbles', 'Oregon, USA', null, 'Sparkling'),  -- https://www.unionwinecompany.com/product/underwood-rose-bubbles
  ('Underwood', 'Sauvignon Blanc', 'Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.unionwinecompany.com/product/underwood-sauvignon-blanc-can-4-pack
  ('Underwood', 'Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.unionwinecompany.com/product/underwood-cabernet-sauvignon-250ml-5-pack
  ('Underwood', 'Chardonnay', 'Oregon, USA', 'Chardonnay', 'White'),  -- https://www.unionwinecompany.com/product/underwood-chardonnay-250ml-5-pack
  ('Underwood', 'First Crush', 'Oregon, USA', null, 'Red')  -- https://www.unionwinecompany.com/product/underwood-first-crush-can-4-pack
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- A TO Z WINEWORKS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('A to Z Wineworks', 'Oregon Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red'),  -- https://atozwineworks.com/shop/
  ('A to Z Wineworks', 'Chardonnay', 'Oregon, USA', 'Chardonnay', 'White'),  -- https://atozwineworks.com/shop/
  ('A to Z Wineworks', 'Pinot Gris', 'Oregon, USA', 'Pinot Gris', 'White'),  -- https://atozwineworks.com/shop/
  ('A to Z Wineworks', 'Riesling', 'Oregon, USA', 'Riesling', 'White'),  -- https://atozwineworks.com/shop/
  ('A to Z Wineworks', 'The Essence of Oregon Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red'),  -- https://atozwineworks.com/shop/
  ('A to Z Wineworks', 'Rosé', 'Oregon, USA', null, 'Rosé'),  -- https://atozwineworks.com/shop/
  ('A to Z Wineworks', 'Bubbles Sparkling Rosé', 'Oregon, USA', 'Pinot Noir, Chardonnay', 'Sparkling')  -- https://www.winealign.com/wines/129325
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ARGYLE WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Argyle Winery', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Estate Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/product/2023-estate-reserve-pinot-noir/
  ('Argyle Winery', 'Nuthouse Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/product/2014-nuthouse-pinot-noir/
  ('Argyle Winery', 'Nuthouse Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://argylewinery.com/product/2021-nuthouse-chardonnay/
  ('Argyle Winery', 'Spirithouse Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/product/2022-spirithouse-pinot-noir/
  ('Argyle Winery', 'Spirithouse Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://argylewinery.com/product/2021-spirithouse-chardonnay/
  ('Argyle Winery', 'Knudsen Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Knudsen Vineyard Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://argylewinery.com/product/2021-knudsen-vineyard-chardonnay/
  ('Argyle Winery', 'Knudsen Vineyard Brut', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Sparkling'),  -- https://argylewinery.com/product/2021-knudsen-vineyard-brut/
  ('Argyle Winery', 'Knudsen Vineyard Blanc de Blancs', 'Dundee Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Knudsen Vineyard Brut Rosé', 'Dundee Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Knudsen Vineyard Sparkling Pinot Meunier', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Meunier', 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Spirit Hill Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/product/2021-spirit-hill-vineyard-pinot-noir/
  ('Argyle Winery', 'Spirit Hill Vineyard Block 12 Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Spirit Hill Block 15 Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/sitemap
  ('Argyle Winery', 'Spirit Hill Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://argylewinery.com/sitemap
  ('Argyle Winery', 'Spirit Hill Vineyard Blanc de Blancs', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Spirit Hill Vineyard Blanc de Noirs', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir, Pinot Meunier', 'Sparkling'),  -- https://argylewinery.com/product/2021-spirit-hill-vineyard-blanc-de-noirs/
  ('Argyle Winery', 'Spirit Hill Vineyard Brut Rosé', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Lone Star Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/product/2022-lone-star-pinot-noir/
  ('Argyle Winery', 'Lone Star Vineyard Block 18 Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Lone Star Vineyard Block 24', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/product/24-lone-star-block-24/
  ('Argyle Winery', 'Lone Star Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Giving Tree Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/product/2022-giving-tree-pinot-noir/
  ('Argyle Winery', 'Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Club Series Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Club Series Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Nusshaus Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://argylewinery.com/product/2023-nusshaus-riesling/
  ('Argyle Winery', 'Minus 5 Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'Sweet'),  -- https://argylewinery.com/product/2022-minus-5-riesling/
  ('Argyle Winery', 'Columbia Gorge Syrah', 'Columbia Gorge, Oregon, USA', 'Syrah', 'Red'),  -- https://argylewinery.com/product/2022-columbia-gorge-syrah/
  ('Argyle Winery', 'Weinbau Vineyard Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://argylewinery.com/product/2022-argyle-weinbau-merlot/
  ('Argyle Winery', 'Vintage Brut', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Vintage Brut Rosé', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/product/2022-vintage-brut-rose/
  ('Argyle Winery', 'Vintage Blanc de Blancs', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Ruby Brut', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Sparkling'),  -- https://argylewinery.com/product/2022-ruby-brut/
  ('Argyle Winery', 'Extended Tirage Brut', 'Willamette Valley, Oregon, USA', 'Pinot Noir, Chardonnay, Pinot Meunier', 'Sparkling'),  -- https://argylewinery.com/product/2015-extended-tirage-brut/
  ('Argyle Winery', 'Extended Tirage Brut Rosé', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Extended Tirage Knudsen Vineyard Brut', 'Dundee Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Extended Tirage Spirit Hill Blanc de Blancs', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Estate Reserve Brut', 'Willamette Valley, Oregon, USA', 'Chardonnay, Pinot Meunier', 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Estate Reserve Brut Rosé', 'Willamette Valley, Oregon, USA', 'Pinot Noir, Chardonnay, Pinot Meunier', 'Sparkling'),  -- https://argylewinery.com/collection/wine/
  ('Argyle Winery', 'Spirithouse Riesling', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://argylewinery.com/sitemap
  ('Argyle Winery', 'Nuthouse Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White')  -- https://argylewinery.com/sitemap
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ELK COVE VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Elk Cove Vineyards', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/wine-club/current-releases/
  ('Elk Cove Vineyards', 'Roosevelt Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/wine-club/current-releases/
  ('Elk Cove Vineyards', 'La Bohème Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Clay Court Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/wine-club/current-releases/
  ('Elk Cove Vineyards', 'Mount Richmond Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/wine-club/current-releases/
  ('Elk Cove Vineyards', 'Mount Richmond West Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Goodrich Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Windhill Pinot Noir', 'Tualatin Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/wine-club/current-releases/
  ('Elk Cove Vineyards', 'Five Mountain Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'La Sirène Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Pinot Blanc', 'Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Pinot Noir Rosé', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Estate Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://elkcove.com/wine-club/current-releases/
  ('Elk Cove Vineyards', 'Five Mountain Chardonnay', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://elkcove.com/wine-club/current-releases/
  ('Elk Cove Vineyards', 'Mount Richmond Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Goodrich Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://elkcove.com/trade/labels/
  ('Elk Cove Vineyards', 'Mount Richmond Brut', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir, Chardonnay', 'Sparkling'),  -- https://elkcove.com/wine-club/current-releases/
  ('Elk Cove Vineyards', 'La Bohème Brut Rosé', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Sparkling'),  -- https://elkcove.com/wine-club/current-releases/
  ('Elk Cove Vineyards', 'Goodrich Blanc de Blancs', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'Sparkling')  -- https://elkcove.com/wine-club/current-releases/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- REX HILL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Rex Hill', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Chehalem Mountains Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Dundee Hills Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Eola-Amity Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Yamhill-Carlton Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Jacob-Hart Estate Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Sims Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Sunny Mountain Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Shea Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/product/2022-rex-hill-shea-vineyard-pinot-noir-duplicate
  ('Rex Hill', 'Two Mules Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Witness Tree Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/product/2022-rex-hill-witness-tree-vineyard-pinot-noir-copy
  ('Rex Hill', 'La Colina Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Alloro Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://rexhill.com/collection/wine-club-exclusives/
  ('Rex Hill', 'Alpine Vineyard Red Blend', 'Oregon, USA', null, 'Red'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Willamette Valley Seven Soils Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://rexhill.com/collection/current-releases/
  ('Rex Hill', 'Late Harvest Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'Sweet'),  -- https://rexhill.com/product/2002-rex-hill-maresh-vineyard-late-harvest-riesling-375ml-copy1
  ('Rex Hill', 'Grande Cuvée Sparkling', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://rexhill.com/product/2017-rex-hill-grande-cuv-e-sparkling-copy1
  ('Rex Hill', 'La Vie en Rosé Sparkling', 'Willamette Valley, Oregon, USA', null, 'Sparkling')  -- https://rexhill.com/collection/current-releases/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SOKOL BLOSSER WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Sokol Blosser Winery', 'Dundee Hills Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product/2022-dundee-hills-estate-pinot-noir/
  ('Sokol Blosser Winery', 'Dundee Hills Estate Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Osprey Cuvée Estate Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product/2024-osprey-cuvee-pinot-noir/
  ('Sokol Blosser Winery', 'Big Tree Block Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product/2024-big-tree-block-pinot-noir/
  ('Sokol Blosser Winery', 'Watershed Block Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product/2024-watershed-block-estate-pinot-noir/
  ('Sokol Blosser Winery', 'Old Vineyard Block Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Blackberry Block Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Orchard Block Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Peach Tree Block Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Twelve Row Block Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Goosepen Block Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Kalita Yamhill-Carlton Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product/2022-kalita-yamhill-carlton-pinot-noir/
  ('Sokol Blosser Winery', 'Kalita Crimson Clover Yamhill-Carlton Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Kalita Trillium Yamhill-Carlton Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Temperance Hill Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product/2023-temperance-hill-pinot-noir/
  ('Sokol Blosser Winery', 'Blossom Ridge Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product/2024-blossom-ridge-pinot-noir/
  ('Sokol Blosser Winery', 'Dion Vineyard Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.sokolblosser.com/product/2024-dion-vineyard-pinot-noir/
  ('Sokol Blosser Winery', 'Willamette Valley Gamay Noir', 'Willamette Valley, Oregon, USA', 'Gamay Noir', 'Red'),  -- https://shop.sokolblosser.com/product/2023-willamette-valley-gamay-noir-duplicate/
  ('Sokol Blosser Winery', 'Willamette Valley Estate Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.sokolblosser.com/product/2024-willamette-valley-estate-chardonnay/
  ('Sokol Blosser Winery', 'Willamette Valley Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://shop.sokolblosser.com/product/2025-willamette-valley-pinot-gris/
  ('Sokol Blosser Winery', 'Willamette Valley Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://shop.sokolblosser.com/product/2024-willamette-valley-riesling/
  ('Sokol Blosser Winery', 'Estate Riesling', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://shop.sokolblosser.com/product-sitemap.xml
  ('Sokol Blosser Winery', 'Estate Riesling Dessert', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Riesling', 'Sweet'),  -- https://shop.sokolblosser.com/product/2022-estate-riesling-dessert/
  ('Sokol Blosser Winery', 'Lone Star Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://shop.sokolblosser.com/product/20223-lone-star-riesling/
  ('Sokol Blosser Winery', 'Pedotti Pinot Blanc', 'Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://shop.sokolblosser.com/product/2023-pedotti-pinot-blanc-duplicate/
  ('Sokol Blosser Winery', 'Croft Vineyard Sauvignon Blanc', 'Willamette Valley, Oregon, USA', 'Sauvignon Blanc', 'White'),  -- https://shop.sokolblosser.com/product/2024-croft-vineyard-sauvignon-blanc/
  ('Sokol Blosser Winery', 'Estate Müller-Thurgau', 'Willamette Valley, Oregon, USA', 'Müller-Thurgau', 'White'),  -- https://shop.sokolblosser.com/product/2025-estate-mueller-thurgau/
  ('Sokol Blosser Winery', 'Susan''s Cuvée White Wine Blend', 'Willamette Valley, Oregon, USA', 'Müller-Thurgau, Pinot Gris, Riesling, Chardonnay, Pinot Blanc', 'White'),  -- https://shop.sokolblosser.com/product/2024-susan-cuvee-white-blend/
  ('Sokol Blosser Winery', 'Dundee Hills Estate Rosé of Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://shop.sokolblosser.com/product/2025-dundee-hills-estate-ros-of-pinot-noir/
  ('Sokol Blosser Winery', 'Rose Festival Rosé', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://shop.sokolblosser.com/product/2025-rose-festival-ros/
  ('Sokol Blosser Winery', 'Bluebird Cuvée Brut Sparkling', 'Willamette Valley, Oregon, USA', 'Riesling, Müller-Thurgau, Pinot Noir, Chardonnay', 'Sparkling'),  -- https://shop.sokolblosser.com/product/bluebird-cuvee-brut-sparkling-wine-23rd-edition/
  ('Sokol Blosser Winery', 'Bluebird Rosé Brut Sparkling', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Sparkling'),  -- https://shop.sokolblosser.com/product/2021-bluebird-ros-sparkling/
  ('Sokol Blosser Winery', 'Evolution Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://shop.sokolblosser.com/product/2024-evolution-pinot-noir/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ADELSHEIM VINEYARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Adelsheim Vineyard', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Breaking Ground Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Quarter Mile Lane Vineyard Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Calkins Lane Vineyard Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Bryan Creek Vineyard Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Boulder Bluff Vineyard Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Laurel Leaf Vineyard Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Ribbon Springs Vineyard Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Elizabeth''s Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- http://www.princeofpinot.com/winery/632/
  ('Adelsheim Vineyard', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Breaking Ground Chardonnay', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Ribbon Springs Vineyard Chardonnay', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Caitlin''s Reserve Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- http://www.princeofpinot.com/winery/632/
  ('Adelsheim Vineyard', 'Bryan Creek Vineyard Pinot Blanc', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Rosé of Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://jebdunnuck.com/producers/5100
  ('Adelsheim Vineyard', 'Artist Series Rosé of Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé')  -- https://jebdunnuck.com/producers/5100
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PONZI VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Ponzi Vineyards', 'Laurelwood Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://vintus.com/producers/ponzi-vineyards/
  ('Ponzi Vineyards', 'Reserve Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Tavola Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://vintus.com/producers/ponzi-vineyards/
  ('Ponzi Vineyards', 'Abetina Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Aurora Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Avellana Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Madrona Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Paloma Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Chehalem Crossing Pinot Noir', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Mountain Home Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Laurelwood Chardonnay', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://vintus.com/producers/ponzi-vineyards/
  ('Ponzi Vineyards', 'Aurora Chardonnay', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Avellana Chardonnay', 'Laurelwood District, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/term/ponzi/usa/page/1/3/
  ('Ponzi Vineyards', 'Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://vintus.com/producers/ponzi-vineyards/
  ('Ponzi Vineyards', 'Blanc de Blancs', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.ponzivineyards.com/
  ('Ponzi Vineyards', 'Sparkling Brut Rosé', 'Willamette Valley, Oregon, USA', null, 'Sparkling')  -- https://www.ponzivineyards.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WILLAKENZIE ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('WillaKenzie Estate', 'Estate Gamay Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Gamay Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Estate Pinot Blanc', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Terres Basses Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Éclatant Brut', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.willakenzie.com/our-wines-rose-interesting-whites
  ('WillaKenzie Estate', 'Triple Black Slopes Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Emery Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Estate Cuvée Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Éclatant Blanc de Blancs', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.willakenzie.com/our-wines-rose-interesting-whites
  ('WillaKenzie Estate', 'Clairière Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Estate Cuvée Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'La Crête Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Aliette Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'La Crête Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Jory Hills Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Kiana Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Willamette Valley Rosé', 'Willamette Valley, Oregon, USA', null, 'Rosé'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Estate Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.willakenzie.com/wines
  ('WillaKenzie Estate', 'Tourdion Cuvée Blanc', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', null, 'White')  -- https://www.willakenzie.com/our-wines-rose-interesting-whites
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STOLLER FAMILY ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Stoller Family Estate', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/collection/sfe-all-wines/
  ('Stoller Family Estate', 'Legacy LaRue''s Blanc de Blancs', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'Sparkling'),  -- https://shop.stollerwinegroup.com/product/2021-legacy-larue-s-blanc-de-blanc/
  ('Stoller Family Estate', 'Legacy Ruth''s Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/product/2023-legacy-ruth-s-pinot-noir/
  ('Stoller Family Estate', 'Single Acre Tempranillo', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Tempranillo', 'Red'),  -- https://shop.stollerwinegroup.com/product/stoller-2023-single-acre-tempranillo/
  ('Stoller Family Estate', 'Single Acre Syrah', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Syrah', 'Red'),  -- https://shop.stollerwinegroup.com/product/2024-stoller-single-acre-syrah/
  ('Stoller Family Estate', 'Reserve Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/product/2023-stoller-reserve-pinot-noir/
  ('Stoller Family Estate', 'Legacy William H. Stoller Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/collection/sfe-all-wines/
  ('Stoller Family Estate', 'Dundee Hills Estate White Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'White'),  -- https://shop.stollerwinegroup.com/product/2024-stoller-white-pinot-noir/
  ('Stoller Family Estate', 'Reserve Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.stollerwinegroup.com/collection/sfe-all-wines/
  ('Stoller Family Estate', 'Winemaker''s Series Whole Cluster Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/product/2025-winemaker-s-series-whole-cluster-pinot-noir/
  ('Stoller Family Estate', 'Legacy LaRue''s Brut Rosé', 'Dundee Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://shop.stollerwinegroup.com/product/2021-legacy-larues-brut-rose/
  ('Stoller Family Estate', 'Dundee Hills Estate Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.stollerwinegroup.com/collection/sfe-all-wines/
  ('Stoller Family Estate', 'Legacy Elsie''s Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.stollerwinegroup.com/product/2023-legacy-elsies-chardonnay/
  ('Stoller Family Estate', 'Dundee Hills Estate Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/collection/sfe-all-wines/
  ('Stoller Family Estate', 'Winemaker''s Series Classic Clones Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/collection/sfe-all-wines/
  ('Stoller Family Estate', 'Winemaker''s Series Heritage Clones Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/collection/sfe-all-wines/
  ('Stoller Family Estate', 'Legacy Helen''s Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/collection/sfe-all-wines/
  ('Stoller Family Estate', 'Legacy Nancy''s Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/collection/sfe-all-wines/
  ('Stoller Family Estate', 'Heritage Collection Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.stollerfamilyestate.com/
  ('Stoller Family Estate', 'Heritage Collection Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.stollerfamilyestate.com/
  ('Stoller Family Estate', 'Estate Brut', 'Willamette Valley, Oregon, USA', null, 'Sparkling')  -- https://www.stollerfamilyestate.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHEHALEM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Chehalem', 'Estate Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/collection/che-all-wines/
  ('Chehalem', 'Blanc de Blancs', 'Chehalem Mountains, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://shop.stollerwinegroup.com/product/2021-chehalem-blanc-de-blancs/
  ('Chehalem', 'Mountains Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/collection/che-all-wines/
  ('Chehalem', 'Sparkling Brut', 'Chehalem Mountains, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://shop.stollerwinegroup.com/product/2022-chehalem-sparkling-brut/
  ('Chehalem', 'Statement Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/product/2023-statement-pinot-noir/
  ('Chehalem', 'Estate Vineyard Chardonnay', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.stollerwinegroup.com/product/2024-chehalem-estate-vineyard-chardonnay/
  ('Chehalem', 'Ridgecrest Vineyard Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/product/2024-ridgecrest-vineyard-pinot-noir/
  ('Chehalem', 'Stoller Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.stollerwinegroup.com/collection/che-all-wines/
  ('Chehalem', 'Willamette Valley Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://shop.stollerwinegroup.com/collection/che-all-wines/
  ('Chehalem', 'INOX Unoaked Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.stollerwinegroup.com/product/2025-inox-unoaked-chardonnay/
  ('Chehalem', 'Hood View Chardonnay', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.stollerwinegroup.com/product/2024-hood-view-chardonnay/
  ('Chehalem', 'Estate Vineyard Pinot Blanc', 'Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://shop.stollerwinegroup.com/collection/che-all-wines/
  ('Chehalem', 'Hood View Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/product/2024-hood-view-pinot-noir/
  ('Chehalem', 'Corral Creek Vineyard Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/product/2024-corral-creek-vineyard-pinot-noir/
  ('Chehalem', 'Stoller Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/product/2024-stoller-vineyard-pinot-noir/
  ('Chehalem', 'Three Vineyard Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://shop.stollerwinegroup.com/product/che-2015-three-vineyard-riesling/
  ('Chehalem', 'Corral Creek Vineyards Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://shop.stollerwinegroup.com/collection/che-all-wines/
  ('Chehalem', 'Ridgecrest Vineyard Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://shop.stollerwinegroup.com/collection/che-all-wines/
  ('Chehalem', 'Reserve Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://shop.stollerwinegroup.com/collection/che-all-wines/
  ('Chehalem', 'Reserve Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://shop.stollerwinegroup.com/product/2023-chehalem-reserve-pinot-noir/
  ('Chehalem', 'Wind Ridge Block Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://shop.stollerwinegroup.com/product/che-2015-chehalem-wind-ridge-block-pinot-noir/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PENNER-ASH WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Penner-Ash Wine Cellars', 'Le Cadeau Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Fairsing Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Zena Crown Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Estate Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Aegrina Vineyard Pinot Noir', 'McMinnville, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Knudsen Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Shea Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Hyland Vineyard Pinot Noir', 'McMinnville, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Oregon Viognier', 'Oregon, USA', 'Viognier', 'White'),  -- https://www.pennerash.com/shop-wines-white-rose/
  ('Penner-Ash Wine Cellars', 'Rosé of Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://www.pennerash.com/shop-wines-white-rose/
  ('Penner-Ash Wine Cellars', 'Pas de Nom Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.pennerash.com/shop-wines-white-rose/
  ('Penner-Ash Wine Cellars', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.pennerash.com/shop-wines-white-rose/
  ('Penner-Ash Wine Cellars', 'Pas de Nom Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Jory Hills Vineyard Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.pennerash.com/shop-wines-white-rose/
  ('Penner-Ash Wine Cellars', 'Old Vine Hyland Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.pennerash.com/shop-wines-white-rose/
  ('Penner-Ash Wine Cellars', 'Élevée Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Palmer Creek Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Bramble Hill Vineyard Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Ridgecrest Vineyard Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.pennerash.com/shop-wines-pinot-noir/
  ('Penner-Ash Wine Cellars', 'Eola-Amity Hills Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.pennerash.com/shop-wines-pinot-noir/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DROUHIN OREGON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Domaine Drouhin Oregon', 'Dundee Hills Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.drouhin.com/en_US/our-wines
  ('Domaine Drouhin Oregon', 'Pinot Noir Laurène', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://domainedrouhin.com/2022-pinot-noir-laurene/
  ('Domaine Drouhin Oregon', 'Chardonnay Arthur', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.drouhin.com/en_US/our-wines
  ('Domaine Drouhin Oregon', 'Pinot Noir Origine', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://domainedrouhin.com/2023-roserock-pinot-noir-2023-pinot-noir-origine-35/
  ('Domaine Drouhin Oregon', 'Édition Limitée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://domainedrouhin.com/our-wines/
  ('Domaine Drouhin Oregon', 'Édition Limitée Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://domainedrouhin.com/our-wines/
  ('Domaine Drouhin Oregon', 'Rosé', 'Willamette Valley, Oregon, USA', null, 'Rosé')  -- https://domainedrouhin.com/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROSEROCK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Roserock', 'Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.drouhin.com/en_US/our-wines
  ('Roserock', 'Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.drouhin.com/en_US/our-wines
  ('Roserock', 'Zéphirine Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.drouhin.com/en_US/wine/domaine-drouhin-oregon-roserock-pinot-noir-zephirine/2023
  ('Roserock', 'Maigold Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://domainedrouhin.com/2022-roserock-maigold-chardonnay/
  ('Roserock', 'North Gamay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Gamay', 'Red')  -- https://domainedrouhin.com/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LANGE ESTATE WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Lange Estate Winery', 'Temperance Hill Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Yamhill-Carlton Assemblage Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Liberty Bell Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Freedom Hill Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Yamhill Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Ancient Seabeds Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Mia Mousseux Brut Rosé', 'Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.langewinery.com/shop/40-vintages-40-stories/
  ('Lange Estate Winery', 'Estate Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Pinot Noir Rosé', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Reserve Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://www.vivino.com/en/wineries/lange-oregon
  ('Lange Estate Winery', 'Three Hills Cuvée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.vivino.com/en/wineries/lange-oregon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DUCK POND ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Duck Pond', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.duckpondcellars.com/
  ('Duck Pond', 'Willamette Valley Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://www.duckpondcellars.com/
  ('Duck Pond', 'St. Jory Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/duck-pond-cellars
  ('Duck Pond', 'Gamay Noir', 'Willamette Valley, Oregon, USA', 'Gamay Noir', 'Red'),  -- https://www.vivino.com/en/wineries/duck-pond-cellars
  ('Duck Pond', 'Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/duck-pond-cellars
  ('Duck Pond', 'Rosé of Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://www.vivino.com/en/wineries/duck-pond-cellars
  ('Duck Pond', 'Natural Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/duck-pond-cellars
  ('Duck Pond', 'Natural Path Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://www.vivino.com/en/wineries/duck-pond-cellars
  ('Duck Pond', 'South Salem Hills Cuvée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/duck-pond-cellars
  ('Duck Pond', 'Coles Valley Vineyard Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/duck-pond-cellars
  ('Duck Pond', 'Conservation Cuvée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.vivino.com/en/wineries/duck-pond-cellars
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KEN WRIGHT CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Ken Wright Cellars', 'Auric Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Shea Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Savoya Vineyard Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Bonnie Jean Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Bryce Vineyard Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Freedom Hill Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Sedimentary Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Carter Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Tanager Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'McCrone Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Hirschy Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Eola-Amity Hills Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/ken-wright-cellars
  ('Ken Wright Cellars', 'Abbott Claim Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.saratogawine.com/Ken-Wright
  ('Ken Wright Cellars', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.saratogawine.com/Ken-Wright
  ('Ken Wright Cellars', 'Yamhill-Carlton Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.saratogawine.com/Ken-Wright
  ('Ken Wright Cellars', 'Guadalupe Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.saratogawine.com/Ken-Wright
  ('Ken Wright Cellars', 'Canary Hill Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.blackwellswines.com/products/ken-wright-cellars-2023-pinot-noir-canary-hill-vineyard-willamette-valley-750ml
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE SERENE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Domaine Serene', 'Monogram Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Jerusalem Hill Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Two Barns Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Evenstad Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Fleur de Lis Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Gold Eagle Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Mark Bradford Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Côte Sud Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Winery Hill Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Ken Evenstad Commemorative Cuvée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Members Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Triple Crown Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Triple S Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Aspect Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Members'' Limited Edition Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Grace Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Abbey Oaks Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Somm Selection Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Barrel 23 Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Evenstad Center for Wine Education Cuvée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Yamhill Cuvée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Grand Cheval Syrah & Pinot Noir', 'Willamette Valley, Oregon, USA', 'Syrah, Pinot Noir', 'Red'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Triple Crown Vineyard Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Côte Sud Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Clos de Lune Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Clos du Soleil Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Aspect Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Récolte Grand Cru Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Etoile Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Coeur Blanc White Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'White'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Multi-Vintage r Rosé', 'Willamette Valley, Oregon, USA', null, 'Rosé'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Récolte Grand Cru Blanc de Blancs Dundee Hills Brut', 'Dundee Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Vintage Brut Rosé Dundee Hills', 'Dundee Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Vintage Brut Dundee Hills', 'Dundee Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Evenstad Reserve Dundee Hills Brut', 'Dundee Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Evenstad Reserve Dundee Hills Brut Rosé', 'Dundee Hills, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
  ('Domaine Serene', 'Fleur de Vie Demi-Sec', 'Willamette Valley, Oregon, USA', null, 'Sparkling')  -- https://www.domaineserene.com/shop/all?collections%5B0%5D=oregon-collection
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CRISTOM VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Cristom Vineyards', 'Mt. Jefferson Cuvée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Eileen Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Jessie Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Louise Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Marjorie Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Paul Gerrie Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Eola-Amity Hills Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Louise Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Eileen Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Royer Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Seven Springs Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Eola-Amity Hills Rosé of Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Louise Vineyard Pinot Gris', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Louise Vineyard Viognier', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Viognier', 'White'),  -- https://cristomvineyards.com/trade
  ('Cristom Vineyards', 'Louise Vineyard Estate Syrah', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Syrah', 'Red')  -- https://cristomvineyards.com/trade
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BEAUX FRÈRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Beaux Frères', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://beauxfreres.com/trade/
  ('Beaux Frères', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://beauxfreres.com/trade/
  ('Beaux Frères', 'Belles Sœurs Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://beauxfreres.com/trade/
  ('Beaux Frères', 'Upper Terrace Vineyard Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://beauxfreres.com/trade/
  ('Beaux Frères', 'Vineyard Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://beauxfreres.com/trade/
  ('Beaux Frères', 'Sequitur Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://beauxfreres.com/trade/
  ('Beaux Frères', 'Stardance Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://beauxfreres.com/trade/
  ('Beaux Frères', 'Star Mooring Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://beauxfreres.com/trade/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- EYRIE VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Eyrie Vineyards', 'Estate Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Original Vines Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Estate Chasselas Doré', 'Willamette Valley, Oregon, USA', 'Chasselas doré', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Estate Pinot Blanc', 'Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Dundee Hills Pinot Blanc', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Estate Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Dundee Hills Pinot Gris', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Original Vines Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Estate Trousseau', 'Willamette Valley, Oregon, USA', 'Trousseau', 'Red'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Estate Pinot Meunier', 'Willamette Valley, Oregon, USA', 'Pinot Meunier', 'Red'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Estate Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'South Block Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Sisters Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Outcrop Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Roland Green Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Daphne Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://eyrievineyards.com/download.shtml
  ('Eyrie Vineyards', 'Melon de Bourgogne', 'Willamette Valley, Oregon, USA', 'Melon de Bourgogne', 'White')  -- https://eyrievineyards.com/download.shtml
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BERGSTRÖM WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Bergström Wines', 'Homage Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Sigrid Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Le Pré du Col Vineyard Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'La Spirale Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Croft Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Gregory Ranch Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Silice Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Shea Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Bergström Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Dr Bergstrom Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Winery Block Pinot Noir', 'Chehalem Mountains, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/wineries/bergstrom
  ('Bergström Wines', 'Cumberland Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.vivino.com/wineries/bergstrom
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ANTICA TERRA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Antica Terra', 'Aurata Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Angelicall Rosé', 'Willamette Valley, Oregon, USA', null, 'Rosé'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Ceras Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Botanica Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Antikythera Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Bion Rosé', 'Willamette Valley, Oregon, USA', null, 'Rosé'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Obelin Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Aequorin Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Luciferin Rosé', 'Willamette Valley, Oregon, USA', null, 'Rosé'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Adiona Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Abeona Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Litera Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Nuntius Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://anticaterra.com/wines/
  ('Antica Terra', 'Paraselene', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'Sweet')  -- https://anticaterra.com/wines/paraselene/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SHEA WINE CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Shea Wine Cellars', 'Estate Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.skurnik.com/producer/shea-wine-cellars/
  ('Shea Wine Cellars', 'Estate Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/shea-wine-cellars/
  ('Shea Wine Cellars', 'Block 7 Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/shea-wine-cellars/
  ('Shea Wine Cellars', 'Homer Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/shea-wine-cellars/
  ('Shea Wine Cellars', 'Block 5 Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/121/
  ('Shea Wine Cellars', 'Block 23 Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/121/
  ('Shea Wine Cellars', 'Block 31 Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/121/
  ('Shea Wine Cellars', 'Block 32 Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/121/
  ('Shea Wine Cellars', 'Block 33 Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/121/
  ('Shea Wine Cellars', 'West Hill Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/121/
  ('Shea Wine Cellars', 'East Hill Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/121/
  ('Shea Wine Cellars', 'Pommard Clone Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/121/
  ('Shea Wine Cellars', 'Wädenswil Clone Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/121/
  ('Shea Wine Cellars', 'Block 22 Last Hurrah Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.princeofpinot.com/winery/121/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LINGUA FRANCA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Lingua Franca', 'Avni Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'Estate Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'Bunker Hill Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'Sisters Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'Inspiras Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'Avni Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'Estate Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'The Plow Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'La Belle Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'Petit Geant Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'Mimi''s Mind Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
  ('Lingua Franca', 'Novo Vino Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://owenbargreen.com/blog/2025/9/1/lingua-franca
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WALTER SCOTT WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Walter Scott Wines', 'Freedom Hill Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Cuvée Anne Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Justice Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Seven Springs Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'X Novo Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'La Combe Verte Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Koosah Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/walter-scott/2/
  ('Walter Scott Wines', 'Hyland Vineyard Chardonnay', 'McMinnville, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/walter-scott/2/
  ('Walter Scott Wines', 'Witness Tree Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/walter-scott/2/
  ('Walter Scott Wines', 'Sojeau Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/walter-scott/2/
  ('Walter Scott Wines', 'X Novo Vineyard Aligoté', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Aligoté', 'White'),  -- https://www.decanter.com/wine-reviews/search/walter-scott/2/
  ('Walter Scott Wines', 'Sequitur Vineyard Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Temperance Hill Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Dubay Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Freedom Hill Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Sojourner Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Seven Springs Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Cuvée Ruth Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'La Combe Verte Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Clos des Oiseaux Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/1402/
  ('Walter Scott Wines', 'Justice Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/walter-scott/2/
  ('Walter Scott Wines', 'Witness Tree Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/walter-scott/2/
  ('Walter Scott Wines', 'Sojeau Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/walter-scott/2/
  ('Walter Scott Wines', 'Koosah Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/walter-scott/2/
  ('Walter Scott Wines', 'X Novo Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.decanter.com/wine-reviews/search/walter-scott/page/2/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RESONANCE VINEYARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Resonance Vineyard', 'Résonance Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/resonance/2/
  ('Resonance Vineyard', 'Mineral Echo Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/resonance/2/
  ('Resonance Vineyard', 'Koosah Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/resonance/2/
  ('Resonance Vineyard', 'Découverte Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/resonance/2/
  ('Resonance Vineyard', 'Découverte Vineyard Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/resonance/2/
  ('Resonance Vineyard', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/resonance/2/
  ('Resonance Vineyard', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/resonance/2/
  ('Resonance Vineyard', 'Koosah Vineyard Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/resonance/2/
  ('Resonance Vineyard', 'Founder''s Blocks Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.decanter.com/wine-reviews/search/resonance/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BRICK HOUSE WINE COMPANY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Brick House Wine Company', 'Select Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brickhouse/page/1/2/
  ('Brick House Wine Company', 'Halliday Hill Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brickhouse/page/1/2/
  ('Brick House Wine Company', 'Les Dijonnais Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brickhouse/page/1/2/
  ('Brick House Wine Company', 'Evelyn''s Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brickhouse/page/1/2/
  ('Brick House Wine Company', 'Due East Gamay Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Gamay Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brickhouse/page/1/2/
  ('Brick House Wine Company', 'Cuvée du Tonnelier Pinot Noir', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/?p=305687
  ('Brick House Wine Company', 'Chardonnay', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Chardonnay', 'White')  -- https://www.cellar503.com/wines/brick-house-wines-2014-chardonnay/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- EVENING LAND VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Evening Land Vineyards', 'Seven Springs Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/evening-land/page/1/2/
  ('Evening Land Vineyards', 'Seven Springs Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/evening-land/page/1/2/
  ('Evening Land Vineyards', 'Seven Springs Gamay Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Gamay Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/evening-land/page/1/2/
  ('Evening Land Vineyards', 'La Source Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/evening-land/page/1/2/
  ('Evening Land Vineyards', 'La Source Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/evening-land/page/1/2/
  ('Evening Land Vineyards', 'Summum Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/evening-land/page/1/2/
  ('Evening Land Vineyards', 'Summum Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/evening-land/page/1/2/
  ('Evening Land Vineyards', 'Harvest Moon Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/evening-land/page/1/2/
  ('Evening Land Vineyards', 'Hunter''s Moon Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/evening-land/page/1/2/
  ('Evening Land Vineyards', 'Anden Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/684/
  ('Evening Land Vineyards', 'La Forêt Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.princeofpinot.com/winery/684/
  ('Evening Land Vineyards', 'Oregon Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.princeofpinot.com/winery/684/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BETHEL HEIGHTS VINEYARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Bethel Heights Vineyard', 'Pinot Noir Rosé', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Estate Pinot Blanc', 'Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Willamette Valley Pinot Blanc', 'Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Estate Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Casteel Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Justice Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Estate Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Casteel Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Æolian Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wines
  ('Bethel Heights Vineyard', 'Justice Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Lewman Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Flat Block Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wines
  ('Bethel Heights Vineyard', 'Southeast Block Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wines
  ('Bethel Heights Vineyard', 'West Block Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wines
  ('Bethel Heights Vineyard', 'The High Wire Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'The Cauldron Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'The Currents Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'The Shallows Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'The Steep Slope Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.bethelheights.com/wine-fact-sheets/
  ('Bethel Heights Vineyard', 'Legacy Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://bethelheights.bottlethreesixty.com/store
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BIG TABLE FARM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Big Table Farm', 'Wild Bee Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Yamhill Carlton Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Eola-Amity Hills Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Pelos Sandberg Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Cattrall Brothers Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Yamhill-Carlton Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Sunnyside Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'The Rocks Syrah', 'Oregon, USA', 'Syrah', 'Red'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'The Elusive Queen Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Willamette Valley Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Earth Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Laughing Pig Rosé', 'Willamette Valley, Oregon, USA', null, 'Rosé'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Wirtz Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Resonance Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://clare-carver-czyn.squarespace.com/our-wine
  ('Big Table Farm', 'Work Horse Red', 'Willamette Valley, Oregon, USA', null, 'Red')  -- https://clare-carver-czyn.squarespace.com/our-wine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PATRICIA GREEN CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Patricia Green Cellars', 'Reserve Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/patricia-green-cellars/
  ('Patricia Green Cellars', 'Willamette Valley Sauvignon Blanc', 'Willamette Valley, Oregon, USA', 'Sauvignon Blanc', 'White'),  -- https://www.skurnik.com/producer/patricia-green-cellars/
  ('Patricia Green Cellars', 'Chehalem Mountain Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/patricia-green-cellars/
  ('Patricia Green Cellars', 'Estate Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/patricia-green-cellars/
  ('Patricia Green Cellars', 'Estate Old Vine Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/patricia-green-cellars/
  ('Patricia Green Cellars', 'Balcombe Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/patricia-green-cellars/
  ('Patricia Green Cellars', 'Freedom Hill Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/patricia-green-cellars/
  ('Patricia Green Cellars', 'Lia''s Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/patricia-green-cellars/
  ('Patricia Green Cellars', 'La Belle Promenade Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer/patricia-green-cellars/
  ('Patricia Green Cellars', 'Bearwallow Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.patriciagreencellars.com/
  ('Patricia Green Cellars', 'Freedom Hill Vineyard Coury Clone Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.patriciagreencellars.com/
  ('Patricia Green Cellars', 'Balcombe Block 1B Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.patriciagreencellars.com/
  ('Patricia Green Cellars', '25th Anniversary Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.patriciagreencellars.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ST. INNOCENT WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('St. Innocent Winery', 'Villages Cuvée Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Villages Cuvée Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Momtazi Vineyard Oeil de Perdrix Pinot Noir Rosé', 'McMinnville, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Momtazi Vineyard Grauburgunder Pinot Gris', 'McMinnville, Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Momtazi Vineyard Pinot Noir', 'McMinnville, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Temperance Hill Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Temperance Hill Vineyard Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Freedom Hill Vineyard Pinot Blanc', 'Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Freedom Hill Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Freedom Hill Vineyard Cuvée La Liberté Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Freedom Hill Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Vitae Springs Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Vitae Springs Vineyard LTD Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Zenith Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
  ('St. Innocent Winery', 'Shea Vineyard Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://stinnocentwine.com/vineyards/
  ('St. Innocent Winery', 'Justice Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://winerelease.com/WineryInfo/St_Innocent_Winery_wine_releases.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ARCHERY SUMMIT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Archery Summit', 'Dundee Hills Estate Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Willamette Valley Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Renegade Ridge Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Archer''s Edge Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Archer''s Crest Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Red Hills Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Dundee Hills Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Vireton Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Vireton Pinot Gris', 'Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Summit Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Arcus Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Red Hills Vineyard Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Archer''s Paradox Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Renegade Ridge Vineyard Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.archerysummit.com/wines
  ('Archery Summit', 'Summit Vineyard Chardonnay', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White')  -- https://www.archerysummit.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GRAN MORAINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Gran Moraine', 'Blanc de Blancs', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Yamhill-Carlton Rosé of Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Rosé'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Yamhill-Carlton Extended Tirage Brut Rosé', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Yamhill-Carlton Brut Rosé', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', null, 'Sparkling'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Flavorscape Gamay Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Gamay Noir', 'Red'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Telluric Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Cascade Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Yamhill-Carlton Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Upland Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Yamhill-Carlton Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Dropstone Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Flavorscape Grenache', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Grenache', 'Red'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Flavorscape Pinot Blanc', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Upland Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.granmoraine.com/wines/
  ('Gran Moraine', 'Dropstone Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.granmoraine.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NICOLAS-JAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Nicolas-Jay', 'Bishop Creek Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/nicolas-jay/2/
  ('Nicolas-Jay', 'Bishop Creek Chardonnay', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/nicolas-jay/2/
  ('Nicolas-Jay', 'L''Ensemble Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/nicolas-jay/2/
  ('Nicolas-Jay', 'Affinités Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/nicolas-jay/2/
  ('Nicolas-Jay', 'Nysa Vineyard Pinot Noir', 'Dundee Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/nicolas-jay/2/
  ('Nicolas-Jay', 'Momtazi Vineyard Pinot Noir', 'McMinnville, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/nicolas-jay/2/
  ('Nicolas-Jay', 'Spirit Hill Chardonnay', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/nicolas-jay/2/
  ('Nicolas-Jay', 'Own Rooted Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/nicolas-jay/2/
  ('Nicolas-Jay', 'Temperance Hill Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.decanter.com/wine-reviews/search/nicolas-jay/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BROOKS WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Brooks Wines', 'Hyland Vineyard Riesling', 'McMinnville, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Temperance Hill Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Cahiers Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Rastaban Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Bois Joli Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Ara Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Royer Vineyard Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Cahiers Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Orchard Fold Vineyard Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Lonestar Vineyard Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Crannell Vineyard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brooks/2/
  ('Brooks Wines', 'Coury Pinot Noir', 'McMinnville, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brooks/page/2/2/
  ('Brooks Wines', 'Old Vine Pommard Pinot Noir', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.decanter.com/wine-reviews/search/brooks/page/2/2/
  ('Brooks Wines', 'Sweet P Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/page/2/2/
  ('Brooks Wines', 'Riesling Clone 49 Ridgecrest Vineyard', 'Ribbon Ridge, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/page/2/2/
  ('Brooks Wines', 'Estate Riesling', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/page/2/2/
  ('Brooks Wines', 'Estate Pinot Gris', 'Eola-Amity Hills, Willamette Valley, Oregon, USA', 'Pinot Gris', 'White'),  -- https://www.decanter.com/wine-reviews/search/brooks/page/2/2/
  ('Brooks Wines', 'Pinot Blanc', 'Willamette Valley, Oregon, USA', 'Pinot Blanc', 'White'),  -- https://www.brookswine.com/collection/
  ('Brooks Wines', 'Sparkling Riesling', 'Willamette Valley, Oregon, USA', 'Riesling', 'Sparkling')  -- https://www.brookswine.com/collection/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SOTER VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r8_oregon.sql)'
from (values
  ('Soter Vineyards', 'Mineral Springs Brut Rosé', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Sparkling'),  -- https://www.skurnik.com/producer_name/soter-vineyards
  ('Soter Vineyards', 'Mineral Springs Ranch Pinot Noir', 'Yamhill-Carlton, Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer_name/soter-vineyards
  ('Soter Vineyards', 'Estates Chardonnay', 'Willamette Valley, Oregon, USA', 'Chardonnay', 'White'),  -- https://www.skurnik.com/producer_name/soter-vineyards
  ('Soter Vineyards', 'Estates Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/producer_name/soter-vineyards
  ('Soter Vineyards', 'Planet Oregon Pinot Noir', 'Willamette Valley, Oregon, USA', 'Pinot Noir', 'Red')  -- https://www.decanter.com/wine-reviews/search/soter/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
