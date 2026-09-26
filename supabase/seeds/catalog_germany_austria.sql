-- ============================================================================
-- wines_catalog seed — Germany + Austria
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent (search_key trigger + ON CONFLICT
-- DO NOTHING + mig-102 merge key). Real producers + flagship vineyard bottlings.
-- Riesling vineyard names (e.g. Wehlener Sonnenuhr) are kept as the cuvée.
-- ============================================================================

-- ---- GERMANY ---------------------------------------------------------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  -- Mosel
  ('Egon Müller', 'Scharzhofberger Riesling Kabinett', 'Mosel', 'Riesling', 'White'),
  ('Egon Müller', 'Scharzhofberger Riesling Spätlese', 'Mosel', 'Riesling', 'White'),
  ('Egon Müller', 'Scharzhofberger Riesling Auslese', 'Mosel', 'Riesling', 'White'),
  ('J.J. Prüm', 'Wehlener Sonnenuhr Riesling Kabinett', 'Mosel', 'Riesling', 'White'),
  ('J.J. Prüm', 'Wehlener Sonnenuhr Riesling Spätlese', 'Mosel', 'Riesling', 'White'),
  ('J.J. Prüm', 'Wehlener Sonnenuhr Riesling Auslese', 'Mosel', 'Riesling', 'White'),
  ('J.J. Prüm', 'Graacher Himmelreich Riesling Spätlese', 'Mosel', 'Riesling', 'White'),
  ('Fritz Haag', 'Brauneberger Juffer-Sonnenuhr Riesling Spätlese', 'Mosel', 'Riesling', 'White'),
  ('Willi Schaefer', 'Graacher Domprobst Riesling Spätlese', 'Mosel', 'Riesling', 'White'),
  ('Willi Schaefer', 'Graacher Himmelreich Riesling Kabinett', 'Mosel', 'Riesling', 'White'),
  ('Dr. Loosen', 'Wehlener Sonnenuhr Riesling', 'Mosel', 'Riesling', 'White'),
  ('Dr. Loosen', 'Ürziger Würzgarten Riesling', 'Mosel', 'Riesling', 'White'),
  ('Dr. Loosen', 'Erdener Prälat Riesling Auslese', 'Mosel', 'Riesling', 'White'),
  ('Selbach-Oster', 'Zeltinger Sonnenuhr Riesling Spätlese', 'Mosel', 'Riesling', 'White'),
  ('Markus Molitor', 'Zeltinger Sonnenuhr Riesling', 'Mosel', 'Riesling', 'White'),
  -- Nahe
  ('Dönnhoff', 'Hermannshöhle Riesling GG', 'Nahe', 'Riesling', 'White'),
  ('Dönnhoff', 'Dellchen Riesling GG', 'Nahe', 'Riesling', 'White'),
  ('Dönnhoff', 'Oberhäuser Brücke Riesling Spätlese', 'Nahe', 'Riesling', 'White'),
  ('Emrich-Schönleber', 'Halenberg Riesling GG', 'Nahe', 'Riesling', 'White'),
  ('Emrich-Schönleber', 'Frühlingsplätzchen Riesling GG', 'Nahe', 'Riesling', 'White'),
  -- Rheingau
  ('Robert Weil', 'Kiedrich Gräfenberg Riesling GG', 'Rheingau', 'Riesling', 'White'),
  ('Robert Weil', 'Kiedrich Turmberg Riesling', 'Rheingau', 'Riesling', 'White'),
  ('Georg Breuer', 'Berg Schlossberg Riesling', 'Rheingau', 'Riesling', 'White'),
  ('Georg Breuer', 'Berg Rottland Riesling', 'Rheingau', 'Riesling', 'White'),
  ('Leitz', 'Berg Schlossberg Riesling GG', 'Rheingau', 'Riesling', 'White'),
  -- Rheinhessen
  ('Keller', 'G-Max Riesling', 'Rheinhessen', 'Riesling', 'White'),
  ('Keller', 'Kirchspiel Riesling GG', 'Rheinhessen', 'Riesling', 'White'),
  ('Keller', 'Morstein Riesling GG', 'Rheinhessen', 'Riesling', 'White'),
  ('Keller', 'Abtserde Riesling GG', 'Rheinhessen', 'Riesling', 'White'),
  ('Wittmann', 'Morstein Riesling GG', 'Rheinhessen', 'Riesling', 'White'),
  ('Wittmann', 'Kirchspiel Riesling GG', 'Rheinhessen', 'Riesling', 'White'),
  ('Gunderloch', 'Nackenheim Rothenberg Riesling GG', 'Rheinhessen', 'Riesling', 'White'),
  -- Pfalz
  ('Müller-Catoir', 'Bürgergarten Riesling', 'Pfalz', 'Riesling', 'White'),
  ('Dr. Bürklin-Wolf', 'Kirchenstück Riesling GC', 'Pfalz', 'Riesling', 'White'),
  ('Dr. Bürklin-Wolf', 'Pechstein Riesling GC', 'Pfalz', 'Riesling', 'White'),
  ('Von Winning', 'Kirchenstück Riesling GG', 'Pfalz', 'Riesling', 'White'),
  ('Von Winning', 'Pechstein Riesling GG', 'Pfalz', 'Riesling', 'White')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- AUSTRIA ---------------------------------------------------------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  -- Wachau
  ('F.X. Pichler', 'Kellerberg Riesling Smaragd', 'Wachau', 'Riesling', 'White'),
  ('F.X. Pichler', 'Unendlich Riesling Smaragd', 'Wachau', 'Riesling', 'White'),
  ('F.X. Pichler', 'M Grüner Veltliner Smaragd', 'Wachau', 'Grüner Veltliner', 'White'),
  ('Emmerich Knoll', 'Loibenberg Riesling Smaragd', 'Wachau', 'Riesling', 'White'),
  ('Emmerich Knoll', 'Schütt Riesling Smaragd', 'Wachau', 'Riesling', 'White'),
  ('Emmerich Knoll', 'Loibenberg Grüner Veltliner Smaragd', 'Wachau', 'Grüner Veltliner', 'White'),
  ('Prager', 'Achleiten Riesling Smaragd', 'Wachau', 'Riesling', 'White'),
  ('Prager', 'Wachstum Bodenstein Riesling Smaragd', 'Wachau', 'Riesling', 'White'),
  ('Alzinger', 'Steinertal Riesling Smaragd', 'Wachau', 'Riesling', 'White'),
  ('Alzinger', 'Höhereck Grüner Veltliner Smaragd', 'Wachau', 'Grüner Veltliner', 'White'),
  ('Hirtzberger', 'Singerriedel Riesling Smaragd', 'Wachau', 'Riesling', 'White'),
  ('Hirtzberger', 'Honivogl Grüner Veltliner Smaragd', 'Wachau', 'Grüner Veltliner', 'White'),
  ('Rudi Pichler', 'Hochrain Riesling Smaragd', 'Wachau', 'Riesling', 'White'),
  ('Nikolaihof', 'Im Weingebirge Grüner Veltliner', 'Wachau', 'Grüner Veltliner', 'White'),
  ('Nikolaihof', 'Steiner Hund Riesling Reserve', 'Wachau', 'Riesling', 'White'),
  -- Kamptal / Kremstal
  ('Bründlmayer', 'Zöbinger Heiligenstein Riesling', 'Kamptal', 'Riesling', 'White'),
  ('Bründlmayer', 'Lamm Grüner Veltliner', 'Kamptal', 'Grüner Veltliner', 'White'),
  ('Bründlmayer', 'Käferberg Grüner Veltliner', 'Kamptal', 'Grüner Veltliner', 'White'),
  ('Schloss Gobelsburg', 'Ried Lamm Grüner Veltliner', 'Kamptal', 'Grüner Veltliner', 'White'),
  ('Schloss Gobelsburg', 'Heiligenstein Riesling', 'Kamptal', 'Riesling', 'White'),
  ('Hirsch', 'Heiligenstein Riesling', 'Kamptal', 'Riesling', 'White'),
  ('Hirsch', 'Gaisberg Riesling', 'Kamptal', 'Riesling', 'White'),
  ('Nigl', 'Privat Riesling', 'Kremstal', 'Riesling', 'White'),
  ('Nigl', 'Piri Grüner Veltliner', 'Kremstal', 'Grüner Veltliner', 'White'),
  -- Burgenland (reds + sweet)
  ('Moric', 'Lutzmannsburg Alte Reben Blaufränkisch', 'Burgenland', 'Blaufränkisch', 'Red'),
  ('Moric', 'Neckenmarkt Alte Reben Blaufränkisch', 'Burgenland', 'Blaufränkisch', 'Red'),
  ('Umathum', 'Zweigelt', 'Burgenland', 'Zweigelt', 'Red'),
  ('Kracher', 'Trockenbeerenauslese', 'Burgenland', 'Welschriesling/Chardonnay', 'White'),
  ('Prieler', 'Goldberg Blaufränkisch', 'Burgenland', 'Blaufränkisch', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;
