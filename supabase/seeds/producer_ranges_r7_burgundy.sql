-- Producer ranges round 7: Burgundy. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- DENIS MORTET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Denis Mortet', 'Bourgogne Cuvée de Noble Souche', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Marsannay Les Longeroies', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Fixin Champs Pennebaut', 'Fixin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Fixin Vieilles Vignes', 'Fixin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Gevrey-Chambertin Mes Cinq Terroirs', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Gevrey-Chambertin Premier Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Gevrey-Chambertin Premier Cru Les Champonnets', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Gevrey-Chambertin Premier Cru Les Champeaux', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Gevrey-Chambertin Premier Cru Lavaux Saint-Jacques', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Chambolle-Musigny Premier Cru Aux Beaux Bruns', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Bonnes-Mares Grand Cru', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Mazis-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
  ('Denis Mortet', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://idealwine.com/uk/domain/1376-Denis-Mortet.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLAUDE DUGAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Claude Dugat', 'Bourgogne', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
  ('Claude Dugat', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
  ('Claude Dugat', 'Gevrey-Chambertin La Marie', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
  ('Claude Dugat', 'Gevrey-Chambertin La Gibryotte', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
  ('Claude Dugat', 'Gevrey-Chambertin Premier Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
  ('Claude Dugat', 'Gevrey-Chambertin Premier Cru Lavaux Saint-Jacques', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
  ('Claude Dugat', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
  ('Claude Dugat', 'Charmes-Chambertin Grand Cru La Gibryotte', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
  ('Claude Dugat', 'Griotte-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
  ('Claude Dugat', 'Chapelle-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Claude%20Dugat
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DUGAT-PY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Dugat-Py', 'Bourgogne', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Bourgogne Cuvée Halinard', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Coeur de Roy Très Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Les Evocelles Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Les Evocelles Très Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Champeaux', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Champeaux Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Petite Chapelle Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Petite Chapelle Très Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Les Corbeaux', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Les Corbeaux Très Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru La Perrière', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru La Perrière Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Lavaux Saint-Jacques', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Fonteny', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Gevrey-Chambertin Premier Cru Fonteny Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Chambertin Grand Cru Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Mazis-Chambertin Grand Cru Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Mazis-Chambertin Grand Cru Très Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Charmes-Chambertin Grand Cru Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Mazoyères-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Vosne-Romanée Vieilles Vignes', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Pommard Les Vaumuriens', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Pommard Les Vaumuriens Hauts Très Vieilles Vignes', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Pommard La Levrière', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Pommard La Levrière Vieilles Vignes', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Pommard La Levrière Très Vieilles Vignes', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Beaune Premier Cru Les Grèves Très Vieilles Vignes', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Beaune Premier Cru Clos des Avaux Vieilles Vignes', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Savigny-lès-Beaune', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Chorey-lès-Beaune Très Vieilles Vignes', 'Chorey-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Monthélie Très Vieilles Vignes', 'Monthélie, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Monthélie Premier Cru Les Riottes', 'Monthélie, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Monthélie La Combe Danay', 'Monthélie, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Meursault Vieilles Vignes', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Meursault Très Vieilles Vignes', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Chassagne-Montrachet Premier Cru Morgeot', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
  ('Dugat-Py', 'Corton-Charlemagne Grand Cru Vieilles Vignes', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Dugat_Py
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- TRAPET PÈRE ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Trapet Père et Fils', 'Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Latricières-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Chapelle-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Gevrey-Chambertin Premier Cru Petite Chapelle', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Gevrey-Chambertin Premier Cru Clos Prieur', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Gevrey-Chambertin Premier Cru Capita', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Gevrey-Chambertin Ostrea', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Gevrey-Chambertin 1859', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Marsannay', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Marsannay Blanc', 'Marsannay, Côte de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-trapet.fr/fr/vins-bourgogne
  ('Trapet Père et Fils', 'Côte de Nuits-Villages Le Meix Fringuet', 'Côte de Nuits-Villages, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
  ('Trapet Père et Fils', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-trapet.fr/fr/vins-bourgogne
  ('Trapet Père et Fils', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-trapet.fr/fr/vins-bourgogne
  ('Trapet Père et Fils', 'Bourgogne Passetoutgrain A Minima', 'Burgundy, France', null, 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Jean%20Trapet%20et%20fils
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ROSSIGNOL-TRAPET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Rossignol-Trapet', 'Bourgogne', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Beaune Premier Cru Les Teurons', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Beaune Les Mariages', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Gevrey-Chambertin Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Gevrey-Chambertin Aux Etelois', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Gevrey-Chambertin Premier Cru Clos Prieur', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Gevrey-Chambertin Premier Cru Petite Chapelle', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Gevrey-Chambertin Premier Cru Les Cherbaudes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Gevrey-Chambertin Premier Cru Aux Combottes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Gevrey-Chambertin Premier Cru Les Corbeaux', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Chambertin Grand Cru Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Chapelle-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
  ('Domaine Rossignol-Trapet', 'Latricières-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Rossignol-Trapet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CLOS DE TART ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Clos de Tart', 'Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Clos%20de%20Tart
  ('Clos de Tart', 'Morey-Saint-Denis Premier Cru La Forge de Tart', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Clos%20de%20Tart
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES LAMBRAYS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine des Lambrays', 'Clos des Lambrays Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20des%20Lambrays
  ('Domaine des Lambrays', 'Morey-Saint-Denis Premier Cru Clos Sorbè', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20des%20Lambrays
  ('Domaine des Lambrays', 'Morey-Saint-Denis Premier Cru Les Loups', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20des%20Lambrays
  ('Domaine des Lambrays', 'Morey-Saint-Denis', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20des%20Lambrays
  ('Domaine des Lambrays', 'Nuits-Saint-Georges Premier Cru La Richemone', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20des%20Lambrays
  ('Domaine des Lambrays', 'Puligny-Montrachet Premier Cru Clos du Cailleret', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20des%20Lambrays
  ('Domaine des Lambrays', 'Puligny-Montrachet Premier Cru Les Folatières', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20des%20Lambrays
  ('Domaine des Lambrays', 'Puligny-Montrachet Premier Cru Les Louves', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20des%20Lambrays
  ('Domaine des Lambrays', 'Bourgogne La Rose du Clos', 'Burgundy, France', null, 'Rosé')  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20des%20Lambrays
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HUBERT LIGNIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Hubert Lignier', 'Bourgogne', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Bourgogne Pinot Noir Plan Gilbert', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Bourgogne Pinot Noir Grand Chaliot', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Bourgogne Symbiose', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Bourgogne Cuvée du Grand Cèdre', 'Burgundy, France', null, 'Rosé'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Bourgogne Aligoté Aux Poirelots', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Bourgogne Passetoutgrain Aux Poirelots', 'Burgundy, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Coteaux Bourguignons Au Gué', 'Burgundy, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Fixin Champs de Vosger', 'Fixin, Côte de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Très Girard', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Trilogie', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Premier Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Premier Cru Vieilles Vignes', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Premier Cru Les Blanchards', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Premier Cru Les Chaffots', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Premier Cru Les Sorbets', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Premier Cru La Riotte', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Premier Cru Clos Baulet', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Morey-Saint-Denis Premier Cru Chenevery', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Clos de la Roche Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Clos de la Roche Grand Cru MCMLV', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Gevrey-Chambertin Seuvrées', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Gevrey-Chambertin Regnard', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Gevrey-Chambertin La Justice', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Gevrey-Chambertin Premier Cru Aux Combottes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Mazoyères-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Griotte-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Chambolle-Musigny Les Bussières', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Chambolle-Musigny Vieilles Vignes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Chambolle-Musigny Premier Cru Les Baudes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Chambolle-Musigny Premier Cru Les Chabiots', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Nuits-Saint-Georges Les Poisets', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Nuits-Saint-Georges Premier Cru Les Vignerondes', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Nuits-Saint-Georges Premier Cru Les Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Nuits-Saint-Georges Premier Cru Les Didiers Hospices de Nuits', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Volnay', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Pommard Les Chanlins', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Pommard En Brescul', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
  ('Hubert Lignier', 'Saint-Romain', 'Saint-Romain, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lignier
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GHISLAINE BARTHOD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Ghislaine Barthod', 'Bourgogne', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Les Cras', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Les Véroilles', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Aux Combottes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Les Noirots', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Les Sentiers', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Aux Beaux Bruns', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Les Fuées', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Les Gruenchers', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Les Charmes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Les Chatelots', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
  ('Ghislaine Barthod', 'Chambolle-Musigny Premier Cru Les Baudes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Ghislaine%20Barthod
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DUROCHÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Duroché', 'Bourgogne Côte d''Or Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Les Jeunes Rois', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Champ', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Le Clos', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Aux Etelois', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Cuvée 26', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Premier Cru Lavaut Saint-Jacques', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Premier Cru Lavaut Saint-Jacques Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Premier Cru Combe au Moine', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Premier Cru Les Champeaux', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Gevrey-Chambertin Premier Cru Estournelles Saint-Jacques', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Latricières-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Chambertin-Clos de Bèze Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Chambolle-Musigny Premier Cru Aux Échanges', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Chambolle-Musigny Premier Cru Les Noirots', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Chambolle-Musigny Premier Cru Les Amoureuses', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Chambolle-Musigny Premier Cru Les Fuées', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Chambolle-Musigny Premier Cru Les Gruenchers', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Vosne-Romanée Premier Cru Les Malconsorts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
  ('Domaine Duroché', 'Corton Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Duroch%C3%A9
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GEANTET-PANSIOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Geantet-Pansiot', 'Bourgogne Pinot Fin', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Bourgogne Hautes-Côtes de Nuits', 'Hautes-Côtes de Nuits, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Marsannay Longeroies', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Marsannay Champs Perdrix', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Marsannay Vaudenelles', 'Marsannay, Côte de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Gevrey-Chambertin Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Gevrey-Chambertin En Champs', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Gevrey-Chambertin Cuvée Edmond', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Gevrey-Chambertin Premier Cru Le Poissenot', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Gevrey-Chambertin Premier Cru Combe aux Moines', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Morey-Saint-Denis', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Morey-Saint-Denis Premier Cru Les Genavrières', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Morey-Saint-Denis Premier Cru Monts Luisants', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Clos de la Roche Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Chambolle-Musigny Vieilles Vignes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Chambolle-Musigny Premier Cru Les Plantes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Chambolle-Musigny Premier Cru Les Baudes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Vosne-Romanée Vieilles Vignes', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Corton Grand Cru Le Rognet', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Corton Grand Cru Les Renardes', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
  ('Domaine Geantet-Pansiot', 'Corton-Charlemagne Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Geantet-Pansiot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ARLAUD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Arlaud', 'Bourgogne Roncevie', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Bourgogne Aligoté Scritch', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Morey-Saint-Denis', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Morey-Saint-Denis Premier Cru Les Millandes', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Morey-Saint-Denis Premier Cru Les Blanchards', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Morey-Saint-Denis Premier Cru Aux Chéseaux', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Morey-Saint-Denis Premier Cru Les Ruchots', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Clos de la Roche Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Clos Saint-Denis Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Chambolle-Musigny', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Chambolle-Musigny Premier Cru Les Sentiers', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Chambolle-Musigny Premier Cru Les Noirots', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Chambolle-Musigny Premier Cru Les Chatelots', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Bonnes-Mares Grand Cru', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Gevrey-Chambertin Premier Cru Aux Combottes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
  ('Domaine Arlaud', 'Vosne-Romanée Aux Réas', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Arlaud
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ROBERT GROFFIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Robert Groffier', 'Bourgogne Rouge Les Jardins de Marie et Léa', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.justerinis.com/fine-wines/france/burgundy/robert-groffier
  ('Domaine Robert Groffier', 'Bourgogne Passetoutgrain', 'Burgundy, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/827514f6-943a-49ed-a02f-ad30562dea67-1-bottle-Bourgogne-Passetoutgrain-Robert-Groffier-Pere-Fils-Domaine-2021-Red
  ('Domaine Robert Groffier', 'Gevrey-Chambertin Les Seuvrées', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.justerinis.com/fine-wines/france/burgundy/robert-groffier
  ('Domaine Robert Groffier', 'Chambolle-Musigny Premier Cru Les Sentiers', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.justerinis.com/fine-wines/france/burgundy/robert-groffier
  ('Domaine Robert Groffier', 'Chambolle-Musigny Premier Cru Les Hauts Doix', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.justerinis.com/fine-wines/france/burgundy/robert-groffier
  ('Domaine Robert Groffier', 'Chambolle-Musigny Premier Cru Les Amoureuses La Délicatesse des Sables', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.justerinis.com/fine-wines/france/burgundy/robert-groffier
  ('Domaine Robert Groffier', 'Chambolle-Musigny Premier Cru Les Amoureuses La Grâce des Argiles', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.justerinis.com/fine-wines/france/burgundy/robert-groffier
  ('Domaine Robert Groffier', 'Bonnes-Mares Grand Cru', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/2759283-1-bottle-Bonnes-Mares-Grand-Cru-Robert-Groffier-Pere-Fils-Domaine-2023-Red
  ('Domaine Robert Groffier', 'Chambertin-Clos de Bèze Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-a-wine/827514f6-943a-49ed-a02f-ad30562dea67-1-bottle-Bourgogne-Passetoutgrain-Robert-Groffier-Pere-Fils-Domaine-2021-Red
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JOSEPH ROTY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Joseph Roty', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Bourgogne Cuvée de Pressonnier', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Coteaux Bourguignons', 'Burgundy, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Marsannay', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Marsannay Blanc', 'Marsannay, Côte de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Marsannay Rosé', 'Marsannay, Côte de Nuits, Burgundy, France', null, 'Rosé'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Marsannay Cuvée de Boivin', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Marsannay Cuvée de Clos de Jeu', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Gevrey-Chambertin Cuvée de Champs-Chenys', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Gevrey-Chambertin Cuvée de la Brunelle', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Gevrey-Chambertin Cuvée du Clos Prieur Bas', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Gevrey-Chambertin Premier Cru Les Fontenys', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Charmes-Chambertin Grand Cru Très Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Griotte-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
  ('Domaine Joseph Roty', 'Mazis-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Joseph%20Roty
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LIGNIER-MICHELOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Lignier-Michelot', 'Morey-Saint-Denis Vieilles Vignes', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Morey-Saint-Denis En la Rue de Vergy', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Morey-Saint-Denis Premier Cru Les Chenevery', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Morey-Saint-Denis Premier Cru Les Faconnières', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Morey-Saint-Denis Premier Cru Aux Charmes', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Clos de la Roche Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Clos Saint-Denis Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Chambolle-Musigny Vieilles Vignes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Chambolle-Musigny Premier Cru Cuvée Jules', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Gevrey-Chambertin Cuvée Bertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Nuits-Saint-Georges Premier Cru Aux Murgers', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
  ('Domaine Lignier-Michelot', 'Fixin Premier Cru Les Arvelets', 'Fixin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Lignier-Michelot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PIERRE DAMOY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Pierre Damoy', 'Chambertin-Clos de Bèze Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Damoy
  ('Domaine Pierre Damoy', 'Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Damoy
  ('Domaine Pierre Damoy', 'Chapelle-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Damoy
  ('Domaine Pierre Damoy', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Damoy
  ('Domaine Pierre Damoy', 'Gevrey-Chambertin Clos Tamisot', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Damoy
  ('Domaine Pierre Damoy', 'Gevrey-Chambertin La Justice', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Damoy
  ('Domaine Pierre Damoy', 'Fixin Les Mogottes', 'Fixin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Damoy
  ('Domaine Pierre Damoy', 'Marsannay Les Longeroies', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Damoy
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE AMIOT-SERVELLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Amiot-Servelle', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Chambolle-Musigny', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Chambolle-Musigny Les Bas Doix', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Chambolle-Musigny Premier Cru Les Amoureuses', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Chambolle-Musigny Premier Cru Les Charmes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Chambolle-Musigny Premier Cru Les Plantes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Chambolle-Musigny Premier Cru Les Fuées', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Chambolle-Musigny Premier Cru Derrière la Grange', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Chambolle-Musigny Premier Cru Les Feusselottes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Chambolle-Musigny Premier Cru Les Borniques', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Morey-Saint-Denis', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Clos Saint-Denis Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
  ('Domaine Amiot-Servelle', 'Charmes-Chambertin Grand Cru En Mazoyères', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Amiot-Servelle
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DENIS BACHELET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Denis Bachelet', 'Bourgogne', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Denis%20Bachelet
  ('Domaine Denis Bachelet', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Denis%20Bachelet
  ('Domaine Denis Bachelet', 'Côte de Nuits-Villages', 'Côte de Nuits-Villages, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Denis%20Bachelet
  ('Domaine Denis Bachelet', 'Gevrey-Chambertin Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Denis%20Bachelet
  ('Domaine Denis Bachelet', 'Gevrey-Chambertin Les Evocelles', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Denis%20Bachelet
  ('Domaine Denis Bachelet', 'Gevrey-Chambertin Premier Cru Les Corbeaux Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Denis%20Bachelet
  ('Domaine Denis Bachelet', 'Charmes-Chambertin Grand Cru Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Denis%20Bachelet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SYLVIE ESMONIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Sylvie Esmonin', 'Bourgogne', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Sylvie%20Esmonin
  ('Sylvie Esmonin', 'Bourgogne Chardonnay', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Sylvie%20Esmonin
  ('Sylvie Esmonin', 'Côte de Nuits-Villages', 'Côte de Nuits-Villages, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Sylvie%20Esmonin
  ('Sylvie Esmonin', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Sylvie%20Esmonin
  ('Sylvie Esmonin', 'Gevrey-Chambertin Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Sylvie%20Esmonin
  ('Sylvie Esmonin', 'Gevrey-Chambertin Premier Cru Clos Saint-Jacques', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Sylvie%20Esmonin
  ('Sylvie Esmonin', 'Gevrey-Chambertin Premier Cru Clos Prieur', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Sylvie%20Esmonin
  ('Sylvie Esmonin', 'Volnay Premier Cru Santenots', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Sylvie%20Esmonin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE TAUPENOT-MERME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Taupenot-Merme', 'Mazoyères-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Taupenot-Merme
  ('Domaine Taupenot-Merme', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Taupenot-Merme
  ('Domaine Taupenot-Merme', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Taupenot-Merme
  ('Domaine Taupenot-Merme', 'Gevrey-Chambertin Premier Cru Bel Air', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Taupenot-Merme
  ('Domaine Taupenot-Merme', 'Morey-Saint-Denis Premier Cru La Riotte', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Taupenot-Merme
  ('Domaine Taupenot-Merme', 'Chambolle-Musigny Premier Cru Combe d''Orveau', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Taupenot-Merme
  ('Domaine Taupenot-Merme', 'Nuits-Saint-Georges Premier Cru Les Pruliers', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Taupenot-Merme
  ('Domaine Taupenot-Merme', 'Corton Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Taupenot-Merme
  ('Domaine Taupenot-Merme', 'Auxey-Duresses Premier Cru', 'Auxey-Duresses, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Taupenot-Merme
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PIERRE AMIOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Pierre Amiot', 'Gevrey-Chambertin Premier Cru Les Combottes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Amiot%20et%20Fils%20
  ('Domaine Pierre Amiot', 'Morey-Saint-Denis Premier Cru Aux Charmes', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Amiot%20et%20Fils%20
  ('Domaine Pierre Amiot', 'Morey-Saint-Denis Premier Cru Les Ruchots', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Amiot%20et%20Fils%20
  ('Domaine Pierre Amiot', 'Morey-Saint-Denis Premier Cru Les Millandes', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Amiot%20et%20Fils%20
  ('Domaine Pierre Amiot', 'Morey-Saint-Denis Premier Cru Les Blanchards', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Amiot%20et%20Fils%20
  ('Domaine Pierre Amiot', 'Clos de la Roche Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Amiot%20et%20Fils%20
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HERESZTYN-MAZZINI ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Heresztyn-Mazzini', 'Gevrey-Chambertin Vieilles Vignes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
  ('Domaine Heresztyn-Mazzini', 'Gevrey-Chambertin Vieilles Vignes Les Jouises', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
  ('Domaine Heresztyn-Mazzini', 'Gevrey-Chambertin Vieilles Vignes Les Songes', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
  ('Domaine Heresztyn-Mazzini', 'Gevrey-Chambertin Clos Village', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
  ('Domaine Heresztyn-Mazzini', 'Gevrey-Chambertin Premier Cru Les Champonnets', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
  ('Domaine Heresztyn-Mazzini', 'Gevrey-Chambertin Premier Cru La Perrière', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
  ('Domaine Heresztyn-Mazzini', 'Gevrey-Chambertin Premier Cru Les Goulots', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
  ('Domaine Heresztyn-Mazzini', 'Chambolle-Musigny', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
  ('Domaine Heresztyn-Mazzini', 'Morey-Saint-Denis Premier Cru Les Millandes', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
  ('Domaine Heresztyn-Mazzini', 'Clos Saint-Denis Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Heresztyn-Mazzini
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HUDELOT-NOËLLAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Hudelot-Noëllat', 'Richebourg Grand Cru', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Romanée-Saint-Vivant Grand Cru', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Vosne-Romanée Premier Cru Les Malconsorts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Vosne-Romanée Premier Cru Les Beaumonts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Chambolle-Musigny Premier Cru Les Charmes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Nuits-Saint-Georges Les Bas de Combes', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Nuits-Saint-Georges Premier Cru Les Murgers', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Vougeot Premier Cru Les Petits Vougeots', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Chambolle-Musigny', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Bourgogne Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-hudelot-noellat.com/wines
  ('Hudelot-Noëllat', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White')  -- https://www.domaine-hudelot-noellat.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ANNE GROS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Anne Gros', 'Coteaux Bourguignons Blanc Cuvée Julie', 'Burgundy, France', null, 'White'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Bourgogne Blanc Chardonnay', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Bourgogne Hautes-Côtes de Nuits Blanc Cuvée Marine', 'Hautes-Côtes de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Coteaux Bourguignons Rouge Vieilles Vignes', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Bourgogne Rouge Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Bourgogne Hautes-Côtes de Nuits Rouge', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Chambolle-Musigny La Combe d''Orveau', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Vosne-Romanée Les Barreaux', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Échezeaux Grand Cru Les Loachausses', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Grands-Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Clos de Vougeot Grand Cru Le Grand Maupertui', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
  ('Domaine Anne Gros', 'Richebourg Grand Cru', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.northberkeleyimports.com/project/domaine-anne-gros/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE A.F. GROS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine A.F. Gros', 'Bourgogne Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://adrianchalkselections.com/?p=967
  ('Domaine A.F. Gros', 'Beaune Premier Cru Les Montrevenots', 'Beaune, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://adrianchalkselections.com/?p=967
  ('Domaine A.F. Gros', 'Bourgogne Hautes-Côtes de Nuits', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Savigny-lès-Beaune Premier Cru Clos des Guettes', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Beaune Premier Cru Les Boucherottes', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Vosne-Romanée Clos de la Fontaine', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Vosne-Romanée Aux Réas', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Vosne-Romanée Les Chalandins', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Chambolle-Musigny', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Pommard Premier Cru Les Arvelets', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Pommard Premier Cru Les Pézerolles', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Richebourg Grand Cru', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
  ('Domaine A.F. Gros', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/uk/domain/1300-A.F.-Gros.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MONGEARD-MUGNERET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Mongeard-Mugneret', 'Richebourg Grand Cru', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/richebourg-grand-cru/
  ('Domaine Mongeard-Mugneret', 'Grands-Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/grands-echezeaux-grand-cru/
  ('Domaine Mongeard-Mugneret', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/echezeaux-grand-cru/
  ('Domaine Mongeard-Mugneret', 'Échezeaux Grand Cru La Grande Complication', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/echezeaux-grand-cru-la-grande-complication/
  ('Domaine Mongeard-Mugneret', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/clos-de-vougeot-grand-cru/
  ('Domaine Mongeard-Mugneret', 'Vosne-Romanée Premier Cru En Orveaux', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/vosne-romanee-premier-cru-en-orveaux-2/
  ('Domaine Mongeard-Mugneret', 'Vosne-Romanée Premier Cru Les Petits Monts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/vosne-romanee-premier-cru-les-petits-monts/
  ('Domaine Mongeard-Mugneret', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/vosne-romanee-premier-cru-les-suchots/
  ('Domaine Mongeard-Mugneret', 'Vougeot Premier Cru Les Crâs', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/vougeot-premier-cru-les-cras/
  ('Domaine Mongeard-Mugneret', 'Vougeot Premier Cru Les Petits Vougeots', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/vougeot-premier-cru-les-petits-vougeots/
  ('Domaine Mongeard-Mugneret', 'Nuits-Saint-Georges Premier Cru Aux Boudots', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/nuits-saint-georges-premier-cru-aux-boudots/
  ('Domaine Mongeard-Mugneret', 'Beaune Premier Cru Les Avaux', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/beaune-premier-cru-les-avaux/
  ('Domaine Mongeard-Mugneret', 'Pernand-Vergelesses Premier Cru Les Vergelesses', 'Pernand-Vergelesses, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/pernand-vergelesses-premier-cru-les-vergelesses/
  ('Domaine Mongeard-Mugneret', 'Puligny-Montrachet Premier Cru Champ Gain', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://mongeard.com/fr/vin/puligny-montrachet-premier-cru-champ-gain/
  ('Domaine Mongeard-Mugneret', 'Savigny-lès-Beaune Premier Cru Les Narbantons', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/savigny-les-beaune-premier-cru-les-narbantons/
  ('Domaine Mongeard-Mugneret', 'Aloxe-Corton Les Caillettes', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/aloxe-corton-village-les-caillettes/
  ('Domaine Mongeard-Mugneret', 'Chambolle-Musigny', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/chambolle-musigny-village/
  ('Domaine Mongeard-Mugneret', 'Fixin Rouge', 'Fixin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/fixin-village-rouge/
  ('Domaine Mongeard-Mugneret', 'Fixin Vieilles Vignes', 'Fixin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/fixin-village-vieille-vigne/
  ('Domaine Mongeard-Mugneret', 'Fixin Blanc', 'Fixin, Côte de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://mongeard.com/fr/vin/fixin-village/
  ('Domaine Mongeard-Mugneret', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/gevrey-chambertin-village/
  ('Domaine Mongeard-Mugneret', 'Marsannay Clos du Roy', 'Marsannay, Côte de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://mongeard.com/fr/vin/marsannay-village-clos-du-roy/
  ('Domaine Mongeard-Mugneret', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/nuits-saint-georges-village/
  ('Domaine Mongeard-Mugneret', 'Nuits-Saint-Georges Les Plateaux', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/nuits-saint-georges-village-les-plateaux/
  ('Domaine Mongeard-Mugneret', 'Savigny-lès-Beaune', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/savigny-les-beaune-village/
  ('Domaine Mongeard-Mugneret', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/vosne-romanee-village/
  ('Domaine Mongeard-Mugneret', 'Vosne-Romanée Les Maizières-Hautes', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/vosne-romanee-village-les-maizieres-hautes/
  ('Domaine Mongeard-Mugneret', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://mongeard.com/fr/vin/bourgogne-aligote/
  ('Domaine Mongeard-Mugneret', 'Bourgogne Chardonnay', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://mongeard.com/fr/vin/bourgogne-chardonnay/
  ('Domaine Mongeard-Mugneret', 'Bourgogne Hautes-Côtes de Nuits Blanc Le Prieuré', 'Hautes-Côtes de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://mongeard.com/fr/vin/bourgogne-hautes-cotes-de-nuits-blanc-le-prieure/
  ('Domaine Mongeard-Mugneret', 'Bourgogne Hautes-Côtes de Nuits Rouge La Croix', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/bourgogne-hautes-cotes-de-nuits-rouge-la-croix/
  ('Domaine Mongeard-Mugneret', 'Bourgogne Hautes-Côtes de Nuits Rouge Les Dames Huguettes', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/bourgogne-hautes-cotes-de-nuits-rouge-les-dames-huguettes/
  ('Domaine Mongeard-Mugneret', 'Bourgogne Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/bourgogne-pinot-noir/
  ('Domaine Mongeard-Mugneret', 'Bourgogne Pinot Noir Cuvée Sapidus', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://mongeard.com/fr/vin/bourgogne-pinot-noir-cuvee-sapidus/
  ('Domaine Mongeard-Mugneret', 'Bourgogne Rosé', 'Burgundy, France', 'Pinot Noir', 'Rosé'),  -- https://mongeard.com/fr/vin/bourgogne-rose/
  ('Domaine Mongeard-Mugneret', 'Coteaux Bourguignons La Superbe', 'Burgundy, France', 'Gamay, Pinot Noir', 'Red')  -- https://mongeard.com/fr/vin/coteaux-bourguignons-la-superbe/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GEORGES MUGNERET-GIBOURG ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Georges Mugneret-Gibourg', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-georges-mugneret-gibourg/
  ('Domaine Georges Mugneret-Gibourg', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-georges-mugneret-gibourg/
  ('Domaine Georges Mugneret-Gibourg', 'Vosne-Romanée La Colombière', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-georges-mugneret-gibourg/
  ('Domaine Georges Mugneret-Gibourg', 'Nuits-Saint-Georges Premier Cru Les Chaignots', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-georges-mugneret-gibourg/
  ('Domaine Georges Mugneret-Gibourg', 'Chambolle-Musigny Premier Cru Les Feusselottes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-georges-mugneret-gibourg/
  ('Domaine Georges Mugneret-Gibourg', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-georges-mugneret-gibourg/
  ('Domaine Georges Mugneret-Gibourg', 'Ruchottes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-georges-mugneret-gibourg/
  ('Domaine Georges Mugneret-Gibourg', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/project/domaine-georges-mugneret-gibourg/
  ('Domaine Georges Mugneret-Gibourg', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.pearlofburgundy.com/our-wines/domaine-georges-mugneret-gibourg/
  ('Domaine Georges Mugneret-Gibourg', 'Nuits-Saint-Georges Premier Cru Les Vignes Rondes', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.pearlofburgundy.com/our-wines/domaine-georges-mugneret-gibourg/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BIZOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Bizot', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1381-Domaine-Bizot.jsp
  ('Domaine Bizot', 'Vosne-Romanée Les Jachées', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1381-Domaine-Bizot.jsp
  ('Domaine Bizot', 'Vosne-Romanée Les Réas', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1381-Domaine-Bizot.jsp
  ('Domaine Bizot', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1381-Domaine-Bizot.jsp
  ('Domaine Bizot', 'Bourgogne Le Chapitre', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/uk/domain/1381-Domaine-Bizot.jsp
  ('Domaine Bizot', 'Marsannay Rouge Clos du Roy', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://pearlofburgundy.com/our-wines/domaine-bizot
  ('Domaine Bizot', 'Bourgogne Les Violettes', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/uk/domain/1381-Domaine-Bizot.jsp
  ('Domaine Bizot', 'Bourgogne Hautes-Côtes de Nuits Blanc', 'Hautes-Côtes de Nuits, Burgundy, France', 'Chardonnay', 'White')  -- https://idealwine.com/uk/domain/1381-Domaine-Bizot.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PRIEURÉ-ROCH ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Prieuré-Roch', 'Chambertin-Clos de Bèze Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Vosne-Romanée Le Clos Goillotte', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Vosne-Romanée Les Hautes Maizières', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Nuits-Saint-Georges Premier Cru Le Clos des Corvées', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Nuits-Saint-Georges Premier Cru Le Clos des Corvées Vieilles Vignes', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Nuits-Saint-Georges Premier Cru Clos des Argillières', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Gevrey-Chambertin Premier Cru Le Clos des Varoilles', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Ladoix Le Cloud Rouge', 'Ladoix, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Ladoix Le Cloud Blanc', 'Ladoix, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Savigny-lès-Beaune Dessus Les Gollardes Rouge', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Savigny-lès-Beaune Dessus Les Gollardes Blanc', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
  ('Domaine Prieuré-Roch', 'Bourgogne Pinoterie', 'Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/uk/domain/1557-Prieure-Roch.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE EMMANUEL ROUGET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Emmanuel Rouget', 'Vosne-Romanée Premier Cru Cros Parantoux', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Vosne-Romanée Premier Cru Les Beaumonts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Savigny-lès-Beaune', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Savigny-lès-Beaune Premier Cru Les Lavières', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Chorey-lès-Beaune', 'Chorey-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Bourgogne Hautes-Côtes de Nuits Rouge', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Bourgogne Hautes-Côtes de Nuits Blanc', 'Hautes-Côtes de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
  ('Domaine Emmanuel Rouget', 'Bourgogne Passetoutgrain', 'Burgundy, France', null, 'Red')  -- https://www.idealwine.com/uk/domain/1422-Emmanuel-Rouget.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LAMARCHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Lamarche', 'La Grande Rue Grand Cru', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Grands-Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Vosne-Romanée Premier Cru Les Malconsorts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Vosne-Romanée Premier Cru Les Chaumes', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Vosne-Romanée Premier Cru La Croix Rameau', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Nuits-Saint-Georges Premier Cru Les Cras', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Bourgogne Hautes-Côtes de Nuits Rouge', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
  ('Domaine Lamarche', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Nicole%20Lamarche%20(Anciennement%20Fran%C3%A7ois%20Lamarche)
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CÉCILE TREMBLAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Cécile Tremblay', 'Chapelle-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Échezeaux du Dessus Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Vosne-Romanée Premier Cru Les Beaux Monts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Vosne-Romanée Premier Cru Les Rouges du Dessus', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Vosne-Romanée Vieilles Vignes', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Chambolle-Musigny Premier Cru Les Feusselottes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Chambolle-Musigny Les Cabottes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Morey-Saint-Denis Très Girard', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Nuits-Saint-Georges Premier Cru Les Murgers', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Nuits-Saint-Georges Albuca', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Bourgogne La Croix Blanche', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
  ('Cécile Tremblay', 'Bourgogne La Fontaine', 'Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/uk/domain/6973-Cecile-Tremblay.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BRUNO CLAVELIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Bruno Clavelier', 'Corton Grand Cru Le Rognet', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Gevrey-Chambertin Premier Cru Les Corbeaux', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Chambolle-Musigny Premier Cru Les Noirots', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Chambolle-Musigny Premier Cru La Combe d''Orveau', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Vosne-Romanée Premier Cru Les Beaux Monts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Vosne-Romanée Premier Cru Aux Brulées', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Nuits-Saint-Georges Premier Cru Aux Cras', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Vosne-Romanée Les Hauts de Beaux Monts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Vosne-Romanée La Combe Brûlée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Vosne-Romanée La Montagne', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Vosne-Romanée Les Hautes Maizières', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1332-Bruno-Clavelier.jsp
  ('Domaine Bruno Clavelier', 'Bourgogne Pinot Noir Les Champs d''Argent', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bruno-clavelier.com/
  ('Domaine Bruno Clavelier', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White')  -- https://www.bruno-clavelier.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CONFURON-COTETIDOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Confuron-Cotetidot', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-2759-confuron-cotetidot
  ('Domaine Confuron-Cotetidot', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-2759-confuron-cotetidot
  ('Domaine Confuron-Cotetidot', 'Chambolle-Musigny', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-2759-confuron-cotetidot
  ('Domaine Confuron-Cotetidot', 'Chambolle-Musigny Premier Cru Derrière la Grange', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-2759-confuron-cotetidot
  ('Domaine Confuron-Cotetidot', 'Gevrey-Chambertin Premier Cru Lavaut Saint-Jacques', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-2759-confuron-cotetidot
  ('Domaine Confuron-Cotetidot', 'Nuits-Saint-Georges Premier Cru Aux Vignerondes', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-2759-confuron-cotetidot
  ('Domaine Confuron-Cotetidot', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-2759-confuron-cotetidot
  ('Domaine Confuron-Cotetidot', 'Charmes-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-2759-confuron-cotetidot
  ('Domaine Confuron-Cotetidot', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', null, 'Red'),  -- https://www.burgundy-report.com/?p=106928
  ('Domaine Confuron-Cotetidot', 'Mazis-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', null, 'Red'),  -- https://www.burgundy-report.com/?p=106928
  ('Domaine Confuron-Cotetidot', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', null, 'Red'),  -- https://www.burgundy-report.com/?p=106928
  ('Domaine Confuron-Cotetidot', 'Gevrey-Chambertin Premier Cru Craipillot', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', null, 'Red'),  -- https://www.burgundy-report.com/?p=106928
  ('Domaine Confuron-Cotetidot', 'Gevrey-Chambertin Premier Cru Petite Chapelle', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', null, 'Red')  -- https://www.burgundy-report.com/?p=106928
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- ROBERT CHEVILLON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Robert Chevillon', 'Nuits-Saint-Georges Premier Cru Les Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-3368-domaine-robert-chevillon
  ('Robert Chevillon', 'Nuits-Saint-Georges Premier Cru Les Vaucrains', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-3368-domaine-robert-chevillon
  ('Robert Chevillon', 'Nuits-Saint-Georges Premier Cru Les Cailles', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-3368-domaine-robert-chevillon
  ('Robert Chevillon', 'Nuits-Saint-Georges Premier Cru Les Perrières', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-3368-domaine-robert-chevillon
  ('Robert Chevillon', 'Nuits-Saint-Georges Premier Cru Les Chaignots', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.bbr.com/producer-3368-domaine-robert-chevillon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HENRI GOUGES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Henri Gouges', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
  ('Henri Gouges', 'Nuits-Saint-Georges Premier Cru Clos des Porrets Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
  ('Henri Gouges', 'Nuits-Saint-Georges Premier Cru Les Pruliers', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
  ('Henri Gouges', 'Nuits-Saint-Georges Premier Cru Les Vaucrains', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
  ('Henri Gouges', 'Nuits-Saint-Georges Premier Cru Les Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
  ('Henri Gouges', 'Nuits-Saint-Georges Premier Cru Les Chaignots', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
  ('Henri Gouges', 'Nuits-Saint-Georges Premier Cru Les Chênes Carteaux', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
  ('Henri Gouges', 'Nuits-Saint-Georges Premier Cru La Perrière Blanc', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
  ('Henri Gouges', 'Bourgogne Hautes-Côtes de Nuits Les Dames Huguettes', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
  ('Henri Gouges', 'Bourgogne Pinot Blanc', 'Burgundy, France', 'Pinot Blanc', 'White')  -- https://www.idealwine.com/uk/domain/1404-Henri-Gouges.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE L'ARLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine de l''Arlot', 'Nuits-Saint-Georges Premier Cru Clos des Forêts Saint-Georges Monopole', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.arlot.com/fr/vin/1/clos-des-forets-saint-georges-monopole
  ('Domaine de l''Arlot', 'Nuits-Saint-Georges Premier Cru Clos de l''Arlot Monopole', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.arlot.com/fr/vin/7/clos-de-l-arlot-monopole
  ('Domaine de l''Arlot', 'Nuits-Saint-Georges Premier Cru Clos de l''Arlot Blanc Monopole', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.arlot.com/fr/vin/3/clos-de-l-arlot-blanc-monopole
  ('Domaine de l''Arlot', 'Nuits-Saint-Georges Premier Cru Mont des Oiseaux', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.arlot.com/fr/vin/13/mont-des-oiseaux
  ('Domaine de l''Arlot', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.arlot.com/fr/vin/8/les-suchots
  ('Domaine de l''Arlot', 'Romanée-Saint-Vivant Grand Cru', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.arlot.com/fr/vin/9/romanee-saint-vivant
  ('Domaine de l''Arlot', 'Côte de Nuits-Villages Clos du Chapeau Monopole', 'Côte de Nuits-Villages, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.arlot.com/fr/vin/2/clos-du-chapeau-monopole
  ('Domaine de l''Arlot', 'Côte de Nuits-Villages Au Leurey Blanc', 'Côte de Nuits-Villages, Côte de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.arlot.com/fr/vin/10/au-leurey-blanc
  ('Domaine de l''Arlot', 'Bourgogne Hautes-Côtes de Nuits Le Mont', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.arlot.com/fr/vin/12/le-mont
  ('Domaine de l''Arlot', 'Bourgogne Hautes-Côtes de Nuits Le Mont Blanc', 'Hautes-Côtes de Nuits, Burgundy, France', 'Chardonnay', 'White')  -- https://www.arlot.com/fr/vin/11/le-mont-blanc
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHEVILLON-CHEZEAUX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Chevillon-Chezeaux', 'Nuits-Saint-Georges Premier Cru Les Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/238/dom-chevillon-chezeaux
  ('Chevillon-Chezeaux', 'Nuits-Saint-Georges Premier Cru Les Porrets Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/238/dom-chevillon-chezeaux
  ('Chevillon-Chezeaux', 'Nuits-Saint-Georges Premier Cru Aux Bousselots', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/238/dom-chevillon-chezeaux
  ('Chevillon-Chezeaux', 'Nuits-Saint-Georges Aux Champs Perdrix', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/238/dom-chevillon-chezeaux
  ('Chevillon-Chezeaux', 'Nuits-Saint-Georges Les Saint-Julien', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/238/dom-chevillon-chezeaux
  ('Chevillon-Chezeaux', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/238/dom-chevillon-chezeaux
  ('Chevillon-Chezeaux', 'Bourgogne Hautes-Côtes de Nuits Rouge', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/238/dom-chevillon-chezeaux
  ('Chevillon-Chezeaux', 'Nuits-Saint-Georges Premier Cru Les Saint-Georges Vieilles Vignes', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://vincod.com/15929DCAHL
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN-MARC MILLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Jean-Marc Millot', 'Bourgogne Aligoté Les Deux Terres', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.skurnik.com/sku/bourgogne-aligote-les-deux-terres-domaine-jean-marc-millot/
  ('Domaine Jean-Marc Millot', 'Bourgogne Passetoutgrain Les Autrots', 'Burgundy, France', null, 'Red'),  -- https://www.skurnik.com/sku/bourgogne-passetoutgrains-jean-marc-millot-2-2-2-2-2-2-2-2/
  ('Domaine Jean-Marc Millot', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/bourgogne-rouge-jean-marc-millot-2-2-2-2-2-2-3/
  ('Domaine Jean-Marc Millot', 'Clos de Vougeot Grand Cru Grand Maupertui', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/clos-de-vougeot-grand-cru-grand-maupertui-jean-marc-millot-2-2-2-2-2-2-2-2/
  ('Domaine Jean-Marc Millot', 'Côte de Nuits-Villages Version Nord', 'Côte de Nuits-Villages, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/cote-de-nuits-villages-alix-millot-3/
  ('Domaine Jean-Marc Millot', 'Côte de Nuits-Villages Vieilles Vignes', 'Côte de Nuits-Villages, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/cote-de-nuits-villages-aux-faulques-jean-marc-millot-2-2-2-2-2-2-2-3/
  ('Domaine Jean-Marc Millot', 'Côte de Nuits-Villages Aux Faulques', 'Côte de Nuits-Villages, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/cote-de-nuits-villages-aux-faulques-jean-marc-millot-3-2-2-2-2-2-2-2/
  ('Domaine Jean-Marc Millot', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/echezeaux-grand-cru-jean-marc-millot-2-2-2-2-2-2-2-2/
  ('Domaine Jean-Marc Millot', 'Grands-Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/grands-echezeaux-grand-cru-jean-marc-millot-2-2-2-2-2-2-3/
  ('Domaine Jean-Marc Millot', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/gevrey-chambertin-alix-millot-3/
  ('Domaine Jean-Marc Millot', 'Bourgogne Hautes-Côtes de Beaune Rouge Les Crucibées', 'Hautes-Côtes de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/hautes-cotes-de-beaune-rouge-les-crucibees-jean-marc-millot/
  ('Domaine Jean-Marc Millot', 'Nuits-Saint-Georges Premier Cru Aux Chaignots', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/nuits-st-georges-1er-aux-chaignots-jean-marc-millot-2/
  ('Domaine Jean-Marc Millot', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/nuits-st-georges-jean-marc-millot-2/
  ('Domaine Jean-Marc Millot', 'Savigny-lès-Beaune', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/savigny-les-beaune-jean-marc-millot-2-2-2-2-3/
  ('Domaine Jean-Marc Millot', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/vosne-romanee-jean-marc-millot-2-2-2-2-2-2-2-3/
  ('Domaine Jean-Marc Millot', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.skurnik.com/sku/vosne-romanee-jean-marc-millot-3-2-2-2-2-2-2-2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DANIEL RION ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Daniel Rion et Fils', 'Nuits-Saint-Georges Premier Cru Les Hauts Pruliers', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1394-Daniel-Rion.jsp
  ('Domaine Daniel Rion et Fils', 'Nuits-Saint-Georges Premier Cru Aux Vignerondes', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1394-Daniel-Rion.jsp
  ('Domaine Daniel Rion et Fils', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1394-Daniel-Rion.jsp
  ('Domaine Daniel Rion et Fils', 'Vosne-Romanée Premier Cru Les Beaux Monts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1394-Daniel-Rion.jsp
  ('Domaine Daniel Rion et Fils', 'Vosne-Romanée Premier Cru Les Chaumes', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1394-Daniel-Rion.jsp
  ('Domaine Daniel Rion et Fils', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1394-Daniel-Rion.jsp
  ('Domaine Daniel Rion et Fils', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/uk/domain/1394-Daniel-Rion.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GÉRARD MUGNERET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Gérard Mugneret', 'Bourgogne Les Rouges Champs', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/bourgogne-les-rouges-champs/
  ('Domaine Gérard Mugneret', 'Bourgogne Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/bourgogne-pinot-noir/
  ('Domaine Gérard Mugneret', 'Chambolle-Musigny Premier Cru Les Charmes', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/chambolle-musigny-1er-cru-les-charmes/
  ('Domaine Gérard Mugneret', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/echezeaux-grand-cru/
  ('Domaine Gérard Mugneret', 'Nuits-Saint-Georges Premier Cru Aux Cras', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/nuits-saint-georges-aux-cras-1er-cru/
  ('Domaine Gérard Mugneret', 'Nuits-Saint-Georges Premier Cru La Richemone', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/nuits-saint-georges-la-richemone-1er-cru/
  ('Domaine Gérard Mugneret', 'Savigny-lès-Beaune Premier Cru Aux Gravains', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/savigny-les-beaune-aux-gravains-1er-cru/
  ('Domaine Gérard Mugneret', 'Vosne-Romanée Premier Cru Aux Brûlées', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/vosne-romanee-1er-cru-les-brulees/
  ('Domaine Gérard Mugneret', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/vosne-romanee-1er-cru-les-suchots/
  ('Domaine Gérard Mugneret', 'Vosne-Romanée Cuvée Précolombière', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/vosne-romanee-cuvee-precolombiere/
  ('Domaine Gérard Mugneret', 'Vosne-Romanée Quatrain', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/gerard-mugneret/vosne-romanee-quatrain/
  ('Domaine Gérard Mugneret', 'Vosne-Romanée Vigneux', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.beckywasserman.com/domaines/gerard-mugneret/vosne-romanee-vigneux/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JAYER-GILLES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Jayer-Gilles', 'Échezeaux Grand Cru Du Dessus', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hoffmann%20Jayer%20(anciennement%20Jayer%20Gilles)
  ('Domaine Jayer-Gilles', 'Nuits-Saint-Georges Premier Cru Les Damodes', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hoffmann%20Jayer%20(anciennement%20Jayer%20Gilles)
  ('Domaine Jayer-Gilles', 'Nuits-Saint-Georges Les Hauts Poirets', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hoffmann%20Jayer%20(anciennement%20Jayer%20Gilles)
  ('Domaine Jayer-Gilles', 'Côte de Nuits-Villages', 'Côte de Nuits-Villages, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hoffmann%20Jayer%20(anciennement%20Jayer%20Gilles)
  ('Domaine Jayer-Gilles', 'Bourgogne Hautes-Côtes de Beaune Rouge', 'Hautes-Côtes de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Hoffmann%20Jayer%20(anciennement%20Jayer%20Gilles)
  ('Domaine Jayer-Gilles', 'Bourgogne Hautes-Côtes de Beaune Blanc', 'Hautes-Côtes de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Hoffmann%20Jayer%20(anciennement%20Jayer%20Gilles)
  ('Domaine Jayer-Gilles', 'Bourgogne Hautes-Côtes de Nuits Blanc', 'Hautes-Côtes de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Hoffmann%20Jayer%20(anciennement%20Jayer%20Gilles)
  ('Domaine Jayer-Gilles', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Hoffmann%20Jayer%20(anciennement%20Jayer%20Gilles)
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MICHEL NOËLLAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Michel Noëllat', 'Bourgogne Hautes-Côtes de Nuits Chardonnay', 'Hautes-Côtes de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Savigny-lès-Beaune Chardonnay', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Coteaux Bourguignons', 'Burgundy, France', null, 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Bourgogne Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Bourgogne Hautes-Côtes de Nuits Pinot Noir', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Marsannay', 'Marsannay, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Fixin', 'Fixin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Morey-Saint-Denis', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Chambolle-Musigny', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Savigny-lès-Beaune', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Pommard', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Savigny-lès-Beaune Premier Cru Les Peuillets', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Savigny-lès-Beaune Premier Cru Les Lavières', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Morey-Saint-Denis Premier Cru Les Sorbès', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Chambolle-Musigny Premier Cru Les Noirots', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Vosne-Romanée Premier Cru Les Chaumes', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Vosne-Romanée Premier Cru Les Beaux Monts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Nuits-Saint-Georges Premier Cru Aux Boudots', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Échezeaux Grand Cru', 'Flagey-Échezeaux, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://domaine-michel-noellat.com/vins/
  ('Domaine Michel Noëllat', 'Clos de Vougeot Grand Cru', 'Vougeot, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://domaine-michel-noellat.com/vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE SYLVAIN CATHIARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Sylvain Cathiard', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/bourgogne-aligote/
  ('Domaine Sylvain Cathiard', 'Bourgogne Hautes-Côtes de Nuits Rouge Aux Chaumes', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/bourgogne-hautes-cotes-de-nuits-rouge-aux-chaumes/
  ('Domaine Sylvain Cathiard', 'Bourgogne Hautes-Côtes de Nuits Rouge Les Dames Huguette', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/bourgogne-hautes-cotes-de-nuits-rouge-les-dames-huguette/
  ('Domaine Sylvain Cathiard', 'Bourgogne Hautes-Côtes de Nuits Rouge', 'Hautes-Côtes de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/bourgogne-hautes-cotes-de-nuits-rouge/
  ('Domaine Sylvain Cathiard', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/bourgogne-rouge/
  ('Domaine Sylvain Cathiard', 'Chambolle-Musigny Les Clos de l''Orme', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/chambolle-musigny-les-clos-de-lorme/
  ('Domaine Sylvain Cathiard', 'Coteaux Bourguignons Rouge Les Croix Blanches', 'Burgundy, France', 'Pinot Noir, Gamay', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/coteaux-bourguignons-rouge-les-croix-blanches-2/
  ('Domaine Sylvain Cathiard', 'Gevrey-Chambertin', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/gevrey-chambertin/
  ('Domaine Sylvain Cathiard', 'Nuits-Saint-Georges Premier Cru Aux Murgers', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/nuits-saint-georges-1er-cru-aux-murgers/
  ('Domaine Sylvain Cathiard', 'Nuits-Saint-Georges Premier Cru Aux Thorey', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/nuits-saint-georges-1er-cru-aux-thorey/
  ('Domaine Sylvain Cathiard', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/nuits-saint-georges-rouge/
  ('Domaine Sylvain Cathiard', 'Romanée-Saint-Vivant Grand Cru', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/romanee-saint-vivant-grand-cru/
  ('Domaine Sylvain Cathiard', 'Vosne-Romanée Premier Cru Aux Malconsorts', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/vosne-romanee-1er-cru-aux-malconsorts/
  ('Domaine Sylvain Cathiard', 'Vosne-Romanée Premier Cru Aux Reignots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/vosne-romanee-1er-cru-aux-reignots/
  ('Domaine Sylvain Cathiard', 'Vosne-Romanée Premier Cru En Orveaux', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/vosne-romanee-1er-cru-en-orveaux/
  ('Domaine Sylvain Cathiard', 'Vosne-Romanée Premier Cru Les Suchots', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/vosne-romanee-1er-cru-les-suchots/
  ('Domaine Sylvain Cathiard', 'Vosne-Romanée', 'Vosne-Romanée, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.beckywasserman.com/domaines/sylvain-cathiard-et-fils/vosne-romanee/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARQUIS D'ANGERVILLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Marquis d''Angerville', 'Volnay Premier Cru Clos des Ducs', 'Volnay, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://www.domainedangerville.fr/volnay-1er-cru-clos-des-ducs-2/
  ('Marquis d''Angerville', 'Volnay Premier Cru Caillerets', 'Volnay, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://www.domainedangerville.fr/volnay-1er-cru-caillerets/
  ('Marquis d''Angerville', 'Volnay Premier Cru Champans', 'Volnay, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://www.domainedangerville.fr/volnay-1er-cru-champans/
  ('Marquis d''Angerville', 'Volnay Premier Cru Clos des Angles', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domainedangerville.fr/volnay-1er-cru-clos-des-angles/
  ('Marquis d''Angerville', 'Volnay Premier Cru Fremiet', 'Volnay, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://www.domainedangerville.fr/volnay-1er-cru-fremiet/
  ('Marquis d''Angerville', 'Volnay Premier Cru Taillepieds', 'Volnay, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://www.domainedangerville.fr/volnay-1er-cru-taillepieds/
  ('Marquis d''Angerville', 'Volnay Premier Cru', 'Volnay, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://www.domainedangerville.fr/volnay-1er-cru-mitans/
  ('Marquis d''Angerville', 'Volnay', 'Volnay, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://www.domainedangerville.fr/volnay-village-grandchamps/
  ('Marquis d''Angerville', 'Meursault Premier Cru Santenots', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainedangerville.fr/meursault-1er-cru-santenots/
  ('Marquis d''Angerville', 'Pommard Premier Cru Combes-Dessus', 'Pommard, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://www.domainedangerville.fr/pommard-1er-cru-combes-dessus/
  ('Marquis d''Angerville', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domainedangerville.fr/nos-vins-new/
  ('Marquis d''Angerville', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainedangerville.fr/nos-vins-new/
  ('Marquis d''Angerville', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.domainedangerville.fr/nos-vins-new/
  ('Marquis d''Angerville', 'Bourgogne Passetoutgrain', 'Burgundy, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Marquis%20d%27Angerville
  ('Marquis d''Angerville', 'Vin de France Petit Blanc', 'Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Marquis%20d%27Angerville
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MICHEL LAFARGE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Michel Lafarge', 'Beaune Premier Cru Clos des Aigrots Blanc', 'Beaune, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/beaune-1er-cru-les-aigrots-blanc/
  ('Michel Lafarge', 'Beaune Premier Cru Clos des Aigrots Rouge', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/beaune-1er-cru-les-aigrots-rouge/
  ('Michel Lafarge', 'Beaune Premier Cru Grèves', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/beaune-1er-cru-greves-rouge/
  ('Michel Lafarge', 'Bourgogne Aligoté Raisins Dorés', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/bourgogne-aligote-raisins-dores/
  ('Michel Lafarge', 'Bourgogne Passetoutgrain l''Exception', 'Burgundy, France', null, 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/bourgogne-passetoutgrain-lexception/
  ('Michel Lafarge', 'Bourgogne Passetoutgrain l''Exception Anthologie', 'Burgundy, France', null, 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/anthologie-bourgogne-passetoutgrain-lexception/
  ('Michel Lafarge', 'Bourgogne Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/bourgogne-pinot-noir/
  ('Michel Lafarge', 'Bourgogne Rosé Trublion', 'Burgundy, France', null, 'Rosé'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/trublion-bourgogne-rose/
  ('Michel Lafarge', 'Meursault', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/meursault-blanc/
  ('Michel Lafarge', 'Volnay', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/volnay/
  ('Michel Lafarge', 'Volnay Vendanges Sélectionnées', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/volnay-vendanges-selectionnees/
  ('Michel Lafarge', 'Volnay Premier Cru Les Caillerets', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/volnay-1er-cru-les-caillerets/
  ('Michel Lafarge', 'Volnay Premier Cru Clos du Château des Ducs', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/volnay-1er-cru-clos-du-chateau-des-ducs-monopole/
  ('Michel Lafarge', 'Volnay Premier Cru Clos des Chênes', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/volnay-1er-cru-clos-des-chenes/
  ('Michel Lafarge', 'Volnay Premier Cru Les Mitans', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/michel-lafarge/volnay-1er-cru-mitans/
  ('Michel Lafarge', 'Volnay Premier Cru Les Pitures', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.beckywasserman.com/domaines/michel-lafarge/volnay-1er-cru-les-pitures/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PIERRE MOREY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Pierre Morey', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/bourgogne-aligote-pm/
  ('Domaine Pierre Morey', 'Bourgogne Côte d''Or Chardonnay', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/bourgogne-chardonnay-pm/
  ('Domaine Pierre Morey', 'Bourgogne Côte d''Or Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/bourgogne-pinot-noir-pm/
  ('Domaine Pierre Morey', 'Meursault', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/meursault-pm/
  ('Domaine Pierre Morey', 'Meursault Les Terres Blanches', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/meursault-les-terres-blanches-pm/
  ('Domaine Pierre Morey', 'Meursault Les Tessons', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/meursault-les-tessons-pm/
  ('Domaine Pierre Morey', 'Meursault Premier Cru Perrières', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/meursault-1er-cru-perrieres-pm/
  ('Domaine Pierre Morey', 'Bâtard-Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/batard-montrachet-grand-cru-pm/
  ('Domaine Pierre Morey', 'Monthelie Rouge', 'Monthelie, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/monthelie-rouge-pm/
  ('Domaine Pierre Morey', 'Volnay Premier Cru Les Santenots', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/volnay-1er-cru-les-santenots-pm/
  ('Domaine Pierre Morey', 'Pommard Premier Cru Grands Epenots', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/pierre-morey-et-morey-blanc/pommard-1er-cru-grand-epenots-pm/
  ('Domaine Pierre Morey', 'Meursault Le Meix Tavaux', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Morey
  ('Domaine Pierre Morey', 'Puligny-Montrachet Premier Cru Les Champs Gains', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Morey
  ('Domaine Pierre Morey', 'Volnay Premier Cru Les Pitures', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Pierre%20Morey
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN-NOËL GAGNARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Jean-Noël Gagnard', 'Bâtard-Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/batard-montrachet-grand-cru/
  ('Domaine Jean-Noël Gagnard', 'Chassagne-Montrachet Champ Derrière', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/chassagne-montrachet-blanc-champ-derriere/
  ('Domaine Jean-Noël Gagnard', 'Chassagne-Montrachet Les Chaumes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/chassagne-montrachet-blanc-les-chaumes/
  ('Domaine Jean-Noël Gagnard', 'Chassagne-Montrachet Premier Cru Blanchot-Dessus', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/chassagne-montrachet-blanc-1er-cru-blanchot-dessus/
  ('Domaine Jean-Noël Gagnard', 'Chassagne-Montrachet Premier Cru Clos de la Maltroie', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/chassagne-montrachet-blanc-1er-cru-clos-de-la-maltroye/
  ('Domaine Jean-Noël Gagnard', 'Chassagne-Montrachet Premier Cru La Boudriotte', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/chassagne-montrachet-la-boudriotte-1er-cru/
  ('Domaine Jean-Noël Gagnard', 'Chassagne-Montrachet Premier Cru Les Caillerets', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/chassagne-montrachet-les-caillerets-1er-cru/
  ('Domaine Jean-Noël Gagnard', 'Chassagne-Montrachet Premier Cru Les Chaumées', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/chassagne-montrachet-blanc-1er-cru-les-chaumees/
  ('Domaine Jean-Noël Gagnard', 'Chassagne-Montrachet Rouge Cuvée L''Estimée', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/chassagne-montrachet-rouge-cuvee-lestimee/
  ('Domaine Jean-Noël Gagnard', 'Santenay Premier Cru Clos de Tavannes', 'Santenay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/santenay-1er-cru-clos-de-tavannes/
  ('Domaine Jean-Noël Gagnard', 'Bourgogne Hautes-Côtes de Beaune Sous Éguisons', 'Hautes-Côtes de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/hautes-cotes-de-beaune-blanc-sous-eguisons/
  ('Domaine Jean-Noël Gagnard', 'Bourgogne Hautes-Côtes de Beaune Clos Bortier', 'Hautes-Côtes de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/hautes-cotes-de-beaune-clos-bortier/
  ('Domaine Jean-Noël Gagnard', 'Crémant de Bourgogne Grand Lys', 'Burgundy, France', 'Pinot Noir', 'Sparkling'),  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/cremant-de-bourgogne-grand-lys/
  ('Domaine Jean-Noël Gagnard', 'Crémant de Bourgogne Lys Rosé', 'Burgundy, France', 'Pinot Noir', 'Sparkling')  -- https://www.beckywasserman.com/domaines/jean-noel-gagnard/cremant-de-bourgogne-lys-rose/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HUBERT LAMY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Hubert Lamy', 'Bourgogne Blanc Les Chataigners', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/bourgogne-blanc-les-chataigners/
  ('Domaine Hubert Lamy', 'Chassagne-Montrachet Le Concis du Champs', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/chassagne-montrachet-blanc-le-concis-du-champ/
  ('Domaine Hubert Lamy', 'Chassagne-Montrachet Premier Cru Les Chaumées', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/chassagne-montrachet-blanc-1er-cru-les-chaumees/
  ('Domaine Hubert Lamy', 'Chassagne-Montrachet Premier Cru Les Macherelles', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/chassagne-montrachet-blanc-1er-cru-macherelles/
  ('Domaine Hubert Lamy', 'Chassagne-Montrachet La Goujonne Vieilles Vignes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/chassagne-montrachet-rouge-la-goujonne/
  ('Domaine Hubert Lamy', 'Criots-Bâtard-Montrachet Grand Cru Haute Densité', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/criots-batard-montrachet-grand-cru/
  ('Domaine Hubert Lamy', 'Puligny-Montrachet Les Tremblots', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/puligny-montrachet-les-tremblots/
  ('Domaine Hubert Lamy', 'Puligny-Montrachet Les Tremblots Haute Densité', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/puligny-montrachet-les-tremblots-haute-densite/
  ('Domaine Hubert Lamy', 'Saint-Aubin La Princée', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-blanc-la-princee/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru Clos de la Chatenière', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-blanc-1er-cru-clos-de-la-chateniere/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru Clos du Meix', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-blanc-1er-cru-clos-du-meix/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru Derrière Chez Edouard', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-blanc-1er-cru-derriere-chez-edouard/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru Derrière Chez Edouard Haute Densité', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-blanc-1er-cru-derriere-chez-edouard-haute-densite/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru Les Frionnes', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-blanc-1er-cru-les-frionnes/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru Les Murgers des Dents de Chien', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-blanc-1er-cru-murgers-des-dents-de-chien/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru En Remilly', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-blanc-1er-cru-en-remilly/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru Cuvée du Paradis', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-rouge-1er-cru-cuvee-du-paradis/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru Derrière Chez Edouard Rouge Vieilles Vignes', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/saint-aubin-rouge-1er-cru-derriere-chez-edouard/
  ('Domaine Hubert Lamy', 'Santenay Premier Cru Clos des Gravières Blanc', 'Santenay, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/santenay-blanc-1er-cru-clos-des-gravieres/
  ('Domaine Hubert Lamy', 'Santenay Premier Cru Clos des Gravières Rouge', 'Santenay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/santenay-rouge-1er-cru-clos-des-gravieres/
  ('Domaine Hubert Lamy', 'Santenay Clos des Hâtes', 'Santenay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/hubert-lamy/santenay-rouge-clos-des-hates/
  ('Domaine Hubert Lamy', 'Saint-Aubin Premier Cru Clos de la Chatenière Vieilles Vignes', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Hubert%20Lamy
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- COMTE ARMAND ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Comte Armand', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.beckywasserman.com/domaines/comte-armand/bourgogne-aligote/
  ('Comte Armand', 'Bourgogne Condemaine', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/comte-armand/bourgogne-blanc-condemaine/
  ('Comte Armand', 'Bourgogne Hautes-Côtes de Nuits Le Mont', 'Hautes-Côtes de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/comte-armand/hautes-cotes-de-nuits-le-mont/
  ('Comte Armand', 'Bourgogne Hautes-Côtes de Nuits Les Millottes', 'Hautes-Côtes de Nuits, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/comte-armand/bourgogne-hautes-cotes-de-nuits-les-millottes/
  ('Comte Armand', 'Côte de Beaune Les Monsnières', 'Beaune, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/comte-armand/cote-de-beaune-les-monsnieres/
  ('Comte Armand', 'Bourgogne', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/comte-armand/bourgogne/
  ('Comte Armand', 'Bourgogne Hautes-Côtes de Beaune Le Polent', 'Hautes-Côtes de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/comte-armand/hautes-cotes-de-beaune-le-polent/
  ('Comte Armand', 'Auxey-Duresses', 'Auxey-Duresses, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/comte-armand/auxey-duresses-rouge/
  ('Comte Armand', 'Auxey-Duresses Premier Cru', 'Auxey-Duresses, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/comte-armand/auxey-duresses-1er-cru-rouge/
  ('Comte Armand', 'Volnay', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/comte-armand/volnay/
  ('Comte Armand', 'Volnay Premier Cru Fremiets', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/comte-armand/volnay-1er-cru-fremiets/
  ('Comte Armand', 'Pommard Premier Cru Clos des Epeneaux', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/comte-armand/pommard-1er-cru-clos-des-epeneaux/
  ('Comte Armand', 'Meursault', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Comte%20Armand
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SIMON BIZE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Simon Bize', 'Shiro', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/simon-bize/shiro/
  ('Simon Bize', 'Bourgogne Blanc Les Champlains', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/simon-bize/bourgogne-blanc-les-champlains/
  ('Simon Bize', 'Bourgogne Blanc Les Perrières', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/simon-bize/bourgogne-blanc-les-perrieres/
  ('Simon Bize', 'Savigny-lès-Beaune Blanc', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-blanc/
  ('Simon Bize', 'Savigny-lès-Beaune Premier Cru Aux Vergelesses Blanc', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-blanc-1er-cru-aux-vergelesses/
  ('Simon Bize', 'Corton-Charlemagne Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/simon-bize/corton-charlemagne-grand-cru/
  ('Simon Bize', 'Akashiro', 'Burgundy, France', null, 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/akashiro/
  ('Simon Bize', 'Aka', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/aka/
  ('Simon Bize', 'Sola', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/sola/
  ('Simon Bize', 'Bourgogne Rouge Les Perrières', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/bourgogne-rouge-les-perrieres/
  ('Simon Bize', 'Savigny-lès-Beaune Rouge', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-rouge/
  ('Simon Bize', 'Savigny-lès-Beaune Aux Grands Liards', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-rouge-aux-grands-liards/
  ('Simon Bize', 'Aloxe-Corton Le Suchot', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/aloxe-corton-rouge-le-suchot/
  ('Simon Bize', 'Savigny-lès-Beaune Premier Cru Les Serpentières', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-rouge-1er-cru-les-serpentieres/
  ('Simon Bize', 'Savigny-lès-Beaune Premier Cru Les Marconnets', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-rouge-1er-cru-les-marconnets/
  ('Simon Bize', 'Savigny-lès-Beaune Premier Cru Les Fournaux', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-rouge-1er-cru-les-fournaux/
  ('Simon Bize', 'Savigny-lès-Beaune Premier Cru Les Talmettes', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-rouge-1er-cru-les-talmettes/
  ('Simon Bize', 'Savigny-lès-Beaune Premier Cru Aux Guettes', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-1er-cru-aux-guettes/
  ('Simon Bize', 'Savigny-lès-Beaune Premier Cru Aux Vergelesses Rouge', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.beckywasserman.com/domaines/simon-bize/savigny-les-beaune-1er-cru-rouge-aux-vergelesses/
  ('Simon Bize', 'Latricières-Chambertin Grand Cru', 'Gevrey-Chambertin, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.beckywasserman.com/domaines/simon-bize/latricieres-chambertin-grand-cru/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BONNEAU DU MARTRAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Bonneau du Martray', 'Corton-Charlemagne Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.beckywasserman.com/domaines/bonneau-du-martray/corton-charlemagne-grand-cru/
  ('Bonneau du Martray', 'Corton Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', null, 'Red')  -- https://www.bonneaudumartray.com/fr/vins
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MARC COLIN ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Marc Colin et Fils', 'Saint-Aubin La Fontenotte', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.shiverick.com/marc-colin
  ('Domaine Marc Colin et Fils', 'Saint-Aubin Premier Cru Les Combes', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.shiverick.com/marc-colin
  ('Domaine Marc Colin et Fils', 'Saint-Aubin Premier Cru Sur le Sentier du Clou', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.shiverick.com/marc-colin
  ('Domaine Marc Colin et Fils', 'Chassagne-Montrachet Premier Cru Les Chenevottes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.shiverick.com/marc-colin
  ('Domaine Marc Colin et Fils', 'Chassagne-Montrachet Premier Cru Les Vide-Bourses', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.shiverick.com/marc-colin
  ('Domaine Marc Colin et Fils', 'Chassagne-Montrachet Premier Cru Les Champs-Gain', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.shiverick.com/marc-colin
  ('Domaine Marc Colin et Fils', 'Santenay Champs Claude Vieilles Vignes', 'Santenay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.shiverick.com/marc-colin
  ('Domaine Marc Colin et Fils', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Chassagne-Montrachet Premier Cru Les Caillerets', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Chassagne-Montrachet Margot', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Chassagne-Montrachet Vieilles Vignes Rouge', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Puligny-Montrachet Le Trézin', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Saint-Aubin Premier Cru En Remilly', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Saint-Aubin Premier Cru La Chatenière', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Saint-Aubin Premier Cru Les Castets', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
  ('Domaine Marc Colin et Fils', 'Saint-Aubin', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Marc%20Colin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PAUL PILLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Paul Pillot', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.skurnik.com/sku/bourgogne-aligote-domaine-paul-pillot/
  ('Domaine Paul Pillot', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/bourgogne-blanc-domaine-paul-pillot-3/
  ('Domaine Paul Pillot', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/bourgogne-rouge-domaine-paul-pillot-3/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-domaine-paul-pillot/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet Les Mazures', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-les-mazures-domaine-paul-pillot/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet Premier Cru La Grande Montagne', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-1er-la-grande-montagne-domaine-paul-pillot-3/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet Premier Cru La Romanée', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-1er-la-romanee-domaine-paul-pillot-4/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet Premier Cru Les Caillerets', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-1er-les-caillerets-domaine-paul-pillot-3/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet Premier Cru Les Champs Gains', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-1er-les-champs-gains-domaine-paul-pillot-3/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet Premier Cru Les Grandes Ruchottes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-1er-les-grandes-ruchottes-domaine-paul-pillot-3/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet Premier Cru Clos Saint-Jean Blanc', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-blanc-1er-clos-saint-jean-domaine-paul-pillot/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet Premier Cru Clos Saint-Jean Rouge', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/chassagne-montrachet-rouge-1er-clos-saint-jean-domaine-paul-pillot-4/
  ('Domaine Paul Pillot', 'Chassagne-Montrachet Rouge Vieilles Vignes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/chassagne-montrachet-rouge-vieilles-vignes-domaine-paul-pillot/
  ('Domaine Paul Pillot', 'Saint-Aubin Premier Cru Charmois', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/saint-aubin-1er-charmois-domaine-paul-pillot/
  ('Domaine Paul Pillot', 'Saint-Aubin Premier Cru Les Pitangerets', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/saint-aubin-1er-les-pitangerets-domaine-paul-pillot/
  ('Domaine Paul Pillot', 'Santenay Rouge Vieilles Vignes', 'Santenay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.skurnik.com/sku/santenay-rouge-vieilles-vignes-domaine-paul-pillot/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BACHELET-MONNOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Bachelet-Monnot', 'Bâtard-Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/batard-montrachet-grand-cru-bachelet-monnot-3/
  ('Bachelet-Monnot', 'Bourgogne Côte d''Or Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/bourgogne-cote-dor-blanc-bachelet-monnot-2/
  ('Bachelet-Monnot', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/bourgogne-rouge-bachelet-monnot-3/
  ('Bachelet-Monnot', 'Chassagne-Montrachet', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-bachelet-monnot-4/
  ('Bachelet-Monnot', 'Maranges Premier Cru La Fussière Blanc', 'Maranges, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/maranges-blanc-1er-la-fussiere-bachelet-monnot-3/
  ('Bachelet-Monnot', 'Maranges Premier Cru Clos de la Boutière', 'Maranges, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/maranges-rouge-1er-clos-de-la-boutiere-bachelet-monnot-4/
  ('Bachelet-Monnot', 'Maranges Premier Cru La Fussière Rouge', 'Maranges, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/maranges-rouge-1er-la-fussiere-bachelet-monnot-4/
  ('Bachelet-Monnot', 'Maranges Premier Cru Les Clos Roussots', 'Maranges, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/maranges-rouge-1er-les-clos-roussots-bachelet-monnot-5/
  ('Bachelet-Monnot', 'Maranges Rouge Vieilles Vignes', 'Maranges, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/maranges-rouge-vieilles-vignes-bachelet-monnot-4/
  ('Bachelet-Monnot', 'Meursault Clos du Cromin', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/meursault-clos-du-cromin-bachelet-monnot-4/
  ('Bachelet-Monnot', 'Pommard', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/pommard-bachelet-monnot/
  ('Bachelet-Monnot', 'Puligny-Montrachet', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/puligny-montrachet-bachelet-monnot-4/
  ('Bachelet-Monnot', 'Puligny-Montrachet Premier Cru Les Folatières', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/puligny-montrachet-1er-les-folatieres-bachelet-monnot-4/
  ('Bachelet-Monnot', 'Puligny-Montrachet Premier Cru Les Referts', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/puligny-montrachet-1er-les-referts-bachelet-monnot-4/
  ('Bachelet-Monnot', 'Saint-Aubin Premier Cru En Remilly', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/saint-aubin-1er-en-remilly-bachelet-monnot-3/
  ('Bachelet-Monnot', 'Santenay Blanc', 'Santenay, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/santenay-blanc-bachelet-monnot-3/
  ('Bachelet-Monnot', 'Santenay Les Charmes Dessus', 'Santenay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.skurnik.com/sku/santenay-rouge-les-charmes-dessus-bachelet-monnot-4/
  ('Bachelet-Monnot', 'Santenay Les Prarons Dessus', 'Santenay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.skurnik.com/sku/santenay-rouge-les-prarons-dessus-bachelet-monnot-4/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN-MARC PILLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Jean-Marc Pillot', 'Chassagne-Montrachet Premier Cru Les Chenevottes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-1er-cru-les-chenevottes-jean-marc-pillot-2/
  ('Domaine Jean-Marc Pillot', 'Chassagne-Montrachet Premier Cru Morgeot Les Fairendes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-blanc-1er-cru-morgeot-les-fairends-domaine-jean-marc-pillot-3/
  ('Domaine Jean-Marc Pillot', 'Chassagne-Montrachet Les Masures', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.skurnik.com/sku/chassagne-montrachet-blanc-les-masures-jean-marc-pillot-2/
  ('Domaine Jean-Marc Pillot', 'Puligny-Montrachet Les Noyers Brets', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.skurnik.com/sku/puligny-montrachet-les-noyers-brets-domaine-jean-marc-pillot-3/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MOREY-COFFINET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Morey-Coffinet', 'Bourgogne Côte d''Or Chardonnay', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/bourgogne-cote-d-or-chardonnay/2022
  ('Domaine Morey-Coffinet', 'Bourgogne Côte d''Or Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.morey-coffinet.com/fr_FR/vin/bourgogne-cote-d-or-pinot-noir/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Les Houillères', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-les-houilleres/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Premier Cru Les Fairendes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-1er-cru-les-fairendes/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Premier Cru En Cailleret', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-1er-cru-en-cailleret/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Premier Cru La Romanée', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-1er-cru-la-romanee/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Premier Cru En Remilly', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-1er-cru-en-remilly/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Premier Cru Dent de Chien', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-1er-cru-dent-de-chien/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Premier Cru Blanchot-Dessus', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-1er-cru-blanchot-dessus/2022
  ('Domaine Morey-Coffinet', 'Puligny-Montrachet Premier Cru Les Pucelles', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/puligny-montrachet-1er-cru-les-pucelles/2022
  ('Domaine Morey-Coffinet', 'Bâtard-Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.morey-coffinet.com/fr_FR/vin/batard-montrachet-grand-cru/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Les Chambres', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-les-chambres/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Les Chaumes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-les-chaumes/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Premier Cru Morgeot', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-1er-cru-morgeot/2022
  ('Domaine Morey-Coffinet', 'Chassagne-Montrachet Premier Cru Clos Saint-Jean', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.morey-coffinet.com/fr_FR/vin/chassagne-montrachet-1er-cru-clos-saint-jean/2022
  ('Domaine Morey-Coffinet', 'Puligny-Montrachet Premier Cru Les Combettes', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Morey-Coffinet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HENRI BOILLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Henri Boillot', 'Bâtard-Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Puligny-Montrachet', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Puligny-Montrachet Premier Cru Clos de la Mouchère', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Puligny-Montrachet Premier Cru Les Combettes', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Puligny-Montrachet Premier Cru Les Perrières', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Puligny-Montrachet Premier Cru Les Pucelles', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Meursault', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Meursault Premier Cru Les Genevrières', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Meursault Premier Cru Les Gouttes d''Or', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Meursault Premier Cru Clos Richemont', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Pommard Premier Cru Clos Blanc', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Volnay', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Volnay Premier Cru Les Caillerets', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Volnay Premier Cru Les Chevrets', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.henri-boillot.com/wines
  ('Domaine Henri Boillot', 'Volnay Premier Cru Les Fremiets', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.henri-boillot.com/wines
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JACQUES CARILLON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Jacques Carillon', 'Bienvenues-Bâtard-Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://jacques-carillon.com/nos-vins/bienvenues-batard-montrachet/
  ('Jacques Carillon', 'Chassagne-Montrachet', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://jacques-carillon.com/nos-vins/chassagne-montrachet-2/
  ('Jacques Carillon', 'Puligny-Montrachet', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://jacques-carillon.com/nos-vins/puligny-montrachet-2/
  ('Jacques Carillon', 'Puligny-Montrachet Premier Cru Les Champs Canet', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://jacques-carillon.com/nos-vins/puligny-montrachet-1er-cru-les-champs-canet/
  ('Jacques Carillon', 'Puligny-Montrachet Premier Cru Les Perrières', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://jacques-carillon.com/nos-vins/puligny-montrachet-1er-cru-les-perrieres/
  ('Jacques Carillon', 'Puligny-Montrachet Premier Cru Les Referts', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://jacques-carillon.com/nos-vins/puligny-montrachet-1er-cru-les-referts/
  ('Jacques Carillon', 'Saint-Aubin Premier Cru Les Pitangerets', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://jacques-carillon.com/nos-vins/saint-aubin-1er-cru-les-pitangerets/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE RAPET PÈRE ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Rapet Père et Fils', 'Aloxe-Corton', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Beaune Premier Cru Bressandes', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Beaune Premier Cru Clos du Roi', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Beaune Premier Cru Les Cents Vignes', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Chorey-lès-Beaune Vieilles Vignes', 'Chorey-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Corton Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Corton-Charlemagne Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Pernand-Vergelesses Premier Cru En Caradeux', 'Pernand-Vergelesses, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Pernand-Vergelesses Premier Cru Île de Vergelesses', 'Pernand-Vergelesses, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Pernand-Vergelesses Les Belles Filles', 'Pernand-Vergelesses, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Pernand-Vergelesses Les Combottes', 'Pernand-Vergelesses, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Savigny-lès-Beaune Aux Fournaux', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Savigny-lès-Beaune', 'Savigny-lès-Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/1562-Rapet-Pere--Fils.jsp
  ('Domaine Rapet Père et Fils', 'Pernand-Vergelesses Premier Cru Les Vergelesses', 'Pernand-Vergelesses, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.alliancewine.com/our-producers/domaine-rapet-pere-et-fils
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BALLOT-MILLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Ballot-Millot', 'Pommard Premier Cru La Refène', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ballot%20Millot
  ('Domaine Ballot-Millot', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.polanerselections.com/producers/ballot-millot/
  ('Domaine Ballot-Millot', 'Volnay Premier Cru Santenots', 'Volnay, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://www.polanerselections.com/producers/ballot-millot/
  ('Domaine Ballot-Millot', 'Pommard Premier Cru Charmots', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/B2093214-6019-4-bottles-Pommard-1er-Cru-Charmots-Domaine-Ballot-Millot-no-reserve-2015-Red
  ('Domaine Ballot-Millot', 'Pommard Premier Cru Pézerolles', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-a-wine/B2120001-4265-1-bottle-Pommard-1er-Cru-Pezerolles-Domaine-Ballot-Millot-2015-Red
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BERNARD MOREAU ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Bernard Moreau et Fils', 'Chassagne-Montrachet', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Bernard%20Moreau%20et%20Fils
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE COURCEL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine de Courcel', 'Pommard Premier Cru Grand Clos des Epenots', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20Courcel
  ('Domaine de Courcel', 'Pommard Les Vaumuriens', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20Courcel
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA POUSSE D'OR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine de la Pousse d''Or', 'Chambolle-Musigny Premier Cru Les Amoureuses', 'Chambolle-Musigny, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Pousse%20d%27Or
  ('Domaine de la Pousse d''Or', 'Chevalier-Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Pousse%20d%27Or
  ('Domaine de la Pousse d''Or', 'Clos de la Roche Grand Cru', 'Morey-Saint-Denis, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Pousse%20d%27Or
  ('Domaine de la Pousse d''Or', 'Corton Grand Cru Clos du Roi', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Pousse%20d%27Or
  ('Domaine de la Pousse d''Or', 'Puligny-Montrachet Premier Cru Le Cailleret', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Pousse%20d%27Or
  ('Domaine de la Pousse d''Or', 'Volnay Premier Cru Clos d''Audignac', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Pousse%20d%27Or
  ('Domaine de la Pousse d''Or', 'Volnay Premier Cru Clos des 60 Ouvrées', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Pousse%20d%27Or
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MATROT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Matrot', 'Auxey-Duresses', 'Auxey-Duresses, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Blagny Premier Cru La Pièce sous le Bois', 'Meursault, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Bourgogne Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Corton-Charlemagne Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Maranges Premier Cru La Fussière', 'Maranges, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Meursault Premier Cru Blagny', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Meursault Premier Cru Charmes', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Meursault Rouge', 'Meursault, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Meursault', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Puligny-Montrachet Premier Cru Les Chalumeaux', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
  ('Domaine Matrot', 'Saint-Romain Blanc', 'Saint-Romain, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20Matrot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GUY AMIOT ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Guy Amiot et Fils', 'Chassagne-Montrachet Premier Cru La Maltroie Rouge', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Guy%20Amiot%20et%20Fils
  ('Domaine Guy Amiot et Fils', 'Bourgogne Chardonnay Cuvée Flavie', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://houseoftownend.com/producers/domaine-guy-amiot-et-fils
  ('Domaine Guy Amiot et Fils', 'Chassagne-Montrachet Vieilles Vignes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', null, 'White'),  -- https://houseoftownend.com/producers/domaine-guy-amiot-et-fils
  ('Domaine Guy Amiot et Fils', 'Chassagne-Montrachet Vieilles Vignes Rouge', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', null, 'Red'),  -- https://houseoftownend.com/producers/domaine-guy-amiot-et-fils
  ('Domaine Guy Amiot et Fils', 'Chassagne-Montrachet Premier Cru Les Caillerets', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', null, 'White'),  -- https://houseoftownend.com/producers/domaine-guy-amiot-et-fils
  ('Domaine Guy Amiot et Fils', 'Chassagne-Montrachet Premier Cru Les Macherelles', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', null, 'White'),  -- https://houseoftownend.com/producers/domaine-guy-amiot-et-fils
  ('Domaine Guy Amiot et Fils', 'Chassagne-Montrachet Premier Cru Les Vergers', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', null, 'White'),  -- https://houseoftownend.com/producers/domaine-guy-amiot-et-fils
  ('Domaine Guy Amiot et Fils', 'Puligny-Montrachet Premier Cru Les Demoiselles', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', null, 'White'),  -- https://houseoftownend.com/producers/domaine-guy-amiot-et-fils
  ('Domaine Guy Amiot et Fils', 'Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://houseoftownend.com/producers/domaine-guy-amiot-et-fils
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MICHEL BOUZEREAU ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Michel Bouzereau et Fils', 'Beaune Premier Cru Les Vignes Franches', 'Beaune, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Bourgogne Côte d''Or Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Meursault Premier Cru Les Charmes Dessus', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Meursault Premier Cru Les Genevrières', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Meursault Premier Cru Perrières', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Meursault Le Limozin', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Meursault Les Grands Charrons', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Meursault Les Tessons', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Pommard Les Cras', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Puligny-Montrachet Premier Cru Les Champs Gains', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
  ('Domaine Michel Bouzereau et Fils', 'Volnay Premier Cru Les Aussy', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Michel%20Bouzereau%20et%20Fils
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PATRICK JAVILLIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Patrick Javillier', 'Meursault Les Tillets', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Patrick%20Javillier
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE THOMAS MOREY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Thomas Morey', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Chassagne-Montrachet', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Chassagne-Montrachet Premier Cru Clos Saint-Jean', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Chassagne-Montrachet Premier Cru Les Baudines', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Chassagne-Montrachet Premier Cru Les Chenevottes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Chassagne-Montrachet Premier Cru Les Embrazées', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Chassagne-Montrachet Premier Cru Les Macherelles', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Chassagne-Montrachet Premier Cru Morgeot', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Chassagne-Montrachet Rouge Vieilles Vignes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Pommard Premier Cru Les Chanlins', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Saint-Aubin', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
  ('Domaine Thomas Morey', 'Santenay Vieilles Vignes', 'Santenay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Thomas%20Morey
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- VINCENT DANCER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Vincent Dancer', 'Chassagne-Montrachet', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Vincent%20Dancer
  ('Vincent Dancer', 'Chassagne-Montrachet Premier Cru Morgeot Tête du Clos', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Vincent%20Dancer
  ('Vincent Dancer', 'Chassagne-Montrachet Premier Cru La Romanée', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Vincent%20Dancer
  ('Vincent Dancer', 'Chassagne-Montrachet Premier Cru Morgeot', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Vincent%20Dancer
  ('Vincent Dancer', 'Chevalier-Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Vincent%20Dancer
  ('Vincent Dancer', 'Meursault Premier Cru Perrières', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Vincent%20Dancer
  ('Vincent Dancer', 'Meursault Les Corbins', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Vincent%20Dancer
  ('Vincent Dancer', 'Meursault Les Grands Charrons', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Vincent%20Dancer
  ('Vincent Dancer', 'Pommard Premier Cru Les Pézerolles', 'Pommard, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Vincent%20Dancer
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- HEITZ-LOCHARDET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Heitz-Lochardet', 'Pommard Premier Cru Les Pézerolles', 'Pommard, Côte de Beaune, Burgundy, France', null, 'Red')  -- https://onshorecellars.com/fr/products/heitz-lochardet-pezerolles-pommard-1er-cru
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BITOUZET-PRIEUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Bitouzet-Prieur', 'Volnay Premier Cru Caillerets', 'Volnay, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.bbr.com/products-20198025380-2019-volnay-caillerets-1er-cru-domaine-bitouzet-prieur-burgundy
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LAROCHE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Laroche', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://larochewines.com/en/chablis-in-burgundy/
  ('Domaine Laroche', 'Chablis Les Chanoines', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://larochewines.com/en/chablis-in-burgundy/
  ('Domaine Laroche', 'Chablis Saint Martin', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Vieille Voye', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Premier Cru Les Vaudevey', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Premier Cru Les Beauroys', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Premier Cru Côte de Léchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Premier Cru Les Vaillons Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Premier Cru Les Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Premier Cru Les Butteaux', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Premier Cru Les Fourchaumes Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Premier Cru L''Homme Mort', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://larochewines.com/en/chablis-in-burgundy/
  ('Domaine Laroche', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://larochewines.com/en/chablis-in-burgundy/
  ('Domaine Laroche', 'Chablis Grand Cru Les Bouguerots', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Grand Cru Les Blanchots', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-laroche/
  ('Domaine Laroche', 'Chablis Grand Cru Les Blanchots Réserve de l''Obédience', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://wilsondaniels.com/winery/domaine-laroche/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JEAN-MARC BROCARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Jean-Marc Brocard', 'Petit Chablis Les Jeunes Terres', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Sainte Claire', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Premier Cru Butteaux', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Premier Cru Fourchaume', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Premier Cru Vau de Vey', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Premier Cru Vaucoupin', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Premier Cru Vaulorent', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Grand Cru Blanchots', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Grand Cru Bougros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Grand Cru Grenouilles', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Grand Cru Les Preuses', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Grand Cru Valmur', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Chablis Grand Cru Vaudésir', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Les 7 Lieux Petit Chablis Les Plantes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Les 7 Lieux Chablis 7ème', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Les 7 Lieux Chablis La Boissonneuse', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Les 7 Lieux Chablis Premier Cru Côte de Léchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Les 7 Lieux Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Les 7 Lieux Chablis Premier Cru Vaudevey', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://brocard.fr/en/wines-vineyards/
  ('Jean-Marc Brocard', 'Les 7 Lieux Chablis Grand Cru Les Preuses', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://brocard.fr/en/wines-vineyards/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LOUIS MICHEL & FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Louis Michel & Fils', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-et-petit-chablis
  ('Louis Michel & Fils', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-et-petit-chablis
  ('Louis Michel & Fils', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-premier-cru
  ('Louis Michel & Fils', 'Chablis Premier Cru Vaulorent', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-premier-cru
  ('Louis Michel & Fils', 'Chablis Premier Cru Séchets', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-premier-cru
  ('Louis Michel & Fils', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-premier-cru
  ('Louis Michel & Fils', 'Chablis Premier Cru Butteaux Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-premier-cru
  ('Louis Michel & Fils', 'Chablis Premier Cru Butteaux', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-premier-cru
  ('Louis Michel & Fils', 'Chablis Premier Cru Forêts', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-premier-cru
  ('Louis Michel & Fils', 'Chablis Premier Cru Montmain', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-premier-cru
  ('Louis Michel & Fils', 'Chablis Grand Cru Grenouilles', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-grand-cru
  ('Louis Michel & Fils', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.louismicheletfils.com/en/chablis-grand-cru
  ('Louis Michel & Fils', 'Chablis Grand Cru Vaudésir', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://www.louismicheletfils.com/en/chablis-grand-cru
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LONG-DEPAQUIT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Long-Depaquit', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Premier Cru Les Beugnons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Premier Cru Les Lys', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Premier Cru Les Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Premier Cru Les Vaucopins', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Grand Cru Bougros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Grand Cru Les Blanchots', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Grand Cru Les Preuses', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Grand Cru Les Vaudésirs', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
  ('Domaine Long-Depaquit', 'Chablis Grand Cru Moutonne Monopole', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://www.albert-bichot.com/en/chablis-1er-cru-les-lys_139
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LA CHABLISIENNE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('La Chablisienne', 'Petit Chablis Vibrant', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-petit-chablis.html
  ('La Chablisienne', 'Petit Chablis Dame Nature', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-petit-chablis.html
  ('La Chablisienne', 'Chablis La Sereine', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-chablis.html
  ('La Chablisienne', 'Chablis Les Vénérables', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-chablis.html
  ('La Chablisienne', 'Chablis Le Finage', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-chablis.html
  ('La Chablisienne', 'Chablis La Pierrelée', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-chablis.html
  ('La Chablisienne', 'Chablis Dame Nature', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-chablis.html
  ('La Chablisienne', 'Chablis Premier Cru Grande Cuvée', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru Côte de Léchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru Fourchaume', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru Les Fourneaux', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru Les Lys', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru L''Homme Mort', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Premier Cru Vaulorent', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-premiers-cru.html
  ('La Chablisienne', 'Chablis Grand Cru Château Grenouilles', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-grand-cru.html
  ('La Chablisienne', 'Chablis Grand Cru Bougros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-grand-cru.html
  ('La Chablisienne', 'Chablis Grand Cru Blanchot', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-grand-cru.html
  ('La Chablisienne', 'Chablis Grand Cru Les Preuses', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-grand-cru.html
  ('La Chablisienne', 'Chablis Grand Cru Vaudésir', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://chablisienne.com/en/the-wines/nos-grand-cru.html
  ('La Chablisienne', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://chablisienne.com/en/the-wines/nos-grand-cru.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BILLAUD-SIMON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Billaud-Simon', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Tête d''Or', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Premier Cru Les Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Premier Cru Fourchaume', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Premier Cru Vaulorent', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Grand Cru Valmur', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Grand Cru Bougros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Grand Cru Vaudésir', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Grand Cru Les Blanchots', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
  ('Domaine Billaud-Simon', 'Chablis Grand Cru Les Preuses', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://wilsondaniels.com/winery/domaine-billaud-simon/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CHRISTIAN MOREAU PÈRE & FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Christian Moreau Père & Fils', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://frederickwildman.com/producers/domaine-christian-moreau-pere-et-fils/
  ('Domaine Christian Moreau Père & Fils', 'Chablis Premier Cru Vaillon', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://frederickwildman.com/producers/domaine-christian-moreau-pere-et-fils/
  ('Domaine Christian Moreau Père & Fils', 'Chablis Premier Cru Guymoreau', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://frederickwildman.com/producers/domaine-christian-moreau-pere-et-fils/
  ('Domaine Christian Moreau Père & Fils', 'Chablis Grand Cru Vaudésir', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://frederickwildman.com/producers/domaine-christian-moreau-pere-et-fils/
  ('Domaine Christian Moreau Père & Fils', 'Chablis Grand Cru Valmur', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://frederickwildman.com/producers/domaine-christian-moreau-pere-et-fils/
  ('Domaine Christian Moreau Père & Fils', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://frederickwildman.com/producers/domaine-christian-moreau-pere-et-fils/
  ('Domaine Christian Moreau Père & Fils', 'Chablis Grand Cru Les Clos Clos des Hospices', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://frederickwildman.com/producers/domaine-christian-moreau-pere-et-fils/
  ('Domaine Christian Moreau Père & Fils', 'Chablis Grand Cru Les Blanchots', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://frederickwildman.com/producers/domaine-christian-moreau-pere-et-fils/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- SAMUEL BILLAUD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Samuel Billaud', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.frw.co.uk/producer/612ec2800600000000001522/samuel-billaud
  ('Samuel Billaud', 'Chablis Les Grands Terroirs', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bbr.com/products-20198011000-2019-chablis-les-grands-terroirs-samuel-billaud-burgundy
  ('Samuel Billaud', 'Chablis Premier Cru Séchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://closcachet.com.au/pages/domaine-samuel-billaud
  ('Samuel Billaud', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://closcachet.com.au/pages/domaine-samuel-billaud
  ('Samuel Billaud', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://closcachet.com.au/pages/domaine-samuel-billaud
  ('Samuel Billaud', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://closcachet.com.au/pages/domaine-samuel-billaud
  ('Samuel Billaud', 'Chablis Grand Cru Les Preuses', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://closcachet.com.au/pages/domaine-samuel-billaud
  ('Samuel Billaud', 'Chablis Grand Cru Vaudésir', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://closcachet.com.au/pages/domaine-samuel-billaud
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE VINCENT DAUVISSAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Vincent Dauvissat', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://insideburgundy.com/overview/domaine-vincent-dauvissat
  ('Domaine Vincent Dauvissat', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://insideburgundy.com/overview/domaine-vincent-dauvissat
  ('Domaine Vincent Dauvissat', 'Chablis Premier Cru La Forest', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://insideburgundy.com/overview/domaine-vincent-dauvissat
  ('Domaine Vincent Dauvissat', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://insideburgundy.com/overview/domaine-vincent-dauvissat
  ('Domaine Vincent Dauvissat', 'Chablis Premier Cru Séchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://insideburgundy.com/overview/domaine-vincent-dauvissat
  ('Domaine Vincent Dauvissat', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://insideburgundy.com/overview/domaine-vincent-dauvissat
  ('Domaine Vincent Dauvissat', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://insideburgundy.com/overview/domaine-vincent-dauvissat
  ('Domaine Vincent Dauvissat', 'Chablis Grand Cru Les Preuses', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://insideburgundy.com/overview/domaine-vincent-dauvissat
  ('Domaine Vincent Dauvissat', 'Irancy', 'Irancy, Burgundy, France', null, 'Red')  -- https://www.alliancewine.com/our-producers/vincent-dauvissat
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PATRICK PIUZE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Patrick Piuze', 'Bourgogne Aligoté 1953', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Bourgogne Tonnerre Boutots', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis La Grande Vallée', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Les Bas de Chapelots', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Terroir de Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Terroir de Chichée', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Terroir de Courgis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Terroir de Fleys', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Terroir de Fyé', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Terroir de la Chapelle', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis La Butte O', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Premier Cru Butteaux', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Premier Cru Les Forêts', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Premier Cru Les Roncières', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Premier Cru Les Sechets', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Premier Cru Vaillons Les Minots', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Premier Cru Vaucoupin', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Premier Cru Vaulorent', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Premier Cru Vosgros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Chablis Grand Cru Bougros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/taxonomy/term/1076/all
  ('Domaine Patrick Piuze', 'Petit Chablis Fortis', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://www.bowlerwine.com/taxonomy/term/1076/all
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- PATTES LOUP ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Pattes Loup', 'Chablis Vent d''Ange Mise Tardive', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/thomas-pico-chablis-mise-tardive-vent-d-ange-domaine-pattes-loup-2022.html
  ('Pattes Loup', 'Chablis Premier Cru Butteaux Mise Tardive', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/thomas-pico-chablis-mise-tardive-vent-d-ange-domaine-pattes-loup-2022.html
  ('Pattes Loup', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/thomas-pico-chablis-mise-tardive-vent-d-ange-domaine-pattes-loup-2022.html
  ('Pattes Loup', 'Chablis Premier Cru Côte de Jouan', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.closdesspiritueux.com/domaine-pattes-loup-chablis-1er-cru-cote-de-jouan-2022-en.html
  ('Pattes Loup', 'Chablis Premier Cru Beauregard Mise Tardive', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://www.closdesspiritueux.com/domaine-pattes-loup-chablis-1er-cru-beauregard-mise-tardive-2022-en.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ALICE ET OLIVIER DE MOOR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Alice et Olivier De Moor', 'Chablis L''Humeur du Temps', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://bowlerwine.com/producer/de-moor
  ('Domaine Alice et Olivier De Moor', 'Chablis Coteau de Rosette', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://bowlerwine.com/producer/de-moor
  ('Domaine Alice et Olivier De Moor', 'Chablis Bel-Air et Clardy', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://bowlerwine.com/producer/de-moor
  ('Domaine Alice et Olivier De Moor', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://bowlerwine.com/producer/de-moor
  ('Domaine Alice et Olivier De Moor', 'Chablis Premier Cru Vau de Vey', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://bowlerwine.com/producer/de-moor
  ('Domaine Alice et Olivier De Moor', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://bowlerwine.com/producer/de-moor
  ('Domaine Alice et Olivier De Moor', 'Bourgogne Aligoté Plantation 1902', 'Burgundy, France', 'Aligoté', 'White'),  -- https://bowlerwine.com/producer/de-moor
  ('Domaine Alice et Olivier De Moor', 'Vendangeur Masqué Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://bowlerwine.com/producer/de-moor
  ('Domaine Alice et Olivier De Moor', 'Vendangeur Masqué Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red')  -- https://bowlerwine.com/producer/de-moor
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BERNARD DEFAIX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Bernard Defaix', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Vieille Vigne', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Sans Soufre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Premier Cru Les Lys', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Premier Cru Côte de Léchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Premier Cru Côte de Léchet Réserve', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Premier Cru Fourchaume', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Grand Cru Vaudésir', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Grand Cru Bougros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bernard-defaix.com/fr/vins
  ('Domaine Bernard Defaix', 'Saint-Bris', 'Saint-Bris, Burgundy, France', null, 'White')  -- https://www.bernard-defaix.com/fr/vins
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MOREAU-NAUDET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Moreau-Naudet', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://grandcruselections.com/moreaunaudet-new
  ('Domaine Moreau-Naudet', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://grandcruselections.com/moreaunaudet-new
  ('Domaine Moreau-Naudet', 'Chablis Vieilles Vignes Les Pargues', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://grandcruselections.com/moreaunaudet-new
  ('Domaine Moreau-Naudet', 'Chablis Premier Cru Beauregard', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://grandcruselections.com/moreaunaudet-new
  ('Domaine Moreau-Naudet', 'Chablis Premier Cru Forêts', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://grandcruselections.com/moreaunaudet-new
  ('Domaine Moreau-Naudet', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://grandcruselections.com/moreaunaudet-new
  ('Domaine Moreau-Naudet', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://grandcruselections.com/moreaunaudet-new
  ('Domaine Moreau-Naudet', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://grandcruselections.com/moreaunaudet-new
  ('Domaine Moreau-Naudet', 'Chablis Grand Cru Valmur', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://grandcruselections.com/moreaunaudet-new
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE VOCORET & FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Vocoret & Fils', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Premier Cru Forêts', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Premier Cru Forêts Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Premier Cru Vaillons Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Premier Cru Côte de Léchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Grand Cru Blanchot', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
  ('Domaine Vocoret & Fils', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://www.burgundy-report.com/burgundy-report-extra/03-2023/vocoret-2021/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- GILBERT PICQ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Gilbert Picq', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105928
  ('Gilbert Picq', 'Chablis Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105928
  ('Gilbert Picq', 'Chablis Dessus la Carrière', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105928
  ('Gilbert Picq', 'Chablis Premier Cru Vosgros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105928
  ('Gilbert Picq', 'Chablis Premier Cru Vaucoupin', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://insideburgundy.com/?p=186778
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PINSON FRÈRES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Pinson Frères', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
  ('Domaine Pinson Frères', 'Chablis Mademoiselle', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
  ('Domaine Pinson Frères', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
  ('Domaine Pinson Frères', 'Chablis Premier Cru Vaugiraut', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
  ('Domaine Pinson Frères', 'Chablis Premier Cru Forêt', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
  ('Domaine Pinson Frères', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
  ('Domaine Pinson Frères', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
  ('Domaine Pinson Frères', 'Chablis Grand Cru Les Preuses', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
  ('Domaine Pinson Frères', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
  ('Domaine Pinson Frères', 'Chablis Grand Cru Les Clos Authentique', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://www.burgundy-report.com/burgundy-report-extra/01-2024/pinson-2022/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE SERVIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Servin', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Les Pargues Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Premier Cru Forêts', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Premier Cru Butteaux', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Premier Cru Vaucoupin', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Grand Cru Blanchot', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Grand Cru Les Preuses', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Grand Cru Bougros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
  ('Domaine Servin', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://www.burgundy-report.com/burgundy-report-extra/01-2023/servin-2021/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN COLLET & FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Jean Collet & Fils', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Vallée de Valvans', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Premier Cru Les Forêts', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Premier Cru Butteaux', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Premier Cru Séchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Grand Cru Valmur', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://thesourceimports.com/?p=33407
  ('Domaine Jean Collet & Fils', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://thesourceimports.com/?p=33407
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GÉRARD DUPLESSIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Gérard Duplessis', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=67876
  ('Domaine Gérard Duplessis', 'Chablis Premier Cru Vaugiraut', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=67876
  ('Domaine Gérard Duplessis', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=67876
  ('Domaine Gérard Duplessis', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=67876
  ('Domaine Gérard Duplessis', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=67876
  ('Domaine Gérard Duplessis', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=67876
  ('Domaine Gérard Duplessis', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=67876
  ('Domaine Gérard Duplessis', 'Chablis Premier Cru Fourchaume', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://insideburgundy.com/?p=184241
  ('Domaine Gérard Duplessis', 'Petit Chablis Sur les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://insideburgundy.com/?p=184241
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DANIEL-ÉTIENNE DEFAIX ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Daniel-Étienne Defaix', 'Chablis Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/daniel-etienne-defaix
  ('Daniel-Étienne Defaix', 'Chablis Très Vieilles Vignes', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/daniel-etienne-defaix
  ('Daniel-Étienne Defaix', 'Chablis Premier Cru Côte de Léchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/daniel-etienne-defaix
  ('Daniel-Étienne Defaix', 'Chablis Premier Cru Vaillon', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/daniel-etienne-defaix
  ('Daniel-Étienne Defaix', 'Chablis Premier Cru Les Lys', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/daniel-etienne-defaix
  ('Daniel-Étienne Defaix', 'Chablis Grand Cru Blanchot', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/daniel-etienne-defaix
  ('Daniel-Étienne Defaix', 'Chablis Grand Cru Grenouilles', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/daniel-etienne-defaix
  ('Daniel-Étienne Defaix', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.grandcruwijnen.nl/en/wines/wijnhuis/daniel-etienne-defaix
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GARNIER ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Garnier et Fils', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105898
  ('Domaine Garnier et Fils', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105898
  ('Domaine Garnier et Fils', 'Chablis Premier Cru Beauroy', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105898
  ('Domaine Garnier et Fils', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105898
  ('Domaine Garnier et Fils', 'Chablis Premier Cru Fourchaume', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105898
  ('Domaine Garnier et Fils', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105898
  ('Domaine Garnier et Fils', 'Chablis Grand Cru Les Clos', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=105898
  ('Domaine Garnier et Fils', 'Chablis Grains Dorés', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://www.hachette-vins.com/guide-vins/les-vins/domaine-garnier-et-fils-grains-dores-2002-2005/20053737
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JEAN DAUVISSAT PÈRE ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Jean Dauvissat Père et Fils', 'Petit Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=44801
  ('Jean Dauvissat Père et Fils', 'Chablis', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=44801
  ('Jean Dauvissat Père et Fils', 'Chablis Cuvée Claire', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=44801
  ('Jean Dauvissat Père et Fils', 'Chablis Héritage', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=44801
  ('Jean Dauvissat Père et Fils', 'Chablis Premier Cru Côte de Léchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=44801
  ('Jean Dauvissat Père et Fils', 'Chablis Premier Cru Montmains', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=44801
  ('Jean Dauvissat Père et Fils', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=44801
  ('Jean Dauvissat Père et Fils', 'Chablis Premier Cru Fourchaume', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/?p=44801
  ('Jean Dauvissat Père et Fils', 'Chablis Premier Cru L''Homme Mort', 'Chablis, Burgundy, France', 'Chardonnay', 'White')  -- https://www.burgundy-report.com/?p=44801
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE A. ET P. DE VILLAINE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine A. et P. de Villaine', 'Bouzeron', 'Bouzeron, Côte Chalonnaise, Burgundy, France', 'Aligoté', 'White'),  -- https://www.de-villaine.com/fr/les-vins/1/bouzeron
  ('Domaine A. et P. de Villaine', 'Bourgogne Côte Chalonnaise Les Clous Aimé', 'Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.de-villaine.com/fr/les-vins/10/bourgogne-cote-chalonnaise-les-clous-aime
  ('Domaine A. et P. de Villaine', 'Rully Les Saint-Jacques', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.de-villaine.com/fr/les-vins/2/rully-les-saint-jacques
  ('Domaine A. et P. de Villaine', 'Rully Premier Cru Margotés', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.de-villaine.com/fr/les-vins/12/rully-1er-cru-margotes
  ('Domaine A. et P. de Villaine', 'Rully Premier Cru Grésigny', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.de-villaine.com/fr/les-vins/9/rully-1er-cru-gresigny
  ('Domaine A. et P. de Villaine', 'Rully Premier Cru Montpalais', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.de-villaine.com/fr/les-vins/11/rully-1er-cru-montpalais
  ('Domaine A. et P. de Villaine', 'Rully Premier Cru Cloux Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.de-villaine.com/fr/les-vins
  ('Domaine A. et P. de Villaine', 'Rully Premier Cru Raclot', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.de-villaine.com/fr/les-vins/18/rully-1er-cru-raclot
  ('Domaine A. et P. de Villaine', 'Rully Premier Cru Rabourcé', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.de-villaine.com/fr/les-vins/17/rully-1er-cru-rabource
  ('Domaine A. et P. de Villaine', 'Saint-Aubin Premier Cru Les Perrières', 'Saint-Aubin, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.de-villaine.com/fr/les-vins/13/saint-aubin-1er-cru-les-perrieres
  ('Domaine A. et P. de Villaine', 'Bourgogne Côte Chalonnaise La Digoine', 'Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.de-villaine.com/fr/les-vins/4/bourgogne-cote-chalonnaise-la-digoine
  ('Domaine A. et P. de Villaine', 'Bourgogne Côte Chalonnaise La Fortune', 'Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.de-villaine.com/fr/les-vins/7/bourgogne-cote-chalonnaise-la-fortune
  ('Domaine A. et P. de Villaine', 'Mercurey Les Montots', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.de-villaine.com/fr/les-vins/3/mercurey-les-montots
  ('Domaine A. et P. de Villaine', 'Rully Premier Cru Cloux Rouge', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.de-villaine.com/fr/les-vins
  ('Domaine A. et P. de Villaine', 'Rully Premier Cru Champs Cloux', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.de-villaine.com/fr/les-vins/14/rully-1er-cru-champs-cloux
  ('Domaine A. et P. de Villaine', 'Santenay Premier Cru Passetemps', 'Santenay, Côte de Beaune, Burgundy, France', null, 'Red')  -- https://www.de-villaine.com/fr/les-vins/8/santenay-1er-cru-passetemps
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HENRI ET PAUL JACQUESON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Henri et Paul Jacqueson', 'Bouzeron Les Corderes', 'Bouzeron, Côte Chalonnaise, Burgundy, France', null, 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Rully Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Rully Premier Cru Margotés Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Rully Premier Cru Vauvry Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Rully Premier Cru La Pucelle Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Rully Premier Cru Grésigny', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://vincod.com/H2191E
  ('Domaine Henri et Paul Jacqueson', 'Rully Chaponnières', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Rully Premier Cru Les Cloux', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://vincod.com/921H0E
  ('Domaine Henri et Paul Jacqueson', 'Rully Premier Cru Préaux', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Mercurey', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Mercurey Premier Cru Les Veully', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Mercurey Premier Cru Les Naugues', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
  ('Domaine Henri et Paul Jacqueson', 'Mercurey Premier Cru Champs Martin', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.burgundy-report.com/burgundy-report-extra/11-2023/p-m-jacqueson-2022/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JOBLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Joblot', 'Givry Premier Cru Clos de la Servoisine', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/en/buy-a-wine/B2110046-76316-1-bottle-Givry-1er-Cru-Servoisine-Joblot-Domaine-2021-Red
  ('Domaine Joblot', 'Givry Premier Cru Clos Marole', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/en/buy-a-wine/B2110046-76290-1-bottle-Givry-1er-Cru-Clos-Marole-Joblot-Domaine-2021-Red
  ('Domaine Joblot', 'Givry Premier Cru Clos du Cellier aux Moines', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.frw.co.uk/product/612ec280010000000004d5a3/2018-givry-clos-du-cellier-aux-moins-domaine-joblot
  ('Domaine Joblot', 'Givry Premier Cru Bois Chevaux', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.frw.co.uk/product/612ec28001000000000540ee/2020-givry-clos-de-bois-chevaux-domaine-joblot
  ('Domaine Joblot', 'Givry Premier Cru L''Empreinte', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/en/buy-a-wine/2372995-1-bottle-Givry-1er-Cru-Servoisine-Joblot-Domaine-2019-Red
  ('Domaine Joblot', 'Givry Prélude Blanc', 'Givry, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-a-wine/2372995-1-bottle-Givry-1er-Cru-Servoisine-Joblot-Domaine-2019-Red
  ('Domaine Joblot', 'Givry Mademoiselle Blanc', 'Givry, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://frw.co.uk/product/612ec28001000000000540f3/2020-givry-mademoiselle-blanc-domaine-joblot
  ('Domaine Joblot', 'Givry Premier Cru En Veau Blanc', 'Givry, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White')  -- https://www.comptoirdesmillesimes.com/en/producer-grower/givry-1er-cru-blanc-en-veau-2019-domaine-joblot.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU FUISSÉ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Château Fuissé', 'Pouilly-Fuissé Premier Cru Le Clos', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', null, 'White'),  -- https://chateau-fuisse.fr/en/nos-vins
  ('Château Fuissé', 'Pouilly-Fuissé Premier Cru Les Brûlés', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://chateau-fuisse.fr/en/nos-vins
  ('Château Fuissé', 'Pouilly-Fuissé Les Combettes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', null, 'White'),  -- https://chateau-fuisse.fr/en/nos-vins
  ('Château Fuissé', 'Pouilly-Fuissé Tête de Cuvée', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', null, 'White'),  -- https://chateau-fuisse.fr/en/nos-vins
  ('Château Fuissé', 'Pouilly-Fuissé Marie-Antoinette', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', null, 'White'),  -- https://chateau-fuisse.fr/en/nos-vins
  ('Château Fuissé', 'Saint-Véran', 'Saint-Véran, Mâconnais, Burgundy, France', null, 'White'),  -- https://chateau-fuisse.fr/en/nos-vins
  ('Château Fuissé', 'Mâcon-Fuissé', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://lbv.kork.ca/en/our-wineries/chateau-fuisse/macon-fuisse/2020
  ('Château Fuissé', 'Mâcon-Villages', 'Mâconnais, Burgundy, France', null, 'White'),  -- https://chateau-fuisse.fr/en/nos-vins
  ('Château Fuissé', 'Mâcon-Villages Famille Vincent', 'Mâconnais, Burgundy, France', null, 'White'),  -- https://chateau-fuisse.fr/en/nos-vins
  ('Château Fuissé', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://chateau-fuisse.fr/en/nos-vins
  ('Château Fuissé', 'Bourgogne Chardonnay Famille Vincent', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://lbv.kork.ca/en/our-wineries/chateau-fuisse
  ('Château Fuissé', 'Crémant de Bourgogne Brut', 'Burgundy, France', null, 'Sparkling')  -- https://chateau-fuisse.fr/en/nos-vins
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GUFFENS-HEYNEN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Guffens-Heynen', 'Bourgogne Blanc Deuxième Jus', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Mâcon-Pierreclos Juliette et les Vieilles de Chavigne', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Mâcon-Pierreclos Le Chavigne', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Mâcon-Pierreclos Tris de Chavigne', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Mâcon-Pierreclos En Crazy', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Mâcon-Pierreclos Premier Jus de Chavigne', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Pouilly-Fuissé Croux et Petits Croux', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Pouilly-Fuissé Premiers Jus des Premiers Crus', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Pouilly-Fuissé Premier Jus', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Pouilly-Fuissé Premier Jus des Hauts de Vignes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Pouilly-Fuissé Tri des Hauts des Vignes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Saint-Véran Clos de Poncetys', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://farrvintners.com/winelist.php?producer=1443
  ('Domaine Guffens-Heynen', 'Saint-Véran Premiers Jus', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://farrvintners.com/winelist.php?producer=1443
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MAISON VERGET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Maison Verget', 'Bourgogne Terres de Pierres', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Cuvée de la Butte', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Grand Cru Blanchot', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Grand Cru Bougros', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Grand Cru Valmur', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Grand Cru Vaudésir', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Premier Cru Côte de Léchet', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Premier Cru Fourchaume Vieilles Vignes de Vaulorent', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Premier Cru Mont de Milieu', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Premier Cru Montée de Tonnerre', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Premier Cru Vaillons', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chablis Premier Cru Vaillons Vignes des Minots', 'Chablis, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Mâcon-La Roche-Vineuse', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Mâcon-Bussières Vignes de Montbrison', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Mâcon-Charnay Le Clos Saint-Pierre', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Mâcon-Villages Grand Elevage', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Mâcon-Villages Terres de Pierres', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Mâcon-Vergisson La Roche', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Saint-Véran Le Clos', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Saint-Véran Lieu (Inter)Dit', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Saint-Véran Terroirs de Davayé', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Saint-Véran Tête de Cuvée', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Saint-Véran Vigne de Saint-Claude', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Viré-Clessé A l''Agremat Vieilles Vignes', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Viré-Clessé', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Viré-Clessé Vieilles Vignes de Roally', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Premier Cru Sur la Roche', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Grand Elevage', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Grands Terroirs', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé La Roche', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Le Haut de la Roche', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Les Combes Vieilles Vignes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Les Crays', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Les Vernays', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Terres de Pierres', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Terroirs de Vergisson', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Tête de Cuvée', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Pouilly-Fuissé Vignes Dessus', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Meursault Grand Elevage', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Meursault Les Clous', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Meursault Rougeots', 'Meursault, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Puligny-Montrachet Premier Cru Sous le Puits', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Puligny-Montrachet Les Enseignères', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chassagne-Montrachet Premier Cru La Romanée', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chassagne-Montrachet Premier Cru Morgeot', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Chassagne-Montrachet Les Chaumes', 'Chassagne-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Bâtard-Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Corton-Charlemagne Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Corton-Charlemagne Grand Cru Vieilles Vignes', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Verget
  ('Maison Verget', 'Montrachet Grand Cru', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Verget
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BARRAUD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Barraud', 'Mâcon-Fuissé', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Mâcon-Chaintré Les Pierres Polies', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Mâcon-Fuissé Les Chailles', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Mâcon-Vergisson La Roche', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Saint-Véran En Arpège', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Saint-Véran En Crèches', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Saint-Véran Les Pommards', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Pouilly-Fuissé Alliance Vieilles Vignes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Pouilly-Fuissé En Buland Vieilles Vignes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Pouilly-Fuissé Premier Cru En France', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Pouilly-Fuissé Premier Cru La Maréchaude Clos La Verchère', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Pouilly-Fuissé Premier Cru La Maréchaude Le Bas', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Pouilly-Fuissé Premier Cru Sur La Roche', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
  ('Domaine Barraud', 'Pouilly-Fuissé Premier Cru Les Crays', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://www.northberkeleyimports.com/wordpress/project/domaine-daniel-et-julien-barraud/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA BONGRAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine de la Bongran', 'Viré-Clessé Cuvée Tradition', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.frw.co.uk/editorial/Behind-The-Bottle-Vire-Clesse-Domaine-de-La-Bongran
  ('Domaine de la Bongran', 'Viré-Clessé Cuvée Levroutée', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.frw.co.uk/product/66f17570d4a3527b22b88926/2017-vire-clesse-cuvee-levroutee-domaine-de-la-bongran-thevenet-quintaine
  ('Domaine de la Bongran', 'Mâcon-Villages Cuvée Botrytis', 'Mâconnais, Burgundy, France', 'Chardonnay', 'Sweet')  -- https://frw.co.uk/product/612ec2800100000000018f5e/2006-macon-villages-cuvee-botrytis-domaine-de-la-bongran-thevenet-quintaine
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE VALETTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Valette', 'Mâcon-Chaintré Vieilles Vignes', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Mâcon-Chaintré', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Mâcon-Chaintré Assemblage Millésimes', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Mâcon-Villages', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Mâcon-Villages Assemblage Millésimes', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Tradition', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Les Chevrières', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Les Plantes Vieilles', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Clos de Monsieur Noly', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Clos de Monsieur Noly Vieilles Vignes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Clos de Monsieur Noly Vieilles Vignes Réserve', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Clos de Monsieur Noly Assemblage Millésimes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Clos Reyssié', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Clos Reyssié Réserve Particulière', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Fuissé Clos Reyssié Vieilles Vignes Réserve', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Vinzelles MesdemoiZelles', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Pouilly-Vinzelles Vieilles Vignes', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Viré-Clessé', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Viré-Clessé Et Pourtant...', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Valette
  ('Domaine Valette', 'Viré-Clessé Et Pourtant... Assemblage Millésimes', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://idealwine.com/en/buy-wine/domain-Valette
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CAVE DE LUGNY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Cave de Lugny', 'Mâcon-Lugny Les Charmes', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/cave-de-lugny/page/1/2/
  ('Cave de Lugny', 'Bourgogne Les Chenaudières', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/cave-de-lugny/page/1/2/
  ('Cave de Lugny', 'Crémant de Bourgogne Brut', 'Burgundy, France', null, 'Sparkling'),  -- https://www.decanter.com/wine-reviews/search/cave-de-lugny/page/1/2/
  ('Cave de Lugny', 'Crémant de Bourgogne Blanc de Blancs Brut', 'Burgundy, France', null, 'Sparkling'),  -- https://www.decanter.com/wine-reviews/search/cave-de-lugny/page/1/2/
  ('Cave de Lugny', 'Crémant de Bourgogne Blanc de Noirs', 'Burgundy, France', null, 'Sparkling'),  -- https://www.decanter.com/wine-reviews/search/cave-de-lugny/page/1/2/
  ('Cave de Lugny', 'Crémant de Bourgogne Sainchargny Immémorial Brut Grand Eminent', 'Burgundy, France', null, 'Sparkling'),  -- https://www.decanter.com/wine-reviews/search/cave-de-lugny/page/1/2/
  ('Cave de Lugny', 'Crémant de Bourgogne Extra Brut Les Crays', 'Burgundy, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1718/cave-de-lugny/
  ('Cave de Lugny', 'Mâcon-Lugny Cœur de Charmes', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1718/cave-de-lugny/
  ('Cave de Lugny', 'Mâcon-Lugny La Vigne du Cloître', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1718/cave-de-lugny/
  ('Cave de Lugny', 'Mâcon-Lugny Saint-Pierre Chardonnay', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1718/cave-de-lugny/
  ('Cave de Lugny', 'Mâcon-Villages L''Originel Chardonnay', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1718/cave-de-lugny/
  ('Cave de Lugny', 'Bourgogne Les Vignes de l''Oratoire', 'Burgundy, France', 'Chardonnay', 'White')  -- https://www.hachette-vins.com/guide-vins/producteurs/1718/cave-de-lugny/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DUREUIL-JANTHIAL ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Dureuil-Janthial', 'Bourgogne Aligoté', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Blanc Chêne', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Blanc Maizières', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Les Margotés Vieilles Vignes Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Le Meix Cadot Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Le Meix Cadot Vieilles Vignes Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Vauvry Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Grésigny', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Grésigny Vieilles Vignes', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Rabourcé', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Chapitre Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Puligny-Montrachet Corvée des Vignes', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Puligny-Montrachet Premier Cru Champ Gain', 'Puligny-Montrachet, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Coteaux Bourguignons', 'Burgundy, France', null, 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Bourgogne Rouge', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Bourgogne Passetoutgrain', 'Burgundy, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Rully Rouge', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Rouge Maizières', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Rouge En Guesnes', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Rouge En Guesnes Wadana', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Mercurey Rouge', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Rouge', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Rouge Vieilles Vignes', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru La Fosse Rouge', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Champs Cloux Rouge', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Cloux Vignes de 1936', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Chapitre Rouge', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.northberkeleyimports.com/wordpress/?p=755
  ('Domaine Dureuil-Janthial', 'Rully Premier Cru Vauvry Rouge', 'Rully, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Nuits-Saint-Georges', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Vincent%20Dureuil_Janthial
  ('Domaine Dureuil-Janthial', 'Nuits-Saint-Georges Premier Cru Clos des Argillières', 'Nuits-Saint-Georges, Côte de Nuits, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.northberkeleyimports.com/wordpress/?p=755
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BRUNO LORENZON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Bruno Lorenzon', 'Mercurey Premier Cru Les Champs Martin Rouge', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Mercurey Premier Cru Les Champs Martin Blanc', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Mercurey Premier Cru Clos des Champs Martin Carline', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Mercurey Premier Cru Pièce 13', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Mercurey Premier Cru Pièce 15', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Mercurey Premier Cru Les Croichots', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Mercurey Le Châpitre', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Mercurey Cuvée 37', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Montagny Premier Cru Le Mont Laurent', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Montagny Premier Cru Les Truffières', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Bourgogne Clos Alfred', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
  ('Bruno Lorenzon', 'Bourgogne Les 16 Ouvrées', 'Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.idealwine.com/uk/domain/8190-Bruno-Lorenzon.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MICHEL JUILLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Michel Juillot', 'Bourgogne Chardonnay', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Rully Les Thivaux Blanc', 'Rully, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Blanc', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Les Vignes de Maillonge Blanc', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Premier Cru En Sazenay Blanc', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Premier Cru Les Champs Martins Blanc', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Premier Cru Clos des Barraults Blanc', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Corton-Charlemagne Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Bourgogne Pinot Noir', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Rouge', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Les Vignes de Maillonge Rouge', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Premier Cru Clos Tonnerre', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Premier Cru Les Combins', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Premier Cru Les Champs Martins Rouge', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Premier Cru Clos du Roi', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Mercurey Premier Cru Clos des Barraults Rouge', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Aloxe-Corton Les Caillettes', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
  ('Domaine Michel Juillot', 'Corton Perrières Grand Cru', 'Aloxe-Corton, Côte de Beaune, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.domaine-michel-juillot.fr/fr/nos-vins/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE SAUMAIZE-MICHELIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Saumaize-Michelin', 'Mâcon-Vergisson Sur la Roche', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.undergroundwineletter.com/2021/02/lovely-new-wines-from-domaine-saumaize-michelin/print/
  ('Domaine Saumaize-Michelin', 'Mâcon Les Sertaux', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1675/roger-saumaize
  ('Domaine Saumaize-Michelin', 'Mâcon Les Bruyères', 'Mâconnais, Burgundy, France', null, 'Red'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1675/roger-saumaize
  ('Domaine Saumaize-Michelin', 'Viré-Clessé', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.undergroundwineletter.com/2021/02/lovely-new-wines-from-domaine-saumaize-michelin/print/
  ('Domaine Saumaize-Michelin', 'Saint-Véran Les Crèches', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.undergroundwineletter.com/2021/02/lovely-new-wines-from-domaine-saumaize-michelin/print/
  ('Domaine Saumaize-Michelin', 'Saint-Véran Vieilles Vignes', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1675/roger-saumaize
  ('Domaine Saumaize-Michelin', 'Pouilly-Fuissé Pentacrine', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/producer/saumaize-michelin
  ('Domaine Saumaize-Michelin', 'Pouilly-Fuissé Ampelopsis', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/producer/saumaize-michelin
  ('Domaine Saumaize-Michelin', 'Pouilly-Fuissé Vignes Blanches', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.undergroundwineletter.com/2021/02/lovely-new-wines-from-domaine-saumaize-michelin/print/
  ('Domaine Saumaize-Michelin', 'Pouilly-Fuissé Ronchevats', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.undergroundwineletter.com/2021/02/lovely-new-wines-from-domaine-saumaize-michelin/print/
  ('Domaine Saumaize-Michelin', 'Pouilly-Fuissé Courtelongs', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.undergroundwineletter.com/2021/02/lovely-new-wines-from-domaine-saumaize-michelin/print/
  ('Domaine Saumaize-Michelin', 'Pouilly-Fuissé Premier Cru Clos sur la Roche', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/producer/saumaize-michelin
  ('Domaine Saumaize-Michelin', 'Pouilly-Fuissé Premier Cru Vers Cras', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/producer/saumaize-michelin
  ('Domaine Saumaize-Michelin', 'Pouilly-Fuissé Premier Cru La Maréchaude', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bowlerwine.com/producer/saumaize-michelin
  ('Domaine Saumaize-Michelin', 'Pouilly-Fuissé Premier Cru Les Crays', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://www.bowlerwine.com/producer/saumaize-michelin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FERRET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Ferret', 'Mâcon-Fuissé', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Mâcon-Solutré', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Saint-Véran', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Pouilly-Fuissé', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Pouilly-Fuissé Autour de la Roche', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Pouilly-Fuissé Autour de Fuissé', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Pouilly-Fuissé Premier Cru Hors Classe Les Ménétrières', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Pouilly-Fuissé Premier Cru Hors Classe Tournant de Pouilly', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Pouilly-Fuissé Premier Cru Tête de Cru Les Perrières', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Pouilly-Fuissé Premier Cru Tête de Cru Clos de Jeanne', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Pouilly-Fuissé Tête de Cru Clos des Prouges', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
  ('Domaine Ferret', 'Pouilly-Fuissé Tête de Cru Le Clos', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-J.A.%20Ferret
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ROBERT-DENOGENT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Robert-Denogent', 'Mâcon-Villages Les Sardines', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Robert-Denogent
  ('Domaine Robert-Denogent', 'Pouilly-Fuissé Premier Cru Les Reisses', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/domaine-robert-denogent/2/
  ('Domaine Robert-Denogent', 'Pouilly-Fuissé Climat', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Robert-Denogent
  ('Domaine Robert-Denogent', 'Pouilly-Fuissé La Croix', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', null, 'White'),  -- https://www.burgundy-report.com/2007/12/domaine-robert-denogent/
  ('Domaine Robert-Denogent', 'Pouilly-Fuissé Cuvée Claude Denogent', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', null, 'White'),  -- https://www.burgundy-report.com/2007/12/domaine-robert-denogent/
  ('Domaine Robert-Denogent', 'Pouilly-Fuissé Les Carrons', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', null, 'White')  -- https://www.burgundy-report.com/2007/12/domaine-robert-denogent/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA SOUFRANDIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine de la Soufrandière', 'Bourgogne Aligoté Cuvée Aligato', 'Burgundy, France', 'Aligoté', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Mâcon-Vinzelles Le Clos de Grand-Père', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/macon-vinzelles-le-clos-de-grand-pere-la-soufrandiere-55.php
  ('Domaine de la Soufrandière', 'Saint-Véran La Combe DesRoches', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Saint-Véran La Bonnode', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Saint-Véran La Bonnode Cuvée Zen', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Saint-Véran La Bonnode Cuvée Ovoïde', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Vinzelles', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Vinzelles Les Longeays', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Vinzelles Les Quarts', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Vinzelles Les Quarts Cuvée Zen', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Vinzelles Les Quarts Cuvée Millerandée', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Vinzelles Cuvée X-Mûr', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Vinzelles Cuvée X-Taste', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Fuissé Premier Cru Au Vignerais', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Fuissé En Chatenay', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
  ('Domaine de la Soufrandière', 'Pouilly-Fuissé En Chatenay Cuvée Zen', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://www.bretbrothers.com/vin/lasoufrandiere.php
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BRET BROTHERS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Bret Brothers', 'Mâcon-Villages Terroirs du Mâconnais', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/macon-villages-terroirs-du-maconnais-bret-brothers-69.php
  ('Bret Brothers', 'Mâcon-Verzé Les Perches', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/macon-verze-les-perches-bret-brothers-125.php
  ('Bret Brothers', 'Mâcon-Chardonnay', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/bretbrothers.php
  ('Bret Brothers', 'Mâcon-Chardonnay Les Crays', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/bretbrothers.php
  ('Bret Brothers', 'Mâcon-Igé Les Vernayes', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/macon-ige-les-vernayes-bret-brothers-114.php
  ('Bret Brothers', 'Mâcon-Igé En Chanelet', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/macon-ige-en-chanelet-bret-brothers-118.php
  ('Bret Brothers', 'Viré-Clessé La Verchère', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/bretbrothers.php
  ('Bret Brothers', 'Viré-Clessé Sous Les Plantes', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/bretbrothers.php
  ('Bret Brothers', 'Pouilly-Loché La Colonge', 'Pouilly-Loché, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/bretbrothers.php
  ('Bret Brothers', 'Pouilly-Fuissé Terres de Vergisson', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bretbrothers.com/vin/bretbrothers.php
  ('Bret Brothers', 'Pouilly-Fuissé En Carementrant', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://www.bretbrothers.com/vin/bretbrothers.php
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE OLIVIER MERLIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Olivier Merlin', 'Bourgogne Blanc', 'Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Olivier%20Merlin
  ('Domaine Olivier Merlin', 'Bourgogne Rouge Les Cras', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.bbr.com/producer-441-olivier-merlin
  ('Domaine Olivier Merlin', 'Mâcon-La Roche-Vineuse Blanc', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Olivier%20Merlin
  ('Domaine Olivier Merlin', 'Mâcon-La Roche-Vineuse Rouge', 'Mâconnais, Burgundy, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Olivier%20Merlin
  ('Domaine Olivier Merlin', 'Mâcon-La Roche-Vineuse Vieilles Vignes', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bbr.com/producer-441-olivier-merlin
  ('Domaine Olivier Merlin', 'Saint-Véran', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Olivier%20Merlin
  ('Domaine Olivier Merlin', 'Saint-Véran La Côte Rôtie', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bbr.com/producer-441-olivier-merlin
  ('Domaine Olivier Merlin', 'Saint-Véran En Crèche', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bbr.com/producer-441-olivier-merlin
  ('Domaine Olivier Merlin', 'Saint-Véran Le Grand Bussière', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bbr.com/producer-441-olivier-merlin
  ('Domaine Olivier Merlin', 'Viré-Clessé', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Olivier%20Merlin
  ('Domaine Olivier Merlin', 'Pouilly-Fuissé Vieilles Vignes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bbr.com/producer-441-olivier-merlin
  ('Domaine Olivier Merlin', 'Pouilly-Fuissé Premier Cru Au Vignerais', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bbr.com/producer-441-olivier-merlin
  ('Domaine Olivier Merlin', 'Pouilly-Fuissé Premier Cru Les Chevrières', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bbr.com/producer-441-olivier-merlin
  ('Domaine Olivier Merlin', 'Pouilly-Fuissé Premier Cru Clos de France', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.bbr.com/producer-441-olivier-merlin
  ('Domaine Olivier Merlin', 'Pouilly-Fuissé Premier Cru Sur La Roche', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://www.bbr.com/producer-441-olivier-merlin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HÉRITIERS DU COMTE LAFON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Héritiers du Comte Lafon', 'Mâcon-Villages', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
  ('Domaine Héritiers du Comte Lafon', 'Mâcon-Prissé', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
  ('Domaine Héritiers du Comte Lafon', 'Mâcon-Chardonnay Clos de la Crochette', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
  ('Domaine Héritiers du Comte Lafon', 'Mâcon-Uchizy Les Maranches', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
  ('Domaine Héritiers du Comte Lafon', 'Mâcon-Bussières Le Monsard', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
  ('Domaine Héritiers du Comte Lafon', 'Mâcon-Milly-Lamartine', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
  ('Domaine Héritiers du Comte Lafon', 'Mâcon-Milly-Lamartine Clos du Four', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
  ('Domaine Héritiers du Comte Lafon', 'Viré-Clessé', 'Viré-Clessé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
  ('Domaine Héritiers du Comte Lafon', 'Saint-Véran', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
  ('Domaine Héritiers du Comte Lafon', 'Pouilly-Fuissé En Chatenay', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://beckywasserman.com/domaines/heritiers-du-comte-lafon
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES DEUX ROCHES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine des Deux Roches', 'Saint-Véran Vignes Derrière la Maison', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Saint-Véran La Côte Rôtie', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Saint-Véran Les Cras', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Saint-Véran Les Terres Noires', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Saint-Véran Vieilles Vignes', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Saint-Véran Rives de Longsault', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Saint-Véran Tradition', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Pouilly-Fuissé Plénitude de Bonté', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Pouilly-Fuissé Vieilles Vignes', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Pouilly-Fuissé Premier Cru', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://fr.gaultmillau.com/fr/wineries/deux-roches
  ('Domaine des Deux Roches', 'Mâcon-Villages Plants du Carré', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Mâcon-Villages Tradition', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
  ('Domaine des Deux Roches', 'Mâcon-Pierreclos Rouge', 'Mâconnais, Burgundy, France', null, 'Red')  -- https://www.hachette-vins.com/guide-vins/producteurs/1299/deux-roches
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA CROIX SENAILLET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine de la Croix Senaillet', 'Saint-Véran', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainecroixsenaillet.com/
  ('Domaine de la Croix Senaillet', 'Mâcon-Davayé', 'Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainecroixsenaillet.com/
  ('Domaine de la Croix Senaillet', 'Pouilly-Fuissé', 'Pouilly-Fuissé, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainecroixsenaillet.com/
  ('Domaine de la Croix Senaillet', 'Pouilly-Vinzelles', 'Pouilly-Vinzelles, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainecroixsenaillet.com/
  ('Domaine de la Croix Senaillet', 'Saint-Véran Les Rochats', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainecroixsenaillet.com/
  ('Domaine de la Croix Senaillet', 'Saint-Véran Sur la Carrière', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainecroixsenaillet.com/
  ('Domaine de la Croix Senaillet', 'Saint-Véran En Pommards', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainecroixsenaillet.com/
  ('Domaine de la Croix Senaillet', 'Saint-Véran La Grande Bruyère', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainecroixsenaillet.com/
  ('Domaine de la Croix Senaillet', 'Saint-Véran Les Buis', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.domainecroixsenaillet.com/
  ('Domaine de la Croix Senaillet', 'Saint-Véran Le Clos des Poncétys', 'Saint-Véran, Mâconnais, Burgundy, France', 'Chardonnay', 'White')  -- https://www.domainecroixsenaillet.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FRANÇOIS LUMPP ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine François Lumpp', 'Givry Premier Cru Clos Jus', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Givry Premier Cru Clos du Cras Long', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Givry Premier Cru A Vigne Rouge', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Givry Premier Cru Le Pied du Clou', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Givry Premier Cru La Brûlée', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Givry Premier Cru Crausot Rouge', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Givry Premier Cru Crausot Blanc', 'Givry, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Givry Premier Cru Petit Marole Rouge', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Givry Premier Cru Petit Marole Blanc', 'Givry, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Bourgogne La Paulée', 'Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
  ('Domaine François Lumpp', 'Givry Clos des Vignes Rondes', 'Givry, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White')  -- https://www.idealwine.com/en/buy-wine/domain-Francois%20Lumpp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE RAGOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Ragot', 'Givry Blanc Champ Pourot', 'Givry, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.ruedesvignerons.com/en/domaine/470/domaine-ragot
  ('Domaine Ragot', 'Givry Blanc Teppe des Chenèves', 'Givry, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.ruedesvignerons.com/en/domaine/470/domaine-ragot
  ('Domaine Ragot', 'Givry Premier Cru Crausot Blanc', 'Givry, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.ruedesvignerons.com/en/domaine/470/domaine-ragot
  ('Domaine Ragot', 'Givry Rouge', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.ruedesvignerons.com/en/domaine/470/domaine-ragot
  ('Domaine Ragot', 'Givry Rouge Vieilles Vignes', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.ruedesvignerons.com/en/domaine/470/domaine-ragot
  ('Domaine Ragot', 'Givry Rouge Teppe des Chenèves', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.ruedesvignerons.com/en/domaine/470/domaine-ragot
  ('Domaine Ragot', 'Givry Premier Cru La Grande Berge', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.ruedesvignerons.com/en/domaine/470/domaine-ragot
  ('Domaine Ragot', 'Givry Premier Cru Clos Jus', 'Givry, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.ruedesvignerons.com/en/domaine/470/domaine-ragot
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE STÉPHANE ALADAME ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Stéphane Aladame', 'Montagny Prélude', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.libertywines.co.uk/our-producers/GAL02FR-domaine-stephane-aladame
  ('Domaine Stéphane Aladame', 'Montagny Premier Cru Les Maroques', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.libertywines.co.uk/our-producers/GAL02FR-domaine-stephane-aladame
  ('Domaine Stéphane Aladame', 'Montagny Premier Cru Les Burnins', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/domaine-st%C3%A9phane-aladame/2/
  ('Domaine Stéphane Aladame', 'Montagny Premier Cru Les Coères', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.internationalfinewines.com.au/pages/domaine-stephane-aladame
  ('Domaine Stéphane Aladame', 'Montagny Premier Cru Les Vignes Derrière', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/domaine-st%C3%A9phane-aladame/2/
  ('Domaine Stéphane Aladame', 'Montagny Premier Cru Découverte', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.internationalfinewines.com.au/pages/domaine-stephane-aladame
  ('Domaine Stéphane Aladame', 'Crémant de Bourgogne Blanc de Blancs', 'Burgundy, France', null, 'Sparkling'),  -- https://www.decanter.com/wine-reviews/search/domaine-st%C3%A9phane-aladame/2/
  ('Domaine Stéphane Aladame', 'Crémant de Bourgogne Blanc de Blancs Extra Brut', 'Burgundy, France', null, 'Sparkling')  -- https://www.decanter.com/wine-reviews/search/domaine-st%C3%A9phane-aladame/2/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE CHAMIREY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Château de Chamirey', 'Mercurey Blanc', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Blanc En Pierrelet', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Premier Cru La Mission Monopole Blanc', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Rouge', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Rouge Clos de la Maladière', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Premier Cru Clos l''Évêque', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Premier Cru Champs Martin Rouge', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Premier Cru Clos du Roi', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Premier Cru Clos des Ruelles Monopole', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Premier Cru En Sazenay Rouge', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red'),  -- https://www.chamirey.com/fr/vins/nos-vins
  ('Château de Chamirey', 'Mercurey Premier Cru Les Cinq', 'Mercurey, Côte Chalonnaise, Burgundy, France', 'Pinot Noir', 'Red')  -- https://www.chamirey.com/fr/vins/nos-vins
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FEUILLAT-JUILLOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r7_burgundy.sql)'
from (values
  ('Domaine Feuillat-Juillot', 'Montagny Cuvée Camille', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/02-2015/feuillat-juillot-2013/
  ('Domaine Feuillat-Juillot', 'Montagny Les Crêts', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/02-2015/feuillat-juillot-2013/
  ('Domaine Feuillat-Juillot', 'Montagny Les Crêts L''Audacieuse', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.decanter.com/wine-reviews/search/domaine-feuillat-juillot/2/
  ('Domaine Feuillat-Juillot', 'Montagny Premier Cru Les Jardins', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/02-2015/feuillat-juillot-2013/
  ('Domaine Feuillat-Juillot', 'Montagny Premier Cru Les Grappes d''Or', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/02-2015/feuillat-juillot-2013/
  ('Domaine Feuillat-Juillot', 'Montagny Premier Cru Montcuchot', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White'),  -- https://www.burgundy-report.com/burgundy-report-extra/02-2015/feuillat-juillot-2013/
  ('Domaine Feuillat-Juillot', 'Montagny Premier Cru Les Coères', 'Montagny, Côte Chalonnaise, Burgundy, France', 'Chardonnay', 'White')  -- https://www.burgundy-report.com/burgundy-report-extra/02-2015/feuillat-juillot-2013/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
