-- Producer ranges round 4: Greece. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- DOMAINE SIGALAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Domaine Sigalas', 'Santorini', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://sigalas-wine.com/products/
  ('Domaine Sigalas', 'Santorini Barrel', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://sigalas-wine.com/products/
  ('Domaine Sigalas', 'Kavalieros', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://sigalas-wine.com/products/
  ('Domaine Sigalas', 'Epta', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://sigalas-wine.com/products/
  ('Domaine Sigalas', 'Nychteri', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://sigalas-wine.com/products/
  ('Domaine Sigalas', 'Aidani', 'Cyclades, Greece', 'Aidani', 'White'),  -- https://sigalas-wine.com/products/
  ('Domaine Sigalas', 'Mavrotragano', 'Cyclades, Greece', 'Mavrotragano', 'Red'),  -- https://sigalas-wine.com/products/
  ('Domaine Sigalas', 'Vinsanto', 'Santorini, Greece', 'Assyrtiko, Aidani', 'Sweet'),  -- https://sigalas-wine.com/products/
  ('Domaine Sigalas', 'Apiliotis', 'Cyclades, Greece', 'Mandilaria', 'Sweet'),  -- https://sigalas-wine.com/el/product/apiliwtis/
  ('Domaine Sigalas', 'Aa', 'Cyclades, Greece', 'Assyrtiko, Athiri', 'White'),  -- https://sigalas-wine.com/products/
  ('Domaine Sigalas', 'Mm', 'Cyclades, Greece', 'Mavrotragano, Mandilaria', 'Red')  -- https://sigalas-wine.com/products/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HATZIDAKIS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Hatzidakis Winery', 'Aidani', 'Santorini, Greece', 'Aidani', 'White'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Santorini Familia', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Santorini Cuvée No 15', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Skytali', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Santorini Rampelia', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Santorini Skytali Bareli', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Nychteri', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Rosette', 'Santorini, Greece', 'Mandilaria', 'Rosé'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Assyrtiko de Louros', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Mavrotragano', 'Santorini, Greece', 'Mavrotragano', 'Red'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Vinsanto', 'Santorini, Greece', null, 'Sweet'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Liassimo', 'Santorini, Greece', null, 'Sweet'),  -- https://www.hatzidakiswines.gr/ta-krasia-mas
  ('Hatzidakis Winery', 'Voudomato', 'Santorini, Greece', null, 'Red')  -- https://www.hatzidakiswines.gr/ta-krasia-mas
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ESTATE ARGYROS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Estate Argyros', 'Atlantis White', 'Santorini, Greece', null, 'White'),  -- https://www.skurnik.com/producer/estate-argyros/
  ('Estate Argyros', 'Santorini Assyrtiko Cuvée Monsignori', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.skurnik.com/producer/estate-argyros/
  ('Estate Argyros', 'Santorini Assyrtiko Cuvée Evdemon', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.skurnik.com/producer/estate-argyros/
  ('Estate Argyros', 'Santorini Assyrtiko Cuvée Gerontampelo', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.skurnik.com/producer/estate-argyros/
  ('Estate Argyros', 'Santorini Assyrtiko Cuvée Palatia', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.skurnik.com/producer/estate-argyros/
  ('Estate Argyros', 'Vinsanto First Release', 'Santorini, Greece', null, 'Sweet'),  -- https://www.skurnik.com/producer/estate-argyros/
  ('Estate Argyros', 'Vinsanto Late Release', 'Santorini, Greece', null, 'Sweet'),  -- https://www.skurnik.com/producer/estate-argyros/
  ('Estate Argyros', 'Vinsanto Heritage', 'Santorini, Greece', null, 'Sweet')  -- https://www.skurnik.com/producer/estate-argyros/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SANTO WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Santo Wines', 'Santorini Assyrtiko', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Santorini Selection Cuvee', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Santorini Nykteri', 'Santorini, Greece', 'Assyrtiko, Athiri, Aidani', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Santorini Assyrtiko Grande Reserve', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Santorini Thira Kori', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Kontarades', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Irini', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Santo Sparkling White', 'Santorini, Greece', 'Assyrtiko', 'Sparkling'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Santo Sparkling Rose', 'Santorini, Greece', 'Assyrtiko, Mandilaria', 'Sparkling'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Kissiris White', 'Santorini, Greece', 'Assyrtiko, Athiri, Aidani', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Kissiris Rose', 'Santorini, Greece', 'Assyrtiko, Mandilaria', 'Rosé'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Kissiris Red', 'Santorini, Greece', 'Mandilaria', 'Red'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Athiri Organic', 'Santorini, Greece', 'Athiri', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Aidani Organic', 'Santorini, Greece', 'Aidani', 'White'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Mavrotragano', 'Santorini, Greece', 'Mavrotragano', 'Red'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Kameni', 'Santorini, Greece', 'Mandilaria', 'Red'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Vinsanto', 'Santorini, Greece', 'Assyrtiko, Aidani', 'Sweet'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Vinsanto 12 Years Ageing', 'Santorini, Greece', 'Assyrtiko, Aidani', 'Sweet'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Vinsanto 20 Years Ageing', 'Santorini, Greece', 'Assyrtiko, Aidani', 'Sweet'),  -- https://santowines.gr/wines/all
  ('Santo Wines', 'Kratiras', 'Santorini, Greece', 'Mandilaria', 'Sweet')  -- https://santowines.gr/wines/all
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOUTARI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Boutari', 'Lac des Roches', 'Greece', null, 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Moschofilero Rosé', 'Greece', 'Moschofilero', 'Rosé'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Kretikos White', 'Crete, Greece', null, 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Kretikos Red', 'Crete, Greece', null, 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Moschofilero', 'Greece', 'Moschofilero', 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Agiorgitiko', 'Greece', 'Agiorgitiko', 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Simio White', 'Greece', null, 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Simio Roze', 'Greece', null, 'Rosé'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Simio Red', 'Greece', null, 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Rose Sec', 'Greece', null, 'Rosé'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Rose Demi-Sec', 'Greece', null, 'Rosé'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Cava', 'Greece', null, 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'White Letter', 'Greece', null, 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Red Letter', 'Greece', null, 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Dianthos', 'Greece', null, 'Rosé'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Rapsani', 'Rapsani, Thessaly, Greece', null, 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Malagouzia', 'Greece', 'Malagouzia', 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Assyrtiko', 'Greece', 'Assyrtiko', 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Vidiano', 'Greece', 'Vidiano', 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Mantinia Cuvée', 'Mantinia, Peloponnese, Greece', null, 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Sauvignon Blanc', 'Greece', 'Sauvignon Blanc', 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Chardonnay', 'Greece', 'Chardonnay', 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Cabernet Sauvignon', 'Greece', 'Cabernet Sauvignon', 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Syrah', 'Greece', 'Syrah', 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Merlot', 'Greece', 'Merlot', 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Naoussa', 'Naoussa, Macedonia, Greece', null, 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Santorini', 'Santorini, Greece', null, 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Kallisti Reserve', 'Greece', null, 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'The White Knight', 'Greece', null, 'White'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Grande Reserve Naoussa', 'Naoussa, Macedonia, Greece', null, 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', '1879 Legacy', 'Greece', null, 'Red'),  -- https://boutari.gr/en/wines
  ('Boutari', 'Vinsanto 12 Years', 'Santorini, Greece', null, 'Sweet')  -- https://boutari.gr/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GEROVASSILIOU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Domaine Gerovassiliou', 'White', 'Epanomi, Macedonia, Greece', null, 'White'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Red', 'Epanomi, Macedonia, Greece', null, 'Red'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Malagousia', 'Epanomi, Macedonia, Greece', 'Malagousia', 'White'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Xinomavro', 'Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Sauvignon Blanc', 'Epanomi, Macedonia, Greece', 'Sauvignon Blanc', 'White'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Chardonnay', 'Epanomi, Macedonia, Greece', 'Chardonnay', 'White'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Viognier', 'Epanomi, Macedonia, Greece', 'Viognier', 'White'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Syrah', 'Epanomi, Macedonia, Greece', 'Syrah', 'Red'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Avaton', 'Epanomi, Macedonia, Greece', 'Limnio, Mavroudi, Mavrotragano', 'Red'),  -- https://gerovassiliou.gr/en/wines/avaton
  ('Domaine Gerovassiliou', 'Evangelo', 'Epanomi, Macedonia, Greece', 'Syrah, Viognier', 'Red'),  -- https://gerovassiliou.gr/en/wines/evangelo
  ('Domaine Gerovassiliou', 'Museum Collection White', 'Epanomi, Macedonia, Greece', null, 'White'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Museum Collection Red', 'Epanomi, Macedonia, Greece', null, 'Red'),  -- https://gerovassiliou.gr/en/wines
  ('Domaine Gerovassiliou', 'Malagousia Late Harvest', 'Epanomi, Macedonia, Greece', 'Malagousia', 'Sweet')  -- https://gerovassiliou.gr/en/wines/malagousia-late-harvest
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALPHA ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Alpha Estate', 'Malagouzia Single Vineyard Turtles', 'Florina, Macedonia, Greece', 'Malagouzia', 'White'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Sauvignon Blanc', 'Florina, Macedonia, Greece', 'Sauvignon Blanc', 'White'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Ecosystem Sauvignon Blanc Fume Single Block Kaliva', 'Florina, Macedonia, Greece', 'Sauvignon Blanc', 'White'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Ecosystem Chardonnay Single Block Tramonto', 'Florina, Macedonia, Greece', 'Chardonnay', 'White'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Assyrtiko Single Block Aghia Kiriaki', 'Florina, Macedonia, Greece', 'Assyrtiko', 'White'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Ecosystem Malagouzia Single Block Latipes', 'Florina, Macedonia, Greece', 'Malagouzia', 'White'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Rosé', 'Amyndeon, Macedonia, Greece', null, 'Rosé'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Axia Red', 'Florina, Macedonia, Greece', null, 'Red'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Xinomavro Single Vineyard Hedgehog', 'Amyndeon, Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Syrah Single Vineyard Turtles', 'Florina, Macedonia, Greece', 'Syrah', 'Red'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Ecosystem Pinot Noir Single Block Strofi', 'Florina, Macedonia, Greece', 'Pinot Noir', 'Red'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Ecosystem Xinomavro Reserve Vieilles Vignes Single Block Barba Yannis', 'Amyndeon, Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Ecosystem Tannat Single Block Vrachos', 'Florina, Macedonia, Greece', 'Tannat', 'Red'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Red SMX', 'Florina, Macedonia, Greece', null, 'Red'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Alpha One', 'Florina, Macedonia, Greece', null, 'Red'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Omega Sweet White', 'Florina, Macedonia, Greece', null, 'Sweet'),  -- https://alpha-estate.com/
  ('Alpha Estate', 'Xinomavro Red Sweet Wine', 'Florina, Macedonia, Greece', 'Xinomavro', 'Sweet')  -- https://alpha-estate.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KTIMA BIBLIA CHORA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Ktima Biblia Chora', 'Estate White', 'Pangeon, Macedonia, Greece', null, 'White'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Estate Rosé', 'Pangeon, Macedonia, Greece', null, 'Rosé'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Estate Red', 'Pangeon, Macedonia, Greece', null, 'Red'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Areti White', 'Pangeon, Macedonia, Greece', null, 'White'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Areti Red', 'Pangeon, Macedonia, Greece', null, 'Red'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Sole Vidiano', 'Pangeon, Macedonia, Greece', 'Vidiano', 'White'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Sole Semillon', 'Pangeon, Macedonia, Greece', 'Semillon', 'White'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Sole Pinot Noir', 'Pangeon, Macedonia, Greece', 'Pinot Noir', 'Red'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Vivlinos Rosé', 'Pangeon, Macedonia, Greece', null, 'Rosé'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Vivlinos Red', 'Pangeon, Macedonia, Greece', null, 'Red'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Plagios White', 'Pangeon, Macedonia, Greece', null, 'White'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Plagios Red', 'Pangeon, Macedonia, Greece', null, 'Red'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Ovilos White', 'Pangeon, Macedonia, Greece', null, 'White'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Ovilos Red', 'Pangeon, Macedonia, Greece', null, 'Red'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Etos Merlot', 'Pangeon, Macedonia, Greece', 'Merlot', 'Red'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Etos Cabernet Sauvignon', 'Pangeon, Macedonia, Greece', 'Cabernet Sauvignon', 'Red'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Etos Semillon & Assyrtiko', 'Pangeon, Macedonia, Greece', 'Semillon, Assyrtiko', 'White'),  -- https://bibliachora.gr/our-wines/
  ('Ktima Biblia Chora', 'Etos Agiorgitiko', 'Pangeon, Macedonia, Greece', 'Agiorgitiko', 'Red')  -- https://bibliachora.gr/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE SKOURAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Domaine Skouras', 'Viognier Eclectique', 'Peloponnese, Greece', 'Viognier', 'White'),  -- https://skouras.gr/wines/lefkoi
  ('Domaine Skouras', 'Dum Vinum Sperum', 'Peloponnese, Greece', 'Chardonnay', 'White'),  -- https://skouras.gr/wines/lefkoi
  ('Domaine Skouras', 'Armyra', 'Peloponnese, Greece', 'Chardonnay, Malagousia', 'White'),  -- https://skouras.gr/wines/lefkoi
  ('Domaine Skouras', 'Viognier Cuvee Larsinos', 'Peloponnese, Greece', 'Viognier', 'White'),  -- https://skouras.gr/wines/lefkoi
  ('Domaine Skouras', 'Salto', 'Peloponnese, Greece', 'Mavrofilero', 'White'),  -- https://skouras.gr/wines/lefkoi
  ('Domaine Skouras', 'Mantineia', 'Mantinia, Peloponnese, Greece', 'Moschofilero', 'White'),  -- https://skouras.gr/wines/lefkoi
  ('Domaine Skouras', 'Akres Lefko', 'Peloponnese, Greece', 'Roditis Alepou, Moschofilero, Malagousia', 'White'),  -- https://skouras.gr/wines/lefkoi
  ('Domaine Skouras', 'Lavyrinthos', 'Peloponnese, Greece', 'Agiorgitiko, Cabernet Sauvignon', 'Red'),  -- https://skouras.gr/wines/erithroi
  ('Domaine Skouras', 'Megas Oinos', 'Peloponnese, Greece', 'Agiorgitiko, Cabernet Sauvignon', 'Red'),  -- https://skouras.gr/wines/erithroi
  ('Domaine Skouras', 'Grande Cuvée Nemea', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://skouras.gr/wines/erithroi
  ('Domaine Skouras', 'Titanas', 'Peloponnese, Greece', 'Mavrostifo', 'Sweet'),  -- https://skouras.gr/wines/erithroi
  ('Domaine Skouras', 'Fleva', 'Peloponnese, Greece', 'Syrah', 'Red'),  -- https://skouras.gr/wines/erithroi
  ('Domaine Skouras', 'Synoro', 'Peloponnese, Greece', 'Cabernet Franc, Merlot, Agiorgitiko', 'Red'),  -- https://skouras.gr/wines/erithroi
  ('Domaine Skouras', 'Nemea Agiorgitiko', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://skouras.gr/wines/erithroi
  ('Domaine Skouras', 'Portes Merlot', 'Peloponnese, Greece', 'Merlot', 'Red'),  -- https://skouras.gr/wines/erithroi
  ('Domaine Skouras', 'Akres Erythro', 'Peloponnese, Greece', 'Agiorgitiko, Cabernet Sauvignon', 'Red'),  -- https://skouras.gr/wines/erithroi
  ('Domaine Skouras', 'Peplo', 'Peloponnese, Greece', 'Agiorgitiko, Syrah, Mavrofilero', 'Rosé'),  -- https://skouras.gr/wines/roze
  ('Domaine Skouras', 'Akres Roze', 'Peloponnese, Greece', 'Agiorgitiko, Moschofilero', 'Rosé')  -- https://skouras.gr/wines/roze
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAPAGIANNAKOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Papagiannakos', 'Melias', 'Attica, Greece', 'Malagousia', 'White'),  -- https://papagiannakos.gr/product/melias/
  ('Papagiannakos', 'Merlot', 'Attica, Greece', 'Merlot', 'Red'),  -- https://papagiannakos.gr/
  ('Papagiannakos', 'Kalogeri Cabernet Sauvignon', 'Attica, Greece', 'Cabernet Sauvignon', 'Red'),  -- https://papagiannakos.gr/
  ('Papagiannakos', 'Erythros', 'Attica, Greece', 'Agiorgitiko, Cabernet Sauvignon', 'Red'),  -- https://papagiannakos.gr/product/erythros/
  ('Papagiannakos', 'Retsina', 'Attica, Greece', 'Savatiano', 'White'),  -- https://papagiannakos.gr/product/retsina/
  ('Papagiannakos', 'Kalogeri Malagouzia', 'Attica, Greece', 'Malagouzia', 'White'),  -- https://papagiannakos.gr/
  ('Papagiannakos', 'Assyrtiko', 'Attica, Greece', 'Assyrtiko', 'White'),  -- https://papagiannakos.gr/
  ('Papagiannakos', 'Granatus', 'Attica, Greece', 'Cabernet Sauvignon, Agiorgitiko', 'Rosé'),  -- https://papagiannakos.gr/product/granatus/
  ('Papagiannakos', 'Apo Vareli', 'Attica, Greece', 'Savatiano', 'White'),  -- https://papagiannakos.gr/
  ('Papagiannakos', 'Naturally Savatiano', 'Attica, Greece', 'Savatiano', 'White'),  -- https://papagiannakos.gr/
  ('Papagiannakos', 'Vientzi Single Vineyard', 'Markopoulo, Attica, Greece', 'Savatiano', 'White'),  -- https://papagiannakos.gr/product/vientzi/
  ('Papagiannakos', 'Savatiano Old Vines', 'Attica, Greece', 'Savatiano', 'White')  -- https://papagiannakos.gr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAVLIDIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Pavlidis', 'Thema White', 'Drama, Macedonia, Greece', 'Assyrtiko, Sauvignon Blanc', 'White'),  -- https://ktima-pavlidis.gr/
  ('Pavlidis', 'Thema Rosé', 'Drama, Macedonia, Greece', 'Tempranillo', 'Rosé'),  -- https://ktima-pavlidis.gr/
  ('Pavlidis', 'Thema Red', 'Drama, Macedonia, Greece', 'Agiorgitiko, Syrah', 'Red'),  -- https://ktima-pavlidis.gr/
  ('Pavlidis', 'Emphasis Assyrtiko', 'Drama, Macedonia, Greece', 'Assyrtiko', 'White'),  -- https://ktima-pavlidis.gr/
  ('Pavlidis', 'Emphasis Chardonnay', 'Drama, Macedonia, Greece', 'Chardonnay', 'White'),  -- https://ktima-pavlidis.gr/
  ('Pavlidis', 'Emphasis Agiorgitiko', 'Drama, Macedonia, Greece', 'Agiorgitiko', 'Red'),  -- https://ktima-pavlidis.gr/
  ('Pavlidis', 'Emphasis Syrah', 'Drama, Macedonia, Greece', 'Syrah', 'Red'),  -- https://ktima-pavlidis.gr/
  ('Pavlidis', 'Emphasis Tempranillo', 'Drama, Macedonia, Greece', 'Tempranillo', 'Red'),  -- https://ktima-pavlidis.gr/
  ('Pavlidis', 'Alma', 'Drama, Macedonia, Greece', 'Agiorgitiko, Syrah', 'Red')  -- https://ktima-pavlidis.gr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LYRARAKIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Domaine Lyrarakis', 'Vidiano', 'Crete, Greece', 'Vidiano', 'White'),  -- https://www.lyrarakis.com/en/wines-queens
  ('Domaine Lyrarakis', 'Vilana', 'Crete, Greece', 'Vilana', 'White'),  -- https://www.lyrarakis.com/en/wines-queens
  ('Domaine Lyrarakis', 'Muscat of Spina', 'Crete, Greece', 'Muscat of Spina', 'White'),  -- https://www.lyrarakis.com/en/wines-queens-muscat-of-spina
  ('Domaine Lyrarakis', 'Rosé Kotsifali', 'Crete, Greece', 'Kotsifali', 'Rosé'),  -- https://www.lyrarakis.com/en/wines-queens
  ('Domaine Lyrarakis', 'Kotsifali', 'Crete, Greece', 'Kotsifali', 'Red'),  -- https://www.lyrarakis.com/en/wines-queens
  ('Domaine Lyrarakis', 'Liatiko', 'Crete, Greece', 'Liatiko', 'Red'),  -- https://www.lyrarakis.com/en/wines-queens
  ('Domaine Lyrarakis', 'Mandilari', 'Crete, Greece', 'Mandilari', 'Red'),  -- https://www.lyrarakis.com/en/wines-queens
  ('Domaine Lyrarakis', 'Assyrtiko Voila', 'Crete, Greece', 'Assyrtiko', 'White'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Dafni Psarades', 'Crete, Greece', 'Dafni', 'White'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Kotsifali Karnari', 'Crete, Greece', 'Kotsifali', 'Red'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Liatiko Aggelis', 'Crete, Greece', 'Liatiko', 'Red'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Liatiko Kedros', 'Crete, Greece', 'Liatiko', 'Red'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Mandilari Plakoura', 'Crete, Greece', 'Mandilari', 'Red'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Melissaki Gerodeti', 'Crete, Greece', 'Melissaki', 'White'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Plyto Psarades', 'Crete, Greece', 'Plyto', 'White'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Thrapsathiri Armi', 'Crete, Greece', 'Thrapsathiri', 'White'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Vidiano Ippodromos', 'Crete, Greece', 'Vidiano', 'White'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', 'Vilana Pirovolikes', 'Crete, Greece', 'Vilana', 'White'),  -- https://www.lyrarakis.com/en/wines-single-area
  ('Domaine Lyrarakis', '001 Liatiko Mavro Spilio', 'Crete, Greece', 'Liatiko', 'Red'),  -- https://www.lyrarakis.com/en/wines-micro-batch
  ('Domaine Lyrarakis', '002 Dermatas Vidiano Efendis', 'Crete, Greece', 'Vidiano', 'White'),  -- https://www.lyrarakis.com/en/wines-micro-batch
  ('Domaine Lyrarakis', '003 Vilana Tholi', 'Crete, Greece', 'Vilana', 'White'),  -- https://www.lyrarakis.com/en/wines-micro-batch
  ('Domaine Lyrarakis', '005 Thrapsathiri Rouma', 'Crete, Greece', 'Thrapsathiri', 'White'),  -- https://www.lyrarakis.com/en/wines-micro-batch
  ('Domaine Lyrarakis', '006 Vidiano Koules', 'Crete, Greece', 'Vidiano', 'White'),  -- https://www.lyrarakis.com/en/wines-micro-batch
  ('Domaine Lyrarakis', '007 Vidiano Anemomilia', 'Crete, Greece', 'Vidiano', 'White'),  -- https://www.lyrarakis.com/en/wines-micro-batch
  ('Domaine Lyrarakis', 'Liastos', 'Crete, Greece', 'Vidiano, Plyto, Dafni, Assyrtiko, Thrapsathiri, Vilana', 'Sweet')  -- https://www.lyrarakis.com/en/wines-lyrarakis
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOULOUFAKIS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Douloufakis Winery', 'Alargo Red', 'Crete, Greece', null, 'Red'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Alargo White', 'Crete, Greece', null, 'White'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Aspros Lagos White', 'Crete, Greece', null, 'White'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Aspros Lagos Red', 'Crete, Greece', null, 'Red'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Dafnios White', 'Crete, Greece', null, 'White'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Dafnios Rosé', 'Crete, Greece', null, 'Rosé'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Dafnios Red', 'Crete, Greece', null, 'Red'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Enotria White', 'Crete, Greece', null, 'White'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Enotria Rosé', 'Crete, Greece', null, 'Rosé'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Enotria Red', 'Crete, Greece', null, 'Red'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Epoch Red', 'Crete, Greece', null, 'Sweet'),  -- https://douloufakis.wine/product-category/κρασιά/
  ('Douloufakis Winery', 'Epoch White', 'Crete, Greece', null, 'Sweet'),  -- https://douloufakis.wine/product-category/κρασιά/page/2/
  ('Douloufakis Winery', 'Femina', 'Crete, Greece', null, 'White'),  -- https://douloufakis.wine/product-category/κρασιά/page/2/
  ('Douloufakis Winery', 'Sauvignon Blanc', 'Crete, Greece', 'Sauvignon Blanc', 'White'),  -- https://douloufakis.wine/product-category/κρασιά/page/2/
  ('Douloufakis Winery', 'Notos Ego Vorias Esy', 'Crete, Greece', null, 'Red'),  -- https://douloufakis.wine/product-category/κρασιά/page/2/
  ('Douloufakis Winery', 'Sangiovese', 'Crete, Greece', 'Sangiovese', 'Red'),  -- https://douloufakis.wine/product-category/κρασιά/page/2/
  ('Douloufakis Winery', 'Tachtas', 'Crete, Greece', null, 'White'),  -- https://douloufakis.wine/product-category/κρασιά/page/2/
  ('Douloufakis Winery', 'Ilios', 'Crete, Greece', null, 'Sweet'),  -- https://douloufakis.wine/product-category/κρασιά/page/2/
  ('Douloufakis Winery', 'Grande Réserve', 'Crete, Greece', null, 'Red')  -- https://douloufakis.wine/product-category/κρασιά/page/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GENTILINI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Gentilini', 'Notes White', 'Cephalonia, Greece', 'Sauvignon Blanc', 'White'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Notes Red', 'Cephalonia, Greece', 'Agiorgitiko, Mavrodaphne', 'Red'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Rosé', 'Cephalonia, Greece', 'Moschofilero', 'Rosé'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Iri''s Rosé', 'Cephalonia, Greece', 'Mavrodaphne', 'Rosé'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Rhombus Assyrtiko-Robola', 'Cephalonia, Greece', 'Robola, Assyrtiko', 'White'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Robola', 'Cephalonia, Greece', 'Robola', 'White'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Robola Wild Paths', 'Cephalonia, Greece', 'Robola', 'White'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Tsaoussi Heritage Edition', 'Cephalonia, Greece', 'Tsaoussi', 'White'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Zakynthino Cuvée Spéciale', 'Cephalonia, Greece', 'Zakynthino', 'White'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Vostilidi Winemaker''s Cuvée', 'Cephalonia, Greece', 'Vostilidi', 'White'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Iri''s Vineyard', 'Cephalonia, Greece', 'Mavrodaphne', 'Red'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Eclipse', 'Cephalonia, Greece', 'Mavrodaphne', 'Red'),  -- https://gentilini.gr/wines/
  ('Gentilini', 'Crossed Paths Shiraz', 'Cephalonia, Greece', 'Shiraz', 'Red')  -- https://gentilini.gr/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TETRAMYTHOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Tetramythos', 'Malagousia', 'Achaia, Peloponnese, Greece', 'Malagousia', 'White'),  -- https://www.tetramythoswines.com/
  ('Tetramythos', 'Milia White', 'Achaia, Peloponnese, Greece', null, 'White'),  -- https://www.tetramythoswines.com/
  ('Tetramythos', 'Retsina', 'Achaia, Peloponnese, Greece', null, 'White'),  -- https://www.tetramythoswines.com/
  ('Tetramythos', 'Cabernet Sauvignon', 'Achaia, Peloponnese, Greece', 'Cabernet Sauvignon', 'Red'),  -- https://www.tetramythoswines.com/
  ('Tetramythos', 'Milia Red', 'Achaia, Peloponnese, Greece', null, 'Red'),  -- https://www.tetramythoswines.com/
  ('Tetramythos', 'Agiorgitiko', 'Achaia, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://www.tetramythoswines.com/
  ('Tetramythos', 'Mavro Kalavrytino', 'Achaia, Peloponnese, Greece', 'Mavro Kalavrytino', 'Red')  -- https://www.tetramythoswines.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MORAITIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Moraitis', 'Paros White', 'Paros, Greece', null, 'White'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Paros Red', 'Paros, Greece', null, 'Red'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Paros Barrel', 'Paros, Greece', null, 'White'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Paros Reserve', 'Paros, Greece', null, 'Red'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Malvasia Paros 2 Years Aged', 'Paros, Greece', 'Malvasia', 'Sweet'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Malvasia Paros 4 Years Aged', 'Paros, Greece', 'Malvasia', 'Sweet'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Thapsana', 'Paros, Greece', null, 'White'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Estate Paros', 'Paros, Greece', null, 'White'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Paros Amphora', 'Paros, Greece', null, 'White'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Estate Malagousia', 'Cyclades, Greece', 'Malagousia', 'White'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Estate Assyrtiko', 'Cyclades, Greece', 'Assyrtiko', 'White'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Rosé d''Aidani', 'Cyclades, Greece', null, 'Rosé'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Damerale', 'Cyclades, Greece', null, 'Rosé'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Sillogi White', 'Cyclades, Greece', null, 'White'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Sillogi Red', 'Cyclades, Greece', null, 'Red'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Amma', 'Cyclades, Greece', null, 'Sweet'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Meltemi White', 'Cyclades, Greece', null, 'White'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Meltemi Rosé', 'Cyclades, Greece', null, 'Rosé'),  -- https://moraitiswines.gr/κρασιά/
  ('Moraitis', 'Meltemi Red', 'Cyclades, Greece', null, 'Red')  -- https://moraitiswines.gr/κρασιά/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TSELEPOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Tselepos', 'Avlotopi', 'Arcadia, Peloponnese, Greece', 'Cabernet Sauvignon', 'Red'),  -- https://tselepos.gr/wines/%ce%b1%cf%85%ce%bb%ce%bf%cf%84%cf%8c%cf%80%ce%b9/
  ('Tselepos', 'Driopi Rosé', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Rosé'),  -- https://tselepos.gr/wines/%ce%b4%cf%81%cf%85%cf%8c%cf%80%ce%b7-%cf%81%ce%bf%ce%b6%ce%ad/
  ('Tselepos', 'Driopi Classic', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://tselepos.gr/wines/%ce%b4%cf%81%cf%85%cf%8c%cf%80%ce%b7-classic/
  ('Tselepos', 'Kokkinomylos', 'Arcadia, Peloponnese, Greece', 'Merlot', 'Red'),  -- https://tselepos.gr/wines/%ce%ba%ce%bf%ce%ba%ce%ba%ce%b9%ce%bd%cf%8c%ce%bc%cf%85%ce%bb%ce%bf%cf%82/
  ('Tselepos', 'Canava Chrysou Laoudia', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://tselepos.gr/wines/%ce%bb%ce%b1%ce%bf%cf%8d%ce%b4%ce%b9%ce%b1/
  ('Tselepos', 'Mantinia', 'Mantinia, Peloponnese, Greece', 'Moschofilero', 'White'),  -- https://tselepos.gr/wines/%ce%bc%ce%b1%ce%bd%cf%84%ce%b9%ce%bd%ce%b5%ce%af%ce%b1/
  ('Tselepos', 'Marmarias', 'Arcadia, Peloponnese, Greece', 'Chardonnay', 'White'),  -- https://tselepos.gr/wines/%ce%bc%ce%b1%cf%81%ce%bc%ce%b1%cf%81%ce%b9%ce%ac%cf%82/
  ('Tselepos', 'Melissopetra', 'Arcadia, Peloponnese, Greece', 'Gewurztraminer', 'White'),  -- https://tselepos.gr/wines/%ce%bc%ce%b5%ce%bb%ce%b9%cf%83%cf%83%cf%8c%cf%80%ce%b5%cf%84%cf%81%ce%b1/
  ('Tselepos', 'Canava Chrysou Nychteri', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://tselepos.gr/wines/%ce%bd%cf%85%cf%87%cf%84%ce%ad%cf%81%ce%b9/
  ('Tselepos', 'Canava Chrysou Santorini', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://tselepos.gr/wines/%cf%83%ce%b1%ce%bd%cf%84%ce%bf%cf%81%ce%af%ce%bd%ce%b7/
  ('Tselepos', 'Amalia Rosé', 'Arcadia, Peloponnese, Greece', 'Agiorgitiko', 'Sparkling'),  -- https://tselepos.gr/wines/amalia-%cf%81%ce%bf%ce%b6%ce%ad/
  ('Tselepos', 'Amalia Brut', 'Arcadia, Peloponnese, Greece', 'Moschofilero', 'Sparkling'),  -- https://tselepos.gr/wines/amalia-brut/
  ('Tselepos', 'Amalia Vintage', 'Arcadia, Peloponnese, Greece', 'Moschofilero', 'Sparkling'),  -- https://tselepos.gr/wines/amalia-vintage/
  ('Tselepos', 'Blanc de Gris', 'Arcadia, Peloponnese, Greece', 'Moschofilero', 'White'),  -- https://tselepos.gr/wines/blanc-de-gris/
  ('Tselepos', 'Driopi Cava', 'Nemea, Peloponnese, Greece', 'Agiorgitiko, Cabernet Sauvignon', 'Red'),  -- https://tselepos.gr/wines/cava-driopi/
  ('Tselepos', 'Deux Collines', 'Arcadia, Peloponnese, Greece', 'Cabernet Sauvignon, Merlot, Kolliniatiko', 'Red'),  -- https://tselepos.gr/wines/deux-collines/
  ('Tselepos', 'Gris de Nuit', 'Arcadia, Peloponnese, Greece', 'Moschofilero', 'Rosé'),  -- https://tselepos.gr/wines/gris-de-nuit/
  ('Tselepos', 'Driopi Reserve', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://tselepos.gr/wines/k%cf%84%ce%ae%ce%bc%ce%b1-%ce%b4%cf%81%cf%85%cf%8c%cf%80%ce%b7-reserve/
  ('Tselepos', 'Kydonitsa', 'Peloponnese, Greece', 'Kydonitsa', 'White'),  -- https://tselepos.gr/wines/kydonitsa/
  ('Tselepos', 'Canava Chrysou Vinsanto', 'Santorini, Greece', 'Assyrtiko, Aidani', 'Sweet'),  -- https://tselepos.gr/wines/vinsanto/
  ('Tselepos', 'X-mf', 'Arcadia, Peloponnese, Greece', 'Moschofilero', 'Rosé')  -- https://tselepos.gr/wines/xmf/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TROUPIS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Troupis Winery', 'Tomi Mantineia', 'Mantinia, Peloponnese, Greece', null, 'White'),  -- https://www.troupiswinery.gr/wine/
  ('Troupis Winery', 'Tomi Moschofilero Roze', 'Arcadia, Peloponnese, Greece', 'Moschofilero', 'Rosé'),  -- https://www.troupiswinery.gr/wine/tomi-roze/
  ('Troupis Winery', 'Holy Mania', 'Mantinia, Peloponnese, Greece', null, 'White'),  -- https://www.troupiswinery.gr/wine/holy-mania/
  ('Troupis Winery', 'Ekato', 'Arcadia, Peloponnese, Greece', 'Moschofilero', 'Rosé'),  -- https://www.troupiswinery.gr/wine/ekato/
  ('Troupis Winery', 'Pitys Ritinitis', 'Arcadia, Peloponnese, Greece', 'Assyrtiko', 'White'),  -- https://www.troupiswinery.gr/wine/pitys/
  ('Troupis Winery', 'Nemea', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://www.troupiswinery.gr/wine/nemea/
  ('Troupis Winery', 'Route 111', 'Peloponnese, Greece', 'Mavrodafni, Agiorgitiko', 'Red'),  -- https://www.troupiswinery.gr/wine/route-111/
  ('Troupis Winery', 'Sweet Route', 'Arcadia, Peloponnese, Greece', 'Moschofilero', 'Sweet'),  -- https://www.troupiswinery.gr/wine/sweet-route/
  ('Troupis Winery', 'Fteri Agiorgitiko', 'Peloponnese, Greece', 'Agiorgitiko', 'Red')  -- https://www.troupiswinery.gr/wine/fteri-agiorgitiko/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SAMOS EOSS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Samos EOSS', 'Samos Vin Doux', 'Samos, Greece', 'Muscat', 'Sweet'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'Samos Grand Cru', 'Samos, Greece', 'White Muscat', 'Sweet'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'Samos Phyllas', 'Samos, Greece', 'Muscat', 'Sweet'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'Samos Anthemis', 'Samos, Greece', 'Muscat', 'Sweet'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'Samos Nectar', 'Samos, Greece', null, 'Sweet'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'Samos Solera', 'Samos, Greece', null, 'Sweet'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'Psiles Corfes', 'Samos, Greece', 'Muscat', 'White'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'Moscato Aspro', 'Samos, Greece', 'Muscat', 'White'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'Ancaeus', 'Samos, Greece', null, 'Red'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'BaBeloenos Rosé Semi-Dry', 'Samos, Greece', 'Avgoustiati, Fokiano, Muscat', 'Rosé'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'BaBeloenos White Semi-Dry', 'Samos, Greece', 'Muscat', 'White'),  -- https://www.samoswine.gr/en/
  ('Samos EOSS', 'Unscathed Wine Erimitis', 'Samos, Greece', null, 'Orange')  -- https://www.samoswine.gr/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GAIA WINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Gaia Wines', 'Optimus', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Gaia Estate', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Thalassitis Submerged', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Ammonite', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Thalassitis', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Assyrtiko Wild Ferment', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Agiorgitiko', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Nychteri', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Gaia S Red', 'Nemea, Peloponnese, Greece', 'Agiorgitiko, Syrah', 'Red'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Gaia S Rosé', 'Nemea, Peloponnese, Greece', 'Agiorgitiko, Syrah', 'Rosé'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Vinsanto', 'Santorini, Greece', 'Assyrtiko', 'Sweet'),  -- https://gaiawines.gr/
  ('Gaia Wines', 'Gaia S White', 'Nemea, Peloponnese, Greece', null, 'White'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Notios Red', 'Nemea, Peloponnese, Greece', null, 'Red'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Notios White', 'Nemea, Peloponnese, Greece', null, 'White'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Assyrtiko Clay', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Thalassitis Cellar Aged', 'Santorini, Greece', null, 'White'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Moschofilero Wild Ferment', 'Nemea, Peloponnese, Greece', 'Moschofilero', 'White'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Monograph Assyrtiko', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Monograph Moschofilero', 'Nemea, Peloponnese, Greece', 'Moschofilero', 'White'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Monograph Agiorgitiko', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Monograph Rosé', 'Nemea, Peloponnese, Greece', null, 'Rosé'),  -- https://gaiawines.gr/en/all-wines-en/
  ('Gaia Wines', 'Monograph Agiorgitiko Syrah', 'Nemea, Peloponnese, Greece', 'Agiorgitiko, Syrah', 'Red')  -- https://gaiawines.gr/all-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ZAFEIRAKIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Domaine Zafeirakis', 'Malagousia', 'Tyrnavos, Thessaly, Greece', 'Malagousia', 'White'),  -- https://www.domainezafeirakis.com/
  ('Domaine Zafeirakis', 'Foothills Chardonnay', 'Tyrnavos, Thessaly, Greece', 'Chardonnay', 'White'),  -- https://www.domainezafeirakis.com/
  ('Domaine Zafeirakis', 'Microcosmos Malagousia', 'Tyrnavos, Thessaly, Greece', 'Malagousia', 'White'),  -- https://www.domainezafeirakis.com/
  ('Domaine Zafeirakis', 'Logos', 'Tyrnavos, Thessaly, Greece', 'Chardonnay', 'White'),  -- https://www.domainezafeirakis.com/
  ('Domaine Zafeirakis', 'Assyrtiko', 'Tyrnavos, Thessaly, Greece', 'Assyrtiko', 'White'),  -- https://www.domainezafeirakis.com/
  ('Domaine Zafeirakis', 'Natura Malagousia', 'Tyrnavos, Thessaly, Greece', 'Malagousia', 'White'),  -- https://www.domainezafeirakis.com/
  ('Domaine Zafeirakis', 'Limniona Rosé', 'Tyrnavos, Thessaly, Greece', 'Limniona', 'Rosé'),  -- https://www.domainezafeirakis.com/
  ('Domaine Zafeirakis', 'Limniona', 'Tyrnavos, Thessaly, Greece', 'Limniona', 'Red'),  -- https://www.domainezafeirakis.com/
  ('Domaine Zafeirakis', 'Limniona Terra Cotta', 'Tyrnavos, Thessaly, Greece', 'Limniona', 'Red'),  -- https://www.domainezafeirakis.com/
  ('Domaine Zafeirakis', 'Limniona Young Vineyards', 'Tyrnavos, Thessaly, Greece', 'Limniona', 'Red')  -- https://www.domainezafeirakis.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VASSALTIS VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Vassaltis Vineyards', 'Nassitis', 'Santorini, Greece', 'Assyrtiko, Aidani, Athiri', 'White'),  -- https://vassaltis.com/nassitis-2/
  ('Vassaltis Vineyards', 'Santorini', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://vassaltis.com/santorini-2/
  ('Vassaltis Vineyards', 'Gramina', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://vassaltis.com/gramina/
  ('Vassaltis Vineyards', 'Vinsanto', 'Santorini, Greece', null, 'Sweet')  -- https://vassaltis.com/vinsanto-3/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KIR-YIANNI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Kir-Yianni', 'Ramnista Xinomavro', 'Naoussa, Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://www.skurnik.com/producer/kir-yianni/
  ('Kir-Yianni', 'L''Esprit du Lac Xinomavro Rosé', 'Amyndeon, Macedonia, Greece', 'Xinomavro', 'Rosé'),  -- https://www.skurnik.com/producer/kir-yianni/
  ('Kir-Yianni', 'Assyrtiko The North', 'Macedonia, Greece', 'Assyrtiko', 'White'),  -- https://www.skurnik.com/producer/kir-yianni/
  ('Kir-Yianni', 'The Fallen Oak Estate Red Blend', 'Macedonia, Greece', null, 'Red'),  -- https://www.skurnik.com/producer/kir-yianni/
  ('Kir-Yianni', 'Naoussa Cuvée Villages', 'Naoussa, Macedonia, Greece', null, 'Red'),  -- https://www.skurnik.com/producer/kir-yianni/
  ('Kir-Yianni', 'Akakies Sparkling Rosé', 'Amyndeon, Macedonia, Greece', null, 'Sparkling'),  -- https://www.skurnik.com/producer/kir-yianni/
  ('Kir-Yianni', 'Paranga Sparkling', 'Macedonia, Greece', 'Xinomavro, Roditis, Chardonnay', 'Sparkling'),  -- https://www.greeceandgrapes.com/en/sparkling-wine-paranga-sparkling-estate-kir-yianni
  ('Kir-Yianni', 'XMD Xinomavro-Mavrodaphne', 'Naoussa, Macedonia, Greece', 'Xinomavro, Mavrodaphne', 'Red'),  -- https://www.greeceandgrapes.com/en/red-xmd-2013-magnum-kir-yianni-ktima
  ('Kir-Yianni', 'Goumenissa', 'Goumenissa, Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://www.greeceandgrapes.com/en/red-goumenissa-2019-kir-yianni-ktima
  ('Kir-Yianni', 'Daphne', 'Naoussa, Macedonia, Greece', 'Mavrodaphne', 'Red'),  -- https://www.greeceandgrapes.com/en/red-daphne-2022-ktima-kir-yianni
  ('Kir-Yianni', 'Palpo', 'Macedonia, Greece', 'Chardonnay', 'White'),  -- https://www.greeceandgrapes.com/en/white-wine-palpo-2024-kir-yianni-ktima
  ('Kir-Yianni', 'Tarsanas Single Vineyard Assyrtiko', 'Naoussa, Macedonia, Greece', 'Assyrtiko', 'White'),  -- https://www.greeceandgrapes.com/en/white-tarsanas-single-vineyard-assyrtiko-2022-ktima-kir-yianni
  ('Kir-Yianni', 'Kali Riza', 'Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://www.greeceandgrapes.com/en/red-kali-riza-2022-kir-yianni-ktima
  ('Kir-Yianni', 'Yianakohori', 'Macedonia, Greece', 'Merlot, Xinomavro', 'Red'),  -- https://www.greeceandgrapes.com/en/red-yianakohori-2011-jeroboam-3l-kir-yianni-ktima
  ('Kir-Yianni', 'Xinomavro Amphora', 'Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://www.greeceandgrapes.com/en/red-xinomavro-amphora-2023-kir-yianni-ktima
  ('Kir-Yianni', 'Vidiano', 'Macedonia, Greece', 'Vidiano', 'White'),  -- https://www.greeceandgrapes.com/en/white-vidiano-2023-kir-yianni-ktima
  ('Kir-Yianni', 'Syrah', 'Macedonia, Greece', 'Syrah', 'Red'),  -- https://www.greeceandgrapes.com/en/red-syrah-2021-estate-kir-yianni
  ('Kir-Yianni', 'Assyrtiko Ancien', 'Macedonia, Greece', 'Assyrtiko', 'White'),  -- https://www.greeceandgrapes.com/en/white-estate-kir-yianni-assyrtiko-ancien-2018
  ('Kir-Yianni', 'Roditis Orange', 'Macedonia, Greece', 'Roditis', 'Orange'),  -- https://www.greeceandgrapes.com/en/white-estate-kir-yianni-roditis-orange-2023
  ('Kir-Yianni', 'Diaporos', 'Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://www.greeceandgrapes.com/en/red-diaporos-2020-kir-yianni-ktima
  ('Kir-Yianni', 'Ble Tracter Red', 'Macedonia, Greece', 'Syrah, Cabernet Sauvignon, Merlot', 'Red'),  -- https://www.greeceandgrapes.com/en/red-greek-ble-tracter-2024-kir-yianni-ktima
  ('Kir-Yianni', 'Ble Tracter White', 'Macedonia, Greece', 'Assyrtiko, Viognier, Chardonnay', 'White'),  -- https://www.greeceandgrapes.com/en/white-greek-ble-tracter-2025-kir-yianni-ktima
  ('Kir-Yianni', 'Akakies', 'Amyndeon, Macedonia, Greece', 'Xinomavro', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-akakies-2025-kir-yianni-ktima
  ('Kir-Yianni', 'Paranga White', 'Macedonia, Greece', 'Roditis, Malagousia', 'White'),  -- https://www.greeceandgrapes.com/en/white-paranga-2025-kir-yianni-ktima
  ('Kir-Yianni', 'Tesseris Limnes', 'Macedonia, Greece', 'Chardonnay, Gewurztraminer', 'White'),  -- https://www.greeceandgrapes.com/en/white-tesseris-limnes-2025-kir-yianni-ktima
  ('Kir-Yianni', 'Blue Fox', 'Naoussa, Macedonia, Greece', 'Merlot, Xinomavro, Syrah', 'Red'),  -- https://www.greeceandgrapes.com/en/red-blue-fox-mple-alepou-2022-ktima-kir-yianni
  ('Kir-Yianni', 'Droumo Sauvignon Blanc', 'Macedonia, Greece', 'Sauvignon Blanc', 'White'),  -- https://www.greeceandgrapes.com/en/white-droumo-sauvignon-blanc-2025-kir-yianni-ktima
  ('Kir-Yianni', 'Agathoto Rosé', 'Macedonia, Greece', 'Xinomavro', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-agathoto-rose-2025-kir-yianni-ktima
  ('Kir-Yianni', 'Dyo Elies', 'Macedonia, Greece', 'Syrah, Merlot', 'Red')  -- https://www.greeceandgrapes.com/en/red-dyo-elies-2022-kir-yianni-ktima
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KTIMA KOSTA LAZARIDI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Ktima Kosta Lazaridi', 'Syrah', 'Drama, Macedonia, Greece', 'Syrah', 'Red'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi
  ('Ktima Kosta Lazaridi', 'Amethystos Cava', 'Drama, Macedonia, Greece', null, 'Red'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi
  ('Ktima Kosta Lazaridi', 'Blanc de Blancs Brut', 'Drama, Macedonia, Greece', null, 'Sparkling'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi
  ('Ktima Kosta Lazaridi', 'Amethystos Red', 'Drama, Macedonia, Greece', null, 'Red'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi?page=2
  ('Ktima Kosta Lazaridi', 'Château Julia Chardonnay', 'Drama, Macedonia, Greece', 'Chardonnay', 'White'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi?page=2
  ('Ktima Kosta Lazaridi', 'Rosé', 'Drama, Macedonia, Greece', null, 'Rosé'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi?page=2
  ('Ktima Kosta Lazaridi', 'Amethystos White', 'Drama, Macedonia, Greece', null, 'White'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi?page=2
  ('Ktima Kosta Lazaridi', 'Château Julia Assyrtiko', 'Drama, Macedonia, Greece', 'Assyrtiko', 'White'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi?page=2
  ('Ktima Kosta Lazaridi', 'Château Julia Merlot', 'Drama, Macedonia, Greece', 'Merlot', 'Red'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi?page=2
  ('Ktima Kosta Lazaridi', 'Malagousia', 'Drama, Macedonia, Greece', 'Malagousia', 'White'),  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi?page=2
  ('Ktima Kosta Lazaridi', 'Château Julia Agiorgitiko', 'Drama, Macedonia, Greece', 'Agiorgitiko', 'Red')  -- https://greeceandgrapes.com/en/wineries/domaine-costa-lazaridi?page=2
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THYMIOPOULOS VINEYARDS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Thymiopoulos Vineyards', 'Rapsani Terra Petra', 'Rapsani, Thessaly, Greece', 'Xinomavro, Krassato, Stavroto', 'Red'),  -- https://www.greeceandgrapes.com/en/red-rapsani-terra-petra-2020-thymiopoulos-vineyards
  ('Thymiopoulos Vineyards', 'Blanc des Coteaux', 'Imathia, Macedonia, Greece', 'Malagousia, Assyrtiko, Vidiano, Aidani', 'White'),  -- https://www.greeceandgrapes.com/en/white-blanc-des-coteaux-2023-thymiopoulos-vineyards
  ('Thymiopoulos Vineyards', 'Naoussa Alta', 'Naoussa, Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://www.greeceandgrapes.com/en/red-naoussa-alta-2024-thymiopoulos-vineyards
  ('Thymiopoulos Vineyards', 'Xinomavro Nature', 'Naoussa, Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://www.greeceandgrapes.com/en/red-xinomavro-nature-2024-thymiopoulos-vineyards
  ('Thymiopoulos Vineyards', 'Earth and Sky', 'Naoussa, Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://www.greeceandgrapes.com/en/red-greek-earth-and-sky-2024-thymiopoulos-vineyards
  ('Thymiopoulos Vineyards', 'Rosé de Xinomavro', 'Naoussa, Macedonia, Greece', 'Xinomavro', 'Rosé')  -- https://www.greeceandgrapes.com/en/rose-de-xinomavro-2025-thymiopoulos-vineyards
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MYLONAS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Mylonas Winery', 'Sunday', 'Attica, Greece', 'Savatiano, Aidani', 'Sweet'),  -- https://www.greeceandgrapes.com/en/sweet-wine-sunday-mylonas-winery
  ('Mylonas Winery', 'Retsina', 'Attica, Greece', 'Savatiano', 'White'),  -- https://www.greeceandgrapes.com/en/white-retsina-mylonas-winery
  ('Mylonas Winery', 'Naked Truth', 'Attica, Greece', 'Savatiano', 'White'),  -- https://www.greeceandgrapes.com/en/white-naked-truth-2023-mylonas-winery
  ('Mylonas Winery', 'Cuvée Vouno', 'Attica, Greece', 'Savatiano', 'White'),  -- https://www.greeceandgrapes.com/en/white-cuvee-vouno-2021-mylonas-winery
  ('Mylonas Winery', 'Malagousia', 'Attica, Greece', 'Malagousia', 'White'),  -- https://www.greeceandgrapes.com/en/white-malagousia-2025-mylonas-winery
  ('Mylonas Winery', 'Concept Rosé', 'Attica, Greece', 'Malagousia, Mandilaria', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-mylonas-winery-concept-rosé-2025
  ('Mylonas Winery', 'Pet Nat', 'Attica, Greece', 'Savatiano', 'Sparkling'),  -- https://www.greeceandgrapes.com/en/sparkling-petnat-2024-mylonas-winery
  ('Mylonas Winery', 'Assyrtiko', 'Attica, Greece', 'Assyrtiko', 'White'),  -- https://www.greeceandgrapes.com/en/white-assyrtiko-2025-winery-mylonas
  ('Mylonas Winery', 'Savatiano', 'Attica, Greece', 'Savatiano', 'White')  -- https://www.greeceandgrapes.com/en/white-savatiano-2025-mylonas-winery
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KTIMA DALAMARA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Ktima Dalamara', 'Naoussa', 'Naoussa, Macedonia, Greece', 'Xinomavro', 'Red'),  -- https://www.greeceandgrapes.com/en/red-naoussa-2023-dalamaras-domaine
  ('Ktima Dalamara', 'Ayehoros', 'Naoussa, Macedonia, Greece', 'Xinomavro, Merlot', 'Red')  -- https://www.greeceandgrapes.com/en/red-ayehoros-2024-dalamara-domaine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GLINAVOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Domaine Glinavos', 'Poème de Nature Blanc', 'Zitsa, Epirus, Greece', 'Debina, Xinomavro', 'Sparkling'),  -- https://www.greeceandgrapes.com/en/sparkling-domaine-glinavos-poeme-de-nature-blanc
  ('Domaine Glinavos', 'Poème de Nature Rosé', 'Zitsa, Epirus, Greece', 'Debina, Xinomavro', 'Sparkling'),  -- https://www.greeceandgrapes.com/en/sparkling-domaine-glinavos-poeme-de-nature-rose
  ('Domaine Glinavos', 'Fine Debina', 'Zitsa, Epirus, Greece', 'Debina', 'White'),  -- https://www.greeceandgrapes.com/en/white-domaine-glinavos-fine-debina-2024
  ('Domaine Glinavos', 'Paleokerisio', 'Zitsa, Epirus, Greece', 'Debina, Vlachiko', 'Sparkling')  -- https://www.greeceandgrapes.com/en/sparkling-paleokerisio-glinavos-domaine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE KARANIKA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Domaine Karanika', 'Extra Brut Cuvée Rosé', 'Amyndeon, Macedonia, Greece', 'Xinomavro, Limniona', 'Sparkling'),  -- https://www.greeceandgrapes.com/en/sparkling-rose-cuvee-extra-brut-2024-karanika-domaine
  ('Domaine Karanika', 'Brut Nature Extra Cuvée de Reserve', 'Amyndeon, Macedonia, Greece', 'Xinomavro', 'Sparkling'),  -- https://www.greeceandgrapes.com/en/sparkling-domaine-karanika-brut-nature-extra-cuvée-de-reserve-2016-magnum
  ('Domaine Karanika', 'Extra Brut Cuvée Speciale', 'Amyndeon, Macedonia, Greece', 'Xinomavro, Assyrtiko', 'Sparkling'),  -- https://www.greeceandgrapes.com/en/sparkling-extra-brut-cuvee-speciale-2024-domaine-karanika
  ('Domaine Karanika', 'Blanc de Blancs', 'Amyndeon, Macedonia, Greece', null, 'Sparkling'),  -- https://karanika.com/product-category/wines/
  ('Domaine Karanika', 'Cuvée Prestige Extra Brut', 'Amyndeon, Macedonia, Greece', null, 'Sparkling')  -- https://karanika.com/product-category/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MERCOURI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Domaine Mercouri', 'Albariño', 'Ilia, Peloponnese, Greece', 'Albariño', 'White'),  -- https://www.greeceandgrapes.com/en/white-albarino-2024-mercouri-estate
  ('Domaine Mercouri', 'Belvedere', 'Ilia, Peloponnese, Greece', 'Malvasia Aromatica', 'Sweet'),  -- https://www.greeceandgrapes.com/en/sweet-belvedere-2019-mercouri-estate
  ('Domaine Mercouri', 'Daphne Nera', 'Ilia, Peloponnese, Greece', 'Mavrodaphne', 'Red'),  -- https://www.greeceandgrapes.com/en/red-daphne-nera-2022-mercouri-estate
  ('Domaine Mercouri', 'Heritage', 'Ilia, Peloponnese, Greece', 'Mavroudi', 'Red'),  -- https://www.greeceandgrapes.com/en/red-heritage-mavroudi-2022-merkouri-estate
  ('Domaine Mercouri', 'Hortais', 'Ilia, Peloponnese, Greece', 'Mavrodaphne, Corinthian Currant', 'Sweet'),  -- https://www.greeceandgrapes.com/en/sweet-hortais-2010-merkouri-estate
  ('Domaine Mercouri', 'Estate Red', 'Ilia, Peloponnese, Greece', 'Refosco, Mavrodaphne', 'Red'),  -- https://www.greeceandgrapes.com/en/red-2022-mercouri-estate
  ('Domaine Mercouri', 'Refosco Clone', 'Ilia, Peloponnese, Greece', 'Refosco', 'Red'),  -- https://www.greeceandgrapes.com/en/red-refosco-clone-2020-mercouri-estate
  ('Domaine Mercouri', 'Avgoustiatis', 'Ilia, Peloponnese, Greece', 'Avgoustiatis', 'Red')  -- https://www.greeceandgrapes.com/en/red-avgoustiatis-2020-mercouri-estate
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WINE ART ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Wine Art Estate', 'Touriga Nacional', 'Drama, Macedonia, Greece', 'Touriga Nacional', 'Red'),  -- https://www.greeceandgrapes.com/en/red-touriga-nacional-2014-wine-art
  ('Wine Art Estate', 'Anafora', 'Drama, Macedonia, Greece', 'Limniona', 'Red'),  -- https://www.greeceandgrapes.com/en/anafora-2019-wine-art-estate
  ('Wine Art Estate', 'Idisma Drios Assyrtiko', 'Drama, Macedonia, Greece', 'Assyrtiko', 'White'),  -- https://www.greeceandgrapes.com/en/white-idisma-drios-assyrtiko-2025-wine-art-estate
  ('Wine Art Estate', 'Plano Assyrtiko', 'Drama, Macedonia, Greece', 'Assyrtiko', 'White'),  -- https://www.greeceandgrapes.com/en/white-plano-assyrtiko-2024-wine-art-estate
  ('Wine Art Estate', 'Techni Alipias White', 'Drama, Macedonia, Greece', 'Sauvignon Blanc, Assyrtiko', 'White'),  -- https://www.greeceandgrapes.com/en/white-techni-alipias-2025-wine-art-estate
  ('Wine Art Estate', 'Techni Alipias Rosé', 'Drama, Macedonia, Greece', 'Syrah, Merlot, Sangiovese, Nebbiolo, Cabernet Sauvignon', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-techni-alipias-2025-wine-art-estate
  ('Wine Art Estate', 'Plano Malagousia', 'Drama, Macedonia, Greece', 'Malagousia', 'White'),  -- https://www.greeceandgrapes.com/en/white-plano-malagousia-2025-wine-art-estate
  ('Wine Art Estate', 'Idisma Drios Chardonnay', 'Drama, Macedonia, Greece', 'Chardonnay', 'White'),  -- https://www.greeceandgrapes.com/en/white-idisma-drios-chardonnay-2025-wine-art-estate
  ('Wine Art Estate', 'Idisma Drios Xi', 'Drama, Macedonia, Greece', 'Xinomavro', 'Red')  -- https://www.greeceandgrapes.com/en/red-idisma-drios-xi-xinomavro-2021-wine-art-estate
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VENETSANOS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Venetsanos Winery', 'Santorini', 'Santorini, Greece', 'Assyrtiko', 'White'),  -- https://www.greeceandgrapes.com/en/white-santorini-2023-winery-venetsanos
  ('Venetsanos Winery', 'Anagallis Rosé', 'Santorini, Greece', 'Mandilaria, Assyrtiko, Aidani', 'Rosé')  -- https://www.greeceandgrapes.com/en/rose-venetsanos-winery-anagallis-rose-2023
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LANTIDES WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Lantides Winery', 'Ergo Nemea Agiorgitiko', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://www.greeceandgrapes.com/en/red-ergo-nemea-2024-lantides-winery
  ('Lantides Winery', 'Little Ark White', 'Peloponnese, Greece', 'Malagousia, Assyrtiko', 'White'),  -- https://www.greeceandgrapes.com/en/white-little-ark-2025-lantides-winery
  ('Lantides Winery', 'Ergo Sauvignon Blanc', 'Peloponnese, Greece', 'Sauvignon Blanc', 'White'),  -- https://www.greeceandgrapes.com/en/white-ergo-sauvignon-blanc-2025-lantides-winery
  ('Lantides Winery', 'Little Ark Rosé', 'Peloponnese, Greece', 'Moschofilero', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-lantides-winery-little-ark-rose-2025
  ('Lantides Winery', 'Goldvine', 'Peloponnese, Greece', 'Cabernet Sauvignon', 'Red')  -- https://www.greeceandgrapes.com/en/red-goldvine-cabernet-sauvignon-2024-lantides-winery
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MONEMVASIA WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Monemvasia Winery', 'Malvasia', 'Monemvasia, Peloponnese, Greece', 'Monemvasia, Assyrtiko, Kidonitsa, Asproudes', 'Sweet'),  -- https://www.greeceandgrapes.com/en/sweet-wine-monemvasia-2012-malvasia-wines
  ('Monemvasia Winery', 'Tsimbidi Kydonitsa Mature', 'Monemvasia, Peloponnese, Greece', 'Kidonitsa', 'White'),  -- https://www.greeceandgrapes.com/en/white-kydonitsa-mature-2019-tsimbidi-monemvasia-winery
  ('Monemvasia Winery', 'Tsimbidi Panther Rosé', 'Monemvasia, Peloponnese, Greece', 'Agiorgitiko, Limniona, Mavroudi', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-panther-2024-tsimbidi-monemvasia-winery
  ('Monemvasia Winery', 'Tsimbidi Kydonitsa', 'Monemvasia, Peloponnese, Greece', 'Kidonitsa', 'White'),  -- https://www.greeceandgrapes.com/en/white-kydonitsa-2025-tsimbidi-monemvasia-winery
  ('Monemvasia Winery', 'Tsimbidi 300 Red', 'Monemvasia, Peloponnese, Greece', 'Agiorgitiko, Mavroudi', 'Red'),  -- https://www.greeceandgrapes.com/en/red-monemvasia-winery-tsimbidi-300-red-2018
  ('Monemvasia Winery', '300 White', 'Monemvasia, Peloponnese, Greece', 'Kidonitsa, Assyrtiko', 'White')  -- https://www.greeceandgrapes.com/en/white-monemvasia-winery-300-white-2024
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THEOPETRA ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Theopetra Estate', '24', 'Meteora, Thessaly, Greece', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://www.greeceandgrapes.com/en/red-theopetra-estate-24-2020
  ('Theopetra Estate', 'Limniona', 'Meteora, Thessaly, Greece', 'Limniona', 'Red'),  -- https://www.greeceandgrapes.com/en/red-limniona-2022-estate-theopetra
  ('Theopetra Estate', 'Red', 'Meteora, Thessaly, Greece', 'Cabernet Sauvignon, Syrah, Limniona', 'Red'),  -- https://www.greeceandgrapes.com/en/red-2023-theopetra-estate
  ('Theopetra Estate', 'Xinomavro Rosé', 'Meteora, Thessaly, Greece', 'Xinomavro', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-xinomavro-2025-estate-theopetra
  ('Theopetra Estate', 'Rosé', 'Meteora, Thessaly, Greece', 'Limniona, Syrah', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-2025-theopetra-estate
  ('Theopetra Estate', 'Aprilis White Sparkling', 'Meteora, Thessaly, Greece', 'Xinomavro, Sauvignon Blanc', 'Sparkling')  -- https://www.greeceandgrapes.com/en/sparkling-white-aprilis-2022-theopetra-estate
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PARPAROUSSIS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Parparoussis Winery', 'Taos', 'Patras, Peloponnese, Greece', 'Mavrodaphne', 'Red'),  -- https://www.greeceandgrapes.com/en/red-taos-2021-parparoussis-winery
  ('Parparoussis Winery', 'Ta Dora tou Dionysou', 'Patras, Peloponnese, Greece', 'Sideritis', 'White'),  -- https://www.greeceandgrapes.com/en/white-ta-dora-tou-dionysou-2025-winery-parparoussis
  ('Parparoussis Winery', 'Oinari', 'Patras, Peloponnese, Greece', 'Agiorgitiko, Mavrodaphne', 'Red'),  -- https://www.greeceandgrapes.com/en/red-oinari-2023-parparoussis-winery
  ('Parparoussis Winery', 'Assyrtiko', 'Patras, Peloponnese, Greece', 'Assyrtiko', 'White'),  -- https://www.greeceandgrapes.com/en/white-parparoussis-winery-assyrtiko-2025
  ('Parparoussis Winery', 'Pronomio', 'Patras, Peloponnese, Greece', 'Agiorgitiko, Mavrodaphne, Mavroudi', 'Red'),  -- https://www.greeceandgrapes.com/en/red-pronomio-limited-edition-2018-parparoussis-winery
  ('Parparoussis Winery', 'Epilegmenos Oinos Nemea Reserve', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://www.greeceandgrapes.com/en/red-epilegmenos-oinos-nemea-reserve-2018-parparoussis-winery
  ('Parparoussis Winery', 'Moscato Riou Patron', 'Patras, Peloponnese, Greece', 'Moschato Patras', 'Sweet')  -- https://www.greeceandgrapes.com/en/sweet-moscato-riou-patron-2020-parparoussis-winery
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SEMELI ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Semeli Estate', 'Spondee', 'Nemea, Peloponnese, Greece', 'Cabernet Sauvignon, Merlot, Syrah', 'Red'),  -- https://www.greeceandgrapes.com/en/red-greek-spondee-2022-semeli-estate
  ('Semeli Estate', 'Low Rosé', 'Nemea, Peloponnese, Greece', 'Syrah, Grenache Rouge', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-semeli-estate-low-rose-2024
  ('Semeli Estate', 'Oreinos Helios White', 'Corinthia, Peloponnese, Greece', 'Moschofilero, Sauvignon Blanc', 'White'),  -- https://www.greeceandgrapes.com/en/white-estate-semeli-oreinos-helios-white-2025
  ('Semeli Estate', 'Nemea Reserve', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://www.greeceandgrapes.com/en/red-nemea-reserve-2021-estate-semeli
  ('Semeli Estate', 'Mantinia', 'Mantinia, Peloponnese, Greece', 'Moschofilero', 'White'),  -- https://www.greeceandgrapes.com/en/white-mantinia-2024-estate-semeli
  ('Semeli Estate', 'Aetheria', 'Peloponnese, Greece', 'Malagousia, Chardonnay', 'White')  -- https://www.greeceandgrapes.com/en/white-dry-aetheria-2025-semeli-estate
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PALIVOU ESTATE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_greece.sql)'
from (values
  ('Palivou Estate', 'Terra Leone Ammos', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Red'),  -- https://www.greeceandgrapes.com/en/red-terra-leone-ammos-nemea-2023-palivou
  ('Palivou Estate', 'Vissinokipos', 'Nemea, Peloponnese, Greece', 'Agiorgitiko', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-vissinokipos-2025-ktima-palivou
  ('Palivou Estate', 'La Vie en Rose', 'Peloponnese, Greece', 'Moschofilero', 'Rosé'),  -- https://www.greeceandgrapes.com/en/rose-la-vie-en-rose-2025-palivou-ktima
  ('Palivou Estate', 'Stone Hills', 'Nemea, Peloponnese, Greece', 'Chardonnay, Malagousia, Muscat', 'White'),  -- https://www.greeceandgrapes.com/en/white-stone-hills-petrines-plagies-2025-palivou-ktima
  ('Palivou Estate', 'Ploutos', 'Nemea, Peloponnese, Greece', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://www.greeceandgrapes.com/en/red-ploutos-2017-palivou-ktima
  ('Palivou Estate', 'Ihnos', 'Nemea, Peloponnese, Greece', 'Merlot', 'Red')  -- https://www.greeceandgrapes.com/en/red-ihnos-2020-palivou-ktima
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
