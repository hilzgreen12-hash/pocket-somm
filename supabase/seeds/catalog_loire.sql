-- ============================================================================
-- wines_catalog seed — Loire Valley (full sweep)
-- ============================================================================
-- Run in the Supabase SQL editor. Idempotent (search_key auto-normalises;
-- ON CONFLICT DO NOTHING). Real producers + flagship/documented cuvées only.
-- Style ∈ Red / White / Rosé / Sparkling / Fortified. Sweet Chenins (Layon,
-- Quarts de Chaume, Bonnezeaux, Vouvray Moelleux) are filed as White.
-- ============================================================================

-- ---- CENTRAL LOIRE — Sancerre / Pouilly-Fumé / Menetou (Sauvignon Blanc) ----
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Henri Bourgeois', 'La Bourgeoise', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Henri Bourgeois', 'Jadis', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Henri Bourgeois', 'Sancerre Blanc', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Pascal Cotat', 'Les Monts Damnés', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Pascal Cotat', 'La Grande Côte', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Pascal Cotat', 'Les Culs de Beaujeu', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('François Cotat', 'Les Monts Damnés', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('François Cotat', 'La Grande Côte', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('François Cotat', 'Les Culs de Beaujeu', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Alphonse Mellot', 'La Moussière', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Alphonse Mellot', 'Edmond', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Alphonse Mellot', 'Génération XIX', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Domaine Vacheron', 'Sancerre Blanc', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Domaine Vacheron', 'Les Romains', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Domaine Vacheron', 'Belle Dame', 'Sancerre', 'Pinot Noir', 'Red'),
  ('Lucien Crochet', 'Le Chêne', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Lucien Crochet', 'La Croix du Roy', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Gérard Boulay', 'Monts Damnés', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Claude Riffault', 'Les Boucauds', 'Sancerre', 'Sauvignon Blanc', 'White'),
  ('Didier Dagueneau', 'Silex', 'Pouilly-Fumé', 'Sauvignon Blanc', 'White'),
  ('Didier Dagueneau', 'Pur Sang', 'Pouilly-Fumé', 'Sauvignon Blanc', 'White'),
  ('Didier Dagueneau', 'Buisson Renard', 'Pouilly-Fumé', 'Sauvignon Blanc', 'White'),
  ('Didier Dagueneau', 'Blanc Fumé de Pouilly', 'Pouilly-Fumé', 'Sauvignon Blanc', 'White'),
  ('Henri Pellé', 'Morogues', 'Menetou-Salon', 'Sauvignon Blanc', 'White')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- VOUVRAY / MONTLOUIS (Chenin Blanc) ------------------------------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Domaine Huet', 'Le Mont Sec', 'Vouvray', 'Chenin Blanc', 'White'),
  ('Domaine Huet', 'Le Haut-Lieu Demi-Sec', 'Vouvray', 'Chenin Blanc', 'White'),
  ('Domaine Huet', 'Clos du Bourg Sec', 'Vouvray', 'Chenin Blanc', 'White'),
  ('Domaine Huet', 'Le Mont Moelleux', 'Vouvray', 'Chenin Blanc', 'White'),
  ('Domaine Huet', 'Pétillant Brut', 'Vouvray', 'Chenin Blanc', 'Sparkling'),
  ('Domaine du Clos Naudin', 'Vouvray Sec', 'Vouvray', 'Chenin Blanc', 'White'),
  ('Domaine du Clos Naudin', 'Vouvray Demi-Sec', 'Vouvray', 'Chenin Blanc', 'White'),
  ('Domaine du Clos Naudin', 'Vouvray Moelleux', 'Vouvray', 'Chenin Blanc', 'White'),
  ('François Chidaine', 'Les Choisilles', 'Montlouis-sur-Loire', 'Chenin Blanc', 'White'),
  ('François Chidaine', 'Clos du Breuil', 'Montlouis-sur-Loire', 'Chenin Blanc', 'White'),
  ('François Chidaine', 'Les Bournais', 'Montlouis-sur-Loire', 'Chenin Blanc', 'White'),
  ('François Chidaine', 'Clos Habert', 'Montlouis-sur-Loire', 'Chenin Blanc', 'White'),
  ('Domaine de la Taille aux Loups', 'Remus', 'Montlouis-sur-Loire', 'Chenin Blanc', 'White'),
  ('Domaine de la Taille aux Loups', 'Triple Zéro', 'Montlouis-sur-Loire', 'Chenin Blanc', 'Sparkling'),
  ('Vincent Carême', 'Le Sec', 'Vouvray', 'Chenin Blanc', 'White'),
  ('Vincent Carême', 'Le Clos', 'Vouvray', 'Chenin Blanc', 'White')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- SAVENNIÈRES / ANJOU (Chenin Blanc; sweet Layon) -----------------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Nicolas Joly', 'Clos de la Coulée de Serrant', 'Savennières', 'Chenin Blanc', 'White'),
  ('Nicolas Joly', 'Les Vieux Clos', 'Savennières', 'Chenin Blanc', 'White'),
  ('Nicolas Joly', 'Clos de la Bergerie', 'Savennières', 'Chenin Blanc', 'White'),
  ('Domaine des Baumard', 'Clos du Papillon', 'Savennières', 'Chenin Blanc', 'White'),
  ('Domaine des Baumard', 'Savennières', 'Savennières', 'Chenin Blanc', 'White'),
  ('Domaine des Baumard', 'Clos de Sainte Catherine', 'Coteaux du Layon', 'Chenin Blanc', 'White'),
  ('Domaine des Baumard', 'Quarts de Chaume', 'Quarts de Chaume', 'Chenin Blanc', 'White'),
  ('Château Pierre-Bise', 'Quarts de Chaume', 'Quarts de Chaume', 'Chenin Blanc', 'White'),
  ('Château Pierre-Bise', 'Savennières Clos de Coulaine', 'Savennières', 'Chenin Blanc', 'White'),
  ('Domaine du Closel', 'Clos du Papillon', 'Savennières', 'Chenin Blanc', 'White'),
  ('Richard Leroy', 'Les Noëls de Montbenault', 'Anjou', 'Chenin Blanc', 'White'),
  ('Richard Leroy', 'Les Rouliers', 'Anjou', 'Chenin Blanc', 'White'),
  ('Domaine Ogereau', 'Coteaux du Layon Saint-Lambert', 'Coteaux du Layon', 'Chenin Blanc', 'White')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- CHINON / BOURGUEIL / SAUMUR-CHAMPIGNY (Cabernet Franc) -----------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Charles Joguet', 'Clos de la Dioterie', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Charles Joguet', 'Les Varennes du Grand Clos', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Charles Joguet', 'Clos du Chêne Vert', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Bernard Baudry', 'Les Grézeaux', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Bernard Baudry', 'La Croix Boissée', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Bernard Baudry', 'Le Clos Guillot', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Bernard Baudry', 'Les Granges', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Olga Raffault', 'Les Picasses', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Philippe Alliet', 'Coteau de Noiré', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Philippe Alliet', 'Vieilles Vignes', 'Chinon', 'Cabernet Franc', 'Red'),
  ('Yannick Amirault', 'La Petite Cave', 'Bourgueil', 'Cabernet Franc', 'Red'),
  ('Yannick Amirault', 'Les Quartiers', 'Bourgueil', 'Cabernet Franc', 'Red'),
  ('Catherine et Pierre Breton', 'Les Perrières', 'Bourgueil', 'Cabernet Franc', 'Red'),
  ('Catherine et Pierre Breton', 'Trinch!', 'Bourgueil', 'Cabernet Franc', 'Red'),
  ('Catherine et Pierre Breton', 'Clos Sénéchal', 'Bourgueil', 'Cabernet Franc', 'Red'),
  ('Domaine de la Chevalerie', 'Busardières', 'Bourgueil', 'Cabernet Franc', 'Red'),
  ('Clos Rougeard', 'Le Clos', 'Saumur-Champigny', 'Cabernet Franc', 'Red'),
  ('Clos Rougeard', 'Les Poyeux', 'Saumur-Champigny', 'Cabernet Franc', 'Red'),
  ('Clos Rougeard', 'Le Bourg', 'Saumur-Champigny', 'Cabernet Franc', 'Red'),
  ('Domaine des Roches Neuves', 'Terres Chaudes', 'Saumur-Champigny', 'Cabernet Franc', 'Red'),
  ('Domaine des Roches Neuves', 'L''Insolite', 'Saumur', 'Chenin Blanc', 'White'),
  ('Domaine des Roches Neuves', 'Franc de Pied', 'Saumur-Champigny', 'Cabernet Franc', 'Red'),
  ('Château de Villeneuve', 'Le Grand Clos', 'Saumur-Champigny', 'Cabernet Franc', 'Red'),
  ('Château de Villeneuve', 'Vieilles Vignes', 'Saumur-Champigny', 'Cabernet Franc', 'Red')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;

-- ---- MUSCADET (Melon de Bourgogne) -----------------------------------------
insert into public.wines_catalog (producer, wine_name, region, grape, style, display, source)
select p, w, r, g, s, trim(p || ' ' || coalesce(w, '')), 'seed'
from (values
  ('Domaine de la Pépière', 'Clos des Briords', 'Muscadet Sèvre et Maine', 'Melon de Bourgogne', 'White'),
  ('Domaine de la Pépière', 'Clisson', 'Muscadet Sèvre et Maine', 'Melon de Bourgogne', 'White'),
  ('Domaine de la Pépière', 'Château-Thébaud', 'Muscadet Sèvre et Maine', 'Melon de Bourgogne', 'White'),
  ('Domaine de l''Écu', 'Expression de Granite', 'Muscadet Sèvre et Maine', 'Melon de Bourgogne', 'White'),
  ('Domaine de l''Écu', 'Expression de Gneiss', 'Muscadet Sèvre et Maine', 'Melon de Bourgogne', 'White'),
  ('Domaine de l''Écu', 'Expression d''Orthogneiss', 'Muscadet Sèvre et Maine', 'Melon de Bourgogne', 'White'),
  ('Luneau-Papin', 'Le L d''Or', 'Muscadet Sèvre et Maine', 'Melon de Bourgogne', 'White'),
  ('Luneau-Papin', 'Pierre de la Grange', 'Muscadet Sèvre et Maine', 'Melon de Bourgogne', 'White')
) as v(p, w, r, g, s)
on conflict (search_key) do nothing;
