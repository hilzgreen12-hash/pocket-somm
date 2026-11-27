-- ============================================================================
-- wines_catalog seed — French producer ranges (Rhône, Burgundy, Beaujolais, Languedoc)
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent: search_key is set by the BEFORE
-- INSERT/UPDATE trigger (mig 102); existing rows are only upgraded to 'verified'.
--
-- Producers: E. Guigal, M. Chapoutier, Paul Jaboulet Aîné, Louis Jadot, Joseph
-- Drouhin, Louis Latour, Bouchard Père & Fils, Georges Duboeuf, Gérard Bertrand,
-- Albert Bichot. EVERY row was confirmed on a real page on 2026-11-26 (URL on each
-- row). Grapes only where the cited page (or the wine's own name) states them.
-- Large négociants capped at ~40-50 widely sold wines; France only.

-- ---- E. GUIGAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('E. Guigal', 'Côte-Rôtie Château d''Ampuis', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/cote-rotie-chateau-dampuis/
  ('E. Guigal', 'Côte-Rôtie La Mouline', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/cote-rotie-la-mouline/
  ('E. Guigal', 'Côte-Rôtie La Turque', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/cote-rotie-la-turque/
  ('E. Guigal', 'Côte-Rôtie La Landonne', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/cote-rotie-la-landonne/
  ('E. Guigal', 'Côte-Rôtie La Reynarde', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/cote-rotie-la-reynarde/
  ('E. Guigal', 'Côte-Rôtie Brune & Blonde de Guigal', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/cote-rotie-brune-blonde-de-guigal/
  ('E. Guigal', 'Ermitage Ex-Voto Rouge', 'Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/ermitage-ex-voto-red/
  ('E. Guigal', 'Ermitage Ex-Voto Blanc', 'Hermitage, Northern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/ermitage-ex-voto-white/
  ('E. Guigal', 'Hermitage Rouge', 'Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/hermitage-red/
  ('E. Guigal', 'Hermitage Blanc', 'Hermitage, Northern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/hermitage-white/
  ('E. Guigal', 'Condrieu La Doriane', 'Condrieu, Northern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/condrieu-la-doriane/
  ('E. Guigal', 'Condrieu Luminescence', 'Condrieu, Northern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/condrieu-luminescence/
  ('E. Guigal', 'Condrieu', 'Condrieu, Northern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/condrieu/
  ('E. Guigal', 'Saint-Joseph Lieu-dit Saint-Joseph Rouge', 'Saint-Joseph, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/saint-joseph-lieu-dit-red/
  ('E. Guigal', 'Saint-Joseph Lieu-dit Saint-Joseph Blanc', 'Saint-Joseph, Northern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/saint-joseph-lieu-dit-white/
  ('E. Guigal', 'Saint-Joseph Vignes de l''Hospice', 'Saint-Joseph, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/saint-joseph-vignes-de-lhospice/
  ('E. Guigal', 'Saint-Joseph Rouge', 'Saint-Joseph, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/saint-joseph-red/
  ('E. Guigal', 'Saint-Joseph Blanc', 'Saint-Joseph, Northern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/saint-joseph-white/
  ('E. Guigal', 'Crozes-Hermitage Rouge', 'Crozes-Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/crozes-hermitage-red/
  ('E. Guigal', 'Crozes-Hermitage Blanc', 'Crozes-Hermitage, Northern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/crozes-hermitage-white/
  ('E. Guigal', 'Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/chateauneuf-du-pape-red/
  ('E. Guigal', 'Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/chateauneuf-du-pape-white/
  ('E. Guigal', 'Gigondas', 'Gigondas, Southern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/gigondas-red/
  ('E. Guigal', 'Tavel', 'Tavel, Southern Rhône, France', null, 'Rosé'),  -- https://www.guigal.com/en/wine/tavel/
  ('E. Guigal', 'Côtes du Rhône Rouge', 'Côtes du Rhône, Southern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/cotes-du-rhone-red/
  ('E. Guigal', 'Côtes du Rhône Blanc', 'Côtes du Rhône, Southern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/cotes-du-rhone-white/
  ('E. Guigal', 'Côtes du Rhône Rosé', 'Côtes du Rhône, Southern Rhône, France', null, 'Rosé'),  -- https://www.guigal.com/en/wine/cotes-du-rhone-rose/
  ('E. Guigal', 'Château de Nalys Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/chateau-de-nalys-red/
  ('E. Guigal', 'Château de Nalys Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'White'),  -- https://www.guigal.com/en/wine/chateau-de-nalys-white/
  ('E. Guigal', 'Saintes Pierres de Nalys Châteauneuf-du-Pape Rouge', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'Red'),  -- https://www.guigal.com/en/wine/saintes-pierres-de-nalys-red/
  ('E. Guigal', 'Saintes Pierres de Nalys Châteauneuf-du-Pape Blanc', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'White')  -- https://www.guigal.com/en/wine/saintes-pierres-de-nalys-white/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- M. CHAPOUTIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('M. Chapoutier', 'Ermitage Le Méal Rouge', 'Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Ermitage Le Méal Blanc', 'Hermitage, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Ermitage Le Pavillon', 'Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Ermitage L''Ermite Rouge', 'Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Ermitage L''Ermite Blanc', 'Hermitage, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Ermitage De l''Orée', 'Hermitage, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Ermitage Les Greffieux', 'Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Hermitage Chante-Alouette', 'Hermitage, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Hermitage Monier de la Sizeranne', 'Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.wine.com/product/m-chapoutier-hermitage-monier-de-la-sizeranne-2020/2548616
  ('M. Chapoutier', 'Hermitage Mure de Larnage Rouge', 'Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Hermitage Mure de Larnage Blanc', 'Hermitage, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Côte-Rôtie La Mordorée', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Côte-Rôtie La Neve', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Côte-Rôtie Les Bécasses', 'Côte-Rôtie, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Châteauneuf-du-Pape Barbe Rac', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Châteauneuf-du-Pape Croix de Bois', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Châteauneuf-du-Pape La Bernardine Rouge', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Châteauneuf-du-Pape La Bernardine Blanc', 'Châteauneuf-du-Pape, Southern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Saint-Joseph Les Granits Rouge', 'Saint-Joseph, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Saint-Joseph Les Granits Blanc', 'Saint-Joseph, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Saint-Joseph Les Granilites Rouge', 'Saint-Joseph, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Saint-Joseph Les Granilites Blanc', 'Saint-Joseph, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Saint-Joseph Le Clos', 'Saint-Joseph, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Crozes-Hermitage Les Meysonniers Rouge', 'Crozes-Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Crozes-Hermitage Les Meysonniers Blanc', 'Crozes-Hermitage, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Crozes-Hermitage Les Varonniers', 'Crozes-Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Crozes-Hermitage Sicamor', 'Crozes-Hermitage, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Cornas Saint-Pierre', 'Cornas, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Cornas Temenos', 'Cornas, Northern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Condrieu Invitare', 'Condrieu, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Condrieu Coteau de Chéry', 'Condrieu, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Côtes du Rhône Belleruche Rouge', 'Côtes du Rhône, Southern Rhône, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Côtes du Rhône Belleruche Blanc', 'Côtes du Rhône, Southern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Collines Rhodaniennes La Combe Pilate', 'Collines Rhodaniennes IGP, Northern Rhône, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Riesling Schieferkopf Lieu-dit Berg', 'Alsace, Alsace, France', 'Riesling', 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Riesling Schieferkopf Lieu-dit Buehl', 'Alsace, Alsace, France', 'Riesling', 'White'),  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
  ('M. Chapoutier', 'Riesling Schieferkopf Lieu-dit Fels', 'Alsace, Alsace, France', 'Riesling', 'White')  -- https://www.idealwine.com/uk/domain/5012-Chapoutier.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAUL JABOULET AÎNÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('Paul Jaboulet Aîné', 'Parallèle 45 Rouge', 'Côtes du Rhône, Southern Rhône, France', 'Grenache/Syrah', 'Red'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Parallèle 45 Blanc', 'Côtes du Rhône, Southern Rhône, France', 'Grenache Blanc/Marsanne/Viognier/Bourboulenc', 'White'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Parallèle 45 Rosé', 'Côtes du Rhône, Southern Rhône, France', null, 'Rosé'),  -- https://www.vinissimus.com/es/vino/jaboulet-parallele-45-rose
  ('Paul Jaboulet Aîné', 'Crozes-Hermitage Domaine de Thalabert', 'Crozes-Hermitage, Northern Rhône, France', 'Syrah', 'Red'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Crozes-Hermitage Les Jalets', 'Crozes-Hermitage, Northern Rhône, France', 'Syrah', 'Red'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Crozes-Hermitage Les Jalets Blanc', 'Crozes-Hermitage, Northern Rhône, France', 'Marsanne', 'White'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Crozes-Hermitage Domaine de Roure', 'Crozes-Hermitage, Northern Rhône, France', 'Syrah', 'Red'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Crozes-Hermitage La Croix des Vignes Blanc', 'Crozes-Hermitage, Northern Rhône, France', 'Marsanne/Roussanne', 'White'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Condrieu Domaine de Saint Pierre', 'Condrieu, Northern Rhône, France', 'Viognier', 'White'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Condrieu Les Grands Amandiers', 'Condrieu, Northern Rhône, France', 'Viognier', 'White'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Côte-Rôtie Les Pierrelles', 'Côte-Rôtie, Northern Rhône, France', 'Syrah', 'Red'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Hermitage La Maison Bleue', 'Hermitage, Northern Rhône, France', 'Syrah', 'Red'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Hermitage Le Chevalier de Sterimberg', 'Hermitage, Northern Rhône, France', 'Marsanne/Roussanne', 'White'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Hermitage La Chapelle', 'Hermitage, Northern Rhône, France', 'Syrah', 'Red'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Hermitage La Chapelle Blanc', 'Hermitage, Northern Rhône, France', 'Marsanne', 'White'),  -- https://www.vinissimus.com/es/bodega/domaines-paul-jaboulet-aine/
  ('Paul Jaboulet Aîné', 'Secret de Famille Côtes du Rhône Blanc', 'Côtes du Rhône, Southern Rhône, France', null, 'White'),  -- https://www.vinissimus.com/es/vino/jaboulet-secret-de-famille-cotes-du-rhone-bl
  ('Paul Jaboulet Aîné', 'Secret de Famille Viognier', 'Rhône, Rhône, France', 'Viognier', 'White'),  -- https://www.vinissimus.com/es/vino/jaboulet-secret-de-famille-viognier-2018
  ('Paul Jaboulet Aîné', 'Les Traverses Ventoux Blanc', 'Ventoux, Southern Rhône, France', null, 'White')  -- https://www.vinissimus.com/es/vino/jaboulet-les-traverses-ventoux-blanc
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOUIS JADOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('Louis Jadot', 'Bourgogne Couvent des Jacobins Blanc', 'Bourgogne, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Bourgogne Côte d''Or', 'Bourgogne Côte d''Or, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Coteaux Bourguignons Rouge', 'Coteaux Bourguignons, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Coteaux Bourguignons Blanc', 'Coteaux Bourguignons, Burgundy, France', 'Chardonnay/Aligoté', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Coteaux Bourguignons Rosé', 'Coteaux Bourguignons, Burgundy, France', 'Gamay', 'Rosé'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Mâcon-Villages Grange Magnien', 'Mâcon-Villages, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Pouilly-Fuissé Les Petites Pierres', 'Pouilly-Fuissé, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Petit Chablis', 'Petit Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Chablis 1er Cru Fourchaume', 'Chablis Premier Cru, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Chablis 1er Cru Montée de Tonnerre', 'Chablis Premier Cru, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Chablis Grand Cru Blanchot', 'Chablis Grand Cru, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Chablis Grand Cru Les Preuses', 'Chablis Grand Cru, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Côte de Beaune-Villages', 'Côte de Beaune-Villages, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Saint-Romain', 'Saint-Romain, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Santenay Clos de Malte', 'Santenay, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Meursault', 'Meursault, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Meursault Les Narvaux', 'Meursault, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Meursault 1er Cru Perrières', 'Meursault, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Puligny-Montrachet', 'Puligny-Montrachet, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Puligny-Montrachet 1er Cru Clos de la Garenne', 'Puligny-Montrachet, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Puligny-Montrachet 1er Cru Les Combettes', 'Puligny-Montrachet, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Chassagne-Montrachet 1er Cru Les Chenevottes', 'Chassagne-Montrachet, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Beaune 1er Cru Clos des Ursules', 'Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Beaune 1er Cru Les Theurons', 'Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Beaune 1er Cru Les Grèves', 'Beaune, Burgundy, France', null, 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Beaune 1er Cru Grèves Le Clos Blanc', 'Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Beaune 1er Cru Bressandes Blanc', 'Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Pommard', 'Pommard, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Volnay 1er Cru Clos de la Barre', 'Volnay, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Corton-Charlemagne Grand Cru', 'Corton-Charlemagne, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Bâtard-Montrachet Grand Cru', 'Bâtard-Montrachet, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Chevalier-Montrachet Les Demoiselles Grand Cru', 'Chevalier-Montrachet, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Gevrey-Chambertin 1er Cru Clos Saint-Jacques', 'Gevrey-Chambertin, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Gevrey-Chambertin 1er Cru Les Cazetiers', 'Gevrey-Chambertin, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Chambolle-Musigny 1er Cru Les Feusselottes', 'Chambolle-Musigny, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Clos de Vougeot Grand Cru', 'Clos de Vougeot, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Échezeaux Grand Cru', 'Échezeaux, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Chambertin-Clos de Bèze Grand Cru', 'Chambertin-Clos de Bèze, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Bonnes-Mares Grand Cru', 'Bonnes-Mares, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Clos de la Roche Grand Cru', 'Clos de la Roche, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.vinissimus.com/es/bodega/maison-louis-jadot/
  ('Louis Jadot', 'Beaujolais-Villages', 'Beaujolais-Villages, Beaujolais, France', 'Gamay', 'Red')  -- https://www.lcbo.com/en/louis-jadot-beaujolais-villages-365924
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JOSEPH DROUHIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('Joseph Drouhin', 'Laforêt Bourgogne Chardonnay', 'Bourgogne, Burgundy, France', 'Chardonnay', 'White'),  -- https://drouhin.com/en_US/wine/laforet-bourgogne-chardonnay
  ('Joseph Drouhin', 'Chablis Réserve de Vaudon', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Chablis', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Chablis Premier Cru', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Chablis Premier Cru Sécher', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Chablis Grand Cru Vaudésir', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Chablis Grand Cru Bougros', 'Chablis, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/chablis
  ('Joseph Drouhin', 'Beaune Clos des Mouches Premier Cru Blanc', 'Beaune, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Beaune Clos des Mouches Premier Cru Rouge', 'Beaune, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Beaune Premier Cru Rouge', 'Beaune, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Côte de Beaune Blanc', 'Côte de Beaune, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Côte de Beaune Rouge', 'Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Meursault', 'Meursault, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Meursault Premier Cru Perrières', 'Meursault, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Meursault Premier Cru Charmes', 'Meursault, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Puligny-Montrachet', 'Puligny-Montrachet, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Puligny-Montrachet Premier Cru Folatières', 'Puligny-Montrachet, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Chassagne-Montrachet Blanc', 'Chassagne-Montrachet, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Chassagne-Montrachet Premier Cru Morgeot Marquis de Laguiche Blanc', 'Chassagne-Montrachet, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Montrachet Marquis de Laguiche Grand Cru', 'Montrachet, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Bâtard-Montrachet Grand Cru', 'Bâtard-Montrachet, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Corton-Charlemagne Grand Cru', 'Corton-Charlemagne, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Corton Grand Cru', 'Corton, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Saint-Romain', 'Saint-Romain, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Pommard', 'Pommard, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Volnay', 'Volnay, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Savigny-lès-Beaune', 'Savigny-lès-Beaune, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Chorey-lès-Beaune Rouge', 'Chorey-lès-Beaune, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaune
  ('Joseph Drouhin', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/nuits
  ('Joseph Drouhin', 'Chambolle-Musigny', 'Chambolle-Musigny, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/nuits
  ('Joseph Drouhin', 'Chambolle-Musigny Premier Cru', 'Chambolle-Musigny, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/nuits
  ('Joseph Drouhin', 'Vosne-Romanée', 'Vosne-Romanée, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/nuits
  ('Joseph Drouhin', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/nuits
  ('Joseph Drouhin', 'Côte de Nuits-Villages', 'Côte de Nuits-Villages, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/nuits
  ('Joseph Drouhin', 'Clos de Vougeot Grand Cru', 'Clos de Vougeot, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/nuits
  ('Joseph Drouhin', 'Griotte-Chambertin Grand Cru', 'Griotte-Chambertin, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/nuits
  ('Joseph Drouhin', 'Musigny Grand Cru', 'Musigny, Burgundy, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/nuits
  ('Joseph Drouhin', 'Mâcon-Villages Blanc', 'Mâcon-Villages, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/maconnais
  ('Joseph Drouhin', 'Saint-Véran', 'Saint-Véran, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/maconnais
  ('Joseph Drouhin', 'Pouilly-Fuissé', 'Pouilly-Fuissé, Burgundy, France', null, 'White'),  -- https://drouhin.com/en_US/wines-map/maconnais
  ('Joseph Drouhin', 'Beaujolais-Villages', 'Beaujolais-Villages, Beaujolais, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaujolais
  ('Joseph Drouhin', 'Morgon', 'Morgon, Beaujolais, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaujolais
  ('Joseph Drouhin', 'Fleurie', 'Fleurie, Beaujolais, France', null, 'Red'),  -- https://drouhin.com/en_US/wines-map/beaujolais
  ('Joseph Drouhin', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', null, 'Red')  -- https://drouhin.com/en_US/wines-map/beaujolais
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MAISON LOUIS LATOUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('Louis Latour', 'Ardèche Chardonnay', 'Coteaux de l''Ardèche, Rhône, France', 'Chardonnay', 'White'),  -- https://www.louislatour.com/en/wines/44/ardeche-chardonnay
  ('Louis Latour', 'Grand Ardèche', 'Coteaux de l''Ardèche, Rhône, France', null, 'White'),  -- https://www.louislatour.com/en/wines/61/grand-ardeche
  ('Louis Latour', 'Ardèche Viognier', 'Coteaux de l''Ardèche, Rhône, France', 'Viognier', 'White'),  -- https://www.louislatour.com/en/wines/182/ardeche-viognier
  ('Louis Latour', 'Valmoissine Pinot Noir', 'Var, Provence, France', 'Pinot Noir', 'Red'),  -- https://www.louislatour.com/en/wines/6/valmoissine-pinot-noir (IGP Var: https://winereviewonline.com/wine-review/maison-louis-latour-var-igp-provence-france-pinot-noir-valmoissine-2024-18-louis-latour-usa/)
  ('Louis Latour', 'Bourgogne Chardonnay', 'Bourgogne, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louislatour.com/en/wines/43/bourgogne-chardonnay
  ('Louis Latour', 'Bourgogne Pinot Noir', 'Bourgogne, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.louislatour.com/en/wines/94/bourgogne-pinot-noir
  ('Louis Latour', 'Bourgogne Blanc Cuvée Latour', 'Bourgogne, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/28/bourgogne-blanc-cuvee-latour
  ('Louis Latour', 'Bourgogne Rouge Cuvée Latour', 'Bourgogne, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/31/bourgogne-rouge-cuvee-latour
  ('Louis Latour', 'Mâcon-Lugny Les Genièvres', 'Mâcon-Lugny, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/63/macon-lugny-les-genievres
  ('Louis Latour', 'Mâcon-Villages Chameroy', 'Mâcon-Villages, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/65/macon-villages-chameroy
  ('Louis Latour', 'Pouilly-Fuissé', 'Pouilly-Fuissé, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/98/pouilly-fuisse
  ('Louis Latour', 'Saint-Véran Les Deux Moulins', 'Saint-Véran, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/111/saint-veran-les-deux-moulins
  ('Louis Latour', 'Montagny 1er Cru La Grande Roche', 'Montagny, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/80/montagny-1er-cru-la-grande-roche
  ('Louis Latour', 'Chablis La Chanfleure', 'Chablis, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/129/chablis-la-chanfleure
  ('Louis Latour', 'Chablis 1er Cru Fourchaume', 'Chablis, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/33/chablis-1er-cru-fourchaume
  ('Louis Latour', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/196/chablis-grand-cru-les-clos
  ('Louis Latour', 'Beaujolais-Villages', 'Beaujolais-Villages, Beaujolais, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/18/beaujolais-villages
  ('Louis Latour', 'Fleurie', 'Fleurie, Beaujolais, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/228/fleurie
  ('Louis Latour', 'Morgon', 'Morgon, Beaujolais, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/226/morgon
  ('Louis Latour', 'Mercurey Rouge', 'Mercurey, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/70/mercurey-rouge
  ('Louis Latour', 'Côte de Beaune-Villages', 'Côte de Beaune-Villages, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/3/cote-de-beaune-villages
  ('Louis Latour', 'Côte de Nuits-Villages', 'Côte de Nuits-Villages, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/4/cote-de-nuits-villages
  ('Louis Latour', 'Aloxe-Corton', 'Aloxe-Corton, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/231/aloxe-corton
  ('Louis Latour', 'Aloxe-Corton 1er Cru Les Chaillots', 'Aloxe-Corton, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/12/aloxe-corton-1er-cru-les-chaillots
  ('Louis Latour', 'Château Corton Grancey Grand Cru', 'Corton, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/51/chateau-corton-grancey-grand-cru
  ('Louis Latour', 'Corton Grand Cru Domaine Latour', 'Corton, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/2/corton-grand-cru-domaine-latour
  ('Louis Latour', 'Corton-Charlemagne Grand Cru', 'Corton-Charlemagne, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/56/corton-charlemagne-grand-cru
  ('Louis Latour', 'Beaune Blanc', 'Beaune, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/23/beaune-blanc
  ('Louis Latour', 'Beaune Rouge', 'Beaune, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/24/beaune-rouge
  ('Louis Latour', 'Beaune 1er Cru Vignes Franches', 'Beaune, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/22/beaune-1er-cru-vignes-franches
  ('Louis Latour', 'Pernand-Vergelesses 1er Cru Ile des Vergelesses', 'Pernand-Vergelesses, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/92/pernand-vergelesses-1er-cru-ile-des-vergelesses
  ('Louis Latour', 'Savigny-lès-Beaune Rouge', 'Savigny-lès-Beaune, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/117/savigny-les-beaune-rouge
  ('Louis Latour', 'Pommard', 'Pommard, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/97/pommard
  ('Louis Latour', 'Volnay', 'Volnay, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/120/volnay
  ('Louis Latour', 'Santenay Rouge', 'Santenay, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/114/santenay-rouge
  ('Louis Latour', 'Meursault Blanc', 'Meursault, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/73/meursault-blanc
  ('Louis Latour', 'Meursault 1er Cru Château de Blagny', 'Meursault, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/72/meursault-1er-cru-chateau-de-blagny
  ('Louis Latour', 'Meursault 1er Cru Genevrières', 'Meursault, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/75/meursault-1er-cru-genevrieres
  ('Louis Latour', 'Puligny-Montrachet', 'Puligny-Montrachet, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/104/puligny-montrachet
  ('Louis Latour', 'Puligny-Montrachet 1er Cru Les Referts', 'Puligny-Montrachet, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/102/puligny-montrachet-1er-cru-les-referts
  ('Louis Latour', 'Chassagne-Montrachet Blanc', 'Chassagne-Montrachet, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/50/chassagne-montrachet-blanc
  ('Louis Latour', 'Saint-Aubin', 'Saint-Aubin, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/110/saint-aubin
  ('Louis Latour', 'Bâtard-Montrachet Grand Cru', 'Bâtard-Montrachet, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/15/batard-montrachet-grand-cru
  ('Louis Latour', 'Chevalier-Montrachet Grand Cru Les Demoiselles', 'Chevalier-Montrachet, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/53/chevalier-montrachet-grand-cru-les-demoiselles
  ('Louis Latour', 'Montrachet Grand Cru', 'Montrachet, Burgundy, France', null, 'White'),  -- https://www.louislatour.com/en/wines/82/montrachet-grand-cru
  ('Louis Latour', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/58/gevrey-chambertin
  ('Louis Latour', 'Chambolle-Musigny', 'Chambolle-Musigny, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/41/chambolle-musigny
  ('Louis Latour', 'Vosne-Romanée', 'Vosne-Romanée, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/124/vosne-romanee
  ('Louis Latour', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/90/nuits-saint-georges
  ('Louis Latour', 'Clos Vougeot Grand Cru', 'Clos de Vougeot, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/55/clos-vougeot-grand-cru
  ('Louis Latour', 'Chambertin Grand Cru Cuvée Héritiers Latour', 'Chambertin, Burgundy, France', null, 'Red'),  -- https://www.louislatour.com/en/wines/40/chambertin-grand-cru-cuvee-heritiers-latour
  ('Louis Latour', 'Romanée-Saint-Vivant Grand Cru Les Quatre Journaux', 'Romanée-Saint-Vivant, Burgundy, France', null, 'Red')  -- https://www.louislatour.com/en/wines/107/romanee-saint-vivant-grand-cru-les-quatre-journaux
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BOUCHARD PÈRE & FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('Bouchard Père & Fils', 'Beaune Grèves Vigne de l''Enfant Jésus Premier Cru', 'Beaune, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Beaune Premier Cru Clos de la Mousse', 'Beaune, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Beaune Premier Cru Marconnets', 'Beaune, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Beaune Premier Cru Teurons', 'Beaune, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Beaune Premier Cru Les Grèves', 'Beaune, Burgundy, France', null, 'Red'),  -- https://www.caves-carriere.fr/brand/29-bouchard-pere-fils
  ('Bouchard Père & Fils', 'Beaune Premier Cru Les Avaux', 'Beaune, Burgundy, France', null, 'Red'),  -- https://fells.co.uk/our-producers/bouchard-pere-fils/
  ('Bouchard Père & Fils', 'Beaune du Château Premier Cru Rouge', 'Beaune, Burgundy, France', null, 'Red'),  -- https://fells.co.uk/our-producers/bouchard-pere-fils/
  ('Bouchard Père & Fils', 'Beaune du Château Premier Cru Blanc', 'Beaune, Burgundy, France', null, 'White'),  -- https://fells.co.uk/our-producers/bouchard-pere-fils/
  ('Bouchard Père & Fils', 'Beaune Premier Cru Clos Saint-Landry', 'Beaune, Burgundy, France', null, 'White'),  -- https://www.caves-carriere.fr/brand/29-bouchard-pere-fils
  ('Bouchard Père & Fils', 'Beaune Blanc', 'Beaune, Burgundy, France', null, 'White'),  -- https://www.caves-carriere.fr/brand/29-bouchard-pere-fils
  ('Bouchard Père & Fils', 'Bourgogne Chardonnay', 'Bourgogne, Burgundy, France', 'Chardonnay', 'White'),  -- https://fells.co.uk/our-producers/bouchard-pere-fils/
  ('Bouchard Père & Fils', 'La Vignée Bourgogne Pinot Noir', 'Bourgogne, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.nicks.com.au/2019-bouchard-pere-fils-la-vignee-bourgogne-pinot-noir
  ('Bouchard Père & Fils', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Burgundy, France', null, 'Red'),  -- https://fells.co.uk/our-producers/bouchard-pere-fils/
  ('Bouchard Père & Fils', 'Nuits-Saint-Georges Premier Cru Les Cailles', 'Nuits-Saint-Georges, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Nuits-Saint-Georges Premier Cru Les Porrets Saint-Georges', 'Nuits-Saint-Georges, Burgundy, France', null, 'Red'),  -- https://www.caves-carriere.fr/brand/29-bouchard-pere-fils
  ('Bouchard Père & Fils', 'Savigny-lès-Beaune Premier Cru Les Lavières', 'Savigny-lès-Beaune, Burgundy, France', null, 'Red'),  -- https://www.caves-carriere.fr/brand/29-bouchard-pere-fils
  ('Bouchard Père & Fils', 'Pommard Premier Cru', 'Pommard, Burgundy, France', null, 'Red'),  -- https://www.caves-carriere.fr/brand/29-bouchard-pere-fils
  ('Bouchard Père & Fils', 'Pommard Premier Cru Les Pézerolles', 'Pommard, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Pommard Premier Cru Rugiens', 'Pommard, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Volnay Premier Cru Caillerets Ancienne Cuvée Carnot', 'Volnay, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Volnay Premier Cru Clos des Chênes', 'Volnay, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Volnay Premier Cru En Chevret', 'Volnay, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Volnay Premier Cru Frémiets Clos de la Rougeotte', 'Volnay, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Volnay Premier Cru Taillepieds', 'Volnay, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Monthélie Premier Cru Les Duresses', 'Monthélie, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Gevrey-Chambertin Premier Cru Les Cazetiers', 'Gevrey-Chambertin, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Gevrey-Chambertin Premier Cru Lavaut Saint-Jacques', 'Gevrey-Chambertin, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Le Corton Grand Cru', 'Corton, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Chambertin Grand Cru', 'Chambertin, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Bonnes-Mares Grand Cru', 'Bonnes-Mares, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Clos de Vougeot Grand Cru', 'Clos de Vougeot, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Échézeaux Grand Cru', 'Échézeaux, Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Meursault', 'Meursault, Burgundy, France', null, 'White'),  -- https://fells.co.uk/our-producers/bouchard-pere-fils/
  ('Bouchard Père & Fils', 'Meursault Les Clous', 'Meursault, Burgundy, France', null, 'White'),  -- https://fells.co.uk/our-producers/bouchard-pere-fils/
  ('Bouchard Père & Fils', 'Meursault Premier Cru Genevrières', 'Meursault, Burgundy, France', null, 'White'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Meursault Premier Cru Perrières', 'Meursault, Burgundy, France', null, 'White'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Meursault Premier Cru Charmes', 'Meursault, Burgundy, France', null, 'White'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Meursault Premier Cru Les Gouttes d''Or', 'Meursault, Burgundy, France', null, 'White'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Chassagne-Montrachet Premier Cru En Remilly', 'Chassagne-Montrachet, Burgundy, France', null, 'White'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Corton-Charlemagne Grand Cru', 'Corton-Charlemagne, Burgundy, France', null, 'White'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Chevalier-Montrachet Grand Cru', 'Chevalier-Montrachet, Burgundy, France', null, 'White'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Chevalier-Montrachet Grand Cru La Cabotte', 'Chevalier-Montrachet, Burgundy, France', null, 'White'),  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
  ('Bouchard Père & Fils', 'Montrachet Grand Cru', 'Montrachet, Burgundy, France', null, 'White')  -- https://idealwine.com/en/buy-wine/domain-Bouchard%20P%C3%A8re%20%26%20Fils%20(domaine)
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GEORGES DUBOEUF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('Georges Duboeuf', 'Beaujolais', 'Beaujolais, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Beaujolais-Villages', 'Beaujolais-Villages, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Beaujolais Signature', 'Beaujolais, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/region/beaujolais/
  ('Georges Duboeuf', 'Beaujolais-Villages Signature', 'Beaujolais-Villages, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/region/beaujolais/
  ('Georges Duboeuf', 'Beaujolais Blanc', 'Beaujolais, Beaujolais, France', null, 'White'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Beaujolais Rosé Comme un Air de Rosé', 'Beaujolais, Beaujolais, France', null, 'Rosé'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Régnié', 'Régnié, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Brouilly', 'Brouilly, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Brouilly Château de Nervers', 'Brouilly, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/region/beaujolais/
  ('Georges Duboeuf', 'Brouilly Pisse Vieille', 'Brouilly, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/region/beaujolais/
  ('Georges Duboeuf', 'Côte de Brouilly', 'Côte de Brouilly, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Chénas', 'Chénas, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Chiroubles', 'Chiroubles, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Fleurie', 'Fleurie, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Fleurie Cuvée Prestige', 'Fleurie, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/prestige-en/
  ('Georges Duboeuf', 'Fleurie Domaine des Quatre Vents', 'Fleurie, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/region/beaujolais/
  ('Georges Duboeuf', 'Juliénas', 'Juliénas, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Morgon', 'Morgon, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Morgon Cuvée Prestige', 'Morgon, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/prestige-en/
  ('Georges Duboeuf', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Moulin-à-Vent Élevé en Fût de Chêne', 'Moulin-à-Vent, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Moulin-à-Vent Cuvée Prestige', 'Moulin-à-Vent, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/prestige-en/
  ('Georges Duboeuf', 'Saint-Amour', 'Saint-Amour, Beaujolais, France', null, 'Red'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Mâcon-Villages Blanc', 'Mâcon-Villages, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/maconnais/
  ('Georges Duboeuf', 'Mâcon-Villages Blanc Signature', 'Mâcon-Villages, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/maconnais/
  ('Georges Duboeuf', 'Pouilly-Fuissé', 'Pouilly-Fuissé, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/maconnais/
  ('Georges Duboeuf', 'Pouilly-Fuissé Signature', 'Pouilly-Fuissé, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/maconnais/
  ('Georges Duboeuf', 'Pouilly-Fuissé Premier Cru', 'Pouilly-Fuissé, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/maconnais/
  ('Georges Duboeuf', 'Pouilly-Fuissé Élevé en Fût de Chêne', 'Pouilly-Fuissé, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/maconnais/
  ('Georges Duboeuf', 'Pouilly-Fuissé Cuvée Prestige', 'Pouilly-Fuissé, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/collection/prestige-en/
  ('Georges Duboeuf', 'Saint-Véran', 'Saint-Véran, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/maconnais/
  ('Georges Duboeuf', 'Saint-Véran Signature', 'Saint-Véran, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/maconnais/
  ('Georges Duboeuf', 'Saint-Véran Cuvée Prestige', 'Saint-Véran, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/maconnais/
  ('Georges Duboeuf', 'Viré-Clessé', 'Viré-Clessé, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/collection/flowers/
  ('Georges Duboeuf', 'Bourgogne Aligoté', 'Bourgogne Aligoté, Burgundy, France', null, 'White'),  -- https://www.duboeuf.com/en/region/burgundy/
  ('Georges Duboeuf', 'Crémant de Bourgogne Brut', 'Crémant de Bourgogne, Burgundy, France', null, 'Sparkling')  -- https://www.duboeuf.com/en/region/burgundy/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GÉRARD BERTRAND ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('Gérard Bertrand', 'Côte des Roses Rosé', 'Pays d''Oc, Languedoc-Roussillon, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Gris Blanc', 'Pays d''Oc, Languedoc-Roussillon, France', null, 'Rosé'),  -- https://www.gerard-bertrand.com/en/products/gris-blanc-with-cork-2025-lot-12-bottles-75cl-1
  ('Gérard Bertrand', 'Clos d''Ora', 'Minervois La Livinière, Languedoc-Roussillon, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Château l''Hospitalet Grand Vin Rouge', 'La Clape, Languedoc-Roussillon, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'L''Hospitalitas', 'La Clape, Languedoc-Roussillon, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Cigalus Rouge', 'Aude Hauterive, Languedoc-Roussillon, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Cigalus Blanc', 'Aude Hauterive, Languedoc-Roussillon, France', null, 'White'),  -- https://gerard-bertrand.com/en/collections/haute-collection-vin-biodynamie/color:blanc?page=3
  ('Gérard Bertrand', 'La Forge', 'Corbières-Boutenac, Languedoc-Roussillon, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Le Viala', 'Minervois La Livinière, Languedoc-Roussillon, France', null, 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Clos du Temple', 'Languedoc Cabrières, Languedoc-Roussillon, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Art de Vivre Rosé', 'Languedoc, Languedoc-Roussillon, France', null, 'Rosé'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Art de Vivre Clairette du Languedoc', 'Clairette du Languedoc, Languedoc-Roussillon, France', null, 'White'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Domaine de l''Aigle Chardonnay', 'Limoux, Languedoc-Roussillon, France', 'Chardonnay', 'White'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Domaine de l''Aigle Pinot Noir', 'Haute Vallée de l''Aude, Languedoc-Roussillon, France', 'Pinot Noir', 'Red'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Crémant de Limoux', 'Crémant de Limoux, Languedoc-Roussillon, France', 'Chardonnay/Pinot Noir', 'Sparkling'),  -- https://www.avenuedesvins.fr/en/shop/domaine-gerard-bertrand
  ('Gérard Bertrand', 'Code Rouge Brut Eternel', 'Crémant de Limoux, Languedoc-Roussillon, France', null, 'Sparkling'),  -- https://www.gerard-bertrand.com/en/products/code-rouge-brut-eternel-6x75cl-cremant-de-limoux-non-vintage
  ('Gérard Bertrand', 'Source of Joy Rosé', 'Languedoc, Languedoc-Roussillon, France', null, 'Rosé'),  -- https://www.gerard-bertrand.com/en/products/source-of-joy-2025-organic-vegan-rose-wine-75cl
  ('Gérard Bertrand', 'Héritage An 1130 Blanc', 'Cité de Carcassonne, Languedoc-Roussillon, France', null, 'White'),  -- https://www.gerard-bertrand.com/en/products/heritage-an-1130-white-wine-cite-de-carcassonne-2025-75cl
  ('Gérard Bertrand', 'Hampton Water Rosé', 'Pays d''Oc, Languedoc-Roussillon, France', null, 'Rosé')  -- https://gerard-bertrand.com/en/collections/hampton-water
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ALBERT BICHOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_france.sql)'
from (values
  ('Albert Bichot', 'Chablis', 'Chablis, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Pouilly-Fuissé', 'Pouilly-Fuissé, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Pouilly-Fuissé Premier Cru Clos Reyssié', 'Pouilly-Fuissé, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Bourgogne Chardonnay Origines', 'Bourgogne, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Bourgogne Pinot Noir Origines', 'Bourgogne, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Beaujolais-Villages Parcellaire', 'Beaujolais-Villages, Beaujolais, France', null, 'Red'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Secret de Famille Bourgogne Côte d''Or Chardonnay', 'Bourgogne Côte d''Or, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Mâcon-Lugny Les Charmes', 'Mâcon-Lugny, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Saint-Véran', 'Saint-Véran, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Puligny-Montrachet', 'Puligny-Montrachet, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Fixin', 'Fixin, Burgundy, France', null, 'Red'),  -- https://www.alliancewine.com/albert-bichot/chablis-2025-7210
  ('Albert Bichot', 'Domaine Long-Depaquit Chablis', 'Chablis, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/our-producers/domaine-long-depaquit
  ('Albert Bichot', 'Domaine Long-Depaquit Chablis Premier Cru Les Vaillons', 'Chablis, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/our-producers/domaine-long-depaquit
  ('Albert Bichot', 'Domaine Long-Depaquit Chablis Grand Cru Les Vaudésirs', 'Chablis, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/our-producers/domaine-long-depaquit
  ('Albert Bichot', 'Domaine Long-Depaquit Chablis Premier Cru Les Vaucopins', 'Chablis, Burgundy, France', null, 'White'),  -- https://www.bbr.com/products-20148232407-2014-chablis-les-vaucopins-albert-bichot
  ('Albert Bichot', 'Domaine Long-Depaquit Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', null, 'White'),  -- https://wine.com/product/Albert-Bichot-Chablis-Les-Clos-Grand-Cru-Domaine-Long-Depaquit-2020/1186912
  ('Albert Bichot', 'Domaine Long-Depaquit Chablis Grand Cru Les Blanchots', 'Chablis, Burgundy, France', null, 'White'),  -- https://www.wine.com/product/albert-bichot-chablis-les-blanchots-grand-cru-domaine-long-depaquit-2014/491255
  ('Albert Bichot', 'Domaine du Clos Frantin Nuits-Saint-Georges', 'Nuits-Saint-Georges, Burgundy, France', null, 'Red'),  -- https://www.alliancewine.com/our-producers/domaine-du-clos-frantin
  ('Albert Bichot', 'Domaine du Clos Frantin Gevrey-Chambertin Les Murots', 'Gevrey-Chambertin, Burgundy, France', null, 'Red'),  -- https://www.alliancewine.com/our-producers/domaine-du-clos-frantin
  ('Albert Bichot', 'Domaine du Clos Frantin Chambertin Grand Cru', 'Chambertin, Burgundy, France', null, 'Red'),  -- https://www.alliancewine.com/our-producers/domaine-du-clos-frantin
  ('Albert Bichot', 'Domaine du Pavillon Meursault', 'Meursault, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/our-producers/domaine-du-pavillon
  ('Albert Bichot', 'Domaine du Pavillon Meursault Premier Cru Les Charmes', 'Meursault, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/our-producers/domaine-du-pavillon
  ('Albert Bichot', 'Domaine du Pavillon Corton-Charlemagne Grand Cru', 'Corton-Charlemagne, Burgundy, France', null, 'White'),  -- https://www.alliancewine.com/our-producers/domaine-du-pavillon
  ('Albert Bichot', 'Domaine du Pavillon Volnay Premier Cru Les Santenots', 'Volnay, Burgundy, France', null, 'Red')  -- https://www.alliancewine.com/our-producers/domaine-du-pavillon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
