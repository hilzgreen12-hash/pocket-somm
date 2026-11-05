import type { CellarWine } from '../types/wine';
import type { VintageComparisonRow } from '../services/pricing';
import { effectiveMaturity } from './maturity';

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

// The user's best bottle for a suggested style ("Vintage Champagne or a dry
// Riesling" → their Pol Roger). Matches the style's wine words against each
// cellar wine's name, region, grape and style; prefers bottles ready to drink.
export function pickFromCellar(style: string | null | undefined, wines: CellarWine[], excludeId?: string): CellarWine | null {
  const s = fold(style);
  if (!s) return null;
  const words = STYLE_WORDS.filter((w) => new RegExp(`\\b${w}\\b`).test(s));
  if (!words.length) return null;
  let best: { w: CellarWine; score: number } | null = null;
  for (const w of wines) {
    if (w.id === excludeId || (w.quantity ?? 0) <= 0 || w.archived_at || w.is_wishlist) continue;
    const hay = fold([w.producer, w.wine_name, w.region, w.grape_variety, w.style].filter(Boolean).join(' '));
    if (/\bprosecco\b/.test(hay)) continue; // house rule: never pick Prosecco
    let score = 0;
    words.forEach((k, i) => { if (new RegExp(`\\b${k}\\b`).test(hay)) score += words.length - i; });
    if (score === 0) continue;
    const m = effectiveMaturity(w);
    if (m === 'peak') score += 0.5; else if (m === 'approaching') score += 0.25; else if (m === 'declining') score += 0.1;
    if (!best || score > best.score) best = { w, score };
  }
  return best?.w ?? null;
}
