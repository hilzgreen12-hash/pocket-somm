-- Producer ranges round 2: widely distributed Italian producers.
-- Every row confirmed on the real page cited in its trailing comment (fetched 2026-11-26).
-- Run in the Supabase SQL editor; committing this file does not apply it.

-- ---- TOMMASI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Tommasi', 'Amarone della Valpolicella Classico', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://vintus.com/producers/tommasi/
  ('Tommasi', 'Ripasso Valpolicella Classico Superiore', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://vintus.com/producers/tommasi/
  ('Tommasi', 'Rafaèl Valpolicella Classico Superiore', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://vintus.com/producers/tommasi/
  ('Tommasi', 'De Buris Amarone della Valpolicella Classico Riserva', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://vintus.com/producers/tommasi/
  ('Tommasi', 'De Buris Valpolicella Classico Superiore', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://vintus.com/producers/tommasi/
  ('Tommasi', 'Ca'' Florian Amarone della Valpolicella Classico Riserva', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://vintus.com/producers/tommasi/
  ('Tommasi', 'Le Volpare Soave Classico', 'Soave, Veneto, Italy', null, 'White'),  -- https://vintus.com/producers/tommasi/
  ('Tommasi', 'Lugana', 'Lugana, Veneto, Italy', null, 'White'),  -- https://vintus.com/producers/tommasi/
  ('Tommasi', 'Le Rosse Pinot Grigio', 'Veneto, Italy', 'Pinot Grigio', 'White'),  -- https://vintus.com/producers/tommasi/
  ('Tommasi', 'Filodora Prosecco', 'Prosecco, Veneto, Italy', null, 'Sparkling')  -- https://vintus.com/producers/tommasi/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BERTANI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Bertani', 'Amarone della Valpolicella Classico', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Catullo Valpolicella Ripasso Classico Superiore', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Amarone della Valpolicella Valpantena', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Valpolicella Ripasso Valpantena', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Valpolicella Valpantena', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Recioto della Valpolicella Valpantena', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Sereole Soave Classico', 'Soave, Veneto, Italy', null, 'White'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Lugana Le Quaiare', 'Lugana, Veneto, Italy', null, 'White'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Le Miniere di Novare Valpolicella Classico', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Ognisanti di Novare Valpolicella Classico Superiore', 'Valpolicella, Veneto, Italy', null, 'Red'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Soave Vintage', 'Soave, Veneto, Italy', null, 'White'),  -- https://www.bertani.net/en/wines/
  ('Bertani', 'Secco Vintage Rosso Verona', 'Veneto, Italy', null, 'Red')  -- https://www.bertani.net/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PLANETA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Planeta', 'Didacus Cabernet Franc', 'Menfi, Sicily, Italy', 'Cabernet Franc', 'Red'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Didacus Chardonnay', 'Menfi, Sicily, Italy', 'Chardonnay', 'White'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Chardonnay', 'Menfi, Sicily, Italy', 'Chardonnay', 'White'),  -- https://planeta.it/en/wines/
  ('Planeta', 'La Segreta Bianco', 'Menfi, Sicily, Italy', null, 'White'),  -- https://planeta.it/en/wines/
  ('Planeta', 'La Segreta Grillo', 'Menfi, Sicily, Italy', 'Grillo', 'White'),  -- https://planeta.it/en/wines/
  ('Planeta', 'La Segreta Rosso', 'Menfi, Sicily, Italy', null, 'Red'),  -- https://planeta.it/en/wines/
  ('Planeta', 'La Segreta Nero d''Avola', 'Menfi, Sicily, Italy', 'Nero d''Avola', 'Red'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Rosé', 'Menfi, Sicily, Italy', null, 'Rosé'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Cerasuolo di Vittoria', 'Vittoria, Sicily, Italy', null, 'Red'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Frappato', 'Vittoria, Sicily, Italy', 'Frappato', 'Red'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Santa Cecilia', 'Noto, Sicily, Italy', null, 'Red'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Passito di Noto', 'Noto, Sicily, Italy', null, 'White'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Eruzione 1614 Carricante', 'Etna, Sicily, Italy', 'Carricante', 'White'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Eruzione 1614 Nerello Mascalese', 'Etna, Sicily, Italy', 'Nerello Mascalese', 'Red'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Eruzione 1614 Riesling', 'Etna, Sicily, Italy', 'Riesling', 'White'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Eruzione 1614 Pinot Nero', 'Etna, Sicily, Italy', 'Pinot Nero', 'Red'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Etna Bianco Contrada Taccione', 'Etna, Sicily, Italy', null, 'White'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Etna Rosso Contrada Feudo di Mezzo', 'Etna, Sicily, Italy', null, 'Red'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Brut Metodo Classico', 'Etna, Sicily, Italy', null, 'Sparkling'),  -- https://planeta.it/en/wines/
  ('Planeta', 'Nocera', 'Capo Milazzo, Sicily, Italy', 'Nocera', 'Red')  -- https://planeta.it/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DONNAFUGATA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Donnafugata', 'Anthilia', 'Sicilia, Sicily, Italy', null, 'White'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'SurSur Grillo', 'Sicilia, Sicily, Italy', 'Grillo', 'White'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Lighea Zibibbo', 'Sicilia, Sicily, Italy', 'Zibibbo', 'White'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'La Fuga Chardonnay', 'Contessa Entellina, Sicily, Italy', 'Chardonnay', 'White'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Chiarandà Chardonnay', 'Contessa Entellina, Sicily, Italy', 'Chardonnay', 'White'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Lumera', 'Sicilia, Sicily, Italy', null, 'Rosé'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Sedara', 'Sicilia, Sicily, Italy', null, 'Red'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Sherazade Nero d''Avola', 'Sicilia, Sicily, Italy', 'Nero d''Avola', 'Red'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Bell''Assai Frappato di Vittoria', 'Vittoria, Sicily, Italy', 'Frappato', 'Red'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Floramundi Cerasuolo di Vittoria', 'Vittoria, Sicily, Italy', null, 'Red'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Contesa dei Venti Nero d''Avola', 'Vittoria, Sicily, Italy', 'Nero d''Avola', 'Red'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Angheli', 'Sicilia, Sicily, Italy', null, 'Red'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Sul Vulcano Etna Rosso', 'Etna, Sicily, Italy', null, 'Red'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Sul Vulcano Etna Bianco', 'Etna, Sicily, Italy', null, 'White'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Sul Vulcano Etna Rosato', 'Etna, Sicily, Italy', null, 'Rosé'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Kabir Moscato di Pantelleria', 'Pantelleria, Sicily, Italy', 'Moscato', 'White'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Ben Ryé Passito di Pantelleria', 'Pantelleria, Sicily, Italy', null, 'White'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Mille e una Notte', 'Sicilia, Sicily, Italy', null, 'Red'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Fragore Etna Rosso Montelaguardia', 'Etna, Sicily, Italy', null, 'Red'),  -- https://www.donnafugata.it/en/the-wines/
  ('Donnafugata', 'Brut', 'Sicilia, Sicily, Italy', null, 'Sparkling')  -- https://www.donnafugata.it/en/the-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FEUDI DI SAN GREGORIO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Feudi di San Gregorio', 'Greco di Tufo', 'Greco di Tufo, Campania, Italy', 'Greco', 'White'),  -- https://www.vino.com/en/selezione/feudi-di-san-gregorio
  ('Feudi di San Gregorio', 'Fiano di Avellino', 'Fiano di Avellino, Campania, Italy', 'Fiano', 'White'),  -- https://www.vino.com/en/selezione/feudi-di-san-gregorio
  ('Feudi di San Gregorio', 'Falanghina del Sannio', 'Sannio, Campania, Italy', 'Falanghina', 'White'),  -- https://www.vino.com/en/selezione/feudi-di-san-gregorio
  ('Feudi di San Gregorio', 'Taurasi', 'Taurasi, Campania, Italy', null, 'Red'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Rubrato Irpinia Aglianico', 'Irpinia, Campania, Italy', 'Aglianico', 'Red'),  -- https://www.vino.com/en/selezione/feudi-di-san-gregorio
  ('Feudi di San Gregorio', 'Cutizzi Greco di Tufo Riserva', 'Greco di Tufo, Campania, Italy', 'Greco', 'White'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Nassano Greco di Tufo', 'Greco di Tufo, Campania, Italy', 'Greco', 'White'),  -- https://www.vino.com/en/selezione/feudi-di-san-gregorio
  ('Feudi di San Gregorio', 'Pietracalda Fiano di Avellino Riserva', 'Fiano di Avellino, Campania, Italy', 'Fiano', 'White'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Campanaro Fiano di Avellino Riserva', 'Fiano di Avellino, Campania, Italy', 'Fiano', 'White'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Serrocielo Falanghina del Sannio', 'Sannio, Campania, Italy', 'Falanghina', 'White'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Dal Re Irpinia Aglianico', 'Irpinia, Campania, Italy', 'Aglianico', 'Red'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Serpico Irpinia Aglianico', 'Irpinia, Campania, Italy', 'Aglianico', 'Red'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Selve di Luoti Taurasi', 'Taurasi, Campania, Italy', null, 'Red'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Piano di Montevergine Taurasi Riserva', 'Taurasi, Campania, Italy', null, 'Red'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Lacryma Christi del Vesuvio Bianco', 'Vesuvio, Campania, Italy', null, 'White'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Lacryma Christi del Vesuvio Rosso', 'Vesuvio, Campania, Italy', null, 'Red'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'San Greg Campania Rosato', 'Campania, Italy', null, 'Rosé'),  -- https://feudi.com/en/wines/
  ('Feudi di San Gregorio', 'Privilegio Irpinia Fiano Passito', 'Irpinia, Campania, Italy', 'Fiano', 'White'),  -- https://www.vino.com/en/selezione/feudi-di-san-gregorio
  ('Feudi di San Gregorio', 'Pàtrimo Campania Merlot', 'Campania, Italy', 'Merlot', 'Red')  -- https://www.vino.com/en/selezione/feudi-di-san-gregorio
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MIONETTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Mionetto', 'Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Prosecco DOC Treviso Extra Dry', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Prosecco DOC Bio Extra Dry', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Il Prosecco DOC', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Prosecco DOC Treviso Spago', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Valdobbiadene Prosecco Superiore DOCG Rive di S. Stefano Millesimato Brut', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Cartizze DOCG Dry', 'Cartizze, Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Sergio', 'Veneto, Italy', null, 'Sparkling'),  -- https://it.mionetto.com/en
  ('Mionetto', 'Sergio Rosé', 'Veneto, Italy', null, 'Sparkling')  -- https://it.mionetto.com/en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LA MARCA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('La Marca', 'Prosecco DOC', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.lamarcaprosecco.com/prosecco
  ('La Marca', 'Prosecco Rosé DOC', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.lamarcaprosecco.com/prosecco
  ('La Marca', 'Prosecco DOC Demi Sec', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.lamarcaprosecco.com/prosecco
  ('La Marca', 'Luminore Conegliano Valdobbiadene Prosecco Superiore DOCG', 'Conegliano Valdobbiadene, Veneto, Italy', null, 'Sparkling')  -- https://www.lamarcaprosecco.com/prosecco
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOTTEGA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Bottega', 'Il Vino dei Poeti Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.vino.com/en/selezione/bottega-spumanti
  ('Bottega', 'Il Vino dei Poeti Prosecco DOC Brut Rosé', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.vino.com/en/selezione/bottega-spumanti
  ('Bottega', 'Il Vino dei Poeti Valdobbiadene Prosecco Superiore DOCG Extra Dry', 'Valdobbiadene, Veneto, Italy', null, 'Sparkling'),  -- https://www.vino.com/en/selezione/bottega-spumanti
  ('Bottega', 'Gold Prosecco DOC Treviso Brut', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.vino.com/en/selezione/bottega-spumanti
  ('Bottega', 'Rose Gold Brut', 'Veneto, Italy', null, 'Sparkling'),  -- https://www.vino.com/en/selezione/bottega-spumanti
  ('Bottega', 'Petalo Il Vino dell''Amore Moscato', 'Veneto, Italy', 'Moscato', 'Sparkling'),  -- https://www.vino.com/en/selezione/bottega-spumanti
  ('Bottega', 'Petalo Il Vino dell''Amore Manzoni Moscato Rosé', 'Veneto, Italy', null, 'Sparkling'),  -- https://www.vino.com/en/selezione/bottega-spumanti
  ('Bottega', 'Stefano Extra Dry Millesimato', 'Veneto, Italy', null, 'Sparkling'),  -- https://www.vino.com/en/selezione/bottega-spumanti
  ('Bottega', 'Stefano Pas Dosé Blanc de Blancs', 'Veneto, Italy', null, 'Sparkling')  -- https://www.vino.com/en/selezione/bottega-spumanti
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FONTANAFREDDA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Fontanafredda', 'Barolo del Comune di Serralunga d''Alba', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.fontanafredda.it/en/wines/barolo/
  ('Fontanafredda', 'Barolo del Comune di Serralunga d''Alba Renaissance', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.fontanafredda.it/en/wines/barolo/
  ('Fontanafredda', 'Barolo Riserva', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.fontanafredda.it/en/wines/barolo/
  ('Fontanafredda', 'Barolo Vigna La Rosa', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.fontanafredda.it/en/wines/barolo/
  ('Fontanafredda', 'Barolo Vigna La Villa', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.fontanafredda.it/en/wines/barolo/
  ('Fontanafredda', 'Barolo Vigna La Delizia', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.fontanafredda.it/en/wines/barolo/
  ('Fontanafredda', 'Barolo Proprietà in Fontanafredda', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.fontanafredda.it/en/wines/barolo/
  ('Fontanafredda', 'Barbaresco', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.fontanafredda.it/en/wines/vini_classici/
  ('Fontanafredda', 'Barbaresco Coste Rubin', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.fontanafredda.it/en/wines/vini_classici/
  ('Fontanafredda', 'Langhe Nebbiolo Ebbio', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.fontanafredda.it/en/wines/vini_classici/
  ('Fontanafredda', 'Barbera d''Alba Raimonda', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.fontanafredda.it/en/wines/vini_classici/
  ('Fontanafredda', 'Barbera d''Alba Superiore Papagena', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.fontanafredda.it/en/wines/vinifini/
  ('Fontanafredda', 'Roero Arneis Pradalupo', 'Roero, Piedmont, Italy', 'Arneis', 'White'),  -- https://www.fontanafredda.it/en/wines/vini_classici/
  ('Fontanafredda', 'Gavi del Comune di Gavi', 'Gavi, Piedmont, Italy', null, 'White'),  -- https://www.fontanafredda.it/en/wines/vini_classici/
  ('Fontanafredda', 'Moscato d''Asti Moncucco', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling'),  -- https://www.fontanafredda.it/en/wines/vinifini/
  ('Fontanafredda', 'Langhe Rosato Solerose', 'Langhe, Piedmont, Italy', null, 'Rosé'),  -- https://www.fontanafredda.it/en/wines/vinifini/
  ('Fontanafredda', 'Langhe Chardonnay Ampelio', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.fontanafredda.it/en/wines/vinifini/
  ('Fontanafredda', 'Briccotondo Piemonte Barbera', 'Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.fontanafredda.it/en/wines/vini_classici/
  ('Fontanafredda', 'Alta Langa Contessa Rosa Rosé Brut Riserva', 'Alta Langa, Piedmont, Italy', null, 'Sparkling'),  -- https://www.fontanafredda.it/en/wines/alta-langa-classic-method/
  ('Fontanafredda', 'Brut Millesimato', 'Piedmont, Italy', null, 'Sparkling')  -- https://www.fontanafredda.it/en/wines/alta-langa-classic-method/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PIO CESARE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Pio Cesare', 'Barolo Pio', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Barbaresco Pio', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Gavi', 'Gavi, Piedmont, Italy', null, 'White'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Moscato d''Asti', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Barolo Mosconi', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Barolo Ornato', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Barbaresco Il Bricco', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Barbera d''Alba Superiore Fides Vigna Mosconi', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Piodilei Langhe Chardonnay', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Derthona Colli Tortonesi Timorasso Riserva', 'Colli Tortonesi, Piedmont, Italy', 'Timorasso', 'White'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Blanc Langhe Sauvignon', 'Langhe, Piedmont, Italy', 'Sauvignon', 'White'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Il Nebbio Langhe', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Oltre Langhe', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'L''Altro Langhe Chardonnay', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.piocesare.it/en/
  ('Pio Cesare', 'Rosy Langhe Rosato', 'Langhe, Piedmont, Italy', null, 'Rosé')  -- https://www.piocesare.it/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MICHELE CHIARLO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Michele Chiarlo', 'Barolo Cerequio', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barolo Cannubi', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barolo Tortoniano', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barolo Riserva Tortoniano', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barolo Palás', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barbaresco Asili', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barbaresco Faset', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barbaresco Reyna', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barbaresco Palás', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Nizza Riserva La Court', 'Nizza, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Nizza Montemareto', 'Nizza, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Nizza Cipressi', 'Nizza, Piedmont, Italy', null, 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barbera d''Asti Le Orme', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Barbera d''Asti Palás', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Langhe Nebbiolo Il Principe', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Gavi del Comune di Gavi Rovereto', 'Gavi, Piedmont, Italy', null, 'White'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Gavi Fornaci', 'Gavi, Piedmont, Italy', null, 'White'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Gavi Le Marne', 'Gavi, Piedmont, Italy', null, 'White'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Roero Arneis Le Madri', 'Roero, Piedmont, Italy', 'Arneis', 'White'),  -- https://www.michelechiarlo.it/en/wines/
  ('Michele Chiarlo', 'Moscato d''Asti Nivole', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling')  -- https://www.michelechiarlo.it/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAVIT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Cavit', 'Pinot Grigio', 'Delle Venezie, Northeast Italy, Italy', 'Pinot Grigio', 'White'),  -- https://www.cavit.com/wines
  ('Cavit', 'Pinot Noir', 'Delle Venezie, Northeast Italy, Italy', 'Pinot Noir', 'Red'),  -- https://www.cavit.com/wines
  ('Cavit', 'Cabernet Sauvignon', 'Delle Venezie, Northeast Italy, Italy', 'Cabernet Sauvignon', 'Red'),  -- https://www.cavit.com/wines
  ('Cavit', 'Merlot', 'Delle Venezie, Northeast Italy, Italy', 'Merlot', 'Red'),  -- https://www.cavit.com/wines
  ('Cavit', 'Moscato', 'Delle Venezie, Northeast Italy, Italy', 'Moscato', 'White'),  -- https://www.cavit.com/wines
  ('Cavit', 'Riesling', 'Delle Venezie, Northeast Italy, Italy', 'Riesling', 'White'),  -- https://www.cavit.com/wines
  ('Cavit', 'Sauvignon Blanc', 'Delle Venezie, Northeast Italy, Italy', 'Sauvignon Blanc', 'White'),  -- https://www.cavit.com/wines
  ('Cavit', 'Oak Zero Chardonnay', 'Delle Venezie, Northeast Italy, Italy', 'Chardonnay', 'White'),  -- https://www.cavit.com/wines
  ('Cavit', 'Rosé', 'Delle Venezie, Northeast Italy, Italy', null, 'Rosé'),  -- https://www.cavit.com/wines
  ('Cavit', 'Select Red Blend', 'Delle Venezie, Northeast Italy, Italy', null, 'Red'),  -- https://www.cavit.com/wines
  ('Cavit', 'Sweet Red', 'Delle Venezie, Northeast Italy, Italy', null, 'Red'),  -- https://www.cavit.com/wines
  ('Cavit', 'Prosecco', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.cavit.com/wines
  ('Cavit', 'Prosecco Rosé', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.cavit.com/wines
  ('Cavit', 'Cloud90 Pinot Grigio', 'Delle Venezie, Northeast Italy, Italy', 'Pinot Grigio', 'White'),  -- https://www.cavit.com/wines
  ('Cavit', 'Cloud90 Chardonnay', 'Delle Venezie, Northeast Italy, Italy', 'Chardonnay', 'White'),  -- https://www.cavit.com/wines
  ('Cavit', 'Cloud90 Sauvignon Blanc', 'Delle Venezie, Northeast Italy, Italy', 'Sauvignon Blanc', 'White'),  -- https://www.cavit.com/wines
  ('Cavit', 'Cloud90 Sparkling Brut', 'Delle Venezie, Northeast Italy, Italy', null, 'Sparkling')  -- https://www.cavit.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MEZZACORONA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Mezzacorona', 'Pinot Grigio', 'Trentino, Trentino-Alto Adige, Italy', 'Pinot Grigio', 'White'),  -- https://www.mezzacorona.it/en-gb/vines-and-terroir/pinot-grigio/
  ('Mezzacorona', 'Chardonnay', 'Trentino, Trentino-Alto Adige, Italy', 'Chardonnay', 'White'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Müller Thurgau', 'Trentino, Trentino-Alto Adige, Italy', 'Müller Thurgau', 'White'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Gewürztraminer', 'Trentino, Trentino-Alto Adige, Italy', 'Gewürztraminer', 'White'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Moscato Giallo', 'Trentino, Trentino-Alto Adige, Italy', 'Moscato Giallo', 'White'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Teroldego Rotaliano', 'Teroldego Rotaliano, Trentino-Alto Adige, Italy', 'Teroldego', 'Red'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Marzemino', 'Trentino, Trentino-Alto Adige, Italy', 'Marzemino', 'Red'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Cabernet Sauvignon', 'Trentino, Trentino-Alto Adige, Italy', 'Cabernet Sauvignon', 'Red'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Merlot', 'Trentino, Trentino-Alto Adige, Italy', 'Merlot', 'Red'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Pinot Nero', 'Trentino, Trentino-Alto Adige, Italy', 'Pinot Nero', 'Red'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Lagrein', 'Trentino, Trentino-Alto Adige, Italy', 'Lagrein', 'Red'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Lagrein Rosato', 'Trentino, Trentino-Alto Adige, Italy', 'Lagrein', 'Rosé'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Teroldego Rotaliano Rosato', 'Teroldego Rotaliano, Trentino-Alto Adige, Italy', 'Teroldego', 'Rosé'),  -- https://www.mezzacorona.it/it/vini-trentini/classici/
  ('Mezzacorona', 'Pinot Grigio Riserva', 'Trentino, Trentino-Alto Adige, Italy', 'Pinot Grigio', 'White'),  -- https://www.mezzacorona.it/en-gb/vines-and-terroir/pinot-grigio/
  ('Mezzacorona', 'Teroldego Rotaliano Superiore Riserva', 'Teroldego Rotaliano, Trentino-Alto Adige, Italy', 'Teroldego', 'Red'),  -- https://www.mezzacorona.it/en-gb/vines-and-terroir/teroldego/
  ('Mezzacorona', 'Nos Teroldego Rotaliano Superiore Riserva', 'Teroldego Rotaliano, Trentino-Alto Adige, Italy', 'Teroldego', 'Red'),  -- https://www.mezzacorona.it/en-gb/vines-and-terroir/teroldego/
  ('Mezzacorona', 'Musivum Teroldego Rotaliano Riserva', 'Teroldego Rotaliano, Trentino-Alto Adige, Italy', 'Teroldego', 'Red'),  -- https://www.mezzacorona.it/en-gb/vines-and-terroir/teroldego/
  ('Mezzacorona', 'Musivum Pinot Grigio Trentino Superiore', 'Trentino, Trentino-Alto Adige, Italy', 'Pinot Grigio', 'White'),  -- https://www.mezzacorona.it/en-gb/vines-and-terroir/pinot-grigio/
  ('Mezzacorona', 'Castel Firmian Pinot Grigio Riserva', 'Trentino, Trentino-Alto Adige, Italy', 'Pinot Grigio', 'White'),  -- https://www.mezzacorona.it/en-gb/vines-and-terroir/pinot-grigio/
  ('Mezzacorona', 'Castel Firmian Teroldego Rotaliano Superiore Riserva', 'Teroldego Rotaliano, Trentino-Alto Adige, Italy', 'Teroldego', 'Red')  -- https://www.mezzacorona.it/en-gb/vines-and-terroir/teroldego/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CECCHI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Cecchi', 'Storia di Famiglia Chianti Classico', 'Chianti Classico, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Riserva di Famiglia Chianti Classico Riserva', 'Chianti Classico, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Valore di Famiglia Chianti Classico Gran Selezione', 'Chianti Classico, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Coevo', 'Toscana, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Chianti', 'Chianti, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Chianti Riserva', 'Chianti, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Natìo Chianti', 'Chianti, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Governo all''Uso Toscano Chianti', 'Chianti, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Spargolo', 'Toscana, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Rosso di Montalcino', 'Montalcino, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Brunello di Montalcino', 'Montalcino, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Vino Nobile di Montepulciano', 'Montepulciano, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Caprifoglio Viognier', 'Toscana, Tuscany, Italy', 'Viognier', 'White'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Calipte Rosato', 'Toscana, Tuscany, Italy', 'Sangiovese', 'Rosé'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Lobelia', 'Toscana, Tuscany, Italy', null, 'White'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'Treno del Mare Vermentino', 'Toscana, Tuscany, Italy', 'Vermentino', 'White'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'La Mora Morellino di Scansano', 'Morellino di Scansano, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'La Mora Vermentino', 'Toscana, Tuscany, Italy', 'Vermentino', 'White'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'La Mora Maremma Toscana Rosso', 'Maremma Toscana, Tuscany, Italy', null, 'Red'),  -- https://www.cecchi.net/en/wines/
  ('Cecchi', 'La Campana Montefalco Sagrantino', 'Montefalco, Umbria, Italy', 'Sagrantino', 'Red')  -- https://www.cecchi.net/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TENUTA SAN GUIDO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Tenuta San Guido', 'Sassicaia', 'Bolgheri Sassicaia, Tuscany, Italy', null, 'Red'),  -- https://www.tenutasanguido.com/en/wines
  ('Tenuta San Guido', 'Guidalberto', 'Toscana, Tuscany, Italy', null, 'Red'),  -- https://www.tenutasanguido.com/en/wines
  ('Tenuta San Guido', 'Le Difese', 'Toscana, Tuscany, Italy', null, 'Red')  -- https://www.tenutasanguido.com/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TENUTA DELL'ORNELLAIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Tenuta dell''Ornellaia', 'Ornellaia', 'Bolgheri, Tuscany, Italy', null, 'Red'),  -- https://www.ornellaia.com/en/wines/
  ('Tenuta dell''Ornellaia', 'Le Serre Nuove dell''Ornellaia', 'Bolgheri, Tuscany, Italy', null, 'Red'),  -- https://www.ornellaia.com/en/wines/
  ('Tenuta dell''Ornellaia', 'Le Volte dell''Ornellaia', 'Toscana, Tuscany, Italy', null, 'Red'),  -- https://www.ornellaia.com/en/wines/
  ('Tenuta dell''Ornellaia', 'Ornellaia Bianco', 'Bolgheri, Tuscany, Italy', null, 'White'),  -- https://www.ornellaia.com/en/wines/
  ('Tenuta dell''Ornellaia', 'Poggio alle Gazze dell''Ornellaia', 'Toscana, Tuscany, Italy', null, 'White'),  -- https://www.ornellaia.com/en/wines/
  ('Tenuta dell''Ornellaia', 'Ornus dell''Ornellaia', 'Toscana, Tuscany, Italy', null, 'White'),  -- https://www.ornellaia.com/en/wines/
  ('Tenuta dell''Ornellaia', 'Variazioni in Rosso dell''Ornellaia', 'Toscana, Tuscany, Italy', null, 'Red'),  -- https://www.ornellaia.com/en/wines/
  ('Tenuta dell''Ornellaia', 'Masseto', 'Toscana, Tuscany, Italy', null, 'Red'),  -- https://www.masseto.com/en/
  ('Tenuta dell''Ornellaia', 'Massetino', 'Toscana, Tuscany, Italy', null, 'Red')  -- https://www.masseto.com/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PRUNOTTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Prunotto', 'Barolo Riserva Bussia Vigna Colonnello', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barolo Bussia', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barolo Cerretta', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barolo Mosconi', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barolo Serra', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barolo', 'Barolo, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barbaresco Bric Turot', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barbaresco Secondine', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barbaresco', 'Barbaresco, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Langhe Nebbiolo Occhetti', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barbera d''Alba Pian Romualdo', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Dolcetto d''Alba Mosesco', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Nizza Riserva Costamiòle', 'Nizza, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Nizza Bansella', 'Nizza, Piedmont, Italy', null, 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Barbera d''Asti Fiulot', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Bricco Colma Piemonte Albarossa', 'Piedmont, Italy', 'Albarossa', 'Red'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Arveja Langhe Arneis', 'Langhe, Piedmont, Italy', 'Arneis', 'White'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Granadié Langhe Rosato', 'Langhe, Piedmont, Italy', null, 'Rosé'),  -- https://www.prunotto.it/en/wines/
  ('Prunotto', 'Moscato d''Asti', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling')  -- https://www.prunotto.it/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TORMARESCA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Tormaresca', 'Bocca di Lupo Castel del Monte Aglianico', 'Castel del Monte, Puglia, Italy', 'Aglianico', 'Red'),  -- https://www.vino.com/en/selezione/tormaresca
  ('Tormaresca', 'Pietrabianca Castel del Monte Chardonnay', 'Castel del Monte, Puglia, Italy', 'Chardonnay', 'White'),  -- https://www.vino.com/en/selezione/tormaresca
  ('Tormaresca', 'Masseria Maìme Negroamaro', 'Salento, Puglia, Italy', 'Negroamaro', 'Red'),  -- https://www.tormaresca.it/en/wines/
  ('Tormaresca', 'Torcicoda Primitivo', 'Salento, Puglia, Italy', 'Primitivo', 'Red'),  -- https://www.tormaresca.it/en/wines/
  ('Tormaresca', 'Carrubo Primitivo di Manduria', 'Primitivo di Manduria, Puglia, Italy', 'Primitivo', 'Red'),  -- https://www.tormaresca.it/en/wines/
  ('Tormaresca', 'Fichimori', 'Salento, Puglia, Italy', null, 'Red'),  -- https://www.tormaresca.it/en/wines/
  ('Tormaresca', 'Roycello Fiano', 'Salento, Puglia, Italy', 'Fiano', 'White'),  -- https://www.tormaresca.it/en/wines/
  ('Tormaresca', 'Calafuria Rosato', 'Salento, Puglia, Italy', 'Negroamaro', 'Rosé'),  -- https://www.vino.com/en/selezione/tormaresca
  ('Tormaresca', 'Furia di Calafuria', 'Salento, Puglia, Italy', null, 'Rosé'),  -- https://www.vino.com/en/selezione/tormaresca
  ('Tormaresca', 'Neprica Primitivo', 'Puglia, Italy', 'Primitivo', 'Red'),  -- https://www.tormaresca.it/en/wines/
  ('Tormaresca', 'Neprica Negroamaro', 'Puglia, Italy', 'Negroamaro', 'Red'),  -- https://www.tormaresca.it/en/wines/
  ('Tormaresca', 'Neprica Rosé', 'Puglia, Italy', null, 'Rosé'),  -- https://www.tormaresca.it/en/wines/
  ('Tormaresca', 'Chardonnay', 'Puglia, Italy', 'Chardonnay', 'White')  -- https://www.tormaresca.it/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SANTA CRISTINA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r2_italy.sql)'
from (values
  ('Santa Cristina', 'Rosso', 'Toscana, Tuscany, Italy', null, 'Red'),  -- https://www.santacristina.wine/en/wines/
  ('Santa Cristina', 'Bianco', 'Italy', null, 'White'),  -- https://www.santacristina.wine/en/wines/
  ('Santa Cristina', 'Giardino Rosé', 'Italy', null, 'Rosé'),  -- https://www.santacristina.wine/en/wines/
  ('Santa Cristina', 'Chianti Superiore', 'Chianti, Tuscany, Italy', null, 'Red'),  -- https://www.vino.com/en/dettaglio/chianti-superiore-docg-santa-cristina-marchesi-antinori-2024.html
  ('Santa Cristina', 'Pinot Grigio delle Venezie', 'Delle Venezie, Northeast Italy, Italy', 'Pinot Grigio', 'White')  -- https://www.winespectator.com/wine/wine-detail/id/1330830/name/santa-cristina-pinot-grigio-delle-venezie-2025/guest
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
