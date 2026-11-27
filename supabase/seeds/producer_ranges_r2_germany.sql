-- German producer ranges (round 2). Every row confirmed on a real page fetched 2026-11-26; source URL on each row.

-- ---- ROBERT WEIL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Robert Weil', 'Rheingau Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Kiedricher Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Kiedrich Klosterberg Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Kiedrich Turmberg Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Kiedrich Gräfenberg Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Rheingau Riesling Charta', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Rheingau Riesling halbtrocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Rheingau Riesling Tradition', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Rheingau Riesling Kabinett', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Rheingau Riesling Spätlese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Kiedrich Turmberg Riesling Spätlese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Kiedrich Gräfenberg Riesling Spätlese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Kiedrich Gräfenberg Riesling Auslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Kiedrich Gräfenberg Riesling Beerenauslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-robert-weil.com/en/wines/assortment/grosse-lage
  ('Robert Weil', 'Kiedrich Gräfenberg Riesling Trockenbeerenauslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-robert-weil.com/en/wines/assortment/grosse-lage
  ('Robert Weil', 'Rheingau Riesling Sekt Brut', 'Rheingau, Germany', 'Riesling', 'Sparkling'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Rheingau Riesling Sekt Extra Brut', 'Rheingau, Germany', 'Riesling', 'Sparkling'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Rheingau Riesling Sekt Brut Nature', 'Rheingau, Germany', 'Riesling', 'Sparkling'),  -- https://shop.weingut-robert-weil.com/
  ('Robert Weil', 'Kiedrich Turmberg Riesling Sekt Brut Nature', 'Rheingau, Germany', 'Riesling', 'Sparkling')  -- https://shop.weingut-robert-weil.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DR. BÜRKLIN-WOLF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Dr. Bürklin-Wolf', 'Kirchenstück G.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/gc.html
  ('Dr. Bürklin-Wolf', 'Pechstein G.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/gc.html
  ('Dr. Bürklin-Wolf', 'Ungeheuer G.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/gc.html
  ('Dr. Bürklin-Wolf', 'Kalkofen G.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/gc.html
  ('Dr. Bürklin-Wolf', 'Hohenmorgen G.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/gc.html
  ('Dr. Bürklin-Wolf', 'Langenmorgen G.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/gc.html
  ('Dr. Bürklin-Wolf', 'Gaisböhl G.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/gc.html
  ('Dr. Bürklin-Wolf', 'Reiterpfad G.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/gc.html
  ('Dr. Bürklin-Wolf', 'Goldbächel P.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/pc.html
  ('Dr. Bürklin-Wolf', 'Rechbächel P.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/pc.html
  ('Dr. Bürklin-Wolf', 'Gerümpel P.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/pc.html
  ('Dr. Bürklin-Wolf', 'Altenburg P.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/pc.html
  ('Dr. Bürklin-Wolf', 'Böhlig P.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/pc.html
  ('Dr. Bürklin-Wolf', 'Hoheburg P.C.', 'Pfalz, Germany', null, 'White'),  -- https://shop.buerklin-wolf.de/pc.html
  ('Dr. Bürklin-Wolf', 'Wachenheim Riesling Village', 'Pfalz, Germany', 'Riesling', 'White'),  -- https://shop.buerklin-wolf.de/village.html
  ('Dr. Bürklin-Wolf', 'Forst Riesling Village', 'Pfalz, Germany', 'Riesling', 'White'),  -- https://shop.buerklin-wolf.de/village.html
  ('Dr. Bürklin-Wolf', 'Deidesheim Riesling Village', 'Pfalz, Germany', 'Riesling', 'White'),  -- https://shop.buerklin-wolf.de/village.html
  ('Dr. Bürklin-Wolf', 'Ruppertsberg Riesling Village', 'Pfalz, Germany', 'Riesling', 'White'),  -- https://shop.buerklin-wolf.de/village.html
  ('Dr. Bürklin-Wolf', 'Riesling', 'Pfalz, Germany', 'Riesling', 'White'),  -- https://shop.buerklin-wolf.de/gutsweine.html
  ('Dr. Bürklin-Wolf', 'Weißburgunder', 'Pfalz, Germany', 'Weissburgunder', 'White'),  -- https://shop.buerklin-wolf.de/gutsweine.html
  ('Dr. Bürklin-Wolf', 'Hommage à Luise Riesling', 'Pfalz, Germany', 'Riesling', 'White'),  -- https://shop.buerklin-wolf.de/gutsweine.html
  ('Dr. Bürklin-Wolf', 'Cuvée Blanc', 'Pfalz, Germany', null, 'White'),  -- https://www.buerklin-wolf.de/
  ('Dr. Bürklin-Wolf', 'Cuvée Brut Sekt', 'Pfalz, Germany', null, 'Sparkling')  -- https://www.buerklin-wolf.de/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JOH. JOS. PRÜM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Joh. Jos. Prüm', 'Wehlener Sonnenuhr Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Graacher Himmelreich Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Bernkasteler Badstube Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Wehlener Sonnenuhr Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Graacher Himmelreich Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Bernkasteler Badstube Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Zeltinger Sonnenuhr Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Wehlener Sonnenuhr Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Graacher Himmelreich Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Zeltinger Sonnenuhr Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Bernkasteler Badstube Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Wehlener Sonnenuhr Riesling Auslese Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.bbr.com/producer-3454-weingut-joh-jos-prum
  ('Joh. Jos. Prüm', 'Graacher Himmelreich Riesling Auslese Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.bbr.com/producer-3454-weingut-joh-jos-prum
  ('Joh. Jos. Prüm', 'Zeltinger Sonnenuhr Riesling Auslese Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Bernkasteler Lay Riesling Auslese Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Bernkasteler Badstube Riesling Auslese Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Wehlener Sonnenuhr Riesling Auslese Lange Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Zeltinger Sonnenuhr Riesling Auslese Lange Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Bernkasteler Lay Riesling Auslese Lange Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://webalt.valckenberg.com/en/wineries/winery/2-weingut-joh-jos-pruem
  ('Joh. Jos. Prüm', 'Wehlener Sonnenuhr Riesling Beerenauslese', 'Mosel, Germany', 'Riesling', 'White')  -- https://www.bbr.com/producer-3454-weingut-joh-jos-prum?page=2
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRITZ HAAG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Fritz Haag', 'Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/vdp-gutswein
  ('Fritz Haag', 'Riesling feinherb', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/vdp-gutswein
  ('Fritz Haag', 'Brauneberg Riesling trocken -J-', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/vdp-aus-ersten-lagen
  ('Fritz Haag', 'Brauneberg Riesling Tradition', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/vdp-aus-ersten-lagen
  ('Fritz Haag', 'Brauneberger Juffer Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/vdp-grosse-lage
  ('Fritz Haag', 'Brauneberger Juffer Sonnenuhr Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/vdp-grosse-lage
  ('Fritz Haag', 'Brauneberger Juffer Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/praedikatsweine
  ('Fritz Haag', 'Brauneberger Juffer Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/praedikatsweine
  ('Fritz Haag', 'Brauneberger Juffer Sonnenuhr Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/praedikatsweine
  ('Fritz Haag', 'Brauneberger Juffer Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/praedikatsweine
  ('Fritz Haag', 'Brauneberger Juffer Sonnenuhr Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/praedikatsweine
  ('Fritz Haag', 'Brauneberger Juffer Riesling Auslese Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/praedikatsweine
  ('Fritz Haag', 'Brauneberger Juffer Sonnenuhr Riesling Auslese Goldkapsel', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/praedikatsweine
  ('Fritz Haag', 'Brauneberger Juffer Sonnenuhr Riesling Beerenauslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.weingut-fritz-haag.de/en/wines/praedikatsweine
  ('Fritz Haag', 'Brauneberger Juffer Riesling Trockenbeerenauslese', 'Mosel, Germany', 'Riesling', 'White')  -- https://www.weingut-fritz-haag.de/en/wines/praedikatsweine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- EGON MÜLLER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Egon Müller', 'Scharzhof Riesling', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.closdesmillesimes.com/61-marques-egon-muller.html?lang=5
  ('Egon Müller', 'Scharzhofberger Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.closdesmillesimes.com/61-marques-egon-muller.html?lang=5
  ('Egon Müller', 'Scharzhofberger Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.closdesmillesimes.com/61-marques-egon-muller.html?lang=5
  ('Egon Müller', 'Scharzhofberger Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.closdesmillesimes.com/61-marques-egon-muller.html?lang=5
  ('Egon Müller', 'Scharzhofberger Riesling Trockenbeerenauslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.closdesmillesimes.com/61-marques-egon-muller.html?lang=5
  ('Egon Müller', 'Le Gallais Wiltinger Braune Kupp Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.bbr.com/products-20188059400-2018-riesling-kabinett-wiltinger-braune-kupp-le-gallais-egon-muller-mosel-germany
  ('Egon Müller', 'Le Gallais Wiltinger Braune Kupp Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://onereddot.com/en/product/detail/2409/
  ('Egon Müller', 'Le Gallais Wiltinger Braune Kupp Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White')  -- https://www.closdesmillesimes.com/61-marques-egon-muller.html?lang=5
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SCHLOSS VOLLRADS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Schloss Vollrads', 'Schlossberg Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Greiffenberg Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/?p=2
  ('Schloss Vollrads', '1716 Cabinet Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', '1211 Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/?p=2
  ('Schloss Vollrads', 'Winkel Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Winkel Riesling Kabinett feinherb', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Winkel Riesling Kabinett Fruchtig-Süss', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Winkel Riesling Spätlese süß', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Winkel Riesling Feinherb', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/
  ('Schloss Vollrads', 'Rheingau Riesling Auslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Riesling Eiswein', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/?p=2
  ('Schloss Vollrads', 'Riesling Beerenauslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/?p=2
  ('Schloss Vollrads', 'Riesling Trockenbeerenauslese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/?p=2
  ('Schloss Vollrads', 'Die EDITION Gutsriesling', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Der Trockene Gutsriesling', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Der Feinherbe Gutsriesling', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Der Fruchtig-Süße Gutsriesling', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'VOLRATZ Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'VOLRATZ Riesling feinherb', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Goethe Rheingau Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'SOMMER Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Rheingau Riesling Sekt Brut', 'Rheingau, Germany', 'Riesling', 'Sparkling'),  -- https://shop.schlossvollrads.com/en/Weine/
  ('Schloss Vollrads', 'Rheingau Riesling Sekt Extra Brut', 'Rheingau, Germany', 'Riesling', 'Sparkling')  -- https://shop.schlossvollrads.com/en/Weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- REICHSGRAF VON KESSELSTATT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Reichsgraf von Kesselstatt', 'Kasel Nies''chen Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Josephshöfer Monopol Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Erden Treppchen Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Kasel Kehrnagel Riesling 1G trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Scharzhofberger Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Wehlen Sonnenuhr Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Ockfen Bockstein Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Josephshöfer Monopol Riesling Kabinett feinherb', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Ürzig Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Kasel Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Graach Spätburgunder trocken', 'Mosel, Germany', 'Spätburgunder', 'Red'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Schloss Marienlay Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Schloss Marienlay Riesling feinherb', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Schloss Marienlay Weissburgunder trocken', 'Mosel, Germany', 'Weissburgunder', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'RvK Weissburgunder trocken', 'Mosel, Germany', 'Weissburgunder', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Sommerpalais Riesling', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.kesselstatt.de
  ('Reichsgraf von Kesselstatt', 'Schloss Marienlay Riesling Sekt Brut', 'Mosel, Germany', 'Riesling', 'Sparkling')  -- https://www.kesselstatt.de
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DR. HERMANN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Dr. Hermann', 'Erdener Treppchen Riesling GG trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Lösnicher Försterlay Riesling GG trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Erdener Treppchen Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Erdener Treppchen Riesling Kabinett Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Ürziger Würzgarten Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Ürziger Würzgarten Riesling Kabinett Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Piesporter Goldtröpfchen Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Erdener Treppchen Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Ürziger Würzgarten Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Wehlener Sonnenuhr Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Piesporter Goldtröpfchen Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Erdener Herzlei Riesling Spätlese Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Erdener Treppchen Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Wehlener Sonnenuhr Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Erdener Prälat Riesling Auslese Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Erdener Herzlei Riesling Auslese Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Ürziger Würzgarten in der Kranklei Riesling Auslese Alte Reben', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Erdener Treppchen Riesling Trockenbeerenauslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Rotschiefer Riesling trocken', 'Mosel, Germany', 'Riesling', 'White'),  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
  ('Dr. Hermann', 'Riesling Kabinett feinherb', 'Mosel, Germany', 'Riesling', 'White')  -- https://weinstore.net/webshop/23.0/index.php?shop_id=Yim8KQAAyUNvU2CEmUqLSg==&user_id=Yim8KQAAxNkexAk6ZKzPLA==&site=startpage (Dr. Hermann estate webshop)
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ST. URBANS-HOF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('St. Urbans-Hof', 'Bockstein Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Goldtröpfchen Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Saarfeilser Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Layet Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Laurentiuslay Riesling GG', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Bockstein Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Bockstein Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Bockstein Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Goldtröpfchen Riesling Kabinett', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Goldtröpfchen Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Goldtröpfchen Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Saarfeilser Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Saarfeilser Riesling Auslese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Laurentiuslay Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Layet Riesling Spätlese', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Wiltinger Alte Reben', 'Mosel, Germany', null, 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Mehringer Alte Reben', 'Mosel, Germany', null, 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Ockfener Riesling', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Mosel Riesling', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Saar Riesling', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Schiefer Riesling', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.nikweis.com/weinliste/
  ('St. Urbans-Hof', 'Cuvée Clara Sekt Brut', 'Mosel, Germany', null, 'Sparkling')  -- https://www.nikweis.com/weinliste/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GUNDERLOCH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Gunderloch', 'Nackenheimer Rothenberg Riesling GG', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.saratogawine.com/?s=gunderloch&post_type=product
  ('Gunderloch', 'Niersteiner Pettenthal Riesling GG', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.saratogawine.com/?s=gunderloch&post_type=product
  ('Gunderloch', 'Niersteiner Hipping Riesling GG', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.saratogawine.com/?s=gunderloch&post_type=product
  ('Gunderloch', 'Nackenheimer Rothenberg Riesling Spätlese', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.saratogawine.com/?s=gunderloch&post_type=product
  ('Gunderloch', 'Jean-Baptiste Riesling Kabinett', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.libertywines.co.uk/our-portfolio/GU106-jean-baptiste-riesling-kabinett
  ('Gunderloch', 'Engelsberg Riesling', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.saratogawine.com/?s=gunderloch&post_type=product
  ('Gunderloch', 'Roter Hang Nierstein Riesling', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.libertywines.co.uk/our-portfolio/GU106-jean-baptiste-riesling-kabinett
  ('Gunderloch', 'Roter Schiefer Riesling trocken', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.systembolaget.se/produkt/vin/gunderloch-roter-schiefer-riesling-trocken-2025-7265801/
  ('Gunderloch', 'Redstone Riesling', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.libertywines.co.uk/our-portfolio/GU106-jean-baptiste-riesling-kabinett
  ('Gunderloch', 'Fritz''s Riesling', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.saratogawine.com/?s=gunderloch&post_type=product
  ('Gunderloch', 'Hasselbach Riesling trocken', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.saratogawine.com/?s=gunderloch&post_type=product
  ('Gunderloch', 'Rhinestone', 'Rheinhessen, Germany', null, 'White')  -- https://www.saratogawine.com/?s=gunderloch&post_type=product
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KÜNSTLER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Künstler', 'Hölle Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Kirchenstück Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Weiß Erd Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Marcobrunn Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Pfaffenberg Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Berg Rottland Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Berg Roseneck Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Berg Schlossberg Riesling GG', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Höllenberg Spätburgunder GG', 'Rheingau, Germany', 'Spätburgunder', 'Red'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Reichestal Spätburgunder GG', 'Rheingau, Germany', 'Spätburgunder', 'Red'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Hochheimer Kirchenstück ''Im Stein'' Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Hochheimer Hölle ''Im Neuenberg'' Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Hochheimer Domdechaney Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Hochheimer Stielweg Riesling ''Alte Reben'' trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Flörsheimer Herrnberg Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Hochheimer Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Hattenheimer Riesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Gutsriesling trocken', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Hochheimer Reichestal Riesling Kabinett', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Hattenheimer Pfaffenberg Riesling Spätlese', 'Rheingau, Germany', 'Riesling', 'White'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Hochheimer Stein Riesling extra brut', 'Rheingau, Germany', 'Riesling', 'Sparkling'),  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
  ('Künstler', 'Assmannshäuser Spätburgunder "Rotschiefer" trocken', 'Rheingau, Germany', 'Spätburgunder', 'Red')  -- https://www.weingut-kuenstler.de/online-shop/produkte.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WITTMANN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Wittmann', 'Westhofen Morstein Riesling GG', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-grosse-lage/
  ('Wittmann', 'Westhofen Brunnenhäuschen Riesling GG', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-grosse-lage/
  ('Wittmann', 'Westhofen Kirchspiel Riesling GG', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-grosse-lage/
  ('Wittmann', 'Westhofen Aulerde Riesling GG', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-grosse-lage/
  ('Wittmann', 'Gundersheim Höllenbrand Riesling', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-grosse-lage/
  ('Wittmann', 'Höllenbrand Spätburgunder GG', 'Rheinhessen, Germany', 'Spätburgunder', 'Red'),  -- https://www.weingutwittmann.de/en/weine/vdp-grosse-lage/
  ('Wittmann', 'La Borne Riesling Alte Reben', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-grosse-lage/
  ('Wittmann', 'Brunnenhäuschen Riesling Auslese', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-grosse-lage/
  ('Wittmann', 'Westhofener Riesling', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-aus-ersten-lagen/
  ('Wittmann', 'Niersteiner Riesling', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-aus-ersten-lagen/
  ('Wittmann', 'Gundersheimer Riesling', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-aus-ersten-lagen/
  ('Wittmann', 'Westhofener Steingrube Chardonnay', 'Rheinhessen, Germany', 'Chardonnay', 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-aus-ersten-lagen/
  ('Wittmann', 'Westhofener Steingrube Spätburgunder', 'Rheinhessen, Germany', 'Spätburgunder', 'Red'),  -- https://www.weingutwittmann.de/en/weine/vdp-aus-ersten-lagen/
  ('Wittmann', 'Westhofener Weisser Burgunder & Chardonnay', 'Rheinhessen, Germany', null, 'White'),  -- https://www.weingutwittmann.de/en/weine/vdp-ortswein/
  ('Wittmann', 'Riesling Estate', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/estate-wines/
  ('Wittmann', 'Riesling vom Kalkstein', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/estate-wines/
  ('Wittmann', 'Weisser Burgunder', 'Rheinhessen, Germany', 'Weissburgunder', 'White'),  -- https://www.weingutwittmann.de/en/weine/estate-wines/
  ('Wittmann', 'Grauer Burgunder', 'Rheinhessen, Germany', 'Grauburgunder', 'White'),  -- https://www.weingutwittmann.de/en/weine/estate-wines/
  ('Wittmann', 'Spätburgunder', 'Rheinhessen, Germany', 'Spätburgunder', 'Red'),  -- https://www.weingutwittmann.de/en/weine/estate-wines/
  ('Wittmann', 'Riesling Auslese', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.weingutwittmann.de/en/weine/estate-wines/
  ('Wittmann', 'Weisser Burgunder Réserve', 'Rheinhessen, Germany', 'Weissburgunder', 'White'),  -- https://www.weingutwittmann.de/en/weine/reserve-weine/
  ('Wittmann', 'Chardonnay Réserve', 'Rheinhessen, Germany', 'Chardonnay', 'White')  -- https://www.weingutwittmann.de/en/weine/reserve-weine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DÖNNHOFF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Dönnhoff', 'Hermannshöhle Riesling GG', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Dellchen Riesling GG', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Felsenberg "Felsentürmchen" Riesling GG', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Höllenpfad im Mühlenberg Riesling GG', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Krötenpfuhl Riesling GG', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Oberhausener Brücke Riesling GG', 'Nahe, Germany', 'Riesling', 'White'),  -- https://www.decanter.com/wine-reviews/germany/nahe/doennhoff-oberhausener-bruecke-riesling-grosses-gewaechs-24133/
  ('Dönnhoff', 'Kreuznacher Kahlenberg Riesling trocken', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Roxheimer Höllenpfad Riesling trocken', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Schlossböckelheimer Riesling trocken', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Tonschiefer Riesling trocken', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Riesling trocken', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/trockene-rieslinge.html
  ('Dönnhoff', 'Riesling feinherb', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Kreuznacher Krötenpfuhl Riesling Kabinett', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Oberhäuser Leistenberg Riesling Kabinett', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Niederhäuser Klamm Riesling Kabinett', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Norheimer Kirschheck Riesling Spätlese', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Oberhäuser Brücke Riesling Spätlese', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Niederhäuser Hermannshöhle Riesling Spätlese', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Oberhäuser Brücke Riesling Auslese Goldkapsel', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Niederhäuser Hermannshöhle Riesling Auslese Goldkapsel', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Norheimer Dellchen Riesling Auslese Goldkapsel', 'Nahe, Germany', 'Riesling', 'White'),  -- https://shop.doennhoff.com/fruchtige-rieslinge.html
  ('Dönnhoff', 'Weißburgunder', 'Nahe, Germany', 'Weißburgunder', 'White'),  -- https://shop.doennhoff.com/trockene-burgunder.html
  ('Dönnhoff', 'Grauburgunder', 'Nahe, Germany', 'Grauburgunder', 'White')  -- https://shop.doennhoff.com/trockene-burgunder.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BLACK TOWER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Black Tower', 'Fruity White', 'European Union', null, 'White'),  -- https://www.reh-kendermann.de/en/produkt/fruity-white-2/
  ('Black Tower', 'Riesling', 'Rhein, Germany', 'Riesling', 'White'),  -- https://www.reh-kendermann.de/en/produkt/87353/
  ('Black Tower', 'Fresh Rosé', 'Germany', null, 'Rosé'),  -- https://uk.black-tower.wine/
  ('Black Tower', 'Silvaner Pinot Grigio', 'Germany', null, 'White'),  -- https://uk.black-tower.wine/
  ('Black Tower', 'Smooth Red', 'Germany', null, 'Red'),  -- https://uk.black-tower.wine/
  ('Black Tower', 'Bubbly White', 'Germany', null, 'Sparkling'),  -- https://uk.black-tower.wine/
  ('Black Tower', 'Bubbly Pink', 'Germany', null, 'Sparkling'),  -- https://uk.black-tower.wine/
  ('Black Tower', 'Zero White 0.0', 'Germany', null, 'White'),  -- https://uk.black-tower.wine/
  ('Black Tower', 'Rosé 0.0', 'Germany', null, 'Rosé'),  -- https://uk.black-tower.wine/
  ('Black Tower', 'B by Black Tower White', 'Germany', null, 'White'),  -- https://uk.black-tower.wine/
  ('Black Tower', 'B by Black Tower Rosé', 'Germany', null, 'Rosé'),  -- https://uk.black-tower.wine/
  ('Black Tower', 'Riesling Gewürztraminer', 'Germany', null, 'White'),  -- https://www.reh-kendermann.de/en/produkt/fruity-white-2/
  ('Black Tower', 'Rivaner', 'Germany', 'Rivaner', 'White')  -- https://www.reh-kendermann.de/en/produkt/fruity-white-2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SCHMITT SÖHNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Schmitt Söhne', 'Riesling QbA Dry', 'Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-schmitt-soehne-family-wines-1135774224
  ('Schmitt Söhne', 'Riesling QbA', 'Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-schmitt-soehne-family-wines-1135774224
  ('Schmitt Söhne', 'Riesling Kabinett', 'Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-schmitt-soehne-family-wines-1135774224
  ('Schmitt Söhne', 'Riesling Spätlese', 'Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-schmitt-soehne-family-wines-1135774224
  ('Schmitt Söhne', 'Riesling Auslese', 'Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-schmitt-soehne-family-wines-1135774224
  ('Schmitt Söhne', 'Bereich Bernkastel QbA', 'Mosel, Germany', null, 'White'),  -- https://www.schmitt-soehne.com/products/c-mosel-selection-2144169776
  ('Schmitt Söhne', 'Piesporter Michelsberg QbA', 'Mosel, Germany', null, 'White'),  -- https://www.schmitt-soehne.com/products/c-mosel-selection-2144169776
  ('Schmitt Söhne', 'Liebfraumilch QbA', 'Rhein, Germany', null, 'White'),  -- https://www.schmitt-soehne.com/products/c-rhine-selection-1470334937
  ('Schmitt Söhne', 'Niersteiner Gutes Domtal QbA', 'Rheinhessen, Germany', null, 'White'),  -- https://www.schmitt-soehne.com/products/c-rhine-selection-1470334937
  ('Schmitt Söhne', 'Hock Deutscher Landwein Rhein', 'Rhein, Germany', null, 'White'),  -- https://www.schmitt-soehne.com/products/c-rhine-selection-1470334937
  ('Thomas Schmitt', 'Riesling QbA Dry Estate Bottled', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-thomas-schmitt-private-collection-880368880
  ('Thomas Schmitt', 'Riesling QbA Estate Bottled', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-thomas-schmitt-private-collection-880368880
  ('Thomas Schmitt', 'Riesling Kabinett Estate Bottled', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-thomas-schmitt-private-collection-880368880
  ('Thomas Schmitt', 'Riesling Spätlese Estate Bottled', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-thomas-schmitt-private-collection-880368880
  ('Thomas Schmitt', 'Riesling Auslese Estate Bottled', 'Mosel, Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-thomas-schmitt-private-collection-880368880
  ('Thomas Schmitt', 'Pinot Noir Estate Bottled', 'Mosel, Germany', 'Pinot Noir', 'Red'),  -- https://www.schmitt-soehne.com/products/c-thomas-schmitt-private-collection-880368880
  ('Global Roaming', 'Riesling QbA Dry', 'Rheinhessen, Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-global-roaming-1644634444
  ('Global Roaming', 'Pinot Noir Dry', 'Rheinhessen, Germany', 'Pinot Noir', 'Red'),  -- https://www.schmitt-soehne.com/products/c-global-roaming-1644634444
  ('Relax', 'Riesling QbA', 'Germany', 'Riesling', 'White'),  -- https://www.schmitt-soehne.com/products/c-relax-wines-still-and-sparkling-1046361563
  ('Relax', 'Rosé QbA', 'Germany', null, 'Rosé')  -- https://www.schmitt-soehne.com/products/c-relax-wines-still-and-sparkling-1046361563
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BLUE NUN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Blue Nun', 'Authentic White', 'Rhein, Germany', null, 'White'),  -- https://www.bluenun.wine/product/authentic-white
  ('Blue Nun', 'Riesling', 'Rhein, Germany', 'Riesling', 'White'),  -- https://www.bluenun.wine/product/riesling
  ('Blue Nun', 'Cabernet Sauvignon', 'Languedoc, France', 'Cabernet Sauvignon', 'Red'),  -- https://www.bluenun.wine/product/cabernet-sauvignon
  ('Blue Nun', 'Alcohol-Free White', 'Germany', null, 'White'),  -- https://www.bluenun.wine/wines
  ('Blue Nun', 'Alcohol-Free Red', 'Germany', null, 'Red'),  -- https://www.bluenun.wine/wines
  ('Blue Nun', '24K Gold Edition', 'Germany', null, 'Sparkling'),  -- https://www.bluenun.wine/product/24k-gold-edition
  ('Blue Nun', '24K Rosé Edition', 'Germany', null, 'Sparkling'),  -- https://www.bluenun.wine/wines
  ('Blue Nun', 'Sparkling Silver Edition', 'Germany', null, 'Sparkling'),  -- https://www.bluenun.wine/wines
  ('Blue Nun', 'Eiswein', 'Germany', null, 'White'),  -- https://www.bluenun.wine/product/eiswein
  ('Blue Nun', 'Rivaner', 'Germany', 'Rivaner', 'White')  -- https://www.bluenun.wine/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLEAN SLATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_germany.sql)'
from (values
  ('Clean Slate', 'Riesling', 'Mosel, Germany', 'Riesling', 'White')  -- https://www.instacart.com/products/46518-clean-slate-riesling-mosel-germany-750-ml
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
