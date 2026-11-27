-- Producer ranges round 3: Langhe. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- VIETTI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Vietti', 'Roero Arneis', 'Roero, Piedmont, Italy', 'Arneis', 'White'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Langhe Nebbiolo Perbacco', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Langhe Freisa', 'Langhe, Piedmont, Italy', 'Freisa', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barbera d''Alba Trevìe', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barbera d''Asti Trevìe', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Verduno Pelaverga', 'Langhe, Piedmont, Italy', 'Pelaverga', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Dolcetto d''Alba Trevìe', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Moscato d''Asti', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barbera d''Alba Vigna Scarrone', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barbera d''Alba Vigna Vecchia Scarrone', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barbera d''Asti La Crena', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barolo Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barbaresco Riserva Rabajà', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barbaresco Roncaglie', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barolo Brunate', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barolo Cerequio', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barolo Lazzarito', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barolo Monvigliero', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barolo Ravera', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barolo Rocche di Castiglione', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.vietti.com/en/wines
  ('Vietti', 'Barolo Riserva Villero', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://www.vietti.com/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CERETTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Ceretto', 'Langhe Arneis Blangé', 'Langhe, Piedmont, Italy', 'Arneis', 'White'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barbaresco', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Nebbiolo d''Alba Bernardina', 'Alba, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Dolcetto d''Alba Rossana', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barbera d''Alba Piana', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Langhe Rosso Monsordo', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barolo Chinato', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Fortified'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barbaresco Asili', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barbaresco Bernadot', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barbaresco Gallina', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barolo Bricco Rocche', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barolo Brunate', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barolo Bussia', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barolo Prapò', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barolo Rocche di Castiglione', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ceretto.com/en/wines
  ('Ceretto', 'Barolo Cannubi San Lorenzo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://www.ceretto.com/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- G.D. VAJRA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('G.D. Vajra', 'Barolo Albe', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Barolo Coste di Rose', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Barolo Ravera', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Barolo Bricco delle Viole', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Langhe Freisa Kyè', 'Langhe, Piedmont, Italy', 'Freisa', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Langhe Nebbiolo Claré J.C.', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Langhe Pinot Nero', 'Langhe, Piedmont, Italy', 'Pinot Noir', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Barbera d''Alba Superiore', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Dolcetto d''Alba Coste & Fossati', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Langhe Riesling Pétracine', 'Langhe, Piedmont, Italy', 'Riesling', 'White'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Moscato d''Asti', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling'),  -- https://www.gdvajra.it/en/wines
  ('G.D. Vajra', 'Barolo Chinato', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Fortified')  -- https://www.gdvajra.it/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ODDERO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Oddero', 'Barolo Monvigliero', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Barolo Vignarionda Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Barolo Brunate', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Barolo Bussia Vigna Mondoca', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Barolo Rocche di Castiglione', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Barolo Villero', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Barbaresco Gallina', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Barbera d''Alba Superiore', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Moscato d''Asti Cascina Fiori', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling'),  -- https://www.oddero.it/en/wines
  ('Oddero', 'Langhe Riesling', 'Langhe, Piedmont, Italy', 'Riesling', 'White')  -- https://www.oddero.it/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RENATO RATTI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Renato Ratti', 'Barolo Marcenasco', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Barolo Rocche dell''Annunziata', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Barolo Conca', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Barolo Serradenari', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Langhe Nebbiolo Ochetti', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Langhe Nebbiolo Reggimento', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Langhe Dolcetto Colombé', 'Langhe, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Barbera d''Alba Battaglione', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Barbera d''Asti Battaglione', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Barbera d''Asti Superiore Villa Pattono', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Langhe Chardonnay Brigata', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.renatoratti.com/en/wines
  ('Renato Ratti', 'Alta Langa', 'Alta Langa, Piedmont, Italy', null, 'Sparkling')  -- https://www.renatoratti.com/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAVALLOTTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Cavallotto', 'Barolo Bricco Boschis', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.cavallotto.com/en/wines/
  ('Cavallotto', 'Barolo Riserva Bricco Boschis Vigna San Giuseppe', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.cavallotto.com/en/wines/
  ('Cavallotto', 'Barolo Riserva Vignolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.cavallotto.com/en/wines/
  ('Cavallotto', 'Barbera d''Alba Vigna Cuculo', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.cavallotto.com/en/wines/
  ('Cavallotto', 'Dolcetto d''Alba Vigna Scot', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.cavallotto.com/en/wines/
  ('Cavallotto', 'Langhe Chardonnay', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.cavallotto.com/en/wines/
  ('Cavallotto', 'Langhe Freisa', 'Langhe, Piedmont, Italy', 'Freisa', 'Red'),  -- https://www.cavallotto.com/en/wines/
  ('Cavallotto', 'Langhe Grign', 'Langhe, Piedmont, Italy', 'Grignolino', 'Red'),  -- https://www.cavallotto.com/en/wines/
  ('Cavallotto', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://www.cavallotto.com/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MASSOLINO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Massolino', 'Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Barolo Margheria', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Barolo Parafada', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Barolo Parussi', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Barolo Vigna Rionda Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Barolo Vigna Rionda Riserva Etichetta Nera', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Barbaresco', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Barbaresco Albesani', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Barbera d''Alba Gisep', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Langhe Chardonnay', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Langhe Riesling', 'Langhe, Piedmont, Italy', 'Riesling', 'White'),  -- https://www.massolino.it/en/our-wines/
  ('Massolino', 'Moscato d''Asti', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling')  -- https://www.massolino.it/en/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COMM. G.B. BURLOTTO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Comm. G.B. Burlotto', 'Barolo Castelletto', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Barolo Acclivi', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Barolo Monvigliero', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Barolo Cannubi', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Langhe Freisa', 'Langhe, Piedmont, Italy', 'Freisa', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Barbera d''Alba Aves', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Verduno Pelaverga', 'Langhe, Piedmont, Italy', 'Pelaverga', 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Langhe Mores', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://www.burlotto.com/en/i-nostri-vini/
  ('Comm. G.B. Burlotto', 'Langhe Sauvignon Viridis', 'Langhe, Piedmont, Italy', 'Sauvignon Blanc', 'White')  -- https://www.burlotto.com/en/i-nostri-vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DAMILANO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Damilano', 'Barolo Brunate', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://cantinedamilano.it/il-barolo/
  ('Damilano', 'Barolo Cannubi', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://cantinedamilano.it/il-barolo/
  ('Damilano', 'Barolo Cerequio', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://cantinedamilano.it/il-barolo/
  ('Damilano', 'Barolo del Comune di Serralunga d''Alba', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://cantinedamilano.it/il-barolo/
  ('Damilano', 'Barolo Lecinquevigne', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://cantinedamilano.it/il-barolo/
  ('Damilano', 'Barolo Liste', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://cantinedamilano.it/il-barolo/
  ('Damilano', 'Barolo Raviole', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://cantinedamilano.it/il-barolo/
  ('Damilano', 'Barolo Riserva Cannubi 1752', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://cantinedamilano.it/il-barolo/
  ('Damilano', 'Barbera d''Alba Lablù', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://cantinedamilano.it/i-vini/
  ('Damilano', 'Barbera d''Asti Zerosette', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://cantinedamilano.it/i-vini/
  ('Damilano', 'Barolo Chinato', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Fortified'),  -- https://cantinedamilano.it/i-vini/
  ('Damilano', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://cantinedamilano.it/i-vini/
  ('Damilano', 'Langhe Arneis', 'Langhe, Piedmont, Italy', 'Arneis', 'White'),  -- https://cantinedamilano.it/i-vini/
  ('Damilano', 'Langhe Chardonnay G.D.', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://cantinedamilano.it/i-vini/
  ('Damilano', 'Langhe Nebbiolo Marghe', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://cantinedamilano.it/i-vini/
  ('Damilano', 'Langhe Rosato', 'Langhe, Piedmont, Italy', null, 'Rosé'),  -- https://cantinedamilano.it/i-vini/
  ('Damilano', 'Moscato d''Asti', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling')  -- https://cantinedamilano.it/i-vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CORDERO DI MONTEZEMOLO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Cordero di Montezemolo', 'Alta Langa Autessa', 'Alta Langa, Piedmont, Italy', null, 'Sparkling'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Barbera d''Alba Superiore Funtani', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Barolo Chinato', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Fortified'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Barolo Enrico VI', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Barolo Gattera', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Barolo Monfalletto', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Langhe Pelaverga Fuoricasa', 'Langhe, Piedmont, Italy', 'Pelaverga', 'Red'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Langhe Arneis', 'Langhe, Piedmont, Italy', 'Arneis', 'White'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Langhe Chardonnay Elioro', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.corderodimontezemolo.com/vini/
  ('Cordero di Montezemolo', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://www.corderodimontezemolo.com/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GIACOMO BORGOGNO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Giacomo Borgogno', 'Barolo Annunziata Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Barolo Cannubi Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Barolo Cannubi', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Barolo Le Teorie', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Barolo Fossati', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Barolo Liste Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Barolo Liste', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Barolo Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Langhe Riesling Era Ora', 'Langhe, Piedmont, Italy', 'Riesling', 'White'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Langhe Ancum', 'Langhe, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Langhe Bartomè', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Langhe Bompè', 'Langhe, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Langhe Freisa', 'Langhe, Piedmont, Italy', 'Freisa', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Langhe Nebbiolo No Name', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.borgogno.com/vini/
  ('Giacomo Borgogno', 'Barolo Chinato', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Fortified')  -- https://www.borgogno.com/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ELIO GRASSO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Elio Grasso', 'Barbera d''Alba Vigna Martina', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.eliograsso.it/vini/
  ('Elio Grasso', 'Barolo Gavarini Chiniera', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.eliograsso.it/vini/
  ('Elio Grasso', 'Barolo Riserva Runcot', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.eliograsso.it/vini/
  ('Elio Grasso', 'Barolo Ginestra Casa Maté', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.eliograsso.it/vini/
  ('Elio Grasso', 'Dolcetto d''Alba dei Grassi', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.eliograsso.it/vini/
  ('Elio Grasso', 'Langhe Chardonnay Educato', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.eliograsso.it/vini/
  ('Elio Grasso', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://www.eliograsso.it/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ETTORE GERMANO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Ettore Germano', 'Alta Langa Extra Brut', 'Alta Langa, Piedmont, Italy', null, 'Sparkling'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Alta Langa Blanc de Blancs Pas Dosé', 'Alta Langa, Piedmont, Italy', 'Chardonnay', 'Sparkling'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Alta Langa Riserva Blanc de Noirs Pas Dosé', 'Alta Langa, Piedmont, Italy', 'Pinot Noir', 'Sparkling'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Langhe Chardonnay', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Langhe Nascetta', 'Langhe, Piedmont, Italy', 'Nascetta', 'White'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Langhe Riesling Hérzu', 'Langhe, Piedmont, Italy', 'Riesling', 'White'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Barbera d''Alba Superiore', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Barolo del Comune di Serralunga d''Alba', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Barolo Prapò', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Barolo Cerretta', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Barolo Vignarionda', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.ettoregermano.com/en/wines
  ('Ettore Germano', 'Barolo Lazzarito Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://www.ettoregermano.com/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GIOVANNI ROSSO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Giovanni Rosso', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
  ('Giovanni Rosso', 'Barbera d''Alba Donna Margherita', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
  ('Giovanni Rosso', 'Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
  ('Giovanni Rosso', 'Barolo Cerretta', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
  ('Giovanni Rosso', 'Barolo Serra', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
  ('Giovanni Rosso', 'Barolo del Comune di Serralunga d''Alba', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
  ('Giovanni Rosso', 'Barolo Vignarionda Ester Canale Rosso', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
  ('Giovanni Rosso', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
  ('Giovanni Rosso', 'Langhe Nebbiolo Ester Canale Rosso', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
  ('Giovanni Rosso', 'Roero Arneis', 'Roero, Piedmont, Italy', 'Arneis', 'White')  -- https://www.giovannirosso.com/en/piedmont-sicily-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMENICO CLERICO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Domenico Clerico', 'Langhe Dolcetto Visadì', 'Langhe, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://domenicoclerico.com/en/wines/
  ('Domenico Clerico', 'Barbera d''Alba Trevigne', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://domenicoclerico.com/en/wines/
  ('Domenico Clerico', 'Langhe Nebbiolo Capisme-e', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://domenicoclerico.com/en/wines/
  ('Domenico Clerico', 'Langhe Rosso Arte', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://domenicoclerico.com/en/wines/
  ('Domenico Clerico', 'Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://domenicoclerico.com/en/wines/
  ('Domenico Clerico', 'Barolo Pajana', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://domenicoclerico.com/en/wines/
  ('Domenico Clerico', 'Barolo Ciabot Mentin', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://domenicoclerico.com/en/wines/
  ('Domenico Clerico', 'Barolo Briccotto', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://domenicoclerico.com/en/wines/
  ('Domenico Clerico', 'Barolo Percristina', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://domenicoclerico.com/en/wines/
  ('Domenico Clerico', 'Barolo Aeroplanservaj', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://domenicoclerico.com/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CONTERNO FANTINO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Conterno Fantino', 'Barolo Ginestra Vigna Sorì Ginestra', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.conternofantino.it/en/wines/
  ('Conterno Fantino', 'Barolo Mosconi Vigna Ped', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.conternofantino.it/en/wines/
  ('Conterno Fantino', 'Barolo Castelletto Vigna Pressenda', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.conternofantino.it/en/wines/
  ('Conterno Fantino', 'Barolo Ginestra Vigna del Gris', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.conternofantino.it/en/wines/
  ('Conterno Fantino', 'Langhe Rosso Monprà', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://www.conternofantino.it/en/wines/
  ('Conterno Fantino', 'Langhe Nebbiolo Ginestrino', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.conternofantino.it/en/wines/
  ('Conterno Fantino', 'Barbera d''Alba Vignota', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.conternofantino.it/en/wines/
  ('Conterno Fantino', 'Dolcetto d''Alba Bricco Bastia', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.conternofantino.it/en/wines/
  ('Conterno Fantino', 'Langhe Chardonnay Bastìa', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.conternofantino.it/en/wines/
  ('Conterno Fantino', 'Barolo Chinato Perin', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Fortified')  -- https://www.conternofantino.it/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAOLO CONTERNO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Paolo Conterno', 'Barbera d''Alba La Ginestra', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.paoloconterno.com/vini/
  ('Paolo Conterno', 'Barolo Ginestra Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.paoloconterno.com/vini/
  ('Paolo Conterno', 'Barolo Ginestra', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.paoloconterno.com/vini/
  ('Paolo Conterno', 'Barolo Riva del Bric', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.paoloconterno.com/vini/
  ('Paolo Conterno', 'Dolcetto d''Alba L''Alto', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.paoloconterno.com/vini/
  ('Paolo Conterno', 'Langhe Arneis A Val', 'Langhe, Piedmont, Italy', 'Arneis', 'White'),  -- https://www.paoloconterno.com/vini/
  ('Paolo Conterno', 'Langhe Nebbiolo Bric Ginestra', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.paoloconterno.com/vini/
  ('Paolo Conterno', 'Langhe Nebbiolo Mont', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://www.paoloconterno.com/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PODERI COLLA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Poderi Colla', 'Alta Langa Extra Brut Pietro Colla', 'Alta Langa, Piedmont, Italy', null, 'Sparkling'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Barbaresco Roncaglie Riserva Beppe Colla', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Barbaresco Roncaglie', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Barbera d''Alba Costa Bruna', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Barolo Bussia Dardi Le Rose Riserva Beppe Colla', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Barolo Bussia Dardi Le Rose', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Dolcetto d''Alba Pian Balbo', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Langhe Bricco del Drago', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Langhe Pinot Nero Campo Romano', 'Langhe, Piedmont, Italy', 'Pinot Noir', 'Red'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Langhe Riesling Ranera', 'Langhe, Piedmont, Italy', 'Riesling', 'White'),  -- https://www.podericolla.it/vini/
  ('Poderi Colla', 'Nebbiolo d''Alba', 'Alba, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://www.podericolla.it/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TREDIBERRI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Trediberri', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.trediberri.com/vini/
  ('Trediberri', 'Barolo Berri', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.trediberri.com/vini/
  ('Trediberri', 'Barolo del Comune di La Morra', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.trediberri.com/vini/
  ('Trediberri', 'Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.trediberri.com/vini/
  ('Trediberri', 'Barolo Rocche dell''Annunziata', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.trediberri.com/vini/
  ('Trediberri', 'Dogliani Bricco Mollea', 'Dogliani, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.trediberri.com/vini/
  ('Trediberri', 'Dogliani', 'Dogliani, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.trediberri.com/vini/
  ('Trediberri', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.trediberri.com/vini/
  ('Trediberri', 'Langhe Rosato', 'Langhe, Piedmont, Italy', null, 'Rosé')  -- https://www.trediberri.com/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BRUNO ROCCA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Bruno Rocca', 'Barbaresco', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Barbaresco Maria Adelaide', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Barbaresco Riserva Rabajà', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Barbaresco Riserva Currà', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Barbaresco Rabajà', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Barbaresco Marcorino', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Barbaresco Currà', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Langhe Nebbiolo Fralù', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Dolcetto d''Alba Trifolé', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Langhe Chardonnay Cadet', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.brunorocca.it/vini/
  ('Bruno Rocca', 'Langhe Rosato', 'Langhe, Piedmont, Italy', null, 'Rosé')  -- https://www.brunorocca.it/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALBINO ROCCA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Albino Rocca', 'Barbaresco Angelo', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Barbaresco Ronchi Riserva', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Barbaresco Cottà Riserva', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Barbaresco Ronchi', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Barbaresco Ovello Vigna Loreto', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Barbaresco Cottà', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Barbaresco Montersino', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Barbaresco', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Nebbiolo d''Alba', 'Alba, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Langhe Nebbiolo Rosso di Rocca', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Barbera d''Alba Superiore Gepin', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Langhe Chardonnay da Bertü', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.albinorocca.com/vini/
  ('Albino Rocca', 'Moscato d''Asti', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling')  -- https://www.albinorocca.com/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SOTTIMANO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Sottimano', 'Barbaresco Basarin', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.sottimano.it/vini/
  ('Sottimano', 'Barbaresco Cottà', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.sottimano.it/vini/
  ('Sottimano', 'Barbaresco Pajoré', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.sottimano.it/vini/
  ('Sottimano', 'Barbaresco Fausoni', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.sottimano.it/vini/
  ('Sottimano', 'Barbaresco Currà', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.sottimano.it/vini/
  ('Sottimano', 'Barbaresco Riserva', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.sottimano.it/vini/
  ('Sottimano', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.sottimano.it/vini/
  ('Sottimano', 'Barbera d''Alba Superiore Pairolero', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.sottimano.it/vini/
  ('Sottimano', 'Dolcetto d''Alba Bric del Salto', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red')  -- https://www.sottimano.it/vini/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROAGNA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Roagna', 'Barbaresco Pajè', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/barolo-e-barbaresco/
  ('Roagna', 'Barolo Pira', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/barolo-e-barbaresco/
  ('Roagna', 'Barolo Rocche di Castiglione', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/barolo-e-barbaresco/
  ('Roagna', 'Barolo del Comune di Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/barolo-e-barbaresco/
  ('Roagna', 'Barbaresco Albesani', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/barolo-e-barbaresco/
  ('Roagna', 'Barbaresco Gallina', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/barolo-e-barbaresco/
  ('Roagna', 'Barbaresco', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/barolo-e-barbaresco/
  ('Roagna', 'Barolo Le Coste', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/barolo-e-barbaresco/
  ('Roagna', 'Barolo', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/barolo-e-barbaresco/
  ('Roagna', 'Barbaresco Pajè Vecchie Viti', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/crichet-paje-e-vecchie-viti/
  ('Roagna', 'Barolo Pira Vecchie Viti', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/crichet-paje-e-vecchie-viti/
  ('Roagna', 'Barbaresco Montefico Vecchie Viti', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/crichet-paje-e-vecchie-viti/
  ('Roagna', 'Barbaresco Asili Vecchie Viti', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/crichet-paje-e-vecchie-viti/
  ('Roagna', 'Barbaresco Crichët Pajé Riserva', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.roagna.com/vini/riserva-etichetta-nera/
  ('Roagna', 'Barolo Chinato', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Fortified'),  -- https://www.roagna.com/vini/riserva-etichetta-nera/
  ('Roagna', 'Langhe Bianco Solea', 'Langhe, Piedmont, Italy', null, 'White'),  -- https://www.roagna.com/vini/vini-bianchi/
  ('Roagna', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.roagna.com/vini/vini-classici/
  ('Roagna', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.roagna.com/vini/vini-classici/
  ('Roagna', 'Langhe Rosso', 'Langhe, Piedmont, Italy', null, 'Red')  -- https://www.roagna.com/vini/vini-classici/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROBERTO VOERZIO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Roberto Voerzio', 'Barbera d''Alba Il Cerreto', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Barbera d''Alba Vigneto Pozzo dell''Annunziata', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Barolo Brunate', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Barolo Cerequio', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Barolo Fossati Case Nere', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Barolo La Serra', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Barolo Rocche dell''Annunziata', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Barolo Rocche dell''Annunziata Torriglione', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Barolo Sarmassa', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Dolcetto d''Alba Priavino', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Langhe Merlot Vigneti Fontanazza Pissota', 'Langhe, Piedmont, Italy', 'Merlot', 'Red'),  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
  ('Roberto Voerzio', 'Langhe Nebbiolo Disanfrancesco', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://www.robertovoerzio.com/vini-roberto-voerzio/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ELVIO COGNO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Elvio Cogno', 'Barbaresco Bordini', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Barbera d''Alba Bricco dei Merli', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Barbera d''Alba Pre-Phylloxera', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Barolo Cascina Nuova', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Barolo Ravera Bricco Pernice', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Barolo Ravera', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Barolo Riserva Ravera Vigna Elena', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Dolcetto d''Alba Mandorlo', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Langhe Nascetta Anas-Cëtta', 'Langhe, Piedmont, Italy', 'Nascetta', 'White'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Langhe Nebbiolo Montegrilli', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.cognowines.com/en/our-wines/
  ('Elvio Cogno', 'Moscato d''Asti', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling')  -- https://www.cognowines.com/en/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LA SPINETTA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('La Spinetta', 'Barbaresco Gallina', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Barbaresco Starderi', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Barbaresco Valeirano', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Barbaresco Vigneto Bordini', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Barbera d''Alba Gallina', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Barbera d''Asti Superiore Bionzo', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Barbera d''Asti Superiore Ca'' di Pian', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Barolo Campè', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Barolo Vigneto Garretti', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Langhe Bianco', 'Langhe, Piedmont, Italy', 'Sauvignon Blanc', 'White'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Moscato d''Asti Biancospino', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling'),  -- https://www.la-spinetta.com/prodotti/piemonte/
  ('La Spinetta', 'Moscato d''Asti Bricco Quaglia', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling')  -- https://www.la-spinetta.com/prodotti/piemonte/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARCHESI DI GRÉSY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Marchesi di Grésy', 'Langhe Sauvignon', 'Langhe, Piedmont, Italy', 'Sauvignon Blanc', 'White'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Langhe Bianco Villa Giulia', 'Langhe, Piedmont, Italy', null, 'White'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Langhe Chardonnay', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Langhe Chardonnay Grésy', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Dolcetto d''Alba Monte Aribaldo', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Langhe Nebbiolo Martinenga', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Barbera d''Asti', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Langhe Rosso Villa Martis', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Langhe Rosso Virtus', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Barbera d''Asti Monte Colombo', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Barbaresco Martinenga', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Barbaresco Gaiun Martinenga', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Barbaresco Riserva Camp Gros Martinenga', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.marchesidigresy.com/en/i-vini
  ('Marchesi di Grésy', 'Moscato d''Asti La Serra', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling')  -- https://www.marchesidigresy.com/en/i-vini
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BATASIOLO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Batasiolo', 'Barolo Boscareto', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://batasiolo.com/the-great-barolo/
  ('Batasiolo', 'Barolo Briccolina', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://batasiolo.com/the-great-barolo/
  ('Batasiolo', 'Barolo Bussia Vigneto Bofani', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://batasiolo.com/the-great-barolo/
  ('Batasiolo', 'Barolo Cerequio', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://batasiolo.com/the-great-barolo/
  ('Batasiolo', 'Barolo Brunate', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://batasiolo.com/the-great-barolo/
  ('Batasiolo', 'Barolo Riserva', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Barbera d''Alba Sovrana', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Barbera d''Asti Sabri', 'Asti, Piedmont, Italy', 'Barbera', 'Red'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Langhe Rosso Bat21', 'Langhe, Piedmont, Italy', null, 'Red'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Barbaresco', 'Barbaresco, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Dolcetto d''Alba Vigneto Bricco di Vergne', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Langhe Chardonnay Vigneto Morino', 'Langhe, Piedmont, Italy', 'Chardonnay', 'White'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Roero Arneis Soulmarino', 'Roero, Piedmont, Italy', 'Arneis', 'White'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Langhe Sunsì', 'Langhe, Piedmont, Italy', null, 'White'),  -- https://batasiolo.com/true-excellence/
  ('Batasiolo', 'Moscato d''Asti Bosc dla Rei', 'Asti, Piedmont, Italy', 'Moscato', 'Sparkling')  -- https://batasiolo.com/true-excellence/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GIUSEPPE MASCARELLO E FIGLIO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Giuseppe Mascarello e Figlio', 'Barolo Riserva Monprivato Ca'' d''Morissio', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Barolo Monprivato', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Barolo Perno Vigna Santo Stefano', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Barolo Villero', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Barbera d''Alba Codamonte', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Barbera d''Alba Vigna Santo Stefano di Perno', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Barbera d''Alba Scudetto', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Dolcetto d''Alba Vigna Bricco Mirasole', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Dolcetto d''Alba Vigna Santo Stefano di Perno', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Langhe Freisa Toetto', 'Langhe, Piedmont, Italy', 'Freisa', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.mascarello1881.com/en/wines-mascarello/
  ('Giuseppe Mascarello e Figlio', 'Langhe Rosso Status', 'Langhe, Piedmont, Italy', null, 'Red')  -- https://www.mascarello1881.com/en/wines-mascarello/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LUCIANO SANDRONE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Luciano Sandrone', 'Barolo Vite Talin', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://sandroneluciano.com/en/web/collezione/?lev1=5
  ('Luciano Sandrone', 'Barolo Aleste', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://sandroneluciano.com/en/web/collezione/?lev1=5
  ('Luciano Sandrone', 'Barolo Le Vigne', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://sandroneluciano.com/en/web/collezione/?lev1=5
  ('Luciano Sandrone', 'Nebbiolo d''Alba Valmaggiore', 'Alba, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://sandroneluciano.com/en/web/collezione/?lev1=5
  ('Luciano Sandrone', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://sandroneluciano.com/en/web/collezione/?lev1=5
  ('Luciano Sandrone', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red'),  -- https://sandroneluciano.com/en/web/collezione/?lev1=5
  ('Luciano Sandrone', 'Barolo Cannubi Boschis', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red')  -- https://sandroneluciano.com/en/web/sibi-et-paucis.php?lev1=6
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PIRA & FIGLI — CHIARA BOSCHIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Pira & Figli — Chiara Boschis', 'Barolo Cannubi', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.pira-chiaraboschis.com/
  ('Pira & Figli — Chiara Boschis', 'Barolo Mosconi', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.pira-chiaraboschis.com/
  ('Pira & Figli — Chiara Boschis', 'Barolo Via Nuova', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.pira-chiaraboschis.com/
  ('Pira & Figli — Chiara Boschis', 'Barbera d''Alba', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://www.pira-chiaraboschis.com/
  ('Pira & Figli — Chiara Boschis', 'Langhe Nebbiolo', 'Langhe, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://www.pira-chiaraboschis.com/
  ('Pira & Figli — Chiara Boschis', 'Dolcetto d''Alba', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red')  -- https://www.pira-chiaraboschis.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BROVIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_langhe.sql)'
from (values
  ('Brovia', 'Barolo Rocche di Castiglione', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://binends.rarewineco.com/producer/brovia/
  ('Brovia', 'Barolo Villero', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://binends.rarewineco.com/producer/brovia/
  ('Brovia', 'Barolo Garblèt Sué', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://binends.rarewineco.com/producer/brovia/
  ('Brovia', 'Barolo Ca'' Mia', 'Barolo, Piedmont, Italy', 'Nebbiolo', 'Red'),  -- https://binends.rarewineco.com/producer/brovia/
  ('Brovia', 'Barbera d''Alba Sorì del Drago', 'Alba, Piedmont, Italy', 'Barbera', 'Red'),  -- https://binends.rarewineco.com/producer/brovia/
  ('Brovia', 'Dolcetto d''Alba Solatio', 'Alba, Piedmont, Italy', 'Dolcetto', 'Red')  -- https://binends.rarewineco.com/producer/brovia/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
