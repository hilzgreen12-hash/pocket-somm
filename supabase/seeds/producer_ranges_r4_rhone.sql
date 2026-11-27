-- Producer ranges round 4: Rhône. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- DELAS FRÈRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Delas Frères', 'Cornas Chante-Perdrix', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/chante-perdrix/
  ('Delas Frères', 'Condrieu Clos Boucher', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://delas.com/vins/clos-boucher/
  ('Delas Frères', 'Vacqueyras Domaine des Genêts', 'Vacqueyras, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://delas.com/vins/domaine-des-genets/
  ('Delas Frères', 'Crozes-Hermitage Domaine des Grands Chemins', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/domaine-des-grands-chemins/
  ('Delas Frères', 'Hermitage Domaine des Tourettes Blanc', 'Hermitage, Rhône Valley, France', 'Marsanne', 'White'),  -- https://delas.com/vins/domaine-des-tourettes-blanc/
  ('Delas Frères', 'Hermitage Domaine des Tourettes Rouge', 'Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/domaine-des-tourettes-rouge/
  ('Delas Frères', 'Saint-Joseph François de Tournon', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/francois-de-tournon/
  ('Delas Frères', 'Châteauneuf-du-Pape Haute Pierre', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://delas.com/vins/haute-pierre/
  ('Delas Frères', 'Condrieu La Galopine', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://delas.com/vins/la-galopine/
  ('Delas Frères', 'Côte-Rôtie La Landonne', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/la-landonne/
  ('Delas Frères', 'Crozes-Hermitage Le Clos', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/le-clos/
  ('Delas Frères', 'Hermitage Les Bessards', 'Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/les-bessards/
  ('Delas Frères', 'Saint-Joseph Les Challeys Blanc', 'Saint-Joseph, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://delas.com/vins/les-challeys-blanc/
  ('Delas Frères', 'Saint-Joseph Les Challeys Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/les-challeys-rouge/
  ('Delas Frères', 'Crozes-Hermitage Les Launes Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://delas.com/vins/les-launes-blanc/
  ('Delas Frères', 'Crozes-Hermitage Les Launes Rouge', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/les-launes-rouge/
  ('Delas Frères', 'Gigondas Les Reinages', 'Gigondas, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://delas.com/vins/les-reinages/
  ('Delas Frères', 'Hermitage Ligne de Crête', 'Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/ligne-de-crete/
  ('Delas Frères', 'Côtes du Rhône Saint-Esprit Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Blanc, Viognier, Marsanne, Roussanne, Clairette', 'White'),  -- https://delas.com/vins/saint-esprit-blanc/
  ('Delas Frères', 'Côtes du Rhône Saint-Esprit Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://delas.com/vins/saint-esprit-rouge/
  ('Delas Frères', 'Saint-Joseph Sainte-Épine', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://delas.com/vins/sainte-epine/
  ('Delas Frères', 'Côte-Rôtie Seigneur de Maugiron', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red')  -- https://delas.com/vins/seigneur-de-maugiron/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ALAIN VOGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Alain Voge', 'Cornas Les Chailles', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.alain-voge.com/fr/cornas/les-chailles
  ('Domaine Alain Voge', 'Cornas Les Vieilles Vignes', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.alain-voge.com/fr/cornas/les-vieilles-vignes
  ('Domaine Alain Voge', 'Cornas Les Vieilles Fontaines', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.alain-voge.com/fr/cornas/les-vieilles-fontaines
  ('Domaine Alain Voge', 'Cornas Chapelle Saint-Pierre', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.alain-voge.com/fr/cornas/chapelle-saint-pierre
  ('Domaine Alain Voge', 'Saint-Péray Harmonie', 'Saint-Péray, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.alain-voge.com/fr/saint-peray/harmonie
  ('Domaine Alain Voge', 'Saint-Péray Ongrie', 'Saint-Péray, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.alain-voge.com/fr/saint-peray/ongrie
  ('Domaine Alain Voge', 'Saint-Péray Fleur de Crussol', 'Saint-Péray, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.alain-voge.com/fr/saint-peray/fleur-de-crussol
  ('Domaine Alain Voge', 'Saint-Péray Les Bulles d''Alain Brut Nature', 'Saint-Péray, Rhône Valley, France', 'Marsanne', 'Sparkling'),  -- https://www.alain-voge.com/fr/saint-peray/les-bulles-d-alain
  ('Domaine Alain Voge', 'Saint-Joseph Les Côtes', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.alain-voge.com/fr/saint-joseph/les-cotes
  ('Domaine Alain Voge', 'Côtes du Rhône Les Peyrouses', 'Côtes du Rhône, Rhône Valley, France', 'Syrah', 'Red')  -- https://www.alain-voge.com/fr/cotes-du-rhone/les-peyrouses
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- YVES CUILLERON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Yves Cuilleron', 'Saint-Joseph Blanc Lyseras', 'Saint-Joseph, Rhône Valley, France', 'Roussanne, Marsanne', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/1/x
  ('Yves Cuilleron', 'Saint-Joseph Blanc Le Lombard', 'Saint-Joseph, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/2/x
  ('Yves Cuilleron', 'Saint-Joseph Blanc Lieu-Dit Digue', 'Saint-Joseph, Rhône Valley, France', 'Roussanne', 'White'),  -- https://www.cuilleron.com/fr/appellations
  ('Yves Cuilleron', 'Saint-Péray Les Potiers', 'Saint-Péray, Rhône Valley, France', 'Roussanne, Marsanne', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/4/x
  ('Yves Cuilleron', 'Saint-Péray Lieu-Dit Biousse', 'Saint-Péray, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/5/x
  ('Yves Cuilleron', 'Crozes-Hermitage Blanc Les Rousses', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/6/x
  ('Yves Cuilleron', 'Condrieu La Petite Côte', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.cuilleron.com/fr/appellations
  ('Yves Cuilleron', 'Condrieu Les Chaillets', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/8/x
  ('Yves Cuilleron', 'Condrieu Lieu-Dit Verlieu', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/9/x
  ('Yves Cuilleron', 'Condrieu Lieu-Dit Vernon', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/10/x
  ('Yves Cuilleron', 'Condrieu Ayguets', 'Condrieu, Rhône Valley, France', 'Viognier', 'Sweet'),  -- https://www.cuilleron.com/fr/product/1/x/11/x
  ('Yves Cuilleron', 'Condrieu Essence d''Automne', 'Condrieu, Rhône Valley, France', 'Viognier', 'Sweet'),  -- https://www.cuilleron.com/fr/appellations
  ('Yves Cuilleron', 'Collines Rhodaniennes Roussanne Vignes d''à Côté', 'Collines Rhodaniennes, Rhône Valley, France', 'Roussanne', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/14/x
  ('Yves Cuilleron', 'Collines Rhodaniennes Marsanne Vignes d''à Côté', 'Collines Rhodaniennes, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.cuilleron.com/fr/product/1/x/15/x
  ('Yves Cuilleron', 'Collines Rhodaniennes Gamay Vignes d''à Côté', 'Collines Rhodaniennes, Rhône Valley, France', 'Gamay', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/16/x
  ('Yves Cuilleron', 'Collines Rhodaniennes Syrah Vignes d''à Côté', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/17/x
  ('Yves Cuilleron', 'Collines Rhodaniennes Les Candives', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/18/x
  ('Yves Cuilleron', 'Collines Rhodaniennes Signé', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/19/x
  ('Yves Cuilleron', 'Collines Rhodaniennes Ripa Sinistra', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/31/x
  ('Yves Cuilleron', 'Crozes-Hermitage Rouge Labaya', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/20/x
  ('Yves Cuilleron', 'Crozes-Hermitage Rouge Lieu-Dit Les Chassis', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/appellations
  ('Yves Cuilleron', 'Saint-Joseph Rouge Les Pierres Sèches', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/22/x
  ('Yves Cuilleron', 'Saint-Joseph Rouge Cavanos', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/23/x
  ('Yves Cuilleron', 'Saint-Joseph Rouge Les Serines', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/24/x
  ('Yves Cuilleron', 'Côte-Rôtie Bassenon', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/25/x
  ('Yves Cuilleron', 'Côte-Rôtie Madinière', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/26/x
  ('Yves Cuilleron', 'Côte-Rôtie Lieu-Dit Bonnivières', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/27/x
  ('Yves Cuilleron', 'Côte-Rôtie Lieu-Dit La Viallière', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/28/x
  ('Yves Cuilleron', 'Cornas Le Village', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/29/x
  ('Yves Cuilleron', 'Cornas Lieu-Dit Les Côtes', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cuilleron.com/fr/product/1/x/30/x
  ('Yves Cuilleron', 'Vin de France Roussillière', 'Rhône Valley, France', 'Marsanne, Roussanne, Viognier', 'Sweet')  -- https://www.cuilleron.com/fr/product/1/x/35/x
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN-LOUIS CHAVE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Jean-Louis Chave', 'Hermitage Rouge', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://grandcruselections.com/domaine-jeanlouis-chave
  ('Domaine Jean-Louis Chave', 'Hermitage Blanc', 'Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://grandcruselections.com/domaine-jeanlouis-chave
  ('Domaine Jean-Louis Chave', 'Saint-Joseph', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://grandcruselections.com/domaine-jeanlouis-chave
  ('Domaine Jean-Louis Chave', 'Saint-Joseph Clos Florentin', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://grandcruselections.com/domaine-jeanlouis-chave
  ('Domaine Jean-Louis Chave', 'Hermitage Cuvée Cathelin', 'Hermitage, Rhône Valley, France', 'Syrah', 'Red')  -- https://grandcruselections.com/domaine-jeanlouis-chave
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- J.L. CHAVE SÉLECTION ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('J.L. Chave Sélection', 'Côtes du Rhône Mon Coeur', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://trialto.kork.ca/ab/fr/nos-domaines/jl-chave-selection/cotes-du-rhone-mon-coeur-2/2024/238162
  ('J.L. Chave Sélection', 'Crozes-Hermitage Silène', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://trialto.kork.ca/ab/fr/nos-domaines/jl-chave-selection/crozes-hermitage-silene/2024/764955
  ('J.L. Chave Sélection', 'Hermitage Blanche', 'Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://trialto.kork.ca/ab/fr/nos-domaines/jl-chave-selection/hermitage-blanche/2021/764957
  ('J.L. Chave Sélection', 'Hermitage Farconnet', 'Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://trialto.kork.ca/ab/fr/nos-domaines/jl-chave-selection/hermitage-farconnet/2021/764956
  ('J.L. Chave Sélection', 'Saint-Joseph Circa', 'Saint-Joseph, Rhône Valley, France', 'Roussanne', 'White'),  -- https://trialto.kork.ca/ab/fr/nos-domaines/jl-chave-selection/saint-joseph-circa/2023/865304
  ('J.L. Chave Sélection', 'Saint-Joseph Offerus', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red')  -- https://trialto.kork.ca/ab/fr/nos-domaines/jl-chave-selection/saint-joseph-offerus/2024/718840
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PIERRE GAILLARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Pierre Gaillard', 'Collines Rhodaniennes Asiaticus', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/asiaticus/
  ('Pierre Gaillard', 'Vin de France Avant l''Heure', 'Rhône Valley, France', 'Roussanne, Viognier', 'Sweet'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/avant-lheure/
  ('Pierre Gaillard', 'Saint-Joseph Clos de Cuminaille', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/clos-de-cuminaille/
  ('Pierre Gaillard', 'Condrieu', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/condrieu/
  ('Pierre Gaillard', 'Cornas', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/cornas/
  ('Pierre Gaillard', 'Côte-Rôtie', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/cote-rotie/
  ('Pierre Gaillard', 'Crozes-Hermitage', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/crozes-hermitage/
  ('Pierre Gaillard', 'Côte-Rôtie Esprit de Blonde', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/esprit-de-blonde/
  ('Pierre Gaillard', 'Condrieu Fleurs d''Automne', 'Condrieu, Rhône Valley, France', 'Viognier', 'Sweet'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/fleurs-dautomne/
  ('Pierre Gaillard', 'Vin de France Grapillage', 'Rhône Valley, France', 'Roussanne, Viognier', 'Sweet'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/grapillage/
  ('Pierre Gaillard', 'Condrieu Jeanne-Élise', 'Condrieu, Rhône Valley, France', 'Viognier', 'Sweet'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/jeanne-elise/
  ('Pierre Gaillard', 'Côtes du Rhône Les Gendrines', 'Côtes du Rhône, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/les-gendrines/
  ('Pierre Gaillard', 'Saint-Joseph Les Pierres', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/les-pierres/
  ('Pierre Gaillard', 'Condrieu L''Octroi', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/loctroi/
  ('Pierre Gaillard', 'Côte-Rôtie Rose Pourpre', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/rose-pourpre/
  ('Pierre Gaillard', 'Saint-Joseph Blanc', 'Saint-Joseph, Rhône Valley, France', 'Roussanne', 'White'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/saint-joseph-blanc/
  ('Pierre Gaillard', 'Saint-Joseph Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/saint-joseph-rouge/
  ('Pierre Gaillard', 'Saint-Péray', 'Saint-Péray, Rhône Valley, France', 'Marsanne, Roussanne', 'White')  -- https://www.famillepierregaillard.com/boutique/pierre-gaillard/saint-peray/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- RENÉ ROSTAING ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('René Rostaing', 'Côte-Rôtie Ampodium', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.rarewineco.com/growers/rostaing-1131/
  ('René Rostaing', 'Côte-Rôtie La Landonne', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.rarewineco.com/growers/rostaing-1131/
  ('René Rostaing', 'Côte-Rôtie Côte Blonde', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.rarewineco.com/growers/rostaing-1131/
  ('René Rostaing', 'Côte-Rôtie La Viaillère', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.rarewineco.com/growers/rostaing-1131/
  ('René Rostaing', 'Côte-Rôtie Côte Brune', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.rarewineco.com/growers/rostaing-1131/
  ('René Rostaing', 'Condrieu La Bonnette', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.rarewineco.com/growers/rostaing-1131/
  ('René Rostaing', 'Collines Rhodaniennes Les Lézardes Rouge', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.rarewineco.com/growers/rostaing-1131/
  ('René Rostaing', 'Collines Rhodaniennes Les Lézardes Blanc', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'White')  -- https://www.rarewineco.com/growers/rostaing-1131/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JAMET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Jamet', 'Côte-Rôtie', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://trialto.kork.ca/bc/en/our-wineries/domaine-jamet/cote-rotie/2022/81927
  ('Domaine Jamet', 'Côte-Rôtie Fructus Voluptas', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://trialto.kork.ca/bc/en/our-wineries/domaine-jamet/cote-rotie-fructus-voluptas/2024/213921
  ('Domaine Jamet', 'Côte-Rôtie Côte Brune', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://trialto.kork.ca/bc/en/our-wineries/domaine-jamet/cote-rotie-cote-brune/2022/511188
  ('Domaine Jamet', 'Côte-Rôtie La Landonne', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://trialto.kork.ca/bc/en/our-wineries/domaine-jamet/cote-rotie-la-landonne/2019/461341
  ('Domaine Jamet', 'Condrieu Vernillon', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://trialto.kork.ca/bc/en/our-wineries/domaine-jamet/condrieu-vernillon/2022/461338
  ('Domaine Jamet', 'Côtes du Rhône Equivoque', 'Côtes du Rhône, Rhône Valley, France', 'Syrah', 'Red'),  -- https://trialto.kork.ca/bc/en/our-wineries/domaine-jamet/cote-du-rhone-equivoque/2020/213957
  ('Domaine Jamet', 'Côtes du Rhône Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Syrah', 'Red'),  -- https://trialto.kork.ca/bc/en/our-wineries/domaine-jamet/cotes-du-rhone/2024/892869
  ('Domaine Jamet', 'Côtes du Rhône Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Marsanne, Viognier, Roussanne', 'White'),  -- https://trialto.kork.ca/bc/en/our-wineries/domaine-jamet/cotes-du-rhone-blanc/2024/70373
  ('Domaine Jamet', 'Collines Rhodaniennes Syrah', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red')  -- https://trialto.kork.ca/bc/en/our-wineries/domaine-jamet/syrah-vins-de-pays-collines-rhodaniennes/2024/571463
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE AUGUSTE CLAPE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Auguste Clape', 'Cornas', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/2709004-1-bottle-Cornas-Auguste-Clape-2023-Red
  ('Domaine Auguste Clape', 'Cornas Renaissance', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/2709003-1-bottle-Cornas-Renaissance-Auguste-Clape-2023-Red
  ('Domaine Auguste Clape', 'Côtes du Rhône', 'Côtes du Rhône, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/2671362-2-bottles-Cotes-du-Rhone-Auguste-Clape-2022-Red
  ('Domaine Auguste Clape', 'Vin de France Le Vin des Amis', 'Rhône Valley, France', 'Syrah', 'Red'),  -- https://idealwine.com/en/buy-a-wine/2383763-1-bottle-Vin-de-France-Le-Vin-des-Amis-Auguste-Clape-2022-Red
  ('Domaine Auguste Clape', 'Saint-Péray', 'Saint-Péray, Rhône Valley, France', null, 'White')  -- https://www.idealwine.com/en/buy-a-wine/2745325-1-bottle-Saint-Peray-Auguste-Clape-2024-White
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GEORGES VERNAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Georges Vernay', 'Condrieu Coteau de Vernon', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://vincod.com/2I45DE
  ('Domaine Georges Vernay', 'Condrieu Chaillées de l''Enfer', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://vincod.com/D42C5E
  ('Domaine Georges Vernay', 'Condrieu Terrasses de l''Empire', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://vincod.com/E4572E
  ('Domaine Georges Vernay', 'Collines Rhodaniennes Pied de Samson', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'White'),  -- https://vincod.com/L0254E
  ('Domaine Georges Vernay', 'Collines Rhodaniennes Fleur de Mai', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vincod.com/2G4J5E
  ('Domaine Georges Vernay', 'Collines Rhodaniennes Sainte Agathe', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vincod.com/4052ME
  ('Domaine Georges Vernay', 'Saint-Joseph Terres d''Encre', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vincod.com/52V24E
  ('Domaine Georges Vernay', 'Saint-Joseph Dame Brune', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://vincod.com/18469DE91Z
  ('Domaine Georges Vernay', 'Côte-Rôtie Maison Rouge', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vincod.com/2X54HE
  ('Domaine Georges Vernay', 'Côte-Rôtie La Blonde du Seigneur', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red')  -- https://vincod.com/521F4E
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- STÉPHANE OGIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Stéphane Ogier', 'Côte-Rôtie La Belle Hélène', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Lancement', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Mon Village', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Réserve', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Le Champon', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Mes Grands Lieux', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Bertholon', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie But de Mont', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Côte Blonde', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Côte Bodin', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Fongeant', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Cognet', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Montmain', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Viallière', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côte-Rôtie Embruns', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Condrieu La Combe de Malleval', 'Condrieu, Rhône Valley, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Condrieu Les Vieilles Vignes de Jacques Vernay', 'Condrieu, Rhône Valley, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Collines Rhodaniennes L''Âme Soeur Syrah de Seyssuel', 'Collines Rhodaniennes, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Collines Rhodaniennes La Syrah d''Ogier', 'Collines Rhodaniennes, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Crozes-Hermitage Face à Face', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Saint-Joseph', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côtes du Rhône Le Temps est Venu Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Côtes du Rhône Le Temps est Venu Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5109-Stephane-Ogier.jsp
  ('Stéphane Ogier', 'Collines Rhodaniennes La Rosine', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://regalwineco.com/producer/domaine-stephane-ogier
  ('Stéphane Ogier', 'Collines Rhodaniennes Viognier de Rosine', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'White')  -- https://www.decanter.com/wine-reviews/france/rhone/stephane-ogier-viognier-de-rosine-collines-rhodaniennes-44084
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRANÇOIS VILLARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('François Villard', 'Condrieu Deponcins', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.alliancewine.com/francois-villard/condrieu-deponcins-2022-5716
  ('François Villard', 'Condrieu Les Terrasses du Palat', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.alliancewine.com/francois-villard/condrieu-terrasses-du-palat-2023-5490
  ('François Villard', 'Condrieu Villa Pontciana', 'Condrieu, Rhône Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Condrieu Le Grand Vallon', 'Condrieu, Rhône Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Côte-Rôtie Le Gallet Blanc', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.alliancewine.com/francois-villard/cote-rotie-le-gallet-blanc-2023-5715
  ('François Villard', 'Côte-Rôtie La Brocarde', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Côte-Rôtie Montlys', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Crozes-Hermitage Blanc Cour de Récré', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.alliancewine.com/francois-villard/crozes-hermitage-blanc-cour-de-recre-2024-5794
  ('François Villard', 'Crozes-Hermitage Rouge Certitude', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.alliancewine.com/francois-villard/crozes-hermitage-rouge-certitude-2023-5793
  ('François Villard', 'Crozes-Hermitage Comme une Évidence', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Collines Rhodaniennes La Sirène Blanche', 'Collines Rhodaniennes, Rhône Valley, France', 'Clairette, Muscat', 'White'),  -- https://www.alliancewine.com/francois-villard/la-sirene-blanche-igp-collines-rhodaniennes-2025-6706
  ('François Villard', 'Collines Rhodaniennes L''Appel des Sereines', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.alliancewine.com/francois-villard/lappel-des-serines-igp-collines-rhodaniennes-2023-6702
  ('François Villard', 'Collines Rhodaniennes Seul en Scène', 'Collines Rhodaniennes, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Les Contours de Mairlant Marsanne-Roussanne', 'Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.alliancewine.com/francois-villard/marsanne-roussanne-les-contours-de-mairlant-2024-6464
  ('François Villard', 'Viognier Les Contours de Deponcins', 'Rhône Valley, France', 'Viognier', 'White'),  -- https://www.alliancewine.com/francois-villard/viognier-les-contours-de-deponcins-igp-2024-5491
  ('François Villard', 'Saint-Joseph Rouge Poivre et Sol', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.alliancewine.com/francois-villard/saint-joseph-rouge-poivre-et-sol-2023-5492
  ('François Villard', 'Saint-Joseph Mairlant Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.bowlerwine.com/producer/villard-francois
  ('François Villard', 'Saint-Joseph Mairlant Blanc', 'Saint-Joseph, Rhône Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Saint-Joseph Reflet', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Saint-Joseph Gran Reflet', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Saint-Joseph Fruit d''Avilleran', 'Saint-Joseph, Rhône Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Saint-Péray Version', 'Saint-Péray, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.alliancewine.com/francois-villard/saint-peray-version-2023-5489
  ('François Villard', 'Saint-Péray Version Longue', 'Saint-Péray, Rhône Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Cornas Jouvet', 'Cornas, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
  ('François Villard', 'Vin de France Quintessence', 'Rhône Valley, France', null, 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Fran%C3%A7ois%20Villard
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VINS DE VIENNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Vins de Vienne', 'Collines Rhodaniennes Taburnum', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Collines Rhodaniennes Sotanum', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Collines Rhodaniennes Heluicum', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Condrieu Jeanraude', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Péray Les Faures', 'Saint-Péray, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Crozes-Hermitage Maison Blanche', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Joseph Le Biez Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Joseph Le Biez Blanc', 'Saint-Joseph, Rhône Valley, France', 'Roussanne', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Côte-Rôtie Le Plomb', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Crozes-Hermitage Les Grappiats', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Cornas Saint-Pierre', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Côte-Rôtie Les Grandes Places', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Crozes-Hermitage Bedad', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Côte-Rôtie Le Combard', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Côtes du Rhône Brézème', 'Côtes du Rhône, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Côtes du Rhône Brézème Termiéra', 'Côtes du Rhône, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Condrieu Poncin', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Condrieu La Chambée', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Joseph L''Elouède', 'Saint-Joseph, Rhône Valley, France', 'Roussanne, Marsanne', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Péray Les Bialères', 'Saint-Péray, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Côte-Rôtie Les Essartailles', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Joseph L''Arzelle', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Cornas Les Barcillants', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Hermitage Les Chirats de Saint-Christophe', 'Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Crozes-Hermitage Les Palignons', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Châteauneuf-du-Pape Les Otéliées', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Gigondas Les Pimpignoles', 'Gigondas, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Cairanne La Perdendaille', 'Cairanne, Rhône Valley, France', 'Grenache, Syrah, Carignan', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Vacqueyras La Sillote', 'Vacqueyras, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Condrieu', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Crozes-Hermitage Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Péray', 'Saint-Péray, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Côtes du Rhône Les Laurelles', 'Côtes du Rhône, Rhône Valley, France', 'Viognier, Marsanne, Grenache Blanc, Clairette', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Collines Rhodaniennes Marsanne', 'Collines Rhodaniennes, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Collines Rhodaniennes Viognier', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Vin de France Reméage Blanc', 'Rhône Valley, France', 'Viognier, Marsanne, Chardonnay, Sauvignon', 'White'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Joseph', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Crozes-Hermitage Rouge', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Côtes du Rhône Les Cranilles', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Carignan', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Vin de France Reméage Rouge', 'Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Vin de France Reméage Rosé', 'Rhône Valley, France', 'Syrah', 'Rosé'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Collines Rhodaniennes Gamay', 'Collines Rhodaniennes, Rhône Valley, France', 'Gamay', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Collines Rhodaniennes Syrah', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Collines Rhodaniennes Syrah Sans Sulfites Ajoutés', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Joseph Sans Sulfites Ajoutés', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Crozes-Hermitage Sans Sulfites Ajoutés', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Côtes du Rhône Amet', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Saint-Péray Hommage 1829', 'Saint-Péray, Rhône Valley, France', 'Marsanne', 'Sparkling'),  -- https://www.lesvinsdevienne.fr/vins
  ('Vins de Vienne', 'Collines Rhodaniennes Cépées Caties', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'Sweet')  -- https://www.lesvinsdevienne.fr/vins
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAVE DE TAIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Cave de Tain', 'Collines Rhodaniennes Marsanne Première Note', 'Collines Rhodaniennes, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Viognier Première Note', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Syrah Première Note', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Rosé de Syrah Première Note', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Rosé'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Syrah Domaine des Gardes', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Syrah Déshlatère', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Rosé'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Miss Roussanne', 'Collines Rhodaniennes, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Lady Marsanne', 'Collines Rhodaniennes, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Queen of Syrah', 'Collines Rhodaniennes, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Vin de France Marsanne-Viognier Bulles Fines et Légères', 'Rhône Valley, France', 'Marsanne, Viognier', 'Sparkling'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Qui Vivra Syrah', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Syrah ou Vérité', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Syrahtata', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage J''irai où tu Syrah', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Nobles Rives Blanc', 'Crozes-Hermitage, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Nobles Rives Rouge', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Hermitage Nobles Rives Blanc', 'Hermitage, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Hermitage Nobles Rives Rouge', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Joseph Nobles Rives Blanc', 'Saint-Joseph, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Joseph Nobles Rives Rouge', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Cornas Nobles Rives', 'Cornas, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Péray Nobles Rives', 'Saint-Péray, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Péray Brut', 'Saint-Péray, Rhône Valley, France', null, 'Sparkling'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Syrah Sans Sulfites Ajoutés', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Marsanne-Viognier Exploration', 'Collines Rhodaniennes, Rhône Valley, France', 'Marsanne, Viognier', 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Collines Rhodaniennes Syrah Exploration', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Exploration Blanc', 'Crozes-Hermitage, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Exploration Rouge', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Joseph Exploration Blanc', 'Saint-Joseph, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Joseph Exploration Rouge', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Cornas Exploration', 'Cornas, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Hermitage Exploration', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Quetzilla Méjeans', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Joseph Quetzilla Tourtouret', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Les Hauts d''Eole', 'Crozes-Hermitage, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Les Hauts du Fief', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Hermitage Au Cœur des Siècles', 'Hermitage, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Hermitage Le Temps d''une Rencontre', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Joseph Terre d''Ivoire', 'Saint-Joseph, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Joseph Esprit de Granit', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Cornas Arènes Sauvages', 'Cornas, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Saint-Péray Fleur de Roc', 'Saint-Péray, Rhône Valley, France', null, 'White'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Hermitage Gambert de Loche', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Hermitage Epsilon', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Crozes-Hermitage Epure', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
  ('Cave de Tain', 'Hermitage Vin de Paille', 'Hermitage, Rhône Valley, France', null, 'Sweet')  -- https://www.cavedetain.com/files/Documents/Boutique%20de%20la%20Cave/Tarif%20Boutique%202026.pdf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ALAIN GRAILLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Alain Graillot', 'Crozes-Hermitage Rouge', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Graillot
  ('Domaine Alain Graillot', 'Crozes-Hermitage Blanc', 'Crozes-Hermitage, Rhône Valley, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Graillot
  ('Domaine Alain Graillot', 'Crozes-Hermitage La Guiraude', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Graillot
  ('Domaine Alain Graillot', 'Hermitage', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Graillot
  ('Domaine Alain Graillot', 'Saint-Joseph', 'Saint-Joseph, Rhône Valley, France', null, 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Graillot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE COMBIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Combier', 'Crozes-Hermitage Clos des Grives Rouge', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.domaine-combier.com/fr/vins/clos-des-grives-rouge
  ('Domaine Combier', 'Crozes-Hermitage Clos des Grives Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Roussanne', 'White'),  -- https://www.domaine-combier.com/fr/vins/clos-des-grives-blanc
  ('Domaine Combier', 'Crozes-Hermitage Cap Nord Rouge', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.domaine-combier.com/fr/vins/cap-nord-rouge
  ('Domaine Combier', 'Crozes-Hermitage Cap Nord Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.domaine-combier.com/fr/vins/cap-nord-blanc
  ('Domaine Combier', 'Saint-Joseph Cap Nord', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.domaine-combier.com/fr/vins/cap-nord-saint-joseph
  ('Domaine Combier', 'Crozes-Hermitage Rouge', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.domaine-combier.com/fr/vins/domaine-combier-crozes-rouge
  ('Domaine Combier', 'Crozes-Hermitage Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.domaine-combier.com/fr/vins/domaine-combier-crozes-blanc
  ('Domaine Combier', 'Saint-Joseph Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.domaine-combier.com/fr/vins/domaine-combier-saint-joseph
  ('Domaine Combier', 'Crozes-Hermitage Cuvée L Rouge', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.domaine-combier.com/fr/vins/cuvee-l-rouge
  ('Domaine Combier', 'Crozes-Hermitage Cuvée L Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.domaine-combier.com/fr/vins/cuvee-l-blanc
  ('Domaine Combier', 'Collines Rhodaniennes Syrah', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.domaine-combier.com/fr/vins/igp-syrah
  ('Domaine Combier', 'Hermitage Rouge', 'Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.domaine-combier.com/fr/vins/hermitage-rouge
  ('Domaine Combier', 'Hermitage Blanc', 'Hermitage, Rhône Valley, France', 'Marsanne', 'White')  -- https://www.domaine-combier.com/fr/vins/hermitage-blanc
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE YANN CHAVE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Yann Chave', 'Crozes-Hermitage Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.yannchave.com/vins/crozes-hermitage-blanc-2025
  ('Domaine Yann Chave', 'Crozes-Hermitage Rouge', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.yannchave.com/vins/crozes-hermitage-rouge-2024
  ('Domaine Yann Chave', 'Crozes-Hermitage Le Rouvre', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.yannchave.com/vins/le-rouvre-2024
  ('Domaine Yann Chave', 'Saint-Joseph Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.yannchave.com/vins/saint-joseph-rouge-2024
  ('Domaine Yann Chave', 'Hermitage Rouge', 'Hermitage, Rhône Valley, France', 'Syrah', 'Red')  -- https://www.yannchave.com/vins/hermitage-rouge-2024
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- THIERRY ALLEMAND ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Thierry Allemand', 'Cornas Reynard', 'Cornas, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Thierry%20Allemand
  ('Thierry Allemand', 'Cornas Chaillot', 'Cornas, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Thierry%20Allemand
  ('Thierry Allemand', 'Cornas Cuvée Sans Soufre', 'Cornas, Rhône Valley, France', null, 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Thierry%20Allemand
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BELLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Belle', 'Hermitage Blanc', 'Hermitage, Rhône Valley, France', null, 'White'),  -- https://www.domainebelle.com/produits/vins-blancs/
  ('Domaine Belle', 'Crozes-Hermitage Roche Blanche', 'Crozes-Hermitage, Rhône Valley, France', null, 'White'),  -- https://www.domainebelle.com/produits/vins-blancs/
  ('Domaine Belle', 'Crozes-Hermitage Les Terres Blanches', 'Crozes-Hermitage, Rhône Valley, France', null, 'White'),  -- https://www.domainebelle.com/produits/vins-blancs/
  ('Domaine Belle', 'Saint-Joseph Les Rivoires', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.domainebelle.com/produits/vins-rouges/
  ('Domaine Belle', 'Hermitage Rouge', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.domainebelle.com/produits/vins-rouges/
  ('Domaine Belle', 'Crozes-Hermitage Roche Pierre', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.domainebelle.com/produits/vins-rouges/
  ('Domaine Belle', 'Crozes-Hermitage Les Pierrelles', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.domainebelle.com/produits/vins-rouges/
  ('Domaine Belle', 'Crozes-Hermitage Cuvée Louis Belle', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red')  -- https://www.domainebelle.com/produits/vins-rouges/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DU MONTEILLET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine du Monteillet', 'Condrieu Chanson', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.montez.fr/condrieu-chanson-2023-75
  ('Domaine du Monteillet', 'Condrieu Les Grandes Chaillées', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.montez.fr/fr-condrieu-les-grandes-chaillees
  ('Domaine du Monteillet', 'Condrieu La Grillette', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.montez.fr/verticale-de-3-condrieu-la-grillette-2021-2022-2023-75-cl-fr
  ('Domaine du Monteillet', 'Condrieu Doux Candice', 'Condrieu, Rhône Valley, France', 'Viognier', 'Sweet'),  -- https://www.montez.fr/fr-condrieu-doux-candice-75-cl
  ('Domaine du Monteillet', 'Saint-Joseph Blanc', 'Saint-Joseph, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.montez.fr/fr-st-joseph-blanc
  ('Domaine du Monteillet', 'Saint-Joseph Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.montez.fr/saint-joseph-rouge
  ('Domaine du Monteillet', 'Saint-Joseph Rouge Cuvée du Papy', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.montez.fr/st-joseph-rouge-cuvee-du-papy-2024
  ('Domaine du Monteillet', 'Côte-Rôtie Bons Arrêts', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.montez.fr/cote-rotie-bons-arrets-2024-75-cl-fr
  ('Domaine du Monteillet', 'Côte-Rôtie Fortis', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.montez.fr/cote-rotie-fortis
  ('Domaine du Monteillet', 'Côte-Rôtie Les Grandes Places', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.montez.fr/cote-rotie-les-grandes-places
  ('Domaine du Monteillet', 'Cornas', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.montez.fr/fr-cornas
  ('Domaine du Monteillet', 'Saint-Péray Clarençon', 'Saint-Péray, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.montez.fr/saint-peray-clarencon
  ('Domaine du Monteillet', 'Les Hauts du Monteillet Blanc', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier, Marsanne, Clairette', 'White'),  -- https://www.montez.fr/les-hauts-du-monteillet-blanc-2025
  ('Domaine du Monteillet', 'Les Hauts du Monteillet Rouge', 'Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.montez.fr/les-hauts-du-monteillet-rouge
  ('Domaine du Monteillet', 'Le Petit Viognier', 'Rhône Valley, France', 'Viognier', 'White'),  -- https://www.montez.fr/le-petit-viognier-2025
  ('Domaine du Monteillet', 'La Syrah à Papa', 'Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.montez.fr/la-syrah-a-papa
  ('Domaine du Monteillet', 'Le Blanc d''en Face', 'Rhône Valley, France', 'Viognier, Marsanne, Clairette', 'White'),  -- https://www.montez.fr/le-blanc-d-en-face
  ('Domaine du Monteillet', 'Rosé La Vigne en Rose', 'Rhône Valley, France', 'Syrah', 'Rosé')  -- https://www.montez.fr/rose-la-vigne-en-rose
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FAURY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Faury', 'Saint-Joseph La Gloriette', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://lavinothequelaroche.com/en/red-wines/2885-lionel-faury-saint-joseph-la-gloriette-2023.html
  ('Domaine Faury', 'Saint-Joseph Hedonism', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://lavinothequelaroche.com/en/red-wines/1321-domaine-faury-saint-joseph-hedonism-2016.html
  ('Domaine Faury', 'Saint-Joseph Blanc Les Ribaudes', 'Saint-Joseph, Rhône Valley, France', null, 'White'),  -- https://lavinothequelaroche.com/en/white-wines/3832-lionel-faury-saint-joseph-white-les-ribaudes-2024.html
  ('Domaine Faury', 'Côte-Rôtie Reviniscence', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://lavinothequelaroche.com/en/red-wines/1323-domaine-faury-côte-rôtie-reviniscence-2019.html
  ('Domaine Faury', 'Côte-Rôtie Les 3 Brunes', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://lavinothequelaroche.com/en/red-wines/3834-lionel-faury-côte-rôtie-les-3-brunes-2023.html
  ('Domaine Faury', 'Condrieu Le Mornieux', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://lavinothequelaroche.com/en/white-wines/1296-domaine-faury-condrieu-le-mornieux-2023.html
  ('Domaine Faury', 'Condrieu Vieilles Vignes La Berne', 'Condrieu, Rhône Valley, France', null, 'White')  -- https://lavinothequelaroche.com/en/white-wines/3833-lionel-faury-condrieu-vieilles-vignes-la-berne-2024.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PIERRE-JEAN VILLA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Pierre-Jean Villa', 'Côte-Rôtie Fongeant', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.pierre-jean-villa.com/Côte-Rôtie-Fongeant.html
  ('Domaine Pierre-Jean Villa', 'Côte-Rôtie Carmina', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.pierre-jean-villa.com/Côte-Rôtie-Carmina.html
  ('Domaine Pierre-Jean Villa', 'Collines Rhodaniennes Esprit d''Antan Syrah', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.pierre-jean-villa.com/Col-Rh-Esprit-dantan-syrah.html
  ('Domaine Pierre-Jean Villa', 'Saint-Joseph Préface', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.pierre-jean-villa.com/Saint-Joseph-Preface.html
  ('Domaine Pierre-Jean Villa', 'Saint-Joseph Tilde', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.pierre-jean-villa.com/Saint-Joseph-Tilde.html
  ('Domaine Pierre-Jean Villa', 'Crozes-Hermitage Accroche-Cœur', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.pierre-jean-villa.com/Crozes-Accroche-cœur.html
  ('Domaine Pierre-Jean Villa', 'Gamine Syrah', 'Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.pierre-jean-villa.com/Gamine-syrah.html
  ('Domaine Pierre-Jean Villa', 'Condrieu Jardin Suspendu', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.pierre-jean-villa.com/Condrieu-Jardin-suspendu.html
  ('Domaine Pierre-Jean Villa', 'Saint-Joseph Saut de l''Ange', 'Saint-Joseph, Rhône Valley, France', 'Roussanne', 'White'),  -- https://www.pierre-jean-villa.com/Saint-Joseph-Saut-de-lange.html
  ('Domaine Pierre-Jean Villa', 'Collines Rhodaniennes Esprit d''Antan Viognier', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.pierre-jean-villa.com/Col-Rh-Esprit-dantan-viognier.html
  ('Domaine Pierre-Jean Villa', 'Collines Rhodaniennes Primavera Viognier', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'White')  -- https://www.pierre-jean-villa.com/Col-Rh-Primavera-viognier.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN-MICHEL GERIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Jean-Michel Gerin', 'Côte-Rôtie Champin le Seigneur', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.comptoirdesmillesimes.com/en/jean-michel-gerin/cote-rotie-2023-champin-le-seigneur-jean-michel-gerin.html
  ('Domaine Jean-Michel Gerin', 'Côte-Rôtie Les Grandes Places', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.comptoirdesmillesimes.com/en/jean-michel-gerin/cote-rotie-2021-les-grandes-places-jean-michel-gerin.html
  ('Domaine Jean-Michel Gerin', 'Côte-Rôtie La Landonne', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.comptoirdesmillesimes.com/en/jean-michel-gerin/cote-rotie-2023-la-landonne-jean-michel-gerin.html
  ('Domaine Jean-Michel Gerin', 'Côte-Rôtie La Viallière', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.comptoirdesmillesimes.com/en/jean-michel-gerin/cote-rotie-2022-la-vialliere-jean-michel-gerin.html
  ('Domaine Jean-Michel Gerin', 'Côte-Rôtie Côte Bodin', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.comptoirdesmillesimes.com/en/jean-michel-gerin/cote-rotie-cote-bodin-2023-jean-michel-gerin.html
  ('Domaine Jean-Michel Gerin', 'Condrieu Les Eguets', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.comptoirdesmillesimes.com/en/jean-michel-gerin/condrieu-2023-les-eguets-jean-michel-gerin.html
  ('Domaine Jean-Michel Gerin', 'Condrieu La Loye', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.comptoirdesmillesimes.com/blog/en/domaine-gerin-wine-guide/
  ('Domaine Jean-Michel Gerin', 'Collines Rhodaniennes La Champine Viognier', 'Collines Rhodaniennes, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.ruedesvignerons.com/fr/domaine/342/domaine-jean-michel-gerin
  ('Domaine Jean-Michel Gerin', 'Collines Rhodaniennes La Champine Syrah', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red')  -- https://www.ruedesvignerons.com/fr/domaine/342/domaine-jean-michel-gerin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FERRATON PÈRE ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Ferraton Père et Fils', 'Crozes-Hermitage Calendes', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.millesima-usa.com/ferraton-pere-fils-calendes-2023.html
  ('Ferraton Père et Fils', 'Crozes-Hermitage La Matinière Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.millesima-usa.com/ferraton-pere-fils-la-martiniere-2022.html
  ('Ferraton Père et Fils', 'Crozes-Hermitage Le Grand Courtil', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.millesima-usa.com/ferraton-pere-fils-le-grand-courtil-2020.html
  ('Ferraton Père et Fils', 'Saint-Joseph Les Oliviers Blanc', 'Saint-Joseph, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.millesima-usa.com/ferraton-pere-fils-les-oliviers-2016.html
  ('Ferraton Père et Fils', 'Saint-Joseph Lieu-dit Paradis', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.millesima-usa.com/ferraton-pere-fils-lieu-dit-paradis-2020.html
  ('Ferraton Père et Fils', 'Côte-Rôtie Lieu-dit Montmain', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.millesima-usa.com/ferraton-pere-fils-lieu-dit-montmain-2020.html
  ('Ferraton Père et Fils', 'Côte-Rôtie L''Eglantine', 'Côte-Rôtie, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.millesima-usa.com/ferraton-pere-fils-l-eglantine-2020-1.html
  ('Ferraton Père et Fils', 'Ermitage Le Méal', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://www.millesima-usa.com/ferraton-pere-fils-le-meal-2017.html
  ('Ferraton Père et Fils', 'Ermitage Les Dionnières', 'Hermitage, Rhône Valley, France', null, 'Red')  -- https://www.millesima-usa.com/ferraton-pere-fils-les-dionnieres-2020.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VIDAL-FLEURY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Vidal-Fleury', 'Côte-Rôtie La Chatillonne', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.vidal-fleury.com/cote-rotie/2018
  ('Vidal-Fleury', 'Côte-Rôtie Brune & Blonde', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.vidal-fleury.com/cote-rotie-brune-blonde/2021
  ('Vidal-Fleury', 'Condrieu', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.vidal-fleury.com/condrieu/2023
  ('Vidal-Fleury', 'Hermitage Rouge', 'Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.vidal-fleury.com/hermitage-rouge/2023
  ('Vidal-Fleury', 'Cornas', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.vidal-fleury.com/cornas/2022
  ('Vidal-Fleury', 'Crozes-Hermitage Rouge', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.vidal-fleury.com/crozes-hermitage-rouge/2023
  ('Vidal-Fleury', 'Crozes-Hermitage Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.vidal-fleury.com/crozes-hermitage-blanc/2023
  ('Vidal-Fleury', 'Saint-Joseph Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.vidal-fleury.com/saint-joseph-rouge/2022
  ('Vidal-Fleury', 'Saint-Joseph Blanc', 'Saint-Joseph, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.vidal-fleury.com/saint-joseph-blanc/2024
  ('Vidal-Fleury', 'Saint-Péray', 'Saint-Péray, Rhône Valley, France', 'Marsanne', 'White'),  -- https://www.vidal-fleury.com/saint-peray/2024
  ('Vidal-Fleury', 'L''Aulin Syrah', 'Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.vidal-fleury.com/laulin-syrah/2025
  ('Vidal-Fleury', 'L''Aulin Viognier', 'Rhône Valley, France', 'Viognier', 'White'),  -- https://www.vidal-fleury.com/laulin-viognier/2025
  ('Vidal-Fleury', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.vidal-fleury.com/chateauneuf-du-pape-rouge/2022
  ('Vidal-Fleury', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Blanc, Clairette, Roussanne', 'White'),  -- https://www.vidal-fleury.com/chateauneuf-du-pape-blanc/2022
  ('Vidal-Fleury', 'Gigondas Rouge', 'Gigondas, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.vidal-fleury.com/gigondas-rouge/2022
  ('Vidal-Fleury', 'Vacqueyras Rouge', 'Vacqueyras, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.vidal-fleury.com/vacqueyras-rouge/2024
  ('Vidal-Fleury', 'Cairanne Rouge', 'Cairanne, Rhône Valley, France', 'Grenache Noir, Mourvèdre, Syrah', 'Red'),  -- https://www.vidal-fleury.com/cairanne-rouge/2023
  ('Vidal-Fleury', 'Tavel', 'Tavel, Rhône Valley, France', 'Grenache Noir, Cinsault, Mourvèdre, Clairette', 'Rosé'),  -- https://www.vidal-fleury.com/tavel/2023
  ('Vidal-Fleury', 'Muscat de Beaumes-de-Venise', 'Muscat de Beaumes-de-Venise, Rhône Valley, France', 'Muscat à Petit Grain', 'Fortified'),  -- https://www.vidal-fleury.com/muscat-de-beaumes-de-venise/2023
  ('Vidal-Fleury', 'Côtes du Rhône Villages Rouge', 'Côtes du Rhône Villages, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre, Carignan', 'Red'),  -- https://www.vidal-fleury.com/cotes-du-rhone-villages-rouge/2022
  ('Vidal-Fleury', 'Côtes du Rhône Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.vidal-fleury.com/cotes-du-rhone-rouge/2022
  ('Vidal-Fleury', 'Côtes du Rhône Rouge Bio', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Noir, Syrah', 'Red'),  -- https://www.vidal-fleury.com/cotes-du-rhone-rouge-bio/2023
  ('Vidal-Fleury', 'Côtes du Rhône Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Blanc, Clairette, Viognier, Roussanne', 'White'),  -- https://www.vidal-fleury.com/cotes-du-rhone-blanc/2024
  ('Vidal-Fleury', 'Côtes du Rhône Rosé', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Noir, Syrah', 'Rosé'),  -- https://www.vidal-fleury.com/cotes-du-rhone-rose/2025
  ('Vidal-Fleury', 'Vin de France Grenache-Syrah-Mourvèdre Rouge', 'Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red')  -- https://www.vidal-fleury.com/vin-de-france-grenache-syrah-mourvedre-rouge/2022
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GONON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Gonon', 'Saint-Joseph Rouge', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://www.rarewineco.com/producer/gonon/
  ('Domaine Gonon', 'Saint-Joseph Blanc Les Oliviers', 'Saint-Joseph, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://www.rarewineco.com/producer/gonon/
  ('Domaine Gonon', 'Ardèche Les Îles Feray', 'Ardèche, Rhône Valley, France', 'Syrah', 'Red')  -- https://www.rarewineco.com/producer/gonon/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE COURBIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Courbis', 'Cornas Champelrose', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.decanter.com/wine-reviews/france/rhone/domaine-courbis-champelrose-cornas-rhone-france-2024-102834/
  ('Domaine Courbis', 'Cornas La Sabarotte', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.decanter.com/wine-reviews/france/rhone/domaine-courbis-la-sabarotte-cornas-rhone-france-2020-100584/
  ('Domaine Courbis', 'Cornas Les Eygats', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.decanter.com/wine-reviews/france/rhone/domaine-courbis-les-eygats-cornas-rhone-france-2018-51288/
  ('Domaine Courbis', 'Saint-Joseph Les Royes Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.decanter.com/wine-reviews/france/rhone/domaine-courbis-les-royes-st-joseph-rhone-france-2022-94513/
  ('Domaine Courbis', 'Saint-Joseph Rouge', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://www.decanter.com/wine-reviews/france/rhone/domaine-courbis-st-joseph-rhone-france-2022-94512
  ('Domaine Courbis', 'Saint-Joseph Les Royes Blanc', 'Saint-Joseph, Rhône Valley, France', 'Marsanne', 'White'),  -- https://idealwine.com/en/buy-a-wine/2429212-1-bottle-Saint-Joseph-Les-Royes-Courbis-2022-White
  ('Domaine Courbis', 'Saint-Péray Le Tram', 'Saint-Péray, Rhône Valley, France', 'Marsanne', 'White')  -- https://www.decanter.com/wine-reviews/france/rhone/domaine-courbis-le-tram-st-peray-rhone-france-2021-70928/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JEAN-LUC COLOMBO ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Jean-Luc Colombo', 'Cornas Terres Brûlées', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vinscolombo.fr/produit/terres-brulees-2023-2/
  ('Jean-Luc Colombo', 'Cornas La Louvée', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vinscolombo.fr/produit/la-louvee-2019/
  ('Jean-Luc Colombo', 'Cornas Les Ruchets', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vinscolombo.fr/produit/les-ruchets-2019/
  ('Jean-Luc Colombo', 'Cornas Vallon de l''Aigle', 'Cornas, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vinscolombo.fr/produit/vallon-de-l-aigle-2018/
  ('Jean-Luc Colombo', 'Côte-Rôtie La Divine', 'Côte-Rôtie, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://vinscolombo.fr/produit/la-divine-2024/
  ('Jean-Luc Colombo', 'Hermitage Le Rouet Rouge', 'Hermitage, Rhône Valley, France', 'Syrah, Roussanne', 'Red'),  -- https://vinscolombo.fr/produit/le-rouet-2022/
  ('Jean-Luc Colombo', 'Crozes-Hermitage Les Fées Brunes', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vinscolombo.fr/produit/les-fees-brunes-2022/
  ('Jean-Luc Colombo', 'Saint-Joseph Les Lauves', 'Saint-Joseph, Rhône Valley, France', 'Syrah', 'Red'),  -- https://vinscolombo.fr/produit/les-lauves-2025/
  ('Jean-Luc Colombo', 'Condrieu Amour de Dieu', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://vinscolombo.fr/produit/amour-de-dieu-2023/
  ('Jean-Luc Colombo', 'Saint-Péray La Belle de Mai', 'Saint-Péray, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://vinscolombo.fr/produit/la-belle-de-mai/
  ('Jean-Luc Colombo', 'Côtes du Rhône La Redonne', 'Côtes du Rhône, Rhône Valley, France', 'Viognier, Roussanne', 'White'),  -- https://vinscolombo.fr/produit/la-redonne/
  ('Jean-Luc Colombo', 'Côtes du Rhône Les Abeilles Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Clairette, Roussanne', 'White'),  -- https://vinscolombo.fr/produit/les-abeilles-blanc/
  ('Jean-Luc Colombo', 'Côtes du Rhône Les Abeilles Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://vinscolombo.fr/produit/les-abeilles-rouge/
  ('Jean-Luc Colombo', 'Côtes du Rhône Les Forots', 'Côtes du Rhône, Rhône Valley, France', 'Syrah, Grenache', 'Red'),  -- https://vinscolombo.fr/produit/les-forots-2023/
  ('Jean-Luc Colombo', 'Cairanne Le Pavillon des Courtisanes', 'Cairanne, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://vinscolombo.fr/produit/cairanne-pavillon-des-courtisanes/
  ('Jean-Luc Colombo', 'Châteauneuf-du-Pape Les Bartavelles', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Syrah, Grenache, Mourvèdre', 'Red')  -- https://vinscolombo.fr/produit/les-bartavelles-2023/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE BEAUCASTEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château de Beaucastel', 'Côtes du Rhône Coudoulet de Beaucastel Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.beaucastel.com/en/pages/les-vins-de-beaucastel
  ('Château de Beaucastel', 'Côtes du Rhône Coudoulet de Beaucastel Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://www.beaucastel.com/en/pages/les-vins-de-beaucastel
  ('Château de Beaucastel', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.beaucastel.com/en/pages/les-vins-de-beaucastel
  ('Château de Beaucastel', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White'),  -- https://www.beaucastel.com/en/pages/les-vins-de-beaucastel
  ('Château de Beaucastel', 'Châteauneuf-du-Pape Roussanne Vieilles Vignes', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Roussanne', 'White'),  -- https://www.beaucastel.com/en/pages/les-vins-de-beaucastel
  ('Château de Beaucastel', 'Châteauneuf-du-Pape Hommage à Jacques Perrin', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red')  -- https://www.beaucastel.com/en/pages/les-vins-de-beaucastel
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU RAYAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château Rayas', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.chateaurayas.fr/vinsrayas.php
  ('Château Rayas', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Clairette', 'White'),  -- https://www.chateaurayas.fr/vinsrayas.php
  ('Château Rayas', 'Châteauneuf-du-Pape Pignan', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.chateaurayas.fr/vinspignan.php
  ('Château Rayas', 'Côtes du Rhône Pialade', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Cinsault, Syrah', 'Red')  -- https://www.chateaurayas.fr/vinspialade.php
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE FONSALETTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château de Fonsalette', 'Côtes du Rhône Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Cinsault, Syrah', 'Red'),  -- https://www.chateaurayas.fr/vinsfonsalette.php
  ('Château de Fonsalette', 'Côtes du Rhône Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Clairette, Marsanne', 'White')  -- https://www.chateaurayas.fr/vinsfonsalette.php
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DES TOURS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château des Tours', 'Vacqueyras Rouge', 'Vacqueyras, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.chateaurayas.fr/vinsdestours.php
  ('Château des Tours', 'Côtes du Rhône Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Cinsault, Syrah', 'Red'),  -- https://www.chateaurayas.fr/vinsdestours.php
  ('Château des Tours', 'Côtes du Rhône Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Grenache', 'White'),  -- https://www.chateaurayas.fr/vinsdestours.php
  ('Château des Tours', 'Vaucluse Domaine des Tours Rouge', 'Vaucluse, Rhône Valley, France', 'Grenache, Counoise, Syrah, Cinsault, Merlot', 'Red'),  -- https://www.chateaurayas.fr/vinsdomdestours.php
  ('Château des Tours', 'Vaucluse Domaine des Tours Blanc', 'Vaucluse, Rhône Valley, France', 'Clairette', 'White'),  -- https://www.chateaurayas.fr/vinsdomdestours.php
  ('Château des Tours', 'Parisy Rosé', 'Rhône Valley, France', 'Grenache, Cinsault', 'Rosé')  -- https://www.chateaurayas.fr/vinsparisy.php
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DU VIEUX TÉLÉGRAPHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine du Vieux Télégraphe', 'Châteauneuf-du-Pape La Crau Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah, Cinsault, Clairette', 'Red'),  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2023/11/fiche_technique_vt_rouge_site_vieux_telegraphe_nov_2023.pdf
  ('Domaine du Vieux Télégraphe', 'Châteauneuf-du-Pape La Crau Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Clairette, Grenache Blanc, Roussanne, Bourboulenc', 'White'),  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2023/11/fiche_technique_vt_blanc_site_vieux_telegraphe_nov_2023.pdf
  ('Domaine du Vieux Télégraphe', 'Châteauneuf-du-Pape Télégramme', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Cinsault', 'Red'),  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2023/11/fiche_technique_telegramme_site_vieux_telegraphe_nov_2023.pdf
  ('Domaine du Vieux Télégraphe', 'Châteauneuf-du-Pape Piedlong', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre', 'Red'),  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2023/11/fiche_technique_piedlong_site_vieux_telegraphe_nov_2023.pdf
  ('Domaine du Vieux Télégraphe', 'Châteauneuf-du-Pape Clos Roquète Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Roussanne, Clairette, Grenache Blanc', 'White'),  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2023/11/fiche_technique_clos_roquete_site_vieux_telegraphe_nov_2023.pdf
  ('Domaine du Vieux Télégraphe', 'Ventoux Mégaphone', 'Ventoux, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2024/04/fiche_technique_megaphone_site_vieux_telegraphe_2024.pdf
  ('Domaine du Vieux Télégraphe', 'Vaucluse Pigeoulet Rouge', 'Vaucluse, Rhône Valley, France', 'Grenache, Syrah, Carignan, Cinsault, Mourvèdre', 'Red'),  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2024/04/fiche_technique_pigeoulet_rouge_site_vieux_telegraphe_2024.pdf
  ('Domaine du Vieux Télégraphe', 'Vaucluse Pigeoulet Blanc', 'Vaucluse, Rhône Valley, France', 'Roussanne, Grenache Blanc, Clairette', 'White')  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2023/11/fiche_technique_pigeoulet_blanc_site_vieux_telegraphe_nov_2023.pdf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LES PALLIÈRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Les Pallières', 'Gigondas Les Racines', 'Gigondas, Rhône Valley, France', 'Grenache, Syrah, Cinsault, Clairette', 'Red'),  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2023/11/fiche_technique_pallieres_racines_site_vieux_telegraphe_nov_2023.pdf
  ('Domaine Les Pallières', 'Gigondas Terrasse du Diable', 'Gigondas, Rhône Valley, France', 'Grenache, Mourvèdre, Clairette', 'Red')  -- https://www.vieux-telegraphe.fr/wp-content/uploads/2023/11/fiche_technique_pallieres_terrasse_site_vieux_telegraphe_nov_2023.pdf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DES PAPES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Clos des Papes', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah, Counoise, Vaccarèse, Muscardin, Cinsault', 'Red'),  -- https://www.closdespapes.com/clos-des-papes-rouge/
  ('Clos des Papes', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Blanc, Roussanne, Clairette, Picpoul, Bourboulenc, Picardan', 'White'),  -- https://www.closdespapes.com/clos-des-papes-blanc/
  ('Clos des Papes', 'Vin de France Le Petit Vin d''Avril Rouge', 'Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Caladoc, Marselan, Merlot, Cinsault', 'Red'),  -- https://www.closdespapes.com/petit-vin-davril-rouge/
  ('Clos des Papes', 'Vin de France Le Petit Vin d''Avril Blanc', 'Rhône Valley, France', 'Marsanne, Bourboulenc, Picpoul, Clairette', 'White')  -- https://www.closdespapes.com/petit-vin-davril-blanc/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA JANASSE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine de la Janasse', 'Châteauneuf-du-Pape Tradition Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Blanc, Clairette, Roussanne', 'White'),  -- https://www.lajanasse.com/chateauneuf-du-pape-2/
  ('Domaine de la Janasse', 'Châteauneuf-du-Pape Prestige Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White'),  -- https://www.lajanasse.com/chateauneuf-du-pape-2/
  ('Domaine de la Janasse', 'Châteauneuf-du-Pape Tradition Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.lajanasse.com/chateauneuf-du-pape-2/
  ('Domaine de la Janasse', 'Châteauneuf-du-Pape Chaupin', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.lajanasse.com/chateauneuf-du-pape-2/
  ('Domaine de la Janasse', 'Châteauneuf-du-Pape Vieilles Vignes', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.lajanasse.com/chateauneuf-du-pape-2/
  ('Domaine de la Janasse', 'Côtes du Rhône Tradition Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://www.lajanasse.com/cotes-du-rhone-2/
  ('Domaine de la Janasse', 'Côtes du Rhône Rosé', 'Côtes du Rhône, Rhône Valley, France', null, 'Rosé'),  -- https://www.lajanasse.com/cotes-du-rhone-2/
  ('Domaine de la Janasse', 'Côtes du Rhône Tradition Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.lajanasse.com/cotes-du-rhone-2/
  ('Domaine de la Janasse', 'Côtes du Rhône Les Garrigues', 'Côtes du Rhône, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.lajanasse.com/cotes-du-rhone-2/
  ('Domaine de la Janasse', 'Côtes du Rhône Villages Terre d''Argile', 'Côtes du Rhône Villages, Rhône Valley, France', null, 'Red'),  -- https://www.lajanasse.com/cotes-du-rhone-2/
  ('Domaine de la Janasse', 'Principauté d''Orange Viognier', 'Principauté d''Orange, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.lajanasse.com/igp-2/
  ('Domaine de la Janasse', 'Méditerranée Rosé', 'Rhône Valley, France', null, 'Rosé'),  -- https://www.lajanasse.com/igp-2/
  ('Domaine de la Janasse', 'Principauté d''Orange Terre de Bussière', 'Principauté d''Orange, Rhône Valley, France', null, 'Red')  -- https://www.lajanasse.com/igp-2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PEGAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Pegau', 'Châteauneuf-du-Pape Cuvée Réservée Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Clairette, Grenache Blanc, Bourboulenc, Roussanne', 'White'),  -- https://pegau.com/vin/cuvee-reservee-blanc-chateauneuf-du-pape/
  ('Domaine Pegau', 'Châteauneuf-du-Pape Cuvée A Tempo Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Clairette, Roussanne, Grenache Blanc', 'White'),  -- https://pegau.com/vin/cuvee-a-tempo-blanc/
  ('Domaine Pegau', 'Châteauneuf-du-Pape Cuvée Réservée Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://pegau.com/vin/cuvee-reservee-rouge/
  ('Domaine Pegau', 'Châteauneuf-du-Pape Cuvée Da Capo', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://pegau.com/vin/cuvee-da-capo/
  ('Domaine Pegau', 'Châteauneuf-du-Pape Cuvée Laurence', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://pegau.com/vin/cuvee-laurence-rouge/
  ('Domaine Pegau', 'Châteauneuf-du-Pape Cuvée Ella', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://bestofwines.com/fr/vin/producteur-de-vin/domaine-du-pegau/chateauneuf-du-pape-cuvee-ella-2020.htm
  ('Domaine Pegau', 'Châteauneuf-du-Pape Cuvée Inspiration', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red')  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/domaine-du-pegau
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PÉGAÜ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château Pégaü', 'Côtes du Rhône Cuvée Lône Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Clairette, Bourboulenc, Grenache Blanc, Ugni Blanc', 'White'),  -- https://pegau.com/vin/cotes-du-rhone-cuvee-lone/
  ('Château Pégaü', 'Côtes du Rhône Cuvée Maclura', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Cinsault', 'Red'),  -- https://pegau.com/vin/cotes-du-rhone-cuvee-maclura/
  ('Château Pégaü', 'Côtes du Rhône Villages Cuvée Sétier', 'Côtes du Rhône Villages, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://pegau.com/vin/cotes-du-rhone-villages-cuvee-setier/
  ('Château Pégaü', 'Vin de France Pink Pegau', 'Rhône Valley, France', 'Cinsault', 'Rosé'),  -- https://pegau.com/vin/pink-pegau-rose-vin-de-france/
  ('Château Pégaü', 'Vin de France Plan Pegau', 'Rhône Valley, France', 'Grenache, Syrah, Merlot', 'Red'),  -- https://pegau.com/vin/plan-pegau-vin-de-france/
  ('Château Pégaü', 'Vin de France Pegovino', 'Rhône Valley, France', 'Grenache, Carignan, Syrah, Caladoc', 'Red'),  -- https://pegau.com/vin/pegovino-vin-de-france/
  ('Château Pégaü', 'Vin de France Vin Blanc Doux', 'Rhône Valley, France', 'Clairette, Roussanne, Bourboulenc, Grenache Blanc, Picpoul', 'Sweet')  -- https://pegau.com/vin/vin-blanc-doux-vin-de-france/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MONT-REDON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château Mont-Redon', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.chateaumontredon.com/nos-vins/
  ('Château Mont-Redon', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White'),  -- https://www.chateaumontredon.com/nos-vins/
  ('Château Mont-Redon', 'Châteauneuf-du-Pape Le Plateau de Mont-Redon Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.chateaumontredon.com/nos-vins/
  ('Château Mont-Redon', 'Châteauneuf-du-Pape Le Plateau Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White'),  -- https://www.chateaumontredon.com/nos-vins/
  ('Château Mont-Redon', 'Lirac Rouge', 'Lirac, Rhône Valley, France', null, 'Red'),  -- https://www.chateaumontredon.com/nos-vins/
  ('Château Mont-Redon', 'Lirac Blanc', 'Lirac, Rhône Valley, France', null, 'White'),  -- https://www.chateaumontredon.com/nos-vins/
  ('Château Mont-Redon', 'Côtes du Rhône du Château Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.chateaumontredon.com/nos-vins/
  ('Château Mont-Redon', 'Côtes du Rhône du Château Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://www.chateaumontredon.com/nos-vins/
  ('Château Mont-Redon', 'Côtes du Rhône Le Viognier du Château', 'Côtes du Rhône, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.chateaumontredon.com/wp-content/uploads/sites/3/2023/11/FT-P-CDR-BL-VIO-FR.pdf
  ('Château Mont-Redon', 'Côtes du Rhône Réserve Mont-Redon Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.reservemontredon.fr/
  ('Château Mont-Redon', 'Côtes du Rhône Réserve Mont-Redon Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://www.reservemontredon.fr/
  ('Château Mont-Redon', 'Côtes du Rhône Réserve Mont-Redon Rosé', 'Côtes du Rhône, Rhône Valley, France', null, 'Rosé'),  -- https://www.reservemontredon.fr/
  ('Château Mont-Redon', 'Gigondas Réserve Mont-Redon', 'Gigondas, Rhône Valley, France', null, 'Red')  -- https://www.reservemontredon.fr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HENRI BONNEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Henri Bonneau', 'Châteauneuf-du-Pape Réserve des Célestins', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/2454813-1-bottle-Chateauneuf-du-Pape-Reserve-des-Celestins-Henri-Bonneau-Fils-2019-Red
  ('Domaine Henri Bonneau', 'Châteauneuf-du-Pape Cuvée Marie Beurrier', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red')  -- https://idealwine.com/en/buy-a-wine/2379475-1-bottle-Chateauneuf-du-Pape-Marie-Beurrier-Henri-Bonneau-Fils-2001-Red
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA CHARBONNIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine de la Charbonnière', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Blanc, Clairette, Roussanne', 'White'),  -- https://www.domainedelacharbonniere.com/aop-chateauneuf-du-pape-blanc
  ('Domaine de la Charbonnière', 'Châteauneuf-du-Pape Les Hautes Brusquières', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.domainedelacharbonniere.com/aop-chateauneuf-du-pape-cuvee-les-hautes-brusquieres
  ('Domaine de la Charbonnière', 'Châteauneuf-du-Pape Cuvée Domaine', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.domainedelacharbonniere.com/aop-chateauneuf-du-pape-domaine
  ('Domaine de la Charbonnière', 'Châteauneuf-du-Pape Vieilles Vignes', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre', 'Red'),  -- https://www.domainedelacharbonniere.com/aop-chateauneuf-du-pape-vieilles-vignes
  ('Domaine de la Charbonnière', 'Châteauneuf-du-Pape Mourre des Perdrix', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Cinsault', 'Red'),  -- https://www.domainedelacharbonniere.com/vin-1
  ('Domaine de la Charbonnière', 'Côtes du Rhône Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.domainedelacharbonniere.com/aop-cotes-du-rhone-rouge
  ('Domaine de la Charbonnière', 'Vacqueyras', 'Vacqueyras, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.domainedelacharbonniere.com/aop-vacqueyras
  ('Domaine de la Charbonnière', 'Vacqueyras Cuvée Spéciale', 'Vacqueyras, Rhône Valley, France', 'Grenache, Syrah', 'Red')  -- https://www.domainedelacharbonniere.com/aop-vacqueyras-rouge-cuvee-speciale
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FORTIA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château Fortia', 'Châteauneuf-du-Pape Edmée le Roy Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Roussanne, Clairette, Grenache Blanc', 'White'),  -- https://chateau-fortia.com/fr/edmee-le-roy
  ('Château Fortia', 'Châteauneuf-du-Pape Secret du Temps Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Roussanne, Grenache Blanc', 'White'),  -- https://chateau-fortia.com/fr/secret-du-temps
  ('Château Fortia', 'Châteauneuf-du-Pape Tradition', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://chateau-fortia.com/fr/cuvee-tradition
  ('Château Fortia', 'Châteauneuf-du-Pape Cuvée du Baron', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://chateau-fortia.com/fr/cuvee-du-baron
  ('Château Fortia', 'Châteauneuf-du-Pape Réserve', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Syrah, Mourvèdre', 'Red'),  -- https://chateau-fortia.com/fr/la-reserve
  ('Château Fortia', 'Châteauneuf-du-Pape Secret des Terres', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red')  -- https://chateau-fortia.com/fr/secret-des-terres
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LE VIEUX DONJON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Le Vieux Donjon', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Cinsault', 'Red'),  -- https://www.skurnik.com/sku/chateauneuf-du-pape-le-vieux-donjon/
  ('Le Vieux Donjon', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White')  -- https://www.idealwine.net/domaine-du-vieux-donjon-un-grand-chateauneuf-mais-rare-sur-le-marche
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA NERTHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château la Nerthe', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Cinsault', 'Red'),  -- https://www.domainesrichard.fr/chateau-la-nerthe/vin/chateau-la-nerthe-2023-2/
  ('Château la Nerthe', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Blanc, Roussanne, Clairette, Bourboulenc', 'White'),  -- https://www.domainesrichard.fr/chateau-la-nerthe/vin/chateau-la-nerthe-2025/
  ('Château la Nerthe', 'Châteauneuf-du-Pape Clos de Beauvenir Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Roussanne, Grenache Blanc', 'White'),  -- https://www.domainesrichard.fr/chateau-la-nerthe/vin/clos-de-beauvenir-2025/
  ('Château la Nerthe', 'Châteauneuf-du-Pape Cuvée des Cadettes', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.domainesrichard.fr/chateau-la-nerthe/vin/cuvee-des-cadettes-2023/
  ('Château la Nerthe', 'Châteauneuf-du-Pape Les Clavelles', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.domainesrichard.fr/chateau-la-nerthe/vin/les-clavelles/
  ('Château la Nerthe', 'Côtes du Rhône Villages Les Cassagnes de La Nerthe Rouge', 'Côtes du Rhône Villages, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.domainesrichard.fr/chateau-la-nerthe/vin/les-cassagnes-de-la-nerthe-2023-2/
  ('Château la Nerthe', 'Côtes du Rhône Les Cassagnes de La Nerthe Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://www.domainesrichard.fr/chateau-la-nerthe/vins/
  ('Château la Nerthe', 'Côtes du Rhône Les Cassagnes de La Nerthe Rosé', 'Côtes du Rhône, Rhône Valley, France', null, 'Rosé')  -- https://www.domainesrichard.fr/chateau-la-nerthe/vin/les-cassagnes-de-la-nerthe-rose-2025/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA MORDORÉE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine de la Mordorée', 'Châteauneuf-du-Pape La Reine des Bois', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Counoise, Vaccarèse', 'Red'),  -- https://www.domaine-mordoree.com/vins/chateauneuf-du-pape/
  ('Domaine de la Mordorée', 'Châteauneuf-du-Pape La Dame Voyageuse', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah, Counoise, Vaccarèse', 'Red'),  -- https://www.domaine-mordoree.com/vins/chateauneuf-du-pape/
  ('Domaine de la Mordorée', 'Condrieu', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.domaine-mordoree.com/vins/condrieu/
  ('Domaine de la Mordorée', 'Côtes du Rhône Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Cinsault, Carignan, Mourvèdre', 'Red'),  -- https://www.domaine-mordoree.com/vins/cotes-du-rhone/
  ('Domaine de la Mordorée', 'Côtes du Rhône Rosé', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Cinsault, Carignan, Mourvèdre', 'Rosé'),  -- https://www.domaine-mordoree.com/vins/cotes-du-rhone/
  ('Domaine de la Mordorée', 'Lirac La Reine des Bois Blanc', 'Lirac, Rhône Valley, France', 'Grenache, Clairette, Viognier, Roussanne, Marsanne, Picpoul, Bourboulenc', 'White'),  -- https://www.domaine-mordoree.com/vins/lirac/
  ('Domaine de la Mordorée', 'Lirac La Reine des Bois Rouge', 'Lirac, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.domaine-mordoree.com/vins/lirac/
  ('Domaine de la Mordorée', 'Lirac La Dame Rousse', 'Lirac, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.domaine-mordoree.com/vins/lirac/
  ('Domaine de la Mordorée', 'Lirac La Plume du Peintre Blanc', 'Lirac, Rhône Valley, France', 'Viognier, Roussanne, Marsanne', 'White'),  -- https://www.domaine-mordoree.com/vins/lirac/
  ('Domaine de la Mordorée', 'Lirac La Plume du Peintre Rouge', 'Lirac, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.domaine-mordoree.com/vins/lirac/
  ('Domaine de la Mordorée', 'Tavel La Reine des Bois', 'Tavel, Rhône Valley, France', 'Grenache, Syrah, Clairette, Cinsault', 'Rosé'),  -- https://www.domaine-mordoree.com/vins/tavel/
  ('Domaine de la Mordorée', 'Tavel La Dame Rousse', 'Tavel, Rhône Valley, France', 'Grenache, Cinsault, Syrah, Clairette', 'Rosé'),  -- https://www.domaine-mordoree.com/vins/tavel/
  ('Domaine de la Mordorée', 'Vin de France La Remise de la Mordorée Rouge', 'Rhône Valley, France', 'Merlot, Marselan, Grenache', 'Red'),  -- https://www.domaine-mordoree.com/vins/vin-de-france/
  ('Domaine de la Mordorée', 'Vin de France La Remise de la Mordorée Blanc', 'Rhône Valley, France', 'Clairette, Viognier', 'White'),  -- https://www.domaine-mordoree.com/vins/vin-de-france/
  ('Domaine de la Mordorée', 'Vin de France La Remise de la Mordorée Rosé', 'Rhône Valley, France', 'Grenache', 'Rosé'),  -- https://www.domaine-mordoree.com/vins/vin-de-france/
  ('Domaine de la Mordorée', 'Vin de France Les Bulles de la Mordorée', 'Rhône Valley, France', 'Grenache, Clairette, Cinsault', 'Sparkling'),  -- https://www.domaine-mordoree.com/vins/vin-de-france/
  ('Domaine de la Mordorée', 'Vin de France Les Galets Blanc', 'Rhône Valley, France', 'Grenache Blanc', 'White'),  -- https://www.domaine-mordoree.com/vins/vin-de-france/
  ('Domaine de la Mordorée', 'Vin de France Les Galets Rouge', 'Rhône Valley, France', 'Mourvèdre', 'Red'),  -- https://www.domaine-mordoree.com/vins/vin-de-france/
  ('Domaine de la Mordorée', 'Vin de France Les Sables Blanc', 'Rhône Valley, France', 'Clairette', 'White'),  -- https://www.domaine-mordoree.com/vins/vin-de-france/
  ('Domaine de la Mordorée', 'Vin de France Les Sables Rouge Sans Sulfites Ajoutés', 'Rhône Valley, France', 'Marselan', 'Red'),  -- https://www.domaine-mordoree.com/vins/vin-de-france/
  ('Domaine de la Mordorée', 'Vin de France Les Lauzes', 'Rhône Valley, France', 'Grenache', 'Red')  -- https://www.domaine-mordoree.com/vins/vin-de-france/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE MARCOUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine de Marcoux', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Roussanne, Bourboulenc, Clairette', 'White'),  -- https://www.domainedemarcoux.fr/vin/chateauneuf-du-pape-blanc/
  ('Domaine de Marcoux', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah, Cinsault', 'Red'),  -- https://www.domainedemarcoux.fr/vin/chateauneuf-du-pape-rouge/
  ('Domaine de Marcoux', 'Châteauneuf-du-Pape Vieilles Vignes', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre', 'Red'),  -- https://www.domainedemarcoux.fr/vin/chateauneuf-du-pape-vieilles-vignes-rouge-2/
  ('Domaine de Marcoux', 'Côtes du Rhône Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.domainedemarcoux.fr/vin/cotes-du-rhone-rouge-2/
  ('Domaine de Marcoux', 'Lirac Lorentine', 'Lirac, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://www.domainedemarcoux.fr/vin/lorentine-rouge/
  ('Domaine de Marcoux', 'Vin de France Raisin de Loup Blanc', 'Rhône Valley, France', 'Clairette Rose, Clairette Blanche', 'White'),  -- https://www.domainedemarcoux.fr/vin/raisin-de-loup-blanc/
  ('Domaine de Marcoux', 'Vin de France Raisin de Loup Rouge', 'Rhône Valley, France', 'Grenache, Syrah, Caladoc', 'Red')  -- https://www.domainedemarcoux.fr/vin/raisin-de-loup-rouge/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE SANTA DUC ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Santa Duc', 'Châteauneuf-du-Pape Habemus Papam', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/chateauneuf-du-pape/habemus-papam/
  ('Domaine Santa Duc', 'Châteauneuf-du-Pape La Crau Ouest', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/chateauneuf-du-pape/la-crau-ouest/
  ('Domaine Santa Duc', 'Châteauneuf-du-Pape Le Pied de Baud', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre, Cinsault', 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/chateauneuf-du-pape/le-pied-de-baud/
  ('Domaine Santa Duc', 'Châteauneuf-du-Pape Les Saintes Vierges', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre, Counoise', 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/chateauneuf-du-pape/les-saintes-vierges/
  ('Domaine Santa Duc', 'Gigondas Les Hautes Garrigues', 'Gigondas, Rhône Valley, France', 'Grenache, Mourvèdre', 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/gigondas/les-hautes-garrigues/
  ('Domaine Santa Duc', 'Gigondas Aux Lieux-Dits', 'Gigondas, Rhône Valley, France', null, 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/gigondas/aux-lieux-dits/
  ('Domaine Santa Duc', 'Gigondas Clos Derrière Vieille', 'Gigondas, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/gigondas/clos-derriere-vieille/
  ('Domaine Santa Duc', 'Gigondas Clos des Hospices Blanc', 'Gigondas, Rhône Valley, France', null, 'White'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/gigondas/clos-des-hospices-blanc/
  ('Domaine Santa Duc', 'Gigondas Clos des Hospices Rouge', 'Gigondas, Rhône Valley, France', null, 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/gigondas/clos-des-hospices-rouge/
  ('Domaine Santa Duc', 'Vacqueyras Les Aubes', 'Vacqueyras, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/vacqueyras/les-aubes/
  ('Domaine Santa Duc', 'Côtes du Rhône Les Quatre Terres', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Carignan, Cinsault', 'Red'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/cotes-du-rhone/les-quatre-terres/
  ('Domaine Santa Duc', 'Côtes du Rhône Le Serre du Rieu Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Clairette, Bourboulenc', 'White'),  -- https://www.santaduc.fr/nos-vins-nos-terroirs/cotes-du-rhone/le-serre-du-rieu/
  ('Domaine Santa Duc', 'Côtes du Rhône Les Grands Calcaires Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White')  -- https://idealwine.com/uk/domain/5107-Santa-Duc.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU LA GARDINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château la Gardine', 'Châteauneuf-du-Pape Tradition Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Roussanne, Grenache Blanc, Clairette, Bourboulenc', 'White'),  -- https://www.gardine.com/15-717-vin-blanc-chateauneuf-du-pape-2020.html
  ('Château la Gardine', 'Châteauneuf-du-Pape Tradition Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Muscardin', 'Red'),  -- https://www.gardine.com/58-698-chateau-de-la-gardine-tradition-chateauneuf-du-pape-rouge.html
  ('Château la Gardine', 'Châteauneuf-du-Pape Générations Marie-Léoncie Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Roussanne', 'White'),  -- https://www.gardine.com/16-716-chateauneuf-du-pape-blanc-marie-leoncie.html
  ('Château la Gardine', 'Châteauneuf-du-Pape Générations Gaston-Philippe Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.gardine.com/17-697-chateau-de-la-gardine-generations-chateauneuf-du-pape-rouge.html
  ('Château la Gardine', 'Châteauneuf-du-Pape Immortelle', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.gardine.com/30-706-chateauneuf-du-pape-immortelle.html
  ('Château la Gardine', 'Châteauneuf-du-Pape Peur Bleue Sans Sulfites Ajoutés', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://www.gardine.com/29-683-chateauneuf-du-pape-peur-bleue.html
  ('Château la Gardine', 'Châteauneuf-du-Pape Nulle Part Ailleurs Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.gardine.com/63-nulle-part-ailleurs-rouge.html
  ('Château la Gardine', 'Châteauneuf-du-Pape Nulle Part Ailleurs Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White'),  -- https://www.gardine.com/64-nulle-part-ailleurs-rouge.html
  ('Château la Gardine', 'Rasteau Tradition', 'Rasteau, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.gardine.com/18-671-vin-rasteau-cru-des-cotes-du-rhone.html
  ('Château la Gardine', 'Rasteau Même pas Peur Sans Sulfites Ajoutés', 'Rasteau, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://www.gardine.com/19-687-rasteau-rouge-meme-pas-peur.html
  ('Château la Gardine', 'Rasteau Vin Doux Naturel', 'Rasteau, Rhône Valley, France', 'Grenache', 'Fortified')  -- https://www.gardine.com/52-587-vin-doux-naturel-rasteau-chateau-de-la-gardine.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE SAINT-PRÉFERT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Saint-Préfert', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.bowlerwine.com/producer/saint-prefert-isabel-ferrando
  ('Domaine Saint-Préfert', 'Châteauneuf-du-Pape Colombis', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.bowlerwine.com/producer/saint-prefert-isabel-ferrando
  ('Domaine Saint-Préfert', 'Châteauneuf-du-Pape F601', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5106-Saint-Prefert.jsp
  ('Domaine Saint-Préfert', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Clairette, Roussanne', 'White'),  -- https://www.bowlerwine.com/producer/saint-prefert-isabel-ferrando
  ('Domaine Saint-Préfert', 'Châteauneuf-du-Pape Vieilles Clairettes Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Clairette', 'White'),  -- https://www.bowlerwine.com/producer/saint-prefert-isabel-ferrando
  ('Domaine Saint-Préfert', 'Côtes du Rhône Clos Beatus Ille', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Cinsault', 'Red'),  -- https://www.bowlerwine.com/producer/saint-prefert-isabel-ferrando
  ('Domaine Saint-Préfert', 'Châteauneuf-du-Pape Réserve Auguste Favier', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5106-Saint-Prefert.jsp
  ('Domaine Saint-Préfert', 'Châteauneuf-du-Pape Collection Charles Giraud', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red')  -- https://www.idealwine.com/uk/domain/5106-Saint-Prefert.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DU CAYRON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine du Cayron', 'Gigondas', 'Gigondas, Rhône Valley, France', 'Grenache, Syrah, Cinsault, Mourvèdre', 'Red')  -- https://www.skurnik.com/sku/gigondas-domaine-du-cayron-3-2-2-2-2-2-2-2-2-2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DU MONT-OLIVET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Clos du Mont-Olivet', 'Châteauneuf-du-Pape Cuvée Tradition Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Cinsault', 'Red'),  -- https://www.skurnik.com/sku/chateauneuf-du-pape-clos-du-mont-olivet/
  ('Clos du Mont-Olivet', 'Châteauneuf-du-Pape Cuvée Tradition Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Clairette, Roussanne, Bourboulenc, Grenache Blanc', 'White'),  -- https://www.skurnik.com/sku/chateauneuf-du-pape-blanc-clos-du-mont-olivet/
  ('Clos du Mont-Olivet', 'Châteauneuf-du-Pape Cuvée du Papet', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://www.skurnik.com/sku/chateauneuf-du-pape-petit-mont-clos-du-mont-olivet-2-2-2-2-2-2-2-3/
  ('Clos du Mont-Olivet', 'Côtes du Rhône Vieilles Vignes', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Carignan, Cinsault', 'Red'),  -- https://www.skurnik.com/sku/cotes-du-rhone-vieilles-vignes-clos-du-mont-olivet/
  ('Clos du Mont-Olivet', 'Lirac Cuvée Classique Rouge', 'Lirac, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Cinsault', 'Red'),  -- https://www.skurnik.com/sku/lirac-rouge-clos-du-mont-olivet-3/
  ('Clos du Mont-Olivet', 'Lirac Cuvée Classique Blanc', 'Lirac, Rhône Valley, France', null, 'White'),  -- https://www.clos-montolivet.com/collections/all/products.json
  ('Clos du Mont-Olivet', 'Côtes du Rhône Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://www.clos-montolivet.com/collections/all/products.json
  ('Clos du Mont-Olivet', 'Vin de France 111 Rouge', 'Rhône Valley, France', 'Grenache, Syrah, Carignan, Counoise, Alicante Bouschet', 'Red'),  -- https://www.clos-montolivet.com/collections/all/products.json
  ('Clos du Mont-Olivet', 'Vin de France Le Chemin du Sauvage Blanc', 'Rhône Valley, France', 'Picpoul Gris', 'White')  -- https://www.clos-montolivet.com/collections/all/products.json
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE BEAURENARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine de Beaurenard', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://famillecoulon.com/
  ('Domaine de Beaurenard', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Clairette, Grenache Blanc, Grenache Gris, Bourboulenc, Roussanne, Picpoul, Picardan', 'White'),  -- https://wilsondaniels.com/wine/domaine-de-beaurenard/chateauneuf-du-pape-blanc/
  ('Domaine de Beaurenard', 'Châteauneuf-du-Pape Le Boisrenard Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://famillecoulon.com/
  ('Domaine de Beaurenard', 'Châteauneuf-du-Pape Le Boisrenard Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Blanc, Clairette, Grenache Gris, Bourboulenc, Roussanne, Picpoul, Picardan', 'White'),  -- https://wilsondaniels.com/wine/domaine-de-beaurenard/chateauneuf-du-pape-le-boisrenard-blanc/
  ('Domaine de Beaurenard', 'Châteauneuf-du-Pape Gran Partita', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah, Counoise, Cinsault, Vaccarèse, Terret Noir, Muscardin, Clairette, Picpoul, Picardan, Bourboulenc, Roussanne', 'Red'),  -- https://www.comptoirdesmillesimes.com/blog/en/?p=6900
  ('Domaine de Beaurenard', 'Rasteau', 'Rasteau, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://wilsondaniels.com/wine/domaine-de-beaurenard/rasteau/
  ('Domaine de Beaurenard', 'Rasteau Les Argiles Bleues', 'Rasteau, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://wilsondaniels.com/wine/domaine-de-beaurenard/rasteau-les-argiles-bleues/
  ('Domaine de Beaurenard', 'Rasteau Vin Doux Naturel', 'Rasteau, Rhône Valley, France', 'Grenache', 'Fortified')  -- https://wilsondaniels.com/wine/domaine-de-beaurenard/vin-doux-naturel-rasteau/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GRAMENON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Gramenon', 'Côtes du Rhône Contre-Couleur', 'Côtes du Rhône, Rhône Valley, France', 'Grenache', 'Red'),  -- https://domaine-gramenon.fr/les-vins/contre-couleur/
  ('Domaine Gramenon', 'Côtes du Rhône Villages Valréas L''Élémentaire', 'Côtes du Rhône Villages Valréas, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://domaine-gramenon.fr/les-vins/l-elementaire/
  ('Domaine Gramenon', 'Côtes du Rhône L''Émouvante', 'Côtes du Rhône, Rhône Valley, France', 'Syrah', 'Red'),  -- https://domaine-gramenon.fr/les-vins/l-emouvante/
  ('Domaine Gramenon', 'Côtes du Rhône La Belle Sortie', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://domaine-gramenon.fr/les-vins/la-belle-sortie/
  ('Domaine Gramenon', 'Côtes du Rhône La Mémé', 'Côtes du Rhône, Rhône Valley, France', 'Grenache', 'Red'),  -- https://domaine-gramenon.fr/les-vins/la-meme/
  ('Domaine Gramenon', 'Côtes du Rhône La Papesse', 'Côtes du Rhône, Rhône Valley, France', 'Grenache', 'Red'),  -- https://domaine-gramenon.fr/les-vins/la-papesse/
  ('Domaine Gramenon', 'Côtes du Rhône La Poignée de Raisins', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Cinsault', 'Red'),  -- https://domaine-gramenon.fr/les-vins/la-poignee-de-raisins/
  ('Domaine Gramenon', 'Côtes du Rhône La Sagesse', 'Côtes du Rhône, Rhône Valley, France', 'Grenache', 'Red'),  -- https://domaine-gramenon.fr/les-vins/la-sagesse/
  ('Domaine Gramenon', 'Côtes du Rhône La Vie On Y Est', 'Côtes du Rhône, Rhône Valley, France', 'Viognier, Clairette, Bourboulenc, Grenache Blanc', 'White'),  -- https://domaine-gramenon.fr/les-vins/la-vie-on-y-est/
  ('Domaine Gramenon', 'Côtes du Rhône Rosé Pompon', 'Côtes du Rhône, Rhône Valley, France', 'Syrah, Cinsault', 'Rosé'),  -- https://domaine-gramenon.fr/les-vins/rose-pompon/
  ('Domaine Gramenon', 'Côtes du Rhône Sierra du Sud', 'Côtes du Rhône, Rhône Valley, France', 'Syrah, Grenache', 'Red'),  -- https://domaine-gramenon.fr/les-vins/sierra-du-sud/
  ('Domaine Gramenon', 'Vin de France Tout en Bulles', 'Rhône Valley, France', 'Clairette Rose, Clairette Blanche', 'Sparkling')  -- https://domaine-gramenon.fr/les-vins/tout-en-bulles/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MARCEL RICHAUD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Marcel Richaud', 'Vin de France A la Source Blanc', 'Rhône Valley, France', null, 'White'),  -- https://www.domaine-richaud.fr/vins/a-la-source-blanc/
  ('Domaine Marcel Richaud', 'Vin de France A la Source Rouge', 'Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.domaine-richaud.fr/vins/a-la-source/
  ('Domaine Marcel Richaud', 'Cairanne Blanc', 'Cairanne, Rhône Valley, France', null, 'White'),  -- https://www.domaine-richaud.fr/vins/cairanne-blanc-2023/
  ('Domaine Marcel Richaud', 'Cairanne Rouge', 'Cairanne, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-richaud.fr/vins/cairanne-rouge/
  ('Domaine Marcel Richaud', 'Vin de France Le Rosé', 'Rhône Valley, France', null, 'Rosé'),  -- https://www.domaine-richaud.fr/vins/le-rose/
  ('Domaine Marcel Richaud', 'Rasteau Rouge', 'Rasteau, Rhône Valley, France', null, 'Red')  -- https://www.domaine-richaud.fr/vins/rasteau/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE L'ORATOIRE SAINT-MARTIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine de l''Oratoire Saint-Martin', 'Cairanne Haut-Coustias Rouge', 'Cairanne, Rhône Valley, France', null, 'Red'),  -- https://www.oratoiresaintmartin.fr/nos-vins/
  ('Domaine de l''Oratoire Saint-Martin', 'Cairanne Haut-Coustias Blanc', 'Cairanne, Rhône Valley, France', null, 'White'),  -- https://www.oratoiresaintmartin.fr/nos-vins/
  ('Domaine de l''Oratoire Saint-Martin', 'Cairanne Les Douyes', 'Cairanne, Rhône Valley, France', null, 'Red'),  -- https://www.oratoiresaintmartin.fr/nos-vins/
  ('Domaine de l''Oratoire Saint-Martin', 'Cairanne Réserve des Seigneurs Rouge', 'Cairanne, Rhône Valley, France', null, 'Red'),  -- https://www.oratoiresaintmartin.fr/nos-vins/
  ('Domaine de l''Oratoire Saint-Martin', 'Cairanne Réserve des Seigneurs Blanc', 'Cairanne, Rhône Valley, France', null, 'White'),  -- https://www.oratoiresaintmartin.fr/nos-vins/
  ('Domaine de l''Oratoire Saint-Martin', 'Côtes du Rhône Le P''tit Martin', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.oratoiresaintmartin.fr/nos-vins/
  ('Domaine de l''Oratoire Saint-Martin', 'Côtes du Rhône Les P''tits Gars Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.oratoiresaintmartin.fr/nos-vins/
  ('Domaine de l''Oratoire Saint-Martin', 'Côtes du Rhône Les P''tits Gars Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White')  -- https://www.oratoiresaintmartin.fr/nos-vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE SAINT COSME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château de Saint Cosme', 'Gigondas Rouge', 'Gigondas, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre, Cinsault', 'Red'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Gigondas Hominis Fides Rouge', 'Gigondas, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Gigondas Le Claux', 'Gigondas, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Gigondas Le Poste Rouge', 'Gigondas, Rhône Valley, France', 'Grenache', 'Red'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Gigondas Le Poste Blanc', 'Gigondas, Rhône Valley, France', 'Clairette', 'White'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Gigondas Hominis Fides Blanc', 'Gigondas, Rhône Valley, France', 'Clairette', 'White'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Côtes du Rhône', 'Côtes du Rhône, Rhône Valley, France', 'Mourvèdre, Syrah, Cinsault, Grenache, Clairette', 'Red'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Châteauneuf-du-Pape', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah, Cinsault', 'Red'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Côte-Rôtie', 'Côte-Rôtie, Rhône Valley, France', 'Serine', 'Red'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Saint-Joseph', 'Saint-Joseph, Rhône Valley, France', 'Serine', 'Red'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Crozes-Hermitage', 'Crozes-Hermitage, Rhône Valley, France', 'Serine', 'Red'),  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
  ('Château de Saint Cosme', 'Condrieu', 'Condrieu, Rhône Valley, France', 'Viognier', 'White')  -- https://www.saintcosme.com/upload/Booklet_2026_Eng_Page_HD.pdf
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BRUSSET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Brusset', 'Ventoux Les Boudalles', 'Ventoux, Rhône Valley, France', null, 'Red'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Côtes du Rhône Rubis Nature', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Côtes du Rhône Laurent B.', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Côtes du Rhône Jeanne B.', 'Côtes du Rhône, Rhône Valley, France', null, 'Rosé'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Cairanne Les Travers Rouge', 'Cairanne, Rhône Valley, France', null, 'Red'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Cairanne Les Travers Blanc', 'Cairanne, Rhône Valley, France', null, 'White'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Cairanne Vieilles Vignes', 'Cairanne, Rhône Valley, France', null, 'Red'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Cairanne L''Esprit de Papet', 'Cairanne, Rhône Valley, France', null, 'White'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Rasteau La Bastide', 'Rasteau, Rhône Valley, France', null, 'Red'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Gigondas Tradition Le Grand Montmirail', 'Gigondas, Rhône Valley, France', null, 'Red'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Gigondas Les Hauts de Montmirail', 'Gigondas, Rhône Valley, France', null, 'Red'),  -- https://www.domainebrusset.fr/vins/
  ('Domaine Brusset', 'Gigondas Les Secrets de Montmirail', 'Gigondas, Rhône Valley, France', null, 'Red')  -- https://www.domainebrusset.fr/vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES ESCARAVAILLES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine des Escaravailles', 'Vin de France Le Petit Scarabée Rouge', 'Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Vin de France Prémices', 'Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Côtes du Rhône Glou', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Côtes du Rhône Histoire de 3 Mecs', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Côtes du Rhône Les Antimagnes Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau Classique', 'Rasteau, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau La Ponce Rouge', 'Rasteau, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau Argilla ad Argillam', 'Rasteau, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau Héritage 1924', 'Rasteau, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Cairanne Le Ventabren', 'Cairanne, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Cairanne La Boutine', 'Cairanne, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Côtes du Rhône Villages Roaix Les Hautes Granges', 'Côtes du Rhône Villages Roaix, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Côtes du Rhône Villages Plan de Dieu Domaine Calendal', 'Côtes du Rhône Villages Plan de Dieu, Rhône Valley, France', null, 'Red'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Vin de France Le Petit Scarabée Blanc', 'Rhône Valley, France', null, 'White'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Côtes du Rhône La Ponce Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Côtes du Rhône La Galopine', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Vin de France Scarabée Blanc', 'Rhône Valley, France', null, 'White'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Vin de France Le Petit Scarabée Rosé', 'Rhône Valley, France', null, 'Rosé'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Côtes du Rhône Les Antimagnes Rosé', 'Côtes du Rhône, Rhône Valley, France', null, 'Rosé'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Vin de France Scarabulle', 'Rhône Valley, France', null, 'Rosé'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau Vin Doux Naturel Blanc', 'Rasteau, Rhône Valley, France', null, 'Fortified'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau Vin Doux Naturel Rosé', 'Rasteau, Rhône Valley, France', null, 'Fortified'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau Vin Doux Naturel Ambré', 'Rasteau, Rhône Valley, France', null, 'Fortified'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau Vin Doux Naturel Ambré TPMG', 'Rasteau, Rhône Valley, France', null, 'Fortified'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau Vin Doux Naturel Tuilé', 'Rasteau, Rhône Valley, France', null, 'Fortified'),  -- https://www.domaine-escaravailles.com/nos-vins-fr/
  ('Domaine des Escaravailles', 'Rasteau Vin Doux Naturel Grenat', 'Rasteau, Rhône Valley, France', null, 'Fortified')  -- https://www.domaine-escaravailles.com/nos-vins-fr/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU MOURGUES DU GRÈS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château Mourgues du Grès', 'Costières de Nîmes Les Galets Dorés', 'Costières de Nîmes, Rhône Valley, France', 'Grenache Blanc, Roussanne, Vermentino', 'White'),  -- https://www.mourguesdugres.com/galets-dores
  ('Château Mourgues du Grès', 'Costières de Nîmes Les Galets Rosés', 'Costières de Nîmes, Rhône Valley, France', 'Syrah, Grenache, Mourvèdre', 'Rosé'),  -- https://www.mourguesdugres.com/galets-roses
  ('Château Mourgues du Grès', 'Costières de Nîmes Les Galets Rouges', 'Costières de Nîmes, Rhône Valley, France', 'Syrah, Grenache, Mourvèdre, Marselan', 'Red'),  -- https://www.mourguesdugres.com/galets-rouges
  ('Château Mourgues du Grès', 'Costières de Nîmes Fleur d''Églantine', 'Costières de Nîmes, Rhône Valley, France', 'Grenache, Mourvèdre', 'Rosé'),  -- https://www.mourguesdugres.com/fleur-deglantine
  ('Château Mourgues du Grès', 'Costières de Nîmes Cuve 46', 'Costières de Nîmes, Rhône Valley, France', 'Cinsault, Grenache', 'Red'),  -- https://www.mourguesdugres.com/cuve-46
  ('Château Mourgues du Grès', 'Costières de Nîmes Terre d''Argence Rouge', 'Costières de Nîmes, Rhône Valley, France', 'Syrah, Grenache', 'Red'),  -- https://www.mourguesdugres.com/terre-dargence-rouge
  ('Château Mourgues du Grès', 'Costières de Nîmes Terre de Feu', 'Costières de Nîmes, Rhône Valley, France', 'Grenache, Cinsault', 'Red'),  -- https://www.mourguesdugres.com/terre-de-feu
  ('Château Mourgues du Grès', 'Costières de Nîmes Capitelle Rouge', 'Costières de Nîmes, Rhône Valley, France', 'Syrah, Grenache', 'Red'),  -- https://www.mourguesdugres.com/capitelles-des-mourgues
  ('Château Mourgues du Grès', 'Costières de Nîmes Capitelle Blanc', 'Costières de Nîmes, Rhône Valley, France', 'Grenache Blanc, Clairette, Marsanne, Bourboulenc', 'White'),  -- https://www.mourguesdugres.com/capitelle-blanc
  ('Château Mourgues du Grès', 'Costières de Nîmes Équinoxe', 'Costières de Nîmes, Rhône Valley, France', 'Syrah, Grenache, Carignan', 'Red')  -- https://www.mourguesdugres.com/equinoxe
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU PESQUIÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château Pesquié', 'Ventoux Terrasses Rouge', 'Ventoux, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Terrasses Blanc', 'Ventoux, Rhône Valley, France', null, 'White'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Terrasses Rosé', 'Ventoux, Rhône Valley, France', null, 'Rosé'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Quintessence Rouge', 'Ventoux, Rhône Valley, France', 'Syrah, Grenache', 'Red'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Quintessence Blanc', 'Ventoux, Rhône Valley, France', 'Roussanne, Clairette', 'White'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Quintessence Rosé', 'Ventoux, Rhône Valley, France', null, 'Rosé'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Ascensio', 'Ventoux, Rhône Valley, France', null, 'Red'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Artemia', 'Ventoux, Rhône Valley, France', null, 'Red'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Silica', 'Ventoux, Rhône Valley, France', 'Grenache', 'Red'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Cuvée Juliette', 'Ventoux, Rhône Valley, France', 'Clairette, Grenache Blanc', 'White'),  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
  ('Château Pesquié', 'Ventoux Tandem', 'Ventoux, Rhône Valley, France', 'Grenache Noir, Grenache Blanc', 'Red')  -- https://shop.famillechaudiere.com/product-category/chateau-pesquie/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TARDIEU-LAURENT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Tardieu-Laurent', 'Crozes-Hermitage Rouge Bio', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-0UU12F-maison-tardieu-laurent-crozes-hermitage-rouge-bio-2024
  ('Tardieu-Laurent', 'Crozes-Hermitage Rouge Vieilles Vignes', 'Crozes-Hermitage, Rhône Valley, France', 'Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-XDT2UF-maison-tardieu-laurent-crozes-hermitage-rouge-vieille-vignes-2024
  ('Tardieu-Laurent', 'Crozes-Hermitage Blanc', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://tardieu-laurent.fr/nosvins/product-S25VWF-maison-tardieu-laurent-crozes-hermitage-blanc-2025
  ('Tardieu-Laurent', 'Crozes-Hermitage Blanc Vieilles Vignes', 'Crozes-Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://tardieu-laurent.fr/nosvins/product-SW528F-maison-tardieu-laurent-crozes-hermitage-blanc-vieilles-vignes-2025
  ('Tardieu-Laurent', 'Hermitage Rouge Vieilles Vignes', 'Hermitage, Rhône Valley, France', 'Serine, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-WX7D2F-maison-tardieu-laurent-hermitage-rouge-vieilles-vignes-2024
  ('Tardieu-Laurent', 'Hermitage Blanc Vieilles Vignes', 'Hermitage, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://tardieu-laurent.fr/nosvins/product-29290F-maison-tardieu-laurent-hermitage-blanc-vieilles-vignes-2024
  ('Tardieu-Laurent', 'Cornas', 'Cornas, Rhône Valley, France', 'Syrah, Serine', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-2A2YVF-maison-tardieu-laurent-cornas-2024
  ('Tardieu-Laurent', 'Cornas Vieilles Vignes', 'Cornas, Rhône Valley, France', 'Serine, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-UW2ITF-maison-tardieu-laurent-cornas-vieilles-vignes-2024
  ('Tardieu-Laurent', 'Cornas Coteaux', 'Cornas, Rhône Valley, France', 'Syrah, Serine', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-NAC50F-maison-tardieu-laurent-cornas-coteaux-2018
  ('Tardieu-Laurent', 'Côte-Rôtie', 'Côte-Rôtie, Rhône Valley, France', 'Serine, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-FBCU2F-maison-tardieu-laurent-cote-rotie-2024
  ('Tardieu-Laurent', 'Côte-Rôtie Vieilles Vignes', 'Côte-Rôtie, Rhône Valley, France', 'Serine, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-2AFDBF-maison-tardieu-laurent-cote-rotie-vieilles-vignes-2024
  ('Tardieu-Laurent', 'Saint-Joseph Rouge', 'Saint-Joseph, Rhône Valley, France', 'Serine, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-E2W21F-maison-tardieu-laurent-saint-joseph-rouge-2024
  ('Tardieu-Laurent', 'Saint-Joseph Rouge Vieilles Vignes', 'Saint-Joseph, Rhône Valley, France', 'Syrah, Serine', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-W412EF-maison-tardieu-laurent-saint-joseph-rouge-vieilles-vignes-2024
  ('Tardieu-Laurent', 'Saint-Joseph Blanc Vieilles Vignes', 'Saint-Joseph, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://tardieu-laurent.fr/nosvins/product-MNR2XF-maison-tardieu-laurent-saint-joseph-blanc-vieilles-vignes-2025
  ('Tardieu-Laurent', 'Saint-Péray Vieilles Vignes', 'Saint-Péray, Rhône Valley, France', 'Marsanne, Roussanne', 'White'),  -- https://tardieu-laurent.fr/nosvins/product-K5KV2F-maison-tardieu-laurent-saint-peray-vieilles-vignes-2025
  ('Tardieu-Laurent', 'Condrieu Vieilles Vignes', 'Condrieu, Rhône Valley, France', 'Viognier', 'White'),  -- https://tardieu-laurent.fr/nosvins/product-LQR62F-maison-tardieu-laurent-condrieu-vieilles-vignes-2025
  ('Tardieu-Laurent', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-C8VS2F-maison-laurent-tardieu-chateauneuf-du-pape-rouge-2024
  ('Tardieu-Laurent', 'Châteauneuf-du-Pape Vieilles Vignes', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Noir, Mourvèdre, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-16PW7F-maison-tardieu-laurent-chateauneuf-du-pape-vieilles-vignes-2023
  ('Tardieu-Laurent', 'Châteauneuf-du-Pape Rouge Cuvée Spéciale', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-VDS82F-maison-tardieu-laurent-chateauneuf-du-pape-rouge-cuvee-speciale-2024
  ('Tardieu-Laurent', 'Châteauneuf-du-Pape Blanc Vieilles Vignes', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Blanc, Clairette, Roussanne, Bourboulenc, Piquepoul', 'White'),  -- https://tardieu-laurent.fr/nosvins/product-3Q28QF-maison-tardieu-laurent-chateauneuf-du-pape-blanc-vieilles-vignes-2025
  ('Tardieu-Laurent', 'Gigondas Rouge Bio', 'Gigondas, Rhône Valley, France', 'Grenache Noir, Mourvèdre, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-22ATRF-maison-tardieu-laurent-gigondas-rouge-bio-2024
  ('Tardieu-Laurent', 'Gigondas Rouge Vieilles Vignes', 'Gigondas, Rhône Valley, France', 'Grenache, Mourvèdre, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-28V4KF-maison-tardieu-laurent-gigondas-rouge-vieilles-vignes-2024
  ('Tardieu-Laurent', 'Vacqueyras Rouge Vieilles Vignes', 'Vacqueyras, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-K2VV7F-maison-tardieu-laurent-vacqueyras-rouge-vieilles-vignes-2024
  ('Tardieu-Laurent', 'Vacqueyras Blanc Bio', 'Vacqueyras, Rhône Valley, France', 'Clairette, Grenache Blanc, Roussanne, Marsanne, Viognier, Bourboulenc', 'White'),  -- https://tardieu-laurent.fr/nosvins/product-25QZ1F-maison-tardieu-laurent-vacqueyras-blanc-bio-2025
  ('Tardieu-Laurent', 'Rasteau Rouge Vieilles Vignes', 'Rasteau, Rhône Valley, France', 'Grenache, Syrah', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-26VFKF-maison-tardieu-laurent-rasteau-rouge-vieilles-vignes-2024
  ('Tardieu-Laurent', 'Tavel Vieilles Vignes Bio', 'Tavel, Rhône Valley, France', 'Grenache, Cinsault, Syrah', 'Rosé'),  -- https://tardieu-laurent.fr/nosvins/product-D532NF-maison-tardieu-laurent-tavel-vieilles-vignes-bio-2024
  ('Tardieu-Laurent', 'Côtes du Rhône Rouge Nobles Origines', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah, Mourvèdre', 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-2VK82F-maison-tardieu-laurent-cotes-du-rhone-rouge-nobles-origines-ex-guy-louis-2024
  ('Tardieu-Laurent', 'Côtes du Rhône Blanc Nobles Origines', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Clairette, Viognier, Marsanne, Roussanne', 'White'),  -- https://tardieu-laurent.fr/nosvins/product-E2SU5F-maison-tardieu-laurent-cotes-du-rhone-blanc-nobles-origines-ex-guy-louis-2025
  ('Tardieu-Laurent', 'Côtes du Rhône Rouge Cuvée Spéciale', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://tardieu-laurent.fr/nosvins/product-W2K0QF-maison-tardieu-laurent-cotes-du-rhone-rouge-cuvee-speciale-2024
  ('Tardieu-Laurent', 'Côtes du Rhône Les Becs Fins Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache, Syrah', 'Red')  -- https://tardieu-laurent.fr/nosvins/product-G8L20F-maison-tardieu-laurent-les-becs-fins-rouge-2025
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GRAND VENEUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine Grand Veneur', 'Côtes du Rhône Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Noir, Syrah, Cinsault, Mourvèdre', 'Red'),  -- https://www.vignobles-alain-jaume.com/fr/vin-cotes-du-rhone-domaine-grand-veneur/1-vin-cotes-du-rhone-rouge-grand-veneur.html
  ('Domaine Grand Veneur', 'Côtes du Rhône Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Blanc, Roussanne, Viognier, Clairette', 'White'),  -- https://www.vignobles-alain-jaume.com/fr/vin-cotes-du-rhone-domaine-grand-veneur/2-vin-cotes-du-rhone-blanc-grand-veneur.html
  ('Domaine Grand Veneur', 'Côtes du Rhône Bellissime Rosé', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Rosé'),  -- https://www.vignobles-alain-jaume.com/fr/vin-cotes-du-rhone-domaine-grand-veneur/3-vin-cotes-du-rhone-rose-bellissime.html
  ('Domaine Grand Veneur', 'Côtes du Rhône Les Champauvins Blanc', 'Côtes du Rhône, Rhône Valley, France', 'Viognier', 'White'),  -- https://www.vignobles-alain-jaume.com/fr/domaine-grand-veneur-chateauneuf-bio/29-vin-cotes-du-rhone-blanc-les-champauvins.html
  ('Domaine Grand Veneur', 'Côtes du Rhône Les Champauvins Rouge', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.vignobles-alain-jaume.com/fr/vin-cotes-du-rhone-domaine-grand-veneur/28-vin-cotes-du-rhone-rouge-les-champauvins.html
  ('Domaine Grand Veneur', 'Châteauneuf-du-Pape Le Miocène Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.vignobles-alain-jaume.com/fr/vin-cotes-du-rhone-domaine-grand-veneur/12-vin-chateauneuf-du-pape-rouge-le-miocene.html
  ('Domaine Grand Veneur', 'Châteauneuf-du-Pape Le Miocène Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Clairette, Roussanne', 'White'),  -- https://www.vignobles-alain-jaume.com/fr/vin-cotes-du-rhone-domaine-grand-veneur/26-vin-chateauneuf-du-pape-blanc-le-miocene.html
  ('Domaine Grand Veneur', 'Châteauneuf-du-Pape Les Origines', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.vignobles-alain-jaume.com/fr/vin-cotes-du-rhone-domaine-grand-veneur/27-vin-chateauneuf-du-pape-rouge-les-origines.html
  ('Domaine Grand Veneur', 'Châteauneuf-du-Pape Vieilles Vignes', 'Châteauneuf-du-Pape, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red')  -- https://www.vignobles-alain-jaume.com/fr/vin-cotes-du-rhone-domaine-grand-veneur/14-vin-chateauneuf-du-pape-rouge-vieilles-vignes.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE VAUDIEU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Château de Vaudieu', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.chateaudevaudieu.com/boutique/
  ('Château de Vaudieu', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White'),  -- https://www.chateaudevaudieu.com/boutique/
  ('Château de Vaudieu', 'Châteauneuf-du-Pape L''Avenue', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.chateaudevaudieu.com/boutique/
  ('Château de Vaudieu', 'Châteauneuf-du-Pape Amiral G.', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://www.chateaudevaudieu.com/boutique/
  ('Château de Vaudieu', 'Châteauneuf-du-Pape Clos du Belvédère Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White'),  -- https://www.chateaudevaudieu.com/boutique/
  ('Château de Vaudieu', 'Châteauneuf-du-Pape Les Clairette de Gabriel', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White'),  -- https://www.chateaudevaudieu.com/boutique/
  ('Château de Vaudieu', 'Châteauneuf-du-Pape Les Vieilles Roussanne', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White')  -- https://www.chateaudevaudieu.com/boutique/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA SOUMADE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Domaine de la Soumade', 'Côtes du Rhône', 'Côtes du Rhône, Rhône Valley, France', 'Grenache Noir, Syrah', 'Red'),  -- https://www.domainelasoumade.fr/test/vins_cdr.html
  ('Domaine de la Soumade', 'Côtes du Rhône Anthéa', 'Côtes du Rhône, Rhône Valley, France', 'Syrah, Viognier', 'Red'),  -- https://www.domainelasoumade.fr/test/vins_anthea.html
  ('Domaine de la Soumade', 'Rasteau', 'Rasteau, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.domainelasoumade.fr/test/vins_rasteau.html
  ('Domaine de la Soumade', 'Rasteau Cuvée Prestige', 'Rasteau, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.domainelasoumade.fr/test/vins_prestige.html
  ('Domaine de la Soumade', 'Rasteau Cuvée Confiance', 'Rasteau, Rhône Valley, France', 'Grenache Noir, Syrah, Mourvèdre', 'Red'),  -- https://www.domainelasoumade.fr/test/vins_confiance.html
  ('Domaine de la Soumade', 'Rasteau Fleur de Confiance', 'Rasteau, Rhône Valley, France', 'Grenache Noir, Syrah', 'Red'),  -- https://www.domainelasoumade.fr/test/vins_fleurconfiance.html
  ('Domaine de la Soumade', 'Gigondas', 'Gigondas, Rhône Valley, France', 'Grenache Noir, Syrah', 'Red'),  -- https://www.domainelasoumade.fr/test/vins_gigondas.html
  ('Domaine de la Soumade', 'Rasteau Vin Doux Naturel Doré', 'Rasteau, Rhône Valley, France', 'Grenache Noir', 'Fortified'),  -- https://www.domainelasoumade.fr/test/vins_doux.html
  ('Domaine de la Soumade', 'Rasteau Vin Doux Naturel Rouge', 'Rasteau, Rhône Valley, France', 'Grenache Noir', 'Fortified')  -- https://www.domainelasoumade.fr/test/vins_doux.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GABRIEL MEFFRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r4_rhone.sql)'
from (values
  ('Gabriel Meffre', 'Gigondas Sainte Catherine', 'Gigondas, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Châteauneuf-du-Pape Saint Théodoric', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Vacqueyras Saint Barthélémy', 'Vacqueyras, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Côtes du Rhône Villages Plan de Dieu Saint Mapalis', 'Côtes du Rhône Villages Plan de Dieu, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Côtes du Rhône Saint François Bio Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Côtes du Rhône Saint François Bio Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Côtes du Rhône Saint Vincent Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Côtes du Rhône Saint Vincent Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Côtes du Rhône Saint Vincent Rosé', 'Côtes du Rhône, Rhône Valley, France', null, 'Rosé'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Cairanne Saint Jean', 'Cairanne, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Rasteau Saint Didier', 'Rasteau, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Tavel Saint Ferréol', 'Tavel, Rhône Valley, France', null, 'Rosé'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Tavel Saint Valentin Bio', 'Tavel, Rhône Valley, France', null, 'Rosé'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Ventoux Saint Pétrarque', 'Ventoux, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Côtes du Rhône Villages Saint Siffret', 'Côtes du Rhône Villages, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Saint-Joseph Saint Etienne Rouge', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Saint-Joseph Saint Etienne Blanc', 'Saint-Joseph, Rhône Valley, France', null, 'White'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Crozes-Hermitage Saint Pierre', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Collines Rhodaniennes Sainte-Blandine Syrah', 'Collines Rhodaniennes, Rhône Valley, France', 'Syrah', 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre/
  ('Gabriel Meffre', 'Gigondas Laurus', 'Gigondas, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Châteauneuf-du-Pape Laurus Rouge', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Châteauneuf-du-Pape Laurus Blanc', 'Châteauneuf-du-Pape, Rhône Valley, France', null, 'White'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Vacqueyras Laurus', 'Vacqueyras, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Côtes du Rhône Laurus Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Beaumes de Venise Laurus', 'Beaumes-de-Venise, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Côtes du Rhône Villages Laurus', 'Côtes du Rhône Villages, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Muscat de Beaumes-de-Venise Laurus', 'Muscat de Beaumes-de-Venise, Rhône Valley, France', null, 'Fortified'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Hermitage Laurus Rouge', 'Hermitage, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Hermitage Laurus Blanc', 'Hermitage, Rhône Valley, France', null, 'White'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Côte-Rôtie Laurus', 'Côte-Rôtie, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Condrieu Laurus', 'Condrieu, Rhône Valley, France', null, 'White'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Saint-Joseph Laurus', 'Saint-Joseph, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Crozes-Hermitage Laurus', 'Crozes-Hermitage, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/laurus/
  ('Gabriel Meffre', 'Gigondas Domus', 'Gigondas, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre-collection-1936/
  ('Gabriel Meffre', 'Côtes du Rhône Vallis Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre-collection-1936/
  ('Gabriel Meffre', 'Côtes du Rhône Vallis Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre-collection-1936/
  ('Gabriel Meffre', 'Côtes du Rhône Terra Bio Rouge', 'Côtes du Rhône, Rhône Valley, France', null, 'Red'),  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre-collection-1936/
  ('Gabriel Meffre', 'Côtes du Rhône Terra Bio Blanc', 'Côtes du Rhône, Rhône Valley, France', null, 'White')  -- https://gabriel-meffre.fr/vins/gammes/gabriel-meffre-collection-1936/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
