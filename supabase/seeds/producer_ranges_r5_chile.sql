-- Producer ranges round 5: Chile. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- CONCHA Y TORO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Concha y Toro', 'Casillero del Diablo Pedro Jiménez', 'Limarí Valley, Chile', 'Pedro Ximénez', 'White'),  -- https://conchaytoro.com/en/vinos/casillero-del-diablo-pedro-jimenez/
  ('Concha y Toro', 'Casillero del Diablo Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Rosé', 'Chile', null, 'Rosé'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Malbec', 'Chile', 'Malbec', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Pinot Grigio', 'Chile', 'Pinot Grigio', 'White'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Shiraz', 'Chile', 'Syrah', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Especial Merlot', 'Chile', 'Merlot', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-especial-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Especial Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-especial-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Especial Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://conchaytoro.com/en/tags-brand/reserva-especial-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Especial Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-especial-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Privada Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-privada-en/
  ('Concha y Toro', 'Casillero del Diablo Reserva Privada Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/reserva-privada-en/
  ('Concha y Toro', 'Casillero del Diablo Belight Blend', 'Central Valley, Chile', null, 'Red'),  -- https://conchaytoro.com/en/vinos/casillero-del-diablo-belight-blend/
  ('Concha y Toro', 'Casillero del Diablo Belight Rosé', 'Chile', null, 'Rosé'),  -- https://conchaytoro.com/en/tags-brand/casillero-del-diablo-belight-en/
  ('Concha y Toro', 'Casillero del Diablo Belight Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://conchaytoro.com/en/tags-brand/casillero-del-diablo-belight-en/
  ('Concha y Toro', 'Casillero del Diablo Devil''s Carnaval Spectacular Cabernet', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/vinos/spectacular-cabernetsauvignon/
  ('Concha y Toro', 'Casillero del Diablo Devil''s Carnaval Fantastic Sweet', 'Chile', null, 'Red'),  -- https://conchaytoro.com/en/vinos/fantastic-sweet/
  ('Concha y Toro', 'Casillero del Diablo Devil''s Carnaval Phenomenal Sauvignon', 'Chile', null, 'White'),  -- https://conchaytoro.com/en/vinos/phenomenal-sauvignon/
  ('Concha y Toro', 'Casillero del Diablo Devil''s Carnaval Fabulous Red', 'Chile', null, 'Red'),  -- https://conchaytoro.com/en/tags-brand/casillero-del-diablo-devils-carnaval-en/
  ('Concha y Toro', 'Casillero del Diablo Devil''s Brut Chardonnay', 'Chile', 'Chardonnay', 'Sparkling'),  -- https://conchaytoro.com/en/tags-brand/casillero-del-diablo-devils-brut-en/
  ('Concha y Toro', 'Casillero del Diablo Sparkling Zero', 'Chile', null, 'Sparkling'),  -- https://conchaytoro.com/en/vinos/78522-2/
  ('Concha y Toro', 'Marqués de Casa Concha Malbec', 'Chile', 'Malbec', 'Red'),  -- https://conchaytoro.com/en/tags-brand/super-premium-en/
  ('Concha y Toro', 'Marqués de Casa Concha Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/super-premium-en/
  ('Concha y Toro', 'Marqués de Casa Concha Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/super-premium-en/
  ('Concha y Toro', 'Marqués de Casa Concha Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://conchaytoro.com/en/tags-brand/super-premium-en/
  ('Concha y Toro', 'Marqués de Casa Concha Merlot', 'Chile', 'Merlot', 'Red'),  -- https://conchaytoro.com/en/tags-brand/super-premium-en/
  ('Concha y Toro', 'Marqués de Casa Concha Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://conchaytoro.com/en/tags-brand/super-premium-en/
  ('Concha y Toro', 'Marqués de Casa Concha Cinsault Rosé', 'Chile', 'Cinsault', 'Rosé'),  -- https://conchaytoro.com/en/tags-brand/super-premium-en/
  ('Concha y Toro', 'Marqués de Casa Concha Syrah', 'Chile', 'Syrah', 'Red'),  -- https://conchaytoro.com/en/tags-brand/super-premium-en/
  ('Concha y Toro', 'Marqués de Casa Concha Gold Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/ultra-premiun-en/
  ('Concha y Toro', 'Marqués de Casa Concha Blue Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/ultra-premiun-en/
  ('Concha y Toro', 'Marqués de Casa Concha Heritage', 'Maipo Valley, Chile', null, 'Red'),  -- https://conchaytoro.com/en/vinos/marques-de-casa-concha-heritage/
  ('Concha y Toro', 'Terrunyo Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://conchaytoro.com/en/tags-brand/terrunyo-en/
  ('Concha y Toro', 'Terrunyo Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/terrunyo-en/
  ('Concha y Toro', 'Terrunyo Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/terrunyo-en/
  ('Concha y Toro', 'Amelia Pinot Noir', 'Limarí Valley, Chile', 'Pinot Noir', 'Red'),  -- https://conchaytoro.com/en/tags-brand/amelia-en/
  ('Concha y Toro', 'Amelia Chardonnay', 'Limarí Valley, Chile', 'Chardonnay', 'White'),  -- https://conchaytoro.com/en/tags-brand/amelia-en/
  ('Concha y Toro', 'Carmín de Peumo', 'Cachapoal Valley, Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/carmin-de-peumo-en/
  ('Concha y Toro', 'The Master Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/the-master/
  ('Concha y Toro', 'The Wine Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/the-wine-en/
  ('Concha y Toro', 'The Wine Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/the-wine-en/
  ('Concha y Toro', 'The Wine Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://conchaytoro.com/en/tags-brand/the-wine-en/
  ('Concha y Toro', 'The Wine Malbec', 'Chile', 'Malbec', 'Red'),  -- https://conchaytoro.com/en/tags-brand/the-wine-en/
  ('Concha y Toro', 'Frontera Tropical', 'Chile', null, 'White'),  -- https://conchaytoro.com/en/vinos/frontera-tropical/
  ('Concha y Toro', 'Frontera Pink Paradise', 'Chile', null, 'Rosé'),  -- https://conchaytoro.com/en/vinos/frontera-pink-paradise/
  ('Concha y Toro', 'Frontera Tinto de Verano', 'Chile', null, 'Red'),  -- https://conchaytoro.com/en/vinos/frontera-tinto-de-verano/
  ('Concha y Toro', 'Frontera Moscato', 'Chile', 'Moscato', 'White'),  -- https://conchaytoro.com/en/tags-brand/regular-en/
  ('Concha y Toro', 'Frontera Rosé', 'Chile', null, 'Rosé'),  -- https://conchaytoro.com/en/tags-brand/regular-en/
  ('Concha y Toro', 'Frontera Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/regular-en/
  ('Concha y Toro', 'Frontera Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://conchaytoro.com/en/tags-brand/regular-en/
  ('Concha y Toro', 'Frontera Pinot Grigio', 'Chile', 'Pinot Grigio', 'White'),  -- https://conchaytoro.com/en/tags-brand/regular-en/
  ('Concha y Toro', 'Frontera Merlot', 'Chile', 'Merlot', 'Red'),  -- https://conchaytoro.com/en/tags-brand/regular-en/
  ('Concha y Toro', 'Frontera Malbec', 'Chile', 'Malbec', 'Red'),  -- https://conchaytoro.com/en/tags-brand/regular-en/
  ('Concha y Toro', 'Frontera Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://conchaytoro.com/en/tags-brand/regular-en/
  ('Concha y Toro', 'Frontera Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/regular-en/
  ('Concha y Toro', 'Reservado Rosé', 'Chile', null, 'Rosé'),  -- https://conchaytoro.com/en/tags-brand/especiales-en/
  ('Concha y Toro', 'Reservado Moscato', 'Itata Valley, Chile', 'Muscat of Alexandria', 'White'),  -- https://conchaytoro.com/en/vinos/reservado-moscato/
  ('Concha y Toro', 'Reservado Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://conchaytoro.com/en/tags-brand/regular-en-2/
  ('Concha y Toro', 'Reservado Merlot', 'Chile', 'Merlot', 'Red'),  -- https://conchaytoro.com/en/tags-brand/regular-en-2/
  ('Concha y Toro', 'Reservado Malbec', 'Chile', 'Malbec', 'Red'),  -- https://conchaytoro.com/en/tags-brand/regular-en-2/
  ('Concha y Toro', 'Reservado Chardonnay Pedro Jiménez', 'Chile', 'Chardonnay, Pedro Ximénez', 'White'),  -- https://conchaytoro.com/en/tags-brand/regular-en-2/
  ('Concha y Toro', 'Reservado Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/regular-en-2/
  ('Concha y Toro', 'Reservado Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/regular-en-2/
  ('Concha y Toro', 'Gran Reserva Serie Riberas Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://conchaytoro.com/en/wines/
  ('Concha y Toro', 'Casillero del Diablo Reserva Especial Sauvignon Blanc', 'Colchagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.casillerodeldiablo.com/wine/reserva-especial-sauvignon-blanc/
  ('Concha y Toro', 'Casillero del Diablo Reserva Viognier', 'Chile', 'Viognier', 'White'),  -- https://www.casillerodeldiablo.com/wine/reserva-especial-sauvignon-blanc/
  ('Concha y Toro', 'Casillero del Diablo Tempranillo', 'Chile', 'Tempranillo', 'Red'),  -- https://www.casillerodeldiablo.com/wine/reserva-especial-sauvignon-blanc/
  ('Concha y Toro', 'Casillero del Diablo Red Blend', 'Central Valley, Chile', null, 'Red'),  -- https://www.casillerodeldiablo.com/wine/red-blend/
  ('Concha y Toro', 'Casillero del Diablo Intense Red', 'Central Valley, Chile', null, 'Red'),  -- https://www.casillerodeldiablo.com/wine/red-blend-intense-red/
  ('Concha y Toro', 'Casillero del Diablo Devil''s Collection Red', 'Rapel Valley, Chile', null, 'Red'),  -- https://www.casillerodeldiablo.com/wine/devils-collection-red/
  ('Concha y Toro', 'Casillero del Diablo Devil''s Collection White', 'Casablanca Valley, Chile', null, 'White'),  -- https://www.casillerodeldiablo.com/wine/devils-collection-white/
  ('Concha y Toro', 'Casillero del Diablo Devil''s Collection Rosé', 'Chile', null, 'Rosé'),  -- https://www.casillerodeldiablo.com/wine/reserva-especial-sauvignon-blanc/
  ('Concha y Toro', 'Casillero del Diablo Legendary Collection Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.casillerodeldiablo.com/wine/legendary-collection/
  ('Concha y Toro', 'Casillero del Diablo Route of Cabernet Sauvignon Maipo Valley', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.casillerodeldiablo.com/wine/route-of-cabernet-sauvignon-maipo-valley/
  ('Concha y Toro', 'Casillero del Diablo Route of Cabernet Sauvignon Rapel Valley', 'Rapel Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.casillerodeldiablo.com/wine/reserva-especial-sauvignon-blanc/
  ('Concha y Toro', 'Casillero del Diablo Route of Cabernet Sauvignon Maule Valley', 'Maule Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.casillerodeldiablo.com/wine/reserva-especial-sauvignon-blanc/
  ('Concha y Toro', 'Casillero del Diablo Sauvignon Blanc Muscat Riesling', 'Chile', 'Sauvignon Blanc, Muscat, Riesling', 'White'),  -- https://www.systembolaget.se/produkt/vin/624207
  ('Concha y Toro', 'Gravas del Maipo Syrah', 'Chile', 'Syrah', 'Red')  -- https://www.saq.com/en/15086151
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DIABLO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Diablo', 'Hard Fire Blend', 'Maule Valley, Chile', null, 'Red'),  -- https://conchaytoro.com/en/vinos/diablo-hard-fire-blend-2022/
  ('Diablo', 'Volcanic Cab', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/diablo-en/
  ('Diablo', 'Velvet Merlot', 'Chile', 'Merlot', 'Red'),  -- https://conchaytoro.com/en/tags-brand/diablo-en/
  ('Diablo', 'Luminous Rosé', 'Chile', null, 'Rosé'),  -- https://conchaytoro.com/en/tags-brand/diablo-en/
  ('Diablo', 'Golden Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://conchaytoro.com/en/tags-brand/diablo-en/
  ('Diablo', 'Crystal Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://conchaytoro.com/en/tags-brand/diablo-en/
  ('Diablo', 'Purple Malbec', 'Chile', 'Malbec', 'Red'),  -- https://conchaytoro.com/en/tags-brand/diablo-en/
  ('Diablo', 'Deep Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://conchaytoro.com/en/tags-brand/diablo-en/
  ('Diablo', 'Black Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://conchaytoro.com/en/tags-brand/diablo-en/
  ('Diablo', 'Dark Red', 'Chile', null, 'Red')  -- https://conchaytoro.com/en/tags-brand/diablo-en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DON MELCHOR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Don Melchor', 'Puente Alto Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://donmelchor.com/en/wine/
  ('Don Melchor', 'The Parcel DM/05', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://donmelchor.com/en/vina-don-melchor-unveils-dm-05-2023-vintage-the-second-edition-of-its-the-parcel-series/
  ('Don Melchor', 'The Parcel DM/01', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red')  -- https://donmelchor.com/en/vina-don-melchor-unveils-dm-05-2023-vintage-the-second-edition-of-its-the-parcel-series/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALMAVIVA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Almaviva', null, 'Maipo Valley, Chile', 'Cabernet Sauvignon, Carmenere, Cabernet Franc, Petit Verdot', 'Red'),  -- https://www.grandcruwijnen.nl/en/2022-almaviva-roth-schild-puente-alto
  ('Almaviva', 'Epu', 'Maipo Valley, Chile', 'Cabernet Sauvignon, Carmenere, Cabernet Franc, Petit Verdot', 'Red')  -- https://www.grandcruwijnen.nl/en/2024-almaviva-epu
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA MAIPO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Maipo', 'Classic Series Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://vinamaipo.com/en/categorias-de-vino/classic-series-en/
  ('Viña Maipo', 'Classic Series Merlot', 'Chile', 'Merlot', 'Red'),  -- https://vinamaipo.com/en/categorias-de-vino/classic-series-en/
  ('Viña Maipo', 'Classic Series Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://vinamaipo.com/en/categorias-de-vino/classic-series-en/
  ('Viña Maipo', 'Classic Series Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://vinamaipo.com/en/categorias-de-vino/classic-series-en/
  ('Viña Maipo', 'Classic Series Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://vinamaipo.com/en/categorias-de-vino/classic-series-en/
  ('Viña Maipo', 'Classic Series Rosé', 'Chile', null, 'Rosé'),  -- https://vinamaipo.com/en/categorias-de-vino/classic-series-en/
  ('Viña Maipo', 'Mi Pueblo Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://vinamaipo.com/en/categorias-de-vino/mi-pueblo-en/
  ('Viña Maipo', 'Mi Pueblo Merlot', 'Chile', 'Merlot', 'Red'),  -- https://vinamaipo.com/en/categorias-de-vino/mi-pueblo-en/
  ('Viña Maipo', 'Mi Pueblo Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://vinamaipo.com/en/categorias-de-vino/mi-pueblo-en/
  ('Viña Maipo', 'Mi Pueblo Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://vinamaipo.com/en/categorias-de-vino/mi-pueblo-en/
  ('Viña Maipo', 'Mi Pueblo Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://vinamaipo.com/en/categorias-de-vino/mi-pueblo-en/
  ('Viña Maipo', 'Mi Pueblo Rosé', 'Chile', null, 'Rosé'),  -- https://vinamaipo.com/en/categorias-de-vino/mi-pueblo-en/
  ('Viña Maipo', 'Sweet Series Fruity Red Wine', 'Chile', null, 'Red'),  -- https://vinamaipo.com/en/categorias-de-vino/sweet-series-en/
  ('Viña Maipo', 'Sweet Series Sweet Red', 'Chile', null, 'Red'),  -- https://vinamaipo.com/en/categorias-de-vino/sweet-series-en/
  ('Viña Maipo', 'Sweet Series Sweet Moscato', 'Chile', null, 'White')  -- https://vinamaipo.com/en/vinos/sweet-moscato/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA SAN PEDRO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña San Pedro', 'Sideral', 'Cachapoal Valley, Chile', 'Cabernet Sauvignon, Syrah, Petit Verdot, Carmenere, Cabernet Franc', 'Red'),  -- https://sanpedro.cl/wine/sideral
  ('Viña San Pedro', 'Cabo de Hornos Cabernet Sauvignon', 'Cachapoal Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://sanpedro.cl/wine/cabo-de-hornos-2021
  ('Viña San Pedro', 'Gato Negro Chardonnay', 'Central Valley, Chile', 'Chardonnay', 'White'),  -- https://schenk-wine.ch/en/pages/brand/gato-negro
  ('Viña San Pedro', 'Gato Negro Carmenere', 'Central Valley, Chile', 'Carmenere', 'Red'),  -- https://schenk-wine.ch/en/pages/brand/gato-negro
  ('Viña San Pedro', 'Gato Negro Cabernet Sauvignon', 'Central Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://schenk-wine.ch/en/pages/brand/gato-negro
  ('Viña San Pedro', '1865 Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', '1865 Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', '1865 Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', '1865 Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', '1865 Old Vines Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', '1865 Tayu Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', 'Tierras Moradas Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', 'Las Encinas Semillon', 'Chile', 'Semillon', 'White'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', 'Kankana del Elqui Syrah', 'Elqui Valley, Chile', 'Syrah', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', 'Castillo de Molina Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', 'Castillo de Molina Gran Reserva Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.jumbo.cl/san-pedro
  ('Viña San Pedro', 'Castillo de Molina Gran Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Castillo de Molina Gran Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Castillo de Molina Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Castillo de Molina Tributo Gran Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Castillo de Molina Tributo Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Castillo de Molina Gran Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Castillo de Molina Gran Reserva Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Castillo de Molina Gran Reserva Rosé', 'Chile', null, 'Rosé'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Castillo de Molina Gran Reserva Late Harvest', 'Chile', null, 'Sweet'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Castillo de Molina Red Blend', 'Chile', null, 'Red'),  -- https://www.jumbo.cl/castillo-de-molina
  ('Viña San Pedro', 'Gato Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/gato
  ('Viña San Pedro', 'Gato Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.jumbo.cl/gato
  ('Viña San Pedro', 'Gato Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/gato
  ('Viña San Pedro', 'Gato Blanco', 'Chile', null, 'White'),  -- https://www.jumbo.cl/gato
  ('Viña San Pedro', 'Gato Premium Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/gato
  ('Viña San Pedro', '35 South Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red')  -- https://groceries.morrisons.com/products/san-pedro-35-south-cabernet-sauvignon-75cl/115111018
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CONO SUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Cono Sur', 'Ocio Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Silencio', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.conosur.com/vinos/silencio/
  ('Cono Sur', 'Bicicleta Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Red Blend', 'Chile', null, 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Pinot Noir Rosé', 'Chile', 'Pinot Noir', 'Rosé'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Pinot Grigio', 'Chile', 'Pinot Grigio', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Viognier', 'Chile', 'Viognier', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Gewurztraminer', 'Chile', 'Gewurztraminer', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Bicicleta Riesling', 'Chile', 'Riesling', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Organic Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Organic Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Organic Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Organic Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Organic Cabernet Sauvignon Carmenere Syrah', 'Chile', 'Cabernet Sauvignon, Carmenere, Syrah', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Reserva Especial Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Reserva Especial Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Reserva Especial Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Reserva Especial Riesling', 'Chile', 'Riesling', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Reserva Especial Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Reserva Especial Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Reserva Especial Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Reserva Especial Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Single Vineyard Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Single Vineyard Riesling', 'Chile', 'Riesling', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Single Vineyard Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Single Vineyard Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Single Vineyard Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Single Vineyard Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', '20 Barrels Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', '20 Barrels Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', '20 Barrels Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', '20 Barrels Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', '20 Barrels Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', '20 Barrels Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Sparkling Brut', 'Chile', null, 'Sparkling'),  -- https://www.conosur.com/vinos-espumantes
  ('Cono Sur', 'Sparkling Rosé', 'Chile', null, 'Sparkling')  -- https://www.conosur.com/vinos-espumantes
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CARMEN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Carmen', 'Gold Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Delanz Alto Jahuel', 'Maipo Valley, Chile', 'Cabernet Sauvignon, Cabernet Franc, Petit Verdot, Petite Sirah', 'Red'),  -- https://www.carmen.com/vinos/carmen-delanz/
  ('Carmen', 'Delanz Apalta', 'Colchagua Valley, Chile', 'Carmenere, Syrah, Petit Verdot, Cabernet Sauvignon', 'Red'),  -- https://www.carmen.com/vinos/carmen-delanz-apalta/
  ('Carmen', 'DO Matorral Chileno', 'Maule Valley, Chile', 'Carignan, Grenache, País', 'Red'),  -- https://www.carmen.com/vinos/carmen-do-matorral-chileno/
  ('Carmen', 'DO Quijada', 'Colchagua Valley, Chile', 'Semillon', 'White'),  -- https://www.carmen.com/vinos/carmen-do-quijada/
  ('Carmen', 'DO Florillón', 'Colchagua Valley, Chile', 'Semillon', 'White'),  -- https://www.carmen.com/vinos/carmen-do-florillon/
  ('Carmen', 'DO Loma Seca', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.carmen.com/vinos/carmen-do-loma-seca/
  ('Carmen', 'DO Rosado de Comavida', 'Maule Valley, Chile', 'Carignan', 'Rosé'),  -- https://www.carmen.com/vinos/carmen-do-rosado-de-comavida/
  ('Carmen', 'Vintages Series Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Gran Reserva Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Frida Kahlo Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Grande Vidure', 'Colchagua Valley, Chile', 'Carmenere, Cabernet Sauvignon', 'Red'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Merlot', 'Maipo Valley, Chile', 'Merlot', 'Red'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Carignan', 'Maule Valley, Chile', 'Carignan', 'Red'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Chardonnay', 'Limarí Valley, Chile', 'Chardonnay', 'White'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Petite Sirah', 'Maipo Valley, Chile', 'Petite Sirah, Syrah', 'Red'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Syrah', 'Colchagua Valley, Chile', 'Syrah', 'Red'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Gran Reserva Pinot Noir', 'Leyda Valley, Chile', 'Pinot Noir', 'Red'),  -- https://www.carmen.com/vinos/carmen-gran-reserva/
  ('Carmen', 'Reserva Frida Kahlo Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Reserva Frida Kahlo Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Reserva Frida Kahlo Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Reserva Frida Kahlo Rosé', 'Chile', null, 'Rosé'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Reserva Frida Kahlo Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Reserva Frida Kahlo Red Blend', 'Chile', null, 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Premier 1850 Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Premier 1850 Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Premier 1850 Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Premier 1850 Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Premier 1850 Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Premier 1850 Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Insigne Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Insigne Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Insigne Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Insigne Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Insigne Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Insigne Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.carmen.com/vinos/
  ('Carmen', 'Vigno Carignan', 'Maule Valley, Chile', 'Carignan', 'Red')  -- https://the-buyer.net/partners/santa-rita
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SANTA RITA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Santa Rita', 'Casa Real Reserva Especial Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/santa-rita
  ('Santa Rita', 'Pewën de Apalta Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://the-buyer.net/partners/santa-rita
  ('Santa Rita', 'Bougainville Petite Sirah', 'Chile', 'Petite Sirah', 'Red'),  -- https://the-buyer.net/partners/santa-rita
  ('Santa Rita', 'Floresta Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Floresta Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Floresta Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Floresta Cabernet Franc', 'Chile', 'Cabernet Franc', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Gold Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Gold Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Gran Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Gran Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Gran Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Gran Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Medalla Real Reserva Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', 'Medalla Real Reserva Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.jumbo.cl/santa-rita?page=2
  ('Santa Rita', 'Cabernario Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Cabernario Red Blend', 'Chile', null, 'Red'),  -- https://www.falabella.com/falabella-cl/brand/SANTA%20RITA
  ('Santa Rita', 'Escudo Casa Real Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', 'Escudo Casa Real Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', '120 Reserva Especial Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/santa-rita?page=2
  ('Santa Rita', '120 Reserva Especial Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/santa-rita?page=2
  ('Santa Rita', '120 Reserva Especial Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/santa-rita?page=2
  ('Santa Rita', '120 Reserva Especial Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', '120 Merlot', 'Chile', 'Merlot', 'Red'),  -- https://shop.supervalu.ie/sm/pickup/rsid/326/categories/red-wine/chile-id-O409950
  ('Santa Rita', '120 Malbec', 'Chile', 'Malbec', 'Red'),  -- https://shop.supervalu.ie/sm/pickup/rsid/326/categories/red-wine/chile-id-O409950
  ('Santa Rita', '120 Shiraz', 'Chile', 'Shiraz', 'Red'),  -- https://shop.supervalu.ie/sm/pickup/rsid/326/categories/red-wine/chile-id-O409950
  ('Santa Rita', '120 Deep Red', 'Chile', null, 'Red'),  -- https://shop.supervalu.ie/sm/pickup/rsid/326/categories/red-wine/chile-id-O409950
  ('Santa Rita', '120 3 Medallas Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', '120 3 Medallas Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', '120 3 Medallas Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', '120 3 Medallas Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', '120 3 Medallas Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', '120 3 Medallas Reserva Late Harvest', 'Chile', null, 'Sweet'),  -- https://www.jumbo.cl/santa-rita?page=2
  ('Santa Rita', 'Gran 120 Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', 'Gran 120 Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', 'Gran 120 Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', 'Gran 120 Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', 'Gran 120 Ensamblaje Red', 'Chile', null, 'Red'),  -- https://www.jumbo.cl/santa-rita?page=2
  ('Santa Rita', 'Gran 120 Ensamblaje Cabernet Sauvignon Syrah', 'Chile', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://www.jumbo.cl/santa-rita?page=2
  ('Santa Rita', '120 Tinto', 'Chile', null, 'Red'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', '120 Blanco', 'Chile', null, 'White'),  -- https://www.jumbo.cl/santa-rita
  ('Santa Rita', 'Reserva Late Harvest', 'Chile', null, 'Sweet')  -- https://www.jumbo.cl/santa-rita
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SANTA CAROLINA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Santa Carolina', 'Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Brut', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Demisec', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Late Harvest', 'Chile', null, 'Sweet'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Frizzante Blanco', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Frizzante Rosé', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Gran Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Gran Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/santa-carolina
  ('Santa Carolina', 'Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://chaseramson.com/?p=627
  ('Santa Carolina', 'Estrellas Cabernet Sauvignon', 'Rapel Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://chaseramson.com/?p=627
  ('Santa Carolina', 'Estrellas Carmenere', 'Rapel Valley, Chile', 'Carmenere', 'Red'),  -- https://chaseramson.com/?p=627
  ('Santa Carolina', 'Estrellas Merlot', 'Rapel Valley, Chile', 'Merlot', 'Red'),  -- https://chaseramson.com/?p=627
  ('Santa Carolina', 'Estrellas Sauvignon Blanc', 'Rapel Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://chaseramson.com/?p=627
  ('Santa Carolina', 'Estrellas Chardonnay', 'Rapel Valley, Chile', 'Chardonnay', 'White'),  -- https://chaseramson.com/?p=627
  ('Santa Carolina', 'Estrellas Cabernet Sauvignon Rosé', 'Rapel Valley, Chile', 'Cabernet Sauvignon', 'Rosé'),  -- https://chaseramson.com/?p=627
  ('Santa Carolina', 'Cachapoal Carmenere Reserva', 'Cachapoal Valley, Chile', 'Carmenere', 'Red')  -- https://www.ocado.com/products/santa-carolina-reserva-carmenere-274094011
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MONTES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Montes', 'Taita', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GMO11CL-montes-alpha
  ('Montes', 'Muse', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.grandcruwijnen.nl/en/2019-montes-muse-cabernet-sauvignon
  ('Montes', 'Alpha M', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GMO11CL-montes-alpha
  ('Montes', 'Folly Syrah', 'Colchagua Valley, Chile', 'Syrah', 'Red'),  -- https://monteswines.com/EN/landing/Divine-collection
  ('Montes', 'Purple Angel', 'Colchagua Valley, Chile', 'Carmenère', 'Red'),  -- https://monteswines.com/EN/vinos/purple-angel
  ('Montes', 'Wings Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://monteswines.com/EN/vinos/wings
  ('Montes', 'Wings Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://monteswines.com/EN/vinos/wings
  ('Montes', 'Alpha Special Cuvée Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://monteswines.com/EN/vinos/alpha-special-cuvee
  ('Montes', 'Alpha Special Cuvée Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://monteswines.com/EN/vinos/alpha-special-cuvee
  ('Montes', 'Alpha Special Cuvée Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://monteswines.com/EN/vinos/alpha-special-cuvee
  ('Montes', 'Alpha Special Cuvée Syrah', 'Chile', 'Syrah', 'Red'),  -- https://monteswines.com/EN/vinos/alpha-special-cuvee
  ('Montes', 'Alpha Special Cuvée Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://monteswines.com/EN/vinos/alpha-special-cuvee
  ('Montes', 'Alpha Special Cuvée Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://monteswines.com/EN/vinos/alpha-special-cuvee
  ('Montes', 'Outer Limits Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://monteswines.com/EN/vinos/outer-limits
  ('Montes', 'Outer Limits Albariño', 'Chile', 'Albariño', 'White'),  -- https://monteswines.com/EN/vinos/outer-limits
  ('Montes', 'Outer Limits Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://monteswines.com/EN/vinos/outer-limits
  ('Montes', 'Outer Limits Syrah', 'Chile', 'Syrah', 'Red'),  -- https://monteswines.com/EN/vinos/outer-limits
  ('Montes', 'Outer Limits Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GMO11CL-montes-alpha
  ('Montes', 'Outer Limits CGM', 'Colchagua Valley, Chile', 'Carignan, Grenache, Mourvèdre', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GMO11CL-montes-alpha
  ('Montes', 'Alpha Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://monteswines.com/EN/vinos/alpha
  ('Montes', 'Alpha Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://monteswines.com/EN/vinos/alpha
  ('Montes', 'Alpha Malbec', 'Chile', 'Malbec', 'Red'),  -- https://monteswines.com/EN/vinos/alpha
  ('Montes', 'Alpha Merlot', 'Chile', 'Merlot', 'Red'),  -- https://monteswines.com/EN/vinos/alpha
  ('Montes', 'Alpha Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://monteswines.com/EN/vinos/alpha
  ('Montes', 'Alpha Syrah', 'Chile', 'Syrah', 'Red'),  -- https://monteswines.com/EN/vinos/alpha
  ('Montes', 'Alpha Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://monteswines.com/EN/vinos/alpha
  ('Montes', 'Alpha Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://monteswines.com/EN/vinos/alpha
  ('Montes', 'Limited Selection Cabernet Sauvignon Carmenère', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Carmenère', 'Red'),  -- https://monteswines.com/EN/vinos/limited-selection
  ('Montes', 'Limited Selection Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://monteswines.com/EN/vinos/limited-selection
  ('Montes', 'Limited Selection Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://monteswines.com/EN/vinos/limited-selection
  ('Montes', 'Limited Selection Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://monteswines.com/EN/vinos/limited-selection
  ('Montes', 'Limited Selection Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://monteswines.com/EN/vinos/limited-selection
  ('Montes', 'Classic Series Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://monteswines.com/EN/vinos/classic-series
  ('Montes', 'Classic Series Merlot', 'Chile', 'Merlot', 'Red'),  -- https://monteswines.com/EN/vinos/classic-series
  ('Montes', 'Classic Series Malbec', 'Chile', 'Malbec', 'Red'),  -- https://monteswines.com/EN/vinos/classic-series
  ('Montes', 'Classic Series Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://monteswines.com/EN/vinos/classic-series
  ('Montes', 'Classic Series Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://monteswines.com/EN/vinos/classic-series
  ('Montes', 'Sparkling Angel Brut', 'Aconcagua Valley, Chile', null, 'Sparkling'),  -- https://monteswines.com/EN/vinos/sparkling-angel
  ('Montes', 'Twins Red Blend', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Tempranillo, Syrah, Carmenère', 'Red'),  -- https://monteswines.com/EN/vinos/twins
  ('Montes', 'Cherub Rosé', 'Colchagua Valley, Chile', 'Syrah', 'Rosé')  -- https://monteswines.com/EN/vinos/cherub
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ERRÁZURIZ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Errázuriz', 'Estate Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/estate-reserva/
  ('Errázuriz', 'Estate Reserva Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/estate-reserva/
  ('Errázuriz', 'Estate Reserva Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/estate-reserva/
  ('Errázuriz', 'Estate Reserva Pinot Grigio', 'Chile', 'Pinot Grigio', 'White'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/estate-reserva/
  ('Errázuriz', 'Estate Reserva Sauvignon Blanc', 'Aconcagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/estate-reserva/
  ('Errázuriz', 'Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/gran-reserva/
  ('Errázuriz', 'Gran Reserva Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/gran-reserva/
  ('Errázuriz', 'Gran Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/gran-reserva/
  ('Errázuriz', 'Gran Reserva Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/gran-reserva/
  ('Errázuriz', 'Max Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/max/
  ('Errázuriz', 'Max Carmenère', 'Aconcagua Valley, Chile', 'Carmenère', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/max/
  ('Errázuriz', 'Max Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/max/
  ('Errázuriz', 'Max Shiraz', 'Chile', 'Shiraz', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/max/
  ('Errázuriz', 'Max Reserva Merlot', 'Aconcagua Valley, Chile', 'Merlot', 'Red'),  -- https://bestofwines.com/wine/wine-producer/errazuriz/
  ('Errázuriz', 'Aconcagua Alto Cabernet Sauvignon', 'Aconcagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/specialities/
  ('Errázuriz', 'Aconcagua Costa Chardonnay', 'Aconcagua Valley, Chile', 'Chardonnay', 'White'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/specialities/
  ('Errázuriz', 'Aconcagua Costa Pinot Noir', 'Aconcagua Valley, Chile', 'Pinot Noir', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/specialities/
  ('Errázuriz', 'Late Harvest Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'Sweet'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/specialities/
  ('Errázuriz', 'Wild Ferment Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/specialities/
  ('Errázuriz', 'Blanc de Blancs Brut Nature', 'Aconcagua Valley, Chile', null, 'Sparkling'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/specialities/
  ('Errázuriz', 'Extra Brut', 'Chile', 'Chardonnay, Pinot Noir', 'Sparkling'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/specialities/
  ('Errázuriz', 'Don Maximiano Founder''s Reserve', 'Aconcagua Valley, Chile', null, 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/flagship/
  ('Errázuriz', 'Kai Carmenère', 'Aconcagua Valley, Chile', 'Carmenère', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/flagship/
  ('Errázuriz', 'Las Pizarras Chardonnay', 'Aconcagua Valley, Chile', 'Chardonnay', 'White'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/flagship/
  ('Errázuriz', 'Las Pizarras Pinot Noir', 'Aconcagua Valley, Chile', 'Pinot Noir', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/flagship/
  ('Errázuriz', 'Las Pizarras Syrah', 'Aconcagua Valley, Chile', 'Syrah', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/errazuriz/wines/range/flagship/
  ('Errázuriz', 'La Cumbre Syrah', 'Aconcagua Valley, Chile', 'Syrah', 'Red')  -- https://bestofwines.com/wine/wine-producer/errazuriz/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ARBOLEDA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Arboleda', 'Brisa', 'Aconcagua Valley, Chile', null, 'Red'),  -- https://arboledawines.com/wines/
  ('Arboleda', 'Sauvignon Blanc', 'Aconcagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://arboledawines.com/wines/
  ('Arboleda', 'Chardonnay', 'Aconcagua Valley, Chile', 'Chardonnay', 'White'),  -- https://arboledawines.com/wines/
  ('Arboleda', 'Pinot Noir', 'Aconcagua Valley, Chile', 'Pinot Noir', 'Red'),  -- https://arboledawines.com/wines/
  ('Arboleda', 'Syrah', 'Aconcagua Valley, Chile', 'Syrah', 'Red'),  -- https://arboledawines.com/wines/
  ('Arboleda', 'Carmenere', 'Aconcagua Valley, Chile', 'Carmenere', 'Red'),  -- https://arboledawines.com/wines/
  ('Arboleda', 'Cabernet Sauvignon', 'Aconcagua Valley, Chile', 'Cabernet Sauvignon', 'Red')  -- https://arboledawines.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SEÑA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Seña', 'Rocas de Seña', 'Aconcagua Valley, Chile', 'Malbec, Syrah, Grenache', 'Red')  -- https://www.hatchmansfield.com/our-winemakers/sena/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA CHADWICK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Chadwick', 'Viñedo Chadwick', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red')  -- https://www.hatchmansfield.com/our-winemakers/vinedo-chadwick/wine/vinedo-chadwick-2015-3x75cl/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA CALITERRA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Caliterra', 'Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/reserva/
  ('Viña Caliterra', 'Reserva Carmenère', 'Colchagua Valley, Chile', 'Carmenère', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/reserva/
  ('Viña Caliterra', 'Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/reserva/
  ('Viña Caliterra', 'Reserva Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/reserva/
  ('Viña Caliterra', 'Reserva Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/reserva/
  ('Viña Caliterra', 'Reserva Shiraz', 'Chile', 'Shiraz', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/reserva/
  ('Viña Caliterra', 'Tributo Gran Reserva Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/tributo-gran-reserva/
  ('Viña Caliterra', 'Tributo Gran Reserva Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/tributo-gran-reserva/
  ('Viña Caliterra', 'Tributo Gran Reserva Chardonnay', 'Casablanca Valley, Chile', 'Chardonnay', 'White'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/tributo-gran-reserva/
  ('Viña Caliterra', 'Tributo Gran Reserva Mezcla Tinta', 'Colchagua Valley, Chile', null, 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/tributo-gran-reserva/
  ('Viña Caliterra', 'Tributo Gran Reserva Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/tributo-gran-reserva/
  ('Viña Caliterra', 'Pétreo Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/petreo/
  ('Viña Caliterra', 'Pétreo Malbec', 'Chile', 'Malbec', 'Red')  -- https://www.hatchmansfield.com/our-winemakers/caliterra/wines/range/petreo/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- UNDURRAGA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Undurraga', 'Altazor', 'Maipo Valley, Chile', 'Cabernet Sauvignon, Carmenere, Carignan', 'Red'),  -- https://undurraga.cl/icono/
  ('Undurraga', 'Extinto', 'Cachapoal Valley, Chile', 'Carmenere', 'Red'),  -- https://undurraga.cl/ultra-premium/
  ('Undurraga', 'Trama', 'San Antonio Valley, Chile', 'Pinot Noir', 'Red'),  -- https://undurraga.cl/ultra-premium/trama/
  ('Undurraga', 'Red Field Blend', 'Maule Valley, Chile', 'Malbec, Carignan, Cabernet Sauvignon, Cinsault, País', 'Red'),  -- https://undurraga.cl/ultra-premium/red-field-blend/
  ('Undurraga', 'Cauquen', 'Maule Valley, Chile', 'Garnacha', 'Red'),  -- https://undurraga.cl/ultra-premium/
  ('Undurraga', 'Founder''s Collection Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://undurraga.cl/ultra-premium/founder/
  ('Undurraga', 'Founder''s Collection Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://undurraga.cl/ultra-premium/founder/
  ('Undurraga', 'Vigno Carignan', 'Maule Valley, Chile', 'Carignan', 'Red'),  -- https://undurraga.cl/ultra-premium/vigno/
  ('Undurraga', 'T.H. Terroir Hunter Cabernet Sauvignon Alto Maipo', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Cabernet Sauvignon Cauquenes', 'Maule Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Carmenere Peumo', 'Cachapoal Valley, Chile', 'Carmenere', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Carignan Maule', 'Maule Valley, Chile', 'Carignan', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Cabernet Franc Maipo', 'Maipo Valley, Chile', 'Cabernet Franc', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Chardonnay Limarí', 'Limarí Valley, Chile', 'Chardonnay', 'White'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Pinot Noir Leyda', 'Leyda Valley, Chile', 'Pinot Noir', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Pinot Noir Malleco', 'Malleco Valley, Chile', 'Pinot Noir', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Sauvignon Blanc Leyda', 'Leyda Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Sauvignon Blanc Limarí', 'Limarí Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Syrah Limarí', 'Limarí Valley, Chile', 'Syrah', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Syrah Leyda', 'Leyda Valley, Chile', 'Syrah', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Syrah Cauquenes', 'Maule Valley, Chile', 'Syrah', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Merlot Casablanca', 'Chile', 'Merlot', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Riesling San Antonio', 'San Antonio Valley, Chile', 'Riesling', 'White'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Terroir Hunter Malbec', 'Limarí Valley, Chile', 'Malbec', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter/
  ('Undurraga', 'T.H. Rarities Garnacha Cariñena Monastrell', 'Maule Valley, Chile', 'Garnacha, Carignan, Monastrell', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter-rarities/
  ('Undurraga', 'T.H. Rarities País Cinsault', 'Maule Valley, Chile', 'País, Cinsault', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter-rarities/
  ('Undurraga', 'T.H. Rarities Montepulciano', 'Maule Valley, Chile', 'Montepulciano', 'Red'),  -- https://undurraga.cl/premium/t-h-terroir-hunter-rarities/
  ('Undurraga', 'T.H. Rarities Riesling Sauvignon Gris', 'Leyda Valley, Chile', 'Riesling, Sauvignon Gris', 'White'),  -- https://undurraga.cl/premium/t-h-terroir-hunter-rarities/
  ('Undurraga', 'Sibaris Gran Reserva Cabernet Sauvignon', 'Maule Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://undurraga.cl/gran-reserva/sibaris/
  ('Undurraga', 'Sibaris Gran Reserva Carmenere', 'Rapel Valley, Chile', 'Carmenere', 'Red'),  -- https://undurraga.cl/gran-reserva/sibaris/
  ('Undurraga', 'Sibaris Gran Reserva Merlot', 'Maipo Valley, Chile', 'Merlot', 'Red'),  -- https://undurraga.cl/gran-reserva/sibaris/
  ('Undurraga', 'Sibaris Gran Reserva Pinot Noir', 'Leyda Valley, Chile', 'Pinot Noir', 'Red'),  -- https://undurraga.cl/gran-reserva/sibaris/
  ('Undurraga', 'Sibaris Gran Reserva Sauvignon Blanc', 'Leyda Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://undurraga.cl/gran-reserva/sibaris/
  ('Undurraga', 'Sibaris Gran Reserva Chardonnay', 'Leyda Valley, Chile', 'Chardonnay', 'White'),  -- https://undurraga.cl/gran-reserva/sibaris/
  ('Undurraga', 'Sibaris Black Syrah Carignan Grenache', 'Maule Valley, Chile', 'Syrah, Carignan, Grenache', 'Red'),  -- https://undurraga.cl/gran-reserva/sibaris-black/
  ('Undurraga', 'Sibaris Black Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://undurraga.cl/gran-reserva/sibaris-black/
  ('Undurraga', 'Sibaris Black Viognier Roussanne', 'Maule Valley, Chile', 'Viognier, Roussanne', 'White'),  -- https://undurraga.cl/gran-reserva/sibaris-black/
  ('Undurraga', 'Aliwen Gran Reserva Cabernet Sauvignon', 'Maule Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://undurraga.cl/gran-reserva/aliwen-gran-reserva/
  ('Undurraga', 'Aliwen Gran Reserva Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://undurraga.cl/gran-reserva/aliwen-gran-reserva/
  ('Undurraga', 'Aliwen Reserva Cabernet Sauvignon', 'Maule Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Carmenere', 'Rapel Valley, Chile', 'Carmenere', 'Red'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Merlot', 'Central Valley, Chile', 'Merlot', 'Red'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Malbec', 'Maule Valley, Chile', 'Malbec', 'Red'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Pinot Noir', 'Aconcagua Valley, Chile', 'Pinot Noir', 'Red'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Rosé', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Syrah, Merlot', 'Rosé'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Sauvignon Blanc', 'Leyda Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Chardonnay', 'Central Valley, Chile', 'Chardonnay', 'White'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Cabernet Sauvignon Carmenere', 'Central Valley, Chile', 'Cabernet Sauvignon, Carmenere', 'Red'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Cabernet Sauvignon Merlot', 'Central Valley, Chile', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Reserva Cabernet Sauvignon Syrah', 'Central Valley, Chile', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://undurraga.cl/reserva/aliwen/
  ('Undurraga', 'Aliwen Orgánico Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://undurraga.cl/reserva/aliwen-reserva-especial/
  ('Undurraga', 'Aliwen Orgánico Sauvignon Blanc', 'Maule Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://undurraga.cl/reserva/aliwen-reserva-especial/
  ('Undurraga', 'U Cabernet Sauvignon', 'Central Valley, Chile', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://undurraga.cl/varietales/
  ('Undurraga', 'U Carmenere', 'Central Valley, Chile', 'Carmenere, Syrah', 'Red'),  -- https://undurraga.cl/varietales/
  ('Undurraga', 'U Merlot', 'Central Valley, Chile', 'Merlot, Syrah', 'Red'),  -- https://undurraga.cl/varietales/
  ('Undurraga', 'U Rosé', 'Central Valley, Chile', 'Cabernet Sauvignon', 'Rosé'),  -- https://undurraga.cl/varietales/
  ('Undurraga', 'U Sauvignon Blanc', 'Central Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://undurraga.cl/varietales/
  ('Undurraga', 'U Chardonnay', 'Central Valley, Chile', 'Chardonnay', 'White'),  -- https://undurraga.cl/varietales/
  ('Undurraga', 'Titillum Original', 'Leyda Valley, Chile', 'Chardonnay, Pinot Noir', 'Sparkling'),  -- https://undurraga.cl/espumantes/metodo-tradicional/
  ('Undurraga', 'Supreme', 'Leyda Valley, Chile', 'Chardonnay, Pinot Noir', 'Sparkling')  -- https://undurraga.cl/espumantes/metodo-tradicional/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIU MANENT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viu Manent', 'Viu 1', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://viumanent.cl/en/our-wines/iconos/
  ('Viu Manent', 'El Incidente', 'Colchagua Valley, Chile', 'Carmenere, Malbec, Petit Verdot', 'Red'),  -- https://viumanent.cl/en/our-wines/vinos-de-lujo/
  ('Viu Manent', 'Viu Infinito', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Malbec, Cabernet Franc', 'Red'),  -- https://viumanent.cl/en/our-wines/vinos-de-lujo/
  ('Viu Manent', 'Single Vineyard La Capilla Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://viumanent.cl/en/our-wines/viu-manent/
  ('Viu Manent', 'Single Vineyard El Olivar Syrah', 'Colchagua Valley, Chile', 'Syrah', 'Red'),  -- https://viumanent.cl/en/our-wines/viu-manent/
  ('Viu Manent', 'Single Vineyard Loma Blanca Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://viumanent.cl/en/our-wines/viu-manent/
  ('Viu Manent', 'Single Vineyard San Carlos Malbec', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://viumanent.cl/en/our-wines/viu-manent/
  ('Viu Manent', 'Tiny Trials Blanco de Mar Chardonnay', 'Colchagua Valley, Chile', 'Chardonnay', 'White'),  -- https://viumanent.cl/en/our-wines/viu-manent/
  ('Viu Manent', 'Tiny Trials Tinto de Mar Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://viumanent.cl/en/our-wines/viu-manent/
  ('Viu Manent', 'ViBo Viñedo Centenario', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Malbec', 'Red'),  -- https://viumanent.cl/en/our-wines/super-premium/
  ('Viu Manent', 'ViBo Punta del Viento', 'Colchagua Valley, Chile', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://viumanent.cl/en/our-wines/super-premium/
  ('Viu Manent', 'Red Blend', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Malbec, Carmenere, Syrah, Petit Verdot, Mourvèdre, Carignan, Cabernet Franc', 'Red'),  -- https://viumanent.cl/en/our-wines/gran-reserva/
  ('Viu Manent', 'Gran Reserva Malbec', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://viumanent.cl/en/our-wines/gran-reserva/
  ('Viu Manent', 'Gran Reserva Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://viumanent.cl/en/our-wines/gran-reserva/
  ('Viu Manent', 'Gran Reserva Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://viumanent.cl/en/our-wines/gran-reserva/
  ('Viu Manent', 'Gran Reserva Chardonnay', 'Colchagua Valley, Chile', 'Chardonnay', 'White'),  -- https://viumanent.cl/en/our-wines/gran-reserva/
  ('Viu Manent', 'Gran Reserva Noble Semillón', 'Colchagua Valley, Chile', 'Semillon', 'Sweet'),  -- https://viumanent.cl/en/our-wines/gran-reserva/
  ('Viu Manent', 'Reserva Malbec', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://viumanent.cl/en/our-wines/reserva/
  ('Viu Manent', 'Reserva Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://viumanent.cl/en/our-wines/reserva/
  ('Viu Manent', 'Reserva Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://viumanent.cl/en/our-wines/reserva/
  ('Viu Manent', 'Reserva Merlot', 'Colchagua Valley, Chile', 'Merlot', 'Red'),  -- https://viumanent.cl/en/our-wines/reserva/
  ('Viu Manent', 'Reserva Chardonnay', 'Colchagua Valley, Chile', 'Chardonnay', 'White'),  -- https://viumanent.cl/en/our-wines/reserva/
  ('Viu Manent', 'Reserva Malbec Rosé', 'Colchagua Valley, Chile', 'Malbec', 'Rosé'),  -- https://viumanent.cl/en/our-wines/reserva/
  ('Viu Manent', 'Reserva Sauvignon Blanc', 'Colchagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://viumanent.cl/en/our-wines/reserva/
  ('Viu Manent', 'Secreto Malbec', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://viumanent.cl/en/our-wines/secreto/
  ('Viu Manent', 'Secreto Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://viumanent.cl/en/our-wines/secreto/
  ('Viu Manent', 'Secreto Syrah', 'Colchagua Valley, Chile', 'Syrah', 'Red'),  -- https://viumanent.cl/en/our-wines/secreto/
  ('Viu Manent', 'Secreto Pinot Noir', 'Casablanca Valley, Chile', 'Pinot Noir', 'Red'),  -- https://viumanent.cl/en/our-wines/secreto/
  ('Viu Manent', 'Secreto Sauvignon Blanc', 'Colchagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://viumanent.cl/en/our-wines/secreto/
  ('Viu Manent', 'Secreto Viognier', 'Colchagua Valley, Chile', 'Viognier', 'White'),  -- https://viumanent.cl/en/our-wines/secreto/
  ('Viu Manent', 'Secreto Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://viumanent.cl/en/our-wines/secreto/
  ('Viu Manent', 'Secreto Rosé', 'Colchagua Valley, Chile', null, 'Rosé'),  -- https://viumanent.cl/en/our-wines/secreto/
  ('Viu Manent', 'Malportado', 'Colchagua Valley, Chile', 'Malbec, Tannat', 'Fortified'),  -- https://viumanent.cl/en/our-wines/specialties/
  ('Viu Manent', 'Rayuela Winemaker''s Selection Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Winemaker''s Selection Malbec', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Winemaker''s Selection Syrah', 'Colchagua Valley, Chile', 'Syrah', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Gran Reserva Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Gran Reserva Malbec', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Gran Reserva Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Gran Reserva Chardonnay', 'Colchagua Valley, Chile', 'Chardonnay', 'White'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Reserva Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Reserva Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Reserva Chardonnay', 'Colchagua Valley, Chile', 'Chardonnay', 'White'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Reserva Sauvignon Blanc', 'Colchagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Reserva Malbec', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Reserva Merlot', 'Colchagua Valley, Chile', 'Merlot', 'Red'),  -- https://viumanent.cl/en/our-wines/rayuela/
  ('Viu Manent', 'Rayuela Reserva Malbec Rosé', 'Colchagua Valley, Chile', 'Malbec', 'Rosé')  -- https://viumanent.cl/en/our-wines/rayuela/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MONTGRAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('MontGras', 'Gradientes Carmenere', 'Colchagua Valley, Chile', 'Carmenere', 'Red'),  -- https://montgras.cl/marcas/luxury-collection/
  ('MontGras', 'Intriga Linderos Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://montgras.cl/lineas/intriga-by-montgras/
  ('MontGras', 'Intriga Máxima Higueras Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://montgras.cl/marcas/luxury-collection/
  ('MontGras', 'Antu Single Vineyard Syrah', 'Chile', 'Syrah', 'Red'),  -- https://montgras.cl/lineas/montgras-antu-single-vineyard/
  ('MontGras', 'Antu Single Vineyard Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://montgras.cl/lineas/montgras-antu-single-vineyard/
  ('MontGras', 'Antu Single Vineyard Cabernet Sauvignon Carmenere', 'Chile', 'Cabernet Sauvignon, Carmenere', 'Red'),  -- https://montgras.cl/lineas/montgras-antu-single-vineyard/
  ('MontGras', 'Antu Single Vineyard Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://montgras.cl/lineas/montgras-antu-single-vineyard/
  ('MontGras', 'Antu Single Vineyard Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://montgras.cl/lineas/montgras-antu-single-vineyard/
  ('MontGras', 'Antu Single Vineyard Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://montgras.cl/lineas/montgras-antu-single-vineyard/
  ('MontGras', 'Handcrafted Rare Series Albariño', 'Chile', 'Albariño', 'White'),  -- https://montgras.cl/lineas/montgras-handcrafted-rare-series/
  ('MontGras', 'Handcrafted Rare Series Petit Verdot', 'Chile', 'Petit Verdot', 'Red'),  -- https://montgras.cl/lineas/montgras-handcrafted-rare-series/
  ('MontGras', 'Handcrafted Rare Series Garnacha', 'Chile', 'Garnacha', 'Red'),  -- https://montgras.cl/lineas/montgras-handcrafted-rare-series/
  ('MontGras', 'Handcrafted Rare Series Carignan', 'Chile', 'Carignan', 'Red'),  -- https://montgras.cl/lineas/montgras-handcrafted-rare-series/
  ('MontGras', 'Handcrafted Rare Series Cabernet Franc', 'Chile', 'Cabernet Franc', 'Red'),  -- https://montgras.cl/lineas/montgras-handcrafted-rare-series/
  ('MontGras', 'Handcrafted Rare Series Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://montgras.cl/lineas/montgras-handcrafted-rare-series/
  ('MontGras', 'Handcrafted Rare Series Cinsault', 'Chile', 'Cinsault', 'Red'),  -- https://montgras.cl/lineas/montgras-handcrafted-rare-series/
  ('MontGras', 'Handcrafted Rare Series Riesling', 'Chile', 'Riesling', 'White'),  -- https://montgras.cl/lineas/montgras-handcrafted-rare-series/
  ('MontGras', 'Reserva De Vine Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://montgras.cl/lineas/montgras-reserva-de-vine/
  ('MontGras', 'Reserva De Vine Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://montgras.cl/lineas/montgras-reserva-de-vine/
  ('MontGras', 'Reserva De Vine Merlot', 'Chile', 'Merlot', 'Red'),  -- https://montgras.cl/lineas/montgras-reserva-de-vine/
  ('MontGras', 'Reserva De Vine Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://montgras.cl/lineas/montgras-reserva-de-vine/
  ('MontGras', 'Reserva De Vine Viognier', 'Chile', 'Viognier', 'White'),  -- https://montgras.cl/lineas/montgras-reserva-de-vine/
  ('MontGras', 'Reserva De Vine Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://montgras.cl/lineas/montgras-reserva-de-vine/
  ('MontGras', 'Reserva De Vine Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://montgras.cl/lineas/montgras-reserva-de-vine/
  ('MontGras', 'Reserva De Vine Rosé', 'Chile', null, 'Rosé'),  -- https://montgras.cl/lineas/montgras-reserva-de-vine/
  ('MontGras', 'Gran Reserva Day One Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://montgras.cl/lineas/montgras-gran-reserva-day-one/
  ('MontGras', 'Gran Reserva Day One Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://montgras.cl/lineas/montgras-gran-reserva-day-one/
  ('MontGras', 'Gran Reserva Day One Merlot', 'Chile', 'Merlot', 'Red'),  -- https://montgras.cl/lineas/montgras-gran-reserva-day-one/
  ('MontGras', 'Gran Reserva Day One Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://montgras.cl/lineas/montgras-gran-reserva-day-one/
  ('MontGras', 'Gran Reserva Day One Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://montgras.cl/lineas/montgras-gran-reserva-day-one/
  ('MontGras', 'Gran Reserva Day One Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://montgras.cl/lineas/montgras-gran-reserva-day-one/
  ('MontGras', 'Quatro Tinto', 'Chile', null, 'Red'),  -- https://montgras.cl/lineas/quatro/
  ('MontGras', 'Quatro Blanco', 'Chile', null, 'White'),  -- https://montgras.cl/lineas/quatro/
  ('MontGras', 'Barrel Selection Gran Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://montgras.cl/lineas/montgras-barrel-selection/
  ('MontGras', 'Barrel Selection Gran Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://montgras.cl/lineas/montgras-barrel-selection/
  ('MontGras', 'Barrel Selection Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://montgras.cl/lineas/montgras-barrel-selection/
  ('MontGras', 'Late Harvest Sauvignon Blanc Gewürztraminer', 'Leyda Valley, Chile', 'Sauvignon Blanc, Gewürztraminer', 'Sweet'),  -- https://montgras.cl/lineas/montgras-late-harvest/
  ('MontGras', 'Early Harvest Low Alcohol Rosé', 'Chile', null, 'Rosé'),  -- https://montgras.cl/lineas/
  ('MontGras', 'Organic Red Blend', 'Chile', null, 'Red'),  -- https://montgras.cl/lineas/montgras-organic_vino/
  ('MontGras', 'Organic Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://montgras.cl/lineas/montgras-organic_vino/
  ('MontGras', 'Organic Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://montgras.cl/lineas/montgras-organic_vino/
  ('MontGras', 'Estate Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://montgras.cl/lineas/montgras-estates/
  ('MontGras', 'Estate Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://montgras.cl/lineas/montgras-estates/
  ('MontGras', 'Estate Merlot', 'Chile', 'Merlot', 'Red'),  -- https://montgras.cl/lineas/montgras-estates/
  ('MontGras', 'Estate Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://montgras.cl/lineas/montgras-estates/
  ('MontGras', 'Estate Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://montgras.cl/lineas/montgras-estates/
  ('MontGras', 'Estate Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://montgras.cl/lineas/montgras-estates/
  ('MontGras', 'Estate Rosé', 'Chile', null, 'Rosé'),  -- https://montgras.cl/lineas/montgras-estates/
  ('MontGras', 'MG Estate Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red')  -- https://montgras.cl/lineas/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- AMARAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Amaral', 'Brut', 'Leyda Valley, Chile', null, 'Sparkling'),  -- https://montgras.cl/lineas/amaral-by-montgras/
  ('Amaral', 'Syrah', 'Leyda Valley, Chile', 'Syrah', 'Red'),  -- https://montgras.cl/lineas/amaral-by-montgras/
  ('Amaral', 'Pinot Noir', 'Leyda Valley, Chile', 'Pinot Noir', 'Red'),  -- https://montgras.cl/lineas/amaral-by-montgras/
  ('Amaral', 'Chardonnay', 'Leyda Valley, Chile', 'Chardonnay', 'White'),  -- https://montgras.cl/lineas/amaral-by-montgras/
  ('Amaral', 'Sauvignon Blanc', 'Leyda Valley, Chile', 'Sauvignon Blanc', 'White')  -- https://montgras.cl/lineas/amaral-by-montgras/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA CASAS DEL BOSQUE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Casas del Bosque', 'Gran Bosque', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://casasdelbosque.cl/en/content/7-gran-bosque
  ('Viña Casas del Bosque', 'La Trampa', 'Chile', 'Syrah, Malbec, Pinot Noir', 'Red'),  -- https://casasdelbosque.cl/en/content/81-private-reserve
  ('Viña Casas del Bosque', 'Bo Extra Brut', 'Casablanca Valley, Chile', 'Chardonnay, Pinot Noir', 'Sparkling'),  -- https://casasdelbosque.cl/en/content/91-bo
  ('Viña Casas del Bosque', 'Pequeñas Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://casasdelbosque.cl/en/content/80-pequenas
  ('Viña Casas del Bosque', 'Pequeñas Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://casasdelbosque.cl/en/content/80-pequenas
  ('Viña Casas del Bosque', 'Pequeñas Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://casasdelbosque.cl/en/content/80-pequenas
  ('Viña Casas del Bosque', 'Pequeñas Syrah', 'Chile', 'Syrah', 'Red'),  -- https://casasdelbosque.cl/en/content/80-pequenas
  ('Viña Casas del Bosque', 'Gran Reserva Chardonnay', 'Casablanca Valley, Chile', 'Chardonnay', 'White'),  -- https://casasdelbosque.cl/en/content/18-chardonnay
  ('Viña Casas del Bosque', 'Gran Reserva Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://casasdelbosque.cl/en/content/32-our-wines
  ('Viña Casas del Bosque', 'Gran Reserva Syrah', 'Chile', 'Syrah', 'Red'),  -- https://casasdelbosque.cl/en/content/32-our-wines
  ('Viña Casas del Bosque', 'Gran Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://casasdelbosque.cl/en/content/32-our-wines
  ('Viña Casas del Bosque', 'Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://casasdelbosque.cl/en/content/32-our-wines
  ('Viña Casas del Bosque', 'Botanic Series Sauvignon Blanc La Cantera', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://casasdelbosque.cl/en/content/32-our-wines
  ('Viña Casas del Bosque', 'Botanic Series Riesling', 'Chile', 'Riesling', 'White'),  -- https://casasdelbosque.cl/en/content/32-our-wines
  ('Viña Casas del Bosque', 'Botanic Series Rosé Pinot Noir', 'Chile', 'Pinot Noir', 'Rosé'),  -- https://casasdelbosque.cl/en/content/32-our-wines
  ('Viña Casas del Bosque', 'Botanic Series Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://casasdelbosque.cl/en/content/32-our-wines
  ('Viña Casas del Bosque', 'Botanic Series Syrah', 'Casablanca Valley, Chile', 'Syrah', 'Red'),  -- https://casasdelbosque.cl/en/content/152-syrah-botanic-series
  ('Viña Casas del Bosque', 'Botanic Series Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://casasdelbosque.cl/en/content/32-our-wines
  ('Viña Casas del Bosque', 'Collection Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://casasdelbosque.cl/en/content/163-collection
  ('Viña Casas del Bosque', 'Collection Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://casasdelbosque.cl/en/content/163-collection
  ('Viña Casas del Bosque', 'Collection Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://casasdelbosque.cl/en/content/163-collection
  ('Viña Casas del Bosque', 'Collection Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://casasdelbosque.cl/en/content/163-collection
  ('Viña Casas del Bosque', 'Late Harvest Riesling', 'Chile', 'Riesling', 'Sweet')  -- https://casasdelbosque.cl/en/content/32-our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAPOSTOLLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Lapostolle', 'Grand Selection Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Carmenere, Petit Verdot', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Grand Selection Carmenere', 'Colchagua Valley, Chile', 'Carmenere, Merlot, Petit Verdot', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Grand Selection Merlot', 'Colchagua Valley, Chile', 'Merlot, Syrah, Cabernet Franc', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Grand Selection Sauvignon Blanc', 'Colchagua Valley, Chile', 'Sauvignon Blanc, Semillon', 'White'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Le Rosé', 'Colchagua Valley, Chile', 'Cinsault, Grenache, Syrah, Mourvèdre', 'Rosé'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Apalta', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Carmenere, Syrah, Merlot', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Cuvée Alexandre Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon, Syrah, Cabernet Franc', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Cuvée Alexandre Carmenere', 'Colchagua Valley, Chile', 'Carmenere, Syrah, Petit Verdot', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Cuvée Alexandre Merlot', 'Colchagua Valley, Chile', 'Merlot, Carmenere, Cabernet Franc', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Cuvée Alexandre Cabernet Franc', 'Colchagua Valley, Chile', 'Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'La Parcelle 8', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Collection Vigno Carignan', 'Chile', 'Carignan', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Collection Cinsault', 'Colchagua Valley, Chile', 'Cinsault', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Collection Grenache', 'Chile', 'Grenache', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Collection Mourvèdre', 'Chile', 'Mourvèdre', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Collection Petit Verdot', 'Chile', 'Petit Verdot', 'Red'),  -- https://lapostollewines.com/en/wines/
  ('Lapostolle', 'Collection Semillón Torontel', 'Chile', 'Semillon, Torontel', 'White')  -- https://lapostollewines.com/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- EMILIANA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Emiliana', 'Adobe Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Viognier', 'Chile', 'Viognier', 'White'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Gewürztraminer', 'Chile', 'Gewürztraminer', 'White'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Adobe Reserva Rosé', 'Chile', null, 'Rosé'),  -- https://www.emiliana.cl/en/vinos/adobe/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Carmenere Cabernet Sauvignon', 'Chile', 'Carmenere, Cabernet Sauvignon', 'Red'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Viognier', 'Chile', 'Viognier', 'White'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Stellar Selection Cabernet Sauvignon Syrah Carignan', 'Chile', 'Cabernet Sauvignon, Syrah, Carignan', 'Red'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Syrah Mourvèdre', 'Chile', 'Syrah, Mourvèdre', 'Red'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Garnacha Syrah', 'Chile', 'Garnacha, Syrah', 'Red'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Novas Gran Reserva Riesling', 'Chile', 'Riesling', 'White'),  -- https://www.emiliana.cl/en/vinos/novas/cabernet-sauvignon/
  ('Emiliana', 'Eco Balance Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Eco Balance Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Eco Balance Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Eco Balance Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Eco Balance Gewürztraminer', 'Chile', 'Gewürztraminer', 'White'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Eco Balance Viognier', 'Chile', 'Viognier', 'White'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Eco Balance Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Eco Balance Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Eco Balance Rosé', 'Chile', null, 'Rosé'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Salvaje Syrah Roussanne', 'Chile', 'Syrah, Roussanne', 'Red'),  -- https://www.emiliana.cl/en/vinos/salvaje/
  ('Emiliana', 'Animalia Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Tais Rosé', 'Chile', null, 'Rosé'),  -- https://www.emiliana.cl/en/vinos/eco/pinot-noir/
  ('Emiliana', 'Gê', 'Chile', 'Syrah, Carmenere, Cabernet Sauvignon', 'Red')  -- https://www.emiliana.cl/en/vinos/ge/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VENTISQUERO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Ventisquero', 'Grey Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Grey Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Grey Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Grey Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Grey Cabernet Franc', 'Chile', 'Cabernet Franc', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Grey Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Alma de Los Andes Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Alma de Los Andes Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Alma de Los Andes Reserva Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Alma de Los Andes Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Alma de Los Andes Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Alma de Los Andes Reserva Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Alma de Los Andes Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Queulat Gran Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Queulat Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Queulat Gran Reserva Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Queulat Gran Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Queulat Gran Reserva Cinsault', 'Chile', 'Cinsault', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Queulat Gran Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Enclave Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Ramirana Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Heru Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Kalfu Kuda Gran Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.jumbo.cl/ventisquero
  ('Ventisquero', 'Kalfu Kuda Gran Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White')  -- https://www.jumbo.cl/ventisquero
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LUIS FELIPE EDWARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Luis Felipe Edwards', 'Pater', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.lfewines.com/portfolio/pater/
  ('Luis Felipe Edwards', 'Doña Bernarda', 'Colchagua Valley, Chile', null, 'Red'),  -- https://www.lfewines.com/portfolio/dona-bernarda-2/
  ('Luis Felipe Edwards', 'LFE900 Malbec', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://www.lfewines.com/portfolio/lfe900/
  ('Luis Felipe Edwards', 'Cien Carignan', 'Maule Valley, Chile', 'Carignan', 'Red'),  -- https://www.lfewines.com/portfolio/cien-carignan-2/
  ('Luis Felipe Edwards', '360º Series Mountain Red Blend', 'Colchagua Valley, Chile', null, 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Monastrell', 'Colchagua Valley, Chile', 'Monastrell', 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Tempranillo', 'Colchagua Valley, Chile', 'Tempranillo', 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Grenache', 'Colchagua Valley, Chile', 'Grenache', 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Sangiovese', 'Colchagua Valley, Chile', 'Sangiovese', 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Cabernet Franc', 'Colchagua Valley, Chile', 'Cabernet Franc', 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Carménère', 'Rapel Valley, Chile', 'Carménère', 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Carignan', 'Maule Valley, Chile', 'Carignan', 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', '360º Series Roussanne Marsanne', 'Colchagua Valley, Chile', 'Roussanne, Marsanne', 'White'),  -- https://www.lfewines.com/portfolio/lfe360o/
  ('Luis Felipe Edwards', 'Marea Chardonnay', 'Leyda Valley, Chile', 'Chardonnay', 'White'),  -- https://www.lfewines.com/portfolio/marea-valle-de-leyda/
  ('Luis Felipe Edwards', 'Marea Pinot Noir', 'Leyda Valley, Chile', 'Pinot Noir', 'Red'),  -- https://www.lfewines.com/portfolio/marea-valle-de-leyda/
  ('Luis Felipe Edwards', 'Marea Sauvignon Blanc', 'Leyda Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.lfewines.com/portfolio/marea-valle-de-leyda/
  ('Luis Felipe Edwards', 'Marea Syrah', 'Leyda Valley, Chile', 'Syrah', 'Red'),  -- https://www.lfewines.com/portfolio/marea-valle-de-leyda/
  ('Luis Felipe Edwards', 'Ocho Millas Pinot Noir', 'Leyda Valley, Chile', 'Pinot Noir', 'Red'),  -- https://www.lfewines.com/portfolio/ocho-millas/
  ('Luis Felipe Edwards', 'Ocho Millas Sauvignon Blanc', 'Leyda Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.lfewines.com/portfolio/ocho-millas/
  ('Luis Felipe Edwards', 'Ocho Millas Chardonnay', 'Leyda Valley, Chile', 'Chardonnay', 'White'),  -- https://www.lfewines.com/portfolio/ocho-millas/
  ('Luis Felipe Edwards', 'Ocho Millas Sauvignon Blanc Blush', 'Leyda Valley, Chile', 'Sauvignon Blanc', 'Rosé'),  -- https://www.lfewines.com/portfolio/ocho-millas/
  ('Luis Felipe Edwards', 'Cinso', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.lfewines.com/portfolio/cinso__pai/
  ('Luis Felipe Edwards', 'Paí', 'Maule Valley, Chile', 'País', 'Red'),  -- https://www.lfewines.com/portfolio/cinso__pai/
  ('Luis Felipe Edwards', 'Primo', 'Colchagua Valley, Chile', 'Carmenère, Malbec', 'Red'),  -- https://www.lfewines.com/portfolio/primo/
  ('Luis Felipe Edwards', 'Macerao Moscatel', 'Itata Valley, Chile', 'Moscatel de Alejandría', 'Orange'),  -- https://www.lfewines.com/portfolio/macerao/
  ('Luis Felipe Edwards', 'Macerao Semillón', 'Colchagua Valley, Chile', 'Semillón', 'Orange'),  -- https://www.lfewines.com/portfolio/macerao/
  ('Luis Felipe Edwards', 'Malblanc', 'Colchagua Valley, Chile', 'Malbec, Gewürztraminer', 'White'),  -- https://www.lfewines.com/portfolio/malblanc-copy/
  ('Luis Felipe Edwards', 'Rosa Blanca Organic Red Blend', 'Colchagua Valley, Chile', null, 'Red'),  -- https://www.lfewines.com/portfolio/rosa-blanca/
  ('Luis Felipe Edwards', 'Rosa Blanca Organic Carmenère', 'Colchagua Valley, Chile', 'Carmenère', 'Red'),  -- https://www.lfewines.com/portfolio/rosa-blanca/
  ('Luis Felipe Edwards', 'Rosa Blanca Organic Sauvignon Blanc', 'Colchagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.lfewines.com/portfolio/rosa-blanca/
  ('Luis Felipe Edwards', 'Rosa Blanca Organic Chardonnay', 'Colchagua Valley, Chile', 'Chardonnay', 'White'),  -- https://www.lfewines.com/portfolio/rosa-blanca/
  ('Luis Felipe Edwards', 'Flora Organic Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.lfewines.com/portfolio/flora/
  ('Luis Felipe Edwards', 'Flora Organic Carmenère', 'Colchagua Valley, Chile', 'Carmenère', 'Red'),  -- https://www.lfewines.com/portfolio/flora/
  ('Luis Felipe Edwards', 'Flora Organic Red Blend', 'Colchagua Valley, Chile', null, 'Red'),  -- https://www.lfewines.com/portfolio/flora/
  ('Luis Felipe Edwards', 'Flora Organic Rosé', 'Colchagua Valley, Chile', null, 'Rosé'),  -- https://www.lfewines.com/portfolio/flora/
  ('Luis Felipe Edwards', 'Flora Organic Sauvignon Blanc', 'Colchagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.lfewines.com/portfolio/flora/
  ('Luis Felipe Edwards', 'Vado Extra Brut', 'Colchagua Valley, Chile', null, 'Sparkling'),  -- https://www.lfewines.com/portfolio/vado/
  ('Luis Felipe Edwards', 'Vado Brut', 'Colchagua Valley, Chile', null, 'Sparkling'),  -- https://www.lfewines.com/portfolio/vado/
  ('Luis Felipe Edwards', 'Vado Brut Rosé', 'Colchagua Valley, Chile', null, 'Sparkling'),  -- https://www.lfewines.com/portfolio/vado/
  ('Luis Felipe Edwards', 'Vado Moscatel', 'Colchagua Valley, Chile', 'Moscatel', 'Sparkling'),  -- https://www.lfewines.com/portfolio/vado/
  ('Luis Felipe Edwards', 'Late Harvest', 'Colchagua Valley, Chile', 'Viognier, Sauvignon Blanc', 'Sweet'),  -- https://www.lfewines.com/portfolio/late-harvest/
  ('Luis Felipe Edwards', 'Gran Reserva Carmenère', 'Colchagua Valley, Chile', 'Carmenère', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Merlot', 'Colchagua Valley, Chile', 'Merlot', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Syrah', 'Colchagua Valley, Chile', 'Syrah', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Malbec', 'Colchagua Valley, Chile', 'Malbec', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Cabernet Sauvignon', 'Colchagua Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Red Blend', 'Colchagua Valley, Chile', null, 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Cabernet Franc', 'Colchagua Valley, Chile', 'Cabernet Franc', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Roussanne', 'Colchagua Valley, Chile', 'Roussanne', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Sauvignon Blanc', 'Leyda Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Riesling', 'Leyda Valley, Chile', 'Riesling', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Pinot Noir', 'Leyda Valley, Chile', 'Pinot Noir', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Carignan', 'Maule Valley, Chile', 'Carignan', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Gran Reserva Chardonnay', 'Casablanca Valley, Chile', 'Chardonnay', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Cabernet Franc', 'Chile', 'Cabernet Franc', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Gewurztraminer', 'Chile', 'Gewurztraminer', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Pinot Grigio', 'Chile', 'Pinot Grigio', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Red Blend', 'Chile', null, 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Riesling', 'Chile', 'Riesling', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Rosé', 'Chile', null, 'Rosé'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Roussanne', 'Chile', 'Roussanne', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Reserva Viognier', 'Chile', 'Viognier', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Cabernet Sauvignon', 'Central Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Carmenère', 'Central Valley, Chile', 'Carmenère', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Chardonnay', 'Central Valley, Chile', 'Chardonnay', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Malbec', 'Central Valley, Chile', 'Malbec', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Merlot', 'Central Valley, Chile', 'Merlot', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Pinot Grigio', 'Central Valley, Chile', 'Pinot Grigio', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Pinot Noir', 'Central Valley, Chile', 'Pinot Noir', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Red Blend', 'Central Valley, Chile', null, 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Riesling', 'Central Valley, Chile', 'Riesling', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Rosé', 'Central Valley, Chile', null, 'Rosé'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Sauvignon Blanc', 'Central Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Syrah', 'Central Valley, Chile', 'Syrah', 'Red'),  -- https://www.lfewines.com/portfolio/lfe-family-wines/
  ('Luis Felipe Edwards', 'Classic Viognier', 'Central Valley, Chile', 'Viognier', 'White')  -- https://www.lfewines.com/portfolio/lfe-family-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COUSIÑO-MACUL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Cousiño-Macul', 'Antiguas Reservas Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Antiguas Reservas Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Antiguas Reservas Merlot', 'Chile', 'Merlot', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Antiguas Reservas Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Isidora Riesling', 'Chile', 'Riesling', 'White'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Isidora Sauvignon Gris', 'Chile', 'Sauvignon Gris', 'White'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Isidora Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Isidora Rosé Merlot', 'Chile', 'Merlot', 'Rosé'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Matías Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Matías Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Matías Merlot', 'Chile', 'Merlot', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Matías Syrah', 'Chile', 'Syrah', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Matías Malbec', 'Chile', 'Malbec', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Luis Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Luis Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Luis Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Luis Reserva Syrah', 'Chile', 'Syrah', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Luis Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Don Luis Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Jardín de Macul Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Jardín de Macul Merlot', 'Chile', 'Merlot', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Finis Terrae White Blend', 'Chile', null, 'White'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Finis Terrae Red Blend', 'Chile', null, 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Cabernet Franc', 'Chile', 'Cabernet Franc', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Malbec', 'Chile', 'Malbec', 'Red'),  -- https://cousinomacul.com/en/collections/all
  ('Cousiño-Macul', 'Lota', 'Chile', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://cousinomacul.com/en/blogs/noticias/lota-es-elegido-red-wine-of-the-year-por-el-reconocido-master-of-wine-britanico-tim-atkin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TABALI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Tabali', 'Talinay Pai Pinot Noir', 'Limarí Valley, Chile', 'Pinot Noir', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Talinay Lítico Malbec', 'Limarí Valley, Chile', 'Malbec', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Talinay Caliza Chardonnay', 'Limarí Valley, Chile', 'Chardonnay', 'White'),  -- https://tabali.com/en/
  ('Tabali', 'Roca Madre Malbec', 'Chile', 'Malbec', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'DOM Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Payen Syrah Cabernet Franc', 'Chile', 'Syrah, Cabernet Franc', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Transversal Mezcla Tinta', 'Chile', null, 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Talinay Pinot Noir', 'Limarí Valley, Chile', 'Pinot Noir', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Talinay Chardonnay', 'Limarí Valley, Chile', 'Chardonnay', 'White'),  -- https://tabali.com/en/
  ('Tabali', 'Talinay Sauvignon Blanc', 'Limarí Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://tabali.com/en/
  ('Tabali', 'Barranco Viognier', 'Chile', 'Viognier', 'White'),  -- https://tabali.com/en/
  ('Tabali', 'Talud Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Micas Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Vetas Blancas Malbec Cabernet Franc', 'Limarí Valley, Chile', 'Malbec, Cabernet Franc', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Vetas Blancas Cabernet Franc', 'Limarí Valley, Chile', 'Cabernet Franc', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Vetas Blancas Syrah', 'Limarí Valley, Chile', 'Syrah', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Vetas Blancas Pinot Noir', 'Limarí Valley, Chile', 'Pinot Noir', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Vetas Blancas Sauvignon Blanc', 'Limarí Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://tabali.com/en/
  ('Tabali', 'Vetas Blancas Chardonnay', 'Limarí Valley, Chile', 'Chardonnay', 'White'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Malbec', 'Chile', 'Malbec', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Rosé Pinot Noir', 'Chile', 'Pinot Noir', 'Rosé'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Viognier', 'Chile', 'Viognier', 'White'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Merlot', 'Chile', 'Merlot', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Syrah Carmenère', 'Chile', 'Syrah, Carmenère', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Syrah', 'Chile', 'Syrah', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Pedregoso Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://tabali.com/en/
  ('Tabali', 'Tatié Rosé Extra Brut', 'Chile', null, 'Sparkling'),  -- https://tabali.com/en/
  ('Tabali', 'Tatié Brut', 'Chile', null, 'Sparkling')  -- https://tabali.com/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA KOYLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Koyle', 'Gran Reserva Orgánico Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.koyle.cl/tienda/
  ('Viña Koyle', 'Gran Reserva Orgánico Carménère', 'Chile', 'Carménère', 'Red'),  -- https://www.koyle.cl/tienda/
  ('Viña Koyle', 'Gran Reserva Orgánico Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.koyle.cl/tienda/
  ('Viña Koyle', 'Royale Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.koyle.cl/tienda/
  ('Viña Koyle', 'Royale Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.koyle.cl/tienda/
  ('Viña Koyle', 'Royale Carménère', 'Chile', 'Carménère', 'Red'),  -- https://www.koyle.cl/tienda/
  ('Viña Koyle', 'Costa Sauvignon Blanc', 'Colchagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.koyle.cl/tienda/
  ('Viña Koyle', 'Costa Cuarzo Sauvignon Blanc', 'Colchagua Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.koyle.cl/tienda/
  ('Viña Koyle', 'Cerro Basalto Garnatxa', 'Chile', 'Garnatxa', 'Red')  -- https://www.koyle.cl/tienda/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MATETIC VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Matetic Vineyards', 'Syrah', 'San Antonio Valley, Chile', 'Syrah', 'Red'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Coastal Brut', 'Chile', null, 'Sparkling'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Corralillo Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Corralillo Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Corralillo Riesling', 'Chile', 'Riesling', 'White'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Corralillo Gewürztraminer', 'Chile', 'Gewürztraminer', 'White'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Corralillo Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Corralillo Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Corralillo Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Corralillo Syrah', 'Chile', 'Syrah', 'Red'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'Corralillo Late Harvest', 'Chile', null, 'Sweet'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'EQ Coastal Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'EQ Quartz Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'EQ Granite Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'EQ Cool Climate Syrah', 'Chile', 'Syrah', 'Red'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'EQ Limited Edition Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://matetic.com/en/category/matetic/
  ('Matetic Vineyards', 'EQ Limited Edition Pinot Noir', 'Chile', 'Pinot Noir', 'Red')  -- https://matetic.com/en/category/matetic/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DE MARTINO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('De Martino', 'Estate Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Estate Chardonnay', 'Maipo Valley, Chile', 'Chardonnay', 'White'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Estate Merlot', 'Maipo Valley, Chile', 'Merlot', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Estate Syrah', 'Choapa Valley, Chile', 'Syrah', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Estate Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Legado Reserva Chardonnay', 'Limarí Valley, Chile', 'Chardonnay', 'White'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Legado Reserva Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Legado Reserva Merlot', 'Maipo Valley, Chile', 'Merlot', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Legado Reserva Carmenere', 'Maipo Valley, Chile', 'Carmenere', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Legado Reserva Syrah', 'Choapa Valley, Chile', 'Syrah', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Viejas Tinajas Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Single Vineyard El León Carignan', 'Maule Valley, Chile', 'Carignan', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Single Vineyard Alto de Piedras Carmenere', 'Maipo Valley, Chile', 'Carmenere', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Familia Cabernet Sauvignon Carmenere Malbec', 'Maipo Valley, Chile', 'Cabernet Sauvignon, Carmenere, Malbec', 'Red'),  -- https://www.kedingtonwines.com/?p=620
  ('De Martino', 'Armida Carmenere', 'Chile', 'Carmenere', 'Red')  -- https://www.kedingtonwines.com/?p=620
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA LEYDA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Leyda', 'Pinot Noir Reserva', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Coastal Vineyards Las Brisas Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Sauvignon Blanc Reserva', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Chardonnay Reserva', 'Chile', 'Chardonnay', 'White'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Syrah Reserva', 'Chile', 'Syrah', 'Red'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Lot 5 Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Lot 21 Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Lot 8 Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Lot 4 Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Coastal Vineyards Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Coastal Vineyards Neblina Riesling', 'Chile', 'Riesling', 'White'),  -- https://www.enotria.com/producers/vina-leyda
  ('Viña Leyda', 'Rosé', 'Chile', null, 'Rosé')  -- https://www.enotria.com/producers/vina-leyda
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA ECHEVERRÍA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Echeverría', 'Elementos Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/echeverra/19273
  ('Viña Echeverría', 'Family Reserva Cabernet Sauvignon', 'Curicó Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/echeverra/19273
  ('Viña Echeverría', 'Brut', 'Curicó Valley, Chile', null, 'Sparkling'),  -- https://www.nataliemaclean.com/wineries/info/echeverra/19273
  ('Viña Echeverría', 'Reserva Syrah', 'Colchagua Valley, Chile', 'Syrah', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/echeverria/299
  ('Viña Echeverría', 'Reserva Cabernet Sauvignon', 'Curicó Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/echeverria/299
  ('Viña Echeverría', 'Gran Reserva Pinot Noir', 'Casablanca Valley, Chile', 'Pinot Noir', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/echeverria/299
  ('Viña Echeverría', 'Limited Edition Cabernet Sauvignon', 'Central Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/echeverria/299
  ('Viña Echeverría', 'No Es Pituko Orange Sauvignon Blanc', 'Curicó Valley, Chile', 'Sauvignon Blanc', 'Orange'),  -- https://primalwine.com/blogs/natural-wine-producers-primal-wine/vina-echeverria
  ('Viña Echeverría', 'No Es Pituko Viognier', 'Curicó Valley, Chile', 'Viognier', 'White'),  -- https://primalwine.com/blogs/natural-wine-producers-primal-wine/vina-echeverria
  ('Viña Echeverría', 'No Es Pituko Cabernet Franc', 'Curicó Valley, Chile', 'Cabernet Franc', 'Red'),  -- https://primalwine.com/blogs/natural-wine-producers-primal-wine/vina-echeverria
  ('Viña Echeverría', 'No Es Pituko Rosé', 'Curicó Valley, Chile', null, 'Rosé'),  -- https://primalwine.com/blogs/natural-wine-producers-primal-wine/vina-echeverria
  ('Viña Echeverría', 'No Es Pituko Carignan', 'Curicó Valley, Chile', 'Carignan', 'Red'),  -- https://primalwine.com/blogs/natural-wine-producers-primal-wine/vina-echeverria
  ('Viña Echeverría', 'No Es Pituko Cabernet Sauvignon', 'Curicó Valley, Chile', 'Cabernet Sauvignon', 'Red')  -- https://primalwine.com/blogs/natural-wine-producers-primal-wine/vina-echeverria
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VALDIVIESO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Valdivieso', 'Brut', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Brut Rosé', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Rosé', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Demi Sec', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Dolce Bianco', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Dolce Rosso', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Limited Brut', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Limited Extra Brut', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Método Tradicional Extra Brut', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Método Tradicional Brut Nature', 'Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Moscato', 'Chile', 'Moscato', 'Sparkling'),  -- https://www.jumbo.cl/valdivieso
  ('Valdivieso', 'Caballo Loco Grand Cru Extra Brut', 'Bío Bío Valley, Chile', null, 'Sparkling'),  -- https://www.jumbo.cl/espumante-caballo-loco-bland-de-noirs-750-cc/p
  ('Valdivieso', 'Caballo Loco Blanco Number 1', 'Limarí Valley, Chile', null, 'White'),  -- https://www.decanter.com/wine-reviews/search/valdivieso/2
  ('Valdivieso', 'Single Vineyard Cabernet Franc', 'Curicó Valley, Chile', 'Cabernet Franc', 'Red'),  -- https://www.decanter.com/wine-reviews/search/valdivieso/2
  ('Valdivieso', 'Valley Selection Gran Reserva Pinot Noir', 'Aconcagua Valley, Chile', 'Pinot Noir', 'Red')  -- https://www.decanter.com/wine-reviews/search/valdivieso/2
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CASA SILVA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Casa Silva', 'Altura', 'Chile', null, 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Microterroir Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'S 38 Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'S 7 Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Fervor del Lago Ranco', 'Chile', null, 'Sparkling'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Quinta Generación Red Blend', 'Chile', null, 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Quinta Generación White Blend', 'Chile', null, 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Lago Ranco Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Lago Ranco Riesling', 'Chile', 'Riesling', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Lago Ranco Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Cold Coast Fervor', 'Chile', null, 'Sparkling'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Cool Coast Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Cool Coast Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Cool Coast Syrah Rosé', 'Chile', 'Syrah', 'Rosé'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Cool Coast Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Cool Coast Sauvignon Gris', 'Chile', 'Sauvignon Gris', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Cool Coast Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', '1912 Vines Romano César Noir', 'Chile', null, 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', '1912 Vines Sauvignon Gris', 'Chile', 'Sauvignon Gris', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', '1912 Vines Semillon', 'Chile', 'Semillon', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Gran Terroir Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Gran Terroir Petit Verdot', 'Chile', 'Petit Verdot', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Gran Terroir Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Gran Terroir Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Gran Terroir Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Gran Terroir Viognier', 'Chile', 'Viognier', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Gran Terroir Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Viognier', 'Chile', 'Viognier', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Malbec', 'Chile', 'Malbec', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Rosé', 'Chile', null, 'Rosé'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Terroir de Familia Reserva Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Organic White Blend', 'Chile', null, 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Organic Red', 'Chile', null, 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Reserve 5 Vines', 'Chile', null, 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Late Harvest Gewürztraminer Semillon Viognier', 'Chile', 'Gewürztraminer, Semillon, Viognier', 'Sweet'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Doña Dominga Reserva de Familia Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Doña Dominga Clásico de Familia Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Doña Dominga Clásico de Familia Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Doña Dominga D 6 Ensamblaje Tinto', 'Chile', null, 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Dominga Brut', 'Chile', null, 'Sparkling'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Dominga Brut Rosé', 'Chile', null, 'Sparkling'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Collection Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Collection Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Collection Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Collection Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Collection Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.casasilva.cl/en/wines
  ('Casa Silva', 'Collection Merlot', 'Chile', 'Merlot', 'Red')  -- https://www.casasilva.cl/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MIGUEL TORRES CHILE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Miguel Torres Chile', 'Manso de Velasco Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Escaleras de Empedrado Pinot Noir', 'Maule Valley, Chile', 'Pinot Noir', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Los Inquietos Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Cordillera de los Andes Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Cordillera de los Andes Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Cordillera de los Andes Vigno Carignan', 'Chile', 'Carignan', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Cordillera de los Andes Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Cordillera de los Andes Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Cordillera de los Andes Pinot Noir Extra Brut', 'Chile', 'Pinot Noir', 'Sparkling'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Millapoa País', 'Bío Bío Valley, Chile', 'País', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Estelado Rosé', 'Chile', 'País', 'Sparkling'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Ándica Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Ándica Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Ándica Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Ándica Rosé', 'Chile', null, 'Rosé'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Gran Reserva Carmenère', 'Curicó Valley, Chile', 'Carmenère', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Gran Reserva Red Blend', 'Curicó Valley, Chile', null, 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Gran Reserva Merlot', 'Curicó Valley, Chile', 'Merlot', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Gran Reserva Cabernet Sauvignon', 'Curicó Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Gran Reserva Chardonnay', 'Curicó Valley, Chile', 'Chardonnay', 'White'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Santa Digna Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Santa Digna Merlot', 'Chile', 'Merlot', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Santa Digna Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Santa Digna Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Santa Digna Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Santa Digna Rosé', 'Chile', null, 'Rosé'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Las Mulas Carmenère', 'Chile', 'Carmenère', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Las Mulas Red Blend', 'Chile', null, 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Las Mulas Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Las Mulas Merlot', 'Chile', 'Merlot', 'Red'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Las Mulas Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Las Mulas Sparkling Extra Brut', 'Chile', null, 'Sparkling'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'Las Mulas Rosé', 'Chile', null, 'Rosé'),  -- https://migueltorres.cl/en/our-wines/
  ('Miguel Torres Chile', 'La Causa Blend', 'Itata Valley, Chile', null, 'Red'),  -- https://migueltorres.cl/en/wines/la-causa-blend/
  ('Miguel Torres Chile', 'Almado Blend', 'Maule Valley, Chile', 'Cot, Carignan, Touriga Nacional', 'Red'),  -- https://migueltorres.cl/en/wines/almado-blend/
  ('Miguel Torres Chile', 'Los Inquietos Field Blend', 'Maule Valley, Chile', null, 'Red')  -- https://migueltorres.cl/en/wines/los-inquietos-field-blend/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA VERAMONTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Veramonte', 'Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.gonzalezbyass.com/en/wineries-brands/veramonte-0
  ('Viña Veramonte', 'Rosé Pinot Noir', 'Chile', 'Pinot Noir', 'Rosé'),  -- https://www.gonzalezbyass.com/en/wineries-brands/veramonte-0
  ('Viña Veramonte', 'Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.gonzalezbyass.com/en/wineries-brands/veramonte-0
  ('Viña Veramonte', 'Merlot', 'Chile', 'Merlot', 'Red'),  -- https://www.gonzalezbyass.com/en/wineries-brands/veramonte-0
  ('Viña Veramonte', 'Carménère', 'Chile', 'Carménère', 'Red')  -- https://www.gonzalezbyass.com/en/wineries-brands/veramonte-0
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA RITUAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Ritual', 'Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.gonzalezbyass.com/en/wineries-brands/veramonte-0
  ('Viña Ritual', 'Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.gonzalezbyass.com/en/wineries-brands/veramonte-0
  ('Viña Ritual', 'Pinot Noir', 'Casablanca Valley, Chile', 'Pinot Noir', 'Red'),  -- https://www.gonzalezbyass.com/en/wineries-brands/veramonte-0
  ('Viña Ritual', 'Merlot', 'Chile', 'Merlot', 'Red')  -- https://www.gonzalezbyass.com/en/wineries-brands/veramonte-0
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DES FOUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Clos des Fous', 'Grillos Cantores Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.bowlerwine.com/producer/clos-des-fous
  ('Clos des Fous', 'Pour Ma Gueule Pinot Noir', 'Chile', 'Pinot Noir, Cinsault', 'Red'),  -- https://www.bowlerwine.com/producer/clos-des-fous
  ('Clos des Fous', 'Subsollum Pinot Noir', 'Chile', 'Pinot Noir, Cinsault', 'Red')  -- https://www.bowlerwine.com/producer/clos-des-fous
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA AQUITANIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Aquitania', 'Lazuli Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.aquitania.cl/
  ('Viña Aquitania', 'Paul Bruno Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.aquitania.cl/
  ('Viña Aquitania', 'SOLdeSOL Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.aquitania.cl/
  ('Viña Aquitania', 'SOLdeSOL Sauvignon Blanc', 'Chile', 'Sauvignon Blanc', 'White'),  -- https://www.aquitania.cl/
  ('Viña Aquitania', 'SOLdeSOL Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://www.aquitania.cl/
  ('Viña Aquitania', 'SOLdeSOL Brut Nature', 'Chile', null, 'Sparkling'),  -- https://www.aquitania.cl/
  ('Viña Aquitania', 'Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.aquitania.cl/
  ('Viña Aquitania', 'Carménère', 'Chile', 'Carménère', 'Red'),  -- https://www.aquitania.cl/
  ('Viña Aquitania', 'Chardonnay', 'Chile', 'Chardonnay', 'White'),  -- https://www.aquitania.cl/
  ('Viña Aquitania', 'Rosé', 'Chile', null, 'Rosé')  -- https://www.aquitania.cl/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA MORANDÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Morandé', 'House of Morandé', 'Maipo Valley, Chile', 'Cabernet Sauvignon, Cabernet Franc, Carignan', 'Red'),  -- https://morande.cl/nuestros-vinos/house-of-morande/
  ('Viña Morandé', 'Terroir Wines Carmenère Malbec', 'Maule Valley, Chile', 'Carmenère, Malbec', 'Red'),  -- https://morande.cl/nuestros-vinos/terroir-wines/
  ('Viña Morandé', 'Terroir Wines Cinsault País', 'Itata Valley, Chile', 'Cinsault, País', 'Red'),  -- https://morande.cl/nuestros-vinos/terroir-wines/
  ('Viña Morandé', 'Terroir Wines Semillón', 'Maule Valley, Chile', 'Semillón', 'White'),  -- https://morande.cl/nuestros-vinos/terroir-wines/
  ('Viña Morandé', 'Pionero Cabernet Sauvignon', 'Maule Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://morande.cl/nuestros-vinos/pionero/
  ('Viña Morandé', 'Pionero Carmenère', 'Maule Valley, Chile', 'Carmenère', 'Red'),  -- https://morande.cl/nuestros-vinos/pionero/
  ('Viña Morandé', 'Pionero Merlot', 'Maule Valley, Chile', 'Merlot', 'Red'),  -- https://morande.cl/nuestros-vinos/pionero/
  ('Viña Morandé', 'Pionero Malbec', 'Maule Valley, Chile', 'Malbec', 'Red'),  -- https://morande.cl/nuestros-vinos/pionero/
  ('Viña Morandé', 'Pionero Pinot Noir', 'Casablanca Valley, Chile', 'Pinot Noir', 'Red'),  -- https://morande.cl/nuestros-vinos/pionero/
  ('Viña Morandé', 'Pionero Chardonnay', 'Maule Valley, Chile', 'Chardonnay', 'White'),  -- https://morande.cl/nuestros-vinos/pionero/
  ('Viña Morandé', 'Pionero Sauvignon Blanc', 'Maule Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://morande.cl/nuestros-vinos/pionero/
  ('Viña Morandé', 'Pionero Rosé', 'Maule Valley, Chile', 'Cinsault, Syrah', 'Rosé'),  -- https://morande.cl/nuestros-vinos/pionero/
  ('Viña Morandé', 'Cabernet de Ránquil', 'Itata Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://morande.cl/nuestros-vinos/specialties/
  ('Viña Morandé', 'Casatinta', 'Casablanca Valley, Chile', 'Malbec, Syrah, Cabernet Franc', 'Red'),  -- https://morande.cl/nuestros-vinos/specialties/
  ('Viña Morandé', 'Black Series Chardonnay', 'Malleco Valley, Chile', 'Chardonnay', 'White'),  -- https://morande.cl/nuestros-vinos/specialties/
  ('Viña Morandé', 'Black Series Pinot Noir', 'Chile', 'Pinot Noir', 'Red'),  -- https://morande.cl/nuestros-vinos/specialties/
  ('Viña Morandé', 'Black Series Syrah', 'Limarí Valley, Chile', 'Syrah', 'Red'),  -- https://morande.cl/nuestros-vinos/specialties/
  ('Viña Morandé', 'Vigno', 'Maule Valley, Chile', 'Carignan, Syrah', 'Red'),  -- https://morande.cl/nuestros-vinos/specialties/
  ('Viña Morandé', 'Adventure El Padre', 'Maipo Valley, Chile', 'Cabernet Franc, Carignan', 'Red'),  -- https://morande.cl/nuestros-vinos/morande-adventure/
  ('Viña Morandé', 'Adventure Tirazis', 'Casablanca Valley, Chile', 'Syrah', 'Red'),  -- https://morande.cl/nuestros-vinos/morande-adventure/
  ('Viña Morandé', 'Adventure Bestiario', 'Chile', 'Marsanne, Roussanne, Viognier', 'White'),  -- https://morande.cl/nuestros-vinos/morande-adventure/
  ('Viña Morandé', 'Adventure El Gran Petit', 'Cachapoal Valley, Chile', 'Petite Sirah, Petit Verdot', 'Red'),  -- https://morande.cl/nuestros-vinos/morande-adventure/
  ('Viña Morandé', 'Adventure Despechado', 'Casablanca Valley, Chile', 'Pinot Noir', 'Red'),  -- https://morande.cl/nuestros-vinos/morande-adventure/
  ('Viña Morandé', 'Adventure Colinas de Ránquil', 'Itata Valley, Chile', 'País', 'Red'),  -- https://morande.cl/nuestros-vinos/morande-adventure/
  ('Viña Morandé', 'Blanc de Noir', 'Casablanca Valley, Chile', 'Pinot Noir', 'Sparkling'),  -- https://morande.cl/nuestros-vinos/sparkling-wines/
  ('Viña Morandé', 'Brut Nature', 'Casablanca Valley, Chile', 'Chardonnay', 'Sparkling'),  -- https://morande.cl/nuestros-vinos/sparkling-wines/
  ('Viña Morandé', 'Extra Brut', 'Chile', 'Chardonnay', 'Sparkling'),  -- https://morande.cl/nuestros-vinos/sparkling-wines/
  ('Viña Morandé', 'Brut K.O.', 'Casablanca Valley, Chile', 'Chardonnay, Pinot Noir', 'Sparkling'),  -- https://morande.cl/nuestros-vinos/sparkling-wines/
  ('Viña Morandé', 'Vitis Única Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://morande.cl/nuestros-vinos/vitis-unica/
  ('Viña Morandé', 'Vitis Única Carmenère', 'Maipo Valley, Chile', 'Carmenère', 'Red'),  -- https://morande.cl/nuestros-vinos/vitis-unica/
  ('Viña Morandé', 'Vitis Única Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://morande.cl/nuestros-vinos/vitis-unica/
  ('Viña Morandé', 'Vitis Única Pinot Noir', 'Casablanca Valley, Chile', 'Pinot Noir', 'Red'),  -- https://morande.cl/nuestros-vinos/vitis-unica/
  ('Viña Morandé', 'Vitis Única Chardonnay', 'Casablanca Valley, Chile', 'Chardonnay', 'White'),  -- https://morande.cl/nuestros-vinos/vitis-unica/
  ('Viña Morandé', 'Vitis Única Mourvèdre', 'Maule Valley, Chile', 'Mourvèdre', 'Red'),  -- https://morande.cl/nuestros-vinos/vitis-unica/
  ('Viña Morandé', 'Vitis Única Cabernet Syrah', 'Chile', 'Syrah, Cabernet Sauvignon', 'Red'),  -- https://morande.cl/nuestros-vinos/vitis-unica/
  ('Viña Morandé', 'Selección de Viñedos Cabernet Sauvignon', 'Maipo Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://morande.cl/nuestros-vinos/seleccion-de-vinedos/
  ('Viña Morandé', 'Selección de Viñedos Carmenère', 'Maipo Valley, Chile', 'Carmenère', 'Red'),  -- https://morande.cl/nuestros-vinos/seleccion-de-vinedos/
  ('Viña Morandé', 'Selección de Viñedos Merlot', 'Maipo Valley, Chile', 'Merlot', 'Red'),  -- https://morande.cl/nuestros-vinos/seleccion-de-vinedos/
  ('Viña Morandé', 'Selección de Viñedos Pinot Noir', 'Casablanca Valley, Chile', 'Pinot Noir', 'Red'),  -- https://morande.cl/nuestros-vinos/seleccion-de-vinedos/
  ('Viña Morandé', 'Selección de Viñedos Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://morande.cl/nuestros-vinos/seleccion-de-vinedos/
  ('Viña Morandé', 'Selección de Viñedos Chardonnay', 'Casablanca Valley, Chile', 'Chardonnay', 'White'),  -- https://morande.cl/nuestros-vinos/seleccion-de-vinedos/
  ('Viña Morandé', 'Selección de Viñedos Gewürztraminer', 'Casablanca Valley, Chile', 'Gewürztraminer', 'White'),  -- https://morande.cl/nuestros-vinos/seleccion-de-vinedos/
  ('Viña Morandé', 'Late Harvest Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'Sweet'),  -- https://morande.cl/nuestros-vinos/late-harvest/
  ('Viña Morandé', 'Golden Harvest Sauvignon Blanc', 'Casablanca Valley, Chile', 'Sauvignon Blanc', 'Sweet')  -- https://morande.cl/nuestros-vinos/late-harvest/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- J. BOUCHON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('J. Bouchon', 'Block Series Cabernet Sauvignon', 'Maule Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://vintus.com/producers/j-bouchon/
  ('J. Bouchon', 'País Salvaje', 'Maule Valley, Chile', 'País', 'Red'),  -- https://vintus.com/producers/j-bouchon/
  ('J. Bouchon', 'País Blanco', 'Maule Valley, Chile', 'País', 'White'),  -- https://vintus.com/producers/j-bouchon/
  ('J. Bouchon', 'País Viejo', 'Maule Valley, Chile', 'País', 'Red')  -- https://vintus.com/producers/j-bouchon/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA PÉREZ CRUZ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Pérez Cruz', 'Pircas Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.perezcruz.com/
  ('Viña Pérez Cruz', 'Piedra Seca Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.perezcruz.com/
  ('Viña Pérez Cruz', 'Gran Reserva Cabernet Sauvignon', 'Chile', 'Cabernet Sauvignon', 'Red'),  -- https://www.perezcruz.com/
  ('Viña Pérez Cruz', 'Limited Edition Cabernet Franc', 'Chile', 'Cabernet Franc', 'Red'),  -- https://www.perezcruz.com/
  ('Viña Pérez Cruz', 'Limited Edition Carmenere', 'Chile', 'Carmenere', 'Red'),  -- https://www.perezcruz.com/
  ('Viña Pérez Cruz', 'Limited Edition Cot', 'Chile', 'Cot', 'Red'),  -- https://www.perezcruz.com/
  ('Viña Pérez Cruz', 'Limited Edition Syrah', 'Chile', 'Syrah', 'Red'),  -- https://www.perezcruz.com/
  ('Viña Pérez Cruz', 'Lingal Rosé', 'Chile', null, 'Rosé'),  -- https://www.perezcruz.com/
  ('Viña Pérez Cruz', 'Grenache', 'Chile', 'Grenache', 'Red'),  -- https://www.perezcruz.com/
  ('Viña Pérez Cruz', 'Liguai', 'Maipo Valley, Chile', 'Syrah, Cabernet Sauvignon, Carmenere', 'Red')  -- https://perezcruz.com/pages/nuestros-vinos-liguai
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PEDRO PARRA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Pedro Parra', 'Imaginador Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.skurnik.com/producer/pedro-parra-y-familia/
  ('Pedro Parra', 'Vinista País', 'Itata Valley, Chile', 'País', 'Red'),  -- https://www.skurnik.com/producer/pedro-parra-y-familia/
  ('Pedro Parra', 'HUB Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.skurnik.com/producer/pedro-parra-y-familia/
  ('Pedro Parra', 'Trane Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.skurnik.com/producer/pedro-parra-y-familia/
  ('Pedro Parra', 'Monk Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.skurnik.com/producer/pedro-parra-y-familia/
  ('Pedro Parra', 'Miles Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.skurnik.com/producer/pedro-parra-y-familia/
  ('Pedro Parra', 'Newk Cinsault', 'Itata Valley, Chile', 'Cinsault', 'Red'),  -- https://www.skurnik.com/producer/pedro-parra-y-familia/
  ('Pedro Parra', 'Chardonnay', 'Itata Valley, Chile', 'Chardonnay', 'White')  -- https://www.skurnik.com/producer/pedro-parra-y-familia/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA FALERNIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_chile.sql)'
from (values
  ('Viña Falernia', 'Orange Wine Viognier Reserva', 'Elqui Valley, Chile', 'Viognier', 'Orange'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Orange Wine Pedro Ximénez Reserva', 'Elqui Valley, Chile', 'Pedro Ximénez', 'Orange'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Moscato Giallo', 'Elqui Valley, Chile', 'Moscatel Amarilla', 'White'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Late Harvest Moscatel', 'Elqui Valley, Chile', 'Moscatel Rosada', 'Sweet'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Rosé', 'Elqui Valley, Chile', 'Viognier, Syrah', 'Rosé'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Sauvignon Blanc Reserva', 'Elqui Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Pedro Ximénez Reserva', 'Elqui Valley, Chile', 'Pedro Ximénez', 'White'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Viognier Reserva', 'Elqui Valley, Chile', 'Viognier', 'White'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Riesling Reserva', 'Elqui Valley, Chile', 'Riesling', 'White'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Chardonnay Reserva', 'Elqui Valley, Chile', 'Chardonnay', 'White'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Carmenere Reserva', 'Elqui Valley, Chile', 'Carmenere', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Merlot Reserva', 'Elqui Valley, Chile', 'Merlot', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Sangiovese Reserva', 'Elqui Valley, Chile', 'Sangiovese', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Cabernet Sauvignon Reserva', 'Elqui Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Syrah Reserva', 'Elqui Valley, Chile', 'Syrah', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Pinot Noir Reserva', 'Elqui Valley, Chile', 'Pinot Noir', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Carmenere Gran Reserva', 'Elqui Valley, Chile', 'Carmenere', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Carmenere Syrah Gran Reserva', 'Elqui Valley, Chile', 'Carmenere, Syrah', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Syrah Gran Reserva', 'Elqui Valley, Chile', 'Syrah', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Merlot Gran Reserva', 'Elqui Valley, Chile', 'Merlot', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Sangiovese Gran Reserva', 'Elqui Valley, Chile', 'Sangiovese', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Sauvignon Blanc Gran Reserva', 'Elqui Valley, Chile', 'Sauvignon Blanc', 'White'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Cabernet Sauvignon Gran Reserva', 'Elqui Valley, Chile', 'Cabernet Sauvignon', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Malbec Gran Reserva', 'Elqui Valley, Chile', 'Malbec', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Chardonnay Gran Reserva Titon Single Vineyard', 'Elqui Valley, Chile', 'Chardonnay', 'White'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Pinot Noir Gran Reserva Aaron Single Vineyard', 'Elqui Valley, Chile', 'Pinot Noir', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Syrah Gran Reserva Titon Single Vineyard', 'Elqui Valley, Chile', 'Syrah', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Carmenere Reserva Pedriscal Single Vineyard', 'Elqui Valley, Chile', 'Carmenere', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Number One Single Vineyard', 'Elqui Valley, Chile', 'Cabernet Sauvignon, Syrah, Carmenere', 'Red'),  -- https://falernia.com/falernia-wines/
  ('Viña Falernia', 'Sangiovese Gran Reserva Titon Single Vineyard Amicizia', 'Elqui Valley, Chile', 'Sangiovese', 'Red')  -- https://falernia.com/falernia-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
