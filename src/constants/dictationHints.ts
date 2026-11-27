// Well-known producers, wines and appellations that phone speech-to-text tends
// to turn into English words ("Beaucastel" → "Broadcast"). Passed to the
// recogniser as hints after the user's own cellar names, so a wine they don't
// own is still more likely to be heard right. All real names; spelled as on
// the label.
export const FAMOUS_WINE_HINTS: string[] = [
  // Rhône
  'Beaucastel', 'Château de Beaucastel', 'Châteauneuf-du-Pape', 'Vieux Télégraphe', 'Gigondas', 'Vacqueyras',
  'Côte-Rôtie', 'Condrieu', 'Hermitage', 'Crozes-Hermitage', 'Cornas', 'Saint-Joseph', 'Guigal', 'Chapoutier',
  'Jaboulet', 'Chave', 'Clape', 'Jamet', 'Château Rayas', 'Pégau',
  // Burgundy & Beaujolais
  'Gevrey-Chambertin', 'Chambolle-Musigny', 'Vosne-Romanée', 'Nuits-Saint-Georges', 'Clos de Vougeot', 'Meursault',
  'Puligny-Montrachet', 'Chassagne-Montrachet', 'Corton-Charlemagne', 'Montrachet', 'Pommard', 'Volnay', 'Chablis',
  'Pouilly-Fuissé', 'Romanée-Conti', 'Leflaive', 'Roulot', 'Coche-Dury', 'Armand Rousseau', 'Dujac', 'Roumier',
  'Mugnier', 'Morgon', 'Fleurie', 'Moulin-à-Vent',
  // Bordeaux
  'Pauillac', 'Margaux', 'Saint-Julien', 'Saint-Estèphe', 'Pessac-Léognan', 'Saint-Émilion', 'Pomerol', 'Sauternes',
  'Lafite Rothschild', 'Mouton Rothschild', 'Haut-Brion', 'Cheval Blanc', 'Pétrus', 'Ausone', 'Angélus',
  'Léoville Las Cases', 'Pichon Baron', 'Pichon Comtesse', "Cos d'Estournel", 'Ducru-Beaucaillou', 'Lynch-Bages',
  'Pontet-Canet', 'Palmer', "d'Yquem", 'Roc de Cambes', 'Carruades de Lafite',
  // Loire, Alsace, Champagne
  'Sancerre', 'Pouilly-Fumé', 'Vouvray', 'Savennières', 'Chinon', 'Muscadet', 'Huet', 'Dagueneau',
  'Gewurztraminer', 'Trimbach', 'Zind-Humbrecht', 'Krug', 'Bollinger', 'Taittinger', 'Veuve Clicquot',
  'Moët & Chandon', 'Dom Pérignon', 'Ruinart', 'Billecart-Salmon', 'Pol Roger', 'Louis Roederer', 'Charles Heidsieck',
  // Italy
  'Barolo', 'Barbaresco', 'Brunello di Montalcino', 'Sassicaia', 'Tignanello', 'Ornellaia', 'Solaia', 'Gaja',
  'Giacomo Conterno', 'Amarone', 'Valpolicella', 'Chianti Classico', "Montepulciano d'Abruzzo", 'Prosecco', 'Etna Rosso',
  // Spain & Portugal
  'Rioja', 'Ribera del Duero', 'Vega Sicilia', 'Pingus', 'Priorat', 'Albariño', 'Tempranillo', 'López de Heredia',
  "Taylor's", "Graham's", 'Quinta do Noval', 'Madeira',
  // Germany & Austria
  'Riesling', 'Grüner Veltliner', 'Mosel', 'Egon Müller', 'Spätlese', 'Auslese',
  // New World
  'Penfolds Grange', 'Henschke', 'Torbreck', 'Cloudy Bay', 'Felton Road', 'Opus One', 'Caymus', 'Ridge Monte Bello',
  'Screaming Eagle', 'Harlan Estate', 'Catena Zapata', 'Almaviva', 'Concha y Toro', 'Sadie Family', 'Mullineux',
  'Kanonkop', 'Château Musar', 'Tokaji',
];
