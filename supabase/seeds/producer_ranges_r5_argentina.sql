-- Producer ranges round 5: Argentina. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- CATENA ZAPATA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Catena Zapata', 'Malbec Argentino', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Birth of Cabernet', 'Mendoza, Argentina', 'Cabernet', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Adrianna Vineyard Mundus Bacillus Terrae Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Adrianna Vineyard Fortuna Terrae Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Adrianna Vineyard River Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Adrianna Vineyard White Bones Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Adrianna Vineyard White Stones Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Alta Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Alta Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Alta Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Appellation Lunlunta Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Appellation La Consulta Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Appellation Vista Flores Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Appellation Paraje Altamira Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Appellation Agrelo Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Appellation San Carlos Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Catena Appellation Tupungato Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Tinto Histórico', 'Mendoza, Argentina', null, 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Malbec Adrianna Vineyard', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Malbec Nicasia Vineyard', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Cabernet La Pirámide Vineyard', 'Mendoza, Argentina', 'Cabernet', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Cabernet-Cabernet', 'Mendoza, Argentina', 'Cabernet', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Syrah-Syrah', 'Mendoza, Argentina', 'Syrah', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Malbec-Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Pinot Noir-Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Cabernet-Malbec', 'Mendoza, Argentina', 'Cabernet, Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'DV Catena Chardonnay-Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Angélica Zapata Malbec Alta', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Angélica Zapata Cabernet Franc Alta', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Angélica Zapata Cabernet Sauvignon Alta', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Angélica Zapata Merlot Alta', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Angélica Zapata Chardonnay Alta', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Sangiovese', 'Mendoza, Argentina', 'Sangiovese', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Bonarda', 'Mendoza, Argentina', 'Bonarda', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Cabernet-Merlot', 'Mendoza, Argentina', 'Cabernet, Merlot', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Syrah', 'Mendoza, Argentina', 'Syrah', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Chardonnay Barrel Fermented', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Saint Felicien Semillon Doux', 'Mendoza, Argentina', 'Semillon', 'Sweet'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Nicasia Red Blend Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Nicasia Red Blend Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.catenawines.com/en/wines
  ('Catena Zapata', 'Nicasia Blanc de Blancs', 'Mendoza, Argentina', null, 'Sparkling')  -- https://www.catenawines.com/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- EL ENEMIGO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('El Enemigo', 'Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.saratogawine.com/producers/el-enemigo/
  ('El Enemigo', 'Semillon', 'Luján de Cuyo, Mendoza, Argentina', 'Semillon', 'White'),  -- https://www.saratogawine.com/producers/el-enemigo/
  ('El Enemigo', 'Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc, Malbec', 'Red'),  -- https://www.saratogawine.com/producers/el-enemigo/
  ('El Enemigo', 'Malbec', 'Mendoza, Argentina', 'Malbec, Cabernet Franc', 'Red'),  -- https://www.saratogawine.com/producers/el-enemigo/
  ('El Enemigo', 'Gran Enemigo Agrelo Cabernet Franc', 'Luján de Cuyo, Mendoza, Argentina', 'Cabernet Franc, Malbec', 'Red'),  -- https://www.saratogawine.com/producers/el-enemigo/
  ('El Enemigo', 'Gran Enemigo Gualtallary Cabernet Franc', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.saratogawine.com/producers/el-enemigo/
  ('El Enemigo', 'Gran Enemigo Chacayes Cabernet Franc', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Franc', 'Red')  -- https://www.saratogawine.com/producers/el-enemigo/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ACHAVAL FERRER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Achaval Ferrer', 'Finca Altamira Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.benchmarkwine.com/winery/16-achaval-ferrer
  ('Achaval Ferrer', 'Finca Bella Vista Malbec', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.benchmarkwine.com/winery/16-achaval-ferrer
  ('Achaval Ferrer', 'Finca Mirador Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.benchmarkwine.com/winery/16-achaval-ferrer
  ('Achaval Ferrer', 'Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.benchmarkwine.com/winery/16-achaval-ferrer
  ('Achaval Ferrer', 'Quimera', 'Mendoza, Argentina', 'Malbec', 'Red')  -- https://www.benchmarkwine.com/winery/16-achaval-ferrer
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIÑA COBOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Viña Cobos', 'Cobos Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.timelesswines.com/wineries/cobos/
  ('Viña Cobos', 'Volturno Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://vinacobos.com/wines?hsLang=en
  ('Viña Cobos', 'Vinculum Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://vinacobos.com/wines?hsLang=en
  ('Viña Cobos', 'Vinculum Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://vinacobos.com/wines?hsLang=en
  ('Viña Cobos', 'Felino Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://vinacobos.com/wines?hsLang=en
  ('Viña Cobos', 'Felino Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://vinacobos.com/wines?hsLang=en
  ('Viña Cobos', 'Felino Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White')  -- https://vinacobos.com/wines?hsLang=en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALAMOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Alamos', 'Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://www.alamoswinesus.com/our-wines.html
  ('Alamos', 'Selección Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://www.alamoswinesus.com/our-wines.html
  ('Alamos', 'Cabernet Sauvignon', 'Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.alamoswinesus.com/our-wines.html
  ('Alamos', 'Red Blend', 'Argentina', null, 'Red')  -- https://www.alamoswinesus.com/our-wines.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ZUCCARDI VALLE DE UCO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Zuccardi Valle de Uco', 'Serie A Torrontés', 'Cafayate, Salta, Argentina', 'Torrontés', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-region/
  ('Zuccardi Valle de Uco', 'Serie A Chardonnay', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay, Viognier', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-region/
  ('Zuccardi Valle de Uco', 'Serie A Bonarda', 'Mendoza, Argentina', 'Bonarda', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-region/
  ('Zuccardi Valle de Uco', 'Serie A Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-region/
  ('Zuccardi Valle de Uco', 'Q Chardonnay', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-region/
  ('Zuccardi Valle de Uco', 'Q Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-region/
  ('Zuccardi Valle de Uco', 'Q Cabernet Franc', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-region/
  ('Zuccardi Valle de Uco', 'Q Cabernet Sauvignon', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-region/
  ('Zuccardi Valle de Uco', 'Q Tempranillo', 'Mendoza, Argentina', 'Tempranillo', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-region/
  ('Zuccardi Valle de Uco', 'Emma Bonarda', 'Valle de Uco, Mendoza, Argentina', 'Bonarda', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-viticultor/
  ('Zuccardi Valle de Uco', 'Tito Zuccardi', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Cabernet Franc', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-viticultor/
  ('Zuccardi Valle de Uco', 'The Amphora Project', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-viticultor/
  ('Zuccardi Valle de Uco', 'Concreto', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-viticultor/
  ('Zuccardi Valle de Uco', 'José Zuccardi', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Cabernet Sauvignon', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-viticultor/
  ('Zuccardi Valle de Uco', 'Blanc de Blancs', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'Sparkling'),  -- https://zuccardiwines.com/es/vinos/vinos-de-viticultor/
  ('Zuccardi Valle de Uco', 'Finca Las Cuchillas', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-finca/
  ('Zuccardi Valle de Uco', 'Finca Los Membrillos Semillon', 'Valle de Uco, Mendoza, Argentina', 'Semillon', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-finca/
  ('Zuccardi Valle de Uco', 'Finca Canal Uco', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-finca/
  ('Zuccardi Valle de Uco', 'Finca Piedra Infinita', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-finca/
  ('Zuccardi Valle de Uco', 'Finca Las Cerrilladas', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-finca/
  ('Zuccardi Valle de Uco', 'Finca Los Membrillos Cabernet Sauvignon', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-finca/
  ('Zuccardi Valle de Uco', 'Fósil', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-paraje/
  ('Zuccardi Valle de Uco', 'Botánico', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-paraje/
  ('Zuccardi Valle de Uco', 'Aluvional Los Chacayes', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-paraje/
  ('Zuccardi Valle de Uco', 'Aluvional Paraje Altamira', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-paraje/
  ('Zuccardi Valle de Uco', 'Aluvional Gualtallary', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-paraje/
  ('Zuccardi Valle de Uco', 'Aluvional San Pablo', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-paraje/
  ('Zuccardi Valle de Uco', 'Polígonos Vista Flores Chenin Blanc', 'Valle de Uco, Mendoza, Argentina', 'Chenin Blanc', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos Tupungato Semillon', 'Valle de Uco, Mendoza, Argentina', 'Semillon', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos San Pablo Verdejo', 'Valle de Uco, Mendoza, Argentina', 'Verdejo', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos San Pablo Albariño', 'Valle de Uco, Mendoza, Argentina', 'Albariño', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos San Pablo Riesling', 'Valle de Uco, Mendoza, Argentina', 'Riesling', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos Tupungato Sauvignon Blanc', 'Valle de Uco, Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos San Pablo Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos San Pablo Cabernet Franc', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos Paraje Altamira Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos Paraje Altamira Cabernet Franc', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos Gualtallary Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Polígonos Gualtallary Cabernet Franc', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-pueblo/
  ('Zuccardi Valle de Uco', 'Finca Piedra Infinita Supercal', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://zuccardiwines.com/es/vinos/vinos-de-parcela/
  ('Zuccardi Valle de Uco', 'Finca Piedra Infinita Gravascal', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red')  -- https://zuccardiwines.com/es/vinos/vinos-de-parcela/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SANTA JULIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Santa Julia', 'Rosé', 'Mendoza, Argentina', null, 'Rosé'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Pinot Grigio', 'Mendoza, Argentina', 'Pinot Grigio', 'White'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Torrontés', 'Mendoza, Argentina', 'Torrontés', 'White'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Flores Negras Garnacha', 'Mendoza, Argentina', 'Garnacha', 'Red'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Flores Negras Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Textual Carmenere', 'Mendoza, Argentina', 'Carmenere', 'Red'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Textual Albariño', 'Mendoza, Argentina', 'Albariño', 'White'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Textual Teróldego', 'Mendoza, Argentina', 'Teroldego', 'Red'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Textual Caladoc', 'Mendoza, Argentina', 'Caladoc', 'Red'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Orgánica Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Orgánica Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Julia Dulce Blanco', 'Mendoza, Argentina', null, 'Sweet'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Julia Dulce Rosado', 'Mendoza, Argentina', null, 'Sweet'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Extra Brut', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Dulce Burbujas', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'La Mantis Pet-Nat', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'El Zorrito Naranjo', 'Mendoza, Argentina', null, 'Orange'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Tardío', 'Mendoza, Argentina', null, 'Sweet'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Chenin Dulce Natural', 'Mendoza, Argentina', 'Chenin', 'Sweet'),  -- https://santajulia.com.ar/
  ('Santa Julia', 'Dulce Tinto', 'Mendoza, Argentina', null, 'Sweet')  -- https://santajulia.com.ar/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TRAPICHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Trapiche', 'Costa y Pampa Extra Brut', 'Chapadmalal, Buenos Aires, Argentina', null, 'Sparkling'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Costa y Pampa Brut Rosé', 'Chapadmalal, Buenos Aires, Argentina', null, 'Sparkling'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Fond de Cave Reserva Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Costa y Pampa Sauvignon Blanc', 'Chapadmalal, Buenos Aires, Argentina', 'Sauvignon Blanc', 'White'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Costa y Pampa Albariño', 'Chapadmalal, Buenos Aires, Argentina', 'Albariño', 'White'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Lateral Chenin', 'Mendoza, Argentina', 'Chenin', 'White'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Lateral Semillón Ánfora', 'Valle de Uco, Mendoza, Argentina', 'Semillón', 'White'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Costa y Pampa Riesling', 'Chapadmalal, Buenos Aires, Argentina', 'Riesling', 'White'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Medalla Chardonnay', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Gran Medalla Chardonnay', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Puro Rosé', 'Valle de Uco, Mendoza, Argentina', 'Syrah, Sangiovese', 'Rosé'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Costa y Pampa Pinot Noir', 'Chapadmalal, Buenos Aires, Argentina', 'Pinot Noir', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Gran Medalla Pinot Noir', 'Valle de Uco, Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Gran Medalla Cabernet Franc', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Exposición Sur Cabernet Sauvignon', 'San Patricio del Chañar, Neuquén, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Medalla Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Fond de Cave Gran Reserva Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Gran Medalla Cabernet Sauvignon', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Exposición Sur Malbec', 'San Patricio del Chañar, Neuquén, Argentina', 'Malbec', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Medalla Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Gran Medalla Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Lateral GSM', 'Mendoza, Argentina', null, 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Fond de Cave Tardive Chardonnay', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'Sweet'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Fond de Cave Encabezado de Malbec', 'Mendoza, Argentina', 'Malbec', 'Fortified'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Terroir Series Finca Las Piedras Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Terroir Series Finca Laborde Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Terroir Series Orellana Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Terroir Series Coletto Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Terroir Series Ambrosia Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Terroir Series El Milagro Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Manos Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Iscay Syrah Viognier', 'Valle de Uco, Mendoza, Argentina', 'Syrah, Viognier', 'Red'),  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
  ('Trapiche', 'Iscay Malbec Cabernet Franc', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Cabernet Franc', 'Red')  -- https://trapiche.com.ar/comin/wp-content/uploads/2025/10/Vinos-Septiembre-25.pdf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NORTON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Norton', 'Gernot', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://norton.com.ar/?p=9563
  ('Norton', 'Quintaesencia Malbec Rosé', 'Mendoza, Argentina', 'Malbec', 'Rosé'),  -- https://www.norton.com.ar/en/our-wines/family-cellar-wines/
  ('Norton', 'Lote Blanco', 'Mendoza, Argentina', 'Grüner Veltliner', 'White'),  -- https://www.norton.com.ar/en/our-wines/family-cellar-wines/
  ('Norton', 'Privada Family Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.norton.com.ar/en/our-wines/family-cellar-wines/
  ('Norton', 'Altura Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.norton.com.ar/en/our-wines/family-cellar-wines/
  ('Norton', 'Altura Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.norton.com.ar/en/our-wines/family-cellar-wines/
  ('Norton', 'Altura Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://www.norton.com.ar/en/our-wines/family-cellar-wines/
  ('Norton', 'Altura White Blend', 'Mendoza, Argentina', null, 'White'),  -- https://www.norton.com.ar/en/our-wines/family-cellar-wines/
  ('Norton', 'Altura Semillón', 'Mendoza, Argentina', 'Semillón', 'White'),  -- https://www.norton.com.ar/en/our-wines/family-cellar-wines/
  ('Norton', 'Reserva Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Reserva Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Reserva Merlot', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Reserva Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Winemaker Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Winemaker Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'D.O.C Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Select Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Select Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Select Merlot', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Select Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Select Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Colección de los Andes Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Colección de los Andes Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Colección de los Andes Merlot', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Colección de los Andes Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Colección de los Andes Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Colección de los Andes Torrontés', 'Mendoza, Argentina', 'Torrontés', 'White'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Colección de los Andes Rosado', 'Mendoza, Argentina', null, 'Rosé'),  -- https://www.norton.com.ar/en/our-wines/estate-wines-2/
  ('Norton', 'Extra Brut', 'Mendoza, Argentina', 'Chardonnay', 'Sparkling'),  -- https://www.norton.com.ar/en/our-wines/sparklings-3/
  ('Norton', 'Brut Nature', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://www.norton.com.ar/en/our-wines/sparklings-3/
  ('Norton', 'Brut Rosé', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://www.norton.com.ar/en/our-wines/sparklings-3/
  ('Norton', 'Grüner Veltliner', 'Mendoza, Argentina', 'Grüner Veltliner', 'Sparkling')  -- https://www.norton.com.ar/en/our-wines/sparklings-3/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGA EL ESTECO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Bodega El Esteco', 'Torrontés Tardío', 'Cafayate, Salta, Argentina', 'Torrontés', 'Sweet'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Cabernet Sauvignon', 'Cafayate, Salta, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Malbec', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Reserva Sauvignon Blanc', 'Cafayate, Salta, Argentina', 'Sauvignon Blanc', 'White'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Reserva Cabernet Sauvignon', 'Cafayate, Salta, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Reserva Malbec Tannat', 'Cafayate, Salta, Argentina', 'Malbec, Tannat', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Reserva Malbec', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Pinot Noir', 'Cafayate, Salta, Argentina', 'Pinot Noir', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Cabernet Sauvignon', 'Cafayate, Salta, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Malbec', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Tannat', 'Cafayate, Salta, Argentina', 'Tannat', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Syrah', 'Cafayate, Salta, Argentina', 'Syrah', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Torrontés', 'Cafayate, Salta, Argentina', 'Torrontés', 'White'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Chardonnay', 'Cafayate, Salta, Argentina', 'Chardonnay', 'White'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Don David Extra Brut', 'Cafayate, Salta, Argentina', null, 'Sparkling'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'El Último Tramo Naranjo Torrontés', 'Cafayate, Salta, Argentina', 'Torrontés', 'Orange'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'El Último Tramo Cabernet Sauvignon', 'Cafayate, Salta, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'El Último Tramo Malbec', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Partida Limitada Garnacha', 'Cafayate, Salta, Argentina', 'Garnacha', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Partida Limitada Malbec', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Partida Limitada Chardonnay', 'Cafayate, Salta, Argentina', 'Chardonnay', 'White'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Fincas Notables Tannat', 'Cafayate, Salta, Argentina', 'Tannat', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Fincas Notables Cabernet Franc', 'Cafayate, Salta, Argentina', 'Cabernet Franc', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Fincas Notables Cabernet Sauvignon', 'Cafayate, Salta, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Fincas Notables Malbec', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Fincas Notables Merlot', 'Cafayate, Salta, Argentina', 'Merlot', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Blend de Extremos Malbec Merlot', 'Cafayate, Salta, Argentina', 'Malbec, Merlot', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Blend de Extremos Cabernet Sauvignon', 'Cafayate, Salta, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Blend de Extremos Torrontés', 'Cafayate, Salta, Argentina', 'Torrontés', 'White'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Blend de Extremos Malbec', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Old Vines Torrontés', 'Cafayate, Salta, Argentina', 'Torrontés', 'White'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Old Vines Malbec', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://elesteco.com.ar/en/wines
  ('Bodega El Esteco', 'Old Vines Cabernet Sauvignon', 'Cafayate, Salta, Argentina', 'Cabernet Sauvignon', 'Red')  -- https://elesteco.com.ar/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MICHEL TORINO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Michel Torino', 'Malbec', 'Calchaquí Valley, Salta, Argentina', 'Malbec', 'Red')  -- https://frederickwildman.com/producers/michel-torino/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TERRAZAS DE LOS ANDES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Terrazas de los Andes', 'Reserva Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.terrazasdelosandes.com/en/wines
  ('Terrazas de los Andes', 'Reserva Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.terrazasdelosandes.com/en/wines
  ('Terrazas de los Andes', 'Reserva Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.terrazasdelosandes.com/en/wines
  ('Terrazas de los Andes', 'Grand Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.terrazasdelosandes.com/en/wines
  ('Terrazas de los Andes', 'Grand Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.terrazasdelosandes.com/en/wines
  ('Terrazas de los Andes', 'Grand Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.terrazasdelosandes.com/en/wines
  ('Terrazas de los Andes', 'Parcel Los Castaños Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.terrazasdelosandes.com/en/wines
  ('Terrazas de los Andes', 'Parcel Los Cerezos Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.terrazasdelosandes.com/en/wines
  ('Terrazas de los Andes', 'Parcel Licán Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.terrazasdelosandes.com/en/wines
  ('Terrazas de los Andes', 'Extremo Malbec', 'Mendoza, Argentina', 'Malbec', 'Red')  -- https://www.terrazasdelosandes.com/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHEVAL DES ANDES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Cheval des Andes', null, 'Mendoza, Argentina', 'Malbec, Cabernet Sauvignon, Petit Verdot', 'Red')  -- https://chateau-cheval-blanc.com/en/cheval-des-andes
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KAIKEN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Kaiken', 'Disobedience by Francis Mallmann', 'Mendoza, Argentina', 'Malbec, Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Mai Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Método Tradicional Brut', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay, Pinot Noir', 'Sparkling'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Ultra Merlot', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Ultra Cabernet Sauvignon', 'Luján de Cuyo, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Ultra Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Ultra Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Terroir Series Torrontés', 'Cafayate, Salta, Argentina', 'Torrontés', 'White'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Terroir Series Cabernet Sauvignon Malbec Petit Verdot', 'Argentina', 'Cabernet Sauvignon, Malbec, Petit Verdot', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Terroir Series Malbec Bonarda Petit Verdot', 'Argentina', 'Malbec, Bonarda, Petit Verdot', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Aventura Los Chacayes Norte Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Aventura Los Chacayes Sur Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
  ('Kaiken', 'Aventura Valle de Canota Malbec', 'Mendoza, Argentina', 'Malbec', 'Red')  -- https://www.libertywines.co.uk/our-producers/GKA02AR-kaiken-ultra
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COLOMÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Colomé', 'Altura Máxima Malbec', 'Salta, Argentina', 'Malbec', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Altura Máxima Pinot Noir', 'Salta, Argentina', 'Pinot Noir', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Altura Máxima Sauvignon Blanc', 'Salta, Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', '1831 Cabernet Sauvignon', 'Salta, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', '1831 Malbec', 'Salta, Argentina', 'Malbec', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'El Arenal Malbec', 'Salta, Argentina', 'Malbec', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'El Camino Tannat', 'Salta, Argentina', 'Tannat', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Auténtico Malbec', 'Salta, Argentina', 'Malbec', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Estate Malbec', 'Salta, Argentina', 'Malbec', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Torrontés', 'Salta, Argentina', 'Torrontés', 'White'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Lote Especial La Brava Malbec', 'Salta, Argentina', 'Malbec', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Lote Especial Tannat', 'Salta, Argentina', 'Tannat', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Lote Especial Bonarda', 'Salta, Argentina', 'Bonarda', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Lote Especial Syrah', 'Salta, Argentina', 'Syrah', 'Red'),  -- https://www.bodegacolome.com/en/wines/
  ('Colomé', 'Pinot Noir', 'Salta, Argentina', 'Pinot Noir', 'Red'),  -- https://www.libertywines.co.uk/our-portfolio/BC206-autentico-salta-malbec
  ('Colomé', 'Finca Colomé Bonarda', 'Salta, Argentina', 'Bonarda', 'Red')  -- https://www.libertywines.co.uk/our-portfolio/BC206-autentico-salta-malbec
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGAS SALENTEIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Bodegas Salentein', 'Portillo Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://palmbay.com/wines/portillo-wines
  ('Bodegas Salentein', 'Portillo Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://palmbay.com/wines/portillo-wines
  ('Bodegas Salentein', 'Portillo Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://palmbay.com/wines/portillo-wines
  ('Bodegas Salentein', 'Portillo Merlot', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://palmbay.com/wines/portillo-wines
  ('Bodegas Salentein', 'Portillo Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://palmbay.com/wines/portillo-wines
  ('Bodegas Salentein', 'Portillo Rosé', 'Mendoza, Argentina', null, 'Rosé'),  -- https://palmbay.com/wines/portillo-wines
  ('Bodegas Salentein', 'Portillo Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://palmbay.com/wines/portillo-wines
  ('Bodegas Salentein', 'Reserve Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'El Tomillo Single Vineyard Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Gran Vu Blend', 'Mendoza, Argentina', null, 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Los Cerezos Single Vineyard Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Los Jabalies Single Vineyard Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Numina Gran Corte', 'Valle de Uco, Mendoza, Argentina', null, 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Numina Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Pr1mum Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Pr1mum Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Reserve Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Reserve Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Reserve Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Reserve Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
  ('Bodegas Salentein', 'Single Vineyard Malbec La Pampa Estate', 'Mendoza, Argentina', 'Malbec', 'Red')  -- https://www.palmbay.com/wines/bodegas-salentein/reserve-malbec/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DE LOS SIETE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Clos de los Siete', null, 'Valle de Uco, Mendoza, Argentina', 'Malbec, Merlot, Cabernet Sauvignon, Syrah, Petit Verdot, Cabernet Franc', 'Red')  -- https://www.closdelossiete.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGA DIAMANDES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Bodega DiamAndes', 'Gran Reserva Malbec Cabernet Sauvignon', 'Mendoza, Argentina', 'Malbec, Cabernet Sauvignon', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/diamandes/1546
  ('Bodega DiamAndes', 'Perlita Malbec Syrah', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Syrah', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/diamandes/1546
  ('Bodega DiamAndes', 'Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/diamandes/1546
  ('Bodega DiamAndes', 'De Uco Chardonnay', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.nataliemaclean.com/wineries/info/diamandes/1546
  ('Bodega DiamAndes', 'Perlita Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White')  -- https://www.nataliemaclean.com/wineries/info/diamandes/1546
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CUVELIER LOS ANDES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Cuvelier Los Andes', 'Colección', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Merlot, Cabernet Sauvignon, Syrah, Petit Verdot', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/cuvelier-los-andes/1545
  ('Cuvelier Los Andes', 'Grand Vin', 'Mendoza, Argentina', 'Malbec, Merlot, Cabernet Sauvignon, Syrah', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/cuvelier-los-andes/1545
  ('Cuvelier Los Andes', 'Grand Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/cuvelier-los-andes/1545
  ('Cuvelier Los Andes', 'Colección Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red')  -- https://www.nataliemaclean.com/wineries/info/cuvelier-los-andes/1545
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LUIGI BOSCA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Luigi Bosca', 'Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://nataliemaclean.com/wineries/info/luigi-bosca/511
  ('Luigi Bosca', 'Reserva El Paraíso Vineyard Pinot Noir', 'Maipú, Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://nataliemaclean.com/wineries/info/luigi-bosca/511
  ('Luigi Bosca', 'Reserva Cabernet Sauvignon', 'Maipú, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://nataliemaclean.com/wineries/info/luigi-bosca/511
  ('Luigi Bosca', 'Single Vineyard Malbec', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://nataliemaclean.com/wineries/info/luigi-bosca/511
  ('Luigi Bosca', 'Reserva Syrah', 'Maipú, Mendoza, Argentina', 'Syrah', 'Red'),  -- https://nataliemaclean.com/wineries/info/luigi-bosca/511
  ('Luigi Bosca', 'Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://nataliemaclean.com/wineries/info/luigi-bosca/511
  ('Luigi Bosca', 'Reserva Chardonnay', 'Luján de Cuyo, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://nataliemaclean.com/wineries/info/luigi-bosca/511
  ('Luigi Bosca', 'La Linda Torrontés', 'Mendoza, Argentina', 'Torrontés', 'White'),  -- https://wineindustryadvisor.com/2023/01/30/argentinas-renowned-bodega-luigi-bosca-brings-unique-la-linda-brand-us
  ('Luigi Bosca', 'La Linda Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://wineindustryadvisor.com/2023/01/30/argentinas-renowned-bodega-luigi-bosca-brings-unique-la-linda-brand-us
  ('Luigi Bosca', 'La Linda Red Blend', 'Mendoza, Argentina', null, 'Red'),  -- https://wineindustryadvisor.com/2023/01/30/argentinas-renowned-bodega-luigi-bosca-brings-unique-la-linda-brand-us
  ('Luigi Bosca', 'La Linda Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White')  -- https://wineindustryadvisor.com/2023/01/30/argentinas-renowned-bodega-luigi-bosca-brings-unique-la-linda-brand-us
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MONTEVIEJO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Monteviejo', 'Lindaflor Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.nataliemaclean.com/wineries/info/lindaflor/1548
  ('Monteviejo', 'Lindaflor Petite Fleur Malbec Cabernet Sauvignon', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Cabernet Sauvignon', 'Red')  -- https://www.nataliemaclean.com/wineries/info/lindaflor/1548
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- AMALAYA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Amalaya', 'Torrontés Riesling', 'Salta, Argentina', 'Torrontés, Riesling', 'White'),  -- https://www.libertywines.co.uk/our-producers/GAM03AR-amalaya
  ('Amalaya', 'Malbec', 'Salta, Argentina', 'Malbec', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GAM03AR-amalaya
  ('Amalaya', 'Gran Corte', 'Salta, Argentina', 'Malbec, Cabernet Franc, Tannat', 'Red')  -- https://www.libertywines.co.uk/our-producers/GAM03AR-amalaya
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGA ROLLAND ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Bodega Rolland', 'Mariflor Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://8wines.com/wines/michel-rolland-mariflor-cabernet-franc-2019?cur=pln
  ('Bodega Rolland', 'Mariflor Val de Flores Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://8wines.com/wines/michel-rolland-mariflor-cabernet-franc-2019?cur=pln
  ('Bodega Rolland', 'Mariflor Malbec', 'Mendoza, Argentina', 'Malbec', 'Red')  -- https://8wines.com/wines/michel-rolland-mariflor-cabernet-franc-2019?cur=pln
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MENDEL WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Mendel Wines', 'Malbec DOC', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Finca Remota Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Unus', 'Mendoza, Argentina', 'Cabernet Sauvignon, Malbec', 'Red'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Cabernet Franc', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Semillon', 'Valle de Uco, Mendoza, Argentina', 'Semillon', 'White'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Rosadia', 'Valle de Uco, Mendoza, Argentina', 'Pinot Noir, Cabernet Franc, Merlot', 'Rosé'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Petit Manseng Cosecha Tardía', 'Valle de Uco, Mendoza, Argentina', 'Petit Manseng', 'Sweet'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Lunta Malbec', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.mendel.com.ar/
  ('Mendel Wines', 'Lunta Torrontés', 'Cafayate, Salta, Argentina', 'Torrontés', 'White')  -- https://www.mendel.com.ar/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOÑA PAULA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Doña Paula', 'Selección de Bodega Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://donapaula.com/wines/
  ('Doña Paula', '1100', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Syrah', 'Red'),  -- https://donapaula.com/wine/dona-paula-1100/
  ('Doña Paula', 'Sauvage Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'Sparkling'),  -- https://donapaula.com/wines/
  ('Doña Paula', 'Single Vineyard Malbec DOC El Alto', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Single Vineyard Malbec Gualtallary', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Single Vineyard Cabernet Sauvignon El Alto', 'Luján de Cuyo, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Single Vineyard Pinot Noir Gualtallary', 'Valle de Uco, Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Single Vineyard Syrah El Cepillo', 'Valle de Uco, Mendoza, Argentina', 'Syrah', 'Red'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Single Vineyard Sauvignon Blanc Gualtallary', 'Valle de Uco, Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Single Vineyard Chardonnay Gualtallary', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Single Vineyard Riesling Gualtallary', 'Valle de Uco, Mendoza, Argentina', 'Riesling', 'White'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Estate Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Estate Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Estate Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Estate Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://donapaula.com/wine/dona-paula-estate-malbec/
  ('Doña Paula', 'Paula Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://donapaula.com/wine/paula-malbec/
  ('Doña Paula', 'Paula Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://donapaula.com/wine/paula-malbec/
  ('Doña Paula', 'Paula Red Blend', 'Mendoza, Argentina', null, 'Red'),  -- https://donapaula.com/wine/paula-malbec/
  ('Doña Paula', 'Paula Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://donapaula.com/wine/paula-malbec/
  ('Doña Paula', 'Paula Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White')  -- https://donapaula.com/wine/paula-malbec/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALTOS LAS HORMIGAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Altos Las Hormigas', 'Malbec Clásico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://altoslashormigas.com/altos-las-hormigas/
  ('Altos Las Hormigas', 'Malbec Clásico Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://altoslashormigas.com/altos-las-hormigas/
  ('Altos Las Hormigas', 'The Malbec Specialist de la Finca', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://altoslashormigas.com/altos-las-hormigas/
  ('Altos Las Hormigas', 'Tinto', 'Mendoza, Argentina', null, 'Red'),  -- https://altoslashormigas.com/altos-las-hormigas/
  ('Altos Las Hormigas', 'Blanco', 'Valle de Uco, Mendoza, Argentina', null, 'White'),  -- https://altoslashormigas.com/altos-las-hormigas/
  ('Altos Las Hormigas', 'Como una Liebre en Marzo', 'Valle de Uco, Mendoza, Argentina', null, 'Sparkling'),  -- https://altoslashormigas.com/colonia-las-liebres/
  ('Altos Las Hormigas', 'Colonia Las Liebres Brusca', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://altoslashormigas.com/colonia-las-liebres/
  ('Altos Las Hormigas', 'Colonia Las Liebres Cabernet Franc', 'Luján de Cuyo, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://altoslashormigas.com/colonia-las-liebres/
  ('Altos Las Hormigas', 'Colonia Las Liebres Malbec', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://altoslashormigas.com/colonia-las-liebres/
  ('Altos Las Hormigas', 'Colonia Las Liebres Bonarda', 'Luján de Cuyo, Mendoza, Argentina', 'Bonarda', 'Red'),  -- https://altoslashormigas.com/colonia-las-liebres/
  ('Altos Las Hormigas', 'La Danza Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://altoslashormigas.com/la-danza/
  ('Altos Las Hormigas', 'La Danza Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red')  -- https://altoslashormigas.com/la-danza/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGA PIATTELLI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Bodega Piattelli', 'Trinità', 'Mendoza, Argentina', 'Malbec, Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.piattellivineyards.com/vinosmendoza
  ('Bodega Piattelli', 'Single Vineyard El Manzano Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.piattellivineyards.com/vinosmendoza
  ('Bodega Piattelli', 'Single Vineyard El Manzano Cabernet Sauvignon', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.piattellivineyards.com/vinosmendoza
  ('Bodega Piattelli', 'Single Vineyard El Manzano Chardonnay', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.piattellivineyards.com/vinosmendoza
  ('Bodega Piattelli', 'Premium Reserve Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.piattellivineyards.com/vinosmendoza
  ('Bodega Piattelli', 'Premium Reserve Cabernet Sauvignon', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.piattellivineyards.com/vinosmendoza
  ('Bodega Piattelli', 'Premium Reserve Rosé', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec, Torrontés', 'Rosé'),  -- https://www.piattellivineyards.com/vinosmendoza
  ('Bodega Piattelli', 'Arlene Series Icon Blend', 'Salta, Argentina', 'Malbec, Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.piattellivineyards.com/vinoscafayate
  ('Bodega Piattelli', 'Single Vineyard La Calera Malbec', 'Salta, Argentina', 'Malbec', 'Red'),  -- https://www.piattellivineyards.com/vinoscafayate
  ('Bodega Piattelli', 'Single Vineyard La Calera Cabernet Sauvignon', 'Salta, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.piattellivineyards.com/vinoscafayate
  ('Bodega Piattelli', 'Reserva Torrontés', 'Cafayate, Salta, Argentina', 'Torrontés', 'White'),  -- https://www.piattellivineyards.com/vinoscafayate
  ('Bodega Piattelli', 'Reserva Malbec', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://www.piattellivineyards.com/vinoscafayate
  ('Bodega Piattelli', 'Reserva Cabernet Sauvignon', 'Cafayate, Salta, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.piattellivineyards.com/vinoscafayate
  ('Bodega Piattelli', 'Reserva Malbec Tannat', 'Cafayate, Salta, Argentina', 'Malbec, Tannat', 'Red')  -- https://www.piattellivineyards.com/vinoscafayate
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FINCA DECERO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Finca Decero', 'Mini Ediciones Petit Verdot', 'Mendoza, Argentina', 'Petit Verdot', 'Red'),  -- http://fincadecero.com/
  ('Finca Decero', 'Mini Ediciones Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- http://fincadecero.com/
  ('Finca Decero', 'Mini Ediciones Tannat', 'Mendoza, Argentina', 'Tannat', 'Red'),  -- http://fincadecero.com/
  ('Finca Decero', 'Mini Ediciones Rosé', 'Mendoza, Argentina', null, 'Rosé'),  -- http://fincadecero.com/
  ('Finca Decero', 'Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- http://fincadecero.com/
  ('Finca Decero', 'Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- http://fincadecero.com/
  ('Finca Decero', 'Syrah', 'Mendoza, Argentina', 'Syrah', 'Red'),  -- http://fincadecero.com/
  ('Finca Decero', 'Red Blend', 'Mendoza, Argentina', null, 'Red'),  -- http://fincadecero.com/
  ('Finca Decero', 'Rosé', 'Mendoza, Argentina', null, 'Rosé'),  -- http://fincadecero.com/
  ('Finca Decero', 'Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- http://fincadecero.com/
  ('Finca Decero', 'The Owl & The Dust Devil Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- http://fincadecero.com/
  ('Finca Decero', 'The Owl & The Dust Devil Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red')  -- http://fincadecero.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHAKANA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Chakana', 'Nuna Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://chakanawines.com.ar/productos/
  ('Chakana', 'Nuna Rosé', 'Luján de Cuyo, Mendoza, Argentina', null, 'Rosé'),  -- https://chakanawines.com.ar/productos/
  ('Chakana', 'Nuna White Blend', 'Mendoza, Argentina', null, 'White'),  -- https://chakanawines.com.ar/productos/
  ('Chakana', 'Nuna Espumante', 'Luján de Cuyo, Mendoza, Argentina', 'Chardonnay, Sauvignon Blanc', 'Sparkling'),  -- https://chakanawines.com.ar/productos/
  ('Chakana', 'Nuna Red Blend', 'Mendoza, Argentina', 'Tannat, Cabernet Franc, Petit Verdot, Syrah, Cabernet Sauvignon', 'Red'),  -- https://chakanawines.com.ar/productos/
  ('Chakana', 'Nuna Syrah', 'Mendoza, Argentina', 'Syrah', 'Red'),  -- https://chakanawines.com.ar/productos/
  ('Chakana', 'Estate Selection Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://chakanawines.com.ar/productos/
  ('Chakana', 'Estate Selection Cabernet Sauvignon', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.chakanawines.com.ar/
  ('Chakana', 'Ayni Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.chakanawines.com.ar/
  ('Chakana', 'Finca Los Cedros Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red')  -- https://www.chakanawines.com.ar/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BOUSQUET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Domaine Bousquet', 'Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Chardonnay Orgánico', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Reserve Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Reserve Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Reserve Pinot Noir Orgánico', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Reserve Chardonnay Orgánico', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Premium Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Premium Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Premium Chardonnay Orgánico', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Premium Sauvignon Blanc Orgánico', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Premium Rosé Orgánico', 'Mendoza, Argentina', null, 'Rosé'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Brut Rosé Tradicional Orgánico', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Brut Charmat Orgánico', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Brut Rosé Charmat Orgánico', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Brut Tradicional Orgánico', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Ameri Wild Roots Block 1 Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Ameri Wild Roots Block 3 Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Ameri Wild Roots Block 4 Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Ameri Wild Roots Block 9 Cabernet Franc Orgánico', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Ameri Eva Estate Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Ameri Eva Estate Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Ameri Eva Estate Red Blend Orgánico', 'Mendoza, Argentina', null, 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Ameri Eva Estate Sauvignon Blanc Orgánico', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Gaia Malbec Orgánico & Biodinámico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Gaia Cabernet Sauvignon Orgánico & Biodinámico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Gaia Cabernet Franc Orgánico & Biodinámico', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Gaia Red Blend Orgánico & Biodinámico', 'Mendoza, Argentina', null, 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Gaia Chardonnay Orgánico & Biodinámico', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Gaia Pinot Noir Rosé Orgánico & Biodinámico', 'Mendoza, Argentina', 'Pinot Noir', 'Rosé'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Virgen Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Virgen Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Virgen Red Blend Orgánico', 'Mendoza, Argentina', null, 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Virgen Chardonnay Orgánico', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Lo Ca Brut Nature Orgánico', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Alavida Kosher Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Alavida Kosher Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Alavida Reserve Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Black Rock Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Black Rock Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Cameleon Premium Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Cameleon Premium Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Cameleon Premium Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Cameleon Premium Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Cameleon Premium Rosé', 'Mendoza, Argentina', null, 'Rosé'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Cameleon Signature Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Cameleon Signature Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Finca Lalande Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Finca Lalande Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Finca Lalande Chardonnay Orgánico', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Hunuc Premium Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Hunuc Premium Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Natural Origins Malbec Orgánico', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Natural Origins Cabernet Sauvignon Orgánico', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Natural Origins Chardonnay Orgánico', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Natural Origins Rosé Orgánico', 'Mendoza, Argentina', null, 'Rosé'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Natural Origins Sauvignon Blanc Orgánico', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Lo Ca Malbec Orgánico', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://domainebousquet.com/
  ('Domaine Bousquet', 'Lo Ca Chardonnay Orgánico', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White')  -- https://domainebousquet.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DURIGUTTI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Durigutti', 'Proyecto Las Compuertas Malbec 1914', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://8wines.com/wines/durigutti-proyecto-las-compuertas-malbec-1914-2021
  ('Durigutti', 'Proyecto Las Compuertas Cinco Suelos Malbec', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red')  -- https://8wines.com/wines/durigutti-proyecto-las-compuertas-malbec-1914-2021
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CRIOS DE SUSANA BALBO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Crios de Susana Balbo', 'Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.bauraulacvins.ch/en/susana-balbo-wines-_content---1--939--11041718.html
  ('Crios de Susana Balbo', 'Cabernet Franc', 'Argentina', 'Cabernet Franc', 'Red'),  -- https://candcgroupplc.com/?p=10478
  ('Crios de Susana Balbo', 'Cabernet Sauvignon', 'Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://candcgroupplc.com/?p=10478
  ('Crios de Susana Balbo', 'Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bauraulacvins.ch/en/susana-balbo-wines-_content---1--939--11041718.html
  ('Crios de Susana Balbo', 'Rosé of Malbec', 'Argentina', 'Malbec', 'Rosé'),  -- https://candcgroupplc.com/?p=10478
  ('Crios de Susana Balbo', 'Torrontés', 'Salta, Argentina', 'Torrontés', 'White')  -- https://www.bauraulacvins.ch/en/susana-balbo-wines-_content---1--939--11041718.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SUSANA BALBO WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Susana Balbo Wines', 'Signature Rosé', 'Valle de Uco, Mendoza, Argentina', null, 'Rosé'),  -- https://www.mtouton.com/node/444
  ('Susana Balbo Wines', 'Signature Barrel Fermented Torrontés', 'Valle de Uco, Mendoza, Argentina', 'Torrontés', 'White'),  -- https://www.mtouton.com/node/444
  ('Susana Balbo Wines', 'Signature Late Harvest Torrontés', 'Mendoza, Argentina', 'Torrontés', 'Sweet'),  -- https://www.mtouton.com/node/444
  ('Susana Balbo Wines', 'Signature Late Harvest Malbec', 'Mendoza, Argentina', 'Malbec', 'Sweet'),  -- https://www.mtouton.com/node/444
  ('Susana Balbo Wines', 'Signature White Blend', 'Valle de Uco, Mendoza, Argentina', null, 'White'),  -- https://www.mtouton.com/node/444
  ('Susana Balbo Wines', 'Brioso', 'Mendoza, Argentina', null, 'Red'),  -- https://www.mtouton.com/node/444
  ('Susana Balbo Wines', 'Signature Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.mtouton.com/node/444
  ('Susana Balbo Wines', 'Signature Cabernet Sauvignon', 'Valle de Uco, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.mtouton.com/node/444
  ('Susana Balbo Wines', 'Signature Limited Edition Blanco', 'Argentina', null, 'White'),  -- https://candcgroupplc.com/?p=10478
  ('Susana Balbo Wines', 'Signature Limited Edition Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://candcgroupplc.com/?p=10478
  ('Susana Balbo Wines', 'Signature Limited Edition Cabernet Sauvignon', 'Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://candcgroupplc.com/?p=10478
  ('Susana Balbo Wines', 'BenMarco Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://candcgroupplc.com/?p=10478
  ('Susana Balbo Wines', 'BenMarco Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.bauraulacvins.ch/en/susana-balbo-wines-_content---1--939--11041718.html
  ('Susana Balbo Wines', 'BenMarco Sin Límites Malbec Gualtallary', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://candcgroupplc.com/?p=10478
  ('Susana Balbo Wines', 'Nosotros Single Vineyard Nómade Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://candcgroupplc.com/?p=10478
  ('Susana Balbo Wines', 'Nosotros Cabernet Sauvignon Library Edition 25th Anniversary', 'Argentina', 'Cabernet Sauvignon', 'Red')  -- https://candcgroupplc.com/?p=10478
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAGARDE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Lagarde', 'Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://lagarde.com.ar/lagarde/
  ('Lagarde', 'Blend de Tintas', 'Mendoza, Argentina', null, 'Red'),  -- https://lagarde.com.ar/lagarde/
  ('Lagarde', 'Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://lagarde.com.ar/lagarde/
  ('Lagarde', 'Merlot', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://lagarde.com.ar/lagarde/
  ('Lagarde', 'Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://lagarde.com.ar/lagarde/
  ('Lagarde', 'Viognier', 'Mendoza, Argentina', 'Viognier', 'White'),  -- https://lagarde.com.ar/lagarde/
  ('Lagarde', 'Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://lagarde.com.ar/lagarde/
  ('Lagarde', 'Goes Pink Rosé', 'Mendoza, Argentina', 'Malbec, Pinot Noir', 'Rosé'),  -- https://lagarde.com.ar/lagarde/
  ('Lagarde', 'Guarda Chardonnay Gualtallary', 'Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://lagarde.com.ar/guarda/
  ('Lagarde', 'Guarda Malbec Luján de Cuyo', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://lagarde.com.ar/guarda/
  ('Lagarde', 'Guarda Cabernet Franc Luján de Cuyo', 'Luján de Cuyo, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://lagarde.com.ar/guarda/
  ('Lagarde', 'Primeras Viñas Malbec D.O.C.', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://lagarde.com.ar/primeras-vinas/
  ('Lagarde', 'Primeras Viñas Malbec Luján de Cuyo', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://lagarde.com.ar/primeras-vinas/
  ('Lagarde', 'Primeras Viñas Malbec Gualtallary', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://lagarde.com.ar/primeras-vinas/
  ('Lagarde', 'Primeras Viñas Cabernet Sauvignon Perdriel', 'Luján de Cuyo, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://lagarde.com.ar/primeras-vinas/
  ('Lagarde', 'Blanc de Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Sparkling'),  -- https://lagarde.com.ar/espumantes/
  ('Lagarde', 'Champenoise Extra Brut', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://lagarde.com.ar/espumantes/
  ('Lagarde', 'Lungo', 'Mendoza, Argentina', 'Pinot Noir, Chardonnay, Semillón', 'Sparkling'),  -- https://lagarde.com.ar/espumantes/
  ('Lagarde', 'Dolce', 'Mendoza, Argentina', 'Moscato Bianco', 'Sparkling'),  -- https://lagarde.com.ar/espumantes/
  ('Lagarde', 'Henry Pure Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://lagarde.com.ar/henry/
  ('Lagarde', 'Henry Pure Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://lagarde.com.ar/henry/
  ('Lagarde', 'Henry Gran Guarda Cosecha Tardía', 'Mendoza, Argentina', null, 'Sweet'),  -- https://lagarde.com.ar/henry/
  ('Lagarde', 'Organic Malbec', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://lagarde.com.ar/organic/
  ('Lagarde', 'Organic Rosé', 'Luján de Cuyo, Mendoza, Argentina', null, 'Rosé'),  -- https://lagarde.com.ar/organic/
  ('Lagarde', 'Proyecto Hermanas Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://lagarde.com.ar/proyecto-hermanas/
  ('Lagarde', 'Proyecto Hermanas Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://lagarde.com.ar/proyecto-hermanas/
  ('Lagarde', 'Proyecto Hermanas Viognier', 'Mendoza, Argentina', 'Viognier', 'White'),  -- https://lagarde.com.ar/proyecto-hermanas/
  ('Lagarde', 'Proyecto Hermanas White Blend', 'Mendoza, Argentina', null, 'White'),  -- https://lagarde.com.ar/proyecto-hermanas/
  ('Lagarde', 'Proyecto Hermanas Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://lagarde.com.ar/proyecto-hermanas/
  ('Lagarde', 'Proyecto Hermanas Malbec Cabernet Franc', 'Mendoza, Argentina', 'Malbec, Cabernet Franc', 'Red'),  -- https://lagarde.com.ar/proyecto-hermanas/
  ('Lagarde', 'Teia Malbec & Petit Verdot', 'Mendoza, Argentina', 'Malbec, Petit Verdot', 'Red'),  -- https://lagarde.com.ar/teia/
  ('Lagarde', 'Teia Cabernet Sauvignon & Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://lagarde.com.ar/teia/
  ('Lagarde', 'Teia Torrontés', 'Mendoza, Argentina', 'Torrontés', 'White')  -- https://lagarde.com.ar/teia/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ESCORIHUELA GASCÓN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Escorihuela Gascón', 'Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Malbec Cabernet', 'Mendoza, Argentina', 'Malbec, Cabernet', 'Red'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Syrah', 'Mendoza, Argentina', 'Syrah', 'Red'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Sangiovese', 'Mendoza, Argentina', 'Sangiovese', 'Red'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Viognier', 'Mendoza, Argentina', 'Viognier', 'White'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Extra Brut', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Extra Brut Rosé', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://escorihuelagascon.com/escorihuela-gascon/
  ('Escorihuela Gascón', 'Gran Reserva Malbec', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://escorihuelagascon.com/gran-reserva/
  ('Escorihuela Gascón', 'Gran Reserva Cabernet Sauvignon', 'Luján de Cuyo, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://escorihuelagascon.com/gran-reserva/
  ('Escorihuela Gascón', 'Gran Reserva Chardonnay', 'Luján de Cuyo, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://escorihuelagascon.com/gran-reserva/
  ('Escorihuela Gascón', 'Gran Reserva Gran Rosé', 'Luján de Cuyo, Mendoza, Argentina', null, 'Rosé'),  -- https://escorihuelagascon.com/gran-reserva/
  ('Escorihuela Gascón', 'Pequeñas Producciones Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Rosé Extra Brut', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Syrah', 'Mendoza, Argentina', 'Syrah', 'Red'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Semillón', 'Mendoza, Argentina', 'Semillón', 'White'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Late Harvest', 'Mendoza, Argentina', null, 'Sweet'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Pequeñas Producciones Barbera', 'Mendoza, Argentina', 'Barbera', 'Red'),  -- https://escorihuelagascon.com/pequenas-producciones/
  ('Escorihuela Gascón', 'Rosaura Rosé Malbec', 'Mendoza, Argentina', 'Malbec', 'Rosé'),  -- https://escorihuelagascon.com/rosaura/
  ('Escorihuela Gascón', 'Rosaura Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://escorihuelagascon.com/rosaura/
  ('Escorihuela Gascón', 'Rosaura Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://escorihuelagascon.com/rosaura/
  ('Escorihuela Gascón', 'Rosaura Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://escorihuelagascon.com/rosaura/
  ('Escorihuela Gascón', 'The President''s Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://escorihuelagascon.com/the-president/
  ('Escorihuela Gascón', 'DON Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://escorihuelagascon.com/don/
  ('Escorihuela Gascón', 'Organic Vineyard Malbec', 'Mendoza, Argentina', 'Malbec', 'Red')  -- https://escorihuelagascon.com/organic-vineyard/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGA SÉPTIMA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Bodega Séptima', 'Gran Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-gran-malbec/
  ('Bodega Séptima', '10 Barricas Gran Reserva Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/septima-10-barricas-gran-reserva/
  ('Bodega Séptima', '10 Barricas Gran Reserva Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.bodegaseptima.com/septima-10-barricas-gran-reserva/
  ('Bodega Séptima', '10 Barricas Gran Reserva Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.bodegaseptima.com/septima-10-barricas-gran-reserva/
  ('Bodega Séptima', '10 Barricas Gran Reserva Tannat', 'Mendoza, Argentina', 'Tannat', 'Red'),  -- https://www.bodegaseptima.com/septima-10-barricas-gran-reserva/
  ('Bodega Séptima', 'Lote Especial Malbec Lote #9', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-lote-especial/
  ('Bodega Séptima', 'Lote Especial Malbec Lote #10', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-lote-especial/
  ('Bodega Séptima', 'Tierra Agrelo 1050 MSNM Malbec', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-tierra/
  ('Bodega Séptima', 'Tierra Los Chacayes 1200 MSNM Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-tierra/
  ('Bodega Séptima', 'Tierra Gualtallary 1310 MSNM Malbec', 'Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-tierra/
  ('Bodega Séptima', 'Tierra Las Compuertas 1060 MSNM Malbec', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-tierra/
  ('Bodega Séptima', 'Confiado Malbec Ánfora', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/confiado-2/
  ('Bodega Séptima', 'Confiado Petit Verdot-Malbec Alquimista', 'Mendoza, Argentina', 'Petit Verdot, Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/confiado-2/
  ('Bodega Séptima', 'Confiado Malbec-Raboso Veronés', 'Mendoza, Argentina', 'Malbec, Raboso', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/confiado-2/
  ('Bodega Séptima', 'Confiado Malbec Cubano', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/confiado-2/
  ('Bodega Séptima', 'Confiado Ancellotta-Tannat ¡Negre!', 'Mendoza, Argentina', 'Ancellotta, Tannat', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/confiado-2/
  ('Bodega Séptima', 'Confiado Malbec Indígena', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/confiado-2/
  ('Bodega Séptima', 'Confiado Pinot Noir Blanco', 'Mendoza, Argentina', 'Pinot Noir', 'White'),  -- https://www.bodegaseptima.com/nuestros-vinos/confiado-2/
  ('Bodega Séptima', 'Obra Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-obra/
  ('Bodega Séptima', 'Obra Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-obra/
  ('Bodega Séptima', 'Obra Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-obra/
  ('Bodega Séptima', 'Obra Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-obra/
  ('Bodega Séptima', 'Obra Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-obra/
  ('Bodega Séptima', 'Obra Tardío Gewürztraminer', 'Mendoza, Argentina', 'Gewürztraminer', 'Sweet'),  -- https://www.bodegaseptima.com/nuestros-vinos/septima-obra/
  ('Bodega Séptima', 'Emblema Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/emblema-septima/
  ('Bodega Séptima', 'Emblema Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/emblema-septima/
  ('Bodega Séptima', 'Emblema Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.bodegaseptima.com/nuestros-vinos/emblema-septima/
  ('Bodega Séptima', 'Emblema Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://www.bodegaseptima.com/nuestros-vinos/emblema-septima/
  ('Bodega Séptima', 'Emblema Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.bodegaseptima.com/nuestros-vinos/emblema-septima/
  ('Bodega Séptima', 'Emblema Rosado de Malbec', 'Mendoza, Argentina', 'Malbec', 'Rosé'),  -- https://www.bodegaseptima.com/nuestros-vinos/emblema-septima/
  ('Bodega Séptima', 'Emblema Organic Malbec', 'Mendoza, Argentina', 'Malbec', 'Red')  -- https://www.bodegaseptima.com/nuestros-vinos/emblema-septima/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FINCA LAS MORAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Finca Las Moras', 'Cabernet Sauvignon', 'Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Syrah', 'Argentina', 'Syrah', 'Red'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Bonarda', 'Argentina', 'Bonarda', 'Red'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Viognier', 'Argentina', 'Viognier', 'White'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Sauvignon Blanc', 'Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Chardonnay', 'Argentina', 'Chardonnay', 'White'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Pinot Grigio', 'Argentina', 'Pinot Grigio', 'White'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Dulce de Viognier', 'Argentina', 'Viognier', 'Sweet'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Syrah Rosé', 'Argentina', 'Syrah', 'Rosé'),  -- https://www.fincalasmoras.com/en/varietales/
  ('Finca Las Moras', 'Reserve Cabernet Syrah', 'Argentina', 'Cabernet, Syrah', 'Red'),  -- https://www.fincalasmoras.com/en/reserva/
  ('Finca Las Moras', 'Reserve Chardonnay', 'Argentina', 'Chardonnay', 'White'),  -- https://www.fincalasmoras.com/en/reserva/
  ('Finca Las Moras', 'Reserve Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://www.fincalasmoras.com/en/reserva/
  ('Finca Las Moras', 'Reserve Cabernet Sauvignon', 'Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.fincalasmoras.com/en/reserva/
  ('Finca Las Moras', 'Reserve Tannat', 'Argentina', 'Tannat', 'Red'),  -- https://www.fincalasmoras.com/en/reserva/
  ('Finca Las Moras', 'Los Intocables Black Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://www.fincalasmoras.com/en/losintocables/
  ('Finca Las Moras', 'Los Intocables Black Cabernet', 'Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.fincalasmoras.com/en/losintocables/
  ('Finca Las Moras', 'Los Intocables Red Blend', 'Argentina', 'Syrah, Merlot, Bonarda', 'Red'),  -- https://www.fincalasmoras.com/en/losintocables/
  ('Finca Las Moras', 'Los Intocables White Chardonnay', 'Argentina', 'Chardonnay', 'White'),  -- https://www.fincalasmoras.com/en/losintocables/
  ('Finca Las Moras', 'Los Intocables Rum Barrel', 'Argentina', 'Merlot, Syrah', 'Red'),  -- https://www.fincalasmoras.com/en/losintocables/
  ('Finca Las Moras', 'Black Label Bonarda', 'Argentina', 'Bonarda', 'Red'),  -- https://www.fincalasmoras.com/en/blacklabel/
  ('Finca Las Moras', 'Black Label Cabernet - Cabernet', 'Argentina', 'Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.fincalasmoras.com/en/blacklabel/
  ('Finca Las Moras', 'Black Label Chardonnay', 'Argentina', 'Chardonnay', 'White'),  -- https://www.fincalasmoras.com/en/blacklabel/
  ('Finca Las Moras', 'Black Label Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://www.fincalasmoras.com/en/blacklabel/
  ('Finca Las Moras', 'Black Label Sauvignon Blanc', 'Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.fincalasmoras.com/en/blacklabel/
  ('Finca Las Moras', 'Black Label Syrah', 'Argentina', 'Syrah', 'Red'),  -- https://www.fincalasmoras.com/en/blacklabel/
  ('Finca Las Moras', 'Organic Chardonnay', 'Argentina', 'Chardonnay', 'White'),  -- https://www.fincalasmoras.com/en/organico/
  ('Finca Las Moras', 'Organic Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://www.fincalasmoras.com/en/organico/
  ('Finca Las Moras', 'Organic Syrah', 'Argentina', 'Syrah', 'Red'),  -- https://www.fincalasmoras.com/en/organico/
  ('Finca Las Moras', 'Organic Torrontés', 'Argentina', 'Torrontés', 'White'),  -- https://www.fincalasmoras.com/en/organico/
  ('Finca Las Moras', 'Dadá Nº 1', 'Argentina', null, 'Red'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Nº 2', 'Argentina', null, 'Red'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Nº 6', 'Argentina', null, 'White'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Nº 8', 'Argentina', null, 'Red'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Art Malbec', 'Argentina', 'Malbec', 'Red'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Art Cabernet', 'Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Art White Malbec', 'Argentina', 'Malbec', 'White'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Incrediblends I', 'Argentina', 'Malbec, Cabernet', 'Red'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Incrediblends II', 'Argentina', 'Malbec, Tempranillo', 'Red'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Nº 7 Sparkling', 'Argentina', 'Torrontés', 'Sparkling'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Dadá Nº 7 Sparkling Sweet Pink', 'Argentina', 'Torrontés, Malbec', 'Sparkling'),  -- https://www.fincalasmoras.com/en/dada/
  ('Finca Las Moras', 'Mora Negra', 'San Juan, Argentina', 'Malbec, Bonarda', 'Red'),  -- https://www.fincalasmoras.com/en/moranegra/
  ('Finca Las Moras', 'Sagrado Pedernal', 'San Juan, Argentina', 'Malbec', 'Red'),  -- https://www.fincalasmoras.com/en/sagradopedernal/
  ('Finca Las Moras', 'Gran Syrah', 'San Juan, Argentina', 'Syrah', 'Red'),  -- https://www.fincalasmoras.com/en/gransyrah/
  ('Finca Las Moras', 'Paz Malbec', 'San Juan, Argentina', 'Malbec', 'Red'),  -- https://www.fincalasmoras.com/en/paz/
  ('Finca Las Moras', 'Paz Cabernet Sauvignon - Cabernet Franc', 'San Juan, Argentina', 'Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.fincalasmoras.com/en/paz/
  ('Finca Las Moras', 'Paz Syrah', 'San Juan, Argentina', 'Syrah', 'Red'),  -- https://www.fincalasmoras.com/en/paz/
  ('Finca Las Moras', 'Paz Sauvignon Blanc', 'San Juan, Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.fincalasmoras.com/en/paz/
  ('Finca Las Moras', 'Demencial Pinot Noir', 'San Juan, Argentina', 'Pinot Noir', 'Red'),  -- https://www.fincalasmoras.com/en/demencial/
  ('Finca Las Moras', 'Demencial Blanc de Blancs', 'San Juan, Argentina', 'Viognier, Sauvignon Blanc, Chardonnay', 'White'),  -- https://www.fincalasmoras.com/en/demencial/
  ('Finca Las Moras', 'Demencial Malbec', 'San Juan, Argentina', 'Malbec', 'Red')  -- https://www.fincalasmoras.com/en/demencial/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FABRE MONTMAYOU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Fabre Montmayou', 'Gran Reserva Malbec', 'Mendoza, Argentina', 'Malbec', 'Red')  -- https://nyc.flatiron-wines.com/products/fabre-montmayou-malbec-gran-reserva-mendoza-2023-750ml
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PASCUAL TOSO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Pascual Toso', 'Magdalena Toso', 'Maipú, Mendoza, Argentina', 'Malbec, Cabernet Sauvignon', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Finca Pedregal', 'Mendoza, Argentina', 'Cabernet Sauvignon, Malbec', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Barrancas Toso Terroir Selection Red Blend', 'Maipú, Mendoza, Argentina', 'Malbec, Cabernet Sauvignon', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Limited Edition Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://bodegastoso.com/vinos-en-el-mundo/
  ('Pascual Toso', 'Alta Chardonnay', 'Maipú, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Alta Cabernet Sauvignon', 'Maipú, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Alta Cabernet Franc', 'Maipú, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Alta Malbec', 'Maipú, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Alta Syrah', 'Maipú, Mendoza, Argentina', 'Syrah', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Edición Aniversario 125° Aniversario', 'Mendoza, Argentina', 'Malbec, Cabernet Sauvignon', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Edición Aniversario 135° Aniversario', 'Maipú, Mendoza, Argentina', 'Malbec, Cabernet Sauvignon', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Gran Syrah', 'Maipú, Mendoza, Argentina', 'Syrah', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Gran Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Reserva Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Reserva Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Reserva Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Signature Malbec', 'Maipú, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Signature Cabernet Sauvignon', 'Maipú, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Signature Chardonnay', 'Maipú, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Estate Red Blend', 'Maipú, Mendoza, Argentina', null, 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Estate Cabernet Sauvignon', 'Maipú, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Estate Malbec', 'Maipú, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Estate Rosé', 'Maipú, Mendoza, Argentina', null, 'Rosé'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Estate Sauvignon Blanc', 'Maipú, Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Estate Chardonnay', 'Maipú, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Alta Brut Rosé Método Tradicional', 'Mendoza, Argentina', 'Chardonnay, Malbec', 'Sparkling'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Alta Brut Nature Método Tradicional', 'Mendoza, Argentina', 'Chardonnay', 'Sparkling'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Extra Brut Método Charmat', 'Mendoza, Argentina', 'Chardonnay', 'Sparkling'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Brut Rosé Método Charmat', 'Mendoza, Argentina', 'Chardonnay, Malbec', 'Sparkling'),  -- https://bodegastoso.com/vinos-en-argentina/
  ('Pascual Toso', 'Brut Método Charmat', 'Mendoza, Argentina', 'Chardonnay', 'Sparkling')  -- https://bodegastoso.com/vinos-en-el-mundo/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TRIVENTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Trivento', 'Reserve Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Reserve White Malbec', 'Mendoza, Argentina', 'Malbec', 'White'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Reserve Rosé Malbec', 'Mendoza, Argentina', 'Malbec, Pinot Noir', 'Rosé'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Reserve Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Reserve Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Cuvée Exceptionnelle Brut Nature', 'Mendoza, Argentina', 'Chardonnay, Pinot Noir, Malbec', 'Sparkling'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Golden Reserve Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Golden Reserve Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Golden Reserve Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Golden Reserve Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Golden Reserve Malbec - Cabernet Franc', 'Mendoza, Argentina', 'Malbec, Cabernet Franc', 'Red'),  -- https://trivento.com/vinos.php
  ('Trivento', 'Stratus', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Cabernet Sauvignon, Cabernet Franc, Merlot', 'Red')  -- https://trivento.com/vinos.php
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALTA VISTA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Alta Vista', 'Alto', 'Mendoza, Argentina', null, 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Single Vineyard Albaneve', 'Mendoza, Argentina', null, 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Single Vineyard Serenade', 'Mendoza, Argentina', null, 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Single Vineyard Temis', 'Mendoza, Argentina', null, 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Terroir Selection Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Terroir Selection Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Terroir Selection Malbec Salta', 'Salta, Argentina', 'Malbec', 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Los Escasos Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Los Escasos Petit Verdot', 'Mendoza, Argentina', 'Petit Verdot', 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Los Escasos Syrah', 'Mendoza, Argentina', 'Syrah', 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Atemporal Blend', 'Mendoza, Argentina', null, 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Estate Premium Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://tienda.altavistawines.com/vinos/tintos/
  ('Alta Vista', 'Single Vineyard Olympe', 'Mendoza, Argentina', null, 'White'),  -- https://tienda.altavistawines.com/vinos/blancos/
  ('Alta Vista', 'Atemporal Assemblage Blanc', 'Mendoza, Argentina', 'Chardonnay, Sauvignon Blanc, Torrontés', 'White'),  -- https://tienda.altavistawines.com/vinos/blancos/
  ('Alta Vista', 'Estate Premium Torrontés', 'Mendoza, Argentina', 'Torrontés', 'White'),  -- https://tienda.altavistawines.com/vinos/blancos/
  ('Alta Vista', 'Estate Premium Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://tienda.altavistawines.com/vinos/blancos/
  ('Alta Vista', 'Estate Premium Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://tienda.altavistawines.com/vinos/blancos/
  ('Alta Vista', 'Vive Sweet Sparkling', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://tienda.altavistawines.com/vinos/blancos/
  ('Alta Vista', 'Vive Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://tienda.altavistawines.com/vinos/blancos/
  ('Alta Vista', 'Vive Rosé', 'Mendoza, Argentina', null, 'Rosé'),  -- https://tienda.altavistawines.com/vinos/rosados/
  ('Alta Vista', 'Atemporal Brut', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://tienda.altavistawines.com/espumantes/
  ('Alta Vista', 'Atemporal Brut Nature', 'Mendoza, Argentina', 'Pinot Noir, Chardonnay', 'Sparkling'),  -- https://tienda.altavistawines.com/espumantes/
  ('Alta Vista', 'Atemporal Rosé', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://tienda.altavistawines.com/espumantes/
  ('Alta Vista', 'Atemporal Extra Brut', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://tienda.altavistawines.com/espumantes/
  ('Alta Vista', 'Rosé Extra Brut', 'Mendoza, Argentina', 'Malbec, Pinot Noir', 'Sparkling'),  -- https://tienda.altavistawines.com/espumantes/
  ('Alta Vista', 'Brut Nature', 'Mendoza, Argentina', 'Chardonnay', 'Sparkling'),  -- https://tienda.altavistawines.com/espumantes/
  ('Alta Vista', 'Extra Brut', 'Mendoza, Argentina', 'Chardonnay', 'Sparkling')  -- https://tienda.altavistawines.com/espumantes/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HUMBERTO CANALE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Humberto Canale', 'Estate Malbec', 'Río Negro, Patagonia, Argentina', 'Malbec', 'Red'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Estate Merlot', 'Río Negro, Patagonia, Argentina', 'Merlot', 'Red'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Black River Malbec', 'Río Negro, Patagonia, Argentina', 'Malbec', 'Red'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Black River Sauvignon Blanc', 'Río Negro, Patagonia, Argentina', 'Sauvignon Blanc', 'White'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Old Vine Malbec', 'Río Negro, Patagonia, Argentina', 'Malbec', 'Red'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Old Vine Semillon', 'Río Negro, Patagonia, Argentina', 'Semillon', 'White'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Old Vineyard Riesling', 'Río Negro, Patagonia, Argentina', 'Riesling', 'White'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Old Vine Pinot Noir', 'Río Negro, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Íntimo Tinto', 'Río Negro, Patagonia, Argentina', null, 'Red'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Selección de Familia Malbec', 'Río Negro, Patagonia, Argentina', 'Malbec', 'Red'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Selección de Familia Cabernet Franc', 'Río Negro, Patagonia, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.enotria.com/producers/humberto-canale
  ('Humberto Canale', 'Selección de Familia Pinot Noir', 'Río Negro, Patagonia, Argentina', 'Pinot Noir', 'Red')  -- https://www.enotria.com/producers/humberto-canale
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHACRA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Chacra', 'Treinta y Dos', 'Río Negro, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.bodegachacra.com/wines.php
  ('Chacra', 'Cincuenta y Cinco', 'Río Negro, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.bodegachacra.com/wines.php
  ('Chacra', 'Sin Azufre', 'Río Negro, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.bodegachacra.com/wines.php
  ('Chacra', 'Lunita', 'Río Negro, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.bodegachacra.com/wines.php
  ('Chacra', 'Barda', 'Río Negro, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.bodegachacra.com/wines.php
  ('Chacra', 'Chardonnay', 'Río Negro, Patagonia, Argentina', 'Chardonnay', 'White'),  -- https://www.bodegachacra.com/wines.php
  ('Chacra', 'Mainqué Chardonnay', 'Río Negro, Patagonia, Argentina', 'Chardonnay', 'White')  -- https://www.bodegachacra.com/wines.php
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BODEGA NOEMÍA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Bodega Noemía', 'J Alberto', 'Río Negro, Patagonia, Argentina', 'Malbec, Merlot', 'Red'),  -- https://www.bodeganoemia.com/
  ('Bodega Noemía', 'Noemía Malbec', 'Río Negro, Patagonia, Argentina', 'Malbec', 'Red')  -- https://www.bodeganoemia.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FAMILIA SCHROEDER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Familia Schroeder', 'Saurus Estate Pinot Noir Rosé', 'Neuquén, Patagonia, Argentina', 'Pinot Noir', 'Rosé'),  -- https://www.vinetur.com/20260806105334/familia-schroeder-reivindica-el-pinot-noir-con-nueve-etiquetas-nacidas-en-la-patagonia-argentina.html
  ('Familia Schroeder', 'Saurus Estate Pinot Noir', 'Neuquén, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.vinetur.com/20260806105334/familia-schroeder-reivindica-el-pinot-noir-con-nueve-etiquetas-nacidas-en-la-patagonia-argentina.html
  ('Familia Schroeder', 'Saurus Select Pinot Noir', 'Neuquén, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.vinetur.com/20260806105334/familia-schroeder-reivindica-el-pinot-noir-con-nueve-etiquetas-nacidas-en-la-patagonia-argentina.html
  ('Familia Schroeder', 'Pinot Noir', 'Neuquén, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.vinetur.com/20260806105334/familia-schroeder-reivindica-el-pinot-noir-con-nueve-etiquetas-nacidas-en-la-patagonia-argentina.html
  ('Familia Schroeder', 'Pinot Noir Malbec', 'Neuquén, Patagonia, Argentina', 'Pinot Noir, Malbec', 'Red'),  -- https://www.vinetur.com/20260806105334/familia-schroeder-reivindica-el-pinot-noir-con-nueve-etiquetas-nacidas-en-la-patagonia-argentina.html
  ('Familia Schroeder', 'Rosa de los Vientos', 'Neuquén, Patagonia, Argentina', 'Pinot Noir', 'Sparkling'),  -- https://www.vinetur.com/20260806105334/familia-schroeder-reivindica-el-pinot-noir-con-nueve-etiquetas-nacidas-en-la-patagonia-argentina.html
  ('Familia Schroeder', 'Saurus Pinot Noir Tardío', 'Neuquén, Patagonia, Argentina', 'Pinot Noir', 'Sweet'),  -- https://www.vinetur.com/20260806105334/familia-schroeder-reivindica-el-pinot-noir-con-nueve-etiquetas-nacidas-en-la-patagonia-argentina.html
  ('Familia Schroeder', 'Alpataco Pinot Noir', 'Neuquén, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.vinetur.com/20260806105334/familia-schroeder-reivindica-el-pinot-noir-con-nueve-etiquetas-nacidas-en-la-patagonia-argentina.html
  ('Familia Schroeder', 'Saurus Barrel Fermented Malbec', 'Neuquén, Patagonia, Argentina', 'Malbec', 'Red'),  -- https://www.vinetur.com/20260518100821/familia-schroeder-impulsa-su-linea-saurus-barrel-fermented.html
  ('Familia Schroeder', 'Saurus Barrel Fermented Pinot Noir', 'Neuquén, Patagonia, Argentina', 'Pinot Noir', 'Red'),  -- https://www.vinetur.com/20260518100821/familia-schroeder-impulsa-su-linea-saurus-barrel-fermented.html
  ('Familia Schroeder', 'Saurus Barrel Fermented Cabernet Franc', 'Neuquén, Patagonia, Argentina', 'Cabernet Franc', 'Red'),  -- https://www.vinetur.com/20260518100821/familia-schroeder-impulsa-su-linea-saurus-barrel-fermented.html
  ('Familia Schroeder', 'Saurus Barrel Fermented Chardonnay', 'Neuquén, Patagonia, Argentina', 'Chardonnay', 'White')  -- https://www.vinetur.com/20260518100821/familia-schroeder-impulsa-su-linea-saurus-barrel-fermented.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RUTINI WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Rutini Wines', 'Colección Gewürztraminer', 'Mendoza, Argentina', 'Gewürztraminer', 'White'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Rosé', 'Mendoza, Argentina', null, 'Rosé'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Syrah', 'Mendoza, Argentina', 'Syrah', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Vin Doux', 'Mendoza, Argentina', null, 'Sweet'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Brut Nature', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Extra Brut', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Cabernet Franc Malbec', 'Mendoza, Argentina', 'Cabernet Franc, Malbec', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Cabernet Malbec', 'Mendoza, Argentina', 'Cabernet, Malbec', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Cabernet Merlot', 'Mendoza, Argentina', 'Cabernet, Merlot', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Cabernet Syrah', 'Mendoza, Argentina', 'Cabernet, Syrah', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Merlot', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Colección Riesling', 'Valle de Uco, Mendoza, Argentina', 'Riesling', 'White'),  -- https://rutiniwines.com/rutini-coleccion/
  ('Rutini Wines', 'Trumpeter Low Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Low Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Malbec Syrah', 'Mendoza, Argentina', 'Malbec, Syrah', 'Red'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Merlot', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Sauvignon Blanc', 'Mendoza, Argentina', 'Sauvignon Blanc', 'White'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Syrah', 'Mendoza, Argentina', 'Syrah', 'Red'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Cabernet Franc', 'Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Espumante Rosé', 'Mendoza, Argentina', 'Malbec', 'Sparkling'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Extra Brut', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Brut Nature', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://rutiniwines.com/trumpeter/
  ('Rutini Wines', 'Trumpeter Reserve Rosé', 'Mendoza, Argentina', 'Malbec', 'Rosé'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Tempranillo', 'Mendoza, Argentina', 'Tempranillo', 'Red'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Torrontés', 'Mendoza, Argentina', 'Torrontés', 'White'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Viognier', 'Mendoza, Argentina', 'Viognier', 'White'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Blend', 'Mendoza, Argentina', 'Malbec, Tempranillo, Cabernet', 'Red'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Bonarda', 'Mendoza, Argentina', 'Bonarda', 'Red'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Petit Verdot', 'Mendoza, Argentina', 'Petit Verdot', 'Red'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Pinot Grigio', 'Mendoza, Argentina', 'Pinot Grigio', 'White'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Trumpeter Reserve Pinot Noir', 'Mendoza, Argentina', 'Pinot Noir', 'Red'),  -- https://rutiniwines.com/trumpeter-reserve/
  ('Rutini Wines', 'Encuentro Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://rutiniwines.com/encuentro/
  ('Rutini Wines', 'Encuentro Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/encuentro/
  ('Rutini Wines', 'Encuentro Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://rutiniwines.com/encuentro/
  ('Rutini Wines', 'Encuentro Brut Nature', 'Mendoza, Argentina', 'Pinot Noir', 'Sparkling'),  -- https://rutiniwines.com/encuentro/
  ('Rutini Wines', 'Single Vineyard Gualtallary Carmenere', 'Gualtallary, Valle de Uco, Mendoza, Argentina', 'Carmenère', 'Red'),  -- https://rutiniwines.com/single-vineyard/
  ('Rutini Wines', 'Single Vineyard Gualtallary Chardonnay', 'Gualtallary, Valle de Uco, Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://rutiniwines.com/single-vineyard/
  ('Rutini Wines', 'Single Vineyard Altamira Cabernet Sauvignon', 'Paraje Altamira, Valle de Uco, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://rutiniwines.com/single-vineyard/
  ('Rutini Wines', 'Single Vineyard Gualtallary Cabernet Sauvignon', 'Gualtallary, Valle de Uco, Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://rutiniwines.com/single-vineyard/
  ('Rutini Wines', 'Single Vineyard Gualtallary Malbec', 'Gualtallary, Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/single-vineyard/
  ('Rutini Wines', 'Single Vineyard Altamira Malbec', 'Paraje Altamira, Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/single-vineyard/
  ('Rutini Wines', 'Single Vineyard Altamira Merlot', 'Paraje Altamira, Valle de Uco, Mendoza, Argentina', 'Merlot', 'Red'),  -- https://rutiniwines.com/single-vineyard/
  ('Rutini Wines', 'Single Vineyard Gualtallary Cabernet Franc', 'Gualtallary, Valle de Uco, Mendoza, Argentina', 'Cabernet Franc', 'Red'),  -- https://rutiniwines.com/single-vineyard/
  ('Rutini Wines', 'Antología LXII', 'Valle de Uco, Mendoza, Argentina', null, 'Red'),  -- https://rutiniwines.com/antologia/
  ('Rutini Wines', 'Antología LIX', 'Valle de Uco, Mendoza, Argentina', null, 'Red'),  -- https://rutiniwines.com/antologia/
  ('Rutini Wines', 'Antología LVII', 'Valle de Uco, Mendoza, Argentina', null, 'Red'),  -- https://rutiniwines.com/antologia/
  ('Rutini Wines', 'Dominio Gran Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/dominio/
  ('Rutini Wines', 'Dominio Malbec Cabernet Franc', 'Mendoza, Argentina', 'Malbec, Cabernet Franc', 'Red'),  -- https://rutiniwines.com/dominio/
  ('Rutini Wines', 'Dominio Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/dominio/
  ('Rutini Wines', 'Dominio Brut Nature', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://rutiniwines.com/dominio/
  ('Rutini Wines', 'Dominio Extra Brut', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://rutiniwines.com/dominio/
  ('Rutini Wines', 'Dominio Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://rutiniwines.com/dominio/
  ('Rutini Wines', 'Dominio Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://rutiniwines.com/dominio/
  ('Rutini Wines', 'Dominio Gran Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://rutiniwines.com/dominio/
  ('Rutini Wines', 'Apartado Gran Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/apartado/
  ('Rutini Wines', 'Apartado Gran Merlot', 'Mendoza, Argentina', 'Merlot', 'Red'),  -- https://rutiniwines.com/apartado/
  ('Rutini Wines', 'Apartado Gran Chardonnay', 'Mendoza, Argentina', 'Chardonnay', 'White'),  -- https://rutiniwines.com/apartado/
  ('Rutini Wines', 'Apartado Espumante Nature', 'Mendoza, Argentina', null, 'Sparkling'),  -- https://rutiniwines.com/apartado/
  ('Rutini Wines', 'Apartado Gran Blend', 'Mendoza, Argentina', null, 'Red'),  -- https://rutiniwines.com/apartado/
  ('Rutini Wines', 'Apartado Gran Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red'),  -- https://rutiniwines.com/apartado/
  ('Rutini Wines', 'Finca Centenaria La Consulta Malbec', 'La Consulta, Valle de Uco, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/rutini-finca-centenaria/
  ('Rutini Wines', 'Blend of Terroirs Malbec', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://rutiniwines.com/rutini-blend-of-terroirs/
  ('Rutini Wines', 'Blend of Terroirs Cabernet Sauvignon', 'Mendoza, Argentina', 'Cabernet Sauvignon', 'Red')  -- https://rutiniwines.com/rutini-blend-of-terroirs/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MATERVINI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Matervini', 'Tinto', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Cabernet Franc, Petit Verdot', 'Red'),  -- https://www.matervini.com/en/wines
  ('Matervini', 'Viña Canota', 'Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.matervini.com/en/wines
  ('Matervini', 'Calcha', 'Calchaquí, Salta, Argentina', 'Malbec', 'Red'),  -- https://www.matervini.com/en/wines
  ('Matervini', 'Finca', 'Luján de Cuyo, Mendoza, Argentina', 'Malbec', 'Red'),  -- https://www.matervini.com/en/wines
  ('Matervini', 'Alteza', 'Cafayate, Salta, Argentina', 'Malbec', 'Red'),  -- https://www.matervini.com/en/wines
  ('Matervini', 'Piedras Viejas Terrazas', 'Mendoza, Argentina', null, 'Red'),  -- https://www.matervini.com/en/wines
  ('Matervini', 'Piedras Viejas Laderas', 'Mendoza, Argentina', null, 'Red'),  -- https://www.matervini.com/en/wines
  ('Matervini', 'Imposibles', 'Calchaquí, Salta, Argentina', 'Malbec', 'Red'),  -- https://www.matervini.com/en/wines
  ('Matervini', 'Blanco', 'Valle de Uco, Mendoza, Argentina', 'Roussanne, Marsanne, Viognier', 'White')  -- https://www.matervini.com/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MASI TUPUNGATO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_argentina.sql)'
from (values
  ('Masi Tupungato', 'Corbec', 'Valle de Uco, Mendoza, Argentina', 'Corvina, Malbec', 'Red'),  -- https://www.vino.com/en/selezione/masi-tupungato
  ('Masi Tupungato', 'Passo Doble', 'Valle de Uco, Mendoza, Argentina', 'Malbec, Corvina', 'Red'),  -- https://www.vino.com/en/selezione/masi-tupungato
  ('Masi Tupungato', 'Passo Blanco', 'Valle de Uco, Mendoza, Argentina', null, 'White')  -- https://www.vino.com/en/selezione/masi-tupungato
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
