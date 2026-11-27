-- Producer ranges round 9: provence. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- CHÂTEAU D'ESCLANS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château d''Esclans', 'Whispering Angel Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.booths.co.uk/our-stories/our-products/chateau-desclans/
  ('Château d''Esclans', 'Rock Angel Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.booths.co.uk/our-stories/our-products/chateau-desclans/
  ('Château d''Esclans', 'The Pale Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.booths.co.uk/our-stories/our-products/chateau-desclans/
  ('Château d''Esclans', 'Les Clans', 'Provence, France', null, 'Rosé'),  -- https://www.booths.co.uk/our-stories/our-products/chateau-desclans/
  ('Château d''Esclans', 'Garrus', 'Provence, France', null, 'Rosé'),  -- https://www.booths.co.uk/our-stories/our-products/chateau-desclans/
  ('Château d''Esclans', 'The Beach Whispering Angel Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-d-esclans
  ('Château d''Esclans', 'Esprit Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-d-esclans
  ('Château d''Esclans', null, 'Provence, France', null, 'Rosé')  -- https://www.vivino.com/wineries/chateau-d-esclans
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINES OTT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaines Ott', 'Château Romassan Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.vinatis.com/maisons/domaines-ott
  ('Domaines Ott', 'By.Ott Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vinatis.com/maisons/domaines-ott
  ('Domaines Ott', 'Clos Mireille Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.vinatis.com/maisons/domaines-ott
  ('Domaines Ott', 'Clos Mireille Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vinatis.com/maisons/domaines-ott
  ('Domaines Ott', 'Château de Selle Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vinatis.com/maisons/domaines-ott
  ('Domaines Ott', 'Château de Selle Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.vinatis.com/maisons/domaines-ott
  ('Domaines Ott', 'Château Romassan Bandol Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://www.vinatis.com/maisons/domaines-ott
  ('Domaines Ott', 'Château Romassan Bandol Rouge Les Préludes', 'Bandol, Provence, France', null, 'Red')  -- https://www.vinatis.com/maisons/domaines-ott
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MINUTY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Minuty', 'M de Minuty Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vinatis.com/maisons/chateau-minuty
  ('Château Minuty', 'M de Minuty Blanc', 'Provence, France', null, 'White'),  -- https://www.vinatis.com/maisons/chateau-minuty
  ('Château Minuty', 'M de Minuty Rouge', 'Provence, France', null, 'Red'),  -- https://www.vinatis.com/maisons/chateau-minuty
  ('Château Minuty', 'Prestige Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vinatis.com/maisons/chateau-minuty
  ('Château Minuty', 'Rosé et Or', 'Provence, France', null, 'Rosé'),  -- https://www.vinatis.com/maisons/chateau-minuty
  ('Château Minuty', 'Blanc et Or', 'Provence, France', null, 'White'),  -- https://www.vinatis.com/maisons/chateau-minuty
  ('Château Minuty', 'Rouge et Or', 'Provence, France', null, 'Red'),  -- https://www.vinatis.com/maisons/chateau-minuty
  ('Château Minuty', '281 Rosé', 'Provence, France', 'Grenache', 'Rosé'),  -- https://www.vinatis.com/maisons/chateau-minuty
  ('Château Minuty', 'Gabriel Rouge', 'Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/minuty
  ('Château Minuty', 'Prestige Blanc', 'Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/minuty
  ('Château Minuty', 'Cuvée de l''Oratoire Rouge', 'Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/minuty
  ('Château Minuty', 'Cuvée de l''Oratoire Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/minuty
  ('Château Minuty', 'M Limited Edition Rosé', 'Provence, France', null, 'Rosé')  -- https://www.vivino.com/wineries/minuty
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SAINTE-ROSELINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Sainte-Roseline', 'Cuvée Lampe de Méduse Cru Classé Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Cuvée Lampe de Méduse Cru Classé Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Cuvée Lampe de Méduse Cru Classé Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Roseline Prestige Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Roseline Prestige Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Collection Blanc Cru Classé', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Collection Rosé Cru Classé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Allégorie Rosé Effervescent', 'Côtes de Provence, Provence, France', null, 'Sparkling'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Perle de Roseline Blanc', 'Méditerranée IGP, Provence, France', null, 'White'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Perle de Roseline Rosé', 'Méditerranée IGP, Provence, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Perle de Roseline Rouge', 'Méditerranée IGP, Provence, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'La Chapelle de Sainte Roseline Cru Classé Rosé', 'Côtes de Provence, Provence, France', 'Mourvèdre', 'Rosé'),  -- https://www.vinatis.com/maisons/chateau-sainte-roseline
  ('Château Sainte-Roseline', 'Cuvée Prieuré Rouge', 'Côtes de Provence, Provence, France', null, 'Red')  -- https://www.vinatis.com/maisons/chateau-sainte-roseline
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MIRAVAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Miraval', 'Studio Rosé', 'Méditerranée IGP, Provence, France', 'Cinsault, Grenache, Rolle, Tibouren', 'Rosé'),  -- https://www.libertywines.co.uk/our-portfolio/PE903-studio-rose
  ('Château Miraval', 'Côtes de Provence Rosé', 'Côtes de Provence, Provence, France', 'Grenache, Cinsault, Rolle, Syrah', 'Rosé'),  -- https://www.libertywines.co.uk/our-portfolio/PE903-studio-rose
  ('Château Miraval', 'Côtes de Provence Blanc', 'Côtes de Provence, Provence, France', 'Rolle', 'White'),  -- https://www.libertywines.co.uk/our-portfolio/PE903-studio-rose
  ('Château Miraval', 'Sainte Victoire Rosé', 'Côtes de Provence Sainte-Victoire, Provence, France', null, 'Rosé'),  -- https://www.libertywines.co.uk/our-portfolio/PE903-studio-rose
  ('Château Miraval', 'Muse de Miraval Rosé', 'Côtes de Provence, Provence, France', 'Grenache, Rolle', 'Rosé'),  -- https://www.libertywines.co.uk/our-portfolio/PE903-studio-rose
  ('Château Miraval', 'Studio Blanc', 'Provence, France', null, 'White')  -- https://www.decanter.com/wine-reviews/search/miraval/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE BERNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château de Berne', 'Terres de Berne Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/chateau-de-berne
  ('Château de Berne', 'Terres de Berne Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.avenuedesvins.fr/en/shop/chateau-de-berne
  ('Château de Berne', 'La Grande Cuvée Rosé', 'Côtes de Provence, Provence, France', 'Grenache, Cinsault, Syrah', 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/chateau-de-berne
  ('Château de Berne', 'Esprit Méditerranée Rosé', 'Méditerranée IGP, Provence, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/chateau-de-berne
  ('Château de Berne', 'La Grande Cuvée Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.chateauberne.com/en/vignoble-vins/vins/les-vins-du-chateau/
  ('Château de Berne', 'La Grande Cuvée Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.chateauberne.com/en/vignoble-vins/vins/les-vins-du-chateau/
  ('Château de Berne', 'Terres de Berne Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé')  -- https://www.chateauberne.com/en/vignoble-vins/vins/les-vins-du-chateau/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- AIX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('AIX', 'Rosé', 'Provence, France', 'Grenache, Syrah, Cinsault', 'Rosé')  -- https://www.aixrose.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SAINTE MARGUERITE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Sainte Marguerite', 'Collection Marguerites Rosé', 'Provence, France', 'Grenache, Vermentino, Cinsault', 'Rosé'),  -- https://the-buyer.net/tasting/wine-/peninsula-paris-marguerites-en-provence-collection
  ('Château Sainte Marguerite', 'Collection Marguerites Blanc', 'Provence, France', 'Vermentino', 'White'),  -- https://the-buyer.net/tasting/wine-/peninsula-paris-marguerites-en-provence-collection
  ('Château Sainte Marguerite', 'Collection Marguerites Rouge', 'Provence, France', 'Syrah, Grenache', 'Red'),  -- https://the-buyer.net/tasting/wine-/peninsula-paris-marguerites-en-provence-collection
  ('Château Sainte Marguerite', 'Symphonie Rouge', 'Côtes de Provence, Provence, France', 'Syrah, Cabernet, Grenache', 'Red'),  -- https://www.infinivin.com/en/chateau-sainte-marguerite-symphonie-cotes-de-provence-red-wine-1358.html
  ('Château Sainte Marguerite', 'Fantastique Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.infinivin.com/en/chateau-sainte-marguerite-symphonie-cotes-de-provence-red-wine-1358.html
  ('Château Sainte Marguerite', 'Symphonie Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé')  -- https://www.decanter.com/wine-reviews/search/ch%C3%A2teau-sainte-marguerite/page/1/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MIRABEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Mirabeau', 'Classic Rosé', 'Côtes de Provence, Provence, France', 'Grenache, Syrah, Cinsault, Carignan, Rolle, Cabernet Sauvignon, Trebbiano', 'Rosé'),  -- https://www.ocado.com/products/mirabeau-classic-cotes-de-provence-rose/63207011
  ('Mirabeau', 'Pure Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.decanter.com/wine-reviews/search/mirabeau/2/
  ('Mirabeau', 'Haute Couture Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.decanter.com/wine-reviews/search/mirabeau/2/
  ('Mirabeau', 'La Réserve Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.decanter.com/wine-reviews/search/mirabeau/2/
  ('Mirabeau', 'Etoile Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://wikiliq.org/wine-brand/mirabeau
  ('Mirabeau', 'X Rosé', 'Provence, France', null, 'Rosé')  -- https://www.decanter.com/wine-reviews/search/mirabeau/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LÉOUBE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Léoube', 'Love by Léoube Blanc', 'Côtes de Provence, Provence, France', 'Rolle, Sémillon', 'White'),  -- https://www.mrwheelerwine.com/chateau-leoube/
  ('Château Léoube', 'Côtes de Provence Blanc', 'Côtes de Provence, Provence, France', 'Rolle, Sémillon', 'White'),  -- https://www.mrwheelerwine.com/chateau-leoube/
  ('Château Léoube', 'Côtes de Provence Rouge', 'Côtes de Provence, Provence, France', 'Syrah, Grenache', 'Red'),  -- https://www.mrwheelerwine.com/chateau-leoube/
  ('Château Léoube', 'Côtes de Provence Rosé', 'Côtes de Provence, Provence, France', 'Cinsault, Grenache, Mourvèdre, Syrah', 'Rosé'),  -- https://www.mrwheelerwine.com/chateau-leoube/
  ('Château Léoube', 'Rouge Collector', 'Côtes de Provence, Provence, France', 'Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.mrwheelerwine.com/chateau-leoube/
  ('Château Léoube', 'Secret de Léoube Rosé', 'Côtes de Provence, Provence, France', 'Grenache, Cinsault, Cabernet Sauvignon', 'Rosé'),  -- https://www.mrwheelerwine.com/chateau-leoube/
  ('Château Léoube', 'Love by Léoube Rosé', 'Côtes de Provence, Provence, France', 'Cinsault, Grenache, Mourvèdre', 'Rosé')  -- https://www.mrwheelerwine.com/chateau-leoube/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU ROUBINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Roubine', 'Amistà Edmond de Rothschild Heritage Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-roubine
  ('Château Roubine', 'Inspire Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/en/wineries/chateau-roubine
  ('Château Roubine', 'Inspire Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-roubine
  ('Château Roubine', 'Inspire Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.vivino.com/en/wineries/chateau-roubine
  ('Château Roubine', 'Lion & Dragon Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/en/wineries/chateau-roubine
  ('Château Roubine', 'Lion & Dragon Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-roubine
  ('Château Roubine', 'Lion & Dragon Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.vivino.com/en/wineries/chateau-roubine
  ('Château Roubine', 'Premium Rouge', 'Côtes de Provence, Provence, France', null, 'Red')  -- https://www.vivino.com/en/wineries/chateau-roubine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PEYRASSOL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Peyrassol', 'Réserve des Templiers Rosé', 'Côtes de Provence, Provence, France', 'Grenache, Cinsault, Syrah, Vermentino', 'Rosé'),  -- https://www.vino.com/en/selezione/chateau-peyrassol
  ('Château Peyrassol', 'Côtes de Provence Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vino.com/en/selezione/chateau-peyrassol
  ('Château Peyrassol', 'Côtes de Provence Rouge', 'Côtes de Provence, Provence, France', 'Syrah, Cabernet Sauvignon', 'Red'),  -- https://www.vino.com/en/selezione/chateau-peyrassol
  ('Château Peyrassol', 'Clos Peyrassol Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.peyrassol.com/en/our-wines/chateau-peyrassol-rose/
  ('Château Peyrassol', 'La Bastide Peyrassol Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.peyrassol.com/en/our-wines/chateau-peyrassol-rose/
  ('Château Peyrassol', '1204 Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.peyrassol.com/en/our-wines/chateau-peyrassol-rose/
  ('Château Peyrassol', 'Les Commandeurs Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.peyrassol.com/en/our-wines/chateau-peyrassol-rose/
  ('Château Peyrassol', '#Lou Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.peyrassol.com/en/our-wines/chateau-peyrassol-rose/
  ('Château Peyrassol', 'Côtes de Provence Blanc', 'Côtes de Provence, Provence, France', 'Rolle, Ugni Blanc', 'White'),  -- https://www.peyrassol.com/en/our-wines/chateau-peyrassol-white/
  ('Château Peyrassol', 'Clos Peyrassol Blanc', 'Provence, France', null, 'White')  -- https://www.peyrassol.com/en/our-wines/chateau-peyrassol-white/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU VIGNELAURE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Vignelaure', 'Coteaux d''Aix-en-Provence Rouge', 'Coteaux d''Aix-en-Provence, Provence, France', 'Cabernet Sauvignon, Syrah', 'Red'),  -- https://vignelaure.com/wines-events/range-of-wine
  ('Château Vignelaure', 'Coteaux d''Aix-en-Provence Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', 'Grenache, Syrah, Cabernet Sauvignon, Rolle', 'Rosé'),  -- https://vignelaure.com/wines-events/range-of-wine
  ('Château Vignelaure', 'Méditerranée IGP Blanc', 'Méditerranée IGP, Provence, France', 'Sauvignon Blanc, Roussanne, Viognier', 'White'),  -- https://vignelaure.com/wines-events/range-of-wine
  ('Château Vignelaure', 'La Source de Vignelaure Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-vignelaure
  ('Château Vignelaure', 'La Source de Vignelaure Blanc', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/chateau-vignelaure
  ('Château Vignelaure', 'La Source de Vignelaure Rouge', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-vignelaure
  ('Château Vignelaure', 'Edition S Rouge', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-vignelaure
  ('Château Vignelaure', 'Hommage à Georges Brunet', 'Coteaux d''Aix-en-Provence, Provence, France', 'Cabernet Sauvignon', 'Red'),  -- https://www.vivino.com/wineries/chateau-vignelaure
  ('Château Vignelaure', 'Le Page de Vignelaure Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-vignelaure
  ('Château Vignelaure', 'Le Page de Vignelaure Blanc', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'White')  -- https://www.vivino.com/wineries/chateau-vignelaure
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA MASCARONNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château La Mascaronne', 'Côtes de Provence Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/chateau-la-mascaronne
  ('Château La Mascaronne', 'Grande Réserve Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/chateau-la-mascaronne
  ('Château La Mascaronne', 'Côtes de Provence Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.avenuedesvins.fr/en/shop/chateau-la-mascaronne
  ('Château La Mascaronne', 'Côtes de Provence Rouge', 'Côtes de Provence, Provence, France', 'Syrah, Cabernet Sauvignon', 'Red'),  -- https://www.avenuedesvins.fr/en/shop/chateau-la-mascaronne
  ('Château La Mascaronne', 'Folly by Mascaronne Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé')  -- https://www.avenuedesvins.fr/en/shop/chateau-la-mascaronne
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GALOUPET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Galoupet', 'Côtes de Provence Cru Classé Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé')  -- https://www.vivino.com/en/wineries/chateau-galoupet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SAINT-MAUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Saint-Maur', 'Clos Saint-Vincent Cuvée d''Exception Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-saint-maur
  ('Château Saint-Maur', 'Clos de Capelune Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/en/wineries/chateau-saint-maur
  ('Château Saint-Maur', 'Clos de Capelune Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-saint-maur
  ('Château Saint-Maur', 'L''Excellence Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-saint-maur
  ('Château Saint-Maur', 'L''Excellence Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.vivino.com/en/wineries/chateau-saint-maur
  ('Château Saint-Maur', 'L''Excellence Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/en/wineries/chateau-saint-maur
  ('Château Saint-Maur', 'L''Excellence Golfe de Saint-Tropez Rosé', 'Côtes de Provence Golfe de Saint-Tropez, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-saint-maur
  ('Château Saint-Maur', 'Clos de Capelune Rouge', 'Côtes de Provence, Provence, France', 'Syrah, Grenache', 'Red'),  -- https://www.chateausaintmaur.com/clos-de-capelune/
  ('Château Saint-Maur', 'Saint-M Rosé', 'Côtes de Provence, Provence, France', 'Cinsault, Grenache, Syrah, Mourvèdre, Cabernet Sauvignon, Tibouren, Rolle, Clairette', 'Rosé'),  -- https://www.chateausaintmaur.com/saint-m/
  ('Château Saint-Maur', 'Saint-M Blanc', 'Côtes de Provence, Provence, France', 'Rolle, Clairette', 'White'),  -- https://www.chateausaintmaur.com/saint-m/
  ('Château Saint-Maur', 'Saint-M Rouge', 'Côtes de Provence, Provence, France', 'Syrah, Mourvèdre, Cabernet Sauvignon, Cinsault, Grenache', 'Red')  -- https://www.chateausaintmaur.com/saint-m/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU GASSIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Gassier', 'Elevae Rosé d''Elevage', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-gassier
  ('Château Gassier', '946 Sélection Parcellaire Blanc', 'Provence, France', null, 'White'),  -- https://www.vivino.com/en/wineries/chateau-gassier
  ('Château Gassier', '946 Sélection Parcellaire Rosé', 'Côtes de Provence Sainte-Victoire, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-gassier
  ('Château Gassier', 'Baron Gassier Cuvée Élégance Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-gassier
  ('Château Gassier', 'Baron Gassier Excellence Rosé', 'Côtes de Provence Sainte-Victoire, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-gassier
  ('Château Gassier', 'Le Pas du Moine Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/en/wineries/chateau-gassier
  ('Château Gassier', 'Maxime Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-gassier
  ('Château Gassier', 'Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-gassier
  ('Château Gassier', 'Esprit Gassier Édition Limitée Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé')  -- https://www.vivino.com/en/wineries/chateau-gassier
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA COURTADE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine de la Courtade', 'La Courtade Rosé', 'Côtes de Provence, Provence, France', 'Grenache, Cinsault, Tibouren, Rolle', 'Rosé'),  -- https://espritparcnational.com/en/consume-local/drinks/wine-courtade-rose-domaine-courtade-32971
  ('Domaine de la Courtade', 'La Courtade Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://espritparcnational.com/en/consume-local/drinks/wine-courtade-rose-domaine-courtade-32971
  ('Domaine de la Courtade', 'La Courtade Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://espritparcnational.com/en/consume-local/drinks/wine-courtade-rose-domaine-courtade-32971
  ('Domaine de la Courtade', 'L''Alycastre Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://espritparcnational.com/en/consume-local/drinks/wine-courtade-rose-domaine-courtade-32971
  ('Domaine de la Courtade', 'L''Alycastre Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://espritparcnational.com/en/consume-local/drinks/wine-courtade-rose-domaine-courtade-32971
  ('Domaine de la Courtade', 'L''Alycastre Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://espritparcnational.com/en/consume-local/drinks/wine-courtade-rose-domaine-courtade-32971
  ('Domaine de la Courtade', 'Les Terrasses Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://espritparcnational.com/en/consume-local/drinks/wine-courtade-rose-domaine-courtade-32971
  ('Domaine de la Courtade', 'Les Terrasses Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://espritparcnational.com/en/consume-local/drinks/wine-courtade-rose-domaine-courtade-32971
  ('Domaine de la Courtade', 'Les Terrasses Blanc', 'Côtes de Provence, Provence, France', null, 'White')  -- https://espritparcnational.com/en/consume-local/drinks/wine-courtade-rose-domaine-courtade-32971
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE PIBARNON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château de Pibarnon', 'Bandol Rouge', 'Bandol, Provence, France', 'Mourvèdre, Grenache', 'Red'),  -- https://www.pibarnon.com/en/our-wines
  ('Château de Pibarnon', 'Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.pibarnon.com/en/our-wines
  ('Château de Pibarnon', 'Bandol Blanc', 'Bandol, Provence, France', null, 'White')  -- https://www.pibarnon.com/en/our-wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PRADEAUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Pradeaux', 'Bandol Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://www.chateau-pradeaux.com/
  ('Château Pradeaux', 'Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.chateau-pradeaux.com/
  ('Château Pradeaux', 'Vesprée Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.chateau-pradeaux.com/
  ('Château Pradeaux', 'Le Lys Bandol Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://www.chateau-pradeaux.com/
  ('Château Pradeaux', 'Bienfait des Pradeaux Rouge', 'Vin de France, France', null, 'Red'),  -- https://www.chateau-pradeaux.com/
  ('Château Pradeaux', 'Bienfait des Pradeaux Rosé', 'Vin de France, France', null, 'Rosé'),  -- https://www.chateau-pradeaux.com/
  ('Château Pradeaux', 'Plaisir Solidaire Rouge', 'Provence, France', null, 'Red')  -- https://www.chateau-pradeaux.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE TEMPIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine Tempier', 'Bandol Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://ny.vervewine.com/blogs/the-blog/producers-we-love-domaine-tempier
  ('Domaine Tempier', 'Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://ny.vervewine.com/blogs/the-blog/producers-we-love-domaine-tempier
  ('Domaine Tempier', 'Bandol Blanc', 'Bandol, Provence, France', null, 'White'),  -- https://ny.vervewine.com/blogs/the-blog/producers-we-love-domaine-tempier
  ('Domaine Tempier', 'Bandol La Migoua', 'Bandol, Provence, France', null, 'Red'),  -- https://ny.vervewine.com/blogs/the-blog/producers-we-love-domaine-tempier
  ('Domaine Tempier', 'Bandol La Tourtine', 'Bandol, Provence, France', 'Mourvèdre, Grenache, Cinsault', 'Red'),  -- https://ny.vervewine.com/blogs/the-blog/producers-we-love-domaine-tempier
  ('Domaine Tempier', 'Bandol Cabassaou', 'Bandol, Provence, France', null, 'Red')  -- https://ny.vervewine.com/blogs/the-blog/producers-we-love-domaine-tempier
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE TERREBRUNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine de Terrebrune', 'Bandol Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://www.terrebrune.fr/
  ('Domaine de Terrebrune', 'Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.terrebrune.fr/
  ('Domaine de Terrebrune', 'Bandol Blanc', 'Bandol, Provence, France', null, 'White'),  -- https://www.terrebrune.fr/
  ('Domaine de Terrebrune', 'Terreblonde Rouge', 'Provence, France', null, 'Red')  -- https://www.terrebrune.fr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SIMONE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Simone', 'Palette Rouge', 'Palette, Provence, France', null, 'Red'),  -- https://chateau-simone.fr/
  ('Château Simone', 'Palette Rosé', 'Palette, Provence, France', null, 'Rosé'),  -- https://chateau-simone.fr/
  ('Château Simone', 'Palette Blanc', 'Palette, Provence, France', null, 'White'),  -- https://chateau-simone.fr/
  ('Château Simone', 'Grands Carmes Rouge', 'Provence, France', null, 'Red'),  -- https://chateau-simone.fr/
  ('Château Simone', 'Grands Carmes Rosé', 'Provence, France', null, 'Rosé'),  -- https://chateau-simone.fr/
  ('Château Simone', 'Grands Carmes Blanc', 'Provence, France', null, 'White')  -- https://chateau-simone.fr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU REVELETTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Revelette', 'Rouge', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Red'),  -- https://revelette.fr/les-vins/
  ('Château Revelette', 'Blanc', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'White'),  -- https://revelette.fr/les-vins/
  ('Château Revelette', 'Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé'),  -- https://revelette.fr/les-vins/
  ('Château Revelette', 'Le Grand Blanc', 'Méditerranée IGP, Provence, France', null, 'White'),  -- https://revelette.fr/les-vins/
  ('Château Revelette', 'Le Grand Rouge', 'Méditerranée IGP, Provence, France', null, 'Red'),  -- https://revelette.fr/les-vins/
  ('Château Revelette', 'Pur Blanc', 'Vin de France, France', null, 'White'),  -- https://revelette.fr/les-vins/
  ('Château Revelette', 'Coude à Coude Blanc', 'Vin de France, France', null, 'White'),  -- https://revelette.fr/les-vins/
  ('Château Revelette', 'Coude à Coude Rosé', 'Vin de France, France', null, 'Rosé'),  -- https://revelette.fr/les-vins/
  ('Château Revelette', 'Coude à Coude Rouge', 'Vin de France, France', null, 'Red')  -- https://revelette.fr/les-vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS SAINTE-MAGDELEINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Clos Sainte-Magdeleine', 'Cassis Blanc', 'Cassis, Provence, France', null, 'White'),  -- https://www.famillesack.vin/la-gamme-domaine
  ('Clos Sainte-Magdeleine', 'Bel-Arme Cassis Blanc', 'Cassis, Provence, France', null, 'White'),  -- https://www.famillesack.vin/la-gamme-domaine
  ('Clos Sainte-Magdeleine', 'Baume-Noire Blanc', 'Provence, France', null, 'White'),  -- https://www.famillesack.vin/la-gamme-domaine
  ('Clos Sainte-Magdeleine', 'Cassis Rosé', 'Cassis, Provence, France', null, 'Rosé'),  -- https://www.famillesack.vin/la-gamme-domaine
  ('Clos Sainte-Magdeleine', 'Cassis Rouge', 'Cassis, Provence, France', null, 'Red')  -- https://www.famillesack.vin/la-gamme-domaine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS SAINT-VINCENT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Clos Saint-Vincent', 'Bellet Le Clos Rouge', 'Bellet, Provence, France', 'Folle Noire, Grenache', 'Red'),  -- https://www.clos-st-vincent.fr/nos-produits/
  ('Clos Saint-Vincent', 'Bellet Le Clos Blanc', 'Bellet, Provence, France', 'Rolle', 'White'),  -- https://www.clos-st-vincent.fr/nos-produits/
  ('Clos Saint-Vincent', 'Bellet Le Clos Rosé', 'Bellet, Provence, France', 'Braquet', 'Rosé'),  -- https://www.clos-st-vincent.fr/nos-produits/
  ('Clos Saint-Vincent', 'Vino di Gio Rouge', 'Provence, France', 'Folle Noire', 'Red'),  -- https://www.clos-st-vincent.fr/nos-produits/
  ('Clos Saint-Vincent', 'Vino di Gio Blanc', 'Provence, France', 'Rolle', 'White')  -- https://www.clos-st-vincent.fr/nos-produits/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU VANNIÈRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Vannières', 'Bandol Blanc', 'Bandol, Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Bandol Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Côtes de Provence Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Côtes de Provence Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Côtes de Provence Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Mistral de Vannières Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Mistral de Vannières Rouge', 'Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Heritage de Vannières Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Heritage de Vannières Rouge', 'Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Heritage de Vannières Blanc', 'Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/chateau-vannieres
  ('Château Vannières', 'Chez Vannières Rosé', 'Provence, France', null, 'Rosé')  -- https://www.vivino.com/wineries/chateau-vannieres
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE TRÉVALLON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine de Trévallon', 'Alpilles Blanc', 'Alpilles IGP, Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/domaine-de-trevallon
  ('Domaine de Trévallon', 'Alpilles Rouge', 'Alpilles IGP, Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/domaine-de-trevallon
  ('Domaine de Trévallon', 'Bouches-du-Rhône Red', 'Bouches-du-Rhône IGP, Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/domaine-de-trevallon
  ('Domaine de Trévallon', 'Bouches-du-Rhône White', 'Bouches-du-Rhône IGP, Provence, France', null, 'White')  -- https://www.vivino.com/wineries/domaine-de-trevallon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MAS DE LA DAME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Mas de la Dame', 'Coin Caché Blanc', 'Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/mas-de-la-dame
  ('Mas de la Dame', 'Coin Caché Rouge', 'Provence, France', null, 'Red')  -- https://www.vivino.com/wineries/mas-de-la-dame
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU ESTOUBLON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Estoublon', 'Les Baux-de-Provence Rouge', 'Les Baux-de-Provence, Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-d-estoublon
  ('Château Estoublon', 'Moukipic Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-d-estoublon
  ('Château Estoublon', 'Roseblood Blanc', 'Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/chateau-d-estoublon
  ('Château Estoublon', 'Les Baux-de-Provence Le Rosé', 'Les Baux-de-Provence, Provence, France', null, 'Rosé')  -- https://www.vivino.com/wineries/chateau-d-estoublon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CALISSANNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Calissanne', 'Rocher Rouge', 'Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-calissanne
  ('Château Calissanne', 'Les Terres de Provence Rouge', 'Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-calissanne
  ('Château Calissanne', 'Les Terres de Provence Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-calissanne
  ('Château Calissanne', 'Clos Victoire Rouge', 'Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-calissanne
  ('Château Calissanne', 'Clos Victoire Blanc', 'Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/chateau-calissanne
  ('Château Calissanne', 'Clos Victoire Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-calissanne
  ('Château Calissanne', 'Coteaux d''Aix-en-Provence Blanc', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/chateau-calissanne
  ('Château Calissanne', 'Coteaux d''Aix-en-Provence Rouge', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Red')  -- https://www.vivino.com/wineries/chateau-calissanne
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DU GROS NORÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine du Gros Noré', 'Bandol Rouge', 'Bandol, Provence, France', 'Mourvèdre', 'Red'),  -- https://www.gros-nore.com/
  ('Domaine du Gros Noré', 'Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.gros-nore.com/
  ('Domaine du Gros Noré', 'Bandol Blanc', 'Bandol, Provence, France', null, 'White')  -- https://www.gros-nore.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE RAY-JANE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine Ray-Jane', 'Bandol Tradition Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://www.ray-jane.fr/
  ('Domaine Ray-Jane', 'Bandol Tradition Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.ray-jane.fr/
  ('Domaine Ray-Jane', 'Bandol Tradition Blanc', 'Bandol, Provence, France', null, 'White'),  -- https://www.ray-jane.fr/
  ('Domaine Ray-Jane', 'Bandol Rouge Cuvée du Falun', 'Bandol, Provence, France', null, 'Red'),  -- https://www.ray-jane.fr/
  ('Domaine Ray-Jane', 'Bandol Rosé Cuvée de Sanary', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.ray-jane.fr/
  ('Domaine Ray-Jane', 'Bandol Blanc Cuvée de Sanary', 'Bandol, Provence, France', null, 'White'),  -- https://www.ray-jane.fr/
  ('Domaine Ray-Jane', 'IGP du Var Blanc', 'Var IGP, Provence, France', null, 'White'),  -- https://www.ray-jane.fr/
  ('Domaine Ray-Jane', 'IGP du Var Rosé', 'Var IGP, Provence, France', null, 'Rosé'),  -- https://www.ray-jane.fr/
  ('Domaine Ray-Jane', 'IGP du Var Rouge', 'Var IGP, Provence, France', null, 'Red'),  -- https://www.ray-jane.fr/
  ('Domaine Ray-Jane', 'IGP du Var Rouge Cuvée Raymond', 'Var IGP, Provence, France', null, 'Red')  -- https://www.ray-jane.fr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA BASTIDE BLANCHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine de la Bastide Blanche', 'Bandol Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://www.bastide-blanche.fr/
  ('Domaine de la Bastide Blanche', 'Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://www.bastide-blanche.fr/
  ('Domaine de la Bastide Blanche', 'Bandol Blanc', 'Bandol, Provence, France', null, 'White'),  -- https://www.bastide-blanche.fr/
  ('Domaine de la Bastide Blanche', 'Contrechamps Blanc', 'Bandol, Provence, France', null, 'White'),  -- https://www.bastide-blanche.fr/
  ('Domaine de la Bastide Blanche', 'Contrechamps Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://www.bastide-blanche.fr/
  ('Domaine de la Bastide Blanche', 'Estagnol Blanc', 'Bandol, Provence, France', null, 'White'),  -- https://www.bastide-blanche.fr/
  ('Domaine de la Bastide Blanche', 'Estagnol Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://www.bastide-blanche.fr/
  ('Domaine de la Bastide Blanche', 'Fontanéou', 'Bandol, Provence, France', null, 'Red'),  -- https://www.bastide-blanche.fr/
  ('Domaine de la Bastide Blanche', 'Vieille Canaille', 'Vin de France, France', null, 'Red')  -- https://www.bastide-blanche.fr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU ROMANIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Romanin', 'Grand Vin Rouge', 'Les Baux-de-Provence, Provence, France', null, 'Red'),  -- https://www.chateauromanin.com/
  ('Château Romanin', 'Grand Vin Rosé', 'Les Baux-de-Provence, Provence, France', null, 'Rosé'),  -- https://www.chateauromanin.com/
  ('Château Romanin', 'Grand Vin Blanc', 'Les Baux-de-Provence, Provence, France', null, 'White'),  -- https://www.chateauromanin.com/
  ('Château Romanin', 'Romanin Rouge', 'Alpilles IGP, Provence, France', null, 'Red'),  -- https://www.chateauromanin.com/
  ('Château Romanin', 'Romanin Rosé', 'Alpilles IGP, Provence, France', null, 'Rosé'),  -- https://www.chateauromanin.com/
  ('Château Romanin', 'Romanin Blanc', 'Alpilles IGP, Provence, France', null, 'White'),  -- https://www.chateauromanin.com/
  ('Château Romanin', 'La Chapelle', 'Les Baux-de-Provence, Provence, France', null, 'Red'),  -- https://www.chateauromanin.com/
  ('Château Romanin', 'Le Coeur', 'Les Baux-de-Provence, Provence, France', null, 'Red')  -- https://www.chateauromanin.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA BÉGUDE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine de la Bégude', 'La Brûlade', 'Bandol, Provence, France', null, 'Red'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Bandol Rouge', 'Bandol, Provence, France', null, 'Red'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Bandol Rosé', 'Bandol, Provence, France', null, 'Rosé'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Bandol Blanc', 'Bandol, Provence, France', null, 'White'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Thyrsus', 'Méditerranée IGP, Provence, France', 'Mourvèdre', 'Red'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Thyrsus Rosé', 'Méditerranée IGP, Provence, France', 'Mourvèdre', 'Rosé'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Collection Cadet Rouge', 'Méditerranée IGP, Provence, France', null, 'Red'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Collection Cadet Rosé', 'Méditerranée IGP, Provence, France', null, 'Rosé'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Collection Cadet Blanc', 'Méditerranée IGP, Provence, France', null, 'White'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'L''Irréductible', 'Bandol, Provence, France', null, 'Rosé'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Collection Jove Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Collection Jove Blanc', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'White'),  -- https://domainedelabegude.fr/vin-de-bandol/
  ('Domaine de la Bégude', 'Cuvée Amphore', 'Bandol, Provence, France', null, 'White')  -- https://domainedelabegude.fr/vin-de-bandol/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MARGÜI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Margüi', 'Coteaux Varois en Provence Rosé', 'Coteaux Varois en Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-margui
  ('Château Margüi', 'Coteaux Varois en Provence Rouge', 'Coteaux Varois en Provence, Provence, France', null, 'Red'),  -- https://www.vivino.com/wineries/chateau-margui
  ('Château Margüi', 'Coteaux Varois en Provence Blanc', 'Coteaux Varois en Provence, Provence, France', null, 'White'),  -- https://www.vivino.com/wineries/chateau-margui
  ('Château Margüi', 'Bastide de Margui 1784 Rosé', 'Coteaux Varois en Provence, Provence, France', null, 'Rosé'),  -- https://www.vivino.com/wineries/chateau-margui
  ('Château Margüi', 'Perle de Margüi Rosé', 'Coteaux Varois en Provence, Provence, France', null, 'Rosé')  -- https://www.vivino.com/wineries/chateau-margui
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SAINT-ANDRÉ DE FIGUIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Saint-André de Figuière', 'Première Rosé', 'Provence, France', null, 'Rosé'),  -- https://figuierevins.com/les-vins-roses-de-provence/
  ('Château Saint-André de Figuière', 'Confidentielle Rosé', 'Côtes de Provence La Londe, Provence, France', null, 'Rosé'),  -- https://figuierevins.com/les-vins-roses-de-provence/
  ('Château Saint-André de Figuière', 'Méditerranée Rosé', 'Provence, France', null, 'Rosé'),  -- https://figuierevins.com/les-vins-roses-de-provence/
  ('Château Saint-André de Figuière', 'Rose Bay', 'Provence, France', null, 'Rosé'),  -- https://figuierevins.com/les-vins-roses-de-provence/
  ('Château Saint-André de Figuière', 'Cuvée 11 Rosé', 'Provence, France', null, 'Rosé'),  -- https://figuierevins.com/les-vins-roses-de-provence/
  ('Château Saint-André de Figuière', 'Pionnière Rosé', 'Provence, France', null, 'Rosé'),  -- https://figuierevins.com/les-vins-roses-de-provence/
  ('Château Saint-André de Figuière', 'Atmosphère', 'Provence, France', null, 'Rosé'),  -- https://figuierevins.com/les-vins-roses-de-provence/
  ('Château Saint-André de Figuière', 'Première Blanc', 'Provence, France', null, 'White'),  -- https://figuierevins.com/les-vins-blancs-de-provence/
  ('Château Saint-André de Figuière', 'Confidentielle Blanc', 'Provence, France', null, 'White'),  -- https://figuierevins.com/les-vins-blancs-de-provence/
  ('Château Saint-André de Figuière', 'Méditerranée Blanc', 'Provence, France', null, 'White'),  -- https://figuierevins.com/les-vins-blancs-de-provence/
  ('Château Saint-André de Figuière', 'Figure #4 Blanc', 'Provence, France', null, 'White'),  -- https://figuierevins.com/les-vins-blancs-de-provence/
  ('Château Saint-André de Figuière', 'Figure #3 Blanc', 'Provence, France', null, 'White'),  -- https://figuierevins.com/les-vins-blancs-de-provence/
  ('Château Saint-André de Figuière', 'Première Rouge', 'Provence, France', null, 'Red'),  -- https://figuierevins.com/les-vins-rouges-de-provence/
  ('Château Saint-André de Figuière', 'Confidentielle Rouge', 'Provence, France', null, 'Red'),  -- https://figuierevins.com/les-vins-rouges-de-provence/
  ('Château Saint-André de Figuière', 'Méditerranée Rouge', 'Provence, France', null, 'Red'),  -- https://figuierevins.com/les-vins-rouges-de-provence/
  ('Château Saint-André de Figuière', 'Figure #2 Rouge', 'Provence, France', null, 'Red')  -- https://figuierevins.com/les-vins-rouges-de-provence/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE TRIENNES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine de Triennes', 'Saint Auguste', 'Méditerranée IGP, Provence, France', null, 'Red'),  -- https://www.triennes.com/product-category/rouge/
  ('Domaine de Triennes', 'Saint Auguste Vieux', 'Méditerranée IGP, Provence, France', null, 'Red'),  -- https://www.triennes.com/product-category/rouge/
  ('Domaine de Triennes', 'Merlot', 'Méditerranée IGP, Provence, France', 'Merlot', 'Red'),  -- https://www.triennes.com/product-category/rouge/
  ('Domaine de Triennes', 'Les Auréliens Rouge', 'Méditerranée IGP, Provence, France', null, 'Red'),  -- https://www.triennes.com/product-category/rouge/
  ('Domaine de Triennes', 'Viognier Sainte Fleur', 'Méditerranée IGP, Provence, France', 'Viognier', 'White'),  -- https://www.triennes.com/product-category/blanc/
  ('Domaine de Triennes', 'Les Auréliens Blanc', 'Méditerranée IGP, Provence, France', null, 'White'),  -- https://www.triennes.com/product-category/blanc/
  ('Domaine de Triennes', 'Rosé', 'Méditerranée IGP, Provence, France', null, 'Rosé')  -- https://www.triennes.com/product-category/rose/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GAVOTY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine Gavoty', 'Grand Classique Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.gavoty.com/
  ('Domaine Gavoty', 'Grand Classique Blanc', 'Provence, France', null, 'White'),  -- https://www.gavoty.com/
  ('Domaine Gavoty', 'Grand Classique Rouge', 'Provence, France', null, 'Red'),  -- https://www.gavoty.com/
  ('Domaine Gavoty', 'Clarendon Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.gavoty.com/
  ('Domaine Gavoty', 'Clarendon Blanc', 'Provence, France', null, 'White'),  -- https://www.gavoty.com/
  ('Domaine Gavoty', 'Clarendon Rouge', 'Provence, France', null, 'Red'),  -- https://gavoty.com/produit/contretemps-2024/
  ('Domaine Gavoty', 'La Cigale Rouge', 'Provence, France', null, 'Red')  -- https://gavoty.com/produit/contretemps-2024/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE RIMAURESQ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Domaine de Rimauresq', 'Cuvée Classique Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.rimauresq.fr/
  ('Domaine de Rimauresq', 'Cuvée R Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.rimauresq.fr/
  ('Domaine de Rimauresq', 'Cuvée Classique Blanc', 'Provence, France', null, 'White'),  -- https://www.rimauresq.fr/
  ('Domaine de Rimauresq', 'Cuvée R Blanc', 'Provence, France', null, 'White'),  -- https://www.rimauresq.fr/
  ('Domaine de Rimauresq', 'Cuvée R Rouge', 'Provence, France', null, 'Red')  -- https://www.rimauresq.fr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA COSTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château La Coste', 'Rosé d''une Nuit', 'Provence, France', null, 'Rosé'),  -- https://boutique-chateau-la-coste.com/fr/boutique-en-ligne/vins.html
  ('Château La Coste', 'Château Rosé', 'Provence, France', null, 'Rosé'),  -- https://boutique-chateau-la-coste.com/fr/boutique-en-ligne/vins.html
  ('Château La Coste', 'Grand Vin Rosé', 'Provence, France', null, 'Rosé'),  -- https://boutique-chateau-la-coste.com/fr/boutique-en-ligne/vins.html
  ('Château La Coste', 'Grand Vin Rouge', 'Provence, France', null, 'Red'),  -- https://boutique-chateau-la-coste.com/fr/boutique-en-ligne/vins.html
  ('Château La Coste', 'Grand Vin Blanc', 'Provence, France', null, 'White'),  -- https://boutique-chateau-la-coste.com/fr/boutique-en-ligne/vins.html
  ('Château La Coste', 'Les Pentes Douces Rouge', 'Provence, France', null, 'Red'),  -- https://boutique-chateau-la-coste.com/fr/boutique-en-ligne/vins.html
  ('Château La Coste', 'Les Pentes Douces Blanc', 'Provence, France', null, 'White'),  -- https://boutique-chateau-la-coste.com/fr/boutique-en-ligne/vins.html
  ('Château La Coste', 'Le Blanc', 'Provence, France', null, 'White'),  -- https://boutique-chateau-la-coste.com/fr/boutique-en-ligne/vins.html
  ('Château La Coste', 'Le Rouge', 'Provence, France', null, 'Red')  -- https://boutique-chateau-la-coste.com/fr/boutique-en-ligne/vins.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU THUERRY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Thuerry', 'Les Abeillons Rouge', 'Provence, France', null, 'Red'),  -- https://www.chateauthuerry.com/appellation/les-abeillons/
  ('Château Thuerry', 'Les Abeillons Blanc', 'Provence, France', null, 'White'),  -- https://www.chateauthuerry.com/appellation/les-abeillons/
  ('Château Thuerry', 'Les Abeillons Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.chateauthuerry.com/appellation/les-abeillons/
  ('Château Thuerry', 'Le Château Blanc', 'Provence, France', null, 'White'),  -- https://www.chateauthuerry.com/appellation/les-abeillons/
  ('Château Thuerry', 'Le 21 Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.chateauthuerry.com/appellation/les-abeillons/
  ('Château Thuerry', 'L''Exception Blanc', 'Provence, France', null, 'White'),  -- https://www.chateauthuerry.com/appellation/lexception/
  ('Château Thuerry', 'L''Exception Rouge', 'Provence, France', null, 'Red'),  -- https://www.chateauthuerry.com/appellation/lexception/
  ('Château Thuerry', 'L''Exception Rosé', 'Provence, France', null, 'Rosé'),  -- https://www.chateauthuerry.com/appellation/lexception/
  ('Château Thuerry', 'L''Exception² Blanc', 'Provence, France', null, 'White'),  -- https://www.chateauthuerry.com/appellation/lexception/
  ('Château Thuerry', 'L''Exception² Rouge', 'Provence, France', null, 'Red')  -- https://www.chateauthuerry.com/appellation/lexception/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU COUSSIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Coussin', 'Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.sumeire.com/en/range/1/chateau-coussin
  ('Château Coussin', 'Rouge Sainte-Victoire', 'Côtes de Provence Sainte-Victoire, Provence, France', null, 'Red'),  -- https://www.sumeire.com/en/range/1/chateau-coussin
  ('Château Coussin', 'Rosé Cru Sainte-Victoire', 'Côtes de Provence Sainte-Victoire, Provence, France', null, 'Rosé'),  -- https://www.sumeire.com/en/range/1/chateau-coussin
  ('Château Coussin', 'La Croix du Prieur Blanc', 'Côtes de Provence, Provence, France', null, 'White'),  -- https://www.sumeire.com/en/range/1/chateau-coussin
  ('Château Coussin', 'La Croix du Prieur Rouge', 'Côtes de Provence, Provence, France', null, 'Red'),  -- https://www.sumeire.com/en/range/1/chateau-coussin
  ('Château Coussin', 'La Croix du Prieur Rosé', 'Côtes de Provence, Provence, France', null, 'Rosé')  -- https://www.sumeire.com/en/range/1/chateau-coussin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PIGOUDET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_provence.sql)'
from (values
  ('Château Pigoudet', 'L''Oratoire Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé'),  -- https://www.pigoudet.com/menu
  ('Château Pigoudet', 'La Chapelle Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé'),  -- https://www.pigoudet.com/menu
  ('Château Pigoudet', 'La Chapelle Blanc', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'White'),  -- https://www.pigoudet.com/
  ('Château Pigoudet', 'Signature Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé'),  -- https://www.pigoudet.com/menu
  ('Château Pigoudet', 'Quartier Rouge', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Red'),  -- https://www.pigoudet.com/menu
  ('Château Pigoudet', 'Grand Pigoudet Rouge', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Red'),  -- https://www.pigoudet.com/menu
  ('Château Pigoudet', 'Le Grand Pigoudet Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé'),  -- https://www.pigoudet.com/
  ('Château Pigoudet', 'Première Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé'),  -- https://www.pigoudet.com/menu
  ('Château Pigoudet', 'Soleil d''Enfer Rosé', 'Coteaux d''Aix-en-Provence, Provence, France', null, 'Rosé')  -- https://www.pigoudet.com/menu
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
