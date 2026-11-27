-- Producer ranges round 4: Lebanon. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- CHÂTEAU MUSAR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Musar', 'Red', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Carignan, Cinsault', 'Red'),  -- https://chateaumusar.com/wines/chateau-musar-red-2/
  ('Château Musar', 'White', 'Lebanon', 'Obaideh, Merwah', 'White'),  -- https://chateaumusar.com/wines/chateau-musar-white-2/
  ('Château Musar', 'Rosé', 'Lebanon', null, 'Rosé'),  -- https://www.chateaumusar.com/wines
  ('Château Musar', 'Hochar Père et Fils Red', 'Bekaa Valley, Lebanon', 'Cinsault, Grenache, Cabernet Sauvignon', 'Red'),  -- https://chateaumusar.com/wines/hochar-pere-et-fils-red/
  ('Château Musar', 'Levantine de Musar', 'Lebanon', 'Cinsault, Tempranillo, Cabernet Sauvignon', 'Red'),  -- https://chateaumusar.com/wines/levantine-de-musar/
  ('Château Musar', 'Musar Jeune Red', 'Lebanon', null, 'Red'),  -- https://www.chateaumusar.com/wines
  ('Château Musar', 'Musar Jeune White', 'Lebanon', null, 'White'),  -- https://www.chateaumusar.com/wines
  ('Château Musar', 'Musar Jeune Rosé', 'Lebanon', 'Cinsault, Mourvèdre', 'Rosé')  -- https://chateaumusar.com/wines/musar-jeune-rose/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU KSARA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Ksara', 'Blanc de l''Observatoire', 'Bekaa Valley, Lebanon', 'Sauvignon Blanc, Clairette, Muscat', 'White'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Blanc de Blancs', 'Bekaa Valley, Lebanon', 'Sauvignon Blanc, Sémillon, Chardonnay', 'White'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Merwah', 'Bekaa Valley, Lebanon', 'Merwah', 'White'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Chardonnay Cuvée du Pape', 'Bekaa Valley, Lebanon', 'Chardonnay', 'White'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Sunset', 'Bekaa Valley, Lebanon', 'Cabernet Franc, Syrah', 'Rosé'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Gris de Gris', 'Bekaa Valley, Lebanon', 'Grenache Gris, Carignan', 'Rosé'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Le Prieuré', 'Bekaa Valley, Lebanon', 'Cinsault, Carignan, Mourvèdre, Caladoc', 'Red'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Réserve du Couvent', 'Bekaa Valley, Lebanon', 'Syrah, Cabernet Franc, Malbec', 'Red'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Cuvée de Printemps', 'Bekaa Valley, Lebanon', 'Gamay, Tempranillo', 'Red'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Carignan', 'Bekaa Valley, Lebanon', 'Carignan', 'Red'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Château Rouge', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Merlot, Petit Verdot', 'Red'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Cuvée du Troisième Millénaire', 'Bekaa Valley, Lebanon', 'Petit Verdot, Cabernet Franc, Syrah', 'Red'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Le Souverain', 'Bekaa Valley, Lebanon', 'Arinarnoa, Marselan', 'Red'),  -- https://europe.chateauksara.com/
  ('Château Ksara', 'Cabernet Sauvignon', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon', 'Red')  -- https://libanonweine.de/product-category/redwine/?lang=en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU KEFRAYA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Kefraya', 'Rouge', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Syrah, Cabernet Franc', 'Red'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Amphora', 'Bekaa Valley, Lebanon', 'Cinsault, Syrah, Carignan, Tempranillo', 'Red'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Millesima', 'Bekaa Valley, Lebanon', 'Syrah, Cabernet Sauvignon, Cabernet Franc, Carignan', 'Red'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Phoenician Gate', 'Bekaa Valley, Lebanon', 'Syrah, Obeidi', 'Red'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Coteaux', 'Bekaa Valley, Lebanon', 'Syrah, Cabernet Franc, Marselan', 'Red'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Les Bretèches Rouge', 'Bekaa Valley, Lebanon', 'Cinsault, Syrah, Cabernet Sauvignon', 'Red'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Adéenne Rouge', 'Bekaa Valley, Lebanon', 'Assouad Karech, Asmi Noir', 'Red'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Comte de M', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Blanc', 'Bekaa Valley, Lebanon', 'Chardonnay, Vermentino', 'White'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Adéenne Blanc', 'Bekaa Valley, Lebanon', 'Obeidi, Merwah, Mekssessé', 'White'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Blanc de Blancs', 'Bekaa Valley, Lebanon', 'Viognier, Muscat', 'White'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Blanc de Blancs Ice Edition', 'Bekaa Valley, Lebanon', null, 'White'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Les Bretèches Blanc', 'Bekaa Valley, Lebanon', 'Sauvignon Blanc, Viognier', 'White'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Comtesse de M', 'Bekaa Valley, Lebanon', 'Chardonnay, Viognier', 'White'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Rosé', 'Bekaa Valley, Lebanon', 'Syrah, Tempranillo, Grenache', 'Rosé'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Myst', 'Bekaa Valley, Lebanon', 'Grenache, Syrah', 'Rosé'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Les Bretèches Rosé', 'Bekaa Valley, Lebanon', 'Syrah, Grenache, Cinsault', 'Rosé'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Lacrima d''Oro', 'Bekaa Valley, Lebanon', 'Clairette', 'Sweet'),  -- https://www.chateaukefraya.com/en/kefraya
  ('Château Kefraya', 'Nectar de Kefraya', 'Bekaa Valley, Lebanon', 'Sauvignon Blanc', 'Sweet')  -- https://www.chateaukefraya.com/en/kefraya
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MASSAYA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Massaya', 'Rosé', 'Bekaa Valley, Lebanon', 'Cinsault', 'Rosé'),  -- https://www.massaya.com/english/shop/lebanon?pid=210
  ('Massaya', 'Blanc', 'Bekaa Valley, Lebanon', null, 'White'),  -- https://www.massaya.com/english/wines-and-arak/wines
  ('Massaya', 'Terrasses de Baalbeck', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://www.massaya.com/english/wines-and-arak/wines
  ('Massaya', 'Cap Est', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://www.massaya.com/english/wines-and-arak/wines
  ('Massaya', 'Gold Reserve', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Syrah, Mourvèdre', 'Red')  -- https://www.massaya.com/english/shop/lebanon?pid=210
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- IXSIR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Ixsir', 'Grande Réserve White', 'Batroun, Lebanon', 'Viognier, Sauvignon Blanc, Chardonnay', 'White'),  -- https://www.enotria.com/news/producer-profile-ixsir2
  ('Ixsir', 'Grande Réserve Rosé', 'Batroun, Lebanon', 'Mourvèdre, Cinsault, Syrah', 'Rosé'),  -- https://www.enotria.com/news/producer-profile-ixsir2
  ('Ixsir', 'Altitudes Red', 'Batroun, Lebanon', 'Cabernet Sauvignon, Syrah, Caladoc, Tempranillo', 'Red'),  -- https://www.enotria.com/news/producer-profile-ixsir2
  ('Ixsir', 'Altitudes White', 'Batroun, Lebanon', 'Muscat, Obaideh, Viognier', 'White'),  -- https://www.enotria.com/products/ixsir-altitudes-white-2025-75cl-14
  ('Ixsir', 'Grande Réserve Red', 'Batroun, Lebanon', 'Syrah, Cabernet Sauvignon, Arinarnoa', 'Red'),  -- https://www.enotria.com/products/ixsir-grande-reserve-red-2017
  ('Ixsir', 'El Ixsir Red', 'Batroun, Lebanon', null, 'Red'),  -- https://ixsir.com/our-wines/el-ixsir/
  ('Ixsir', 'El Ixsir White', 'Batroun, Lebanon', null, 'White'),  -- https://ixsir.com/our-wines/el-ixsir/
  ('Ixsir', 'Altitudes Rosé', 'Batroun, Lebanon', null, 'Rosé')  -- https://libanonweine.de/product-category/rosewine/?lang=en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES TOURELLES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Domaine des Tourelles', 'Vieilles Vignes Cinsault', 'Bekaa Valley, Lebanon', 'Cinsault', 'Red'),  -- https://www.europeancellars.com/wine/vieilles-vignes-cinsault/
  ('Domaine des Tourelles', 'Bekaa Blanc', 'Bekaa Valley, Lebanon', 'Viognier, Chardonnay, Obeidi, Muscat', 'White'),  -- https://www.europeancellars.com/wine/vieilles-vignes-cinsault/
  ('Domaine des Tourelles', 'Bekaa Rosé', 'Bekaa Valley, Lebanon', 'Cinsault, Syrah, Tempranillo', 'Rosé'),  -- https://www.europeancellars.com/wine/vieilles-vignes-cinsault/
  ('Domaine des Tourelles', 'Bekaa Rouge', 'Bekaa Valley, Lebanon', 'Syrah, Cabernet Sauvignon, Cinsault, Carignan', 'Red'),  -- https://www.europeancellars.com/wine/vieilles-vignes-cinsault/
  ('Domaine des Tourelles', 'Vieilles Vignes Merweh & Obeidi', 'Bekaa Valley, Lebanon', 'Merwah, Obeidi', 'White'),  -- https://www.europeancellars.com/wine/vieilles-vignes-cinsault/
  ('Domaine des Tourelles', 'Vieilles Vignes Carignan', 'Bekaa Valley, Lebanon', 'Carignan', 'Red'),  -- https://www.europeancellars.com/wine/vieilles-vignes-cinsault/
  ('Domaine des Tourelles', 'Marquis des Beys', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://www.decanter.com/wine-reviews/lebanon/bekaa-valley/domaine-des-tourelles-marquis-des-beys-bekaa-valley-lebanon-2020-114978/
  ('Domaine des Tourelles', 'Grande Cuvée Pierre Brun', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://www.decanter.com/wine-reviews/lebanon/bekaa-valley/domaine-des-tourelles-grande-cuvee-pierre-brun-2015-63201/
  ('Domaine des Tourelles', 'Marquis des Beys White', 'Bekaa Valley, Lebanon', 'Chardonnay', 'White'),  -- https://domainedestourelles.com/pages/premium-wines
  ('Domaine des Tourelles', 'Syrah du Liban', 'Bekaa Valley, Lebanon', 'Syrah', 'Red'),  -- https://domainedestourelles.com/pages/premium-wines
  ('Domaine des Tourelles', 'Skin Wine', 'Bekaa Valley, Lebanon', 'Merwah', 'Orange'),  -- https://domainedestourelles.com/pages/old-vine-collection
  ('Domaine des Tourelles', 'Pink Kiss Rosé', 'Bekaa Valley, Lebanon', 'Syrah, Cinsault', 'Rosé')  -- https://domainedestourelles.com/pages/pink-kiss
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE BAAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Domaine de Baal', 'Red', 'Bekaa Valley, Lebanon', 'Cabernet Franc, Syrah, Cabernet Sauvignon', 'Red'),  -- https://www.domainedebaal.com/
  ('Domaine de Baal', 'White', 'Bekaa Valley, Lebanon', 'Chardonnay, Sauvignon Blanc', 'White'),  -- https://www.domainedebaal.com/
  ('Domaine de Baal', 'Le Petit Baal Red', 'Bekaa Valley, Lebanon', 'Syrah, Cinsault', 'Red')  -- https://www.domainedebaal.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU ST THOMAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château St Thomas', 'Les Émirs', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/?lang=en
  ('Château St Thomas', 'Les Gourmets Rouge', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/?lang=en
  ('Château St Thomas', 'Le Château', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/?lang=en
  ('Château St Thomas', 'Pinot Noir', 'Bekaa Valley, Lebanon', 'Pinot Noir', 'Red'),  -- https://libanonweine.de/product-category/redwine/?lang=en
  ('Château St Thomas', 'Le Merlot A', 'Bekaa Valley, Lebanon', 'Merlot', 'Red'),  -- https://libanonweine.de/product-category/redwine/page/3/?lang=en
  ('Château St Thomas', 'Les Gourmets Blanc', 'Bekaa Valley, Lebanon', null, 'White'),  -- https://libanonweine.de/product-category/whitewine/?lang=en
  ('Château St Thomas', 'Obeidy', 'Bekaa Valley, Lebanon', 'Obeidy', 'White'),  -- https://libanonweine.de/product-category/whitewine/?lang=en
  ('Château St Thomas', 'Chardonnay', 'Bekaa Valley, Lebanon', 'Chardonnay', 'White'),  -- https://libanonweine.de/product-category/whitewine/?lang=en
  ('Château St Thomas', 'Les Gourmets Rosé', 'Bekaa Valley, Lebanon', null, 'Rosé'),  -- https://libanonweine.de/product-category/rosewine/?lang=en
  ('Château St Thomas', 'Noor El Ain', 'Bekaa Valley, Lebanon', null, 'Rosé')  -- https://libanonweine.de/product-category/rosewine/?lang=en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ADYAR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Adyar', 'Expression Monastique', 'Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/?lang=en
  ('Adyar', 'Sangiovese', 'Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/?lang=en
  ('Adyar', 'Monastère de Kfifan', 'Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/2/?lang=en
  ('Adyar', 'Monastère de Rechmaya', 'Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/3/?lang=en
  ('Adyar', 'Monastère de Mar Moussa', 'Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/3/?lang=en
  ('Adyar', 'Monastère de Qobbay', 'Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/3/?lang=en
  ('Adyar', 'Inspiration', 'Lebanon', null, 'White'),  -- https://www.gilbertgaillard.com/en/resultats/batroun?page=2
  ('Adyar', 'L''Aube', 'Mount Lebanon, Lebanon', null, 'Rosé')  -- https://www.gilbertgaillard.com/en/resultats/mont-liban
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU HÉRITAGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Héritage', 'Château Rouge', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/?lang=en
  ('Château Héritage', 'Family Reserve', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/2/?lang=en
  ('Château Héritage', 'Sparkling Brut', 'Bekaa Valley, Lebanon', null, 'Sparkling'),  -- https://libanonweine.de/product-category/whitewine/?lang=en
  ('Château Héritage', 'Blanc de Blancs', 'Bekaa Valley, Lebanon', null, 'White'),  -- https://libanonweine.de/chateau-heritage/?lang=en
  ('Château Héritage', 'Fusion', 'West Bekaa, Lebanon', null, 'Red')  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=4
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE RMEICH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Domaine de Rmeich', 'Château Chammas', 'South Lebanon, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/2/?lang=en
  ('Domaine de Rmeich', 'Syrah', 'South Lebanon, Lebanon', 'Syrah', 'Red'),  -- https://libanonweine.de/product-category/redwine/page/3/?lang=en
  ('Domaine de Rmeich', 'Rmeich Rouge', 'South Lebanon, Lebanon', null, 'Red'),  -- https://libanonweine.de/domaine-de-rmeich/?lang=en
  ('Domaine de Rmeich', 'Rmeich Blanc', 'South Lebanon, Lebanon', null, 'White')  -- https://libanonweine.de/domaine-de-rmeich/?lang=en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE WARDY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Domaine Wardy', 'Beqaa Valley Red', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/2/?lang=en
  ('Domaine Wardy', 'Beqaa Valley White', 'Bekaa Valley, Lebanon', null, 'White'),  -- https://libanonweine.de/product-category/whitewine/?lang=en
  ('Domaine Wardy', 'Beqaa Valley Rosé', 'Bekaa Valley, Lebanon', null, 'Rosé'),  -- https://libanonweine.de/product-category/rosewine/?lang=en
  ('Domaine Wardy', 'Syrah', 'Bekaa Valley, Lebanon', 'Syrah', 'Red'),  -- https://libanonweine.de/product-category/redwine/page/2/?lang=en
  ('Domaine Wardy', 'Cabernet Sauvignon', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon', 'Red'),  -- https://libanonweine.de/product-category/redwine/page/3/?lang=en
  ('Domaine Wardy', 'Château Les Cèdres', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/2/?lang=en
  ('Domaine Wardy', 'Private Selection Red', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/3/?lang=en
  ('Domaine Wardy', 'Obeidi', 'Bekaa Valley, Lebanon', 'Obeidi', 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Domaine Wardy', 'Muscat', 'Bekaa Valley, Lebanon', 'Muscat', 'Sweet'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Domaine Wardy', 'Viognier', 'Bekaa Valley, Lebanon', 'Viognier', 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Domaine Wardy', 'Cinsault', 'Bekaa Valley, Lebanon', 'Cinsault', 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Domaine Wardy', 'Grenache', 'Bekaa Valley, Lebanon', 'Grenache', 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=2
  ('Domaine Wardy', 'Perle du Château', 'Bekaa Valley, Lebanon', null, 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=2
  ('Domaine Wardy', 'Sauvignon Blanc', 'Bekaa Valley, Lebanon', 'Sauvignon Blanc', 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=2
  ('Domaine Wardy', 'Private Selection White', 'Bekaa Valley, Lebanon', null, 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=3
  ('Domaine Wardy', 'Chardonnay', 'Bekaa Valley, Lebanon', 'Chardonnay', 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=3
  ('Domaine Wardy', 'Merlot', 'Bekaa Valley, Lebanon', 'Merlot', 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=3
  ('Domaine Wardy', 'Clos Blanc', 'Bekaa Valley, Lebanon', null, 'White')  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=6
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU NAKAD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Nakad', 'Château des Coteaux', 'Bekaa Valley, Lebanon', 'Syrah, Cabernet Sauvignon', 'Red'),  -- https://libanonweine.de/product/chateau-nakad-chateau-des-coteaux/?lang=en
  ('Château Nakad', 'Grande Réserve', 'West Bekaa, Lebanon', null, 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Château Nakad', 'Alouette', 'West Bekaa, Lebanon', null, 'Red')  -- https://www.gilbertgaillard.com/en/resultats/bekaa
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- AURORA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Aurora', 'Cuvée N', 'Batroun, Lebanon', null, 'White'),  -- https://libanonweine.de/product-category/whitewine/?lang=en
  ('Aurora', 'Cabernet Franc', 'Batroun, Lebanon', 'Cabernet Franc', 'Red'),  -- https://libanonweine.de/product-category/redwine/page/2/?lang=en
  ('Aurora', 'Le Château', 'Batroun, Lebanon', null, 'Red'),  -- https://libanonweine.de/product-category/redwine/page/2/?lang=en
  ('Aurora', 'Rosé', 'Batroun, Lebanon', null, 'Rosé')  -- https://libanonweine.de/product-category/rosewine/?lang=en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- IRIS DOMAIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Iris Domain', 'Rouge', 'Lebanon', null, 'Red')  -- https://libanonweine.de/product-category/redwine/page/3/?lang=en
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BATROUN MOUNTAINS WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Batroun Mountains Winery', 'Frizzante White', 'Batroun, Lebanon', null, 'Sparkling'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Frizzante Rosé', 'Batroun, Lebanon', null, 'Sparkling'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Riesling', 'Batroun, Lebanon', 'Riesling', 'White'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Elite Rosé', 'Batroun, Lebanon', null, 'Rosé'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Prestige Rouge', 'Batroun, Lebanon', null, 'Red'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Pays des Patriarches', 'Batroun, Lebanon', null, 'Red'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Ruby', 'Batroun, Lebanon', null, 'Red'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Seven', 'Batroun, Lebanon', null, 'White'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Syrah', 'Batroun, Lebanon', 'Syrah', 'Red'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Cabernet Sauvignon', 'Batroun, Lebanon', 'Cabernet Sauvignon', 'Red'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Elite', 'Batroun, Lebanon', null, 'Red'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Chilled Summer Red', 'Batroun, Lebanon', null, 'Red'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Summer Seven', 'Batroun, Lebanon', null, 'White'),  -- https://batrounmountains.wine/products
  ('Batroun Mountains Winery', 'Chardonnay', 'Batroun, Lebanon', 'Chardonnay', 'White')  -- https://batrounmountains.wine/products
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU QANAFAR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Qanafar', 'Château Qanafar', 'West Bekaa, Lebanon', 'Cabernet Sauvignon, Merlot, Syrah', 'Red'),  -- https://chateauqanafar.com/chateau-qanafar/
  ('Château Qanafar', 'Paradis de Qanafar', 'West Bekaa, Lebanon', null, 'Red'),  -- https://chateauqanafar.com/paradis-de-qanafar
  ('Château Qanafar', 'Paradis Rosé', 'West Bekaa, Lebanon', null, 'Rosé'),  -- https://chateauqanafar.com/
  ('Château Qanafar', 'Eva', 'West Bekaa, Lebanon', 'Viognier', 'White'),  -- https://chateauqanafar.com/eva/
  ('Château Qanafar', 'Blanc de Qanafar', 'West Bekaa, Lebanon', null, 'White')  -- https://chateauqanafar.com/blanc-de-qanafar-2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SEPT WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Sept Winery', 'Merweh', 'Batroun, Lebanon', 'Merwah', 'White'),  -- https://levinsept.com/our-wines/
  ('Sept Winery', 'Cuvée du Soleil', 'Batroun, Lebanon', 'Tempranillo, Cabernet Sauvignon', 'Red'),  -- https://levinsept.com/our-wines/
  ('Sept Winery', 'Obeideh', 'Batroun, Lebanon', 'Obeideh', 'White'),  -- https://levinsept.com/our-wines/
  ('Sept Winery', 'Syrah de Nehla', 'Batroun, Lebanon', 'Syrah', 'Red'),  -- https://levinsept.com/our-wines/
  ('Sept Winery', 'Skin-Contact Obeideh', 'Batroun, Lebanon', 'Obeideh', 'Orange'),  -- https://wanderlustwine.co.uk/product-category/region/lebanon
  ('Sept Winery', 'Viognier', 'Batroun, Lebanon', 'Viognier', 'White')  -- https://wanderlustwine.co.uk/product-category/region/lebanon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU KA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Ka', 'Fleur de Ka', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Merlot, Syrah', 'Red'),  -- https://www.alliancewine.com/chateau-ka/fleur-de-ka-2009-7805
  ('Château Ka', 'Source Blanche', 'Bekaa Valley, Lebanon', 'Muscat, Chardonnay, Viognier, Sauvignon Blanc', 'White'),  -- https://www.alliancewine.com/chateau-ka/source-blanche-2024-7809
  ('Château Ka', 'Source de Rouge', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Syrah, Merlot', 'Red'),  -- https://www.alliancewine.com/chateau-ka/source-de-rouge-2021-7804
  ('Château Ka', 'Source Rosée', 'Bekaa Valley, Lebanon', null, 'Rosé')  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=2
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MARSYAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Marsyas', 'Rouge', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Syrah, Merlot', 'Red'),  -- https://winehouse.com.au/chateau-marsyas-rouge-2015/
  ('Château Marsyas', 'B-Qa de Marsyas Blanc', 'West Bekaa, Lebanon', null, 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Château Marsyas', 'Satyr', 'West Bekaa, Lebanon', null, 'Red')  -- https://www.gilbertgaillard.com/en/resultats/bekaa
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COTEAUX DU LIBAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Coteaux du Liban', 'Blanc Finesse', 'Bekaa Valley, Lebanon', null, 'White'),  -- https://coteauxduliban.com/wines
  ('Coteaux du Liban', 'Rosé Désir', 'Bekaa Valley, Lebanon', null, 'Rosé'),  -- https://coteauxduliban.com/wines
  ('Coteaux du Liban', 'Rouge Passion', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://coteauxduliban.com/wines
  ('Coteaux du Liban', 'Sélection Viognier', 'Bekaa Valley, Lebanon', 'Viognier', 'White'),  -- https://coteauxduliban.com/wines
  ('Coteaux du Liban', 'Sélection Sauvignon Blanc', 'Bekaa Valley, Lebanon', 'Sauvignon Blanc', 'White'),  -- https://coteauxduliban.com/wines
  ('Coteaux du Liban', 'Sélection Chardonnay', 'Bekaa Valley, Lebanon', 'Chardonnay', 'White'),  -- https://coteauxduliban.com/wines
  ('Coteaux du Liban', 'Sélection Syrah', 'Bekaa Valley, Lebanon', 'Syrah', 'Red'),  -- https://coteauxduliban.com/wines
  ('Coteaux du Liban', 'Sélection Cabernet Sauvignon', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon', 'Red'),  -- https://coteauxduliban.com/wines
  ('Coteaux du Liban', 'Sélection Obeideh', 'Bekaa Valley, Lebanon', 'Obeideh', 'White')  -- https://coteauxduliban.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ATIBAIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Atibaia', 'Atibaia', 'Batroun, Lebanon', 'Cabernet Sauvignon, Syrah, Petit Verdot', 'Red')  -- https://atibaiawine.com
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU BELLE-VUE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Belle-Vue', 'La Renaissance', 'Mount Lebanon, Lebanon', 'Cabernet Sauvignon, Merlot', 'Red'),  -- https://nogarlicnoonions.com/lebanons-chateau-belle-vue-launches-la-renaissance-and-le-chateau-2007
  ('Château Belle-Vue', 'Le Château', 'Mount Lebanon, Lebanon', 'Cabernet Franc, Syrah', 'Red')  -- https://nogarlicnoonions.com/lebanons-chateau-belle-vue-launches-la-renaissance-and-le-chateau-2007
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU OUMSIYAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Oumsiyat', 'Cuvée Membliarus Assyrtiko', 'Bekaa Valley, Lebanon', 'Assyrtiko', 'White'),  -- https://www.drinksdirect.com/chateau-oumsiyat
  ('Château Oumsiyat', 'Chardonnay', 'Bekaa Valley, Lebanon', 'Chardonnay', 'White'),  -- https://www.drinksdirect.com/chateau-oumsiyat
  ('Château Oumsiyat', 'Grande Réserve', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://www.drinksdirect.com/chateau-oumsiyat
  ('Château Oumsiyat', 'Merlot', 'Bekaa Valley, Lebanon', 'Merlot', 'Red'),  -- https://www.drinksdirect.com/chateau-oumsiyat
  ('Château Oumsiyat', 'Rouge Désir', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://www.drinksdirect.com/chateau-oumsiyat
  ('Château Oumsiyat', 'Rouge Jaspe', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://www.drinksdirect.com/chateau-oumsiyat
  ('Château Oumsiyat', 'Soupir Rosé', 'Bekaa Valley, Lebanon', null, 'Rosé'),  -- https://www.drinksdirect.com/chateau-oumsiyat
  ('Château Oumsiyat', 'Syrah', 'Bekaa Valley, Lebanon', 'Syrah', 'Red'),  -- https://www.drinksdirect.com/chateau-oumsiyat
  ('Château Oumsiyat', 'Cabernet Sauvignon', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon', 'Red'),  -- https://www.kysela.com/chateau-oumsiyat.html
  ('Château Oumsiyat', 'Carignan', 'Bekaa Valley, Lebanon', 'Carignan', 'Red')  -- https://www.kysela.com/chateau-oumsiyat.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FAKRA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Fakra', 'Merlon', 'Mount Lebanon, Lebanon', 'Cabernet Sauvignon, Syrah, Grenache, Cinsault', 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/chateau-fakra-merlon-232270
  ('Château Fakra', 'Cuvée du Temple', 'Mount Lebanon, Lebanon', 'Cabernet Sauvignon, Syrah, Grenache, Cinsault', 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/chateau-fakra-cuvee-du-temple-238363
  ('Château Fakra', 'Collection Privée', 'Mount Lebanon, Lebanon', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/chateau-fakra-collection-privee-238370
  ('Château Fakra', 'Pinacle', 'Mount Lebanon, Lebanon', null, 'Red'),  -- https://faqra.com/type/red
  ('Château Fakra', 'Perla Bianca', 'Mount Lebanon, Lebanon', null, 'White'),  -- https://faqra.com/type/white
  ('Château Fakra', 'Blanc de Blancs', 'Mount Lebanon, Lebanon', null, 'White'),  -- https://faqra.com/type/white
  ('Château Fakra', 'La Fleur', 'Mount Lebanon, Lebanon', null, 'Rosé'),  -- https://faqra.com/type/rose
  ('Château Fakra', 'Vin Doux Naturel', 'Mount Lebanon, Lebanon', null, 'Sweet')  -- https://faqra.com/type/sweet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU TROIS COLLINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Trois Collines', 'Viognier', 'Baalbek, Lebanon', 'Viognier', 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Château Trois Collines', 'Ample Blanc', 'Baalbek, Lebanon', null, 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Château Trois Collines', 'Ample Rouge', 'Baalbek, Lebanon', null, 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Château Trois Collines', 'Ample Rosé', 'Baalbek, Lebanon', null, 'Rosé'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=3
  ('Château Trois Collines', 'Nysa Blanc', 'Baalbek, Lebanon', null, 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa
  ('Château Trois Collines', 'Nysa Rouge', 'Baalbek, Lebanon', null, 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=3
  ('Château Trois Collines', 'Nysa Rosé', 'Baalbek, Lebanon', null, 'Rosé'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=3
  ('Château Trois Collines', 'Syrah', 'Baalbek, Lebanon', 'Syrah', 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=2
  ('Château Trois Collines', 'Chardonnay', 'Baalbek, Lebanon', 'Chardonnay', 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=2
  ('Château Trois Collines', 'Pinot Noir', 'Baalbek, Lebanon', 'Pinot Noir', 'Red')  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=3
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LATOURBA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Latourba', 'Chardonnay', 'West Bekaa, Lebanon', 'Chardonnay', 'White'),  -- https://www.gilbertgaillard.com/en/resultats/bekaa?page=2
  ('Latourba', 'Litaj', 'West Bekaa, Lebanon', 'Merlot, Cabernet Sauvignon, Syrah', 'Red'),  -- https://bottleofitaly.com/en/pages/cantine-latourba
  ('Latourba', 'Unique', 'West Bekaa, Lebanon', null, 'Sparkling'),  -- https://bottleofitaly.com/en/pages/cantine-latourba
  ('Latourba', 'Kristina', 'West Bekaa, Lebanon', null, 'Sparkling')  -- https://bottleofitaly.com/en/pages/cantine-latourba
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- AUROVINO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Aurovino', 'Loyalty', 'Mount Lebanon, Lebanon', null, 'Red'),  -- https://www.gilbertgaillard.com/en/resultats/mont-liban
  ('Aurovino', 'True Bond', 'Mount Lebanon, Lebanon', null, 'Red')  -- https://www.gilbertgaillard.com/en/resultats/mont-liban
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MERSEL WINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Mersel Wine', 'Elevate Marini', 'North Lebanon, Lebanon', 'Marini', 'Red'),  -- https://www.decanter.com/wine-reviews/lebanon/blouza/mersel-wine-elevate-marini-blouza-blouza-lebanon-2021-91803/
  ('Mersel Wine', 'Leb Nat Gold', 'Bekaa Valley, Lebanon', 'Viognier, Merwah', 'Sparkling'),  -- https://www.decanter.com/wine-reviews/lebanon/bekaa-valley/mersel-wines-leb-nat-gold-bekaa-valley-lebanon-2021-77891/
  ('Mersel Wine', 'LebNat Pink', 'North Lebanon, Lebanon', null, 'Sparkling'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'LebNat Red', 'North Lebanon, Lebanon', null, 'Sparkling'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Phoenix Merwah Skin-Contact', 'North Lebanon, Lebanon', 'Merwah', 'Orange'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Red Velvet', 'North Lebanon, Lebanon', 'Cinsault', 'Red'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Jaffa Crush', 'North Lebanon, Lebanon', 'Merwah, Muscat', 'Orange'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Lebnani Abyad', 'North Lebanon, Lebanon', null, 'White'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Lebnani Ahmar', 'North Lebanon, Lebanon', null, 'Red'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Dar Richi Hanan', 'North Lebanon, Lebanon', null, 'Red'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Dar Richi Helem', 'North Lebanon, Lebanon', 'Chardonnay', 'White'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Elevate Pinot Noir', 'North Lebanon, Lebanon', 'Pinot Noir', 'Red'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Elevate Merwah', 'North Lebanon, Lebanon', 'Merwah', 'White'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Elevate Merwah Sparkling', 'North Lebanon, Lebanon', 'Merwah', 'Sparkling'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Elevate Merwah Amber', 'North Lebanon, Lebanon', 'Merwah', 'Orange'),  -- https://www.merselwine.com/wines
  ('Mersel Wine', 'Elevate Merwah Direct Press', 'North Lebanon, Lebanon', 'Merwah', 'White')  -- https://www.merselwine.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VERTICAL 33 ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Vertical 33', 'Obeidi', 'Mount Lebanon, Lebanon', 'Obeideh', 'White'),  -- https://www.decanter.com/wine-reviews/lebanon/mount-lebanon/vertical-33-obeidi-mount-lebanon-lebanon-2015-77887/
  ('Vertical 33', 'Rosé', 'Mount Lebanon, Lebanon', 'Cinsault, Grenache', 'Rosé'),  -- https://vertical33.com/wines/
  ('Vertical 33', 'Cinsault du Soir', 'Mount Lebanon, Lebanon', 'Cinsault', 'Red'),  -- https://vertical33.com/wines/
  ('Vertical 33', 'Cinsault Brutal', 'Mount Lebanon, Lebanon', 'Cinsault', 'Red'),  -- https://vertical33.com/wines/
  ('Vertical 33', 'Carignan', 'Mount Lebanon, Lebanon', 'Carignan', 'Red')  -- https://vertical33.com/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ANA BEIRUT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Ana Beirut', 'Assyrtiko', 'Bekaa Valley, Lebanon', 'Assyrtiko', 'White')  -- https://www.decanter.com/wine-reviews/lebanon/bekaa-valley/ana-beirut-assyrtiko-bekaa-valley-lebanon-2020-57689/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COTEAUX HELIOPOLIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Coteaux Heliopolis', 'Coteaux les Cèdres', 'Bekaa Valley, Lebanon', 'Cabernet Sauvignon, Tempranillo', 'Red')  -- https://www.decanter.com/wine-reviews/lebanon/bekaa-valley/coteaux-heliopolis-coteaux-les-cedres-bekaa-valley-2014-44383/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RAMI BASSIL EL-SABBAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Rami Bassil El-Sabban', 'UWAR', 'Lebanon', 'Sabbaghieh', 'Red')  -- https://www.decanter.com/wine-reviews/lebanon/all/rami-bassil-el-sabban-uwar-lebanon-2024-107159/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAVE DU MONASTÈRE ST-JEAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Cave du Monastère St-Jean', 'Sendiäna Rouge', 'Mount Lebanon, Lebanon', null, 'Red')  -- https://www.decanter.com/wine-reviews/lebanon/mount-lebanon/cave-du-monastere-st-jean-sendiaena-rouge-2014-16128/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DU PHOENIX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Clos du Phoenix', 'Château Syrah', 'Batroun, Lebanon', 'Syrah', 'Red'),  -- https://www.closduphoenix.com/organic-wine
  ('Clos du Phoenix', 'Château Cabernet Sauvignon', 'Batroun, Lebanon', 'Cabernet Sauvignon', 'Red'),  -- https://www.closduphoenix.com/organic-wine
  ('Clos du Phoenix', 'Cuvée de la Citadelle', 'Batroun, Lebanon', 'Syrah, Mourvèdre, Grenache', 'Red'),  -- https://www.closduphoenix.com/organic-wine
  ('Clos du Phoenix', 'Grenache de la Citadelle', 'Batroun, Lebanon', 'Grenache', 'Red'),  -- https://www.closduphoenix.com/organic-wine
  ('Clos du Phoenix', 'Effendi', 'Batroun, Lebanon', 'Merwah', 'White'),  -- https://www.closduphoenix.com/organic-wine
  ('Clos du Phoenix', 'Emiresse', 'Batroun, Lebanon', 'Chardonnay, Marsanne', 'White'),  -- https://www.closduphoenix.com/organic-wine
  ('Clos du Phoenix', 'Les Fresques', 'Batroun, Lebanon', 'Syrah', 'Rosé')  -- https://www.closduphoenix.com/organic-wine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- KARAM WINERY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Karam Winery', 'Saint John', 'Jezzine, Lebanon', 'Syrah, Merlot, Cabernet Sauvignon', 'Red'),  -- https://www.internationalwinechallenge.com/canopy/beverage_details?wid=203189
  ('Karam Winery', 'Syrah de Nicolas', 'Jezzine, Lebanon', 'Syrah', 'Red')  -- https://kaasak.com/?p=608509
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAVE KOUROUM ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Cave Kouroum', 'Cuvée Bassim', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://cavekouroum.com/
  ('Cave Kouroum', 'Ambrosia', 'Bekaa Valley, Lebanon', null, 'Red'),  -- https://cavekouroum.com/
  ('Cave Kouroum', 'Syrah Cabernet', 'Bekaa Valley, Lebanon', 'Syrah, Cabernet Sauvignon', 'Red'),  -- https://cavekouroum.com/
  ('Cave Kouroum', 'Merlot', 'Bekaa Valley, Lebanon', 'Merlot', 'Red'),  -- https://cavekouroum.com/
  ('Cave Kouroum', 'Syrah', 'Bekaa Valley, Lebanon', 'Syrah', 'Red')  -- https://cavekouroum.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU RAYAK ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Rayak', 'Generations Red', 'Bekaa Valley, Lebanon', null, 'Red')  -- https://www.209lebanesewine.com/collections/chateau-rayak
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CANA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_lebanon.sql)'
from (values
  ('Château Cana', 'Le Château', 'Mount Lebanon, Lebanon', 'Cabernet Sauvignon, Merlot, Syrah', 'Red')  -- https://bottleofitaly.com/en/pages/cantine-chateau-cana
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
