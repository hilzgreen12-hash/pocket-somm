-- Producer ranges round 3: Spanish Islands. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- JOSÉ L. FERRER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('José L. Ferrer', 'Blanc de Blancs', 'Binissalem, Mallorca, Spain', null, 'White'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Rosat', 'Binissalem, Mallorca, Spain', null, 'Rosé'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Crianza', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Reserva', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Autèntic', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Anyada', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Veritas Blanc', 'Binissalem, Mallorca, Spain', null, 'White'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Veritas Roig', 'Binissalem, Mallorca, Spain', null, 'Rosé'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Veritas Vinyes Velles', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Veritas Reserva', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Veritas Brut Nature', 'Binissalem, Mallorca, Spain', null, 'Sparkling'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Veritas Brut Nature Rosat', 'Binissalem, Mallorca, Spain', null, 'Sparkling'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Veritas Dolç', 'Binissalem, Mallorca, Spain', null, 'Sweet'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Pedra de Binissalem Blanc', 'Binissalem, Mallorca, Spain', null, 'White'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Pedra de Binissalem Rosat', 'Binissalem, Mallorca, Spain', null, 'Rosé'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Pedra de Binissalem Negre', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Dues Giró Ros Chardonnay', 'Binissalem, Mallorca, Spain', 'Giró Ros/Chardonnay', 'White'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Dues Callet Syrah', 'Binissalem, Mallorca, Spain', 'Callet/Syrah', 'Rosé'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Dues Mantonegro Cabernet Sauvignon', 'Binissalem, Mallorca, Spain', 'Manto Negro/Cabernet Sauvignon', 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Ferreret Moll', 'Binissalem, Mallorca, Spain', 'Moll', 'White'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Ferreret Giró Ros', 'Binissalem, Mallorca, Spain', 'Giró Ros', 'White'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Ferreret Mantonegro Callet Blanc', 'Binissalem, Mallorca, Spain', 'Manto Negro/Callet', 'White'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Ferreret Mantonegro Blanc', 'Binissalem, Mallorca, Spain', 'Manto Negro', 'White'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Ferreret Mantonegro Rosat', 'Binissalem, Mallorca, Spain', 'Manto Negro', 'Rosé'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Ferreret Mantonegro', 'Binissalem, Mallorca, Spain', 'Manto Negro', 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Ferreret Gorgollassa', 'Binissalem, Mallorca, Spain', 'Gorgollassa', 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Nàutic Blanc', 'Binissalem, Mallorca, Spain', null, 'White'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Nàutic Rosat', 'Binissalem, Mallorca, Spain', null, 'Rosé'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Nàutic Negre', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Pep Perico', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Vi Ranci', 'Binissalem, Mallorca, Spain', null, 'Fortified'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Dolç de Bota', 'Binissalem, Mallorca, Spain', null, 'Sweet'),  -- https://vinosferrer.com/vinos/
  ('José L. Ferrer', 'Brut Millesimé 36 Meses', 'Binissalem, Mallorca, Spain', null, 'Sparkling')  -- https://vinosferrer.com/vinos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SUERTES DEL MARQUÉS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Suertes del Marqués', 'Trenzado', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Vidonia', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Vidonia VP', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Edición Blanco', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', '7 Fuentes', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro/Castellana Negra', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'El Lance', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro/Castellana Negra/Vijariego Negro/Baboso Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Medianías', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Hacienda Las Cañas', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'La Floridita', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Suertes Cool', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'La Solana', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Candio', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'El Chibirique', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Los Pasitos', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Baboso Negro/Vijariego Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'El Esquilón', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Las Suertes', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Cruz Santa', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Vijariego Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Vidueño', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Edición Tinto', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Malvasía Rosada', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Malvasía Rosada/Negramoll', 'Red'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Rosado', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Rosé'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Fortificado', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'Fortified'),  -- https://suertesdelmarques.com/vinos/
  ('Suertes del Marqués', 'Sortevera Tinto', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro/Listán Gaucho/Negramoll/Vijariego Negro/Tintilla/Moscatel de Hamburgo', 'Red')  -- https://www.vinissimus.com/es/bodega/bodega-soagranorte/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ÀNIMA NEGRA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Ànima Negra', 'ÀN', 'Mallorca, Spain', 'Callet/Manto Negro/Fogoneu', 'Red'),  -- https://www.annegra.com/es/nuestros-vinos
  ('Ànima Negra', 'ÀN2', 'Mallorca, Spain', 'Callet/Fogoneu/Cabernet Sauvignon', 'Red'),  -- https://www.annegra.com/es/nuestros-vinos
  ('Ànima Negra', 'Quíbia', 'Mallorca, Spain', 'Callet/Premsal/Giró Ros', 'White'),  -- https://www.annegra.com/es/nuestros-vinos
  ('Ànima Negra', 'Son Negre', 'Mallorca, Spain', null, 'Red'),  -- https://www.annegra.com/es/nuestros-vinos
  ('Ànima Negra', 'AN''R', 'Mallorca, Spain', 'Callet', 'Rosé')  -- https://www.annegra.com/es/nuestros-vinos
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MACIÀ BATLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Macià Batle', 'Blanc de Blancs', 'Binissalem, Mallorca, Spain', null, 'White'),  -- https://www.maciabatle.com/categoria-producto/tipo/blanco/
  ('Macià Batle', 'Maceración Carbónica Blanc de Blancs', 'Binissalem, Mallorca, Spain', null, 'White'),  -- https://www.maciabatle.com/categoria-producto/tipo/blanco/
  ('Macià Batle', 'Xeremia Blanc', 'Binissalem, Mallorca, Spain', null, 'White'),  -- https://www.maciabatle.com/categoria-producto/tipo/blanco/
  ('Macià Batle', 'Blanc de Blanc Dolç', 'Binissalem, Mallorca, Spain', null, 'Sweet'),  -- https://www.maciabatle.com/categoria-producto/tipo/blanco/
  ('Macià Batle', 'Sauvignon Blanc', 'Binissalem, Mallorca, Spain', 'Sauvignon Blanc', 'White'),  -- https://www.maciabatle.com/categoria-producto/tipo/blanco/
  ('Macià Batle', 'Margalida Llompart Blanco', 'Binissalem, Mallorca, Spain', null, 'White'),  -- https://www.maciabatle.com/categoria-producto/tipo/blanco/
  ('Macià Batle', 'Orange Wine', 'Binissalem, Mallorca, Spain', 'Prensal Blanc/Giró Ros', 'Orange'),  -- https://www.maciabatle.com/categoria-producto/tipo/rosado/
  ('Macià Batle', 'Margalida Llompart Rosado', 'Binissalem, Mallorca, Spain', null, 'Rosé'),  -- https://www.maciabatle.com/categoria-producto/tipo/rosado/
  ('Macià Batle', 'Maceración Carbónica Rosat', 'Binissalem, Mallorca, Spain', null, 'Rosé'),  -- https://www.maciabatle.com/categoria-producto/tipo/rosado/
  ('Macià Batle', 'Rosado', 'Binissalem, Mallorca, Spain', null, 'Rosé'),  -- https://www.maciabatle.com/categoria-producto/tipo/rosado/
  ('Macià Batle', 'Margalida Llompart Rouge', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://www.maciabatle.com/categoria-producto/tipo/tinto/
  ('Macià Batle', 'Vi Negre Dolç', 'Binissalem, Mallorca, Spain', null, 'Sweet'),  -- https://www.maciabatle.com/categoria-producto/tipo/tinto/
  ('Macià Batle', 'Maceración Carbónica Negre', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://www.maciabatle.com/categoria-producto/tipo/tinto/
  ('Macià Batle', 'Tinto Añada', 'Binissalem, Mallorca, Spain', null, 'Red'),  -- https://www.maciabatle.com/categoria-producto/tipo/tinto/
  ('Macià Batle', 'Tinto 1856', 'Binissalem, Mallorca, Spain', null, 'Red')  -- https://www.maciabatle.com/categoria-producto/tipo/tinto/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGA RIBAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Bodega Ribas', 'Ribas Blanc', 'Mallorca, Spain', 'Prensal Blanc/Giró Ros', 'White'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Ribas Rosat', 'Mallorca, Spain', 'Manto Negro', 'Rosé'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Ribas Negre', 'Mallorca, Spain', 'Manto Negro/Syrah', 'Red'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Ribas de Cabrera', 'Mallorca, Spain', null, 'Red'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Desconfío de la Gente que No Bebe', 'Mallorca, Spain', 'Manto Negro', 'Red'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Sió Blanc', 'Mallorca, Spain', 'Prensal Blanc/Giró Ros/Viognier', 'White'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Sió Rosat', 'Mallorca, Spain', 'Gorgollassa', 'Rosé'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Sió Negre', 'Mallorca, Spain', 'Manto Negro/Syrah', 'Red'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Sioneta Blanc', 'Mallorca, Spain', 'Moscatel de Grano Menudo', 'Sweet'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Sioneta Rosat', 'Mallorca, Spain', 'Manto Negro', 'Sweet'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'Soma', 'Mallorca, Spain', 'Viognier', 'White'),  -- https://bodegaribas.com/vinos/
  ('Bodega Ribas', 'L''Amo en Joan', 'Mallorca, Spain', 'Manto Negro/Syrah', 'Red')  -- https://bodegaribas.com/vinos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOS BERMEJOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Los Bermejos', 'Malvasía Brut Nature', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'Sparkling'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Malvasía Seco Ecológico', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Malvasía Seco', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Malvasía Seco Fermentado en Barrica', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Malvasía Semidulce', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'Sweet'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Moscatel Naturalmente Dulce', 'Lanzarote, Canary Islands, Spain', 'Moscatel', 'Sweet'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Diego Ecológico', 'Lanzarote, Canary Islands, Spain', 'Diego', 'White'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Listán Rosado', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Rosé'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Malvasía Seco Nesoi', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Listán Negro Maceración Tradicional', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Listán Negro Barrica', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Listán Negro Ecológico', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://www.losbermejos.com/vinos
  ('Los Bermejos', 'Listán Negro Maceración Carbónica', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Red')  -- https://www.losbermejos.com/vinos
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STRATVS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Stratvs', 'Diego a Secas', 'Lanzarote, Canary Islands, Spain', 'Diego', 'White'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Finca Las Palmeras', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Malvasía Seco', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Semidulce', 'Lanzarote, Canary Islands, Spain', 'Moscatel/Malvasía Volcánica', 'Sweet'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Sutil', 'Lanzarote, Canary Islands, Spain', 'Baboso Negro', 'Red'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Tinto Joven', 'Lanzarote, Canary Islands, Spain', 'Syrah/Tempranillo', 'Red'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Finca de Uga', 'Lanzarote, Canary Islands, Spain', 'Syrah/Cabernet Sauvignon', 'Red'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Viña Centenaria', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Rosado', 'Lanzarote, Canary Islands, Spain', 'Listán Blanco/Tempranillo', 'Rosé'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Moscatel Dulce', 'Lanzarote, Canary Islands, Spain', 'Moscatel', 'Sweet'),  -- https://stratvs.com/vinos/
  ('Stratvs', 'Naturalmente Dulce', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'Sweet')  -- https://stratvs.com/vinos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- EL LOMO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('El Lomo', 'Listán Blanco', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://bodegaellomo.com/es/tienda/blanco
  ('El Lomo', 'Qori', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://bodegaellomo.com/es/tienda/blanco
  ('El Lomo', '4 Lías', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://bodegaellomo.com/es/tienda/blanco
  ('El Lomo', 'Listán Negro', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://bodegaellomo.com/es/tienda/tinto
  ('El Lomo', 'Vendimia Seleccionada', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://bodegaellomo.com/es/tienda/tinto
  ('El Lomo', 'Barco de Tierra Adentro', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://bodegaellomo.com/es/tienda/tinto
  ('El Lomo', '1989', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://bodegaellomo.com/es/tienda/tinto
  ('El Lomo', 'Disparate', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://bodegaellomo.com/es/tienda/tinto
  ('El Lomo', 'Chiquita Locura', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://bodegaellomo.com/es/tienda/tinto
  ('El Lomo', 'Rósame', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Rosé'),  -- https://bodegaellomo.com/es/tienda/rosado
  ('El Lomo', 'Corazón Negro', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Rosé')  -- https://bodegaellomo.com/es/tienda/rosado
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALTOS DE TREVEJOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Altos de Trevejos', 'Trevejos MW Listán Blanco Organic', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos MW Listán Blanco Mohino Single Vineyard', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos MW Listán Prieto Guayero Single Vineyard', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Prieto', 'Red'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos MW Listán Blanco y Malvasía', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Blanco/Malvasía', 'White'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos MW Listán Prieto', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Prieto', 'Red'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos MW Vijariego Negro', 'Abona, Tenerife, Canary Islands, Spain', 'Vijariego Negro', 'Red'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos MW Baboso Negro', 'Abona, Tenerife, Canary Islands, Spain', 'Baboso Negro', 'Red'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos Volcanic Wines Rosado', 'Abona, Tenerife, Canary Islands, Spain', null, 'Rosé'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos Volcanic Wines Blanco Ecológico', 'Abona, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos Volcanic Wines Blanco', 'Abona, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Trevejos Volcanic Wines Tinto', 'Abona, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Aromas de Trevejos', 'Abona, Tenerife, Canary Islands, Spain', null, 'Sweet'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Espumoso Blanco Brut Nature', 'Abona, Tenerife, Canary Islands, Spain', null, 'Sparkling'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Espumoso Rosado Brut Nature', 'Abona, Tenerife, Canary Islands, Spain', null, 'Sparkling'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'La Jirafa Afrutada', 'Abona, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Bambú Blanco', 'Abona, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.altosdetrevejos.com/nuestros-vinos/
  ('Altos de Trevejos', 'Bambú Tinto', 'Abona, Tenerife, Canary Islands, Spain', null, 'Red')  -- https://www.altosdetrevejos.com/nuestros-vinos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TENEGUÍA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Teneguía', 'Blanco', 'La Palma, Canary Islands, Spain', null, 'White'),  -- https://www.bodegasteneguia.com/variedad/vinos-teneguia/
  ('Teneguía', 'Tinto', 'La Palma, Canary Islands, Spain', null, 'Red'),  -- https://www.bodegasteneguia.com/variedad/vinos-teneguia/
  ('Teneguía', 'La Gota', 'La Palma, Canary Islands, Spain', null, 'White'),  -- https://www.bodegasteneguia.com/variedad/vinos-teneguia/
  ('Teneguía', 'Rosado', 'La Palma, Canary Islands, Spain', null, 'Rosé'),  -- https://www.bodegasteneguia.com/variedad/vinos-teneguia/
  ('Teneguía', 'Blanco Caletas', 'La Palma, Canary Islands, Spain', 'Listán Blanco/Malvasía Aromática', 'White'),  -- https://www.bodegasteneguia.com/variedad/vinos-teneguia/
  ('Teneguía', 'Tinto Cumbre Vieja', 'La Palma, Canary Islands, Spain', 'Negramoll/Almuñeco/Castellana/Bujariego Negro/Baboso Negro/Listán Prieto', 'Red'),  -- https://www.bodegasteneguia.com/variedad/vinos-teneguia/
  ('Teneguía', 'Malvasía Seco', 'La Palma, Canary Islands, Spain', 'Malvasía Aromática', 'White'),  -- https://www.bodegasteneguia.com/variedad/vinos-teneguia/
  ('Teneguía', 'Malvasía Aromática Naturalmente Dulce', 'La Palma, Canary Islands, Spain', 'Malvasía Aromática', 'Sweet'),  -- https://www.bodegasteneguia.com/variedad/vinos-teneguia/
  ('Teneguía', 'Malvasía Aromática Naturalmente Dulce Reserva', 'La Palma, Canary Islands, Spain', 'Malvasía Aromática', 'Sweet'),  -- https://www.bodegasteneguia.com/variedad/vinos-teneguia/
  ('Teneguía', 'La Batista', 'La Palma, Canary Islands, Spain', 'Malvasía Aromática', 'White')  -- https://www.bodegasteneguia.com/vino/la-batista-2022/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRONTÓN DE ORO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Frontón de Oro', 'Tinto Tradicional', 'Gran Canaria, Canary Islands, Spain', null, 'Red'),  -- https://frontondeoro.com/vinos-de-gran-canaria-cultivados-en-suelo-volcanico/
  ('Frontón de Oro', 'Malpaís', 'Gran Canaria, Canary Islands, Spain', null, 'Red'),  -- https://frontondeoro.com/vinos-de-gran-canaria-cultivados-en-suelo-volcanico/
  ('Frontón de Oro', 'Tintilla', 'Gran Canaria, Canary Islands, Spain', 'Tintilla', 'Red'),  -- https://frontondeoro.com/vinos-de-gran-canaria-cultivados-en-suelo-volcanico/
  ('Frontón de Oro', 'Vertierra', 'Gran Canaria, Canary Islands, Spain', null, 'Red'),  -- https://frontondeoro.com/vinos-de-gran-canaria-cultivados-en-suelo-volcanico/
  ('Frontón de Oro', 'Blanco Semiseco', 'Gran Canaria, Canary Islands, Spain', null, 'White'),  -- https://frontondeoro.com/vinos-de-gran-canaria-cultivados-en-suelo-volcanico/
  ('Frontón de Oro', 'Blanco Afrutado', 'Gran Canaria, Canary Islands, Spain', null, 'White'),  -- https://frontondeoro.com/vinos-de-gran-canaria-cultivados-en-suelo-volcanico/
  ('Frontón de Oro', 'Albillo Roble', 'Gran Canaria, Canary Islands, Spain', 'Albillo Criollo', 'White'),  -- https://frontondeoro.com/vinos-de-gran-canaria-cultivados-en-suelo-volcanico/
  ('Frontón de Oro', 'Malvasía Volcánica', 'Gran Canaria, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://frontondeoro.com/vinos-de-gran-canaria-cultivados-en-suelo-volcanico/
  ('Frontón de Oro', 'Rosado', 'Gran Canaria, Canary Islands, Spain', 'Listán Negro', 'Rosé')  -- https://frontondeoro.com/vinos-de-gran-canaria-cultivados-en-suelo-volcanico/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BINIGRAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Binigrau', 'Obac de Binigrau', 'Mallorca, Spain', null, 'Red'),  -- https://binigrau.es/els-nostres-vins/
  ('Binigrau', 'Nounat', 'Mallorca, Spain', null, 'White'),  -- https://binigrau.es/els-nostres-vins/
  ('Binigrau', 'Negre', 'Mallorca, Spain', null, 'Red'),  -- https://binigrau.es/els-nostres-vins/
  ('Binigrau', 'Blanc', 'Mallorca, Spain', null, 'White'),  -- https://binigrau.es/els-nostres-vins/
  ('Binigrau', 'Eco Negre', 'Mallorca, Spain', null, 'Red'),  -- https://binigrau.es/els-nostres-vins/
  ('Binigrau', 'Eco Rosat', 'Mallorca, Spain', null, 'Rosé')  -- https://binigrau.es/els-nostres-vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MIQUEL GELABERT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Miquel Gelabert', 'Son Moix Blanc', 'Pla i Llevant, Mallorca, Spain', null, 'White'),  -- https://vinsmiquelgelabert.com/vino-blanco/
  ('Miquel Gelabert', 'Chardonnay Roure', 'Pla i Llevant, Mallorca, Spain', 'Chardonnay', 'White'),  -- https://vinsmiquelgelabert.com/vino-blanco/
  ('Miquel Gelabert', 'Golós Blanc', 'Pla i Llevant, Mallorca, Spain', null, 'White'),  -- https://vinsmiquelgelabert.com/vino-blanco/
  ('Miquel Gelabert', 'Chardonnay Roure Selecció Especial', 'Pla i Llevant, Mallorca, Spain', 'Chardonnay', 'White'),  -- https://vinsmiquelgelabert.com/vino-blanco/
  ('Miquel Gelabert', 'Sa Vall Selecció Privada', 'Pla i Llevant, Mallorca, Spain', null, 'White'),  -- https://vinsmiquelgelabert.com/vino-blanco/
  ('Miquel Gelabert', 'Son Caules Blanc', 'Pla i Llevant, Mallorca, Spain', null, 'White'),  -- https://vinsmiquelgelabert.com/vino-blanco/
  ('Miquel Gelabert', 'Son Moix Negre', 'Pla i Llevant, Mallorca, Spain', null, 'Red'),  -- https://vinsmiquelgelabert.com/vino-tinto/
  ('Miquel Gelabert', 'Colom de Penya', 'Pla i Llevant, Mallorca, Spain', null, 'Red'),  -- https://vinsmiquelgelabert.com/vino-tinto/
  ('Miquel Gelabert', 'Vinya des Moré', 'Pla i Llevant, Mallorca, Spain', null, 'Red'),  -- https://vinsmiquelgelabert.com/vino-tinto/
  ('Miquel Gelabert', 'Son Caules Negre', 'Pla i Llevant, Mallorca, Spain', null, 'Red'),  -- https://vinsmiquelgelabert.com/vino-tinto/
  ('Miquel Gelabert', 'Autònom', 'Pla i Llevant, Mallorca, Spain', null, 'Red'),  -- https://vinsmiquelgelabert.com/vino-tinto/
  ('Miquel Gelabert', 'Golós Negre', 'Pla i Llevant, Mallorca, Spain', null, 'Red'),  -- https://vinsmiquelgelabert.com/vino-tinto/
  ('Miquel Gelabert', 'Son Caules Rosat', 'Pla i Llevant, Mallorca, Spain', null, 'Rosé'),  -- https://vinsmiquelgelabert.com/vino-rosado/
  ('Miquel Gelabert', 'Golós Rosat', 'Pla i Llevant, Mallorca, Spain', null, 'Rosé'),  -- https://vinsmiquelgelabert.com/vino-rosado/
  ('Miquel Gelabert', 'Aran Dolç', 'Pla i Llevant, Mallorca, Spain', null, 'Sweet'),  -- https://vinsmiquelgelabert.com/vino-dulce/
  ('Miquel Gelabert', 'Dolç de Sa Vall', 'Pla i Llevant, Mallorca, Spain', null, 'Sweet'),  -- https://vinsmiquelgelabert.com/vino-dulce/
  ('Miquel Gelabert', 'Dolç des Port', 'Pla i Llevant, Mallorca, Spain', null, 'Sweet'),  -- https://vinsmiquelgelabert.com/vino-dulce/
  ('Miquel Gelabert', 'Dolç des Morro', 'Pla i Llevant, Mallorca, Spain', null, 'Sweet'),  -- https://vinsmiquelgelabert.com/vino-dulce/
  ('Miquel Gelabert', 'Son Moix Escumós Rosat', 'Pla i Llevant, Mallorca, Spain', null, 'Sparkling'),  -- https://vinsmiquelgelabert.com/vino-espumoso/
  ('Miquel Gelabert', 'Son Moix Escumós Blanc', 'Pla i Llevant, Mallorca, Spain', null, 'Sparkling')  -- https://vinsmiquelgelabert.com/vino-espumoso/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TERRAMOLL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Terramoll', 'Savina', 'Formentera, Spain', null, 'White'),  -- https://terramoll.es/vinos/
  ('Terramoll', 'Rosa de Mar', 'Formentera, Spain', null, 'Rosé'),  -- https://terramoll.es/vinos/
  ('Terramoll', 'Lliri', 'Formentera, Spain', null, 'Sweet'),  -- https://terramoll.es/vinos/
  ('Terramoll', 'Es Virot', 'Formentera, Spain', null, 'Red'),  -- https://terramoll.es/vinos/
  ('Terramoll', 'Es Monestir', 'Formentera, Spain', null, 'Red'),  -- https://terramoll.es/vinos/
  ('Terramoll', 'Astarté', 'Formentera, Spain', null, 'White')  -- https://terramoll.es/vinos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MESQUIDA MORA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Mesquida Mora', 'Sòtil', 'Mallorca, Spain', 'Callet', 'Red'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Trispol', 'Mallorca, Spain', 'Callet/Monastrell/Syrah', 'Red'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Acrollam Blanc', 'Mallorca, Spain', null, 'White'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Sincronia Negre', 'Mallorca, Spain', null, 'Red'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Sincronia Rosat', 'Mallorca, Spain', null, 'Rosé'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Sincronia Blanc', 'Mallorca, Spain', null, 'White'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Gorgollassa', 'Mallorca, Spain', 'Gorgollassa', 'Red'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Gorgollassa Rosada', 'Mallorca, Spain', 'Gorgollassa', 'Rosé'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Premsal des Camí de Felanitx', 'Mallorca, Spain', 'Premsal', 'White'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Giró Giró de Son Vinater', 'Mallorca, Spain', 'Giró Ros', 'White'),  -- https://mesquidamora.com/tenda-vi/
  ('Mesquida Mora', 'Terna', 'Mallorca, Spain', 'Giró Blanc/Premsal', 'Orange')  -- https://mesquidamora.com/tenda-vi/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SON PRIM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Son Prim', 'Blanc de Merlot', 'Mallorca, Spain', 'Merlot', 'White'),  -- https://www.sonprim.com/wines
  ('Son Prim', 'Esblanc', 'Mallorca, Spain', 'Chardonnay', 'White'),  -- https://www.sonprim.com/wines
  ('Son Prim', 'Esnegre', 'Mallorca, Spain', null, 'Red'),  -- https://www.sonprim.com/wines
  ('Son Prim', 'Maria José', 'Mallorca, Spain', 'Chardonnay', 'White'),  -- https://www.sonprim.com/wines
  ('Son Prim', 'Merlot', 'Mallorca, Spain', 'Merlot', 'Red'),  -- https://www.sonprim.com/wines
  ('Son Prim', 'CUP', 'Mallorca, Spain', 'Cabernet Sauvignon/Merlot/Syrah', 'Red'),  -- https://www.sonprim.com/wines
  ('Son Prim', 'Cabernet Sauvignon', 'Mallorca, Spain', 'Cabernet Sauvignon', 'Red'),  -- https://www.sonprim.com/wines
  ('Son Prim', 'Sirà', 'Mallorca, Spain', 'Syrah', 'Red'),  -- https://www.sonprim.com/wines
  ('Son Prim', 'Roset', 'Mallorca, Spain', null, 'Rosé')  -- https://www.sonprim.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CASTELL MIQUEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Castell Miquel', 'Stairway to Heaven Sauvignon Blanc', 'Mallorca, Spain', 'Sauvignon Blanc', 'White'),  -- https://castellmiquel.com/weine/
  ('Castell Miquel', 'Stairway to Heaven Rosé', 'Mallorca, Spain', null, 'Rosé'),  -- https://castellmiquel.com/weine/
  ('Castell Miquel', 'Stairway to Heaven Cuvée', 'Mallorca, Spain', null, 'Red'),  -- https://castellmiquel.com/weine/
  ('Castell Miquel', 'Stairway to Heaven Shiraz', 'Mallorca, Spain', 'Shiraz', 'Red'),  -- https://castellmiquel.com/weine/
  ('Castell Miquel', 'Stairway to Heaven Cabernet Sauvignon', 'Mallorca, Spain', 'Cabernet Sauvignon', 'Red'),  -- https://castellmiquel.com/weine/
  ('Castell Miquel', 'Owner''s Edition Merlot', 'Mallorca, Spain', 'Merlot', 'Red'),  -- https://castellmiquel.com/weine/
  ('Castell Miquel', 'Heaven on Earth', 'Mallorca, Spain', 'Sauvignon Blanc', 'White'),  -- https://castellmiquel.com/weine/
  ('Castell Miquel', 'Angel on the Rocks', 'Mallorca, Spain', 'Shiraz', 'Red')  -- https://castellmiquel.com/weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- IBIZKUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Ibizkus', 'Can Bassó Red', 'Ibiza, Spain', null, 'Red'),  -- https://ibizkus.com/
  ('Ibizkus', 'Red', 'Ibiza, Spain', 'Monastrell', 'Red'),  -- https://ibizkus.com/
  ('Ibizkus', 'Rosé', 'Ibiza, Spain', 'Monastrell', 'Rosé'),  -- https://ibizkus.com/
  ('Ibizkus', 'White', 'Ibiza, Spain', null, 'White'),  -- https://ibizkus.com/
  ('Ibizkus', 'Syrah Red', 'Ibiza, Spain', 'Syrah', 'Red'),  -- https://ibizkus.com/
  ('Ibizkus', 'Totem Red', 'Ibiza, Spain', 'Monastrell', 'Red'),  -- https://ibizkus.com/
  ('Ibizkus', 'Totem Rosé', 'Ibiza, Spain', null, 'Rosé'),  -- https://ibizkus.com/
  ('Ibizkus', 'Totem White', 'Ibiza, Spain', null, 'White')  -- https://ibizkus.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MONJE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Monje', 'PetNat', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Sparkling'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Dragoblanco Seco', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Dragoblanco Afrutado', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Bibiana Rosado', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Rosé'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Bibiana Rosado Afrutado', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Rosé'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Tradicional', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Hollera', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Bastardo Negro', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Bastardo Negro', 'Red'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Listán Negro', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Tintilla', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Tintilla', 'Red'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Vijariego Negro', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Vijariego Negro', 'Red'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Moscatel', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Moscatel', 'Sweet'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Espumoso Rosé', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Sparkling'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'de Autor Reserva', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'de Autor Crianza', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://bodegasmonje.com/shop/es/productos/vinos/
  ('Monje', 'Negramoll & Listán Negro', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Negramoll/Listán Negro', 'Red')  -- https://bodegasmonje.com/shop/es/productos/vinos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑÁTIGO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Viñátigo', 'Listán Blanco', 'Ycoden-Daute-Isora, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.bowlerwine.com/producer/vinatigo
  ('Viñátigo', 'Ensamblaje Blanco', 'Ycoden-Daute-Isora, Tenerife, Canary Islands, Spain', 'Gual/Marmajuelo/Vijariego Blanco/Malvasía Aromática', 'White'),  -- https://www.bowlerwine.com/producer/vinatigo
  ('Viñátigo', 'Lomo de la Era', 'Ycoden-Daute-Isora, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.bowlerwine.com/producer/vinatigo
  ('Viñátigo', 'Maipé', 'Ycoden-Daute-Isora, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.bowlerwine.com/producer/vinatigo
  ('Viñátigo', 'Ancestrale Blanco', 'Ycoden-Daute-Isora, Tenerife, Canary Islands, Spain', 'Gual', 'Orange'),  -- https://www.bowlerwine.com/producer/vinatigo
  ('Viñátigo', 'Listán Negro', 'Ycoden-Daute-Isora, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://www.bowlerwine.com/producer/vinatigo
  ('Viñátigo', 'Parcelas Laderas de Teno', 'Ycoden-Daute-Isora, Tenerife, Canary Islands, Spain', 'Tintilla', 'Red')  -- https://www.bowlerwine.com/producer/vinatigo
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ENVÍNATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Envínate', 'Táganan Blanco', 'Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.josepastorselections.com/envinate.html
  ('Envínate', 'Táganan Tinto', 'Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.josepastorselections.com/envinate.html
  ('Envínate', 'Táganan Parcela Margalagua', 'Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.josepastorselections.com/envinate.html
  ('Envínate', 'Benje Blanco', 'Ycoden-Daute-Isora, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.josepastorselections.com/envinate.html
  ('Envínate', 'Benje Tinto', 'Ycoden-Daute-Isora, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.josepastorselections.com/envinate.html
  ('Envínate', 'Palo Blanco', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.josepastorselections.com/envinate.html
  ('Envínate', 'Palo Blanco Parcela Las Molinas', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.josepastorselections.com/envinate.html
  ('Envínate', 'Migan', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.josepastorselections.com/envinate.html
  ('Envínate', 'Migan Chingao', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.josepastorselections.com/envinate.html
  ('Envínate', 'La Santa de Úrsula', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Negramoll/Listán Negro/Listán Blanco', 'Red')  -- https://www.josepastorselections.com/envinate.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOLORES CABRERA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Dolores Cabrera', 'La Araucaria Blanco', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.josepastorselections.com/dolores-cabrera.html
  ('Dolores Cabrera', 'La Araucaria Rosado', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', null, 'Rosé'),  -- https://www.josepastorselections.com/dolores-cabrera.html
  ('Dolores Cabrera', 'La Araucaria Tinto', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', null, 'Red')  -- https://www.josepastorselections.com/dolores-cabrera.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VE D'AVIOR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Ve d''Avior', 'Malvasia Ancestral', 'Mallorca, Spain', 'Malvasia', 'Sparkling'),  -- https://www.josepastorselections.com/cati-ribot.html
  ('Ve d''Avior', 'Son Llebre Blanc', 'Mallorca, Spain', null, 'White'),  -- https://www.josepastorselections.com/cati-ribot.html
  ('Ve d''Avior', 'Malvasia', 'Mallorca, Spain', 'Malvasia', 'White'),  -- https://www.josepastorselections.com/cati-ribot.html
  ('Ve d''Avior', 'Son Llebre Negre', 'Mallorca, Spain', null, 'Red'),  -- https://www.josepastorselections.com/cati-ribot.html
  ('Ve d''Avior', 'Escursac', 'Mallorca, Spain', 'Escursac', 'Red'),  -- https://www.josepastorselections.com/cati-ribot.html
  ('Ve d''Avior', 'Cambuix', 'Mallorca, Spain', 'Escursac/Callet', 'Red')  -- https://www.vinissimus.com/es/region/espana/mallorca/pla-i-llevant/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- EL GRIFO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('El Grifo', 'Malvasía Colección Seco', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://www.vinissimus.com/es/bodega/bodegas-el-grifo/
  ('El Grifo', 'Lías', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://www.vinissimus.com/es/bodega/bodegas-el-grifo/
  ('El Grifo', 'Tinto Ariana', 'Lanzarote, Canary Islands, Spain', 'Listán Negro/Syrah', 'Red'),  -- https://www.vinissimus.com/es/bodega/bodegas-el-grifo/
  ('El Grifo', 'Malvasía Colección Semidulce', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'Sweet'),  -- https://www.vinissimus.com/es/bodega/bodegas-el-grifo/
  ('El Grifo', 'Ancestral Ecológico', 'Lanzarote, Canary Islands, Spain', null, 'Sparkling'),  -- https://elgrifo.com/
  ('El Grifo', 'Listán Negro Grano a Grano', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://elgrifo.com/
  ('El Grifo', 'Malvasía Volcánica Brut Nature Reserva', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'Sparkling'),  -- https://elgrifo.com/
  ('El Grifo', 'Canari', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'Sweet'),  -- https://elgrifo.com/
  ('El Grifo', 'Malvasía Volcánica Finca Ramón Ecológico', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://elgrifo.com/
  ('El Grifo', 'Moscatel de Ana', 'Lanzarote, Canary Islands, Spain', 'Moscatel', 'Sweet'),  -- https://elgrifo.com/
  ('El Grifo', 'Rosado de Lágrima', 'Lanzarote, Canary Islands, Spain', null, 'Rosé'),  -- https://elgrifo.com/
  ('El Grifo', 'George Glas', 'Lanzarote, Canary Islands, Spain', null, 'Sweet'),  -- https://elgrifo.com/
  ('El Grifo', 'Vijariego Sobre Lías', 'Lanzarote, Canary Islands, Spain', 'Vijariego Blanco', 'White')  -- https://elgrifo.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TAJINASTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Tajinaste', 'Blanco Afrutado', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Blanco/Moscatel de Alejandría', 'White'),  -- https://www.vinissimus.com/es/bodega/tajinaste-vinedos-y-bodeda/
  ('Tajinaste', 'Rosado', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Rosé'),  -- https://www.vinissimus.com/es/bodega/tajinaste-vinedos-y-bodeda/
  ('Tajinaste', 'Blanco Seco', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Blanco/Albillo', 'White'),  -- https://www.vinissimus.com/es/bodega/tajinaste-vinedos-y-bodeda/
  ('Tajinaste', 'Vendimia Seleccionada', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://www.vinissimus.com/es/bodega/tajinaste-vinedos-y-bodeda/
  ('Tajinaste', 'Tinto Tradición', 'Valle de la Orotava, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://www.vinissimus.com/es/bodega/tajinaste-vinedos-y-bodeda/
  ('Tajinaste', 'Paisaje de las Islas Malvasía', 'Islas Canarias, Canary Islands, Spain', 'Malvasía', 'Sweet')  -- https://www.vinissimus.com/es/bodega/tajinaste-vinedos-y-bodeda/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VICTORIA TORRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Victoria Torres', 'Las Migas', 'La Palma, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.vinissimus.com/es/bodega/bodega-victoria-torres-pecis/
  ('Victoria Torres', 'Malvasía Aromática Seca', 'La Palma, Canary Islands, Spain', 'Malvasía Aromática', 'White'),  -- https://www.bowlerwine.com/producer/victoria-torres-pecis
  ('Victoria Torres', 'SLQ', 'La Palma, Canary Islands, Spain', 'Listán Blanco/Malvasía', 'White'),  -- https://www.bowlerwine.com/producer/victoria-torres-pecis
  ('Victoria Torres', 'Las Machuqueras', 'La Palma, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.bowlerwine.com/producer/victoria-torres-pecis
  ('Victoria Torres', 'Sin Título', 'La Palma, Canary Islands, Spain', 'Albillo/Listán Blanco', 'White'),  -- https://www.bowlerwine.com/producer/victoria-torres-pecis
  ('Victoria Torres', 'Negramoll', 'La Palma, Canary Islands, Spain', 'Negramoll', 'Red')  -- https://www.bowlerwine.com/producer/victoria-torres-pecis
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- 4 KILOS VINÍCOLA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('4 Kilos Vinícola', '12 Volts', 'Mallorca, Spain', 'Callet/Fogoneu/Syrah/Cabernet Sauvignon/Merlot', 'Red'),  -- https://www.vinissimus.com/es/bodega/4-kilos-vinicola/
  ('4 Kilos Vinícola', '4 Kilos', 'Mallorca, Spain', 'Callet', 'Red'),  -- https://www.vinissimus.com/es/bodega/4-kilos-vinicola/
  ('4 Kilos Vinícola', 'Gallinas & Focas', 'Mallorca, Spain', 'Manto Negro/Syrah', 'Red'),  -- https://www.vinissimus.com/es/bodega/4-kilos-vinicola/
  ('4 Kilos Vinícola', 'Grimalt Caballero', 'Mallorca, Spain', 'Callet/Fogoneu', 'Red'),  -- https://www.vinissimus.com/es/bodega/4-kilos-vinicola/
  ('4 Kilos Vinícola', 'Motor Callet', 'Mallorca, Spain', 'Callet', 'Red'),  -- https://www.vinissimus.com/es/bodega/4-kilos-vinicola/
  ('4 Kilos Vinícola', 'Motor Blanc', 'Mallorca, Spain', 'Premsal/Malvasía', 'White')  -- https://www.vinissimus.com/es/bodega/4-kilos-vinicola/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAN MAJORAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Can Majoral', 'Butibalausi Rosat', 'Pla i Llevant, Mallorca, Spain', 'Callet/Tempranillo/Syrah', 'Rosé'),  -- https://www.vinissimus.com/es/bodega/can-majoral/
  ('Can Majoral', 'Capgiró', 'Pla i Llevant, Mallorca, Spain', 'Giró Blanc', 'White'),  -- https://canmajoral.com/vino-capgiro/
  ('Can Majoral', 'Gorgollassa', 'Pla i Llevant, Mallorca, Spain', 'Gorgollassa', 'Red'),  -- https://canmajoral.com/vino-gorgollasa/
  ('Can Majoral', 'Callet', 'Pla i Llevant, Mallorca, Spain', 'Callet', 'Red'),  -- https://canmajoral.com/vino-callet/
  ('Can Majoral', 'Mantonegro', 'Pla i Llevant, Mallorca, Spain', 'Manto Negro', 'Red'),  -- https://canmajoral.com/vino-mantonegro/
  ('Can Majoral', 'Vim Blanc', 'Pla i Llevant, Mallorca, Spain', 'Moscatel', 'Sweet'),  -- https://canmajoral.com/vino-vim/
  ('Can Majoral', 'Galdent', 'Pla i Llevant, Mallorca, Spain', 'Viognier', 'White'),  -- https://canmajoral.com/vino-galdent/
  ('Can Majoral', 'Son Blanc', 'Pla i Llevant, Mallorca, Spain', 'Chardonnay/Riesling', 'White'),  -- https://canmajoral.com/vino-son-blanc/
  ('Can Majoral', 'S''Heretat', 'Pla i Llevant, Mallorca, Spain', 'Callet/Syrah/Cabernet Sauvignon', 'Red'),  -- https://canmajoral.com/vino-heretat/
  ('Can Majoral', 'Son Roig', 'Pla i Llevant, Mallorca, Spain', 'Cabernet Sauvignon/Merlot/Syrah', 'Red')  -- https://canmajoral.com/vino-roig/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RUBICÓN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Rubicón', 'Amalia Tinto de Autor', 'Lanzarote, Canary Islands, Spain', null, 'Red'),  -- https://bodegasrubicon.com/vinos
  ('Rubicón', 'Amalia Tinto', 'Lanzarote, Canary Islands, Spain', null, 'Red'),  -- https://bodegasrubicon.com/vinos
  ('Rubicón', 'Amalia Seco', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://bodegasrubicon.com/vinos
  ('Rubicón', 'Moscatel', 'Lanzarote, Canary Islands, Spain', 'Moscatel', 'Sweet'),  -- https://bodegasrubicon.com/vinos
  ('Rubicón', 'Sweet Gold', 'Lanzarote, Canary Islands, Spain', null, 'Sweet'),  -- https://bodegasrubicon.com/vinos
  ('Rubicón', 'Don Diego y Doña Dulce', 'Lanzarote, Canary Islands, Spain', null, 'Sweet'),  -- https://bodegasrubicon.com/vinos
  ('Rubicón', 'Tinto', 'Lanzarote, Canary Islands, Spain', null, 'Red'),  -- https://bodegasrubicon.com/vinos
  ('Rubicón', 'Rosado', 'Lanzarote, Canary Islands, Spain', null, 'Rosé'),  -- https://bodegasrubicon.com/vinos
  ('Rubicón', 'Semidulce', 'Lanzarote, Canary Islands, Spain', null, 'Sweet'),  -- https://bodegasrubicon.com/vinos
  ('Rubicón', 'Seco', 'Lanzarote, Canary Islands, Spain', null, 'White')  -- https://bodegasrubicon.com/vinos
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VULCANO DE LANZAROTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Vulcano de Lanzarote', 'Liquen Malvasía Volcánica Ecológico', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Liquen Diego Ecológico', 'Lanzarote, Canary Islands, Spain', 'Diego', 'White'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Liquen Tinto Ecológico', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Blanc de Noirs', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'White'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Vijariego Blanco', 'Lanzarote, Canary Islands, Spain', 'Vijariego Blanco', 'White'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Malvasía Volcánica Roble', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Malvasía Volcánica Blanco Seco', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Blanco Semidulce', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica/Moscatel de Alejandría', 'Sweet'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Rosado', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Rosé'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Tinto', 'Lanzarote, Canary Islands, Spain', null, 'Red'),  -- https://bodegavulcano.es/vinos/
  ('Vulcano de Lanzarote', 'Vulcano Dolce', 'Lanzarote, Canary Islands, Spain', 'Moscatel de Alejandría', 'Sweet')  -- https://bodegavulcano.es/vinos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PURO ROFE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Puro Rofe', 'Rofe Blanco', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica/Diego/Listán Blanco', 'White'),  -- https://www.sagerandwine.com/purorofe
  ('Puro Rofe', 'Tilama', 'Lanzarote, Canary Islands, Spain', 'Malvasía Volcánica', 'White'),  -- https://www.sagerandwine.com/purorofe
  ('Puro Rofe', 'Chupadero', 'Lanzarote, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.sagerandwine.com/purorofe
  ('Puro Rofe', 'Listán Mecánico', 'Lanzarote, Canary Islands, Spain', 'Listán Negro/Malvasía Volcánica', 'Red'),  -- https://www.sagerandwine.com/purorofe
  ('Puro Rofe', 'Muñique', 'Lanzarote, Canary Islands, Spain', 'Listán Negro', 'Red')  -- https://www.sagerandwine.com/purorofe
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BIMBACHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Bimbache', 'La Raya', 'El Hierro, Canary Islands, Spain', null, 'White'),  -- https://www.vinissimus.com/es/region/espana/islas-canarias/el-hierro/
  ('Bimbache', 'Miguelito Jackson Blan de Nuar', 'El Hierro, Canary Islands, Spain', 'Baboso Negro/Listán Negro/Vijariego Negro', 'White'),  -- https://www.vinissimus.com/es/region/espana/islas-canarias/el-hierro/
  ('Bimbache', 'Pelibuey', 'El Hierro, Canary Islands, Spain', 'Listán Blanco/Vijariego Blanco/Marmajuelo', 'White'),  -- https://www.vinissimus.com/es/region/espana/islas-canarias/el-hierro/
  ('Bimbache', 'Quintero Vidueño', 'El Hierro, Canary Islands, Spain', null, 'White'),  -- https://www.vinissimus.com/es/region/espana/islas-canarias/el-hierro/
  ('Bimbache', 'Tinto', 'El Hierro, Canary Islands, Spain', 'Listán Negro', 'Red')  -- https://www.vinissimus.com/es/region/espana/islas-canarias/el-hierro/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SANTA CATARINA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Santa Catarina', '''Nguany Blanco', 'Mallorca, Spain', 'Giró Ros/Viognier', 'White'),  -- https://www.vinissimus.com/es/region/espana/mallorca/
  ('Santa Catarina', 'Sta Manto Negro', 'Binissalem, Mallorca, Spain', 'Manto Negro', 'Red')  -- https://www.vinissimus.com/es/region/espana/mallorca/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAN AXARTELL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Can Axartell', 'Blanco', 'Mallorca, Spain', 'Malvasía/Premsal', 'White'),  -- https://www.vinissimus.com/es/region/espana/mallorca/
  ('Can Axartell', 'Rosado', 'Mallorca, Spain', 'Pinot Noir/Callet/Manto Negro', 'Rosé'),  -- https://www.vinissimus.com/es/region/espana/mallorca/
  ('Can Axartell', 'Terrum', 'Mallorca, Spain', 'Callet', 'Red'),  -- https://www.vinissimus.com/es/region/espana/mallorca/
  ('Can Axartell', 'The Artist', 'Mallorca, Spain', 'Manto Negro/Callet/Merlot/Syrah', 'Red'),  -- https://www.vinissimus.com/es/region/espana/mallorca/
  ('Can Axartell', 'Tinto', 'Mallorca, Spain', 'Pinot Noir/Callet/Merlot/Syrah', 'Red'),  -- https://www.vinissimus.com/es/region/espana/mallorca/
  ('Can Axartell', 'Ventum', 'Mallorca, Spain', 'Merlot/Syrah/Callet', 'Red')  -- https://www.vinissimus.com/es/region/espana/mallorca/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TIANNA NEGRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Tianna Negre', 'Mas de Canet Blanc', 'Mallorca, Spain', 'Premsal/Chardonnay/Moscatel de Grano Menudo', 'White'),  -- https://www.vinissimus.com/es/region/espana/mallorca/
  ('Tianna Negre', 'Ses Nines Blanc Selecció 07/9', 'Mallorca, Spain', 'Premsal/Chardonnay/Moscatel de Grano Menudo', 'White')  -- https://www.vinissimus.com/es/region/espana/mallorca/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JAUME PRATS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Jaume Prats', 'Jaumet', 'Mallorca, Spain', 'Callet/Malvasía/Manto Negro/Fogoneu/Premsal', 'Rosé'),  -- https://www.vinissimus.com/es/region/espana/mallorca/
  ('Jaume Prats', 'Jaumeta', 'Mallorca, Spain', 'Malvasía/Manto Negro/Callet/Fogoneu/Premsal/Moscatel', 'Rosé'),  -- https://www.vinissimus.com/es/region/espana/mallorca/
  ('Jaume Prats', 'Fono', 'Mallorca, Spain', null, 'Red')  -- https://www.vinissimus.com/es/region/espana/mallorca/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CA'N VERDURA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Ca''n Verdura', 'Ca''n Verdura', 'Binissalem, Mallorca, Spain', 'Manto Negro/Merlot/Monastrell/Callet', 'Red')  -- https://www.vinissimus.com/es/region/espana/mallorca/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRONTOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Frontos', 'Blanco Seco Ecológico', 'Abona, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://frontos.es/vinos/
  ('Frontos', 'Blanco Clásico', 'Abona, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://frontos.es/vinos/
  ('Frontos', 'Tinto Tierra', 'Abona, Tenerife, Canary Islands, Spain', null, 'Red')  -- https://frontos.es/vinos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SON MAYOL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Son Mayol', 'Grand Vin', 'Mallorca, Spain', 'Cabernet Sauvignon/Merlot', 'Red'),  -- https://bodegasonmayol.es/
  ('Son Mayol', 'Premier Vin', 'Mallorca, Spain', null, 'Red')  -- https://bodegasonmayol.es/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGAS INSULARES TENERIFE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Bodegas Insulares Tenerife', 'Viña Norte Tinto Joven', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
  ('Bodegas Insulares Tenerife', 'Viña Norte Tinto Maceración Carbónica', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
  ('Bodegas Insulares Tenerife', 'Viña Norte Tinto Afrutado', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
  ('Bodegas Insulares Tenerife', 'Viña Norte Rosado Afrutado', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Rosé'),  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
  ('Bodegas Insulares Tenerife', 'Viña Norte Blanco Seco', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
  ('Bodegas Insulares Tenerife', 'Viña Norte Blanco Afrutado', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
  ('Bodegas Insulares Tenerife', 'Viña Norte Tinto Barrica', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
  ('Bodegas Insulares Tenerife', 'Viña Norte Tinto Selección Sostenible', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
  ('Bodegas Insulares Tenerife', 'Viña Norte Tinto Crianza', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
  ('Bodegas Insulares Tenerife', 'Brezal Tinto', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red')  -- https://www.tucanarias.com/es/comprar-vino-vina-norte-tenerife.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA FRONTERA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Viña Frontera', 'Tinto', 'El Hierro, Canary Islands, Spain', null, 'Red'),  -- https://www.tucanarias.com/es/comprar-vinos-vina-frontera.html
  ('Viña Frontera', 'Blanco Seco', 'El Hierro, Canary Islands, Spain', null, 'White'),  -- https://www.tucanarias.com/es/comprar-vinos-vina-frontera.html
  ('Viña Frontera', 'Blanco Afrutado', 'El Hierro, Canary Islands, Spain', null, 'White')  -- https://www.tucanarias.com/es/comprar-vinos-vina-frontera.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VEGA NORTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Vega Norte', 'Rosado', 'La Palma, Canary Islands, Spain', 'Negramoll', 'Rosé'),  -- https://www.tucanarias.com/es/comprar-vino-Vega-Norte-La-Palma.html
  ('Vega Norte', 'Blanco', 'La Palma, Canary Islands, Spain', 'Listán Blanco/Albillo Criollo', 'White'),  -- https://www.tucanarias.com/es/comprar-vino-Vega-Norte-La-Palma.html
  ('Vega Norte', 'Blanco Afrutado', 'La Palma, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.tucanarias.com/es/comprar-vino-Vega-Norte-La-Palma.html
  ('Vega Norte', 'Tinto Varietal X', 'La Palma, Canary Islands, Spain', 'Castellana/Listán Prieto/Vijariego Negro', 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-Vega-Norte-La-Palma.html
  ('Vega Norte', 'Albillo Criollo', 'La Palma, Canary Islands, Spain', 'Albillo Criollo', 'White')  -- https://www.tucanarias.com/es/comprar-vino-Vega-Norte-La-Palma.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAS TIRAJANAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Las Tirajanas', 'Blanco Afrutado', 'Gran Canaria, Canary Islands, Spain', 'Malvasía Volcánica/Albillo Criollo/Listán Blanco', 'White'),  -- https://www.tucanarias.com/es/comprar-vino-Tirajanas-Gran-Canaria.html
  ('Las Tirajanas', 'Tinto Roble Barrica', 'Gran Canaria, Canary Islands, Spain', 'Listán Negro/Vijariego Negro/Castellana Negra/Tintilla', 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-Tirajanas-Gran-Canaria.html
  ('Las Tirajanas', 'Malvasía Dulce', 'Gran Canaria, Canary Islands, Spain', 'Malvasía/Moscatel', 'Sweet'),  -- https://www.tucanarias.com/es/comprar-vino-Tirajanas-Gran-Canaria.html
  ('Las Tirajanas', 'Blanco Verijadiego', 'Gran Canaria, Canary Islands, Spain', 'Verijadiego', 'White')  -- https://www.tucanarias.com/es/comprar-vino-Tirajanas-Gran-Canaria.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CUMBRES DE ABONA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Cumbres de Abona', 'Cumbres Abona Blanco', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
  ('Cumbres de Abona', 'Cumbres Abona Rosado', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Rosé'),  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
  ('Cumbres de Abona', 'Cumbres Abona Tinto', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
  ('Cumbres de Abona', 'Flor de Chasna Tinto', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Negro/Tempranillo/Syrah', 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
  ('Cumbres de Abona', 'Flor de Chasna Blanco Afrutado', 'Abona, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
  ('Cumbres de Abona', 'Flor de Chasna Blanco Semiseco', 'Abona, Tenerife, Canary Islands, Spain', 'Listán Blanco', 'White'),  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
  ('Cumbres de Abona', 'Flor de Chasna Tinto Barrica', 'Abona, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
  ('Cumbres de Abona', 'Flor de Chasna Tinto Maceración Carbónica', 'Abona, Tenerife, Canary Islands, Spain', null, 'Red'),  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
  ('Cumbres de Abona', 'Flor de Chasna Blanco Seco', 'Abona, Tenerife, Canary Islands, Spain', null, 'White'),  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
  ('Cumbres de Abona', 'Flor de Chasna Rosado Afrutado', 'Abona, Tenerife, Canary Islands, Spain', null, 'Rosé')  -- https://www.tucanarias.com/es/comprar-vino-Flor-de-Chasna.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PRESAS OCAMPO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_spanish_islands.sql)'
from (values
  ('Presas Ocampo', 'Blanco Seducción Semiseco', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Blanco/Moscatel/Malvasía', 'White'),  -- https://www.tucanarias.com/es/comprar-vinos-presas-ocampo.html
  ('Presas Ocampo', 'Rosado de Lágrima', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Negro', 'Rosé'),  -- https://www.tucanarias.com/es/comprar-vinos-presas-ocampo.html
  ('Presas Ocampo', 'Tinto Vendimia Seleccionada', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Negro/Syrah/Merlot', 'Red'),  -- https://www.tucanarias.com/es/comprar-vinos-presas-ocampo.html
  ('Presas Ocampo', 'Tinto Barrica', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Negro/Syrah/Cabernet Sauvignon/Tempranillo/Merlot', 'Red'),  -- https://www.tucanarias.com/es/comprar-vinos-presas-ocampo.html
  ('Presas Ocampo', 'Tinto Viñedos Propios', 'Tacoronte-Acentejo, Tenerife, Canary Islands, Spain', 'Listán Negro/Merlot/Syrah', 'Red')  -- https://www.tucanarias.com/es/comprar-vinos-presas-ocampo.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
