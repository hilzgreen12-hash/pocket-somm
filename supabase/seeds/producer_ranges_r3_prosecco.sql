-- Producer ranges round 3: Prosecco. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- COL VETORAZ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Col Vetoraz', 'Valdobbiadene Prosecco Superiore DOCG Extra Brut Cuvée Ø', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.colvetoraz.it/vini/
  ('Col Vetoraz', 'Valdobbiadene Prosecco Superiore DOCG Extra Brut Cuvée 5', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.colvetoraz.it/vini/
  ('Col Vetoraz', 'Valdobbiadene Prosecco Superiore DOCG Brut Coste di Levante', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.colvetoraz.it/vini/
  ('Col Vetoraz', 'Valdobbiadene Prosecco Superiore DOCG Extra Dry Cuvée 13', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.colvetoraz.it/vini/
  ('Col Vetoraz', 'Valdobbiadene Prosecco Superiore DOCG Extra Dry Coste di Ponente', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.colvetoraz.it/vini/
  ('Col Vetoraz', 'Valdobbiadene Prosecco Superiore DOCG Millesimato Dry Coste di Mezzodì', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.colvetoraz.it/vini/
  ('Col Vetoraz', 'Valdobbiadene Superiore di Cartizze DOCG', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.colvetoraz.it/vini/
  ('Col Vetoraz', 'Valdobbiadene Prosecco Superiore DOCG Tresiese', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.colvetoraz.it/vini/
  ('Col Vetoraz', 'Valdobbiadene Prosecco Superiore DOCG Brut Rosa Dodici Lune', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling')  -- https://www.colvetoraz.it/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LA MARCA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('La Marca', 'Prosecco DOC', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.lamarcaprosecco.com/our-proseccos.html
  ('La Marca', 'Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.lamarcaprosecco.com/our-proseccos.html
  ('La Marca', 'Prosecco DOC Demi Sec', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.lamarcaprosecco.com/our-proseccos.html
  ('La Marca', 'Luminore Conegliano Valdobbiadene Prosecco Superiore DOCG', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.lamarcaprosecco.com/our-proseccos.html
  ('La Marca', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/la-marca/
  ('La Marca', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/la-marca/
  ('La Marca', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/la-marca/
  ('La Marca', 'Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.prosecco.it/en/scheda-cantina/la-marca/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RUGGERI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Ruggeri', 'Valdobbiadene Prosecco Superiore DOCG L''Extrabrut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Enrosadira Rosé di Pinot Brut', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Valdobbiadene Prosecco Superiore DOCG Giustino B. Extra Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Valdobbiadene Prosecco Superiore DOCG Vecchie Viti Brut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Valdobbiadene Superiore di Cartizze DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Valdobbiadene Prosecco Superiore DOCG Saltèr Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Valdobbiadene Prosecco Superiore DOCG Santo Stefano Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Valdobbiadene Prosecco Superiore DOCG Giall''Oro Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Valdobbiadene Prosecco Superiore DOCG Quartese Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Argeo Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Argeo Prosecco Rosé DOC Treviso Brut Millesimato', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Morbìn Vino Spumante Extra Dry', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://ruggeri.it/i-vini/
  ('Ruggeri', 'Prosecco DOC Treviso Frizzante', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling')  -- https://ruggeri.it/i-vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ADAMI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Adami', 'Valdobbiadene Prosecco Superiore DOCG RPS Uno Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.adamiprosecco.it/vini/
  ('Adami', 'Valdobbiadene Prosecco Superiore DOCG Rive di Colbertaldo Vigneto Giardino Asciutto', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.adamiprosecco.it/vini/
  ('Adami', 'Valdobbiadene Prosecco Superiore DOCG Rive di Farra di Soligo Col Credas Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.adamiprosecco.it/vini/
  ('Adami', 'Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.adamiprosecco.it/vini/
  ('Adami', 'Valdobbiadene Prosecco Superiore DOCG Dei Casel Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.adamiprosecco.it/vini/
  ('Adami', 'Valdobbiadene Prosecco Superiore DOCG Bosco di Gica Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.adamiprosecco.it/vini/
  ('Adami', 'Valdobbiadene Prosecco Superiore DOCG Col Fondo Sui Lieviti Brut Nature', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.adamiprosecco.it/vini/
  ('Adami', 'Garbèl Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.adamiprosecco.it/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LE COLTURE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Le Colture', 'Valdobbiadene Superiore di Cartizze DOCG', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.lecolture.com/wines
  ('Le Colture', 'Valdobbiadene Prosecco Superiore DOCG Dry Cruner', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.lecolture.com/wines
  ('Le Colture', 'Valdobbiadene Prosecco Superiore DOCG Extra Dry Pianer', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.lecolture.com/wines
  ('Le Colture', 'Valdobbiadene Prosecco Superiore DOCG Brut Fagher', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.lecolture.com/wines
  ('Le Colture', 'Valdobbiadene Prosecco Superiore DOCG Rive di Santo Stefano Brut Gerardo', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.lecolture.com/wines
  ('Le Colture', 'Brut Millesimato Rosé', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.lecolture.com/wines
  ('Le Colture', 'Mas Frizzante', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.lecolture.com/wines
  ('Le Colture', 'Incalmo Frizzante', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.lecolture.com/wines
  ('Le Colture', 'Cabernet IGT Prime Gemme', 'Valdobbiadene, Veneto, Italy', 'Cabernet Sauvignon/Cabernet Franc', 'Red')  -- https://www.lecolture.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NINO FRANCO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Nino Franco', 'Rustico Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.ninofranco.it/it/vini/rustico
  ('Nino Franco', 'Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.ninofranco.it/it/vini/nino-franco
  ('Nino Franco', 'Nodi Valdobbiadene Prosecco Superiore DOCG Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.ninofranco.it/it/vini/nodi
  ('Nino Franco', 'Vigneto della Riva di San Floriano Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.ninofranco.it/it/vini/vigneto-della-riva-di-san-floriano
  ('Nino Franco', 'Grave di Stecca Vino Spumante Brut', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.ninofranco.it/it/vini/grave-di-stecca
  ('Nino Franco', 'Primo Franco Valdobbiadene Prosecco Superiore DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.ninofranco.it/it/vini/primo-franco
  ('Nino Franco', 'Valdobbiadene Superiore di Cartizze DOCG', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.ninofranco.it/it/vini/cartizze
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SORELLE BRONCA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Sorelle Bronca', 'Particella 181 Valdobbiadene Prosecco Superiore DOCG Rive di Rua Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.sorellebronca.com/categoria-prodotto/vini/
  ('Sorelle Bronca', 'Particella 232 Valdobbiadene Prosecco Superiore DOCG Rive di Farrò Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.sorellebronca.com/negozio/vini/particella-232/
  ('Sorelle Bronca', 'Particella 68 Valdobbiadene Prosecco Superiore DOCG Rive di Colbertaldo Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.sorellebronca.com/negozio/vini/particella-68/
  ('Sorelle Bronca', 'Difetto Perfetto Valdobbiadene Prosecco Superiore DOCG Sui Lieviti Brut Nature', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.sorellebronca.com/categoria-prodotto/vini/
  ('Sorelle Bronca', 'L''Est Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.sorellebronca.com/categoria-prodotto/vini/
  ('Sorelle Bronca', 'L''Ovest Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.sorellebronca.com/categoria-prodotto/vini/
  ('Sorelle Bronca', 'SerBele Colli di Conegliano DOCG Riserva', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Red'),  -- https://www.sorellebronca.com/categoria-prodotto/vini/
  ('Sorelle Bronca', 'Delico Colli di Conegliano DOCG Bianco', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'White'),  -- https://www.sorellebronca.com/categoria-prodotto/vini/
  ('Sorelle Bronca', 'Modì Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.sorellebronca.com/categoria-prodotto/vini/
  ('Sorelle Bronca', 'Prosecco Rosé DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling')  -- https://www.sorellebronca.com/categoria-prodotto/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BISOL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Bisol', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://bisol.it/bisol/en/?p=868
  ('Bisol', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://bisol.it/bisol/en/?p=868
  ('Bisol', 'I Gondolieri Brut', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://bisol.it/bisol/en/?p=868
  ('Bisol', 'Valdobbiadene Prosecco Superiore DOCG Rive di Campea', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://bisol.it/bisol/en/?p=868
  ('Bisol', 'Molera Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://bisol.it/bisol/en/?p=868
  ('Bisol', 'Crede Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://bisol.it/bisol/en/?p=868
  ('Bisol', 'Relio Valdobbiadene Prosecco Superiore DOCG Rive di Guia Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.wilsondaniels.com/winery/bisol/
  ('Bisol', 'Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://bisol.it/bisol/en/?p=868
  ('Bisol', 'Jeio Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://jeio.it/
  ('Bisol', 'Jeio Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://jeio.it/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BORTOLOMIOL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Bortolomiol', '70th Anniversary Valdobbiadene Prosecco Superiore DOCG Rive di Col San Martino Extra Brut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/70th-rive-di-col-san-martino/
  ('Bortolomiol', 'Grande Cuvée del Fondatore Motus Vitae Valdobbiadene Prosecco Superiore DOCG Rive San Pietro di Barbozza Extra Brut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/grande-cuvee-del-fondatore/
  ('Bortolomiol', 'Ius Naturae Valdobbiadene Prosecco Superiore DOCG Brut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/ius-naturae/
  ('Bortolomiol', 'Bandarossa Valdobbiadene Prosecco Superiore DOCG Extra Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/bandarossa/
  ('Bortolomiol', 'Bandarossa Special Edition Vigna di Collagù Valdobbiadene Prosecco Superiore DOCG Extra Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/bandarossa-special-edition/
  ('Bortolomiol', 'Valdobbiadene Superiore di Cartizze DOCG', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/collezioni/
  ('Bortolomiol', 'Filanda Rosé Brut Millesimato', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.bortolomiol.com/filanda-rose/
  ('Bortolomiol', 'Riserva del Governatore Extra Brut Millesimato', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.bortolomiol.com/riserva-del-governatore/
  ('Bortolomiol', 'Audax Valdobbiadene Prosecco Superiore DOCG Extra Brut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/audax/
  ('Bortolomiol', 'Prior Valdobbiadene Prosecco Superiore DOCG Brut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/prior/
  ('Bortolomiol', 'Senior Valdobbiadene Prosecco Superiore DOCG Extra Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/senior/
  ('Bortolomiol', 'Maior Valdobbiadene Prosecco Superiore DOCG Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/maior/
  ('Bortolomiol', 'Suavis Valdobbiadene Prosecco Superiore DOCG Demi Sec Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/suavis/
  ('Bortolomiol', 'Miòl Prosecco DOC Treviso Brut Millesimato', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/collezioni/
  ('Bortolomiol', 'Miòl Prosecco DOC Treviso Extra Dry Millesimato', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/collezioni/
  ('Bortolomiol', 'Miòl Écru Vino Spumante Extra Dry', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.bortolomiol.com/miol-ecru/
  ('Bortolomiol', 'Miòl Prosecco Rosé DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.bortolomiol.com/collezioni/
  ('Bortolomiol', 'Miòl Prosecco DOC Treviso Frizzante', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bortolomiol.com/collezioni/
  ('Bortolomiol', 'Il Canto Antico Prosecco DOCG Tranquillo', 'Valdobbiadene, Veneto, Italy', 'Glera', 'White')  -- https://www.bortolomiol.com/collezioni/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOTTEGA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Bottega', 'Gold Prosecco DOC Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/
  ('Bottega', 'Pink Gold Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/
  ('Bottega', 'White Prosecco DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/
  ('Bottega', 'Stardust Prosecco DOC Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/
  ('Bottega', 'Il Vino dei Poeti Prosecco DOC Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/page/2/
  ('Bottega', 'Il Vino dei Poeti Prosecco DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/page/2/
  ('Bottega', 'Il Vino dei Poeti Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/page/2/
  ('Bottega', 'Il Vino dei Poeti Organic Prosecco DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/page/2/
  ('Bottega', 'Genesi Black Prosecco DOCG Extra Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/page/2/
  ('Bottega', 'Il Vino dei Poeti Valdobbiadene Superiore di Cartizze DOCG', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/page/2/
  ('Bottega', 'Il Vino dei Poeti Conegliano Prosecco Superiore DOCG', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/page/2/
  ('Bottega', 'Il Vino dei Poeti Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/page/3/
  ('Bottega', 'Il Vino dei Poeti Prosecco DOC Frizzante', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/prosecco-sparkling-wines/page/3/
  ('Bottega', 'Gold Cru Prosecco Extra Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/premium-vintage-collection-prosecco/
  ('Bottega', 'Gold Extra Brut Prosecco', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/premium-vintage-collection-prosecco/
  ('Bottega', 'Gold Diamond Prosecco Extra Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/premium-vintage-collection-prosecco/
  ('Bottega', 'Stardust Black Prosecco Extra Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bottegaspa.com/en/the-collections/wines/premium-vintage-collection-prosecco/
  ('Bottega', 'Stardust Gold Prosecco Extra Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.bottegaspa.com/en/the-collections/wines/premium-vintage-collection-prosecco/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MIONETTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Mionetto', 'Avantgarde Collection Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/avantgarde-collection/prosecco-doc-treviso-brut
  ('Mionetto', 'Avantgarde Collection Prosecco DOC Treviso Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/avantgarde-collection/prosecco-doc-treviso-extra-dry-2
  ('Mionetto', 'Avantgarde Collection Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/avantgarde-collection/valdobbiadene-prosecco-superiore-docg-extra-dry
  ('Mionetto', 'IL Prosecco DOC', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/il-collection/il-prosecco-doc-2
  ('Mionetto', 'Luxury Collection Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/luxury-collection/cartizze-docg-dry-2
  ('Mionetto', 'Luxury Collection Prosecco DOC Treviso Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/luxury-collection/prosecco-doc-treviso-extra-dry-3
  ('Mionetto', 'Luxury Collection Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://it.mionetto.com/en/products/luxury-collection/prosecco-rose-doc-1
  ('Mionetto', 'Luxury Collection Valdobbiadene Prosecco DOCG Spago', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/luxury-collection/valdobbiadene-prosecco-docg-spago
  ('Mionetto', 'Luxury Collection Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/luxury-collection/valdobbiadene-prosecco-superiore-docg-extra-dry-en
  ('Mionetto', 'Luxury Collection Valdobbiadene Prosecco Superiore DOCG Rive di S. Stefano Millesimato Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/luxury-collection/valdobbiadene-prosecco-superiore-docg-rive-di-s-stefano-millesimato-brut
  ('Mionetto', 'Prestige Collection Prosecco DOC Treviso Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/prestige-collection/proseccco-doc-treviso-extra-dry
  ('Mionetto', 'Prestige Collection Prosecco DOC BIO Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/prestige-collection/prosecco-doc-bio-extra-dry-4
  ('Mionetto', 'Prestige Collection Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://it.mionetto.com/en/products/prestige-collection/prosecco-doc-treviso-brut-2
  ('Mionetto', 'Prestige Collection Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://it.mionetto.com/en/products/prestige-collection/prosecco-rose-doc
  ('Mionetto', 'Spago Prosecco DOC Treviso', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling')  -- https://it.mionetto.com/en/products/spago-collection/prosecco-doc-treviso-spago-1
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOTTER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Botter', 'Le Guglie Asolo Prosecco Superiore DOCG', 'Asolo, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.botter.it/tutti-i-vini/
  ('Botter', 'Le Guglie Prosecco DOC', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.botter.it/tutti-i-vini/
  ('Botter', 'Le Guglie Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.botter.it/tutti-i-vini/
  ('Botter', 'Le Guglie Prosecco DOC Frizzante', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.botter.it/tutti-i-vini/
  ('Botter', 'Le Briccole Asolo Prosecco Superiore DOCG', 'Asolo, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.botter.it/tutti-i-vini/
  ('Botter', 'Le Briccole Prosecco DOC', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.botter.it/tutti-i-vini/
  ('Botter', 'Le Briccole Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.botter.it/tutti-i-vini/
  ('Botter', 'Le Briccole Prosecco DOC Frizzante', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.botter.it/tutti-i-vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CARPENÉ MALVOLTI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Carpené Malvolti', 'Revival 1924 Conegliano Prosecco Superiore DOCG Millesimato', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.carpene-malvolti.com/la-collezione/
  ('Carpené Malvolti', '1868 Conegliano Valdobbiadene Prosecco Superiore DOCG', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.carpene-malvolti.com/la-collezione/
  ('Carpené Malvolti', 'Storico Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.carpene-malvolti.com/la-collezione/
  ('Carpené Malvolti', 'Storico Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.carpene-malvolti.com/la-collezione/
  ('Carpené Malvolti', 'Prosecco Rosé DOC Brut', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling')  -- https://www.carpene-malvolti.com/la-collezione/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DRUSIAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Drusian', 'Mete Eccelse Valdobbiadene Prosecco Superiore DOCG Sui Lieviti', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Mete Eccelse Valdobbiadene Prosecco Superiore DOCG 30 Raccolti', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Mete Eccelse Valdobbiadene Prosecco Superiore DOCG Rive di Santo Stefano', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Mete Eccelse Valdobbiadene Prosecco Superiore DOCG Rive di Bigolino', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Valdobbiadene Prosecco Superiore DOCG Millesimato Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Valdobbiadene Superiore di Cartizze DOCG', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Ruralia Valdobbiadene Prosecco DOCG Frizzante', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Gujot Prosecco DOC', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Coèr Prosecco DOC', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Prosecco DOC Treviso Colfondo', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Dru el Crù Vino Spumante', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Prosecco DOC Frizzante', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Rose Mari Vino Spumante Rosato', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://drusian.it/tutti-i-prodotti/
  ('Drusian', 'Momento Valdobbiadene DOCG Vino Tranquillo', 'Valdobbiadene, Veneto, Italy', 'Glera', 'White')  -- https://drusian.it/tutti-i-prodotti/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MEROTTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Merotto', 'Grani Rosa di Pinot Nero Vino Spumante Rosato', 'Valdobbiadene, Veneto, Italy', 'Pinot Noir', 'Sparkling'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'Castè Valdobbiadene Prosecco Superiore DOCG Extra Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'Cuvée del Fondatore Graziano Merotto Valdobbiadene Prosecco Superiore DOCG Rive di Col San Martino Brut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'Integral Valdobbiadene Prosecco Superiore DOCG Brut Integral Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'Colbelo Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'La Primavera di Barbara Valdobbiadene Prosecco Superiore DOCG Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'Bareta Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'Rosé di Pinot Nero Metodo Classico', 'Valdobbiadene, Veneto, Italy', 'Pinot Noir', 'Sparkling'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'B. Giussin Colli Trevigiani Pinot Bianco', 'Valdobbiadene, Veneto, Italy', 'Pinot Blanc', 'White'),  -- https://merotto.it/i-nostri-vini/
  ('Merotto', 'Rosso Dogato Marca Trevigiana Cabernet Sauvignon', 'Valdobbiadene, Veneto, Italy', 'Cabernet Sauvignon', 'Red')  -- https://merotto.it/i-nostri-vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ANDREOLA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Andreola', 'Mas de Fer Valdobbiadene Prosecco Superiore DOCG Rive di Soligo Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/rive-line/
  ('Andreola', 'Col del Forno Valdobbiadene Prosecco Superiore DOCG Rive di Refrontolo Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/rive-line/
  ('Andreola', '26° I° Valdobbiadene Prosecco Superiore DOCG Rive di Col San Martino Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/rive-line/
  ('Andreola', 'Vigna Ochera Valdobbiadene Prosecco Superiore DOCG Rive di Rolle Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/rive-line/
  ('Andreola', 'Nazzareno Pola Etichetta del Fondatore Dirupo Valdobbiadene Prosecco Superiore DOCG Rive di Santo Stefano Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/rive-line/
  ('Andreola', 'Aldaina al Mas Valdobbiadene Prosecco Superiore DOCG Rive di Guia Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/rive-line/
  ('Andreola', 'Marna del Bacio Valdobbiadene Prosecco Superiore DOCG Rive di San Pietro di Barbozza Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/rive-line/
  ('Andreola', 'Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/valdobbiadene-docg-line/
  ('Andreola', 'Dirupo Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/valdobbiadene-docg-line/
  ('Andreola', 'Dirupo Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/valdobbiadene-docg-line/
  ('Andreola', 'Casilir Valdobbiadene Prosecco DOCG Frizzante', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.andreola.eu/product-category/valdobbiadene-docg-line/
  ('Andreola', 'Bollé Vino Spumante Extra Dry', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.andreola.eu/product-category/bolle-line/
  ('Andreola', 'Bollé Vino Spumante Brut', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.andreola.eu/product-category/bolle-line/
  ('Andreola', 'Bollé Rosé Incrocio Manzoni 13.0.25 Vino Spumante Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Incrocio Manzoni', 'Sparkling')  -- https://www.andreola.eu/product-category/bolle-line/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SANTA MARGHERITA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Santa Margherita', 'Valdobbiadene Prosecco Superiore DOCG Brut Special Edition Inter', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/it/vini/spumanti
  ('Santa Margherita', 'Valdobbiadene Prosecco Superiore DOCG Rive di Refrontolo Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/it/vini/spumanti
  ('Santa Margherita', 'Valdobbiadene Superiore di Cartizze DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/it/vini/spumanti
  ('Santa Margherita', 'Valdobbiadene Prosecco Superiore DOCG 52 Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/it/vini/spumanti
  ('Santa Margherita', 'Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/it/vini/spumanti
  ('Santa Margherita', 'Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/it/vini/spumanti
  ('Santa Margherita', 'Prosecco DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.santamargherita.com/it/vini/spumanti
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VAL D'OCA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Val d''Oca', 'Valdobbiadene Prosecco Superiore DOCG Millesimato Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/cuvee-classiche/
  ('Val d''Oca', 'Valdobbiadene Prosecco Superiore DOCG Millesimato Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/cuvee-classiche/
  ('Val d''Oca', 'Valdobbiadene Prosecco Superiore DOCG Millesimato Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/cuvee-classiche/
  ('Val d''Oca', 'Prosecco Rosé DOC Millesimato Brut', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/cuvee-classiche/
  ('Val d''Oca', 'Valdobbiadene Prosecco Superiore DOCG Rive di Colbertaldo Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/le-rive/
  ('Val d''Oca', 'Valdobbiadene Prosecco Superiore DOCG Rive di San Pietro di Barbozza Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/le-rive/
  ('Val d''Oca', 'Valdobbiadene Prosecco Superiore DOCG Rive di Santo Stefano Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/le-rive/
  ('Val d''Oca', 'Prosecco DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/doc-collection/
  ('Val d''Oca', 'Prosecco DOC Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/doc-collection/
  ('Val d''Oca', 'Prosecco Rosé DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/doc-collection/
  ('Val d''Oca', 'Prosecco DOC Treviso Frizzante', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/doc-collection/
  ('Val d''Oca', 'Valdobbiadene Superiore di Cartizze DOCG Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/heritage/
  ('Val d''Oca', 'Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.valdoca.com/prod_cat/heritage/
  ('Val d''Oca', 'Uvaggio Storico Valdobbiadene Prosecco Superiore DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.valdoca.com/prod_cat/heritage/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MASOTTINA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Masottina', 'R.D.O. Multivintage Brut', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'R.D.O. Conegliano Valdobbiadene Prosecco Superiore DOCG Rive di Ogliano Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'R.D.O. Conegliano Valdobbiadene Prosecco Superiore DOCG Rive di Ogliano Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Contradagranda Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Contradagranda Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'ViaVenti Prosecco DOC Treviso Dosaggio Zero', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'ViaVenti Prosecco DOC Treviso Extra Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'ViaVenti Prosecco Rosé DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Calmaggiore Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Calmaggiore Prosecco DOC Treviso Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Costabella Prosecco Biologico Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Virage Vino Spumante Metodo Italiano Brut', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Virage Vino Spumante Metodo Italiano Rosé', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Collezione 96 Prosecco DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Collezione 96 Prosecco DOC Extra Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masottina.it/collezioni/
  ('Masottina', 'Collezione 96 DOC Organic Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.masottina.it/collezioni/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FOSS MARAI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Foss Marai', 'Valdobbiadene Superiore di Cartizze DOCG Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.fossmarai.com/it/10-prosecco-superiore-valdobbiadene-docg
  ('Foss Marai', 'Guia Valdobbiadene Prosecco Superiore DOCG Brut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.fossmarai.com/it/10-prosecco-superiore-valdobbiadene-docg
  ('Foss Marai', 'Nadin Valdobbiadene Prosecco Superiore DOCG Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.fossmarai.com/it/10-prosecco-superiore-valdobbiadene-docg
  ('Foss Marai', 'Strada di Guia 109 Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.fossmarai.com/it/10-prosecco-superiore-valdobbiadene-docg
  ('Foss Marai', 'Strada di Guia 109 Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.fossmarai.com/it/10-prosecco-superiore-valdobbiadene-docg
  ('Foss Marai', 'Marai de Marai 30 Limited Edition Spumante Extra Dry', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.fossmarai.com/it/11-special-spumanti
  ('Foss Marai', 'Tilio Dosaggio Zero Spumante Extra Brut', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.fossmarai.com/it/11-special-spumanti
  ('Foss Marai', 'Surfine Cuvée Spumante Brut', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.fossmarai.com/it/11-special-spumanti
  ('Foss Marai', 'Marai de Marai Spumante Extra Dry', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.fossmarai.com/it/11-special-spumanti
  ('Foss Marai', 'Marai de Marai Spumante Brut', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.fossmarai.com/it/11-special-spumanti
  ('Foss Marai', 'Marai de Marai Ultrabrut Spumante Brut Nature', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.fossmarai.com/it/11-special-spumanti
  ('Foss Marai', 'Roös Spumante Brut Rosato', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling')  -- https://www.fossmarai.com/it/11-special-spumanti
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MALIBRÀN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Malibràn', '5 Grammi Conegliano Valdobbiadene Prosecco Superiore DOCG Rive di Santa Maria di Feletto Extra Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.malibranvini.it/etichette/
  ('Malibràn', 'Ruio Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.malibranvini.it/etichette/
  ('Malibràn', 'Gorio Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.malibranvini.it/etichette/
  ('Malibràn', 'Sottoriva Colli Trevigiani IGT ColFondo Agricolo', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.malibranvini.it/etichette/
  ('Malibràn', 'Credamora Colli Trevigiani IGT ColFondo Agricolo', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.malibranvini.it/etichette/
  ('Malibràn', 'Dassiè Favrel Blanc de Blanc Pas Dosé', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.malibranvini.it/etichette/
  ('Malibràn', 'Incrocio Manzoni 13.0.25 Raboso Extra Brut Rosé', 'Conegliano Valdobbiadene, Veneto, Italy', 'Incrocio Manzoni', 'Sparkling')  -- https://www.malibranvini.it/etichette/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VILLA SANDI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Villa Sandi', 'La Rivetta Valdobbiadene Superiore di Cartizze DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'La Rivetta 120 Valdobbiadene Prosecco Superiore DOCG Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Valdobbiadene Prosecco Superiore DOCG Rive di San Pietro di Barbozza Extra Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Valdobbiadene Prosecco Superiore DOCG Millesimato Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Asolo Prosecco Superiore DOCG Brut', 'Asolo, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Nero Asolo Prosecco Superiore DOCG Extra Brut', 'Asolo, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Il Fresco Prosecco DOC Treviso Millesimato Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Valdobbiadene Prosecco DOCG Frizzante', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Il Fresco Prosecco Rosé DOC Millesimato Brut', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Il Fresco Prosecco DOC Treviso Frizzante', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Il Fresco Prosecco DOC Biologico Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Il Fresco Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.villasandi.it/it_en/villasandi.html
  ('Villa Sandi', 'Còrpore Merlot Montello e Colli Asolani DOC', 'Asolo, Veneto, Italy', 'Merlot', 'Red')  -- https://www.villasandi.it/it_en/villasandi.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CONTARINI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Contarini', 'Valdobbiadene Prosecco Superiore DOCG Millesimato Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Valdobbiadene Prosecco Superiore DOCG Millesimato Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Prosecco DOC Millesimato Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Prosecco DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Prosecco DOC Millesimato Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Prosecco Rosé DOC Millesimato Extra Dry', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'La Fornarina Valdobbiadene Prosecco Superiore DOCG Millesimato Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'La Fornarina Prosecco DOC Millesimato Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'La Fornarina Prosecco Rosé DOC Millesimato Extra Dry', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Collinobili Valdobbiadene Prosecco Superiore DOCG Millesimato Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Collinobili Prosecco DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Collinobili Prosecco Rosé DOC Millesimato Extra Dry', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://contarinivini.it/prodotti/
  ('Contarini', 'Collinobili Prosecco DOC Frizzante', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling')  -- https://contarinivini.it/prodotti/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LE VIGNE DI ALICE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Le Vigne di Alice', 'Alice Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
  ('Le Vigne di Alice', 'Doro Nature Valdobbiadene Prosecco Superiore DOCG Millesimato Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
  ('Le Vigne di Alice', 'Col Albi Rive di Collalbrigo', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
  ('Le Vigne di Alice', 'Signature Valdobbiadene Superiore DOCG Metodo Classico Millesimato', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
  ('Le Vigne di Alice', 'A Fondo Glera Col Fondo Frizzante', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
  ('Le Vigne di Alice', 'M Fondo Marzemino Col Fondo', 'Conegliano Valdobbiadene, Veneto, Italy', 'Marzemino', 'Sparkling'),  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
  ('Le Vigne di Alice', 'Tajad Spumante Brut', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
  ('Le Vigne di Alice', 'Assia Rosé Brut Nature', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
  ('Le Vigne di Alice', 'P.S. Integrale Brut Metodo Ancestrale', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
  ('Le Vigne di Alice', 'Angelo Pas Dosé Metodo Classico', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling')  -- https://www.levignedialice.it/valdobbiadene-vini-prosecco
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CA' DEI ZAGO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Ca'' dei Zago', 'Valdobbiadene Prosecco Rifermentato in Bottiglia', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.cadeizago.it/it/vino
  ('Ca'' dei Zago', 'Mariarosa', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.cadeizago.it/it/vino
  ('Ca'' dei Zago', 'Marino', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.cadeizago.it/it/vino
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BELLISSIMA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Bellissima', 'Prosecco DOC Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.bellissimaprosecco.com/all-wines.html
  ('Bellissima', 'Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling')  -- https://www.bellissimaprosecco.com/all-wines.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BELE CASEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Bele Casel', 'ColFondo Agricolo', 'Asolo, Veneto, Italy', null, 'Sparkling'),  -- https://www.belecasel.com/
  ('Bele Casel', 'Asolo Prosecco Superiore DOCG Vecchie Uve', 'Asolo, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.belecasel.com/
  ('Bele Casel', 'Asolo Prosecco Superiore DOCG Extra Brut', 'Asolo, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.belecasel.com/
  ('Bele Casel', 'Asolo Prosecco Superiore DOCG Extra Dry', 'Asolo, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.belecasel.com/
  ('Bele Casel', 'Caranto', 'Asolo, Veneto, Italy', null, 'Sparkling')  -- https://www.belecasel.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CANEVEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Canevel', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/canevel-spumanti/
  ('Canevel', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/canevel-spumanti/
  ('Canevel', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/canevel-spumanti/
  ('Canevel', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/canevel-spumanti/
  ('Canevel', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Sui Lieviti', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/canevel-spumanti/
  ('Canevel', 'Valdobbiadene Superiore di Cartizze DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/canevel-spumanti/
  ('Canevel', 'Setàge Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.prosecco.it/en/scheda-cantina/canevel-spumanti/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CANELLA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Canella', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Millesimato Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/canella/
  ('Canella', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.prosecco.it/en/scheda-cantina/canella/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CASA COSTE PIANE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Casa Coste Piane', 'Valdobbiadene Prosecco DOCG Frizzante Naturalmente', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.casacostepiane.it/
  ('Casa Coste Piane', 'Prosecco DOC Treviso Frizzante Naturalmente', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.casacostepiane.it/
  ('Casa Coste Piane', 'Brichet Colli Trevigiani IGT Frizzante', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.casacostepiane.it/
  ('Casa Coste Piane', 'Bianco Frizzante', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.casacostepiane.it/
  ('Casa Coste Piane', 'Gleris Colli Trevigiani IGT', 'Valdobbiadene, Veneto, Italy', 'Glera', 'White')  -- https://www.casacostepiane.it/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SILVANO FOLLADOR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Silvano Follador', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/follador/
  ('Silvano Follador', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/follador/
  ('Silvano Follador', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.prosecco.it/en/scheda-cantina/follador/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ASTORIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Astoria', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/astoria-vini/
  ('Astoria', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/astoria-vini/
  ('Astoria', 'Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/astoria-vini/
  ('Astoria', 'Corderìe Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/selezione/astoria
  ('Astoria', 'Cuvée Tenuta Val de Brun Valdobbiadene Prosecco Superiore DOCG Extra Dry Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/selezione/astoria
  ('Astoria', 'Casa Vittorino Valdobbiadene Prosecco Superiore DOCG Rive di Refrontolo Brut Millesimato', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/selezione/astoria
  ('Astoria', 'Fanò Asolo Prosecco Superiore DOCG Extra Brut', 'Asolo, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/selezione/astoria
  ('Astoria', 'Tìemo Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/selezione/astoria
  ('Astoria', 'Galie Prosecco DOC Treviso Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/selezione/astoria
  ('Astoria', 'Velére Prosecco Rosé DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.vino.com/en/selezione/astoria
  ('Astoria', 'Anniversario Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry Millesimato', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.vino.com/en/selezione/astoria
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BORGO MOLINO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Borgo Molino', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/borgo-molino/
  ('Borgo Molino', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/borgo-molino/
  ('Borgo Molino', 'Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.prosecco.it/en/scheda-cantina/borgo-molino/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MASCHIO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Maschio', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/cantine-maschio/
  ('Maschio', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/cantine-maschio/
  ('Maschio', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.prosecco.it/en/scheda-cantina/cantine-maschio/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ZARDETTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Zardetto', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/zardetto/
  ('Zardetto', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/zardetto/
  ('Zardetto', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Brut', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/zardetto/
  ('Zardetto', 'Conegliano Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.prosecco.it/en/scheda-cantina/zardetto/
  ('Zardetto', 'Conegliano Valdobbiadene Prosecco DOCG Rifermentato in Bottiglia', 'Conegliano Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.prosecco.it/en/scheda-cantina/zardetto/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VALDO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Valdo', 'Marca Oro Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://valdo.com/
  ('Valdo', 'Cuvée 1926 Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://valdo.com/
  ('Valdo', 'Cuvée di Boj Valdobbiadene Prosecco Superiore DOCG Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://valdo.com/
  ('Valdo', 'Aquarius Rosé Sparkling Rosé Wine Brut', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://valdo.com/
  ('Valdo', 'Cuvée Viviana Valdobbiadene Superiore di Cartizze DOCG Dry', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://valdo.com/
  ('Valdo', 'Vigna Pradase Valdobbiadene Prosecco Superiore DOCG Metodo Classico Brut', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://valdo.com/
  ('Valdo', 'Cuvée I Magredi Prosecco DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://valdo.com/
  ('Valdo', 'Elevantum Rosé Prosecco Rosé DOC Brut', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling')  -- https://valdo.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ZONIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_prosecco.sql)'
from (values
  ('Zonin', 'Cuvée 1821 Prosecco DOC Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/dettaglio/prosecco-doc-cuvee-1821-zonin.html
  ('Zonin', 'Prosecco DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/dettaglio/prosecco-doc-extra-dry-zonin.html
  ('Zonin', 'Collezione Leone Prosecco DOC Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/dettaglio/prosecco-brut-doc-collezione-leone-zonin.html
  ('Zonin', 'Collezione Leone Prosecco Rosé DOC Extra Dry', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.vino.com/en/dettaglio/prosecco-extra-dry-rose-doc-collezione-leone-zonin-2021.html
  ('Zonin', '1821 Prosecco Rosé DOC Brut', 'Prosecco, Veneto, Italy', 'Glera/Pinot Noir', 'Sparkling'),  -- https://www.vino.com/en/dettaglio/prosecco-brut-rose-doc-1821-zonin.html
  ('Zonin', 'Prosecco DOC Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.vino.com/en/dettaglio/prosecco-doc-zonin---1821.html
  ('Zonin', 'Prestige 1821 Valdobbiadene Prosecco Superiore DOCG', 'Valdobbiadene, Veneto, Italy', 'Glera', 'Sparkling')  -- https://www.vino.com/en/dettaglio/valdobbiadene-prosecco-superiore-prestige-1821-zonin-1821.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
