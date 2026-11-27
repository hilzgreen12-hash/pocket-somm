-- Producer ranges round 4: Loire. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- DOMAINE DU CLOSEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine du Closel', 'Savennières La Jalousie', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.domaine-du-closel.com/
  ('Domaine du Closel', 'Savennières Les Caillardières', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.domaine-du-closel.com/
  ('Domaine du Closel', 'Savennières Clos du Papillon', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.domaine-du-closel.com/
  ('Domaine du Closel', 'Vin de France Une Émotion', 'Loire Valley, France', null, 'Red')  -- https://www.domaine-du-closel.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- NICOLAS JOLY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Nicolas Joly', 'Savennières Coulée de Serrant Clos de la Coulée de Serrant', 'Savennières Coulée de Serrant, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.callmewine.com/en/coulee-de-serrant-nicolas-joly-B345.htm
  ('Nicolas Joly', 'Savennières Roche aux Moines Clos de la Bergerie', 'Savennières Roche aux Moines, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.callmewine.com/en/coulee-de-serrant-nicolas-joly-B345.htm
  ('Nicolas Joly', 'Savennières Les Vieux Clos', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White')  -- https://www.finevines.com/portfolio/producer/domaine-nicolas-joly
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PIERRE-BISE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château Pierre-Bise', 'Savennières Clos de Coulaine', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/chateau-pierre-bise
  ('Château Pierre-Bise', 'Savennières Clos le Grand Beaupréau', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/chateau-pierre-bise
  ('Château Pierre-Bise', 'Anjou Les Rouannières', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/chateau-pierre-bise
  ('Château Pierre-Bise', 'Anjou Le Haut de la Garde', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/chateau-pierre-bise
  ('Château Pierre-Bise', 'Coteaux du Layon Rochefort', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.avenuedesvins.fr/en/shop/chateau-pierre-bise
  ('Château Pierre-Bise', 'Quarts de Chaume Grand Cru', 'Quarts de Chaume, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.avenuedesvins.fr/en/shop/chateau-pierre-bise
  ('Château Pierre-Bise', 'Crémant de Loire', 'Crémant de Loire, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.avenuedesvins.fr/en/shop/chateau-pierre-bise
  ('Château Pierre-Bise', 'Anjou Villages Les Rouannières Spilite', 'Anjou Villages, Loire Valley, France', 'Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.avenuedesvins.fr/en/shop/chateau-pierre-bise
  ('Château Pierre-Bise', 'Savennières Roche aux Moines', 'Savennières Roche aux Moines, Loire Valley, France', 'Chenin Blanc', 'White')  -- https://www.thewinedoctor.com/tastingsformal/pierrebise2023.shtml
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RICHARD LEROY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Richard Leroy', 'Anjou Les Noëls de Montbenault', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.lapassionduvin.com/loire/1589-domaine-richard-leroy-les-noels-de-montbenault-2021
  ('Richard Leroy', 'Anjou Les Rouliers', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White')  -- https://www.lapassionduvin.com/loire/1589-domaine-richard-leroy-les-noels-de-montbenault-2021
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PATRICK BAUDOUIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Patrick Baudouin', 'Anjou Blanc Clos des Bruandières', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Anjou Blanc Le Cornillard', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Anjou Blanc Effusion', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Anjou Blanc La Fresnaye', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Anjou Blanc Les Gâts', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Anjou Blanc Les Saulaies', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Anjou Blanc Les Zersilles', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Savennières', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Savennières Bellevue', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Anjou Rouge Les Côteaux d''Ardenay', 'Anjou, Loire Valley, France', null, 'Red'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Anjou Rouge La Fresnaye', 'Anjou, Loire Valley, France', null, 'Red'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Anjou Rouge Les Touches', 'Anjou, Loire Valley, France', null, 'Red'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Coteaux du Layon 1896', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Coteaux du Layon Les Bruandières', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Quarts de Chaume Maria Juby', 'Quarts de Chaume, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
  ('Domaine Patrick Baudouin', 'Quarts de Chaume Les Zersilles', 'Quarts de Chaume, Loire Valley, France', 'Chenin Blanc', 'Sweet')  -- https://www.beckywasserman.com/domaines/patrick-baudouin/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE FESLES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château de Fesles', 'Coteaux du Layon', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://chateaudefesles.com/fr/114-nos-vins-d-anjou
  ('Château de Fesles', 'Anjou Blanc', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://chateaudefesles.com/fr/114-nos-vins-d-anjou
  ('Château de Fesles', 'Anjou Rouge', 'Anjou, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://chateaudefesles.com/fr/114-nos-vins-d-anjou
  ('Château de Fesles', 'Anjou Villages', 'Anjou Villages, Loire Valley, France', null, 'Red'),  -- https://chateaudefesles.com/fr/114-nos-vins-d-anjou
  ('Château de Fesles', 'Rosé d''Anjou La Chapelle', 'Rosé d''Anjou, Loire Valley, France', null, 'Rosé'),  -- https://chateaudefesles.com/fr/114-nos-vins-d-anjou
  ('Château de Fesles', 'Cabernet d''Anjou', 'Cabernet d''Anjou, Loire Valley, France', null, 'Rosé'),  -- https://chateaudefesles.com/fr/114-nos-vins-d-anjou
  ('Château de Fesles', 'Bonnezeaux', 'Bonnezeaux, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://chateaudefesles.com/fr/114-nos-vins-d-anjou
  ('Château de Fesles', 'Crémant de Loire La Chapelle Brut', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://chateaudefesles.com/fr/150-nos-cremants-de-loire
  ('Château de Fesles', 'Crémant de Loire La Sorinière Blanc Brut', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling')  -- https://chateaudefesles.com/fr/150-nos-cremants-de-loire
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES BAUMARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine des Baumard', 'Savennières', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://vintus.com/?p=495
  ('Domaine des Baumard', 'Savennières Trie Spéciale', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://vintus.com/?p=495
  ('Domaine des Baumard', 'Savennières Clos du Papillon', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://vintus.com/?p=495
  ('Domaine des Baumard', 'Quarts de Chaume', 'Quarts de Chaume, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://vintus.com/?p=495
  ('Domaine des Baumard', 'Crémant de Loire Carte Turquoise Brut', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://vintus.com/?p=495
  ('Domaine des Baumard', 'Anjou Le Logis', 'Anjou, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://vintus.com/?p=495
  ('Domaine des Baumard', 'Savennières Clos de Saint Yves', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.nataliemaclean.com/wineries/info/domaine-des-baumard/27467
  ('Domaine des Baumard', 'Coteaux du Layon Carte d''Or', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet')  -- https://www.nataliemaclean.com/wineries/info/domaine-des-baumard/27467
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE OGEREAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Ogereau', 'Crémant de Loire Brut de Schistes', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'L''Enjouée Blanc', 'Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Chenin Non Ouillé', 'Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Anjou Blanc Bonnes Blanches Sec', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Anjou Blanc En Chenin', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Anjou Ronceray La Martinière', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Anjou Blanc Vent de Spilite', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Savennières Clos le Grand Beaupréau', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Savennières L''Enthousiasme', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Savennières La Saponaire', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Anjou Rouge L''Enjouée', 'Anjou, Loire Valley, France', 'Cabernet Franc, Grolleau', 'Red'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Grolleau Pinot d''Aunis', 'Loire Valley, France', 'Grolleau, Pinot d''Aunis', 'Red'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Grolleau', 'Loire Valley, France', 'Grolleau', 'Red'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Anjou Rouge Les Tailles', 'Anjou, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Anjou Rouge Côte de la Houssaye', 'Anjou, Loire Valley, France', 'Cabernet Sauvignon', 'Red'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Coteaux du Layon Saint Lambert', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Coteaux du Layon Bonnes Blanches', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Coteaux du Layon 1er Cru Chaume', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.beckywasserman.com/domaines/ogereau/
  ('Domaine Ogereau', 'Quarts de Chaume Grand Cru La Martinière', 'Quarts de Chaume, Loire Valley, France', 'Chenin Blanc', 'Sweet')  -- https://www.beckywasserman.com/domaines/ogereau/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU SOUCHERIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château Soucherie', 'Anjou Blanc Les Rangs de Long', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.rosenthalwinemerchant.com/growers/chateau-soucherie-1217
  ('Château Soucherie', 'Anjou Rouge Reliefs', 'Anjou, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.grandcruwijnen.nl/en/wijnen/wijnhuis/chateau-soucherie
  ('Château Soucherie', 'Coteaux du Layon Patrimoine', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.rosenthalwinemerchant.com/growers/chateau-soucherie-1217
  ('Château Soucherie', 'Coteaux du Layon 1er Cru Chaume', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.rosenthalwinemerchant.com/growers/chateau-soucherie-1217
  ('Château Soucherie', 'Rosé de Loire Cuvée L''Astrée', 'Rosé de Loire, Loire Valley, France', null, 'Rosé'),  -- https://www.rosenthalwinemerchant.com/growers/chateau-soucherie-1217
  ('Château Soucherie', 'Savennières Clos des Perrières', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.rosenthalwinemerchant.com/growers/chateau-soucherie-1217
  ('Château Soucherie', 'Anjou Blanc Blanc Ivoire', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White')  -- https://www.grandcruwijnen.nl/en/wijnen/wijnhuis/chateau-soucherie
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE BABLUT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de Bablut', 'Coteaux de l''Aubance Vin Noble', 'Coteaux de l''Aubance, Loire Valley, France', null, 'Sweet'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1921/daviau
  ('Domaine de Bablut', 'Coteaux de l''Aubance Unique', 'Coteaux de l''Aubance, Loire Valley, France', null, 'Sweet'),  -- https://www.thewinedoctor.com/tastingsformal/bablut2024.shtml
  ('Domaine de Bablut', 'Anjou Ordovicien', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1921/daviau
  ('Domaine de Bablut', 'Anjou Villages Brissac Petra Alba', 'Anjou Villages Brissac, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1921/daviau
  ('Domaine de Bablut', 'Anjou Villages Brissac Rocca Nigra', 'Anjou Villages Brissac, Loire Valley, France', 'Cabernet Sauvignon', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1921/daviau
  ('Domaine de Bablut', 'Crémant de Loire', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling')  -- https://www.hachette-vins.com/guide-vins/producteurs/1921/daviau
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PHILIPPE DELESVAUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Philippe Delesvaux', 'Coteaux du Layon Sélection de Grains Nobles', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.thewinedoctor.com/loire/delesvaux_3.shtml
  ('Domaine Philippe Delesvaux', 'Coteaux du Layon Les Clos', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.thewinedoctor.com/loire/delesvaux_3.shtml
  ('Domaine Philippe Delesvaux', 'Coteaux du Layon Passerillé', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.thewinedoctor.com/loire/delesvaux_3.shtml
  ('Domaine Philippe Delesvaux', 'Coteaux du Layon', 'Coteaux du Layon, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.lapassionduvin.com/loire/39055-domaine-philippe-delesvaux?start=330
  ('Domaine Philippe Delesvaux', 'Anjou Feuille d''Or', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.lapassionduvin.com/loire/39055-domaine-philippe-delesvaux?start=330
  ('Domaine Philippe Delesvaux', 'Anjou Blanc Authentique Franc de Pied', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.lapassionduvin.com/loire/39055-domaine-philippe-delesvaux?start=330
  ('Domaine Philippe Delesvaux', 'Anjou Rouge Le Roc', 'Anjou, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.lapassionduvin.com/loire/39055-domaine-philippe-delesvaux?start=330
  ('Domaine Philippe Delesvaux', 'Anjou Rouge La Montée de l''Épine', 'Anjou, Loire Valley, France', 'Cabernet Sauvignon', 'Red')  -- https://www.lapassionduvin.com/loire/39055-domaine-philippe-delesvaux?start=330
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU D'ÉPIRÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château d''Épiré', 'Savennières Le Parc', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.chateau-epire.com/lesvins/
  ('Château d''Épiré', 'Savennières Le Hu-Boyau', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.chateau-epire.com/lesvins/
  ('Château d''Épiré', 'Savennières La Croix Picot', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.chateau-epire.com/lesvins/
  ('Château d''Épiré', 'Savennières Roche aux Moines Clos de Rochepin', 'Savennières Roche aux Moines, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.chateau-epire.com/lesvins/
  ('Château d''Épiré', 'Savennières Moelleux Comtesse de Las Cases', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'Sweet')  -- https://www.restonsenvigne.fr/domaines/chateau-depire/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE AUX MOINES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine aux Moines', 'Savennières Roche aux Moines', 'Savennières Roche aux Moines, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.internationalfinewines.com.au/pages/domaine-aux-moines
  ('Domaine aux Moines', 'Vin de France Le Berceau des Fées', 'Loire Valley, France', 'Chenin Blanc', 'White')  -- https://www.internationalfinewines.com.au/pages/domaine-aux-moines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE RICHOU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Richou', 'Anjou Blanc Pavillon', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://thewineilove.com/france/loire-valley/domaine-richou.html
  ('Domaine Richou', 'Anjou Blanc Large Soif', 'Anjou, Loire Valley, France', 'Chenin Blanc, Chardonnay', 'White'),  -- https://thewineilove.com/france/loire-valley/domaine-richou.html
  ('Domaine Richou', 'Anjou Rouge Les 4 Chemins', 'Anjou, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://thewineilove.com/france/loire-valley/domaine-richou.html
  ('Domaine Richou', 'Coteaux de l''Aubance Sélection', 'Coteaux de l''Aubance, Loire Valley, France', null, 'Sweet'),  -- https://thewineilove.com/france/loire-valley/domaine-richou.html
  ('Domaine Richou', 'Anjou Terre de 3', 'Anjou, Loire Valley, France', null, 'White'),  -- https://thewineilove.com/france/loire-valley/domaine-richou.html
  ('Domaine Richou', 'Anjou Chauvigné', 'Anjou, Loire Valley, France', null, 'White'),  -- https://thewineilove.com/france/loire-valley/domaine-richou.html
  ('Domaine Richou', 'Anjou Les Rogeries', 'Anjou, Loire Valley, France', null, 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/2001/scea-dom-richou
  ('Domaine Richou', 'Coteaux de l''Aubance Les 3 Demoiselles', 'Coteaux de l''Aubance, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://thewineilove.com/france/loire-valley/domaine-richou.html
  ('Domaine Richou', 'Coteaux de l''Aubance Violettes', 'Coteaux de l''Aubance, Loire Valley, France', null, 'Sweet'),  -- https://thewineilove.com/france/loire-valley/domaine-richou.html
  ('Domaine Richou', 'Savennières La Bigottière', 'Savennières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://thewineilove.com/france/loire-valley/domaine-richou.html
  ('Domaine Richou', 'Anjou Villages Brissac', 'Anjou Villages Brissac, Loire Valley, France', 'Cabernet Franc, Cabernet Sauvignon', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/2001/scea-dom-richou
  ('Domaine Richou', 'Anjou Gamay Les Châteliers', 'Anjou, Loire Valley, France', 'Gamay', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/2001/scea-dom-richou
  ('Domaine Richou', 'Crémant de Loire Dom Nature', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling')  -- https://www.hachette-vins.com/guide-vins/producteurs/2001/scea-dom-richou
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PASCAL JOLIVET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Pascal Jolivet', 'Sancerre Blanc Signature', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/signature/
  ('Pascal Jolivet', 'Blanc Fumé', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/produits/vins/signature/blanc-fume/
  ('Pascal Jolivet', 'Sancerre Rosé Signature', 'Sancerre, Loire Valley, France', null, 'Rosé'),  -- https://pascaljolivet.com/nos-vins/signature/
  ('Pascal Jolivet', 'Sancerre Rouge Signature', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://pascaljolivet.com/nos-vins/signature/
  ('Pascal Jolivet', 'Sancerre Les Caillottes', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/les-caillottes-terres-blanches/
  ('Pascal Jolivet', 'Pouilly-Fumé Terres Blanches', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/les-caillottes-terres-blanches/
  ('Pascal Jolivet', 'Sancerre Clos du Roy', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/les-parcellaires/
  ('Pascal Jolivet', 'Sancerre Le Grand Chemarin', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/les-parcellaires/
  ('Pascal Jolivet', 'Sancerre Le Chêne Marchand', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/les-parcellaires/
  ('Pascal Jolivet', 'Sancerre Le Roc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/les-parcellaires/
  ('Pascal Jolivet', 'Sancerre Rouge La Bondenotte', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://pascaljolivet.com/nos-vins/les-parcellaires/
  ('Pascal Jolivet', 'Pouilly-Fumé Les Griottes', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/les-parcellaires/
  ('Pascal Jolivet', 'Sancerre Sauvage', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/pure-expression/
  ('Pascal Jolivet', 'Sancerre Rouge Autochtone', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://pascaljolivet.com/nos-vins/pure-expression/
  ('Pascal Jolivet', 'Pouilly-Fumé Indigène', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/nos-vins/pure-expression/
  ('Pascal Jolivet', 'Attitude Sauvignon Blanc', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://pascaljolivet.com/vins/attitude/
  ('Pascal Jolivet', 'Attitude Pinot Noir', 'Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://pascaljolivet.com/vins/attitude/
  ('Pascal Jolivet', 'Attitude Rosé', 'Loire Valley, France', null, 'Rosé'),  -- https://pascaljolivet.com/vins/attitude/
  ('Pascal Jolivet', 'Coteaux du Giennois Édition Blanc', 'Coteaux du Giennois, Loire Valley, France', null, 'White'),  -- https://pascaljolivet.com/vins/edition/
  ('Pascal Jolivet', 'Coteaux du Giennois Édition Rouge', 'Coteaux du Giennois, Loire Valley, France', null, 'Red')  -- https://pascaljolivet.com/vins/edition/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LADOUCETTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de Ladoucette', 'Pouilly-Fumé', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://mmdusa.net/portfolio/ladoucette/wines
  ('Domaine de Ladoucette', 'Pouilly-Fumé Baron de L', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://mmdusa.net/portfolio/ladoucette/wines
  ('Domaine de Ladoucette', 'Sancerre Comte Lafond', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://mmdusa.net/portfolio/ladoucette/wines
  ('Domaine de Ladoucette', 'Sancerre Comte Lafond Grande Cuvée Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://mmdusa.net/portfolio/ladoucette/comte-lafond-grande-cuvee-blanc/2023
  ('Domaine de Ladoucette', 'Touraine Les Deux Tours Sauvignon Blanc', 'Touraine, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://mmdusa.net/portfolio/ladoucette/les-deux-tours-sauvignon-blanc/2023
  ('Domaine de Ladoucette', 'Sancerre Comte Lafond Rosé', 'Sancerre, Loire Valley, France', null, 'Rosé')  -- https://fells.co.uk/our-producers/domaine-de-ladoucette/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JOSEPH MELLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Joseph Mellot', 'Sancerre La Châtellenie', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/sancerre/
  ('Domaine Joseph Mellot', 'Sancerre Domaine des Emois', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/sancerre/
  ('Domaine Joseph Mellot', 'Sancerre La Grande Châtelaine', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/sancerre/
  ('Domaine Joseph Mellot', 'Sancerre Cuvée Pierre Etienne', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/sancerre/
  ('Domaine Joseph Mellot', 'Sancerre Le Rabault Rosé', 'Sancerre, Loire Valley, France', null, 'Rosé'),  -- https://josephmellot.com/boutique/?product-page=2
  ('Domaine Joseph Mellot', 'Sancerre Le Rabault Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://josephmellot.com/boutique/?product-page=2
  ('Domaine Joseph Mellot', 'Pouilly-Fumé Le Chant des Vignes', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/pouilly-fume/
  ('Domaine Joseph Mellot', 'Pouilly-Fumé Le Troncsec', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/pouilly-fume/
  ('Domaine Joseph Mellot', 'Pouilly-Fumé Domaine des Mariniers', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/pouilly-fume/
  ('Domaine Joseph Mellot', 'Pouilly-Fumé Les Grands Edvins', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/pouilly-fume/
  ('Domaine Joseph Mellot', 'Pouilly-sur-Loire Les Brémailles', 'Pouilly-sur-Loire, Loire Valley, France', 'Chasselas', 'White'),  -- https://josephmellot.com/appellation/pouilly-sur-loire/
  ('Domaine Joseph Mellot', 'Coteaux du Giennois La Gaupière', 'Coteaux du Giennois, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/coteaux-du-giennois/
  ('Domaine Joseph Mellot', 'Coteaux du Giennois Les Champs de Chaumes', 'Coteaux du Giennois, Loire Valley, France', null, 'Red'),  -- https://josephmellot.com/appellation/coteaux-du-giennois/
  ('Domaine Joseph Mellot', 'Menetou-Salon Les Thureaux Blanc', 'Menetou-Salon, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/menetou-salon/
  ('Domaine Joseph Mellot', 'Menetou-Salon Les Thureaux Rouge', 'Menetou-Salon, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://josephmellot.com/appellation/menetou-salon/
  ('Domaine Joseph Mellot', 'Menetou-Salon Le Clos du Pressoir', 'Menetou-Salon, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://josephmellot.com/appellation/menetou-salon/
  ('Domaine Joseph Mellot', 'Quincy Jean-Michel Sorbe', 'Quincy, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/quincy/
  ('Domaine Joseph Mellot', 'Quincy Le Clos de la Victoire', 'Quincy, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/quincy/
  ('Domaine Joseph Mellot', 'Reuilly Jean-Michel Sorbe Blanc', 'Reuilly, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/reuilly/
  ('Domaine Joseph Mellot', 'Reuilly Jean-Michel Sorbe Rosé', 'Reuilly, Loire Valley, France', null, 'Rosé'),  -- https://josephmellot.com/appellation/reuilly/
  ('Domaine Joseph Mellot', 'Reuilly Jean-Michel Sorbe Rouge', 'Reuilly, Loire Valley, France', null, 'Red'),  -- https://josephmellot.com/boutique/?product-page=2
  ('Domaine Joseph Mellot', 'Reuilly La Commanderie Blanc', 'Reuilly, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/reuilly/
  ('Domaine Joseph Mellot', 'Reuilly La Commanderie Rouge', 'Reuilly, Loire Valley, France', null, 'Red'),  -- https://josephmellot.com/boutique/?product-page=2
  ('Domaine Joseph Mellot', 'Reuilly La Muse Rosé', 'Reuilly, Loire Valley, France', null, 'Rosé'),  -- https://josephmellot.com/appellation/reuilly/
  ('Domaine Joseph Mellot', 'Châteaumeillant Cuvée Geoffrenet Morval Rosé', 'Châteaumeillant, Loire Valley, France', null, 'Rosé'),  -- https://josephmellot.com/appellation/chateaumeillant/
  ('Domaine Joseph Mellot', 'Châteaumeillant Cuvée Geoffrenet Morval Rouge', 'Châteaumeillant, Loire Valley, France', null, 'Red'),  -- https://josephmellot.com/appellation/chateaumeillant/
  ('Domaine Joseph Mellot', 'Touraine Chenonceaux Les Eclats de Silex', 'Touraine Chenonceaux, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/touraine-chenonceaux/
  ('Domaine Joseph Mellot', 'Chinon Les Morinières', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://josephmellot.com/appellation/chinon/
  ('Domaine Joseph Mellot', 'Chinon Les Royaux', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://josephmellot.com/appellation/chinon/
  ('Domaine Joseph Mellot', 'Saint-Nicolas-de-Bourgueil Le Moulingenêt', 'Saint-Nicolas-de-Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://josephmellot.com/appellation/saint-nicolas-de-bourgueil/
  ('Domaine Joseph Mellot', 'Saumur-Champigny Le Boisclair', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://josephmellot.com/appellation/saumur-champigny/
  ('Domaine Joseph Mellot', 'Mel''low Sauvignon Blanc', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://josephmellot.com/appellation/igp-val-de-loire/
  ('Domaine Joseph Mellot', 'Sincérité Blanc', 'Loire Valley, France', null, 'White'),  -- https://josephmellot.com/appellation/igp-val-de-loire/
  ('Domaine Joseph Mellot', 'Sincérité Rosé', 'Loire Valley, France', null, 'Rosé'),  -- https://josephmellot.com/appellation/igp-val-de-loire/
  ('Domaine Joseph Mellot', 'Sincérité Rouge', 'Loire Valley, France', null, 'Red'),  -- https://josephmellot.com/appellation/igp-val-de-loire/
  ('Domaine Joseph Mellot', 'Crémant de Loire Le Marquis', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling')  -- https://josephmellot.com/appellation/cremant-de-loire/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ALPHONSE MELLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Alphonse Mellot', 'Sancerre Rouge En Grands Champs', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Sancerre Rouge Génération XIX', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Sancerre Blanc Génération XIX', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Sancerre Rouge La Demoiselle', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Sancerre Blanc La Demoiselle', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/uk/domain/3001-Alphonse-Mellot.jsp
  ('Domaine Alphonse Mellot', 'Sancerre Rouge La Petite Moussière', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Sancerre Rouge La Moussière', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Sancerre Blanc La Moussière', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/uk/domain/3001-Alphonse-Mellot.jsp
  ('Domaine Alphonse Mellot', 'Sancerre Rosé La Moussière', 'Sancerre, Loire Valley, France', null, 'Rosé'),  -- https://www.idealwine.com/uk/domain/3001-Alphonse-Mellot.jsp
  ('Domaine Alphonse Mellot', 'Sancerre Blanc Edmond', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Sancerre Blanc Les Romains', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/uk/domain/3001-Alphonse-Mellot.jsp
  ('Domaine Alphonse Mellot', 'Sancerre Rouge Le Paradis', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/3001-Alphonse-Mellot.jsp
  ('Domaine Alphonse Mellot', 'Sancerre Blanc Satellite', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/uk/domain/3001-Alphonse-Mellot.jsp
  ('Domaine Alphonse Mellot', 'Côtes de la Charité Rouge Les Pénitents', 'Loire Valley, France', null, 'Red'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Côtes de la Charité Blanc Les Pénitents', 'Loire Valley, France', null, 'White'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Côtes de la Charité Blanc Bobby', 'Loire Valley, France', null, 'White'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Côtes de la Charité Rouge Bobby', 'Loire Valley, France', null, 'Red'),  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
  ('Domaine Alphonse Mellot', 'Sancerre Rosé Bobby', 'Sancerre, Loire Valley, France', null, 'Rosé')  -- https://www.grandsbourgognes.com/en/wine-estates/val-de-loire/domaine-alphonse-mellot-368
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE THOMAS-LABAILLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Thomas-Labaille', 'Sancerre L''Authentique', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bowlerwine.com/producer/thomas-labaille
  ('Domaine Thomas-Labaille', 'Sancerre Monts Damnés', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bowlerwine.com/producer/thomas-labaille
  ('Domaine Thomas-Labaille', 'Sancerre Monts Damnés Cuvée Buster', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bowlerwine.com/producer/thomas-labaille
  ('Domaine Thomas-Labaille', 'Sancerre L''Authentique Rosé', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Rosé')  -- https://www.bowlerwine.com/producer/thomas-labaille
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN-MAX ROGER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Jean-Max Roger', 'Sancerre Cuvée Marnes et Caillottes', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://nobleselection.kork.ca/en/our-wineries/jean-max-roger
  ('Domaine Jean-Max Roger', 'Sancerre Cuvée Genèse', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://nobleselection.kork.ca/en/our-wineries/jean-max-roger
  ('Domaine Jean-Max Roger', 'Sancerre Cuvée Les Caillottes', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://nobleselection.kork.ca/en/our-wineries/jean-max-roger
  ('Domaine Jean-Max Roger', 'Sancerre La Grange Dimière Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red')  -- https://nobleselection.kork.ca/en/our-wineries/jean-max-roger
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FOURNIER PÈRE ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Fournier Père et Fils', 'Vin de France F de Fournier Pinot Noir', 'Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Vin de France F de Fournier Sauvignon Blanc', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Pouilly-Fumé Grande Cuvée', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Pouilly-Fumé Les Deux Cailloux', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Sancerre Les Belles Vignes', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Sancerre Rouge Les Belles Vignes', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Sancerre Rouge Village de Sancerre', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Val de Loire MMM Sauvignon Blanc', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Val de Loire MMM Chenin Blanc', 'Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Val de Loire MMM Pinot Noir Rosé', 'Loire Valley, France', 'Pinot Noir', 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'MMM Pinot Noir Rouge', 'Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Menetou-Salon Blanc Côtes de Morogues', 'Menetou-Salon, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
  ('Domaine Fournier Père et Fils', 'Menetou-Salon Rouge Côtes de Morogues', 'Menetou-Salon, Loire Valley, France', 'Pinot Noir', 'Red')  -- https://www.avenuedesvins.fr/en/shop/domaine-fournier-pere-et-fils
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HENRI BOURGEOIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Henri Bourgeois', 'Sancerre Grande Réserve Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Sancerre Grande Réserve Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Sancerre Grande Réserve Rosé', 'Sancerre, Loire Valley, France', null, 'Rosé'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Sancerre d''Antan', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Sancerre Jadis', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Pouilly-Fumé JS-150', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Sancerre ES-56 Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Sancerre ES-56 Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Sancerre La Bourgeoise Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Pouilly-Fumé La Demoiselle de Bourgeois', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Pouilly-Fumé En Travertin', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://famillebourgeois-sancerre.com/collections/boutique
  ('Henri Bourgeois', 'Sancerre Les Baronnes Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.thewineilove.com/france/loire-valley/domaine-henri-bourgeois.html
  ('Henri Bourgeois', 'Sancerre Les Baronnes Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.thewineilove.com/france/loire-valley/domaine-henri-bourgeois.html
  ('Henri Bourgeois', 'Sancerre Les Baronnes Rosé', 'Sancerre, Loire Valley, France', null, 'Rosé'),  -- https://www.thewineilove.com/france/loire-valley/domaine-henri-bourgeois.html
  ('Henri Bourgeois', 'Sancerre La Côte des Monts Damnés', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.thewineilove.com/france/loire-valley/domaine-henri-bourgeois.html
  ('Henri Bourgeois', 'Sancerre La Bourgeoise Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/uk/domain/3002-Henri-Bourgeois.jsp
  ('Henri Bourgeois', 'Petit Bourgeois Sauvignon Blanc', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://nataliemaclean.com/wineries/info/henri-bourgeois/1402
  ('Henri Bourgeois', 'Sancerre Porte de Caillou Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White')  -- https://nataliemaclean.com/wineries/info/henri-bourgeois/1402
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE VACHERON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Vacheron', 'Sancerre Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bbr.com/producer-735-domaine-vacheron
  ('Domaine Vacheron', 'Sancerre Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-735-domaine-vacheron
  ('Domaine Vacheron', 'Sancerre Rouge Belle Dame', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-735-domaine-vacheron
  ('Domaine Vacheron', 'Sancerre Le Paradis', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bbr.com/producer-735-domaine-vacheron
  ('Domaine Vacheron', 'Sancerre Guigne-Chèvres', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bbr.com/producer-735-domaine-vacheron
  ('Domaine Vacheron', 'Sancerre L''Enclos des Remparts', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bbr.com/producer-735-domaine-vacheron
  ('Domaine Vacheron', 'Sancerre Rosé', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Rosé')  -- https://www.vivino.com/en/wineries/domaine-vacheron
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FRANÇOIS COTAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine François Cotat', 'Sancerre Caillottes', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://northberkeleyimports.com/wordpress/?p=1150
  ('Domaine François Cotat', 'Sancerre Les Monts Damnés', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://northberkeleyimports.com/wordpress/?p=1150
  ('Domaine François Cotat', 'Sancerre Les Culs de Beaujeu', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://northberkeleyimports.com/wordpress/?p=1150
  ('Domaine François Cotat', 'Sancerre La Grande Côte', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://northberkeleyimports.com/wordpress/?p=1150
  ('Domaine François Cotat', 'Sancerre Rosé', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Rosé'),  -- https://northberkeleyimports.com/wordpress/?p=1150
  ('Domaine François Cotat', 'Chavignol Rouge', 'Loire Valley, France', null, 'Red')  -- https://northberkeleyimports.com/wordpress/?p=1150
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PASCAL COTAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Pascal Cotat', 'Sancerre Les Monts Damnés', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://northberkeleyimports.com/wordpress/?p=1152
  ('Pascal Cotat', 'Sancerre La Grande Côte', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://northberkeleyimports.com/wordpress/?p=1152
  ('Pascal Cotat', 'Vin de Table Chavignol Rosé', 'Loire Valley, France', 'Pinot Noir', 'Rosé')  -- https://northberkeleyimports.com/wordpress/?p=1152
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LUCIEN CROCHET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Lucien Crochet', 'Sancerre Blanc Les Calcaires', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.lucien-crochet.fr/en/vins/
  ('Lucien Crochet', 'Sancerre Blanc Le Chêne Marchand', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.lucien-crochet.fr/en/vins/
  ('Lucien Crochet', 'Sancerre Blanc La Louisonne', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.lucien-crochet.fr/en/vins/
  ('Lucien Crochet', 'Sancerre Pinot Rosé', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Rosé'),  -- https://www.lucien-crochet.fr/en/vins/
  ('Lucien Crochet', 'Sancerre Rouge La Croix du Roy', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.lucien-crochet.fr/en/vins/
  ('Lucien Crochet', 'Sancerre Rouge Cuvée Prestige', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.lucien-crochet.fr/en/vins/
  ('Lucien Crochet', 'Vin de France Vendange du 7 Octobre', 'Loire Valley, France', 'Sauvignon Blanc', 'White')  -- https://www.lucien-crochet.fr/en/vins/vendange-du-7-octobre-2022-1-8.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GÉRARD BOULAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Gérard Boulay', 'Sancerre à Chavignol', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bibendum.com.au/pages/gerard-boulay
  ('Gérard Boulay', 'Sancerre Les Monts Damnés', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bibendum.com.au/pages/gerard-boulay
  ('Gérard Boulay', 'Sancerre Comtesse', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bibendum.com.au/pages/gerard-boulay
  ('Gérard Boulay', 'Sancerre La Côte', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bibendum.com.au/pages/gerard-boulay
  ('Gérard Boulay', 'Sancerre Clos de Beaujeu', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bibendum.com.au/pages/gerard-boulay
  ('Gérard Boulay', 'Sancerre Rosé Sibylle', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Rosé'),  -- https://www.bibendum.com.au/pages/gerard-boulay
  ('Gérard Boulay', 'Sancerre à Chavignol Rosé', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Rosé'),  -- https://www.vivino.com/en/wineries/gerard-boulay
  ('Gérard Boulay', 'Sancerre à Chavignol Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red')  -- https://www.vivino.com/en/wineries/gerard-boulay
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HENRI PELLÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Henri Pellé', 'Menetou-Salon Blanc', 'Menetou-Salon, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Menetou-Salon Rouge', 'Menetou-Salon, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Menetou-Salon Morogues Blanc', 'Menetou-Salon, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Menetou-Salon Morogues Rouge', 'Menetou-Salon, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Menetou-Salon Morogues Rosé', 'Menetou-Salon, Loire Valley, France', null, 'Rosé'),  -- https://thewineilove.com/france/loire-valley/domaine-pelle.html
  ('Domaine Henri Pellé', 'Menetou-Salon Morogues Vignes de Ratier', 'Menetou-Salon, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Menetou-Salon Morogues Le Carroir Blanc', 'Menetou-Salon, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Menetou-Salon Morogues Le Carroir Rouge', 'Menetou-Salon, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Menetou-Salon Les Blanchais', 'Menetou-Salon, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Menetou-Salon Morogues Les Cris', 'Menetou-Salon, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Menetou-Salon Les Bornés Blanc', 'Menetou-Salon, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://thewineilove.com/france/loire-valley/domaine-pelle.html
  ('Domaine Henri Pellé', 'Menetou-Salon Les Bornés Rouge', 'Menetou-Salon, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://thewineilove.com/france/loire-valley/domaine-pelle.html
  ('Domaine Henri Pellé', 'Sancerre La Croix au Garde Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.domainepelle.com/nos-vins/
  ('Domaine Henri Pellé', 'Sancerre La Croix au Garde Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red')  -- https://www.domainepelle.com/nos-vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DIDIER DAGUENEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Didier Dagueneau', 'Vin de France Silex', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.alliancewine.com/domaine-didier-dagueneau/sancerre-blanc-le-mont-damne-2023-6807
  ('Domaine Didier Dagueneau', 'Vin de France Pur Sang', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.alliancewine.com/domaine-didier-dagueneau/sancerre-blanc-le-mont-damne-2023-6807
  ('Domaine Didier Dagueneau', 'Vin de France Buisson Renard', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.alliancewine.com/domaine-didier-dagueneau/sancerre-blanc-le-mont-damne-2023-6807
  ('Domaine Didier Dagueneau', 'Vin de France Blanc Etc', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.alliancewine.com/domaine-didier-dagueneau/sancerre-blanc-le-mont-damne-2023-6807
  ('Domaine Didier Dagueneau', 'Vin de France XXI', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.alliancewine.com/domaine-didier-dagueneau/sancerre-blanc-le-mont-damne-2023-6807
  ('Domaine Didier Dagueneau', 'Vin de France Clos du Calvaire', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.alliancewine.com/domaine-didier-dagueneau/clos-du-calvaire-vin-de-france-2022-6410
  ('Domaine Didier Dagueneau', 'Vin de France Astéroïde', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.alliancewine.com/domaine-didier-dagueneau/asteroide-vin-de-france-2022-6407
  ('Domaine Didier Dagueneau', 'Sancerre Le Mont Damné', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.alliancewine.com/domaine-didier-dagueneau/sancerre-blanc-le-mont-damne-2023-6807
  ('Domaine Didier Dagueneau', 'Blanc Fumé de Pouilly Silex', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bbr.com/producer-5757-didier-dagueneau
  ('Domaine Didier Dagueneau', 'Blanc Fumé de Pouilly Pur Sang', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bbr.com/producer-5757-didier-dagueneau
  ('Domaine Didier Dagueneau', 'Blanc Fumé de Pouilly Buisson Renard', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.bbr.com/producer-5757-didier-dagueneau
  ('Domaine Didier Dagueneau', 'Blanc Fumé de Pouilly', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White')  -- https://www.bbr.com/producer-5757-didier-dagueneau
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HIPPOLYTE REVERDY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Hippolyte Reverdy', 'Sancerre Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://kermitlynch.com/files/hippolyte-reverdy.pdf
  ('Domaine Hippolyte Reverdy', 'Sancerre Blanc Cuvée Ortus', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://kermitlynch.com/files/hippolyte-reverdy.pdf
  ('Domaine Hippolyte Reverdy', 'Sancerre Rosé', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Rosé'),  -- https://kermitlynch.com/files/hippolyte-reverdy.pdf
  ('Domaine Hippolyte Reverdy', 'Sancerre Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red')  -- https://kermitlynch.com/files/hippolyte-reverdy.pdf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MICHEL REDDE ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Michel Redde et Fils', 'Pouilly-Fumé La Moynerie', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Redde%20%26%20Fils
  ('Domaine Michel Redde et Fils', 'Pouilly-Fumé Petit F', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/en/buy-a-wine/2760030-1-bottle-Pouilly-Fume-Petit-F-Michel-Redde-Fils-2025-White
  ('Domaine Michel Redde et Fils', 'Pouilly-Fumé Barre à Mine', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Redde%20%26%20Fils
  ('Domaine Michel Redde et Fils', 'Pouilly-Fumé Majorum', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Redde%20%26%20Fils
  ('Domaine Michel Redde et Fils', 'Pouilly-Fumé Les Champs Billons', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Redde%20%26%20Fils
  ('Domaine Michel Redde et Fils', 'Pouilly-Fumé Les Cornets', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Redde%20%26%20Fils
  ('Domaine Michel Redde et Fils', 'Pouilly-Fumé Les Toupées', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Redde%20%26%20Fils
  ('Domaine Michel Redde et Fils', 'Pouilly-Fumé Les Bois de Saint-Andelain', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://idealwine.com/en/buy-a-wine/B2110137-62287-1-bottle-Pouilly-Fume-Les-Bois-de-Saint-Andelain-Michel-Redde-Fils-2020-White
  ('Domaine Michel Redde et Fils', 'Pouilly-sur-Loire Gustave Daudin', 'Pouilly-sur-Loire, Loire Valley, France', 'Chasselas', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Redde%20%26%20Fils
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GITTON PÈRE ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Gitton Père et Fils', 'Sancerre', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://gitton.fr/domaine-gitton/
  ('Domaine Gitton Père et Fils', 'Sancerre Amiral', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://gitton.fr/amiral-cuvee/
  ('Domaine Gitton Père et Fils', 'Sancerre Creux', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://gitton.fr/creux-cuvee/
  ('Domaine Gitton Père et Fils', 'Sancerre Crilles', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://gitton.fr/crilles-cuvee/
  ('Domaine Gitton Père et Fils', 'Sancerre Larrey', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://gitton.fr/larrey-cuvee/
  ('Domaine Gitton Père et Fils', 'Sancerre Fredins', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://gitton.fr/fredins-cuvee/
  ('Domaine Gitton Père et Fils', 'Sancerre Xélis', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://gitton.fr/cuvees/xelis-cuvee/
  ('Domaine Gitton Père et Fils', 'Sancerre Montachins', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.gitton.fr/
  ('Domaine Gitton Père et Fils', 'Sancerre Galinot', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.gitton.fr/
  ('Domaine Gitton Père et Fils', 'Sancerre Belles Dames', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.gitton.fr/
  ('Domaine Gitton Père et Fils', 'Sancerre Herses Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.gitton.fr/
  ('Domaine Gitton Père et Fils', 'Herses Rouge', 'Loire Valley, France', null, 'Red'),  -- https://www.gitton.fr/
  ('Domaine Gitton Père et Fils', 'Sancerre Romains Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.gitton.fr/
  ('Domaine Gitton Père et Fils', 'Romains Rouge', 'Loire Valley, France', null, 'Red'),  -- https://www.gitton.fr/
  ('Domaine Gitton Père et Fils', 'Sancerre Romains Rosé', 'Sancerre, Loire Valley, France', null, 'Rosé'),  -- https://gitton.fr/romains-rose/
  ('Domaine Gitton Père et Fils', 'Pouilly-Fumé Joanne d''Orion', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://gitton.fr/joanne-orion-cuvee/
  ('Domaine Gitton Père et Fils', 'Pouilly-Fumé Nébula', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://gitton.fr/cuvees/nebula-cuvee/
  ('Domaine Gitton Père et Fils', 'Coteaux du Giennois Vigne du Taureau Blanc', 'Coteaux du Giennois, Loire Valley, France', null, 'White'),  -- https://www.gitton.fr/
  ('Domaine Gitton Père et Fils', 'Coteaux du Giennois Vigne du Taureau Rouge', 'Coteaux du Giennois, Loire Valley, France', null, 'Red')  -- https://www.gitton.fr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MASSON-BLONDELET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Masson-Blondelet', 'Pouilly-Fumé Villa Paulus', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/5215/dom-masson-blondelet
  ('Domaine Masson-Blondelet', 'Pouilly-Fumé Clos du Château Paladi', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/5215/dom-masson-blondelet
  ('Domaine Masson-Blondelet', 'Pouilly-Fumé Les Angelots', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/5215/dom-masson-blondelet
  ('Domaine Masson-Blondelet', 'Pouilly-Fumé Minéralithe', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/5215/dom-masson-blondelet
  ('Domaine Masson-Blondelet', 'Pouilly-Fumé Les Pierres de Pierre', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.firstleaf.com/a/wine-directory/product/les-pierres-de-pierre
  ('Domaine Masson-Blondelet', 'Pouilly-Fumé Tradition Cullus Vieilles Vignes', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://delectable.com/wine/domaine-masson-blondelet/tradition-cullus-pouilly-fume-sauvignon-blanc
  ('Domaine Masson-Blondelet', 'Sancerre Blanc Thauvenay', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/5215/dom-masson-blondelet
  ('Domaine Masson-Blondelet', 'Sancerre Rouge Thauvenay', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red')  -- https://www.hachette-vins.com/guide-vins/producteurs/5215/dom-masson-blondelet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ANDRÉ DEZAT ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine André Dezat et Fils', 'Sancerre Blanc', 'Sancerre, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/12732/andre-dezat-et-fils
  ('Domaine André Dezat et Fils', 'Sancerre Rouge', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/12732/andre-dezat-et-fils
  ('Domaine André Dezat et Fils', 'Sancerre Rouge Cuvée Prestige', 'Sancerre, Loire Valley, France', 'Pinot Noir', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/12732/andre-dezat-et-fils
  ('Domaine André Dezat et Fils', 'Pouilly-Fumé', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/12732/andre-dezat-et-fils
  ('Domaine André Dezat et Fils', 'Pouilly-Fumé Domaine Thibault', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/12732/andre-dezat-et-fils
  ('Domaine André Dezat et Fils', 'Menetou-Salon Rouge', 'Menetou-Salon, Loire Valley, France', 'Pinot Noir', 'Red')  -- https://12bouteilles.com/en/669-andre-dezat-fils
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HUET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Huet', 'Vouvray Pétillant Brut', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Le Haut-Lieu Sec', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Clos du Bourg Sec', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Le Mont Sec', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Le Haut-Lieu Demi-Sec', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Clos du Bourg Demi-Sec', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Le Mont Demi-Sec', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Le Haut-Lieu Moelleux', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Le Mont Moelleux', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Clos du Bourg Moelleux', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Le Haut-Lieu Moelleux Première Trie', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Clos du Bourg Moelleux Première Trie', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Le Mont Moelleux Première Trie', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.bibendum.com.au/blogs/news/domaine-huet
  ('Domaine Huet', 'Vouvray Cuvée Constance', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet')  -- https://www.bibendum.com.au/blogs/news/domaine-huet-2
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS NAUDIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Clos Naudin', 'Vouvray Sec', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.idealwine.com/uk/domain/4032-Clos-Naudin.jsp
  ('Clos Naudin', 'Vouvray Demi-Sec', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.idealwine.com/uk/domain/4032-Clos-Naudin.jsp
  ('Clos Naudin', 'Vouvray Moelleux', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.idealwine.com/uk/domain/4032-Clos-Naudin.jsp
  ('Clos Naudin', 'Vouvray Moelleux Réserve', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.idealwine.com/uk/domain/4032-Clos-Naudin.jsp
  ('Clos Naudin', 'Vouvray Méthode Traditionnelle Extra-Brut', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.idealwine.com/uk/domain/4032-Clos-Naudin.jsp
  ('Clos Naudin', 'Vouvray Méthode Traditionnelle Brut', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.idealwine.com/uk/domain/4032-Clos-Naudin.jsp
  ('Clos Naudin', 'Vouvray Méthode Traditionnelle Brut Réserve', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling')  -- https://www.idealwine.com/uk/domain/4032-Clos-Naudin.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRANÇOIS CHIDAINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('François Chidaine', 'Montlouis-sur-Loire Méthode Traditionnelle Brut Nature', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://francois-chidaine.com/les-vins/aoc-montlouis/
  ('François Chidaine', 'Montlouis-sur-Loire Clos du Breuil', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-montlouis/
  ('François Chidaine', 'Montlouis-sur-Loire Les Choisilles', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-montlouis/
  ('François Chidaine', 'Montlouis-sur-Loire Les Bournais', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-montlouis/
  ('François Chidaine', 'Montlouis-sur-Loire Les Grillonnières', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-montlouis/
  ('François Chidaine', 'Montlouis-sur-Loire Les Epinays', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-montlouis/
  ('François Chidaine', 'Montlouis-sur-Loire Les Tuffeaux', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-montlouis/
  ('François Chidaine', 'Montlouis-sur-Loire Clos Habert', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-montlouis/clos-habert/
  ('François Chidaine', 'Montlouis-sur-Loire Rive Gauche Les Lys', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-montlouis/rive-gauche/
  ('François Chidaine', 'Vouvray Les Argiles', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-vouvray/
  ('François Chidaine', 'Vouvray Baudoin', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-vouvray/
  ('François Chidaine', 'Vouvray Bouchet', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-vouvray/
  ('François Chidaine', 'Vouvray Rive Droite', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/aoc-vouvray/
  ('François Chidaine', 'Vouvray Moelleux', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://francois-chidaine.com/les-vins/aoc-vouvray/
  ('François Chidaine', 'Vouvray Pétillant', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://francois-chidaine.com/les-vins/aoc-vouvray/
  ('François Chidaine', 'Touraine Sauvignon', 'Touraine, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://francois-chidaine.com/les-vins/touraine/
  ('François Chidaine', 'Touraine Rosé', 'Touraine, Loire Valley, France', null, 'Rosé'),  -- https://francois-chidaine.com/les-vins/touraine/
  ('François Chidaine', 'Touraine Rouge', 'Touraine, Loire Valley, France', null, 'Red'),  -- https://francois-chidaine.com/les-vins/touraine/
  ('François Chidaine', 'Touraine Rosé Pétillant', 'Touraine, Loire Valley, France', null, 'Sparkling'),  -- https://francois-chidaine.com/les-vins/touraine/
  ('François Chidaine', 'Chenin d''Ici', 'Loire Valley, France', null, 'White')  -- https://francois-chidaine.com/les-vins/chenin-dici/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA TAILLE AUX LOUPS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de la Taille aux Loups', 'Montlouis-sur-Loire Rémus', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
  ('Domaine de la Taille aux Loups', 'Montlouis-sur-Loire Clos Michet', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
  ('Domaine de la Taille aux Loups', 'Montlouis-sur-Loire Clos de Mosny', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
  ('Domaine de la Taille aux Loups', 'Montlouis-sur-Loire Les Hauts de Husseau', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
  ('Domaine de la Taille aux Loups', 'Montlouis-sur-Loire Clos du Hochet', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
  ('Domaine de la Taille aux Loups', 'Montlouis-sur-Loire Demi-Sec', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
  ('Domaine de la Taille aux Loups', 'Vin de France Clos de la Bretonnière', 'Loire Valley, France', null, 'White'),  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
  ('Domaine de la Taille aux Loups', 'Montlouis-sur-Loire Brut Tradition', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
  ('Domaine de la Taille aux Loups', 'Montlouis-sur-Loire Triple Zéro', 'Montlouis-sur-Loire, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
  ('Domaine de la Taille aux Loups', 'Triple Zéro Rosé', 'Loire Valley, France', null, 'Sparkling')  -- https://www.skurnik.com/producer/domaine-de-la-taille-aux-loups/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA BUTTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de la Butte', 'Bourgueil Le Pied de la Butte', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.net/zoom-sur-le-domaine-de-la-butte-des-cabernets-francs-au-sommet/
  ('Domaine de la Butte', 'Bourgueil Coteaux du Levant', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.net/zoom-sur-le-domaine-de-la-butte-des-cabernets-francs-au-sommet/
  ('Domaine de la Butte', 'Bourgueil Le Haut de la Butte', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.net/zoom-sur-le-domaine-de-la-butte-des-cabernets-francs-au-sommet/
  ('Domaine de la Butte', 'Bourgueil Mi-Pente', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.net/zoom-sur-le-domaine-de-la-butte-des-cabernets-francs-au-sommet/
  ('Domaine de la Butte', 'Bourgueil Perrières', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.idealwine.net/zoom-sur-le-domaine-de-la-butte-des-cabernets-francs-au-sommet/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE VINCENT CARÊME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Vincent Carême', 'Vouvray Brut Nature', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://vincentcareme.fr/cuvee-domaine/
  ('Domaine Vincent Carême', 'Vouvray Plaisir Ancestral', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.bbr.com/products-20201368253-2020-vouvray-plaisir-ancestral-domaine-vincent-careme-loire
  ('Domaine Vincent Carême', 'Fizzy Pink', 'Loire Valley, France', null, 'Sparkling'),  -- https://vincentcareme.fr/cuvee-domaine/
  ('Domaine Vincent Carême', 'Vouvray Sec', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://vincentcareme.fr/cuvee-domaine/
  ('Domaine Vincent Carême', 'Vouvray Le Peu Morier', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://vincentcareme.fr/cuvee-domaine/
  ('Domaine Vincent Carême', 'Vouvray Le Clos', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://vincentcareme.fr/cuvee-domaine/
  ('Domaine Vincent Carême', 'Vouvray Le Clos de la Roche', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://vincentcareme.fr/cuvee-domaine/
  ('Domaine Vincent Carême', 'Vouvray Tendre', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://vincentcareme.fr/cuvee-domaine/
  ('Domaine Vincent Carême', 'Vouvray Moelleux', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://vincentcareme.fr/cuvee-domaine/
  ('Domaine Vincent Carême', 'Vouvray Première Trie', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet')  -- https://vincentcareme.fr/cuvee-domaine/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHAMPALOU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Champalou', 'Vouvray Brut', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://champalou.com/nos-vins.html
  ('Champalou', 'Vouvray Sec Classic', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://champalou.com/nos-vins.html
  ('Champalou', 'Vouvray Les Fondraux', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://champalou.com/nos-vins.html
  ('Champalou', 'Vouvray Le Portail', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://champalou.com/nos-vins.html
  ('Champalou', 'Vouvray La Moelleuse', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://champalou.com/nos-vins.html
  ('Champalou', 'Vouvray Les Tries', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet')  -- https://champalou.com/nos-vins.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARC BRÉDIF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Marc Brédif', 'Vouvray Brut', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
  ('Marc Brédif', 'Vouvray Brut Extrême', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
  ('Marc Brédif', 'Vouvray Classic', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
  ('Marc Brédif', 'Vouvray Vigne Blanche', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
  ('Marc Brédif', 'Vouvray Vigne Blanche Réserve Privée', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
  ('Marc Brédif', 'Vouvray Grande Année', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
  ('Marc Brédif', 'Vouvray Nectar', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
  ('Marc Brédif', 'Vouvray Collection', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
  ('Marc Brédif', 'Chinon Rouge', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
  ('Marc Brédif', 'Chinon Réserve Privée', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.winalist.fr/hosts/173/maison-bredif?ae=157
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE BELLIVIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de Bellivière', 'Jasnières Prémices', 'Jasnières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://louisdressner.com/producers/domaine+de+bellivière
  ('Domaine de Bellivière', 'Jasnières Les Rosiers', 'Jasnières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bowlerwine.com/producer/belliviere
  ('Domaine de Bellivière', 'Jasnières Calligramme', 'Jasnières, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://louisdressner.com/producers/domaine+de+bellivière
  ('Domaine de Bellivière', 'Coteaux du Loir L''Effraie', 'Coteaux du Loir, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bowlerwine.com/producer/belliviere
  ('Domaine de Bellivière', 'Coteaux du Loir Vieilles Vignes Éparses', 'Coteaux du Loir, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://louisdressner.com/producers/domaine+de+bellivière
  ('Domaine de Bellivière', 'Coteaux du Loir Rouge-Gorge', 'Coteaux du Loir, Loire Valley, France', 'Pineau d''Aunis', 'Red'),  -- https://louisdressner.com/producers/domaine+de+bellivière
  ('Domaine de Bellivière', 'Coteaux du Loir Hommage à Louis Derré', 'Coteaux du Loir, Loire Valley, France', 'Pineau d''Aunis', 'Red'),  -- https://louisdressner.com/producers/domaine+de+bellivière
  ('Domaine de Bellivière', 'Vin de France Les P''tits Vélos', 'Loire Valley, France', 'Chenin Blanc', 'Sparkling')  -- https://louisdressner.com/producers/domaine+de+bellivière
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES AUBUISIÈRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine des Aubuisières', 'Vouvray Cuvée de Silex', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.wineanorak.com/aubuisieres.htm
  ('Domaine des Aubuisières', 'Vouvray Le Marigny', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.systembolaget.se/produkt/vin/le-marigny-9209001/
  ('Domaine des Aubuisières', 'Vouvray Les Girardières', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.wineanorak.com/aubuisieres.htm
  ('Domaine des Aubuisières', 'Vouvray Moelleux', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sweet'),  -- https://www.wineanorak.com/aubuisieres.htm
  ('Domaine des Aubuisières', 'Vouvray Plan de Jean', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.wineanorak.com/aubuisieres.htm
  ('Domaine des Aubuisières', 'Vouvray Le Petit Clos', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.hachette-vins.com/guide-vins/les-vins/dom-des-aubuisieres-petit-clos-2022-2025/202578527/
  ('Domaine des Aubuisières', 'Vouvray Extra-Brut Zéro', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling')  -- https://www.hachette-vins.com/guide-vins/les-vins/dom-des-aubuisieres-petit-clos-2022-2025/202578527/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HENRY MARIONNET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Henry Marionnet', 'Touraine Gamay Domaine de la Charmoise', 'Touraine, Loire Valley, France', 'Gamay', 'Red'),  -- https://henry-marionnet.com/products/gamay-domaine-de-la-charmoise/
  ('Domaine Henry Marionnet', 'Touraine Sauvignon Domaine de la Charmoise', 'Touraine, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://henry-marionnet.com/products/sauvignon-domaine-de-la-charmoise/
  ('Domaine Henry Marionnet', 'Touraine Rosé Domaine de la Charmoise', 'Touraine, Loire Valley, France', null, 'Rosé'),  -- https://henry-marionnet.com/products/domaine-de-la-charmoise-rose/
  ('Domaine Henry Marionnet', 'Chenin Domaine de la Charmoise', 'Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://henry-marionnet.com/products/chenin-domaine-de-la-charmoise/
  ('Domaine Henry Marionnet', 'Touraine Renaissance', 'Touraine, Loire Valley, France', 'Gamay', 'Red'),  -- https://henry-marionnet.com/products/renaissance/
  ('Domaine Henry Marionnet', 'Touraine Vinifera Sauvignon', 'Touraine, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://henry-marionnet.com/products/vinifera-sauvignon/
  ('Domaine Henry Marionnet', 'Touraine Vinifera Côt', 'Touraine, Loire Valley, France', 'Malbec', 'Red'),  -- https://henry-marionnet.com/products/vinifera-malbec-ou-cot/
  ('Domaine Henry Marionnet', 'Vinifera Chenin', 'Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://henry-marionnet.com/products/vinifera-chenin/
  ('Domaine Henry Marionnet', 'Première Vendange', 'Loire Valley, France', 'Gamay', 'Red'),  -- https://henry-marionnet.com/products/premiere-vendange/
  ('Domaine Henry Marionnet', 'Cépages Oubliés', 'Loire Valley, France', 'Gamay de Bouze', 'Red'),  -- https://henry-marionnet.com/products/cepages-oublies-2/
  ('Domaine Henry Marionnet', 'Touraine M de Marionnet', 'Touraine, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://henry-marionnet.com/products/cuvee-m-de-marionnet-epuisee/
  ('Domaine Henry Marionnet', 'Provignage', 'Loire Valley, France', 'Romorantin', 'White'),  -- https://henry-marionnet.com/products/provignage/
  ('Domaine Henry Marionnet', 'La Pucelle de Romorantin', 'Loire Valley, France', 'Romorantin', 'White')  -- https://henry-marionnet.com/products/la-pucelle-de-romorantin/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COULY-DUTHEIL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Couly-Dutheil', 'Chinon Les Chanteaux', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.coulydutheil-chinon.com/les-chanteaux-s45.html
  ('Couly-Dutheil', 'Chinon Blanc L''Unique', 'Chinon, Loire Valley, France', null, 'White'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Blanc L''Interdit', 'Chinon, Loire Valley, France', null, 'White'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Vin de France Blanc de Franc', 'Loire Valley, France', 'Cabernet Franc', 'White'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Rosé René Couly', 'Chinon, Loire Valley, France', null, 'Rosé'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Brut de Chenin', 'Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Brut de Franc Rosé', 'Loire Valley, France', 'Cabernet Franc', 'Sparkling'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Brut de Franc Blanc', 'Loire Valley, France', 'Cabernet Franc', 'Sparkling'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Pur Sans', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Les Gravières', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Coulée Automnale', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Diligence', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Domaine René Couly', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Baronnie Madeleine', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Le Clos de l''Olive', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Le Clos de l''Echo', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Chinon Crescendo', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Saumur Blanc Les Moulins de Turquant', 'Saumur, Loire Valley, France', null, 'White'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Saumur Rouge Les Moulins de Turquant', 'Saumur, Loire Valley, France', null, 'Red'),  -- https://www.coulydutheil-chinon.com/vin-chinon-couly-dutheil-boutique-3.html
  ('Couly-Dutheil', 'Coeur de Franc Rosé', 'Loire Valley, France', 'Cabernet Franc', 'Rosé')  -- https://www.coulydutheil-chinon.com/coeur-de-franc-s44.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BERNARD BAUDRY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Bernard Baudry', 'Chinon Blanc Le Domaine', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bowlerwine.com/producer/baudry-domaine-bernard
  ('Bernard Baudry', 'Chinon Rosé', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Rosé'),  -- https://www.bowlerwine.com/producer/baudry-domaine-bernard
  ('Bernard Baudry', 'Chinon Les Granges', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.bowlerwine.com/producer/baudry-domaine-bernard
  ('Bernard Baudry', 'Chinon Les Grézeaux', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.bowlerwine.com/producer/baudry-domaine-bernard
  ('Bernard Baudry', 'Chinon Clos Guillot', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.bowlerwine.com/producer/baudry-domaine-bernard
  ('Bernard Baudry', 'Chinon La Croix Boissée', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.bowlerwine.com/producer/baudry-domaine-bernard
  ('Bernard Baudry', 'Chinon Rouge Le Domaine', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.bowlerwine.com/producer/baudry-domaine-bernard
  ('Bernard Baudry', 'Chinon La Croix Boissée Blanc', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White')  -- https://louisdressner.com/producers/domaine%20bernard%20baudry
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE OLGA RAFFAULT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Olga Raffault', 'Chinon La Fraich', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://bowlerwine.com/taxonomy/term/868/all
  ('Domaine Olga Raffault', 'Chinon La Singulière', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://bowlerwine.com/taxonomy/term/868/all
  ('Domaine Olga Raffault', 'Chinon Les Barnabés', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://bowlerwine.com/taxonomy/term/868/all
  ('Domaine Olga Raffault', 'Chinon Les Deux Roches', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://bowlerwine.com/taxonomy/term/868/all
  ('Domaine Olga Raffault', 'Chinon Les Peuilles', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://bowlerwine.com/taxonomy/term/868/all
  ('Domaine Olga Raffault', 'Chinon Les Picasses', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://bowlerwine.com/taxonomy/term/868/all
  ('Domaine Olga Raffault', 'Chinon Blanc Champ-Chenin', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://bowlerwine.com/taxonomy/term/868/all
  ('Domaine Olga Raffault', 'Chinon Blanc Chenin des Picasses', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://bowlerwine.com/taxonomy/term/868/all
  ('Domaine Olga Raffault', 'Chinon Rosé', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Rosé'),  -- https://bowlerwine.com/taxonomy/term/868/all
  ('Domaine Olga Raffault', 'Chinon Rouge', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://louisdressner.com/producers/Raffault
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN-MAURICE RAFFAULT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Jean-Maurice Raffault', 'Chinon Blanc', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.yapp.co.uk/chinon-domaine-jean-maurice-raffault-blanc-2018
  ('Domaine Jean-Maurice Raffault', 'Chinon Les Galuches', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.viniou.co.uk/wines/countries/france/103_loire-valley/69_chinon/253848_jean-maurice-raffault-les-galuches-2022
  ('Domaine Jean-Maurice Raffault', 'Chinon Clos d''Isoré', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/12786/sarl-jean-maurice-raffault
  ('Domaine Jean-Maurice Raffault', 'Chinon Le Puy', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/12786/sarl-jean-maurice-raffault
  ('Domaine Jean-Maurice Raffault', 'Chinon Clos des Capucins', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/12786/sarl-jean-maurice-raffault
  ('Domaine Jean-Maurice Raffault', 'Chinon Les Picasses', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/12786/sarl-jean-maurice-raffault
  ('Domaine Jean-Maurice Raffault', 'Chinon Rosé', 'Chinon, Loire Valley, France', null, 'Rosé')  -- https://www.hachette-vins.com/guide-vins/producteurs/12786/sarl-jean-maurice-raffault
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CATHERINE & PIERRE BRETON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Catherine & Pierre Breton', 'Bourgueil Nuits d''Ivresse', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Chinon Beaux Monts', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Bourgueil Avis de Vin Fort', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Vin de France Elle est pas bulle la vie?', 'Loire Valley, France', null, 'Sparkling'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Bourgueil Les Perrières', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Bourgueil Trinch!', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Bourgueil Clos Sénéchal', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Val de Loire Grolleau', 'Loire Valley, France', 'Grolleau', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Vouvray Pierres Rousses', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Bourgueil Les Galichets', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Chinon Les Picasses', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Bourgueil Franc de Pied', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3007-Catherine-et-Pierre-Breton.jsp
  ('Catherine & Pierre Breton', 'Vouvray La Dilettante Brut', 'Vouvray, Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://wineanorak.com/catherine_pierre_breton.htm
  ('Catherine & Pierre Breton', 'Pétillant Naturel Rosé Ritournelle', 'Loire Valley, France', null, 'Sparkling'),  -- https://wineanorak.com/catherine_pierre_breton.htm
  ('Catherine & Pierre Breton', 'Bourgueil La Dilettante', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://wineanorak.com/catherine_pierre_breton.htm
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- YANNICK AMIRAULT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Yannick Amirault', 'Bourgueil Rosé d''Équinoxe', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Rosé'),  -- https://www.europeancellars.com/producer/yannick-amirault/
  ('Yannick Amirault', 'Bâtard-Princess', 'Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.europeancellars.com/producer/yannick-amirault/
  ('Yannick Amirault', 'Saint-Nicolas-de-Bourgueil La Source', 'Saint-Nicolas-de-Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.europeancellars.com/producer/yannick-amirault/
  ('Yannick Amirault', 'Saint-Nicolas-de-Bourgueil La Mine', 'Saint-Nicolas-de-Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.europeancellars.com/producer/yannick-amirault/
  ('Yannick Amirault', 'Saint-Nicolas-de-Bourgueil Les Malgagnes', 'Saint-Nicolas-de-Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.europeancellars.com/producer/yannick-amirault/
  ('Yannick Amirault', 'Saint-Nicolas-de-Bourgueil Les Malgagnes Amphore', 'Saint-Nicolas-de-Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.europeancellars.com/producer/yannick-amirault/
  ('Yannick Amirault', 'Bourgueil Côte 50', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.europeancellars.com/producer/yannick-amirault/
  ('Yannick Amirault', 'Bourgueil Le Grand Clos', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.europeancellars.com/producer/yannick-amirault/
  ('Yannick Amirault', 'Bourgueil Les Quartiers', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/5790/dom-y-amirault/
  ('Yannick Amirault', 'Bourgueil La Coudraye', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/5790/dom-y-amirault/
  ('Yannick Amirault', 'Bourgueil La Petite Cave', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/5790/dom-y-amirault/
  ('Yannick Amirault', 'Saint-Nicolas-de-Bourgueil Les Graviers', 'Saint-Nicolas-de-Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.hachette-vins.com/guide-vins/producteurs/5790/dom-y-amirault/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA CHEVALERIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de la Chevalerie', 'Bourgueil Franco D''Porc', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.net/domaine-de-la-chevalerie-grands-rouges-de-loire-a-bourgueil/
  ('Domaine de la Chevalerie', 'Bourgueil Peu Muleau', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.net/domaine-de-la-chevalerie-grands-rouges-de-loire-a-bourgueil/
  ('Domaine de la Chevalerie', 'Bourgueil Bretêche', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.net/domaine-de-la-chevalerie-grands-rouges-de-loire-a-bourgueil/
  ('Domaine de la Chevalerie', 'Bourgueil Galichets', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.net/domaine-de-la-chevalerie-grands-rouges-de-loire-a-bourgueil/
  ('Domaine de la Chevalerie', 'Bourgueil Grand-Mont', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.net/domaine-de-la-chevalerie-grands-rouges-de-loire-a-bourgueil/
  ('Domaine de la Chevalerie', 'Bourgueil Busardières', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1257/dom-de-la-chevalerie/
  ('Domaine de la Chevalerie', 'Bourgueil Chevalerie', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1257/dom-de-la-chevalerie/
  ('Domaine de la Chevalerie', 'Bourgueil Chevalerie Vieilles Vignes', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1257/dom-de-la-chevalerie/
  ('Domaine de la Chevalerie', 'Bourgueil Noms d''Oiseaux', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.hachette-vins.com/guide-vins/producteurs/1257/dom-de-la-chevalerie/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PHILIPPE ALLIET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Philippe Alliet', 'Chinon', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.skurnik.com/?p=232580
  ('Domaine Philippe Alliet', 'Chinon Vieilles Vignes', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.skurnik.com/?p=232580
  ('Domaine Philippe Alliet', 'Chinon L''Huisserie', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.skurnik.com/?p=232580
  ('Domaine Philippe Alliet', 'Chinon Coteau de Noiré', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.skurnik.com/?p=232580
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PIERRE-JACQUES DRUET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Pierre-Jacques Druet', 'Bourgueil Vaumoreau', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://delectable.com/wine/pierre-jacques-druet/vaumoreau-bourgueil-cabernet-franc
  ('Pierre-Jacques Druet', 'Bourgueil Grand Mont', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.lapassionduvin.com/loire/1507-domaine-druet-bourgueil
  ('Pierre-Jacques Druet', 'Bourgueil Les Cent Boisselées', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.lapassionduvin.com/loire/1507-domaine-druet-bourgueil
  ('Pierre-Jacques Druet', 'Bourgueil Beauvais', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.lapassionduvin.com/loire/1507-domaine-druet-bourgueil
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FRÉDÉRIC MABILEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Frédéric Mabileau', 'Saint-Nicolas-de-Bourgueil Les Rouillères', 'Saint-Nicolas-de-Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.fredericmabileau.com/fr/vintage/8
  ('Domaine Frédéric Mabileau', 'Saint-Nicolas-de-Bourgueil Les Coutures', 'Saint-Nicolas-de-Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.fredericmabileau.com/fr/vintage/5
  ('Domaine Frédéric Mabileau', 'Saint-Nicolas-de-Bourgueil Éclipse', 'Saint-Nicolas-de-Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.fredericmabileau.com/fr/vintage/1
  ('Domaine Frédéric Mabileau', 'Bourgueil Les Racines', 'Bourgueil, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.fredericmabileau.com/fr/vintage/9
  ('Domaine Frédéric Mabileau', 'Anjou Blanc Chenin des Rouillères', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.fredericmabileau.com/fr/vintage/2
  ('Domaine Frédéric Mabileau', 'Anjou Blanc Chenin des Mille Rocs', 'Anjou, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.fredericmabileau.com/fr/vintage/14
  ('Domaine Frédéric Mabileau', 'Saumur Chenin du Puy', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.fredericmabileau.com/fr/vintage/4
  ('Domaine Frédéric Mabileau', 'Vin de France Franc', 'Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.fredericmabileau.com/fr/vintage/19
  ('Domaine Frédéric Mabileau', 'Vin de France Fred', 'Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.fredericmabileau.com/fr/vintage/6
  ('Domaine Frédéric Mabileau', 'Vin de France Anima Pétillant Naturel', 'Loire Valley, France', 'Chenin Blanc', 'Sparkling'),  -- https://www.fredericmabileau.com/fr/vintage/7
  ('Domaine Frédéric Mabileau', 'Mundi Pétillant Naturel Rosé', 'Loire Valley, France', null, 'Sparkling')  -- https://www.fredericmabileau.com/fr/vintage/18
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA NOBLAIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de la Noblaie', 'Chinon Blanc La Part des Anges', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.ruedesvignerons.com/en/domaine/59/domaine-de-la-noblaie
  ('Domaine de la Noblaie', 'Chinon Blanc La Noblaie', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.ruedesvignerons.com/en/domaine/59/domaine-de-la-noblaie
  ('Domaine de la Noblaie', 'Chinon Le Temps des Cerises', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.ruedesvignerons.com/en/domaine/59/domaine-de-la-noblaie
  ('Domaine de la Noblaie', 'Chinon Les Blancs Manteaux', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.ruedesvignerons.com/en/domaine/59/domaine-de-la-noblaie
  ('Domaine de la Noblaie', 'Chinon Les Chiens-Chiens', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.ruedesvignerons.com/en/domaine/59/domaine-de-la-noblaie
  ('Domaine de la Noblaie', 'Chinon Pierre de Tuf', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.ruedesvignerons.com/en/domaine/59/domaine-de-la-noblaie
  ('Domaine de la Noblaie', 'Touraine Mousseux MonAnge Rosé', 'Touraine, Loire Valley, France', 'Cabernet Franc', 'Sparkling'),  -- https://www.ruedesvignerons.com/en/domaine/59/domaine-de-la-noblaie
  ('Domaine de la Noblaie', 'Chinon Rosé Goutte de Rosé', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Rosé'),  -- https://www.ruedesvignerons.com/en/domaine/59/domaine-de-la-noblaie
  ('Domaine de la Noblaie', 'Chinon Le Clos', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.hachette-vins.com/guide-vins/producteurs/5757/dom-de-la-noblaie
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE COULAINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château de Coulaine', 'Chinon Blanc Sinople', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.vintageandvine.com/producers/loire-valley/chateau-de-coulaine
  ('Château de Coulaine', 'Chinon Blanc Clos de la Cure', 'Chinon, Loire Valley, France', null, 'White'),  -- https://www.vintageandvine.com/producers/loire-valley/chateau-de-coulaine
  ('Château de Coulaine', 'Chinon Rouge', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.vintageandvine.com/producers/loire-valley/chateau-de-coulaine
  ('Château de Coulaine', 'Chinon Les Picasses', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.vintageandvine.com/producers/loire-valley/chateau-de-coulaine
  ('Château de Coulaine', 'Chinon La Diablesse', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.vintageandvine.com/producers/loire-valley/chateau-de-coulaine
  ('Château de Coulaine', 'Chinon Blanc Les Pieds Rôtis', 'Chinon, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.vin-bio-ardoneo.com/en/41-chateau-de-coulaine
  ('Château de Coulaine', 'Chinon Clos de Turpenay', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.vin-bio-ardoneo.com/en/41-chateau-de-coulaine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CHARLES JOGUET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Charles Joguet', 'Chinon Les Charmes', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3008-Charles-Joguet.jsp
  ('Domaine Charles Joguet', 'Chinon Clos de la Dioterie', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3008-Charles-Joguet.jsp
  ('Domaine Charles Joguet', 'Chinon Clos de la Dioterie Vieilles Vignes', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3008-Charles-Joguet.jsp
  ('Domaine Charles Joguet', 'Chinon Les Varennes du Grand Clos', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3008-Charles-Joguet.jsp
  ('Domaine Charles Joguet', 'Chinon Les Varennes du Grand Clos Franc de Pied', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3008-Charles-Joguet.jsp
  ('Domaine Charles Joguet', 'Chinon Clos du Chêne Vert', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3008-Charles-Joguet.jsp
  ('Domaine Charles Joguet', 'Chinon La Cure', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3008-Charles-Joguet.jsp
  ('Domaine Charles Joguet', 'Chinon Jeunes Vignes', 'Chinon, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.idealwine.com/uk/domain/3008-Charles-Joguet.jsp
  ('Domaine Charles Joguet', 'Touraine Clos de la Plante Martin Blanc', 'Touraine, Loire Valley, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/3008-Charles-Joguet.jsp
  ('Domaine Charles Joguet', 'Les Petites Roches Blanc', 'Loire Valley, France', null, 'White'),  -- https://www.charlesjoguet.com/
  ('Domaine Charles Joguet', 'Les Charmes Blanc', 'Loire Valley, France', null, 'White')  -- https://www.charlesjoguet.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOUVET-LADUBAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Bouvet-Ladubay', 'Saumur Brut Saphir', 'Saumur, Loire Valley, France', 'Chenin Blanc, Chardonnay', 'Sparkling'),  -- https://www.ruedesvignerons.com/en/domaine/622/bouvet-ladubay
  ('Bouvet-Ladubay', 'Saumur Brut Trésor Blanc', 'Saumur, Loire Valley, France', 'Chardonnay, Chenin Blanc', 'Sparkling'),  -- https://www.ruedesvignerons.com/en/domaine/622/bouvet-ladubay
  ('Bouvet-Ladubay', 'Saumur Brut Instinct', 'Saumur, Loire Valley, France', 'Chardonnay, Chenin Blanc', 'Sparkling'),  -- https://www.ruedesvignerons.com/en/domaine/622/bouvet-ladubay
  ('Bouvet-Ladubay', 'Saumur Brut Zéro', 'Saumur, Loire Valley, France', 'Chardonnay, Chenin Blanc', 'Sparkling'),  -- https://www.ruedesvignerons.com/en/domaine/622/bouvet-ladubay
  ('Bouvet-Ladubay', 'Rubis', 'Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.ruedesvignerons.com/en/domaine/622/bouvet-ladubay
  ('Bouvet-Ladubay', 'Saumur Trésor Rosé Brut', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Sparkling'),  -- https://www.kobrandwineandspirits.com/product/bouvet_ladubay_tresor_rose/
  ('Bouvet-Ladubay', 'Signature Brut', 'Loire Valley, France', 'Chenin Blanc, Chardonnay', 'Sparkling'),  -- https://www.kobrandwineandspirits.com/product/bouvet_ladubay_signature_brut/
  ('Bouvet-Ladubay', 'Crémant de Loire Brut', 'Crémant de Loire, Loire Valley, France', 'Chenin Blanc, Cabernet Franc', 'Sparkling'),  -- https://www.kobrandwineandspirits.com/product/bouvet_ladubay_cremant_de_loire/
  ('Bouvet-Ladubay', 'Crémant de Loire Excellence Rosé Brut', 'Crémant de Loire, Loire Valley, France', 'Cabernet Franc, Grolleau', 'Sparkling')  -- https://shop.frankfurt-airport.com/en-US/product/bouvet-ladubay-cremant-de-loire-excellence-brut-rose-0-75l_12c4ff3f9ced96ac
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GRATIEN & MEYER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Gratien & Meyer', 'Crémant de Loire Brut Blanc Millésime', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.gratienmeyer.com/
  ('Gratien & Meyer', 'Crémant de Loire Brut Rosé', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.gratienmeyer.com/
  ('Gratien & Meyer', 'Crémant de Loire Flamme Brut Blanc', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.gratienmeyer.com/
  ('Gratien & Meyer', 'Crémant de Loire Flamme Brut Rosé', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.gratienmeyer.com/
  ('Gratien & Meyer', 'Saumur Dry Blanc', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://www.gratienmeyer.com/
  ('Gratien & Meyer', 'Saumur Dry Rosé', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://www.gratienmeyer.com/
  ('Gratien & Meyer', 'Saumur Brut Blanc', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://www.gratienmeyer.com/
  ('Gratien & Meyer', 'Cardinal Demi-Sec Rouge', 'Loire Valley, France', null, 'Sparkling'),  -- https://www.gratienmeyer.com/
  ('Gratien & Meyer', 'Chardonnay', 'Loire Valley, France', 'Chardonnay', 'Sparkling')  -- https://www.gratienmeyer.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LANGLOIS-CHATEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Langlois-Chateau', 'Crémant de Loire Brut Réserve', 'Crémant de Loire, Loire Valley, France', 'Chenin Blanc, Chardonnay, Cabernet Franc', 'Sparkling'),  -- https://www.vinatis.com/maisons/langlois
  ('Langlois-Chateau', 'Crémant de Loire Brut Rosé', 'Crémant de Loire, Loire Valley, France', 'Cabernet Franc, Pinot Noir', 'Sparkling'),  -- https://www.vinatis.com/maisons/langlois
  ('Langlois-Chateau', 'Crémant de Loire Vintage Brut', 'Crémant de Loire, Loire Valley, France', 'Chenin Blanc, Cabernet Franc, Chardonnay', 'Sparkling'),  -- https://www.vinatis.com/maisons/langlois
  ('Langlois-Chateau', 'Crémant de Loire Quadrille Extra Brut', 'Crémant de Loire, Loire Valley, France', 'Chenin Blanc, Chardonnay, Cabernet Franc', 'Sparkling'),  -- https://www.decanter.com/wine-reviews/france/loire/langlois-chateau-quadrille-cremant-de-loire-loire-2018-50121/
  ('Langlois-Chateau', 'Crémant de Loire L''Extra Blanc Brut', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.decanter.com/wine-reviews/search/domaine-langlois-ch%C3%A2teau/2
  ('Langlois-Chateau', 'Crémant de Loire L''Extra Rosé Brut', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.decanter.com/wine-reviews/search/domaine-langlois-ch%C3%A2teau/2
  ('Langlois-Chateau', 'Saumur-Champigny Vieilles Vignes', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.decanter.com/wine-reviews/search/domaine-langlois-ch%C3%A2teau/2
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ACKERMAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Ackerman', 'Saumur Royal Brut', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Crémant de Loire Royal Brut', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Crémant de Loire Royal Grande Réserve', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Crémant de Loire Cuvée Émilie Ackerman', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Crémant de Loire Cuvée Ambrosa', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Crémant de Loire 1811 Rosé', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Crémant de Loire Cuvée 1811 Brut', 'Crémant de Loire, Loire Valley, France', 'Chenin Blanc, Chardonnay, Cabernet Franc', 'Sparkling'),  -- https://vinepair.com/review/review-ackerman-cremant-de-loire-cuvee-1811-brut
  ('Ackerman', 'Saumur 1811 Brut', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Saumur Bulle Royale Brut', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://www.auchan.fr/ackerman-aop-saumur-bulle-royale-brut/pr-C393808
  ('Ackerman', 'Crémant de Loire Bulle Royale', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Saumur L''Esprit Nature Sans Soufre Ajouté', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Saumur Cuvée Privée', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Crémant de Loire Cuvée Privilège', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Saumur Grande Réserve Brut', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
  ('Ackerman', 'Crémant de Loire Blanc de Noir', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling')  -- https://www.hachette-vins.com/guide-vins/producteurs/14363/ackerman/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES ROCHES NEUVES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine des Roches Neuves', 'Saumur-Champigny Cuvée Domaine', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://rochesneuves.com/vins/
  ('Domaine des Roches Neuves', 'Saumur-Champigny Terres Chaudes', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://rochesneuves.com/vins/
  ('Domaine des Roches Neuves', 'Saumur-Champigny La Marginale', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://rochesneuves.com/vins/
  ('Domaine des Roches Neuves', 'Saumur-Champigny Clos de l''Échelier', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://rochesneuves.com/vins/
  ('Domaine des Roches Neuves', 'Saumur-Champigny Les Mémoires', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://rochesneuves.com/vins/
  ('Domaine des Roches Neuves', 'Saumur-Champigny Outre Terre', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://rochesneuves.com/vins/
  ('Domaine des Roches Neuves', 'Saumur-Champigny Franc de Pied', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://rochesneuves.com/vins/
  ('Domaine des Roches Neuves', 'Saumur Blanc L''Échelier', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://rochesneuves.com/vins/
  ('Domaine des Roches Neuves', 'Saumur Blanc Clos Romans', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://rochesneuves.com/vins/
  ('Domaine des Roches Neuves', 'Saumur Blanc Terres', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White')  -- https://rochesneuves.com/vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GUIBERTEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Guiberteau', 'Saumur Blanc Les Moulins', 'Saumur, Loire Valley, France', null, 'White'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Blanc', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Blanc Brézé', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Blanc Brézé Le Bourg', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Blanc Clos des Carmes', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Blanc Clos de Guichaux', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Rosé Les Moulins', 'Saumur, Loire Valley, France', null, 'Rosé'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Rouge Les Moulins', 'Saumur, Loire Valley, France', null, 'Red'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Rouge', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Rouge Les Chapaudaises', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Rouge Les Motelles', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Rouge Les Arboises', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://beckywasserman.com/domaines/guiberteau
  ('Domaine Guiberteau', 'Saumur Rouge Chacé', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://beckywasserman.com/domaines/guiberteau
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS ROUGEARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Clos Rougeard', 'Saumur-Champigny Le Clos', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://vintageandvine.com/producers/loire-valley/clos-rougeard
  ('Clos Rougeard', 'Saumur-Champigny Les Poyeux', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://vintageandvine.com/producers/loire-valley/clos-rougeard
  ('Clos Rougeard', 'Saumur-Champigny Le Bourg', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://vintageandvine.com/producers/loire-valley/clos-rougeard
  ('Clos Rougeard', 'Saumur Blanc Brézé', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://vintageandvine.com/producers/loire-valley/clos-rougeard
  ('Clos Rougeard', 'Coteaux de Saumur', 'Coteaux de Saumur, Loire Valley, France', 'Chenin Blanc', 'Sweet')  -- https://vintageandvine.com/producers/loire-valley/clos-rougeard
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE VILLENEUVE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château de Villeneuve', 'Saumur-Champigny', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1973/chateau-de-villeneuve
  ('Château de Villeneuve', 'Saumur-Champigny Vieilles Vignes', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1973/chateau-de-villeneuve
  ('Château de Villeneuve', 'Saumur-Champigny Le Grand Clos', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1973/chateau-de-villeneuve
  ('Château de Villeneuve', 'Saumur Blanc', 'Saumur, Loire Valley, France', null, 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1973/chateau-de-villeneuve
  ('Château de Villeneuve', 'Saumur Blanc Les Cormiers', 'Saumur, Loire Valley, France', null, 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1973/chateau-de-villeneuve
  ('Château de Villeneuve', 'Coteaux de Saumur', 'Coteaux de Saumur, Loire Valley, France', null, 'Sweet')  -- https://www.hachette-vins.com/guide-vins/producteurs/1973/chateau-de-villeneuve
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FILLIATREAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Filliatreau', 'Saumur Blanc Lena', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.bowlerwine.com/producer/filliatreau
  ('Domaine Filliatreau', 'Saumur Blanc Château Fouquet', 'Saumur, Loire Valley, France', null, 'White'),  -- https://www.louisdressner.com/producers/domaine+filliatreau
  ('Domaine Filliatreau', 'Fillibulle Pétillant Rosé', 'Loire Valley, France', null, 'Sparkling'),  -- https://www.louisdressner.com/producers/domaine+filliatreau
  ('Domaine Filliatreau', 'Saumur-Champigny', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.louisdressner.com/producers/domaine+filliatreau
  ('Domaine Filliatreau', 'Saumur Rouge Château Fouquet', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.bowlerwine.com/producer/filliatreau
  ('Domaine Filliatreau', 'Saumur-Champigny La Grande Vignolle', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.bowlerwine.com/producer/filliatreau
  ('Domaine Filliatreau', 'Saumur-Champigny Vieilles Vignes', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.bowlerwine.com/producer/filliatreau
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DU HUREAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château du Hureau', 'Saumur-Champigny Tuffe', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.charlesnealselections.com/chateau-du-hureau.html
  ('Château du Hureau', 'Saumur-Champigny Fours à Chaux', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.charlesnealselections.com/chateau-du-hureau.html
  ('Château du Hureau', 'Saumur-Champigny Les Fevettes', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.charlesnealselections.com/chateau-du-hureau.html
  ('Château du Hureau', 'Saumur-Champigny Lisagathe', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.charlesnealselections.com/chateau-du-hureau.html
  ('Château du Hureau', 'Saumur Blanc Argile', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.charlesnealselections.com/chateau-du-hureau.html
  ('Château du Hureau', 'Saumur Blanc Foudre', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White')  -- https://polanerselections.com/?p=24850
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE BRÉZÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château de Brézé', 'Saumur Blanc', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.vignobles-colbert.com/fr/domaine/3-chateau-de-breze
  ('Château de Brézé', 'Saumur Blanc Cuvée des Jumelles', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://www.vignobles-colbert.com/fr/domaine/3-chateau-de-breze
  ('Château de Brézé', 'Saumur-Champigny', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.vignobles-colbert.com/fr/domaine/3-chateau-de-breze
  ('Château de Brézé', 'Saumur-Champigny Cuvée de la Girardrie', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.vignobles-colbert.com/fr/domaine/3-chateau-de-breze
  ('Château de Brézé', 'Saumur Rosé', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Rosé'),  -- https://www.vignobles-colbert.com/fr/domaine/3-chateau-de-breze
  ('Château de Brézé', 'Saumur Rouge', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.vignobles-colbert.com/fr/domaine/3-chateau-de-breze
  ('Château de Brézé', 'Crémant de Loire Blanc Comtesse de Colbert', 'Crémant de Loire, Loire Valley, France', 'Chenin Blanc, Chardonnay', 'Sparkling'),  -- https://www.vignobles-colbert.com/fr/domaine/3-chateau-de-breze
  ('Château de Brézé', 'Crémant de Loire Rosé Comtesse de Colbert', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling')  -- https://www.vignobles-colbert.com/fr/domaine/3-chateau-de-breze
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ANTOINE SANZAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Antoine Sanzay', 'Saumur Blanc Les Salles Martin', 'Saumur, Loire Valley, France', null, 'White'),  -- https://www.skurnik.com/producer/domaine-antoine-sanzay/
  ('Antoine Sanzay', 'Saumur-Champigny La Paterne', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.skurnik.com/producer/domaine-antoine-sanzay/
  ('Antoine Sanzay', 'Saumur-Champigny Les Terres Rouges', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://www.skurnik.com/producer/domaine-antoine-sanzay/
  ('Antoine Sanzay', 'Saumur-Champigny La Haye Dampierre', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://beckywasserman.com/domaines/antoine-sanzay
  ('Antoine Sanzay', 'Saumur-Champigny Les Poyeux', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.skurnik.com/producer/domaine-antoine-sanzay/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ARNAUD LAMBERT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Arnaud Lambert', 'Crémant de Loire Blanc', 'Crémant de Loire, Loire Valley, France', 'Chenin Blanc, Chardonnay', 'Sparkling'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Crémant de Loire Rosé', 'Crémant de Loire, Loire Valley, France', 'Cabernet Franc', 'Sparkling'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur Blanc Midi', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur Blanc Bourguenne', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur Blanc Les Parcelles', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur Blanc David', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur Blanc Rue', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur Blanc Coulée de Saint Cyr', 'Saumur, Loire Valley, France', 'Chenin Blanc', 'White'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur Rouge Mazurique', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur Rouge Tue-Loup', 'Saumur, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur-Champigny Montée des Roches', 'Saumur-Champigny, Loire Valley, France', 'Cabernet Franc', 'Red'),  -- https://grandcruselections.com/arnaud-lambert-new
  ('Domaine Arnaud Lambert', 'Saumur Blanc Les Perrières', 'Saumur, Loire Valley, France', null, 'White')  -- https://thesourceimports.com/?p=14167
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LUNEAU-PAPIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Luneau-Papin', 'Muscadet Sèvre et Maine Le Verger', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.bowlerwine.com/producer/luneau-papin-domaine
  ('Luneau-Papin', 'Muscadet Sèvre et Maine La Grange', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.bowlerwine.com/producer/luneau-papin-domaine
  ('Luneau-Papin', 'Muscadet Sèvre et Maine Vera Cruz', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.bowlerwine.com/producer/luneau-papin-domaine
  ('Luneau-Papin', 'Muscadet Sèvre et Maine Clos de l''Allée', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.bowlerwine.com/producer/luneau-papin-domaine
  ('Luneau-Papin', 'Muscadet Sèvre et Maine Les Pierres Blanches', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.bowlerwine.com/producer/luneau-papin-domaine
  ('Luneau-Papin', 'Muscadet Sèvre et Maine L d''Or', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.bowlerwine.com/producer/luneau-papin-domaine
  ('Luneau-Papin', 'Muscadet Sèvre et Maine Terre de Pierre', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.bowlerwine.com/producer/luneau-papin-domaine
  ('Luneau-Papin', 'Muscadet Sèvre et Maine Gula-Ana', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White')  -- https://www.bowlerwine.com/producer/luneau-papin-domaine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JO LANDRON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Jo Landron', 'Muscadet Sèvre et Maine Sur Lie Amphibolite', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.polanerselections.com/?p=25093
  ('Jo Landron', 'Muscadet Sèvre et Maine Sur Lie La Louvetrie', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.polanerselections.com/?p=25093
  ('Jo Landron', 'Muscadet Sèvre et Maine Sur Lie Le Fief du Breil', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.polanerselections.com/?p=25093
  ('Jo Landron', 'Muscadet Sèvre et Maine Sur Lie Les Houx', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.polanerselections.com/?p=25093
  ('Jo Landron', 'Atmosphères Méthode Traditionnelle Brut Nature', 'Loire Valley, France', 'Folle Blanche, Pinot Noir, Chardonnay, Montils', 'Sparkling'),  -- https://www.polanerselections.com/?p=25093
  ('Jo Landron', 'Muscadet Sèvre et Maine Sur Lie Le Clos la Carizière', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://domaines-landron.fr/portfolio_page/clos-la-cariziere-muscadet-sur-lie/
  ('Jo Landron', 'Muscadet Sèvre et Maine Sur Lie La Haute Tradition', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://domaines-landron.fr/portfolio_page/haute-tradition/
  ('Jo Landron', 'Muscadet Sèvre et Maine Sur Lie Grains de Raisins', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://domaines-landron.fr/portfolio_page/grains-de-raisins/
  ('Jo Landron', 'Vin de France Melonix', 'Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://domaines-landron.fr/portfolio_page/melonix-vin-de-france/
  ('Jo Landron', 'Vin de France Wesh Gros', 'Loire Valley, France', 'Folle Blanche', 'White'),  -- https://domaines-landron.fr/portfolio_page/wesh-gros-folle-blanche/
  ('Jo Landron', 'Strike Méthode Ancestrale', 'Loire Valley, France', 'Melon de Bourgogne, Chardonnay', 'Sparkling')  -- https://domaines-landron.fr/portfolio_page/strike-vin-mousseux/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA PÉPIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de la Pépière', 'Muscadet Sèvre et Maine Sur Lie La Pépie', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://bowlerwine.com/producer/pepiere
  ('Domaine de la Pépière', 'Muscadet Sèvre et Maine Sur Lie Briords Cuvée Vieilles Vignes', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://bowlerwine.com/producer/pepiere
  ('Domaine de la Pépière', 'Muscadet Sèvre et Maine Sur Lie Gras Moutons', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://bowlerwine.com/producer/pepiere
  ('Domaine de la Pépière', 'Muscadet Sèvre et Maine Le Repos du Mouton', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://bowlerwine.com/producer/pepiere
  ('Domaine de la Pépière', 'Muscadet Sèvre et Maine Clisson', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://bowlerwine.com/producer/pepiere
  ('Domaine de la Pépière', 'Muscadet Sèvre et Maine Monnières-Saint-Fiacre', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://bowlerwine.com/producer/pepiere
  ('Domaine de la Pépière', 'Muscadet Sèvre et Maine Château-Thébaud', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://bowlerwine.com/producer/pepiere
  ('Domaine de la Pépière', 'Muscadet Sèvre et Maine Gorges', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://bowlerwine.com/producer/pepiere
  ('Domaine de la Pépière', 'Val de Loire Côt La Pépie', 'Loire Valley, France', 'Côt', 'Red'),  -- https://bowlerwine.com/producer/pepiere
  ('Domaine de la Pépière', 'Val de Loire Cabernet Franc Merlot La Pépie', 'Loire Valley, France', 'Cabernet Franc, Merlot', 'Red')  -- https://bowlerwine.com/producer/pepiere
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE L'ÉCU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de l''Écu', 'Muscadet Sèvre et Maine Classic', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://kysela.com/domaine-de-l-ecu.html
  ('Domaine de l''Écu', 'Muscadet Sèvre et Maine Gneiss', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://kysela.com/domaine-de-l-ecu.html
  ('Domaine de l''Écu', 'Muscadet Sèvre et Maine Granite', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://kysela.com/domaine-de-l-ecu.html
  ('Domaine de l''Écu', 'Muscadet Sèvre et Maine Orthogneiss', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://kysela.com/domaine-de-l-ecu.html
  ('Domaine de l''Écu', 'Vin de France Sole', 'Loire Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20l'Ecu
  ('Domaine de l''Écu', 'Vin de France Matris', 'Loire Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20l'Ecu
  ('Domaine de l''Écu', 'Vin de France Marguerite', 'Loire Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20l'Ecu
  ('Domaine de l''Écu', 'Vin de France Taurus', 'Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20l'Ecu
  ('Domaine de l''Écu', 'Vin de France Janus', 'Loire Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20l'Ecu
  ('Domaine de l''Écu', 'Vin de France Carpe Diem', 'Loire Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20l'Ecu
  ('Domaine de l''Écu', 'Vin de France Mephisto', 'Loire Valley, France', 'Cabernet Franc', 'Red')  -- https://www.vino.com/fr/dettaglio/vin-de-france-cabernet-franc-mephisto-domaine-de-lecu.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BRÉGEON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Brégeon', 'Muscadet Hors-Série', 'Muscadet, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1463/domaine-bregeon
  ('Domaine Brégeon', 'Gros Plant du Pays Nantais Foll'' Blanche', 'Gros Plant du Pays Nantais, Loire Valley, France', 'Folle Blanche', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1463/domaine-bregeon
  ('Domaine Brégeon', 'Muscadet Sèvre et Maine Original', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1463/domaine-bregeon
  ('Domaine Brégeon', 'Crémant de Loire Folies', 'Crémant de Loire, Loire Valley, France', 'Melon de Bourgogne', 'Sparkling'),  -- https://www.ruedesvignerons.com/fr/domaine/1463/domaine-bregeon
  ('Domaine Brégeon', 'Marginal', 'Loire Valley, France', 'Melon de Bourgogne', 'Sweet'),  -- https://www.ruedesvignerons.com/fr/domaine/1463/domaine-bregeon
  ('Domaine Brégeon', 'Muscadet Sèvre et Maine Réserve', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1463/domaine-bregeon
  ('Domaine Brégeon', 'Muscadet Sèvre et Maine Clisson', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1463/domaine-bregeon
  ('Domaine Brégeon', 'Muscadet Sèvre et Maine Gorges', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White')  -- https://www.ruedesvignerons.com/fr/domaine/1463/domaine-bregeon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DU CLÉRAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château du Cléray', 'Muscadet Sèvre et Maine Sur Lie', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Château du Cléray', 'Muscadet Sèvre et Maine', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Château du Cléray', 'Muscadet Sèvre et Maine Vallet', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://sauvion.com/a-la-decouverte-de-notre-terroir/
  ('Château du Cléray', 'Domaine du Cléray Val de Loire Sauvignon Blanc', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Château du Cléray', 'Domaine du Cléray Val de Loire Chardonnay', 'Loire Valley, France', 'Chardonnay', 'White')  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SAUVION ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Sauvion', 'Crémant de Loire Tradition de Sauvion Blanc Chardonnay Brut', 'Crémant de Loire, Loire Valley, France', 'Chardonnay', 'Sparkling'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Sauvion', 'Crémant de Loire Tradition de Sauvion Rosé Brut', 'Crémant de Loire, Loire Valley, France', null, 'Sparkling'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Sauvion', 'Turbulent Préambule Blanc Brut', 'Loire Valley, France', null, 'Sparkling'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Sauvion', 'Turbulent Préambule Rosé Brut', 'Loire Valley, France', null, 'Sparkling'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Sauvion', 'Muscadet Sèvre et Maine Sur Lie Haute Culture Cardinal Richard', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Sauvion', 'Muscadet Sèvre et Maine Sur Lie Haute Culture Jardins Secrets', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Sauvion', 'Saumur Mousseux Blanc Brut', 'Saumur, Loire Valley, France', null, 'Sparkling'),  -- https://maisonlacheteau.com/fr/147-chateau-du-cleray
  ('Sauvion', 'Pouilly-Fumé Les Ombelles', 'Pouilly-Fumé, Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://bottleofitaly.com/en/cantine/sauvion
  ('Sauvion', 'Val de Loire Chenin Blanc', 'Loire Valley, France', 'Chenin Blanc', 'White')  -- https://www.saq.com/page/en/saqcom/white-wine/sauvion-chenin-blanc-val-de-loire/13993312
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FAMILLE LIEUBEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine La Minée', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine Château-Thébaud', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine Clisson', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine Goulaine', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine Sur Lie Bel Abord', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine Sur Lie Clos de la Placelière', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine Sur Lie Confluent', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine Sur Lie Générations', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine Sur Lie Le Lys et l''Hermine', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Sèvre et Maine Sur Lie La Fruitière Classique', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Muscadet Le Voyage Extraordinaire', 'Muscadet, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Méthode Traditionnelle 1816 Blanc', 'Loire Valley, France', null, 'Sparkling'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Gros Plant du Pays Nantais Folle Blanche', 'Gros Plant du Pays Nantais, Loire Valley, France', 'Folle Blanche', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Val de Loire Sauvignon', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Val de Loire Chardonnay', 'Loire Valley, France', 'Chardonnay', 'White'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Val de Loire Rosé', 'Loire Valley, France', null, 'Rosé'),  -- https://lieubeau.com/nos-vins/
  ('Famille Lieubeau', 'Val de Loire Pinot Noir', 'Loire Valley, France', 'Pinot Noir', 'Red')  -- https://lieubeau.com/nos-vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BONNET-HUTEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Bonnet-Huteau', 'Muscadet Sèvre et Maine Sur Lie Clos Moulin Chartrie', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Bonnet_Huteau
  ('Domaine Bonnet-Huteau', 'Muscadet Sèvre et Maine Sur Lie Les Gautronnières', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Bonnet_Huteau
  ('Domaine Bonnet-Huteau', 'Muscadet Sèvre et Maine Les Laures', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Bonnet_Huteau
  ('Domaine Bonnet-Huteau', 'Muscadet Sèvre et Maine Sur Lie Les Bonnets Blancs', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Bonnet_Huteau
  ('Domaine Bonnet-Huteau', 'Muscadet Sèvre et Maine Goulaine', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Bonnet_Huteau
  ('Domaine Bonnet-Huteau', 'Nuit Boréale Méthode Traditionnelle Brut', 'Loire Valley, France', null, 'Sparkling'),  -- https://www.idealwine.com/en/buy-wine/domain-Bonnet_Huteau
  ('Domaine Bonnet-Huteau', 'Vin de France Ordolia', 'Loire Valley, France', null, 'Orange'),  -- https://www.idealwine.com/en/buy-wine/domain-Bonnet_Huteau
  ('Domaine Bonnet-Huteau', 'Vin de France Médolia', 'Loire Valley, France', null, 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Bonnet_Huteau
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOUIS MÉTAIREAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Louis Métaireau', 'Muscadet Sèvre et Maine Sur Lie Carte Noire', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.mwines.com/?p=5335
  ('Louis Métaireau', 'Muscadet Sèvre et Maine Sur Lie Cuvée One', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.mwines.com/?p=5335
  ('Louis Métaireau', 'Muscadet Sèvre et Maine Sur Lie Grand Mouton', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.mwines.com/?p=5335
  ('Louis Métaireau', 'Muscadet Sèvre et Maine Sur Lie Petit Mouton', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.mwines.com/?p=5335
  ('Louis Métaireau', 'Méthode Traditionnelle Extra-Brut', 'Loire Valley, France', null, 'Sparkling')  -- https://www.mwines.com/?p=5335
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE LA RAGOTIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Château de la Ragotière', 'Muscadet Sèvre et Maine Cuvée Amélie', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1282/chateau-de-la-ragotiere
  ('Château de la Ragotière', 'Muscadet Sèvre et Maine La Petite Etoile', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1282/chateau-de-la-ragotiere
  ('Château de la Ragotière', 'Val de Loire Cuvée Prestige Sauvignon Blanc', 'Loire Valley, France', 'Sauvignon Blanc', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1282/chateau-de-la-ragotiere
  ('Château de la Ragotière', 'Val de Loire Coeur de Schistes Chardonnay', 'Loire Valley, France', 'Chardonnay', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1282/chateau-de-la-ragotiere
  ('Château de la Ragotière', 'Val de Loire Collection Privée des Frères Couillaud Sauvignon Gris', 'Loire Valley, France', 'Sauvignon Gris', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/1282/chateau-de-la-ragotiere
  ('Château de la Ragotière', 'Val de Loire Collection Privée des Frères Couillaud Pinot Gris', 'Loire Valley, France', 'Pinot Gris', 'Sweet'),  -- https://www.ruedesvignerons.com/fr/domaine/1282/chateau-de-la-ragotiere
  ('Château de la Ragotière', 'Muscadet Sèvre et Maine La Belle Vie', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1549/ch-de-la-ragotiere
  ('Château de la Ragotière', 'Val de Loire Chardonnay Cuvée Prestige', 'Loire Valley, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1549/ch-de-la-ragotiere
  ('Château de la Ragotière', 'Muscadet Sèvre et Maine Sur Lie Les Schistes', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White')  -- https://www.saq.com/page/en/saqcom/white-wine/chateau-de-la-ragotiere-les-schistes-muscadet-sevre-et-maine-sur-lie-2016/12543985
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BRUNO CORMERAIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine Bruno Cormerais', 'Muscadet Sèvre et Maine Clisson', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://fr.gaultmillau.com/fr/wineries/domaine-bruno-cormerais
  ('Domaine Bruno Cormerais', 'Muscadet Sèvre et Maine Sur Lie Vieilles Vignes', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.decanter.com/wine-reviews/france/loire/bruno-cormerais-vieilles-vignes-sur-lie-muscadet-de-sevre-30702
  ('Domaine Bruno Cormerais', 'Muscadet Sèvre et Maine Sur Lie Chambaudière', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1580/dom-bruno-cormerais/
  ('Domaine Bruno Cormerais', 'Muscadet Sèvre et Maine Sur Lie', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1580/dom-bruno-cormerais/
  ('Domaine Bruno Cormerais', 'Muscadet Sèvre et Maine Tess 6 Ans', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1580/dom-bruno-cormerais/
  ('Domaine Bruno Cormerais', 'Gros Plant du Pays Nantais Sur Lie', 'Gros Plant du Pays Nantais, Loire Valley, France', 'Folle Blanche', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1580/dom-bruno-cormerais/
  ('Domaine Bruno Cormerais', 'Val de Loire Pourpre', 'Loire Valley, France', 'Merlot, Gamay, Abouriou', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1580/dom-bruno-cormerais/
  ('Domaine Bruno Cormerais', 'Val de Loire Merlot Rosé', 'Loire Valley, France', 'Merlot', 'Rosé')  -- https://www.hachette-vins.com/guide-vins/producteurs/1580/dom-bruno-cormerais/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA CHAUVINIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de la Chauvinière', 'Muscadet Sèvre et Maine Sur Lie', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/6393/jeremie-huchet
  ('Domaine de la Chauvinière', 'Muscadet Sèvre et Maine Granit de Château-Thébaud', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/6393/jeremie-huchet
  ('Domaine de la Chauvinière', 'Muscadet Sèvre et Maine Château-Thébaud Parcelle Le Tord', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White')  -- https://www.hachette-vins.com/guide-vins/producteurs/6393/jeremie-huchet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA LOUVETRIE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_loire.sql)'
from (values
  ('Domaine de la Louvetrie', 'Muscadet Sèvre et Maine Sur Lie Le Fief du Breil', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White'),  -- https://delectable.com/wine/domaine-de-la-louvetrie-(landron-and-fils)/le-fief-du-breil-sur-lie-muscadet-sevre-et-maine-melon-de-bourgogne/--
  ('Domaine de la Louvetrie', 'Muscadet Sèvre et Maine Amphibolite Nature', 'Muscadet Sèvre et Maine, Loire Valley, France', 'Melon de Bourgogne', 'White')  -- https://www.sfwtc.com/wine/2023-domaine-de-la-louvetrie-muscadet-amphibolite-nature/2023-13989R-750
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
