-- Producer ranges: Italy & Spain (widely distributed houses).
-- Every row confirmed on a real page 2026-11-26; source URL on each row.
-- Run in the Supabase SQL editor (a repo commit is not an applied seed).

-- ---- MARCHESI ANTINORI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Marchesi Antinori', 'Tignanello', 'Toscana, Tuscany, Italy', 'Sangiovese/Cabernet Sauvignon/Cabernet Franc', 'Red'),  -- https://www.antinori.it/en/vino/tignanello-en/
  ('Marchesi Antinori', 'Solaia', 'Toscana, Tuscany, Italy', 'Cabernet Sauvignon/Cabernet Franc/Sangiovese', 'Red'),  -- https://www.antinori.it/en/vino/solaia-en/
  ('Marchesi Antinori', 'Marchese Antinori Chianti Classico Riserva Tenuta Tignanello', 'Chianti Classico, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.antinori.it/en/vino/marchese-antinori-en/
  ('Marchesi Antinori', 'Badia a Passignano Chianti Classico Gran Selezione', 'Chianti Classico, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.antinori.it/en/vino/badia-a-passignano-en/
  ('Marchesi Antinori', 'Pèppoli Chianti Classico', 'Chianti Classico, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.antinori.it/en/vino/peppoli-en/
  ('Marchesi Antinori', 'Villa Antinori Chianti Classico Riserva', 'Chianti Classico, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.antinori.it/en/vino/villa-antinori-chianti-classico-riserva-en/
  ('Marchesi Antinori', 'Villa Antinori Rosso', 'Toscana, Tuscany, Italy', 'Merlot/Sangiovese/Cabernet', 'Red'),  -- https://www.antinori.it/en/vino/villa-antinori-rosso-en/
  ('Marchesi Antinori', 'Villa Antinori Bianco', 'Toscana, Tuscany, Italy', null, 'White'),  -- https://www.antinori.it/en/vino/villa-antinori-bianco-en/
  ('Marchesi Antinori', 'Villa Antinori Pinot Bianco', 'Toscana, Tuscany, Italy', null, 'White'),  -- https://www.antinori.it/en/vino/villa-antinori-pinot-bianco-en/
  ('Marchesi Antinori', 'Guado al Tasso', 'Bolgheri, Tuscany, Italy', 'Cabernet Sauvignon/Cabernet Franc/Merlot', 'Red'),  -- https://www.antinori.it/en/vino/guado-al-tasso-en/
  ('Marchesi Antinori', 'Matarocchio', 'Bolgheri, Tuscany, Italy', null, 'Red'),  -- https://www.antinori.it/en/vino/matarocchio-en/
  ('Marchesi Antinori', 'Il Bruciato', 'Bolgheri, Tuscany, Italy', null, 'Red'),  -- https://www.antinori.it/en/vino/il-bruciato-en/
  ('Marchesi Antinori', 'Cont''Ugo', 'Bolgheri, Tuscany, Italy', null, 'Red'),  -- https://www.antinori.it/en/vino/contugo-en/
  ('Marchesi Antinori', 'Scalabrone Bolgheri Rosato', 'Bolgheri, Tuscany, Italy', null, 'Rosé'),  -- https://www.antinori.it/en/vino/scalabrone-en/
  ('Marchesi Antinori', 'Guado al Tasso Vermentino Bolgheri', 'Bolgheri, Tuscany, Italy', null, 'White'),  -- https://www.antinori.it/en/vino/vermentino-en/
  ('Marchesi Antinori', 'Cervaro della Sala', 'Umbria, Italy', 'Chardonnay/Grechetto', 'White'),  -- https://www.antinori.it/en/vino/cervaro-della-sala-en/
  ('Marchesi Antinori', 'San Giovanni della Sala Orvieto Classico Superiore', 'Orvieto Classico, Umbria, Italy', null, 'White'),  -- https://www.antinori.it/en/vino/san-giovanni-della-sala-en/
  ('Marchesi Antinori', 'Bramìto della Sala', 'Umbria, Italy', null, 'White'),  -- https://www.antinori.it/en/vino/bramito-en/
  ('Marchesi Antinori', 'Conte della Vipera', 'Umbria, Italy', null, 'White'),  -- https://www.antinori.it/en/vino/conte-della-vipera-en/
  ('Marchesi Antinori', 'Pinot Nero della Sala', 'Umbria, Italy', null, 'Red'),  -- https://www.antinori.it/en/vino/pinot-nero-en/
  ('Marchesi Antinori', 'Muffato della Sala', 'Umbria, Italy', null, 'White'),  -- https://www.antinori.it/en/vino/muffato-della-sala-en/
  ('Marchesi Antinori', 'Pian delle Vigne Brunello di Montalcino', 'Brunello di Montalcino, Tuscany, Italy', null, 'Red'),  -- https://www.antinori.it/en/vino/pian-delle-vigne-brunello-en/
  ('Marchesi Antinori', 'Pian delle Vigne Vignaferrovia Brunello di Montalcino Riserva', 'Brunello di Montalcino, Tuscany, Italy', null, 'Red'),  -- https://www.antinori.it/en/vino/pian-delle-vigne-vignaferrovia-en/
  ('Marchesi Antinori', 'Pian delle Vigne Rosso di Montalcino', 'Rosso di Montalcino, Tuscany, Italy', null, 'Red'),  -- https://www.antinori.it/en/vino/rosso-di-montalcino-en/
  ('Marchesi Antinori', 'La Braccesca Vino Nobile di Montepulciano', 'Vino Nobile di Montepulciano, Tuscany, Italy', null, 'Red'),  -- https://www.antinori.it/en/vino/la-braccesca-nobile-di-montepulciano-en/
  ('Marchesi Antinori', 'Bramasole', 'Cortona, Tuscany, Italy', 'Syrah', 'Red'),  -- https://www.antinori.it/en/vino/bramasole-en/
  ('Marchesi Antinori', 'Le Mortelle Botrosecco', 'Maremma Toscana, Tuscany, Italy', null, 'Red'),  -- https://www.antinori.it/en/vino/botrosecco-en/
  ('Marchesi Antinori', 'Le Mortelle Vivia', 'Maremma Toscana, Tuscany, Italy', null, 'White'),  -- https://www.antinori.it/en/vino/vivia-en/
  ('Marchesi Antinori', 'Montenisa Cuvée Royale Franciacorta', 'Franciacorta, Lombardy, Italy', null, 'Sparkling'),  -- https://www.antinori.it/en/vino/cuvee-royale-en/
  ('Marchesi Antinori', 'Montenisa Blanc de Blancs Franciacorta', 'Franciacorta, Lombardy, Italy', null, 'Sparkling')  -- https://www.antinori.it/en/vino/blanc-de-blancs-en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARCHESI FRESCOBALDI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Marchesi Frescobaldi', 'Nipozzano Chianti Rufina Riserva', 'Chianti Rufina, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/nipozzano-riserva
  ('Marchesi Frescobaldi', 'Nipozzano Vecchie Viti Chianti Rufina Riserva', 'Chianti Rufina, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/vecchie-viti
  ('Marchesi Frescobaldi', 'Montesodi Chianti Rufina Riserva', 'Chianti Rufina, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/montesodi
  ('Marchesi Frescobaldi', 'Mormoreto', 'Toscana, Tuscany, Italy', 'Cabernet/Petit Verdot/Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/mormoreto
  ('Marchesi Frescobaldi', 'CastelGiocondo Brunello di Montalcino', 'Brunello di Montalcino, Tuscany, Italy', null, 'Red'),  -- https://www.frescobaldi.com/en/wines/castelgiocondo
  ('Marchesi Frescobaldi', 'Ripe al Convento Brunello di Montalcino Riserva', 'Brunello di Montalcino, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/ripe-al-convento
  ('Marchesi Frescobaldi', 'Campo ai Sassi Rosso di Montalcino', 'Rosso di Montalcino, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/campo-ai-sassi
  ('Marchesi Frescobaldi', 'Lamaione', 'Toscana, Tuscany, Italy', 'Merlot', 'Red'),  -- https://www.frescobaldi.com/en/wines/lamaione
  ('Marchesi Frescobaldi', 'Giramonte', 'Toscana, Tuscany, Italy', 'Merlot/Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/giramonte
  ('Marchesi Frescobaldi', 'Tenuta Frescobaldi di Castiglioni', 'Toscana, Tuscany, Italy', 'Cabernet Sauvignon/Merlot/Cabernet Franc/Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/tenuta-frescobaldi
  ('Marchesi Frescobaldi', 'Castiglioni Chianti', 'Chianti, Tuscany, Italy', 'Sangiovese/Merlot', 'Red'),  -- https://www.frescobaldi.com/en/wines/castiglioni-chianti
  ('Marchesi Frescobaldi', 'Rèmole Rosso', 'Toscana, Tuscany, Italy', 'Sangiovese/Cabernet Sauvignon', 'Red'),  -- https://www.frescobaldi.com/en/wines/remole
  ('Marchesi Frescobaldi', 'Rèmole Bianco', 'Toscana, Tuscany, Italy', 'Vermentino/Trebbiano', 'White'),  -- https://www.frescobaldi.com/en/wines/remole-bianco
  ('Marchesi Frescobaldi', 'Rèmole Rosé', 'Toscana, Tuscany, Italy', 'Sangiovese', 'Rosé'),  -- https://www.frescobaldi.com/en/wines/remole-rose
  ('Marchesi Frescobaldi', 'Pomino Bianco', 'Pomino, Tuscany, Italy', 'Chardonnay/Pinot Bianco', 'White'),  -- https://www.frescobaldi.com/en/wines/pomino
  ('Marchesi Frescobaldi', 'Pomino Pinot Nero', 'Pomino, Tuscany, Italy', 'Pinot Nero', 'Red'),  -- https://www.frescobaldi.com/en/wines/pomino-pinot-nero
  ('Marchesi Frescobaldi', 'Benefizio Pomino Bianco Riserva', 'Pomino, Tuscany, Italy', 'Chardonnay', 'White'),  -- https://www.frescobaldi.com/en/wines/benefizio-riserva
  ('Marchesi Frescobaldi', 'Leonia Pomino Brut', 'Pomino, Tuscany, Italy', 'Chardonnay/Pinot Noir', 'Sparkling'),  -- https://www.frescobaldi.com/en/wines/leonia-pomino-brut
  ('Marchesi Frescobaldi', 'Leonia Pomino Rosé', 'Pomino, Tuscany, Italy', 'Pinot Noir', 'Sparkling'),  -- https://www.frescobaldi.com/en/wines/leonia-pomino-rose
  ('Marchesi Frescobaldi', 'Tenuta Perano Chianti Classico', 'Chianti Classico, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/tenuta-perano
  ('Marchesi Frescobaldi', 'Tenuta Perano Chianti Classico Riserva', 'Chianti Classico, Tuscany, Italy', 'Sangiovese/Merlot', 'Red'),  -- https://www.frescobaldi.com/en/wines/tenuta-perano-riserva
  ('Marchesi Frescobaldi', 'Rialzi Chianti Classico Gran Selezione', 'Chianti Classico, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/rialzi
  ('Marchesi Frescobaldi', 'Tenuta Calimaia Vino Nobile di Montepulciano', 'Vino Nobile di Montepulciano, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/tenuta-calimaia
  ('Marchesi Frescobaldi', 'Tenuta Calimaia Vino Nobile di Montepulciano Riserva', 'Vino Nobile di Montepulciano, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.frescobaldi.com/en/wines/tenuta-calimaia-riserva
  ('Marchesi Frescobaldi', 'Alìe', 'Toscana, Tuscany, Italy', 'Syrah/Vermentino', 'Rosé'),  -- https://www.frescobaldi.com/en/wines/alie
  ('Marchesi Frescobaldi', 'Aurea Gran Rosé', 'Toscana, Tuscany, Italy', 'Syrah/Vermentino', 'Rosé'),  -- https://www.frescobaldi.com/en/wines/aurea-gran-rose
  ('Marchesi Frescobaldi', 'Terre More Maremma Toscana Cabernet', 'Maremma Toscana, Tuscany, Italy', 'Cabernet Sauvignon/Merlot/Syrah', 'Red'),  -- https://www.frescobaldi.com/en/wines/terre-more
  ('Marchesi Frescobaldi', 'Massovivo Vermentino', 'Toscana, Tuscany, Italy', 'Vermentino', 'White'),  -- https://www.frescobaldi.com/en/wines/massovivo
  ('Marchesi Frescobaldi', 'Santa Maria Morellino di Scansano', 'Morellino di Scansano, Tuscany, Italy', 'Sangiovese/Cabernet Sauvignon', 'Red'),  -- https://www.frescobaldi.com/en/wines/santa-maria
  ('Marchesi Frescobaldi', 'Gorgona Bianco', 'Costa Toscana, Tuscany, Italy', 'Vermentino/Ansonica', 'White')  -- https://www.frescobaldi.com/en/wines/gorgona
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RUFFINO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Ruffino', 'Riserva Ducale Chianti Classico Riserva', 'Chianti Classico, Tuscany, Italy', null, 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/riserva-ducale-2020-075/
  ('Ruffino', 'Riserva Ducale Oro Chianti Classico Gran Selezione', 'Chianti Classico, Tuscany, Italy', null, 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/riserva-ducale-oro-2019-075/
  ('Ruffino', 'Romitorio di Santedame Chianti Classico Gran Selezione', 'Chianti Classico, Tuscany, Italy', 'Sangiovese/Colorino', 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/romitorio-di-santedame/
  ('Ruffino', 'Santedame Chianti Classico', 'Chianti Classico, Tuscany, Italy', null, 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/santedame/
  ('Ruffino', 'Aziano Chianti Classico', 'Chianti Classico, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/aziano/
  ('Ruffino', 'Modus', 'Toscana, Tuscany, Italy', null, 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/modus-2020-075/
  ('Ruffino', 'Modus Primo', 'Toscana, Tuscany, Italy', 'Merlot/Sangiovese/Cabernet Sauvignon', 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/modus-primo/
  ('Ruffino', 'Alauda', 'Toscana, Tuscany, Italy', null, 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/alauda/
  ('Ruffino', 'A.D. 1085', 'Toscana, Tuscany, Italy', 'Colorino', 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/a-d-1085/
  ('Ruffino', 'Greppone Mazzi Brunello di Montalcino', 'Brunello di Montalcino, Tuscany, Italy', 'Sangiovese Grosso', 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/greppone-mazzi/
  ('Ruffino', 'Garzaia Bolgheri Superiore', 'Bolgheri, Tuscany, Italy', null, 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/garzaia/
  ('Ruffino', 'Garzaia Bianco', 'Toscana, Tuscany, Italy', 'Fiano/Viognier', 'White'),  -- https://wineclub.ruffino.it/en/shop/white-rose-wines/garzaia/
  ('Ruffino', 'Rosso di Marte Bolgheri', 'Bolgheri, Tuscany, Italy', null, 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/rosso-di-marte-bolgheri/
  ('Ruffino', 'Rosso di Marte Morellino di Scansano', 'Morellino di Scansano, Tuscany, Italy', null, 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/rosso-di-marte/
  ('Ruffino', 'La Solatìa Toscana Rosso', 'Toscana, Tuscany, Italy', 'Petit Verdot/Syrah', 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/la-solatia-toscana-igt/
  ('Ruffino', 'La Solatìa Chianti Superiore', 'Chianti Superiore, Tuscany, Italy', null, 'Red'),  -- https://wineclub.ruffino.it/en/shop/red-wines/la-solatia-chianti-superiore/
  ('Ruffino', 'La Solatìa Pinot Grigio', 'Toscana, Tuscany, Italy', 'Pinot Grigio', 'White'),  -- https://wineclub.ruffino.it/en/shop/white-rose-wines/la-solatia/
  ('Ruffino', 'Aqua di Venus Rosé', 'Toscana, Tuscany, Italy', null, 'Rosé'),  -- https://wineclub.ruffino.it/en/shop/white-rose-wines/aqua-di-venus-rosato-2022-075/
  ('Ruffino', 'Aqua di Venus Bianco', 'Toscana, Tuscany, Italy', 'Sangiovese/Vermentino/Chardonnay', 'White'),  -- https://wineclub.ruffino.it/en/shop/white-rose-wines/aqua-di-venus-white/
  ('Ruffino', 'Prosecco', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://wineclub.ruffino.it/en/shop/sparkling-wines/prosecco-doc/
  ('Ruffino', 'Libaio Chardonnay', 'Toscana, Tuscany, Italy', 'Chardonnay', 'White'),  -- https://www.vino.com/en/selezione/ruffino
  ('Ruffino', 'Chianti', 'Chianti, Tuscany, Italy', null, 'Red')  -- https://www.vino.com/en/selezione/ruffino
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALLEGRINI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Allegrini', 'Amarone della Valpolicella Classico', 'Amarone della Valpolicella Classico, Veneto, Italy', 'Corvina Veronese/Corvinone/Rondinella/Oseleta', 'Red'),  -- https://allegrini.it/en/wines/amarone-della-valpolicella-classico-allegrini/
  ('Allegrini', 'Fieramonte Amarone della Valpolicella Classico Riserva', 'Amarone della Valpolicella Classico, Veneto, Italy', 'Corvina Veronese/Corvinone/Rondinella/Oseleta', 'Red'),  -- https://allegrini.it/en/wines/amarone-fieramonte/
  ('Allegrini', 'La Poja', 'Veronese, Veneto, Italy', 'Corvina Veronese', 'Red'),  -- https://allegrini.it/en/wines/allegrini-la-poja/
  ('Allegrini', 'La Grola Valpolicella Classico Superiore', 'Valpolicella Classico Superiore, Veneto, Italy', 'Corvina Veronese/Corvinone/Rondinella', 'Red'),  -- https://allegrini.it/en/wines/la-grola-allegrini/
  ('Allegrini', 'Palazzo della Torre', 'Veronese, Veneto, Italy', 'Corvina Veronese/Corvinone/Rondinella', 'Red'),  -- https://allegrini.it/en/wines/palazzo-della-torre/
  ('Allegrini', 'Valpolicella Classico', 'Valpolicella Classico, Veneto, Italy', 'Corvina Veronese/Rondinella', 'Red'),  -- https://allegrini.it/en/wines/valpolicella-classico-doc-allegrini/
  ('Allegrini', 'Valpolicella Classico Superiore', 'Valpolicella Classico Superiore, Veneto, Italy', 'Corvina Veronese/Rondinella', 'Red'),  -- https://allegrini.it/en/wines/valpolicella-superiore/
  ('Allegrini', 'Valpolicella', 'Valpolicella, Veneto, Italy', 'Corvina Veronese/Rondinella', 'Red'),  -- https://allegrini.it/en/wines/valpolicella-doc/
  ('Allegrini', 'Giovanni Allegrini Recioto della Valpolicella Classico', 'Recioto della Valpolicella Classico, Veneto, Italy', 'Corvina Veronese/Corvinone/Rondinella/Oseleta', 'Red'),  -- https://allegrini.it/en/wines/recioto-valpolicella-giovanni-allegrini/
  ('Allegrini', 'Soave', 'Soave, Veneto, Italy', 'Garganega', 'White'),  -- https://allegrini.it/en/wines/soave-allegrini/
  ('Allegrini', 'Lugana Oasi Mantellina', 'Lugana, Lombardy, Italy', 'Turbiana/Cortese', 'White')  -- https://allegrini.it/en/wines/lugana-oasi-mantellina/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CASTELLO BANFI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Castello Banfi', 'Brunello di Montalcino', 'Brunello di Montalcino, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.banfi.it/eng/castello_banfi_brunello-di-montalcino/
  ('Castello Banfi', 'Brunello di Montalcino Poggio alle Mura', 'Brunello di Montalcino, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.banfi.it/eng/poggio-alle-mura-brunello-montalcino/
  ('Castello Banfi', 'Brunello di Montalcino Poggio alle Mura Riserva', 'Brunello di Montalcino, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.banfi.it/eng/poggio-alle-mura-riserva/
  ('Castello Banfi', 'Brunello di Montalcino Riserva Poggio all''Oro', 'Brunello di Montalcino, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.banfi.it/eng/poggio-all-oro/
  ('Castello Banfi', 'Brunello di Montalcino Vigna Marrucheto', 'Brunello di Montalcino, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.banfi.it/eng/vigna-marrucheto/
  ('Castello Banfi', 'Rosso di Montalcino', 'Rosso di Montalcino, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.banfi.it/eng/rosso-di-montalcino/
  ('Castello Banfi', 'Rosso di Montalcino Poggio alle Mura', 'Rosso di Montalcino, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.banfi.it/eng/poggio-alle-mura_rosso_di_montalcino/
  ('Castello Banfi', 'SummuS', 'Toscana, Tuscany, Italy', 'Cabernet Sauvignon/Merlot/Petit Verdot/Sangiovese', 'Red'),  -- https://www.banfi.it/eng/summus/
  ('Castello Banfi', 'ExcelsuS', 'Toscana, Tuscany, Italy', 'Merlot/Cabernet Sauvignon', 'Red'),  -- https://www.banfi.it/eng/excelsus/
  ('Castello Banfi', 'Cum Laude', 'Toscana, Tuscany, Italy', 'Merlot/Cabernet Sauvignon/Petit Verdot/Syrah', 'Red'),  -- https://www.banfi.it/eng/cum-laude/
  ('Castello Banfi', 'Belnero', 'Toscana, Tuscany, Italy', 'Cabernet Sauvignon/Merlot/Cabernet Franc', 'Red'),  -- https://www.banfi.it/eng/belnero/
  ('Castello Banfi', 'Fontanelle Chardonnay', 'Toscana, Tuscany, Italy', 'Chardonnay', 'White'),  -- https://www.banfi.it/eng/fontanelle/
  ('Castello Banfi', 'San Angelo Pinot Grigio', 'Toscana, Tuscany, Italy', 'Pinot Grigio', 'White'),  -- https://www.banfi.it/eng/san-angelo/
  ('Castello Banfi', 'Florus Moscadello di Montalcino', 'Moscadello di Montalcino, Tuscany, Italy', 'Moscato Bianco', 'White'),  -- https://www.banfi.it/eng/florus/
  ('Castello Banfi', 'Centine Rosso', 'Toscana, Tuscany, Italy', 'Sangiovese/Cabernet Sauvignon/Merlot', 'Red'),  -- https://www.banfi.it/eng/centine-rosso-varietale-2/
  ('Castello Banfi', 'Centine Bianco', 'Toscana, Tuscany, Italy', 'Chardonnay/Vermentino', 'White'),  -- https://www.banfi.it/eng/centine-bianco/
  ('Castello Banfi', 'Centine Rosé', 'Toscana, Tuscany, Italy', 'Sangiovese/Merlot', 'Rosé'),  -- https://www.banfi.it/eng/centine-rose/
  ('Castello Banfi', 'Col di Sasso', 'Toscana, Tuscany, Italy', 'Cabernet Sauvignon/Sangiovese', 'Red'),  -- https://www.banfi.it/eng/col-di-sasso/
  ('Castello Banfi', 'Le Rime', 'Toscana, Tuscany, Italy', 'Chardonnay/Pinot Grigio', 'White'),  -- https://www.banfi.it/eng/le-rime/
  ('Castello Banfi', 'Stilnovo', 'Toscana, Tuscany, Italy', 'Sangiovese', 'Red'),  -- https://www.banfi.it/eng/stilnovo/
  ('Castello Banfi', 'La Pettegola Vermentino', 'Toscana, Tuscany, Italy', 'Vermentino', 'White'),  -- https://www.banfi.it/eng/la-pettegola/
  ('Castello Banfi', 'La Pettegola Rosé', 'Toscana, Tuscany, Italy', null, 'Rosé'),  -- https://www.banfi.it/eng/la-pettegola-rose/
  ('Castello Banfi', 'Aska Bolgheri Rosso', 'Bolgheri, Tuscany, Italy', 'Cabernet Sauvignon/Cabernet Franc', 'Red'),  -- https://www.banfi.it/eng/aska/
  ('Castello Banfi', 'Dèinos Bolgheri Superiore', 'Bolgheri, Tuscany, Italy', 'Cabernet Sauvignon', 'Red'),  -- https://www.banfi.it/eng/deinos/
  ('Castello Banfi', 'Chianti Classico', 'Chianti Classico, Tuscany, Italy', null, 'Red'),  -- https://www.banfi.it/eng/chianti-classico/
  ('Castello Banfi', 'Chianti Classico Riserva', 'Chianti Classico, Tuscany, Italy', null, 'Red'),  -- https://www.banfi.it/eng/chianti-classico-riserva/
  ('Castello Banfi', 'Fonte alla Selva Chianti Classico Gran Selezione', 'Chianti Classico, Tuscany, Italy', null, 'Red'),  -- https://www.banfi.it/eng/fonte-alla-selva-gran-selezione/
  ('Castello Banfi', 'Chianti Superiore', 'Chianti Superiore, Tuscany, Italy', null, 'Red'),  -- https://www.banfi.it/eng/chianti-superiore/
  ('Castello Banfi', 'Chianti', 'Chianti, Tuscany, Italy', null, 'Red'),  -- https://www.banfi.it/eng/chianti/
  ('Castello Banfi', 'Rosa Regale Brachetto d''Acqui', 'Brachetto d''Acqui, Piedmont, Italy', 'Brachetto', 'Sparkling'),  -- https://www.banfi.it/eng/rosa-regale_brachetto/
  ('Castello Banfi', 'Principessa Gavia Gavi', 'Gavi, Piedmont, Italy', 'Cortese', 'White'),  -- https://www.banfi.it/eng/principessa-gavia/
  ('Castello Banfi', 'Cuvée Aurora Rosé Alta Langa', 'Alta Langa, Piedmont, Italy', 'Pinot Noir', 'Sparkling'),  -- https://www.banfi.it/eng/cuvee-aurora-rose/
  ('Castello Banfi', 'Cuvée Aurora Blanc de Blancs Alta Langa', 'Alta Langa, Piedmont, Italy', 'Chardonnay', 'Sparkling')  -- https://www.banfi.it/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MASI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Masi', 'Costasera Amarone della Valpolicella Classico', 'Amarone della Valpolicella Classico, Veneto, Italy', 'Corvina/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/costasera-amarone-valpolicella-classico-docg/
  ('Masi', 'Riserva Costasera Amarone della Valpolicella Classico Riserva', 'Amarone della Valpolicella Classico, Veneto, Italy', 'Corvina/Rondinella/Oseleta/Molinara', 'Red'),  -- https://www.masi.it/en/wines/riserva-costasera-amarone-valpolicella-classico-docg-riserva/
  ('Masi', 'Nectar Costasera Amarone della Valpolicella Classico', 'Amarone della Valpolicella Classico, Veneto, Italy', 'Corvina/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/nectar-costasera-amarone-valpolicella-classico-docg/
  ('Masi', 'Mazzano Amarone della Valpolicella Classico', 'Amarone della Valpolicella Classico, Veneto, Italy', 'Corvina/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/cantina-privata-boscaini-mazzano-amarone-valpolicella-classico-docg/
  ('Masi', 'Campolongo di Torbe Amarone della Valpolicella Classico', 'Amarone della Valpolicella Classico, Veneto, Italy', 'Corvina/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/cantina-privata-boscaini-campolongo-di-torbe-amarone-valpolicella-classico-docg/
  ('Masi', 'Angelorum Recioto della Valpolicella Classico', 'Recioto della Valpolicella Classico, Veneto, Italy', 'Corvina/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/angelorum-recioto-valpolicella-classico-docg/
  ('Masi', 'Mezzanella Amandorlato Recioto della Valpolicella Classico', 'Recioto della Valpolicella Classico, Veneto, Italy', 'Corvina/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/cantina-privata-boscaini-mezzanella-amandorlato-recioto-valpolicella-classico-docg/
  ('Masi', 'Campofiorin', 'Rosso del Veronese, Veneto, Italy', 'Corvina/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/campofiorin-rosso-verona-igt-red-wine/
  ('Masi', 'Brolo Campofiorin', 'Rosso del Veronese, Veneto, Italy', 'Corvina/Rondinella/Oseleta', 'Red'),  -- https://www.masi.it/en/wines/brolo-campofiorin-rosso-verona-igt-red-wine/
  ('Masi', 'Nectar Campofiorin', 'Rosso del Veronese, Veneto, Italy', 'Corvina/Corvinone/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/nectar-campofiorin-rosso-verona-igt-red-wine/
  ('Masi', 'Osar', 'Rosso del Veronese, Veneto, Italy', 'Oseleta', 'Red'),  -- https://www.masi.it/en/wines/cantina-privata-boscaini-osar-rosso-verona-igt-red-wine/
  ('Masi', 'Toar Valpolicella Classico Superiore', 'Valpolicella Classico Superiore, Veneto, Italy', 'Corvina/Rondinella/Oseleta', 'Red'),  -- https://www.masi.it/en/wines/toar-valpolicella-classico-superiore-doc-red-wine/
  ('Masi', 'Bonacosta Valpolicella Classico', 'Valpolicella Classico, Veneto, Italy', 'Corvina/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/bonacosta-valpolicella-classico-doc-red-wine/
  ('Masi', 'Frescaripa Bardolino Classico', 'Bardolino Classico, Veneto, Italy', 'Corvina/Rondinella/Molinara', 'Red'),  -- https://www.masi.it/en/wines/frescaripa-bardolino-classico-doc-red-wine/
  ('Masi', 'Fresco di Masi Rosso', 'Rosso del Veronese, Veneto, Italy', 'Corvina/Merlot', 'Red'),  -- https://www.masi.it/en/wines/fresco-di-masi-rosso-verona-igt-red-wine/
  ('Masi', 'Fresco di Masi Bianco', 'Bianco del Veronese, Veneto, Italy', 'Garganega/Chardonnay/Pinot Grigio', 'White'),  -- https://www.masi.it/en/wines/fresco-di-masi-bianco-verona-igt-white-wine/
  ('Masi', 'Masianco Pinot Grigio delle Venezie', 'Delle Venezie, Veneto, Italy', 'Pinot Grigio/Verduzzo', 'White'),  -- https://www.masi.it/en/wines/masianco-pinot-grigio-venezie-doc-white-wine/
  ('Masi', 'Levarìe Soave Classico', 'Soave Classico, Veneto, Italy', 'Garganega/Trebbiano di Soave', 'White'),  -- https://www.masi.it/en/wines/levarie-soave-classico-doc-white-wine/
  ('Masi', 'Colbaraca Soave Classico Superiore', 'Soave Classico Superiore, Veneto, Italy', 'Garganega', 'White'),  -- https://www.masi.it/en/wines/colbaraca-soave-classico-superiore-docg-white-wine-organic-wine/
  ('Masi', 'Lunatio di Masi Lugana', 'Lugana, Veneto, Italy', 'Turbiana', 'White'),  -- https://www.masi.it/en/wines/lunatio-di-masi-lugana-doc-white-wine/
  ('Masi', 'Rosa dei Masi Rosato', 'Trevenezie, Veneto, Italy', 'Merlot', 'Rosé'),  -- https://www.masi.it/en/wines/rosa-dei-masi-rose-wine-trevenezie-igt/
  ('Masi', 'Pinot Noir del Re', 'Provincia di Pavia, Lombardy, Italy', 'Pinot Nero', 'Red'),  -- https://www.masi.it/en/wines/pinot-noir-del-re-pinot-nero-pavia-igt/
  ('Masi', 'Moxxé del Re Oltrepò Pavese Metodo Classico Pinot Nero Brut', 'Oltrepò Pavese Metodo Classico, Lombardy, Italy', 'Pinot Nero', 'Sparkling'),  -- https://www.masi.it/en/wines/moxxe-del-re-oltrepo-pavese-docg-metodo-classico-pinot-nero-brut/
  ('Masi', 'Moxxé Pinot Grigio e Verduzzo Spumante Brut', 'Italy', 'Pinot Grigio/Verduzzo', 'Sparkling'),  -- https://www.masi.it/en/wines/moxxe-pinot-grigio-verduzzo-spumante-brut/
  ('Masi', 'Prosecco Brut', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.masi.it/en/wines/masi-prosecco-brut-canada/
  ('Masi', 'Modello Masi Rosso Trevenezie', 'Trevenezie, Veneto, Italy', 'Merlot/Refosco/Raboso Veronese', 'Red'),  -- https://www.masi.it/en/wines/modello-masi-trevenezie-rosso-igt-red-wine/
  ('Masi', 'Modello Masi Bianco Trevenezie', 'Trevenezie, Veneto, Italy', 'Chardonnay/Pinot Grigio', 'White'),  -- https://www.masi.it/en/wines/modello-masi-trevenezie-bianco-igt-white-wine/
  ('Masi', 'Modello Masi Corvina Verona', 'Verona, Veneto, Italy', 'Corvina', 'Red'),  -- https://www.masi.it/en/wines/modello-masi-corvina-verona-igt-red-wine/
  ('Masi', 'Modello Masi Pinot Grigio delle Venezie', 'Delle Venezie, Veneto, Italy', 'Pinot Grigio', 'White'),  -- https://www.masi.it/en/wines/modello-masi-pinot-grigio-delle-venezie-doc-white-wine/
  ('Masi', 'Modello Masi Merlot Trevenezie', 'Trevenezie, Veneto, Italy', 'Merlot', 'Red'),  -- https://www.masi.it/en/wines/modello-masi-merlot-trevenezie-igt-canada-red-wine/
  ('Masi', 'Tupungato Passo Doble Malbec Corvina', 'Valle de Uco, Mendoza, Argentina', 'Malbec/Corvina', 'Red')  -- https://www.masi.it/en/wines/masi-tupungato-passo-doble-malbec-corvina-rosso-argentina-red-wine-organic-wine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ZONIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Zonin', 'Prosecco Cuvée 1821 Brut', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.lcbo.com/en/zonin-cuv-ce-1821-prosecco-doc-brut-277186
  ('Zonin', 'Prosecco', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/prosecco-zonin/
  ('Zonin', 'Prosecco Millesimato Brut', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/prosecco-zonin/
  ('Zonin', 'Prosecco Rosé', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/prosecco-zonin/
  ('Zonin', 'Prosecco Rosé Millesimato Brut', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/prosecco-zonin/
  ('Zonin', 'Prosecco Ice Demi-Sec', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/prosecco-zonin/
  ('Zonin', 'Prosecco Organic', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/prosecco-zonin/
  ('Zonin', 'Prosecco Frizzante', 'Prosecco, Veneto, Italy', null, 'Sparkling'),  -- https://www.zonin.com/us/prosecco-zonin/
  ('Zonin', 'Valdobbiadene Prosecco Superiore', 'Valdobbiadene Prosecco Superiore, Veneto, Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/prosecco-zonin/
  ('Zonin', 'Asti', 'Asti, Piedmont, Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/sparkling-wines/
  ('Zonin', 'Cuvée Rosé', 'Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/sparkling-wines/
  ('Zonin', 'Gran Cuvée', 'Italy', null, 'Sparkling'),  -- https://www.zonin.com/en/sparkling-wines/
  ('Zonin', 'Amarone della Valpolicella', 'Amarone della Valpolicella, Veneto, Italy', null, 'Red'),  -- https://www.zonin.com/en/jewels/
  ('Zonin', 'Valpolicella Ripasso Superiore', 'Valpolicella Ripasso Superiore, Veneto, Italy', null, 'Red'),  -- https://www.zonin.com/en/jewels/
  ('Zonin', 'Velluto Appassimento Veneto', 'Veneto, Italy', null, 'Red'),  -- https://www.zonin.com/en/jewels/
  ('Zonin', 'Primitivo di Manduria', 'Primitivo di Manduria, Puglia, Italy', 'Primitivo', 'Red'),  -- https://www.zonin.com/en/jewels/
  ('Zonin', 'Lugana', 'Lugana, Lombardy, Italy', null, 'White'),  -- https://www.zonin.com/en/jewels/
  ('Zonin', 'Pinot Grigio Friuli', 'Friuli, Friuli-Venezia Giulia, Italy', 'Pinot Grigio', 'White'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Pinot Grigio Blush delle Venezie', 'Delle Venezie, Veneto, Italy', 'Pinot Grigio', 'Rosé'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Chardonnay Friuli', 'Friuli, Friuli-Venezia Giulia, Italy', 'Chardonnay', 'White'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Pinot Bianco Friuli', 'Friuli, Friuli-Venezia Giulia, Italy', 'Pinot Bianco', 'White'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Grillo Sicilia', 'Sicilia, Sicily, Italy', 'Grillo', 'White'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Soave Classico', 'Soave Classico, Veneto, Italy', null, 'White'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Primitivo Rosato Puglia', 'Puglia, Italy', 'Primitivo', 'Rosé'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Bardolino Classico', 'Bardolino Classico, Veneto, Italy', null, 'Red'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Cabernet Friuli', 'Friuli, Friuli-Venezia Giulia, Italy', null, 'Red'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Merlot Friuli', 'Friuli, Friuli-Venezia Giulia, Italy', 'Merlot', 'Red'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Chianti', 'Chianti, Tuscany, Italy', null, 'Red'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Montepulciano d''Abruzzo', 'Montepulciano d''Abruzzo, Abruzzo, Italy', 'Montepulciano', 'Red'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Primitivo Puglia', 'Puglia, Italy', 'Primitivo', 'Red'),  -- https://www.zonin.com/en/classics/
  ('Zonin', 'Valpolicella Classico', 'Valpolicella Classico, Veneto, Italy', null, 'Red')  -- https://www.zonin.com/en/classics/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SANTA MARGHERITA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Santa Margherita', 'Pinot Grigio Valdadige', 'Valdadige, Trentino-Alto Adige, Italy', 'Pinot Grigio', 'White'),  -- https://www.santamargherita.com/en/wines/wine/40
  ('Santa Margherita', 'Pinot Grigio Impronta del Fondatore Alto Adige', 'Alto Adige, Trentino-Alto Adige, Italy', 'Pinot Grigio', 'White'),  -- https://www.santamargherita.com/en/wines/wine/57
  ('Santa Margherita', 'Luna dei Feldi Bianco Alto Adige', 'Alto Adige, Trentino-Alto Adige, Italy', 'Chardonnay/Müller Thurgau/Gewürztraminer/Pinot Bianco', 'White'),  -- https://www.santamargherita.com/en/wines/wine/65
  ('Santa Margherita', 'Chardonnay Vigneti delle Dolomiti', 'Vigneti delle Dolomiti, Trentino-Alto Adige, Italy', 'Chardonnay', 'White'),  -- https://www.santamargherita.com/en/wines/wine/38
  ('Santa Margherita', 'Gewürztraminer Trentino', 'Trentino, Trentino-Alto Adige, Italy', 'Gewürztraminer', 'White'),  -- https://www.santamargherita.com/en/wines/wine/67
  ('Santa Margherita', 'Müller Thurgau Trentino', 'Trentino, Trentino-Alto Adige, Italy', 'Müller Thurgau', 'White'),  -- https://www.santamargherita.com/en/wines/wine/66
  ('Santa Margherita', 'Müller Thurgau Frizzante Vigneti delle Dolomiti', 'Vigneti delle Dolomiti, Trentino-Alto Adige, Italy', 'Müller Thurgau', 'Sparkling'),  -- https://www.santamargherita.com/en/wines/wine/62
  ('Santa Margherita', 'Valdobbiadene Prosecco Superiore Brut', 'Valdobbiadene Prosecco Superiore, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/en/wines/wine/44
  ('Santa Margherita', 'Valdobbiadene Prosecco Superiore Extra Dry', 'Valdobbiadene Prosecco Superiore, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/en/wines/wine/45
  ('Santa Margherita', 'Valdobbiadene Prosecco Superiore 52 Brut', 'Valdobbiadene Prosecco Superiore, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/en/wines/wine/43
  ('Santa Margherita', 'Valdobbiadene Prosecco Superiore Rive di Refrontolo Extra Brut', 'Valdobbiadene Prosecco Superiore, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/en/wines/wine/48
  ('Santa Margherita', 'Valdobbiadene Superiore di Cartizze Extra Dry', 'Valdobbiadene Superiore di Cartizze, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/en/wines/wine/60
  ('Santa Margherita', 'Prosecco Extra Dry', 'Prosecco, Veneto, Italy', 'Glera', 'Sparkling'),  -- https://www.santamargherita.com/en/wines/wine/49
  ('Santa Margherita', 'Sparkling Rosé VS Brut', 'Italy', 'Chardonnay/Glera/Pinot Nero', 'Sparkling'),  -- https://www.santamargherita.com/en/wines/wine/79
  ('Santa Margherita', 'Rosé Trevenezie', 'Trevenezie, Veneto, Italy', 'Chardonnay/Sauvignon Blanc/Pinot Nero', 'Rosé'),  -- https://www.santamargherita.com/en/wines/wine/94
  ('Santa Margherita', 'Merlot Veneto', 'Veneto, Italy', 'Merlot', 'Red'),  -- https://www.santamargherita.com/en/wines/wine/82
  ('Santa Margherita', 'Cabernet Sauvignon Veneto', 'Veneto, Italy', 'Cabernet Sauvignon', 'Red'),  -- https://www.santamargherita.com/en/wines/wine/98
  ('Santa Margherita', 'Chianti Classico Riserva', 'Chianti Classico, Tuscany, Italy', null, 'Red'),  -- https://www.wine.com/product/santa-margherita-chianti-classico-riserva-2020/1247349
  ('Santa Margherita', 'Dulcedo Lison Pramaggiore', 'Lison Pramaggiore, Veneto, Italy', 'Verduzzo Friulano', 'White')  -- https://www.santamargherita.com/en/wines/wine/75
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TORRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Torres', 'Sangre de Toro', 'Catalunya, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/torres-essentials/sangre-de-toro-original
  ('Torres', 'Viña Sol', 'Catalunya, Catalonia, Spain', null, 'White'),  -- https://www.torres.es/en/wines/torres-essentials/vina-sol-original
  ('Torres', 'Viña Esmeralda', 'Catalunya, Catalonia, Spain', null, 'White'),  -- https://www.torres.es/en/wines/torres-essentials/vina-esmeralda
  ('Torres', 'Coronas', 'Catalunya, Catalonia, Spain', 'Tempranillo/Cabernet Sauvignon', 'Red'),  -- https://www.torres.es/en/wines/torres-essentials/coronas
  ('Torres', 'Magnetic Red', 'Catalunya, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/torres-essentials/magnetic-red
  ('Torres', 'Magnetic White', 'Catalunya, Catalonia, Spain', null, 'White'),  -- https://www.torres.es/en/wines/torres-essentials/magnetic-white
  ('Torres', 'Magnetic Rosé', 'Catalunya, Catalonia, Spain', null, 'Rosé'),  -- https://www.torres.es/en/wines/torres-essentials/magnetic-rose
  ('Torres', 'Natureo Muscat', 'Spain', null, 'White'),  -- https://www.torres.es/en/wines/torres-essentials/natureo-muscat
  ('Torres', 'Mas La Plana', 'Penedès, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/familia-torres/mas-la-plana
  ('Torres', 'Milmanda', 'Conca de Barberà, Catalonia, Spain', null, 'White'),  -- https://www.torres.es/en/wines/familia-torres/milmanda
  ('Torres', 'Grans Muralles', 'Conca de Barberà, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/familia-torres/grans-muralles
  ('Torres', 'Reserva Real', 'Penedès, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/familia-torres/reserva-real
  ('Torres', 'Mas de la Rosa', 'Priorat, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/familia-torres/mas-de-la-rosa
  ('Torres', 'Clos Ancestral Red', 'Penedès, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/familia-torres/clos-ancestral-red
  ('Torres', 'Clos Ancestral White', 'Penedès, Catalonia, Spain', null, 'White'),  -- https://www.torres.es/en/wines/familia-torres/clos-ancestral-white
  ('Torres', 'Fransola', 'Penedès, Catalonia, Spain', null, 'White'),  -- https://www.torres.es/en/wines/familia-torres/fransola
  ('Torres', 'Gran Coronas', 'Penedès, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/familia-torres/gran-coronas
  ('Torres', 'Waltraud', 'Penedès, Catalonia, Spain', null, 'White'),  -- https://www.torres.es/en/wines/familia-torres/waltraud
  ('Torres', 'Salmos', 'Priorat, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/familia-torres/salmos
  ('Torres', 'Perpetual', 'Priorat, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/familia-torres/perpetual
  ('Torres', 'Secret del Priorat', 'Priorat, Catalonia, Spain', 'Garnacha Tinta/Cariñena/Cabernet Sauvignon/Merlot', 'Red'),  -- https://www.torres.es/en/wines/familia-torres/secret-del-priorat
  ('Torres', 'Purgatori', 'Costers del Segre, Catalonia, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/familia-torres/purgatori
  ('Torres', 'Forcada', 'Penedès, Catalonia, Spain', null, 'White'),  -- https://www.torres.es/en/wines/familia-torres/forcada
  ('Torres', 'Pirene', 'Pirene, Catalonia, Spain', 'Pirene', 'Red'),  -- https://www.torres.es/en/wines/familia-torres/pirene
  ('Torres', 'Gonfaus', 'Costers del Segre, Catalonia, Spain', 'Gonfaus', 'Red'),  -- https://www.torres.es/en/wines/familia-torres/gonfaus
  ('Torres', 'Celeste Crianza', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/pago-del-cielo/celeste-crianza
  ('Torres', 'Celeste Reserva', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/pago-del-cielo/celeste-reserva
  ('Torres', 'Celeste Roble', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://www.torres.es/en/wines/pago-del-cielo/celeste-roble
  ('Torres', 'Celeste Verdejo', 'Rueda, Castilla y León, Spain', null, 'White'),  -- https://www.torres.es/en/wines/pago-del-cielo/celeste-verdejo
  ('Torres', 'Celeste Rosé', 'Cigales, Castilla y León, Spain', null, 'Rosé'),  -- https://www.torres.es/en/wines/pago-del-cielo/celeste-rose
  ('Torres', 'Pazo das Bruxas', 'Rías Baixas, Galicia, Spain', null, 'White'),  -- https://www.torres.es/en/wines/torre-penelas/pazo-das-bruxas
  ('Torres', 'Pazo das Bruxas Godello', 'Monterrei, Galicia, Spain', 'Godello', 'White')  -- https://www.torres.es/en/wines/torre-penelas/pazo-das-bruxas-godello
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARQUÉS DE RISCAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Marqués de Riscal', 'Rioja Reserva', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', 'Rioja Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', 'XR Rioja Reserva', 'Rioja, Spain', 'Tempranillo/Graciano', 'Red'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', 'Arienzo Rioja Crianza', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', 'Barón de Chirel Rioja Reserva', 'Rioja, Spain', 'Tempranillo/Cabernet Sauvignon', 'Red'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', 'Barón de Chirel Blanco', 'Rioja, Spain', null, 'White'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', '150 Aniversario Rioja Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', 'Rioja Rosado', 'Rioja, Spain', 'Tempranillo/Viura', 'Rosé'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', 'Rueda Verdejo', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', 'Rueda Verdejo Organic', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White'),  -- https://vintus.com/producers/marques-de-riscal/
  ('Marqués de Riscal', 'Rueda Sauvignon Blanc', 'Rueda, Castilla y León, Spain', 'Sauvignon Blanc', 'White'),  -- https://www.marquesderiscal.com/public/Attachment/2026/1/marquesderiscalsauvignonblanc2025_en.pdf
  ('Marqués de Riscal', 'Finca Montico', 'Rueda, Castilla y León, Spain', 'Verdejo', 'White')  -- https://marquesderiscal.com/en/finca-montico
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CVNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('CVNE', 'Cune Crianza', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/cune-crianza/
  ('CVNE', 'Cune Reserva', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/cune-reserva/
  ('CVNE', 'Cune Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/cune-gran-reserva/
  ('CVNE', 'Cune Ecológico', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/cune-ecologic-organic/
  ('CVNE', 'Cune Blanco', 'Rioja, Spain', null, 'White'),  -- https://cvne.com/en/wines/cune-white/
  ('CVNE', 'Cune Blanco Reserva', 'Rioja, Spain', null, 'White'),  -- https://cvne.com/en/wines/cune-white-reserva/
  ('CVNE', 'Cune Rosado', 'Rioja, Spain', null, 'Rosé'),  -- https://cvne.com/en/wines/cune-rose/
  ('CVNE', 'Cune Rueda', 'Rueda, Castilla y León, Spain', null, 'White'),  -- https://cvne.com/en/wines/cune-rueda/
  ('CVNE', 'Cune Ribera del Duero', 'Ribera del Duero, Castilla y León, Spain', null, 'Red'),  -- https://cvne.com/en/wines/cune-ribera-del-duero/
  ('CVNE', 'Imperial Reserva', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/imperial-reserva/
  ('CVNE', 'Imperial Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/imperial-gran-reserva/
  ('CVNE', 'Real de Asúa', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/real-de-asua/
  ('CVNE', 'Viña Real Crianza', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/vina-real-crianza/
  ('CVNE', 'Viña Real Reserva', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/vina-real-reserva/
  ('CVNE', 'Viña Real Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/vina-real-gran-reserva/
  ('CVNE', 'Pagos de Viña Real', 'Rioja, Spain', null, 'Red'),  -- https://cvne.com/en/wines/pagos-de-vina-real/
  ('CVNE', 'Viña Real Rosado', 'Rioja, Spain', null, 'Rosé'),  -- https://cvne.com/en/wines/vina-real-rose/
  ('CVNE', 'Viña Real Fermentado en Barrica', 'Rioja, Spain', null, 'White'),  -- https://cvne.com/en/wines/vina-real-barrel-fermented/
  ('CVNE', 'Monopole', 'Rioja, Spain', null, 'White'),  -- https://cvne.com/en/wines/monopole-rioja/
  ('CVNE', 'Monopole Clásico', 'Rioja, Spain', null, 'White'),  -- https://cvne.com/en/wines/monopole-clasico/
  ('CVNE', 'Monopole S.XXI Rueda', 'Rueda, Castilla y León, Spain', null, 'White')  -- https://cvne.com/en/wines/monopole-s-xxi-rueda/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FAUSTINO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Faustino', 'Faustino I Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasfaustino.com/en/wines/faustino-i-gran-reserva
  ('Faustino', 'Faustino I Blanco Gran Reserva', 'Rioja, Spain', null, 'White'),  -- https://www.bodegasfaustino.com/en/wines/faustino-i-blanco-gran-reserva
  ('Faustino', 'Faustino Icon Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasfaustino.com/en/wines/faustino-icon-gran-reserva
  ('Faustino', 'Faustino Crianza', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasfaustino.com/en/wines/faustino-crianza-wines
  ('Faustino', 'Faustino V Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasfaustino.com/en/wines/faustino-v
  ('Faustino', 'Faustino V Blanco', 'Rioja, Spain', null, 'White'),  -- https://www.bodegasfaustino.com/en/wines/faustino-v
  ('Faustino', 'Faustino V Rosado', 'Rioja, Spain', null, 'Rosé'),  -- https://www.bodegasfaustino.com/en/wines/faustino-v
  ('Faustino', 'Faustino VII Tinto', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasfaustino.com/en/wines/faustino-vii
  ('Faustino', 'Faustino VII Blanco', 'Rioja, Spain', null, 'White'),  -- https://www.bodegasfaustino.com/en/wines/faustino-vii
  ('Faustino', 'Faustino VII Rosado', 'Rioja, Spain', null, 'Rosé'),  -- https://www.bodegasfaustino.com/en/wines/faustino-vii
  ('Faustino', 'Faustino VII Garnacha', 'Rioja, Spain', 'Garnacha', 'Red'),  -- https://www.bodegasfaustino.com/en/wines/faustino-vii-garnacha
  ('Faustino', 'Faustino Art Collection Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasfaustino.com/en/wines/faustino-specials
  ('Faustino', 'Cava Faustino Brut', 'Cava, Spain', null, 'Sparkling'),  -- https://www.bodegasfaustino.com/en/wines/cava-faustino-brut
  ('Faustino', 'Cava Faustino Semi Seco', 'Cava, Spain', null, 'Sparkling'),  -- https://www.bodegasfaustino.com/en/wines/cavas-faustino
  ('Faustino', 'Cava Faustino Extra Seco', 'Cava, Spain', null, 'Sparkling')  -- https://www.bodegasfaustino.com/en/wines/cavas-faustino
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAMPO VIEJO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Campo Viejo', 'Rioja Tempranillo', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.campoviejo.com/product/tempranillo/
  ('Campo Viejo', 'Rioja Garnacha', 'Rioja, Spain', 'Garnacha', 'Red'),  -- https://www.campoviejo.com/product/garnacha/
  ('Campo Viejo', 'Rioja Reserva', 'Rioja, Spain', 'Tempranillo/Graciano/Mazuelo', 'Red'),  -- https://www.campoviejo.com/product/reserva/
  ('Campo Viejo', 'Rioja Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.campoviejo.com/product/gran-reserva/
  ('Campo Viejo', 'Rioja Tempranillo Ecológico', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.campoviejo.com/product/tempranillo-ecologico/
  ('Campo Viejo', 'Dominio', 'Rioja, Spain', null, 'Red'),  -- https://www.campoviejo.com/product/dominio/
  ('Campo Viejo', 'Dominio Blanco', 'Rioja, Spain', null, 'White'),  -- https://www.campoviejo.com/product/dominio-blanco/
  ('Campo Viejo', 'Winemaker''s Art', 'Rioja, Spain', 'Tempranillo', 'Red'),  -- https://www.campoviejo.com/product/winemakers-art/
  ('Campo Viejo', 'Winemakers'' Blend', 'Spain', 'Tempranillo/Garnacha/Bobal', 'Red'),  -- https://www.campoviejo.com/product/campo-viejo-winemakers-blend/
  ('Campo Viejo', 'Rioja Blanco', 'Rioja, Spain', null, 'White'),  -- https://www.campoviejo.com/product/blanco/
  ('Campo Viejo', 'Rioja Reserva Blanco', 'Rioja, Spain', null, 'White'),  -- https://www.campoviejo.com/product/reserva-blanco/
  ('Campo Viejo', 'Rioja Rosé', 'Rioja, Spain', null, 'Rosé'),  -- https://www.campoviejo.com/product/rose-3/
  ('Campo Viejo', 'Rioja Tempranillo Rosé', 'Rioja, Spain', 'Tempranillo', 'Rosé'),  -- https://www.campoviejo.com/product/tempranillo-rose/
  ('Campo Viejo', 'Semi Dulce', 'Rioja, Spain', null, 'White'),  -- https://www.campoviejo.com/product/semi-dulce/
  ('Campo Viejo', 'Cava Brut', 'Cava, Spain', null, 'Sparkling'),  -- https://www.campoviejo.com/product/cava-brut/
  ('Campo Viejo', 'Cava Brut Rosé', 'Cava, Spain', null, 'Sparkling')  -- https://www.campoviejo.com/product/brut-rose/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FREIXENET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Freixenet', 'Cordon Negro Brut', 'Cava, Spain', null, 'Sparkling'),  -- https://freixenet.com/ca/en/our-products/cava/cordon-negro-brut/
  ('Freixenet', 'Carta Nevada', 'Cava, Spain', 'Parellada/Macabeo/Xarel·lo', 'Sparkling'),  -- https://freixenet.com/us/our-products/spanish-classic/carta-nevada
  ('Freixenet', 'Cordon Rosé', 'Cava, Spain', null, 'Sparkling'),  -- https://freixenet.com/uk/product/cordon-rose-cava
  ('Freixenet', 'Elyssia Gran Cuvée', 'Cava, Spain', null, 'Sparkling'),  -- https://freixenet.com/ca/en/our-products/cava/gran-cuvee/
  ('Freixenet', 'Elyssia Pinot Noir', 'Cava, Spain', null, 'Sparkling'),  -- https://freixenet.com/ca/en/our-products/cava/pinot-noir/
  ('Freixenet', 'Prosecco', 'Prosecco, Italy', null, 'Sparkling'),  -- https://freixenet.com/ca/en/our-products/italian-sparkling/prosecco/
  ('Freixenet', 'Italian Sparkling Rosé', 'Italy', null, 'Sparkling'),  -- https://freixenet.com/ca/en/our-products/italian-sparkling/italian-sparkling-rose/
  ('Freixenet', 'Asti', 'Asti, Piedmont, Italy', null, 'Sparkling'),  -- https://freixenet.com/uk/product/asti
  ('Freixenet', 'Chianti', 'Chianti, Tuscany, Italy', null, 'Red'),  -- https://freixenet.com/ca/en/our-products/italian-still-wine/chianti/
  ('Freixenet', 'Pinot Grigio', 'Garda, Italy', null, 'White'),  -- https://freixenet.com/ca/en/our-products/italian-still-wine/pinot-grigio/
  ('Freixenet', 'Moscato', 'Sicily, Italy', null, 'White'),  -- https://freixenet.com/ca/en/our-products/italian-still-wine/moscato/
  ('Freixenet', 'Primitivo', 'Puglia, Italy', null, 'Red'),  -- https://freixenet.com/ca/en/our-products/italian-still-wine/primitivo/
  ('Freixenet', 'Italian Still Rosé', 'Veneto, Italy', null, 'Rosé'),  -- https://freixenet.com/ca/en/our-products/italian-still-wine/italian-still-rose/
  ('Freixenet', 'Rioja', 'Rioja, Spain', null, 'Red'),  -- https://freixenet.com/uk/product/rioja
  ('Freixenet', 'Cabernet Sauvignon', 'Spain', 'Cabernet Sauvignon', 'Red'),  -- https://freixenet.com/ca/en/our-products/spanish-still-wine/cabernet-sauv/
  ('Freixenet', 'Sauvignon Blanc', 'Spain', 'Sauvignon Blanc', 'White'),  -- https://freixenet.com/ca/en/our-products/spanish-still-wine/sauv-blanc/
  ('Freixenet', 'Rosado', 'Spain', null, 'Rosé')  -- https://freixenet.com/ca/en/our-products/spanish-still-wine/rosado/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MUGA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_italy_spain.sql)'
from (values
  ('Muga', 'Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasmuga.com/en/muga/
  ('Muga', 'Selección Especial', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasmuga.com/en/muga-seleccion-especial/
  ('Muga', 'Prado Enea Gran Reserva', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasmuga.com/en/prado-enea-gran-reserva/
  ('Muga', 'Torre Muga', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasmuga.com/en/torre-muga/
  ('Muga', 'Aro', 'Rioja, Spain', null, 'Red'),  -- https://www.bodegasmuga.com/en/aro/
  ('Muga', 'Blanco', 'Rioja, Spain', null, 'White'),  -- https://www.bodegasmuga.com/en/muga-white/
  ('Muga', 'Rosado', 'Rioja, Spain', null, 'Rosé'),  -- https://www.bodegasmuga.com/en/muga-rosado/
  ('Muga', 'Flor de Muga Blanco', 'Rioja, Spain', null, 'White'),  -- https://www.bodegasmuga.com/en/flor-de-muga-blanco/
  ('Muga', 'Flor de Muga Rosé', 'Rioja, Spain', null, 'Rosé'),  -- https://www.bodegasmuga.com/en/flor-de-muga-rose/
  ('Muga', 'Conde de Haro Brut', 'Cava, Spain', null, 'Sparkling'),  -- https://www.bodegasmuga.com/en/cava-conde-de-haro/
  ('Muga', 'Conde de Haro Brut Rosé', 'Cava, Spain', null, 'Sparkling')  -- https://www.bodegasmuga.com/en/cava-conde-de-haro-rose/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
