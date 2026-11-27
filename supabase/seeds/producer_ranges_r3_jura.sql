-- Producer ranges round 3: Jura. Every row confirmed on a real page fetched 2026-11-26/27; source URL on each row.

-- ---- DOMAINE DE LA TOURNELLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine de la Tournelle', 'Arbois Terre de Gryphées', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Arbois Fleur de Savagnin', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Arbois Savagnin de Voile', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Arbois Les Corvées sous Curon', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Arbois Cul du Brey', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Arbois Ambre de Savagnin', 'Arbois, Jura, France', 'Savagnin', 'Orange'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Arbois Trousseau des Corvées', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Arbois Uva Arbosiana', 'Arbois, Jura, France', 'Ploussard', 'Red'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Macvin du Jura', 'Jura, France', null, 'Fortified'),  -- https://www.domainedelatournelle.com/nos-cuvees.htm
  ('Domaine de la Tournelle', 'Vin de France Cul du Brey Rouge', 'Jura, France', 'Petit Béclan, Syrah blend', 'Red')  -- https://www.domainedelatournelle.com/nos-cuvees.htm
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ANDRÉ ET MIREILLE TISSOT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine André et Mireille Tissot', 'Côtes du Jura Chardonnay En Barberon', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=1
  ('Domaine André et Mireille Tissot', 'Arbois Chardonnay Les Bruyères', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=1
  ('Domaine André et Mireille Tissot', 'Arbois DD', 'Arbois, Jura, France', null, 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=1
  ('Domaine André et Mireille Tissot', 'Arbois Chardonnay Les Graviers', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=1
  ('Domaine André et Mireille Tissot', 'Arbois Chardonnay Patchwork', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=1
  ('Domaine André et Mireille Tissot', 'Arbois Chardonnay Rose Massale', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=1
  ('Domaine André et Mireille Tissot', 'Arbois Savagnin Ouillé', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=1
  ('Domaine André et Mireille Tissot', 'Château-Chalon Sursis', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=1
  ('Domaine André et Mireille Tissot', 'Arbois Trousseau Singulier', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=1
  ('Domaine André et Mireille Tissot', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=2
  ('Domaine André et Mireille Tissot', 'Arbois Chardonnay Clos de la Tour de Curon', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=2
  ('Domaine André et Mireille Tissot', 'Arbois Chardonnay La Mailloche', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=2
  ('Domaine André et Mireille Tissot', 'Côtes du Jura Pinot Noir En Barberon', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=2
  ('Domaine André et Mireille Tissot', 'Arbois Pinot Noir Sous la Tour', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=2
  ('Domaine André et Mireille Tissot', 'Arbois Vin Jaune Curon', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=2
  ('Domaine André et Mireille Tissot', 'Arbois Poulsard Amphore', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=3
  ('Domaine André et Mireille Tissot', 'Poulsard Confidentiel', 'Jura, France', 'Poulsard', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=3
  ('Domaine André et Mireille Tissot', 'Arbois Poulsard Vieilles Vignes', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=3
  ('Domaine André et Mireille Tissot', 'Arbois Trousseau Amphore', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=3
  ('Domaine André et Mireille Tissot', 'Arbois Vin de Paille', 'Arbois, Jura, France', null, 'Sweet')  -- https://en.lespassionnesduvin.com/catalog/category/view/s/stephane-tissot/id/12054/?p=3
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BERTHET-BONDET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Berthet-Bondet', 'Côtes du Jura Tradition', 'Côtes du Jura, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://berthet-bondet.com/vins/blancs-sous-voile/tradition/
  ('Domaine Berthet-Bondet', 'Côtes du Jura Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://berthet-bondet.com/vins/blancs-sous-voile/savagnin/
  ('Domaine Berthet-Bondet', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://berthet-bondet.com/vins/blancs-sous-voile/chateau-chalon/
  ('Domaine Berthet-Bondet', 'Côtes du Jura Savagnier', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://berthet-bondet.com/vins/blancs-ouilles/savagnier/
  ('Domaine Berthet-Bondet', 'Côtes du Jura Chardonnay La Poirière', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://berthet-bondet.com/vins/blancs-ouilles/poiriere/
  ('Domaine Berthet-Bondet', 'Côtes du Jura Savagnin L''Acacia', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://berthet-bondet.com/vins/blancs-ouilles/acacia/
  ('Domaine Berthet-Bondet', 'Côtes du Jura Trio', 'Côtes du Jura, Jura, France', 'Pinot Noir, Poulsard blend', 'Red'),  -- https://berthet-bondet.com/vins/rouges/trio/
  ('Domaine Berthet-Bondet', 'Côtes du Jura Pinot Noir La Queue au Renard', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://berthet-bondet.com/vins/rouges/la-queue-au-renard/
  ('Domaine Berthet-Bondet', 'Crémant du Jura Rosé Brut', 'Jura, France', 'Pinot Noir, Poulsard blend', 'Sparkling'),  -- https://berthet-bondet.com/vins/cremants/cremant-rose/
  ('Domaine Berthet-Bondet', 'Crémant du Jura Brut Nature', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://berthet-bondet.com/vins/cremants/cremant-brut-nature/
  ('Domaine Berthet-Bondet', 'Macvin du Jura', 'Jura, France', 'Chardonnay, Savagnin blend', 'Fortified'),  -- https://berthet-bondet.com/vins/alcools-liquoreux/macvin/
  ('Domaine Berthet-Bondet', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', 'Chardonnay, Savagnin blend', 'Sweet')  -- https://berthet-bondet.com/vins/alcools-liquoreux/vin-de-paille/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU D'ARLAY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Château d''Arlay', 'Côtes du Jura Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Ch%C3%A2teau%20d'Arlay
  ('Château d''Arlay', 'Côtes du Jura Blanc Tradition', 'Côtes du Jura, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Ch%C3%A2teau%20d'Arlay
  ('Château d''Arlay', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet'),  -- https://idealwine.com/en/buy-wine/domain-Ch%C3%A2teau%20d'Arlay
  ('Château d''Arlay', 'Macvin du Jura Rouge', 'Jura, France', null, 'Fortified'),  -- https://idealwine.com/en/buy-wine/domain-Ch%C3%A2teau%20d'Arlay
  ('Château d''Arlay', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified'),  -- https://idealwine.com/en/buy-wine/domain-Ch%C3%A2teau%20d'Arlay
  ('Château d''Arlay', 'Côtes du Jura Corail', 'Côtes du Jura, Jura, France', null, 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Ch%C3%A2teau%20d'Arlay
  ('Château d''Arlay', 'Côtes du Jura Pinot Noir', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Ch%C3%A2teau%20d'Arlay
  ('Château d''Arlay', 'Côtes du Jura Vin Jaune Proteodie', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Ch%C3%A2teau%20d'Arlay
  ('Château d''Arlay', 'Côtes du Jura Chardonnay à la Reine', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White')  -- https://idealwine.com/en/buy-wine/domain-Ch%C3%A2teau%20d'Arlay
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE ROLET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Rolet', 'Arbois Savagnin Ouillé', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Arbois Tradition Rouge', 'Arbois, Jura, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Arbois Tradition Blanc', 'Arbois, Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Arbois Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Arbois Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Arbois Poulsard Vieilles Vignes', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Arbois Cuvée Mémorial', 'Arbois, Jura, France', null, 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Côtes du Jura Tradition', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Côtes du Jura Expression du Terroir', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Côtes du Jura Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Côtes du Jura Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Crémant du Jura Rosé Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.idealwine.com/en/buy-wine/domain-Rolet
  ('Domaine Rolet', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-rolet.com/
  ('Domaine Rolet', 'Arbois Vin de Paille', 'Arbois, Jura, France', null, 'Sweet'),  -- https://www.domaine-rolet.com/
  ('Domaine Rolet', 'L''Étoile Chardonnay', 'L''Étoile, Jura, France', 'Chardonnay', 'White'),  -- https://www.domaine-rolet.com/
  ('Domaine Rolet', 'Crémant du Jura Blanc de Noirs', 'Jura, France', 'Pinot Noir, Poulsard', 'Sparkling'),  -- https://www.domaine-rolet.com/
  ('Domaine Rolet', 'Crémant du Jura Cœur de Chardonnay', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://www.domaine-rolet.com/
  ('Domaine Rolet', 'Crémant du Jura Brut', 'Jura, France', null, 'Sparkling')  -- https://www.domaine-rolet.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- CHÂTEAU DE L'ÉTOILE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Château de l''Étoile', 'Crémant du Jura Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.hachette-vins.com/guide-vins/producteurs/737/ch-de-l-etoile
  ('Château de l''Étoile', 'L''Étoile Blanc', 'L''Étoile, Jura, France', null, 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/737/ch-de-l-etoile
  ('Château de l''Étoile', 'L''Étoile Vin Jaune', 'L''Étoile, Jura, France', 'Savagnin', 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/737/ch-de-l-etoile
  ('Château de l''Étoile', 'L''Étoile Cuvée des Ceps d''Or', 'L''Étoile, Jura, France', null, 'White'),  -- https://www.hachette-vins.com/guide-vins/producteurs/737/ch-de-l-etoile
  ('Château de l''Étoile', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified'),  -- https://www.hachette-vins.com/guide-vins/producteurs/737/ch-de-l-etoile
  ('Château de l''Étoile', 'L''Étoile Vin de Paille', 'L''Étoile, Jura, France', null, 'Sweet'),  -- https://www.chateau-etoile.com/
  ('Château de l''Étoile', 'Côtes du Jura Rouge', 'Côtes du Jura, Jura, France', null, 'Red')  -- https://www.chateau-etoile.com/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA PINTE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine de la Pinte', 'Arbois Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Arbois Chardonnay Fonteneille', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Crémant du Jura', 'Jura, France', null, 'Sparkling'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Arbois Cuvée d''Automne', 'Arbois, Jura, France', 'Savagnin, Chardonnay', 'White'),  -- https://lapinte.fr/produit/cuvee-dautomne/
  ('Domaine de la Pinte', 'Arbois La Capitaine', 'Arbois, Jura, France', 'Pinot Noir, Poulsard, Trousseau', 'Red'),  -- https://lapinte.fr/produit/la-capitaine-2021/
  ('Domaine de la Pinte', 'Macvin du Jura', 'Jura, France', null, 'Fortified'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Arbois-Pupillin Melon à Queue Rouge', 'Arbois-Pupillin, Jura, France', 'Melon à Queue Rouge', 'White'),  -- https://lapinte.fr/produit/melon-a-queue-rouge-2022/
  ('Domaine de la Pinte', 'Arbois Poulsard L''Ami Karl', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Arbois Poulsard Pinte Bien', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Arbois Savagnin Ouillé 36 Mois', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Arbois Savagnin Ouillé 60 Mois', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Arbois Savagnin Typé Cuvée Pierre', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Sav''Or', 'Jura, France', 'Savagnin', 'Sweet'),  -- https://lapinte.fr/produit/savor-2022/
  ('Domaine de la Pinte', 'Arbois Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Vin de Liqueur', 'Jura, France', 'Savagnin', 'Fortified'),  -- https://lapinte.fr/produit/vin-de-liqueur/
  ('Domaine de la Pinte', 'Vin de Paille', 'Jura, France', null, 'Sweet'),  -- https://lapinte.fr/e-boutique/
  ('Domaine de la Pinte', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White')  -- https://lapinte.fr/e-boutique/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PHILIPPE VANDELLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Philippe Vandelle', 'L''Étoile Vin de Paille', 'L''Étoile, Jura, France', null, 'Sweet'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'L''Étoile Vieilles Vignes', 'L''Étoile, Jura, France', null, 'White'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'L''Étoile Vin Jaune', 'L''Étoile, Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'Crémant du Jura', 'Jura, France', null, 'Sparkling'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'Côtes du Jura Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'Côtes du Jura Poulsard', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'Côtes du Jura Pinot Noir', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'L''Étoile Tradition', 'L''Étoile, Jura, France', null, 'White'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'L''Étoile Savagnin', 'L''Étoile, Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'Macvin du Jura', 'Jura, France', null, 'Fortified'),  -- https://www.vivino.com/en/wineries/philippe-vandelle
  ('Domaine Philippe Vandelle', 'L''Étoile Chardonnay', 'L''Étoile, Jura, France', 'Chardonnay', 'White')  -- https://www.vivino.com/en/wineries/philippe-vandelle
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE COURBET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Courbet', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet'),  -- https://www.vivino.com/en/wineries/domaine-courbet
  ('Domaine Courbet', 'Côtes du Jura Chardonnay de la Vallée', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/domaine-courbet
  ('Domaine Courbet', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/domaine-courbet
  ('Domaine Courbet', 'Crémant du Jura Perle', 'Jura, France', null, 'Sparkling'),  -- https://www.vivino.com/en/wineries/domaine-courbet
  ('Domaine Courbet', 'Macvin du Jura', 'Jura, France', null, 'Fortified'),  -- https://www.vivino.com/en/wineries/domaine-courbet
  ('Domaine Courbet', 'Côtes du Jura Trousseau de la Vallée', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.vivino.com/en/wineries/domaine-courbet
  ('Domaine Courbet', 'Côtes du Jura Poulsard', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.vivino.com/en/wineries/domaine-courbet
  ('Domaine Courbet', 'Côtes du Jura Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White')  -- https://www.vivino.com/en/wineries/domaine-courbet
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JEAN-LUC MOUILLARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Jean-Luc Mouillard', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet'),  -- https://www.vivino.com/en/wineries/jean-luc-mouillard
  ('Domaine Jean-Luc Mouillard', 'Côtes du Jura Trousseau Sur la Cour', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.vivino.com/en/wineries/jean-luc-mouillard
  ('Domaine Jean-Luc Mouillard', 'Côtes du Jura Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/jean-luc-mouillard
  ('Domaine Jean-Luc Mouillard', 'L''Étoile Sélection', 'L''Étoile, Jura, France', null, 'White'),  -- https://www.vivino.com/en/wineries/jean-luc-mouillard
  ('Domaine Jean-Luc Mouillard', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White')  -- https://www.vivino.com/en/wineries/jean-luc-mouillard
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRANÇOIS ROUSSET-MARTIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('François Rousset-Martin', 'Côtes du Jura Savagnin Perrières', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/francois-rousset-martin
  ('François Rousset-Martin', 'Château-Chalon Voile No 8 Vignes aux Dames', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/francois-rousset-martin
  ('François Rousset-Martin', 'Côtes du Jura Cuvée du Professeur Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/francois-rousset-martin
  ('François Rousset-Martin', 'Côtes du Jura Poulsard Les Vignasses', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.vivino.com/en/wineries/francois-rousset-martin
  ('François Rousset-Martin', 'Oxy More Voile No 4 Savagnin', 'Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/francois-rousset-martin
  ('François Rousset-Martin', 'Côtes du Jura Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/francois-rousset-martin
  ('François Rousset-Martin', 'Barbe Fleurie Gamay', 'Jura, France', 'Gamay', 'Red'),  -- https://www.vivino.com/en/wineries/francois-rousset-martin
  ('François Rousset-Martin', 'Macvin du Jura 5 Ans d''Âge', 'Jura, France', null, 'Fortified')  -- https://www.vivino.com/en/wineries/francois-rousset-martin
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FORET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Foret', 'The Touch Trad Chardonnay-Savagnin', 'Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/domaine-foret
  ('Domaine Foret', 'Vin Jaune', 'Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/domaine-foret
  ('Domaine Foret', 'Cuvée Todorin Chardonnay', 'Jura, France', 'Chardonnay', 'White'),  -- https://www.vivino.com/en/wineries/domaine-foret
  ('Domaine Foret', 'Lieu-dit Curon Poulsard', 'Jura, France', 'Poulsard', 'Red'),  -- https://www.vivino.com/en/wineries/domaine-foret
  ('Domaine Foret', 'Pinot Noir', 'Jura, France', 'Pinot Noir', 'Red'),  -- https://www.vivino.com/en/wineries/domaine-foret
  ('Domaine Foret', 'Secret d''Origine Savagnin Ouillé', 'Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/domaine-foret
  ('Domaine Foret', 'Macvin du Jura Chardonnay', 'Jura, France', 'Chardonnay', 'Fortified'),  -- https://www.vivino.com/en/wineries/domaine-foret
  ('Domaine Foret', 'Vin de Paille', 'Jura, France', null, 'Sweet')  -- https://www.vivino.com/en/wineries/domaine-foret
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE CHÂTEAU GRÉA ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Château Gréa', 'Macvin du Jura', 'Jura, France', null, 'Fortified'),  -- https://www.vivino.com/en/wineries/chateau-grea
  ('Domaine Château Gréa', 'Côtes du Jura Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.vivino.com/en/wineries/chateau-grea
  ('Domaine Château Gréa', 'Côtes du Jura Blanc', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.vivino.com/en/wineries/chateau-grea
  ('Domaine Château Gréa', 'Crémant du Jura Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.vivino.com/en/wineries/chateau-grea
  ('Domaine Château Gréa', 'Côtes du Jura Poulsard', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.vivino.com/en/wineries/chateau-grea
  ('Domaine Château Gréa', 'Côtes du Jura Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.vivino.com/en/wineries/chateau-grea
  ('Domaine Château Gréa', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet'),  -- https://www.vivino.com/en/wineries/chateau-grea
  ('Domaine Château Gréa', 'Côtes du Jura Rosé', 'Côtes du Jura, Jura, France', null, 'Rosé'),  -- https://www.vivino.com/en/wineries/chateau-grea
  ('Domaine Château Gréa', 'Côtes du Jura Pinot Noir', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red')  -- https://www.vivino.com/en/wineries/chateau-grea
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DU PÉLICAN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine du Pélican', 'Arbois Béranger Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Clos Saint Laurent Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois En Barbi Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Grand Curoulet Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Grand Curoulet Savagnin Ouillé', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Poulsard', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Savagnin Macération Pelliculaire', 'Arbois, Jura, France', 'Savagnin', 'Orange'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Savagnin Ouillé', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Savagnin Sous Voile', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Trois Cépages', 'Arbois, Jura, France', null, 'Red'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedupelican.fr/pages/nos-vins
  ('Domaine du Pélican', 'Brut S Zéro', 'Jura, France', null, 'Sparkling')  -- https://www.domainedupelican.fr/pages/nos-vins
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GANEVAT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Ganevat', 'Côtes du Jura Chardonnay En Billat', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/
  ('Domaine Ganevat', 'Côtes du Jura Chardonnay La Gravière', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/anne-and-j-f-ganevat/id/11441/?p=2
  ('Domaine Ganevat', 'Côtes du Jura Chardonnay Les Cèdres', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/anne-and-j-f-ganevat/id/11441/?p=2
  ('Domaine Ganevat', 'Côtes du Jura Chardonnay Les Varrons Vieilles Vignes', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/
  ('Domaine Ganevat', 'Côtes du Jura Florine', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/?p=2
  ('Domaine Ganevat', 'Côtes du Jura Grusse en Billat', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/?p=2
  ('Domaine Ganevat', 'Côtes du Jura La Barraque Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/anne-and-j-f-ganevat/id/11441/?p=2
  ('Domaine Ganevat', 'Côtes du Jura Les Chalasses Vieilles Vignes', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/
  ('Domaine Ganevat', 'Côtes du Jura Les Grands Teppes Pinot Noir', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/?p=2
  ('Domaine Ganevat', 'Côtes du Jura Les Grands Teppes Vieilles Vignes', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/
  ('Domaine Ganevat', 'Côtes du Jura Poulsard Les Chalasses Vieilles Vignes', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/?p=2
  ('Domaine Ganevat', 'Côtes du Jura Savagnin Sous la Roche', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/?p=2
  ('Domaine Ganevat', 'Côtes du Jura Trousseau Plein Sud', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/?p=2
  ('Domaine Ganevat', 'Côtes du Jura Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/
  ('Domaine Ganevat', 'Macvin du Jura Vieux Macvin', 'Jura, France', null, 'Fortified'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-francois-ganevat/id/11764/
  ('Domaine Ganevat', 'Côtes du Jura Les Vignes de mon Père', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Côtes du Jura Les Chamois du Paradis', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Côtes du Jura Les Chalasses Marnes Bleues', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Côtes du Jura Pinot Noir En Billat', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Côtes du Jura Cuvée de l''Enfant Terrible', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Côtes du Jura Cuvée Marguerite', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Côtes du Jura Savagnin Antide', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Côtes du Jura Chardonnay Le Montceau', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
  ('Domaine Ganevat', 'Crémant du Jura', 'Jura, France', null, 'Sparkling')  -- https://www.idealwine.com/en/buy-wine/domain-Ganevat%20(domaine)
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE JACQUES PUFFENEY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Jacques Puffeney', 'Arbois Trousseau Les Bérangères', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jacques-puffeney/id/11753/
  ('Domaine Jacques Puffeney', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jacques-puffeney/id/11753/
  ('Domaine Jacques Puffeney', 'Arbois Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/uk/domain/6835-Jacques-Puffeney.jsp
  ('Domaine Jacques Puffeney', 'Arbois Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/6835-Jacques-Puffeney.jsp
  ('Domaine Jacques Puffeney', 'Arbois Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.idealwine.com/uk/domain/6835-Jacques-Puffeney.jsp
  ('Domaine Jacques Puffeney', 'Arbois Savagnin', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/uk/domain/6835-Jacques-Puffeney.jsp
  ('Domaine Jacques Puffeney', 'Arbois Poulsard', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/uk/domain/6835-Jacques-Puffeney.jsp
  ('Domaine Jacques Puffeney', 'Arbois Naturé', 'Arbois, Jura, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/6835-Jacques-Puffeney.jsp
  ('Domaine Jacques Puffeney', 'Arbois Melon à Queue Rouge', 'Arbois, Jura, France', null, 'White'),  -- https://www.idealwine.com/uk/domain/6835-Jacques-Puffeney.jsp
  ('Domaine Jacques Puffeney', 'Arbois Chardonnay Cuvée Marginale', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/uk/domain/6835-Jacques-Puffeney.jsp
  ('Domaine Jacques Puffeney', 'Arbois Savagnin Cuvée Delphine', 'Arbois, Jura, France', 'Savagnin', 'White')  -- https://www.idealwine.com/uk/domain/6835-Jacques-Puffeney.jsp
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LABET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Labet', 'Côtes du Jura Bajocien Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=3
  ('Domaine Labet', 'Côtes du Jura Chardonnay En Billat', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=3
  ('Domaine Labet', 'Côtes du Jura Chardonnay En Chalasse', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=3
  ('Domaine Labet', 'Côtes du Jura Chardonnay En Chalasse Vieilles Vignes', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=3
  ('Domaine Labet', 'Côtes du Jura Chardonnay Les Varrons', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Côtes du Jura Chardonnay Savagnin Vin de Voile', 'Côtes du Jura, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Côtes du Jura Chardonnay sous voile Cuvée du Hasard', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=2
  ('Domaine Labet', 'Côtes du Jura Chercheurs d''Or', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=2
  ('Domaine Labet', 'Côtes du Jura Fleur Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=3
  ('Domaine Labet', 'Côtes du Jura Fleur de Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Côtes du Jura Fleur de Savagnin En Chalasse', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=3
  ('Domaine Labet', 'Côtes du Jura La Bardette Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=3
  ('Domaine Labet', 'Côtes du Jura La Pellerine Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=2
  ('Domaine Labet', 'Côtes du Jura La Reine Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=3
  ('Domaine Labet', 'Côtes du Jura Lias Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Côtes du Jura Poulsard Sur Charrière', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Côtes du Jura Savagnin En Chalasse Élevage Long', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=2
  ('Domaine Labet', 'Côtes du Jura Savagnin La Bardette Élevage Long', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=2
  ('Domaine Labet', 'Côtes du Jura Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=2
  ('Domaine Labet', 'Crémant du Jura Brut Nature', 'Jura, France', null, 'Sparkling'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Crémant du Jura Rosé', 'Jura, France', null, 'Sparkling'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Gamay La Reine', 'Jura, France', 'Gamay', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=2
  ('Domaine Labet', 'Macvin du Jura', 'Jura, France', null, 'Fortified'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=2
  ('Domaine Labet', 'Métis', 'Jura, France', null, 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Pinot Noir Les Varrons Sélection Clonale', 'Jura, France', 'Pinot Noir', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Pinot Noir Les Varrons Sélection Massale', 'Jura, France', 'Pinot Noir', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/?p=2
  ('Domaine Labet', 'Savagnin Sur Charrière Macération Longue', 'Jura, France', 'Savagnin', 'Orange'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
  ('Domaine Labet', 'Crémant du Jura', 'Jura, France', null, 'Sparkling'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Savagnin de Macération La Bardette', 'Côtes du Jura, Jura, France', 'Savagnin', 'Orange'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Poulsard En Billat', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Trousseau En Chalasse', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Trousseau Les Chaseaux', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Pinot Noir Les Varrons', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Chardonnay Les Champs Rouges', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Chardonnay Le Montceau', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Grains Fauves', 'Côtes du Jura, Jura, France', 'Savagnin', 'Sweet'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Macération-Savagnin Le Crêt', 'Côtes du Jura, Jura, France', 'Savagnin', 'Orange'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Côtes du Jura Trousseau Le Pré du Bief', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
  ('Domaine Labet', 'Vin de France Gamay Le Bois d''Alix', 'Jura, France', 'Gamay', 'Red')  -- https://idealwine.com/en/buy-wine/domain-Labet%20(Domaine)
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MACLE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Macle', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-macle/id/11758/
  ('Domaine Macle', 'Côtes du Jura Chardonnay Sous Voile', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-macle/id/11758/
  ('Domaine Macle', 'Côtes du Jura Tradition', 'Côtes du Jura, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://www.shiverick.com/domaine-jean-macle
  ('Domaine Macle', 'Macvin du Jura', 'Jura, France', null, 'Fortified'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/jean-macle/id/11758/
  ('Domaine Macle', 'Côtes du Jura', 'Côtes du Jura, Jura, France', 'Chardonnay, Savagnin', 'White')  -- https://idealwine.com/en/buy-wine/domain-Jean%20Macle
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PIGNIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Pignier', 'Côtes du Jura Cellier des Chartreux Chardonnay Sous Voile', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/pignier/id/12225/
  ('Domaine Pignier', 'Côtes du Jura Chardonnay de la Reculée', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/pignier/id/12225/
  ('Domaine Pignier', 'Côtes du Jura GPS', 'Côtes du Jura, Jura, France', null, 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/pignier/id/12225/
  ('Domaine Pignier', 'Côtes du Jura Sauvageon Savagnin Ouillé', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/pignier/id/12225/
  ('Domaine Pignier', 'Côtes du Jura Trousseau Les Gauthières', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/pignier/id/12225/
  ('Domaine Pignier', 'Côtes du Jura Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/pignier/id/12225/
  ('Domaine Pignier', 'Crémant du Jura Brut Nature', 'Jura, France', null, 'Sparkling'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/pignier/id/12225/
  ('Domaine Pignier', 'Crémant du Jura L''Autre', 'Jura, France', null, 'Sparkling'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/pignier/id/12225/
  ('Domaine Pignier', 'Gamay Blanc en Tappe', 'Jura, France', 'Gamay Blanc', 'White'),  -- https://en.lespassionnesduvin.com/catalog/category/view/s/pignier/id/12225/
  ('Domaine Pignier', 'Côtes du Jura Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Domaine%20Pignier
  ('Domaine Pignier', 'Macvin du Jura', 'Jura, France', null, 'Fortified')  -- https://idealwine.com/en/buy-wine/domain-Domaine%20Pignier
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JULIEN LABET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Julien Labet', 'Côtes du Jura Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red')  -- https://en.lespassionnesduvin.com/catalog/category/view/s/labet/id/11835/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- OVERNOY-HOUILLON ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Overnoy-Houillon', 'Arbois-Pupillin Poulsard', 'Arbois-Pupillin, Jura, France', 'Poulsard', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Overnoy
  ('Overnoy-Houillon', 'Arbois-Pupillin Chardonnay de Macération', 'Arbois-Pupillin, Jura, France', 'Chardonnay', 'Orange'),  -- https://idealwine.com/en/buy-wine/domain-Overnoy
  ('Overnoy-Houillon', 'Arbois-Pupillin Savagnin', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Overnoy
  ('Overnoy-Houillon', 'Arbois-Pupillin Chardonnay', 'Arbois-Pupillin, Jura, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Overnoy
  ('Overnoy-Houillon', 'Arbois-Pupillin Savagnin Élevage Prolongé', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Overnoy
  ('Overnoy-Houillon', 'Arbois-Pupillin Ploussard Trousseau', 'Arbois-Pupillin, Jura, France', 'Poulsard, Trousseau', 'Red'),  -- https://idealwine.com/en/buy-wine/domain-Overnoy
  ('Overnoy-Houillon', 'Arbois-Pupillin Chardonnay Élevage Prolongé', 'Arbois-Pupillin, Jura, France', 'Chardonnay', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Overnoy
  ('Overnoy-Houillon', 'Arbois-Pupillin Tradition Chardonnay Savagnin', 'Arbois-Pupillin, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://idealwine.com/en/buy-wine/domain-Overnoy
  ('Overnoy-Houillon', 'Arbois-Pupillin Vin Jaune', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White')  -- https://idealwine.com/en/buy-wine/domain-Overnoy
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- JEAN BOURDY ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Jean Bourdy', 'Vin de Paille Anna', 'Côtes du Jura, Jura, France', 'Savagnin, Poulsard', 'Sweet'),  -- https://domaine-bourdy.com/vin/vin-de-paille-anna/
  ('Jean Bourdy', 'Macvin du Jura François', 'Jura, France', 'Savagnin, Chardonnay', 'Fortified'),  -- https://domaine-bourdy.com/vin/macvin-du-jura-francois/
  ('Jean Bourdy', 'Crémant du Jura Rosé Jean-François', 'Jura, France', 'Pinot Noir', 'Sparkling'),  -- https://domaine-bourdy.com/vin/cremant-du-jura-rose-jean-francois/
  ('Jean Bourdy', 'Crémant du Jura Blanc Jean-François', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://domaine-bourdy.com/vin/cremant-du-jura-blanc-jean-francois/
  ('Jean Bourdy', 'Côtes du Jura Armand', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://domaine-bourdy.com/vin/cotes-du-jura-armand/
  ('Jean Bourdy', 'Côtes du Jura Henriette', 'Côtes du Jura, Jura, France', 'Trousseau, Poulsard, Pinot Noir', 'Red'),  -- https://domaine-bourdy.com/vin/cotes-du-jura-henriette/
  ('Jean Bourdy', 'Château-Chalon Christian', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://domaine-bourdy.com/vin/chateau-chalon-christian/
  ('Jean Bourdy', 'Côtes du Jura Sosthène', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://domaine-bourdy.com/vin/cotes-du-jura-sosthene/
  ('Jean Bourdy', 'Les Jumelles', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://domaine-bourdy.com/vin/les-jumelles/
  ('Jean Bourdy', 'Côtes du Jura Cuvée Jeanne', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://domaine-bourdy.com/vin/cotes-du-jura-cuvee-jeanne/
  ('Jean Bourdy', 'Côtes du Jura Suzanne', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://domaine-bourdy.com/vin/cotes-du-jura-suzanne/
  ('Jean Bourdy', 'Côtes du Jura Cuvée Lola', 'Côtes du Jura, Jura, France', 'Trousseau, Poulsard, Chardonnay', 'Red'),  -- https://domaine-bourdy.com/vin/cotes-du-jura-cuvee-lola/
  ('Jean Bourdy', 'Côtes du Jura Chloé', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red')  -- https://domaine-bourdy.com/vin/cotes-du-jura-chloe/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE MONTBOURGEAU ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Montbourgeau', 'L''Étoile', 'L''Étoile, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'L''Étoile Cuvée Spéciale', 'L''Étoile, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'L''Étoile Vin Jaune', 'L''Étoile, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'L''Étoile Savagnin', 'L''Étoile, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'L''Étoile Chardonnay La Chaux', 'L''Étoile, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'L''Étoile Chardonnay Courbette', 'L''Étoile, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'L''Étoile Chardonnay Les Bas de Montangis', 'L''Étoile, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'L''Étoile Les Budes', 'L''Étoile, Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'L''Étoile 5 Étoiles Chardonnay Ouillé', 'L''Étoile, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'Côtes du Jura Poulsard Clos des Fraisiers', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
  ('Domaine Montbourgeau', 'Côtes du Jura Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Montbourgeau
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE BADOZ ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Badoz', 'Crémant du Jura Blanc de Blancs Brut', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://www.domaine-badoz.fr/fr_FR/blanc-blancs-brut
  ('Domaine Badoz', 'Crémant du Jura Rosé Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.domaine-badoz.fr/fr_FR/rose-brut-cremant-jura
  ('Domaine Badoz', 'Côtes du Jura Chardonnay Les Roussots', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.domaine-badoz.fr/fr_FR/chardonnay-bio-les-roussots
  ('Domaine Badoz', 'Chardonnay Terroir du Revermont', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.domaine-badoz.fr/fr_FR/chardonnay-terroir-revermont
  ('Domaine Badoz', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-badoz.fr/fr_FR/chateau-chalon-2019
  ('Domaine Badoz', 'Cuvée Arrogance', 'Jura, France', null, 'White'),  -- https://www.domaine-badoz.fr/fr_FR/cuvee-arrogance-bio
  ('Domaine Badoz', 'Cuvée Edouard', 'Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-badoz.fr/fr_FR/cuvee-edouard-bio
  ('Domaine Badoz', 'Cuvée Victoria Badoz Savagnin Ouillé', 'Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-badoz.fr/fr_FR/cuvee-victoria-badoz-bio-savagnin-ouille
  ('Domaine Badoz', 'Grains de Poulsard Sans Soufre', 'Jura, France', 'Poulsard', 'Red'),  -- https://www.domaine-badoz.fr/fr_FR/grains-poulsard-bio-sans-soufre
  ('Domaine Badoz', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified'),  -- https://www.domaine-badoz.fr/fr_FR/macvin-jura-blanc-bio
  ('Domaine Badoz', 'Macvin du Jura Rouge', 'Jura, France', 'Poulsard, Trousseau, Pinot Noir', 'Fortified'),  -- https://www.domaine-badoz.fr/fr_FR/macvin-jura-rouge-bio
  ('Domaine Badoz', 'Arbois-Pupillin Pinot Noir', 'Arbois-Pupillin, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-badoz.fr/fr_FR/pinot-noir-arbois-pupillin
  ('Domaine Badoz', 'Pinot Noir Dédicace à Pierre', 'Jura, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-badoz.fr/fr_FR/pinot-noir-bio-dedicace-pierre-eleve-futs-chenes
  ('Domaine Badoz', 'Rubis Poulsard', 'Jura, France', 'Poulsard', 'Red'),  -- https://www.domaine-badoz.fr/fr_FR/rubis-poulsard
  ('Domaine Badoz', 'Savagnin Typé', 'Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-badoz.fr/fr_FR/savagnin-type
  ('Domaine Badoz', 'Tradition Chardonnay-Savagnin', 'Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://www.domaine-badoz.fr/fr_FR/tradition-bio-chardonnay-savagnin
  ('Domaine Badoz', 'Côtes du Jura Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.domaine-badoz.fr/fr_FR/trousseau
  ('Domaine Badoz', 'Trousseau Marnes Rouges', 'Jura, France', 'Trousseau', 'Red'),  -- https://www.domaine-badoz.fr/fr_FR/trousseau-bio-marnes-rouges
  ('Domaine Badoz', 'Vermeil Trousseau & Pinot Noir', 'Jura, France', 'Trousseau, Pinot Noir', 'Red'),  -- https://www.domaine-badoz.fr/fr_FR/vermeil-bio-trousseau-pinot-noir
  ('Domaine Badoz', 'Côtes du Jura Vin Jaune Les Roussots', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-badoz.fr/fr_FR/vin-jaune-2019-bio-les-roussots-cotes-du-jura-aoc
  ('Domaine Badoz', 'Vin de Paille', 'Jura, France', null, 'Sweet'),  -- https://www.domaine-badoz.fr/fr_FR/vin-paille-bio
  ('Domaine Badoz', 'Rosé d''Été Cuvée Gustave Courbet', 'Jura, France', null, 'Rosé')  -- https://www.domaine-badoz.fr/fr_FR/cuvee-gustave-courbet-rose-ete-bio-1
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DÉSIRÉ PETIT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Désiré Petit', 'Arbois-Pupillin Le Blouge', 'Arbois-Pupillin, Jura, France', null, 'Red'),  -- https://www.desirepetit.com/produit-le-blouge-2025-arbois-pupillin,43.html
  ('Domaine Désiré Petit', 'Côtes du Jura Rosé d''Été', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Rosé'),  -- https://www.desirepetit.com/produit-rose-d-a-ta--2025-ca-tes-du-jura-a-o-c-,19.html
  ('Domaine Désiré Petit', 'Crémant du Jura Blanc Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.desirepetit.com/produit-blanc-brut-cra-mant-du-jura-a-o-c-,33.html
  ('Domaine Désiré Petit', 'Crémant du Jura Rosé Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.desirepetit.com/produit-rosa--brut-cra-mant-du-jura-a-o-c-,32.html
  ('Domaine Désiré Petit', 'Crémant du Jura Tribu''lles', 'Jura, France', null, 'Sparkling'),  -- https://www.desirepetit.com/produit-tribu-lles-cra-mant-du-jura,46.html
  ('Domaine Désiré Petit', 'Crémant du Jura Cuvée Désirée Blanc de Blancs', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://www.desirepetit.com/produit-cuva-e-da-sira-e-blanc-de-blanc-cra-mant-du-jura,34.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Cuvée Jules', 'Arbois-Pupillin, Jura, France', null, 'White'),  -- https://www.desirepetit.com/produit-cuva-e-jules-2024-arbois-pupillin,20.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Ploussard', 'Arbois-Pupillin, Jura, France', 'Poulsard', 'Red'),  -- https://www.desirepetit.com/produit-ploussard-2025-arbois-pupillin,13.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Ploussard de Feule', 'Arbois-Pupillin, Jura, France', 'Poulsard', 'Red'),  -- https://www.desirepetit.com/produit-ploussard-de-feule-2025-arbois-pupillin,39.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Pinot Noir', 'Arbois-Pupillin, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.desirepetit.com/produit-pinot-noir-2024-arbois-pupillin,15.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Trousseau', 'Arbois-Pupillin, Jura, France', 'Trousseau', 'Red'),  -- https://www.desirepetit.com/produit-trousseau-2025-arbois-pupillin,14.html
  ('Domaine Désiré Petit', 'Arbois Trousseau Les Grandes Gardes', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.desirepetit.com/produit-les-grandes-gardes-2023-arbois-trousseau,16.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Cuvée S', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White'),  -- https://www.desirepetit.com/produit-cuvee-s-2023--arbois-pupillin,44.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Cuvée S Orange Savagnin de Macération', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'Orange'),  -- https://www.desirepetit.com/produit-cuvee-s-orange---savagnin-de-maceration-arbois-pupillin,45.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Cuvée Tradition', 'Arbois-Pupillin, Jura, France', null, 'White'),  -- https://www.desirepetit.com/produit-cuva-e-tradition--2023-arbois-pupillin,22.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Chardonnay Le Grapiot', 'Arbois-Pupillin, Jura, France', 'Chardonnay', 'White'),  -- https://www.desirepetit.com/produit-chardonnay-le-grapiot-2023-arbois-pupillin,42.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin L''Essen''ciel', 'Arbois-Pupillin, Jura, France', null, 'White'),  -- https://www.desirepetit.com/produit-l-essen-ciel-2023-arbois-pupillin,21.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Savagnin', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White'),  -- https://www.desirepetit.com/produit-savagnin-2021-arbois-pupillin,23.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Vin Jaune', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White'),  -- https://www.desirepetit.com/produit-vin-jaune-2016-arbois-pupillin,25.html
  ('Domaine Désiré Petit', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://www.desirepetit.com/produit-cha-teau-chalon-2019-cha-teau-chalon-a-o-c-,26.html
  ('Domaine Désiré Petit', 'Arbois-Pupillin Vin de Paille', 'Arbois-Pupillin, Jura, France', null, 'Sweet'),  -- https://www.desirepetit.com/produit-vin-de-paille-2022-arbois-pupillin,27.html
  ('Domaine Désiré Petit', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified'),  -- https://www.desirepetit.com/produit-macvin-blanc-macvin-du-jura-a-o-c-,29.html
  ('Domaine Désiré Petit', 'Macvin du Jura Rosé', 'Jura, France', null, 'Fortified')  -- https://www.desirepetit.com/produit-macvin-rosa--macvin-du-jura-a-o-c-,28.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LIGIER PÈRE ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Ligier Père et Fils', 'Arbois Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domaine-ligier.com/nos-vins-blancs-du-jura.html
  ('Domaine Ligier Père et Fils', 'Arbois Chardonnay Vieilles Vignes', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domaine-ligier.com/nos-vins-blancs-du-jura.html
  ('Domaine Ligier Père et Fils', 'Côtes du Jura Cuvée des Poètes', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-ligier.com/nos-vins-blancs-du-jura.html
  ('Domaine Ligier Père et Fils', 'Arbois Mille et une Nuits', 'Arbois, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://www.domaine-ligier.com/nos-vins-blancs-du-jura.html
  ('Domaine Ligier Père et Fils', 'Arbois Savagnin', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-ligier.com/nos-vins-blancs-du-jura.html
  ('Domaine Ligier Père et Fils', 'Arbois Poulsard', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.domaine-ligier.com/nos-vins-rouges-du-jura.html
  ('Domaine Ligier Père et Fils', 'Arbois Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-ligier.com/nos-vins-rouges-du-jura.html
  ('Domaine Ligier Père et Fils', 'Arbois Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.domaine-ligier.com/nos-vins-rouges-du-jura.html
  ('Domaine Ligier Père et Fils', 'Côtes du Jura Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.domaine-ligier.com/nos-vins-rouges-du-jura.html
  ('Domaine Ligier Père et Fils', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-ligier.com/nos-specialites-du-jura.html
  ('Domaine Ligier Père et Fils', 'Vin de Paille', 'Jura, France', 'Chardonnay, Savagnin, Poulsard', 'Sweet'),  -- https://www.domaine-ligier.com/nos-specialites-du-jura.html
  ('Domaine Ligier Père et Fils', 'Macvin du Jura', 'Jura, France', 'Savagnin', 'Fortified'),  -- https://www.domaine-ligier.com/nos-specialites-du-jura.html
  ('Domaine Ligier Père et Fils', 'Crémant du Jura Blanc de Blancs', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://www.domaine-ligier.com/nos-cremants-du-jura.html
  ('Domaine Ligier Père et Fils', 'Crémant du Jura Rosé', 'Jura, France', 'Trousseau, Pinot Noir', 'Sparkling')  -- https://www.domaine-ligier.com/nos-cremants-du-jura.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE GRAND ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Grand', 'Crémant du Jura Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Crémant du Jura Dosage Zéro', 'Jura, France', null, 'Sparkling'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Crémant du Jura Millésimé', 'Jura, France', null, 'Sparkling'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Côtes du Jura Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Côtes du Jura Chardonnay Grandes Chaudes', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Arbois Savagnin Ouillé En Guille-Bouton', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Arbois Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Côtes du Jura Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Côtes du Jura Trousseau Mont Royal', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Côtes du Jura Pinot Noir En Prêle', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Côtes du Jura Cuvée Tradition', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Côtes du Jura Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Côtes du Jura Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet'),  -- https://www.domaine-grand.com/vins-jura-bio/
  ('Domaine Grand', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified')  -- https://www.domaine-grand.com/vins-jura-bio/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE PHILIPPE BORNARD ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Melon à Queue Rouge', 'Arbois-Pupillin, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Chardonnay Le Blanc de la Rouge', 'Arbois-Pupillin, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Pinot Noir L''Aide Mémoire', 'Arbois-Pupillin, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Pinot Noir Petit Feule', 'Arbois-Pupillin, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Ploussard La Chamade', 'Arbois-Pupillin, Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Ploussard Point Barre', 'Arbois-Pupillin, Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Savagnin Macération Pelliculaire', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'Orange'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Trousseau Le Garde Corps', 'Arbois-Pupillin, Jura, France', 'Trousseau', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Trousseau Le Ginglet', 'Arbois-Pupillin, Jura, France', 'Trousseau', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Arbois-Pupillin Vin Jaune', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Côtes du Jura Les Chassagnes Savagnin Ouillé', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Ploussard Au Fil des Générations', 'Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Ploussard Point Barre Les Chambines', 'Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
  ('Domaine Philippe Bornard', 'Ploussard Point Barre Les Gaudrettes', 'Jura, France', 'Poulsard', 'Red')  -- https://www.idealwine.com/en/buy-wine/domain-Bornard
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE LA RENARDIÈRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine de la Renardière', 'Arbois Jurassique', 'Arbois, Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Renardi%C3%A8re
  ('Domaine de la Renardière', 'Arbois Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Renardi%C3%A8re
  ('Domaine de la Renardière', 'Arbois Ploussard', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Renardi%C3%A8re
  ('Domaine de la Renardière', 'Arbois Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Renardi%C3%A8re
  ('Domaine de la Renardière', 'Arbois-Pupillin Vin Jaune', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Renardi%C3%A8re
  ('Domaine de la Renardière', 'Macvin du Jura', 'Jura, France', null, 'Fortified')  -- https://www.idealwine.com/en/buy-wine/domain-Domaine%20de%20la%20Renardi%C3%A8re
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRUITIÈRE VINICOLE DE VOITEUR ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Chardonnay Fût', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=1
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Cuvée Prestige', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=1
  ('Fruitière Vinicole de Voiteur', 'L''Étoile', 'L''Étoile, Jura, France', null, 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=1
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=1
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=9
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Le Melon', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=9
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Le Duo', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=9
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Le Naturé', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=9
  ('Fruitière Vinicole de Voiteur', 'Le Sanguin', 'Jura, France', null, 'Red'),  -- https://vinsdujura-fvv.fr/index.php?cat=2
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Rosé Floral', 'Côtes du Jura, Jura, France', null, 'Rosé'),  -- https://vinsdujura-fvv.fr/index.php?cat=2
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Poulsard', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://vinsdujura-fvv.fr/index.php?cat=2
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Rouge', 'Côtes du Jura, Jura, France', null, 'Red'),  -- https://vinsdujura-fvv.fr/index.php?cat=2
  ('Fruitière Vinicole de Voiteur', 'Crémant du Jura Blanc Millésimé', 'Jura, France', null, 'Sparkling'),  -- https://vinsdujura-fvv.fr/index.php?cat=3
  ('Fruitière Vinicole de Voiteur', 'Crémant du Jura Blanc Cuvée M', 'Jura, France', null, 'Sparkling'),  -- https://vinsdujura-fvv.fr/index.php?cat=3
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet'),  -- https://vinsdujura-fvv.fr/index.php?cat=4
  ('Fruitière Vinicole de Voiteur', 'Côtes du Jura Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=5
  ('Fruitière Vinicole de Voiteur', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://vinsdujura-fvv.fr/index.php?cat=5
  ('Fruitière Vinicole de Voiteur', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified'),  -- https://vinsdujura-fvv.fr/index.php?cat=6
  ('Fruitière Vinicole de Voiteur', 'Macvin du Jura Rosé', 'Jura, France', null, 'Fortified')  -- https://vinsdujura-fvv.fr/index.php?cat=6
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRUITIÈRE VINICOLE D'ARBOIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Fruitière Vinicole d''Arbois', 'Château Béthanie Crémant du Jura', 'Jura, France', null, 'Sparkling'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/cremants
  ('Fruitière Vinicole d''Arbois', 'Crémant du Jura Blanc Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/cremants
  ('Fruitière Vinicole d''Arbois', 'Crémant du Jura Blanc Brut Montboisie', 'Jura, France', null, 'Sparkling'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/cremants
  ('Fruitière Vinicole d''Arbois', 'Crémant du Jura Blanc de Blancs', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/cremants
  ('Fruitière Vinicole d''Arbois', 'Crémant du Jura Rosé Brut', 'Jura, France', 'Pinot Noir, Poulsard', 'Sparkling'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/cremants
  ('Fruitière Vinicole d''Arbois', 'Arbois Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-blancs
  ('Fruitière Vinicole d''Arbois', 'Château Béthanie Arbois Cuvée Béthanie', 'Arbois, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-blancs
  ('Fruitière Vinicole d''Arbois', 'Arbois Love Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-blancs
  ('Fruitière Vinicole d''Arbois', 'Arbois Love Savagnin Ouillé', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-blancs
  ('Fruitière Vinicole d''Arbois', 'Arbois Savagnin', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-blancs
  ('Fruitière Vinicole d''Arbois', 'Côtes du Jura Fructea Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-blancs
  ('Fruitière Vinicole d''Arbois', 'Côtes du Jura Fructea Savagnin Ouillé', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-blancs
  ('Fruitière Vinicole d''Arbois', 'Côtes du Jura Tradition', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-blancs
  ('Fruitière Vinicole d''Arbois', 'Arbois Vin de Paille Prestige', 'Arbois, Jura, France', null, 'Sweet'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-jaune-et-specialites
  ('Fruitière Vinicole d''Arbois', 'Caveau des Jacobins Vin Jaune', 'Jura, France', 'Savagnin', 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-jaune-et-specialites
  ('Fruitière Vinicole d''Arbois', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-jaune-et-specialites
  ('Fruitière Vinicole d''Arbois', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-jaune-et-specialites
  ('Fruitière Vinicole d''Arbois', 'Macvin du Jura Ambré Caveau des Jacobins', 'Jura, France', null, 'Fortified'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-jaune-et-specialites
  ('Fruitière Vinicole d''Arbois', 'Macvin du Jura Rosé Fruitière', 'Jura, France', null, 'Fortified'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-jaune-et-specialites
  ('Fruitière Vinicole d''Arbois', 'Arbois Rosé', 'Arbois, Jura, France', null, 'Rosé'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-roses
  ('Fruitière Vinicole d''Arbois', 'Arbois Love Poulsard', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
  ('Fruitière Vinicole d''Arbois', 'Arbois Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
  ('Fruitière Vinicole d''Arbois', 'Arbois Pinot Noir Révolution', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
  ('Fruitière Vinicole d''Arbois', 'Arbois Poulsard', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
  ('Fruitière Vinicole d''Arbois', 'Arbois Trousseau Révolution', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
  ('Fruitière Vinicole d''Arbois', 'Arbois Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
  ('Fruitière Vinicole d''Arbois', 'Côtes du Jura Fructea Poulsard', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
  ('Fruitière Vinicole d''Arbois', 'Côtes du Jura Fructea Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
  ('Fruitière Vinicole d''Arbois', 'Côtes du Jura Pinot Noir', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
  ('Fruitière Vinicole d''Arbois', 'Côtes du Jura Rouge', 'Côtes du Jura, Jura, France', null, 'Red')  -- https://www.fruitiere-vinicole-arbois.fr/fr_FR/boutique/vins-rouges
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE HENRI MAIRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Henri Maire', 'Côtes du Jura Croix d''Argis Rosé', 'Côtes du Jura, Jura, France', null, 'Rosé'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/
  ('Domaine Henri Maire', 'Arbois Montfort Blanc', 'Arbois, Jura, France', null, 'White'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/
  ('Domaine Henri Maire', 'Arbois Montfort Rouge', 'Arbois, Jura, France', null, 'Red'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/
  ('Domaine Henri Maire', 'Arbois Domaine de Brégand Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/
  ('Domaine Henri Maire', 'Arbois Domaine de Brégand Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/
  ('Domaine Henri Maire', 'Arbois Grand Montfort Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/
  ('Domaine Henri Maire', 'Arbois Grand Montfort Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=2
  ('Domaine Henri Maire', 'Arbois Savagnin Sous Voile', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=2
  ('Domaine Henri Maire', 'Arbois Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=2
  ('Domaine Henri Maire', 'Arbois Poulsard', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=2
  ('Domaine Henri Maire', 'Arbois Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=2
  ('Domaine Henri Maire', 'Arbois Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=2
  ('Domaine Henri Maire', 'Arboisie Rosé', 'Arbois, Jura, France', null, 'Rosé'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=3
  ('Domaine Henri Maire', 'Arbois Vestale Collector Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=3
  ('Domaine Henri Maire', 'Arbois Cuvée Pasteur Blanc', 'Arbois, Jura, France', null, 'White'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=3
  ('Domaine Henri Maire', 'Côtes du Jura Cuvée Pasteur Rosé', 'Côtes du Jura, Jura, France', null, 'Rosé'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=3
  ('Domaine Henri Maire', 'Arbois Cuvée Pasteur Rouge', 'Arbois, Jura, France', null, 'Red'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=3
  ('Domaine Henri Maire', 'Arbois Réserve de Faramand Blanc', 'Arbois, Jura, France', null, 'White'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=3
  ('Domaine Henri Maire', 'Arbois Réserve de Faramand Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=3
  ('Domaine Henri Maire', 'Crémant du Jura Brut Grande Cuvée', 'Jura, France', null, 'Sparkling'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-appellations-d-origine-controlees.r-511/?p=3
  ('Domaine Henri Maire', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-specialites-du-jura.r-512/
  ('Domaine Henri Maire', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-specialites-du-jura.r-512/
  ('Domaine Henri Maire', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-specialites-du-jura.r-512/
  ('Domaine Henri Maire', 'Vin de Paille', 'Jura, France', null, 'Sweet'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-specialites-du-jura.r-512/
  ('Domaine Henri Maire', 'Prestige Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/les-exclusivites-henri-maire.r-513/
  ('Domaine Henri Maire', 'Vin Fou Champêtre Demi-Sec', 'Jura, France', null, 'Sparkling'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/le-vin-fou.r-514/
  ('Domaine Henri Maire', 'Vin Fou Champêtre Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/le-vin-fou.r-514/
  ('Domaine Henri Maire', 'Vin Fou Célébration Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/le-vin-fou.r-514/
  ('Domaine Henri Maire', 'Vin Fou L''Originale', 'Jura, France', null, 'Sparkling'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/le-vin-fou.r-514/
  ('Domaine Henri Maire', 'Vin Fou Muscat Doux', 'Jura, France', 'Muscat', 'Sparkling'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/le-vin-fou.r-514/
  ('Domaine Henri Maire', 'Vin Fou Alizarine Demi-Sec', 'Jura, France', null, 'Sparkling'),  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/le-vin-fou.r-514/
  ('Domaine Henri Maire', 'Vin Fou Alizarine Brut Rosé', 'Jura, France', null, 'Sparkling')  -- https://www.henri-maire.fr/fr/notre-collection.r-498/le-jura-et-ses-specialites.r-508/le-vin-fou.r-514/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- MARCEL CABELIER ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Marcel Cabelier', 'Côtes du Jura Côte 39', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://maisonduvigneron.com/fr/202-marcel-cabelier
  ('Marcel Cabelier', 'Côtes du Jura Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://maisonduvigneron.com/fr/202-marcel-cabelier
  ('Marcel Cabelier', 'Côtes du Jura Savagnin Ouillé', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://maisonduvigneron.com/fr/202-marcel-cabelier
  ('Marcel Cabelier', 'Crémant du Jura Esprit de Chardonnay Brut', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://maisonduvigneron.com/fr/202-marcel-cabelier
  ('Marcel Cabelier', 'Crémant du Jura Quintessence Brut', 'Jura, France', null, 'Sparkling'),  -- https://maisonduvigneron.com/fr/202-marcel-cabelier
  ('Marcel Cabelier', 'Crémant du Jura Rosé Brut', 'Jura, France', null, 'Sparkling'),  -- https://maisonduvigneron.com/fr/202-marcel-cabelier
  ('Marcel Cabelier', 'Crémant du Jura Vintage 60 Mois Extra Brut', 'Jura, France', null, 'Sparkling'),  -- https://maisonduvigneron.com/fr/202-marcel-cabelier
  ('Marcel Cabelier', 'Macvin du Jura Rouge', 'Jura, France', null, 'Fortified')  -- https://maisonduvigneron.com/fr/202-marcel-cabelier
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- BAUD PÈRE ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Baud Père et Fils', 'Crémant du Jura Brut Blanc', 'Jura, France', null, 'Sparkling'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Crémant du Jura Brut Rosé', 'Jura, France', null, 'Sparkling'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Crémant du Jura Extra Brut S', 'Jura, France', null, 'Sparkling'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Frais-Nésie', 'Jura, France', null, 'Sparkling'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura Poulsard En Rougemont', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura Rouge Ancestral', 'Côtes du Jura, Jura, France', null, 'Red'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura Trousseau Cousu Main', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura Cuvée Flor', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura L''Autre Savagnin Floral', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'L''Étoile Chardonnay', 'L''Étoile, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura Chardonnay Les Prémices', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura Jurachic''s Back', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura Deux Grains Tradition', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura L''Un Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Château-Chalon', 'Château-Chalon, Jura, France', 'Savagnin', 'White'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified'),  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
  ('Baud Père et Fils', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet')  -- https://www.domainebaud.fr/presentation/gamme-des-vins.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- FRUITIÈRE VINICOLE DE PUPILLIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Pinot Noir', 'Arbois-Pupillin, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.pupillin.com/vins-rouges
  ('Fruitière Vinicole de Pupillin', 'Arbois Pinot Noir Grande Réserve', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.pupillin.com/vins-rouges
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Ploussard', 'Arbois-Pupillin, Jura, France', 'Poulsard', 'Red'),  -- https://www.pupillin.com/vins-rouges
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Plouss''Art', 'Arbois-Pupillin, Jura, France', null, 'Red'),  -- https://www.pupillin.com/vins-rouges
  ('Fruitière Vinicole de Pupillin', 'Côtes du Jura Rouge Tradition', 'Côtes du Jura, Jura, France', null, 'Red'),  -- https://www.pupillin.com/vins-rouges
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Trousseau', 'Arbois-Pupillin, Jura, France', 'Trousseau', 'Red'),  -- https://www.pupillin.com/vins-rouges
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Trouss''Oh', 'Arbois-Pupillin, Jura, France', 'Trousseau', 'Red'),  -- https://www.pupillin.com/vins-rouges
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Chard''Oh', 'Arbois-Pupillin, Jura, France', 'Chardonnay', 'White'),  -- https://www.pupillin.com/vins-blancs
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Chardonnay', 'Arbois-Pupillin, Jura, France', 'Chardonnay', 'White'),  -- https://www.pupillin.com/vins-blancs
  ('Fruitière Vinicole de Pupillin', 'Côtes du Jura Chardonnay Élevé sous Voile', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.pupillin.com/vins-blancs
  ('Fruitière Vinicole de Pupillin', 'Arbois Chardonnay Grande Réserve', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.pupillin.com/vins-blancs
  ('Fruitière Vinicole de Pupillin', 'Côtes du Jura Cuvée Marilou', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.pupillin.com/vins-blancs
  ('Fruitière Vinicole de Pupillin', 'Côtes du Jura Margillat', 'Côtes du Jura, Jura, France', null, 'White'),  -- https://www.pupillin.com/vins-blancs
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Savagnin', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White'),  -- https://www.pupillin.com/vins-blancs
  ('Fruitière Vinicole de Pupillin', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified'),  -- https://www.pupillin.com/nos-specialites
  ('Fruitière Vinicole de Pupillin', 'Macvin du Jura Rosé', 'Jura, France', null, 'Fortified'),  -- https://www.pupillin.com/nos-specialites
  ('Fruitière Vinicole de Pupillin', 'Plouss''Fine', 'Jura, France', 'Poulsard', 'Fortified'),  -- https://www.pupillin.com/nos-specialites
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Vin de Paille', 'Arbois-Pupillin, Jura, France', null, 'Sweet'),  -- https://www.pupillin.com/nos-specialites
  ('Fruitière Vinicole de Pupillin', 'Arbois-Pupillin Vin Jaune', 'Arbois-Pupillin, Jura, France', 'Savagnin', 'White'),  -- https://www.pupillin.com/nos-specialites
  ('Fruitière Vinicole de Pupillin', 'Crémant du Jura Blanc Cuvée du Siècle', 'Jura, France', null, 'Sparkling'),  -- https://www.pupillin.com/cremants
  ('Fruitière Vinicole de Pupillin', 'Crémant du Jura Blanc Millésimé', 'Jura, France', null, 'Sparkling'),  -- https://www.pupillin.com/cremants
  ('Fruitière Vinicole de Pupillin', 'Papillette Rosé Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.pupillin.com/cremants
  ('Fruitière Vinicole de Pupillin', 'Papillette Blanc Brut', 'Jura, France', null, 'Sparkling'),  -- https://www.pupillin.com/cremants
  ('Fruitière Vinicole de Pupillin', 'Bouquets de Rosée', 'Jura, France', null, 'Rosé')  -- https://www.pupillin.com/vins-roses
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES MARNES BLANCHES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine des Marnes Blanches', 'Côtes du Jura Savagnin En Quatre Vis', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.lespassionnesduvin.com/savagnin-ouille-en-quatre-vis-2024-domaine-des-marnes-blanches.html
  ('Domaine des Marnes Blanches', 'Côtes du Jura Chardonnay Les Molates', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.lespassionnesduvin.com/chardonnay-les-molates-2023-domaine-des-marnes-blanches-jura.html
  ('Domaine des Marnes Blanches', 'Côtes du Jura Chardonnay En Quatre Vis', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.lespassionnesduvin.com/chardonnay-en-quatre-vis-2023-domaine-des-marnes-blanches.html
  ('Domaine des Marnes Blanches', 'L''Étoile Chardonnay Au Rettin', 'L''Étoile, Jura, France', 'Chardonnay', 'White'),  -- https://www.lespassionnesduvin.com/domaine-des-marnes-blanches-chardonnay-au-rettin-2022-l-etoile.html
  ('Domaine des Marnes Blanches', 'Côtes du Jura Chardonnay Les Bernardines', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.lespassionnesduvin.com/domaine-des-marnes-blanches-chardonnay-les-bernardines-2022.html
  ('Domaine des Marnes Blanches', 'Crémant du Jura Réserve', 'Jura, France', null, 'Sparkling'),  -- https://www.lespassionnesduvin.com/domaine-des-marnes-blanches-cremant-du-jura-reserve.html
  ('Domaine des Marnes Blanches', 'Macération En Quatre Vis', 'Jura, France', 'Chardonnay, Savagnin', 'Orange'),  -- https://www.lespassionnesduvin.com/domaine-des-marnes-blanches-maceration-chardonnay-savagnin-en-quatre-vis.html
  ('Domaine des Marnes Blanches', 'Macvin du Jura', 'Jura, France', null, 'Fortified'),  -- https://www.lespassionnesduvin.com/domaine-des-marnes-blanches-macvin-du-jura-13785.html
  ('Domaine des Marnes Blanches', 'Côtes du Jura Pinot Noir', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.lespassionnesduvin.com/domaine-des-marnes-blanches-pauline-et-geraud-fromont-pinot-noir-2023.html
  ('Domaine des Marnes Blanches', 'Côtes du Jura Savagnin En Jensillard', 'Côtes du Jura, Jura, France', 'Savagnin', 'White')  -- https://www.lespassionnesduvin.com/domaine-des-marnes-blanches-savagnin-en-jensillard-2023.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DES CAVARODES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine des Cavarodes', 'Chardonnay de Messagelin', 'Jura, France', 'Chardonnay', 'White'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-etienne-thiebaud-chardonnay-de-messagelin-2018.html
  ('Domaine des Cavarodes', 'Chardonnay Guille Bouton', 'Jura, France', 'Chardonnay', 'White'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-etienne-thiebaud-chardonnay-guille-bouton-2020.html
  ('Domaine des Cavarodes', 'Chardonnay Les Lumachelles', 'Jura, France', 'Chardonnay', 'White'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-etienne-thiebaud-chardonnay-les-lumachelles-2023.html
  ('Domaine des Cavarodes', 'Côtes du Jura Trousseau Les Lumachelles', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-etienne-thiebaud-cotes-du-jura-trousseau-les-lumachelles-2023.html
  ('Domaine des Cavarodes', 'Mattard Blanc', 'Jura, France', null, 'White'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-etienne-thiebaud-mattard-blanc-2017.html
  ('Domaine des Cavarodes', 'Pinot Noir Les Lumachelles', 'Jura, France', 'Pinot Noir', 'Red'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-etienne-thiebaud-pinot-noir-les-lumachelles-2023.html
  ('Domaine des Cavarodes', 'Poulsard Les Lumachelles', 'Jura, France', 'Poulsard', 'Red'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-etienne-thiebaud-poulsard-les-lumachelles-2023.html
  ('Domaine des Cavarodes', 'Vin de France Blanc Cuvé', 'Jura, France', null, 'White'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-etienne-thiebaud-vin-de-france-blanc-cuve.html
  ('Domaine des Cavarodes', 'Savagnin Pressé', 'Jura, France', 'Savagnin', 'White'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-savagnin-presse-etienne-thiebaud-2023.html
  ('Domaine des Cavarodes', 'Poulsard Chemenot', 'Jura, France', 'Poulsard', 'Red'),  -- https://www.lespassionnesduvin.com/domaine-des-cavarodes-thiebaud-poulsard-chemenot-2023.html
  ('Domaine des Cavarodes', 'IGP Franche-Comté Rouge', 'Jura, France', null, 'Red')  -- https://www.lespassionnesduvin.com/igp-franche-comte-rouge-2023-domaine-des-cavarodes-etienne-thiebaud.html
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DUGOIS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Dugois', 'Arbois Chardonnay Terre de Marne', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainedugois.fr/nos-vins/les-blancs/
  ('Domaine Dugois', 'Arbois Chardonnay Brise Bras', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainedugois.fr/nos-vins/les-blancs/
  ('Domaine Dugois', 'Arbois Chardonnay Mouchet', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.domainedugois.fr/nos-vins/les-blancs/
  ('Domaine Dugois', 'Arbois Savagnin Auréoline', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedugois.fr/nos-vins/les-blancs/
  ('Domaine Dugois', 'Arbois Savagnin sous voile', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedugois.fr/nos-vins/les-blancs/
  ('Domaine Dugois', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.domainedugois.fr/nos-vins/les-blancs/
  ('Domaine Dugois', 'Crémant du Jura Blanc', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://www.domainedugois.fr/nos-vins/les-cremants/
  ('Domaine Dugois', 'Crémant du Jura Millésime', 'Jura, France', 'Chardonnay', 'Sparkling'),  -- https://www.domainedugois.fr/nos-vins/les-cremants/
  ('Domaine Dugois', 'Crémant du Jura Rosé', 'Jura, France', 'Trousseau', 'Sparkling'),  -- https://www.domainedugois.fr/nos-vins/les-cremants/
  ('Domaine Dugois', 'Arbois Ploussard La Sombarde', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.domainedugois.fr/nos-vins/les-rouges/
  ('Domaine Dugois', 'Arbois Trousseau Les Trias', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.domainedugois.fr/nos-vins/les-rouges/
  ('Domaine Dugois', 'Arbois Trousseau Grevillière', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.domainedugois.fr/nos-vins/les-rouges/
  ('Domaine Dugois', 'Arbois Trousseau Damelière', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.domainedugois.fr/nos-vins/les-rouges/
  ('Domaine Dugois', 'Arbois Trousseau En Mouchet', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.domainedugois.fr/nos-vins/les-rouges/
  ('Domaine Dugois', 'Blanc de Grevillière', 'Jura, France', 'Trousseau', 'White'),  -- https://www.domainedugois.fr/nos-vins/les-rouges/
  ('Domaine Dugois', 'Arbois Pinot Noir La Tentative', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.domainedugois.fr/nos-vins/les-rouges/
  ('Domaine Dugois', 'Macvin du Jura', 'Jura, France', 'Chardonnay', 'Fortified'),  -- https://www.domainedugois.fr/nos-vins/autres-douceurs/
  ('Domaine Dugois', 'Arbois Vin de Paille', 'Arbois, Jura, France', 'Chardonnay, Trousseau, Savagnin, Poulsard', 'Sweet')  -- https://www.domainedugois.fr/nos-vins/autres-douceurs/
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE FRÉDÉRIC LORNET ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Frédéric Lornet', 'Arbois Chardonnay Les Messagelins', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.frederic-lornet.com/article-arbois-chardonnay-les-messagelins,7,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Chardonnay Savagnin', 'Arbois, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://www.frederic-lornet.com/article-arbois-chardonnay-savagnin,27,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://www.frederic-lornet.com/article-arbois-chardonnay,6,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Naturé', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.frederic-lornet.com/article-arbois-nature,8,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Pinot Noir', 'Arbois, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.frederic-lornet.com/article-arbois-pinot-noir,14,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Ploussard en Fertant', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.frederic-lornet.com/article-arbois-ploussard-en-fertant,5,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Ploussard', 'Arbois, Jura, France', 'Poulsard', 'Red'),  -- https://www.frederic-lornet.com/article-arbois-ploussard,32,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Savagnin', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.frederic-lornet.com/article-arbois-savagnin,16,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Trousseau des Dames', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.frederic-lornet.com/article-arbois-trousseau-des-dames,9,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Trousseau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.frederic-lornet.com/article-arbois-trousseau,13,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Vin Jaune', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.frederic-lornet.com/article-arbois-vin-jaune,1,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Côtes du Jura Vin de Paille', 'Côtes du Jura, Jura, France', null, 'Sweet'),  -- https://www.frederic-lornet.com/article-cotes-du-jura-vin-de-paille,12,vins-specialites.htm
  ('Domaine Frédéric Lornet', 'Crémant du Jura Brut Vieilles Vignes', 'Jura, France', null, 'Sparkling'),  -- https://www.frederic-lornet.com/article-cremant-brut-vieilles-vignes,3,vins-specialites.htm
  ('Domaine Frédéric Lornet', 'Crémant du Jura Brut Blanc', 'Jura, France', null, 'Sparkling'),  -- https://www.frederic-lornet.com/article-cremant-du-jura-brut-blanc,24,vins-specialites.htm
  ('Domaine Frédéric Lornet', 'Crémant du Jura Brut Rosé', 'Jura, France', null, 'Sparkling'),  -- https://www.frederic-lornet.com/article-cremant-du-jura-brut-rose,23,vins-specialites.htm
  ('Domaine Frédéric Lornet', 'Côtes du Jura Cuvée des Chamoz Chardonnay Savagnin', 'Côtes du Jura, Jura, France', 'Chardonnay, Savagnin', 'White'),  -- https://www.frederic-lornet.com/article-cuvee-des-chamoz-chardonnay-savagnin,15,vins-cotes-du-jura.htm
  ('Domaine Frédéric Lornet', 'Côtes du Jura Cuvée des Chamoz Chardonnay', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.frederic-lornet.com/article-cuvee-des-chamoz-chardonnay,26,vins-cotes-du-jura.htm
  ('Domaine Frédéric Lornet', 'Côtes du Jura Cuvée des Chamoz Pinot Noir', 'Côtes du Jura, Jura, France', 'Pinot Noir', 'Red'),  -- https://www.frederic-lornet.com/article-cuvee-des-chamoz-pinot-noir,35,vins-cotes-du-jura.htm
  ('Domaine Frédéric Lornet', 'Côtes du Jura Cuvée des Chamoz Ploussard', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.frederic-lornet.com/article-cuvee-des-chamoz-ploussard,28,vins-cotes-du-jura.htm
  ('Domaine Frédéric Lornet', 'Côtes du Jura Cuvée des Chamoz Savagnin', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.frederic-lornet.com/article-cuvee-des-chamoz-savagnin,29,vins-cotes-du-jura.htm
  ('Domaine Frédéric Lornet', 'Côtes du Jura Cuvée des Chamoz Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.frederic-lornet.com/article-cuvee-des-chamoz-trousseau,30,vins-cotes-du-jura.htm
  ('Domaine Frédéric Lornet', 'Côtes du Jura Cuvée des Chamoz Vin Jaune', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.frederic-lornet.com/article-cuvee-des-chamoz-vin-jaune,18,vins-cotes-du-jura.htm
  ('Domaine Frédéric Lornet', 'Arbois Cuvée Signée Roger Blanc', 'Arbois, Jura, France', null, 'White'),  -- https://www.frederic-lornet.com/article-cuvee-signee-roger-blanc,11,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Arbois Cuvée Signée Roger Rouge', 'Arbois, Jura, France', null, 'Red'),  -- https://www.frederic-lornet.com/article-cuvee-signee-roger-rouge,10,vins-arbois.htm
  ('Domaine Frédéric Lornet', 'Macvin du Jura Blanc', 'Jura, France', null, 'Fortified'),  -- https://www.frederic-lornet.com/article-macvin-du-jura-blanc,20,vins-specialites.htm
  ('Domaine Frédéric Lornet', 'Macvin du Jura Rosé', 'Jura, France', null, 'Fortified')  -- https://www.frederic-lornet.com/article-macvin-du-jura-rose,21,vins-specialites.htm
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE RIJCKAERT ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Rijckaert', 'Arbois Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://rijckaert.fr
  ('Domaine Rijckaert', 'Arbois Chardonnay En Paradis', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://rijckaert.fr
  ('Domaine Rijckaert', 'Arbois Savagnin Grand Elevage', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://rijckaert.fr
  ('Domaine Rijckaert', 'Arbois Savagnin', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://rijckaert.fr
  ('Domaine Rijckaert', 'Côtes du Jura Chardonnay Les Sarres', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://rijckaert.fr
  ('Domaine Rijckaert', 'Côtes du Jura Chardonnay Vigne des Voises', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://rijckaert.fr
  ('Domaine Rijckaert', 'Côtes du Jura Savagnin Les Sarres', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://rijckaert.fr
  ('Domaine Rijckaert', 'Arbois La Rouge', 'Arbois, Jura, France', 'Poulsard', 'Red')  -- https://rijckaert.fr
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE SAINT PIERRE ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine de Saint Pierre', 'Arbois Blanc Chardonnay', 'Arbois, Jura, France', 'Chardonnay', 'White'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-arbois-blanc-chardonnay-2023
  ('Domaine de Saint Pierre', 'Le Dos d''Chat Trousseau des Corvées', 'Jura, France', 'Trousseau', 'Red'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-le-dos-dchat-trousseau-2019
  ('Domaine de Saint Pierre', 'Trousseau', 'Jura, France', 'Trousseau', 'Red'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-trousseau-2020
  ('Domaine de Saint Pierre', 'Château Renard', 'Jura, France', null, 'White'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-chateau-renard-2018
  ('Domaine de Saint Pierre', 'Le Dos d''Chat Chardonnay', 'Jura, France', 'Chardonnay', 'White'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-le-dos-d-chat-chardonnay-2018
  ('Domaine de Saint Pierre', 'Savagnin de Voile', 'Jura, France', 'Savagnin', 'White'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-savagnin-de-voile-2012
  ('Domaine de Saint Pierre', 'Le Canon à Bulles', 'Jura, France', null, 'Sparkling'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-le-canon-a-bulles
  ('Domaine de Saint Pierre', 'Le Rouge', 'Jura, France', null, 'Red'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-le-rouge-2019
  ('Domaine de Saint Pierre', 'Petit Curoulet', 'Jura, France', null, 'Red'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-petit-curoulet-st-pierre-2020
  ('Domaine de Saint Pierre', 'Côtes du Jura Les Gaudrettes', 'Côtes du Jura, Jura, France', null, 'Red'),  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-cotes-du-jura-les-gaudrettes
  ('Domaine de Saint Pierre', 'Les Corvées', 'Jura, France', null, 'Red')  -- https://morenaturalwine.com/collections/domaine-de-saint-pierre/products/domaine-de-saint-pierre-les-corvee-2020
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE DE L'OCTAVIN ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine de l''Octavin', 'Arces Macéré', 'Jura, France', 'Chardonnay', 'Orange'),  -- https://octavin.fr/project/arces-macere/
  ('Domaine de l''Octavin', 'Commendatore', 'Jura, France', 'Trousseau', 'Red'),  -- https://octavin.fr/project/commendatore/
  ('Domaine de l''Octavin', 'Corvées de Trousseau', 'Jura, France', 'Trousseau', 'Red'),  -- https://octavin.fr/project/corvees-de-trousseau/
  ('Domaine de l''Octavin', 'Dorabella', 'Jura, France', 'Poulsard', 'Red'),  -- https://octavin.fr/project/dorabella/
  ('Domaine de l''Octavin', 'Elle Aime', 'Jura, France', 'Pinot Noir, Chardonnay', 'Red'),  -- https://octavin.fr/project/elle-aime/
  ('Domaine de l''Octavin', 'Hip Hip J Culotte Jaune', 'Jura, France', 'Chardonnay', 'White'),  -- https://octavin.fr/project/hip-hip-j-chardonnay/
  ('Domaine de l''Octavin', 'Hip Hip J Pinot Noir', 'Jura, France', 'Pinot Noir', 'Red'),  -- https://octavin.fr/project/hip-hip-j-pinot-noir/
  ('Domaine de l''Octavin', 'Hip Hip J Poulsard', 'Jura, France', 'Poulsard', 'Red'),  -- https://octavin.fr/project/hip-hip-j-poulsard/
  ('Domaine de l''Octavin', 'Pamina', 'Jura, France', 'Chardonnay', 'White'),  -- https://octavin.fr/project/pamina/
  ('Domaine de l''Octavin', 'Potion Magique', 'Jura, France', 'Chardonnay, Savagnin, Poulsard', 'Red'),  -- https://octavin.fr/project/potion-magique/
  ('Domaine de l''Octavin', 'P''tit Poussot', 'Jura, France', 'Chardonnay', 'White'),  -- https://octavin.fr/project/ptit-poussot/
  ('Domaine de l''Octavin', 'Zerlina', 'Jura, France', 'Trousseau, Pinot Noir', 'Red'),  -- https://octavin.fr/project/zerlina/
  ('Domaine de l''Octavin', 'Reine de la Nuit', 'Jura, France', null, 'White'),  -- https://www.idealwine.com/en/buy-a-wine/B2206190-513-1-bottle-Vin-de-France-Reine-de-la-Nuit-Domaine-de-LOctavin-Alice-Bouvot-2017-White
  ('Domaine de l''Octavin', 'Charlot Rouge', 'Jura, France', null, 'Red')  -- https://creamwine.com/brand.php?id=792
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- LES GRANGES PAQUENESSES ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Les Granges Paquenesses', 'Côtes du Jura Trousseau', 'Côtes du Jura, Jura, France', 'Trousseau', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/2789201-1-bottle-Cotes-du-Jura-Trousseau-Les-Granges-Paquenesses-2019-Red
  ('Les Granges Paquenesses', 'Côtes du Jura Savagnin Ouillé Les Trouillots', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-a-wine/2789827-2-bottles-Cotes-du-Jura-Savagnin-Ouille-Les-Trouillots-Les-Granges-Paquenesses-2020-White
  ('Les Granges Paquenesses', 'Côtes du Jura Chardonnay La Mamette', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-a-wine/2789822-1-bottle-Cotes-du-Jura-Chardonnay-La-Mamette-Les-Granges-Paquenesses-2019-White
  ('Les Granges Paquenesses', 'Côtes du Jura Savagnin La Pierre', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-a-wine/2789199-1-bottle-Cotes-du-Jura-Savagnin-La-Pierre-Les-Granges-Paquenesses-2018-White
  ('Les Granges Paquenesses', 'Côtes du Jura La Pierre Renaissance Savagnin Ouillé', 'Côtes du Jura, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-a-wine/2789422-1-bottle-Cotes-du-Jura-La-Pierre-Renaissance-Savagnin-Ouille-Les-Granges-Paquenesses-2020-White
  ('Les Granges Paquenesses', 'Côtes du Jura Chardonnay L''Ephémère', 'Côtes du Jura, Jura, France', 'Chardonnay', 'White'),  -- https://www.idealwine.com/en/buy-a-wine/2789417-1-bottle-Cotes-du-Jura-Chardonnay-LEphemere-Les-Granges-Paquenesses-2020-White
  ('Les Granges Paquenesses', 'Côtes du Jura Ploussard', 'Côtes du Jura, Jura, France', 'Poulsard', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/B2253583-493-1-bottle-Cotes-du-Jura-Ploussard-Les-Granges-Paquenesses-no-reserve-2020-Red
  ('Les Granges Paquenesses', 'Côtes du Jura Savagnin Les Fées Papillon', 'Côtes du Jura, Jura, France', 'Savagnin', 'White')  -- https://www.idealwine.com/en/buy-a-wine/B2189537-1606-1-bottle-Cotes-du-Jura-Savagnin-les-Fees-Papillon-Granges-Paquenesses-2018-White
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';

-- ---- DOMAINE LUCIEN AVIET ET FILS ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source, verification_status, verified_source, verified_at, verification_notes)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed', 'verified', 'web-page', now(), 'Producer range, confirmed on a real page 2026-11-26 (URL in supabase/seeds/producer_ranges_r3_jura.sql)'
from (values
  ('Domaine Lucien Aviet et Fils', 'Arbois Trousseau Cuvée des Géologues Ruzard', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/2375718-1-bottle-Arbois-Trousseau-Ruzard-Cuvee-des-Geologues-Lucien-Aviet-Domaine-2021-Red
  ('Domaine Lucien Aviet et Fils', 'Arbois Trousseau Cuvée des Géologues Marne Rouge', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/2746636-1-bottle-Arbois-Trousseau-Marne-Rouge-Cuvee-des-Geologues-Lucien-Aviet-Domaine-2018-Red
  ('Domaine Lucien Aviet et Fils', 'Arbois Trousseau Cuvée des Géologues Nonceau', 'Arbois, Jura, France', 'Trousseau', 'Red'),  -- https://www.idealwine.com/en/buy-a-wine/2849671-1-bottle-Arbois-Trousseau-Nonceau-Cuvee-des-Geologues-Lucien-Aviet-Domaine-2023-Red
  ('Domaine Lucien Aviet et Fils', 'Arbois Savagnin Réserve du Caveau', 'Arbois, Jura, France', 'Savagnin', 'White'),  -- https://www.idealwine.com/en/buy-a-wine/2849650-2-bottles-Arbois-Savagnin-Reserve-du-Caveau-Lucien-Aviet-Domaine-2024-White
  ('Domaine Lucien Aviet et Fils', 'Arbois Vin Jaune Cuvée de la Confrérie', 'Arbois, Jura, France', 'Savagnin', 'White')  -- https://www.idealwine.com/en/buy-a-wine/2849662-1-Clavelin-Arbois-Vin-Jaune-Cuvee-de-la-Confrerie-Lucien-Aviet-Domaine-2017-White
) as v(p, w, r, g, s)
on conflict (search_key) do update set verification_status = 'verified', verified_source = excluded.verified_source, verified_at = now(), verification_notes = excluded.verification_notes
where public.wines_catalog.verification_status is distinct from 'verified';
