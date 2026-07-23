import { inferCountry } from './wineCountry';

// Roll a free-text region string up to an industry-standard WINE REGION, so a
// cellar's "Most Represented Regions" groups by region (Loire Valley, Bordeaux)
// rather than by hyper-specific appellation (Sancerre, St-Julien, Savennières).
//
// Each canonical region lists keywords found in a region/appellation string.
// First match wins, so keep keywords specific enough not to collide across
// regions. Falls back to the country (via inferCountry) when only a country is
// identifiable, and finally to the raw string so nothing is silently dropped.

const REGION_GROUPS: { canonical: string; keys: string[] }[] = [
  // --- France ---
  { canonical: 'Bordeaux', keys: ['bordeaux', 'médoc', 'medoc', 'margaux', 'pauillac', 'saint-julien', 'st-julien', 'st julien', 'saint julien', 'saint-estèphe', 'st-estephe', 'saint estephe', 'pessac', 'léognan', 'leognan', 'graves', 'pomerol', 'saint-émilion', 'saint emilion', 'st-emilion', 'st emilion', 'sauternes', 'barsac', 'listrac', 'moulis', 'fronsac', 'entre-deux-mers', 'blaye', 'côtes de bourg', 'cotes de bourg'] },
  { canonical: 'Burgundy', keys: ['burgundy', 'bourgogne', 'chablis', 'côte de nuits', 'cote de nuits', 'côte de beaune', 'cote de beaune', 'gevrey', 'chambertin', 'vosne', 'romanée', 'romanee', 'nuits-saint-georges', 'nuits st', 'meursault', 'puligny', 'chassagne', 'montrachet', 'pommard', 'volnay', 'mâcon', 'macon', 'pouilly-fuissé', 'pouilly-fuisse', 'chambolle', 'morey', 'mercurey', 'givry', 'rully', 'santenay', 'aloxe', 'corton', 'beaune', 'marsannay', 'fixin', 'chalonnaise'] },
  { canonical: 'Loire Valley', keys: ['loire', 'sancerre', 'pouilly-fumé', 'pouilly-fume', 'pouilly fume', 'savennières', 'savennieres', 'vouvray', 'chinon', 'bourgueil', 'muscadet', 'saumur', 'anjou', 'quincy', 'menetou', 'montlouis', 'touraine', 'reuilly', 'cheverny', 'layon', 'jasnières', 'jasnieres'] },
  { canonical: 'Rhône', keys: ['rhône', 'rhone', 'châteauneuf', 'chateauneuf', 'côte-rôtie', 'cote-rotie', 'cote rotie', 'hermitage', 'crozes', 'cornas', 'condrieu', 'saint-joseph', 'st-joseph', 'gigondas', 'vacqueyras', 'tavel', 'lirac', 'rasteau', 'vinsobres', 'beaumes-de-venise'] },
  { canonical: 'Champagne', keys: ['champagne'] },
  { canonical: 'Alsace', keys: ['alsace'] },
  { canonical: 'Beaujolais', keys: ['beaujolais', 'morgon', 'fleurie', 'moulin-à-vent', 'moulin-a-vent', 'brouilly', 'juliénas', 'julienas', 'chénas', 'chenas', 'chiroubles', 'régnié', 'regnie', 'saint-amour'] },
  { canonical: 'Provence', keys: ['provence', 'bandol', 'cassis', 'bellet'] },
  { canonical: 'Languedoc-Roussillon', keys: ['languedoc', 'roussillon', 'corbières', 'corbieres', 'minervois', 'faugères', 'faugeres', 'picpoul', 'fitou', 'saint-chinian', 'pic saint-loup', 'maury', 'banyuls', 'collioure', 'limoux', 'terrasses du larzac'] },
  { canonical: 'Jura', keys: ['jura', 'arbois', 'château-chalon', 'chateau-chalon', 'étoile'] },
  { canonical: 'South West France', keys: ['cahors', 'madiran', 'jurançon', 'jurancon', 'gaillac', 'bergerac', 'monbazillac', 'irouléguy', 'irouleguy', 'fronton'] },
  // --- Italy ---
  { canonical: 'Tuscany', keys: ['tuscany', 'toscana', 'chianti', 'brunello', 'montalcino', 'bolgheri', 'morellino', 'carmignano', 'maremma', 'vino nobile'] },
  { canonical: 'Piedmont', keys: ['piedmont', 'piemonte', 'barolo', 'barbaresco', 'barbera', 'dolcetto', 'gavi', 'roero', 'langhe', 'asti', 'ghemme', 'gattinara'] },
  { canonical: 'Veneto', keys: ['veneto', 'amarone', 'valpolicella', 'soave', 'prosecco', 'bardolino', 'ripasso', 'recioto'] },
  { canonical: 'Sicily', keys: ['sicily', 'sicilia', 'etna', 'marsala'] },
  { canonical: 'Friuli', keys: ['friuli', 'collio'] },
  { canonical: 'Alto Adige', keys: ['alto adige', 'südtirol', 'sudtirol', 'trentino'] },
  { canonical: 'Abruzzo', keys: ['abruzzo'] },
  { canonical: 'Campania', keys: ['campania', 'taurasi', 'fiano', 'greco di tufo', 'aglianico'] },
  { canonical: 'Lombardy', keys: ['franciacorta', 'lombardia', 'lombardy', 'valtellina'] },
  { canonical: 'Umbria', keys: ['umbria', 'montefalco', 'orvieto', 'sagrantino'] },
  // --- Spain ---
  { canonical: 'Rioja', keys: ['rioja'] },
  { canonical: 'Ribera del Duero', keys: ['ribera del duero'] },
  { canonical: 'Priorat', keys: ['priorat'] },
  { canonical: 'Rías Baixas', keys: ['rías baixas', 'rias baixas', 'albariño', 'albarino'] },
  { canonical: 'Jerez', keys: ['jerez', 'sherry', 'manzanilla'] },
  { canonical: 'Penedès', keys: ['penedès', 'penedes', 'cava'] },
  { canonical: 'Toro', keys: ['toro'] },
  { canonical: 'Bierzo', keys: ['bierzo'] },
  // --- Portugal ---
  { canonical: 'Douro', keys: ['douro', 'porto'] },
  { canonical: 'Madeira', keys: ['madeira'] },
  { canonical: 'Dão', keys: ['dão', 'dao'] },
  { canonical: 'Alentejo', keys: ['alentejo'] },
  { canonical: 'Vinho Verde', keys: ['vinho verde'] },
  // --- Germany ---
  { canonical: 'Mosel', keys: ['mosel', 'saar', 'ruwer'] },
  { canonical: 'Rheingau', keys: ['rheingau'] },
  { canonical: 'Rheinhessen', keys: ['rheinhessen'] },
  { canonical: 'Pfalz', keys: ['pfalz'] },
  { canonical: 'Nahe', keys: ['nahe'] },
  { canonical: 'Baden', keys: ['baden'] },
  { canonical: 'Franken', keys: ['franken'] },
  { canonical: 'Württemberg', keys: ['württemberg', 'wurttemberg'] },
  // --- Austria ---
  { canonical: 'Wachau', keys: ['wachau'] },
  { canonical: 'Kamptal', keys: ['kamptal', 'kremstal'] },
  { canonical: 'Burgenland', keys: ['burgenland'] },
  // --- USA ---
  { canonical: 'Napa Valley', keys: ['napa'] },
  { canonical: 'Sonoma', keys: ['sonoma', 'russian river', 'alexander valley', 'dry creek'] },
  { canonical: 'Oregon', keys: ['oregon', 'willamette'] },
  { canonical: 'Washington', keys: ['washington', 'columbia valley', 'walla walla', 'red mountain'] },
  { canonical: 'Central Coast', keys: ['paso robles', 'santa barbara', 'sta. rita', 'santa maria', 'central coast', 'edna valley', 'santa rita hills'] },
  { canonical: 'Finger Lakes', keys: ['finger lakes'] },
  // --- Australia ---
  { canonical: 'Barossa Valley', keys: ['barossa'] },
  { canonical: 'McLaren Vale', keys: ['mclaren'] },
  { canonical: 'Margaret River', keys: ['margaret river'] },
  { canonical: 'Yarra Valley', keys: ['yarra'] },
  { canonical: 'Coonawarra', keys: ['coonawarra'] },
  { canonical: 'Clare Valley', keys: ['clare valley'] },
  { canonical: 'Eden Valley', keys: ['eden valley'] },
  { canonical: 'Hunter Valley', keys: ['hunter valley'] },
  { canonical: 'Tasmania', keys: ['tasmania'] },
  // --- New Zealand ---
  { canonical: 'Marlborough', keys: ['marlborough'] },
  { canonical: 'Central Otago', keys: ['central otago'] },
  { canonical: "Hawke's Bay", keys: ['hawke'] },
  // --- Other ---
  { canonical: 'Tokaj', keys: ['tokaj'] },
  { canonical: 'Santorini', keys: ['santorini'] },
  { canonical: 'Stellenbosch', keys: ['stellenbosch'] },
  { canonical: 'Mendoza', keys: ['mendoza', 'uco valley'] },
  { canonical: 'Maipo', keys: ['maipo', 'colchagua', 'casablanca'] },
];

export function canonicalWineRegion(region: string | null | undefined): string | null {
  const text = (region ?? '').toLowerCase().trim();
  if (!text) return null;
  for (const g of REGION_GROUPS) {
    for (const k of g.keys) {
      if (text.includes(k)) return g.canonical;
    }
  }
  // No known region matched — group by country if we can, else keep the raw
  // string (trimmed) so it still shows rather than being dropped.
  return inferCountry(region) ?? ((region ?? '').trim() || null);
}

function keysFor(canonical: string): string[] {
  return REGION_GROUPS.find((g) => g.canonical === canonical)?.keys ?? [];
}
function includesAny(text: string, keys: string[]): boolean {
  return keys.some((k) => text.includes(k));
}

// BASE grouping — the default level for the "Most Represented Regions" tally:
// everything is grouped by COUNTRY, except France and Italy which split into
// their headline regions (all other French/Italian wines fall to "Regional
// France" / "Regional Italy").
export function baseRegionGroup(region: string | null | undefined): string | null {
  const text = (region ?? '').toLowerCase().trim();
  if (!text) return null;
  // French headline regions (checked directly — broader than inferCountry hints).
  if (includesAny(text, keysFor('Bordeaux'))) return 'Bordeaux';
  if (includesAny(text, keysFor('Burgundy'))) return 'Burgundy';
  if (includesAny(text, keysFor('Champagne'))) return 'Champagne';
  if (includesAny(text, keysFor('Rhône'))) return 'Rhône Valley';
  if (includesAny(text, keysFor('Loire Valley'))) return 'Loire Valley';
  if (includesAny(text, keysFor('Jura'))) return 'Jura';
  // Italian headline regions.
  if (includesAny(text, keysFor('Piedmont'))) return 'Piedmont';
  if (includesAny(text, keysFor('Sicily'))) return 'Sicily';
  if (includesAny(text, keysFor('Tuscany'))) return 'Tuscany';
  // Everything else groups by country; other French/Italian wines are "Regional".
  const country = inferCountry(region);
  if (country === 'France') return 'Regional France';
  if (country === 'Italy') return 'Regional Italy';
  if (country) return country;
  return (region ?? '').trim() || null;
}

// "Most Represented Regions" with ADAPTIVE granularity: group to the base level,
// then, for any group the collector clearly has depth in (>= threshold bottles
// AND it genuinely splits into 2+ sub-regions), show its finer wine sub-regions
// instead — so a German-heavy cellar surfaces Mosel / Rheingau / Pfalz, while a
// broad cellar stays at country / headline-region level.
export function topRegionsAdaptive(
  wines: { region: string | null; quantity: number | null }[],
  topN: number,
): [string, number][] {
  const base = new Map<string, { region: string | null; quantity: number | null }[]>();
  let total = 0;
  for (const w of wines) {
    const g = baseRegionGroup(w.region);
    if (!g) continue;
    let arr = base.get(g);
    if (!arr) { arr = []; base.set(g, arr); }
    arr.push(w);
    total += w.quantity ?? 0;
  }
  // A group must hold a real share of the cellar to warrant subdividing.
  const threshold = Math.max(6, Math.ceil(total * 0.2));
  const counts: Record<string, number> = {};
  for (const [g, ws] of base) {
    const gCount = ws.reduce((s, w) => s + (w.quantity ?? 0), 0);
    const fine = new Map<string, number>();
    for (const w of ws) {
      const f = canonicalWineRegion(w.region) ?? g;
      fine.set(f, (fine.get(f) ?? 0) + (w.quantity ?? 0));
    }
    if (gCount >= threshold && fine.size >= 2) {
      for (const [f, c] of fine) counts[f] = (counts[f] ?? 0) + c;
    } else {
      counts[g] = (counts[g] ?? 0) + gCount;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, topN);
}
