-- Producer ranges round 9: beaujolais. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- MARCEL LAPIERRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Marcel Lapierre', 'Raisins Gaulois', 'Vin de France, France', 'Gamay', 'Red'),  -- https://wineanorak.com/beaujolais/MarcelLapierre.htm
  ('Marcel Lapierre', 'Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://wineanorak.com/beaujolais/MarcelLapierre.htm
  ('Marcel Lapierre', 'Morgon Cuvée Camille', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://wineanorak.com/beaujolais/MarcelLapierre.htm
  ('Marcel Lapierre', 'Morgon Cuvée Marcel Lapierre', 'Morgon, Beaujolais, France', 'Gamay', 'Red')  -- https://wineanorak.com/beaujolais/MarcelLapierre.htm
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JULIEN SUNIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Julien Sunier', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.polanerselections.com/?p=24951
  ('Julien Sunier', 'Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.polanerselections.com/?p=24951
  ('Julien Sunier', 'Régnié', 'Régnié, Beaujolais, France', 'Gamay', 'Red')  -- https://www.polanerselections.com/?p=24951
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GUY BRETON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Guy Breton', 'Régnié', 'Régnié, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/06-2020/profile-guy-breton/
  ('Guy Breton', 'Chiroubles Cuvée Léa', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/06-2020/profile-guy-breton/
  ('Guy Breton', 'Morgon Vieilles Vignes', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/06-2020/profile-guy-breton/
  ('Guy Breton', 'Côte de Brouilly', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/06-2020/profile-guy-breton/
  ('Guy Breton', 'Morgon Petit Max', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/06-2020/profile-guy-breton/
  ('Guy Breton', 'Chiroubles', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/guy-breton
  ('Guy Breton', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/guy-breton
  ('Guy Breton', 'Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red')  -- https://www.vivino.com/wineries/guy-breton
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU THIVIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Château Thivin', 'Côte de Brouilly Le Clos', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Côte de Brouilly Cuvée La Chapelle', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Côte de Brouilly Cuvée Zaccharie', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Côte de Brouilly Les Sept Vignes', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Côte de Brouilly Clos Bertrand', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Côte de Brouilly Cuvée Godefroy', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Côte de Brouilly Les Griottes de Brulhié', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Brouilly Reverdon', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Beaujolais Blanc Clos de Rochebonne', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Beaujolais Blanc Marguerite', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Beaujolais-Villages Vignes d''Ecussol', 'Beaujolais-Villages, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
  ('Château Thivin', 'Beaujolais Rosé', 'Beaujolais, France', null, 'Rosé')  -- https://www.idealwine.com/uk/domain/2506-Chateau-Thivin.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LAFARGE-VIAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Lafarge-Vial', 'Chiroubles', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.beckywasserman.com/domaines/lafarge-vial/
  ('Domaine Lafarge-Vial', 'Côte de Brouilly Bruhlie', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.beckywasserman.com/domaines/lafarge-vial/
  ('Domaine Lafarge-Vial', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.beckywasserman.com/domaines/lafarge-vial/
  ('Domaine Lafarge-Vial', 'Fleurie Joie du Palais', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.beckywasserman.com/domaines/lafarge-vial/
  ('Domaine Lafarge-Vial', 'Fleurie Clos Vernay', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.beckywasserman.com/domaines/lafarge-vial/
  ('Domaine Lafarge-Vial', 'Côte de Brouilly', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red')  -- https://www.bbr.com/producer-3447-lafarge-vial
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JULES DESJOURNEYS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Jules Desjourneys', 'Moulin-à-Vent Ni Trop Ni Trop Peu', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780
  ('Domaine Jules Desjourneys', 'Morgon Ni Trop Ni Trop Peu', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780
  ('Domaine Jules Desjourneys', 'Fleurie Ni Trop Ni Trop Peu', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780
  ('Domaine Jules Desjourneys', 'Chénas Jugement Dernier', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780
  ('Domaine Jules Desjourneys', 'Moulin-à-Vent Le Styx', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780
  ('Domaine Jules Desjourneys', 'Fleurie Les Moriers', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780?p=2
  ('Domaine Jules Desjourneys', 'Fleurie Chapelle des Bois', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780?p=2
  ('Domaine Jules Desjourneys', 'Fleurie Madone', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780?p=2
  ('Domaine Jules Desjourneys', 'Moulin-à-Vent Les Michelons', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780?p=2
  ('Domaine Jules Desjourneys', 'Moulin-à-Vent Chassignol', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780?p=2
  ('Domaine Jules Desjourneys', 'Fleurie Noli Me Tangere', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780?p=2
  ('Domaine Jules Desjourneys', 'Moulin-à-Vent L''Ephémère', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780?p=2
  ('Domaine Jules Desjourneys', 'Fleurie Sacré Graal', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jules-desjourneys/id/11780?p=3
  ('Domaine Jules Desjourneys', 'Beaujolais Pataphysique', 'Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7337-Jules-Desjourneys.jsp
  ('Domaine Jules Desjourneys', 'Beaujolais', 'Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7337-Jules-Desjourneys.jsp
  ('Domaine Jules Desjourneys', 'Beaujolais-Villages Blanc', 'Beaujolais-Villages, Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/7337-Jules-Desjourneys.jsp
  ('Domaine Jules Desjourneys', 'Songe', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7337-Jules-Desjourneys.jsp
  ('Domaine Jules Desjourneys', 'L''Interdit', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7337-Jules-Desjourneys.jsp
  ('Domaine Jules Desjourneys', 'Omar', 'Vin de France, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/7337-Jules-Desjourneys.jsp
  ('Domaine Jules Desjourneys', 'Cinétique Pétillant Naturel', 'Vin de France, France', null, 'Sparkling')  -- https://www.idealwine.com/uk/domain/7337-Jules-Desjourneys.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MEE GODARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Mee Godard', 'Beaujolais Blanc', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/7248-Mee-Godard.jsp
  ('Domaine Mee Godard', 'Beaujolais-Villages', 'Beaujolais-Villages, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7248-Mee-Godard.jsp
  ('Domaine Mee Godard', 'Fleurie Madone', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7248-Mee-Godard.jsp
  ('Domaine Mee Godard', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7248-Mee-Godard.jsp
  ('Domaine Mee Godard', 'Moulin-à-Vent Au Michelon', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7248-Mee-Godard.jsp
  ('Domaine Mee Godard', 'Morgon Corcelette', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7248-Mee-Godard.jsp
  ('Domaine Mee Godard', 'Morgon Côte du Py', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7248-Mee-Godard.jsp
  ('Domaine Mee Godard', 'Morgon Grand Cras', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7248-Mee-Godard.jsp
  ('Domaine Mee Godard', 'Morgon Côte du Py Passerelle 577', 'Morgon, Beaujolais, France', 'Gamay', 'Red')  -- https://www.idealwine.com/uk/domain/7248-Mee-Godard.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA GROSSE PIERRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine de la Grosse Pierre', 'Chiroubles', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vin-bio-ardoneo.com/en/553-domaine-de-la-grosse-pierre
  ('Domaine de la Grosse Pierre', 'Chiroubles Claudius', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vin-bio-ardoneo.com/en/553-domaine-de-la-grosse-pierre
  ('Domaine de la Grosse Pierre', 'Chiroubles Aux Craz', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vin-bio-ardoneo.com/en/553-domaine-de-la-grosse-pierre
  ('Domaine de la Grosse Pierre', 'Chiroubles Grillé du Midi', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vin-bio-ardoneo.com/en/553-domaine-de-la-grosse-pierre
  ('Domaine de la Grosse Pierre', 'Fleurie Bel Air', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vin-bio-ardoneo.com/en/553-domaine-de-la-grosse-pierre
  ('Domaine de la Grosse Pierre', 'Morgon Douby', 'Morgon, Beaujolais, France', 'Gamay', 'Red')  -- https://www.vin-bio-ardoneo.com/en/553-domaine-de-la-grosse-pierre
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DE LA ROILETTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Clos de la Roilette', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7395-Clos-de-la-Roilette.jsp
  ('Clos de la Roilette', 'Fleurie Cuvée Tardive', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7395-Clos-de-la-Roilette.jsp
  ('Clos de la Roilette', 'Fleurie Griffe du Marquis', 'Fleurie, Beaujolais, France', 'Gamay', 'Red')  -- https://www.idealwine.com/uk/domain/7395-Clos-de-la-Roilette.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JULIE BALAGNY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Julie Balagny', 'Toccata', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'François', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Minouche', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Docteur Briçou', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Docteur Buchaille', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'En Rémont', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Simone', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Cayenne', 'Vin de France, France', null, 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Popette', 'Vin de France, France', null, 'Sparkling'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Fleurie Dancing Queen', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Fleurie Cayenne', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Fleurie En Rémont', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Fleurie Simone', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Fleurie O Bella Ciao', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Fleurie Sex Appeal', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Fleurie Chavot', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Fleurie La Grande Rose', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Fleurie La Carioca', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
  ('Julie Balagny', 'Moulin-à-Vent Docteur Buchaille', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red')  -- https://www.idealwine.com/uk/domain/7244-Julie-Balagny.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CHIGNARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Chignard', 'Fleurie Les Moriers', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.bbr.com/products-20191244946-2019-fleurie-les-moriers-domaine-chignard-beaujolais
  ('Domaine Chignard', 'Beaujolais-Villages Rosé', 'Beaujolais-Villages, Beaujolais, France', 'Gamay', 'Rosé'),  -- https://www.domaine-chignard.com/
  ('Domaine Chignard', 'Fleurie Cuvée Spéciale', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-chignard.com/
  ('Domaine Chignard', 'Juliénas Beauvernay', 'Juliénas, Beaujolais, France', 'Gamay', 'Red')  -- https://www.domaine-chignard.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GEORGES DUBOEUF ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Georges Duboeuf', 'Brouilly Fleur', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Brouilly Signature', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Domaine de Lafayette Brouilly', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Fleurie Fleur', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Fleurie Signature', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Domaine Quatre Vents Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Saint-Amour Fleur', 'Saint-Amour, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Morgon Fleur', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Morgon Signature', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Domaine Javernière Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Domaine Versauds Morgon Corcelette', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Domaine Versauds Morgon Les Charmes', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Juliénas Fleur', 'Juliénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Juliénas Signature', 'Juliénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Château des Capitans Juliénas', 'Juliénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Château des Poupets Juliénas', 'Juliénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Chénas Les Darroux', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Moulin-à-Vent Fleur', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Moulin-à-Vent Signature', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Domaine des Rosiers Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Domaine du Pourpre Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Moulin-à-Vent Élevé en Fût de Chêne', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=91281
  ('Georges Duboeuf', 'Beaujolais Rosé Comme Un Air De Rosé', 'Beaujolais, France', null, 'Rosé')  -- https://www.duboeuf.com/en/wines/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DES JACQUES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Château des Jacques', 'Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-des-jacques.fr/en/wines
  ('Château des Jacques', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-des-jacques.fr/en/wines
  ('Château des Jacques', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-des-jacques.fr/en/wines
  ('Château des Jacques', 'Moulin-à-Vent La Roche', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-des-jacques.fr/en/wines
  ('Château des Jacques', 'Moulin-à-Vent Clos du Grand Carquelin', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-des-jacques.fr/en/wines
  ('Château des Jacques', 'Moulin-à-Vent Clos des Thorins', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-des-jacques.fr/en/wines
  ('Château des Jacques', 'Moulin-à-Vent Clos de Rochegrès', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-des-jacques.fr/en/wines
  ('Château des Jacques', 'Moulin-à-Vent Le Moulin', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-des-jacques.fr/en/wines
  ('Château des Jacques', 'Morgon Côte du Py', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-des-jacques.fr/en/wines
  ('Château des Jacques', 'Beaujolais Blanc', 'Beaujolais, France', 'Chardonnay', 'White')  -- https://www.chateau-des-jacques.fr/en/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HENRY FESSY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Henry Fessy', 'Beaujolais Blanc', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://wine-pages.com/tasting-articles/henry-fessy-of-beaujolais/
  ('Henry Fessy', 'Régnié Château des Reyssiers', 'Régnié, Beaujolais, France', 'Gamay', 'Red'),  -- https://wine-pages.com/tasting-articles/henry-fessy-of-beaujolais/
  ('Henry Fessy', 'Brouilly', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://wine-pages.com/tasting-articles/henry-fessy-of-beaujolais/
  ('Henry Fessy', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://wine-pages.com/tasting-articles/henry-fessy-of-beaujolais/
  ('Henry Fessy', 'Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://wine-pages.com/tasting-articles/henry-fessy-of-beaujolais/
  ('Henry Fessy', 'Fleurie Château des Labourons', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://wine-pages.com/tasting-articles/henry-fessy-of-beaujolais/
  ('Henry Fessy', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://wine-pages.com/tasting-articles/henry-fessy-of-beaujolais/
  ('Henry Fessy', 'Juliénas', 'Juliénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://wine-pages.com/tasting-articles/henry-fessy-of-beaujolais/
  ('Henry Fessy', 'Brouilly Les Brûlées', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://wine-pages.com/tasting-articles/henry-fessy-of-beaujolais/
  ('Henry Fessy', 'Régnié', 'Régnié, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/09-2016/henry-fessy-beaujolais/
  ('Henry Fessy', 'Chiroubles', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/09-2016/henry-fessy-beaujolais/
  ('Henry Fessy', 'Côte de Brouilly', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red')  -- https://www.burgundy-report.com/burgundy-report-extra/09-2016/henry-fessy-beaujolais/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN-MARC BURGAUD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Jean-Marc Burgaud', 'Morgon Grand Cras', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=109832
  ('Domaine Jean-Marc Burgaud', 'Morgon Les Charmes', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=109832
  ('Domaine Jean-Marc Burgaud', 'Morgon Corcelettes', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=109832
  ('Domaine Jean-Marc Burgaud', 'Morgon Côte du Py', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=109832
  ('Domaine Jean-Marc Burgaud', 'Morgon Côte du Py Javernières', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=109832
  ('Domaine Jean-Marc Burgaud', 'Morgon Côte du Py James', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=109832
  ('Domaine Jean-Marc Burgaud', 'Beaujolais-Villages Lantignié Blanc', 'Beaujolais-Villages, Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=109832
  ('Domaine Jean-Marc Burgaud', 'Beaujolais Blanc Les Vignes de Lantignié', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean_Marc%20Burgaud
  ('Domaine Jean-Marc Burgaud', 'Morgon Chollet', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean_Marc%20Burgaud
  ('Domaine Jean-Marc Burgaud', 'Morgon Côte du Py Cuvée 357', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean_Marc%20Burgaud
  ('Domaine Jean-Marc Burgaud', 'Morgon Côte du Py Réserve', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean_Marc%20Burgaud
  ('Domaine Jean-Marc Burgaud', 'Morgon Réserve', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean_Marc%20Burgaud
  ('Domaine Jean-Marc Burgaud', 'Morgon Ruyère', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean_Marc%20Burgaud
  ('Domaine Jean-Marc Burgaud', 'Régnié Vallières', 'Régnié, Beaujolais, France', 'Gamay', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Jean_Marc%20Burgaud
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PIRON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Piron', 'Beaujolais Blanc', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
  ('Domaine Piron', 'Beaujolais Les Cadoles', 'Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
  ('Domaine Piron', 'Beaujolais-Villages', 'Beaujolais-Villages, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
  ('Domaine Piron', 'Morgon Grand Cras', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
  ('Domaine Piron', 'Morgon Les Charmes', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
  ('Domaine Piron', 'Morgon Côte du Py', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
  ('Domaine Piron', 'Fleurie La Madone', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
  ('Domaine Piron', 'Brouilly', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
  ('Domaine Piron', 'Saint-Amour', 'Saint-Amour, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
  ('Domaine Piron', 'Chénas Quartz', 'Chénas, Beaujolais, France', 'Gamay', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Dominique%20Piron
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DU MOULIN-À-VENT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Château du Moulin-à-Vent', 'Moulin-à-Vent Croix des Vérillats', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Chateau%20du%20Moulin%20a%20Vent
  ('Château du Moulin-à-Vent', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Chateau%20du%20Moulin%20a%20Vent
  ('Château du Moulin-à-Vent', 'Moulin-à-Vent Champ de Cour', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Chateau%20du%20Moulin%20a%20Vent
  ('Château du Moulin-à-Vent', 'Moulin-à-Vent Couvent des Thorins', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Chateau%20du%20Moulin%20a%20Vent
  ('Château du Moulin-à-Vent', 'Moulin-à-Vent Vieilles Vignes', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Chateau%20du%20Moulin%20a%20Vent
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE THILLARDON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Thillardon', 'Chénas Les Carrières', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=102619
  ('Domaine Thillardon', 'Chénas Vibrations', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=102619
  ('Domaine Thillardon', 'Chénas Les Blémonts', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=102619
  ('Domaine Thillardon', 'Chénas Chassignol', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=102619
  ('Domaine Thillardon', 'Moulin-à-Vent Sous la Roche', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=102619
  ('Domaine Thillardon', 'Moulin-à-Vent Alizés', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=102619
  ('Domaine Thillardon', 'Cuvée Georges', 'Vin de France, France', null, 'White'),  -- https://www.burgundy-report.com/?p=102619
  ('Domaine Thillardon', 'Chénas Coup Double', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Thillardon
  ('Domaine Thillardon', 'Chénas Les Bocards', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Thillardon
  ('Domaine Thillardon', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red')  -- https://idealwine.com/en/buy-wine/domain-Thillardon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GEORGES DESCOMBES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Georges Descombes', 'Beaujolais Cuvée Gigi', 'Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Brouilly', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Brouilly Vieilles Vignes', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Chiroubles', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Chiroubles Vieilles Vignes', 'Chiroubles, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Fleurie Vieilles Vignes', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Morgon Manon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Morgon Cuvée Vermont', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Morgon Vieilles Vignes', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Régnié', 'Régnié, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Régnié Vieilles Vignes', 'Régnié, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Saint-Amour Vieilles Vignes', 'Saint-Amour, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Beaujolais Blanc', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
  ('Georges Descombes', 'Chardonnay Macération', 'Vin de France, France', 'Chardonnay', 'Orange')  -- https://www.idealwine.com/en/buy-wine/domain-Georges%20Descombes
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES TERRES DORÉES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine des Terres Dorées', 'Côte de Brouilly', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Saint-Amour', 'Saint-Amour, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Fleurie Grille-Midi', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Fleurie Les Garants', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Morgon Côte du Py Javernières', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Moulin-à-Vent La Rochelle', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Moulin-à-Vent Les Thorins', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Beaujolais Rosé de Folie', 'Beaujolais, France', null, 'Rosé'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Beaujolais Chardonnay Classic', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'Beaujolais Blanc', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=110194
  ('Domaine des Terres Dorées', 'FRV100', 'Vin de France, France', null, 'Sparkling')  -- https://www.burgundy-report.com/burgundy-report-extra/02-2020/des-terres-dorees-2018/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE LA CHAIZE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Château de la Chaize', 'Côte de Brouilly Chavannes', 'Côte de Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://vintus.com/wines/chateau-de-la-chaize-cote-de-brouilly-chavannes/
  ('Château de la Chaize', 'Fleurie La Chapelle des Bois', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://vintus.com/wines/chateau-de-la-chaize-cote-de-brouilly-chavannes/
  ('Château de la Chaize', 'Fleurie Clos de la Chapelle des Bois', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://vintus.com/wines/chateau-de-la-chaize-cote-de-brouilly-chavannes/
  ('Château de la Chaize', 'Brouilly Clos de la Chaize', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://vintus.com/wines/chateau-de-la-chaize-cote-de-brouilly-chavannes/
  ('Château de la Chaize', 'Brouilly La Chaize Monopole', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://vintus.com/wines/chateau-de-la-chaize-cote-de-brouilly-chavannes/
  ('Château de la Chaize', 'Brouilly', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://vintus.com/wines/chateau-de-la-chaize-cote-de-brouilly-chavannes/
  ('Château de la Chaize', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://vintus.com/wines/chateau-de-la-chaize-cote-de-brouilly-chavannes/
  ('Château de la Chaize', 'Brouilly Vieilles Vignes', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/02-2017/profile-chateau-de-la-chaize/
  ('Château de la Chaize', 'Brouilly Combiliaty', 'Brouilly, Beaujolais, France', 'Gamay', 'Red')  -- https://www.12bouteilles.com/en/709-chateau-de-la-chaize
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JEAN-PAUL THÉVENET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Jean-Paul Thévenet', 'Morgon Cuvée Tradition', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/jean-paul-thevenet
  ('Jean-Paul Thévenet', 'Morgon Vieilles Vignes', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/jean-paul-thevenet
  ('Jean-Paul Thévenet', 'Morgon Le Clachet', 'Morgon, Beaujolais, France', 'Gamay', 'Red')  -- https://www.vivino.com/wineries/jean-paul-thevenet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JEAN FOILLARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Jean Foillard', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/jean-paul-thevenet
  ('Jean Foillard', 'Morgon Côte du Py', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/jean-paul-thevenet
  ('Jean Foillard', 'Morgon Cuvée Corcelette', 'Morgon, Beaujolais, France', 'Gamay', 'Red')  -- https://www.vivino.com/wineries/jean-paul-thevenet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CHARLY THÉVENET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Charly Thévenet', 'Régnié En Voiture Simone', 'Régnié, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/charly-thevenet
  ('Domaine Charly Thévenet', 'Régnié Grain & Granit', 'Régnié, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/charly-thevenet
  ('Domaine Charly Thévenet', 'Morgon La Roche Pilée', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/charly-thevenet
  ('Domaine Charly Thévenet', 'Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/charly-thevenet
  ('Domaine Charly Thévenet', 'Morgon Vieilles Vignes', 'Morgon, Beaujolais, France', 'Gamay', 'Red')  -- https://www.vivino.com/wineries/charly-thevenet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PAUL JANIN ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Paul Janin et Fils', 'Moulin-à-Vent Les Greneriers', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/paul-janin
  ('Paul Janin et Fils', 'Moulin-à-Vent Héritage', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/paul-janin
  ('Paul Janin et Fils', 'Moulin-à-Vent Empreinte', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/paul-janin
  ('Paul Janin et Fils', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/paul-janin
  ('Paul Janin et Fils', 'Moulin-à-Vent Héritage du Tremblay', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/paul-janin
  ('Paul Janin et Fils', 'Moulin-à-Vent Des Vignes du Tremblay', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/paul-janin
  ('Paul Janin et Fils', 'Moulin-à-Vent Saprolite', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/paul-janin
  ('Paul Janin et Fils', 'Moulin-à-Vent Clos du Tremblay', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/paul-janin
  ('Paul Janin et Fils', 'Chénas', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/paul-janin
  ('Paul Janin et Fils', 'Brouilly', 'Brouilly, Beaujolais, France', 'Gamay', 'Red')  -- https://www.vivino.com/wineries/paul-janin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DUTRAIVE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Dutraive', 'Fleurie La Madone', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/dutraive
  ('Domaine Dutraive', 'Fleurie Cuvée Vieilles Vignes', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/dutraive
  ('Domaine Dutraive', 'Fleurie Le Clos', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/dutraive
  ('Domaine Dutraive', 'Fleurie Champagne', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/dutraive
  ('Domaine Dutraive', 'Fleurie Cuvée Viticole Tous Ensemble', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/dutraive
  ('Domaine Dutraive', 'Saint-Amour Clos du Chapitre', 'Saint-Amour, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/dutraive
  ('Domaine Dutraive', 'Brouilly Cuvée Vieilles Vignes', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/dutraive
  ('Domaine Dutraive', 'Fleurie Chapelle des Bois', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/dutraive
  ('Domaine Dutraive', 'Chénas Les Perelles', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/dutraive
  ('Domaine Dutraive', 'Fleurie Clos de la Grand''Cour', 'Fleurie, Beaujolais, France', 'Gamay', 'Red')  -- https://www.vivino.com/wineries/dutraive
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE YVON MÉTRAS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Yvon Métras', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/yvon-metras
  ('Domaine Yvon Métras', 'Fleurie Vieilles Vignes', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.vivino.com/wineries/yvon-metras
  ('Domaine Yvon Métras', 'Fleurie Le Printemps', 'Fleurie, Beaujolais, France', 'Gamay', 'Red')  -- https://www.vivino.com/wineries/yvon-metras
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DU VISSOUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine du Vissoux', 'Beaujolais Rosé Les Griottes', 'Beaujolais, France', 'Gamay', 'Rosé'),  -- https://www.chermette.fr/vins/
  ('Domaine du Vissoux', 'Beaujolais Blanc Chardonnay', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.chermette.fr/vins/
  ('Domaine du Vissoux', 'Brouilly Pierreux', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chermette.fr/vins/
  ('Domaine du Vissoux', 'Fleurie Poncié', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chermette.fr/vins/
  ('Domaine du Vissoux', 'Fleurie Les Garants', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chermette.fr/vins/
  ('Domaine du Vissoux', 'Saint-Amour Les Champs-Grillés', 'Saint-Amour, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chermette.fr/vins/
  ('Domaine du Vissoux', 'Moulin-à-Vent Les Trois Roches', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chermette.fr/vins/
  ('Domaine du Vissoux', 'Moulin-à-Vent La Rochelle', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chermette.fr/vins/
  ('Domaine du Vissoux', 'Beaujolais Nouveau Rosé Les Griottes', 'Beaujolais, France', 'Gamay', 'Rosé'),  -- https://www.chermette.fr/vins/
  ('Domaine du Vissoux', 'Beaujolais Blanc Fraîcheur de Laura', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.chermette.fr/vins-jean-etienne-chermette/
  ('Domaine du Vissoux', 'Fleurie Sourire de Martine', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chermette.fr/vins-jean-etienne-chermette/
  ('Domaine du Vissoux', 'Moulin-à-Vent Générosité de Pierre-Marie', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chermette.fr/vins-jean-etienne-chermette/
  ('Domaine du Vissoux', 'Morgon Inspiration de Jean-Etienne', 'Morgon, Beaujolais, France', 'Gamay', 'Red')  -- https://www.chermette.fr/vins-jean-etienne-chermette/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE COUDERT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Coudert', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red')  -- https://www.idealwine.com/uk/domain/7395-Clos-de-la-Roilette.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU CAMBON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Château Cambon', 'Beaujolais Blanc', 'Beaujolais, France', 'Chardonnay', 'White'),  -- https://www.chateau-cambon.com/
  ('Château Cambon', 'Brouilly', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.chateau-cambon.com/
  ('Château Cambon', 'Pet Nat', 'Vin de France, France', 'Gamay', 'Sparkling')  -- https://www.chateau-cambon.com/project/pet-nat/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA GRAND'COUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine de la Grand''Cour', 'Fleurie Chapelle des Bois', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domainedelagrandcour.fr/vins_domaine.html
  ('Domaine de la Grand''Cour', 'Fleurie Clos de la Grand''Cour', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domainedelagrandcour.fr/vins_domaine.html
  ('Domaine de la Grand''Cour', 'Fleurie Vieilles Vignes Le Clos', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domainedelagrandcour.fr/vins_domaine.html
  ('Domaine de la Grand''Cour', 'Fleurie Champagne', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domainedelagrandcour.fr/vins_domaine.html
  ('Domaine de la Grand''Cour', 'Brouilly Vieilles Vignes', 'Brouilly, Beaujolais, France', 'Gamay', 'Red')  -- https://www.domainedelagrandcour.fr/vins_domaine.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ANITA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Domaine Anita', 'Moulin-à-Vent Reine de Nuit Aux Caves', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-anita.com/
  ('Domaine Anita', 'Moulin-à-Vent Cœur de Vigneronne Aux Caves', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-anita.com/
  ('Domaine Anita', 'Moulin-à-Vent Très Vieille Vigne Aux Caves', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-anita.com/
  ('Domaine Anita', 'Moulin-à-Vent La Rochelle', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-anita.com/
  ('Domaine Anita', 'Fleurie Les Moriers', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-anita.com/
  ('Domaine Anita', 'Morgon Cuvée Château-Gaillard', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-anita.com/
  ('Domaine Anita', 'Morgon Prestige Le Clachet', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-anita.com/
  ('Domaine Anita', 'Chénas Cuvée P''tit Co Les Brureaux', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-anita.com/
  ('Domaine Anita', 'Chénas Les Brureaux', 'Chénas, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.domaine-anita.com/
  ('Domaine Anita', 'Fleurie Poncié', 'Fleurie, Beaujolais, France', 'Gamay', 'Red')  -- https://www.domaine-anita.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JOSEPH DROUHIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r9_beaujolais.sql)'
from (values
  ('Joseph Drouhin', 'Saint-Amour', 'Saint-Amour, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.drouhin.com/fr_FR/nos-vins
  ('Joseph Drouhin', 'Moulin-à-Vent', 'Moulin-à-Vent, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.drouhin.com/fr_FR/nos-vins
  ('Joseph Drouhin', 'Fleurie Domaine des Hospices de Belleville', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.drouhin.com/fr_FR/nos-vins
  ('Joseph Drouhin', 'Fleurie', 'Fleurie, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.drouhin.com/fr_FR/nos-vins
  ('Joseph Drouhin', 'Morgon Domaine des Hospices de Belleville', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.drouhin.com/fr_FR/nos-vins
  ('Joseph Drouhin', 'Morgon', 'Morgon, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.drouhin.com/fr_FR/nos-vins
  ('Joseph Drouhin', 'Brouilly Domaine des Hospices de Belleville', 'Brouilly, Beaujolais, France', 'Gamay', 'Red'),  -- https://www.drouhin.com/fr_FR/nos-vins
  ('Joseph Drouhin', 'Brouilly', 'Brouilly, Beaujolais, France', 'Gamay', 'Red')  -- https://www.drouhin.com/fr_FR/nos-vins
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
