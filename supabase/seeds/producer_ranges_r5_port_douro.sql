-- Producer ranges round 5: Port and Douro. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- GRAHAM'S ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Graham''s', 'Quinta do Tua Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Quinta dos Malvedos Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'The Stone Terraces Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Bicentenary Collection Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'The Cellar Master''s Trilogy Single Harvest Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Ambassadors Exclusive Single Harvest Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'First Flight Single Harvest Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Ne Oublie Single Harvest Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wine/ne-oublie/20
  ('Graham''s', 'Lodge Edition Single Harvest Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Single Harvest Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Bicentenary Collection Single Harvest Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'The Tawny', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', '10 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', '20 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', '30 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', '40 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', '50 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', '80 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Six Grapes Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Six Grapes Vila Velha Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Natura Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Six Grapes Old Vines Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Six Grapes River Quintas Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Quinta dos Malvedos Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Blend Nº5 White Port', 'Porto, Douro, Portugal', 'Malvasia Fina, Moscatel Galego', 'Fortified'),  -- https://www.grahams-port.com/wine/blend-n-5/55
  ('Graham''s', 'Blend Nº12 Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wine/blend-n-12/66
  ('Graham''s', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.grahams-port.com/wines
  ('Graham''s', 'Extra Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.grahams-port.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOW'S ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Dow''s', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wines
  ('Dow''s', 'Quinta do Bomfim Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wines
  ('Dow''s', 'Quinta da Senhora da Ribeira Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wines
  ('Dow''s', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wines
  ('Dow''s', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wine-cat/aged-tawny
  ('Dow''s', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wine-cat/aged-tawny
  ('Dow''s', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wine-cat/aged-tawny
  ('Dow''s', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wine-cat/aged-tawny
  ('Dow''s', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wines
  ('Dow''s', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wine-cat/classic
  ('Dow''s', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wine-cat/classic
  ('Dow''s', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.dows-port.com/wine-cat/classic
  ('Dow''s', 'Nirvana Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.dows-port.com/wine-cat/reserve/16
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WARRE'S ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Warre''s', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/
  ('Warre''s', 'Cavadinha Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/
  ('Warre''s', 'Bottle-Matured Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/
  ('Warre''s', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/
  ('Warre''s', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/
  ('Warre''s', 'Otima 10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/wine/otima/15
  ('Warre''s', 'Otima 20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/wine/otima/15
  ('Warre''s', 'Warrior Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/
  ('Warre''s', 'White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/
  ('Warre''s', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.warre.com/
  ('Warre''s', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.warre.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COCKBURN'S ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Cockburn''s', 'Special Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', 'White Heights Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', 'Ruby Soho Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', 'Tawny Eyes Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-ports
  ('Cockburn''s', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.cockburns.com/our-vintage
  ('Cockburn''s', 'Quinta dos Canais Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.cockburns.com/our-vintage
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUINTA DO VESUVIO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Quinta do Vesuvio', 'Douro DOC', 'Douro, Portugal', 'Touriga Nacional, Touriga Franca, Tinta Amarela', 'Red'),  -- https://www.quintadovesuvio.com/wine-cat/douro-doc-wines/1?wine=2
  ('Quinta do Vesuvio', 'Pombal do Vesúvio', 'Douro, Portugal', 'Touriga Nacional, Touriga Franca, Tinta Amarela', 'Red'),  -- https://www.quintadovesuvio.com/wine-cat/douro-doc-wines/1?wine=2
  ('Quinta do Vesuvio', 'Comboio do Vesúvio', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovesuvio.com/wine-cat/douro-doc-wines/1?wine=2
  ('Quinta do Vesuvio', 'Comboio do Vesúvio White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadovesuvio.com/wine-cat/douro-doc-wines/1?wine=2
  ('Quinta do Vesuvio', 'Capela do Vesúvio Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovesuvio.com/wines
  ('Quinta do Vesuvio', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.quintadovesuvio.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PRATS & SYMINGTON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Prats & Symington', 'Chryseia', 'Douro, Portugal', 'Touriga Nacional, Touriga Franca', 'Red'),  -- https://www.chryseia.com/
  ('Prats & Symington', 'Post Scriptum de Chryseia', 'Douro, Portugal', 'Touriga Nacional, Touriga Franca, Tinta Roriz, Tinta Barroca', 'Red'),  -- https://www.chryseia.com/wine/post-scriptum-de-chryseia/2
  ('Prats & Symington', 'Prazo de Roriz', 'Douro, Portugal', 'Touriga Nacional, Tinta Roriz, Tinta Barroca, Touriga Franca', 'Red'),  -- https://www.chryseia.com/wine/prazo-de-roriz/3
  ('Prats & Symington', 'Quinta de Roriz Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.chryseia.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SYMINGTON FAMILY ESTATES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Symington Family Estates', 'Altano Douro Red', 'Douro, Portugal', 'Touriga Franca, Tinta Roriz, Tinta Barroca', 'Red'),  -- https://en.altano.pt/wines
  ('Symington Family Estates', 'Altano Douro White', 'Douro, Portugal', 'Malvasia Fina, Viosinho, Rabigato, Moscatel Galego', 'White'),  -- https://en.altano.pt/wines
  ('Symington Family Estates', 'Altano Rewilding Red', 'Douro, Portugal', null, 'Red'),  -- https://www.symington.com/portfolio.php?order=relevance&page=5
  ('Symington Family Estates', 'Altano Rewilding White', 'Douro, Portugal', null, 'White'),  -- https://www.symington.com/our-wines
  ('Symington Family Estates', 'Altano Rosé Biológico', 'Douro, Portugal', 'Tinta Roriz, Tinta Barroca, Tinto Cão', 'Rosé'),  -- https://en.altano.pt/wines
  ('Symington Family Estates', 'Altano Douro Bio Red', 'Douro, Portugal', 'Touriga Franca, Tinta Roriz, Tinta Barroca, Touriga Nacional, Tinto Cão', 'Red'),  -- https://en.altano.pt/wines
  ('Symington Family Estates', 'Altano Douro Reserve White', 'Douro, Portugal', 'Viosinho, Arinto, Gouveio', 'White'),  -- https://en.altano.pt/wines
  ('Symington Family Estates', 'Altano Douro Reserve Red', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://en.altano.pt/wines
  ('Symington Family Estates', 'Quinta do Ataíde Douro', 'Douro, Portugal', 'Touriga Nacional, Touriga Franca', 'Red'),  -- https://www.symington.com/brand/quinta-do-ataide/11
  ('Symington Family Estates', 'Quinta do Ataíde Vinha do Arco', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://www.symington.com/brand/quinta-do-ataide/11
  ('Symington Family Estates', 'Quinta do Ataíde Alicante Bouschet', 'Douro, Portugal', 'Alicante Bouschet', 'Red')  -- https://www.symington.com/our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SMITH WOODHOUSE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Smith Woodhouse', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.bbr.com/producer-1204-smith-woodhouse
  ('Smith Woodhouse', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://theliquorbarn.com/collections/smith-woodhouse
  ('Smith Woodhouse', '10 Year Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://theliquorbarn.com/collections/smith-woodhouse
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GOULD CAMPBELL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Gould Campbell', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.vintagewineandport.co.uk/products/Gould-Campbell-Vintage-Port-2003-Vintage-Port
  ('Gould Campbell', '10 Year Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.bighammerwines.com/products/gould-campbell-10-year-tawny-port
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TAYLOR FLADGATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Taylor Fladgate', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Vargellas Vinha Velha Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Quinta de Vargellas Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Quinta de Terra Feita Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Sentinels Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'First Estate Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Select Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Select Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Very Very Old Port (VVOP)', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Victory Port 80 Year Old Tawny', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Golden Age 50 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Historical Collection Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Kingsman Edition Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Single Harvest Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Scion', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Platinum Jubilee Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Coronation Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Chip Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'VVOP White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'Porto City Edition Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.taylor.pt/en
  ('Taylor Fladgate', 'London City Edition Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.taylor.pt/en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FONSECA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Fonseca', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'Guimaraens Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'Quinta do Panascal Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'Bin 27 Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'Terra Prima Organic Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'Crusted Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'Siroco White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.fonseca.pt/en
  ('Fonseca', 'White Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.fonseca.pt/en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CROFT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Croft', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Quinta da Roêda Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Serikos Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Reserve Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Reserve Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Purple Velvet Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Triple Crown Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Distinction Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Extravagance Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Indulgence Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Pink Rosé Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://croftport.com/en/products/
  ('Croft', '430th Anniversary Celebration Edition Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://croftport.com/en/products/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KROHN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Krohn', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/niepoort-port-wines/1895-krohn-vintage-2016-port-wine-5602840035075.html
  ('Krohn', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://liquorama.com/krohn-20-year-old-tawny-port-750ml.html
  ('Krohn', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', 'Touriga Nacional, Tinta Barroca, Touriga Franca', 'Fortified'),  -- https://farehamwinecellar.co.uk/Products/wine/port/krohn-late-bottled-vintage-port/
  ('Krohn', 'Quinta do Retiro Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/115-krohn
  ('Krohn', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://londonwinecompetition.com/en/competition-shelf-talkers/2024/special-awards/11235/
  ('Krohn', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://londonwinecompetition.com/en/competition-shelf-talkers/2024/special-awards/11213/
  ('Krohn', 'Lagrima White Port', 'Porto, Douro, Portugal', 'Codega, Rabigato, Verdelho', 'Fortified'),  -- https://martinez.co.uk/browse/search/FORTIP063/
  ('Krohn', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://worldoffinewine.com/wines/19507/krohn-30-year-old-tawny-porto
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SANDEMAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Sandeman', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Imperial Reserve Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', '50 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Very Old Tawny Cask 33 Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Founders Reserve Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Apitiv Reserve White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Beat White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', '10 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Quinta do Seixo Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.sandeman.com/port-wine/
  ('Sandeman', 'Beat Rosé Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.sandeman.com/port-wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FERREIRA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Ferreira', 'Casa Ferreirinha Esteva Douro Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Papa Figos Douro Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Vinha Grande Douro Branco', 'Douro, Portugal', null, 'White'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Vinha Grande Douro Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Planalto Douro Branco', 'Douro, Portugal', null, 'White'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Quinta da Leda Douro Tinto', 'Douro, Portugal', 'Touriga Franca, Touriga Nacional, Tinto Cão, Tinta Roriz, Sousão', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Reserva Especial Douro Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Barca Velha Douro Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Callabriga Douro Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Vinha Grande Douro Rosé', 'Douro, Portugal', 'Touriga Nacional', 'Rosé'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Papa Figos Douro Branco', 'Douro, Portugal', 'Rabigato, Viosinho, Gouveio, Arinto, Códega', 'White'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Casa Ferreirinha Castas Escondidas Douro Tinto', 'Douro, Portugal', 'Bastardo, Marufo Tinto, Touriga Fêmea, Tinta Francisca', 'Red'),  -- https://www.libertywines.co.uk/our-producers/GCF04PT-casa-ferreirinha
  ('Ferreira', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Quinta do Porto Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Dona Antónia Reserva White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Dona Antónia 10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Dona Antónia 20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Dona Antónia 10 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Dona Antónia 30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GFE04PT-ferreira
  ('Ferreira', 'Duque de Bragança 20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://tastingbook.com/wine/ferreira/20_yr_tawny_duque_de_braganca_nv10?locale=en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- OFFLEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Offley', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GOF01PT-offley
  ('Offley', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GOF01PT-offley
  ('Offley', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GOF01PT-offley
  ('Offley', 'Rosé Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GOF01PT-offley
  ('Offley', 'Vintage Port', 'Porto, Douro, Portugal', 'Touriga Franca, Touriga Nacional, Sousão', 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GOF01PT-offley
  ('Offley', 'Forrester Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.libertywines.co.uk/our-producers/GOF01PT-offley
  ('Offley', 'Boa Vista Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/461-offley
  ('Offley', 'Lágrima Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/461-offley
  ('Offley', 'Reserva Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/461-offley
  ('Offley', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/461-offley
  ('Offley', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/461-offley
  ('Offley', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/461-offley
  ('Offley', 'White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/461-offley?page=2
  ('Offley', 'Cachucha Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.saq.com/en/582064
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KOPKE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Kopke', 'Colheita Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Colheita White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Very Old Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '50 Years Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '50 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '40 Years Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '40 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '30 Years Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '30 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '20 Years Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '20 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '10 Years Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', '10 Years Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Quinta S. Luiz Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Reserve Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Special Reserve Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Fine White & Dry Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Lágrima White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'CNK Very Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://kopke1638.com/store/
  ('Kopke', 'São Luiz Colheita Tinto', 'Douro, Portugal', null, 'Red'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Colheita Branco', 'Douro, Portugal', null, 'White'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Colheita Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Colheita Biológico Tinto', 'Douro, Portugal', null, 'Red'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Muros Tinto', 'Douro, Portugal', null, 'Red'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Muros Branco', 'Douro, Portugal', null, 'White'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Reserva Branco', 'Douro, Portugal', null, 'White'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Reserva Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Grande Reserva Branco', 'Douro, Portugal', null, 'White'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Grande Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://kopke1638.com/saoluiz/
  ('Kopke', 'São Luiz Winemaker''s Collection Tinto Cão Rosé', 'Douro, Portugal', null, 'Rosé')  -- https://kopke1638.com/saoluiz/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BURMESTER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Burmester', 'White Reserve Helmsman Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Quinta do Arnozelo Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Extra Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', '10 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', '20 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', '30 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Sotto Voce Special Reserve Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Jockey Club Special Reserve Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Tordiz 40 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Quinta do Arnozelo Grande Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Tavedo Branco', 'Douro, Portugal', null, 'White'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Tavedo Tinto', 'Douro, Portugal', null, 'Red'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Tavedo Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Douro Branco', 'Douro, Portugal', null, 'White'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Douro Tinto', 'Douro, Portugal', null, 'Red'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Casa Branco', 'Douro, Portugal', null, 'White'),  -- https://burmester.pt/vinhos/
  ('Burmester', 'Casa Tinto', 'Douro, Portugal', null, 'Red')  -- https://burmester.pt/vinhos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CÁLEM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Cálem', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/tawny/
  ('Cálem', 'Special Reserve Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/tawny/
  ('Cálem', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/tawny/
  ('Cálem', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/tawny/
  ('Cálem', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/tawny/
  ('Cálem', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/tawny/
  ('Cálem', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/tawny/
  ('Cálem', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/ruby/
  ('Cálem', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/ruby/
  ('Cálem', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/ruby/
  ('Cálem', 'White & Dry Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/white/
  ('Cálem', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/white/
  ('Cálem', 'Lágrima White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/white/
  ('Cálem', 'Rosé Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://calem.pt/portfolio/category/rose/
  ('Cálem', 'Velhotes Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://velhotes.calem.pt/
  ('Cálem', 'Velhotes Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://velhotes.calem.pt/
  ('Cálem', 'Velhotes White Lágrima Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://velhotes.calem.pt/
  ('Cálem', 'Velhotes White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://velhotes.calem.pt/
  ('Cálem', 'Velhotes Special Reserve Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://velhotes.calem.pt/
  ('Cálem', 'Velhotes Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://velhotes.calem.pt/
  ('Cálem', 'Velhotes 10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://velhotes.calem.pt/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RAMOS PINTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Ramos Pinto', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Quinta de Ervamoira 10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Quinta de Ervamoira Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Quinta do Bom Retiro 20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Quinta do Bom Retiro Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Collector Reserva Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto/collector-reserva/non-vintage
  ('Ramos Pinto', 'Lágrima Port', 'Porto, Douro, Portugal', 'Códega, Malvasia Fina, Rabigato', 'Fortified'),  -- https://mmdusa.net/portfolio/ramos-pinto/lagrima/non-vintage
  ('Ramos Pinto', 'Urtiga', 'Douro, Portugal', null, 'Red'),  -- https://mmdusa.net/portfolio/ramos-pinto/douro-doc-urtiga/2018
  ('Ramos Pinto', 'Duas Quintas Tinto', 'Douro, Portugal', null, 'Red'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Duas Quintas Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Duas Quintas Branco', 'Douro, Portugal', null, 'White'),  -- https://mmdusa.net/portfolio/ramos-pinto
  ('Ramos Pinto', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=ramos+pinto
  ('Ramos Pinto', 'Quinta do Bom Retiro 30 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=ramos+pinto
  ('Ramos Pinto', '20 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=ramos+pinto
  ('Ramos Pinto', '50 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=ramos+pinto
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHURCHILL'S ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Churchill''s', 'Ruby Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Crusted Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Quinta da Gricha Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Grande Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Grafite Grande Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Meio Queijo Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Meio Queijo Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Grafite Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Meio Queijo Branco', 'Douro, Portugal', null, 'White'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
  ('Churchill''s', 'Grafite Branco', 'Douro, Portugal', null, 'White')  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=churchill
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUINTA DO NOVAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Quinta do Noval', 'Noval Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Noval Black Ruby Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Late Bottled Vintage Unfiltered Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Noval Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Noval Tawny Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', '50 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', '80 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Nacional Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Noval Extra Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Noval Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Noval Lágrima Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadonoval.com/en/theports/quintadonoval
  ('Quinta do Noval', 'Maria Mansa White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Maria Mansa Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Cedro do Noval White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Cedro do Noval Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Cedro do Noval Reserva Vinho Branco', 'Douro, Portugal', null, 'White'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Cedro do Noval Reserva Vinho Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Tinto Cão', 'Douro, Portugal', 'Tinto Cão', 'Red'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Syrah', 'Douro, Portugal', 'Syrah', 'Red'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Petit Verdot', 'Douro, Portugal', 'Petit Verdot', 'Red'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Touriga Nacional', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Reserva Vinho Branco', 'Douro, Portugal', null, 'White'),  -- https://www.quintadonoval.com/en/unfortifiedwines/quintadonoval
  ('Quinta do Noval', 'Reserva Tinto', 'Douro, Portugal', 'Touriga Nacional, Touriga Francesa', 'Red'),  -- https://www.quintadonoval.com/en/vin/19/quinta-do-noval-reserva
  ('Quinta do Noval', 'Vinhas da Marka', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadonoval.com/en/vin/35/quinta-do-noval-vinhas-da-marka
  ('Quinta do Noval', 'Vinhas do Passadouro', 'Douro, Portugal', null, 'Red')  -- https://www.quintadonoval.com/en/vin/36/quinta-do-noval-vinhas-do-passadouro
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NIEPOORT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Niepoort', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Garrafeira Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Secundum Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Bioma Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Bioma Vinha Velha Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Party Tawny Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'VV Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', '10 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'White Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', '10 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', '20 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', '30 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+porto
  ('Niepoort', 'Turris Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+tinto
  ('Niepoort', 'Redoma Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+tinto
  ('Niepoort', 'Batuta Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+tinto
  ('Niepoort', 'Diálogo Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+tinto
  ('Niepoort', 'Eduardo''s Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+tinto
  ('Niepoort', 'Quinta de Nápoles Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+tinto
  ('Niepoort', 'Vertente Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+tinto
  ('Niepoort', 'Nat Cool Voyeur Tinto', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+tinto
  ('Niepoort', 'Redoma Reserva Branco', 'Douro, Portugal', null, 'White'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+branco
  ('Niepoort', 'Diálogo Branco', 'Douro, Portugal', null, 'White'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+branco
  ('Niepoort', 'Tiara Branco', 'Douro, Portugal', null, 'White'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+branco
  ('Niepoort', 'Redoma Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+ros%C3%A9
  ('Niepoort', 'Redoma Reserva Rosé', 'Douro, Portugal', null, 'Rosé')  -- https://www.garrafeiranacional.com/catalogsearch/result/?q=niepoort+ros%C3%A9
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUINTA DE LA ROSA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Quinta de la Rosa', 'Tim Grande Reserva', 'Douro, Portugal', 'Arinto, Alvarinho', 'White'),  -- https://www.quintadelarosa.com/wine/tim-grande-reserva
  ('Quinta de la Rosa', 'Reserva White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'Douro White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'Vale do Inferno', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://www.quintadelarosa.com/wine/vale-do-inferno
  ('Quinta de la Rosa', 'Grande Reserva Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'Reserva Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'douROSA', 'Douro, Portugal', 'Touriga Nacional, Touriga Franca, Tinta Roriz', 'Red'),  -- https://www.quintadelarosa.com/wine/dou-rosa
  ('Quinta de la Rosa', 'Douro Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'Cerejinha', 'Douro, Portugal', 'Alvarinho, Arinto', 'White'),  -- https://www.quintadelarosa.com/wine/cerejinha
  ('Quinta de la Rosa', 'Gouveio', 'Douro, Portugal', 'Gouveio', 'White'),  -- https://www.quintadelarosa.com/wine/gouveio
  ('Quinta de la Rosa', 'Tinto Cão', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'La Rosa Leve', 'Douro, Portugal', 'Tinta Roriz, Tinto Cão, Baga, Bastardo', 'Red'),  -- https://www.quintadelarosa.com/wine/la-rosa-leve
  ('Quinta de la Rosa', 'Passagem Grande Reserva', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://www.quintadelarosa.com/passagem/passagem-grande-reserva
  ('Quinta de la Rosa', 'Passagem Reserva Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'Passagem Reserva White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'Passagem Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'Passagem White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadelarosa.com/wine
  ('Quinta de la Rosa', 'Passagem SY', 'Douro, Portugal', 'Syrah', 'Red'),  -- https://www.quintadelarosa.com/passagem/passagem-sy
  ('Quinta de la Rosa', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', 'Finest Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', 'Ruby Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', 'White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadelarosa.com/port
  ('Quinta de la Rosa', 'Rosé Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.quintadelarosa.com/port
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUINTA DO CRASTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Quinta do Crasto', 'Vinha da Ponte', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadocrasto.wine/en/products/quinta-crasto-vinha-ponte/
  ('Quinta do Crasto', 'Vinha Maria Teresa', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadocrasto.wine/en/products/quinta-crasto-vinha-maria-teresa/
  ('Quinta do Crasto', 'Tinta Roriz', 'Douro, Portugal', 'Tinta Roriz', 'Red'),  -- https://www.quintadocrasto.wine/en/products/quinta-crasto-tinta-roriz/
  ('Quinta do Crasto', 'Touriga Nacional', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://www.quintadocrasto.wine/en/products/quinta-crasto-touriga-nacional/
  ('Quinta do Crasto', 'Touriga Franca', 'Douro, Portugal', 'Touriga Franca', 'Red'),  -- https://www.quintadocrasto.wine/en/products/quinta-crasto-touriga-franca/
  ('Quinta do Crasto', 'Reserva Old Vines', 'Douro, Portugal', null, 'Red'),  -- https://www.decanter.com/wine-reviews/portugal/douro-valley/quinta-do-crasto-reserva-old-vines-cima-corgo-2019-65212/
  ('Quinta do Crasto', 'Superior Syrah', 'Douro, Portugal', 'Syrah', 'Red'),  -- https://www.quintadocrasto.wine/en/products/crasto-superior-syrah/
  ('Quinta do Crasto', 'Superior Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Superior White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Altitude 430', 'Douro, Portugal', 'Tinta Francisca, Touriga Nacional', 'Red'),  -- https://www.quintadocrasto.wine/en/products/crasto-altitude-430/
  ('Quinta do Crasto', 'Crasto Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Crasto White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Crasto Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Flor de Crasto Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Flor de Crasto White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Honore Douro DOC', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadocrasto.wine/en/products/honore-douro-doc/
  ('Quinta do Crasto', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Finest Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', '50 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Tawny Reserva Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadocrasto.wine/en/products/
  ('Quinta do Crasto', 'Honore Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.quintadocrasto.wine/en/products/honore-porto/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUINTA DO VALLADO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Quinta do Vallado', 'Douro Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Três Melros Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Douro Superior Red', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Lady Baga', 'Douro, Portugal', 'Baga', 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/Lady-Baga/548/
  ('Quinta do Vallado', 'Sousão', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Touriga Nacional', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Alicante Bouschet', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Tinta Roriz', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Reserva Vinhas Velhas', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Vinha da Coroa', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Vinha da Granja', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Adelaide', 'Douro, Portugal', null, 'Red'),  -- https://www.quintadovallado.com/en/wines/wine/category/Red/39/
  ('Quinta do Vallado', 'Douro White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadovallado.com/en/wines/wine/category/White/40/
  ('Quinta do Vallado', 'Prima', 'Douro, Portugal', 'Moscatel Galego Branco', 'White'),  -- https://www.quintadovallado.com/en/wines/wine/Prima/75/
  ('Quinta do Vallado', 'Três Melros White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadovallado.com/en/wines/wine/category/White/40/
  ('Quinta do Vallado', 'Douro Superior White', 'Douro, Portugal', null, 'White'),  -- https://www.quintadovallado.com/en/wines/wine/category/White/40/
  ('Quinta do Vallado', 'Reserva Branco', 'Douro, Portugal', null, 'White'),  -- https://www.quintadovallado.com/en/wines/wine/category/White/40/
  ('Quinta do Vallado', 'Alvor', 'Douro, Portugal', null, 'White'),  -- https://www.quintadovallado.com/en/wines/wine/Alvor/803/
  ('Quinta do Vallado', 'Touriga Nacional Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://www.quintadovallado.com/en/wines/wine/category/Rose/41/
  ('Quinta do Vallado', 'V Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://www.quintadovallado.com/en/wines/wine/category/Rose/41/
  ('Quinta do Vallado', 'White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'Tawny Reserva Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', '10 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', '50 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', '80 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'Colheita Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'Tawny Roller Blend Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'Single Harvest Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'Single Harvest White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'Very Very Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'Tributa Very Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'ABF Porto Muito Velho', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
  ('Quinta do Vallado', 'ABF Second Edition Very Very Old Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.quintadovallado.com/en/wines/wine/category/Porto/42/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- REAL COMPANHIA VELHA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Real Companhia Velha', 'Evel Branco', 'Douro, Portugal', null, 'White'),  -- https://realcompanhiavelha.pt/douro-evel/
  ('Real Companhia Velha', 'Evel Tinto', 'Douro, Portugal', null, 'Red'),  -- https://realcompanhiavelha.pt/douro-evel/
  ('Real Companhia Velha', 'Evel Reserva', 'Douro, Portugal', 'Touriga Nacional, Touriga Franca', 'Red'),  -- https://realcompanhiavelha.pt/douro-evel-reserva/
  ('Real Companhia Velha', 'Porca de Murça Branco', 'Douro, Portugal', null, 'White'),  -- https://realcompanhiavelha.pt/douro-porca-de-murca/
  ('Real Companhia Velha', 'Porca de Murça Tinto', 'Douro, Portugal', null, 'Red'),  -- https://realcompanhiavelha.pt/douro-porca-de-murca/
  ('Real Companhia Velha', 'Porca de Murça Reserva Branco', 'Douro, Portugal', null, 'White'),  -- https://realcompanhiavelha.pt/douro-porca-de-murca/
  ('Real Companhia Velha', 'Porca de Murça Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://realcompanhiavelha.pt/douro-porca-de-murca/
  ('Real Companhia Velha', 'Porca de Murça Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://realcompanhiavelha.pt/douro-porca-de-murca/
  ('Real Companhia Velha', 'Quinta de Cidrô Alvarinho', 'Douro, Portugal', 'Alvarinho', 'White'),  -- https://realcompanhiavelha.pt/quinta-do-cidro-alvarinho/
  ('Real Companhia Velha', 'Quinta de Cidrô Sauvignon Blanc', 'Douro, Portugal', 'Sauvignon Blanc', 'White'),  -- https://realcompanhiavelha.pt/quinta-do-cidro-sauvignon-blanc/
  ('Real Companhia Velha', 'Quinta de Cidrô Chardonnay', 'Douro, Portugal', 'Chardonnay', 'White'),  -- https://realcompanhiavelha.pt/quinta-do-cidro-chardonnay/
  ('Real Companhia Velha', 'Quinta de Cidrô Gewurztraminer', 'Douro, Portugal', 'Gewurztraminer', 'White'),  -- https://realcompanhiavelha.pt/quinta-do-cidro-gewurztraminer/
  ('Real Companhia Velha', 'Quinta de Cidrô Arinto', 'Douro, Portugal', 'Arinto', 'White'),  -- https://realcompanhiavelha.pt/quinta-do-cidro-arinto/
  ('Real Companhia Velha', 'Quinta de Cidrô Gouveio', 'Douro, Portugal', 'Gouveio', 'White'),  -- https://realcompanhiavelha.pt/quinta-do-cidro-gouveio/
  ('Real Companhia Velha', 'Quinta de Cidrô Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://realcompanhiavelha.pt/douro-quinta-de-cidro/
  ('Real Companhia Velha', 'Quinta de Cidrô Pinot Noir', 'Douro, Portugal', 'Pinot Noir', 'Red'),  -- https://realcompanhiavelha.pt/quinta-do-cidro-pinot-noir/
  ('Real Companhia Velha', 'Quinta de Cidrô Touriga Nacional & Cabernet Sauvignon', 'Douro, Portugal', 'Touriga Nacional, Cabernet Sauvignon', 'Red'),  -- https://realcompanhiavelha.pt/quinta-do-cidro-touriga-nacional-cabernet-sauvignon/
  ('Real Companhia Velha', 'Quinta de Cidrô Marquis Branco', 'Douro, Portugal', null, 'White'),  -- https://realcompanhiavelha.pt/douro-quinta-de-cidro/
  ('Real Companhia Velha', 'Quinta de Cidrô Marquis Tinto', 'Douro, Portugal', null, 'Red'),  -- https://realcompanhiavelha.pt/douro-quinta-de-cidro/
  ('Real Companhia Velha', 'Dandy de Cidrô Branco', 'Douro, Portugal', 'Samarrinho, Cerceal', 'White'),  -- https://realcompanhiavelha.com/dandy/
  ('Real Companhia Velha', 'Dandy de Cidrô Tinto', 'Douro, Portugal', 'Tinta Roriz, Tinta Francisca, Viosinho', 'Red'),  -- https://realcompanhiavelha.com/dandy/
  ('Real Companhia Velha', 'Quinta dos Aciprestes Branco', 'Douro, Portugal', null, 'White'),  -- https://realcompanhiavelha.pt/douro-quinta-dos-aciprestes/
  ('Real Companhia Velha', 'Quinta dos Aciprestes Tinto', 'Douro, Portugal', null, 'Red'),  -- https://realcompanhiavelha.pt/douro-quinta-dos-aciprestes/
  ('Real Companhia Velha', 'Quinta dos Aciprestes Reserva', 'Douro, Portugal', null, 'Red'),  -- https://realcompanhiavelha.pt/douro-quinta-dos-aciprestes/
  ('Real Companhia Velha', 'Quinta dos Aciprestes Grande Reserva', 'Douro, Portugal', null, 'Red'),  -- https://realcompanhiavelha.pt/douro-quinta-dos-aciprestes/
  ('Real Companhia Velha', 'Quinta dos Aciprestes Grande Reserva Sousão', 'Douro, Portugal', 'Sousão', 'Red'),  -- https://realcompanhiavelha.pt/douro-quinta-dos-aciprestes/
  ('Real Companhia Velha', 'Quinta dos Aciprestes Grande Reserva Touriga Nacional Talhão 14', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://realcompanhiavelha.pt/douro-quinta-dos-aciprestes/
  ('Real Companhia Velha', 'Séries Samarrinho', 'Douro, Portugal', 'Samarrinho', 'White'),  -- https://realcompanhiavelha.pt/douro-series-samarrinho/
  ('Real Companhia Velha', 'Séries Donzelinho Branco', 'Douro, Portugal', 'Donzelinho Branco', 'White'),  -- https://realcompanhiavelha.pt/douro-series-donzelinho-branco/
  ('Real Companhia Velha', 'Séries Gouveio', 'Douro, Portugal', 'Gouveio', 'White'),  -- https://realcompanhiavelha.pt/douro-series-gouveio/
  ('Real Companhia Velha', 'Séries Arinto', 'Douro, Portugal', 'Arinto', 'White'),  -- https://realcompanhiavelha.pt/douro-series-arinto/
  ('Real Companhia Velha', 'Séries Cerceal', 'Douro, Portugal', 'Cerceal', 'White'),  -- https://realcompanhiavelha.pt/douro-series-cerceal/
  ('Real Companhia Velha', 'Séries Rufete', 'Douro, Portugal', 'Rufete', 'Red'),  -- https://realcompanhiavelha.pt/douro-series-rufete/
  ('Real Companhia Velha', 'Séries Bastardo', 'Douro, Portugal', 'Bastardo', 'Red'),  -- https://realcompanhiavelha.pt/douro-series-bastardo/
  ('Real Companhia Velha', 'Séries Baga', 'Douro, Portugal', 'Baga', 'Red'),  -- https://realcompanhiavelha.pt/douro-series-baga/
  ('Real Companhia Velha', 'Séries Tinto Cão', 'Douro, Portugal', 'Tinto Cão', 'Red'),  -- https://realcompanhiavelha.pt/douro-series-tinto-cao/
  ('Real Companhia Velha', 'Grandjó Branco Meio Doce', 'Douro, Portugal', null, 'White'),  -- https://realcompanhiavelha.pt/douro-grandjo/
  ('Real Companhia Velha', 'Grandjó Late Harvest', 'Douro, Portugal', null, 'Sweet'),  -- https://realcompanhiavelha.pt/douro-grandjo/
  ('Real Companhia Velha', 'Moscatel', 'Douro, Portugal', 'Moscatel', 'Fortified'),  -- https://realcompanhiavelha.pt/moscatel-real-companhia-velha/
  ('Real Companhia Velha', 'Quinta das Carvalhas Vinhas Velhas', 'Douro, Portugal', null, 'Red'),  -- https://quintadascarvalhas.pt/vinhas-velhas/
  ('Real Companhia Velha', 'Quinta das Carvalhas Vinha do Eirol', 'Douro, Portugal', null, 'Red'),  -- https://quintadascarvalhas.pt/vinha-do-eirol/
  ('Real Companhia Velha', 'Quinta das Carvalhas Tinta Francisca', 'Douro, Portugal', 'Tinta Francisca', 'Red'),  -- https://quintadascarvalhas.pt/tinta-francisca/
  ('Real Companhia Velha', 'Quinta das Carvalhas Reserva', 'Douro, Portugal', null, 'Red'),  -- https://quintadascarvalhas.pt/reserva/
  ('Real Companhia Velha', 'Quinta das Carvalhas Touriga Nacional', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://quintadascarvalhas.pt/touriga-nacional/
  ('Real Companhia Velha', 'Quinta das Carvalhas Tinto', 'Douro, Portugal', null, 'Red'),  -- https://quintadascarvalhas.pt/vinhos-do-douro/
  ('Real Companhia Velha', 'Quinta das Carvalhas Branco', 'Douro, Portugal', null, 'White'),  -- https://quintadascarvalhas.pt/vinhos-do-douro/
  ('Real Companhia Velha', 'Quinta das Carvalhas Reserva Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas 10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas 20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas 30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas 40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas Primeira Edição 50 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas Edition 225 50 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas The Impressionist 80 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas Memories Very Very Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas Reserva Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Quinta das Carvalhas Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadascarvalhas.pt/vinhos-do-porto/
  ('Real Companhia Velha', 'Fundador White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://realcompanhiavelha.pt/porto-real-companhia-velha/
  ('Real Companhia Velha', 'Fundador Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://realcompanhiavelha.pt/porto-real-companhia-velha/
  ('Real Companhia Velha', 'Dom José Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://realcompanhiavelha.pt/porto-real-companhia-velha/
  ('Real Companhia Velha', 'Dom José Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://realcompanhiavelha.pt/porto-real-companhia-velha/
  ('Real Companhia Velha', 'Lágrima Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://realcompanhiavelha.pt/porto-real-companhia-velha/
  ('Real Companhia Velha', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://realcompanhiavelha.pt/porto-real-companhia-velha/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROYAL OPORTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Royal Oporto', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://royaloporto.com/ports/
  ('Royal Oporto', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://royaloporto.com/ports/
  ('Royal Oporto', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://royaloporto.com/ports/
  ('Royal Oporto', '10 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://royaloporto.com/ports/
  ('Royal Oporto', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://royaloporto.com/ports/
  ('Royal Oporto', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://royaloporto.com/ports/
  ('Royal Oporto', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://royaloporto.com/ports/
  ('Royal Oporto', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://royaloporto.com/ports/
  ('Royal Oporto', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://royaloporto.com/ports/
  ('Royal Oporto', 'Extra Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://royaloporto.com/ports/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WINE & SOUL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Wine & Soul', 'Manoella Douro White', 'Douro, Portugal', null, 'White'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Manoella Douro Red', 'Douro, Portugal', null, 'Red'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Manoella Douro Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Quinta da Manoella Vinha Alecrim', 'Douro, Portugal', null, 'Red'),  -- https://radar.wine/en/wines/wine/quinta-da-manoella-vinha-do-alecrim
  ('Wine & Soul', 'Pintas', 'Douro, Portugal', null, 'Red'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Pintas Character', 'Douro, Portugal', null, 'Red'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Guru', 'Douro, Portugal', null, 'White'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Guru NM', 'Douro, Portugal', null, 'White'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Guru Vinha da Calçada', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/douro-wines-portugal/10492-guru-vinha-da-calcada-2021-white-wine.html
  ('Wine & Soul', 'Vinha do Altar', 'Douro, Portugal', 'Viosinho, Gouveio, Arinto', 'White'),  -- https://winehouseportugal.com/en/douro-wines-portugal/9154-vinha-do-altar-2020-white-wine.html
  ('Wine & Soul', 'Manoella 10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Manoella 10 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', '10 Year Old Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Manoella 20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Manoella Finest Reserve Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Manoella Finest Reserve Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Pintas Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', '5G Five Generations Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://wineandsoul.com/wine-olive-oil/
  ('Wine & Soul', 'Quinta da Manoella Vinhas Velhas', 'Douro, Portugal', null, 'Red')  -- https://radar.wine/en/wines/wine/quinta-da-manoella-vinhas-velhas
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUINTA DO VALE MEÃO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Quinta do Vale Meão', 'Douro Red', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=vale+meao
  ('Quinta do Vale Meão', 'Meandro Red', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=vale+meao
  ('Quinta do Vale Meão', 'Meandro White', 'Douro, Portugal', null, 'White'),  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=vale+meao
  ('Quinta do Vale Meão', 'Monte Meão Vinha da Cantina Baga', 'Douro, Portugal', 'Baga', 'Red'),  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=monte+meao
  ('Quinta do Vale Meão', 'Monte Meão Vinha dos Novos Touriga Nacional', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=monte+meao
  ('Quinta do Vale Meão', 'Monte Meão White', 'Douro, Portugal', null, 'White'),  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=monte+meao
  ('Quinta do Vale Meão', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=vale+meao
  ('Quinta do Vale Meão', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=vale+meao
  ('Quinta do Vale Meão', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=vale+meao
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUINTA DO INFANTADO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Quinta do Infantado', 'Roseira', 'Douro, Portugal', 'Touriga Nacional, Touriga Franca', 'Red'),  -- https://quintadoinfantado.com/portfolio-vinhos/roseira-douro-2013/
  ('Quinta do Infantado', 'Douro Tinto Biológico', 'Douro, Portugal', null, 'Red'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Douro Tinto', 'Douro, Portugal', null, 'Red'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Douro Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Reserva Ruby Biológico Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Reserva Tawny Biológico Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Reserva Especial Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Tawny Reserva D. Margarida Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoinfantado.com/vinhos/
  ('Quinta do Infantado', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://quintadoinfantado.com/vinhos/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- QUINTA DO PORTAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Quinta do Portal', 'Quinta dos Muros M7', 'Douro, Portugal', 'Tinta Barroca, Tinta Roriz, Touriga Franca, Tinta Carvalha, Mourisco', 'Red'),  -- https://quintadoportal.com/pt/detailproduct&iditem=69
  ('Quinta do Portal', 'AURU', 'Douro, Portugal', null, 'Red'),  -- https://quintadoportal.com/pt/detailproduct&iditem=25
  ('Quinta do Portal', 'Tinta Barroca', 'Douro, Portugal', 'Tinta Barroca', 'Red'),  -- https://quintadoportal.com/pt/detailproduct&iditem=24
  ('Quinta do Portal', 'Tinta Roriz', 'Douro, Portugal', 'Tinta Roriz', 'Red'),  -- https://quintadoportal.com/pt/detailproduct&iditem=57
  ('Quinta do Portal', 'Touriga Nacional', 'Douro, Portugal', 'Touriga Nacional', 'Red'),  -- https://quintadoportal.com/pt/detailproduct&iditem=23
  ('Quinta do Portal', 'Grande Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Reserva Tinto', 'Douro, Portugal', null, 'Red'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Colheita Tinto', 'Douro, Portugal', null, 'Red'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Grande Reserva Branco', 'Douro, Portugal', null, 'White'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Reserva Branco', 'Douro, Portugal', null, 'White'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Colheita Branco', 'Douro, Portugal', null, 'White'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Moscatel Galego Branco', 'Douro, Portugal', 'Moscatel Galego', 'White'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Sauvignon Blanc', 'Douro, Portugal', 'Sauvignon Blanc', 'White'),  -- https://quintadoportal.com/pt/detailproduct&iditem=85
  ('Quinta do Portal', 'Unlocked Branco', 'Douro, Portugal', null, 'White'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Unlocked Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Unlocked Gouveio', 'Douro, Portugal', 'Gouveio', 'White'),  -- https://quintadoportal.com/pt/detailproduct&iditem=59
  ('Quinta do Portal', 'Unlocked Malvasia Fina', 'Douro, Portugal', 'Malvasia Fina', 'White'),  -- https://quintadoportal.com/pt/detailproduct&iditem=13
  ('Quinta do Portal', 'Unlocked Viosinho', 'Douro, Portugal', 'Viosinho', 'White'),  -- https://quintadoportal.com/pt/detailproduct&iditem=42
  ('Quinta do Portal', 'Colheita Tardia', 'Douro, Portugal', null, 'Sweet'),  -- https://quintadoportal.com/pt/detailproduct&iditem=41
  ('Quinta do Portal', 'Mural Reserva', 'Douro, Portugal', null, 'Red'),  -- https://quintadoportal.com/pt/detailproduct&iditem=80
  ('Quinta do Portal', 'Mural Tinto', 'Douro, Portugal', null, 'Red'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Mural Branco', 'Douro, Portugal', null, 'White'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Muros de Vinha Tinto', 'Douro, Portugal', null, 'Red'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Muros de Vinha Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Muros de Vinha Branco', 'Douro, Portugal', null, 'White'),  -- https://quintadoportal.com/pt/products&idcat=1
  ('Quinta do Portal', 'Moscatel Douro', 'Douro, Portugal', 'Moscatel', 'Fortified'),  -- https://quintadoportal.com/pt/detailproduct&iditem=8
  ('Quinta do Portal', 'Moscatel Colheita', 'Douro, Portugal', 'Moscatel Galego', 'Fortified'),  -- https://quintadoportal.com/pt/detailproduct&iditem=84
  ('Quinta do Portal', 'Quinta dos Muros Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Portal + Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', '10 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', '6 Barrels Tawny Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', '29 Grapes Reserve Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Fine Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Fine Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Fine White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Extra Dry Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Lágrima Branco Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://quintadoportal.com/pt/products&idcat=2
  ('Quinta do Portal', 'Pink Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://quintadoportal.com/pt/products&idcat=2
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAVES MESSIAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Caves Messias', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias
  ('Caves Messias', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias
  ('Caves Messias', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias
  ('Caves Messias', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias
  ('Caves Messias', 'Avô Velhíssimo Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias
  ('Caves Messias', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=2
  ('Caves Messias', 'Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=4
  ('Caves Messias', 'Extra Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=4
  ('Caves Messias', 'Lágrima Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=5
  ('Caves Messias', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=5
  ('Caves Messias', 'Quinta do Cachão Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=5
  ('Caves Messias', 'Rosé Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=7
  ('Caves Messias', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=7
  ('Caves Messias', 'Special Reserve Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=7
  ('Caves Messias', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=7
  ('Caves Messias', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=8
  ('Caves Messias', '10 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=8
  ('Caves Messias', 'White Sweet Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=8
  ('Caves Messias', 'Dados Reserva', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/douro-wines-portugal/2482-messias-dados-reserva-2009-red-wine-the-company-was-founded-in-1926-by-mr-messias-baptista-who-served-as-chairman-until-1973-the.html
  ('Caves Messias', 'Douro White', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/douro-wines-portugal/2480-messias-douro-2019-white-wine-5601292123290.html
  ('Caves Messias', 'Douro Selection Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/douro-wines-portugal/2507-messias-douro-selection-2017-red-wine-5601292123252.html
  ('Caves Messias', 'Family Reserve Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/douro-wines-portugal/5542-messias-family-reserve-2013-red-wine-5601292123184.html
  ('Caves Messias', 'Grande Escolha Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/douro-wines-portugal/2475-messias-grande-escolha-2007-red-wine-the-company-was-founded-in-1926-by-mr-messias-baptista-who-served-as-chairman-until-1973-th-5601292123283.html
  ('Caves Messias', 'Homenagem Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/douro-wines-portugal/3656-messias-homenagem-2009-red-wine-the-company-was-founded-in-1926-by-mr-messias-baptista-who-served-as-chairman-until-1973-the-man-5601292123528.html
  ('Caves Messias', 'Superior Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=7
  ('Caves Messias', 'Triunvirato Nº7', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=7
  ('Caves Messias', 'Unoaked Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=7
  ('Caves Messias', 'Vinha Santa Barbara Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=7
  ('Caves Messias', 'Quinta do Cachão Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=8
  ('Caves Messias', 'Quinta do Cachão Grande Escolha Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=8
  ('Caves Messias', 'Quinta do Cachão Reserva Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=9
  ('Caves Messias', 'Quinta do Cachão Touriga Nacional', 'Douro, Portugal', 'Touriga Nacional', 'Red')  -- https://winehouseportugal.com/en/brand/136-caves-messias?page=9
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- POÇAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r5_port_douro.sql)'
from (values
  ('Poças', 'Coroa d''Ouro Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', 'Coroa d''Ouro White', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', 'Douro Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', 'Douro Rosé', 'Douro, Portugal', null, 'Rosé'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', 'Douro White', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', 'Branco da Ribeira', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', 'Reserva Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Reserva White', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Trava Línguas Red', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Trava Línguas White', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Vinha do Cerro', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Símbolo', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=7
  ('Poças', 'Vale de Cavalos Red', 'Douro, Portugal', null, 'Red'),  -- https://www.garrafeiranacional.com/en/catalogsearch/result/?q=po%C3%A7as
  ('Poças', 'Fora da Série Acrobata', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=3
  ('Poças', 'Fora da Série Alicante Bouschet', 'Douro, Portugal', 'Alicante Bouschet', 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=3
  ('Poças', 'Fora da Série Ânfora', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=3
  ('Poças', 'Fora da Série Dogleg', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=3
  ('Poças', 'Fora da Série Lagar das Quartas', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=3
  ('Poças', 'Fora da Série Nativo Branco', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', 'Fora da Série Novus', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', 'Fora da Série Orange', 'Douro, Portugal', null, 'Orange'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', 'Fora da Série Plano B', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', 'Fora da Série Scuba', 'Douro, Portugal', null, 'White'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', 'Fora da Série Throwback', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', 'Fora da Série Uppercut', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', 'Fora da Série Vinha da Roga', 'Douro, Portugal', null, 'Red'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', '10 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', '10 Year Old White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', '20 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', '30 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', '40 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', '50 Year Old Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas
  ('Poças', 'Brig''s Dry White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=2
  ('Poças', 'Brig''s Rosé Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=2
  ('Poças', 'Colheita Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=2
  ('Poças', 'Colheita White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=3
  ('Poças', 'Decanter Old Time''s 10 Year Old Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=3
  ('Poças', 'Fora da Série Bonificador Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=3
  ('Poças', 'Lágrima Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', 'Late Bottled Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=4
  ('Poças', 'Reserve Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Reserve Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Ruby Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Tawny Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Vinho de Missas White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=5
  ('Poças', 'White Port', 'Porto, Douro, Portugal', null, 'Fortified'),  -- https://winehouseportugal.com/en/brand/175-pocas?page=6
  ('Poças', 'Quinta dos Poços Vintage Port', 'Porto, Douro, Portugal', null, 'Fortified')  -- https://winehouseportugal.com/en/brand/175-pocas?page=7
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
