// Bordeaux classified-growth lookup.
//
// Classified Bordeaux châteaux rarely print their classification (or even the
// appellation) on the label, so an identified wine can be missing both. For
// these estates the classification IS effectively the wine's name ("Château
// Batailley 5ème Cru Classé"), and the appellation is fixed, so we fill both in
// when they're blank — on EVERY path that builds a wine identity, not just a
// fresh scan (see withBordeauxInfo).
//
// Coverage: the STABLE historical classifications — the 1855 Médoc (61 growths,
// unchanged since Mouton's 1973 promotion), the 1855 Sauternes & Barsac, and the
// Graves / Pessac-Léognan Crus Classés (1959). Saint-Émilion is deliberately
// excluded (its list is revised roughly every decade). Extend as needed.

// Numeric French classification labels (per the user's house style).
const P1 = '1er Cru Classé';
const P2 = '2ème Cru Classé';
const P3 = '3ème Cru Classé';
const P4 = '4ème Cru Classé';
const P5 = '5ème Cru Classé';
const GRAVES = 'Cru Classé de Graves';
const S_SUP = '1er Cru Supérieur';
const S1 = '1er Cru';
const S2 = '2ème Cru';

// Appellations.
const PAU = 'Pauillac, Bordeaux';
const MAR = 'Margaux, Bordeaux';
const STJ = 'Saint-Julien, Bordeaux';
const STE = 'Saint-Estèphe, Bordeaux';
const HM = 'Haut-Médoc, Bordeaux';
const PL = 'Pessac-Léognan, Bordeaux';
const SAU = 'Sauternes, Bordeaux';
const BAR = 'Barsac, Bordeaux';

// Canonical château → [classification, appellation]. Keys are matched after
// normBdx() (accent- and "château"-insensitive), so "Château Léoville Barton"
// and "Leoville Barton" both resolve.
const RAW: Record<string, [string, string]> = {
  // --- 1855 Médoc — Premiers Crus ---
  'Lafite Rothschild': [P1, PAU], 'Latour': [P1, PAU], 'Margaux': [P1, MAR], 'Haut-Brion': [P1, PL], 'Mouton Rothschild': [P1, PAU],
  // --- Deuxièmes ---
  'Rauzan-Ségla': [P2, MAR], 'Rauzan-Gassies': [P2, MAR], 'Léoville Las Cases': [P2, STJ], 'Léoville Poyferré': [P2, STJ],
  'Léoville Barton': [P2, STJ], 'Durfort-Vivens': [P2, MAR], 'Gruaud Larose': [P2, STJ], 'Lascombes': [P2, MAR],
  'Brane-Cantenac': [P2, MAR], 'Pichon Longueville Baron': [P2, PAU], 'Pichon Baron': [P2, PAU],
  'Pichon Longueville Comtesse de Lalande': [P2, PAU], 'Ducru-Beaucaillou': [P2, STJ], "Cos d'Estournel": [P2, STE], 'Montrose': [P2, STE],
  // --- Troisièmes ---
  'Kirwan': [P3, MAR], "d'Issan": [P3, MAR], 'Lagrange': [P3, STJ], 'Langoa Barton': [P3, STJ], 'Giscours': [P3, MAR],
  'Malescot St-Exupéry': [P3, MAR], 'Boyd-Cantenac': [P3, MAR], 'Cantenac Brown': [P3, MAR], 'Palmer': [P3, MAR], 'La Lagune': [P3, HM],
  'Desmirail': [P3, MAR], 'Calon-Ségur': [P3, STE], 'Ferrière': [P3, MAR], "Marquis d'Alesme Becker": [P3, MAR],
  // --- Quatrièmes ---
  'Saint-Pierre': [P4, STJ], 'Talbot': [P4, STJ], 'Branaire-Ducru': [P4, STJ], 'Duhart-Milon': [P4, PAU], 'Pouget': [P4, MAR],
  'La Tour Carnet': [P4, HM], 'Lafon-Rochet': [P4, STE], 'Beychevelle': [P4, STJ], 'Prieuré-Lichine': [P4, MAR], 'Marquis de Terme': [P4, MAR],
  // --- Cinquièmes ---
  'Pontet-Canet': [P5, PAU], 'Batailley': [P5, PAU], 'Haut-Batailley': [P5, PAU], 'Grand-Puy-Lacoste': [P5, PAU], 'Grand-Puy-Ducasse': [P5, PAU],
  'Lynch-Bages': [P5, PAU], 'Lynch-Moussas': [P5, PAU], 'Dauzac': [P5, MAR], "d'Armailhac": [P5, PAU], 'du Tertre': [P5, MAR],
  'Haut-Bages Libéral': [P5, PAU], 'Pédesclaux': [P5, PAU], 'Belgrave': [P5, HM], 'de Camensac': [P5, HM], 'Cos Labory': [P5, STE],
  'Clerc Milon': [P5, PAU], 'Croizet-Bages': [P5, PAU], 'Cantemerle': [P5, HM],
  // --- 1855 Sauternes & Barsac ---
  "d'Yquem": [S_SUP, SAU],
  'La Tour Blanche': [S1, SAU], 'Lafaurie-Peyraguey': [S1, SAU], 'Clos Haut-Peyraguey': [S1, SAU], 'de Rayne Vigneau': [S1, SAU],
  'Suduiraut': [S1, SAU], 'Coutet': [S1, BAR], 'Climens': [S1, BAR], 'Guiraud': [S1, SAU], 'Rieussec': [S1, SAU], 'Rabaud-Promis': [S1, SAU],
  'Sigalas Rabaud': [S1, SAU],
  'de Myrat': [S2, BAR], 'Doisy Daëne': [S2, BAR], 'Doisy-Dubroca': [S2, BAR], 'Doisy-Védrines': [S2, BAR], "d'Arche": [S2, SAU],
  'Filhot': [S2, SAU], 'Broustet': [S2, BAR], 'Nairac': [S2, BAR], 'Caillou': [S2, BAR], 'Suau': [S2, BAR], 'de Malle': [S2, SAU],
  'Romer du Hayot': [S2, SAU], 'Lamothe': [S2, SAU], 'Lamothe-Guignard': [S2, SAU],
  // --- Graves / Pessac-Léognan Crus Classés (1959) ---
  'Bouscaut': [GRAVES, PL], 'Carbonnieux': [GRAVES, PL], 'Domaine de Chevalier': [GRAVES, PL], 'de Fieuzal': [GRAVES, PL],
  'Haut-Bailly': [GRAVES, PL], 'Latour-Martillac': [GRAVES, PL], 'Malartic-Lagravière': [GRAVES, PL],
  'La Mission Haut-Brion': [GRAVES, PL], 'Olivier': [GRAVES, PL], 'Pape Clément': [GRAVES, PL], 'Smith Haut Lafitte': [GRAVES, PL],
  'La Tour Haut-Brion': [GRAVES, PL], 'Couhins': [GRAVES, PL], 'Couhins-Lurton': [GRAVES, PL],
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

const BY_KEY: Record<string, { classification: string; appellation: string }> = {};
for (const [name, [c, a]] of Object.entries(RAW)) BY_KEY[normBdx(name)] = { classification: c, appellation: a };

// Classification + appellation for a Bordeaux château, or null if unknown.
export function bordeauxInfoFor(producer: string | null | undefined): { classification: string; appellation: string } | null {
  const key = normBdx(producer);
  if (!key) return null;
  return BY_KEY[key] ?? null;
}

// Back-compat: classification only.
export function bordeauxGrowthFor(producer: string | null | undefined): string | null {
  return bordeauxInfoFor(producer)?.classification ?? null;
}

// Fill in the classification (as the wine name) and the appellation (as the
// region) for a known classified Bordeaux château, WITHOUT overwriting a genuine
// cuvée name or an already-known region. Generic over any identity shape that
// carries producer / wineName / region, so it runs on every intel path.
export function withBordeauxInfo<T extends { producer?: string | null; wineName?: string | null; region?: string | null }>(d: T): T {
  const info = bordeauxInfoFor(d.producer);
  if (!info) return d;
  const name = (d.wineName ?? '').trim();
  const nameIsJustProducer = !name || normBdx(name) === normBdx(d.producer);
  const region = (d.region ?? '').trim();
  return {
    ...d,
    wineName: nameIsJustProducer ? info.classification : d.wineName,
    region: region || info.appellation,
  };
}
