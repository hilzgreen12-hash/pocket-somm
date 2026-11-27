-- Producer ranges round 2: Spain. Every row confirmed on a real page opened 2026-11-26; source URL on each row.

-- ---- LA RIOJA ALTA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('La Rioja Alta', 'Viña Alberdi Selección Especial', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.riojalta.com/en/wines_rioja-alta/vina-alberdi/
  ('La Rioja Alta', 'Viña Ardanza Reserva', 'Rioja, Spain', 'Tempranillo/Garnacha', 'Red'),  -- https://www.riojalta.com/en/wines_rioja-alta/vina-ardanza/
  ('La Rioja Alta', 'Viña Arana Gran Reserva', 'Rioja, Spain', 'Tempranillo/Graciano', 'Red'),  -- https://www.riojalta.com/en/wines_rioja-alta/vina-arana/
  ('La Rioja Alta', 'Gran Reserva 904', 'Rioja, Spain', 'Tempranillo/Graciano', 'Red'),  -- https://www.riojalta.com/en/wines_rioja-alta/gran-reserva-904/
  ('La Rioja Alta', 'Gran Reserva 890', 'Rioja, Spain', 'Tempranillo/Graciano/Mazuelo', 'Red')  -- https://www.riojalta.com/en/wines_rioja-alta/gran-reserva-890/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- R. LÓPEZ DE HEREDIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('R. López de Heredia', 'Viña Tondonia Reserva Tinto', 'Rioja, Spain', 'Tempranillo/Garnacho/Graciano/Mazuelo', 'Red'),  -- https://www.lopezdeheredia.com/spanish/vinos/tondoniaRT.html
  ('R. López de Heredia', 'Viña Tondonia Gran Reserva Tinto', 'Rioja, Spain', null, 'Red'),  -- https://www.lopezdeheredia.com/spanish/vinos/vinos.html
  ('R. López de Heredia', 'Viña Tondonia Reserva Blanco', 'Rioja, Spain', null, 'White'),  -- https://www.lopezdeheredia.com/spanish/vinos/vinos.html
  ('R. López de Heredia', 'Viña Tondonia Gran Reserva Blanco', 'Rioja, Spain', null, 'White'),  -- https://www.lopezdeheredia.com/spanish/vinos/vinos.html
  ('R. López de Heredia', 'Viña Tondonia Gran Reserva Rosado', 'Rioja, Spain', null, 'Rosé'),  -- https://www.lopezdeheredia.com/spanish/vinos/vinos.html
  ('R. López de Heredia', 'Viña Bosconia Reserva Tinto', 'Rioja, Spain', 'Tempranillo/Garnacho/Mazuelo/Graciano', 'Red'),  -- https://www.lopezdeheredia.com/spanish/vinos/bosconiaR.html
  ('R. López de Heredia', 'Viña Bosconia Gran Reserva Tinto', 'Rioja, Spain', null, 'Red'),  -- https://www.lopezdeheredia.com/spanish/vinos/vinos.html
  ('R. López de Heredia', 'Viña Cubillo Crianza', 'Rioja, Spain', 'Tempranillo/Garnacho/Mazuelo/Graciano', 'Red'),  -- https://www.lopezdeheredia.com/spanish/vinos/cubillo.html
  ('R. López de Heredia', 'Viña Gravonia Crianza Blanco', 'Rioja, Spain', 'Viura', 'White')  -- https://www.lopezdeheredia.com/spanish/vinos/gravonia.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARQUÉS DE CÁCERES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Marqués de Cáceres', 'Crianza', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.marquesdecaceres.com/en/vinos/crianza-en/
  ('Marqués de Cáceres', 'Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.marquesdecaceres.com/en/wines/
  ('Marqués de Cáceres', 'Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.marquesdecaceres.com/en/wines/
  ('Marqués de Cáceres', 'Reserva Especial', 'Rioja, Spain', 'Tempranillo/Graciano/Garnacha', 'Red'),  -- https://www.marquesdecaceres.com/en/vinos/reserva-especial-en/
  ('Marqués de Cáceres', 'Ecológico', 'Rioja, Spain', 'Tempranillo/Graciano', 'Red'),  -- https://www.marquesdecaceres.com/en/vinos/ecologico-en/
  ('Marqués de Cáceres', 'Blanco Joven', 'Rioja, Spain', null, 'White'),  -- https://www.marquesdecaceres.com/en/wines/
  ('Marqués de Cáceres', 'Satinela Semidulce', 'Rioja, Spain', 'Viura/Malvasía', 'White'),  -- https://www.marquesdecaceres.com/en/vinos/satinela-semidulce-en/
  ('Marqués de Cáceres', 'Rosado', 'Rioja, Spain', null, 'Rosé'),  -- https://www.marquesdecaceres.com/en/wines/
  ('Marqués de Cáceres', 'Verdejo', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://www.marquesdecaceres.com/en/vinos/verdejo-en/
  ('Marqués de Cáceres', 'Cava', 'Cava, Spain', 'Xarel.lo/Macabeo/Parellada', 'Sparkling'),  -- https://www.marquesdecaceres.com/en/vinos/cava-en/
  ('Marqués de Cáceres', 'Deusa Nai Albariño', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://www.marquesdecaceres.com/en/vinos/deusa-nai-albarino-en/
  ('Marqués de Cáceres', 'Excellens Verdejo', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://www.marquesdecaceres.com/en/vinos/excellens-verdejo-en/
  ('Marqués de Cáceres', 'Excellens Sauvignon Blanc', 'Rueda, Castilla y León, Spain', 'Sauvignon Blanc', 'White'),  -- https://www.marquesdecaceres.com/en/vinos/excellens-sauvignon-blanc-en/
  ('Marqués de Cáceres', 'Excellens Cuvée Especial', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.marquesdecaceres.com/en/vinos/excellens-cuvee-especial-en/
  ('Marqués de Cáceres', 'Excellens Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.marquesdecaceres.com/en/wines/
  ('Marqués de Cáceres', 'Excellens Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.marquesdecaceres.com/en/wines/
  ('Marqués de Cáceres', 'Antea', 'Rioja, Spain', 'Viura/Tempranillo Blanco', 'White'),  -- https://www.marquesdecaceres.com/en/vinos/antea-en/
  ('Marqués de Cáceres', 'SIMOF', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.marquesdecaceres.com/en/vinos/simof-en/
  ('Marqués de Cáceres', 'Generación MC Tempranillo', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.marquesdecaceres.com/en/wines/
  ('Marqués de Cáceres', 'Los Altares', 'Rioja, Spain', 'Viura', 'White'),  -- https://www.marquesdecaceres.com/en/vinos/los-altares/
  ('Marqués de Cáceres', 'La Halconera Maturana', 'Rioja, Spain', 'Maturana Tinta', 'Red'),  -- https://www.marquesdecaceres.com/en/vinos/la-halconera-maturana-en/
  ('Marqués de Cáceres', 'Gaudium', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.marquesdecaceres.com/en/vinos/gaudium-en/
  ('Marqués de Cáceres', '50 Aniversario', 'Rioja, Spain', 'Tempranillo', 'Red')  -- https://www.marquesdecaceres.com/en/vinos/50-aniversario-en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGAS MONTECILLO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Bodegas Montecillo', 'Crianza', 'Rioja, Spain', 'Tempranillo/Garnacha', 'Red'),  -- https://www.bodegasmontecillo.com/vinos/gama-clasica/crianza/
  ('Bodegas Montecillo', 'Reserva', 'Rioja, Spain', 'Tempranillo/Mazuelo', 'Red'),  -- https://www.bodegasmontecillo.com/vinos/gama-clasica/reserva/
  ('Bodegas Montecillo', 'Gran Reserva', 'Rioja, Spain', 'Tempranillo/Graciano', 'Red'),  -- https://www.bodegasmontecillo.com/vinos/gama-clasica/gran-reserva/
  ('Bodegas Montecillo', 'Blanco Fermentado en Barrica', 'Rioja, Spain', 'Viura/Sauvignon Blanc/Tempranillo Blanco', 'White'),  -- https://www.bodegasmontecillo.com/vinos/gama-clasica/blanco/
  ('Bodegas Montecillo', 'Rosé', 'Rioja, Spain', null, 'Rosé'),  -- https://www.bodegasmontecillo.com/vinos/gama-clasica/rose/
  ('Bodegas Montecillo', '22 Barricas Gran Reserva', 'Rioja, Spain', 'Tempranillo/Graciano/Garnacha/Mazuelo', 'Red'),  -- https://www.bodegasmontecillo.com/vinos/singulares/montecillo-22-barricas/
  ('Bodegas Montecillo', 'Edición Limitada', 'Rioja, Spain', 'Tempranillo/Graciano', 'Red'),  -- https://www.bodegasmontecillo.com/vinos/singulares/montecillo-edicion-limitada/
  ('Bodegas Montecillo', 'Garnacha Blanca Edición Limitada', 'Rioja, Spain', 'Garnacha Blanca', 'White'),  -- https://www.bodegasmontecillo.com/vinos/singulares/montecillo-garnacha-blanca/
  ('Bodegas Montecillo', 'Viña Monty Viura Reserva', 'Rioja, Spain', 'Viura', 'White'),  -- https://www.bodegasmontecillo.com/vinos/vina-monty/viura-reserva/
  ('Bodegas Montecillo', 'Viña Monty Garnacha Reserva', 'Rioja, Spain', 'Garnacha', 'Red'),  -- https://www.bodegasmontecillo.com/vinos/vina-monty/garnacha-reserva/
  ('Bodegas Montecillo', 'Viña Monty Graciano Reserva', 'Rioja, Spain', 'Graciano', 'Red'),  -- https://www.bodegasmontecillo.com/vinos/vina-monty/graciano-reserva/
  ('Bodegas Montecillo', '500 a Bordo Crianza', 'Rioja, Spain', 'Tempranillo/Garnacha', 'Red'),  -- https://www.bodegasmontecillo.com/vinos/500-a-bordo/500-a-bordo-crianza/
  ('Bodegas Montecillo', 'Singladuras Verdejo', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://www.bodegasmontecillo.com/vinos/otras-do/verdejo/
  ('Bodegas Montecillo', 'Singladuras Ribera del Duero', 'Ribera del Duero, Castilla y León, Spain', 'Tempranillo', 'Red'),  -- https://www.bodegasmontecillo.com/vinos/otras-do/ribera/
  ('Bodegas Montecillo', 'Singladuras Albariño', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White')  -- https://www.bodegasmontecillo.com/vinos/otras-do/albarino/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RAMÓN BILBAO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Ramón Bilbao', 'Crianza', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://bodegasramonbilbao.com/en/wines/crianza/
  ('Ramón Bilbao', 'Reserva', 'Rioja, Spain', 'Tempranillo/Graciano/Mazuelo', 'Red'),  -- https://bodegasramonbilbao.com/en/wines/reserva/
  ('Ramón Bilbao', 'Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://bodegasramonbilbao.com/en/wines/gran-reserva/
  ('Ramón Bilbao', 'Rosado', 'Rioja, Spain', null, 'Rosé'),  -- https://bodegasramonbilbao.com/en/wines/rosado/
  ('Ramón Bilbao', 'Edición Limitada', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://bodegasramonbilbao.com/en/wines/edicion-limitada/
  ('Ramón Bilbao', 'Edición Limitada Garnacha', 'Rioja, Spain', 'Garnacha', 'Red'),  -- https://bodegasramonbilbao.com/en/wines/edicion-limitada-garnacha/
  ('Ramón Bilbao', 'Viñedos de Altura', 'Rioja, Spain', 'Tempranillo/Garnacha', 'Red'),  -- https://bodegasramonbilbao.com/en/wines/vinedos-de-altura/
  ('Ramón Bilbao', 'Selección de la Familia', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://bodegasramonbilbao.com/en/wines/ramon-bilbao-seleccion-de-la-familia/
  ('Ramón Bilbao', 'Mirto', 'Rioja, Spain', null, 'Red'),  -- https://bodegasramonbilbao.com/en/wines/mirto/
  ('Ramón Bilbao', 'Límite Sur', 'Rioja, Spain', 'Garnacha', 'Red'),  -- https://bodegasramonbilbao.com/en/wines/limite-sur/
  ('Ramón Bilbao', 'Límite Norte', 'Rioja, Spain', 'Maturana Blanca/Tempranillo Blanco', 'White'),  -- https://bodegasramonbilbao.com/en/wines/limite-norte/
  ('Ramón Bilbao', 'Early Harvest Rosado', 'Rioja, Spain', 'Garnacha/Tempranillo Blanco', 'Rosé'),  -- https://bodegasramonbilbao.com/en/wines/edicion-limitada-early-harvest-rosado/
  ('Ramón Bilbao', 'Lalomba Finca Lalinde', 'Rioja, Spain', 'Garnacha/Viura', 'Rosé'),  -- https://bodegasramonbilbao.com/en/wines/lalomba-rose/
  ('Ramón Bilbao', 'Lalomba Finca Ladero', 'Rioja, Spain', 'Tempranillo/Garnacha', 'Red'),  -- https://bodegasramonbilbao.com/en/wines/finca-ladero/
  ('Ramón Bilbao', 'Lalomba Finca Valhonta', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://bodegasramonbilbao.com/en/wines/finca-valhonta/
  ('Ramón Bilbao', 'Verdejo', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://bodegasramonbilbao.com/en/wines/verdejo/
  ('Ramón Bilbao', 'Verdejo sobre Lías', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://bodegasramonbilbao.com/en/wines/verdejo-sobre-lias/
  ('Ramón Bilbao', 'Early Harvest Verdejo', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://bodegasramonbilbao.com/en/wines/early-harvest-verdejo/
  ('Ramón Bilbao', 'Sauvignon Blanc', 'Rueda, Castilla y León, Spain', 'Sauvignon Blanc', 'White')  -- https://bodegasramonbilbao.com/en/wines/sauvignon-blanc/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BERONIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Beronia', 'Crianza', 'Rioja, Spain', null, 'Red'),  -- https://www.beronia.com/en/wines/unbeatable
  ('Beronia', 'Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.beronia.com/en/wines/unbeatable
  ('Beronia', 'Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.beronia.com/en/wines/unbeatable
  ('Beronia', 'Organic Crianza', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.beronia.com/en/wines/unbeatable
  ('Beronia', 'Viura', 'Rioja, Spain', 'Viura', 'White'),  -- https://www.beronia.com/en/wines/unbeatable
  ('Beronia', 'Rosé', 'Rioja, Spain', null, 'Rosé'),  -- https://www.beronia.com/en/wines/unbeatable
  ('Beronia', 'Rueda Verdejo', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://www.beronia.com/en/wines/unbeatable
  ('Beronia', 'Selección 198 Barricas', 'Rioja, Spain', 'Tempranillo/Graciano/Mazuelo', 'Red'),  -- https://www.beronia.com/en/wines/distinguished
  ('Beronia', 'III a.C.', 'Rioja, Spain', 'Tempranillo/Graciano/Mazuelo', 'Red'),  -- https://www.beronia.com/en/wines/distinguished
  ('Beronia', 'Alegra', 'Rioja, Spain', null, 'Rosé'),  -- https://www.beronia.com/en/wines/distinguished
  ('Beronia', 'Viñas Viejas', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.beronia.com/en/wines/rare
  ('Beronia', 'Graciano', 'Rioja, Spain', 'Graciano', 'Red'),  -- https://www.beronia.com/en/wines/rare
  ('Beronia', 'Mazuelo', 'Rioja, Spain', 'Mazuelo', 'Red'),  -- https://www.beronia.com/en/wines/rare
  ('Beronia', 'Tempranillo Elaboración Especial', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.beronia.com/en/wines/rare
  ('Beronia', 'Vareia', 'Rioja, Spain', null, 'Red')  -- https://www.beronia.com/en/vi%C3%B1edo-singular
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PROTOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Protos', 'Verdejo', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://www.decanter.com/sponsored/protos-at-decanters-london-fine-wine-encounter-2023-518966/
  ('Protos', 'Verdejo Cuvée', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://www.decanter.com/sponsored/protos-showing-pioneering-spirit-in-white-and-rose-winemaking-527515/
  ('Protos', 'Verdejo Reserva', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://www.decanter.com/sponsored/protos-showing-pioneering-spirit-in-white-and-rose-winemaking-527515/
  ('Protos', 'Clarete', 'Cigales, Castilla y León, Spain', null, 'Rosé'),  -- https://www.decanter.com/sponsored/protos-at-decanters-london-fine-wine-encounter-2023-518966/
  ('Protos', 'Aire de Protos', 'Cigales, Castilla y León, Spain', null, 'Rosé'),  -- https://www.decanter.com/sponsored/protos-showing-pioneering-spirit-in-white-and-rose-winemaking-527515/
  ('Protos', 'Roble', 'Ribera del Duero, Castilla y León, Spain', 'Tempranillo', 'Red'),  -- https://www.decanter.com/sponsored/protos-at-decanters-london-fine-wine-encounter-2023-518966/
  ('Protos', '9 Meses', 'Ribera del Duero, Castilla y León, Spain', 'Tempranillo', 'Red'),  -- https://www.decanter.com/sponsored/protos-at-decanters-london-fine-wine-encounter-2023-518966/
  ('Protos', '27', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.decanter.com/sponsored/protos-at-decanters-london-fine-wine-encounter-2023-518966/
  ('Protos', 'Crianza', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.vivino.com/wineries/protos
  ('Protos', 'Reserva', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.vivino.com/wineries/protos
  ('Protos', 'Gran Reserva', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.vivino.com/wineries/protos
  ('Protos', 'Selección Finca el Grajo Viejo', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.vivino.com/wineries/protos
  ('Protos', 'Carroa', 'Ribera del Duero, Castilla y León, Spain', null, 'Red')  -- https://www.vivino.com/wineries/protos
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VEGA SICILIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Vega Sicilia', 'Único', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://vinissimus.com/en/winery/bodegas-vega-sicilia
  ('Vega Sicilia', 'Único Reserva Especial', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://vinissimus.com/en/winery/bodegas-vega-sicilia
  ('Vega Sicilia', 'Valbuena 5°', 'Ribera del Duero, Castilla y León, Spain', null, 'Red')  -- https://vinissimus.com/en/winery/bodegas-vega-sicilia
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALIÓN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Alión', 'Alión', 'Ribera del Duero, Castilla y León, Spain', 'Tempranillo', 'Red')  -- https://www.bbr.com/products-20171130429-2017-bodegas-alion-ribera-del-duero-spain
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PINTIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Pintia', 'Pintia', 'Toro, Castilla y León, Spain', 'Tinta de Toro', 'Red')  -- https://www.vinissimus.com/en/wine/pintia/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MACÁN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Macán', 'Macán', 'Rioja, Spain', null, 'Red'),  -- https://www.vinissimus.com/es/vinos/tinto/detalle_vino.html?id_vino=macls13
  ('Macán', 'Macán Clásico', 'Rioja, Spain', 'Tempranillo', 'Red')  -- https://www.vinissimus.com/es/vinos/tinto/detalle_vino.html?id_vino=macls13
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CODORNÍU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Codorníu', 'Anna Brut', 'Cava, Catalonia, Spain', 'Chardonnay', 'Sparkling'),  -- https://wineanorak.com/2023/08/03/cava-discovery-5-codorniu/
  ('Codorníu', 'Anna Brut Nature', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/anna-de-codorniu-brut-nature/
  ('Codorníu', 'Anna Blanc de Blancs Reserva', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/anna-de-codorniu-blanc-de-blancs-reserva/
  ('Codorníu', 'Anna Brut Rosé', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/anna-de-codorniu-brut-rose/
  ('Codorníu', 'Anna Blanc de Noirs', 'Cava, Catalonia, Spain', 'Pinot Noir', 'Sparkling'),  -- https://www.vinissimus.com/en/cava/anna-de-codorniu-blanc-de-noirs/
  ('Codorníu', 'Anna Ice Edition', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/anna-de-codorniu-ice-edition/
  ('Codorníu', 'Ars Collecta Blanc de Blancs', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/codorniu-ars-collecta-blanc-de-blancs/
  ('Codorníu', 'Ars Collecta Blanc de Noirs', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/codorniu-ars-collecta-blanc-de-noirs/
  ('Codorníu', 'Ars Collecta Grand Rosé', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/codorniu-ars-collecta-grand-rose/
  ('Codorníu', 'Ars Collecta 459 Gran Reserva Brut', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://wineanorak.com/2023/08/03/cava-discovery-5-codorniu/
  ('Codorníu', 'Jaume Codorníu Gran Reserva Brut', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://wineanorak.com/2023/08/03/cava-discovery-5-codorniu/
  ('Codorníu', 'Selección Familia Raventós Reserva Brut', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://wineanorak.com/2023/08/03/cava-discovery-5-codorniu/
  ('Codorníu', 'Non Plus Ultra Reserva', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/codorniu-non-plus-ultra-bn-reserva/
  ('Codorníu', 'Original Ecológico Brut', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/codorniu-original-ecologico-brut/
  ('Codorníu', 'Original Ecológico Semiseco', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/codorniu-original-ecologico-semiseco/
  ('Codorníu', 'Extra Reserva Ecológico Brut', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/codorniu-extra-reserva-ecologico-brut/
  ('Codorníu', 'Gran Cremant Brut Eco', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.vinissimus.com/en/cava/codorniu-gran-cremant-brut-eco/
  ('Codorníu', 'Viñas de Anna Chardonnay', 'Catalunya, Catalonia, Spain', 'Chardonnay', 'White')  -- https://www.vinissimus.com/en/wine/vinas-de-anna/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SEGURA VIUDAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Segura Viudas', 'Brut Reserva Heredad', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://seguraviudas.com/en/products/cavas/brut-reserva-heredad/
  ('Segura Viudas', 'Brut Reserva', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://seguraviudas.com/en/products/cavas/brut-reserva/
  ('Segura Viudas', 'Brut Rosé', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://seguraviudas.com/en/products/cavas/brut-rose/
  ('Segura Viudas', 'Brut Organic', 'Cava, Catalonia, Spain', null, 'Sparkling'),  -- https://www.saq.com/en/15416560
  ('Segura Viudas', 'Garnatxa', 'Catalonia, Spain', 'Garnacha', 'Red'),  -- https://seguraviudas.com/en/products/still-wines/garnacha/
  ('Segura Viudas', 'Xarel·lo', 'Catalonia, Spain', 'Xarel·lo', 'White'),  -- https://seguraviudas.com/en/products/still-wines/xarel%c2%b7lo/
  ('Segura Viudas', 'Rosé', 'Catalonia, Spain', 'Merlot/Tempranillo', 'Rosé'),  -- https://seguraviudas.com/en/products/still-wines/rose/
  ('Segura Viudas', 'Mas d''Aranyó', 'Catalonia, Spain', null, 'Red'),  -- https://seguraviudas.com/en/products/still-wines/mas-daranyo/
  ('Segura Viudas', 'Creu de Lavit', 'Catalonia, Spain', 'Xarel·lo', 'White')  -- https://seguraviudas.com/en/products/still-wines/creu-de-lavit/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BORSAO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Borsao', 'Tres Picos Garnacha', 'Campo de Borja, Aragón, Spain', 'Garnacha', 'Red'),  -- https://www.bodegasborsao.com/productos/borsao-tres-picos
  ('Borsao', 'Zarihs', 'Campo de Borja, Aragón, Spain', 'Syrah', 'Red'),  -- https://www.bodegasborsao.com/productos/borsao-zarihs
  ('Borsao', 'Berola', 'Campo de Borja, Aragón, Spain', null, 'Red'),  -- https://www.bodegasborsao.com/productos/borsao-berola
  ('Borsao', 'Cabriola', 'Campo de Borja, Aragón, Spain', null, 'Red'),  -- https://www.bodegasborsao.com/productos/borsao-cabriola
  ('Borsao', 'Suia', 'Campo de Borja, Aragón, Spain', 'Viognier', 'White'),  -- https://www.bodegasborsao.com/productos/borsao-suia
  ('Borsao', 'Bolé Tinto', 'Campo de Borja, Aragón, Spain', null, 'Red'),  -- https://www.bodegasborsao.com/productos/borsao-bole-tinto
  ('Borsao', 'Bolé Blanco', 'Campo de Borja, Aragón, Spain', null, 'White'),  -- https://www.bodegasborsao.com/productos/borsao-bole-blanco
  ('Borsao', 'Selección Tinto', 'Campo de Borja, Aragón, Spain', null, 'Red'),  -- https://www.bodegasborsao.com/productos/borsao-seleccion-tinto
  ('Borsao', 'Selección Rosado', 'Campo de Borja, Aragón, Spain', 'Garnacha', 'Rosé'),  -- https://www.bodegasborsao.com/productos/borsao-seleccion-rosado
  ('Borsao', 'Selección Blanco', 'Campo de Borja, Aragón, Spain', 'Chardonnay/Macabeo', 'White')  -- https://www.bodegasborsao.com/productos/borsao-seleccion-blanco
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('LAN', 'Crianza', 'Rioja, Spain', null, 'Red'),  -- https://bodegaslan.com/en/tienda/lan-crianza-en/
  ('LAN', 'Reserva', 'Rioja, Spain', null, 'Red'),  -- https://bodegaslan.com/en/tienda/lan-reserva-en/
  ('LAN', 'Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://bodegaslan.com/en/tienda/lan-gran-reserva-en/
  ('LAN', 'Rosado', 'Rioja, Spain', null, 'Rosé'),  -- https://bodegaslan.com/en/tienda/lan-rosado-en/
  ('LAN', 'Ecológico', 'Rioja, Spain', null, 'Red'),  -- https://bodegaslan.com/en/tienda/lan-ecologico-en/
  ('LAN', 'D-12', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://bodegaslan.com/en/tienda/lan-d-12-en/
  ('LAN', 'A Mano', 'Rioja, Spain', null, 'Red'),  -- https://bodegaslan.com/en/tienda/lan-a-mano-en/
  ('LAN', 'Verdejo', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White')  -- https://bodegaslan.com/en/tienda/lan-verdejo-en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGAS PALACIO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Bodegas Palacio', 'Glorioso Crianza', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.vinissimus.com/es/vino/glorioso-crianza/
  ('Bodegas Palacio', 'Glorioso Crianza Selección Especial', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://misumiller.es/en/red/glorioso-crianza-seleccion-especial/
  ('Bodegas Palacio', 'Glorioso Reserva', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.ocado.com/products/bodegas-palacio-glorioso-rioja-reserva/475821011
  ('Bodegas Palacio', 'Glorioso Gran Reserva', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.thewinesociety.com/product/glorioso-gran-reserva-rioja-2018-en.aspx
  ('Bodegas Palacio', 'Cosme Palacio Reserva', 'Rioja, Spain', 'Tempranillo/Graciano/Mazuelo', 'Red'),  -- https://misumiller.es/en/inicio/cosme-palacio-tinto-reserva-vinedos-viejos/
  ('Bodegas Palacio', 'Cosme Palacio 1894 Blanco', 'Rioja, Spain', 'Malvasía/Viura', 'White'),  -- https://misumiller.es/en/bodegas-palacio/cosme-palacio-1894-blanco/
  ('Bodegas Palacio', 'Milflores Tinto', 'Rioja, Spain', 'Tempranillo', 'Red')  -- https://misumiller.es/en/red/milflores-edicion-especial/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JUAN GIL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Juan Gil', 'Etiqueta Amarilla', 'Jumilla, Murcia, Spain', 'Monastrell', 'Red'),  -- https://www.vinissimus.com/es/vino/juan-gil-etiqueta-amarilla/
  ('Juan Gil', 'Etiqueta Plata', 'Jumilla, Murcia, Spain', 'Monastrell', 'Red'),  -- https://vinissimus.com/en/winery/bodegas-juan-gil
  ('Juan Gil', 'Etiqueta Azul', 'Jumilla, Murcia, Spain', null, 'Red'),  -- https://vinissimus.com/en/winery/bodegas-juan-gil
  ('Juan Gil', 'Moscatel Seco', 'Jumilla, Murcia, Spain', 'Moscatel', 'White'),  -- https://vinissimus.com/en/winery/bodegas-juan-gil
  ('Juan Gil', 'Red Blend', 'Jumilla, Murcia, Spain', null, 'Red'),  -- https://www.regalwineco.com/producer/bodegas-juan-gil
  ('Juan Gil', 'Rosé', 'Jumilla, Murcia, Spain', null, 'Rosé')  -- https://www.regalwineco.com/producer/bodegas-juan-gil
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- EMILIO MORO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Emilio Moro', 'Emilio Moro', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Finca Resalso', 'Ribera del Duero, Castilla y León, Spain', 'Tempranillo', 'Red'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Vendimia Seleccionada', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'La Felisa', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Malleolus', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Malleolus de Valderramiro', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Malleolus de Sanchomartín', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Clon de la Familia', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Latertius', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Elalba', 'Ribera del Duero, Castilla y León, Spain', null, 'Rosé'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Polvorete', 'Bierzo, Castilla y León, Spain', null, 'White'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'El Zarzal', 'Bierzo, Castilla y León, Spain', null, 'White'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'La Revelía', 'Bierzo, Castilla y León, Spain', 'Godello', 'White'),  -- https://www.emiliomoro.com/en/shop/our-wines/
  ('Emilio Moro', 'Bestizo', 'Bierzo, Castilla y León, Spain', 'Mencía', 'Red')  -- https://www.emiliomoro.com/en/shop/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARTÍN CÓDAX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Martín Códax', 'Albariño', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://tienda.martincodax.com/collections/vinos-martin-codax/products/vino-albarino-martin-codax
  ('Martín Códax', 'Lías', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://tienda.martincodax.com/collections/vinos-martin-codax/products/vino-albarino-martin-codax-lias
  ('Martín Códax', 'Arousa', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://tienda.martincodax.com/collections/vinos-martin-codax/products/vino-albarino-martin-codax-arousa
  ('Martín Códax', 'O Barroso', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://tienda.martincodax.com/collections/vinos-martin-codax/products/vino-albarino-martin-codax-o-barroso
  ('Martín Códax', 'Finca Xieles', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://tienda.martincodax.com/collections/vinos-martin-codax/products/vino-albarino-finca-xieles
  ('Martín Códax', 'Vindel', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://tienda.martincodax.com/collections/vinos-martin-codax/products/vino-albarino-martin-codax-vindel
  ('Martín Códax', 'Gallaecia', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://tienda.martincodax.com/collections/vinos-martin-codax/products/vino-albarino-martin-codax-gallaecia
  ('Martín Códax', 'Espumoso', 'Rías Baixas, Galicia, Spain', 'Albariño', 'Sparkling'),  -- https://tienda.martincodax.com/collections/vinos-martin-codax/products/vino-albarino-martin-codax-espumoso
  ('Martín Códax', 'Organistrum', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://www.vino.com/en/dettaglio/rias-baixas-do-albarino-organistrum-martin-codax-2023.html
  ('Martín Códax', 'Burgáns Albariño', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White'),  -- https://www.systembolaget.se/produkt/vin/burgns-albario-7098601/
  ('Martín Códax', 'Marieta', 'Rías Baixas, Galicia, Spain', 'Albariño', 'White')  -- https://www.vinissimus.com/en/wine/marieta/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAGO DE CARRAOVEJAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Pago de Carraovejas', 'Pago de Carraovejas', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.pagodecarraovejas.com/en/wines/
  ('Pago de Carraovejas', 'El Anejón', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.pagodecarraovejas.com/en/wines/
  ('Pago de Carraovejas', 'Cuesta de las Liebres', 'Ribera del Duero, Castilla y León, Spain', 'Tempranillo', 'Red')  -- https://www.pagodecarraovejas.com/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GONZÁLEZ BYASS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('González Byass', 'Tío Pepe Fino', 'Jerez, Andalusia, Spain', 'Palomino', 'Fortified'),  -- https://www.tiopepe.com/index.php/es/producto/tio-pepe-fino
  ('González Byass', 'Tío Pepe Fino en Rama', 'Jerez, Andalusia, Spain', 'Palomino', 'Fortified'),  -- https://www.tiopepe.com/index.php/es/producto/fino-en-rama
  ('González Byass', 'Tío Pepe Una Palma', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://www.tiopepe.com/es/catalogo/vinos-de-jerez
  ('González Byass', 'Tío Pepe Dos Palmas', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://www.tiopepe.com/es/catalogo/vinos-de-jerez
  ('González Byass', 'Tío Pepe Tres Palmas', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://www.tiopepe.com/es/catalogo/vinos-de-jerez
  ('González Byass', 'Tío Pepe Cuatro Palmas Amontillado', 'Jerez, Andalusia, Spain', 'Palomino', 'Fortified'),  -- https://www.tiopepe.com/index.php/es/producto/cuatro-palmas
  ('González Byass', 'Viña AB Amontillado', 'Jerez, Andalusia, Spain', 'Palomino', 'Fortified'),  -- https://www.tiopepe.com/es/producto/vina-ab
  ('González Byass', 'Leonor Palo Cortado', 'Jerez, Andalusia, Spain', 'Palomino', 'Fortified'),  -- https://www.tiopepe.com/es/producto/leonor
  ('González Byass', 'Alfonso Oloroso Seco', 'Jerez, Andalusia, Spain', 'Palomino', 'Fortified'),  -- https://www.tiopepe.com/es/producto/alfonso
  ('González Byass', 'Cristina Medium', 'Jerez, Andalusia, Spain', 'Palomino/Pedro Ximénez', 'Fortified'),  -- https://www.tiopepe.com/es/producto/cristina
  ('González Byass', 'Solera 1847 Cream', 'Jerez, Andalusia, Spain', 'Palomino/Pedro Ximénez', 'Fortified'),  -- https://www.tiopepe.com/es/producto/solera-1847
  ('González Byass', 'Néctar Pedro Ximénez', 'Jerez, Andalusia, Spain', 'Pedro Ximénez', 'Fortified'),  -- https://www.tiopepe.com/es/producto/nectar
  ('González Byass', 'Del Duque Amontillado VORS', 'Jerez, Andalusia, Spain', 'Palomino', 'Fortified'),  -- https://www.tiopepe.com/es/producto/del-duque
  ('González Byass', 'Apóstoles Medium VORS', 'Jerez, Andalusia, Spain', 'Palomino/Pedro Ximénez', 'Fortified'),  -- https://www.tiopepe.com/es/producto/apostoles
  ('González Byass', 'Matusalem Cream VORS', 'Jerez, Andalusia, Spain', 'Palomino/Pedro Ximénez', 'Fortified'),  -- https://www.tiopepe.com/es/producto/matusalem
  ('González Byass', 'Noé Pedro Ximénez VORS', 'Jerez, Andalusia, Spain', 'Pedro Ximénez', 'Fortified')  -- https://www.tiopepe.com/es/producto/noe
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LUSTAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_spain.sql)'
from (values
  ('Lustau', 'Manzanilla Papirusa', 'Manzanilla-Sanlúcar de Barrameda, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/manzanilla-papirusa/
  ('Lustau', 'Fino Jarana', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/fino-jarana/
  ('Lustau', 'Fino del Puerto', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/fino-del-puerto/
  ('Lustau', 'Amontillado Los Arcos', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/amontillado-los-arcos/
  ('Lustau', 'Amontillado Escuadrilla', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/amontillado-escuadrilla/
  ('Lustau', 'Palo Cortado Península', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/palo-cortado-peninsula/
  ('Lustau', 'Oloroso Don Nuño', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/oloroso-don-nuno/
  ('Lustau', 'Medium Golden La Plaza Vieja', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/medium-golden-la-plaza-vieja/
  ('Lustau', 'Rare Cream Solera Superior', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/rare-cream-solera-superior/
  ('Lustau', 'Deluxe Cream Capataz Andrés', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/deluxe-cream-capataz-andres/
  ('Lustau', 'Pedro Ximénez San Emilio', 'Jerez, Andalusia, Spain', 'Pedro Ximénez', 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/pedro-ximenez-san-emilio/
  ('Lustau', 'Moscatel Emilín', 'Jerez, Andalusia, Spain', 'Moscatel', 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,solera-familiar-en/moscatel-emilin/
  ('Lustau', 'East India Solera', 'Jerez, Andalusia, Spain', 'Palomino/Pedro Ximénez', 'Fortified'),  -- https://lustau.es/en/coleccion/rare-and-vintage,sherry-wines/cream-east-india/
  ('Lustau', 'Oloroso Emperatriz Eugenia', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/rare-and-vintage,sherry-wines/oloroso-emperatriz-eugenia/
  ('Lustau', 'Amontillado Botaina', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/rare-and-vintage/amontillado-botaina/
  ('Lustau', 'Amontillado VORS', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,vors-en/amontillado-vors/
  ('Lustau', 'Palo Cortado VORS', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,vors-en/palo-cortado-vors/
  ('Lustau', 'Oloroso VORS', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,vors-en/oloroso-vors/
  ('Lustau', 'Cream VORS', 'Jerez, Andalusia, Spain', null, 'Fortified'),  -- https://lustau.es/en/coleccion/vors-en/cream-vors/
  ('Lustau', 'Pedro Ximénez VORS', 'Jerez, Andalusia, Spain', 'Pedro Ximénez', 'Fortified'),  -- https://lustau.es/en/coleccion/sherry-wines,vors-en/pedro-ximenez-vors/
  ('Lustau', 'Moscatel VORS', 'Jerez, Andalusia, Spain', 'Moscatel', 'Fortified')  -- https://lustau.es/en/coleccion/vors-en/moscatel-vors/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
