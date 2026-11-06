import type { CellarWine } from '../types/wine';
import type { VintageComparisonRow } from '../services/pricing';
import { effectiveMaturity } from './maturity';
import { inferWineStyle } from './wineStyle';

// Small, data-only insights for the wine card — computed on the phone from data
// the app already has (no extra AI call).

export type VintageVerdict = {
  rows: (VintageComparisonRow & { ppt: number | null })[];
  bestValueVintage: number | null;
  topScoreVintage: number | null; // highest critic score in the run
  qualityRank: number | null; // this vintage's rank by critic score (1 = best)
  valueRank: number | null; // this vintage's rank by price per point (1 = best value)
  total: number;
  text: string | null;
};

// Price-per-point for each vintage, the best-value year, and where the user's own
// vintage ranks for quality and value — plus a short plain-English rundown.
export function vintageVerdict(rows: VintageComparisonRow[], thisVintage: string | number | null | undefined, fmt: (n: number) => string): VintageVerdict {
  const withPpt = rows.map((r) => ({ ...r, ppt: r.price != null && r.score ? r.price / r.score : null }));
  const scored = withPpt.filter((r) => r.ppt != null);
  const empty: VintageVerdict = { rows: withPpt, bestValueVintage: null, topScoreVintage: null, qualityRank: null, valueRank: null, total: scored.length, text: null };
  if (scored.length < 2) return empty;
  const best = scored.reduce((a, b) => ((b.ppt as number) < (a.ppt as number) ? b : a));
  const top = scored.reduce((a, b) => ((b.score as number) > (a.score as number) ? b : a));
  const mine = scored.find((r) => String(r.vintage) === String(thisVintage ?? '').trim());
  const n = scored.length;
  const qualityRank = mine ? 1 + scored.filter((r) => (r.score as number) > (mine.score as number)).length : null;
  const valueRank = mine ? 1 + scored.filter((r) => (r.ppt as number) < (mine.ppt as number)).length : null;
  const bestLine = `${best.score} points at ${fmt(best.price as number)}, the lowest price per point in the run`;
  let text: string;
  if (mine && mine.vintage === best.vintage) {
    text = `Your ${mine.vintage} is the best value here — ${bestLine}.`;
    if (qualityRank === 1) text += ' It is also the top-scoring vintage, so you have the best of both.';
  } else {
    text = `The ${best.vintage} is the best value — ${bestLine}.`;
    if (mine && qualityRank != null && valueRank != null) {
      text += ` Your ${mine.vintage} ranks #${qualityRank} of ${n} for quality and #${valueRank} of ${n} for value.`;
      if (qualityRank === 1) text += ' It is the top-scoring year, so the premium buys you the best vintage.';
      else if (valueRank === n) text += ' It carries the biggest premium per point in this run.';
    } else if (!mine && top.vintage !== best.vintage) {
      // No vintage chosen yet (comparing before picking one).
      text += ` The ${top.vintage} is the top-scoring year (${top.score}) and carries a premium for it.`;
    }
  }
  return { rows: withPpt, bestValueVintage: best.vintage, topScoreVintage: top.vintage, qualityRank, valueRank, total: n, text };
}

// Wine styles / names a "Drink Before" or "Drink After" suggestion may name.
const STYLE_WORDS = [
  'champagne', 'sparkling', 'cava', 'cremant', 'franciacorta', 'sekt', 'blanc de blancs',
  'riesling', 'chablis', 'sancerre', 'sauvignon', 'chenin', 'vouvray', 'muscadet', 'albarino', 'gruner',
  'sherry', 'fino', 'manzanilla', 'amontillado', 'oloroso', 'palo cortado', 'port', 'tawny', 'madeira',
  'marsala', 'sauternes', 'barsac', 'tokaji', 'muscat', 'moscato', 'eiswein', 'ice wine', 'vin santo',
  'pedro ximenez', 'cognac', 'armagnac', 'calvados', 'whisky', 'whiskey', 'brandy', 'grappa', 'rose',
  'beaujolais', 'pinot noir', 'burgundy', 'bourgogne', 'gewurztraminer', 'pinot gris', 'vermentino',
  'assyrtiko', 'txakoli', 'lambrusco', 'chardonnay', 'aligote', 'gin', 'vermouth',
];
const fold = (s: string | null | undefined) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Broad families for "closest match" when the cellar has nothing in the exact
// style suggested. Ordered checks: spirit / sweet / fortified / sparkling /
// rosé before the colour fallbacks, since those words are the most telling.
type Family = 'Sparkling' | 'Sweet' | 'DrySherry' | 'Fortified' | 'Spirit' | 'Rosé' | 'White' | 'Red';
const FAMILY_WORDS: [Family, string[]][] = [
  ['Spirit', ['cognac', 'armagnac', 'whisky', 'whiskey', 'brandy', 'grappa', 'calvados', 'gin', 'rum', 'eau de vie', 'marc']],
  ['Sweet', ['sauternes', 'barsac', 'tokaji', 'tokay', 'eiswein', 'ice wine', 'icewine', 'vin santo', 'moscato', 'muscat', 'beerenauslese', 'trockenbeerenauslese', 'late harvest', 'vendange tardive', 'selection de grains nobles', 'passito', 'recioto', 'dessert', 'sweet', 'pedro ximenez', 'coteaux du layon', 'quarts de chaume', 'bonnezeaux', 'jurancon', 'monbazillac', 'loupiac']],
  // Dry, light openers — a sweet Port is no stand-in for a Fino.
  ['DrySherry', ['fino', 'manzanilla', 'amontillado', 'palo cortado', 'dry sherry']],
  ['Fortified', ['port', 'tawny', 'lbv', 'sherry', 'oloroso', 'madeira', 'marsala', 'banyuls', 'maury', 'rutherglen', 'fortified', 'vermouth']],
  ['Sparkling', ['champagne', 'sparkling', 'cava', 'cremant', 'franciacorta', 'sekt', 'trento', 'traditional method', 'methode', 'blanc de blancs', 'blanc de noirs', 'pet nat', 'spumante']],
  ['Rosé', ['rose', 'rosato', 'rosado']],
  ['White', ['white', 'riesling', 'chablis', 'sancerre', 'sauvignon', 'chenin', 'vouvray', 'muscadet', 'albarino', 'gruner', 'chardonnay', 'aligote', 'gewurztraminer', 'pinot gris', 'pinot grigio', 'vermentino', 'assyrtiko', 'txakoli', 'soave', 'fiano', 'meursault', 'puligny', 'chassagne', 'savennieres', 'viognier', 'condrieu', 'semillon', 'marsanne', 'roussanne', 'verdicchio', 'godello']],
  ['Red', ['red', 'pinot noir', 'burgundy', 'bourgogne', 'beaujolais', 'gamay', 'barolo', 'nebbiolo', 'sangiovese', 'chianti', 'rioja', 'syrah', 'shiraz', 'grenache', 'cabernet', 'merlot', 'bordeaux', 'zinfandel', 'malbec', 'tempranillo', 'lambrusco']],
];
// If the exact family is missing, these are the acceptable stand-ins, best first.
const NEAR: Record<Family, Family[]> = {
  Sparkling: ['White', 'Rosé'],
  White: ['Sparkling', 'Rosé'],
  'Rosé': ['Sparkling', 'White'],
  Sweet: ['Fortified'],
  DrySherry: ['Sparkling', 'White'],
  Fortified: ['Sweet', 'Spirit'],
  Spirit: ['Fortified'],
  Red: [],
};
// Compiled once — these run per cellar wine on every render of the Serve tab.
const FAMILY_RES: [Family, RegExp][] = FAMILY_WORDS.map(([fam, words]) => [fam, new RegExp(`\\b(?:${words.join('|')})\\b`)]);
const STYLE_RES: [string, RegExp][] = STYLE_WORDS.map((w) => [w, new RegExp(`\\b${w}\\b`)]);
function familyOfText(text: string): Family | null {
  const t = fold(text);
  for (const [fam, re] of FAMILY_RES) if (re.test(t)) return fam;
  return null;
}
// A wine's family doesn't change between renders — remember it per row object.
const familyCache = new WeakMap<CellarWine, Family | null>();
function familyOfWine(w: CellarWine): Family | null {
  if (familyCache.has(w)) return familyCache.get(w) ?? null;
  const f = computeFamilyOfWine(w);
  familyCache.set(w, f);
  return f;
}
function computeFamilyOfWine(w: CellarWine): Family | null {
  if ((w as any).is_spirit) return 'Spirit';
  const named = familyOfText([w.wine_name, w.region, w.style].filter(Boolean).join(' '));
  if (named === 'Sweet' || named === 'DrySherry' || named === 'Fortified' || named === 'Spirit' || named === 'Sparkling') return named;
  const s = inferWineStyle({ style: w.style, region: w.region, grape_variety: w.grape_variety });
  if (s) return s as Family;
  return named ?? familyOfText(w.grape_variety ?? '');
}
const readiness = (w: CellarWine) => { const m = effectiveMaturity(w); return m === 'peak' ? 0.5 : m === 'approaching' ? 0.25 : m === 'declining' ? 0.1 : 0; };
const available = (w: CellarWine, excludeId?: string) => w.id !== excludeId && (w.quantity ?? 0) > 0 && !w.archived_at && !w.is_wishlist
  && !/\bprosecco\b/.test(fold([w.producer, w.wine_name, w.region].filter(Boolean).join(' '))); // house rule: never pick Prosecco

export type CellarPick = { wine: CellarWine; exact: boolean };

// The user's best bottle for a suggested style ("Vintage Champagne or a dry
// Riesling" → their Pol Roger). Exact first: the style's wine words matched
// against each cellar wine's name, region, grape and style. Failing that, the
// CLOSEST match — same family (sparkling, sweet, fortified…), then an
// acceptable neighbour (sparkling → crisp white; Sauternes → Port). Null only
// when nothing in the cellar is suitable. Prefers bottles ready to drink.
export function pickFromCellar(style: string | null | undefined, wines: CellarWine[], excludeId?: string): CellarPick | null {
  const s = fold(style);
  if (!s) return null;
  const pool = wines.filter((w) => available(w, excludeId));
  const words = STYLE_RES.filter(([, re]) => re.test(s));
  let best: { w: CellarWine; score: number } | null = null;
  for (const w of pool) {
    if (!words.length) break;
    const hay = fold([w.producer, w.wine_name, w.region, w.grape_variety, w.style].filter(Boolean).join(' '));
    let score = 0;
    words.forEach(([, re], i) => { if (re.test(hay)) score += words.length - i; });
    if (score === 0) continue;
    score += readiness(w);
    if (!best || score > best.score) best = { w, score };
  }
  if (best) return { wine: best.w, exact: true };
  const fam = familyOfText(s);
  if (!fam) return null;
  for (const f of [fam, ...NEAR[fam]]) {
    const cands = pool.filter((w) => familyOfWine(w) === f);
    if (cands.length) return { wine: cands.reduce((a, b) => (readiness(b) > readiness(a) ? b : a)), exact: false };
  }
  return null;
}

// 1 → "1st", 2 → "2nd", 11 → "11th", 22 → "22nd".
export function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'}`;
}
