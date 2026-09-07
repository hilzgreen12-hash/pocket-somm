// Bordeaux classified-growth lookup.
//
// Classified Bordeaux châteaux rarely print their classification on the label,
// so a scan returns the château name with an EMPTY cuvée/wine name. For these
// estates the classification IS effectively the wine's name ("Château Batailley
// Cinquième Cru Classé"), so we fill it in when the scan left it blank.
//
// Coverage: the STABLE historical classifications — the 1855 Médoc (61 growths,
// unchanged since Mouton's 1973 promotion), the 1855 Sauternes & Barsac, and the
// Graves / Pessac-Léognan Crus Classés (1959). Saint-Émilion is deliberately
// excluded here (its list is revised roughly every decade). Extend as needed.

const P1 = 'Premier Cru Classé';
const P2 = 'Deuxième Cru Classé';
const P3 = 'Troisième Cru Classé';
const P4 = 'Quatrième Cru Classé';
const P5 = 'Cinquième Cru Classé';
const GRAVES = 'Cru Classé de Graves';
const S_SUP = 'Premier Cru Supérieur';
const S1 = 'Premier Cru';
const S2 = 'Deuxième Cru';

// Canonical château → classification. Keys are matched after normBdx() (accent-
// and "château"-insensitive), so spellings like "Château Léoville Barton" and
// "Leoville Barton" both resolve.
const RAW: Record<string, string> = {
  // --- 1855 Médoc — Premiers Crus ---
  'Lafite Rothschild': P1, 'Latour': P1, 'Margaux': P1, 'Haut-Brion': P1, 'Mouton Rothschild': P1,
  // --- Deuxièmes ---
  'Rauzan-Ségla': P2, 'Rauzan-Gassies': P2, 'Léoville Las Cases': P2, 'Léoville Poyferré': P2,
  'Léoville Barton': P2, 'Durfort-Vivens': P2, 'Gruaud Larose': P2, 'Lascombes': P2,
  'Brane-Cantenac': P2, 'Pichon Longueville Baron': P2, 'Pichon Baron': P2,
  'Pichon Longueville Comtesse de Lalande': P2, 'Ducru-Beaucaillou': P2, "Cos d'Estournel": P2, 'Montrose': P2,
  // --- Troisièmes ---
  'Kirwan': P3, "d'Issan": P3, 'Lagrange': P3, 'Langoa Barton': P3, 'Giscours': P3,
  'Malescot St-Exupéry': P3, 'Boyd-Cantenac': P3, 'Cantenac Brown': P3, 'Palmer': P3, 'La Lagune': P3,
  'Desmirail': P3, 'Calon-Ségur': P3, 'Ferrière': P3, "Marquis d'Alesme Becker": P3,
  // --- Quatrièmes ---
  'Saint-Pierre': P4, 'Talbot': P4, 'Branaire-Ducru': P4, 'Duhart-Milon': P4, 'Pouget': P4,
  'La Tour Carnet': P4, 'Lafon-Rochet': P4, 'Beychevelle': P4, 'Prieuré-Lichine': P4, 'Marquis de Terme': P4,
  // --- Cinquièmes ---
  'Pontet-Canet': P5, 'Batailley': P5, 'Haut-Batailley': P5, 'Grand-Puy-Lacoste': P5, 'Grand-Puy-Ducasse': P5,
  'Lynch-Bages': P5, 'Lynch-Moussas': P5, 'Dauzac': P5, "d'Armailhac": P5, 'du Tertre': P5,
  'Haut-Bages Libéral': P5, 'Pédesclaux': P5, 'Belgrave': P5, 'de Camensac': P5, 'Cos Labory': P5,
  'Clerc Milon': P5, 'Croizet-Bages': P5, 'Cantemerle': P5,
  // --- 1855 Sauternes & Barsac ---
  "d'Yquem": S_SUP,
  'La Tour Blanche': S1, 'Lafaurie-Peyraguey': S1, 'Clos Haut-Peyraguey': S1, 'de Rayne Vigneau': S1,
  'Suduiraut': S1, 'Coutet': S1, 'Climens': S1, 'Guiraud': S1, 'Rieussec': S1, 'Rabaud-Promis': S1,
  'Sigalas Rabaud': S1,
  'de Myrat': S2, 'Doisy Daëne': S2, 'Doisy-Dubroca': S2, 'Doisy-Védrines': S2, "d'Arche": S2,
  'Filhot': S2, 'Broustet': S2, 'Nairac': S2, 'Caillou': S2, 'Suau': S2, 'de Malle': S2,
  'Romer du Hayot': S2, 'Lamothe': S2, 'Lamothe-Guignard': S2,
  // --- Graves / Pessac-Léognan Crus Classés (1959) ---
  'Bouscaut': GRAVES, 'Carbonnieux': GRAVES, 'Domaine de Chevalier': GRAVES, 'de Fieuzal': GRAVES,
  'Haut-Bailly': GRAVES, 'Latour-Martillac': GRAVES, 'Malartic-Lagravière': GRAVES,
  'La Mission Haut-Brion': GRAVES, 'Olivier': GRAVES, 'Pape Clément': GRAVES, 'Smith Haut Lafitte': GRAVES,
  'La Tour Haut-Brion': GRAVES, 'Couhins': GRAVES, 'Couhins-Lurton': GRAVES,
};

function normBdx(s: string | null | undefined): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\bchateau\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const BY_KEY: Record<string, string> = {};
for (const [name, cls] of Object.entries(RAW)) BY_KEY[normBdx(name)] = cls;

// The classification for a Bordeaux château, or null if it isn't a classified
// growth we know. Only meaningful when the scan left the wine name blank.
export function bordeauxGrowthFor(producer: string | null | undefined): string | null {
  const key = normBdx(producer);
  if (!key) return null;
  return BY_KEY[key] ?? null;
}
