-- Producer ranges: Germany, Australia, USA. Every row confirmed on a real page (URL on each row), 2026-11-26.
-- Run in the Supabase SQL editor. Re-runnable: existing rows are only upgraded to verified.

-- ---- DR. LOOSEN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Loosen Bros.', 'Dr. L Riesling', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.wine.com/product/loosen-bros-dr-l-riesling-2025/4130258
  ('Loosen Bros.', 'Dr. L Dry Riesling', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.wine.com/product/loosen-bros-dr-l-dry-riesling-2025/4127616
  ('Loosen Bros.', 'Dr. L Sparkling Riesling', 'Mosel, Germany', 'Riesling', 'Sparkling'),  -- https://www.nataliemaclean.com/ontario/lcbo/stock/loosen-bros-dr-l-sparkling-riesling/224068
  ('Dr. Loosen', 'Blue Slate Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.wine.com/product/dr-loosen-blue-slate-riesling-kabinett-2016/277512
  ('Dr. Loosen', 'Red Slate Dry Riesling', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.wine.com/product/dr-loosen-red-slate-dry-riesling-2021/1146337
  ('Dr. Loosen', 'Blauschiefer Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/products/2024-blauschiefer-riesling-trocken
  ('Dr. Loosen', 'Rotschiefer Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/collections/bestseller/products/2025-rotschiefer-riesling-trocken
  ('Dr. Loosen', 'Grauschiefer Riesling feinherb', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/
  ('Dr. Loosen', 'Weißburgunder', 'Mosel, Germany', 'Weissburgunder', 'White'),  -- https://drloosen.de/collections/bestseller/products/2025-weissburgunder
  ('Dr. Loosen', 'Graacher Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/products/2024-graacher-riesling-trocken
  ('Dr. Loosen', 'Graacher Himmelreich Riesling Tradition', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/collections/bestseller/products/2022-graacher-himmelreich-riesling-tradition
  ('Dr. Loosen', 'Wehlener Sonnenuhr Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/products/dr-loosen-wehlener-sonnenurh-riesling-kabinett
  ('Dr. Loosen', 'Wehlener Sonnenuhr Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.wine.com/product/dr-loosen-wehlener-sonnenuhr-riesling-spatlese-2024/3909347
  ('Dr. Loosen', 'Wehlener Sonnenuhr Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/collections/wehlener-sonnenuhr
  ('Dr. Loosen', 'Erdener Treppchen Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/collections/vdp-grosse-lagen-restsuessen-praedikatsweine
  ('Dr. Loosen', 'Erdener Treppchen Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/collections/vdp-grosse-lagen-restsuessen-praedikatsweine
  ('Dr. Loosen', 'Ürziger Würzgarten Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.wine.com/product/dr-loosen-urziger-wurzgarten-riesling-kabinett-2024/4041042
  ('Dr. Loosen', 'Ürziger Würzgarten Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.winespectator.com/wine/wine-detail/id/1330024/name/dr-loosen-riesling-spaetlese-mosel-uerziger-wuerzgarten-2024/guest
  ('Dr. Loosen', 'Bernkasteler Lay Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/collections/vdp-grosse-lagen-restsuessen-praedikatsweine
  ('Dr. Loosen', 'Erdener Prälat Riesling Auslese Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.falstaff.com/en/wines/weingut-dr-loosen-2024-goldkapsel-erden-praelat-riesling-auslese-1
  ('Dr. Loosen', 'Erdener Treppchen Riesling GG Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.winespectator.com/wine/wine-detail/id/1329584/name/dr-loosen-riesling-mosel-erdener-treppchen-alte-reben-gg-2024/guest
  ('Dr. Loosen', 'Ürziger Würzgarten Riesling GG Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/products/dr-loosen-urziger-wurzgarten-riesling-trocken-gg-alte-reben
  ('Dr. Loosen', 'Wehlener Sonnenuhr Riesling GG Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.winespectator.com/wine/wine-detail/id/1329620/name/dr-loosen-riesling-trocken-mosel-wehlener-sonnenuhr-alte-reben-gg-2024/guest
  ('Dr. Loosen', 'Graacher Himmelreich Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/products/dr-loosen-graacher-himmelreich-riesling-gg
  ('Dr. Loosen', 'Graacher Domprobst Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/en/products/dr-loosen-graacher-domprobst-riesling-gg
  ('Dr. Loosen', 'Kinheimer Rosenberg Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.winespectator.com/wine/wine-detail/id/1329617/name/dr-loosen-riesling-trocken-mosel-kinheimer-rosenberg-gg-2024/guest
  ('Dr. Loosen', 'Bernkasteler Lay Riesling GG trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://drloosen.de/
  ('Dr. Loosen', 'Erdener Prälat Riesling GG Alte Reben Réserve', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.winespectator.com/wine/wine-detail/id/1330023/name/dr-loosen-riesling-trocken-mosel-erdener-praelat-alte-reben-gg-reserve-2020/guest
  ('Dr. Loosen', 'Wehlener Sonnenuhr Im Laychen Riesling GG Alte Reben Réserve', 'Mosel, Germany', 'Riesling', 'White')  -- https://www.winespectator.com/wine/wine-detail/id/1329762/name/dr-loosen-riesling-trocken-mosel-wehlener-sonnenuhr-im-laychen-alte-reben-reserve-gg-2020/guest
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SELBACH-OSTER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Selbach-Oster', 'Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Riesling feinherb', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.skurnik.com/producer/selbach-oster/
  ('Selbach-Oster', 'Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.skurnik.com/producer/selbach-oster/
  ('Selbach-Oster', 'Zeltinger Alte Reben Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Zeltinger Riesling Kabinett trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Zeltinger Himmelreich Riesling Kabinett halbtrocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Zeltinger Sonnenuhr Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Zeltinger Schlossberg Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Wehlener Sonnenuhr Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Graacher Domprobst Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Zeltinger Schlossberg Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Wehlener Sonnenuhr Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Zeltinger Sonnenuhr Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Graacher Domprobst Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Graacher Himmelreich Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Zeltinger Sonnenuhr Riesling Spätlese feinherb "Ur" Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.skurnik.com/producer/selbach-oster/
  ('Selbach-Oster', 'Wehlener Sonnenuhr Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Graacher Domprobst Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Zeltinger Himmelreich Riesling Auslese "Anrecht"', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.skurnik.com/producer/selbach-oster/
  ('Selbach-Oster', 'Zeltinger Schlossberg Riesling Auslese "Schmitt"', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.wine.com/product/selbach-oster-zeltinger-schlossberg-schmitt-riesling-auslese-2022/3719468
  ('Selbach-Oster', 'Zeltinger Sonnenuhr Riesling Auslese "Rotlay"', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.wine.com/product/selbach-oster-zeltinger-sonnenuhr-rotlay-riesling-auslese-2018/687129
  ('Selbach-Oster', 'Zeltinger Schlossberg Riesling trocken "Bömer"', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.skurnik.com/producer/selbach-oster/
  ('Selbach-Oster', 'Zeltingen Schlossberg Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Zeltingen Sonnenuhr Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Wehlen Sonnenuhr Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Graach Domprobst Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Bernkastel Graben Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Pinot Blanc', 'Mosel, Germany', 'Pinot Blanc', 'White'),  -- https://www.skurnik.com/producer/selbach-oster/
  ('Selbach-Oster', 'Spätburgunder', 'Mosel, Germany', 'Spätburgunder', 'Red'),  -- https://shop.selbach-oster.de/weingut-selbach-oster?winery=2329
  ('Selbach-Oster', 'Riesling Sekt Brut', 'Mosel, Germany', 'Riesling', 'Sparkling'),  -- https://www.skurnik.com/producer/selbach-oster/
  ('Selbach-Oster', 'Above the Clouds Riesling Pét-Nat', 'Mosel, Germany', 'Riesling', 'Sparkling')  -- https://www.skurnik.com/producer/selbach-oster/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LEITZ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Leitz', 'Eins-Zwei-Dry Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/basisweine/products/2025-eins-zwei-dry-rheingau-riesling-trocken-0-75l
  ('Leitz', 'Eins-Zwei-Dry Pinot Noir Rosé trocken', 'Rheingau, Germany', 'Pinot Noir', 'Rosé'),  -- https://www.leitz-wein.shop/collections/basisweine/products/2025-eins-zwei-dry-rheingau-pinot-noir-rose-trocken-0-75l
  ('Leitz', 'Eins-Zwei-Dry Sauvignon Blanc trocken', 'Rheingau, Germany', 'Sauvignon Blanc', 'White'),  -- https://www.leitz-wein.shop/collections/basisweine/products/2025-eins-zwei-dry-sauvignon-blanc-trocken-0-75l
  ('Leitz', '"Caritas" Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/basisweine/products/2024-caritas-rheingau-riesling-trocken-0-75l
  ('Leitz', 'Dragonstone Riesling', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/feinherb-und-edelsuss/products/2025-dragonstone-rheingau-riesling-fruchtig-0-75l
  ('Leitz', 'Pinot Noir Rosé feinherb', 'Rheingau, Germany', 'Pinot Noir', 'Rosé'),  -- https://www.leitz-wein.shop/collections/feinherb-und-edelsuss/products/2025-rheingau-pinot-noir-rose-feinherb-0-75l
  ('Leitz', 'WRC Weissburgunder-Riesling-Chardonnay trocken', 'Rheingau, Germany', null, 'White'),  -- https://www.leitz-wein.shop/collections/gutswein/products/2023-wrc-rheingau-weissburgunder-riesling-chardonnay-trocken
  ('Leitz', 'Chardonnay "C" trocken', 'Rheingau, Germany', 'Chardonnay', 'White'),  -- https://www.leitz-wein.shop/collections/gutswein/products/2025-rheingau-chardonnay-c-trocken-vdp-gutswein-0-75l
  ('Leitz', 'Chardonnay SBS "Barrique" trocken', 'Rheingau, Germany', 'Chardonnay', 'White'),  -- https://www.leitz-wein.shop/collections/gutswein/products/2022-chardonnay-sbs-barrique-trocken-vdp-gutswein-0-75l
  ('Leitz', 'Weissburgunder "W" trocken', 'Rheingau, Germany', 'Weissburgunder', 'White'),  -- https://www.leitz-wein.shop/collections/gutswein/products/2025-rheingau-weissburgunder-w-trocken-vdp-gutswein-0-75l
  ('Leitz', 'Magic Mountain Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/ortswein/products/2025-magic-mountain-rudesheim-riesling-trocken-0-75l
  ('Leitz', 'Rüdesheim Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/ortswein/products/2025-rudesheim-riesling-trocken-vdp-ortswein-0-75l
  ('Leitz', 'Rüdesheimer Kirchenpfad Riesling Kabinett feinherb', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/feinherb-und-edelsuss/products/2025-rudesheimer-kirchenpfad-riesling-kabinett-feinherb-0-75l
  ('Leitz', 'Rüdesheimer Magdalenenkreuz Riesling Spätlese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/feinherb-und-edelsuss/products/2025-rudesheimer-magdalenenkreuz-riesling-spatlese-0-75l
  ('Leitz', 'Rüdesheimer Berg Roseneck Riesling Spätlese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/feinherb-und-edelsuss/products/2018-berg-roseneck-rudesheim-riesling-spatlese
  ('Leitz', 'Rüdesheimer Drachenstein Riesling Auslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/feinherb-und-edelsuss/products/2018-rudesheimer-drachenstein-riesling-auslese
  ('Leitz', 'Rüdesheimer Berg Schlossberg Riesling GG "Ehrenfels"', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/berg-schlossberg-gg-rudesheim-riesling-trocken-ehrenfels
  ('Leitz', 'Rüdesheimer Berg Kaisersteinfels Riesling GG "Terrassen"', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/berg-kaisersteinfels-gg-rudesheim-riesling-trocken-terrassen
  ('Leitz', 'Rüdesheimer Berg Roseneck Riesling GG "Katerloch"', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/jahrgange-berg-roseneck-gg-rudesheim-riesling-trocken-katerloch
  ('Leitz', 'Rüdesheimer Berg Rottland Riesling GG "Hinterhaus"', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/berg-rottland-gg-rudesheim-riesling-trocken-hinterhaus
  ('Leitz', 'Rüdesheimer Rosengarten Riesling GG "Monopol"', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.leitz-wein.shop/collections/rosengarten-gg-rudesheim-riesling-trocken-monopol-0-75l
  ('Leitz', '"24" Riesling Sekt brut', 'Rheingau, Germany', 'Riesling', 'Sparkling'),  -- https://www.leitz-wein.shop/collections/sekt/products/2023-24-rheingau-riesling-sekt-b-a-brut-vdp-sekt
  ('Leitz', '"48" Riesling Sekt brut', 'Rheingau, Germany', 'Riesling', 'Sparkling'),  -- https://www.leitz-wein.shop/collections/sekt/products/2019-48-rheingau-riesling-sekt-b-a-brut
  ('Leitz', '"60" Riesling Sekt brut nature', 'Rheingau, Germany', 'Riesling', 'Sparkling')  -- https://www.leitz-wein.shop/collections/sekt/products/2019-60-rheingau-riesling-sekt-b-a-brut-nature-0-75l
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SCHLOSS JOHANNISBERG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Schloss Johannisberg', 'Gelblack Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2025-schloss-johannisberg-gelblack-qualitaetswein-trocken-dry-075l/
  ('Schloss Johannisberg', 'Gelblack Riesling feinherb', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2025-schloss-johannisberg-gelblack-qualitaetswein-feinherb-off-dry-075l/
  ('Schloss Johannisberg', 'Bronzelack Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2025-schloss-johannisberg-bronzelack-qualitaetswein-trocken-dry-075l-2/
  ('Schloss Johannisberg', 'Silberlack Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2024-schloss-johannisberg-silberlack-grosses-gewaechs-075l/
  ('Schloss Johannisberg', 'Goldlack Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2022-schloss-johannisberg-riesling-goldlack-trocken/
  ('Schloss Johannisberg', 'Rotlack Riesling Kabinett', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2025-schloss-johannisberg-rotlack-kabinett-075l/
  ('Schloss Johannisberg', 'Orangelack Riesling Kabinett', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2024-schloss-johannisberg-orangelack-kabinett-075l/
  ('Schloss Johannisberg', 'Grünlack Riesling Spätlese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2023-schloss-johannisberg-gruenlack-spaetlese-075l/
  ('Schloss Johannisberg', 'Rosalack Riesling Auslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2025-schloss-johannisberg-rosalack-auslese-edelsuess-sweet-075l/
  ('Schloss Johannisberg', 'Purpurlack Riesling Beerenauslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2025-schloss-johannisberg-purpurlack-beerenauslese-edelsuess-noble-sweet-0375l/
  ('Schloss Johannisberg', 'Blaulack Riesling Trockenbeerenauslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://schloss-johannisberg.de/en/product/2025-schloss-johannisberg-blaulack-trockenbeerenauslese-edelsuess-noble-sweet-0375l/
  ('Schloss Johannisberg', 'Violettlack Riesling Eiswein', 'Rheingau, Germany', 'Riesling', 'White')  -- https://schloss-johannisberg.de/en/product/2018-schloss-johannisberger-violettlack-eiswein-075-l/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PENFOLDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Penfolds', 'Grange', 'South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.penfolds.com/ja-jp/wines/tasting-notes/the-penfolds-collection.html
  ('Penfolds', 'Yattarna Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://www.penfolds.com/en-au/yattarna-chardonnay-2024-8131016.html
  ('Penfolds', 'Bin 707 Cabernet Sauvignon', 'Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.penfolds.com/ja-jp/wines/tasting-notes/the-penfolds-collection.html
  ('Penfolds', 'RWT Bin 798 Barossa Valley Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.penfolds.com/en-au/rwt-bin-798-barossa-valley-shiraz-2022-8112057.html
  ('Penfolds', 'St Henri Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.penfolds.com/en-au/st-henri-shiraz-2023-8123697.html
  ('Penfolds', 'Magill Estate Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.penfolds.com/en-au/magill-estate-shiraz-2024-8133317.html
  ('Penfolds', 'Bin 169 Coonawarra Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.penfolds.com/en-au/bin-169-coonawarra-cabernet-sauvignon-2022-8097125.html
  ('Penfolds', 'Bin 389 Cabernet Shiraz', 'Australia', 'Cabernet Sauvignon/Shiraz', 'Red'),  -- https://www.penfolds.com/en-au/bin-389-cabernet-shiraz-2024-8136050.html
  ('Penfolds', 'Bin 407 Cabernet Sauvignon', 'Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.penfolds.com/en-au/bin-407-cabernet-sauvignon-2024-8125106.html
  ('Penfolds', 'Bin 28 Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.penfolds.com/en-au/bin-28-shiraz-2024-8118166.html
  ('Penfolds', 'Bin 128 Coonawarra Shiraz', 'Coonawarra, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.penfolds.com/ja-jp/wines/tasting-notes/the-penfolds-collection.html
  ('Penfolds', 'Bin 150 Marananga Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.penfolds.com/ja-jp/wines/tasting-notes/the-penfolds-collection.html
  ('Penfolds', 'Bin 138 Shiraz Grenache Mataro', 'Barossa Valley, South Australia, Australia', null, 'Red'),  -- https://www.penfolds.com/ja-jp/wines/tasting-notes/the-penfolds-collection.html
  ('Penfolds', 'Bin 2 Shiraz Mataro', 'Australia', null, 'Red'),  -- https://www.penfolds.com/en-au/bin-2-shiraz-mataro-2024-8119324.html
  ('Penfolds', 'Bin 8 Cabernet Shiraz', 'Australia', null, 'Red'),  -- https://www.penfolds.com/ja-jp/wines/tasting-notes/the-penfolds-collection.html
  ('Penfolds', 'Bin 9 Cabernet Sauvignon', 'South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.penfolds.com/ja-jp/wines/tasting-notes/the-penfolds-collection.html
  ('Penfolds', 'Bin 23 Pinot Noir', 'Adelaide Hills, South Australia, Australia', 'Pinot Noir', 'Red'),  -- https://www.penfolds.com/en-au/bin-23-pinot-noir-2022-8078640.html
  ('Penfolds', 'Bin 21 Grenache', 'Australia', 'Grenache', 'Red'),  -- https://www.penfolds.com/en-au/wines?start=24&sz=24
  ('Penfolds', 'Bin 51 Eden Valley Riesling', 'Eden Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.penfolds.com/en-au/bin-51-eden-valley-riesling-2026-8132527.html
  ('Penfolds', 'Bin 311 Chardonnay', 'Tumbarumba, New South Wales, Australia', 'Chardonnay', 'White'),  -- https://www.penfolds.com/en-au/bin-311-chardonnay-2025-8123887.html
  ('Penfolds', 'Reserve Bin A Adelaide Hills Chardonnay', 'Adelaide Hills, South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.penfolds.com/en-au/reserve-bin-a-adelaide-hills-chardonnay-2022-8095623.html
  ('Penfolds', 'Max''s Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.penfolds.com/ja-jp/wines/maxs
  ('Penfolds', 'Max''s Shiraz Cabernet', 'Australia', null, 'Red'),  -- https://www.penfolds.com/ja-jp/wines/maxs
  ('Penfolds', 'Max''s Chardonnay', 'Adelaide Hills, South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.penfolds.com/ja-jp/wines/maxs
  ('Penfolds', 'Max''s Cabernet Sauvignon', 'Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.danmurphys.com.au/product/531435/penfolds-max-s-cabernet-sauvignon
  ('Penfolds', 'Max''s Rosé', 'Adelaide Hills, South Australia, Australia', null, 'Rosé'),  -- https://www.penfolds.com/en-au/maxs-rose-2023-8094588.html
  ('Penfolds', 'Koonunga Hill Shiraz Cabernet', 'Australia', null, 'Red'),  -- https://penfolds.com/ja-jp/wines/tasting-notes/koonunga-hill.html
  ('Penfolds', 'Koonunga Hill Seventy Six Shiraz Cabernet', 'Australia', null, 'Red'),  -- https://www.penfolds.com/en-au/koonunga-hill-seventy-six-shiraz-cabernet-2024-8138331.html
  ('Penfolds', 'Koonunga Hill Shiraz', 'South Australia, Australia', 'Shiraz', 'Red'),  -- https://penfolds.com/ja-jp/wines/tasting-notes/koonunga-hill.html
  ('Penfolds', 'Koonunga Hill Cabernet Sauvignon', 'Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.penfolds.com/en-au/koonunga-hill-cabernet-sauvignon-2025-8135689.html
  ('Penfolds', 'Koonunga Hill Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://penfolds.com/ja-jp/wines/tasting-notes/koonunga-hill.html
  ('Penfolds', 'Koonunga Hill Autumn Riesling', 'Australia', 'Riesling', 'White'),  -- https://penfolds.com/ja-jp/wines/tasting-notes/koonunga-hill.html
  ('Penfolds', 'Grandfather Rare Tawny', 'Australia', null, 'Fortified'),  -- https://www.penfolds.com/en-au/wines?start=12&sz=12
  ('Penfolds', 'Club Tawny', 'Australia', null, 'Fortified'),  -- https://www.penfolds.com/en-au/wines?start=12&sz=12
  ('Penfolds', 'Father Grand Tawny 10 Year Old', 'Australia', null, 'Fortified'),  -- https://www.penfolds.com/en-au/father-grand-tawny-10-year-old-8135184.html
  ('Penfolds', 'Cellar Reserve Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://www.penfolds.com/en-au/cellar-reserve-chardonnay-2025-8123518.html
  ('Penfolds', 'Cellar Reserve Pinot Noir', 'Australia', 'Pinot Noir', 'Red'),  -- https://www.penfolds.com/en-au/cellar-reserve-pinot-noir-2024-8105512.html
  ('Penfolds', 'Bin 600 Cabernet Shiraz', 'California, USA', 'Cabernet Sauvignon/Shiraz', 'Red'),  -- https://us.penfolds.com/pages/our-wines
  ('Penfolds', 'Bin 704 Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://us.penfolds.com/pages/our-wines
  ('Penfolds', 'Bin 149 Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://us.penfolds.com/pages/our-wines
  ('Penfolds', 'Quantum Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red')  -- https://us.penfolds.com/pages/our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WOLF BLASS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Wolf Blass', 'Yellow Label Cabernet Sauvignon', 'South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://wine.qantas.com/p/wolf-blass-wolf-blass-yellow-label-cabernet-sauvignon-2022/WOLFYLCAB22
  ('Wolf Blass', 'Yellow Label Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Yellow Label Merlot', 'Australia', 'Merlot', 'Red'),  -- https://www.wolfblass.com/en-au/wines
  ('Wolf Blass', 'Yellow Label Pinot Noir', 'Australia', 'Pinot Noir', 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=0&sz=60
  ('Wolf Blass', 'Yellow Label Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://www.wolfblass.com/en-au/wines?start=0&sz=60
  ('Wolf Blass', 'Yellow Label Sauvignon Blanc', 'Australia', 'Sauvignon Blanc', 'White'),  -- https://www.wolfblass.com/en-au/wines
  ('Wolf Blass', 'Red Label Shiraz Cabernet', 'South Eastern Australia, Australia', null, 'Red'),  -- https://www.wolfblass.com/en/wolf-blass-red-label-shiraz-cabernet-2023-8095248.html
  ('Wolf Blass', 'Red Label Cabernet Sauvignon', 'Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wolfblass.com/en-au/wines
  ('Wolf Blass', 'Red Label Cabernet Merlot', 'Australia', null, 'Red'),  -- https://www.wolfblass.com/en-au/wines
  ('Wolf Blass', 'Red Label Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Red Label Shiraz Grenache', 'Australia', null, 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=0&sz=60
  ('Wolf Blass', 'Red Label Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://www.wolfblass.com/en-au/wines?start=0&sz=60
  ('Wolf Blass', 'Red Label Semillon Sauvignon Blanc', 'Australia', null, 'White'),  -- https://www.wolfblass.com/en-au/wines
  ('Wolf Blass', 'Red Label Sauvignon Blanc', 'Australia', 'Sauvignon Blanc', 'White'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Red Label Pinot Grigio', 'Australia', 'Pinot Grigio', 'White'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Red Label Pink Moscato', 'Australia', 'Moscato', 'Rosé'),  -- https://www.wolfblass.com/en-au/wines
  ('Wolf Blass', 'Red Label Chardonnay Pinot Noir', 'Australia', null, 'Sparkling'),  -- https://www.wolfblass.com/en-au/wines?start=0&sz=60
  ('Wolf Blass', 'Red Label Australian Tawny', 'Australia', null, 'Fortified'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Gold Label Regional Reserve Cabernet Sauvignon', 'Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wolfblass.com/en-au/wines
  ('Wolf Blass', 'Gold Label Regional Reserve Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Grey Label Langhorne Creek Cabernet Shiraz', 'Langhorne Creek, South Australia, Australia', null, 'Red'),  -- https://www.wolfblass.com/en/wolf-blass-grey-label-langhorne-creek-cabernet-shiraz-2020-8056157.html
  ('Wolf Blass', 'Grey Label McLaren Vale Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Black Label Cabernet Shiraz Malbec', 'Australia', null, 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Platinum Label Barossa Valley Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.wolfblass.com/en-au/wines
  ('Wolf Blass', 'Platinum Label Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.wolfblass.com/en-au/wines
  ('Wolf Blass', 'Eaglehawk Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Eaglehawk Sauvignon Blanc', 'Australia', 'Sauvignon Blanc', 'White'),  -- https://www.wolfblass.com/en-au/wines?start=0&sz=60
  ('Wolf Blass', 'Eaglehawk Shiraz Cabernet', 'Australia', null, 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Eaglehawk Cabernet Sauvignon', 'Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=24&sz=30
  ('Wolf Blass', 'Eaglehawk Cuvée Brut', 'Australia', null, 'Sparkling'),  -- https://www.wolfblass.com/en-au/wines?start=0&sz=60
  ('Wolf Blass', 'Bilyara Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.wolfblass.com/en-au/wines?start=0&sz=60
  ('Wolf Blass', 'Makers'' Project Reserve Shiraz', 'Australia', 'Shiraz', 'Red')  -- https://www.wolfblass.com/en-au/wines?start=0&sz=60
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JACOB'S CREEK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Jacob''s Creek', 'Classic Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://www.jancisrobinson.com/tastings/31154
  ('Jacob''s Creek', 'Classic Shiraz Cabernet', 'Australia', null, 'Red'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Classic Cabernet Sauvignon', 'Australia', 'Cabernet Sauvignon', 'Red'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Classic Cabernet Merlot', 'Australia', null, 'Red'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Classic Merlot', 'Australia', 'Merlot', 'Red'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Classic Pinot Noir', 'Australia', 'Pinot Noir', 'Red'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Classic Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Classic Sauvignon Blanc', 'Australia', 'Sauvignon Blanc', 'White'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Classic Semillon Sauvignon Blanc', 'Australia', null, 'White'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Classic Pinot Grigio', 'Australia', 'Pinot Grigio', 'White'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Classic Riesling', 'Australia', 'Riesling', 'White'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Double Barrel Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.danmurphys.com.au/product/DM_793361/jacob-s-creek-double-barrel-shiraz
  ('Jacob''s Creek', 'Double Barrel Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.danmurphys.com.au/product/793353/jacob-s-creek-double-barrel-cabernet-sauvignon
  ('Jacob''s Creek', 'Double Barrel Shiraz Cabernet', 'Limestone Coast, South Australia, Australia', null, 'Red'),  -- https://www.danmurphys.com.au/product/462717/jacob-s-creek-double-barrel-shiraz-cabernet
  ('Jacob''s Creek', 'Double Barrel Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Le Petit Rosé', 'Australia', null, 'Rosé'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Le Petit Pinot Gris', 'Australia', 'Pinot Gris', 'White'),  -- https://jacobscreek.com/pages/our-wines
  ('Jacob''s Creek', 'Reserve Barossa Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://jacobscreek.com/product/reserve-barossa-shiraz
  ('Jacob''s Creek', 'Reserve Adelaide Hills Chardonnay', 'Adelaide Hills, South Australia, Australia', 'Chardonnay', 'White'),  -- https://jacobscreek.com/product/reserve-adelaide-hills-chardonnay
  ('Jacob''s Creek', 'Reserve Coonawarra Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wine.com/product/jacobs-creek-reserve-cabernet-sauvignon-2019/967447
  ('Jacob''s Creek', 'Sparkling Chardonnay Pinot Noir', 'Australia', null, 'Sparkling'),  -- https://jacobscreek.com/product/sparkling-chardonnay-pinot-noir
  ('Jacob''s Creek', 'Sparkling Rosé', 'Australia', null, 'Sparkling'),  -- https://www.jacobscreek.com/en-nz/product/sparkling-rose
  ('Jacob''s Creek', 'Reserve Sparkling Rosé', 'Australia', null, 'Sparkling'),  -- https://jacobscreek.com/en-ca/products/reserve-sparkling-rose
  ('Jacob''s Creek', 'Sparkling Moscato', 'Australia', 'Moscato', 'Sparkling'),  -- https://www.danmurphys.com.au/champagne-sparkling/brand-jacob-s-creek
  ('Jacob''s Creek', 'Johann Shiraz Cabernet', 'Australia', null, 'Red')  -- https://jacobscreek.com/products/heritage-johann-shiraz-cabernet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- [YELLOW TAIL] ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('[yellow tail]', 'Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Cabernet Sauvignon', 'South Eastern Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Merlot', 'South Eastern Australia, Australia', 'Merlot', 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Pinot Noir', 'South Eastern Australia, Australia', 'Pinot Noir', 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Malbec', 'South Eastern Australia, Australia', 'Malbec', 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Cabernet Merlot', 'South Eastern Australia, Australia', null, 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Jammy Red', 'South Eastern Australia, Australia', null, 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Big Bold Red', 'South Eastern Australia, Australia', null, 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Chardonnay', 'South Eastern Australia, Australia', 'Chardonnay', 'White'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Buttery Chardonnay', 'South Eastern Australia, Australia', 'Chardonnay', 'White'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Sauvignon Blanc', 'South Eastern Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Semillon Sauvignon Blanc', 'South Eastern Australia, Australia', null, 'White'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Pinot Grigio', 'South Eastern Australia, Australia', 'Pinot Grigio', 'White'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Moscato', 'South Eastern Australia, Australia', 'Moscato', 'White'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Cool Crisp White', 'South Eastern Australia, Australia', null, 'White'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Rosé', 'South Eastern Australia, Australia', null, 'Rosé'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Bubbles', 'South Eastern Australia, Australia', null, 'Sparkling'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Bubbles Rosé', 'South Eastern Australia, Australia', null, 'Sparkling'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Light & Bright Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Light & Bright Pinot Noir', 'South Eastern Australia, Australia', 'Pinot Noir', 'Red'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Light & Bright Chardonnay', 'South Eastern Australia, Australia', 'Chardonnay', 'White'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Light & Bright Sauvignon Blanc', 'South Eastern Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.yellowtailwine.com/wines/
  ('[yellow tail]', 'Light & Bright Sparkling', 'South Eastern Australia, Australia', null, 'Sparkling')  -- https://www.yellowtailwine.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LINDEMAN'S ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Lindeman''s', 'Bin 65 Chardonnay', 'South Eastern Australia, Australia', 'Chardonnay', 'White'),  -- https://www.danmurphys.com.au/product/6237/lindeman-s-bin-65-chardonnay
  ('Lindeman''s', 'Bin 50 Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://a.storyblok.com/f/171317/x/9ad5f14b72/lindemans-vr-bin50-shiraz-tn-us.pdf
  ('Lindeman''s', 'Bin 45 Cabernet Sauvignon', 'South Eastern Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://a.storyblok.com/f/171317/x/516e8c0343/2017-cabernet-sauvignon-lindemans-bin-45.pdf
  ('Lindeman''s', 'Bin 40 Merlot', 'South Eastern Australia, Australia', 'Merlot', 'Red'),  -- https://bws.com.au/product/901198/lindeman's-bin-40-merlot
  ('Lindeman''s', 'Bin 99 Pinot Noir', 'South Eastern Australia, Australia', 'Pinot Noir', 'Red'),  -- https://a.storyblok.com/f/171317/x/43b57f2bba/lindemans-vr-bin99-pinnoir-tn-us.pdf
  ('Lindeman''s', 'Bin 85 Pinot Grigio', 'South Eastern Australia, Australia', 'Pinot Grigio', 'White'),  -- https://a.storyblok.com/f/171317/x/49776adb66/lindemans-vr-bin-85-pingrigio-tn-us.pdf
  ('Lindeman''s', 'Bin 95 Sauvignon Blanc', 'South Eastern Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.igashop.com.au/product/lindemans-bin-95-sauvignon-blanc-6604237
  ('Lindeman''s', 'Bin 75 Riesling', 'South Eastern Australia, Australia', 'Riesling', 'White'),  -- https://www.systembolaget.se/produkt/vin/lindemans-bin-75-riesling-614541/
  ('Lindeman''s', 'Bin 25 Brut Cuvée', 'South Eastern Australia, Australia', null, 'Sparkling'),  -- https://www.vinmonopolet.no/Land/Australia/Lindeman%27s-Bin-25-Brut-Cuv%C3%A9e/p/1567801
  ('Lindeman''s', 'Coonawarra Trio Limestone Ridge Shiraz Cabernet', 'Coonawarra, South Australia, Australia', null, 'Red'),  -- https://www.danmurphys.com.au/product/DM_64183/lindeman-s-coonawarra-trio-limestone-ridge-shiraz-cabernet
  ('Lindeman''s', 'Coonawarra Trio St George Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.danmurphys.com.au/product/DM_10948/lindeman-s-coonawarra-trio-st-george-cabernet-sauvignon
  ('Lindeman''s', 'Coonawarra Trio Pyrus Cabernet Blend', 'Coonawarra, South Australia, Australia', null, 'Red'),  -- https://www.danmurphys.com.au/product/DM_29243/lindeman-s-coonawarra-trio-pyrus-cabernet-blend
  ('Lindeman''s', 'Gentleman''s Collection Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://www.danmurphys.com.au/product/DM_455039
  ('Lindeman''s', 'Gentleman''s Collection Cabernet Sauvignon', 'South Eastern Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.danmurphys.com.au/product/DM_455624
  ('Lindeman''s', 'Early Harvest Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://www.danmurphys.com.au/product/DM_339891/lindeman-s-early-harvest-shiraz
  ('Lindeman''s', 'Early Harvest Rosé', 'South Eastern Australia, Australia', null, 'Rosé'),  -- https://www.danmurphys.com.au/product/DM_916687/lindeman-s-early-harvest-ros
  ('Lindeman''s', 'Early Harvest Semillon Sauvignon Blanc', 'South Eastern Australia, Australia', null, 'White'),  -- https://www.danmurphys.com.au/product/DM_906012/lindeman-s-early-harvest-semillon-sauvignon-blanc
  ('Lindeman''s', 'Early Harvest Pinot Grigio', 'South Eastern Australia, Australia', 'Pinot Grigio', 'White'),  -- https://www.danmurphys.com.au/product/DM_961975/lindeman-s-early-harvest-pinot-grigio
  ('Lindeman''s', 'Early Harvest Riesling', 'South Eastern Australia, Australia', 'Riesling', 'White'),  -- https://www.danmurphys.com.au/product/234556/lindeman-s-early-harvest-riesling
  ('Lindeman''s', 'Early Harvest Sparkling', 'South Eastern Australia, Australia', null, 'Sparkling')  -- https://www.danmurphys.com.au/product/DM_916660/lindeman-s-early-harvest-sparkling
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HARDYS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Hardys', 'Eileen Hardy Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://www.danmurphys.com.au/product/DM_24840/hardys-eileen-hardy-shiraz
  ('Hardys', 'Eileen Hardy Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://hardyswines.com/products/eileen-hardy-chardonnay-2023
  ('Hardys', 'Eileen Hardy Pinot Noir', 'Tasmania, Australia', 'Pinot Noir', 'Red'),  -- https://www.danmurphys.com.au/product/DM_246564/hardys-eileen-pinot-noir-2021
  ('Hardys', 'Thomas Hardy Cabernet Sauvignon', 'Australia', 'Cabernet Sauvignon', 'Red'),  -- https://hardyswines.com/au/range/
  ('Hardys', 'HRB Shiraz', 'Australia', 'Shiraz', 'Red'),  -- https://hardyswines.com/products/hardys-hrb-shiraz-2020
  ('Hardys', 'HRB Pinot Noir', 'Australia', 'Pinot Noir', 'Red'),  -- https://hardyswines.com/products/hardys-hrb-pinot-noir-2022
  ('Hardys', 'HRB Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://www.danmurphys.com.au/product/DM_351254/hardys-clare-valley-hrb-riesling
  ('Hardys', 'HRB Chardonnay', 'Australia', 'Chardonnay', 'White'),  -- https://www.wineselectors.com.au/product/hardys-hrb-chardonnay-2019/hardy20119
  ('Hardys', 'Tintara Shiraz', 'McLaren Vale, South Australia, Australia', 'Shiraz', 'Red'),  -- https://hardyswines.com/products/hardys-tintara-shiraz-1
  ('Hardys', 'Tintara Cabernet Sauvignon', 'McLaren Vale, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://hardyswines.com/products/hardys-tintara-cabernet-sauvignon-1
  ('Hardys', 'Tintara Grenache Shiraz Mataro', 'McLaren Vale, South Australia, Australia', null, 'Red'),  -- https://hardyswines.com/products/hardys-tintara-grenache-shiraz-mataro
  ('Hardys', 'Tintara T-Series Sangiovese', 'McLaren Vale, South Australia, Australia', 'Sangiovese', 'Red'),  -- https://hardyswines.com/products/hardys-tintara-t-series-sangiovese
  ('Hardys', 'Siegersdorf Riesling', 'Clare Valley, South Australia, Australia', 'Riesling', 'White'),  -- https://global.hardyswines.com/pages/our-wines
  ('Hardys', 'Sir James Pinot Noir Chardonnay Cuvée Brut', 'Australia', null, 'Sparkling'),  -- https://www.danmurphys.com.au/product/DM_1053/hardys-sir-james-pinot-noir-chardonnay-cuv-e-brut
  ('Hardys', 'Sir James Vintage Pinot Noir Chardonnay', 'Australia', null, 'Sparkling'),  -- https://www.danmurphys.com.au/product/DM_66778/hardys-sir-james-vintage-pinot-noir-chardonnay
  ('Hardys', 'Nottage Hill Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://www.danmurphys.com.au/product/DM_126240/hardys-nottage-hill-shiraz
  ('Hardys', 'Nottage Hill Cabernet Sauvignon', 'South Eastern Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://groceries.morrisons.com/products/nottage-hill-cabernet-sauvignon/114478547
  ('Hardys', 'Nottage Hill Cabernet Shiraz', 'South Eastern Australia, Australia', null, 'Red'),  -- https://www.ocado.com/products/hardys-nottage-hill-cabernet-shiraz-18568011
  ('Hardys', 'Nottage Hill Merlot', 'South Eastern Australia, Australia', 'Merlot', 'Red'),  -- https://groceries.morrisons.com/products/hardys-nottage-hill-merlot-red-wine/111744432
  ('Hardys', 'Nottage Hill Chardonnay', 'South Eastern Australia, Australia', 'Chardonnay', 'White'),  -- https://ocado.com/products/hardys-nottage-hill-chardonnay-18665011
  ('Hardys', 'Nottage Hill Pinot Grigio', 'South Eastern Australia, Australia', 'Pinot Grigio', 'White'),  -- https://groceries.morrisons.com/products/hardys-nottage-hill-pinot-grigio-white-wine/114447687
  ('Hardys', 'VR Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://www.sainsburys.co.uk/gol-ui/product/hardys-vr-shiraz-red-wine-75cl
  ('Hardys', 'VR Merlot', 'South Eastern Australia, Australia', 'Merlot', 'Red'),  -- https://www.tesco.com/groceries/en-GB/products/252965917
  ('Hardys', 'VR Cabernet Sauvignon', 'South Eastern Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.tesco.com/shop/en-GB/products/252575906
  ('Hardys', 'VR Chardonnay', 'South Eastern Australia, Australia', 'Chardonnay', 'White'),  -- https://sainsburys.co.uk/groceries/product/hardys-vr-chardonnay-white-wine-75cl
  ('Hardys', 'VR Sauvignon Blanc', 'South Eastern Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.sainsburys.co.uk/gol-ui/product/hardys-vr-sauvignon-blanc-white-wine-75cl
  ('Hardys', 'VR Pinot Grigio', 'South Eastern Australia, Australia', 'Pinot Grigio', 'White'),  -- https://www.sainsburys.co.uk/gol-ui/product/hardys-vr-pinot-grigio-white-wine-75cl
  ('Hardys', 'VR Rosé', 'South Eastern Australia, Australia', null, 'Rosé'),  -- https://www.tesco.com/groceries/en-GB/products/266199005
  ('Hardys', 'Stamp Chardonnay Semillon', 'South Eastern Australia, Australia', null, 'White'),  -- https://www.tesco.com/shop/en-GB/products/256335004
  ('Hardys', 'Stamp Cabernet Merlot', 'South Eastern Australia, Australia', null, 'Red'),  -- https://www.tesco.com/shop/en-GB/products/252308130
  ('Hardys', 'Stamp Shiraz', 'South Eastern Australia, Australia', 'Shiraz', 'Red'),  -- https://groceries.morrisons.com/products/hardys-stamp-shiraz-red-wine-604106011
  ('Hardys', 'Rare Tawny', 'Australia', null, 'Fortified'),  -- https://hardyswines.com/au/range/
  ('Hardys', 'Rare Muscat', 'Australia', 'Muscat', 'Fortified')  -- https://hardyswines.com/au/range/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WYNNS COONAWARRA ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Wynns Coonawarra Estate', 'Black Label Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'Black Label Cabernet Shiraz', 'Coonawarra, South Australia, Australia', null, 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'Black Label ''Old Vines'' Shiraz', 'Coonawarra, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'John Riddoch Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'Michael Shiraz', 'Coonawarra, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'Single Vineyard Childs Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'Single Vineyard Messenger Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'Limited Release Single Vineyard Cabernet Franc', 'Coonawarra, South Australia, Australia', 'Cabernet Franc', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'V&A Lane Cabernet Shiraz', 'Coonawarra, South Australia, Australia', null, 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'V&A Lane Shiraz', 'Coonawarra, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'The Gables Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'The Gables Chardonnay', 'Coonawarra, South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'The Siding Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'The Siding Shiraz', 'Coonawarra, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'The Siding Cabernet Shiraz Malbec Merlot', 'Coonawarra, South Australia, Australia', null, 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'The Siding Chardonnay', 'Coonawarra, South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'The Siding Riesling', 'Coonawarra, South Australia, Australia', 'Riesling', 'White'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'Reframed Shiraz Riesling', 'Coonawarra, South Australia, Australia', null, 'Red'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'Pedro Ximenez', 'Coonawarra, South Australia, Australia', 'Pedro Ximenez', 'Fortified'),  -- https://www.wynns.com.au/en-au/wine/
  ('Wynns Coonawarra Estate', 'Black Label Shiraz', 'Coonawarra, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.danmurphys.com.au/product/6074211/wynns-coonawarra-estate-black-label-shiraz-2024
  ('Wynns Coonawarra Estate', 'Black Label Messenger Chardonnay', 'Coonawarra, South Australia, Australia', 'Chardonnay', 'White')  -- https://www.wynns.com.au/en-au/black-label-messenger-chardonnay-2025-8116413.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- YALUMBA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Yalumba', 'The Signature Cabernet Sauvignon Shiraz', 'Barossa, South Australia, Australia', null, 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'The Octavius Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'The Caley Cabernet Sauvignon Shiraz', 'South Australia, Australia', null, 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'The Menzies Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'The Steeple Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'The Tri-Centenary Grenache', 'Barossa, South Australia, Australia', 'Grenache', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'The Virgilius Viognier', 'Eden Valley, South Australia, Australia', 'Viognier', 'White'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'FDR1A Cabernet Sauvignon & Shiraz', 'Eden Valley, South Australia, Australia', null, 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'The Cigar Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Paradox Shiraz', 'Barossa Valley, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Hand Picked Shiraz + Viognier', 'Eden Valley, South Australia, Australia', null, 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Eden Valley Syrah', 'Eden Valley, South Australia, Australia', 'Syrah', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Barossa Valley Vat-11 Grenache', 'Barossa Valley, South Australia, Australia', 'Grenache', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Vine Vale Grenache', 'Barossa Valley, South Australia, Australia', 'Grenache', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Vine Vale Grenache Blanc', 'Barossa Valley, South Australia, Australia', 'Grenache Blanc', 'White'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'FSW Botrytis Viognier', 'Wrattonbully, South Australia, Australia', 'Viognier', 'White'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Samuel''s Collection Barossa Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.woolworths.co.nz/shop/product-details/174144/yalumba-samuels-collection-shiraz-barossa
  ('Yalumba', 'Samuel''s Collection Barossa Bush Vine Grenache', 'Barossa, South Australia, Australia', 'Grenache', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Samuel''s Collection Barossa Cabernet Sauvignon Shiraz', 'Barossa, South Australia, Australia', null, 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Samuel''s Collection Barossa Grenache Rosé', 'Barossa Valley, South Australia, Australia', 'Grenache', 'Rosé'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Samuel''s Collection Eden Valley Viognier', 'Eden Valley, South Australia, Australia', 'Viognier', 'White'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Samuel''s Collection Eden Valley Chardonnay', 'Eden Valley, South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Samuel''s Collection Eden Valley Roussanne', 'Eden Valley, South Australia, Australia', 'Roussanne', 'White'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Sanctum Cabernet Sauvignon', 'Coonawarra, South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Galway Vintage Shiraz', 'Barossa, South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Antique Tawny', 'South Eastern Australia, Australia', null, 'Fortified'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Antique Muscat', 'South Eastern Australia, Australia', 'Muscat', 'Fortified'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', '21 Year Old Aged Tawny', 'Australia', null, 'Fortified'),  -- https://www.yalumba.com/shop/wines/
  ('Yalumba', 'Y Series Shiraz', 'South Australia, Australia', 'Shiraz', 'Red'),  -- https://www.wine.com/product/yalumba-y-series-shiraz-2020/1311183
  ('Yalumba', 'Y Series Shiraz Viognier', 'South Australia, Australia', null, 'Red'),  -- https://www.winebow.com/node/603165
  ('Yalumba', 'Y Series Viognier', 'South Australia, Australia', 'Viognier', 'White'),  -- https://www.woolworths.com.au/shop/productdetails/904944/yalumba-y-series-viognier
  ('Yalumba', 'Y Series Riesling', 'South Australia, Australia', 'Riesling', 'White'),  -- https://www.woolworths.com.au/shop/productdetails/900579/yalumba-y-series-riesling
  ('Yalumba', 'Y Series Sauvignon Blanc', 'South Australia, Australia', 'Sauvignon Blanc', 'White'),  -- https://www.saratogawine.com/product/yalumba-sauvignon-blanc-y-series-2025-750ml/
  ('Yalumba', 'Y Series Pinot Grigio', 'South Australia, Australia', 'Pinot Grigio', 'White'),  -- https://caskcartel.com/products/2021-yalumba-y-series-pinot-grigio
  ('Yalumba', 'Y Series Unwooded Chardonnay', 'South Australia, Australia', 'Chardonnay', 'White'),  -- https://www.winebow.com/system/files/2025-09/YSeries-F26-Brand-SS-M1.pdf
  ('Yalumba', 'Y Series Sangiovese Rosé', 'South Australia, Australia', 'Sangiovese', 'Rosé'),  -- https://www.winebow.com/system/files/2025-09/YSeries-F26-Brand-SS-M1.pdf
  ('Yalumba', 'Y Series Cabernet Sauvignon', 'South Australia, Australia', 'Cabernet Sauvignon', 'Red'),  -- https://www.winebow.com/system/files/2025-09/YSeries-F26-Brand-SS-M1.pdf
  ('Yalumba', 'Y Series Pinot Noir', 'South Australia, Australia', 'Pinot Noir', 'Red')  -- https://www.winebow.com/system/files/2025-09/YSeries-F26-Brand-SS-M1.pdf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROBERT MONDAVI WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Robert Mondavi Winery', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/cabernet-sauvignon
  ('Robert Mondavi Winery', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://robertmondaviwinery.com
  ('Robert Mondavi Winery', 'Napa Valley Pinot Noir', 'Napa Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://robertmondaviwinery.com
  ('Robert Mondavi Winery', 'Napa Valley Sauvignon Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://robertmondaviwinery.com/products/2022-sauvignon-blanc-napa-valley
  ('Robert Mondavi Winery', 'Fumé Blanc', 'Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.chathambuyrite.com/Shop/Product/BC009764
  ('Robert Mondavi Winery', 'The Estates Fumé Blanc Oakville', 'Oakville, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://nft.robertmondaviwinery.com/products/2022-the-estates-fume-blanc-oakville
  ('Robert Mondavi Winery', 'The Estates Sauvignon Blanc Stags Leap District', 'Stags Leap District, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://robertmondaviwinery.com/collections/all?page=2
  ('Robert Mondavi Winery', 'To Kalon Reserve Fumé Blanc', 'Oakville, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://robertmondaviwinery.com/collections/fume-blanc
  ('Robert Mondavi Winery', 'I Block Fumé Blanc To Kalon Vineyard', 'Oakville, Napa Valley, California, USA', 'Sauvignon Blanc', 'White'),  -- https://robertmondaviwinery.com/products/2023-i-block-fume-blanc-to-kalon-vineyard
  ('Robert Mondavi Winery', 'To Kalon Reserve Cabernet Sauvignon', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/our-wines
  ('Robert Mondavi Winery', 'Reserve Merlot To Kalon Vineyard', 'Oakville, Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://robertmondaviwinery.com/collections/our-wines?page=2
  ('Robert Mondavi Winery', 'The Estates Cabernet Sauvignon Oakville', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/the-estates-tier
  ('Robert Mondavi Winery', 'The Estates Cabernet Sauvignon Stags Leap District', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/cabernet-sauvignon
  ('Robert Mondavi Winery', 'The Estates Clone 8 Cabernet Sauvignon Oakville', 'Oakville, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Estates Clone 8 Cabernet Sauvignon Stags Leap District', 'Stags Leap District, Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Estates Malbec Oakville', 'Oakville, Napa Valley, California, USA', 'Malbec', 'Red'),  -- https://robertmondaviwinery.com/collections/all
  ('Robert Mondavi Winery', 'The Estates Merlot Oak Knoll District', 'Oak Knoll District, Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://robertmondaviwinery.com/Mondavi-Wines
  ('Robert Mondavi Winery', 'The Estates Chardonnay Carneros', 'Los Carneros, Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://store.cbrands.com/products/2022-robert-mondavi-winery-the-estates-chardonnay-carneros-napa-valley
  ('Robert Mondavi Winery', 'The Estates Pinot Noir Carneros', 'Los Carneros, Napa Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://robertmondaviwinery.com/collections/the-estates-tier
  ('Robert Mondavi Winery', 'PNX Pinot Noir Carneros', 'Los Carneros, Napa Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://robertmondaviwinery.com/collections/our-wines
  ('Robert Mondavi Winery', 'Maestro Red Blend', 'Napa Valley, California, USA', null, 'Red'),  -- https://robertmondaviwinery.com/collections/cabernet-sauvignon
  ('Robert Mondavi Winery', 'Moscato d''Oro', 'Napa Valley, California, USA', 'Moscato', 'White')  -- https://robertmondaviwinery.com/collections/our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WOODBRIDGE BY ROBERT MONDAVI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Woodbridge by Robert Mondavi', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Buttery Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Lightly Oaked Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Red Blend', 'California, USA', null, 'Red'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Rich Red Blend', 'California, USA', null, 'Red'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Riesling', 'California, USA', 'Riesling', 'White'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Moscato', 'California, USA', 'Moscato', 'White'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Rosé', 'California, USA', null, 'Rosé'),  -- https://www.woodbridgewines.com/pages/our-wines
  ('Woodbridge by Robert Mondavi', 'Bourbon Barrel Aged Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.kingsoopers.com/p/woodbridge-by-robert-mondavi-bourbon-barrel-aged-cabernet-sauvignon/0008600382075
  ('Woodbridge by Robert Mondavi', 'Rum Barrel Aged Chardonnay', 'California, USA', 'Chardonnay', 'White')  -- https://www.pricecutteronline.com/shop/beer/wine_and_champagne/rum_barrel_aged_chardonnay_white_wine/p/1564405684706090698
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BERINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Beringer', 'Private Reserve Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.beringer.com/products/2022-private-reserve-cabernet-sauvignon
  ('Beringer', 'Private Reserve Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://beringer.com/products/2024-private-reserve-chardonnay
  ('Beringer', 'Private Reserve Bancroft Ranch Merlot', 'Napa Valley, California, USA', 'Merlot', 'Red'),  -- https://www.vivino.com/en/wineries/beringer
  ('Beringer', 'Luminus Chardonnay', 'Oak Knoll District, Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.wine.com/product/beringer-luminus-chardonnay-2023/4122220
  ('Beringer', 'Q Napa Valley Red Blend', 'Napa Valley, California, USA', null, 'Red'),  -- https://www.beringer.com/products/2021-q-napa-valley-red-blend
  ('Beringer', 'Distinction Series Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.beringer.com/products/2022-distinction-series-cabernet-sauvignon
  ('Beringer', 'Napa Valley Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.jamessuckling.com/tasting-notes/288453/beringer-cabernet-sauvignon-napa-valley-2022
  ('Beringer', 'Napa Valley Chardonnay', 'Napa Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.wine.com/product/beringer-napa-valley-chardonnay-2020/1109662
  ('Beringer', 'Knights Valley Cabernet Sauvignon', 'Knights Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.beringer.com/pages/knights-valley
  ('Beringer', 'Knights Valley Reserve Cabernet Sauvignon', 'Knights Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.beringer.com/pages/knights-valley
  ('Beringer', 'Knights Valley Reserve Red Blend', 'Knights Valley, California, USA', null, 'Red'),  -- https://www.beringer.com/pages/knights-valley
  ('Beringer', 'Knights Valley Mallacomes Cabernet Franc', 'Knights Valley, California, USA', 'Cabernet Franc', 'Red'),  -- https://www.beringer.com/pages/knights-valley
  ('Beringer', 'Knights Valley Teviot Springs Cabernet Sauvignon', 'Knights Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.beringer.com/pages/knights-valley
  ('Beringer', 'Knights Valley Mountain Rosé', 'Knights Valley, California, USA', null, 'Rosé'),  -- https://www.beringer.com/pages/knights-valley
  ('Beringer', 'Founders'' Estate Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://beringer.com/en/founders-estate.html
  ('Beringer', 'Founders'' Estate Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://beringer.com/en/founders-estate.html
  ('Beringer', 'Founders'' Estate Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://beringer.com/en/founders-estate.html
  ('Beringer', 'Founders'' Estate Dark Red Blend', 'California, USA', null, 'Red'),  -- https://www.fredmeyer.com/p/beringer-founders-estate-smooth-red-blend/0008981954257
  ('Beringer', 'Founders'' Estate Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://beringer.com/en/founders-estate.html
  ('Beringer', 'Founders'' Estate Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://beringer.com/en/founders-estate.html
  ('Beringer', 'Main & Vine White Zinfandel', 'California, USA', 'Zinfandel', 'Rosé'),  -- https://www.lcbo.com/en/beringer-main-vine-white-zinfandel-239756
  ('Beringer', 'Main & Vine White Zinfandel/Moscato', 'California, USA', null, 'Rosé'),  -- https://www.kroger.com/p/beringer-white-zinfandel-moscato/0008981954352
  ('Beringer', 'Main & Vine Moscato', 'California, USA', 'Moscato', 'White'),  -- https://www.kroger.com/p/beringer-main-vine-moscato-wine/0008981906720
  ('Beringer', 'Main & Vine Red Moscato', 'California, USA', 'Moscato', 'Red'),  -- https://harristeeter.com/p/beringer-main-vine-red-moscato-california-white-wine/0008981954187
  ('Beringer', 'Main & Vine Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://www.kroger.com/p/beringer-pinot-grigio/0008981976010
  ('Beringer', 'Bros. Bourbon Barrel Aged Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.wine.com/product/beringer-bros-bourbon-barrel-aged-cabernet-sauvignon-2023/2790769
  ('Beringer', 'Bros. Bourbon Barrel Aged Red Blend', 'California, USA', null, 'Red'),  -- https://www.publix.com/pd/beringer-bros-red-wine-blend-bourbon-barrel-aged/RIO-PCI-562496
  ('Beringer', 'Bros. Bourbon Barrel Aged Chardonnay', 'California, USA', 'Chardonnay', 'White')  -- https://www.kroger.com/p/beringer-bros-california-bourbon-barrel-aged-chardonnay-white-wine/0008981972025
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KENDALL-JACKSON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Kendall-Jackson', 'Vintner''s Reserve Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://kj.com/wine/chardonnay
  ('Kendall-Jackson', 'Vintner''s Reserve Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.kj.com/wine/cabernet-sauvignon
  ('Kendall-Jackson', 'Vintner''s Reserve Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.kj.com/wine/pinot-noir
  ('Kendall-Jackson', 'Vintner''s Reserve Merlot', 'Sonoma County, California, USA', 'Merlot', 'Red'),  -- https://www.kj.com/wine/merlot
  ('Kendall-Jackson', 'Vintner''s Reserve Zinfandel', 'California, USA', 'Zinfandel', 'Red'),  -- https://www.kj.com/wine/merlot
  ('Kendall-Jackson', 'Vintner''s Reserve Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.kj.com/wine/sauvignon-blanc
  ('Kendall-Jackson', 'Vintner''s Reserve Riesling', 'Monterey County, California, USA', 'Riesling', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Vintner''s Reserve Chenin Blanc', 'California, USA', 'Chenin Blanc', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Vintner''s Reserve Pinot Gris', 'California, USA', 'Pinot Gris', 'White'),  -- https://kj.com/kendall-jackson-california-vintners-reserve-pinot-gris-2024-750-ml/6202412.html
  ('Kendall-Jackson', 'Grand Reserve Chardonnay', 'Santa Barbara County, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Grand Reserve Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Grand Reserve Late Harvest Chardonnay', 'Monterey County, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Stature Chardonnay', 'Santa Barbara County, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Stature Cabernet Sauvignon', 'Sonoma County, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Stature Pinot Noir', 'Anderson Valley, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kj.com/wine/pinot-noir
  ('Kendall-Jackson', 'Avant Unoaked Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://kj.com/wine/chardonnay
  ('Kendall-Jackson', 'Low Calorie Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Light Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.kj.com/wine/sauvignon-blanc
  ('Kendall-Jackson', 'Jackson Estate Camelot Highlands Chardonnay', 'Santa Maria Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Santa Maria Valley Chardonnay', 'Santa Maria Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Cloud Landing Chardonnay', 'Petaluma Gap, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Cloud Landing Pinot Noir', 'Petaluma Gap, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Carneros Hills Chardonnay', 'Los Carneros, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Sable Mountain Vineyard Chardonnay', 'Anderson Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Three Vistas Chardonnay', 'Russian River Valley, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Seco Highlands Chardonnay', 'Arroyo Seco, California, USA', 'Chardonnay', 'White'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Panorama Vineyard Pinot Noir', 'Santa Lucia Highlands, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Tidal Break Vineyard Pinot Noir', 'West Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Hawkeye Mountain Cabernet Sauvignon', 'Alexander Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.kj.com/wine/cabernet-sauvignon
  ('Kendall-Jackson', 'Jackson Estate Trace Ridge Cabernet Sauvignon', 'Knights Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Winemaker''s Red Wine Blend', 'Alexander Valley, California, USA', null, 'Red'),  -- https://www.kj.com/wines
  ('Kendall-Jackson', 'Jackson Estate Alisos Canyon Syrah', 'Santa Barbara County, California, USA', 'Syrah', 'Red')  -- https://www.kj.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHATEAU STE. MICHELLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Chateau Ste. Michelle', 'Columbia Valley Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.wine.com/product/1300466
  ('Chateau Ste. Michelle', 'Columbia Valley Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.wine.com/list/wine/chateau-ste-michelle/vintage-2020/7155-102117-385
  ('Chateau Ste. Michelle', 'Columbia Valley Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.wine.com/list/wine/chateau-ste-michelle/vintage-2020/7155-102117-385
  ('Chateau Ste. Michelle', 'Columbia Valley Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.wine.com/list/wine/chateau-ste-michelle/vintage-2020/7155-102117-385
  ('Chateau Ste. Michelle', 'Columbia Valley Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.nataliemaclean.com/ontario/lcbo/stock/chateau-ste-michelle-cabernet-sauvignon-2014/231032
  ('Chateau Ste. Michelle', 'Pinot Gris', 'Columbia Valley, Washington, USA', 'Pinot Gris', 'White'),  -- https://www.wine.com/product/1114010
  ('Chateau Ste. Michelle', 'Dry Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.wine.com/list/wine/chateau-ste-michelle/white-wine/vintage-2017/7155-102117-125-382
  ('Chateau Ste. Michelle', 'Harvest Select Sweet Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.wine.com/product/chateau-ste-michelle-harvest-select-sweet-riesling-2018/604892
  ('Chateau Ste. Michelle', 'LIGHT Sauvignon Blanc', 'Columbia Valley, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.ste-michelle.com/our-wines
  ('Chateau Ste. Michelle', 'LIGHT Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Le Rosé', 'Columbia Valley, Washington, USA', null, 'Rosé'),  -- https://www.ste-michelle.com/csm/5637155138.c
  ('Chateau Ste. Michelle', 'Eroica Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.ste-michelle.com/csm/5637155138.c
  ('Chateau Ste. Michelle', 'Eroica XLC Dry Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Indian Wells Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/our-wines
  ('Chateau Ste. Michelle', 'Indian Wells Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Indian Wells Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Indian Wells Red Wine Blend', 'Columbia Valley, Washington, USA', null, 'Red'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Cold Creek Vineyard Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/csm/5637155138.c
  ('Chateau Ste. Michelle', 'Cold Creek Vineyard Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/csm/5637155138.c
  ('Chateau Ste. Michelle', 'Cold Creek Vineyard Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Cold Creek Vineyard Riesling', 'Columbia Valley, Washington, USA', 'Riesling', 'White'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Canoe Ridge Estate Cabernet Sauvignon', 'Horse Heaven Hills, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/csm/5637155138.c
  ('Chateau Ste. Michelle', 'Canoe Ridge Estate Merlot', 'Horse Heaven Hills, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Canoe Ridge Estate Chardonnay', 'Horse Heaven Hills, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Red Mountain Cabernet Sauvignon', 'Red Mountain, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/csm/5637155138.c
  ('Chateau Ste. Michelle', 'Ethos Reserve Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Ethos Reserve Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Ethos Reserve Merlot', 'Columbia Valley, Washington, USA', 'Merlot', 'Red'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=100
  ('Chateau Ste. Michelle', 'Horse Heaven Vineyard Sauvignon Blanc', 'Horse Heaven Hills, Washington, USA', 'Sauvignon Blanc', 'White'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Mimi Chardonnay', 'Columbia Valley, Washington, USA', 'Chardonnay', 'White'),  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=50
  ('Chateau Ste. Michelle', 'Mimi Cabernet Sauvignon', 'Columbia Valley, Washington, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.ste-michelle.com/all-wine/5637155140.c?skip=50
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JOSH CELLARS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Josh Cellars', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.joshcellars.com/products/josh-cellars-cabernet-sauvignon
  ('Josh Cellars', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.joshcellars.com/products/josh-cellars-chardonnay
  ('Josh Cellars', 'Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.joshcellars.com/products/josh-cellars-pinot-noir
  ('Josh Cellars', 'Hearth Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.joshcellars.com/products/josh-cellars-hearth-cabernet-sauvignon
  ('Josh Cellars', 'Legacy Red Blend', 'California, USA', null, 'Red'),  -- https://joshcellars.com/products/josh-cellars-legacy-red-blend
  ('Josh Cellars', 'Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://www.publix.com/pd/josh-cellars-merlot-california-red-wine/RIO-PCI-183115
  ('Josh Cellars', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://walmart.com/c/brand/josh-cellars
  ('Josh Cellars', 'Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://walmart.com/c/brand/josh-cellars
  ('Josh Cellars', 'Rosé', 'California, USA', null, 'Rosé'),  -- https://walmart.com/c/brand/josh-cellars
  ('Josh Cellars', 'Prosecco', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://walmart.com/c/brand/josh-cellars
  ('Josh Cellars', 'Prosecco Rosé', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://walmart.com/c/brand/josh-cellars
  ('Josh Cellars', 'Reserve Bourbon Barrel Aged Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.joshcellars.com/products/josh-cellars-reserve-bourbon-barrel-aged-cabernet-sauvignon
  ('Josh Cellars', 'Reserve Bourbon Barrel Aged Zinfandel', 'California, USA', 'Zinfandel', 'Red'),  -- https://www.joshcellars.com/products/josh-cellars-reserve-bourbon-barrel-aged-zinfandel
  ('Josh Cellars', 'Reserve North Coast Cabernet Sauvignon', 'North Coast, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.joshcellars.com/products/josh-cellars-reserve-north-coast-cabernet-sauvignon
  ('Josh Cellars', 'Reserve Paso Robles Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.joshcellars.com/products/josh-cellars-reserve-paso-robles-cabernet-sauvignon
  ('Josh Cellars', 'Reserve North Coast Chardonnay', 'North Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.joshcellars.com/products/josh-cellars-reserve-north-coast-chardonnay
  ('Josh Cellars', 'Reserve Central Coast Buttery Chardonnay', 'Central Coast, California, USA', 'Chardonnay', 'White'),  -- https://www.joshcellars.com/products/josh-cellars-reserve-buttery-chardonnay
  ('Josh Cellars', 'Reserve Alexander Valley Cabernet Sauvignon', 'Alexander Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/josh-cellars
  ('Josh Cellars', 'Reserve Lodi Cabernet Sauvignon', 'Lodi, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/josh-cellars
  ('Josh Cellars', 'Reserve Oregon Pinot Noir', 'Oregon, USA', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/josh-cellars
  ('Josh Cellars', 'Family Reserve North Coast Cabernet Sauvignon', 'North Coast, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/josh-cellars
  ('Josh Cellars', 'Family Reserve Paso Robles Cabernet Sauvignon', 'Paso Robles, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/wineries/josh-cellars
  ('Josh Cellars', 'Craftsman''s Collection Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/en/josh-cellars-craftsman-s-collection-cabernet-sauvignon-california/w/5068013
  ('Josh Cellars', 'Vintner''s Edition Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red')  -- https://www.vivino.com/en/wineries/josh-cellars
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MEIOMI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Meiomi', 'Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.meiomi.com/wine/meiomi-pinot-noir/
  ('Meiomi', 'Sonoma Coast Pinot Noir', 'Sonoma Coast, California, USA', 'Pinot Noir', 'Red'),  -- https://www.meiomi.com/wine/sonoma-coast-pinot-noir/
  ('Meiomi', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.meiomi.com/wine/meiomi-cabernet-sauvignon/
  ('Meiomi', 'Red Blend', 'California, USA', null, 'Red'),  -- https://www.meiomi.com/wine/meiomi-red-blend/
  ('Meiomi', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.meiomi.com/wine/meiomi-chardonnay/
  ('Meiomi', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://www.meiomi.com/wine/meiomi-sauvignon-blanc/
  ('Meiomi', 'Blanc', 'California, USA', null, 'White'),  -- https://www.meiomi.com/wine/meiomi-blanc/
  ('Meiomi', 'Bright Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://www.meiomi.com/wine/meiomi-bright-pinot-noir/
  ('Meiomi', 'Bright Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://www.meiomi.com/wine/meiomi-bright-chardonnay/
  ('Meiomi', 'Rosé', 'California, USA', null, 'Rosé')  -- https://www.kroger.com/p/meiomi-rose-blush-wine/0008600325105
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOGLE VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Bogle Vineyards', 'Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Merlot', 'California, USA', 'Merlot', 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Pinot Noir', 'California, USA', 'Pinot Noir', 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Essential Red', 'California, USA', null, 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Heritage Red', 'California, USA', null, 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Old Vine Zinfandel', 'California, USA', 'Zinfandel', 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Petite Sirah', 'California, USA', 'Petite Sirah', 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Tribute Blend', 'California, USA', null, 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Petite Sirah Port', 'California, USA', 'Petite Sirah', 'Fortified'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Pinot Grigio', 'California, USA', 'Pinot Grigio', 'White'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Riesling', 'California, USA', 'Riesling', 'White'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Chenin Blanc', 'California, USA', 'Chenin Blanc', 'White'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Viognier', 'California, USA', 'Viognier', 'White'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Reserve Chardonnay', 'California, USA', 'Chardonnay', 'White'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Reserve Sauvignon Blanc', 'California, USA', 'Sauvignon Blanc', 'White'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Reserve Albariño', 'California, USA', 'Albariño', 'White'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Reserve Merlot', 'Alexander Valley, California, USA', 'Merlot', 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Reserve Malbec', 'El Dorado County, California, USA', 'Malbec', 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Reserve Petite Sirah', 'Clarksburg, California, USA', 'Petite Sirah', 'Red'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Rosé', 'California, USA', null, 'Rosé'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Sparkling Rosé', 'California, USA', null, 'Sparkling'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Blanc de Blancs', 'California, USA', null, 'Sparkling'),  -- https://boglewinery.com/wine/
  ('Bogle Vineyards', 'Phantom', 'California, USA', null, 'Red')  -- https://www.albertsons.com/shop/product-details.960020877.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAYMUS VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_de_au_us.sql)'
from (values
  ('Caymus Vineyards', 'Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.wine.com/product/Caymus-Napa-Valley-Cabernet-Sauvignon-2023/3591840
  ('Caymus Vineyards', 'Special Selection Cabernet Sauvignon', 'Napa Valley, California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.wine.com/product/Caymus-Special-Selection-Cabernet-Sauvignon-2020/3905739
  ('Caymus Vineyards', 'California Cabernet Sauvignon', 'California, USA', 'Cabernet Sauvignon', 'Red'),  -- https://www.caymus.com/caymus-california-cab/
  ('Caymus Vineyards', 'Napa Valley Zinfandel', 'Napa Valley, California, USA', 'Zinfandel', 'Red')  -- https://www.caymus.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
