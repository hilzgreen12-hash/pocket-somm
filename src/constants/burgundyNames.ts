// Burgundy names Vinster should always "hear" correctly when dictated — the
// appellations, grands crus, well-known premiers crus / climats and Chablis crus.
// French spellings that speech-to-text turns into English noise ("shambol
// moosinee", "esh ez oh", "fee san"). Fed to the sound-alike corrector
// (src/utils/soundAlike.ts) alongside the user's own wines.

// Regional & sub-regional appellations.
const REGIONAL = [
  'Bourgogne', 'Bourgogne Aligoté', 'Bourgogne Passe-Tout-Grains', 'Coteaux Bourguignons', 'Crémant de Bourgogne',
  'Bourgogne Hautes-Côtes de Nuits', 'Bourgogne Hautes-Côtes de Beaune', 'Côte de Nuits-Villages', 'Côte de Beaune-Villages',
  'Bourgogne Côte Chalonnaise', 'Mâcon', 'Mâcon-Villages', 'Côte d\'Or', 'Côte de Nuits', 'Côte de Beaune',
  'Bourgogne Épineuil', 'Bourgogne Tonnerre', 'Bourgogne Chitry', 'Bourgogne Côtes d\'Auxerre', 'Irancy', 'Saint-Bris',
];

// Village appellations (Chablis, Côte de Nuits, Côte de Beaune, Chalonnaise, Mâconnais).
const VILLAGES = [
  'Chablis', 'Petit Chablis',
  'Marsannay', 'Fixin', 'Gevrey-Chambertin', 'Morey-Saint-Denis', 'Chambolle-Musigny', 'Vougeot', 'Flagey-Échezeaux',
  'Vosne-Romanée', 'Nuits-Saint-Georges', 'Prémeaux-Prissey', 'Comblanchien', 'Corgoloin',
  'Ladoix', 'Aloxe-Corton', 'Pernand-Vergelesses', 'Savigny-lès-Beaune', 'Chorey-lès-Beaune', 'Beaune', 'Pommard',
  'Volnay', 'Monthelie', 'Auxey-Duresses', 'Saint-Romain', 'Meursault', 'Blagny', 'Puligny-Montrachet',
  'Chassagne-Montrachet', 'Saint-Aubin', 'Santenay', 'Maranges',
  'Bouzeron', 'Rully', 'Mercurey', 'Givry', 'Montagny',
  'Pouilly-Fuissé', 'Pouilly-Loché', 'Pouilly-Vinzelles', 'Saint-Véran', 'Viré-Clessé',
];

// The 33 grands crus of the Côte d'Or plus the Chablis grand cru climats.
const GRAND_CRUS = [
  'Chambertin', 'Chambertin-Clos de Bèze', 'Clos de Bèze', 'Chapelle-Chambertin', 'Charmes-Chambertin', 'Mazoyères-Chambertin',
  'Griotte-Chambertin', 'Latricières-Chambertin', 'Mazis-Chambertin', 'Ruchottes-Chambertin',
  'Clos de la Roche', 'Clos Saint-Denis', 'Clos des Lambrays', 'Clos de Tart', 'Bonnes-Mares', 'Musigny',
  'Clos de Vougeot', 'Clos Vougeot', 'Échezeaux', 'Grands-Échezeaux', 'Richebourg', 'Romanée-Saint-Vivant',
  'Romanée-Conti', 'La Romanée', 'La Tâche', 'La Grande Rue',
  'Corton', 'Corton-Charlemagne', 'Charlemagne', 'Montrachet', 'Le Montrachet', 'Chevalier-Montrachet', 'Bâtard-Montrachet',
  'Bienvenues-Bâtard-Montrachet', 'Criots-Bâtard-Montrachet',
  'Les Clos', 'Valmur', 'Vaudésir', 'Grenouilles', 'Bougros', 'Les Preuses', 'Blanchot', 'La Moutonne',
];

// Well-known premiers crus and climats (most asked-for / most misheard).
const PREMIER_CRUS = [
  // Chablis
  'Montée de Tonnerre', 'Mont de Milieu', 'Fourchaume', 'Vaillons', 'Montmains', 'Les Forêts', 'Butteaux', 'Séchet',
  'Vaucoupin', 'Côte de Léchet', 'Beauroy', 'Vau de Vey', 'Vosgros', 'Les Lys', 'Mélinots', 'Beugnons', 'Chapelot',
  // Gevrey / Morey / Chambolle
  'Clos Saint-Jacques', 'Lavaut Saint-Jacques', 'Les Cazetiers', 'Combe aux Moines', 'Estournelles-Saint-Jacques',
  'Les Champeaux', 'Aux Combottes', 'Les Corbeaux', 'Petite Chapelle', 'Les Goulots', 'Les Évocelles', 'Clos des Ruchottes',
  'Clos des Ormes', 'Les Ruchots', 'Les Millandes', 'Clos Sorbè', 'Monts Luisants', 'Clos de la Bussière',
  'Les Amoureuses', 'Les Charmes', 'Les Fuées', 'Les Cras', 'Les Baudes', 'Les Sentiers', 'Les Hauts Doix',
  'Derrière la Grange', 'Les Gruenchers', 'Les Feusselottes', 'Les Chatelots', 'Les Noirots', 'La Combe d\'Orveau',
  // Vougeot / Vosne / Nuits
  'Les Petits Vougeots', 'Clos Blanc de Vougeot', 'Le Clos Blanc', 'Les Cras de Vougeot',
  'Aux Malconsorts', 'Les Suchots', 'Les Beaux Monts', 'Cros Parantoux', 'Aux Brûlées', 'Les Brûlées', 'Les Chaumes',
  'Les Petits Monts', 'Les Gaudichots', 'Aux Reignots', 'En Orveaux', 'Clos des Réas', 'La Croix Rameau', 'Au-Dessus des Malconsorts',
  'Les Saint-Georges', 'Les Vaucrains', 'Les Pruliers', 'Aux Boudots', 'Les Cailles', 'Aux Murgers', 'Aux Chaignots',
  'Les Damodes', 'Clos des Corvées', 'Clos de la Maréchale', 'Les Didiers', 'Les Porrets', 'Aux Thorey', 'Les Perrières',
  'Clos des Forêts Saint-Georges', 'Clos de l\'Arlot', 'Aux Argillas', 'Les Poulettes', 'Rue de Chaux', 'Aux Cras',
  // Côte de Beaune reds
  'Les Grèves', 'Les Bressandes', 'Clos du Roi', 'Les Teurons', 'Clos des Mouches', 'Les Marconnets', 'Les Cent Vignes',
  'Les Fèves', 'Clos des Ursules', 'Les Vignes Franches', 'Les Avaux', 'Les Toussaints', 'Les Boucherottes',
  'Les Rugiens', 'Les Épenots', 'Les Grands Épenots', 'Clos des Épeneaux', 'Les Jarolières', 'Les Pézerolles', 'Les Arvelets',
  'Clos des Ducs', 'Les Caillerets', 'Clos des Chênes', 'Les Santenots', 'Santenots du Milieu', 'Taillepieds',
  'Les Champans', 'Clos de la Bousse d\'Or', 'Les Mitans', 'Clos des 60 Ouvrées', 'Les Fremiets',
  'Les Lavières', 'Les Narbantons', 'Aux Serpentières', 'Les Dominode', 'Île des Vergelesses', 'Les Vergelesses',
  'Sous Frétille', 'Les Fichots', 'Clos du Chapitre', 'Les Duresses', 'Les Gravières', 'La Maladière', 'Clos Tavannes',
  // Côte de Beaune whites
  'Les Perrières', 'Les Genevrières', 'Les Gouttes d\'Or', 'Les Poruzots', 'Le Porusot', 'Les Charmes-Dessus',
  'Les Charmes-Dessous', 'La Pièce sous le Bois', 'Les Narvaux', 'Les Tillets', 'Les Clous', 'Les Chevalières',
  'Les Luchets', 'Les Vireuils', 'Le Limozin', 'Les Rougeots', 'Clos de la Barre', 'Les Tessons', 'Les Meix Chavaux',
  'Les Pucelles', 'Les Combettes', 'Les Folatières', 'Le Cailleret', 'Les Champs Gain', 'Les Referts', 'Les Demoiselles',
  'Clos de la Garenne', 'Champ Canet', 'La Truffière', 'Sous le Puits', 'Les Chalumaux', 'Les Enseignères', 'Clos de la Mouchère',
  'La Romanée', 'Les Ruchottes', 'Les Chenevottes', 'Morgeot', 'Les Vergers', 'La Maltroie', 'Les Embrazées',
  'En Remilly', 'Les Murgers des Dents de Chien', 'Les Chaumées', 'La Grande Montagne', 'Clos Saint-Jean', 'Les Baudines',
  'Les Charmois', 'En Rémilly', 'Le Charmois', 'Les Frionnes', 'La Chatenière', 'Les Cortons', 'Sur Gamay',
  'Clos de Tavannes', 'Les Gravières', 'Beaurepaire', 'La Comme', 'En Caradeux', 'Les Hauts Jarrons',
  // Côte Chalonnaise / Mâconnais
  'Clos du Roy', 'Clos des Myglands', 'Clos Marcilly', 'Les Grésigny', 'Clos Salomon', 'Clos Jus', 'Les Chênes',
  'Vergisson', 'Solutré', 'Chaintré', 'Fuissé', 'Les Crays', 'Le Clos Reyssier', 'Les Ménétrières', 'Vers Cras',
];

// Beaujolais crus (part of greater Burgundy).
const BEAUJOLAIS = [
  'Beaujolais', 'Beaujolais-Villages', 'Moulin-à-Vent', 'Morgon', 'Fleurie', 'Chiroubles', 'Juliénas', 'Saint-Amour',
  'Chénas', 'Brouilly', 'Côte de Brouilly', 'Régnié', 'Côte du Py',
];

// Producers people most often name (the grand names of Burgundy).
const PRODUCERS = [
  'Domaine de la Romanée-Conti', 'Leroy', 'Domaine d\'Auvenay', 'Armand Rousseau', 'Georges Roumier', 'Comte Georges de Vogüé',
  'Jacques-Frédéric Mugnier', 'Dujac', 'Ponsot', 'Comte Liger-Belair', 'Méo-Camuzet', 'Henri Jayer', 'Emmanuel Rouget',
  'Sylvain Cathiard', 'Arnoux-Lachaux', 'Jean Grivot', 'Anne Gros', 'Michel Gros', 'Gros Frère et Sœur', 'Hudelot-Noëllat',
  'Bruno Clair', 'Denis Mortet', 'Fourrier', 'Claude Dugat', 'Bernard Dugat-Py', 'Trapet', 'Rossignol-Trapet', 'Joseph Drouhin',
  'Louis Jadot', 'Faiveley', 'Bouchard Père et Fils', 'Louis Latour', 'Albert Bichot', 'Lucien Le Moine', 'Benjamin Leroux',
  'Coche-Dury', 'Comtes Lafon', 'Roulot', 'Pierre-Yves Colin-Morey', 'Marc Colin', 'Ramonet', 'Michel Niellon', 'Paul Pillot',
  'Jean-Noël Gagnard', 'Bernard Moreau', 'Domaine Leflaive', 'Olivier Leflaive', 'Étienne Sauzet', 'Bonneau du Martray',
  'Simon Bize', 'Chandon de Briailles', 'Tollot-Beaut', 'Marquis d\'Angerville', 'Michel Lafarge', 'Hubert de Montille',
  'Domaine de Montille', 'Comte Armand', 'Joseph Voillot', 'Jean-Marc Roulot', 'Guy Roulot', 'Raveneau', 'Vincent Dauvissat',
  'William Fèvre', 'Billaud-Simon', 'Christian Moreau', 'Domaine Laroche', 'Samuel Billaud', 'Patrick Piuze',
  'Robert Chevillon', 'Henri Gouges', 'Prieuré Roch', 'Chevillon', 'Lamy-Caillat', 'Hubert Lamy', 'Domaine Lamy',
  'Philippe Pacalet', 'Cécile Tremblay', 'Domaine Bizot', 'René Engel', 'Clos de Tart', 'Clos des Lambrays',
  'Ghislaine Barthod', 'Georges Mugneret-Gibourg', 'Mongeard-Mugneret', 'Confuron-Cotetidot', 'Jean-Jacques Confuron',
  'Domaine des Lambrays', 'Domaine Thibault Liger-Belair', 'Lafon', 'Comte Senard', 'Follin-Arbelet', 'Pierre Damoy',
  'Perrot-Minot', 'Château de la Tour', 'Chanson', 'Joseph Faiveley', 'Vincent Girardin', 'Domaine Roumier', 'Jean-Marie Fourrier',
];

export const BURGUNDY_NAMES: string[] = Array.from(new Set([
  ...REGIONAL, ...VILLAGES, ...GRAND_CRUS, ...PREMIER_CRUS, ...BEAUJOLAIS, ...PRODUCERS,
]));
