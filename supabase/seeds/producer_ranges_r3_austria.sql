-- Producer ranges round 3: Austria. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- DOMÄNE WACHAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Ried Kaiserberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Ried Kollmitz', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Ried Kreuzberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Ried Liebenberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Ried Loibenberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Ried Pichlpoint', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Ried Traunthal', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Ried Schön', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Riesling Federspiel Ried 1000-Eimer-Berg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Riesling Federspiel Ried Bruck', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Riesling Federspiel Ried Loibenberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Riesling Federspiel Ried Steinriegl', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Riesling Federspiel Ried Trenning', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Himmelstiege', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Katzensprung', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Terrassen', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Himmelstiege', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Ried Achleiten', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Ried Axpoint', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Ried Kellerberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Ried Kirnberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Terrassen', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Riesling Federspiel Terrassen', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Riesling Smaragd Ried Achleiten', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Riesling Smaragd Ried Brandstatt', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Riesling Smaragd Ried Kellerberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Riesling Smaragd Ried Loibenberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Riesling Smaragd Ried Singerriedel', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Riesling Smaragd Terrassen', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Gelber Muskateller Federspiel Terrassen', 'Wachau, Austria', 'Gelber Muskateller', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Neuburger Federspiel Spitzer Graben', 'Wachau, Austria', 'Neuburger', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Weissburgunder Federspiel Terrassen', 'Wachau, Austria', 'Weissburgunder', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Rosé Santé Federspiel Terrassen', 'Wachau, Austria', null, 'Rosé'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Fresco Frizzante', 'Wachau, Austria', null, 'Sparkling'),  -- https://www.domaene-wachau.at/de/shop/page/2/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Classic', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Dürnstein', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Grüner Veltliner Federspiel Weissenkirchen', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Classic', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Dürnstein', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Grüner Veltliner Smaragd Weissenkirchen', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Grüner Veltliner Spätlese Himmelstiege', 'Wachau, Austria', 'Grüner Veltliner', 'Sweet'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Grüner Veltliner Steinwerk', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Grüner Veltliner VSN', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Riesling Federspiel Classic', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Riesling Federspiel Dürnstein', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Riesling Federspiel Weissenkirchen', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Riesling Smaragd Classic', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Riesling Smaragd Weissenkirchen', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Riesling Amphora', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Riesling Kabinett Ried Hollerin', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Chardonnay Reserve', 'Wachau, Austria', 'Chardonnay', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Roter Traminer Reserve', 'Wachau, Austria', 'Roter Traminer', 'White'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Pinot Noir', 'Wachau, Austria', 'Pinot Noir', 'Red'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Blauer Zweigelt Terrassen', 'Wachau, Austria', 'Zweigelt', 'Red'),  -- https://www.domaene-wachau.at/de/shop/page/3/
  ('Domäne Wachau', 'Zweigelt Rosé Federspiel Classic', 'Wachau, Austria', 'Zweigelt', 'Rosé')  -- https://www.domaene-wachau.at/de/shop/page/3/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- F.X. PICHLER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('F.X. Pichler', 'Grüner Veltliner Ried Loibner Frauenweingarten', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Grüner Veltliner Ried Loibner Klostersatz', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Grüner Veltliner Ried Loibner Burgstall', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Grüner Veltliner Ried Loibner Steinertal', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Grüner Veltliner Ried Loibner Loibenberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Grüner Veltliner Ried Dürnsteiner Liebenberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Grüner Veltliner Ried Dürnsteiner Kellerberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Riesling Ried Loibner Klostersatz', 'Wachau, Austria', 'Riesling', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Riesling Ried Loibner Trum', 'Wachau, Austria', 'Riesling', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Riesling Ried Loibner Burgstall', 'Wachau, Austria', 'Riesling', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Riesling Ried Loibner Steinertal', 'Wachau, Austria', 'Riesling', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Riesling Ried Loibner Loibenberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Riesling Ried Dürnsteiner Kellerberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Grüner Veltliner Loibner', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Grüner Veltliner Dürnsteiner', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://fx-pichler.at/rieden-weine/
  ('F.X. Pichler', 'Gelber Muskateller Dürnsteiner', 'Wachau, Austria', 'Gelber Muskateller', 'White')  -- https://fx-pichler.at/rieden-weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOIMER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Loimer', 'Extra Brut Reserve', 'Niederösterreich, Austria', null, 'Sparkling'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Langenlois Grosse Reserve Blanc de Blancs Brut Nature', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Gumpoldskirchen Grosse Reserve Blanc de Noirs Brut Nature', 'Thermenregion, Austria', null, 'Sparkling'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Brut Rosé Reserve', 'Niederösterreich, Austria', null, 'Sparkling'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Grüner Veltliner Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Riesling Kamptal DAC', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Langenlois Grüner Veltliner Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Langenlois Riesling Kamptal DAC', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Ried Loiserberg Kamptal DAC', 'Kamptal, Austria', null, 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Grüner Veltliner Ried Käferberg Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Grüner Veltliner Ried Spiegel Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Riesling Ried Seeberg Kamptal DAC', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Riesling Ried Steinmassl Kamptal DAC', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Riesling Ried Heiligenstein Kamptal DAC', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Gumpoldskirchen Gumpold', 'Thermenregion, Austria', null, 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Zöbing Eichelberg', 'Kamptal, Austria', null, 'White'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Pinot Noir Niederösterreich', 'Niederösterreich, Austria', 'Pinot Noir', 'Red'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Gumpoldskirchen Anning Pinot Noir', 'Thermenregion, Austria', 'Pinot Noir', 'Red'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Langenlois Dechant Pinot Noir', 'Kamptal, Austria', 'Pinot Noir', 'Red'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'gluegglich Weiß', 'Niederösterreich, Austria', null, 'Orange'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'gluegglich Rosé', 'Niederösterreich, Austria', null, 'Rosé'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'gluegglich Rot', 'Niederösterreich, Austria', null, 'Red'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Gemischter Satz mit Achtung', 'Niederösterreich, Austria', null, 'Orange'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Grüner Veltliner mit Achtung', 'Niederösterreich, Austria', 'Grüner Veltliner', 'Orange'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Manhart mit Achtung', 'Niederösterreich, Austria', null, 'Orange'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Muskateller mit Achtung', 'Niederösterreich, Austria', 'Muskateller', 'Orange'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Traminer mit Achtung', 'Niederösterreich, Austria', 'Traminer', 'Orange'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Südbahn mit Achtung', 'Niederösterreich, Austria', null, 'Orange'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Auslese', 'Kamptal, Austria', null, 'Sweet'),  -- https://www.loimer.at/product-category/weine/
  ('Loimer', 'Seeberg Alte Reben Beerenauslese', 'Kamptal, Austria', null, 'Sweet')  -- https://www.loimer.at/product-category/weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SCHLOSS GOBELSBURG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Schloss Gobelsburg', 'Brut Reserve', 'Kamptal, Austria', null, 'Sparkling'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'Blanc de Blancs', 'Kamptal, Austria', null, 'Sparkling'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'Vintage', 'Kamptal, Austria', null, 'Sparkling'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'Tradition Heritage Cuvée 3 Jahre', 'Kamptal, Austria', null, 'White'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'Tradition Heritage Cuvée 10 Jahre', 'Kamptal, Austria', null, 'White'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'Brut Rosé', 'Kamptal, Austria', null, 'Sparkling'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'Pinot Noir Reserve', 'Kamptal, Austria', 'Pinot Noir', 'Red'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'St. Laurent Reserve', 'Kamptal, Austria', 'St. Laurent', 'Red'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'Zweigelt Reserve', 'Kamptal, Austria', 'Zweigelt', 'Red'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'Merlot Privatkeller', 'Kamptal, Austria', 'Merlot', 'Red'),  -- https://shop.gobelsburg.at/schloss-gobelsburg/
  ('Schloss Gobelsburg', 'Schlosskellerei Löss Grüner Veltliner', 'Niederösterreich, Austria', 'Grüner Veltliner', 'White'),  -- https://shop.gobelsburg.at/schlosskellerei-gobelsburg/
  ('Schloss Gobelsburg', 'Schlosskellerei Messwein Grüner Veltliner', 'Niederösterreich, Austria', 'Grüner Veltliner', 'White'),  -- https://shop.gobelsburg.at/schlosskellerei-gobelsburg/
  ('Schloss Gobelsburg', 'Schlosskellerei Urgestein Riesling', 'Niederösterreich, Austria', 'Riesling', 'White'),  -- https://shop.gobelsburg.at/schlosskellerei-gobelsburg/
  ('Schloss Gobelsburg', 'Schlosskellerei Cistercien Rosé', 'Niederösterreich, Austria', null, 'Rosé'),  -- https://shop.gobelsburg.at/schlosskellerei-gobelsburg/
  ('Schloss Gobelsburg', 'Schlosskellerei Zweigelt Niederösterreich', 'Niederösterreich, Austria', 'Zweigelt', 'Red'),  -- https://shop.gobelsburg.at/schlosskellerei-gobelsburg/
  ('Schloss Gobelsburg', 'Schlosskellerei Blütenmuskateller', 'Niederösterreich, Austria', null, 'White'),  -- https://shop.gobelsburg.at/schlosskellerei-gobelsburg/
  ('Schloss Gobelsburg', 'Domaene Gobelsburg Kamptal Grüner Veltliner', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://shop.gobelsburg.at/domaene-gobelsburg/
  ('Schloss Gobelsburg', 'Domaene Gobelsburg Kamptal Riesling', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://shop.gobelsburg.at/domaene-gobelsburg/
  ('Schloss Gobelsburg', 'Domaene Gobelsburg Rosé', 'Niederösterreich, Austria', null, 'Rosé'),  -- https://shop.gobelsburg.at/domaene-gobelsburg/
  ('Schloss Gobelsburg', 'Domaene Gobelsburg Zweigelt', 'Niederösterreich, Austria', 'Zweigelt', 'Red'),  -- https://shop.gobelsburg.at/domaene-gobelsburg/
  ('Schloss Gobelsburg', 'Grüner Veltliner Lamm', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.gobelsburg.at/
  ('Schloss Gobelsburg', 'Riesling Heiligenstein', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.gobelsburg.at/
  ('Schloss Gobelsburg', 'Grüner Veltliner Eiswein', 'Kamptal, Austria', 'Grüner Veltliner', 'Sweet')  -- https://www.gobelsburg.at/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HIRSCH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Hirsch', 'Grüner Veltliner Ried Renner Kammern', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-hirsch.at/erste-lagen/
  ('Hirsch', 'Grüner Veltliner Ried Gaisberg Kammern', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-hirsch.at/erste-lagen/
  ('Hirsch', 'Grüner Veltliner Ried Grub Kammern', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-hirsch.at/erste-lagen/
  ('Hirsch', 'Grüner Veltliner Ried Lamm Kammern', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-hirsch.at/erste-lagen/
  ('Hirsch', 'Riesling Ried Heiligenstein Zöbing', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.weingut-hirsch.at/erste-lagen/
  ('Hirsch', 'Riesling Ried Gaisberg Zöbing', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.weingut-hirsch.at/erste-lagen/
  ('Hirsch', 'Riesling Ried Heiligenstein-Rotfels Zöbing', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.weingut-hirsch.at/erste-lagen/
  ('Hirsch', 'Kammern Grüner Veltliner', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-hirsch.at/dorfweine/
  ('Hirsch', 'Zöbing Riesling', 'Kamptal, Austria', 'Riesling', 'White')  -- https://www.weingut-hirsch.at/dorfweine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NIKOLAIHOF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Nikolaihof', 'Zwickl Grüner Veltliner', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Hefeabzug Grüner Veltliner', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Aus den Gärten Grüner Veltliner Federspiel', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Aus den Gärten Grüner Veltliner Federspiel Late Bottled', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Ried Im Weingebirge Grüner Veltliner Smaragd', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Aus den Gärten Riesling Federspiel', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Riesling Federspiel Late Bottled', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Ried Vom Stein Riesling Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Klause Riesling', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Ried Steiner Hund Riesling', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Aus den Gärten Neuburger', 'Wachau, Austria', 'Neuburger', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Ried Grillenparz Riesling', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Aus den Gärten Chardonnay', 'Wachau, Austria', 'Chardonnay', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Aus den Gärten Gelber Muskateller', 'Wachau, Austria', 'Gelber Muskateller', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Gewürztraminer', 'Wachau, Austria', 'Gewürztraminer', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Vinothek Riesling', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Steinterrassen Grüner Veltliner', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Baumpresse Grüner Veltliner', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Gutswein', 'Wachau, Austria', null, 'White'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Ried Steiner Gaisberg Riesling Auslese', 'Wachau, Austria', 'Riesling', 'Sweet'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Nikolauswein', 'Wachau, Austria', null, 'Sweet'),  -- https://www.nikolaihof.at/weingut/wein-sortiment/
  ('Nikolaihof', 'Ried Süßenberg Grüner Veltliner', 'Wachau, Austria', 'Grüner Veltliner', 'White')  -- https://www.nikolaihof.at/weingut/wein-sortiment/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BERNHARD OTT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Bernhard Ott', 'Grüner Veltliner Ried Rosenberg Feuersbrunn', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://ott.at/
  ('Bernhard Ott', 'Grüner Veltliner Ried Spiegel Feuersbrunn', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://ott.at/
  ('Bernhard Ott', 'Grüner Veltliner Ried Stein Engabrunn', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://ott.at/
  ('Bernhard Ott', 'Grüner Veltliner Ried Kirchthal Feuersbrunn', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://ott.at/
  ('Bernhard Ott', 'Riesling Ried Kirchthal', 'Wagram, Austria', 'Riesling', 'White'),  -- https://ott.at/shop/
  ('Bernhard Ott', 'Am Berg', 'Wagram, Austria', null, 'White'),  -- https://ott.at/
  ('Bernhard Ott', 'Fass 4', 'Wagram, Austria', null, 'White'),  -- https://ott.at/
  ('Bernhard Ott', 'Der Ott', 'Wagram, Austria', null, 'White'),  -- https://ott.at/
  ('Bernhard Ott', 'Spectrum', 'Wagram, Austria', null, 'White'),  -- https://ott.at/
  ('Bernhard Ott', 'Rosalie', 'Wagram, Austria', null, 'Rosé'),  -- https://ott.at/
  ('Bernhard Ott', 'Riesling', 'Wagram, Austria', 'Riesling', 'White'),  -- https://ott.at/
  ('Bernhard Ott', 'Blaufränkisch Moritz', 'Burgenland, Austria', 'Blaufränkisch', 'Red')  -- https://ott.at/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TEMENT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Tement', 'Sauvignon Blanc Kalk & Kreide Südsteiermark DAC', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Sauvignon Blanc Ehrenhausen Korallenkalk Südsteiermark DAC', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Sauvignon Blanc Ried Grassnitzberg Riff Erste STK Lage', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Sauvignon Blanc Ried Zieregg Kapelle Grosse STK Lage', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Sauvignon Blanc Ried Zieregg Kar Grosse STK Lage', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Sauvignon Blanc Ried Zieregg XT Grosse STK Lage', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Sauvignon Blanc Ried Zieregg IZ Reserve', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Sauvignon Blanc Ried Zieregg Vinothek Reserve', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Sauvignon Blanc Ried Sernau König Grosse STK Lage', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Sauvignon Blanc Reserve', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Morillon Muschelkalk Südsteiermark DAC', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Morillon Ried Sulz Erste STK Lage', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Morillon Ried Sulz Kriewetz Erste STK Lage', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Morillon Ried Grassnitzberg', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Morillon Ried Rossberg K', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Morillon Ried Zieregg Steilriegel Grosse STK Lage', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Morillon Ried Zieregg Grosse STK Lage', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Weissburgunder Ton & Mergel', 'Südsteiermark, Austria', 'Weissburgunder', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Weissburgunder Ried Sulz Erste STK Lage', 'Südsteiermark, Austria', 'Weissburgunder', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Weissburgunder Ried Sulz Pino T Erste STK Lage', 'Südsteiermark, Austria', 'Weissburgunder', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Weissburgunder Ried Zieregg Grosse STK Lage', 'Südsteiermark, Austria', 'Weissburgunder', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Gelber Muskateller Sand & Schiefer', 'Südsteiermark, Austria', 'Gelber Muskateller', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Gelber Muskateller Ried Fürst Erste STK Lage', 'Südsteiermark, Austria', 'Gelber Muskateller', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Gelber Muskateller Ancestral Méthode Rurale', 'Südsteiermark, Austria', 'Gelber Muskateller', 'Sparkling'),  -- https://www.tement.at/shop/
  ('Tement', 'Muska-T Brut Frizzante', 'Südsteiermark, Austria', 'Gelber Muskateller', 'Sparkling'),  -- https://www.tement.at/shop/
  ('Tement', 'Welschriesling L&T Leicht & Trocken', 'Südsteiermark, Austria', 'Welschriesling', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Welschriesling Opok Südsteiermark DAC', 'Südsteiermark, Austria', 'Welschriesling', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Welschriesling Ried Ottenberg Veitlhansl', 'Südsteiermark, Austria', 'Welschriesling', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Welschriesling Weinstock Alte Reben Südsteiermark DAC', 'Südsteiermark, Austria', 'Welschriesling', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Gewürztraminer Ried Wielitschberg', 'Südsteiermark, Austria', 'Gewürztraminer', 'White'),  -- https://www.tement.at/shop/
  ('Tement', 'Cabernet Franc Alte Reben', 'Südsteiermark, Austria', 'Cabernet Franc', 'Red'),  -- https://www.tement.at/shop/
  ('Tement', 'Pinot Noir Alte Reben', 'Südsteiermark, Austria', 'Pinot Noir', 'Red'),  -- https://www.tement.at/shop/
  ('Tement', 'Zweigelt Selektion', 'Südsteiermark, Austria', 'Zweigelt', 'Red'),  -- https://www.tement.at/shop/
  ('Tement', 'Brut Nature', 'Südsteiermark, Austria', null, 'Sparkling')  -- https://www.tement.at/shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SATTLERHOF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Sattlerhof', 'Sauvignon Blanc Ried Kapellenweingarten', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Morillon Ried Kapellenweingarten', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Sauvignon Blanc Ried Sernauberg', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Ried Pfarrweingarten', 'Südsteiermark, Austria', null, 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Ried Pfarrweingarten Fassreserve', 'Südsteiermark, Austria', null, 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Sauvignon Blanc Ried Alter Kranachberg', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Sauvignon Blanc Ried Kranachberg', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Sauvignon Blanc Ried Graßnitzberg', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Ried Trinkaus', 'Südsteiermark, Austria', null, 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Muskateller Ried Marein', 'Südsteiermark, Austria', 'Muskateller', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Morillon Ried Pfarrweingarten', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Weißburgunder Ried Pfarrweingarten', 'Südsteiermark, Austria', 'Weißburgunder', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Grauburgunder Ried Pfarrweingarten', 'Südsteiermark, Austria', 'Grauburgunder', 'White'),  -- https://www.sattlerhof.at/shop/lagenweine
  ('Sattlerhof', 'Weißburgunder Gamlitz', 'Südsteiermark, Austria', 'Weißburgunder', 'White'),  -- https://www.sattlerhof.at/shop/ortsweine
  ('Sattlerhof', 'Morillon Gamlitz', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.sattlerhof.at/shop/ortsweine
  ('Sattlerhof', 'Sauvignon Blanc Gamlitz', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.sattlerhof.at/shop/ortsweine
  ('Sattlerhof', 'Welschriesling Alte Reben', 'Südsteiermark, Austria', 'Welschriesling', 'White'),  -- https://www.sattlerhof.at/shop/ortsweine
  ('Sattlerhof', 'Muskateller Eichberg', 'Südsteiermark, Austria', 'Muskateller', 'White'),  -- https://www.sattlerhof.at/shop/ortsweine
  ('Sattlerhof', 'Welschriesling Kleine Gärten', 'Südsteiermark, Austria', 'Welschriesling', 'White'),  -- https://www.sattlerhof.at/shop/gebietsweine
  ('Sattlerhof', 'Muskateller Kleine Gärten', 'Südsteiermark, Austria', 'Muskateller', 'White'),  -- https://www.sattlerhof.at/shop/gebietsweine
  ('Sattlerhof', 'Weißburgunder Kleine Gärten', 'Südsteiermark, Austria', 'Weißburgunder', 'White'),  -- https://www.sattlerhof.at/shop/gebietsweine
  ('Sattlerhof', 'Sauvignon Blanc Kleine Gärten', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.sattlerhof.at/shop/gebietsweine
  ('Sattlerhof', 'Sauvignon Blanc Trockenbeerenauslese', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'Sweet'),  -- https://www.sattlerhof.at/shop/rotweine-suessweine
  ('Sattlerhof', 'Sauvignon Blanc Beerenauslese', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'Sweet'),  -- https://www.sattlerhof.at/shop/rotweine-suessweine
  ('Sattlerhof', 'Pinot Noir Alte Reben', 'Südsteiermark, Austria', 'Pinot Noir', 'Red')  -- https://www.sattlerhof.at/shop/rotweine-suessweine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HIRTZBERGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Hirtzberger', 'Grüner Veltliner Steinfeder Donaugarten', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- http://hirtzberger.at/index.php?article_id=8&clang=0
  ('Hirtzberger', 'Grüner Veltliner Smaragd Rotes Tor', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- http://hirtzberger.at/index.php?article_id=9&clang=0
  ('Hirtzberger', 'Grüner Veltliner Smaragd Axpoint', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- http://hirtzberger.at/index.php?article_id=10&clang=0
  ('Hirtzberger', 'Grüner Veltliner Smaragd Honivogl', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- http://hirtzberger.at/index.php?article_id=11&clang=0
  ('Hirtzberger', 'Riesling Smaragd Setzberg', 'Wachau, Austria', 'Riesling', 'White'),  -- http://hirtzberger.at/index.php?article_id=12&clang=0
  ('Hirtzberger', 'Riesling Smaragd Hochrain', 'Wachau, Austria', 'Riesling', 'White'),  -- http://hirtzberger.at/index.php?article_id=13&clang=0
  ('Hirtzberger', 'Riesling Smaragd Singerriedel', 'Wachau, Austria', 'Riesling', 'White'),  -- http://hirtzberger.at/index.php?article_id=14&clang=0
  ('Hirtzberger', 'Grauburgunder Pluris', 'Wachau, Austria', 'Grauburgunder', 'White'),  -- http://hirtzberger.at/index.php?article_id=15&clang=0
  ('Hirtzberger', 'Weißburgunder Smaragd Steinporz', 'Wachau, Austria', 'Weißburgunder', 'White'),  -- http://hirtzberger.at/index.php?article_id=16&clang=0
  ('Hirtzberger', 'Chardonnay Smaragd Schlossgarten', 'Wachau, Austria', 'Chardonnay', 'White'),  -- http://hirtzberger.at/index.php?article_id=17&clang=0
  ('Hirtzberger', 'Grüner Veltliner Steinfeder Spitz', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-franz-hirtzberger/
  ('Hirtzberger', 'Riesling Federspiel Steinterrassen', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-franz-hirtzberger/
  ('Hirtzberger', 'Grüner Veltliner Federspiel Rotes Tor', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-franz-hirtzberger/
  ('Hirtzberger', 'Grüner Veltliner Smaragd Kirchweg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-franz-hirtzberger/
  ('Hirtzberger', 'Neuburger Smaragd', 'Wachau, Austria', 'Neuburger', 'White')  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-franz-hirtzberger/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LEO ALZINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Leo Alzinger', 'Dürnstein Grüner Veltliner Federspiel', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Hochstrasser Grüner Veltliner Federspiel', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Mühlpoint Grüner Veltliner Federspiel', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Mühlpoint Grüner Veltliner Smaragd', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Liebenberg Grüner Veltliner Smaragd', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Loibenberg Grüner Veltliner Smaragd', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Steinertal Grüner Veltliner Smaragd', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Reserve Grüner Veltliner', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Dürnstein Riesling Federspiel', 'Wachau, Austria', 'Riesling', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Dürnstein Riesling Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Liebenberg Riesling Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Hollerin Riesling Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Höhereck Riesling Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Loibenberg Riesling Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Ried Steinertal Riesling Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://alzinger.at/weine/
  ('Leo Alzinger', 'Reserve Riesling', 'Wachau, Austria', 'Riesling', 'White')  -- https://alzinger.at/weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RUDI PICHLER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Rudi Pichler', 'Grüner Veltliner Federspiel', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Grüner Veltliner Terrassen Smaragd', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Grüner Veltliner Kollmütz Smaragd', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Grüner Veltliner Hochrain Smaragd', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Grüner Veltliner Achleithen Smaragd', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Riesling Federspiel', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Riesling Terrassen Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Riesling Kirchweg Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Riesling Hochrain Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Riesling Achleithen Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Weißburgunder Kollmütz Smaragd', 'Wachau, Austria', 'Weißburgunder', 'White'),  -- https://www.rudipichler.at/weine/
  ('Rudi Pichler', 'Roter Veltliner Smaragd', 'Wachau, Austria', 'Roter Veltliner', 'White')  -- https://www.rudipichler.at/weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- EMMERICH KNOLL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Emmerich Knoll', 'Grüner Veltliner Steinfeder', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Grüner Veltliner Federspiel', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Grüner Veltliner Federspiel Ried Kreutles', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Grüner Veltliner Federspiel Ried Trum', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Riesling Federspiel', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Riesling Federspiel Ried Loibenberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Gelber Muskateller Federspiel', 'Wachau, Austria', 'Gelber Muskateller', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Grüner Veltliner Smaragd Ried Kreutles', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Grüner Veltliner Smaragd Ried Schütt', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Grüner Veltliner Smaragd Ried Loibenberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Grüner Veltliner Smaragd Vinothekfüllung', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Riesling Smaragd', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Riesling Smaragd Ried Loibenberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Riesling Smaragd Ried Kellerberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Riesling Smaragd Ried Schütt', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Riesling Smaragd Vinothekfüllung', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Gelber Muskateller Smaragd', 'Wachau, Austria', 'Gelber Muskateller', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Traminer Smaragd', 'Wachau, Austria', 'Traminer', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Chardonnay Smaragd', 'Wachau, Austria', 'Chardonnay', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Riesling Kabinett Ried Pfaffenberg', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Riesling Selection Ried Pfaffenberg', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
  ('Emmerich Knoll', 'Pinot Noir Rosé Federspiel', 'Wachau, Austria', 'Pinot Noir', 'Rosé')  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-knoll/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PRAGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Prager', 'Grüner Veltliner Federspiel Hinter der Burg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-prager/
  ('Prager', 'Riesling Federspiel Steinriegl', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-prager/
  ('Prager', 'Grüner Veltliner Smaragd Liebenberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-prager/
  ('Prager', 'Grüner Veltliner Smaragd Zwerithaler', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-prager/
  ('Prager', 'Grüner Veltliner Smaragd Achleiten', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-prager/
  ('Prager', 'Riesling Smaragd Steinriegl', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-prager/
  ('Prager', 'Riesling Smaragd Achleiten', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-prager/
  ('Prager', 'Riesling Smaragd Klaus', 'Wachau, Austria', 'Riesling', 'White')  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-prager/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TEGERNSEERHOF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Tegernseerhof', 'Grüner Veltliner Federspiel Dürnstein', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Grüner Veltliner Federspiel Superin', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Riesling Federspiel Dürnstein', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Rosé Federspiel', 'Wachau, Austria', null, 'Rosé'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Grüner Veltliner Smaragd Bergdistel', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Grüner Veltliner Smaragd Loibenberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Grüner Veltliner Smaragd Höhereck', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Grüner Veltliner Smaragd Schütt', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Riesling Smaragd Loibenberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Riesling Smaragd Steinertal', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Riesling Smaragd Kellerberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Riesling Smaragd Bergdistel', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Zwerithaler Smaragd', 'Wachau, Austria', null, 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Neuburger Smaragd Brandstatt Schmalix Edition', 'Wachau, Austria', 'Neuburger', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Zweigelt', 'Wachau, Austria', 'Zweigelt', 'Red'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
  ('Tegernseerhof', 'Riesling Beerenauslese Kaiserberg', 'Wachau, Austria', 'Riesling', 'Sweet')  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/tegernseerhof/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JOSEF JAMEK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Josef Jamek', 'Grüner Veltliner Steinfeder', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Riesling Federspiel Pichl', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Riesling Federspiel Klaus', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Grüner Veltliner Federspiel Achleiten', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Gelber Muskateller Federspiel Vierblattl', 'Wachau, Austria', 'Gelber Muskateller', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Grüner Veltliner Federspiel Frauengärten', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Grüner Veltliner Federspiel Steinwand', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Riesling Smaragd Klaus', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Grüner Veltliner Smaragd Achleiten', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Grüner Veltliner Smaragd Liebenberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Riesling Smaragd Freiheit Dürnsteiner Riesling', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Weißburgunder Smaragd Wösendorfer', 'Wachau, Austria', 'Weißburgunder', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Grüner Veltliner Smaragd Kollmitz', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Zweigelt', 'Wachau, Austria', 'Zweigelt', 'Red'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
  ('Josef Jamek', 'Chardonnay Jochinger', 'Wachau, Austria', 'Chardonnay', 'White')  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-josef-jamek/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JOSEF HÖGL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Josef Högl', 'Riesling Federspiel Bruck', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Gelber Muskateller Federspiel J&G', 'Wachau, Austria', 'Gelber Muskateller', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Grüner Veltliner Federspiel Schön', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Grüner Veltliner Federspiel Terrassen Spitzer Graben', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Grüner Veltliner Federspiel J&G', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Riesling Federspiel J&G', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Grüner Veltliner Smaragd Schön', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Grüner Veltliner Smaragd 1000-Eimerberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Grüner Veltliner Smaragd Schön Alte Parzellen', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Riesling Smaragd Bruck', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Riesling Smaragd Vision', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Riesling Smaragd Bruck Alte Parzellen', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Grüner Veltliner Smaragd Kaiserberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Grüner Veltliner Smaragd Brandstatt', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Sauvignon Blanc Reserve', 'Wachau, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Chardonnay Reserve', 'Wachau, Austria', 'Chardonnay', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
  ('Josef Högl', 'Grüner Veltliner Eiswein Brandstatt', 'Wachau, Austria', 'Grüner Veltliner', 'Sweet')  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-hoegl/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT JOHANN DONABAUM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Johann Donabaum', 'Grüner Veltliner Federspiel Johann', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Grüner Veltliner Federspiel Point', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Riesling Federspiel Bergterrassen', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Gelber Muskateller Federspiel Donaupoint', 'Wachau, Austria', 'Gelber Muskateller', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Grüner Veltliner Smaragd Zornberg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Grüner Veltliner Smaragd Kirchweg', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Grüner Veltliner Smaragd Spitzer Point', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Grüner Veltliner Smaragd Limitierte Edition', 'Wachau, Austria', 'Grüner Veltliner', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Riesling Smaragd Offenberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Riesling Smaragd Setzberg', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Riesling Smaragd Steinriegl', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Riesling Smaragd Limitierte Edition', 'Wachau, Austria', 'Riesling', 'White'),  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
  ('Weingut Johann Donabaum', 'Neuburger Smaragd', 'Wachau, Austria', 'Neuburger', 'White')  -- https://www.vinea-wachau.at/mywachau/betriebe/betriebs-details/myw_company/weingut-johann-donabaum/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WILLI BRÜNDLMAYER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Willi Bründlmayer', 'Grüner Veltliner L & T', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Kamptal Terrassen Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Ried Berg Vogelsang Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Langenlois Alte Reben Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Ried Loiserberg 1ÖTW Erste Lage Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Ried Käferberg 1ÖTW Erste Lage Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Ried Lamm 1ÖTW Erste Lage Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Ried Spiegel Vincent 1ÖTW Erste Lage Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Henry Dunant', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Riesling Kamptal Terrassen Kamptal DAC', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Riesling Ried Steinmassl 1ÖTW Erste Lage Kamptal DAC', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Riesling Ried Heiligenstein 1ÖTW Erste Lage Kamptal DAC', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Riesling Ried Heiligenstein Alte Reben 1ÖTW Erste Lage Kamptal DAC', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Donauriesling', 'Kamptal, Austria', 'Donauriesling', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grau- & Weißburgunder Ried Spiegel Kamptal DAC', 'Kamptal, Austria', 'Grauburgunder/Weißburgunder', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Chardonnay Ried Steinberg Kamptal DAC', 'Kamptal, Austria', 'Chardonnay', 'White'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Rosé Zweigelt', 'Kamptal, Austria', 'Zweigelt', 'Rosé'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Rosé Pinot Noir Ried Loisium', 'Kamptal, Austria', 'Pinot Noir', 'Rosé'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Zweigelt', 'Kamptal, Austria', 'Zweigelt', 'Red'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Zweigelt Reserve', 'Kamptal, Austria', 'Zweigelt', 'Red'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'St. Laurent', 'Kamptal, Austria', 'St. Laurent', 'Red'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Pinot Noir', 'Kamptal, Austria', 'Pinot Noir', 'Red'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Pinot Noir Reserve', 'Kamptal, Austria', 'Pinot Noir', 'Red'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Cabernet Franc', 'Kamptal, Austria', 'Cabernet Franc', 'Red'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Ried Spiegel Beerenauslese', 'Kamptal, Austria', 'Grüner Veltliner', 'Sweet'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Ried Spiegel Auslese', 'Kamptal, Austria', 'Grüner Veltliner', 'Sweet'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Grüner Veltliner Ried Lamm Auslese', 'Kamptal, Austria', 'Grüner Veltliner', 'Sweet'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Chardonnay Auslese', 'Kamptal, Austria', 'Chardonnay', 'Sweet'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Chardonnay Trockenbeerenauslese', 'Kamptal, Austria', 'Chardonnay', 'Sweet'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Gelber Muskateller Rosenhügel Trockenbeerenauslese', 'Kamptal, Austria', 'Gelber Muskateller', 'Sweet'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Brut Sekt Austria Reserve', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Brut Rosé Sekt Austria Reserve', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Extra Brut Sekt Austria Reserve', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Blanc de Blancs Sekt Austria Reserve', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Blanc de Blancs Vintage Sekt Austria Große Reserve', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.bruendlmayer.at/weine/
  ('Willi Bründlmayer', 'Blanc de Noirs Sekt Austria Reserve', 'Kamptal, Austria', null, 'Sparkling')  -- https://www.bruendlmayer.at/weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JURTSCHITSCH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Jurtschitsch', 'Grüner Veltliner Löss Kamptal DAC', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=10
  ('Jurtschitsch', 'Grüner Veltliner Urgestein', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=10
  ('Jurtschitsch', 'Grüner Veltliner Langenlois', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=10
  ('Jurtschitsch', 'Riesling Langenlois', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=10
  ('Jurtschitsch', 'Grüner Veltliner Ried Loiserberg', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=11
  ('Jurtschitsch', 'Grüner Veltliner Ried Dechant', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=11
  ('Jurtschitsch', 'Grüner Veltliner Ried Käferberg', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=11
  ('Jurtschitsch', 'Grüner Veltliner Ried Lamm', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=11
  ('Jurtschitsch', 'Riesling Ried Loiserberg', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=11
  ('Jurtschitsch', 'Riesling Ried Heiligenstein', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=11
  ('Jurtschitsch', 'Riesling Ried Heiligenstein Alte Reben', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=11
  ('Jurtschitsch', 'GrüVe', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=12
  ('Jurtschitsch', 'Grüner Veltliner Terrassen', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=12
  ('Jurtschitsch', 'Riesling Platin', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=12
  ('Jurtschitsch', 'Chardonnay Classic', 'Kamptal, Austria', 'Chardonnay', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=12
  ('Jurtschitsch', 'Rosé vom Zweigelt', 'Kamptal, Austria', 'Zweigelt', 'Rosé'),  -- https://www.jurtschitsch.com/show_content.php?hid=13
  ('Jurtschitsch', 'Zweigelt', 'Kamptal, Austria', 'Zweigelt', 'Red'),  -- https://www.jurtschitsch.com/show_content.php?hid=13
  ('Jurtschitsch', 'Rotspon Classic', 'Kamptal, Austria', null, 'Red'),  -- https://www.jurtschitsch.com/show_content.php?hid=13
  ('Jurtschitsch', 'Sankt Laurent Jungle', 'Kamptal, Austria', 'St. Laurent', 'Red'),  -- https://www.jurtschitsch.com/show_content.php?hid=13
  ('Jurtschitsch', 'Pinot Noir Langenlois', 'Kamptal, Austria', 'Pinot Noir', 'Red'),  -- https://www.jurtschitsch.com/show_content.php?hid=13
  ('Jurtschitsch', 'Rotspon Reserve', 'Kamptal, Austria', null, 'Red'),  -- https://www.jurtschitsch.com/show_content.php?hid=13
  ('Jurtschitsch', 'Pinot Noir Reserve', 'Kamptal, Austria', 'Pinot Noir', 'Red'),  -- https://www.jurtschitsch.com/show_content.php?hid=13
  ('Jurtschitsch', 'Tanzer Zweigelt Reserve', 'Kamptal, Austria', 'Zweigelt', 'Red'),  -- https://www.jurtschitsch.com/show_content.php?hid=13
  ('Jurtschitsch', 'Blanc de Noirs Sekt Große Reserve', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.jurtschitsch.com/show_content.php?hid=33
  ('Jurtschitsch', 'Brut Nature Große Reserve', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.jurtschitsch.com/show_content.php?hid=33
  ('Jurtschitsch', 'Blanc de Blancs', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.jurtschitsch.com/show_content.php?hid=33
  ('Jurtschitsch', 'Brut Rosé', 'Kamptal, Austria', null, 'Sparkling'),  -- https://www.jurtschitsch.com/show_content.php?hid=33
  ('Jurtschitsch', 'Riesling Permstein Spätlese', 'Kamptal, Austria', 'Riesling', 'Sweet'),  -- https://www.jurtschitsch.com/show_content.php?hid=29
  ('Jurtschitsch', 'GV Spiegel Auslese', 'Kamptal, Austria', 'Grüner Veltliner', 'Sweet'),  -- https://www.jurtschitsch.com/show_content.php?hid=29
  ('Jurtschitsch', 'GV Spiegel Beerenauslese', 'Kamptal, Austria', 'Grüner Veltliner', 'Sweet'),  -- https://www.jurtschitsch.com/show_content.php?hid=29
  ('Jurtschitsch', 'RR Heiligenstein Beerenauslese', 'Kamptal, Austria', 'Riesling', 'Sweet'),  -- https://www.jurtschitsch.com/show_content.php?hid=29
  ('Jurtschitsch', 'RR Loiserberg Trockenbeerenauslese', 'Kamptal, Austria', 'Riesling', 'Sweet'),  -- https://www.jurtschitsch.com/show_content.php?hid=29
  ('Jurtschitsch', 'Belle Naturelle Grüner Veltliner', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=27
  ('Jurtschitsch', 'Belle Naturelle Rosé', 'Kamptal, Austria', null, 'Rosé'),  -- https://www.jurtschitsch.com/show_content.php?hid=27
  ('Jurtschitsch', 'Mon Blanc', 'Kamptal, Austria', null, 'White'),  -- https://www.jurtschitsch.com/show_content.php?hid=27
  ('Jurtschitsch', 'Mon Rouge', 'Kamptal, Austria', null, 'Red')  -- https://www.jurtschitsch.com/show_content.php?hid=27
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NIGL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Nigl', 'Sekt Brut Rosé', 'Kremstal, Austria', null, 'Sparkling'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Sekt Brut', 'Kremstal, Austria', null, 'Sparkling'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Rosé', 'Kremstal, Austria', null, 'Rosé'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Grüner Veltliner Gärtling', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Grüner Veltliner Freiheit', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Grüner Veltliner Piri', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Grüner Veltliner Alte Reben', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Grüner Veltliner Pellingen Privat 1ÖTW', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Grüner Veltliner Kirchenberg 1ÖTW', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Grüner Veltliner Hommage Josef Nigl', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Riesling Urgestein', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Riesling Piri', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Riesling Goldberg 1ÖTW', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Riesling Hochäcker Privat 1ÖTW', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Gelber Muskateller', 'Kremstal, Austria', 'Gelber Muskateller', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Sauvignon Blanc', 'Kremstal, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Blauer Zweigelt Eichbaum', 'Kremstal, Austria', 'Zweigelt', 'Red'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Pinot Noir', 'Kremstal, Austria', 'Pinot Noir', 'Red'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Merlot', 'Kremstal, Austria', 'Merlot', 'Red'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Grüner Veltliner Eiswein', 'Kremstal, Austria', 'Grüner Veltliner', 'Sweet'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Gelber Muskateller Eiswein', 'Kremstal, Austria', 'Gelber Muskateller', 'Sweet'),  -- https://www.weingutnigl.at/de/weinshop.html
  ('Nigl', 'Riesling Trockenbeerenauslese', 'Kremstal, Austria', 'Riesling', 'Sweet')  -- https://www.weingutnigl.at/de/weinshop.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SALOMON UNDHOF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Salomon Undhof', 'Grüner Veltliner Ried Wachtberg Erste Lage', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Riesling Ried Kögl Erste Lage', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Grüner Veltliner Franciscus', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Grüner Veltliner Wieden', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Grüner Veltliner Ried Goldberg Alte Reben', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Grüner Veltliner Ried Lindberg Erste Lage Alte Reben', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Riesling Ried Pfaffenberg Erste Lage Alte Reben', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Riesling Ried Steiner Kögl Erste Lage Alte Reben', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Riesling Terrassen', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Riesling Stein a.d. Donau', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Grüner Veltliner HT Hochterrassen', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Fünferl Gemischter Satz', 'Kremstal, Austria', 'Gemischter Satz', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Gelber Muskateller', 'Kremstal, Austria', 'Gelber Muskateller', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Gelber Traminer Wildrosen', 'Kremstal, Austria', 'Gelber Traminer', 'White'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Riesling Wolke Für Zwei Pétillant Naturel', 'Kremstal, Austria', 'Riesling', 'Sparkling'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Rosé Brut Nature', 'Kremstal, Austria', null, 'Sparkling'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Riesling süße Biene Auslese', 'Kremstal, Austria', 'Riesling', 'Sweet'),  -- https://salomonwines.com/salomon-undhof/
  ('Salomon Undhof', 'Gelber Traminer Goldrosen Auslese', 'Kremstal, Austria', 'Gelber Traminer', 'Sweet')  -- https://salomonwines.com/salomon-undhof/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STADT KREMS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Stadt Krems', 'Riesling Ried Schreck 1ÖTW Kremstal DAC', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.weingutstadtkrems.at/shoperstelageweine
  ('Stadt Krems', 'Riesling Ried Grillenparz 1ÖTW Kremstal DAC', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.weingutstadtkrems.at/shoperstelageweine
  ('Stadt Krems', 'Grüner Veltliner Ried Lindberg 1ÖTW Kremstal DAC', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutstadtkrems.at/shoperstelageweine
  ('Stadt Krems', 'Grüner Veltliner Ried Wachtberg 1ÖTW Kremstal DAC', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutstadtkrems.at/shoperstelageweine
  ('Stadt Krems', 'Grüner Veltliner Ried Weinzierlberg 1ÖTW Kremstal DAC', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutstadtkrems.at/shoperstelageweine
  ('Stadt Krems', 'Grüner Veltliner Stein Kremstal DAC', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutstadtkrems.at/shoportsweine
  ('Stadt Krems', 'Grüner Veltliner Krems Kremstal DAC', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutstadtkrems.at/shoportsweine
  ('Stadt Krems', 'Riesling Stein Kremstal DAC', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.weingutstadtkrems.at/shoportsweine
  ('Stadt Krems', 'Grüner Veltliner Kremstal DAC', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingutstadtkrems.at/shopgebietsweine
  ('Stadt Krems', 'Riesling Steinterrassen Kremstal DAC', 'Kremstal, Austria', 'Riesling', 'White')  -- https://www.weingutstadtkrems.at/shopgebietsweine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HIEDLER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Hiedler', 'Grüner Veltliner Löss', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Grüner Veltliner Langenloiser Tonmineral', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Grüner Veltliner Ried Thal', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Grüner Veltliner Gipfelwein', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Grüner Veltliner Ried Kittmannsberg', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Grüner Veltliner Ried Schenkenbichl', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Grüner Veltliner Ried Käferberg', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Grüner Veltliner Maximum Alte Reben', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Grüner Veltliner FR Familienreserve', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Riesling Langenloiser Urgestein', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Riesling Ried Steinhaus', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Riesling Ried Gaisberg', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Riesling Ried Heiligenstein', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Riesling Maximum Alte Reben', 'Kamptal, Austria', 'Riesling', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Weißburgunder Kalksand', 'Kamptal, Austria', 'Weißburgunder', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Weißburgunder Maximum Alte Reben', 'Kamptal, Austria', 'Weißburgunder', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Weißburgunder Trockenbeerenauslese', 'Kamptal, Austria', 'Weißburgunder', 'Sweet'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Chardonnay Toasted & Unfiltered', 'Kamptal, Austria', 'Chardonnay', 'White'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Pinot Noir Mineral', 'Kamptal, Austria', 'Pinot Noir', 'Red'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Pinot Noir Käferberg Reserve', 'Kamptal, Austria', 'Pinot Noir', 'Red'),  -- https://hiedler.at/weine-und-shop/
  ('Hiedler', 'Pinot Noir G-Stück', 'Kamptal, Austria', 'Pinot Noir', 'Red')  -- https://hiedler.at/weine-und-shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STIFT GÖTTWEIG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Stift Göttweig', 'Riesling Ried Pfaffenberg', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/weingut-stift-gottweig
  ('Stift Göttweig', 'Riesling Ried Silberbichl 1ÖTW', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/weingut-stift-gottweig
  ('Stift Göttweig', 'Pinot Noir Göttweiger Berg', 'Kremstal, Austria', 'Pinot Noir', 'Red'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/weingut-stift-gottweig
  ('Stift Göttweig', 'Riesling Furth', 'Kremstal, Austria', 'Riesling', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/weingut-stift-gottweig
  ('Stift Göttweig', 'Grüner Veltliner Ried Gottschelle 1ÖTW', 'Kremstal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/weingut-stift-gottweig
  ('Stift Göttweig', 'Grüner Veltliner Messwein', 'Kremstal, Austria', 'Grüner Veltliner', 'White')  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/weingut-stift-gottweig
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAURENZ V. ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Laurenz V.', 'Grüner Veltliner Forbidden', 'Niederösterreich, Austria', 'Grüner Veltliner', 'White'),  -- https://www.laurenzfive.com/en/our-wines/
  ('Laurenz V.', 'Grüner Veltliner Singing', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.laurenzfive.com/en/our-wines/
  ('Laurenz V.', 'Grüner Veltliner Friendly', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.laurenzfive.com/en/our-wines/
  ('Laurenz V.', 'Grüner Veltliner Charming Reserve', 'Kamptal, Austria', 'Grüner Veltliner', 'White'),  -- https://www.laurenzfive.com/en/our-wines/
  ('Laurenz V.', 'Grüner Veltliner L5', 'Niederösterreich, Austria', 'Grüner Veltliner', 'White')  -- https://www.laurenzfive.com/en/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT PÖCKL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Pöckl', 'Admiral', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Merlot', 'Neusiedlersee, Austria', 'Merlot', 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Blaufränkisch Classique', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Chardonnay', 'Neusiedlersee, Austria', 'Chardonnay', 'White'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Frizzante Rosé', 'Neusiedlersee, Austria', null, 'Sparkling'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Pinot Noir Classique', 'Neusiedlersee, Austria', 'Pinot Noir', 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Pinot Noir Reserve', 'Neusiedlersee, Austria', 'Pinot Noir', 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Rêve de Jeunesse', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Rosso e Nero', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Sauvignon Blanc', 'Neusiedlersee, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Solo Rosso', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'St. Laurent Classique', 'Neusiedlersee, Austria', 'St. Laurent', 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Zweigelt', 'Neusiedlersee, Austria', 'Zweigelt', 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Zweigelt Classique', 'Neusiedlersee, Austria', 'Zweigelt', 'Red'),  -- https://www.poeckl.at/shop/
  ('Weingut Pöckl', 'Zweigelt Reserve Neusiedlersee DAC', 'Neusiedlersee, Austria', 'Zweigelt', 'Red')  -- https://www.poeckl.at/shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT PRIELER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Prieler', 'Pinot Blanc Schützen am Gebirge Ried Seeberg', 'Leithaberg, Austria', 'Pinot Blanc', 'White'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Pinot Blanc Leithaberg DAC Alte Reben', 'Leithaberg, Austria', 'Pinot Blanc', 'White'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Pinot Blanc Ried Haidsatz', 'Leithaberg, Austria', 'Pinot Blanc', 'White'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Pinot Blanc Ried Steinweingarten', 'Leithaberg, Austria', 'Pinot Blanc', 'White'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Blaufränkisch Oggau am Neusiedlersee Johanneshöhe', 'Leithaberg, Austria', 'Blaufränkisch', 'Red'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Blaufränkisch Leithaberg DAC Ried Pratschweingarten', 'Leithaberg, Austria', 'Blaufränkisch', 'Red'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Blaufränkisch Ried Marienthal', 'Leithaberg, Austria', 'Blaufränkisch', 'Red'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Blaufränkisch Ried Goldberg', 'Leithaberg, Austria', 'Blaufränkisch', 'Red'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Rosé vom Stein', 'Leithaberg, Austria', null, 'Rosé'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Gemischter Satz Kalkterrassen', 'Leithaberg, Austria', null, 'White'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Chardonnay Schützen am Gebirge Sinner', 'Leithaberg, Austria', 'Chardonnay', 'White'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Merlot Schützner Stein', 'Leithaberg, Austria', 'Merlot', 'Red'),  -- https://www.prieler.at/weine/
  ('Weingut Prieler', 'Sankt Laurent', 'Leithaberg, Austria', 'St. Laurent', 'Red')  -- https://www.prieler.at/weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT JOSEF UMATHUM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Josef Umathum', 'Auslese', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Beerenauslese', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Chablo', 'Neusiedlersee, Austria', null, 'White'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Gelber & Roter Traminer', 'Neusiedlersee, Austria', 'Traminer', 'White'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Grauer Burgunder', 'Neusiedlersee, Austria', 'Grauer Burgunder', 'White'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Grüner Veltliner', 'Neusiedlersee, Austria', 'Grüner Veltliner', 'White'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Königlicher Wein Historische Sorte', 'Neusiedlersee, Austria', null, 'White'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Sekt Brut Nature Méthode Traditionnelle', 'Neusiedlersee, Austria', null, 'Sparkling'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Vom Grauen Schiefer Grauer Burgunder', 'Neusiedlersee, Austria', 'Grauer Burgunder', 'White'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Welschriesling', 'Neusiedlersee, Austria', 'Welschriesling', 'White'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Blaufränkisch', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Haideboden', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Kirschgarten', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'PIRO', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Ried Hallebühl', 'Neusiedlersee, Austria', 'Zweigelt', 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Ried Kirchberg', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Rosa', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Sankt Laurent', 'Neusiedlersee, Austria', 'St. Laurent', 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Unter den Terrassen', 'Neusiedlersee, Austria', 'Pinot Noir', 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Vom Stein', 'Neusiedlersee, Austria', 'St. Laurent', 'Red'),  -- https://www.umathum.at/alle-weine/
  ('Weingut Josef Umathum', 'Zweigelt', 'Neusiedlersee, Austria', 'Zweigelt', 'Red')  -- https://www.umathum.at/alle-weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT FEILER-ARTINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Feiler-Artinger', 'Blaufränkisch', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Red'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Blaufränkisch Ried Ruster Ludmaisch Leithaberg DAC', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Red'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Blaufränkisch Ried Ruster Oberer Wald Leithaberg DAC', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Red'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Blaufränkisch Ried Ruster Umriss', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Red'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Cabernet Franc', 'Neusiedlersee, Austria', 'Cabernet Franc', 'Red'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Cabernet Sauvignon', 'Neusiedlersee, Austria', 'Cabernet Sauvignon', 'Red'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Chardonnay Leithaberg DAC', 'Neusiedlersee, Austria', 'Chardonnay', 'White'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Eiswein Gelber Muskateller', 'Neusiedlersee, Austria', 'Gelber Muskateller', 'Sweet'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Frizzante', 'Neusiedlersee, Austria', null, 'Sparkling'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Gustav', 'Neusiedlersee, Austria', null, 'White'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Neuburger Leithaberg DAC Ried Umriss', 'Neusiedlersee, Austria', 'Neuburger', 'White'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Muskat Ottonel halbtrocken', 'Neusiedlersee, Austria', 'Muskat Ottonel', 'White'),  -- https://www.feiler-artinger.at/shop/
  ('Weingut Feiler-Artinger', 'Neuburger Leithaberg DAC', 'Neusiedlersee, Austria', 'Neuburger', 'White'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'O.S. Olé Traminer', 'Neusiedlersee, Austria', 'Traminer', 'White'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'O.S. Olé Welschriesling', 'Neusiedlersee, Austria', 'Welschriesling', 'White'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'Pinot Blanc Leithaberg DAC', 'Neusiedlersee, Austria', 'Pinot Blanc', 'White'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'Pinot Noir Ried Ruster Gertberg', 'Neusiedlersee, Austria', 'Pinot Noir', 'Red'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'Quartett Spätlese', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'Rosé', 'Neusiedlersee, Austria', null, 'Rosé'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'Ruster Ausbruch DAC Essenz Ried Ruster Oberer Wald', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'Ruster Ausbruch DAC Essenz Weissburgunder', 'Neusiedlersee, Austria', 'Weissburgunder', 'Sweet'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'Ruster Ausbruch DAC Gelber Muskateller', 'Neusiedlersee, Austria', 'Gelber Muskateller', 'Sweet'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'Ruster Ausbruch DAC Pinot Cuvée', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.feiler-artinger.at/shop/page/2/
  ('Weingut Feiler-Artinger', 'Sekt Blaufränkisch Rosé', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Sparkling'),  -- https://www.feiler-artinger.at/shop/page/3/
  ('Weingut Feiler-Artinger', 'Solitaire', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.feiler-artinger.at/shop/page/3/
  ('Weingut Feiler-Artinger', 'Welschriesling', 'Neusiedlersee, Austria', 'Welschriesling', 'White'),  -- https://www.feiler-artinger.at/shop/page/3/
  ('Weingut Feiler-Artinger', 'Zweigelt', 'Neusiedlersee, Austria', 'Zweigelt', 'Red'),  -- https://www.feiler-artinger.at/shop/page/3/
  ('Weingut Feiler-Artinger', 'Zweigelt & More', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.feiler-artinger.at/shop/page/3/
  ('Weingut Feiler-Artinger', 'Zweigelt Beerenauslese', 'Neusiedlersee, Austria', 'Zweigelt', 'Sweet'),  -- https://www.feiler-artinger.at/shop/page/3/
  ('Weingut Feiler-Artinger', 'Zweigelt halbtrocken', 'Neusiedlersee, Austria', 'Zweigelt', 'Red')  -- https://www.feiler-artinger.at/shop/page/3/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT GESELLMANN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Gesellmann', 'G', 'Mittelburgenland, Austria', 'Blaufränkisch/St. Laurent', 'Red'),  -- https://www.gesellmann.at/shop/weine/g
  ('Weingut Gesellmann', 'Bela Rex', 'Mittelburgenland, Austria', null, 'Red'),  -- https://www.gesellmann.at/shop/weine/bela-rex
  ('Weingut Gesellmann', 'Opus Eximium', 'Mittelburgenland, Austria', 'Blaufränkisch/St. Laurent/Zweigelt', 'Red'),  -- https://www.gesellmann.at/shop/weine/opus-eximium
  ('Weingut Gesellmann', 'hochberc', 'Mittelburgenland, Austria', 'Blaufränkisch', 'Red'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'hochberc weiß Gemischter Satz', 'Mittelburgenland, Austria', null, 'White'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Merlot', 'Mittelburgenland, Austria', 'Merlot', 'Red'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Cabernet Sauvignon', 'Mittelburgenland, Austria', 'Cabernet Sauvignon', 'Red'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Pinot Noir Ried Siglos', 'Mittelburgenland, Austria', 'Pinot Noir', 'Red'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Syrah', 'Mittelburgenland, Austria', 'Syrah', 'Red'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Blaufränkisch Creitzer Reserve Mittelburgenland DAC', 'Mittelburgenland, Austria', 'Blaufränkisch', 'Red'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Blaufränkisch vom Lehm', 'Mittelburgenland, Austria', 'Blaufränkisch', 'Red'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'zb', 'Mittelburgenland, Austria', 'Zweigelt/Blaufränkisch', 'Red'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Zweigelt', 'Mittelburgenland, Austria', 'Zweigelt', 'Red'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Chardonnay Ried Steinriegel', 'Mittelburgenland, Austria', 'Chardonnay', 'White'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Chardonnay', 'Mittelburgenland, Austria', 'Chardonnay', 'White'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Cuvée Auri', 'Mittelburgenland, Austria', 'Chardonnay/Sauvignon Blanc', 'White'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Grüner Veltliner', 'Mittelburgenland, Austria', 'Grüner Veltliner', 'White'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Sauvignon Blanc', 'Mittelburgenland, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Blaufränkisch Rosé Brut', 'Mittelburgenland, Austria', 'Blaufränkisch', 'Sparkling'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'TBA Sämling', 'Mittelburgenland, Austria', 'Sämling', 'Sweet'),  -- https://www.gesellmann.at/shop
  ('Weingut Gesellmann', 'Beerenauslese Sämling', 'Mittelburgenland, Austria', 'Sämling', 'Sweet')  -- https://www.gesellmann.at/shop
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KRACHER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Kracher', 'Spätlese Rosé', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Spätlese Cuvée', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Spätlese Rot', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Auslese Traminer', 'Neusiedlersee, Austria', 'Traminer', 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Auslese Muskat Ottonel', 'Neusiedlersee, Austria', 'Muskat Ottonel', 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Auslese Cuvée', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Auslese Zweigelt', 'Neusiedlersee, Austria', 'Zweigelt', 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Cuvée Beerenauslese', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Zweigelt Beerenauslese', 'Neusiedlersee, Austria', 'Zweigelt', 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Red Roses Beerenauslese', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Noble', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'Ice Wine', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.kracher.at/weine/suessweine
  ('Kracher', 'TBA Traminer Nouvelle Vague', 'Neusiedlersee, Austria', 'Traminer', 'Sweet'),  -- https://www.kracher.at/weine/kollektion_2021
  ('Kracher', 'TBA Zweigelt Nouvelle Vague', 'Neusiedlersee, Austria', 'Zweigelt', 'Sweet'),  -- https://www.kracher.at/weine/kollektion_2021
  ('Kracher', 'TBA Grande Cuvée Nouvelle Vague', 'Neusiedlersee, Austria', null, 'Sweet'),  -- https://www.kracher.at/weine/kollektion_2021
  ('Kracher', 'TBA Rosenmuskateller Nouvelle Vague', 'Neusiedlersee, Austria', 'Rosenmuskateller', 'Sweet'),  -- https://www.kracher.at/weine/kollektion_2021
  ('Kracher', 'TBA Scheurebe Zwischen den Seen', 'Neusiedlersee, Austria', 'Scheurebe', 'Sweet'),  -- https://www.kracher.at/weine/kollektion_2021
  ('Kracher', 'TBA Welschriesling Zwischen den Seen', 'Neusiedlersee, Austria', 'Welschriesling', 'Sweet'),  -- https://www.kracher.at/weine/kollektion_2021
  ('Kracher', 'TBA Muskat Ottonel Zwischen den Seen', 'Neusiedlersee, Austria', 'Muskat Ottonel', 'Sweet'),  -- https://www.kracher.at/weine/kollektion_2021_1_1
  ('Kracher', 'TBA Chardonnay Nouvelle Vague', 'Neusiedlersee, Austria', 'Chardonnay', 'Sweet'),  -- https://www.kracher.at/weine/kollektion_2021_1_1
  ('Kracher', 'Chardonnay Blick', 'Neusiedlersee, Austria', 'Chardonnay', 'White'),  -- https://www.kracher.at/weine/weissweine
  ('Kracher', 'Chardonnay Kreuz', 'Neusiedlersee, Austria', 'Chardonnay', 'White'),  -- https://www.kracher.at/weine/weissweine
  ('Kracher', 'K Cuvée', 'Neusiedlersee, Austria', null, 'White'),  -- https://www.kracher.at/weine/weissweine
  ('Kracher', 'Pinot Gris Reserve', 'Neusiedlersee, Austria', 'Pinot Gris', 'White'),  -- https://www.kracher.at/weine/weissweine
  ('Kracher', 'Pinot Gris', 'Neusiedlersee, Austria', 'Pinot Gris', 'White'),  -- https://www.kracher.at/weine/weissweine
  ('Kracher', 'Welschriesling', 'Neusiedlersee, Austria', 'Welschriesling', 'White'),  -- https://www.kracher.at/weine/weissweine
  ('Kracher', 'Grüner Veltliner Burgenland', 'Neusiedlersee, Austria', 'Grüner Veltliner', 'White'),  -- https://www.kracher.at/weine/weissweine
  ('Kracher', 'Blend I', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.kracher.at/weine/rotweine
  ('Kracher', 'Blend II', 'Neusiedlersee, Austria', null, 'Red'),  -- https://www.kracher.at/weine/rotweine
  ('Kracher', 'Zweigelt', 'Neusiedlersee, Austria', 'Zweigelt', 'Red'),  -- https://www.kracher.at/weine/rotweine
  ('Kracher', 'Brut Rosé', 'Neusiedlersee, Austria', null, 'Sparkling'),  -- https://www.kracher.at/weine/brut
  ('Kracher', 'Zweigelt Rosé', 'Neusiedlersee, Austria', 'Zweigelt', 'Rosé')  -- https://www.kracher.at/weine/roseweine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT HANS & ANITA NITTNAUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Hans & Anita Nittnaus', 'Blaufränkisch Ried Altenberg Leithaberg DAC', 'Leithaberg, Austria', 'Blaufränkisch', 'Red'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Blaufränkisch Ried Lange Ohn Leithaberg DAC', 'Leithaberg, Austria', 'Blaufränkisch', 'Red'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Blaufränkisch Ried Jungenberg Leithaberg DAC', 'Leithaberg, Austria', 'Blaufränkisch', 'Red'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Blaufränkisch Ried Gritschenberg Leithaberg DAC', 'Leithaberg, Austria', 'Blaufränkisch', 'Red'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Chardonnay Ried Freudshofer Leithaberg DAC', 'Leithaberg, Austria', 'Chardonnay', 'White'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Chardonnay Ried Bergschmallister Leithaberg DAC', 'Leithaberg, Austria', 'Chardonnay', 'White'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Blaufränkisch Arktika Perlwein', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Sparkling'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'St. Laurent Arktika Perlwein', 'Neusiedlersee, Austria', 'St. Laurent', 'Sparkling'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Blaufränkisch Manila', 'Neusiedlersee, Austria', 'Blaufränkisch', 'Red'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Manila Weiß', 'Neusiedlersee, Austria', null, 'White'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Grüner Veltliner Elektra', 'Neusiedlersee, Austria', 'Grüner Veltliner', 'White'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Furmint', 'Neusiedlersee, Austria', 'Furmint', 'White'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Kalk & Schiefer Weiß', 'Neusiedlersee, Austria', null, 'White'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Heideboden', 'Neusiedlersee, Austria', 'Zweigelt/Blaufränkisch/Merlot', 'Red'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Tochter Weiss', 'Neusiedlersee, Austria', null, 'White'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Comondor', 'Neusiedlersee, Austria', null, 'Red'),  -- https://nittnaus.shop/
  ('Weingut Hans & Anita Nittnaus', 'Pannobile', 'Neusiedlersee, Austria', null, 'Red'),  -- https://nittnaus.wine/pannobile/
  ('Weingut Hans & Anita Nittnaus', 'Zorra Rosé', 'Neusiedlersee, Austria', null, 'Rosé')  -- https://nittnaus.shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MORIC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Moric', 'Blaufränkisch Burgenland', 'Burgenland, Austria', 'Blaufränkisch', 'Red'),  -- https://www.bbr.com/products-20218236421-2021-blaufrankisch-moric-burgenland-austria
  ('Moric', 'Blaufränkisch Lutzmannsburg Alte Reben', 'Burgenland, Austria', 'Blaufränkisch', 'Red'),  -- https://www.meinlamgraben.eu/shop/en/moric-bf-lutzmannsburg-alte-reben-21
  ('Moric', 'Blaufränkisch Ried Maissner Lutzmannsburg', 'Burgenland, Austria', 'Blaufränkisch', 'Red'),  -- https://www.meinlamgraben.eu/shop/en/moric-bf-lutzmannsburg-maissner-21
  ('Moric', 'Blaufränkisch Ried Schwemmer Lutzmannsburg', 'Burgenland, Austria', 'Blaufränkisch', 'Red'),  -- https://www.meinlamgraben.eu/shop/en/moric-bf-schwemmer-21
  ('Moric', 'Blaufränkisch Neckenmarkt Alte Reben', 'Burgenland, Austria', 'Blaufränkisch', 'Red')  -- https://www.meinlamgraben.eu/shop/en/moric-bf-schwemmer-21
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WIENINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Wieninger', 'Ried Herrnholz Grüner Veltliner', 'Vienna, Austria', 'Grüner Veltliner', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-lagenweine/
  ('Wieninger', 'Ried Falkenberg 1ÖTW Wiener Gemischter Satz DAC', 'Vienna, Austria', 'Gemischter Satz', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-lagenweine/
  ('Wieninger', 'Ried Ulm 1ÖTW Nussberg Wiener Gemischter Satz DAC', 'Vienna, Austria', 'Gemischter Satz', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-lagenweine/
  ('Wieninger', 'Ried Kaasgraben Grüner Veltliner', 'Vienna, Austria', 'Grüner Veltliner', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-lagenweine/
  ('Wieninger', 'Ried Preussen 1ÖTW Grüner Veltliner', 'Vienna, Austria', 'Grüner Veltliner', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-lagenweine/
  ('Wieninger', 'Ried Preussen 1ÖTW Riesling', 'Vienna, Austria', 'Riesling', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-lagenweine/
  ('Wieninger', 'Ried Rosengartel 1ÖTW Riesling', 'Vienna, Austria', 'Riesling', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-lagenweine/
  ('Wieninger', 'Bisamberg Grüner Veltliner', 'Vienna, Austria', 'Grüner Veltliner', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-ortsweine/
  ('Wieninger', 'Nussberg Grüner Veltliner', 'Vienna, Austria', 'Grüner Veltliner', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-ortsweine/
  ('Wieninger', 'Nussberg Riesling', 'Vienna, Austria', 'Riesling', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-ortsweine/
  ('Wieninger', 'Bisamberg Wiener Gemischter Satz DAC', 'Vienna, Austria', 'Gemischter Satz', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-ortsweine/
  ('Wieninger', 'Wiener Grüner Veltliner', 'Vienna, Austria', 'Grüner Veltliner', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-gebietsweine/
  ('Wieninger', 'Wiener Gemischter Satz DAC', 'Vienna, Austria', 'Gemischter Satz', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-gebietsweine/
  ('Wieninger', 'Wiener Riesling', 'Vienna, Austria', 'Riesling', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-gebietsweine/
  ('Wieninger', 'Wiener Chardonnay', 'Vienna, Austria', 'Chardonnay', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-gebietsweine/
  ('Wieninger', 'Wiener Muskateller', 'Vienna, Austria', 'Muskateller', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/wiener-gebietsweine/
  ('Wieninger', 'Chardonnay Select', 'Vienna, Austria', 'Chardonnay', 'White'),  -- https://www.wieninger.at/produkt-kategorie/weine/chardonnay-pinot-noir-rotweincuvees/
  ('Wieninger', 'Pinot Noir Select', 'Vienna, Austria', 'Pinot Noir', 'Red'),  -- https://www.wieninger.at/produkt-kategorie/weine/chardonnay-pinot-noir-rotweincuvees/
  ('Wieninger', 'Wiener Trilogie', 'Vienna, Austria', 'Zweigelt/Merlot/Cabernet Sauvignon', 'Red'),  -- https://www.wieninger.at/produkt/wiener-trilogie/
  ('Wieninger', 'St. Laurent Grand Select', 'Vienna, Austria', 'St. Laurent', 'Red'),  -- https://www.wieninger.at/produkt-kategorie/weine/chardonnay-pinot-noir-rotweincuvees/
  ('Wieninger', 'Merlot Grand Select', 'Vienna, Austria', 'Merlot', 'Red'),  -- https://www.wieninger.at/produkt-kategorie/weine/chardonnay-pinot-noir-rotweincuvees/
  ('Wieninger', 'Danubis Grand Select', 'Vienna, Austria', 'Cabernet Sauvignon/Merlot/Zweigelt', 'Red'),  -- https://www.wieninger.at/produkt/danubis-grand-select/
  ('Wieninger', 'Große Reserve Blanc de Blanc Sekt Wien Brut Nature', 'Vienna, Austria', null, 'Sparkling'),  -- https://www.wieninger.at/produkt-kategorie/prickelnd-suesswein-traubensaft/
  ('Wieninger', 'Cuvée Katharina Rosé Sekt', 'Vienna, Austria', null, 'Sparkling')  -- https://www.wieninger.at/produkt-kategorie/prickelnd-suesswein-traubensaft/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GROSS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Gross', 'Sauvignon Blanc Ried Obere Ranz', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Weißburgunder Ried Nussberg Stauder Große STK Ried', 'Südsteiermark, Austria', 'Weißburgunder', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Morillon Ried Nussberg Preschnigg Große STK Ried', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Sauvignon Blanc Ried Nussberg Große STK Ried', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Welschriesling Pro. Steirerland', 'Südsteiermark, Austria', 'Welschriesling', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Gelber Muskateller Ried Perz Erste STK Ried', 'Südsteiermark, Austria', 'Gelber Muskateller', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Sauvignon Blanc Ried Sulz Erste STK Ried', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Privat Sauvignon Blanc', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Weißburgunder Ried Bärenburg', 'Südsteiermark, Austria', 'Weißburgunder', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Welschriesling Trockenbeerenauslese', 'Südsteiermark, Austria', 'Welschriesling', 'Sweet'),  -- https://www.gross.at/shop/
  ('Gross', 'Morillon Ehrenhausen', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Sauvignon Blanc Südsteiermark DAC', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Jakobi Südsteiermark DAC', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Mitzi Südsteiermark DAC', 'Südsteiermark, Austria', 'Gelber Muskateller', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Gelber Muskateller Gamlitz', 'Südsteiermark, Austria', 'Gelber Muskateller', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Bergwein Südsteiermark DAC', 'Südsteiermark, Austria', null, 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Sauvignon Blanc Gamlitz', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Weißburgunder Ehrenhausen', 'Südsteiermark, Austria', 'Weißburgunder', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Sauvignon Blanc Eremit WhB Historischer Doppelbesitz', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Gelber Muskateller Südsteiermark DAC', 'Südsteiermark, Austria', 'Gelber Muskateller', 'White'),  -- https://www.gross.at/shop/
  ('Gross', 'Vintage Sekt Austria Große Reserve Ehrenhausen', 'Südsteiermark, Austria', null, 'Sparkling')  -- https://www.gross.at/shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT FRITSCH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Fritsch', 'Süßstoff Riesling Kabi-Style', 'Wagram, Austria', 'Riesling', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Riesling Ried Mordthal 1ÖTW', 'Wagram, Austria', 'Riesling', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Roter Veltliner Ried Steinberg 1ÖTW', 'Wagram, Austria', 'Roter Veltliner', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Grüner Veltliner Ried Schlossberg 1ÖTW', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Grüner Veltliner Ried Steinberg 1ÖTW', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Wagram Rosé', 'Wagram, Austria', null, 'Rosé'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Wagram Grüner Veltliner', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Wagram Roter Veltliner', 'Wagram, Austria', 'Roter Veltliner', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Wagram Riesling', 'Wagram, Austria', 'Riesling', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Kirchberg Grüner Veltliner', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Ruppersthal Pinot Noir', 'Wagram, Austria', 'Pinot Noir', 'Red'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Pinot Noir P', 'Wagram, Austria', 'Pinot Noir', 'Red'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Foggathal No.24', 'Wagram, Austria', 'Zweigelt/Cabernet Sauvignon', 'Red'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Pet Nat Rosé Purist', 'Wagram, Austria', null, 'Sparkling'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Materia Prima', 'Wagram, Austria', 'Grüner Veltliner/Traminer', 'White'),  -- https://www.fritsch.cc/alleweine?lang=en
  ('Weingut Fritsch', 'Tausend Weiss', 'Wagram, Austria', null, 'White')  -- https://www.fritsch.cc/alleweine?lang=en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT LETH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Leth', 'Grüner Veltliner Ried Schafflerberg', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/lagenweine-erste-lage/
  ('Weingut Leth', 'Grüner Veltliner Ried Brunnthal', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/lagenweine-erste-lage/
  ('Weingut Leth', 'Grüner Veltliner Ried Scheiben', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/lagenweine-erste-lage/
  ('Weingut Leth', 'Grüner Veltliner Ried Spiegel', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/lagenweine-erste-lage/
  ('Weingut Leth', 'Roter Veltliner Ried Fumberg', 'Wagram, Austria', 'Roter Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/lagenweine-erste-lage/
  ('Weingut Leth', 'Roter Veltliner Ried Scheiben', 'Wagram, Austria', 'Roter Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/lagenweine-erste-lage/
  ('Weingut Leth', 'Riesling Ried Schillingsberg', 'Wagram, Austria', 'Riesling', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/lagenweine-erste-lage/
  ('Weingut Leth', 'Riesling Ried Brunnthal', 'Wagram, Austria', 'Riesling', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/lagenweine-erste-lage/
  ('Weingut Leth', 'Blauer Zweigelt Klassik', 'Wagram, Austria', 'Zweigelt', 'Red'),  -- https://www.weingut-leth.at/weine-kategorie/rotweine/
  ('Weingut Leth', 'Blauer Zweigelt Reserve', 'Wagram, Austria', 'Zweigelt', 'Red'),  -- https://www.weingut-leth.at/weine-kategorie/rotweine/
  ('Weingut Leth', 'St. Laurent Reserve', 'Wagram, Austria', 'St. Laurent', 'Red'),  -- https://www.weingut-leth.at/weine-kategorie/rotweine/
  ('Weingut Leth', 'Cabernet Sauvignon Reserve', 'Wagram, Austria', 'Cabernet Sauvignon', 'Red'),  -- https://www.weingut-leth.at/weine-kategorie/rotweine/
  ('Weingut Leth', 'Pinot Noir Reserve', 'Wagram, Austria', 'Pinot Noir', 'Red'),  -- https://www.weingut-leth.at/weine-kategorie/rotweine/
  ('Weingut Leth', 'Pinot Noir Grande Reserve', 'Wagram, Austria', 'Pinot Noir', 'Red'),  -- https://www.weingut-leth.at/weine-kategorie/rotweine/
  ('Weingut Leth', 'Gigama Zweigelt Grande Reserve', 'Wagram, Austria', 'Zweigelt', 'Red'),  -- https://www.weingut-leth.at/weine-kategorie/rotweine/
  ('Weingut Leth', 'Roter Veltliner Reserve Brut', 'Wagram, Austria', 'Roter Veltliner', 'Sparkling'),  -- https://www.weingut-leth.at/weine-kategorie/sekt-schaumwein/
  ('Weingut Leth', 'Pinot Rosé Reserve Brut', 'Wagram, Austria', null, 'Sparkling'),  -- https://www.weingut-leth.at/weine-kategorie/sekt-schaumwein/
  ('Weingut Leth', 'Blanc de Noirs Große Reserve Brut', 'Wagram, Austria', null, 'Sparkling'),  -- https://www.weingut-leth.at/weine-kategorie/sekt-schaumwein/
  ('Weingut Leth', 'Blanc de Blancs Grosse Reserve Brut Nature', 'Wagram, Austria', null, 'Sparkling'),  -- https://www.weingut-leth.at/weine-kategorie/sekt-schaumwein/
  ('Weingut Leth', 'My dear! Pet.Nat. Rosé', 'Wagram, Austria', null, 'Sparkling'),  -- https://www.weingut-leth.at/weine-kategorie/sekt-schaumwein/
  ('Weingut Leth', 'Weissburgunder Reserve', 'Wagram, Austria', 'Weissburgunder', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/spezialitaeten/
  ('Weingut Leth', 'Chardonnay Grande Reserve', 'Wagram, Austria', 'Chardonnay', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/spezialitaeten/
  ('Weingut Leth', 'Gigama Grande Reserve Grüner Veltliner', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/spezialitaeten/
  ('Weingut Leth', 'Riesling S', 'Wagram, Austria', 'Riesling', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/spezialitaeten/
  ('Weingut Leth', 'Roter Veltliner Beerenauslese', 'Wagram, Austria', 'Roter Veltliner', 'Sweet'),  -- https://www.weingut-leth.at/weine-kategorie/spezialitaeten/
  ('Weingut Leth', 'Herrn Greanz Orange', 'Wagram, Austria', null, 'Orange'),  -- https://www.weingut-leth.at/weine-kategorie/spezialitaeten/
  ('Weingut Leth', 'Fels Grüner Veltliner Klassik', 'Wagram, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/weissweine-klassik/
  ('Weingut Leth', 'Fels Roter Veltliner Klassik', 'Wagram, Austria', 'Roter Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/weissweine-klassik/
  ('Weingut Leth', 'Fels Riesling Klassik', 'Wagram, Austria', 'Riesling', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/weissweine-klassik/
  ('Weingut Leth', 'Grüner Veltliner Young & Fresh', 'Niederösterreich, Austria', 'Grüner Veltliner', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/young-fresh/
  ('Weingut Leth', 'Gelber Muskateller', 'Niederösterreich, Austria', 'Gelber Muskateller', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/young-fresh/
  ('Weingut Leth', 'Sauvignon Blanc', 'Niederösterreich, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.weingut-leth.at/weine-kategorie/young-fresh/
  ('Weingut Leth', 'Zweigelt Rosé', 'Niederösterreich, Austria', 'Zweigelt', 'Rosé')  -- https://www.weingut-leth.at/weine-kategorie/young-fresh/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WEINGUT MARKOWITSCH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Weingut Markowitsch', 'Ried Rosenberg', 'Carnuntum, Austria', 'Zweigelt/Blaufränkisch/Merlot', 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Ried Kirchweingarten', 'Carnuntum, Austria', 'Zweigelt', 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Ried Bärnreiser', 'Carnuntum, Austria', 'Blaufränkisch', 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Ried Schüttenberg', 'Carnuntum, Austria', 'Chardonnay', 'White'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Pinot Noir Reserve', 'Carnuntum, Austria', 'Pinot Noir', 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'M1', 'Carnuntum, Austria', 'Merlot/Blaufränkisch/Cabernet Franc', 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Göttlesbrunn Weiss', 'Carnuntum, Austria', 'Chardonnay', 'White'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Göttlesbrunn Redmont', 'Carnuntum, Austria', 'Zweigelt/Blaufränkisch', 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Prellenkirchen Blaufränkisch', 'Carnuntum, Austria', 'Blaufränkisch', 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Prellenkirchen Weißburgunder', 'Carnuntum, Austria', 'Weißburgunder', 'White'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Mardonna Rosé', 'Carnuntum, Austria', 'Blaufränkisch', 'Rosé'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Pinot Noir', 'Carnuntum, Austria', 'Pinot Noir', 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Rubin Carnuntum', 'Carnuntum, Austria', null, 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Blaufränkisch', 'Carnuntum, Austria', 'Blaufränkisch', 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Carnuntum Rot', 'Carnuntum, Austria', null, 'Red'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Rosé', 'Carnuntum, Austria', null, 'Rosé'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Grüner Veltliner Alte Reben', 'Carnuntum, Austria', 'Grüner Veltliner', 'White'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Sauvignon Blanc', 'Carnuntum, Austria', 'Sauvignon Blanc', 'White'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Chardonnay', 'Carnuntum, Austria', 'Chardonnay', 'White'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Grüner Veltliner', 'Carnuntum, Austria', 'Grüner Veltliner', 'White'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Pet Nat Blanc de Blancs', 'Carnuntum, Austria', 'Chardonnay/Weißburgunder', 'Sparkling'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Pet Nat Blanc de Noir Rosé', 'Carnuntum, Austria', 'Pinot Noir/St. Laurent', 'Sparkling'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Kabi Muskateller', 'Carnuntum, Austria', 'Muskateller', 'White'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Muskateller Halligalli', 'Carnuntum, Austria', 'Gelber Muskateller', 'White'),  -- https://www.markowitsch.at/shop/
  ('Weingut Markowitsch', 'Rosé Halligalli', 'Carnuntum, Austria', 'Pinot Noir/St. Laurent', 'Rosé')  -- https://www.markowitsch.at/shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PFAFFL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Pfaffl', 'Secco Blanc', 'Weinviertel, Austria', null, 'Sparkling'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Secco Rosé', 'Weinviertel, Austria', null, 'Sparkling'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Grüner Veltliner Brut', 'Weinviertel, Austria', 'Grüner Veltliner', 'Sparkling'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Ganz Zart Rosé', 'Weinviertel, Austria', null, 'Rosé'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Hasen Rosé', 'Weinviertel, Austria', null, 'Rosé'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'La Grande Rosé', 'Weinviertel, Austria', null, 'Rosé'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Vom Haus Grüner Veltliner', 'Weinviertel, Austria', 'Grüner Veltliner', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Ganz Zart', 'Weinviertel, Austria', null, 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Junior', 'Weinviertel, Austria', null, 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Harmony Gemischter Satz', 'Weinviertel, Austria', 'Gemischter Satz', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Zeisen Grüner Veltliner', 'Weinviertel, Austria', 'Grüner Veltliner', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Haiden Grüner Veltliner', 'Weinviertel, Austria', 'Grüner Veltliner', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Hund Grüner Veltliner', 'Weinviertel, Austria', 'Grüner Veltliner', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Golden Grüner Veltliner', 'Weinviertel, Austria', 'Grüner Veltliner', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Hommage Grüner Veltliner', 'Weinviertel, Austria', 'Grüner Veltliner', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Sand Muskateller', 'Weinviertel, Austria', 'Muskateller', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Juwel Muskateller Reserve', 'Weinviertel, Austria', 'Muskateller', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Terroir Sauvignon Blanc', 'Weinviertel, Austria', 'Sauvignon Blanc', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'La Vita Grauburgunder', 'Weinviertel, Austria', 'Grauburgunder', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Nuss Weissburgunder', 'Weinviertel, Austria', 'Weissburgunder', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Sonne Riesling', 'Weinviertel, Austria', 'Riesling', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Passion Riesling Reserve', 'Weinviertel, Austria', 'Riesling', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Exklusiv Chardonnay', 'Weinviertel, Austria', 'Chardonnay', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Vision Chardonnay Reserve', 'Weinviertel, Austria', 'Chardonnay', 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Vom Haus Zweigelt', 'Weinviertel, Austria', 'Zweigelt', 'Red'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Sandstein Zweigelt', 'Weinviertel, Austria', 'Zweigelt', 'Red'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Wald St. Laurent', 'Weinviertel, Austria', 'St. Laurent', 'Red'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Privat Cuvée', 'Weinviertel, Austria', null, 'Red'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Pinot Noir Reserve', 'Weinviertel, Austria', 'Pinot Noir', 'Red'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Alten St. Laurent Reserve', 'Weinviertel, Austria', 'St. Laurent', 'Red'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Burg Zweigelt Reserve', 'Weinviertel, Austria', 'Zweigelt', 'Red'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Excellent Reserve', 'Weinviertel, Austria', null, 'Red'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Heidrom Grand Reserve', 'Weinviertel, Austria', null, 'Red'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Wien.1', 'Vienna, Austria', null, 'White'),  -- https://pfaffl.at/produktblaetter/
  ('Pfaffl', 'Wien.2', 'Vienna, Austria', null, 'Red')  -- https://pfaffl.at/produktblaetter/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- POLZ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_austria.sql)'
from (values
  ('Polz', 'Sauvignon Blanc Südsteiermark DAC', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://weingutpolz.at/
  ('Polz', 'Weissburgunder Südsteiermark DAC', 'Südsteiermark, Austria', 'Weissburgunder', 'White'),  -- https://weingutpolz.at/
  ('Polz', 'Gelber Muskateller Südsteiermark DAC', 'Südsteiermark, Austria', 'Gelber Muskateller', 'White'),  -- https://weingutpolz.at/
  ('Polz', 'Morillon Südsteiermark DAC', 'Südsteiermark, Austria', 'Chardonnay', 'White'),  -- https://weingutpolz.at/
  ('Polz', 'Welschriesling Südsteiermark DAC', 'Südsteiermark, Austria', 'Welschriesling', 'White'),  -- https://weingutpolz.at/
  ('Polz', 'Grauer Burgunder Südsteiermark DAC', 'Südsteiermark, Austria', 'Grauburgunder', 'White'),  -- https://weingutpolz.at/
  ('Polz', 'Sauvignon Blanc Ried Theresienhöhe Therese Erste STK Lage', 'Südsteiermark, Austria', 'Sauvignon Blanc', 'White'),  -- https://weingutpolz.at/
  ('Polz', 'Brut Rosé Naturherb Grosse Reserve', 'Südsteiermark, Austria', null, 'Sparkling'),  -- https://weingutpolz.at/collections/rotwein
  ('Polz', 'Brut Rosé Extraherb Reserve', 'Südsteiermark, Austria', null, 'Sparkling'),  -- https://weingutpolz.at/collections/rotwein
  ('Polz', 'Pinot Noir Ried Steinbach', 'Südsteiermark, Austria', 'Pinot Noir', 'Red'),  -- https://weingutpolz.at/collections/rotwein
  ('Polz', 'Urbani', 'Südsteiermark, Austria', null, 'Red'),  -- https://weingutpolz.at/collections/rotwein
  ('Polz', 'Zweigelt', 'Südsteiermark, Austria', 'Zweigelt', 'Red')  -- https://weingutpolz.at/collections/rotwein
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
