-- Producer ranges round 10: hungary. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- ROYAL TOKAJI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Royal Tokaji', 'Essencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Red Label Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Late Harvest', 'Tokaj, Hungary', null, 'Sweet'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Dry Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Gold Label Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Szt. Tamás 1st Growth Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Betsek 1st Growth Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Nyulászó 1st Growth Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Vineyard Selection Dry Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Mézes Mály Great 1st Growth Dry Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Uragya 1st Growth Dry Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Szt. Tamás 1st Growth Dry Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Mézes Mály Great 1st Growth Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://wilsondaniels.com/winery/royal-tokaji/
  ('Royal Tokaji', 'Blue Label Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', 'Furmint, Hárslevelű, Sárgamuskotály', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Royal Tokaji', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/royal-tokaji.html
  ('Royal Tokaji', 'Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/royal-tokaji.html
  ('Royal Tokaji', 'Tokaji Aszú Eszencia', 'Tokaj, Hungary', null, 'Sweet')  -- https://www.tokajneum.com/en/shop/manufacturer/royal-tokaji.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- OREMUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Oremus', 'Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', 'Furmint, Hárslevelű, Sárgamuskotály', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Oremus', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', 'Furmint, Hárslevelű, Sárgamuskotály', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Oremus', 'Tokaji Aszú 3 Puttonyos', 'Tokaj, Hungary', 'Furmint, Hárslevelű, Sárgamuskotály', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Oremus', 'Tokaji Eszencia', 'Tokaj, Hungary', 'Furmint, Hárslevelű, Sárgamuskotály', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Oremus', 'Tokaji Aszú Eszencia', 'Tokaj, Hungary', null, 'Sweet')  -- https://www.tokajneum.com/en/shop/manufacturer/oremus.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DISZNÓKŐ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Disznókő', 'Tokaji Édes Szamorodni', 'Tokaj, Hungary', 'Furmint, Hárslevelű, Sárgamuskotály', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Disznókő', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', 'Furmint, Hárslevelű, Zéta, Sárgamuskotály', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Disznókő', 'Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', 'Furmint', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Disznókő', 'Tokaji Aszú Eszencia', 'Tokaj, Hungary', null, 'Sweet')  -- https://www.tokajneum.com/en/shop/manufacturer/disznókö.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DERESZLA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Château Dereszla', 'Tokaji Eszencia', 'Tokaj, Hungary', 'Furmint, Hárslevelű', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Château Dereszla', 'Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', 'Furmint, Hárslevelű', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Château Dereszla', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', 'Furmint, Hárslevelű, Zéta, Sárgamuskotály', 'Sweet'),  -- https://vinissimus.com/en/wines/tokaji
  ('Château Dereszla', 'Dorombor Száraz', 'Tokaj, Hungary', 'Hárslevelű, Sárgamuskotály', 'White'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Tokaji Muskotály', 'Tokaj, Hungary', 'Muskotály', 'White'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Tokaji Hárslevelű', 'Tokaj, Hungary', 'Hárslevelű', 'White'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Tokaji Dry', 'Tokaj, Hungary', null, 'White'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Tokaji Kabar', 'Tokaj, Hungary', 'Kabar', 'Sweet'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Tokaji Szamorodni Száraz', 'Tokaj, Hungary', null, 'White'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Napos', 'Tokaj, Hungary', null, 'White'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Frisco', 'Tokaj, Hungary', 'Furmint, Hárslevelű', 'Sparkling'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Vintage Pezsgő', 'Tokaj, Hungary', null, 'Sparkling'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Prestige Réserve Pezsgő', 'Tokaj, Hungary', 'Furmint', 'Sparkling'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Dorombor Nem Száraz', 'Tokaj, Hungary', 'Hárslevelű, Sárgamuskotály', 'White'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Dorombor Nagyon Édes', 'Tokaj, Hungary', 'Furmint', 'Sweet'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Tokaji Furmint Késői Szüret', 'Tokaj, Hungary', 'Furmint', 'Sweet'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Tokaji Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Tokaji Szamorodni Édes', 'Tokaj, Hungary', null, 'Sweet'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Muskotály Reserve', 'Tokaj, Hungary', 'Muskotály', 'Sweet'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Furmint Reserve', 'Tokaj, Hungary', 'Furmint', 'Sweet'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Tokaji Aszúeszencia', 'Tokaj, Hungary', 'Furmint, Hárslevelű', 'Sweet'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Imperium Aszúeszencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://tokajbydereszla.com/boraink/
  ('Château Dereszla', 'Natúr Eszencia', 'Tokaj, Hungary', null, 'Sweet')  -- https://tokajbydereszla.com/boraink/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HÉTSZŐLŐ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Hétszőlő', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', 'Furmint', 'Sweet')  -- https://vinissimus.com/en/wines/tokaji
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOBOGÓ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Dobogó', 'Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://www.dobogo.hu/hu/boraink
  ('Dobogó', 'Betsek Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://www.dobogo.hu/hu/boraink
  ('Dobogó', 'Úrágya Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://www.dobogo.hu/hu/boraink
  ('Dobogó', 'Izabella Utca Pinot Noir', 'Tokaj, Hungary', 'Pinot Noir', 'Red'),  -- https://www.dobogo.hu/hu/boraink
  ('Dobogó', 'Édes Szamorodni', 'Tokaj, Hungary', 'Furmint', 'Sweet'),  -- https://www.dobogo.hu/hu/boraink
  ('Dobogó', 'Mylitta Késői Szüret', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.dobogo.hu/hu/boraink
  ('Dobogó', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.dobogo.hu/hu/boraink
  ('Dobogó', 'Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.dobogo.hu/hu/boraink
  ('Dobogó', 'Eszencia', 'Tokaj, Hungary', null, 'Sweet')  -- https://www.dobogo.hu/hu/boraink
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PATRICIUS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Patricius', 'Pezsgő Brut', 'Tokaj, Hungary', null, 'Sparkling'),  -- https://www.patricius.hu/hu/borok-webshop/szaraz-borok-pezsgo/
  ('Patricius', 'Giorgio Frizzante', 'Tokaj, Hungary', null, 'Sparkling'),  -- https://www.patricius.hu/hu/borok-webshop/szaraz-borok-pezsgo/
  ('Patricius', 'Tokaji Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://www.patricius.hu/hu/borok-webshop/szaraz-borok-pezsgo/
  ('Patricius', 'Tokaji Sárgamuskotály', 'Tokaj, Hungary', 'Sárgamuskotály', 'White'),  -- https://www.patricius.hu/hu/borok-webshop/szaraz-borok-pezsgo/
  ('Patricius', 'Tokaji Furmint Selection', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://www.patricius.hu/hu/borok-webshop/szaraz-borok-pezsgo/
  ('Patricius', 'Tokaji Furmint Profundum', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://www.patricius.hu/hu/borok-webshop/szaraz-borok-pezsgo/
  ('Patricius', 'Tokaji Sajgó Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://www.patricius.hu/hu/borok-webshop/szaraz-borok-pezsgo/
  ('Patricius', 'Tokaji Furmint Green Biobor', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://www.patricius.hu/hu/borok-webshop/szaraz-borok-pezsgo/
  ('Patricius', 'Tokaji Késői Szüret Katinka', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.patricius.hu/hu/borok-webshop/kesoi-szuret-szamorodni/
  ('Patricius', 'Édes Szamorodni Stilla Auera Tokaiensis', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.patricius.hu/hu/borok-webshop/kesoi-szuret-szamorodni/
  ('Patricius', 'Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.patricius.hu/hu/borok-webshop/aszu-borok/
  ('Patricius', 'Tokaji Aszú 6 Puttonyos Bendecz', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.patricius.hu/hu/borok-webshop/aszu-borok/
  ('Patricius', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.patricius.hu/hu/borok-webshop/aszu-borok/
  ('Patricius', 'Tokaji Eszencia', 'Tokaj, Hungary', null, 'Sweet')  -- https://www.patricius.hu/hu/borok-webshop/aszu-borok/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HOLDVÖLGY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Holdvölgy', 'Culture Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Aszú Útkeresés Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Intuition No7 Furmint Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', 'Furmint', 'Sweet'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Exaltation', 'Tokaj, Hungary', 'Sárgamuskotály', 'Sweet'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Signature', 'Tokaj, Hungary', null, 'Sweet'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Intuition No1 Zéta Szamorodni', 'Tokaj, Hungary', 'Zéta', 'Sweet'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Intuition No8 Fordítás', 'Tokaj, Hungary', null, 'Sweet'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Eloquence Édes Szamorodni', 'Tokaj, Hungary', null, 'Sweet'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Hold and Hollo Sweet', 'Tokaj, Hungary', null, 'Sweet'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Hold and Hollo Dry', 'Tokaj, Hungary', null, 'White'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Vision', 'Tokaj, Hungary', null, 'White'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Meditation Király Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Expression Becsek Hárslevelű', 'Tokaj, Hungary', 'Hárslevelű', 'White'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Intuition No2 Nyulászó Sárgamuskotály', 'Tokaj, Hungary', 'Sárgamuskotály', 'White'),  -- https://holdvolgy.com/shop/
  ('Holdvölgy', 'Intuition No3 Becsek Furmint', 'Tokaj, Hungary', 'Furmint', 'White')  -- https://holdvolgy.com/shop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ISTVÁN SZEPSY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('István Szepsy', 'Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Bohomáj Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Újhegy Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Király Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Danczka Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Nyulas Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Tokaji Essencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Tokaji Aszú Eszencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Király-hegy Tokaji Aszú Eszencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Danczka Tokaji Aszú Eszencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
  ('István Szepsy', 'Nyulas Tokaji Aszú Eszencia', 'Tokaj, Hungary', null, 'Sweet')  -- https://www.tokajneum.com/en/shop/manufacturer/szepsy-istván.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PAJZOS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Château Pajzos', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.tokajneum.com/en/shop/manufacturer/château-pajzos.html
  ('Château Pajzos', 'Tokaji Essencia', 'Tokaj, Hungary', null, 'Sweet')  -- https://www.tokajneum.com/en/shop/manufacturer/château-pajzos.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SAUSKA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Sauska', 'Furmint Birsalmás', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://shop.sauska.hu/index.php?route=product/list&keyword=furmint&description=0
  ('Sauska', 'Furmint Medve', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://shop.sauska.hu/index.php?route=product/list&keyword=furmint&description=0
  ('Sauska', 'Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://shop.sauska.hu/index.php?route=product/list&keyword=furmint&description=0
  ('Sauska', 'Furmint Brut', 'Tokaj, Hungary', 'Furmint', 'Sparkling'),  -- https://shop.sauska.hu/index.php?route=product/list&keyword=furmint&description=0
  ('Sauska', 'Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://shop.sauska.hu/index.php?route=filter&filter=category|26/A27|2
  ('Sauska', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://shop.sauska.hu/index.php?route=filter&filter=category|26/A27|2
  ('Sauska', 'Aszú Essencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://shop.sauska.hu/index.php?route=filter&filter=category|26/A27|2
  ('Sauska', 'Late Harvest Cuvée', 'Tokaj, Hungary', null, 'Sweet'),  -- https://shop.sauska.hu/index.php?route=filter&filter=category|26/A27|2
  ('Sauska', 'Villányi Franc', 'Villány, Hungary', 'Cabernet Franc', 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Cuvée 13', 'Villány, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Cabernet Sauvignon', 'Villány, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Kékfrankos', 'Villány, Hungary', 'Kékfrankos', 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Cuvée 7', 'Villány, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Kadarka', 'Villány, Hungary', 'Kadarka', 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Cuvée 11 Villány', 'Villány, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Cabernet Sauvignon Ördögárok Prémium', 'Villány, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Merlot Csukma', 'Villány, Hungary', 'Merlot', 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Rosé', 'Villány, Hungary', null, 'Rosé'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Syrah', 'Villány, Hungary', 'Syrah', 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Cuvée 5', 'Villány, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Villányi Franc Makár Prémium', 'Villány, Hungary', 'Cabernet Franc', 'Red'),  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
  ('Sauska', 'Cuvée 7 Siklós', 'Villány, Hungary', null, 'Red')  -- https://bortarsasag.hu/en/wine/sauska-villany?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DEMETER ZOLTÁN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Demeter Zoltán', 'Tokaji Aszú', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.demeterzoltan.hu/borvalasztek/aszu/
  ('Demeter Zoltán', 'Eszter Tokaji Szamorodni', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.demeterzoltan.hu/borvalasztek/edes-bor/
  ('Demeter Zoltán', 'Anett Tokaji Szamorodni', 'Tokaj, Hungary', null, 'Sweet'),  -- https://www.demeterzoltan.hu/borvalasztek/edes-bor/
  ('Demeter Zoltán', 'Tokaji Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://www.demeterzoltan.hu/borvalasztek/birtokbor/
  ('Demeter Zoltán', 'Tokaji Pezsgő Muscat', 'Tokaj, Hungary', 'Muscat', 'Sparkling'),  -- https://www.demeterzoltan.hu/borvalasztek/pezsgo/
  ('Demeter Zoltán', 'Rozé Pezsgő', 'Tokaj, Hungary', null, 'Sparkling'),  -- https://www.demeterzoltan.hu/borvalasztek/pezsgo/
  ('Demeter Zoltán', 'Tokaji Pezsgő Hárs', 'Tokaj, Hungary', null, 'Sparkling'),  -- https://www.demeterzoltan.hu/borvalasztek/pezsgo/
  ('Demeter Zoltán', 'Tokaji Pezsgő', 'Tokaj, Hungary', null, 'Sparkling')  -- https://www.demeterzoltan.hu/borvalasztek/pezsgo/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TOKAJ NOBILIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Tokaj Nobilis', 'Barakonyi Furmint Karós', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', 'Réserve Pezsgő', 'Tokaj, Hungary', null, 'Sparkling'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', 'Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', 'Barakonyi Furmint Bio', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', 'Barakonyi Hárslevelű Bio', 'Tokaj, Hungary', 'Hárslevelű', 'White'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', 'Furmint Száraz Bio', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', 'Kövérszőlő', 'Tokaj, Hungary', 'Kövérszőlő', 'White'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', 'Sárgamuskotály Bio', 'Tokaj, Hungary', 'Sárgamuskotály', 'White'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', '3 Grácia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', 'Pezsgő Brut Bio', 'Tokaj, Hungary', null, 'Sparkling'),  -- https://tokajnobilis.hu/borshop/
  ('Tokaj Nobilis', 'Brut Pezsgő', 'Tokaj, Hungary', null, 'Sparkling')  -- https://tokajnobilis.hu/borshop/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GRAND TOKAJ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Grand Tokaj', 'Terroir Selection Amforában Érlelt Tokaji Eszencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Eszencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Szarvas Aszú', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Édes Szamorodni', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Late Harvest', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Furmint Válogatás', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Szarvas Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Kővágó Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Pető Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Meszes Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Muscat Blanc', 'Tokaj, Hungary', 'Sárgamuskotály', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Terroir Selection Hárslevelű', 'Tokaj, Hungary', 'Hárslevelű', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Tokaji Aszú 6 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Tokaji Aszú 5 Puttonyos', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Szamorodni', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Fordítás', 'Tokaj, Hungary', null, 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Késői Szüret Hárslevelű', 'Tokaj, Hungary', 'Hárslevelű', 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Késői Szüret Furmint', 'Tokaj, Hungary', 'Furmint', 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Késői Szüret Sárgamuskotály', 'Tokaj, Hungary', 'Sárgamuskotály', 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Pillanat Gyöngyözőbor', 'Tokaj, Hungary', null, 'Sparkling'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Félédes Sárgamuskotály', 'Tokaj, Hungary', 'Sárgamuskotály', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Félédes Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Félédes Hárslevelű', 'Tokaj, Hungary', 'Hárslevelű', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Tokaji Cuvée Félédes', 'Tokaj, Hungary', 'Furmint, Sárgamuskotály, Hárslevelű', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Furmint Száraz', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Classic Selection Félszáraz Muscat Blanc', 'Tokaj, Hungary', 'Muscat Blanc', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Speak Easy Fall in Love Gyöngyözőbor Medium Dry', 'Tokaj, Hungary', 'Sárgamuskotály', 'Sparkling'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Speak Easy Sweet Like… Late Harvest', 'Tokaj, Hungary', 'Muskotály', 'Sweet'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Speak Easy Swing in Blue Sauvignon Blanc', 'Tokaj, Hungary', 'Sauvignon Blanc', 'White'),  -- https://grandtokaj.com/boraink/
  ('Grand Tokaj', 'Speak Easy What''s Next? Muscat Blanc Medium Dry', 'Tokaj, Hungary', 'Muscat Blanc', 'White')  -- https://grandtokaj.com/boraink/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PENDITS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Pendits', 'Tokaji Aszú Essencia', 'Tokaj, Hungary', null, 'Sweet'),  -- https://pendits.com/our-wines/
  ('Pendits', 'Holdvölgy Tokaji Aszú', 'Tokaj, Hungary', null, 'Sweet'),  -- https://pendits.com/our-wines/
  ('Pendits', 'Tokaji Aszú', 'Tokaj, Hungary', null, 'Sweet'),  -- https://pendits.com/our-wines/
  ('Pendits', 'Furmint Dry', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://pendits.com/our-wines/
  ('Pendits', 'Furmint Secco', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://pendits.com/our-wines/
  ('Pendits', 'Furmint', 'Tokaj, Hungary', 'Furmint', 'White'),  -- https://pendits.com/our-wines/
  ('Pendits', 'Muskotály', 'Tokaj, Hungary', 'Muskotály', 'White'),  -- https://pendits.com/our-wines/
  ('Pendits', 'Hárslevelű', 'Tokaj, Hungary', 'Hárslevelű', 'White'),  -- https://pendits.com/our-wines/
  ('Pendits', 'Tokaji Cuvée Kövérszőlő-Zéta', 'Tokaj, Hungary', 'Kövérszőlő, Zéta', 'Sweet')  -- https://pendits.com/our-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HILLTOP NESZMÉLY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Hilltop Neszmély', 'Irsai Olivér', 'Neszmély, Hungary', 'Irsai Olivér', 'White'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Chardonnay', 'Neszmély, Hungary', 'Chardonnay', 'White'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Cserszegi Fűszeres', 'Neszmély, Hungary', 'Cserszegi Fűszeres', 'White'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Merlot', 'Neszmély, Hungary', 'Merlot', 'Red'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Merlot Rosé', 'Neszmély, Hungary', 'Merlot', 'Rosé'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Olaszrizling', 'Neszmély, Hungary', 'Olaszrizling', 'White'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Pinot Noir Rosé', 'Neszmély, Hungary', 'Pinot Noir', 'Rosé'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Sauvignon Blanc', 'Neszmély, Hungary', 'Sauvignon Blanc', 'White'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Gyöngy', 'Neszmély, Hungary', null, 'Sparkling'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Irsai Cuvée', 'Neszmély, Hungary', null, 'White'),  -- https://www.hilltop.hu/en/wines
  ('Hilltop Neszmély', 'Rosé Cuvée', 'Neszmély, Hungary', null, 'Rosé')  -- https://www.hilltop.hu/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOCK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Bock', 'Fanni', 'Villány, Hungary', null, 'Sparkling'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Sauvignon Blanc', 'Villány, Hungary', 'Sauvignon Blanc', 'White'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Blanc', 'Villány, Hungary', null, 'White'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Olaszrizling', 'Villány, Hungary', 'Olaszrizling', 'White'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Hárslevelű', 'Villány, Hungary', 'Hárslevelű', 'White'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Chardonnay', 'Villány, Hungary', 'Chardonnay', 'White'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Batonnage', 'Villány, Hungary', null, 'White'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Édes Hárslevelű', 'Villány, Hungary', 'Hárslevelű', 'Sweet'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Late Harvest', 'Villány, Hungary', null, 'Sweet'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Rosé Cuvée', 'Villány, Hungary', null, 'Rosé'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Marcell Methode Traditionelle', 'Villány, Hungary', null, 'Sparkling'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Kadarka Siller', 'Villány, Hungary', 'Kadarka', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'PortaGéza', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Kékfrankos', 'Villány, Hungary', 'Kékfrankos', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Ermitage', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Kadarka', 'Villány, Hungary', 'Kadarka', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'BV Kadarka', 'Villány, Hungary', 'Kadarka', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Merlot', 'Villány, Hungary', 'Merlot', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Cabernet Sauvignon', 'Villány, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Cabernet Franc', 'Villány, Hungary', 'Cabernet Franc', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'BV KF', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Kékfrankos Selection', 'Villány, Hungary', 'Kékfrankos', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', '70+', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Petit Verdot', 'Villány, Hungary', 'Petit Verdot', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Royal Cuvée', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'BV Petite Malbec', 'Villány, Hungary', 'Petite Malbec', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'BV Cuvée', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'BV Grand True', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Malbec', 'Villány, Hungary', 'Malbec', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Cuvée', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Syrah', 'Villány, Hungary', 'Syrah', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'BV Syrah Extreme', 'Villány, Hungary', 'Syrah', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Cabernet Sauvignon Jammertál Selection', 'Villány, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Merlot Special Reserve', 'Villány, Hungary', 'Merlot', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Villányi Franc Fekete-hegy Selection', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Villányi Franc Essencia', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'BV Cabernet Sauvignon Selection', 'Villány, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Alta', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Libra', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Capella', 'Villány, Hungary', null, 'Red'),  -- https://pince.bock.hu/en/borok
  ('Bock', 'Magnifico', 'Villány, Hungary', null, 'Red')  -- https://pince.bock.hu/en/borok
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GERE ATTILA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Gere Attila', 'Rosé', 'Villány, Hungary', null, 'Rosé'),  -- https://bortarsasag.hu/en/wine/gere-attila?brandPage=true
  ('Gere Attila', 'Olaszrizling', 'Villány, Hungary', 'Olaszrizling', 'White'),  -- https://bortarsasag.hu/en/wine/gere-attila?brandPage=true
  ('Gere Attila', 'Syrah', 'Villány, Hungary', 'Syrah', 'Red'),  -- https://bortarsasag.hu/en/wine/gere-attila?brandPage=true
  ('Gere Attila', 'Cabernet Sauvignon', 'Villány, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://bortarsasag.hu/en/wine/gere-attila?brandPage=true
  ('Gere Attila', 'Solus Merlot', 'Villány, Hungary', 'Merlot', 'Red'),  -- https://bortarsasag.hu/en/wine/gere-attila?brandPage=true
  ('Gere Attila', 'Cabernet Sauvignon Barrique', 'Villány, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://bortarsasag.hu/en/wine/gere-attila?brandPage=true
  ('Gere Attila', 'Frici Gyöngyözőbor', 'Villány, Hungary', null, 'Sparkling'),  -- https://bortarsasag.hu/en/wine/gere-attila?brandPage=true
  ('Gere Attila', 'Rosé Frici Gyöngyözőbor', 'Villány, Hungary', null, 'Sparkling')  -- https://bortarsasag.hu/en/wine/gere-attila?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GÁL TIBOR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Gál Tibor', 'Pinot Noir', 'Eger, Hungary', 'Pinot Noir', 'Red'),  -- https://bortarsasag.hu/en/wine/gal-tibor?brandPage=true
  ('Gál Tibor', 'Kadarka', 'Eger, Hungary', 'Kadarka', 'Red'),  -- https://bortarsasag.hu/en/wine/gal-tibor?brandPage=true
  ('Gál Tibor', 'Labirintus Egri Bikavér Superior', 'Eger, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/gal-tibor?brandPage=true
  ('Gál Tibor', 'Pajados Egri Bikavér Grand Superior', 'Eger, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/gal-tibor?brandPage=true
  ('Gál Tibor', 'Egri Csillag', 'Eger, Hungary', null, 'White')  -- https://bortarsasag.hu/en/wine/gal-tibor?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HEIMANN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Heimann', 'Bátor Szekszárdi Bikavér', 'Szekszárd, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/heimann?brandPage=true
  ('Heimann', 'Merlot', 'Szekszárd, Hungary', 'Merlot', 'Red'),  -- https://bortarsasag.hu/en/wine/heimann?brandPage=true
  ('Heimann', 'Szekszárd Kadarka', 'Szekszárd, Hungary', 'Kadarka', 'Red'),  -- https://bortarsasag.hu/en/wine/heimann?brandPage=true
  ('Heimann', 'Kékfrankos', 'Szekszárd, Hungary', 'Kékfrankos', 'Red'),  -- https://bortarsasag.hu/en/wine/heimann?brandPage=true
  ('Heimann', 'Tiszta Beszéd Kékfrankos', 'Szekszárd, Hungary', 'Kékfrankos', 'Red'),  -- https://bortarsasag.hu/en/wine/heimann?brandPage=true
  ('Heimann', 'Tiszta Beszéd Sagrantino', 'Szekszárd, Hungary', 'Sagrantino', 'Red'),  -- https://bortarsasag.hu/en/wine/heimann?brandPage=true
  ('Heimann', 'Viognier', 'Szekszárd, Hungary', 'Viognier', 'White')  -- https://bortarsasag.hu/en/wine/heimann?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LAPOSA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Laposa', 'Illatos', 'Badacsony, Hungary', 'Irsai Olivér', 'White'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Friss', 'Badacsony, Hungary', 'Welschriesling', 'White'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Rosé', 'Badacsony, Hungary', 'Blaufränkisch', 'Rosé'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Kéknyelű', 'Badacsony, Hungary', 'Kéknyelű', 'White'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Furmint', 'Badacsony, Hungary', 'Furmint', 'White'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Juhfark', 'Badacsony, Hungary', 'Juhfark', 'White'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', '4Hegy', 'Badacsony, Hungary', 'Welschriesling', 'White'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Istenmeredekje', 'Badacsony, Hungary', 'Kéknyelű', 'White'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Kápolna', 'Badacsony, Hungary', 'Welschriesling', 'White'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Brut Nature', 'Badacsony, Hungary', 'Kéknyelű', 'Sparkling'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Brut', 'Badacsony, Hungary', 'Furmint', 'Sparkling'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Rosé Brut', 'Badacsony, Hungary', 'Blaufränkisch', 'Sparkling'),  -- https://www.laposa.hu/en/webshop-1
  ('Laposa', 'Extra Dry', 'Badacsony, Hungary', null, 'Sparkling')  -- https://www.laposa.hu/en/webshop-1
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- WENINGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Weninger', 'Kékfrankos', 'Sopron, Hungary', 'Kékfrankos', 'Red'),  -- https://weninger.com/de/products
  ('Weninger', 'Stein Furmint', 'Sopron, Hungary', 'Furmint', 'White'),  -- https://weninger.com/de/products
  ('Weninger', 'Steiner', 'Sopron, Hungary', 'Kékfrankos', 'Red'),  -- https://weninger.com/de/products
  ('Weninger', 'Fehérburgundi', 'Sopron, Hungary', 'Pinot Blanc', 'White'),  -- https://weninger.com/de/products
  ('Weninger', 'Régi iskola Cabernet Sauvignon', 'Sopron, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://weninger.com/de/products
  ('Weninger', 'Frettner', 'Sopron, Hungary', 'Cabernet Franc', 'Red'),  -- https://weninger.com/de/products
  ('Weninger', 'Rózsa Petsovits', 'Sopron, Hungary', 'Blaufränkisch', 'Rosé')  -- https://weninger.com/de/products
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KREINBACHER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Kreinbacher', 'Extra Dry', 'Somló, Hungary', null, 'Sparkling'),  -- https://www.kreinbacher.hu/our-sparkling-wines
  ('Kreinbacher', 'Prestige Brut', 'Somló, Hungary', null, 'Sparkling'),  -- https://www.kreinbacher.hu/our-sparkling-wines
  ('Kreinbacher', 'Rosé Brut', 'Somló, Hungary', null, 'Sparkling'),  -- https://www.kreinbacher.hu/our-sparkling-wines
  ('Kreinbacher', 'Brut Classic', 'Somló, Hungary', null, 'Sparkling'),  -- https://www.kreinbacher.hu/our-sparkling-wines
  ('Kreinbacher', 'Brut Nature', 'Somló, Hungary', null, 'Sparkling')  -- https://www.kreinbacher.hu/our-sparkling-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GILVESY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Gilvesy', 'Pixu Olaszrizling', 'Badacsony, Hungary', 'Olaszrizling', 'White'),  -- https://gilvesy.hu/en/
  ('Gilvesy', 'Pixu Furmint', 'Badacsony, Hungary', 'Furmint', 'White'),  -- https://gilvesy.hu/en/
  ('Gilvesy', 'Mogyorós Sauvignon Blanc', 'Badacsony, Hungary', 'Sauvignon Blanc', 'White'),  -- https://gilvesy.hu/en/
  ('Gilvesy', 'Brut Nature', 'Badacsony, Hungary', null, 'Sparkling'),  -- https://gilvesy.hu/en/
  ('Gilvesy', 'Terra I. & Terra III. Rajnai Rizling', 'Badacsony, Hungary', 'Rajnai Rizling', 'White')  -- https://gilvesy.hu/en/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ETYEKI KÚRIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Etyeki Kúria', 'Kúria White', 'Etyek-Buda, Hungary', null, 'White'),  -- https://kuriafamily.com/en
  ('Etyeki Kúria', 'Irsai Olivér', 'Etyek-Buda, Hungary', 'Irsai Olivér', 'White'),  -- https://kuriafamily.com/en
  ('Etyeki Kúria', 'Sauvignon Blanc', 'Etyek-Buda, Hungary', 'Sauvignon Blanc', 'White'),  -- https://kuriafamily.com/en
  ('Etyeki Kúria', 'Chardonnay', 'Etyek-Buda, Hungary', 'Chardonnay', 'White'),  -- https://kuriafamily.com/en
  ('Etyeki Kúria', 'Kúria Rosé', 'Etyek-Buda, Hungary', null, 'Rosé'),  -- https://kuriafamily.com/en
  ('Etyeki Kúria', 'Kúria Red', 'Etyek-Buda, Hungary', null, 'Red')  -- https://kuriafamily.com/en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FIGULA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Figula', 'Rosé Cuvée', 'Balaton, Hungary', null, 'Rosé'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Bella Róza Rosé Selection', 'Balaton, Hungary', null, 'Rosé'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Zenit&More', 'Balaton, Hungary', null, 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Olaszrizling', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', '7 Hektár', 'Balaton, Hungary', null, 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Sauvignon Blanc', 'Balaton, Hungary', 'Sauvignon Blanc', 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Sóskút Olaszrizling', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Száka Olaszrizling', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Bájoló', 'Balaton, Hungary', null, 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Zenit', 'Balaton, Hungary', null, 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Öreghegy Olaszrizling', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Erdőszéle Olaszrizling', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Baricska Olaszrizling', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Gella Olaszrizling', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Lukács', 'Balaton, Hungary', null, 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', '30', 'Balaton, Hungary', null, 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Köves', 'Balaton, Hungary', null, 'White'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Simply Red', 'Balaton, Hungary', null, 'Red'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Merlot "1950"', 'Balaton, Hungary', 'Merlot', 'Red'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Kékfrankos', 'Balaton, Hungary', 'Kékfrankos', 'Red'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Szűretlen Olaszrizling Pezsgő', 'Balaton, Hungary', 'Olaszrizling', 'Sparkling'),  -- https://www.figula.hu/borbolt
  ('Figula', 'Szűretlen Rozé Pezsgő', 'Balaton, Hungary', null, 'Sparkling')  -- https://www.figula.hu/borbolt
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GARAMVÁRI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Garamvári', 'Classic Brut', 'Hungary', null, 'Sparkling'),  -- https://www.garamvari.hu/
  ('Garamvári', 'Heritage Prestige Brut', 'Hungary', null, 'Sparkling'),  -- https://www.garamvari.hu/
  ('Garamvári', 'Furmint Brut', 'Hungary', 'Furmint', 'Sparkling'),  -- https://www.garamvari.hu/
  ('Garamvári', 'Prémium Sauvignon Blanc', 'Hungary', 'Sauvignon Blanc', 'White'),  -- https://www.garamvari.hu/
  ('Garamvári', 'Prémium Sínai Hegy Cabernet Sauvignon', 'Hungary', 'Cabernet Sauvignon', 'Red')  -- https://www.garamvari.hu/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VILLA TOLNAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Villa Tolnay', 'Furmint Riesling Méthode Traditionelle', 'Balaton, Hungary', 'Furmint, Riesling', 'Sparkling'),  -- https://villatolnay.hu/collection/
  ('Villa Tolnay', 'Cabernet Franc', 'Balaton, Hungary', 'Cabernet Franc', 'Red'),  -- https://villatolnay.hu/collection/
  ('Villa Tolnay', 'Rajnai Rizling Kapolna-Domb', 'Balaton, Hungary', 'Rajnai Rizling', 'White'),  -- https://villatolnay.hu/collection/
  ('Villa Tolnay', 'Grüner Veltliner', 'Balaton, Hungary', 'Grüner Veltliner', 'White'),  -- https://villatolnay.hu/collection/
  ('Villa Tolnay', 'Furmint Single Vineyard', 'Balaton, Hungary', 'Furmint', 'White'),  -- https://villatolnay.hu/collection/
  ('Villa Tolnay', 'Pinot Noir', 'Balaton, Hungary', 'Pinot Noir', 'Red'),  -- https://villatolnay.hu/collection/
  ('Villa Tolnay', 'Olaszrizling', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://villatolnay.hu/collection/
  ('Villa Tolnay', 'Rajnai Rizling', 'Balaton, Hungary', 'Rajnai Rizling', 'White'),  -- https://villatolnay.hu/collection/
  ('Villa Tolnay', 'HID3 Balaton Riesling-Furmint', 'Balaton, Hungary', 'Riesling, Furmint', 'White'),  -- https://villatolnay.hu/collection/
  ('Villa Tolnay', 'Sauvignon Blanc', 'Balaton, Hungary', 'Sauvignon Blanc', 'White')  -- https://villatolnay.hu/collection/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VÁLIBOR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Válibor', 'Budai Zöld Hagyományos Pezsgő', 'Badacsony, Hungary', 'Budai Zöld', 'Sparkling'),  -- https://www.valibor.hu/
  ('Válibor', 'Kéknyelű Amfóra Ágyús-dűlő', 'Badacsony, Hungary', 'Kéknyelű', 'White'),  -- https://www.valibor.hu/
  ('Válibor', 'Kéknyelű', 'Badacsony, Hungary', 'Kéknyelű', 'White'),  -- https://www.valibor.hu/
  ('Válibor', 'Budai Zöld', 'Badacsony, Hungary', 'Budai Zöld', 'White'),  -- https://www.valibor.hu/
  ('Válibor', 'Olaszrizling Válogatás', 'Badacsony, Hungary', 'Olaszrizling', 'White'),  -- https://www.valibor.hu/
  ('Válibor', 'Pinot Noir', 'Badacsony, Hungary', 'Pinot Noir', 'Red'),  -- https://www.valibor.hu/
  ('Válibor', 'Ágyús-dűlő Kéknyelű', 'Badacsony, Hungary', 'Kéknyelű', 'White'),  -- https://www.valibor.hu/
  ('Válibor', 'Szürkebarát', 'Badacsony, Hungary', 'Szürkebarát', 'White'),  -- https://www.valibor.hu/
  ('Válibor', 'Valiter Olaszrizling', 'Badacsony, Hungary', 'Olaszrizling', 'White'),  -- https://www.valibor.hu/
  ('Válibor', 'Pinot Noir - Kékfrankos - Syrah Rosé', 'Badacsony, Hungary', 'Pinot Noir, Kékfrankos, Syrah', 'Rosé'),  -- https://www.valibor.hu/
  ('Válibor', 'Syrah', 'Badacsony, Hungary', 'Syrah', 'Red'),  -- https://www.valibor.hu/
  ('Válibor', 'Ördögszikla Kékfrankos', 'Badacsony, Hungary', 'Kékfrankos', 'Red')  -- https://www.valibor.hu/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KOLONICS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Kolonics', 'Somlói Furmint', 'Somló, Hungary', 'Furmint', 'White'),  -- https://newsite.kolonicspinceszet.hu/
  ('Kolonics', 'Somlói Olaszrizling', 'Somló, Hungary', 'Olaszrizling', 'White'),  -- https://newsite.kolonicspinceszet.hu/
  ('Kolonics', 'Somlói Juhfark', 'Somló, Hungary', 'Juhfark', 'White')  -- https://newsite.kolonicspinceszet.hu/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TORNAI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Tornai', 'Narancsbor', 'Somló, Hungary', null, 'Orange'),  -- https://www.tornaipince.hu/
  ('Tornai', 'Selection Grófi Hárslevelű', 'Somló, Hungary', 'Hárslevelű', 'White'),  -- https://www.tornaipince.hu/
  ('Tornai', 'Prémium Furmint', 'Somló, Hungary', 'Furmint', 'White'),  -- https://www.tornaipince.hu/premium
  ('Tornai', 'Prémium Juhfark', 'Somló, Hungary', 'Juhfark', 'White'),  -- https://www.tornaipince.hu/premium
  ('Tornai', 'Prémium Sauvignon Blanc', 'Somló, Hungary', 'Sauvignon Blanc', 'White'),  -- https://www.tornaipince.hu/premium
  ('Tornai', 'Prémium Olaszrizling', 'Somló, Hungary', 'Olaszrizling', 'White'),  -- https://www.tornaipince.hu/premium
  ('Tornai', 'Prémium Hárslevelű', 'Somló, Hungary', 'Hárslevelű', 'White'),  -- https://www.tornaipince.hu/premium
  ('Tornai', 'Prémium Tramini', 'Somló, Hungary', 'Tramini', 'White'),  -- https://www.tornaipince.hu/premium
  ('Tornai', 'Birtok Olaszrizling', 'Somló, Hungary', 'Olaszrizling', 'White'),  -- https://www.tornaipince.hu/birtokborok
  ('Tornai', 'Birtok Irsai Olivér', 'Somló, Hungary', 'Irsai Olivér', 'White')  -- https://www.tornaipince.hu/birtokborok
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TASCHNER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Taschner', 'Pinot Noir (Meunier) Pezsgő', 'Sopron, Hungary', 'Pinot Noir, Meunier', 'Sparkling'),  -- https://www.taschner.hu/
  ('Taschner', 'Cabernet Sauvignon', 'Sopron, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://www.taschner.hu/
  ('Taschner', 'Irsai Olivér', 'Sopron, Hungary', 'Irsai Olivér', 'White')  -- https://www.taschner.hu/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HARASZTHY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Haraszthy', 'Sir Irsai', 'Etyek-Buda, Hungary', 'Irsai Olivér', 'White'),  -- https://www.haraszthy.hu/
  ('Haraszthy', 'Sauvignon Blanc', 'Etyek-Buda, Hungary', 'Sauvignon Blanc', 'White'),  -- https://www.haraszthy.hu/
  ('Haraszthy', 'Öreghegy Brut', 'Etyek-Buda, Hungary', 'Chardonnay', 'Sparkling'),  -- https://www.haraszthy.hu/
  ('Haraszthy', 'Rosé', 'Etyek-Buda, Hungary', 'Pinot Noir', 'Rosé')  -- https://www.haraszthy.hu/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ST. ANDREA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('St. Andrea', 'Agapé Nagy-Eged-hegy Bikavér', 'Eger, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/st-andrea-lorincz-gyorgy?brandPage=true
  ('St. Andrea', 'Hangács Bikavér', 'Eger, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/st-andrea-lorincz-gyorgy?brandPage=true
  ('St. Andrea', 'Nagy-Eged Bikavér Grand Superior', 'Eger, Hungary', null, 'Red')  -- https://bortarsasag.hu/en/wine/st-andrea-lorincz-gyorgy?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOLYKI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Bolyki', 'Rosé', 'Eger, Hungary', null, 'Rosé'),  -- https://bortarsasag.hu/en/wine/bolyki-janos?brandPage=true
  ('Bolyki', 'Egri Bikavér', 'Eger, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/bolyki-janos?brandPage=true
  ('Bolyki', 'Egri Csillag', 'Eger, Hungary', null, 'White'),  -- https://bortarsasag.hu/en/wine/bolyki-janos?brandPage=true
  ('Bolyki', 'Sauvignon Blanc', 'Eger, Hungary', 'Sauvignon Blanc', 'White'),  -- https://bortarsasag.hu/en/wine/bolyki-janos?brandPage=true
  ('Bolyki', 'Királyleányka', 'Eger, Hungary', 'Királyleányka', 'White'),  -- https://bortarsasag.hu/en/wine/bolyki-janos?brandPage=true
  ('Bolyki', 'és Bolyki Egri Bikavér', 'Eger, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/bolyki-janos?brandPage=true
  ('Bolyki', 'Cabernet Franc', 'Eger, Hungary', 'Cabernet Franc', 'Red')  -- https://bortarsasag.hu/en/wine/bolyki-janos?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIDA PÉTER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Vida Péter', 'Bonsai Öregtőkés Kadarka', 'Szekszárd, Hungary', 'Kadarka', 'Red'),  -- https://bortarsasag.hu/en/wine/vida-peter?brandPage=true
  ('Vida Péter', 'Hidaspetre Kékfrankos', 'Szekszárd, Hungary', 'Kékfrankos', 'Red'),  -- https://bortarsasag.hu/en/wine/vida-peter?brandPage=true
  ('Vida Péter', 'Petit Bonsai Kadarka', 'Szekszárd, Hungary', 'Kadarka', 'Red'),  -- https://bortarsasag.hu/en/wine/vida-peter?brandPage=true
  ('Vida Péter', 'Lösz Cuvée', 'Szekszárd, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/vida-peter?brandPage=true
  ('Vida Péter', 'La Vida Cuvée', 'Szekszárd, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/vida-peter?brandPage=true
  ('Vida Péter', 'Idyll Bikavér', 'Szekszárd, Hungary', null, 'Red')  -- https://bortarsasag.hu/en/wine/vida-peter?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SEBESTYÉN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Sebestyén', 'Porkoláb-völgyi Bikavér', 'Szekszárd, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/sebestyen-csaba?brandPage=true
  ('Sebestyén', 'Iván-völgyi Bikavér', 'Szekszárd, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/sebestyen-csaba?brandPage=true
  ('Sebestyén', 'Rosé', 'Szekszárd, Hungary', null, 'Rosé'),  -- https://bortarsasag.hu/en/wine/sebestyen-csaba?brandPage=true
  ('Sebestyén', 'Indigó Zweigelt', 'Szekszárd, Hungary', 'Zweigelt', 'Red'),  -- https://bortarsasag.hu/en/wine/sebestyen-csaba?brandPage=true
  ('Sebestyén', 'Szél Rosé Cuvée', 'Szekszárd, Hungary', null, 'Rosé'),  -- https://bortarsasag.hu/en/wine/sebestyen-csaba?brandPage=true
  ('Sebestyén', 'Görögszói Cuvée', 'Szekszárd, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/sebestyen-csaba?brandPage=true
  ('Sebestyén', 'Kadarka', 'Szekszárd, Hungary', 'Kadarka', 'Red')  -- https://bortarsasag.hu/en/wine/sebestyen-csaba?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JÁSDI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Jásdi', 'Csopaki Olaszrizling Hegybor', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://bortarsasag.hu/en/wine/jasdi-pince?brandPage=true
  ('Jásdi', 'Rosé', 'Balaton, Hungary', null, 'Rosé'),  -- https://bortarsasag.hu/en/wine/jasdi-pince?brandPage=true
  ('Jásdi', 'Siralomvágó Olaszrizling', 'Balaton, Hungary', 'Olaszrizling', 'White'),  -- https://bortarsasag.hu/en/wine/jasdi-pince?brandPage=true
  ('Jásdi', 'Nagykúti Chardonnay', 'Balaton, Hungary', 'Chardonnay', 'White'),  -- https://bortarsasag.hu/en/wine/jasdi-pince?brandPage=true
  ('Jásdi', 'Kékfrankos', 'Balaton, Hungary', 'Kékfrankos', 'Red')  -- https://bortarsasag.hu/en/wine/jasdi-pince?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KONYÁRI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Konyári', 'Loliense Vörös', 'Balaton, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/konyari-pinceszet?brandPage=true
  ('Konyári', 'Loliense Fehér', 'Balaton, Hungary', null, 'White'),  -- https://bortarsasag.hu/en/wine/konyari-pinceszet?brandPage=true
  ('Konyári', 'Fecske Vörös', 'Balaton, Hungary', null, 'Red'),  -- https://bortarsasag.hu/en/wine/konyari-pinceszet?brandPage=true
  ('Konyári', 'Kishegy', 'Balaton, Hungary', 'Cabernet Sauvignon, Merlot', 'Red')  -- https://bortarsasag.hu/en/wine/konyari-pinceszet?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LUKA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Luka', 'Cabernet Sauvignon', 'Sopron, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://bortarsasag.hu/en/wine/luka-pinceszet?brandPage=true
  ('Luka', 'Zweigelt', 'Sopron, Hungary', 'Zweigelt', 'Red')  -- https://bortarsasag.hu/en/wine/luka-pinceszet?brandPage=true
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THUMMERER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Thummerer', 'Vili Papa Cuvée Superior', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Evoé Cuvée', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Bikavér Grand Superior Nagy-Eged dűlő', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Bikavér Grand Superior Mezey-Öreg dűlő', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Tekenőháti Merlot Superior', 'Eger, Hungary', 'Merlot', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Kékfrankos Superior Válogatás', 'Eger, Hungary', 'Kékfrankos', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Cabernet Sauvignon Superior Selection', 'Eger, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Syrah Superior Selection', 'Eger, Hungary', 'Syrah', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Cabernet Franc Superior Selection', 'Eger, Hungary', 'Cabernet Franc', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Rébus Cuvée Superior', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Tekenőháti Pinot Noir Grand Superior', 'Eger, Hungary', 'Pinot Noir', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Kadarka Grand Superior', 'Eger, Hungary', 'Kadarka', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Bikavér Superior', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Merlot Superior', 'Eger, Hungary', 'Merlot', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Kékfrankos Superior', 'Eger, Hungary', 'Kékfrankos', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Syrah Superior', 'Eger, Hungary', 'Syrah', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Bikavér', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Cabernet Sauvignon Superior', 'Eger, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Tréfli Cuvée', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Cabernet Franc – Merlot', 'Eger, Hungary', 'Cabernet Franc, Merlot', 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Bertram Cuvée', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Terra Eger Red Cuvée', 'Eger, Hungary', null, 'Red'),  -- https://thummerer.hu/en/wines/?kategoria=vorosborok
  ('Thummerer', 'Egri Csillag Superior', 'Eger, Hungary', null, 'White'),  -- https://thummerer.hu/en/wines/?kategoria=feherborok
  ('Thummerer', 'Egri Chardonnay Batonnage', 'Eger, Hungary', 'Chardonnay', 'White'),  -- https://thummerer.hu/en/wines/?kategoria=feherborok
  ('Thummerer', 'Egri Muskotály', 'Eger, Hungary', 'Muskotály', 'White'),  -- https://thummerer.hu/en/wines/?kategoria=feherborok
  ('Thummerer', 'Királyleányka', 'Eger, Hungary', 'Királyleányka', 'White'),  -- https://thummerer.hu/en/wines/?kategoria=feherborok
  ('Thummerer', 'Egri Csillag', 'Eger, Hungary', null, 'White'),  -- https://thummerer.hu/en/wines/?kategoria=feherborok
  ('Thummerer', 'Terra Egri White Cuvée', 'Eger, Hungary', null, 'White')  -- https://thummerer.hu/en/wines/?kategoria=feherborok
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VYLYAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Vylyan', 'Kékfrankos', 'Villány, Hungary', 'Kékfrankos', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/premium-line/
  ('Vylyan', 'Montenuovo Cuvée', 'Villány, Hungary', 'Cabernet Franc, Syrah, Merlot', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/premium-line/
  ('Vylyan', 'Cabernet Sauvignon', 'Villány, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/premium-line/
  ('Vylyan', 'Merlot', 'Villány, Hungary', 'Merlot', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/premium-line/
  ('Vylyan', 'Villányi Franc', 'Villány, Hungary', 'Cabernet Franc', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/premium-line/
  ('Vylyan', 'Syrah', 'Villány, Hungary', 'Syrah', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/premium-line/
  ('Vylyan', 'Boszorkány White Cuvée', 'Villány, Hungary', 'Olaszrizling, Rajnai Rizling, Chardonnay', 'White'),  -- https://www.vylyan.hu/en/estate/wines/classicus-wines/
  ('Vylyan', 'Kakas Rosé', 'Villány, Hungary', 'Pinot Noir, Merlot', 'Rosé'),  -- https://www.vylyan.hu/en/estate/wines/classicus-wines/
  ('Vylyan', 'Macska Portugieser', 'Villány, Hungary', 'Portugieser', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/classicus-wines/
  ('Vylyan', 'Herka Chardonnay', 'Villány, Hungary', 'Chardonnay', 'White'),  -- https://www.vylyan.hu/en/estate/wines/classicus-wines/
  ('Vylyan', 'Belzebub Cuvée', 'Villány, Hungary', 'Merlot, Cabernet Sauvignon, Kékfrankos, Syrah, Cabernet Franc, Zweigelt', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/classicus-wines/
  ('Vylyan', 'Pillangó', 'Villány, Hungary', 'Merlot', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/selection-line/
  ('Vylyan', 'Mandulás', 'Villány, Hungary', 'Cabernet Franc', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/selection-line/
  ('Vylyan', 'Duennium', 'Villány, Hungary', 'Cabernet Franc, Merlot', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/selection-line/
  ('Vylyan', 'Csóka Variáció', 'Villány, Hungary', 'Csókaszőlő', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/variation-wines/
  ('Vylyan', 'Vörös Variáció', 'Villány, Hungary', 'Cabernet Franc, Csókaszőlő, Kékfrankos, Syrah', 'Red'),  -- https://www.vylyan.hu/en/estate/wines/variation-wines/
  ('Vylyan', 'Rozé Variáció', 'Villány, Hungary', null, 'Rosé')  -- https://www.vylyan.hu/en/estate/wines/variation-wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRITTMANN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Frittmann', 'Olaszrizling', 'Hungary', 'Olaszrizling', 'White'),  -- https://www.frittmann.hu/termek/olaszrizling/
  ('Frittmann', 'Cabernet Franc', 'Hungary', 'Cabernet Franc', 'Red'),  -- https://www.frittmann.hu/termek/cabernet-franc/
  ('Frittmann', 'Irsai Olivér Selection', 'Hungary', 'Irsai Olivér', 'White'),  -- https://www.frittmann.hu/termek/irsai-oliver-selection/
  ('Frittmann', 'Portugieser', 'Hungary', 'Portugieser', 'Red'),  -- https://www.frittmann.hu/termek/portugieser/
  ('Frittmann', 'Rajnai Rizling', 'Hungary', 'Rajnai Rizling', 'White'),  -- https://www.frittmann.hu/termek/rajnai-rizling/
  ('Frittmann', 'Rosé Selection', 'Hungary', null, 'Rosé'),  -- https://www.frittmann.hu/termek/rose-selection/
  ('Frittmann', 'Kékfrankos', 'Hungary', 'Kékfrankos', 'Red'),  -- https://www.frittmann.hu/termek/kekfrankos/
  ('Frittmann', 'Rosé Cuvée', 'Hungary', null, 'Rosé'),  -- https://www.frittmann.hu/termek/rose-cuvee/
  ('Frittmann', 'Sauvignon Blanc', 'Hungary', 'Sauvignon Blanc', 'White'),  -- https://www.frittmann.hu/termek/sauvignon-blanc/
  ('Frittmann', 'Irsai Olivér', 'Hungary', 'Irsai Olivér', 'White'),  -- https://www.frittmann.hu/termek/irsai-oliver/
  ('Frittmann', 'Ezerjó Pezsgő', 'Hungary', 'Ezerjó', 'Sparkling'),  -- https://www.frittmann.hu/termek/ezerjo-pezsgo/
  ('Frittmann', 'Ezerjó', 'Hungary', 'Ezerjó', 'White'),  -- https://www.frittmann.hu/termek/ezerjo/
  ('Frittmann', 'Ezerjó Selection', 'Hungary', 'Ezerjó', 'White'),  -- https://www.frittmann.hu/termek/ezerjo-selection/
  ('Frittmann', 'Cserszegi Fűszeres', 'Hungary', 'Cserszegi Fűszeres', 'White'),  -- https://www.frittmann.hu/termek/cserszegi-fuszeres/
  ('Frittmann', 'Cabernet Franc Selection', 'Hungary', 'Cabernet Franc', 'Red'),  -- https://www.frittmann.hu/termek/cabernet-franc-selection/
  ('Frittmann', 'Cabernet Sauvignon-Franc Selection', 'Hungary', 'Cabernet Sauvignon, Cabernet Franc', 'Red'),  -- https://www.frittmann.hu/termek/cabernet-sauvignon-franc-selection/
  ('Frittmann', 'Kadarka Selection', 'Hungary', 'Kadarka', 'Red'),  -- https://www.frittmann.hu/termek/kadarka-selection/
  ('Frittmann', 'Chardonnay', 'Hungary', 'Chardonnay', 'White'),  -- https://www.frittmann.hu/termek/chardonnay/
  ('Frittmann', 'Kékfrankos Rosé', 'Hungary', 'Kékfrankos', 'Rosé')  -- https://www.frittmann.hu/termek/kekfrankos-rose/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TIFFÁN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r10_hungary.sql)'
from (values
  ('Tiffán', 'Olaszrizling', 'Villány, Hungary', 'Olaszrizling', 'White'),  -- https://www.tiffan.hu/hu/borok
  ('Tiffán', 'Villányi Rosé Cuvée', 'Villány, Hungary', null, 'Rosé'),  -- https://www.tiffan.hu/hu/borok
  ('Tiffán', 'Villányi Portugieser', 'Villány, Hungary', 'Portugieser', 'Red'),  -- https://www.tiffan.hu/hu/borok
  ('Tiffán', 'Villányi Kékfrankos', 'Villány, Hungary', 'Kékfrankos', 'Red'),  -- https://www.tiffan.hu/hu/borok
  ('Tiffán', 'Villányi Merlot', 'Villány, Hungary', 'Merlot', 'Red'),  -- https://www.tiffan.hu/hu/borok
  ('Tiffán', 'Limité Villányi Cabernet Sauvignon', 'Villány, Hungary', 'Cabernet Sauvignon', 'Red'),  -- https://www.tiffan.hu/hu/borok
  ('Tiffán', 'Limité Villányi Franc', 'Villány, Hungary', 'Cabernet Franc', 'Red')  -- https://www.tiffan.hu/hu/borok
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
